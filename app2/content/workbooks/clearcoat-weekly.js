// app2/content/workbooks/clearcoat-weekly.js — the Chapter 1 module workbook (Project Rinse).
// Clearcoat Express, the Austin cluster's weekly workbook, week of Sep 15, 2026 (script-ch1.md).
// One workbook that grows lesson by lesson: STATES[S0…] are the named snapshots every lesson chains
// through (lesson.state.before → solution → lesson.state.after; tests/module-states.test.js asserts
// it). Every state is DERIVED from the previous one by a pure patch, nothing is retyped, and
// stateOf() hands out deep clones so a runner can never corrupt the master. Where a lesson's effect
// is an engine operation (an insert, a width, an AutoFit, a date stamp) the patch runs that same
// operation on a live Sheet (viaEngine), so the state is what the engine makes of the keys.
//
// The arithmetic is deliberately car-wash simple: washes × the site's average ticket = revenue;
// washes × the $1.50 supplier rate = wash cost. Figures are deterministic (seeded once, rounded to
// fives) so checks can read the sheet and still assert exact numbers.
import { mulberry32 } from '../../engine/rng.js';
import { FMT_FIELDS, Sheet, ROWH_DEFAULT, normGroups, normCondFmt, stepFsz } from '../../engine/sheet.js';

export const CHAPTER = 1;
export const SITES = ['Domain', 'Mueller', 'Riverside', 'South Lamar', 'Airport'];
/** Each site's average ticket ($ a wash), from its POS. */
export const SITE_TICKET = { Domain: 14.5, Mueller: 13.5, Riverside: 13.75, 'South Lamar': 14, Airport: 14 };
/** The supplier's rate per wash (chemicals, water, power): Inputs!B4. */
export const COST_PER_WASH = 1.5;
/** Mon–Sat of last week (week of Sep 8) then this week (week of Sep 15, 2026). */
export const DAYS = ['08-Sep-26', '09-Sep-26', '10-Sep-26', '11-Sep-26', '12-Sep-26', '13-Sep-26',
  '15-Sep-26', '16-Sep-26', '17-Sep-26', '18-Sep-26', '19-Sep-26', '20-Sep-26'];
/** The case's "today": Monday of the reporting week (Ctrl+; stamps it; runners pass it as `today`). */
export const CASE_TODAY = Math.round((Date.UTC(2026, 8, 15) - Date.UTC(1899, 11, 30)) / 86400000);

const r2 = v => Math.round(v * 100) / 100;

/** Washes per site-day for a feed: deterministic from one seed, 150–350 rounded to fives. */
export const washesFor = (seed, days = DAYS) => {
  const rng = mulberry32(seed);
  const out = {};
  for (const site of SITES) { out[site] = days.map(() => Math.round((150 + rng() * 200) / 5) * 5); }
  return out;
};
export const WASHES = washesFor(20260915);
// the days the script names: South Lamar's Thursday last week (E41, 225 × $14 = $3,150), Riverside's
// Tuesday this week (C33, the "240 " typed as text), Airport's Saturday (the 250 the manager emails)
WASHES['South Lamar'][3] = 225;
WASHES.Riverside[7] = 240;
WASHES.Airport[11] = 250;

/** The Raw feed row for (site, dayIndex): 1-based sheet row. Site-major: Domain 2–13 … Airport 50–61. */
export const rawRow = (site, d) => 2 + SITES.indexOf(site) * 12 + d;
/** The old POS system's site codes (the stale column 1.4.1 deletes). */
export const OLD_CODES = { Domain: 'AUS-01', Mueller: 'AUS-02', Riverside: 'AUS-03', 'South Lamar': 'AUS-04', Airport: 'AUS-05' };
/** Cedar Park, the site that opens in 1.4.1: the manager's emailed week (not on the feed yet). */
export const CEDAR_PARK = { washes: 210, revenue: 2940, cost: 315 };
/** Where the feed's site-totals block sits on Raw (H6:M13): the live SUMs 1.3.4 snapshots and 1.4.1 watches. */
export const RAW_TOTALS = { headerRow: 7, firstRow: 8, totalRow: 13, cols: { site: 'H', washes: 'I', revenue: 'J', cost: 'K', prior: 'L', code: 'M' } };
/** The feed's by-day block on Raw (H30:N36): Mon–Sat of this week across I:N, the five feed sites down rows 32–36 (1.6.5 links the Report's daily block to it). */
export const RAW_BYDAY = { headerRow: 31, firstRow: 32, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], dayCols: ['I', 'J', 'K', 'L', 'M', 'N'] };
/** Where the Notes block lands beside the feed when 1.3.3 cuts it (J1, clear of the H-column notes). */
export const NOTES_BESIDE = 'J';

/** Last week's revenue per site, in dollars (what the accounting export sends as negative cents). */
export const priorWeekRevenue = (washes = WASHES, site) => r2([0, 1, 2, 3, 4, 5].reduce((t, d) => t + washes[site][d] * SITE_TICKET[site], 0));

/* ---------------- the S0 sheets ---------------- */

/**
 * The feed sheet for one fortnight: headers, 60 rows (5 sites × 12 days; revenue a live =C×D, wash
 * cost typed by the platform), the site-totals block H6:M13 (live SUMs over this week, last week's
 * revenue from the accounting export as negative cents, the old system's site code), this week's
 * washes by site and day (H30:N36), and the feed's Notes block (below the feed at A64, or beside it).
 */
function feedCells({ washes, days, notes, notesBeside = false }) {
  const cells = {
    A1: { value: 'Date', bold: true }, B1: { value: 'Site', bold: true }, C1: { value: 'Washes', bold: true },
    D1: { value: 'Avg ticket ($)', bold: true }, E1: { value: 'Revenue ($)', bold: true }, F1: { value: 'Wash cost ($)', bold: true },
  };
  for (const site of SITES) {
    for (let d = 0; d < 12; d++) {
      const r = rawRow(site, d);
      const w = washes[site][d];
      cells['A' + r] = { value: days[d] };
      cells['B' + r] = { value: site };
      cells['C' + r] = { value: w };
      cells['D' + r] = { value: SITE_TICKET[site] };
      cells['E' + r] = { formula: `=C${r}*D${r}` };
      cells['F' + r] = { value: r2(w * COST_PER_WASH) };
    }
  }
  const noteAt = notesBeside ? i => NOTES_BESIDE + (1 + i) : i => 'A' + (64 + i);
  notes.forEach((t, i) => { cells[noteAt(i)] = i === 0 ? { value: t, bold: true } : { value: t }; });
  cells.H6 = { value: 'Site totals (feed)', bold: true };
  cells.H7 = { value: 'Site', bold: true }; cells.I7 = { value: 'Washes', bold: true }; cells.J7 = { value: 'Revenue ($)', bold: true };
  cells.K7 = { value: 'Wash cost ($)', bold: true }; cells.L7 = { value: 'Prior week rev ($)', bold: true }; cells.M7 = { value: 'Old code', bold: true };
  SITES.forEach((site, i) => {
    const r = 8 + i, a = 8 + 12 * i, b = 13 + 12 * i;   // this week's rows
    cells['H' + r] = { value: site };
    cells['I' + r] = { formula: `=SUM(C${a}:C${b})` };
    cells['J' + r] = { formula: `=SUM(E${a}:E${b})` };
    cells['K' + r] = { formula: `=SUM(F${a}:F${b})` };
    cells['L' + r] = { value: -Math.round(priorWeekRevenue(washes, site) * 100) };   // the accounting export: negative, in cents (1.3.4 flips and scales it)
    cells['M' + r] = { value: OLD_CODES[site] };
  });
  cells.H13 = { value: 'Total', bold: true };
  for (const col of ['I', 'J', 'K', 'L']) cells[col + '13'] = { formula: `=SUM(${col}8:${col}12)` };
  cells['H' + (RAW_BYDAY.headerRow - 1)] = { value: 'Washes by day, this week (feed)', bold: true };
  cells['H' + RAW_BYDAY.headerRow] = { value: 'Site', bold: true };
  RAW_BYDAY.days.forEach((d, j) => { cells[RAW_BYDAY.dayCols[j] + RAW_BYDAY.headerRow] = { value: d, bold: true }; });
  SITES.forEach((site, i) => {
    const r = RAW_BYDAY.firstRow + i;
    cells['H' + r] = { value: site };
    RAW_BYDAY.dayCols.forEach((col, j) => { cells[col + r] = { formula: `=C${8 + 12 * i + j}` }; });
  });
  return cells;
}
/** The Raw feed's widths as the export sends them (1.2.3 resets A, B and C:F). */
const RAW_COLW = { 1: 76, 4: 92, 5: 88, 6: 96, 8: 120, 9: 76, 10: 92, 11: 100, 12: 128, 13: 72 };

/** S0's Raw: the week of Sep 15 feed as it arrived, with the plantings the chapter's lessons rely on. */
function rawCells() {
  const cells = feedCells({ washes: WASHES, days: DAYS, notes: ['Notes on this export, week of Sep 15', 'Week of Sep 8 feed checked by EA', 'Tickets per site POS', 'Wash cost at the supplier rate'] });
  for (const r of BLANK_F) delete cells['F' + r];             // five wash costs the managers left empty (1.2.1 finds the first; 1.3.1 zeros them)
  cells.B14 = { value: 'Muller', fill: 'yellow' };            // Mueller this week (1.3.2 fixes; flagged yellow)
  cells.B27 = { value: 'Riversid' };                          // Riverside last week (1.3.2)
  cells.B55 = { value: 'Airprot' };                           // Airport (1.3.2, Ctrl+F)
  cells.C33 = { value: '240 ', fill: 'yellow' };              // washes typed as text with a trailing space (1.3.2)
  cells.E33 = { value: r2(240 * SITE_TICKET.Riverside) };     // its revenue came through typed
  cells.E41 = { value: 81500, fill: 'yellow' };               // South Lamar's revenue, ten times too big (1.3.2)
  for (const col of ['C', 'D', 'E', 'F']) delete cells[col + '61'];   // Airport's Saturday never came through (1.3.1)
  cells.H1 = { value: 'Feed note: wash counts come from the tunnel controllers, tickets from each site POS, and the wash cost at the supplier rate of $1.50 a wash.' };   // 1.1.2 reads it with Ctrl+Shift+U
  cells.H3 = { value: 'draft', it: true };                    // a stray note (1.3.1 clears it)
  return cells;
}
export const BLANK_F = [12, 19, 28, 44, 47];

/** Sheet2: the half-started inputs sheet (why 1.1.1 renames it instead of deleting it). */
export const INPUT_ROWS = { week: 3, cost: 4, ticket: 5, washes: 6, sitesHead: 17, sites: [18, 19, 20, 21, 22] };
function sheet2Cells() {
  return {
    A1: { value: 'Inputs', bold: true },
    A3: { value: 'Week' }, B3: { value: 'Week of Sep 8' },                       // still last week's: 1.3.3 copies it, 1.3.5 replaces it everywhere
    A4: { value: 'Cost per wash ($)' }, B4: { value: 1.5 },
    A5: { value: 'Target avg ticket ($)' }, B5: { value: 14 },
    A6: { value: 'Est. washes this week (cluster)' }, B6: { value: 9000 },
    A7: { value: 'Card fee rate' }, B7: { value: 0.025 },
    A8: { value: 'Operating days this week' }, B8: { value: 6 },
    A9: { value: 'Sites reporting' }, B9: { value: 5 },
    A10: { value: 'Est. revenue this week ($)' }, B10: { formula: '=B5*B6' },
    A11: { value: 'Est. card fees ($)' }, B11: { formula: '=B10*B7' },
    A12: { value: 'Washes this week (feed)' }, B12: { formula: '=Raw!I13' },
    A13: { value: 'Revenue this week (feed)' }, B13: { formula: '=Raw!J13' },
    A14: { value: 'Est. wash cost this week ($)' }, B14: { formula: '=B6*1.5' },  // the cost typed inside a formula (1.6.1 points it at B4)
    A15: { value: 'Implied avg ticket ($)' }, B15: { formula: '=B10/B6', fontColor: 'blue' },   // a formula colored as an input (1.1.5)
    A17: { value: 'Sites', bold: true },
    A18: { value: 'Domain' }, A19: { value: 'Mueller' }, A20: { value: 'Riverside' }, A21: { value: 'South Lamar' }, A22: { value: 'Airport' },
  };
}

function oldWk37Cells() {
  const cells = {
    A1: { value: 'Clearcoat Express: Austin weekly site feed, week of Sep 8, 2026', bold: true },
    A2: { value: 'Date', bold: true }, B2: { value: 'Site', bold: true }, C2: { value: 'Washes', bold: true },
    D2: { value: 'Avg ticket ($)', bold: true }, E2: { value: 'Revenue ($)', bold: true },
  };
  for (const site of ['Domain', 'Mueller']) {
    for (let d = 0; d < 6; d++) {   // two sites × six days of last week, a stale twelve-row copy, then junk
      const r = 3 + (site === 'Domain' ? 0 : 6) + d;
      cells['A' + r] = { value: DAYS[d] }; cells['B' + r] = { value: site };
      cells['C' + r] = { value: WASHES[site][d] }; cells['D' + r] = { value: SITE_TICKET[site] };
      cells['E' + r] = { value: r2(WASHES[site][d] * SITE_TICKET[site]) };
    }
  }
  for (let r = 15; r <= 22; r++) cells['A' + r] = { value: '#N/A' };   // the export died half-way; the tab is junk
  return cells;
}

export const COST_ROWS = { Domain: 4, Mueller: 5, Riverside: 6, 'South Lamar': 7, Airport: 8 };
function costsCells() {
  return {
    A1: { value: 'Clearcoat Express: Austin site costs, week of Sep 8, 2026', bold: true },
    A3: { value: 'Site', bold: true }, B3: { value: 'Rent ($/wk)', bold: true }, C3: { value: 'Maintenance ($/wk)', bold: true },
    D3: { value: 'Card fees ($/wk)', bold: true }, E3: { value: 'Total ($/wk)', bold: true },
    A4: { value: 'Domain' }, B4: { value: 2100 }, C4: { value: 380 }, D4: { value: 260 }, E4: { formula: '=B4+C4+D4' },
    A5: { value: 'Mueller' }, B5: { value: 1750 }, /* C5 blank (1.2.4 finds it) */ D5: { value: 260 }, E5: { value: 2010 },
    A6: { value: 'Riverside' }, B6: { value: 1900 }, C6: { value: 420 }, D6: { value: 260 }, E6: { value: 2580 },
    A7: { value: 'South Lamar' }, B7: { value: 1650 }, /* C7 blank */ D7: { value: 260 }, E7: { value: 1910 },
    A8: { value: 'Airport' }, B8: { value: 2400 }, C8: { value: 510 }, D8: { value: 260 }, E8: { value: 3170 },
  };
}

/* ---------------- state helpers ---------------- */

const clone = v => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)));

/** Derive a new state from `base` by a pure mutator over a deep clone. */
function derive(base, fn) { const next = clone(base); fn(next); return next; }
const sheetOf = (state, name) => state.sheets.find(s => s.name === name);

const CELL_KEYS = ['value', 'formula', ...FMT_FIELDS];
const ZERO_DEFAULT = new Set(['indent', 'scale', 'ca', 'decimals', 'fsz']);
/** A live cell record back to the sparse authored shape (what it means, nothing it defaults). */
function sparse(c) {
  const out = {};
  for (const k of CELL_KEYS) {
    const v = c[k];
    if (v === undefined || v === null || v === false || k === 'txt') continue;
    if (ZERO_DEFAULT.has(k) && v === 0) continue;
    if (k === 'fmtStyle' && v === 'general') continue;
    out[k] = v;
  }
  if (out.formula) delete out.value;
  return Object.keys(out).length ? out : null;
}

/**
 * Run engine operations on one sheet of a state: `fn(S)` gets a live Sheet built from the spec, and
 * the cells, set widths, row heights, hidden rows and columns, freeze, outline and gridlines it
 * leaves are written back in the authored shape. The state's other sheets are untouched.
 */
function viaEngine(state, name, fn, { today } = {}) {
  const sh = sheetOf(state, name);
  const S = new Sheet({ cells: clone(sh.cells || {}), colW: sh.colW, rowH: sh.rowH, hiddenRows: sh.hiddenRows, hiddenCols: sh.hiddenCols,
    freeze: sh.freeze, groups: sh.groups, gridlines: sh.gridlines, today: today ? () => today : undefined });
  fn(S);
  const cells = {};
  for (const k in S.cells) { const c = sparse(S.cells[k]); if (c) cells[k] = c; }
  sh.cells = cells;
  const colW = {}; S.colW.forEach((w, c) => { if (c >= 1 && S.colSet[c]) colW[c] = w; });
  sh.colW = colW;
  const rowH = {}; S.rowH.forEach((h, r) => { if (r >= 1 && h !== ROWH_DEFAULT) rowH[r] = h; });
  if (Object.keys(rowH).length) sh.rowH = rowH; else delete sh.rowH;
  if (S.hiddenRows.size) sh.hiddenRows = [...S.hiddenRows]; else delete sh.hiddenRows;
  if (S.hiddenCols.size) sh.hiddenCols = [...S.hiddenCols]; else delete sh.hiddenCols;
  if (S.freeze.r || S.freeze.c) sh.freeze = { ...S.freeze }; else delete sh.freeze;
  if (S.groups.rows.length || S.groups.cols.length) sh.groups = clone(S.groups); else delete sh.groups;
  if (S.gridlines === false) sh.gridlines = false; else delete sh.gridlines;
  return state;
}
/** The engine's view of a sheet spec: the computed values its formulas show (the pasted-value states read them). */
const liveSheet = spec => new Sheet({ cells: clone(spec.cells), colW: spec.colW });
const span = (col1, col2, r1, r2) => { const out = []; for (let c = col1.charCodeAt(0); c <= col2.charCodeAt(0); c++) for (let r = r1; r <= r2; r++) out.push(String.fromCharCode(c) + r); return out; };
const each = (cells, refs, fn) => { for (const ref of refs) { cells[ref] = { ...(cells[ref] || {}) }; fn(cells[ref]); } };
const fmt = (cells, refs, style, decimals) => each(cells, refs, c => { c.fmtStyle = style; c.decimals = decimals; });

/* ---------------- module 1.1: open and set up ---------------- */

const S0 = {
  sheets: [
    { name: 'Raw', cells: rawCells(), colW: { ...RAW_COLW }, active: { r: 1, c: 1 } },
    { name: 'Sheet2', cells: sheet2Cells(), colW: { 1: 200 } },
    { name: 'Old wk37', cells: oldWk37Cells(), colW: { 1: 76, 2: 92 } },
    { name: 'Costs', cells: costsCells(), colW: { 1: 92, 2: 92, 3: 122, 4: 108, 5: 92 } },
  ],
  settings: { calcMode: 'automatic', iterative: false, qat: ['save', 'undo', 'redo'] },
};

// 1.1.1 The workbook the managers sent: Sheet2 renamed Inputs, Old wk37 deleted, a Report sheet added at the front
const S1a = derive(S0, s => {
  sheetOf(s, 'Sheet2').name = 'Inputs';
  s.sheets = s.sheets.filter(x => x.name !== 'Old wk37');
  s.sheets.unshift({ name: 'Report', cells: {}, active: { r: 1, c: 1 } });
});
// 1.1.2 Know the screen: a tour; nothing on the sheets changes (S1a → S1a)

// 1.1.3 The Ribbon by keyboard: gridlines off on Report (a page someone reads)
const S1b = derive(S1a, s => { sheetOf(s, 'Report').gridlines = false; });

// 1.1.4 Set Excel up like an analyst: iterative calc on, Enter stays put, four formatting commands on the QAT
const S1c = derive(S1b, s => {
  s.settings.iterative = true;
  s.settings.enterMoves = false;
  s.settings.qat = ['save', 'undo', 'redo', 'fontColor', 'fillColor', 'borders', 'decDecimal'];
});

// 1.1.5 Color-code the workbook: on Inputs, typed numbers blue, links green, formulas automatic
export const INPUTS_TYPED = ['B4', 'B5', 'B6', 'B7', 'B8', 'B9'];
export const INPUTS_LINKS = ['B12', 'B13'];
export const INPUTS_FORMULAS = ['B10', 'B11', 'B14', 'B15'];
const S1d = derive(S1c, s => {
  const c = sheetOf(s, 'Inputs').cells;
  each(c, INPUTS_TYPED, x => { x.fontColor = 'blue'; });
  each(c, INPUTS_LINKS, x => { x.fontColor = 'green'; });
  each(c, INPUTS_FORMULAS, x => { delete x.fontColor; });
});

/* ---------------- module 1.2: move and select ---------------- */
// 1.2.1 and 1.2.2 move and select only (S1d → S1d)

// 1.2.3 Rows, columns and cells: on Raw, B AutoFit, A at 11, C:F at 11 by F4, row 1 at 20pt, the figure
// headers right-aligned, a note row inserted above A67, the long note in A64 wrapped; on Costs a
// Utilities column inserted and deleted again (no net change)
export const RAW_NOTE_INSERTED = 'Airport Sat missing - emailed manager';
const S2a = derive(S1d, s => {
  viaEngine(s, 'Raw', S => {
    S.select('B1:B100'); S.colW[2] = Math.max(S.neededWidth(2), 64); S.colSet[2] = true;   // AutoFit Column Width over the whole column
    S.select('A1:A100'); S.setColWidth(11);
    S.select('C1:F100'); S.setColWidth(11);                                            // F4 repeats the width
    S.select('A1:Z1'); S.setRowHeight(20);
    S.select('C1:F1'); S.setAlign('r');
    S.select('A67:Z67'); S.insert('r'); S.setCell('A67', { value: RAW_NOTE_INSERTED });
    S.select('A64'); S.toggleWrap(); S.select('A64'); S.autofitRows();
  });
});

// 1.2.4 What's typed and what's calculated: the Costs constants colored blue via Go To Special
export const COSTS_CONSTANTS = ['B4', 'C4', 'D4', 'B5', 'D5', 'B6', 'C6', 'D6', 'B7', 'D7', 'B8', 'C8', 'D8', 'E5', 'E6', 'E7', 'E8'];
const S2b = derive(S2a, s => {
  const c = sheetOf(s, 'Costs').cells;
  each(c, COSTS_CONSTANTS, x => { x.fontColor = 'blue'; });
});

/* ---------------- module 1.3: enter, edit, copy and fill ---------------- */

/** The four figures the manager emailed for Airport's Saturday (1.3.1 types them). */
export const MISSING_DAY = { washes: 250, ticket: 14, revenue: 3500, cost: 375 };
// 1.3.1 Enter the missing day: Airport's Saturday typed in, the five blank wash costs zeroed, the stray
// note cleared, a two-line note in H4, and on Inputs the units line and the cost's source
const S3a = derive(S2b, s => {
  const c = sheetOf(s, 'Raw').cells;
  c.C61 = { value: MISSING_DAY.washes }; c.D61 = { value: MISSING_DAY.ticket }; c.E61 = { value: MISSING_DAY.revenue }; c.F61 = { value: MISSING_DAY.cost };
  for (const r of BLANK_F) c['F' + r] = { value: 0 };
  c.H3 = { it: true };   // Delete clears the note and leaves its italic behind, as Excel does
  c.H4 = { value: 'Airport Sat missing\nemailed manager 9/15', wrap: true };   // Alt+Enter turns wrap on, as Excel does
  const inp = sheetOf(s, 'Inputs').cells;
  inp.A2 = { value: 'USD unless stated' };
  inp.C4 = { value: 'per supplier quote' };
});

// 1.3.2 Fix it in place: two typos and a misspelled Airport, the text number, the wrong figure, the yellow flags cleared
export const WRONG_FIGURE = { ref: 'E41', wrong: 81500, right: 3150 };
const S3b = derive(S3a, s => {
  const c = sheetOf(s, 'Raw').cells;
  c.B14 = { value: 'Mueller' };
  c.B27 = { value: 'Riverside' };
  c.B55 = { value: 'Airport' };
  c.C33 = { value: 240 };
  c.E41 = { value: WRONG_FIGURE.right };
});

/** The Report page's title and units line, typed by the learner in 1.3.3 (a plain hyphen: every key on every keyboard). */
export const REPORT_TITLE = 'Clearcoat - Austin Weekly KPI Report, Week of Sep 15, 2026';
export const UNITS_LINE = 'USD unless stated';
export const STALE_WEEK = 'Week of Sep 8', THIS_WEEK = 'Week of Sep 15';

// 1.3.3 Copy, cut, paste, fill: the Report skeleton from Raw and Inputs; the Notes block cut to beside the feed
const S3c = derive(S3b, s => {
  const raw = sheetOf(s, 'Raw').cells, rep = sheetOf(s, 'Report').cells;
  rep.A1 = { value: REPORT_TITLE };
  rep.A2 = { value: UNITS_LINE };
  rep.A4 = { value: 'Site' }; rep.B4 = { value: 'Week' };
  rep.C4 = { value: 'Washes', bold: true }; rep.D4 = { value: 'Revenue ($)', bold: true }; rep.E4 = { value: 'Wash cost ($)', bold: true };   // pasted from Raw I7:K7
  SITES.forEach((site, i) => { rep['A' + (5 + i)] = { value: site }; rep['B' + (5 + i)] = { value: STALE_WEEK }; });   // sites from Inputs, the week label from Inputs!B3 filled down
  rep.A12 = { value: 'Washes by day' };
  rep.A13 = { value: 'Week' }; for (const col of ['B', 'C', 'D', 'E', 'F', 'G']) rep[col + '13'] = { value: STALE_WEEK };   // one label, filled right
  rep.A14 = { value: 'Day' }; rep.A15 = { value: 'Date' };
  SITES.forEach((site, i) => { rep['A' + (16 + i)] = { value: site }; });
  // the Notes block (five rows since 1.2.3's insert) cut from under the feed to J1:J5
  for (let i = 0; i < 5; i++) { raw[NOTES_BESIDE + (1 + i)] = raw['A' + (64 + i)]; delete raw['A' + (64 + i)]; }
});
/** Where the spare cells of 1.3.4 go (the −1 and the 100): typed, used, deleted. */
export const SPARE = 'K4';

// 1.3.4 Paste Special: this week's totals snapshotted as values, last week's revenue pasted as values then
// flipped (× −1) and scaled (÷ 100) in place, the headers dressed by Paste Formats, the total row pasted
// live, the sensitivity block started and the site list transposed across it
const S3d = derive(S3c, s => {
  const rep = sheetOf(s, 'Report').cells;
  const live = liveSheet(sheetOf(s, 'Raw'));
  rep.F4 = { value: 'Gross profit ($)', bold: true }; rep.G4 = { value: 'Avg ticket ($/wash)', bold: true };
  rep.H4 = { value: 'Prior week rev ($)', bold: true }; rep.I4 = { value: 'Old code', bold: true };
  SITES.forEach((site, i) => {
    const r = 5 + i, rr = 8 + i;
    rep['C' + r] = { value: live.value('I' + rr) }; rep['D' + r] = { value: live.value('J' + rr) }; rep['E' + r] = { value: live.value('K' + rr) };
    rep['H' + r] = { value: (live.value('L' + rr) * -1) / 100 };   // the engine's own arithmetic: × −1, then ÷ 100
    rep['I' + r] = { value: OLD_CODES[site] };
  });
  rep.A10 = { value: 'Total' };
  rep.C10 = { formula: '=SUM(C5:C9)' }; rep.D10 = { formula: '=SUM(D5:D9)' }; rep.E10 = { formula: '=SUM(E5:E9)' };   // Raw I13:K13 pasted plain: the references follow
  rep.A22 = { value: 'Wash cost sensitivity ($/wk)' }; rep.A23 = { value: 'Cost per wash' };
  SITES.forEach((site, i) => { rep[String.fromCharCode(66 + i) + '23'] = { value: site }; });   // A5:A9 transposed
});

// 1.3.5 Names, notes and the small keys: the week label current on Report and Inputs, the cost per wash
// named and sourced in a note, a date stamp beside it, Mon–Sat and the dates filled as series
export const NAMES = { CostPerWash: 'Inputs!$B$4' };
export const COST_NOTE = 'Supplier quote, Sep 15 2026';
const S3e = derive(S3d, s => {
  const rep = sheetOf(s, 'Report').cells;
  for (let i = 0; i < 5; i++) rep['B' + (5 + i)] = { value: THIS_WEEK };
  for (const col of ['B', 'C', 'D', 'E', 'F', 'G']) rep[col + '13'] = { value: THIS_WEEK };
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((d, i) => { rep[String.fromCharCode(66 + i) + '14'] = { value: d }; });
  for (let i = 0; i < 6; i++) rep[String.fromCharCode(66 + i) + '15'] = { value: 15 + i };
  const inp = sheetOf(s, 'Inputs');
  inp.cells.B3 = { value: THIS_WEEK };
  inp.cells.B4 = { ...inp.cells.B4, cmt: COST_NOTE };
  viaEngine(s, 'Inputs', S => { S.dateStamp(4, 4); }, { today: CASE_TODAY });   // Ctrl+; in D4
  s.names = { ...NAMES };
});

/* ---------------- module 1.4: structure ---------------- */

// 1.4.1 Rows and columns that keep the totals honest: Cedar Park's row inside the block, the Old code column gone, a Margin % column inserted at H
const S4a = derive(S3e, s => {
  viaEngine(s, 'Report', S => {
    S.select('A9:Z9'); S.insert('r');
    S.setCell('A9', { value: 'Cedar Park' }); S.setCell('B9', { value: THIS_WEEK });
    S.setCell('C9', { value: CEDAR_PARK.washes }); S.setCell('D9', { value: CEDAR_PARK.revenue }); S.setCell('E9', { value: CEDAR_PARK.cost });
    S.select('I1:I100'); S.remove('c');
    S.select('H1:H100'); S.insert('c'); S.setCell('H4', { value: 'Margin %', bold: true });
  });
});

// 1.4.2 The page's columns: the days at 12, the comparison columns at 14, the label column fit to its sites,
// the headers wrapped and row 4 AutoFit, the title row at 24pt
const S4b = derive(S4a, s => {
  viaEngine(s, 'Report', S => {
    S.select('B1:G100'); S.setColWidth(12);
    S.select('H1:I100'); S.setColWidth(14);
    S.colW[1] = Math.max(S.neededWidth(1, 5, 11), 16); S.colSet[1] = true;   // AutoFit on A5:A11 only
    S.select('B4:I4'); S.toggleWrap(); S.select('A4:Z4'); S.autofitRows();
    S.select('A1'); S.setRowHeight(24);
  });
});

// 1.4.3 Hide, group, freeze: the two working columns grouped (not hidden), the heads frozen at B5
const S4c = derive(S4b, s => {
  const sh = sheetOf(s, 'Report');
  sh.groups = { rows: [], cols: [{ c1: 5, c2: 6, collapsed: false }] };
  sh.freeze = { r: 4, c: 1 };
});

/* ---------------- module 1.5: format ---------------- */

/** The Report's site rows and total row, its money columns, and the blocks later lessons fill. */
export const REPORT = { siteRows: [5, 6, 7, 8, 9, 10], totalRow: 11, cedarRow: 9, money: ['D', 'E', 'F'], dailyTitleRow: 13, dailyRows: [17, 18, 19, 20, 21], dayCols: ['B', 'C', 'D', 'E', 'F', 'G'], summaryRow: 26, checksRow: 33, lastCol: 'I' };
export const TITLE_FSZ = stepFsz(null, 1);   // one step up the ladder (Alt H F G)
export const SCENARIO_PRICES = [1.25, 1.5, 1.75];   // 1.6.3's three costs per wash (J4:L4)

// 1.5.1 Numbers a banker can read: the desk number format (Comma, no decimals: #,##0_);(#,##0)) on the
// figures, $ on the first and total rows, avg ticket to cents, margin to one decimal, the daily block as counts
const S5a = derive(S4c, s => {
  const c = sheetOf(s, 'Report').cells;
  fmt(c, span('C', 'F', 5, 11), 'comma', 0);
  fmt(c, span('I', 'I', 6, 10), 'comma', 0);
  fmt(c, ['D5', 'E5', 'F5', 'I5', 'D11', 'E11', 'F11'], 'currency', 0);
  fmt(c, span('G', 'G', 5, 11), 'currency', 2);
  fmt(c, span('H', 'H', 5, 11), 'percent', 1);
  fmt(c, span('B', 'G', 17, 21), 'comma', 0);
  const inp = sheetOf(s, 'Inputs').cells;
  inp.B4 = { ...inp.B4, fmtStyle: 'currency', decimals: 2 };
});

// 1.5.2 Fonts, fills, borders: the title bold and one size up, the header and total rows bold, the total row's top border, the input block tinted
const S5b = derive(S5a, s => {
  const c = sheetOf(s, 'Report').cells;
  c.A1 = { ...c.A1, bold: true, fsz: TITLE_FSZ };
  each(c, span('A', 'Z', 4, 4), x => { x.bold = true; });
  each(c, span('A', 'Z', 11, 11), x => { x.bold = true; x.bt = true; });
  const inp = sheetOf(s, 'Inputs').cells;
  each(inp, span('B', 'B', 3, 6), x => { x.fill = 'blue'; });
});

// 1.5.3 Alignment and titles: the title centered across A1:I1 (never merged), headers right over their numbers,
// the units line italic, the daily block's lines indented, the cost's source note wrapped
const S5c = derive(S5b, s => {
  const c = sheetOf(s, 'Report').cells;
  c.A1 = { ...c.A1, ca: 9 };
  each(c, span('C', 'I', 4, 4), x => { x.align = 'r'; });
  c.A2 = { ...c.A2, it: true };
  each(c, span('A', 'A', 14, 21), x => { x.indent = 1; });
  const inp = sheetOf(s, 'Inputs').cells;
  inp.C4 = { ...inp.C4, wrap: true };
});

// 1.5.4 The style pass: the Report's figure block format pasted onto Costs, the grids off Costs, Inputs and
// Raw's totals block, Costs' total column bold, Costs' figure columns and Inputs' column B at width 12
const S5d = derive(S5c, s => {
  const rep = sheetOf(s, 'Report').cells, c = sheetOf(s, 'Costs').cells;
  // Paste Special Formats of Report C4:F9 onto Costs B3:E8, cell for cell (formats only, values kept)
  for (let dr = 0; dr <= 5; dr++) for (let dc = 0; dc <= 3; dc++) {
    const src = rep[String.fromCharCode(67 + dc) + (4 + dr)] || {}, ref = String.fromCharCode(66 + dc) + (3 + dr);
    const keep = c[ref] || {};
    const out = {};
    for (const k of FMT_FIELDS) if (k !== 'cmt' && k !== 'txt' && src[k] !== undefined) out[k] = src[k];
    if (keep.value !== undefined) out.value = keep.value;
    if (keep.formula) out.formula = keep.formula;
    c[ref] = out;
  }
  each(c, span('E', 'E', 4, 8), x => { x.bold = true; });
  viaEngine(s, 'Costs', S => { S.select('B1:E100'); S.setColWidth(12); });
  viaEngine(s, 'Inputs', S => { S.select('B1:B100'); S.setColWidth(12); });
});
/** What 1.5.4 plants at its start: an all-borders grid over Costs A3:E8, Inputs A3:C15 and Raw's totals block H7:K13. */
export const PLANT_GRIDS = Object.fromEntries([
  ...span('A', 'E', 3, 8).map(ref => ['Costs!' + ref, { ball: true }]),
  ...span('A', 'C', 3, 15).map(ref => ['Inputs!' + ref, { ball: true }]),
  ...span('H', 'K', 7, 13).map(ref => ['Raw!' + ref, { ball: true }]),
]);

/* ---------------- module 1.6: formulas ---------------- */

// 1.6.1 Point, don't type: gross profit, avg ticket and margin for Domain by pointing, filled down the six
// sites, the gross-profit body put back in the desk format; on Inputs the cost reads its cell, then its name
const S6a = derive(S5d, s => {
  const c = sheetOf(s, 'Report').cells;
  for (const r of REPORT.siteRows) {
    c['F' + r] = { ...c['F' + r], formula: `=D${r}-E${r}` };
    c['G' + r] = { ...c['G' + r], formula: `=D${r}/C${r}` };
    c['H' + r] = { ...c['H' + r], formula: `=F${r}/D${r}` };
  }
  const inp = sheetOf(s, 'Inputs').cells;
  inp.B14 = { ...inp.B14, formula: '=B6*CostPerWash' };
});

// 1.6.2 SUM family and AutoSum: the gross-profit total by Alt+= over the block, the total row's avg ticket
// and margin, a week summary (AVERAGE, MAX, MIN, COUNT, COUNTA)
export const SUMMARY_LINES = [
  ['Average washes per site', '=AVERAGE(C5:C10)', 'comma'], ['Best site (washes)', '=MAX(C5:C10)', 'comma'], ['Lowest site (washes)', '=MIN(C5:C10)', 'comma'],
  ['Sites with figures', '=COUNT(C5:C10)', 'general'], ['Sites listed', '=COUNTA(A5:A10)', 'general'],
];
const S6b = derive(S6a, s => {
  const c = sheetOf(s, 'Report').cells;
  c.F11 = { ...c.F11, formula: '=SUM(F5:F10)' };
  c.G11 = { ...c.G11, formula: '=D11/C11' }; c.H11 = { ...c.H11, formula: '=F11/D11' };
  c['A' + REPORT.summaryRow] = { value: 'Week summary', bold: true };
  SUMMARY_LINES.forEach(([label, formula, style], i) => { const r = REPORT.summaryRow + 1 + i; c['A' + r] = { value: label }; c['B' + r] = { formula, ...(style === 'comma' ? { fmtStyle: 'comma', decimals: 0 } : {}) }; });
});

// 1.6.3 Anchors: the wash-cost scenario grid beside the report (sites down, three prices across), one formula
// with mixed anchors filled both ways; the old sensitivity stub under the daily table cleared
const S6c = derive(S6b, s => {
  const c = sheetOf(s, 'Report').cells;
  c.J3 = { value: 'Wash cost at price ($/wk)', bold: true };
  SCENARIO_PRICES.forEach((p, j) => { const col = String.fromCharCode(74 + j); c[col + '4'] = { value: p, fontColor: 'blue', fmtStyle: 'currency', decimals: 2 }; });
  for (const r of REPORT.siteRows) for (let j = 0; j < 3; j++) { const col = String.fromCharCode(74 + j); c[col + r] = { formula: `=$C${r}*${col}$4`, fmtStyle: 'comma', decimals: 0 }; }
  for (const ref of span('A', 'F', 23, 24)) delete c[ref];
});

// 1.6.4 Link across sheets: the site figures link to Raw's totals (green), wash cost is washes × the cost per
// wash on Inputs, anchored; Cedar Park's emailed washes and revenue stay typed
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
/** What 1.6.5 plants: the assistant filled rows 18–21 and retyped Riverside's Thursday (E19) over its formula. */
export const PLANT_DAILY = (() => {
  const out = {};
  REPORT.dailyRows.slice(1).forEach((r, i) => REPORT.dayCols.forEach((col, j) => { out[`Report!${col}${r}`] = { formula: `=Raw!${RAW_BYDAY.dayCols[j]}${RAW_BYDAY.firstRow + 1 + i}`, fmtStyle: 'comma', decimals: 0 }; }));
  out['Report!E19'] = { value: WASHES.Riverside[9], fmtStyle: 'comma', decimals: 0 };   // Thursday retyped: the right number, dead
  return out;
})();

// 1.6.6 Read the error, follow the trail: the Costs totals are live formulas again, black, the card fee typed,
// and the cost-per-wash line divides by the washes linked from the Report
const S6f = derive(S6e, s => {
  const c = sheetOf(s, 'Costs').cells;
  for (const r of [5, 6, 7, 8]) { c['E' + r] = { ...c['E' + r], formula: `=B${r}+C${r}+D${r}` }; delete c['E' + r].value; delete c['E' + r].fontColor; }
  c.D7 = { ...c.D7, value: 260 };
  c.A9 = { value: 'Total', bold: true }; c.E9 = { formula: '=SUM(E4:E8)', bold: true, fmtStyle: 'comma', decimals: 0 };
  c.A10 = { value: 'Cost per wash, site costs ($)' }; c.B10 = { formula: '=E9/B11', fmtStyle: 'currency', decimals: 2 };
  c.A11 = { value: 'Washes this week' }; c.B11 = { formula: '=Report!C11', fontColor: 'green', fmtStyle: 'comma', decimals: 0 };
});
/** What 1.6.6 plants: five errors on Costs (#REF!, #NAME?, #VALUE! from a text figure, #N/A, #DIV/0!) around the same lines, the totals colored blue. */
export const PLANT_COSTS_ERRORS = {
  'Costs!E5': { formula: '=B5+C5+#REF!', fontColor: 'blue', fmtStyle: 'comma', decimals: 0 },
  'Costs!E6': { formula: '=SUMM(B6:D6)', fontColor: 'blue', fmtStyle: 'comma', decimals: 0 },
  'Costs!D7': { value: 'tbc', fontColor: 'blue' }, 'Costs!E7': { formula: '=B7+C7+D7', fontColor: 'blue', fmtStyle: 'comma', decimals: 0 },
  'Costs!E8': { formula: '=VLOOKUP("Airport ",A4:D8,4,FALSE)', fontColor: 'blue', fmtStyle: 'comma', decimals: 0 },
  'Costs!A9': { value: 'Total', bold: true }, 'Costs!E9': { formula: '=SUM(E4:E8)', bold: true, fmtStyle: 'comma', decimals: 0 },
  'Costs!A10': { value: 'Cost per wash, site costs ($)' }, 'Costs!B10': { formula: '=E9/B12', fmtStyle: 'currency', decimals: 2 },
  'Costs!A11': { value: 'Washes this week' }, 'Costs!B11': { formula: '=Report!C11', fontColor: 'green', fmtStyle: 'comma', decimals: 0 },
};

/* ---------------- module 1.7: present and audit ---------------- */

/** The Report's print set-up after 1.7.1 (G1): landscape, one page, the heads repeated, file and date in the footer. */
export const REPORT_PAGE_SETUP = { orientation: 'landscape', scaling: 'fit', adjustTo: 100, fitWide: 1, fitTall: 1, titlesRows: '$1:$4', footer: { left: '&[File]', centre: '', right: '&[Date]' }, printGridlines: false };
const S7a = derive(S6f, s => { s.settings.pageSetup = clone(REPORT_PAGE_SETUP); });

// 1.7.2 The checks row: three live differences that read zero when the page ties (F1), in the desk number format
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

// 1.7.3 Hardcode hunt: the CFO's markup fixed; what stays changed is Cedar Park's emailed row shown blue (B1)
const S7c = derive(S7b, s => {
  const c = sheetOf(s, 'Report').cells;
  for (const ref of ['C9', 'D9', 'E9']) c[ref] = { ...c[ref], fontColor: 'blue' };
});
/** Mueller's washes last week: the stale literal 1.7.3 plants in G6. */
export const MUELLER_LAST_WEEK = [0, 1, 2, 3, 4, 5].reduce((t, d) => t + WASHES.Mueller[d], 0);
/** What 1.7.3 plants: seven of the eight faults (the eighth, Cedar Park's black inputs, is already in S7b). */
export const PLANT_AUDIT = (() => {
  const out = {};
  out['Report!G6'] = { formula: `=D6/${MUELLER_LAST_WEEK}`, fmtStyle: 'currency', decimals: 2 };   // a literal where C6 belongs
  out['Report!E18'] = { value: WASHES.Mueller[9], fontColor: 'green', fmtStyle: 'comma', decimals: 0 };   // Mueller's Thursday retyped
  out['Report!A1'] = { value: '            ' + REPORT_TITLE, bold: true, fsz: TITLE_FSZ };              // centered by padding, Center Across gone
  out['Report!A2'] = null;                                                                            // the units line gone
  for (const ref of span('B', 'G', 15, 21)) out['Report!' + ref] = { ball: true };                   // a grid over the daily table…
  out['Report!#gridlines'] = true;                                                                    // …with gridlines on
  out['Report!#hiddenCols'] = [9];                                                                    // Prior week rev hidden
  return out;
})();
const AUDIT_CELLS = ['G6', 'E18', 'A1', 'A2', ...span('B', 'G', 15, 21), 'C9', 'D9', 'E9'];
/** The cells 1.7.3 may change (its graders diff against S7c and allow nothing else). */
export const AUDIT_ALLOWED = AUDIT_CELLS;

/* ---------------- module 1.8: the next feed (project, assessment) ---------------- */

/** Mon–Sat of the week of Sep 15 then the week of Sep 22, 2026: the fortnight the next export covers. */
export const DAYS_NEXT = ['15-Sep-26', '16-Sep-26', '17-Sep-26', '18-Sep-26', '19-Sep-26', '20-Sep-26',
  '22-Sep-26', '23-Sep-26', '24-Sep-26', '25-Sep-26', '26-Sep-26', '27-Sep-26'];
export const WASHES_NEXT = washesFor(20260922, DAYS_NEXT);
export const WEEK_NEXT = 'Week of Sep 22';
export const REPORT_TITLE_NEXT = 'Clearcoat - Austin Weekly KPI Report, Week of Sep 22, 2026';
/**
 * The project's page (1.8): the shape the chapter built, simplified to what one sitting makes: five
 * feed sites (no Cedar Park), the total row, the daily block, the checks. No scenario grid, no week
 * summary. Rows and columns the project's goals and the assessment's graders read.
 */
export const REPORT_NEXT = { siteRows: [5, 6, 7, 8, 9], totalRow: 10, money: ['D', 'E', 'F'], lastCol: 'H',
  dailyTitleRow: 12, dailyHeaderRow: 13, dailyRows: [14, 15, 16, 17, 18], dayCols: ['B', 'C', 'D', 'E', 'F', 'G'], checksRow: 20 };
export const CHECK_LINES_NEXT = [
  ['Report revenue ties to the feed', '=D10-Raw!J13'],
  ['Sites sum to the total', '=SUM(C5:C9)-C10'],
  ['Margin within 0-100%', '=IF(AND(H10>=0,H10<=1),0,1)'],
];
export const HEADERS_NEXT = ['Site', 'Week', 'Washes', 'Revenue ($)', 'Wash cost ($)', 'Gross profit ($)', 'Avg ticket ($/wash)', 'Margin %'];

// S8raw: the next feed, in the shape the chapter left the file: Report blank, Inputs and Costs as 1.7 left
// them but dated for the new week, the QAT and the settings kept
const S8raw = derive(S7c, s => {
  s.sheets = [{ name: 'Report', cells: {}, active: { r: 1, c: 1 } }, sheetOf(s, 'Raw'), sheetOf(s, 'Inputs'), sheetOf(s, 'Costs')];
  const raw = sheetOf(s, 'Raw');
  raw.cells = feedCells({ washes: WASHES_NEXT, days: DAYS_NEXT, notesBeside: true, notes: ['Notes on this export, week of Sep 22', 'Week of Sep 15 feed checked by EA', 'All 60 rows through', 'Tickets per site POS', 'Wash cost at the supplier rate'] });
  raw.colW = { ...sheetOf(S7c, 'Raw').colW }; raw.active = { r: 1, c: 1 };
  delete raw.rowH;
  const inp = sheetOf(s, 'Inputs').cells;
  inp.B3 = { ...inp.B3, value: WEEK_NEXT };
  const costs = sheetOf(s, 'Costs').cells;
  costs.A1 = { ...costs.A1, value: 'Clearcoat Express: Austin site costs, week of Sep 22, 2026' };
  for (const ref of ['A10', 'B10', 'A11', 'B11']) delete costs[ref];   // the cost-per-wash line read the old page; the new page is not built yet
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
  HEADERS_NEXT.forEach((h, i) => { const col = String.fromCharCode(65 + i); c[col + '4'] = { value: h, bold: true, ...(i >= 2 ? { align: 'r', wrap: true } : {}) }; });
  R.siteRows.forEach((r, i) => {
    const rr = 8 + i;   // Raw's site-totals row
    c['A' + r] = { value: sites[i] };
    c['B' + r] = { value: week };
    c['C' + r] = { formula: `=Raw!I${rr}`, fontColor: 'green', fmtStyle: 'comma', decimals: 0 };
    c['D' + r] = { formula: `=Raw!J${rr}`, fontColor: 'green', fmtStyle: 'comma', decimals: 0 };
    c['E' + r] = { formula: `=C${r}*Inputs!$B$4`, fontColor: 'green', fmtStyle: 'comma', decimals: 0 };
    c['F' + r] = { formula: `=D${r}-E${r}`, fmtStyle: 'comma', decimals: 0 };
    c['G' + r] = { formula: `=D${r}/C${r}`, fmtStyle: 'currency', decimals: 2 };
    c['H' + r] = { formula: `=F${r}/D${r}`, fmtStyle: 'percent', decimals: 1, it: true };
  });
  const t = R.totalRow, first = R.siteRows[0], last = R.siteRows[R.siteRows.length - 1];
  c['A' + t] = { value: 'Total' };
  for (const col of ['C', 'D', 'E', 'F']) c[col + t] = { formula: `=SUM(${col}${first}:${col}${last})`, fmtStyle: 'comma', decimals: 0 };
  c['G' + t] = { formula: `=D${t}/C${t}`, fmtStyle: 'currency', decimals: 2 };
  c['H' + t] = { formula: `=F${t}/D${t}`, fmtStyle: 'percent', decimals: 1, it: true };
  for (const ref of ['D' + first, 'E' + first, 'F' + first, 'D' + t, 'E' + t, 'F' + t]) c[ref] = { ...c[ref], fmtStyle: 'currency', decimals: 0 };   // D4
  each(c, span('A', 'Z', t, t), x => { x.bold = true; x.bt = true; });   // D5: the total row bold with a top border (the whole row, Shift+Space, as S5b marks it)
  // the daily block: this week's washes by site and day, linked to Raw's by-day block, one formula filled across and down
  c['A' + R.dailyTitleRow] = { value: 'Washes by day', bold: true };
  c['A' + R.dailyHeaderRow] = { value: 'Site', bold: true };
  RAW_BYDAY.days.forEach((d, j) => { c[R.dayCols[j] + R.dailyHeaderRow] = { value: d, bold: true, align: 'r' }; });
  R.dailyRows.forEach((r, i) => {
    c['A' + r] = { value: sites[i], indent: 1 };
    R.dayCols.forEach((col, j) => { c[col + r] = { formula: `=Raw!${RAW_BYDAY.dayCols[j]}${RAW_BYDAY.firstRow + i}`, fontColor: 'green', fmtStyle: 'comma', decimals: 0 }; });
  });
  // the checks: three live differences that read zero when the page ties (F1)
  c['A' + R.checksRow] = { value: 'Checks', bold: true };
  CHECK_LINES_NEXT.forEach(([label, formula], i) => { const r = R.checksRow + 1 + i; c['A' + r] = { value: label, indent: 1 }; c['B' + r] = { formula, fmtStyle: 'comma', decimals: 0 }; });
  sh.cells = c;
  sh.gridlines = false;                                   // A3
  const W12 = 12 * 7 + 5, W14 = 14 * 7 + 5;
  const fit = liveSheet(sh);
  sh.colW = { 1: fit.neededWidth(1, first, R.dailyRows[R.dailyRows.length - 1]), 2: W12, 3: W12, 4: W12, 5: W12, 6: W12, 7: W14, 8: W14 };
  const sized = new Sheet({ cells: clone(sh.cells), colW: sh.colW }); sized.select('A4:H4'); sized.autofitRows();
  if (sized.rowH[4] !== ROWH_DEFAULT) sh.rowH = { 4: sized.rowH[4] };
  sh.freeze = { r: 4, c: 1 };                              // C8
  state.settings.pageSetup = clone(REPORT_PAGE_SETUP);     // G1
  return state;
}
const S8done = derive(S8raw, s => buildReport(s));

export const STATES = { S0, S1a, S1b, S1c, S1d, S2a, S2b, S3a, S3b, S3c, S3d, S3e, S4a, S4b, S4c, S5a, S5b, S5c, S5d, S6a, S6b, S6c, S6d, S6e, S6f, S7a, S7b, S7c, S8raw, S8done };
/** The chain the lessons walk; S8raw and S8done are the project's fresh feed, not a step after S7c. */
export const STATE_ORDER = Object.keys(STATES);

/**
 * The sheet standard (screenplay 5, M86): the finished pages this workbook holds, and the sheets that
 * are off the standard on purpose. Every earlier state of the Report is a start state whose job is the
 * standard, so only the chapter's finished page is audited.
 */
export const STANDARD = {
  pages: [['S8done', 'Report', { read: true }]],
  off: {
    Raw: 'a raw export, laid out by the feed',
    Inputs: 'the inherited inputs sheet the chapter tidies but never rebuilds',
    Costs: 'a manager\'s sheet the chapter dresses but never rebuilds',
  },
};

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
        hiddenRows: [...S.hiddenRows], hiddenCols: [...S.hiddenCols], freeze: { ...S.freeze }, groups: S.groups, condFmt: S.condFmt };
    }),
    settings: { calcMode: ses.settings.calcMode, iterative: ses.settings.iterative, qat: ses.settings.qat.slice(),
      ...(ses.settings.enterMoves === false ? { enterMoves: false } : {}), pageSetup: clone(ses.settings.pageSetup) },   // the states' key order (S1c sets enterMoves, S7a adds pageSetup): diffStates compares by JSON
    ...(ses.names && Object.keys(ses.names).length ? { names: { ...ses.names } } : {}),
  };
}
/** The engine's Page Setup default: what a state means when it says nothing about printing. */
export const PAGE_SETUP_DEFAULT = { orientation: 'portrait', scaling: 'adjust', adjustTo: 100, fitWide: 1, fitTall: 1, titlesRows: '', footer: { left: '', centre: '', right: '' }, printGridlines: false };
const normSettings = st => ({ ...(st || {}), pageSetup: { ...PAGE_SETUP_DEFAULT, ...((st || {}).pageSetup || {}), footer: { ...PAGE_SETUP_DEFAULT.footer, ...(((st || {}).pageSetup || {}).footer || {}) } } });

/* ---------------- diffing (the chain test and audit graders read this) ---------------- */

const cellNorm = c => sparse(c || {}) || {};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * What differs between two states: [{ sheet, kind, key, a, b }] for cells (by ref), sheet order,
 * added or removed sheets, gridlines, colW/rowH, hidden, freeze, the outline, conditional formats,
 * names and settings. Empty array = identical.
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
    const cfNorm = list => normCondFmt(list || []).map(({ id, ...r }) => r);
    if (!same(cfNorm(sa.condFmt), cfNorm(sb.condFmt))) out.push({ sheet: name, kind: 'condFmt', key: 'condFmt', a: sa.condFmt, b: sb.condFmt });
  }
  if (!same(a.names || {}, b.names || {})) out.push({ sheet: '*', kind: 'names', key: 'names', a: a.names, b: b.names });
  if (!same(normSettings(a.settings), normSettings(b.settings))) out.push({ sheet: '*', kind: 'settings', key: 'settings', a: a.settings, b: b.settings });
  return out;
}
