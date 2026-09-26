// app2/content/workbooks/voltline-pnl.js — the Chapter 2 module workbook (Project Volt, stage 2).
// Voltline Charging Inc., company level: three years of P&L (FY24A, FY25A, FY26E) plus the twelve
// months of FY26, sent by management's finance team as a raw dump from the accounting system.
// Chapter 2 takes it to presentation quality for the information memorandum.
//
// Sheets: P&L (the page the buyer reads), Inputs (the deal team's assumptions), Monthly (FY26
// operating data by month) and Print (the one-page summary 2.7 builds; empty until then).
// P&L layout: A labels, B:D the three years, E a spacer, F:Q January to December 2026 — fifteen
// period columns and the labels inside the engine's 26.
//
// STATES chain the lessons exactly as voltline-weekly does (before → solution → after, asserted by
// tests/module-states.test.js and tests/pnl-states.test.js). Every state is DERIVED from the
// previous by a pure patch, and stateOf() hands out deep clones. `S1raw` is the dump as it arrived;
// `Pdone` is the presentation-quality end state the chapter builds toward (the 2.P project's after).
// Figures are deterministic (integer cents), so checks can read the sheet and assert exact numbers.
import { mulberry32 } from '../../engine/rng.js';
import { dateToSerial } from '../../engine/format.js';
import { pickCluster } from './clusters.js';
import { diffStates, sessionToState, PAGE_SETUP_DEFAULT } from './voltline-weekly.js';

export { diffStates, sessionToState, PAGE_SETUP_DEFAULT };

const clone = o => JSON.parse(JSON.stringify(o));
const cents = v => Math.round(v * 100) / 100;

/* ---------------- the layout ---------------- */

export const YEARS = ['FY24A', 'FY25A', 'FY26E'];
export const YEAR_NUMS = [2024, 2025, 2026];          // how the export heads its year columns (2.1.4 relabels them)
export const ANNUAL_COLS = ['B', 'C', 'D'];
export const MONTH_COLS = ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];
export const PERIOD_COLS = [...ANNUAL_COLS, ...MONTH_COLS];
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
  c.D23 = { formula: '=D8-SUM(F8:Q8)' };
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

/** The house number-format set (2.2): dash zeros, parentheses, the $ on first and total rows. */
export const HOUSE_FORMATS = {
  plain: '#,##0_);(#,##0);"-"_)',
  dollar: '$#,##0_);($#,##0);"-"_)',
  pct: '0.0%_);(0.0%);"-"_)',
  count: '#,##0_);(#,##0);"-"_)',
  perSite: '$#,##0,"k"_);($#,##0,"k");"-"_)',
  month: 'mmm-yy',
};
export const TITLE = 'Voltline Charging Inc. - Profit and loss, FY24A to FY26E';
export const UNITS_LINE = 'USD unless stated; costs shown as negatives';

/**
 * Take a P&L state to presentation quality: the costs negative and added, the house formats,
 * FY labels and month-end headers, bold totals with a top border, margins italic, the title
 * centred across the page, gridlines off, panes frozen at B5. Pure over a clone.
 */
export function present(state) {
  const sh = sheetOf(state, 'P&L'); const c = sh.cells;
  const set = (ref, patch) => { c[ref] = { ...(c[ref] || {}), ...patch }; };
  set('A1', { value: TITLE, bold: true, fsz: 16, ca: 17 });
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
  set('D23', { fmtStyle: 'custom', numFmt: '[Red]"ERROR";[Red]"ERROR";"OK"' });
  sh.gridlines = false;
  sh.freeze = { r: 4, c: 1 };
  sh.colW = { 1: 200, ...Object.fromEntries(PERIOD_COLS.map(col => [col.charCodeAt(0) - 64, 96])), 5: 16 };
  return state;
}
const Pdone = derive(S1raw, s => present(s));

export const STATES = { S1raw, Pdone };
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
