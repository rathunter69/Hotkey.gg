// app2/content/drills/pnl-drills.js — what Chapter 2's drills share: each runs on the chapter's book
// (clearcoat-pnl) from a named state of the lesson chain, with a planting over it (formats taken off,
// figures typed back as the export left them, faults laid on), and grades the end state the way the
// chapter's lessons do: the format a cell carries read as the code it renders, borders and fills
// read off the cell, rules read off the sheet, the print set-up read off the workbook.
import { parsFromRoute } from '../../app/pars.js';
import { stateOf, YEAR_COLS } from '../workbooks/clearcoat-pnl.js';
import { cellFormatCode, isDeskNumberFormat } from '../../app/graders.js';
import { formatValue } from '../../engine/numfmt.js';
import { formulaRefs } from '../../engine/formula.js';
import { isLiveFormula } from '../../engine/live.js';

export { YEAR_COLS };
export const sheetIn = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
export const pnl = ses => sheetIn(ses, 'P&L');
/** Nothing open: no entry in progress, no dialog, no Ribbon walk. */
export const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
export const isNum = v => typeof v === 'number' && Number.isFinite(v);
export const near = (a, b, tol = 1e-6) => isNum(a) && isNum(b) && Math.abs(a - b) <= tol;
/** The refs of `rows` across the year columns (or `cols`). */
export const across = (rows, cols = YEAR_COLS) => [].concat(rows).flatMap(r => cols.map(c => c + r));
/** The refs of a block, 'C7:E10'. */
export function block(range) {
  const [a, b] = range.split(':'); const m1 = /^([A-Z])(\d+)$/.exec(a), m2 = /^([A-Z])(\d+)$/.exec(b || a);
  const out = []; for (let r = +m1[2]; r <= +m2[2]; r++) for (let c = m1[1].charCodeAt(0); c <= m2[1].charCodeAt(0); c++) out.push(String.fromCharCode(c) + r);
  return out;
}

const STATES = new Map();
/** A named state of the book, read only (one clone per id, kept). */
export const st = id => { if (!STATES.has(id)) STATES.set(id, stateOf(id)); return STATES.get(id); };
/** A cell record of a named state (never mutate it). */
export const cellIn = (id, sheet, ref) => (st(id).sheets.find(s => s.name === sheet).cells || {})[ref];

const render = (v, code) => { try { const o = formatValue(v, code); return `${o.text.trim()}|${o.color || ''}`; } catch (e) { return '#BAD'; } };
/** How a cell's format shows `v` (the code it carries, built-in or custom): the text and its color. */
export const shows = (cell, v) => render(v, cellFormatCode(cell));
/** The probes a code is read on: a positive, a negative and a zero. */
export const PROBES = [1234.4, -1234.4, 0];
/** Every ref renders the probes the way the code `want` does (text and color): any code that reads the same passes. */
export function rendersLike(sh, refs, want, probes = PROBES) {
  if (!sh) return false;
  return refs.every(ref => { const c = sh.cells[ref]; return !!c && probes.every(v => shows(c, v) === render(v, want)); });
}
/** Every ref carries the desk number format: separators, no decimals, negatives in parentheses. */
export const desk = (sh, refs) => !!sh && refs.every(ref => isDeskNumberFormat(cellFormatCode(sh.cells[ref])));
/** Every ref carries the field at the value (bold, bt, fill …). */
export const carries = (sh, refs, field, value = true) => !!sh && refs.every(ref => { const c = sh.cells[ref]; return !!c && c[field] === value; });
/** No ref carries the field. */
export const lacks = (sh, refs, field) => !!sh && refs.every(ref => { const c = sh.cells[ref]; return !c || !c[field]; });
/** The cell holds a formula that moves when one of its inputs moves (the shared liveness rule). */
export const live = (sh, ref, inputs) => !!sh && isLiveFormula(sh, ref, inputs ? { inputs } : {});
/** The cell's formula reads every one of `keys` (a check is built to read zero, so no nudge moves it). */
export function reads(sh, ref, keys) {
  const f = sh && sh.formula(ref); if (!f) return false;
  const refs = formulaRefs(f, { rows: 1000, cols: 100 }).map(x => (x.key || '').replace(/\$/g, ''));
  return keys.every(k => refs.includes(k));
}

/** The print set-up the workbook carries. */
export const setup = ses => (ses.settings && ses.settings.pageSetup) || {};

/**
 * What the drill does to one cell while `fn` reads the sheet: `rec` stands in for the cell, the
 * workbook recalculates, and the cell is put back after (a what-if on a cell that may hold a formula).
 */
export function withCell(ses, sheet, ref, rec, fn) {
  const sh = sheetIn(ses, sheet); if (!sh) return false;
  const old = sh.cells[ref];
  sh.cells[ref] = { ...(old || {}), ...rec }; if (rec.value !== undefined) delete sh.cells[ref].formula;
  try { ses.recalcAll(); return !!fn(sh); }
  finally { if (old) sh.cells[ref] = old; else delete sh.cells[ref]; ses.recalcAll(); }
}

/** The format fields a planting takes off a cell (its figure stays). */
const FORMAT = ['fmtStyle', 'numFmt', 'decimals', 'scale'];
/** A planting over state `from` that takes the number format off `refs` on `sheet`. */
export function unformatted(from, sheet, refs) {
  const p = {};
  for (const ref of refs) { const c = cellIn(from, sheet, ref); if (!c) continue; p[`${sheet}!${ref}`] = Object.fromEntries(Object.entries(c).filter(([k]) => !FORMAT.includes(k))); }
  return p;
}

/** Keys hint to text: glyph arrows and ↵ to key names (the solution a drill replays). */
export const toScript = hint => (String(hint).match(/"[^"]*"|'[^']*'|\S+/g) || [])
  .map(t => (t.startsWith('"') || t.startsWith("'") ? t : t.replace(/↑/g, 'Up').replace(/↓/g, 'Down').replace(/←/g, 'Left').replace(/→/g, 'Right').replace(/↵/g, 'Enter'))).join(' ');

/**
 * The fields every Chapter 2 drill carries; the pars from the reference route (seconds). A `plant`
 * given as a function is built on first read (it reads a state, which the catalogue should not pay
 * for when it loads).
 */
export function pnlDrill({ route, plant, ...rest }) {
  const d = { chapter: 'formatting', access: 'paid', workbook: 'clearcoat-pnl', route, pars: parsFromRoute(route), ...rest };
  if (typeof plant === 'function') { let p = null; Object.defineProperty(d, 'plant', { get: () => (p = p || plant()), enumerable: true }); }
  else if (plant) d.plant = plant;
  return d;
}
