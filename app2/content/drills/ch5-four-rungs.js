// Practice · Finance and Accounting — Four rungs (script-drills D13). One site's month four times,
// each with one more timing gap between profit and cash: all cash, then depreciation, then three days
// of unsettled card sales, then chemicals on thirty days and member fees collected ahead. Build cash
// from operations at each rung from one formula filled right. Graded on each rung tying to its own
// column's lines and moving the right way with every one of them (a what-if on each line), so the receivables
// come off and the two liabilities go on.
import { accountsDrill, buildPage, cutFrom, ties, slopes, SITE, UNITS } from './accounts-drills.js';
import { script } from '../lessons/lib/model-checks.js';

const COLS = ['C', 'D', 'E', 'F'];
const RUNGS = {   // net income, depreciation, rise in receivables, rise in payables, rise in deferred revenue
  C: [30000, 0, 0, 0, 0], D: [27600, 2400, 0, 0, 0], E: [27600, 2400, 4200, 0, 0], F: [27600, 2400, 4200, 2600, 6000],
};
const LINES = ['Net income', 'Depreciation', 'Rise in receivables', 'Rise in payables', 'Rise in deferred revenue'];
const F = '=C5+C6-C7+C8+C9';
const PAGE = buildPage({
  name: 'Rungs', chapter: 5, title: `${SITE}, one month four ways`, units: UNITS,
  headers: ['All cash', 'Depreciation', 'Card lag', 'Paid and billed ahead'],
  blocks: [
    { rows: LINES.map((label, i) => ({ key: 'l' + i, label, dollar: i === 0, values: COLS.map(c => RUNGS[c][i]) })) },
    { rows: [{ key: 'cfo', label: 'Cash from operations', total: true, final: true, fill: col => F.replace(/C/g, col) }] },
  ],
});
const CFO = PAGE.at.cfo;   // 11
const start = cutFrom(PAGE, cells => { for (const c of COLS) delete cells[c + CFO].formula; });
const rung = (sh, col) => { const v = r => sh.value(col + r) || 0; return v(5) + v(6) - v(7) + v(8) + v(9); };
const SIGNS = { 5: 1, 6: 1, 7: -1, 8: 1, 9: 1 };
const built = (sh, col) => ties(sh, col + CFO, rung(sh, col), [col + 7]) && slopes(sh, col + CFO, Object.fromEntries(Object.entries(SIGNS).map(([r, sg]) => [col + r, sg])));
const KEYS = {
  cash: `Ctrl+G "C${CFO}" ↵ "${F}" ↵`,
  dep: `Ctrl+G "C${CFO}:D${CFO}" ↵ Ctrl+R`,
  lag: `Ctrl+G "D${CFO}:E${CFO}" ↵ Ctrl+R`,
  ahead: `Ctrl+G "E${CFO}:F${CFO}" ↵ Ctrl+R`,
};

export default accountsDrill({
  id: 'ch5-four-rungs',
  title: 'Four rungs',
  task: 'One site’s month four times over, each with one more timing gap, so build cash from operations at each rung.',
  module: 'the-three-statements',
  tab: 'Rungs',
  start,
  goals: [
    { id: 'cash', text: `Build cash from operations in C${CFO} for the all cash month, from the five lines above it.`, keys: KEYS.cash,
      check: (s, ses) => !ses.editing && built(s, 'C') },
    { id: 'dep', text: `Fill it right into D${CFO}, the month that charges depreciation.`, keys: KEYS.dep,
      check: (s, ses) => !ses.editing && built(s, 'D') },
    { id: 'lag', text: `Fill it on into E${CFO}, the month with three days of card sales not yet settled.`, keys: KEYS.lag,
      check: (s, ses) => !ses.editing && built(s, 'E') },
    { id: 'ahead', text: `Fill it on into F${CFO}, with chemicals on thirty days and member fees collected ahead.`, keys: KEYS.ahead,
      check: (s, ses) => !ses.editing && built(s, 'F') },
  ],
  endState: [
    { text: 'Every rung takes the rise in receivables off and adds the two liabilities, and moves with each of its lines', check: s => COLS.every(c => built(s, c)) },
  ],
  solution: script(`${KEYS.cash} Ctrl+G "C${CFO}:F${CFO}" ↵ Ctrl+R`),
  optimalKeys: 50,
  route: 75,
});
