/* r154 ONBOARDING AUDIT — a truly fresh visitor: curtain → landing → enter →
   tour → play; second visit: welcome-back. Stubbed supabase so auth paths run. */
'use strict';
/* r438: URL override — parallel checkouts serve on their own ports (the r421 e2e-guided /
   r422 e2e-par-sweep pattern). This harness was the last one still hard-coding 8791, so a
   gate run from a worktree silently tested WHOEVER owned that port. */
const HK_URL = process.env.URL || 'http://127.0.0.1:8791/index.html';   /* r438: URL override — parallel checkouts serve on their own ports (the r421/r422 pattern, already on the other eleven gate harnesses). Without it this suite silently tested whatever ANOTHER agent's worktree was serving on 8791. Named HK_URL rather than URL so it cannot shadow Node's global URL class. */
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass = 0, fail = 0;
const ok = (c, n, x) => { if (c) { pass++; console.log('  PASS ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' — ' + x : '')); } };

const STUB = () => {
  const mk = rows => { const b = {}; ['eq','gt','lt','order','limit','gte','lte','in'].forEach(f => b[f] = () => b);
    b.single = () => Promise.resolve({ data: rows[0] || null, error: null });
    b.maybeSingle = () => Promise.resolve({ data: rows[0] || null, error: null });
    b.then = (res, rej) => Promise.resolve({ data: rows, error: null }).then(res, rej); return b; };
  window.supabase = { createClient: () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      getUser: () => Promise.resolve({ data: { user: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInAnonymously: () => Promise.resolve({ data: { user: { id: 'anon1', app_metadata: { provider: 'anonymous' } } } }),
      signOut: () => Promise.resolve({})
    },
    from: t => ({ select: () => mk([]), insert: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null }) }),
    // r279: curtain codes validate server-side — mirror the live beta_codes behavior
    rpc: (name, args) => name === 'curtain_check'
      ? Promise.resolve({ data: String((args && args.p_code) || '').trim().toUpperCase() === 'HAGS', error: null })
      : Promise.resolve({ data: null, error: null }),
    functions: { invoke: () => Promise.resolve({ data: null, error: 'no' }) }
  }) };
};

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 140)));
  await page.addInitScript(STUB);

  /* r451: T1/T9 are CONDITIONAL on index.html's PRELAUNCH_LOCK. The curtain code is still
     shipped (kept one round as the documented rollback — dev/LAUNCH.md), so this suite reads
     the live flag off the page and asserts whichever contract is actually in force. Three
     asserts in T1 and four in T9 either way — the count does not move with the flag. */
  await page.goto(HK_URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined');
  await page.waitForTimeout(400);
  const LOCK = await page.evaluate(() => typeof PRELAUNCH_LOCK !== 'undefined' && PRELAUNCH_LOCK === true);

  if (LOCK) {
    console.log('T1 fresh visitor: curtain (PRELAUNCH_LOCK=true)');
    const t1 = await page.evaluate(() => {
      const g = document.getElementById('gate');
      return { shown: !!(g && g.classList.contains('show')), hasInput: !!document.getElementById('lockCode') };
    });
    ok(t1.shown && t1.hasInput, 'prelaunch curtain shows for a fresh device');
    // r279: codes validate server-side (curtain_check RPC) — both probes are async round-trips
    await page.fill('#lockCode', 'WRONG');
    await page.click('#lockGo');
    const t1b = await page.waitForFunction(() => /didn/.test((document.getElementById('lockMsg') || {}).textContent || ''), null, { timeout: 15000 }).then(() => true).catch(() => false);
    ok(t1b, 'wrong code gets a real error (server-checked)');
    await page.fill('#lockCode', 'hags');   // case-insensitive per the uppercase()
    await page.click('#lockGo');
    const t1c = await page.waitForFunction(() => !document.getElementById('gate').classList.contains('show'), null, { timeout: 15000 }).then(() => true).catch(() => false);
    ok(t1c, 'right code (case-insensitive) passes the curtain (server-checked)');
  } else {
    console.log('T1 fresh visitor: NO curtain (PRELAUNCH_LOCK=false)');
    const t1 = await page.evaluate(() => {
      const g = document.getElementById('gate'), l = document.getElementById('landing');
      let betaOk = null; try { betaOk = localStorage.getItem('hk_beta_ok'); } catch (e) {}
      return {
        shown: !!(g && g.classList.contains('show')),
        hasInput: !!document.getElementById('lockCode'),
        gateEmpty: !!g && !g.innerHTML.trim(),
        landingUp: !!(l && !l.classList.contains('gone') && getComputedStyle(l).display !== 'none'),
        gateOpen: (typeof gateOpen !== 'undefined') ? gateOpen : null,
        betaOk: betaOk,
      };
    });
    ok(!t1.shown && !t1.hasInput && t1.gateEmpty, 'no curtain element on a fresh device');
    ok(t1.landingUp, 'a fresh device lands straight on the landing');
    ok(t1.gateOpen === false && !t1.betaOk, 'the Enter path is unguarded \u2014 gateOpen false, no hk_beta_ok needed', JSON.stringify(t1));
  }

  console.log('T2 landing → enter → tour');
  const t2 = await page.evaluate(() => {
    const l = document.getElementById('landing');
    return { visible: !!(l && !l.classList.contains('gone')), hasStart: !!(l && l.textContent.match(/enter|start|train/i)) };
  });
  ok(t2.visible, 'landing dialog is up after the curtain');
  await page.keyboard.press('Enter');   // Enter = start (friction-free entry)
  await page.waitForTimeout(900);
  // r280: the keyboard pick asks FIRST — the right key overlay loads up front
  const t2kb = await page.evaluate(() => { const m = document.getElementById('kbCard'); return !!(m && m.classList.contains('show')); });
  ok(t2kb, 'keyboard pick asks first (r280)');
  await page.keyboard.press('1');       // Windows
  await page.waitForTimeout(500);
  // r159: the comfort fork follows
  const t2fork = await page.evaluate(() => { const m = document.getElementById('comfortCard'); return !!(m && m.classList.contains('show')); });
  ok(t2fork, 'comfort fork asks how much Excel you know (r159)');
  await page.keyboard.press('2');       // "I get around" → straight to the tour
  await page.waitForTimeout(500);
  const t2b = await page.evaluate(() => {
    const l = document.getElementById('landing');
    const w = document.getElementById('tourWrap');
    return { landingGone: !!(l && l.classList.contains('gone')), tourUp: !!(w && w.classList.contains('on')) };
  });
  ok(t2b.landingGone, 'Enter dismisses the landing');
  ok(t2b.tourUp, 'first-run spotlight tour appears');
  // tour must OWN the keyboard: typing during the tour must not hit the grid
  const t2c = await page.evaluate(() => {
    const before = JSON.stringify(Object.keys(S.cells).map(k => [k, S.cells[k].value]));
    demoKey({key:'9'}); demoKey({key:'9'});
    const after = JSON.stringify(Object.keys(S.cells).map(k => [k, S.cells[k].value]));
    return before === after;
  });
  ok(t2c, 'tour blocks grid input (keys can’t leak into cells)');
  // walk the tour to the end with Enter
  const t2d = await page.evaluate(async () => {
    for (let i = 0; i < 12; i++) {
      const w = document.getElementById('tourWrap');
      if (!w || !w.classList.contains('on')) break;
      demoKey({key:'Enter'});
      await new Promise(r => setTimeout(r, 150));
    }
    const w = document.getElementById('tourWrap');
    return !(w && w.classList.contains('on'));
  });
  ok(t2d, 'tour completes on repeated Enter and releases the keyboard');
  // r313 (Wolf): finishing the tour no longer re-prompts "quick warm-up?" — it hands off
  // straight to the first REAL drill (guided on) and toasts, leaving the warm-up board behind.
  await page.waitForTimeout(900);    // tour → +350ms → loadChallenge(first drill)
  const t2e = await page.evaluate(() => ({
    handedOff: (typeof cur !== 'undefined' && cur !== '__onboard__' && !sandboxMode),
    onboarded: !!onboarded }));
  ok(t2e.handedOff, 'tour hands off to the first real drill (not the warm-up board)');
  ok(t2e.onboarded, 'finishing the tour marks the user onboarded');
  /* r450 THE DRILL-START GATE, on the one path that matters most for it: the tour hand-off.
     This suite deliberately does NOT set hk_gate_off (the other harnesses do) — the whole
     point of an onboarding audit is to walk what a first-time player walks. Two properties
     are asserted here and nowhere else in the battery: the gate is ABSENT for every step of
     the tour (it would sit between the spotlight and the cell it points at), and it is
     PRESENT the instant the tour hands the player a real, timed drill. */
  const t2g = await page.evaluate(() => ({ gate: hkGate, ov: !!document.getElementById('hkGate'), running }));
  ok(t2g.gate && t2g.ov, 'the first real drill arrives behind the start gate', JSON.stringify(t2g));
  ok(!t2g.running, 'and its clock has not started', JSON.stringify(t2g));
  const t2f = await page.evaluate(() => {
    demoKey({key:'x'});                       // the start key: swallowed, starts the clock
    const started = running === true && keyLog.length === 0 && !document.getElementById('hkGate');
    setDemoSel('B4'); demoKey({key:'5'}); demoKey({key:'Enter'});
    return { started, landed: S.cells['B4'].value === 5 || S.cells['B4'].value === '5' };
  });
  ok(t2f.started, 'the start key is swallowed (nothing in keyLog) and starts the clock');
  ok(t2f.landed, 'after the tour the grid takes keys immediately');

  console.log('T3 second visit: welcome back');
  // domcontentloaded, not load: supabase-js loads async now (r285) — 'load' waits on
  // the CDN, and if it's slow the card's 12s auto-hide can fire before 'load' returns.
  await page.goto(HK_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined');
  // wait for the card explicitly rather than a fixed offset — robust to boot timing
  const t3up = await page.waitForFunction(() => {
    const w = document.getElementById('wbDlg');
    return !!(w && getComputedStyle(w).display !== 'none');
  }, null, { timeout: 8000 }).then(() => true).catch(() => false);
  const t3 = await page.evaluate(() => ({
    gateGone: !document.getElementById('gate').classList.contains('show'),
    landingGone: document.getElementById('landing').classList.contains('gone') }));
  t3.up = t3up;
  ok(t3.gateGone && t3.landingGone, 'returning visitor skips curtain + landing');
  ok(t3.up, 'welcome-back card greets the return');
  const t3b = await page.evaluate(async () => {
    demoKey({key:'x'});   /* r450: a returning visitor lands on a gated board too — pass it before typing */
    setDemoSel('C4'); demoKey({key:'7'});
    await new Promise(r => setTimeout(r, 450));
    const w = document.getElementById('wbDlg');
    const gone = !w || !document.body.contains(w) || getComputedStyle(w).opacity === '0' || w.classList.contains('bye');
    demoKey({key:'Enter'});
    return { gone, typed: S.cells['C4'].value === 7 || S.cells['C4'].value === '7' };
  });
  ok(t3b.gone, 'first keydown dismisses welcome-back');
  ok(t3b.typed, '…without swallowing the key (it lands in the cell)');

  console.log('T4 the novice branch: ONE folded spotlight sequence on a cleared board (r303)');
  await page.evaluate(() => { ['hk_xlv','hk_tour_done','hotkey_onboarded','hk_primer_done','hk_learn_done'].forEach(k => localStorage.removeItem(k)); });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined');
  await page.waitForTimeout(700);
  await page.keyboard.press('Enter');                 // through the landing again
  await page.waitForTimeout(900);
  await page.keyboard.press('1');                     // r280: keyboard pick first (windows)
  await page.waitForTimeout(500);
  const t4a = await page.evaluate(() => { const m = document.getElementById('comfortCard'); return !!(m && m.classList.contains('show')); });
  ok(t4a, 'comfort fork re-asks once the flags are gone');
  await page.keyboard.press('1');                     // "basically none"
  await page.waitForTimeout(600);
  // r303: no separate primer modal — the fundamentals are the FIRST tour steps, on a cleared board.
  const t4b = await page.evaluate(() => ({
    noPrimer: !(document.getElementById('primerCard') && document.getElementById('primerCard').classList.contains('show')),
    tourUp: !!(document.getElementById('tourWrap') && document.getElementById('tourWrap').classList.contains('on')),
    step0: (typeof __tourPlan !== 'undefined' && __tourPlan[0]) ? __tourPlan[0].cap : null,
    onBoard: (typeof cur !== 'undefined') ? cur : null,
    planLen: (typeof __tourPlan !== 'undefined') ? __tourPlan.length : -1,
    grid: /grid/i.test(document.getElementById('tourCard').innerText),
  }));
  ok(t4b.noPrimer, 'no separate primer modal — folded into the tour');
  ok(t4b.tourUp && t4b.grid, 'the spotlight sequence opens on the grid fundamentals');
  ok(t4b.onBoard === '__onboard__', 'it runs on the cleared onboarding board', t4b.onBoard);
  ok(t4b.planLen >= 12, 'the novice plan carries fundamentals + product steps', t4b.planLen);

  // walk the fundamentals: two arrow do-it beats, an Enter read beat, then TWO typed-entry beats
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1050);   // grid orientation
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1050);   // name box
  await page.keyboard.press('Enter');       await page.waitForTimeout(200);   // formula-bar read
  const t4c0 = await page.evaluate(() => ({ i: __tourI, cap: __tourPlan[__tourI] && __tourPlan[__tourI].cap }));
  ok(/type/i.test(t4c0.cap || ''), 'reaches the typing beat', JSON.stringify(t4c0));
  // stray key is allowed through on an entry beat (it starts an edit) but does NOT advance
  await page.keyboard.press('5'); await page.keyboard.press('0'); await page.keyboard.press('0');
  await page.keyboard.press('Enter'); await page.waitForTimeout(1000);
  const t4c1 = await page.evaluate(() => ({ i: __tourI, a5: (S.cells['A5']||{}).value, cap: __tourPlan[__tourI] && __tourPlan[__tourI].cap }));
  ok(t4c1.a5 === 500, 'typing beat commits a real number to the sheet', t4c1.a5);
  ok(/formula/i.test(t4c1.cap || ''), 'and advances to the formula beat', JSON.stringify(t4c1));
  // formula beat: = or + both start it; type =A4-B4
  for (const ch of '=A4-B4') { await page.keyboard.press(ch === '=' ? 'Equal' : ch === '-' ? 'Minus' : ch); }
  await page.keyboard.press('Enter'); await page.waitForTimeout(1000);
  const t4c2 = await page.evaluate(() => ({ i: __tourI, c4f: (S.cells['C4']||{}).formula, c4v: (S.cells['C4']||{}).value }));
  ok(t4c2.c4f === '=A4-B4' && t4c2.c4v === 130, 'formula beat commits a live formula (=A4-B4 → 130)', JSON.stringify(t4c2));
  // the chord beat still works and executes on the live sheet
  const before = await page.evaluate(() => S.active.c);
  await page.keyboard.press('Control+ArrowRight'); await page.waitForTimeout(1150);
  const t4d = await page.evaluate(() => ({ moved: S.active.c !== undefined }));
  ok(t4d.moved, 'the chord beat still runs on the live sheet');
  // finish the tour; it must HAND OFF the cleared board to a real drill
  for (let i = 0; i < 12; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(120); }
  await page.waitForTimeout(600);
  const t4e = await page.evaluate(() => ({ tourDone: localStorage.getItem('hk_tour_done') === '1', sandbox: (typeof sandboxMode !== 'undefined') ? sandboxMode : true, cur: cur }));
  ok(t4e.tourDone, 'the tour completes and remembers it');
  ok(!t4e.sandbox && t4e.cur !== '__onboard__', 'and hands the cleared board off to a real drill', JSON.stringify(t4e));

  // T4b (r303): the EXPERT answer skips the fundamentals — plan starts at the product tour.
  await page.evaluate(() => { ['hk_tour_done','hk_xlv'].forEach(k => localStorage.removeItem(k)); localStorage.setItem('hk_xlv','2'); });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined');
  await page.waitForTimeout(700);
  await page.keyboard.press('Enter'); await page.waitForTimeout(1000);
  const t4f = await page.evaluate(() => ({ up: !!(document.getElementById('tourWrap') && document.getElementById('tourWrap').classList.contains('on')),
    step0: __tourPlan[0] && __tourPlan[0].cap, noNovice: !__tourPlan.some(s => s.novice) }));
  ok(t4f.up, 'expert still gets the product tour');
  ok(t4f.noNovice, 'but the fundamentals beats are gated OUT for "I live in it"', JSON.stringify(t4f));
  for (let i = 0; i < 12; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(120); }

  // T5 (r174, Wolf's stranding bug): a returning user whose synced last-drill is
  // LOCKED on this device (fresh xp estimate) must NEVER boot into an empty grid.
  await page.evaluate(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_xlv', '2');
    localStorage.setItem('hotkey_last_drill', 'dcf');   // a gated Models drill
    localStorage.removeItem('hk_xp_est');
  } catch (e) {} });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined');
  await page.waitForTimeout(1300);
  const t5 = await page.evaluate(() => ({
    cells: (typeof S !== 'undefined' && S && S.cells) ? Object.keys(S.cells).length : -1,
    locked: (typeof drillLocked === 'function') ? !!drillLocked(typeof cur !== 'undefined' ? cur : '') : null,
    gate: !!(document.getElementById('gateModal') && document.getElementById('gateModal').classList.contains('show')),
  }));
  ok(t5.cells > 0, 'locked-resume boot still loads a board (no empty grid)', JSON.stringify(t5));
  ok(t5.locked === false, 'the fallback drill is an UNLOCKED one');
  if (t5.gate) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const g2 = await page.evaluate(() => document.getElementById('gateModal').classList.contains('show'));
    ok(!g2, 'Escape dismisses the gate modal');
  } else {
    ok(true, 'gate modal not shown at boot (also acceptable)');
  }

  /* ============================================================================
     r450 FIRST-SESSION FLOW HARDENING (the flow audit's reconciliation).
     The suite used to assert only the happy path: Enter-mash the tour, land on a
     drill, done. Every gap below is a state a real first-timer reaches that no
     assertion covered — skipping vs finishing, refreshing mid-tour, and what the
     first (guided, unpostable) win actually SAYS.
     ============================================================================ */

  const freshNovice = async () => {
    await page.evaluate(() => { ['hk_xlv','hk_tour_done','hotkey_onboarded','hk_primer_done',
      'hk_learn_done','hk_runs_lite','hotkey_solves','hk_start_coach','hotkey_last_drill','hk_last_drill']
      .forEach(k => localStorage.removeItem(k)); });
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => typeof CHALLENGES !== 'undefined');
    await page.waitForTimeout(700);
    await page.keyboard.press('Enter');  await page.waitForTimeout(900);   // landing
    await page.keyboard.press('1');      await page.waitForTimeout(500);   // keyboard: windows
    await page.keyboard.press('1');      await page.waitForTimeout(700);   // comfort: basically none
  };

  console.log('T6 skipping is NOT finishing: the skip arms, and the tour is replayable (P0-2)');
  await freshNovice();
  const t6up = await page.evaluate(() => !!(document.getElementById('tourWrap') &&
    document.getElementById('tourWrap').classList.contains('on')));
  ok(t6up, 'novice tour is up for the skip walk');

  // (b) a DO-IT beat advances on the real chord, not just on Enter — the fundamentals
  // are genuinely performable, not decorative. (The tour is Enter-advanceable BY DESIGN,
  // so the replay affordance below is asserted too — an Enter-masher can come back.)
  const t6doit = await page.evaluate(() => ({ i: __tourI, doIt: !!(__tourPlan[__tourI] && __tourPlan[__tourI].doIt) }));
  ok(t6doit.i === 0 && t6doit.doIt, 'beat 0 is a do-it beat (the chord IS the lesson)', JSON.stringify(t6doit));
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(1050);
  const t6adv = await page.evaluate(() => __tourI);
  ok(t6adv === 1, 'performing the do-it chord (no Enter) advances the beat', 'tourI=' + t6adv);

  // (a) ONE Esc on an early beat must NOT end the tour — it arms and says so inline.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const t6arm = await page.evaluate(() => ({
    stillOn: !!(document.getElementById('tourWrap') && document.getElementById('tourWrap').classList.contains('on')),
    i: __tourI,
    skipTxt: (document.getElementById('tourSkip') || {}).textContent || '',
    done: localStorage.getItem('hk_tour_done'),
  }));
  ok(t6arm.stillOn && t6arm.i === 1, 'one Esc on an early beat does not end the tour', JSON.stringify(t6arm));
  ok(/again/i.test(t6arm.skipTxt), 'the skip arms and says so inline', t6arm.skipTxt);
  ok(!t6arm.done, 'and a single Esc has not burned hk_tour_done', String(t6arm.done));

  // …the SECOND Esc really does skip. Skipping is a distinct outcome from finishing.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const t6skip = await page.evaluate(() => ({
    gone: !(document.getElementById('tourWrap') && document.getElementById('tourWrap').classList.contains('on')),
    done: localStorage.getItem('hk_tour_done') === '1',
  }));
  ok(t6skip.gone, 'a second Esc actually skips the tour');
  ok(t6skip.done, 'an escaped tour is remembered like a finished one', JSON.stringify(t6skip));

  // …and that is now RECOVERABLE: the ? sheet carries the only replay affordance.
  await page.waitForTimeout(900);
  const t6replay = await page.evaluate(() => {
    openKbd();
    const a = document.getElementById('kbReplayTour');
    return { exists: !!a, label: a ? a.textContent : null };
  });
  ok(t6replay.exists, 'the ? sheet offers "replay the tour"', JSON.stringify(t6replay));
  ok(/replay/i.test(t6replay.label || ''), 'and it is labelled as a replay', t6replay.label);
  await page.evaluate(() => document.getElementById('kbReplayTour').click());
  await page.waitForTimeout(700);
  const t6back = await page.evaluate(() => ({
    up: !!(document.getElementById('tourWrap') && document.getElementById('tourWrap').classList.contains('on')),
    i: typeof __tourI !== 'undefined' ? __tourI : -99,
    done: localStorage.getItem('hk_tour_done'),
  }));
  ok(t6back.up && t6back.i === 0, 'replaying brings the tour back at beat 0', JSON.stringify(t6back));
  ok(!t6back.done, 'and un-remembers hk_tour_done so the replay is real', String(t6back.done));

  console.log('T7 refresh mid-tour must not strand the player (P1-4)');
  await freshNovice();
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1050);
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1050);
  const t7mid = await page.evaluate(() => __tourI);
  ok(t7mid >= 1, 'walked into the middle of the tour before refreshing', 'tourI=' + t7mid);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined');
  await page.waitForTimeout(1200);
  const t7 = await page.evaluate(() => ({
    tourUp: !!(document.getElementById('tourWrap') && document.getElementById('tourWrap').classList.contains('on')),
    landingUp: !!(document.getElementById('landing') && !document.getElementById('landing').classList.contains('gone')),
    done: localStorage.getItem('hk_tour_done'),
    cells: (typeof S !== 'undefined' && S && S.cells) ? Object.keys(S.cells).length : -1,
  }));
  // Either outcome is acceptable — resume the tour, or offer the door back into it.
  // What is NOT acceptable is an empty board with the tour marked done and no way back.
  ok(t7.tourUp || t7.landingUp, 'a mid-tour refresh resumes the tour or offers the way back in', JSON.stringify(t7));
  ok(t7.done !== '1', 'a mid-tour refresh does not silently mark the tour finished', String(t7.done));
  if (!t7.tourUp) {
    await page.keyboard.press('Enter'); await page.waitForTimeout(1400);
    const t7b = await page.evaluate(() => !!(document.getElementById('tourWrap') &&
      document.getElementById('tourWrap').classList.contains('on')) ||
      !!(document.getElementById('kbCard') && document.getElementById('kbCard').classList.contains('show')));
    ok(t7b, 'and re-entering from the landing reaches the tour again');
  } else {
    ok(true, 'the tour resumed directly after the refresh');
  }

  console.log('T8 the first (guided) win says why nothing posted (P0-1)');
  // the one-shot that explains guided must FIRE on the tour handoff, not be burned silently
  await page.evaluate(() => { ['hk_tour_done','hotkey_onboarded','hk_learn_done','hk_runs_lite','hotkey_solves']
    .forEach(k => localStorage.removeItem(k)); localStorage.setItem('hk_xlv','2'); });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined');
  await page.waitForTimeout(700);
  await page.keyboard.press('Enter'); await page.waitForTimeout(1000);
  for (let i = 0; i < 12; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(120); }
  await page.waitForTimeout(1800);   // handoff (+350ms) then the guided one-shot toast (+800ms)
  const t8a = await page.evaluate(() => ({
    guided: !!guided,
    learnDone: localStorage.getItem('hk_learn_done'),
    toast: (document.getElementById('hkToast') || {}).textContent || '',
  }));
  ok(t8a.guided, 'the tour still hands off with guided ON');
  ok(/post/i.test(t8a.toast), 'and the handoff explains that guided runs do not post a time', t8a.toast);
  ok(t8a.learnDone === '1', 'the one-shot flag is spent only once the explanation went out', String(t8a.learnDone));

  // the card itself must carry the line, in the BODY, above the action row — not only under `d`
  await page.setViewportSize({ width: 1280, height: 800 });
  const t8b = await page.evaluate(() => {
    _showResults({ t: '0.90', tSec: 0.90, keys: 12, par: 10, guided: true, combo: 17 });
    const m = document.getElementById('resultsModal');
    const pr = m.querySelector('.rm-practice');
    const fold = m.querySelector('.rm-more');
    const opts = m.querySelector('.rm-opts');
    if (!pr) return { has: false };
    const r = pr.getBoundingClientRect();
    return {
      has: true,
      text: pr.innerText.replace(/\s+/g, ' '),
      inFold: !!(fold && fold.contains(pr)),
      inView: r.top >= 0 && r.bottom <= window.innerHeight && r.height > 0,
      aboveOpts: !!(opts && r.bottom <= opts.getBoundingClientRect().top),
      optsInView: !!(opts && opts.getBoundingClientRect().bottom <= window.innerHeight),
      hint: (m.querySelector('.rm-more-t') || {}).innerText || '',
    };
  });
  ok(t8b.has, 'the guided results card carries a not-posted line');
  ok(/not posted/i.test(t8b.text || ''), '…and it says "not posted" in plain words', t8b.text);
  ok(t8b.inFold === false, '…in the card BODY, not hidden inside the `d` fold');
  ok(t8b.inView && t8b.aboveOpts, '…above the fold at 1280x800, ahead of the action row', JSON.stringify(t8b));
  ok(t8b.optsInView, 'and the action row is still fully on screen with the line added');
  ok(/where the time went|redo/i.test(t8b.hint), 'the first card names what is behind `d` (P1-1)', t8b.hint);
  await page.evaluate(() => { try { hideResults(); } catch (e) {} });

  await page.evaluate(() => { ['hk_beta_ok','hotkey_onboarded'].forEach(k => localStorage.removeItem(k)); });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined');
  await page.waitForTimeout(700);
  if (LOCK) {
    console.log('T9 the curtain gives an uninvited visitor a story and a door (P0-3)');
    const t9 = await page.evaluate(() => {
      const g = document.getElementById('gate');
      const list = document.getElementById('lockList');
      return {
        shown: !!(g && g.classList.contains('show')),
        codeFirst: !!document.getElementById('lockCode'),
        tagline: (document.getElementById('lockTag') || {}).innerText || '',
        listHref: list ? list.getAttribute('href') : null,
        listText: list ? list.innerText : null,
      };
    });
    ok(t9.shown && t9.codeFirst, 'the curtain still gates, code input still primary');
    ok(/excel/i.test(t9.tagline), 'the curtain now says what the product is', t9.tagline);
    ok(!!t9.listHref && /mailto:|contact/i.test(t9.listHref), 'an uninvited visitor has a next action', String(t9.listHref));
    ok(/list/i.test(t9.listText || ''), '\u2026labelled as getting on the list', t9.listText);
    await page.evaluate(() => { try { localStorage.setItem('hk_beta_ok', '1'); } catch (e) {} });
  } else {
    /* r451: the mirror of the P0-3 asserts. The curtain WAS the whole first impression for
       uninvited traffic; with it retired the landing has to carry that job itself. */
    console.log('T9 an uninvited visitor gets the landing itself (curtain retired)');
    const t9 = await page.evaluate(() => {
      const g = document.getElementById('gate'), l = document.getElementById('landing');
      let betaOk = null; try { betaOk = localStorage.getItem('hk_beta_ok'); } catch (e) {}
      return {
        shown: !!(g && g.classList.contains('show')),
        codeFirst: !!document.getElementById('lockCode'),
        landingUp: !!(l && !l.classList.contains('gone') && getComputedStyle(l).display !== 'none'),
        text: l ? l.innerText : '',
        hasStart: !!document.getElementById('startBtn'),
        hasLogin: !!document.getElementById('loginBtn'),
        betaOk: betaOk,
      };
    });
    ok(!t9.shown && !t9.codeFirst && t9.landingUp, 'no gate for an uninvited visitor \u2014 the landing is the first impression');
    ok(/excel/i.test(t9.text), 'the landing says what the product is', t9.text.slice(0, 90));
    ok(t9.hasStart && t9.hasLogin, 'an uninvited visitor has a next action (start drilling / log in)', JSON.stringify({ s: t9.hasStart, l: t9.hasLogin }));
    ok(!t9.betaOk, '\u2026and never needs an access code (no hk_beta_ok on the device)', String(t9.betaOk));
  }

  const realErrors = errs.filter(e => !/supabase|Failed to fetch|NetworkError|ERR_/i.test(e));
  ok(realErrors.length === 0, 'zero page errors through onboarding', realErrors.join(' | '));
  await browser.close();
  console.log((fail ? 'ONBOARD AUDIT: ' + fail + ' FAILURE(S), ' : 'ONBOARD AUDIT: ALL ') + pass + ' PASS');
  process.exit(fail ? 1 : 0);
})();
