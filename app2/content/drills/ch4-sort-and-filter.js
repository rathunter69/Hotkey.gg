// Practice · Data and Lookups — Sort and filter (screenplay 6.2; script-drills D60). The working copy
// of the export (Export sort, S424) as 4.2.4 left it, sorted by revenue alone, with two labeled
// cells under the list. Sort it by site and then by retail revenue largest first in one Sort dialog,
// filter it to Airport, total the washes that show with SUBTOTAL(109) and count the rows with
// SUBTOTAL(103), then clear the filter. Graded on the order of the rows, the filter's state, and
// SUBTOTAL (never SUM) reading what shows. The script's second seed (the Subtotal command, Alt A B)
// waits for the engine.
import { packDrill, solutionOf } from './pack-drills.js';
import { rowsOf, copySheet, sameText, isNum, near, settled } from '../lessons/lib/pack-list-checks.js';

const S = 'Export sort', SITE = 'AUS-AIR';
const COUNT = '#,##0_);(#,##0);"-"_)';
const plant = {
  [`${S}!D96`]: { value: 'Total washes, rows showing' }, [`${S}!E96`]: { fmtStyle: 'custom', numFmt: COUNT },
  [`${S}!D97`]: { value: 'Rows showing' }, [`${S}!E97`]: { fmtStyle: 'custom', numFmt: COUNT },
};
const rev = x => (isNum(x.revenue) ? x.revenue : -Infinity);
const order = (a, b) => String(a.site).toUpperCase().localeCompare(String(b.site).toUpperCase()) || rev(b) - rev(a);
/** Every row in site order, and within a site the best revenue first. */
const sorted = sh => { const rows = rowsOf(sh); return rows.length === 90 && rows.every((x, i) => i === 0 || order(rows[i - 1], x) <= 0) && rows.some((x, i) => i > 0 && rev(rows[i - 1]) < rev(x)); };
const blockFilter = sh => !!sh && !!sh.filter && sh.filter.r1 === 4 && sh.filter.c1 === 1 && sh.filter.c2 >= 7 && sh.filter.r2 >= 94;
const showing = sh => rowsOf(sh).filter(x => !sh.filterRows.has(x.r));
const airportOnly = sh => { const v = showing(sh); return blockFilter(sh) && v.length === 15 && v.every(x => sameText(x.site, SITE)); };
const cleared = sh => !!sh && showing(sh).length === 90 && !Object.keys((sh.filter && sh.filter.crit) || {}).length;
const washes = rows => rows.reduce((t, x) => t + (isNum(x.total) ? x.total : 0), 0);
const sub = (sh, ref, fn) => new RegExp(`^=\\s*SUBTOTAL\\(\\s*${fn}\\s*,`, 'i').test(sh.formula(ref) || '');
const totals = sh => sub(sh, 'E96', 109) && near(sh.value('E96'), washes(showing(sh))) && sub(sh, 'E97', 103) && sh.value('E97') === showing(sh).length;

const GOALS = [
  { id: 'sort', text: 'Sort Export sort by Site A to Z, then by Retail revenue largest to smallest, in one Sort dialog.',
    keys: 'Ctrl+PgDn ×7 Ctrl+G "A4" ↵ Alt A S S S Alt+A R R Tab ↓ ↵',
    check: (s, ses) => settled(ses) && sorted(copySheet(ses)) },
  { id: 'filter', text: 'Turn on the filter arrows at A4 and show Airport only: Alt+Down on Site, then search AIR.',
    keys: 'Ctrl+Shift+L → Alt+↓ E "AIR" ↵',
    check: (s, ses) => settled(ses) && airportOnly(copySheet(ses)) },
  { id: 'subtotal', text: 'Under the list, E96 totals the washes showing with SUBTOTAL(109) and E97 counts the rows with SUBTOTAL(103).',
    keys: 'Ctrl+G "E96" ↵ "=SUBTOTAL(109,E5:E94)" ↵ "=SUBTOTAL(103,A5:A94)" ↵',
    check: (s, ses) => { const sh = copySheet(ses); return settled(ses) && airportOnly(sh) && totals(sh); } },
  { id: 'clear', text: 'Clear the filter with Alt, A, C: E96 and E97 now read the whole list.',
    keys: 'Alt A C',
    check: (s, ses) => { const sh = copySheet(ses); return settled(ses) && cleared(sh) && totals(sh); } },
];

export default packDrill({
  id: 'ch4-sort-and-filter',
  title: 'Sort and filter',
  task: 'A two-level sort, a filter, and a SUBTOTAL that counts only what shows.',
  module: 'lists-and-tables',
  state: { before: 'S424' },
  plant,
  goals: GOALS,
  endState: [
    { text: 'Export sort runs by site, best revenue first, with every row showing', check: (s, ses) => sorted(copySheet(ses)) && cleared(copySheet(ses)) },
    { text: 'E96 and E97 are SUBTOTALs that read only the rows a filter leaves', check: (s, ses) => totals(copySheet(ses)) },
  ],
  solution: solutionOf(GOALS),
  optimalKeys: 95,
  route: 30,
});
