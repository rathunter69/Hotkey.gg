/* r154 ONBOARDING AUDIT — a truly fresh visitor: curtain → landing → enter → THE KEYBOARD
   TOUR → drill 1; second visit: welcome-back. Stubbed supabase so auth paths run.

   r452 REWRITTEN AROUND THE KEYBOARD TOUR (dev/TUTORIAL_CHAPTER_SPEC.md §3.0, §5). What this
   suite used to walk — a thirteen-card modal spotlight tour over a throwaway warm-up sandbox —
   no longer exists: decision T2 retired both into one staged, untimed, hands-on board, and
   dev/e2e-onboard-sandbox.js went with them. So T2–T8 are new, and they assert the contract
   §3.0.2(7) writes down:
     · the TUTORIAL HUD's text PER BEAT, for all twenty-four beats, driven by real keystrokes
       (each beat is checked BEFORE it is performed and the next beat's line after it);
     · each stage opening on its own lesson card, with its board region painted in by the
       r421 §2.5 tier ladder (the Tour is that platform piece's first consumer);
     · the checklist absent before stage 1 beat 3, then showing ONLY the open stage's beats;
     · three wrong keys adding the second HUD line, a correct key clearing it, and the nudge
       never escalating past two lines;
     · the HUD never covering the active cell, on any row;
     · stage 5 forcing the lean ribbon bar on and handing the player's setting back (T3);
     · the one-time +25 xp bounty (T1), and the hand-off into drill 1 with guided OFF, hints
       ON, and the r450 start gate armed;
     · every retired sandbox function actually gone, with the sandboxMode FLAG kept.

   THE START-GATE STANCE (dev/check-invariants.js C14): this suite deliberately does NOT set
   hk_gate_off. It is the walk a first-time player walks, and two properties live only here —
   the Tour is never gated (it is untimed), and drill 1 IS gated the instant the Tour hands
   over. Every other harness opts out of the gate; this one keys through it. */
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
        gateEmpty: !g || !g.innerHTML.trim(),          /* r452: the curtain markup itself is gone now, so #gate may not exist at all */
        landingUp: !!(l && !l.classList.contains('gone') && getComputedStyle(l).display !== 'none'),
        gateOpen: (typeof gateOpen !== 'undefined') ? gateOpen : null,
        betaOk: betaOk,
      };
    });
    ok(!t1.shown && !t1.hasInput && t1.gateEmpty, 'no curtain element on a fresh device');
    ok(t1.landingUp, 'a fresh device lands straight on the landing');
    ok(!t1.gateOpen && !t1.betaOk, 'the Enter path is unguarded \u2014 no curtain state, no hk_beta_ok needed', JSON.stringify(t1));
  }

  /* ══════════════════════════════════════════════════════════════════════════════════════
     T2–T8 (r452): rewritten around THE KEYBOARD TOUR — dev/TUTORIAL_CHAPTER_SPEC.md §3.0.
     What used to live here was the modal spotlight tour over a throwaway sandbox: Enter-mash
     thirteen cards, land on a drill. Both surfaces are retired (§1.7 / decision T2), so the
     walk is now the real thing a first-timer does — six staged cards and twenty-four beats
     performed by hand on a live board — and the assertions are the ones §3.0.2(7) names:
     the HUD's text PER BEAT, the stage reveals, the checklist's staging, the three-miss nudge,
     the forced ribbon bar, the +25 xp bounty and the hand-off into drill 1.

     THIS SUITE DELIBERATELY DOES NOT SET hk_gate_off (dev/check-invariants.js C14 lists it in
     KEYS_THROUGH). The Tour clears the r450 start gate because it is untimed; drill 1 arms it
     the instant the Tour hands over. Both properties are asserted here and nowhere else.
     ══════════════════════════════════════════════════════════════════════════════════════ */

  console.log('T2 the comfort fork routes the first session (§1.7)');
  const t2 = await page.evaluate(() => {
    const l = document.getElementById('landing');
    return { visible: !!(l && !l.classList.contains('gone')) };
  });
  ok(t2.visible, 'landing dialog is up after the curtain');
  await page.keyboard.press('Enter');   // Enter = start (friction-free entry)
  await page.waitForTimeout(900);
  const t2kb = await page.evaluate(() => { const m = document.getElementById('kbCard'); return !!(m && m.classList.contains('show')); });
  ok(t2kb, 'keyboard pick asks first (r280)');
  await page.keyboard.press('1');       // Windows
  await page.waitForTimeout(500);
  const t2fork = await page.evaluate(() => { const m = document.getElementById('comfortCard'); return !!(m && m.classList.contains('show')); });
  ok(t2fork, 'comfort fork asks how much Excel you know (r159)');
  await page.keyboard.press('1');       // "basically none" → the Keyboard Tour
  await page.waitForTimeout(1400);
  const t2b = await page.evaluate(() => ({
    landingGone: !!(document.getElementById('landing') || {}).classList?.contains('gone'),
    cur, tourMode, card: !!document.getElementById('tourWrap').classList.contains('on'),
    cap: (document.querySelector('#tourCard .tour-cap') || {}).textContent || '',
  }));
  ok(t2b.landingGone, 'Enter dismisses the landing');
  ok(t2b.cur === 'keyboardtour' && t2b.tourMode, '"basically none" lands on the Keyboard Tour', JSON.stringify(t2b));
  ok(t2b.card && /STAGE 1 OF 6/.test(t2b.cap), 'and opens on stage 1\'s lesson card', t2b.cap);

  /* the Tour is a deliberate NON-gate: it is untimed, so a start gate over it would promise a
     clock that startClock() refuses to run (dev/check-startgate.js §8, the sandbox's rationale
     re-pointed at the Tour) */
  const t2g = await page.evaluate(() => ({ gate: hkGate, ov: !!document.getElementById('hkGate'),
    running, timer: document.getElementById('timer').textContent,
    par: document.getElementById('par').textContent, pb: document.getElementById('pb').textContent }));
  ok(!t2g.gate && !t2g.ov, 'the Tour is not gated — it is never timed', JSON.stringify(t2g));
  ok(!t2g.running && t2g.timer === '—', 'and its clock reads "—", not 0.00', JSON.stringify(t2g));
  ok(t2g.par === '—' && t2g.pb === '—', 'no par and no PB are advertised over it', JSON.stringify(t2g));

  console.log('T3 the twenty-four beats: the HUD names each one, and performing it advances (§3.0.2(7))');
  /* One row per beat: the EXACT §3.0.5 HUD line the banner must read before the beat, and the
     keystrokes that perform it. `stage` marks the first beat of a stage — the card in front of
     it is dismissed by any key first. Nothing here reaches past the public surface: every beat
     is driven with real keystrokes on the real board, exactly as a player performs it. */
  const hudLine = () => page.evaluate(() => {
    const h = document.getElementById('tourHud');
    return h ? (h.querySelector('.hud-line') || {}).textContent : null;
  });
  const beatIdx = () => page.evaluate(() => CHALLENGES.keyboardtour.checks(S).findIndex(x => !x.ok));
  const totRow = () => page.evaluate(() => CHALLENGES.keyboardtour._row(S, 'Total'));
  const K = async (k, ms) => { await page.keyboard.press(k); await page.waitForTimeout(ms || 110); };
  const selDown = async (n) => { for (let i = 0; i < n; i++) await K('Shift+ArrowDown', 40); };
  const at = async (ref) => page.evaluate(r => { const p = parseRef(r); S.active = { r: p.r, c: p.c }; S.sel = null; render(); }, ref);

  const BEATS = [
    { stage: 1, hud: 'press → until you reach the Q4 figure',                     run: async () => { for (let i = 0; i < 4; i++) await K('ArrowRight'); } },
    {           hud: 'hold ctrl and press → to fly to the end of the row',        run: async () => K('Control+ArrowRight') },
    {           hud: 'hold ctrl and press ↓ to fly to the last region',           run: async () => K('Control+ArrowDown') },
    {           hud: 'press ctrl+home — top-left of the sheet, from anywhere',    run: async () => K('Control+Home') },
    {           hud: 'press ctrl+end — the last cell holding anything',           run: async () => K('Control+End', 300) },
    { stage: 2, hud: 'hold shift and press → to stretch the selection',           run: async () => { for (let i = 0; i < 3; i++) await K('Shift+ArrowRight'); } },
    {           hud: 'hold ctrl+shift and press ↓ to stretch to the edge',        run: async () => K('Control+Shift+ArrowDown') },
    {           hud: 'press shift+space — the whole row, one press',              run: async () => K('Shift+Space') },
    {           hud: 'press ctrl+a — the whole block you are standing in',        run: async () => K('Control+a', 300) },
    { stage: 3, hud: 'type the number, then press tab to commit and move right',  run: async () => { await K('4'); await K('Tab'); await K('1'); await K('9'); await K('0'); await K('Enter', 260); } },
    {           hud: 'press F2 to edit inside the cell — do not retype it',       run: async () => { await K('F2'); for (let i = 0; i < 3; i++) await K('Backspace'); for (const c of 'ting') await K(c); await K('Enter', 260); } },
    {           hud: 'select the row, then press ctrl+− to delete it',            run: async () => { await K('Shift+Space'); await K('Control+Minus', 260); } },
    {           hud: 'press ctrl+z — undo puts it straight back',                 run: async () => K('Control+z', 320) },
    {           hud: 'select the total row and press ctrl+shift+= to insert above it', run: async () => { await K('Shift+Space'); await K('Control+Shift+Equal', 400); } },
    { stage: 4, hud: 'type = then point with the arrows, ↵ to commit',            run: async () => { await at('F4'); for (const ch of '=SUM(B4:E4)') await page.keyboard.press(ch === '=' ? 'Equal' : ch === '(' ? 'Shift+Digit9' : ch === ')' ? 'Shift+Digit0' : ch === ':' ? 'Shift+Semicolon' : ch); await K('Enter', 260); } },
    {           hud: 'press ctrl+d to fill the formula down the column',          run: async () => { await at('F4'); await selDown(7); await K('Control+d', 320); } },
    {           hud: 'select a quarter through the empty total, then press alt+=', run: async () => { const t = await totRow(); for (let c = 2; c <= 5; c++) { await page.evaluate(cc => { S.active = { r: 4, c: cc }; S.sel = null; render(); }, c); await selDown(t - 4); await K('Alt+Equal', 190); } } },
    {           hud: 'press alt+= once more for the grand total',                 run: async () => { const t = await totRow(); await page.evaluate(tt => { S.active = { r: tt, c: 2 }; S.sel = null; render(); }, t); for (let i = 0; i < 4; i++) await K('Shift+ArrowRight', 40); await K('Alt+Equal', 320); } },
    { stage: 5, hud: 'press ctrl+shift+1 — commas on the whole figure block',     run: async () => { await page.evaluate(() => { S.active = { r: 4, c: 2 }; S.sel = { r: 11, c: 5 }; render(); }); await K('Control+Shift+Digit1', 260); } },
    {           hud: 'press alt h f c, then pick blue — typed numbers are blue',  run: async () => { await page.evaluate(() => { S.active = { r: 4, c: 2 }; S.sel = { r: 11, c: 5 }; render(); }); await K('Alt'); await K('h'); await K('f'); await K('c', 200); for (let i = 0; i < 4; i++) await K('ArrowRight', 60); await K('Enter', 260); } },
    {           hud: 'press ctrl+b to bold the header row',                       run: async () => { await page.evaluate(() => { S.active = { r: 3, c: 1 }; S.sel = { r: 3, c: 5 }; render(); }); await K('Control+b', 260); } },
    {           hud: 'press alt h a c to center the headers',                     run: async () => { await page.evaluate(() => { S.active = { r: 3, c: 2 }; S.sel = { r: 3, c: 5 }; render(); }); await K('Alt'); await K('h'); await K('a'); await K('c', 260); } },
    {           hud: 'press alt h b p — a line above every total',                run: async () => { const t = await totRow(); await page.evaluate(tt => { S.active = { r: tt, c: 1 }; S.sel = { r: tt, c: 6 }; render(); }, t); await K('Alt'); await K('h'); await K('b'); await K('p', 320); } },
    { stage: 6, hud: 'press ctrl+s — every drill ends with a save',               run: async () => K('Control+s', 700) },
  ];

  /* the stage cards' reveals, checked as each stage opens (§2.5 tier ladder, §3.0.1 board) */
  const REVEAL = { 2: ['G2', 'G6'], 3: ['A12', 'A16'], 4: ['F3'], 5: ['G7', 'G11'] };
  await page.keyboard.press('Enter');           // stage 1's card is up from T2 — any key dismisses it
  await page.waitForTimeout(560);
  let hudMisses = 0, revealMisses = 0, stagesSeen = 0;
  for (let i = 0; i < BEATS.length; i++) {
    const B = BEATS[i];
    if (B.stage) {
      if (B.stage > 1) {
        await page.waitForTimeout(950);                       // the reveal flash, then the card
        const up = await page.evaluate(() => ({ on: __tourCardOn,
          cap: (document.querySelector('#tourCard .tour-cap') || {}).textContent || '',
          hud: !!document.getElementById('tourHud') }));
        ok(up.on && up.cap.indexOf('STAGE ' + B.stage + ' OF 6') >= 0,
          'stage ' + B.stage + ' opens on its own lesson card', JSON.stringify(up));
        ok(!up.hud, 'and the banner steps aside while the card is up');
        const rv = await page.evaluate(cells => cells.map(c => (S.cells[c] || {}).value != null), REVEAL[B.stage] || []);
        if (!rv.every(Boolean)) { revealMisses++; ok(false, 'stage ' + B.stage + '\'s board region painted in', JSON.stringify(REVEAL[B.stage])); }
        await page.keyboard.press('Enter');                   // any key dismisses
        await page.waitForTimeout(560);
      }
      stagesSeen++;
    }
    const before = await hudLine();
    if (before !== B.hud) { hudMisses++; ok(false, 'beat ' + i + ': the banner reads its §3.0.5 line', JSON.stringify({ want: B.hud, got: before })); }
    await B.run();
    await page.waitForTimeout(220);
    const idx = await beatIdx();
    if (idx !== i + 1 && !(i === BEATS.length - 1 && idx === -1)) {
      ok(false, 'beat ' + i + ' (' + B.hud.slice(0, 34) + '…) grades on being performed', 'first ungraded = ' + idx);
    }
  }
  ok(hudMisses === 0, 'all 24 beats: #tourHud carries that beat\'s exact §3.0.5 line', hudMisses + ' wrong');
  ok(revealMisses === 0, 'every stage paints its board region in as the stage before it clears (§2.5 tiers)');
  ok(stagesSeen === 6, 'all six stages ran', String(stagesSeen));
  const t3done = await page.evaluate(() => CHALLENGES.keyboardtour.checks(S).filter(x => x.ok).length);
  ok(t3done === 24, 'all twenty-four beats graded', String(t3done));

  console.log('T4 completion: the one-time +25 xp, the hand-off card, and drill 1 (§3.0.4(7))');
  await page.waitForTimeout(900);
  const t4 = await page.evaluate(() => ({
    card: __tourCardOn, txt: (document.getElementById('tourCard') || {}).innerText || '',
    xp: localStorage.getItem('hk_xp_est'), latch: localStorage.getItem('hk_tour_done_v2'),
    a18: (S.cells['A18'] || {}).value || null, hud: !!document.getElementById('tourHud'),
  }));
  ok(t4.card && /THE KEYBOARD TOUR — DONE/.test(t4.txt), 'the hand-off card renders', t4.txt.slice(0, 60));
  ok(/start drill 1/i.test(t4.txt), '…and offers drill 1', t4.txt.slice(-80));
  ok(t4.latch === '1' && t4.xp === '25', 'the tour pays +25 xp, once, and latches it', JSON.stringify({ xp: t4.xp, latch: t4.latch }));
  ok(/Saved/.test(t4.a18 || ''), 'the save reveals the closing line on the board', String(t4.a18));
  ok(!t4.hud, 'the banner is gone once the Tour is done');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1300);
  const t4b = await page.evaluate(() => ({ cur, tourMode, guided, hints, gate: hkGate,
    ov: !!document.getElementById('hkGate'), running, hud: !!document.getElementById('tourHud'),
    bar: localStorage.getItem('hk_ribbon_bar') }));
  ok(t4b.cur === 'navigation' && !t4b.tourMode, 'the hand-off loads drill 1 and leaves the Tour', JSON.stringify(t4b));
  ok(!t4b.guided, '…with guided OFF — the Tour was the hand-holding (§1.4)');
  ok(t4b.hints, '…and hints ON, which still posts a time (§1.5(e))');
  ok(t4b.gate && t4b.ov && !t4b.running, 'drill 1 arrives behind the r450 start gate, clock unstarted', JSON.stringify(t4b));
  ok(t4b.bar === null, 'and stage 5\'s forced ribbon bar is handed back to the player\'s own setting (T3)', String(t4b.bar));
  const t4c = await page.evaluate(() => {
    demoKey({ key: 'x' });                       // the gate key: swallowed, starts the clock
    return { started: running === true && keyLog.length === 0 && !document.getElementById('hkGate') };
  });
  ok(t4c.started, 'and its first key is swallowed by the gate and starts the clock');

  console.log('T5 the TUTORIAL HUD\'s contract (§3.0.2)');
  const fresh = async (answer) => {
    await page.evaluate(() => { ['hk_xlv','hk_tour_done','hk_tour_done_v2','hotkey_onboarded','hk_learn_done',
      'hk_xp_est','hk_runs_lite','hotkey_solves','hotkey_last_drill','hk_last_drill','hk_ribbon_bar','hk_lessons_off']
      .forEach(k => localStorage.removeItem(k)); });
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof startKeyboardTour === 'function');
    await page.waitForTimeout(700);
    await page.keyboard.press('Enter'); await page.waitForTimeout(900);   // landing
    await page.keyboard.press('1');    await page.waitForTimeout(500);    // keyboard: windows
    await page.keyboard.press(answer); await page.waitForTimeout(1300);   // comfort
  };
  await fresh('1');
  await page.keyboard.press('Enter'); await page.waitForTimeout(600);     // dismiss stage 1's card

  // (a) the checklist is ABSENT until stage 1's third beat, then shows only the open stage
  const t5a = await page.evaluate(() => (document.getElementById('checklist') || {}).innerHTML || '');
  ok(t5a.trim() === '', 'the checklist panel is absent at stage 1 beat 1 (§3.0.2(1))', JSON.stringify(t5a.slice(0, 40)));
  for (let i = 0; i < 4; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(90); }
  await page.keyboard.press('Control+ArrowRight'); await page.waitForTimeout(400);   // beats 0-1 done; beat 2 is open
  const t5b = await page.evaluate(() => {
    const el = document.getElementById('checklist');
    return { rows: el.querySelectorAll('.cl-item').length, head: (el.querySelector('.cl-head') || {}).textContent || '',
      txt: el.innerText };
  });
  ok(t5b.rows === 5, 'it appears at stage 1 beat 3 showing ONLY that stage\'s five beats', JSON.stringify(t5b.rows));
  ok(/stage 1 of 6/.test(t5b.head), '…headed by the stage it belongs to', t5b.head);
  ok(!/Comma-format|Total the North line/.test(t5b.txt), '…and never renders a parked stage\'s beats');

  // (b) three wrong keys add the nudge line; a correct key clears it; it never escalates
  const t5c0 = await page.evaluate(() => !!document.querySelector('#tourHud .hud-nudge'));
  ok(!t5c0, 'no nudge line before any wrong key');
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Control+Shift+ArrowRight'); await page.waitForTimeout(180); }
  const t5c = await page.evaluate(() => {
    const h = document.getElementById('tourHud');
    return { miss: S._hudMiss, nudge: (h.querySelector('.hud-nudge') || {}).textContent || null,
      lines: h.querySelectorAll('.hud-nudge').length };
  });
  ok(t5c.miss === 3 && !!t5c.nudge, 'three wrong keys add the second HUD line (§3.0.2(3))', JSON.stringify(t5c));
  ok(t5c.nudge === 'try ctrl+↓ — hold ctrl down first, then tap the arrow', '…and it is the open beat\'s exact nudge string', String(t5c.nudge));
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Control+Shift+ArrowRight'); await page.waitForTimeout(150); }
  ok((await page.evaluate(() => document.querySelectorAll('#tourHud .hud-nudge').length)) === 1,
    'three more misses never escalate to a third line');
  await page.keyboard.press('Control+ArrowDown'); await page.waitForTimeout(400);   // beat 2's own chord
  const t5d = await page.evaluate(() => ({ miss: S._hudMiss, nudge: !!document.querySelector('#tourHud .hud-nudge') }));
  ok(t5d.miss === 0 && !t5d.nudge, 'a correct key clears the counter and the nudge', JSON.stringify(t5d));

  // (c) the HUD never covers the active cell, at any row of the board
  const t5e = await page.evaluate(() => {
    let hits = 0, seen = 0;
    for (let r = 1; r <= S.ROWS; r++) {
      S.active = { r, c: 3 }; S.sel = null; render();
      const h = document.getElementById('tourHud'); if (!h) continue;
      const td = document.querySelector('#grid td[data-r="' + r + '"][data-c="3"]'); if (!td) continue;
      seen++;
      const a = td.getBoundingClientRect(), b = h.getBoundingClientRect();
      if (!(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom)) hits++;
    }
    return { hits, seen };
  });
  ok(t5e.seen > 0 && t5e.hits === 0, 'the HUD never covers the active cell, on any row (§3.0.2(1))', JSON.stringify(t5e));

  // (d) the HUD exists only while the Tour is running (§7)
  await page.evaluate(() => loadChallenge('filldr'));
  await page.waitForTimeout(600);
  const t5f = await page.evaluate(() => ({ tourMode, hud: !!document.getElementById('tourHud'),
    card: document.getElementById('tourWrap').classList.contains('on') }));
  ok(!t5f.tourMode && !t5f.hud && !t5f.card, 'leaving the Tour tears the HUD and the card down (§7)', JSON.stringify(t5f));

  console.log('T6 stage 5 forces the ribbon bar on, and gives the player\'s setting back (T3)');
  await fresh('1');
  await page.keyboard.press('Enter'); await page.waitForTimeout(560);   // stage 1's card, out of the way
  const t6 = await page.evaluate(() => {
    const C = CHALLENGES.keyboardtour;
    localStorage.removeItem('hk_ribbon_bar');
    const before = localStorage.getItem('hk_ribbon_bar');
    S._tourKey = {}; for (let i = 0; i < 24; i++) S._tourKey[i] = true;
    S._tourOk = new Array(24).fill(false); for (let i = 0; i < 18; i++) S._tourOk[i] = true;
    tourStage = -1; __tourCardOn = false; __tourPrevOk = 18;
    hkTourStageCard(4);
    return { before };
  });
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(600);
  const t6b = await page.evaluate(() => ({ bar: localStorage.getItem('hk_ribbon_bar'),
    chips: (document.getElementById('ribbonSlot') || {}).innerHTML.length, stage: tourStage,
    hudTop: (function(){ const h=document.getElementById('tourHud'); return h ? h.getBoundingClientRect().top : null; })(),
    hudUp: !!document.getElementById('tourHud'),
    flipped: !!(document.getElementById('tourHud') || {}).classList?.contains('top'),
    ribBot: document.getElementById('ribbonSlot').getBoundingClientRect().bottom }));
  ok(t6.before === null && t6b.bar === '1', 'stage 5 forces the lean ribbon bar on for a player who had it off', JSON.stringify({ ...t6, ...{ bar: t6b.bar } }));
  ok(t6b.chips > 500, '…so the KeyTip letters the card names are on screen while they are pressed', String(t6b.chips));
  ok(t6b.hudUp && t6b.hudTop > t6b.ribBot, 'and the banner sits BELOW the ribbon bar, never over it (§3.0.5)',
    JSON.stringify({ hud: Math.round(t6b.hudTop), rib: Math.round(t6b.ribBot), flipped: t6b.flipped, up: t6b.hudUp }));
  await page.evaluate(() => loadChallenge('filldr'));
  await page.waitForTimeout(500);
  ok((await page.evaluate(() => localStorage.getItem('hk_ribbon_bar'))) === null,
    'leaving the Tour restores the player\'s own ribbon-bar setting (T3)');

  console.log('T7 the warm-up sandbox is RETIRED (§1.7, decision T2)');
  const t7 = await page.evaluate(() => ({
    startSandbox: typeof startSandbox, exitSandbox: typeof exitSandbox,
    sandboxReadyCard: typeof sandboxReadyCard, sandboxCallout: typeof sandboxCallout,
    startOnboardBoard: typeof startOnboardBoard, sbCell: typeof sbCell,
    startGuidedIntro: typeof startGuidedIntro, introRibbonPeek: typeof introRibbonPeek,
    flagKept: typeof sandboxMode,
    tourSteps: TOUR_STEPS.length, novice: TOUR_STEPS.filter(s => s.novice).length,
    doIt: TOUR_STEPS.filter(s => s.doIt || s.entry).length,
    folded: TOUR_STEPS.filter(s => /\.cl-inner|\.drillbar|#hintsToggle/.test(s.sel || '')).length,
  }));
  ok(['startSandbox','exitSandbox','sandboxReadyCard','sandboxCallout','startOnboardBoard','sbCell',
      'startGuidedIntro','introRibbonPeek'].every(k => t7[k] === 'undefined'),
    'every sandbox / onboard-board function is gone', JSON.stringify(t7));
  ok(t7.flagKept === 'boolean', '…but the sandboxMode FLAG stays (§8 do-not-change #6)', t7.flagKept);
  ok(t7.novice === 0 && t7.doIt === 0, 'TOUR_STEPS has no Excel-teaching beats left (A8)', JSON.stringify(t7));
  ok(t7.folded === 0, '…and the three that fold into the Tour have left it (§3.0.6)', String(t7.folded));
  ok(t7.tourSteps === 5, 'what remains is the five-beat PRODUCT tour for the skip path', String(t7.tourSteps));

  console.log('T8 the other two comfort answers, and the ? sheet\'s two doors (§1.7, §3.0.4(8))');
  await fresh('2');   // "I get around" → OFFERED the Tour, one line, skippable
  const t8 = await page.evaluate(() => ({ card: document.getElementById('tourWrap').classList.contains('on'),
    txt: (document.getElementById('tourCard') || {}).innerText || '', cur, tourMode }));
  ok(t8.card && /NEW HERE\?/i.test(t8.txt), '"I get around" is OFFERED the Tour in one line', t8.txt.slice(0, 60));
  ok(!t8.tourMode, '…and is not dropped into it unasked', JSON.stringify({ tourMode: t8.tourMode }));
  await page.keyboard.press('Enter'); await page.waitForTimeout(1100);
  ok((await page.evaluate(() => tourMode)) === true, '…Enter takes the offer');

  await fresh('2');
  await page.keyboard.press('Escape'); await page.waitForTimeout(1400);
  const t8b = await page.evaluate(() => ({ tourMode, cur,
    tour: document.getElementById('tourWrap').classList.contains('on') }));
  ok(!t8b.tourMode && t8b.cur !== 'keyboardtour', '…Esc declines it and goes to the drills', JSON.stringify(t8b));

  await fresh('3');   // "I live in it" → straight to the drills, the Tour on the ? sheet
  const t8c = await page.evaluate(() => ({ tourMode, cur }));
  ok(!t8c.tourMode && t8c.cur !== 'keyboardtour', '"I live in it" never sees the Tour', JSON.stringify(t8c));
  await page.evaluate(() => { try { tourShow(999); } catch (e) {} openKbd(); });
  await page.waitForTimeout(400);
  const t8d = await page.evaluate(() => ({
    tour: (document.getElementById('kbKeyTour') || {}).textContent || null,
    replay: (document.getElementById('kbReplayTour') || {}).textContent || null }));
  ok(/keyboard tour/i.test(t8d.tour || ''), 'the ? sheet carries "▶ the keyboard tour"', String(t8d.tour));
  ok(/replay/i.test(t8d.replay || ''), '…beside the product tour\'s replay', String(t8d.replay));
  await page.evaluate(() => document.getElementById('kbKeyTour').click());
  await page.waitForTimeout(800);
  const t8e = await page.evaluate(() => ({ cur, tourMode, card: __tourCardOn }));
  ok(t8e.cur === 'keyboardtour' && t8e.tourMode && t8e.card, 'and it starts the Tour at stage 1', JSON.stringify(t8e));
  const t8f = await page.evaluate(() => { localStorage.setItem('hk_tour_done_v2', '1');
    const est = localStorage.getItem('hk_xp_est'); return est; });
  await page.evaluate(() => { S._tourOk = new Array(24).fill(true); __tourCardOn = false; tourStage = 5; __tourPrevOk = 23; render(); });
  await page.waitForTimeout(700);
  ok((await page.evaluate(() => localStorage.getItem('hk_xp_est'))) === t8f,
    'a replay of a finished Tour pays the +25 bounty a second time? no — it pays once (T1)', String(t8f));
  await page.keyboard.press('Enter'); await page.waitForTimeout(900);

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

  /* T10 (r452 bug sweep P1-2): ESC CLOSES THE SIGN-IN MODAL. The keydown handler's
     INPUT/TEXTAREA bail sits above the authOpen branch and the modal focuses its own email
     field on open, so every Esc landed in the input and died — the modal had NO keyboard exit
     while the ? sheet promises "Esc — close menus & modals". Pressed as a real key with the
     focus where the modal actually leaves it, which is the whole point of the bug. */
  console.log('T10 esc closes the sign-in modal (the ? sheet\'s "close menus & modals" contract)');
  await page.evaluate(() => { try { openAuth('signin'); } catch (e) {} });
  await page.waitForTimeout(250);
  const escA = await page.evaluate(() => ({
    open: typeof authOpen !== 'undefined' && authOpen === true,
    shown: !!(document.getElementById('authModal') || {}).classList &&
      document.getElementById('authModal').classList.contains('show'),
    focus: (document.activeElement || {}).tagName
  }));
  ok(escA.open && escA.shown, 'the sign-in modal opens', JSON.stringify(escA));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  const escB = await page.evaluate(() => ({
    open: typeof authOpen !== 'undefined' ? authOpen : null,
    shown: document.getElementById('authModal').classList.contains('show')
  }));
  ok(escB.open === false && escB.shown === false,
    'Escape closes it from inside the focused field (authOpen false, modal hidden)',
    JSON.stringify({ before: escA, after: escB }));

  const realErrors = errs.filter(e => !/supabase|Failed to fetch|NetworkError|ERR_/i.test(e));
  ok(realErrors.length === 0, 'zero page errors through onboarding', realErrors.join(' | '));
  await browser.close();
  console.log((fail ? 'ONBOARD AUDIT: ' + fail + ' FAILURE(S), ' : 'ONBOARD AUDIT: ALL ') + pass + ' PASS');
  process.exit(fail ? 1 : 0);
})();
