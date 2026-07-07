/* ============================================================
   hotkey.gg — DRILLGEN v1
   Randomization + computed-par engine.
   ----------------------------------------------------------------
   Purpose
   -------
   1. RANDOMIZE each drill instance: values, labels, AND layout
      (anchor row/col jitter, series length) so no two runs are
      identical — while staying inside the A–J × 14 grid.
   2. COMPUTE par per instance instead of hardcoding it. The
      generator that builds the grid also emits the canonical
      optimal solution as a token list; parKeys = counted tokens,
      par (seconds) = derived from parKeys. This is the honest way
      to do "optimal keystroke calculation": a general solver over
      Excel's action space is a research project; the generator
      already knows the layout it just created, so it can state the
      optimal path exactly.
   3. SEEDED: pass the same seed, get the same drill. Enables
      daily-challenge mode, ghost replays, and fair leaderboards
      per-seed later. Pass no seed → random instance.

   Integration contract (index.html)
   ---------------------------------
   For a migrated drill, CHALLENGES[key] keeps its shape but:
     build()  → const inst = DrillGen.make('growth');        // or make('growth', seed)
                S.inst = inst; apply inst.grid to S.cells;
     checks(S)→ DrillGen.runChecks(S.inst.checks, S)         // or keep bespoke checks
                (runChecks needs a tiny adapter to the engine's
                 cell accessor — see ENGINE_ADAPTER below)
     par / parKeys → read from S.inst.par / S.inst.parKeys
                AFTER build() runs (they're per-instance now).
     guide    → inst.solution is also the guided-mode script.

   Keystroke counting convention (matches existing hand counts)
   -------------------------------------------------------------
   - Every non-modifier keypress = 1. Chords = 1 (Ctrl+C = 1).
   - Typing text = 1 per character. Enter/Tab/Esc/F-keys = 1.
   - Alt ribbon chains: Alt is the entry modifier; each letter
     after = 1 (Alt E S V Enter = 5... we count Alt itself as 1
     since it's a discrete press, not a hold → 5 total).
   ============================================================ */

(function (root) {
  'use strict';

  /* ----------------------------------------------------------
     Seeded RNG (mulberry32) + helpers
  ---------------------------------------------------------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeRng(seed) {
    const f = mulberry32(seed >>> 0);
    return {
      seed: seed >>> 0,
      next: f,
      int(lo, hi) { return lo + Math.floor(f() * (hi - lo + 1)); },      // inclusive
      float(lo, hi, dp) {
        const v = lo + f() * (hi - lo);
        return dp == null ? v : Math.round(v * Math.pow(10, dp)) / Math.pow(10, dp);
      },
      pick(arr) { return arr[Math.floor(f() * arr.length)]; },
      shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(f() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      },
      // money-ish round numbers: 1,240 not 1,237.413
      money(lo, hi, step) {
        step = step || 10;
        return Math.round(this.int(lo, hi) / step) * step;
      }
    };
  }

  /* ----------------------------------------------------------
     Grid constants + cell math (A–J × 14)
  ---------------------------------------------------------- */
  const GRID = { COLS: 10, ROWS: 14 };
  const colLetter = c => String.fromCharCode(64 + c);        // 1 → 'A'
  const A1 = (r, c) => colLetter(c) + r;
  function parseA1(ref) {
    const m = /^([A-J])(\d{1,2})$/.exec(ref);
    return m ? { c: m[1].charCodeAt(0) - 64, r: +m[2] } : null;
  }

  /* ----------------------------------------------------------
     Label / story pools — so drills read like real spreads,
     different every run.
  ---------------------------------------------------------- */
  const POOLS = {
    companies: ['Apex Industrials', 'Bluepeak Foods', 'Cormorant Media', 'Delta Freight',
      'Everline Health', 'Fairbank Retail', 'Granite Materials', 'Harbor Logistics',
      'Ironwood Paper', 'Juniper Softworks', 'Kestrel Energy', 'Lakeshore Brands'],
    segments: ['North America', 'EMEA', 'APAC', 'LatAm', 'Consumer', 'Enterprise',
      'Wholesale', 'Retail', 'Digital', 'Services', 'Licensing', 'Aftermarket'],
    lineItems: ['Revenue', 'COGS', 'Gross profit', 'SG&A', 'R&D', 'EBITDA', 'D&A',
      'EBIT', 'Interest', 'Taxes', 'Net income', 'Capex', 'Rent', 'Freight'],
    costItems: ['SG&A', 'R&D', 'Marketing', 'Freight', 'Rent', 'Insurance', 'IT spend'],
    years: (rng, n) => {
      const start = rng.int(2019, 2024);
      return Array.from({ length: n }, (_, i) => String(start + i));
    },
    quarters: (rng, n) => {
      const startY = rng.int(22, 25); let q = rng.int(1, 4), y = startY;
      return Array.from({ length: n }, () => {
        const s = 'Q' + q + "'" + y;
        q++; if (q > 4) { q = 1; y++; }
        return s;
      });
    }
  };

  /* ----------------------------------------------------------
     Solution tokens + key counting
     Tokens are strings the guided-mode UI can display directly:
       'TYPE:=B2/B1'   → 7 keys
       'ENTER' 'TAB' 'ESC' 'F2' 'F4' 'DELETE'
       'UP' 'DOWN' 'LEFT' 'RIGHT'                → 1 each
       'CTRL+C' 'CTRL+R' 'CTRL+SHIFT+RIGHT' etc. → 1 each (chord)
       'ALT:ESV' → Alt then E,S,V = 4 keys ('ALT:HFC' etc.)
       'SHIFT+RIGHT*3' → repeat suffix, 3 keys
  ---------------------------------------------------------- */
  function tokenKeys(tok) {
    if (tok.startsWith('TYPE:')) return tok.length - 5;
    if (tok.startsWith('ALT:')) return 1 + (tok.length - 4);
    const rep = /^(.+)\*(\d+)$/.exec(tok);
    if (rep) return tokenKeys(rep[1]) * (+rep[2]);
    return 1; // any single key or chord
  }
  const countKeys = tokens => tokens.reduce((n, t) => n + tokenKeys(t), 0);

  /* Time model: par(sec) from parKeys.
     Empirics from existing drills (mini-bridge: 14 keys / 24s par;
     navigation: 7 keys / 20s par) → par ≈ keys*1.2 + readBuffer.
     Optimized floor ≈ keys/3 (3 keys/sec sustained is fast-human).
     Slow ceiling ≈ keys*2 + 20s reading. */
  function timeBands(parKeys) {
    return {
      par: Math.max(10, Math.round(parKeys * 1.2 + 8)),
      optimized: Math.max(5, Math.round(parKeys / 3)),
      slowCeiling: Math.round(parKeys * 2 + 20)
    };
  }
  // Design rule: drills should land 10s ≤ optimized-ish and slowCeiling ≤ 120s
  // → healthy parKeys band is roughly 12–50.
  function validateTiming(parKeys) {
    const t = timeBands(parKeys);
    return { ...t, ok: parKeys >= 10 && t.slowCeiling <= 120 };
  }

  /* ----------------------------------------------------------
     Check descriptors (declarative). runChecks() executes them
     against the live grid via an adapter.
     Types:
       {cell,'value', expect, tol}         numeric value match
       {cell,'text', expect}               exact string
       {cell,'formula', mustContain:[..], forbid:[..]}  formula string test
       {cell,'isFormula'} / {cell,'isValue'}
       {cell,'fmt', expect}                number format key
       {cell,'bold', expect:true}
  ---------------------------------------------------------- */
  const ENGINE_ADAPTER = {
    // Override these at integration to point at index.html internals.
    getValue: (S, ref) => {
      const c = S.cells[ref]; if (!c) return null;
      return c.v != null ? c.v : (c.t != null ? c.t : null);
    },
    getFormula: (S, ref) => { const c = S.cells[ref]; return c && c.f ? String(c.f) : null; },
    getFmt: (S, ref) => { const c = S.cells[ref]; return c ? (c.fmt || null) : null; },
    getBold: (S, ref) => { const c = S.cells[ref]; return !!(c && c.bold); },
    getBlue: (S, ref) => { const c = S.cells[ref]; return !!(c && c.blue); } // Group B forward-compat
  };

  function runChecks(checks, S, adapter) {
    const A = adapter || ENGINE_ADAPTER;
    const fails = [];
    for (const ck of checks) {
      const ref = ck.cell;
      let ok = true;
      switch (ck.type) {
        case 'value': {
          const v = A.getValue(S, ref);
          ok = typeof v === 'number' && Math.abs(v - ck.expect) <= (ck.tol != null ? ck.tol : 1e-6);
          break;
        }
        case 'text': ok = String(A.getValue(S, ref) || '').trim() === ck.expect; break;
        case 'isFormula': ok = !!A.getFormula(S, ref); break;
        case 'isValue': ok = !A.getFormula(S, ref) && A.getValue(S, ref) != null; break;
        case 'formula': {
          const f = (A.getFormula(S, ref) || '').toUpperCase().replace(/\s+/g, '');
          ok = !!f;
          if (ok && ck.mustContain) ok = ck.mustContain.every(s => f.includes(s.toUpperCase()));
          if (ok && ck.forbid) ok = ck.forbid.every(s => !f.includes(s.toUpperCase()));
          break;
        }
        case 'fmt': ok = A.getFmt(S, ref) === ck.expect; break;
        case 'bold': ok = A.getBold(S, ref) === !!ck.expect; break;
        case 'blue': ok = A.getBlue(S, ref) === !!ck.expect; break;
        case 'empty': ok = A.getValue(S, ref) == null && !A.getFormula(S, ref); break;
        default: ok = false;
      }
      if (!ok) fails.push(ck);
    }
    return { pass: fails.length === 0, fails };
  }

  /* ----------------------------------------------------------
     Layout jitter helper: pick an anchor so a w×h block plus a
     header row/label col fits the grid, with ≥1 row/col margin
     variation between runs.
  ---------------------------------------------------------- */
  function jitterAnchor(rng, blockW, blockH, opts) {
    const o = opts || {};
    const minR = o.minRow || 2, minC = o.minCol || 2;
    const maxR = GRID.ROWS - blockH + 1, maxC = GRID.COLS - blockW + 1;
    return {
      r: rng.int(minR, Math.max(minR, Math.min(maxR, minR + (o.rowJitter != null ? o.rowJitter : 3)))),
      c: rng.int(minC, Math.max(minC, Math.min(maxC, minC + (o.colJitter != null ? o.colJitter : 2))))
    };
  }

  /* ==========================================================
     REFERENCE GENERATORS — the migration pattern, fully worked.
     Each returns:
       { seed, story, grid, checks, solution, parKeys, par,
         promptVars, timing }
     grid: { 'B2': {v|t|f, fmt?, bold?, blue?}, ... }  start state
     solution: canonical optimal token path (also = guided script)
  ========================================================== */
  const GENERATORS = {};

  /* --- 1. hardcode: type N values at a jittered anchor ------- */
  GENERATORS.hardcode = function (rng) {
    const n = rng.int(4, 6);
    const a = jitterAnchor(rng, 2, n + 1, { rowJitter: 4, colJitter: 3 });
    const seg = rng.shuffle(POOLS.segments).slice(0, n);
    const vals = seg.map(() => rng.money(200, 9800, 5));
    const grid = {}, checks = [], solution = [];
    grid[A1(a.r, a.c)] = { t: rng.pick(POOLS.companies), bold: true };
    seg.forEach((s, i) => {
      const r = a.r + 1 + i;
      grid[A1(r, a.c)] = { t: s };
      checks.push({ cell: A1(r, a.c + 1), type: 'value', expect: vals[i] });
      checks.push({ cell: A1(r, a.c + 1), type: 'isValue' });
    });
    // Optimal: land on first input cell, type value, Enter walks down.
    solution.push('GOTO:' + A1(a.r + 1, a.c + 1)); // engine shows "select B3" — 0 keys if start pos, else counted by nav below
    vals.forEach(v => { solution.push('TYPE:' + v, 'ENTER'); });
    // navigation cost to anchor from A1 home: use ctrl-free arrows, worst case
    const navTokens = navPath({ r: 1, c: 1 }, { r: a.r + 1, c: a.c + 1 });
    const sol = navTokens.concat(solution.filter(t => !t.startsWith('GOTO:')));
    const parKeys = countKeys(sol);
    const t = timeBands(parKeys);
    return {
      story: 'Hardcode the segment actuals',
      promptVars: { company: grid[A1(a.r, a.c)].t, count: n },
      grid, checks, solution: sol, parKeys, par: t.par, timing: validateTiming(parKeys)
    };
  };

  /* --- 2. growth: YoY formula + fill right ------------------- */
  GENERATORS.growth = function (rng) {
    const nYears = rng.int(5, 7);
    const a = jitterAnchor(rng, nYears + 1, 3, { rowJitter: 5, colJitter: 1 });
    const years = POOLS.years(rng, nYears);
    let rev = rng.money(800, 4000, 10);
    const revs = years.map(() => { rev = Math.round(rev * rng.float(1.03, 1.17)); return rev; });
    const grid = {};
    grid[A1(a.r, a.c)] = { t: rng.pick(POOLS.companies) + ' revenue', bold: true };
    years.forEach((y, i) => { grid[A1(a.r, a.c + 1 + i)] = { t: y, bold: true }; });
    revs.forEach((v, i) => { grid[A1(a.r + 1, a.c + 1 + i)] = { v: v, fmt: 'comma', blue: true }; });
    grid[A1(a.r + 2, a.c)] = { t: 'Growth %' };

    const fRow = a.r + 2, firstF = a.c + 2; // growth starts in year 2 column
    const checks = [];
    for (let i = 1; i < nYears; i++) {
      const cell = A1(fRow, a.c + 1 + i);
      const cur = A1(a.r + 1, a.c + 1 + i), prev = A1(a.r + 1, a.c + i);
      checks.push({ cell, type: 'isFormula' });
      checks.push({ cell, type: 'value', expect: revs[i] / revs[i - 1] - 1, tol: 1e-4 });
      checks.push({ cell, type: 'formula', mustContain: [cur, prev] });
      checks.push({ cell, type: 'fmt', expect: 'pct1' });
    }
    const cur1 = A1(a.r + 1, firstF), prev1 = A1(a.r + 1, firstF - 1);
    const fillCount = nYears - 2;
    const solution = navPath({ r: 1, c: 1 }, { r: fRow, c: firstF }).concat([
      'TYPE:=' + cur1 + '/' + prev1 + '-1', 'ENTER', 'UP',
      // reselect the formula cell then extend right and fill
      'DOWN',
      'SHIFT+RIGHT*' + fillCount, 'CTRL+R',
      // format the whole growth row as % 1dp
      'CTRL+SHIFT+5', 'ALT:H9'   // pct then trim to 1dp (engine's pct default 0dp+1? adjust at integration)
    ]);
    const parKeys = countKeys(solution);
    const t = timeBands(parKeys);
    return {
      story: 'Build the YoY growth row',
      promptVars: { years: nYears },
      grid, checks, solution, parKeys, par: t.par, timing: validateTiming(parKeys)
    };
  };

  /* --- 3. margin: GP + margin %, fill down ------------------- */
  GENERATORS.margin = function (rng) {
    const nRows = rng.int(4, 6);
    const a = jitterAnchor(rng, 4, nRows + 1, { rowJitter: 3, colJitter: 2 });
    const segs = rng.shuffle(POOLS.segments).slice(0, nRows);
    const grid = {};
    ['Segment', 'Revenue', 'COGS', 'GP %'].forEach((h, i) => {
      grid[A1(a.r, a.c + i)] = { t: h, bold: true };
    });
    const revs = [], cogs = [];
    segs.forEach((s, i) => {
      const r = a.r + 1 + i;
      const rv = rng.money(500, 6000, 10);
      const cg = Math.round(rv * rng.float(0.45, 0.75));
      revs.push(rv); cogs.push(cg);
      grid[A1(r, a.c)] = { t: s };
      grid[A1(r, a.c + 1)] = { v: rv, fmt: 'comma', blue: true };
      grid[A1(r, a.c + 2)] = { v: cg, fmt: 'comma', blue: true };
    });
    const checks = [];
    segs.forEach((s, i) => {
      const r = a.r + 1 + i;
      const cell = A1(r, a.c + 3);
      const rv = A1(r, a.c + 1), cg = A1(r, a.c + 2);
      checks.push({ cell, type: 'isFormula' });
      checks.push({ cell, type: 'value', expect: (revs[i] - cogs[i]) / revs[i], tol: 1e-4 });
      checks.push({ cell, type: 'formula', mustContain: [rv, cg] });
      checks.push({ cell, type: 'fmt', expect: 'pct1' });
    });
    const r1 = a.r + 1;
    const rv1 = A1(r1, a.c + 1), cg1 = A1(r1, a.c + 2);
    const solution = navPath({ r: 1, c: 1 }, { r: r1, c: a.c + 3 }).concat([
      'TYPE:=1-' + cg1 + '/' + rv1, 'ENTER', 'UP',
      'SHIFT+DOWN*' + (nRows - 1), 'CTRL+D',
      'CTRL+SHIFT+5', 'ALT:H9'
    ]);
    const parKeys = countKeys(solution);
    const t = timeBands(parKeys);
    return {
      story: 'Gross margin by segment',
      promptVars: { rows: nRows },
      grid, checks, solution, parKeys, par: t.par, timing: validateTiming(parKeys)
    };
  };

  /* ==========================================================
     v2 GENERATORS — catalog ports + Curriculum Batch 1.
     Fmt keys used in checks: 'comma' | 'pct1' only (match at
     integration; multiples format intentionally unchecked).
  ========================================================== */

  /* --- percent: % of total with F4-anchored denominator ------ */
  GENERATORS.percent = function (rng) {
    const n = rng.int(4, 5);
    const a = jitterAnchor(rng, 3, n + 2, { rowJitter: 3, colJitter: 3 });
    const segs = rng.shuffle(POOLS.segments).slice(0, n);
    const vals = segs.map(() => rng.money(300, 5000, 10));
    const total = vals.reduce((s, v) => s + v, 0);
    const grid = {}, checks = [];
    grid[A1(a.r, a.c)] = { t: 'Segment', bold: true };
    grid[A1(a.r, a.c + 1)] = { t: 'Revenue', bold: true };
    grid[A1(a.r, a.c + 2)] = { t: '% of total', bold: true };
    segs.forEach((s, i) => {
      grid[A1(a.r + 1 + i, a.c)] = { t: s };
      grid[A1(a.r + 1 + i, a.c + 1)] = { v: vals[i], fmt: 'comma', blue: true };
    });
    const totR = a.r + 1 + n;
    grid[A1(totR, a.c)] = { t: 'Total', bold: true };
    grid[A1(totR, a.c + 1)] = { f: '=SUM(' + A1(a.r + 1, a.c + 1) + ':' + A1(totR - 1, a.c + 1) + ')', v: total, fmt: 'comma' };
    const totRef = colLetter(a.c + 1) + '$' + totR; // relative col, locked row is enough for a fill-down
    segs.forEach((s, i) => {
      const cell = A1(a.r + 1 + i, a.c + 2);
      checks.push({ cell, type: 'isFormula' });
      checks.push({ cell, type: 'value', expect: vals[i] / total, tol: 1e-4 });
      checks.push({ cell, type: 'formula', mustContain: [A1(a.r + 1 + i, a.c + 1), '$' + totR] });
      checks.push({ cell, type: 'fmt', expect: 'pct1' });
    });
    const solution = navPath({ r: 1, c: 1 }, { r: a.r + 1, c: a.c + 2 }).concat([
      'TYPE:=' + A1(a.r + 1, a.c + 1) + '/' + A1(totR, a.c + 1), 'F4', 'ENTER', 'UP',
      'SHIFT+DOWN*' + (n - 1), 'CTRL+D', 'CTRL+SHIFT+5', 'ALT:H9'
    ]);
    const parKeys = countKeys(solution), t = timeBands(parKeys);
    return { story: '% of total mix', promptVars: { rows: n }, grid, checks, solution, parKeys, par: t.par, timing: validateTiming(parKeys) };
  };

  /* --- foot: cross-foot a block with one Alt+= ---------------- */
  GENERATORS.foot = function (rng) {
    const rows = rng.int(3, 4), cols = rng.int(3, 4);
    const a = jitterAnchor(rng, cols + 2, rows + 2, { rowJitter: 3, colJitter: 2 });
    const grid = {}, checks = [];
    grid[A1(a.r, a.c)] = { t: rng.pick(POOLS.companies), bold: true };
    const qs = POOLS.quarters(rng, cols);
    qs.forEach((q, j) => { grid[A1(a.r, a.c + 1 + j)] = { t: q, bold: true }; });
    const items = rng.shuffle(POOLS.costItems).slice(0, rows);
    const data = [];
    items.forEach((it, i) => {
      grid[A1(a.r + 1 + i, a.c)] = { t: it };
      data.push([]);
      for (let j = 0; j < cols; j++) {
        const v = rng.money(100, 2000, 5);
        data[i].push(v);
        grid[A1(a.r + 1 + i, a.c + 1 + j)] = { v, fmt: 'comma', blue: true };
      }
    });
    grid[A1(a.r + 1 + rows, a.c)] = { t: 'Total', bold: true };
    grid[A1(a.r, a.c + 1 + cols)] = { t: 'Total', bold: true };
    for (let j = 0; j < cols; j++) {
      const cell = A1(a.r + 1 + rows, a.c + 1 + j);
      checks.push({ cell, type: 'isFormula' });
      checks.push({ cell, type: 'value', expect: data.reduce((s, row) => s + row[j], 0) });
    }
    for (let i = 0; i < rows; i++) {
      const cell = A1(a.r + 1 + i, a.c + 1 + cols);
      checks.push({ cell, type: 'isFormula' });
      checks.push({ cell, type: 'value', expect: data[i].reduce((s, v) => s + v, 0) });
    }
    const solution = navPath({ r: 1, c: 1 }, { r: a.r + 1, c: a.c + 1 }).concat([
      'SHIFT+DOWN*' + rows, 'SHIFT+RIGHT*' + cols, 'ALT+='
    ]);
    const parKeys = countKeys(solution), t = timeBands(parKeys);
    return { story: 'Cross-foot the block in one shot', promptVars: { rows, cols }, grid, checks, solution, parKeys, par: t.par, timing: validateTiming(parKeys) };
  };

  /* --- lookup: INDEX/MATCH pull ------------------------------- */
  GENERATORS.lookup = function (rng) {
    const n = rng.int(5, 6);
    const a = jitterAnchor(rng, 5, n + 1, { rowJitter: 3, colJitter: 1 });
    const names = rng.shuffle(POOLS.companies).slice(0, n);
    const vals = names.map(() => rng.money(200, 8000, 10));
    const pickIdx = rng.int(0, n - 1);
    const grid = {}, checks = [];
    grid[A1(a.r, a.c)] = { t: 'Company', bold: true };
    grid[A1(a.r, a.c + 1)] = { t: 'EBITDA', bold: true };
    names.forEach((nm, i) => {
      grid[A1(a.r + 1 + i, a.c)] = { t: nm };
      grid[A1(a.r + 1 + i, a.c + 1)] = { v: vals[i], fmt: 'comma', blue: true };
    });
    const keyCell = A1(a.r, a.c + 3), ansCell = A1(a.r + 1, a.c + 3);
    grid[keyCell] = { t: names[pickIdx], bold: true };
    grid[A1(a.r + 1, a.c + 2)] = { t: 'EBITDA →' };
    const valRange = A1(a.r + 1, a.c + 1) + ':' + A1(a.r + n, a.c + 1);
    const nameRange = A1(a.r + 1, a.c) + ':' + A1(a.r + n, a.c);
    checks.push({ cell: ansCell, type: 'isFormula' });
    checks.push({ cell: ansCell, type: 'formula', mustContain: ['INDEX', 'MATCH'] });
    checks.push({ cell: ansCell, type: 'value', expect: vals[pickIdx] });
    const solution = navPath({ r: 1, c: 1 }, { r: a.r + 1, c: a.c + 3 }).concat([
      'TYPE:=INDEX(' + valRange + ',MATCH(' + keyCell + ',' + nameRange + ',0))', 'ENTER'
    ]);
    const parKeys = countKeys(solution), t = timeBands(parKeys);
    return { story: 'Pull the metric with INDEX/MATCH', promptVars: { target: names[pickIdx] }, grid, checks, solution, parKeys, par: t.par, timing: validateTiming(parKeys) };
  };

  /* --- pastevalues: flatten formulas, clear the source -------- */
  GENERATORS.pastevalues = function (rng) {
    const n = rng.int(4, 5);
    const a = jitterAnchor(rng, 4, n + 1, { rowJitter: 4, colJitter: 2 });
    const grid = {}, checks = [];
    grid[A1(a.r, a.c)] = { t: 'Final', bold: true };
    grid[A1(a.r, a.c + 2)] = { t: 'Scratch', bold: true };
    const vals = [];
    for (let i = 0; i < n; i++) {
      const src = rng.money(100, 4000, 5), mult = rng.pick([2, 3, 4]);
      vals.push(src * mult);
      grid[A1(a.r + 1 + i, a.c + 2)] = { v: src, fmt: 'comma', blue: true };
      grid[A1(a.r + 1 + i, a.c)] = { f: '=' + A1(a.r + 1 + i, a.c + 2) + '*' + mult, v: src * mult, fmt: 'comma' };
      checks.push({ cell: A1(a.r + 1 + i, a.c), type: 'isValue' });
      checks.push({ cell: A1(a.r + 1 + i, a.c), type: 'value', expect: vals[i] });
      checks.push({ cell: A1(a.r + 1 + i, a.c + 2), type: 'empty' });
    }
    const solution = navPath({ r: 1, c: 1 }, { r: a.r + 1, c: a.c }).concat([
      'SHIFT+DOWN*' + (n - 1), 'CTRL+C', 'ALT:ESV', 'ENTER',
      'RIGHT*2', 'SHIFT+DOWN*' + (n - 1), 'DELETE'
    ]);
    const parKeys = countKeys(solution), t = timeBands(parKeys);
    return { story: 'Flatten to values, kill the scratch column', promptVars: { rows: n }, grid, checks, solution, parKeys, par: t.par, timing: validateTiming(parKeys) };
  };

  /* --- transpose: row → column via paste special -------------- */
  GENERATORS.transpose = function (rng) {
    const n = rng.int(4, 5);
    const a = { r: rng.int(2, 3), c: rng.int(2, 3) };
    const qs = POOLS.quarters(rng, n);
    const vals = qs.map(() => rng.money(100, 3000, 5));
    const grid = {}, checks = [];
    grid[A1(a.r, a.c)] = { t: 'Quarter', bold: true };
    grid[A1(a.r + 1, a.c)] = { t: 'Revenue', bold: true };
    qs.forEach((q, j) => {
      grid[A1(a.r, a.c + 1 + j)] = { t: q };
      grid[A1(a.r + 1, a.c + 1 + j)] = { v: vals[j], fmt: 'comma', blue: true };
    });
    const tr = a.r + 3, tc = a.c;
    grid[A1(tr, tc)] = { t: '▼ Transpose here', bold: true };
    qs.forEach((q, j) => {
      checks.push({ cell: A1(tr + 1 + j, tc), type: 'text', expect: q });
      checks.push({ cell: A1(tr + 1 + j, tc + 1), type: 'value', expect: vals[j] });
    });
    const solution = navPath({ r: 1, c: 1 }, { r: a.r, c: a.c + 1 }).concat([
      'SHIFT+DOWN', 'SHIFT+RIGHT*' + (n - 1), 'CTRL+C',
      navPath({ r: a.r, c: a.c + 1 }, { r: tr + 1, c: tc }),
      'ALT:ESE', 'ENTER'
    ].flat());
    const parKeys = countKeys(solution), t = timeBands(parKeys);
    return { story: 'Flip the row into a column', promptVars: { n }, grid, checks, solution, parKeys, par: t.par, timing: validateTiming(parKeys) };
  };

  /* --- sort: descending single-column sort --------------------- */
  GENERATORS.sort = function (rng) {
    const n = rng.int(6, 7);
    const a = jitterAnchor(rng, 2, n + 1, { rowJitter: 3, colJitter: 4 });
    let vals = [];
    while (new Set(vals).size < n) vals = Array.from({ length: n }, () => rng.money(100, 9000, 10));
    const grid = {}, checks = [];
    grid[A1(a.r, a.c)] = { t: 'EBITDA (sort ↓)', bold: true };
    vals.forEach((v, i) => { grid[A1(a.r + 1 + i, a.c)] = { v, fmt: 'comma', blue: true }; });
    const sorted = vals.slice().sort((x, y) => y - x);
    sorted.forEach((v, i) => checks.push({ cell: A1(a.r + 1 + i, a.c), type: 'value', expect: v }));
    const solution = navPath({ r: 1, c: 1 }, { r: a.r + 1, c: a.c }).concat([
      'SHIFT+DOWN*' + (n - 1), 'ALT:ASD'
    ]);
    const parKeys = countKeys(solution), t = timeBands(parKeys);
    return { story: 'Sort descending', promptVars: { n }, grid, checks, solution, parKeys, par: t.par, timing: validateTiming(parKeys), engineNote: 'requires sort action support — verify against live engine' };
  };

  /* --- comps: EV/EBITDA column + median ------------------------ */
  GENERATORS.comps = function (rng) {
    const n = rng.int(5, 6);
    const a = jitterAnchor(rng, 4, n + 2, { rowJitter: 2, colJitter: 1 });
    const names = rng.shuffle(POOLS.companies).slice(0, n);
    const grid = {}, checks = [];
    ['Company', 'EV', 'EBITDA', 'EV/EBITDA'].forEach((h, j) => {
      grid[A1(a.r, a.c + j)] = { t: h, bold: true };
    });
    const mults = [];
    names.forEach((nm, i) => {
      const r = a.r + 1 + i;
      const ebitda = rng.money(200, 2000, 10);
      const ev = Math.round(ebitda * rng.float(5, 14, 1));
      mults.push(ev / ebitda);
      grid[A1(r, a.c)] = { t: nm };
      grid[A1(r, a.c + 1)] = { v: ev, fmt: 'comma', blue: true };
      grid[A1(r, a.c + 2)] = { v: ebitda, fmt: 'comma', blue: true };
      const cell = A1(r, a.c + 3);
      checks.push({ cell, type: 'isFormula' });
      checks.push({ cell, type: 'formula', mustContain: [A1(r, a.c + 1), A1(r, a.c + 2)] });
      checks.push({ cell, type: 'value', expect: ev / ebitda, tol: 1e-4 });
    });
    const medR = a.r + 1 + n;
    grid[A1(medR, a.c)] = { t: 'Median', bold: true };
    const medCell = A1(medR, a.c + 3);
    const s = mults.slice().sort((x, y) => x - y);
    const median = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
    checks.push({ cell: medCell, type: 'isFormula' });
    checks.push({ cell: medCell, type: 'formula', mustContain: ['MEDIAN'] });
    checks.push({ cell: medCell, type: 'value', expect: median, tol: 1e-4 });
    const multRange = A1(a.r + 1, a.c + 3) + ':' + A1(a.r + n, a.c + 3);
    const solution = navPath({ r: 1, c: 1 }, { r: a.r + 1, c: a.c + 3 }).concat([
      'TYPE:=' + A1(a.r + 1, a.c + 1) + '/' + A1(a.r + 1, a.c + 2), 'ENTER', 'UP',
      'SHIFT+DOWN*' + (n - 1), 'CTRL+D',
      'DOWN*' + n, // land on median row (selection collapses to active cell path — safe upper bound)
      'TYPE:=MEDIAN(' + multRange + ')', 'ENTER'
    ]);
    const parKeys = countKeys(solution), t = timeBands(parKeys);
    return { story: 'Spread the comps, take the median', promptVars: { n }, grid, checks, solution, parKeys, par: t.par, timing: validateTiming(parKeys) };
  };

  /* --- schedule: debt corkscrew, fill right -------------------- */
  GENERATORS.schedule = function (rng) {
    const nY = rng.int(4, 5);
    const a = jitterAnchor(rng, nY + 1, 6, { rowJitter: 2, colJitter: 1 });
    const opening = rng.money(1000, 8000, 100);
    const rate = rng.pick([0.05, 0.1, 0.15, 0.2]);
    const grid = {}, checks = [];
    grid[A1(a.r, a.c)] = { t: 'Opening debt', bold: true };
    grid[A1(a.r, a.c + 1)] = { v: opening, fmt: 'comma', blue: true };
    grid[A1(a.r + 1, a.c)] = { t: 'Amort %', bold: true };
    grid[A1(a.r + 1, a.c + 1)] = { v: rate, fmt: 'pct1', blue: true };
    const yrs = POOLS.years(rng, nY);
    yrs.forEach((y, j) => { grid[A1(a.r + 2, a.c + 1 + j)] = { t: y, bold: true }; });
    ['BOP', 'Paydown', 'EOP'].forEach((lbl, i) => { grid[A1(a.r + 3 + i, a.c)] = { t: lbl }; });
    const bopR = a.r + 3, payR = a.r + 4, eopR = a.r + 5;
    let bop = opening;
    for (let j = 0; j < nY; j++) {
      const pay = bop * rate, eop = bop - pay;
      checks.push({ cell: A1(bopR, a.c + 1 + j), type: 'isFormula' });
      checks.push({ cell: A1(bopR, a.c + 1 + j), type: 'value', expect: bop, tol: 0.01 });
      checks.push({ cell: A1(payR, a.c + 1 + j), type: 'isFormula' });
      checks.push({ cell: A1(payR, a.c + 1 + j), type: 'value', expect: pay, tol: 0.01 });
      checks.push({ cell: A1(eopR, a.c + 1 + j), type: 'isFormula' });
      checks.push({ cell: A1(eopR, a.c + 1 + j), type: 'value', expect: eop, tol: 0.01 });
      bop = eop;
    }
    const rateRef = '$' + colLetter(a.c + 1) + '$' + (a.r + 1);
    const c1 = a.c + 1;
    const solution = navPath({ r: 1, c: 1 }, { r: bopR, c: c1 }).concat([
      'TYPE:=' + A1(a.r, c1), 'ENTER',                                  // BOP y1 = opening
      'TYPE:=' + A1(bopR, c1) + '*' + A1(a.r + 1, c1), 'F4', 'ENTER',   // Paydown = BOP * $rate$
      'TYPE:=' + A1(bopR, c1) + '-' + A1(payR, c1), 'ENTER',            // EOP = BOP - Paydown
      'UP*3', 'RIGHT',
      'TYPE:=' + A1(eopR, c1), 'ENTER',                                 // BOP y2 = EOP y1
      'UP', 'SHIFT+DOWN*2', 'SHIFT+RIGHT*' + (nY - 2), 'CTRL+R'         // fill the corkscrew
    ]);
    const parKeys = countKeys(solution), t = timeBands(parKeys);
    return { story: 'Run the debt corkscrew', promptVars: { years: nY, rate }, grid, checks, solution, parKeys, par: t.par, timing: validateTiming(parKeys) };
  };

  /* --- bridge: cumulative walk across deltas ------------------- */
  GENERATORS.bridge = function (rng) {
    const nD = rng.int(3, 4);
    const a = jitterAnchor(rng, nD + 2, 3, { rowJitter: 4, colJitter: 1 });
    const grid = {}, checks = [];
    const labels = ['Start'].concat(rng.shuffle(POOLS.costItems).slice(0, nD));
    const start = rng.money(1000, 5000, 50);
    const deltas = Array.from({ length: nD }, () => rng.money(-600, 600, 25) || 25);
    grid[A1(a.r, a.c)] = { t: rng.pick(POOLS.companies) + ' EBITDA walk', bold: true };
    labels.forEach((lbl, j) => { grid[A1(a.r + 1, a.c + j)] = { t: lbl, bold: true }; });
    grid[A1(a.r + 2, a.c)] = { v: start, fmt: 'comma', blue: true };
    let run = start;
    deltas.forEach((d, j) => {
      grid[A1(a.r + 1, a.c + 1 + j)].t = labels[j + 1];
      grid[A1(a.r + 3, a.c + 1 + j)] = { v: d, fmt: 'comma', blue: true }; // delta row beneath
      run += d;
      const cell = A1(a.r + 2, a.c + 1 + j);
      checks.push({ cell, type: 'isFormula' });
      checks.push({ cell, type: 'value', expect: run, tol: 0.01 });
      checks.push({ cell, type: 'formula', mustContain: [A1(a.r + 2, a.c + j), A1(a.r + 3, a.c + 1 + j)] });
    });
    const solution = navPath({ r: 1, c: 1 }, { r: a.r + 2, c: a.c + 1 }).concat([
      'TYPE:=' + A1(a.r + 2, a.c) + '+' + A1(a.r + 3, a.c + 1), 'ENTER', 'UP',
      'SHIFT+RIGHT*' + (nD - 1), 'CTRL+R'
    ]);
    const parKeys = countKeys(solution), t = timeBands(parKeys);
    return { story: 'Walk the bridge', promptVars: { steps: nD }, grid, checks, solution, parKeys, par: t.par, timing: validateTiming(parKeys) };
  };

  /* --- autosum: Alt+= reps across blocks ----------------------- */
  GENERATORS.autosum = function (rng) {
    const blocks = rng.int(2, 3), h = rng.int(3, 4);
    const a = jitterAnchor(rng, blocks * 2, h + 2, { rowJitter: 3, colJitter: 1 });
    const grid = {}, checks = [], solution = [];
    let from = { r: 1, c: 1 };
    for (let b = 0; b < blocks; b++) {
      const c = a.c + b * 2;
      grid[A1(a.r, c)] = { t: rng.pick(POOLS.segments), bold: true };
      let sum = 0;
      for (let i = 0; i < h; i++) {
        const v = rng.money(50, 1500, 5);
        sum += v;
        grid[A1(a.r + 1 + i, c)] = { v, fmt: 'comma', blue: true };
      }
      const totCell = A1(a.r + 1 + h, c);
      checks.push({ cell: totCell, type: 'isFormula' });
      checks.push({ cell: totCell, type: 'formula', mustContain: ['SUM'] });
      checks.push({ cell: totCell, type: 'value', expect: sum });
      const to = { r: a.r + 1 + h, c };
      solution.push(...navPath(from, to), 'ALT+=', 'ENTER');
      from = { r: to.r + 1, c: to.c }; // Enter moved down
    }
    const parKeys = countKeys(solution), t = timeBands(parKeys);
    return { story: 'AutoSum every block', promptVars: { blocks }, grid, checks, solution, parKeys, par: t.par, timing: validateTiming(parKeys) };
  };

  /* --- filldown: Ctrl+D an existing formula -------------------- */
  GENERATORS.filldown = function (rng) {
    const n = rng.int(6, 8);
    const a = jitterAnchor(rng, 3, n + 1, { minRow: 3, minCol: 3, rowJitter: 3, colJitter: 2 });
    const grid = {}, checks = [];
    grid[A1(a.r, a.c)] = { t: 'Units', bold: true };
    grid[A1(a.r, a.c + 1)] = { t: 'Revenue', bold: true };
    const price = rng.pick([12, 15, 20, 25]);
    const units = Array.from({ length: n }, () => rng.money(40, 900, 5));
    units.forEach((u, i) => { grid[A1(a.r + 1 + i, a.c)] = { v: u, fmt: 'comma', blue: true }; });
    grid[A1(a.r + 1, a.c + 1)] = { f: '=' + A1(a.r + 1, a.c) + '*' + price, v: units[0] * price, fmt: 'comma' };
    for (let i = 1; i < n; i++) {
      const cell = A1(a.r + 1 + i, a.c + 1);
      checks.push({ cell, type: 'isFormula' });
      checks.push({ cell, type: 'value', expect: units[i] * price });
    }
    const solution = navPath({ r: 1, c: 1 }, { r: a.r + 1, c: a.c + 1 }).concat([
      'SHIFT+DOWN*' + (n - 1), 'CTRL+D'
    ]);
    const parKeys = countKeys(solution), t = timeBands(parKeys);
    return { story: 'Fill the formula down', promptVars: { rows: n }, grid, checks, solution, parKeys, par: t.par, timing: validateTiming(parKeys) };
  };

  /* --- anchor: F4 lock a shared assumption --------------------- */
  GENERATORS.anchor = function (rng) {
    const n = rng.int(4, 5);
    const a = jitterAnchor(rng, 3, n + 3, { rowJitter: 2, colJitter: 2 });
    const grid = {}, checks = [];
    const fx = rng.pick([1.08, 1.27, 0.92, 1.35]);
    grid[A1(a.r, a.c)] = { t: 'FX rate', bold: true };
    grid[A1(a.r, a.c + 1)] = { v: fx, blue: true };
    grid[A1(a.r + 1, a.c)] = { t: 'Local', bold: true };
    grid[A1(a.r + 1, a.c + 1)] = { t: 'USD', bold: true };
    const fxRefAbs = '$' + colLetter(a.c + 1) + '$' + a.r;
    const vals = Array.from({ length: n }, () => rng.money(100, 4000, 10));
    vals.forEach((v, i) => {
      const r = a.r + 2 + i;
      grid[A1(r, a.c)] = { v, fmt: 'comma', blue: true };
      const cell = A1(r, a.c + 1);
      checks.push({ cell, type: 'isFormula' });
      checks.push({ cell, type: 'value', expect: v * fx, tol: 0.01 });
      checks.push({ cell, type: 'formula', mustContain: [A1(r, a.c), fxRefAbs] });
    });
    const solution = navPath({ r: 1, c: 1 }, { r: a.r + 2, c: a.c + 1 }).concat([
      'TYPE:=' + A1(a.r + 2, a.c) + '*' + A1(a.r, a.c + 1), 'F4', 'ENTER', 'UP',
      'SHIFT+DOWN*' + (n - 1), 'CTRL+D'
    ]);
    const parKeys = countKeys(solution), t = timeBands(parKeys);
    return { story: 'Lock the assumption with F4', promptVars: { rows: n }, grid, checks, solution, parKeys, par: t.par, timing: validateTiming(parKeys) };
  };

  /* --- cagr: one clean power formula --------------------------- */
  GENERATORS.cagr = function (rng) {
    const a = jitterAnchor(rng, 3, 5, { rowJitter: 5, colJitter: 4 });
    const grid = {}, checks = [];
    const beg = rng.money(500, 3000, 50);
    const yrs = rng.int(3, 7);
    const end = Math.round(beg * Math.pow(rng.float(1.04, 1.2), yrs));
    grid[A1(a.r, a.c)] = { t: 'Begin', bold: true }; grid[A1(a.r, a.c + 1)] = { v: beg, fmt: 'comma', blue: true };
    grid[A1(a.r + 1, a.c)] = { t: 'End', bold: true }; grid[A1(a.r + 1, a.c + 1)] = { v: end, fmt: 'comma', blue: true };
    grid[A1(a.r + 2, a.c)] = { t: 'Years', bold: true }; grid[A1(a.r + 2, a.c + 1)] = { v: yrs, blue: true };
    grid[A1(a.r + 3, a.c)] = { t: 'CAGR', bold: true };
    const cell = A1(a.r + 3, a.c + 1);
    const expect = Math.pow(end / beg, 1 / yrs) - 1;
    checks.push({ cell, type: 'isFormula' });
    checks.push({ cell, type: 'value', expect, tol: 1e-4 });
    checks.push({ cell, type: 'fmt', expect: 'pct1' });
    const eRef = A1(a.r + 1, a.c + 1), bRef = A1(a.r, a.c + 1), yRef = A1(a.r + 2, a.c + 1);
    const solution = navPath({ r: 1, c: 1 }, { r: a.r + 3, c: a.c + 1 }).concat([
      'TYPE:=(' + eRef + '/' + bRef + ')^(1/' + yRef + ')-1', 'ENTER', 'UP',
      'CTRL+SHIFT+5', 'ALT:H9'
    ]);
    const parKeys = countKeys(solution), t = timeBands(parKeys);
    return { story: 'One-cell CAGR', promptVars: { yrs }, grid, checks, solution, parKeys, par: t.par, timing: validateTiming(parKeys) };
  };

  /* --- sumif: category rollup with mixed anchors ---------------- */
  GENERATORS.sumif = function (rng) {
    const nRows = 7, nCats = 3;
    const a = jitterAnchor(rng, 5, nRows + 1, { rowJitter: 2, colJitter: 1 });
    const cats = rng.shuffle(POOLS.segments).slice(0, nCats);
    const grid = {}, checks = [];
    grid[A1(a.r, a.c)] = { t: 'Segment', bold: true };
    grid[A1(a.r, a.c + 1)] = { t: 'Amount', bold: true };
    grid[A1(a.r, a.c + 3)] = { t: 'Rollup', bold: true };
    const sums = {};
    cats.forEach(c => sums[c] = 0);
    for (let i = 0; i < nRows; i++) {
      const cat = cats[i < nCats ? i : rng.int(0, nCats - 1)]; // each cat appears ≥1×
      const v = rng.money(50, 1200, 5);
      sums[cat] += v;
      grid[A1(a.r + 1 + i, a.c)] = { t: cat };
      grid[A1(a.r + 1 + i, a.c + 1)] = { v, fmt: 'comma', blue: true };
    }
    const catRange = '$' + colLetter(a.c) + '$' + (a.r + 1) + ':$' + colLetter(a.c) + '$' + (a.r + nRows);
    const amtRange = '$' + colLetter(a.c + 1) + '$' + (a.r + 1) + ':$' + colLetter(a.c + 1) + '$' + (a.r + nRows);
    cats.forEach((cat, i) => {
      const r = a.r + 1 + i;
      grid[A1(r, a.c + 3)] = { t: cat };
      const cell = A1(r, a.c + 4);
      checks.push({ cell, type: 'isFormula' });
      checks.push({ cell, type: 'formula', mustContain: ['SUMIF', A1(r, a.c + 3)] });
      checks.push({ cell, type: 'value', expect: sums[cat] });
    });
    const solution = navPath({ r: 1, c: 1 }, { r: a.r + 1, c: a.c + 4 }).concat([
      'TYPE:=SUMIF(' + catRange + ',' + A1(a.r + 1, a.c + 3) + ',' + amtRange + ')', 'ENTER', 'UP',
      'SHIFT+DOWN*' + (nCats - 1), 'CTRL+D'
    ]);
    const parKeys = countKeys(solution), t = timeBands(parKeys);
    return { story: 'Roll up by segment with SUMIF', promptVars: { cats: nCats }, grid, checks, solution, parKeys, par: t.par, timing: validateTiming(parKeys) };
  };

  /* ----------------------------------------------------------
     Naive nav path (arrows only, Manhattan). Generators can use
     ctrl-jumps explicitly where the layout guarantees data edges;
     the naive path is the safe upper bound and keeps par honest.
  ---------------------------------------------------------- */
  function navPath(from, to) {
    const toks = [];
    const dr = to.r - from.r, dc = to.c - from.c;
    if (dr > 0) toks.push('DOWN*' + dr); else if (dr < 0) toks.push('UP*' + (-dr));
    if (dc > 0) toks.push('RIGHT*' + dc); else if (dc < 0) toks.push('LEFT*' + (-dc));
    return toks.map(t => (t.endsWith('*1') ? t.slice(0, -2) : t));
  }

  /* ----------------------------------------------------------
     simulateSolve: apply each check's expected end-state to a
     copy of the start grid, then assert runChecks passes. Used
     by the self-test harness to prove every generated instance
     is internally consistent (expected values really satisfy
     the checks it emits).
  ---------------------------------------------------------- */
  function simulateSolve(inst) {
    const S = { cells: {} };
    for (const ref of Object.keys(inst.grid)) S.cells[ref] = Object.assign({}, inst.grid[ref]);
    for (const ck of inst.checks) {
      const c = S.cells[ck.cell] = S.cells[ck.cell] || {};
      switch (ck.type) {
        case 'value': c.v = ck.expect; break;
        case 'text': c.t = ck.expect; break;
        case 'isFormula': if (!c.f) c.f = '=SIM'; break;
        case 'isValue': delete c.f; if (c.v == null) c.v = 0; break;
        case 'formula': c.f = '=' + (ck.mustContain || []).join('&'); break;
        case 'fmt': c.fmt = ck.expect; break;
        case 'bold': c.bold = !!ck.expect; break;
        case 'blue': c.blue = !!ck.expect; break;
        case 'empty': delete c.v; delete c.f; delete c.t; break;
      }
    }
    return runChecks(inst.checks, S);
  }

  /* ----------------------------------------------------------
     Public API
  ---------------------------------------------------------- */
  function make(key, seed) {
    if (!GENERATORS[key]) throw new Error('DrillGen: no generator for "' + key + '"');
    const s = (seed == null) ? (Math.random() * 2 ** 32) >>> 0 : seed >>> 0;
    const inst = GENERATORS[key](makeRng(s));
    inst.seed = s; inst.key = key;
    return inst;
  }

  const API = {
    make, makeRng, runChecks, simulateSolve, countKeys, tokenKeys, timeBands, validateTiming,
    jitterAnchor, navPath, GENERATORS, POOLS, GRID, ENGINE_ADAPTER, A1, parseA1, colLetter
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (root) root.DrillGen = API;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
