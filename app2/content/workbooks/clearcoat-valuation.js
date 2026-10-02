// app2/content/workbooks/clearcoat-valuation.js — the Chapter 6 workbook: the valuation pack
// (script-ch6.md). Chapters 5 and 6 share one workbook: this module imports the Chapter 5 model
// (clearcoat-model.js) and adds five pages after DCF, Comps · Precedents · LBO · Bids · Summary, in
// USD thousands like the model. The LBO reads the model's EBITDA and free cash flow by link, the
// Cover's map gains the five pages, and the "Sources equal uses" row that Chapter 5 left pending on
// Checks goes live. No Chapter 5 state changes: every Chapter 6 state is cut from the Chapter 5
// finished model plus the solved pack, by a pure patch.
//
// Every page is built once, solved, by buildPage (the sheet standard in code); start states strip
// or plant. The challenges, the project and the assessment use fresh sets (ALT, ALT2), built by the
// same page functions from different data.
import { buildPage, formatOf } from './page.js';
import * as M from './clearcoat-model.js';

export const CHAPTER = 6;
export const COMPANY = M.COMPANY;
export const PAGE_NAMES = ['Comps', 'Precedents', 'LBO', 'Bids', 'Summary'];
export const SHEET_ORDER = [...M.SHEET_ORDER.slice(0, 8), ...PAGE_NAMES, ...M.SHEET_ORDER.slice(8)];
const UNITS = M.UNITS;
const serial = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000);
export const LTM_DATE = serial(2026, 6, 30), FIRST_QUARTER_END = serial(2024, 9, 30);
const FY_FMT = { fmtStyle: 'custom', numFmt: '"FY"yy' }, DATE_FMT = { fmtStyle: 'custom', numFmt: 'm/d/yyyy' };
/** USD millions to one decimal from a figure in thousands (the range blocks and the football field). */
const MILLIONS = { fmtStyle: 'custom', numFmt: '#,##0.0,_);(#,##0.0,)', decimals: 1 };
/** A multiple that can go negative (net debt over EBITDA on a net-cash comp). */
const MULT_P = { fmtStyle: 'custom', numFmt: '0.0x_);(0.0x)', decimals: 1 };
/** Dollars in millions to one decimal, the value already in millions (EV per site). */
const PER_SITE = { fmtStyle: 'custom', numFmt: '$#,##0.0_);($#,##0.0)', decimals: 1 };
const NODASH = { fmtStyle: 'comma', decimals: 0 };
const clone = v => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)));
const colNum = col => col.split('').reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0);
const colOf = n => { let s = ''; while (n > 0) { n -= 1; s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26); } return s; };
const prev = col => colOf(colNum(col) - 1);
const sum = xs => xs.reduce((a, b) => a + b, 0);

/* ---------------- the data: the base set, and the fresh sets for the challenges, the project and the assessment ---------------- */

/** Six listed operators (fictional). Figures in USD thousands; shares in thousands; washes in thousands a year. Two report to March; Harbor is the 6x outlier; Summit holds net cash. */
export const COMPS = [
  { name: 'Pinnacle Wash Holdings', price: 24.5, shares: 60000, debt: 520000, cash: 45000, rev: 610000, ebitda: 170500, growth: 0.08, fye: 12, sites: 400, washes: 35200, owns: 'Owns', rent: null, include: 1, source: 'Form 10-Q to June 30, 2026; price at the close of September 30, 2026' },
  { name: 'Riverbend Auto Care', price: 18.2, shares: 42000, debt: 310000, cash: 30000, rev: 345000, ebitda: 104500, growth: 0.06, fye: 3, sites: 230, washes: 21160, owns: 'Rents', rent: 14000, include: 1, source: 'Form 10-Q to June 30, 2026 (fiscal year ends March); price at the close of September 30, 2026' },
  { name: 'Summit Express Wash', price: 31, shares: 25000, debt: 60000, cash: 110000, rev: 230000, ebitda: 69000, growth: 0.12, fye: 12, sites: 130, washes: 12350, owns: 'Owns', rent: null, include: 1, source: 'Form 10-Q to June 30, 2026; price at the close of September 30, 2026', note: 'Net cash: cash above debt, so EV sits below market cap and leverage reads negative' },
  { name: 'Meridian Car Care', price: 9.75, shares: 70000, debt: 640000, cash: 25000, rev: 520000, ebitda: 150000, growth: 0.02, fye: 3, sites: 420, washes: 35700, owns: 'Rents', rent: 24000, include: 1, source: 'Form 10-Q to June 30, 2026 (fiscal year ends March); price at the close of September 30, 2026' },
  { name: 'Harbor Clean Group', price: 4.1, shares: 55000, debt: 290000, cash: 15000, rev: 340000, ebitda: 82000, growth: -0.07, fye: 12, sites: 260, washes: 20800, owns: 'Rents', rent: 20000, include: 0, source: 'Form 10-Q to June 30, 2026; price at the close of September 30, 2026', note: 'Excluded: EBITDA falling 7% a year, the lowest margin in the set and net debt above 3x EBITDA. A struggling operator, not a peer' },
  { name: 'Prairie Wash Holdings', price: 15.6, shares: 38000, debt: 240000, cash: 20000, rev: 250000, ebitda: 67700, growth: 0.1, fye: 12, sites: 140, washes: 12600, owns: 'Owns', rent: null, include: 1, source: 'Form 10-Q to June 30, 2026; price at the close of September 30, 2026' },
];
/** Six deals (fictional), 2023 to 2026. The first is four years old, the second a 200-site chain, the third a strategic buying a competitor. */
export const DEALS = [
  { date: [2023, 1, 17], target: 'Bluewater Wash', acquirer: 'Keystone Capital Partners', type: 'Sponsor', ev: 310000, ebitda: 23000, sites: 55, listed: 0, include: 0, reason: 'Out: four years old, priced when rates were two points lower' },
  { date: [2024, 6, 4], target: 'Nationwide Shine', acquirer: 'Atlas Infrastructure Partners', type: 'Sponsor', ev: 1450000, ebitda: 108000, sites: 200, listed: 1, pre: 21, offer: 27.3, include: 0, reason: "Out: a 200-site national chain, five times Clearcoat's scale" },
  { date: [2024, 11, 12], target: 'Crestline Car Wash', acquirer: 'Pinnacle Wash Holdings', type: 'Strategic', ev: 184000, ebitda: 14500, sites: 38, listed: 0, include: 1, reason: 'In, noted: a strategic buyer, so the price may carry synergies' },
  { date: [2025, 3, 20], target: 'Lakeside Express', acquirer: 'Harborview Equity', type: 'Sponsor', ev: 262000, ebitda: 21000, sites: 52, listed: 1, pre: 12.4, offer: 15.5, include: 1, reason: 'In: a sponsor buying a chain of Clearcoat’s size' },
  { date: [2025, 9, 9], target: 'Goldline Auto Spa', acquirer: 'Cedar Ridge Capital', type: 'Sponsor', ev: 141000, ebitda: 12000, sites: 30, listed: 0, include: 1, reason: 'In: a sponsor buying a chain of Clearcoat’s size' },
  { date: [2026, 2, 26], target: 'Sunbelt Wash Co', acquirer: 'Northstar Partners', type: 'Sponsor', ev: 228000, ebitda: 19000, sites: 45, listed: 0, include: 1, reason: 'In: a sponsor buying a chain of Clearcoat’s size' },
];
/** The lead sponsor's term sheet (6.3): the bid is the input and the multiple a formula (195,000 over 16,600 is 11.75x; see source-checklist H). */
export const TERMS = { entryEV: 195000, fee: 0.02, senLev: 4.5, senRate: 0.08, senAmort: 0.05, mezLev: 1, mezRate: 0.12, roll: 0.2, exitMult: 11, hold: 5, hurdle: 0.2,
  slb: { on: 0, use: 1, sites: 20, value: 2500, cap: 0.07 } };
/** The three bids (6.4). */
export const BIDS = { headline: [185000, 200000, 195000], earnout: [null, 25000, null], earnTarget: [null, 20000, null], rollShare: [null, null, 0.2], condition: ['None', 'None', 'Financing'],
  certainty: [0.95, 0.85, 0.75], earnProb: 0.5, rollYears: 3, fee: 0.02, pool: 0.05, strike: 40000, optShare: 0.002, vest: 1, owners: [['Founder 1', 0.35], ['Founder 2', 0.35], ['Family office', 0.3]],
  recommend: 'A', recommendation: 'Recommend bid A: the lowest headline, but the highest expected value once the earnout and the financing condition are priced, and all of it cash at close.' };
export const DATA = { comps: COMPS, deals: DEALS, terms: TERMS, bids: BIDS };

/** The fresh sets. ALT serves the challenges (6.1.C three comps, 6.2.C five deals, 6.3.C the paper LBO) and the project; ALT2 the assessment. */
export const ALT = {
  comps: [
    { name: 'Cascade Wash Group', price: 42, shares: 20000, debt: 300000, cash: 40000, rev: 360000, ebitda: 100000, growth: 0.09, fye: 12, sites: 240, washes: 21000, owns: 'Owns', rent: null, include: 1, source: 'Form 10-Q to June 30, 2026; price at the close of September 30, 2026' },
    { name: 'Bayline Auto Spa', price: 12.8, shares: 50000, debt: 400000, cash: 20000, rev: 390000, ebitda: 102000, growth: 0.04, fye: 3, sites: 250, washes: 22500, owns: 'Rents', rent: 26000, include: 1, source: 'Form 10-Q to June 30, 2026 (fiscal year ends March); price at the close of September 30, 2026' },
    { name: 'Ironwood Express', price: 7.5, shares: 30000, debt: 150000, cash: 10000, rev: 200000, ebitda: 40500, growth: 0.03, fye: 12, sites: 95, washes: 8200, owns: 'Rents', rent: 9000, include: 1, source: 'Form 10-Q to June 30, 2026; price at the close of September 30, 2026' },
  ],
  deals: [
    { date: [2023, 8, 15], target: 'Clearwater Auto Wash', acquirer: 'Granite Peak Capital', type: 'Sponsor', ev: 150000, ebitda: 12500, sites: 32, listed: 0, include: 0, reason: 'Out: over three years old, priced before rates rose' },
    { date: [2024, 4, 2], target: 'Metro Shine Holdings', acquirer: 'Summit Express Wash', type: 'Strategic', ev: 520000, ebitda: 41000, sites: 110, listed: 1, pre: 16, offer: 20.8, include: 0, reason: 'Out: a 110-site regional chain bought by a strategic' },
    { date: [2024, 10, 21], target: 'Riverside Wash', acquirer: 'Fulcrum Equity', type: 'Sponsor', ev: 176000, ebitda: 14000, sites: 36, listed: 0, include: 1, reason: 'In' },
    { date: [2025, 6, 10], target: 'Palmetto Express', acquirer: 'Larkspur Partners', type: 'Sponsor', ev: 205000, ebitda: 17500, sites: 42, listed: 1, pre: 9.1, offer: 11.6, include: 1, reason: 'In' },
    { date: [2026, 1, 14], target: 'Blue Ridge Car Care', acquirer: 'Ironwood Express', type: 'Strategic', ev: 132000, ebitda: 10500, sites: 27, listed: 0, include: 1, reason: 'In, noted: a strategic buyer' },
  ],
  terms: { entryEV: 185000, fee: 0.02, senLev: 4, senRate: 0.085, senAmort: 0.05, mezLev: 1.5, mezRate: 0.11, roll: 0.15, exitMult: 10.5, hold: 5, hurdle: 0.2, slb: { on: 0, use: 1, sites: 20, value: 2500, cap: 0.07 } },
  bids: { headline: [175000, 190000, 185000], earnout: [null, 20000, null], earnTarget: [null, 19000, null], rollShare: [null, null, 0.15], condition: ['None', 'None', 'Financing'],
    certainty: [0.95, 0.85, 0.8], earnProb: 0.5, rollYears: 3, fee: 0.02, pool: 0.05, strike: 40000, optShare: 0.002, vest: 1, owners: [['Founder 1', 0.35], ['Founder 2', 0.35], ['Family office', 0.3]],
    recommend: 'A', recommendation: '' },
};
/** The paper LBO (6.3.C): one tranche, no rollover, the operating lines typed instead of linked. */
export const PAPER = { entryEV: 165000, fee: 0.02, senLev: 4, senRate: 0.085, senAmort: 0.05, mezLev: 0, mezRate: 0.12, roll: 0, exitMult: 10.5, hold: 5, hurdle: 0.2, slb: { on: 0, use: 1, sites: 20, value: 2500, cap: 0.07 },
  given: { ebitda26: 15000, ebitda: [16500, 18200, 20000, 21900, 23900], fcf: [1500, 2800, 4200, 5600, 7000], netDebt: 50000, tax: 0.25, minCash: 3000, revRate: 0.08, circ: 1 } };
/** The assessment's set: ALT with other names and figures moved. */
function vary(set) {
  const compNames = ['Lakeshore Wash Co', 'Granite Auto Care', 'Southline Express'];
  const dealNames = [['Tidewater Wash', 'Ridgeline Capital'], ['Capital Shine', 'Lakeshore Wash Co'], ['Foothills Wash', 'Beacon Equity Partners'], ['Seaside Express', 'Juniper Partners'], ['Pine Valley Car Care', 'Southline Express']];
  return {
    comps: set.comps.map((c, i) => ({ ...c, name: compNames[i], price: Math.round(c.price * 1.08 * 100) / 100, debt: Math.round(c.debt * 1.05), rev: Math.round(c.rev * 1.03), ebitda: Math.round(c.ebitda * 0.97), sites: c.sites + 10, washes: c.washes + 800 })),
    deals: set.deals.map((d, i) => ({ ...d, target: dealNames[i][0], acquirer: dealNames[i][1], ev: Math.round(d.ev * 1.05), sites: d.sites + 2 })),
    terms: { ...set.terms, entryEV: 190000, senLev: 4.25, mezLev: 1.25, exitMult: 10.75 },
    bids: { ...set.bids, headline: [180000, 195000, 190000], earnout: [null, 22000, null], certainty: [0.95, 0.8, 0.8] },
  };
}
export const ALT2 = vary(ALT);

/** Eight quarters of EBITDA (ending September 2024 to June 2026) that sum to the comp's LTM and to the prior LTM at its growth, plus the two fiscal-year totals the filings give. */
export function quartersFor(c) {
  const w = [0.27, 0.22, 0.23, 0.28];   // September, December, March, June
  const last = w.map(x => Math.round(x * c.ebitda)); last[3] += c.ebitda - sum(last);
  const priorLtm = Math.round(c.ebitda / (1 + c.growth));
  const prior = w.map(x => Math.round(x * priorLtm)); prior[3] += priorLtm - sum(prior);
  const jun24 = Math.round(w[3] * c.ebitda / Math.pow(1 + c.growth, 2));
  const q = [...prior, ...last];
  const fy25 = c.fye === 12 ? q[2] + q[3] + q[4] + q[5] : jun24 + q[0] + q[1] + q[2];
  const fy26 = c.fye === 12 ? null : q[3] + q[4] + q[5] + q[6];
  return { q, fy25, fy26, fyeDate: c.fye === 12 ? serial(2025, 12, 31) : serial(2026, 3, 31) };
}
const evOf = c => c.price * c.shares + c.debt - c.cash;

/* ---------------- the pages ---------------- */

// Rows are keyed; R(sheet, key) is the row a keyed line landed on (this pack's pages after a layout
// pass, the Chapter 5 model's from its ROW table).
let ROWS = {};
let firstPass = true;
const R = (sheet, key) => {
  const t = ROWS[sheet] || M.ROW[sheet];
  if (!t || !(key in t)) { if (firstPass) return 1; throw new Error(`no row ${sheet}.${key}`); }
  return t[key];
};
const inp = key => `Inputs!$C$${M.ROW.Inputs[key]}`;
const only = (cols, fn) => (col, r) => cols.includes(col) ? fn(col, r) : null;
const firstCol = fn => only(['C'], fn);

/**
 * Build a page spec with the pack's row conveniences: a row may carry `green` (every formula in the
 * row that reads another sheet is green), `fmt` (a format patch on its figures), `nodash`, `boldAt`
 * (columns shown bold), `blueText` (a typed sentence shown blue); a block may carry `colFmt` (a
 * format patch per column over its keyed rows) and `headerDates` (its header row holds period-end
 * dates: the first typed, the rest EOMONTH three months on). Returns the sheet.
 */
function page(spec) {
  if (firstPass) { ROWS[spec.name] = dryRows(spec); return null; }
  const { sheet, at } = buildPage(spec);
  const cells = sheet.cells;
  ROWS[spec.name] = at;
  const colsOf = r => Object.keys(cells).filter(k => /^[A-Z]+\d+$/.test(k) && +k.replace(/^[A-Z]+/, '') === r).map(k => k.replace(/\d+$/, '')).filter(col => col !== 'A' && col !== 'B');
  for (const b of spec.blocks) {
    const keyed = b.rows.filter(row => row.key);
    for (const row of keyed) {
      const r = at[row.key];
      for (const col of colsOf(r)) {
        const c = cells[col + r];
        if (row.green && c.formula && c.formula.includes('!')) c.fontColor = 'green';
        if (row.fmt) Object.assign(c, row.fmt);
        if (row.nodash) Object.assign(c, NODASH);
        if (row.boldAt && row.boldAt.includes(col)) c.bold = true;
        if (row.blueText && typeof c.value === 'string') c.fontColor = 'blue';
        if (b.colFmt && b.colFmt[col]) Object.assign(c, b.colFmt[col]);
      }
    }
    if (b.headerDates && keyed.length) {
      const hr = at[keyed[0].key] - 1;
      b.headerDates.forEach((d, i) => {
        const col = colOf(3 + i);
        cells[col + hr] = i === 0 ? { value: d, fontColor: 'blue', bold: true, align: 'r', ...DATE_FMT } : { formula: `=EOMONTH(${prev(col)}${hr},3)`, bold: true, align: 'r', ...DATE_FMT };
      });
    }
  }
  if (spec.condFmt) sheet.condFmt = clone(spec.condFmt);
  if (spec.colWExtra) Object.assign(sheet.colW, spec.colWExtra);
  return sheet;
}
function dryRows(spec) {
  const at = {}; let r = 5;
  spec.blocks.forEach((b, bi) => { if (bi > 0) r++; if (b.title) r++; if (b.header) r++; for (const row of b.rows) { if (row.key) at[row.key] = r; r++; } });
  return at;
}
const titled = (sheet, formula) => { if (!sheet) return; sheet.cells.A1 = { ...sheet.cells.A1, formula }; delete sheet.cells.A1.value; };
const STAT_ROWS = [['stMed', 'Median', 'MEDIAN'], ['stMean', 'Mean', 'AVERAGE'], ['stLow', 'Low (25th percentile)', 'Q1'], ['stHigh', 'High (75th percentile)', 'Q3'], ['stMin', 'Minimum', 'MIN'], ['stMax', 'Maximum', 'MAX']];
const statOf = (fn, rg) => fn === 'Q1' ? `=QUARTILE.INC(${rg},1)` : fn === 'Q3' ? `=QUARTILE.INC(${rg},3)` : `=${fn}(${rg})`;

/* ---- Comps (6.1) ---- */
export const COMPS_COLS = { price: 'C', shares: 'D', mcap: 'E', debt: 'F', cash: 'G', ev: 'H', rev: 'I', ebitda: 'J', evRev: 'K', evEbitda: 'L', margin: 'M', include: 'N', helper: 'O', growth: 'P', lev: 'Q',
  sites: 'R', washes: 'S', owns: 'T', rent: 'U', ebitdar: 'V', evSite: 'W', evWash: 'X', siteHelper: 'Y', washHelper: 'Z', source: 'AA', note: 'AB' };
const CC = COMPS_COLS;
const Q_COLS = { fy25: 'K', fy26: 'L', fye: 'M', w: 'N', cy25: 'O', ltm: 'P', prior: 'Q', filings: 'R', diff: 'S' };
function pageComps(comps) {
  const me = 'Comps';
  const n = comps.length;
  const ck = i => 'c' + i, qk = i => 'q' + i;
  const c = (key, col) => col + R(me, key);
  const firstC = `${R(me, ck(0))}`, lastC = `${R(me, ck(n - 1))}`;
  const rg = col => `${col}${firstC}:${col}${lastC}`;
  const quartersHdr = () => R(me, qk(0)) - 1;
  const qrg = (col1, col2, r) => `${col1}${r}:${col2}${r}`;
  const dateHdr = () => `$C$${quartersHdr()}:$J$${quartersHdr()}`;
  const compRow = (cp, i) => {
    const q = quartersFor(cp);
    return { key: ck(i), label: cp.name, fill: (col, r) => {
      switch (col) {
        case CC.price: return cp.price; case CC.shares: return cp.shares; case CC.debt: return cp.debt; case CC.cash: return cp.cash; case CC.rev: return cp.rev;
        case CC.mcap: return `=${CC.price}${r}*${CC.shares}${r}`;
        case CC.ev: return `=${CC.mcap}${r}+${CC.debt}${r}-${CC.cash}${r}`;
        case CC.ebitda: return `=${Q_COLS.ltm}${R(me, qk(i))}`;
        case CC.evRev: return `=${CC.ev}${r}/${CC.rev}${r}`;
        case CC.evEbitda: return `=IF(${CC.ebitda}${r}>0,${CC.ev}${r}/${CC.ebitda}${r},"NM")`;
        case CC.margin: return `=${CC.ebitda}${r}/${CC.rev}${r}`;
        case CC.include: return cp.include;
        case CC.helper: return `=IF(${CC.include}${r}=1,${CC.evEbitda}${r},"")`;
        case CC.growth: return `=${CC.ebitda}${r}/${Q_COLS.prior}${R(me, qk(i))}-1`;
        case CC.lev: return `=(${CC.debt}${r}-${CC.cash}${r})/${CC.ebitda}${r}`;
        case CC.sites: return cp.sites; case CC.washes: return cp.washes; case CC.owns: return cp.owns; case CC.rent: return cp.rent;
        case CC.ebitdar: return `=${CC.ebitda}${r}+${CC.rent}${r}`;
        case CC.evSite: return `=${CC.ev}${r}/${CC.sites}${r}/1000`;
        case CC.evWash: return `=${CC.ev}${r}/${CC.washes}${r}`;
        case CC.siteHelper: return `=IF(${CC.include}${r}=1,${CC.evSite}${r},"")`;
        case CC.washHelper: return `=IF(${CC.include}${r}=1,${CC.evWash}${r},"")`;
        case CC.source: return cp.source; case CC.note: return cp.note || null;
        default: return null;
      }
    } };
  };
  const statRow = ([key, label, fn]) => ({ key, label, fill: col => {
    if ([CC.helper, CC.siteHelper, CC.washHelper].includes(col)) return statOf(fn, rg(col));
    if ([CC.margin, CC.growth, CC.lev].includes(col) && fn !== 'Q1' && fn !== 'Q3') return statOf(fn, rg(col));
    return null;
  } });
  const sorted = comps.map(cp => ({ ...cp, mult: evOf(cp) / cp.ebitda })).sort((a, b) => b.mult - a.mult);
  const rangeRow = (key, label, expr, extra = {}) => ({ key, label, indent: 1, boldAt: ['D'], fill: only(['C', 'D', 'E'], (col, r) => expr(col, r, { C: 'stLow', D: 'stMed', E: 'stHigh' }[col])), ...extra });
  const sheet = page({
    name: me, chapter: CHAPTER, title: `${COMPANY}: trading comps`, units: 'USD thousands unless stated; shares and washes in thousands; prices and multiples as stated; LTM to the date in the dates block',
    labelHeader: 'Company',
    headers: ['Share price ($)', 'Shares (thousands)', 'Market cap', 'Debt', 'Cash', 'Enterprise value', 'LTM revenue', 'LTM EBITDA', 'EV / revenue (x)', 'EV / EBITDA (x)', 'EBITDA margin', 'Include (1/0)', 'EV / EBITDA, included',
      'LTM growth', 'Net debt / EBITDA (x)', 'Sites', 'Washes (thousands)', 'Owns or rents', 'Rent', 'EBITDAR', 'EV per site ($m)', 'EV per wash ($)', 'EV per site, included', 'EV per wash, included', 'Source and date', 'Note'],
    blocks: [
      { kinds: ['unit', 'count', 'money', 'money', 'money', 'money', 'money', 'money', 'mult', 'mult', 'pct', 'count', 'mult', 'pct', 'mult', 'count', 'count', 'text', 'money', 'money', 'unit', 'unit', 'unit', 'unit', 'text', 'text'],
        colFmt: { [CC.price]: formatOf('unit', { dollar: true }), [CC.lev]: MULT_P, [CC.evSite]: PER_SITE, [CC.siteHelper]: PER_SITE, [CC.evWash]: formatOf('unit', { dollar: true }), [CC.washHelper]: formatOf('unit', { dollar: true }) },
        rows: [
          ...comps.map(compRow),
          ...STAT_ROWS.map(statRow),
          { key: 'cc', label: `${COMPANY} (FY26E as the LTM proxy; see the note)`, green: true, fill: col => {
            switch (col) {
              case CC.rev: return `=IS!$E$${M.ROW.IS.rev}`; case CC.ebitda: return `=IS!$E$${M.ROW.IS.ebitda}`;
              case CC.margin: return `=${CC.ebitda}${R(me, 'cc')}/${CC.rev}${R(me, 'cc')}`;
              case CC.growth: return `=IS!$E$${M.ROW.IS.ebitda}/IS!$D$${M.ROW.IS.ebitda}-1`;
              case CC.lev: return `=Schedules!$E$${M.ROW.Schedules.netDebt}/${CC.ebitda}${R(me, 'cc')}`;
              case CC.sites: return `=Schedules!$E$${M.ROW.Schedules.closeSites}`; case CC.washes: return `=Schedules!$E$${M.ROW.Schedules.washes}`;
              case CC.owns: return 'Rents'; case CC.rent: return `=-IS!$E$${M.ROW.IS.rent}`; case CC.ebitdar: return `=${CC.ebitda}${R(me, 'cc')}+${CC.rent}${R(me, 'cc')}`;
              case CC.source: return 'The operating model, FY26E: a multiple and the figure it multiplies cover the same period, and this set carries no forward estimates';
              default: return null;
            }
          } },
        ] },
      { title: 'Quarterly EBITDA by period end, the fiscal years and LTM', headerDates: Array.from({ length: 8 }, (_, i) => FIRST_QUARTER_END + i * 91),
        header: [...Array(8).fill(null), 'Fiscal year ended in 2025', 'Fiscal year ended in 2026', 'Fiscal year end', 'Weight on the 2025 year', 'Calendar 2025', 'LTM EBITDA', 'LTM a year earlier', 'LTM from the filings', 'Difference'],
        kinds: [...Array(8).fill('money'), 'money', 'money', 'count', 'unit', 'money', 'money', 'money', 'money', 'count'],
        colFmt: { [Q_COLS.fye]: DATE_FMT },
        rows: comps.map((cp, i) => {
          const q = quartersFor(cp);
          return { key: qk(i), label: cp.name, fill: (col, r) => {
            const k = colNum(col) - 3;
            if (k >= 0 && k < 8) return q.q[k];
            switch (col) {
              case Q_COLS.fy25: return q.fy25; case Q_COLS.fy26: return q.fy26; case Q_COLS.fye: return q.fyeDate;
              case Q_COLS.w: return `=MONTH(${Q_COLS.fye}${r})/12`;
              case Q_COLS.cy25: return `=${Q_COLS.fy25}${r}*${Q_COLS.w}${r}+${Q_COLS.fy26}${r}*(1-${Q_COLS.w}${r})`;
              case Q_COLS.ltm: return `=SUMIFS(${qrg('C', 'J', r)},${dateHdr()},">"&$C$${R(me, 'ltmStart')},${dateHdr()},"<="&$C$${R(me, 'ltmDate')})`;
              case Q_COLS.prior: return `=SUMIFS(${qrg('C', 'J', r)},${dateHdr()},">"&$C$${R(me, 'priorStart')},${dateHdr()},"<="&$C$${R(me, 'ltmStart')})`;
              // the filings route for the first comp (December year): the last full fiscal year plus the quarters since, less the same quarters a year earlier
              case Q_COLS.filings: return i === 0 && cp.fye === 12 ? `=${Q_COLS.fy25}${r}+(I${r}+J${r})-(E${r}+F${r})` : null;
              case Q_COLS.diff: return i === 0 && cp.fye === 12 ? `=ROUND(${Q_COLS.filings}${r}-${Q_COLS.ltm}${r},2)` : null;
              default: return null;
            }
          } };
        }) },
      { title: 'Dates (every LTM formula reads these)', rows: [
        { key: 'ltmDate', label: 'LTM date', kind: 'count', values: [LTM_DATE], fmt: DATE_FMT },
        { key: 'ltmStart', label: 'Twelve months before (the window opens after this date)', kind: 'count', fill: firstCol(() => `=EDATE($C$${R(me, 'ltmDate')},-12)`), fmt: DATE_FMT },
        { key: 'priorStart', label: 'Twenty-four months before (the prior LTM window)', kind: 'count', fill: firstCol(() => `=EDATE($C$${R(me, 'ltmDate')},-24)`), fmt: DATE_FMT },
      ] },
      { title: 'The set sorted by EV / EBITDA, high to low (a values copy)', header: ['EV / EBITDA (x)', 'EBITDA margin', 'LTM growth'], kinds: ['mult', 'pct', 'pct'],
        rows: sorted.map((cp, i) => ({ key: 'sort' + i, label: cp.name, values: [Math.round(cp.mult * 100) / 100, Math.round(cp.ebitda / cp.rev * 1000) / 1000, cp.growth] })) },
      { title: `Applying the range to ${COMPANY} (USD millions)`, header: ['Low (25th percentile)', 'Median', 'High (75th percentile)'], rows: [
        rangeRow('rgMult', 'EV / EBITDA (x)', (col, r, st) => `=${CC.helper}${R(me, st)}`, { kind: 'mult' }),
        rangeRow('rgEV', 'Enterprise value on EBITDA', (col, r) => `=${col}${R(me, 'rgMult')}*$${CC.ebitda}$${R(me, 'cc')}`, { fmt: MILLIONS }),
        rangeRow('rgSiteMult', 'EV per site ($m)', (col, r, st) => `=${CC.siteHelper}${R(me, st)}`, { kind: 'unit', fmt: PER_SITE }),
        rangeRow('rgSiteEV', 'Enterprise value on sites', (col, r) => `=${col}${R(me, 'rgSiteMult')}*$${CC.sites}$${R(me, 'cc')}*1000`, { fmt: MILLIONS }),
        rangeRow('rgWashMult', 'EV per wash ($)', (col, r, st) => `=${CC.washHelper}${R(me, st)}`, { kind: 'unit', dollar: true }),
        rangeRow('rgWashEV', 'Enterprise value on washes', (col, r) => `=${col}${R(me, 'rgWashMult')}*$${CC.washes}$${R(me, 'cc')}`, { fmt: MILLIONS }),
        rangeRow('rgNetDebt', 'Less net debt at the valuation date', () => `=-DCF!$C$${M.ROW.DCF.netDebt}`, { fmt: MILLIONS, green: true }),
        rangeRow('rgEq', 'Equity value on EBITDA', col => `=${col}${R(me, 'rgEV')}+${col}${R(me, 'rgNetDebt')}`, { total: true, fmt: MILLIONS }),
        rangeRow('rgEqSite', 'Equity value on sites', col => `=${col}${R(me, 'rgSiteEV')}+${col}${R(me, 'rgNetDebt')}`, { total: true, fmt: MILLIONS }),
        rangeRow('rgEqWash', 'Equity value on washes', col => `=${col}${R(me, 'rgWashEV')}+${col}${R(me, 'rgNetDebt')}`, { total: true, fmt: MILLIONS }),
      ] },
    ],
    source: 'Prices and filings as sourced beside each comp; trading multiples price minority stakes, so a control buyer pays more (Precedents). Statistics skip an excluded comp through the helper columns.',
    colWExtra: { 27: 330, 28: 330 },
  });
  return sheet;
}

/* ---- Precedents (6.2) ---- */
export const DEAL_COLS = { date: 'C', target: 'D', acquirer: 'E', type: 'F', ev: 'G', ebitda: 'H', sites: 'I', mult: 'J', evSite: 'K', listed: 'L', pre: 'M', offer: 'N', premium: 'O', age: 'P', include: 'Q', reason: 'R', helper: 'S', siteHelper: 'T' };
const DC = DEAL_COLS;
function pagePrecedents(deals) {
  const me = 'Precedents';
  const n = deals.length;
  const dk = i => 'd' + i;
  const rg = col => `${col}${R(me, dk(0))}:${col}${R(me, dk(n - 1))}`;
  const dealRow = (d, i) => ({ key: dk(i), label: d.target, fill: (col, r) => {
    switch (col) {
      case DC.date: return serial(...d.date); case DC.target: return d.target; case DC.acquirer: return d.acquirer; case DC.type: return d.type;
      case DC.ev: return d.ev; case DC.ebitda: return d.ebitda; case DC.sites: return d.sites;
      case DC.mult: return `=IF(${DC.ebitda}${r}>0,${DC.ev}${r}/${DC.ebitda}${r},"NM")`;
      case DC.evSite: return `=${DC.ev}${r}/${DC.sites}${r}/1000`;
      case DC.listed: return d.listed; case DC.pre: return d.listed ? d.pre : null; case DC.offer: return d.listed ? d.offer : null;
      case DC.premium: return `=IF(${DC.listed}${r}=1,${DC.offer}${r}/${DC.pre}${r}-1,"-")`;
      case DC.age: return `=YEARFRAC(${DC.date}${r},$C$${R(me, 'asOf')})`;
      case DC.include: return d.include; case DC.reason: return d.reason;
      case DC.helper: return `=IF(${DC.include}${r}=1,${DC.mult}${r},"")`;
      case DC.siteHelper: return `=IF(${DC.include}${r}=1,${DC.evSite}${r},"")`;
      default: return null;
    }
  } });
  const statRow = ([key, label, fn]) => ({ key, label, fill: col => [DC.helper, DC.siteHelper].includes(col) ? statOf(fn, rg(col)) : null });
  const sorted = [...deals].sort((a, b) => serial(...a.date) - serial(...b.date) || a.ev - b.ev);
  const rangeRow = (key, label, expr, extra = {}) => ({ key, label, indent: 1, boldAt: ['D'], fill: only(['C', 'D', 'E'], (col, r) => expr(col, r, { C: 'stLow', D: 'stMed', E: 'stHigh' }[col])), ...extra });
  const sheet = page({
    name: me, chapter: CHAPTER, title: `${COMPANY}: precedent transactions`, units: 'USD thousands unless stated; enterprise value and LTM EBITDA at announcement; ages against the valuation date',
    labelHeader: 'Deal',
    headers: ['Announced', 'Target', 'Acquirer', 'Acquirer type', 'Enterprise value', 'LTM EBITDA', 'Sites', 'EV / EBITDA (x)', 'EV per site ($m)', 'Listed (1/0)', 'Pre-announcement price ($)', 'Offer price ($)', 'Premium', 'Age (years)', 'Include (1/0)', 'Reason', 'EV / EBITDA, included', 'EV per site, included'],
    blocks: [
      { kinds: ['count', 'text', 'text', 'text', 'money', 'money', 'count', 'mult', 'unit', 'count', 'unit', 'unit', 'pct', 'unit', 'count', 'text', 'mult', 'unit'],
        colFmt: { [DC.date]: DATE_FMT, [DC.evSite]: PER_SITE, [DC.siteHelper]: PER_SITE, [DC.pre]: formatOf('unit', { dollar: true }), [DC.offer]: formatOf('unit', { dollar: true }) },
        rows: [...deals.map(dealRow), ...STAT_ROWS.map(statRow)] },
      { title: 'Reading the set', rows: [
        { key: 'asOf', label: 'As-of date (the valuation date on Inputs)', kind: 'count', fill: firstCol(() => `=${inp('valDate')}`), fmt: DATE_FMT, green: true },
        { key: 'tradMed', label: 'Trading comps: median EV / EBITDA (Comps)', kind: 'mult', fill: firstCol(() => `=Comps!$D$${R('Comps', 'rgMult')}`), green: true },
        { key: 'precMed', label: 'Precedents: median EV / EBITDA, included deals', kind: 'mult', fill: firstCol(() => `=${DC.helper}${R(me, 'stMed')}`) },
        { key: 'ctrlPrem', label: 'Implied control premium (precedents over trading, less one)', kind: 'pct', fill: firstCol(() => `=C${R(me, 'precMed')}/C${R(me, 'tradMed')}-1`) },
        { key: 'dcfExit', label: "The DCF's exit multiple (Inputs)", kind: 'mult', fill: firstCol(() => `=${inp('exit')}`), green: true },
        { key: 'dcfRead', label: 'Where the exit multiple sits', kind: 'text', fill: firstCol(() => `=IF(AND(C${R(me, 'dcfExit')}>=MIN(C${R(me, 'tradMed')},C${R(me, 'precMed')}),C${R(me, 'dcfExit')}<=MAX(C${R(me, 'tradMed')},C${R(me, 'precMed')})),"Between the two medians","Outside the two medians: the DCF page says why")`) },
      ] },
      { title: 'The set sorted by date, then by enterprise value (a values copy)', header: ['Announced', 'Enterprise value', 'EV / EBITDA (x)'], kinds: ['count', 'money', 'mult'], colFmt: { C: DATE_FMT },
        rows: sorted.map((d, i) => ({ key: 'sort' + i, label: d.target, values: [serial(...d.date), d.ev, d.ev / d.ebitda] })) },   // the multiple unrounded: 6.2.2 pastes its values
      { title: `Applying the range to ${COMPANY} (USD millions)`, header: ['Low (25th percentile)', 'Median', 'High (75th percentile)'], rows: [
        rangeRow('rgMult', 'EV / EBITDA (x)', (col, r, st) => `=${DC.helper}${R(me, st)}`, { kind: 'mult' }),
        rangeRow('rgEV', 'Enterprise value on EBITDA', col => `=${col}${R(me, 'rgMult')}*Comps!$${CC.ebitda}$${R('Comps', 'cc')}`, { fmt: MILLIONS, green: true }),
        rangeRow('rgSiteMult', 'EV per site ($m)', (col, r, st) => `=${DC.siteHelper}${R(me, st)}`, { kind: 'unit', fmt: PER_SITE }),
        rangeRow('rgSiteEV', 'Enterprise value on sites', col => `=${col}${R(me, 'rgSiteMult')}*Comps!$${CC.sites}$${R('Comps', 'cc')}*1000`, { fmt: MILLIONS, green: true }),
        rangeRow('rgNetDebt', 'Less net debt at the valuation date', () => `=-DCF!$C$${M.ROW.DCF.netDebt}`, { fmt: MILLIONS, green: true }),
        rangeRow('rgEq', 'Equity value on EBITDA', col => `=${col}${R(me, 'rgEV')}+${col}${R(me, 'rgNetDebt')}`, { total: true, fmt: MILLIONS }),
        rangeRow('rgEqSite', 'Equity value on sites', col => `=${col}${R(me, 'rgSiteEV')}+${col}${R(me, 'rgNetDebt')}`, { total: true, fmt: MILLIONS }),
      ] },
    ],
    source: 'Deal terms from the announcements and the fairness opinions where the target was listed; precedents price control, so they sit above the trading range.',
    colWExtra: { 4: 150, 5: 190, 18: 330 },
  });
  return sheet;
}

/* ---- LBO (6.3) ---- */
const LCOLS = ['C', 'D', 'E', 'F', 'G', 'H'], YRS = LCOLS.slice(1);
/** The model's column for an LBO column: C is FY26 (the model's E), D to H are FY27 to FY31 (F to J). */
const mcol = col => colOf(colNum(col) + 2);
function pageLBO(T, given = null) {
  const me = 'LBO';
  const c = (key, col) => col + R(me, key);
  const a = key => `$C$${R(me, key)}`;
  const yrs = fn => only(YRS, fn);
  const all = fn => only(LCOLS, fn);
  const row = (key, label, expr, extra = {}) => ({ key, label, indent: 1, fill: expr, ...extra });
  const total = (key, label, expr, extra = {}) => ({ key, label, total: true, fill: expr, ...extra });
  const one = (key, label, expr, extra = {}) => ({ key, label, indent: 1, fill: firstCol(expr), ...extra });
  const input = (key, label, value, note, kind = 'money', extra = {}) => ({ key, label, kind, indent: 1, fill: col => col === 'C' ? value : col === 'D' && note ? note : null, ...extra });
  const link = (key, label, formula, typed, note, kind = 'money', extra = {}) => given ? input(key, label, typed, note, kind, extra) : input(key, label, formula, note, kind, { green: true, ...extra });
  const first = col => `COLUMNS($D$4:${col}$4)`;
  const offs = [-1, -0.5, 0, 0.5, 1];
  const sheet = page({
    name: me, chapter: CHAPTER, read: false, title: `${COMPANY}: the sponsor's LBO`, units: 'USD thousands unless stated; closing at the FY26 year end; EBITDA and free cash flow from the operating model',
    headers: LCOLS.map(() => null),
    blocks: [
      { title: 'The term sheet', rows: [
        link('ebitda26', 'FY26E EBITDA', `=IS!$E$${M.ROW.IS.ebitda}`, given && given.ebitda26, 'the operating model, FY26E'),
        input('entryEV', "Entry enterprise value (the sponsor's bid)", T.entryEV, 'the lead bid; the multiple below is what it implies'),
        one('entryMult', 'Entry multiple (x FY26E EBITDA)', () => `=${a('entryEV')}/${a('ebitda26')}`, { kind: 'mult' }),
        input('fee', 'Fees (% of enterprise value)', T.fee, 'advisers, lenders and lawyers', 'pct'),
        input('senLev', 'Senior term loan (x EBITDA)', T.senLev, "the lenders' leverage", 'mult'),
        input('senRate', 'Senior rate', T.senRate, null, 'pct'),
        input('senAmort', 'Senior mandatory amortization (% of the original loan a year)', T.senAmort, 'as loan agreements quote it', 'pct'),
        input('mezLev', 'Mezzanine (x EBITDA)', T.mezLev, 'unswept: it waits for the exit', 'mult'),
        input('mezRate', 'Mezzanine rate', T.mezRate, null, 'pct'),
        link('revRate', 'Revolver rate', `=${inp('revRate')}`, given && given.revRate, 'a short year draws here', 'pct'),
        input('roll', "Owners' rollover (% of the equity purchased)", T.roll, 'bid C: the stake the owners keep', 'pct'),
        input('exitMult', 'Exit multiple (x FY31 EBITDA)', T.exitMult, 'the trading set and the precedents', 'mult'),
        input('hold', 'Hold (years)', T.hold, null, 'count'),
        input('hurdle', 'Hurdle IRR', T.hurdle, 'what a sponsor typically needs', 'pct'),
        link('tax', 'Tax rate', `=${inp('tax')}`, given && given.tax, 'the operating model', 'pct'),
        link('minCash', 'Minimum cash', `=${inp('minCash')}`, given && given.minCash, 'held once, not taken out of every year'),
        link('netDebtClose', 'Net debt at closing (FY26, the operating model)', `=Schedules!$E$${M.ROW.Schedules.netDebt}`, given && given.netDebt, 'the term loan repaid, net of cash'),
        link('circ', 'Circularity breaker, Circ (1 interest on the average, 0 on the opening)', `=${inp('circ')}`, given && given.circ, 'the model\'s breaker', 'count', { nodash: true }),
      ] },
      { title: 'Sale-leaseback (the land under twenty sites)', rows: [
        input('slbOn', 'Sale-leaseback switch (1 on, 0 off)', T.slb.on, null, 'count', { nodash: true }),
        input('slbUse', 'Proceeds (1 repay the senior loan through the sweep, 2 held for new sites)', T.slb.use, null, 'count', { nodash: true }),
        input('slbSites', 'Sites sold', T.slb.sites, null, 'count'),
        input('slbValue', 'Value per site', T.slb.value, 'what a landlord pays for the land'),
        input('slbCap', 'Cap rate (rent as a share of value)', T.slb.cap, null, 'pct'),
        one('slbProceeds', 'Proceeds in FY27 (when the switch is on)', () => `=${a('slbOn')}*${a('slbSites')}*${a('slbValue')}`),
        one('slbRent', 'Rent a year, from FY27 (a site cost; EBITDA falls by it)', () => `=${a('slbProceeds')}*${a('slbCap')}`),
      ] },
      { title: 'Sources and uses (at closing)', rows: [
        row('useNetDebt', 'Net debt repaid at closing', firstCol(() => `=${a('netDebtClose')}`)),
        row('useEquity', 'Equity purchased (the equity value line of the waterfall)', firstCol(() => `=${a('entryEV')}-${a('netDebtClose')}`)),
        total('useEV', 'Enterprise value', firstCol(() => `=C${R(me, 'useNetDebt')}+C${R(me, 'useEquity')}`)),
        row('useFees', 'Fees', firstCol(() => `=C${R(me, 'useEV')}*${a('fee')}`)),
        total('usesTotal', 'Total uses', firstCol(() => `=C${R(me, 'useEV')}+C${R(me, 'useFees')}`), { final: true }),
        row('srcSenior', 'Senior term loan', firstCol(() => `=${a('senLev')}*${a('ebitda26')}`)),
        row('srcMezz', 'Mezzanine', firstCol(() => `=${a('mezLev')}*${a('ebitda26')}`)),
        row('srcRoll', "Owners' rollover", firstCol(() => `=${a('roll')}*C${R(me, 'useEquity')}`)),
        row('srcSponsor', 'Sponsor equity (the plug: what the sponsor wires)', firstCol(() => `=C${R(me, 'usesTotal')}-C${R(me, 'srcSenior')}-C${R(me, 'srcMezz')}-C${R(me, 'srcRoll')}`)),
        total('srcTotal', 'Total sources', firstCol(() => `=SUM(C${R(me, 'srcSenior')}:C${R(me, 'srcSponsor')})`), { final: true }),
        row('suCheck', 'Sources less uses (reads zero)', firstCol(() => `=ROUND(C${R(me, 'srcTotal')}-C${R(me, 'usesTotal')},2)`), { kind: 'count' }),
        row('eqShare', 'Equity as a share of the price (sponsor and rollover)', firstCol(() => `=(C${R(me, 'srcSponsor')}+C${R(me, 'srcRoll')})/C${R(me, 'usesTotal')}`), { kind: 'pct' }),
        row('debtMult', 'Debt as a multiple of EBITDA', firstCol(() => `=(C${R(me, 'srcSenior')}+C${R(me, 'srcMezz')})/${a('ebitda26')}`), { kind: 'mult' }),
        row('rollNewShare', "The rolled stake as a share of the new company's equity", firstCol(() => `=C${R(me, 'srcRoll')}/(C${R(me, 'srcSponsor')}+C${R(me, 'srcRoll')})`), { kind: 'pct' }),
      ] },
      { title: 'Operating lines (the operating model, FY27 to FY31)', rows: [
        given ? row('ebitda', 'EBITDA (given)', yrs(col => given.ebitda[colNum(col) - 4])) : row('ebitda', 'EBITDA', yrs(col => `=IS!${mcol(col)}$${M.ROW.IS.ebitda}`), { green: true }),
        row('rent', 'Sale-leaseback rent', yrs(() => `=-${a('slbRent')}`)),
        total('ebitdaAdj', 'Adjusted EBITDA (labeled: lower by the rent when the land is sold)', yrs(col => `=${c('ebitda', col)}+${c('rent', col)}`)),
        given ? row('fcf', 'Unlevered free cash flow (given)', yrs(col => given.fcf[colNum(col) - 4])) : row('fcf', 'Unlevered free cash flow', yrs(col => `=DCF!${mcol(col)}$${M.ROW.DCF.fcf}`), { green: true }),
        row('slbIn', 'Sale-leaseback proceeds', yrs(col => `=IF(${first(col)}=1,${a('slbProceeds')},0)`)),
      ] },
      { title: 'Cash and the sweep', rows: [
        row('cashOpen', 'Opening cash', yrs(col => `=${prev(col)}${R(me, 'cashClose')}`)),
        row('cFcf', 'Free cash flow', yrs(col => `=${c('fcf', col)}`)),
        row('cSlb', 'Sale-leaseback proceeds', yrs(col => `=${c('slbIn', col)}`)),
        row('cInt', 'Interest on every tranche, net of the tax it saves', yrs(col => `=-${c('totInt', col)}*(1-${a('tax')})`)),
        row('cMand', 'Senior mandatory amortization', yrs(col => `=${c('senMand', col)}`)),
        total('cashPre', 'Cash before the revolver and the sweep', yrs(col => `=SUM(${c('cashOpen', col)}:${c('cMand', col)})`)),
        row('slbHeld', 'Sale-leaseback proceeds held for new sites (memo)', yrs(col => `=IF(${a('slbUse')}=2,${prev(col)}${R(me, 'slbHeld')}+${c('slbIn', col)},0)`)),
        row('cashAvail', 'Cash available for the sweep (less the minimum, less what is held)', yrs(col => `=${c('cashPre', col)}-${a('minCash')}-${c('slbHeld', col)}`)),
        row('revDrawn', 'Revolver drawn (a short year)', yrs(col => `=MAX(-${c('cashAvail', col)},0)`)),
        row('revRepaid', 'Revolver repaid first', yrs(col => `=-MIN(MAX(${c('cashAvail', col)},0),${c('revOpen', col)})`)),
        row('sweep', 'Sweep to the senior loan', yrs(col => `=MAX(MIN(MAX(${c('cashAvail', col)},0)+${c('revRepaid', col)},${c('senOpen', col)}+${c('senMand', col)}),0)`)),
        total('cashClose', 'Closing cash (nil at closing: the price was net of cash)', all(col => col === 'C' ? 0 : `=${c('cashPre', col)}+${c('revDrawn', col)}+${c('revRepaid', col)}-${c('sweep', col)}`)),
      ] },
      { title: 'Senior term loan', rows: [
        row('senOpen', 'Opening balance', yrs(col => `=${prev(col)}${R(me, 'senClose')}`)),
        row('senMand', 'Mandatory amortization (of the original loan, never below zero)', yrs(col => `=-MIN(${a('senAmort')}*${a('senClose')},${c('senOpen', col)})`)),
        row('senSweep', 'Sweep', yrs(col => `=-${c('sweep', col)}`)),
        total('senClose', 'Closing balance', all(col => col === 'C' ? `=${a('srcSenior')}` : `=${c('senOpen', col)}+${c('senMand', col)}+${c('senSweep', col)}`)),
        row('senAvg', 'Average balance', yrs(col => `=AVERAGE(${c('senOpen', col)},${c('senClose', col)})`)),
        row('senInt', 'Interest (on the average when Circ is 1, on the opening when 0)', yrs(col => `=IF(${a('circ')}=1,${a('senRate')}*${c('senAvg', col)},${a('senRate')}*${c('senOpen', col)})`)),
      ] },
      { title: 'Mezzanine (unswept; repaid at the exit)', rows: [
        row('mezOpen', 'Opening balance', yrs(col => `=${prev(col)}${R(me, 'mezClose')}`)),
        total('mezClose', 'Closing balance', all(col => col === 'C' ? `=${a('srcMezz')}` : `=${c('mezOpen', col)}`)),
        row('mezAvg', 'Average balance', yrs(col => `=AVERAGE(${c('mezOpen', col)},${c('mezClose', col)})`)),
        row('mezInt', 'Interest', yrs(col => `=IF(${a('circ')}=1,${a('mezRate')}*${c('mezAvg', col)},${a('mezRate')}*${c('mezOpen', col)})`)),
      ] },
      { title: 'Revolver (short years)', rows: [
        row('revOpen', 'Opening balance', yrs(col => `=${prev(col)}${R(me, 'revClose')}`)),
        row('revDrawnRow', 'Drawn', yrs(col => `=${c('revDrawn', col)}`)),
        row('revRepaidRow', 'Repaid', yrs(col => `=${c('revRepaid', col)}`)),
        total('revClose', 'Closing balance', all(col => col === 'C' ? 0 : `=${c('revOpen', col)}+${c('revDrawnRow', col)}+${c('revRepaidRow', col)}`)),
        row('revAvg', 'Average balance', yrs(col => `=AVERAGE(${c('revOpen', col)},${c('revClose', col)})`)),
        row('revInt', 'Interest', yrs(col => `=IF(${a('circ')}=1,${a('revRate')}*${c('revAvg', col)},${a('revRate')}*${c('revOpen', col)})`)),
      ] },
      { title: 'Debt totals', rows: [
        total('totDebt', 'Total debt', all(col => `=${c('senClose', col)}+${c('mezClose', col)}+${c('revClose', col)}`)),
        total('totInt', 'Total interest', yrs(col => `=${c('senInt', col)}+${c('mezInt', col)}+${c('revInt', col)}`)),
        row('cashRow', 'Cash', all(col => `=${c('cashClose', col)}`)),
        total('netDebt', 'Net debt', all(col => `=${c('totDebt', col)}-${c('cashRow', col)}`)),
        row('paidDown', 'Net debt paid down since closing', yrs(col => `=${a('netDebt')}-${c('netDebt', col)}`)),
        row('sweepCheck', 'Check: debt repaid plus cash built, less cumulative cash after interest and tax', yrs(col => `=ROUND((${c('cashClose', col)}-${a('cashClose')})-(${c('totDebt', col)}-${a('totDebt')})-SUM($D$${R(me, 'cFcf')}:${c('cFcf', col)})-SUM($D$${R(me, 'cSlb')}:${c('cSlb', col)})-SUM($D$${R(me, 'cInt')}:${c('cInt', col)}),2)`), { kind: 'count' }),
      ] },
      { title: 'Returns', rows: [
        one('exitEV', 'Exit enterprise value (the exit multiple on FY31 adjusted EBITDA)', () => `=${a('exitMult')}*$H$${R(me, 'ebitdaAdj')}`),
        one('exitND', 'Less net debt at the exit', () => `=-$H$${R(me, 'netDebt')}`),
        total('exitEq', 'Equity at the exit', firstCol(() => `=C${R(me, 'exitEV')}+C${R(me, 'exitND')}`)),
        one('entryEq', 'Equity at entry (the sponsor and the rolled stake together)', () => `=${a('srcSponsor')}+${a('srcRoll')}`),
        one('moic', 'MOIC (equity out over equity in)', () => `=C${R(me, 'exitEq')}/C${R(me, 'entryEq')}`, { kind: 'mult' }),
        row('eqFlow', 'Equity cash flows (in at closing, out at the exit)', all(col => col === 'C' ? `=-${a('entryEq')}` : `=IF(${first(col)}=${a('hold')},${a('exitEq')},0)`)),
        one('irr', 'IRR', () => `=IRR(C${R(me, 'eqFlow')}:H${R(me, 'eqFlow')})`, { kind: 'pct' }),
        one('rri', 'IRR by hand: RRI over the hold', () => `=RRI(${a('hold')},C${R(me, 'entryEq')},C${R(me, 'exitEq')})`, { kind: 'pct' }),
        one('irrDiff', 'IRR less RRI (reads zero)', () => `=ROUND(C${R(me, 'irr')}-C${R(me, 'rri')},6)`, { kind: 'count' }),
        one('sponsorShare', "The sponsor's share of the new company", () => `=${a('srcSponsor')}/C${R(me, 'entryEq')}`, { kind: 'pct' }),
        row('spFlow', "The sponsor's cash flows", all(col => `=${c('eqFlow', col)}*${a('sponsorShare')}`)),
        row('owFlow', "The owners' cash flows (the rolled stake)", all(col => `=${c('eqFlow', col)}*(1-${a('sponsorShare')})`)),
        one('spIrr', "The sponsor's IRR", () => `=IRR(C${R(me, 'spFlow')}:H${R(me, 'spFlow')})`, { kind: 'pct' }),
        one('owIrr', "The owners' IRR on the rolled stake", () => `=IFERROR(IRR(C${R(me, 'owFlow')}:H${R(me, 'owFlow')}),C${R(me, 'spIrr')})`, { kind: 'pct' }),
        one('splitCheck', "The sponsor's IRR less the owners' (reads zero)", () => `=ROUND(C${R(me, 'spIrr')}-C${R(me, 'owIrr')},6)`, { kind: 'count' }),
        row('lenderFlow', "The senior lender's cash flows (out at closing, interest and repayments back, the balance at the exit)", all(col => col === 'C' ? `=-${a('senClose')}` : `=${c('senInt', col)}-${c('senMand', col)}-${c('senSweep', col)}+IF(${first(col)}=${a('hold')},${c('senClose', col)},0)`)),
        one('lenderIrr', "The senior lender's IRR (close to the rate)", () => `=IFERROR(IRR(C${R(me, 'lenderFlow')}:H${R(me, 'lenderFlow')}),"n/a")`, { kind: 'pct' }),
        one('hurdleFlag', 'Against the hurdle', () => `=IF(C${R(me, 'irr')}>=${a('hurdle')},"Clears","Short")`, { kind: 'text', boldAt: ['C'] }),
      ] },
      { title: 'The returns bridge (on total equity, the sponsor and the rolled stake together)', rows: [
        one('gain', 'Equity gain (exit less entry)', () => `=C${R(me, 'exitEq')}-C${R(me, 'entryEq')}`),
        one('growthEff', 'EBITDA growth (FY31 less FY26, at the entry multiple)', () => `=($H$${R(me, 'ebitdaAdj')}-${a('ebitda26')})*${a('entryMult')}`),
        one('multEff', 'Multiple expansion (exit less entry, on FY31 EBITDA)', () => `=(${a('exitMult')}-${a('entryMult')})*$H$${R(me, 'ebitdaAdj')}`),
        one('paydownEff', 'Debt paydown (net debt at entry less net debt at the exit)', () => `=${a('netDebt')}-$H$${R(me, 'netDebt')}`),
        one('feesEff', 'Fees paid at entry', () => `=-${a('useFees')}`),
        total('bridgeTotal', 'Total of the four effects', firstCol(() => `=SUM(C${R(me, 'growthEff')}:C${R(me, 'feesEff')})`)),
        one('bridgeCheck', 'The four effects less the gain (reads zero)', () => `=ROUND(C${R(me, 'bridgeTotal')}-C${R(me, 'gain')},2)`, { kind: 'count' }),
        one('growthSh', 'EBITDA growth, share of the gain', () => `=C${R(me, 'growthEff')}/C${R(me, 'gain')}`, { kind: 'pct' }),
        one('multSh', 'Multiple expansion, share of the gain', () => `=C${R(me, 'multEff')}/C${R(me, 'gain')}`, { kind: 'pct' }),
        one('paydownSh', 'Debt paydown, share of the gain', () => `=C${R(me, 'paydownEff')}/C${R(me, 'gain')}`, { kind: 'pct' }),
        one('feesSh', 'Fees, share of the gain', () => `=C${R(me, 'feesEff')}/C${R(me, 'gain')}`, { kind: 'pct' }),
      ] },
      { title: 'Sensitivity: IRR by entry multiple (down) and exit multiple (across)', colFmt: { C: { ...formatOf('mult'), it: false } }, rows: [
        { key: 'sensH', label: 'Entry multiple (x), down; exit multiple (x), across', kind: 'mult', boldAt: YRS, fill: yrs(col => `=${a('exitMult')}${offs[colNum(col) - 4] === 0 ? '' : (offs[colNum(col) - 4] > 0 ? '+' : '-') + Math.abs(offs[colNum(col) - 4])}`) },
        ...offs.map((off, i) => ({ key: 'sens' + i, kind: 'pct', boldAt: off === 0 ? ['F'] : [], fill: all((col, r) => col === 'C'
          ? `=${a('entryMult')}${off === 0 ? '' : (off > 0 ? '+' : '-') + Math.abs(off)}`
          : `=((${col}$${R(me, 'sensH')}*$H$${R(me, 'ebitdaAdj')}-$H$${R(me, 'netDebt')})/($C${r}*${a('ebitda26')}*(1+${a('fee')})-${a('srcSenior')}-${a('srcMezz')}))^(1/${a('hold')})-1`) })),
      ] },
      { title: 'What the sponsor can pay (the LBO range, as formulas)', header: ['At the high hurdle', 'At the hurdle', 'At the low hurdle'], rows: [
        { key: 'hurdles', label: 'Hurdle IRR', kind: 'pct', indent: 1, values: [0.25, 0.2, 0.175] },
        row('maxEq', 'The most equity that still earns the hurdle (PV of the exit equity)', only(['C', 'D', 'E'], (col, r) => `=PV(${col}${R(me, 'hurdles')},${a('hold')},0,-${a('exitEq')})`)),
        total('topEV', 'The top price, as enterprise value (equity plus debt, over one plus fees)', only(['C', 'D', 'E'], col => `=(${c('maxEq', col)}+${a('srcSenior')}+${a('srcMezz')})/(1+${a('fee')})`)),
        row('topMult', 'As a multiple of FY26E EBITDA', only(['C', 'D', 'E'], col => `=${c('topEV', col)}/${a('ebitda26')}`), { kind: 'mult' }),
        row('topVsBid', 'Against the bid (positive: room above it)', only(['C', 'D', 'E'], col => `=${c('topEV', col)}-${a('entryEV')}`)),
      ] },
    ],
    source: 'The sweep repays the senior loan only; the mezzanine waits for the exit; a short year draws the revolver. The LBO range is a ceiling: a bid above it means the sponsor sees something the model does not, or plans a sale-leaseback.',
    colWExtra: { 4: 12 * 7 + 5 },
  });
  if (!sheet) return null;
  // the timeline: closing at FY26 and the five projected years, linked to the model's timeline (typed on the paper LBO)
  LCOLS.forEach((col, i) => { sheet.cells[col + '4'] = given ? { value: serial(2026 + i, 12, 31), fontColor: 'blue', bold: true, align: 'r', ...FY_FMT } : { formula: `=Inputs!${mcol(col)}4`, fontColor: 'green', bold: true, align: 'r', ...FY_FMT }; });
  sheet.cells.B4 = { value: 'Closing, then FY27 to FY31', bold: true };
  const s0 = R(me, 'sens0'), s4 = R(me, 'sens4');
  sheet.condFmt = [{ kind: 'formula', formula: `=D${s0}<$C$${R(me, 'hurdle')}`, range: `D${s0}:H${s4}`, style: 'redtext' }];
  return sheet;
}

/* ---- Bids (6.4.1 to 6.4.3) ---- */
const BCOLS = ['C', 'D', 'E'];
function pageBids(B) {
  const me = 'Bids';
  const c = (key, col) => col + R(me, key);
  const a = key => `$C$${R(me, key)}`;
  const bids = fn => only(BCOLS, fn);
  const row = (key, label, expr, extra = {}) => ({ key, label, indent: 1, fill: bids(expr), ...extra });
  const total = (key, label, expr, extra = {}) => ({ key, label, total: true, fill: bids(expr), ...extra });
  const input = (key, label, value, note, kind = 'money', extra = {}) => ({ key, label, kind, indent: 1, fill: col => col === 'C' ? value : col === 'F' && note ? note : null, ...extra });
  const sheet = page({
    name: me, chapter: CHAPTER, title: `${COMPANY}: the three bids`, units: 'USD thousands unless stated; three bids across; the waterfall on each priced value',
    headers: ['Bid A', 'Bid B', 'Bid C'],
    blocks: [
      { title: 'The term sheets', rows: [
        { key: 'headline', label: 'Headline enterprise value', indent: 1, values: B.headline },
        { key: 'earnout', label: 'Of which an earnout, paid later if the target is hit', indent: 1, values: B.earnout },
        { key: 'earnTarget', label: 'Earnout condition: FY27 EBITDA of at least', indent: 1, values: B.earnTarget },
        { key: 'rollShare', label: "Rollover (the share of the owners' equity kept in the new company)", kind: 'pct', indent: 1, values: B.rollShare },
        { key: 'condition', label: 'Conditions', kind: 'text', indent: 1, values: B.condition },
        row('eqHead', 'Equity value at the headline (less net debt at closing)', col => `=${c('headline', col)}-${a('netDebtClose')}`),
        row('rollAmt', 'Rollover amount (not cash: it carries the new company\'s risk)', col => `=${c('eqHead', col)}*${c('rollShare', col)}`),
        total('cashClose', 'Cash at close', col => `=${c('headline', col)}-${c('earnout', col)}-${c('rollAmt', col)}`),
      ] },
      { title: 'Pricing each structure', rows: [
        row('earnEV', 'Earnout expected value (amount times the odds)', col => `=${c('earnout', col)}*${a('earnProb')}`),
        row('rollVal', "Rollover value (grown at the sponsor's return, discounted at the cost of equity)", col => `=${c('rollAmt', col)}*(1+${a('rollRet')})^${a('rollYears')}/(1+${a('rollDisc')})^${a('rollYears')}`),
        total('priced', 'Priced value', col => `=${c('cashClose', col)}+${c('earnEV', col)}+${c('rollVal', col)}`),
        row('rollOld', 'The rolled stake as a share of the old equity', col => `=${c('rollShare', col)}`, { kind: 'pct' }),
        row('rollNew', "The rolled stake as a share of the new company's equity (the LBO's sources)", col => `=IF(${c('rollAmt', col)}>0,${c('rollAmt', col)}/(LBO!$C$${R('LBO', 'srcSponsor')}+${c('rollAmt', col)}),0)`, { kind: 'pct', green: true }),
        { key: 'certainty', label: 'Certainty (the odds the bid closes)', kind: 'pct', indent: 1, values: B.certainty },
        total('expected', 'Expected value (priced value times certainty)', col => `=${c('priced', col)}*${c('certainty', col)}`, { final: true }),
      ] },
      { title: 'Rank (1 is highest)', rows: [
        row('rankHead', 'On the headline', col => `=RANK(${c('headline', col)},$C$${R(me, 'headline')}:$E$${R(me, 'headline')})`, { kind: 'count' }),
        row('rankPriced', 'On the priced value', col => `=RANK(${c('priced', col)},$C$${R(me, 'priced')}:$E$${R(me, 'priced')})`, { kind: 'count' }),
        row('rankExp', 'On the expected value', col => `=RANK(${c('expected', col)},$C$${R(me, 'expected')}:$E$${R(me, 'expected')})`, { kind: 'count' }),
      ] },
      { title: 'The waterfall, from enterprise value to the owners (on the priced value)', rows: [
        row('wfEV', 'Enterprise value', col => `=${c('priced', col)}`),
        row('wfND', 'Less net debt at closing', col => `=-MIN(${a('netDebtClose')},${c('wfEV', col)})`),
        total('wfEq', 'Equity value', col => `=${c('wfEV', col)}+${c('wfND', col)}`),
        row('wfFees', 'Less transaction fees (the advisers and the lawyers)', col => `=-MIN(${a('feePct')}*${c('wfEV', col)},${c('wfEq', col)})`),
        row('wfPool', 'Less the management option pool (its net value, above the strike)', col => `=-MIN(${a('poolPct')}*MAX(${c('wfEq', col)}-${a('strikeVal')},0),${c('wfEq', col)}+${c('wfFees', col)})`),
        total('wfProceeds', 'Net proceeds to owners, pre-tax', col => `=${c('wfEq', col)}+${c('wfFees', col)}+${c('wfPool', col)}`, { final: true }),
        ...B.owners.map(([name], i) => row('o' + (i + 1), `${name}`, col => `=${c('wfProceeds', col)}*${a('own' + (i + 1))}`)),
        row('wfCheck', "The owners' lines less the proceeds (reads zero)", col => `=ROUND(SUM(${c('o1', col)}:${c('o3', col)})-${c('wfProceeds', col)},2)`, { kind: 'count' }),
      ] },
      { title: 'Your stake (options over 0.2% of the company, fully diluted)', rows: [
        row('yourVal', 'Your options: equity value less the strike valuation, times your share, floored at zero', col => `=MAX(${c('wfEq', col)}*${a('optShare')}-${a('strikeVal')}*${a('optShare')},0)*${a('vest')}`),
        row('yourDef', "Of which the earnout's share, deferred", col => `=${c('yourVal', col)}*IFERROR(${c('earnEV', col)}/${c('priced', col)},0)`),
        { key: 'yourNote', label: 'Your options sit inside the 5% pool: the pool line above already funds them', indent: 1 },
      ] },
      { title: 'Inputs: the deal and the owners', header: [null, null, null, 'Note'], rows: [
        input('netDebtClose', 'Net debt at closing (FY26, the operating model)', `=Schedules!$E$${M.ROW.Schedules.netDebt}`, 'repaid first in the waterfall', 'money', { green: true }),
        input('feePct', 'Transaction fees (% of enterprise value)', B.fee, "the owners' advisers and lawyers", 'pct'),
        input('poolPct', 'Management option pool (% of equity value above the strike)', B.pool, 'the option plan', 'pct'),
        input('strikeVal', 'Strike valuation (the equity value the options were struck at)', B.strike, 'the option plan'),
        input('optShare', 'Your option share, fully diluted', B.optShare, 'the option plan', 'pct'),
        input('vest', 'Vesting at a sale', B.vest, 'the option plan', 'pct'),
        ...B.owners.map(([name, share], i) => input('own' + (i + 1), `${name}: ownership`, share, i === 0 ? 'the cap table' : null, 'pct')),
        { key: 'ownCheck', label: 'Ownership sums to 100% (reads zero)', kind: 'count', indent: 1, fill: firstCol(() => `=ROUND(SUM(C${R(me, 'own1')}:C${R(me, 'own3')})-1,6)`) },
        input('earnProb', 'Earnout: the odds the target is hit', B.earnProb, 'FY27 Base case EBITDA is below the target; the Management case clears it', 'pct'),
        input('rollRet', "Rollover: the sponsor's expected return a year (the LBO's IRR)", `=LBO!$C$${R('LBO', 'irr')}`, "the sponsor's own model, on the Cover's case", 'pct', { green: true }),
        input('rollYears', "Rollover: years to the sponsor's exit", B.rollYears, 'the term sheet', 'count'),
        input('rollDisc', 'Rollover: the discount rate (the cost of equity, DCF)', `=DCF!$C$${M.ROW.DCF.coe}`, 'the new company\'s risk, not a bank deposit', 'pct', { green: true }),
      ] },
    ],
    source: 'Every probability is an input with its reason beside it; the board argues with the odds, not the arithmetic. Proceeds are pre-tax: the structure changes what each owner keeps after tax, which is the tax adviser\'s question.',
    colWExtra: { 6: 330 },
  });
  return sheet;
}

/* ---- Summary (6.4.4): the football field and the board page ---- */
const FF = [['ffComps', 'Trading comps (EV / EBITDA)'], ['ffPrec', 'Precedent transactions (EV / EBITDA)'], ['ffDcf', 'DCF (the exit multiple method and its sensitivity)'], ['ffLbo', 'LBO (what the sponsor can pay at 25%, 20% and 17.5%)'],
  ['ffA', 'Bid A (expected, priced, headline)'], ['ffB', 'Bid B (expected, priced, headline)'], ['ffC', 'Bid C (expected, priced, headline)']];
function pageSummary(B) {
  const me = 'Summary';
  const c = (key, col) => col + R(me, key);
  const lmh = fn => only(['C', 'D', 'E'], fn);
  const ff = (key, label, expr) => ({ key, label, indent: 1, green: true, fill: (col, r) => col === 'F' ? `=D${r}/$D$${R(me, 'ffDcf')}` : lmh(expr)(col, r) });
  const wf = (key, label, src, extra = {}) => ({ key, label, indent: 1, green: true, fill: firstCol(() => `=INDEX(Bids!$C$${R('Bids', src)}:$E$${R('Bids', src)},$C$${R(me, 'recIdx')})`), ...extra });
  const bidCol = { ffA: 'C', ffB: 'D', ffC: 'E' };
  const sheet = page({
    name: me, chapter: CHAPTER, title: `${COMPANY}: valuation summary for the board`, units: 'USD millions unless stated; every figure links to the page that built it; the waterfall in USD thousands',
    headers: ['Low', 'Mid', 'High', 'Mid as a share of the DCF mid'], kinds: ['money', 'money', 'money', 'pct'],
    blocks: [
      { rows: [
        { key: 'flag', label: "The model's checks flag (Cover)", kind: 'text', indent: 1, fill: firstCol(() => `=Cover!$C$${M.ROW.Cover.flag}`), green: true, boldAt: ['C'] },
        { key: 'asOf', label: 'Valuation date', kind: 'count', indent: 1, fill: firstCol(() => `=${inp('valDate')}`), fmt: DATE_FMT, green: true },
      ] },
      { title: 'The football field (enterprise value)', colFmt: { C: MILLIONS, D: MILLIONS, E: MILLIONS }, rows: [
        ff('ffComps', FF[0][1], col => `=Comps!${col}$${R('Comps', 'rgEV')}`),
        ff('ffPrec', FF[1][1], col => `=Precedents!${col}$${R('Precedents', 'rgEV')}`),
        ff('ffDcf', FF[2][1], col => col === 'C' ? `=MIN(DCF!$D$${M.ROW.DCF.sm0}:$H$${M.ROW.DCF.sm4})` : col === 'D' ? `=DCF!$C$${M.ROW.DCF.ev}` : `=MAX(DCF!$D$${M.ROW.DCF.sm0}:$H$${M.ROW.DCF.sm4})`),
        ff('ffLbo', FF[3][1], col => `=LBO!${col}$${R('LBO', 'topEV')}`),
        ...['ffA', 'ffB', 'ffC'].map((key, i) => ff(key, FF[4 + i][1], col => `=Bids!$${bidCol[key]}$${R('Bids', { C: 'expected', D: 'priced', E: 'headline' }[col])}`)),
      ] },
      { title: 'The waterfall for the recommended bid (USD thousands)', rows: [
        { key: 'recBid', label: 'Recommended bid (type A, B or C)', kind: 'text', indent: 1, values: [B.recommend], blueText: true },
        { key: 'recIdx', label: 'Its column on Bids', kind: 'count', indent: 1, fill: firstCol(() => `=MATCH("Bid "&C${R(me, 'recBid')},Bids!$C$4:$E$4,0)`), green: true },
        wf('wEV', 'Enterprise value (priced)', 'wfEV'),
        wf('wND', 'Less net debt at closing', 'wfND'),
        wf('wEq', 'Equity value', 'wfEq', { total: true }),
        wf('wFees', 'Less transaction fees', 'wfFees'),
        wf('wPool', 'Less the management option pool', 'wfPool'),
        wf('wProceeds', 'Net proceeds to owners, pre-tax', 'wfProceeds', { total: true, final: true }),
        ...B.owners.map(([name], i) => wf('w' + (i + 1), name, 'o' + (i + 1))),
        wf('wYou', 'Your options', 'yourVal'),
      ] },
      { title: 'Recommendation', rows: [
        { key: 'recText', label: 'One line, written by a person', kind: 'text', indent: 1, values: [B.recommendation || null], blueText: true },
      ] },
    ],
    source: 'Comps, Precedents, DCF, LBO and Bids build every figure here; the Cover carries the model\'s checks. Prints portrait on one page.',
    checks: [
      { label: 'Sources equal uses (the model\'s Checks)', formula: `=Checks!C${M.ROW.Checks.su}` },
      { label: "The model's checks flag reads OK (0 when it does)", formula: `=IF(Cover!C${M.ROW.Cover.flag}="OK",0,1)` },
      { label: 'Every range runs low to mid to high (count of breaches)', formula: () => `=SUMPRODUCT((C${R(me, 'ffComps')}:C${R(me, 'ffC')}>D${R(me, 'ffComps')}:D${R(me, 'ffC')})+(D${R(me, 'ffComps')}:D${R(me, 'ffC')}>E${R(me, 'ffComps')}:E${R(me, 'ffC')}))` },
      { label: "The owners' lines sum to the proceeds", formula: () => `=ROUND(C${R(me, 'w1')}+C${R(me, 'w2')}+C${R(me, 'w3')}-C${R(me, 'wProceeds')},2)` },
    ],
  });
  titled(sheet, `=${inp('company')}&": valuation summary for the board"`);
  return sheet;
}

/* ---------------- the solved pack ---------------- */

export const COVER_LINKS = [
  ['Comps', 'six listed operators spread, the range applied (6.1)'], ['Precedents', 'six deals spread and aged, the range applied (6.2)'],
  ['LBO', "the lead sponsor's bid rebuilt: sources and uses, the sweep, returns (6.3)"], ['Bids', 'three bids priced, the waterfall, your stake (6.4)'], ['Summary', 'the football field and the board page (6.4.4)'],
];
/** Build the five pages from a data set: a layout pass, then the real one. Returns { pages, rows }. */
function buildPack(data) {
  const build = () => ({ Comps: pageComps(data.comps), Precedents: pagePrecedents(data.deals), LBO: pageLBO(data.terms), Bids: pageBids(data.bids), Summary: pageSummary(data.bids) });
  ROWS = {}; firstPass = true; build();
  firstPass = false; const pages = build();
  const rows = clone(ROWS); ROWS = {};
  return { pages, rows };
}
/** The paper LBO page alone (6.3.C): one sheet, its own rows. */
function buildPaper(T) {
  ROWS = {}; firstPass = true; pageLBO(T, T.given);
  firstPass = false; const sheet = pageLBO(T, T.given);
  const rows = clone(ROWS); ROWS = {};
  return { sheet, rows };
}
const BASE = buildPack(DATA);
/** Where each keyed line of each Chapter 6 page landed (the base set). */
export const ROW = BASE.rows;
const COVER = M.coverWith(COVER_LINKS);

/** The finished pack: the Chapter 5 model, the Cover with the five pages on its map, the pages after DCF, Sources equal uses live on Checks. */
function packState(pack) {
  const s = M.stateOf('DONE');
  s.sheets[0] = clone(COVER.sheet);
  const i = s.sheets.findIndex(x => x.name === 'DCF');
  s.sheets.splice(i + 1, 0, ...PAGE_NAMES.map(n => clone(pack.pages[n])));
  const checks = s.sheets.find(x => x.name === 'Checks').cells;
  const su = M.ROW.Checks.su;
  checks['B' + su] = { ...checks['B' + su], value: 'Sources equal uses (LBO)' };
  checks['C' + su] = { ...clone(checks['C' + M.ROW.Checks.bs]), formula: `=ROUND(LBO!C${pack.rows.LBO.srcTotal}-LBO!C${pack.rows.LBO.usesTotal},2)` };
  delete checks['K' + su];
  return s;
}

/* ---------------- state helpers ---------------- */

const lazy = fn => { let v; return () => (v === undefined ? (v = fn()) : v); };
function derive(base, fn) { return lazy(() => { const next = clone(typeof base === 'function' ? base() : base); fn(next); return next; }); }
const sheetOf = (st, name) => st.sheets.find(s => s.name === name);
const cellsOf = (st, name) => sheetOf(st, name).cells;
const parse = k => { const m = /^([A-Z]+)(\d+)$/.exec(k); return m ? { col: m[1], r: +m[2] } : null; };
/** Strip the figures (every column but B) of keyed rows on a page, over `cols` (default all). */
function strip(st, name, rows, keys, cols = null) {
  const cells = cellsOf(st, name);
  const want = new Set(keys.map(k => { const r = rows[name][k]; if (!r) throw new Error(`no row ${name}.${k}`); return r; }));
  for (const k of Object.keys(cells)) { const p = parse(k); if (p && p.col !== 'B' && want.has(p.r) && (!cols || cols.includes(p.col))) delete cells[k]; }
}
/** Keep only `cols` on keyed rows (the rest of their figures go). */
function keepCols(st, name, rows, keys, cols) {
  const cells = cellsOf(st, name);
  const want = new Set(keys.map(k => rows[name][k]));
  for (const k of Object.keys(cells)) { const p = parse(k); if (p && p.col !== 'B' && want.has(p.r) && !cols.includes(p.col)) delete cells[k]; }
}
/** Every keyed row from `from` to `to` inclusive (in layout order). */
function span(rows, name, from, to) { const t = rows[name]; const a = t[from], b = t[to]; return Object.keys(t).filter(k => t[k] >= a && t[k] <= b); }
const allKeys = (rows, name) => Object.keys(rows[name]);
/** Strip a block's header row (the row above its first keyed row), keeping `keep` columns. */
function stripHeader(st, name, rows, firstKey, keep = []) {
  const cells = cellsOf(st, name); const hr = rows[name][firstKey] - 1;
  for (const k of Object.keys(cells)) { const p = parse(k); if (p && p.r === hr && p.col !== 'B' && !keep.includes(p.col)) delete cells[k]; }
}
/** Replace a cell's formula by a typed value (blue), keeping its format. */
function typeCell(st, name, ref, value) { const cells = cellsOf(st, name); const c = { ...(cells[ref] || {}) }; delete c.formula; c.value = value; c.fontColor = 'blue'; cells[ref] = c; }
/** The Sources-equal-uses row back to pending on Checks. */
function pendSu(st) { const cells = cellsOf(st, 'Checks'); const su = M.ROW.Checks.su; delete cells['C' + su]; cells['K' + su] = { value: 'pending', it: true }; }
/** Drop the Chapter 6 pages a state does not need (and any other sheets named), keeping the names. */
const withoutPages = (st, names) => { st.sheets = st.sheets.filter(s => !names.includes(s.name)); };

/* ---------------- the column groups the lessons add ---------------- */

const COMP_INPUT_COLS = [CC.price, CC.shares, CC.debt, CC.cash, CC.rev, CC.ebitda, CC.source, CC.note];
const COMP_EV_COLS = [CC.mcap, CC.ev, CC.evRev, CC.evEbitda, CC.margin];
const COMP_STAT_COLS = [CC.include, CC.helper, CC.growth, CC.lev];
const COMP_OP_COLS = [CC.sites, CC.washes, CC.owns, CC.rent, CC.ebitdar, CC.evSite, CC.evWash, CC.siteHelper, CC.washHelper];
const Q_INPUT_COLS = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', Q_COLS.fy25, Q_COLS.fy26, Q_COLS.fye];
const DEAL_INPUT_COLS = [DC.date, DC.target, DC.acquirer, DC.ev, DC.ebitda, DC.sites, DC.listed, DC.pre, DC.offer];
const DEAL_621_COLS = [DC.type, DC.mult, DC.evSite, DC.premium, DC.age];   // 6.2.1 ages the deals against the as-of date (its best practice)
const DEAL_622_COLS = [DC.include, DC.reason, DC.helper, DC.siteHelper];
const compKeys = (rows, n) => Array.from({ length: n }, (_, i) => 'c' + i);
const qKeys = (rows, n) => Array.from({ length: n }, (_, i) => 'q' + i);
const dealKeys = n => Array.from({ length: n }, (_, i) => 'd' + i);
const STATS = STAT_ROWS.map(x => x[0]);

/** Comps as a lesson finds it before 6.1.1: the inputs typed, the LTM EBITDA given, the note on the net-cash comp; no quarters, no statistics, no range. */
function compsRaw(st, rows, comps, { quarters = false, givenLtm = true } = {}) {
  const n = comps.length;
  keepCols(st, 'Comps', rows, compKeys(rows, n), COMP_INPUT_COLS);
  if (givenLtm) comps.forEach((cp, i) => typeCell(st, 'Comps', CC.ebitda + rows.Comps['c' + i], cp.ebitda)); else strip(st, 'Comps', rows, compKeys(rows, n), [CC.ebitda]);
  comps.forEach((cp, i) => { if (cp.include === 0) delete cellsOf(st, 'Comps')[CC.note + rows.Comps['c' + i]]; });   // the outlier's note is 6.1.3's to write
  strip(st, 'Comps', rows, [...STATS, 'cc']);
  strip(st, 'Comps', rows, allKeys(rows, 'Comps').filter(k => /^(sort|rg|ltm|prior)/.test(k)));
  stripHeader(st, 'Comps', rows, 'sort0');
  stripHeader(st, 'Comps', rows, 'rgMult');
  if (quarters) { keepCols(st, 'Comps', rows, qKeys(rows, n), Q_INPUT_COLS); stripHeader(st, 'Comps', rows, 'q0', ['C']); }
  else { strip(st, 'Comps', rows, qKeys(rows, n)); stripHeader(st, 'Comps', rows, 'q0'); }
}
/** Precedents before 6.2.1: the deal terms typed, nothing derived. */
function dealsRaw(st, rows, deals) {
  keepCols(st, 'Precedents', rows, dealKeys(deals.length), DEAL_INPUT_COLS);
  strip(st, 'Precedents', rows, allKeys(rows, 'Precedents').filter(k => !/^d\d+$/.test(k)));
  stripHeader(st, 'Precedents', rows, 'sort0');
  stripHeader(st, 'Precedents', rows, 'rgMult');
}
/** The LBO's blocks by key span. */
const LB = rows => ({
  inputs: span(rows, 'LBO', 'ebitda26', 'circ'), slb: span(rows, 'LBO', 'slbOn', 'slbRent'), su: span(rows, 'LBO', 'useNetDebt', 'rollNewShare'),
  ops: ['ebitda', 'ebitdaAdj', 'fcf'], slbRows: ['rent', 'slbIn', 'cSlb', 'slbHeld'],
  debt: [...span(rows, 'LBO', 'cashOpen', 'cashClose').filter(k => !['cSlb', 'slbHeld'].includes(k)), ...span(rows, 'LBO', 'senOpen', 'sweepCheck')],
  returns: span(rows, 'LBO', 'exitEV', 'hurdleFlag'), bridge: span(rows, 'LBO', 'gain', 'feesSh'), sens: span(rows, 'LBO', 'sensH', 'sens4'), range: span(rows, 'LBO', 'hurdles', 'topVsBid'),
});
const BB = rows => ({
  bids: span(rows, 'Bids', 'headline', 'cashClose'), priced: span(rows, 'Bids', 'earnEV', 'expected'), rank: span(rows, 'Bids', 'rankHead', 'rankExp'),
  wf: span(rows, 'Bids', 'wfEV', 'wfCheck'), stake: span(rows, 'Bids', 'yourVal', 'yourDef'), inputs641: ['earnProb', 'rollRet', 'rollYears', 'rollDisc'],
});
/** Summary as 6.4.4 starts: labels only (no title, no units, no figures, no checks). */
function summaryLabels(st) {
  const cells = cellsOf(st, 'Summary'); const sh = sheetOf(st, 'Summary');
  for (const k of Object.keys(cells)) { const p = parse(k); if (!p || p.r === 4) continue; if (p.col !== 'B' || p.r < 4 || cells[k].it) delete cells[k]; }   // the headers stay; the source line (italic) goes with the title and units
  delete sh.rowH; sh.gridlines = undefined;
}

/* ---------------- the states ---------------- */

const DONE = lazy(() => packState(BASE));
const Rw = ROW;
/** The pages a module has not reached yet, as its lessons find them: the LBO labels only, Bids with the deal's facts only, the Summary labels only, Sources equal uses pending. */
function lboRaw(s, rows) { strip(s, 'LBO', rows, allKeys(rows, 'LBO')); stripHeader(s, 'LBO', rows, 'hurdles'); delete sheetOf(s, 'LBO').condFmt; }
function bidsRaw(s, rows) { const b = BB(rows); strip(s, 'Bids', rows, [...b.bids, ...b.priced, ...b.rank, ...b.wf, ...b.stake, ...b.inputs641]); }
function after62(s, rows) { lboRaw(s, rows); bidsRaw(s, rows); summaryLabels(s); pendSu(s); }
function after61(s, rows, deals) { dealsRaw(s, rows, deals); after62(s, rows); }

// module 6.1: trading comps (Comps grows column group by column group; every later page waits)
const B615 = derive(DONE, s => { strip(s, 'Comps', Rw, span(Rw, 'Comps', 'rgMult', 'rgEqWash')); after61(s, Rw, DEALS); });
const B614 = derive(B615, s => { keepCols(s, 'Comps', Rw, [...compKeys(Rw, 6), 'cc'], [...COMP_INPUT_COLS, ...COMP_EV_COLS, ...COMP_STAT_COLS]); strip(s, 'Comps', Rw, STATS, COMP_OP_COLS); });
const B613 = derive(B614, s => { keepCols(s, 'Comps', Rw, compKeys(Rw, 6), [...COMP_INPUT_COLS, ...COMP_EV_COLS]); strip(s, 'Comps', Rw, [...STATS, 'cc', 'sort0', 'sort1', 'sort2', 'sort3', 'sort4', 'sort5']); stripHeader(s, 'Comps', Rw, 'sort0'); delete cellsOf(s, 'Comps')[CC.note + Rw.Comps.c4]; });
const B612 = derive(B613, s => {
  COMPS.forEach((cp, i) => typeCell(s, 'Comps', CC.ebitda + Rw.Comps['c' + i], cp.ebitda));
  keepCols(s, 'Comps', Rw, qKeys(Rw, 6), Q_INPUT_COLS); stripHeader(s, 'Comps', Rw, 'q0', ['C']);
  strip(s, 'Comps', Rw, ['ltmDate', 'ltmStart', 'priorStart']);
});
const B611 = derive(B615, s => compsRaw(s, Rw, COMPS));
const ALT_PACK = lazy(() => buildPack(ALT));
const ALT2_PACK = lazy(() => buildPack(ALT2));
/** A state on a fresh set: the model sheets, the pack's pages, everything raw. `fn` shapes it. */
function freshState(packFn, fn) { return lazy(() => { const pack = packFn(); const s = packState(pack); fn(s, pack.rows, pack); return s; }); }
const B61C = freshState(ALT_PACK, (s, rows) => { compsRaw(s, rows, ALT.comps, { quarters: true, givenLtm: false }); withoutPages(s, ['Precedents', 'LBO', 'Bids', 'Summary']); pendSu(s); });

// module 6.2: precedents
const B623 = derive(DONE, s => { strip(s, 'Precedents', Rw, span(Rw, 'Precedents', 'rgMult', 'rgEqSite')); after62(s, Rw); });
const B622 = derive(B623, s => { keepCols(s, 'Precedents', Rw, dealKeys(6), [...DEAL_INPUT_COLS, ...DEAL_621_COLS]); strip(s, 'Precedents', Rw, [...STATS, ...span(Rw, 'Precedents', 'tradMed', 'dcfRead'), ...span(Rw, 'Precedents', 'sort0', 'sort5')]); stripHeader(s, 'Precedents', Rw, 'sort0'); });
const B621 = derive(B622, s => { keepCols(s, 'Precedents', Rw, dealKeys(6), DEAL_INPUT_COLS); strip(s, 'Precedents', Rw, ['asOf']); });
const B62C = freshState(ALT_PACK, (s, rows) => { dealsRaw(s, rows, ALT.deals); withoutPages(s, ['LBO', 'Bids', 'Summary']); pendSu(s); });

// module 6.3: the LBO
const B636 = derive(DONE, s => { const b = LB(Rw); strip(s, 'LBO', Rw, [...b.sens, ...b.range]); stripHeader(s, 'LBO', Rw, 'hurdles'); delete sheetOf(s, 'LBO').condFmt; bidsRaw(s, Rw); summaryLabels(s); });
const B635 = derive(B636, s => { strip(s, 'LBO', Rw, LB(Rw).bridge); });
const B634 = derive(B635, s => { strip(s, 'LBO', Rw, LB(Rw).returns); });
const B633 = derive(B634, s => { const b = LB(Rw); strip(s, 'LBO', Rw, [...b.slb, ...b.slbRows]); });
const B632 = derive(B633, s => { const b = LB(Rw); strip(s, 'LBO', Rw, [...b.ops, ...b.debt]); });
const B631 = derive(B632, s => { const b = LB(Rw); strip(s, 'LBO', Rw, [...b.inputs, ...b.su]); pendSu(s); });
const PAPER_PAGE = lazy(() => buildPaper(PAPER));
const B63C = lazy(() => {
  const { sheet, rows } = PAPER_PAGE();
  const s = { sheets: [clone(sheet)], settings: { ...clone(M.stateOf('DONE').settings) } };
  const b = LB(rows);
  strip(s, 'LBO', rows, [...b.slb, ...b.slbRows, ...b.su, 'ebitdaAdj', ...b.debt, ...b.returns, ...b.bridge, ...b.sens, ...b.range]);
  stripHeader(s, 'LBO', rows, 'hurdles'); delete s.sheets[0].condFmt;
  return s;
});

// module 6.4: the bids and the waterfall
const B644 = derive(DONE, s => summaryLabels(s));
const B643 = derive(B644, s => { strip(s, 'Bids', Rw, BB(Rw).stake); });
const B642 = derive(B643, s => { strip(s, 'Bids', Rw, BB(Rw).wf); });
const B641 = derive(B642, s => { const b = BB(Rw); strip(s, 'Bids', Rw, [...b.bids, ...b.priced, ...b.rank, ...b.inputs641]); });
const B64C = derive(DONE, s => { const sh = sheetOf(s, 'Summary'); sh.cells = {}; delete sh.rowH; delete sh.condFmt; sh.gridlines = undefined; });

// module 6.5: the project and the assessment, each on a fresh set: raw comps, deals and bids in, the LBO's term sheet given, the rest to build
function projectShape(s, rows, data) {
  compsRaw(s, rows, data.comps, { quarters: true, givenLtm: false });
  dealsRaw(s, rows, data.deals);
  const lb = LB(rows); strip(s, 'LBO', rows, allKeys(rows, 'LBO').filter(k => !lb.inputs.includes(k))); stripHeader(s, 'LBO', rows, 'hurdles'); delete sheetOf(s, 'LBO').condFmt;
  const bb = BB(rows); strip(s, 'Bids', rows, [...bb.priced, ...bb.rank, ...bb.wf, ...bb.stake, ...bb.inputs641, 'eqHead', 'rollAmt', 'cashClose']);
  summaryLabels(s);
  pendSu(s);
}
const B6P = freshState(ALT_PACK, (s, rows) => projectShape(s, rows, ALT));
const B6A = freshState(ALT2_PACK, (s, rows) => projectShape(s, rows, ALT2));

const BUILDERS = {
  B611, B612, B613, B614, B615, B61C,
  B621, B622, B623, B62C,
  B631, B632, B633, B634, B635, B636, B63C,
  B641, B642, B643, B644, B64C,
  B6P, B6A, DONE,
};
/** The named states, each built on first read. */
export const STATES = {};
for (const id in BUILDERS) Object.defineProperty(STATES, id, { get: BUILDERS[id], enumerable: true });
export const STATE_ORDER = Object.keys(BUILDERS);
/** Which lesson each state starts (the state after a lesson is the next lesson's start; DONE closes every module). */
export const STATE_LESSONS = {
  B611: '6.1.1', B612: '6.1.2', B613: '6.1.3', B614: '6.1.4', B615: '6.1.5', B61C: '6.1.C',
  B621: '6.2.1', B622: '6.2.2', B623: '6.2.3', B62C: '6.2.C',
  B631: '6.3.1', B632: '6.3.2', B633: '6.3.3', B634: '6.3.4', B635: '6.3.5', B636: '6.3.6', B63C: '6.3.C',
  B641: '6.4.1', B642: '6.4.2', B643: '6.4.3', B644: '6.4.4', B64C: '6.4.C',
  B6P: '6.P', B6A: '6.A', DONE: 'the finished pack',
};
/** The rows of the fresh sets' pages (tests and lessons on the challenges, the project and the assessment). */
export const ALT_ROWS = () => ALT_PACK().rows;
export const ALT2_ROWS = () => ALT2_PACK().rows;
export const PAPER_ROWS = () => PAPER_PAGE().rows;

/** The sheet standard: every finished Chapter 6 page (the model's pages are Chapter 5's standard, tested there). */
export const STANDARD = {
  pages: [['DONE', 'Comps', { read: true }], ['DONE', 'Precedents', { read: true }], ['DONE', 'LBO', { read: false }], ['DONE', 'Bids', { read: true }], ['DONE', 'Summary', { read: true }], ['B63C', 'LBO', { read: false }]],
  off: { Data: 'the accountants\' export, laid out as they sent it' },
};

/** A deep clone of a named state (runners mutate their copy, never the master). */
export function stateOf(id) {
  const s = STATES[id];
  if (!s) throw new Error('unknown workbook state ' + id);
  return clone(s);
}

/** The paper LBO solved (6.3.C's answer key): the whole page on its given inputs, as a one-sheet state. */
export function paperState() {
  const { sheet } = PAPER_PAGE();
  return { sheets: [clone(sheet)], settings: { ...clone(M.stateOf('DONE').settings) } };
}

/* ---------------- the replay's state shape: the model's pair (names and settings compared in one key order) ---------------- */
export { diffStates, sessionToState } from './clearcoat-model.js';

/* ---------------- the module challenges and their seeds (one table, one dispatcher) ---------------- */

/** The module challenges and the states they start from (the seed dresses them; the workload never moves). */
export const CHALLENGES = {
  'challenge-precedents': { before: 'B62C' },
  'challenge-paper-lbo': { before: 'B63C' },
};
/** A draw on a grid: lo to hi in steps of `by`, rounded clear of float dust. */
const drawStep = (rng, lo, hi, by) => Math.round((lo + Math.floor(rng() * (Math.round((hi - lo) / by) + 1)) * by) * 1e6) / 1e6;
/** A typed cell of a state re-typed at a fresh figure, in its own look. */
const retyped = (st, name, ref, value) => ({ ...clone(cellsOf(st, name)[ref]), value });
const SEEDS = {
  // 6.2.C: each fresh deal's enterprise value moved by up to 5%, to the nearest $500k
  'challenge-precedents': rng => {
    const st = STATES.B62C, rows = ALT_ROWS().Precedents, p = {};
    ALT.deals.forEach((d, i) => { const ref = DC.ev + rows['d' + i]; p['Precedents!' + ref] = retyped(st, 'Precedents', ref, Math.round(d.ev * drawStep(rng, 95, 105, 1) / 100 / 500) * 500); });
    return p;
  },
  // 6.3.C: a fresh bid and exit multiple on the paper LBO
  'challenge-paper-lbo': rng => {
    const st = STATES.B63C, rows = PAPER_ROWS().LBO;
    return { ['LBO!C' + rows.entryEV]: retyped(st, 'LBO', 'C' + rows.entryEV, drawStep(rng, 160000, 170000, 2500)), ['LBO!C' + rows.exitMult]: retyped(st, 'LBO', 'C' + rows.exitMult, drawStep(rng, 10, 11, 0.25)) };
  },
};
/** A module challenge's seed patch: content only, never workload. */
export function challengeSeed(id, rng) {
  if (!CHALLENGES[id]) throw new Error('clearcoat-valuation: no challenge ' + id);
  return SEEDS[id](rng);
}
