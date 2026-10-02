// app2/content/lessons/lib/model-checks.js — the end-state checks and the hint builders Chapter 5's
// schedule and linking lessons share on the clearcoat-model workbook (modules 5.3 and 5.4).
//
// A line is graded on the learner's own workbook: every cell of it holds a formula, and its value is
// what the reference formula (the model's own, from the lesson's after state) gives when it is
// evaluated in the learner's sheet at that cell, so a line reads right whatever route built it and
// whatever the learner's inputs are. Liveness is the shared rule (engine/live.js): one cell of the
// goal is nudged through a named input on Inputs, and it has to move. No formula text is matched.
import { stateOf, ROW, COLS, PROJ_COLS } from '../../workbooks/clearcoat-model.js';
import { evalFormula } from '../../../engine/formula.js';
import { parseRef } from '../../../engine/refs.js';
import { isLiveFormula } from '../../../engine/live.js';
import { sheetIn, settled, near, isNum, calls, reads } from './databook-checks.js';

export { sheetIn, settled, near, isNum, calls, reads, COLS, PROJ_COLS, ROW };

const STATE_CACHE = {};
const stateCached = id => (STATE_CACHE[id] || (STATE_CACHE[id] = stateOf(id)));
/** A named state's cells on one sheet (read only; cached). */
export const cellsAt = (id, name) => stateCached(id).sheets.find(s => s.name === name).cells;
/** The row a keyed line sits on. */
export const rowOf = (name, key) => { const r = ROW[name] && ROW[name][key]; if (!r) throw new Error(`model-checks: no row ${name}.${key}`); return r; };
/** The cells of keyed lines over `cols`, as refs. */
export const refsOf = (name, keys, cols = COLS) => keys.flatMap(k => cols.map(c => c + rowOf(name, k)));
/** An Inputs cell by key ('Inputs!C43'), column C unless named. */
export const inputRef = (key, col = 'C') => `Inputs!${col}${rowOf('Inputs', key)}`;

/** What the reference formula gives at `ref` on the learner's sheet. */
export function expected(sh, ref, formula) {
  const p = parseRef(ref);
  try { return evalFormula(formula, sh.evalCtx({ cell: { r: p.r, c: p.c } })); } catch (e) { return '#ERR'; }
}
const close = (a, b) => (isNum(b) ? isNum(a) && Math.abs(a - b) <= 0.01 + 1e-6 * Math.abs(b) : a === b);

/**
 * Every cell of `refs` on sheet `name` holds a formula and reads what the reference formula (from
 * state `refId`) gives there. True when the learner's line is the model's line, by any route.
 */
export function built(ses, name, refs, refId) {
  const sh = sheetIn(ses, name); if (!sh) return false;
  const ref0 = cellsAt(refId, name);
  for (const ref of refs) {
    const want = ref0[ref] && ref0[ref].formula;
    if (!want) continue;
    if (!sh.formula(ref)) return false;
    if (!close(sh.value(ref), expected(sh, ref, want))) return false;
  }
  return true;
}
/** Keyed lines over `cols` are built (see built). */
export const linesBuilt = (ses, name, keys, refId, cols = COLS) => built(ses, name, refsOf(name, keys, cols), refId);
/** The cell moves when one of `inputs` ('Inputs!C43') moves: the shared liveness rule, the inputs named. */
export const liveVia = (ses, name, ref, inputs) => { const sh = sheetIn(ses, name); return !!sh && isLiveFormula(sh, ref, { inputs }); };
/** The cell holds a typed number (no formula) equal to `v`. */
export const typed = (ses, name, ref, v) => { const sh = sheetIn(ses, name); return !!sh && !sh.formula(ref) && near(sh.value(ref), v, 1e-9); };

/* ---------------- the planting: formats waiting, labels in the helper column ---------------- */

/** A cell's look without its contents (null when it has none). */
export function formatOnly(cell) {
  if (!cell) return null;
  const { formula, value, ...fmt } = cell;
  return Object.keys(fmt).length ? fmt : null;
}
/**
 * The planting for lines a lesson builds: each target cell's format from the after state (so the
 * learner types the formula and the look is already the model's), and the accountants' label in
 * column A where the line reads Data by name. Returns state-patch entries.
 */
export function plantLines(afterId, name, keys, cols = COLS) {
  const cells = cellsAt(afterId, name); const out = {};
  for (const key of keys) {
    const r = rowOf(name, key);
    for (const col of cols) { const f = formatOnly(cells[col + r]); if (f) out[`${name}!${col}${r}`] = f; }
    const a = cells['A' + r]; if (a && cols.includes('C')) out[`${name}!A${r}`] = JSON.parse(JSON.stringify(a));
  }
  return out;
}

/* ---------------- hints: Go To the line, type its formula once, Ctrl+Enter across ---------------- */

/** A formula as a typed run in a hint: double quotes unless it carries one. */
export const quoted = f => (f.includes('"') ? `'${f}'` : `"${f}"`);
/**
 * The hint that builds a keyed line: Go To its cells on the sheet, type the first cell's formula
 * from the after state, Ctrl+Enter writes it across (the references shift column by column).
 */
export function fillLine(afterId, name, key, cols = COLS) {
  const r = rowOf(name, key); const first = cols[0], last = cols[cols.length - 1];
  const f = cellsAt(afterId, name)[first + r].formula;
  const target = first === last ? `${name}!${first}${r}` : `${name}!${first}${r}:${last}${r}`;
  return `Ctrl+G "${target}" ↵ ${quoted(f)} ${first === last ? '↵' : 'Ctrl+↵'}`;
}
/** Several lines in one hint. */
export const fillLines = (afterId, name, keys, cols = COLS) => keys.map(k => fillLine(afterId, name, k, cols)).join(' ');
/** A reference formula (the after state's, at the line's first column). */
export const formulaAt = (afterId, name, key, col = 'C') => cellsAt(afterId, name)[col + rowOf(name, key)].formula;

/** A hint as a replayable script (the solution is the hints in order): glyphs become key names, quoted runs stay. */
export function toScript(hint) {
  return (String(hint).match(/"[^"]*"|'[^']*'|\S+/g) || [])
    .map(t => (t.startsWith('"') || t.startsWith("'") ? t : t.replace(/↑/g, 'Up').replace(/↓/g, 'Down').replace(/←/g, 'Left').replace(/→/g, 'Right').replace(/↵/g, 'Enter')))
    .join(' ');
}
/** A lesson's solution: every goal's hint in order (a demo goal plays itself). */
export const solutionOf = goals => goals.filter(g => g.keys).map(g => toScript(g.keys)).join(' ');
