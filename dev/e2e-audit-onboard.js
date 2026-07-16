/* r154 ONBOARDING AUDIT — a truly fresh visitor: curtain → landing → enter →
   tour → play; second visit: welcome-back. Stubbed supabase so auth paths run. */
'use strict';
const { chromium } = require('playwright-core');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
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
  await page.goto('http://127.0.0.1:8791/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined');
  await page.waitForTimeout(700);
  const t3 = await page.evaluate(() => {
    const w = document.getElementById('wbDlg');
    return { up: !!(w && getComputedStyle(w).display !== 'none'), gateGone: !document.getElementById('gate').classList.contains('show'),
      landingGone: document.getElementById('landing').classList.contains('gone') };
  });
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

  console.log('T4 the novice branch: primer before tour (r159)');
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
  await page.waitForTimeout(500);
  const t4b = await page.evaluate(() => {
    const m = document.getElementById('primerCard');
    return { up: !!(m && m.classList.contains('show')), first: m ? /the grid/i.test(m.innerText) : false };
  });
  ok(t4b.up && t4b.first, 'excel-from-zero primer opens on card 1 (the grid)');
  for (let i = 0; i < 5; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(220); }
  const t4c = await page.evaluate(() => ({
    done: localStorage.getItem('hk_primer_done') === '1',
    xlv: localStorage.getItem('hk_xlv') === '0',
    tourUp: !!(document.getElementById('tourWrap') && document.getElementById('tourWrap').classList.contains('on')),
  }));
  ok(t4c.done && t4c.xlv, 'primer completes and remembers the novice');
  ok(t4c.tourUp, 'product tour follows the primer');

  // T4b (r175): the interactive tour — do-it beats let ONLY the asked chord
  // through to the live sheet; the chord executes for real and advances the tour.
  await page.evaluate(() => { ['hk_tour_done'].forEach(k => localStorage.removeItem(k)); });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined');
  await page.waitForTimeout(700);
  await page.keyboard.press('Enter');            // landing
  await page.waitForTimeout(1000);
  const t4d0 = await page.evaluate(() => (typeof __tourI !== 'undefined') ? __tourI : -9);
  ok(t4d0 === 0, 'tour v2 opens on the do-it hook', t4d0);
  await page.keyboard.press('x'); await page.keyboard.press('7');
  const t4d1 = await page.evaluate(() => ({ i: __tourI, editing: editing }));
  ok(t4d1.i === 0 && !t4d1.editing, 'stray keys stay blocked on a do-it beat');
  const before = await page.evaluate(() => S.active.c);
  await page.keyboard.press('Control+ArrowRight');
  await page.waitForTimeout(1200);
  const t4d2 = await page.evaluate(() => ({ i: __tourI, c: S.active.c }));
  ok(t4d2.i === 1, 'the asked chord advances the tour', t4d2.i);
  ok(t4d2.c > before, 'and it executed on the LIVE sheet (cursor moved)', before + '->' + t4d2.c);
  await page.keyboard.press('Control+Shift+ArrowDown');
  await page.waitForTimeout(1200);
  const t4d3 = await page.evaluate(() => ({ i: __tourI, why: /why this exists/i.test(document.getElementById('tourCard').innerText) }));
  ok(t4d3.i === 2 && t4d3.why, 'second beat lands on the why-card', JSON.stringify(t4d3));
  for (let i = 0; i < 5; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(220); }

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
