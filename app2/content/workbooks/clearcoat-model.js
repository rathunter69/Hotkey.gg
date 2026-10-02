// app2/content/workbooks/clearcoat-model.js — the Chapter 5 workbook (Project Rinse): Clearcoat
// Express's operating model, FY24A–FY31E, in USD thousands (script-ch5.md). Chapter 6 reads the same
// workbook for EBITDA and free cash flow, so its pages are left room for (the sheet list stays open
// past DCF). Every page is built once, solved, by buildPage (the sheet standard in code), and every
// lesson's start state is cut from the solved workbook by a pure patch that strips or plants what the
// lesson asks for. Nothing is retyped.
//
// Sheets, in the order the model calculates: Cover · Inputs · IS · CF · BS · Schedules · Checks · DCF,
// then the two Chapter 5.1 pages (One site, One week) and the accountants' Data tab (off the standard).
// The historical years read Data by name (INDEX/MATCH on the mapped label and the year); the projected
// years calculate from Inputs; one formula a row carries both through the projection flag. The
// revolver's interest on its average balance is the model's one circle, with Circ as its breaker.
import { buildPage, FMT } from './page.js';
import { Sheet } from '../../engine/sheet.js';
import { diffStates as diffCells, sessionToState as sessionCells } from './clearcoat-weekly.js';

export const CHAPTER = 5;
export const COLS = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const HIST_COLS = ['C', 'D', 'E'], PROJ_COLS = ['F', 'G', 'H', 'I', 'J'];
export const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031];
export const SHEET_ORDER = ['Cover', 'Inputs', 'IS', 'CF', 'BS', 'Schedules', 'Checks', 'DCF', 'One site', 'One week', 'Data'];
export const MODEL_SHEETS = SHEET_ORDER.slice(0, 8);
export const CASES = ['Management', 'Base', 'Downside'];
export const COMPANY = 'Clearcoat Express';
export const UNITS = 'USD thousands unless stated; fiscal years end December 31';
const serial = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000);
export const FIRST_YEAR_END = serial(2024, 12, 31), LAST_HISTORICAL = serial(2026, 12, 31), VALUATION_DATE = serial(2026, 12, 31);
const FY_FMT = { fmtStyle: 'custom', numFmt: '"FY"yy' }, DATE_FMT = { fmtStyle: 'custom', numFmt: 'm/d/yyyy' };
const MILLIONS = { fmtStyle: 'custom', numFmt: '#,##0.0,_);(#,##0.0,)' };
const NODASH = { fmtStyle: 'comma', decimals: 0 };
const prev = col => String.fromCharCode(col.charCodeAt(0) - 1);
const clone = v => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)));

/* ---------------- the historical years (FY23 opening, FY24A–FY26E), generated so they tie ---------------- */

/** The accounts as the Chapter 2 P&L has them, plus the balance sheet and cash flow behind them, rolled so every statement ties. */
export const HIST = (() => {
  const h = {
    sites: [24, 28, 34, 40], washes: [null, 2400, 2950, 3600], mwash: [null, 1200, 1475, 1800],
    retail: [null, 18000, 22000, 26000], club: [null, 14000, 17500, 22000], other: [null, 1000, 1500, 2000],
    chem: [null, 3960, 4920, 6000], labor: [null, 6600, 8200, 9500], rent1: [null, 3600, 4400, 5200], rent2: [null, 600, 700, 800],
    util: [null, 1650, 2050, 2400], maint: [null, 990, 1230, 1500], card: [null, 660, 820, 1000], mkt: [null, 660, 820, 1000], ho: [null, 4500, 5300, 6000],
    dep: [null, 3500, 4250, 5000], drawn: [null, 8000, 11500, 8000], repaid: [null, 3000, 3000, 3000],
    capexNew: [null, 10000, 15000, 15000], capexMaint: [null, 660, 820, 1000], dist: [null, 0, 0, 0],
    cash: [4000], rec: [220, 271, 337, 411], pay: [1250, 1539, 1902, 2252], def: [470, 575, 719, 904], land: [50000, 50000, 50000, 50000],
    ppe: [40270], loan: [41500], dd: [0, 0, 0, 0], rev: [0, 0, 0, 0], equity: [51270],
    interest: [null], ebitda: [null], ebt: [null], tax: [null], ni: [null], cfo: [null], capex: [null], cfi: [null], cff: [null], net: [null], revenue: [null], cos: [null], siteCosts: [null],
  };
  for (let i = 1; i <= 3; i++) {
    h.loan[i] = h.loan[i - 1] + h.drawn[i] - h.repaid[i];
    h.interest[i] = Math.round(0.07 * (h.loan[i - 1] + h.loan[i]) / 2);
    h.revenue[i] = h.retail[i] + h.club[i] + h.other[i];
    h.cos[i] = h.chem[i];
    h.siteCosts[i] = h.labor[i] + h.rent1[i] + h.rent2[i] + h.util[i] + h.maint[i] + h.card[i] + h.mkt[i];
    h.ebitda[i] = h.revenue[i] - h.cos[i] - h.siteCosts[i] - h.ho[i];
    h.ebt[i] = h.ebitda[i] - h.dep[i] - h.interest[i];
    h.tax[i] = Math.round(0.25 * h.ebt[i]);
    h.ni[i] = h.ebt[i] - h.tax[i];
    h.capex[i] = h.capexNew[i] + h.capexMaint[i];
    h.ppe[i] = h.ppe[i - 1] + h.capex[i] - h.dep[i];
    h.cfo[i] = h.ni[i] + h.dep[i] - (h.rec[i] - h.rec[i - 1]) + (h.pay[i] - h.pay[i - 1]) + (h.def[i] - h.def[i - 1]);
    h.cfi[i] = -h.capex[i];
    h.cff[i] = h.drawn[i] - h.repaid[i] - h.dist[i];
    h.net[i] = h.cfo[i] + h.cfi[i] + h.cff[i];
    h.cash[i] = h.cash[i - 1] + h.net[i];
    h.equity[i] = h.equity[i - 1] + h.ni[i] - h.dist[i];
  }
  return h;
})();

/** The Data tab's lines, in the accountants' order: [label, HIST key]. Two accounts are both called Rent (5.2.5 goal 5). */
export const DATA_LINES = [
  ['Retail wash sales', 'retail'], ['Unlimited club fees', 'club'], ['Other income', 'other'],
  ['Chemicals, water and power', 'chem'], ['Site wages and benefits', 'labor'], ['Rent', 'rent1'], ['Rent', 'rent2'],
  ['Utilities', 'util'], ['Repairs and maintenance', 'maint'], ['Merchant card fees', 'card'], ['Advertising', 'mkt'],
  ['Head office costs', 'ho'], ['Depreciation', 'dep'], ['Interest expense', 'interest'], ['Income tax', 'tax'],
  ['Cash at bank', 'cash'], ['Trade receivables', 'rec'], ['Land (at cost)', 'land'], ['Buildings and equipment, net', 'ppe'],
  ['Trade payables', 'pay'], ['Deferred club revenue', 'def'], ['Term loan', 'loan'], ['Delayed-draw loan', 'dd'], ['Revolving facility', 'rev'],
  ["Owners' equity", 'equity'],
  ['Additions: new sites', 'capexNew'], ['Additions: maintenance', 'capexMaint'], ['Term loan drawn', 'drawn'], ['Term loan repaid', 'repaid'], ['Distributions paid', 'dist'],
  ['Sites at year end', 'sites'], ['Washes (thousands)', 'washes'], ['Member washes (thousands)', 'mwash'],
];
/** The model's line names against the accountants' (Inputs!M:N, 5.2.5 goal 1). */
export const MAPPING = [
  ['Retail revenue', 'Retail wash sales'], ['Membership revenue', 'Unlimited club fees'], ['Other revenue', 'Other income'],
  ['Cost of sales', 'Chemicals, water and power'], ['Labor', 'Site wages and benefits'], ['Rent', 'Rent'], ['Utilities', 'Utilities'],
  ['Repairs and maintenance', 'Repairs and maintenance'], ['Card fees', 'Merchant card fees'], ['Marketing', 'Advertising'],
  ['Head office', 'Head office costs'], ['Depreciation', 'Depreciation'], ['Interest', 'Interest expense'], ['Tax', 'Income tax'],
];
const DATA_VALS = 'Data!$C$5:$F$44', DATA_LABELS = 'Data!$B$5:$B$44', DATA_YEARS = 'Data!$C$4:$F$4';
/** The Data lookup for the line whose accountants' label sits in column A of row r, the year in the column's header, `back` years earlier. */
const dat = (r, col, back = 0) => `INDEX(${DATA_VALS},MATCH($A${r},${DATA_LABELS},0),MATCH(YEAR(${col}$4)${back ? '-' + back : ''},${DATA_YEARS},0))`;
/** The same for a label that appears twice on Data (the two Rent accounts): SUMIFS on label and year. */
const datSum = (r, col) => `SUMIFS(INDEX(${DATA_VALS},0,MATCH(YEAR(${col}$4),${DATA_YEARS},0)),${DATA_LABELS},$A${r})`;

/* ---------------- the pages ---------------- */

// Rows are keyed; R(sheet, key) is the row a keyed line landed on, known after a first layout pass
// (the layout never depends on the formulas, so the second pass writes the real references).
let ROWS = {};
let firstPass = true;
const R = (sheet, key) => {
  const t = ROWS[sheet];
  if (!t || !(key in t)) { if (firstPass) return 1; throw new Error(`no row ${sheet}.${key}`); }
  return t[key];
};
const inp = key => `Inputs!$C$${R('Inputs', key)}`;
const live = (key, col) => `Inputs!${col}$${R('Inputs', key)}`;
const flag = col => `Inputs!${col}$${R('Inputs', 'flag')}`;
const pcnt = col => `Inputs!${col}$${R('Inputs', 'pcnt')}`;
const per = col => `Inputs!${col}$${R('Inputs', 'per')}`;
const xs = (sheet, key, col) => `${sheet}!${col}${R(sheet, key)}`;
/** One formula a row: the actual through the flag, else the calculation. */
const viaFlag = (col, actual, calc) => `=IF(${flag(col)}=0,${actual},${calc})`;
const only = (cols, fn) => (col, r) => cols.includes(col) ? fn(col, r) : null;
const firstCol = fn => only(['C'], fn);
const across = fn => (col, r) => COLS.includes(col) ? fn(col, r) : null;

/**
 * Build a page spec with the model's row conveniences: a row may carry `a` (the accountants' label
 * typed in the helper column, or `true` for the mapped-label formula on the IS), `green` (every figure
 * in the row is a link: colored green whatever else it reads), `fmt` (a format patch on its figures),
 * `nodash` (a flag or counter shows its zero), `boldAt` (columns shown bold). Returns the sheet.
 */
function page(spec) {
  if (firstPass) { ROWS[spec.name] = dryRows(spec); return null; }   // the layout pass needs only where the rows land
  const { sheet, at } = buildPage(spec);
  const cells = sheet.cells;
  ROWS[spec.name] = at;
  const figCols = Object.keys(cells).filter(k => /^[C-Z]4$/.test(k)).map(k => k[0]);
  const allCols = figCols.length ? figCols : ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  for (const b of spec.blocks) for (const row of b.rows) {
    if (!row.key) continue;
    const r = at[row.key];
    // a row's format patch reaches every figure, whether or not the timeline is on row 4 yet (a date row reads as a date)
    if (row.fmt) for (const col of ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']) if (cells[col + r]) { Object.assign(cells[col + r], row.fmt); if (row.fmt.numFmt) delete cells[col + r].decimals; }
    if (row.a === true) cells['A' + r] = { formula: `=INDEX(Inputs!$N$5:$N$40,MATCH($B${r},Inputs!$M$5:$M$40,0))` };
    else if (typeof row.a === 'string') cells['A' + r] = { value: row.a };
    for (const col of allCols) {
      const c = cells[col + r]; if (!c) continue;
      if (row.green && c.formula && c.formula.includes('!')) c.fontColor = 'green';
      if (row.nodash) Object.assign(c, NODASH);
      if (row.boldAt && row.boldAt.includes(col)) c.bold = true;
    }
  }
  if (spec.rows) sheet.rows = spec.rows;
  if (spec.condFmt) sheet.condFmt = clone(spec.condFmt);
  if (spec.colWExtra) Object.assign(sheet.colW, spec.colWExtra);
  return sheet;
}
/** Where buildPage will put each keyed row (its first pass, without building the sheet): one empty row between blocks, a title row, a header row, then the rows. */
function dryRows(spec) {
  const at = {}; let r = 5;
  spec.blocks.forEach((b, bi) => { if (bi > 0) r++; if (b.title) r++; if (b.header) r++; for (const row of b.rows) { if (row.key) at[row.key] = r; r++; } });
  return at;
}
/** The timeline row on a model sheet: links to Inputs row 4, green, in the FY format. */
function timeline(sheet, cols = COLS) {
  if (!sheet) return;
  for (const col of cols) sheet.cells[col + '4'] = { formula: `=Inputs!${col}4`, fontColor: 'green', bold: true, align: 'r', ...FY_FMT };
}
/** A page title that names the case: Company: page, Case case. */
const caseTitle = what => `=${inp('company')}&": ${what}, "&Cover!$C$${R('Cover', 'case')}&" case"`;
const titled = (sheet, formula) => { if (!sheet) return; sheet.cells.A1 = { ...sheet.cells.A1, formula, value: undefined }; delete sheet.cells.A1.value; };

/* ---- Cover ---- */
/** The Cover; `extraLinks` ([name, note] pairs) are the sheets a later chapter adds to the map (Chapter 6's valuation pages). */
function pageCover(extraLinks = []) {
  const sheet = page({
    name: 'Cover', chapter: CHAPTER, title: `${COMPANY}: operating model`, units: 'USD thousands unless stated; the case switch, the checks flag and the map of the sheets',
    headers: ['Setting', 'Note'], labelHeader: 'Cover',
    blocks: [
      { rows: [
        { key: 'case', label: 'Case (type Management, Base or Downside)', values: ['Base', 'the switch the whole model reads'], fmt: { fontColor: 'blue' } },
        { key: 'casen', label: 'Case number', kind: 'count', fill: firstCol(() => `=MATCH(C${R('Cover', 'case')},C${R('Cover', 'c1')}:C${R('Cover', 'c3')},0)`), nodash: true },
        { key: 'flag', label: 'Checks flag', kind: 'text', fill: firstCol(() => `=Checks!C${R('Checks', 'flag')}`), green: true },
        { key: 'diff', label: 'Checks: sum of absolute differences', kind: 'count', fill: firstCol(() => `=Checks!C${R('Checks', 'rollup')}`) },
      ] },
      { title: 'Sheets', rows: [
        ['Inputs', 'every typed number, the drivers block, the timeline'], ['IS', 'income statement'], ['CF', 'cash flow statement, indirect'], ['BS', 'balance sheet'],
        ['Schedules', 'rollout and revenue, costs, working capital, PP&E, debt, tax'], ['Checks', 'one row per check, the roll-up flag'], ['DCF', 'free cash flow, WACC, terminal value, enterprise value'],
        ['One site', 'Domain for one month, three statements by hand (5.1)'], ['One week', 'Domain for one week, six events (5.1.6)'], ['Data', 'the historical accounts as the accountants sent them'],
        ...extraLinks,
      ].map(([name, note], i) => ({ key: 'link' + i, label: name, kind: 'text', values: [`=HYPERLINK("#'${name}'!A1","${name}")`, note] })) },
      { title: 'Cases', rows: CASES.map((c, i) => ({ key: 'c' + (i + 1), label: `Case ${i + 1}`, kind: 'text', values: [c] })) },
      { title: 'Names', rows: [
        { key: 'n1', label: 'Case', kind: 'text', values: ['Cover!$C$6', 'the case number the drivers block reads'] },
        { key: 'n2', label: 'LastHistorical', kind: 'text', values: [`Inputs!$C$${R('Inputs', 'lasthist')}`, 'the last historical year end'] },
        { key: 'n3', label: 'Circ', kind: 'text', values: [`Inputs!$C$${R('Inputs', 'circ')}`, 'the circularity breaker'] },
        { key: 'n4', label: 'WACC', kind: 'text', values: [`DCF!$C$${R('DCF', 'wacc')}`, 'the discount rate'] },
      ] },
    ],
    source: 'The names list is what Formulas, Name Manager shows (F3 pastes it).',
  });
  titled(sheet, `=${inp('company')}&": operating model, "&C${R('Cover', 'case')}&" case"`);
  return sheet;
}

/* ---- Inputs ---- */
const DRIVERS = [
  ['New', 'New sites a year (sites)', 'count', [6, 6, 4]],
  ['Wash', 'Washes a day per mature site (washes)', 'count', [260, 250, 235]],
  ['Tick', 'Retail ticket growth (%)', 'pct', [0.03, 0.02, 0]],
  ['Share', 'Member share of washes (%)', 'pct', [0.52, 0.5, 0.47]],
  ['Cos', 'Cost of a wash (% of revenue)', 'pct', [0.115, 0.12, 0.13]],
];
const CASE_KEYS = ['m', 'b', 'd'];
function driverBlock(ci) {
  const k = CASE_KEYS[ci];
  return { title: `Drivers: ${CASES[ci]} case (FY27 to FY31)`, rows: DRIVERS.map(([key, label, kind, vals]) => {
    const v = vals[ci];
    // a driver held flat (the Downside's ticket growth) is typed once and each later year points at the one before (5.2.6 goal 1)
    if (ci === 2 && key === 'Tick') return { key: k + key, label, kind, fill: only(PROJ_COLS, (col, r) => col === 'F' ? v : `=${prev(col)}${r}`) };
    return { key: k + key, label, kind, values: [null, null, null, v, v, v, v, v] };
  }) };
}
function pageInputs() {
  const sheet = page({
    name: 'Inputs', chapter: CHAPTER, read: false, title: `${COMPANY}: operating model inputs`, units: 'USD thousands unless stated; typed inputs blue; the live drivers block is what the schedules read',
    headers: [null, null, null, null, null, null, null, null],
    blocks: [
      { rows: [
        { key: 'ae', label: 'Actual or estimate', kind: 'text', values: ['A', 'A', 'E', 'E', 'E', 'E', 'E', 'E'] },
        { key: 'flag', label: 'Projection flag (1 projected, 0 historical)', kind: 'count', fill: across(col => `=IF(${col}$4>LastHistorical,1,0)`), nodash: true },
        { key: 'per', label: 'Period counter', kind: 'count', fill: across((col, r) => col === 'C' ? 1 : `=${prev(col)}${r}+1`), nodash: true },
        { key: 'pcnt', label: 'Projection counter (1 in the first projected year)', kind: 'count', fill: across((col, r) => `=IF(${col}${R('Inputs', 'flag')}=1,MAX(${prev(col)}${r},0)+1,0)`), nodash: true },
        { key: 'cols', label: 'Column counter (COLUMNS)', kind: 'count', fill: across(col => `=COLUMNS($C4:${col}4)`), nodash: true },
        { key: 'ccheck', label: 'Counter check (reads zero)', kind: 'count', fill: across((col, r) => `=${col}${R('Inputs', 'cols')}-${col}${R('Inputs', 'per')}`), nodash: true },
        { key: 'lasthist', label: 'Last historical year end (LastHistorical)', values: [LAST_HISTORICAL], fmt: DATE_FMT },
      ] },
      driverBlock(0), driverBlock(1), driverBlock(2),
      { title: 'Drivers: live block (the case the Cover names; the schedules read this block only)', rows: DRIVERS.map(([key, label, kind]) => {
        const actual = { New: 'newSites', Wash: 'washDay', Tick: 'tickGrowth', Share: 'share', Cos: 'cosShare' }[key];
        return { key: 'l' + key, label, kind, green: true, fill: across(col => viaFlag(col, xs('Schedules', actual, col), `CHOOSE(Case,${col}${R('Inputs', 'm' + key)},${col}${R('Inputs', 'b' + key)},${col}${R('Inputs', 'd' + key)})`)) };
      }) },
      { title: 'Rollout and revenue', rows: [
        { key: 'newWash', label: 'Washes a day per new site, while it ramps (washes)', kind: 'count', values: [200] },
        { key: 'days', label: 'Days in the year', kind: 'count', values: [365] },
        { key: 'fee', label: 'Membership fee ($ a month)', kind: 'unit', dollar: true, values: [30] },
        { key: 'wpm', label: 'Washes per member a month', kind: 'unit', values: [2.5] },
        { key: 'other', label: 'Other revenue (% of retail revenue)', kind: 'pct', values: [0.075] },
        { key: 'units', label: 'Washes are carried in thousands (units)', kind: 'count', values: [1000] },
      ] },
      { title: 'Costs', rows: [
        { key: 'labor', label: 'Labor per average site, FY26 ($k)', values: [257] },
        { key: 'rent', label: 'Rent per average site, FY26 ($k)', values: [162] },
        { key: 'util', label: 'Utilities per average site, FY26 ($k)', values: [65] },
        { key: 'maint', label: 'Maintenance per average site, FY26 ($k)', values: [41] },
        { key: 'infl', label: 'Cost inflation (% a year)', kind: 'pct', values: [0.03] },
        { key: 'card', label: 'Card fees (% of revenue)', kind: 'pct', values: [0.02] },
        { key: 'mkt', label: 'Marketing (% of revenue)', kind: 'pct', values: [0.02] },
        { key: 'hoG', label: 'Head office growth (% a year)', kind: 'pct', values: [0.03] },
        { key: 'hoStep', label: 'Head office step per new site ($k)', values: [50] },
      ] },
      { title: 'Capital expenditure', rows: [
        { key: 'capexSite', label: 'Capex per new site: building, tunnel, equipment ($k)', values: [2500] },
        { key: 'maintCapex', label: 'Maintenance capex (% of revenue)', kind: 'pct', values: [0.02] },
        { key: 'life', label: 'Depreciation life of new capex (years)', kind: 'count', values: [20] },
        { key: 'gross', label: 'Gross depreciable PP&E at FY26, land excluded ($k)', values: [102480] },
        { key: 'remLife', label: 'Remaining life of the FY26 base (years)', kind: 'count', values: [14] },
      ] },
      { title: 'Working capital (days on the closing balance)', rows: [
        { key: 'recDays', label: 'Receivable days (of revenue)', kind: 'count', values: [3] },
        { key: 'payDays', label: 'Payable days (of cost of sales and site costs)', kind: 'count', values: [30] },
        { key: 'defDays', label: 'Deferred revenue days (of membership revenue)', kind: 'count', values: [15] },
      ] },
      { title: 'Debt, cash and tax', rows: [
        { key: 'termRate', label: 'Term loan rate', kind: 'pct', values: [0.07] },
        { key: 'termAmort', label: 'Term loan amortization ($k a year)', values: [3000] },
        { key: 'ddDraw', label: 'Delayed-draw loan drawn ($k)', values: [null, null, null, 12500, 12500, 0, 0, 0] },
        { key: 'ddRate', label: 'Delayed-draw loan rate', kind: 'pct', values: [0.075] },
        { key: 'ddAmort', label: 'Delayed-draw amortization (% of draws to date, a year)', kind: 'pct', values: [0.1] },
        { key: 'revRate', label: 'Revolver rate', kind: 'pct', values: [0.08] },
        { key: 'depRate', label: 'Deposit rate on cash (nil)', kind: 'pct', values: [0] },
        { key: 'minCash', label: 'Minimum cash ($k)', values: [5000] },
        { key: 'circ', label: 'Circularity breaker, Circ (1 interest on the average, 0 on the opening)', kind: 'count', values: [1], nodash: true },
        { key: 'closures', label: 'Site closures (sites)', kind: 'count', values: [null, null, null, 0, 0, 0, 0, 0] },
        { key: 'dist', label: 'Distributions to owners ($k, nil)', values: [null, null, null, 0, 0, 0, 0, 0] },
        { key: 'tax', label: 'Tax rate', kind: 'pct', values: [0.25] },
      ] },
      { title: 'DCF', rows: [
        { key: 'valDate', label: 'Valuation date', values: [VALUATION_DATE], fmt: DATE_FMT },
        { key: 'rf', label: 'Risk-free rate', kind: 'pct', values: [0.04, 'US 10-year Treasury, per management'] },
        { key: 'erp', label: 'Equity risk premium', kind: 'pct', values: [0.06, 'per management'] },
        { key: 'beta', label: 'Beta', kind: 'unit', values: [1.2, 'listed operators, unlevered and relevered at the 40% target'] },
        { key: 'size', label: 'Size premium', kind: 'pct', values: [0.02, 'per management: Clearcoat is far smaller than the listed operators'] },
        { key: 'cod', label: 'Cost of debt', kind: 'pct', values: [0.07, 'the term loan rate'] },
        { key: 'debtW', label: 'Debt weight (target)', kind: 'pct', values: [0.4, 'target capital structure'] },
        { key: 'exit', label: 'Exit multiple (x FY31 EBITDA)', kind: 'mult', values: [11, 'listed operators and precedent deals (6.1, 6.2)'] },
        { key: 'growth', label: 'Perpetuity growth', kind: 'pct', values: [0.03, 'long-run growth of the economy'] },
        { key: 'tvMethod', label: 'Terminal method (1 perpetuity, 2 exit multiple)', kind: 'count', values: [2] },
        { key: 'mid', label: 'Mid-year convention (1 on, 0 off)', kind: 'count', values: [1], nodash: true },
        { key: 'termWC', label: 'Steady-state working capital cash effect ($k a year)', values: [100] },
        { key: 'stepW', label: 'Sensitivity step, WACC', kind: 'pct', values: [0.005] },
        { key: 'stepG', label: 'Sensitivity step, growth', kind: 'pct', values: [0.005] },
        { key: 'stepM', label: 'Sensitivity step, exit multiple (x)', kind: 'mult', values: [1] },
      ] },
      { title: 'Titles', rows: [{ key: 'company', label: 'Company', kind: 'text', values: [COMPANY] }] },
    ],
    source: 'Historical figures are on the Data tab; the Chapter 2 P&L is the source of FY24 to FY26.',
    extra: Object.assign({ M4: { value: 'Model line', bold: true }, N4: { value: "Accountants' label", bold: true } },
      ...MAPPING.map(([m, n], i) => ({ ['M' + (5 + i)]: { value: m }, ['N' + (5 + i)]: { value: n } }))),
    colWExtra: { 13: 170, 14: 200 },
  });
  if (!sheet) return null;
  // the timeline: the first year end typed once, the rest EOMONTH twelve months on (5.2.2)
  sheet.cells.C4 = { value: FIRST_YEAR_END, fontColor: 'blue', bold: true, align: 'r', ...FY_FMT };
  for (const col of COLS.slice(1)) sheet.cells[col + '4'] = { formula: `=EOMONTH(${prev(col)}4,12)`, bold: true, align: 'r', ...FY_FMT };
  sheet.cells['B4'] = { value: 'Timeline', bold: true };
  // the active case lights up on its block (5.2.6 goal 6)
  sheet.condFmt = CASE_KEYS.map((k, i) => ({ kind: 'formula', formula: `=Case=${i + 1}`, range: `B${R('Inputs', k + 'New') - 1}:J${R('Inputs', k + 'Cos')}`, style: 'yellow' }));
  return sheet;
}

/* ---- IS ---- */
function pageIS() {
  const me = 'IS';
  const c = (key, col) => col + R(me, key);
  // a line that reads Data (through its mapped label) in the actual years and a schedule line after
  const line = (key, label, sched, { neg = false, sum = false, indent = 1 } = {}) => ({
    key, label, indent, a: true, green: true,
    fill: across((col, r) => viaFlag(col, (neg ? '-' : '') + (sum ? datSum(r, col) : dat(r, col)), (neg ? '-' : '') + xs('Schedules', sched, col))),
  });
  const total = (key, label, expr, extra = {}) => ({ key, label, total: true, fill: across((col, r) => expr(col, r)), ...extra });
  const margin = (key, label, num) => ({ key, label, kind: 'pct', indent: 1, fill: across(col => `=IFERROR(${c(num, col)}/${c('rev', col)},"-")`) });
  const sheet = page({
    name: me, chapter: CHAPTER, title: 'Income statement', units: UNITS,
    headers: COLS.map(() => null),
    blocks: [
      { rows: [
        line('retail', 'Retail revenue', 'retailRev'),
        line('club', 'Membership revenue', 'clubRev'),
        line('other', 'Other revenue', 'otherRev'),
        total('rev', 'Total revenue', (col, r) => `=SUM(${c('retail', col)}:${c('other', col)})`),
        line('cos', 'Cost of sales', 'cos', { neg: true }),
        total('gp', 'Gross profit', col => `=${c('rev', col)}+${c('cos', col)}`),
        margin('gm', 'Gross margin', 'gp'),
      ] },
      { rows: [
        line('labor', 'Labor', 'labor', { neg: true }),
        line('rent', 'Rent', 'rent', { neg: true, sum: true }),
        line('util', 'Utilities', 'util', { neg: true }),
        line('maint', 'Repairs and maintenance', 'maint', { neg: true }),
        line('card', 'Card fees', 'card', { neg: true }),
        line('mkt', 'Marketing', 'mkt', { neg: true }),
        total('siteCosts', 'Site costs', col => `=SUM(${c('labor', col)}:${c('mkt', col)})`),
        total('contrib', 'Site contribution', col => `=${c('gp', col)}+${c('siteCosts', col)}`),
        margin('cm', 'Contribution margin', 'contrib'),
      ] },
      { rows: [
        line('ho', 'Head office', 'ho', { neg: true }),
        total('ebitda', 'EBITDA', col => `=${c('contrib', col)}+${c('ho', col)}`),
        margin('em', 'EBITDA margin', 'ebitda'),
        line('dep', 'Depreciation', 'dep', { neg: true }),
        total('ebit', 'EBIT', col => `=${c('ebitda', col)}+${c('dep', col)}`),
        line('int', 'Interest', 'totalInt', { neg: true }),
        total('ebt', 'Earnings before tax', col => `=${c('ebit', col)}+${c('int', col)}`),
        line('tax', 'Tax', 'taxCharge', { neg: true }),
        total('ni', 'Net income', col => `=${c('ebt', col)}+${c('tax', col)}`, { final: true }),
        margin('nm', 'Net margin', 'ni'),
      ] },
    ],
    source: 'FY24 to FY26 read the Data tab by name (INDEX/MATCH on the mapped label and the year); FY27 on read Schedules.',
  });
  timeline(sheet);
  titled(sheet, caseTitle('income statement'));
  return sheet;
}

/* ---- CF ---- */
function pageCF() {
  const me = 'CF';
  const c = (key, col) => col + R(me, key);
  const link = (key, label, expr, extra = {}) => ({ key, label, indent: 1, green: true, fill: across(col => expr(col)), ...extra });
  const total = (key, label, expr, extra = {}) => ({ key, label, total: true, fill: across((col, r) => expr(col, r)), ...extra });
  const sheet = page({
    name: me, chapter: CHAPTER, title: 'Cash flow statement', units: 'USD thousands unless stated; cash in positive, cash out negative',
    headers: COLS.map(() => null),
    blocks: [
      { title: 'Operations', rows: [
        link('ni', 'Net income', col => `=${xs('IS', 'ni', col)}`),
        link('dep', 'Depreciation added back', col => `=${xs('Schedules', 'dep', col)}`),
        link('chgRec', 'Change in receivables', col => `=${xs('Schedules', 'chgRec', col)}`),
        link('chgPay', 'Change in payables', col => `=${xs('Schedules', 'chgPay', col)}`),
        link('chgDef', 'Change in deferred revenue', col => `=${xs('Schedules', 'chgDef', col)}`),
        total('cfo', 'Cash from operations', col => `=SUM(${c('ni', col)}:${c('chgDef', col)})`),
      ] },
      { title: 'Investing', rows: [
        link('capex', 'Capital expenditure', col => `=-${xs('Schedules', 'capexTotal', col)}`),
        total('cfi', 'Cash from investing', col => `=${c('capex', col)}`),
      ] },
      { title: 'Financing', rows: [
        link('termDrawn', 'Term loan drawn', col => `=${xs('Schedules', 'termDrawn', col)}`),
        link('termRepaid', 'Term loan repaid', col => `=${xs('Schedules', 'termRepaid', col)}`),
        link('ddDrawn', 'Delayed-draw loan drawn', col => `=${xs('Schedules', 'ddDrawn', col)}`),
        link('ddRepaid', 'Delayed-draw loan repaid', col => `=${xs('Schedules', 'ddRepaid', col)}`),
        { key: 'dist', label: 'Distributions to owners', indent: 1, a: 'Distributions paid', green: true, fill: across((col, r) => viaFlag(col, '-' + dat(r, col), `-${live('dist', col)}`)) },
        { key: 'cbr', label: 'Cash before the revolver (memo: opening cash plus every line above)', fill: across(col => `=${c('open', col)}+${c('cfo', col)}+${c('cfi', col)}+SUM(${c('termDrawn', col)}:${c('dist', col)})`) },
        link('rev', 'Revolver drawn less repaid', col => `=${xs('Schedules', 'revDrawn', col)}+${xs('Schedules', 'revRepaid', col)}`),
        total('cff', 'Cash from financing', col => `=SUM(${c('termDrawn', col)}:${c('dist', col)})+${c('rev', col)}`),
      ] },
      { title: 'Cash', rows: [
        total('net', 'Net change in cash', col => `=${c('cfo', col)}+${c('cfi', col)}+${c('cff', col)}`),
        { key: 'open', label: 'Opening cash', indent: 1, a: 'Cash at bank', fill: across((col, r) => `=IF(${per(col)}=1,${dat(r, col, 1)},${prev(col)}${R(me, 'close')})`) },
        total('close', 'Closing cash', col => `=${c('open', col)}+${c('net', col)}`, { final: true }),
      ] },
    ],
    source: 'Every line is a link: the IS and Schedules carry the history through the projection flag. The revolver reads cash before the revolver.',
  });
  timeline(sheet);
  titled(sheet, caseTitle('cash flow statement'));
  return sheet;
}

/* ---- BS ---- */
function pageBS() {
  const me = 'BS';
  const c = (key, col) => col + R(me, key);
  const link = (key, label, expr, extra = {}) => ({ key, label, indent: 1, green: true, fill: across(col => expr(col)), ...extra });
  const total = (key, label, expr, extra = {}) => ({ key, label, total: true, fill: across((col, r) => expr(col, r)), ...extra });
  const sheet = page({
    name: me, chapter: CHAPTER, title: 'Balance sheet', units: 'USD thousands unless stated; at the year end; most liquid first, soonest due first',
    headers: COLS.map(() => null),
    blocks: [
      { title: 'Assets', rows: [
        link('cash', 'Cash', col => `=${xs('CF', 'close', col)}`),
        link('rec', 'Receivables', col => `=${xs('Schedules', 'rec', col)}`),
        { key: 'land', label: 'Land, at cost', indent: 1, a: 'Land (at cost)', fill: across((col, r) => viaFlag(col, dat(r, col), `${prev(col)}${r}`)) },
        link('ppe', 'Buildings and equipment, net', col => `=${xs('Schedules', 'ppeClose', col)}`),
        total('ta', 'Total assets', col => `=SUM(${c('cash', col)}:${c('ppe', col)})`),
      ] },
      { title: 'Liabilities', rows: [
        link('pay', 'Payables', col => `=${xs('Schedules', 'pay', col)}`),
        link('def', 'Deferred club revenue', col => `=${xs('Schedules', 'def', col)}`),
        link('term', 'Term loan', col => `=${xs('Schedules', 'termClose', col)}`),
        link('dd', 'Delayed-draw loan', col => `=${xs('Schedules', 'ddClose', col)}`),
        link('rev', 'Revolver', col => `=${xs('Schedules', 'revClose', col)}`),
        total('tl', 'Total liabilities', col => `=SUM(${c('pay', col)}:${c('rev', col)})`),
      ] },
      { title: 'Equity', rows: [
        { key: 'openEq', label: 'Opening equity', indent: 1, a: "Owners' equity", fill: across((col, r) => `=IF(${per(col)}=1,${dat(r, col, 1)},${prev(col)}${R(me, 'closeEq')})`) },
        link('ni', 'Net income', col => `=${xs('IS', 'ni', col)}`),
        link('dist', 'Distributions to owners', col => `=${xs('CF', 'dist', col)}`),
        total('closeEq', 'Closing equity', col => `=SUM(${c('openEq', col)}:${c('dist', col)})`),
        total('tle', 'Total liabilities and equity', col => `=${c('tl', col)}+${c('closeEq', col)}`, { final: true }),
      ] },
      { title: 'Checks', rows: [
        { key: 'check', label: 'Balance check: assets less liabilities and equity', kind: 'count', indent: 1, fill: across(col => `=ROUND(${c('ta', col)}-${c('tle', col)},2)`) },
      ] },
    ],
    source: 'Cash is the cash flow statement\'s closing line, never typed; the check reads zero when every link upstream is right.',
  });
  timeline(sheet);
  titled(sheet, caseTitle('balance sheet'));
  return sheet;
}

/* ---- Schedules ---- */
function pageSchedules() {
  const me = 'Schedules';
  const c = (key, col) => col + R(me, key);
  const ca = (key, col) => `${col}$${R(me, key)}`;
  const total = (key, label, expr, extra = {}) => ({ key, label, total: true, fill: across((col, r) => expr(col, r)), ...extra });
  const row = (key, label, expr, extra = {}) => ({ key, label, indent: 1, fill: across((col, r) => expr(col, r)), ...extra });
  const perSite = (key, label, dataLabel, input, sum = false) => row(key, label, (col, r) => viaFlag(col, sum ? datSum(r, col) : dat(r, col), `${inp(input)}*(1+${inp('infl')})^${pcnt(col)}*${c('avgSites', col)}`), { a: dataLabel });
  const tranche = (prefix, title, dataLabel, { drawn, repaid, rate, interestActual, extraRows = [], drawnLabel, repaidLabel }) => ({ title, rows: [
    row(prefix + 'Open', 'Opening balance', (col, r) => viaFlag(col, dat(r, col, 1), `${prev(col)}${R(me, prefix + 'Close')}`), { a: dataLabel }),
    ...extraRows,
    row(prefix + 'Drawn', 'Drawn', drawn, { a: drawnLabel }),
    row(prefix + 'Repaid', 'Repaid', repaid, { a: repaidLabel }),
    total(prefix + 'Close', 'Closing balance', (col, r) => viaFlag(col, dat(r, col), `${c(prefix + 'Open', col)}+${c(prefix + 'Drawn', col)}+${c(prefix + 'Repaid', col)}`), { a: dataLabel }),
    row(prefix + 'Avg', 'Average balance', col => `=AVERAGE(${c(prefix + 'Open', col)},${c(prefix + 'Close', col)})`),
    row(prefix + 'Int', 'Interest (rate on the average when Circ is 1, on the opening when 0)', (col, r) => viaFlag(col, interestActual(col, r), `IF(Circ=1,${inp(rate)}*${c(prefix + 'Avg', col)},${inp(rate)}*${c(prefix + 'Open', col)})`), { a: interestActual === zero ? undefined : 'Interest expense' }),
    row(prefix + 'Eff', 'Effective rate (interest over the average balance)', col => `=IFERROR(${c(prefix + 'Int', col)}/${c(prefix + 'Avg', col)},0)`, { kind: 'pct' }),
  ] });
  const zero = () => '0';
  const sheet = page({
    name: me, chapter: CHAPTER, read: false, rows: 160, title: 'Schedules', units: UNITS,
    headers: COLS.map(() => null),
    blocks: [
      { title: 'Rollout (sites)', rows: [
        row('openSites', 'Opening sites', (col, r) => viaFlag(col, dat(r, col, 1), `${prev(col)}${R(me, 'closeSites')}`), { a: 'Sites at year end', kind: 'count' }),
        row('newSites', 'New sites (live drivers)', (col, r) => viaFlag(col, `${dat(r, col)}-${dat(r, col, 1)}`, live('lNew', col)), { a: 'Sites at year end', kind: 'count' }),
        row('closures', 'Site closures', col => viaFlag(col, '0', `-${live('closures', col)}`), { kind: 'count' }),
        total('closeSites', 'Closing sites', (col, r) => viaFlag(col, dat(r, col), `${c('openSites', col)}+${c('newSites', col)}+${c('closures', col)}`), { a: 'Sites at year end', kind: 'count' }),
        row('avgSites', 'Average sites in the year', col => `=AVERAGE(${c('openSites', col)},${c('closeSites', col)})`, { kind: 'unit' }),
      ] },
      { title: 'Revenue build', rows: [
        row('washDayM', 'Washes a day per mature site (live drivers)', col => `=${live('lWash', col)}`, { kind: 'count', green: true }),
        row('washDayN', 'Washes a day per new site', col => `=${inp('newWash')}`, { kind: 'count', green: true }),
        row('washes', 'Washes (thousands)', (col, r) => viaFlag(col, dat(r, col), `(${c('openSites', col)}*${c('washDayM', col)}+${c('newSites', col)}*${c('washDayN', col)})*${inp('days')}/${inp('units')}`), { a: 'Washes (thousands)', kind: 'count' }),
        row('washDay', 'Washes a day per average site, implied', col => `=${c('washes', col)}*${inp('units')}/(${c('avgSites', col)}*${inp('days')})`, { kind: 'unit' }),
        row('share', 'Member share of washes', (col, r) => viaFlag(col, `${dat(r, col)}/${c('washes', col)}`, live('lShare', col)), { a: 'Member washes (thousands)', kind: 'pct' }),
        row('retailWashes', 'Retail washes (thousands)', col => `=${c('washes', col)}*(1-${c('share', col)})`, { kind: 'count' }),
        row('memberWashes', 'Member washes (thousands)', col => `=${c('washes', col)}*${c('share', col)}`, { kind: 'count' }),
        row('ticket', 'Blended retail ticket ($ a wash)', (col, r) => viaFlag(col, `${dat(r, col)}/${c('retailWashes', col)}`, `${prev(col)}${R(me, 'ticket')}*(1+${live('lTick', col)})`), { a: 'Retail wash sales', kind: 'unit', dollar: true }),
        row('tickGrowth', 'Retail ticket growth', (col, r) => `=IFERROR(${c('ticket', col)}/${prev(col)}${r}-1,0)`, { kind: 'pct' }),
        row('retailRev', 'Retail revenue', (col, r) => viaFlag(col, dat(r, col), `${c('retailWashes', col)}*${c('ticket', col)}`), { a: 'Retail wash sales' }),
        row('members', 'Average members (thousands)', col => `=${c('memberWashes', col)}/(${inp('wpm')}*12)`, { kind: 'unit' }),
        row('clubRev', 'Membership revenue', (col, r) => viaFlag(col, dat(r, col), `${c('members', col)}*${inp('fee')}*12`), { a: 'Unlimited club fees' }),
        row('otherRev', 'Other revenue', (col, r) => viaFlag(col, dat(r, col), `${c('retailRev', col)}*${inp('other')}`), { a: 'Other income' }),
        total('rev', 'Total revenue', col => `=${c('retailRev', col)}+${c('clubRev', col)}+${c('otherRev', col)}`),
        row('revPerWash', 'Revenue per wash ($)', col => `=${c('rev', col)}/${c('washes', col)}`, { kind: 'unit', dollar: true }),
      ] },
      { title: 'Cost build', rows: [
        row('cos', 'Cost of sales (per wash: live cost-of-wash driver)', (col, r) => viaFlag(col, dat(r, col), `${c('rev', col)}*${live('lCos', col)}`), { a: 'Chemicals, water and power' }),
        row('cosShare', 'Cost of sales share of revenue', col => `=IFERROR(${c('cos', col)}/${c('rev', col)},0)`, { kind: 'pct' }),
        perSite('labor', 'Labor (per site, inflated)', 'Site wages and benefits', 'labor'),
        perSite('rent', 'Rent (per site, inflated)', 'Rent', 'rent', true),
        perSite('util', 'Utilities (per site, inflated)', 'Utilities', 'util'),
        perSite('maint', 'Repairs and maintenance (per site, inflated)', 'Repairs and maintenance', 'maint'),
        row('card', 'Card fees (share of revenue)', (col, r) => viaFlag(col, dat(r, col), `${c('rev', col)}*${inp('card')}`), { a: 'Merchant card fees' }),
        row('mkt', 'Marketing (share of revenue)', (col, r) => viaFlag(col, dat(r, col), `${c('rev', col)}*${inp('mkt')}`), { a: 'Advertising' }),
        total('siteCosts', 'Site costs', col => `=SUM(${c('labor', col)}:${c('mkt', col)})`),
        total('contrib', 'Site contribution', col => `=${c('rev', col)}-${c('cos', col)}-${c('siteCosts', col)}`),
        row('cm', 'Contribution margin', col => `=IFERROR(${c('contrib', col)}/${c('rev', col)},"-")`, { kind: 'pct' }),
        row('ho', 'Head office (fixed: grows, plus a step per new site)', (col, r) => viaFlag(col, dat(r, col), `${prev(col)}${r}*(1+${inp('hoG')})+${inp('hoStep')}*${c('newSites', col)}`), { a: 'Head office costs' }),
        total('ebitda', 'EBITDA', col => `=${c('contrib', col)}-${c('ho', col)}`),
        row('em', 'EBITDA margin', col => `=IFERROR(${c('ebitda', col)}/${c('rev', col)},"-")`, { kind: 'pct' }),
      ] },
      { title: 'Working capital (days on the closing balance)', rows: [
        row('rec', 'Receivables', (col, r) => viaFlag(col, dat(r, col), `${c('rev', col)}/${inp('days')}*${inp('recDays')}`), { a: 'Trade receivables' }),
        row('pay', 'Payables', (col, r) => viaFlag(col, dat(r, col), `(${c('cos', col)}+${c('siteCosts', col)})/${inp('days')}*${inp('payDays')}`), { a: 'Trade payables' }),
        row('def', 'Deferred club revenue', (col, r) => viaFlag(col, dat(r, col), `${c('clubRev', col)}/${inp('days')}*${inp('defDays')}`), { a: 'Deferred club revenue' }),
        total('nwc', 'Net working capital', col => `=${c('rec', col)}-${c('pay', col)}-${c('def', col)}`),
        row('recDaysImp', 'Receivable days, implied', col => `=IFERROR(${c('rec', col)}/${c('rev', col)}*${inp('days')},0)`, { kind: 'unit' }),
        row('payDaysImp', 'Payable days, implied', col => `=IFERROR(${c('pay', col)}/(${c('cos', col)}+${c('siteCosts', col)})*${inp('days')},0)`, { kind: 'unit' }),
        row('defDaysImp', 'Deferred revenue days, implied', col => `=IFERROR(${c('def', col)}/${c('clubRev', col)}*${inp('days')},0)`, { kind: 'unit' }),
        row('chgRec', 'Change in receivables (cash effect)', (col, r) => `=-(${c('rec', col)}-IF(${per(col)}=1,${dat(r, col, 1)},${prev(col)}${R(me, 'rec')}))`, { a: 'Trade receivables' }),
        row('chgPay', 'Change in payables (cash effect)', (col, r) => `=${c('pay', col)}-IF(${per(col)}=1,${dat(r, col, 1)},${prev(col)}${R(me, 'pay')})`, { a: 'Trade payables' }),
        row('chgDef', 'Change in deferred revenue (cash effect)', (col, r) => `=${c('def', col)}-IF(${per(col)}=1,${dat(r, col, 1)},${prev(col)}${R(me, 'def')})`, { a: 'Deferred club revenue' }),
        total('wcCash', 'Cash effect of working capital', col => `=SUM(${c('chgRec', col)}:${c('chgDef', col)})`),
        row('ccc', 'Cash conversion cycle (days, memo)', firstCol(() => `=${inp('recDays')}-${inp('payDays')}-${inp('defDays')}`), { kind: 'count' }),
      ] },
      { title: 'PP&E (buildings and equipment; land is held at cost on the BS)', rows: [
        row('ppeOpen', 'Opening PP&E, net', (col, r) => viaFlag(col, dat(r, col, 1), `${prev(col)}${R(me, 'ppeClose')}`), { a: 'Buildings and equipment, net' }),
        row('capexNew', 'Capex: new sites', (col, r) => viaFlag(col, dat(r, col), `${c('newSites', col)}*${inp('capexSite')}`), { a: 'Additions: new sites' }),
        row('capexMaint', 'Capex: maintenance', (col, r) => viaFlag(col, dat(r, col), `${c('rev', col)}*${inp('maintCapex')}`), { a: 'Additions: maintenance' }),
        total('capexTotal', 'Total capex', col => `=${c('capexNew', col)}+${c('capexMaint', col)}`),
        row('dep', 'Depreciation', (col, r) => viaFlag(col, dat(r, col), c('wfTotal', col)), { a: 'Depreciation' }),
        total('ppeClose', 'Closing PP&E, net', (col, r) => viaFlag(col, dat(r, col), `${c('ppeOpen', col)}+${c('capexTotal', col)}-${c('dep', col)}`), { a: 'Buildings and equipment, net' }),
        row('capexToDep', 'Capex to depreciation (x, memo)', col => `=IFERROR(${c('capexTotal', col)}/${c('dep', col)},0)`, { kind: 'mult' }),
        row('impliedLife', 'Implied life of the FY26 base (years, memo): gross depreciable PP&E over FY26 depreciation', firstCol(() => `=IFERROR(${inp('gross')}/$E$${R(me, 'dep')},0)`), { kind: 'unit' }),
      ] },
      { title: 'Depreciation waterfall (each year\'s capex over its life, from the year after)', rows: [
        row('wfBase', 'Existing base: FY26 net PP&E (read from Data) over its remaining life', (col, r) => `=IF(${flag(col)}=1,${dat(r, '$E')}/${inp('remLife')},0)`, { a: 'Buildings and equipment, net' }),
        ...PROJ_COLS.map((pc, i) => row('wf' + (i + 1), `${YEARS[3 + i]} capex`, col => `=IF(${pcnt(col)}>${i + 1},$${pc}$${R(me, 'capexTotal')}/${inp('life')},0)`)),
        total('wfTotal', 'Total depreciation (projected)', col => `=SUM(${c('wfBase', col)}:${c('wf5', col)})`),
      ] },
      tranche('term', 'Term loan', 'Term loan', {
        drawn: (col, r) => viaFlag(col, dat(r, col), '0'), repaid: (col, r) => viaFlag(col, `-${dat(r, col)}`, `-MIN(${c('termOpen', col)},${inp('termAmort')})`), rate: 'termRate',
        interestActual: (col, r) => dat(r, col), drawnLabel: 'Term loan drawn', repaidLabel: 'Term loan repaid',
      }),
      tranche('dd', 'Delayed-draw loan', 'Delayed-draw loan', {
        drawn: col => viaFlag(col, '0', live('ddDraw', col)),
        repaid: col => viaFlag(col, '0', `-MIN(${c('ddOpen', col)},${inp('ddAmort')}*${prev(col)}${R(me, 'ddCum')})`), rate: 'ddRate', interestActual: zero,
        extraRows: [row('ddCum', 'Cumulative draws (memo)', (col, r) => viaFlag(col, '0', `${prev(col)}${r}+${live('ddDraw', col)}`))],
      }),
      tranche('rev', 'Revolver (the cash sweep)', 'Revolving facility', {
        drawn: col => viaFlag(col, '0', `MAX(${c('revMin', col)}-${c('revCbr', col)},0)`),
        repaid: col => viaFlag(col, '0', `-MIN(MAX(${c('revCbr', col)}-${c('revMin', col)},0),${c('revOpen', col)})`), rate: 'revRate', interestActual: zero,
        extraRows: [
          row('revCbr', 'Cash available before the revolver', col => `=${xs('CF', 'cbr', col)}`, { green: true }),
          row('revMin', 'Minimum cash', col => `=${inp('minCash')}`, { green: true }),
        ],
      }),
      { title: 'Debt totals', rows: [
        total('totalDebt', 'Total debt', col => `=${c('termClose', col)}+${c('ddClose', col)}+${c('revClose', col)}`),
        total('totalInt', 'Total interest', col => `=${c('termInt', col)}+${c('ddInt', col)}+${c('revInt', col)}`),
        row('netDebt', 'Net debt (memo: debt less cash)', col => `=${c('totalDebt', col)}-${xs('BS', 'cash', col)}`),
      ] },
      { title: 'Tax (the charge is the cash tax; no deferred tax is carried)', rows: [
        row('ebt', 'Earnings before tax', col => `=${xs('IS', 'ebt', col)}`, { green: true }),
        row('taxBefore', 'Tax before losses', col => `=MAX(${c('ebt', col)},0)*${inp('tax')}`),
        row('lossOpen', 'Tax losses: opening', (col, r) => viaFlag(col, '0', `${prev(col)}${R(me, 'lossClose')}`)),
        row('lossAdd', 'Tax losses: added (a loss year)', col => viaFlag(col, '0', `MAX(-${c('ebt', col)},0)`)),
        row('lossUsed', 'Tax losses: used against profit', col => viaFlag(col, '0', `-MIN(${c('lossOpen', col)},MAX(${c('ebt', col)},0))`)),
        total('lossClose', 'Tax losses: closing', col => `=SUM(${c('lossOpen', col)}:${c('lossUsed', col)})`),
        row('taxCharge', 'Tax charge', (col, r) => viaFlag(col, dat(r, col), `${c('taxBefore', col)}+${c('lossUsed', col)}*${inp('tax')}`), { a: 'Income tax' }),
        row('effTax', 'Effective tax rate', col => `=IFERROR(${c('taxCharge', col)}/${c('ebt', col)},0)`, { kind: 'pct' }),
      ] },
    ],
    source: 'FY24 to FY26 read the Data tab by name through the projection flag; FY27 on calculate from Inputs. Days sit on the closing balance.',
  });
  timeline(sheet);
  return sheet;
}

/* ---- Checks ---- */
export const P_AND_L_EBITDA = [9780, 12560, 16600];
function pageChecks() {
  const me = 'Checks';
  const c = (key, col) => col + R(me, key);
  const tie = (key, label, expr) => ({ key, label, kind: 'count', indent: 1, fill: across(col => `=ROUND(${expr(col)},2)`) });
  const one = (key, label, expr, extra = {}) => ({ key, label, kind: 'count', indent: 1, fill: firstCol(() => expr()), ...extra });
  const sheet = page({
    name: me, chapter: CHAPTER, read: false, title: 'Checks', units: 'USD thousands unless stated; every row is a live difference that reads zero when the model ties',
    headers: COLS.map(() => null),
    blocks: [
      { title: 'Ties', rows: [
        tie('bs', 'Balance sheet balances', col => `${xs('BS', 'ta', col)}-${xs('BS', 'tle', col)}`),
        tie('cash', 'BS cash equals CF closing cash', col => `${xs('BS', 'cash', col)}-${xs('CF', 'close', col)}`),
        tie('debt', 'Debt schedule closing equals BS debt', col => `${xs('Schedules', 'totalDebt', col)}-(${xs('BS', 'term', col)}+${xs('BS', 'dd', col)}+${xs('BS', 'rev', col)})`),
        tie('ppe', 'PP&E closing equals BS PP&E', col => `${xs('Schedules', 'ppeClose', col)}-${xs('BS', 'ppe', col)}`),
        tie('rev', 'Revenue on the IS ties to the build', col => `${xs('IS', 'rev', col)}-${xs('Schedules', 'rev', col)}`),
        one('xfoot', 'Cost build cross-foots (sum down less sum across)', () => `=ROUND(SUM(Schedules!C${R('Schedules', 'labor')}:J${R('Schedules', 'mkt')})-SUM(Schedules!C${R('Schedules', 'siteCosts')}:J${R('Schedules', 'siteCosts')}),2)`),
        tie('eq', 'Equity rolls (opening plus net income less distributions equals closing)', col => `${xs('BS', 'openEq', col)}+${xs('BS', 'ni', col)}+${xs('BS', 'dist', col)}-${xs('BS', 'closeEq', col)}`),
        { key: 'ebitda', label: 'FY24 to FY26 EBITDA ties to the Chapter 2 P&L', kind: 'count', indent: 1, fill: across(col => `=IF(${flag(col)}=0,ROUND(${xs('IS', 'ebitda', col)}-${c('pnl', col)},2),0)`) },
        { key: 'su', label: 'Sources equal uses (Chapter 6, pending)', kind: 'count', indent: 1 },
      ] },
      { title: 'Limits', rows: [
        tie('debtNeg', 'Debt closing balances below zero (count)', col => `COUNTIF(${xs('Schedules', 'termClose', col)},"<0")+COUNTIF(${xs('Schedules', 'ddClose', col)},"<0")+COUNTIF(${xs('Schedules', 'revClose', col)},"<0")`),
        tie('ppeNeg', 'PP&E closing below zero (count)', col => `COUNTIF(${xs('Schedules', 'ppeClose', col)},"<0")`),
      ] },
      { title: 'Rates (the projected effective rate equals the rate on Inputs while Circ is 1)', rows: [
        { key: 'termEff', label: 'Term loan', kind: 'count', indent: 1, fill: across(col => `=IF(AND(${flag(col)}=1,Circ=1),ROUND(${xs('Schedules', 'termEff', col)}-${inp('termRate')},4),0)`) },
        { key: 'ddEff', label: 'Delayed-draw loan', kind: 'count', indent: 1, fill: across(col => `=IF(AND(${flag(col)}=1,Circ=1,${xs('Schedules', 'ddAvg', col)}>0),ROUND(${xs('Schedules', 'ddEff', col)}-${inp('ddRate')},4),0)`) },
        { key: 'revEff', label: 'Revolver', kind: 'count', indent: 1, fill: across(col => `=IF(AND(${flag(col)}=1,Circ=1,${xs('Schedules', 'revAvg', col)}>0),ROUND(${xs('Schedules', 'revEff', col)}-${inp('revRate')},4),0)`) },
      ] },
      { title: 'DCF', rows: [
        one('roundTrip', 'Terminal value round trip (implied growth comes back)', () => `=ROUND(DCF!C${R('DCF', 'roundTrip')}-${inp('growth')},6)`),
        one('npv', 'NPV cross-check, end-year (sum of PVs less NPV)', () => `=ROUND(DCF!C${R('DCF', 'pvEnd')}-NPV(WACC,DCF!F${R('DCF', 'fcf')}:J${R('DCF', 'fcf')}),2)`),
      ] },
      { title: 'Errors by sheet (SUMPRODUCT of ISERROR over the block)', rows: [
        one('errIS', 'IS', () => '=SUMPRODUCT(--ISERROR(IS!C5:J60))'), one('errCF', 'CF', () => '=SUMPRODUCT(--ISERROR(CF!C5:J60))'), one('errBS', 'BS', () => '=SUMPRODUCT(--ISERROR(BS!C5:J60))'),
        one('errSch', 'Schedules', () => '=SUMPRODUCT(--ISERROR(Schedules!C5:J140))'), one('errDCF', 'DCF', () => '=SUMPRODUCT(--ISERROR(DCF!C5:K80))'), one('errInp', 'Inputs', () => '=SUMPRODUCT(--ISERROR(Inputs!C5:J120))'),
      ] },
      { title: 'Hardcodes by sheet (typed numbers in the projected block)', rows: [
        one('hcIS', 'IS', () => '=SUMPRODUCT(ISNUMBER(IS!F5:J60)*(1-ISFORMULA(IS!F5:J60)))'), one('hcCF', 'CF', () => '=SUMPRODUCT(ISNUMBER(CF!F5:J60)*(1-ISFORMULA(CF!F5:J60)))'),
        one('hcBS', 'BS', () => '=SUMPRODUCT(ISNUMBER(BS!F5:J60)*(1-ISFORMULA(BS!F5:J60)))'), one('hcSch', 'Schedules', () => '=SUMPRODUCT(ISNUMBER(Schedules!F5:J140)*(1-ISFORMULA(Schedules!F5:J140)))'),
      ] },
      { title: 'Roll-up', rows: [
        one('rollup', 'Sum of absolute differences, errors and hardcodes', () => `=SUMPRODUCT(ABS(C${R(me, 'bs')}:J${R(me, 'npv')}))+SUM(C${R(me, 'errIS')}:C${R(me, 'errInp')})+SUM(C${R(me, 'hcIS')}:C${R(me, 'hcSch')})`, { total: true }),
        { key: 'flag', label: 'Flag', kind: 'text', fill: firstCol(() => `=IF(C${R(me, 'rollup')}=0,"OK","CHECK")`), boldAt: ['C'] },
      ] },
      { title: 'Source figures', rows: [
        { key: 'pnl', label: 'EBITDA per the Chapter 2 P&L (typed, Clearcoat P&L FY24 to FY26E)', values: P_AND_L_EBITDA },
      ] },
    ],
    source: 'Each check is wrapped in ROUND(…,2); a pending check stays empty with "pending" beside it, never a typed zero.',
  });
  if (!sheet) return null;
  timeline(sheet);
  sheet.cells['K' + R(me, 'su')] = { value: 'pending', it: true };
  sheet.condFmt = [{ kind: 'cellValue', op: '<>', v1: 0, range: `C${R(me, 'bs')}:J${R(me, 'npv')}`, style: 'redtext' }];
  return sheet;
}

/* ---- DCF ---- */
function pageDCF() {
  const me = 'DCF';
  const c = (key, col) => col + R(me, key);
  const proj = fn => (col, r) => COLS.includes(col) ? fn(col, r) : null;
  const withK = (fn, kfn) => (col, r) => col === 'K' ? kfn(col, r) : COLS.includes(col) ? fn(col, r) : null;
  const one = (key, label, expr, extra = {}) => ({ key, label, indent: 1, fill: firstCol(() => expr()), ...extra });
  const g = R(me, 'ptG'), w = R(me, 'ptW'), m = R(me, 'ptM');
  const offs = [-2, -1, 0, 1, 2];
  const stepExpr = (base, off, step) => off === 0 ? `=${base}` : `=${base}${off > 0 ? '+' : '-'}${Math.abs(off) === 1 ? '' : '2*'}${step}`;
  const t = key => `$F$${R(me, 't')}:$J$${R(me, 't')}`, fcfR = `$F$${R(me, 'fcf')}:$J$${R(me, 'fcf')}`;
  const pvSum = rate => `SUMPRODUCT(${fcfR},1/(1+${rate})^${t()})`;
  const sensRows = (prefix, corner) => [
    { key: prefix + 'H', label: prefix === 'sg' ? 'WACC down, growth across' : 'WACC down, exit multiple across', kind: prefix === 'sg' ? 'pct' : 'mult', boldAt: ['D', 'E', 'F', 'G', 'H'],
      fill: only(['D', 'E', 'F', 'G', 'H'], col => stepExpr(prefix === 'sg' ? `$C$${g}` : `$C$${m}`, offs[col.charCodeAt(0) - 68], prefix === 'sg' ? inp('stepG') : inp('stepM'))) },
    ...offs.map((off, i) => ({ key: prefix + i, fill: only(['C', 'D', 'E', 'F', 'G', 'H'], (col, r) => col === 'C' ? stepExpr(`$C$${w}`, off, inp('stepW')) : corner(col, r)), fmtAt: MILLIONS, boldAt: off === 0 ? ['F'] : [] })),
  ];
  const sheet = page({
    name: me, chapter: CHAPTER, title: 'DCF', units: 'USD thousands unless stated; unlevered free cash flow discounted at WACC; the sensitivity tables in USD millions',
    headers: [...COLS.map(() => null), 'FY31 normalized'],
    blocks: [
      { rows: [{ key: 'valDate', label: 'Valuation date (the FY26 year end; net debt is taken here)', fill: firstCol(() => `=${inp('valDate')}`), fmt: DATE_FMT, green: true }] },
      { title: 'Unlevered free cash flow', rows: [
        { key: 'ebitda', label: 'EBITDA', indent: 1, green: true, fill: withK(col => `=${xs('IS', 'ebitda', col)}`, () => `=J${R(me, 'ebitda')}`) },
        { key: 'depLess', label: 'Less depreciation', indent: 1, green: true, fill: withK(col => `=-${xs('Schedules', 'dep', col)}`, () => `=J${R(me, 'depLess')}`) },
        { key: 'ebit', label: 'EBIT', total: true, fill: (col, r) => `=${c('ebitda', col)}+${c('depLess', col)}` },
        { key: 'taxEbit', label: 'Tax on EBIT (at the rate, not the IS tax)', indent: 1, fill: col => `=-MAX(${c('ebit', col)},0)*${inp('tax')}` },
        { key: 'nopat', label: 'NOPAT', total: true, fill: col => `=${c('ebit', col)}+${c('taxEbit', col)}` },
        { key: 'depBack', label: 'Depreciation added back', indent: 1, fill: col => `=-${c('depLess', col)}` },
        { key: 'capex', label: 'Capital expenditure', indent: 1, green: true, fill: withK(col => `=-${xs('Schedules', 'capexTotal', col)}`, () => `=-K${R(me, 'depBack')}`) },
        { key: 'nwc', label: 'Change in net working capital', indent: 1, green: true, fill: withK(col => `=${xs('Schedules', 'wcCash', col)}`, () => `=${inp('termWC')}`) },
        { key: 'fcf', label: 'Unlevered free cash flow', total: true, final: true, fill: col => `=SUM(${c('nopat', col)}:${c('nwc', col)})` },
        { key: 'fcfShare', label: 'FCF as a share of EBITDA (memo)', kind: 'pct', indent: 1, fill: col => `=IFERROR(${c('fcf', col)}/${c('ebitda', col)},"-")` },
      ] },
      { title: 'Discounting (projected years; t counts from the valuation date)', rows: [
        { key: 't', label: 'Period, t (mid-year when the switch is 1)', kind: 'unit', indent: 1, fill: proj(col => `=IF(${flag(col)}=1,${pcnt(col)}-IF(${inp('mid')}=1,0.5,0),0)`) },
        { key: 'df', label: 'Discount factor, 1 over (1 + WACC) to the t', kind: 'unit', indent: 1, fill: proj(col => `=IF(${flag(col)}=1,1/(1+WACC)^${c('t', col)},0)`) },
        { key: 'pv', label: 'Present value of free cash flow', indent: 1, fill: proj(col => `=${c('fcf', col)}*${c('df', col)}`) },
        one('pvSum', 'Sum of present values', () => `=SUM(C${R(me, 'pv')}:J${R(me, 'pv')})`, { total: true }),
        one('pvEnd', 'Sum of present values, end-year (memo, for the NPV cross-check)', () => `=SUMPRODUCT(${fcfR},1/(1+WACC)^Inputs!$F$${R('Inputs', 'pcnt')}:$J$${R('Inputs', 'pcnt')})`),
      ] },
      { title: 'Terminal value', rows: [
        one('tvPerp', 'Perpetuity: normalized FY31 FCF grown a year, over WACC less growth', () => `=K${R(me, 'fcf')}*(1+${inp('growth')})/(WACC-${inp('growth')})`),
        one('tvExit', 'Exit multiple: FY31 EBITDA times the multiple', () => `=J${R(me, 'ebitda')}*${inp('exit')}`),
        one('impMult', 'Implied exit multiple of the perpetuity value (x)', () => `=C${R(me, 'tvPerp')}/J${R(me, 'ebitda')}`, { kind: 'mult' }),
        one('impGrowth', 'Implied growth of the exit value', () => `=(C${R(me, 'tvExit')}*WACC-K${R(me, 'fcf')})/(C${R(me, 'tvExit')}+K${R(me, 'fcf')})`, { kind: 'pct' }),
        one('roundTrip', 'Round trip: the implied multiple fed into the exit method, solved for growth', () => `=((C${R(me, 'impMult')}*J${R(me, 'ebitda')})*WACC-K${R(me, 'fcf')})/((C${R(me, 'impMult')}*J${R(me, 'ebitda')})+K${R(me, 'fcf')})`, { kind: 'pct' }),
        one('method', 'Terminal method (1 perpetuity, 2 exit multiple)', () => `=${inp('tvMethod')}`, { kind: 'count', green: true, nodash: true }),
        one('tv', 'Terminal value used', () => `=CHOOSE(C${R(me, 'method')},C${R(me, 'tvPerp')},C${R(me, 'tvExit')})`, { total: true }),
      ] },
      { title: 'Enterprise value to equity value', rows: [
        one('dfPerp', 'Discount factor for the perpetuity (year 5, mid-year aware)', () => `=J${R(me, 'df')}`, { kind: 'unit' }),
        one('dfExit', 'Discount factor for the exit (a sale at the end of FY31)', () => `=1/(1+WACC)^Inputs!$J$${R('Inputs', 'pcnt')}`, { kind: 'unit' }),
        one('pvTvPerp', 'PV of the terminal value, perpetuity', () => `=C${R(me, 'tvPerp')}*C${R(me, 'dfPerp')}`),
        one('pvTvExit', 'PV of the terminal value, exit multiple', () => `=C${R(me, 'tvExit')}*C${R(me, 'dfExit')}`),
        one('evPerp', 'Enterprise value, perpetuity method', () => `=C${R(me, 'pvSum')}+C${R(me, 'pvTvPerp')}`, { total: true }),
        one('evExit', 'Enterprise value, exit multiple method', () => `=C${R(me, 'pvSum')}+C${R(me, 'pvTvExit')}`, { total: true }),
        one('ev', 'Enterprise value (the method the switch names)', () => `=CHOOSE(C${R(me, 'method')},C${R(me, 'evPerp')},C${R(me, 'evExit')})`, { total: true }),
        one('netDebt', 'Net debt at the valuation date (FY26)', () => `=Schedules!$E$${R('Schedules', 'netDebt')}`, { green: true }),
        one('eqv', 'Equity value', () => `=C${R(me, 'ev')}-C${R(me, 'netDebt')}`, { total: true, final: true }),
        one('tvShare', 'Terminal value share of enterprise value (memo)', () => `=CHOOSE(C${R(me, 'method')},C${R(me, 'pvTvPerp')},C${R(me, 'pvTvExit')})/C${R(me, 'ev')}`, { kind: 'pct' }),
        one('fcShare', 'Forecast years share of enterprise value (memo)', () => `=C${R(me, 'pvSum')}/C${R(me, 'ev')}`, { kind: 'pct' }),
        { key: 'evMult', label: 'EV to EBITDA, FY26E and FY27 (x, memo)', kind: 'mult', indent: 1, fill: only(['E', 'F'], col => `=$C$${R(me, 'ev')}/${c('ebitda', col)}`) },
      ] },
      { title: 'WACC', rows: [
        one('rf', 'Risk-free rate', () => `=${inp('rf')}`, { kind: 'pct', green: true }),
        one('erp', 'Equity risk premium', () => `=${inp('erp')}`, { kind: 'pct', green: true }),
        one('beta', 'Beta', () => `=${inp('beta')}`, { kind: 'unit', green: true }),
        one('size', 'Size premium', () => `=${inp('size')}`, { kind: 'pct', green: true }),
        one('coe', 'Cost of equity: risk-free plus beta times the premium, plus the size premium', () => `=C${R(me, 'rf')}+C${R(me, 'beta')}*C${R(me, 'erp')}+C${R(me, 'size')}`, { kind: 'pct' }),
        one('cod', 'Cost of debt', () => `=${inp('cod')}`, { kind: 'pct', green: true }),
        one('taxW', 'Tax rate', () => `=${inp('tax')}`, { kind: 'pct', green: true }),
        one('atcod', 'After-tax cost of debt', () => `=C${R(me, 'cod')}*(1-C${R(me, 'taxW')})`, { kind: 'pct' }),
        one('debtW', 'Debt weight (target)', () => `=${inp('debtW')}`, { kind: 'pct', green: true }),
        one('eqW', 'Equity weight', () => `=1-C${R(me, 'debtW')}`, { kind: 'pct' }),
        one('wacc', 'WACC', () => `=C${R(me, 'eqW')}*C${R(me, 'coe')}+C${R(me, 'debtW')}*C${R(me, 'atcod')}`, { kind: 'pct', total: true }),
      ] },
      { title: 'Pass-through drivers (the sensitivity tables read these)', rows: [
        one('ptW', 'WACC', () => '=WACC', { kind: 'pct' }),
        one('ptG', 'Perpetuity growth', () => `=${inp('growth')}`, { kind: 'pct', green: true }),
        one('ptM', 'Exit multiple', () => `=${inp('exit')}`, { kind: 'mult', green: true }),
      ] },
      { title: 'Sensitivity: enterprise value, perpetuity method (USD millions)', kinds: ['pct', 'money', 'money', 'money', 'money', 'money'],
        rows: sensRows('sg', (col, r) => `=${pvSum(`$C${r}`)}+$K$${R(me, 'fcf')}*(1+${col}$${R(me, 'sgH')})/($C${r}-${col}$${R(me, 'sgH')})/(1+$C${r})^$J$${R(me, 't')}`) },
      { title: 'Sensitivity: enterprise value, exit multiple method (USD millions)', kinds: ['pct', 'money', 'money', 'money', 'money', 'money'],
        rows: sensRows('sm', (col, r) => `=${pvSum(`$C${r}`)}+$J$${R(me, 'ebitda')}*${col}$${R(me, 'smH')}/(1+$C${r})^Inputs!$J$${R('Inputs', 'pcnt')}`) },
    ],
    source: 'The exit value is a sale at the end of FY31 and takes the end-year factor whatever the switch says; the perpetuity keeps arriving mid-year.',
  });
  if (!sheet) return null;
  timeline(sheet);
  sheet.cells.K4 = { value: 'FY31 normalized', bold: true, align: 'r' };
  for (const prefix of ['sg', 'sm']) for (let i = 0; i < 5; i++) for (const col of ['D', 'E', 'F', 'G', 'H']) Object.assign(sheet.cells[col + R(me, prefix + i)], MILLIONS);
  titled(sheet, caseTitle('DCF'));
  return sheet;
}

/* ---- One site (5.1.1 to 5.1.5, 5.1.7): Domain for September, in dollars ---- */
export const SITE_SEPTEMBER = { site: 'Domain', washes: 7500, ticket: 13.9, costPerWash: 1.5, rent: 9000, labor: 21000, utilities: 5000, maintenance: 3500, cardRate: 0.02,
  headOffice: 500000, sites: 40, build: 2500000, life: 20, loan: 1500000, loanRate: 0.07, amort: 75000, taxRate: 0.25, members: 1500, fee: 30, lagDays: 3, payDays: 30, days: 30,
  augChem: 10800, augRec: 10000, openCash: 40000, accDep: 500000, maintCapex: 0.02 };
export const SITE_CHALLENGE = { ...SITE_SEPTEMBER, site: 'Mueller', washes: 6800, ticket: 13.5, rent: 7500, labor: 19500, utilities: 4600, maintenance: 3100, loan: 1200000, amort: 60000, members: 1300, augChem: 9600, augRec: 9000, openCash: 35000, accDep: 625000 };
function pageOneSite(S = SITE_SEPTEMBER, name = 'One site') {
  const me = name;
  const c = key => `C${R(me, key)}`;
  const inRow = (key, label, value, kind = 'money', extra = {}) => ({ key, label, kind, indent: 1, values: [value], ...extra });
  const f = (key, label, expr, extra = {}) => ({ key, label, indent: 1, fill: firstCol(() => expr()), ...extra });
  const tot = (key, label, expr, extra = {}) => ({ key, label, total: true, fill: firstCol(() => expr()), ...extra });
  const sheet = page({
    name: me, chapter: CHAPTER, title: `${S.site}, September 2026: three statements by hand`, units: 'USD unless stated; one site, one month',
    headers: ['September'],
    blocks: [
      { title: 'Inputs', rows: [
        inRow('washes', 'Washes in September (COUNTIFS from the export)', S.washes, 'count'), inRow('ticket', 'Blended ticket ($ a wash)', S.ticket, 'unit', { dollar: true }), inRow('cpw', 'Cost per wash ($)', S.costPerWash, 'unit', { dollar: true }),
        inRow('rentIn', 'Rent ($ a month)', S.rent), inRow('laborIn', 'Labor ($ a month)', S.labor), inRow('utilIn', 'Utilities ($ a month)', S.utilities), inRow('maintIn', 'Maintenance ($ a month)', S.maintenance),
        inRow('cardRate', 'Card fee rate', S.cardRate, 'pct'), inRow('hoIn', 'Head office, company, September ($)', S.headOffice), inRow('sites', 'Sites', S.sites, 'count'),
        inRow('build', 'Site build cost: building, tunnel, equipment ($)', S.build), inRow('life', 'Depreciation life (years)', S.life, 'count'),
        inRow('loanIn', 'Site share of the loan ($)', S.loan), inRow('loanRate', 'Loan rate', S.loanRate, 'pct'), inRow('amort', 'Loan amortization ($ a year)', S.amort),
        inRow('taxRate', 'Tax rate', S.taxRate, 'pct'), inRow('members', 'Members (paid on the 1st)', S.members, 'count'), inRow('fee', 'Membership fee ($ a month)', S.fee, 'unit', { dollar: true }),
        inRow('lag', 'Card settlement lag (days)', S.lagDays, 'count'), inRow('days', 'Days in September', S.days, 'count'), inRow('maintCapex', 'Maintenance capex (% of revenue)', S.maintCapex, 'pct'),
        inRow('augChem', 'Opening payables: August chemicals ($)', S.augChem), inRow('augRec', 'Opening receivables ($)', S.augRec), inRow('openCash', 'Opening cash ($)', S.openCash), inRow('accDep', 'Opening accumulated depreciation ($)', S.accDep),
      ] },
      { title: 'Income statement', rows: [
        f('rev', 'Revenue (washes times ticket)', () => `=${c('washes')}*${c('ticket')}`, { dollar: true }),
        f('cos', 'Cost of sales (washes times cost per wash)', () => `=-${c('washes')}*${c('cpw')}`),
        tot('gp', 'Gross profit', () => `=${c('rev')}+${c('cos')}`), f('gm', 'Gross margin', () => `=IFERROR(${c('gp')}/${c('rev')},"-")`, { kind: 'pct' }),
        f('rent', 'Rent', () => `=-${c('rentIn')}`), f('labor', 'Labor', () => `=-${c('laborIn')}`), f('util', 'Utilities', () => `=-${c('utilIn')}`), f('maint', 'Maintenance', () => `=-${c('maintIn')}`),
        f('card', 'Card fees', () => `=-${c('rev')}*${c('cardRate')}`), tot('siteCosts', 'Site costs', () => `=SUM(${c('rent')}:${c('card')})`),
        tot('contrib', 'Site contribution', () => `=${c('gp')}+${c('siteCosts')}`), f('ho', 'Head office share (one site of the company)', () => `=-${c('hoIn')}/${c('sites')}`),
        tot('ebitda', 'EBITDA', () => `=${c('contrib')}+${c('ho')}`, { final: true }), f('em', 'EBITDA margin', () => `=IFERROR(${c('ebitda')}/${c('rev')},"-")`, { kind: 'pct' }),
        f('dep', 'Depreciation (the build over its life, one month)', () => `=-${c('build')}/${c('life')}/12`), tot('ebit', 'EBIT', () => `=${c('ebitda')}+${c('dep')}`),
        f('int', 'Interest (the loan at its rate, one month)', () => `=-${c('loanIn')}*${c('loanRate')}/12`), tot('ebt', 'Earnings before tax', () => `=${c('ebit')}+${c('int')}`),
        f('tax', 'Tax', () => `=-MAX(${c('ebt')},0)*${c('taxRate')}`), tot('ni', 'Net income', () => `=${c('ebt')}+${c('tax')}`, { final: true }),
      ] },
      { title: 'Accrual and cash: the timing gaps', rows: [
        f('cashIn1', 'Membership cash in on the 1st (members times fee)', () => `=${c('members')}*${c('fee')}`, { dollar: true }),
        f('def15', 'Deferred revenue at September 15 (half the month unearned)', () => `=${c('cashIn1')}*(${c('days')}-15)/${c('days')}`),
        f('def30', 'Deferred revenue at September 30 (all earned)', () => `=${c('cashIn1')}*(${c('days')}-${c('days')})/${c('days')}`),
        f('def20', 'One member who paid on the 20th: deferred at September 30', () => `=${c('fee')}*(${c('days')}-10)/${c('days')}`, { kind: 'unit', dollar: true }),
        f('payClose', 'Payables at September 30 (the month\'s chemicals, paid in October)', () => `=-${c('cos')}`),
        f('recClose', 'Receivables at September 30 (three days of card revenue)', () => `=${c('rev')}/${c('days')}*${c('lag')}`),
        f('cfoHand', 'Cash from operations, by hand', () => `=${c('ni')}-${c('dep')}+(${c('payClose')}-${c('augChem')})-(${c('recClose')}-${c('augRec')})+${c('def30')}`, { total: true }),
      ] },
      { title: 'Cash flow statement (indirect; cash in positive, cash out negative)', rows: [
        f('cfNi', 'Net income', () => `=${c('ni')}`, { dollar: true }), f('cfDep', 'Depreciation added back', () => `=-${c('dep')}`),
        f('cfRec', 'Change in receivables', () => `=-(${c('recClose')}-${c('augRec')})`), f('cfPay', 'Change in payables', () => `=${c('payClose')}-${c('augChem')}`), f('cfDef', 'Change in deferred revenue', () => `=${c('def30')}-0`),
        tot('cfo', 'Cash from operations', () => `=SUM(${c('cfNi')}:${c('cfDef')})`),
        f('cfCapex', 'Maintenance capex', () => `=-${c('rev')}*${c('maintCapex')}`), tot('cfi', 'Cash from investing', () => `=${c('cfCapex')}`),
        f('cfAmort', 'Loan amortization (one month)', () => `=-${c('amort')}/12`), tot('cff', 'Cash from financing', () => `=${c('cfAmort')}`),
        tot('net', 'Net change in cash', () => `=${c('cfo')}+${c('cfi')}+${c('cff')}`), f('open', 'Opening cash', () => `=${c('openCash')}`), tot('close', 'Closing cash', () => `=${c('open')}+${c('net')}`, { final: true }),
      ] },
      { title: 'Balance sheet at September 30', rows: [
        f('bsCash', 'Cash (the cash flow statement\'s closing line)', () => `=${c('close')}`, { dollar: true }), f('bsRec', 'Receivables', () => `=${c('recClose')}`),
        f('bsPpe', 'PP&E, net (the build plus capex, less accumulated depreciation)', () => `=${c('build')}-${c('accDep')}+${c('dep')}-${c('cfCapex')}`), tot('ta', 'Total assets', () => `=SUM(${c('bsCash')}:${c('bsPpe')})`),
        f('bsPay', 'Payables', () => `=${c('payClose')}`), f('bsDef', 'Deferred revenue', () => `=${c('def30')}`), f('bsLoan', 'Loan (less this month\'s repayment)', () => `=${c('loanIn')}+${c('cfAmort')}`),
        tot('tl', 'Total liabilities', () => `=SUM(${c('bsPay')}:${c('bsLoan')})`),
        f('openEq', 'Opening equity', () => `=${c('openCash')}+${c('augRec')}+${c('build')}-${c('accDep')}-${c('augChem')}-${c('loanIn')}`), f('eqNi', 'Net income', () => `=${c('ni')}`),
        tot('closeEq', 'Closing equity', () => `=${c('openEq')}+${c('eqNi')}`), tot('tle', 'Total liabilities and equity', () => `=${c('tl')}+${c('closeEq')}`, { final: true }),
        f('check', 'Balance check: assets less liabilities and equity', () => `=ROUND(${c('ta')}-${c('tle')},2)`, { kind: 'count' }),
      ] },
      { title: 'What a buyer reads first', rows: [
        f('rMargin', 'EBITDA margin', () => `=IFERROR(${c('ebitda')}/${c('rev')},"-")`, { kind: 'pct' }),
        f('rConv', 'Cash conversion (cash from operations before interest and tax, over EBITDA)', () => `=IFERROR((${c('cfo')}-${c('int')}-${c('tax')})/${c('ebitda')},"-")`, { kind: 'pct' }),
        f('rNetDebt', 'Net debt (the loan less cash)', () => `=${c('bsLoan')}-${c('bsCash')}`, { dollar: true }),
        f('rLev', 'Leverage (net debt over annualized EBITDA, years)', () => `=${c('rNetDebt')}/(${c('ebitda')}*12)`, { kind: 'mult' }),
        f('rCover', 'Interest cover (EBITDA over interest)', () => `=-${c('ebitda')}/${c('int')}`, { kind: 'mult' }),
        f('rReturn', 'Return on the site (annualized contribution over the build)', () => `=${c('contrib')}*12/${c('build')}`, { kind: 'pct' }),
      ] },
    ],
    source: 'Washes and the ticket from the September export and the site POS; costs from Lists; the loan is the site\'s share of the term loan.',
  });
  return sheet;
}

/* ---- One week (5.1.6): Domain for one week, six events ---- */
export const WEEK = { washes: 1750, ticket: 13.9, delivery: 2625, costPerWash: 1.5, payroll: 4500, loanPayment: 3460, interest: 2020, principal: 1440, depreciation: 2400, lagDays: 3, taxRate: 0.25,
  openCash: 40000, openRec: 10000, openPpe: 1990000, openLoan: 1500000, openEquity: 540000 };
function pageOneWeek() {
  const me = 'One week';
  const c = key => `C${R(me, key)}`;
  const inRow = (key, label, value, kind = 'money', extra = {}) => ({ key, label, kind, indent: 1, values: [value], ...extra });
  const f = (key, label, expr, extra = {}) => ({ key, label, indent: 1, fill: firstCol(() => expr()), ...extra });
  const tot = (key, label, expr, extra = {}) => ({ key, label, total: true, fill: firstCol(() => expr()), ...extra });
  const sheet = page({
    name: me, chapter: CHAPTER, title: 'Domain, one week: six events through three statements', units: 'USD unless stated; one site, one week',
    headers: ['Week'],
    blocks: [
      { title: 'The week\'s events', rows: [
        inRow('washes', 'Washes', WEEK.washes, 'count'), inRow('ticket', 'Ticket ($ a wash)', WEEK.ticket, 'unit', { dollar: true }),
        inRow('delivery', 'Chemical delivery, on credit (expensed on delivery)', WEEK.delivery), inRow('cpw', 'Cost per wash ($, memo)', WEEK.costPerWash, 'unit', { dollar: true }),
        inRow('payroll', 'Payroll paid', WEEK.payroll), inRow('loanPay', 'Loan payment', WEEK.loanPayment), inRow('interest', 'Of which interest', WEEK.interest), inRow('principal', 'Of which principal', WEEK.principal),
        inRow('dep', 'A week of depreciation', WEEK.depreciation), inRow('lag', 'Card settlement lag (days)', WEEK.lagDays, 'count'), inRow('taxRate', 'Tax rate (accrued, paid later)', WEEK.taxRate, 'pct'),
      ] },
      { title: 'Opening balance sheet', rows: [
        inRow('oCash', 'Cash', WEEK.openCash), inRow('oRec', 'Receivables', WEEK.openRec), inRow('oPpe', 'PP&E, net', WEEK.openPpe),
        tot('oTa', 'Total assets', () => `=SUM(${c('oCash')}:${c('oPpe')})`),
        inRow('oPay', 'Payables', 0), inRow('oTaxPay', 'Tax payable', 0), inRow('oLoan', 'Loan', WEEK.openLoan), inRow('oEq', 'Equity', WEEK.openEquity),
        tot('oTle', 'Total liabilities and equity', () => `=SUM(${c('oPay')}:${c('oEq')})`),
      ] },
      { title: 'Income statement', rows: [
        f('rev', 'Revenue', () => `=${c('washes')}*${c('ticket')}`, { dollar: true }), f('cos', 'Cost of sales (the delivery)', () => `=-${c('delivery')}`),
        f('site', 'Site costs (payroll)', () => `=-${c('payroll')}`), tot('ebitda', 'EBITDA', () => `=SUM(${c('rev')}:${c('site')})`),
        f('isDep', 'Depreciation', () => `=-${c('dep')}`), f('isInt', 'Interest', () => `=-${c('interest')}`), tot('ebt', 'Earnings before tax', () => `=${c('ebitda')}+${c('isDep')}+${c('isInt')}`),
        f('tax', 'Tax', () => `=-MAX(${c('ebt')},0)*${c('taxRate')}`), tot('ni', 'Net income', () => `=${c('ebt')}+${c('tax')}`, { final: true }),
      ] },
      { title: 'Cash flow statement (cash in positive, cash out negative)', rows: [
        f('cfNi', 'Net income', () => `=${c('ni')}`, { dollar: true }), f('cfDep', 'Depreciation added back', () => `=${c('dep')}`),
        f('cfRec', 'Change in receivables (three days of the week\'s card revenue, less the opening)', () => `=-(${c('rev')}/7*${c('lag')}-${c('oRec')})`),
        f('cfPay', 'Change in payables (the delivery is unpaid)', () => `=${c('delivery')}-${c('oPay')}`), f('cfTax', 'Change in tax payable', () => `=-${c('tax')}-${c('oTaxPay')}`),
        tot('cfo', 'Cash from operations', () => `=SUM(${c('cfNi')}:${c('cfTax')})`),
        f('cfPrin', 'Loan principal repaid', () => `=-${c('principal')}`), tot('cff', 'Cash from financing', () => `=${c('cfPrin')}`),
        tot('net', 'Net change in cash', () => `=${c('cfo')}+${c('cff')}`), f('open', 'Opening cash', () => `=${c('oCash')}`), tot('close', 'Closing cash', () => `=${c('open')}+${c('net')}`, { final: true }),
      ] },
      { title: 'Balance sheet at the end of the week', rows: [
        f('bsCash', 'Cash', () => `=${c('close')}`, { dollar: true }), f('bsRec', 'Receivables', () => `=${c('rev')}/7*${c('lag')}`), f('bsPpe', 'PP&E, net', () => `=${c('oPpe')}-${c('dep')}`),
        tot('ta', 'Total assets', () => `=SUM(${c('bsCash')}:${c('bsPpe')})`),
        f('bsPay', 'Payables', () => `=${c('oPay')}+${c('delivery')}`), f('bsTax', 'Tax payable', () => `=${c('oTaxPay')}-${c('tax')}`), f('bsLoan', 'Loan', () => `=${c('oLoan')}-${c('principal')}`),
        f('bsEq', 'Equity (opening plus net income)', () => `=${c('oEq')}+${c('ni')}`), tot('tle', 'Total liabilities and equity', () => `=SUM(${c('bsPay')}:${c('bsEq')})`, { final: true }),
        f('check', 'Balance check: assets less liabilities and equity', () => `=ROUND(${c('ta')}-${c('tle')},2)`, { kind: 'count' }),
      ] },
      { title: 'A second answer for cash: the week counted directly', rows: [
        f('dWashes', 'Washes collected (revenue less the rise in receivables)', () => `=${c('rev')}+${c('cfRec')}`, { dollar: true }), f('dPayroll', 'Payroll paid', () => `=-${c('payroll')}`), f('dLoan', 'Loan payment', () => `=-${c('loanPay')}`),
        tot('dNet', 'Net cash, counted', () => `=SUM(${c('dWashes')}:${c('dLoan')})`),
        f('dCheck', 'Counted less the statement\'s net change', () => `=ROUND(${c('dNet')}-${c('net')},2)`, { kind: 'count' }),
      ] },
    ],
    source: 'The delivery is on credit, so it is not in the count; the tax is accrued, so it is not in the count either.',
  });
  return sheet;
}

/* ---- Data: the accountants' export (off the standard) ---- */
function pageData() {
  const cells = {
    A1: { value: `${COMPANY}: historical accounts as sent by the accountants`, bold: true },
    A2: { value: 'USD thousands; fiscal years ending December 31; FY2023 is the opening balance sheet', it: true },
    B4: { value: 'Line', bold: true },
  };
  [2023, 2024, 2025, 2026].forEach((y, i) => { cells['CDEF'[i] + '4'] = { value: y, bold: true, align: 'r', fontColor: 'blue' }; });
  DATA_LINES.forEach(([label, key], i) => {
    const r = 5 + i;
    cells['B' + r] = { value: label };
    HIST[key].forEach((v, j) => { if (v != null) cells['CDEF'[j] + r] = { value: v, fontColor: 'blue', fmtStyle: 'comma', decimals: 0 }; });
  });
  return { name: 'Data', cells, colW: { 1: 24, 2: 220, 3: 89, 4: 89, 5: 89, 6: 89 }, freeze: { r: 4, c: 2 }, active: { r: 1, c: 1 } };
}

/* ---------------- the solved workbook ---------------- */

function buildAll() {
  const build = () => ({
    Cover: pageCover(), Inputs: pageInputs(), IS: pageIS(), CF: pageCF(), BS: pageBS(), Schedules: pageSchedules(), Checks: pageChecks(), DCF: pageDCF(),
    'One site': pageOneSite(), 'One week': pageOneWeek(),
  });
  ROWS = {}; firstPass = true; build();   // the layout pass: where every keyed row lands
  firstPass = false;
  const pages = build();                   // the real pass: formulas name their rows
  return pages;
}
const PAGES = buildAll();
/** Where each keyed line of each sheet landed (lessons and tests address rows by key). */
export const ROW = clone(ROWS);
/**
 * The Cover rebuilt with more sheets on its map (Chapter 6 adds its valuation pages): the same two
 * passes, on a scratch row table, so nothing here moves. Returns { sheet, at }.
 */
export function coverWith(extraLinks) {
  const saved = ROWS, savedPass = firstPass;
  ROWS = clone(ROW); firstPass = true; pageCover(extraLinks);
  firstPass = false; const sheet = pageCover(extraLinks); const at = ROWS.Cover;
  ROWS = saved; firstPass = savedPass;
  return { sheet, at };
}
export const NAMES = { Case: 'Cover!$C$6', LastHistorical: `Inputs!$C$${ROW.Inputs.lasthist}`, Circ: `Inputs!$C$${ROW.Inputs.circ}`, WACC: `DCF!$C$${ROW.DCF.wacc}` };
/** The Watch Window's two rows (5.5.2 adds them): the Cover's flag and its sum of differences, in view on every sheet. */
export const WATCHES = [{ sheet: 'Cover', key: 'C' + ROW.Cover.flag }, { sheet: 'Cover', key: 'C' + ROW.Cover.diff }];

const DONE = {
  sheets: [...SHEET_ORDER.slice(0, 10).map(n => PAGES[n]), pageData()],
  settings: { calcMode: 'automatic', iterative: true, maxIterations: 100, maxChange: 0.001, qat: ['save', 'undo', 'redo', 'fontColor', 'fillColor', 'borders', 'decDecimal'], enterMoves: false },
  names: { ...NAMES },
  watches: WATCHES.map(w => ({ ...w })),
};

/* ---------------- state helpers ---------------- */

/** A state built on first use and kept: derive(base, fn) clones the base state (a state or a thunk of one) and patches it. */
const lazy = fn => { let v; return () => (v === undefined ? (v = fn()) : v); };
function derive(base, fn) { return lazy(() => { const next = clone(typeof base === 'function' ? base() : base); fn(next); return next; }); }
const sheetOf = (state, name) => state.sheets.find(s => s.name === name);
const cellsOf = (state, name) => sheetOf(state, name).cells;
const rowOf = (name, key) => { const r = ROW[name] && ROW[name][key]; if (!r) throw new Error(`no row ${name}.${key}`); return r; };
/** Strip the figures of keyed rows (labels stay) on a sheet, over `cols`. */
function strip(state, name, keys, cols = [...COLS, 'K']) {
  const cells = cellsOf(state, name);
  for (const key of keys) for (const col of cols) delete cells[col + rowOf(name, key)];
}
/** Every keyed row from `from` to `to` inclusive (in layout order). */
function span(name, from, to) {
  const t = ROW[name]; const a = t[from], b = t[to];
  return Object.keys(t).filter(k => t[k] >= a && t[k] <= b);
}
const allKeys = name => Object.keys(ROW[name]);
/** Strip every figure on a sheet (rows 5 down, columns A and C on); titles, units, the timeline and the labels stay. */
function stripFigures(state, name, { keepTimeline = true } = {}) {
  const cells = cellsOf(state, name);
  for (const k of Object.keys(cells)) {
    const m = /^([A-Z]+)(\d+)$/.exec(k); if (!m) continue;
    const r = +m[2];
    if (r >= 5 && m[1] !== 'B') delete cells[k];
    if (r === 4 && !keepTimeline && m[1] !== 'B') delete cells[k];
  }
}
/** Replace a keyed row's formulas by typed values over the historical years (blue), keeping its formats. */
function typeHist(state, name, key, values, cols = HIST_COLS) {
  const cells = cellsOf(state, name); const r = rowOf(name, key);
  cols.forEach((col, i) => { const c = { ...(cells[col + r] || {}) }; delete c.formula; c.value = values[i]; c.fontColor = 'blue'; cells[col + r] = c; });
}
/** Mark a check row pending: figures gone, "pending" beside the timeline. */
function pend(state, keys) {
  const cells = cellsOf(state, 'Checks');
  for (const key of keys) { for (const col of COLS) delete cells[col + rowOf('Checks', key)]; cells['K' + rowOf('Checks', key)] = { value: 'pending', it: true }; }
}
const unpend = (state, keys) => { const cells = cellsOf(state, 'Checks'); for (const key of keys) delete cells['K' + rowOf('Checks', key)]; };
/** A planted cell on a sheet: merged into the cell it replaces; a typed value takes a formula's place (and a formula a value's). */
const plant = (state, name, ref, cell) => { const cells = cellsOf(state, name); if (cell === null) { delete cells[ref]; return; } const c = { ...(cells[ref] || {}), ...cell }; if ('value' in cell && !('formula' in cell)) delete c.formula; if ('formula' in cell) delete c.value; cells[ref] = c; };
const setFormula = (state, name, ref, formula) => { const cells = cellsOf(state, name); cells[ref] = { ...(cells[ref] || {}), formula }; delete cells[ref].value; };

/** The historical values of the CF and BS lines (what the shell carries typed before the statements are linked). */
const H3 = key => [1, 2, 3].map(i => HIST[key][i]);
const CF_HIST = { ni: H3('ni'), dep: H3('dep'), chgRec: [1, 2, 3].map(i => -(HIST.rec[i] - HIST.rec[i - 1])), chgPay: [1, 2, 3].map(i => HIST.pay[i] - HIST.pay[i - 1]), chgDef: [1, 2, 3].map(i => HIST.def[i] - HIST.def[i - 1]),
  cfo: H3('cfo'), capex: H3('capex').map(v => -v), cfi: H3('cfi'), termDrawn: H3('drawn'), termRepaid: H3('repaid').map(v => -v), ddDrawn: [0, 0, 0], ddRepaid: [0, 0, 0], dist: [0, 0, 0], cbr: H3('cash'), rev: [0, 0, 0], cff: H3('cff'),
  net: H3('net'), open: [0, 1, 2].map(i => HIST.cash[i]), close: H3('cash') };
const BS_HIST = { cash: H3('cash'), rec: H3('rec'), land: H3('land'), ppe: H3('ppe'), ta: [1, 2, 3].map(i => HIST.cash[i] + HIST.rec[i] + HIST.land[i] + HIST.ppe[i]),
  pay: H3('pay'), def: H3('def'), term: H3('loan'), dd: [0, 0, 0], rev: [0, 0, 0], tl: [1, 2, 3].map(i => HIST.pay[i] + HIST.def[i] + HIST.loan[i]),
  openEq: [0, 1, 2].map(i => HIST.equity[i]), ni: H3('ni'), dist: [0, 0, 0], closeEq: H3('equity'), tle: [1, 2, 3].map(i => HIST.pay[i] + HIST.def[i] + HIST.loan[i] + HIST.equity[i]), check: [0, 0, 0] };
function typeStatementHist(state, name, table) {
  for (const key in table) { typeHist(state, name, key, table[key]); strip(state, name, [key], PROJ_COLS); }
}

/* ---------------- module 5.1: the three statements (One site, One week) ---------------- */

const SITE_BLOCKS = { is: ['rev', 'ni'], accrual: ['cashIn1', 'cfoHand'], cf: ['cfNi', 'close'], bs: ['bsCash', 'check'], ratios: ['rMargin', 'rReturn'] };
const stripSite = (state, name, blocks) => { for (const b of blocks) strip(state, name, span(name, ...SITE_BLOCKS[b])); };
const onlyPages = (state, names) => { state.sheets = state.sheets.filter(s => names.includes(s.name)); delete state.names; delete state.watches; };

// B517: before 5.1.7, One site has everything but the ratios; One week is done
const B517 = derive(DONE, s => { onlyPages(s, ['One site', 'One week']); stripSite(s, 'One site', ['ratios']); });
// B516: before 5.1.6, One week holds the events and the opening balance sheet only
const B516 = derive(B517, s => { strip(s, 'One week', span('One week', 'rev', 'dCheck')); });
// B515: before 5.1.5 (the links tour), the One week page is not there yet
const B515 = derive(B516, s => { onlyPages(s, ['One site']); });
// B514: before 5.1.4, the balance sheet block is empty
const B514 = derive(B515, s => { stripSite(s, 'One site', ['bs']); });
// B513: before 5.1.3, the cash flow block too
const B513 = derive(B514, s => { stripSite(s, 'One site', ['cf']); });
// B512: before 5.1.2, the accrual block too
const B512 = derive(B513, s => { stripSite(s, 'One site', ['accrual']); });
// B511: before 5.1.1, the inputs only
const B511 = derive(B512, s => { stripSite(s, 'One site', ['is']); });
// B51C: the challenge, another site's month: inputs given, everything else to build
const B51C = lazy(() => {
  const st = { sheets: [pageOneSite(SITE_CHALLENGE, 'One site')], settings: clone(DONE.settings) };
  ROWS['One site'] = ROW['One site'];   // the challenge page shares the layout
  stripSite(st, 'One site', ['is', 'accrual', 'cf', 'bs', 'ratios']);
  return st;
});

/* ---------------- module 5.2: model setup ---------------- */

const SHUFFLED = ['Checks', 'BS', 'DCF', 'Inputs', 'Schedules', 'Cover', 'CF', 'IS'];
/** The IS historical block as 5.2.5 leaves it: INDEX/MATCH on Data in the actual years, nothing projected yet. */
function isHistOnly(state) {
  const cells = cellsOf(state, 'IS');
  for (const key of allKeys('IS')) {
    const r = rowOf('IS', key);
    for (const col of PROJ_COLS) delete cells[col + r];
    for (const col of HIST_COLS) {
      const c = cells[col + r]; if (!c || !c.formula) continue;
      const m = /^=IF\(Inputs!\w\$\d+=0,(.*),(?:-?Schedules!\w+\d+)\)$/.exec(c.formula);
      if (m) c.formula = '=' + m[1];
    }
  }
  for (const key of ['gm', 'cm', 'em', 'nm']) strip(state, 'IS', [key]);
}

// B531 (= after 5.2.6): the shell complete, every schedule and statement still to build
const B531 = derive(DONE, s => {
  delete s.watches;   // the Watch Window's rows arrive with 5.5.2
  isHistOnly(s);
  typeStatementHist(s, 'CF', CF_HIST); typeStatementHist(s, 'BS', BS_HIST);
  stripFigures(s, 'Schedules');
  // the cost build's per-site rows and their total came with 5.2.3
  const done = cellsOf(DONE, 'Schedules'), cells = cellsOf(s, 'Schedules');
  for (const key of ['labor', 'rent', 'util', 'maint', 'card', 'mkt', 'siteCosts']) for (const col of ['A', ...COLS]) if (done[col + rowOf('Schedules', key)]) cells[col + rowOf('Schedules', key)] = clone(done[col + rowOf('Schedules', key)]);
  stripFigures(s, 'DCF');
  pend(s, ['debt', 'ppe', 'rev', 'xfoot', 'eq', 'ebitda']);
  strip(s, 'Checks', ['debtNeg', 'ppeNeg', 'termEff', 'ddEff', 'revEff', 'roundTrip', 'npv', 'errIS', 'errCF', 'errBS', 'errSch', 'errDCF', 'errInp', 'hcIS', 'hcCF', 'hcBS', 'hcSch']);
  setFormula(s, 'Checks', 'C' + rowOf('Checks', 'rollup'), `=SUMPRODUCT(ABS(C${rowOf('Checks', 'bs')}:J${rowOf('Checks', 'npv')}))`);
  delete s.names.WACC;
});
// B526: before 5.2.6, no drivers blocks, no live block, no case highlight, titles without the case name
const B526 = derive(B531, s => {
  const keys = [];
  for (const k of CASE_KEYS) for (const [d] of DRIVERS) keys.push(k + d);
  for (const [d] of DRIVERS) keys.push('l' + d);
  strip(s, 'Inputs', keys);
  delete sheetOf(s, 'Inputs').condFmt;
  for (const [name, what] of [['IS', 'income statement'], ['CF', 'cash flow statement'], ['BS', 'balance sheet'], ['DCF', 'DCF']]) setFormula(s, name, 'A1', `=Inputs!$C$${ROW.Inputs.company}&": ${what}"`);
  setFormula(s, 'Cover', 'A1', `=Inputs!$C$${ROW.Inputs.company}&": operating model"`);
});
// B525: before 5.2.5, the IS historicals are not populated; the helper column is empty
const B525 = derive(B526, s => { stripFigures(s, 'IS'); });
// B524: before 5.2.4, the Checks sheet is a title, a timeline and the flag waiting on an empty roll-up
const B524 = derive(B525, s => {
  const cells = cellsOf(s, 'Checks');
  const keep = new Set(['A1', 'A2', ...COLS.map(c => c + '4'), 'B' + rowOf('Checks', 'rollup'), 'B' + rowOf('Checks', 'flag'), 'C' + rowOf('Checks', 'flag')]);
  for (const k of Object.keys(cells)) if (!keep.has(k)) delete cells[k];
  delete sheetOf(s, 'Checks').condFmt;
  const cover = cellsOf(s, 'Cover'); delete cover['C' + rowOf('Cover', 'diff')];
});
// B523: before 5.2.3, the cost build has its labels and the labor row's first-period formula; nothing filled, nothing formatted
const B523 = derive(B524, s => {
  const cells = cellsOf(s, 'Schedules');
  strip(s, 'Schedules', ['labor', 'rent', 'util', 'maint', 'card', 'mkt'], ['D', 'E', 'F', 'G', 'H', 'I', 'J']);
  strip(s, 'Schedules', ['siteCosts']);
  for (const key of ['labor', 'rent', 'util', 'maint', 'card', 'mkt']) { const c = cells['C' + rowOf('Schedules', key)]; if (c && key !== 'labor') delete cells['C' + rowOf('Schedules', key)]; else if (c) { delete c.fmtStyle; delete c.numFmt; delete c.decimals; } }
});
// B522: before 5.2.2, no timeline anywhere, no flags, no counters, no LastHistorical
const B522 = derive(B523, s => {
  strip(s, 'Inputs', ['ae', 'flag', 'per', 'pcnt', 'cols', 'ccheck', 'lasthist']);
  strip(s, 'Schedules', ['labor']);   // the first-period formula of 5.2.3 reads the timeline, which is not there yet
  for (const col of COLS) delete cellsOf(s, 'Inputs')[col + '4'];
  for (const name of ['IS', 'CF', 'BS', 'Schedules', 'Checks', 'DCF']) for (const col of COLS) delete cellsOf(s, name)[col + '4'];
  delete s.names.LastHistorical;
  const cover = cellsOf(s, 'Cover'); delete cover['C' + rowOf('Cover', 'n2')];
});
// B521: before 5.2.1, the eight sheets in a random order and the Cover empty
const B521 = derive(B522, s => {
  const rest = s.sheets.filter(x => !MODEL_SHEETS.includes(x.name));
  s.sheets = [...SHUFFLED.map(n => sheetOf(s, n)), ...rest];
  sheetOf(s, 'Cover').cells = {};
  delete s.names;
});
// B52C: the challenge shell is the same file
const B52C = derive(B521, () => {});

/* ---------------- module 5.3: schedules ---------------- */

const SCH = {
  rollout: span('Schedules', 'openSites', 'avgSites'), revenue: span('Schedules', 'washDayM', 'revPerWash'),
  costs: ['cos', 'cosShare', 'contrib', 'cm', 'ho', 'ebitda', 'em'], wc: span('Schedules', 'rec', 'ccc'),
  ppe: [...span('Schedules', 'ppeOpen', 'impliedLife'), ...span('Schedules', 'wfBase', 'wfTotal')],
  debt: [...span('Schedules', 'termOpen', 'termEff'), ...span('Schedules', 'ddOpen', 'ddEff'), 'totalDebt', 'totalInt', 'netDebt'],
  revolver: span('Schedules', 'revOpen', 'revEff'), tax: span('Schedules', 'ebt', 'effTax'),
};
// B541 (= after 5.3.6): every schedule but the revolver built; the statements not yet linked
const B541 = derive(B531, s => {
  const done = cellsOf(DONE, 'Schedules'), cells = cellsOf(s, 'Schedules');
  for (const key of allKeys('Schedules')) if (!SCH.revolver.includes(key)) for (const col of ['A', ...COLS]) { const k = col + rowOf('Schedules', key); if (done[k]) cells[k] = clone(done[k]); else delete cells[k]; }
  unpend(s, ['rev']); for (const col of COLS) cellsOf(s, 'Checks')[col + rowOf('Checks', 'rev')] = clone(cellsOf(DONE, 'Checks')[col + rowOf('Checks', 'rev')]);
  for (const key of ['termEff', 'ddEff', 'revEff']) for (const col of COLS) cellsOf(s, 'Checks')[col + rowOf('Checks', key)] = clone(cellsOf(DONE, 'Checks')[col + rowOf('Checks', key)]);
});
const B536 = derive(B541, s => { strip(s, 'Schedules', SCH.tax); });
const B535 = derive(B536, s => { strip(s, 'Schedules', SCH.debt); strip(s, 'Checks', ['termEff', 'ddEff', 'revEff']); });
const B534 = derive(B535, s => { strip(s, 'Schedules', SCH.ppe); });
const B533 = derive(B534, s => { strip(s, 'Schedules', SCH.wc); });
const B532 = derive(B533, s => { strip(s, 'Schedules', SCH.costs); });
// B531 is before 5.3.1 (defined above); B53C: inputs and a timeline and no schedules at all
const B53C = derive(B531, s => { stripFigures(s, 'Schedules'); });

/* ---------------- module 5.4: linking the statements ---------------- */

// B545 (= after 5.4.4): the model complete and balanced; Checks still waits on 5.5
const B545 = derive(DONE, s => {
  delete s.watches;
  pend(s, ['xfoot', 'eq', 'ebitda']);
  strip(s, 'Checks', ['debtNeg', 'ppeNeg', 'roundTrip', 'npv', 'errIS', 'errCF', 'errBS', 'errSch', 'errDCF', 'errInp', 'hcIS', 'hcCF', 'hcBS', 'hcSch']);
  setFormula(s, 'Checks', 'C' + rowOf('Checks', 'rollup'), `=SUMPRODUCT(ABS(C${rowOf('Checks', 'bs')}:J${rowOf('Checks', 'npv')}))`);
  stripFigures(s, 'DCF');
  delete s.names.WACC;
});
// B544: before 5.4.4, the revolver block is empty (its links on the CF and BS read zero)
const B544 = derive(B545, s => { strip(s, 'Schedules', SCH.revolver); });
// B543: before 5.4.3, the balance sheet is typed history and empty projection; debt and PP&E ties pending
const B543 = derive(B544, s => { typeStatementHist(s, 'BS', BS_HIST); pend(s, ['debt', 'ppe']); });
// B542: before 5.4.2, the cash flow statement too
const B542 = derive(B543, s => { typeStatementHist(s, 'CF', CF_HIST); });
// B541 is before 5.4.1 (defined above)
/** The six breaks 5.4.5 plants, one a column from FY27: [sheet, ref, cell] (null empties the cell). */
export const BREAKS = [
  ['CF', 'F' + rowOf('CF', 'dep'), null],                                                   // FY27: depreciation not added back
  ['BS', 'G' + rowOf('BS', 'cash'), { value: 5000, fontColor: 'blue' }],                     // FY28: cash typed on the balance sheet
  ['CF', 'H' + rowOf('CF', 'chgRec'), { formula: `=-Schedules!H${rowOf('Schedules', 'chgRec')}` }],   // FY29: the sign on a working-capital change
  ['Schedules', 'I' + rowOf('Schedules', 'ppeClose'), { formula: `=IF(Inputs!I$${ROW.Inputs.flag}=0,${dat(rowOf('Schedules', 'ppeClose'), 'I')},I${rowOf('Schedules', 'ppeOpen')}-I${rowOf('Schedules', 'dep')})` }],   // FY30: capex on the CF but not in PP&E
  ['BS', 'J' + rowOf('BS', 'ni'), null],                                                    // FY31: net income not flowing to equity
  ['CF', 'J' + rowOf('CF', 'capex'), { formula: `=-(Schedules!J${rowOf('Schedules', 'ppeClose')}-Schedules!J${rowOf('Schedules', 'ppeOpen')})` }],   // FY31: the PP&E change netted (depreciation counted twice)
];
const plantAll = (s, list) => { for (const [name, ref, cell] of list) plant(s, name, ref, cell); };
// B545 is before 5.4.5 only once the breaks are planted
const B545broken = derive(B545, s => plantAll(s, BREAKS));
// B54C: schedules done, statements empty
const B54C = derive(B544, s => { for (const name of ['IS', 'CF', 'BS']) stripFigures(s, name); });

/* ---------------- module 5.5: auditing ---------------- */
// Each state is what the lesson before it leaves, clean. What a lesson plants for the learner to
// find (the #REF!, the sweep's typed figures and pattern break, the bare margins) rides on the
// lesson as its planting (plantPatch), so a lesson's solution leaves exactly the next one's start.

// B551: before 5.5.1 (= after 5.4.5, the breaks fixed)
const B551 = derive(B545, () => {});
const ERR_KEYS = ['errIS', 'errCF', 'errBS', 'errSch', 'errDCF', 'errInp'], HC_KEYS = ['hcIS', 'hcCF', 'hcBS', 'hcSch'];
/** Put a keyed row's finished cells back from DONE (over `cols`). */
const fromDone = (s, name, keys, cols = COLS) => { const done = cellsOf(DONE, name), cells = cellsOf(s, name); for (const key of keys) for (const col of cols) { const k = col + rowOf(name, key); if (done[k]) cells[k] = clone(done[k]); } };
/** The roll-up once 5.5.2 folds the error counts in (5.5.3 adds the hardcode counts: DONE's formula). */
export const ROLLUP_ERRORS = `=SUMPRODUCT(ABS(C${rowOf('Checks', 'bs')}:J${rowOf('Checks', 'npv')}))+SUM(C${rowOf('Checks', 'errIS')}:C${rowOf('Checks', 'errInp')})`;
// B552: before 5.5.2 (= after 5.5.1): every tie and both limit checks live; no error or hardcode counts yet; the DCF page is labels
const B552 = derive(DONE, s => {
  strip(s, 'Checks', [...ERR_KEYS, ...HC_KEYS, 'roundTrip', 'npv']);
  setFormula(s, 'Checks', 'C' + rowOf('Checks', 'rollup'), `=SUMPRODUCT(ABS(C${rowOf('Checks', 'bs')}:J${rowOf('Checks', 'npv')}))`);
  stripFigures(s, 'DCF');
  delete s.names.WACC; delete s.watches;
});
/** What 5.5.2 plants: one #REF! in a memo cell on Schedules (the ties still read zero; the count reads 1). */
export const PLANT_REF = ['Schedules', 'H' + rowOf('Schedules', 'capexToDep'), { formula: `=H${rowOf('Schedules', 'capexTotal')}/#REF!` }];
// B553: before 5.5.3: the errors block, folded into the roll-up, and the Watch Window's two rows
const B553 = derive(B552, s => { fromDone(s, 'Checks', ERR_KEYS, ['C']); setFormula(s, 'Checks', 'C' + rowOf('Checks', 'rollup'), ROLLUP_ERRORS); s.watches = WATCHES.map(w => ({ ...w })); });
/** What 5.5.3 plants: two typed numbers in the IS projection and a labor formula that lost its anchor in FY29. */
export const PLANT_SWEEP = [
  ['IS', 'G' + rowOf('IS', 'util'), { value: -3100, fontColor: 'blue' }],
  ['IS', 'I' + rowOf('IS', 'mkt'), { value: -1400, fontColor: 'blue' }],
  ['Schedules', 'H' + rowOf('Schedules', 'labor'), { formula: `=IF(Inputs!H$${ROW.Inputs.flag}=0,${dat(rowOf('Schedules', 'labor'), 'H')},Inputs!H$${ROW.Inputs.labor}*(1+Inputs!$C$${ROW.Inputs.infl})^Inputs!H$${ROW.Inputs.pcnt}*H${rowOf('Schedules', 'avgSites')})` }],
];
// B554: before 5.5.4: the hardcode counts and the full roll-up
const B554 = derive(B553, s => { fromDone(s, 'Checks', [...HC_KEYS, 'rollup'], ['C']); });
/** What 5.5.4 plants: the IS margins dividing bare, so a zero revenue shows #DIV/0!. */
export const PLANT_MARGINS = [['gm', 'gp'], ['cm', 'contrib'], ['em', 'ebitda'], ['nm', 'ni']].flatMap(([key, num]) => COLS.map(col => ['IS', col + rowOf('IS', key), { formula: `=${col}${rowOf('IS', num)}/${col}${rowOf('IS', 'rev')}` }]));
// B55C: the eight faults on the linked model
export const FAULTS = [
  PLANT_SWEEP[0], PLANT_SWEEP[1], PLANT_SWEEP[2],
  ['CF', 'H' + rowOf('CF', 'chgRec'), { formula: `=-Schedules!H${rowOf('Schedules', 'chgRec')}` }],
  ['CF', 'G' + rowOf('CF', 'dep'), null],
  PLANT_REF,
  ...COLS.map(col => ['Checks', col + rowOf('Checks', 'eq'), { value: 0, fontColor: 'blue' }]),
  ['BS', 'J' + rowOf('BS', 'cash'), { formula: `=J${rowOf('BS', 'tle')}-J${rowOf('BS', 'rec')}-J${rowOf('BS', 'land')}-J${rowOf('BS', 'ppe')}` }],
];
const B55C = derive(B554, s => { plantAll(s, FAULTS); });
/**
 * A planting as a lesson's state patch ({ 'Sheet!A1': cell | null }), laid over the named state:
 * each planted record merges into the cell it replaces, and a typed value takes the formula's place.
 */
export function plantPatch(stateId, list) {
  const st = STATES[stateId]; const out = {};
  for (const [name, ref, cell] of list) {
    if (cell === null) { out[name + '!' + ref] = null; continue; }
    const base = clone((cellsOf(st, name) || {})[ref] || {});
    const merged = { ...base, ...cell };
    if ('value' in cell && !('formula' in cell)) delete merged.formula;
    if ('formula' in cell) delete merged.value;
    out[name + '!' + ref] = merged;
  }
  return out;
}

/* ---------------- module 5.6: DCF ---------------- */

const DCFB = {
  fcf: span('DCF', 'ebitda', 'fcfShare'), disc: span('DCF', 't', 'pvEnd'), tv: span('DCF', 'tvPerp', 'tv'), ev: span('DCF', 'dfPerp', 'evMult'),
  wacc: span('DCF', 'rf', 'wacc'), sens: span('DCF', 'ptW', 'sm4'),
};
// B566: before 5.6.6, the pass-through drivers and the sensitivity tables are labels
const B566 = derive(DONE, s => { strip(s, 'DCF', DCFB.sens); });
// B565: before 5.6.5, the discounting and enterprise value blocks too; the NPV cross-check waits
const B565 = derive(B566, s => { strip(s, 'DCF', [...DCFB.disc, ...DCFB.ev]); strip(s, 'Checks', ['npv']); });
// B564: before 5.6.4, the terminal value block and the normalized FY31 column too; the round trip waits
const B564 = derive(B565, s => { strip(s, 'DCF', DCFB.tv); strip(s, 'DCF', DCFB.fcf, ['K']); strip(s, 'Checks', ['roundTrip']); });
// B563: before 5.6.3, the WACC block too, and no WACC name
const B563 = derive(B564, s => { strip(s, 'DCF', DCFB.wacc); delete s.names.WACC; });
// B562: before 5.6.2, the free-cash-flow block holds the valuation date and the three links 5.6.1 made
const B562 = derive(B563, s => { strip(s, 'DCF', DCFB.fcf.filter(k => !['ebitda', 'capex', 'nwc'].includes(k))); });
// B561: before 5.6.1 (= after 5.5.4): the DCF page is its title, the timeline and the labels
const B561 = derive(B562, s => { stripFigures(s, 'DCF'); });
// B56C: a DCF from a given free-cash-flow line (typed), the rest to build
export const FCF_GIVEN = [-900, 2100, 4500, 7000, 9400];
const B56C = derive(B561, s => {
  const done = sheetOf(DONE, 'DCF'); const sh = sheetOf(s, 'DCF');
  PROJ_COLS.forEach((col, i) => { sh.cells[col + rowOf('DCF', 'fcf')] = { ...clone(done.cells[col + rowOf('DCF', 'fcf')]), value: FCF_GIVEN[i], fontColor: 'blue' }; delete sh.cells[col + rowOf('DCF', 'fcf')].formula; });
  sh.cells['K' + rowOf('DCF', 'fcf')] = { ...clone(done.cells['K' + rowOf('DCF', 'fcf')]), value: FCF_GIVEN[4], fontColor: 'blue' }; delete sh.cells['K' + rowOf('DCF', 'fcf')].formula;
});

/* ---------------- the challenges' seeds ---------------- */

/** Each module challenge, the state it opens on. */
export const CHALLENGES = {
  'challenge-eight-faults': { before: 'B55C' },
  'challenge-dcf': { before: 'B56C' },
};
const step = (rng, lo, hi, by) => lo + Math.floor(rng() * (Math.round((hi - lo) / by) + 1)) * by;
/**
 * A module challenge's seed patch: content only, never workload. 5.5.C retypes the two planted
 * hardcodes at fresh figures; 5.6.C scales the given free-cash-flow line (the normalized year
 * follows FY31).
 */
export function challengeSeed(id, rng) {
  if (!CHALLENGES[id]) throw new Error('clearcoat-model: no challenge ' + id);
  const st = STATES[CHALLENGES[id].before]; const p = {};
  if (id === 'challenge-eight-faults') {
    for (const [name, ref, lo, hi] of [['IS', PLANT_SWEEP[0][1], 2600, 3600], ['IS', PLANT_SWEEP[1][1], 1100, 1700]]) p[name + '!' + ref] = { ...clone(cellsOf(st, name)[ref]), value: -step(rng, lo, hi, 50) };
  }
  if (id === 'challenge-dcf') {
    const k = step(rng, 85, 115, 5) / 100; const cells = cellsOf(st, 'DCF'); const r = rowOf('DCF', 'fcf');
    const flows = FCF_GIVEN.map(v => Math.round(v * k / 100) * 100);
    PROJ_COLS.forEach((col, i) => { p['DCF!' + col + r] = { ...clone(cells[col + r]), value: flows[i] }; });
    p['DCF!K' + r] = { ...clone(cells['K' + r]), value: flows[4] };
  }
  return p;
}

/* ---------------- module 5.7: model speed (each starts from the finished model) ---------------- */

const B571 = derive(DONE, s => { strip(s, 'Schedules', [...SCH.rollout, ...SCH.revenue]); });
const FILL_BLOCK = [...span('Schedules', 'cos', 'em'), ...SCH.wc, ...span('Schedules', 'ppeOpen', 'impliedLife')];
const B572 = derive(DONE, s => {
  strip(s, 'Schedules', FILL_BLOCK, ['D', 'E', 'F', 'G', 'H', 'I', 'J']);
  const cells = cellsOf(s, 'Schedules');
  for (const key of FILL_BLOCK) { const c = cells['C' + rowOf('Schedules', key)]; if (!c) continue; delete c.fmtStyle; delete c.numFmt; delete c.decimals; delete c.bold; delete c.bt; delete c.bdbl; delete c.it; }
});
const B573 = derive(DONE, s => { strip(s, 'CF', allKeys('CF')); });

/* ---------------- module 5.8: project and assessment ---------------- */

// B5P: the project's shell: inputs, Data, the timeline, every other page empty labels
const B5P = derive(DONE, s => {
  delete s.watches;
  for (const name of ['IS', 'CF', 'BS', 'Schedules', 'Checks', 'DCF']) stripFigures(s, name);
  for (const name of ['IS', 'CF', 'BS', 'DCF']) setFormula(s, name, 'A1', `=Inputs!$C$${ROW.Inputs.company}&": ${{ IS: 'income statement', CF: 'cash flow statement', BS: 'balance sheet', DCF: 'DCF' }[name]}"`);
  // the Cover keeps its title, the case switch and the case names (the live drivers block reads Case); the flag and the map are the project's to build
  const cover = sheetOf(s, 'Cover'); const done = cellsOf(DONE, 'Cover');
  const keep = ['A1', 'A2', 'B4', 'C4', 'D4', ...['case', 'casen', 'c1', 'c2', 'c3'].flatMap(k => ['B', 'C'].map(col => col + rowOf('Cover', k))), 'B' + (rowOf('Cover', 'c1') - 1)];
  cover.cells = Object.fromEntries(keep.filter(k => done[k]).map(k => [k, clone(done[k])]));
  setFormula(s, 'Cover', 'A1', `=Inputs!$C$${ROW.Inputs.company}&": operating model"`);
  s.names = { Case: NAMES.Case, LastHistorical: NAMES.LastHistorical, Circ: NAMES.Circ };
  pend(s, ['su']);
});
// B5A: the assessment: everything built except the debt schedule and its links
const B5A = derive(DONE, s => {
  strip(s, 'Schedules', [...SCH.debt, ...SCH.revolver]);
  strip(s, 'IS', ['int']); strip(s, 'CF', ['termDrawn', 'termRepaid', 'ddDrawn', 'ddRepaid', 'rev']); strip(s, 'BS', ['term', 'dd', 'rev']);
});

const BUILDERS = {
  B511, B512, B513, B514, B515, B516, B517, B51C,
  B521, B522, B523, B524, B525, B526, B52C,
  B531, B532, B533, B534, B535, B536, B53C,
  B541, B542, B543, B544, B545: B545broken, B54C,
  B551, B552, B553, B554, B55C,
  B561, B562, B563, B564, B565, B566, B56C,
  B571, B572, B573, B5P, B5A, DONE: () => DONE,
};
/** The named states, each built on first read (a lesson loads one; a test that walks them all pays once). */
export const STATES = {};
for (const id in BUILDERS) Object.defineProperty(STATES, id, { get: BUILDERS[id], enumerable: true });
export const STATE_ORDER = Object.keys(BUILDERS);
/** Which lesson each state starts (the state after a lesson is the next lesson's start; DONE closes every module). */
export const STATE_LESSONS = {
  B511: '5.1.1', B512: '5.1.2', B513: '5.1.3', B514: '5.1.4', B515: '5.1.5', B516: '5.1.6', B517: '5.1.7', B51C: '5.1.C',
  B521: '5.2.1', B522: '5.2.2', B523: '5.2.3', B524: '5.2.4', B525: '5.2.5', B526: '5.2.6', B52C: '5.2.C',
  B531: '5.3.1', B532: '5.3.2', B533: '5.3.3', B534: '5.3.4', B535: '5.3.5', B536: '5.3.6', B53C: '5.3.C',
  B541: '5.4.1', B542: '5.4.2', B543: '5.4.3', B544: '5.4.4', B545: '5.4.5', B54C: '5.4.C',
  B551: '5.5.1', B552: '5.5.2', B553: '5.5.3', B554: '5.5.4', B55C: '5.5.C',
  B561: '5.6.1', B562: '5.6.2', B563: '5.6.3', B564: '5.6.4', B565: '5.6.5', B566: '5.6.6', B56C: '5.6.C',
  B571: '5.7.1', B572: '5.7.2', B573: '5.7.3', B5P: '5.P', B5A: '5.A', DONE: 'the finished model',
};

/** The sheet standard: every finished page, and the one sheet off it on purpose. */
export const STANDARD = {
  pages: [
    ['DONE', 'Cover', { read: true }], ['DONE', 'Inputs', { read: false }], ['DONE', 'IS', { read: true }], ['DONE', 'CF', { read: true }], ['DONE', 'BS', { read: true }],
    ['DONE', 'Schedules', { read: false }], ['DONE', 'Checks', { read: false }], ['DONE', 'DCF', { read: true }], ['DONE', 'One site', { read: true }], ['DONE', 'One week', { read: true }],
  ],
  off: { Data: 'the accountants\' export, laid out as they sent it' },
};

/** A deep clone of a named state (runners mutate their copy, never the master). */
export function stateOf(id) {
  const s = STATES[id];
  if (!s) throw new Error('unknown workbook state ' + id);
  return clone(s);
}

/* ---------------- a session read back as a state (the replay's diff) ---------------- */

/** The settings with the iteration limits the model carries, in the states' key order. */
const settingsOf = st => { const { calcMode, iterative, maxIterations, maxChange, qat, enterMoves, ...rest } = st || {}; return { calcMode, iterative, maxIterations: maxIterations == null ? 100 : maxIterations, maxChange: maxChange == null ? 0.001 : maxChange, qat, ...(enterMoves === false ? { enterMoves } : {}), ...rest }; };
/** What differs between two states: clearcoat-weekly's diff, with the iteration limits compared as settings and the names in any order. */
export function diffStates(a, b) {
  const names = st => (st.names ? { names: Object.fromEntries(Object.entries(st.names).sort(([x], [y]) => x.toUpperCase().localeCompare(y.toUpperCase()))) } : {});   // a session keeps its names sorted, as the Name Manager lists them
  return diffCells({ ...a, settings: settingsOf(a.settings), ...names(a) }, { ...b, settings: settingsOf(b.settings), ...names(b) });
}
/** A live session in the authored-state shape: clearcoat-weekly's extraction plus the iteration limits. */
export function sessionToState(ses) {
  const st = sessionCells(ses);
  st.settings = settingsOf({ ...st.settings, maxIterations: ses.settings.maxIterations, maxChange: ses.settings.maxChange });
  return st;
}
