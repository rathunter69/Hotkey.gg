/* VERIFY-AUTOFIT (r429, DEPTH_PASS §4.14) — the drill-specific mechanics probe.
   Proves what the generic suites cannot: the ONE-PASS ☆ earns on a single selection and is
   FORFEITED by column-by-column autofits (§1.0-R2(i) skippability), the CONSEQUENCE CHAIN
   (the Total column only overflows once the player builds it — the §1.5 aha), the §1.0(c)
   freedom guarantee (typed totals clear core), the mystery-slot display contract, and the
   §1.2 axes.
     node dev/verify-autofit.js            # needs a server on 8791 */
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';

const ok = [], bad = [];
const T = (n, pass, detail) => { console.log((pass ? '  PASS  ' : '  FAIL  ') + n + (detail ? ' — ' + detail : '')); (pass ? ok : bad).push(n); };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 140)));
  await page.addInitScript(() => {
    try { ['hotkey_onboarded', 'hk_tour_done', 'hk_learn_done'].forEach(k => localStorage.setItem(k, '1'));
          localStorage.setItem('hk_handle_cache', ''); } catch (e) {}
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
    loadChallenge('autofit');
  });

  console.log('\nVERIFY-AUTOFIT (r429)');

  // ---- A · the demo route: every core beat + the ☆ ----------------------------------
  await reset();
  const demo = await page.evaluate(() => {
    const C = CHALLENGES.autofit;
    for (const mv of C.demo.call(C)) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
    const r = C.checks(S);
    return { core: r.filter(c => !c.bonus).every(c => c.ok), star: !!r.find(c => c.bonus).ok,
             ops: (S.widthOps || []).length };
  });
  T('A1 demo clears every core beat', demo.core);
  T('A2 demo EARNS the one-pass ☆', demo.star);
  T('A3 width telemetry recorded (r429 engine hunk live)', demo.ops >= 3, demo.ops + ' width ops');

  // ---- B · NEGATIVE CONTROL: column-by-column autofit forfeits the ☆ ------------------
  await reset();
  const slow = await page.evaluate(() => {
    const C = CHALLENGES.autofit, o = C._o;
    setDemoSel('A' + o.hr); [Kb.alt, L('H'), L('O'), L('I')].forEach(demoKey);      // column A alone
    setDemoSel('B' + o.hr); [Kb.alt, L('H'), L('O'), L('I')].forEach(demoKey);      // column B alone
    setDemoSel(o.qRng); [Kb.alt, L('H'), L('O'), L('W'), { key: '1' }, { key: '2' }, Kb.enter].forEach(demoKey);
    // TYPED totals — the §1.0(c) slow route, no SUM at all
    for (let i = 0; i <= o.nd; i++) { setDemoSel(o.tCol + (o.hr + 1 + i));
      T2(String(o.expect[i])).forEach(demoKey); demoKey(Kb.enter); }
    setDemoSel(o.tCol + (o.hr + 1) + ':' + o.tCol + o.rt); [Kb.alt, L('H'), L('O'), L('I')].forEach(demoKey);
    setDemoSel('A' + o.rt + ':' + o.tCol + o.rt); demoKey(Kb.bold);
    [Kb.alt, L('H'), L('B'), L('P')].forEach(demoKey);
    demoKey({ key: 's', ctrl: true });
    const r = C.checks(S);
    return { core: r.filter(c => !c.bonus).every(c => c.ok), star: !!r.find(c => c.bonus).ok,
             failed: r.filter(c => !c.bonus && !c.ok).map(c => c.label) };
    function T2(s) { return [...s].map(ch => ({ key: ch })); }
  });
  T('B1 column-by-column + TYPED totals clears every core beat (§1.0(c) freedom)', slow.core, slow.failed.join(' | '));
  T('B2 column-by-column autofit does NOT earn the ☆ (§1.0-R2(i) skippable)', !slow.star);

  // ---- C · THE CONSEQUENCE CHAIN — the aha is the player's own doing -----------------
  await reset();
  const chain = await page.evaluate(() => {
    const C = CHALLENGES.autofit, o = C._o;
    const fits = c => (S._colW || {})[c] >= neededWidth(c) - 1;
    /* "no ##### handed to the player" means no NUMBER in the Total column at load — ##### is a
       numeric-overflow render, text just clips. (fits() is the wrong probe here: it also measures
       the "Total" header, which is itself wider than the squeezed column — that clipped header is
       part of the board's squeeze story, not a spoiled aha.) */
    let beforeEmpty = true;
    for (let r = o.hr + 1; r <= o.rt; r++) { const cc = S.cells[o.tCol + r];
      if (cc && typeof cc.value === 'number') beforeEmpty = false; }
    // build the totals, THEN re-measure — the column must now be too narrow
    setDemoSel(o.tCol + (o.hr + 1));
    [...('=SUM(' + o.q1 + (o.hr + 1) + ':' + o.q4 + (o.hr + 1) + ')')].map(ch => ({ key: ch })).forEach(demoKey);
    demoKey(Kb.enter);
    setDemoSel(o.tCol + (o.hr + 1) + ':' + o.tCol + o.rt); demoKey({ key: 'd', ctrl: true });
    const afterBuild = fits(o.tc);
    const r = C.checks(S);
    return { beforeEmpty, afterBuild, beat4: !!r[3].ok, beat3: !!r[2].ok };
  });
  T('C1 the Total column ships NARROW and EMPTY — no ##### handed to the player at load', chain.beforeEmpty);
  T('C2 building the totals makes it too narrow (the aha is the player’s own figures)', !chain.afterBuild);
  T('C3 beat 3 clears on the build, beat 4 does NOT until the autofit lands', chain.beat3 && !chain.beat4);

  // ---- D · mystery-slot display contract ---------------------------------------------
  await reset();
  const disp = await page.evaluate(() => {
    const C = CHALLENGES.autofit, r = C.checks(S), t = document.getElementById('checklist').textContent;
    return { one: r.filter(c => c.bonus).length, nCore: r.filter(c => !c.bonus).length,
             mystery: /☆\s*\?/.test(t), leak: /one pass/.test(t) };
  });
  T('D1 exactly one bonus check', disp.one === 1);
  T('D2 5 authored core beats + the engine save closer (§1.1 4–6)', disp.nCore === 6, 'got ' + disp.nCore);
  T('D3 checklist renders the mystery "☆ ?" slot', disp.mystery);
  T('D4 the ☆ label does NOT leak before it is earned', !disp.leak);

  // ---- E · §1.2 axes -----------------------------------------------------------------
  const ax = await page.evaluate(() => {
    const s = { hr: new Set(), nd: new Set(), rot: new Set(), dept: new Set(), val: new Set() };
    for (let i = 0; i < 40; i++) { loadChallenge('autofit'); const o = CHALLENGES.autofit._o;
      s.hr.add(o.hr); s.nd.add(o.nd); s.rot.add(o.rot);
      s.dept.add(S.cells['A' + (o.hr + 1)].value); s.val.add(o.expect[0]); }
    return { hr: s.hr.size, nd: s.nd.size, rot: s.rot.size, dept: s.dept.size, val: s.val.size };
  });
  T('E1 axis (a) site jitter varies', ax.hr > 1);
  T('E2 axis (c) roster DEPTH varies (moves every graded range)', ax.nd > 1, ax.nd + ' depths');
  T('E3 axis (d) ragged-width rotation varies', ax.rot > 1);
  T('E4 axis (b) department pool varies', ax.dept > 1, ax.dept + ' distinct');
  T('E5 axis (c) values vary', ax.val > 1);

  // ---- F · the board is a real file (§1.0-R3(n) reality test) -------------------------
  await reset();
  const board = await page.evaluate(() => {
    const C = CHALLENGES.autofit, o = C._o;
    return { title: S.cells['A1'].value, dept: S.cells['A' + o.hr].value, cc: S.cells['B' + o.hr].value,
             cc1: S.cells['B' + (o.hr + 1)].value, tot: S.cells['A' + o.rt].value,
             squeezed: (S._colW || {})[1] < neededWidth(1) - 1, saveClose: !!C.saveClose };
  });
  T('F1 artifact is the headcount roster (§3.1 audience A)', /Headcount/.test(board.title), board.title);
  T('F2 both label columns are board-labelled (§1.3)', board.dept === 'Department' && board.cc === 'Cost centre');
  T('F3 cost centres read like real codes', /^CC-\d+$/.test(String(board.cc1)), String(board.cc1));
  T('F4 the board LOADS squeezed — the lesson is visible at open', board.squeezed);
  T('F5 saveClose declared (§1.0(e) closer)', board.saveClose);
  T('G1 zero page errors', errs.length === 0, errs.join(' | '));

  await browser.close();
  console.log('\n  ' + ok.length + '/' + (ok.length + bad.length) + ' checks pass');
  process.exit(bad.length ? 1 : 0);
})();
