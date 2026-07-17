/* r165 PAR CALIBRATION SWEEP — replay every drill's demo() through the real
   engine and compare the MEASURED optimal keystroke count (keyLog at the win)
   against the declared parKeys, and par seconds against the house s/key band.
   Drills randomize, so each drill is measured over REPS seeds (median).
   House policy (r33, updated r165): parKeys tracks the demo's real length —
   a drifted parKeys silently skews the results-card efficiency ratio, marathon
   scoring, and the "optimal" line players chase.
   Run: node dev/e2e-par-sweep.js   (server on 127.0.0.1:8791) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const REPS = 5;
// Known-high-variance drills: 5-seed medians swing across the flag threshold in
// BOTH directions (editfix: 39, 24, 42 on successive gates). Reported as INFO,
// never FLAGGED — retune only against a 21-seed median (doctrine r172).
// r187: pool widened to 19 pairs; fresh 21-seed median 32 (range 20-58), declared 32.
const VARIANCE_OK = new Set(['editfix']);

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_beta_ok', '1');
    localStorage.setItem('hk_xlv', '2');
  } catch (e) {} });
  await page.goto('http://127.0.0.1:8791/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  const keys = await page.evaluate(() => Object.keys(CHALLENGES));
  const rows = [];
  for (const key of keys) {
    const counts = [];
    for (let rep = 0; rep < REPS; rep++) {
      const r = await page.evaluate((k) => {
        try {
          document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
          loadChallenge(k);
          const C = CHALLENGES[k];
          const moves = (typeof C.demo === 'function') ? C.demo.call(C) : C.demo;
          if (!moves || !moves.length) return { skip: true };
          for (const mv of moves) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
          return { won: done, keys: keyLog.length, par: C.par, parKeys: C.parKeys };
        } catch (e) { return { err: String(e).slice(0, 80) }; }
      }, key);
      if (r.skip) { counts.length = 0; break; }
      if (r.err || !r.won) { console.log(key + ': REP FAILED ' + (r.err || 'no win')); continue; }
      counts.push(r.keys);
      if (rep === 0) { rows.push({ key, par: r.par, parKeys: r.parKeys, counts }); }
    }
  }
  console.log('drill              par  parKeys  medKeys  drift%   s/key');
  const flagged = [];
  for (const row of rows) {
    if (!row.counts.length) continue;
    const s = row.counts.slice().sort((a, b) => a - b);
    const med = s[Math.floor(s.length / 2)];
    const drift = row.parKeys ? Math.round(100 * (med - row.parKeys) / row.parKeys) : null;
    const spk = row.parKeys ? (row.par / row.parKeys) : null;
    // DRIFT is the fixable defect (parKeys vs the live keyLog metric). s/key RATIO is
    // informational only — short drills are reading-dominated, par seconds are tuned
    // difficulty (campaign gates + XP tiers), never auto-adjusted here.
    const noisy = VARIANCE_OK.has(row.key);
    const flag = (!noisy && drift !== null && Math.abs(drift) > 15 && Math.abs(med - row.parKeys) > 4) ? ' <-- DRIFT'
               : (noisy && drift !== null && Math.abs(drift) > 15 ? ' (known variance — info only)' : '');
    if (flag && !noisy) flagged.push({ key: row.key, par: row.par, parKeys: row.parKeys, med, drift });
    console.log(
      row.key.padEnd(18) + String(row.par).padStart(4) + String(row.parKeys).padStart(8) +
      String(med).padStart(9) + String(drift === null ? '—' : drift + '%').padStart(8) +
      (spk === null ? '—' : spk.toFixed(2)).padStart(8) + flag);
  }
  console.log('\nFLAGGED: ' + flagged.length);
  flagged.forEach(f => console.log('  ' + f.key + ' parKeys ' + f.parKeys + ' -> measured ' + f.med + ' (par ' + f.par + ')'));
  await browser.close();
  process.exit(0);
})();
