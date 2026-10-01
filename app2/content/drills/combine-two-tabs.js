// Practice · Foundations — Combine two tabs (screenplay 6.1 and 6.2b; script-drills.md). Austin and
// San Antonio run the same weekly page; Combined adds them cell by cell by pointing, never by typing
// a number, rebuilds its contribution from its own rows, totals the week, and takes Austin's formats
// with the links shown green. Graded by what-if: every combined cell must move with the matching
// cell on both tabs.
import { parsFromRoute } from '../../app/pars.js';
import { buildPage, cutFrom, emptied, unformatted, refsIn, SITES, SITE_TICKET, DAY_WASHES, DAY_NAMES, COST_PER_WASH, UNITS, WEEK, near, live, reads, r2 } from './austin.js';

const FIG = ['B', 'C', 'D', 'E', 'F', 'G'];
const LINES = ['Washes', 'Revenue', 'Cost of washes', 'Site costs'];
const austinDay = d => SITES.reduce((t, s) => t + DAY_WASHES[s][d], 0);
const AUSTIN = {
  Washes: DAY_NAMES.map((_, d) => austinDay(d)),
  Revenue: DAY_NAMES.map((_, d) => r2(SITES.reduce((t, s) => t + DAY_WASHES[s][d] * SITE_TICKET[s], 0))),
  'Site costs': [5650, 5700, 5720, 5690, 6100, 6380],
};
AUSTIN['Cost of washes'] = AUSTIN.Washes.map(w => r2(w * COST_PER_WASH));
const SA_WASHES = [1185, 1140, 1205, 1230, 1320, 1410];
const SAN_ANTONIO = { Washes: SA_WASHES, Revenue: SA_WASHES.map(w => r2(w * 13.8)), 'Cost of washes': SA_WASHES.map(w => r2(w * COST_PER_WASH)), 'Site costs': [5480, 5510, 5500, 5530, 5900, 6150] };

/** One cluster's page, or Combined: four lines, the contribution, the week in H. */
function clusterPage(name, title, data) {
  return buildPage({
    name, chapter: 1, title, units: UNITS, labelHeader: 'Line',
    headers: [...DAY_NAMES, 'Week'], kinds: Array(7).fill('money'),
    blocks: [{ rows: [
      ...LINES.map(line => ({ key: line, label: line, kind: line === 'Washes' ? 'count' : undefined, dollar: line === 'Revenue',
        fill: (col, r) => (col === 'H' ? `=SUM(B${r}:G${r})` : data(line, col, r)) })),
      { key: 'contribution', label: 'Site contribution', total: true, fill: (col, r) => `=${col}6-${col}7-${col}8` },
    ] }],
    source: name === 'Combined' ? 'Source: the Austin and SanAntonio tabs' : `Source: ${title.split(',')[0]} site POS and managers`,
  });
}
const AUS = clusterPage('Austin', `Austin cluster, ${WEEK}`, (line, col) => AUSTIN[line][FIG.indexOf(col)]);
const SA = clusterPage('SanAntonio', `San Antonio cluster, ${WEEK}`, (line, col) => SAN_ANTONIO[line][FIG.indexOf(col)]);
const COMBINED = clusterPage('Combined', `Austin and San Antonio combined, ${WEEK}`, (line, col, r) => `=Austin!${col}${r}+SanAntonio!${col}${r}`);
const BLOCK = refsIn('B5:H9');

const start = cutFrom(COMBINED, (cells, sh) => { emptied(cells, BLOCK); unformatted(cells, BLOCK); sh.active = { r: 5, c: 2 }; });
const others = [AUS, SA].map(p => ({ ...p.sheet, active: { r: 5, c: 2 } }));

const v = (s, ref) => s.value(ref);
const sumOf = (ses, col, r) => ['Austin', 'SanAntonio'].reduce((t, n) => t + ses.sheets.find(e => e.name === n).sheet.value(col + r), 0);
// live (a what-if moves it) and reading the matching cell on both tabs: engine/live.js takes no
// cross-sheet input list (normRef drops 'Austin!B5'), so the two tabs are confirmed from the tokens
const linksIn = (s, ses, cols, rows) => rows.every(r => cols.every(col => near(v(s, col + r), sumOf(ses, col, r)) && live(s, col + r)
  && reads(s, col + r, `Austin!${col}${r}`) && reads(s, col + r, `SanAntonio!${col}${r}`)));
const onCombined = ses => ses.sheetIndex === 0;
const AUS_CELLS = AUS.sheet.cells;

export default {
  id: 'combine-two-tabs',
  chapter: 'foundations',
  title: 'Combine two tabs',
  task: 'Add Austin and San Antonio cell by cell on Combined, without typing a number.',
  access: 'free',
  sheet: start,
  sheets: [{ name: 'Combined' }, ...others],
  goals: [
    { id: 'point', text: 'In B5 on Combined, add Monday’s washes on Austin and SanAntonio by pointing.', keys: '"=" Ctrl+PgDn → ← "+" Ctrl+PgDn → ← ↵',
      check: (s, ses) => onCombined(ses) && linksIn(s, ses, ['B'], [5]) },
    { id: 'across', text: 'Fill B5 right across C5:G5.', keys: 'Ctrl+G "B5:G5" ↵ Ctrl+R', check: (s, ses) => onCombined(ses) && linksIn(s, ses, FIG, [5]) },
    { id: 'down', text: 'Fill B5:G5 down to row 8.', keys: 'Ctrl+G "B5:G8" ↵ Ctrl+D', check: (s, ses) => onCombined(ses) && linksIn(s, ses, FIG, [5, 6, 7, 8]) },
    { id: 'contribution', text: 'Site contribution in B9:G9 from Combined’s own rows: revenue less both costs.', keys: 'Ctrl+G "B9:G9" ↵ "=B6-B7-B8" Ctrl+↵',
      check: (s, ses) => onCombined(ses) && FIG.every(col => near(v(s, col + 9), v(s, col + 6) - v(s, col + 7) - v(s, col + 8)) && live(s, col + 9) && reads(s, col + 9, col + '6')
        && !String(s.formula(col + 9)).includes('!')) },
    { id: 'week', text: 'Select B5:H9 and AutoSum the week into H5:H9.', keys: 'Ctrl+G "B5:H9" ↵ Alt+=',
      check: (s, ses) => onCombined(ses) && [5, 6, 7, 8, 9].every(r => near(v(s, 'H' + r), FIG.reduce((t, c) => t + v(s, c + r), 0)) && live(s, 'H' + r) && reads(s, 'H' + r, 'B' + r)) },
    { id: 'formats', text: 'Copy Austin’s B5:H9 and paste only its formats onto the same block on Combined.', keys: 'Ctrl+PgDn Ctrl+G "B5:H9" ↵ Ctrl+C Ctrl+PgUp Ctrl+G "B5" ↵ Ctrl+Alt+V T ↵',
      check: (s, ses) => onCombined(ses) && BLOCK.every(ref => ['fmtStyle', 'decimals', 'bold', 'bt'].every(f => (s.cellAt(ref)[f] || 0) === (AUS_CELLS[ref][f] || 0))) },
    { id: 'green', text: 'Color the links in B5:G8 green: they read another sheet.', keys: 'Ctrl+G "B5:G8" ↵ Alt H F C → ×8 ↵',
      check: (s, ses) => onCombined(ses) && refsIn('B5:G8').every(ref => s.cellAt(ref).fontColor === 'green') },
    { id: 'trace', text: 'From B5 on Combined, jump to the first cell it reads with Ctrl+[.', keys: 'Ctrl+G "B5" ↵ Ctrl+[',
      check: (s, ses) => ses.sheets[ses.sheetIndex].name === 'Austin' && !s.sel && s.selectionText() === 'B5' },
  ],
  solution: '"=" Ctrl+PgDn Right Left "+" Ctrl+PgDn Right Left Enter Ctrl+G "B5:G5" Enter Ctrl+R Ctrl+G "B5:G8" Enter Ctrl+D Ctrl+G "B9:G9" Enter "=B6-B7-B8" Ctrl+Enter '
    + 'Ctrl+G "B5:H9" Enter Alt+= Ctrl+PgDn Ctrl+G "B5:H9" Enter Ctrl+C Ctrl+PgUp Ctrl+G "B5" Enter Ctrl+Alt+V T Enter '
    + 'Ctrl+G "B5:G8" Enter Alt H F C Right Right Right Right Right Right Right Right Enter Ctrl+G "B5" Enter Ctrl+[',
  optimalKeys: 93,
  route: 60,
  pars: parsFromRoute(60),
};
