// app2/content/lessons/lib/comps-checks.js — what module 6.1's lessons share on the Comps page of
// the clearcoat-valuation workbook: where a keyed line sits, the plantings (a lesson's target cells
// arrive in the finished page's format, so the learner types what the goal teaches), and the
// grading. A cell is graded on the figure the finished page's formula gives when it is evaluated in
// the learner's own sheet, so any formula that gets there passes and a typed figure never does;
// where a goal asks for a live formula, the shared liveness rule (engine/live.js) nudges an input.
import { sheetIn, settled, near, isNum, reads } from './databook-checks.js';
import { formatOnly, expected, liveVia, under, cursorAt } from './model-checks.js';
import { ROW, COMPS_COLS, stateOf } from '../../workbooks/clearcoat-valuation.js';

export { sheetIn, settled, near, isNum, reads, liveVia, under, cursorAt, COMPS_COLS };

export const P = 'Comps';
/** The row of a keyed line on Comps. */
export const R = key => { const r = ROW.Comps[key]; if (!r) throw new Error('no row Comps.' + key); return r; };
/** The comp rows c0 to c5 (rows 5 to 10). */
export const COMP_KEYS = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'];
export const FIRST = R('c0'), LAST = R('c5');
/** A column over the comp rows, as refs: ['E5', …, 'E10']. */
export const down = (col, keys = COMP_KEYS) => keys.map(k => col + R(k));
/** A keyed line over columns, as refs. */
export const across = (key, cols) => cols.map(c => c + R(key));
export const comps = ses => sheetIn(ses, P);

const STATE_CELLS = {};
/** A named state's Comps cells, read only (built once). */
export const cellsIn = (id, sheet = P) => { const k = id + '!' + sheet; if (!STATE_CELLS[k]) STATE_CELLS[k] = stateOf(id).sheets.find(s => s.name === sheet).cells; return STATE_CELLS[k]; };
/** The finished page's formula in a cell. */
export const formulaOf = (ref, id = 'DONE') => { const c = cellsIn(id)[ref]; return c && c.formula; };
/** A planting: each ref's formats as state `id` holds them ({ 'Comps!E5': formats }); `drop` leaves a format for the learner to apply. */
export function formatsAt(id, refs, drop = []) {
  const cells = cellsIn(id), out = {};
  for (const ref of refs) { const f = formatOnly(cells[ref], drop); if (f) out[P + '!' + ref] = f; }
  return out;
}
/** A planting of whole cells (value and format) as state `id` holds them. */
export function cellsAt(id, refs) {
  const cells = cellsIn(id), out = {};
  for (const ref of refs) if (cells[ref]) out[P + '!' + ref] = JSON.parse(JSON.stringify(cells[ref]));
  return out;
}

const close = (a, b) => (isNum(b) ? isNum(a) && Math.abs(a - b) <= 0.005 + 1e-9 * Math.abs(b) : a === b);
/**
 * Every ref holds a formula and reads what the finished page's formula gives there, evaluated in the
 * learner's own sheet (so it follows the learner's inputs and any route passes).
 */
export function built(ses, refs, id = 'DONE') {
  const sh = comps(ses); if (!sh) return false;
  for (const ref of refs) {
    const want = formulaOf(ref, id);
    if (!want) throw new Error('no formula at Comps!' + ref + ' in ' + id);
    if (!sh.formula(ref)) return false;
    if (!close(sh.value(ref), expected(sh, ref, want))) return false;
  }
  return true;
}
/** The cell on Comps moves when one of `inputs` moves (the shared liveness rule). */
export const liveOn = (ses, ref, inputs) => liveVia(ses, P, ref, [].concat(inputs).map(x => (x.includes('!') ? x : P + '!' + x)));
/** Every ref carries the format field `field` at `value`. */
export const carries = (ses, refs, field, value = true) => { const sh = comps(ses); return !!sh && refs.every(r => { const c = sh.cells[r]; return !!c && c[field] === value; }); };
/** Every ref is free of a format field value (a formula is not blue). */
export const lacks = (ses, refs, field, value) => { const sh = comps(ses); return !!sh && refs.every(r => { const c = sh.cells[r]; return !c || c[field] !== value; }); };
/** A hint's typed run: double quotes, or single when the formula carries a double quote. */
export const q = f => (f.includes('"') ? `'${f}'` : `"${f}"`);
/** A hint as a replayable script (glyphs to key names, quoted runs kept, ×N expanded). */
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
