/* VERIFY-LBO (r444) — the depth-pass probe for `lbo` (DEPTH_PASS §4.70, Models II).

   Self-contained per WORKFLOW §9.1: this file names exactly one drill key, `lbo`, and nothing
   else (the C13 retirement guard sweeps dev/*.js for quoted keys, so a probe that mentions a
   neighbour drill would bind this file to that drill's lifetime).

   It answers the four questions the campaign says a build agent must answer with MEASUREMENT
   rather than assertion, and it is the instrument behind every number in the r444 AUDIT entry:

     §A BOARD AUDIT — ROWS=20, §1.3 win-state density, MODELING_STANDARDS conventions that are
        mechanically checkable (colour = provenance, deductions negative, the enterprise→equity
        bridge identity, the returns forms), and no column showing #### at load.
     §B ROUTE WALK — every Excel route to the visible end state, WALKED. Reading predicates has
        never once found the untriggerable-beat class (CAMPAIGN §1), so each route is driven
        through the live engine and every core beat must clear. Includes the two routes the
        SHIPPED board locked out by grading formula TEXT.
     §C ☆-HEADROOM DIAGNOSTIC (CAMPAIGN §2, both parts) — the star route and the slow route in
        keys, each half of the star isolated against its own slow alternative, and the negative
        control that proves the star is SKIPPABLE (all six cores clear, ☆ dark).
     §D DEGRADATION — the r439 `cases` check: a fill copies the SOURCE cell's format, so the
        star must not leave the board worse than the route it beats.

   Run:  URL=http://127.0.0.1:<port>/index.html node dev/verify-lbo.js
   The init script MIRRORS the real harnesses (hotkey_onboarded / hk_tour_done / hk_learn_done /
   hk_handle_cache) — a probe that boots a different page than the gate does is measuring a
   different product (CAMPAIGN dispatch note). */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const SEEDS = parseInt(process.env.SEEDS || '5', 10);

let fails = 0;
const ok = m => console.log('  ok   ' + m);
const bad = m => { fails++; console.log('  FAIL ' + m); };

/* ---------- page-side driver: park with setDemoSel, KEY every range grab (r438 `series`) ---- */
const DRIVE = `(moves) => {
  for (const mv of moves) { if (mv.sel) setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
  /* §1.0(e): every route ends on the same engine-owned Ctrl+S closer (hkSaveCloseWire wraps
     checks() and appends the beat at runtime), exactly as dev/e2e-alt-paths.js does — the
     routes stay chord-diverse, the closer is route-independent. It is IN the key counts
     because a player pays for it on every route. */
  if (!done && CHALLENGES.lbo.saveClose) demoKey({ key: 's', ctrl: true });
}`;

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
  await page.addInitScript(() => {
    try {
      localStorage.setItem('hotkey_onboarded', '1');
      localStorage.setItem('hk_tour_done', '1');
      localStorage.setItem('hk_learn_done', '1');
      localStorage.setItem('hk_handle_cache', '');
    } catch (e) {}
  });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() =>
    typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function' &&
    typeof demoKey === 'function' && typeof setDemoSel === 'function', null, { timeout: 15000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* ============================ §A BOARD AUDIT ============================ */
  console.log('\n§A BOARD AUDIT (' + SEEDS + ' seeds)');
  const audit = await page.evaluate(n => {
    const out = [];
    for (let i = 0; i < n; i++) {
      loadChallenge('lbo');
      const o = CHALLENGES.lbo._o, E = o.exp;
      const cel = k => S.cells[k] || null;
      const rows = new Set();
      for (const k in S.cells) {
        const c = S.cells[k];
        if (c && (c.value !== null && c.value !== '')) rows.add(parseInt(k.replace(/^[A-Z]+/, ''), 10));
      }
      /* win-state density counts content OR SCRIPTED PURPOSE: the four built lines are declared
         targets that are empty at load, so their rows count (r438 density note). */
      [o.rEV, o.rEQ, o.rMO, o.rIR].forEach(r => rows.add(r));
      let overflow = [];
      for (let c = 1; c <= 10; c++) if (overflowsCol(S, c)) overflow.push(c);
      let clipped = [];
      for (let c = 1; c <= 10; c++) if (clipsCol(S, c)) clipped.push(c);
      out.push({
        ROWS: S.ROWS,
        density: rows.size,
        overflow, clipped,
        // MODELING_STANDARDS §1 colour = provenance
        blue: [o.CB + o.rMU].concat(o.cols.map(c => c + o.rHD)).every(k => cel(k) && cel(k).fontColor === 'blue'),
        green: o.allCols.map(c => [c + o.rEB, c + o.rND, c + o.rPF]).flat()
                 .every(k => cel(k) && cel(k).fontColor === 'green'),
        blackOut: [o.rEV, o.rEQ].map(r => o.allCols.map(c => c + r)).flat()
                  .concat(o.cols.map(c => c + o.rMO), o.cols.map(c => c + o.rIR))
                  .every(k => cel(k) && !cel(k).fontColor),
        // MODELING_STANDARDS §2 sign convention: every deduction seeded negative
        signs: o.allCols.every(c => cel(c + o.rND).value < 0 && cel(c + o.rPF).value < 0),
        // MODELING_STANDARDS §4 bridge identity + returns forms
        bridge: o.allCols.every(c => Math.abs((cel(c + o.rEB).value * cel(o.CB + o.rMU).value) - E.ev[c]) < 1e-6 &&
                                     Math.abs(E.ev[c] + cel(c + o.rND).value + cel(c + o.rPF).value - E.eq[c]) < 1e-6),
        returns: o.cols.every((c, j) => Math.abs(E.eq[c] / E.eq[o.CB] - E.moic[c]) < 1e-9 &&
                                        Math.abs(Math.pow(E.moic[c], 1 / o.holds[j]) - 1 - E.irr[c]) < 1e-9),
        // the page's own claim: MOIC climbs with the hold while the IRR falls
        moicUp: E.moic[o.CD] > E.moic[o.CC] && E.moic[o.CE] > E.moic[o.CD],
        irrDown: E.irr[o.CD] < E.irr[o.CC] && E.irr[o.CE] < E.irr[o.CD],
        moicMin: Math.min(E.moic[o.CC], E.moic[o.CD], E.moic[o.CE]),
        irrMin: Math.min(E.irr[o.CC], E.irr[o.CD], E.irr[o.CE]),
        fmt: o.cols.every(c => cel(c + o.rMO).fmtStyle === 'mult' && cel(c + o.rIR).fmtStyle === 'percent'),
      });
    }
    return out;
  }, SEEDS);
  const dmin = Math.min(...audit.map(a => a.density));
  audit.every(a => a.ROWS === 20) ? ok('ROWS = 20 on every seed (§1.3 floor AND cap)')
                                  : bad('ROWS != 20: ' + audit.map(a => a.ROWS).join(','));
  (dmin >= 12) ? ok('§1.3 density: ' + dmin + '/20 rows carry content or scripted purpose at the win state (' + Math.round(dmin / 20 * 100) + '%, target >=60%)')
               : bad('§1.3 density under target: ' + dmin + '/20');
  audit.every(a => !a.overflow.length) ? ok('no column shows #### at load (fit)')
                                       : bad('#### at load in columns ' + audit.find(a => a.overflow.length).overflow.join(','));
  audit.every(a => !a.clipped.length) ? ok('no label amputated at load (clipsCol clean)')
                                      : bad('label clipped in columns ' + audit.find(a => a.clipped.length).clipped.join(','));
  audit.every(a => a.blue && a.green && a.blackOut)
    ? ok('MODELING_STANDARDS §1 colour = provenance: blue assumptions, green cross-tab feeds, black computed')
    : bad('colour provenance broken on a seed');
  audit.every(a => a.signs) ? ok('MODELING_STANDARDS §2 sign convention: every deduction seeded negative')
                            : bad('a deduction is seeded positive');
  audit.every(a => a.bridge) ? ok('MODELING_STANDARDS §4 bridge: EBITDA x multiple = EV; EV - net debt - preferred = equity value')
                             : bad('the enterprise-to-equity bridge does not hold on a seed');
  audit.every(a => a.returns) ? ok('MODELING_STANDARDS §4 returns: MOIC = exit equity / entry equity; IRR = MOIC^(1/yrs) - 1')
                              : bad('a returns form does not hold on a seed');
  audit.every(a => a.moicUp && a.irrDown)
    ? ok('the aha holds on every seed: MOIC climbs with the hold, the IRR falls (MOIC min ' +
         audit.map(a => a.moicMin.toFixed(2)).join('/') + 'x · IRR min ' + audit.map(a => (a.irrMin * 100).toFixed(1)).join('/') + '%)')
    : bad('MOIC/IRR do not move in opposite directions on a seed — the aha is false there');
  audit.every(a => a.moicMin > 1 && a.irrMin > 0.05)
    ? ok('no seed produces a losing deal (MOIC > 1.0x, IRR > 5% everywhere)')
    : bad('a seed produces MOIC <= 1 or IRR <= 5%');
  audit.every(a => a.fmt) ? ok('returns block ships mult / percent formats (doctrine §2.4 realism)')
                          : bad('a returns cell ships the wrong number format');

  /* ============================ §B ROUTE WALK ============================ */
  /* Every route below produces the same VISIBLE end state by a different legal path. Each must
     clear all six cores. Routes 5 and 6 are the two the SHIPPED board locked out by reading
     formula text — they are kept here permanently so the regression cannot come back. */
  console.log('\n§B ROUTE WALK — every route to the end state, driven live');
  const ROUTES = [
    ['1 · taught route (typed $ anchors, fills, chords)', `o => {
      const R={key:'ArrowRight',shift:true}, D2={key:'ArrowDown',shift:true};
      return [
        {sel:o.CB+o.rEV, keys:[...T('='+o.CB+o.rEB+'*$'+o.CB+'$'+o.rMU),{key:'Enter'}]},
        {sel:o.CB+o.rEV, keys:[R,R,R,{key:'r',ctrl:true}]},
        {sel:o.CB+o.rEQ, keys:[...T('=SUM('+o.CB+o.rEV+':'+o.CB+o.rPF+')'),{key:'Enter'}]},
        {sel:o.CB+o.rEQ, keys:[R,R,R,{key:'r',ctrl:true}]},
        {sel:o.CB+o.rEQ, keys:[R,R,R,{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:o.CC+o.rMO, keys:[...T('='+o.CC+o.rEQ+'/$'+o.CB+'$'+o.rEQ),{key:'Enter'}]},
        {sel:o.CC+o.rIR, keys:[...T('='+o.CC+o.rMO+'^(1/'+o.CC+o.rHD+')-1'),{key:'Enter'}]},
        {sel:o.CC+o.rMO, keys:[R,R,D2,{key:'r',ctrl:true}]},
        {sel:o.CC+o.rMO, keys:[R,R,D2,{key:'b',ctrl:true}]},
      ]; }`],
    ['2 · F4 anchoring instead of typed $, ribbon fills, Alt H 1 bold, Alt H B S border', `o => {
      const R={key:'ArrowRight',shift:true}, D2={key:'ArrowDown',shift:true};
      const fill=[{key:'Alt'},L('h'),L('f'),L('i'),L('r')];
      return [
        {sel:o.CB+o.rEV, keys:[...T('='+o.CB+o.rEB+'*'+o.CB+o.rMU),{key:'F4'},{key:'Enter'}]},
        {sel:o.CB+o.rEV, keys:[R,R,R,...fill]},
        {sel:o.CB+o.rEQ, keys:[...T('=SUM('+o.CB+o.rEV+':'+o.CB+o.rPF+')'),{key:'Enter'}]},
        {sel:o.CB+o.rEQ, keys:[R,R,R,...fill]},
        {sel:o.CA+o.rEQ, keys:[R,R,R,R,{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('s')]},
        {sel:o.CC+o.rMO, keys:[...T('='+o.CC+o.rEQ+'/'+o.CB+o.rEQ),{key:'F4'},{key:'Enter'}]},
        {sel:o.CC+o.rIR, keys:[...T('='+o.CC+o.rMO+'^(1/'+o.CC+o.rHD+')-1'),{key:'Enter'}]},
        {sel:o.CC+o.rMO, keys:[R,R,D2,...fill]},
        {sel:o.CC+o.rMO, keys:[R,R,D2,{key:'Alt'},L('h'),D(1)]},
      ]; }`],
    ['3 · autosum range form for the equity line, Alt H B A (stores ball, not bt) for the rule', `o => {
      const R={key:'ArrowRight',shift:true}, D2={key:'ArrowDown',shift:true};
      return [
        {sel:o.CB+o.rEV, keys:[...T('='+o.CB+o.rEB+'*$'+o.CB+'$'+o.rMU),{key:'Enter'}]},
        {sel:o.CB+o.rEV, keys:[R,R,R,{key:'r',ctrl:true}]},
        {sel:o.CB+o.rEV+':'+o.CB+o.rEQ, keys:[{key:'=',alt:true,code:'Equal'}]},
        {sel:o.CB+o.rEQ, keys:[R,R,R,{key:'r',ctrl:true}]},
        {sel:o.CB+o.rEQ, keys:[R,R,R,{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('a')]},
        {sel:o.CC+o.rMO, keys:[...T('='+o.CC+o.rEQ+'/$'+o.CB+'$'+o.rEQ),{key:'Enter'}]},
        {sel:o.CC+o.rIR, keys:[...T('='+o.CC+o.rMO+'^(1/'+o.CC+o.rHD+')-1'),{key:'Enter'}]},
        {sel:o.CC+o.rMO, keys:[R,R,D2,{key:'r',ctrl:true}]},
        {sel:o.CC+o.rMO, keys:[R,R,D2,{key:'b',ctrl:true}]},
      ]; }`],
    ['4 · addition chain instead of SUM, Alt H B D for the rule, returns filled as two separate rows', `o => {
      const R={key:'ArrowRight',shift:true};
      return [
        {sel:o.CB+o.rEV, keys:[...T('='+o.CB+o.rEB+'*$'+o.CB+'$'+o.rMU),{key:'Enter'}]},
        {sel:o.CB+o.rEV, keys:[R,R,R,{key:'r',ctrl:true}]},
        {sel:o.CB+o.rEQ, keys:[...T('='+o.CB+o.rEV+'+'+o.CB+o.rND+'+'+o.CB+o.rPF),{key:'Enter'}]},
        {sel:o.CB+o.rEQ, keys:[R,R,R,{key:'r',ctrl:true}]},
        {sel:o.CB+o.rEQ, keys:[R,R,R,{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('d')]},
        {sel:o.CC+o.rMO, keys:[...T('='+o.CC+o.rEQ+'/$'+o.CB+'$'+o.rEQ),{key:'Enter'}]},
        {sel:o.CC+o.rMO, keys:[R,R,{key:'r',ctrl:true}]},
        {sel:o.CC+o.rIR, keys:[...T('='+o.CC+o.rMO+'^(1/'+o.CC+o.rHD+')-1'),{key:'Enter'}]},
        {sel:o.CC+o.rIR, keys:[R,R,{key:'r',ctrl:true}]},
        {sel:o.CC+o.rMO, keys:[R,R,{key:'ArrowDown',shift:true},{key:'b',ctrl:true}]},
      ]; }`],
    ['5 · REGRESSION — IRR built straight off the equity values, MOIC never referenced (the shipped board graded this DARK)', `o => {
      const R={key:'ArrowRight',shift:true}, D2={key:'ArrowDown',shift:true};
      return [
        {sel:o.CB+o.rEV, keys:[...T('='+o.CB+o.rEB+'*$'+o.CB+'$'+o.rMU),{key:'Enter'}]},
        {sel:o.CB+o.rEV, keys:[R,R,R,{key:'r',ctrl:true}]},
        {sel:o.CB+o.rEQ, keys:[...T('=SUM('+o.CB+o.rEV+':'+o.CB+o.rPF+')'),{key:'Enter'}]},
        {sel:o.CB+o.rEQ, keys:[R,R,R,{key:'r',ctrl:true}]},
        {sel:o.CB+o.rEQ, keys:[R,R,R,{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:o.CC+o.rMO, keys:[...T('='+o.CC+o.rEQ+'/$'+o.CB+'$'+o.rEQ),{key:'Enter'}]},
        {sel:o.CC+o.rMO, keys:[R,R,{key:'r',ctrl:true}]},
        {sel:o.CC+o.rIR, keys:[...T('=('+o.CC+o.rEQ+'/$'+o.CB+'$'+o.rEQ+')^(1/'+o.CC+o.rHD+')-1'),{key:'Enter'}]},
        {sel:o.CC+o.rIR, keys:[R,R,{key:'r',ctrl:true}]},
        {sel:o.CC+o.rMO, keys:[R,R,D2,{key:'b',ctrl:true}]},
      ]; }`],
    ['6 · REGRESSION — the hold TYPED into each exponent, no reference to the hold row (the shipped board graded this DARK)', `o => {
      const R={key:'ArrowRight',shift:true}, D2={key:'ArrowDown',shift:true};
      const st=[
        {sel:o.CB+o.rEV, keys:[...T('='+o.CB+o.rEB+'*$'+o.CB+'$'+o.rMU),{key:'Enter'}]},
        {sel:o.CB+o.rEV, keys:[R,R,R,{key:'r',ctrl:true}]},
        {sel:o.CB+o.rEQ, keys:[...T('=SUM('+o.CB+o.rEV+':'+o.CB+o.rPF+')'),{key:'Enter'}]},
        {sel:o.CB+o.rEQ, keys:[R,R,R,{key:'r',ctrl:true}]},
        {sel:o.CB+o.rEQ, keys:[R,R,R,{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:o.CC+o.rMO, keys:[...T('='+o.CC+o.rEQ+'/$'+o.CB+'$'+o.rEQ),{key:'Enter'}]},
        {sel:o.CC+o.rMO, keys:[R,R,{key:'r',ctrl:true}]},
      ];
      o.cols.forEach((c,j)=>st.push({sel:c+o.rIR, keys:[...T('='+c+o.rMO+'^(1/'+o.holds[j]+')-1'),{key:'Enter'}]}));
      st.push({sel:o.CC+o.rMO, keys:[R,R,D2,{key:'b',ctrl:true}]});
      return st; }`],
    ['7 · op ORDER reversed — returns block first, bridge last, dress in the middle', `o => {
      const R={key:'ArrowRight',shift:true}, D2={key:'ArrowDown',shift:true};
      return [
        {sel:o.CC+o.rIR, keys:[...T('='+o.CC+o.rMO+'^(1/'+o.CC+o.rHD+')-1'),{key:'Enter'}]},
        {sel:o.CC+o.rMO, keys:[...T('='+o.CC+o.rEQ+'/$'+o.CB+'$'+o.rEQ),{key:'Enter'}]},
        {sel:o.CC+o.rMO, keys:[R,R,D2,{key:'r',ctrl:true}]},
        {sel:o.CC+o.rMO, keys:[R,R,D2,{key:'b',ctrl:true}]},
        {sel:o.CB+o.rEQ, keys:[...T('=SUM('+o.CB+o.rEV+':'+o.CB+o.rPF+')'),{key:'Enter'}]},
        {sel:o.CB+o.rEQ, keys:[R,R,R,{key:'r',ctrl:true}]},
        {sel:o.CB+o.rEQ, keys:[R,R,R,{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:o.CB+o.rEV, keys:[...T('='+o.CB+o.rEB+'*$'+o.CB+'$'+o.rMU),{key:'Enter'}]},
        {sel:o.CB+o.rEV, keys:[R,R,R,{key:'r',ctrl:true}]},
      ]; }`],
    /* route 8 is why the ☆ reads S.pasteLog as well as S.fillOps: it measured CHEAPER than the
       fill route (62 keys against 68) while doing the identical write-once work, so denying it
       the star would have been §1.0-R3(p)'s "a valid route stays dark" defect wearing a bonus
       badge. Both mechanics latch; typing every case still forfeits (see §C). */
    ['8 · COPY/PASTE across the cases instead of Ctrl+R (relative refs translate on paste — the second mastery route, ☆ latches)', `o => {
      const R={key:'ArrowRight',shift:true}, D2={key:'ArrowDown',shift:true};
      return [
        {sel:o.CB+o.rEV, keys:[...T('='+o.CB+o.rEB+'*$'+o.CB+'$'+o.rMU),{key:'Enter'}]},
        {sel:o.CB+o.rEV, keys:[{key:'c',ctrl:true}]},
        {sel:o.CC+o.rEV+':'+o.CE+o.rEV, keys:[{key:'v',ctrl:true}]},
        {sel:o.CB+o.rEQ, keys:[...T('=SUM('+o.CB+o.rEV+':'+o.CB+o.rPF+')'),{key:'Enter'}]},
        {sel:o.CB+o.rEQ, keys:[{key:'c',ctrl:true}]},
        {sel:o.CC+o.rEQ+':'+o.CE+o.rEQ, keys:[{key:'v',ctrl:true}]},
        {sel:o.CB+o.rEQ, keys:[R,R,R,{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:o.CC+o.rMO, keys:[...T('='+o.CC+o.rEQ+'/$'+o.CB+'$'+o.rEQ),{key:'Enter'}]},
        {sel:o.CC+o.rIR, keys:[...T('='+o.CC+o.rMO+'^(1/'+o.CC+o.rHD+')-1'),{key:'Enter'}]},
        {sel:o.CC+o.rMO+':'+o.CC+o.rIR, keys:[{key:'c',ctrl:true}]},
        {sel:o.CD+o.rMO+':'+o.CE+o.rIR, keys:[{key:'v',ctrl:true}]},
        {sel:o.CC+o.rMO, keys:[R,R,D2,{key:'b',ctrl:true}]},
      ]; }`],
  ];
  for (const [name, src] of ROUTES) {
    const r = await page.evaluate(({ src, seeds, drive }) => {
      const out = { wins: 0, dark: [], keys: [], star: 0 };
      for (let i = 0; i < seeds; i++) {
        loadChallenge('lbo');
        const C = CHALLENGES.lbo;
        try {
          eval('(' + drive + ')')(eval('(' + src + ')')(C._o));
        } catch (e) { out.dark.push('THREW ' + String(e).slice(0, 90)); continue; }
        const ch = C.checks(S);
        const core = ch.filter(c => !c.bonus);
        if (core.every(c => c.ok)) out.wins++; else out.dark.push(core.filter(c => !c.ok).map(c => c.label).join(' | '));
        if (ch.find(c => c.bonus).ok) out.star++;
        out.keys.push(keyLog.length);
      }
      return out;
    }, { src, seeds: SEEDS, drive: DRIVE });
    const med = r.keys.slice().sort((a, b) => a - b)[Math.floor(r.keys.length / 2)];
    if (r.wins === SEEDS) ok('route ' + name + ' — 6/6 cores clear ' + SEEDS + '/' + SEEDS + ' seeds · ☆ ' + r.star + '/' + SEEDS + ' · ' + med + ' keys');
    else bad('route ' + name + ' — cores DARK on ' + (SEEDS - r.wins) + ' seed(s): ' + r.dark[0]);
  }

  /* ============================ §C ☆-HEADROOM DIAGNOSTIC ============================ */
  console.log('\n§C ☆-HEADROOM DIAGNOSTIC (CAMPAIGN §2 — both parts, measured)');
  const SLOW = `o => {
    /* the obvious slow route that clears every core: every case typed on its own, nothing
       filled anywhere, dress by ribbon. This is the comparison the diagnostic asks for —
       a route that does the SAME WORK, not a minimal route that skips optional work. */
    const st=[];
    o.allCols.forEach(c=>st.push({sel:c+o.rEV, keys:[...T('='+c+o.rEB+'*$'+o.CB+'$'+o.rMU),{key:'Enter'}]}));
    o.allCols.forEach(c=>st.push({sel:c+o.rEQ, keys:[...T('=SUM('+c+o.rEV+':'+c+o.rPF+')'),{key:'Enter'}]}));
    st.push({sel:o.CB+o.rEQ, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]});
    o.cols.forEach(c=>st.push({sel:c+o.rMO, keys:[...T('='+c+o.rEQ+'/$'+o.CB+'$'+o.rEQ),{key:'Enter'}]}));
    o.cols.forEach((c,j)=>st.push({sel:c+o.rIR, keys:[...T('='+c+o.rMO+'^(1/'+c+o.rHD+')-1'),{key:'Enter'}]}));
    st.push({sel:o.CC+o.rMO, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowDown',shift:true},{key:'Alt'},L('h'),D(1)]});
    return st; }`;
  const STAR = ROUTES[0][1];
  const measure = async (src) => page.evaluate(({ src, seeds, drive }) => {
    const keys = [], cores = [], stars = [];
    for (let i = 0; i < seeds; i++) {
      loadChallenge('lbo');
      const C = CHALLENGES.lbo;
      eval('(' + drive + ')')(eval('(' + src + ')')(C._o));
      const ch = C.checks(S);
      keys.push(keyLog.length);
      cores.push(ch.filter(c => !c.bonus).every(c => c.ok));
      stars.push(ch.find(c => c.bonus).ok);
    }
    return { keys, cores, stars };
  }, { src, seeds: SEEDS, drive: DRIVE });
  const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const star = await measure(STAR);
  const slow = await measure(SLOW);
  const sm = med(star.keys), lm = med(slow.keys);
  ok('PART 1 — spread: fastest legal ' + sm + ' keys · slowest legal ' + lm + ' keys = ' + (lm / sm).toFixed(2) + 'x');
  (lm / sm >= 1.3) ? ok('PART 1 clears the 1.3x warning line (below it retired grpfold)')
                   : bad('PART 1 spread under 1.3x — this board may be a motif, not a lesson');
  star.cores.every(Boolean) && star.stars.every(Boolean)
    ? ok('the star route clears all six cores AND earns the ☆ on every seed')
    : bad('the star route does not both clear and earn on every seed');
  slow.cores.every(Boolean) ? ok('NEGATIVE CONTROL: the slow route clears all six cores on every seed (§1.0(c) freedom)')
                            : bad('the slow route leaves a core dark — a route that does the work is being penalised');
  slow.stars.every(s => !s) ? ok('NEGATIVE CONTROL: the ☆ is DARK on the slow route on every seed (§1.0-R2(i) skippable)')
                            : bad('the ☆ latches without the fill — it is not a distinct decision');

  /* PART 2 — what the spread is MADE of, and each half of the star isolated (r438 `series`) */
  const HALVES = [
    ['enterprise value line', `o => [{sel:o.CB+o.rEV, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'r',ctrl:true}]}]`,
      `o => o.cols.map(c=>({sel:c+o.rEV, keys:[...T('='+c+o.rEB+'*$'+o.CB+'$'+o.rMU),{key:'Enter'}]}))`],
    ['equity value line', `o => [{sel:o.CB+o.rEQ, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'r',ctrl:true}]}]`,
      `o => o.cols.map(c=>({sel:c+o.rEQ, keys:[...T('=SUM('+c+o.rEV+':'+c+o.rPF+')'),{key:'Enter'}]}))`],
    ['returns block (both rows, one selection)', `o => [{sel:o.CC+o.rMO, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowDown',shift:true},{key:'r',ctrl:true}]}]`,
      `o => [o.CD,o.CE].map(c=>({sel:c+o.rMO, keys:[...T('='+c+o.rEQ+'/$'+o.CB+'$'+o.rEQ),{key:'Enter'}]}))
              .concat([o.CD,o.CE].map(c=>({sel:c+o.rIR, keys:[...T('='+c+o.rMO+'^(1/'+c+o.rHD+')-1'),{key:'Enter'}]})))`],
  ];
  for (const [nm, fastSrc, slowSrc] of HALVES) {
    const r = await page.evaluate(({ fastSrc, slowSrc, drive }) => {
      loadChallenge('lbo');
      const o = CHALLENGES.lbo._o;
      const count = src => eval('(' + src + ')')(o).reduce((a, m) => a + m.keys.length, 0);
      return { fast: count(fastSrc), slow: count(slowSrc) };
    }, { fastSrc, slowSrc, drive: DRIVE });
    (r.fast < r.slow)
      ? ok('PART 2 half "' + nm + '": ' + r.fast + ' keys filled vs ' + r.slow + ' typed — worth ' + (r.slow - r.fast) + ' keys')
      : bad('PART 2 half "' + nm + '" is NEGATIVE (' + r.fast + ' vs ' + r.slow + ') — the growth failure, fix the BOARD');
  }

  /* ============================ §D DEGRADATION ============================ */
  console.log('\n§D DEGRADATION — the r439 `cases` check: a fill copies the SOURCE format');
  const deg = await page.evaluate(({ star, slow, drive, seeds }) => {
    const snap = () => {
      const o = CHALLENGES.lbo._o;
      const grab = k => { const c = S.cells[k] || {}; return [c.fmtStyle, c.decimals, !!c.bold, !!c.bt, !!c.ball, c.fontColor || null].join('/'); };
      return [o.rEV, o.rEQ].map(r => o.allCols.map(c => grab(c + r)))
        .concat([o.rMO, o.rIR].map(r => o.cols.map(c => grab(c + r)))).flat().join(' ');
    };
    const out = [];
    for (let i = 0; i < seeds; i++) {
      loadChallenge('lbo'); const o1 = CHALLENGES.lbo._o;
      eval('(' + drive + ')')(eval('(' + star + ')')(o1)); const a = snap();
      loadChallenge('lbo'); const o2 = CHALLENGES.lbo._o;
      eval('(' + drive + ')')(eval('(' + slow + ')')(o2)); const b = snap();
      out.push(a === b ? '' : 'seed ' + i + ':\n  star ' + a + '\n  slow ' + b);
    }
    return out.filter(Boolean);
  }, { star: STAR, slow: SLOW, drive: DRIVE, seeds: SEEDS });
  deg.length ? bad('the star leaves a DIFFERENT dress than the slow route:\n' + deg[0])
             : ok('the star and the slow route leave byte-identical formatting on all four built lines');

  if (errs.length) bad('PAGE ERRORS: ' + errs.slice(0, 3).join(' · '));
  console.log('\nVERIFY-LBO: ' + (fails ? fails + ' FAILURE(S)' : 'ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
