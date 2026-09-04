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
 * playwright-core), and asserts the painted width, not merely that it differs.
 *
 * r457 changed HOW it reads that band, after `Alt H B A — all borders (.ball), right` failed on
 * the gate about one run in three. The old reader thresholded ONE scanline against its own median
 * and called the rest ink; r457 shoots the same clip twice — border classes on, then off — and
 * the rule is the pixels that MOVED, measured on every scanline in the band with the longest run
 * winning. Nothing is inferred about the background any more, so the sample cell's right-aligned
 * `7777`, the faint gridline and the theme all subtract themselves out. See bandDiff() for the
 * full argument, and installOverlayGuards() for what was actually covering the sheet.
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
const DSF = Number(process.env.DSF) || 4;   // device pixels per CSS px — sub-pixel rounding is the
                               // whole story here. Overridable so a run can be repeated at a
                               // fractional scale: DSF=1.25 reads every edge correctly (2px -> 2.40,
                               // 3px -> 3.20, both inside the +/-0.5 tolerance), but the Alt H B B
                               // double rule cannot pass there — its 1px gap is finer than a device
                               // pixel at that scale, so stroke/gap/stroke reads as one 3.20px run.
                               // That is a sampling floor, not a border bug; leave the default at 4.
const INK = 45;                // how far a pixel must sit from the cell's own background to count as
                               // ink. r443: this was an ABSOLUTE luminance threshold (<170), which
                               // silently assumed a light page — on CI the page renders dark, every
                               // pixel in the band scored as ink, and all 20 assertions reported the
                               // full 20px band width. Contrast against the local background is what
                               // "ink" actually means, and it holds in either theme. r457: only the
                               // unformatted-cell baseline and the alignment block still use it; the
                               // per-edge widths are measured by difference (DELTA) instead.
const DELTA = 20;              // r457: luminance a pixel must MOVE between the baseline shot (border
                               // classes off) and the real one to count as rule. Small on purpose —
                               // a rule Chrome snapped onto a partly-covered device pixel still
                               // moves ~90, and two identical renders move 0, so noise has no room.
const VW = Number(process.env.VW) || 1440;  // viewport width. Overridable so a run can be
                               // repeated at a width that lands the sheet's column edges on
                               // fractional CSS px (1237 does) — the case the r457 clip snapping
                               // and the baseline diff are there to survive.
const BAND = 10;               // CSS px each side of the edge
const LINES = 8;               // r457: device scanlines in the band. Every one of them is measured
                               // and the longest run across them wins, so one unlucky scanline can
                               // no longer decide the answer on its own.

/* r455: CI-ONLY FLAKE, root-caused. CI failed 10 per-edge measurements ("all borders (.ball)",
   every ".thick" edge, the double rule) while `top` and the whole alignment section stayed
   green — because the #wbDlg "welcome back" card (index.html ~32198, position:fixed inset:0
   z-index:130) is appended and faded in by a timer AFTER load, and the per-edge screenshot path
   never hid it (only the alignment section's overlay sweep did). Two-part fix, both installed
   as an addInitScript so they run before any page script: suppress the card outright via its
   own r324 once-per-session guard (sessionStorage.hk_wb), and install the SAME fixed-overlay
   sweep the alignment section uses as a shared window function, so both call sites share one
   implementation and either can catch a large fixed overlay this guard doesn't name. */
function installOverlayGuards() {
  try {
    localStorage.setItem('hotkey_onboarded', '1');
    localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_gate_off', '1');
    localStorage.setItem('hk_handle_cache', '');
  } catch (e) {}
  try { sessionStorage.setItem('hk_wb', '1'); } catch (e) {}   // r324 guard: suppress #wbDlg outright
  /* r457, THE CI FLAKE ROOT-CAUSED. `Alt H B A — all borders (.ball), right` failed about one CI
     run in three, always alone, always with the r456 retry reading 0.00px on all three attempts —
     so not a paint race. Dumping the failing clip shows the sheet replaced by flat card cream at
     lum 234.7, no glyph, no gridline: #dcModal, the DAILY CHALLENGE hero card. index.html ~31655
     opens it from `setTimeout(..., 1400)` on window load, and `_pro = true` (set at the top of
     this file so the guard can drive pro-only ops) is exactly what makes challengeEligible() true.
     It is .onboard-modal — position:fixed, inset:0 — so r455's sweep WOULD hide it; the sweep just
     runs before the render, and the card lands between the render and the screenshot. It opens
     once, so precisely ONE measurement is covered and every later one passes after the next
     sweep — which is why one edge failed while `.ball.thick right` and `Alt H B R right` were
     green. Which edge it lands on is a stopwatch race: measurement ~13 on the gate runner,
     measurement ~16 locally. Suppress it the r324 way, through the engine's OWN once-per-day
     guard, rather than racing it. */
  try {
    const dcKey = 'challenge-' + new Date().toISOString().slice(0, 10);   // index.html challengeKey()
    localStorage.setItem('hk_dc_seen', dcKey);
    localStorage.setItem('hk_dc_done', dcKey);
    /* Same class of hazard, same treatment: r365's #startCoach ("how a drill works") is appended
       to .gridwrap on a zero-solve profile — absolute, not fixed, so the sweep above cannot see
       it. It lands bottom-left, clear of row 5 today, but nothing keeps it there. Its own
       once-ever guard turns it off. */
    localStorage.setItem('hk_start_coach', '1');
  } catch (e) {}
  window.__hkHideFixedOverlays = function () {
    const cleared = [];
    try {
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed' && cs.display !== 'none') {
          const rr = el.getBoundingClientRect();
          if (rr.width > 600 && rr.height > 300) {
            cleared.push((el.id || '') + '.' + String(el.className).slice(0, 30));
            el.style.display = 'none';
          }
        }
      }
    } catch (e) {}
    return cleared;
  };
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME });
  /* r443: PIN the colour scheme. CI's Chromium resolved to dark where the dev box resolved to
     light, which is how an absolute luminance threshold passed here and failed there. The
     contrast measurement below no longer cares — but pinning makes the run deterministic, and
     SCHEME=dark exercises the other side on demand. Borders in dark are additionally covered by
     dev/e2e-depth-mechanics.js, which asserts both themes. */
  const page = await browser.newPage({ viewport: { width: VW, height: 900 }, deviceScaleFactor: DSF,
    colorScheme: process.env.SCHEME === 'dark' ? 'dark' : 'light' });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
  // a fresh profile walks the onboarding funnel and swallows every key; installOverlayGuards
  // (r455) additionally suppresses the welcome-back card and installs the fixed-overlay sweep
  await page.addInitScript(installOverlayGuards);
  try {
    await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 20000 });
  } catch (e) {
    console.log(`BORDER RENDER: no dev server on ${BASE} — start one and re-run`);
    process.exit(1);
  }
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function',
    null, { timeout: 20000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* r455: sweep once right after load (in case anything fixed is already up), then again before
     every single measurement below — the welcome-back card is appended by a post-load timer, so
     "once at the top" is not enough on a slower CI runner. */
  async function hideFixedOverlays(pg) {
    return pg.evaluate(() => (window.__hkHideFixedOverlays ? window.__hkHideFixedOverlays() : []));
  }
  await hideFixedOverlays(page);

  /* Build a bare sheet with ONE flagged cell, through the engine's own render path, and return
     the clip band for the edge under test. `navigation` is the host because its board is plain
     — no guided rail, no target outline, nothing else painting near a cell edge. */
  async function clipFor(flags, edge) {
    return page.evaluate(({ flags, edge, BAND, DSF, LINES }) => {
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
      /* r457: the band is LINES device scanlines across its short axis, and the clip is snapped
         onto whole device pixels — a fractional clip is rounded by the screenshot anyway, and a
         rounding this file cannot see is a rounding it cannot reason about. Cell edges sit at
         fractional x (r.right measured 432.641 on a 1440-wide viewport), so this matters. */
      const thin = LINES / DSF;
      const snap = v => Math.round(v * DSF) / DSF;
      const raw = edge === 'top'    ? { x: r.x + r.width / 2 - thin / 2, y: r.y - BAND,      width: thin, height: BAND * 2 }
                : edge === 'bottom' ? { x: r.x + r.width / 2 - thin / 2, y: r.bottom - BAND, width: thin, height: BAND * 2 }
                : edge === 'left'   ? { x: r.x - BAND,     y: r.y + r.height / 2 - thin / 2, width: BAND * 2, height: thin }
                :                     { x: r.right - BAND, y: r.y + r.height / 2 - thin / 2, width: BAND * 2, height: thin };
      const clip = { x: snap(raw.x), y: snap(raw.y), width: snap(raw.width), height: snap(raw.height) };
      return { clip, cls: td.className || '(none)',
               rect: { x: +r.x.toFixed(3), y: +r.y.toFixed(3), right: +r.right.toFixed(3), bottom: +r.bottom.toFixed(3) } };
    }, { flags, edge, BAND, DSF, LINES });
  }

  /* r457: THE BASELINE IS THE SAME ELEMENT with its rule classes stripped in place — not a second
     loadChallenge() + render(). Re-rendering re-lays the table out, and the sample cell's centre
     landed on either side of a device-pixel boundary between two otherwise identical renders
     (clip x 389.5 on one, 389.75 on the next), which would misregister the two shots by a whole
     device pixel and drag the cell's own glyph edges into the difference. Removing the classes
     touches only the ::after overlay and the overflow mode, so the geometry cannot move — and
     render() is still what PUT those classes on the cell, which is the claim under test. */
  async function stripRules(off) {
    return page.evaluate(({ off }) => {
      const td = [...document.querySelectorAll('#grid td')].find(t => (t.textContent || '').trim() === '7777');
      if (!td) return null;
      if (off) {
        td.dataset.hkSaved = td.className;
        td.className = td.className.replace(/\b(?:bt|bb|bl|br|ball|bdbl|thick)\b/g, '').replace(/\s+/g, ' ').trim();
      } else if (td.dataset.hkSaved !== undefined) {
        td.className = td.dataset.hkSaved; delete td.dataset.hkSaved;
      }
      const r = td.getBoundingClientRect();
      return { cls: td.className || '(none)',
               rect: { x: +r.x.toFixed(3), y: +r.y.toFixed(3), right: +r.right.toFixed(3), bottom: +r.bottom.toFixed(3) } };
    }, { off });
  }

  /* r457: MEASURE THE EDGE BY DIFFERENCE, over the whole band.
     ------------------------------------------------------------------------------------------
     What this replaced, and why. The old reader took ONE scanline of a two-scanline band (it
     literally only ever sampled index 0 of the short axis), called the median of that line the
     background, and counted pixels more than INK away from it. Two things ride on that:
       * one scanline decides everything, so any single-line accident — a snapped rule whose only
         sampled row is the antialiased one, a glyph, a scrim — IS the answer, and re-shooting the
         same line (r456) reproduces it rather than curing it;
       * "background = the median of this line" is a guess. The right edge of the sample cell is
         the worst case for it: the cell is number-formatted, so `7777` is right-aligned INTO the
         band, and a band that is half glyph has a glyph-coloured median.
     The fix needs no guess. Shoot the SAME clip twice — once with the border classes on, once
     with them off — and the rule is exactly the pixels that MOVED. Everything shared by the two
     shots (gridline, glyph, selection tint, sheet texture, the theme) subtracts itself out, and
     DELTA can therefore be small enough that a rule snapped onto a partly-covered device pixel
     still registers instead of falling under an ink threshold.
     Scans every scanline in the band and returns the LONGEST run across all of them, so the
     answer is the widest place the rule paints, not wherever scanline 0 happened to land.
     `raw` keeps the old median-vs-INK reading for the one assertion that still wants it: an
     unformatted cell must paint nothing, and there the gridline being faint IS the claim. */
  async function bandDiff(shotB64, baseB64, edge) {
    return page.evaluate(async ({ a, b, edge, DSF, INK, DELTA }) => {
      const load = async (src) => {
        const img = new Image();
        img.src = 'data:image/png;base64,' + src;
        await img.decode();
        const cv = document.createElement('canvas');
        cv.width = img.width; cv.height = img.height;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return { d: ctx.getImageData(0, 0, img.width, img.height).data, w: img.width, h: img.height };
      };
      const A = await load(a), B = await load(b);
      if (!A.w || !A.h) return { err: 'empty shot' };
      if (A.w !== B.w || A.h !== B.h) return { err: `shot ${A.w}x${A.h} vs baseline ${B.w}x${B.h}` };
      const lum = (I, x, y) => { const p = (I.w * y + x) << 2; return I.d[p] * 0.299 + I.d[p + 1] * 0.587 + I.d[p + 2] * 0.114; };
      const horizontal = (edge === 'left' || edge === 'right');
      const nScan = horizontal ? A.w : A.h;    // along the axis that crosses the edge
      const nLine = horizontal ? A.h : A.w;    // the band's scanlines
      let best = 0, bestInk = 0, bestRaw = 0, mn = 255, mx = 0;
      for (let L = 0; L < nLine; L++) {
        const va = [], vb = [];
        for (let i = 0; i < nScan; i++) {
          const x = horizontal ? i : L, y = horizontal ? L : i;
          const v = lum(A, x, y);
          if (v < mn) mn = v; if (v > mx) mx = v;
          va.push(v); vb.push(lum(B, x, y));
        }
        // DIFF — the rule is what moved between the two shots
        let run = 0, top = 0, tot = 0;
        for (let i = 0; i < nScan; i++) {
          if (Math.abs(va[i] - vb[i]) > DELTA) { run++; tot++; if (run > top) top = run; } else run = 0;
        }
        if (top > best) best = top;
        if (tot > bestInk) bestInk = tot;
        // RAW — the pre-r457 reading, kept for the unformatted-cell assertion
        const bg = [...va].sort((p, q) => p - q)[va.length >> 1];
        let rr = 0, rtop = 0;
        for (const v of va) { if (Math.abs(v - bg) > INK) { rr++; if (rr > rtop) rtop = rr; } else rr = 0; }
        if (rtop > bestRaw) bestRaw = rtop;
      }
      return { run: best / DSF, ink: bestInk / DSF, raw: bestRaw / DSF, spread: +(mx - mn).toFixed(1) };
    }, { a: shotB64, b: baseB64, edge, DSF, INK, DELTA });
  }

  const moved = (a, b) => Math.max(...['x', 'y', 'right', 'bottom'].map(k => Math.abs(a[k] - b[k])));

  /* r455/r457: sweep large fixed overlays immediately before EVERY shot, not once per
     measurement. The r455 sweep ran before the render; #dcModal arrives on its own timer and
     landed between the render and the screenshot, which no amount of re-shooting could clear. */
  async function shootClip(clip) {
    await hideFixedOverlays(page);
    return (await page.screenshot({ clip })).toString('base64');
  }

  async function measure(flags, edge) {
    try {
      await page.waitForFunction(() => document.querySelectorAll('.wb-dlg.show').length === 0,
        null, { timeout: 2000 });
    } catch (e) {}   // robust to a fade in progress; never fail the measurement over this alone
    const wantInk = Object.keys(flags || {}).length > 0;
    /* r456, kept: a border edge is painted by render()'s ::after overlay a frame or two after the
       class lands, so a flagged band that reads empty is re-shot up to three times. r457 rebuilds
       BOTH shots on each attempt (rule and baseline), because a bad take is just as likely to
       have spoiled the baseline, and widens the retry condition past "empty": a flat clip means
       something is covering the sheet, and a diff wider than any rule means the two shots are not
       the same view. An unformatted cell (no flags) is still never retried, so a genuinely
       missing rule fails on the first take. */
    let m = null, why = '', cls = '', geo = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      const c = await clipFor(flags, edge);              // the cell with its borders on
      if (c.err) return { err: c.err, px: -1, cls: '' };
      cls = c.cls; geo = `clip ${JSON.stringify(c.clip)} right ${c.rect.right}`;
      const shot = await shootClip(c.clip);
      const b = await stripRules(true);                  // the same element, rule classes off
      const base = b ? await shootClip(c.clip) : null;   // ... and THE SAME CLIP
      await stripRules(false);
      if (!b) {
        why = 'sample cell vanished before the baseline shot';
      } else if (moved(b.rect, c.rect) > 0.001) {
        why = `stripping the rule classes moved the cell ${moved(b.rect, c.rect)}px — the two shots do not register`;
      } else {
        m = await bandDiff(shot, base, edge);
        why = m.err ? m.err
            /* A covered clip and a missing rule both read 0, and they are different bugs. When
               #dcModal was over the sheet the band was UNIFORM card cream (spread 0.0); a band
               that is simply missing its rule still shows the faint gridline (spread 21.6
               measured with td.ball::after zeroed). So only near-zero spread means covered — and
               only that is worth re-shooting. */
            : (wantInk && m.spread < 4) ? `the band is uniform (spread ${m.spread}) — something is covering the sheet`
            : (wantInk && m.run <= 0) ? 'no rule anywhere in the band'
            : (m.run > 6) ? `the whole band moved (${m.run.toFixed(2)}px) — the two shots are not the same view`
            : '';
      }
      if (!why || attempt === 2) break;
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      await page.waitForTimeout(120);
    }
    if (!m) return { err: why || 'no measurement', px: -1, cls };
    return { px: m.run, ink: m.ink, raw: m.raw, spread: m.spread, cls, why, geo };
  }

  let fail = 0;
  const check = (label, m, want) => {
    if (m.err) { fail++; console.log(`  FAIL ${label.padEnd(46)} ${m.err}`); return; }
    const ok = Math.abs(m.px - want) <= 0.5;
    if (!ok) fail++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label.padEnd(46)} painted ${m.px.toFixed(2)}px, want ~${want}px` +
                (ok ? '' : `   [cls="${m.cls}" ${m.geo || ''}${m.why ? ' — ' + m.why : ''}]`));
  };

  /* BASELINE — an unformatted cell. Two claims, and r457 keeps both: no border classes means no
     DIFFERENCE against a second shot of the same cell (px), and the gridline is deliberately
     faint (r405) so it must not register as ink on its own (raw). The second half is what keeps
     INK — still used by the alignment block below — honest. */
  {
    const m = await measure({}, 'top');
    const ok = !m.err && m.px === 0 && m.raw < 0.5;
    if (!ok) fail++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${'unformatted cell paints no rule'.padEnd(46)} ` +
                (m.err ? m.err : `diff ${m.px.toFixed(2)}px, raw ink ${m.raw.toFixed(2)}px, want 0`));
  }

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

  /* ================================ ALIGNMENT ================================
     r450 (Wolf: "misalignment for top borders in one of the first few foundation drills").
     Everything above measures a border in ISOLATION — one flagged cell, one edge, is the
     painted line thick enough. Every one of those assertions was green while the shipped grid
     looked wrong, because a border can be exactly 2px and still be in the wrong PLACE: r442's
     overlay hung off the cell's padding box, which under border-collapse is inset by that
     cell's half of the shared gridline, so the rule painted a pixel below the row's own line
     and stopped half a pixel short of each vertical gridline. A four-cell total rule came out
     as four dashes sitting under the gridline instead of one rule on it. Presence-and-width
     cannot see that. Geometry can, so this block asserts geometry:

       1. NO STEP        — every cell in a run of adjacent bt cells paints its rule at the same
                           y, top and bottom, within a device pixel.
       2. ON THE LINE    — that y is the y where the row's UNBORDERED neighbours paint their
                           plain gridline. This is the assertion that fires on r442: the rule
                           sat a full CSS px lower than the gridline it was supposed to replace.
       3. CONTINUOUS     — scanning along the rule itself from the first cell's centre to the
                           last's, every pixel is ink. No holes at the column boundaries.

     At DPR 1 and 2 (sub-pixel rounding is half this bug's story) and in both themes. */
  const FAINT = 8;   // the plain gridline is deliberately low-contrast (r405) — it must register
  const TOL   = 1;   // device px, EXCLUSIVE. Every comparison below is differential — rule against
                     // the plain gridline in the same screenshot, or one neighbour against another
                     // — so a global snap moves both sides together and cancels. What is left is
                     // the real offset, which is 0.00 when the geometry is right. Strict `< 1`
                     // keeps r442's one-CSS-px drop failing at DPR 1, where it is exactly 1.

  async function alignScan(pg, dpr, dark) {
    /* r450 CI fix, round two. The first gate run of this block returned an ENTIRELY blank clip —
       every cell null at both thresholds, plain gridline included — and a double-rAF settle plus
       blind retakes of the SAME clip did not cure it, while an exact local replica (driver
       1.49.1 + chromium-1148 + same server and flags) is clean. A stale-clip race fits that
       evidence: parking the cursor on r9c9 can scroll the sheet frame on a runner whose fonts
       overflow the grid differently, and a clip computed from pre-scroll rects then samples
       featureless cell interior forever — retaking the same wrong rectangle can never help. So
       each attempt now recomputes EVERYTHING: scrolls pinned to zero (window and .gridwrap),
       layout settled on a double-rAF, rects measured fresh, clip rebuilt, THEN screenshot. The
       retry condition stays "even the plain gridline is invisible", a state no border bug can
       cause — a genuinely misaligned rule paints something and still fails on take one. If all
       four takes stay blank, the failure line carries diagnostics instead of another guess. */
    let scan = null, geo = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      if (attempt) await pg.waitForTimeout(400);
      geo = await pg.evaluate((dark) => {
        /* Drive a REAL theme, not just the data-dark attribute, so the run goes through the same
           path a player does. r212 is deliberate: dark themes keep a LIGHT sheet (dark chrome,
           light sheet, like Excel), so the dark leg is not a dark grid — it is the sheet's OTHER
           palette, surface #f0efe8 on gridline #c9c7bf against Daylight's own pair. Different
           contrast, same geometry, which is exactly the claim under test. */
        try { applyTheme(dark ? 'default' : 'daylight'); } catch (e) {
          if (dark) document.documentElement.setAttribute('data-dark', '1');
          else document.documentElement.removeAttribute('data-dark');
        }
        loadChallenge('navigation');
        /* THE ACTUAL CI CULPRIT, found by dumping the failing clip PNG from the runner: the
           r429 alt-tab pause. On the gate runner a freshly created page reports document.hidden,
           visibilitychange fires, and hkPause() drops the scrim + "Paused" card over the grid —
           the shot showed the sheet dimmed to lum ~137 (gridline delta crushed under FAINT) with
           the card as a ~104 band across the middle cells. Locally pages report visible, which
           is why three exact replicas (driver 1.49.1 + chromium-1148 + same server) never
           reproduced it. Clearing here is race-free: the only visibility change this page ever
           sees happens at creation, so the pause cannot re-arm before the screenshot. */
        try { hkClearPause(); } catch (e) {}
        try { const p = document.getElementById('hkPause'); if (p) p.remove(); } catch (e) {}
        /* THE REAL CI CULPRIT — round three, and the lineup caught the shape of it. The failing
           shot is the sheet at ~137 with the rule smeared to a ~104 halo: exactly a fixed-
           position modal backer (rgba black + backdrop blur) over the whole app. Those backers
           hang off <body>, not .gridwrap, so the gridwrap-scoped overlay lineup listed nothing
           while the pixels showed everything. Something async pops one on the runner mid-probe
           (offline profile flows are the suspects); whichever it is, no modal belongs in a
           border measurement. Hide every large fixed overlay and RECORD what was hidden — if
           this recurs the failure line will name the element instead of a silhouette.
           r455: this sweep is now `window.__hkHideFixedOverlays`, installed by
           installOverlayGuards (addInitScript, top of file) — the per-edge path below shares
           this exact function rather than carrying its own copy. */
        const cleared = window.__hkHideFixedOverlays ? window.__hkHideFixedOverlays() : [];
        S.cells = {}; S.ROWS = 9;
        S.maze = null; S.touch = null; S.tiers = null; S._railZone = null;
        for (const ref of ['C5', 'D5', 'E5']) S.cells[ref] = { ...blankCell(), bt: true };
        S.active = { r: 9, c: 9 }; S.sel = null;      // park the cursor far from the sample
        render();
        /* Rects are viewport-relative and the screenshot clip is page-relative — any scroll
           between the two lies. Pin every scroller to zero BEFORE measuring. */
        window.scrollTo(0, 0);
        const gw = document.querySelector('.gridwrap');
        if (gw) { gw.scrollTop = 0; gw.scrollLeft = 0; }
        const cells = [];
        for (const c of [2, 3, 4, 5, 6]) {            // B5 . C5 D5 E5 . F5 — plain, run, plain
          const td = document.querySelector(`#grid td[data-r="5"][data-c="${c}"]`);
          if (!td) return { err: `row 5 col ${c} never rendered` };
          const r = td.getBoundingClientRect();
          cells.push({ c, cls: td.className, bt: /\bbt\b/.test(td.className), x: r.x, y: r.y, w: r.width });
        }
        return { cells, cleared };
      }, dark);
      if (geo.err) return { err: geo.err };
      if (geo.cleared && geo.cleared.length && !attempt)
        console.log(`       note DPR${dpr} ${dark ? 'dark' : 'light'}: hid fixed overlay(s) ${geo.cleared.join(' ')}`);

      /* Clip on exact device-pixel boundaries — a fractional clip would round, and this whole
         block is measuring fractions of a pixel. */
      const first = geo.cells[0], last = geo.cells[geo.cells.length - 1];
      const x0 = Math.floor(first.x * dpr) / dpr;
      const clip = { x: x0, y: (Math.round(first.y * dpr) - 5 * dpr) / dpr,
                     width: Math.ceil((last.x + last.w) * dpr) / dpr - x0, height: 10 };
      await pg.evaluate(() => new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res))));
      const b64 = (await pg.screenshot({ clip })).toString('base64');
      scan = await measureClip(pg, { b64, geo, clip, dpr, FAINT, INK });
      scan.b64 = b64; scan.clip = clip;
      if (scan.cells && scan.cells.some(c => !c.bt && c.lineStart !== null)) return scan;
    }
    /* Four fresh takes, all blank — report what the page actually looks like. */
    try {
      scan.diag = await pg.evaluate(() => {
        const gw = document.querySelector('.gridwrap');
        const gate = document.querySelector('.hk-gate');
        const grid = document.querySelector('#grid');
        const gr = grid ? grid.getBoundingClientRect() : null;
        return {
          fonts: document.fonts ? document.fonts.status : 'n/a',
          scrollY: window.scrollY,
          gwScroll: gw ? [gw.scrollTop, gw.scrollLeft] : null,
          gateShown: gate ? getComputedStyle(gate).display !== 'none' : false,
          gridRect: gr ? [Math.round(gr.x), Math.round(gr.y), Math.round(gr.width), Math.round(gr.height)] : null,
          rows: typeof S !== 'undefined' ? S.ROWS : null,
          paused: typeof paused !== 'undefined' ? paused : 'n/a',
          hidden: document.hidden,
          running: typeof running !== 'undefined' ? running : 'n/a',
          gateFlag: typeof hkGate !== 'undefined' ? hkGate : 'n/a',
          demo: typeof demoPlaying !== 'undefined' ? demoPlaying : 'n/a',
          /* the lineup: every absolutely-positioned thing sitting on the gridwrap, because the
             failing shot is unmistakably the sheet seen THROUGH a dimming scrim with backdrop
             blur — gridline delta crushed under FAINT, the rule smeared into a halo. */
          overlays: (() => {
            const out = [];
            const gw2 = document.querySelector('.gridwrap');
            if (!gw2) return out;
            for (const el of gw2.querySelectorAll('*')) {
              const cs = getComputedStyle(el);
              if (cs.position === 'absolute' && cs.display !== 'none') {
                const r2 = el.getBoundingClientRect();
                if (r2.width > 200 && r2.height > 100)
                  out.push({ id: el.id || null, cls: String(el.className).slice(0, 40),
                             z: cs.zIndex, bg: cs.backgroundColor.slice(0, 30),
                             bf: (cs.backdropFilter || 'none').slice(0, 20),
                             rect: [Math.round(r2.x), Math.round(r2.y), Math.round(r2.width), Math.round(r2.height)] });
              }
            }
            return out;
          })(),
        };
      });
    } catch (e) { scan.diag = { err: String(e).slice(0, 120) }; }
    return scan;
  }

  function measureClip(pg, args) {
    return pg.evaluate(async ({ b64, geo, clip, dpr, FAINT, INK }) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
      const ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, img.width, img.height).data;
      const lum = (x, y) => { const p = (img.width * y + x) << 2; return d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114; };
      const ox = Math.round(clip.x * dpr), oy = Math.round(clip.y * dpr);
      const out = [];
      /* Two passes over the same column of pixels, and the difference between them is the bug.
         FAINT catches every painted line including the deliberately low-contrast gridline — that
         is the LINE THE ROW SHOWS. INK catches only the applied rule. r442 painted the rule
         BELOW the gridline rather than over it, so the two merged into one 3px band whose faint
         start still matched the neighbours': measuring the visible band alone cannot tell a
         replaced gridline from a stacked one. Locating the ink separately can. */
      const seg = (col, bg, thr) => {
        let best = null, cur = null;
        for (let i = 0; i < col.length; i++) {
          if (Math.abs(col[i] - bg) > thr) { if (!cur) cur = { s: i, e: i }; else cur.e = i; }
          else { if (cur && (!best || (cur.e - cur.s) > (best.e - best.s))) best = cur; cur = null; }
        }
        if (cur && (!best || (cur.e - cur.s) > (best.e - best.s))) best = cur;
        return best;
      };
      for (const g of geo.cells) {
        const x = Math.round((g.x + g.w / 2) * dpr) - ox;
        const col = []; for (let y = 0; y < img.height; y++) col.push(lum(x, y));
        const bg = [...col].sort((a, b) => a - b)[col.length >> 1];    // the cell's own background
        const line = seg(col, bg, FAINT);      // the whole visible band, gridline included
        const rule = seg(col, bg, INK);        // the applied rule alone
        const rel = s => s ? { start: +(oy + s.s - g.y * dpr).toFixed(2), end: +(oy + s.e + 1 - g.y * dpr).toFixed(2) } : { start: null, end: null };
        const L = rel(line), R = rel(rule);
        out.push({ c: g.c, bt: g.bt, bg,
          lineStart: L.start, lineEnd: L.end,
          start: R.start, end: R.end,
          scanY: g.bt && rule ? Math.round((rule.s + rule.e) / 2) : null });
      }
      /* CONTINUITY — walk the rule's own scanline across the whole run. */
      const run = geo.cells.filter(g => g.bt);
      const runOut = out.filter(o => o.bt);
      let holes = null;
      if (run.length > 1 && runOut[0].scanY != null) {
        const y = runOut[0].scanY;
        const xA = Math.round((run[0].x + run[0].w / 2) * dpr) - ox;
        const xB = Math.round((run[run.length - 1].x + run[run.length - 1].w / 2) * dpr) - ox;
        /* Reference background: inside the first cell of the run, clear of the rule. */
        const bgRef = out.find(o => o.bt).bg;
        holes = 0;
        for (let x = xA; x <= xB; x++) if (Math.abs(lum(x, y) - bgRef) <= INK) holes++;
      }
      /* Image ground truth, carried on every result: if the clip is ever blank on a runner,
         these numbers say whether the SCREENSHOT was blank (real page pixels, uniform), the
         DECODE broke (alpha 0 / dims wrong), or the SAMPLER looked in the wrong place. */
      let mn = 255, mx = 0;
      for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
        const v = lum(x, y); if (v < mn) mn = v; if (v > mx) mx = v;
      }
      const px = [];
      for (let i = 0; i < 6; i++) {
        const x = Math.floor(img.width * (i + 0.5) / 6), y = img.height >> 1;
        const p = (img.width * y + x) << 2;
        px.push([d[p], d[p + 1], d[p + 2], d[p + 3]]);
      }
      return { cells: out, holes, span: run.length > 1 ? 1 : 0,
               img: { w: img.width, h: img.height, want: [Math.round(clip.width * dpr), Math.round(clip.height * dpr)],
                      lumMin: +mn.toFixed(1), lumMax: +mx.toFixed(1), px } };
    }, args);
  }

  for (const dark of [false, true]) {
    for (const dpr of [1, 2]) {
      const pg = await browser.newPage({ viewport: { width: VW, height: 900 }, deviceScaleFactor: dpr,
        colorScheme: dark ? 'dark' : 'light' });
      pg.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
      await pg.addInitScript(installOverlayGuards);   // r455: same guard set as the per-edge `page`
      await pg.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 20000 });
      await pg.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function',
        null, { timeout: 20000 });
      await pg.evaluate(() => { try { _pro = true; } catch (e) {} });

      const tag = `DPR${dpr} ${dark ? 'dark ' : 'light'}`;
      const r = await alignScan(pg, dpr, dark);
      if (r.err) { fail++; console.log(`  FAIL ${`alignment ${tag}`.padEnd(46)} ${r.err}`); await pg.close(); continue; }
      const run = r.cells.filter(c => c.bt), plain = r.cells.filter(c => !c.bt);
      const shown = r.cells.map(c => `${c.bt ? 'bt' : '--'}c${c.c}[${c.bt ? c.start : c.lineStart},${c.bt ? c.end : c.lineEnd})`).join(' ');

      if (run.some(c => c.start === null)) {
        fail++; console.log(`  FAIL ${`alignment ${tag} — run paints at all`.padEnd(46)} ${shown}${r.diag ? '  diag ' + JSON.stringify(r.diag) : ''}`);
        if (r.img) console.log(`       img ${JSON.stringify(r.img)}  clip ${JSON.stringify(r.clip)}`);
        if (r.b64) console.log(`       png ${r.b64}`);   // ~2KB — paste into a file to SEE what the runner shot
        await pg.close(); continue;
      }
      /* 1. NO STEP between neighbours. */
      {
        const s0 = run[0].start, e0 = run[0].end;
        const ok = run.every(c => Math.abs(c.start - s0) < TOL && Math.abs(c.end - e0) < TOL);
        if (!ok) fail++;
        /* sheet luminance is printed as proof the theme leg really flipped — identical geometry
           in both themes is the expected result, not evidence the dark run was a no-op. */
        console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${`alignment ${tag} — neighbours share one y`.padEnd(46)} ${shown}  sheet lum ${Math.round(run[0].bg)}`);
      }
      /* 2. ON THE LINE the row's unbordered cells draw — the rule REPLACES the gridline the way
            Excel's does, rather than sitting a pixel under it. */
      {
        const g = plain.filter(c => c.lineStart !== null);
        const ok = g.length > 0 && run.every(c => g.every(p => Math.abs(c.start - p.lineStart) < TOL));
        if (!ok) fail++;
        console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${`alignment ${tag} — flush to the row's gridline`.padEnd(46)} ` +
                    `rule starts ${run[0].start}, plain gridline starts ${g.length ? g.map(p => p.lineStart).join('/') : '(none found)'} (device px)`);
      }
      /* 3. NOTHING STACKED — the whole visible band on a bordered cell IS the rule. If the
            gridline still paints above it the band is a pixel taller than the rule. */
      {
        const ok = run.every(c => Math.abs(c.lineStart - c.start) < TOL && Math.abs(c.lineEnd - c.end) < TOL);
        if (!ok) fail++;
        console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${`alignment ${tag} — rule replaces the gridline`.padEnd(46)} ` +
                    `visible band [${run[0].lineStart},${run[0].lineEnd}) vs rule [${run[0].start},${run[0].end}) (device px)`);
      }
      /* 4. CONTINUOUS across the column boundaries. */
      {
        const ok = r.holes === 0;
        if (!ok) fail++;
        console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${`alignment ${tag} — run is one unbroken rule`.padEnd(46)} ${r.holes} hole pixel(s) along the rule`);
      }
      await pg.close();
    }
  }

  if (errs.length) { fail++; console.log('  FAIL page errors: ' + errs.slice(0, 3).join(' | ')); }
  await browser.close();
  console.log(fail ? `BORDER RENDER: ${fail} FAILURE(S)` : 'BORDER RENDER: clean');
  process.exit(fail ? 1 : 0);
})();
