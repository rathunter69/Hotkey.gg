// app2/app/graders.js — the convention graders (C2 gap 3; BANKER_CONVENTIONS "Grader rules").
// Each predicate reads the sheet's END STATE and returns { ok, why }: `why` is one line in the
// house voice, naming the cell and the rule ("B6 is a formula shown in blue"). Formula predicates
// inspect the PARSED token list, never the string, and only run on cells a goal or challenge
// names as a convention check (CLAUDE.md). A challenge with correct numbers and a failing grader
// is not passed; the result card shows the one line.
import { tokenize, formulaRefs } from '../engine/formula.js';
import { translateFormula } from '../engine/formula.js';
import { isLiveFormula } from '../engine/live.js';
import { parseRef, refKey, colLetter } from '../engine/refs.js';

const ok = () => ({ ok: true, why: '' });
const fail = why => ({ ok: false, why });

/** Iterate a range 'A1:C5' (or a single ref) as [r, c, ref]. */
function* eachRef(range) {
  const [a, b] = String(range).split(':');
  const p1 = parseRef(a), p2 = parseRef(b || a);
  if (!p1 || !p2) return;
  for (let r = Math.min(p1.r, p2.r); r <= Math.max(p1.r, p2.r); r++)
    for (let c = Math.min(p1.c, p2.c); c <= Math.max(p1.c, p2.c); c++) yield [r, c, refKey(r, c)];
}
const cellName = ref => ref;   // the voice names cells by their address

const isNumCell = cell => cell && cell.formula == null && typeof cell.value === 'number';
const isFormulaCell = cell => cell && typeof cell.formula === 'string' && cell.formula.length > 0;
const isBlank = cell => !cell || (cell.value == null && cell.formula == null);

/** Every precedent of the formula is on another sheet (a pure link line: green is right). */
function allPrecedentsCrossSheet(cell) {
  try {
    const refs = formulaRefs(cell.formula);
    return refs.length > 0 && refs.every(r => r.sheet);
  } catch (e) { return false; }
}

/**
 * B1/B2: constants in the graded range are blue; formulas are black — or green when every
 * precedent lives on another sheet (a link line).
 */
export function roleColour(sheet, range) {
  for (const [, , ref] of eachRef(range)) {
    const cell = sheet.cells[ref];
    if (isBlank(cell)) continue;
    const colour = cell.fontColor || null;
    if (isNumCell(cell) && colour !== 'blue') return fail(`${cellName(ref)} is an input shown ${colour || 'black'} — inputs are blue`);
    if (isFormulaCell(cell)) {
      if (colour === 'blue') return fail(`${cellName(ref)} is a formula shown in blue`);
      if (colour === 'green' && !allPrecedentsCrossSheet(cell)) return fail(`${cellName(ref)} is green but not a pure link line`);
      if (colour && colour !== 'green' && colour !== 'black') return fail(`${cellName(ref)} is a formula shown in ${colour}`);
    }
  }
  return ok();
}

const LITERAL_ALLOWED = new Set([0, 1, 100, 12]);
/** B4: a graded formula carries no numeric literal beyond 0, 1, 100, 12 (signs, percentages, months). */
export function noLiteralInFormula(sheet, ref) {
  const cell = sheet.cells[ref];
  if (!isFormulaCell(cell)) return ok();
  let toks;
  try { toks = tokenize(cell.formula.replace(/^\s*=/, '')); } catch (e) { return ok(); }
  for (const t of toks) {
    if (t.t === 'num' && !t.abs && !LITERAL_ALLOWED.has(Math.abs(t.v)))
      return fail(`${cellName(ref)} has ${t.v} typed inside the formula — inputs live in their own cell`);
  }
  return ok();
}

/** C3: every formula in the row range is the first one translated across — one formula per row. */
export function rowConsistent(sheet, range) {
  const [a, b] = String(range).split(':');
  const p1 = parseRef(a), p2 = parseRef(b || a);
  if (!p1 || !p2) return ok();
  for (let r = Math.min(p1.r, p2.r); r <= Math.max(p1.r, p2.r); r++) {
    const c1 = Math.min(p1.c, p2.c), c2 = Math.max(p1.c, p2.c);
    const base = sheet.cells[refKey(r, c1)];
    if (!isFormulaCell(base)) continue;
    for (let c = c1 + 1; c <= c2; c++) {
      const ref = refKey(r, c);
      const cell = sheet.cells[ref];
      const want = translateFormula(base.formula, 0, c - c1);
      if (!isFormulaCell(cell) || cell.formula.replace(/\s+/g, '') !== want.replace(/\s+/g, ''))
        return fail(`${cellName(ref)} breaks its row's formula — one formula per row, filled right`);
    }
  }
  return ok();
}

/** D1: negative figures in the range render in parentheses (comma, currency or accounting style). */
export function negativesParen(sheet, range) {
  for (const [, , ref] of eachRef(range)) {
    const cell = sheet.cells[ref];
    const v = cell && (isFormulaCell(cell) ? cell.value : cell.value);
    if (typeof v !== 'number' || v >= 0) continue;
    if (!['comma', 'currency', 'acct'].includes(cell.fmtStyle))
      return fail(`${cellName(ref)} shows a minus — the house uses parentheses`);
  }
  return ok();
}

/** D2: one decimals setting down the graded line (cells with a number format). */
export function decimalsConsistent(sheet, range) {
  let want = null, first = null;
  for (const [, , ref] of eachRef(range)) {
    const cell = sheet.cells[ref];
    if (!cell || cell.fmtStyle === undefined || cell.fmtStyle === 'general' || cell.fmtStyle == null) continue;
    const d = cell.decimals == null ? 0 : cell.decimals;
    if (want === null) { want = d; first = ref; continue; }
    if (d !== want) return fail(`${cellName(ref)} shows ${d} decimals against ${want} at ${first} — decimals are consistent down a line`);
  }
  return ok();
}

/** D5: each named total carries a top border (single or the all-border it inherited is not enough). */
export function totalsTopBorder(sheet, refs) {
  for (const ref of Array.isArray(refs) ? refs : [refs]) {
    const cell = sheet.cells[ref];
    if (!cell || (!cell.bt && !cell.bdbl)) return fail(`${cellName(ref)} is a total without a top border`);
  }
  return ok();
}

/** C5: a units line in rows 1–3 ("USD", "$", "000s", "thousands"). */
export function unitsLabel(sheet) {
  for (let r = 1; r <= 3; r++) for (let c = 1; c <= (sheet.cols || 26); c++) {
    const cell = sheet.cells[refKey(r, c)];
    if (cell && typeof cell.value === 'string' && /USD|\$|000s|thousands/i.test(cell.value)) return ok();
  }
  return fail('no units line — state the currency once in the top rows ("USD unless stated")');
}

/** F1: a live check cell that evaluates to 0 (or TRUE) — two things that must agree, agreeing. */
export function checkCell(sheet, ref) {
  const cell = sheet.cells[ref];
  if (!isFormulaCell(cell)) return fail(`${cellName(ref)} is not a formula — a check is a live difference, not a typed 0`);
  if (!isLiveFormula(sheet, ref)) return fail(`${cellName(ref)} does not move with its inputs`);
  const v = cell.value;
  if (v === true || (typeof v === 'number' && Math.abs(v) < 1e-6)) return ok();
  return fail(`${cellName(ref)} reads ${v} — the check does not tie`);
}

/** C7: nothing hidden on the sheet (grouped outlines are allowed; hiding is how columns get lost). */
export function noHidden(sheet) {
  if (sheet.hiddenCols && sheet.hiddenCols.size) return fail(`column ${colLetter([...sheet.hiddenCols][0])} is hidden — group it instead`);
  if (sheet.hiddenRows && sheet.hiddenRows.size) return fail(`row ${[...sheet.hiddenRows][0]} is hidden — group it instead`);
  return ok();
}

/** The liveness rule as a grader: perturb an input, the result must move (never a regex). */
export function liveness(sheet, ref) {
  const cell = sheet.cells[ref];
  if (!isFormulaCell(cell)) return fail(`${cellName(ref)} is a typed number where a live formula belongs`);
  if (!isLiveFormula(sheet, ref)) return fail(`${cellName(ref)} does not move with its inputs`);
  return ok();
}

/**
 * Audit lessons: nothing changed beyond the allowed refs. `before` is the sheet's cells as
 * authored (a state's sheet.cells); `allowed` lists the refs the fixes may touch.
 */
export function unchangedExcept(sheet, before, allowed = []) {
  const allow = new Set(allowed);
  // Engine cells are full records with defaults (formula: null, indent: 0, fmtStyle 'general');
  // authored state cells are sparse. Normalise both to the meaningful non-default fields.
  const ZEROABLE = new Set(['indent', 'scale', 'ca', 'decimals']);
  const norm = c => {
    if (!c) return '';
    const o = {};
    for (const k of Object.keys(c).sort()) {
      const v = c[k];
      if (v === undefined || v === null || v === false) continue;
      if (v === 0 && ZEROABLE.has(k)) continue;
      if (k === 'fmtStyle' && v === 'general') continue;
      if (k === 'txt') continue;   // derived from the value's type, never authored
      o[k] = v;
    }
    if (o.formula !== undefined) delete o.value;   // computed, not authored
    return JSON.stringify(o);
  };
  const refs = new Set([...Object.keys(before || {}), ...Object.keys(sheet.cells || {})]);
  for (const ref of refs) {
    if (allow.has(ref)) continue;
    if (norm(before[ref]) !== norm(sheet.cells[ref])) return fail(`${cellName(ref)} changed — fix the faults and nothing else`);
  }
  return ok();
}
