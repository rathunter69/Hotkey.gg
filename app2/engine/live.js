// app2/engine/live.js — the one shared "is this cell a live formula?" rule.
//
// A cell is LIVE when it holds a formula AND perturbing at least one input cell moves its output.
// No regex over the formula text: one input at a time is nudged through a short list of probes,
// the workbook recalculates, and the candidate cell's value is compared. So:
//   =SUM(B2:B4)     live (B2 moves it)        =B2*0    not live (nothing moves it)
//   =4470           not live (a hardcode dressed as a formula)
//   =B8             live (a single link still moves with its source)
// Formula cells count as inputs too (a chain =C3 → C3==B3+1 → B3 is live through B3).
//
// Which cells get nudged: the target's transitive static precedents — its references, expanded
// through the formula cells they reach, ranges clipped to the grid. A formula that reaches no
// input is dead without a single recalc (=4470 costs one tokenize). When a formula on that path
// builds references dynamically (OFFSET, INDIRECT, INDEX) the static walk cannot see everything,
// so every non-formula cell on the sheet is tried instead.
//
// How a nudge is made: in place, on the real workbook, through its own calculation graph (only
// the nudged cell's dependents recalculate), then put back and recalculated again, so the sheet
// inspected ends exactly as it started. Where a recalc would not repeat itself (RAND, NOW,
// iterative calculation, a circle already present) a recalculated clone of the workbook is
// probed instead, as the rule always did.

import { parseRef, refKey, normRef } from './refs.js';
import { formulaRefs, formulaFunctions } from './formula.js';
import { Sheet } from './sheet.js';

const clone = o => JSON.parse(JSON.stringify(o));
const DYNAMIC_FNS = ['OFFSET', 'INDIRECT', 'INDEX'];

/**
 * The values an input is nudged to, in order. The first is the cheap common case (a scaled
 * number, a suffixed text); the rest cross what one nudge cannot — a sign flip, zero and a large
 * value for threshold IFs, sign tests and MIN/MAX clamps; a changed head for LEFT/MID/FIND, a
 * shorter text for LEN thresholds and a blank for ISBLANK/="" tests. The text nudges are visible
 * characters: a zero-width space is collation-ignorable, so = and MATCH would not see it.
 * No probe equals the original (the numeric nudge 2v±1 away from zero has no fixed point).
 */
export function perturbations(v) {
  let list;
  if (typeof v === 'number') list = [v === 0 ? 1 : v > 0 ? v * 2 + 1 : v * 2 - 1, v === 0 ? -1 : -v - Math.sign(v), 0, Math.abs(v) < 1e6 ? 1e6 : v * 1000];
  else if (typeof v === 'boolean') list = [!v];
  else if (typeof v === 'string') list = [v + ' ~', '~ ' + v, null, v.slice(0, Math.floor(v.length / 2))];
  else list = [1];                                   // a blank becomes a number
  return list.filter((x, i) => x !== v && list.indexOf(x) === i);
}
/** The first (cheapest) nudge — the old single-value rule, kept for callers that want one. */
export function perturb(v) { return perturbations(v)[0]; }

/**
 * @param {Sheet} sheet
 * @param {string} ref  e.g. 'B6'
 * @param {object} [opts]  inputs: array of refs to try (default: the target's precedents, see above)
 * @returns {boolean}
 */
export function isLiveFormula(sheet, ref, opts = {}) {
  const key = normRef(ref); if (!key) return false;
  const target = sheet.cells[key];
  if (!target || !target.formula) return false;
  const inputs = opts.inputs ? opts.inputs.map(normRef).filter(Boolean) : inputsFor(sheet, key);
  const verdict = inputs.length > 0 && (inPlaceOk(sheet) ? probeInPlace(sheet, key, inputs) : probeCloneOf(sheet, key, inputs));
  if (liveHooks.onVerdict) liveHooks.onVerdict(sheet, key, opts, verdict);
  return verdict;
}

/** Every formula cell on the sheet that is live, as a list of refs. */
export function liveFormulas(sheet) {
  const keys = Object.keys(sheet.cells).filter(k => sheet.cells[k] && sheet.cells[k].formula); if (!keys.length) return [];
  if (inPlaceOk(sheet)) return keys.filter(k => { const inputs = inputsFor(sheet, k); return inputs.length > 0 && probeInPlace(sheet, k, inputs); });
  return liveFormulasByClone(sheet);
}
/** liveFormulas on a recalculated clone of the workbook, one clone for every cell (the reference, and the fallback). */
export function liveFormulasByClone(sheet) {
  const keys = Object.keys(sheet.cells).filter(k => sheet.cells[k] && sheet.cells[k].formula); if (!keys.length) return [];
  const test = cloneSheet(sheet);
  const base = {}; for (const k of keys) base[k] = test.value(k);
  return keys.filter(k => { const inputs = inputsFor(sheet, k); return inputs.length > 0 && probeClone(test, k, base[k], inputs); });
}

/**
 * Test seams. `liveHooks.onVerdict(sheet, key, opts, verdict)` sees every isLiveFormula answer;
 * `isLiveFormulaByClone` is the rule as it ran before the in-place probe (clone the workbook,
 * recalculate it whole, probe the clone). The equivalence test replays every lesson and checks
 * each in-place verdict against it.
 */
export const liveHooks = { onVerdict: null };
export function isLiveFormulaByClone(sheet, ref, opts = {}) {
  const key = normRef(ref); if (!key) return false;
  const target = sheet.cells[key];
  if (!target || !target.formula) return false;
  const inputs = opts.inputs ? opts.inputs.map(normRef).filter(Boolean) : inputsFor(sheet, key);
  return inputs.length > 0 && probeCloneOf(sheet, key, inputs);
}
function probeCloneOf(sheet, key, inputs) { const test = cloneSheet(sheet); return probeClone(test, key, test.value(key), inputs); }

function sameValue(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
  return a === b;
}

/*
 * The in-place probe needs a recalc that repeats itself: the put-back must land every value,
 * spill, edge and snapshot where it was. That fails for a volatile that moves on its own (RAND,
 * NOW, a TODAY with no case clock), under iterative calculation (a circle settles from where it
 * starts), and around a circle already in the workbook; those take the clone path.
 */
const UNSTABLE = /\b(RAND|RANDBETWEEN|RANDARRAY|NOW)\s*\(/i;
function inPlaceOk(sheet) {
  const book = sheet.book;
  if (!book || typeof book.recalc !== 'function') return false;
  if (!repeatable(book)) return false;   // asked before the catch-up recalc too: that recalc would redraw a RAND
  book.recalc(sheet);   // bring the workbook current first (a no-op after a commit), so the base is the recalculated value
  return repeatable(book);
}
function repeatable(book) {
  if (book.cyclic.size) return false;
  if (book.calcSig && book.calcSig[0] === '1') return false;   // iterative calculation is on
  for (const fk of book.volatile) {
    const S = book.sheetOf(fk); const c = S && S.cells[fk.slice(fk.indexOf('!') + 1)];
    if (c && c.formula && (UNSTABLE.test(c.formula) || !S.today)) return false;
  }
  return true;
}

/**
 * Nudge each input in turn on the real workbook; true on the first move of the target. The
 * graph is told exactly which cell changed, so a recalc diffs one cell and evaluates only its
 * dependents. Each input is put back (a blank made for the probe is removed) and recalculated
 * before the next, inside finally, so an exception cannot leave a nudge behind.
 */
function probeInPlace(sheet, key, inputs) {
  const book = sheet.book;
  const base = sheet.value(key);
  for (const inKey of inputs) {
    const bang = inKey.indexOf('!');   // 'COSTS!B3' names a cell of another sheet of the workbook
    const host = bang < 0 ? sheet : (sheet.resolver ? sheet.resolver(inKey.slice(0, bang)) : null);
    if (!host) continue;
    const k = bang < 0 ? inKey : inKey.slice(bang + 1);
    const existed = Object.prototype.hasOwnProperty.call(host.cells, k) && !!host.cells[k];
    if (existed && host.cells[k].formula) continue;   // only inputs are nudged; formula cells move through their own inputs
    const cell = existed ? host.cells[k] : (host.cells[k] = { value: null, formula: null });
    const orig = cell.value; const only = [{ sheet: host, key: k }]; let moved = false;
    // a cell a dynamic array spilled into: typing over it blocks the spill (#SPILL!), and the
    // anchor then forgets it; put back, it is the empty cell it was, and the anchor spills again
    const spilled = cell.spill !== undefined;
    const created = book.created = [];
    try {
      for (const v of perturbations(orig)) {
        cell.value = v;
        book.recalc(host, only);
        if (!sameValue(sheet.value(key), base)) { moved = true; break; }
      }
    } finally {
      if (spilled) { cell.value = null; delete cell.spill; delete cell.spillVal; } else cell.value = orig;
      if (!existed) delete host.cells[k];
      book.recalc(host, only);
      // a spill the nudge grew left blank records where it reached: they were not there before
      const gone = created.filter(e => { const c = e.sheet.cells[e.key]; return c && !c.formula && c.spill === undefined && c.value === null; });
      for (const e of gone) delete e.sheet.cells[e.key];
      book.created = null;
      if (gone.length) book.recalc(host, gone);
    }
    if (moved) return true;
  }
  return false;
}

/**
 * The clone path: a scratch copy of the sheet, recalculated, so the rule never touches the sheet
 * it inspects. A sheet in a workbook (Session sets `allSheets`) is cloned WITH its siblings, wired
 * to a resolver over the clones, so cross-sheet formulas keep working and probes on 'COSTS!B3'
 * land on the cloned Costs, never the real one.
 */
function cloneSheet(sheet) {
  const one = src => { const t = new Sheet({ rows: src.rows, cols: src.cols, today: src.today || undefined }); t.cells = clone(src.cells); return t; };
  if (typeof sheet.allSheets !== 'function') { const test = one(sheet); test.recalc(); return test; }
  const entries = sheet.allSheets().map(e => ({ name: e.name, sheet: one(e.sheet), src: e.sheet }));
  const lookup = name => { const e = entries.find(x => x.name.toLowerCase() === String(name).toLowerCase()); return e ? e.sheet : null; };
  for (const e of entries) e.sheet.resolver = lookup;
  for (const e of entries) e.sheet.recalc();
  const mine = entries.find(e => e.src === sheet);
  return mine ? mine.sheet : one(sheet);
}

/**
 * Nudge each input in turn on the scratch sheet and recalculate; true on the first move of the
 * target. Each input is put back before the next, so one scratch sheet serves many targets
 * (formula values are recomputed from the inputs on every recalc).
 */
function probeClone(test, key, base, inputs) {
  for (const inKey of inputs) {
    const bang = inKey.indexOf('!');
    const host = bang < 0 ? test : (test.resolver ? test.resolver(inKey.slice(0, bang)) : null);
    if (!host) continue;
    const k = bang < 0 ? inKey : inKey.slice(bang + 1);
    const cell = host.cells[k] || (host.cells[k] = { value: null, formula: null });
    if (cell.formula) continue;
    const orig = cell.value; let moved = false;
    for (const v of perturbations(orig)) {
      cell.value = v;
      if (host !== test) host.recalc();
      test.recalc();
      if (!sameValue(test.value(key), base)) { moved = true; break; }
    }
    cell.value = orig;
    if (host !== test) host.recalc();
    if (moved) return true;
  }
  return false;
}

/*
 * Precedents. A formula's in-grid references (ranges expanded and clipped to its sheet) and
 * whether it builds references dynamically depend only on its text and the sheet's size, so they
 * are memoised on those for the life of the process: a replay asks about the same formulas
 * hundreds of times, and the walk below visits only the cells the target reaches.
 */
const ENTRY_CACHE = new Map(); const ENTRY_CACHE_MAX = 20000;
function formulaEntry(sheet, formula) {
  const ck = sheet.rows + '|' + sheet.cols + '|' + formula;
  let ent = ENTRY_CACHE.get(ck);
  if (ent) return ent;
  const refs = new Set();
  for (const ref of formulaRefs(formula, { rows: sheet.rows, cols: sheet.cols })) {
    const pfx = ref.sheet ? ref.sheet + '!' : '';
    if (ref.key) { const p = parseRef(ref.key); if (p && sheet.inb(p.r, p.c)) refs.add(pfx + ref.key); }
    else if (ref.range) { const rg = ref.range; for (let r = Math.max(1, rg.r1); r <= Math.min(rg.r2, sheet.rows); r++) for (let cc = Math.max(1, rg.c1); cc <= Math.min(rg.c2, sheet.cols); cc++) refs.add(pfx + refKey(r, cc)); }
  }
  ent = { refs: [...refs], dynamic: formulaFunctions(formula).some(f => DYNAMIC_FNS.includes(f)) };
  if (ENTRY_CACHE.size >= ENTRY_CACHE_MAX) ENTRY_CACHE.clear();
  ENTRY_CACHE.set(ck, ent);
  return ent;
}
/** A cell's precedent entry (its references, and whether it is dynamic); null for a value or a blank. */
function entryAt(sheet, k) { const c = sheet.cells[k]; return c && c.formula ? formulaEntry(sheet, c.formula) : null; }

/**
 * The non-formula cells (blanks included) the target reaches through its static references,
 * non-empty ones first so the common case answers on the first probe. Every non-formula cell on
 * the sheet when a dynamic reference sits on the path.
 */
function inputsFor(sheet, key) {
  const seen = new Set([key]); const queue = [key]; const out = []; let dynamic = false;
  /** 'SITES!K5' on a formula cell: its references, each named with its sheet so the probe finds it. */
  const across = k => {
    const bang = k.indexOf('!'); if (bang < 0 || typeof sheet.allSheets !== 'function') return null;
    const name = k.slice(0, bang).toLowerCase();
    const e = sheet.allSheets().find(x => x.name.toLowerCase() === name); if (!e) return null;
    const ent = entryAt(e.sheet, k.slice(bang + 1)); if (!ent) return null;
    const own = sheet.allSheets().find(x => x.sheet === sheet);
    const name2 = d => (d.includes('!') ? d : e.name + '!' + d);
    // a reference back to this sheet is this sheet's own key, so the walk continues here
    const home = d => (own && d.toLowerCase().startsWith(own.name.toLowerCase() + '!') ? d.slice(own.name.length + 1) : d);
    return { refs: ent.refs.map(d => home(name2(d))), dynamic: ent.dynamic };
  };
  for (let qi = 0; qi < queue.length; qi++) {
    const k = queue[qi]; const ent = entryAt(sheet, k) || across(k);
    if (!ent) { out.push(k); continue; }   // a value or a blank: an input
    if (ent.dynamic) dynamic = true;
    for (const d of ent.refs) if (!seen.has(d)) { seen.add(d); queue.push(d); }
  }
  if (dynamic) return defaultInputs(sheet, key);
  return out.sort((a, b) => (sheet.cells[b] ? 1 : 0) - (sheet.cells[a] ? 1 : 0));
}

function defaultInputs(sheet, exclude) {
  const out = [];
  for (let r = 1; r <= sheet.rows; r++) for (let c = 1; c <= sheet.cols; c++) {
    const k = refKey(r, c); if (k === exclude) continue;
    const cell = sheet.cells[k]; if (cell && cell.formula) continue;
    out.push(k);
  }
  return out.sort((a, b) => (sheet.cells[b] ? 1 : 0) - (sheet.cells[a] ? 1 : 0));
}
