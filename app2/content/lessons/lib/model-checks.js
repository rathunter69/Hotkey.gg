// app2/content/lessons/lib/model-checks.js — what Chapter 5's lessons share on the clearcoat-model
// workbook: where a keyed line sits, the plantings (a lesson's target cells arrive formatted, so the
// learner types what the goal teaches), the One site and One week pages worked out from the
// learner's own inputs (5.1), the model's lines graded against the reference formula evaluated in the
// learner's sheet (5.2 to 5.4), the audit and DCF checks (5.5, 5.6), and the model-speed checks
// (5.7, 5.8, the drills). Every check reads the learner's sheets: a cell holds a formula (never a
// typed figure), it reads what the line should read on the inputs as they stand, and where a goal
// asks for a live formula the cell moves when an input moves (the shared liveness rule). Any
// legitimate route passes. Model states are built on first use, never at import.
import { sheetIn, settled, calls, live, near, isNum, reads, onSheet } from './databook-checks.js';
import { ROW, STATES, stateOf, COLS, PROJ_COLS, WATCHES } from '../../workbooks/clearcoat-model.js';
import { Sheet } from '../../../engine/sheet.js';
import { Session } from '../../../engine/keyboard.js';
import { evalFormula } from '../../../engine/formula.js';
import { parseRef, refKey } from '../../../engine/refs.js';
import { applyStatePatch } from '../../workbooks/index.js';
import { isLiveFormula } from '../../../engine/live.js';

export { sheetIn, settled, calls, live, near, isNum, reads, onSheet, ROW, COLS, PROJ_COLS };

/** The row a keyed line landed on; `at('One site', 'rev')` is its cell in column C. */
export const rowOf = (sheet, key) => { const r = ROW[sheet] && ROW[sheet][key]; if (!r) throw new Error(`no row ${sheet}.${key}`); return r; };
export const at = (sheet, key, col = 'C') => col + rowOf(sheet, key);

/** A cell's formats alone (no value, no formula): what a planting lays down for the learner to fill. */
export function formatOnly(cell, drop = []) {
  if (!cell) return null;
  const out = {};
  for (const [k, v] of Object.entries(cell)) if (k !== 'value' && k !== 'formula' && !drop.includes(k)) out[k] = v;
  return Object.keys(out).length ? out : null;
}
/** A planting: each ref's formats as the state `stateId` holds them on `sheet` ({ 'Sheet!C5': formats }); `drop` keeps a format for the learner. */
export function formatsFrom(stateId, sheet, refs, drop = []) {
  const cells = STATES[stateId].sheets.find(s => s.name === sheet).cells;
  const out = {};
  for (const ref of refs) { const f = formatOnly(cells[ref], drop); if (f) out[`${sheet}!${ref}`] = f; }
  return out;
}
/** The cell as the state holds it (a clone). */
export const cellIn = (stateId, sheet, ref) => { const c = STATES[stateId].sheets.find(s => s.name === sheet).cells[ref]; return c ? JSON.parse(JSON.stringify(c)) : null; };
/** The formula the state holds in a cell. */
export const formulaIn = (stateId, sheet, ref) => { const c = cellIn(stateId, sheet, ref); return c && c.formula; };

/** A hint's keycaps as a solution script: glyphs to key names, ×N expanded, connectives dropped (tests/hint-rules.js reads hints the same way). */
export function script(keys) {
  const out = [];
  for (const t of String(keys || '').match(/"[^"]*"|'[^']*'|\S+/g) || []) {
    if (/^(then|…|,|and|or)$/.test(t)) continue;
    const m = /^×(\d+)$/.exec(t);
    if (m) { const last = out[out.length - 1]; for (let i = 1; i < +m[1]; i++) out.push(last); continue; }
    out.push(/^["']/.test(t) ? t : t.replace(/↑/g, 'Up').replace(/↓/g, 'Down').replace(/←/g, 'Left').replace(/→/g, 'Right').replace(/↵/g, 'Enter'));
  }
  return out.join(' ');
}
/** A typed entry as a hint carries it: double quotes, or single when the formula holds a double quote. */
export const typed = f => (f.includes('"') ? `'${f}'` : `"${f}"`);
/** Type a run of formulas down a column from the active cell: each committed with ↵ (Enter stays put on this workbook) and a ↓ between. */
export const typeDown = formulas => formulas.map(typed).join(' ↵ ↓ ') + ' ↵';

/* ---------------- the One site page (5.1), worked out from the learner's own inputs ---------------- */

export const site = ses => sheetIn(ses, 'One site');
export const week = ses => sheetIn(ses, 'One week');
const v = (sh, sheet, key) => sh.value(at(sheet, key));

/** Every line of the One site page from its inputs, as the workbook defines it (dollars, one month). */
export function siteModel(sh) {
  const I = k => v(sh, 'One site', k);
  const m = {};
  m.rev = I('washes') * I('ticket'); m.cos = -I('washes') * I('cpw'); m.gp = m.rev + m.cos; m.gm = m.gp / m.rev;
  m.rent = -I('rentIn'); m.labor = -I('laborIn'); m.util = -I('utilIn'); m.maint = -I('maintIn'); m.card = -m.rev * I('cardRate');
  m.siteCosts = m.rent + m.labor + m.util + m.maint + m.card; m.contrib = m.gp + m.siteCosts;
  m.ho = -I('hoIn') / I('sites'); m.ebitda = m.contrib + m.ho; m.em = m.ebitda / m.rev;
  m.dep = -I('build') / I('life') / 12; m.ebit = m.ebitda + m.dep;
  m.int = -I('loanIn') * I('loanRate') / 12; m.ebt = m.ebit + m.int;
  m.tax = -Math.max(m.ebt, 0) * I('taxRate'); m.ni = m.ebt + m.tax;
  m.cashIn1 = I('members') * I('fee'); m.def15 = m.cashIn1 * (I('days') - 15) / I('days'); m.def30 = 0; m.def20 = I('fee') * (I('days') - 10) / I('days');
  m.payClose = -m.cos; m.recClose = m.rev / I('days') * I('lag');
  m.cfoHand = m.ni - m.dep + (m.payClose - I('augChem')) - (m.recClose - I('augRec')) + m.def30;
  m.cfNi = m.ni; m.cfDep = -m.dep; m.cfRec = -(m.recClose - I('augRec')); m.cfPay = m.payClose - I('augChem'); m.cfDef = m.def30;
  m.cfo = m.cfNi + m.cfDep + m.cfRec + m.cfPay + m.cfDef; m.cfCapex = -m.rev * I('maintCapex'); m.cfi = m.cfCapex;
  m.cfAmort = -I('amort') / 12; m.cff = m.cfAmort; m.net = m.cfo + m.cfi + m.cff; m.open = I('openCash'); m.close = m.open + m.net;
  m.bsCash = m.close; m.bsRec = m.recClose; m.bsPpe = I('build') - I('accDep') + m.dep - m.cfCapex; m.ta = m.bsCash + m.bsRec + m.bsPpe;
  m.bsPay = m.payClose; m.bsDef = m.def30; m.bsLoan = I('loanIn') + m.cfAmort; m.tl = m.bsPay + m.bsDef + m.bsLoan;
  m.openEq = I('openCash') + I('augRec') + I('build') - I('accDep') - I('augChem') - I('loanIn'); m.eqNi = m.ni; m.closeEq = m.openEq + m.eqNi;
  m.tle = m.tl + m.closeEq; m.check = 0;
  m.rMargin = m.em; m.rConv = (m.cfo - m.int - m.tax) / m.ebitda; m.rNetDebt = m.bsLoan - m.bsCash; m.rLev = m.rNetDebt / (m.ebitda * 12);
  m.rCover = -m.ebitda / m.int; m.rReturn = m.contrib * 12 / I('build');
  return m;
}
/** The keyed lines hold formulas that read what the page's own inputs say they should (a cent's tolerance). */
export function siteLines(sh, keys, model = sh && siteModel(sh)) {
  if (!sh) return false;
  return keys.every(k => { const ref = at('One site', k); return !!sh.formula(ref) && near(sh.value(ref), model[k], 0.01); });
}

/** Every line of the One week page from its events and opening balance sheet. */
export function weekModel(sh) {
  const I = k => v(sh, 'One week', k);
  const m = {};
  m.rev = I('washes') * I('ticket'); m.cos = -I('delivery'); m.site = -I('payroll'); m.ebitda = m.rev + m.cos + m.site;
  m.isDep = -I('dep'); m.isInt = -I('interest'); m.ebt = m.ebitda + m.isDep + m.isInt; m.tax = -Math.max(m.ebt, 0) * I('taxRate'); m.ni = m.ebt + m.tax;
  m.cfNi = m.ni; m.cfDep = I('dep'); m.cfRec = -(m.rev / 7 * I('lag') - I('oRec')); m.cfPay = I('delivery') - I('oPay'); m.cfTax = -m.tax - I('oTaxPay');
  m.cfo = m.cfNi + m.cfDep + m.cfRec + m.cfPay + m.cfTax; m.cfPrin = -I('principal'); m.cff = m.cfPrin; m.net = m.cfo + m.cff; m.open = I('oCash'); m.close = m.open + m.net;
  m.bsCash = m.close; m.bsRec = m.rev / 7 * I('lag'); m.bsPpe = I('oPpe') - I('dep'); m.ta = m.bsCash + m.bsRec + m.bsPpe;
  m.bsPay = I('oPay') + I('delivery'); m.bsTax = I('oTaxPay') - m.tax; m.bsLoan = I('oLoan') - I('principal'); m.bsEq = I('oEq') + m.ni;
  m.tle = m.bsPay + m.bsTax + m.bsLoan + m.bsEq; m.check = 0;
  m.dWashes = m.rev + m.cfRec; m.dPayroll = -I('payroll'); m.dLoan = -I('loanPay'); m.dNet = m.dWashes + m.dPayroll + m.dLoan; m.dCheck = 0;
  return m;
}
export function weekLines(sh, keys, model = sh && weekModel(sh)) {
  if (!sh) return false;
  return keys.every(k => { const ref = at('One week', k); return !!sh.formula(ref) && near(sh.value(ref), model[k], 0.01); });
}

/** The keys pressed since the current goal began, as the key log writes them. */
export const windowKeys = ses => (ses.keyLog || []).slice(ses.goalMark || 0).map(e => e.k);

/* ---------------- the model (5.2 on): the learner's cells against the state the lesson ends on ---------------- */

const build = sp => new Sheet({ rows: sp.rows, cols: sp.cols, cells: JSON.parse(JSON.stringify(sp.cells || {})), colW: sp.colW, freeze: sp.freeze, gridlines: sp.gridlines, condFmt: sp.condFmt, recalc: false });   // calculated once, assembled
const TARGETS = {};
/** A state worked out once (a calculated session), so a check can ask what a cell should read. */
export function target(stateId) {
  if (TARGETS[stateId]) return TARGETS[stateId];
  const st = STATES[stateId];
  const s = new Session(build(st.sheets[0]));
  s.sheets[0].name = st.sheets[0].name;
  for (const sp of st.sheets.slice(1)) s.addSheet(sp.name, build(sp), undefined, { recalc: false });
  if (st.settings && st.settings.iterative !== undefined) s.settings.iterative = !!st.settings.iterative;
  if (st.names && Object.keys(st.names).length) s.names = st.names; else s.recalcAll();
  return (TARGETS[stateId] = s);
}
/** 'C32:J37' (or one ref) as its cells, row by row. */
export function cellsOf(range) {
  const [a, b = a] = range.split(':');
  const p = r => { const m = /^([A-Z]+)(\d+)$/.exec(r); return { c: m[1].charCodeAt(0), r: +m[2] }; };
  const A = p(a), B = p(b), out = [];
  for (let r = A.r; r <= B.r; r++) for (let c = A.c; c <= B.c; c++) out.push(String.fromCharCode(c) + r);
  return out;
}
const sameValue = (v, w) => (isNum(w) ? near(v, w, 1e-6) : typeof w === 'string' && typeof v === 'string' ? v.toLowerCase() === w.toLowerCase() : v === w);
/**
 * Every cell of `range` on `sheet` reads what the state `stateId` reads there, and where that state
 * holds a formula the learner's cell holds one too (a typed figure never passes for a link).
 */
export function matches(ses, sheet, range, stateId) {
  const sh = sheetIn(ses, sheet), want = sheetIn(target(stateId), sheet);
  if (!sh || !want) return false;
  return cellsOf(range).every(ref => sameValue(sh.value(ref), want.value(ref)) && (!want.formula(ref) || !!sh.formula(ref)));
}
/** A defined name points where it should (any case, with or without the $ signs). */
export function nameIs(ses, name, ref) {
  const n = Object.entries(ses.names || {}).find(([k]) => k.toLowerCase() === name.toLowerCase());
  return !!n && n[1].replace(/\$/g, '').replace(/'/g, '').toLowerCase() === ref.replace(/\$/g, '').toLowerCase();
}
/** The tabs read in this order from the first. */
export const tabsAre = (ses, names) => names.every((n, i) => ses.sheets[i] && ses.sheets[i].name === n);

/* ---------------- the model lines (5.3, 5.4): graded on the reference formula, in the learner's sheet ---------------- */

/** A named state's cells on one sheet, read only: the master state itself (built on first read), never a clone. */
export const cellsAt = (id, name) => STATES[id].sheets.find(s => s.name === name).cells;
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

/* ---------------- the planting: formats waiting, labels in the helper column ---------------- */

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

/* ---------------- the audit and the DCF (5.5, 5.6): checks, links and calculations on the finished model ---------------- */
// A check cell is built to read zero whatever its inputs do, so it is graded on its value and its
// parsed references; a link on its references and the figure it brings; a calculation on the figure
// it gives, worked out from the learner's own cells.

let DONE_STATE = null;
const doneState = () => (DONE_STATE || (DONE_STATE = stateOf('DONE')));
/** A cell of the finished model, as authored. */
export const doneCell = (name, ref) => doneState().sheets.find(s => s.name === name).cells[ref];
/** A planting of the finished cells' formats on `refs` of a sheet. */
export const formatsOf = (name, refs) => Object.fromEntries(refs.map(r => [name + '!' + r, formatOnly(doneCell(name, r)) || {}]));
/** The finished formula of a cell (the solution types exactly it). */
export const doneFormula = (name, ref) => doneCell(name, ref).formula;
/** The refs of keyed rows over columns: rowRefs('Checks', 'eq') → ['C12', …, 'J12']; a list of keys runs row by row. */
export const rowRefs = (name, keys, cols = COLS) => [].concat(keys).flatMap(key => cols.map(col => col + ROW[name][key]));
/** The row number of a keyed line. */
export const R = (name, key) => ROW[name][key];
/** The active sheet is `name` and the active cell `ref`. */
export const cursorAt = (ses, name, ref) => { const e = ses.sheets[ses.sheetIndex]; if (!e || e.name !== name) return false; const a = e.sheet.dispActive(); return refKey(a.r, a.c) === ref; };
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

/* ---------------- model speed, the project and the drills (5.7, 5.8): the finished model as the answer key ---------------- */
// A block holds formulas whose figures are the finished model's, and a cell the goal names moves when
// a typed input on Inputs moves (the shared liveness rule, run as a what-if on the whole workbook,
// since the model's links cross sheets and its circle iterates).

/** Two figures agree: to a cent in thousands, or a part in a million on a large one (the revolver's circle iterates to a tolerance). */
export const agree = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) <= Math.max(0.005, 1e-6 * Math.abs(b)) : a === b);

/** A live workbook of a state, assembled as the runner assembles one: the sheets, iteration, the names, one recalculation. */
export function sessionOf(state) {
  const build = sp => new Sheet({ rows: sp.rows, cols: sp.cols, cells: JSON.parse(JSON.stringify(sp.cells)), colW: sp.colW, freeze: sp.freeze, gridlines: sp.gridlines, condFmt: sp.condFmt, recalc: false });   // calculated once, assembled
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
 * Every keyed row on sheet `name` holds formulas that read what the workbook says now: `want(col, v)`
 * returns the expected figure from the learner's own cells (v(sheet, ref) reads one). For a link made
 * before the circle it sits in is closed, when the finished model's figure is not yet the right one.
 */
export function echoes(ses, name, keys, want, cols = COLS) {
  const sh = sheetIn(ses, name); if (!sh) return false;
  const v = (sheet, ref) => { const s = sheetIn(ses, sheet); const c = s && s.cells[ref]; return c ? (c.value ?? 0) : 0; };
  return [].concat(keys).every(key => cols.every(col => {
    const c = sh.cells[col + ROW[name][key]];
    return !!c && !!c.formula && agree(c.value, want(col, v, key));
  }));
}

// Where each cash flow link reads, by row key: sheet, row, sign. The revolver nets two rows.
const SR = ROW.Schedules;
const CF_SOURCE = {
  ni: ['IS', ROW.IS.ni], dep: ['Schedules', SR.dep], chgRec: ['Schedules', SR.chgRec], chgPay: ['Schedules', SR.chgPay], chgDef: ['Schedules', SR.chgDef],
  capex: ['Schedules', SR.capexTotal, -1], termDrawn: ['Schedules', SR.termDrawn], termRepaid: ['Schedules', SR.termRepaid], ddDrawn: ['Schedules', SR.ddDrawn], ddRepaid: ['Schedules', SR.ddRepaid],
};
const cfSource = (col, v, key) => (key === 'rev' ? v('Schedules', col + SR.revDrawn) + v('Schedules', col + SR.revRepaid) : (CF_SOURCE[key][2] || 1) * v(CF_SOURCE[key][0], col + CF_SOURCE[key][1]));
/**
 * The cash flow's link rows `keys` read their sources in the same column, on the learner's own
 * figures: the circle (interest on the cash balance) stays open until the cash rows are in, so the
 * finished model's figures are the right ones only then.
 */
export const cfLinked = (ses, keys) => echoes(ses, 'CF', keys, cfSource);

/**
 * The shared liveness rule (engine/live.js) on a model cell: `target` ('Schedules!J9') moves when
 * the typed input `input` ('Inputs!J21') is nudged. The model iterates, so the rule probes a
 * recalculated clone of the whole workbook and the learner's sheets are never touched. A typed
 * number never moves.
 */
export function moves(ses, target, input) {
  const bang = target.indexOf('!');
  return liveVia(ses, target.slice(0, bang), target.slice(bang + 1), [].concat(input));
}
/** The same by keyed rows: cell `col` of line `key` on `sheet` moves when the Inputs line `inKey` (column `inCol`) moves. */
export const liveFrom = (ses, sheet, key, col, inKey, inCol = 'C') => liveVia(ses, sheet, col + rowOf(sheet, key), [`Inputs!${inCol}${rowOf('Inputs', inKey)}`]);

/**
 * A what-if with a verdict: type `values` ({ 'Inputs!G21': 18 }) over the typed inputs, recalculate
 * what they reach, run `fn(ses)`, then put the workbook back exactly as it was (Session.aside).
 */
export function under(ses, values, fn) {
  return ses.aside(() => {
    for (const [key, v] of Object.entries(values)) {
      const [name, ref] = key.split('!'); const c = sheetIn(ses, name) && sheetIn(ses, name).cells[ref];
      if (!c || c.formula) return false;
      c.value = v;
    }
    ses.book.recalc(ses.sheet);
    return !!fn(ses);
  });
}

/** The desk number format, as Format Cells writes the four-section code. */
export const DESK = '#,##0_);(#,##0);"-"_)';
/** Every ref carries the custom number format `code`. */
export const formatted = (sh, refs, code = DESK) => !!sh && refs.every(r => { const c = sh.cells[r]; return !!c && c.fmtStyle === 'custom' && c.numFmt === code; });
/** Every ref carries the format field `field` (bt, it, bold, fontColor) at `value`. */
export const carries = (sh, refs, field, value = true) => !!sh && refs.every(r => { const c = sh.cells[r]; return !!c && c[field] === value; });
