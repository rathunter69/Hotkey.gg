// Practice · Foundations — Before you send (screenplay 6.1 and 6.2b; script-drills.md). The report
// goes to the CFO in two minutes: clear the two internal notes and the stray formats beside the
// table, put back a formula someone typed over, gridlines off, the stale tab gone, and every tab
// left on its home cell with Report in front. The notes are lines typed in cells beside the table
// (the engine has no cell notes yet; see "Built differently" in script-drills.md).
import { parsFromRoute } from '../../app/pars.js';
import { buildPage, cutFrom, costsPage, refsIn, siteRows, siteTotal, costBlock, SITE_HEADERS, SITE_KINDS, UNITS, WEEK, DAY_NAMES, DAY_WASHES, SITE_TICKET, near, live, at, sheetNamed } from './austin.js';
import { priorWeekRevenue, COST_PER_WASH } from '../workbooks/clearcoat-weekly.js';

const PAGE = buildPage({
  name: 'Report', chapter: 1, title: `Austin weekly report, ${WEEK}`, units: UNITS, labelHeader: 'Site',
  headers: SITE_HEADERS, kinds: SITE_KINDS, center: true,
  blocks: [{ rows: [...siteRows(), siteTotal(5, 9)] }, costBlock()],
  source: `Source: site POS, ${WEEK}`,
  checks: [{ label: 'Gross profit ties', formula: '=F10-(D10-E10)' }],
});
const NOTES = { H6: 'check with ops', H9: 'Airport Sat still missing?' };
const STRAY = refsIn('H5:J9');
// last week's gross profit for Riverside, typed over this week's formula
const STALE_GP = Math.round(priorWeekRevenue(undefined, 'Riverside') * (1 - COST_PER_WASH / SITE_TICKET.Riverside));

const start = cutFrom(PAGE, (cells, sh) => {
  for (const ref of STRAY) cells[ref] = { fill: 'yellow', ball: true };
  for (const [ref, text] of Object.entries(NOTES)) cells[ref] = { ...cells[ref], value: text };
  cells.F7 = { ...cells.F7, value: STALE_GP }; delete cells.F7.formula;
  delete sh.gridlines;
  sh.active = { r: 5, c: 2 };
});
const COSTS = { ...costsPage().sheet, active: { r: 40, c: 4 } };
const RAW = {
  name: 'Raw', active: { r: 13, c: 6 },
  cells: Object.fromEntries([
    ['A1', { value: 'Day', bold: true }], ['B1', { value: 'Site', bold: true }], ['C1', { value: 'Washes', bold: true }], ['D1', { value: 'Avg ticket', bold: true }],
    ...DAY_NAMES.flatMap((d, i) => [['A' + (i + 2), { value: d }], ['B' + (i + 2), { value: 'Domain' }], ['C' + (i + 2), { value: DAY_WASHES.Domain[i] }], ['D' + (i + 2), { value: SITE_TICKET.Domain }]]),
  ]),
};
const OLD = { name: 'Old wk37', cells: { A1: { value: 'Week 37 feed' }, A2: { value: 'superseded' } } };

const homeOf = sh => (sh.freeze && sh.freeze.r ? `B${sh.freeze.r + 1}` : 'A1');
export default {
  id: 'before-you-send',
  chapter: 'foundations',
  title: 'Before you send',
  task: 'The report goes to the CFO in two minutes: clear the internal notes and the stray formats, and leave every tab on its home cell.',
  access: 'free',
  sheet: start,
  sheets: [{ name: 'Report' }, COSTS, RAW, OLD],
  offStandard: { Raw: 'a raw export, laid out by the feed' },
  goals: [
    { id: 'note-ops', text: `Clear the internal note in H6, "${NOTES.H6}".`, keys: 'Ctrl+G "H6" ↵ Delete', check: (s, ses) => sheetNamed(ses, 'Report').value('H6') == null },
    { id: 'note-airport', text: 'Clear the second internal note, in H9.', keys: 'Ctrl+G "H9" ↵ Delete', check: (s, ses) => sheetNamed(ses, 'Report').value('H9') == null },
    { id: 'stray', text: 'Clear the stray fills and borders off H5:J9 with Alt H E F.', keys: 'Ctrl+G "H5:J9" ↵ Alt H E F',
      check: (s, ses) => STRAY.every(ref => { const c = sheetNamed(ses, 'Report').cellAt(ref); return !c.fill && !c.ball && !c.bt && !c.bb; }) },
    { id: 'hardcode', text: 'One gross profit in F5:F9 is a typed number: find it and put the formula back, revenue less wash cost.', keys: 'Ctrl+G "F5:F9" ↵ Alt H F D N "=D7-E7" ↵',
      check: (s, ses) => { const r = sheetNamed(ses, 'Report'); return near(r.value('F7'), r.value('D7') - r.value('E7')) && live(r, 'F7'); } },
    { id: 'gridlines', text: 'Turn the gridlines off on Report with Alt W V G.', keys: 'Alt W V G', check: (s, ses) => sheetNamed(ses, 'Report').gridlines === false },
    { id: 'stale-tab', text: 'Delete the stale Old wk37 tab.', keys: 'Ctrl+PgDn ×3 Alt H D S ↵', check: (s, ses) => !ses.sheets.some(e => e.name === OLD.name) && !ses.dialog },
    { id: 'raw', text: 'Leave Raw on A1 with Ctrl+Home.', keys: 'Ctrl+Home', check: (s, ses) => at(sheetNamed(ses, 'Raw'), 'A1') },
    { id: 'costs', text: 'Leave Costs on its home cell, B5, under the frozen panes.', keys: 'Ctrl+PgUp Ctrl+Home', check: (s, ses) => at(sheetNamed(ses, 'Costs'), homeOf(COSTS)) },
    { id: 'report', text: 'Finish on Report, the first tab, at B5.', keys: 'Ctrl+PgUp Ctrl+Home', check: (s, ses) => ses.sheetIndex === 0 && at(s, 'B5') },
  ],
  endState: [
    { text: 'The check in B17 reads zero', check: (s, ses) => Math.abs(sheetNamed(ses, 'Report').value('B17')) < 1e-9 },
    { text: 'The source line in A14 is still there', check: (s, ses) => sheetNamed(ses, 'Report').value('A14') === PAGE.sheet.cells.A14.value },
  ],
  solution: 'Ctrl+G "H6" Enter Delete Ctrl+G "H9" Enter Delete Ctrl+G "H5:J9" Enter Alt H E F Ctrl+G "F5:F9" Enter Alt H F D N "=D7-E7" Enter Alt W V G '
    + 'Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Alt H D S Enter Ctrl+Home Ctrl+PgUp Ctrl+Home Ctrl+PgUp Ctrl+Home',
  optimalKeys: 57,
  route: 60,
  pars: parsFromRoute(60),
};
