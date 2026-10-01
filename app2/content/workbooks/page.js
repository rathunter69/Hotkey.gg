// app2/content/workbooks/page.js — the sheet standard in code (screenplay section 5, "The sheet
// standard"; M86). Every finished page of a chapter workbook and every drill's solved sheet is
// built here, so they all look like they came off one desk whatever their size. A start state is
// cut from the solved sheet this returns, never laid out by hand.
//
// buildPage(spec) returns one workbook sheet ({ name, cells, colW, rowH, gridlines, freeze }) plus
// `at`, the row each keyed line landed on, and `std`, the layout the sheet-standard audit reads.
//
// The skeleton: title A1 (bold, one size up, centered across the page on a report), units line A2
// (italic), row 3 empty, headers or the timeline in row 4 (bold, right-aligned over figures),
// labels in column A in Chapter 1 and column B from Chapter 2 on, figures from row 5 (column B in
// Chapter 1, C after), one formula per row, typed values blue, formulas black, links to other
// sheets green, the desk number format, totals bold with a top border, a double bottom on the
// final total, a source line under the table, a checks block at the foot, one font and size,
// nothing merged or hidden, gridlines off on a page someone reads, panes frozen at the first figure.
import { Sheet, ROWH_DEFAULT, FSZ_LADDER, FSZ_BASE } from '../../engine/sheet.js';
import { colLetter } from '../../engine/refs.js';
import { formulaRefs } from '../../engine/formula.js';

/** The desk number formats (screenplay 5; source-checklist H: graded by code). */
export const FMT = {
  money: '#,##0_);(#,##0)',
  moneyDollar: '$#,##0_);($#,##0)',
  moneyDash: '#,##0_);(#,##0);"-"_)',
  moneyDollarDash: '$#,##0_);($#,##0);"-"_)',
  count: '#,##0_);(#,##0)',
  countDash: '#,##0_);(#,##0);"-"_)',
  unit: '#,##0.00_);(#,##0.00)',
  unitDollar: '$#,##0.00_);($#,##0.00)',
  mult: '0.0x',
  pct: '0.0%_);(0.0%)',
};
/** The title's size: one step up the font ladder from the page's one size. */
export const TITLE_FSZ = FSZ_LADDER[FSZ_LADDER.indexOf(FSZ_BASE) + 1];
/** Width of a figure (period) column: 12 characters, every figure column the same. */
export const FIGURE_W = 12 * 7 + 5;
/** Width of Chapter 2's narrow helper column A. */
export const HELPER_W = 24;

/** Where the labels and figures start for a chapter. */
export function layoutFor(chapter) {
  const ch = chapterNum(chapter);
  return ch <= 1 ? { labelCol: 1, figCol: 2, dash: false } : { labelCol: 2, figCol: 3, dash: true };
}
function chapterNum(ch) {
  if (typeof ch === 'number') return ch;
  const m = /^(\d+)/.exec(String(ch || '1'));
  return m ? +m[1] : (ch === 'foundations' ? 1 : 2);
}

const allCrossSheet = f => { try { const r = formulaRefs(f); return r.length > 0 && r.every(x => x.sheet); } catch (e) { return false; } };

/** The number format a figure of `kind` takes on this row. */
function fmtOf(kind, { dollar, dash }) {
  if (kind === 'money') return dollar ? (dash ? FMT.moneyDollarDash : FMT.moneyDollar) : (dash ? FMT.moneyDash : FMT.money);
  if (kind === 'count') return dash ? FMT.countDash : FMT.count;
  if (kind === 'unit') return dollar ? FMT.unitDollar : FMT.unit;
  if (kind === 'mult') return FMT.mult;
  if (kind === 'pct') return FMT.pct;
  return null;
}

/** One figure cell: its value or formula, its role colour, its format. */
function figure(src, kind, opts) {
  if (src == null || src === '') return null;
  const c = {};
  if (typeof src === 'string' && src.startsWith('=')) {
    c.formula = src;
    if (allCrossSheet(src)) c.fontColor = 'green';
  } else if (typeof src === 'number') {
    c.value = src; c.fontColor = 'blue';
  } else {
    c.value = src; return c;   // text in a figure column (a week label, a code) carries no number format
  }
  const code = fmtOf(kind, opts);
  if (code) { c.fmtStyle = 'custom'; c.numFmt = code; }
  if (kind === 'pct') c.it = true;
  if (opts.total) { c.bold = true; c.bt = true; if (opts.final) c.bdbl = true; }
  return c;
}

/**
 * Build one page to the standard.
 *
 * spec = {
 *   name, chapter,                 sheet name; 1 (labels A, figures B) or 2+ (helper A, labels B, figures C)
 *   title, units,                  A1 and A2. units is the fixed wording ("USD thousands unless stated; …")
 *   labelHeader,                   the header over the labels (optional)
 *   headers: ['Washes', …],        row 4 over the figure columns (the timeline on a model)
 *   kinds: ['count', 'unit', …],   the figure kind of each column (a table of measures); a row's
 *                                  own kind wins (a model, where lines are measures). Default money.
 *   blocks: [{                     stacked with one empty row between them
 *     title, header: [...], kinds, an optional block title row, its own header row and column kinds
 *     rows: [{ key, label, indent, kind: 'money'|'count'|'unit'|'pct'|'mult'|'text',
 *              values: [...],      one per figure column: a number (typed, blue), '=formula', text, or null
 *              fill: (col, r, at) => '=…',  or one formula per row, filled right (C3)
 *              total, final, dollar }]      a total row; the final total; the $ (default: a block's first row and its totals)
 *   }],
 *   source,                        the line under the table
 *   checks: [{ label, formula }],  the checks block at the foot: live differences reading zero
 *   read: true,                    a page someone reads (gridlines off); false for a working sheet
 *   center: true,                  center the title across the page (a report)
 *   labelW, figureW,               widths (labelW defaults to fitting the longest label)
 *   extra: { A30: {...} },         cells outside the skeleton (rare; the audit still reads them)
 * }
 */
export function buildPage(spec) {
  const { labelCol, figCol, dash } = layoutFor(spec.chapter);
  const L = colLetter(labelCol);
  const nFig = Math.max(spec.headers ? spec.headers.length : 0, ...spec.blocks.map(b => Math.max(b.header ? b.header.length : 0, ...b.rows.map(r => (r.values || []).length))), 1);
  const figCols = Array.from({ length: nFig }, (_, i) => colLetter(figCol + i));
  const lastCol = figCol + nFig - 1;
  const cells = {};
  cells.A1 = { value: spec.title, bold: true, fsz: TITLE_FSZ, ...(spec.center ? { ca: lastCol } : {}) };
  cells.A2 = { value: spec.units, it: true };
  if (spec.labelHeader) cells[L + '4'] = { value: spec.labelHeader, bold: true };
  (spec.headers || []).forEach((h, i) => { if (h != null) cells[figCols[i] + '4'] = { value: h, bold: true, align: 'r' }; });

  // first pass: where every keyed row lands, so a formula can name another line by key
  const at = {};
  const plan = [];
  let r = 5;
  spec.blocks.forEach((b, bi) => {
    if (bi > 0) r++;                      // one empty row between blocks
    const blk = { b, titleRow: null, headerRow: null, rows: [] };
    if (b.title) blk.titleRow = r++;
    if (b.header) blk.headerRow = r++;
    for (const row of b.rows) { if (row.key) at[row.key] = r; blk.rows.push([row, r++]); }
    plan.push(blk);
  });
  const rowOf = k => { if (!(k in at)) throw new Error(`page ${spec.name}: no row keyed ${k}`); return at[k]; };

  const totals = [], pctRows = [], dollarRows = [], indentRefs = [];
  for (const { b, titleRow, headerRow, rows } of plan) {
    if (titleRow) cells[L + titleRow] = { value: b.title, bold: true };
    if (headerRow) b.header.forEach((h, i) => { if (h != null) cells[figCols[i] + headerRow] = { value: h, bold: true, align: 'r' }; });
    rows.forEach(([row, rr], ri) => {
      const kindAt = i => row.kind || (b.kinds && b.kinds[i]) || (spec.kinds && spec.kinds[i]) || 'money';
      const dollar = row.dollar != null ? row.dollar : !!(row.total || ri === 0);
      if (row.label != null) {
        cells[L + rr] = { value: row.label };
        if (row.indent) { cells[L + rr].indent = row.indent; indentRefs.push(L + rr); }
        if (row.total) { cells[L + rr].bold = true; }
      }
      figCols.forEach((col, i) => {
        const src = row.fill ? row.fill(col, rr, rowOf) : (row.values || [])[i];
        const c = figure(src, kindAt(i), { dollar, dash, total: row.total, final: row.final });
        if (c) cells[col + rr] = c;
      });
      if (row.total) { totals.push(rr); if (row.label != null) { cells[L + rr].bt = true; if (row.final) cells[L + rr].bdbl = true; } }
      if (row.kind === 'pct') pctRows.push(rr);
      if (dollar) dollarRows.push(rr);
    });
  }
  let foot = r;
  if (spec.source) { cells[L + foot] = { value: spec.source, it: true }; foot++; }
  let checksRow = null;
  if (spec.checks && spec.checks.length) {
    foot++;
    checksRow = foot;
    cells[L + foot] = { value: 'Checks', bold: true };
    spec.checks.forEach((ch, i) => {
      const rr = foot + 1 + i;
      cells[L + rr] = { value: ch.label, indent: 1 };
      const f = typeof ch.formula === 'function' ? ch.formula(figCols[0], rr, rowOf) : ch.formula;
      cells[figCols[0] + rr] = { formula: f, fmtStyle: 'custom', numFmt: dash ? FMT.countDash : FMT.count, ...(allCrossSheet(f) ? { fontColor: 'green' } : {}) };
    });
    foot += spec.checks.length;
  }
  if (spec.extra) for (const k in spec.extra) cells[k] = spec.extra[k];

  // widths: the label column fits its longest label; figure columns match each other
  const colW = {};
  if (labelCol === 2) colW[1] = HELPER_W;
  const figW = spec.figureW || FIGURE_W;
  for (let c = figCol; c <= lastCol; c++) colW[c] = figW;
  const fit = new Sheet({ cells: JSON.parse(JSON.stringify(cells)), colW });
  colW[labelCol] = spec.labelW || Math.max(FIGURE_W, fit.neededWidth(labelCol, 4, foot));
  // a wrapped header row grows to fit, as Excel's autofit would
  const sized = new Sheet({ cells: JSON.parse(JSON.stringify(cells)), colW });
  sized.select(`A4:${colLetter(lastCol)}4`); sized.autofitRows();
  const rowH = sized.rowH[4] !== ROWH_DEFAULT ? { 4: sized.rowH[4] } : {};

  const sheet = {
    name: spec.name, cells, colW, rowH,
    gridlines: spec.read === false ? undefined : false,
    freeze: { r: 4, c: labelCol },
    active: { r: 1, c: 1 },
  };
  const range = `${figCols[0]}5:${colLetter(lastCol)}${Math.max(5, r - 1)}`;
  const std = { chapter: chapterNum(spec.chapter), read: spec.read !== false, labelCol, figCol, lastCol, lastRow: foot - 1 < 5 ? 5 : foot - 1, range, totals, pctRows, dollarRows, indent: indentRefs, checksRow, center: !!spec.center };
  return { sheet, at, std };
}

/** Cut a start state from a solved page: `fn(cells)` strips or plants what the lesson asks for. */
export function cutFrom(page, fn) {
  const sheet = JSON.parse(JSON.stringify(page.sheet));
  fn(sheet.cells, sheet);
  return sheet;
}
