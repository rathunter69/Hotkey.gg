// app2/content/workbooks/clearcoat-pack.js — the Chapter 4 workbook (Project Rinse): the diligence
// pack. Clearcoat Express, the Austin cluster's POS export for Sep 15 to 29, 2026, the lists, the
// buyers' question log, the KPI page, the management case with its sensitivities, the utilization
// dashboard, the inputs and six site tabs (script-ch4.md, "The workbook").
//
// Built the way the plan's section 2a asks: the SOLVED workbook first, every page through
// buildPage (the sheet standard, M86) and tied (the checks read zero, the cubes tie to the export,
// the roll-up ties to the cubes, the case table ties to the live case), then every lesson's start
// and end state cut from it as a pure patch (a cell taken from the solved page, a planting, or a
// scaffold the lesson writes and a later lesson clears). stateOf() hands out deep clones.
//
// Figures are deterministic (one seed, washes rounded to fives, revenue to cents), so tests can
// read the sheet and assert exact numbers. buildSolved() takes the seed, the dates and the site
// names, so the project and the assessment can wear another fortnight's or another cluster's
// clothing on the same shape.
import { mulberry32 } from '../../engine/rng.js';
import { dateToSerial } from '../../engine/format.js';
import { buildPage, FMT, formatOf } from './page.js';
import { Sheet } from '../../engine/sheet.js';
import { pivotCache, pivotLayout } from '../../engine/pivot.js';
import { refKey, parseRef } from '../../engine/refs.js';
import { diffStates as diffCells, sessionToState as sessionCells } from './clearcoat-weekly.js';

export const CHAPTER = 4;
export const UNITS = 'USD unless stated; costs shown as negatives';
const DATE_FMT = { fmtStyle: 'custom', numFmt: 'd-mmm-yy' };

/* ---------------- the case's figures ---------------- */

/** The six Austin sites as Chapter 3's Sites sheet lists them: code, name, cluster, opened, capacity (cars an hour), hours open, daily site costs ($). */
export const SITES = [
  { code: 'AUS-DOM', name: 'Domain', tab: 'Domain', opened: dateToSerial(2019, 3, 15), capacity: 120, hours: 14, costs: 1450, target: 260, ticket: 14.5 },
  { code: 'AUS-MUE', name: 'Mueller', tab: 'Mueller', opened: dateToSerial(2020, 8, 1), capacity: 100, hours: 14, costs: 1300, target: 215, ticket: 13.5 },
  { code: 'AUS-RIV', name: 'Riverside', tab: 'Riverside', opened: dateToSerial(2020, 11, 10), capacity: 100, hours: 14, costs: 1325, target: 220, ticket: 13.75 },
  { code: 'AUS-SLA', name: 'South Lamar', tab: 'SouthLamar', opened: dateToSerial(2021, 5, 20), capacity: 120, hours: 14, costs: 1400, target: 250, ticket: 14 },
  { code: 'AUS-AIR', name: 'Airport', tab: 'Airport', opened: dateToSerial(2023, 2, 1), capacity: 140, hours: 14, costs: 1500, target: 290, ticket: 14 },
  { code: 'AUS-CED', name: 'Cedar Park', tab: 'CedarPark', opened: dateToSerial(2026, 9, 8), capacity: 140, hours: 14, costs: 1275, target: 190, ticket: 13.5 },
];
export const PACKAGES = [['B', 'Basic', 10, 25], ['D', 'Deluxe', 15, 30], ['U', 'Ultimate', 20, 35]];
/** The manager bonus tiers (3.1.2): washes a day → bonus a day, sorted ascending for the band lookup (4.1.6). */
export const TIERS = [[0, 0], [250, 50], [300, 100], [350, 150]];
export const CASES = ['Management', 'Base', 'Downside'];
/** The three cases' inputs: washes a day per site, blended ticket ($), member share, sites at year end (4.5.1). */
export const CASE_INPUTS = { washes: [275, 250, 220], ticket: [14.5, 14, 13], share: [0.55, 0.5, 0.45], sites: [46, 44, 40] };
/** The inputs sheet: the figures every page reads, and where the chapter's cross-chapter ties live (FY26 revenue $50m, EBITDA $16.6m, 40 sites). */
export const INPUTS = { cost: 1.5, retail: 1, siteCosts: 1375, headOffice: 6000000, days: 365, fy26Revenue: 50000000, fy26Ebitda: 16600000, fy26Sites: 40, ticket: 14 };
/** The chapter's export: Sep 15 to 29, 2026 (fifteen days, six sites, ninety rows). The project's is the fortnight after. */
export const EXPORT = { seed: 20260915, start: dateToSerial(2026, 9, 15), days: 15, label: 'Sep 15 to 29, 2026', asOf: dateToSerial(2026, 9, 29), year: 'FY27' };
export const EXPORT_NEXT = { seed: 20261001, start: dateToSerial(2026, 10, 1), days: 15, label: 'Oct 1 to 15, 2026', asOf: dateToSerial(2026, 10, 15), year: 'FY27' };
/** The plantings: a site code misspelled on one row, and one site-day whose controller never reported (its figures blank; the row stays). */
export const PLANT = { misspelt: { day: 9, site: 0, code: 'AUS-DMO' }, missing: { day: 7, site: 2 } };

const r2 = v => Math.round(v * 100) / 100;
const clone = v => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)));
const col = n => String.fromCharCode(64 + n);
const refsIn = range => { const [a, b] = range.split(':'); const pa = /^([A-Z]+)(\d+)$/.exec(a), pb = /^([A-Z]+)(\d+)$/.exec(b || a); const out = []; for (let c = pa[1].charCodeAt(0); c <= pb[1].charCodeAt(0); c++) for (let r = +pa[2]; r <= +pb[2]; r++) out.push(String.fromCharCode(c) + r); return out; };

/** Monday of the week a serial falls in, and the week key the export and the cube share ("Week of 14-Sep"). */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ymd = s => { const d = new Date(Date.UTC(1899, 11, 30) + s * 86400000); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), wd: (d.getUTCDay() + 6) % 7 }; };   // wd: Mon 0 … Sun 6
const mondayOf = s => s - ymd(s).wd;
export const weekKey = s => { const m = ymd(mondayOf(s)); return `Week of ${m.d}-${MONTHS[m.m - 1]}`; };
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * The rows of the POS export for a fortnight: date-major (every site for a day, then the next day), so one
 * site's rows are never contiguous (4.2.5's paste lands between other sites' rows). Washes follow
 * each site's daily target with a Saturday peak, retail and member split near half, retail revenue
 * at the site's retail ticket. The missing site-day carries blanks.
 */
export function exportRows({ seed, start, days } = EXPORT, sites = SITES) {
  const rng = mulberry32(seed);
  const rows = [];
  for (let d = 0; d < days; d++) {
    const date = start + d;
    const wd = ymd(date).wd;
    const dayFactor = wd === 5 ? 1.5 : wd === 6 ? 1.2 : wd === 0 ? 0.85 : 1;
    sites.forEach((s, i) => {
      const total = Math.round((s.target * dayFactor * (0.9 + rng() * 0.2)) / 5) * 5;
      const retail = Math.round((total * (0.45 + rng() * 0.1)) / 5) * 5;
      const member = total - retail;
      const blank = d === PLANT.missing.day && i === PLANT.missing.site;
      rows.push({ date, code: s.code, site: i, day: d, retail: blank ? null : retail, member: blank ? null : member, revenue: blank ? null : r2(retail * s.ticket), hours: blank ? null : s.hours, week: weekKey(date), dayName: DAY_NAMES[wd] });
    });
  }
  return rows;
}
/** Export!A5 is the first row; the row of (day, site). */
export const exportRow = (d, i, nSites = SITES.length) => 5 + d * nSites + i;
export const EXPORT_LAST = 94;   // 5 + 90 − 1

/** The weeks a fortnight touches, in order: { key, start, end, days }. */
export function weeksOf(rows) {
  const out = [];
  for (const r of rows) {
    let w = out.find(x => x.key === r.week);
    if (!w) { w = { key: r.week, start: r.date, end: r.date, dates: new Set() }; out.push(w); }
    w.end = Math.max(w.end, r.date); w.dates.add(r.date);
  }
  return out.map(w => ({ key: w.key, start: w.start, end: w.end, days: w.dates.size }));
}

/* ---------------- the pages ---------------- */

const each = (cells, refs, fn) => { for (const ref of refs) { cells[ref] = { ...(cells[ref] || {}) }; fn(cells[ref]); } };
const blue = c => { c.fontColor = 'blue'; };
const green = c => { c.fontColor = 'green'; };

/** The raw POS export (off the standard: a raw export, laid out by the feed). */
function exportSheet(rows, label) {
  const cells = {
    A1: { value: `Clearcoat Express: POS export, Austin, ${label}`, bold: true },
    A2: { value: 'One row per site and day from the tunnel controllers; retail revenue at the site POS; member washes carry no ticket' },
    A4: { value: 'Date', bold: true }, B4: { value: 'Site', bold: true }, C4: { value: 'Retail washes', bold: true }, D4: { value: 'Member washes', bold: true },
    E4: { value: 'Total washes', bold: true }, F4: { value: 'Retail revenue ($)', bold: true }, G4: { value: 'Hours open', bold: true },
    H4: { value: 'Week', bold: true }, I4: { value: 'Day', bold: true },
  };
  rows.forEach((x, i) => {
    const r = 5 + i;
    cells['A' + r] = { value: x.date, ...DATE_FMT };
    cells['B' + r] = { value: x.code };
    if (x.retail != null) {
      cells['C' + r] = { value: x.retail }; cells['D' + r] = { value: x.member };
      cells['E' + r] = { formula: `=C${r}+D${r}` };
      cells['F' + r] = { value: x.revenue, fmtStyle: 'comma', decimals: 2 }; cells['G' + r] = { value: x.hours };
    }
    cells['H' + r] = { formula: `="Week of "&TEXT(A${r}-WEEKDAY(A${r},2)+1,"d-mmm")` };
    cells['I' + r] = { formula: `=TEXT(A${r},"ddd")` };
  });
  return { name: 'Export', cells, colW: { 1: 72, 2: 72, 3: 92, 4: 100, 5: 92, 6: 118, 7: 80, 8: 108, 9: 48, 10: 140 }, freeze: { r: 4, c: 0 }, active: { r: 1, c: 1 } };
}
/** The working cells the lessons leave under and beside the export (4.1.7 the key column; 4.2.2 the filtered totals; 4.2.5 the wildcards). */
const EXPORT_WORK = {
  key: Object.fromEntries([['J4', { value: 'Key', bold: true }], ...Array.from({ length: 90 }, (_, i) => ['J' + (5 + i), { formula: `=B${5 + i}&"|"&TEXT(A${5 + i},"yyyy-mm-dd")` }])]),
  totals: { D96: { value: 'SUM, every row' }, E96: { formula: '=SUM(E5:E94)', fmtStyle: 'comma', decimals: 0 }, D97: { value: 'SUBTOTAL, rows showing' }, E97: { formula: '=SUBTOTAL(109,E5:E94)', fmtStyle: 'comma', decimals: 0 }, D98: { value: 'Rows showing' }, E98: { formula: '=SUBTOTAL(103,A5:A94)' } },
  wildcards: { I96: { value: 'Austin rows' }, J96: { formula: '=COUNTIF(B5:B94,"AUS-*")' }, I97: { value: 'Domain, by pattern' }, J97: { formula: '=COUNTIF(B5:B94,"AUS-?O?")' }, I98: { value: 'Retail revenue, codes ending R ($)' }, J98: { formula: '=SUMIFS(F5:F94,B5:B94,"*R")', fmtStyle: 'comma', decimals: 0 } },
};

/** Lists: the site table, the packages, the weeks; beside them the bonus tiers, the case list and the unique site list the chapter builds. */
function listsPage(weeks, sites) {
  const page = buildPage({
    name: 'Lists', chapter: CHAPTER, title: 'Clearcoat Express: lists for the diligence pack', units: UNITS, labelHeader: 'Code',
    headers: ['Site', 'Cluster', 'Opened', 'Capacity (cars an hour)', 'Hours open', 'Daily site costs ($)'], kinds: ['text', 'text', 'date', 'count', 'count', 'money'],
    blocks: [
      { rows: sites.map(s => ({ key: s.code, label: s.code, dollar: false, values: [s.name, 'Austin', s.opened, s.capacity, s.hours, s.costs] })) },
      { title: 'Packages', header: ['Package', 'Retail price ($)', 'Monthly fee ($)'], kinds: ['text', 'unit', 'unit'],
        rows: PACKAGES.map(([code, name, price, fee]) => ({ key: 'pk-' + code, label: code, dollar: true, values: [name, price, fee] })) },
      { title: 'Weeks in the POS data', header: ['Starts', 'Ends', 'Days'], kinds: ['date', 'date', 'count'],
        rows: weeks.map((w, i) => ({ key: 'wk' + i, label: w.key, dollar: false, values: [w.start, w.end, `=COUNTIFS(Export!$A$5:$A$94,">="&C${20 + i},Export!$A$5:$A$94,"<="&D${20 + i})/${sites.length}`] })) },
    ],
    source: 'Source: site masters (Chapter 3), the package list, and the POS export on Export',
    checks: [{ label: 'Unique sites cover every export row', formula: '=O11-COUNTA(Export!$B$5:$B$94)' }],
  });
  const c = page.sheet.cells;
  each(c, ['E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'C20', 'C21', 'C22', 'D20', 'D21', 'D22'], x => Object.assign(x, DATE_FMT));
  // the bonus tiers (from Chapter 3) and the case list, beside the tables
  c.J4 = { value: 'Washes a day', bold: true, align: 'r' }; c.K4 = { value: 'Bonus ($ a day)', bold: true, align: 'r' };
  TIERS.forEach(([w, b], i) => { c['J' + (5 + i)] = { value: w, fontColor: 'blue', fmtStyle: 'comma', decimals: 0 }; c['K' + (5 + i)] = { value: b, fontColor: 'blue', fmtStyle: 'comma', decimals: 0 }; });
  c.L4 = { value: 'Cases', bold: true };
  CASES.forEach((k, i) => { c['L' + (5 + i)] = { value: k }; });
  // the unique site list with its COUNTIF proof (4.2.3)
  c.N4 = { value: 'Site', bold: true }; c.O4 = { value: 'Rows on Export', bold: true, align: 'r' };
  sites.forEach((s, i) => { c['N' + (5 + i)] = { value: s.code }; c['O' + (5 + i)] = { formula: `=COUNTIF(Export!$B$5:$B$94,N${5 + i})`, fontColor: 'green', fmtStyle: 'comma', decimals: 0 }; });
  c.O11 = { formula: '=SUM(O5:O10)', bold: true, bt: true, fmtStyle: 'comma', decimals: 0 };
  page.sheet.colW[10] = 92; page.sheet.colW[11] = 100; page.sheet.colW[12] = 92; page.sheet.colW[14] = 72; page.sheet.colW[15] = 100;
  return page;
}
/** The cells on Lists that 4.2.3 builds (the unique list and its proof). */
const LISTS_UNIQUE = ['N4', 'O4', ...refsIn('N5:N10'), ...refsIn('O5:O10'), 'O11'];

/** Inputs: the figures every page reads. The ticket (row 15) arrives in 4.5.5; the names list (rows 17 on) in 4.6.2. */
function inputsPage(ex) {
  const page = buildPage({
    name: 'Inputs', chapter: CHAPTER, title: 'Clearcoat Express: inputs for the diligence pack', units: UNITS, labelHeader: 'Input',
    headers: ['Value', 'Source'], kinds: ['money', 'text'],
    blocks: [
      { rows: [
        { key: 'cost', label: 'Cost per wash ($)', kind: 'unit', dollar: true, values: [INPUTS.cost, 'Supplier quote, Sep 15, 2026'] },
        { key: 'asof', label: 'As-of date', kind: 'date', values: [ex.asOf, 'Last day of the POS data'] },
        { key: 'retail', label: 'Retail cost per wash ($)', kind: 'unit', dollar: true, values: [INPUTS.retail, 'Card fee and marketing per retail wash; members are billed monthly'] },
        { key: 'siteCosts', label: 'Daily site costs per site ($)', kind: 'money', dollar: false, values: [INPUTS.siteCosts, 'FY26 site costs over 40 sites and 365 days'] },
        { key: 'headOffice', label: 'Head office ($ a year)', kind: 'money', dollar: false, values: [INPUTS.headOffice, 'FY26, from the book'] },
        { key: 'days', label: 'Days a year', kind: 'count', values: [INPUTS.days, ''] },
        { key: 'fy26Revenue', label: 'FY26 revenue ($)', kind: 'money', dollar: false, values: [INPUTS.fy26Revenue, 'The book, historical financials'] },
        { key: 'fy26Ebitda', label: 'FY26 EBITDA ($)', kind: 'money', dollar: false, values: [INPUTS.fy26Ebitda, 'The book, historical financials'] },
        { key: 'fy26Sites', label: 'Sites at FY26 year end', kind: 'count', values: [INPUTS.fy26Sites, 'The book'] },
        { key: 'period', label: 'Export period', kind: 'text', values: [ex.label, 'The POS export on Export'] },
        { key: 'ticket', label: 'Blended ticket ($)', kind: 'unit', dollar: true, values: [INPUTS.ticket, 'Management case; moved here from Scenarios so the sensitivities reach it'] },
      ] },
      { title: 'Names in this workbook (Paste List)', header: ['Refers to'], kinds: ['text'],
        rows: [['Case', '=Scenarios!$C$11'], ['Cases', '=Lists!$L$5:$L$7'], ['Cost_Per_Wash', '=Inputs!$C$5'], ['Sites', '=Lists!$N$5:$N$10'], ['Ticket', '=Inputs!$C$15']].map(([n, ref]) => ({ key: 'nm-' + n, label: n, kind: 'text', values: ["'" + ref] })) },
    ],
    source: 'Source: the supplier quote, the book, and the POS data on Export',
  });
  const c = page.sheet.cells;
  Object.assign(c.C6, DATE_FMT);
  // Paste List writes the reference as text: the leading apostrophe is how Excel keeps "=…" as text
  for (const k of ['nm-Case', 'nm-Cases', 'nm-Cost_Per_Wash', 'nm-Sites', 'nm-Ticket']) { const r = page.at[k]; c['C' + r] = { value: c['C' + r].value.slice(1) }; }
  page.sheet.colW[3] = 120; page.sheet.colW[4] = 360;
  return page;
}
/** The names the chapter defines (4.6), as a lesson state carries them. */
export const NAMES = { Case: 'Scenarios!$C$11', Ticket: 'Inputs!$C$15', Cost_Per_Wash: 'Inputs!$C$5', Cases: 'Lists!$L$5:$L$7', Sites: 'Lists!$N$5:$N$10' };

/** One site tab: head office's weekly figures for the site, typed, laid out the same on every tab (4.3.6). */
function siteTab(site, rows, weeks, label) {
  const wk = k => rows.filter(r => r.code === site.code && r.week === k);
  const sum = (k, f) => wk(k).reduce((t, r) => t + (r[f] || 0), 0);
  return buildPage({
    name: site.tab, chapter: CHAPTER, title: `Clearcoat Express: ${site.name} (${site.code}), ${label}`, units: UNITS, labelHeader: 'Line',
    headers: [...weeks.map(w => w.key), 'Total'], kinds: weeks.map(() => 'count').concat('count'),
    blocks: [{ rows: [
      { key: 'retail', label: 'Retail washes', dollar: false, fill: (c, r) => c === 'F' ? `=SUM(C${r}:E${r})` : sum(weeks[c.charCodeAt(0) - 67].key, 'retail') },
      { key: 'member', label: 'Member washes', dollar: false, fill: (c, r) => c === 'F' ? `=SUM(C${r}:E${r})` : sum(weeks[c.charCodeAt(0) - 67].key, 'member') },
      { key: 'total', label: 'Total washes', total: true, fill: (c, r) => c === 'F' ? `=SUM(C${r}:E${r})` : `=${c}${r - 2}+${c}${r - 1}` },
      { key: 'revenue', label: 'Retail revenue ($)', kind: 'money', dollar: true, fill: (c, r) => c === 'F' ? `=SUM(C${r}:E${r})` : r2(sum(weeks[c.charCodeAt(0) - 67].key, 'revenue')) },
      { key: 'hours', label: 'Hours open', dollar: false, fill: (c, r) => c === 'F' ? `=SUM(C${r}:E${r})` : sum(weeks[c.charCodeAt(0) - 67].key, 'hours') },
    ] }],
    source: 'Source: head office, from the site controller and the site POS',
    checks: [{ label: 'Washes tie to the POS data', formula: (c, r, at) => `=F${at('total')}-SUMIFS(Export!$E$5:$E$94,Export!$B$5:$B$94,"${site.code}")` }],
  });
}

/** The KPI page: the site block, the two cubes, the lookups the questions use, the window, the ranking, the roll-up, and the checks. */
function summaryPage(weeks, sites, ex) {
  const n = sites.length;
  const first = 5, last = 4 + n;
  const wkCols = weeks.map((_, i) => col(3 + i));   // C, D, E
  const lastWk = wkCols[wkCols.length - 1];
  const wk = c => wkCols.includes(c);
  const sum3 = r => `=SUM(C${r}:${lastWk}${r})`;
  const page = buildPage({
    name: 'Summary', chapter: CHAPTER, title: `Clearcoat Express: KPI page, ${ex.label}`, units: UNITS, labelHeader: 'Code',
    headers: ['Site', 'Capacity (cars an hour)', 'Hours open', 'Daily capacity', 'Days reported', 'Washes', 'Utilization', 'Peak day washes', 'Peak utilization', 'Member washes', 'Member share'],
    kinds: ['text', 'count', 'count', 'count', 'count', 'count', 'pct', 'count', 'pct', 'count', 'pct'],
    blocks: [
      { rows: [
        ...sites.map(s => ({ key: s.code, label: s.code, dollar: false, fill: (c, r) => ({
          C: `=INDEX(Lists!$C$5:$C$10,MATCH($B${r},Lists!$B$5:$B$10,0))`,
          D: `=INDEX(Lists!$F$5:$F$10,MATCH($B${r},Lists!$B$5:$B$10,0))`,
          E: `=INDEX(Lists!$G$5:$G$10,MATCH($B${r},Lists!$B$5:$B$10,0))`,
          F: `=D${r}*E${r}`,
          G: `=COUNTIFS(Export!$B$5:$B$94,$B${r},Export!$G$5:$G$94,">0")`,
          H: `=SUMIFS(Export!$E$5:$E$94,Export!$B$5:$B$94,$B${r})`,
          I: `=H${r}/(F${r}*G${r})`,
          J: `=MAXIFS(Export!$E$5:$E$94,Export!$B$5:$B$94,$B${r})`,
          K: `=J${r}/F${r}`,
          L: `=SUMIFS(Export!$D$5:$D$94,Export!$B$5:$B$94,$B${r})`,
          M: `=L${r}/H${r}`,
        })[c] })),
        { key: 'kpi-total', label: 'Total', total: true, dollar: false, fill: (c, r) => ({
          F: `=SUM(F${first}:F${last})`, H: `=SUM(H${first}:H${last})`, I: `=H${r}/SUMPRODUCT(F${first}:F${last},G${first}:G${last})`,
          J: `=MAX(J${first}:J${last})`, L: `=SUM(L${first}:L${last})`, M: `=L${r}/H${r}`,
        })[c] || null },
      ] },
      { title: 'Washes by site and week', header: [...weeks.map(w => w.key), 'Total'], kinds: ['count', 'count', 'count', 'count'],
        rows: [
          ...sites.map(s => ({ key: 'wc-' + s.code, label: s.code, dollar: false, fill: (c, r, at) => c === 'F' ? sum3(r) : wk(c) ? `=SUMIFS(Export!$E$5:$E$94,Export!$B$5:$B$94,$B${r},Export!$H$5:$H$94,${c}$${at('wc-' + sites[0].code) - 1})` : null })),
          { key: 'wc-total', label: 'Total', total: true, dollar: false, fill: (c, r) => 'CDEF'.includes(c) ? `=SUM(${c}${r - n}:${c}${r - 1})` : null },
        ] },
      { title: 'Retail revenue by site and week ($)', header: [...weeks.map(w => w.key), 'Total'], kinds: ['money', 'money', 'money', 'money'],
        rows: [
          ...sites.map(s => ({ key: 'rc-' + s.code, label: s.code, fill: (c, r, at) => c === 'F' ? sum3(r) : wk(c) ? `=SUMIFS(Export!$F$5:$F$94,Export!$B$5:$B$94,$B${r},Export!$H$5:$H$94,${c}$${at('rc-' + sites[0].code) - 1})` : null })),
          { key: 'rc-total', label: 'Total', total: true, final: true, fill: (c, r) => 'CDEF'.includes(c) ? `=SUM(${c}${r - n}:${c}${r - 1})` : null },
        ] },
      { title: 'Any site, any week', rows: [
        { key: 'tw-site', label: 'Site code', kind: 'text', values: [sites[4].code] },
        { key: 'tw-week', label: 'Week', kind: 'text', values: [weeks[1].key] },
        { key: 'tw-row', label: 'Row position', kind: 'count', fill: (c, r, at) => c === 'C' ? `=MATCH(C${at('tw-site')},$B$15:$B$20,0)` : null },
        { key: 'tw-col', label: 'Column position', kind: 'count', fill: (c, r, at) => c === 'C' ? `=MATCH(C${at('tw-week')},$C$14:$E$14,0)` : null },
        { key: 'tw-ans', label: 'Washes', kind: 'count', fill: (c, r, at) => c === 'C' ? `=INDEX($C$15:$E$20,MATCH(C${at('tw-site')},$B$15:$B$20,0),MATCH(C${at('tw-week')},$C$14:$E$14,0))` : null },
      ] },
      { title: 'Washes for a site on a day', rows: [
        { key: 'md-site', label: 'Site code', kind: 'text', values: [sites[3].code] },
        { key: 'md-date', label: 'Date', kind: 'date', values: [ex.start + 4] },
        { key: 'md-key', label: 'Key', kind: 'text', fill: (c, r, at) => c === 'C' ? `=C${at('md-site')}&"|"&TEXT(C${at('md-date')},"yyyy-mm-dd")` : null },
        { key: 'md-im', label: 'Washes, by the key column', kind: 'count', fill: (c, r, at) => c === 'C' ? `=INDEX(Export!$E$5:$E$94,MATCH(C${at('md-key')},Export!$J$5:$J$94,0))` : null },
        { key: 'md-sumifs', label: 'Washes, by SUMIFS', kind: 'count', fill: (c, r, at) => c === 'C' ? `=SUMIFS(Export!$E$5:$E$94,Export!$B$5:$B$94,C${at('md-site')},Export!$A$5:$A$94,C${at('md-date')})` : null },
      ] },
      { title: 'Window', rows: [
        { key: 'win-start', label: 'Start date', kind: 'date', values: [ex.start + ex.days - 7] },
        { key: 'win-end', label: 'End date', kind: 'date', values: [ex.start + ex.days - 1] },
        { key: 'win-washes', label: 'Washes in the window', kind: 'count', fill: (c, r, at) => c === 'C' ? `=SUMIFS(Export!$E$5:$E$94,Export!$A$5:$A$94,">="&C${at('win-start')},Export!$A$5:$A$94,"<="&C${at('win-end')})` : null },
        { key: 'win-rev', label: 'Retail revenue in the window ($)', kind: 'money', dollar: true, fill: (c, r, at) => c === 'C' ? `=SUMIFS(Export!$F$5:$F$94,Export!$A$5:$A$94,">="&C${at('win-start')},Export!$A$5:$A$94,"<="&C${at('win-end')})` : null },
      ] },
      { title: 'Revenue per open hour in the window', header: ['Revenue in window ($)', 'Open hours', 'Revenue an hour ($)', 'Rank'], kinds: ['money', 'count', 'unit', 'count'],
        rows: [
          ...sites.map((s, i) => ({ key: 'rh-' + s.code, label: s.code, dollar: i === 0, fill: (c, r, at) => ({
            C: `=SUMIFS(Export!$F$5:$F$94,Export!$B$5:$B$94,$B${r},Export!$A$5:$A$94,">="&$C$${at('win-start')},Export!$A$5:$A$94,"<="&$C$${at('win-end')})`,
            D: `=E${first + i}*($C$${at('win-end')}-$C$${at('win-start')}+1)`, E: `=C${r}/D${r}`, F: `=RANK(E${r},$E$${at('rh-' + sites[0].code)}:$E$${at('rh-' + sites[n - 1].code)})`,
          })[c] })),
          { key: 'rh-leader', label: 'Leader', kind: 'unit', dollar: true, fill: (c, r, at) => { const a = at('rh-' + sites[0].code), b = at('rh-' + sites[n - 1].code); return c === 'C' ? `=INDEX($B$${a}:$B$${b},MATCH(1,$F$${a}:$F$${b},0))` : c === 'D' ? `=INDEX($E$${a}:$E$${b},MATCH(1,$F$${a}:$F$${b},0))` : null; } },
        ] },
      { title: 'Company roll-up from the six site tabs', header: [...weeks.map(w => w.key), 'Total'], kinds: ['count', 'count', 'count', 'count'],
        rows: [
          { key: 'ru-retail', label: 'Retail washes', dollar: false, fill: (c, r) => c === 'F' ? sum3(r) : wk(c) ? '=' + sites.map(s => `${s.tab}!${c}5`).join('+') : null },
          { key: 'ru-member', label: 'Member washes', dollar: false, fill: (c, r) => c === 'F' ? sum3(r) : wk(c) ? '=' + sites.map(s => `${s.tab}!${c}6`).join('+') : null },
          { key: 'ru-total', label: 'Total washes', total: true, fill: (c, r) => c === 'F' ? sum3(r) : wk(c) ? `=${c}${r - 2}+${c}${r - 1}` : null },
          { key: 'ru-revenue', label: 'Retail revenue ($)', kind: 'money', dollar: true, fill: (c, r) => c === 'F' ? sum3(r) : wk(c) ? '=' + sites.map(s => `${s.tab}!${c}8`).join('+') : null },
        ] },
    ],
    source: 'Source: the POS export on Export, the site list on Lists, and the six site tabs',
    checks: [
      { label: 'Washes cube ties to the POS data', formula: (c, r, at) => `=F${at('wc-total')}-SUM(Export!$E$5:$E$94)` },
      { label: 'Revenue cube ties to the POS data', formula: (c, r, at) => `=F${at('rc-total')}-SUM(Export!$F$5:$F$94)` },
      { label: 'Member share times washes ties to member washes', formula: '=ROUND(M11*H11-L11,0)' },
      { label: 'KPI washes tie to the cube', formula: (c, r, at) => `=H11-F${at('wc-total')}` },
      { label: 'Roll-up ties to the cube', formula: (c, r, at) => `=F${at('ru-total')}-F${at('wc-total')}` },
      { label: 'All checks read zero (0 is OK, 1 is not)', formula: (c, r) => `=IF(AND(C${r - 5}=0,C${r - 4}=0,C${r - 3}=0,C${r - 2}=0,C${r - 1}=0),0,1)` },
    ],
  });
  const c = page.sheet.cells, at = page.at;
  // the title reads Inputs (4.3.4); the site codes link to the unique list (4.2.3, 4.3.1)
  c.A1 = { formula: '="Clearcoat Express: KPI page, "&Inputs!$C$14', bold: true, fsz: c.A1.fsz, fontColor: 'green' };
  sites.forEach((s, i) => {
    c['B' + (first + i)] = { formula: `=Lists!N${5 + i}`, fontColor: 'green' };
    for (const k of ['wc-', 'rc-', 'rh-']) c['B' + at[k + s.code]] = { formula: `=$B${first + i}` };
  });
  // the typed inputs the lookups read: blue
  const inputs = ['tw-site', 'tw-week', 'md-site', 'md-date', 'win-start', 'win-end'].map(k => 'C' + at[k]);
  each(c, inputs, blue);
  each(c, ['md-date', 'win-start', 'win-end'].map(k => 'C' + at[k]), x => Object.assign(x, DATE_FMT));
  page.sheet.colW[2] = 72;
  return page;
}
/** Where things sit on Summary (the rows the lessons name), read from the built page. */
function summaryMap(at) {
  const codes = SITES.map(s => s.code);
  return { siteRows: codes.map(k => at[k]), totalRow: at['kpi-total'], cubeTitle: at['wc-' + codes[0]] - 2, cubeHeader: at['wc-' + codes[0]] - 1, cubeRows: codes.map(k => at['wc-' + k]), cubeTotal: at['wc-total'],
    revTitle: at['rc-' + codes[0]] - 2, revHeader: at['rc-' + codes[0]] - 1, revRows: codes.map(k => at['rc-' + k]), revTotal: at['rc-total'],
    twoWay: { title: at['tw-site'] - 1, site: at['tw-site'], week: at['tw-week'], row: at['tw-row'], col: at['tw-col'], answer: at['tw-ans'] },
    multi: { title: at['md-site'] - 1, site: at['md-site'], date: at['md-date'], key: at['md-key'], im: at['md-im'], sumifs: at['md-sumifs'] },
    window: { title: at['win-start'] - 1, start: at['win-start'], end: at['win-end'], washes: at['win-washes'], revenue: at['win-rev'] },
    perHour: { title: at['rh-' + codes[0]] - 2, header: at['rh-' + codes[0]] - 1, rows: codes.map(k => at['rh-' + k]), leader: at['rh-leader'] },
    rollup: { title: at['ru-retail'] - 2, header: at['ru-retail'] - 1, retail: at['ru-retail'], member: at['ru-member'], total: at['ru-total'], revenue: at['ru-revenue'] },
    source: at['ru-revenue'] + 1, checks: at['ru-revenue'] + 3, checkRows: [1, 2, 3, 4, 5, 6].map(i => at['ru-revenue'] + 3 + i) };
}

/** Scenarios: the three cases, the picker and the switch, the live outputs, the sensitivities, break-even, and the cases side by side. */
function scenariosPage(ex) {
  const only = (colLetter, f) => (c, r, at) => c === colLetter ? f(r, at) : null;
  const C_ = f => only('C', f);
  const page = buildPage({
    name: 'Scenarios', chapter: CHAPTER, title: `Clearcoat Express forecast, ${ex.year}`, units: UNITS, labelHeader: 'Input',
    headers: [...CASES, null, 'Live'], kinds: ['money', 'money', 'money', 'money', 'money'],
    blocks: [
      { rows: [
        { key: 'washes', label: 'Washes a day per site', kind: 'count', fill: (c, r) => c === 'G' ? `=CHOOSE(Case,C${r},D${r},E${r})` : 'CDE'.includes(c) ? CASE_INPUTS.washes['CDE'.indexOf(c)] : null },
        { key: 'ticket', label: 'Blended ticket ($)', kind: 'unit', dollar: true, fill: (c, r) => c === 'G' ? `=INDEX(C${r}:E${r},Case)` : 'CDE'.includes(c) ? '=Inputs!$C$15' : null },
        { key: 'share', label: 'Member share', kind: 'pct', fill: (c, r) => c === 'G' ? `=INDEX(C${r}:E${r},Case)` : 'CDE'.includes(c) ? CASE_INPUTS.share['CDE'.indexOf(c)] : null },
        { key: 'sites', label: 'Sites at year end', kind: 'count', fill: (c, r) => c === 'G' ? `=INDEX(C${r}:E${r},Case)` : 'CDE'.includes(c) ? CASE_INPUTS.sites['CDE'.indexOf(c)] : null },
      ] },
      { rows: [
        { key: 'case', label: 'Case', kind: 'text', values: ['Base'] },
        { key: 'switch', label: 'Case number', kind: 'count', fill: C_((r, at) => `=MATCH(C${at('case')},Lists!$L$5:$L$7,0)`) },
      ] },
      { rows: [
        { key: 'driver', label: 'Data table driver (leave blank)', kind: 'unit', values: [] },
        { key: 'ticketModel', label: 'Ticket in the model ($)', kind: 'unit', dollar: true, fill: C_((r, at) => `=IF(C${at('driver')}="",Inputs!$C$15,C${at('driver')})`) },
      ] },
      { title: 'Outputs, live case', rows: [
        { key: 'washesYr', label: 'Washes a year', kind: 'count', fill: C_((r, at) => `=G${at('sites')}*G${at('washes')}*Inputs!$C$10`) },
        { key: 'revenue', label: 'Revenue', dollar: true, fill: C_((r, at) => `=C${at('washesYr')}*C${at('ticketModel')}`) },
        { key: 'cow', label: 'Cost of washes', indent: 1, fill: C_((r, at) => `=-C${at('washesYr')}*Inputs!$C$5`) },
        { key: 'retail', label: 'Retail costs', indent: 1, fill: C_((r, at) => `=-C${at('washesYr')}*(1-G${at('share')})*Inputs!$C$7`) },
        { key: 'siteCosts', label: 'Site costs', indent: 1, fill: C_((r, at) => `=-G${at('sites')}*Inputs!$C$10*Inputs!$C$8`) },
        { key: 'contrib', label: 'Site contribution', total: true, fill: C_((r, at) => `=SUM(C${at('revenue')}:C${at('siteCosts')})`) },
        { key: 'ho', label: 'Head office', indent: 1, fill: C_(() => '=-Inputs!$C$9') },
        { key: 'ebitda', label: 'EBITDA', total: true, final: true, fill: C_((r, at) => `=C${at('contrib')}+C${at('ho')}`) },
        { key: 'margin', label: 'EBITDA margin', kind: 'pct', fill: C_((r, at) => `=C${at('ebitda')}/C${at('revenue')}`) },
      ] },
      // the sensitivities are real Data Tables (Alt A W T): the edge typed, the output linked in the
      // corner column C, the results {=TABLE()} in D:H (tablesOn below writes them)
      { title: 'EBITDA by ticket', rows: [
        { key: 'tkVals', label: 'Ticket ($)', kind: 'unit', dollar: true, values: [null, ...TICKETS] },
        { key: 'tkEbitda', label: 'EBITDA', dollar: true, fill: (c, r, at) => c === 'C' ? `=C${at('ebitda')}` : null },
      ] },
      { title: 'EBITDA by ticket and member share', rows: [
        { key: 'twVals', label: 'Member share down, ticket across ($)', kind: 'unit', dollar: true, fill: (c, r, at) => c === 'C' ? `=C${at('ebitda')}` : 'DEFGH'.includes(c) ? TICKETS['DEFGH'.indexOf(c)] : null },
        ...SHARES.map((sh, i) => ({ key: 'tw' + i, label: null, kind: 'pct', values: [sh] })),
      ] },
      { title: 'Break-even washes a day', rows: [
        { key: 'beSite', label: 'Site code', kind: 'text', values: ['AUS-DOM'] },
        { key: 'beCosts', label: 'Daily site costs ($)', dollar: true, fill: C_((r, at) => `=INDEX(Lists!$H$5:$H$10,MATCH(C${at('beSite')},Lists!$B$5:$B$10,0))`) },
        { key: 'beCpw', label: 'Contribution per wash ($)', kind: 'unit', dollar: true, fill: C_((r, at) => `=C${at('ticketModel')}-Inputs!$C$5-(1-G${at('share')})*Inputs!$C$7`) },
        { key: 'beWashes', label: 'Washes a day', kind: 'count', values: [250] },
        { key: 'beDaily', label: 'Daily site contribution ($)', dollar: false, fill: C_((r, at) => `=C${at('beWashes')}*C${at('beCpw')}-C${at('beCosts')}`) },
        { key: 'beHand', label: 'Break-even washes a day, by hand', kind: 'unit', fill: C_((r, at) => `=C${at('beCosts')}/C${at('beCpw')}`) },
        { key: 'beGoalSeek', label: 'Break-even washes a day, per Goal Seek', kind: 'count', values: [BREAK_EVEN.goalSeek] },
      ] },
      { title: 'Cases side by side', rows: [
        { key: 'coName', label: 'Case', kind: 'text', fill: (c, r, at) => 'DEF'.includes(c) ? `=INDEX(Lists!$L$5:$L$7,${c}${at('coNum')})` : null },
        { key: 'coNum', label: 'Case number', kind: 'count', values: [null, 1, 2, 3] },
        { key: 'coWashes', label: 'Washes a year', kind: 'count', dollar: false, fill: (c, r, at) => c === 'C' ? `=C${at('washesYr')}` : null },
        { key: 'coRevenue', label: 'Revenue', dollar: true, fill: (c, r, at) => c === 'C' ? `=C${at('revenue')}` : null },
        { key: 'coContrib', label: 'Site contribution', fill: (c, r, at) => c === 'C' ? `=C${at('contrib')}` : null },
        { key: 'coEbitda', label: 'EBITDA', total: true, final: true, fill: (c, r, at) => c === 'C' ? `=C${at('ebitda')}` : null },
      ] },
    ],
    source: 'Source: the management case (Scenarios), Inputs, and the site list on Lists',
    checks: [
      { label: 'Live case in the side-by-side table ties to EBITDA', formula: (c, r, at) => `=ROUND(INDEX($D$${at('coEbitda')}:$F$${at('coEbitda')},Case)-C${at('ebitda')},0)` },
      { label: 'Break-even by hand ties to Goal Seek', formula: (c, r, at) => `=ROUND(C${at('beHand')},0)-C${at('beGoalSeek')}` },
      { label: 'EBITDA margin within 0 to 100%', formula: (c, r, at) => `=IF(AND(C${at('margin')}>=0,C${at('margin')}<=1),0,1)` },
    ],
  });
  const c = page.sheet.cells, at = page.at;
  c.A1 = { formula: `=$C$${at.case}&" case: Clearcoat Express forecast, ${ex.year}"`, bold: true, fsz: c.A1.fsz };
  each(c, ['C' + at.case, 'C' + at.beSite], blue);
  // the one-way table's title says which case it ran on; the corner of the two-way table reads EBITDA like the one-way's
  c['B' + (at.tkVals - 1)] = { formula: `="EBITDA by ticket, "&$C$${at.case}&" case"`, bold: true };
  c['C' + at.twVals] = { formula: `=C${at.ebitda}`, ...formatOf('money', { dollar: true, dash: true }) };
  // the base case in the two-way grid ($14, 50%) is marked bold
  page.sheet.colW[2] = 190;
  page.sheet.condFmt = [
    { id: 'cfCase', range: `C4:E${at.sites}`, kind: 'formula', formula: `=C$4=$C$${at.case}`, style: 'green' },
    { id: 'cfDown', range: `D${at.tw0}:H${at.tw4}`, kind: 'formula', formula: `=D${at.tw0}<$C$${at.ebitda}`, style: 'lightred' },
  ];
  tablesOn(page.sheet, scenariosMap(at), { ticket: 'C' + at.driver, share: 'G' + at.share, sw: 'C' + at.switch });
  return page;
}
/** The sensitivity edges: the tickets across and the member shares down (4.5.2, 4.5.3). */
export const TICKETS = [12, 13, 14, 15, 16];
export const SHARES = [0.4, 0.45, 0.5, 0.55, 0.6];
/** The Data Tables on Scenarios as the engine keeps them (sheet.dataTables): the result block is everything right of and below the edges. */
export function tableRecords(C, { ticket, share, sw }) {
  const out = {};
  if (ticket) out.oneWay = { r1: C.oneWay.vals, c1: 3, r2: C.oneWay.ebitda, c2: 8, row: ticket, col: null };
  if (ticket && share) out.twoWay = { r1: C.twoWay.vals, c1: 3, r2: C.twoWay.rows[4], c2: 8, row: ticket, col: share };
  if (sw) out.cases = { r1: C.cases.num, c1: 3, r2: C.cases.ebitda, c2: 6, row: sw, col: null };
  return out;
}
/**
 * Write Data Tables onto a Scenarios sheet record: the record in sheet.dataTables and every result
 * cell as the engine leaves it ({=TABLE(row,col)}, its format, its value). The values come from the
 * one-line model on the live case (Base); the engine recomputes them on the first change, and the
 * chain test compares the tables by their records, not by these figures.
 * `on`: which tables and their input cells, e.g. { ticket: 'C13', share: 'G7', sw: 'C11' }.
 */
export function tablesOn(sheet, C, on, live = caseOf(1)) {
  const cells = sheet.cells; const recs = tableRecords(C, on);
  const put = (r, c, v, fmt, t) => { const k = refKey(r, c); cells[k] = { ...fmt, value: v, table: '{=TABLE(' + (t.row || '') + ',' + (t.col || '') + ')}' }; };
  const money = (dollar, extra) => ({ ...formatOf('money', { dollar, dash: true }), ...(extra || {}) });
  if (recs.oneWay) TICKETS.forEach((t, j) => put(C.oneWay.ebitda, 4 + j, model({ ...live, ticket: t }).ebitda, money(true), recs.oneWay));
  if (recs.twoWay) SHARES.forEach((sh, i) => TICKETS.forEach((t, j) => put(C.twoWay.rows[i], 4 + j, model({ ...live, ticket: t, share: sh }).ebitda, { ...money(i === 0), ...(i === 2 && j === 2 ? { bold: true } : {}) }, recs.twoWay)));
  if (recs.cases) [0, 1, 2].forEach(k => { const m = model(caseOf(k)); [['washes', m.washesYr, formatOf('count', { dash: true })], ['revenue', m.revenue, money(true)], ['contrib', m.contrib, money(false)], ['ebitda', m.ebitda, money(true, { bold: true, bt: true, bdbl: true })]].forEach(([key, v, fmt]) => put(C.cases[key], 4 + k, v, fmt, recs.cases)); });
  sheet.dataTables = Object.values(recs).map(t => ({ ...t }));
  return sheet;
}
/** Take every Data Table and its result cells off a Scenarios sheet record (a start state before the lesson builds them). */
export function tablesOff(sheet) {
  for (const t of sheet.dataTables || []) for (let r = t.r1 + 1; r <= t.r2; r++) for (let c = t.c1 + 1; c <= t.c2; c++) delete sheet.cells[refKey(r, c)];
  delete sheet.dataTables;
  return sheet;
}
/** Where things sit on Scenarios, read from the built page. */
function scenariosMap(at) {
  return { header: 4, inputs: { washes: at.washes, ticket: at.ticket, share: at.share, sites: at.sites }, picker: at.case, switch: at.switch, driver: at.driver, ticketModel: at.ticketModel,
    outputs: { title: at.washesYr - 1, washesYr: at.washesYr, revenue: at.revenue, cow: at.cow, retail: at.retail, siteCosts: at.siteCosts, contrib: at.contrib, ho: at.ho, ebitda: at.ebitda, margin: at.margin },
    oneWay: { title: at.tkVals - 1, vals: at.tkVals, ebitda: at.tkEbitda }, twoWay: { title: at.twVals - 1, vals: at.twVals, rows: [0, 1, 2, 3, 4].map(i => at['tw' + i]) },
    breakEven: { title: at.beSite - 1, site: at.beSite, costs: at.beCosts, cpw: at.beCpw, washes: at.beWashes, daily: at.beDaily, hand: at.beHand, goalSeek: at.beGoalSeek },
    cases: { title: at.coName - 1, num: at.coNum, name: at.coName, washes: at.coWashes, revenue: at.coRevenue, contrib: at.coContrib, ebitda: at.coEbitda },
    source: at.coEbitda + 1, checks: at.coEbitda + 3, checkRows: [1, 2, 3].map(i => at.coEbitda + 3 + i) };
}
/**
 * The one-line model in JavaScript (what Goal Seek finds and what the tests compare the sheet to):
 * EBITDA for a case at a ticket and a member share.
 */
export function model({ washes, ticket, share, sites }, inp = INPUTS) {
  const washesYr = sites * washes * inp.days;
  const revenue = washesYr * ticket;
  const cow = -washesYr * inp.cost, retail = -washesYr * (1 - share) * inp.retail, siteCosts = -sites * inp.days * inp.siteCosts;
  const contrib = revenue + cow + retail + siteCosts;
  return { washesYr, revenue, cow, retail, siteCosts, contrib, ho: -inp.headOffice, ebitda: contrib - inp.headOffice };
}
export const caseOf = i => ({ washes: CASE_INPUTS.washes[i], ticket: INPUTS.ticket, share: CASE_INPUTS.share[i], sites: CASE_INPUTS.sites[i] });
/** Domain's break-even: daily site costs over the contribution per wash (the Base case's share), and what Goal Seek writes (a whole wash). */
export const BREAK_EVEN = (() => { const cpw = INPUTS.ticket - INPUTS.cost - (1 - CASE_INPUTS.share[1]) * INPUTS.retail; const hand = SITES[0].costs / cpw; return { cpw, hand, goalSeek: Math.round(hand) }; })();

/** The dashboard: utilization and member share by site, and the washes cube, as tables with conditional formatting (no charts). */
function dashboardPage(weeks, sites, ex) {
  const n = sites.length;
  const page = buildPage({
    name: 'Dashboard', chapter: CHAPTER, title: `Clearcoat Express: utilization dashboard, ${ex.label}`, units: UNITS, labelHeader: 'Site', center: true,
    headers: ['Utilization', 'Peak utilization', 'Member share', 'Washes a day', 'Peak day washes'], kinds: ['pct', 'pct', 'pct', 'count', 'count'],
    blocks: [
      { rows: [
        ...sites.map((s, i) => ({ key: 'db-' + s.code, label: s.name, fill: (c, r) => ({ C: `=Summary!I${5 + i}`, D: `=Summary!K${5 + i}`, E: `=Summary!M${5 + i}`, F: `=Summary!H${5 + i}/Summary!G${5 + i}`, G: `=Summary!J${5 + i}` })[c] })),
        { key: 'db-total', label: 'Total', total: true, fill: (c, r) => ({ C: '=Summary!I11', E: '=Summary!M11', F: `=SUM(F5:F${4 + n})`, G: '=Summary!J11' })[c] || null },
      ] },
      { title: 'Washes by site and week', header: [...weeks.map(w => w.key), 'Total'], kinds: ['count', 'count', 'count', 'count'],
        rows: [
          ...sites.map((s, i) => ({ key: 'dw-' + s.code, label: s.name, fill: (c, r) => 'CDEF'.includes(c) ? `=Summary!${c}${15 + i}` : null })),
          { key: 'dw-total', label: 'Total', total: true, final: true, fill: (c, r) => 'CDEF'.includes(c) ? `=SUM(${c}${r - n}:${c}${r - 1})` : null },
        ] },
    ],
    source: 'Source: Summary, which reads the POS export on Export',
    checks: [{ label: 'Washes tie to Summary', formula: (c, r, at) => `=F${at('dw-total')}-Summary!F21` }],
  });
  const c = page.sheet.cells;
  sites.forEach((s, i) => { c['B' + (5 + i)] = { formula: `=Summary!C${5 + i}`, fontColor: 'green' }; c['B' + page.at['dw-' + s.code]] = { formula: `=$B${5 + i}` }; });
  page.sheet.condFmt = [
    { id: 'cfUtil', range: `C5:C${4 + n}`, kind: 'colorScale', scale: 'red-yellow-green' },
    { id: 'cfShare', range: `E5:E${4 + n}`, kind: 'cellValue', op: '<', v1: 0.5, style: 'lightred' },
    { id: 'cfWashes', range: `C${page.at['dw-' + sites[0].code]}:E${page.at['dw-' + sites[n - 1].code]}`, kind: 'dataBar', color: 'blue' },
  ];
  return page;
}

/** The buyers' question log: twelve questions, ten answered by a reference to a cell that reads the data. */
export const questions = (S, C) => [
  ['Sponsor A', 'What is the Deluxe retail price?', 'Finance', 'Answered', '=VLOOKUP("D",Lists!$B$14:$E$16,3,FALSE)', 'unit'],
  ['Sponsor A', "What is Domain's utilization over the export?", 'Finance', 'Answered', `=Summary!I${S.siteRows[0]}`, 'pct'],
  ['Sponsor A', 'What share of washes come from members, across the cluster?', 'Finance', 'Answered', `=Summary!M${S.totalRow}`, 'pct'],
  ['Sponsor B', 'How many washes did South Lamar do on the first Saturday of the export?', 'Finance', 'Answered', `=Summary!C${S.multi.im}`, 'count'],
  ['Sponsor B', 'How many washes did the six sites do over the export?', 'Finance', 'Answered', `=Summary!F${S.cubeTotal}`, 'count'],
  ['Sponsor B', 'What was the busiest single site-day, in washes?', 'Finance', 'Answered', `=Summary!J${S.totalRow}`, 'count'],
  ['Sponsor C', 'What was revenue per site per open hour in the last week, and which site led?', 'Finance', 'Answered', `=Summary!C${S.perHour.leader}&" at "&TEXT(Summary!D${S.perHour.leader},"$#,##0.00")&" an hour"`, 'text'],
  ['Sponsor C', 'What was retail revenue in the last seven days?', 'Finance', 'Answered', `=Summary!C${S.window.revenue}`, 'money'],
  ['Sponsor A', 'What is EBITDA in the downside case?', 'Finance', 'Answered', `=Scenarios!F${C.cases.ebitda}`, 'money'],
  ['Sponsor C', 'How many washes a day does a site need to break even?', 'Finance', 'Answered', `=Scenarios!C${C.breakEven.goalSeek}`, 'count'],
  ['Sponsor B', 'What is member churn by site?', 'Ops', 'Open', null, 'text'],
  ['Sponsor C', 'What is the rent per site under the current leases?', 'Ops', 'Open', null, 'text'],
];
function qaPage(S, C) {
  const QUESTIONS = questions(S, C);
  const page = buildPage({
    name: 'Q&A', chapter: CHAPTER, title: 'Clearcoat Express: buyer question log, Project Rinse', units: UNITS, labelHeader: 'Buyer',
    headers: ['Question', 'Owner', 'Status', 'Answer'], kinds: ['text', 'text', 'text', 'money'],
    blocks: [{ rows: QUESTIONS.map(([buyer, q, owner, status, answer, kind], i) => ({ key: 'q' + (i + 1), label: buyer, kind, dollar: kind !== 'count', values: [q, owner, status, answer] })) }],
    source: 'Source: the data room question log; every answer reads a cell on Summary, Scenarios or Lists',
    checks: [{ label: 'Every answered question has an answer', formula: '=COUNTIF(E5:E16,"Answered")-COUNTA(F5:F16)' }],
  });
  const c = page.sheet.cells;
  QUESTIONS.forEach((_, i) => { c['A' + (5 + i)] = { value: i + 1, align: 'r' }; });
  page.sheet.colW[1] = 28; page.sheet.colW[3] = 440; page.sheet.colW[6] = 150;
  return page;
}
/** The question whose answer each lesson writes (Q&A row = 4 + number). */
export const QA = { row: n => 4 + n, answerCol: 'F', statusCol: 'E', count: 12, answered: 10 };

/* ---------------- the solved workbook ---------------- */

/**
 * The finished diligence pack on one fortnight's export: Q&A, Summary, Scenarios, Dashboard at the
 * front (outputs left), Lists, Inputs and Export behind them, the six site tabs last.
 */
export function buildSolved({ ex = EXPORT, sites = SITES } = {}) {
  const rows = exportRows(ex, sites);
  const weeks = weeksOf(rows);
  const summary = summaryPage(weeks, sites, ex), scenarios = scenariosPage(ex);
  const S = summaryMap(summary.at), C = scenariosMap(scenarios.at);
  const pages = { qa: qaPage(S, C), summary, scenarios, dashboard: dashboardPage(weeks, sites, ex), lists: listsPage(weeks, sites), inputs: inputsPage(ex) };
  const exportSh = exportSheet(rows, ex.label);
  Object.assign(exportSh.cells, EXPORT_WORK.key, EXPORT_WORK.totals);
  const tabs = sites.map(s => siteTab(s, rows, weeks, ex.label).sheet);
  applyValidation({ sheets: [pages.summary.sheet, pages.scenarios.sheet] }, S, C, true);
  const state = {
    sheets: [pages.qa.sheet, pages.summary.sheet, pages.scenarios.sheet, pages.dashboard.sheet, pages.lists.sheet, pages.inputs.sheet, exportSh, ...tabs],
    names: { ...NAMES },
    settings: { calcMode: 'automatic', iterative: false, qat: ['save', 'undo', 'redo', 'fontColor', 'fillColor', 'borders', 'decDecimal'], pageSetup: clone(SUMMARY_PAGE_SETUP) },
  };
  return { state, rows, weeks, ex, sites, S, C };
}
/**
 * The pack's Data Validation (4.2.4, re-pointed at names in 4.6.3): the case picker on Scenarios lists
 * the cases, the site picker on Summary (4.1.4's two-way lookup) lists the unique sites, and the
 * washes-a-day inputs take a whole number from 100 to 600. `named` reads =Cases and =Sites.
 */
export function validationRules(S, C, named) {
  const rule = (o) => ({ allow: 'any', data: 'between', min: '', max: '', source: '', inCell: true, ignoreBlank: true, errStyle: 'stop', errTitle: '', errMsg: '', inTitle: '', inMsg: '', ...o });
  return {
    Scenarios: { ['C' + C.picker]: rule({ allow: 'list', source: named ? '=Cases' : '=Lists!$L$5:$L$7' }), ...Object.fromEntries(['C', 'D', 'E'].map(c => [c + C.inputs.washes, rule({ allow: 'whole', min: '100', max: '600' })])) },
    Summary: { ['C' + S.twoWay.site]: rule({ allow: 'list', source: named ? '=Sites' : '=Lists!$N$5:$N$10' }) },
  };
}
function applyValidation(state, S, C, named) {
  const rules = validationRules(S, C, named);
  for (const sh of state.sheets) if (rules[sh.name]) sh.validation = clone(rules[sh.name]);
}
/** Summary's print set-up after 4.3.4: landscape, one page, the heads repeated, file and date in the footer. */
export const SUMMARY_PAGE_SETUP = { orientation: 'landscape', scaling: 'fit', adjustTo: 100, fitWide: 1, fitTall: 1, titlesRows: '$1:$4', footer: { left: '&[File]', centre: '', right: '&[Date]' }, printGridlines: false };

const SOLVED_BUILD = buildSolved();
export const SOLVED = SOLVED_BUILD.state;
export const ROWS = SOLVED_BUILD.rows;
export const WEEKS = SOLVED_BUILD.weeks;
/** Where things sit on Summary and Scenarios (the rows the lessons name). */
export const SUMMARY = SOLVED_BUILD.S;
export const SCENARIOS = SOLVED_BUILD.C;
export const QUESTIONS = questions(SUMMARY, SCENARIOS);

/* ---------------- state helpers ---------------- */

function derive(base, fn) { const next = clone(base); fn(next); return next; }
const sheetOf = (state, name) => state.sheets.find(s => s.name === name);
/** Copy the solved cells `refs` of `sheet` into a state (a lesson's end state takes what the lesson builds). */
const take = (state, solved, sheet, refs) => { const src = sheetOf(solved, sheet).cells, dst = sheetOf(state, sheet).cells; for (const ref of refs) { if (src[ref]) dst[ref] = clone(src[ref]); else delete dst[ref]; } };
/** Clear cells of a state's sheet (a start state empties what the lesson will write). */
const drop = (state, sheet, refs) => { const dst = sheetOf(state, sheet).cells; for (const ref of refs) delete dst[ref]; };
/** Write cells into a state's sheet (a planting or a scaffold). */
const plant = (state, sheet, cells) => { const dst = sheetOf(state, sheet).cells; for (const ref in cells) { if (cells[ref] === null) delete dst[ref]; else dst[ref] = clone(cells[ref]); } };
const rowRefs = (r, cols) => cols.map(c => c + r);
const blockRefs = (rows, cols) => rows.flatMap(r => rowRefs(r, cols));
const COLS = s => s.split('');

/* ---------------- the chapter's start ---------------- */

/**
 * S0: the pack as the data room opened it. The export with its two plantings and the week and day
 * keys (no site-day key yet); Lists without the unique list; the question log with every question
 * open and question 1 answered by a typed 15; Summary with its title, the site codes and the washes
 * cube pasted as values (4.1.4 reads it before 4.3.1 builds it live); Scenarios with the three
 * input columns typed and the picker, no switch, no outputs; Dashboard empty but for its skeleton;
 * Inputs without the ticket and the names list; the six site tabs without their check rows; no names.
 */
export function cutStart({ state: solved, rows, weeks, ex, sites, S, C }) {
  return derive(solved, s => {
    // Export: the misspelling, no key column, no working cells
    const xs = sheetOf(s, 'Export');
    xs.cells['B' + exportRow(PLANT.misspelt.day, PLANT.misspelt.site)] = { value: PLANT.misspelt.code };
    for (const ref in EXPORT_WORK.key) delete xs.cells[ref];
    for (const ref in EXPORT_WORK.totals) delete xs.cells[ref];
    // Lists: no unique list, no check
    drop(s, 'Lists', [...LISTS_UNIQUE, 'B25', 'B26', 'C26']);
    // Q&A: every question open; question 1's answer typed
    const qa = sheetOf(s, 'Q&A').cells;
    QUESTIONS.forEach((q, i) => { const r = 5 + i; delete qa['F' + r]; if (q[3] === 'Answered') qa['E' + r] = { value: 'Open' }; });
    qa.F5 = { value: 15, fontColor: 'blue', fmtStyle: 'currency', decimals: 2 };
    // Summary: title and codes, the washes cube pasted as values, nothing else
    const sm = sheetOf(s, 'Summary');
    const keep = new Set(['A1', 'A2', 'B4', 'C4', 'D4', ...sites.map((_, i) => 'B' + (5 + i)), 'B' + S.cubeTitle, ...rowRefs(S.cubeHeader, COLS('BCDEF')), ...blockRefs([...S.cubeRows, S.cubeTotal], COLS('BCDEF'))]);
    for (const ref in sm.cells) if (!keep.has(ref)) delete sm.cells[ref];
    sm.cells.A1 = { value: `Clearcoat Express: KPI page, ${ex.label}`, bold: true, fsz: sm.cells.A1.fsz };
    sites.forEach((site, i) => { sm.cells['B' + (5 + i)] = { value: site.code }; });
    const cubeVal = ref => { const w = rows.filter(r => r.code === sites[S.cubeRows.indexOf(+ref.slice(1))].code && (ref[0] === 'F' || r.week === weeks['CDE'.indexOf(ref[0])].key)); return w.reduce((t, r) => t + (r.retail || 0) + (r.member || 0), 0); };
    for (const r of S.cubeRows) { sm.cells['B' + r] = { value: sites[S.cubeRows.indexOf(r)].code }; for (const c of COLS('CDEF')) sm.cells[c + r] = { value: cubeVal(c + r), fontColor: 'blue', fmtStyle: 'custom', numFmt: FMT.countDash }; }
    for (const c of COLS('CDEF')) { sm.cells[c + S.cubeTotal] = { ...sm.cells[c + S.cubeTotal], value: S.cubeRows.reduce((t, r) => t + sm.cells[c + r].value, 0), fontColor: 'blue' }; delete sm.cells[c + S.cubeTotal].formula; }
    // Scenarios: the inputs typed (the ticket too), the picker; nothing below
    const sc = sheetOf(s, 'Scenarios');
    const keepSc = new Set(['A1', 'A2', ...rowRefs(C.header, COLS('BCDE')), ...blockRefs([C.inputs.washes, C.inputs.ticket, C.inputs.share, C.inputs.sites], COLS('BCDE')), 'B' + C.picker, 'C' + C.picker]);
    for (const ref in sc.cells) if (!keepSc.has(ref)) delete sc.cells[ref];
    sc.cells.A1 = { value: `Clearcoat Express forecast, ${ex.year}`, bold: true, fsz: sc.cells.A1.fsz };
    COLS('CDE').forEach((c, i) => { sc.cells[c + C.inputs.ticket] = { value: CASE_INPUTS.ticket[i], fontColor: 'blue', fmtStyle: 'custom', numFmt: FMT.unitDollar }; });
    delete sc.condFmt;
    // Dashboard: the skeleton only
    const db = sheetOf(s, 'Dashboard');
    for (const ref in db.cells) if (!['A1', 'A2', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4'].includes(ref)) delete db.cells[ref];
    delete db.condFmt;
    // Inputs: no ticket, no names list
    const inp = sheetOf(s, 'Inputs');
    for (const ref in inp.cells) if (+ref.slice(1) >= 15) delete inp.cells[ref];
    // the site tabs: no check rows
    for (const site of sites) { const t = sheetOf(s, site.tab); for (const ref in t.cells) if (+ref.slice(1) >= 12) delete t.cells[ref]; }
    delete s.names;
    delete s.settings.pageSetup;
    for (const sh of s.sheets) delete sh.validation;   // the pickers are typed cells until 4.2.4
  });
}
const S0 = cutStart(SOLVED_BUILD);

/* ---------------- module 4.1: lookups ---------------- */

// 4.1.1 Why lookups: the Deluxe price read from the package list (the typed 15 replaced by the lookup)
const S411 = derive(S0, s => { take(s, SOLVED, 'Q&A', ['F5']); });

/** The lookup scaffolds module 4.1 writes on Summary beside the site block, cleared when module 4.2 starts (S42). */
const SITE_R = SUMMARY.siteRows;
const SCAFFOLD_412 = Object.fromEntries([
  ...SITE_R.flatMap(r => [['C' + r, { formula: `=VLOOKUP(B${r},Lists!$B$5:$H$10,2,FALSE)`, fontColor: 'green' }], ['D' + r, { formula: `=VLOOKUP(B${r},Lists!$B$5:$H$10,5,FALSE)`, fontColor: 'green', fmtStyle: 'custom', numFmt: FMT.countDash }]]),
  ['H13', { value: 'Week', bold: true }], ['I13', { value: 'Domain washes', bold: true, align: 'r' }],
  ['H14', { value: WEEKS[1].key, fontColor: 'blue' }], ['I14', { formula: '=HLOOKUP(H14,$C$14:$E$20,2,FALSE)', fmtStyle: 'custom', numFmt: FMT.countDash }],
]);
// 4.1.2 VLOOKUP and HLOOKUP: site name (column 2) and capacity (column 5) by VLOOKUP; a week's washes by HLOOKUP off the cube's header
const S412 = derive(S411, s => { plant(s, 'Summary', SCAFFOLD_412); });

const SCAFFOLD_413 = Object.fromEntries([
  ['E4', { value: 'Row (MATCH)', bold: true, align: 'r' }], ['F4', { value: 'Site (INDEX)', bold: true, align: 'r' }], ['G4', { value: 'Capacity (INDEX/MATCH)', bold: true, align: 'r' }], ['H4', { value: 'Code from name', bold: true, align: 'r' }],
  ...SITE_R.flatMap(r => [
    ['E' + r, { formula: `=MATCH(B${r},Lists!$B$5:$B$10,0)`, fontColor: 'green' }],
    ['F' + r, { formula: `=INDEX(Lists!$C$5:$C$10,E${r})`, fontColor: 'green' }],
    ['G' + r, { formula: `=INDEX(Lists!$F$5:$F$10,MATCH(B${r},Lists!$B$5:$B$10,0))`, fontColor: 'green', fmtStyle: 'custom', numFmt: FMT.countDash }],
    ['H' + r, { formula: `=INDEX(Lists!$B$5:$B$10,MATCH(C${r},Lists!$C$5:$C$10,0))`, fontColor: 'green' }],
  ]),
]);
// 4.1.3 MATCH, then INDEX/MATCH: the row number, the name from it, capacity with no column counting, the code looked up by name
const S413 = derive(S412, s => { plant(s, 'Summary', SCAFFOLD_413); });

// 4.1.4 Two-way INDEX/MATCH: the "Any site, any week" block under the cube (inputs, the two positions, the answer)
const TW = SUMMARY.twoWay;
const S414 = derive(S413, s => { take(s, SOLVED, 'Summary', ['B' + TW.title, ...blockRefs([TW.site, TW.week, TW.row, TW.col, TW.answer], COLS('BC'))]); });

const SCAFFOLD_415 = Object.fromEntries([
  ['J4', { value: 'Capacity (XLOOKUP)', bold: true, align: 'r' }],
  ...SITE_R.map(r => ['J' + r, { formula: `=XLOOKUP(B${r},Lists!$B$5:$B$10,Lists!$F$5:$F$10)`, fontColor: 'green', fmtStyle: 'custom', numFmt: FMT.countDash }]),
  ['I15', { value: 'Not listed code', bold: true }], ['J15', { formula: '=XLOOKUP("AUS-XXX",Lists!$B$5:$B$10,Lists!$F$5:$F$10,"Not listed")', fontColor: 'green' }],
  ['I16', { value: 'Code from name', bold: true }], ['J16', { formula: '=XLOOKUP("Airport",Lists!$C$5:$C$10,Lists!$B$5:$B$10)', fontColor: 'green' }],
]);
// 4.1.5 XLOOKUP: capacity, a not-found message, right to left
const S415 = derive(S414, s => { plant(s, 'Summary', SCAFFOLD_415); });

const SCAFFOLD_416 = Object.fromEntries([
  ['K4', { value: 'Bonus (VLOOKUP TRUE)', bold: true, align: 'r' }], ['L4', { value: 'Bonus (INDEX/MATCH 1)', bold: true, align: 'r' }], ['M4', { value: 'Bonus (IFS)', bold: true, align: 'r' }],
  ...SITE_R.flatMap((r, i) => [
    ['K' + r, { formula: `=VLOOKUP($F${SUMMARY.cubeRows[i]}/15,Lists!$J$5:$K$8,2,TRUE)`, fontColor: 'green', fmtStyle: 'custom', numFmt: FMT.moneyDash }],
    ['L' + r, { formula: `=INDEX(Lists!$K$5:$K$8,MATCH($F${SUMMARY.cubeRows[i]}/15,Lists!$J$5:$J$8,1))`, fontColor: 'green', fmtStyle: 'custom', numFmt: FMT.moneyDash }],
    ['M' + r, { formula: `=IFS($F${SUMMARY.cubeRows[i]}/15>=350,150,$F${SUMMARY.cubeRows[i]}/15>=300,100,$F${SUMMARY.cubeRows[i]}/15>=250,50,TRUE,0)`, fmtStyle: 'custom', numFmt: FMT.moneyDash }],
  ]),
  ['I17', { value: 'Not listed, wrapped', bold: true }], ['J17', { formula: '=IFERROR(XLOOKUP("AUS-XXX",Lists!$B$5:$B$10,Lists!$F$5:$F$10),"Not listed")', fontColor: 'green' }],
]);
// 4.1.6 Approximate match for bands: the bonus by VLOOKUP TRUE and by INDEX/MATCH 1 against the IFS ladder; IFERROR around a lookup that misses
const S416 = derive(S415, s => { plant(s, 'Summary', SCAFFOLD_416); });

// 4.1.7 Multi-criteria lookups: the key column on Export, the "Washes for a site on a day" block (the key column route and SUMIFS as a lookup)
const MD = SUMMARY.multi;
const S417 = derive(S416, s => {
  plant(s, 'Export', EXPORT_WORK.key);
  take(s, SOLVED, 'Summary', ['B' + MD.title, ...blockRefs([MD.site, MD.date, MD.key, MD.im, MD.sumifs], COLS('BC'))]);
});

/** What 4.1.8 reads and rewrites: OFFSET and INDIRECT reaching capacity the long way (the learner writes them; the end state holds the rewrite). */
export const SCAFFOLD_418 = Object.fromEntries([
  ['N4', { value: 'Capacity (OFFSET)', bold: true, align: 'r' }], ['O4', { value: 'Capacity (INDIRECT)', bold: true, align: 'r' }],
  ...SITE_R.flatMap(r => [
    ['N' + r, { formula: `=OFFSET(Lists!$B$4,MATCH(B${r},Lists!$B$5:$B$10,0),4)`, fontColor: 'green', fmtStyle: 'custom', numFmt: FMT.countDash }],
    ['O' + r, { formula: `=INDIRECT("Lists!F"&(4+MATCH(B${r},Lists!$B$5:$B$10,0)))`, fontColor: 'green', fmtStyle: 'custom', numFmt: FMT.countDash }],
  ]),
]);
const S418_END = Object.fromEntries([
  ['N4', { value: 'Capacity (INDEX/MATCH)', bold: true, align: 'r' }], ['O4', null],
  ...SITE_R.flatMap(r => [['N' + r, { formula: `=INDEX(Lists!$F$5:$F$10,MATCH(B${r},Lists!$B$5:$B$10,0))`, fontColor: 'green', fmtStyle: 'custom', numFmt: FMT.countDash }], ['O' + r, null]]),
  ['I18', { value: 'Second week, all sites', bold: true }], ['J18', { formula: '=SUM(INDEX($C$15:$E$20,0,2))', fmtStyle: 'custom', numFmt: FMT.countDash }],
]);
// 4.1.8 OFFSET and INDIRECT: both written, traced, broken by an inserted row, rewritten as INDEX/MATCH and deleted; INDEX(range,0,n) sums one week
const S418 = derive(S417, s => { plant(s, 'Summary', S418_END); });

/** 4.1.C: the site block's five lookups broken (no FALSE, a counted column that moved, the wrong key column, OFFSET, a silent IFERROR), and the same five rebuilt. */
export const CHALLENGE_41 = {
  headers: { C4: 'Site', D4: 'Capacity (cars an hour)', E4: 'Hours open', F4: 'Daily site costs ($)', G4: 'Opened' },
  broken: r => ({
    C: { formula: `=VLOOKUP(B${r},Lists!$B$5:$H$10,2)`, fontColor: 'green' },
    D: { formula: `=VLOOKUP(B${r},Lists!$B$5:$H$10,4,FALSE)`, fontColor: 'green', fmtStyle: 'custom', numFmt: FMT.countDash },
    E: { formula: `=VLOOKUP(C${r},Lists!$B$5:$H$10,6,FALSE)`, fontColor: 'green', fmtStyle: 'custom', numFmt: FMT.countDash },
    F: { formula: `=OFFSET(Lists!$B$4,MATCH(B${r},Lists!$B$5:$B$10,0),6)`, fontColor: 'green', fmtStyle: 'custom', numFmt: FMT.moneyDash },
    G: { formula: `=IFERROR(XLOOKUP(B${r},Lists!$C$5:$C$10,Lists!$E$5:$E$10),"")`, fontColor: 'green', ...DATE_FMT },
  }),
  fixed: r => ({
    C: { formula: `=INDEX(Lists!$C$5:$C$10,MATCH(B${r},Lists!$B$5:$B$10,0))`, fontColor: 'green' },
    D: { formula: `=INDEX(Lists!$F$5:$F$10,MATCH(B${r},Lists!$B$5:$B$10,0))`, fontColor: 'green', fmtStyle: 'custom', numFmt: FMT.countDash },
    E: { formula: `=INDEX(Lists!$G$5:$G$10,MATCH(B${r},Lists!$B$5:$B$10,0))`, fontColor: 'green', fmtStyle: 'custom', numFmt: FMT.countDash },
    F: { formula: `=INDEX(Lists!$H$5:$H$10,MATCH(B${r},Lists!$B$5:$B$10,0))`, fontColor: 'green', fmtStyle: 'custom', numFmt: FMT.moneyDash },
    G: { formula: `=IFERROR(XLOOKUP(B${r},Lists!$B$5:$B$10,Lists!$E$5:$E$10),"Not listed")`, fontColor: 'green', ...DATE_FMT },
  }),
};
/** Module 4.1's scaffold cells on Summary: everything right of column D in rows 4 to 18, cleared when module 4.2 starts. */
const SCAFFOLD_41_REFS = [...blockRefs([4, ...SITE_R], COLS('EFGHIJKLMNO')), ...blockRefs([13, 14, 15, 16, 17, 18], COLS('HIJ'))];
function challenge41(base, which) {
  return derive(base, s => {
    drop(s, 'Summary', SCAFFOLD_41_REFS);
    const c = sheetOf(s, 'Summary').cells;
    for (const ref in CHALLENGE_41.headers) c[ref] = { value: CHALLENGE_41.headers[ref], bold: true, align: 'r' };
    for (const r of SITE_R) { const cells = CHALLENGE_41[which](r); for (const k in cells) c[k + r] = cells[k]; }
  });
}
const S41C = challenge41(S418, 'broken');
const S41Cdone = challenge41(S418, 'fixed');

/* ---------------- module 4.2: lists and tables ---------------- */

// S42: the module's start: module 4.1's scaffolds cleared, the site block on the standard route (name and capacity by INDEX/MATCH)
const S42 = derive(S418, s => { drop(s, 'Summary', SCAFFOLD_41_REFS); take(s, SOLVED, 'Summary', blockRefs(SITE_R, COLS('CD'))); });

/** The sorted copy of the export (4.2.1): A4:G94 pasted as values on a new sheet, then sorted. `by` is a comparator over the rows. */
export function exportCopy(rows, by) {
  const cells = { A4: { value: 'Date', bold: true }, B4: { value: 'Site', bold: true }, C4: { value: 'Retail washes', bold: true }, D4: { value: 'Member washes', bold: true }, E4: { value: 'Total washes', bold: true }, F4: { value: 'Retail revenue ($)', bold: true }, G4: { value: 'Hours open', bold: true } };
  const sorted = rows.map((r, i) => ({ ...r, i })).sort(by || ((a, b) => a.i - b.i));
  sorted.forEach((x, k) => {
    const r = 5 + k;
    cells['A' + r] = { value: x.date, ...DATE_FMT }; cells['B' + r] = { value: x.code };
    if (x.retail != null) { cells['C' + r] = { value: x.retail }; cells['D' + r] = { value: x.member }; cells['E' + r] = { value: x.retail + x.member }; cells['F' + r] = { value: x.revenue, fmtStyle: 'comma', decimals: 2 }; cells['G' + r] = { value: x.hours }; }
  });
  return { name: 'Export sort', cells, colW: { 1: 72, 2: 72, 3: 92, 4: 100, 5: 92, 6: 118, 7: 80 }, active: { r: 4, c: 1 } };
}
export const BY_SITE_DATE = (a, b) => a.code.localeCompare(b.code) || a.date - b.date || a.i - b.i;
export const BY_REVENUE_DESC = (a, b) => ((b.revenue || 0) - (a.revenue || 0)) || a.i - b.i;
/** The misspelt row's data on the copy still carries the misspelling (the copy was taken before 4.2.3 fixed it). */
const rowsAsExported = rows => rows.map((r, i) => i === exportRow(PLANT.misspelt.day, PLANT.misspelt.site) - 5 ? { ...r, code: PLANT.misspelt.code } : r);
// 4.2.1 Sort and multi-level sort: the copy, sorted by site then date, then by retail revenue largest first (how the lesson leaves it)
const S421 = derive(S42, s => { s.sheets.splice(7, 0, exportCopy(rowsAsExported(ROWS), BY_REVENUE_DESC)); });

// 4.2.2 AutoFilter and SUBTOTAL: the filters cleared; a SUM under the block, SUBTOTAL(109) and SUBTOTAL(103) beside it
const S422 = derive(S421, s => { plant(s, 'Export', EXPORT_WORK.totals); });

// 4.2.3 Remove Duplicates: the misspelling fixed on Export, the unique list with its COUNTIF proof on Lists, the check under the lists
const S423 = derive(S422, s => {
  sheetOf(s, 'Export').cells['B' + exportRow(PLANT.misspelt.day, PLANT.misspelt.site)] = { value: SITES[PLANT.misspelt.site].code };
  take(s, SOLVED, 'Lists', [...LISTS_UNIQUE, 'B25', 'B26', 'C26']);
});

// 4.2.4 Data Validation: the case picker and the site picker are lists on Lists, the washes inputs a whole number from 100 to 600; the picker is left on Downside
const S424 = derive(S423, s => { applyValidation(s, SUMMARY, SCENARIOS, false); sheetOf(s, 'Scenarios').cells['C' + SCENARIOS.picker] = { value: 'Downside', fontColor: 'blue' }; });

/** 4.2.5's plantings on the sorted copy: a column of hours corrections with gaps (four filled), pasted over G with Skip Blanks. */
export const CORRECTIONS = { col: 'I', header: 'Hours (corrected)', rows: { 9: 12, 23: 13, 48: 12, 77: 13 } };
const S425start = derive(S424, s => {
  const c = sheetOf(s, 'Export sort').cells;
  c[CORRECTIONS.col + '4'] = { value: CORRECTIONS.header, bold: true };
  for (const r in CORRECTIONS.rows) c[CORRECTIONS.col + r] = { value: CORRECTIONS.rows[r], fontColor: 'blue' };
});
// 4.2.5 Filter tricks: the visible-cells paste on a Scratch sheet (75 rows of the copy, rows 20:34 left out), the wildcards beside the export, the corrections landed
const S425 = derive(S425start, s => {
  const copy = sheetOf(s, 'Export sort').cells;
  const scratch = {};
  let k = 1;
  for (let r = 4; r <= 94; r++) { if (r >= 20 && r <= 34) continue; for (const col of COLS('ABCDEFG')) if (copy[col + r]) scratch[col + k] = clone(copy[col + r]); k++; }
  s.sheets.splice(8, 0, { name: 'Scratch', cells: scratch, colW: { 1: 72, 2: 72, 3: 92, 4: 100, 5: 92, 6: 118, 7: 80 } });
  for (const r in CORRECTIONS.rows) copy['G' + r] = { value: CORRECTIONS.rows[r], fontColor: 'blue' };
  plant(s, 'Export', EXPORT_WORK.wildcards);
});
// 4.2.6 UNIQUE, FILTER and SORT: the state stays on the helper route (the unique list of 4.2.3); the engine spills all three (clearcoat-pack-tools.test.js), so the lesson can add a spilled list
const S426 = S425;
// 4.2.C: a raw dump on a copy (the sorted copy back to export order, the scratch sheet gone)
const S42C = derive(S425, s => { s.sheets = s.sheets.filter(x => x.name !== 'Scratch'); const i = s.sheets.findIndex(x => x.name === 'Export sort'); s.sheets[i] = exportCopy(ROWS); drop(s, 'Export', Object.keys(EXPORT_WORK.wildcards)); });

/* ---------------- module 4.3: summaries from raw rows ---------------- */

// S43: the module's start: the working sheets gone, the picker back on Base
const S43 = derive(S425, s => { s.sheets = s.sheets.filter(x => x.name !== 'Scratch' && x.name !== 'Export sort'); drop(s, 'Export', Object.keys(EXPORT_WORK.wildcards)); take(s, SOLVED, 'Scenarios', ['C' + SCENARIOS.picker]); });

const S = SUMMARY;
// 4.3.1 The SUMIFS cube: the washes cube live (the codes link to the unique list), the revenue cube, the checks block started
const S431 = derive(S43, s => {
  take(s, SOLVED, 'Summary', [...blockRefs(SITE_R, COLS('B')), ...blockRefs([S.cubeRows, S.cubeTotal].flat(), COLS('BCDEF')), 'B' + S.revTitle, ...rowRefs(S.revHeader, COLS('CDEF')), ...blockRefs([...S.revRows, S.revTotal], COLS('BCDEF')),
    'B' + S.checks, ...blockRefs(S.checkRows.slice(0, 2), COLS('BC'))]);
});
// 4.3.2 The KPI block: hours, daily capacity, days reported, washes, utilization, peak, member washes and share by site; questions 2 and 3 answered
const S432 = derive(S431, s => {
  take(s, SOLVED, 'Summary', [...rowRefs(4, COLS('EFGHIJKLM')), ...blockRefs([...SITE_R, S.totalRow], COLS('BCDEFGHIJKLM'))]);
  take(s, SOLVED, 'Q&A', ['E6', 'F6', 'E7', 'F7']);
});
// 4.3.3 Date-range criteria: the window block (SUMIFS; the SUMPRODUCT version evaluates to the same figure); question 8 answered
const W = S.window;
const S433 = derive(S432, s => { take(s, SOLVED, 'Summary', ['B' + W.title, ...blockRefs([W.start, W.end, W.washes, W.revenue], COLS('BC'))]); take(s, SOLVED, 'Q&A', ['E12', 'F12']); });
// 4.3.4 The KPI page linked, labeled, checked: the title from Inputs, the source line, the checks block whole (the roll-up line waits for 4.3.6), print set-up
const S434 = derive(S433, s => {
  take(s, SOLVED, 'Summary', ['A1', 'B' + S.source, 'B' + S.checks, ...blockRefs(S.checkRows, COLS('BC'))]);
  drop(s, 'Summary', ['C' + S.checkRows[4]]);
  s.settings.pageSetup = clone(SUMMARY_PAGE_SETUP);
});
// 4.3.5 A buyer's question answered end to end: revenue per open hour by site in the window, the leader, question 7 answered
const PH = S.perHour;
const S435 = derive(S434, s => { take(s, SOLVED, 'Summary', ['B' + PH.title, ...rowRefs(PH.header, COLS('CDEF')), ...blockRefs([...PH.rows, PH.leader], COLS('BCDEF'))]); take(s, SOLVED, 'Q&A', ['E11', 'F11']); });
// 4.3.6 3D references and grouped sheets: the roll-up from the six site tabs, each tab's check row, the roll-up check line
const RU = S.rollup;
const S436 = derive(S435, s => {
  take(s, SOLVED, 'Summary', ['B' + RU.title, ...rowRefs(RU.header, COLS('CDEF')), ...blockRefs([RU.retail, RU.member, RU.total, RU.revenue], COLS('BCDEF')), 'C' + S.checkRows[4]]);
  for (const site of SITES) take(s, SOLVED, site.tab, ['B12', 'B13', 'C13']);
});
const S43C = S436;

/* ---------------- module 4.4: pivot tables ---------------- */

/** The sheet module 4.4 builds its pivot on: Alt N V T's new worksheet (in front of Export), renamed. */
export const CUTS = 'Cuts';
/** Export's values as the engine reads them (formulas worked out): rows 4 to 94, A to J, the table a pivot caches. */
function exportTable(state) {
  const X = new Sheet({ cells: clone(sheetOf(state, 'Export').cells) }); X.recalc();
  const table = []; for (let r = 4; r <= EXPORT_LAST; r++) { const row = []; for (let c = 1; c <= 10; c++) row.push(X.get(r, c).value); table.push(row); }
  return { table, X };
}
/**
 * A pivot over Export!A4:J94 as the engine leaves it on a sheet record: the record in sheet.pivots
 * and its cells (the values, an item's source format, a share as a percentage). `spec` is
 * { row, col, value, fn, show } by header name; the pivot sits at A3, as Alt N V T puts it.
 */
export function pivotOn(rec, state, spec, id = 'PivotTable1') {
  const { table, X } = exportTable(state); const at = { r: 3, c: 1 };
  const cache = pivotCache(table, spec); if (!cache) throw new Error("pivotOn: " + JSON.stringify(table[0]) + JSON.stringify(spec)); const lay = pivotLayout(cache, at);
  rec.cells = rec.cells || {};
  for (const k in rec.cells) if (rec.cells[k].pivot === id) delete rec.cells[k];
  for (const k in lay.cells) if (lay.cells[k] !== null) rec.cells[k] = { value: lay.cells[k], pivot: id };
  const srcFmt = field => { const c = table[0].findIndex(h => String(h).toLowerCase() === String(field || '').toLowerCase()); if (c < 0) return null; const x = X.get(5, c + 1); return x.fmtStyle && x.fmtStyle !== 'general' ? { fmtStyle: x.fmtStyle, ...(x.numFmt ? { numFmt: x.numFmt } : {}), decimals: x.decimals || 0 } : null; };
  for (const [keys, field] of [[lay.rowKeys, spec.row], [lay.colKeys, spec.col]]) { const f = srcFmt(field); if (f) for (const k of keys) if (typeof lay.cells[k] === 'number') Object.assign(rec.cells[k], f); }
  if (cache.pct) for (const k of lay.data) if (rec.cells[k]) Object.assign(rec.cells[k], { fmtStyle: 'percent', decimals: 2 });
  rec.pivots = [{ id, source: { sheet: 'Export', range: 'A4:J94' }, spec: { row: spec.row || null, col: spec.col || null, value: spec.value, fn: spec.fn || 'sum', ...(spec.show ? { show: spec.show } : {}) }, at,
    r1: lay.r1, c1: lay.c1, r2: lay.r2, c2: lay.c2, rowItems: cache.rowItems, colItems: cache.colItems, valueHead: cache.valueHead }];
  return rec;
}
/** The three arrangements module 4.4 leaves its pivot in. */
export const PIVOTS = {
  S441: { row: 'Week', col: 'Site', value: 'Retail revenue ($)', fn: 'sum' },
  S442: { row: 'Site', col: null, value: 'Date', fn: 'count' },
  S443: { row: 'Site', col: 'Week', value: 'Total washes', fn: 'sum' },
};
/**
 * 4.4.3's late correction: the controller resent Domain's first day with ten more member washes
 * (members pay monthly, so the takings stand). The Domain tab keeps its own copy of the week, so it
 * takes the ten too (tabRef), or the roll-up check on Summary stops reading zero.
 */
export const PIVOT_FIX = { ref: 'D5', value: ROWS[0].member + 10, tab: 'Domain', tabRef: 'C6' };
/** 4.4.3's reader on Summary: Domain's washes from the pivot by GETPIVOTDATA, and its difference from the cube. */
export const PIVOT_READ = {
  labels: { H14: { value: 'Domain washes, from the pivot' }, H15: { value: 'Less the cube (reads 0)' } },
  formats: { I14: { fontColor: 'green', fmtStyle: 'custom', numFmt: FMT.countDash, decimals: 0 }, I15: { fmtStyle: 'custom', numFmt: FMT.countDash, decimals: 0 } },
  formulas: { I14: `=GETPIVOTDATA("Total washes",${CUTS}!$A$3,"Site","AUS-DOM")`, I15: `=I14-F${SUMMARY.cubeRows[0]}` },
};
const withCuts = (s, spec) => { let rec = sheetOf(s, CUTS); if (!rec) { rec = { name: CUTS, cells: {} }; s.sheets.splice(s.sheets.findIndex(x => x.name === 'Export'), 0, rec); } pivotOn(rec, s, spec); };
const S44 = S436;
// 4.4.1 Build and rearrange: the pivot on its own sheet (Cuts), rearranged, left as retail revenue by week down and site across
const S441 = derive(S44, s => { withCuts(s, PIVOTS.S441); });
// 4.4.2 Value settings: the dates, the week key, a share of the column, an average, and last the count of days by site
const S442 = derive(S441, s => { withCuts(s, PIVOTS.S442); });
// 4.4.3 Refresh and GETPIVOTDATA: the correction on Export, the pivot refreshed and turned back to washes by week and site, Summary reading it by name
const S443 = derive(S442, s => {
  sheetOf(s, 'Export').cells[PIVOT_FIX.ref] = { ...sheetOf(s, 'Export').cells[PIVOT_FIX.ref], value: PIVOT_FIX.value };
  const tab = sheetOf(s, PIVOT_FIX.tab).cells; tab[PIVOT_FIX.tabRef] = { ...tab[PIVOT_FIX.tabRef], value: tab[PIVOT_FIX.tabRef].value + 10 };
  withCuts(s, PIVOTS.S443);
  plant(s, 'Summary', PIVOT_READ.labels);
  for (const k in PIVOT_READ.formulas) plant(s, 'Summary', { [k]: { formula: PIVOT_READ.formulas[k], ...PIVOT_READ.formats[k] } });
});
// 4.4.C starts from the module's start (no Cuts sheet); its seed lays a fresh fortnight over Export
const S44C = S436;

/* ---------------- module 4.5: scenarios and sensitivity ---------------- */

const C = SCENARIOS;
/** The outputs as 4.5.1 to 4.5.4 build them: the ticket read from the live column, before 4.5.5 routes it through the driver. */
const beforeDriver = cells => { for (const ref of ['C' + C.outputs.revenue, 'C' + C.breakEven.cpw]) if (cells[ref]) cells[ref] = { ...cells[ref], formula: cells[ref].formula.replace('C' + C.ticketModel, 'G' + C.inputs.ticket) }; };
/** The Data Tables each 4.5 state holds, by the input cells they move: before 4.5.5 the ticket is the live column's G6; from 4.5.5 the pass-through driver C13. */
export const TABLE_INPUTS = {
  S452: { ticket: 'G' + C.inputs.ticket },
  S453: { ticket: 'G' + C.inputs.ticket, share: 'G' + C.inputs.share }, S454: { ticket: 'G' + C.inputs.ticket, share: 'G' + C.inputs.share },
  S455: { ticket: 'C' + C.driver, share: 'G' + C.inputs.share },
  S456: { ticket: 'C' + C.driver, share: 'G' + C.inputs.share, sw: 'C' + C.switch },
};
const tables = (s, id) => tablesOn(sheetOf(s, 'Scenarios'), C, TABLE_INPUTS[id]);
// the module starts where 4.4 ended: the pivot on Cuts, the controller's correction and Summary's reader stay in the file
const S45 = S443;
// 4.5.1 A case toggle: the switch, the live column (CHOOSE on the first line, INDEX below), the outputs, the live case lit by a rule, the case in the title
const S451 = derive(S45, s => {
  take(s, SOLVED, 'Scenarios', ['A1', 'B' + C.switch, 'C' + C.switch, ...rowRefs(4, COLS('G')), ...blockRefs([C.inputs.washes, C.inputs.ticket, C.inputs.share, C.inputs.sites], COLS('G')), 'B' + C.outputs.title, ...blockRefs(Object.values(C.outputs).slice(1), COLS('BC'))]);
  const c = sheetOf(s, 'Scenarios').cells;
  for (const r of Object.values(C.inputs)) c['G' + r] = { ...c['G' + r], formula: c['G' + r].formula.replace('Case', '$C$11') };
  beforeDriver(c);
  sheetOf(s, 'Scenarios').condFmt = [clone(sheetOf(SOLVED, 'Scenarios').condFmt[0])];
});
// 4.5.2 One-way data table: EBITDA at five tickets, a Data Table on the live ticket G6, titled with the case it ran on
const ONE = C.oneWay, TWO = C.twoWay, CO = C.cases;
const S452 = derive(S451, s => { take(s, SOLVED, 'Scenarios', ['B' + ONE.title, 'B' + ONE.vals, 'B' + ONE.ebitda, 'C' + ONE.ebitda, ...rowRefs(ONE.vals, COLS('DEFGH'))]); tables(s, 'S452'); });
// 4.5.3 Two-way data table: ticket across, member share down, on G6 and G7; the base case bold; cells below the live case's EBITDA red
const S453 = derive(S452, s => {
  take(s, SOLVED, 'Scenarios', ['B' + TWO.title, 'B' + TWO.vals, 'C' + TWO.vals, ...rowRefs(TWO.vals, COLS('DEFGH')), ...TWO.rows.map(r => 'C' + r)]);
  tables(s, 'S453');
  sheetOf(s, 'Scenarios').condFmt.push(clone(sheetOf(SOLVED, 'Scenarios').condFmt[1]));
});
// 4.5.4 Goal Seek: Domain's break-even by hand and per Goal Seek, noted
const BE = C.breakEven;
const S454 = derive(S453, s => { take(s, SOLVED, 'Scenarios', ['B' + BE.title, ...blockRefs(Object.values(BE).slice(1), COLS('BC'))]); beforeDriver(sheetOf(s, 'Scenarios').cells); });
// 4.5.5 The pass-through driver: the ticket moved to Inputs (the case columns read it), the driver and the ticket the model reads, the outputs pointed at it, both tables re-run on the driver
const S455 = derive(S454, s => {
  take(s, SOLVED, 'Inputs', ['B15', 'C15', 'D15']);
  take(s, SOLVED, 'Scenarios', [...rowRefs(C.inputs.ticket, COLS('CDE')), ...blockRefs([C.driver, C.ticketModel], COLS('BC')), 'C' + C.outputs.revenue, 'C' + BE.cpw]);
  tables(s, 'S455');
});
// 4.5.6 Case outputs side by side: a Data Table on the switch, the source line and the checks; questions 9 and 10 answered. The sticky IF is built, watched and taken out again: the table is what stays.
const S456 = derive(S455, s => {
  take(s, SOLVED, 'Scenarios', ['B' + CO.title, ...blockRefs([CO.name, CO.num, CO.washes, CO.revenue, CO.contrib, CO.ebitda], COLS('BCDEF')), 'B' + C.source, 'B' + C.checks, ...blockRefs(C.checkRows, COLS('BC'))]);
  const c = sheetOf(s, 'Scenarios').cells;
  c['C' + C.checkRows[0]] = { ...c['C' + C.checkRows[0]], formula: c['C' + C.checkRows[0]].formula.replace('Case', '$C$11') };
  tables(s, 'S456');
  take(s, SOLVED, 'Q&A', ['E13', 'F13', 'E14', 'F14']);
});
/** A cell with its value or formula taken out and its format kept (a start state the learner fills). */
export const formatOnly = cell => { if (!cell) return null; const { value, formula, table, ...fmt } = cell; return Object.keys(fmt).length ? fmt : null; };
/** 4.5.C's start: the module's model with its switch, live column, tables and Goal Seek note taken out (the edges, corners and labels stay). */
const S45C = derive(S456, s => {
  const sc = sheetOf(s, 'Scenarios');
  tablesOff(sc);
  for (const ref of ['C' + C.switch, ...Object.values(C.inputs).map(r => 'G' + r), 'C' + BE.goalSeek]) { const f = formatOnly(sc.cells[ref]); if (f) sc.cells[ref] = f; else delete sc.cells[ref]; }
});

/* ---------------- the module challenges' seeds (4.4.C, 4.5.C) ---------------- */

export const CHALLENGES = {
  'challenge-an-export-summarized-three-ways': { before: 'S44C' },
  'challenge-a-three-case-model-with-a-sensitivity-table': { before: 'S45C' },
};
/** 4.4.C's late site-day: the row the controller never reported (Riverside, Sep 22), and where the seed leaves its figures. */
export const LATE = { row: exportRow(PLANT.missing.day, PLANT.missing.site), retail: 'M', member: 'N', label: 'L' };   // a column clear of the table, so the pivot's source stops at J
/**
 * A module challenge's seed patch: content only, never workload. 4.4.C lays a fresh fortnight's
 * washes and revenue over Export (every row, the late one's figures parked beside it); 4.5.C draws
 * fresh case inputs (washes, member share and sites for the three cases, in order).
 */
export function challengeSeed(id, rng) {
  if (!CHALLENGES[id]) throw new Error('clearcoat-pack: no challenge ' + id);
  const p = {};
  if (id === 'challenge-an-export-summarized-three-ways') {
    const ex = sheetOf(STATES[CHALLENGES[id].before], 'Export').cells;
    ROWS.forEach((x, i) => {
      const r = 5 + i; const site = SITES[x.site];
      const wd = ymd(x.date).wd; const dayFactor = wd === 5 ? 1.5 : wd === 6 ? 1.2 : wd === 0 ? 0.85 : 1;
      const total = Math.round((site.target * dayFactor * (0.8 + rng() * 0.4)) / 5) * 5;
      const retail = Math.round((total * (0.4 + rng() * 0.2)) / 5) * 5;
      if (r === LATE.row) {
        p[`Export!${LATE.label}${r}`] = { value: 'Late figures (retail, member)' };
        p[`Export!${LATE.retail}${r}`] = { value: retail, fontColor: 'blue' }; p[`Export!${LATE.member}${r}`] = { value: total - retail, fontColor: 'blue' };
        p[`Export!E${r}`] = { formula: `=C${r}+D${r}` };   // the total reads the row as soon as its figures land
        return;
      }
      p[`Export!C${r}`] = { ...ex['C' + r], value: retail }; p[`Export!D${r}`] = { ...ex['D' + r], value: total - retail };
      p[`Export!F${r}`] = { ...ex['F' + r], value: r2(retail * site.ticket) };
    });
  }
  if (id === 'challenge-a-three-case-model-with-a-sensitivity-table') {
    const sc = sheetOf(STATES[CHALLENGES[id].before], 'Scenarios').cells;
    const step = (lo, hi, by) => lo + Math.floor(rng() * (Math.round((hi - lo) / by) + 1)) * by;
    const base = { washes: step(230, 270, 5), share: Math.round(step(0.45, 0.55, 0.01) * 100) / 100, sites: step(40, 48, 1) };
    const cases = [
      { washes: base.washes + step(15, 35, 5), share: Math.round((base.share + 0.05) * 100) / 100, sites: base.sites + 2 },
      base,
      { washes: base.washes - step(20, 40, 5), share: Math.round((base.share - 0.05) * 100) / 100, sites: base.sites - 4 },
    ];
    COLS('CDE').forEach((col, i) => {
      for (const [key, row] of [['washes', C.inputs.washes], ['share', C.inputs.share], ['sites', C.inputs.sites]]) p[`Scenarios!${col}${row}`] = { ...sc[col + row], value: cases[i][key] };
    });
  }
  return p;
}

/* ---------------- module 4.6: names and structure ---------------- */

// 4.6.1 Naming toggles and key inputs: Case, Ticket and CostPerWash defined; the live column and the check read Case
const S461 = derive(S456, s => {
  s.names = { Case: NAMES.Case, Ticket: NAMES.Ticket, CostPerWash: NAMES.Cost_Per_Wash };
  take(s, SOLVED, 'Scenarios', [...blockRefs(Object.values(C.inputs), COLS('G')), 'C' + C.checkRows[0]]);
});
/** 4.6.2's strays: a name left pointing at the wrong cell (the ticket's old home on Scenarios). A #REF! name cannot be held in the engine's names. */
export const STRAY_NAMES = { OldTicket: 'Scenarios!$G$6' };
const S462start = derive(S461, s => { s.names = { ...s.names, ...STRAY_NAMES }; });
// 4.6.2 The Name Manager: the stray gone, CostPerWash renamed Cost_Per_Wash, the list pasted on Inputs
const S462 = derive(S462start, s => {
  s.names = { Case: NAMES.Case, Ticket: NAMES.Ticket, Cost_Per_Wash: NAMES.Cost_Per_Wash };
  take(s, SOLVED, 'Inputs', ['B17', 'C18', ...blockRefs([19, 20, 21, 22, 23], COLS('BC'))]);
  drop(s, 'Inputs', ['B20', 'C20', 'B22', 'C22']);   // Cases and Sites are 4.6.3's
});
// 4.6.3 A validation list driven by a name: Cases and Sites defined (the pickers read them); the names list complete
const S463 = derive(S462, s => { s.names = { ...NAMES }; applyValidation(s, SUMMARY, SCENARIOS, true); take(s, SOLVED, 'Inputs', blockRefs([19, 20, 21, 22, 23], COLS('BC'))); });
const S46C = S463;

/* ---------------- 4.P and 4.A: the diligence pack on a fresh export ---------------- */

const NEXT = buildSolved({ ex: EXPORT_NEXT });
/** The project's start: the fortnight after, in the shape the chapter found its file in. */
const SPraw = derive(cutStart(NEXT), s => {
  const sm = sheetOf(s, 'Summary').cells;
  // the project's cube is the learner's: only the title and the codes stay
  for (const ref in sm) if (+ref.slice(1) >= 14 && ref[0] !== 'B') delete sm[ref];
  for (const r of SUMMARY.cubeRows) delete sm['B' + r];
});
const SPdone = NEXT.state;

export const STATES = { S0, S411, S412, S413, S414, S415, S416, S417, S418, S41C, S41Cdone, S42, S421, S422, S423, S424, S425start, S425, S426, S42C, S43, S431, S432, S433, S434, S435, S436, S43C, S44, S441, S442, S443, S44C, S45, S451, S452, S453, S454, S455, S456, S45C, S461, S462start, S462, S463, S46C, SPraw, SPdone };
/** The chain the lessons walk, in script order; SPraw and SPdone are the project's fresh fortnight. */
export const STATE_ORDER = Object.keys(STATES);
/** Which lesson each state serves: [stateId, lesson, 'start' | 'end']. */
export const STATE_LESSONS = [
  ['S0', '4.1.1', 'start'], ['S411', '4.1.1', 'end'], ['S412', '4.1.2', 'end'], ['S413', '4.1.3', 'end'], ['S414', '4.1.4', 'end'], ['S415', '4.1.5', 'end'], ['S416', '4.1.6', 'end'], ['S417', '4.1.7', 'end'], ['S418', '4.1.8', 'end'],
  ['S41C', '4.1.C', 'start'], ['S41Cdone', '4.1.C', 'end'], ['S42', '4.2.1', 'start'], ['S421', '4.2.1', 'end'], ['S422', '4.2.2', 'end'], ['S423', '4.2.3', 'end'], ['S424', '4.2.4', 'end'], ['S425start', '4.2.5', 'start'], ['S425', '4.2.5', 'end'], ['S426', '4.2.6', 'end'], ['S42C', '4.2.C', 'start'],
  ['S43', '4.3.1', 'start'], ['S431', '4.3.1', 'end'], ['S432', '4.3.2', 'end'], ['S433', '4.3.3', 'end'], ['S434', '4.3.4', 'end'], ['S435', '4.3.5', 'end'], ['S436', '4.3.6', 'end'], ['S43C', '4.3.C', 'start'],
  ['S44', '4.4.1', 'start'], ['S441', '4.4.1', 'end'], ['S442', '4.4.2', 'end'], ['S443', '4.4.3', 'end'], ['S44C', '4.4.C', 'start'],
  ['S45', '4.5.1', 'start'], ['S451', '4.5.1', 'end'], ['S452', '4.5.2', 'end'], ['S453', '4.5.3', 'end'], ['S454', '4.5.4', 'end'], ['S455', '4.5.5', 'end'], ['S456', '4.5.6', 'end'], ['S45C', '4.5.C', 'start'],
  ['S461', '4.6.1', 'end'], ['S462start', '4.6.2', 'start'], ['S462', '4.6.2', 'end'], ['S463', '4.6.3', 'end'], ['S46C', '4.6.C', 'start'], ['SPraw', '4.P', 'start'], ['SPdone', '4.P', 'end'],
];

/** The sheet standard (screenplay 5, M86): the finished pages, and the sheets off the standard on purpose. */
export const STANDARD = {
  pages: [['SPdone', 'Q&A'], ['SPdone', 'Summary'], ['SPdone', 'Scenarios'], ['SPdone', 'Dashboard'], ['SPdone', 'Lists'], ['SPdone', 'Inputs'], ...SITES.map(s => ['SPdone', s.tab])],
  off: { Export: 'a raw export, laid out by the POS feed', 'Export sort': 'a working copy of the export (4.2.1 to 4.2.5)', Scratch: 'a scratch sheet for a paste (4.2.5)' },
};

/** A deep clone of a named state (runners mutate their copy, never the master). */
export function stateOf(id) {
  const s = STATES[id];
  if (!s) throw new Error('unknown workbook state ' + id);
  return clone(s);
}

/* ---------------- diffing (the chain test reads these) ---------------- */

/** The Data Tables of a sheet record, normalised: their blocks and input cells. */
const normTables = sh => (sh.dataTables || []).map(({ r1, c1, r2, c2, row, col }) => ({ r1, c1, r2, c2, row: row || null, col: col || null })).sort((a, b) => a.r1 - b.r1 || a.c1 - b.c1);
/** The pivots of a sheet record, normalised: source, place and layout (the id is the engine's count, not the learner's choice). */
const normPivots = sh => (sh.pivots || []).map(x => ({ source: x.source, at: x.at, spec: { row: x.spec.row || null, col: x.spec.col || null, value: x.spec.value || null, fn: x.spec.fn || 'sum', show: x.spec.show || null } }));
/** A table's results are worked out by the engine, so a state compares the table (its record) and not its figures. */
function withoutTableValues(state) {
  const out = clone({ ...state, sheets: state.sheets.map(sh => ({ ...sh, cells: sh.cells })) });
  for (const sh of out.sheets) for (const t of sh.dataTables || []) for (let r = t.r1 + 1; r <= t.r2; r++) for (let c = t.c1 + 1; c <= t.c2; c++) { const cell = sh.cells && sh.cells[refKey(r, c)]; if (cell) delete cell.value; }
  return out;
}
/** What differs between two states: the cells, structure and settings (clearcoat-weekly's diff), plus each sheet's Data Tables and pivots. */
export function diffStates(a, b) {
  const out = diffCells(withoutTableValues(a), withoutTableValues(b));
  for (const sa of a.sheets) {
    const sb = b.sheets.find(x => x.name === sa.name); if (!sb) continue;
    if (JSON.stringify(normTables(sa)) !== JSON.stringify(normTables(sb))) out.push({ sheet: sa.name, kind: 'dataTables', key: 'dataTables', a: normTables(sa), b: normTables(sb) });
    if (JSON.stringify(normPivots(sa)) !== JSON.stringify(normPivots(sb))) out.push({ sheet: sa.name, kind: 'pivots', key: 'pivots', a: normPivots(sa), b: normPivots(sb) });
  }
  return out;
}
/** A live session in the authored-state shape: clearcoat-weekly's extraction, plus each sheet's Data Tables and pivots. */
export function sessionToState(ses) {
  const st = sessionCells(ses);
  ses.sheets.forEach((e, i) => { const sh = st.sheets[i]; if (e.sheet.dataTables && e.sheet.dataTables.length) sh.dataTables = clone(e.sheet.dataTables); if (e.sheet.pivots && e.sheet.pivots.length) sh.pivots = clone(e.sheet.pivots); });
  return st;
}
