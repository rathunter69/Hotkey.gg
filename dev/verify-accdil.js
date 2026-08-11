/* verify-accdil.js — the accdil depth-pass probe (r444, DEPTH_PASS §4.65).

   Self-contained by the §9.1 ownership law: it names NO drill but `accdil`, so the C13
   retirement sweep can never be tripped by it.

   What it proves, and why each part exists:

   A · ROUTE ENUMERATION (§1.0-R3(p) + CAMPAIGN §1, the untriggerable-beat class).
       Thirteen untriggerable beats have been found in this campaign and every one was found by
       WALKING a route, never by reading a predicate. So every Excel route that reaches this
       board's visible end state is walked here and asserted to clear all six cores:
       typed refs vs point-mode vs F4 · SUM vs an addition chain · one block fill vs five row
       fills vs fifteen typed formulas · Ctrl+R vs Alt H F I R vs copy/paste ·
       Ctrl+1 P vs Alt H P + Alt H 0 vs Ctrl+Shift+% + Alt H 0 · and two op orders.

   B · ☆-HEADROOM DIAGNOSTIC, both parts (CAMPAIGN §2). Part 1 measures the fastest and the
       slowest legal routes in keys. Part 2 is the part that does the work: it isolates the
       star's OWN move against its own slow alternative, so a favourable total can never hide a
       negative half (the r438 rule that a combined number hides a negative half).

   C · SKIPPABILITY (§1.0-R2(i)), measured and not asserted: two named routes clear every core
       beat with the ☆ DARK, with their key counts printed.

   D · BOARD INVARIANTS: §1.3 density at load and at the win state, the 20-row cap, the
       §1.0(f)/(l) helper-stack convention, MODELING_STANDARDS colour-as-provenance and the
       top-border rule, and that the accretion line ships UNformatted so beat 6 is dark at load.

   Harness init mirrors dev/e2e-demo-replay.js exactly (hotkey_onboarded · hk_tour_done ·
   hk_learn_done · hk_handle_cache) — an init that drifts from the real harness makes every
   number below a lie (the r440 hotkey_onboarded incident).

   Run: node dev/verify-accdil.js        (URL=http://127.0.0.1:<port>/index.html) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const REPS = parseInt(process.env.REPS || '5', 10);

let fail = 0;
const ok = m => console.log('  ok   ' + m);
const bad = m => { fail++; console.log('  FAIL ' + m); };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  page.on('pageerror', e => bad('page error: ' + String(e.message || e).slice(0, 160)));
  await page.addInitScript(() => {
    try {
      localStorage.setItem('hotkey_onboarded', '1');
      localStorage.setItem('hk_tour_done', '1');
      localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_gate_off', '1');
      localStorage.setItem('hk_handle_cache', '');
    } catch (e) {}
  });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() =>
    typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function' &&
    typeof demoKey === 'function' && typeof setDemoSel === 'function', null, { timeout: 15000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* Every route below is expressed as a page-side factory over the live challenge, so it reads
     the seed's own geometry (corner jitter moves every column letter) instead of hard-coding a
     board the next seed will not produce. */
  const ROUTES = {
    /* the taught route — identical in shape to demo() */
    demo: `C => C.demo.call(C)`,

    /* ALT 1 as REGISTERED in dev/e2e-alt-paths.js, byte for byte — chord ROUTE: point mode and
       F4 instead of typed anchors, the ribbon's fill-right, the ribbon percent walk. Registered
       here as well as there because e2e-alt-paths asserts the WIN and nothing else, so the entry
       name's claim about the ☆ would otherwise be an assertion rather than a measurement. */
    alt1: `C => { const o=C._o;
      const up=n=>Array(n).fill({key:'ArrowUp'}), dn=n=>Array(n).fill({key:'ArrowDown'});
      return [
        {sel:o.CB+o.rD, keys:[...T('=-'), ...up(o.rD-o.rC), ...T('*'), ...dn(o.rY-o.rD), {key:'F4'}, Kb.enter]},
        {sel:o.CB+o.rN, keys:[...T(o.fN), Kb.enter]},
        {sel:o.CB+o.rS, keys:[...T('='), ...dn(o.rAS-o.rS), {key:'F4'}, ...T('+'), ...up(o.rS-o.rNS), Kb.enter]},
        {sel:o.CB+o.rE, keys:[...T('='), ...up(o.rE-o.rN), ...T('/'), ...up(o.rE-o.rS), Kb.enter]},
        {sel:o.CB+o.rA, keys:[...T('='), ...up(o.rA-o.rE), ...T('/'), ...dn(o.rSE-o.rA), {key:'F4'}, ...T('-1'), Kb.enter]},
        {sel:o.CB+o.rD+':'+o.CD+o.rA, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:o.CB+o.rA+':'+o.CD+o.rA, keys:[{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),L('0')]},
      ]; }`,

    /* ALT 2 as REGISTERED — op ORDER: shares side first, an addition chain instead of SUM, the
       accretion line dressed BEFORE the block travels (so the clipboard carries the format), and
       the block carried by copy/paste rather than a fill. */
    alt2: `C => { const o=C._o; return [
      {sel:o.CB+o.rS, keys:[...T(o.fS), Kb.enter]},
      {sel:o.CB+o.rD, keys:[...T('=-'+o.CB+o.rC+'*$'+o.CB+'$'+o.rY), Kb.enter,
                            ...T('=$'+o.CB+'$'+o.rAN+'+$'+o.CB+'$'+o.rTN+'+$'+o.CB+'$'+o.rSY+'+'+o.CB+o.rD), Kb.enter]},
      {sel:o.CB+o.rE, keys:[...T(o.fE), Kb.enter, ...T(o.fA), Kb.enter]},
      {sel:o.CB+o.rA, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),L('0')]},
      {sel:o.CB+o.rD+':'+o.CB+o.rA, keys:[Kb.copy]},
      {sel:o.CC+o.rD+':'+o.CD+o.rA, keys:[Kb.paste]},
    ]; }`,

    /* clipboard route to the star: the built column COPIED and pasted onto the other two */
    paste: `C => { const o=C._o; return [
      {sel:o.CB+o.rD, keys:[...T(o.fD), Kb.enter, ...T(o.fN), Kb.enter, ...T(o.fS), Kb.enter,
                            ...T(o.fE), Kb.enter, ...T(o.fA), Kb.enter]},
      {sel:o.CB+o.rD+':'+o.CB+o.rA, keys:[Kb.copy]},
      {sel:o.CC+o.rD+':'+o.CD+o.rA, keys:[Kb.paste]},
      {sel:o.CB+o.rA+':'+o.CD+o.rA, keys:[{key:'1',ctrl:true}, L('p')]},
    ]; }`,

    /* POINT MODE + F4: the references are arrow-grabbed and the locks cycled, never typed.
       §1.0(c) — the anchoring habit anchor/fxconvert teach must reach the same end state. */
    point: `C => { const o=C._o; const up=n=>Array(n).fill({key:'ArrowUp'}); const dn=n=>Array(n).fill({key:'ArrowDown'});
      return [
      {sel:o.CB+o.rD, keys:[...T('=-'), ...up(o.rD-o.rC), ...T('*'), ...dn(o.rY-o.rD), {key:'F4'}, Kb.enter]},
      {sel:o.CB+o.rN, keys:[...T(o.fN), Kb.enter]},
      /* every fresh pointer starts from the EDITED cell (startPointerFromArrow works off
         editAnchor), so each run of arrows is counted from the row being built, never from where
         the previous reference happened to land. */
      {sel:o.CB+o.rS, keys:[...T('='), ...dn(o.rAS-o.rS), {key:'F4'}, ...T('+'), ...up(o.rS-o.rNS), Kb.enter]},
      {sel:o.CB+o.rE, keys:[...T('='), ...up(o.rE-o.rN), ...T('/'), ...up(o.rE-o.rS), Kb.enter]},
      {sel:o.CB+o.rA, keys:[...T('='), ...up(o.rA-o.rE), ...T('/'), ...dn(o.rSE-o.rA), {key:'F4'}, ...T('-1'), Kb.enter]},
      {sel:o.CB+o.rD, keys:[{key:'ArrowDown',ctrl:true,shift:true},{key:'ArrowRight',shift:true},
                            {key:'ArrowRight',shift:true}, Kb.fillR]},
      {sel:o.CB+o.rA+':'+o.CD+o.rA, keys:[{key:'1',ctrl:true}, L('p')]},
    ]; }`,

    /* NEGATIVE CONTROL 1 (☆ must stay DARK): the block filled ROW BY ROW — five fills, every
       core clears. This is the route the star has to beat, and the beginner's natural motion. */
    rowfills: `C => { const o=C._o; return [
      {sel:o.CB+o.rD, keys:[...T(o.fD), Kb.enter, ...T(o.fN), Kb.enter, ...T(o.fS), Kb.enter,
                            ...T(o.fE), Kb.enter, ...T(o.fA), Kb.enter]},
      {sel:o.CB+o.rD, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.fillR]},
      {sel:o.CB+o.rN, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.fillR]},
      {sel:o.CB+o.rS, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.fillR]},
      {sel:o.CB+o.rE, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.fillR]},
      {sel:o.CB+o.rA, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.fillR]},
      {sel:o.CB+o.rA+':'+o.CD+o.rA, keys:[{key:'1',ctrl:true}, L('p')]},
    ]; }`,

    /* ALT 3 as REGISTERED — NEGATIVE CONTROL 2 / the SLOWEST legal route (☆ dark): all fifteen formulas typed cell by
       cell with nothing filled and nothing pasted, and the ribbon percent walk plus a decimal
       step. This is the number the clock exists to show the player. */
    typed: `C => { const o=C._o; const mv=[];
      const F=(C2,r)=>({ [o.rD]:'=-'+C2+o.rC+'*$'+o.CB+'$'+o.rY,
                         [o.rN]:'=$'+o.CB+'$'+o.rAN+'+$'+o.CB+'$'+o.rTN+'+$'+o.CB+'$'+o.rSY+'+'+C2+o.rD,
                         [o.rS]:'=$'+o.CB+'$'+o.rAS+'+'+C2+o.rNS,
                         [o.rE]:'='+C2+o.rN+'/'+C2+o.rS,
                         [o.rA]:'='+C2+o.rE+'/$'+o.CB+'$'+o.rSE+'-1' }[r]);
      o.CS.forEach(C2=>{ [o.rD,o.rN,o.rS,o.rE,o.rA].forEach(r=>{
        mv.push({sel:C2+r, keys:[...T(F(C2,r)), Kb.enter]}); }); });
      o.CS.forEach(C2=>{ mv.push({sel:C2+o.rA, keys:[{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),L('0')]}); });
      return mv; }`,
    /* THE OVER-GRAB. Ctrl+Shift+→ off a filled column with empty neighbours runs to the sheet
       edge — Excel does exactly this — so a player reaching for the block with the chord instead
       of two Shift+→ takes columns the analysis does not own. Walked because a ☆ must never make
       the board WORSE than the route it beats (the r439 ruling). Result: 25 junk cells across the
       empty columns and a page nobody could send, so the ☆ matches the block rect EXACTLY and an
       over-grab FORFEITS the star — the cores still clear (§1.0(c) is untouched), and the junk on
       screen next to a dark star is what tells the player the grab was wrong. */
    overgrab: `C => { const o=C._o; return [
      {sel:o.CB+o.rD, keys:[...T(o.fD), Kb.enter, ...T(o.fN), Kb.enter, ...T(o.fS), Kb.enter,
                            ...T(o.fE), Kb.enter, ...T(o.fA), Kb.enter]},
      {sel:o.CB+o.rD, keys:[{key:'ArrowDown',ctrl:true,shift:true},{key:'ArrowRight',ctrl:true,shift:true}, Kb.fillR]},
      {sel:o.CB+o.rA+':'+o.CD+o.rA, keys:[{key:'1',ctrl:true}, L('p')]},
    ]; }`,
  };
  const STAR_EXPECTED = { demo: true, alt1: true, alt2: true, paste: true, point: true,
                          rowfills: false, typed: false, overgrab: false };

  const walk = async (name, factorySrc) => {
    const out = [];
    for (let i = 0; i < REPS; i++) {
      const r = await page.evaluate(([src, key]) => {
        document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
        loadChallenge('accdil');
        const C = CHALLENGES['accdil'];
        const moves = eval('(' + src + ')')(C);
        for (const mv of moves) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
        const items = C.checks.call(C, S);
        const core = items.filter(x => !x.bonus && !x.save);
        const star = items.find(x => x.bonus);
        return { keys: keyLog.length, cores: core.map(x => !!x.ok), star: !!(star && star.ok),
                 labels: core.map(x => x.label) };
      }, [factorySrc, name]);
      out.push(r);
    }
    return out;
  };

  console.log('\n== A · ROUTE ENUMERATION (§1.0-R3(p)) — every route walked, ' + REPS + ' seeds each ==');
  const keyMed = {};
  for (const name of Object.keys(ROUTES)) {
    const rs = await walk(name, ROUTES[name]);
    const allCores = rs.every(r => r.cores.every(Boolean));
    const stars = rs.map(r => r.star);
    const ks = rs.map(r => r.keys).sort((a, b) => a - b);
    keyMed[name] = ks[Math.floor(ks.length / 2)];
    const starConsistent = stars.every(s => s === STAR_EXPECTED[name]);
    const dead = rs[0].cores.map((v, i) => v ? null : i + 1).filter(v => v);
    if (allCores) ok(name.padEnd(9) + ' all 6 cores clear on every seed · keys ' + JSON.stringify(ks));
    else bad(name.padEnd(9) + ' UNTRIGGERABLE BEAT(S) ' + JSON.stringify(dead) + ' — ' +
             dead.map(i => rs[0].labels[i - 1]).join(' | '));
    if (starConsistent) ok(name.padEnd(9) + ' ☆ ' + (STAR_EXPECTED[name] ? 'earned' : 'DARK') + ' on every seed, as designed');
    else bad(name.padEnd(9) + ' ☆ inconsistent: ' + JSON.stringify(stars) + ' (expected ' + STAR_EXPECTED[name] + ')');
  }

  /* what the over-grab actually spills, printed rather than assumed */
  const spill = await page.evaluate(([src]) => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
    loadChallenge('accdil');
    const C = CHALLENGES['accdil'], o = C._o;
    for (const mv of eval('(' + src + ')')(C)) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
    const out = [];
    for (let c = o.c0 + 4; c <= 10; c++) for (let r = o.rD; r <= o.rA; r++) {
      const cell = S.cells[colLetter(c) + r];
      if (cell && (cell.value !== null || cell.formula)) out.push(colLetter(c) + r + '=' + cell.value);
    }
    return { cells: out.length, sample: out.slice(0, 4), undoable: typeof undoStack !== 'undefined' };
  }, [ROUTES.overgrab]);
  console.log('  over-grab spill: ' + spill.cells + ' cells past the block ' + JSON.stringify(spill.sample) +
              ' — visible, and one Ctrl+Z from gone');

  console.log('\n== B · ☆-HEADROOM DIAGNOSTIC (CAMPAIGN §2) ==');
  const fastest = keyMed.demo, slowest = keyMed.typed;
  const spread = slowest / fastest;
  console.log('  PART 1 · spread: fastest legal ' + fastest + ' keys · slowest legal ' + slowest +
              ' keys · ' + spread.toFixed(2) + '×');
  if (spread >= 1.3) ok('spread clears the 1.3× warning line');
  else bad('spread ' + spread.toFixed(2) + '× is under the 1.3× warning line — read the composition before shipping');
  /* PART 2 — isolate the star's OWN move against its own slow alternative (the r438 rule: a
     combined number hides a negative half). The star is a single move, so there is one half. */
  const blockGrab = await page.evaluate(() => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
    loadChallenge('accdil');
    const C = CHALLENGES['accdil'], o = C._o;
    const build = [{sel:o.CB+o.rD, keys:[...T(o.fD), Kb.enter, ...T(o.fN), Kb.enter, ...T(o.fS), Kb.enter,
                                         ...T(o.fE), Kb.enter, ...T(o.fA), Kb.enter]}];
    for (const mv of build) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
    const base = keyLog.length;
    const star = [{sel:o.CB+o.rD, keys:[{key:'ArrowDown',ctrl:true,shift:true},{key:'ArrowRight',shift:true},
                                        {key:'ArrowRight',shift:true},{key:'r',ctrl:true}]}];
    for (const mv of star) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
    return { base, star: keyLog.length - base };
  });
  const rowGrab = await page.evaluate(() => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
    loadChallenge('accdil');
    const C = CHALLENGES['accdil'], o = C._o;
    const build = [{sel:o.CB+o.rD, keys:[...T(o.fD), Kb.enter, ...T(o.fN), Kb.enter, ...T(o.fS), Kb.enter,
                                         ...T(o.fE), Kb.enter, ...T(o.fA), Kb.enter]}];
    for (const mv of build) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
    const base = keyLog.length;
    [o.rD,o.rN,o.rS,o.rE,o.rA].forEach(r => {
      setDemoSel(o.CB+r);
      [{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'r',ctrl:true}].forEach(demoKey);
    });
    return { base, rows: keyLog.length - base };
  });
  console.log('  PART 2 · the star’s own move: block grab + one fill = ' + blockGrab.star +
              ' keys · the same work row by row = ' + rowGrab.rows + ' keys · typed out = ' +
              (slowest - fastest + blockGrab.star) + ' keys');
  if (blockGrab.star < rowGrab.rows) ok('the star route is CHEAPER than the route it exists to beat — no route inversion');
  else bad('the star route costs ' + blockGrab.star + ' against ' + rowGrab.rows + ' — the route inversion that retires a drill; fix the BOARD');

  console.log('\n== C · SKIPPABILITY (§1.0-R2(i)) — measured, not asserted ==');
  console.log('  row-by-row fills : ' + keyMed.rowfills + ' keys, all 6 cores clear, ☆ dark');
  console.log('  fifteen typed    : ' + keyMed.typed + ' keys, all 6 cores clear, ☆ dark');
  ok('two named routes clear every core beat without the star');

  console.log('\n== D · BOARD INVARIANTS ==');
  const board = await page.evaluate(() => {
    const res = [];
    for (let i = 0; i < 5; i++) {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge('accdil');
      const C = CHALLENGES['accdil'], o = C._o;
      const rowsUsed = new Set();
      for (const k in S.cells) {
        const c = S.cells[k];
        if (c && (c.value !== null || c.formula)) rowsUsed.add(parseInt(k.match(/\d+/)[0], 10));
      }
      const loadRows = new Set(rowsUsed);
      [o.rD,o.rN,o.rS,o.rE,o.rA].forEach(r => rowsUsed.add(r));   // scripted purpose (§1.3)
      const cel = k => S.cells[k] || {};
      const helpers = [o.rAN,o.rTN,o.rSY,o.rAS,o.rY].map(r => cel(o.CB+r));
      const items = C.checks.call(C, S);
      // a fresh board: every core beat must be DARK, or the drill grades something it seeded
      const freshDark = items.filter(x => !x.bonus && !x.save).every(x => !x.ok);
      res.push({
        rows: S.ROWS, load: loadRows.size, win: rowsUsed.size, freshDark,
        helpersYellow: helpers.every(h => h.fill === 'yellow' && h.ball && h.fontColor === 'blue' && h.value !== null),
        helperLabels: [o.rAN,o.rTN,o.rSY,o.rAS,o.rY].every(r => typeof cel(o.CA+r).value === 'string' && cel(o.CA+r).value.length > 3),
        inputsBlue: o.CS.every(Cx => cel(Cx+o.rC).fontColor === 'blue' && cel(Cx+o.rNS).fontColor === 'blue'),
        derivedBlack: cel(o.CB+o.rSE).fontColor == null && !!cel(o.CB+o.rSE).formula,
        topBorders: o.CS.every(Cx => cel(Cx+o.rN).bt && cel(Cx+o.rS).bt && cel(Cx+o.rA).bt),
        noBottomRule: o.CS.every(Cx => !cel(Cx+o.rN).bb && !cel(Cx+o.rS).bb && !cel(Cx+o.rA).bb),
        accUnformatted: o.CS.every(Cx => cel(Cx+o.rA).fmtStyle !== 'percent'),
        hdrRule: o.CS.every(Cx => cel(Cx+4).bb),
        /* a cell the build never seeded is absent from S.cells entirely, so `cel()` hands back {}
           and every field reads `undefined` — compare loosely or the guard reports a moat that is
           there (probe discipline, CAMPAIGN: suspect the probe first). */
        moat: [o.CA, o.CB, o.CC, o.CD].every(Cx => cel(Cx + '12').value == null && !cel(Cx + '12').formula),
      });
    }
    return res;
  });
  const b0 = board[0];
  if (board.every(b => b.rows === 20)) ok('ROWS=20 on every seed (§1.3, Wolf r440 — floor AND cap)');
  else bad('ROWS is not 20: ' + JSON.stringify(board.map(b => b.rows)));
  const dens = Math.round(100 * b0.win / 20);
  if (dens >= 60) ok('§1.3 density ' + b0.win + '/20 = ' + dens + '% at the win state (load ' + b0.load + '/20)');
  else bad('§1.3 density ' + dens + '% is under the 60% target');
  if (board.every(b => b.freshDark)) ok('every core beat is DARK on a fresh board (nothing graded is seeded)');
  else bad('a core beat grades true at load — the board seeds part of its own answer');
  const inv = [
    ['helper stack is yellow + all borders + blue ink + populated (§1.0(f)/(l))', b => b.helpersYellow],
    ['every assumption cell carries its own board label (§1.0-R2(l), §1.3 labelled targets)', b => b.helperLabels],
    ['structuring inputs are BLUE (MODELING_STANDARDS §1 colour-as-provenance)', b => b.inputsBlue],
    ['the derived standalone EPS is a BLACK live formula, never a typed number', b => b.derivedBlack],
    ['the two pro forma subtotals and the headline wear TOP borders (§1.0(f))', b => b.topBorders],
    ['no bottom rule under any total (§1.0(f) — a total earns the line above)', b => b.noBottomRule],
    ['the accretion line ships UNformatted, so beat 6 is real work', b => b.accUnformatted],
    ['a bottom border rules the structure headers (doctrine §2.1b)', b => b.hdrRule],
    ['row 12 is a clean moat, so the block grab cannot ride into the assumptions', b => b.moat],
  ];
  for (const [msg, f] of inv) (board.every(f) ? ok : bad)(msg);

  console.log('\naccdil probe: ' + (fail ? fail + ' FAILURE(S)' : 'ALL GREEN'));
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
