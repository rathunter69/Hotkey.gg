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
import { FMT_FIELDS } from '../../engine/sheet.js';

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
  cells.A65 = { value: 'w/c 08 Sep feed checked — EA' };   // the stale week label Replace All updates (1.3.5)
  cells.A66 = { value: 'Airport Saturday missing from feed' };
  cells.A67 = { value: 'prices per site tariff card' };
  return cells;
}

/** Sheet2: the associate's half-started inputs scratch (why 1.1.1 renames it instead of deleting). */
function sheet2Cells() {
  return {
    A1: { value: 'Inputs', bold: true },
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
    { name: 'Raw', cells: rawCells(), colW: { 1: 76, 2: 92, 4: 92, 5: 88, 6: 104 }, active: { r: 1, c: 1 } },
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

export const STATES = { S0, S1a, S1b, S1c, S1d, S2a };
// S3a–S8raw arrive with modules 1.3–1.8 (later C2 runs); each derives from the one before.

/** A deep clone of a named state (runners mutate their copy, never the master). */
export function stateOf(id) {
  const s = STATES[id];
  if (!s) throw new Error('unknown workbook state ' + id);
  return clone(s);
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
  }
  if (!same(a.settings || {}, b.settings || {})) out.push({ sheet: '*', kind: 'settings', key: 'settings', a: a.settings, b: b.settings });
  return out;
}
