// Practice · Foundations — Formula sprint (screenplay 6.1). The Austin site table with only the
// typed washes and tickets: build revenue, the anchored wash cost, gross profit, the margin and each
// site's share of washes, one formula per column, then the totals, the blended ticket and the total
// margin. Graded live: every answer must move when its inputs move (engine/live.js), so a typed
// number never passes, and an unanchored cost or share fails the moment it is filled.
import { parsFromRoute } from '../../app/pars.js';
import { buildPage, cutFrom, emptied, refsIn, SITES, SITE_TICKET, WEEK_WASHES, UNITS, WEEK, costBlock, near, live, reads } from './austin.js';

const PAGE = buildPage({
  name: 'Report', chapter: 1, title: `Austin weekly report, ${WEEK}`, units: UNITS, labelHeader: 'Site',
  headers: ['Washes', 'Avg ticket', 'Revenue', 'Wash cost', 'Gross profit', 'Margin', 'Share'], kinds: ['count', 'unit', 'money', 'money', 'money', 'pct', 'pct'],
  blocks: [
    { rows: [
      ...SITES.map(s => ({ key: s, label: s, fill: (col, r) => ({ B: WEEK_WASHES[s], C: SITE_TICKET[s], D: `=B${r}*C${r}`, E: `=B${r}*$B$13`, F: `=D${r}-E${r}`, G: `=F${r}/D${r}`, H: `=B${r}/$B$10` })[col] })),
      { key: 'total', label: 'Total', total: true, fill: (col, r) => ({ C: `=D${r}/B${r}`, G: `=F${r}/D${r}` })[col] || `=SUM(${col}5:${col}9)` },
    ] },
    costBlock(),
  ],
  source: `Source: site POS, ${WEEK}`,
  checks: [{ label: 'Shares add to 100%', formula: '=H10-1' }],
});

const start = cutFrom(PAGE, (cells, sh) => {
  emptied(cells, [...refsIn('D5:H9'), ...refsIn('B10:H10')]);
  sh.active = { r: 5, c: 4 };
});

const R = [5, 6, 7, 8, 9];
const v = (s, ref) => s.value(ref);
/** Every row r of `col` is live and equals want(r). */
const column = (s, col, want, inputs) => R.every(r => near(v(s, col + r), want(r)) && live(s, col + r, inputs && inputs(r)));
const sum = (s, col) => R.reduce((t, r) => t + (v(s, col + r) || 0), 0);
export default {
  id: 'formula-sprint',
  chapter: 'foundations',
  title: 'Formula sprint',
  task: 'Build revenue, the anchored cost, gross profit, margin and share, then the totals, the blended ticket and the total margin.',
  access: 'free',
  sheet: start,
  sheets: [{ name: 'Report' }],
  goals: [
    { id: 'revenue', text: 'Revenue in D5:D9: washes times ticket, one formula entered into all five with Ctrl+Enter.', keys: 'Ctrl+G "D5:D9" ↵ "=B5*C5" Ctrl+↵',
      check: s => column(s, 'D', r => v(s, 'B' + r) * v(s, 'C' + r)) },
    { id: 'cost', text: 'Wash cost in E5:E9: washes times the cost per wash in B13, anchored with F4.', keys: 'Ctrl+G "E5:E9" ↵ "=B5*B13" F4 Ctrl+↵',
      check: s => column(s, 'E', r => v(s, 'B' + r) * v(s, 'B13'), () => ['B13']) },
    { id: 'gross', text: 'Gross profit in F5:F9: revenue less wash cost.', keys: 'Ctrl+G "F5:F9" ↵ "=D5-E5" Ctrl+↵',
      check: s => column(s, 'F', r => v(s, 'D' + r) - v(s, 'E' + r)) },
    { id: 'margin', text: 'Margin in G5:G9: gross profit over revenue.', keys: 'Ctrl+G "G5:G9" ↵ "=F5/D5" Ctrl+↵',
      check: s => column(s, 'G', r => v(s, 'F' + r) / v(s, 'D' + r)) },
    { id: 'totals', text: 'Select B5:F10 and AutoSum the Total row with Alt+=.', keys: 'Ctrl+G "B5:F10" ↵ Alt+=',
      check: s => ['B', 'D', 'E', 'F'].every(col => near(v(s, col + 10), sum(s, col)) && live(s, col + 10)) },
    { id: 'ticket', text: 'Make C10 the blended ticket: total revenue D10 over total washes B10.', keys: 'Ctrl+G "C10" ↵ "=D10/B10" ↵',
      check: s => near(v(s, 'C10'), v(s, 'D10') / v(s, 'B10')) && live(s, 'C10', ['B5']) },
    { id: 'margin-total', text: 'In G10, the total margin: F10 over D10.', keys: 'Ctrl+G "G10" ↵ "=F10/D10" ↵',
      check: s => near(v(s, 'G10'), v(s, 'F10') / v(s, 'D10')) && live(s, 'G10', ['B5']) },
    { id: 'share', text: 'Share of washes in H5:H9: each site’s washes over the total B10, anchored.', keys: 'Ctrl+G "H5:H9" ↵ "=B5/B10" F4 Ctrl+↵',
      check: s => column(s, 'H', r => v(s, 'B' + r) / v(s, 'B10'), r => ['B' + r]) },
    { id: 'share-total', text: 'AutoSum the shares into H10.', keys: 'Ctrl+G "H10" ↵ Alt+= ↵',
      check: s => near(v(s, 'H10'), sum(s, 'H')) && R.every(r => reads(s, 'H10', 'H' + r)) },
  ],
  endState: [
    { text: 'The shares add to 100%, and the check in B17 reads zero', check: s => near(v(s, 'H10'), 1) && Math.abs(v(s, 'B17')) < 1e-9 },
  ],
  solution: 'Ctrl+G "D5:D9" Enter "=B5*C5" Ctrl+Enter Ctrl+G "E5:E9" Enter "=B5*B13" F4 Ctrl+Enter Ctrl+G "F5:F9" Enter "=D5-E5" Ctrl+Enter Ctrl+G "G5:G9" Enter "=F5/D5" Ctrl+Enter '
    + 'Ctrl+G "B5:F10" Enter Alt+= Ctrl+G "C10" Enter "=D10/B10" Enter Ctrl+G "G10" Enter "=F10/D10" Enter Ctrl+G "H5:H9" Enter "=B5/B10" F4 Ctrl+Enter Ctrl+G "H10" Enter Alt+= Enter',
  optimalKeys: 120,
  route: 60,
  pars: parsFromRoute(60),
};
