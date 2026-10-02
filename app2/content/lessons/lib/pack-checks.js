// app2/content/lessons/lib/pack-checks.js — the end-state checks Chapter 4's pivot and scenario
// lessons share on the clearcoat-pack workbook (modules 4.4 and 4.5). A pivot is graded by its
// layout (which field is down, across and in values, how it is summarized) and by its figures
// against the export as it stands, so a pivot left unrefreshed fails; a Data Table by its block and
// its input cells; a formula by the functions it calls (parsed tokens), the figure it reads and the
// shared liveness rule. Any legitimate route passes.
import { pivotCache, pivotLayout } from '../../../engine/pivot.js';
import { parseRef, refKey } from '../../../engine/refs.js';
import { sheetIn, settled, calls, live, reads, near, isNum } from './databook-checks.js';

export { sheetIn, settled, calls, live, reads, near, isNum };
export const scenarios = ses => sheetIn(ses, 'Scenarios');
export const summary = ses => sheetIn(ses, 'Summary');
export const exportSheet = ses => sheetIn(ses, 'Export');
/** The active sheet is `name` and the active cell is `ref`. */
export const at = (ses, name, ref) => { const e = ses.sheets[ses.sheetIndex]; if (!e || e.name !== name) return false; const a = e.sheet.dispActive(); return refKey(a.r, a.c) === ref; };
/** A key the learner pressed since the current goal began (the key log's window). */
export const pressedSince = (ses, k) => (ses.keyLog || []).slice(ses.goalMark || 0).some(x => x.k === k);

const same = (a, b) => String(a == null ? '' : a).toLowerCase() === String(b == null ? '' : b).toLowerCase();
/** Every pivot over the export, wherever it sits: [{ name, sheet, pivot }]. */
export function pivots(ses) {
  const out = [];
  for (const e of ses.sheets) for (const p of e.sheet.pivots || []) if (p.source && same(p.source.sheet, 'Export')) out.push({ name: e.name, sheet: e.sheet, pivot: p });
  return out;
}
/** A pivot laid out as `want`: { row, col (null for none), value, fn, show }. */
export const laidOut = (p, want) => same(p.spec.row, want.row) && same(p.spec.col, want.col || '') && same(p.spec.value, want.value)
  && (p.spec.fn || 'sum') === (want.fn || 'sum') && (p.spec.show || null) === (want.show || null);
/** The pivot over the export laid out as `want`, or null. */
export const pivotLike = (ses, want) => pivots(ses).find(x => laidOut(x.pivot, want)) || null;
/** The export as a pivot reads it now: its header row and rows, values worked out. */
function exportTable(ses, range) {
  const X = exportSheet(ses); if (!X) return null;
  const [a, b] = String(range).replace(/\$/g, '').split(':').map(parseRef); if (!a || !b) return null;
  const t = []; for (let r = a.r; r <= b.r; r++) { const row = []; for (let c = a.c; c <= b.c; c++) row.push(X.value(refKey(r, c))); t.push(row); }
  return t;
}
/** The pivot shows what the export holds now (a pivot not refreshed since a change fails). */
export function current(ses, x) {
  if (!x) return false;
  const t = exportTable(ses, x.pivot.source.range); if (!t) return false;
  const cache = pivotCache(t, x.pivot.spec); if (!cache) return false;
  const lay = pivotLayout(cache, x.pivot.at);
  for (const k in lay.cells) {
    const want = lay.cells[k], got = x.sheet.value(k);
    if (typeof want === 'number' ? !near(got, want, 1e-6) : (want === null ? !(got === null || got === '' || got === undefined) : got !== want)) return false;
  }
  return true;
}
/** A pivot's figure for one row item (and column item, or the grand total when none), read off the pivot as it shows. */
export function pivotFigure(x, rowItem, colItem) {
  const p = x.pivot; const ri = p.rowItems.findIndex(v => same(v, rowItem)); if (ri < 0) return null;
  const { r: r0, c: c0 } = p.at;
  if (!p.colItems) return x.sheet.value(refKey(r0 + 1 + ri, c0 + 1));
  const ci = colItem == null ? p.colItems.length : p.colItems.findIndex(v => same(v, colItem)); if (ci < 0) return null;
  return x.sheet.value(refKey(r0 + 2 + ri, c0 + 1 + ci));
}
/** The export's own sum of a column over the rows that meet `pred` (a figure to grade a pivot or a GETPIVOTDATA against). */
export function exportSum(ses, col, pred) {
  const X = exportSheet(ses); let t = 0;
  for (let r = 5; r <= 94; r++) { const v = X.value(col + r); if (isNum(v) && pred(r, X)) t += v; }
  return t;
}

/** The Data Table on a sheet whose block and input cells are these, or null. `row`/`col` are cell keys ('G6'), null for none. */
export function tableOn(sh, { block, row = null, col = null }) {
  if (!sh) return null;
  const [a, b] = block.split(':').map(parseRef);
  const key = k => (k ? String(k).replace(/\$/g, '').toUpperCase() : null);
  return (sh.dataTables || []).find(t => t.r1 === a.r && t.c1 === a.c && t.r2 === b.r && t.c2 === b.c && key(t.row) === key(row) && key(t.col) === key(col)) || null;
}
/** The cells of a row or a column hold these typed values (no formula). */
export const typedRow = (sh, refs, values) => !!sh && refs.every((ref, i) => !sh.formula(ref) && near(sh.value(ref), values[i], 1e-9));
/** Cells of a range, as refs: 'D28:H28' → ['D28', …]. */
export function refsOf(range) {
  const [a, b] = range.split(':').map(parseRef); const out = [];
  for (let r = a.r; r <= b.r; r++) for (let c = a.c; c <= b.c; c++) out.push(refKey(r, c));
  return out;
}
/** A formula cell that links `target` on the same sheet and shows its figure. */
export const linksTo = (sh, ref, target) => !!sh && !!sh.formula(ref) && reads(sh, ref, [target]) && near(sh.value(ref), sh.value(target), 1e-6);
