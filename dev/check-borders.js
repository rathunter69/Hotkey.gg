#!/usr/bin/env node
/* BORDER RENDER GUARD — r429, rewritten r442.
 *
 * Wolf reported "borders are not showing on the grid" in FOUR consecutive playtests. r426 fixed
 * a CSS-specificity colour fight, r429 gave every edge a rule and bumped applied borders to 2px
 * so "wider wins" would settle the border-collapse tie-break — and it STILL shipped broken.
 * Measured on the real grid at r441:
 *
 *     bt  2.00px OK     bl  0.00px BAD     ball        2.00px OK
 *     bb  2.00px OK     br  1.00px BAD     ball+thick  2.00px BAD (identical to plain ball)
 *
 * The cause was not a CSS subtlety. render() still carried r292's INLINE border emitter, which
 * wrote `border-*: 1px solid` (2px for thick) onto any cell with bl, br or thick — and inline
 * beats every stylesheet rule, so it overrode r429's 2px fix on precisely the edges r429 was
 * written to repair. Left at 1px, the exact width of the gridline, border-collapse fell through
 * to its positional tie-break: LEFT loses it (0px), RIGHT wins it as a hairline (1px), and
 * thick collapsed to ball's own 2px. bt/bb were untouched only because the emitter's condition
 * never fired for them. r442 deleted the emitter and moved applied borders onto an overlay
 * pseudo-element — one mechanism, composing per edge, never touching the collapse algorithm.
 *
 * WHY THE OLD GUARD PASSED ANYWAY — the part worth remembering. It screenshotted a band with
 * and without the border class and asserted the two buffers were NOT byte-identical. But `.bl`
 * changes the border COLOUR from the faint gridline to text colour even when its width
 * collapses away, so the buffers differed and it reported ok. It proved "something changed",
 * never "a thicker line is on screen". A guard that cannot fail is worse than no guard.
 *
 * So this version MEASURES. It screenshots a band straddling each edge in the REAL app,
 * decodes it through a canvas in the browser (no npm image dependency — CI installs only
 * playwright-core), and counts the longest run of dark pixels across the edge. Then it asserts
 * the painted width, not merely that it differs.
 *
 * It also drives the real render path for every case: flags go onto the cell model and through
 * render(), because the third layer of the original bug was render() never emitting bl/br/thick
 * at all — correct CSS that no element ever wore.
 *
 * Run: CHROME=<chromium> node dev/check-borders.js     (needs the dev server; BASE to override)
 */
'use strict';
const { chromium } = require('playwright-core');

const BASE = process.env.BASE || 'http://127.0.0.1:8791';
const DSF = 4;                 // device pixels per CSS px — sub-pixel rounding is the whole story here
const INK = 45;                // how far a pixel must sit from the cell's own background to count as
                               // ink. r443: this was an ABSOLUTE luminance threshold (<170), which
                               // silently assumed a light page — on CI the page renders dark, every
                               // pixel in the band scored as ink, and all 20 assertions reported the
                               // full 20px band width. Contrast against the local background is what
                               // "ink" actually means, and it holds in either theme.
const BAND = 10;               // CSS px each side of the edge

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME });
  /* r443: PIN the colour scheme. CI's Chromium resolved to dark where the dev box resolved to
     light, which is how an absolute luminance threshold passed here and failed there. The
     contrast measurement below no longer cares — but pinning makes the run deterministic, and
     SCHEME=dark exercises the other side on demand. Borders in dark are additionally covered by
     dev/e2e-depth-mechanics.js, which asserts both themes. */
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: DSF,
    colorScheme: process.env.SCHEME === 'dark' ? 'dark' : 'light' });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
  // a fresh profile walks the onboarding funnel and swallows every key
  await page.addInitScript(() => {
    try {
      localStorage.setItem('hotkey_onboarded', '1');
      localStorage.setItem('hk_tour_done', '1');
      localStorage.setItem('hk_learn_done', '1');
      localStorage.setItem('hk_handle_cache', '');
    } catch (e) {}
  });
  try {
    await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 20000 });
  } catch (e) {
    console.log(`BORDER RENDER: no dev server on ${BASE} — start one and re-run`);
    process.exit(1);
  }
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function',
    null, { timeout: 20000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* Build a bare sheet with ONE flagged cell, through the engine's own render path, and return
     the clip band for the edge under test. `navigation` is the host because its board is plain
     — no guided rail, no target outline, nothing else painting near a cell edge. */
  async function clipFor(flags, edge) {
    return page.evaluate(({ flags, edge, BAND }) => {
      loadChallenge('navigation');
      S.cells = {}; S.ROWS = 9;
      S.maze = null; S.touch = null; S.tiers = null; S._railZone = null;
      S.cells['C5'] = { ...blankCell(), value: 7777 };
      Object.assign(S.cells['C5'], flags);
      S.active = { r: 9, c: 9 }; S.sel = null;      // park the cursor far from the sample
      render();
      const td = [...document.querySelectorAll('#grid td')].find(t => (t.textContent || '').trim() === '7777');
      if (!td) return { err: 'sample cell never rendered' };
      const r = td.getBoundingClientRect();
      const clip = edge === 'top'    ? { x: r.x + r.width / 2 - 1, y: r.y - BAND,        width: 2, height: BAND * 2 }
                 : edge === 'bottom' ? { x: r.x + r.width / 2 - 1, y: r.bottom - BAND,   width: 2, height: BAND * 2 }
                 : edge === 'left'   ? { x: r.x - BAND,        y: r.y + r.height / 2 - 1, width: BAND * 2, height: 2 }
                 :                     { x: r.right - BAND,    y: r.y + r.height / 2 - 1, width: BAND * 2, height: 2 };
      return { clip, cls: td.className || '(none)' };
    }, { flags, edge, BAND });
  }

  /* Decode the shot in the browser (canvas getImageData) so this file needs no image library —
     CI installs playwright-core and nothing else. Returns the longest dark run in CSS px. */
  async function paintedPx(buf, edge) {
    const b64 = buf.toString('base64');
    return page.evaluate(async ({ b64, edge, DSF, INK }) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const cv = document.createElement('canvas');
      cv.width = img.width; cv.height = img.height;
      const ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, img.width, img.height).data;
      const horizontal = (edge === 'left' || edge === 'right');
      const n = horizontal ? img.width : img.height;
      const lums = [];
      for (let i = 0; i < n; i++) {
        const x = horizontal ? i : 0, y = horizontal ? 0 : i;
        const p = (img.width * y + x) << 2;
        lums.push(d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114);
      }
      // the band is mostly cell background with a rule crossing it, so the MEDIAN is the background
      const bg = [...lums].sort((a, b) => a - b)[lums.length >> 1];
      let best = 0, run = 0, total = 0;
      for (const lum of lums) {
        if (Math.abs(lum - bg) > INK) { run++; total++; if (run > best) best = run; } else run = 0;
      }
      return { run: best / DSF, ink: total / DSF };
    }, { b64, edge, DSF, INK });
  }

  async function measure(flags, edge) {
    const c = await clipFor(flags, edge);
    if (c.err) return { err: c.err, px: -1, cls: '' };
    const shot = await page.screenshot({ clip: c.clip });
    const m = await paintedPx(shot, edge);
    return { px: m.run, ink: m.ink, cls: c.cls };
  }

  let fail = 0;
  const check = (label, m, want) => {
    if (m.err) { fail++; console.log(`  FAIL ${label.padEnd(46)} ${m.err}`); return; }
    const ok = Math.abs(m.px - want) <= 0.5;
    if (!ok) fail++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label.padEnd(46)} painted ${m.px.toFixed(2)}px, want ~${want}px` +
                (ok ? '' : `   [cls="${m.cls}"]`));
  };

  /* BASELINE — an unformatted cell. The gridline is deliberately faint (r405), so it must NOT
     register as ink; if it ever does, every threshold below is meaningless. */
  check('unformatted cell paints no rule', await measure({}, 'top'), 0);

  /* THE FOUR EDGES, each alone — the case that shipped broken twice. */
  const EDGES = [
    [{ bt: 1 }, 'top',    'Alt H B P — top border'],
    [{ bb: 1 }, 'bottom', 'Alt H B O — bottom border'],
    [{ bl: 1 }, 'left',   'Alt H B L — left border'],
    [{ br: 1 }, 'right',  'Alt H B R — right border'],
  ];
  for (const [flags, edge, label] of EDGES) check(label, await measure(flags, edge), 2);

  /* THE OUTSIDE BOX — the most common real border op. Both the per-edge form and the .ball
     form must paint all four sides: render() emits .ball, older boards set the four edges. */
  for (const edge of ['top', 'bottom', 'left', 'right']) {
    check(`Alt H B S — outside box (per-edge), ${edge}`, await measure({ bt: 1, bb: 1, bl: 1, br: 1 }, edge), 2);
  }
  for (const edge of ['top', 'bottom', 'left', 'right']) {
    check(`Alt H B A — all borders (.ball), ${edge}`, await measure({ ball: 1 }, edge), 2);
  }

  /* THICK — must be HEAVIER than thin, on every edge. r429 shipped it identical; so did r441.
     Asserting the number, not "differs from thin", is the whole point of this rewrite. */
  for (const edge of ['top', 'bottom', 'left', 'right']) {
    check(`Alt H B T — thick box (.ball.thick), ${edge}`, await measure({ ball: 1, thick: 1 }, edge), 3);
  }
  for (const edge of ['top', 'left']) {
    check(`Alt H B T — thick box (per-edge), ${edge}`, await measure({ bt: 1, bb: 1, bl: 1, br: 1, thick: 1 }, edge), 3);
  }

  /* THE DOUBLE RULE under a grand total (Alt H B B) — two strokes with a gap, so assert real
     ink rather than an exact run. */
  {
    /* A 3px double border is stroke/gap/stroke, so the longest RUN is only 1px by design —
       measure TOTAL ink across the band instead, and require two strokes' worth. */
    const m = await measure({ bdbl: 1 }, 'bottom');
    const ok = !m.err && m.ink >= 1.5 && m.px <= 1.5;
    if (!ok) fail++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${'Alt H B B — double rule under a total'.padEnd(46)} ink ${(m.ink||0).toFixed(2)}px in strokes of ${(m.px||0).toFixed(2)}px, want two strokes`);
  }

  /* THE THIRD LAYER of the original bug: correct CSS that no element ever wears. render() once
     emitted bt/bb/ball/bdbl but never bl/br/thick, so those flags could not paint at any width. */
  const seen = await page.evaluate(() => {
    loadChallenge('navigation'); S.cells = {}; S.ROWS = 9;
    S.maze = null; S.touch = null; S.tiers = null; S._railZone = null;
    S.cells['C5'] = { ...blankCell(), value: 7777, bt: true, bb: true, bl: true, br: true, thick: true, ball: true, bdbl: true };
    S.active = { r: 9, c: 9 }; S.sel = null; render();
    const td = [...document.querySelectorAll('#grid td')].find(t => (t.textContent || '').trim() === '7777');
    return td ? td.className : null;
  });
  if (seen === null) { fail++; console.log('  FAIL render() — could not reach the sample cell'); }
  else for (const cls of ['bt', 'bb', 'bl', 'br', 'thick', 'ball', 'bdbl']) {
    const has = new RegExp(`\\b${cls}\\b`).test(seen);
    if (!has) fail++;
    console.log(`  ${has ? 'ok  ' : 'FAIL'} render() emits .${cls} onto the cell`);
  }

  if (errs.length) { fail++; console.log('  FAIL page errors: ' + errs.slice(0, 3).join(' | ')); }
  await browser.close();
  console.log(fail ? `BORDER RENDER: ${fail} FAILURE(S)` : 'BORDER RENDER: clean');
  process.exit(fail ? 1 : 0);
})();
