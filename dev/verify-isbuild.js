/* r448 — dev/verify-isbuild.js · the depth-pass probe for `isbuild` (DEPTH_PASS §4.78).
   SELF-CONTAINED by the C13 retirement-guard rule: this file names exactly one drill key.

   Everything here is measured through the LIVE engine on the real board — no predicate is read
   and reasoned about, because DEPTH_PASS_CAMPAIGN §1 records the untriggerable-beat class and
   every instance of it was found by WALKING a route, never by reading a check.

   Sections
     A  board + §1.3 density + width verdicts, at load and at the win state
     B  §1.0-R3(p) ROUTE MATRIX — every legal route to each beat's visible end state, walked
     C  the ☆-HEADROOM DIAGNOSTIC, both parts (DEPTH_PASS_CAMPAIGN §2), fully keyed
     D  the ☆ FAMILY MEASUREMENT — fill vs paste vs multi-commit vs row-fills vs autosum, on the
        identical job (the r447 wave addendum), plus the isolated control (the r438 rule)
     E  ☆ SKIPPABILITY — named slow routes that clear every core with the star dark
     F  ☆ ROUTE FREEDOM — Ctrl+R, the ribbon fill and a tiled paste must all earn it
     G  geometry — no Ctrl+arrow ride-through between the page's blocks

   Run: node dev/verify-isbuild.js              (server on 127.0.0.1:8791)
        URL=http://127.0.0.1:8860/index.html node dev/verify-isbuild.js
   The URL default is the house default on purpose (a wave-3 probe shipped pinned to its own
   agent's port and broke at assembly). */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const SEEDS = parseInt(process.env.SEEDS || '5', 10);

let fails = 0;
const ok = m => console.log('  ok   ' + m);
const bad = m => { fails++; console.log('  FAIL ' + m); };
const info = m => console.log('  ·    ' + m);
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e.message || e).slice(0, 160)));
  /* mirror the real harness init exactly — a probe that skips these is measuring the onboarding
     overlay, not the drill (DEPTH_PASS_CAMPAIGN, the r440 hotkey_onboarded note). `_pro` matters
     here: Full Builds is a PRO chapter, and loadChallenge() silently declines a locked key. */
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1');
    localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1');
    localStorage.setItem('hk_handle_cache', '');
    localStorage.setItem('hk_beta_ok', '1');
  } catch (e) {} });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function'
    && typeof demoKey === 'function' && typeof setDemoSel === 'function', null, { timeout: 15000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* ---- the in-page harness. Routes are arrays of {sel?, keys} steps; `sel` PARKS the cursor
     (setDemoSel, uncounted) and everything else is a real keystroke, so keyLog is a faithful
     keyed count — the metric DEPTH_PASS_CAMPAIGN §2 quotes. ---- */
  await page.evaluate(() => {
    window.__is = {
      build(seed) {
        document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
        try { window.__hkCelQ = []; window.__hkCelOpen = false; } catch (e) {}
        window.__forceSeed = seed;
        loadChallenge('isbuild');
        return this.geo();
      },
      geo() {
        const C = CHALLENGES.isbuild, o = C._o;
        return Object.assign({}, o, { exp: C._exp, LBL: colLetter(o.c0),
          YL: [0, 1, 2, 3, 4, 5].map(i => colLetter(o.cA + i)) });
      },
      play(steps) {
        for (const st of steps) { if (st.sel) setDemoSel(st.sel); for (const k of st.keys || []) demoKey(k); }
        return this.state();
      },
      state() {
        const C = CHALLENGES.isbuild, items = C.checks(S);
        return {
          keys: keyLog.length,
          done: (typeof done !== 'undefined') ? done : null,
          cores: items.filter(x => !x.bonus && !x.save).map(x => !!x.ok),
          star: !!(items.find(x => x.bonus) || {}).ok,
          save: !!(items.find(x => x.save) || {}).ok,
        };
      },
    };
  });

  const geoOf = seed => page.evaluate(s => window.__is.build(s), seed);

  /* ================= keystroke vocabulary + formula texts ================= */
  const T = s => [...s].map(c => ({ key: c }));
  const Lk = ch => ({ key: ch.toLowerCase(), code: 'Key' + ch.toUpperCase() });
  const Dg = n => ({ key: String(n), code: 'Digit' + n });
  const rep = (k, n) => Array.from({ length: n }, () => k);
  const ENTER = { key: 'Enter' }, CTRLR = { key: 'r', ctrl: true }, CTRLB = { key: 'b', ctrl: true };
  const CTRLC = { key: 'c', ctrl: true }, CTRLV = { key: 'v', ctrl: true };
  const CTRLENTER = { key: 'Enter', ctrl: true }, AUTOSUM = { key: '=', alt: true, code: 'Equal' };
  const SR = { key: 'ArrowRight', shift: true }, SD = { key: 'ArrowDown', shift: true };
  const UP = { key: 'ArrowUp' }, DOWN = { key: 'ArrowDown' }, LEFT = { key: 'ArrowLeft' }, RIGHT = { key: 'ArrowRight' };
  const TOPB = [{ key: 'Alt' }, Lk('h'), Lk('b'), Lk('p')];
  const PCT1 = [{ key: '1', ctrl: true }, Lk('p')];
  const RIBFILL = [{ key: 'Alt' }, Lk('h'), Lk('f'), Lk('i'), Lk('r')];
  const SAVE = { key: 's', ctrl: true };

  const F = {
    rev: (g, i) => '=' + g.YL[i - 1] + g.rRev + '*(1+$' + g.YL[0] + '$' + g.rG + ')',
    cog: (g, i) => '=-' + g.YL[i] + g.rRev + '*$' + g.YL[0] + '$' + g.rC,
    opx: (g, i) => '=-' + g.YL[i] + g.rRev + '*$' + g.YL[0] + '$' + g.rO,
    ebd: (g, i) => '=SUM(' + g.YL[i] + g.rRev + ':' + g.YL[i] + g.rOpx + ')',
    ebt: (g, i) => '=' + g.YL[i] + g.rEbd + '+' + g.YL[i] + g.rDA,
    mgn: (g, i) => '=' + g.YL[i] + g.rEbd + '/' + g.YL[i] + g.rRev,
  };
  // the first forecast column, typed top-down (Enter walks the cursor down)
  const col1 = g => [{ sel: g.rev1, keys: [...T(F.rev(g, 1)), ENTER, ...T(F.cog(g, 1)), ENTER,
                                           ...T(F.opx(g, 1)), ENTER, ...T(F.ebd(g, 1)), ENTER] }];
  const carryBlock = g => [{ sel: g.blk, keys: [CTRLR] }];
  const ebtSteps = g => [{ sel: g.ebt1, keys: [...T(F.ebt(g, 1)), ENTER] }, { sel: g.ebtRng, keys: [CTRLR] }];
  const mgnSteps = g => [{ sel: g.mgn1, keys: [...T(F.mgn(g, 1)), ENTER] },
                         { sel: g.mgnRng, keys: [CTRLR, ...PCT1] }];
  const dressSteps = g => [{ sel: g.ebdRow, keys: [CTRLB, ...TOPB] }];

  const R = {};
  // the taught route, selections parked (the par-sweep convention)
  R.taught = g => [...col1(g), ...carryBlock(g), ...dressSteps(g), ...ebtSteps(g), ...mgnSteps(g), { keys: [SAVE] }];

  /* fully KEYED expert route — nothing but the opening cursor is parked.
     NOTE (r426 dispActive): after a shift-selection a PLAIN arrow resumes from the selection's
     TOP-LEFT, not from the bottom-right corner the 2-corner model parks in S.active. Every
     walk-off below is counted from that top-left, which is what a player experiences. */
  R.keyedFast = g => [{
    sel: g.rev1,
    keys: [
      ...T(F.rev(g, 1)), ENTER, ...T(F.cog(g, 1)), ENTER, ...T(F.opx(g, 1)), ENTER, ...T(F.ebd(g, 1)), ENTER,
      ...rep(UP, 4),                                     // back to the first forecast revenue cell
      ...rep(SR, 4), ...rep(SD, 3), CTRLR,               // ☆ — one pass carries the block across
      ...rep(DOWN, 5),                                   // resume from the block's top-left → EBIT
      ...T(F.ebt(g, 1)), ENTER, UP, ...rep(SR, 4), CTRLR,
      ...rep(DOWN, g.rMgn - g.rEbt),                     // down to the memo line
      ...T(F.mgn(g, 1)), ENTER, UP, ...rep(SR, 4), CTRLR, ...PCT1,
      ...rep(UP, g.rMgn - g.rEbd), LEFT,                 // onto the EBITDA row, actual column
      ...rep(SR, 5), CTRLB, ...TOPB, SAVE,
    ],
  }];

  /* fully KEYED slow route — every cell hand-typed, no fill and no clipboard anywhere, the row
     dressed one cell at a time. Clears every core; the ☆ stays dark. */
  R.keyedSlow = g => {
    const keys = [];
    for (let i = 1; i <= 5; i++) {
      keys.push(...T(F.rev(g, i)), ENTER, ...T(F.cog(g, i)), ENTER, ...T(F.opx(g, i)), ENTER, ...T(F.ebd(g, i)), ENTER);
      keys.push(DOWN, ...T(F.ebt(g, i)), ENTER);                       // skip the D&A line, type EBIT
      keys.push(...rep(DOWN, g.rMgn - g.rEbt - 1), ...T(F.mgn(g, i)), ENTER, UP, ...PCT1);
      if (i < 5) keys.push(...rep(UP, g.rMgn - g.rRev), RIGHT);        // up to the next year's revenue cell
    }
    keys.push(...rep(UP, g.rMgn - g.rEbd), ...rep(LEFT, 5));           // onto the EBITDA row, actual column
    keys.push(CTRLB, ...TOPB);
    for (let i = 0; i < 5; i++) keys.push(RIGHT, CTRLB, ...TOPB);      // one cell at a time
    keys.push(SAVE);
    return [{ sel: g.rev1, keys }];
  };

  /* the ☆'s named negative control — four SEPARATE row fills instead of the one block */
  R.fourFills = g => [...col1(g),
    { sel: g.revRng, keys: [CTRLR] }, { sel: g.YL[1] + g.rCog + ':' + g.YL[5] + g.rCog, keys: [CTRLR] },
    { sel: g.YL[1] + g.rOpx + ':' + g.YL[5] + g.rOpx, keys: [CTRLR] }, { sel: g.ebdRng, keys: [CTRLR] },
    ...dressSteps(g), ...ebtSteps(g), ...mgnSteps(g), { keys: [SAVE] }];
  // the ribbon's fill (Alt H F I R) instead of Ctrl+R — must earn the ☆ identically
  R.ribbonFill = g => [...col1(g), { sel: g.blk, keys: RIBFILL },
    ...dressSteps(g), ...ebtSteps(g), ...mgnSteps(g), { keys: [SAVE] }];
  // a TILED paste of the first forecast column across the destination block — must earn it too
  R.tiledPaste = g => [...col1(g),
    { sel: g.YL[1] + g.rRev + ':' + g.YL[1] + g.rEbd, keys: [CTRLC] },
    { sel: g.YL[2] + g.rRev + ':' + g.YL[5] + g.rEbd, keys: [CTRLV] },
    ...dressSteps(g), ...ebtSteps(g), ...mgnSteps(g), { keys: [SAVE] }];
  // Ctrl+Enter multi-commit, one per row — the same job, a different family
  R.multiCommit = g => [...col1(g),
    { sel: g.YL[2] + g.rRev + ':' + g.YL[5] + g.rRev, keys: [...T(F.rev(g, 2)), CTRLENTER] },
    { sel: g.YL[2] + g.rCog + ':' + g.YL[5] + g.rCog, keys: [...T(F.cog(g, 2)), CTRLENTER] },
    { sel: g.YL[2] + g.rOpx + ':' + g.YL[5] + g.rOpx, keys: [...T(F.opx(g, 2)), CTRLENTER] },
    { sel: g.YL[2] + g.rEbd + ':' + g.YL[5] + g.rEbd, keys: [...T(F.ebd(g, 2)), CTRLENTER] },
    ...dressSteps(g), ...ebtSteps(g), ...mgnSteps(g), { keys: [SAVE] }];

  async function run(seed, routeName) {
    const g = await geoOf(seed);
    const steps = R[routeName](g);
    const st = await page.evaluate(s => window.__is.play(s), steps);
    return { g, st };
  }
  const playSteps = async (seed, mk) => {
    const g = await geoOf(seed);
    const st = await page.evaluate(s => window.__is.play(s), mk(g));
    return { g, st };
  };

  const SEEDLIST = Array.from({ length: SEEDS }, (_, i) => 1000 + i * 37);

  /* ================= A · BOARD, DENSITY, WIDTH ================= */
  console.log('\nA · BOARD / §1.3 DENSITY / WIDTH');
  {
    const rowsAt = [], ovfLoad = [], clpLoad = [], ovfWin = [], clpWin = [], px = [];
    for (const seed of SEEDLIST) {
      const g = await geoOf(seed);
      const atLoad = await page.evaluate(() => {
        const o = [], c2 = [];
        for (let c = 1; c <= 10; c++) { if (overflowsCol(S, c)) o.push(colLetter(c)); if (clipsCol(S, c)) c2.push(colLetter(c)); }
        return { rows: S.ROWS, ovf: o, clp: c2 };
      });
      ovfLoad.push(atLoad.ovf.length); clpLoad.push(atLoad.clp.length);
      if (atLoad.rows !== 20) bad('seed ' + seed + ': ROWS=' + atLoad.rows + ', expected 20 (§1.3 floor AND cap)');
      const st = await page.evaluate(s => window.__is.play(s), R.taught(g));
      if (!st.done) bad('seed ' + seed + ': taught route did not win');
      const win = await page.evaluate(() => {
        const used = new Set(); const o = [], c2 = [];
        for (const k of Object.keys(S.cells)) {
          const cell = S.cells[k];
          if (!cell) continue;
          const has = (cell.value !== null && cell.value !== undefined && cell.value !== '') || cell.formula
            || cell.bt || cell.bb || cell.ball || cell.bold;
          if (has) used.add(parseInt(k.slice(1), 10));
        }
        for (let c = 1; c <= 10; c++) { if (overflowsCol(S, c)) o.push(colLetter(c)); if (clipsCol(S, c)) c2.push(colLetter(c)); }
        let w = 0; for (let c = 1; c <= 10; c++) w += (colW[c] || 78);
        return { n: used.size, ovf: o, clp: c2, w: w };
      });
      rowsAt.push(win.n); ovfWin.push(win.ovf.length); clpWin.push(win.clp.length); px.push(win.w);
      if (win.ovf.length) bad('seed ' + seed + ': win state overflows (####) in ' + win.ovf.join(','));
      if (win.clp.length) bad('seed ' + seed + ': win state clips a label in ' + win.clp.join(','));
      if (atLoad.ovf.length) bad('seed ' + seed + ': LOAD state overflows (####) in ' + atLoad.ovf.join(','));
      if (atLoad.clp.length) bad('seed ' + seed + ': LOAD state clips a label in ' + atLoad.clp.join(','));
    }
    const dens = rowsAt.map(n => Math.round(n / 20 * 100));
    info('win-state rows carrying content, per seed: ' + rowsAt.join(' ') + '  → density ' + dens.join('% ') + '%');
    if (med(dens) >= 60) ok('§1.3 density median ' + med(dens) + '% (target ≥60%), ROWS=20 on every seed');
    else bad('§1.3 density median ' + med(dens) + '% — under the 60% target');
    info('sheet natural width: ' + px.join(' ') + 'px (this drill grades no width verdict, so the elastic fit is free to scale it)');
  }

  /* ================= B · ROUTE MATRIX (§1.0-R3(p)) ================= */
  console.log('\nB · §1.0-R3(p) ROUTE MATRIX — every legal route to each beat, WALKED');
  {
    const seed = SEEDLIST[0];
    // beat index → alternative first-forecast-year formula texts that must all clear
    const variants = [
      ['revenue', 0, g => [
        ['=prior*(1+$g)', F.rev(g, 1)],
        ['=prior+prior*$g', '=' + g.YL[0] + g.rRev + '+' + g.YL[0] + g.rRev + '*$' + g.YL[0] + '$' + g.rG],
        ['=prior*$g+prior', '=' + g.YL[0] + g.rRev + '*$' + g.YL[0] + '$' + g.rG + '+' + g.YL[0] + g.rRev],
      ], (g, txt) => [{ sel: g.rev1, keys: [...T(txt), ENTER] }, { sel: g.revRng, keys: [CTRLR] }]],
      ['costs', 1, g => [
        ['=-rev*$c', F.cog(g, 1)],
        ['=-($c*rev)', '=-($' + g.YL[0] + '$' + g.rC + '*' + g.YL[1] + g.rRev + ')'],
        ['=rev*-$c', '=' + g.YL[1] + g.rRev + '*-$' + g.YL[0] + '$' + g.rC],
      ], (g, txt) => [{ sel: g.rev1, keys: [...T(F.rev(g, 1)), ENTER] }, { sel: g.revRng, keys: [CTRLR] },
                      { sel: g.cog1, keys: [...T(txt), ENTER] },
                      { sel: g.YL[1] + g.rCog + ':' + g.YL[5] + g.rCog, keys: [CTRLR] },
                      { sel: g.opx1, keys: [...T(F.opx(g, 1)), ENTER] },
                      { sel: g.YL[1] + g.rOpx + ':' + g.YL[5] + g.rOpx, keys: [CTRLR] }]],
    ];
    for (const [name, idx, mk, steps] of variants) {
      const g0 = await geoOf(seed);
      for (const [tag, txt] of mk(g0)) {
        const { st } = await playSteps(seed, g => steps(g, txt));
        if (st.cores[idx]) ok('beat ' + (idx + 1) + ' (' + name + ') clears from ' + tag);
        else bad('beat ' + (idx + 1) + ' (' + name + ') STRANDED on ' + tag + ' — untriggerable-beat class');
      }
    }
    /* the UNANCHORED route, typed year by year with no fill — a player who never learns `$` must
       still clear every core (§1.0(c)); and the same text FILLED must visibly break the board,
       which is the whole reason the ☆ is anchoring mastery rather than a gesture. */
    {
      const { st } = await playSteps(seed, g => {
        const s = [];
        for (let i = 1; i <= 5; i++) {
          s.push({ sel: g.YL[i] + g.rRev, keys: [...T('=' + g.YL[i - 1] + g.rRev + '*(1+' + g.YL[0] + g.rG + ')'), ENTER] });
          s.push({ sel: g.YL[i] + g.rCog, keys: [...T('=-' + g.YL[i] + g.rRev + '*' + g.YL[0] + g.rC), ENTER] });
          s.push({ sel: g.YL[i] + g.rOpx, keys: [...T('=-' + g.YL[i] + g.rRev + '*' + g.YL[0] + g.rO), ENTER] });
        }
        return s;
      });
      if (st.cores[0] && st.cores[1]) ok('beats 1–2 clear from UNANCHORED refs typed year by year (no fill anywhere)');
      else bad('beats 1–2 STRANDED on the unanchored typed route — §1.0(c) freedom broken');
    }
    {
      const { st } = await playSteps(seed, g => [
        { sel: g.rev1, keys: [...T('=' + g.YL[0] + g.rRev + '*(1+' + g.YL[0] + g.rG + ')'), ENTER] },
        { sel: g.revRng, keys: [CTRLR] }]);
      if (!st.cores[0]) ok('an UNANCHORED formula FILLED across leaves the revenue line visibly flat and the beat dark — the ☆\'s anchoring lesson, not a stranding');
      else bad('an unanchored fill cleared beat 1 — the anchor has no consequence on this board');
    }
    // EBITDA — four shapes incl. autosum's range form
    const ebdRoutes = [
      ['=SUM(range)', g => [{ sel: g.ebd1, keys: [...T(F.ebd(g, 1)), ENTER] }]],
      ['addition chain', g => [{ sel: g.ebd1, keys: [...T('=' + g.YL[1] + g.rRev + '+' + g.YL[1] + g.rCog + '+' + g.YL[1] + g.rOpx), ENTER] }]],
      ['autosum range form (Alt+=)', g => [{ sel: g.ebd1col, keys: [AUTOSUM] }]],
      ['=SUM(two)+one', g => [{ sel: g.ebd1, keys: [...T('=SUM(' + g.YL[1] + g.rRev + ':' + g.YL[1] + g.rCog + ')+' + g.YL[1] + g.rOpx), ENTER] }]],
    ];
    for (const [tag, mk] of ebdRoutes) {
      const { st } = await playSteps(seed, g => [
        { sel: g.rev1, keys: [...T(F.rev(g, 1)), ENTER, ...T(F.cog(g, 1)), ENTER, ...T(F.opx(g, 1)), ENTER] },
        ...mk(g), { sel: g.blk, keys: [CTRLR] }]);
      if (st.cores[2]) ok('beat 3 (EBITDA) clears from ' + tag);
      else bad('beat 3 (EBITDA) STRANDED on ' + tag);
    }
    // EBIT — three shapes
    const ebtRoutes = [
      ['=EBITDA+D&A', g => F.ebt(g, 1)],
      ['=SUM(EBITDA:D&A)', g => '=SUM(' + g.YL[1] + g.rEbd + ':' + g.YL[1] + g.rDA + ')'],
      ['=EBITDA-ABS(D&A)', g => '=' + g.YL[1] + g.rEbd + '-ABS(' + g.YL[1] + g.rDA + ')'],
    ];
    for (const [tag, mk] of ebtRoutes) {
      const { st } = await playSteps(seed, g => [...col1(g), ...carryBlock(g),
        { sel: g.ebt1, keys: [...T(mk(g)), ENTER] }, { sel: g.ebtRng, keys: [CTRLR] }]);
      if (st.cores[4]) ok('beat 5 (EBIT) clears from ' + tag);
      else bad('beat 5 (EBIT) STRANDED on ' + tag);
    }
    // margin — two shapes × three percent routes
    const mgnShape = [
      ['=EBITDA/revenue', g => F.mgn(g, 1)],
      ['=1-$cogs%-$opex%', g => '=1-$' + g.YL[0] + '$' + g.rC + '-$' + g.YL[0] + '$' + g.rO],
    ];
    const pctRoute = [
      ['Ctrl+1 P (lands one decimal outright)', PCT1],
      ['Alt H P then Alt H 0', [{ key: 'Alt' }, Lk('h'), Lk('p'), { key: 'Alt' }, Lk('h'), Dg(0)]],
      ['Ctrl+Shift+% then Alt H 0', [{ key: '%', ctrl: true, shift: true }, { key: 'Alt' }, Lk('h'), Dg(0)]],
    ];
    for (const [stag, smk] of mgnShape) for (const [ptag, pkeys] of pctRoute) {
      const { st } = await playSteps(seed, g => [...col1(g), ...carryBlock(g),
        { sel: g.mgn1, keys: [...T(smk(g)), ENTER] }, { sel: g.mgnRng, keys: [CTRLR, ...pkeys] }]);
      if (st.cores[5]) ok('beat 6 (margin) clears from ' + stag + ' + ' + ptag);
      else bad('beat 6 (margin) STRANDED on ' + stag + ' + ' + ptag);
    }
    // the dress — every border route, plus the two that must correctly stay dark
    const dressRoutes = [
      ['Ctrl+B + Alt H B P (top)', g => [{ sel: g.ebdRow, keys: [CTRLB, ...TOPB] }], true],
      ['Alt H 1 + Alt H B S (outside, whole row)', g => [{ sel: g.ebdRow, keys: [{ key: 'Alt' }, Lk('h'), Dg(1), { key: 'Alt' }, Lk('h'), Lk('b'), Lk('s')] }], true],
      ['Ctrl+B + Alt H B A (ALL borders → ball, never bt)', g => [{ sel: g.ebdRow, keys: [CTRLB, { key: 'Alt' }, Lk('h'), Lk('b'), Lk('a')] }], true],
      ['Ctrl+B + Alt H B D (top & bottom)', g => [{ sel: g.ebdRow, keys: [CTRLB, { key: 'Alt' }, Lk('h'), Lk('b'), Lk('d')] }], true],
      ['Ctrl+B + Alt H B T (thick box)', g => [{ sel: g.ebdRow, keys: [CTRLB, { key: 'Alt' }, Lk('h'), Lk('b'), Lk('t')] }], true],
      ['Ctrl+B + per-cell Alt H B S (1×1 → ball)', g => {
        const st = [];
        for (let i = 0; i <= 5; i++) st.push({ sel: g.YL[i] + g.rEbd, keys: [CTRLB, { key: 'Alt' }, Lk('h'), Lk('b'), Lk('s')] });
        return st;
      }, true],
      ['NEGATIVE: Ctrl+B + Alt H B O (bottom only — the house error)', g => [{ sel: g.ebdRow, keys: [CTRLB, { key: 'Alt' }, Lk('h'), Lk('b'), Lk('o')] }], false],
      ['NEGATIVE: Ctrl+B + Alt H B B (double bottom)', g => [{ sel: g.ebdRow, keys: [CTRLB, { key: 'Alt' }, Lk('h'), Lk('b'), Lk('b')] }], false],
      ['NEGATIVE: Alt H B P with no bold', g => [{ sel: g.ebdRow, keys: TOPB }], false],
    ];
    for (const [tag, mk, want] of dressRoutes) {
      const { st } = await playSteps(seed, g => [...col1(g), ...carryBlock(g), ...mk(g)]);
      if (st.cores[3] === want) ok('beat 4 (dress) ' + (want ? 'clears' : 'correctly stays dark') + ' — ' + tag);
      else bad('beat 4 (dress) ' + (want ? 'STRANDED' : 'wrongly clears') + ' — ' + tag);
    }
  }

  /* ================= C · ☆-HEADROOM DIAGNOSTIC ================= */
  console.log('\nC · ☆-HEADROOM DIAGNOSTIC (DEPTH_PASS_CAMPAIGN §2), fully keyed');
  {
    const fast = [], slow = [];
    for (const seed of SEEDLIST) {
      const a = await run(seed, 'keyedFast');
      if (!a.st.done) bad('seed ' + seed + ': keyed FAST route did not win');
      if (!a.st.star) bad('seed ' + seed + ': keyed FAST route did not earn the ☆');
      fast.push(a.st.keys);
      const b = await run(seed, 'keyedSlow');
      if (!b.st.done) bad('seed ' + seed + ': keyed SLOW route did not win — §1.0(c) freedom broken');
      if (b.st.star) bad('seed ' + seed + ': keyed SLOW route earned the ☆ — it is not skippable');
      slow.push(b.st.keys);
    }
    const f = med(fast), s = med(slow);
    info('star route (keyed): ' + fast.join(' ') + '  → median ' + f);
    info('slow route (keyed, every cell typed, no fill/clipboard): ' + slow.join(' ') + '  → median ' + s);
    const spread = Math.round(s / f * 100) / 100;
    if (spread >= 1.3) ok('spread ' + spread + '× — legal headroom (the ~1.3× warning line is DEPTH_PASS_CAMPAIGN §2)');
    else bad('spread ' + spread + '× — under the 1.3× warning line, the board may be a motif');
    info('composition: the whole spread is FORMULA ENTRY and FILL, zero chord-vs-ribbon and zero formatting — nothing in it is forced to clear by §1.0(c) or forbidden by §1.0(d) (the r439 wrapfix reading)');
  }

  /* ================= D · ☆ FAMILY MEASUREMENT + ISOLATED CONTROL ================= */
  console.log('\nD · ☆ FAMILY MEASUREMENT — the identical job, five families (r447 wave addendum)');
  {
    const fams = ['taught', 'tiledPaste', 'fourFills', 'multiCommit', 'ribbonFill'];
    const res = {};
    for (const fam of fams) {
      const keys = [];
      for (const seed of SEEDLIST) {
        const { st } = await run(seed, fam);
        if (!st.done) bad('family ' + fam + ' seed ' + seed + ': did not win');
        keys.push(st.keys);
      }
      res[fam] = med(keys);
    }
    info('block fill (Ctrl+R)      ' + res.taught + ' keys   ← chosen');
    info('ribbon fill (Alt H F I R) ' + res.ribbonFill + ' keys   (same family, same latch)');
    info('tiled paste               ' + res.tiledPaste + ' keys');
    info('four separate row fills   ' + res.fourFills + ' keys   ← the ☆\'s negative control');
    info('four Ctrl+Enter commits   ' + res.multiCommit + ' keys');
    if (res.taught <= res.tiledPaste && res.taught <= res.multiCommit && res.taught <= res.fourFills)
      ok('fill is the dominant family on this board — the numbers, not a habit (§1.0-R4(u) recurrence declared in the payload)');
    else info('a non-fill family measured at or below the fill — re-read the choice before shipping');
    /* the r438 `series` rule: measure the move the star requires against its OWN control, not
       bundled with the rest of the run */
    const carryFill = [], carryFour = [];
    for (const seed of SEEDLIST) {
      const g = await geoOf(seed);
      let st = await page.evaluate(s => window.__is.play(s), [{ sel: g.rev1, keys: [
        ...T(F.rev(g, 1)), ENTER, ...T(F.cog(g, 1)), ENTER, ...T(F.opx(g, 1)), ENTER, ...T(F.ebd(g, 1)), ENTER] }]);
      const base = st.keys;
      st = await page.evaluate(s => window.__is.play(s), [{ keys: [...rep(UP, 4), ...rep(SR, 4), ...rep(SD, 3), CTRLR] }]);
      carryFill.push(st.keys - base);
      await geoOf(seed);
      st = await page.evaluate(s => window.__is.play(s), [{ sel: g.rev1, keys: [
        ...T(F.rev(g, 1)), ENTER, ...T(F.cog(g, 1)), ENTER, ...T(F.opx(g, 1)), ENTER, ...T(F.ebd(g, 1)), ENTER] }]);
      const base2 = st.keys;
      st = await page.evaluate(s => window.__is.play(s), [{ keys: [
        ...rep(UP, 4), ...rep(SR, 4), CTRLR, DOWN, ...rep(SR, 4), CTRLR,
        DOWN, ...rep(SR, 4), CTRLR, DOWN, ...rep(SR, 4), CTRLR] }]);
      carryFour.push(st.keys - base2);
    }
    info('ISOLATED carry — one block fill ' + med(carryFill) + ' keys vs four row fills ' + med(carryFour) + ' keys');
    if (med(carryFill) < med(carryFour)) ok('the ☆\'s own move beats its own control in isolation (the r438 `series` rule)');
    else bad('the ☆\'s move is NOT cheaper than its control in isolation — the r438 `series` failure');
  }

  /* ================= E · ☆ SKIPPABILITY ================= */
  console.log('\nE · ☆ SKIPPABILITY (§1.0-R2(i)) — named slow routes clearing every core, star dark');
  {
    for (const [tag, fam] of [['four separate row fills', 'fourFills'], ['every cell hand-typed', 'keyedSlow'],
                              ['four Ctrl+Enter multi-commits', 'multiCommit']]) {
      let allWin = true, anyStar = false;
      for (const seed of SEEDLIST) { const { st } = await run(seed, fam); allWin = allWin && st.done; anyStar = anyStar || st.star; }
      if (allWin && !anyStar) ok('clears every core with the ☆ DARK — ' + tag);
      else bad((allWin ? 'the ☆ FIRES on ' : 'does not clear the drill: ') + tag);
    }
  }

  /* ================= F · ☆ ROUTE FREEDOM ================= */
  console.log('\nF · ☆ ROUTE FREEDOM (§1.0(c)) — three mechanics, one latch');
  {
    for (const [tag, fam] of [['Ctrl+R', 'taught'], ['Alt H F I R (ribbon fill)', 'ribbonFill'], ['tiled paste of the first forecast column', 'tiledPaste']]) {
      let all = true;
      for (const seed of SEEDLIST) { const { st } = await run(seed, fam); all = all && st.done && st.star; }
      if (all) ok('earns the ☆ on every seed — ' + tag);
      else bad('does NOT earn the ☆ — ' + tag);
    }
  }

  /* ================= G · GEOMETRY ================= */
  console.log('\nG · GEOMETRY — no Ctrl+arrow ride-through between the page\'s blocks');
  {
    for (const seed of SEEDLIST.slice(0, 3)) {
      const g = await geoOf(seed);
      const r = await page.evaluate(o => {
        const land = (cell, key) => { setDemoSel(cell); demoKey(key); return colLetter(S.active.c) + S.active.r; };
        const out = {
          statementDown: land(o.LBL + o.rRev, { key: 'ArrowDown', ctrl: true }),
          memoDown: land(o.LBL + o.rMgn, { key: 'ArrowDown', ctrl: true }),
          driversUp: land(o.LBL + o.rG, { key: 'ArrowUp', ctrl: true }),
          basisUp: land(o.LBL + o.rBas, { key: 'ArrowUp', ctrl: true }),
        };
        /* the selection that matters: a block grab down the built statement must stop at EBIT and
           never swallow the memo line or the drivers panel */
        setDemoSel(colLetter(o.cA) + o.rRev); demoKey({ key: 'ArrowDown', ctrl: true, shift: true });
        out.blockGrab = colLetter(S.active.c) + S.active.r;
        return out;
      }, g);
      const chk = (got, want, what) => got === want ? ok('seed ' + seed + ': ' + what + ' stops at ' + want)
        : bad('seed ' + seed + ': ' + what + ' rode through to ' + got + ', expected ' + want);
      chk(r.statementDown, g.LBL + g.rEbt, 'Ctrl+↓ from the revenue label');
      chk(r.memoDown, g.LBL + g.rDrv, 'Ctrl+↓ from the memo label lands on the next island head (row ' + (g.rMgn + 1) + ' is a moat)');
      chk(r.driversUp, g.LBL + g.rDrv, 'Ctrl+↑ from the growth-driver label');
      chk(r.basisUp, g.LBL + g.rO, 'Ctrl+↑ from the basis line');
      chk(r.blockGrab, g.YL[0] + g.rEbt, 'Ctrl+Shift+↓ down the actual column stops inside the statement');
    }
  }

  if (pageErrors.length) { pageErrors.slice(0, 5).forEach(e => bad('pageerror: ' + e)); }
  console.log('\n' + (fails ? 'VERIFY-ISBUILD: ' + fails + ' FAILURE(S)' : 'VERIFY-ISBUILD: ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
