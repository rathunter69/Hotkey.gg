// app2/engine/calc.js — the workbook's calculation graph: dirty tracking across sheets.
//
// One graph serves a whole workbook (the Session wires every sheet to it; a sheet on its own makes
// one for itself). It remembers, per cell, what it last saw (formula and value) and, per formula
// cell, what that formula reads (its static references, plus whatever it actually dereferenced the
// last time it ran: OFFSET / INDEX / INDIRECT-built ranges, defined names, cross-sheet reads).
// A recalc diffs the sheets against what was seen, marks the changed cells' readers dirty through
// the reverse edges, and evaluates only those, in dependency order, across every sheet at once:
// an edit on Inputs recalculates the lines of IS, CF, BS and DCF that read it and nothing else.
//
// Circular references among the dirty cells are found by DFS; with iterative calculation off the
// members read 0 (Excel's display), with it on they are iterated up to Maximum Iterations or until
// no member moves by more than Maximum Change, then their readers run once more. Dynamic arrays
// spill from here too: an anchor clears and rewrites its block, a blocked block makes it #SPILL!,
// and a reader of a spilled cell follows its anchor.
import { evalFormula, formulaRefs, isErrVal } from './formula.js';
import { refKey, parseRef } from './refs.js';

const VOLATILE = /\b(TODAY|NOW|RAND|RANDBETWEEN|RANDARRAY)\s*\(/i;
const rectKeys = rg => { const out = []; for (let r = rg.r1; r <= rg.r2; r++) for (let c = rg.c1; c <= rg.c2; c++) out.push(refKey(r, c)); return out; };
const same = (a, b) => a === b || (Number.isNaN(a) && Number.isNaN(b));
const byPos = (a, b) => { const A = parseRef(a), B = parseRef(b); return (A.r - B.r) || (A.c - B.c); };
let CID = 0;
/** A sheet's id in the graph (stable for the object's life; sheet names may change). */
export const sheetId = sheet => sheet._cid || (sheet._cid = ++CID);

export class CalcGraph {
  /** `sheetsFn` lists the workbook: () => [{ name, sheet }]. */
  constructor(sheetsFn) {
    this.sheetsFn = sheetsFn;
    this.deps = new Map();      // formula cell → Set of the cells it reads (full keys cid!A1)
    this.rdeps = new Map();     // cell → Set of the formula cells that read it
    this.stat = new Map();      // formula cell → { f, set }: its static references, memoised on the formula text
    this.seen = new Map();      // cid → Map key → { f, v }: what the last recalc saw
    this.volatile = new Set();  // formula cells that recalculate on every pass (TODAY, RAND…)
    this.cyclic = new Set();    // the cells in a circular reference after the last recalc
    this.known = new Map();     // cid → sheet, for every sheet the graph has touched (the list, plus sheets reached through a resolver)
    this.evals = 0;             // formula evaluations in the last recalc (the benchmark reads it)
    this.created = null;        // while a caller collects them (the liveness probe): [{ sheet, key }] of the cells a spill created, so it can remove them again
  }
  /** Forget everything: the next recalc evaluates every formula (a sheet renamed, added or removed; names changed). */
  invalidate() { this.deps.clear(); this.rdeps.clear(); this.stat.clear(); this.seen.clear(); this.volatile.clear(); this.cyclic.clear(); this.known.clear(); }

  /* ---- keys ---- */
  fk(sheet, key) { let m = sheet._fks; if (!m) m = sheet._fks = new Map(); let f = m.get(key); if (!f) { f = sheetId(sheet) + '!' + key; m.set(key, f); } return f; }   // interned: a recalc reads the same keys thousands of times
  split(fk) { const i = fk.indexOf('!'); return { cid: +fk.slice(0, i), key: fk.slice(i + 1) }; }
  sheetOf(fk) { return this.known.get(+fk.slice(0, fk.indexOf('!'))); }
  /** Every sheet the graph covers: the workbook's list, plus any sheet a formula reached through a resolver. */
  refreshKnown() {
    const list = this.sheetsFn() || [];
    for (const e of list) this.known.set(sheetId(e.sheet), e.sheet);
    this.byName = new Map(); for (const e of list) this.byName.set(String(e.name).toLowerCase(), e.sheet);
  }
  /** The sheet a reference names, through the workbook list or the reading sheet's resolver (null: none). */
  named(from, name) {
    const lower = String(name).toLowerCase();
    let T = this.byName.get(lower) || null;
    if (!T && from.resolver) { T = from.resolver(name) || null; if (T) { this.known.set(sheetId(T), T); this.byName.set(lower, T); } }
    return T;
  }

  /* ---- edges ---- */
  setDeps(fk, set) {
    const old = this.deps.get(fk); if (old === set) return;
    if (old) for (const d of old) if (!set.has(d)) { const r = this.rdeps.get(d); if (r) { r.delete(fk); if (!r.size) this.rdeps.delete(d); } }
    for (const d of set) { if (old && old.has(d)) continue; let r = this.rdeps.get(d); if (!r) { r = new Set(); this.rdeps.set(d, r); } r.add(fk); }
    if (set.size) this.deps.set(fk, set); else this.deps.delete(fk);
  }
  /** The cells a formula names: references (ranges clipped to the grid), plus the block its spill (or its blocked spill) covers, so a cell landing there re-runs the anchor. */
  staticDeps(S, key, c) {
    const fk = this.fk(S, key);
    let m = this.stat.get(fk);
    if (!m || m.f !== c.formula) {
      const set = new Set();
      for (const ref of formulaRefs(c.formula, { rows: S.rows, cols: S.cols })) {
        const T = ref.sheet ? this.named(S, ref.sheet) : S; if (!T) continue;
        if (ref.key) set.add(this.fk(T, ref.key));
        else { const rg = ref.range; for (let r = Math.max(1, rg.r1); r <= Math.min(rg.r2, T.rows); r++) for (let cc = Math.max(1, rg.c1); cc <= Math.min(rg.c2, T.cols); cc++) set.add(this.fk(T, refKey(r, cc))); }
      }
      m = { f: c.formula, set }; this.stat.set(fk, m);
      if (VOLATILE.test(c.formula)) this.volatile.add(fk); else this.volatile.delete(fk);
    }
    if (!c.spillTo && !c.spillWant) return m.set;   // shared with the memo: callers copy before adding
    const out = new Set(m.set);
    for (const rect of [c.spillTo, c.spillWant]) if (rect) for (const kk of rectKeys(rect)) if (kk !== key) out.add(this.fk(S, kk));
    return out;
  }

  /* ---- the recalc ---- */
  /**
   * Bring every formula the last changes reach up to date. `trigger` is the sheet whose commit
   * asked (diffed first; every known sheet is diffed, since a workbook operation may have touched
   * several). Sets each sheet's `circular`. `only` ([{ sheet, key }]) narrows the diff to the
   * cells named, for a caller that knows exactly what it changed since the last recalc.
   */
  recalc(trigger, only) {
    this.refreshKnown();
    const dirty = new Set(); const touched = new Set();   // touched: cells whose record changed under us (spills), to re-snapshot
    const push = (fk) => { const stack = [fk]; while (stack.length) { const k = stack.pop(); if (dirty.has(k)) continue; dirty.add(k); const r = this.rdeps.get(k); if (r) for (const x of r) if (!dirty.has(x)) stack.push(x); } };
    const seenOf = cid => { let m = this.seen.get(cid); if (!m) { m = new Map(); this.seen.set(cid, m); } return m; };
    const markReaders = fk => { const r = this.rdeps.get(fk); if (r) for (const x of r) push(x); };
    // 1. what changed since the last recalc
    const sheets = [...this.known.values()]; if (trigger && !this.known.has(sheetId(trigger))) { sheets.push(trigger); this.known.set(sheetId(trigger), trigger); }
    const diffKey = (S, cid, seen, k) => {   // one cell against what the last recalc saw: its record, its edges, its readers
      const c = S.cells[k];
      if (!c) { const s0 = seen.get(k); if (!s0) return; seen.delete(k); const fk = cid + '!' + k; if (s0.f) { this.setDeps(fk, new Set()); this.stat.delete(fk); this.volatile.delete(fk); this.cyclic.delete(fk); } if (s0.f || s0.v !== null) markReaders(fk); return; }
      const f = c.formula || null, v = c.value; const s0 = seen.get(k);
      if (s0 ? (s0.f === f && same(s0.v, v)) : (!f && v === null)) return;
      const fk = cid + '!' + k; if (f || v !== null) seen.set(k, { f, v }); else seen.delete(k);   // a blank is what no record means: not kept
      if (f) { this.setDeps(fk, this.staticDeps(S, k, c)); push(fk); } else if (s0 && s0.f) { this.setDeps(fk, new Set()); this.stat.delete(fk); this.volatile.delete(fk); this.cyclic.delete(fk); }
      markReaders(fk);
    };
    if (only) {   // the caller names every cell it changed since the last recalc (the liveness probe): diff those, not every sheet
      for (const { sheet: S, key } of only) { if (!this.known.has(sheetId(S))) this.known.set(sheetId(S), S); diffKey(S, sheetId(S), seenOf(sheetId(S)), key); }
    } else for (const S of sheets) {
      const cid = sheetId(S); const seen = seenOf(cid);
      for (const k in S.cells) diffKey(S, cid, seen, k);
      for (const k of [...seen.keys()]) if (!S.cells[k]) diffKey(S, cid, seen, k);
    }
    for (const fk of this.volatile) push(fk);
    // the calculation settings changed (iteration on or off, its limits): every circle runs again under the new rule
    const calc = (sheets[0] && sheets[0].calc) || {};
    const sig = (calc.iterative ? 1 : 0) + '|' + (calc.maxIterations | 0) + '|' + calc.maxChange;
    if (this.calcSig !== undefined && this.calcSig !== sig) for (const fk of this.cyclic) push(fk);
    this.calcSig = sig;
    for (const fk of this.cyclic) if (dirty.has(fk)) this.cyclic.delete(fk);   // re-detected below
    for (const S of sheets) S._cfMap = null;   // a conditional-formatting rule may read any sheet: every memo is re-evaluated on the next read
    this.evals = 0; this.dirtyCount = dirty.size;
    if (!dirty.size) { this.setCircular(); return; }

    // 2. evaluation: one formula, with its reads logged and its spill applied
    let reads = null, work = dirty, pos = null, stale = null, cur = null, newEdges = false;
    // a read of a cell of this pass that has not run yet (a dynamic reference the order could not see) leaves the reader stale: it runs again after
    const logRead = (T, kk) => { const d = this.fk(T, kk); reads.add(d); if (pos.has(d) && !pos.get(d).done && d !== cur) stale.add(cur); const t = T.cells[kk]; if (t && t.spill) reads.add(this.fk(T, t.spill)); };   // a reader of a spilled cell follows its anchor
    const ctxs = new Map();   // one logging context per sheet for the whole recalc
    const ctxFor = S => { let c = ctxs.get(S); if (!c) { c = S.evalCtx({
      raw: kk => { logRead(S, kk); return S.raw(kk); },
      sheetRaw: (name, kk) => { const T = this.named(S, name); if (!T) return S.externalRaw ? S.externalRaw(name, kk) : '#REF!'; logRead(T, kk); return T.raw(kk); },   // [Book.xlsx]Sheet!A1: the link's last known value
    }); ctxs.set(S, c); } return c; };
    const clearSpill = (S, key, c) => {
      if (!c.spillTo) return;
      for (const kk of rectKeys(c.spillTo)) { if (kk === key) continue; const t = S.cells[kk]; if (t && t.spill === key) { if (!t.formula && same(t.value, t.spillVal)) { t.value = null; t.txt = false; } delete t.spill; delete t.spillVal; } }
      delete c.spillTo;
    };
    const settleSpill = (S, key, snap, rect) => {   // the cells of the old and new blocks whose value moved: their readers run again, and the snapshot follows
      const keys = new Set(snap.keys()); if (rect) for (const kk of rectKeys(rect)) keys.add(kk);
      const seen = seenOf(sheetId(S));
      for (const kk of keys) { if (kk === key) continue; const t = S.cells[kk]; const v1 = t ? t.value : null, v0 = snap.has(kk) ? snap.get(kk) : null; if (!same(v0, v1)) { touched.add(this.fk(S, kk)); const f1 = t ? t.formula || null : null; if (f1 || v1 !== null) seen.set(kk, { f: f1, v: v1 }); else seen.delete(kk); } }
    };
    const applySpill = (S, key, c, rows) => {   // the anchor's block; false when a cell in the way (or the sheet's edge) blocks it
      const p = parseRef(key); const h = rows.length, w = rows[0].length;
      const want = { r1: p.r, c1: p.c, r2: p.r + h - 1, c2: p.c + w - 1 };
      if (want.r2 > S.rows || want.c2 > S.cols) { c.spillWant = want; return false; }
      for (let r = 0; r < h; r++) for (let cc = 0; cc < w; cc++) { if (!r && !cc) continue; const t = S.cells[refKey(p.r + r, p.c + cc)]; if (t && (t.formula || t.spill || (t.value !== null && t.value !== '' && t.value !== undefined))) { c.spillWant = want; return false; } }
      for (let r = 0; r < h; r++) for (let cc = 0; cc < w; cc++) { if (!r && !cc) continue; if (this.created && !S.cells[refKey(p.r + r, p.c + cc)]) this.created.push({ sheet: S, key: refKey(p.r + r, p.c + cc) }); const t = S.ensure(p.r + r, p.c + cc); const v = rows[r][cc]; t.value = v === null || v === undefined ? 0 : v; t.txt = typeof t.value === 'string' && !isErrVal(t.value); t.spill = key; t.spillVal = t.value; }
      c.spillTo = want; delete c.spillWant;
      return true;
    };
    const evalOne = fk => {   // true when the value moved; the amount in `delta`
      const { cid, key } = this.split(fk); const S = this.known.get(cid); const c = S && S.cells[key];
      if (!c || !c.formula) return false;
      this.evals++;
      reads = new Set(); cur = fk;
      const p = parseRef(key); let spill = null, v;
      let snap = null; if (c.spillTo) { snap = new Map(); for (const kk of rectKeys(c.spillTo)) { const t = S.cells[kk]; snap.set(kk, t ? t.value : null); } }
      const ctx = ctxFor(S); ctx.cell = p ? { r: p.r, c: p.c } : undefined; ctx.onSpill = rows => { spill = rows; };
      try { v = evalFormula(c.formula, ctx);
        if (c.spillTo || spill) { clearSpill(S, key, c); if (spill && !applySpill(S, key, c, spill)) v = '#SPILL!'; else if (!spill) delete c.spillWant; }
      } catch (e) { v = '#NAME?'; }   // a stored formula that no longer parses reads as an error
      if (snap || c.spillTo) settleSpill(S, key, snap || new Map(), c.spillTo);
      let set = this.staticDeps(S, key, c), own = false;
      for (const d of reads) if (!set.has(d)) { if (!own) { set = new Set(set); own = true; } set.add(d); }   // a dynamic read beyond the static references: the formula's own edge set
      const old = this.deps.get(fk);
      if (old !== set) for (const d of set) if (pos.has(d) && !(old && old.has(d))) { newEdges = true; break; }   // a new edge inside this pass: a circle may have closed that the order could not see
      this.setDeps(fk, set);
      const moved = !same(v, c.value);
      delta = moved ? (typeof v === 'number' && typeof c.value === 'number' ? Math.abs(v - c.value) : Infinity) : 0;
      c.value = v;
      const seen = seenOf(cid); const rec = seen.get(key); if (rec) { rec.f = c.formula; rec.v = v; } else seen.set(key, { f: c.formula, v });
      return moved;
    };
    let delta = 0;
    // 3. order the work set by its dependencies (edges inside the set only; the rest are current): Tarjan's
    // strongly connected components, dependencies first; a component of more than one cell, or a cell
    // reading itself, is a circular reference, every member of it
    const detect = () => {
      const kids = k => { const d = this.deps.get(k); const out = []; if (d) for (const x of d) if (work.has(x)) out.push(x); return out; };
      const idx = new Map(), low = new Map(), onStack = new Set(), S = [], order = [], cyclic = new Set(); let n = 0;
      for (const start of work) {
        if (idx.has(start)) continue;
        const frames = [[start, kids(start), 0]]; idx.set(start, n); low.set(start, n); n++; S.push(start); onStack.add(start);
        while (frames.length) {
          const fr = frames[frames.length - 1]; const v = fr[0], ks = fr[1];
          if (fr[2] < ks.length) {
            const w = ks[fr[2]++];
            if (!idx.has(w)) { idx.set(w, n); low.set(w, n); n++; S.push(w); onStack.add(w); frames.push([w, kids(w), 0]); }
            else if (onStack.has(w)) low.set(v, Math.min(low.get(v), idx.get(w)));
            continue;
          }
          frames.pop();
          if (frames.length) { const u = frames[frames.length - 1][0]; low.set(u, Math.min(low.get(u), low.get(v))); }
          if (low.get(v) === idx.get(v)) {
            const comp = []; let w; do { w = S.pop(); onStack.delete(w); comp.push(w); } while (w !== v);
            const d = this.deps.get(v); if (comp.length > 1 || (d && d.has(v))) for (const x of comp) cyclic.add(x);
            for (const x of comp) order.push(x);   // as popped: the deepest first, so a member runs after what it reads where the circle allows
          }
        }
      }
      return { order, cyclic };
    };
    const iterative = !!calc.iterative;
    const maxIter = Math.max(1, calc.maxIterations | 0) || 100, maxChange = Number.isFinite(calc.maxChange) ? calc.maxChange : 0.001;
    const CAP = 50;
    // the cells downstream (readers) or upstream (what is read) of the circles, inside the work set
    const closure = (from, edges) => { const out = new Set(); const stack = [...from]; while (stack.length) { const k = stack.pop(); const r = edges.get(k); if (r) for (const x of r) if (work.has(x) && !from.has(x) && !out.has(x)) { out.add(x); stack.push(x); } } return out; };
    const zero = k => { const { cid, key } = this.split(k); const S = this.known.get(cid); const c = S && S.cells[key]; if (!c) return false; const snap = new Map(); if (c.spillTo) for (const kk of rectKeys(c.spillTo)) { const t = S.cells[kk]; snap.set(kk, t ? t.value : null); } clearSpill(S, key, c); if (snap.size) settleSpill(S, key, snap, null); const moved = !same(c.value, 0); c.value = 0; seenOf(cid).set(key, { f: c.formula, v: 0 }); return moved; };
    this.passes = 0;
    for (let pass = 0; pass < CAP; pass++) {
      this.passes++;
      const { order, cyclic } = detect();
      pos = new Map(); for (const k of order) pos.set(k, { done: false });
      stale = new Set(); const moved = new Set(); touched.clear(); newEdges = false;
      const run = k => { if (evalOne(k)) moved.add(k); pos.get(k).done = true; };
      if (!iterative) { for (const k of order) { if (cyclic.has(k)) { if (zero(k)) moved.add(k); pos.get(k).done = true; } else run(k); } }
      else {
        for (const k of order) run(k);
        if (cyclic.size) {   // iterate the circles until no member moves by more than Maximum Change (or Maximum Iterations), then their readers see the settled values
          const down = closure(cyclic, this.rdeps), up = closure(cyclic, this.deps);
          const loop = new Set(cyclic); for (const k of down) if (up.has(k)) loop.add(k);   // a cell between two circles (last year's closing balance feeding this year's) iterates with them
          for (let it = 1; it < maxIter; it++) { let d = 0; for (const k of order) if (loop.has(k) && evalOne(k)) { moved.add(k); if (delta > d) d = delta; } if (d <= maxChange) break; }
          for (const k of order) if (down.has(k) && !loop.has(k)) run(k);
        }
      }
      for (const k of cyclic) { this.cyclic.add(k); stale.delete(k); }
      // 4. what must run again: stale readers, a reader of a spilled block that ran before its anchor, and readers the pass reached beyond the dirty set, each with its own readers
      const next = new Set(); const add = k => { if (!next.has(k)) next.add(k); };
      for (const k of stale) add(k);
      if (newEdges) { const again = detect(); for (const k of again.cyclic) if (!cyclic.has(k)) add(k); }   // a circle through a dynamic reference (OFFSET, a name): its members run again as a circle
      for (const k of moved) { const r = this.rdeps.get(k); if (r) for (const x of r) if (!dirty.has(x)) add(x); }
      for (const k of touched) { const r = this.rdeps.get(k); if (r) for (const x of r) { if (!dirty.has(x)) add(x); else { const q = pos.get(x); if (q && q.done && !cyclic.has(x)) add(x); } } }
      if (!next.size) break;
      if (pass === CAP - 2) { for (const k of next) { this.cyclic.add(k); zero(k); } break; }   // still moving at the cap: a circle the static references cannot see
      work = new Set(); for (const k of next) { const stack = [k]; while (stack.length) { const x = stack.pop(); if (work.has(x)) continue; work.add(x); dirty.add(x); const r = this.rdeps.get(x); if (r) for (const y of r) if (!work.has(y)) stack.push(y); } }
    }
    this.setCircular();
  }
  /** Each sheet's `circular`: its cells in a circle, in sheet order (the status bar and the warning read it). */
  setCircular() {
    const per = new Map(); for (const fk of this.cyclic) { const { cid, key } = this.split(fk); if (!per.has(cid)) per.set(cid, []); per.get(cid).push(key); }
    for (const [cid, S] of this.known) S.circular = (per.get(cid) || []).sort(byPos);
  }
}
