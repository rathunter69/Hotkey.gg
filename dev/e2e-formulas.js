/* FORMULA PACK E2E (D1, r415-review) — locks the lookup/logical/date functions added to
   the engine's evalFormula: VLOOKUP/HLOOKUP, AND/OR/NOT, DATE/YEAR/MONTH/DAY/EDATE/EOMONTH/
   YEARFRAC. Seeds a small table in the real sheet and asserts each result + that misses route
   through IFERROR and the pre-existing functions still work.
   Run: python3 -m http.server 8791 & ; node dev/e2e-formulas.js */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const perr = [];
  page.on('pageerror', e => perr.push(String(e.message || e).slice(0, 140)));
  await page.route('**/@supabase/**', r => r.abort());
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof evalFormula === 'function' && typeof S !== 'undefined', null, { timeout: 15000 });

  const got = await page.evaluate(() => {
    const set = (ref, v) => { (S.cells[ref] = S.cells[ref] || {}).value = v; S.cells[ref].formula = null; };
    set('A1', 1); set('A2', 2); set('A3', 3);
    set('B1', 10); set('B2', 20); set('B3', 30);
    set('C1', 'apple'); set('C2', 'pear'); set('C3', 'plum');
    set('D1', 5); set('E1', 6); set('F1', 7);
    set('D2', 50); set('E2', 60); set('F2', 70);
    const E = f => { try { return evalFormula(f); } catch (e) { return 'ERR:' + String(e.message || e).slice(0, 20); } };
    return {
      vlookup_num: E('=VLOOKUP(2,A1:B3,2,0)'),
      vlookup_txt: E('=VLOOKUP(3,A1:C3,3,0)'),
      vlookup_approx: E('=VLOOKUP(2.5,A1:B3,2,1)'),
      vlookup_miss: E('=IFERROR(VLOOKUP(9,A1:B3,2,0),-1)'),
      hlookup: E('=HLOOKUP(6,D1:F2,2,0)'),
      and1: E('=AND(1>0,2>0)'), and0: E('=AND(1>0,0>1)'),
      or1: E('=OR(0>1,2>0)'), or0: E('=OR(0>1,0>2)'),
      not0: E('=NOT(0)'), not1: E('=NOT(5)'),
      yr: E('=YEAR(DATE(2026,7,24))'), mo: E('=MONTH(DATE(2026,7,24))'), day: E('=DAY(DATE(2026,7,24))'),
      edate: E('=DAY(EDATE(DATE(2026,1,31),1))'),
      eomonth: E('=DAY(EOMONTH(DATE(2026,1,15),0))'),
      yearfrac: E('=YEARFRAC(DATE(2026,1,1),DATE(2026,7,1))'),
      sum_still: E('=SUM(A1:A3)'), index_still: E('=INDEX(B1:B3,2)'),
    };
  });

  const want = {
    vlookup_num: 20, vlookup_txt: 'plum', vlookup_approx: 20, vlookup_miss: -1, hlookup: 60,
    and1: 1, and0: 0, or1: 1, or0: 0, not0: 1, not1: 0,
    yr: 2026, mo: 7, day: 24, edate: 28, eomonth: 31, yearfrac: 0.5,
    sum_still: 6, index_still: 20,
  };
  let fail = 0;
  for (const k of Object.keys(want)) {
    if (got[k] !== want[k]) { fail++; console.error(`FAIL ${k}: got ${JSON.stringify(got[k])} want ${JSON.stringify(want[k])}`); }
    else console.log(`  ok  ${k} = ${JSON.stringify(got[k])}`);
  }
  if (perr.length) { fail++; console.error('PAGE ERRORS: ' + perr.join(' | ')); }
  await browser.close();
  if (fail) { console.error(`\nFORMULA PACK: ${fail} failure(s)`); process.exit(1); }
  console.log('FORMULA PACK: ALL ' + Object.keys(want).length + ' PASS');
})();
