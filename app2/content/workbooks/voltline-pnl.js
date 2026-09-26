// app2/content/workbooks/voltline-pnl.js — the Chapter 2 module workbook (Project Volt, stage 2).
// Voltline Charging Inc., company level: three years of P&L (FY24A, FY25A, FY26E) plus the twelve
// months of FY26, sent by management's finance team as a raw dump from the accounting system.
// Chapter 2 takes it to presentation quality for the information memorandum.
//
// Sheets: P&L (the page the buyer reads), Inputs (the deal team's assumptions), Monthly (FY26
// operating data by month) and Print (the one-page summary 2.7 builds; empty until then).
// P&L layout: A labels, B:D the three years, E:P January to December 2026 — fifteen contiguous
// period columns (C2: no blank columns between periods, so Ctrl+Shift+→ takes a whole line) and
// the labels inside the engine's 26.
//
// STATES chain the lessons exactly as voltline-weekly does (before → solution → after, asserted by
// tests/module-states.test.js and tests/pnl-states.test.js). Every state is DERIVED from the
// previous by a pure patch, and stateOf() hands out deep clones. `S1raw` is the dump as it arrived;
// S1a–S1d are module 2.1 (number formats), S2a–S2d module 2.2 (custom number formats); `Pdone` is
// the presentation-quality end state the chapter builds toward (the 2.P project's after).
// Figures are deterministic (integer cents), so checks can read the sheet and assert exact numbers.
import { mulberry32 } from '../../engine/rng.js';
import { dateToSerial } from '../../engine/format.js';
import { codeDecimals } from '../../engine/numfmt.js';
import { pickCluster } from './clusters.js';
import { diffStates, sessionToState, PAGE_SETUP_DEFAULT } from './voltline-weekly.js';

export { diffStates, sessionToState, PAGE_SETUP_DEFAULT };

const clone = o => JSON.parse(JSON.stringify(o));
const cents = v => Math.round(v * 100) / 100;

/* ---------------- the layout ---------------- */

export const YEARS = ['FY24A', 'FY25A', 'FY26E'];
export const YEAR_NUMS = [2024, 2025, 2026];          // how the export heads its year columns (2.1.4 relabels them)
export const ANNUAL_COLS = ['B', 'C', 'D'];
export const MONTH_COLS = ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
export const PERIOD_COLS = [...ANNUAL_COLS, ...MONTH_COLS];
export const LAST_COL = PERIOD_COLS[PERIOD_COLS.length - 1];   // P
export const TITLE_SPAN = PERIOD_COLS.length + 1;               // A:P — what Center Across Selection spans
/** Month-end serials for Jan–Dec 2026 (Excel dates). */
export const MONTH_ENDS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31].map((d, m) => dateToSerial(2026, m + 1, d));
export const LAST_ACTUAL = dateToSerial(2026, 8, 31);   // actuals to August; September on is estimate

/** The P&L's rows. `kind`: line (a typed figure), total (a formula), pct (a formula shown as %), count, ratio. */
export const PNL = {
  header: 4,
  public: 5, fleet: 6, home: 7, revenue: 8,
  energy: 9, gross: 10, grossPct: 11,
  leases: 12, maintenance: 13, platform: 14, staff: 15, opex: 16,
  ebitda: 17, ebitdaPct: 18,
  sites: 20, perSite: 21,
  check: 23,
};
export const PNL_LABELS = {
  4: 'Line', 5: 'Public charging', 6: 'Fleet contracts', 7: 'Home charging', 8: 'Total revenue',
  9: 'Energy cost', 10: 'Gross profit', 11: 'Gross margin %',
  12: 'Site leases', 13: 'Maintenance', 14: 'Platform and payment fees', 15: 'Staff', 16: 'Total operating costs',
  17: 'EBITDA', 18: 'EBITDA margin %', 20: 'Sites open (period end)', 21: 'Revenue per site',
  23: 'Check: FY26E revenue less the twelve months',
};
/** The typed lines and the cost lines among them (2.1.2 flips the costs negative). */
export const LINE_ROWS = [5, 6, 7, 9, 12, 13, 14, 15];
export const COST_ROWS = [9, 12, 13, 14, 15];
export const PCT_ROWS = [11, 18];
/** D4: the $ goes on a block's first row and its totals. */
export const DOLLAR_ROWS = [5, 8, 10, 16, 17];
export const PLAIN_ROWS = [6, 7, 9, 12, 13, 14, 15];

/** The subtotal formulas for a period column, as the export writes them (costs positive, subtracted). */
export function subtotalFormulas(col, { signed = false } = {}) {
  const c = col;
  return {
    8: `=SUM(${c}5:${c}7)`,
    10: signed ? `=${c}8+${c}9` : `=${c}8-${c}9`,
    11: `=${c}10/${c}8`,
    16: `=SUM(${c}12:${c}15)`,
    17: signed ? `=${c}10+${c}16` : `=${c}10-${c}16`,
    18: `=${c}17/${c}8`,
    21: `=${c}8/${c}20`,
  };
}

/* ---------------- the figures (integer cents, deterministic) ---------------- */

const SITES_FY = [28, 34, 40];
export const SITES_MONTH = [35, 35, 36, 36, 37, 37, 38, 38, 39, 39, 40, 40];
/** FY24A and FY25A as the ledger closed them (USD, to the cent). */
const ANNUAL_ACTUALS = [
  { 5: 8412650.18, 6: 2316904.55, 7: 0, 9: 3112840.27, 12: 1612000, 13: 431227.9, 14: 311157.09, 15: 1843500 },
  { 5: 10284117.62, 6: 3508442.18, 7: 0, 9: 4103287.15, 12: 1984000, 13: 522618.44, 14: 399984.23, 15: 2215800 },
];

/** FY26 by month: each line for Jan–Dec, from one seeded stream (Home charging launches in April). */
function monthlyFigures(seed = 20260914) {
  const rng = mulberry32(seed);
  const out = {}; for (const r of LINE_ROWS) out[r] = [];
  for (let m = 0; m < 12; m++) {
    const sites = SITES_MONTH[m];
    const season = 1 + 0.06 * Math.sin((m - 3) / 12 * 2 * Math.PI);          // a little summer lift
    const pub = sites * 29800 * season * (0.97 + rng() * 0.06);
    const fleet = 305000 + m * 9400 + rng() * 18000;
    const home = m < 3 ? 0 : 14000 + (m - 3) * 6200 + rng() * 3000;
    const rev = pub + fleet + home;
    out[5].push(cents(pub)); out[6].push(cents(fleet)); out[7].push(cents(home));
    out[9].push(cents(rev * (0.285 + rng() * 0.012)));
    out[12].push(cents(sites * 5500));                                        // $66,000 a site a year
    out[13].push(m === 6 ? 0 : cents(rev * (0.036 + rng() * 0.008)));       // July's maintenance invoice slipped into August
    out[14].push(cents(rev * 0.028));
    out[15].push(cents(228000 + (m >= 6 ? 14500 : 0)));
  }
  out[13][7] = cents(out[13][7] * 2);
  return out;
}
export const MONTHLY = monthlyFigures();
/** FY26E: the sum of its months, to the cent. */
export const FY26E = Object.fromEntries(LINE_ROWS.map(r => [r, cents(MONTHLY[r].reduce((a, v) => a + Math.round(v * 100), 0) / 100)]));
export const ANNUAL = [ANNUAL_ACTUALS[0], ANNUAL_ACTUALS[1], FY26E];

/** Operating data by month (the Monthly sheet). */
export const MONTHLY_OPS = (() => {
  const rng = mulberry32(20260915);
  const kwh = [], sessions = [];
  for (let m = 0; m < 12; m++) {
    const k = Math.round((SITES_MONTH[m] * 27000 * (0.96 + rng() * 0.1)) / 10) * 10;
    kwh.push(k);
    sessions.push(Math.round(k / (18.4 + rng() * 5.2)));                     // kWh per session straddles 20: some months read low
  }
  const opened = SITES_MONTH.map((s, m) => s - (m ? SITES_MONTH[m - 1] : 34));
  return { kwh, sessions, opened, fleetSigned: [0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1] };
})();

/* ---------------- the S1raw sheets ---------------- */

const RAW_TITLE = 'Voltline Charging Inc. - P&L export, FY24A to FY26E';
export const UNITS_RAW = 'All figures USD';

function pnlRawCells() {
  const c = {
    A1: { value: RAW_TITLE },
    A2: { value: UNITS_RAW },
  };
  for (const r in PNL_LABELS) c['A' + r] = { value: PNL_LABELS[r] };
  ANNUAL_COLS.forEach((col, i) => { c[col + '4'] = { value: YEAR_NUMS[i] }; });
  MONTH_COLS.forEach((col, m) => { c[col + '4'] = { value: MONTH_ENDS[m] }; });   // the export writes dates as bare serials
  PERIOD_COLS.forEach((col, k) => {
    const annual = k < 3;
    for (const r of LINE_ROWS) c[col + r] = { value: annual ? ANNUAL[k][r] : MONTHLY[r][k - 3] };
    const f = subtotalFormulas(col);
    for (const r in f) c[col + r] = { formula: f[r] };
    // the export left a currency format on the site count: "$28.00" (2.1.1 clears it)
    c[col + '20'] = { value: annual ? SITES_FY[k] : SITES_MONTH[k - 3], fmtStyle: 'currency', decimals: 2 };
  });
  c.D23 = { formula: `=D8-SUM(${MONTH_COLS[0]}8:${LAST_COL}8)` };
  return c;
}
const PNL_COLW = { 1: 190 };

function inputsCells() {
  const blue = (value, extra) => ({ value, fontColor: 'blue', ...(extra || {}) });
  const c = {
    A1: { value: 'Inputs - FY24A to FY26E', bold: true },
    A2: { value: 'USD unless stated' },
    A4: { value: 'Assumption', bold: true },
    A5: { value: 'Average tariff ($/kWh)' }, A6: { value: 'Wholesale energy price ($/kWh)' }, A7: { value: 'Platform fee (% of revenue)' },
    A8: { value: 'Tariff increase (bps)' }, A9: { value: 'Lease per site ($ per year)' }, A10: { value: 'Net debt / EBITDA' },
    A11: { value: 'Sites at year end' }, A12: { value: 'Last actual month' },
  };
  YEARS.forEach((y, i) => { c[ANNUAL_COLS[i] + '4'] = { value: y, bold: true, align: 'r' }; });
  const rows = {
    5: [[0.44, 0.45, 0.46], { fmtStyle: 'currency', decimals: 2 }],
    6: [[0.128, 0.131, 0.134], { fmtStyle: 'currency', decimals: 3 }],
    7: [[0.029, 0.029, 0.028], { fmtStyle: 'percent', decimals: 1 }],
    8: [[0, 100, 150]],
    9: [[62000, 64000, 66000]],
    11: [SITES_FY],
  };
  for (const r in rows) rows[r][0].forEach((v, i) => { c[ANNUAL_COLS[i] + r] = blue(v, rows[r][1]); });
  // the associate typed the leverage as text with its unit: "2.9x" cannot be summed or linked (2.2.2 retypes it)
  ['2.9x', '2.4x', '1.9x'].forEach((t, i) => { c[ANNUAL_COLS[i] + '10'] = blue(t); });
  c.B12 = blue(LAST_ACTUAL, { fmtStyle: 'date' });
  return c;
}

function monthlyCells() {
  const c = {
    A1: { value: 'Voltline - monthly operating data, FY26', bold: true },
    A2: { value: 'Operating data as the platform records it' },
    A4: { value: 'Month end', bold: true },
    A5: { value: 'Sites open' }, A6: { value: 'kWh sold' }, A7: { value: 'Sessions' }, A8: { value: 'kWh per session' },
    A9: { value: 'Sites opened in month' }, A10: { value: 'Fleet contracts signed' },
    A12: { value: 'Check: sites vs P&L' },
  };
  const cols = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  cols.forEach((col, m) => {
    c[col + '4'] = { value: MONTH_ENDS[m] };
    c[col + '5'] = { value: SITES_MONTH[m], fontColor: 'blue' };
    c[col + '6'] = { value: MONTHLY_OPS.kwh[m], fontColor: 'blue' };
    c[col + '7'] = { value: MONTHLY_OPS.sessions[m], fontColor: 'blue' };
    c[col + '8'] = { formula: `=${col}6/${col}7` };
    c[col + '9'] = { value: MONTHLY_OPS.opened[m], fontColor: 'blue' };
    c[col + '10'] = { value: MONTHLY_OPS.fleetSigned[m], fontColor: 'blue' };
    c[col + '12'] = { formula: `=${col}5-'P&L'!${MONTH_COLS[m]}20` };
  });
  return c;
}
export const MONTHLY_COLS = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

function derive(base, fn) { const next = clone(base); fn(next); return next; }
export const sheetOf = (state, name) => state.sheets.find(s => s.name === name);

const S1raw = {
  sheets: [
    { name: 'P&L', cells: pnlRawCells(), colW: { ...PNL_COLW }, active: { r: 1, c: 1 } },
    { name: 'Inputs', cells: inputsCells(), colW: { 1: 190 } },
    { name: 'Monthly', cells: monthlyCells(), colW: { 1: 160 } },
    { name: 'Print', cells: {} },
  ],
  settings: { calcMode: 'automatic', iterative: true, qat: ['save', 'undo', 'redo', 'fontColor', 'fillColor', 'borders', 'decDecimal'] },
};

/* ---------------- the presentation-quality end state ---------------- */

/**
 * The house number-format set (2.2), as the Custom box stores it: four sections, parentheses,
 * zero as a dash. Every code is typed without double quotes (the box quotes a unit letter itself:
 * `$#,##0,k` becomes `$#,##0,"k"`), so a lesson hint can carry it verbatim.
 */
export const HOUSE_FORMATS = {
  plain: '#,##0_);(#,##0);-_)',
  dollar: '$#,##0_);($#,##0);-_)',
  pct: '0.0%_);(0.0%);-_)',
  count: '#,##0_);(#,##0);-_)',
  perSite: '$#,##0,"k"_);($#,##0,"k");-_)',
  month: 'mmm-yy',
  multiple: '0.0"x"',
  bps: '0 "bps"',
  thousands: '#,##0,"k"',
  oneDecimal: '0.0',
  kwhTiers: '[>=1000000]0.0,,\\m;[>=1000]0,\\k;0',
  hideZeros: '#,##0;(#,##0);',
  check: '[Red]"ERROR";[Red]"ERROR";"OK"',
  actualsTo: '"Actuals to "mmm-yy',
};
/** The same codes as a learner types them into the Custom box (the box adds the quotes). */
export const TYPED_FORMATS = {
  perSite: '$#,##0,k_);($#,##0,k);-_)', multiple: '0.0x', bps: '0 bps', thousands: '#,##0,k', check: '[Red]ERROR;[Red]ERROR;OK',
};
export const TITLE = 'Voltline Charging Inc. - Profit and loss, FY24A to FY26E';
export const UNITS_LINE = 'USD unless stated; costs shown as negatives';
export const YEAR_END_LABEL = 'Year end';
export const HELPER_CELL = 'B30';   // where 2.1.2 parks the -1 it multiplies the cost lines by

/** Cells of `rows` × `cols` as refs. */
const cellsOf = (cols, rows) => cols.flatMap(col => rows.map(r => col + r));
const setAll = (c, refs, patch) => { for (const ref of refs) c[ref] = { ...(c[ref] || {}), ...patch }; };
const fmt = (fmtStyle, decimals) => ({ fmtStyle, decimals, numFmt: null });
const custom = code => ({ fmtStyle: 'custom', numFmt: code, decimals: codeDecimals(code), scale: 0 });   // the decimals field mirrors the code, as Sheet.setCustomFormat leaves it

/* ---------------- module 2.1 · Number formats ---------------- */

/** 2.1.1 Built-in formats: the block comma style, the site count freed of its currency dress, the per-site and Inputs figures dressed. */
function builtinFormats(s) {
  const c = sheetOf(s, 'P&L').cells;
  setAll(c, cellsOf(PERIOD_COLS, [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]), fmt('comma', 0));
  setAll(c, cellsOf(PERIOD_COLS, [20]), fmt('general', 0));
  setAll(c, cellsOf(PERIOD_COLS, [21]), fmt('currency', 0));
  const i = sheetOf(s, 'Inputs').cells;
  setAll(i, cellsOf(ANNUAL_COLS, [9]), fmt('currency', 0));
  setAll(i, cellsOf(ANNUAL_COLS, [11]), fmt('comma', 0));
}
/** 2.1.2 Sign convention: costs negative (multiplied by a -1 helper), the subtotals re-signed as sums, the convention stated. */
function signConvention(s) {
  const c = sheetOf(s, 'P&L').cells;
  for (const col of PERIOD_COLS) {
    for (const r of COST_ROWS) { const v = c[col + r].value; c[col + r] = { ...c[col + r], value: v ? -v : 0 }; }
    const f = subtotalFormulas(col, { signed: true });
    for (const r of [10, 17]) c[col + r] = { ...c[col + r], formula: f[r] };
  }
  c.A2 = { ...c.A2, value: UNITS_LINE };
}
/** 2.1.3 Currency and percent lines: Accounting on the first and total rows, percent to one decimal on the margins. */
function currencyPercentLines(s) {
  const c = sheetOf(s, 'P&L').cells;
  setAll(c, cellsOf(PERIOD_COLS, DOLLAR_ROWS), fmt('acct', 0));
  setAll(c, cellsOf(PERIOD_COLS, PCT_ROWS), fmt('percent', 1));
}
/** 2.1.4 Dates on the timeline: FY labels, month-end headers as dates, the header row right-aligned and bold. */
function datesOnTheTimeline(s) {
  const c = sheetOf(s, 'P&L').cells;
  ANNUAL_COLS.forEach((col, i) => { c[col + '4'] = { ...c[col + '4'], value: YEARS[i] }; });
  setAll(c, cellsOf(MONTH_COLS, [4]), fmt('date', 0));
  setAll(c, cellsOf(PERIOD_COLS, [4]), { align: 'r' });
  setAll(c, cellsOf(['A', ...PERIOD_COLS], [4]), { bold: true });
  setAll(sheetOf(s, 'Monthly').cells, cellsOf(MONTHLY_COLS, [4]), fmt('date', 0));
}

/* ---------------- module 2.2 · Custom number formats ---------------- */

/** 2.2.1 The four-section code: the house plain, dollar and percent codes replace the built-ins. */
function fourSections(s) {
  const c = sheetOf(s, 'P&L').cells;
  setAll(c, cellsOf(PERIOD_COLS, PLAIN_ROWS), custom(HOUSE_FORMATS.plain));
  setAll(c, cellsOf(PERIOD_COLS, DOLLAR_ROWS), custom(HOUSE_FORMATS.dollar));
  setAll(c, cellsOf(PERIOD_COLS, PCT_ROWS), custom(HOUSE_FORMATS.pct));
}
/** 2.2.2 Units in the format: per-site in $k, the leverage retyped as numbers with an x, bps, kWh in thousands. */
function unitsInTheFormat(s) {
  const c = sheetOf(s, 'P&L').cells;
  setAll(c, cellsOf(PERIOD_COLS, [21]), custom(HOUSE_FORMATS.perSite));
  const i = sheetOf(s, 'Inputs').cells;
  [2.9, 2.4, 1.9].forEach((v, k) => { i[ANNUAL_COLS[k] + '10'] = { ...i[ANNUAL_COLS[k] + '10'], value: v, ...custom(HOUSE_FORMATS.multiple) }; });
  setAll(i, cellsOf(ANNUAL_COLS, [8]), custom(HOUSE_FORMATS.bps));
  const m = sheetOf(s, 'Monthly').cells;
  setAll(m, cellsOf(MONTHLY_COLS, [6]), custom(HOUSE_FORMATS.thousands));
  setAll(m, cellsOf(MONTHLY_COLS, [8]), custom(HOUSE_FORMATS.oneDecimal));
}
/** 2.2.3 Dynamic headers with TEXT: year ends in row 3, the FY labels and both titles built from them. */
export const YEAR_END_FORMULAS = ['=DATE(2024,12,31)', '=DATE(2025,12,31)', '=DATE(2026,12,31)'];
export const FY_LABEL_FORMULAS = ['="FY"&TEXT(B3,"yy")&"A"', '="FY"&TEXT(C3,"yy")&"A"', '="FY"&TEXT(D3,"yy")&"E"'];
export const TITLE_FORMULA = '="Voltline Charging Inc. - Profit and loss, "&B4&" to "&D4';
export const MONTHLY_TITLE_FORMULA = '="Voltline - monthly operating data, "&TEXT(B4,"mmm-yy")&" to "&TEXT(M4,"mmm-yy")';
function dynamicHeaders(s) {
  const c = sheetOf(s, 'P&L').cells;
  c.A3 = { value: YEAR_END_LABEL };
  ANNUAL_COLS.forEach((col, k) => {
    c[col + '3'] = { formula: YEAR_END_FORMULAS[k], ...fmt('date', 0) };
    c[col + '4'] = { ...c[col + '4'], formula: FY_LABEL_FORMULAS[k] }; delete c[col + '4'].value;
  });
  c.A1 = { ...c.A1, formula: TITLE_FORMULA }; delete c.A1.value;
  const m = sheetOf(s, 'Monthly').cells;
  m.A1 = { ...m.A1, formula: MONTHLY_TITLE_FORMULA }; delete m.A1.value;
}
/** 2.2.4 Conditional codes and hidden zeros: kWh tiers, the working block's zeros hidden, the checks reading OK/ERROR, the actuals date labelled. */
function conditionalCodes(s) {
  const m = sheetOf(s, 'Monthly').cells;
  setAll(m, cellsOf(MONTHLY_COLS, [6]), custom(HOUSE_FORMATS.kwhTiers));
  setAll(m, cellsOf(MONTHLY_COLS, [9, 10]), custom(HOUSE_FORMATS.hideZeros));
  setAll(m, cellsOf(MONTHLY_COLS, [12]), custom(HOUSE_FORMATS.check));
  setAll(sheetOf(s, 'P&L').cells, ['D23'], custom(HOUSE_FORMATS.check));
  setAll(sheetOf(s, 'Inputs').cells, ['B12'], custom(HOUSE_FORMATS.actualsTo));
}

/* ---------------- the presentation-quality end state ---------------- */

/**
 * Take a P&L state to presentation quality: the costs negative and added, the house formats,
 * FY labels and month-end headers, bold totals with a top border, margins italic, the title
 * centred across the page, gridlines off, panes frozen at B5. Pure over a clone.
 */
export function present(state) {
  const sh = sheetOf(state, 'P&L'); const c = sh.cells;
  const set = (ref, patch) => { c[ref] = { ...(c[ref] || {}), ...patch }; };
  set('A1', { value: TITLE, bold: true, fsz: 16, ca: TITLE_SPAN });
  set('A2', { value: UNITS_LINE, it: true });
  ANNUAL_COLS.forEach((col, i) => set(col + '4', { value: YEARS[i] }));
  for (const col of PERIOD_COLS) {
    set(col + '4', { bold: true, align: 'r' });
    for (const r of COST_ROWS) { const v = c[col + r].value; set(col + r, { value: v ? -v : 0 }); }
    const f = subtotalFormulas(col, { signed: true });
    for (const r in f) set(col + r, { formula: f[r] });
    for (const r of LINE_ROWS) set(col + r, { fontColor: 'blue' });
    set(col + '20', { fontColor: 'blue' });
    for (const r of PLAIN_ROWS) set(col + r, { fmtStyle: 'custom', numFmt: HOUSE_FORMATS.plain, decimals: 0 });
    for (const r of DOLLAR_ROWS) set(col + r, { fmtStyle: 'custom', numFmt: HOUSE_FORMATS.dollar, decimals: 0 });
    for (const r of PCT_ROWS) set(col + r, { fmtStyle: 'custom', numFmt: HOUSE_FORMATS.pct, decimals: 1, it: true });
    set(col + '20', { fmtStyle: 'custom', numFmt: HOUSE_FORMATS.count, decimals: 0 });
    set(col + '21', { fmtStyle: 'custom', numFmt: HOUSE_FORMATS.perSite, decimals: 0 });
  }
  for (const col of MONTH_COLS) set(col + '4', { fmtStyle: 'custom', numFmt: HOUSE_FORMATS.month });
  set('A4', { bold: true });
  for (const r of [8, 10, 16, 17]) for (const col of ['A', ...PERIOD_COLS]) set(col + r, { bold: true, bt: true });
  for (const r of [...PCT_ROWS]) set('A' + r, { it: true });
  for (const r of [5, 6, 7, 9, 12, 13, 14, 15]) set('A' + r, { indent: 1 });
  set('D23', { fmtStyle: 'custom', numFmt: HOUSE_FORMATS.check });
  sh.gridlines = false;
  sh.freeze = { r: 4, c: 1 };
  sh.colW = { 1: 200, ...Object.fromEntries(PERIOD_COLS.map(col => [col.charCodeAt(0) - 64, 96])) };
  return state;
}

const S1a = derive(S1raw, builtinFormats);
const S1b = derive(S1a, signConvention);
const S1c = derive(S1b, currencyPercentLines);
const S1d = derive(S1c, datesOnTheTimeline);
const S2a = derive(S1d, fourSections);
const S2b = derive(S2a, unitsInTheFormat);
const S2c = derive(S2b, dynamicHeaders);
const S2d = derive(S2c, conditionalCodes);
const Pdone = derive(S1raw, s => present(s));

export const STATES = { S1raw, S1a, S1b, S1c, S1d, S2a, S2b, S2c, S2d, Pdone };
export const STATE_ORDER = Object.keys(STATES);

/** A deep clone of a named state (runners mutate their copy, never the master). */
export function stateOf(id) {
  const s = STATES[id];
  if (!s) throw new Error('unknown workbook state ' + id);
  return clone(s);
}

/* ---------------- seeded clothing for the chapter's challenges ---------------- */

/**
 * A cluster's P&L for a challenge: the same lines and layout, the figures ±30% of the company's
 * and scaled to the cluster, one seeded fault position. Clothing and figures vary; the workload
 * never does. Returns { cluster, annual: [{row: value}], sites, title }.
 */
export function clusterPnl(rng) {
  const cluster = pickCluster(rng);
  const scale = (0.14 + rng() * 0.08);
  const jiggle = () => 0.7 + rng() * 0.6;
  const annual = ANNUAL.map(y => Object.fromEntries(LINE_ROWS.map(r => [r, r === 7 && !y[7] ? 0 : cents(y[r] * scale * jiggle())])));
  const base = 4 + Math.floor(rng() * 3);
  const sites = [base, base + 1 + Math.floor(rng() * 2), base + 3 + Math.floor(rng() * 2)];
  return { cluster, annual, sites, title: `Voltline - ${cluster.city} cluster P&L, FY24A to FY26E` };
}

/**
 * The seed patch the module 2.1 and 2.2 challenges share: a cluster's annual P&L over the
 * company's page — the title, the typed lines and the site count in B:D (blue: the deal team
 * coloured the inputs), the twelve month columns and the months check cleared so the page is
 * the three-year block alone. `rawSites` dresses the count as the export did ("$28.00");
 * `signed` types the cost lines negative, for a seed over S1b or later, where the page already
 * carries the sign convention. The key count is the same for every seed (the workload
 * invariant, LESSON_FRAMEWORK §8).
 */
export function clusterPatch(rng, { rawSites = false, signed = false } = {}) {
  const { annual, sites, title } = clusterPnl(rng);
  const patch = { 'P&L!A1': { value: title } };
  ANNUAL_COLS.forEach((col, k) => {
    for (const r of LINE_ROWS) {
      const v = annual[k][r];
      patch[`P&L!${col}${r}`] = { value: signed && COST_ROWS.includes(r) && v ? -v : v, fontColor: 'blue' };
    }
    patch[`P&L!${col}20`] = rawSites ? { value: sites[k], fontColor: 'blue', fmtStyle: 'currency', decimals: 2 } : { value: sites[k], fontColor: 'blue' };
  });
  for (const col of MONTH_COLS) for (let r = 4; r <= 21; r++) patch[`P&L!${col}${r}`] = null;
  patch['P&L!A23'] = null; patch['P&L!D23'] = null;
  return patch;
}
