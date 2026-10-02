// app2/content/lessons/lib/bids-checks.js — what module 6.4 (the bids and the waterfall), the
// Chapter 6 project, the assessment and the drills share on the valuation pack (clearcoat-valuation):
// where a keyed line sits, the planting (a lesson's target cells arrive formatted, or with the term
// sheets typed), lines graded against the reference formula evaluated on the learner's own cells,
// the shared liveness rule on a named input, and the cut of a cut-back pack into formula blocks and
// typed cells (the route the project and the assessment are graded and replayed on). Any legitimate
// route passes: a cell is graded on the figure its formula gives, never on its text. States are
// read on first use, never at import.
import { stateOf, ROW } from '../../workbooks/clearcoat-valuation.js';
import { ROW as MODEL_ROW } from '../../workbooks/clearcoat-model.js';
import { sheetIn, settled, reads, near, isNum, calls } from './databook-checks.js';
import { formatOnly, quoted, toScript, sessionOf } from './model-checks.js';
import { applyStatePatch } from '../../workbooks/index.js';
import { evalFormula, translateFormula } from '../../../engine/formula.js';
import { parseRef, rangeRefs } from '../../../engine/refs.js';
import { isLiveFormula } from '../../../engine/live.js';

export { sheetIn, settled, reads, near, isNum, calls, ROW, quoted, toScript };

const STATES = new Map();
/** A named state of the pack, read only (one clone per id, kept). */
export const st = id => { if (!STATES.has(id)) STATES.set(id, stateOf(id)); return STATES.get(id); };
/** A cell of a named state (the master, never mutate it). */
export const cellAt = (id, sheet, ref) => ((st(id).sheets.find(s => s.name === sheet) || { cells: {} }).cells[ref]);
/** The formula a named state holds in a cell. */
export const formulaAt = (id, sheet, ref) => (cellAt(id, sheet, ref) || {}).formula;
/** The row a keyed line landed on: a pack page's, or the Chapter 5 model's. */
export const R = (sheet, key) => { const t = ROW[sheet] || MODEL_ROW[sheet]; const r = t && t[key]; if (!r) throw new Error(`no row ${sheet}.${key}`); return r; };
/** The three bid columns. */
export const BIDS = ['C', 'D', 'E'];
/** The refs of keyed lines over columns, line by line. */
export const rowRefs = (sheet, keys, cols = BIDS) => [].concat(keys).flatMap(k => cols.map(c => c + R(sheet, k)));

/** What `formula` gives at `ref` on the learner's sheet (its own inputs, its own links). */
export function expected(sh, ref, formula) {
  const p = parseRef(ref);
  try { return evalFormula(formula, sh.evalCtx({ cell: { r: p.r, c: p.c } })); } catch (e) { return '#ERR'; }
}
const close = (a, b) => (isNum(b) ? isNum(a) && Math.abs(a - b) <= 0.01 + 1e-6 * Math.abs(b) : a === b);

/**
 * Every ref on `sheet` holds a formula whose figure is what the reference formula (state `refId`)
 * gives there on the learner's own cells: the learner's line is the pack's line, by any route.
 */
export function built(ses, sheet, refs, refId = 'DONE') {
  const sh = sheetIn(ses, sheet); if (!sh) return false;
  return refs.every(ref => { const want = formulaAt(refId, sheet, ref); return !!sh.formula(ref) && (!want || close(sh.value(ref), expected(sh, ref, want))); });
}
/** A typed figure (never a formula) at `ref`, equal to `want`. */
export const typedAt = (ses, sheet, ref, want) => { const sh = sheetIn(ses, sheet); return !!sh && !sh.formula(ref) && (isNum(want) ? near(sh.value(ref), want, 1e-9) : sh.value(ref) === want); };
/** The shared liveness rule: the cell at `ref` on `sheet` moves when one of `inputs` ('C58', 'Bids!C58') is nudged. */
export const liveVia = (ses, sheet, ref, inputs) => { const sh = sheetIn(ses, sheet); return !!sh && isLiveFormula(sh, ref, { inputs: [].concat(inputs) }); };
/** A link: a formula reading `src` ('LBO!C108') and showing its figure. */
export function linked(ses, sheet, ref, src) {
  const sh = sheetIn(ses, sheet); const [sn, sr] = src.split('!'); const from = sheetIn(ses, sn);
  return !!sh && !!from && !!sh.formula(ref) && reads(sh, ref, [src]) && near(sh.value(ref), from.value(sr), 1e-6);
}
/** Every ref carries the format field `field` at `value` (fmtStyle, numFmt, bdbl, …). */
export const carries = (ses, sheet, refs, field, value = true) => { const sh = sheetIn(ses, sheet); return !!sh && refs.every(r => { const c = sh.cells[r]; return !!c && c[field] === value; }); };
/** The active sheet is `sheet` and the selection reads `range`. */
export const selecting = (ses, sheet, range) => { const e = ses.sheets[ses.sheetIndex]; return !!e && e.name === sheet && e.sheet.selectionText() === range; };

/* ---------------- the planting and the cut ---------------- */

const sheetOf = (state, name) => state.sheets.find(s => s.name === name) || { cells: {} };
const same = (a, b) => JSON.stringify(a || null) === JSON.stringify(b || null);
const SHEET_PROPS = ['condFmt', 'rowH', 'gridlines', 'colW', 'freeze'];

/**
 * A planting over `before` from `after`: every cell that differs arrives with its formats only (the
 * learner types the figure), a cell named in `whole` arrives whole (the term sheets, a note), a
 * cell `after` lacks is cleared, and a sheet-level difference (conditional formats, gridlines)
 * arrives as after has it unless named in `leave` ('Summary!#gridlines'). `drop` maps a ref
 * ('Bids!C35') to the format fields the learner applies. Returns a state patch.
 */
export function plantFrom(before, after, { whole = [], drop = {}, leave = [], sheets = null } = {}) {
  const A = st(before), B = st(after), p = {};
  for (const sb of B.sheets) {
    if (sheets && !sheets.includes(sb.name)) continue;
    const sa = sheetOf(A, sb.name);
    for (const ref of new Set([...Object.keys(sa.cells || {}), ...Object.keys(sb.cells || {})])) {
      const ca = sa.cells[ref], cb = sb.cells[ref], key = sb.name + '!' + ref;
      if (same(ca, cb)) continue;
      if (!cb) { p[key] = null; continue; }
      if (whole.includes(key)) { p[key] = JSON.parse(JSON.stringify(cb)); continue; }
      const f = formatOnly(cb, drop[key] || []);
      if (f) p[key] = f; else if (ca) p[key] = null;
    }
    for (const prop of SHEET_PROPS) {
      const key = sb.name + '!#' + prop;
      if (!same(sa[prop], sb[prop]) && !leave.includes(key)) p[key] = sb[prop] === undefined ? null : JSON.parse(JSON.stringify(sb[prop]));
    }
  }
  return p;
}

const L = c => { let s = ''; while (c > 0) { c -= 1; s = String.fromCharCode(65 + (c % 26)) + s; c = Math.floor(c / 26); } return s; };
/**
 * The cut between two states, as the route a learner takes: the formula blocks `before` lacks
 * against `after` (each a rectangle one relative formula fills, so one Ctrl+Enter writes it), and
 * the typed cells (a figure or a label), each in sheet and row order: { blocks, typed }.
 */
export function cutOf(before, after, { sheets = null } = {}) {
  const A = st(before), B = st(after), blocks = [], typed = [];
  for (const sb of B.sheets) {
    if (sheets && !sheets.includes(sb.name)) continue;
    const sa = sheetOf(A, sb.name), byRow = {};
    for (const k of Object.keys(sb.cells)) {
      const cb = sb.cells[k], ca = sa.cells[k] || {};
      if (cb.formula) { if (ca.formula !== cb.formula) { const p = parseRef(k); (byRow[p.r] = byRow[p.r] || []).push(p.c); } continue; }
      if (cb.value !== undefined && cb.value !== null && cb.value !== '' && ca.value !== cb.value) typed.push({ sheet: sb.name, ref: k, cell: cb, ...parseRef(k) });
    }
    const runs = [];
    for (const r of Object.keys(byRow).map(Number).sort((a, b) => a - b)) {
      let run = null;
      for (const c of byRow[r].sort((a, b) => a - b)) {
        const f = sb.cells[L(c) + r].formula;
        if (run && c === run.c2 + 1 && translateFormula(run.f, 0, c - run.c1) === f) run.c2 = c;
        else { run = { r, c1: c, c2: c, f }; runs.push(run); }
      }
    }
    const merged = [];
    for (const run of runs) {
      const m = merged.find(x => x.c1 === run.c1 && x.c2 === run.c2 && x.r2 === run.r - 1 && translateFormula(x.f, run.r - x.r1, 0) === run.f);
      if (m) m.r2 = run.r; else merged.push({ ...run, r1: run.r, r2: run.r });
    }
    for (const m of merged) {
      const a = L(m.c1) + m.r1, b = L(m.c2) + m.r2;
      blocks.push({ sheet: sb.name, range: a === b ? a : `${a}:${b}`, formula: m.f, refs: rangeRefs(a, b), r1: m.r1, r2: m.r2 });
    }
  }
  typed.sort((x, y) => (x.sheet === y.sheet ? x.r - y.r || x.c - y.c : 0));
  return { blocks, typed };
}

/** What a typed cell takes at the keyboard: a percent cell takes 95 for 95% (Excel's percent entry), anything else its figure or text. */
export function entryOf(cell) {
  const v = cell.value;
  if (typeof v === 'number' && cell.fmtStyle === 'percent') return String(+(v * 100).toPrecision(12));
  return String(v);
}
/** Keys: Go To one block, type its formula, Ctrl+Enter. */
export const blockKeys = b => `Ctrl+G "${b.sheet}!${b.range}" ↵ ${quoted(b.formula)} ${b.range.includes(':') ? 'Ctrl+↵' : '↵'}`;
/** Keys: Go To one cell and type what it holds. */
export const typedKeys = t => `Ctrl+G "${t.sheet}!${t.ref}" ↵ ${quoted(entryOf(t.cell))} ↵`;
/** Keys: Go To a range and fill one formula over it. */
export const fill = (sheet, range, formula) => `Ctrl+G "${sheet}!${range}" ↵ ${quoted(formula)} ${range.includes(':') ? 'Ctrl+↵' : '↵'}`;
/** Keys: Go To a cell and type an entry. */
export const enter = (sheet, ref, text) => `Ctrl+G "${sheet}!${ref}" ↵ ${quoted(String(text))} ↵`;

/** A block's cells all hold a formula: the after state's (spacing and case ignored), or one landing on its figure (`want(sheet, ref)`). */
const norm = f => String(f || '').replace(/\s/g, '').toUpperCase();
export function blocksBuilt(ses, blocks, afterId, want) {
  return blocks.every(b => {
    const sh = sheetIn(ses, b.sheet); if (!sh) return false;
    return b.refs.every(ref => { const c = sh.cells[ref]; return !!c && !!c.formula && (norm(c.formula) === norm(formulaAt(afterId, b.sheet, ref)) || agree(c.value, want(b.sheet, ref))); });
  });
}
/** Every typed cell holds its entry (a figure or a label), typed. */
export const typedDone = (ses, list) => list.every(t => { const sh = sheetIn(ses, t.sheet); const c = sh && sh.cells[t.ref]; return !!c && !c.formula && (isNum(t.cell.value) ? near(c.value, t.cell.value, 1e-9) : typeof c.value === 'string' && c.value.trim() !== ''); });
/** Two figures agree: to a cent in thousands, or a part in a million on a large one. */
export const agree = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) <= Math.max(0.005, 1e-6 * Math.abs(b)) : a === b);

const FINISHED = new Map();
/** A finished state's figures with `patch` over it (a seed's inputs), as (sheet, ref) → value; one whole recalculation per patch, kept. */
export function figuresOf(stateId, patch = null) {
  const key = stateId + JSON.stringify(patch || {});
  if (!FINISHED.has(key)) {
    const s0 = stateOf(stateId); if (patch) applyStatePatch(s0, JSON.parse(JSON.stringify(patch)));
    const s = sessionOf(s0); const values = {};
    for (const e of s.sheets) for (const k in e.sheet.cells) values[e.name + '!' + k] = e.sheet.cells[k].value;
    FINISHED.set(key, (name, ref) => values[name + '!' + ref]);
    if (FINISHED.size > 6) FINISHED.delete(FINISHED.keys().next().value);
  }
  return FINISHED.get(key);
}
