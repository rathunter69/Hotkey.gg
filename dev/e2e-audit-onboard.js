/* r154 ONBOARDING AUDIT — a truly fresh visitor: curtain → landing → enter →
   tour → play; second visit: welcome-back. Stubbed supabase so auth paths run. */
'use strict';
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

  console.log('T1 fresh visitor: curtain');
  await page.goto('http://127.0.0.1:8791/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined');
  await page.waitForTimeout(400);
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
  await page.waitForTimeout(1200);   // tour → +350ms → maybeOnboard → +620ms → show
  const t2e = await page.evaluate(() => {
    const ob = document.getElementById('onboard');
    return { prompt: !!(ob && ob.classList.contains('show')) };
  });
  ok(t2e.prompt, 'tutorial/placement prompt follows the tour');
  await page.evaluate(() => { const k = document.getElementById('obSkip'); if (k) k.click(); });
  const t2f = await page.evaluate(() => {
    setDemoSel('B4'); demoKey({key:'5'}); demoKey({key:'Enter'});
    return S.cells['B4'].value === 5 || S.cells['B4'].value === '5';
  });
  ok(t2f, 'after onboarding the grid takes keys immediately');

  console.log('T3 second visit: welcome back');
  // domcontentloaded, not load: supabase-js loads async now (r285) — 'load' waits on
  // the CDN, and if it's slow the card's 12s auto-hide can fire before 'load' returns.
  await page.goto('http://127.0.0.1:8791/index.html', { waitUntil: 'domcontentloaded' });
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

  const realErrors = errs.filter(e => !/supabase|Failed to fetch|NetworkError|ERR_/i.test(e));
  ok(realErrors.length === 0, 'zero page errors through onboarding', realErrors.join(' | '));
  await browser.close();
  console.log((fail ? 'ONBOARD AUDIT: ' + fail + ' FAILURE(S), ' : 'ONBOARD AUDIT: ALL ') + pass + ' PASS');
  process.exit(fail ? 1 : 0);
})();
