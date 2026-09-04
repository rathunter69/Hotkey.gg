#!/usr/bin/env node
/* r450 DRILL-START GATE GUARD (Wolf: "clicking a drill drops you straight onto a live board —
   there is no standard start point, and t=0 is ambiguous relative to an accidental first
   keystroke, so par and leaderboard times are not measured from a uniform zero").

   THIS IS THE ONE SUITE IN THE BATTERY THAT KEYS THROUGH THE REAL GATE. Every other dev/
   harness sets hk_gate_off='1' in its init block, because the gate swallows the first key of
   any driven route and would cost each of them exactly one keystroke and therefore the win
   (measured r450: filldr 44→43, navigation 17→16, combo 25→24 logged keys, none winning).
   Two exceptions by design: this file, and dev/check-pause.js — see the note in
   dev/e2e-demo-replay.js, which is the reference copy of the shared init block.

   What it proves, in the order the feature was specified:
     §1  the overlay is present at load and the clock is at zero
     §2  input is LOCKED before the start — the board cannot move, cannot enter edit mode
     §3  the first key is SWALLOWED: not on the grid, not in keyLog, not counted against par
     §4  the clock starts at t=0 at that instant (and only then)
     §5  Esc·Esc RE-ARMS the gate, and so do restart / drill-switch / win→next
     §6  no stacking with the r429 blur-pause: a blur at the gate must not paint a second
         scrim and must not start the clock
     §7  PAR INTEGRITY, measured both ways on three drills: the same demo route driven with
         the gate armed (paying one gate key) and with hk_gate_off logs the SAME keyLog and
         wins the same way. This is the assertion that makes every other suite's hk_gate_off
         honest — without it, opting the battery out would prove nothing about par.
     §8c r455: a LEVEL drill is gated like every other drill. Wolf's round-2 direction keeps
         the drill surface on the site's original chrome, so a level adds NO surface here: the
         same scrim, the same copy, the same swallowed first key — plus one skip line on the
         gate's own sub-line, and the act controller armed behind it
     §8  the deliberate NON-gates: THE KEYBOARD TOUR, live session, watch-solution demo —
         and the one surface that REPLACES the gate rather than declining it, the r452
         lesson card (§1.5: on a lesson drill the card IS the gate, so one keypress both
         dismisses it and starts the clock, and honest t=0 survives with ONE surface
         instead of two stacked over each other).

   Run: CHROME=<chromium> BASE=http://127.0.0.1:8791 node dev/check-startgate.js  */
'use strict';
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:8791';
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const DRILL = 'filldr';                 // a plain Foundations board: no gating tier, short demo
const PAR_SET = ['filldr', 'navigation', 'combo'];

let fail = 0;
const check = (ok, label, extra) => { if (!ok) fail++; console.log('  ' + (ok ? 'ok  ' : 'FAIL') + ' ' + label + (extra ? '  ' + extra : '')); };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));

  /* The returning-user init the whole battery shares — MINUS hk_gate_off, deliberately.
     hk_start_coach is latched so the first-drill coach card never varies the DOM under us. */
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1');
    localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1');
    localStorage.setItem('hk_handle_cache', '');
    localStorage.setItem('hk_start_coach', '1');
    /* r455: Foundations 1 (MENU_ORDER[0], the boot board) coaches on a FIRST play — the step
       controller arms behind the gate and adds a skip line to it, which is a different contract
       from the plain gate every section below measures. Latched as already-seen here so §1–§7
       test the plain gate; §8c clears the latch and proves the tutorial contract on its own. */
    localStorage.setItem('hk_guide_navigation', 'done');
  } catch (e) {} });
  await page.goto(BASE + '/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => typeof loadChallenge === 'function' && typeof CHALLENGES !== 'undefined'
    && typeof hkGate !== 'undefined', null, { timeout: 15000 });
  await page.waitForTimeout(900);

  /* A fresh gated board, from the one path every route funnels through. The celebration
     sweep is not cosmetic: a queued level-up card sets window.__hkCelOpen, whose capture
     handler returns on every TRUSTED key — so a stray card from an earlier section makes
     the next `keyboard.press` vanish and the gate look stuck. (Cost one debug cycle in
     r450; the same sweep is why e2e-guided and e2e-depth-mechanics carry it.) */
  const noCel = () => page.evaluate(() => { try {
    window.__hkCelQ = []; document.querySelectorAll('.hk-cel-wrap').forEach(n => n.remove()); window.__hkCelOpen = false;
  } catch (e) {} });
  const load = async (k) => { await noCel(); await page.evaluate(d => loadChallenge(d), k || DRILL); await page.waitForTimeout(320); };
  /* Always press through here. A celebration queued by an earlier section pops on its own
     timer, and its capture handler returns on every TRUSTED key — so a stray card makes the
     next keyboard.press vanish and the gate look stuck. Clearing at load() is not enough:
     the card can open AFTER the load. (Cost one debug cycle in r450.) */
  const key = async (k, ms) => { await noCel(); await page.keyboard.press(k); await page.waitForTimeout(ms || 220); };
  const snap = () => page.evaluate(() => ({
    gate: hkGate, ov: document.querySelectorAll('#hkGate').length,
    pauseOv: document.querySelectorAll('#hkPause').length,
    running, paused, keys: keyLog.length, editing,
    act: S && S.active ? S.active.r + ',' + S.active.c : null,
    timer: document.getElementById('timer').textContent,
  }));

  console.log('§1 the gate is up at load, clock at zero');
  {
    const boot = await snap();
    check(boot.gate === true && boot.ov === 1, 'a booted board arms the gate', JSON.stringify(boot));
    await load();
    const s = await snap();
    check(s.gate === true && s.ov === 1, 'overlay present after loadChallenge', JSON.stringify(s));
    check(s.running === false && s.timer === '0.00', 'the clock is not running and reads 0.00', s.timer);
    const copy = await page.evaluate(() => (document.querySelector('#hkGate .hk-pause-card b') || {}).textContent || '');
    check(/press any key to start/i.test(copy), 'the overlay says "Press any key to start"', JSON.stringify(copy));
    const geom = await page.evaluate(() => {
      const g = document.getElementById('hkGate'), w = document.querySelector('.gridwrap');
      if (!g || !w) return null;
      const a = g.getBoundingClientRect(), b = w.getBoundingClientRect();
      return { covers: Math.abs(a.width - b.width) < 2 && Math.abs(a.height - b.height) < 2, w: a.width | 0 };
    });
    check(geom && geom.covers, 'the scrim covers the grid (and only the grid)', JSON.stringify(geom));
  }

  console.log('\n§2 input is LOCKED before the start');
  {
    await load();
    const before = await snap();
    await key('Shift', 120);                     // a bare modifier must not be mistaken for a start
    const mod = await snap();
    check(mod.gate === true && mod.running === false, 'a bare modifier does not start the run', JSON.stringify(mod));
    check(mod.act === before.act, 'and does not move the cursor');
  }

  console.log('\n§3 the first key is SWALLOWED');
  {
    await load();
    const before = await snap();
    await key('ArrowDown');
    const after = await snap();
    check(after.act === before.act, 'the start key does not move the cursor', before.act + ' -> ' + after.act);
    check(after.keys === 0, 'the start key is not in keyLog (so it cannot count against par)', String(after.keys));
    check(after.ov === 0 && after.gate === false, 'the overlay is gone', JSON.stringify(after));
    const kn = await page.evaluate(() => document.getElementById('keyN').textContent);
    check(kn === '0' || kn === '', 'the key counter still reads zero', JSON.stringify(kn));

    // a printable start key must not open an edit — the worst version of the old bug
    await load();
    await key('5');
    const p = await snap();
    check(p.editing === false && p.keys === 0, 'a printable start key does not enter edit mode', JSON.stringify(p));
    const buf = await page.evaluate(() => editBuf);
    check(buf === '', 'and leaves no edit buffer behind', JSON.stringify(buf));
  }

  console.log('\n§4 the clock starts at that instant');
  {
    await load();
    await page.waitForTimeout(700);                       // sit at the gate
    const idle = await page.evaluate(() => document.getElementById('timer').textContent);
    check(idle === '0.00', 'waiting at the gate costs nothing', idle);
    await key('ArrowDown', 60);
    const t0 = parseFloat(await page.evaluate(() => document.getElementById('timer').textContent));
    check(t0 < 0.30, 'the clock reads ~0 immediately after the start key', String(t0));
    await page.waitForTimeout(700);
    const t1 = parseFloat(await page.evaluate(() => document.getElementById('timer').textContent));
    check(t1 > t0, 'and it is running', t0 + ' -> ' + t1);
    // the SECOND key is a real move, logged
    await key('ArrowDown', 200);
    const s = await snap();
    check(s.keys === 1, 'the second key is the run\'s first logged keystroke', String(s.keys));
  }

  console.log('\n§5 every re-entry re-arms');
  {
    // Esc·Esc
    await load();
    await key('ArrowDown', 150);
    await key('Escape', 60);
    await key('Escape', 420);
    const e = await snap();
    check(e.gate === true && e.ov === 1 && e.running === false && e.timer === '0.00',
      'Esc·Esc restart re-arms the gate on a zeroed clock', JSON.stringify(e));

    // Shift+F11
    await key('ArrowDown', 150);
    await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F11', shiftKey: true, bubbles: true, cancelable: true })));
    await page.waitForTimeout(320);
    check((await snap()).gate === true, 'Shift+F11 restart re-arms');

    // drill switch
    await page.evaluate(() => loadChallenge('pastes')); await page.waitForTimeout(320);
    check((await snap()).gate === true, 'a drill switch re-arms');

    // win -> next drill (drive the win with the gate off, then take the hand-off gated)
    const won = await page.evaluate(() => {
      localStorage.setItem('hk_gate_off', '1');
      loadChallenge('filldr');
      const C = CHALLENGES.filldr, mv = (typeof C.demo === 'function') ? C.demo.call(C) : C.demo;
      for (const m of mv) { setDemoSel(m.sel); for (const k of m.keys) demoKey(k); }
      localStorage.removeItem('hk_gate_off');
      return done;
    });
    check(won === true, 'the reference route still wins with the gate off (control)');
    await page.evaluate(() => { try { window.__hkCelQ = []; document.querySelectorAll('.hk-cel-wrap').forEach(n => n.remove()); window.__hkCelOpen = false; } catch (e) {} });
    await page.evaluate(() => loadChallenge(nextDrillKey()));
    await page.waitForTimeout(320);
    const nx = await snap();
    check(nx.gate === true && nx.running === false, 'win → next drill hands over a GATED board', JSON.stringify(nx));
  }

  console.log('\n§6 no stacking with the r429 blur-pause');
  {
    await load();
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await page.waitForTimeout(220);
    const b = await snap();
    check(b.pauseOv === 0, 'a blur at the gate paints NO pause scrim (no stacking)', JSON.stringify(b));
    check(b.paused === false, 'and does not enter the paused state');
    check(b.running === false && b.ov === 1, 'the gate survives the blur, clock still at zero', JSON.stringify(b));
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await page.waitForTimeout(150);
    check((await snap()).pauseOv === 0, 'a visibilitychange at the gate is equally inert');

    // and the pause still works once the run is real
    await key('ArrowDown', 200);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await page.waitForTimeout(220);
    const mid = await snap();
    check(mid.paused === true && mid.pauseOv === 1 && mid.ov === 0,
      'after the start, a blur pauses exactly as it always did — one scrim, the pause one', JSON.stringify(mid));
    await key('ArrowDown', 200);
    check((await snap()).paused === false, 'and resumes on a key');
  }

  console.log('\n§7 PAR INTEGRITY — the same route, gate on vs gate off');
  {
    const measure = await page.evaluate((keys) => {
      const run = (k) => {
        loadChallenge(k);
        const C = CHALLENGES[k], mv = (typeof C.demo === 'function') ? C.demo.call(C) : C.demo;
        const k0 = keyLog.length;
        // when the gate is armed this synthetic key IS the start key, and is swallowed
        if (hkGate) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true }));
        for (const m of mv) { setDemoSel(m.sel); for (const kk of m.keys) demoKey(kk); }
        return { logged: keyLog.length - k0, won: done, par: C.parKeys };
      };
      const out = {};
      for (const k of keys) {
        window.__forceSeed = 4242;                      // same board both ways
        localStorage.removeItem('hk_gate_off');
        const on = run(k);
        window.__forceSeed = 4242;
        localStorage.setItem('hk_gate_off', '1');
        const off = run(k);
        localStorage.removeItem('hk_gate_off');
        out[k] = { on, off };
      }
      return out;
    }, PAR_SET);
    for (const k of PAR_SET) {
      const m = measure[k];
      check(m.on.logged === m.off.logged,
        k + ': keyLog identical with the gate armed and disarmed', m.on.logged + ' vs ' + m.off.logged);
      check(m.on.won === true && m.off.won === true,
        k + ': the route wins both ways (the gate key is not part of the route)', JSON.stringify(m));
      check(m.on.logged === m.off.logged && Math.abs(m.on.logged - m.on.par) <= 2,
        k + ': logged keys still track parKeys', m.on.logged + ' vs par ' + m.on.par);
    }
  }

  console.log('\n§8 the deliberate NON-gates');
  {
    /* r452: the warm-up sandbox is RETIRED (dev/TUTORIAL_CHAPTER_SPEC.md §1.7, decision T2) and
       THE KEYBOARD TOUR took over its place in this list. Same rationale, re-pointed: the Tour is
       untimed, so a start gate over it would promise a clock that startClock() refuses to run.
       Two flags carry it — hkGateArm declines on tourMode, and startKeyboardTour calls
       hkGateClear() on every entry (index.html, the r450 comment the sandbox used to own). */
    await page.evaluate(() => { try { startKeyboardTour(); } catch (e) {} });
    await page.waitForTimeout(700);
    const kt = await page.evaluate(() => ({ tour: tourMode, cur, gate: hkGate,
      ov: document.querySelectorAll('#hkGate').length, running,
      timer: document.getElementById('timer').textContent }));
    check(kt.tour === true && kt.cur === 'keyboardtour' && kt.gate === false && kt.ov === 0,
      'the Keyboard Tour is never gated (it is never timed)', JSON.stringify(kt));
    check(kt.running === false && kt.timer === '\u2014',
      'and its clock is not merely stopped \u2014 there is no clock to run', JSON.stringify(kt));
    /* and it STAYS unclocked once the player starts pressing keys: startClock bails on tourMode,
       so the dozens of startClock() calls scattered through the op handlers cannot start one */
    await page.evaluate(() => { try { hkLessonCardHide(); __tourCardOn = false; tourStage = 0; } catch (e) {} });
    await key('ArrowRight', 120); await key('Control+ArrowRight', 200); await key('Control+b', 200);
    const kt2 = await page.evaluate(() => ({ running, timer: document.getElementById('timer').textContent, done }));
    check(kt2.running === false && kt2.timer === '\u2014' && kt2.done === false,
      'keys on the Tour board never start a clock (startClock declines tourMode)', JSON.stringify(kt2));
    await page.evaluate(() => { try { loadChallenge('filldr'); } catch (e) {} });
    await page.waitForTimeout(400);
    check((await snap()).gate === true, 'and the board it hands back IS gated');

    await load();
    await page.evaluate(() => { try { _pro = true; } catch (e) {} startSession('marathon', 120); });
    await page.waitForTimeout(600);
    const ma = await page.evaluate(() => ({ mode: gameMode, gate: hkGate, ov: document.querySelectorAll('#hkGate').length }));
    check(ma.mode === 'marathon' && ma.gate === false && ma.ov === 0,
      'a session is not gated per drill — the session has one start', JSON.stringify(ma));
    await page.evaluate(() => loadNext()); await page.waitForTimeout(400);
    check((await page.evaluate(() => document.querySelectorAll('#hkGate').length)) === 0,
      'and the next card inside the session is not gated either');
    await page.evaluate(() => exitSession()); await page.waitForTimeout(420);
    check((await snap()).gate === true, 'leaving the session returns to a gated classic board');

    await load();
    await page.evaluate(() => { window.__dp = playDemo(); });
    await page.waitForTimeout(800);
    const dm = await page.evaluate(() => ({ demo: demoPlaying, gate: hkGate, ov: document.querySelectorAll('#hkGate').length }));
    check(dm.demo === true && dm.ov === 0, 'watch-solution is not gated (it drives its own keys)', JSON.stringify(dm));
    await page.evaluate(() => cancelDemo());
    await page.waitForTimeout(2400);
    check((await snap()).gate === true, 'and the board it hands back IS gated');
  }

  console.log('\n\u00a78b the LESSON CARD is the gate (r452, spec \u00a71.5)');
  {
    /* No lesson drill ships yet \u2014 the four of \u00a73.1\u20133.4 are a later wave \u2014 so the platform is
       proved against a synthetic one: a `lesson` object stapled onto a real drill. That is
       exactly what those drills will declare, and it is the whole contract this surface owes
       them: the card REPLACES the r450 scrim (never stacks on it), one keypress dismisses the
       card AND starts the clock, and the start key is still swallowed so t=0 stays honest. */
    await page.evaluate(() => {
      CHALLENGES.filldr.lesson = { title: 'Fill it down', keys: ['ctrl+d', 'ctrl+r'],
        body: 'A formula filled down carries its row references with it. Ctrl+D fills from above, Ctrl+R from the left.' };
      try { localStorage.removeItem('hk_lessons_off'); } catch (e) {}
    });
    await load('filldr');
    await page.waitForTimeout(400);
    const lc = await page.evaluate(() => ({
      card: document.getElementById('tourWrap').classList.contains('on'),
      txt: (document.getElementById('tourCard') || {}).innerText || '',
      scrim: document.querySelectorAll('#hkGate').length,
      gate: hkGate, running, timer: document.getElementById('timer').textContent, keys: keyLog.length,
    }));
    check(lc.card && /Fill it down/.test(lc.txt), 'a lesson drill opens on its lesson card', lc.txt.slice(0, 50));
    check(lc.scrim === 0 && lc.gate === true,
      'the card REPLACES the gate scrim \u2014 one surface, not two stacked', JSON.stringify(lc));
    check(lc.running === false && lc.timer === '0.00', 'the clock has not started behind it', JSON.stringify(lc));
    await key('ArrowDown', 320);
    const lc2 = await page.evaluate(() => ({
      card: document.getElementById('tourWrap').classList.contains('on'),
      gate: hkGate, running, keys: keyLog.length,
      act: S && S.active ? S.active.r + ',' + S.active.c : null,
      t: parseFloat(document.getElementById('timer').textContent),
    }));
    check(!lc2.card, 'one keypress dismisses the card');
    check(lc2.running === true && lc2.gate === false, '\u2026and the same keypress starts the clock', JSON.stringify(lc2));
    check(lc2.keys === 0 && lc2.t < 0.4, '\u2026with the key swallowed and t=0 honest', JSON.stringify(lc2));
    /* the one toggle turns it off forever, and then the plain r450 gate is back */
    await page.evaluate(() => { try { localStorage.setItem('hk_lessons_off', '1'); } catch (e) {} });
    await load('filldr');
    const lc3 = await page.evaluate(() => ({
      card: document.getElementById('tourWrap').classList.contains('on'),
      scrim: document.querySelectorAll('#hkGate').length, gate: hkGate }));
    check(!lc3.card && lc3.scrim === 1 && lc3.gate === true,
      'hk_lessons_off puts the plain start gate back (\u00a71.5: dismissable forever)', JSON.stringify(lc3));
    await page.evaluate(() => { try { delete CHALLENGES.filldr.lesson; localStorage.removeItem('hk_lessons_off'); } catch (e) {} });
  }

  console.log('\n\u00a78c a TUTORIAL is gated like any other drill (r455, Phase B)');
  {
    /* The step controller adds no start surface: Wolf's round-2 direction keeps the drill
       board on the site's original chrome, so what a first-play tutorial shows is the SAME r450
       scrim every other drill shows. The only difference is one extra line on the scrim's own
       sub-line ("already fly? skip the tutorial →") and the step controller armed behind it, so
       the checklist and its hint row speak for step 1 from the first key. */
    const LK = await page.evaluate(() => MENU_ORDER[0]);
    await page.evaluate(k => { try { localStorage.removeItem('hk_guide_' + k); } catch (e) {} }, LK);
    await load(LK);
    await page.waitForTimeout(400);
    const a = await page.evaluate(() => ({
      scrim: document.querySelectorAll('#hkGate').length, gate: hkGate, running,
      timer: document.getElementById('timer').textContent,
      copy: (document.querySelector('#hkGate .hk-pause-card b') || {}).textContent || '',
      skip: (document.getElementById('lcSkip') || {}).textContent || null,
      card: document.getElementById('tourWrap').classList.contains('on'),
      hud: !!document.getElementById('hkHud'),
      stepMode, step: S && S.step,
      head: (document.querySelector('#checklist .cl-head') || {}).textContent || '',
    }));
    check(a.scrim === 1 && a.gate === true, 'a tutorial arms the SAME scrim as every other drill', JSON.stringify({ s: a.scrim, g: a.gate }));
    check(/press any key to start/i.test(a.copy), '\u2026with the same copy', a.copy);
    check(!a.card && !a.hud, '\u2026and adds NO card and NO banner (the drill surface keeps its chrome)', JSON.stringify({ c: a.card, h: a.hud }));
    check(a.running === false && a.timer === '0.00', 'the clock has not started', a.timer);
    check(/skip the tutorial/i.test(a.skip || ''), 'the one skip line rides the gate\'s own sub-line', String(a.skip));
    check(a.stepMode === true && a.step === 0, 'the step controller is armed on step 1 behind it', JSON.stringify({ m: a.stepMode, step: a.step }));
    check(/step 1 of/.test(a.head), '\u2026and the ordinary checklist head names the step', a.head);
    await key('Shift', 200);
    const b = await page.evaluate(() => ({ gate: hkGate, running }));
    check(b.gate === true && b.running === false, 'a bare modifier still does not start the run', JSON.stringify(b));
    await key('ArrowDown', 340);
    const c = await page.evaluate(() => ({ gate: hkGate, running, keys: keyLog.length, step: S.step,
      t: parseFloat(document.getElementById('timer').textContent) }));
    check(c.running === true && c.gate === false, 'one keypress starts the clock', JSON.stringify({ r: c.running, g: c.gate }));
    check(c.keys === 0 && c.t < 0.6, '\u2026with the key swallowed and t=0 honest', JSON.stringify({ k: c.keys, t: c.t }));
    /* a CLEARED tutorial: the coaching goes quiet, the gate does not change at all */
    await page.evaluate(k => { try { localStorage.setItem('hk_guide_' + k, 'done'); } catch (e) {} }, LK);
    await load(LK);
    await page.waitForTimeout(300);
    const d = await page.evaluate(() => ({ scrim: document.querySelectorAll('#hkGate').length, gate: hkGate,
      stepMode, step: S && S.step, skip: !!document.getElementById('lcSkip'),
      head: (document.querySelector('#checklist .cl-head') || {}).textContent || '' }));
    check(d.scrim === 1 && d.gate === true, 'a cleared tutorial is gated identically', JSON.stringify({ s: d.scrim, g: d.gate }));
    check(!d.stepMode && d.step === -1, '\u2026with the step controller stood down', JSON.stringify({ m: d.stepMode, s: d.step }));
    check(!d.skip, '\u2026and no skip line (a first-play affordance only)', String(d.skip));
    check(/checklist/.test(d.head), '\u2026and the ordinary checklist head back', d.head);
  }

  const real = errs.filter(e => !/supabase|Failed to fetch|NetworkError|ERR_/i.test(e));
  check(real.length === 0, 'zero page errors through the suite', real.join(' | '));

  await browser.close();
  console.log(fail ? '\nSTART GATE: ' + fail + ' FAILURE(S)' : '\nSTART GATE: clean');
  process.exit(fail ? 1 : 0);
})();
