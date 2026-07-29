/* r444 — txncomps DEPTH-PASS PROBE (DEPTH_PASS §4.61; WORKFLOW §9.1 lets a build agent own
   exactly its CHALLENGES block plus this one file, and this file names NO other drill — the
   C13 retirement guard sweeps dev/*.js for quoted keys).

   WHAT THIS PROVES, and why each part exists:

   §A  ROUTE ENUMERATION (DEPTH_PASS §1.0-R3(p) + CAMPAIGN §1). Thirteen untriggerable beats
       have been found in this campaign and every single one was found by WALKING a route, never
       by reading a predicate. So every legal Excel route to this board's visible end state is
       driven here and the beat it should flip is asserted. A beat that a correct board leaves
       dark is indistinguishable from a broken drill and is the worst defect we ship.
   §B  THE ☆, MEASURED THREE WAYS (DEPTH_PASS §1.0(d)/§1.0-R2(i), CAMPAIGN §2):
       (1) EARNED by every mechanic that is the same discipline — Ctrl+D, the ribbon fill
           Alt H F I D, and a copy of the head cell pasted over the block;
       (2) SKIPPABLE by MEASUREMENT, not assertion — the negative control types all six
           multiples, clears every core beat, and leaves the star dark;
       (3) WORTH SOMETHING — the two routes' key counts are printed, isolated to the fill so a
           combined number cannot hide a negative half (the r438 `series` rule).
   §C  BOARD CONTRACT — 20 rows, §1.3 density at the win state, no #### at load, and the
       geometry moats that stop Ctrl+Shift+↓ riding out of the deal tape.

   Run: node dev/verify-txncomps.js          (URL= overrides the server; see CAMPAIGN §4 —
   e2e-smoke/check-borders/check-pause read BASE, e2e-lb wants leaderboard.html, everything
   else reads URL). The init below mirrors the real harnesses exactly (hotkey_onboarded,
   hk_tour_done, hk_learn_done, hk_handle_cache); an init that does not is a probe that lies. */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const REPS = parseInt(process.env.REPS || '5', 10);
const KEY = 'txncomps';

let fails = 0;
const say = (ok, msg) => { if (!ok) fails++; console.log((ok ? '  ok  ' : ' FAIL ') + msg); };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_beta_ok', '1');
    localStorage.setItem('hk_xlv', '2'); localStorage.setItem('hk_handle_cache', '');
  } catch (e) {} });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function'
    && typeof setDemoSel === 'function' && typeof loadChallenge === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* drive a route (page-side source, receives the live challenge C) over REPS seeds and report
     the beat vector + key count. Every seed must agree — a route that clears on 3 of 5 seeds is
     a seed-dependent grader, which is the same defect wearing a different hat. */
  const walk = async (src) => {
    const out = [];
    for (let rep = 0; rep < REPS; rep++) {
      out.push(await page.evaluate(([k, s]) => {
        try {
          document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
          loadChallenge(k);
          const C = CHALLENGES[k];
          const moves = eval('(' + s + ')')(C);
          for (const mv of moves) { if (mv.sel) setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
          const rows = C.checks(S);
          return { keys: keyLog.length, done: !!done,
                   core: rows.filter(c => !c.bonus && !c.save).map(c => !!c.ok),
                   star: !!(rows.find(c => c.bonus) || {}).ok };
        } catch (e) { return { err: String((e && e.stack) || e).slice(0, 240) }; }
      }, [KEY, src]));
    }
    const e = out.find(o => o.err);
    if (e) return { err: e.err, keys: 0, core: [], star: false, agree: false };
    const first = JSON.stringify([out[0].core, out[0].star]);
    const agree = out.every(o => JSON.stringify([o.core, o.star]) === first);
    const ks = out.map(o => o.keys).sort((a, b) => a - b);
    return { keys: ks[Math.floor(ks.length / 2)], span: ks[0] + '-' + ks[ks.length - 1],
             core: out[0].core, star: out[0].star, agree };
  };

  const beat = ['multiples', 'median', 'implied EV', 'implied equity', 'the landing'];
  const report = (name, r, wantCore, wantStar) => {
    if (r.err) { say(false, name + ' — THREW: ' + r.err); return; }
    const missing = beat.filter((b, i) => wantCore[i] && !r.core[i]);
    const extra = beat.filter((b, i) => !wantCore[i] && r.core[i]);
    const okCore = !missing.length && !extra.length;
    const okStar = r.star === wantStar;
    say(okCore && okStar && r.agree,
      name + ' · ' + r.keys + ' keys [' + r.span + '] · core ' + r.core.map(x => x ? '1' : '0').join('')
      + ' · ☆ ' + (r.star ? 'EARNED' : 'dark')
      + (okCore ? '' : ' — dark that should clear: ' + (missing.join(', ') || '—')
                     + (extra.length ? ' / clear that should be dark: ' + extra.join(', ') : ''))
      + (okStar ? '' : ' — ☆ expected ' + (wantStar ? 'EARNED' : 'dark'))
      + (r.agree ? '' : ' — SEEDS DISAGREE'));
    return r;
  };
  const ALL = [true, true, true, true, true], NONE = [false, false, false, false, false];

  /* ---------- shared page-side fragments ---------------------------------------------- */
  const HEAD = `C => { const o=C._o;
    const SD=n=>{const a=[];for(let i=0;i<n;i++)a.push({key:'ArrowDown',shift:true});return a;};
    const mult=r=>'='+o.CD+r+'/'+o.CE+r;
    const typedAll=[];for(let i=0;i<6;i++){const r=o.d0+i;typedAll.push({sel:o.CF+r,keys:[...T(mult(r)),{key:'Enter'}]});}
    const MED={sel:o.CF+o.rMed,keys:[...T('=MEDIAN('+o.CF+o.d0+':'+o.CF+o.dN+')'),{key:'Enter'}]};
    const EV={sel:o.CD+o.rEV,keys:[...T('='+o.CD+o.rTgt+'*'+o.CF+o.rMed),{key:'Enter'}]};
    const EQ={sel:o.CD+o.rEq,keys:[...T('='+o.CD+o.rEV+'-'+o.CD+o.rNd),{key:'Enter'}]};
    const DRESS={sel:o.CD+o.rEq,keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]};
    return `;

  console.log('\n§A · ROUTE ENUMERATION — every legal route to the same visible end state (§1.0-R3(p))');

  await walk(HEAD + `[]; }`).then(r => report('A0  untouched board (all beats must be DARK)', r, NONE, false));

  await walk(HEAD + `[
    {sel:o.CF+o.d0,keys:[...T(mult(o.d0)),{key:'Enter'}]},
    {sel:o.CF+o.d0,keys:[...SD(5),{key:'d',ctrl:true}]},
    MED,EV,EQ,DRESS]; }`).then(r => report('A1  taught route (Ctrl+D · MEDIAN · bridge · Alt H B P)', r, ALL, true));

  await walk(HEAD + `[...typedAll,MED,EV,EQ,DRESS]; }`)
    .then(r => report('A2  six multiples TYPED, no fill at all (§1.0(c) freedom)', r, ALL, false));

  await walk(HEAD + `[
    {sel:o.CF+o.d0,keys:[...T('='+o.CD+o.d0+'/$'+o.CE+o.d0),{key:'Enter'}]},
    {sel:o.CF+o.d0,keys:[...SD(5),{key:'d',ctrl:true}]},
    MED,EV,EQ,DRESS]; }`)
    .then(r => report('A3  divisor column-ANCHORED then filled (the anchor habit)', r, ALL, true));

  await walk(HEAD + `[
    {sel:o.CF+o.d0,keys:[...T(mult(o.d0)),{key:'Enter'}]},
    {sel:o.CF+o.d0,keys:[...SD(5),{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
    MED,EV,EQ,DRESS]; }`)
    .then(r => report('A4  RIBBON fill Alt H F I D instead of Ctrl+D', r, ALL, true));

  await walk(HEAD + `[
    {sel:o.CF+o.d0,keys:[...T(mult(o.d0)),{key:'Enter'}]},
    {sel:o.CF+o.d0,keys:[{key:'c',ctrl:true}]},
    {sel:o.CF+(o.d0+1)+':'+o.CF+o.dN,keys:[{key:'v',ctrl:true}]},
    MED,EV,EQ,DRESS]; }`)
    .then(r => report('A5  head cell COPIED and pasted over the block', r, ALL, true));

  await walk(HEAD + `[
    {sel:o.CF+o.d0,keys:[...T(mult(o.d0)),{key:'Enter'}]},
    {sel:o.CF+o.d0,keys:[...SD(5),{key:'d',ctrl:true}]},
    {sel:o.CF+o.rMed,keys:[...T('=(SMALL('+o.CF+o.d0+':'+o.CF+o.dN+',3)+SMALL('+o.CF+o.d0+':'+o.CF+o.dN+',4))/2'),{key:'Enter'}]},
    EV,EQ,DRESS]; }`)
    .then(r => report('A6  median by the LONG HAND form (no MEDIAN in the text)', r, ALL, true));

  await walk(HEAD + `[
    {sel:o.CF+o.d0,keys:[...T(mult(o.d0)),{key:'Enter'}]},
    {sel:o.CF+o.d0,keys:[...SD(5),{key:'d',ctrl:true}]},
    MED,
    {sel:o.CD+o.rEV,keys:[...T('=$'+o.CF+'$'+o.rMed+'*$'+o.CD+'$'+o.rTgt),{key:'Enter'}]},
    {sel:o.CD+o.rEq,keys:[...T('=SUM($'+o.CD+'$'+o.rEV+')-$'+o.CD+'$'+o.rNd),{key:'Enter'}]},
    DRESS]; }`)
    .then(r => report('A7  bridge fully ANCHORED, operands reversed, SUM-wrapped', r, ALL, true));

  await walk(HEAD + `[
    EQ,EV,MED,
    {sel:o.CF+o.d0,keys:[...T(mult(o.d0)),{key:'Enter'}]},
    {sel:o.CF+o.d0,keys:[...SD(5),{key:'d',ctrl:true}]},
    DRESS]; }`)
    .then(r => report('A8  op ORDER reversed — bridge first, tape last (recalc catches up)', r, ALL, true));

  console.log('\n§A2 · the dress beat — every border route that paints a line above the landing');
  const dressRoutes = [
    ['Alt H B P  (top border → bt)',      `{key:'Alt'},L('h'),L('b'),L('p')`],
    ['Alt H B A  (all borders → ball)',   `{key:'Alt'},L('h'),L('b'),L('a')`],
    ['Alt H B S  (outside, 1x1 → ball)',  `{key:'Alt'},L('h'),L('b'),L('s')`],
    ['Alt H B T  (thick box → ball)',     `{key:'Alt'},L('h'),L('b'),L('t')`],
    ['Alt H B D  (top & bottom → bt)',    `{key:'Alt'},L('h'),L('b'),L('d')`],
  ];
  for (const [name, chord] of dressRoutes) {
    await walk(HEAD + `[
      {sel:o.CF+o.d0,keys:[...T(mult(o.d0)),{key:'Enter'}]},
      {sel:o.CF+o.d0,keys:[...SD(5),{key:'d',ctrl:true}]},
      MED,EV,EQ,
      {sel:o.CD+o.rEq,keys:[{key:'Alt'},L('h'),D(1),` + chord + `]}]; }`)
      .then(r => report('A9  ' + name + ' + ribbon bold Alt H 1', r, ALL, true));
  }
  await walk(HEAD + `[
    {sel:o.CF+o.d0,keys:[...T(mult(o.d0)),{key:'Enter'}]},
    {sel:o.CF+o.d0,keys:[...SD(5),{key:'d',ctrl:true}]},
    MED,EV,EQ,
    {sel:o.CA+o.rEq,keys:[{key:' ',shift:true},{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]}]; }`)
    .then(r => report('A10 whole ROW grabbed with Shift+Space, then dressed', r, ALL, true));

  console.log('\n§B · THE ☆ — earned, skippable, and worth something (§1.0(d)/§1.0-R2(i), CAMPAIGN §2)');
  /* Isolated so a combined number cannot hide a negative half (r438 `series`). Both fragments
     do EXACTLY the same work — six correct multiples on the board — and nothing else. */
  const starKeys = await walk(HEAD + `[
    {sel:o.CF+o.d0,keys:[...T(mult(o.d0)),{key:'Enter'}]},
    {sel:o.CF+o.d0,keys:[...SD(5),{key:'d',ctrl:true}]}]; }`);
  const slowKeys = await walk(HEAD + `[...typedAll]; }`);
  say(!starKeys.err && !slowKeys.err && starKeys.core[0] && slowKeys.core[0],
    'B1  both fill routes land the same six multiples (star route ' + starKeys.keys
    + ' keys, typed route ' + slowKeys.keys + ' keys)');
  say(starKeys.keys < slowKeys.keys,
    'B2  the ☆ route is CHEAPER than the route it beats — ' + starKeys.keys + ' vs ' + slowKeys.keys
    + ' keys, ' + (slowKeys.keys - starKeys.keys) + ' saved, '
    + (slowKeys.keys / Math.max(1, starKeys.keys)).toFixed(2) + 'x — a star that measures NEGATIVE is the failure the campaign retired a drill on, CAMPAIGN §2');
  say(starKeys.star === true && slowKeys.star === false,
    'B3  the ☆ latch reads the MECHANIC — fill earns it, six typed formulas do not');

  console.log('\n§C · BOARD CONTRACT — 20 rows, §1.3 density, no #### at load, geometry moats');
  const board = await page.evaluate((k) => {
    loadChallenge(k);
    const C = CHALLENGES[k], o = C._o;
    const used = new Set();
    for (const ck of Object.keys(S.cells)) { const c = S.cells[ck];
      if (c && ((c.value !== '' && c.value != null) || c.formula)) used.add(+ck.replace(/^[A-J]+/, '')); }
    const loadRows = used.size;
    /* win-state density: replay the demo, then recount (§1.3 is measured at the WIN, and a
       load-state count misses everything the player fills — the r438 measurement note) */
    for (const mv of C.demo.call(C)) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
    for (const ck of Object.keys(S.cells)) { const c = S.cells[ck];
      if (c && ((c.value !== '' && c.value != null) || c.formula)) used.add(+ck.replace(/^[A-J]+/, '')); }
    /* #### census at LOAD, unscaled, through the engine's own verdict (r441 overflowsCol) */
    loadChallenge(k);
    let over = [];
    for (let c = 1; c <= 10; c++) if (typeof overflowsCol === 'function' && overflowsCol(S, c)) over.push(c);
    /* geometry: from the top of the tape, Ctrl+Down must land on the LAST DEAL, never ride
       through the blank moat into the median read (doctrine §3 geometry).
       RE-READ C._o here — loadChallenge redraws the corner jitter, so the `o` captured before
       the reload can name a different column. Getting this wrong made this very assertion
       report row 20 against a board that was fine: CAMPAIGN's "suspect the probe" rule, third
       sighting in the campaign and first in this drill. */
    const o2 = C._o;
    setDemoSel(o2.CE + o2.d0);
    demoKey({ key: 'ArrowDown', ctrl: true });
    const landed = S.active.r;
    return { ROWS: S.ROWS, loadRows, winRows: used.size, over, landed, dN: o2.dN, cols: Object.keys(S._colW || {}).length };
  }, KEY);
  say(board.ROWS === 20, 'C1  ROWS=' + board.ROWS + ' (§1.3 / Wolf r440: 20 is floor AND cap, ROWS=14 is the defect)');
  say(board.winRows / 20 >= 0.6, 'C2  win-state density ' + board.winRows + '/20 = '
    + Math.round(100 * board.winRows / 20) + '% (§1.3 target ≥60%; ' + board.loadRows + '/20 at load)');
  say(!board.over.length, 'C3  no column overflows at load — #### census ' + JSON.stringify(board.over) + ' (fit-sweep contract)');
  say(board.landed === board.dN, 'C4  Ctrl+↓ from the top of the tape lands on row ' + board.landed
    + ' (the last deal is row ' + board.dN + ') — the blank moat holds, no ride-through into the median read');

  /* C5 — the e2e-fit-sweep contract, scoped to this drill and using that suite's OWN predicate
     (`t.length*CHARPX+12 > colW[c]`), at LOAD and again at the WIN state. The catalog-wide sweep
     is the gate's job; this exists so a width regression on this board is caught by the drill's
     own probe rather than only by a 70-drill run, and because that run needs a machine that is
     not sharing four cores with a wave (both attempts here died on browser contention, which is
     a resource failure and not a product one — CAMPAIGN §4, "four cores is the ceiling"). */
  const fit = await page.evaluate((k) => {
    const scan = () => { const out = [];
      for (let c = 1; c <= COLS; c++) for (let r = 1; r <= S.ROWS; r++) {
        const cell = S.cells[colLetter(c) + r];
        if (!cell || cell.wrap || typeof cell.value !== 'number') continue;
        const t = fmtNum(cell.value, cell.fmtStyle, cell.decimals);
        if (t.length * CHARPX + 12 > colW[c]) out.push(colLetter(c) + r + '=' + t + ' @' + colW[c] + 'px');
      } return out; };
    const load = [], win = [];
    for (let rep = 0; rep < 5; rep++) {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge(k);
      load.push(...scan());
      const C = CHALLENGES[k];
      for (const mv of C.demo.call(C)) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
      win.push(...scan());
    }
    return { load, win };
  }, KEY);
  say(!fit.load.length && !fit.win.length, 'C5  fit contract, 5 seeds, the e2e-fit-sweep predicate: '
    + fit.load.length + ' ##### at load, ' + fit.win.length + ' at the win state '
    + JSON.stringify(fit.load.concat(fit.win).slice(0, 4)));

  if (errs.length) { say(false, 'PAGE ERRORS: ' + errs.slice(0, 3).join(' · ')); }
  console.log('\nVERIFY ' + KEY + ': ' + (fails ? fails + ' FAILURE(S)' : 'ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
