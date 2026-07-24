/* GRID-HEIGHT REGRESSION (D2, r415-review) — the grid-sizing path is the most-churned,
   most-fragile part of the engine (r55→r176→r333→r399→r406→r409→r413: each fix uncovered a
   new intermediate-layout case). This locks the invariants render()+the ResizeObserver must
   hold across viewport heights, so the next fix can't silently reintroduce oscillation or dead
   space:
     1. cell height stays in a sane band at every height (never a 14-row squeeze or a giant cell);
     2. every content row renders (nothing cut);
     3. DETERMINISM — re-rendering at the same height yields the SAME cell height (no oscillation:
        the exact "every drill other than navigate is in the old sizing" bug the RO fix chased);
     4. at a tall viewport the grid fills its wrap (no big dead-space gap below).
   Run: python3 -m http.server 8791 & ; node dev/e2e-grid-height.js */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const DRILLS = ['navigation', 'foot', 'combo'];
const HEIGHTS = [760, 900, 1080];

const measure = () => {
  const gw = document.querySelector('#gridwrap');
  const grid = document.querySelector('#grid') || gw;
  const td = document.querySelector('#grid td, table td');
  const trs = document.querySelectorAll('#grid tr, table tr').length;
  return {
    rows: (typeof S !== 'undefined' ? S.ROWS : 0),
    trs,
    cellH: td ? Math.round(td.getBoundingClientRect().height) : 0,
    wrapCH: gw ? gw.clientHeight : 0,
    gridH: grid ? grid.offsetHeight : 0,
  };
};

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_beta_ok', '1');
  } catch (e) {} });
  await page.route('**/@supabase/**', r => r.abort());
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  let fail = 0;
  const bad = m => { fail++; console.error('FAIL ' + m); };

  for (const drill of DRILLS) {
    await page.evaluate((k) => { document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove()); loadChallenge(k); }, drill);
    for (const h of HEIGHTS) {
      await page.setViewportSize({ width: 1280, height: h });
      await page.waitForTimeout(500);                     // let the ResizeObserver settle
      const a = await page.evaluate(measure);
      // determinism: nudge a re-render at the SAME height and re-measure — must be identical
      await page.evaluate(() => window.dispatchEvent(new Event('resize')));
      await page.waitForTimeout(500);
      const b = await page.evaluate(measure);

      const tag = `${drill}@${h}`;
      // sanity band only — absolute px varies a few px by runner/DPR (CI renders ~3px taller than
      // local), so this just catches a genuine squeeze (too-tall cell / too-few rows) or an absurd
      // size; the real regression guard is DETERMINISM below.
      if (!(a.cellH >= 15 && a.cellH <= 42)) bad(`${tag}: cell height ${a.cellH}px outside [15,42]`);
      if (a.trs && a.rows && a.trs < a.rows) bad(`${tag}: only ${a.trs} rows rendered for ${a.rows} content rows (cut off)`);
      if (Math.abs(a.cellH - b.cellH) > 1) bad(`${tag}: NON-DETERMINISTIC cell height ${a.cellH} -> ${b.cellH} on re-render (oscillation)`);
      if (h >= 1000) {
        const dead = a.wrapCH - a.gridH;
        if (dead > 48) bad(`${tag}: ${dead}px dead space below the grid (wrap ${a.wrapCH} vs grid ${a.gridH})`);
      }
      console.log(`  ${a.cellH >= 15 && a.cellH <= 42 && Math.abs(a.cellH - b.cellH) <= 1 ? 'ok ' : '!! '} ${tag}: cellH=${a.cellH} rows=${a.trs}/${a.rows} wrap=${a.wrapCH} grid=${a.gridH}`);
    }
  }

  await browser.close();
  if (fail) { console.error(`\nGRID-HEIGHT: ${fail} failure(s)`); process.exit(1); }
  console.log('GRID-HEIGHT: ALL INVARIANTS HOLD');
})();
