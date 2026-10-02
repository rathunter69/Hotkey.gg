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
import { codeDecimals, builtinCode } from '../engine/numfmt.js';
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

/** The formula reads another sheet (a sheet name and an exclamation mark: green is right, script 1.1.5 and 1.6.4). */
function readsAnotherSheet(cell) {
  try {
    const refs = formulaRefs(cell.formula);
    return refs.some(r => r.sheet);
  } catch (e) { return false; }
}

/**
 * B1/B2: constants in the graded range are blue; formulas are black, or green when they read
 * another sheet (a link).
 */
export function roleColour(sheet, range) {
  for (const [, , ref] of eachRef(range)) {
    const cell = sheet.cells[ref];
    if (isBlank(cell)) continue;
    const colour = cell.fontColor || null;
    if (isNumCell(cell) && colour !== 'blue') return fail(`${cellName(ref)} is an input shown ${colour || 'black'}. Inputs are blue`);
    if (isFormulaCell(cell)) {
      if (colour === 'blue') return fail(`${cellName(ref)} is a formula shown in blue`);
      if (colour === 'green' && !readsAnotherSheet(cell)) return fail(`${cellName(ref)} is green but reads nothing on another sheet`);
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
      return fail(`${cellName(ref)} has ${t.v} typed inside the formula. Inputs live in their own cell`);
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
        return fail(`${cellName(ref)} breaks its row's formula. One formula per row, filled right`);
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
    return fail(`${cellName(ref)} shows a minus. The house uses parentheses`);
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
    if (d !== want) return fail(`${cellName(ref)} shows ${d} decimals against ${want} at ${first}. Decimals are consistent down a line`);
  }
  return ok();
}

/** D3: a zero in the range shows as a dash (or nothing), never as 0 or 0.0. */
export function zeroAsDash(sheet, range) {
  for (const [, , ref] of eachRef(range)) {
    const cell = sheet.cells[ref];
    if (!cell || typeof cell.value !== 'number' || cell.value !== 0) continue;
    const txt = shown(cell);
    if (/\d/.test(txt)) return fail(`${cellName(ref)} shows a zero as ${txt.trim()}. Zero is a dash`);
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
    if (has && !want.has(r)) return fail(`${cellName(ref)} carries a $. The currency sign sits on the first and total rows only`);
    if (!has && want.has(r) && !isPercentCell(cell)) return fail(`${cellName(ref)} has no $. The first and total rows carry the currency sign`);
  }
  return ok();
}

/** C4: the cost lines are negative (income positive, costs negative; never flipped mid-model). */
export function costsNegative(sheet, range) {
  for (const [, , ref] of eachRef(range)) {
    const cell = sheet.cells[ref];
    if (!cell || typeof cell.value !== 'number') continue;
    if (cell.value > 0) return fail(`${cellName(ref)} shows a cost as a positive. Costs are negative, stated once up top`);
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
    if (cell.ball || cell.bb || cell.bl || cell.br) return fail(`${cellName(ref)} carries a grid border. A total gets a top border, the block gets none`);
  }
  return ok();
}

/** D7: the title is centred across `span` columns (Center Across Selection), not padded with spaces. */
export function titleAcross(sheet, ref, span) {
  const cell = sheet.cells[ref];
  if (!cell || (cell.value == null && cell.formula == null)) return fail(`${cellName(ref)} has no title`);
  if (typeof cell.value === 'string' && cell.value !== cell.value.trim()) return fail(`${cellName(ref)} is padded with spaces. Center Across Selection, never a merge`);
  if ((cell.ca | 0) !== span) return fail(`${cellName(ref)} is not centered across ${span} columns. Center Across Selection, never a merge`);
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
    if (size(cell) !== want) return fail(`${cellName(ref)} is a different font size from ${first}. One size across the page`);
  }
  if (titleCell && want !== null && size(titleCell) < want) return fail(`${cellName(title)} is a title smaller than the page. One size across, the title may be larger`);
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
  if (!isFormulaCell(cell)) return fail(`${cellName(ref)} is not a formula. A check is a live difference, not a typed 0`);
  if (!isLiveFormula(sheet, ref)) return fail(`${cellName(ref)} does not move with its inputs`);
  const v = cell.value;
  if (v === true || (typeof v === 'number' && Math.abs(v) < 1e-6)) return ok();
  return fail(`${cellName(ref)} reads ${v}. The check does not tie`);
}

/** C7: nothing hidden on the sheet (grouped outlines are allowed; hiding is how columns get lost). */
export function noHidden(sheet) {
  if (sheet.hiddenCols && sheet.hiddenCols.size) return fail(`column ${colLetter([...sheet.hiddenCols][0])} is hidden. Group it instead`);
  if (sheet.hiddenRows && sheet.hiddenRows.size) return fail(`row ${[...sheet.hiddenRows][0]} is hidden. Group it instead`);
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
    if (norm(before[ref]) !== norm(sheet.cells[ref])) return fail(`${cellName(ref)} changed. Fix the faults and nothing else`);
  }
  return ok();
}

/**
 * The sheet standard over a whole sheet (screenplay section 5, "The sheet standard"; M86). Reads
 * the skeleton from the sheet itself, so it audits a page whichever way it was built: title A1,
 * units A2, row 3 empty, headers row 4, labels in column A (Chapter 1) or B (Chapter 2 on), figures
 * from row 5, the convention graders over the figure block, totals, one font size, nothing hidden,
 * panes frozen at the first figure, gridlines off on a page someone reads. Returns every departure
 * as a list of one-line reasons (empty when the sheet is to standard).
 */
export function sheetStandard(sheet, { chapter = 1, read = true } = {}) {
  const out = [];
  const add = r => { if (r && !r.ok) out.push(r.why); };
  const labelCol = chapter <= 1 ? 1 : 2, figCol = labelCol + 1;
  const cellAt = (r, c) => sheet.cells[refKey(r, c)];
  let lastRow = 0, lastCol = 0;
  for (const k in sheet.cells) {
    if (isBlank(sheet.cells[k])) continue;
    const p = parseRef(k); if (!p) continue;
    if (p.r > lastRow) lastRow = p.r; if (p.c > lastCol) lastCol = p.c;
  }
  const title = sheet.cells.A1, units = sheet.cells.A2;
  if (!title || typeof title.value !== 'string' || !title.value.trim()) out.push('A1 has no title');
  else if (!title.bold) out.push('A1 is a title that is not bold');
  if (!units || typeof units.value !== 'string' || !units.value.trim()) out.push('A2 has no units line');
  else if (!units.it) out.push('A2 is the units line and is not italic');
  for (let c = 1; c <= lastCol; c++) if (!isBlank(cellAt(3, c))) { out.push(`${refKey(3, c)} is filled, row 3 is the spacer`); break; }
  let anyHeader = false;
  for (let c = 1; c <= lastCol; c++) {
    const h = cellAt(4, c);
    if (isBlank(h)) continue;
    anyHeader = true;
    if (!h.bold) out.push(`${refKey(4, c)} is a header that is not bold`);
  }
  if (!anyHeader) out.push('row 4 has no headers');
  // a header over a column of figures sits right; a header over a text column (a week label) may sit left
  let tableEnd = 5;   // the first table: row 5 down to the first empty row
  while (tableEnd <= lastRow) { let any = false; for (let c = 1; c <= lastCol && !any; c++) any = !isBlank(cellAt(tableEnd + 1, c)); if (!any) break; tableEnd++; }
  for (let c = figCol; c <= lastCol; c++) {
    let figures = false;
    for (let r = 5; r <= tableEnd && !figures; r++) { const x = cellAt(r, c); figures = !!x && (typeof x.value === 'number' || isFormulaCell(x)); }
    if (figures) add(headersRight(sheet, refKey(4, c)));
  }
  if (labelCol === 2) for (let r = 5; r <= lastRow; r++) {
    const c = cellAt(r, 1);
    // A is the narrow helper column: a code or a helper beside a label in B is fine; text in A with nothing in B is a label in the wrong column
    if (c && typeof c.value === 'string' && c.value.length > 3 && isBlank(cellAt(r, 2))) { out.push(`${refKey(r, 1)} holds a label, labels sit in column B from Chapter 2 on`); break; }
  }
  for (let r = 5; r <= lastRow; r++) {
    const l = cellAt(r, labelCol);
    if (l && typeof l.value === 'string' && /^\s/.test(l.value)) out.push(`${refKey(r, labelCol)} is indented with spaces, use the indent button`);
  }
  if (lastRow >= 5 && lastCol >= figCol) {
    const block = `${refKey(5, figCol)}:${refKey(lastRow, lastCol)}`;
    add(roleColour(sheet, block));
    add(negativesParen(sheet, block));
    for (const [, , ref] of eachRef(block)) {
      const cell = sheet.cells[ref];
      if (!cell || isBlank(cell)) continue;
      const num = typeof cell.value === 'number' || isFormulaCell(cell);
      if (num && typeof cell.value !== 'string' && (!cell.fmtStyle || cell.fmtStyle === 'general')) { out.push(`${ref} is a figure with no number format`); break; }
    }
    for (const [, , ref] of eachRef(block)) {
      const cell = sheet.cells[ref];
      if (cell && !isBlank(cell) && isPercentCell(cell) && !cell.it) { out.push(`${ref} is a percentage that is not italic`); break; }
    }
  }
  // no grid: a total's top border and the final double bottom are the only lines a block gets, plus the one
  // vertical border a page allows, the A/E divider (a right border down one column, where the estimates start)
  {
    const dividerCols = new Set();
    for (const k in sheet.cells) {
      const cell = sheet.cells[k]; if (!cell) continue;
      if (cell.ball || cell.bb || cell.bl) { out.push(`${k} carries a grid border. A total gets a top border, the block gets none`); break; }
      if (cell.br) dividerCols.add(parseRef(k).c);
    }
    if (dividerCols.size > 1) out.push(`${colLetter([...dividerCols][1])} carries a vertical border. The A/E divider is the one vertical line a page allows`);
  }
  add(oneFontSize(sheet, `A1:${refKey(Math.max(lastRow, 1), Math.max(lastCol, 1))}`, 'A1'));
  add(noHidden(sheet));
  for (let r = 5; r <= lastRow; r++) {
    const l = cellAt(r, labelCol);
    if (!l || typeof l.value !== 'string' || !/^Total\b/.test(l.value)) continue;
    for (let c = figCol; c <= lastCol; c++) {
      const f = cellAt(r, c);
      if (isBlank(f)) continue;
      if (!f.bold || !(f.bt || f.bdbl)) { out.push(`${refKey(r, c)} is a total that is not bold with a top border`); break; }
    }
  }
  const fz = sheet.freeze || { r: 0, c: 0 };
  if (fz.r !== 4 || fz.c !== labelCol) out.push(`panes are not frozen at ${refKey(5, figCol)}`);
  if (read) add(gridlinesOff(sheet));
  return out;
}

/* ---------------- M63 / M64: the desk number format and signed-formula starts ---------------- */
/** The code a cell is dressed in, as Format Cells › Custom shows it: its own custom code, or the code of its built-in style. */
export function cellFormatCode(cell) {
  if (!cell) return 'General';
  if (cell.fmtStyle === 'custom' && cell.numFmt) return cell.numFmt;
  return builtinCode(cell.fmtStyle || 'general', cell.decimals | 0, cell.scale | 0);
}
/** A code's sections (split on ; outside quotes and brackets). */
function codeSections(code) {
  const out = []; let cur = '', q = false, b = false;
  for (const ch of String(code)) {
    if (ch === '"' && !b) q = !q; else if (ch === '[' && !q) b = true; else if (ch === ']' && !q) b = false;
    if (ch === ';' && !q && !b) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur); return out;
}
/** A section with its spacers (_x), fills (*x), quoted text and [colour] tags taken out: the digits and punctuation that show. */
const bareSection = sec => String(sec).replace(/"[^"]*"/g, '').replace(/\[[^\]]*\]/g, '').replace(/[_*]./g, '').replace(/\s+/g, '');
/**
 * The desk number format (M64): a thousands separator, no decimals, negatives in brackets. Every
 * route that writes it passes: Format Cells › Number (0 decimals, Use 1000 Separator, (1,234)) is
 * #,##0_);(#,##0), red or not; Comma Style with its decimals taken off (Alt H K, Alt H 9 twice) is
 * _(* #,##0_);_(* (#,##0);_(* "-"??_);_(@_). With `countsOk`, plain #,##0 passes too (a column of
 * counts that can never be negative).
 */
export function isDeskNumberFormat(code, opts = {}) {
  const secs = codeSections(code).map(bareSection);
  if (!/^#,##0$/.test(secs[0] || '')) return false;
  if (secs.length === 1) return !!opts.countsOk;
  return /^\(#,##0\)$/.test(secs[1] || '');
}
/** Grade cells' format as the desk number format: { ok, why }. */
export function deskNumberFormat(sheet, range, opts = {}) {
  for (const [r, c, ref] of eachRef(range)) {
    if (!isDeskNumberFormat(cellFormatCode(sheet.get(r, c)), opts)) return fail(cellName(ref) + ' is not in the desk number format: thousands separator, no decimals, negatives in brackets');
  }
  return ok();
}
/**
 * A formula as a grader compares it (M63): the keypad habit's leading + is dropped (=+D5-E5 is
 * =D5-E5; =-D5 stays), spaces outside quotes go, and the case outside quotes is evened.
 */
export function normalizeSignedFormula(f) {
  let t = String(f == null ? '' : f).trim();
  if (t[0] === '+' || t[0] === '-') t = '=' + t;
  t = t.replace(/^=\s*\+\s*/, '=');
  let out = '', q = false;
  for (const ch of t) { if (ch === '"') q = !q; if (!q && /\s/.test(ch)) continue; out += q ? ch : ch.toUpperCase(); }
  return out;
}
/** Two formulas are the same entry once the leading + is set aside (M63). */
export const sameFormula = (a, b) => normalizeSignedFormula(a) === normalizeSignedFormula(b);
