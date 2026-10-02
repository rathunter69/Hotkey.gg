// app2/content/workbooks/clearcoat-databook.js — the Chapter 3 module workbook (Project Rinse).
// Clearcoat Express, the KPI databook: the point-of-sale export for the Austin cluster, Sep 15 to
// Sep 29, 2026, rolled up to a site × package summary, reconciled to the managers' tallies, with
// the Cedar Park build loan and the new-site case (script-ch3.md).
//
// The solved workbook is built first, every page through buildPage (the sheet standard, M86), with
// the figures tied: the checks block reads zero, the reconciliation reads zero, the schedule lands
// on zero. Every lesson's start and end state is then CUT from it, in script order, as a pure patch:
// the graded cells emptied, the faults planted (two site codes with a trailing space, three amounts
// typed as text, a memo in lower case, an inherited Summary block with a short range, a typed
// number, a text number, an external link and a literal inside a formula). STATES chain
// (lesson.state.before → solution → lesson.state.after) and stateOf() hands out deep clones.
//
// Sheets: Summary (the product), Loans (the case), Sites, Packages, Members, Daily (the POS day
// totals, which feed the Sep 15 block and MAXIFS), Transactions (the raw export, off the standard)
// and, from 3.4.4, Scratch. The project and assessment (S7raw, S7done) run the same build over the
// San Antonio cluster in a trimmed profile: what one sitting makes.
import { mulberry32 } from '../../engine/rng.js';
import { dateToSerial } from '../../engine/format.js';
import { buildPage, FMT } from './page.js';
// the chain test and the lessons' replay read states through the shared diff (module-states.test.js)
export { diffStates, sessionToState } from './clearcoat-weekly.js';

export const CHAPTER = 3;
const D = (y, m, d) => dateToSerial(y, m, d);
/** The case's "today": the as-of date on Sites!I5. */
export const AS_OF = D(2026, 9, 15);
/** The fortnight the POS rows cover. */
export const PERIOD = { start: D(2026, 9, 15), end: D(2026, 9, 29), days: 15 };
export const HOLIDAYS = [['Labor Day', D(2026, 9, 7)], ['Thanksgiving', D(2026, 11, 26)]];
export const PACKAGES = [{ code: 'B', name: 'Basic', price: 10, fee: 25 }, { code: 'D', name: 'Deluxe', price: 15, fee: 30 }, { code: 'U', name: 'Ultimate', price: 20, fee: 35 }];
/** The one typed fee 3.2.2 and 3.3.3 use until Chapter 4's lookup (Members!L2). */
export const MEMBER_FEE = 30;
export const LOAN = { principal: 3500000, rate: 0.07, years: 10, perYear: 12 };
export const CASE = { flows: [-5000, 900, 1050, 1150, 1200, 1250], sale: 7000, rate: 0.1, dates: [D(2026, 10, 1), D(2027, 10, 1), D(2028, 10, 1), D(2029, 10, 1), D(2030, 10, 1), D(2031, 10, 1)] };
export const TX_ROWS = 90, MEMBER_ROWS = 40;
export const TX_FIRST = 5, TX_LAST = TX_FIRST + TX_ROWS - 1;   // Transactions rows 5–94
export const MEM_FIRST = 5, MEM_LAST = MEM_FIRST + MEMBER_ROWS - 1;

/** The Austin cluster: the chapter's sites (script-ch3.md, "The workbook"). sep15 is the day count the flags block reads. */
export const AUSTIN = { cluster: 'Austin', seed: 20260929, prefix: 'AUS', sites: [
  { code: 'AUS-DOM', name: 'Domain', opened: D(2019, 3, 15), capacity: 120, hours: 14, target: 250, sep15: 262 },
  { code: 'AUS-MUE', name: 'Mueller', opened: D(2020, 8, 1), capacity: 100, hours: 14, target: 220, sep15: 236 },
  { code: 'AUS-RIV', name: 'Riverside', opened: D(2020, 11, 10), capacity: 100, hours: 14, target: 220, sep15: 224 },
  { code: 'AUS-SLA', name: 'South Lamar', opened: D(2021, 5, 20), capacity: 120, hours: 14, target: 250, sep15: 255 },
  { code: 'AUS-AIR', name: 'Airport', opened: D(2023, 2, 1), capacity: 140, hours: 14, target: 280, sep15: 305 },
  { code: 'AUS-CED', name: 'Cedar Park', opened: D(2026, 9, 8), capacity: 140, hours: 14, target: 200, sep15: 0, ramp: true },
] };
/** The San Antonio cluster: the project's and the assessment's fresh export. */
export const SAN_ANTONIO = { cluster: 'San Antonio', seed: 20261006, prefix: 'SAT', sites: [
  { code: 'SAT-ALA', name: 'Alamo Ranch', opened: D(2019, 6, 3), capacity: 120, hours: 14, target: 250, sep15: 258 },
  { code: 'SAT-STO', name: 'Stone Oak', opened: D(2020, 2, 17), capacity: 100, hours: 14, target: 220, sep15: 231 },
  { code: 'SAT-MED', name: 'Medical Center', opened: D(2021, 1, 12), capacity: 120, hours: 14, target: 250, sep15: 244 },
  { code: 'SAT-HEL', name: 'Helotes', opened: D(2021, 9, 27), capacity: 100, hours: 14, target: 220, sep15: 226 },
  { code: 'SAT-BRK', name: 'Brooks', opened: D(2023, 5, 8), capacity: 140, hours: 14, target: 280, sep15: 297 },
  { code: 'SAT-BOE', name: 'Boerne', opened: D(2026, 9, 1), capacity: 140, hours: 14, target: 200, sep15: 158, ramp: true },
] };

const clone = v => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)));
const r1 = v => Math.round(v * 10) / 10;
const CHANNELS = ['kiosk', 'app', 'attendant'];
const DATE_FMT = { fmtStyle: 'custom', numFmt: 'm/d/yyyy' };
/** The $ on a first-row figure (D4): dollars on a money cell, dollars and cents on a per-unit one. */
const DOLLAR_MONEY = { fmtStyle: 'custom', numFmt: FMT.moneyDollarDash }, DOLLAR_UNIT = { fmtStyle: 'currency', decimals: 2 };
const YEAR_FMT = { fmtStyle: 'custom', numFmt: '0' };

/* ---------------- the data: deterministic per cluster ---------------- */

/**
 * The cluster's records: the POS day totals (site × day), the member list and the export (one row
 * per wash), plus where the plantings sit. Seeded once, so checks can assert exact figures.
 */
export function clusterData(cluster) {
  const rng = mulberry32(cluster.seed);
  const pick = arr => arr[Math.floor(rng() * arr.length)];
  const sites = cluster.sites;
  // the day totals: around target, rounded to fives; the ramp site climbs through the fortnight
  const daily = [];
  sites.forEach(s => {
    for (let d = 0; d < PERIOD.days; d++) {
      let w = s.ramp ? Math.round((140 + d * 5 + rng() * 25) / 5) * 5 : Math.round(s.target * (0.92 + rng() * 0.2) / 5) * 5;
      if (d === 0) w = s.sep15;
      const ticket = 13.5 + Math.round(rng() * 6) / 4;              // the day's retail ticket, $13.50 to $15.00
      const revenue = Math.round(w * (0.45 + rng() * 0.1) * ticket);  // about half the washes are retail
      daily.push({ site: s.code, date: PERIOD.start + d, washes: w, revenue });
    }
  });
  // the member list: forty ids, home sites among the open sites, a handful joined in 2024, six cancelled (three in September)
  const open = sites.filter(s => !s.ramp);
  const members = [];
  const cancels = { 5: D(2025, 11, 20), 13: D(2026, 3, 5), 21: D(2026, 6, 18), 27: D(2026, 9, 3), 33: D(2026, 9, 9), 38: D(2026, 9, 12) };
  for (let i = 0; i < MEMBER_ROWS; i++) {
    const joined = i < 5 ? D(2024, 3 + i * 2, 1 + i * 5) : i < 30 ? D(2025, 1 + ((i - 5) * 5) % 12, 1 + (i * 7) % 27) : D(2026, 1 + (i - 30) % 8, 1 + (i * 3) % 27);
    members.push({ id: 'M' + String(i + 1).padStart(4, '0'), site: open[i % open.length].code, plan: pick(['B', 'D', 'D', 'U']), joined, cancelled: cancels[i] || null });
  }
  // the export: six washes a day for fifteen days, member or retail, with the memo the terminal writes
  const tx = [];
  for (let i = 0; i < TX_ROWS; i++) {
    const date = PERIOD.start + Math.floor(i / 6);
    let site = pick(sites);
    while (site.ramp && date === PERIOD.start && site.sep15 === 0) site = pick(sites);   // the ramp site washed nothing that day
    const atSite = members.filter(m => m.site === site.code && !m.cancelled);
    const member = atSite.length && rng() < 0.5 ? pick(atSite) : null;
    const pkg = member ? member.plan : pick(['B', 'D', 'D', 'U']);
    const price = PACKAGES.find(p => p.code === pkg).price;
    tx.push({ date, site: site.code, pkg, member: member ? member.id : null, amount: member ? 0 : price, channel: pick(CHANNELS) });
  }
  // the plantings: three retail amounts typed as text, two codes with a trailing space (the first two sites), one memo in lower case
  const textRows = [8, 40, 70].map(k => { let i = k; while (tx[i].member) i++; return i; });
  const dirtyRows = [[20, sites[0].code], [50, sites[1].code]].map(([k, code]) => { let i = k; while (tx[i].site !== code && i < TX_ROWS - 1) i++; if (tx[i].site !== code) { tx[i].site = code; tx[i].member = null; tx[i].amount = PACKAGES.find(p => p.code === tx[i].pkg).price; } return i; });
  let lowerRow = 30; while (tx[lowerRow].pkg !== 'D') lowerRow++;
  return { cluster, sites, daily, members, tx, textRows, dirtyRows, lowerRow };
}
/** The memo the terminal writes for a row. */
export const memoOf = (t, lower = false) => `Wash ${lower ? t.pkg.toLowerCase() : t.pkg} @ ${t.site} (${t.channel})`;
/** Daily's row for (site index, day index). */
export const dailyRow = (i, d) => 5 + i * PERIOD.days + d;
const count = (arr, fn) => arr.reduce((k, x) => k + (fn(x) ? 1 : 0), 0);

/* ---------------- the pages ---------------- */

const TX = { date: `Transactions!$A$${TX_FIRST}:$A$${TX_LAST}`, site: `Transactions!$B$${TX_FIRST}:$B$${TX_LAST}`, pkg: `Transactions!$C$${TX_FIRST}:$C$${TX_LAST}`, mem: `Transactions!$D$${TX_FIRST}:$D$${TX_LAST}`, amt: `Transactions!$E$${TX_FIRST}:$E$${TX_LAST}` };
const DY = { site: `Daily!$B$5:$B$${4 + 6 * PERIOD.days}`, washes: `Daily!$D$5:$D$${4 + 6 * PERIOD.days}` };
const MB = { site: `Members!$C$${MEM_FIRST}:$C$${MEM_LAST}`, canc: `Members!$F$${MEM_FIRST}:$F$${MEM_LAST}`, status: `Members!$J$${MEM_FIRST}:$J$${MEM_LAST}`, id: `Members!$B$${MEM_FIRST}:$B$${MEM_LAST}` };
const UNITS = 'USD unless stated';
const each = (cells, refs, fn) => { for (const ref of refs) { cells[ref] = { ...(cells[ref] || {}) }; fn(cells[ref]); } };
const span = (col1, col2, r1, r2) => { const out = []; for (let c = col1.charCodeAt(0); c <= col2.charCodeAt(0); c++) for (let r = r1; r <= r2; r++) out.push(String.fromCharCode(c) + r); return out; };
const trimNulls = arr => { const out = arr.slice(); while (out.length && out[out.length - 1] == null) out.pop(); return out; };

/** Sites: the site master, the as-of date, the age and vintage columns, the calendar block. */
function sitesPage(data, P) {
  const { sites, cluster } = data;
  const ramp = sites.find(s => s.ramp);
  const headers = trimNulls(['Site', 'Cluster', 'Opened', 'Capacity (cars/hr)', 'Hours a day', 'Daily target', 'As of', 'Age (days)', 'Age (years)',
    P.full ? 'Year' : null, P.full ? 'Month' : null, P.full ? 'Day' : null, P.full ? 'Month opened' : null, P.full ? 'Vintage' : null, P.full ? 'Working days' : null, P.full ? 'Trading days' : null]);
  const kinds = ['text', 'text', 'date', 'count', 'count', 'count', 'date', 'count', 'unit', 'year', 'year', 'year', 'date', 'year', 'count', 'count'];
  const page = buildPage({
    name: 'Sites', chapter: CHAPTER, title: `Clearcoat Express: ${cluster.cluster} sites, as of Sep 15, 2026`, units: UNITS, labelHeader: 'Code', headers, kinds, center: true,
    blocks: [
      { rows: sites.map((s, i) => { const r = 5 + i; return { key: s.code, label: s.code, dollar: false, values: trimNulls([s.name, cluster.cluster, s.opened, s.capacity, s.hours, s.target, i === 0 ? AS_OF : null,
        `=$I$5-E${r}`, `=YEARFRAC(E${r},$I$5)`, P.full ? `=YEAR(E${r})` : null, P.full ? `=MONTH(E${r})` : null, P.full ? `=DAY(E${r})` : null, P.full ? `=DATE(L${r},M${r},1)` : null,
        P.full ? `=YEAR(E${r})` : null, P.full ? `=NETWORKDAYS(E${r},$I$5,$C$13:$C$14)` : null, P.full ? `=NETWORKDAYS.INTL(E${r},$I$5,"0000000",$C$13:$C$14)` : null]) }; }) },
      { title: 'Calendar', rows: [
        { key: 'hol1', label: HOLIDAYS[0][0], kind: 'date', values: [HOLIDAYS[0][1]] },
        { key: 'hol2', label: HOLIDAYS[1][0], kind: 'date', values: [HOLIDAYS[1][1]] },
        ...(P.full ? [{ key: 'stub', label: `${ramp.name} first-year stub (years)`, kind: 'unit', values: [`=YEARFRAC(E${5 + sites.indexOf(ramp)},DATE(2026,12,31))`] }] : []),
      ] },
    ],
    source: 'Source: site register, ops; targets from the FY26 budget',
  });
  const c = page.sheet.cells;
  each(c, [...span('E', 'E', 5, 10), 'I5', 'C13', 'C14', ...(P.full ? span('O', 'O', 5, 10) : [])], x => Object.assign(x, DATE_FMT));
  if (P.full) each(c, [...span('L', 'N', 5, 10), ...span('P', 'P', 5, 10)], x => Object.assign(x, YEAR_FMT));
  each(c, span('K', 'K', 5, 10), x => { x.decimals = 1; });
  return page;
}

/** Packages: the price list. */
function packagesPage() {
  return buildPage({
    name: 'Packages', chapter: CHAPTER, title: 'Clearcoat Express: wash packages and member fees', units: UNITS, labelHeader: 'Code',
    headers: ['Package', 'Retail price ($)', 'Member fee ($/mo)'], kinds: ['text', 'unit', 'unit'], center: true,
    blocks: [{ rows: PACKAGES.map(p => ({ key: p.code, label: p.code, values: [p.name, p.price, p.fee] })) }],
    source: 'Source: price list, effective Jan 1, 2026',
  });
}

/** Members: the list, the as-of date and the typed fee in row 2, tenure, status, value and the September churn flag. */
function membersPage(data, P) {
  const { members } = data;
  const headers = trimNulls(['Home site', 'Plan', 'Joined', 'Cancelled', 'End date', 'Tenure (days)', 'Tenure (months)', 'Status', 'Value to date ($)', P.full ? 'Churn, Sep 2026' : null]);
  const kinds = ['text', 'text', 'date', 'date', 'date', 'count', 'unit', 'text', 'money', 'count'];
  const page = buildPage({
    name: 'Members', chapter: CHAPTER, title: 'Clearcoat Express: Unlimited Wash Club members', units: UNITS, labelHeader: 'Member', headers, kinds, center: true,
    blocks: [{ rows: [
      ...members.map((m, i) => { const r = MEM_FIRST + i; return { key: m.id, label: m.id, dollar: false, values: trimNulls([m.site, m.plan, m.joined, m.cancelled, `=IF(F${r}="",$H$2,F${r})`, `=G${r}-E${r}`, `=H${r}/30.4`,
        `=IF(F${r}="","Active","Cancelled")`, `=I${r}*$L$2`, P.full ? `=IF(AND(F${r}>=DATE(2026,9,1),F${r}<=DATE(2026,9,30)),1,0)` : null]) }; }),
      { key: 'total', label: 'Total', total: true, final: true, fill: (col, r, at) => col === 'K' || (P.full && col === 'L') ? `=SUM(${col}${MEM_FIRST}:${col}${MEM_LAST})` : null },
    ] }],
    source: 'Source: membership system export, as of Sep 15, 2026',
    extra: {
      G2: { value: 'As of', align: 'r' }, H2: { formula: '=Sites!I5', fontColor: 'green', ...DATE_FMT },
      K2: { value: 'Fee ($/mo)', align: 'r' }, L2: { value: MEMBER_FEE, fontColor: 'blue', fmtStyle: 'currency', decimals: 0 },
    },
  });
  const c = page.sheet.cells;
  each(c, span('E', 'G', MEM_FIRST, MEM_LAST), x => Object.assign(x, DATE_FMT));
  each(c, span('I', 'I', MEM_FIRST, MEM_LAST), x => { x.decimals = 1; });
  Object.assign(c['K' + MEM_FIRST], DOLLAR_MONEY);
  return page;
}

/** Daily: the POS day totals, site × day, long form (what the Sep 15 block links to and MAXIFS reads). */
function dailyPage(data) {
  const { daily, cluster } = data;
  return buildPage({
    name: 'Daily', chapter: CHAPTER, title: `Clearcoat Express: ${cluster.cluster} washes by site and day (POS day totals), Sep 15 to Sep 29, 2026`, units: UNITS, labelHeader: 'Site',
    headers: ['Date', 'Washes', 'Retail revenue ($)'], kinds: ['date', 'count', 'money'], center: true,
    blocks: [{ rows: [
      ...daily.map((d, i) => ({ key: 'd' + i, label: d.site, values: [d.date, d.washes, d.revenue], dollar: i === 0 })),
      { key: 'total', label: 'Total', total: true, final: true, fill: (col, r) => col === 'C' ? null : `=SUM(${col}5:${col}${4 + daily.length})` },
    ] }],
    source: 'Source: tunnel controllers (washes) and site POS (retail revenue), day totals',
  });
}
function dailyDates(page) { each(page.sheet.cells, span('C', 'C', 5, 4 + 6 * PERIOD.days), x => Object.assign(x, DATE_FMT)); return page; }

/** Loans: the Cedar Park build loan, the new-site case and the payment schedule. */
function loansPage(data, P) {
  const ramp = data.sites.find(s => s.ramp);
  const months = P.full ? 120 : 12;
  const years = CASE.flows.map((_, i) => i);
  const CC = ['C', 'D', 'E', 'F', 'G', 'H'];   // the case's year columns
  const sched = [];
  for (let k = 1; k <= months; k++) sched.push({ key: 'm' + k, dollar: k === 1, fill: (col, r, at) => {
    if (col === 'C') return k;
    if (col === 'D') return k === 1 ? `=C${at('principal')}` : `=G${r - 1}`;
    if (col === 'E') return `=D${r}*$C$${at('mRate')}`;
    if (col === 'F') return `=$C$${at('pmt')}-E${r}`;
    if (col === 'G') return `=D${r}-F${r}`;
    if (col === 'H') return `=-IPMT($C$${at('mRate')},C${r},$C$${at('periods')},$C$${at('principal')})`;
    if (col === 'I') return `=-PPMT($C$${at('mRate')},C${r},$C$${at('periods')},$C$${at('principal')})`;
    if (col === 'J') return `=SUM($E$${at('m1')}:E${r})`;
    return null;
  } });
  const page = buildPage({
    name: 'Loans', chapter: CHAPTER, title: `Clearcoat Express: the ${ramp.name} build loan and the new-site case`, units: 'USD unless stated; the new-site case in USD thousands', center: true,
    labelHeader: 'Line', headers: ['Value'],
    blocks: [
      { title: `The ${ramp.name} build loan`, rows: [
        { key: 'principal', label: 'Principal ($)', kind: 'money', values: [LOAN.principal] },
        { key: 'rate', label: 'Rate (annual)', kind: 'pct', values: [LOAN.rate] },
        { key: 'years', label: 'Term (years)', kind: 'count', values: [LOAN.years] },
        { key: 'perYear', label: 'Payments a year', kind: 'count', values: [LOAN.perYear] },
      ] },
      { title: 'Per period', rows: [
        { key: 'mRate', label: 'Monthly rate', kind: 'pct', fill: (col, r, at) => col === 'C' ? `=C${at('rate')}/C${at('perYear')}` : null },
        { key: 'periods', label: 'Periods (months)', kind: 'count', fill: (col, r, at) => col === 'C' ? `=C${at('years')}*C${at('perYear')}` : null },
      ] },
      { title: 'The payment', rows: [
        { key: 'pmt', label: 'Monthly payment ($)', kind: 'money', dollar: true, fill: (col, r, at) => col === 'C' ? `=-PMT(C${at('mRate')},C${at('periods')},C${at('principal')})` : null },
        { key: 'totalPaid', label: 'Paid over the term ($)', kind: 'money', dollar: false, fill: (col, r, at) => col === 'C' ? `=C${at('pmt')}*C${at('periods')}` : null },
        { key: 'totalInt', label: 'Interest over the term ($)', kind: 'money', dollar: false, fill: (col, r, at) => col === 'C' ? `=C${at('totalPaid')}-C${at('principal')}` : null },
      ] },
      ...(P.full ? [{ title: 'PV and FV', rows: [
        { key: 'pv', label: 'Loan a $35,000 monthly payment supports ($)', kind: 'money', fill: (col, r, at) => col === 'C' ? `=PV(C${at('mRate')},C${at('periods')},-35000)` : null },
        { key: 'fv', label: '$1m in ten years at the loan rate ($)', kind: 'money', dollar: false, fill: (col, r, at) => col === 'C' ? `=FV(C${at('rate')},C${at('years')},0,-1000000)` : null },
      ] }] : []),
      { title: 'The new-site case (USD thousands)', rows: [
        { key: 'year', label: 'Year', kind: 'year', values: years },
        { key: 'date', label: 'Date', kind: 'date', values: CASE.dates },
        { key: 'opCf', label: 'Operating cash flow, less the build', kind: 'money', dollar: true, values: CASE.flows },
        { key: 'sale', label: 'Sale value', kind: 'money', dollar: false, values: [null, null, null, null, null, CASE.sale] },
        { key: 'cf', label: 'Cash flow', kind: 'money', dollar: false, total: true, fill: (col, r, at) => CC.includes(col) ? `=${col}${at('opCf')}+${col}${at('sale')}` : null },
        { key: 'dr', label: 'Discount rate', kind: 'pct', values: [CASE.rate] },
        { key: 'df', label: 'Discount factor', kind: 'factor', fill: (col, r, at) => CC.includes(col) ? `=1/(1+$C$${at('dr')})^${col}${at('year')}` : null },
        { key: 'dcf', label: 'Discounted cash flow', kind: 'money', dollar: false, fill: (col, r, at) => CC.includes(col) ? `=${col}${at('cf')}*${col}${at('df')}` : null },
        { key: 'npvHand', label: 'NPV by hand', kind: 'money', dollar: false, fill: (col, r, at) => col === 'C' ? `=SUM(C${at('dcf')}:H${at('dcf')})` : null },
        { key: 'npvFn', label: 'NPV (function, year 0 outside)', kind: 'money', dollar: false, fill: (col, r, at) => col === 'C' ? `=NPV(C${at('dr')},D${at('cf')}:H${at('cf')})+C${at('cf')}` : null },
        ...(P.full ? [{ key: 'xnpv', label: 'XNPV (dated)', kind: 'money', dollar: false, fill: (col, r, at) => col === 'C' ? `=XNPV(C${at('dr')},C${at('cf')}:H${at('cf')},C${at('date')}:H${at('date')})` : null }] : []),
        { key: 'irr', label: 'IRR', kind: 'pct', fill: (col, r, at) => col === 'C' ? `=IRR(C${at('cf')}:H${at('cf')})` : null },
        ...(P.full ? [{ key: 'xirr', label: 'XIRR (dated)', kind: 'pct', fill: (col, r, at) => col === 'C' ? `=XIRR(C${at('cf')}:H${at('cf')},C${at('date')}:H${at('date')})` : null }] : []),
        { key: 'cum', label: 'Cumulative cash', kind: 'money', dollar: false, fill: (col, r, at) => col === 'C' ? `=C${at('cf')}` : CC.includes(col) ? `=${String.fromCharCode(col.charCodeAt(0) - 1)}${r}+${col}${at('cf')}` : null },
        { key: 'frac', label: 'Fraction of the crossing year', kind: 'factor', fill: (col, r, at) => col >= 'C' && col <= 'G' ? `=IF(AND(${col}${at('cum')}<0,${String.fromCharCode(col.charCodeAt(0) + 1)}${at('cum')}>=0),-${col}${at('cum')}/${String.fromCharCode(col.charCodeAt(0) + 1)}${at('cf')},0)` : null },
        { key: 'payback', label: 'Payback (years)', kind: 'unit', fill: (col, r, at) => col === 'C' ? `=COUNTIF(C${at('cum')}:H${at('cum')},"<0")+SUM(C${at('frac')}:G${at('frac')})` : null },
      ] },
      { title: `Payment schedule${P.full ? '' : ', the first twelve months'}`, header: ['Month', 'Opening ($)', 'Interest ($)', 'Principal ($)', 'Closing ($)', 'IPMT ($)', 'PPMT ($)', 'Cumulative interest ($)'], kinds: ['count', 'money', 'money', 'money', 'money', 'money', 'money', 'money'], rows: sched },
    ],
    source: 'Source: loan agreement, the term sheet of Jun 2026; the case from the FY26 site model',
    checks: [
      ...(P.full ? [{ label: 'Schedule interest ties to total interest', formula: (col, r, at) => `=ROUND(SUM(E${at('m1')}:E${at('m' + months)})-C${at('totalInt')},2)` },
        { label: 'Balance after the last payment', formula: (col, r, at) => `=ROUND(G${at('m' + months)},2)` }]
        : [{ label: 'Twelve months of principal tie to the balance', formula: (col, r, at) => `=ROUND(C${at('principal')}-SUM(F${at('m1')}:F${at('m' + months)})-G${at('m' + months)},2)` }]),
    ],
  });
  const c = page.sheet.cells, at = page.at;
  each(c, span('C', 'H', at.year, at.year), x => Object.assign(x, YEAR_FMT));
  each(c, span('C', 'H', at.date, at.date), x => Object.assign(x, DATE_FMT));
  each(c, [...span('C', 'H', at.df, at.df), ...span('C', 'G', at.frac, at.frac)], x => Object.assign(x, { fmtStyle: 'custom', numFmt: '0.000' }));
  c['C' + at.mRate].decimals = 2;
  page.sheet.rows = 200;
  page.months = months;
  return page;
}

/** Summary: the product. The flags block, the site totals, the packages, the bands, site × package, the reconciliation, the period, the inherited block and the checks. */
function summaryPage(data, P) {
  const { sites, tx, cluster, dirtyRows, textRows } = data;
  const n = sites.length;
  const siteRow = i => 5 + i;
  const FULL = P.full;
  const col = i => String.fromCharCode(67 + i);
  // the POS count per site on a clean export, and the managers' tallies: the first two sites' tallies match the dirty counts (the
  // trailing-space rows are missing from both until 3.4.1), the third counted a re-wash twice, the fifth tallied Sep 30
  const cleanCount = sites.map(s => count(tx, t => t.site === s.code));
  const tally = cleanCount.map((k, i) => i === 0 || i === 1 ? k - 1 : i === 2 ? k + 1 : i === 4 ? k + 2 : k);
  const retailTotal = tx.reduce((t, x) => t + x.amount, 0);
  const priorYear = Math.round(retailTotal / 1.12 / 10) * 10;
  const headers = trimNulls(['Washes, Sep 15', 'Target', 'Flag', 'On target (1/0)', 'Above target', 'Revenue, Sep 15 ($)', 'Bonus ($/day)', 'Tier (washes)', 'Tier bonus ($)', 'Age (years)', 'Below and over 2 years', 'Concern',
    FULL ? 'Visit' : null, FULL ? 'Ramping' : null, FULL ? 'Revenue per wash ($)' : null, FULL ? 'Override (washes)' : null, FULL ? 'Washes used' : null,
    FULL ? 'Ticket, rounded ($)' : null, FULL ? 'Ticket, ceiling ($)' : null, FULL ? 'Ticket, floor ($)' : null, FULL ? 'Washes (000s)' : null, FULL ? 'Gap to target' : null]);
  const kinds = ['count', 'count', 'text', 'count', 'count', 'money', 'money', 'count', 'money', 'unit', 'count', 'text', 'text', 'text', 'unit', 'count', 'count', 'unit', 'unit', 'unit', 'unit', 'count'];
  const TIERS = [[0, 0], [250, 50], [300, 100], [350, 150]];
  const flags = sites.map((s, i) => { const r = siteRow(i); const tier = TIERS[i] || [null, null]; return { key: s.code, label: s.code, dollar: false, values: trimNulls([
    `=Daily!D${dailyRow(i, 0)}`, `=Sites!H${r}`, `=IF(${FULL ? 'S' : 'C'}${r}>=D${r},"On target","Below")`, `=IF(C${r}>=D${r},1,0)`, `=MAX(C${r}-D${r},0)`, `=Daily!E${dailyRow(i, 0)}`,
    `=IFS(C${r}>=350,150,C${r}>=300,100,C${r}>=250,50,TRUE,0)`, tier[0], tier[1], `=Sites!K${r}`, `=AND(C${r}<D${r},L${r}>2)`, `=IF(AND(C${r}<D${r},L${r}>2),"Concern","-")`,
    FULL ? `=IF(OR(C${r}<D${r},Sites!F${r}<110),"Visit","-")` : null, FULL ? `=IF(NOT(L${r}>2),"Ramping","-")` : null, FULL ? `=IFERROR(H${r}/C${r},0)` : null, null, FULL ? `=IF(ISNUMBER(R${r}),R${r},C${r})` : null,
    FULL ? `=ROUND(Q${r},2)` : null, FULL ? `=CEILING(Q${r},0.25)` : null, FULL ? `=FLOOR(Q${r},0.25)` : null, FULL ? `=ROUNDDOWN(C${r}/1000,1)` : null, FULL ? `=ABS(C${r}-D${r})` : null]) }; });
  const siteHeader = trimNulls(['Washes', 'Member washes', 'Retail washes', 'Retail revenue ($)', 'Avg retail ticket ($)', FULL ? 'Busiest day' : null, FULL ? 'Quietest day' : null, 'Top 3 and bottom', 'Rank', 'Active members', 'Membership revenue ($)', 'Total revenue ($)', 'Washes, fortnight', FULL ? 'Per trading day' : null]);
  const siteKinds = ['count', 'count', 'count', 'money', 'unit', 'count', 'count', 'count', 'count', 'count', 'money', 'money', 'count', 'unit'];
  const siteRows = sites.map((s, i) => ({ key: 's' + i, label: s.code, fill: (c, r, at) => {
    const first = at('s0'), last = at('s' + (n - 1));
    switch (c) {
      case 'C': return `=COUNTIF(${TX.site},B${r})`;
      case 'D': return `=COUNTIFS(${TX.site},B${r},${TX.mem},"<>")`;
      case 'E': return `=COUNTIFS(${TX.site},B${r},${TX.amt},">0")`;
      case 'F': return `=SUMIF(${TX.site},B${r},${TX.amt})`;
      case 'G': return `=AVERAGEIFS(${TX.amt},${TX.site},B${r},${TX.amt},">0")`;
      case 'H': return FULL ? `=MAXIFS(${DY.washes},${DY.site},B${r})` : null;
      case 'I': return FULL ? `=MINIFS(${DY.washes},${DY.site},B${r})` : null;
      case 'J': return i < 3 ? `=LARGE($C$${first}:$C$${last},${i + 1})` : i === 3 ? `=SMALL($C$${first}:$C$${last},1)` : null;
      case 'K': return `=RANK(C${r},$C$${first}:$C$${last})`;
      case 'L': return `=COUNTIFS(${MB.site},B${r},${MB.canc},"")`;
      case 'M': return `=L${r}*Members!$L$2`;
      case 'N': return `=F${r}+M${r}`;
      case 'O': return `=SUMIF(${DY.site},B${r},${DY.washes})`;
      case 'P': return FULL ? `=O${r}/$C$${at('tradingDays')}` : null;
    }
    return null;
  } }));
  const sumRow = (keyFirst, keyLast, cols) => (c, r, at) => cols.includes(c) ? `=SUM(${c}${at(keyFirst)}:${c}${at(keyLast)})` : null;
  const page = buildPage({
    name: 'Summary', chapter: CHAPTER, title: `Clearcoat Express: ${cluster.cluster} KPI databook, Sep 15 to Sep 29, 2026`, units: UNITS, labelHeader: 'Site', headers, kinds, center: true,
    blocks: [
      { rows: flags },
      { rows: [{ key: 'onTarget', label: 'Sites on target', kind: 'count', fill: (c, r, at) => c === 'F' ? `=SUM(F${siteRow(0)}:F${siteRow(n - 1)})` : null }] },
      { header: siteHeader, kinds: siteKinds, rows: [
        ...siteRows,
        { key: 'sTotal', label: 'Total', total: true, fill: (c, r, at) => c === 'G' ? `=F${r}/E${r}` : sumRow('s0', 's' + (n - 1), ['C', 'D', 'E', 'F', 'L', 'M', 'N', 'O'])(c, r, at) },
        { key: 'note', label: 'Note', kind: 'text', values: ['Member washes carry $0; membership revenue is the fee times active members'] },
      ] },
      { header: ['Washes', 'Retail washes', 'Retail price ($)', 'Member fee ($/mo)'], kinds: ['count', 'count', 'unit', 'unit'], rows: [
        ...PACKAGES.map((p, i) => ({ key: 'p' + i, label: p.code, dollar: i === 0, fill: (c, r) => c === 'C' ? `=COUNTIF(${TX.pkg},B${r})` : c === 'D' ? `=COUNTIFS(${TX.pkg},B${r},${TX.mem},"")` : c === 'E' ? p.price : c === 'F' ? p.fee : null })),
        { key: 'pTotal', label: 'Total', total: true, fill: sumRow('p0', 'p2', ['C', 'D']) },
        { key: 'sumproduct', label: 'Retail revenue, washes times the price list ($)', kind: 'money', dollar: false, fill: (c, r, at) => c === 'C' ? `=SUMPRODUCT(D${at('p0')}:D${at('p2')},E${at('p0')}:E${at('p2')})` : null },
        { key: 'blended', label: 'Blended ticket, retail revenue over all washes ($/wash)', kind: 'unit', fill: (c, r, at) => c === 'C' ? `=F${at('sTotal')}/C${at('sTotal')}` : null },
        ...(FULL ? [{ key: 'weighted', label: 'Weighted average retail price ($)', kind: 'unit', fill: (c, r, at) => c === 'C' ? `=SUMPRODUCT(D${at('p0')}:D${at('p2')},E${at('p0')}:E${at('p2')})/SUM(D${at('p0')}:D${at('p2')})` : null }] : []),
      ] },
      ...(FULL ? [{ title: 'Retail tickets by band', rows: [
        { key: 'band1', label: 'Under $15', kind: 'count', fill: c => c === 'C' ? `=COUNTIFS(${TX.amt},"<15")` : null },
        { key: 'band2', label: '$15 to under $20', kind: 'count', fill: c => c === 'C' ? `=COUNTIFS(${TX.amt},">=15",${TX.amt},"<20")` : null },
        { key: 'band3', label: '$20 and over', kind: 'count', fill: c => c === 'C' ? `=COUNTIFS(${TX.amt},">=20")` : null },
        { key: 'bandCheck', label: 'Check: bands less COUNT of amounts', kind: 'count', fill: (c, r, at) => c === 'C' ? `=SUM(C${at('band1')}:C${at('band3')})-COUNT(${TX.amt})` : null },
      ] }] : []),
      { title: 'Site by package: washes in C to E, retail revenue ($) in F to H', header: ['B', 'D', 'U', 'B', 'D', 'U'], kinds: ['count', 'count', 'count', 'money', 'money', 'money'], rows: [
        ...sites.map((s, i) => ({ key: 'x' + i, label: s.code, dollar: i === 0, fill: (c, r, at) => {
          const hdr = at('x0') - 1;
          if (c >= 'C' && c <= 'E') return `=COUNTIFS(${TX.site},$B${r},${TX.pkg},${c}$${hdr})`;
          if (c >= 'F' && c <= 'H') return `=SUMIFS(${TX.amt},${TX.site},$B${r},${TX.pkg},${c}$${hdr})`;
          return null;
        } })),
        { key: 'xTotal', label: 'Total', total: true, fill: sumRow('x0', 'x' + (n - 1), ['C', 'D', 'E', 'F', 'G', 'H']) },
      ] },
      { title: 'Reconciliation: POS washes against the managers tallies', header: ['POS washes', 'Managers washes', 'Difference', 'Explanation', 'Adjustment', 'Adjusted', 'Check'], kinds: ['count', 'count', 'count', 'text', 'count', 'count', 'count'], rows: [
        ...sites.map((s, i) => ({ key: 'r' + i, label: s.code, fill: (c, r, at) => {
          switch (c) {
            case 'C': return `=C${at('s' + i)}`;
            case 'D': return tally[i];
            case 'E': return `=D${r}-C${r}`;
            case 'F': return i === 0 || i === 1 ? 'A wash the tally missed; the POS row carried a trailing space' : i === 2 ? 'Re-wash counted twice, 9/22' : i === 4 ? 'Sep 30 tallied, a day the POS rows do not cover' : null;
            case 'G': return i === 0 || i === 1 ? 1 : i === 2 ? -1 : i === 4 ? -2 : null;
            case 'H': return `=D${r}+G${r}`;
            case 'I': return `=H${r}-C${r}`;
          }
          return null;
        } })),
        { key: 'rTotal', label: 'Total', total: true, fill: sumRow('r0', 'r' + (n - 1), ['C', 'D', 'E', 'G', 'H', 'I']) },
      ] },
      ...(FULL ? [{ title: 'Trading calendar, the fortnight', rows: [
        { key: 'pStart', label: 'Period start', kind: 'date', values: [PERIOD.start] },
        { key: 'pEnd', label: 'Period end', kind: 'date', values: [PERIOD.end] },
        { key: 'tradingDays', label: 'Trading days (seven a week, less holidays)', kind: 'count', fill: (c, r, at) => c === 'C' ? `=NETWORKDAYS.INTL(C${at('pStart')},C${at('pEnd')},"0000000",Sites!$C$13:$C$14)` : null },
      ] }] : []),
      { title: 'Retail revenue by site at the new price list (ops draft, kept for the audit)', header: ['Washes', 'Retail revenue ($)', 'At new prices ($)', 'Share of revenue'], kinds: ['count', 'money', 'money', 'pct'], rows: [
        ...sites.map((s, i) => ({ key: 'o' + i, label: s.code, dollar: i === 0, fill: (c, r, at) => c === 'C' ? `=C${at('s' + i)}` : c === 'D' ? `=SUMIF(${TX.site},B${r},${TX.amt})` : c === 'E' ? `=D${r}*$C$${at('uplift')}` : c === 'F' ? `=D${r}/D$${at('oTotal')}` : null })),
        { key: 'oTotal', label: 'Total', total: true, fill: (c, r, at) => c === 'F' ? `=SUM(F${at('o0')}:F${at('o' + (n - 1))})` : sumRow('o0', 'o' + (n - 1), ['C', 'D', 'E'])(c, r, at) },
        { key: 'prior', label: 'Prior year, same fortnight ($)', kind: 'money', dollar: false, values: [priorYear, 'Databook FY25, Summary F21'] },
        { key: 'growth', label: 'Growth on the prior year', kind: 'pct', fill: (c, r, at) => c === 'C' ? `=D${at('oTotal')}/C${at('prior')}-1` : null },
        { key: 'uplift', label: 'Price uplift (x)', kind: 'unit', values: [1.05] },
        { key: 'oCheck', label: 'Check: ties to the site totals', kind: 'count', fill: (c, r, at) => c === 'C' ? `=D${at('oTotal')}-F${at('sTotal')}` : null },
      ] },
    ],
    source: 'Source: POS export (Transactions), Sep 15 to Sep 29, 2026; day totals on Daily; managers tallies from the weekly emails',
    checks: [
      { label: 'Site counts tie to package counts', formula: (c, r, at) => `=C${at('sTotal')}-C${at('pTotal')}` },
      { label: 'Counts tie to the export rows', formula: (c, r, at) => `=C${at('sTotal')}-COUNTA(${TX.date})` },
      { label: 'Retail revenue ties to SUMPRODUCT', formula: (c, r, at) => `=F${at('sTotal')}-C${at('sumproduct')}` },
      { label: 'Reconciliation', formula: (c, r, at) => `=I${at('rTotal')}` },
      { label: 'Loan schedule ties', formula: () => `=Loans!C${P.loansCheckRow}` },
      { label: 'Members active plus cancelled tie to the list', formula: () => `=COUNTIF(${MB.status},"Active")+COUNTIF(${MB.status},"Cancelled")-COUNTA(${MB.id})` },
      { label: 'Checks not at zero', formula: (c, r) => `=COUNTIF(C${r - 6}:C${r - 1},"<>0")` },
      { label: 'Databook ties?', formula: (c, r) => `=IF(C${r - 1}=0,"OK","CHECK")` },
    ],
  });
  const c = page.sheet.cells, at = page.at;
  const flagRow = at.checksFlag = page.std.checksRow + 8;
  c.C2 = { formula: `=C${flagRow}` };
  if (FULL) each(c, span('R', 'R', siteRow(0), siteRow(n - 1)), x => { x.fontColor = 'blue'; x.fmtStyle = 'comma'; x.decimals = 0; });
  each(c, [`C${at.prior}`, `D${at.prior}`], x => { x.fontColor = 'blue'; });
  each(c, [`F${at.r0}`, `F${at.r1}`, `F${at.r2}`, `F${at.r4}`].filter(k => c[k]), x => { x.fontColor = 'blue'; });
  if (FULL) each(c, [`C${at.pStart}`, `C${at.pEnd}`], x => Object.assign(x, DATE_FMT));
  if (FULL) each(c, span('J', 'K', 5, 8), x => Object.assign(x, { fmtStyle: 'custom', numFmt: '#,##0' }));
  each(c, ['H5'], x => Object.assign(x, DOLLAR_MONEY));
  if (FULL) { each(c, ['Q5', 'T5', 'U5', 'V5'], x => Object.assign(x, DOLLAR_UNIT)); each(c, ['P' + at.s0], x => { x.fmtStyle = 'comma'; x.decimals = 2; }); }
  page.sheet.condFmt = [{ id: 'cf1', range: `C2,C${flagRow}`, kind: 'cellValue', op: '=', v1: 'CHECK', style: 'lightred' }];
  page.sheet.rows = Math.max(100, page.std.lastRow + 5);
  page.tally = tally; page.cleanCount = cleanCount; page.priorYear = priorYear;
  return page;
}

/** Transactions: the raw export, off the standard, with the chapter's helper columns in the solved state. */
function transactionsSheet(data, P) {
  const { tx, cluster, textRows, dirtyRows, lowerRow } = data;
  const FULL = P.full;
  const cells = {
    A1: { value: `Clearcoat Express: ${cluster.cluster} POS export, Sep 15 to Sep 29, 2026`, bold: true },
    A2: { value: 'One row per wash; amounts in USD; a member wash carries 0, the member paid on the first', it: true },
  };
  const heads = { A: 'Date', B: 'Site', C: 'Package', D: 'Member', E: 'Amount ($)', F: 'Memo',
    G: 'Month key', H: 'Month end', I: 'Quarter', J: 'Quarter label', K: 'Week of',
    ...(FULL ? { L: 'Fiscal year (Jun)', M: 'Half', N: 'FY label', O: 'Weekday', P: 'Day', Q: 'Weekend (1/0)' } : {}),
    R: 'LEN', S: 'Cluster', T: 'Site', ...(FULL ? { U: 'Position of @', V: 'Site from memo' } : {}), W: 'Channel', ...(FULL ? { X: 'Package from memo', Y: 'Memo without channel', AA: 'Text date', AB: 'Amount times 1' } : {}) };
  for (const k in heads) cells[k + '4'] = { value: heads[k], bold: true };
  tx.forEach((t, i) => {
    const r = TX_FIRST + i;
    cells['A' + r] = { value: t.date, ...DATE_FMT };
    cells['B' + r] = { value: t.site };
    cells['C' + r] = { value: t.pkg };
    if (t.member) cells['D' + r] = { value: t.member };
    cells['E' + r] = { value: t.amount };
    cells['F' + r] = { value: memoOf(t, i === lowerRow) };
    cells['G' + r] = { formula: `=TEXT(A${r},"yyyy-mm")` };
    cells['H' + r] = { formula: `=EOMONTH(A${r},0)`, fmtStyle: 'custom', numFmt: 'mmm-yy' };
    cells['I' + r] = { formula: `=ROUNDUP(MONTH(A${r})/3,0)` };
    cells['J' + r] = { formula: `="Q"&I${r}&" "&YEAR(A${r})` };
    cells['K' + r] = { formula: `=A${r}-WEEKDAY(A${r},2)+1`, ...DATE_FMT };
    if (FULL) {
      cells['L' + r] = { formula: `=IF(MONTH(A${r})>=7,YEAR(A${r})+1,YEAR(A${r}))` };
      cells['M' + r] = { formula: `=IF(MONTH(A${r})>=7,"H1","H2")` };
      cells['N' + r] = { formula: `="FY"&RIGHT(L${r},2)&" "&M${r}` };
      cells['O' + r] = { formula: `=WEEKDAY(A${r},2)` };
      cells['P' + r] = { formula: `=TEXT(A${r},"ddd")` };
      cells['Q' + r] = { formula: `=IF(O${r}>=6,1,0)` };
    }
    cells['R' + r] = { formula: `=LEN(B${r})` };
    cells['S' + r] = { formula: `=LEFT(B${r},3)` };
    cells['T' + r] = { formula: `=RIGHT(TRIM(B${r}),3)` };
    if (FULL) {
      cells['U' + r] = { formula: `=FIND("@",F${r})` };
      cells['V' + r] = { formula: `=MID(F${r},FIND("@",F${r})+2,7)` };
    }
    cells['W' + r] = { formula: `=MID(F${r},FIND("(",F${r})+1,FIND(")",F${r})-FIND("(",F${r})-1)` };
    if (FULL) {
      cells['X' + r] = { formula: `=UPPER(MID(F${r},SEARCH("wash ",F${r})+5,1))` };
      cells['Y' + r] = { formula: `=SUBSTITUTE(F${r}," (kiosk)","")` };
    }
  });
  if (FULL) { cells['AA' + TX_FIRST] = { formula: '=DATEVALUE("2026-09-15")', ...DATE_FMT }; cells['AB' + TX_FIRST] = { formula: `=E${TX_FIRST}*1` }; }
  return { name: 'Transactions', cells, colW: { 1: 80, 2: 80, 3: 64, 4: 72, 5: 80, 6: 190, 10: 80, 11: 80, 14: 72, 22: 110, 25: 150 }, rows: 100, cols: 30, active: { r: 1, c: 1 } };
}
/** The faults the terminal sends: three amounts as text, two site codes with a trailing space. (The lower-case memo is in every state: the raw memo is the audit trail.) */
function plantExportFaults(cells, data, { text = true, dirty = true } = {}) {
  if (text) for (const i of data.textRows) cells['E' + (TX_FIRST + i)] = { value: String(data.tx[i].amount) };
  if (dirty) for (const i of data.dirtyRows) cells['B' + (TX_FIRST + i)] = { value: data.tx[i].site + ' ' };
}

/** Scratch: the sheet 3.4.4 splits a copy of the codes on (values, never formulas). */
function scratchSheet(data) {
  const cells = {};
  data.tx.forEach((t, i) => { const r = 1 + i; cells['A' + r] = { value: t.site }; cells['B' + r] = { value: t.site.slice(0, 3) }; cells['C' + r] = { value: t.site.slice(4) }; cells['D' + r] = { value: t.site.slice(4) }; });
  return { name: 'Scratch', cells, colW: {}, active: { r: 1, c: 1 } };
}

/* ---------------- the solved workbook ---------------- */

/**
 * Build the solved workbook for a cluster: `full` is the chapter's (every column every lesson
 * builds); the project profile is what one sitting makes. Returns the state and the address map M.
 */
export function buildSolved(cluster = AUSTIN, { full = true } = {}) {
  const data = clusterData(cluster);
  const P = { full };
  const loans = loansPage(data, P);
  P.loansCheckRow = loans.std.checksRow + 1;
  const sites = sitesPage(data, P), packages = packagesPage(), members = membersPage(data, P), daily = dailyDates(dailyPage(data));
  const summary = summaryPage(data, P);
  const state = {
    sheets: [summary.sheet, loans.sheet, sites.sheet, packages.sheet, members.sheet, daily.sheet, transactionsSheet(data, P), ...(full ? [scratchSheet(data)] : [])],
    settings: { calcMode: 'automatic', iterative: false, qat: ['save', 'undo', 'redo', 'fontColor', 'fillColor', 'borders', 'decDecimal'] },
  };
  const M = { summary: summary.at, summaryChecksRow: summary.std.checksRow, loans: loans.at, loansChecksRow: loans.std.checksRow, sites: sites.at, members: members.at, months: loans.months,
    tally: summary.tally, cleanCount: summary.cleanCount, priorYear: summary.priorYear, data, full };
  return { state, M };
}

/* ---------------- the lesson chain: states cut from the solved workbook ---------------- */

const sheetOf = (state, name) => state.sheets.find(s => s.name === name);
/** Empty the graded cells: the value, formula and role colour go, the number format and alignment stay (a skeleton the learner fills). */
function empty(cells, refs) {
  for (const ref of refs) {
    const c = cells[ref]; if (!c) continue;
    const keep = { ...c }; delete keep.value; delete keep.formula; delete keep.fontColor;
    if (Object.keys(keep).length) cells[ref] = keep; else delete cells[ref];
  }
}
/** Re-point a formula cell that exists (a lesson's earlier form of it). */
function set(cells, ref, patch) { if (!cells[ref]) return; const c = { ...cells[ref], ...patch }; if (patch.formula) delete c.value; if (patch.value !== undefined) delete c.formula; cells[ref] = c; }
const rows = (col, first, last) => span(col, col, first, last);
const siteRange = (M, col, keyFirst, keyLast) => span(col, col, M.summary[keyFirst], M.summary[keyLast]);

/**
 * What each lesson adds, in script order, as the strip that takes it back out of the state after it.
 * Applied from the last lesson backwards, each start state is the previous lesson's end state.
 */
export const LESSONS = [
  { id: '3.1.1', lesson: 'if-on-a-threshold', strip: (s, M) => { const c = sheetOf(s, 'Summary').cells; empty(c, [...span('E', 'G', 5, 10), 'F' + M.summary.onTarget]); } },
  { id: '3.1.2', lesson: 'nested-if-ifs-min-max', strip: (s, M) => { const c = sheetOf(s, 'Summary').cells; empty(c, [...rows('I', 5, 10), 'I4']); for (let r = 5; r <= 10; r++) set(c, 'G' + r, { formula: `=IF(C${r}>=D${r},C${r}-D${r},0)` }); } },
  { id: '3.1.3', lesson: 'and-or-not', strip: (s) => { const c = sheetOf(s, 'Summary').cells; empty(c, span('M', 'P', 5, 10)); } },
  { id: '3.1.4', lesson: 'iferror-and-the-override', strip: (s, M) => { const c = sheetOf(s, 'Summary').cells; if (!M.full) return;
    for (let r = 5; r <= 10; r++) { set(c, 'Q' + r, { formula: `=H${r}/C${r}` }); set(c, 'E' + r, { formula: `=IF(C${r}>=D${r},"On target","Below")` }); }
    empty(c, ['R4', ...rows('R', 5, 10), ...rows('S', 5, 10)]); } },   // R keeps its header's bold and its number format: the lesson labels it and colors it blue
  { id: '3.2.1', lesson: 'date-serials', strip: (s, M) => { const c = sheetOf(s, 'Sites').cells; empty(c, span('J', M.full ? 'P' : 'K', 5, 10));
    const sm = sheetOf(s, 'Summary').cells; M.data.sites.forEach((site, i) => { sm['L' + (5 + i)] = { ...sm['L' + (5 + i)], value: r1((AS_OF - site.opened) / 365.25), fontColor: 'blue' }; delete sm['L' + (5 + i)].formula; }); } },
  { id: '3.2.2', lesson: 'member-tenure', strip: (s, M) => { const c = sheetOf(s, 'Members').cells; empty(c, [...span('G', 'L', MEM_FIRST, MEM_LAST), 'K' + M.members.total, 'L' + M.members.total, 'L2']); } },
  { id: '3.2.3', lesson: 'period-keys', strip: (s) => { const c = sheetOf(s, 'Transactions').cells; empty(c, span('G', 'K', TX_FIRST, TX_LAST)); } },
  { id: '3.2.4', lesson: 'yearfrac-and-fiscal-periods', strip: (s, M) => { const c = sheetOf(s, 'Sites').cells; for (let r = 5; r <= 10; r++) set(c, 'K' + r, { formula: `=J${r}/365.25` }); if (M.sites.stub) empty(c, ['C' + M.sites.stub]);
    empty(sheetOf(s, 'Transactions').cells, span('L', 'N', TX_FIRST, TX_LAST)); } },
  { id: '3.2.5', lesson: 'trading-calendar', strip: (s, M) => { empty(sheetOf(s, 'Transactions').cells, span('O', 'Q', TX_FIRST, TX_LAST)); empty(sheetOf(s, 'Sites').cells, span('Q', 'R', 5, 10));
    const c = sheetOf(s, 'Summary').cells; empty(c, siteRange(M, 'P', 's0', 's5')); if (M.summary.tradingDays) empty(c, ['C' + M.summary.tradingDays]); } },
  { id: '3.3.1', lesson: 'round-family', strip: (s) => { empty(sheetOf(s, 'Summary').cells, span('T', 'X', 5, 10)); } },
  { id: '3.3.2', lesson: 'countif-countifs', strip: (s, M) => { const c = sheetOf(s, 'Summary').cells, A = M.summary;
    empty(c, [...span('C', 'E', A.s0, A.sTotal), ...span('C', 'D', A.p0, A.pTotal), ...span('C', 'E', A.x0, A.xTotal), ...(A.band1 ? span('C', 'C', A.band1, A.bandCheck) : []), 'C' + (M.summaryChecksRow + 1), 'C' + (M.summaryChecksRow + 2)]); } },
  { id: '3.3.3', lesson: 'sumif-sumifs-averageifs', strip: (s, M) => { const c = sheetOf(s, 'Summary').cells, A = M.summary;
    empty(c, [...span('F', 'G', A.s0, A.sTotal), ...span('L', 'O', A.s0, A.sTotal), 'C' + A.note, ...span('F', 'H', A.x0, A.xTotal)]); } },
  { id: '3.3.4', lesson: 'busiest-sites', strip: (s, M) => { const c = sheetOf(s, 'Summary').cells, A = M.summary; empty(c, span('H', 'K', A.s0, A.s5)); } },
  { id: '3.3.5', lesson: 'sumproduct-blended-ticket', strip: (s, M) => { const c = sheetOf(s, 'Summary').cells, A = M.summary; empty(c, ['C' + A.sumproduct, 'C' + A.blended, ...(A.weighted ? ['C' + A.weighted] : []), 'C' + (M.summaryChecksRow + 3)]); } },
  { id: '3.3.6', lesson: 'the-reconciliation', strip: (s, M) => { const c = sheetOf(s, 'Summary').cells, A = M.summary; empty(c, [...span('C', 'I', A.r0, A.rTotal), 'C' + (M.summaryChecksRow + 4)]); } },
  { id: '3.4.1', lesson: 'split-the-codes', strip: (s, M) => { const c = sheetOf(s, 'Transactions').cells; empty(c, span('R', 'T', TX_FIRST, TX_LAST)); plantExportFaults(c, M.data, { text: false, dirty: true }); } },
  { id: '3.4.2', lesson: 'parse-the-memo', strip: (s) => { empty(sheetOf(s, 'Transactions').cells, span('U', 'Y', TX_FIRST, TX_LAST)); } },
  { id: '3.4.3', lesson: 'text-to-numbers', strip: (s, M) => { const c = sheetOf(s, 'Transactions').cells; plantExportFaults(c, M.data, { text: true, dirty: false }); delete c['AA' + TX_FIRST]; delete c['AB' + TX_FIRST];
    const sm = sheetOf(s, 'Summary').cells, A = M.summary; empty(sm, ['F' + A.r0, 'G' + A.r0, 'F' + A.r1, 'G' + A.r1]); } },
  { id: '3.4.4', lesson: 'text-to-columns-flash-fill', strip: (s) => { s.sheets = s.sheets.filter(x => x.name !== 'Scratch'); } },
  { id: '3.5.1', lesson: 'pv-fv-pmt', strip: (s, M) => { const c = sheetOf(s, 'Loans').cells, L = M.loans; empty(c, ['mRate', 'periods', 'pmt', 'totalPaid', 'totalInt', 'pv', 'fv'].filter(k => L[k]).map(k => 'C' + L[k])); } },
  { id: '3.5.2', lesson: 'npv-xnpv', strip: (s, M) => { const c = sheetOf(s, 'Loans').cells, L = M.loans; empty(c, [...span('C', 'H', L.df, L.dcf), 'C' + L.npvHand, 'C' + L.npvFn, ...(L.xnpv ? ['C' + L.xnpv] : [])]); } },
  { id: '3.5.3', lesson: 'irr-xirr', strip: (s, M) => { const c = sheetOf(s, 'Loans').cells, L = M.loans; empty(c, ['C' + L.irr, ...(L.xirr ? ['C' + L.xirr] : []), ...span('C', 'H', L.cum, L.frac), 'C' + L.payback]); } },
  { id: '3.5.4', lesson: 'payment-schedule', strip: (s, M) => { const c = sheetOf(s, 'Loans').cells, L = M.loans; empty(c, [...span('C', 'J', L.m1, L['m' + M.months]), ...rows('C', M.loansChecksRow + 1, M.loansChecksRow + 2)]); } },
  { id: '3.6.1', lesson: 'trace-arrows-evaluate', strip: (s, M) => { const c = sheetOf(s, 'Summary').cells, A = M.summary;
    for (let i = 0; i < 6; i++) { const r = A['o' + i]; if (c['D' + r] && c['D' + r].formula) set(c, 'D' + r, { formula: `=SUMIF(Transactions!$B$${TX_FIRST}:$B$${TX_LAST - 1},B${r},Transactions!$E$${TX_FIRST}:$E$${TX_LAST - 1})` }); } } },
  { id: '3.6.2', lesson: 'f9-show-formulas-at-scale', strip: (s, M) => { const c = sheetOf(s, 'Summary').cells, A = M.summary; set(c, 'D' + A.o1, { value: 1240 }); set(c, 'C' + A.o3, { value: '12' }); } },
  { id: '3.6.3', lesson: 'hardcode-external-link-hunt', strip: (s, M) => { const c = sheetOf(s, 'Summary').cells, A = M.summary;
    set(c, 'C' + A.prior, { formula: "='[Databook FY25.xlsx]Summary'!$F$21" }); delete c['C' + A.prior].fontColor; delete c['D' + A.prior];
    for (let i = 0; i < 6; i++) set(c, 'E' + A['o' + i], { formula: `=D${A['o' + i]}*1.05` });
    delete c['B' + A.uplift]; delete c['C' + A.uplift]; } },
  { id: '3.6.4', lesson: 'checks-block-rollup', strip: (s, M) => { const sh = sheetOf(s, 'Summary'); empty(sh.cells, rows('C', M.summaryChecksRow + 5, M.summaryChecksRow + 8)); delete sh.cells.C2; delete sh.condFmt; } },
];
/** The state ids, in chain order: S0 is 3.1.1's start; each lesson's end is the next one's start. */
export const CHAIN_IDS = ['S0', 'S1a', 'S1b', 'S1c', 'S1d', 'S2a', 'S2b', 'S2c', 'S2d', 'S2e', 'S3a', 'S3b', 'S3c', 'S3d', 'S3e', 'S3f', 'S4a', 'S4b', 'S4c', 'S4d', 'S5a', 'S5b', 'S5c', 'S5d', 'S6a', 'S6b', 'S6c', 'S6d'];

function chain(solved, M) {
  const states = { [CHAIN_IDS[CHAIN_IDS.length - 1]]: solved };
  let cur = solved;
  for (let k = LESSONS.length - 1; k >= 0; k--) { cur = clone(cur); LESSONS[k].strip(cur, M); states[CHAIN_IDS[k]] = cur; }
  const out = {}; for (const id of CHAIN_IDS) out[id] = states[id];
  return out;
}

const AUSTIN_BUILD = buildSolved(AUSTIN, { full: true });
/** The address map of the chapter's workbook: every keyed row of Summary, Loans, Sites and Members, and the data behind the pages. */
export const MAP = AUSTIN_BUILD.M;
const CHAIN = chain(AUSTIN_BUILD.state, AUSTIN_BUILD.M);

/* ---------------- 3.7: the project and the assessment ---------------- */

/** The project's workbook over a fresh cluster: the trimmed solved state and its raw start (every lesson's strip applied). */
export function buildProject(cluster = SAN_ANTONIO) {
  const { state, M } = buildSolved(cluster, { full: false });
  const raw = clone(state);
  for (let k = LESSONS.length - 1; k >= 0; k--) LESSONS[k].strip(raw, M);
  return { raw, done: state, M };
}
const PROJECT = buildProject(SAN_ANTONIO);
export const MAP_PROJECT = PROJECT.M;

export const STATES = { ...CHAIN, S7raw: PROJECT.raw, S7done: PROJECT.done };
/** The chain the lessons walk; S7raw and S7done are the project's fresh export, not a step after S6d. */
export const STATE_ORDER = Object.keys(STATES);
/** Each lesson's before and after state, by lesson id. */
export const LESSON_STATES = Object.fromEntries(LESSONS.map((l, i) => [l.lesson, { before: CHAIN_IDS[i], after: CHAIN_IDS[i + 1] }]));

/** The sheet standard (screenplay 5, M86): every finished page, and the sheets off the standard on purpose. */
export const STANDARD = {
  pages: [['S6d', 'Summary'], ['S6d', 'Loans'], ['S6d', 'Sites'], ['S6d', 'Packages'], ['S6d', 'Members'], ['S6d', 'Daily'],
    ['S7done', 'Summary'], ['S7done', 'Loans'], ['S7done', 'Sites'], ['S7done', 'Packages'], ['S7done', 'Members'], ['S7done', 'Daily']],
  off: {
    Transactions: 'the raw POS export, laid out by the terminal',
    Scratch: 'the one-time scratch sheet 3.4.4 splits a copy of the codes on',
  },
};

/** A deep clone of a named state (runners mutate their copy, never the master). */
export function stateOf(id) {
  const s = STATES[id];
  if (!s) throw new Error('unknown workbook state ' + id);
  return clone(s);
}
