// app2/content/workbooks/voltline-weekly.js — the Chapter 1 module workbook (Project Volt).
// Voltline Charging Inc., Austin cluster, weekly site report, w/c 15 Sep 2026. One workbook that
// grows lesson by lesson: STATES[S0…] are the named snapshots every lesson chains through
// (lesson.state.before → solution → lesson.state.after; tests/module-states.test.js asserts it).
// Every state is DERIVED from the previous by a pure patch — nothing is retyped — and stateOf()
// hands out deep clones so a runner can never corrupt the master.
//
// The arithmetic is deliberately lemonade-stand (kWh sold × price = revenue; kWh × wholesale
// $0.13 = energy cost); sessions and tariffs arrive in Chapter 3. Figures are deterministic
// (seeded once, rounded to tens) so checks can read the sheet and still assert exact numbers.
import { mulberry32 } from '../../engine/rng.js';
import { FMT_FIELDS, Sheet, ROWH_DEFAULT } from '../../engine/sheet.js';

export const SITES = ['Domain', 'Mueller', 'Riverside', 'South Lamar', 'Airport'];
export const SITE_PRICE = { Domain: 0.45, Mueller: 0.44, Riverside: 0.46, 'South Lamar': 0.43, Airport: 0.48 };
export const WHOLESALE = 0.13;
/** Mon–Sat of last week (w/c 08 Sep 2026) then this week (w/c 15 Sep 2026). */
export const DAYS = ['08-Sep-26', '09-Sep-26', '10-Sep-26', '11-Sep-26', '12-Sep-26', '13-Sep-26',
  '15-Sep-26', '16-Sep-26', '17-Sep-26', '18-Sep-26', '19-Sep-26', '20-Sep-26'];

const r2 = v => Math.round(v * 100) / 100;

/** kWh per site-day: deterministic (one fixed seed), 400–2,600 rounded to tens. */
export const KWH = (() => {
  const rng = mulberry32(20260915);
  const out = {};
  for (const site of SITES) { out[site] = DAYS.map(() => Math.round((400 + rng() * 2200) / 10) * 10); }
  return out;
})();

/** The Raw feed row for (site, dayIndex): 1-based sheet row. Site-major: Domain 2–13 … Airport 50–61. */
export const rawRow = (site, d) => 2 + SITES.indexOf(site) * 12 + d;
/** The old platform's site codes (the stale column 1.4.1 deletes). */
export const OLD_CODES = { Domain: 'AUS-01', Mueller: 'AUS-02', Riverside: 'AUS-03', 'South Lamar': 'AUS-04', Airport: 'AUS-05' };
/** Cedar Park, the site that opens in 1.4.1: management's emailed week (not on the feed yet). */
export const CEDAR_PARK = { kwh: 2140, revenue: 1005.8, energy: 278.2 };
/** Where the platform feed's site-totals block sits on Raw (H6:M13): the live SUMs 1.3.4 freezes and 1.4.1 watches. */
export const RAW_TOTALS = { headerRow: 7, firstRow: 8, totalRow: 13, cols: { site: 'H', kwh: 'I', revenue: 'J', energy: 'K', prior: 'L', code: 'M' } };

/* ---------------- the S0 sheets ---------------- */

function rawCells() {
  const cells = {
    A1: { value: 'Date', bold: true }, B1: { value: 'Site', bold: true }, C1: { value: 'kWh sold', bold: true },
    D1: { value: 'Price ($/kWh)', bold: true }, E1: { value: 'Revenue ($)', bold: true }, F1: { value: 'Energy cost ($)', bold: true },
  };
  const BLANK_F = new Set([12, 19, 28, 44, 47]);   // five missing Energy cost cells (1.2.1 finds the first; 1.3.1 fills them)
  for (const site of SITES) {
    for (let d = 0; d < 12; d++) {
      const r = rawRow(site, d);
      const kwh = KWH[site][d], price = SITE_PRICE[site];
      cells['A' + r] = { value: DAYS[d] };
      cells['B' + r] = { value: site };
      cells['C' + r] = { value: kwh };
      cells['D' + r] = { value: price };
      cells['E' + r] = { value: r2(kwh * price) };
      if (!BLANK_F.has(r)) cells['F' + r] = { value: r2(kwh * WHOLESALE) };
    }
  }
  // the plantings later lessons rely on (map §1.3): typos, a text-number, a wrong figure, the missing day
  cells.B14 = { value: 'Muller' };            // Mueller day 1 (1.3.2 fixes)
  cells.B27 = { value: 'Riversid' };          // Riverside day 2 (1.3.2)
  cells.B55 = { value: 'Airprot' };           // Airport day 6 (1.3.5, Ctrl+F)
  cells.C33 = { value: '1,240 ' };            // a text-number (1.3.2); its row still ties once fixed
  cells.E33 = { value: r2(1240 * SITE_PRICE.Riverside) };
  cells.F33 = { value: r2(1240 * WHOLESALE) };
  cells.E41 = { value: 81500 };               // wrong figure, South Lamar day 4 (1.3.2)
  delete cells.C61; delete cells.D61; delete cells.E61; delete cells.F61;   // Airport Saturday never came through (1.3.1)
  cells.H3 = { value: 'draft', it: true };    // a stray note (1.3.1 clears it)
  cells.A64 = { value: 'Notes', bold: true };
  cells.A65 = { value: 'w/c 08 Sep feed checked — EA' };   // last week's note; the stale label 1.3.5 replaces lives on Report and Inputs
  cells.A66 = { value: 'Airport Saturday missing from feed' };
  cells.A67 = { value: 'prices per site tariff card' };
  // the platform appends a site-totals block beside the feed: live SUMs over each site's two weeks,
  // last week's revenue, and the old platform's site code (stale). 1.3.4 freezes these into the
  // Report's values; 1.4.1 deletes the codes and watches a deleted column turn the block #REF!.
  cells.H6 = { value: 'Site totals (platform)', bold: true };
  cells.H7 = { value: 'Site', bold: true }; cells.I7 = { value: 'kWh sold', bold: true }; cells.J7 = { value: 'Revenue ($)', bold: true };
  cells.K7 = { value: 'Energy cost ($)', bold: true }; cells.L7 = { value: 'Prior week rev ($)', bold: true }; cells.M7 = { value: 'Old code', bold: true };
  SITES.forEach((site, i) => {
    const r = 8 + i, tw = `${8 + 12 * i}:${13 + 12 * i}`, lw = `${2 + 12 * i}:${7 + 12 * i}`;   // this week's rows, last week's rows
    const rows = (col, band) => col + band.split(':')[0] + ':' + col + band.split(':')[1];
    cells['H' + r] = { value: site };
    cells['I' + r] = { formula: `=SUM(${rows('C', tw)})` };
    cells['J' + r] = { formula: `=SUM(${rows('E', tw)})` };
    cells['K' + r] = { formula: `=SUM(${rows('F', tw)})` };
    cells['L' + r] = { formula: `=SUM(${rows('E', lw)})` };
    cells['M' + r] = { value: OLD_CODES[site] };
  });
  cells.H13 = { value: 'Total', bold: true };
  for (const col of ['I', 'J', 'K', 'L']) cells[col + '13'] = { formula: `=SUM(${col}8:${col}12)` };
  return cells;
}

/** Sheet2: the associate's half-started inputs scratch (why 1.1.1 renames it instead of deleting). */
function sheet2Cells() {
  return {
    A1: { value: 'Inputs', bold: true },
    A3: { value: 'Week' }, B3: { value: 'w/c 08 Sep' },   // the reporting week, still last week's: 1.3.3 copies it, 1.3.5 replaces it everywhere
    A4: { value: 'Wholesale energy price ($/kWh)' },       // B4 empty: the price is buried in B14 until 1.1.4 splits it out
    A5: { value: 'Target gross margin' }, B5: { value: 0.65, fmtStyle: 'percent', decimals: 0 },
    A6: { value: 'Est. kWh this week (cluster)' }, B6: { value: 84000, fmtStyle: 'comma', decimals: 0 },
    A8: { value: 'Sites', bold: true },
    A9: { value: 'Domain' }, A10: { value: 'Mueller' }, A11: { value: 'Riverside' }, A12: { value: 'South Lamar' }, A13: { value: 'Airport' },
    A14: { value: 'Est. weekly energy bill ($)' }, B14: { formula: '=B6*0.13', fmtStyle: 'comma', decimals: 0 },
  };
}

function oldWk37Cells() {
  const cells = {
    A1: { value: 'Voltline — Austin weekly site feed, w/c 08 Sep 2026', bold: true },
    A2: { value: 'Date', bold: true }, B2: { value: 'Site', bold: true }, C2: { value: 'kWh sold', bold: true },
    D2: { value: 'Price ($/kWh)', bold: true }, E2: { value: 'Revenue ($)', bold: true },
  };
  for (const site of ['Domain', 'Mueller']) {
    for (let d = 0; d < 6; d++) {   // 2 sites × 6 days of last week = a stale 12-row copy, plus filler
      const r = 3 + (site === 'Domain' ? 0 : 6) + d;
      cells['A' + r] = { value: DAYS[d] }; cells['B' + r] = { value: site };
      cells['C' + r] = { value: KWH[site][d] }; cells['D' + r] = { value: SITE_PRICE[site] };
      cells['E' + r] = { value: r2(KWH[site][d] * SITE_PRICE[site]) };
    }
  }
  for (let r = 15; r <= 22; r++) cells['A' + r] = { value: '#N/A' };   // the export died half-way; the tab is junk
  return cells;
}

export const COST_ROWS = { Domain: 4, Mueller: 5, Riverside: 6, 'South Lamar': 7, Airport: 8 };
function costsCells() {
  return {
    A1: { value: 'Voltline — Austin site costs, w/c 08 Sep 2026', bold: true },
    A3: { value: 'Site', bold: true }, B3: { value: 'Site lease ($/wk)', bold: true }, C3: { value: 'Maintenance ($/wk)', bold: true },
    D3: { value: 'Network fees ($/wk)', bold: true }, E3: { value: 'Total ($/wk)', bold: true },
    A4: { value: 'Domain' }, B4: { value: 2100 }, C4: { value: 380 }, D4: { value: 260 }, E4: { formula: '=B4+C4+D4' },
    A5: { value: 'Mueller' }, B5: { value: 1750 }, /* C5 blank (1.2.4 finds it) */ D5: { value: 260 }, E5: { value: 2010 },
    A6: { value: 'Riverside' }, B6: { value: 1900 }, C6: { value: 420 }, D6: { value: 260 }, E6: { value: 2580 },
    A7: { value: 'South Lamar' }, B7: { value: 1650 }, /* C7 blank */ D7: { value: 260 }, E7: { value: 1910 },
    A8: { value: 'Airport' }, B8: { value: 2400 }, C8: { value: 510 }, D8: { value: 260 }, E8: { value: 3170 },
  };
}

/* ---------------- states ---------------- */

const clone = v => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)));

/** Derive a new state from `base` by a pure mutator over a deep clone. */
function derive(base, fn) { const next = clone(base); fn(next); return next; }
const sheetOf = (state, name) => state.sheets.find(s => s.name === name);

const S0 = {
  sheets: [
    { name: 'Raw', cells: rawCells(), colW: { 1: 76, 2: 92, 4: 92, 5: 88, 6: 104, 8: 96, 9: 76, 10: 92, 11: 108, 12: 128, 13: 72 }, active: { r: 1, c: 1 } },
    { name: 'Sheet2', cells: sheet2Cells(), colW: { 1: 180 } },
    { name: 'Old wk37', cells: oldWk37Cells(), colW: { 1: 76, 2: 92 } },
    { name: 'Costs', cells: costsCells(), colW: { 1: 92, 2: 108, 3: 122, 4: 122, 5: 92 } },
  ],
  settings: { calcMode: 'automatic', iterative: false, qat: ['save', 'undo', 'redo'] },
};

// 1.1.1 The workbook management sent: rename Sheet2 → Inputs, delete Old wk37, insert Report, move it to the front
const S1a = derive(S0, s => {
  sheetOf(s, 'Sheet2').name = 'Inputs';
  s.sheets = s.sheets.filter(x => x.name !== 'Old wk37');
  s.sheets.unshift({ name: 'Report', cells: {}, active: { r: 1, c: 1 } });
});

// 1.1.2 The Ribbon by keyboard: gridlines off on Report (a page someone reads)
const S1b = derive(S1a, s => { sheetOf(s, 'Report').gridlines = false; });

// 1.1.3 Set Excel up like an analyst: iterative calc on, the formatting commands on the QAT
const S1c = derive(S1b, s => {
  s.settings.iterative = true;
  s.settings.qat = ['save', 'undo', 'redo', 'fontColor', 'fillColor', 'borders', 'decDecimal'];
});

// 1.1.4 Colour, label, one hardcode per cell (on Inputs)
const S1d = derive(S1c, s => {
  const c = sheetOf(s, 'Inputs').cells;
  c.A2 = { value: 'USD unless stated' };
  c.B4 = { value: 0.13, fontColor: 'blue' };
  c.C4 = { value: 'per utility contract' };
  c.B5 = { ...c.B5, fontColor: 'blue' };
  c.B6 = { ...c.B6, fontColor: 'blue' };
  c.B14 = { ...c.B14, formula: '=B6*B4' };
});

// 1.2.1–1.2.3 move and select only; 1.2.4 colours the Costs constants blue via Go To Special
const S2a = derive(S1d, s => {
  const c = sheetOf(s, 'Costs').cells;
  for (const k of ['B4', 'C4', 'D4', 'B5', 'D5', 'B6', 'C6', 'D6', 'B7', 'D7', 'B8', 'C8', 'D8', 'E5', 'E6', 'E7', 'E8'])
    c[k] = { ...c[k], fontColor: 'blue' };
});

/* ---------------- module 1.3: enter, edit, copy and fill ---------------- */

/** The engine's own view of a sheet spec: the computed values of its formulas (the pasted-value states read them). */
const liveSheet = spec => new Sheet({ cells: clone(spec.cells), colW: spec.colW });

// 1.3.1 Enter the missing day: Airport Saturday typed in, the five blank energy costs zeroed, the stray note cleared
const S3a = derive(S2a, s => {
  const c = sheetOf(s, 'Raw').cells;
  const kwh = KWH.Airport[11];
  c.C61 = { value: kwh }; c.D61 = { value: SITE_PRICE.Airport }; c.E61 = { value: r2(kwh * SITE_PRICE.Airport) }; c.F61 = { value: r2(kwh * WHOLESALE) };
  for (const r of [12, 19, 28, 44, 47]) c['F' + r] = { value: 0 };
  c.H3 = { it: true };   // Delete clears the note and leaves its italic behind, as Excel does
});
/** The four figures management emailed for Airport's Saturday (1.3.1 types them; the challenge seeds its own). */
export const MISSING_DAY = { kwh: KWH.Airport[11], price: SITE_PRICE.Airport, revenue: r2(KWH.Airport[11] * SITE_PRICE.Airport), energy: r2(KWH.Airport[11] * WHOLESALE) };

// 1.3.2 Fix it in place: two typos, the text-number, the wrong figure
export const WRONG_FIGURE = { ref: 'E41', wrong: 81500, right: r2(KWH['South Lamar'][3] * SITE_PRICE['South Lamar']) };
const S3b = derive(S3a, s => {
  const c = sheetOf(s, 'Raw').cells;
  c.B14 = { value: 'Mueller' };
  c.B27 = { value: 'Riverside' };
  c.C33 = { value: 1240, fmtStyle: 'comma', decimals: 0 };   // F2, Backspace the trailing space, Enter: "1,240" reads as a number
  c.E41 = { value: WRONG_FIGURE.right };
});

/** The Report page's title and the header the skeleton carries. */
export const REPORT_TITLE = 'Voltline - Austin Weekly KPI Report, w/c 15 Sep 2026';   // typed by the learner (1.3.3): plain hyphen, every key on every keyboard
export const UNITS_LINE = 'USD unless stated';
const STALE_WEEK = 'w/c 08 Sep', THIS_WEEK = 'w/c 15 Sep';

// 1.3.3 Copy, cut, paste, fill: the Report skeleton from Raw and Inputs; the Notes block moved beside the feed
const S3c = derive(S3b, s => {
  const raw = sheetOf(s, 'Raw').cells, rep = sheetOf(s, 'Report').cells;
  rep.A1 = { value: REPORT_TITLE };
  rep.A2 = { value: UNITS_LINE };
  rep.A4 = { value: 'Site' }; rep.B4 = { value: 'Week' };
  rep.C4 = { value: 'kWh sold', bold: true }; rep.D4 = { value: 'Revenue ($)', bold: true }; rep.E4 = { value: 'Energy cost ($)', bold: true };   // pasted from Raw I7:K7
  SITES.forEach((site, i) => { rep['A' + (5 + i)] = { value: site }; rep['B' + (5 + i)] = { value: STALE_WEEK }; });   // sites from Inputs A9:A13; the week label from Inputs!B3, filled down
  rep.A12 = { value: 'kWh sold by day' };
  rep.A13 = { value: 'Week' }; for (const col of ['B', 'C', 'D', 'E', 'F', 'G']) rep[col + '13'] = { value: STALE_WEEK };   // one label, filled right
  rep.A14 = { value: 'Day' }; rep.A15 = { value: 'Date' };
  SITES.forEach((site, i) => { rep['A' + (16 + i)] = { value: site }; });   // the site list again, dropped with Enter
  // the Notes block cut from under the feed to beside it (H1:H4), so the feed's block ends at row 61
  raw.H1 = { value: 'Notes', bold: true }; raw.H2 = { value: raw.A65.value }; raw.H3 = { value: raw.A66.value }; raw.H4 = { value: raw.A67.value };
  delete raw.A64; delete raw.A65; delete raw.A66; delete raw.A67;
});

// 1.3.4 Paste Special: this week's totals and last week's revenue frozen as values, the total row pasted live, headers styled, the site list transposed
const S3d = derive(S3c, s => {
  const rep = sheetOf(s, 'Report').cells;
  const live = liveSheet(sheetOf(s, 'Raw'));
  rep.F4 = { value: 'Gross profit ($)', bold: true }; rep.G4 = { value: 'Avg price ($/kWh)', bold: true };   // typed, then Paste Formats from E4
  rep.H4 = { value: 'Prior week rev ($)', bold: true }; rep.I4 = { value: 'Old code', bold: true };            // Paste Values from Raw L7:M12, then Paste Formats
  SITES.forEach((site, i) => {
    const r = 5 + i, rr = 8 + i;
    rep['C' + r] = { value: live.value('I' + rr) }; rep['D' + r] = { value: live.value('J' + rr) }; rep['E' + r] = { value: live.value('K' + rr) };   // values, not links (1.6.4 links them)
    rep['H' + r] = { value: live.value('L' + rr) };
    rep['I' + r] = { value: OLD_CODES[site] };
  });
  rep.A10 = { value: 'Total' };
  rep.C10 = { formula: '=SUM(C5:C9)' }; rep.D10 = { formula: '=SUM(D5:D9)' }; rep.E10 = { formula: '=SUM(E5:E9)' };   // Raw I13:K13 pasted plain: the references follow
  rep.A22 = { value: 'Energy cost sensitivity ($/wk)' }; rep.A23 = { value: 'Price per kWh' };
  SITES.forEach((site, i) => { rep[String.fromCharCode(66 + i) + '23'] = { value: site }; });   // A5:A9 transposed
});

// 1.3.5 Find, replace, fill a timeline: the week label current on Report and Inputs, the Airport typo fixed, Mon–Sat and the dates filled
const S3e = derive(S3d, s => {
  const rep = sheetOf(s, 'Report').cells;
  for (let i = 0; i < 5; i++) rep['B' + (5 + i)] = { value: THIS_WEEK };
  for (const col of ['B', 'C', 'D', 'E', 'F', 'G']) rep[col + '13'] = { value: THIS_WEEK };
  sheetOf(s, 'Inputs').cells.B3 = { value: THIS_WEEK };
  sheetOf(s, 'Raw').cells.B55 = { value: 'Airport' };
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((d, i) => { rep[String.fromCharCode(66 + i) + '14'] = { value: d }; });
  for (let i = 0; i < 6; i++) rep[String.fromCharCode(66 + i) + '15'] = { value: 15 + i };
});

/* ---------------- module 1.4: structure ---------------- */

// 1.4.1 Rows and columns that keep the totals honest: Cedar Park's row inside the block, the Old code column gone, a Margin % column inserted
const S4a = derive(S3e, s => {
  const old = sheetOf(s, 'Report').cells;
  const rep = {};
  const shiftRef = (ref, dr, dc) => { const m = /^([A-Z]+)(\d+)$/.exec(ref); return String.fromCharCode(m[1].charCodeAt(0) + dc) + (+m[2] + dr); };
  for (const ref in old) {
    const m = /^([A-Z]+)(\d+)$/.exec(ref); const col = m[1], row = +m[2];
    if (col === 'I') continue;                                   // Old code: deleted
    const dc = col >= 'H' ? 1 : 0;                               // Margin % inserted at H: H → I
    const dr = row >= 9 ? 1 : 0;                                 // Cedar Park inserted at row 9
    rep[shiftRef(ref, dr, dc)] = old[ref];
  }
  rep.A9 = { value: 'Cedar Park' }; rep.B9 = { value: THIS_WEEK };
  rep.C9 = { value: CEDAR_PARK.kwh }; rep.D9 = { value: CEDAR_PARK.revenue }; rep.E9 = { value: CEDAR_PARK.energy };
  rep.C11 = { formula: '=SUM(C5:C10)' }; rep.D11 = { formula: '=SUM(D5:D10)' }; rep.E11 = { formula: '=SUM(E5:E10)' };   // the total follows the insert
  rep.H4 = { value: 'Margin %', bold: true };   // the inserted column dresses like G: bold header
  sheetOf(s, 'Report').cells = rep;
});

// 1.4.2 Widths, heights, AutoFit: day columns at 12, the comparison columns at 14, the label column fit to its sites, headers wrapped
const S4b = derive(S4a, s => {
  const sh = sheetOf(s, 'Report');
  const W12 = 12 * 7 + 5, W14 = 14 * 7 + 5;
  const fit = liveSheet(sh);
  sh.colW = { 1: fit.neededWidth(1, 5, 11), 2: W12, 3: W12, 4: W12, 5: W12, 6: W12, 7: W12, 8: W14, 9: W14 };
  for (const col of ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']) sh.cells[col + '4'] = { ...sh.cells[col + '4'], wrap: true };
  const sized = new Sheet({ cells: clone(sh.cells), colW: sh.colW }); sized.select('A4:I4'); sized.autofitRows();
  if (sized.rowH[4] !== ROWH_DEFAULT) sh.rowH = { 4: sized.rowH[4] };
});

// 1.4.3 Hide, group, freeze: the two working columns grouped (not hidden), the heads frozen at B5
const S4c = derive(S4b, s => {
  const sh = sheetOf(s, 'Report');
  sh.groups = { rows: [], cols: [{ c1: 5, c2: 6, collapsed: false }] };
  sh.freeze = { r: 4, c: 1 };
});

export const STATES = { S0, S1a, S1b, S1c, S1d, S2a, S3a, S3b, S3c, S3d, S3e, S4a, S4b, S4c };
export const STATE_ORDER = Object.keys(STATES);
// S5a–S8raw arrive with modules 1.5–1.8 (later C2 runs); each derives from the one before.

/** A deep clone of a named state (runners mutate their copy, never the master). */
export function stateOf(id) {
  const s = STATES[id];
  if (!s) throw new Error('unknown workbook state ' + id);
  return clone(s);
}

/**
 * A live session, extracted in the authored-state shape so diffStates can compare them: cells,
 * the widths that were set (colSet), non-default row heights, hidden, freeze, the outline.
 */
export function sessionToState(ses) {
  return {
    sheets: ses.sheets.map(e => {
      const S = e.sheet; const colW = {}; const rowH = {};
      S.colW.forEach((w, c) => { if (c >= 1 && S.colSet[c]) colW[c] = w; });
      S.rowH.forEach((h, r) => { if (r >= 1 && h !== ROWH_DEFAULT) rowH[r] = h; });
      return { name: e.name, cells: S.cells, colW, rowH, gridlines: S.gridlines === false ? false : undefined,
        hiddenRows: [...S.hiddenRows], hiddenCols: [...S.hiddenCols], freeze: { ...S.freeze }, groups: S.groups };
    }),
    settings: { calcMode: ses.settings.calcMode, iterative: ses.settings.iterative, qat: ses.settings.qat.slice() },
  };
}

/* ---------------- diffing (the chain test and audit graders read this) ---------------- */

const CELL_KEYS = ['value', 'formula', ...FMT_FIELDS];   // the engine's own format field list, so the diff can never miss a prop
// Engine defaults that mean "nothing set": a live sheet materialises full records, an authored
// state carries only what it means, and the diff must treat the two alike. txt is derived from
// how a value was entered, never authored, so it is ignored entirely.
const ZERO_DEFAULT = new Set(['indent', 'scale', 'ca', 'decimals', 'fsz']);
const cellNorm = c => {
  const out = {};
  for (const k of CELL_KEYS) {
    if (!c || c[k] === undefined || c[k] === null || c[k] === false) continue;
    if (k === 'txt') continue;
    if (ZERO_DEFAULT.has(k) && c[k] === 0) continue;
    if (k === 'fmtStyle' && c[k] === 'general') continue;
    out[k] = c[k];
  }
  if (out.formula) delete out.value;   // a formula cell's value is computed; authored states carry only the formula
  return out;
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * What differs between two states: [{ sheet, kind, key, a, b }] — cells (by ref), sheet order,
 * added/removed sheets, gridlines, colW/rowH, hidden, freeze, settings. Empty array = identical.
 */
export function diffStates(a, b) {
  const out = [];
  const namesA = a.sheets.map(s => s.name), namesB = b.sheets.map(s => s.name);
  if (!same(namesA, namesB)) out.push({ sheet: '*', kind: 'sheets', key: 'order', a: namesA, b: namesB });
  for (const name of new Set([...namesA, ...namesB])) {
    const sa = sheetOf(a, name), sb = sheetOf(b, name);
    if (!sa || !sb) { if (!out.some(d => d.kind === 'sheets')) out.push({ sheet: name, kind: 'sheets', key: 'presence', a: !!sa, b: !!sb }); continue; }
    const refs = new Set([...Object.keys(sa.cells || {}), ...Object.keys(sb.cells || {})]);
    for (const ref of refs) {
      const ca = cellNorm((sa.cells || {})[ref]), cb = cellNorm((sb.cells || {})[ref]);
      if (!same(ca, cb)) out.push({ sheet: name, kind: 'cell', key: ref, a: ca, b: cb });
    }
    for (const k of ['colW', 'rowH']) if (!same(sa[k] || {}, sb[k] || {})) out.push({ sheet: name, kind: k, key: k, a: sa[k], b: sb[k] });
    const ga = sa.gridlines !== false, gb = sb.gridlines !== false;
    if (ga !== gb) out.push({ sheet: name, kind: 'gridlines', key: 'gridlines', a: ga, b: gb });
    if (!same(sa.hiddenRows || [], sb.hiddenRows || [])) out.push({ sheet: name, kind: 'hiddenRows', key: 'hiddenRows', a: sa.hiddenRows, b: sb.hiddenRows });
    if (!same(sa.hiddenCols || [], sb.hiddenCols || [])) out.push({ sheet: name, kind: 'hiddenCols', key: 'hiddenCols', a: sa.hiddenCols, b: sb.hiddenCols });
    if (!same(sa.freeze || { r: 0, c: 0 }, sb.freeze || { r: 0, c: 0 })) out.push({ sheet: name, kind: 'freeze', key: 'freeze', a: sa.freeze, b: sb.freeze });
    const NOG = { rows: [], cols: [] };
    if (!same(sa.groups || NOG, sb.groups || NOG)) out.push({ sheet: name, kind: 'groups', key: 'groups', a: sa.groups, b: sb.groups });
  }
  if (!same(a.settings || {}, b.settings || {})) out.push({ sheet: '*', kind: 'settings', key: 'settings', a: a.settings, b: b.settings });
  return out;
}
