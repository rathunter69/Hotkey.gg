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
import { FMT_FIELDS, Sheet, ROWH_DEFAULT, normGroups, stepFsz } from '../../engine/sheet.js';

export const SITES = ['Domain', 'Mueller', 'Riverside', 'South Lamar', 'Airport'];
export const SITE_PRICE = { Domain: 0.45, Mueller: 0.44, Riverside: 0.46, 'South Lamar': 0.43, Airport: 0.48 };
export const WHOLESALE = 0.13;
/** Mon–Sat of last week (w/c 08 Sep 2026) then this week (w/c 15 Sep 2026). */
export const DAYS = ['08-Sep-26', '09-Sep-26', '10-Sep-26', '11-Sep-26', '12-Sep-26', '13-Sep-26',
  '15-Sep-26', '16-Sep-26', '17-Sep-26', '18-Sep-26', '19-Sep-26', '20-Sep-26'];

const r2 = v => Math.round(v * 100) / 100;

/** kWh per site-day for a feed: deterministic from one seed, 400–2,600 rounded to tens. */
export const kwhFor = (seed, days = DAYS) => {
  const rng = mulberry32(seed);
  const out = {};
  for (const site of SITES) { out[site] = days.map(() => Math.round((400 + rng() * 2200) / 10) * 10); }
  return out;
};
export const KWH = kwhFor(20260915);

/** The Raw feed row for (site, dayIndex): 1-based sheet row. Site-major: Domain 2–13 … Airport 50–61. */
export const rawRow = (site, d) => 2 + SITES.indexOf(site) * 12 + d;
/** The old platform's site codes (the stale column 1.4.1 deletes). */
export const OLD_CODES = { Domain: 'AUS-01', Mueller: 'AUS-02', Riverside: 'AUS-03', 'South Lamar': 'AUS-04', Airport: 'AUS-05' };
/** Cedar Park, the site that opens in 1.4.1: management's emailed week (not on the feed yet). */
export const CEDAR_PARK = { kwh: 2140, revenue: 1005.8, energy: 278.2 };
/** Where the platform feed's site-totals block sits on Raw (H6:M13): the live SUMs 1.3.4 freezes and 1.4.1 watches. */
export const RAW_TOTALS = { headerRow: 7, firstRow: 8, totalRow: 13, cols: { site: 'H', kwh: 'I', revenue: 'J', energy: 'K', prior: 'L', code: 'M' } };
/** The platform's by-day block on Raw (H30:N36): Mon–Sat of this week across I:N, the five feed sites down rows 32–36 (1.6.5 links the Report's daily block to it); below row 27 so 1.3.2's Find Next walk meets the feed's typos first. */
export const RAW_BYDAY = { headerRow: 31, firstRow: 32, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], dayCols: ['I', 'J', 'K', 'L', 'M', 'N'] };

/* ---------------- the S0 sheets ---------------- */

/**
 * The platform's feed sheet for one fortnight: headers, 60 rows (5 sites × 12 days), the
 * site-totals block H6:M13 (live SUMs over each site's two weeks, last week's revenue, the old
 * platform's site code), this week's kWh by site and day (H30:N36), and the feed's Notes block
 * (below the feed at A64, or beside it at H1 once 1.3.3 has moved it).
 */
function feedCells({ kwh, days, notes, notesBeside = false }) {
  const cells = {
    A1: { value: 'Date', bold: true }, B1: { value: 'Site', bold: true }, C1: { value: 'kWh sold', bold: true },
    D1: { value: 'Price ($/kWh)', bold: true }, E1: { value: 'Revenue ($)', bold: true }, F1: { value: 'Energy cost ($)', bold: true },
  };
  for (const site of SITES) {
    for (let d = 0; d < 12; d++) {
      const r = rawRow(site, d);
      const k = kwh[site][d], price = SITE_PRICE[site];
      cells['A' + r] = { value: days[d] };
      cells['B' + r] = { value: site };
      cells['C' + r] = { value: k };
      cells['D' + r] = { value: price };
      cells['E' + r] = { value: r2(k * price) };
      cells['F' + r] = { value: r2(k * WHOLESALE) };
    }
  }
  const noteAt = notesBeside ? i => 'H' + (1 + i) : i => 'A' + (64 + i);
  cells[noteAt(0)] = { value: 'Notes', bold: true };
  notes.forEach((t, i) => { cells[noteAt(1 + i)] = { value: t }; });
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
  // …and this week's kWh by site and day (H30:N36), live off the feed: the Report's daily block links to it in 1.6.5
  cells['H' + (RAW_BYDAY.headerRow - 1)] = { value: 'kWh by day, this week (platform)', bold: true };
  cells['H' + RAW_BYDAY.headerRow] = { value: 'Site', bold: true };
  RAW_BYDAY.days.forEach((d, j) => { cells[RAW_BYDAY.dayCols[j] + RAW_BYDAY.headerRow] = { value: d, bold: true }; });
  SITES.forEach((site, i) => {
    const r = RAW_BYDAY.firstRow + i;
    cells['H' + r] = { value: site };
    RAW_BYDAY.dayCols.forEach((col, j) => { cells[col + r] = { formula: `=C${8 + 12 * i + j}` }; });
  });
  return cells;
}
/** The Raw feed's colW, shared by every feed the platform sends. */
const RAW_COLW = { 1: 76, 2: 92, 4: 92, 5: 88, 6: 104, 8: 96, 9: 76, 10: 92, 11: 108, 12: 128, 13: 72 };

/** S0's Raw: the w/c 15 Sep feed as it arrived, with the plantings the chapter's lessons rely on. */
function rawCells() {
  const cells = feedCells({ kwh: KWH, days: DAYS, notes: ['w/c 08 Sep feed checked — EA', 'Airport Saturday missing from feed', 'prices per site tariff card'] });   // last week's note; the stale label 1.3.5 replaces lives on Report and Inputs
  const BLANK_F = [12, 19, 28, 44, 47];   // five missing Energy cost cells (1.2.1 finds the first; 1.3.1 fills them)
  for (const r of BLANK_F) delete cells['F' + r];
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
    { name: 'Raw', cells: rawCells(), colW: { ...RAW_COLW }, active: { r: 1, c: 1 } },
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

/* ---------------- module 1.5: format (the format the team uses) ---------------- */

const fmt = (cells, refs, style, decimals) => { for (const ref of refs) cells[ref] = { ...(cells[ref] || {}), fmtStyle: style, decimals }; };
const span = (col1, col2, r1, r2) => { const out = []; for (let c = col1.charCodeAt(0); c <= col2.charCodeAt(0); c++) for (let r = r1; r <= r2; r++) out.push(String.fromCharCode(c) + r); return out; };
const each = (cells, refs, fn) => { for (const ref of refs) { cells[ref] = { ...(cells[ref] || {}) }; fn(cells[ref]); } };
/** The Report's site rows and total row, its money columns, and the columns the formats cover. */
export const REPORT = { siteRows: [5, 6, 7, 8, 9, 10], totalRow: 11, cedarRow: 9, money: ['D', 'E', 'F'], dailyRows: [17, 18, 19, 20, 21], dayCols: ['B', 'C', 'D', 'E', 'F', 'G'], summaryRow: 26, checksRow: 33 };
export const TITLE_FSZ = stepFsz(null, 1);   // one step up the ladder (Alt H F G)
export const SCENARIO_PRICES = [0.12, 0.13, 0.14];   // the energy-price scenarios of 1.6.3 (J4:L4)

// 1.5.1 Numbers a banker can read: thousands separators and no decimals on the figures, $ on the first and total rows,
// avg price to 2 decimals, Margin % to one decimal, the wholesale price to 3 decimals; negatives read in parentheses by style
const S5a = derive(S4c, s => {
  const c = sheetOf(s, 'Report').cells;
  fmt(c, span('C', 'F', 5, 11), 'comma', 0);
  fmt(c, span('I', 'I', 5, 10), 'comma', 0);
  fmt(c, ['D5', 'E5', 'F5', 'I5', 'D11', 'E11', 'F11'], 'currency', 0);   // D4: $ on the first and total rows of a money column
  fmt(c, span('G', 'G', 5, 11), 'currency', 2);
  fmt(c, span('H', 'H', 5, 11), 'percent', 1);
  fmt(c, span('B', 'G', 17, 21), 'comma', 0);   // the daily block, at scale
  const inp = sheetOf(s, 'Inputs').cells;
  inp.B4 = { ...inp.B4, fmtStyle: 'currency', decimals: 3 };
});

// 1.5.2 Fonts, fills, borders: the title bold and one size up, the total row bold with a top border, the input block tinted
const S5b = derive(S5a, s => {
  const c = sheetOf(s, 'Report').cells;
  c.A1 = { ...c.A1, bold: true, fsz: TITLE_FSZ };
  each(c, span('A', 'Z', 11, 11), x => { x.bold = true; x.bt = true; });   // D5: the whole total row (Shift+Space) bold with a top border, never a grid
  each(c, span('A', 'Z', 4, 4), x => { x.bold = true; });                    // the whole header row bold (A4:B4 were not)
  const inp = sheetOf(s, 'Inputs').cells;
  each(inp, span('B', 'B', 3, 6), x => { x.fill = 'blue'; });   // B3: the input block carries a light tint
});

// 1.5.3 Alignment and titles: the title centered across the page (never merged), headers right over their numbers, the daily site lines indented, a long label wrapped
const S5c = derive(S5b, s => {
  const c = sheetOf(s, 'Report').cells;
  c.A1 = { ...c.A1, ca: 9 };   // D7: Center Across Selection over A1:I1
  each(c, span('C', 'I', 4, 4), x => { x.align = 'r'; });
  each(c, span('A', 'A', 14, 21), x => { x.indent = 1; });   // D6: the lines under the daily table's heading indented
  c.A2 = { ...c.A2, it: true };                                // the units line reads as a note
  const inp = sheetOf(s, 'Inputs').cells;
  inp.C4 = { ...inp.C4, wrap: true };
});

// 1.5.4 The style pass: the Costs block brought to the same standard (figures comma 0, its total column bold, headers right), the stray grid gone
const S5d = derive(S5c, s => {
  const c = sheetOf(s, 'Costs').cells;
  fmt(c, span('B', 'E', 4, 8), 'comma', 0);
  each(c, span('E', 'E', 4, 8), x => { x.bold = true; });
  each(c, span('B', 'E', 3, 3), x => { x.align = 'r'; });
});
/** What 1.5.4 plants at its start: the associate's all-borders grid over the Costs block (the lesson removes it). */
export const PLANT_COSTS_GRID = Object.fromEntries(span('A', 'E', 3, 8).map(ref => ['Costs!' + ref, { ball: true }]));

/* ---------------- module 1.6: formulas ---------------- */

// 1.6.1 Point, don't type: gross profit, avg price and margin for Domain by pointing, then filled down the six sites
const S6a = derive(S5d, s => {
  const c = sheetOf(s, 'Report').cells;
  for (const r of REPORT.siteRows) { c['F' + r] = { ...c['F' + r], formula: `=D${r}-E${r}` }; c['G' + r] = { ...c['G' + r], formula: `=D${r}/C${r}` }; c['H' + r] = { ...c['H' + r], formula: `=F${r}/D${r}` }; }
});

// 1.6.2 SUM family and AutoSum: the gross-profit total by Alt+= over the block, the total row's avg price and margin, a week summary (AVERAGE, MAX, MIN, COUNT, COUNTA)
export const SUMMARY_LINES = [
  ['Average kWh per site', '=AVERAGE(C5:C10)', 'comma'], ['Best site (kWh)', '=MAX(C5:C10)', 'comma'], ['Lowest site (kWh)', '=MIN(C5:C10)', 'comma'],
  ['Sites with figures', '=COUNT(C5:C10)', 'general'], ['Sites listed', '=COUNTA(A5:A10)', 'general'],
];
const S6b = derive(S6a, s => {
  const c = sheetOf(s, 'Report').cells;
  c.F11 = { ...c.F11, formula: '=SUM(F5:F10)' };
  c.G11 = { ...c.G11, formula: '=D11/C11' }; c.H11 = { ...c.H11, formula: '=F11/D11' };
  c['A' + REPORT.summaryRow] = { value: 'Week summary', bold: true };
  SUMMARY_LINES.forEach(([label, formula, style], i) => { const r = REPORT.summaryRow + 1 + i; c['A' + r] = { value: label }; c['B' + r] = { formula, ...(style === 'comma' ? { fmtStyle: 'comma', decimals: 0 } : {}) }; });
});

// 1.6.3 Anchors: the energy-cost scenario grid beside the report (sites down, three prices across), one formula with mixed anchors filled both ways; the old stub under the daily table cleared
const S6c = derive(S6b, s => {
  const c = sheetOf(s, 'Report').cells;
  c.J3 = { value: 'Energy cost at price ($/wk)', bold: true };
  SCENARIO_PRICES.forEach((p, j) => { const col = String.fromCharCode(74 + j); c[col + '4'] = { value: p, fontColor: 'blue', fmtStyle: 'currency', decimals: 2 }; });
  for (const r of REPORT.siteRows) for (let j = 0; j < 3; j++) { const col = String.fromCharCode(74 + j); c[col + r] = { formula: `=$C${r}*${col}$4`, fmtStyle: 'comma', decimals: 0 }; }
  for (const ref of span('A', 'F', 23, 24)) delete c[ref];
});

// 1.6.4 Link across sheets: the site figures are links to Raw's totals (green), energy cost is kWh × the wholesale price on Inputs; Cedar Park's emailed figures stay typed
const S6d = derive(S6c, s => {
  const c = sheetOf(s, 'Report').cells;
  REPORT.siteRows.forEach(r => {
    if (r !== REPORT.cedarRow) { const rr = r < REPORT.cedarRow ? 8 + (r - 5) : 12; c['C' + r] = { ...c['C' + r], formula: `=Raw!I${rr}`, fontColor: 'green' }; c['D' + r] = { ...c['D' + r], formula: `=Raw!J${rr}`, fontColor: 'green' }; }
    c['E' + r] = { ...c['E' + r], formula: `=C${r}*Inputs!$B$4`, fontColor: 'green' };
  });
});

// 1.6.5 One formula per row, filled right: the daily block links to Raw's by-day block, one formula filled across and down, green
const S6e = derive(S6d, s => {
  const c = sheetOf(s, 'Report').cells;
  REPORT.dailyRows.forEach((r, i) => REPORT.dayCols.forEach((col, j) => { c[col + r] = { ...c[col + r], formula: `=Raw!${RAW_BYDAY.dayCols[j]}${RAW_BYDAY.firstRow + i}`, fontColor: 'green' }; }));
});
/** What 1.6.5 plants: the associate already filled rows 18–21 — and retyped Riverside's Thursday (E19) over its formula. */
export const PLANT_DAILY = (() => {
  const out = {};
  REPORT.dailyRows.slice(1).forEach((r, i) => REPORT.dayCols.forEach((col, j) => { out[`Report!${col}${r}`] = { formula: `=Raw!${RAW_BYDAY.dayCols[j]}${RAW_BYDAY.firstRow + 1 + i}`, fontColor: 'green', fmtStyle: 'comma', decimals: 0 }; }));
  out['Report!E19'] = { value: KWH.Riverside[9], fontColor: 'green', fmtStyle: 'comma', decimals: 0 };   // Thursday retyped: the right number, dead
  return out;
})();

// 1.6.6 Read the error, follow the trail: the Costs block's totals are live formulas again, its cost-per-kWh line reads a link to the Report
const S6f = derive(S6e, s => {
  const c = sheetOf(s, 'Costs').cells;
  for (const r of [5, 6, 7, 8]) c['E' + r] = { ...c['E' + r], formula: `=B${r}+C${r}+D${r}`, fontColor: null };
  c.D7 = { ...c.D7, value: 260 };
  c.A9 = { value: 'Total', bold: true }; c.E9 = { formula: '=SUM(E4:E8)', bold: true, fmtStyle: 'comma', decimals: 0 };
  c.A10 = { value: 'Cost per kWh sold ($)' }; c.B10 = { formula: '=E9/B11', fmtStyle: 'currency', decimals: 3 };
  c.A11 = { value: 'kWh sold this week' }; c.B11 = { formula: '=Report!C11', fontColor: 'green', fmtStyle: 'comma', decimals: 0 };
});
/** What 1.6.6 plants: five errors on Costs — #REF!, #NAME?, #VALUE! (a text figure), #N/A, #DIV/0! — around the same lines. */
export const PLANT_COSTS_ERRORS = {
  'Costs!E5': { formula: '=B5+C5+#REF!', fontColor: 'blue' },
  'Costs!E6': { formula: '=SUMM(B6:D6)', fontColor: 'blue' },
  'Costs!D7': { value: 'tbc', fontColor: 'blue' }, 'Costs!E7': { formula: '=B7+C7+D7', fontColor: 'blue' },   // a word where a figure belongs: #VALUE!
  'Costs!E8': { formula: '=VLOOKUP("Airport ",A4:D8,4,FALSE)', fontColor: 'blue' },
  'Costs!A9': { value: 'Total', bold: true }, 'Costs!E9': { formula: '=SUM(E4:E8)', bold: true, fmtStyle: 'comma', decimals: 0 },
  'Costs!A10': { value: 'Cost per kWh sold ($)' }, 'Costs!B10': { formula: '=E9/B12', fmtStyle: 'currency', decimals: 3 },
  'Costs!A11': { value: 'kWh sold this week' }, 'Costs!B11': { formula: '=Report!C11', fontColor: 'green', fmtStyle: 'comma', decimals: 0 },
};

/* ---------------- module 1.7: present and audit ---------------- */

/** The Report's print set-up after 1.7.1 (G1): landscape, one page wide, the heads repeated, file and date in the footer. */
export const REPORT_PAGE_SETUP = { orientation: 'landscape', scaling: 'fit', adjustTo: 100, fitWide: 1, fitTall: 1, titlesRows: '$1:$4', footer: { left: '&[File]', centre: '', right: '&[Date]' }, printGridlines: false };
const S7a = derive(S6f, s => { s.settings.pageSetup = clone(REPORT_PAGE_SETUP); });

// 1.7.2 The checks row: three live differences that read zero when the page ties (F1)
export const CHECK_LINES = [
  ['Report revenue ties to the feed', '=SUM(D5:D8,D10)-Raw!J13'],
  ['Sites sum to the total', '=SUM(C5:C10)-C11'],
  ['Margin within 0-100%', '=IF(AND(H11>=0,H11<=1),0,1)'],
];
const S7b = derive(S7a, s => {
  const c = sheetOf(s, 'Report').cells;
  c['A' + REPORT.checksRow] = { value: 'Checks', bold: true };
  CHECK_LINES.forEach(([label, formula], i) => { const r = REPORT.checksRow + 1 + i; c['A' + r] = { value: label }; c['B' + r] = { formula, fmtStyle: 'comma', decimals: 0 }; });
});

// 1.7.3 Hardcode hunt: the associate's markup fixed — the one thing that stays fixed is Cedar Park's emailed figures shown as the inputs they are (B1)
const S7c = derive(S7b, s => {
  const c = sheetOf(s, 'Report').cells;
  for (const ref of ['C9', 'D9', 'E9']) c[ref] = { ...c[ref], fontColor: 'blue' };
});
/** What 1.7.3 plants: seven of the eight violations (the eighth, Cedar Park's black inputs, is already in S7b). */
export const PLANT_AUDIT = (() => {
  const out = {};
  out['Report!G6'] = { formula: '=D6/6850', fmtStyle: 'currency', decimals: 2 };                  // a literal where C6 belongs
  out['Report!E18'] = { value: KWH.Mueller[9], fontColor: 'green', fmtStyle: 'comma', decimals: 0 };   // Mueller's Thursday retyped
  out['Report!A1'] = { value: '            ' + REPORT_TITLE, bold: true, fsz: TITLE_FSZ };            // centered by padding, Center Across gone
  out['Report!A2'] = null;                                                                          // the units line gone
  for (const ref of span('B', 'G', 15, 21)) out['Report!' + ref] = { ball: true };                 // a grid over the daily table…
  out['Report!#gridlines'] = true;                                                                  // …with gridlines on
  out['Report!#hiddenCols'] = [9];                                                                  // Prior week rev hidden
  return out;
})();
const AUDIT_CELLS = ['G6', 'E18', 'A1', 'A2', ...span('B', 'G', 15, 21), 'C9', 'D9', 'E9'];
/** The cells 1.7.3 may change (its graders diff against S7c and allow nothing else). */
export const AUDIT_ALLOWED = AUDIT_CELLS;

/* ---------------- module 1.8: the next feed (project, assessment) ---------------- */

/** Mon–Sat of w/c 15 Sep then w/c 22 Sep 2026: the fortnight management's next export covers. */
export const DAYS_NEXT = ['15-Sep-26', '16-Sep-26', '17-Sep-26', '18-Sep-26', '19-Sep-26', '20-Sep-26',
  '22-Sep-26', '23-Sep-26', '24-Sep-26', '25-Sep-26', '26-Sep-26', '27-Sep-26'];
export const KWH_NEXT = kwhFor(20260922, DAYS_NEXT);
export const WEEK_NEXT = 'w/c 22 Sep';
export const REPORT_TITLE_NEXT = 'Voltline - Austin Weekly KPI Report, w/c 22 Sep 2026';
/**
 * The project's page (1.8): the same shape the chapter built, simplified to what one sitting can
 * make — five feed sites (no Cedar Park), the total row, the daily block, the checks. No scenario
 * grid, no week summary. Rows and columns the project's goals and the assessment's graders read.
 */
export const REPORT_NEXT = { siteRows: [5, 6, 7, 8, 9], totalRow: 10, money: ['D', 'E', 'F'], lastCol: 'H',
  dailyTitleRow: 12, dailyHeaderRow: 13, dailyRows: [14, 15, 16, 17, 18], dayCols: ['B', 'C', 'D', 'E', 'F', 'G'], checksRow: 20 };
export const CHECK_LINES_NEXT = [
  ['Report revenue ties to the feed', '=D10-Raw!J13'],
  ['Sites sum to the total', '=SUM(C5:C9)-C10'],
  ['Margin within 0-100%', '=IF(AND(H10>=0,H10<=1),0,1)'],
];
export const HEADERS_NEXT = ['Site', 'Week', 'kWh sold', 'Revenue ($)', 'Energy cost ($)', 'Gross profit ($)', 'Avg price ($/kWh)', 'Margin %'];

// S8raw: management's next feed, the shape the chapter left the file in — Report blank, Inputs and
// Costs as 1.7 left them but dated for the new week, the QAT and calc settings kept.
const S8raw = derive(S7c, s => {
  const rep = sheetOf(s, 'Report');
  s.sheets = [{ name: 'Report', cells: {}, active: { r: 1, c: 1 } }, sheetOf(s, 'Raw'), sheetOf(s, 'Inputs'), sheetOf(s, 'Costs')];
  void rep;
  const raw = sheetOf(s, 'Raw');
  raw.cells = feedCells({ kwh: KWH_NEXT, days: DAYS_NEXT, notesBeside: true, notes: ['w/c 15 Sep feed checked — EA', 'all 60 rows through', 'prices per site tariff card'] });
  raw.colW = { ...RAW_COLW }; raw.active = { r: 1, c: 1 };
  sheetOf(s, 'Inputs').cells.B3 = { ...sheetOf(s, 'Inputs').cells.B3, value: WEEK_NEXT };
  const costs = sheetOf(s, 'Costs').cells;
  costs.A1 = { ...costs.A1, value: 'Voltline — Austin site costs, w/c 22 Sep 2026' };
  for (const ref of ['A10', 'B10', 'A11', 'B11']) delete costs[ref];   // the cost-per-kWh line read the old page; the new page is not built yet
  delete s.settings.pageSetup;
});

/**
 * Build the project's Report over a fresh feed: the page S8done holds, or the same page in a seed's
 * clothing (the assessment's graders call it with the cluster's title, week and site names).
 */
export function buildReport(state, { title = REPORT_TITLE_NEXT, week = WEEK_NEXT, sites = SITES } = {}) {
  const R = REPORT_NEXT;
  const sh = sheetOf(state, 'Report');
  const c = {};
  c.A1 = { value: title, bold: true, fsz: TITLE_FSZ, ca: 8 };   // D7: Center Across Selection over A1:H1
  c.A2 = { value: UNITS_LINE, it: true };                        // C5: units stated once
  HEADERS_NEXT.forEach((h, i) => { const col = String.fromCharCode(65 + i); c[col + '4'] = { value: h, bold: true, ...(i >= 2 ? { align: 'r', wrap: true } : {}) }; });   // D6
  R.siteRows.forEach((r, i) => {
    const rr = 8 + i;   // Raw's site-totals row
    c['A' + r] = { value: sites[i] };
    c['B' + r] = { value: week };
    c['C' + r] = { formula: `=Raw!I${rr}`, fontColor: 'green', fmtStyle: 'comma', decimals: 0 };          // B2: links green
    c['D' + r] = { formula: `=Raw!J${rr}`, fontColor: 'green', fmtStyle: 'comma', decimals: 0 };
    c['E' + r] = { formula: `=C${r}*Inputs!$B$4`, fontColor: 'green', fmtStyle: 'comma', decimals: 0 };   // B4: the price lives on Inputs
    c['F' + r] = { formula: `=D${r}-E${r}`, fmtStyle: 'comma', decimals: 0 };                            // one formula per row, filled down
    c['G' + r] = { formula: `=D${r}/C${r}`, fmtStyle: 'currency', decimals: 2 };
    c['H' + r] = { formula: `=F${r}/D${r}`, fmtStyle: 'percent', decimals: 1 };
  });
  const t = R.totalRow, first = R.siteRows[0], last = R.siteRows[R.siteRows.length - 1];
  c['A' + t] = { value: 'Total' };
  for (const col of ['C', 'D', 'E', 'F']) c[col + t] = { formula: `=SUM(${col}${first}:${col}${last})`, fmtStyle: 'comma', decimals: 0 };
  c['G' + t] = { formula: `=D${t}/C${t}`, fmtStyle: 'currency', decimals: 2 };
  c['H' + t] = { formula: `=F${t}/D${t}`, fmtStyle: 'percent', decimals: 1 };
  for (const ref of ['D' + first, 'E' + first, 'F' + first, 'D' + t, 'E' + t, 'F' + t]) c[ref] = { ...c[ref], fmtStyle: 'currency', decimals: 0 };   // D4: $ on the first and total rows
  each(c, span('A', 'Z', t, t), x => { x.bold = true; x.bt = true; });   // D5: the total row bold with a top border
  // the daily block: this week's kWh by site and day, linked to Raw's by-day block, one formula filled across and down
  c['A' + R.dailyTitleRow] = { value: 'kWh sold by day', bold: true };
  c['A' + R.dailyHeaderRow] = { value: 'Site', bold: true };
  RAW_BYDAY.days.forEach((d, j) => { c[R.dayCols[j] + R.dailyHeaderRow] = { value: d, bold: true, align: 'r' }; });
  R.dailyRows.forEach((r, i) => {
    c['A' + r] = { value: sites[i], indent: 1 };
    R.dayCols.forEach((col, j) => { c[col + r] = { formula: `=Raw!${RAW_BYDAY.dayCols[j]}${RAW_BYDAY.firstRow + i}`, fontColor: 'green', fmtStyle: 'comma', decimals: 0 }; });
  });
  // the checks: three live differences that read zero when the page ties (F1)
  c['A' + R.checksRow] = { value: 'Checks', bold: true };
  CHECK_LINES_NEXT.forEach(([label, formula], i) => { const r = R.checksRow + 1 + i; c['A' + r] = { value: label }; c['B' + r] = { formula, fmtStyle: 'comma', decimals: 0 }; });
  sh.cells = c;
  sh.gridlines = false;                                   // A3
  const W12 = 12 * 7 + 5, W14 = 14 * 7 + 5;
  const fit = liveSheet(sh);
  sh.colW = { 1: fit.neededWidth(1, first, R.dailyRows[R.dailyRows.length - 1]), 2: W12, 3: W12, 4: W12, 5: W12, 6: W12, 7: W14, 8: W14 };
  const sized = new Sheet({ cells: clone(sh.cells), colW: sh.colW }); sized.select('A4:H4'); sized.autofitRows();
  if (sized.rowH[4] !== ROWH_DEFAULT) sh.rowH = { 4: sized.rowH[4] };
  sh.freeze = { r: 4, c: 1 };                              // C8
  state.settings.pageSetup = clone(REPORT_PAGE_SETUP);     // G1: landscape, one page, the heads repeated, file and date in the footer
  return state;
}
const S8done = derive(S8raw, s => buildReport(s));

export const STATES = { S0, S1a, S1b, S1c, S1d, S2a, S3a, S3b, S3c, S3d, S3e, S4a, S4b, S4c, S5a, S5b, S5c, S5d, S6a, S6b, S6c, S6d, S6e, S6f, S7a, S7b, S7c, S8raw, S8done };
/** The chain the lessons walk; S8raw and S8done are the project's fresh feed, not a step after S7c. */
export const STATE_ORDER = Object.keys(STATES);

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
    settings: { calcMode: ses.settings.calcMode, iterative: ses.settings.iterative, qat: ses.settings.qat.slice(), pageSetup: clone(ses.settings.pageSetup) },
  };
}
/** The engine's Page Setup default: what a state means when it says nothing about printing. */
export const PAGE_SETUP_DEFAULT = { orientation: 'portrait', scaling: 'adjust', adjustTo: 100, fitWide: 1, fitTall: 1, titlesRows: '', footer: { left: '', centre: '', right: '' }, printGridlines: false };
const normSettings = st => ({ ...(st || {}), pageSetup: { ...PAGE_SETUP_DEFAULT, ...((st || {}).pageSetup || {}), footer: { ...PAGE_SETUP_DEFAULT.footer, ...(((st || {}).pageSetup || {}).footer || {}) } } });

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
    if (!same(normGroups(sa.groups || NOG), normGroups(sb.groups || NOG))) out.push({ sheet: name, kind: 'groups', key: 'groups', a: sa.groups, b: sb.groups });
  }
  if (!same(normSettings(a.settings), normSettings(b.settings))) out.push({ sheet: '*', kind: 'settings', key: 'settings', a: a.settings, b: b.settings });
  return out;
}
