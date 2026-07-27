/* VERIFY-GAUNTLET (r429, DEPTH_PASS §4.20 + §2.4) — the drill-specific mechanics probe.
   gauntlet is the FORMATTING CAPSTONE, so the load-bearing assertion is §2.2's absolute rule:
   a bonus can NEVER gate anything. Dressing both sides by hand must clear all six cores and
   WIN the capstone with the ☆ dark. Also proves the format-cloning latch, the capstone wiring
   (meta flag, chapter designation, clocks at par×2, shared predicate), and the §1.2 axes.
     node dev/verify-gauntlet.js            # needs a server on 8791 */
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';

const ok = [], bad = [];
const T = (n, pass, d) => { console.log((pass ? '  PASS  ' : '  FAIL  ') + n + (d ? ' — ' + d : '')); (pass ? ok : bad).push(n); };

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
    loadChallenge('gauntlet');
  });

  console.log('\nVERIFY-GAUNTLET (r429)');

  // ---- A · demo route (the clone) clears everything ----------------------------------
  await reset();
  const demo = await page.evaluate(() => {
    const C = CHALLENGES.gauntlet;
    for (const mv of C.demo.call(C)) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
    const r = C.checks(S);
    return { core: r.filter(c => !c.bonus).every(c => c.ok), star: !!r.find(c => c.bonus).ok,
             fmtPastes: (S.pasteLog || []).filter(p => p.kind === 'formats').length };
  });
  T('A1 demo clears every core beat', demo.core);
  T('A2 demo EARNS the format-cloning ☆', demo.star);
  T('A3 the clone is a real paste-FORMATS op (existing r425 pasteLog, no new telemetry)', demo.fmtPastes >= 1);

  // ---- B · §2.2 THE CAPSTONE RULE: a bonus can NEVER gate anything --------------------
  // Dress BOTH sides by hand. Must clear all six cores, WIN, and leave the ☆ dark.
  await reset();
  const byHand = await page.evaluate(() => {
    const C = CHALLENGES.gauntlet, R = C._R;
    const blue = [Kb.alt, L('H'), L('F'), L('C'), { key: 'ArrowRight' }, { key: 'ArrowRight' },
                  { key: 'ArrowRight' }, { key: 'ArrowRight' }, Kb.enter];
    setDemoSel(R.srcIn); blue.forEach(demoKey);
    setDemoSel(R.useIn); blue.forEach(demoKey);
    setDemoSel(R.srcTot); demoKey(Kb.eq); demoKey(Kb.enter);
    setDemoSel(R.useTot); demoKey(Kb.eq); demoKey(Kb.enter);
    for (const t of [R.srcTot, R.useTot]) { setDemoSel(t); demoKey(Kb.bold);
      [Kb.alt, L('H'), L('B'), L('P')].forEach(demoKey); }
    for (const c of [R.srcCol, R.useCol]) { setDemoSel(c);
      [Kb.alt, L('H'), L('K'), Kb.alt, L('H'), D(9), Kb.alt, L('H'), D(9)].forEach(demoKey); }
    for (const c of [R.srcCol, R.useCol]) { setDemoSel(c); [Kb.alt, L('H'), L('O'), L('I')].forEach(demoKey); }
    setDemoSel('A1'); demoKey({ key: 'Home', ctrl: true });
    demoKey({ key: 's', ctrl: true });
    const r = C.checks(S);
    return { core: r.filter(c => !c.bonus).every(c => c.ok), star: !!r.find(c => c.bonus).ok,
             won: (typeof done !== 'undefined') ? !!done : null,
             failed: r.filter(c => !c.bonus && !c.ok).map(c => c.label) };
  });
  T('B1 dressing both sides BY HAND clears every core beat (§1.0(c) freedom)', byHand.core, byHand.failed.join(' | '));
  T('B2 ...and WINS the capstone', byHand.won === true, 'done=' + byHand.won);
  T('B3 ...with the ☆ still dark — §2.2: a bonus can NEVER gate anything', !byHand.star);

  // ---- C · the finish-state beat is genuinely last ------------------------------------
  await reset();
  const finish = await page.evaluate(() => {
    const C = CHALLENGES.gauntlet;
    /* NOTE: the engine APPENDS its Ctrl+S closer step to demo() at runtime (saveClose:true), so
       the home move is the second-to-LAST step, not the last. Slice off both to test "before
       home", then replay the home step alone. */
    const mv = C.demo.call(C);
    const home = mv[mv.length - 2];
    for (const m of mv.slice(0, -2)) { setDemoSel(m.sel); for (const k of m.keys) demoKey(k); }
    const beforeHome = !!C.checks(S)[5].ok;
    const where = { r: S.active.r, c: S.active.c };
    setDemoSel(home.sel); for (const k of home.keys) demoKey(k);
    return { beforeHome, where, afterHome: !!C.checks(S)[5].ok };
  });
  T('C1 "Finish at A1" is open until the cursor actually goes home', !finish.beforeHome, 'cursor at r'+finish.where.r+'c'+finish.where.c);
  T('C2 ...and closes when it does (§1.6 finish-state beat)', finish.afterHome);

  // ---- D · capstone WIRING (§2.4, the modeltour template) -----------------------------
  const wiring = await page.evaluate(() => {
    const D = window.HOTKEY_DRILLS || {}, camp = (window.HOTKEY_CAMPAIGN || {}).chapters || [];
    const c2 = camp.find(c => c.id === 'c2');
    const grp = (D.groups || []).find(g => g.name === 'Formatting');
    return { metaFlag: !!(D.meta.gauntlet && D.meta.gauntlet.capstone),
             designated: c2 && c2.capstone,
             last: grp && grp.keys[grp.keys.length - 1],
             clock: (window.HOTKEY_CLOCKS || {}).gauntlet,
             par: (window.HOTKEY_PARS || {}).gauntlet,
             shared: typeof window.hkCapstoneOk === 'function' };
  });
  T('D1 drills.js meta.gauntlet.capstone is true (drives the picker ★ tag)', wiring.metaFlag);
  T('D2 chapter c2 designates gauntlet', wiring.designated === 'gauntlet');
  T('D3 gauntlet sits LAST in the Formatting group (capstone-last is uniform)', wiring.last === 'gauntlet');
  T('D4 clocks pass = par × 2 (§2.4 — the gate is about execution, not speed)',
     wiring.clock && wiring.clock.pass === wiring.par * 2, 'pass=' + (wiring.clock && wiring.clock.pass) + ' par=' + wiring.par);
  T('D5 the SHARED hkCapstoneOk predicate is what every surface reads', wiring.shared);

  // ---- E · display + axes -------------------------------------------------------------
  await reset();
  const disp = await page.evaluate(() => {
    const C = CHALLENGES.gauntlet, r = C.checks(S), t = document.getElementById('checklist').textContent;
    return { one: r.filter(c => c.bonus).length, nCore: r.filter(c => !c.bonus).length,
             mystery: /☆\s*\?/.test(t), leak: /single paste/.test(t) };
  });
  T('E1 exactly one bonus check', disp.one === 1);
  T('E2 6 authored core beats + the engine save closer (§1.1 cap)', disp.nCore === 7, 'got ' + disp.nCore);
  T('E3 checklist renders the mystery "☆ ?" slot', disp.mystery);
  T('E4 the ☆ label does NOT leak before it is earned', !disp.leak);

  const ax = await page.evaluate(() => {
    const s = { r0: new Set(), nL: new Set(), wide: new Set(), lbl: new Set() };
    for (let i = 0; i < 40; i++) { loadChallenge('gauntlet'); const R = CHALLENGES.gauntlet._R;
      s.r0.add(R.r0); s.nL.add(R.nL); s.wide.add(R.wideSide); s.lbl.add(S.cells['A' + (R.r0 + 1)].value); }
    return { r0: s.r0.size, nL: s.nL.size, wide: s.wide.size, lbl: s.lbl.size };
  });
  T('E5 axis (a) site jitter varies', ax.r0 > 1);
  T('E6 axis (c) line COUNT varies (moves the total row)', ax.nL > 1, ax.nL + ' depths');
  T('E7 axis (d) which side squeezes varies', ax.wide > 1);
  T('E8 axis (b) label pools vary', ax.lbl > 1, ax.lbl + ' distinct');
  T('F1 zero page errors', errs.length === 0, errs.join(' | '));

  await browser.close();
  console.log('\n  ' + ok.length + '/' + (ok.length + bad.length) + ' checks pass');
  process.exit(bad.length ? 1 : 0);
})();
