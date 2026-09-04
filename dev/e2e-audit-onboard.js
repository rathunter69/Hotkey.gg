/* r154 → r452 → r455 ONBOARDING AUDIT — the SINGLE ENTRY PATH.

   dev/CURRICULUM_REBUILD.md P5 (Wolf, 2026-09-03): "one entry path: landing → Enter →
   Foundations 1, step 1. The modal product tour and the guided-rails auto-handoff are DELETED. Product chrome is
   taught in context, not by a tour."

   What this suite used to walk is gone twice over: r452 retired the warm-up sandbox and the
   thirteen-card spotlight tour into the Keyboard Tour; r455 retires the Tour AS AN ENTRY, the
   five product beats that were left, the "how much Excel have you done?" comfort question, the
   "what keyboard are you on?" card, the "quick warm-up / skip" prompt and the from-zero guided
   ramp. What a fresh device meets now is the ORDINARY DRILL: the plain r450 start gate, the
   drill's own instruction line and the ordinary checklist. Wolf's round-2 direction (binding)
   keeps pixel art to identity assets — rank, level, achievements, the player card — and keeps
   the drill surface on exactly the chrome every existing drill has, so a Foundations drill is
   an "integrated tutorial" (problem + guide + hints), never a sequence of story cards.
   THE STEP CONTROLLER (dev/CURRICULUM_V3.md §9.0) is what this suite walks: S.step, the
   step-scoped checklist slice, and the step-completion handler that advances both without ever
   stopping the clock.

   The contract asserted here, in order:
     T1  the landing is the first impression (curtain-conditional, unchanged shape)
     T2  Enter → a guest session → FOUNDATIONS 1, step 1 — on the site's ORDINARY drill chrome:
         the plain r450 start gate, the drill's own checklist, its own hint row. No
         card, no banner, no second surface of any kind (Wolf round 2: pixel art is identity
         only; the drill surface keeps the chrome every existing drill has)
     T3  the r450 gate behaves exactly as it does everywhere else, and carries the ONE line the
         comfort question left behind ("already fly? skip the tutorial →")
     T4  the checklist's own .cl-hint row (the row a drill's hint() already uses) carries the
         OPEN BEAT's declared `why` plus the keycaps DERIVED from guide()[id] (§9.0.1 — never a
         second copy of a chord), beat by beat, with the rows scoped to the open step — same
         panel, same classes, same chrome, not one new element
     T5  the STEP BOUNDARY is the checklist advancing, with the clock still running — no
         overlay, no card, no pause (a tutorial is one timed run)
     T6  the win is an ordinary drill win, and the results card names the clear and the next one
     T7  the three contextual tips fire once each and never again
     T8  a SECOND play of a cleared tutorial is silent — the line is the drill's own req again
         and the checklist shows every beat — and the ? sheet's "show the guide again" restores it
     T9  the skip line lands on the first drill outside the tutorial chapter
     T10 every deleted onboarding surface is actually gone at runtime
     T11 esc closes the sign-in modal (r452 P1-2 regression guard, kept)

   THE START-GATE STANCE (dev/check-invariants.js C14): this suite deliberately does NOT set
   hk_gate_off. It is the walk a first-time player walks, and the properties in T2/T3 live only
   here — the gate is the same gate on a tutorial as on any other board, and it carries the one
   skip line. Every other harness opts out of the gate; this one keys through it.

   Run: CHROME=<chromium> URL=http://127.0.0.1:8814/index.html node dev/e2e-audit-onboard.js */
'use strict';
const HK_URL = process.env.URL || (process.env.BASE ? process.env.BASE + '/index.html' : 'http://127.0.0.1:8791/index.html');
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
    rpc: (name, args) => name === 'curtain_check'
      ? Promise.resolve({ data: String((args && args.p_code) || '').trim().toUpperCase() === 'HAGS', error: null })
      : Promise.resolve({ data: null, error: null }),
    functions: { invoke: () => Promise.resolve({ data: null, error: 'no' }) }
  }) };
};

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
  await page.addInitScript(STUB);

  /* A TRULY FRESH DEVICE, every time. Nothing is pre-latched: no hotkey_onboarded, no
     hk_guide_*, no hk_tip_*, and deliberately no hk_gate_off. */
  const wipe = () => page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
  const fresh = async () => {
    await wipe();
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function');
    await page.waitForTimeout(1100);
    if (await page.evaluate(() => typeof PRELAUNCH_LOCK !== 'undefined' && PRELAUNCH_LOCK === true)) {
      await page.evaluate(() => { try { localStorage.setItem('hk_beta_ok', '1'); } catch (e) {} });
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(1100);
    }
  };

  await page.goto(HK_URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined');
  await page.waitForTimeout(500);
  const LOCK = await page.evaluate(() => typeof PRELAUNCH_LOCK !== 'undefined' && PRELAUNCH_LOCK === true);
  const LVLKEY = await page.evaluate(() => MENU_ORDER[0]);
  const LVL = await page.evaluate(() => JSON.parse(JSON.stringify(CHALLENGES[MENU_ORDER[0]].steps || null)));
  const TUT = await page.evaluate(() => JSON.parse(JSON.stringify(CHALLENGES[MENU_ORDER[0]].tutorial || null)));
  ok(!!LVL && !!TUT, 'the first catalog drill declares steps + tutorial (the runtime has a real consumer)', LVLKEY);
  /* §9.0.1: the step literal carries NO chord — the keycaps are derived from guide()[id] */
  ok(JSON.stringify(LVL).indexOf('"keys"') < 0, 'no step literal carries a chord of its own (keys are derived from guide())');

  /* ---------------------------------------------------------------- T1 */
  console.log('T1 the first impression');
  await fresh();
  const t1 = await page.evaluate(() => {
    const l = document.getElementById('landing');
    return { up: !!(l && !l.classList.contains('gone') && getComputedStyle(l).display !== 'none'),
      text: l ? l.innerText : '', start: !!document.getElementById('startBtn'), login: !!document.getElementById('loginBtn') };
  });
  ok(t1.up, 'the landing is up for a fresh device');
  ok(/excel/i.test(t1.text), 'it says what the product is', t1.text.slice(0, 70));
  ok(t1.start && t1.login, 'it offers exactly two doors: start drilling / log in');

  /* ---------------------------------------------------------------- T2 */
  console.log('T2 Enter → Foundations 1 on the ordinary drill chrome — no card, no banner');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);
  const t2 = await page.evaluate(() => {
    const surfaces = ['comfortCard', 'kbCard', 'onboard', 'gateModal']
      .filter(id => { const e = document.getElementById(id); return e && e.classList.contains('show'); });
    return {
      landingGone: document.getElementById('landing').classList.contains('gone'),
      cur, stepMode, stepIdx, step: S && S.step,
      wrap: document.getElementById('tourWrap').classList.contains('on'),
      scrims: document.querySelectorAll('#hkGate').length,
      hud: !!document.getElementById('hkHud'),
      surfaces, tourMode,
      guided: typeof guided !== 'undefined' ? guided : null,
      hints: typeof hints !== 'undefined' ? hints : null,
      hint: (document.querySelector('#checklist .cl-hint') || {}).textContent || '',
      head: (document.querySelector('#checklist .cl-head') || {}).textContent || '',
    };
  });
  ok(t2.landingGone, 'the landing is dismissed');
  ok(t2.cur === LVLKEY, 'the board is Foundations 1 (MENU_ORDER[0])', t2.cur);
  ok(t2.stepMode && t2.step === 0, 'the step controller is armed on step 1 (S.step)', JSON.stringify({ m: t2.stepMode, step: t2.step }));
  ok(!t2.wrap, 'NO step card — a step is not a story card (Wolf round 2)');
  ok(!t2.hud, 'NO HUD banner over the grid — the drill surface keeps its original chrome');
  ok(t2.scrims === 1, 'the PLAIN r450 start gate is there, exactly as on every other drill', String(t2.scrims));
  ok(t2.surfaces.length === 0, 'NO comfort card, NO keyboard card, NO warm-up prompt, NO gate modal', t2.surfaces.join(','));
  ok(!t2.tourMode, 'the Keyboard Tour is not the entry any more');
  ok(t2.guided === false, 'rails are OFF — the guided auto-handoff is deleted (P5)', String(t2.guided));
  ok(t2.hints === false, 'and hints are OFF by default', String(t2.hints));
  ok(new RegExp('step 1 of ' + LVL.length).test(t2.head), 'the ordinary checklist head names the open step', t2.head);

  /* ---------------------------------------------------------------- T3 */
  console.log('T3 the r450 gate is unchanged, and carries the one skip line');
  const t3a = await page.evaluate(() => ({ running, keys: keyLog.length, t: $('timer').textContent, gate: hkGate,
    skip: (document.getElementById('lcSkip') || {}).textContent || null,
    copy: (document.querySelector('#hkGate .hk-pause-card b') || {}).textContent || '' }));
  ok(!t3a.running && t3a.t === '0.00', 'the clock has not started', JSON.stringify({ r: t3a.running, t: t3a.t }));
  ok(/press any key to start/i.test(t3a.copy), 'the gate says what it has always said', t3a.copy);
  ok(/skip the tutorial/i.test(t3a.skip || ''), 'the ONE line the comfort question left behind rides on it (P5)', String(t3a.skip));
  await page.keyboard.press('Shift');
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => hkGate === true && running === false), 'a bare modifier does not start the run');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  const t3b = await page.evaluate(() => ({ running, keys: keyLog.length, gate: hkGate,
    t: parseFloat($('timer').textContent), scrims: document.querySelectorAll('#hkGate').length }));
  ok(t3b.running === true && t3b.gate === false, 'one real keypress starts the clock');
  ok(t3b.keys === 0 && t3b.t < 1.0, '…with the key swallowed and t=0 honest', JSON.stringify(t3b));
  ok(t3b.scrims === 0, 'no scrim is left behind', String(t3b.scrims));

  /* ---------------------------------------------------------------- T4 */
  console.log('T4 the checklist\'s own hint row carries the open beat; the rows scope to the step');
  const lineNow = () => page.evaluate(() => ({
    text: (document.querySelector('#checklist .cl-hint') || {}).textContent || '',
    caps: [...document.querySelectorAll('#checklist .cl-hint kbd')].map(k => k.textContent),
    rows: [...document.querySelectorAll('#checklist .cl-item .cl-label')].map(r => r.textContent),
    head: (document.querySelector('#checklist .cl-head') || {}).textContent || '',
    step: S && S.step,
  }));
  /* the keycaps a beat SHOULD show: the <kbd> texts of this drill's own guide()[id] (§9.0.1) */
  const capsFor = id => page.evaluate(i => {
    const C = CHALLENGES[cur];
    const g = String(((C.__gCache || (C.__gCache = C.guide.call(C))) || [])[i] || '');
    const d = document.createElement('div'); d.innerHTML = g;
    return [...d.querySelectorAll('kbd')].map(k => k.textContent);
  }, id);
  const l0 = await lineNow();
  ok(l0.text.indexOf(LVL[0].beats[0].why) >= 0, 'step 1 beat 1: the checklist hint row reads its declared why', l0.text.slice(0, 80));
  {
    const want = await capsFor(LVL[0].beats[0].id);
    ok(want.length > 0 && want.every(k => l0.caps.indexOf(k) >= 0),
      'and its keycaps, DERIVED from guide()[id] as ordinary <kbd> caps', l0.caps.join(' ') + ' vs ' + want.join(' '));
  }
  ok((await page.evaluate(() => getComputedStyle(document.getElementById('taskLine')).display)) === 'none',
    '…and NOT in #taskLine, which has been display:none since r49');
  ok(l0.rows.length < (await page.evaluate(() => CHALLENGES[cur].checks(S).length)),
    'the checklist is SCOPED to the open step (plus the ☆ and the save closer)', String(l0.rows.length));
  ok((await page.evaluate(() => !!document.querySelector('#checklist .cl-inner'))),
    '…in the ordinary checklist chrome — same .cl-inner/.cl-item rows every drill uses');

  /* drive the real route one demo move at a time; the line must follow the open beat */
  await page.evaluate(() => {
    const C = CHALLENGES[cur];
    window.__mv = ((typeof C.demo === 'function') ? C.demo.call(C) : C.demo).slice();
    window.__mi = 0;
  });
  const step = () => page.evaluate(() => {
    if (window.__mi >= window.__mv.length) return { end: true };
    const mv = window.__mv[window.__mi++];
    setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk);
    return { end: false, step: S.step, running, done, t: parseFloat($('timer').textContent) };
  });
  let crossed = false, lines = [], clockAtBoundary = null;
  for (let i = 0; i < 40; i++) {
    const st = await step();
    if (st.end) break;
    const l = await lineNow();
    if (lines.indexOf(l.text) < 0) lines.push(l.text);
    if (st.step === 1 && !crossed) { crossed = true; clockAtBoundary = st; break; }
  }
  ok(lines.some(x => x.indexOf(LVL[0].beats[1].why) >= 0),
    'step 1 beat 2: the line swaps to the next beat\'s why', lines.join(' | ').slice(0, 140));
  ok(crossed, 'step 1 closes when every one of its declared beats grades');

  /* ---------------------------------------------------------------- T5 */
  console.log('T5 the step boundary is the checklist advancing — nothing else');
  const t5 = await page.evaluate(() => ({
    step: S.step, running,
    wrap: document.getElementById('tourWrap').classList.contains('on'),
    hud: !!document.getElementById('hkHud'),
    scrims: document.querySelectorAll('#hkGate').length,
    pause: document.querySelectorAll('#hkPause').length,
    head: (document.querySelector('#checklist .cl-head') || {}).textContent || '',
    hint: (document.querySelector('#checklist .cl-hint') || {}).textContent || '',
  }));
  ok(t5.step === 1, 'S.step has advanced to step 2');
  ok(t5.running === true, 'THE CLOCK IS STILL RUNNING across the boundary (a tutorial is one timed run)');
  ok(!t5.wrap && !t5.hud && t5.scrims === 0 && t5.pause === 0,
    'no card, no banner, no scrim, no pause — nothing interrupts the run', JSON.stringify(t5));
  ok(new RegExp('step 2 of ' + LVL.length).test(t5.head), 'the checklist head names step 2', t5.head);
  ok(t5.hint.indexOf(LVL[1].beats[0].why) >= 0, 'and the checklist\'s hint row is step 2\'s first beat', t5.hint.slice(0, 80));

  /* ---------------------------------------------------------------- T6 */
  console.log('T6 the win is an ordinary drill win, and the card names the clear');
  const t6a = await page.evaluate(() => {
    const C = CHALLENGES[cur];
    const mv = (typeof C.demo === 'function') ? C.demo.call(C) : C.demo;
    for (const m of mv) { setDemoSel(m.sel); for (const kk of m.keys) demoKey(kk); }
    return { done, hud: !!document.getElementById('hkHud'), stepMode,
      seen: localStorage.getItem('hk_guide_' + cur), pb: PB[cur] !== undefined };
  });
  ok(t6a.done, 'the tutorial wins on its last step\'s beats plus the save closer, like any drill');
  ok(t6a.pb, '…banks a PB (a tutorial is a NORMAL drill: checkWin, recordRun, PB, xp)');
  ok(t6a.seen === 'done', '…latches hk_guide_<key>=\'done\' (§9.0.2)', String(t6a.seen));
  ok(!t6a.hud && !t6a.stepMode, '…and the HUD comes down before the results card');
  await page.waitForTimeout(900);
  const t6b = await page.evaluate(() => {
    const m = document.getElementById('resultsModal');
    return { show: m.classList.contains('show'),
      lvl: (m.querySelector('.rm-level') || {}).textContent || '',
      btns: [...m.querySelectorAll('.rm-key')].map(b => b.textContent) };
  });
  const NEXTNAME = await page.evaluate(() => {
    const L = CHALLENGES[cur].tutorial, N = CHALLENGES[L.nextKey];
    return String((N && N.tutorial && N.tutorial.name) || (N && N.name) || L.nextKey);
  });
  ok(t6b.show, 'the results card shows');
  ok(/Foundations 1 clear/.test(t6b.lvl), 'it carries "Foundations n clear"', t6b.lvl);
  ok(t6b.lvl.indexOf('Navigate & Select') >= 0, '…named by the tutorial, not by a story title', t6b.lvl);
  ok(t6b.lvl.indexOf(NEXTNAME) >= 0 && /→/.test(t6b.lvl), '…and names the next one', t6b.lvl);
  ok(t6b.btns.some(b => /next: /.test(b) && b.indexOf(NEXTNAME) >= 0), 'the primary button is the hand-off', t6b.btns.join(' / '));
  await page.keyboard.down('Alt'); await page.keyboard.press('ArrowRight'); await page.keyboard.up('Alt');
  await page.waitForTimeout(700);
  ok(await page.evaluate(() => cur === 'autofit' || cur !== MENU_ORDER[0]), 'alt+→ on the card takes the next drill');

  /* ---------------------------------------------------------------- T7 */
  console.log('T7 the three contextual tips — once each, never again');
  const tipState = () => page.evaluate(() => ({
    picker: localStorage.getItem('hk_tip_picker'), pb: localStorage.getItem('hk_tip_pb'), rank: localStorage.getItem('hk_tip_rank') }));
  const t7pb = await tipState();
  ok(t7pb.pb === '1', 'TIP 2 (first PB) fired on the tutorial clear', String(t7pb.pb));
  await page.evaluate(() => { try { openPicker(); } catch (e) {} });
  await page.waitForTimeout(700);
  const t7p = await page.evaluate(() => ({ latch: localStorage.getItem('hk_tip_picker'),
    toast: (document.getElementById('hkToast') || {}).textContent || '',
    shown: !!(document.getElementById('hkToast') || {}).classList && document.getElementById('hkToast').classList.contains('show') }));
  ok(t7p.latch === '1' && t7p.shown, 'TIP 1 (first picker open) fires as a toast with keycaps', t7p.toast.slice(0, 60));
  ok(/\\/.test(t7p.toast), '…and it names the key that opens the list', t7p.toast.slice(0, 40));
  const t7again = await page.evaluate(() => { closePicker();
    const before = (document.getElementById('hkToast') || {}).textContent;
    return { second: hkTip('picker', 'SHOULD NEVER SHOW'), third: hkTip('pb', 'NOR THIS'), before }; });
  ok(t7again.second === false && t7again.third === false, 'a spent tip never fires again (hk_tip_<name>)');
  const t7r = await page.evaluate(() => ({ first: hkTip('rank', 'rank moved'), second: hkTip('rank', 'rank moved') }));
  ok(t7r.first === true && t7r.second === false, 'TIP 3 (rank pill move) is the same one-shot', JSON.stringify(t7r));
  ok((await tipState()).rank === '1', '…and latches hk_tip_rank');

  /* ---------------------------------------------------------------- T8 */
  console.log('T8 a cleared tutorial replays SILENT — and the ? sheet brings the guide back');
  await page.evaluate(k => loadChallenge(k), LVLKEY);
  await page.waitForTimeout(700);
  const t8 = await page.evaluate(() => ({ stepMode, step: S && S.step,
    wrap: document.getElementById('tourWrap').classList.contains('on'),
    scrims: document.querySelectorAll('#hkGate').length, gate: hkGate,
    skip: !!document.getElementById('lcSkip'),
    hint: (document.querySelector('#checklist .cl-hint') || {}).textContent || '',
    head: (document.querySelector('#checklist .cl-head') || {}).textContent || '',
    rows: document.querySelectorAll('#checklist .cl-item').length,
    all: CHALLENGES[cur].checks(S).length }));
  ok(!t8.stepMode && t8.step === -1, 'the step controller stands down on a replay');
  ok(!t8.wrap, 'nothing is raised over the board');
  ok(t8.scrims === 1 && t8.gate === true, 'the ordinary r450 start gate is there', JSON.stringify({ s: t8.scrims, g: t8.gate }));
  ok(!t8.skip, '…without the skip line (that is a first-play affordance)', String(t8.skip));
  ok(/checklist/.test(t8.head), 'the checklist head is the ordinary "checklist n/N" again', t8.head);
  ok(t8.rows === t8.all, '…and every beat is in it — no step scoping on a replay', t8.rows + '/' + t8.all);
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(250);
  await page.evaluate(() => { try { openKbd(); } catch (e) {} });
  await page.waitForTimeout(350);
  const t8b = await page.evaluate(() => ({
    hints: (document.getElementById('kbGuideAgain') || {}).textContent || null,
    replayTour: (document.getElementById('kbReplayTour') || {}).textContent || null,
    intro: (document.getElementById('kbKeyTour') || {}).textContent || null,
    live: typeof LEVEL1_LIVE !== 'undefined' ? LEVEL1_LIVE : null }));
  ok(/show the guide again/i.test(t8b.hints || ''), 'the ? sheet carries "show the guide again"', String(t8b.hints));
  ok(t8b.replayTour === null, '…and the modal product tour\'s replay link is gone with the tour');
  ok(t8b.live === false ? /replay the intro/i.test(t8b.intro || '') : t8b.intro === null,
    'the Keyboard Tour survives as "replay the intro" only while LEVEL1_LIVE is false', String(t8b.intro));
  await page.evaluate(() => document.getElementById('kbGuideAgain').click());
  await page.waitForTimeout(900);
  const t8c = await page.evaluate(() => ({ seen: localStorage.getItem('hk_guide_' + MENU_ORDER[0]),
    stepMode, step: S && S.step,
    head: (document.querySelector('#checklist .cl-head') || {}).textContent || '' }));
  ok(!t8c.seen, 'clicking it clears every hk_guide_ latch');
  ok(t8c.stepMode && t8c.step === 0, '…and the guide coaches again on the spot', JSON.stringify(t8c));
  ok(/step 1 of/.test(t8c.head), '…with the checklist scoped to step 1 again', t8c.head);

  /* ---------------------------------------------------------------- T9 */
  console.log('T9 the skip line lands outside the tutorial chapter');
  await fresh();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);
  const g0 = await page.evaluate(() => GROUP_OF[MENU_ORDER[0]]);
  await page.evaluate(() => { const a = document.getElementById('lcSkip'); if (a) a.click(); });
  await page.waitForTimeout(900);
  const t9 = await page.evaluate(() => ({ cur, group: GROUP_OF[cur], stepMode, step: S && S.step, running,
    seen: localStorage.getItem('hk_guide_' + MENU_ORDER[0]) }));
  ok(t9.group && t9.group !== g0, 'it lands on the first drill outside the tutorial chapter', t9.cur + ' / ' + t9.group);
  ok(t9.seen === 'done', '…and latches every hk_guide_ so nothing coaches again', String(t9.seen));
  ok(!t9.stepMode && t9.step !== 0, '…with the step controller stood down');
  ok(t9.running === false, '…and no clock started by the skip (it is not a run)');

  /* ---------------------------------------------------------------- T10 */
  console.log('T10 every deleted onboarding surface is gone at runtime');
  const t10 = await page.evaluate(() => {
    const gone = n => typeof window[n] === 'undefined' && (() => { try { eval(n); return false; } catch (e) { return true; } })();
    return {
      TOUR_STEPS: gone('TOUR_STEPS'), tourShow: gone('tourShow'), buildTourPlan: gone('buildTourPlan'),
      tourReplay: gone('tourReplay'), tourSkipReq: gone('tourSkipReq'), showComfort: gone('showComfort'),
      showKeyboard: gone('showKeyboard'), maybeOnboard: gone('maybeOnboard'), showOnboard: gone('showOnboard'),
      startPlacement: gone('startPlacement'), showPrimer: gone('showPrimer'), startSandbox: gone('startSandbox'),
      obDom: !!document.getElementById('onboard'),
      entry: typeof tryEnter === 'function' && typeof hkEnterFirstBoard === 'function',
      lvRuntime: typeof hkStepStart === 'function' && typeof hkStepTick === 'function'
        && typeof hkStepShows === 'function' && typeof hkStepHintHtml === 'function'
        && typeof hkStepCaps === 'function' && typeof hkTip === 'function',
      sandboxFlag: typeof sandboxMode === 'boolean',
    };
  });
  for (const k of ['TOUR_STEPS','tourShow','buildTourPlan','tourReplay','tourSkipReq','showComfort',
                   'showKeyboard','maybeOnboard','showOnboard','startPlacement','showPrimer','startSandbox'])
    ok(t10[k] === true, `${k} is gone`, String(t10[k]));
  ok(!t10.obDom, 'the #onboard "quick warm-up / skip" modal is out of the DOM');
  ok(t10.entry, 'the one entry path is intact: tryEnter → hkEnterFirstBoard → loadChallenge');
  ok(t10.lvRuntime, 'the step runtime and the tips are live');
  ok(t10.sandboxFlag, 'the sandboxMode FLAG stays (§8 do-not-change #6)');

  /* ---------------------------------------------------------------- T11 */
  console.log('T11 esc closes the sign-in modal (r452 P1-2 guard)');
  await page.evaluate(() => { try { openAuth('signin'); } catch (e) {} });
  await page.waitForTimeout(250);
  const escA = await page.evaluate(() => ({ open: authOpen === true,
    shown: document.getElementById('authModal').classList.contains('show') }));
  ok(escA.open && escA.shown, 'the sign-in modal opens');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  const escB = await page.evaluate(() => ({ open: authOpen, shown: document.getElementById('authModal').classList.contains('show') }));
  ok(escB.open === false && escB.shown === false, 'Escape closes it from inside the focused field', JSON.stringify(escB));

  const realErrors = errs.filter(e => !/supabase|Failed to fetch|NetworkError|ERR_/i.test(e));
  ok(realErrors.length === 0, 'zero page errors through the whole walk', realErrors.join(' | '));
  await browser.close();
  console.log((fail ? 'ONBOARD AUDIT: ' + fail + ' FAILURE(S), ' : 'ONBOARD AUDIT: ALL ') + pass + ' PASS');
  process.exit(fail ? 1 : 0);
})();
