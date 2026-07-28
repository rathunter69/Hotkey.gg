/* r448 · dev/verify-bsbuild.js — the depth-pass probe for ONE drill: bsbuild (DEPTH_PASS §4.79).
   Self-contained by WORKFLOW.md §9.1: it names no other drill, so the C13 retirement guard can
   never trip on it.

   WHY A PROBE AT ALL (DEPTH_PASS_CAMPAIGN §1): the untriggerable-beat class — a check that grades
   a ROUTE rather than an END STATE — has been found thirteen times in this campaign and NOT ONCE
   by reading a predicate. Every one was found by WALKING a route. So this file walks them.

   The init block below mirrors dev/e2e-demo-replay.js EXACTLY (hotkey_onboarded · hk_tour_done ·
   hk_learn_done · hk_handle_cache). A probe whose boot differs from the real harness reports
   numbers about a page the harness never loads — the r440 hotkey_onboarded incident.

   Sections:
     A  BOARD CONTRACT     ROWS=20 · §1.3 density at load and at the win · the sheet genuinely
                           balances once the roll is in · no ##### at load · the island moats
     B  ROUTE ENUMERATION  every legal Excel route to each beat's visible end state, WALKED, with
                           the beat's own ok read back (the CAMPAIGN §1 hunt)
     C  ☆ FAMILIES         the four candidate ☆ families measured against their own slow controls,
                           isolated, before one is chosen (CAMPAIGN §2 + the r447 debtsched rule)
     D  ☆ HEADROOM         fastest legal whole-drill route vs the slowest legal one that does the
                           same work, and the ☆ proved SKIPPABLE by measurement, not by assertion
     E  PAR DISTRIBUTION   the demo's keyLog over N seeds — median, min, max

   Run:  node dev/verify-bsbuild.js            (server on 127.0.0.1:8791)
         URL=http://127.0.0.1:8843/index.html node dev/verify-bsbuild.js      (worktree port)
         SEEDS=9 node dev/verify-bsbuild.js */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const HK_URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const SEEDS = parseInt(process.env.SEEDS || '5', 10);
const KEY = 'bsbuild';

let fails = 0;
const ok = m => console.log('  ok   ' + m);
const bad = m => { fails++; console.log('  FAIL ' + m); };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e.message || e).slice(0, 160)));
  await page.addInitScript(() => {
    try {
      localStorage.setItem('hotkey_onboarded', '1');   // skip the landing
      localStorage.setItem('hk_tour_done', '1');       // no spotlight tour
      localStorage.setItem('hk_learn_done', '1');      // no auto-guided first drill
      localStorage.setItem('hk_handle_cache', '');     // no welcome-back card
    } catch (e) {}
  });
  await page.goto(HK_URL, { waitUntil: 'load' });
  await page.waitForFunction(() =>
    typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function' &&
    typeof demoKey === 'function' && typeof setDemoSel === 'function', null, { timeout: 15000 });
  /* the progression gate (loadChallenge → drillLocked → openGateInfo) BOUNCES a locked chapter
     back to the board already on screen, silently — so a probe that skips this measures whatever
     drill booted, not this one. Every gate harness sets the same flag; mirroring it is the whole
     point of the "a probe must mirror the real harness init" rule. */
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* one page-side driver, reused by every section: load a fresh build, replay a move list built
     from the live geometry object, and hand back the beat states + the real keyLog length. */
  await page.evaluate((k) => {
    window.__bs = (srcFn) => {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge(k);
      const C = CHALLENGES[k], o = C._o;
      const moves = srcFn ? (new Function('o', 'T', 'L', 'D', 'Kb', 'colLetter', 'return (' + srcFn + ')'))(
        o, T, L, D, Kb, colLetter) : [];
      for (const mv of moves) { if (mv.sel) setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
      const items = C.checks.call(C, S);
      return { o: o, keys: keyLog.length, done: done, ok: items.map(x => !!x.ok), n: items.length };
    };
    window.__bsDemo = () => {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge(k);
      const C = CHALLENGES[k];
      for (const mv of C.demo.call(C)) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
      return { keys: keyLog.length, done: done, par: C.par, parKeys: C.parKeys };
    };
    window.__bsBoard = () => {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge(k);
      const C = CHALLENGES[k], o = C._o;
      const rows = {};
      for (let r = 1; r <= S.ROWS; r++) {
        let n = 0;
        for (let c = 1; c <= 10; c++) { const x = S.cells[colLetter(c) + r]; if (x && x.value !== null && x.value !== '') n++; }
        rows[r] = n;
      }
      let over = 0;
      for (let r = 1; r <= S.ROWS; r++) for (let c = 1; c <= 10; c++) {
        const x = S.cells[colLetter(c) + r];
        if (x && typeof x.value === 'number' && overflowsCol(S, c)) over++;
      }
      return { ROWS: S.ROWS, rows: rows, o: o, over: over };
    };
  }, KEY);

  /* the canonical fast route, as a source string the page compiles against its own geometry */
  const FAST = `[
    {sel:o.CC+o.rRE, keys:[...T('='+o.CB+o.rRE+'+'+o.CC+o.rNI+'+'+o.CC+o.rDV), Kb.enter]},
    {sel:o.CC+o.rRE, keys:[{key:'ArrowRight',shift:true}, Kb.fillR]},
    {sel:o.CB+o.rTA, keys:[...T('=SUM('+o.CB+o.a0+':'+o.CB+o.aN+')'), Kb.enter]},
    {sel:o.CB+o.rTA, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.fillR, Kb.copy]},
    {sel:o.CB+o.rLE, keys:[Kb.paste]},
    {sel:o.CA+o.rTA, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
    {sel:o.CA+o.rLE, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
    {sel:o.CB+o.rCK, keys:[...T('='+o.CB+o.rTA+'-'+o.CB+o.rLE), Kb.enter]},
    {sel:o.CB+o.rCK, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.fillR]},
    {sel:o.CA+o.rCK, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.bold]}
  ]`;

  /* the slowest LEGAL route that does the SAME work (CAMPAIGN §2: keep the comparison between
     routes that clear the same cores) — no fill, no paste, no autosum, every year typed, both
     totals as $-anchored addition chains, every dress walked cell by cell through the ribbon. */
  const SLOW = `(function(){ const st=[]; const yr=[o.CC,o.CD];
    yr.forEach((c,i)=>{ const prev=i===0?o.CB:o.CC;
      st.push({sel:c+o.rRE, keys:[...T('=$'+prev+'$'+o.rRE+'+$'+c+'$'+o.rNI+'+$'+c+'$'+o.rDV), Kb.enter]}); });
    o.cols.forEach(c=>{ let f='='; for(let r=o.a0;r<=o.aN;r++) f+=(r>o.a0?'+':'')+'$'+c+'$'+r;
      st.push({sel:c+o.rTA, keys:[...T(f), Kb.enter]}); });
    o.cols.forEach(c=>{ let f='='; for(let r=o.l0;r<=o.lN;r++) f+=(r>o.l0?'+':'')+'$'+c+'$'+r;
      st.push({sel:c+o.rLE, keys:[...T(f), Kb.enter]}); });
    o.cols.forEach(c=>{ st.push({sel:c+o.rTA, keys:[Kb.alt, L('h'), D(1), Kb.alt, L('h'), L('b'), L('p')]});
                        st.push({sel:c+o.rLE, keys:[Kb.alt, L('h'), D(1), Kb.alt, L('h'), L('b'), L('p')]}); });
    o.cols.forEach(c=>st.push({sel:c+o.rCK, keys:[...T('=-($'+c+'$'+o.rLE+'-$'+c+'$'+o.rTA+')'), Kb.enter]}));
    o.cols.forEach(c=>st.push({sel:c+o.rCK, keys:[Kb.alt, L('h'), D(1)]}));
    return st; })()`;

  const run = src => page.evaluate(s => window.__bs(s), src);
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

  /* ─────────────────────────── A · BOARD CONTRACT ─────────────────────────── */
  console.log('\nA · BOARD CONTRACT (§1.3 · §1.2 · doctrine §3 geometry)');
  {
    const b = await page.evaluate(() => window.__bsBoard());
    if (b.ROWS === 20) ok('ROWS=20 — the §1.3 floor AND cap, not the ROWS=14 inheritance');
    else bad('ROWS=' + b.ROWS + ' — §1.3 requires 20');
    const loadRows = Object.keys(b.rows).filter(r => b.rows[r] > 0).length;
    ok('load-state density ' + loadRows + '/20 rows carrying content (' + Math.round(100 * loadRows / 20) + '%)');
    for (const r of [9, 15, 17]) {
      if (b.rows[r] === 0) ok('row ' + r + ' is an empty MOAT — Ctrl+Shift+arrow cannot ride between the islands');
      else bad('row ' + r + ' should be an empty moat, carries ' + b.rows[r] + ' cells');
    }
    if (b.over === 0) ok('no ##### at load — every figure fits its column (fit-sweep contract)');
    else bad(b.over + ' figures overflow their column at load');
    // the win state, driven by the fast route
    const w = await run(FAST);
    const wb = await page.evaluate(() => {
      const rows = {}; for (let r = 1; r <= S.ROWS; r++) { let n = 0;
        for (let c = 1; c <= 10; c++) { const x = S.cells[colLetter(c) + r]; if (x && x.value !== null && x.value !== '') n++; }
        rows[r] = n; } return rows; });
    const winRows = Object.keys(wb).filter(r => wb[r] > 0).length;
    if (winRows / 20 >= 0.6) ok('WIN-STATE DENSITY ' + winRows + '/20 (' + Math.round(100 * winRows / 20) + '%) — clears the §1.3 ≥60% target');
    else bad('win-state density ' + winRows + '/20 — under the §1.3 60% target');
    if (w.ok.slice(0, 7).every(Boolean)) ok('the fast route clears all six cores AND the ☆');
    else bad('fast route beats: ' + JSON.stringify(w.ok));
  }

  /* ───────────────────── B · ROUTE ENUMERATION (the §1 hunt) ───────────────────── */
  console.log('\nB · ROUTE ENUMERATION — every legal route to the visible end state, WALKED (CAMPAIGN §1)');
  {
    // each entry: [beat index, name, moves-source]. The moves build ONLY that beat's cells; the
    // beat's own ok is read back. A dark line here is an untriggerable beat.
    const ROUTES = [
      [0, 'roll · plain relative refs, filled right',
        `[{sel:o.CC+o.rRE, keys:[...T('='+o.CB+o.rRE+'+'+o.CC+o.rNI+'+'+o.CC+o.rDV), Kb.enter]},
          {sel:o.CC+o.rRE, keys:[{key:'ArrowRight',shift:true}, Kb.fillR]}]`],
      [0, 'roll · SUM() form of the same three terms, typed per year',
        `[{sel:o.CC+o.rRE, keys:[...T('=SUM('+o.CB+o.rRE+','+o.CC+o.rNI+','+o.CC+o.rDV+')'), Kb.enter]},
          {sel:o.CD+o.rRE, keys:[...T('=SUM('+o.CC+o.rRE+','+o.CD+o.rNI+','+o.CD+o.rDV+')'), Kb.enter]}]`],
      [0, 'roll · $-ANCHORED refs typed per year (the anchor habit the catalog teaches)',
        `[{sel:o.CC+o.rRE, keys:[...T('=$'+o.CB+'$'+o.rRE+'+$'+o.CC+'$'+o.rNI+'+$'+o.CC+'$'+o.rDV), Kb.enter]},
          {sel:o.CD+o.rRE, keys:[...T('=$'+o.CC+'$'+o.rRE+'+$'+o.CD+'$'+o.rNI+'+$'+o.CD+'$'+o.rDV), Kb.enter]}]`],
      [0, 'roll · dividend SUBTRACTED via ABS (the other legal sign spelling)',
        `[{sel:o.CC+o.rRE, keys:[...T('='+o.CB+o.rRE+'+'+o.CC+o.rNI+'-ABS('+o.CC+o.rDV+')'), Kb.enter]},
          {sel:o.CD+o.rRE, keys:[...T('='+o.CC+o.rRE+'+'+o.CD+o.rNI+'-ABS('+o.CD+o.rDV+')'), Kb.enter]}]`],
      [0, 'roll · CUMULATIVE form on the last year (opens on FY1, adds both years)',
        `[{sel:o.CC+o.rRE, keys:[...T('='+o.CB+o.rRE+'+'+o.CC+o.rNI+'+'+o.CC+o.rDV), Kb.enter]},
          {sel:o.CD+o.rRE, keys:[...T('='+o.CB+o.rRE+'+'+o.CC+o.rNI+'+'+o.CC+o.rDV+'+'+o.CD+o.rNI+'+'+o.CD+o.rDV), Kb.enter]}]`],
      [0, 'roll · one formula committed to BOTH cells with Ctrl+Enter',
        `[{sel:o.CC+o.rRE+':'+o.CD+o.rRE, keys:[...T('='+o.CB+o.rRE+'+'+o.CC+o.rNI+'+'+o.CC+o.rDV), {key:'Enter',ctrl:true}]}]`],
      [1, 'assets total · typed SUM, filled right by the RIBBON walk',
        `[{sel:o.CB+o.rTA, keys:[...T('=SUM('+o.CB+o.a0+':'+o.CB+o.aN+')'), Kb.enter]},
          {sel:o.CB+o.rTA+':'+o.CD+o.rTA, keys:[Kb.alt, L('h'), L('f'), L('i'), L('r')]}]`],
      [1, 'assets total · AUTOSUM range form (select the block through the empty total cell)',
        `[{sel:o.CB+o.a0+':'+o.CB+o.rTA, keys:[Kb.eq]},
          {sel:o.CC+o.a0+':'+o.CC+o.rTA, keys:[Kb.eq]},
          {sel:o.CD+o.a0+':'+o.CD+o.rTA, keys:[Kb.eq]}]`],
      [1, 'assets total · ADDITION CHAIN, anchored, typed year by year',
        `(function(){ const st=[]; o.cols.forEach(c=>{ let f='='; for(let r=o.a0;r<=o.aN;r++) f+=(r>o.a0?'+':'')+'$'+c+'$'+r;
            st.push({sel:c+o.rTA, keys:[...T(f), Kb.enter]}); }); return st; })()`],
      [1, 'assets total · built on the LAST year and filled LEFT',
        `[{sel:o.CD+o.rTA, keys:[...T('=SUM('+o.CD+o.a0+':'+o.CD+o.aN+')'), Kb.enter]},
          {sel:o.CB+o.rTA+':'+o.CD+o.rTA, keys:[{key:'d',ctrl:true,code:'KeyD'}]},
          {sel:o.CB+o.rTA, keys:[...T('=SUM('+o.CB+o.a0+':'+o.CB+o.aN+')'), Kb.enter]},
          {sel:o.CB+o.rTA+':'+o.CD+o.rTA, keys:[Kb.fillR]}]`],
      [3, 'dress · Alt H B S (OUTSIDE border on the row) + Alt H 1 bold',
        `[{sel:o.CB+o.rTA+':'+o.CD+o.rTA, keys:[Kb.alt, L('h'), D(1), Kb.alt, L('h'), L('b'), L('s')]},
          {sel:o.CB+o.rLE+':'+o.CD+o.rLE, keys:[Kb.alt, L('h'), D(1), Kb.alt, L('h'), L('b'), L('s')]}]`],
      [3, 'dress · Alt H B A (ALL borders) cell by cell, bold by Ctrl+B — the 1x1 `ball` case',
        `(function(){ const st=[]; [o.rTA,o.rLE].forEach(r=>o.cols.forEach(c=>
            st.push({sel:c+r, keys:[Kb.bold, Kb.alt, L('h'), L('b'), L('a')]}))); return st; })()`],
      [3, 'dress · Alt H B D (top AND bottom) over the label plus the figures',
        `[{sel:o.CA+o.rTA+':'+o.CD+o.rTA, keys:[Kb.bold, Kb.alt, L('h'), L('b'), L('d')]},
          {sel:o.CA+o.rLE+':'+o.CD+o.rLE, keys:[Kb.bold, Kb.alt, L('h'), L('b'), L('d')]}]`],
      [4, 'check · written the OTHER WAY ROUND and negated, anchored, typed per year',
        `(function(){ const st=[{sel:o.CB+o.rTA, keys:[...T('=SUM('+o.CB+o.a0+':'+o.CB+o.aN+')'), Kb.enter]},
            {sel:o.CB+o.rTA+':'+o.CD+o.rTA, keys:[Kb.fillR]},
            {sel:o.CB+o.rLE, keys:[...T('=SUM('+o.CB+o.l0+':'+o.CB+o.lN+')'), Kb.enter]},
            {sel:o.CB+o.rLE+':'+o.CD+o.rLE, keys:[Kb.fillR]},
            {sel:o.CC+o.rRE, keys:[...T('='+o.CB+o.rRE+'+'+o.CC+o.rNI+'+'+o.CC+o.rDV), Kb.enter]},
            {sel:o.CC+o.rRE, keys:[{key:'ArrowRight',shift:true}, Kb.fillR]}];
          o.cols.forEach(c=>st.push({sel:c+o.rCK, keys:[...T('=-($'+c+'$'+o.rLE+'-$'+c+'$'+o.rTA+')'), Kb.enter]}));
          return st; })()`],
      [4, 'check · SUM(assets)-SUM(L&E) written from the blocks, never touching the total rows',
        `(function(){ const st=[{sel:o.CC+o.rRE, keys:[...T('='+o.CB+o.rRE+'+'+o.CC+o.rNI+'+'+o.CC+o.rDV), Kb.enter]},
            {sel:o.CC+o.rRE, keys:[{key:'ArrowRight',shift:true}, Kb.fillR]}];
          o.cols.forEach(c=>st.push({sel:c+o.rCK, keys:[...T('=SUM('+c+o.a0+':'+c+o.aN+')-SUM('+c+o.l0+':'+c+o.lN+')'), Kb.enter]}));
          return st; })()`],
      [6, 'STAR · single seed cell copied and TILED across the three-cell total row',
        `[{sel:o.CC+o.rRE, keys:[...T('='+o.CB+o.rRE+'+'+o.CC+o.rNI+'+'+o.CC+o.rDV), Kb.enter]},
          {sel:o.CC+o.rRE, keys:[{key:'ArrowRight',shift:true}, Kb.fillR]},
          {sel:o.CB+o.rTA, keys:[...T('=SUM('+o.CB+o.a0+':'+o.CB+o.aN+')'), Kb.enter]},
          {sel:o.CB+o.rTA+':'+o.CD+o.rTA, keys:[Kb.fillR]},
          {sel:o.CB+o.rTA, keys:[Kb.copy]},
          {sel:o.CB+o.rLE+':'+o.CD+o.rLE, keys:[Kb.paste]}]`],
      [6, 'STAR · paste-special FORMULAS through the dialog (Alt H V S then F)',
        `[{sel:o.CC+o.rRE, keys:[...T('='+o.CB+o.rRE+'+'+o.CC+o.rNI+'+'+o.CC+o.rDV), Kb.enter]},
          {sel:o.CC+o.rRE, keys:[{key:'ArrowRight',shift:true}, Kb.fillR]},
          {sel:o.CB+o.rTA, keys:[...T('=SUM('+o.CB+o.a0+':'+o.CB+o.aN+')'), Kb.enter]},
          {sel:o.CB+o.rTA, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.fillR, Kb.copy]},
          {sel:o.CB+o.rLE, keys:[Kb.alt, L('h'), L('v'), L('s'), L('f'), Kb.enter]}]`],
      [6, 'STAR · addition-chain total cloned across the moat (the source shape is not graded)',
        `[{sel:o.CC+o.rRE, keys:[...T('='+o.CB+o.rRE+'+'+o.CC+o.rNI+'+'+o.CC+o.rDV), Kb.enter]},
          {sel:o.CC+o.rRE, keys:[{key:'ArrowRight',shift:true}, Kb.fillR]},
          {sel:o.CB+o.rTA, keys:[...T('='+o.CB+o.a0+'+'+o.CB+(o.a0+1)+'+'+o.CB+(o.a0+2)+'+'+o.CB+o.aN), Kb.enter]},
          {sel:o.CB+o.rTA, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.fillR, Kb.copy]},
          {sel:o.CB+o.rLE, keys:[Kb.paste]}]`],
    ];
    for (const [i, name, src] of ROUTES) {
      let good = 0;
      for (let s = 0; s < SEEDS; s++) { const r = await run(src); if (r.ok[i]) good++; }
      if (good === SEEDS) ok('beat ' + (i + 1) + ' clears — ' + name);
      else bad('beat ' + (i + 1) + ' DARK on ' + (SEEDS - good) + '/' + SEEDS + ' seeds — ' + name + '  (UNTRIGGERABLE BEAT)');
    }
    // the negative side: a typed CONSTANT must NOT clear a beat whose verb says the line is built
    const HARDCODE = `(function(){ const st=[]; o.cols.forEach((c,i)=>
        st.push({sel:c+o.rTA, keys:[...T(String(o.exp[c].ta)), Kb.enter]})); return st; })()`;
    let hc = 0;
    for (let s = 0; s < SEEDS; s++) { const r = await run(HARDCODE); if (!r.ok[1]) hc++; }
    if (hc === SEEDS) ok('beat 2 REFUSES a hand-typed constant carrying the right number (MODELING_STANDARDS §1: no hardcodes)');
    else bad('a typed constant cleared the "Total the asset side" beat on ' + (SEEDS - hc) + '/' + SEEDS + ' seeds');
    /* ENGINE FACT worth recording so the next probe does not repeat the mistake: Ctrl+Shift+V is
       paste-VALUES only under keyProfile 'macabacus'; in the default profile it falls through to
       the plain Ctrl+V branch and lands a kind:'all' paste. The real default-profile values route
       is Alt H V V (r302). A first cut of this probe used the chord and reported a phantom
       failure — CAMPAIGN's "suspect the probe first" rule, fourth sighting. */
    const PVALUES = `[{sel:o.CC+o.rRE, keys:[...T('='+o.CB+o.rRE+'+'+o.CC+o.rNI+'+'+o.CC+o.rDV), Kb.enter]},
      {sel:o.CC+o.rRE, keys:[{key:'ArrowRight',shift:true}, Kb.fillR]},
      {sel:o.CB+o.rTA, keys:[...T('=SUM('+o.CB+o.a0+':'+o.CB+o.aN+')'), Kb.enter]},
      {sel:o.CB+o.rTA, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.fillR, Kb.copy]},
      {sel:o.CB+o.rLE, keys:[Kb.alt, L('h'), L('v'), L('v')]}]`;
    let pv = 0;
    for (let s = 0; s < SEEDS; s++) { const r = await run(PVALUES); if (!r.ok[2] && !r.ok[6]) pv++; }
    if (pv === SEEDS) ok('a VALUES paste lands the right numbers dead — beat 3 and the ☆ both stay dark, as designed');
    else bad('paste-VALUES cleared beat 3 or the ☆ on ' + (SEEDS - pv) + '/' + SEEDS + ' seeds');
  }

  /* ─────────────── C · ☆ FAMILY BAKE-OFF (measure, then choose) ─────────────── */
  console.log('\nC · ☆ FAMILY BAKE-OFF — each candidate isolated against its OWN slow control (CAMPAIGN §2)');
  {
    /* CAMPAIGN §2, the r438 `series` rule: measure each move against its OWN slow alternative,
       ISOLATED. Every route below shares a PREFIX (the work the player does either way), so the
       gross number flatters whichever family carries the bigger prefix. The MARGINAL columns —
       gross minus prefix — are the honest comparison and are what the choice was made on. */
    const one = async src => { const a = []; for (let s = 0; s < SEEDS; s++) a.push((await run(src)).keys); return med(a); };
    const pair = async (name, prefix, star, ctrl) => {
      const mp = prefix ? await one(prefix) : 0;
      const ms = await one(star), mc = await one(ctrl);
      console.log('  •    ' + name.padEnd(32) + 'gross ' + String(ms).padStart(3) + '/' + String(mc).padStart(3) +
        '   marginal ' + String(ms - mp).padStart(3) + ' vs ' + String(mc - mp).padStart(3) +
        '   spread ' + ((mc - mp) / Math.max(1, ms - mp)).toFixed(1) + '×');
      return { star: ms - mp, ctrl: mc - mp };
    };
    // the ROW the star acts on is isolated: only the L&E total is built, nothing else.
    // the prefix every clone route pays anyway: the assets total built once and taken across.
    const PRE = `[{sel:o.CB+o.rTA, keys:[...T('=SUM('+o.CB+o.a0+':'+o.CB+o.aN+')'), Kb.enter]},
                  {sel:o.CB+o.rTA, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.fillR]}]`;
    const seed = PRE.slice(1, -1) + ',';
    const F = {};
    F.clone = await pair('paste-CLONE the total row', PRE,
      `[${seed}{sel:o.CB+o.rTA, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.copy]},
        {sel:o.CB+o.rLE, keys:[Kb.paste]}]`,
      `[${seed}{sel:o.CB+o.rLE, keys:[...T('=SUM('+o.CB+o.l0+':'+o.CB+o.lN+')'), Kb.enter]},
        {sel:o.CB+o.rLE, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.fillR]}]`);
    F.fill = await pair('fill-across (balance’s star)', null,
      `[{sel:o.CB+o.rTA, keys:[...T('=SUM('+o.CB+o.a0+':'+o.CB+o.aN+')'), Kb.enter]},
        {sel:o.CB+o.rTA, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.fillR]}]`,
      `(function(){ const st=[]; o.cols.forEach(c=>st.push({sel:c+o.rTA,
          keys:[...T('=SUM('+c+o.a0+':'+c+o.aN+')'), Kb.enter]})); return st; })()`);
    F.multi = await pair('multi-enter (Ctrl+↵) on the roll', null,
      `[{sel:o.CC+o.rRE, keys:[{key:'ArrowRight',shift:true}, ...T('='+o.CB+o.rRE+'+'+o.CC+o.rNI+'+'+o.CC+o.rDV), {key:'Enter',ctrl:true}]}]`,
      `[{sel:o.CC+o.rRE, keys:[...T('='+o.CB+o.rRE+'+'+o.CC+o.rNI+'+'+o.CC+o.rDV), Kb.enter]},
        {sel:o.CC+o.rRE, keys:[{key:'ArrowRight',shift:true}, Kb.fillR]}]`);
    F.asum = await pair('autosum provenance (ILLEGAL)', null,
      `[{sel:o.CB+o.a0+':'+o.CB+o.rTA, keys:[Kb.eq]}]`,
      `[{sel:o.CB+o.rTA, keys:[...T('=SUM('+o.CB+o.a0+':'+o.CB+o.aN+')'), Kb.enter]}]`);
    console.log('  note autosum is chord-vs-typed on the SAME job — §1.0(c) forces both to clear, so it can');
    console.log('       never be a ☆ however favourable the number. Recorded, not chosen.');
  }

  /* ─────────────── D · ☆ HEADROOM + SKIPPABILITY (measured, not asserted) ─────────────── */
  console.log('\nD · ☆ HEADROOM (CAMPAIGN §2, both parts) + the SKIPPABILITY proof');
  {
    const f = [], s = [];
    for (let i = 0; i < SEEDS; i++) { f.push((await run(FAST)).keys); s.push((await run(SLOW)).keys); }
    const mf = med(f), ms = med(s);
    ok('PART 1 · fastest legal ' + mf + ' keys · slowest legal doing the same work ' + ms +
       ' keys · spread ' + (ms / mf).toFixed(2) + '×');
    /* PART 2 asks WHAT the spread is made of, and the answer has to be measured, not asserted:
       §1.0(c) forces chord-vs-ribbon to clear and §1.0(d) forbids grading formatting, so both
       components are inadmissible and only what SURVIVES the strip can carry a legal ☆. The two
       halves are isolated here by running the dress alone, fast and slow. */
    const DRESS_FAST = `[
      {sel:o.CA+o.rTA, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
      {sel:o.CA+o.rLE, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
      {sel:o.CA+o.rCK, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.bold]}]`;
    const DRESS_SLOW = `(function(){ const st=[];
      o.cols.forEach(c=>{ st.push({sel:c+o.rTA, keys:[Kb.alt, L('h'), D(1), Kb.alt, L('h'), L('b'), L('p')]});
                          st.push({sel:c+o.rLE, keys:[Kb.alt, L('h'), D(1), Kb.alt, L('h'), L('b'), L('p')]}); });
      o.cols.forEach(c=>st.push({sel:c+o.rCK, keys:[Kb.alt, L('h'), D(1)]}));
      return st; })()`;
    const df = [], ds = [];
    for (let i = 0; i < SEEDS; i++) { df.push((await run(DRESS_FAST)).keys); ds.push((await run(DRESS_SLOW)).keys); }
    const fmtSpread = med(ds) - med(df);
    ok('PART 2 · of those ' + (ms - mf) + ' keys, ' + fmtSpread +
       ' are FORMATTING/chord-vs-ribbon (dress ' + med(df) + ' fast vs ' + med(ds) +
       ' slow) — inadmissible under §1.0(c)/(d). ' + (ms - mf - fmtSpread) +
       ' keys of BUILD spread survive the strip, so a legal ☆ exists');
    // the slow route must clear every CORE with the ☆ dark — that IS the skippability proof
    let cores = 0, dark = 0;
    for (let i = 0; i < SEEDS; i++) {
      const r = await run(SLOW);
      if (r.ok.slice(0, 6).every(Boolean)) cores++;
      if (!r.ok[6]) dark++;
    }
    if (cores === SEEDS) ok('PART 2 · the slow route clears all SIX cores on ' + SEEDS + '/' + SEEDS + ' seeds (§1.0(c) freedom)');
    else bad('the slow route left a core dark on ' + (SEEDS - cores) + '/' + SEEDS + ' seeds — a route is being penalised');
    if (dark === SEEDS) ok('PART 2 · and the ☆ stays DARK on it — the star is a SKIPPABLE decision (§1.0-R2(i)), costed at ' + (ms - mf) + ' keys');
    else bad('the ☆ fired on the no-paste control ' + (SEEDS - dark) + '/' + SEEDS + ' seeds — it falls out of the exercise');
  }

  /* ─────────────── E · PAR DISTRIBUTION ─────────────── */
  console.log('\nE · PAR DISTRIBUTION — the demo through the live engine, ' + SEEDS + ' seeds');
  {
    const a = [];
    let par = 0, parKeys = 0, wins = 0;
    for (let i = 0; i < SEEDS; i++) { const r = await page.evaluate(() => window.__bsDemo());
      a.push(r.keys); par = r.par; parKeys = r.parKeys; if (r.done) wins++; }
    const s = a.slice().sort((x, y) => x - y);
    const m = s[Math.floor(s.length / 2)];
    ok('demo wins ' + wins + '/' + SEEDS + ' · keyLog median ' + m + ' (min ' + s[0] + ', max ' + s[s.length - 1] + ')');
    if (parKeys === m) ok('parKeys ' + parKeys + ' matches the measured median · par ' + par +
      ' = ' + (par / parKeys).toFixed(2) + ' s/key (house band ~1.05)');
    else bad('parKeys ' + parKeys + ' != measured median ' + m + ' — retune before shipping');
  }

  if (pageErrors.length) { fails += pageErrors.length; console.log('\nPAGE ERRORS: ' + pageErrors.slice(0, 5).join(' | ')); }
  console.log('\n' + (fails ? 'verify-' + KEY + ': ' + fails + ' FAILURE(S)' : 'verify-' + KEY + ': ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
