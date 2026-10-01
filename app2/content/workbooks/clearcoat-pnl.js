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
import { Sheet, ROWH_DEFAULT } from '../../engine/sheet.js';
import { dateToSerial } from '../../engine/format.js';
import { parseRef } from '../../engine/refs.js';
import { buildPage } from './page.js';
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
export const CHECK_LABELS = ['Revenue: the total less its lines', 'FY26E revenue less Monthly'];
export const CHECK_FORMULAS = ['=SUM(C10:E10)-SUM(C7:E9)', '=E10-Monthly!O10'];

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

/** FY26 by month: a seasonal tilt on the lines that move with washes, flat on the rest; every line sums to its FY26E figure exactly. */
const TILT = [0.85, 0.85, 0.95, 1, 1.05, 1.15, 1.2, 1.15, 1.05, 0.95, 0.9, 0.9];
const FLAT_ROWS = new Set([14, 15, 19, 23]);
export const MONTHLY = Object.fromEntries(LINE_ROWS.map(r => {
  const year = FIGURES[r][2];
  const w = FLAT_ROWS.has(r) ? TILT.map(() => 1) : TILT;
  const months = w.slice(0, 11).map(x => Math.round(year * x / 12));
  months.push(year - months.reduce((a, v) => a + v, 0));
  return [r, months];
}));
export const MONTH_COLS = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
export const FULL_YEAR_COL = 'O';
/** Month-end serials for Jan–Dec 2026. */
export const MONTH_ENDS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31].map((d, m) => dateToSerial(2026, m + 1, d));

/* ---------------- the S1raw sheets ---------------- */

function pnlRawCells() {
  const c = { A4: { value: 'ACCOUNT' }, B4: { value: 'DESCRIPTION' } };
  YEAR_COLS.forEach((col, i) => { c[col + '4'] = { value: YEAR_TEXT[i] }; });
  for (const r in RAW_LINES) {
    const [code, label] = RAW_LINES[r];
    if (code) c['A' + r] = { value: code };
    c['B' + r] = { value: label };
  }
  YEAR_COLS.forEach((col, k) => {
    for (const r of LINE_ROWS) c[col + r] = { value: FIGURES[r][k] };
    const f = subtotalFormulas(col);
    for (const r in f) c[col + r] = { formula: f[r] };
    c[col + '33'] = { value: SITES_FY[k] };
    c[col + '34'] = { value: WASHES_FY[k] };
    c[col + '35'] = { formula: PER_WASH_FORMULA(col) };
  });
  c.B38 = { value: 'Checks' };
  c.B39 = { value: CHECK_LABELS[0] }; c.C39 = { formula: CHECK_FORMULAS[0] };
  c.B40 = { value: CHECK_LABELS[1] }; c.C40 = { formula: CHECK_FORMULAS[1] };
  return c;
}

/** The Inputs sheet: what the CFO keeps (script-ch2.md), plus the figures the book quotes beside the P&L. */
export const INPUT_ROW = { company: 3, currency: 4, units: 5, firstYearEnd: 6, flags: [7, 8, 9], asOf: 10, source: 11, switch: 12, multiple: 13, bps: 14, revenueM: 15, perSiteK: 16 };
export const MULTIPLE_TEXT = '12.0x', MULTIPLE = 12;
function inputsCells() {
  const blue = (value, extra) => ({ value, fontColor: 'blue', ...(extra || {}) });
  return {
    A1: { value: 'Inputs', bold: true },
    A3: { value: 'Company' }, B3: blue('Clearcoat Express'),
    A4: { value: 'Currency' }, B4: blue('USD'),
    A5: { value: 'Units' }, B5: blue('thousands'),
    A6: { value: 'First fiscal year end' }, B6: blue(YEAR_ENDS[0], { fmtStyle: 'custom', numFmt: 'm/d/yyyy' }),
    A7: { value: 'FY24 flag' }, B7: blue('A'), A8: { value: 'FY25 flag' }, B8: blue('A'), A9: { value: 'FY26 flag' }, B9: blue('E'),
    A10: { value: 'As of' }, B10: blue(dateToSerial(2026, 9, 30), { fmtStyle: 'custom', numFmt: 'm/d/yyyy' }),
    A11: { value: 'Source' }, B11: blue('Management accounts; FY24 and FY25 audited; FY26 per the September budget'),
    A12: { value: 'Estimate column in the book (1 on, 0 off)' }, B12: blue(1),
    A13: { value: 'EV/EBITDA, illustrative' }, B13: blue(MULTIPLE_TEXT),   // typed as text with its x: no formula can use it (2.2.2 retypes it)
    A14: { value: 'EBITDA margin change, FY24A to FY26E (bps)' }, B14: blue(356),
    A15: { value: 'Revenue, FY26E' }, B15: { formula: "='P&L'!E10", fontColor: 'green' },
    A16: { value: 'Revenue per site, FY26E' }, B16: { formula: "='P&L'!E10/'P&L'!E33", fontColor: 'green' },
  };
}

function monthlyCells() {
  const c = { B4: { value: 'DESCRIPTION' }, [FULL_YEAR_COL + '4']: { value: 'FULL YEAR' } };
  MONTH_COLS.forEach((col, m) => { c[col + '4'] = { value: MONTH_ENDS[m] }; });   // the export writes the month ends as bare serials
  for (const r in RAW_LINES) if (+r <= 24) c['B' + r] = { value: RAW_LINES[r][1] };
  MONTH_COLS.forEach((col, m) => {
    for (const r of LINE_ROWS) c[col + r] = { value: MONTHLY[r][m] };
    const f = subtotalFormulas(col);
    for (const r in f) c[col + r] = { formula: f[r] };
  });
  for (const r of [...LINE_ROWS, 10, 20, 22, 24]) c[FULL_YEAR_COL + r] = { formula: `=SUM(C${r}:N${r})` };
  return c;
}

function derive(base, fn) { const next = clone(base); fn(next); return next; }
export const sheetOf = (state, name) => state.sheets.find(s => s.name === name);

const S1raw = {
  sheets: [
    { name: 'P&L', cells: pnlRawCells(), active: { r: 1, c: 1 } },
    { name: 'Inputs', cells: inputsCells(), colW: { 1: 290 } },
    { name: 'Monthly', cells: monthlyCells() },
    { name: 'Print', cells: {} },
  ],
  settings: { calcMode: 'automatic', iterative: true, qat: ['save', 'undo', 'redo', 'fontColor', 'fillColor', 'borders', 'decDecimal'] },
};

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
    o.fmt('C35:E35', 'comma', 2);
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

/* ---------------- the presentation-quality page (M86) ---------------- */

const yearValues = r => YEAR_COLS.map((col, k) => (COST_ROWS.includes(r) ? -FIGURES[r][k] : FIGURES[r][k]));
/** The finished P&L, built through the shared page module: the sheet standard, Chapter 2 layout. */
export function pnlPage() {
  const line = (r, extra = {}) => ({ key: 'r' + r, label: LABELS[r], values: yearValues(r), dollar: false, ...extra });
  const sub = (r, extra = {}) => ({ key: 'r' + r, label: LABELS[r], values: YEAR_COLS.map(col => subtotalFormulas(col, { signed: true })[r]), total: true, dollar: false, ...extra });
  const margin = r => ({ key: 'r' + r, label: LABELS[r], kind: 'pct', values: [...YEAR_COLS.map(col => marginFormulas(col)[r] || null), r === 29 ? 'CAGR' : r === 30 ? CAGR_FORMULA : null] });
  const page = buildPage({
    name: 'P&L', chapter: CHAPTER, read: true, center: true,
    title: TITLE, units: UNITS_LINE, labelHeader: YEAR_LABEL,
    headers: YEAR_ENDS,
    blocks: [
      { rows: [
        { key: 'flags', label: null, kind: 'text', values: FLAGS, dollar: false },
        { key: 'revHead', label: 'Revenue', values: [], dollar: false },
        line(7, { indent: 1, dollar: true }), line(8, { indent: 1 }), line(9, { indent: 1 }),
        sub(10, { dollar: true }),
      ] },
      { title: 'Site costs', rows: [...SITE_COST_ROWS.map(r => line(r, { indent: 1 })), sub(20)] },
      { rows: [sub(22), line(23), sub(24, { final: true, dollar: true })] },
      { title: MARGIN_HEAD, rows: [margin(27), margin(28), margin(29), margin(30)] },
      { title: 'Memo', rows: [
        { key: 'r33', label: LABELS[33], kind: 'count', values: SITES_FY },
        { key: 'r34', label: LABELS[34], kind: 'count', values: WASHES_FY },
        { key: 'r35', label: LABELS[35], kind: 'unit', dollar: true, values: YEAR_COLS.map(PER_WASH_FORMULA) },
      ] },
    ],
    source: 'Source: management accounts; FY24 and FY25 audited; FY26 per the September budget',
    checks: CHECK_LABELS.map((label, i) => ({ label, formula: CHECK_FORMULAS[i] })),
  });
  // the page lands where the lessons address it: the layout here and the layout the chapter teaches are one
  const want = { flags: ROW.flags, revHead: ROW.revHead, r7: 7, r10: 10, r13: 13, r20: 20, r22: 22, r24: 24, r27: 27, r30: 30, r33: 33, r35: 35 };
  for (const k in want) if (page.at[k] !== want[k]) throw new Error(`clearcoat-pnl: the page puts ${k} on row ${page.at[k]}, the lessons expect ${want[k]}`);
  if (page.std.checksRow !== ROW.checksHead) throw new Error(`clearcoat-pnl: the checks block sits on row ${page.std.checksRow}`);
  const c = page.sheet.cells;
  c.A1.ca = 5;                                              // centered across the page's three years, A1:E1
  c.B4 = { ...c.B4, align: 'r' };
  YEAR_COLS.forEach((col, i) => { c[col + '4'] = { ...c[col + '4'], fmtStyle: 'custom', numFmt: i < 2 ? CODES.fyActual : CODES.fyEstimate }; });
  YEAR_COLS.forEach(col => { c[col + '5'] = { ...c[col + '5'], it: true, align: 'r' }; });
  for (const r of [ROW.revHead]) c['B' + r] = { ...c['B' + r], bold: true };
  return page;
}
const Pdone = (() => {
  const s = clone(S1raw);
  s.sheets[0] = pnlPage().sheet;
  return s;
})();

const S1a = derive(S1raw, builtinFormats);
const S1b = derive(S1a, signConvention);
const S1c = derive(S1b, currencyPercentLines);
const S1d = derive(S1c, datesOnTheTimeline);
const S2a = derive(S1d, fourSections);
const S2b = derive(S2a, unitsInTheFormat);
const S2c = derive(S2b, customDateCodes);
const S2d = derive(S2c, conditionalCodes);

export const STATES = { S1raw, S1a, S1b, S1c, S1d, S2a, S2b, S2c, S2d, Pdone };
export const STATE_ORDER = Object.keys(STATES);

/**
 * The sheet standard (screenplay 5, M86): the finished page this workbook holds, and the sheets
 * that are off the standard on purpose.
 */
export const STANDARD = {
  pages: [['Pdone', 'P&L', { read: true }]],
  off: {
    Inputs: 'the CFO\'s inputs sheet as kept, one value per row; module 2.6 reads it',
    Monthly: 'the monthly export with the P&L\'s faults; Chapter 2 formats it module by module',
    Print: 'empty until the one-page summary in 2.7.3',
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
