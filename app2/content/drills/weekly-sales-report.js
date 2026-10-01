// Practice · Foundations — The weekly report, against the clock (screenplay 6.1; the chapter's
// benchmark, its id kept). The Austin site export arrives plain: no units line, no formats, no
// gross profit, no total. Take it to the desk's page. Seeded for the Daily: the figures change, the
// checks read what is on the sheet and the solved page's formats, never a constant.
import { parsFromRoute } from '../../app/pars.js';
import { buildPage, cutFrom, emptied, unformatted, refsIn, SITES, SITE_TICKET, WEEK_WASHES, COST_PER_WASH, UNITS, WEEK, near, live, r2 } from './austin.js';

const PAGE = buildPage({
  name: 'Report', chapter: 1, title: `Austin weekly report, ${WEEK}`, units: UNITS, labelHeader: 'Site',
  headers: ['Washes', 'Revenue', 'Wash cost', 'Gross profit'], kinds: ['count', 'money', 'money', 'money'], center: true,
  blocks: [{ rows: [
    ...SITES.map(s => ({ key: s, label: s, fill: (col, r) => ({ B: WEEK_WASHES[s], C: r2(WEEK_WASHES[s] * SITE_TICKET[s]), D: r2(WEEK_WASHES[s] * COST_PER_WASH), E: `=C${r}-D${r}` })[col] })),
    { key: 'total', label: 'Total', total: true, fill: col => `=SUM(${col}5:${col}9)` },
  ] }],
});
const SOLVED = PAGE.sheet.cells;

const start = cutFrom(PAGE, (cells, sh) => {
  emptied(cells, ['A2', ...refsIn('E5:E9'), ...refsIn('A10:E10')]);
  unformatted(cells, ['A1', 'A2', ...refsIn('A4:E10')]);
  delete sh.gridlines; delete sh.freeze;
  sh.active = { r: 1, c: 1 };
});

const R = [5, 6, 7, 8, 9];
const like = (s, refs, fields) => refs.every(ref => fields.every(f => (s.cellAt(ref)[f] || 0) === ((SOLVED[ref] || {})[f] || 0)));
const numFmt = ['fmtStyle', 'decimals'];
const sum = (s, col) => R.reduce((t, r) => t + (s.value(col + r) || 0), 0);

export default {
  id: 'weekly-sales-report',
  chapter: 'foundations',
  title: 'The weekly report',
  task: 'Turn a plain export into a finished report: title, units, headers, live totals, number formats, a ruled total and frozen panes.',
  access: 'free',
  benchmark: true,
  sheet: start,
  sheets: [{ name: 'Report' }],
  /** Daily variation: fresh washes, the same tickets and cost per wash, the same shape. */
  seed: rng => {
    const patch = {};
    SITES.forEach((s, i) => {
      const w = 1100 + Math.floor(rng() * 80) * 5, r = 5 + i;
      patch['B' + r] = { value: w };
      patch['C' + r] = { value: r2(w * SITE_TICKET[s]) };
      patch['D' + r] = { value: r2(w * COST_PER_WASH) };
    });
    return patch;
  },
  goals: [
    { id: 'title', text: 'Bold the title in A1 and take it one size up.', keys: 'Ctrl+B Alt H F G', check: s => like(s, ['A1'], ['bold', 'fsz']) },
    { id: 'across', text: 'Center the title across A1:E1, never merged.', keys: 'Ctrl+G "A1:E1" ↵ Ctrl+1 A Alt+H ↓ ×4 ↵', check: s => s.cellAt('A1').ca === 5 },
    { id: 'units', text: `Type the units line, ${UNITS}, into A2 in italics.`, keys: `Ctrl+G "A2" ↵ Ctrl+I "${UNITS}" ↵`,
      check: s => s.value('A2') === UNITS && s.cellAt('A2').it === true },
    { id: 'headers', text: 'Bold the headers A4:E4 and right-align B4:E4 over their figures.', keys: 'Ctrl+G "A4:E4" ↵ Ctrl+B Ctrl+G "B4:E4" ↵ Alt H A R',
      check: s => like(s, refsIn('A4:E4'), ['bold']) && refsIn('B4:E4').every(ref => s.cellAt(ref).align === 'r') },
    { id: 'gross', text: 'Gross profit in E5:E9: revenue less wash cost, one formula for all five.', keys: 'Ctrl+G "E5:E9" ↵ "=C5-D5" Ctrl+↵',
      check: s => R.every(r => near(s.value('E' + r), s.value('C' + r) - s.value('D' + r)) && live(s, 'E' + r)) },
    { id: 'total', text: 'Type Total into A10 and AutoSum B10:E10.', keys: 'Ctrl+G "A10" ↵ "Total" ↵ Ctrl+G "B5:E10" ↵ Alt+=',
      check: s => s.value('A10') === 'Total' && ['B', 'C', 'D', 'E'].every(col => near(s.value(col + 10), sum(s, col)) && live(s, col + 10)) },
    { id: 'format', text: 'Give the figures B5:E10 the desk number format with Ctrl+1.', keys: 'Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N ↓ ↓ ↵',
      check: s => refsIn('B5:E10').every(ref => ['comma', 'currency'].includes(s.cellAt(ref).fmtStyle) && !s.cellAt(ref).decimals) },
    { id: 'dollars', text: 'Put the $ on the first and total rows only: C5:E5 and C10:E10.', keys: 'Ctrl+G "C5:E5" ↵ Ctrl+1 N Tab C Alt+D 0 Alt+N ↓ ↓ ↓ ↑ ↵ Ctrl+G "C10:E10" ↵ F4',
      check: s => like(s, refsIn('B5:E10'), numFmt) },
    { id: 'blue', text: 'Color the typed figures B5:D9 blue.', keys: 'Ctrl+G "B5:D9" ↵ Alt H F C → ×4 ↵', check: s => refsIn('B5:D9').every(ref => s.cellAt(ref).fontColor === 'blue') },
    { id: 'rule', text: 'Bold the Total row A10:E10 and give it a top border.', keys: 'Ctrl+G "A10:E10" ↵ Ctrl+B Alt H B P', check: s => like(s, refsIn('A10:E10'), ['bold', 'bt']) },
    { id: 'freeze', text: 'Freeze the panes at B5.', keys: 'Ctrl+G "B5" ↵ Alt W F F', check: s => s.freeze.r === 4 && s.freeze.c === 1 },
    { id: 'gridlines', text: 'Turn the gridlines off with Alt W V G.', keys: 'Alt W V G', check: s => s.gridlines === false },
  ],
  endState: [
    { text: 'The totals still add the five sites', check: s => ['B', 'C', 'D', 'E'].every(col => near(s.value(col + 10), sum(s, col)) && live(s, col + 10)) },
  ],
  solution: 'Ctrl+B Alt H F G Ctrl+G "A1:E1" Enter Ctrl+1 A Alt+H Down Down Down Down Enter Ctrl+G "A2" Enter Ctrl+I "USD unless stated" Enter Ctrl+G "A4:E4" Enter Ctrl+B Ctrl+G "B4:E4" Enter Alt H A R '
    + 'Ctrl+G "E5:E9" Enter "=C5-D5" Ctrl+Enter Ctrl+G "A10" Enter "Total" Enter Ctrl+G "B5:E10" Enter Alt+= Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N Down Down Enter Ctrl+G "C5:E5" Enter Ctrl+1 N Tab C Alt+D 0 Alt+N Down Down Down Up Enter Ctrl+G "C10:E10" Enter F4 '
    + 'Ctrl+G "B5:D9" Enter Alt H F C Right Right Right Right Enter Ctrl+G "A10:E10" Enter Ctrl+B Alt H B P Ctrl+G "B5" Enter Alt W F F Alt W V G',
  optimalKeys: 179,
  route: 90,
  pars: parsFromRoute(90),
};
