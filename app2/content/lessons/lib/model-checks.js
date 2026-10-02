// app2/content/lessons/lib/model-checks.js — what Chapter 5's lessons share on the clearcoat-model
// workbook (modules 5.1 and 5.2): where a keyed line sits, the planting (a lesson's target cells
// arrive formatted, so the learner types what the goal teaches), the One site and One week pages
// worked out in JS from the learner's own inputs, and the keys helpers. Every check reads the
// learner's sheets: a cell holds a formula (never a typed figure), it reads what the line should
// read on the inputs as they stand, and the cell a goal names moves when an input moves (the shared
// liveness rule). Any legitimate route passes.
import { sheetIn, settled, calls, live, near, isNum, reads } from './databook-checks.js';
import { ROW, STATES } from '../../workbooks/clearcoat-model.js';
import { Sheet } from '../../../engine/sheet.js';
import { Session } from '../../../engine/keyboard.js';

export { sheetIn, settled, calls, live, near, isNum, reads };

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
/** The active sheet is `name`. */
export const onSheet = (ses, name) => !!ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;

/* ---------------- the model (5.2 on): the learner's cells against the state the lesson ends on ---------------- */

const build = sp => new Sheet({ rows: sp.rows, cols: sp.cols, cells: JSON.parse(JSON.stringify(sp.cells || {})), colW: sp.colW, freeze: sp.freeze, gridlines: sp.gridlines, condFmt: sp.condFmt });
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
