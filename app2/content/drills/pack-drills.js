// app2/content/drills/pack-drills.js — what Chapter 4's drills share: each runs on the diligence
// pack (clearcoat-pack) from a named state, with a planting over it (cells emptied with their
// formats kept, or a small block laid on a free part of a page), and grades the end state: a cell
// holds a formula whose figure is what the reference formula gives on the learner's own cells, and
// the what-if (an input moved and put back) tells a formula from a typed number.
import { workbookState } from '../workbooks/index.js';
import { parsFromRoute } from '../../app/pars.js';
import { evalFormula } from '../../engine/formula.js';
import { parseRef } from '../../engine/refs.js';
import { sheetIn, isNum } from '../lessons/lib/databook-checks.js';

const STATES = new Map();
const stateAt = id => { if (!STATES.has(id)) STATES.set(id, workbookState('clearcoat-pack', id)); return STATES.get(id); };
/** A cell of a named pack state (read only). */
export const packCell = (id, sheet, ref) => ((stateAt(id).sheets.find(s => s.name === sheet) || { cells: {} }).cells[ref]);

/** A planting that empties `refs` on `sheet` of state `from`: each cell keeps its formats and loses its figure or formula. */
export function emptiedIn(from, sheet, refs) {
  const p = {};
  for (const ref of refs) {
    const c = packCell(from, sheet, ref); if (!c) continue;
    const { formula, value, table, ...fmt } = c; void formula; void value; void table;
    p[`${sheet}!${ref}`] = Object.keys(fmt).length ? fmt : null;
  }
  return p;
}

/** What `formula` gives at `ref` on the learner's sheet (its own inputs, its own links). */
export function expectedAt(sh, ref, formula) {
  const p = parseRef(ref);
  try { return evalFormula(formula, sh.evalCtx({ cell: { r: p.r, c: p.c } })); } catch (e) { return '#ERR'; }
}
const close = (a, b) => (isNum(b) ? isNum(a) && Math.abs(a - b) <= 0.005 + 1e-9 * Math.abs(b) : typeof a === 'string' && typeof b === 'string' ? a.toLowerCase() === b.toLowerCase() : a === b);
/** Every ref holds a formula landing where the reference formula (`want(ref)`) lands on the learner's own cells. */
export function landsOn(ses, sheet, refs, want) {
  const sh = sheetIn(ses, sheet); if (!sh) return false;
  return [].concat(refs).every(ref => !!sh.formula(ref) && close(sh.value(ref), expectedAt(sh, ref, want(ref))));
}

/** A keys hint as a replayable script: the glyphs as key names, ×N expanded (a quoted entry stays whole). */
export function scriptOf(hint) {
  const out = [];
  for (const t of String(hint).match(/"[^"]*"|'[^']*'|\S+/g) || []) {
    const m = /^×(\d+)$/.exec(t);
    if (m) { const last = out[out.length - 1]; for (let i = 1; i < +m[1]; i++) out.push(last); continue; }
    out.push(/^["']/.test(t) ? t : t.replace(/↑/g, 'Up').replace(/↓/g, 'Down').replace(/←/g, 'Left').replace(/→/g, 'Right').replace(/↵/g, 'Enter'));
  }
  return out.join(' ');
}
/** A drill's solution: every goal's keys in order. */
export const solutionOf = goals => goals.map(g => scriptOf(g.keys)).join(' ');

/**
 * The fields every Chapter 4 drill carries; the pars from the reference route (seconds). A `plant`
 * given as a function is built on first read (it reads the pack, which the catalogue should not pay
 * for when it loads).
 */
export function packDrill({ route, plant, ...rest }) {
  const d = { chapter: 'data-and-lookups', access: 'paid', workbook: 'clearcoat-pack', route, pars: parsFromRoute(route), ...rest };
  if (typeof plant === 'function') { let p = null; Object.defineProperty(d, 'plant', { get: () => (p = p || plant()), enumerable: true }); }
  else if (plant) d.plant = plant;
  return d;
}
