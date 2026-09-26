// Chapter 1 · 1.4.C — Challenge: reshape the report (seeded over S2a)
// A sister cluster's weekly KPI report arrives with the structure faults the module fixed one by
// one: the Depot site opened and has no row, the old platform's Old code column is still there,
// the figure columns are six different widths, one column is hidden and nothing is frozen. Insert
// the row inside the block so the total follows, delete the column, set the six widths in one
// press, unhide, group the working columns instead, freeze the heads. Seeds dress the city, the
// site names, the figures and which column is hidden; the workload never moves.
import { pickCluster, siteNames } from '../workbooks/clusters.js';
import { WHOLESALE } from '../workbooks/voltline-weekly.js';
import { noHidden, rowConsistent, liveness } from '../../app/graders.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) < 1e-6;
const blank = c => !c || (c.value == null && c.formula == null);
const normFormula = f => String(f || '').replace(/\s|\$/g, '').toUpperCase();
const r2 = v => Math.round(v * 100) / 100;

const HEADERS = ['Site', 'kWh sold', 'Revenue ($)', 'Energy cost ($)', 'Gross profit ($)', 'Avg price ($/kWh)', 'Prior week rev ($)', 'Old code'];
const HEADER_ROW = 3, FIRST_SITE = 4, LAST_SITE = 8;   // five sites in rows 4–8; Total in row 9 until the Depot row goes in
const TOTAL_ROW = 10;                                 // the Total once a sixth site is in the block
const SUM_COLS = ['B', 'C', 'D'];                     // kWh, Revenue, Energy cost — the SUMs the graders keep honest
const FIGURE_COLS = [2, 3, 4, 5, 6, 7];               // B:G — the six figure columns that share one width
const W12 = 12 * 7 + 5;                               // Column Width 12 in Excel units → px (89), as the engine converts it
const WORKING = { c1: 5, c2: 6 };                     // E:F — Gross profit, Avg price: the working columns to group
const FREEZE_AT = { r: 3, c: 1 };                     // Freeze Panes at B4: title, units and header rows, the site column
/** The fleet depot that opens in every cluster this week: management's emailed figures (1,800 kWh × $0.46; energy at $0.13). */
export const DEPOT = { name: 'Depot', kwh: 1800, revenue: 828, energy: 234 };

/** Depot's row, wherever inside the block it was inserted: its name in A and its three figures typed as numbers. */
const depotRow = rep => {
  for (let r = FIRST_SITE; r <= LAST_SITE + 1; r++) {
    if (rep.value('A' + r) !== DEPOT.name) continue;
    const ok = ['B', 'C', 'D'].every((col, i) => { const c = rep.cellAt(col + r); return !c.formula && c.value === [DEPOT.kwh, DEPOT.revenue, DEPOT.energy][i]; });
    return ok ? r : 0;
  }
  return 0;
};
/** B10:D10 are SUMs over the six site rows 4–9 and each reads its column's sum — the total followed the insert. */
const totalsFollow = rep => rep.value('A' + TOTAL_ROW) === 'Total' && SUM_COLS.every(col => {
  if (normFormula(rep.formula(col + TOTAL_ROW)) !== `=SUM(${col}${FIRST_SITE}:${col}${LAST_SITE + 1})`) return false;
  let sum = 0; for (let r = FIRST_SITE; r <= LAST_SITE + 1; r++) { const v = rep.value(col + r); if (v != null && !isNum(v)) return false; sum += v || 0; }
  return near(rep.value(col + TOTAL_ROW), sum);
});
const noCodes = rep => Object.keys(rep.cells).every(k => { const v = rep.cells[k].value; return v !== 'Old code' && !/^[A-Z]{3}-0[1-5]$/.test(String(v || '')); });
/** Column H went as a whole: G still heads Prior week rev, H3 is gone with its bold (Delete would have left the format), no code anywhere. */
const codeColumnGone = rep => rep.value('G' + HEADER_ROW) === 'Prior week rev ($)' && blank(rep.cellAt('H' + HEADER_ROW)) && !rep.cellAt('H' + HEADER_ROW).bold && noCodes(rep);
const widthsEqual = rep => FIGURE_COLS.every(c => rep.colW[c] === W12 && rep.colSet[c] === true);
const nothingHidden = rep => rep.hiddenCols.size === 0 && rep.hiddenRows.size === 0;
const workingGrouped = rep => rep.groups.cols.length === 1 && rep.groups.cols[0].c1 === WORKING.c1 && rep.groups.cols[0].c2 === WORKING.c2 && !rep.groups.cols[0].collapsed;
const frozenAt = rep => rep.freeze.r === FREEZE_AT.r && rep.freeze.c === FREEZE_AT.c;
const settled = ses => !ses.editing && !ses.dialog;

export default {
  id: 'challenge-reshape-the-report',
  chapter: 'foundations',
  section: 'Structure',
  module: 'structure',
  workbook: 'voltline-weekly',
  state: { before: 'S2a' },
  kind: 'challenge',
  title: 'Challenge: reshape the report',
  difficulty: 'medium',
  tags: ['challenge', 'structure', 'report'],
  access: 'free',
  minutes: 3,
  conventions: ['F1', 'C2', 'C7', 'C8'],
  prerequisites: ['hide-group-freeze'],
  brief: 'A sister cluster’s KPI report arrived with a site missing, a stale column, uneven widths, a hidden column and nothing frozen: reshape it to house standard, and the totals must still tie.',
  timeLimit: 170,
  pars: parsFrom(50, { pass: 150, pro: 90 }),
  seed: rng => {
    const cluster = pickCluster(rng);
    const sites = siteNames(cluster, 5);
    const patch = {
      'Report!A1': { value: `Voltline — ${cluster.city} Weekly KPI Report, ${cluster.week}` },
      'Report!A2': { value: 'USD unless stated' },
    };
    HEADERS.forEach((h, i) => { patch[`Report!${String.fromCharCode(65 + i)}${HEADER_ROW}`] = { value: h, bold: true }; });
    sites.forEach((site, i) => {
      const r = FIRST_SITE + i;
      const kwh = Math.round((4000 + rng() * 10000) / 10) * 10;
      const price = Math.round(42 + rng() * 6) / 100;
      const revenue = r2(kwh * price);
      patch[`Report!A${r}`] = { value: site };
      patch[`Report!B${r}`] = { value: kwh };
      patch[`Report!C${r}`] = { value: revenue };
      patch[`Report!D${r}`] = { value: r2(kwh * WHOLESALE) };
      patch[`Report!G${r}`] = { value: r2(revenue * (0.8 + 0.4 * rng())) };
      patch[`Report!H${r}`] = { value: `${cluster.city.slice(0, 3).toUpperCase()}-0${i + 1}` };
    });
    patch[`Report!A${LAST_SITE + 1}`] = { value: 'Total', bold: true };
    for (const col of ['B', 'C', 'D', 'G']) patch[`Report!${col}${LAST_SITE + 1}`] = { formula: `=SUM(${col}${FIRST_SITE}:${col}${LAST_SITE})` };
    patch['Report!#colW'] = { 2: 50, 3: 120, 4: 64, 5: 90, 6: 70, 7: 110 };   // six figure columns, six widths
    patch['Report!#hiddenCols'] = [5 + Math.floor(rng() * 2)];             // one of the two blank working columns E:F is hidden (never inside goal 1's Tab run)
    return patch;
  },
  goals: [
    { id: 'depot-row', text: `The Depot site opened: insert a row inside the block, above the last site, and enter Depot, ${DEPOT.kwh.toLocaleString('en-US')} kWh, $${DEPOT.revenue} revenue, $${DEPOT.energy} energy cost.`, convention: 'F1',
      keys: `Ctrl+↓ ↑ Shift+Space Ctrl+Shift+= "${DEPOT.name}" Tab "${DEPOT.kwh}" Tab "${DEPOT.revenue}" Tab "${DEPOT.energy}" ↵`,
      check: (s, ses) => { const rep = report(ses); return !!rep && depotRow(rep) > 0 && totalsFollow(rep) && settled(ses); } },
    { id: 'old-code', text: 'Old code in column H is the old platform’s site code: delete the whole column, not just its cells.', keys: 'Ctrl+Home ↓ ×2 Ctrl+→ Ctrl+Space Ctrl+-',
      check: (s, ses) => { const rep = report(ses); return !!rep && codeColumnGone(rep) && settled(ses); } },
    { id: 'equal-widths', text: 'The six figure columns B:G are six different widths: select them from the header row and set Column Width 12.', convention: 'C2',
      keys: 'Home → Ctrl+Shift+→ Ctrl+Space then Alt H O W "12" ↵',
      check: (s, ses) => { const rep = report(ses); return !!rep && widthsEqual(rep) && settled(ses); } },
    { id: 'unhide', text: 'A figure column is hidden — a buyer’s analyst would find it and wonder: unhide it inside the same selection.', keys: 'Ctrl+Shift+)',
      check: (s, ses) => { const rep = report(ses); return !!rep && nothingHidden(rep) && settled(ses); } },
    { id: 'group-working', text: 'Gross profit and Avg price in E:F are working columns: group them rather than hiding them.', convention: 'C7', keys: '→ ×3 Ctrl+Space Shift+→ Alt+Shift+→',
      check: (s, ses) => { const rep = report(ses); return !!rep && workingGrouped(rep) && nothingHidden(rep) && settled(ses); } },
    { id: 'freeze', text: 'Freeze the panes at B4 so the title, units, header row and site column stay in view.', convention: 'C8', keys: 'Home → ↓ then Alt W F F',
      check: (s, ses) => { const rep = report(ses); return !!rep && frozenAt(rep) && settled(ses); } },
  ],
  graders: [
    ses => { const rep = report(ses); return rep ? noHidden(rep) : { ok: false, why: 'No Report sheet.' }; },
    ses => { const rep = report(ses); return rep ? rowConsistent(rep, `B${TOTAL_ROW}:D${TOTAL_ROW}`) : { ok: false, why: 'No Report sheet.' }; },
    ses => { const rep = report(ses); return rep ? liveness(rep, 'B' + TOTAL_ROW) : { ok: false, why: 'No Report sheet.' }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      return widthsEqual(rep) ? { ok: true } : { ok: false, why: 'the figure columns B:G are not all width 12 — equal period columns, set by hand' }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      return frozenAt(rep) ? { ok: true } : { ok: false, why: 'the heads are not frozen at B4 — the title, header row and site column scroll away' }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      return workingGrouped(rep) ? { ok: true } : { ok: false, why: 'E:F are not grouped — a hidden column gets forgotten; a grouped one shows a button' }; },
  ],
  solution: `Ctrl+Down Up Shift+Space Ctrl+Shift+= "${DEPOT.name}" Tab "${DEPOT.kwh}" Tab "${DEPOT.revenue}" Tab "${DEPOT.energy}" Enter Ctrl+Home Down Down Ctrl+Right Ctrl+Space Ctrl+- Home Right Ctrl+Shift+Right Ctrl+Space Alt H O W "12" Enter Ctrl+Shift+) Right Right Right Ctrl+Space Shift+Right Alt+Shift+Right Home Right Down Alt W F F`,
};
