// app2/content/workbooks/clearcoat-pnl.js — the Chapter 2 module workbook (Project Rinse, the book).
// Clearcoat Express, company level: three years of P&L (FY24A, FY25A, FY26E) in thousands of
// dollars, exported from the accounting system for the financials section of the information
// memorandum (script-ch2.md, "The workbook"). Chapter 2 takes it to presentation quality.
//
// Sheets: P&L (the page a buyer reads: account codes in A, labels in B, the three years in C:E),
// Inputs (the CFO’s assumptions, which module 2.6 reads), Monthly (FY26 by month: labels in B,
// January to December in C:N, the full year in O) and Print (the one-page summary 2.7.3 builds;
// empty until then).
//
// STATES chain the lessons (before → solution → after, asserted by tests/module-states.test.js and
// tests/pnl-states.test.js). Every state is DERIVED from the previous one, and where a lesson’s
// effect is an engine operation (a number format, a Paste Special multiply, a typed date) the
// patch runs that same operation on a live Sheet (viaEngine), so the state is what the engine
// makes of the keys. `S1raw` is the export as it arrived; S1a–S1d are module 2.1 (number formats),
// S2a–S2d module 2.2 (custom number formats); `Pdone` is the presentation-quality page the chapter
// builds toward, built through the shared page module (page.js, M86) and audited by the sheet standard.
import { Sheet, ROWH_DEFAULT, FMT_FIELDS } from '../../engine/sheet.js';
import { dateToSerial, serialToDate } from '../../engine/format.js';
import { parseRef, colLetter } from '../../engine/refs.js';
import { translateFormula } from '../../engine/formula.js';
import { buildPage, TITLE_FSZ, FIGURE_W } from './page.js';
import { diffStates, sessionToState, PAGE_SETUP_DEFAULT } from './clearcoat-weekly.js';

export { diffStates, sessionToState, PAGE_SETUP_DEFAULT };
export const CHAPTER = 2;

const clone = o => JSON.parse(JSON.stringify(o));

/* ---------------- the layout ---------------- */

export const YEARS = ['FY24A', 'FY25A', 'FY26E'];
export const YEAR_COLS = ['C', 'D', 'E'];
/** The export heads its year columns with text (2.1.4 puts real dates there). */
export const YEAR_TEXT = ['FY2024', 'FY2025', 'FY2026'];
/** The three fiscal year ends, as Excel date serials. */
export const YEAR_ENDS = [dateToSerial(2024, 12, 31), dateToSerial(2025, 12, 31), dateToSerial(2026, 12, 31)];
export const YEAR_END_TEXT = ['12/31/2024', '12/31/2025', '12/31/2026'];
export const FLAGS = ['A', 'A', 'E'];

/** The P&L's rows (script-ch2.md, "The workbook"). */
export const ROW = {
  header: 4, flags: 5, revHead: 6,
  retail: 7, members: 8, other: 9, revenue: 10,
  costHead: 12, chemicals: 13, labor: 14, rent: 15, utilities: 16, maintenance: 17, cardFees: 18, marketing: 19, siteCosts: 20,
  contribution: 22, headOffice: 23, ebitda: 24,
  marginHead: 26, grossMargin: 27, contribMargin: 28, ebitdaMargin: 29, growth: 30,
  memoHead: 32, sites: 33, washes: 34, perWash: 35,
  source: 36, checksHead: 38, checkRevenue: 39, checkMonthly: 40,
};
export const REVENUE_ROWS = [7, 8, 9];
export const SITE_COST_ROWS = [13, 14, 15, 16, 17, 18, 19];
/** The typed lines and the cost lines among them (2.1.2 flips the costs negative). */
export const LINE_ROWS = [...REVENUE_ROWS, ...SITE_COST_ROWS, 23];
export const COST_ROWS = [...SITE_COST_ROWS, 23];
/** The dollar lines 2.1.1 formats (three blocks), the $ rows 2.1.3 marks, the margins block. */
export const DOLLAR_BLOCKS = ['C7:E10', 'C13:E20', 'C22:E24'];
export const DOLLAR_ROWS = [7, 10, 24];
export const PLAIN_ROWS = [8, 9, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23];
export const PCT_ROWS = [27, 28, 29, 30];
/** Where 2.1.2 parks the -1 it multiplies the cost lines by: beside the last site-cost line. */
export const SPARE_CELL = 'G19';
/** Where 2.1.3 puts the two-year compound growth, and its label above it. */
export const CAGR_CELL = 'F30', CAGR_LABEL_CELL = 'F29';

/** The export’s account codes and labels (capitals, as the system writes them). */
const RAW_LINES = {
  7: ['4010', 'RETAIL WASH REVENUE'], 8: ['4020', 'MEMBERSHIP REVENUE'], 9: ['4090', 'OTHER REVENUE'], 10: [null, 'TOTAL REVENUE'],
  13: ['5010', 'CHEMICALS AND WATER'], 14: ['6010', 'LABOR'], 15: ['6020', 'RENT'], 16: ['6030', 'UTILITIES'], 17: ['6040', 'MAINTENANCE'],
  18: ['6050', 'CARD FEES'], 19: ['6060', 'MARKETING'], 20: [null, 'TOTAL SITE COSTS'],
  22: [null, 'SITE CONTRIBUTION'], 23: ['7010', 'HEAD OFFICE'], 24: [null, 'EBITDA'],
  33: [null, 'SITES (YEAR END)'], 34: [null, 'WASHES (000S)'], 35: [null, 'REVENUE PER WASH'],
};
/** The labels as a buyer reads them (sentence case; the page in Pdone). */
export const LABELS = {
  7: 'Retail wash revenue', 8: 'Membership revenue', 9: 'Other revenue', 10: 'Total revenue',
  13: 'Chemicals and water', 14: 'Labor', 15: 'Rent', 16: 'Utilities', 17: 'Maintenance', 18: 'Card fees', 19: 'Marketing', 20: 'Total site costs',
  22: 'Site contribution', 23: 'Head office', 24: 'EBITDA',
  27: 'Gross margin', 28: 'Site contribution margin', 29: 'EBITDA margin', 30: 'Revenue growth',
  33: 'Sites (year end)', 34: 'Washes (thousands)', 35: 'Revenue per wash ($)',
};
export const MARGIN_HEAD = 'Margins and growth';
export const MARGIN_LABELS = [LABELS[27], LABELS[28], LABELS[29], LABELS[30]];
/** The two checks at the foot of the P&L (short enough to sit under the label column's fit, 2.3.5). */
export const CHECK_LABELS = ['Revenue less its lines', 'Last year less Monthly'];
export const CHECK_FORMULAS = ['=ROUND(SUM(C10:E10)-SUM(C7:E9),0)', '=E10-Monthly!O10'];   // rounded, so the ledger's decimals never leave a check a hair off zero (2.5.2 paints anything but zero red)

/** The subtotal formulas for a year column. `signed`: costs are negative and the subtotals add (2.1.2). */
export function subtotalFormulas(col, { signed = false } = {}) {
  const c = col;
  return {
    10: `=SUM(${c}7:${c}9)`,
    20: `=SUM(${c}13:${c}19)`,
    22: signed ? `=${c}10+${c}20` : `=${c}10-${c}20`,
    24: signed ? `=${c}22+${c}23` : `=${c}22-${c}23`,
  };
}
/** The margins block 2.1.3 builds, per year column (growth from the second year on). */
export function marginFormulas(col) {
  const c = col, prev = String.fromCharCode(col.charCodeAt(0) - 1);
  const out = { 27: `=(${c}10+${c}13)/${c}10`, 28: `=${c}22/${c}10`, 29: `=${c}24/${c}10` };
  if (col !== 'C') out[30] = `=${c}10/${prev}10-1`;
  return out;
}
export const CAGR_FORMULA = '=(E10/C10)^(1/(COLUMNS(C10:E10)-1))-1';
export const PER_WASH_FORMULA = col => `=${col}10/${col}34`;

/* ---------------- the figures (USD thousands) ---------------- */

/**
 * FY24A and FY25A as the ledger closed them, with the export’s stray decimals (18000.4 reads
 * 18,000 once formatted); FY26E is the budget, the sum of its twelve months on Monthly. Each line
 * rounds to the figure in script-ch2.md, and so does every total.
 */
export const FIGURES = {
  7: [18000.4, 22000.3, 26000], 8: [13999.7, 17499.6, 22000], 9: [1000.2, 1500.4, 2000],
  13: [3960.3, 4920.2, 6000], 14: [6599.8, 8199.7, 9500], 15: [4200.1, 5100.3, 6000], 16: [1650.4, 2049.8, 2400],
  17: [989.6, 1230.4, 1500], 18: [660.2, 819.6, 1000], 19: [659.9, 820.1, 1000],
  23: [4500.2, 5300.3, 6000],
};
export const SITES_FY = [28, 34, 40];
export const WASHES_FY = [2400, 2950, 3600];

/** The last year by month: a seasonal tilt on the lines that move with washes, flat on the rest; every line sums to its last-year figure exactly. */
const TILT = [0.85, 0.85, 0.95, 1, 1.05, 1.15, 1.2, 1.15, 1.05, 0.95, 0.9, 0.9];
const FLAT_ROWS = new Set([14, 15, 19, 23]);
export function monthsOf(figures) {
  return Object.fromEntries(LINE_ROWS.map(r => {
    const year = figures[r][2];
    const w = FLAT_ROWS.has(r) ? TILT.map(() => 1) : TILT;
    const months = w.slice(0, 11).map(x => Math.round(year * x / 12));
    months.push(year - months.reduce((a, v) => a + v, 0));
    return [r, months];
  }));
}
export const MONTHLY = monthsOf(FIGURES);
export const MONTH_COLS = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
export const FULL_YEAR_COL = 'O';
/** Month-end serials for January to December of a year. */
export const monthEndsOf = year => [31, year % 4 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31].map((d, m) => dateToSerial(year, m + 1, d));
/** Month-end serials for Jan–Dec 2026. */
export const MONTH_ENDS = monthEndsOf(2026);
/** The EBITDA margin change, first year to last, in basis points (the figure the CFO keeps on Inputs). */
export const bpsOf = f => Math.round(((f[7][2] + f[8][2] + f[9][2] - LINE_ROWS.filter(r => r >= 13).reduce((t, r) => t + f[r][2], 0)) / (f[7][2] + f[8][2] + f[9][2])
  - (f[7][0] + f[8][0] + f[9][0] - LINE_ROWS.filter(r => r >= 13).reduce((t, r) => t + f[r][0], 0)) / (f[7][0] + f[8][0] + f[9][0])) * 10000);
/** The two-digit fiscal year label: FY24 for 2024. */
export const fyOf = year => 'FY' + String(year).slice(2);
/** The source line the accounts carry: which years are audited and which is the budget. */
export const sourceOf = years => `Management accounts; ${fyOf(years[0])} and ${fyOf(years[1])} audited; ${fyOf(years[2])} per the September budget`;

/**
 * An export as the accounting system sends it: the company, its three fiscal years, the A/E flags,
 * the typed lines (costs positive, with the ledger's stray decimals), the memo counts, the last
 * year by month, and the as-of date. The chapter's own is EXPORT; the project's is EXPORT_NEXT; the
 * assessment's comes from sisterExport(rng).
 */
export const EXPORT = {
  company: 'Clearcoat Express', years: [2024, 2025, 2026], flags: FLAGS, figures: FIGURES, sites: SITES_FY, washes: WASHES_FY,
  months: MONTHLY, monthEnds: MONTH_ENDS, asOf: dateToSerial(2026, 9, 30),
};

/* ---------------- the raw sheets (S1raw, and the project's S8raw) ---------------- */

function pnlRawCells(ex = EXPORT) {
  const c = { A4: { value: 'ACCOUNT' }, B4: { value: 'DESCRIPTION' } };
  YEAR_COLS.forEach((col, i) => { c[col + '4'] = { value: 'FY' + ex.years[i] }; });
  for (const r in RAW_LINES) {
    const [code, label] = RAW_LINES[r];
    if (code) c['A' + r] = { value: code };
    c['B' + r] = { value: label };
  }
  YEAR_COLS.forEach((col, k) => {
    for (const r of LINE_ROWS) c[col + r] = { value: ex.figures[r][k] };
    const f = subtotalFormulas(col);
    for (const r in f) c[col + r] = { formula: f[r] };
    c[col + '33'] = { value: ex.sites[k] };
    c[col + '34'] = { value: ex.washes[k] };
    c[col + '35'] = { formula: PER_WASH_FORMULA(col) };
  });
  c.B38 = { value: 'Checks' };
  c.B39 = { value: CHECK_LABELS[0] }; c.C39 = { formula: CHECK_FORMULAS[0] };
  c.B40 = { value: CHECK_LABELS[1] }; c.C40 = { formula: CHECK_FORMULAS[1] };
  return c;
}

/** The Inputs sheet: what the CFO keeps (script-ch2.md), plus the figures the book quotes beside the P&L, and the three lines module 2.6 builds (17 to 19). */
export const INPUT_ROW = { company: 3, currency: 4, units: 5, firstYearEnd: 6, flags: [7, 8, 9], asOf: 10, source: 11, switch: 12, multiple: 13, bps: 14, revenueM: 15, perSiteK: 16, unitsLine: 17, nextUpdate: 18, headline: 19 };
export const MULTIPLE_TEXT = '12.0x', MULTIPLE = 12;
function inputsCells(ex = EXPORT) {
  const blue = (value, extra) => ({ value, fontColor: 'blue', ...(extra || {}) });
  const fy = ex.years.map((y, i) => fyOf(y) + ex.flags[i]);
  return {
    A1: { value: 'Inputs', bold: true },
    A3: { value: 'Company' }, B3: blue(ex.company),
    A4: { value: 'Currency' }, B4: blue('USD'),
    A5: { value: 'Units' }, B5: blue('thousands'),
    A6: { value: 'First fiscal year end' }, B6: blue(dateToSerial(ex.years[0], 12, 31), { fmtStyle: 'custom', numFmt: 'm/d/yyyy' }),
    A7: { value: fyOf(ex.years[0]) + ' flag' }, B7: blue(ex.flags[0]), A8: { value: fyOf(ex.years[1]) + ' flag' }, B8: blue(ex.flags[1]), A9: { value: fyOf(ex.years[2]) + ' flag' }, B9: blue(ex.flags[2]),
    A10: { value: 'As of' }, B10: blue(ex.asOf, { fmtStyle: 'custom', numFmt: 'm/d/yyyy' }),
    A11: { value: 'Source' }, B11: blue(sourceOf(ex.years)),
    A12: { value: 'Estimate column in the book (1 on, 0 off)' }, B12: blue(1),
    A13: { value: 'EV/EBITDA, illustrative' }, B13: blue(MULTIPLE_TEXT),   // typed as text with its x: no formula can use it (2.2.2 retypes it)
    A14: { value: `EBITDA margin change, ${fy[0]} to ${fy[2]} (bps)` }, B14: blue(bpsOf(ex.figures)),
    A15: { value: `Revenue, ${fy[2]}` }, B15: { formula: "='P&L'!E10", fontColor: 'green' },
    A16: { value: `Revenue per site, ${fy[2]}` }, B16: { formula: "='P&L'!E10/'P&L'!E33", fontColor: 'green' },
    A17: { value: 'Units line (every page reads it)' },
    A18: { value: 'Next update, three months on' },
    A19: { value: 'Headline for the book' },
  };
}

function monthlyCells(ex = EXPORT) {
  const c = { B4: { value: 'DESCRIPTION' }, [FULL_YEAR_COL + '4']: { value: 'FULL YEAR' } };
  MONTH_COLS.forEach((col, m) => { c[col + '4'] = { value: ex.monthEnds[m] }; });   // the export writes the month ends as bare serials
  for (const r in RAW_LINES) if (+r <= 24) c['B' + r] = { value: RAW_LINES[r][1] };
  MONTH_COLS.forEach((col, m) => {
    for (const r of LINE_ROWS) c[col + r] = { value: ex.months[r][m] };
    const f = subtotalFormulas(col);
    for (const r in f) c[col + r] = { formula: f[r] };
  });
  for (const r of [...LINE_ROWS, 10, 20, 22, 24]) c[FULL_YEAR_COL + r] = { formula: `=SUM(C${r}:N${r})` };
  return c;
}

function derive(base, fn) { const next = clone(base); fn(next); return next; }
export const sheetOf = (state, name) => state.sheets.find(s => s.name === name);
const cellsOf = (state, name) => { const sh = sheetOf(state, name); sh.cells = sh.cells || {}; return sh.cells; };
/** Merge fields into a cell (creating it), in the sparse authored shape. */
const put = (c, ref, fields) => { c[ref] = { ...(c[ref] || {}), ...fields }; for (const k in c[ref]) if (c[ref][k] === null || c[ref][k] === undefined) delete c[ref][k]; return c[ref]; };

/** A raw export as a workbook state: the P&L, Inputs, Monthly and an empty Print, the engine's settings as 1.1.4 left them. */
export function rawState(ex = EXPORT) {
  return {
    sheets: [
      { name: 'P&L', cells: pnlRawCells(ex), active: { r: 1, c: 1 } },
      { name: 'Inputs', cells: inputsCells(ex), colW: { 1: 290 } },
      { name: 'Monthly', cells: monthlyCells(ex) },
      { name: 'Print', cells: {} },
    ],
    settings: { calcMode: 'automatic', iterative: true, qat: ['save', 'undo', 'redo', 'fontColor', 'fillColor', 'borders', 'decDecimal'] },
  };
}
const S1raw = rawState(EXPORT);

/* ---------------- engine operations on a state ---------------- */

const CELL_KEYS = ['value', 'formula', 'bold', 'it', 'strike', 'fill', 'wrap', 'fmtStyle', 'decimals', 'bt', 'bb', 'bl', 'br', 'ball',
  'align', 'fontColor', 'uline', 'indent', 'scale', 'thick', 'fsz', 'bdbl', 'cmt', 'ca', 'numFmt'];
const ZERO_DEFAULT = new Set(['indent', 'scale', 'ca', 'decimals', 'fsz']);
/** A live cell record back to the sparse authored shape (what it means, nothing it defaults). */
function sparse(c) {
  const out = {};
  for (const k of CELL_KEYS) {
    const v = c[k];
    if (v === undefined || v === null || v === false) continue;
    if (ZERO_DEFAULT.has(k) && v === 0) continue;
    if (k === 'fmtStyle' && v === 'general') continue;
    out[k] = v;
  }
  if (out.formula) delete out.value;
  return Object.keys(out).length ? out : null;
}

/**
 * Run engine operations on one sheet of a state: `fn(S, ops)` gets a live Sheet built from the spec
 * and a few helpers in the words the lessons use; the cells and set widths it leaves are written
 * back in the authored shape.
 */
function viaEngine(state, name, fn) {
  const sh = sheetOf(state, name);
  const S = new Sheet({ cells: clone(sh.cells || {}), colW: sh.colW, rowH: sh.rowH, freeze: sh.freeze, gridlines: sh.gridlines });
  const at = ref => { const p = parseRef(ref); return [p.r, p.c]; };
  const ops = {
    type: (ref, text) => { const [r, c] = at(ref); S.commitInput(text, r, c); },
    fmt: (range, style, dec) => { S.select(range); S.setNumberFormat(style, dec); },
    code: (range, code) => { S.select(range); if (!S.setCustomFormat(code)) throw new Error(`clearcoat-pnl: the engine refuses ${code}`); },
    toggle: (range, prop) => { S.select(range); S.toggleAllOrNone(prop); },
    align: (range, a) => { S.select(range); S.setAlign(a); },
    multiply: (from, ranges) => { S.select(from); S.copy(); for (const rg of ranges) { S.select(rg); S.paste('values', 'multiply'); } },
    clear: range => { S.select(range); S.deleteContents(); },
  };
  fn(S, ops);
  const cells = {};
  for (const k in S.cells) { const c = sparse(S.cells[k]); if (c) cells[k] = c; }
  sh.cells = cells;
  const colW = {}; S.colW.forEach((w, c) => { if (c >= 1 && S.colSet[c]) colW[c] = w; });
  if (Object.keys(colW).length) sh.colW = colW; else delete sh.colW;
  const rowH = {}; S.rowH.forEach((h, r) => { if (r >= 1 && h !== ROWH_DEFAULT) rowH[r] = h; });
  if (Object.keys(rowH).length) sh.rowH = rowH; else delete sh.rowH;
  return state;
}

/* ---------------- the formats the chapter types ---------------- */

/**
 * The number-format codes module 2.2 types into the Custom box (Ctrl+1, U), as the box stores
 * them: a unit letter typed bare is quoted by the box (0.0x becomes 0.0"x"). TYPED is how a goal
 * line and a solution write each one.
 */
export const CODES = {
  plain: '#,##0_);(#,##0);-_)',
  dollar: '$#,##0_);($#,##0);-_)',
  pct: '0.0%_);(0.0%);-_)',
  millions: '#,##0.0,"m"',
  thousandsK: '#,##0"k"',
  multiple: '0.0"x"',
  bps: '0 "bps"',
  perWash: '$0.00" /wash"',
  fyActual: '"FY"yy"A"',
  fyEstimate: '"FY"yy"E"',
  month: 'mmm-yy',
  check: '0_);[Red](0);-_)',
  washes: '[<1000]0;#,##0',
  hide: ';;;',
  onOff: '"On";;"Off"',
};
export const TYPED = {
  plain: CODES.plain, dollar: CODES.dollar, pct: CODES.pct, millions: '#,##0.0,"m"', thousandsK: '#,##0k', multiple: '0.0x', bps: '0 bps',
  perWash: '$0.00" /wash"', fyActual: '"FY"yy"A"', fyEstimate: '"FY"yy"E"', check: CODES.check, washes: CODES.washes, hide: CODES.hide, onOff: 'On;;Off',
};
export const UNITS_LINE = 'USD thousands unless stated; costs shown as negatives';
export const YEAR_LABEL = 'Fiscal year ending';
export const TITLE = 'Clearcoat Express - Historical Financials';

/* ---------------- module 2.1 · Number formats ---------------- */

/** 2.1.1 Built-in formats: the desk number format on every dollar line, the counts plain, revenue per wash to the cent. */
function builtinFormats(s) {
  viaEngine(s, 'P&L', (S, o) => {
    for (const rg of DOLLAR_BLOCKS) o.fmt(rg, 'comma', 0);
    o.fmt('C33:E34', 'comma', 0);
    o.code('C35:E35', '#,##0.00');   // Ctrl+Shift+1, Excel’s Number shortcut
  });
}
/** 2.1.2 Sign convention: costs negative (multiplied by a -1 beside them), the subtotals adding, the convention stated once. */
function signConvention(s) {
  viaEngine(s, 'P&L', (S, o) => {
    o.type(SPARE_CELL, '-1');
    o.multiply(SPARE_CELL, ['C13:E19', 'C23:E23']);
    o.type('C22', '=C10+C20'); S.select('C22:E22'); S.fill('right');
    o.type('C24', '=C22+C23'); S.select('C24:E24'); S.fill('right');
    o.clear(SPARE_CELL);
    o.type('A2', UNITS_LINE); o.toggle('A2', 'it');
  });
}
/** 2.1.3 Currency and percent lines: the margins and growth block, percent to one decimal in italic, the $ on the first and total rows, revenue per wash in dollars and cents. */
function currencyPercentLines(s) {
  viaEngine(s, 'P&L', (S, o) => {
    o.type('B26', MARGIN_HEAD);
    MARGIN_LABELS.forEach((t, i) => o.type('B' + (27 + i), t));
    for (const r of [27, 28, 29]) { o.type('C' + r, marginFormulas('C')[r]); S.select(`C${r}:E${r}`); S.fill('right'); }
    o.type('D30', marginFormulas('D')[30]); S.select('D30:E30'); S.fill('right');
    o.type(CAGR_LABEL_CELL, 'CAGR'); o.type(CAGR_CELL, CAGR_FORMULA);
    o.fmt('C27:F30', 'percent', 0); S.changeDecimals(1); o.toggle('C27:F30', 'it');   // Ctrl+Shift+5, Alt H 0, Ctrl+I
    for (const r of DOLLAR_ROWS) o.fmt(`C${r}:E${r}`, 'currency', 0);
    o.fmt('C35:E35', 'currency', 2);
  });
}
/** 2.1.4 Dates on the timeline: real year ends in C4:E4 shown as dates, the row labeled and bold, the A/E flags under it. */
function datesOnTheTimeline(s) {
  viaEngine(s, 'P&L', (S, o) => {
    YEAR_COLS.forEach((col, i) => o.type(col + '4', YEAR_END_TEXT[i]));
    o.fmt('C4:E4', 'date', 0);
    o.type('B4', YEAR_LABEL); o.align('B4', 'r');
    YEAR_COLS.forEach((col, i) => o.type(col + '5', FLAGS[i]));
    o.align('C5:E5', 'r'); o.toggle('C5:E5', 'it');
    S.select('A4'); S.selectRow(); S.toggleAllOrNone('bold');
  });
}

/* ---------------- module 2.2 · Custom number formats ---------------- */

/** 2.2.1 The four-section code: plain on the P&L lines and the memo counts, the $ code on the first and total rows, the percent code on the margins. */
function fourSections(s) {
  viaEngine(s, 'P&L', (S, o) => {
    o.code('C7:E24', CODES.plain);
    o.code('C33:E34', CODES.plain);
    for (const r of DOLLAR_ROWS) o.code(`C${r}:E${r}`, CODES.dollar);
    o.code('C27:F30', CODES.pct);
  });
}
/** 2.2.2 Units in the format: millions and k beside the P&L on Inputs, the multiple retyped as a number with its x in the code, bps, revenue per wash with its unit. */
function unitsInTheFormat(s) {
  viaEngine(s, 'Inputs', (S, o) => {
    o.type('B13', String(MULTIPLE));
    o.code('B13', TYPED.multiple);
    o.code('B14', TYPED.bps);
    o.code('B15', TYPED.millions);
    o.code('B16', TYPED.thousandsK);
  });
  viaEngine(s, 'P&L', (S, o) => { o.code('C35:E35', TYPED.perWash); });
}
/** 2.2.3 Custom date codes: the timeline reads FY24A to FY26E from its dates; Monthly's month ends read Jan-26 and its header row sits right. */
function customDateCodes(s) {
  viaEngine(s, 'P&L', (S, o) => {
    o.code('C4:E4', '"FY"yy');
    o.code('C4:D4', TYPED.fyActual);
    o.code('E4', TYPED.fyEstimate);
  });
  viaEngine(s, 'Monthly', (S, o) => {
    o.fmt('C4:O4', 'date', 0);
    o.align('C4:O4', 'r');
  });
}
/** 2.2.4 Conditional codes and hidden zeros: the checks paint a negative red, the washes scale by size, the flags hidden and shown again, the switch reads On. */
function conditionalCodes(s) {
  viaEngine(s, 'P&L', (S, o) => {
    o.code('C39:C40', CODES.check);
    o.code('C34:E34', CODES.washes);
    o.code('C5:E5', CODES.hide);
    o.fmt('C5:E5', 'general', 0);
  });
  viaEngine(s, 'Inputs', (S, o) => { o.code('B12', TYPED.onOff); });
}

/* ---------------- the finished pages (M86): what the chapter builds toward ---------------- */

/** The section headers the page carries, and the rows that take an indent or a total's weight. */
export const SECTION_HEADS = { 6: 'Revenue', 12: 'Site costs', 26: MARGIN_HEAD, 32: 'Memo' };
export const TOTAL_ROWS = [10, 20, 22, 24];
export const INDENT_ROWS = [...REVENUE_ROWS, ...SITE_COST_ROWS];
/** Other revenue carries the page's one footnote marker (2.3.4). */
export const LABEL_NOTE = 'Other revenue (1)';
export const FOOTNOTE = '(1) Detailing and vending';
export const sourceLineOf = years => 'Source: ' + sourceOf(years).charAt(0).toLowerCase() + sourceOf(years).slice(1);
export const SOURCE_LINE = sourceLineOf(EXPORT.years);
/** The A/E divider's shade (2.3.2): the header swatch, the one fill a page carries besides the input tint. */
export const DIVIDER_FILL = 'gray';
/** The widths 2.3.5 sets: a two-character margin, twelve characters per period column, the title row at 24 points. */
export const MARGIN_CHARS = 2, PERIOD_CHARS = 12, TITLE_ROW_PTS = 24;
export const MARGIN_W = MARGIN_CHARS * 7 + 5, TITLE_ROW_H = Math.round(TITLE_ROW_PTS * 4 / 3);
/** The dynamic titles module 2.6 builds, one per page, from the company name on Inputs. */
export const TITLE_FORMULAS = { 'P&L': '=Inputs!B3&" - Historical Financials"', Monthly: fy => `=Inputs!B3&" - ${fy} by month"`, Print: '=Inputs!B3&" - Summary financials"' };
export const UNITS_FORMULA = '=Inputs!B17';
export const UNITS_LINE_FORMULA = '=B4&" "&B5&" unless stated; costs shown as negatives"';
export const NEXT_UPDATE_FORMULA = '=EDATE(B10,3)';
export const headlineFormula = fy => `="Revenue of "&TEXT('P&L'!E10,"#,##0")&"k in ${fy}"`;
/** The P&L's timeline once 2.6.2 chains it: the first year end from Inputs, the rest twelve months on. */
export const TIMELINE_FORMULAS = { C4: '=Inputs!B6', D4: '=EOMONTH(C4,12)', E4: '=EOMONTH(D4,12)' };
export const MONTH_LABEL_FORMULA = col => `=TEXT(${col}4,"mmmm yyyy")`;
export const MONTH_END_FORMULA = prev => `=EOMONTH(${prev}4,1)`;
/** Print's header block (2.6.1, 2.6.3): the book's FY labels from the P&L's dates and flags, the period line over the labels. */
export const PRINT_HEADER_FORMULA = col => `="FY"&TEXT('P&L'!${col}4,"yy")&'P&L'!${col}5`;
export const PERIOD_LINE_FORMULA = `="Fiscal years "&TEXT('P&L'!C4,"yyyy")&" to "&TEXT('P&L'!E4,"yyyy")`;
/** Print, the one-page summary (2.7.3): six lines linked to the P&L, its source and its check. */
export const PRINT = { rev: 5, contrib: 6, ebitda: 7, margin: 8, sites: 9, washes: 10, source: 11, checksHead: 13, check: 14 };
export const PRINT_LINES = [[5, 'Revenue', 10], [6, 'Site contribution', 22], [7, 'EBITDA', 24], [8, 'EBITDA margin', 29], [9, LABELS[33], 33], [10, LABELS[34], 34]];
export const PRINT_CHECK = ['Last year EBITDA less the P&L', "=E7-'P&L'!E24"];
/** Monthly's foot: its source and two checks against the P&L (the planting 2.3.6 arrives with). */
export const MONTHLY_ROW = { source: 31, checksHead: 33, checkRevenue: 34, checkEbitda: 35 };
export const MONTHLY_CHECKS = [['Full year revenue less the P&L', "=O10-'P&L'!E10"], ['Full year EBITDA less the P&L', "=O24-'P&L'!E24"]];
export const monthlySourceOf = fy => `Source: ${fy} budget by month, September`;
/** The slow-month rule (2.5.1): a month's revenue under about nine tenths of the average month, to the hundred. */
export const slowMonthThreshold = ex => Math.round((ex.figures[7][2] + ex.figures[8][2] + ex.figures[9][2]) / 12 * 0.92 / 100) * 100;
/** The conditional formats the chapter leaves on the P&L (2.5.4: two, the checks rule first with Stop If True) and on Monthly. */
export const CF_CHECKS = { kind: 'formula', range: 'C39:C40', formula: '=C39<>0', style: 'lightred', stopIfTrue: true };
export const CF_NEG_MARGIN = range => ({ kind: 'cellValue', op: '<', v1: 0, range, style: 'redtext' });
export const CF_ROW_FLAG = { kind: 'formula', range: 'B7:E9', formula: '=$A7="x"', style: 'yellow' };
export const CF_SLOW_MONTH = threshold => ({ kind: 'cellValue', op: '<', v1: threshold, range: 'C10:N10', style: 'yellow' });
/** The pack's print set-up (2.7.1), one Page Setup for the workbook: landscape, one page wide, the header rows repeated, the footer on every sheet, centred on the page. */
export const CH2_PAGE_SETUP = { orientation: 'landscape', scaling: 'fit', adjustTo: 100, fitWide: 1, fitTall: 2, titlesRows: '$1:$5', footer: { left: '&[File]', centre: 'Page &[Page] of &[Pages]', right: '&[Date]' }, printGridlines: false, centerH: true };
/** The navigation column (2.4.4): a header and the three named blocks, in column Q. */
export const NAV = { col: 'Q', head: 4, items: [['Revenue', 'Rev'], ['Site costs', 'SiteCosts'], ['EBITDA', 'EBITDA']] };

/** PROPER(TRIM(SUBSTITUTE(SUBSTITUTE(x,"_"," "),"(1)",""))) as 2.6.4 writes it, with EBITDA retyped by hand. */
export function cleanLabel(dirty) {
  const t = String(dirty).replace(/_/g, ' ').replace(/\(1\)/g, '').replace(/ +/g, ' ').replace(/^ | $/g, '');
  if (t.toUpperCase() === 'EBITDA') return 'EBITDA';
  return t.toLowerCase().replace(/(^|[^A-Za-z])([a-z])/g, (m, a, b) => a + b.toUpperCase());
}
/** The labels the clusters' system exports (capitals, underscores, doubled spaces, a footnote marker), by P&L row. */
export const DIRTY_LABELS = {
  7: 'RETAIL_WASH  REVENUE', 8: 'MEMBERSHIP_REVENUE', 9: 'OTHER  REVENUE (1)', 10: 'TOTAL REVENUE',
  13: 'CHEMICALS_AND_WATER', 14: 'LABOR', 15: 'RENT', 16: 'UTILITIES', 17: 'MAINTENANCE', 18: 'CARD_FEES', 19: 'MARKETING', 20: 'TOTAL SITE COSTS',
  22: 'SITE_CONTRIBUTION', 23: 'HEAD_OFFICE', 24: 'EBITDA',
};
/** The four Texas clusters and their site counts (40 in all): the split Monthly detail carries. */
export const DETAIL_CLUSTERS = [['Austin', 10], ['San Antonio', 9], ['Houston', 12], ['Dallas-Fort Worth', 9]];

/**
 * What an export holds, read back from a state (the raw export, or the chain at the end of 2.2):
 * the company, the years and flags, the typed lines as positives, the memo counts, the months.
 */
export function readExport(state) {
  const pl = sheetOf(state, 'P&L').cells, inp = sheetOf(state, 'Inputs').cells, mon = sheetOf(state, 'Monthly').cells;
  const num = c => (c && typeof c.value === 'number' ? c.value : NaN);
  const years = YEAR_COLS.map(col => { const c = pl[col + '4']; if (typeof c.value === 'number') return serialToDate(c.value).getUTCFullYear(); return +(/(\d{4})/.exec(String(c.value)) || [])[1]; });
  return {
    company: inp.B3.value, years, flags: [7, 8, 9].map(r => inp['B' + r].value),
    figures: Object.fromEntries(LINE_ROWS.map(r => [r, YEAR_COLS.map(col => Math.abs(num(pl[col + r])))])),
    sites: YEAR_COLS.map(col => num(pl[col + '33'])), washes: YEAR_COLS.map(col => num(pl[col + '34'])),
    months: Object.fromEntries(LINE_ROWS.map(r => [r, MONTH_COLS.map(col => Math.abs(num(mon[col + r])))])),
    monthEnds: MONTH_COLS.map(col => num(mon[col + '4'])), asOf: num(inp.B10),
  };
}
const fyLabels = ex => ex.years.map((y, i) => fyOf(y) + ex.flags[i]);
const money = (r, extra = {}) => ({ fmtStyle: 'custom', numFmt: DOLLAR_ROWS.includes(r) ? CODES.dollar : CODES.plain, decimals: null, ...extra });
const pct = { it: true, fmtStyle: 'custom', decimals: 1, numFmt: CODES.pct };
const widthsOf = (sheet, lastLabelRow) => { const fit = new Sheet({ cells: clone(sheet.cells), colW: sheet.colW }); return fit.neededWidth(2, 4, lastLabelRow); };
const FIG_COLS = [...MONTH_COLS, FULL_YEAR_COL];

/** The finished P&L (screenplay 5; script-ch2.md "The workbook", end state), to the lesson chain's exact cell shapes. */
export function solvedPnl(ex, residueFrom = null) {
  const yv = r => YEAR_COLS.map((col, k) => (COST_ROWS.includes(r) ? -ex.figures[r][k] : ex.figures[r][k]));
  const line = (r, extra = {}) => ({ key: 'r' + r, label: r === 9 ? LABEL_NOTE : LABELS[r], values: yv(r), dollar: false, ...extra });
  const sub = (r, extra = {}) => ({ key: 'r' + r, label: LABELS[r], values: YEAR_COLS.map(col => subtotalFormulas(col, { signed: true })[r]), total: true, dollar: false, ...extra });
  const margin = r => ({ key: 'r' + r, label: LABELS[r], kind: 'pct', values: [...YEAR_COLS.map(col => marginFormulas(col)[r] || null), r === 29 ? 'CAGR' : r === 30 ? CAGR_FORMULA : null] });
  const page = buildPage({
    name: 'P&L', chapter: CHAPTER, read: true, center: true,
    title: `${ex.company} - Historical Financials`, units: UNITS_LINE, labelHeader: YEAR_LABEL,
    headers: ex.years.map(y => dateToSerial(y, 12, 31)),
    blocks: [
      { rows: [
        { key: 'flags', label: null, kind: 'text', values: ex.flags, dollar: false },
        { key: 'revHead', label: SECTION_HEADS[6], values: [], dollar: false },
        line(7, { indent: 1, dollar: true }), line(8, { indent: 1 }), line(9, { indent: 1 }),
        sub(10, { dollar: true }),
      ] },
      { title: SECTION_HEADS[12], rows: [...SITE_COST_ROWS.map(r => line(r, { indent: 1 })), sub(20)] },
      { rows: [sub(22), line(23), sub(24, { final: true, dollar: true })] },
      { title: MARGIN_HEAD, rows: [margin(27), margin(28), margin(29), margin(30)] },
      { title: SECTION_HEADS[32], rows: [
        { key: 'r33', label: LABELS[33], kind: 'count', values: ex.sites },
        { key: 'r34', label: LABELS[34], kind: 'count', values: ex.washes },
        { key: 'r35', label: LABELS[35], kind: 'unit', dollar: true, values: YEAR_COLS.map(PER_WASH_FORMULA) },
      ] },
    ],
    source: sourceLineOf(ex.years),
    checks: CHECK_LABELS.map((label, i) => ({ label, formula: CHECK_FORMULAS[i] })),
  });
  const want = { flags: ROW.flags, revHead: ROW.revHead, r7: 7, r10: 10, r13: 13, r20: 20, r22: 22, r24: 24, r27: 27, r30: 30, r33: 33, r35: 35 };
  for (const k in want) if (page.at[k] !== want[k]) throw new Error(`clearcoat-pnl: the page puts ${k} on row ${page.at[k]}, the lessons expect ${want[k]}`);
  if (page.std.checksRow !== ROW.checksHead) throw new Error(`clearcoat-pnl: the checks block sits on row ${page.std.checksRow}`);
  const sh = page.sheet, c = sh.cells;
  c.A1 = { formula: TITLE_FORMULAS['P&L'], bold: true, fsz: TITLE_FSZ, ca: 5 };
  c.A2 = { formula: UNITS_FORMULA, it: true };
  put(c, 'B4', { align: 'r' });
  YEAR_COLS.forEach((col, i) => {
    c[col + '4'] = { formula: TIMELINE_FORMULAS[col + '4'], bold: true, fmtStyle: 'custom', numFmt: ex.flags[i] === 'A' ? CODES.fyActual : CODES.fyEstimate, ...(i === 0 ? { fontColor: 'green' } : {}) };
    put(c, col + '5', { it: true, align: 'r' });
  });
  put(c, 'B6', { bold: true });
  for (const r of [...LINE_ROWS, ...TOTAL_ROWS, 11, 12, 21]) for (const col of YEAR_COLS) put(c, col + r, money(r));   // the empty rows inside C7:E24 carry the code too (2.2.1 set it on the block)
  for (const col of [...YEAR_COLS, 'F']) for (const r of PCT_ROWS) put(c, col + r, pct);   // the dash cell C30 and F27:F28 carry the format with nothing in them, as 2.1.3's selection left them
  for (const col of YEAR_COLS) { put(c, col + '33', { fmtStyle: 'custom', numFmt: CODES.plain, decimals: null }); put(c, col + '34', { fmtStyle: 'custom', numFmt: CODES.washes, decimals: null }); put(c, col + '35', { fmtStyle: 'custom', numFmt: CODES.perWash, decimals: 2 }); }
  for (const r of [ROW.checkRevenue, ROW.checkMonthly]) put(c, 'C' + r, { fmtStyle: 'custom', numFmt: CODES.check, decimals: null });
  for (let r = 4; r <= 35; r++) put(c, 'D' + r, { br: true });          // the A/E divider (2.3.2)
  for (const r of [4, 5]) put(c, 'E' + r, { fill: DIVIDER_FILL });
  c.B37 = { value: FOOTNOTE, it: true };
  sh.colW = { 1: MARGIN_W, 2: widthsOf(sh, 35), 3: FIGURE_W, 4: FIGURE_W, 5: FIGURE_W };
  sh.rowH = { 1: TITLE_ROW_H };
  sh.groups = { rows: [{ r1: 13, r2: 19, collapsed: false }, { r1: 26, r2: 30, collapsed: false }, { r1: 33, r2: 35, collapsed: false }] };
  sh.condFmt = [CF_CHECKS, CF_NEG_MARGIN('C27:E30')];
  if (residueFrom) for (const k in residueFrom.cells) { const p = parseRef(k); if (!c[k] && (p.c >= 7 || (p.c === 6 && p.r !== 29 && p.r !== 30))) c[k] = clone(residueFrom.cells[k]); }
  return sh;
}

/** The finished Monthly page: the last year by month, the P&L's sibling, its months chained from one typed date. */
export function solvedMonthly(ex, { nav = false } = {}) {
  const fy = fyLabels(ex);
  const mv = r => MONTH_COLS.map((col, m) => (COST_ROWS.includes(r) ? -ex.months[r][m] : ex.months[r][m]));
  const line = (r, extra = {}) => ({ key: 'r' + r, label: LABELS[r], values: [...mv(r), `=SUM(C${r}:N${r})`], dollar: false, ...extra });
  const sub = (r, extra = {}) => ({ key: 'r' + r, label: LABELS[r], values: [...MONTH_COLS.map(col => subtotalFormulas(col, { signed: true })[r]), `=SUM(C${r}:N${r})`], total: true, dollar: false, ...extra });
  const margin = r => ({ key: 'r' + r, label: LABELS[r], kind: 'pct', values: [...MONTH_COLS.map(col => marginFormulas(col)[r] || null), r === 30 ? null : marginFormulas(FULL_YEAR_COL)[r]] });
  const page = buildPage({
    name: 'Monthly', chapter: CHAPTER, read: true, center: true,
    title: `${ex.company} - ${fyOf(ex.years[2])} by month`, units: UNITS_LINE, labelHeader: 'Month ending',
    headers: [...ex.monthEnds, 'Full year'],
    blocks: [
      { rows: [
        { key: 'months', label: null, kind: 'text', values: [...MONTH_COLS.map(MONTH_LABEL_FORMULA), null], dollar: false },
        { key: 'revHead', label: SECTION_HEADS[6], values: [], dollar: false },
        line(7, { indent: 1, dollar: true }), line(8, { indent: 1 }), line(9, { indent: 1 }),
        sub(10, { dollar: true }),
      ] },
      { title: SECTION_HEADS[12], rows: [...SITE_COST_ROWS.map(r => line(r, { indent: 1 })), sub(20)] },
      { rows: [sub(22), line(23), sub(24, { final: true, dollar: true })] },
      { title: MARGIN_HEAD, rows: [margin(27), margin(28), margin(29), margin(30)] },
    ],
    source: monthlySourceOf(fy[2]),
    checks: MONTHLY_CHECKS.map(([label, formula]) => ({ label, formula })),
  });
  for (const [k, r] of Object.entries({ months: 5, revHead: 6, r7: 7, r24: 24, r30: 30 })) if (page.at[k] !== r) throw new Error(`clearcoat-pnl: Monthly puts ${k} on row ${page.at[k]}`);
  if (page.std.checksRow !== MONTHLY_ROW.checksHead) throw new Error(`clearcoat-pnl: Monthly's checks block sits on row ${page.std.checksRow}`);
  const sh = page.sheet, c = sh.cells;
  c.A1 = { formula: TITLE_FORMULAS.Monthly(fyOf(ex.years[2])), bold: true, fsz: TITLE_FSZ, ca: 15 };
  c.A2 = { formula: UNITS_FORMULA, it: true };
  c.C4 = { value: ex.monthEnds[0], bold: true, align: 'r', fmtStyle: 'date', fontColor: 'blue', fill: DIVIDER_FILL };
  MONTH_COLS.slice(1).forEach((col, i) => { c[col + '4'] = { formula: MONTH_END_FORMULA(MONTH_COLS[i]), bold: true, align: 'r', fmtStyle: 'date', fill: DIVIDER_FILL }; });
  c[FULL_YEAR_COL + '4'] = { value: 'Full year', bold: true, align: 'r', wrap: true, fmtStyle: 'date' };   // the date format is 2.2.3's, set on the whole header row
  for (const col of MONTH_COLS) put(c, col + '5', { it: true, align: 'r' });
  put(c, 'B6', { bold: true });
  for (const r of [...LINE_ROWS, ...TOTAL_ROWS, 11, 12, 21]) for (const col of FIG_COLS) put(c, col + r, money(r));   // the tiled paste formats the empty rows too
  for (const col of FIG_COLS) for (const r of PCT_ROWS) put(c, col + r, pct);   // C30 and O30 formatted and empty, as the tiled paste leaves them
  for (const r of [MONTHLY_ROW.checkRevenue, MONTHLY_ROW.checkEbitda]) put(c, 'C' + r, { fmtStyle: 'custom', numFmt: CODES.check, decimals: null });
  sh.colW = { 1: MARGIN_W, 2: widthsOf(sh, 30) };
  FIG_COLS.forEach((col, i) => { sh.colW[3 + i] = FIGURE_W; });
  sh.rowH = {};
  sh.condFmt = [CF_SLOW_MONTH(slowMonthThreshold(ex))];
  if (nav) navColumn(c);
  return sh;
}
/** The navigation column: a header and the three entries that name the blocks (2.4.4). */
function navColumn(c) {
  c[NAV.col + NAV.head] = { value: 'Go to', bold: true };
  NAV.items.forEach(([label], i) => { c[NAV.col + (NAV.head + 1 + i)] = { value: label }; });
}
/** The defined names behind the navigation column, on the sheet that holds the blocks. */
export function namesOn(sheetName, rows) {
  const q = /[^A-Za-z0-9_]/.test(sheetName) ? `'${sheetName}'` : sheetName;
  return Object.fromEntries(NAV.items.map(([, name], i) => [name, `${q}!$B$${rows[i]}:$O$${rows[i]}`]).sort((a, b) => a[0].localeCompare(b[0])));   // in the Name Box's order, as a session reads them back
}

/** The finished Print page: six lines, three years, every figure a link to the P&L, the header block built from its dates. */
export function solvedPrint(ex) {
  const fy = fyLabels(ex);
  const kinds = { 8: 'pct', 9: 'count', 10: 'count' };
  const page = buildPage({
    name: 'Print', chapter: CHAPTER, read: true, center: true,
    title: `${ex.company} - Summary financials`, units: UNITS_LINE, labelHeader: 'Fiscal years', headers: fy,
    blocks: [{ rows: PRINT_LINES.map(([r, label, src]) => ({ key: 'p' + r, label, kind: kinds[r] || 'money', dollar: r === 5 || r === 7, values: YEAR_COLS.map(col => `='P&L'!${col}${src}`) })) }],
    source: 'Source: the P&L sheet',
    checks: [{ label: PRINT_CHECK[0], formula: PRINT_CHECK[1] }],
  });
  if (page.at.p5 !== PRINT.rev || page.std.checksRow !== PRINT.checksHead) throw new Error('clearcoat-pnl: Print is not laid out where 2.7.3 expects');
  const sh = page.sheet, c = sh.cells;
  c.A1 = { formula: TITLE_FORMULAS.Print, bold: true, fsz: TITLE_FSZ, ca: 5 };
  c.A2 = { formula: UNITS_FORMULA, it: true };
  c.B4 = { formula: PERIOD_LINE_FORMULA, bold: true, fontColor: 'green' };
  for (const col of YEAR_COLS) c[col + '4'] = { formula: PRINT_HEADER_FORMULA(col), bold: true, align: 'r', fontColor: 'green' };
  for (const col of YEAR_COLS) {
    put(c, col + PRINT.rev, money(7)); put(c, col + PRINT.contrib, money(22)); put(c, col + PRINT.ebitda, money(24));
    put(c, col + PRINT.margin, pct); put(c, col + PRINT.sites, { fmtStyle: 'custom', numFmt: CODES.plain, decimals: null }); put(c, col + PRINT.washes, { fmtStyle: 'custom', numFmt: CODES.washes, decimals: null });
  }
  for (let r = 4; r <= PRINT.washes; r++) put(c, 'D' + r, { br: true });
  put(c, 'E4', { fill: DIVIDER_FILL });
  put(c, 'C' + PRINT.check, { fmtStyle: 'custom', numFmt: CODES.check, decimals: null });
  sh.colW = { 1: MARGIN_W, 2: widthsOf(sh, PRINT.washes), 3: FIGURE_W, 4: FIGURE_W, 5: FIGURE_W };
  sh.rowH = {};
  return sh;
}

/**
 * Monthly detail, the working sheet: the last year by month, by cluster (four blocks that sum to
 * Monthly), a company block under them, the source and two checks. `clean` gives the labels as
 * 2.6.4 leaves them (Title Case from PROPER); otherwise as the clusters' system exports them.
 */
export const DETAIL = (() => {
  const top = 5, per = 15;   // a cluster block: its title, thirteen lines, one empty row
  const clusters = DETAIL_CLUSTERS.map(([name, sites], k) => ({ name, sites, head: top + k * per, rev: top + k * per + 4, costs: top + k * per + 12, contrib: top + k * per + 13 }));
  const company = top + clusters.length * per;
  return { clusters, company, rev: company + 1, costs: company + 2, contrib: company + 3, headOffice: company + 4, ebitda: company + 5, source: company + 6, checksHead: company + 8, checkRevenue: company + 9, checkEbitda: company + 10, strayTop: 41 };
})();
export const DETAIL_NAMES = namesOn('Monthly detail', [DETAIL.rev, DETAIL.costs, DETAIL.ebitda]);
export function solvedDetail(ex, { clean = true, nav = true } = {}) {
  const totalSites = DETAIL_CLUSTERS.reduce((t, [, n]) => t + n, 0);
  const split = (r, m) => {   // a line's month across the clusters, whole thousands, the last cluster taking the remainder
    const v = ex.months[r][m]; const parts = DETAIL_CLUSTERS.slice(0, -1).map(([, n]) => Math.round(v * n / totalSites));
    parts.push(v - parts.reduce((a, x) => a + x, 0));
    return parts.map(x => (COST_ROWS.includes(r) ? -x : x));
  };
  const label = r => DIRTY_LABELS[r];   // built dirty (the widths fit the labels as the system sends them); cleaned at the end when asked
  const head = t => t.toUpperCase();
  const blocks = DETAIL_CLUSTERS.map(([name], k) => ({
    title: head(name),
    rows: [
      ...REVENUE_ROWS.map(r => ({ key: `${k}r${r}`, label: label(r), indent: 1, dollar: r === 7, values: [...MONTH_COLS.map((col, m) => split(r, m)[k]), null] })),
      { key: `${k}r10`, label: label(10), total: true, dollar: true, fill: (col, rr, at) => (col === FULL_YEAR_COL ? `=SUM(C${rr}:N${rr})` : `=SUM(${col}${at(`${k}r7`)}:${col}${at(`${k}r9`)})`) },
      ...SITE_COST_ROWS.map(r => ({ key: `${k}r${r}`, label: label(r), indent: 1, dollar: false, values: [...MONTH_COLS.map((col, m) => split(r, m)[k]), null] })),
      { key: `${k}r20`, label: label(20), total: true, dollar: false, fill: (col, rr, at) => (col === FULL_YEAR_COL ? `=SUM(C${rr}:N${rr})` : `=SUM(${col}${at(`${k}r13`)}:${col}${at(`${k}r19`)})`) },
      { key: `${k}r22`, label: label(22), total: true, dollar: false, fill: (col, rr, at) => (col === FULL_YEAR_COL ? `=SUM(C${rr}:N${rr})` : `=${col}${at(`${k}r10`)}+${col}${at(`${k}r20`)}`) },
    ],
  }));
  const sumClusters = key => (col, rr, at) => (col === FULL_YEAR_COL ? `=SUM(C${rr}:N${rr})` : '=' + DETAIL_CLUSTERS.map((x, k) => `${col}${at(`${k}${key}`)}`).join('+'));
  blocks.push({
    title: head('Company'),
    rows: [
      { key: 'coRev', label: label(10), total: true, dollar: true, fill: sumClusters('r10') },
      { key: 'coCosts', label: label(20), total: true, dollar: false, fill: sumClusters('r20') },
      { key: 'coContrib', label: label(22), total: true, dollar: false, fill: (col, rr, at) => (col === FULL_YEAR_COL ? `=SUM(C${rr}:N${rr})` : `=${col}${at('coRev')}+${col}${at('coCosts')}`) },
      { key: 'coHead', label: label(23), dollar: false, values: [...MONTH_COLS.map((col, m) => -ex.months[23][m]), null] },
      { key: 'coEbitda', label: label(24), total: true, final: true, dollar: true, fill: (col, rr, at) => (col === FULL_YEAR_COL ? `=SUM(C${rr}:N${rr})` : `=${col}${at('coContrib')}+${col}${at('coHead')}`) },
    ],
  });
  // the full-year column on the typed lines
  for (const b of blocks) for (const row of b.rows) if (row.values) row.fill = (col, rr) => (col === FULL_YEAR_COL ? `=SUM(C${rr}:N${rr})` : row.values[FIG_COLS.indexOf(col)]);
  const page = buildPage({
    name: 'Monthly detail', chapter: CHAPTER, read: false, center: false,
    title: `${ex.company} - ${fyOf(ex.years[2])} by month by cluster`, units: UNITS_LINE, labelHeader: 'Month ending',
    headers: [...ex.monthEnds, 'Full year'],
    blocks,
    source: `Source: cluster ledgers, ${fyOf(ex.years[2])} budget by month`,
    checks: [{ label: 'Revenue less Monthly', formula: (col, rr, at) => `=O${at('coRev')}-Monthly!O10` }, { label: 'EBITDA less Monthly', formula: (col, rr, at) => `=O${at('coEbitda')}-Monthly!O24` }],
  });
  for (const [k, r] of Object.entries({ '0r7': DETAIL.clusters[0].head + 1, '0r10': DETAIL.clusters[0].rev, '3r22': DETAIL.clusters[3].contrib, coRev: DETAIL.rev, coEbitda: DETAIL.ebitda })) if (page.at[k] !== r) throw new Error(`clearcoat-pnl: Monthly detail puts ${k} on row ${page.at[k]}, DETAIL says ${r}`);
  if (page.std.checksRow !== DETAIL.checksHead) throw new Error(`clearcoat-pnl: Monthly detail's checks sit on row ${page.std.checksRow}`);
  const sh = page.sheet, c = sh.cells;
  for (const col of MONTH_COLS) put(c, col + '4', { fmtStyle: 'date' });
  for (const k in c) {
    const p = parseRef(k); if (p.r < 5 || p.c < 3 || p.c > 15) continue;
    const cell = c[k];
    if (cell.fmtStyle === 'comma' || cell.fmtStyle === 'currency' || (cell.fmtStyle === 'custom' && /#,##0/.test(cell.numFmt || ''))) put(c, k, { fmtStyle: 'custom', numFmt: cell.fmtStyle === 'currency' || /\$/.test(cell.numFmt || '') ? CODES.dollar : CODES.plain, decimals: null });
  }
  for (const r of [DETAIL.checkRevenue, DETAIL.checkEbitda]) put(c, 'C' + r, { fmtStyle: 'custom', numFmt: CODES.check, decimals: null });
  if (nav) navColumn(c);
  sh.rowH = {};
  sh.condFmt = [{ kind: 'dataBar', range: `C${DETAIL.rev}:N${DETAIL.rev}`, color: 'blue' }];
  if (clean) for (const k in c) { const p = parseRef(k); if (p.c === 2 && p.r >= 5 && typeof c[k].value === 'string' && p.r <= DETAIL.ebitda) c[k].value = cleanLabel(c[k].value); }
  return sh;
}

/** Inputs at the end of the chapter: module 2.2's codes and module 2.6's three lines over whatever the sheet holds. */
export function finishInputs(c, fyLast) {
  put(c, 'B12', { value: 1, fmtStyle: 'custom', fontColor: 'blue', numFmt: CODES.onOff });
  c.B13 = { value: MULTIPLE, fmtStyle: 'custom', decimals: 1, fontColor: 'blue', numFmt: CODES.multiple };
  put(c, 'B14', { fmtStyle: 'custom', numFmt: CODES.bps });
  put(c, 'B15', { fmtStyle: 'custom', decimals: 1, numFmt: CODES.millions });
  put(c, 'B16', { fmtStyle: 'custom', numFmt: CODES.thousandsK });
  c.B17 = { formula: UNITS_LINE_FORMULA };
  c.B18 = { formula: NEXT_UPDATE_FORMULA, fmtStyle: 'custom', numFmt: 'm/d/yyyy' };
  c.B19 = { formula: headlineFormula(fyLast), fontColor: 'green' };
}

/**
 * The chapter's end, solved: the three pages, Inputs, the names, the print set-up, and (with
 * `detail`) the Monthly detail working sheet. Reads the export off `base` (a raw export, or the
 * chain at the end of 2.2, whose residue outside the page it keeps), so the project's and the
 * assessment's graders get their expected end from the same builder.
 */
export function finish(base, { detail = false } = {}) {
  const ex = readExport(base);
  const fy = fyLabels(ex);
  const s = clone(base);
  const inputs = sheetOf(s, 'Inputs');
  finishInputs(inputs.cells, fy[2]);
  s.sheets = [solvedPnl(ex, sheetOf(base, 'P&L')), inputs, solvedMonthly(ex, { nav: !detail }), solvedPrint(ex)];
  if (detail) s.sheets.push(solvedDetail(ex));
  s.settings = { ...s.settings, pageSetup: clone(CH2_PAGE_SETUP) };
  s.names = detail ? DETAIL_NAMES : namesOn('Monthly', [10, 20, 24]);
  return s;
}

/* ---------------- the chain through modules 2.1 and 2.2 ---------------- */

const S1a = derive(S1raw, builtinFormats);
const S1b = derive(S1a, signConvention);
const S1c = derive(S1b, currencyPercentLines);
const S1d = derive(S1c, datesOnTheTimeline);
const S2a = derive(S1d, fourSections);
const S2b = derive(S2a, unitsInTheFormat);
const S2c = derive(S2b, customDateCodes);
const S2d = derive(S2c, conditionalCodes);

/* ---------------- module 2.3 · The page a buyer reads ---------------- */

/** A state patch applied in place (what workbooks/index.js applyStatePatch does; local so this module imports nothing from the registry). */
function applyPatch(state, patch) {
  for (const key in patch || {}) {
    const [shName, ref] = key.includes('!') ? key.split('!') : [state.sheets[0].name, key];
    const sh = sheetOf(state, shName); if (!sh) continue;
    if (ref.startsWith('#')) { const prop = ref.slice(1); if (patch[key] === null) delete sh[prop]; else sh[prop] = clone(patch[key]); continue; }
    sh.cells = sh.cells || {};
    if (patch[key] === null) delete sh.cells[ref]; else sh.cells[ref] = clone(patch[key]);
  }
  return state;
}

const pnl = s => cellsOf(s, 'P&L');
const inputsOf = s => cellsOf(s, 'Inputs');
const monthly = s => cellsOf(s, 'Monthly');
const print = s => cellsOf(s, 'Print');
const detail = s => cellsOf(s, 'Monthly detail');
const PNL_COLS = ['B', ...YEAR_COLS];

/** 2.3.1 Title, units, timeline, sections, answer: the anatomy in place, the typed figures blue, the system's codes gone. */
function anatomy(s) {
  const c = pnl(s);
  c.A1 = { value: TITLE, bold: true, fsz: TITLE_FSZ, ca: 5 };
  for (const r in SECTION_HEADS) put(c, 'B' + r, { value: SECTION_HEADS[r], bold: true });
  for (const r of TOTAL_ROWS) for (const col of PNL_COLS) put(c, col + r, { bold: true });
  for (const r of INDENT_ROWS) put(c, 'B' + r, { indent: 1 });
  put(c, 'B' + ROW.checksHead, { bold: true });                                         // the checks block takes the same anatomy: its header bold, its lines indented
  for (const r of [ROW.checkRevenue, ROW.checkMonthly]) put(c, 'B' + r, { indent: 1 });
  for (const r of [...LINE_ROWS, 33, 34]) for (const col of YEAR_COLS) put(c, col + r, { fontColor: 'blue' });
  for (let r = 4; r <= 35; r++) delete c['A' + r];
}
/** 2.3.2 The A/E divider: a right border down the last actual column, the estimate header shaded, Monthly's header row shaded. */
function divider(s) {
  const c = pnl(s);
  for (let r = 4; r <= 35; r++) put(c, 'D' + r, { br: true });
  for (const r of [4, 5]) put(c, 'E' + r, { fill: DIVIDER_FILL });
  const m = monthly(s);
  for (const col of MONTH_COLS) put(m, col + '4', { fill: DIVIDER_FILL });
}
/** 2.3.3 Borders that mean something: top borders on the four totals, a double bottom on EBITDA, gridlines off. */
function borders(s) {
  const c = pnl(s);
  for (const r of TOTAL_ROWS) for (const col of PNL_COLS) put(c, col + r, { bt: true });
  for (const col of PNL_COLS) put(c, col + '24', { bdbl: true });
  sheetOf(s, 'P&L').gridlines = false;
}
/** 2.3.4 Labels, footnotes and sources: sentence case, the memo labels, the footnote marker, the source and footnote lines. */
function labels(s) {
  const c = pnl(s);
  for (const r of [...LINE_ROWS, 10, 20, 22, 33, 34, 35]) put(c, 'B' + r, { value: r === 9 ? LABEL_NOTE : LABELS[r] });
  c['B' + ROW.source] = { value: SOURCE_LINE, it: true };
  c.B37 = { value: FOOTNOTE, it: true };
}
/** 2.3.5 Widths and the label column: a two-character margin, B fitted to its labels (not the title or the source), one width across the years, the title row taller. */
function widths(s) {
  viaEngine(s, 'P&L', S => {
    S.select('A1'); S.setColWidth(MARGIN_CHARS);
    S.select('B4:B35'); S.autofitCols();
    S.select('C1:E1'); S.setColWidth(PERIOD_CHARS);
    S.select('A1'); S.setRowHeight(TITLE_ROW_PTS);
  });
  sheetOf(s, 'P&L').freeze = { r: 4, c: 2 };   // panes frozen at the first figure, so the labels and the timeline stay (C8)
}
/** The format fields of one cell onto another (Paste Special Formats, the Format Painter): the source's formats, nothing of its content. */
function pasteFormats(src, dst, ref) {
  const from = src[ref] || {};
  const out = { ...(dst || {}) };
  for (const k of FMT_FIELDS) { if (k === 'txt' || k === 'cmt') continue; if (from[k] === undefined || from[k] === null || from[k] === false || from[k] === 0) delete out[k]; else out[k] = from[k]; }
  return Object.keys(out).length ? out : undefined;
}
/** What 2.3.6 arrives with on Monthly: the analyst's title, units line and section headers typed plain, the costs flipped and the subtotals adding, the margins block, the foot copied from the P&L. */
function monthlyPlantRaw(ex) {
  const fy = fyLabels(ex);
  const p = {};
  p['Monthly!A1'] = { value: `${ex.company} - ${fyOf(ex.years[2])} by month` };
  p['Monthly!A2'] = { value: UNITS_LINE };
  p['Monthly!B4'] = { value: 'Month ending' };
  p['Monthly!B6'] = { value: SECTION_HEADS[6] }; p['Monthly!B12'] = { value: SECTION_HEADS[12] };
  for (const r of [...LINE_ROWS, ...TOTAL_ROWS]) p['Monthly!B' + r] = { value: LABELS[r] };   // the labels retyped in sentence case, as the P&L's
  MONTH_COLS.forEach((col, m) => {
    for (const r of COST_ROWS) p[`Monthly!${col}${r}`] = { value: -ex.months[r][m] };
    const f = subtotalFormulas(col, { signed: true });
    p[`Monthly!${col}22`] = { formula: f[22] }; p[`Monthly!${col}24`] = { formula: f[24] };
  });
  p['Monthly!B26'] = { value: MARGIN_HEAD };
  MARGIN_LABELS.forEach((t, i) => { p['Monthly!B' + (27 + i)] = { value: t }; });
  for (const col of FIG_COLS) { const f = marginFormulas(col); for (const r of [27, 28, 29]) p[`Monthly!${col}${r}`] = { formula: f[r] }; if (col !== 'C' && col !== FULL_YEAR_COL) p[`Monthly!${col}30`] = { formula: f[30] }; }
  p['Monthly!B' + MONTHLY_ROW.source] = { value: monthlySourceOf(fy[2]), it: true };
  p['Monthly!B' + MONTHLY_ROW.checksHead] = { value: 'Checks', bold: true };
  MONTHLY_CHECKS.forEach(([label, formula], i) => { const r = MONTHLY_ROW.checkRevenue + i; p['Monthly!B' + r] = { value: label, indent: 1 }; p['Monthly!C' + r] = { formula, fmtStyle: 'custom', numFmt: CODES.check }; });
  return p;
}
/** 2.3.6 Cell styles and Format Painter at scale: Monthly dressed from the P&L by Paste Formats (one column tiled across), the full-year formulas back to black, the title painted and centred across the page, the widths as the P&L's. */
function dressMonthly(s, plant) {
  applyPatch(s, plant);
  const p = pnl(s), m = monthly(s);
  for (let r = 6; r <= 24; r++) {
    for (const col of FIG_COLS) { const out = pasteFormats(p, m[col + r], 'C' + r); if (out) m[col + r] = out; else delete m[col + r]; }
    const out = pasteFormats(p, m['B' + r], 'B' + r); if (out) m['B' + r] = out; else delete m['B' + r];
  }
  for (let r = 6; r <= 24; r++) if (m[FULL_YEAR_COL + r]) delete m[FULL_YEAR_COL + r].fontColor;
  m.A1 = pasteFormats(p, m.A1, 'A1'); m.A1.ca = 15;
  for (let r = 26; r <= 30; r++) {
    const out = pasteFormats(p, m['B' + r], 'B' + r); if (out) m['B' + r] = out;
    for (const col of FIG_COLS) { const o = pasteFormats(p, m[col + r], 'C' + r); if (o) m[col + r] = o; else delete m[col + r]; }
  }
  viaEngine(s, 'Monthly', S => {
    S.select('A1'); S.setColWidth(MARGIN_CHARS);
    S.select('B4:B30'); S.autofitCols();
    S.select('C1:O1'); S.setColWidth(PERIOD_CHARS);
  });
  const sh = sheetOf(s, 'Monthly'); sh.freeze = { r: 4, c: 2 }; sh.gridlines = false;   // the sheet settings the P&L has: frozen at C5, gridlines off
}

/* ---------------- module 2.4 · Alignment and structure ---------------- */

/** 2.4.1 Alignment at scale: Monthly's header row bold and right over its figures, the label header named, the full-year header wrapped, the units line italic. */
function alignMonthly(s) {
  const m = monthly(s);
  put(m, 'B4', { bold: true });
  for (const col of FIG_COLS) put(m, col + '4', { bold: true, align: 'r' });
  put(m, FULL_YEAR_COL + '4', { value: 'Full year', wrap: true });
  put(m, 'A2', { it: true });
}
/** 2.4.2 Grouping and outline levels: the site-cost detail and the memo block fold behind a button (one level: the engine's outline has no second). */
function groupDetail(s) {
  sheetOf(s, 'P&L').groups = { rows: [{ r1: 13, r2: 19, collapsed: false }, { r1: 33, r2: 35, collapsed: false }] };
}
/** The stray block 2.4.3 finds under the P&L: Monthly detail's first eighteen rows (the title, the units line, the headers and the Austin cluster), pasted at row 41 with their formats and dirty labels. */
function strayBlock(ex) {
  const src = solvedDetail(ex, { clean: false, nav: false }).cells;
  const p = {};
  for (const k in src) {
    const q = parseRef(k); if (q.r > DETAIL.clusters[0].contrib) continue;
    const cell = clone(src[k]);
    if (cell.formula) cell.formula = translateFormula(cell.formula, DETAIL.strayTop - 1, 0);
    p[`P&L!${colLetter(q.c)}${q.r + DETAIL.strayTop - 1}`] = cell;
  }
  return p;
}
/** 2.4.3 Hiding vs grouping vs a separate sheet: the margins block unhidden and grouped instead, the stray block cut onto its own sheet, Monthly detail. */
function separateSheet(s, ex) {
  const sh = sheetOf(s, 'P&L');
  delete sh.hiddenRows;
  sh.groups.rows.push({ r1: 26, r2: 30, collapsed: false });
  sh.groups.rows.sort((a, b) => a.r1 - b.r1);
  for (const k of Object.keys(sh.cells)) if (parseRef(k).r >= DETAIL.strayTop) delete sh.cells[k];
  const src = solvedDetail(ex, { clean: false, nav: false }).cells;
  const cells = {};
  for (const k in src) if (parseRef(k).r <= DETAIL.clusters[0].contrib) cells[k] = clone(src[k]);
  s.sheets.push({ name: 'Monthly detail', cells });
}
/** What 2.4.4 arrives with: the other three clusters and the company block, the source and the checks, with the sheet's widths and freeze. */
function clusterLinesPlant(ex) {
  const solved = solvedDetail(ex, { clean: false, nav: false });
  const p = {};
  for (const k in solved.cells) if (parseRef(k).r > DETAIL.clusters[0].contrib) p[`Monthly detail!${k}`] = clone(solved.cells[k]);
  p['Monthly detail!#colW'] = clone(solved.colW);
  p['Monthly detail!#freeze'] = clone(solved.freeze);
  return p;
}
/** 2.4.4 A navigation column: the three blocks named, listed at the top of the sheet. */
function navigation(s, plant) {
  applyPatch(s, plant);
  navColumn(detail(s));
  s.names = clone(DETAIL_NAMES);
}

/* ---------------- module 2.5 · Conditional formatting ---------------- */

/** 2.5.1 Highlight rules: a negative margin in red text on the P&L, a slow month shaded on Monthly. */
function highlightRules(s, ex) {
  sheetOf(s, 'P&L').condFmt = [CF_NEG_MARGIN('C27:E29')];
  sheetOf(s, 'Monthly').condFmt = [CF_SLOW_MONTH(slowMonthThreshold(ex))];
}
/** 2.5.2 Formula-driven rules: the checks turn red when they leave zero; a row lights when its flag in A says x. New rules go to the top of the list, as Excel's do. */
function formulaRules(s) {
  const sh = sheetOf(s, 'P&L');
  sh.condFmt = [CF_ROW_FLAG, { ...CF_CHECKS, stopIfTrue: false }, ...sh.condFmt];
}
/** 2.5.3 Data bars and scales: added to Monthly and taken off again; one set of bars stays on the working sheet's revenue line. */
function dataBars(s) {
  sheetOf(s, 'Monthly detail').condFmt = [{ kind: 'dataBar', range: `C${DETAIL.rev}:N${DETAIL.rev}`, color: 'blue' }];
}
/** 2.5.4 Managing rules: the row rule deleted, the margin rule's range extended to the growth line, the checks rule first with Stop If True. */
function manageRules(s) {
  sheetOf(s, 'P&L').condFmt = [CF_CHECKS, CF_NEG_MARGIN('C27:E30')];
}

/* ---------------- module 2.6 · Dates and text for presentation ---------------- */

/** 2.6.1 TEXT for labels and headers: Monthly's month names under its dates, Print's FY headers from the P&L's dates and flags, the headline on Inputs. */
function textLabels(s, ex) {
  const m = monthly(s);
  for (const col of MONTH_COLS) m[col + '5'] = { formula: MONTH_LABEL_FORMULA(col), it: true, align: 'r' };
  const pr = print(s);
  for (const col of YEAR_COLS) pr[col + '4'] = { formula: PRINT_HEADER_FORMULA(col), bold: true, align: 'r', fontColor: 'green' };
  inputsOf(s).B19 = { formula: headlineFormula(fyLabels(ex)[2]), fontColor: 'green' };
}
/** 2.6.2 EOMONTH and EDATE: Monthly's months chained from its one typed date (blue), the P&L's year ends from Inputs, the next update on Inputs. */
function periodEnds(s) {
  const m = monthly(s);
  put(m, 'C4', { fontColor: 'blue' });
  MONTH_COLS.slice(1).forEach((col, i) => { put(m, col + '4', { formula: MONTH_END_FORMULA(MONTH_COLS[i]), value: null }); });
  const c = pnl(s);
  for (const ref in TIMELINE_FORMULAS) put(c, ref, { formula: TIMELINE_FORMULAS[ref], value: null, ...(ref === 'C4' ? { fontColor: 'green' } : {}) });
  inputsOf(s).B18 = { formula: NEXT_UPDATE_FORMULA, fmtStyle: 'custom', numFmt: 'm/d/yyyy' };
}
/** 2.6.3 Dynamic titles with &: three titles from the company name on Inputs, the period line over Print's labels. */
function dynamicTitles(s, ex) {
  put(pnl(s), 'A1', { formula: TITLE_FORMULAS['P&L'], value: null });
  put(monthly(s), 'A1', { formula: TITLE_FORMULAS.Monthly(fyOf(ex.years[2])), value: null });
  const pr = print(s);
  pr.A1 = { formula: TITLE_FORMULAS.Print, bold: true, fsz: TITLE_FSZ, ca: 5 };
  pr.B4 = { formula: PERIOD_LINE_FORMULA, bold: true, fontColor: 'green' };
}
/** 2.6.4 Cleaning imported labels: Monthly detail's label column as PROPER(TRIM(SUBSTITUTE(…))) leaves it, pasted as values; EBITDA retyped. */
function cleanLabels(s, ex) {
  const d = detail(s), clean = solvedDetail(ex, { clean: true }).cells;
  for (const k in clean) if (parseRef(k).c === 2 && parseRef(k).r >= 5 && typeof clean[k].value === 'string' && d[k]) d[k].value = clean[k].value;
}
/** 2.6.5 A units and period line that writes itself: the line built once on Inputs, every page's A2 reading it. */
function unitsLine(s) {
  inputsOf(s).B17 = { formula: UNITS_LINE_FORMULA };
  for (const name of ['P&L', 'Monthly']) put(cellsOf(s, name), 'A2', { formula: UNITS_FORMULA, value: null, it: true });
  print(s).A2 = { formula: UNITS_FORMULA, it: true };
}

/* ---------------- module 2.7 · Printing and page layout ---------------- */

/** 2.7.1 Print set-up on the pack (2.7.2's page breaks leave the state as it is). */
function printSetup(s) { s.settings.pageSetup = clone(CH2_PAGE_SETUP); }
/** 2.7.3 The one-page summary: Print's six lines linked to the P&L with the P&L's formats, the divider, the source and the check, the widths and the freeze. */
function summaryPage(s, ex) {
  const solved = solvedPrint(ex);
  const sh = sheetOf(s, 'Print');
  for (const k in solved.cells) if (parseRef(k).r >= 5 || (parseRef(k).r === 4 && parseRef(k).c === 4) || (parseRef(k).r === 4 && parseRef(k).c === 5)) sh.cells[k] = { ...(sh.cells[k] || {}), ...clone(solved.cells[k]) };
  sh.colW = clone(solved.colW); sh.freeze = clone(solved.freeze); sh.gridlines = false;
}

/* ---------------- the chain, the plantings, the project ---------------- */

const S3a = derive(S2d, anatomy);
const S3b = derive(S3a, divider);
const S3c = derive(S3b, borders);
const S3d = derive(S3c, labels);
const S3e = derive(S3d, widths);
const PLANT_MONTHLY_RAW = monthlyPlantRaw(EXPORT);
const S3f = derive(S3e, s => dressMonthly(s, PLANT_MONTHLY_RAW));
const S4a = derive(S3f, alignMonthly);
const S4b = derive(S4a, groupDetail);
const S4c = derive(S4b, s => separateSheet(s, EXPORT));
const PLANT_CLUSTER_RAW = clusterLinesPlant(EXPORT);
const S4d = derive(S4c, s => navigation(s, PLANT_CLUSTER_RAW));
const S5a = derive(S4d, s => highlightRules(s, EXPORT));
const S5b = derive(S5a, formulaRules);
const S5c = derive(S5b, dataBars);
const S5d = derive(S5c, manageRules);
const S6a = derive(S5d, s => textLabels(s, EXPORT));
const S6b = derive(S6a, periodEnds);
const S6c = derive(S6b, s => dynamicTitles(s, EXPORT));
const S6d = derive(S6c, s => cleanLabels(s, EXPORT));
const S6e = derive(S6d, unitsLine);
const S7a = derive(S6e, printSetup);
const S7b = derive(S7a, s => summaryPage(s, EXPORT));
/** The chapter's finished workbook, built by the page module from the export: what the chain reaches at S7b (tests/pnl-chapter.test.js holds them equal). */
const Pdone = finish(S2d, { detail: true });

/**
 * What a lesson plants over its before state (lesson.plant): the faults it finds and the material
 * it works on, merged over the cells that are there (overlayPatch), so a planted border keeps the
 * figure under it.
 */
export const PLANT_GRID = (() => { const p = {}; for (const r of [7, 8, 9, 10, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24]) for (const col of YEAR_COLS) p[`P&L!${col}${r}`] = { ball: true }; return overlayPatch(S3b, p); })();   // 2.3.3: the system's grid over C7:E24
export const PLANT_MONTHLY = overlayPatch(S3e, PLANT_MONTHLY_RAW);                                                  // 2.3.6: Monthly as the analyst left it, unformatted
export const PLANT_STRAY = overlayPatch(S4b, { 'P&L!#hiddenRows': [26, 27, 28, 29, 30], ...strayBlock(EXPORT) });      // 2.4.3: the margins hidden, a block pasted under the P&L
export const PLANT_CLUSTER_LINES = overlayPatch(S4c, PLANT_CLUSTER_RAW);                                            // 2.4.4: the site-level lines in
export const PLANT_DUP_LABEL = overlayPatch(S4d, { 'P&L!B18': { value: LABELS[19] } });                             // 2.5.1: a duplicate label (Card fees reads Marketing)

/* the project (2.P): the same export a year on, FY25A, FY26A and FY27E, the same faults; the assessment (2.A): a sister operator's three years on the project's export */

export const YEARS_NEXT = [2025, 2026, 2027];
const FY27E = { 7: 30000, 8: 26500, 9: 2500, 13: 7080, 14: 11000, 15: 6900, 16: 2800, 17: 1750, 18: 1180, 19: 1180, 23: 6900 };
const FY26A_DEC = { 7: 0.3, 8: -0.2, 9: 0.1, 13: -0.3, 14: 0.2, 15: 0.4, 16: -0.4, 17: 0.3, 18: -0.2, 19: 0.2, 23: 0.1 };
const tenthOf = v => Math.round(v * 10) / 10;
/** FY25A as the ledger closed it, FY26A as it closed (the estimate came true, with the ledger's decimals), FY27E the budget. */
export const FIGURES_NEXT = Object.fromEntries(LINE_ROWS.map(r => [r, [FIGURES[r][1], tenthOf(FIGURES[r][2] + FY26A_DEC[r]), FY27E[r]]]));
export const SITES_NEXT = [34, 40, 46], WASHES_NEXT = [2950, 3600, 4200];
export const EXPORT_NEXT = {
  company: 'Clearcoat Express', years: YEARS_NEXT, flags: FLAGS, figures: FIGURES_NEXT, sites: SITES_NEXT, washes: WASHES_NEXT,
  months: monthsOf(FIGURES_NEXT), monthEnds: monthEndsOf(2027), asOf: dateToSerial(2027, 9, 30),
};
const S8raw = rawState(EXPORT_NEXT);
const S8done = finish(S8raw);

/** The sister operators the assessment can draw (screenplay 4: the same case world, the lines familiar and the figures not). */
export const SISTERS = ['Bluebonnet Express Wash', 'Lone Star Shine', 'Gulf Coast Auto Wash', 'Hill Country Wash Co'];
/** A sister operator's export for the assessment: the project's three years, every line scaled and jiggled, the last year a budget that is the sum of its months. */
export function sisterExport(rng) {
  const company = SISTERS[Math.floor(rng() * SISTERS.length)];
  const scale = 0.5 + rng() * 0.3;
  const j = () => 0.92 + rng() * 0.16;
  const figures = Object.fromEntries(LINE_ROWS.map(r => [r, [tenthOf(FIGURES_NEXT[r][0] * scale * j()), tenthOf(FIGURES_NEXT[r][1] * scale * j()), Math.round(FIGURES_NEXT[r][2] * scale * j())]]));
  const base = Math.round(SITES_NEXT[0] * scale);
  const sites = [base, base + Math.max(1, Math.round(6 * scale)), base + Math.max(2, Math.round(12 * scale))];
  const washes = sites.map(n => Math.round(n * (80 + rng() * 15)));
  return { ...EXPORT_NEXT, company, figures, sites, washes, months: monthsOf(figures) };
}
/** The assessment's seed: a sister operator's figures and name over the project's raw export (S8raw); finish(applyStatePatch(stateOf('S8raw'), patch)) is the end its graders expect. */
export function sisterPatch(rng) {
  const ex = sisterExport(rng);
  const raw = rawState(ex);
  const patch = {};
  const take = (name, refs) => { const c = sheetOf(raw, name).cells; for (const ref of refs) patch[`${name}!${ref}`] = clone(c[ref]); };
  take('P&L', [...LINE_ROWS, 33, 34].flatMap(r => YEAR_COLS.map(col => col + r)));
  take('Monthly', LINE_ROWS.flatMap(r => MONTH_COLS.map(col => col + r)));
  take('Inputs', ['B3', 'B14']);
  return patch;
}

export const STATES = { S1raw, S1a, S1b, S1c, S1d, S2a, S2b, S2c, S2d, S3a, S3b, S3c, S3d, S3e, S3f, S4a, S4b, S4c, S4d, S5a, S5b, S5c, S5d, S6a, S6b, S6c, S6d, S6e, S7a, S7b, Pdone, S8raw, S8done };
/** The chain the lessons walk (S1raw to S7b); Pdone is the solved chapter the chain reaches; S8raw and S8done are the project's fresh export and its end. */
export const STATE_ORDER = Object.keys(STATES);
export const CHAIN = STATE_ORDER.slice(0, STATE_ORDER.indexOf('S7b') + 1);

/**
 * The sheet standard (screenplay 5, M86): the finished pages this workbook holds, and the sheets
 * that are off the standard on purpose. Every earlier state is a start state whose job is the standard.
 */
export const STANDARD = {
  pages: [['Pdone', 'P&L', { read: true }], ['Pdone', 'Monthly', { read: true }], ['Pdone', 'Print', { read: true }], ['Pdone', 'Monthly detail', { read: false }],
    ['S8done', 'P&L', { read: true }], ['S8done', 'Monthly', { read: true }], ['S8done', 'Print', { read: true }]],
  off: {
    Inputs: 'the CFO\'s inputs sheet as kept, one value per row; module 2.6 reads it',
  },
};

/** A deep clone of a named state (runners mutate their copy, never the master). */
export function stateOf(id) {
  const s = STATES[id];
  if (!s) throw new Error('unknown workbook state ' + id);
  return clone(s);
}

/* ---------------- seeded clothing for the chapter's challenges ---------------- */

/** The other Texas clusters a challenge's export can come from: the city and five of its sites. */
export const TX_CLUSTERS = [
  { city: 'San Antonio', sites: ['Stone Oak', 'Alamo Heights', 'Medical Center', 'Westover Hills', 'Converse'] },
  { city: 'Houston', sites: ['The Heights', 'Katy', 'Pearland', 'Cypress', 'Sugar Land'] },
  { city: 'Dallas-Fort Worth', sites: ['Frisco', 'Plano', 'Arlington', 'Keller', 'Garland'] },
  { city: 'Austin', sites: ['Domain', 'Mueller', 'Riverside', 'South Lamar', 'Airport'] },
];
export const pickTxCluster = rng => TX_CLUSTERS[Math.floor(rng() * TX_CLUSTERS.length)];
const tenth = v => Math.round(v * 10) / 10;

/**
 * A cluster's P&L for a challenge: the same lines and layout, the figures a quarter of the
 * company's give or take, each line jiggled, to a tenth (the export’s stray decimals).
 * Returns { cluster, annual: [{row: value}], sites, washes, title }.
 */
export function clusterPnl(rng) {
  const cluster = pickTxCluster(rng);
  const scale = 0.2 + rng() * 0.1;
  const annual = [0, 1, 2].map(k => Object.fromEntries(LINE_ROWS.map(r => [r, tenth(FIGURES[r][k] * scale * (0.9 + rng() * 0.2))])));
  const base = 7 + Math.floor(rng() * 3);
  const sites = [base, base + 1 + Math.floor(rng() * 2), base + 3 + Math.floor(rng() * 2)];
  const washes = sites.map(n => Math.round(n * (80 + rng() * 15)));
  return { cluster, annual, sites, washes, title: `Clearcoat Express: ${cluster.city} cluster P&L export, FY24A to FY26E` };
}

/**
 * The seed patch the module 2.1 and 2.2 challenges share: a cluster's P&L over the company's page.
 * The typed lines and the memo counts are blue (the cluster's finance lead colored the inputs);
 * `signed` types the costs negative, for a seed over S1b or later. The cluster's export carries
 * its own margins block (`margins`, for a seed over the raw export), and the check against the
 * company's Monthly sheet goes, since a cluster has no monthly block. The key count is the same
 * for every seed (the workload invariant, LESSON_FRAMEWORK §8).
 */
export function clusterPatch(rng, { signed = false, margins = false } = {}) {
  const { annual, sites, washes, title } = clusterPnl(rng);
  const patch = { 'P&L!A1': { value: title } };
  YEAR_COLS.forEach((col, k) => {
    for (const r of LINE_ROWS) {
      const v = annual[k][r];
      patch[`P&L!${col}${r}`] = { ...(patch[`P&L!${col}${r}`] || {}), value: signed && COST_ROWS.includes(r) ? -v : v, fontColor: 'blue' };
    }
    patch[`P&L!${col}33`] = { value: sites[k], fontColor: 'blue' };
    patch[`P&L!${col}34`] = { value: washes[k], fontColor: 'blue' };
  });
  if (margins) {
    patch['P&L!B26'] = { value: MARGIN_HEAD };
    MARGIN_LABELS.forEach((t, i) => { patch['P&L!B' + (27 + i)] = { value: t }; });
    YEAR_COLS.forEach(col => { const f = marginFormulas(col); for (const r of [27, 28, 29, 30]) patch[`P&L!${col}${r}`] = f[r] ? { formula: f[r] } : null; });
  }
  patch['P&L!B40'] = null; patch['P&L!C40'] = null;
  return patch;
}
/** A seeded P&L keeps its formats when the seed lays figures over a formatted state: merge the patch onto the state's cells. */
export function overlayPatch(state, patch) {
  const out = {};
  for (const key in patch) {
    const [shName, ref] = key.split('!');
    const sh = sheetOf(state, shName);
    out[key] = patch[key] && sh && sh.cells[ref] && !ref.startsWith('#') ? { ...sh.cells[ref], ...patch[key] } : patch[key];
    if (out[key] && out[key].value !== undefined) delete out[key].formula;
    if (out[key] && out[key].formula !== undefined) delete out[key].value;
  }
  return out;
}
