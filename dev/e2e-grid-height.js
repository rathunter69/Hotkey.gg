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

  /* 5. UNIFORMITY across the CATALOG (r438) — the invariant this suite was missing.
     Wolf: "didn't we decide on a standard 20 row grid? why are all of the drills still various
     rows". Checks 1-4 above all measure ONE drill against itself, so a spread ACROSS drills was
     invisible to them: live rendered 18 rows for 75 drills, 20 for one, 21 for four and 22 for
     another, with four different cell heights, and this suite was green throughout.
     DEPTH_PASS.md §1.3 fixes the sheet at 20 rows (__ROW_CAP), floored at content so a taller
     board is never cut — so at one viewport every drill must paint the SAME number of rows,
     except drills that legitimately declare more than 20 content rows. */
  console.log('\nE. catalog uniformity — every drill paints the same sheet (§1.3, __ROW_CAP 20)');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(400);
  const keys = await page.evaluate(() => Object.keys(CHALLENGES));
  const seen = {};
  for (const k of keys) {
    const m = await page.evaluate(async (key) => {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge(key);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise(r => setTimeout(r, 90));          // let the post-layout re-render land
      const td = document.querySelector('#grid td');
      return {
        sRows: S.ROWS,
        painted: document.querySelectorAll('#grid tbody tr').length,
        // a board may legitimately LOAD with rows hidden (unhide's whole lesson is the gaps);
        // those rows are not painted, so they must be added back before comparing sheets
        hidden: (S.hidden && typeof S.hidden.size === 'number') ? S.hidden.size : 0,
        cellH: td ? Math.round(td.getBoundingClientRect().height) : 0,
      };
    }, k);
    seen[k] = m;
  }
  // Expected paint for a drill = max(its content rows, the 20-row standard). Compare each drill
  // against its OWN expectation, so a legitimately taller board is not a failure.
  const CAP = 20;
  const offs = [];
  for (const k of keys) {
    const want = Math.max(seen[k].sRows, CAP) - seen[k].hidden;
    // painted counts <tr> in tbody, which includes the column-header row
    if (Math.abs(seen[k].painted - (want + 1)) > 1) offs.push(`${k} painted ${seen[k].painted} for ROWS=${seen[k].sRows} (${seen[k].hidden} hidden; expected ~${want + 1})`);
  }
  if (offs.length) bad(`catalog uniformity: ${offs.length} drill(s) off the 20-row standard — ${offs.slice(0, 6).join(' · ')}`);
  else console.log(`  ok  all ${keys.length} drills paint max(content, ${CAP}) rows at one viewport`);
  // Cell height must not vary meaningfully between drills either — that was half the symptom
  // Wolf saw (23/24/25/28px across the catalog). Boards that load with hidden rows are excluded:
  // fewer painted rows in the same box legitimately means taller cells.
  // …and boards that declare MORE than 20 content rows: they paint more rows into the same box,
  // so shorter cells are correct, not drift. DEPTH_PASS.md §1.3 caps the board at 20, so any
  // drill listed here is out of spec on its BOARD and wants trimming — reported, not failed,
  // because that is board work and this suite guards the render path.
  const over = keys.filter(k => seen[k].sRows > CAP);
  if (over.length) console.log(`  note  ${over.length} drill(s) declare >20 content rows (§1.3 caps the board at 20): ` +
    over.map(k => `${k}=${seen[k].sRows}`).join(' · '));
  const flat = keys.filter(k => !seen[k].hidden && seen[k].sRows <= CAP);
  const hs = [...new Set(flat.map(k => seen[k].cellH))].sort((a, b) => a - b);
  if (hs.length && hs[hs.length - 1] - hs[0] > 2) {
    const worst = flat.filter(k => seen[k].cellH === hs[0] || seen[k].cellH === hs[hs.length - 1]).slice(0, 6);
    bad(`catalog uniformity: cell heights spread ${hs.join('/')}px across drills (>2px) — e.g. ${worst.map(k => k + '@' + seen[k].cellH).join(' · ')}`);
  } else console.log(`  ok  cell heights agree within 2px across the catalog (${hs.join('/')}px)`);

  await browser.close();
  if (fail) { console.error(`\nGRID-HEIGHT: ${fail} failure(s)`); process.exit(1); }
  console.log('GRID-HEIGHT: ALL INVARIANTS HOLD');
})();
