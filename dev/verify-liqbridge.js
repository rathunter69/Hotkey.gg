/* verify-liqbridge.js (r447, DEPTH_PASS §4.74) — the drill's own probe.

   Self-contained by the C13 retirement guard: it names NO drill but `liqbridge`.

   Run (server on the repo root; the integrator uses the default port):
     node dev/verify-liqbridge.js
     URL=http://127.0.0.1:88xx/index.html node dev/verify-liqbridge.js     # worktrees

   Five sections, each answering a question the depth-pass law asks out loud:
     §A  ☆-HEADROOM (CAMPAIGN §2, both parts) — the star route and the slow route in KEYS,
         every within-beat selection keyed, plus each of the three one-pass MECHANICS measured
         separately so a combined number cannot hide a negative half (the r438 `series` rule).
     §B  ROUTE WALK (§1.0-R3(p) / §1.0(c)) — every Excel route to each visible end state is
         DRIVEN, not reasoned about. Reading a predicate has never once found the
         untriggerable-beat class.
     §C  SKIPPABILITY (§1.0-R2(i)) — a named slow route clears every core with the ☆ dark.
         Measured, not asserted.
     §D  BOARD INVARIANTS — the story holds every seed (Base clears, Severe breaches, the
         collateral binds in Severe), §1.3 win-state density, and no column overflows at load.
     §E  THE DEMO EARNS THE ☆ (§2.2) and the win fires on the engine-appended save.

   Exit code 1 on any failure. */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const SEEDS = parseInt(process.env.SEEDS || '5', 10);

let fails = 0;
const ok = m => console.log('  ok   ' + m);
const bad = m => { fails++; console.log('  FAIL ' + m); };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e.message || e).slice(0, 200)));
  /* mirror the real harness init or the numbers are a lie (CAMPAIGN, r440 hotkey_onboarded) */
  await page.addInitScript(() => {
    try {
      localStorage.setItem('hotkey_onboarded', '1');
      localStorage.setItem('hk_tour_done', '1');
      localStorage.setItem('hk_learn_done', '1');
      localStorage.setItem('hk_handle_cache', '');
    } catch (e) {}
  });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function'
    && typeof demoKey === 'function' && typeof setDemoSel === 'function', null, { timeout: 20000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* ---- the page-side driver. `route` is a source string `o => [ {sel,keys}, ... ]`; it is
     handed the drill's own geometry object, so nothing here hard-codes a cell. ---- */
  await page.evaluate(() => {
    window.__lbRun = function (routeSrc) {
      loadChallenge('liqbridge');
      const C = CHALLENGES.liqbridge, o = C._o;
      // eslint-disable-next-line no-eval
      const moves = eval('(' + routeSrc + ')')(o, C);
      keyLog.length = 0;
      for (const m of moves) { if (m.sel) setDemoSel(m.sel); for (const k of m.keys) demoKey(k); }
      const items = C.checks(S);
      return {
        keys: keyLog.length,
        cores: items.filter(x => !x.bonus && !x.save).map(x => !!x.ok),
        star: !!(items.find(x => x.bonus) || {}).ok,
        done: typeof done !== 'undefined' ? !!done : null,
        o: JSON.parse(JSON.stringify(o)),
      };
    };
  });

  const run = src => page.evaluate(s => window.__lbRun(s), src);
  const runN = async (src, n = SEEDS) => { const r = []; for (let i = 0; i < n; i++) r.push(await run(src)); return r; };
  const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const allCores = rs => rs.every(r => r.cores.every(Boolean));

  /* ============================ shared route sources ============================ */
  const SR = "{key:'ArrowRight',shift:true}", SD = "{key:'ArrowDown',shift:true}";
  const F = "const A=o=>'=MIN('+o.CB+o.rCom+','+o.CB+o.rBB+')-'+o.CB+o.rDr,"
    + "B=o=>'='+o.CB+o.rCash+'+'+o.CB+o.rAv,"
    + "E=o=>'='+o.CB+o.rBeg+'+SUM('+o.CB+o.rBurn+':'+o.CB+o.rFee+')',"
    + "K=o=>'='+o.CB+o.rEnd+'-$'+o.CB+'$'+o.rMin,"
    + "RED=o=>{const f=o.breach.indexOf(true),n=o.breach.filter(Boolean).length,x=[];"
    + "for(let i=1;i<n;i++)x.push(" + SR + ");"
    + "return {sel:o.cols[f]+o.rCush,keys:[...x,{key:'Alt'},L('h'),L('f'),L('c'),"
    + "{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]};},"
    + "DRESS=o=>({sel:o.CB+o.rEnd,keys:[" + SR + "," + SR + ",{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});";

  const R_FILL = `o => { ${F} return [
    {sel:o.CB+o.rAv,   keys:[...T(A(o)), {key:'Enter'}]},
    {sel:o.CB+o.rBeg,  keys:[...T(B(o)), {key:'Enter'}]},
    {sel:o.CB+o.rAv,   keys:[${SR},${SR},${SD},{key:'r',ctrl:true}]},
    {sel:o.CB+o.rEnd,  keys:[...T(E(o)), {key:'Enter'}]},
    DRESS(o),
    {sel:o.CB+o.rCush, keys:[...T(K(o)), {key:'Enter'}]},
    {sel:o.CB+o.rEnd,  keys:[${SR},${SR},${SD},{key:'r',ctrl:true}]},
    RED(o),
  ]; }`;

  const R_MULTI = `o => { ${F} return [
    {sel:o.CB+o.rAv,   keys:[${SR},${SR},...T(A(o)), {key:'Enter',ctrl:true}]},
    {sel:o.CB+o.rBeg,  keys:[${SR},${SR},...T(B(o)), {key:'Enter',ctrl:true}]},
    {sel:o.CB+o.rEnd,  keys:[${SR},${SR},...T(E(o)), {key:'Enter',ctrl:true}]},
    DRESS(o),
    {sel:o.CB+o.rCush, keys:[${SR},${SR},...T(K(o)), {key:'Enter',ctrl:true}]},
    RED(o),
  ]; }`;

  const R_PASTE = `o => { ${F} return [
    {sel:o.CB+o.rAv,   keys:[...T(A(o)), {key:'Enter'}]},
    {sel:o.CB+o.rBeg,  keys:[...T(B(o)), {key:'Enter'}]},
    {sel:o.CB+o.rAv,   keys:[${SD},{key:'c',ctrl:true}]},
    {sel:o.CC+o.rAv,   keys:[${SR},${SD},{key:'v',ctrl:true}]},
    {sel:o.CB+o.rEnd,  keys:[...T(E(o)), {key:'Enter'}]},
    DRESS(o),
    {sel:o.CB+o.rCush, keys:[...T(K(o)), {key:'Enter'}]},
    {sel:o.CB+o.rEnd,  keys:[${SD},{key:'c',ctrl:true}]},
    {sel:o.CC+o.rEnd,  keys:[${SR},${SD},{key:'v',ctrl:true}]},
    RED(o),
  ]; }`;

  /* the named SLOW route — every case retyped, the dress walked cell by cell through the
     ribbon, the flag from the cell-styles gallery. Clears every core; the ☆ must stay dark. */
  const R_SLOW = `o => { ${F}
    const cell=(c,r,txt)=>({sel:c+r,keys:[...T(txt),{key:'Enter'}]});
    const sub=(s,c)=>s.split(o.CB).join(c);
    const out=[];
    o.cols.forEach(c=>{ out.push(cell(c,o.rAv,sub(A(o),c))); });
    o.cols.forEach(c=>{ out.push(cell(c,o.rBeg,sub(B(o),c))); });
    o.cols.forEach(c=>{ out.push(cell(c,o.rEnd,sub(E(o),c))); });
    o.cols.forEach(c=>{ out.push({sel:c+o.rEnd,keys:[{key:'Alt'},L('h'),D(1)]});
                        out.push({sel:c+o.rEnd,keys:[{key:'Alt'},L('h'),L('b'),L('p')]}); });
    o.cols.forEach(c=>{ out.push(cell(c,o.rCush,'='+c+o.rEnd+'-'+o.CB+o.rMin)); });
    o.cols.forEach((c,i)=>{ if(o.breach[i]) out.push({sel:c+o.rCush,keys:[{key:'Alt'},L('h'),L('j'),
      {key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]}); });
    return out; }`;

  console.log('\n§A  ☆-HEADROOM DIAGNOSTIC (CAMPAIGN §2) — keys through the live engine, ' + SEEDS + ' seeds');
  const aFill = await runN(R_FILL), aMulti = await runN(R_MULTI), aPaste = await runN(R_PASTE), aSlow = await runN(R_SLOW);
  const mFill = med(aFill.map(r => r.keys)), mMulti = med(aMulti.map(r => r.keys)),
    mPaste = med(aPaste.map(r => r.keys)), mSlow = med(aSlow.map(r => r.keys));
  console.log('       one-pass · fill (ctrl+r)      ' + mFill + ' keys  ' + JSON.stringify(aFill.map(r => r.keys)));
  console.log('       one-pass · multi-enter        ' + mMulti + ' keys  ' + JSON.stringify(aMulti.map(r => r.keys)));
  console.log('       one-pass · copy/paste across  ' + mPaste + ' keys  ' + JSON.stringify(aPaste.map(r => r.keys)));
  console.log('       slow · every case retyped     ' + mSlow + ' keys  ' + JSON.stringify(aSlow.map(r => r.keys)));
  console.log('       spread (slow ÷ fastest one-pass) = ' + (mSlow / Math.min(mFill, mMulti, mPaste)).toFixed(2) + '×');
  if (mSlow / Math.min(mFill, mMulti, mPaste) >= 1.3) ok('§A spread clears the ~1.3× warning line');
  else bad('§A spread ' + (mSlow / Math.min(mFill, mMulti, mPaste)).toFixed(2) + '× is under the warning line');
  for (const [n, rs] of [['fill', aFill], ['multi-enter', aMulti], ['paste', aPaste]]) {
    if (allCores(rs) && rs.every(r => r.star)) ok('§A the ' + n + ' mechanic clears every core AND earns the ☆, ' + SEEDS + '/' + SEEDS);
    else bad('§A the ' + n + ' mechanic: cores ' + JSON.stringify(rs[0].cores) + ' star ' + rs.map(r => r.star).join(','));
  }

  console.log('\n§C  SKIPPABILITY (§1.0-R2(i)) — the named slow route');
  if (allCores(aSlow) && aSlow.every(r => !r.star)) ok('§C every core green and the ☆ DARK on the typed route, ' + SEEDS + '/' + SEEDS + ' (worth ' + (mSlow - Math.min(mFill, mMulti, mPaste)) + ' keys)');
  else bad('§C slow route: cores ' + JSON.stringify(aSlow[0].cores) + ' star ' + aSlow.map(r => r.star).join(','));

  console.log('\n§B  ROUTE WALK (§1.0-R3(p)) — every route to the same visible end state must clear');
  /* each entry swaps ONE beat's route out of the fill baseline and asserts that beat still greens */
  const WALK = [
    ['ending liquidity as =SUM(beginning:fees)',
      R_FILL.replace("...T(E(o))", "...T('=SUM('+o.CB+o.rBeg+':'+o.CB+o.rFee+')')"), 2],
    ['ending liquidity as a plain addition chain',
      R_FILL.replace("...T(E(o))", "...T('='+o.CB+o.rBeg+'+'+o.CB+o.rBurn+'+'+o.CB+o.rSale+'+'+o.CB+o.rFee)"), 2],
    ['availability with the MIN arguments the other way round',
      R_FILL.replace("...T(A(o))", "...T('=MIN('+o.CB+o.rBB+','+o.CB+o.rCom+')-'+o.CB+o.rDr)"), 0],
    ['availability written as an IF instead of a MIN',
      R_FILL.replace("...T(A(o))", "...T('=IF('+o.CB+o.rCom+'<'+o.CB+o.rBB+','+o.CB+o.rCom+','+o.CB+o.rBB+')-'+o.CB+o.rDr)"), 0],
    ['beginning liquidity as =SUM(cash,availability)',
      R_FILL.replace("...T(B(o))", "...T('=SUM('+o.CB+o.rCash+','+o.CB+o.rAv+')')"), 1],
    ['the cushion UNANCHORED, then typed case by case',
      R_SLOW, 4],
    ['the dress from alt h 1 + alt h b s (outside borders on the row)',
      R_FILL.replace("{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')", "{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('s')"), 3],
    ['the dress from alt h b a (all borders)',
      R_FILL.replace("{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')", "{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('a')"), 3],
    ['the dress from alt h b d (top and bottom)',
      R_FILL.replace("{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')", "{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('d')"), 3],
    ['the dress from the Total cell style (alt h j)',
      R_FILL.replace("{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')",
        "{key:'Alt'},L('h'),L('j'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}"), 3],
    ['the ending line dressed with the RIBBON fill instead of ctrl+r (alt h f i r)',
      R_FILL.split("{key:'r',ctrl:true}").join("{key:'Alt'},L('h'),L('f'),L('i'),L('r')"), null],
    ['the whole page built RIGHT TO LEFT — Severe first, the base pair pasted off it',
      `o => { ${F} const rev=s=>s.split(o.CB).join(o.CD); return [
        {sel:o.CD+o.rAv,   keys:[...T(rev(A(o))), {key:'Enter'}]},
        {sel:o.CD+o.rBeg,  keys:[...T(rev(B(o))), {key:'Enter'}]},
        {sel:o.CD+o.rAv,   keys:[${SD},{key:'c',ctrl:true}]},
        {sel:o.CB+o.rAv,   keys:[${SR},${SD},{key:'v',ctrl:true}]},
        {sel:o.CD+o.rEnd,  keys:[...T(rev(E(o))), {key:'Enter'}]},
        {sel:o.CD+o.rEnd,  keys:[...T('='+o.CD+o.rEnd+'-$'+o.CB+'$'+o.rMin).slice(0,0)]},
        {sel:o.CD+o.rCush, keys:[...T('='+o.CD+o.rEnd+'-$'+o.CB+'$'+o.rMin), {key:'Enter'}]},
        {sel:o.CD+o.rEnd,  keys:[${SD},{key:'c',ctrl:true}]},
        {sel:o.CB+o.rEnd,  keys:[${SR},${SD},{key:'v',ctrl:true}]},
        DRESS(o),
        RED(o),
      ]; }`, null],
  ];
  for (const [name, src, beat] of WALK) {
    let rs;
    try { rs = await runN(src, 3); } catch (e) { bad('§B ' + name + ' — route threw: ' + String(e.message).slice(0, 90)); continue; }
    const green = beat === null ? rs.every(r => r.cores.every(Boolean)) : rs.every(r => r.cores[beat]);
    if (green) ok('§B ' + name + (beat === null ? ' — every core clears' : ' — beat ' + (beat + 1) + ' clears') + ', 3/3');
    else bad('§B ' + name + ' — cores ' + JSON.stringify(rs.map(r => r.cores)));
  }
  /* the flag route through the cell-styles gallery, driven properly */
  {
    const src = R_FILL.replace(
      "RED(o),",
      "(function(){const f=o.breach.indexOf(true),n=o.breach.filter(Boolean).length,x=[];"
      + `for(let i=1;i<n;i++)x.push(${SR});`
      + "return {sel:o.cols[f]+o.rCush,keys:[...x,{key:'Alt'},L('h'),L('j'),"
      + "{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]};})(),");
    const rs = await runN(src, 3);
    if (rs.every(r => r.cores[5])) ok('§B the flag from the Warning cell style — beat 6 clears, 3/3');
    else bad('§B the flag from the Warning cell style — ' + JSON.stringify(rs.map(r => r.cores)));
  }
  /* NEGATIVE control: colouring every case red must NOT clear the flag beat */
  {
    const src = R_FILL.replace("RED(o),",
      `{sel:o.CB+o.rCush,keys:[${SR},${SR},{key:'Alt'},L('h'),L('f'),L('c'),`
      + "{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},");
    const rs = await runN(src, 3);
    if (rs.every(r => !r.cores[5])) ok('§B negative control — flagging EVERY case leaves beat 6 dark, 3/3');
    else bad('§B negative control — flagging every case cleared beat 6: ' + JSON.stringify(rs.map(r => r.cores)));
  }
  /* NEGATIVE control: a typed constant must not satisfy a "Build" beat */
  {
    const src = R_FILL.replace("...T(A(o))", "...T(String(999))");
    const rs = await runN(src, 3);
    if (rs.every(r => !r.cores[0])) ok('§B negative control — a typed constant leaves the availability beat dark, 3/3');
    else bad('§B negative control — a typed constant cleared the availability beat');
  }

  console.log('\n§D  BOARD INVARIANTS');
  const board = await page.evaluate(seeds => {
    const out = [];
    for (let i = 0; i < seeds; i++) {
      loadChallenge('liqbridge');
      const C = CHALLENGES.liqbridge, o = C._o;
      const V = k => { const x = S.cells[k]; return (x && typeof x.value === 'number') ? x.value : 0; };
      const av = c => Math.min(V(c + o.rCom), V(c + o.rBB)) - V(c + o.rDr);
      const en = c => V(c + o.rCash) + av(c) + V(c + o.rBurn) + V(c + o.rSale) + V(c + o.rFee);
      const cu = o.cols.map(c => en(c) - V(o.CB + o.rMin));
      /* §1.3 density at the WIN state: rows carrying content OR scripted purpose */
      const rows = new Set();
      for (const k in S.cells) { const c = S.cells[k]; if (c && (c.value !== null || c.formula)) rows.add(+k.replace(/^[A-Z]+/, '')); }
      [o.rAv, o.rBeg, o.rEnd, o.rCush].forEach(r => rows.add(r));
      /* no column may print #### at load */
      let overflow = 0;
      for (let c = 1; c <= 10; c++) { try { if (overflowsCol(S, c)) overflow++; } catch (e) {} }
      out.push({
        ROWS: S.ROWS, rows: rows.size, overflow,
        baseClears: cu[0] > 0, severeBreaches: cu[2] < 0, downBreach: cu[1] < 0,
        ordered: en(o.cols[0]) > en(o.cols[1]) && en(o.cols[1]) > en(o.cols[2]),
        commitBindsBase: V(o.CB + o.rBB) > V(o.CB + o.rCom),
        collateralBindsSevere: V(o.CD + o.rBB) < V(o.CD + o.rCom),
        availPositive: o.cols.every(c => av(c) > 0),
        minPositive: V(o.CB + o.rMin) > 0,
        c0: o.c0,
      });
    }
    return out;
  }, 40);
  const every = (name, f) => { if (board.every(f)) ok('§D ' + name + ' — 40/40 seeds'); else bad('§D ' + name + ' — ' + JSON.stringify(board.filter(b => !f(b))[0])); };
  every('ROWS is 20 (the §1.3 floor and cap)', b => b.ROWS === 20);
  every('win-state density ≥ 60% of 20 rows', b => b.rows / 20 >= 0.6);
  every('no column overflows at load (no #### )', b => b.overflow === 0);
  every('Base always clears the covenant', b => b.baseClears);
  every('Severe always breaches it', b => b.severeBreaches);
  every('the three endings are strictly ordered', b => b.ordered);
  every('the commitment binds in Base', b => b.commitBindsBase);
  every('the collateral binds in Severe', b => b.collateralBindsSevere);
  every('availability is positive in every case', b => b.availPositive);
  every('the covenant level is a positive number', b => b.minPositive);
  console.log('       density: ' + Math.min(...board.map(b => b.rows)) + '–' + Math.max(...board.map(b => b.rows))
    + ' of 20 rows (' + (100 * Math.min(...board.map(b => b.rows)) / 20).toFixed(0) + '–'
    + (100 * Math.max(...board.map(b => b.rows)) / 20).toFixed(0) + '%)');
  const dv = new Set(board.map(b => b.downBreach)), cv = new Set(board.map(b => b.c0));
  if (dv.size === 2) ok('§D randomization axis (d): the Downside case breaches on some seeds and not others');
  else bad('§D the Downside breach flag never varies across 40 seeds');
  if (cv.size === 2) ok('§D randomization axis (a): corner jitter moves the anchor column');
  else bad('§D the anchor column never varies across 40 seeds');

  console.log('\n§E  THE DEMO (§2.2 — it must perform the ☆) and the save closer');
  const demoRes = await page.evaluate(async seeds => {
    const out = [];
    for (let i = 0; i < seeds; i++) {
      loadChallenge('liqbridge');
      const C = CHALLENGES.liqbridge;
      keyLog.length = 0;
      /* hkSaveCloseWire APPENDS the Ctrl+S move to demo(), so the last move IS the closer —
         run everything up to it, prove the save line is still dark, then press it. */
      const moves = C.demo(), body = moves.slice(0, -1), closer = moves[moves.length - 1];
      for (const m of body) { setDemoSel(m.sel); for (const k of m.keys) demoKey(k); }
      const mid = C.checks(S);
      const starMid = !!(mid.find(x => x.bonus) || {}).ok;
      const saveLine = mid.find(x => x.save);
      setDemoSel(closer.sel); for (const k of closer.keys) demoKey(k);
      const fin = C.checks(S);
      out.push({
        keys: keyLog.length, starMid,
        closerIsSave: !!(closer.keys.length === 1 && closer.keys[0].key === 's' && closer.keys[0].ctrl),
        hadSaveLine: !!saveLine, saveOkBefore: !!(saveLine && saveLine.ok),
        coresBeforeSave: mid.filter(x => !x.bonus && !x.save).every(x => !!x.ok),
        allOk: fin.every(x => !!x.ok), done: !!done,
      });
    }
    return out;
  }, SEEDS);
  if (demoRes.every(r => r.starMid)) ok('§E the demo earns the ☆ on every seed');
  else bad('§E the demo does not earn the ☆: ' + JSON.stringify(demoRes.map(r => r.starMid)));
  if (demoRes.every(r => r.hadSaveLine && r.closerIsSave && r.coresBeforeSave && !r.saveOkBefore))
    ok('§E every core is green and the engine-appended save beat still DARK before Ctrl+S');
  else bad('§E save-closer wiring: ' + JSON.stringify(demoRes[0]));
  if (demoRes.every(r => r.allOk && r.done)) ok('§E the win fires on the save, every beat green');
  else bad('§E the demo does not win: ' + JSON.stringify(demoRes[0]));
  console.log('       demo key count per seed: ' + JSON.stringify(demoRes.map(r => r.keys)));

  if (pageErrors.length) { fails++; console.log('\n  FAIL page errors: ' + JSON.stringify(pageErrors.slice(0, 5))); }
  console.log('\n' + (fails ? 'verify-liqbridge: ' + fails + ' FAILURE(S)' : 'verify-liqbridge: ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
