// Practice · Finance and Accounting — Two landings (script-drills D06). Seven events from Domain's
// September, each with its amount and two pickers from one list of twelve (Cash, Receivables, PP&E,
// Payables, Debt and Profit, each up or down). Under them a small balance sheet already wired to the
// picks (opening, movement, closing) and a check that assets less claims reads 0. Graded on the
// fourteen picks, either order within a row, since a wrong pair can still balance; the last goal is
// the check read at 0 with every pair right.
import { accountsDrill, buildPage, cutFrom, pickers, picked, pickKeys, SITE, UNITS } from './accounts-drills.js';
import { script } from '../lessons/lib/model-checks.js';

const LINES = ['Cash', 'Receivables', 'PP&E', 'Payables', 'Debt', 'Profit'];
const ITEMS = LINES.flatMap(l => [`${l} up`, `${l} down`]);
const EVENTS = [
  ['washes', 'Washes sold on cards', 10400, ['Receivables up', 'Profit up'], 'the card washes'],
  ['chemicals', 'Chemicals delivered on credit', 2600, ['Payables up', 'Profit down'], 'the chemicals on credit'],
  ['payroll', 'Payroll paid', 5250, ['Cash down', 'Profit down'], 'payroll'],
  ['interest', 'Interest paid on the loan', 8750, ['Cash down', 'Profit down'], 'the loan interest'],
  ['principal', 'Loan principal repaid', 6250, ['Cash down', 'Debt down'], 'the principal repaid'],
  ['wear', 'A week of wear on the tunnel', 2400, ['PP&E down', 'Profit down'], 'a week of wear'],
  ['equipment', 'New tunnel equipment bought', 45000, ['Cash down', 'PP&E up'], 'the new equipment'],
];
const OPENING = { Cash: 40000, Receivables: 10000, 'PP&E': 2000000, Payables: 10800, Debt: 1500000, Profit: 539200 };
const move = r => `=SUMIF($D$5:$D$11,$B${r}&" up",$C$5:$C$11)+SUMIF($E$5:$E$11,$B${r}&" up",$C$5:$C$11)-SUMIF($D$5:$D$11,$B${r}&" down",$C$5:$C$11)-SUMIF($E$5:$E$11,$B${r}&" down",$C$5:$C$11)`;
const bsRow = l => ({ key: l, label: l, fill: (col, r) => ({ C: OPENING[l], D: move(r), E: `=C${r}+D${r}` })[col] });
const sumRow = (key, label, from, to) => ({ key, label, total: true, fill: (col, r, at) => `=SUM(${col}${at(from)}:${col}${at(to)})` });
const PAGE = buildPage({
  name: 'Events', chapter: 5, title: `${SITE}, seven events in September`, units: UNITS, labelHeader: 'Event',
  headers: ['Amount', 'First line', 'Second line'], kinds: ['money', 'text', 'text'],
  blocks: [
    { rows: EVENTS.map(([key, label, amt, pair], i) => ({ key, label, dollar: i === 0, values: [amt, ...pair] })) },
    { title: 'Balance sheet', header: ['Opening', 'Movement', 'Closing'], kinds: ['money', 'money', 'money'], rows: [
      ...['Cash', 'Receivables', 'PP&E'].map(bsRow), sumRow('ta', 'Total assets', 'Cash', 'PP&E'),
      ...['Payables', 'Debt', 'Profit'].map(bsRow), sumRow('tc', 'Total claims', 'Payables', 'Profit'),
    ] },
  ],
  checks: [{ label: 'Assets less claims, closing', formula: (col, r, at) => `=E${at('ta')}-E${at('tc')}` }],
});
const CHECK = 'C' + (PAGE.std.checksRow + 1);
const rowOf = i => 5 + i;
const start = cutFrom(PAGE, cells => { EVENTS.forEach((_, i) => { delete cells['D' + rowOf(i)].value; delete cells['E' + rowOf(i)].value; }); });
const placed = (sh, i) => { const pair = EVENTS[i][3], r = rowOf(i);
  return (picked(sh, 'D' + r, pair[0]) && picked(sh, 'E' + r, pair[1])) || (picked(sh, 'D' + r, pair[1]) && picked(sh, 'E' + r, pair[0])); };
const allPlaced = sh => EVENTS.every((_, i) => placed(sh, i));
const at = (s, ref) => { const a = s.active; return `${String.fromCharCode(64 + a.c)}${a.r}` === ref; };
const rowKeys = i => `${pickKeys(ITEMS, EVENTS[i][3][0])} → ${pickKeys(ITEMS, EVENTS[i][3][1])}`;
const goalKeys = i => `Ctrl+G "D${rowOf(i)}" ↵ ${rowKeys(i)}`;

export default accountsDrill({
  id: 'ch5-two-landings',
  title: 'Two landings',
  task: 'Seven events, and for each you pick the two lines that move, with the balance check telling you when they are all placed.',
  module: 'the-three-statements',
  tab: 'Events',
  start,
  validation: pickers(EVENTS.flatMap((_, i) => ['D' + rowOf(i), 'E' + rowOf(i)]), ITEMS),
  goals: [
    ...EVENTS.map(([key, , , , name], i) => ({ id: key, text: `Pick the two lines that move for ${name} in D${rowOf(i)} and E${rowOf(i)}.`, keys: goalKeys(i),
      check: s => placed(s, i) })),
    { id: 'check', text: `Land on the check in ${CHECK}, which reads 0 with every event placed.`, keys: `Ctrl+G "${CHECK}" ↵`,
      check: s => at(s, CHECK) && s.value(CHECK) === 0 && allPlaced(s) },
  ],
  endState: [
    { text: 'All fourteen picks are right and the balance sheet balances', check: s => allPlaced(s) && s.value(CHECK) === 0 },
  ],
  solution: script(`Ctrl+G "D5" ↵ ${EVENTS.map((_, i) => rowKeys(i)).join(' ↓ ← ')} Ctrl+G "${CHECK}" ↵`),
  optimalKeys: 160,
  route: 75,
});
