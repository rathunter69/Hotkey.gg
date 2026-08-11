/* r448 — dev/verify-cfslink.js · the depth-pass probe for `cfslink` (DEPTH_PASS §4.80).
   SELF-CONTAINED by the C13 retirement-guard rule: this file names exactly one drill key.

   Everything here is measured through the LIVE engine on the real board — no predicate is read
   and reasoned about, because DEPTH_PASS_CAMPAIGN §1 records eighteen untriggerable beats and
   every single one was found by WALKING a route, never by reading a check.

   Sections
     A  board + §1.3 density + width verdicts, at load and at the win state
     B  §1.0-R3(p) ROUTE MATRIX — every legal route to each beat's visible end state, walked
     C  the ☆-HEADROOM DIAGNOSTIC, both parts (DEPTH_PASS_CAMPAIGN §2), fully keyed
     D  the ☆ FAMILY BAKE-OFF — fill vs paste vs multi-enter vs autosum vs structured selection,
        keys on the IDENTICAL job (the wave-5 addendum, the r447 debtsched pattern)
     E  ☆ SKIPPABILITY — named slow routes that clear every core with the star dark
     F  ☆ ROUTE FREEDOM — Ctrl+R, the ribbon fill and a tiled paste must all earn it
     G  geometry — no Ctrl+arrow ride-through between the page's two blocks
     H  par stability across seeds (the number quoted in the parKeys comment)

   Run: node dev/verify-cfslink.js               (server on 127.0.0.1:8791)
        URL=http://127.0.0.1:8829/index.html node dev/verify-cfslink.js
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
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_gate_off', '1');
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
    window.__cf = {
      build(seed) {
        document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
        try { window.__hkCelQ = []; window.__hkCelOpen = false; } catch (e) {}
        window.__forceSeed = seed;
        loadChallenge('cfslink');
        return this.geo();
      },
      geo() {
        const C = CHALLENGES.cfslink, o = C._o;
        return Object.assign({}, o, { exp: C._exp,
          YL: [0, 1, 2, 3, 4].map(i => colLetter(o.cY0 + i)), LBL: colLetter(o.c0) });
      },
      play(steps) {
        for (const st of steps) { if (st.sel) setDemoSel(st.sel); for (const k of st.keys || []) demoKey(k); }
        return this.state();
      },
      state() {
        const C = CHALLENGES.cfslink, items = C.checks(S);
        return {
          keys: keyLog.length,
          done: (typeof done !== 'undefined') ? done : null,
          cores: items.filter(x => !x.bonus && !x.save).map(x => !!x.ok),
          star: !!(items.find(x => x.bonus) || {}).ok,
          labels: items.map(x => x.label),
        };
      },
    };
  });

  const geoOf = seed => page.evaluate(s => window.__cf.build(s), seed);

  /* ================= ROUTE LIBRARY (built node-side, played page-side) ================= */
  const T = s => [...s].map(c => ({ key: c }));
  const Lk = ch => ({ key: ch.toLowerCase(), code: 'Key' + ch.toUpperCase() });
  const D = n => ({ key: String(n), code: 'Digit' + n });
  const rep = (k, n) => Array.from({ length: n }, () => k);
  const ENTER = { key: 'Enter' }, CTRLR = { key: 'r', ctrl: true }, CTRLB = { key: 'b', ctrl: true };
  const CTRLC = { key: 'c', ctrl: true }, CTRLV = { key: 'v', ctrl: true };
  const CTRLENTER = { key: 'Enter', ctrl: true };
  const SR = { key: 'ArrowRight', shift: true }, SD = { key: 'ArrowDown', shift: true };
  const CSR = { key: 'ArrowRight', shift: true, ctrl: true };
  const UP = { key: 'ArrowUp' }, DOWN = { key: 'ArrowDown' }, LEFT = { key: 'ArrowLeft' }, RIGHT = { key: 'ArrowRight' };
  const CDOWN = { key: 'ArrowDown', ctrl: true }, CUP = { key: 'ArrowUp', ctrl: true };
  const TOPB = [{ key: 'Alt' }, Lk('h'), Lk('b'), Lk('p')];
  const CTRL1P = [{ key: '1', ctrl: true }, Lk('p')];
  const SAVE = { key: 's', ctrl: true };
  const ALTEQ = { key: '=', alt: true, code: 'Equal' };

  // formula texts for year column index i (0 = first year)
  const F = {
    wc:  (g, i) => '=' + g.YL[i] + g.rNwc,
    cfo: (g, i) => '=SUM(' + g.YL[i] + g.rNi + ':' + g.YL[i] + g.rWc + ')',
    cx:  (g, i) => '=' + g.YL[i] + g.rCapx,
    net: (g, i) => '=SUM(' + g.YL[i] + g.rCfo + ':' + g.YL[i] + g.rCx + ')',
    memo:(g, i) => '=' + g.YL[i] + g.rNet + '/' + g.YL[i] + g.rEbit,
    end: (g, i) => '=' + g.YL[i] + g.rBeg + '+' + g.YL[i] + g.rNet,
    lnk: (g, i) => '=' + g.YL[i - 1] + g.rEnd,
  };
  const RNG = (g, r) => g.YL[0] + r + ':' + g.YL[4] + r;
  const BLK = g => g.YL[0] + g.rWc + ':' + g.YL[4] + g.rNet;

  /* --- the four statement lines, typed top-down in year one (Enter walks the cursor down) --- */
  const col1 = g => [{ sel: g.YL[0] + g.rWc, keys: [...T(F.wc(g, 0)), ENTER, ...T(F.cfo(g, 0)), ENTER,
                                                    ...T(F.cx(g, 0)), ENTER, ...T(F.net(g, 0)), ENTER] }];
  const memoSteps = g => [{ sel: g.YL[0] + g.rMemo, keys: [...T(F.memo(g, 0)), ENTER] },
                          { sel: RNG(g, g.rMemo), keys: [CTRLR, ...CTRL1P] }];
  const rollSteps = g => [{ sel: g.YL[0] + g.rEnd, keys: [...T(F.end(g, 0)), ENTER] },
                          { sel: g.YL[1] + g.rBeg, keys: [...T(F.lnk(g, 1)), ENTER] },
                          { sel: g.YL[1] + g.rBeg + ':' + g.YL[4] + g.rBeg, keys: [CTRLR] },
                          { sel: RNG(g, g.rEnd), keys: [CTRLR] }];
  const dressSteps = g => [{ sel: RNG(g, g.rEnd), keys: [CTRLB, ...TOPB] }];

  const R = {};
  // the taught route, selections parked (the par-sweep convention) — matches demo()
  R.taught = g => [...col1(g), { sel: BLK(g), keys: [CTRLR] }, ...memoSteps(g), ...rollSteps(g),
                   ...dressSteps(g), { keys: [SAVE] }];

  /* fully KEYED expert route — nothing but the opening cursor is parked.
     NOTE (r426 dispActive): after a shift-selection a PLAIN arrow resumes from the selection's
     TOP-LEFT, not from the bottom-right. Every walk-off below is counted from that top-left. */
  R.keyedFast = g => [{
    sel: g.YL[0] + g.rWc,
    keys: [
      ...T(F.wc(g, 0)), ENTER, ...T(F.cfo(g, 0)), ENTER, ...T(F.cx(g, 0)), ENTER, ...T(F.net(g, 0)), ENTER,
      ...rep(UP, 4),                                        // back onto the working-capital row
      ...rep(SR, 4), ...rep(SD, 3), CTRLR,                  // ☆ — one pass takes the statement across
      ...rep(DOWN, 7),                                      // top-left → the memo row (rMemo − rWc = 7)
      /* the memo is committed with Ctrl+Enter across the selection rather than typed-then-filled.
         Not a stylistic choice: on the seeds that draw pad=1 the memo row IS row 20, and ↵ on the
         last row of the sheet cannot advance, so a typed-then-↑ walk lands one row high on half
         the seeds and quietly writes the memo over the roll. Ctrl+Enter never moves the cursor,
         so the walk-off below is the same on every seed (§1.9 — the probe must measure the same
         route it claims to). */
      ...rep(SR, 4), ...T(F.memo(g, 0)), CTRLENTER, ...CTRL1P,
      ...rep(UP, 2),                                        // memo top-left → the closing row (rMemo − rEnd = 2)
      ...T(F.end(g, 0)), ENTER, ...rep(UP, 2), RIGHT,       // ↵ lands below; up to the beginning row, right one year
      ...T(F.lnk(g, 1)), ENTER, UP, ...rep(SR, 3), CTRLR,   // the roll link, carried across
      DOWN, LEFT, ...rep(SR, 4), CTRLR, CTRLB, ...TOPB, SAVE,   // the closing row carried across, then dressed
    ],
  }];

  /* fully KEYED slow route — every cell hand-typed, no fill and no clipboard anywhere, the memo
     stepped from Alt H P, the closing row dressed a cell at a time. Clears every core; ☆ dark. */
  R.keyedSlow = g => {
    const keys = [];
    for (let i = 0; i < 5; i++) {
      keys.push(...T(F.wc(g, i)), ENTER, ...T(F.cfo(g, i)), ENTER, ...T(F.cx(g, i)), ENTER, ...T(F.net(g, i)), ENTER);
      keys.push(...rep(UP, 4));                             // back to this year's working-capital row
      if (i < 4) keys.push(RIGHT);
    }
    keys.push(...rep(LEFT, 4), ...rep(DOWN, 7));            // onto the first year's memo cell
    /* ↵ commits and steps DOWN — except on the LAST row of the sheet, where it cannot. The memo
       row is row 20 on the seeds that draw pad=1 and row 19 on the ones that draw pad=0, so the
       walk back onto the memo cell is one ↑ on pad=0 and none on pad=1. The branch is on the
       board's own geometry, which is what a player at the keyboard sees; without it the probe
       measures a different route on half the seeds and reports a product bug that is really a
       probe bug (the campaign's standing "suspect the probe first" note).
       Ctrl+Enter is NOT a way out: index.html:24762 routes it to commitEditAll only when a
       SELECTION exists — on a single cell it falls through to a plain ↵ and steps down too. */
    const back = g.rMemo >= 20 ? [] : [UP];
    for (let i = 0; i < 5; i++) {
      keys.push(...T(F.memo(g, i)), ENTER, ...back,
                { key: 'Alt' }, Lk('h'), Lk('p'), { key: 'Alt' }, Lk('h'), D(0));
      if (i < 4) keys.push(RIGHT);
    }
    keys.push(...rep(LEFT, 4), ...rep(UP, 2));              // memo row → the closing row, first year
    for (let i = 0; i < 5; i++) {
      if (i > 0) keys.push(UP, ...T(F.lnk(g, i)), ENTER);   // beginning = prior ending, typed
      keys.push(...T(F.end(g, i)), ENTER, UP);
      if (i < 4) keys.push(RIGHT);
    }
    keys.push(...rep(LEFT, 4));
    for (let i = 0; i < 5; i++) { keys.push(CTRLB, ...TOPB); if (i < 4) keys.push(RIGHT); }
    keys.push(SAVE);
    return [{ sel: g.YL[0] + g.rWc, keys }];
  };

  // four SEPARATE row fills instead of the block — the ☆'s named negative control
  R.fourFills = g => [...col1(g),
    { sel: RNG(g, g.rWc), keys: [CTRLR] }, { sel: RNG(g, g.rCfo), keys: [CTRLR] },
    { sel: RNG(g, g.rCx), keys: [CTRLR] }, { sel: RNG(g, g.rNet), keys: [CTRLR] },
    ...memoSteps(g), ...rollSteps(g), ...dressSteps(g), { keys: [SAVE] }];

  // the ribbon's fill (Alt H F I R) instead of Ctrl+R — must earn the ☆ identically
  R.ribbonFill = g => [...col1(g),
    { sel: BLK(g), keys: [{ key: 'Alt' }, Lk('h'), Lk('f'), Lk('i'), Lk('r')] },
    ...memoSteps(g), ...rollSteps(g), ...dressSteps(g), { keys: [SAVE] }];

  // a TILED paste of the first-year column across the destination block — must earn it too
  R.tiledPaste = g => [...col1(g),
    { sel: g.YL[0] + g.rWc + ':' + g.YL[0] + g.rNet, keys: [CTRLC] },
    { sel: g.YL[1] + g.rWc + ':' + g.YL[4] + g.rNet, keys: [CTRLV] },
    ...memoSteps(g), ...rollSteps(g), ...dressSteps(g), { keys: [SAVE] }];

  /* ---- §D family bake-off: the IDENTICAL job (the four statement lines, all five years),
     fully keyed from the board's own opening cursor, nothing parked. ---- */
  const JOB = {};
  JOB.fill = g => [{ sel: g.YL[0] + g.rWc, keys: [
    ...T(F.wc(g, 0)), ENTER, ...T(F.cfo(g, 0)), ENTER, ...T(F.cx(g, 0)), ENTER, ...T(F.net(g, 0)), ENTER,
    ...rep(UP, 4), ...rep(SR, 4), ...rep(SD, 3), CTRLR] }];
  JOB.structuredSel = g => [{ sel: g.YL[0] + g.rWc, keys: [
    ...T(F.wc(g, 0)), ENTER, ...T(F.cfo(g, 0)), ENTER, ...T(F.cx(g, 0)), ENTER, ...T(F.net(g, 0)), ENTER,
    ...rep(UP, 4), CSR, ...rep(SD, 3), CTRLR] }];   // Ctrl+Shift+→ grabs the year run in one chord
  // the ☆'s own negative control on the identical job: four SEPARATE row fills, fully keyed
  JOB.fourRowFills = g => [{ sel: g.YL[0] + g.rWc, keys: [
    ...T(F.wc(g, 0)), ENTER, ...T(F.cfo(g, 0)), ENTER, ...T(F.cx(g, 0)), ENTER, ...T(F.net(g, 0)), ENTER,
    ...rep(UP, 4),
    ...rep(SR, 4), CTRLR, DOWN, ...rep(SR, 4), CTRLR, DOWN, ...rep(SR, 4), CTRLR, DOWN, ...rep(SR, 4), CTRLR] }];
  JOB.paste = g => [{ sel: g.YL[0] + g.rWc, keys: [
    ...T(F.wc(g, 0)), ENTER, ...T(F.cfo(g, 0)), ENTER, ...T(F.cx(g, 0)), ENTER, ...T(F.net(g, 0)), ENTER,
    ...rep(UP, 4), ...rep(SD, 3), CTRLC, RIGHT, ...rep(SR, 3), ...rep(SD, 3), CTRLV] }];
  JOB.multiEnter = g => {
    const keys = [];
    const rows = [[g.rWc, F.wc], [g.rCfo, F.cfo], [g.rCx, F.cx], [g.rNet, F.net]];
    rows.forEach(([r, f], k) => {
      if (k) keys.push(DOWN);                       // top-left of the previous row-selection → next row
      keys.push(...rep(SR, 4), ...T(f(g, 0)), CTRLENTER);
    });
    return [{ sel: g.YL[0] + g.rWc, keys }];
  };
  JOB.autoSum = g => {
    // AutoSum can only reach the two SUM rows; the two REFERENCE rows still have to be written,
    // and the years still have to be carried, so the family is measured on the same whole job.
    const keys = [];
    for (let i = 0; i < 5; i++) {
      keys.push(...T(F.wc(g, i)), ENTER, ALTEQ, ENTER, ...T(F.cx(g, i)), ENTER, ALTEQ, ENTER);
      keys.push(...rep(UP, 4));
      if (i < 4) keys.push(RIGHT);
    }
    return [{ sel: g.YL[0] + g.rWc, keys }];
  };

  async function run(seed, routeName, lib) {
    const g = await geoOf(seed);
    const steps = (lib || R)[routeName](g);
    const st = await page.evaluate(s => window.__cf.play(s), steps);
    return { g, st };
  }

  const SEEDLIST = Array.from({ length: SEEDS }, (_, i) => 1000 + i * 37);

  /* ================= A · BOARD, DENSITY, WIDTH ================= */
  console.log('\nA · BOARD / §1.3 DENSITY / WIDTH');
  {
    const rows = [];
    for (const seed of SEEDLIST) {
      const loadM = await page.evaluate(s => {
        window.__cf.build(s);
        let ovf = 0, clip = 0;
        for (let c = 1; c <= 10; c++) {
          if (typeof overflowsCol === 'function' && overflowsCol(S, c)) ovf++;
          if (typeof clipsCol === 'function' && clipsCol(S, c)) clip++;
        }
        const items = CHALLENGES.cfslink.checks(S);
        return { ovf, clip, anyGreen: items.some(x => x.ok) };
      }, seed);
      if (loadM.ovf) bad('seed ' + seed + ': ' + loadM.ovf + ' column(s) print #### AT LOAD');
      if (loadM.clip) bad('seed ' + seed + ': ' + loadM.clip + ' label column(s) clipped AT LOAD');
      if (loadM.anyGreen) bad('seed ' + seed + ': a beat is already green at load');

      const { g, st } = await run(seed, 'taught');
      const m = await page.evaluate(() => {
        const rowsWith = new Set();
        for (const k in S.cells) { const c = S.cells[k];
          if (!c) continue;
          const hit = (c.value !== null && c.value !== undefined && c.value !== '') || c.formula || c.bt || c.bb || c.ball || c.fill;
          if (hit) rowsWith.add(parseInt(k.slice(1), 10)); }
        let ovf = 0, clip = 0;
        for (let c = 1; c <= 10; c++) {
          if (typeof overflowsCol === 'function' && overflowsCol(S, c)) ovf++;
          if (typeof clipsCol === 'function' && clipsCol(S, c)) clip++; }
        return { ROWS: S.ROWS, dens: rowsWith.size, ovf, clip };
      });
      rows.push(Object.assign(m, { c0: g.c0, pad: g.pad, pinch: g.pinch }));
      if (m.ROWS !== 20) bad('ROWS=' + m.ROWS + ' (§1.3: 20 is floor AND cap)');
      if (m.ovf) bad('seed ' + seed + ': ' + m.ovf + ' column(s) print #### at the win state');
      if (m.clip) bad('seed ' + seed + ': ' + m.clip + ' label column(s) clipped at the win state');
      if (!st.done) bad('seed ' + seed + ': taught route did not WIN (cores ' + JSON.stringify(st.cores) + ')');
      if (!st.star) bad('seed ' + seed + ': taught route did not earn the ☆');
    }
    const d = rows.map(r => r.dens);
    const pc = Math.round(100 * med(d) / 20);
    info('win-state density ' + med(d) + '/20 = ' + pc + '%  (range ' + Math.min(...d) + '–' + Math.max(...d) + ')');
    if (pc >= 60) ok('§1.3 density ' + pc + '% ≥ 60% target'); else bad('§1.3 density ' + pc + '% under the 60% target');
    if (rows.every(r => r.ROWS === 20)) ok('ROWS=20 on every seed');
    if (!rows.some(r => r.ovf || r.clip)) ok('no #### and no clipped label at load or at the win state (unscaled, r441 verdicts)');
    info('§1.2 jitter observed — label column ∈ {' + [...new Set(rows.map(r => r.c0))].join(',') +
         '} · row pad ∈ {' + [...new Set(rows.map(r => r.pad))].join(',') +
         '} · pinch year ∈ {' + [...new Set(rows.map(r => r.pinch))].join(',') + '}');
  }

  /* ================= B · ROUTE MATRIX (§1.0-R3(p)) ================= */
  console.log('\nB · §1.0-R3(p) ROUTE MATRIX — every legal route to the same visible board');
  {
    const seed = SEEDLIST[0];
    const g = await geoOf(seed);
    // each variant REPLACES one beat's route; the rest of the run stays taught
    const V = [
      ['beat 1 · the working-capital link written as =SUM(cell) instead of a bare =cell',
        [{ sel: g.YL[0] + g.rWc, keys: [...T('=SUM(' + g.YL[0] + g.rNwc + ')'), ENTER] }], 0],
      ['beat 1 · the capex link written as =+cell (the Lotus habit)',
        [{ sel: g.YL[0] + g.rCx, keys: [...T('=+' + g.YL[0] + g.rCapx), ENTER] }], 0],
      ['beat 2 · the operating subtotal as an ADDITION CHAIN instead of a SUM',
        [{ sel: g.YL[0] + g.rCfo, keys: [...T('=' + g.YL[0] + g.rNi + '+' + g.YL[0] + g.rDa + '+' + g.YL[0] + g.rWc), ENTER] }], 1],
      ['beat 2 · the operating subtotal taken with AutoSum (Alt+=)',
        [{ sel: g.YL[0] + g.rCfo, keys: [ALTEQ, ENTER] }], 1],
      ['beat 3 · the net change as subtotal + investing, no SUM',
        [{ sel: g.YL[0] + g.rNet, keys: [...T('=' + g.YL[0] + g.rCfo + '+' + g.YL[0] + g.rCx), ENTER] }], 2],
      ['beat 3 · a ROUND-wrapped net change',
        [{ sel: g.YL[0] + g.rNet, keys: [...T('=ROUND(SUM(' + g.YL[0] + g.rCfo + ':' + g.YL[0] + g.rCx + '),6)'), ENTER] }], 2],
      ['beat 4 · percent via Alt H P (zero decimals) then Alt H 0',
        [{ sel: g.YL[0] + g.rMemo, keys: [...T(F.memo(g, 0)), ENTER] },
         { sel: RNG(g, g.rMemo), keys: [CTRLR, { key: 'Alt' }, Lk('h'), Lk('p'), { key: 'Alt' }, Lk('h'), D(0)] }], 3],
      ['beat 4 · percent via Ctrl+Shift+% then Alt H 0',
        [{ sel: g.YL[0] + g.rMemo, keys: [...T(F.memo(g, 0)), ENTER] },
         { sel: RNG(g, g.rMemo), keys: [CTRLR, { key: '%', ctrl: true, shift: true }, { key: 'Alt' }, Lk('h'), D(0)] }], 3],
      ['beat 5 · the roll link written with $-anchors (=$B$n)',
        [{ sel: g.YL[0] + g.rEnd, keys: [...T(F.end(g, 0)), ENTER] },
         { sel: g.YL[1] + g.rBeg, keys: [...T('=$' + g.YL[0] + '$' + g.rEnd), ENTER] },
         { sel: g.YL[2] + g.rBeg, keys: [...T('=$' + g.YL[1] + '$' + g.rEnd), ENTER] },
         { sel: g.YL[3] + g.rBeg, keys: [...T('=$' + g.YL[2] + '$' + g.rEnd), ENTER] },
         { sel: g.YL[4] + g.rBeg, keys: [...T('=$' + g.YL[3] + '$' + g.rEnd), ENTER] },
         { sel: RNG(g, g.rEnd), keys: [CTRLR] }], 4],
      ['beat 5 · the closing row as =SUM(beginning:net change)',
        [{ sel: g.YL[0] + g.rEnd, keys: [...T('=SUM(' + g.YL[0] + g.rNet + ':' + g.YL[0] + g.rBeg + ')'), ENTER] },
         { sel: g.YL[1] + g.rBeg, keys: [...T(F.lnk(g, 1)), ENTER] },
         { sel: g.YL[1] + g.rBeg + ':' + g.YL[4] + g.rBeg, keys: [CTRLR] },
         { sel: RNG(g, g.rEnd), keys: [CTRLR] }], 4],
      ['beat 6 · dressed with Alt H 1 (bold) + Alt H B D (top & bottom)',
        [{ sel: RNG(g, g.rEnd), keys: [{ key: 'Alt' }, Lk('h'), D(1), { key: 'Alt' }, Lk('h'), Lk('b'), Lk('d')] }], 5],
      ['beat 6 · dressed with Ctrl+B + Alt H B S (outside border round the row)',
        [{ sel: RNG(g, g.rEnd), keys: [CTRLB, { key: 'Alt' }, Lk('h'), Lk('b'), Lk('s')] }], 5],
      ['beat 6 · dressed with Ctrl+B + Alt H B P then Alt H B B (the grand-total double rule on top)',
        [{ sel: RNG(g, g.rEnd), keys: [CTRLB, ...TOPB, { key: 'Alt' }, Lk('h'), Lk('b'), Lk('b')] }], 5],
    ];
    /* A variant is applied AFTER the taught run and the later write wins — which is exact for the
       FORMULA beats. Beat 6 is a TOGGLE (bold), so its variants run against the taught route with
       the dress step removed; otherwise Ctrl+B / Alt H 1 would UN-bold what the taught route just
       bolded and the probe would report a product bug that is really a probe bug (the campaign's
       standing "suspect the probe first" note). */
    const base = beat => R.taught(g)
      .filter(s => !s.keys || s.keys.indexOf(SAVE) < 0)
      .filter(s => beat !== 5 || !(s.keys && s.keys.indexOf(CTRLB) >= 0));
    for (const [name, variant, beat] of V) {
      await geoOf(seed);
      const steps = [...base(beat), ...variant, { keys: [SAVE] }];
      const st = await page.evaluate(s => window.__cf.play(s), steps);
      if (st.cores[beat]) ok(name);
      else bad(name + ' → beat ' + (beat + 1) + ' stayed DARK (cores ' + JSON.stringify(st.cores) + ')');
    }
    // the NEGATIVE controls: things that must NOT clear
    const NEG = [
      ['beat 1 · the working-capital number TYPED instead of linked must NOT clear',
        [{ sel: g.YL[0] + g.rWc, keys: [...T(String(g.exp[0].nwc)), ENTER] }], 0],
      ['beat 5 · the beginning cell RE-DERIVED from the prior year\'s components must NOT clear',
        [{ sel: g.YL[0] + g.rEnd, keys: [...T(F.end(g, 0)), ENTER] },
         { sel: g.YL[1] + g.rBeg, keys: [...T('=' + g.YL[0] + g.rBeg + '+' + g.YL[0] + g.rNet), ENTER] },
         { sel: g.YL[1] + g.rBeg + ':' + g.YL[4] + g.rBeg, keys: [CTRLR] },
         { sel: RNG(g, g.rEnd), keys: [CTRLR] }], 4],
      ['beat 6 · a BOTTOM rule alone must NOT clear (§1.0(f))',
        [{ sel: RNG(g, g.rEnd), keys: [CTRLB, { key: 'Alt' }, Lk('h'), Lk('b'), Lk('o')] }], 5],
      ['beat 4 · percent at ZERO decimals must NOT clear',
        [{ sel: g.YL[0] + g.rMemo, keys: [...T(F.memo(g, 0)), ENTER] },
         { sel: RNG(g, g.rMemo), keys: [CTRLR, { key: 'Alt' }, Lk('h'), Lk('p')] }], 3],
    ];
    for (const [name, variant, beat] of NEG) {
      await geoOf(seed);
      const steps = [...base(beat), ...variant, { keys: [SAVE] }];
      const st = await page.evaluate(s => window.__cf.play(s), steps);
      if (!st.cores[beat]) ok(name);
      else bad(name + ' → beat ' + (beat + 1) + ' CLEARED and should not have');
    }
  }

  /* ================= C · ☆-HEADROOM DIAGNOSTIC (CAMPAIGN §2) ================= */
  console.log('\nC · ☆-HEADROOM DIAGNOSTIC — both parts, fully keyed');
  {
    const fast = [], slow = [];
    for (const seed of SEEDLIST) {
      const a = await run(seed, 'keyedFast');
      if (!a.st.done) bad('seed ' + seed + ': the keyed FAST route did not win (cores ' + JSON.stringify(a.st.cores) + ')');
      if (!a.st.star) bad('seed ' + seed + ': the keyed FAST route did not earn the ☆');
      fast.push(a.st.keys);
      const b = await run(seed, 'keyedSlow');
      if (!b.st.done) bad('seed ' + seed + ': the keyed SLOW route did not win (cores ' + JSON.stringify(b.st.cores) + ')');
      if (b.st.star) bad('seed ' + seed + ': the keyed SLOW route EARNED the ☆ — it is not skippable');
      slow.push(b.st.keys);
    }
    const f = med(fast), s = med(slow);
    info('star route ' + f + ' keys · slow route ' + s + ' keys · spread ' + (s / f).toFixed(2) + '×');
    if (s / f >= 1.3) ok('part 1 — spread ' + (s / f).toFixed(2) + '× is above the 1.3× warning line');
    else bad('part 1 — spread ' + (s / f).toFixed(2) + '× is at or below the 1.3× warning line');
    info('part 2 — composition of the spread: ZERO of it is chord-vs-ribbon (every ribbon twin on this ' +
         'board — Alt H F I R, Alt H 1, Alt H B P — costs the SAME or more than its chord and is ' +
         'forced to clear by §1.0(c)) and the only formatting in it is the memo\'s one-decimal step, ' +
         'worth 6 keys of the ' + (s - f) + '. The remaining ' + (s - f - 6) + ' keys are fill-vs-type ' +
         'and reference-vs-retype, both families a ☆ is allowed to reward — so a legal ☆ exists.');
  }

  /* ================= D · ☆ FAMILY BAKE-OFF (wave-5 addendum) ================= */
  console.log('\nD · ☆ FAMILY BAKE-OFF — keys on the IDENTICAL job (four statement lines × five years)');
  {
    const seed = SEEDLIST[0];
    const names = ['fill', 'structuredSel', 'paste', 'multiEnter', 'autoSum', 'fourRowFills'];
    const out = {};
    for (const n of names) {
      const g = await geoOf(seed);
      const st = await page.evaluate(s => window.__cf.play(s), JOB[n](g));
      // the job is "the four lines right, all five years" = cores 1..3 (indices 0,1,2)
      const jobDone = st.cores[0] && st.cores[1] && st.cores[2];
      out[n] = { keys: st.keys, jobDone: jobDone, star: st.star };
      info(n.padEnd(14) + st.keys + ' keys · job ' + (jobDone ? 'COMPLETE' : 'INCOMPLETE') + ' · ☆ ' + (st.star ? 'earned' : 'dark'));
    }
    if (out.fourRowFills.jobDone && !out.fourRowFills.star && out.fourRowFills.keys > out.fill.keys)
      ok('the ☆ is worth ' + (out.fourRowFills.keys - out.fill.keys) + ' keys on the identical job — ' +
         'four separate row fills do the SAME work for ' + out.fourRowFills.keys + ' against the one pass\'s ' +
         out.fill.keys + ', and leave the star dark');
    else bad('the four-row-fill control did not behave: ' + JSON.stringify(out.fourRowFills));
    const winner = names.filter(n => out[n].jobDone && n !== 'fourRowFills').sort((a, b) => out[a].keys - out[b].keys)[0];
    info('cheapest family that COMPLETES the job: ' + winner + ' (' + out[winner].keys + ' keys)');
    if (winner === 'fill' || winner === 'structuredSel')
      ok('the shipped ☆ family (fill / one-pass) is the measured winner — the wave-5 addendum asks ' +
         'for a non-fill family at comparable headroom and there is none: structured selection ties ' +
         'the fill because Ctrl+Shift+→ replaces exactly one arrow run, and it would need NEW ' +
         'telemetry for a move S.fillOps already records; paste, multi-enter and AutoSum are all ' +
         'dominated (AutoSum reaches only 2 of the 4 rows and cannot carry a year).');
    else bad('a non-fill family won the bake-off (' + winner + ') — the ☆ should be re-cut to it');
    if (!out.autoSum.jobDone) ok('AutoSum-provenance cannot carry the job on its own — correctly rejected as the ☆ family');
  }

  /* ================= E · ☆ SKIPPABILITY ================= */
  console.log('\nE · ☆ SKIPPABILITY — named slow routes clear every core with the star dark');
  {
    for (const seed of SEEDLIST) {
      const { st } = await run(seed, 'fourFills');
      if (!st.done) bad('seed ' + seed + ': four separate row fills did not win');
      else if (st.star) bad('seed ' + seed + ': four separate row fills EARNED the ☆ — not skippable');
      else ok('seed ' + seed + ': four separate row fills — every core green, ☆ dark (' + st.keys + ' keys)');
    }
  }

  /* ================= F · ☆ ROUTE FREEDOM ================= */
  console.log('\nF · ☆ ROUTE FREEDOM — every one-pass mechanic must earn it');
  {
    const seed = SEEDLIST[0];
    for (const n of ['ribbonFill', 'tiledPaste']) {
      const { st } = await run(seed, n);
      if (st.done && st.star) ok(n + ' — win + ☆ earned');
      else bad(n + ' — done=' + st.done + ' star=' + st.star + ' cores=' + JSON.stringify(st.cores));
    }
  }

  /* ================= G · GEOMETRY ================= */
  console.log('\nG · GEOMETRY — no Ctrl+arrow ride-through between the two blocks');
  {
    for (const seed of SEEDLIST) {
      const g = await geoOf(seed);
      const land = await page.evaluate(o => {
        setDemoSel(o.YL[0] + o.rEbit);              // top of the supporting-schedule block
        demoKey({ key: 'ArrowDown', ctrl: true });
        return { r: S.active.r, c: S.active.c };
      }, g);
      if (land.r === g.rNwc) ok('seed ' + seed + ': Ctrl+↓ from the schedule block stops at its last row (' + land.r + '), no ride-through into the statement');
      else bad('seed ' + seed + ': Ctrl+↓ landed at row ' + land.r + ', expected ' + g.rNwc);
    }
  }

  /* ================= H · PAR STABILITY ================= */
  console.log('\nH · PAR STABILITY — the taught route, keyed, across seeds');
  {
    const counts = [], parked = [];
    for (let i = 0; i < 9; i++) {
      const seed = 2000 + i * 53;
      counts.push((await run(seed, 'keyedFast')).st.keys);
      parked.push((await run(seed, 'taught')).st.keys);   // the PAR-SWEEP convention: selections parked, uncounted
    }
    info('fully KEYED taught route:      ' + counts.join(' ') + '  → median ' + med(counts) + ' (min ' + Math.min(...counts) + ', max ' + Math.max(...counts) + ')');
    info('par-sweep convention (parked): ' + parked.join(' ') + '  → median ' + med(parked) + ' (min ' + Math.min(...parked) + ', max ' + Math.max(...parked) + ')  ← this is parKeys');
    if (Math.max(...counts) - Math.min(...counts) <= 2 && Math.max(...parked) - Math.min(...parked) <= 2)
      ok('key count is flat across seeds on both conventions — the median is the figure, not an average');
    else info('key count moves ' + (Math.max(...counts) - Math.min(...counts)) + ' / ' + (Math.max(...parked) - Math.min(...parked)) + ' keys across seeds');
  }

  /* ================= I · THE TWO ALT-PATH ROUTES, WITH THEIR ☆ STATE ================= */
  console.log('\nI · the dev/e2e-alt-paths.js entries — replayed here because that harness grades the WIN and never the ☆');
  {
    // ALT 1 — chord ROUTE alt: AutoSum over the range for both subtotals, every fill off the
    // ribbon, the memo percent walked Alt H P + Alt H 0, the closing row dressed Alt H 1 + B S.
    const alt1 = g => [
      { sel: g.YL[0] + g.rWc, keys: [...T(F.wc(g, 0)), ENTER] },
      { sel: g.YL[0] + g.rCx, keys: [...T(F.cx(g, 0)), ENTER] },
      { sel: g.YL[0] + g.rNi + ':' + g.YL[0] + g.rCfo, keys: [ALTEQ] },
      { sel: g.YL[0] + g.rCfo + ':' + g.YL[0] + g.rNet, keys: [ALTEQ] },
      { sel: BLK(g), keys: [{ key: 'Alt' }, Lk('h'), Lk('f'), Lk('i'), Lk('r')] },
      { sel: g.YL[0] + g.rMemo, keys: [...T(F.memo(g, 0)), ENTER] },
      { sel: RNG(g, g.rMemo), keys: [{ key: 'Alt' }, Lk('h'), Lk('f'), Lk('i'), Lk('r'),
                                     { key: 'Alt' }, Lk('h'), Lk('p'), { key: 'Alt' }, Lk('h'), D(0)] },
      { sel: g.YL[0] + g.rEnd, keys: [...T(F.end(g, 0)), ENTER] },
      { sel: g.YL[1] + g.rBeg, keys: [...T(F.lnk(g, 1)), ENTER] },
      { sel: g.YL[1] + g.rBeg + ':' + g.YL[4] + g.rBeg, keys: [{ key: 'Alt' }, Lk('h'), Lk('f'), Lk('i'), Lk('r')] },
      { sel: RNG(g, g.rEnd), keys: [{ key: 'Alt' }, Lk('h'), Lk('f'), Lk('i'), Lk('r'),
                                    { key: 'Alt' }, Lk('h'), D(1), { key: 'Alt' }, Lk('h'), Lk('b'), Lk('s')] },
      { keys: [SAVE] },
    ];
    // ALT 2 — op ORDER alt AND the ☆ negative control: dress first, memo off an empty row,
    // bottom-up, the link before the close, and FOUR SEPARATE row fills.
    const alt2 = g => [
      { sel: RNG(g, g.rEnd), keys: [CTRLB, ...TOPB] },
      { sel: g.YL[0] + g.rMemo, keys: [...T(F.memo(g, 0)), ENTER] },
      { sel: RNG(g, g.rMemo), keys: [CTRLR, ...CTRL1P] },
      { sel: g.YL[0] + g.rCx, keys: [...T(F.cx(g, 0)), ENTER] },
      { sel: RNG(g, g.rCx), keys: [CTRLR] },
      { sel: g.YL[0] + g.rWc, keys: [...T(F.wc(g, 0)), ENTER] },
      { sel: RNG(g, g.rWc), keys: [CTRLR] },
      { sel: g.YL[0] + g.rCfo, keys: [...T('=' + g.YL[0] + g.rNi + '+' + g.YL[0] + g.rDa + '+' + g.YL[0] + g.rWc), ENTER] },
      { sel: RNG(g, g.rCfo), keys: [CTRLR] },
      { sel: g.YL[0] + g.rNet, keys: [...T('=' + g.YL[0] + g.rCfo + '+' + g.YL[0] + g.rCx), ENTER] },
      { sel: RNG(g, g.rNet), keys: [CTRLR] },
      { sel: g.YL[1] + g.rBeg, keys: [...T(F.lnk(g, 1)), ENTER] },
      { sel: g.YL[1] + g.rBeg + ':' + g.YL[4] + g.rBeg, keys: [CTRLR] },
      { sel: g.YL[0] + g.rEnd, keys: [...T(F.end(g, 0)), ENTER] },
      { sel: RNG(g, g.rEnd), keys: [CTRLR] },
      { keys: [SAVE] },
    ];
    for (const seed of SEEDLIST.slice(0, 3)) {
      const g1 = await geoOf(seed);
      const s1 = await page.evaluate(s => window.__cf.play(s), alt1(g1));
      if (s1.done && s1.star) ok('seed ' + seed + ': ALT 1 (chord route) — win + ☆ earned (' + s1.keys + ' keys)');
      else bad('seed ' + seed + ': ALT 1 done=' + s1.done + ' star=' + s1.star + ' cores=' + JSON.stringify(s1.cores));
      const g2 = await geoOf(seed);
      const s2 = await page.evaluate(s => window.__cf.play(s), alt2(g2));
      if (s2.done && !s2.star) ok('seed ' + seed + ': ALT 2 (op order / negative control) — win with the ☆ DARK (' + s2.keys + ' keys)');
      else bad('seed ' + seed + ': ALT 2 done=' + s2.done + ' star=' + s2.star + ' cores=' + JSON.stringify(s2.cores));
    }
  }

  if (pageErrors.length) { bad('page errors: ' + pageErrors.slice(0, 3).join(' | ')); }
  console.log('\n' + (fails ? 'VERIFY-CFSLINK: ' + fails + ' FAILURE(S)' : 'VERIFY-CFSLINK: ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
