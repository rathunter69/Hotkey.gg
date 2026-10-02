// app2/content/drills/databook-drills.js — what Chapter 3's drills share: each runs on the KPI databook
// (clearcoat-databook) from its finished state (S6d), with a planting over it (the graded cells
// emptied, their formats kept, or a fault laid in), and grades a cell on the figure the databook's
// own formula gives there on the learner's cells, so any formula that lands the same figure passes
// and a mis-anchored fill or a typed number does not. Liveness is the shared rule (engine/live.js).
import { parsFromRoute } from '../../app/pars.js';
import { stateOf } from '../workbooks/clearcoat-databook.js';
import { evalFormula, tokenize } from '../../engine/formula.js';
import { parseRef, rangeRefs } from '../../engine/refs.js';
import { isLiveFormula } from '../../engine/live.js';
import { sheetIn, settled, reads, calls, isNum, near } from '../lessons/lib/databook-checks.js';

export { sheetIn, settled, reads, calls, isNum, near };
export const DONE = 'S6d';

const STATES = new Map();
/** A named state of the databook, read only (one clone per id, kept). */
export const st = id => { if (!STATES.has(id)) STATES.set(id, stateOf(id)); return STATES.get(id); };
/** A cell record of a named state (never mutate it). */
export const cellIn = (sheet, ref, from = DONE) => (st(from).sheets.find(s => s.name === sheet).cells || {})[ref];
/** The formula a named state holds in a cell. */
export const formulaIn = (sheet, ref, from = DONE) => (cellIn(sheet, ref, from) || {}).formula;
/** The refs of a range ('C41:H46'). */
export const refsOf = range => { const [a, b = a] = range.split(':'); return rangeRefs(a, b); };

/** A planting that empties `refs` on `sheet` (each cell keeps its formats). */
export function emptied(sheet, refs, from = DONE) {
  const p = {};
  for (const ref of refs) { const c = cellIn(sheet, ref, from); if (!c) continue; const { formula, value, ...fmt } = c; p[`${sheet}!${ref}`] = fmt; }
  return p;
}

/** What `formula` gives at `ref` on the learner's sheet (its own inputs, its own links). */
export function expected(sh, ref, formula) {
  const p = parseRef(ref);
  try { return evalFormula(formula, sh.evalCtx({ cell: { r: p.r, c: p.c } })); } catch (e) { return '#ERR'; }
}
const close = (a, b) => (isNum(b) ? isNum(a) && Math.abs(a - b) <= 1e-6 + 1e-9 * Math.abs(b) : a === b);
/**
 * Every ref on `sheet` holds a formula whose figure is what the databook's formula (state `from`)
 * gives there on the learner's own cells: the learner's block is the databook's, by any route.
 */
export function built(ses, sheet, refs, from = DONE) {
  const sh = sheetIn(ses, sheet); if (!sh) return false;
  return refs.every(ref => { const want = formulaIn(sheet, ref, from); return !!sh.formula(ref) && (!want || close(sh.value(ref), expected(sh, ref, want))); });
}
/** Every ref calls each function in `fns` (read from the parsed tokens). */
export const callsAll = (ses, sheet, refs, fns) => { const sh = sheetIn(ses, sheet); return !!sh && refs.every(ref => calls(sh, ref, fns)); };
/**
 * A what-if: type `values` ({ 'Sheet!A1': v }) into input cells, recalculate, read the sheet with `fn`,
 * then put every input back and recalculate (M84). A formula cell is never overwritten: false.
 */
export function under(ses, values, fn) {
  const kept = [], only = [];
  for (const [key, v] of Object.entries(values)) {
    const [name, ref] = key.split('!'); const sh = sheetIn(ses, name); const c = sh && sh.cells[ref];
    if (!c || c.formula) { kept.forEach(([x, old]) => { x.value = old; }); return false; }
    kept.push([c, c.value]); c.value = v; only.push({ sheet: sh, key: ref });
  }
  // the workbook's calculation graph recalculates only what the changed inputs reach (as the liveness probe does); a lone sheet recalculates whole
  const book = only.length ? only[0].sheet.book : null;
  const recalc = () => { if (book && typeof book.recalc === 'function') book.recalc(only[0].sheet, only); else ses.recalcAll(); };
  try { recalc(); return !!fn(ses); }
  finally { kept.forEach(([c, old]) => { c.value = old; }); recalc(); }
}
/** How many times the cell's formula calls `fn` (read from its tokens: =IF(IF(…)) is two). */
export function fnCount(sh, ref, fn) {
  const f = sh && sh.formula(ref); if (!f) return 0;
  try { return tokenize(String(f).replace(/^=/, '')).filter(t => t.t === 'fn' && t.v === fn).length; } catch (e) { return 0; }
}
/** The shared liveness rule: the cell moves when one of `inputs` is nudged (its precedents when none are named). */
export const liveVia = (ses, sheet, ref, inputs) => { const sh = sheetIn(ses, sheet); return !!sh && isLiveFormula(sh, ref, inputs ? { inputs: [].concat(inputs) } : {}); };

/** A formula as a keys hint types it: in double quotes, or single when it holds a double quote. */
export const quoted = f => (f.includes('"') ? `'${f}'` : `"${f}"`);
/** Keys: Go To a range on `sheet` and enter the databook's formula of its first cell over it with Ctrl+Enter. */
export const fillFrom = (sheet, range, from = DONE) => `Ctrl+G "${sheet}!${range}" ↵ ${quoted(formulaIn(sheet, range.split(':')[0], from))} ${range.includes(':') ? 'Ctrl+↵' : '↵'}`;
/** Keys hint to a replayable script (glyph arrows and ↵ to key names). */
export const toScript = hint => (String(hint).match(/"[^"]*"|'[^']*'|\S+/g) || [])
  .map(t => (t.startsWith('"') || t.startsWith("'") ? t : t.replace(/↑/g, 'Up').replace(/↓/g, 'Down').replace(/←/g, 'Left').replace(/→/g, 'Right').replace(/↵/g, 'Enter'))).join(' ');

/**
 * The fields every Chapter 3 drill carries; the pars from the reference route (seconds). A `plant`
 * given as a function is built on first read (it reads the databook, which the catalogue should not
 * pay for when it loads).
 */
export function databookDrill({ route, plant, ...rest }) {
  const d = { chapter: 'formulas', access: 'paid', workbook: 'clearcoat-databook', route, pars: parsFromRoute(route), ...rest };
  if (typeof plant === 'function') { let p = null; Object.defineProperty(d, 'plant', { get: () => (p = p || plant()), enumerable: true }); }
  else if (plant) d.plant = plant;
  return d;
}
