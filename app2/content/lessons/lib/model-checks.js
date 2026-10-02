// app2/content/lessons/lib/model-checks.js — the end-state checks Chapter 5's auditing and DCF
// lessons share on the clearcoat-model workbook (modules 5.5 and 5.6). A check cell is built to
// read zero whatever its inputs do, so it is graded on its value and its parsed references; a link
// on its references and the figure it brings; a calculation on the figure it gives, worked out from
// the learner's own cells. Any legitimate route passes.
import { stateOf, ROW, COLS, PROJ_COLS, WATCHES } from '../../workbooks/clearcoat-model.js';
import { refKey } from '../../../engine/refs.js';
import { sheetIn, settled, calls, reads, near, isNum, onSheet } from './databook-checks.js';

export { sheetIn, settled, calls, reads, near, isNum, onSheet, ROW, COLS, PROJ_COLS };

let DONE = null;
const done = () => (DONE || (DONE = stateOf('DONE')));
/** A cell of the finished model, as authored. */
export const doneCell = (name, ref) => done().sheets.find(s => s.name === name).cells[ref];
/** A cell's look without its figure (what a lesson plants so the typed formula lands in the house format). */
export const formatOnly = c => { if (!c) return {}; const { formula, value, ...rest } = c; return rest; };
/** A planting of the finished cells' formats on `refs` of a sheet. */
export const formatsOf = (name, refs) => Object.fromEntries(refs.map(r => [name + '!' + r, formatOnly(doneCell(name, r))]));
/** The finished formula of a cell (the solution types exactly it). */
export const doneFormula = (name, ref) => doneCell(name, ref).formula;
/** The refs of a keyed row over columns: rowRefs('Checks', 'eq') → ['C12', …, 'J12']. */
export const rowRefs = (name, key, cols = COLS) => cols.map(c => c + ROW[name][key]);
/** The row number of a keyed line. */
export const R = (name, key) => ROW[name][key];
/** The active sheet is `name` and the active cell `ref`. */
export const at = (ses, name, ref) => { const e = ses.sheets[ses.sheetIndex]; if (!e || e.name !== name) return false; const a = e.sheet.dispActive(); return refKey(a.r, a.c) === ref; };
/** A key pressed since the current goal began. */
export const pressedSince = (ses, k) => (ses.keyLog || []).slice(ses.goalMark || 0).some(x => x.k === k);
export const isErr = v => typeof v === 'string' && /^#(REF!|DIV\/0!|VALUE!|NAME\?|N\/A|NUM!|NULL!)/.test(v);
/** Every ref holds a formula reading zero, and the refs `want(ref, col)` names (a check, graded on its references). */
export function checkRow(sh, refs, want = () => []) {
  return !!sh && refs.every(ref => { const f = sh.formula(ref); const col = ref.match(/^[A-Z]+/)[0]; return !!f && near(sh.value(ref), 0) && reads(sh, ref, want(ref, col)); });
}
/** Every ref holds a formula (never a typed figure) whose value is `want(ref, col)`, within `tol`. */
export function formulaRow(sh, refs, want, tol = 1e-6) {
  return !!sh && refs.every(ref => { const col = ref.match(/^[A-Z]+/)[0]; const w = want(ref, col); return !!sh.formula(ref) && (typeof w === 'number' ? near(sh.value(ref), w, tol * Math.max(1, Math.abs(w))) : sh.value(ref) === w); });
}
/** A link: each ref is a formula reading `src(col)` and showing its figure (times `sign`). */
export function linkRow(ses, name, refs, src, sign = 1) {
  const sh = sheetIn(ses, name); if (!sh) return false;
  return refs.every(ref => { const col = ref.match(/^[A-Z]+/)[0]; const [sn, sr] = src(col).split('!'); const from = sheetIn(ses, sn); return !!sh.formula(ref) && reads(sh, ref, [src(col)]) && !!from && near(sh.value(ref), sign * (from.value(sr) || 0), 1e-6); });
}
/** The Watch Window holds the Cover's flag and its sum of differences. */
export const watching = ses => WATCHES.every(w => (ses.watches || []).some(x => x.sheet === w.sheet && x.key === w.key));
/**
 * A stress test seen through: the check remembers on the session that `stressed(ses)` held at some
 * key (the input at its extreme, the answer read), and passes once `restored(ses)` holds after it.
 */
export function seenThen(ses, tag, stressed, restored) {
  const seen = ses.stressSeen || (ses.stressSeen = new Set());
  if (!seen.has(tag) && stressed(ses)) seen.add(tag);
  return seen.has(tag) && restored(ses);
}
