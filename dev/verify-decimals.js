/* VERIFY-DECIMALS (r429, DEPTH_PASS §4.12) — the drill-specific mechanics probe.
   Proves the things the generic suites cannot: the mystery-☆ display contract, the
   COLUMN-SELECTION ☆ latch and its negative control (§1.0-R3(o) skippability), the
   §1.0(c) freedom guarantee (a cell-by-cell player still wins), the relative-decimal
   aha (a whole-column pass MOVES the planted outlier), and the §1.2 axes.
     node dev/verify-decimals.js            # needs a server on 8791 */
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';

const ok = [], bad = [];
const T = (name, pass, detail) => (pass ? ok : bad).push(name + (detail ? ' — ' + detail : ''));

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e.message || e).slice(0, 160)));
  await page.addInitScript(() => {
    try {
      localStorage.setItem('hotkey_onboarded', '1');
      localStorage.setItem('hk_tour_done', '1');
      localStorage.setItem('hk_learn_done', '1');
      localStorage.setItem('hk_handle_cache', '');
    } catch (e) {}
  });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function'
    && typeof demoKey === 'function' && typeof setDemoSel === 'function', null, { timeout: 15000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  const reset = () => page.evaluate(() => {
    try { window.__hkCelQ = []; } catch (e) {}
    document.querySelectorAll('.hk-cel-wrap').forEach(n => { try { n.click(); } catch (e) {} n.remove(); });
    try { window.__hkCelOpen = false; } catch (e) {}
    document.querySelectorAll('.wb-dlg').forEach(n => n.remove());
    loadChallenge('decimals');
  });

  // ---- A · the DEMO route earns the ☆ (and every core beat) --------------------------
  await reset();
  const demoRun = await page.evaluate(() => {
    const C = CHALLENGES.decimals;
    for (const mv of C.demo.call(C)) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
    const r = C.checks(S);
    return { core: r.filter(c => !c.bonus).every(c => c.ok), star: !!r.find(c => c.bonus).ok,
             nOps: (S.fmtOps || []).filter(f => f.kind === 'dec').length };
  });
  T('A1 demo clears every core beat', demoRun.core);
  T('A2 demo EARNS the column-select ☆', demoRun.star);
  T('A3 dec telemetry recorded (r429 engine hunk live)', demoRun.nOps >= 3, demoRun.nOps + ' dec ops');

  // ---- B · NEGATIVE CONTROL: cell-by-cell wins core, ☆ stays dark ---------------------
  await reset();
  const slowRun = await page.evaluate(() => {
    const C = CHALLENGES.decimals, o = C._o, cols = C._cols;
    const rows = []; for (let i = 0; i < o.n; i++) rows.push(o.hr + 1 + i); rows.push(o.medRow);
    for (const col of cols) for (const r of rows) {
      setDemoSel(col.L + r);
      const cur = S.cells[col.L + r].decimals, step = col.target > cur ? '0' : '9';
      for (let k = 0; k < Math.abs(col.target - cur); k++) { demoKey(Kb.alt); demoKey(L('H')); demoKey(L(step)); }
    }
    setDemoSel('A' + o.medRow + ':' + colLetter(o.lastC) + o.medRow);
    demoKey(Kb.bold); demoKey(Kb.alt); demoKey(L('H')); demoKey(L('B')); demoKey(L('P'));
    demoKey({ key: 's', ctrl: true });   // the §1.0(e) closer — the slow player still saves
    const r = C.checks(S);
    return { core: r.filter(c => !c.bonus).every(c => c.ok), star: !!r.find(c => c.bonus).ok,
             failed: r.filter(c => !c.bonus && !c.ok).map(c => c.label) };
  });
  T('B1 cell-by-cell route clears every core beat (§1.0(c) freedom)', slowRun.core, slowRun.failed.join(' | '));
  T('B2 cell-by-cell route does NOT earn the ☆ (§1.0-R3(o) skippable)', !slowRun.star);

  // ---- C · the mystery-slot display contract (§1.0(d)) --------------------------------
  await reset();
  const disp = await page.evaluate(() => {
    const C = CHALLENGES.decimals, r = C.checks(S), b = r.find(c => c.bonus);
    const list = document.getElementById('checklist');
    return { isBonus: !!b, unearned: !b.ok, nCore: r.filter(c => !c.bonus).length,
             leaks: list ? /whole column in one pass/.test(list.textContent) : null,
             mystery: list ? /☆\s*\?/.test(list.textContent) : null };
  });
  T('C1 exactly one bonus check, unearned at load', disp.isBonus && disp.unearned);
  T('C2 core beat count is 5 authored + the engine save closer (§1.1 4–6)', disp.nCore === 6, 'got ' + disp.nCore);
  T('C3 checklist renders the mystery "☆ ?" slot', disp.mystery === true);
  T('C4 the ☆ label does NOT leak before it is earned', disp.leaks === false);

  // ---- D · the AHA is mechanically real: a column pass MOVES the outlier --------------
  await reset();
  const aha = await page.evaluate(() => {
    const C = CHALLENGES.decimals, o = C._o;
    const before = S.cells[o.defCell].decimals;
    const col = C._cols.find(x => x.h === o.defName);
    setDemoSel(o.defName === 'Turns (x)' ? o.turnR : o.mgnR);
    const step = col.target > col.dec0 ? '0' : '9';
    for (let k = 0; k < Math.abs(col.target - col.dec0); k++) { demoKey(Kb.alt); demoKey(L('H')); demoKey(L(step)); }
    const after = S.cells[o.defCell].decimals;
    return { before, after, target: col.target, presses: o.defPresses };
  });
  T('D1 outlier ships at four decimals', aha.before === 4, 'got ' + aha.before);
  T('D2 the whole-column pass MOVES the outlier (relative ops do not normalise)',
     aha.after !== aha.target && aha.after !== 4, aha.before + ' → ' + aha.after + ', target ' + aha.target);
  T('D3 req/demo press count lands the outlier exactly', aha.after - aha.target === 0 ? true : (aha.presses === Math.abs(aha.after - aha.target)),
     'needs ' + Math.abs(aha.after - aha.target) + ', spec says ' + aha.presses);

  // ---- E · §1.2 axes + same-seed determinism -----------------------------------------
  const axes = await page.evaluate(() => {
    const seen = { hr: new Set(), regions: new Set(), defCol: new Set(), defRow: new Set(), vals: new Set() };
    for (let i = 0; i < 40; i++) {
      loadChallenge('decimals');
      const C = CHALLENGES.decimals, o = C._o;
      seen.hr.add(o.hr); seen.defCol.add(o.defName); seen.defRow.add(o.defRow);
      seen.regions.add(S.cells['A' + (o.hr + 1)].value);
      seen.vals.add(C._cols[0].vals[0]);
    }
    return { hr: seen.hr.size, regions: seen.regions.size, defCol: seen.defCol.size,
             defRow: seen.defRow.size, vals: seen.vals.size };
  });
  T('E1 axis (a) site jitter varies', axes.hr > 1);
  T('E2 axis (b) region pool varies', axes.regions > 1, axes.regions + ' distinct');
  T('E3 axis (d) defect COLUMN varies', axes.defCol > 1);
  T('E4 axis (d) defect ROW varies', axes.defRow > 1, axes.defRow + ' distinct');
  T('E5 axis (c) values vary', axes.vals > 1);

  // ---- F · board density + the §1.0-R3(n) reality test artifacts ----------------------
  await reset();
  const board = await page.evaluate(() => {
    const C = CHALLENGES.decimals, o = C._o;
    const title = S.cells['A1'].value, hdrs = [];
    for (let c = 2; c <= o.lastC; c++) hdrs.push(S.cells[colLetter(c) + o.hr].value);
    return { title, hdrs, med: S.cells['A' + o.medRow].value, saveClose: !!C.saveClose,
             rowsUsed: Object.keys(S.cells).filter(k => S.cells[k].value !== '' && S.cells[k].value != null)
               .map(k => +k.replace(/^[A-J]/, '')).filter((v, i, a) => a.indexOf(v) === i).length };
  });
  T('F1 artifact is the ops scorecard (§3.1 audience A)', /operations scorecard/.test(board.title), board.title);
  T('F2 every graded column is board-labelled (§1.3)', board.hdrs.every(h => h && String(h).length > 2), board.hdrs.join(' · '));
  T('F3 the read line is labelled "Median"', board.med === 'Median');
  T('F4 saveClose declared (§1.0(e) closer)', board.saveClose);

  T('G1 zero page errors', pageErrors.length === 0, pageErrors.join(' | '));

  await browser.close();
  console.log('\nVERIFY-DECIMALS (r429)');
  ok.forEach(s => console.log('  PASS  ' + s));
  bad.forEach(s => console.log('  FAIL  ' + s));
  console.log('\n  ' + ok.length + '/' + (ok.length + bad.length) + ' checks pass');
  process.exit(bad.length ? 1 : 0);
})();
