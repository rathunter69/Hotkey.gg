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
import { dispText } from '../engine/format.js';
import { codeDecimals } from '../engine/numfmt.js';
import { FSZ_BASE } from '../engine/sheet.js';

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

const isPercentCell = cell => cell.fmtStyle === 'percent' || (cell.fmtStyle === 'custom' && /%/.test(cell.numFmt || ''));
/** What the cell shows on screen (a custom code renders through the same engine as TEXT()). */
const shown = cell => dispText(cell);

/**
 * D1: negative figures in the range render in parentheses — a built-in comma, currency or
 * accounting style, or a custom code whose negative section wraps the figure. Percent
 * negatives may keep the minus.
 */
export function negativesParen(sheet, range) {
  for (const [, , ref] of eachRef(range)) {
    const cell = sheet.cells[ref];
    const v = cell && cell.value;
    if (typeof v !== 'number' || v >= 0) continue;
    if (isPercentCell(cell)) continue;
    if (['comma', 'currency', 'acct'].includes(cell.fmtStyle)) continue;
    if (cell.fmtStyle === 'custom' && /\(/.test(shown(cell))) continue;
    return fail(`${cellName(ref)} shows a minus — the house uses parentheses`);
  }
  return ok();
}

/** The decimals a cell shows: its setting, or its custom code's first section. */
const cellDecimals = cell => cell.fmtStyle === 'custom' ? codeDecimals(cell.numFmt || '') : (cell.decimals == null ? 0 : cell.decimals);

/** D2: one decimals setting down the graded line (cells with a number format). */
export function decimalsConsistent(sheet, range) {
  let want = null, first = null;
  for (const [, , ref] of eachRef(range)) {
    const cell = sheet.cells[ref];
    if (!cell || cell.fmtStyle === undefined || cell.fmtStyle === 'general' || cell.fmtStyle == null) continue;
    const d = cellDecimals(cell);
    if (want === null) { want = d; first = ref; continue; }
    if (d !== want) return fail(`${cellName(ref)} shows ${d} decimals against ${want} at ${first} — decimals are consistent down a line`);
  }
  return ok();
}

/** D3: a zero in the range shows as a dash (or nothing), never as 0 or 0.0. */
export function zeroAsDash(sheet, range) {
  for (const [, , ref] of eachRef(range)) {
    const cell = sheet.cells[ref];
    if (!cell || typeof cell.value !== 'number' || cell.value !== 0) continue;
    const txt = shown(cell);
    if (/\d/.test(txt)) return fail(`${cellName(ref)} shows a zero as ${txt.trim()} — zero is a dash`);
  }
  return ok();
}

/**
 * D4: in the block, the currency sign sits on the first and total rows only. `rows` lists the
 * rows that carry it; every other figure in the range shows none. Zeros (dashes) are skipped.
 */
export function dollarRows(sheet, range, rows) {
  const want = new Set(rows);
  for (const [r, , ref] of eachRef(range)) {
    const cell = sheet.cells[ref];
    if (!cell || typeof cell.value !== 'number' || cell.value === 0) continue;
    const has = /\$/.test(shown(cell));
    if (has && !want.has(r)) return fail(`${cellName(ref)} carries a $ — the currency sign sits on the first and total rows only`);
    if (!has && want.has(r) && !isPercentCell(cell)) return fail(`${cellName(ref)} has no $ — the first and total rows carry the currency sign`);
  }
  return ok();
}

/** C4: the cost lines are negative (income positive, costs negative; never flipped mid-model). */
export function costsNegative(sheet, range) {
  for (const [, , ref] of eachRef(range)) {
    const cell = sheet.cells[ref];
    if (!cell || typeof cell.value !== 'number') continue;
    if (cell.value > 0) return fail(`${cellName(ref)} shows a cost as a positive — costs are negative, stated once up top`);
  }
  return ok();
}

/** C4: the sign convention is stated once in the top rows ("costs shown as negatives"). */
export function signStated(sheet) {
  for (let r = 1; r <= 3; r++) for (let c = 1; c <= (sheet.cols || 26); c++) {
    const cell = sheet.cells[refKey(r, c)];
    if (cell && typeof cell.value === 'string' && /negative/i.test(cell.value)) return ok();
  }
  return fail('the sign convention is not stated — say once in the top rows that costs are shown as negatives');
}

/** A3: gridlines off on a page someone else will read; borders carry structure instead. */
export function gridlinesOff(sheet) {
  return sheet.gridlines === false ? ok() : fail('gridlines are on — a page someone else reads has them off');
}

/** D5: nothing in the range carries a grid border; a total's top border (or a double bottom) is the only border a block gets. */
export function noGrid(sheet, range) {
  for (const [, , ref] of eachRef(range)) {
    const cell = sheet.cells[ref];
    if (!cell) continue;
    if (cell.ball || cell.bb || cell.bl || cell.br) return fail(`${cellName(ref)} carries a grid border — a total gets a top border, the block gets none`);
  }
  return ok();
}

/** D7: the title is centred across `span` columns (Center Across Selection), not padded with spaces. */
export function titleAcross(sheet, ref, span) {
  const cell = sheet.cells[ref];
  if (!cell || (cell.value == null && cell.formula == null)) return fail(`${cellName(ref)} has no title`);
  if (typeof cell.value === 'string' && cell.value !== cell.value.trim()) return fail(`${cellName(ref)} is padded with spaces — Center Across Selection, never a merge`);
  if ((cell.ca | 0) !== span) return fail(`${cellName(ref)} is not centered across ${span} columns — Center Across Selection, never a merge`);
  return ok();
}

/** D6: headers over numbers are right-aligned (a number header keeps its natural right edge). */
export function headersRight(sheet, range) {
  for (const [, , ref] of eachRef(range)) {
    const cell = sheet.cells[ref];
    if (isBlank(cell)) continue;
    if (typeof cell.value === 'string' && cell.align !== 'r') return fail(`${cellName(ref)} is a header over numbers that is not right-aligned`);
    if (typeof cell.value === 'number' && cell.align && cell.align !== 'r') return fail(`${cellName(ref)} is a header over numbers that is not right-aligned`);
  }
  return ok();
}

/** D6: an informational line (a percentage, a memo) is italic. */
export function italicLines(sheet, range) {
  for (const [, , ref] of eachRef(range)) {
    const cell = sheet.cells[ref];
    if (isBlank(cell)) continue;
    if (!cell.it) return fail(`${cellName(ref)} is a percentage line that is not italic`);
  }
  return ok();
}

/** D6: sub-item labels sit one level in. */
export function indented(sheet, range, level = 1) {
  for (const [, , ref] of eachRef(range)) {
    const cell = sheet.cells[ref];
    if (isBlank(cell)) continue;
    if ((cell.indent | 0) < level) return fail(`${cellName(ref)} is a sub-item that is not indented`);
  }
  return ok();
}

/** D8: one font size across the range; `title` (a ref) may be larger, nothing else differs. */
export function oneFontSize(sheet, range, title = null) {
  const size = cell => cell.fsz == null ? FSZ_BASE : cell.fsz;
  let want = null, first = null, titleCell = null;
  for (const [, , ref] of eachRef(range)) {
    const cell = sheet.cells[ref];
    if (isBlank(cell)) continue;
    if (ref === title) { titleCell = cell; continue; }
    if (want === null) { want = size(cell); first = ref; continue; }
    if (size(cell) !== want) return fail(`${cellName(ref)} is a different font size from ${first} — one size across the page`);
  }
  if (titleCell && want !== null && size(titleCell) < want) return fail(`${cellName(title)} is a title smaller than the page — one size across, the title may be larger`);
  return ok();
}

/**
 * The full canon over a graded block (Chapter 2 onward: every Format/Formula/Structure/Project
 * grader applies it, BANKER_CONVENTIONS "Grader rules"). Runs each rule the spec names and
 * returns the first failure's one line. Every key is optional:
 *   range       the figure block ('B5:P18'): roleColour, negativesParen, noGrid,
 *               decimalsConsistent per line, noLiteralInFormula on every formula in it
 *   zeroDash    true (the range) or a range: zeroAsDash — from module 2.2, once the dash is taught
 *   lines       'rows' (default) or 'cols', or an array of ranges: where decimals must agree
 *   formulas    an array of refs for the literal check (default: every formula in `range`)
 *   rows        ranges that must be one formula filled right (rowConsistent)
 *   costRows    ranges that must be negative (costsNegative) — also asks for the sign line
 *   units       true: unitsLabel
 *   dollar      { range, rows }: dollarRows
 *   totals      refs that carry a top border
 *   pctLines    ranges that are italic
 *   indent      ranges of sub-item labels
 *   headers     the header range (headersRight)
 *   title       { ref, span }: titleAcross; also the cell oneFontSize may let be larger
 *   fontSize    the range for oneFontSize
 *   gridlines   true: gridlinesOff
 *   hidden      true: noHidden
 *   check       a check cell ref (checkCell)
 */
export function fullCanon(sheet, spec = {}) {
  if (!sheet) return fail('the sheet is missing');
  const list = v => v == null ? [] : Array.isArray(v) ? v : [v];
  const run = r => { if (!r.ok) throw r; };
  try {
    if (spec.gridlines) run(gridlinesOff(sheet));
    if (spec.hidden) run(noHidden(sheet));
    if (spec.units) run(unitsLabel(sheet));
    if (spec.costRows) run(signStated(sheet));
    if (spec.title) run(titleAcross(sheet, spec.title.ref, spec.title.span));
    if (spec.fontSize) run(oneFontSize(sheet, spec.fontSize, spec.title ? spec.title.ref : null));
    if (spec.headers) run(headersRight(sheet, spec.headers));
    if (spec.range) {
      run(roleColour(sheet, spec.range));
      const formulas = spec.formulas || [...eachRef(spec.range)].map(([, , ref]) => ref).filter(ref => isFormulaCell(sheet.cells[ref]));
      for (const ref of formulas) run(noLiteralInFormula(sheet, ref));
    }
    for (const rng of list(spec.rows)) run(rowConsistent(sheet, rng));
    for (const rng of list(spec.costRows)) run(costsNegative(sheet, rng));
    if (spec.range) {
      run(negativesParen(sheet, spec.range));
      for (const line of linesOf(spec.range, spec.lines)) run(decimalsConsistent(sheet, line));
      run(noGrid(sheet, spec.range));
    }
    if (spec.zeroDash) run(zeroAsDash(sheet, spec.zeroDash === true ? spec.range : spec.zeroDash));
    if (spec.dollar) run(dollarRows(sheet, spec.dollar.range, spec.dollar.rows));
    if (spec.totals) run(totalsTopBorder(sheet, spec.totals));
    for (const rng of list(spec.pctLines)) run(italicLines(sheet, rng));
    for (const rng of list(spec.indent)) run(indented(sheet, rng));
    if (spec.check) run(checkCell(sheet, spec.check));
  } catch (r) {
    if (r && typeof r.ok === 'boolean') return r;
    throw r;
  }
  return ok();
}

/** The lines of a block where decimals must agree: its rows, its columns, or the ranges given. */
function linesOf(range, lines = 'rows') {
  if (Array.isArray(lines)) return lines;
  const [a, b] = String(range).split(':');
  const p1 = parseRef(a), p2 = parseRef(b || a);
  if (!p1 || !p2) return [];
  const r1 = Math.min(p1.r, p2.r), r2 = Math.max(p1.r, p2.r), c1 = Math.min(p1.c, p2.c), c2 = Math.max(p1.c, p2.c);
  const out = [];
  if (lines === 'cols') for (let c = c1; c <= c2; c++) out.push(`${refKey(r1, c)}:${refKey(r2, c)}`);
  else for (let r = r1; r <= r2; r++) out.push(`${refKey(r, c1)}:${refKey(r, c2)}`);
  return out;
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
