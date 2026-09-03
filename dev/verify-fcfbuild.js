/* r444 — fcfbuild ROUTE PROBE (DEPTH_PASS §1.0-R3(p) · DEPTH_PASS_CAMPAIGN §1/§2).

   Reading a predicate has never once found the untriggerable-beat class; every one of the
   thirteen the campaign has killed was found by WALKING a route. So this file walks them.

   It answers four questions, all with numbers rather than assertions:
     1. ROUTES — every Excel route that reaches the same visible end state must clear the same
        beat, and the routes that reach a DIFFERENT (wrong) end state must stay dark. Both the
        positive and the negative controls run.
     2. ☆ HEADROOM — the star route's key count against the slow route that does the same work,
        plus the proof that the star is SKIPPABLE (a named run clearing every core with the
        star dark). Also measures the two candidates that were REJECTED on the numbers.
     3. BOARD — win-state density against the §1.3 target, the 20-row cap, the blank moat
        between the build block and the assumptions block, and no #### at load or at the win.
     4. SPREAD — fastest legal run against the slowest legal run (the §2 diagnostic).

   Self-contained by the C13 retirement guard: this file names fcfbuild and nothing else.

   Run:  node dev/verify-fcfbuild.js            (server on 127.0.0.1:8791, or URL=…) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const REPS = parseInt(process.env.REPS || '3', 10);
const KEY = 'fcfbuild';

/* Every route below is a page-side function of the live challenge C, returning demo-style
   moves. `star` is what the ☆ must do on this route; `cores` is what the six core beats must
   do. A route whose expectation is not met is a FAILURE, in either direction. */
const ROUTES = [
  { name: 'the demo route (baseline: typed cascade, two fills, autosum total, dress)',
    cores: true, star: true,
    moves: `C => (typeof C.demo==='function'?C.demo.call(C):C.demo)` },

  { name: 'NOPAT FIRST, tax back-solved — =B6*(1-rate) up top, =B8-B6 underneath',
    cores: true, star: false,
    moves: `C => { const o=C._o; return [
      {sel:'B8',      keys:[...T('=B6*(1-'+o.rateAbs+')'), {key:'Enter'}]},
      {sel:'B7',      keys:[...T('=B8-B6'), {key:'Enter'}]},
      {sel:'B12',     keys:[...T('=SUM(B8:B11)'), {key:'Enter'}]},
      {sel:'B7:F8',   keys:[{key:'r',ctrl:true}]},
      {sel:'B12:F12', keys:[{key:'r',ctrl:true}]},
      {sel:'G12',     keys:[...T('=SUM(B12:F12)'), {key:'Enter'}]},
      {sel:'A12:G12', keys:[{key:'b',ctrl:true}]},
      {sel:'A12:G12', keys:[{key:'Alt'},L('H'),L('B'),L('P')]},
    ]; }` },

  { name: 'rate FIRST in the tax formula (=-rate*B6), NOPAT as =SUM(B6:B7), uFCF as an addition chain',
    cores: true, star: false,
    moves: `C => { const o=C._o; return [
      {sel:'B7',      keys:[...T('=-'+o.rateAbs+'*B6'), {key:'Enter'}]},
      {sel:'B8',      keys:[...T('=SUM(B6:B7)'), {key:'Enter'}]},
      {sel:'B12',     keys:[...T('=B8+B9+B10+B11'), {key:'Enter'}]},
      {sel:'B7:F8',   keys:[{key:'r',ctrl:true}]},
      {sel:'B12:F12', keys:[{key:'r',ctrl:true}]},
      {sel:'G12',     keys:[...T('=B12+C12+D12+E12+F12'), {key:'Enter'}]},
      {sel:'A12:G12', keys:[{key:'b',ctrl:true}]},
      {sel:'A12:G12', keys:[{key:'Alt'},L('H'),L('B'),L('P')]},
    ]; }` },

  { name: 'minus on the RIGHT (=B6*-rate), RIBBON fills (Alt H F I R), single-cell autosum proposal at G12',
    cores: true, star: true,
    moves: `C => { const o=C._o; return [
      {sel:'B7',      keys:[...T('=B6*-'+o.rateAbs), {key:'Enter'}]},
      {sel:'B8',      keys:[...T('=B6+B7'), {key:'Enter'}]},
      {sel:'B12',     keys:[...T('=SUM(B8:B11)'), {key:'Enter'}]},
      {sel:'B7:F7',   keys:[{key:'Alt'},L('H'),L('F'),L('I'),L('R')]},
      {sel:'B8:F8',   keys:[{key:'Alt'},L('H'),L('F'),L('I'),L('R')]},
      {sel:'B12:F12', keys:[{key:'Alt'},L('H'),L('F'),L('I'),L('R')]},
      {sel:'G12',     keys:[{key:'=',alt:true,code:'Equal'},{key:'Enter'}]},
      {sel:'A12:G12', keys:[{key:'b',ctrl:true}]},
      {sel:'A12:G12', keys:[{key:'Alt'},L('H'),L('B'),L('P')]},
    ]; }` },

  { name: 'COPY/PASTE instead of fill, dress BEFORE the total (op order swap)',
    cores: true, star: false,
    moves: `C => { const o=C._o; return [
      {sel:'B7',      keys:[...T('=-B6*'+o.rateAbs), {key:'Enter'}]},
      {sel:'B8',      keys:[...T('=B6+B7'), {key:'Enter'}]},
      {sel:'B12',     keys:[...T('=SUM(B8:B11)'), {key:'Enter'}]},
      {sel:'A12:G12', keys:[{key:'b',ctrl:true}]},
      {sel:'A12:G12', keys:[{key:'Alt'},L('H'),L('B'),L('P')]},
      {sel:'B7:B8',   keys:[{key:'c',ctrl:true}]},
      {sel:'C7:F8',   keys:[{key:'v',ctrl:true}]},
      {sel:'B12',     keys:[{key:'c',ctrl:true}]},
      {sel:'C12:F12', keys:[{key:'v',ctrl:true}]},
      {sel:'G12',     keys:[...T('=SUM(B12:F12)'), {key:'Enter'}]},
    ]; }` },

  /* ---- negative controls: these MUST leave a beat dark ---- */
  { name: 'NEGATIVE — the tax rate hardcoded inside the formula (=-B6*0.24)',
    cores: false, star: false, expectDark: 0,
    moves: `C => { const o=C._o; return [
      {sel:'B7',      keys:[...T('=-B6*'+o.tax), {key:'Enter'}]},
      {sel:'B8',      keys:[...T('=B6+B7'), {key:'Enter'}]},
      {sel:'B12',     keys:[...T('=SUM(B8:B11)'), {key:'Enter'}]},
      {sel:'B7:F8',   keys:[{key:'r',ctrl:true}]},
      {sel:'B12:F12', keys:[{key:'r',ctrl:true}]},
      {sel:'G12',     keys:[...T('=SUM(B12:F12)'), {key:'Enter'}]},
      {sel:'A12:G12', keys:[{key:'b',ctrl:true}]},
      {sel:'A12:G12', keys:[{key:'Alt'},L('H'),L('B'),L('P')]},
    ]; }` },

  { name: 'NEGATIVE — the rate reference left UNANCHORED, so the fill walks it off the assumption',
    cores: false, star: false, expectDark: 3,
    moves: `C => { const o=C._o; return [
      {sel:'B7',      keys:[...T('=-B6*'+o.rateCell), {key:'Enter'}]},
      {sel:'B8',      keys:[...T('=B6+B7'), {key:'Enter'}]},
      {sel:'B12',     keys:[...T('=SUM(B8:B11)'), {key:'Enter'}]},
      {sel:'B7:F8',   keys:[{key:'r',ctrl:true}]},
      {sel:'B12:F12', keys:[{key:'r',ctrl:true}]},
      {sel:'G12',     keys:[...T('=SUM(B12:F12)'), {key:'Enter'}]},
      {sel:'A12:G12', keys:[{key:'b',ctrl:true}]},
      {sel:'A12:G12', keys:[{key:'Alt'},L('H'),L('B'),L('P')]},
    ]; }` },

  { name: 'NEGATIVE — an OUTSIDE box on the closing line (Alt H B S), which hangs a rule under the total',
    cores: false, star: true, expectDark: 5,
    moves: `C => { const o=C._o; return [
      {sel:'B7',      keys:[...T('=-B6*'+o.rateAbs), {key:'Enter'}]},
      {sel:'B8',      keys:[...T('=B6+B7'), {key:'Enter'}]},
      {sel:'B12',     keys:[...T('=SUM(B8:B11)'), {key:'Enter'}]},
      {sel:'B7:F8',   keys:[{key:'r',ctrl:true}]},
      {sel:'B12:F12', keys:[{key:'r',ctrl:true}]},
      {sel:'B12:G12', keys:[{key:'=',alt:true,code:'Equal'}]},
      {sel:'A12:G12', keys:[{key:'b',ctrl:true}]},
      {sel:'A12:G12', keys:[{key:'Alt'},L('H'),L('B'),L('S')]},
    ]; }` },

  { name: 'NEGATIVE — a typed NUMBER in the plan-total cell instead of a live SUM',
    cores: false, star: false, expectDark: 4,
    moves: `C => { const o=C._o; return [
      {sel:'B7',      keys:[...T('=-B6*'+o.rateAbs), {key:'Enter'}]},
      {sel:'B8',      keys:[...T('=B6+B7'), {key:'Enter'}]},
      {sel:'B12',     keys:[...T('=SUM(B8:B11)'), {key:'Enter'}]},
      {sel:'B7:F8',   keys:[{key:'r',ctrl:true}]},
      {sel:'B12:F12', keys:[{key:'r',ctrl:true}]},
      {sel:'G12',     keys:[...T(String(Math.round(o.total))), {key:'Enter'}]},
      {sel:'A12:G12', keys:[{key:'b',ctrl:true}]},
      {sel:'A12:G12', keys:[{key:'Alt'},L('H'),L('B'),L('P')]},
    ]; }` },
];

/* ---- key-count measurements. Each entry is a route; the probe reports keyLog.length at the
   end of it, so the ☆ headroom and the drill's spread are numbers, never claims. ---- */
const MEASURES = [
  { name: 'FAST — the demo route (the taught run)', star: true,
    moves: `C => (typeof C.demo==='function'?C.demo.call(C):C.demo)` },

  { name: 'SLOW — every cell hand-typed, no fill, no autosum anywhere (the ☆-skippable control)', star: false,
    moves: `C => { const o=C._o; const YC=['B','C','D','E','F']; const mv=[];
      for(let i=0;i<5;i++){ const c=YC[i];
        mv.push({sel:c+'7',  keys:[...T('=-'+c+'6*'+o.rateAbs), {key:'Enter'}]});
        mv.push({sel:c+'8',  keys:[...T('='+c+'6+'+c+'7'), {key:'Enter'}]});
        mv.push({sel:c+'12', keys:[...T('='+c+'8+'+c+'9+'+c+'10+'+c+'11'), {key:'Enter'}]});
      }
      mv.push({sel:'G12', keys:[...T('=B12+C12+D12+E12+F12'), {key:'Enter'}]});
      mv.push({sel:'A12', keys:[{key:'b',ctrl:true}]});
      for(const c of ['A','B','C','D','E','F','G']) mv.push({sel:c+'12', keys:[{key:'Alt'},L('H'),L('B'),L('P')]});
      for(const c of YC) mv.push({sel:c+'12', keys:[{key:'b',ctrl:true}]});
      return mv; }` },

  { name: '☆ ROUTE — the plan total from autosum (range form, one press)', star: true, isolate: 'star',
    moves: `C => [{sel:'B12:G12', keys:[{key:'=',alt:true,code:'Equal'}]}]`,
    pre: 'fill' },

  { name: '☆ CONTROL — the same plan total TYPED (=SUM(B12:F12))', star: false, isolate: 'star',
    moves: `C => [{sel:'G12', keys:[...T('=SUM(B12:F12)'), {key:'Enter'}]}]`,
    pre: 'fill' },

  { name: 'REJECTED CANDIDATE — one fill pass over the two adjacent formula lines', star: null, isolate: 'fill',
    moves: `C => [
      {sel:'B7:F8',   keys:[{key:'r',ctrl:true}]},
      {sel:'B12:F12', keys:[{key:'r',ctrl:true}]},
    ]`, pre: 'seed' },

  { name: 'REJECTED CANDIDATE CONTROL — the same three lines filled ROW BY ROW', star: null, isolate: 'fill',
    moves: `C => [
      {sel:'B7:F7',   keys:[{key:'r',ctrl:true}]},
      {sel:'B8:F8',   keys:[{key:'r',ctrl:true}]},
      {sel:'B12:F12', keys:[{key:'r',ctrl:true}]},
    ]`, pre: 'seed' },
];

/* The two `pre` states, played with keyLog reset AFTERWARDS so a measurement counts only its
   own route: 'seed' = the three year-one formulas typed; 'fill' = seed + the fills. */
const PRE = {
  seed: `C => { const o=C._o; return [
    {sel:'B7',  keys:[...T('=-B6*'+o.rateAbs), {key:'Enter'}]},
    {sel:'B8',  keys:[...T('=B6+B7'), {key:'Enter'}]},
    {sel:'B12', keys:[...T('=SUM(B8:B11)'), {key:'Enter'}]},
  ]; }`,
  fill: `C => { const o=C._o; return [
    {sel:'B7',      keys:[...T('=-B6*'+o.rateAbs), {key:'Enter'}]},
    {sel:'B8',      keys:[...T('=B6+B7'), {key:'Enter'}]},
    {sel:'B12',     keys:[...T('=SUM(B8:B11)'), {key:'Enter'}]},
    {sel:'B7:F8',   keys:[{key:'r',ctrl:true}]},
    {sel:'B12:F12', keys:[{key:'r',ctrl:true}]},
  ]; }`,
};

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  /* MIRROR THE REAL HARNESS INIT — a probe that boots into the landing page, the tour or the
     welcome-back card measures the wrong thing and reports it confidently (the r440
     hotkey_onboarded omission, DEPTH_PASS_CAMPAIGN "suspect the probe before the product"). */
  await page.addInitScript(() => {
    try {
      localStorage.setItem('hotkey_onboarded', '1');
      localStorage.setItem('hk_tour_done', '1');
      localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_gate_off', '1');
      localStorage.setItem('hk_handle_cache', '');
      localStorage.setItem('hk_xlv', '2');
    } catch (e) {}
  });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function'
    && typeof setDemoSel === 'function' && typeof loadChallenge === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  let fails = 0;
  const say = (ok, line) => { if (!ok) fails++; console.log((ok ? '  ok  ' : ' FAIL ') + line); };

  /* ---------- 1 · ROUTES ---------- */
  console.log('\n1 · ROUTES — every route to the same end state clears; the wrong ones stay dark');
  for (const rt of ROUTES) {
    const seen = [];
    for (let rep = 0; rep < REPS; rep++) {
      const r = await page.evaluate(({ key, movesSrc }) => {
        try {
          document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
          loadChallenge(key);
          const C = CHALLENGES[key];
          for (const mv of eval('(' + movesSrc + ')')(C)) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
          const items = C.checks(S);
          const core = items.filter(x => !x.bonus && !x.save);
          const star = items.find(x => x.bonus);
          return { dark: core.map((x, i) => x.ok ? -1 : i).filter(i => i >= 0),
                   star: !!(star && star.ok), keys: keyLog.length };
        } catch (e) { return { err: String(e).slice(0, 120) }; }
      }, { key: KEY, movesSrc: rt.moves });
      if (r.err) { seen.push('THREW ' + r.err); continue; }
      seen.push(JSON.stringify({ dark: r.dark, star: r.star }));
    }
    const uniq = [...new Set(seen)];
    const one = JSON.parse(uniq.length === 1 && uniq[0][0] === '{' ? uniq[0] : '{"dark":[-9],"star":false}');
    const coresOk = rt.cores ? one.dark.length === 0 : (one.dark.length > 0 && (rt.expectDark === undefined || one.dark.includes(rt.expectDark)));
    const starOk = one.star === rt.star;
    say(uniq.length === 1 && coresOk && starOk,
      rt.name + '  →  cores dark ' + JSON.stringify(one.dark) + ' · ☆ ' + (one.star ? 'lit' : 'dark')
      + (uniq.length === 1 ? '' : '  [UNSTABLE ACROSS SEEDS: ' + uniq.join(' / ') + ']'));
  }

  /* ---------- 2 · KEY COUNTS ---------- */
  console.log('\n2 · KEY COUNTS — the ☆ headroom and the drill spread, measured (median of ' + REPS + ')');
  const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const counts = {};
  for (const m of MEASURES) {
    const got = [];
    for (let rep = 0; rep < REPS; rep++) {
      const r = await page.evaluate(({ key, movesSrc, preSrc }) => {
        try {
          document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
          loadChallenge(key);
          const C = CHALLENGES[key];
          if (preSrc) { for (const mv of eval('(' + preSrc + ')')(C)) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
                        keyLog.length = 0; }
          for (const mv of eval('(' + movesSrc + ')')(C)) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
          const items = C.checks(S);
          const star = items.find(x => x.bonus);
          return { keys: keyLog.length, star: !!(star && star.ok),
                   cores: items.filter(x => !x.bonus && !x.save).every(x => x.ok) };
        } catch (e) { return { err: String(e).slice(0, 120) }; }
      }, { key: KEY, movesSrc: m.moves, preSrc: m.pre ? PRE[m.pre] : null });
      if (r.err) { console.log(' FAIL ' + m.name + ' THREW ' + r.err); fails++; break; }
      got.push(r.keys);
      if (rep === 0) counts[m.name] = { keys: r.keys, star: r.star, cores: r.cores };
    }
    if (!got.length) continue;
    const c = counts[m.name]; c.keys = med(got);
    console.log('  ' + String(c.keys).padStart(4) + ' keys · ☆ ' + (c.star ? 'lit ' : 'dark') + ' · cores ' + (c.cores ? 'green' : '—   ') + ' · ' + m.name);
    if (m.star !== null && c.star !== m.star) { say(false, 'expected ☆ ' + (m.star ? 'lit' : 'dark') + ' on: ' + m.name); }
  }
  const g = n => (counts[MEASURES[n].name] || {}).keys || 0;
  const starKeys = g(2), starCtl = g(3), fillStar = g(4), fillCtl = g(5), fast = g(0), slow = g(1);
  say(starKeys < starCtl, '☆ headroom: ' + starKeys + ' keys against ' + starCtl + ' on the typed control (' + (starCtl - starKeys) + ' saved)');
  say(counts[MEASURES[1].name] && counts[MEASURES[1].name].cores && !counts[MEASURES[1].name].star,
    '☆ SKIPPABLE: the hand-typed run clears every core with the star dark (' + slow + ' keys)');
  /* setDemoSel() places a range for free, so these two isolate the MECHANIC only. Hand-keyed —
     the player stepping the selection out with Shift+arrow and walking between the rows — the
     same two runs are 22 and 26 keys, i.e. 4 saved. Either way it is the growth failure band
     and far under the ☆ route's 11, which is why the block fill is the demo's route and never
     the star. */
  console.log('  info  rejected fill candidate: ' + fillStar + ' keys against ' + fillCtl + ' row-by-row (mechanic only; 22 vs 26 hand-keyed) — too thin to carry a ☆');
  console.log('  info  §2 spread: ' + slow + ' / ' + fast + ' = ' + (fast ? (slow / fast).toFixed(2) : '?') + '×');

  /* ---------- 3 · BOARD ---------- */
  console.log('\n3 · BOARD — the §1.3 cap and density, the geometry moat, and the width verdicts');
  const board = await page.evaluate(({ key }) => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
    loadChallenge(key);
    const C = CHALLENGES[key];
    const rowsUsed = r => { for (let c = 1; c <= 10; c++) { const x = S.cells[String.fromCharCode(64 + c) + r]; if (x && ((x.value !== null && x.value !== '') || x.formula)) return true; } return false; };
    const loadRows = []; for (let r = 1; r <= S.ROWS; r++) if (rowsUsed(r)) loadRows.push(r);
    /* the moat: the row between the build block and the assumptions block must be empty in
       EVERY column, or Ctrl+arrow rides from one island into the other */
    const moat = !rowsUsed(13);
    const ovfLoad = []; for (let c = 1; c <= 10; c++) if (typeof overflowsCol === 'function' && overflowsCol(S, c)) ovfLoad.push(c);
    for (const mv of (typeof C.demo === 'function' ? C.demo.call(C) : C.demo)) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
    const winRows = []; for (let r = 1; r <= S.ROWS; r++) if (rowsUsed(r)) winRows.push(r);
    const ovfWin = []; for (let c = 1; c <= 10; c++) if (typeof overflowsCol === 'function' && overflowsCol(S, c)) ovfWin.push(c);
    const gw = document.getElementById('gridwrap'), gr = document.getElementById('grid');
    return { ROWS: S.ROWS, load: loadRows.length, win: winRows.length, moat, ovfLoad, ovfWin,
             sheetPx: gr ? gr.scrollWidth : 0, boxPx: gw ? gw.clientWidth : 0, won: done };
  }, { key: KEY });
  say(board.ROWS === 20, 'ROWS = ' + board.ROWS + ' (§1.3: 20 is floor AND cap)');
  say(board.win / board.ROWS >= 0.6, 'win-state density ' + board.win + '/' + board.ROWS + ' = ' + Math.round(100 * board.win / board.ROWS) + '% (target ≥60%); load ' + board.load + '/' + board.ROWS);
  /* Load and win counts match here, and that is NOT the §1.3 defect tell. The tell is a
     ROWS=14 board filling cells inside rows that already exist; this board declares 20 and
     every build row is labelled in column A at load, which §1.3 REQUIRES ("no graded target
     the sheet leaves unlabelled"). What changes between load and win is the figures, not the
     row count. */
  console.log('  info  rows carrying content: ' + board.load + ' at load, ' + board.win + ' at the win — the build rows are labelled from the start (§1.3 labelled targets)');
  say(board.moat, 'blank moat between the build block and the assumptions block');
  say(board.ovfLoad.length === 0, 'no #### at load (overflowing columns: ' + JSON.stringify(board.ovfLoad) + ')');
  say(board.ovfWin.length === 0, 'no #### at the win (overflowing columns: ' + JSON.stringify(board.ovfWin) + ')');
  say(board.won, 'the demo wins');
  console.log('  info  sheet ' + board.sheetPx + 'px into a ' + board.boxPx + 'px box (the elastic fit scales it; no width verdict is graded here)');

  if (errs.length) { console.log('\nPAGE ERRORS: ' + errs.slice(0, 3).join(' · ')); fails++; }
  console.log('\nVERIFY ' + KEY + ': ' + (fails ? fails + ' FAILURE(S)' : 'ALL CLEAR'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
