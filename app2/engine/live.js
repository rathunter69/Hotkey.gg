// app2/engine/live.js — the one shared "is this cell a live formula?" rule.
//
// A cell is LIVE when it holds a formula AND perturbing at least one input cell moves its output.
// No regex over the formula text: the sheet is cloned, one input at a time is nudged through a
// short list of probes, the sheet recalculates, and the candidate cell's value is compared. So:
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
  const inputs = opts.inputs ? opts.inputs.map(normRef).filter(Boolean) : inputsFor(sheet, key, precedentMap(sheet));
  if (!inputs.length) return false;
  const test = cloneSheet(sheet);
  return probe(test, key, test.value(key), inputs);
}

/** Every formula cell on the sheet that is live, as a list of refs. One clone and one precedent map serve every cell. */
export function liveFormulas(sheet) {
  const map = precedentMap(sheet);
  const keys = Object.keys(map); if (!keys.length) return [];
  const test = cloneSheet(sheet);
  const base = {}; for (const k of keys) base[k] = test.value(k);
  return keys.filter(k => { const inputs = inputsFor(sheet, k, map); return inputs.length > 0 && probe(test, k, base[k], inputs); });
}

function sameValue(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
  return a === b;
}

/**
 * A scratch copy of the sheet, recalculated, so the rule never touches the sheet it inspects.
 * A sheet in a workbook (Session sets `allSheets`) is cloned WITH its siblings, wired to a
 * resolver over the clones, so cross-sheet formulas keep working and probes on 'COSTS!B3'
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
 * target away from `base`. Each input is put back before the next, so one scratch sheet serves
 * many targets (formula values are recomputed from the inputs on every recalc).
 */
function probe(test, key, base, inputs) {
  for (const inKey of inputs) {
    // 'COSTS!B3' names a cell of another sheet in the cloned workbook
    const bang = inKey.indexOf('!');
    const host = bang < 0 ? test : (test.resolver ? test.resolver(inKey.slice(0, bang)) : null);
    if (!host) continue;
    const k = bang < 0 ? inKey : inKey.slice(bang + 1);
    const cell = host.cells[k] || (host.cells[k] = { value: null, formula: null });
    if (cell.formula) continue;   // only inputs are nudged; formula cells move through their own inputs
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

/** For every formula cell: the in-grid keys it references statically (ranges expanded) and whether it builds references dynamically. */
function precedentMap(sheet) {
  const map = {};
  for (const k in sheet.cells) {
    const c = sheet.cells[k]; if (!c || !c.formula) continue;
    const refs = new Set();
    for (const ref of formulaRefs(c.formula, { rows: sheet.rows, cols: sheet.cols })) {
      const pfx = ref.sheet ? ref.sheet + '!' : '';
      if (ref.key) { const p = parseRef(ref.key); if (p && sheet.inb(p.r, p.c)) refs.add(pfx + ref.key); }
      else if (ref.range) { const rg = ref.range; for (let r = Math.max(1, rg.r1); r <= Math.min(rg.r2, sheet.rows); r++) for (let cc = Math.max(1, rg.c1); cc <= Math.min(rg.c2, sheet.cols); cc++) refs.add(pfx + refKey(r, cc)); }
    }
    map[k] = { refs, dynamic: formulaFunctions(c.formula).some(f => DYNAMIC_FNS.includes(f)) };
  }
  return map;
}

/**
 * The non-formula cells (blanks included) the target reaches through its static references,
 * non-empty ones first so the common case answers on the first probe. Every non-formula cell on
 * the sheet when a dynamic reference sits on the path.
 */
function inputsFor(sheet, key, map) {
  const seen = new Set([key]); const queue = [key]; const out = []; let dynamic = false;
  while (queue.length) {
    const k = queue.shift(); const ent = map[k];
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
