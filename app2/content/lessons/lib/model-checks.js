// app2/content/lessons/lib/model-checks.js — the end-state checks the Chapter 5 lessons share on the
// operating model (clearcoat-model): a block holds formulas whose figures are the finished model's,
// and a cell the goal names moves when a typed input on Inputs moves (the shared liveness rule, run
// as a what-if on the whole workbook, since the model's links cross sheets and its circle iterates).
// Any legitimate route passes: typed, pointed, filled, pasted.
import { Sheet } from '../../../engine/sheet.js';
import { Session } from '../../../engine/keyboard.js';
import { formulaRefs } from '../../../engine/formula.js';
import { parseRef } from '../../../engine/refs.js';
import { stateOf, ROW, COLS } from '../../workbooks/clearcoat-model.js';
import { applyStatePatch } from '../../workbooks/index.js';

export const sheetIn = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
/** Nothing open: no entry in progress, no dialog, no Ribbon walk. */
export const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
export const isNum = v => typeof v === 'number' && Number.isFinite(v);
/** Two figures agree: to a cent in thousands, or a part in a million on a large one (the revolver's circle iterates to a tolerance). */
export const agree = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) <= Math.max(0.005, 1e-6 * Math.abs(b)) : a === b);
/** The refs of keyed rows on a model sheet across columns (C:J by default). */
export const rowRefs = (name, keys, cols = COLS) => [].concat(keys).flatMap(key => cols.map(col => col + ROW[name][key]));
export const at = (name, key, col) => col + ROW[name][key];

/** A live workbook of a state, assembled as the runner assembles one: the sheets, iteration, the names, one recalculation. */
export function sessionOf(state) {
  const build = sp => new Sheet({ rows: sp.rows, cols: sp.cols, cells: JSON.parse(JSON.stringify(sp.cells)), colW: sp.colW, freeze: sp.freeze, gridlines: sp.gridlines, condFmt: sp.condFmt });
  const s = new Session(build(state.sheets[0]));
  s.sheets[0].name = state.sheets[0].name;
  for (const sp of state.sheets.slice(1)) s.addSheet(sp.name, build(sp), undefined, { recalc: false });
  Object.assign(s.settings, { iterative: !!state.settings.iterative, calcMode: state.settings.calcMode || 'automatic' });
  if (state.names && Object.keys(state.names).length) s.names = state.names; else s.recalcAll();
  return s;
}

const FINISHED = new Map();
/**
 * The finished model's figures, with `patch` (a state patch, as a seed writes one) laid over its
 * inputs: (sheet, ref) → value. Built once per patch and kept: one recalculation of the whole model.
 */
export function finished(patch = null) {
  const key = JSON.stringify(patch || {});
  if (!FINISHED.has(key)) {
    const st = stateOf('DONE'); if (patch) applyStatePatch(st, JSON.parse(JSON.stringify(patch)));
    const s = sessionOf(st);
    const values = {};
    for (const e of s.sheets) for (const k in e.sheet.cells) values[e.name + '!' + k] = e.sheet.cells[k].value;
    FINISHED.set(key, (name, ref) => values[name + '!' + ref]);
    if (FINISHED.size > 8) FINISHED.delete(FINISHED.keys().next().value);
  }
  return FINISHED.get(key);
}

/** Every ref on sheet `name` holds a formula whose figure is the finished model's (`ref` reads it: finished() by default). */
export function like(ses, name, refs, want = finished()) {
  const sh = sheetIn(ses, name); if (!sh) return false;
  return refs.every(r => { const c = sh.cells[r]; return !!c && !!c.formula && agree(c.value, want(name, r)); });
}

/**
 * The what-if (the shared liveness rule, at the model's scale): nudge the typed input `input`
 * ('Inputs!J21'), recalculate the workbook, see `target` ('Schedules!J9') move, then put the input
 * back and recalculate, so the sheet ends exactly as it was. A typed number never moves.
 */
export function moves(ses, target, input) {
  const [tn, tr] = target.split('!'), [inName, inRef] = input.split('!');
  const T = sheetIn(ses, tn), I = sheetIn(ses, inName); if (!T || !I) return false;
  const tc = T.cells[tr], ic = I.cells[inRef];
  if (!tc || !tc.formula || !ic || ic.formula || !isNum(ic.value)) return false;
  const before = tc.value, old = ic.value;
  // through the workbook's own graph, naming the one cell changed: only its readers recalculate
  const recalc = () => (I.book ? I.book.recalc(I, [{ sheet: I, key: inRef }]) : ses.recalcAll());
  ic.value = old === 0 ? 1 : old * 1.5 + 1;
  try { recalc(); return isNum(T.cells[tr].value) && !agree(T.cells[tr].value, before); }
  finally { ic.value = old; recalc(); }
}

/** The formula in `ref` reads every cell in `keys` ('C31' on its own sheet, 'IS!C31' on another), directly or inside a range: a token check on a cell the goal names. */
export function reads(sh, ref, keys) {
  const f = sh && sh.cells[ref] && sh.cells[ref].formula; if (typeof f !== 'string' || !f) return false;
  let refs; try { refs = formulaRefs(f, { rows: 1000, cols: 100 }); } catch (e) { return false; }
  return keys.every(k => {
    const bang = k.indexOf('!'); const sheet = bang < 0 ? '' : k.slice(0, bang), key = bang < 0 ? k : k.slice(bang + 1);
    const p = parseRef(key); if (!p) return false;
    return refs.some(x => (x.sheet || '').toUpperCase() === sheet.toUpperCase() && (x.key ? x.key.replace(/\$/g, '') === key : x.range && p.r >= x.range.r1 && p.r <= x.range.r2 && p.c >= x.range.c1 && p.c <= x.range.c2));
  });
}

/** The desk number format, as Format Cells writes the four-section code. */
export const DESK = '#,##0_);(#,##0);"-"_)';
/** Every ref carries the custom number format `code`. */
export const formatted = (sh, refs, code = DESK) => !!sh && refs.every(r => { const c = sh.cells[r]; return !!c && c.fmtStyle === 'custom' && c.numFmt === code; });
/** Every ref carries the format field `field` (bt, it, bold, fontColor) at `value`. */
export const carries = (sh, refs, field, value = true) => !!sh && refs.every(r => { const c = sh.cells[r]; return !!c && c[field] === value; });
