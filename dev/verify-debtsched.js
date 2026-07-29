/* r447 — dev/verify-debtsched.js · the depth-pass probe for `debtsched` (DEPTH_PASS §4.76).
   SELF-CONTAINED by the C13 retirement-guard rule: this file names exactly one drill key.

   Everything here is measured through the LIVE engine on the real board — no predicate is read
   and reasoned about, because DEPTH_PASS_CAMPAIGN §1 records eighteen untriggerable beats and
   every single one was found by WALKING a route, never by reading a check.

   Sections
     A  board + §1.3 density + width, at load and at the win state
     B  §1.0-R3(p) ROUTE MATRIX — every legal route to each beat's visible end state, walked
     C  the ☆-HEADROOM DIAGNOSTIC, both parts (DEPTH_PASS_CAMPAIGN §2), fully keyed
     D  the ☆ measured ISOLATED against its own controls (the r438 `series` rule)
     E  ☆ SKIPPABILITY — named slow routes that clear every core with the star dark
     F  ☆ ROUTE FREEDOM — Ctrl+R, the ribbon fill and a tiled paste must all earn it
     G  geometry — no Ctrl+arrow ride-through between the page's blocks

   Run: node dev/verify-debtsched.js            (server on 127.0.0.1:8791)
        URL=http://127.0.0.1:8807/index.html node dev/verify-debtsched.js
   The URL default is the house default on purpose (a wave-3 probe shipped pinned to its own
   agent's port and broke at assembly). */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const SEEDS = parseInt(process.env.SEEDS || '5', 10);

let fails = 0;
const ok  = m => console.log('  ok   ' + m);
const bad = m => { fails++; console.log('  FAIL ' + m); };
const info = m => console.log('  ·    ' + m);
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e.message || e).slice(0, 160)));
  /* mirror the real harness init exactly — a probe that skips these is measuring the onboarding
     overlay, not the drill (DEPTH_PASS_CAMPAIGN, the r440 hotkey_onboarded note) */
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

  /* ---- the in-page harness. Routes are written as arrays of {sel?, keys} steps; `sel` PARKS
     the cursor (setDemoSel, uncounted) and everything else is a real keystroke, so keyLog is a
     faithful keyed count — the metric DEPTH_PASS_CAMPAIGN §2 quotes. ---- */
  await page.evaluate(() => {
    window.__ds = {
      build(seed) {
        document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
        try { window.__hkCelQ = []; window.__hkCelOpen = false; } catch (e) {}
        window.__forceSeed = seed;
        loadChallenge('debtsched');
        return this.geo();
      },
      geo() {
        const C = CHALLENGES.debtsched, o = C._o;
        return Object.assign({}, o, { ratePct: C._ratePct, exp: C._exp,
          YL: [0, 1, 2, 3, 4].map(i => colLetter(o.cY0 + i)), LBL: colLetter(o.c0) });
      },
      play(steps) {
        for (const st of steps) { if (st.sel) setDemoSel(st.sel); for (const k of st.keys || []) demoKey(k); }
        return this.state();
      },
      state() {
        const C = CHALLENGES.debtsched, items = C.checks(S);
        return {
          keys: keyLog.length,
          done: (typeof done !== 'undefined') ? done : null,
          cores: items.filter(x => !x.bonus && !x.save).map(x => !!x.ok),
          star: !!(items.find(x => x.bonus) || {}).ok,
          save: !!(items.find(x => x.save) || {}).ok,
          labels: items.map(x => x.label),
        };
      },
      /* keystroke vocabulary, built from the page's own helpers so no chord is re-derived */
      T: s => [...s].map(c => ({ key: c })),
      L: ch => ({ key: ch.toLowerCase(), code: 'Key' + ch.toUpperCase() }),
      rep: (k, n) => Array.from({ length: n }, () => k),
    };
  });

  const geoOf = seed => page.evaluate(s => window.__ds.build(s), seed);

  /* ================= ROUTE LIBRARY (built node-side, played page-side) ================= */
  // each builder takes the geometry and returns {steps, note}
  const F = {
    // formula texts for a given year column index i (0 = first year)
    am:  (g, i) => '=-' + g.YL[i] + g.rBeg + '*$' + g.YL[0] + '$' + g.rRate,
    sw:  (g, i) => '=-MIN(' + g.YL[i] + g.rBeg + '+' + g.YL[i] + g.rAm + ',MAX(0,' + g.YL[i] + g.rCash + '))',
    end: (g, i) => '=' + g.YL[i] + g.rBeg + '+' + g.YL[i] + g.rAm + '+' + g.YL[i] + g.rSw,
    int: (g, i) => '=-$' + g.YL[0] + '$' + g.rIr + '*' + g.YL[i] + g.rBeg,
    lnk: (g, i) => '=' + g.YL[i - 1] + g.rEnd,
  };
  const T = s => [...s].map(c => ({ key: c }));
  const Lk = ch => ({ key: ch.toLowerCase(), code: 'Key' + ch.toUpperCase() });
  const rep = (k, n) => Array.from({ length: n }, () => k);
  const ENTER = { key: 'Enter' }, CTRLR = { key: 'r', ctrl: true }, CTRLB = { key: 'b', ctrl: true };
  const SR = { key: 'ArrowRight', shift: true }, SD = { key: 'ArrowDown', shift: true };
  const UP = { key: 'ArrowUp' }, DOWN = { key: 'ArrowDown' }, LEFT = { key: 'ArrowLeft' }, RIGHT = { key: 'ArrowRight' };
  const CUP = { key: 'ArrowUp', ctrl: true }, CLEFT = { key: 'ArrowLeft', ctrl: true };
  const BLUE = [{ key: 'Alt' }, Lk('h'), Lk('f'), Lk('c'), RIGHT, RIGHT, RIGHT, RIGHT, ENTER];
  const TOPB = [{ key: 'Alt' }, Lk('h'), Lk('b'), Lk('p')];
  const SAVE = { key: 's', ctrl: true };

  // the four first-year formulas, typed top-down (Enter walks the cursor down the block)
  const col1 = g => [{ sel: g.am0, keys: [...T(F.am(g, 0)), ENTER, ...T(F.sw(g, 0)), ENTER,
                                          ...T(F.end(g, 0)), ENTER, ...T(F.int(g, 0)), ENTER] }];
  const rateSteps = g => [{ sel: g.rate, keys: [...T(g.ratePct + '%'), ENTER, UP, ...BLUE] }];
  const dressSteps = g => [{ sel: g.endRng, keys: [CTRLB, ...TOPB] }];
  const linkSteps = g => [{ sel: g.begL1, keys: [...T(F.lnk(g, 1)), ENTER] },
                          { sel: g.begRest, keys: [CTRLR] }];

  /* --- ROUTES --- */
  const R = {};
  // the taught route, selections parked (the par-sweep convention)
  R.taught = g => [...rateSteps(g), ...col1(g), { sel: g.blk, keys: [CTRLR] }, ...linkSteps(g),
                   ...dressSteps(g), { keys: [SAVE] }];
  /* fully KEYED expert route — nothing but the opening cursor is parked.
     NOTE (r426 dispActive): after a shift-selection a PLAIN arrow resumes from the selection's
     TOP-LEFT, not from S.active's bottom-right corner. Every walk-off below is counted from
     that top-left, which is what a player actually experiences. */
  R.keyedFast = g => [{
    sel: g.rate,
    keys: [
      ...T(g.ratePct + '%'), ENTER, UP, ...BLUE,          // beat 1
      CUP, DOWN,                                          // ↑ to the opening balance, ↓ onto amortization
      ...T(F.am(g, 0)), ENTER, ...T(F.sw(g, 0)), ENTER, ...T(F.end(g, 0)), ENTER, ...T(F.int(g, 0)), ENTER,
      CUP, ...rep(UP, 3),                                 // back to the amortization row
      ...rep(SR, 4), ...rep(SD, 3), CTRLR,                // ☆ — one pass takes the block across
      UP, RIGHT,                                          // resume from the block's top-left → the second year's beginning cell
      ...T(F.lnk(g, 1)), ENTER, UP, ...rep(SR, 3), CTRLR, // the roll link, carried across
      ...rep(DOWN, g.rEnd - g.rBeg), LEFT,                // down to the ending row, back one column
      ...rep(SR, 4), CTRLB, ...TOPB, SAVE,
    ],
  }];
  // fully KEYED slow route — every cell hand-typed, no fill and no clipboard anywhere,
  // the ribbon walk for the colour and a cell-at-a-time dress. Clears every core; ☆ stays dark.
  R.keyedSlow = g => {
    const keys = [...T(g.ratePct + '%'), ENTER, UP, ...BLUE, CUP, DOWN];
    for (let i = 0; i < 5; i++) {
      if (i > 0) keys.push(...rep(UP, 1));                       // onto this column's beginning cell
      if (i > 0) keys.push(...T(F.lnk(g, i)), ENTER);            // beginning = prior ending
      keys.push(...T(F.am(g, i)), ENTER, ...T(F.sw(g, i)), ENTER,
                ...T(F.end(g, i)), ENTER, ...T(F.int(g, i)), ENTER);
      if (i < 4) keys.push(...rep(UP, 4), RIGHT);                // to the next year's amortization cell
    }
    keys.push(...rep(UP, 2), ...rep(LEFT, 4));                   // walk back onto the ending row, first year
    keys.push(CTRLB);
    for (let i = 1; i < 5; i++) keys.push(RIGHT, CTRLB);         // bold one cell at a time
    keys.push(...rep(LEFT, 4));
    for (let i = 0; i < 5; i++) { keys.push(...TOPB); if (i < 4) keys.push(RIGHT); }
    keys.push(SAVE);
    return [{ sel: g.rate, keys }];
  };
  // four SEPARATE row fills instead of the block — the ☆'s named negative control
  R.fourFills = g => [...rateSteps(g), ...col1(g),
    { sel: g.amRng, keys: [CTRLR] }, { sel: g.swRng, keys: [CTRLR] },
    { sel: g.endRng, keys: [CTRLR] }, { sel: g.intRng, keys: [CTRLR] },
    ...linkSteps(g), ...dressSteps(g), { keys: [SAVE] }];
  // the ribbon's fill (Alt H F I R) instead of Ctrl+R — must earn the ☆ identically
  R.ribbonFill = g => [...rateSteps(g), ...col1(g),
    { sel: g.blk, keys: [{ key: 'Alt' }, Lk('h'), Lk('f'), Lk('i'), Lk('r')] },
    ...linkSteps(g), ...dressSteps(g), { keys: [SAVE] }];
  // a TILED paste of the first-year column across the destination block — must earn it too
  R.tiledPaste = g => [...rateSteps(g), ...col1(g),
    { sel: g.am0 + ':' + g.YL[0] + g.rInt, keys: [{ key: 'c', ctrl: true }] },
    { sel: g.YL[1] + g.rAm + ':' + g.YL[4] + g.rInt, keys: [{ key: 'v', ctrl: true }] },
    ...linkSteps(g), ...dressSteps(g), { keys: [SAVE] }];

  const play = (seed, route) => page.evaluate(async ([s, steps]) => {
    window.__ds.build(s); return window.__ds.play(steps);
  }, [seed, null]);

  // helper that builds, then plays a node-built route against the page geometry
  async function run(seed, routeName) {
    const g = await geoOf(seed);
    const steps = R[routeName](g);
    const st = await page.evaluate(s => window.__ds.play(s), steps);
    return { g, st };
  }

  const SEEDLIST = Array.from({ length: SEEDS }, (_, i) => 1000 + i * 37);

  /* ================= A · BOARD, DENSITY, WIDTH ================= */
  console.log('\nA · BOARD / §1.3 DENSITY / WIDTH');
  {
    const rows = [];
    for (const seed of SEEDLIST) {
      const { g, st } = await run(seed, 'taught');
      const m = await page.evaluate((o) => {
        const rowsWith = new Set();
        for (const k in S.cells) { const c = S.cells[k];
          if (!c) continue;
          const hit = (c.value !== null && c.value !== undefined && c.value !== '') || c.formula || c.bt || c.bb || c.ball || c.fill;
          if (hit) rowsWith.add(parseInt(k.slice(1), 10)); }
        // width verdicts, unscaled (r441): no #### anywhere, no clipped label
        let ovf = 0, clip = 0;
        for (let c = 1; c <= 10; c++) { if (typeof overflowsCol === 'function' && overflowsCol(S, c)) ovf++;
          if (typeof clipsCol === 'function' && clipsCol(S, c)) clip++; }
        return { ROWS: S.ROWS, dens: rowsWith.size, ovf, clip, nCash: o.nCash };
      }, g);
      rows.push(m);
      if (m.ROWS !== 20) bad('ROWS=' + m.ROWS + ' (§1.3: 20 is floor AND cap)');
      if (m.ovf) bad('seed ' + seed + ': ' + m.ovf + ' column(s) print #### at the win state');
      if (m.clip) bad('seed ' + seed + ': ' + m.clip + ' label column(s) clipped at the win state');
      if (!st.done) bad('seed ' + seed + ': taught route did not WIN');
    }
    const d = rows.map(r => r.dens);
    const pc = Math.round(100 * med(d) / 20);
    info('win-state density ' + med(d) + '/20 = ' + pc + '%  (range ' + Math.min(...d) + '–' + Math.max(...d) + ')');
    if (pc >= 60) ok('§1.3 density ' + pc + '% ≥ 60% target'); else bad('§1.3 density ' + pc + '% under the 60% target');
    if (rows.every(r => r.ROWS === 20)) ok('ROWS=20 on every seed');
    if (!rows.some(r => r.ovf || r.clip)) ok('no #### and no clipped label at the win state (unscaled, r441 verdicts)');
    const cashes = new Set(rows.map(r => r.nCash));
    info('cash-block jitter observed: nCash ∈ {' + [...cashes].join(',') + '}');
  }

  /* ================= B · ROUTE MATRIX (§1.0-R3(p)) ================= */
  console.log('\nB · §1.0-R3(p) ROUTE MATRIX — every legal route to the same visible board');
  {
    const seed = SEEDLIST[0];
    const g = await geoOf(seed);
    // variant routes: each replaces ONE beat's route, the rest stays taught
    const V = [
      ['beat 1 · the rate typed bare into the percent-formatted cell (engine auto-scales)',
        [{ sel: g.rate, keys: [...T(String(g.ratePct)), ENTER, UP, ...BLUE] }], 0],
      ['beat 2 · the RATE HARDCODED INSIDE the amortization formula (values identical)',
        [{ sel: g.am0, keys: [...T('=-' + g.YL[0] + g.rBeg + '*' + (g.ratePct / 100)), ENTER] }], 1],
      ['beat 2 · a ROUND-wrapped amortization line',
        [{ sel: g.am0, keys: [...T('=ROUND(-' + g.YL[0] + g.rBeg + '*$' + g.YL[0] + '$' + g.rRate + ',6)'), ENTER] }], 1],
      ['beat 3 · the sweep floored with IF instead of MAX',
        [{ sel: g.sw0, keys: [...T('=-MIN(' + g.YL[0] + g.rBeg + '+' + g.YL[0] + g.rAm + ',IF(' + g.YL[0] + g.rCash + '>0,' + g.YL[0] + g.rCash + ',0))'), ENTER] }], 2],
      ['beat 3 · the whole sweep wrapped in an outer IF',
        [{ sel: g.sw0, keys: [...T('=IF(' + g.YL[0] + g.rCash + '<0,0,-MIN(' + g.YL[0] + g.rBeg + '+' + g.YL[0] + g.rAm + ',' + g.YL[0] + g.rCash + '))'), ENTER] }], 2],
      ['beat 4 · interest written balance-first',
        [{ sel: g.int0, keys: [...T('=-' + g.YL[0] + g.rBeg + '*$' + g.YL[0] + '$' + g.rIr), ENTER] }], 3],
      ['beat 5 · the roll link written with full anchors',
        [{ sel: g.begL1, keys: [...T('=$' + g.YL[0] + '$' + g.rEnd), ENTER] },
         { sel: g.begL1, keys: [...T('=' + g.YL[0] + g.rEnd), ENTER] }], 4],
      ['beat 5 · the roll link written as SUM of the prior ending cell',
        [{ sel: g.begL1, keys: [...T('=SUM(' + g.YL[0] + g.rEnd + ')'), ENTER] }], 4],
      ['beat 6 · bold via Alt H 1 and the border via the OUTSIDE-border chord Alt H B S',
        [{ sel: g.endRng, keys: [{ key: 'Alt' }, Lk('h'), { key: '1', code: 'Digit1' },
                                 { key: 'Alt' }, Lk('h'), Lk('b'), Lk('s')] }], 5],
      ['beat 6 · the top-AND-bottom border chord Alt H B D',
        [{ sel: g.endRng, keys: [CTRLB, { key: 'Alt' }, Lk('h'), Lk('b'), Lk('d')] }], 5],
      ['beat 6 · the row dressed INCLUDING its label cell',
        [{ sel: g.LBL + g.rEnd + ':' + g.YL[4] + g.rEnd, keys: [CTRLB, ...TOPB] }], 5],
    ];
    for (const [name, patch, beat] of V) {
      const base = R.taught(g);
      // splice: run the taught route but swap in the variant for the beat it replaces
      const steps = base.filter(s => {
        if (beat === 0) return s.sel !== g.rate;
        if (beat === 1) return true;   // col1 is one blob; the variant re-writes the cell afterwards
        if (beat === 5) return s.sel !== g.endRng;
        return true;
      });
      const seq = beat === 0 ? [...patch, ...steps]
                : beat === 5 ? [...steps.slice(0, steps.length - 1), ...patch, { keys: [SAVE] }]
                : [...steps.slice(0, steps.length - 1), ...patch, { sel: g.blk, keys: [CTRLR] },
                   ...linkSteps(g), { keys: [SAVE] }];
      const st = await page.evaluate(async ([s, q]) => { window.__ds.build(s); return window.__ds.play(q); },
        [seed, seq]);
      if (st.cores[beat]) ok(name);
      else bad(name + ' — beat ' + (beat + 1) + ' stayed DARK on a correct board (untriggerable-beat class)');
    }
    // the ONE deliberate negative: re-deriving the beginning balance instead of linking it
    {
      const seq = [...R.taught(g).slice(0, -1)];
      const patch = [{ sel: g.begL1, keys: [...T('=' + g.YL[0] + g.rBeg + '+' + g.YL[0] + g.rAm + '+' + g.YL[0] + g.rSw), ENTER] },
                     { sel: g.begRest, keys: [CTRLR] }];
      const st = await page.evaluate(async ([s, q]) => { window.__ds.build(s); return window.__ds.play(q); },
        [seed, [...seq, ...patch, { keys: [SAVE] }]]);
      if (!st.cores[4]) ok('beat 5 · a RE-DERIVED beginning balance is correctly refused (MODELING_STANDARDS §3 — the link is the lesson)');
      else bad('beat 5 accepted a re-derived beginning balance — the roll link is not being graded');
    }
  }

  /* ================= C · ☆-HEADROOM DIAGNOSTIC, both parts ================= */
  console.log('\nC · ☆-HEADROOM DIAGNOSTIC (DEPTH_PASS_CAMPAIGN §2) — fully keyed');
  let fastMed = 0, slowMed = 0;
  {
    const fast = [], slow = [];
    for (const seed of SEEDLIST) {
      const a = await run(seed, 'keyedFast');
      const b = await run(seed, 'keyedSlow');
      if (!a.st.done) bad('keyed fast route did not win on seed ' + seed + ' (cores ' + a.st.cores.join(',') + ')');
      if (!b.st.done) bad('keyed slow route did not win on seed ' + seed + ' (cores ' + b.st.cores.join(',') + ')');
      if (a.st.done) fast.push(a.st.keys);
      if (b.st.done) slow.push(b.st.keys);
      if (b.st.done && b.st.star) bad('the slow route EARNED the ☆ on seed ' + seed + ' — the star is not skippable');
    }
    fastMed = med(fast); slowMed = med(slow);
    info('part 1 — fastest legal (keyed) ' + fastMed + ' · slowest legal (keyed) ' + slowMed +
         ' · spread ' + (slowMed / fastMed).toFixed(2) + '×');
    if (slowMed / fastMed >= 1.3) ok('part 1 — spread above the ~1.3× warning line');
    else bad('part 1 — spread ' + (slowMed / fastMed).toFixed(2) + '× is at or under the line that retired grpfold');
  }

  /* ================= D · the ☆, ISOLATED against its own controls ================= */
  console.log('\nD · the ☆ ISOLATED (the r438 `series` rule — measure each move against its own control)');
  {
    const seed = SEEDLIST[0];
    const g = await geoOf(seed);
    /* All three variants start from an identical board: rate done, first-year column built,
       the roll link laid in. Only the PROPAGATION of the four moving lines differs.
       The link is in the PREFIX because the ☆ grades VALUES as well as the mechanic — with the
       beginning cells still empty every propagated figure is wrong, so a star measured without
       it would read dark for a reason that has nothing to do with the move. */
    const prefix = [...rateSteps(g), ...col1(g), ...linkSteps(g)];
    const measure = async (tail) => {
      const st = await page.evaluate(async ([s, pre, t]) => {
        window.__ds.build(s); const a = window.__ds.play(pre); const before = a.keys;
        const b = window.__ds.play(t); return { d: b.keys - before, star: b.star, cores: b.cores };
      }, [seed, prefix, tail]);
      return st;
    };
    const star = await measure([{ sel: g.am0, keys: [...rep(SR, 4), ...rep(SD, 3), CTRLR] }]);
    /* the filler's route: one row at a time. A plain ↓ after each fill resumes from the
       selection's TOP-LEFT (r426 dispActive), so it lands on the next row's first year. */
    const four = await measure([{ sel: g.am0, keys: [
      ...rep(SR, 4), CTRLR, DOWN, ...rep(SR, 4), CTRLR, DOWN,
      ...rep(SR, 4), CTRLR, DOWN, ...rep(SR, 4), CTRLR] }]);
    const typed = await measure((() => {
      const keys = [];
      for (let i = 1; i < 5; i++) {
        keys.push(...T(F.am(g, i)), ENTER, ...T(F.sw(g, i)), ENTER, ...T(F.end(g, i)), ENTER, ...T(F.int(g, i)), ENTER);
        if (i < 4) keys.push(...rep(UP, 4), RIGHT);
      }
      return [{ sel: g.YL[1] + g.rAm, keys }];
    })());
    info('one block pass ' + star.d + ' keys · four separate row fills ' + four.d + ' · the sixteen cells hand-typed ' + typed.d);
    if (star.star && star.d < four.d && star.d < typed.d)
      ok('the ☆ move beats BOTH of its own controls (no negative half — the r438 series failure)');
    else bad('the ☆ move is not strictly cheaper than its controls: star ' + star.d + ' vs ' + four.d + '/' + typed.d);
    if (!four.star) ok('four separate row fills leave the ☆ DARK');
    else bad('four separate row fills earned the ☆ — the star falls out of the exercise (§1.0-R2(i))');
    if (!typed.star) ok('the hand-typed propagation leaves the ☆ DARK');
    else bad('the hand-typed propagation earned the ☆');

    /* part 2 of the diagnostic — is any of the spread ☆-LEGAL, and is any OTHER family
       competitive on this board? (wave-4 addendum: prefer a non-fill family if one is.)
       These three are measured END-TO-END for the SAME job — get the four moving lines into
       every year — from a board where only the rate is done, so the comparison is honest
       about how much typing each family still needs. */
    const fromRate = async (tail) => page.evaluate(async ([s, pre, t]) => {
      window.__ds.build(s); const a = window.__ds.play(pre); const before = a.keys;
      const b = window.__ds.play(t); return { d: b.keys - before, star: b.star, cores: b.cores };
    }, [seed, [...rateSteps(g), ...linkSteps(g)], tail]);
    const col1keys = [...T(F.am(g, 0)), ENTER, ...T(F.sw(g, 0)), ENTER, ...T(F.end(g, 0)), ENTER, ...T(F.int(g, 0)), ENTER];
    const fillFam = await fromRate([{ sel: g.am0, keys: [...col1keys, CUP, ...rep(UP, 3), ...rep(SR, 4), ...rep(SD, 3), CTRLR] }]);
    const pasteFam = await fromRate([{ sel: g.am0, keys: [...col1keys, CUP, ...rep(UP, 3),
      { key: 'ArrowDown', ctrl: true, shift: true }, { key: 'c', ctrl: true },
      RIGHT, ...rep(SR, 3), ...rep(SD, 3), { key: 'v', ctrl: true }] }]);
    const multiFam = await fromRate((() => { const keys = [];
      for (let i = 0; i < 4; i++) {
        const fx = [F.am, F.sw, F.end, F.int][i](g, 0);
        keys.push(...rep(SR, 4), ...T(fx), { key: 'Enter', ctrl: true });
        if (i < 3) keys.push(DOWN);
      }
      return [{ sel: g.am0, keys }]; })());
    console.log('  competing ☆ families, same propagation job, measured end to end:');
    const fam = (n, r) => n + ' ' + r.d + ' keys (☆ ' + (r.star ? 'earned' : 'dark') +
      ', builds ' + r.cores.filter(Boolean).length + '/6 cores)';
    info('  ' + fam('fill', fillFam) + ' · ' + fam('paste-tiling', pasteFam) + ' · ' + fam('multi-enter', multiFam));
    if (fillFam.d <= pasteFam.d && fillFam.d <= multiFam.d)
      ok('fill is the cheapest family on this board — the wave-4 addendum\'s "measure that claim", measured');
    else info('a non-fill family is competitive here — re-read the ☆ choice before shipping');
  }

  /* ================= E · SKIPPABILITY (named slow routes, cores green, ☆ dark) ============ */
  console.log('\nE · ☆ SKIPPABILITY — named routes that clear every core with the star dark');
  {
    for (const seed of SEEDLIST) {
      const { st } = await run(seed, 'fourFills');
      if (st.done && !st.star) ok('seed ' + seed + ': four row fills → all cores green, ☆ dark, win fires');
      else bad('seed ' + seed + ': four row fills → done=' + st.done + ' star=' + st.star + ' cores=' + st.cores.join(','));
    }
  }

  /* ================= F · ☆ ROUTE FREEDOM ================= */
  console.log('\nF · ☆ ROUTE FREEDOM (§1.0(c)) — the MECHANIC is graded, never one chord');
  {
    for (const seed of SEEDLIST.slice(0, 3)) {
      const a = await run(seed, 'ribbonFill');
      if (a.st.done && a.st.star) ok('seed ' + seed + ': the ribbon fill (Alt H F I R) earns the ☆');
      else bad('seed ' + seed + ': ribbon fill → done=' + a.st.done + ' star=' + a.st.star);
      const b = await run(seed, 'tiledPaste');
      if (b.st.done && b.st.star) ok('seed ' + seed + ': a tiled paste of the first-year column earns the ☆');
      else bad('seed ' + seed + ': tiled paste → done=' + b.st.done + ' star=' + b.st.star + ' cores=' + b.st.cores.join(','));
    }
  }

  /* ================= G · GEOMETRY ================= */
  console.log('\nG · GEOMETRY — no Ctrl+arrow ride-through between the page\'s blocks');
  {
    const seed = SEEDLIST[0];
    const g = await geoOf(seed);
    const r = await page.evaluate((o) => {
      const c = o.cY0;
      const jump = (r0, dr) => { S.active = { r: r0, c: c }; S.sel = null;
        const j = ctrlJump(r0, c, dr, 0); return j.r; };
      return { fromCash: jump(o.rCash, 1), fromInt: jump(o.rInt, 1), fromBeg: jump(o.rBeg, -1),
        rBeg: o.rBeg, rInt: o.rInt, rIr: o.rIr, rCash: o.rCash };
    }, g);
    if (r.fromCash !== r.rBeg) bad('Ctrl+↓ from the cash subtotal lands row ' + r.fromCash + ', expected the beginning balance row ' + r.rBeg);
    else ok('Ctrl+↓ from the cash subtotal stops at the schedule\'s beginning balance (one blank-row moat held)');
    if (r.fromInt === r.rIr || r.fromInt > r.rInt) ok('Ctrl+↓ out of the schedule lands in the assumptions block (row ' + r.fromInt + '), never mid-schedule');
    else bad('Ctrl+↓ out of the schedule landed row ' + r.fromInt);
    const t = await page.evaluate(() => {
      const C = CHALLENGES.debtsched;
      const tg = (typeof C.targets === 'function') ? C.targets.call(C) : C.targets;
      const ck = C.checks(S), gd = (typeof C.guide === 'function') ? C.guide.call(C) : C.guide;
      return { t: tg.length, c: ck.length, g: gd.length, unres: tg.filter(x => x && !resolveRange(x)).length };
    });
    if (t.t === t.c && t.c === t.g) ok('§1.9 tri-length at runtime: guide=checks=targets=' + t.c + ' (the engine-appended save included)');
    else bad('tri-length broken at runtime: checks=' + t.c + ' guide=' + t.g + ' targets=' + t.t);
    if (!t.unres) ok('every target range resolves'); else bad(t.unres + ' target range(s) do not resolve');
  }

  if (pageErrors.length) { fails++; console.log('\nPAGE ERRORS: ' + [...new Set(pageErrors)].slice(0, 5).join(' | ')); }
  await browser.close();
  console.log('\nverify-debtsched: ' + (fails ? fails + ' FAILURE(S)' : 'ALL GREEN'));
  process.exit(fails ? 1 : 0);
})();
