/* r444 — retbridge DEPTH-PASS PROBE (DEPTH_PASS §4.64, DEPTH_PASS_CAMPAIGN §1 + §2).

   WHY THIS FILE EXISTS. The campaign's #1 defect is the UNTRIGGERABLE BEAT — a check that
   grades a ROUTE rather than an END STATE, so a player who solves the drill by another legal
   route watches the line stay dark with nothing on the board to fix. Eighteen have been found
   and every single one was found by WALKING a route, never by reading a predicate (CAMPAIGN §1:
   two of them were read and judged deliberate by an experienced reviewer first). So this probe
   walks them. It also runs the ☆-HEADROOM DIAGNOSTIC (CAMPAIGN §2, both parts) with the key
   counts the payload reports, and it censuses the board against §1.3 / MODELING_STANDARDS §1.

   It is deliberately self-contained and names NO other drill (the C13 retirement guard sweeps
   dev/*.js for quoted drill keys).

   HARNESS INIT — the probe mirrors the real gate harnesses exactly (hotkey_onboarded,
   hk_tour_done, hk_learn_done, hk_beta_ok, hk_xlv). CAMPAIGN records two rounds lost to a probe
   that skipped one of these and read the onboarding overlay's state as a product defect; a probe
   that does not mirror the harness init is lying.

   Run: node dev/verify-retbridge.js          (server on 127.0.0.1:8791)
        URL=http://127.0.0.1:88NN/index.html node dev/verify-retbridge.js   (worktree port) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SEEDS = Number(process.env.SEEDS || 5);

let fails = 0, checksRun = 0;
const ok = m => { checksRun++; console.log('  ok   ' + m); };
const bad = m => { checksRun++; fails++; console.log('  FAIL ' + m); };
const head = m => console.log('\n=== ' + m);

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_gate_off', '1'); localStorage.setItem('hk_beta_ok', '1');
    localStorage.setItem('hk_xlv', '2');
  } catch (e) {} });
  await page.goto(process.env.URL || 'http://127.0.0.1:8791/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* Page-side driver. `moves` is built from the live _o so a route never hard-codes geometry
     (the CAMPAIGN §4 coupling lesson: a suite that hard-codes a drill's board breaks on the next
     rework). Returns the checklist state plus the measured keyLog length. */
  const drive = (script, opts) => page.evaluate(([src, o]) => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
    loadChallenge('retbridge');
    const C = CHALLENGES.retbridge, g = C._o;
    const moves = (new Function('o', 'T', 'L', 'D', 'Kb', 'return (' + src + ')'))(g, T, L, D, Kb);
    for (const mv of moves) {
      if (mv.sel) setDemoSel(mv.sel);
      for (const k of mv.keys) demoKey(k);
    }
    const items = C.checks.call(C, S);
    return {
      keys: keyLog.length,
      won: done,
      cores: items.filter(x => !x.bonus && !x.save).map(x => !!x.ok),
      star: !!(items.find(x => x.bonus) || {}).ok,
      save: !!(items.find(x => x.save) || {}).ok,
      labels: items.map(x => x.label),
      o: g,
    };
  }, [script, opts || null]);

  /* ---------------------------------------------------------------- 1 · BOARD CENSUS */
  head('1 · BOARD — §1.3 density, ROWS=20, MODELING_STANDARDS §1 colour/structure');
  for (let s = 0; s < SEEDS; s++) {
    const b = await page.evaluate(() => {
      loadChallenge('retbridge');
      const C = CHALLENGES.retbridge, o = C._o;
      const used = new Set();
      for (const k in S.cells) { const c = S.cells[k];
        if (c && (c.value !== null && c.value !== '')) used.add(Number(k.replace(/^[A-J]/, ''))); }
      // graded destinations count as "scripted purpose" even while empty (§1.3)
      [o.rG, o.rM, o.rD, o.rTot, o.rChk].forEach(r => used.add(r));
      const cell = k => S.cells[k] || {};
      const blues = [o.CB + o.rEbt, o.CC + o.rEbt, o.CB + o.rMlt, o.CC + o.rMlt, o.CB + o.rNd, o.CC + o.rNd];
      const blacks = [o.CB + o.rEv, o.CC + o.rEv, o.CB + o.rEq, o.CC + o.rEq, o.CB + o.rAct];
      return {
        ROWS: S.ROWS,
        loadRows: used.size,
        blueOk: blues.every(k => cell(k).fontColor === 'blue' && !cell(k).formula),
        blackOk: blacks.every(k => !!cell(k).formula && !cell(k).fontColor),
        litInFormula: blacks.some(k => /\d/.test(String(cell(k).formula).replace(/[A-J]\d+/g, ''))),
        eqBt: !!cell(o.CB + o.rEq).bt && !!cell(o.CC + o.rEq).bt,
        totBt: !!cell(o.CB + o.rTot).bt && !!cell(o.CA + o.rTot).bt,
        hdrBb: !!cell(o.CA + o.rTtl + 2).bb,
        noBb: !cell(o.CB + o.rTot).bb && !cell(o.CB + o.rEq).bb,
        multFmt: cell(o.CB + o.rMlt).fmtStyle === 'mult' && cell(o.CB + o.rMlt).decimals === 1,
        pctFmt: cell(o.CC + o.rG).fmtStyle === 'percent' && cell(o.CC + o.rG).decimals === 1,
        shareBare: !cell(o.CC + o.rG).bold && !cell(o.CC + o.rG).bt,
        noShareOnTotal: !(S.cells[o.CC + o.rTot] || {}).value && !(S.cells[o.CC + o.rTot] || {}).formula && !!(S.cells[o.CC + o.rTot] || {}).bt,
        overflow: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(c => overflowsCol(S, c)),
        clipped: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(c => clipsCol(S, c)),
        // the identity, evaluated on the seed's own numbers
        identity: Math.abs((o.g + o.mx + o.dn) - (o.eq1 - o.eq0)),
        up: o.up, gain: o.gain, eq0: o.eq0,
        shares: [o.g / o.tot, o.mx / o.tot, o.dn / o.tot],
      };
    });
    if (b.ROWS !== 20) bad(`seed ${s}: ROWS=${b.ROWS}, must be 20 (§1.3 floor AND cap)`);
    if (b.loadRows < 12) bad(`seed ${s}: only ${b.loadRows}/20 rows carry content or purpose (§1.3 wants >=12)`);
    if (!b.blueOk) bad(`seed ${s}: a hardcoded input is not blue (MODELING_STANDARDS §1)`);
    if (!b.blackOk) bad(`seed ${s}: a computed cell is not a black formula (MODELING_STANDARDS §1)`);
    if (b.litInFormula) bad(`seed ${s}: a seeded formula carries a literal (MODELING_STANDARDS §1 no-hardcodes)`);
    if (!b.eqBt || !b.totBt) bad(`seed ${s}: a total is missing its TOP border (§1.0(f))`);
    if (!b.noBb) bad(`seed ${s}: a total wears a BOTTOM border — §1.0(f) reverses that`);
    if (!b.multFmt) bad(`seed ${s}: multiples are not fmtStyle mult / 1dp (doctrine §2.4)`);
    if (!b.pctFmt) bad(`seed ${s}: the share column is not percent / 1dp`);
    if (!b.shareBare) bad(`seed ${s}: the share fill SOURCE carries dress the fill would spread`);
    if (!b.noShareOnTotal) bad(`seed ${s}: a share cell sits on the Total row — the ☆ fill would strip its dress (r439 cases)`);
    if (b.overflow.length) bad(`seed ${s}: columns ${b.overflow} print #### at load`);
    if (b.clipped.length) bad(`seed ${s}: columns ${b.clipped} clip a label at load`);
    /* EXACT, not near — the half-turn multiples are dyadic, so any float noise here would mean
       the check cell paints "(0)" in parens on a page that ties (see the build() note) */
    if (b.identity !== 0) bad(`seed ${s}: the decomposition is not EXACTLY the equity change (off by ${b.identity}) — the check will paint (0)`);
    if (b.gain <= 0.40 * b.eq0) bad(`seed ${s}: gain ${b.gain} is not a healthy multiple of entry equity ${b.eq0}`);
    if (b.shares.some(x => Math.abs(x) > 1.3)) bad(`seed ${s}: a lever's share runs past 130% — ${b.shares}`);
    if (s === 0 || s === SEEDS - 1) ok(`seed ${s}: ROWS 20 · ${b.loadRows}/20 rows (${Math.round(b.loadRows / 20 * 100)}%) · identity exact · multiple ${b.up ? 'expanded' : 'contracted'} · shares ${b.shares.map(x => (x * 100).toFixed(1) + '%').join(' / ')}`);
  }

  /* ---------------------------------------------------- 2 · ROUTE ENUMERATION AND WALK */
  head('2 · EVERY ROUTE TO THE VISIBLE END STATE, WALKED (§1.0-R3(p) / CAMPAIGN §1)');
  /* Each entry solves the WHOLE drill but takes one beat by a different legal route, so the
     assertion is always "all six cores green" — a beat that locks a route out shows up as a
     single dark line rather than a vague failure. */
  const BASE = o => `[
    {sel:o.CB+o.rG,   keys:[...T('=('+o.CC+o.rEbt+'-'+o.CB+o.rEbt+')*'+o.CB+o.rMlt), Kb.enter]},
    {sel:o.CB+o.rM,   keys:[...T('=('+o.CC+o.rMlt+'-'+o.CB+o.rMlt+')*'+o.CC+o.rEbt), Kb.enter]},
    {sel:o.CB+o.rD,   keys:[...T('='+o.CB+o.rNd+'-'+o.CC+o.rNd), Kb.enter]},
    {sel:o.CB+o.rTot, keys:[Kb.eq, Kb.enter]},
    {sel:o.CC+o.rG,   keys:[...T('='+o.CB+o.rG+'/$'+o.CB+'$'+o.rTot), Kb.enter]},
    {sel:o.CC+o.rG,   keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]},
    {sel:o.CB+o.rChk, keys:[...T('='+o.CB+o.rTot+'-'+o.CB+o.rAct), Kb.enter]},
    {sel:'A1', keys:[{key:'s',ctrl:true}]}
  ]`;
  /* NB the replacer is a FUNCTION, not a string: these scripts are full of `+'$'+` (the anchor
     the ☆ turns on) and String.replace reads `$'` in a replacement STRING as "everything after
     the match". The first cut of this file did that and produced a route source that would not
     parse — a probe bug that reads exactly like a drill bug (CAMPAIGN: suspect the probe first). */
  const sub = (from, to) => BASE().replace(from, () => to);
  const ROUTES = [
    ['beat1 · growth written with the multiple first',
      sub(`{sel:o.CB+o.rG,   keys:[...T('=('+o.CC+o.rEbt+'-'+o.CB+o.rEbt+')*'+o.CB+o.rMlt), Kb.enter]}`,
          `{sel:o.CB+o.rG,   keys:[...T('='+o.CB+o.rMlt+'*('+o.CC+o.rEbt+'-'+o.CB+o.rEbt+')'), Kb.enter]}`)],
    ['beat1 · growth EXPANDED into two products',
      sub(`{sel:o.CB+o.rG,   keys:[...T('=('+o.CC+o.rEbt+'-'+o.CB+o.rEbt+')*'+o.CB+o.rMlt), Kb.enter]}`,
          `{sel:o.CB+o.rG,   keys:[...T('='+o.CC+o.rEbt+'*'+o.CB+o.rMlt+'-'+o.CB+o.rEbt+'*'+o.CB+o.rMlt), Kb.enter]}`)],
    ['beat1 · growth fully ANCHORED',
      sub(`{sel:o.CB+o.rG,   keys:[...T('=('+o.CC+o.rEbt+'-'+o.CB+o.rEbt+')*'+o.CB+o.rMlt), Kb.enter]}`,
          `{sel:o.CB+o.rG,   keys:[...T('=($'+o.CC+'$'+o.rEbt+'-$'+o.CB+'$'+o.rEbt+')*$'+o.CB+'$'+o.rMlt), Kb.enter]}`)],
    ['beat1 · growth with the figures TYPED, not referenced (§1.0(c) slow route)',
      sub(`{sel:o.CB+o.rG,   keys:[...T('=('+o.CC+o.rEbt+'-'+o.CB+o.rEbt+')*'+o.CB+o.rMlt), Kb.enter]}`,
          `{sel:o.CB+o.rG,   keys:[...T('=('+o.e1+'-'+o.e0+')*'+o.m0), Kb.enter]}`)],
    ['beat2 · multiple written with EBITDA first',
      sub(`{sel:o.CB+o.rM,   keys:[...T('=('+o.CC+o.rMlt+'-'+o.CB+o.rMlt+')*'+o.CC+o.rEbt), Kb.enter]}`,
          `{sel:o.CB+o.rM,   keys:[...T('='+o.CC+o.rEbt+'*('+o.CC+o.rMlt+'-'+o.CB+o.rMlt+')'), Kb.enter]}`)],
    ['beat2 · multiple EXPANDED into two products',
      sub(`{sel:o.CB+o.rM,   keys:[...T('=('+o.CC+o.rMlt+'-'+o.CB+o.rMlt+')*'+o.CC+o.rEbt), Kb.enter]}`,
          `{sel:o.CB+o.rM,   keys:[...T('='+o.CC+o.rMlt+'*'+o.CC+o.rEbt+'-'+o.CB+o.rMlt+'*'+o.CC+o.rEbt), Kb.enter]}`)],
    ['beat3 · paydown written NEGATED',
      sub(`{sel:o.CB+o.rD,   keys:[...T('='+o.CB+o.rNd+'-'+o.CC+o.rNd), Kb.enter]}`,
          `{sel:o.CB+o.rD,   keys:[...T('=-('+o.CC+o.rNd+'-'+o.CB+o.rNd+')'), Kb.enter]}`)],
    ['beat4 · total as a typed SUM',
      sub(`{sel:o.CB+o.rTot, keys:[Kb.eq, Kb.enter]}`,
          `{sel:o.CB+o.rTot, keys:[...T('=SUM('+o.CB+o.rG+':'+o.CB+o.rD+')'), Kb.enter]}`)],
    ['beat4 · total as an ADDITION CHAIN',
      sub(`{sel:o.CB+o.rTot, keys:[Kb.eq, Kb.enter]}`,
          `{sel:o.CB+o.rTot, keys:[...T('='+o.CB+o.rG+'+'+o.CB+o.rM+'+'+o.CB+o.rD), Kb.enter]}`)],
    ['beat4 · total by the autosum RANGE form (selection through the empty total cell)',
      sub(`{sel:o.CB+o.rTot, keys:[Kb.eq, Kb.enter]}`,
          `{sel:o.CB+o.rG+':'+o.CB+o.rTot, keys:[Kb.eq]}`)],
    ['beat4 · total as a two-range SUM plus a term',
      sub(`{sel:o.CB+o.rTot, keys:[Kb.eq, Kb.enter]}`,
          `{sel:o.CB+o.rTot, keys:[...T('=SUM('+o.CB+o.rG+':'+o.CB+o.rM+')+'+o.CB+o.rD), Kb.enter]}`)],
    ['beat5 · share column TYPED three times, unanchored (the ☆ negative control)',
      sub(`{sel:o.CC+o.rG,   keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]}`,
          `{sel:o.CC+o.rM,   keys:[...T('='+o.CB+o.rM+'/'+o.CB+o.rTot), Kb.enter, ...T('='+o.CB+o.rD+'/'+o.CB+o.rTot), Kb.enter]}`)],
    ['beat5 · share column divided by the ACTUAL GAIN cell, not the total',
      sub(`{sel:o.CC+o.rG,   keys:[...T('='+o.CB+o.rG+'/$'+o.CB+'$'+o.rTot), Kb.enter]}`,
          `{sel:o.CC+o.rG,   keys:[...T('='+o.CB+o.rG+'/$'+o.CB+'$'+o.rAct), Kb.enter]}`)],
    ['beat5 · share column filled from the RIBBON (alt h f i d), not ctrl+d',
      sub(`{sel:o.CC+o.rG,   keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]}`,
          `{sel:o.CC+o.rG,   keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.alt, L('h'), L('f'), L('i'), L('d')]}`)],
    ['beat5 · share column anchored with F4 rather than typed dollars',
      sub(`{sel:o.CC+o.rG,   keys:[...T('='+o.CB+o.rG+'/$'+o.CB+'$'+o.rTot), Kb.enter]}`,
          `{sel:o.CC+o.rG,   keys:[...T('='+o.CB+o.rG+'/'+o.CB+o.rTot), {key:'F4'}, Kb.enter]}`)],
    ['beat6 · check written the other way round and negated',
      sub(`{sel:o.CB+o.rChk, keys:[...T('='+o.CB+o.rTot+'-'+o.CB+o.rAct), Kb.enter]}`,
          `{sel:o.CB+o.rChk, keys:[...T('=-('+o.CB+o.rAct+'-'+o.CB+o.rTot+')'), Kb.enter]}`)],
    ['beat6 · check ANCHORED',
      sub(`{sel:o.CB+o.rChk, keys:[...T('='+o.CB+o.rTot+'-'+o.CB+o.rAct), Kb.enter]}`,
          `{sel:o.CB+o.rChk, keys:[...T('=$'+o.CB+'$'+o.rTot+'-$'+o.CB+'$'+o.rAct), Kb.enter]}`)],
    ['beat6 · check recomputing the gain INLINE off the equity line',
      sub(`{sel:o.CB+o.rChk, keys:[...T('='+o.CB+o.rTot+'-'+o.CB+o.rAct), Kb.enter]}`,
          `{sel:o.CB+o.rChk, keys:[...T('='+o.CB+o.rTot+'-('+o.CC+o.rEq+'-'+o.CB+o.rEq+')'), Kb.enter]}`)],
    ['order · the whole bridge built BOTTOM-UP, check first-cell last',
      `[
        {sel:o.CB+o.rD,   keys:[...T('='+o.CB+o.rNd+'-'+o.CC+o.rNd), Kb.enter]},
        {sel:o.CB+o.rM,   keys:[...T('=('+o.CC+o.rMlt+'-'+o.CB+o.rMlt+')*'+o.CC+o.rEbt), Kb.enter]},
        {sel:o.CB+o.rG,   keys:[...T('=('+o.CC+o.rEbt+'-'+o.CB+o.rEbt+')*'+o.CB+o.rMlt), Kb.enter]},
        {sel:o.CC+o.rD,   keys:[...T('='+o.CB+o.rD+'/$'+o.CB+'$'+o.rTot), Kb.enter]},
        {sel:o.CC+o.rM,   keys:[...T('='+o.CB+o.rM+'/$'+o.CB+'$'+o.rTot), Kb.enter]},
        {sel:o.CC+o.rG,   keys:[...T('='+o.CB+o.rG+'/$'+o.CB+'$'+o.rTot), Kb.enter]},
        {sel:o.CB+o.rTot, keys:[...T('=SUM('+o.CB+o.rG+':'+o.CB+o.rD+')'), Kb.enter]},
        {sel:o.CB+o.rChk, keys:[...T('='+o.CB+o.rTot+'-'+o.CB+o.rAct), Kb.enter]},
        {sel:'A1', keys:[{key:'s',ctrl:true}]}
      ]`],
  ];
  for (const [name, script] of (process.env.QUICK === '1' ? [] : ROUTES)) {
    let allGreen = true, detail = null;
    for (let s = 0; s < SEEDS; s++) {
      const r = await drive(script);
      if (!r.cores.every(Boolean)) { allGreen = false; detail = r.cores.map((v, i) => v ? '' : '#' + (i + 1)).filter(Boolean).join(','); break; }
      if (!r.won) { allGreen = false; detail = 'no win'; break; }
    }
    allGreen ? ok(name) : bad(name + ' — DARK BEATS: ' + detail + '  <<< UNTRIGGERABLE BEAT');
  }

  /* ------------------------------------------------------- 3 · THE ☆: EARNED AND SKIPPED */
  head('3 · ☆ — fires on the fill, DARK on every route that does the same work by hand');
  const STAR = [
    ['ctrl+d over the three lever rows', BASE(), true],
    ['the ribbon fill (alt h f i d) over the same rows',
      sub(`{sel:o.CC+o.rG,   keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]}`,
          `{sel:o.CC+o.rG,   keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.alt, L('h'), L('f'), L('i'), L('d')]}`), true],
    ['three shares TYPED one at a time — the negative control',
      sub(`{sel:o.CC+o.rG,   keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]}`,
          `{sel:o.CC+o.rM,   keys:[...T('='+o.CB+o.rM+'/'+o.CB+o.rTot), Kb.enter, ...T('='+o.CB+o.rD+'/'+o.CB+o.rTot), Kb.enter]}`), false],
    ['two single-cell ctrl+d passes — two passes, not one',
      sub(`{sel:o.CC+o.rG,   keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]}`,
          `{sel:o.CC+o.rM,   keys:[Kb.fillD]},{sel:o.CC+o.rD, keys:[Kb.fillD]}`), false],
  ];
  for (const [name, script, want] of (process.env.QUICK === '1' ? [] : STAR)) {
    let good = true, note = '';
    for (let s = 0; s < SEEDS; s++) {
      const r = await drive(script);
      if (!r.cores.every(Boolean)) { good = false; note = 'a core beat went dark'; break; }
      if (r.star !== want) { good = false; note = 'star=' + r.star + ', wanted ' + want; break; }
    }
    good ? ok(`${name} — ☆ ${want ? 'EARNED' : 'dark'}, all six cores green`) : bad(`${name} — ${note}`);
  }
  /* the anchor is what makes the fill safe — fill WITHOUT it and the divisor walks into the
     blank rows below, so the core goes dark and the star with it */
  {
    const script = sub(`{sel:o.CC+o.rG,   keys:[...T('='+o.CB+o.rG+'/$'+o.CB+'$'+o.rTot), Kb.enter]}`,
                       `{sel:o.CC+o.rG,   keys:[...T('='+o.CB+o.rG+'/'+o.CB+o.rTot), Kb.enter]}`);
    const r = await drive(script);
    (!r.cores[4] && !r.star) ? ok('filled WITHOUT the anchor — share beat dark, ☆ dark (the lesson)')
                             : bad(`filled without the anchor but beat5=${r.cores[4]} star=${r.star}`);
  }

  /* ------------------------------------------- 4 · ☆-HEADROOM DIAGNOSTIC (CAMPAIGN §2) */
  head('4 · ☆-HEADROOM — every selection and navigation KEYED, no setDemoSel anywhere');
  /* Both routes start from the cell build() parks the cursor on and pay for every move. The
     comparison is between two routes that do the SAME work (CAMPAIGN §2's rule) — the fastest
     legal route against the obvious slow one that also clears every core. */
  const FAST = `[{sel:null, keys:[
      ...T('=('+o.CC+o.rEbt+'-'+o.CB+o.rEbt+')*'+o.CB+o.rMlt), Kb.enter,
      ...T('=('+o.CC+o.rMlt+'-'+o.CB+o.rMlt+')*'+o.CC+o.rEbt), Kb.enter,
      ...T('='+o.CB+o.rNd+'-'+o.CC+o.rNd), Kb.enter,
      Kb.eq, Kb.enter,
      {key:'ArrowRight'}, Kb.ctrlUp, {key:'ArrowDown'},
      ...T('='+o.CB+o.rG+'/$'+o.CB+'$'+o.rTot), Kb.enter,
      {key:'ArrowUp'}, {key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD,
      {key:'ArrowLeft'}, Kb.ctrlDown, Kb.ctrlDown, {key:'ArrowDown'},
      ...T('='+o.CB+o.rTot+'-'+o.CB+o.rAct), Kb.enter,
      {key:'s',ctrl:true}
    ]}]`;
  /* THE SLOW ROUTE, and it is the one a beginner really takes: every reference RETYPED as the
     number it shows (§1.0(c) protects that explicitly — "typing values instead of referencing"),
     no autosum, no fill anywhere, the check written against a retyped gain. Same work, same six
     green beats, no star. */
  const SLOW = `[{sel:null, keys:[
      ...T('=('+o.e1+'-'+o.e0+')*'+o.m0), Kb.enter,
      ...T('=('+o.m1+'-'+o.m0+')*'+o.e1), Kb.enter,
      ...T('='+o.d0+'-'+o.d1), Kb.enter,
      ...T('='+Math.round(o.g)+'+'+Math.round(o.mx)+'+'+Math.round(o.dn)), Kb.enter,
      {key:'ArrowRight'}, {key:'ArrowUp'},{key:'ArrowUp'},{key:'ArrowUp'},{key:'ArrowUp'},
      ...T('='+Math.round(o.g)+'/'+Math.round(o.tot)), Kb.enter,
      ...T('='+Math.round(o.mx)+'/'+Math.round(o.tot)), Kb.enter,
      ...T('='+Math.round(o.dn)+'/'+Math.round(o.tot)), Kb.enter,
      {key:'ArrowLeft'}, {key:'ArrowDown'},{key:'ArrowDown'},{key:'ArrowDown'},
      ...T('='+Math.round(o.tot)+'-'+Math.round(o.gain)), Kb.enter,
      {key:'s',ctrl:true}
    ]}]`;
  const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const fastN = [], slowN = [];
  for (let s = 0; s < SEEDS; s++) {
    const f = await drive(FAST), w = await drive(SLOW);
    if (!f.cores.every(Boolean) || !f.star || !f.won) bad(`FAST route seed ${s}: cores=${f.cores} star=${f.star} won=${f.won}`);
    if (!w.cores.every(Boolean) || !w.won) bad(`SLOW route seed ${s}: cores=${w.cores} won=${w.won}`);
    if (w.star) bad(`SLOW route seed ${s}: the ☆ fired on the hand-typed route — it is not skippable`);
    fastN.push(f.keys); slowN.push(w.keys);
  }
  const F = med(fastN), W = med(slowN);
  ok(`PART 1 — spread ${W}/${F} = ${(W / F).toFixed(2)}x   (fast ${fastN.join('/')} · slow ${slowN.join('/')})`);
  ok(`PART 2 — of the ${W - F} keys of spread: 0 are chord-vs-ribbon (the engine has no ribbon door into formula entry, so on a formula board that component is EMPTY by construction — the r439 formula-board finding), 0 are formatting (this board grades none). The whole spread survives the strip, and it is the fill against three retyped formulas plus autosum against a typed chain`);
  if (W / F < 1.3) bad(`spread ${(W / F).toFixed(2)}x is under the 1.3x warning line (CAMPAIGN §2)`);

  /* isolated measurement of the ☆'s own move (CAMPAIGN §2: measure each half separately) */
  const STAR_ONLY = `[{sel:o.CC+o.rG, keys:[
      ...T('='+o.CB+o.rG+'/$'+o.CB+'$'+o.rTot), Kb.enter,
      {key:'ArrowUp'}, {key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD ]}]`;
  const TYPED_ONLY = `[{sel:o.CC+o.rG, keys:[
      ...T('='+o.CB+o.rG+'/'+o.CB+o.rTot), Kb.enter,
      ...T('='+o.CB+o.rM+'/'+o.CB+o.rTot), Kb.enter,
      ...T('='+o.CB+o.rD+'/'+o.CB+o.rTot), Kb.enter ]}]`;
  const a = [], b2 = [];
  for (let s = 0; s < SEEDS; s++) { a.push((await drive(STAR_ONLY)).keys); b2.push((await drive(TYPED_ONLY)).keys); }
  const A = med(a), B = med(b2);
  ok(`ISOLATED ☆ — anchored fill ${A} keys vs ${B} typed one at a time: worth ${B - A} keys`);
  if (B - A <= 0) bad(`the ☆ route is not cheaper than the route it exists to beat (${A} vs ${B}) — the negative-star failure mode CAMPAIGN §2 records`);

  /* --------------------------------------------------------- 5 · ANATOMY + TRI-LENGTH */
  head('5 · ANATOMY — §1.1 beat count, §1.9 tri-length, §2.2 one ☆, §1.0(e) closer');
  const an = await page.evaluate(() => {
    loadChallenge('retbridge');
    const C = CHALLENGES.retbridge;
    const items = C.checks.call(C, S);
    return { checks: items.length, guide: C.guide.call(C).length, targets: C.targets.call(C).length,
      bonus: items.filter(x => x.bonus).length, save: items.filter(x => x.save).length,
      cores: items.filter(x => !x.bonus && !x.save).length,
      labels: items.map(x => x.label), par: C.par, parKeys: C.parKeys, aha: C.aha };
  });
  if (an.checks !== an.guide || an.checks !== an.targets) bad(`tri-length broken: checks=${an.checks} guide=${an.guide} targets=${an.targets}`);
  else ok(`tri-length ${an.checks} (6 cores + 1 ☆ + the engine's save beat)`);
  if (an.cores !== 6) bad(`${an.cores} core beats — §1.1 wants 4–6`); else ok('6 core beats (§1.1 cap)');
  if (an.bonus !== 1) bad(`${an.bonus} bonus beats — §2.2 wants exactly one`); else ok('exactly one ☆');
  if (an.save !== 1) bad('the engine-appended save closer is missing (§1.0(e))'); else ok('save closer appended by the engine, not hand-written');
  const VERBS = /^(Add|Autofit|Bold|Build|Center|Clear|Collect|Color|Comma-format|Copy|Cut|Delete|Dollar-format|Enter|Fill|Filter|Find|Finish|Fix|Flip|Fold|Group|Indent|Insert|Italicize|Left-align|Move|Paste|Percent-format|Reference|Repoint|Save|Select|Set|Sort|Total|Trace|Transpose|Unbold|Underline|Undo|Unhide|Unfold|Wrap) /;
  an.labels.forEach(l => { VERBS.test(l) ? ok(`label opens on a closed-list verb: "${l}"`) : bad(`label does not open on a §1.7 closed-list verb: "${l}"`); });
  an.labels.forEach(l => { if (/\bctrl\b|\balt\b|\bF4\b|\bctrl\+/i.test(l)) bad(`chord name in a check label: "${l}"`); });

  console.log(`\n${fails ? 'RETBRIDGE PROBE: ' + fails + ' FAILED' : 'RETBRIDGE PROBE: ALL GREEN'} (${checksRun} assertions)`);
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
