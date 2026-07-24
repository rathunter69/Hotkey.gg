/* r421 DEPTH-PASS P0 E2E — the §2 platform mechanics, live in the real engine
   (dev/DEPTH_PASS.md §2.1/§2.2/§2.3/§2.5/§2.6/§2.7 + the §2.8 runtime invariant).
   Synthetic drills are injected into CHALLENGES so every mechanic is driven through
   real KeyboardEvents against a board built for that mechanic; real drills (foot,
   undo, pastes, margin) prove the split-capture invariant on live catalog boards.

   Covers:
     A. per-beat split capture on real drills — S.splits.length === checks.length at
        the win snapshot (§2.8), splits monotone, PB splits persisted (hk_pb_splits)
     B. in-run split display (.cl-split beside a done row) + post-run splits table
     C. bonus ☆ — never blocks the win / timer; card shows the ☆ verdict; one-time
        +15 xp latch; checklist renders the ☆ line + header star
     D. disclosed-error meter — meta.errorCount=N segments fill from the "(k/N)"
        counter label and LATCH (never un-fill within a run)
     E. touch-list declaration — build() touch:{cells,label}: visits latch with
        per-checkpoint times, S.touchGot drives counter labels, pips render
     F. tier ladder — parked region ("▸ unlocks") reveals when the gating checks
        grade; revealed cells land in S.cells; rails recompute
     G. mistakes-replay — offered on a non-clean / dropped-beat run, launches with
        ONLY the dropped beats graded, prefilled to the first dropped beat, scores
        nothing; identical-seed rebuild plumbing
     H. medal clocks — derivation (par×1.5/×1.15/×1.0), HOTKEY_CLOCKS override,
        start-strip + results row + PB chip icon

   Run:  python3 -m http.server 8791 &   (or any port; pass URL=)
         node dev/e2e-depth-mechanics.js                                        */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
let pass = 0, fail = 0;
const ok = (c, n, x) => { if (c) { pass++; console.log('  PASS ' + n); } else { fail++; console.log('  FAIL ' + n + (x !== undefined ? ' — ' + JSON.stringify(x) : '')); } };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_handle_cache', '');
  } catch (e) {} });
  await page.route('**/@supabase/**', r => r.abort());
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() =>
    typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function' &&
    typeof demoKey === 'function' && typeof hkSplitTick === 'function', null, { timeout: 15000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {}
    try { localStorage.removeItem('hk_pb_splits'); localStorage.removeItem('hk_bonus_star');
      localStorage.setItem('hk_xp_est', '0'); } catch (e) {} });

  // ---- synthetic drills for the opt-in declarations ----
  await page.evaluate(() => {
    const mkCells = () => { const c = {};
      c['A1'] = { ...blankCell(), value: 'Depth block', txt: true, bold: true };
      c['A2'] = { ...blankCell(), value: 'Alpha line', txt: true };
      c['A3'] = { ...blankCell(), value: 'Beta line', txt: true };
      c['A4'] = { ...blankCell(), value: 'Gamma line', txt: true };
      c['A5'] = { ...blankCell(), value: 'Delta memo', txt: true };
      return c; };
    const has = (S, ref) => { const x = S.cells[ref]; return !!(x && x.value !== null && x.value !== ''); };
    CHALLENGES.__depth = {
      name: 'Depth test', label: 'Depth test', par: 10, parKeys: 8,
      prompt: 'test board', req: 'test', aha: 'test aha',
      guide() { return ['a', 'b', 'c', 'd']; },
      targets() { return ['B2', 'B3', 'B4', 'B5']; },
      demo() { return [
        // §2.2 authoring rule: the ☆ beat is scripted BEFORE the final core beat —
        // the win fires the moment the cores complete
        { sel: 'B2', keys: [{ key: '1' }, { key: 'Enter' }] },
        { sel: 'B3', keys: [{ key: '2' }, { key: 'Enter' }] },
        { sel: 'B5', keys: [{ key: '4' }, { key: 'Enter' }] },
        { sel: 'B4', keys: [{ key: '3' }, { key: 'Enter' }] },
      ]; },
      build() { return { ROWS: 14, cells: mkCells(), active: { r: 2, c: 2 }, sel: null }; },
      checks(S) { return [
        { label: 'enter the Alpha figure', ok: has(S, 'B2') },
        { label: 'enter the Beta figure', ok: has(S, 'B3') },
        { label: 'enter the Gamma figure', ok: has(S, 'B4') },
        { label: 'enter the Delta memo — the extra credit', ok: has(S, 'B5'), bonus: true },
      ]; },
    };
    CHALLENGES.__err = {
      name: 'Err test', label: 'Err test', par: 10, parKeys: 6,
      prompt: 'test', req: 'test', aha: 'test',
      guide() { return ['a']; }, targets() { return ['B2']; },
      demo() { return [{ sel: 'B2', keys: [{ key: '1' }, { key: 'Enter' }] }]; },
      build() { const c = mkCells();
        c['B2'] = { ...blankCell(), value: 0 }; c['B3'] = { ...blankCell(), value: 0 }; c['B4'] = { ...blankCell(), value: 0 };
        return { ROWS: 14, cells: c, active: { r: 2, c: 2 }, sel: null }; },
      checks(S) { let found = 0;
        ['B2', 'B3', 'B4'].forEach(ref => { const x = S.cells[ref]; if (x && +x.value > 0) found++; });
        return [{ label: 'find and fix all 3 planted errors (' + found + '/3)', ok: found === 3 }]; },
    };
    window.HOTKEY_DRILLS.meta.__err = { name: 'Err test', label: 'Err test', tab: 'Err', desc: 'test', errorCount: 3 };
    CHALLENGES.__touch = {
      name: 'Touch test', label: 'Touch test', par: 10, parKeys: 6,
      prompt: 'test', req: 'test', aha: 'test',
      guide() { return ['a']; }, targets() { return ['C3']; },
      demo() { return [{ sel: 'B2', keys: [{ key: 'ArrowRight' }] }]; },
      build() { return { ROWS: 14, cells: mkCells(), active: { r: 2, c: 2 }, sel: null,
        touch: { cells: ['C3', 'E5', 'G7'], label: 'checkpoints' } }; },
      checks(S) { const got = S.touchGot || 0;
        return [{ label: 'land on every checkpoint (' + got + '/3)', ok: got === 3 }]; },
    };
    CHALLENGES.__tiers = {
      name: 'Tier test', label: 'Tier test', par: 10, parKeys: 8,
      prompt: 'test', req: 'test', aha: 'test',
      guide() { return ['a', 'b']; }, targets() { return ['B2', 'C9']; },
      demo() { return [
        { sel: 'B2', keys: [{ key: '1' }, { key: 'Enter' }] },
        { sel: 'C9', keys: [{ key: '2' }, { key: 'Enter' }] },
      ]; },
      build() { return { ROWS: 14, cells: mkCells(), active: { r: 2, c: 2 }, sel: null,
        tiers: [{ checks: [0],
          reveal: { 'B8': { value: 'Deep line', txt: true }, 'C8': { value: 42, fmtStyle: 'comma', decimals: 0 } },
          label: 'unlocks — the lower block' }] }; },
      checks(S) { const has2 = ref => { const x = S.cells[ref]; return !!(x && x.value !== null && x.value !== ''); };
        return [
          { label: 'enter the Alpha figure', ok: has2('B2') },
          { label: 'enter the Deep figure', ok: has2('C9') },
        ]; },
    };
    // celebration overlays install CAPTURE-phase key listeners that eat replay keys (the
    // r393 class) — clear them before every load, exactly like e2e-demo-replay does
    window.__clearCel = () => {
      try { window.__hkCelQ = []; } catch (e) {}
      document.querySelectorAll('.hk-cel-wrap').forEach(n => { try { n.click(); } catch (e) {} n.remove(); });
      try { window.__hkCelOpen = false; } catch (e) {}
      document.querySelectorAll('.wb-dlg').forEach(n => n.remove());
    };
    // register the synthetic drills in a real group so the sheet-tab strip renders for them
    ['__depth', '__err', '__touch', '__tiers'].forEach(k => {
      window.HOTKEY_DRILLS.groupOf[k] = 'Foundations';
      const g = window.HOTKEY_DRILLS.groups.find(x => x.name === 'Foundations');
      if (g && g.keys.indexOf(k) < 0) g.keys.push(k);
    });
  });
  const run = (fn, arg) => page.evaluate(fn, arg);
  const type = async (sel, ch) => run(o => { setDemoSel(o.sel); demoKey({ key: o.ch }); demoKey({ key: 'Enter' }); }, { sel, ch });

  console.log('A. split capture on real drills (§2.1 + §2.8 runtime invariant)');
  for (const key of ['foot', 'undo', 'pastes', 'margin']) {
    const r = await run((k) => {
      window.__clearCel();
      loadChallenge(k);
      const C = CHALLENGES[k];
      const moves = (typeof C.demo === 'function') ? C.demo.call(C) : C.demo;
      for (const mv of moves) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
      const items = C.checks(S);
      const sp = (S.splits || []).slice();
      const nn = sp.filter(x => x != null);
      let monotone = true;
      const latched = items.map((c, i) => c.ok ? sp[i] : null).filter(x => x != null).sort((a, b) => a - b);
      for (let i = 1; i < latched.length; i++) if (latched[i] < latched[i - 1]) monotone = false;
      let store = null; try { store = JSON.parse(localStorage.getItem('hk_pb_splits') || '{}')[k] || null; } catch (e) {}
      return { done, len: sp.length, checks: items.length, nn: nn.length, okN: items.filter(x => x.ok).length,
               monotone, stored: !!(store && Array.isArray(store.splits) && store.splits.length === items.length) };
    }, key);
    ok(r.done === true, key + ': demo replay wins with split capture live', r);
    ok(r.len === r.checks, key + ': S.splits.length === checks.length at the win snapshot', r);
    ok(r.nn === r.okN && r.monotone, key + ': every ok beat carries a split, cumulative order holds', r);
    ok(r.stored, key + ': PB splits persisted beside the PB (hk_pb_splits)', r);
  }

  console.log('B. in-run split display + post-run table');
  {
    const r1 = await run(() => {
      window.__clearCel();
      loadChallenge('__depth');
      setDemoSel('B2'); demoKey({ key: '1' }); demoKey({ key: 'Enter' });
      return {
        chips: document.querySelectorAll('#checklist .cl-split').length,
        done, split0: S.splits && S.splits[0],
      };
    });
    ok(r1.done === false && r1.chips === 1 && r1.split0 > 0, 'a completed row shows its split beside the ✓ mid-run', r1);
    const r2 = await run(() => {
      setDemoSel('B3'); demoKey({ key: '2' }); demoKey({ key: 'Enter' });
      setDemoSel('B4'); demoKey({ key: '3' }); demoKey({ key: 'Enter' });
      const m = document.getElementById('resultsModal');
      return { done, table: !!(m && m.querySelector('.rm-splits')), rows: m ? m.querySelectorAll('.rm-split').length : 0 };
    });
    ok(r2.done === true && r2.table && r2.rows === 4, 'results card carries the splits-vs-PB table (all beats, ☆ included)', r2);
  }

  console.log('C. bonus ☆ never blocks the win (§2.2)');
  {
    const r = await run(() => {
      const m = document.getElementById('resultsModal');
      const items = CHALLENGES.__depth.checks(S);
      return {
        done, running, bonusOk: items[3].ok,
        missed: !!(m && m.innerHTML.indexOf('☆ bonus missed') >= 0),
        splitsLen: (S.splits || []).length, bonusSplit: S.splits && S.splits[3],
        star: !!JSON.parse(localStorage.getItem('hk_bonus_star') || '{}').__depth,
      };
    });
    ok(r.done === true && r.running === false && r.bonusOk === false, 'core beats alone stop the clock — ☆ left undone', r);
    ok(r.missed, 'card reads "☆ bonus missed" (neutral, never red)', r);
    ok(r.splitsLen === 4 && r.bonusSplit == null, 'split array keeps the ☆ slot (null when missed)', r);
    ok(r.star === false, 'no bonus latch on a missed ☆', r);
    const r2 = await run(() => {
      const xp0 = parseInt(localStorage.getItem('hk_xp_est') || '0', 10);
      window.__clearCel(); hideResults(); loadChallenge('__depth');
      setDemoSel('B5'); demoKey({ key: '4' }); demoKey({ key: 'Enter' });   // ☆ first — costs live seconds, the intended tension
      const headStar = !!document.querySelector('#checklist .cl-star.on');
      const bonusRow = !!document.querySelector('#checklist .cl-item.cl-bonus');
      const preDone = done;
      setDemoSel('B2'); demoKey({ key: '1' }); demoKey({ key: 'Enter' });
      setDemoSel('B3'); demoKey({ key: '2' }); demoKey({ key: 'Enter' });
      setDemoSel('B4'); demoKey({ key: '3' }); demoKey({ key: 'Enter' });
      const m = document.getElementById('resultsModal');
      const xp1 = parseInt(localStorage.getItem('hk_xp_est') || '0', 10);
      return { preDone, headStar, bonusRow, done,
        cleared: !!(m && m.innerHTML.indexOf('☆ bonus cleared') >= 0),
        xpDelta: xp1 - xp0,
        star: !!JSON.parse(localStorage.getItem('hk_bonus_star') || '{}').__depth };
    });
    ok(r2.preDone === false && r2.headStar && r2.bonusRow, '☆ line renders + header star lights; bonus alone never wins', r2);
    ok(r2.done === true && r2.cleared && r2.star, 'card reads "☆ bonus cleared", latch stored', r2);
    ok(r2.xpDelta >= 15, 'first bonus clear pays the one-time +15 xp', r2);
    await run(() => { window.__clearCel(); hideResults(); loadChallenge('__depth'); });
    // the r2 win queues staggered celebrations (band tier, level-up) whose CAPTURE listeners
    // eat keys as they pop — drain the queue across a few ticks before replaying
    for (let i = 0; i < 4; i++) { await page.waitForTimeout(250); await run(() => window.__clearCel()); }
    const r3 = await run(() => {
      const xp0 = parseInt(localStorage.getItem('hk_xp_est') || '0', 10);
      const C = CHALLENGES.__depth;
      for (const mv of C.demo()) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
      const xp1 = parseInt(localStorage.getItem('hk_xp_est') || '0', 10);
      void xp0; void xp1;   // xp moves for the solve itself; the latch below is the assertion
      return { done };
    });
    const r3b = await run(() => JSON.parse(localStorage.getItem('hk_bonus_star') || '{}').__depth);
    ok(r3.done === true && r3b === 1, 'second bonus clear keeps the one-time latch (no re-pay)', { r3, r3b });
  }

  console.log('D. disclosed-error meter (§2.3)');
  {
    const r = await run(() => {
      window.__clearCel(); hideResults(); loadChallenge('__err');
      const seg0 = document.querySelectorAll('#checklist .hk-errmeter .em-seg').length;
      const on0 = document.querySelectorAll('#checklist .hk-errmeter .em-seg.on').length;
      setDemoSel('B2'); demoKey({ key: '5' }); demoKey({ key: 'Enter' });
      setDemoSel('B3'); demoKey({ key: '5' }); demoKey({ key: 'Enter' });
      const on2 = document.querySelectorAll('#checklist .hk-errmeter .em-seg.on').length;
      const lab2 = (document.querySelector('#checklist .hk-errmeter .em-lab') || {}).textContent || '';
      // break a fixed one — the meter must LATCH (never un-fill within a run)
      setDemoSel('B3'); demoKey({ key: '0' }); demoKey({ key: 'Enter' });
      const onL = document.querySelectorAll('#checklist .hk-errmeter .em-seg.on').length;
      const aria = (document.querySelector('#checklist .hk-errmeter') || { getAttribute: () => '' }).getAttribute('aria-label') || '';
      return { seg0, on0, on2, lab2, onL, aria, done };
    });
    ok(r.seg0 === 3 && r.on0 === 0, 'meter shows N=3 empty segments from meta.errorCount', r);
    ok(r.on2 === 2 && /found 2\/3/.test(r.lab2), 'segments fill from the "(k/3)" counter label', r);
    ok(r.onL === 2 && /found 2 of 3/.test(r.aria), 'segments latch — a re-broken error never un-fills the meter', r);
  }

  console.log('E. checkpoint touch-lists (§2.6)');
  {
    const r = await run(() => {
      window.__clearCel(); hideResults(); loadChallenge('__touch');
      const walk = (keys) => keys.forEach(k => demoKey({ key: k }));
      // B2 → C3
      walk(['ArrowRight', 'ArrowDown']);
      const got1 = S.touchGot, lab1 = (document.querySelector('#checklist .cl-label') || {}).textContent || '';
      const cellCls1 = (document.querySelector('#grid td[data-r="3"][data-c="3"]') || {}).className || '';
      // C3 → E5
      walk(['ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowDown']);
      const got2 = S.touchGot;
      // E5 → G7
      walk(['ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowDown']);
      const times = Object.keys(S.touch.times).length;
      const pips = document.querySelectorAll('#grid td.touchcell').length;
      const gotPips = document.querySelectorAll('#grid td.touchcell.touchgot').length;
      return { got1, lab1, cellCls1, got2, got3: S.touchGot, times, pips, gotPips, done };
    });
    ok(r.got1 === 1 && /\(1\/3\)/.test(r.lab1), 'first checkpoint latches; S.touchGot drives the counter label', r);
    ok(/touchgot/.test(r.cellCls1) && r.pips === 3, 'checkpoint pips render (3 marked cells, visited one lit)', r);
    ok(r.got2 === 2 && r.got3 === 3 && r.times === 3, 'all three latch with a per-checkpoint time each', r);
    ok(r.done === true, 'the touch-list check wins the drill through the normal grader', r);
  }

  console.log('F. tier ladder (§2.5)');
  {
    const r = await run(() => {
      window.__clearCel(); hideResults(); loadChallenge('__tiers');
      const before = {
        hidden: !S.cells['B8'],
        parked: /parked/.test((document.querySelector('#grid td[data-r="8"][data-c="2"]') || {}).className || ''),
        lab: !!document.querySelector('#grid .hk-parked-lab'),
      };
      setDemoSel('B2'); demoKey({ key: '1' }); demoKey({ key: 'Enter' });
      return { before,
        val: S.cells['B8'] && S.cells['B8'].value,
        num: S.cells['C8'] && S.cells['C8'].value,
        open: S.tiers[0].open };
    });
    await page.waitForTimeout(80);   // the reveal repaint lands on the next tick (outside the grading pass)
    const rF = await run(() => {
      const parked = /parked/.test((document.querySelector('#grid td[data-r="8"][data-c="2"]') || {}).className || '');
      setDemoSel('C9'); demoKey({ key: '2' }); demoKey({ key: 'Enter' });
      return { parked, done };
    });
    ok(r.before.hidden && r.before.parked && r.before.lab, 'tier region parks: cells absent, dim fill + "▸ unlocks" tag', r.before);
    ok(r.open && r.val === 'Deep line' && r.num === 42 && !rF.parked, 'tier reveal paints in live once its checks grade', { r, rF });
    ok(rF.done === true, 'post-reveal beats grade normally to the win', rF);
  }

  console.log('G. mistakes-replay (§2.7)');
  {
    // identical-seed rebuild plumbing (real randomized drill)
    const rs = await run(() => {
      const sig = () => Object.keys(S.cells).sort().map(k => k + '=' + String(S.cells[k].value)).join('|');
      window.__forceSeed = 12345; loadChallenge('foot'); const a = sig();
      window.__forceSeed = 12345; loadChallenge('foot'); const b = sig();
      window.__forceSeed = 54321; loadChallenge('foot'); const c = sig();
      return { same: a === b, diff: a !== c };
    });
    ok(rs.same, 'same seed rebuilds the identical board (the rep replays THIS board)', rs);
    ok(rs.diff, 'different seed still varies the board (randomization intact)', rs);

    // non-clean run + missed ☆ → offer targets the dropped beats
    const r1 = await run(() => {
      window.__clearCel(); hideResults(); loadChallenge('__depth');
      mouseUsed = true;   // a non-clean run
      setDemoSel('B2'); demoKey({ key: '1' }); demoKey({ key: 'Enter' });
      setDemoSel('B3'); demoKey({ key: '2' }); demoKey({ key: 'Enter' });
      setDemoSel('B4'); demoKey({ key: '3' }); demoKey({ key: 'Enter' });
      const m = document.getElementById('resultsModal');
      const btn = m ? m.querySelector('.rm-key[data-act="micro"]') : null;
      return { done, offer: window.__microOffer && window.__microOffer.targets,
               btnTxt: btn ? btn.textContent : null, pb: PB.__depth === undefined ? null : PB.__depth };
    });
    ok(r1.done === true && String(r1.offer) === '3', 'non-clean run offers the rep on the dropped ☆ beat', r1);
    ok(/redo the beats you dropped/.test(r1.btnTxt || ''), 'card carries "redo the beats you dropped" (r)', r1);
    // r422: r1's mouseUsed win freshens the "Old Habits" achievement, and the 450ms-staggered
    // sweep (scheduled at the PRIOR loadChallenge) can pop its celebration right here — whose
    // CAPTURE listener would eat the 'r'. Same wall-clock race section C drains; drain it here
    // too, WITHOUT closing the results card (its ☆ offer is what 'r' launches).
    for (let i = 0; i < 4; i++) { await page.waitForTimeout(250); await run(() => { try { window.__hkCelQ = [];
      document.querySelectorAll('.hk-cel-wrap').forEach(n => { n.click(); n.remove(); });
      window.__hkCelOpen = false; } catch (e) {} }); }
    const r2 = await run(() => {
      const xp0 = parseInt(localStorage.getItem('hk_xp_est') || '0', 10);
      /* r422 flake fix: the r1 win is this profile's first MOUSE-flagged win, so the achievement
         sweep opens a celebration card ("Old Habits") asynchronously — when the machine is slow
         enough its capture-phase keydown listener is live by now and EATS the 'r' (base-reproducible,
         timing-dependent). A real player dismisses the card on the results screen; do the same. */
      window.__clearCel();
      demoKey({ key: 'r' });   // launch from the results card
      const items = CHALLENGES.__depth.checks(S);
      return {
        live: !!microRun, targets: microRun && microRun.targets,
        pre: [items[0].ok, items[1].ok, items[2].ok, items[3].ok],
        head: (document.querySelector('#checklist .cl-head') || {}).textContent || '',
        preRows: document.querySelectorAll('#checklist .cl-item.cl-pre').length,
        done, xp0,
      };
    });
    ok(r2.live && String(r2.targets) === '3' && r2.done === false, 'r launches the rep — fresh clock, rep state armed', r2);
    ok(String(r2.pre) === 'true,true,true,false', 'board prefilled to the first dropped beat (cores done, ☆ open)', r2);
    ok(/replay/.test(r2.head) && r2.preRows === 3, 'checklist flips to replay mode — non-target beats dim as pre-done', r2);
    const r3 = await run((xp0) => {
      setDemoSel('B5'); demoKey({ key: '4' }); demoKey({ key: 'Enter' });
      const m = document.getElementById('resultsModal');
      const xp1 = parseInt(localStorage.getItem('hk_xp_est') || '0', 10);
      return { done, rep: !!(m && m.innerHTML.indexOf('rep complete') >= 0),
               pb: PB.__depth === undefined ? null : PB.__depth, xpDelta: xp1 - xp0 };
    }, r2.xp0);
    ok(r3.done === true && r3.rep, 'completing only the targeted beat finishes the rep', r3);
    ok(r3.pb === r1.pb && r3.xpDelta === 0, 'the rep scores nothing — PB untouched, no XP, no post', { was: r1.pb, now: r3.pb, xp: r3.xpDelta });

    // dropped-core-beat path on a CLEAN run: regress a beat mid-run → targets exactly it
    const r4 = await run(() => {
      hideResults(); microRun = null; loadChallenge('__depth');
      setDemoSel('B2'); demoKey({ key: '1' }); demoKey({ key: 'Enter' });
      setDemoSel('B2'); demoKey({ key: 'Delete' });          // the beat BREAKS mid-run — a dropped beat
      setDemoSel('B2'); demoKey({ key: '1' }); demoKey({ key: 'Enter' });
      setDemoSel('B5'); demoKey({ key: '4' }); demoKey({ key: 'Enter' });   // ☆ cleared — keep it out of the drop list
      setDemoSel('B3'); demoKey({ key: '2' }); demoKey({ key: 'Enter' });
      setDemoSel('B4'); demoKey({ key: '3' }); demoKey({ key: 'Enter' });
      return { done, offer: window.__microOffer && window.__microOffer.targets.slice() };
    });
    ok(r4.done === true && String(r4.offer) === '0', 'a clean run with a regressed beat offers exactly that beat', r4);
    const r5 = await run(() => {
      const m = document.getElementById('resultsModal');
      const btn = m ? m.querySelector('.rm-key[data-act="micro"]') : null;
      if (btn) btn.click();
      const items = CHALLENGES.__depth.checks(S);
      const others = [items[1].ok, items[2].ok, items[3].ok];
      setDemoSel('B2'); demoKey({ key: '9' }); demoKey({ key: 'Enter' });
      const m2 = document.getElementById('resultsModal');
      return { live: !!microRun || done, others: String(others),
               rep: !!(m2 && m2.innerHTML.indexOf('rep complete') >= 0), done };
    });
    ok(r5.others === 'false,false,false' && r5.rep && r5.done === true,
      'the rep grades ONLY the dropped beat — the other beats stay open and never block', r5);
    const r6 = await run(() => { loadChallenge('__depth'); return { cleared: microRun === null || microRun === undefined ? true : !microRun }; });
    ok(r6.cleared === true, 'any board load clears a live rep (esc·esc / shift+f11 safe)', r6);
  }

  console.log('H. medal clocks (§2.1 display layer)');
  {
    const r = await run(() => {
      window.__clearCel(); hideResults(); loadChallenge('foot');   // par 11
      const c = hkClocksFor('foot');
      const ready = (document.getElementById('result') || {}).innerHTML || '';
      const beat = hkClockBeat('foot', 12);   // between pro (12.65) and legendary (11)
      window.HOTKEY_CLOCKS.foot = { pass: 100 };
      const c2 = hkClocksFor('foot');
      delete window.HOTKEY_CLOCKS.foot;
      return {
        pass: c.pass, pro: +c.pro.toFixed(2), leg: c.leg,
        strip: /pass 0:17/.test(ready) && /pro 0:13/.test(ready) && /legendary 0:11/.test(ready),
        beatN: beat && beat.beat && beat.beat.n, nextN: beat && beat.next && beat.next.n,
        oPass: c2.pass, oLeg: c2.leg,
      };
    });
    ok(r.pass === 16.5 && r.pro === 12.65 && r.leg === 11, 'clocks derive pass=par×1.5 · pro=par×1.15 · legendary=par×1.0', r);
    ok(r.strip, 'drill-start line carries the three-clock strip', r);
    ok(r.beatN === 'Pro' && r.nextN === 'Legendary', 'clock naming: the one you beat + the next one up', r);
    ok(r.oPass === 100 && r.oLeg === 11, 'HOTKEY_CLOCKS override wins per field, the rest still derive', r);
    const r2 = await run(() => {
      const C = CHALLENGES.foot;
      for (const mv of C.demo()) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
      const m = document.getElementById('resultsModal');
      const row = m ? m.querySelector('.rm-clock') : null;
      renderSheetTabs();
      return { done, row: row ? row.textContent : null,
               ico: !!document.querySelector('#sheetTabs .st-pb .hk-clockico') };
    });
    ok(r2.done && /Legendary/.test(r2.row || ''), 'results card names the clock the run beat', r2);
    ok(r2.ico, 'PB chip wears the best clock icon', r2);
  }

  console.log('Z. page errors');
  ok(errs.length === 0, 'zero page errors across the suite', errs.slice(0, 4));

  await browser.close();
  console.log('\nDEPTH-MECHANICS: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR: ' + (e && e.message || e)); process.exit(1); });
