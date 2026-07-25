#!/usr/bin/env node
/* r429 BORDER RENDER GUARD — Wolf reported "borders are not showing on the grid" in THREE
   consecutive playtests. r426 fixed a CSS-specificity colour fight and the bug still shipped,
   because the real causes were elsewhere:
     (a) .bl / .br / .thick had no CSS rules at all — the ops set the state, nothing painted it;
     (b) applied borders were 1px solid, identical to the 1px solid gridline, so
         border-collapse (CSS 2.1 §17.6.2.1) fell through to its positional tie-break and the
         cell above/left won every shared edge — killing TOP and LEFT borders specifically.
   Neither fault is visible to getComputedStyle: in collapsed tables the style still reports
   the border you asked for, the browser simply paints the neighbour's instead. So this guard
   works on PIXELS.

   Method, dependency-free (no PNG decode): screenshot a thin band straddling one cell edge,
   with and without the border class. If the two buffers are byte-identical, nothing painted.
   Run: CHROME=<chromium> node dev/check-borders.js */
const { chromium } = require('playwright-core');
const fs = require('fs');

const CSS = fs.readFileSync(__dirname + '/../index.html', 'utf8').match(/<style>([\s\S]*?)<\/style>/)[1];

// 3x3 so the centre cell has a real neighbour on every side to collapse against.
const page3x3 = (cls) => `<style>${CSS}</style><body style="margin:0;background:#fff">
  <div class="gridwrap"><table id="grid"><tbody>
  ${[0,1,2].map(r => `<tr>${[0,1,2].map(c =>
    `<td class="${r === 1 && c === 1 ? cls : ''}" style="width:60px;height:30px"></td>`).join('')}</tr>`).join('')}
  </tbody></table></div></body>`;

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME });
  const page = await browser.newPage({ viewport: { width: 400, height: 240 } });

  async function bandFor(cls, edge) {
    await page.setContent(page3x3(cls));
    const b = await page.locator('#grid td').nth(4).boundingBox();
    // 4px band centred on the edge — wide enough to catch a 1.5px or 2.5px collapsed rule
    const clip = {
      top:    { x: b.x + 6, y: b.y - 2,            width: b.width - 12, height: 4 },
      bottom: { x: b.x + 6, y: b.y + b.height - 2, width: b.width - 12, height: 4 },
      left:   { x: b.x - 2,           y: b.y + 6, width: 4, height: b.height - 12 },
      right:  { x: b.x + b.width - 2, y: b.y + 6, width: 4, height: b.height - 12 },
    }[edge];
    return page.screenshot({ clip });
  }

  const CASES = [
    ['bt',   'top',    'Alt H B P — top border'],
    ['bb',   'bottom', 'Alt H B O — bottom border'],
    ['bl',   'left',   'Alt H B L — left border'],
    ['br',   'right',  'Alt H B R — right border'],
    ['ball', 'top',    'Alt H B A — all borders (top edge)'],
    ['ball', 'left',   'Alt H B A — all borders (left edge)'],
  ];

  let fail = 0;
  for (const [cls, edge, label] of CASES) {
    const plain = await bandFor('', edge);
    const drawn = await bandFor(cls, edge);
    const painted = !plain.equals(drawn);
    if (!painted) fail++;
    console.log(`  ${painted ? 'ok  ' : 'FAIL'} ${label}`);
  }

  // The real-world op: Alt H B S sets bt+bb+bl+br around the perimeter. All four must paint.
  for (const edge of ['top', 'bottom', 'left', 'right']) {
    const plain = await bandFor('', edge);
    const drawn = await bandFor('bt bb bl br', edge);
    const painted = !plain.equals(drawn);
    if (!painted) fail++;
    console.log(`  ${painted ? 'ok  ' : 'FAIL'} Alt H B S — outside box, ${edge} edge`);
  }

  // Alt H B T (thick box) must be visibly heavier than the thin rule, not identical to it.
  for (const edge of ['top', 'left']) {
    const thin = await bandFor('bt bb bl br', edge);
    const thick = await bandFor('bt bb bl br thick', edge);
    const heavier = !thin.equals(thick);
    if (!heavier) fail++;
    console.log(`  ${heavier ? 'ok  ' : 'FAIL'} Alt H B T — thick box differs from thin, ${edge} edge`);
  }

  /* ---- PHASE 2: the REAL render path ----
     Phase 1 hand-writes the classes onto the markup, so it proves the CSS is right and nothing
     else. That blind spot hid the third layer of this very bug: render() pushed bt/bb/ball/bdbl
     as classes but never bl/br/thick, so those flags could not paint no matter how correct the
     stylesheet was. This phase drives the actual app — set the flags through the engine, then
     assert the classes reach the DOM. Needs the dev server; skipped (not failed) without it. */
  const BASE = process.env.BASE || 'http://127.0.0.1:8791';
  try {
    const p2 = await (await chromium.launch({ executablePath: process.env.CHROME })).newPage({ viewport: { width: 1280, height: 860 } });
    // returning user: a fresh profile walks the onboarding funnel and swallows every key
    await p2.addInitScript(() => { try { localStorage.setItem('hotkey_onboarded','1'); localStorage.setItem('hk_tour_done','1'); } catch(e){} });
    await p2.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await p2.waitForTimeout(1200);
    await p2.evaluate(() => { try { dismissLanding(); } catch (e) {} });
    await p2.waitForTimeout(600);
    for (let i = 0; i < 5; i++) {
      if (!await p2.evaluate(() => !!window.__introCardOpen)) break;
      await p2.keyboard.press('Enter'); await p2.waitForTimeout(350);
    }
    await p2.evaluate(() => { try { loadChallenge('filldr'); } catch (e) {} });
    await p2.waitForTimeout(800);

    // Drive the engine the way a player would: set the flags, re-render, read the DOM back.
    const seen = await p2.evaluate(() => {
      const a = S.active;
      const c = (typeof ensure === 'function') ? ensure(a.r, a.c) : null;
      if (!c) return null;
      c.bl = true; c.br = true; c.bt = true; c.bb = true; c.thick = true;
      render();
      const td = document.querySelector(`#grid td[data-r="${a.r}"][data-c="${a.c}"]`);
      return td ? td.className : null;
    });
    if (seen === null) {
      console.log('  ??  real render path — could not reach a cell (skipped)');
    } else {
      for (const cls of ['bt', 'bb', 'bl', 'br', 'thick']) {
        const has = new RegExp(`\\b${cls}\\b`).test(seen);
        if (!has) fail++;
        console.log(`  ${has ? 'ok  ' : 'FAIL'} render() emits .${cls} onto the cell`);
      }
    }
    await p2.context().browser().close();
  } catch (e) {
    console.log('  ??  real render path skipped (no dev server on ' + BASE + ')');
  }

  console.log(fail ? `BORDER RENDER: ${fail} FAILURE(S)` : 'BORDER RENDER: clean');
  process.exit(fail ? 1 : 0);
})();
