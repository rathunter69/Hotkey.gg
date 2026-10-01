// Practice · Foundations — Row wrangler (screenplay 6.1). Cedar Park opens, so the Austin site table
// gets a row above Airport and the total has to take it in; a stale export row comes out; the
// figure columns go to one width, the labels fit, the old POS codes are grouped (never hidden) and
// the panes freeze at the first figure. The start state is the solved page with those steps undone
// by the engine itself.
import { parsFromRoute } from '../../app/pars.js';
import { buildPage, cutFrom, viaEngine, siteRows, siteTotal, costBlock, SITE_HEADERS, SITE_KINDS, UNITS, WEEK, WEEK_WASHES, SITE_TICKET, COST_PER_WASH, near, live } from './austin.js';
import { OLD_CODES, CEDAR_PARK } from '../workbooks/clearcoat-weekly.js';
import { FIGURE_W } from '../workbooks/page.js';

const SITES6 = ['Domain', 'Mueller', 'Riverside', 'South Lamar', 'Cedar Park', 'Airport'];
const CP = { washes: CEDAR_PARK.washes, ticket: CEDAR_PARK.revenue / CEDAR_PARK.washes };   // 210 washes at $14.00
const washes = { ...WEEK_WASHES, 'Cedar Park': CP.washes }, ticket = { ...SITE_TICKET, 'Cedar Park': CP.ticket };
const rows = siteRows(SITES6, { costRef: '$B$14', washes, ticket });
rows.forEach(row => { const f = row.fill; row.fill = (col, r) => (col === 'G' ? OLD_CODES[row.key] || null : f(col, r)); });
const PAGE = buildPage({
  name: 'Sites', chapter: 1, title: `Austin sites, ${WEEK}`, units: UNITS, labelHeader: 'Site',
  headers: [...SITE_HEADERS, 'Old code'], kinds: [...SITE_KINDS, 'text'],
  blocks: [{ rows: [...rows, siteTotal(5, 10)] }, costBlock()],
  source: `Source: site POS, ${WEEK}`,
});
PAGE.sheet.groups = { rows: [], cols: [{ c1: 7, c2: 7 }] };   // the old codes kept, grouped out of the way
const STALE = 'wk37 export, do not use';

const start = cutFrom(PAGE, (cells, sh) => {
  viaEngine(sh, S => {
    S.select('A9:Z9'); S.remove('r');          // Cedar Park not open yet
    S.select('A11:Z11'); S.insert('r'); S.cells.A11 = { value: STALE, it: true };   // a stale export row under the total
  });
  delete sh.freeze; delete sh.groups;
  sh.colW = { 1: 54, 2: 60, 3: 96, 4: 110, 5: 72, 6: 89, 7: 70 };   // the widths the managers left
  sh.active = { r: 9, c: 1 };
});

const CP_ROW = 9;
export default {
  id: 'row-wrangler',
  chapter: 'foundations',
  title: 'Row wrangler',
  task: 'Open a row for Cedar Park, drop the stale row, set the widths, group the old codes and freeze the panes.',
  access: 'free',
  sheet: start,
  sheets: [{ name: 'Sites' }],
  goals: [
    { id: 'insert', text: 'Insert a whole row above Airport, row 9, for Cedar Park.', keys: 'Shift+Space Ctrl+Shift+=',
      check: s => s.value('A10') === 'Airport' && s.value('A9') == null && s.value('B9') == null },
    { id: 'fill', text: 'Fill South Lamar’s row A8:F8 down into the new row with Ctrl+D.', keys: 'Ctrl+G "A8:F9" ↵ Ctrl+D',
      check: s => ['D', 'E', 'F'].every(c => live(s, c + CP_ROW)) && s.cellAt('B' + CP_ROW).fontColor === 'blue' },
    { id: 'type', text: `Type Cedar Park over A9, its ${CP.washes} washes in B9 and its ${CP.ticket.toFixed(2)} ticket in C9.`, keys: `Ctrl+G "A9" ↵ "Cedar Park" Tab "${CP.washes}" Tab "${CP.ticket}" ↵`,
      check: s => s.value('A9') === 'Cedar Park' && s.value('B9') === CP.washes && s.value('C9') === CP.ticket && near(s.value('D9'), CEDAR_PARK.revenue) && near(s.value('E9'), CP.washes * COST_PER_WASH) },
    { id: 'stale', text: 'Delete the stale export row under the total, row 12, whole.', keys: 'Ctrl+G "A12" ↵ Shift+Space Ctrl+-',
      check: s => s.value('A12') == null && s.value('A13') === 'Inputs' && ![...Array(20)].some((_, i) => s.value('A' + (i + 1)) === STALE) },
    { id: 'widths', text: 'Set the figure columns B:F to width 12.', keys: 'Ctrl+G "B4:F4" ↵ Alt H O W "12" ↵',
      check: s => [2, 3, 4, 5, 6].every(c => s.colW[c] === FIGURE_W) },
    { id: 'labels', text: 'AutoFit column A to its labels, A4:A14.', keys: 'Ctrl+G "A4:A14" ↵ Alt H O I',
      check: s => s.colW[1] >= s.neededWidth(1, 4, 14) && s.colW[1] < s.neededWidth(1, 1, 1) },
    { id: 'group', text: 'Group the old codes in column G.', keys: 'Ctrl+G "G4" ↵ Ctrl+Space Alt+Shift+→',
      check: s => s.groups.cols.some(g => g.c1 <= 7 && g.c2 >= 7) && !s.hiddenCols.has(7) },
    { id: 'freeze', text: 'Freeze the panes at B5.', keys: 'Ctrl+G "B5" ↵ Alt W F F', check: s => s.freeze.r === 4 && s.freeze.c === 1 },
  ],
  endState: [
    { text: 'The total in B11 still counts every site, Cedar Park included', check: s => s.value('A11') === 'Total' && live(s, 'B11', ['B9']) && near(s.value('B11'), [5, 6, 7, 8, 9, 10].reduce((t, r) => t + (s.value('B' + r) || 0), 0)) },
  ],
  solution: `Shift+Space Ctrl+Shift+= Ctrl+G "A8:F9" Enter Ctrl+D Ctrl+G "A9" Enter "Cedar Park" Tab "${CP.washes}" Tab "${CP.ticket}" Enter `
    + 'Ctrl+G "A12" Enter Shift+Space Ctrl+- Ctrl+G "B4:F4" Enter Alt H O W "12" Enter Ctrl+G "A4:A14" Enter Alt H O I Ctrl+G "G4" Enter Ctrl+Space Alt+Shift+Right Ctrl+G "B5" Enter Alt W F F',
  optimalKeys: 79,
  route: 30,
  pars: parsFromRoute(30),
};
