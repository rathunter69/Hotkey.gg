// app2/content/lessons/lib/deal-checks.js — what Chapter 6's precedents and LBO lessons (6.2, 6.3)
// share on the clearcoat-valuation workbook: where a keyed line sits, the plantings (a lesson's
// target cells arrive formatted, so the learner types what the goal teaches), the lines graded
// against the reference formula evaluated in the learner's own sheet, typed inputs graded on their
// figure, the shared liveness rule on a named cell, and the hints (Go To the line, type its first
// formula, Ctrl+Enter across) whose run in order is the lesson's solution. Every check reads the
// learner's sheets; any legitimate route passes. States are built on first use, never at import.
import { sheetIn, settled, near, isNum, reads } from './databook-checks.js';
import { ROW, STATES } from '../../workbooks/clearcoat-valuation.js';
import { evalFormula } from '../../../engine/formula.js';
import { parseRef } from '../../../engine/refs.js';
import { isLiveFormula } from '../../../engine/live.js';

export { sheetIn, settled, near, isNum, reads, ROW };

/** The row a keyed line landed on (the base set's pages, or `rows` for a fresh set). */
export const R = (name, key, rows = ROW) => { const r = rows[name] && rows[name][key]; if (!r) throw new Error(`no row ${name}.${key}`); return r; };
/** A named state's cells on one sheet, read only (the master, built on first read). */
export const cellsAt = (id, name) => STATES[id].sheets.find(s => s.name === name).cells;
/** The refs of keyed lines over columns: refsOf('LBO', ['senOpen'], YRS) → ['D72', …, 'H72']. */
export const refsOf = (name, keys, cols, rows = ROW) => [].concat(keys).flatMap(k => cols.map(c => c + R(name, k, rows)));
/** 'D51:H51' (or one ref) as its cells, row by row. */
export function cellsOf(range) {
  const [a, b = a] = range.split(':');
  const p = x => { const m = /^([A-Z]+)(\d+)$/.exec(x); return { c: m[1].charCodeAt(0), r: +m[2] }; };
  const A = p(a), B = p(b), out = [];
  for (let r = A.r; r <= B.r; r++) for (let c = A.c; c <= B.c; c++) out.push(String.fromCharCode(c) + r);
  return out;
}
export const YRS = ['D', 'E', 'F', 'G', 'H'];
export const LCOLS = ['C', ...YRS];

/* ---------------- the plantings ---------------- */

/** A cell's formats alone (no value, no formula). */
export function formatOnly(cell) {
  if (!cell) return null;
  const out = {};
  for (const [k, v] of Object.entries(cell)) if (k !== 'value' && k !== 'formula') out[k] = v;
  return Object.keys(out).length ? out : null;
}
/** A planting of `refs` on `name`: each cell's formats as state `id` holds them, so the learner types only what the goal asks. */
export function plant(id, name, refs) {
  const cells = cellsAt(id, name), out = {};
  for (const ref of refs) { const f = formatOnly(cells[ref]); if (f) out[`${name}!${ref}`] = f; }
  return out;
}
/** A planting of `refs` as state `id` holds them whole: given, not the lesson's to build. */
export function given(id, name, refs) {
  const cells = cellsAt(id, name), out = {};
  for (const ref of refs) if (cells[ref]) out[`${name}!${ref}`] = JSON.parse(JSON.stringify(cells[ref]));
  return out;
}

/* ---------------- the checks ---------------- */

/** What the reference formula gives at `ref` on the learner's sheet. */
function expected(sh, ref, formula) {
  const p = parseRef(ref);
  try { return evalFormula(formula, sh.evalCtx({ cell: { r: p.r, c: p.c } })); } catch (e) { return '#ERR'; }
}
const close = (a, b) => (isNum(b) ? isNum(a) && Math.abs(a - b) <= 0.01 + 1e-6 * Math.abs(b) : typeof b === 'string' && typeof a === 'string' ? a.toLowerCase() === b.toLowerCase() : a === b);
/**
 * Every ref on sheet `name` holds a formula and reads what the reference formula (state `id`'s)
 * gives there on the learner's own cells: the learner's line is the model's line, by any route.
 * A cell the state holds as a typed figure (a zero opening balance) must read that figure.
 */
export function built(ses, name, refs, id) {
  const sh = sheetIn(ses, name); if (!sh) return false;
  const ref0 = cellsAt(id, name);
  for (const ref of refs) {
    const c = ref0[ref]; if (!c) continue;
    if (!c.formula) { if (!close(sh.value(ref), c.value) || !sh.cells[ref] || sh.cells[ref].value === undefined) return false; continue; }
    if (!sh.formula(ref)) return false;
    if (!close(sh.value(ref), expected(sh, ref, c.formula))) return false;
  }
  return true;
}
/** Keyed lines over columns are built (see built). */
export const linesBuilt = (ses, name, keys, id, cols) => built(ses, name, refsOf(name, keys, cols), id);
/** Every ref holds a typed figure (no formula) equal to state `id`'s: an input typed, a judgment recorded. */
export function typedAs(ses, name, refs, id) {
  const sh = sheetIn(ses, name); if (!sh) return false;
  const ref0 = cellsAt(id, name);
  return refs.every(ref => { const c = sh.cells[ref]; return !!c && !c.formula && c.value !== undefined && c.value !== null && c.value !== '' && close(c.value, ref0[ref].value); });
}
/** The shared liveness rule: the cell moves when one of `inputs` ('Inputs!C43') moves. */
export const liveVia = (ses, name, ref, inputs) => { const sh = sheetIn(ses, name); return !!sh && isLiveFormula(sh, ref, { inputs: [].concat(inputs) }); };

/* ---------------- hints: Go To the line, type its formula once, Ctrl+Enter across ---------------- */

/** A formula or text as a typed run in a hint: double quotes unless it carries one. */
export const quoted = f => (String(f).includes('"') ? `'${f}'` : `"${f}"`);
/** The hint that writes `range` on `name` from state `id`: Go To it, type the first cell, Ctrl+Enter across (one cell: Enter). */
export function fill(id, name, range) {
  const first = range.split(':')[0];
  const c = cellsAt(id, name)[first];
  const what = entry(c);
  return `Ctrl+G "${name}!${range}" ↵ ${quoted(what)} ${range.includes(':') ? 'Ctrl+↵' : '↵'}`;
}
/** Keyed lines over columns, each filled across (see fill). */
export const fillKeys = (id, name, keys, cols, rows = ROW) => [].concat(keys).map(k => fill(id, name, cols.length > 1 ? `${cols[0]}${R(name, k, rows)}:${cols[cols.length - 1]}${R(name, k, rows)}` : cols[0] + R(name, k, rows))).join(' ');
/** What a learner types for a cell: its formula, or its figure as the cell shows it (a percent cell takes the bare number, 2 for 2%, as Excel's automatic percent entry reads it, and keeps its format). */
export function entry(c) {
  if (c.formula) return c.formula;
  if (typeof c.value === 'number' && c.fmtStyle === 'percent') return String(+(c.value * 100).toPrecision(12));
  return String(c.value);
}
/** A run of cells down one column from `first`, each typed as state `id` holds it (formula or figure): Enter stays put on this workbook, so ↓ between. */
export function typeDown(id, name, refs) {
  const cells = cellsAt(id, name);
  const runs = refs.map(ref => quoted(entry(cells[ref])));
  return `Ctrl+G "${name}!${refs[0]}" ↵ ` + runs.join(' ↵ ↓ ') + ' ↵';
}
/** A run of cells across one row from the first, each typed as state `id` holds it: Tab between, Enter at the end. */
export function typeAcross(id, name, refs) {
  const cells = cellsAt(id, name);
  const runs = refs.map(ref => quoted(entry(cells[ref])));
  return `Ctrl+G "${name}!${refs[0]}" ↵ ` + runs.join(' Tab ') + ' ↵';
}
/** A hint as a replayable script: glyphs become key names, ×N expands, quoted runs stay. */
export function toScript(hint) {
  const out = [];
  for (const t of String(hint).match(/"[^"]*"|'[^']*'|\S+/g) || []) {
    const m = /^×(\d+)$/.exec(t);
    if (m) { const last = out[out.length - 1]; for (let i = 1; i < +m[1]; i++) out.push(last); continue; }
    out.push(t.startsWith('"') || t.startsWith("'") ? t : t.replace(/↑/g, 'Up').replace(/↓/g, 'Down').replace(/←/g, 'Left').replace(/→/g, 'Right').replace(/↵/g, 'Enter'));
  }
  return out.join(' ');
}
/** A lesson's solution: every goal's hint in order (a demo goal plays itself). */
export const solutionOf = goals => goals.filter(g => g.keys).map(g => toScript(g.keys)).join(' ');
