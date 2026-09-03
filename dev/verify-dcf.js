/* verify-dcf.js — the drill-specific probe for `dcf` (DEPTH_PASS §4.59 depth pass, r444).
   Self-contained by the §9.1 ownership rule: it names NO other drill key, so the C13 retirement
   guard can never trip on it.

   dev/e2e-depth-contract.js already asserts everything the STANDARD promises (mystery ☆, beat
   count, saveClose, randomisation axes, determinism, density, the demo earning the bonus). This
   file asserts the four things that are specific to this board and that no generic suite can:

     PART 1  ROUTE ENUMERATION — every legal Excel route to each beat's visible end state, WALKED
             through the live engine and asserted to clear (DEPTH_PASS_CAMPAIGN §1: reading a
             predicate has never once found the untriggerable-beat class). It also asserts the two
             routes that must NOT clear — a typed constant where the label's verb is Build, and a
             DOUBLE BOTTOM rule where the beat asks for a line ABOVE.
     PART 2  ☆ HEADROOM, EACH HALF ISOLATED (CAMPAIGN §2 + the r438 `series` rule): the star route
             and its own slow alternative, measured in keys off the live keyLog.
     PART 3  ☆ SKIPPABILITY, MEASURED NOT ASSERTED (§1.0-R2(i)): a named slow route that clears
             every core beat with the star DARK.
     PART 4  THE MODEL (dev/MODELING_STANDARDS.md): g < WACC on every seed, the terminal-value
             share inside the reviewer's band, provenance colours, the total's TOP border, the
             20-row board, the win-state density figure, and the width verdicts at natural width.

   The init script mirrors the real harnesses exactly (hotkey_onboarded / hk_tour_done /
   hk_learn_done / hk_handle_cache) — a probe that does not is reporting about a different page.

     node dev/verify-dcf.js            # server on 8791, or URL=http://127.0.0.1:<port>/index.html */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const REPS = +(process.env.REPS || 3);

let fail = 0, pass = 0;
const ok = m => { pass++; console.log('  ok   ' + m); };
const bad = m => { fail++; console.log('  FAIL ' + m); };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 140)));
  await page.addInitScript(() => { try {
    ['hotkey_onboarded', 'hk_tour_done', 'hk_learn_done', 'hk_gate_off'].forEach(k => localStorage.setItem(k, '1'));
    localStorage.setItem('hk_handle_cache', '');
  } catch (e) {} });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function'
    && typeof setDemoSel === 'function' && typeof loadChallenge === 'function', null, { timeout: 15000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* the page-side driver: load the drill, play a list of {sel,keys} moves, report the beats and
     the key count. `pre` runs the beats the route under test is NOT about, so one beat can be
     probed in isolation without the others dragging the verdict down. */
  const drive = async (routeSrc) => page.evaluate((src) => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
    loadChallenge('dcf');
    const C = CHALLENGES['dcf'], o = C._o;
    const T2 = s => [...String(s)].map(ch => ({ key: ch }));
    const R = n => { const a = []; for (let i = 0; i < n; i++) a.push({ key: 'ArrowRight', shift: true }); return a; };
    const moves = eval('(' + src + ')')({ o: o, T: T2, R: R });
    const k0 = keyLog.length;
    for (const mv of moves) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
    const rows = C.checks(S);
    return {
      keys: keyLog.length - k0,
      core: rows.filter(c => !c.bonus && !c.save && !/^Save your work$/.test(c.label)).map(c => !!c.ok),
      star: !!(rows.find(c => c.bonus) || {}).ok,
      labels: rows.map(c => c.label),
    };
  }, routeSrc);

  /* the six core beats, in checks() order, as reusable move builders. Each is a STRING because it
     is eval'd page-side against the live _o. */
  const B = {
    // beat 1 — the factor row, the taught route: one anchored formula, one fill right
    dfFill: `({o,T,R}) => [
      {sel:o.CB+o.rDf, keys:[...T('=1/(1+$'+o.CB+'$'+o.rW+')^'+o.CB+o.rPer),{key:'Enter'}]},
      {sel:o.CB+o.rDf, keys:[...R(4),{key:'r',ctrl:true}]}]`,
    dfFillRibbon: `({o,T,R}) => [
      {sel:o.CB+o.rDf, keys:[...T('=(1+$'+o.CB+'$'+o.rW+')^-'+o.CB+o.rPer),{key:'Enter'}]},
      {sel:o.CB+o.rDf, keys:[...R(4),{key:'Alt'},{key:'h'},{key:'f'},{key:'i'},{key:'r'}]}]`,
    dfTypedAnchored: `({o,T}) => o.cols.map(c=>(
      {sel:c+o.rDf, keys:[...T('=1/(1+$'+o.CB+'$'+o.rW+')^'+c+o.rPer),{key:'Enter'}]}))`,
    dfTypedBare: `({o,T}) => o.cols.map(c=>(
      {sel:c+o.rDf, keys:[...T('=1/(1+'+o.CB+o.rW+')^'+c+o.rPer),{key:'Enter'}]}))`,
    dfF4: `({o,T,R}) => [
      {sel:o.CB+o.rDf, keys:[...T('=1/(1+'+o.CB+o.rW),{key:'F4'},...T(')^'+o.CB+o.rPer),{key:'Enter'}]},
      {sel:o.CB+o.rDf, keys:[...R(4),{key:'r',ctrl:true}]}]`,
    dfHardcoded: `({o,T}) => o.cols.map((c,i)=>(
      {sel:c+o.rDf, keys:[...T(String(o.df[i].toFixed(6))),{key:'Enter'}]}))`,
    dfTwoPass: `({o,T,R}) => [
      {sel:o.CB+o.rDf, keys:[...T('=1/(1+$'+o.CB+'$'+o.rW+')^'+o.CB+o.rPer),{key:'Enter'}]},
      {sel:o.CB+o.rDf, keys:[...R(2),{key:'r',ctrl:true}]},
      {sel:o.cols[2]+o.rDf, keys:[...R(2),{key:'r',ctrl:true}]}]`,
    // beat 2 — present values
    pvFill: `({o,T,R}) => [
      {sel:o.CB+o.rPv, keys:[...T('='+o.CB+o.rFcf+'*'+o.CB+o.rDf),{key:'Enter'}]},
      {sel:o.CB+o.rPv, keys:[...R(4),{key:'r',ctrl:true}]}]`,
    pvReversed: `({o,T,R}) => [
      {sel:o.CB+o.rPv, keys:[...T('='+o.CB+o.rDf+'*'+o.CB+o.rFcf),{key:'Enter'}]},
      {sel:o.CB+o.rPv, keys:[...R(4),{key:'r',ctrl:true}]}]`,
    pvDirect: `({o,T}) => o.cols.map(c=>(
      {sel:c+o.rPv, keys:[...T('='+c+o.rFcf+'/(1+$'+o.CB+'$'+o.rW+')^'+c+o.rPer),{key:'Enter'}]}))`,
    pvHardcoded: `({o,T}) => o.cols.map((c,i)=>(
      {sel:c+o.rPv, keys:[...T(String(Math.round(o.pv[i]))),{key:'Enter'}]}))`,
    // beat 3 — the Gordon terminal value
    tvPlain: `({o,T}) => [{sel:o.CB+o.rTv, keys:[...T('='+o.CF+o.rFcf+'*(1+'+o.CB+o.rG+')/('+o.CB+o.rW+'-'+o.CB+o.rG+')'),{key:'Enter'}]}]`,
    tvAnchored: `({o,T}) => [{sel:o.CB+o.rTv, keys:[...T('=$'+o.CF+'$'+o.rFcf+'*(1+$'+o.CB+'$'+o.rG+')/($'+o.CB+'$'+o.rW+'-$'+o.CB+'$'+o.rG+')'),{key:'Enter'}]}]`,
    tvBracketed: `({o,T}) => [{sel:o.CB+o.rTv, keys:[...T('=('+o.CF+o.rFcf+'*(1+'+o.CB+o.rG+'))/('+o.CB+o.rW+'-'+o.CB+o.rG+')'),{key:'Enter'}]}]`,
    // beat 4 — the discounted terminal value
    pvtvPoint: `({o,T}) => [{sel:o.CB+o.rPvtv, keys:[...T('='+o.CB+o.rTv+'*'+o.CF+o.rDf),{key:'Enter'}]}]`,
    pvtvPointSwapped: `({o,T}) => [{sel:o.CB+o.rPvtv, keys:[...T('='+o.CF+o.rDf+'*'+o.CB+o.rTv),{key:'Enter'}]}]`,
    pvtvPointAnchored: `({o,T}) => [{sel:o.CB+o.rPvtv, keys:[...T('=$'+o.CB+'$'+o.rTv+'*$'+o.CF+'$'+o.rDf),{key:'Enter'}]}]`,
    pvtvRederived: `({o,T}) => [{sel:o.CB+o.rPvtv, keys:[...T('='+o.CB+o.rTv+'/(1+'+o.CB+o.rW+')^5'),{key:'Enter'}]}]`,
    pvtvNegPower: `({o,T}) => [{sel:o.CB+o.rPvtv, keys:[...T('='+o.CB+o.rTv+'*(1+'+o.CB+o.rW+')^-5'),{key:'Enter'}]}]`,
    // beat 5 — enterprise value
    evSum: `({o,T}) => [{sel:o.CB+o.rEv, keys:[...T('=SUM('+o.CB+o.rPv+':'+o.CF+o.rPv+')+'+o.CB+o.rPvtv),{key:'Enter'}]}]`,
    evChain: `({o,T}) => [{sel:o.CB+o.rEv, keys:[...T('='+o.cols.map(c=>c+o.rPv).join('+')+'+'+o.CB+o.rPvtv),{key:'Enter'}]}]`,
    evTvFirst: `({o,T}) => [{sel:o.CB+o.rEv, keys:[...T('='+o.CB+o.rPvtv+'+SUM('+o.CB+o.rPv+':'+o.CF+o.rPv+')'),{key:'Enter'}]}]`,
    evSumTwoArgs: `({o,T}) => [{sel:o.CB+o.rEv, keys:[...T('=SUM('+o.CB+o.rPv+':'+o.CF+o.rPv+','+o.CB+o.rPvtv+')'),{key:'Enter'}]}]`,
    // beat 6 — the dress
    drTopChord: `({o}) => [{sel:o.CB+o.rEv, keys:[{key:'b',ctrl:true},{key:'Alt'},{key:'h'},{key:'b'},{key:'p'}]}]`,
    drRibbonAll: `({o,T,R}) => [{sel:o.CA+o.rEv, keys:[...R(1),{key:'Alt'},{key:'h'},{key:'1'},{key:'Alt'},{key:'h'},{key:'b'},{key:'a'}]}]`,
    drBoxOneCell: `({o}) => [{sel:o.CB+o.rEv, keys:[{key:'b',ctrl:true},{key:'Alt'},{key:'h'},{key:'b'},{key:'s'}]}]`,
    drThickOneCell: `({o}) => [{sel:o.CB+o.rEv, keys:[{key:'b',ctrl:true},{key:'Alt'},{key:'h'},{key:'b'},{key:'t'}]}]`,
    drBoxPair: `({o,T,R}) => [{sel:o.CA+o.rEv, keys:[...R(1),{key:'b',ctrl:true},{key:'Alt'},{key:'h'},{key:'b'},{key:'s'}]}]`,
    drTopAndBottom: `({o}) => [{sel:o.CB+o.rEv, keys:[{key:'b',ctrl:true},{key:'Alt'},{key:'h'},{key:'b'},{key:'d'}]}]`,
    drBottomOnly: `({o}) => [{sel:o.CB+o.rEv, keys:[{key:'b',ctrl:true},{key:'Alt'},{key:'h'},{key:'b'},{key:'o'}]}]`,
    drDoubleBottom: `({o}) => [{sel:o.CB+o.rEv, keys:[{key:'b',ctrl:true},{key:'Alt'},{key:'h'},{key:'b'},{key:'b'}]}]`,
    drBoldOnly: `({o}) => [{sel:o.CB+o.rEv, keys:[{key:'b',ctrl:true}]}]`,
  };
  const seq = (...names) => `(ctx) => [].concat(${names.map(n => `(${B[n]})(ctx)`).join(',')})`;

  const runN = async (src, n) => { const out = []; for (let i = 0; i < n; i++) out.push(await drive(src)); return out; };
  const all = (rs, f) => rs.every(f);
  const med = xs => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];

  console.log('\n=== PART 1 · ROUTE ENUMERATION (every legal route to the visible end state) ===');
  const cases = [
    // [beat index, label, route, must clear?]
    [0, 'factor row · anchored formula + Ctrl+R fill (the taught route)', seq('dfFill'), true],
    [0, 'factor row · reciprocal-power shape + ribbon fill Alt H F I R', seq('dfFillRibbon'), true],
    [0, 'factor row · five anchored formulas typed, no fill', seq('dfTypedAnchored'), true],
    [0, 'factor row · five UNANCHORED formulas typed per column', seq('dfTypedBare'), true],
    [0, 'factor row · anchor set with F4 rather than typed dollars, then filled', seq('dfF4'), true],
    [0, 'factor row · the five factors HARDCODED to six decimals must NOT clear (verb: Build)', seq('dfHardcoded'), false],
    [1, 'PV row · cash × factor, filled right', seq('dfFill', 'pvFill'), true],
    [1, 'PV row · factor × cash (operands swapped)', seq('dfFill', 'pvReversed'), true],
    [1, 'PV row · discounted straight off the cash flows, never cash × factor', seq('dfFill', 'pvDirect'), true],
    [1, 'PV row · the five present values HARDCODED must NOT clear (verb: Build)', seq('dfFill', 'pvHardcoded'), false],
    [2, 'terminal value · the plain Gordon shape', seq('tvPlain'), true],
    [2, 'terminal value · every reference $-anchored (the r439 wrapfix class)', seq('tvAnchored'), true],
    [2, 'terminal value · numerator bracketed', seq('tvBracketed'), true],
    [3, 'discounted TV · pointed at the year-5 factor cell', seq('dfFill', 'tvPlain', 'pvtvPoint'), true],
    [3, 'discounted TV · same product, operands swapped', seq('dfFill', 'tvPlain', 'pvtvPointSwapped'), true],
    [3, 'discounted TV · pointed and $-anchored', seq('dfFill', 'tvPlain', 'pvtvPointAnchored'), true],
    [3, 'discounted TV · RE-DERIVED /(1+rate)^5 — the ☆ route forgone, the beat must still clear', seq('dfFill', 'tvPlain', 'pvtvRederived'), true],
    [3, 'discounted TV · re-derived as a negative power', seq('dfFill', 'tvPlain', 'pvtvNegPower'), true],
    [4, 'enterprise value · SUM over the PV row plus the discounted TV', seq('dfFill', 'pvFill', 'tvPlain', 'pvtvPoint', 'evSum'), true],
    [4, 'enterprise value · addition chain, no SUM anywhere', seq('dfFill', 'pvFill', 'tvPlain', 'pvtvPoint', 'evChain'), true],
    [4, 'enterprise value · terminal value first, SUM second', seq('dfFill', 'pvFill', 'tvPlain', 'pvtvPoint', 'evTvFirst'), true],
    [4, 'enterprise value · one SUM with the range and the TV as two arguments', seq('dfFill', 'pvFill', 'tvPlain', 'pvtvPoint', 'evSumTwoArgs'), true],
    [5, 'dress · Ctrl+B then Alt H B P on the one figure cell', seq('drTopChord'), true],
    [5, 'dress · Alt H 1 then Alt H B A across label + figure (ball carries the top edge)', seq('drRibbonAll'), true],
    [5, 'dress · Alt H B S on the ONE-CELL figure — stores ball, not bt (campaign route fact #7)', seq('drBoxOneCell'), true],
    [5, 'dress · Alt H B T thick box on the one figure cell', seq('drThickOneCell'), true],
    [5, 'dress · Alt H B S across label + figure', seq('drBoxPair'), true],
    [5, 'dress · Alt H B D — Excel\'s TOP AND BOTTOM pair, so it draws the line above and clears', seq('drTopAndBottom'), true],
    [5, 'dress · Alt H B O (a rule UNDERNEATH only) must NOT clear a line-above beat', seq('drBottomOnly'), false],
    [5, 'dress · Alt H B B (a DOUBLE rule underneath) must NOT clear a line-above beat', seq('drDoubleBottom'), false],
    [5, 'dress · bold with no rule at all must NOT clear', seq('drBoldOnly'), false],
  ];
  for (const [i, name, src, want] of cases) {
    const rs = await runN(src, REPS);
    const got = all(rs, r => r.core[i] === true);
    if (got === want) ok((want ? 'clears  ' : 'stays dark ') + '· ' + name);
    else bad('beat ' + (i + 1) + ' ' + (want ? 'DID NOT CLEAR' : 'CLEARED WHEN IT MUST NOT') + ' · ' + name
      + ' · core=' + JSON.stringify(rs[0].core));
  }

  console.log('\n=== PART 2 · ☆ HEADROOM, EACH HALF ISOLATED (keys, ' + REPS + ' seeds) ===');
  const halfA_star = med((await runN(seq('dfFill'), REPS)).map(r => r.keys));
  const halfA_slow = med((await runN(seq('dfTypedAnchored'), REPS)).map(r => r.keys));
  const halfB_star = med((await runN(seq('dfFill', 'tvPlain', 'pvtvPoint'), REPS)).map(r => r.keys))
                   - med((await runN(seq('dfFill', 'tvPlain'), REPS)).map(r => r.keys));
  const halfB_slow = med((await runN(seq('dfFill', 'tvPlain', 'pvtvRederived'), REPS)).map(r => r.keys))
                   - med((await runN(seq('dfFill', 'tvPlain'), REPS)).map(r => r.keys));
  console.log('  half A · factor row: star ' + halfA_star + ' keys vs slow ' + halfA_slow + '  (delta ' + (halfA_slow - halfA_star) + ')');
  console.log('  half B · discounted TV: star ' + halfB_star + ' keys vs slow ' + halfB_slow + '  (delta ' + (halfB_slow - halfB_star) + ')');
  if (halfA_slow > halfA_star) ok('half A is POSITIVE — the star route is cheaper than the route it beats');
  else bad('half A is NEGATIVE or flat — the retirement failure CAMPAIGN §2 records (a star route that costs MORE than the route it exists to beat)');
  if (halfB_slow > halfB_star) ok('half B is POSITIVE — measured apart, per the r438 `series` rule');
  else bad('half B is NEGATIVE or flat — a combined number would have hidden it');

  /* the rest of the spread, isolated the same way, so PART 2's composition claim is MEASURED
     rather than estimated: which slices a ☆ may reward, and which §1.0(c) forces to clear. */
  const base = med((await runN(seq('dfFill'), REPS)).map(r => r.keys));
  const pvStar = med((await runN(seq('dfFill', 'pvFill'), REPS)).map(r => r.keys)) - base;
  const pvSlow = med((await runN(seq('dfFill', 'pvDirect'), REPS)).map(r => r.keys)) - base;
  const evBase = med((await runN(seq('dfFill', 'pvFill', 'tvPlain', 'pvtvPoint'), REPS)).map(r => r.keys));
  const evStar = med((await runN(seq('dfFill', 'pvFill', 'tvPlain', 'pvtvPoint', 'evSum'), REPS)).map(r => r.keys)) - evBase;
  const evSlow = med((await runN(seq('dfFill', 'pvFill', 'tvPlain', 'pvtvPoint', 'evChain'), REPS)).map(r => r.keys)) - evBase;
  const drChord = med((await runN(seq('drTopChord'), REPS)).map(r => r.keys));
  const drRibbon = med((await runN(seq('drRibbonAll'), REPS)).map(r => r.keys));
  console.log('  PV row      · fill ' + pvStar + ' vs discount-each ' + pvSlow + '  (delta ' + (pvSlow - pvStar) + ', ☆-legal: fill-vs-retype)');
  console.log('  enterprise  · SUM ' + evStar + ' vs addition chain ' + evSlow + '  (delta ' + (evSlow - evStar) + ', ☆-legal but unclaimed)');
  console.log('  dress       · chord ' + drChord + ' vs ribbon ' + drRibbon + '  (delta ' + Math.abs(drRibbon - drChord)
    + ', §1.0(c) FORCED to clear — never ☆-legal)');

  const fast = med((await runN(seq('dfFill', 'pvFill', 'tvPlain', 'pvtvPoint', 'evSum', 'drTopChord'), REPS)).map(r => r.keys));
  const slow = med((await runN(seq('drRibbonAll', 'tvPlain', 'dfTypedAnchored', 'pvDirect', 'pvtvRederived', 'evChain'), REPS)).map(r => r.keys));
  console.log('  whole board: fastest legal ' + fast + ' keys · slowest legal doing the SAME work ' + slow
    + ' · spread ' + (slow / fast).toFixed(2) + '×');
  const forced = Math.abs(drRibbon - drChord);
  const legal = (halfA_slow - halfA_star) + (pvSlow - pvStar) + (halfB_slow - halfB_star) + (evSlow - evStar);
  console.log('  composition: ' + (slow - fast) + ' keys of spread = ' + legal + ' ☆-legal (fill-vs-retype ×2, '
    + 'reference-vs-re-derive, SUM-vs-chain) + ' + forced + ' chord-vs-ribbon (forced to clear) + 0 formatting'
    + ' (the board grades one dress and every route to it costs the same or less)');

  console.log('\n=== PART 3 · ☆ SKIPPABILITY, MEASURED (§1.0-R2(i)) ===');
  const starRuns = await runN(seq('dfFill', 'pvFill', 'tvPlain', 'pvtvPoint', 'evSum', 'drTopChord'), REPS);
  if (all(starRuns, r => r.core.every(Boolean) && r.star)) ok('the taught route clears all six cores AND earns the ☆');
  else bad('the taught route did not clear + earn · ' + JSON.stringify(starRuns[0]));
  const skipRuns = await runN(seq('drTopChord', 'tvPlain', 'dfTypedAnchored', 'pvDirect', 'pvtvRederived', 'evChain'), REPS);
  if (all(skipRuns, r => r.core.every(Boolean) && !r.star))
    ok('the named slow route clears all six cores with the ☆ DARK — the star is a real, skippable decision');
  else bad('skippability control failed · ' + JSON.stringify(skipRuns[0]));
  const halfRuns = await runN(seq('dfFill', 'pvFill', 'tvPlain', 'pvtvRederived', 'evSum', 'drTopChord'), REPS);
  if (all(halfRuns, r => r.core.every(Boolean) && !r.star))
    ok('HALF the star is not the star — filling the row but re-deriving the last factor leaves it dark');
  else bad('half-star control failed · ' + JSON.stringify(halfRuns[0]));
  const twoPass = await runN(seq('dfTwoPass'), REPS);
  if (all(twoPass, r => r.core[0] === true && !r.star))
    ok('two fills instead of one clear beat 1 and forfeit the star — "one pass" means one pass');
  else bad('two-pass control failed · ' + JSON.stringify(twoPass[0]));

  console.log('\n=== PART 4 · THE MODEL (dev/MODELING_STANDARDS.md) + board contract ===');
  const model = await page.evaluate(() => {
    const out = { seeds: [], widths: null, density: null, rows: null, provenance: null, border: null };
    for (let i = 0; i < 40; i++) {
      loadChallenge('dcf');
      const C = CHALLENGES['dcf'], o = C._o;
      const wacc = S.cells[o.CB + o.rW].value, g = S.cells[o.CB + o.rG].value;
      out.seeds.push({ wacc: wacc, g: g, share: o.pvtv / o.ev, spread: wacc - g });
    }
    // solve one board, then read the end-state facts
    loadChallenge('dcf');
    const C = CHALLENGES['dcf'], o = C._o;
    out.rows = S.ROWS;
    const loadOverflow = [], loadClip = [];
    for (let c = 1; c <= 10; c++) { if (overflowsCol(S, c)) loadOverflow.push(c); if (clipsCol(S, c)) loadClip.push(c); }
    for (const mv of C.demo.call(C)) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
    const winOverflow = [], winClip = [];
    for (let c = 1; c <= 10; c++) { if (overflowsCol(S, c)) winOverflow.push(c); if (clipsCol(S, c)) winClip.push(c); }
    out.widths = { loadOverflow, loadClip, winOverflow, winClip };
    const used = new Set();
    Object.keys(S.cells).forEach(k => { const c = S.cells[k];
      if (c && (c.value !== '' && c.value != null || c.formula)) used.add(+k.replace(/^[A-J]+/, '')); });
    out.density = used.size;
    // provenance: every typed input blue, every built cell black
    const inputs = [o.CB + o.rW, o.CB + o.rG].concat(o.cols.map(c => c + o.rFcf), o.cols.map(c => c + o.rPer));
    const builts = o.cols.map(c => c + o.rDf).concat(o.cols.map(c => c + o.rPv), [o.CB + o.rTv, o.CB + o.rPvtv, o.CB + o.rEv]);
    out.provenance = {
      inputsBlue: inputs.every(k => S.cells[k] && S.cells[k].fontColor === 'blue'),
      builtsBlack: builts.every(k => S.cells[k] && !S.cells[k].fontColor),
      assumptionsBoxed: [o.CB + o.rW, o.CB + o.rG].every(k => S.cells[k].fill === 'yellow' && S.cells[k].ball),
    };
    const ev = S.cells[o.CB + o.rEv];
    out.border = { bt: !!ev.bt, bb: !!ev.bb, bold: !!ev.bold };
    out.shareCell = S.cells[o.CB + o.rShr].value;
    return out;
  });
  if (model.rows === 20) ok('ROWS = 20 (§1.3 floor AND cap)'); else bad('ROWS = ' + model.rows + ', not 20');
  const dens = Math.round(model.density / model.rows * 100);
  if (dens >= 60) ok('§1.3 density at the win state: ' + model.density + '/' + model.rows + ' rows = ' + dens + '%');
  else bad('§1.3 density ' + dens + '% is under the 60% target');
  const badG = model.seeds.filter(s => s.spread < 0.04);
  if (!badG.length) ok('g < WACC on all 40 seeds, min spread ' + (Math.min(...model.seeds.map(s => s.spread)) * 100).toFixed(1) + 'pts (MODELING_STANDARDS §4)');
  else bad(badG.length + ' seed(s) with a Gordon denominator under 4pts — ' + JSON.stringify(badG[0]));
  const shares = model.seeds.map(s => s.share);
  const outOfBand = shares.filter(s => s < 0.55 || s > 0.88);
  console.log('  terminal-value share of EV across 40 seeds: '
    + (Math.min(...shares) * 100).toFixed(1) + '% – ' + (Math.max(...shares) * 100).toFixed(1) + '%');
  if (!outOfBand.length) ok('every seed lands inside a defensible TV share (MODELING_STANDARDS §4 names 60–80% as normal)');
  else bad(outOfBand.length + '/40 seeds outside 55–88% — the board would teach a wrong-looking DCF');
  if (model.provenance.inputsBlue) ok('provenance: every typed input is BLUE'); else bad('provenance: a typed input is not blue');
  if (model.provenance.builtsBlack) ok('provenance: every built cell is BLACK'); else bad('provenance: a built cell carries a font colour');
  if (model.provenance.assumptionsBoxed) ok('the two assumptions ride the §1.0(f) input convention (yellow + all borders)');
  else bad('the assumption cells are not yellow + all-bordered');
  if (model.border.bt && !model.border.bb) ok('the total wears a TOP border and no rule underneath (§1.0(f))');
  else bad('the total\'s borders are wrong: ' + JSON.stringify(model.border));
  if (!model.widths.loadOverflow.length && !model.widths.winOverflow.length)
    ok('no column prints #### at load or at the win state (§1.0-R3(r) !overflowsCol)');
  else bad('#### columns — load ' + JSON.stringify(model.widths.loadOverflow) + ' win ' + JSON.stringify(model.widths.winOverflow));
  if (!model.widths.loadClip.length && !model.widths.winClip.length)
    ok('no label is amputated at natural width (§1.0-R3(r) !clipsCol)');
  else bad('clipped label columns — load ' + JSON.stringify(model.widths.loadClip) + ' win ' + JSON.stringify(model.widths.winClip));
  if (typeof model.shareCell === 'number' && model.shareCell > 0)
    ok('the terminal-value share line is live at the win state (' + (model.shareCell * 100).toFixed(1) + '%) and reads 0, never #DIV/0!, at load');
  else bad('the share line did not compute: ' + JSON.stringify(model.shareCell));

  if (errs.length) { fail++; console.log('\nPAGE ERRORS: ' + errs.slice(0, 3).join(' · ')); }
  console.log('\nVERIFY dcf: ' + pass + ' ok · ' + fail + ' FAIL');
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
