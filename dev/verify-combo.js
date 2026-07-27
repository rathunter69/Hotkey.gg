/* VERIFY-COMBO (r429, DEPTH_PASS §4.17) — the drill-specific mechanics probe.
   The load-bearing case: this ☆ grades the CHORD, not the rect, so the negative control is a
   hand-drag of the IDENTICAL block — it must clear every core beat and still leave the ☆ dark.
   Also proves the bare-Ctrl+A guard (an exploratory grab that drives nothing earns nothing),
   the mystery-slot display contract, and the §1.2 axes.
     node dev/verify-combo.js            # needs a server on 8791 */
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
    loadChallenge('combo');
  });

  console.log('\nVERIFY-COMBO (r429)');

  // ---- A · demo route: every core beat + the ☆ ---------------------------------------
  await reset();
  const demo = await page.evaluate(() => {
    const C = CHALLENGES.combo;
    for (const mv of C.demo.call(C)) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
    const r = C.checks(S);
    return { core: r.filter(c => !c.bonus).every(c => c.ok), star: !!r.find(c => c.bonus).ok,
             sel: (S.selOps || []).filter(s => s.kind === 'region').length };
  });
  T('A1 demo clears every core beat', demo.core);
  T('A2 demo EARNS the current-region ☆', demo.star);
  T('A3 region telemetry recorded (r429 engine hunk live)', demo.sel >= 1, demo.sel + ' region grabs');

  // ---- B · THE LOAD-BEARING NEGATIVE CONTROL: hand-drag the IDENTICAL rect ------------
  // Same selection shape, same format ops, no Ctrl+A. Must clear core, must NOT latch.
  await reset();
  const drag = await page.evaluate(() => {
    const C = CHALLENGES.combo, o = C._o;
    setDemoSel(o.title); demoKey(Kb.bold);
    setDemoSel(o.hdr); demoKey(Kb.bold);
    setDemoSel(o.mh); [Kb.alt, L('H'), L('A'), L('R')].forEach(demoKey);
    // hand-selected block, identical rect to what Ctrl+A would have produced over the numbers
    setDemoSel(o.num); [Kb.alt, L('H'), L('K'), Kb.alt, L('H'), D(9), Kb.alt, L('H'), D(9)].forEach(demoKey);
    setDemoSel(o.num); [Kb.alt, L('H'), L('F'), L('C'), { key: 'ArrowRight' }, { key: 'ArrowRight' },
                        { key: 'ArrowRight' }, { key: 'ArrowRight' }, Kb.enter].forEach(demoKey);
    setDemoSel(o.notes); [Kb.alt, L('H'), L('W')].forEach(demoKey);
    setDemoSel(o.num); [Kb.alt, L('H'), L('O'), L('I')].forEach(demoKey);
    demoKey({ key: 's', ctrl: true });
    const r = C.checks(S);
    return { core: r.filter(c => !c.bonus).every(c => c.ok), star: !!r.find(c => c.bonus).ok,
             failed: r.filter(c => !c.bonus && !c.ok).map(c => c.label) };
  });
  T('B1 hand-dragged route clears every core beat (§1.0(c) freedom)', drag.core, drag.failed.join(' | '));
  T('B2 hand-dragging the IDENTICAL rect does NOT earn the ☆ (the ☆ grades the chord)', !drag.star);

  // ---- C · the bare-Ctrl+A guard -----------------------------------------------------
  await reset();
  const bare = await page.evaluate(() => {
    const C = CHALLENGES.combo, o = C._o;
    setDemoSel('B' + o.r1); demoKey({ key: 'a', ctrl: true });   // grab, then do nothing with it
    const afterGrab = !!C.checks(S).find(c => c.bonus).ok;
    setDemoSel(o.num); [Kb.alt, L('H'), L('K'), Kb.alt, L('H'), D(9), Kb.alt, L('H'), D(9)].forEach(demoKey);
    return { afterGrab, afterHandFormat: !!C.checks(S).find(c => c.bonus).ok };
  });
  T('C1 a bare exploratory Ctrl+A earns nothing on its own', !bare.afterGrab);
  T('C2 ...and still earns nothing if the formatting is then hand-selected', !bare.afterHandFormat);

  // ---- D · mystery-slot display contract ---------------------------------------------
  await reset();
  const disp = await page.evaluate(() => {
    const C = CHALLENGES.combo, r = C.checks(S), t = document.getElementById('checklist').textContent;
    return { one: r.filter(c => c.bonus).length, nCore: r.filter(c => !c.bonus).length,
             mystery: /☆\s*\?/.test(t), leak: /one keystroke/.test(t) };
  });
  T('D1 exactly one bonus check', disp.one === 1);
  T('D2 6 authored core beats + the engine save closer (§1.1 4–6)', disp.nCore === 7, 'got ' + disp.nCore);
  T('D3 checklist renders the mystery "☆ ?" slot', disp.mystery);
  T('D4 the ☆ label does NOT leak before it is earned', !disp.leak);

  // ---- E · §1.2 axes, incl. the r429 wrap-note position variance ----------------------
  const ax = await page.evaluate(() => {
    const s = { hr: new Set(), nc: new Set(), rows: new Set(), longAt: new Set(), name: new Set() };
    for (let i = 0; i < 40; i++) { loadChallenge('combo'); const o = CHALLENGES.combo._o;
      s.hr.add(o.hr); s.nc.add(o.nc); s.rows.add(o.r2 - o.r1 + 1); s.longAt.add(o.longAt);
      s.name.add(S.cells['A' + o.r1].value); }
    return { hr: s.hr.size, nc: s.nc.size, rows: s.rows.size, longAt: s.longAt.size, name: s.name.size };
  });
  T('E1 axis (a) header-row site varies', ax.hr > 1);
  T('E2 axis (c) metric count + row count vary', ax.nc > 1 && ax.rows > 1);
  T('E3 axis (d) NEW wrap-note position varies (§4.17)', ax.longAt > 1, ax.longAt + ' positions');
  T('E4 axis (b) company pool varies', ax.name > 1, ax.name + ' distinct');

  // ---- F · the board is a real raw paste (§1.0-R3(n)) ---------------------------------
  await reset();
  const board = await page.evaluate(() => {
    const C = CHALLENGES.combo, o = C._o;
    const anyBold = ['A1', 'A' + o.hr].some(k => S.cells[k].bold);
    let anyBlue = false, anyComma = false, anyWrap = false;
    for (let i = 0; i < o.nc; i++) for (let r = o.r1; r <= o.r2; r++) { const x = S.cells[colLetter(2 + i) + r];
      if (x.fontColor === 'blue') anyBlue = true; if (x.fmtStyle === 'comma') anyComma = true; }
    for (let r = o.r1; r <= o.r2; r++) if (S.cells[o.notesCol + r].wrap) anyWrap = true;
    return { anyBold, anyBlue, anyComma, anyWrap, hdr: S.cells['A' + o.hr].value,
             saveClose: !!C.saveClose };
  });
  T('F1 board arrives RAW — nothing bold, no commas, no input colour, no wrap',
     !board.anyBold && !board.anyBlue && !board.anyComma && !board.anyWrap);
  T('F2 headers arrive lower-case, like a real paste', board.hdr === board.hdr.toLowerCase(), board.hdr);
  T('F3 saveClose declared (§1.0(e) closer)', board.saveClose);
  T('G1 zero page errors', errs.length === 0, errs.join(' | '));

  await browser.close();
  console.log('\n  ' + ok.length + '/' + (ok.length + bad.length) + ' checks pass');
  process.exit(bad.length ? 1 : 0);
})();
