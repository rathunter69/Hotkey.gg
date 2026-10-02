// Practice · Finance and Accounting — Is it revenue? (script-drills D01). Eight lines of money that
// reached Domain's bank in September, each with its source and amount, and a picker beside each:
// Revenue, Other income or Not income. Pick a class for every line, then total revenue and other
// income with SUMIF on the picks. Graded on the eight picks, both totals calling SUMIF (or SUMIFS),
// tying to the picks and moving when an amount does.
import { accountsDrill, buildPage, cutFrom, pickers, picked, pickKeys, ties, SITE, UNITS } from './accounts-drills.js';
import { calls } from '../lessons/lib/databook-checks.js';
import { script } from '../lessons/lib/model-checks.js';

const CLASSES = ['Revenue', 'Other income', 'Not income'];
const LINES = [
  ['Retail washes', 'Site POS', 104250, 'Revenue'],
  ['Member fees earned this month', 'Club billing', 45000, 'Revenue'],
  ['Vending and vacuums', 'Vending log', 3100, 'Revenue'],
  ['Insurance payout for a damaged arch', 'Insurer', 18000, 'Other income'],
  ['Interest on the bank balance', 'Bank', 120, 'Other income'],
  ['Card settlement for August washes', 'Card processor', 9800, 'Not income'],
  ['Loan drawn', 'Bank', 150000, 'Not income'],
  ['Member fees billed for October', 'Club billing', 45000, 'Not income'],
];
const F = { rev: '=SUMIF(E5:E12,"Revenue",D5:D12)', other: '=SUMIF(E5:E12,"Other income",D5:D12)' };
const PAGE = buildPage({
  name: 'Inflows', chapter: 5, title: `${SITE}, money in for September`, units: UNITS, labelHeader: 'Inflow',
  headers: ['Source', 'Amount', 'Class'], kinds: ['text', 'money', 'text'],
  blocks: [
    { rows: LINES.map(([label, src, amt, cls], i) => ({ key: 'l' + i, label, dollar: i === 0, values: [src, amt, cls] })) },
    { rows: [{ key: 'rev', label: 'Revenue', dollar: true, values: [null, F.rev] }, { key: 'other', label: 'Other income', dollar: true, values: [null, F.other] }] },
  ],
  source: 'Source: bank statement and site POS, September',
});
const PICKS = LINES.map((_, i) => 'E' + (5 + i));
const start = cutFrom(PAGE, cells => { for (const r of PICKS) delete cells[r].value; delete cells.D14.formula; delete cells.D15.formula; });
const sumif = (sh, ref) => calls(sh, ref, ['SUMIF']) || calls(sh, ref, ['SUMIFS']);
const classed = sh => LINES.every(([, , , cls], i) => picked(sh, PICKS[i], cls));
const total = (sh, ref, cls) => sumif(sh, ref) && ties(sh, ref, LINES.reduce((a, l, i) => a + (picked(sh, PICKS[i], cls) ? sh.value('D' + (5 + i)) : 0), 0), [`D${5 + LINES.findIndex(l => l[3] === cls)}`]);
const KEYS = {
  classes: `Ctrl+G "E5" ↵ ${LINES.map(l => pickKeys(CLASSES, l[3])).join(' ↓ ')}`,
  rev: `Ctrl+G "D14" ↵ '${F.rev}' ↵`,
  other: `'${F.other}' ↵`,
};

export default accountsDrill({
  id: 'ch5-is-it-revenue',
  title: 'Is it revenue?',
  task: 'Eight lines of money came in this month, so mark what is revenue and total it.',
  module: 'the-three-statements',
  tab: 'Inflows',
  start,
  validation: pickers(PICKS, CLASSES),
  goals: [
    { id: 'classes', text: 'Pick Revenue, Other income or Not income in E5:E12 for each of the eight lines of money.', keys: KEYS.classes,
      check: s => classed(s) },
    { id: 'rev', text: 'Total revenue in D14 with SUMIF over the classes in E5:E12.', keys: KEYS.rev,
      check: (s, ses) => !ses.editing && total(s, 'D14', 'Revenue') },
    { id: 'other', text: 'Total other income in D15 the same way.', keys: KEYS.other,
      check: (s, ses) => !ses.editing && total(s, 'D15', 'Other income') },
  ],
  endState: [
    { text: 'Every line carries its class, and both totals are SUMIFs over the picks that move with the amounts', check: s => classed(s) && total(s, 'D14', 'Revenue') && total(s, 'D15', 'Other income') },
  ],
  solution: script(Object.values(KEYS).join(' ')),
  optimalKeys: 130,
  route: 30,
});
