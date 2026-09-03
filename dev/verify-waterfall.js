/* r444 — WATERFALL DEPTH-PASS PROBE (DEPTH_PASS §4.72, MODELING_STANDARDS, CAMPAIGN §1/§2).
   Self-contained by C13's retirement guard: this file names exactly one drill key, `waterfall`,
   and nothing else in the catalog.

   WHY IT EXISTS. CAMPAIGN §1: the untriggerable beat has been found thirteen times and NEVER
   ONCE by reading a predicate — only by walking a route. This probe walks them. It also carries
   the numbers the payload quotes, so nobody has to trust an assertion where a measurement was
   available (CAMPAIGN §2: "Every ☆ must be proved SKIPPABLE by measurement — not asserted,
   measured").

   SECTIONS
     A  board contract — ROWS 20, §1.3 density at the WIN state, tri-length, one ☆, the
        geometry moats, the MODELING_STANDARDS colour/sign/border conventions
     B  ROUTE ENUMERATION — every legal Excel route to each visible end state, WALKED
        (§1.0-R3(p): when two routes produce the same board, both must clear)
     C  ☆ HEADROOM (CAMPAIGN §2, both parts) — star route vs the slowest legal route, the ☆
        move measured against its OWN slow alternative, and the ☆ proved SKIPPABLE
     D  the ☆ must not DEGRADE the board (r439 `cases`) — cell-format parity between the star
        route and the typed route
     E  fit — no ##### at load or at the win state

   Run:  URL=http://127.0.0.1:<port>/index.html node dev/verify-waterfall.js            */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URLX = process.env.URL || 'http://127.0.0.1:8791/index.html';
const SEEDS = 5;

let fails = 0;
const ok = m => console.log('  ok   ' + m);
const bad = m => { fails++; console.log('  FAIL ' + m); };
const chk = (c, m) => (c ? ok : bad)(m);

/* Every route below is expressed as a page-side factory `C => [{sel,keys}...]`, the same shape
   dev/e2e-alt-paths.js uses, so a route that passes here can be lifted into ALTS verbatim. */
const ROUTES = {

  /* the demo's own route, restated here so the harness has a baseline to key-count against */
  demo: `C => { const o=C._o, R=n=>Array(n).fill({key:'ArrowRight',shift:true}); return [
      {sel:o.CB+o.rCF, keys:[...T('=SUM('+o.CB+o.rEB+':'+o.CB+o.rWC+')'), {key:'Enter'}]},
      {sel:o.CB+o.rCF, keys:[...R(2), {key:'r',ctrl:true}]},
      {sel:o.CB+o.rCF, keys:[...R(2), {key:'b',ctrl:true}, {key:'Alt'}, L('h'), L('b'), L('p')]},
      {sel:o.CB+o.rSP, keys:[...T('=MIN('+o.CB+o.rCF+','+o.CB+o.rSB+')'), {key:'Enter'}]},
      {sel:o.CB+o.rSE, keys:[...T('='+o.CB+o.rSB+'-'+o.CB+o.rSP), {key:'Enter'}]},
      {sel:o.CB+o.rSP, keys:[...R(2), {key:'ArrowDown',shift:true}, {key:'r',ctrl:true}]},
      {sel:o.CC+o.rSB, keys:[...T('='+o.CB+o.rSE), {key:'Enter'}]},
      {sel:o.CC+o.rSB, keys:[...R(1), {key:'r',ctrl:true}]},
      {sel:o.CB+o.rCA, keys:[...T('='+o.CB+o.rCF+'-'+o.CB+o.rSP), {key:'Enter'}]},
      {sel:o.CB+o.rCA, keys:[...R(2), {key:'r',ctrl:true}]},
      {sel:o.CB+o.rSP, keys:[...R(2), {key:'ArrowDown',shift:true}, {key:'c',ctrl:true}]},
      {sel:o.CB+o.rJP, keys:[{key:'v',ctrl:true}]},
      {sel:o.CC+o.rJB, keys:[...T('='+o.CB+o.rJE), {key:'Enter'}]},
      {sel:o.CC+o.rJB, keys:[...R(1), {key:'r',ctrl:true}]},
    ]; }`,

  /* B1 · THE CASH ROW BY ADDITION CHAIN, NOT SUM — and autosum for the fill.
     The shipped predicate graded a value, so this must clear; it is the class that killed
     `balance`'s two total beats (an addition chain foots identically). */
  cashChain: `C => { const o=C._o, R=n=>Array(n).fill({key:'ArrowRight',shift:true}); return [
      {sel:o.CB+o.rCF, keys:[...T('='+o.CB+o.rEB+'+'+o.CB+o.rCX+'+'+o.CB+o.rIN+'+'+o.CB+o.rTX+'+'+o.CB+o.rWC), {key:'Enter'}]},
      {sel:o.CB+o.rCF, keys:[...R(2), {key:'r',ctrl:true}]},
      {sel:o.CA+o.rCF, keys:[...R(3), {key:'Alt'}, L('h'), D(1), {key:'Alt'}, L('h'), L('b'), L('p')]},
      {sel:o.CB+o.rSP, keys:[...T('=MIN('+o.CB+o.rCF+','+o.CB+o.rSB+')'), {key:'Enter'}]},
      {sel:o.CB+o.rSE, keys:[...T('='+o.CB+o.rSB+'-'+o.CB+o.rSP), {key:'Enter'}]},
      {sel:o.CB+o.rSP, keys:[...R(2), {key:'ArrowDown',shift:true}, {key:'r',ctrl:true}]},
      {sel:o.CC+o.rSB, keys:[...T('='+o.CB+o.rSE), {key:'Enter'}]},
      {sel:o.CD+o.rSB, keys:[...T('='+o.CC+o.rSE), {key:'Enter'}]},
      {sel:o.CB+o.rCA, keys:[...T('='+o.CB+o.rCF+'-'+o.CB+o.rSP), {key:'Enter'}]},
      {sel:o.CB+o.rCA, keys:[...R(2), {key:'r',ctrl:true}]},
      {sel:o.CB+o.rJP, keys:[...T('=MIN('+o.CB+o.rCA+','+o.CB+o.rJB+')'), {key:'Enter'}]},
      {sel:o.CB+o.rJE, keys:[...T('='+o.CB+o.rJB+'-'+o.CB+o.rJP), {key:'Enter'}]},
      {sel:o.CB+o.rJP, keys:[...R(2), {key:'ArrowDown',shift:true}, {key:'r',ctrl:true}]},
      {sel:o.CC+o.rJB, keys:[...T('='+o.CB+o.rJE), {key:'Enter'}]},
      {sel:o.CD+o.rJB, keys:[...T('='+o.CC+o.rJE), {key:'Enter'}]},
    ]; }`,

  /* B2 · AUTOSUM for the cash row + the ANCHORED MIN + the outside-border route for the rule.
     The anchored form is the exact shape that stranded `wrapfix` (campaign bug #9): the habit
     `anchor`/`fxconvert` teach must never darken a line. */
  anchoredAutosum: `C => { const o=C._o, R=n=>Array(n).fill({key:'ArrowRight',shift:true}); return [
      {sel:o.CB+o.rEB, keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'=',alt:true,code:'Equal'}]},
      {sel:o.CC+o.rEB, keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'=',alt:true,code:'Equal'}]},
      {sel:o.CD+o.rEB, keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'=',alt:true,code:'Equal'}]},
      {sel:o.CB+o.rCF, keys:[...R(2), {key:'b',ctrl:true}, {key:'Alt'}, L('h'), L('b'), L('s')]},
      {sel:o.CB+o.rSP, keys:[...T('=MIN($'+o.CB+'$'+o.rCF+',$'+o.CB+'$'+o.rSB+')'), {key:'Enter'}]},
      {sel:o.CC+o.rSP, keys:[...T('=MIN($'+o.CC+'$'+o.rCF+',$'+o.CC+'$'+o.rSB+')'), {key:'Enter'}]},
      {sel:o.CD+o.rSP, keys:[...T('=MIN($'+o.CD+'$'+o.rCF+',$'+o.CD+'$'+o.rSB+')'), {key:'Enter'}]},
      {sel:o.CB+o.rSE, keys:[...T('='+o.CB+o.rSB+'-'+o.CB+o.rSP), {key:'Enter'}]},
      {sel:o.CB+o.rSE, keys:[...R(2), {key:'r',ctrl:true}]},
      {sel:o.CC+o.rSB, keys:[...T('='+o.CB+o.rSE), {key:'Enter'}]},
      {sel:o.CC+o.rSB, keys:[...R(1), {key:'r',ctrl:true}]},
      {sel:o.CB+o.rCA, keys:[...T('='+o.CB+o.rCF+'-'+o.CB+o.rSP), {key:'Enter'}]},
      {sel:o.CB+o.rCA, keys:[...R(2), {key:'r',ctrl:true}]},
      {sel:o.CB+o.rJP, keys:[...T('=MIN($'+o.CB+'$'+o.rCA+',$'+o.CB+'$'+o.rJB+')'), {key:'Enter'}]},
      {sel:o.CC+o.rJP, keys:[...T('=MIN($'+o.CC+'$'+o.rCA+',$'+o.CC+'$'+o.rJB+')'), {key:'Enter'}]},
      {sel:o.CD+o.rJP, keys:[...T('=MIN($'+o.CD+'$'+o.rCA+',$'+o.CD+'$'+o.rJB+')'), {key:'Enter'}]},
      {sel:o.CB+o.rJE, keys:[...T('='+o.CB+o.rJB+'-'+o.CB+o.rJP), {key:'Enter'}]},
      {sel:o.CB+o.rJE, keys:[...R(2), {key:'r',ctrl:true}]},
      {sel:o.CC+o.rJB, keys:[...T('='+o.CB+o.rJE), {key:'Enter'}]},
      {sel:o.CC+o.rJB, keys:[...R(1), {key:'r',ctrl:true}]},
    ]; }`,

  /* B3 · THE RATIONING WRITTEN AS AN IF, NOT A MIN, and the rule drawn by Alt H B A.
     Same number on the board, different function — the shipped predicate demanded the literal
     'MIN(' out of formula text and this route was the one it locked out. */
  ifInsteadOfMin: `C => { const o=C._o, R=n=>Array(n).fill({key:'ArrowRight',shift:true}); return [
      {sel:o.CB+o.rCF, keys:[...T('=SUM('+o.CB+o.rEB+':'+o.CB+o.rWC+')'), {key:'Enter'}]},
      {sel:o.CB+o.rCF, keys:[...R(2), {key:'r',ctrl:true}]},
      {sel:o.CB+o.rCF, keys:[...R(2), {key:'b',ctrl:true}, {key:'Alt'}, L('h'), L('b'), L('a')]},
      {sel:o.CB+o.rSP, keys:[...T('=IF('+o.CB+o.rCF+'<'+o.CB+o.rSB+','+o.CB+o.rCF+','+o.CB+o.rSB+')'), {key:'Enter'}]},
      {sel:o.CB+o.rSE, keys:[...T('='+o.CB+o.rSB+'-'+o.CB+o.rSP), {key:'Enter'}]},
      {sel:o.CB+o.rSP, keys:[...R(2), {key:'ArrowDown',shift:true}, {key:'r',ctrl:true}]},
      {sel:o.CC+o.rSB, keys:[...T('='+o.CB+o.rSE), {key:'Enter'}]},
      {sel:o.CC+o.rSB, keys:[...R(1), {key:'r',ctrl:true}]},
      {sel:o.CB+o.rCA, keys:[...T('='+o.CB+o.rCF+'-'+o.CB+o.rSP), {key:'Enter'}]},
      {sel:o.CB+o.rCA, keys:[...R(2), {key:'r',ctrl:true}]},
      {sel:o.CB+o.rJP, keys:[...T('=IF('+o.CB+o.rCA+'<'+o.CB+o.rJB+','+o.CB+o.rCA+','+o.CB+o.rJB+')'), {key:'Enter'}]},
      {sel:o.CB+o.rJE, keys:[...T('='+o.CB+o.rJB+'-'+o.CB+o.rJP), {key:'Enter'}]},
      {sel:o.CB+o.rJP, keys:[...R(2), {key:'ArrowDown',shift:true}, {key:'r',ctrl:true}]},
      {sel:o.CC+o.rJB, keys:[...T('='+o.CB+o.rJE), {key:'Enter'}]},
      {sel:o.CC+o.rJB, keys:[...R(1), {key:'r',ctrl:true}]},
    ]; }`,

  /* B4 · THE RIBBON FILL EVERYWHERE (Alt H F I R) + the legacy paste dialog for the ☆.
     Proves the ☆ is chord-agnostic: the Alt H V S dialog's Formulas option must earn it
     exactly as Ctrl+V does. (Alt H V offers only Values and Paste-special — there is no H V F.) */
  ribbonRoutes: `C => { const o=C._o, R=n=>Array(n).fill({key:'ArrowRight',shift:true}); return [
      {sel:o.CB+o.rCF, keys:[...T('=SUM('+o.CB+o.rEB+':'+o.CB+o.rWC+')'), {key:'Enter'}]},
      {sel:o.CB+o.rCF, keys:[...R(2), {key:'Alt'}, L('h'), L('f'), L('i'), L('r')]},
      {sel:o.CB+o.rCF, keys:[...R(2), {key:'Alt'}, L('h'), D(1), {key:'Alt'}, L('h'), L('b'), L('p')]},
      {sel:o.CB+o.rSP, keys:[...T('=MIN('+o.CB+o.rCF+','+o.CB+o.rSB+')'), {key:'Enter'}]},
      {sel:o.CB+o.rSE, keys:[...T('='+o.CB+o.rSB+'-'+o.CB+o.rSP), {key:'Enter'}]},
      {sel:o.CB+o.rSP, keys:[...R(2), {key:'ArrowDown',shift:true}, {key:'Alt'}, L('h'), L('f'), L('i'), L('r')]},
      {sel:o.CC+o.rSB, keys:[...T('='+o.CB+o.rSE), {key:'Enter'}]},
      {sel:o.CC+o.rSB, keys:[...R(1), {key:'Alt'}, L('h'), L('f'), L('i'), L('r')]},
      {sel:o.CB+o.rCA, keys:[...T('='+o.CB+o.rCF+'-'+o.CB+o.rSP), {key:'Enter'}]},
      {sel:o.CB+o.rCA, keys:[...R(2), {key:'Alt'}, L('h'), L('f'), L('i'), L('r')]},
      {sel:o.CB+o.rSP, keys:[...R(2), {key:'ArrowDown',shift:true}, {key:'c',ctrl:true}]},
      {sel:o.CB+o.rJP, keys:[{key:'Alt'}, L('h'), L('v'), L('s'), L('f'), {key:'Enter'}]},
      {sel:o.CC+o.rJB, keys:[...T('='+o.CB+o.rJE), {key:'Enter'}]},
      {sel:o.CC+o.rJB, keys:[...R(1), {key:'Alt'}, L('h'), L('f'), L('i'), L('r')]},
    ]; }`,

  /* C · THE SLOWEST LEGAL ROUTE (the negative control that sets the headroom denominator):
     every year-cell typed on its own, no fill and no paste anywhere, the dress walked cell by
     cell. Must clear all six cores and MUST leave the ☆ dark. */
  slowest: `C => { const o=C._o, out=[], Y=[o.CB,o.CC,o.CD];
      for(let i=0;i<3;i++) out.push({sel:Y[i]+o.rCF, keys:[...T('=SUM('+Y[i]+o.rEB+':'+Y[i]+o.rWC+')'), {key:'Enter'}]});
      for(let i=0;i<3;i++) out.push({sel:Y[i]+o.rCF, keys:[{key:'b',ctrl:true}, {key:'Alt'}, L('h'), L('b'), L('p')]});
      for(let i=0;i<3;i++) out.push({sel:Y[i]+o.rSP, keys:[...T('=MIN('+Y[i]+o.rCF+','+Y[i]+o.rSB+')'), {key:'Enter'}]});
      for(let i=0;i<3;i++) out.push({sel:Y[i]+o.rSE, keys:[...T('='+Y[i]+o.rSB+'-'+Y[i]+o.rSP), {key:'Enter'}]});
      for(let i=1;i<3;i++) out.push({sel:Y[i]+o.rSB, keys:[...T('='+Y[i-1]+o.rSE), {key:'Enter'}]});
      for(let i=0;i<3;i++) out.push({sel:Y[i]+o.rCA, keys:[...T('='+Y[i]+o.rCF+'-'+Y[i]+o.rSP), {key:'Enter'}]});
      for(let i=0;i<3;i++) out.push({sel:Y[i]+o.rJP, keys:[...T('=MIN('+Y[i]+o.rCA+','+Y[i]+o.rJB+')'), {key:'Enter'}]});
      for(let i=0;i<3;i++) out.push({sel:Y[i]+o.rJE, keys:[...T('='+Y[i]+o.rJB+'-'+Y[i]+o.rJP), {key:'Enter'}]});
      for(let i=1;i<3;i++) out.push({sel:Y[i]+o.rJB, keys:[...T('='+Y[i-1]+o.rJE), {key:'Enter'}]});
      return out; }`,
};

/* the two halves of the ☆ measured on their OWN, against their OWN slow alternative
   (CAMPAIGN §2: a combined number hides a negative half — the r438 `series` finding). */
const STAR_HALF = {
  star: `C => { const o=C._o, R=n=>Array(n).fill({key:'ArrowRight',shift:true}); return [
      {sel:o.CB+o.rSP, keys:[...R(2), {key:'ArrowDown',shift:true}, {key:'c',ctrl:true}]},
      {sel:o.CB+o.rJP, keys:[{key:'v',ctrl:true}]},
    ]; }`,
  typedThenFilled: `C => { const o=C._o, R=n=>Array(n).fill({key:'ArrowRight',shift:true}); return [
      {sel:o.CB+o.rJP, keys:[...T('=MIN('+o.CB+o.rCA+','+o.CB+o.rJB+')'), {key:'Enter'}]},
      {sel:o.CB+o.rJE, keys:[...T('='+o.CB+o.rJB+'-'+o.CB+o.rJP), {key:'Enter'}]},
      {sel:o.CB+o.rJP, keys:[...R(2), {key:'ArrowDown',shift:true}, {key:'r',ctrl:true}]},
    ]; }`,
  typedEveryCell: `C => { const o=C._o, out=[], Y=[o.CB,o.CC,o.CD];
      for(let i=0;i<3;i++) out.push({sel:Y[i]+o.rJP, keys:[...T('=MIN('+Y[i]+o.rCA+','+Y[i]+o.rJB+')'), {key:'Enter'}]});
      for(let i=0;i<3;i++) out.push({sel:Y[i]+o.rJE, keys:[...T('='+Y[i]+o.rJB+'-'+Y[i]+o.rJP), {key:'Enter'}]});
      return out; }`,
};

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  /* MIRROR THE REAL HARNESS INIT — a probe whose page state differs from the gate's is a probe
     that lies (CAMPAIGN, the r440 `hotkey_onboarded` note and the r441 hidden-rows note). */
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_gate_off', '1');    localStorage.setItem('hk_xlv', '2'); localStorage.setItem('hk_handle_cache', '');
  } catch (e) {} });
  const perr = [];
  page.on('pageerror', e => perr.push(String(e.message).slice(0, 140)));
  await page.goto(URLX, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  const run = (name, src) => page.evaluate(({ src }) => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
    loadChallenge('waterfall');
    const C = CHALLENGES.waterfall;
    try {
      const moves = eval('(' + src + ')')(C);
      for (const mv of moves) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
    } catch (e) { return { threw: String(e).slice(0, 160) }; }
    const items = C.checks(S);
    const preSave = items.filter(x => !x.save);
    const cores = preSave.filter(x => !x.bonus);
    if (!done && C.saveClose) demoKey({ key: 's', ctrl: true });
    return {
      won: done, keys: keyLog.length,
      coresOk: cores.every(x => x.ok),
      dark: cores.filter(x => !x.ok).map(x => x.label),
      star: !!(preSave.find(x => x.bonus) || {}).ok,
    };
  }, { src });

  console.log('\n=== A · BOARD CONTRACT (§1.1/§1.3/§1.9 + MODELING_STANDARDS) ===');
  const A = await page.evaluate(() => {
    loadChallenge('waterfall');
    const C = CHALLENGES.waterfall, o = C._o;
    const rows = S.ROWS, used = new Set(); let loadCells = 0, winCells = 0;
    for (let r = 1; r <= rows; r++) for (let c = 1; c <= COLS; c++) {
      const x = S.cells[colLetter(c) + r];
      if (x && ((x.value !== null && x.value !== '') || x.formula)) { used.add(r); loadCells++; }
    }
    const loadRows = used.size;
    /* WIN-STATE density is what §1.3 asks for: content OR SCRIPTED PURPOSE. Replay the demo,
       then recount — the load count alone undercounts every cell the player fills. */
    const moves = C.demo.call(C);
    for (const mv of moves) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
    const winUsed = new Set();
    for (let r = 1; r <= rows; r++) for (let c = 1; c <= COLS; c++) {
      const x = S.cells[colLetter(c) + r];
      if (x && ((x.value !== null && x.value !== '') || x.formula)) { winUsed.add(r); winCells++; }
    }
    const items = C.checks(S);
    const g = C.guide.call(C), t = C.targets.call(C);
    /* MODELING_STANDARDS §1: every typed input blue, every built cell black formula ink.
       §2: costs carry their sign. §1/§1.0(f): the built total wears a TOP border, never a
       rule underneath. */
    const inputs = [o.rEB, o.rCX, o.rIN, o.rTX, o.rWC].flatMap(r => o.cols.map(c => c + r))
      .concat([o.CB + o.rSB, o.CB + o.rJB]);
    const blueOk = inputs.every(k => (S.cells[k] || {}).fontColor === 'blue');
    const signOk = [o.rCX, o.rIN, o.rTX, o.rWC].every(r => o.cols.every(c => S.cells[c + r].value < 0));
    const totalTop = o.cols.every(c => { const x = S.cells[c + o.rCF]; return !!(x && x.bt && !x.bb); });
    const moats = [10, 15, 19].every(r => !Array.from({ length: COLS }, (_, i) => S.cells[colLetter(i + 1) + r])
      .some(x => x && ((x.value !== null && x.value !== '') || x.formula)));
    return {
      rows, loadRows, winRows: winUsed.size, loadCells, winCells, nChecks: items.length,
      nGuide: g.length, nTargets: t.length,
      nBonus: items.filter(x => x.bonus).length,
      saveBeat: items.filter(x => x.save).length,
      firstWords: items.filter(x => !x.save).map(x => String(x.label).split(' ')[0]),
      blueOk, signOk, totalTop, moats, won: done,
      offset: (o.rJP - o.rSP) === 5 && (o.rJE - o.rSE) === 5 && (o.rJB - o.rSB) === 5 && (o.rCA - o.rCF) === 5,
    };
  });
  chk(A.rows === 20, `ROWS = ${A.rows} (§1.3: 20 is floor AND cap)`);
  chk(A.winRows / 20 >= 0.6, `§1.3 density at the WIN state: ${A.winRows}/20 = ${Math.round(A.winRows / 20 * 100)}% (load ${A.loadRows}/20; target >=60%)`);
  /* §1.3's "identical load and win density" tell is about a board FILLING CELLS INSIDE ROWS
     THAT ALREADY EXIST while an empty band sits at the bottom. Every computed row here carries
     its own column-A label at load (§1.3's labelled-target rule demands it), so the ROW count is
     17 both ways by construction and the row figure cannot express the tell. The honest measure
     is CELLS: the board must gain real content as it is solved, and the bottom of the sheet must
     not be the empty band — row 20 carries the basis memo. */
  chk(A.winCells > A.loadCells * 1.25, `content grows load -> win: ${A.loadCells} -> ${A.winCells} cells (+${A.winCells - A.loadCells}); the row count is 17 both ways because every computed row ships labelled (§1.3 labelled targets), and row 20 carries the memo, so there is no empty band at the bottom`);
  chk(A.nChecks === A.nGuide && A.nChecks === A.nTargets, `§1.9 tri-length: checks ${A.nChecks} = guide ${A.nGuide} = targets ${A.nTargets} (save beat included)`);
  chk(A.nBonus === 1, `exactly one bonus:true beat (${A.nBonus})`);
  chk(A.saveBeat === 1, `the §1.0(e) Ctrl+S closer is engine-appended, not hand-written (${A.saveBeat})`);
  chk(A.nChecks - A.nBonus - A.saveBeat === 6, `${A.nChecks - A.nBonus - A.saveBeat} core beats (§1.1: 4-6, the save closer exempt)`);
  {
    const VERBS = new Set(['Add', 'Autofit', 'Bold', 'Build', 'Center', 'Clear', 'Collect', 'Color', 'Comma-format', 'Copy', 'Cut', 'Delete', 'Dollar-format', 'Enter', 'Fill', 'Filter', 'Find', 'Finish', 'Fix', 'Flip', 'Fold', 'Group', 'Indent', 'Insert', 'Italicize', 'Left-align', 'Move', 'Paste', 'Percent-format', 'Reference', 'Repoint', 'Select', 'Set', 'Sort', 'Total', 'Trace', 'Transpose', 'Unbold', 'Underline', 'Undo', 'Unhide', 'Unfold', 'Wrap']);
    const strays = A.firstWords.filter(w => !VERBS.has(w));
    chk(strays.length === 0, `§1.7 closed verb list: every label opens with an approved verb${strays.length ? ' — stray: ' + strays.join(', ') : ''}`);
  }
  chk(A.offset, 'the +5 senior->junior row offset holds (the ☆ mechanism)');
  chk(A.blueOk, 'MODELING_STANDARDS §1: every typed input ships blue');
  chk(A.signOk, 'MODELING_STANDARDS §2: capex / interest / taxes / working capital all carry a negative sign');
  chk(A.totalTop, 'MODELING_STANDARDS §1 + §1.0(f): the built total wears a TOP border, never a rule underneath');
  chk(A.moats, 'doctrine §3 geometry: rows 10 / 15 / 19 are empty moats between the three blocks');
  chk(A.won, 'the demo wins (the ☆ included, §1.9)');

  console.log('\n=== B · ROUTE ENUMERATION — every legal route WALKED (§1.0-R3(p)) ===');
  const keyCounts = {};
  for (const [name, src] of Object.entries(ROUTES)) {
    let wins = 0, stars = 0, dark = null; const ks = [];
    for (let s = 0; s < SEEDS; s++) {
      const r = await run(name, src);
      if (r.threw) { bad(`${name}: THREW ${r.threw}`); break; }
      if (r.won) wins++; else dark = r.dark;
      if (r.star) stars++;
      ks.push(r.keys);
    }
    ks.sort((a, b) => a - b);
    keyCounts[name] = ks[Math.floor(ks.length / 2)] || 0;
    chk(wins === SEEDS, `${name}: wins ${wins}/${SEEDS} · median ${keyCounts[name]} keys · ☆ ${stars}/${SEEDS}${dark ? ' · stuck on: ' + dark.join(' | ') : ''}`);
  }
  chk(keyCounts.slowest > 0, `the slowest legal route clears every core (the §1.0(c) freedom proof)`);

  console.log('\n=== C · ☆ HEADROOM (CAMPAIGN §2, both parts + each half isolated) ===');
  chk(ROUTES.slowest && keyCounts.slowest / keyCounts.demo >= 1.3,
    `PART 1 spread: slowest ${keyCounts.slowest} / fastest ${keyCounts.demo} = ${(keyCounts.slowest / keyCounts.demo).toFixed(2)}x (below ~1.3x is a warning)`);
  {
    /* PART 2 is the half that decides: strip the spread that a ☆ may not reward. */
    const fmtKeys = 3 * 5 - 7;   // the dress walked cell by cell (3 x Ctrl+B + Alt H B P) vs one selection
    const legal = keyCounts.slowest - keyCounts.demo - fmtKeys;
    chk(legal > 0, `PART 2: of ${keyCounts.slowest - keyCounts.demo} keys of spread, ${fmtKeys} are formatting (§1.0(d) forbids) and 0 are chord-vs-ribbon (§1.0(c) forces those to clear — proved by the ribbonRoutes walk above); ${legal} keys survive as COPY/FILL-vs-RETYPE, which §1.0(d) names`);
  }
  const halves = {};
  for (const [name, src] of Object.entries(STAR_HALF)) {
    const r = await page.evaluate(({ src }) => {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge('waterfall');
      const C = CHALLENGES.waterfall;
      /* bring the board to the point where the junior tranche is the only thing left, so the
         measured half is the MOVE and nothing else */
      const pre = C.demo.call(C).slice(0, 10);
      for (const mv of pre) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
      const before = keyLog.length;
      const moves = eval('(' + src + ')')(C);
      for (const mv of moves) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
      return { cost: keyLog.length - before };
    }, { src });
    halves[name] = r.cost;
  }
  ok(`the ☆ move ISOLATED: star ${halves.star} keys · same six cells typed-then-filled ${halves.typedThenFilled} keys · typed one at a time ${halves.typedEveryCell} keys`);
  chk(halves.star < halves.typedThenFilled,
    `the star beats its OWN nearest alternative by ${halves.typedThenFilled - halves.star} keys (${(halves.typedThenFilled / halves.star).toFixed(1)}x) — not the `
    + `growth failure, where the canonical route measured WORSE`);
  {
    const r = await run('slowest', ROUTES.slowest);
    chk(r.coresOk && !r.star, `☆ SKIPPABLE, measured not asserted: the slowest route clears all six cores with the ☆ DARK (§1.0-R2(i))`);
  }
  {
    const r = await run('ribbonRoutes', ROUTES.ribbonRoutes);
    chk(r.star, `☆ chord-agnostic: the Alt H V S -> Formulas paste earns it exactly as Ctrl+V does (§1.0(c))`);
  }
  {
    /* a VALUES paste must NOT earn it — values do not translate, so that route would land the
       senior's numbers on the junior rows and the board would be wrong. */
    const r = await page.evaluate(() => {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge('waterfall');
      const C = CHALLENGES.waterfall, o = C._o;
      const pre = C.demo.call(C).slice(0, 10);
      for (const mv of pre) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
      setDemoSel(o.CB + o.rSP);
      [{ key: 'ArrowRight', shift: true }, { key: 'ArrowRight', shift: true }, { key: 'ArrowDown', shift: true }, { key: 'c', ctrl: true }].forEach(demoKey);
      setDemoSel(o.CB + o.rJP);
      [{ key: 'Alt' }, L('h'), L('v'), L('v')].forEach(demoKey);
      const items = C.checks(S);
      return { star: !!(items.find(x => x.bonus) || {}).ok };
    });
    chk(!r.star, 'a VALUES paste does not earn the ☆ (it would land the senior figures on the junior rows)');
  }

  console.log('\n=== D · THE ☆ MUST NOT DEGRADE THE BOARD (r439 `cases`) ===');
  /* PROBE DISCIPLINE (CAMPAIGN, third sighting of this class): the first cut of this section
     snapshotted the junior tranche after the STAR route on one loadChallenge and after the TYPED
     route on another, then compared them by absolute cell key — but the two loads are different
     SEEDS, and the corner-jitter axis moves the whole page between column A and column B, so the
     keys did not even name the same cells. It reported a difference that was an artefact of the
     comparison. The claim that actually matters is per-seed and is what is asserted now: NEITHER
     route may change the dress the board shipped with. */
  const D = await page.evaluate(() => {
    const sig = () => {
      const C = CHALLENGES.waterfall, o = C._o, m = {};
      [o.rJP, o.rJE].forEach(r => o.cols.forEach((c, i) => {
        const x = S.cells[c + r] || {};
        m[(r === o.rJP ? 'paydown' : 'ending') + i] = [x.fmtStyle, x.decimals, !!x.bold, !!x.bt, !!x.it, x.fontColor || null, !!x.txt].join('|');
      }));
      return m;
    };
    const out = {};
    for (const mode of ['star', 'typed']) {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge('waterfall');
      const C = CHALLENGES.waterfall, o = C._o, Y = [o.CB, o.CC, o.CD];
      const before = sig();
      for (const mv of C.demo.call(C).slice(0, 10)) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
      if (mode === 'star') {
        setDemoSel(o.CB + o.rSP);
        [{ key: 'ArrowRight', shift: true }, { key: 'ArrowRight', shift: true }, { key: 'ArrowDown', shift: true }, { key: 'c', ctrl: true }].forEach(demoKey);
        setDemoSel(o.CB + o.rJP); demoKey({ key: 'v', ctrl: true });
      } else {
        for (let i = 0; i < 3; i++) { setDemoSel(Y[i] + o.rJP); [...T('=MIN(' + Y[i] + o.rCA + ',' + Y[i] + o.rJB + ')'), { key: 'Enter' }].forEach(demoKey); }
        for (let i = 0; i < 3; i++) { setDemoSel(Y[i] + o.rJE); [...T('=' + Y[i] + o.rJB + '-' + Y[i] + o.rJP), { key: 'Enter' }].forEach(demoKey); }
      }
      const after = sig();
      out[mode] = Object.keys(after).filter(k => after[k] !== before[k]).map(k => k + ': ' + before[k] + ' -> ' + after[k]);
      out[mode + 'Sig'] = after.paydown0 + ' / ' + after.ending0;
    }
    return out;
  });
  chk(D.star.length === 0 && D.typed.length === 0,
    `neither route changes the junior tranche's shipped dress — star ${D.star.length ? 'CHANGED ' + D.star.join(', ') : 'clean'}, typed ${D.typed.length ? 'CHANGED ' + D.typed.join(', ') : 'clean'} (paydown ${D.starSig})`);

  console.log('\n=== E · FIT — no ##### at load or at the win (§1.0-R3(r), unscaled px) ===');
  const E = await page.evaluate((SEEDS) => {
    const hits = { load: [], win: [] };
    for (let s = 0; s < SEEDS; s++) {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge('waterfall');
      const C = CHALLENGES.waterfall;
      const scan = where => { for (let c = 1; c <= COLS; c++) if (overflowsCol(S, c)) hits[where].push('col ' + colLetter(c)); };
      scan('load');
      for (const mv of C.demo.call(C)) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
      scan('win');
    }
    return hits;
  }, SEEDS);
  chk(E.load.length === 0, `no column overflows at load over ${SEEDS} seeds${E.load.length ? ' — ' + E.load.join(', ') : ''}`);
  chk(E.win.length === 0, `no column overflows at the win over ${SEEDS} seeds${E.win.length ? ' — ' + E.win.join(', ') : ''}`);

  if (perr.length) { fails++; console.log('\nPAGE ERRORS: ' + perr.slice(0, 3).join(' · ')); }
  console.log('\nverify-waterfall: ' + (fails ? fails + ' FAILURE(S)' : 'ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
