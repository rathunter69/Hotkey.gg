/* r176 FIT SWEEP — no drill may LOAD with ##### on screen (Wolf: numbers too
   wide for their columns across drills). Loads every drill ×REPS seeds and
   scans every numeric, non-wrapped cell against the ACTUAL column width.
   Exempt: drills whose lesson IS the squeeze (autofit / combo / gauntlet).
   Offenders fix at the source: value ranges or an explicit colW in build().
   Run: node dev/e2e-fit-sweep.js   (server on 127.0.0.1:8791) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const REPS = 3;
const EXEMPT = new Set(['autofit', 'combo', 'gauntlet', 'unhide']);   // unhide loads with an intentional squeeze — Alt H O W is the lesson

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
  const bad = {};
  for (const key of keys) {
    if (EXEMPT.has(key)) continue;
    for (let rep = 0; rep < REPS; rep++) {
      const hits = await page.evaluate((k) => {
        document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
        loadChallenge(k);
        const out = [];
        for (let c = 1; c <= COLS; c++) {
          for (let r = 1; r <= S.ROWS; r++) {
            const cell = S.cells[colLetter(c) + r];
            if (!cell || cell.wrap || typeof cell.value !== 'number') continue;
            const t = fmtNum(cell.value, cell.fmtStyle, cell.decimals);
            if (t.length * CHARPX + 12 > colW[c]) out.push(colLetter(c) + r + '=' + t + ' @' + colW[c] + 'px');
          }
        }
        return out;
      }, key);
      if (hits.length) { (bad[key] = bad[key] || new Set()); hits.forEach(h => bad[key].add(h)); }
    }
  }
  const names = Object.keys(bad);
  for (const k of names) console.log('OVERFLOW ' + k.padEnd(12) + ' ' + [...bad[k]].slice(0, 6).join(' · '));
  console.log('\nFIT SWEEP: ' + (names.length ? names.length + ' DRILL(S) LOAD WITH #####' : 'ALL CLEAN (' + (keys.length - EXEMPT.size) + ' drills)'));
  await browser.close();
  process.exit(names.length ? 1 : 0);
})();
