// Practice · Finance and Accounting — Name the driver (script-drills D66). Six working capital
// balances at FY25 and FY26 with a picker beside each, from one list in alphabetical order: Cost of
// sales, Insurance cost, Membership revenue, Revenue, Site labor, Tax expense. Match each balance to
// the line that moves it. Graded on the six picks.
import { accountsDrill, buildPage, cutFrom, pickers, picked, pickKeys } from './accounts-drills.js';
import { script } from '../lessons/lib/model-checks.js';

const DRIVERS = ['Cost of sales', 'Insurance cost', 'Membership revenue', 'Revenue', 'Site labor', 'Tax expense'];
const BALANCES = [
  ['rec', 'Card receivables', 410, 520, 'Revenue', 'card receivables'],
  ['pay', 'Chemical payables', 880, 1010, 'Cost of sales', 'chemical payables'],
  ['def', 'Deferred membership revenue', 1350, 1620, 'Membership revenue', 'deferred membership revenue'],
  ['payroll', 'Accrued payroll', 300, 360, 'Site labor', 'accrued payroll'],
  ['ins', 'Prepaid insurance', 140, 150, 'Insurance cost', 'prepaid insurance'],
  ['tax', 'Tax payable', 520, 610, 'Tax expense', 'tax payable'],
];
const PAGE = buildPage({
  name: 'Drivers', chapter: 5, title: 'Clearcoat Express, six balances and what moves them', units: 'USD thousands', labelHeader: 'Balance',
  headers: ['FY25', 'FY26', 'Driver'], kinds: ['money', 'money', 'text'],
  blocks: [{ rows: BALANCES.map(([key, label, a, b, drv], i) => ({ key, label, dollar: i === 0, values: [a, b, drv] })) }],
  source: 'Source: FY26 balance sheet and the FY25 audited accounts',
});
const ref = i => 'E' + (5 + i);
const start = cutFrom(PAGE, cells => { BALANCES.forEach((_, i) => { delete cells[ref(i)].value; }); });
const matched = (sh, i) => picked(sh, ref(i), BALANCES[i][4]);
const keysFor = i => `Ctrl+G "${ref(i)}" ↵ ${pickKeys(DRIVERS, BALANCES[i][4])}`;

export default accountsDrill({
  id: 'ch5-name-the-driver',
  title: 'Name the driver',
  task: 'Six balances and six drivers, so match each balance to the line that moves it.',
  module: 'schedules',
  tab: 'Drivers',
  start,
  validation: pickers(BALANCES.map((_, i) => ref(i)), DRIVERS),
  goals: BALANCES.map(([key, , , , , name], i) => ({ id: key, text: `Pick the line that drives ${name} in ${ref(i)}.`, keys: keysFor(i), check: s => matched(s, i) })),
  endState: [
    { text: 'Every balance is matched to the line that drives it', check: s => BALANCES.every((_, i) => matched(s, i)) },
  ],
  solution: script(`Ctrl+G "E5" ↵ ${BALANCES.map((b, i) => pickKeys(DRIVERS, b[4])).join(' ↓ ')}`),
  optimalKeys: 60,
  route: 30,
});
