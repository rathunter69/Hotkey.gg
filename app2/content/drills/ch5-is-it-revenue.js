// Practice · Finance and Accounting — Is it revenue? (script-drills.md D01; after 5.1.3; 60 s; Wave 1).
// Eight lines of money came in for one site this month. A drop-down in D classes each one (M85:
// Alt+↓ opens the list, the grader reads the value picked), and two SUMIFs on the picks total
// revenue and other income. The totals are graded with a what-if (M84): the grader changes an
// amount and flips two picks, and the totals must move the way the reference route's do, so a
// typed total or a sum of hand-picked cells doesn't pass.
import { parsFromRoute } from '../../app/pars.js';
import { buildPage, cutFrom, emptied } from './austin.js';

const CLASSES = ['Revenue', 'Other income', 'Not income'];
/** The lines, the amounts (USD) and where each came from; the class is the answer. */
const LINES = [
  ['retail', 'Retail washes', 182400, 'Site POS', 'Revenue'],
  ['members', 'Member fees earned this month', 96300, 'Billing system', 'Revenue'],
  ['vending', 'Vending and vacuums', 6850, 'Site POS', 'Revenue'],
  ['payout', 'Insurance payout, damaged arch', 14000, 'Insurer letter', 'Other income'],
  ['interest', 'Interest on the bank balance', 420, 'Bank statement', 'Other income'],
  ['settle', 'Card settlement for August washes', 41200, 'Bank statement', 'Not income'],
  ['loan', 'Loan drawn', 250000, 'Loan agreement', 'Not income'],
  ['ahead', 'Member fees billed for October', 98100, 'Billing system', 'Not income'],
];
const FIRST = 5, LAST = FIRST + LINES.length - 1;   // 5 to 12
const sumOf = cls => LINES.filter(l => l[4] === cls).reduce((t, l) => t + l[2], 0);
const REVENUE = sumOf('Revenue'), OTHER = sumOf('Other income');

const PAGE = buildPage({
  name: 'Inflows', chapter: 5, title: 'Mueller inflows, September', units: 'USD unless stated', labelHeader: 'Inflow',
  headers: ['Amount', 'Class', 'Source'], kinds: ['money', 'text', 'text'],
  blocks: [
    { rows: LINES.map(([key, label, amount, source, cls]) => ({ key, label, values: [amount, cls, source] })) },
    { rows: [
      { key: 'rev', label: 'Revenue', total: true, values: [`=SUMIF(D${FIRST}:D${LAST},"Revenue",C${FIRST}:C${LAST})`, null, null] },
      { key: 'oth', label: 'Other income', values: [`=SUMIF(D${FIRST}:D${LAST},"Other income",C${FIRST}:C${LAST})`, null, null] },
    ] },
  ],
  source: 'Source: site POS, billing system and bank statement, September',
});
const REV = PAGE.at.rev, OTH = PAGE.at.oth;   // 14 and 15
const PICKS = LINES.map((_, i) => 'D' + (FIRST + i));
// every class cell is a drop-down of the three classes (Data Validation, List)
const VALIDATION = Object.fromEntries(PICKS.map(ref => [ref, { allow: 'list', source: CLASSES.join(','), inCell: true, ignoreBlank: true, errStyle: 'stop' }]));

const start = cutFrom(PAGE, (cells, sh) => {
  emptied(cells, [...PICKS, 'C' + REV, 'C' + OTH]);
  sh.validation = VALIDATION;
  sh.active = { r: FIRST, c: 4 };   // D5, the first pick
});
const SOLVED = { ...PAGE.sheet, validation: VALIDATION };

const picked = (s, from, to, cls) => { for (let r = from; r <= to; r++) if (s.value('D' + r) !== cls) return false; return true; };
const isFormula = (s, ref) => { const c = s.cells[ref]; return !!(c && c.formula); };
const near = (v, want) => typeof v === 'number' && Math.abs(v - want) < 0.005;

export default {
  id: 'ch5-is-it-revenue',
  chapter: 'finance-and-accounting',
  title: 'Is it revenue?',
  task: 'Eight lines of money came in this month: mark what is revenue and total it.',
  access: 'paid',
  lesson: 'the-cash-flow-statement',
  sheet: start,
  sheets: [{ name: 'Inflows' }],
  solved: SOLVED,
  goals: [
    { id: 'revenue', text: 'Class the first three lines as Revenue with the drop-downs in D5:D7: Alt+↓ opens one.', keys: 'Alt+↓ R ↵ ↓ Alt+↓ R ↵ ↓ Alt+↓ R ↵ ↓',
      check: s => picked(s, 5, 7, 'Revenue') },
    { id: 'other', text: 'The insurance payout and the interest are Other income: pick it in D8:D9.', keys: 'Alt+↓ O ↵ ↓ Alt+↓ O ↵ ↓',
      check: s => picked(s, 8, 9, 'Other income') },
    { id: 'not', text: 'The settlement, the loan and the fees billed ahead are Not income: pick it in D10:D12.', keys: 'Alt+↓ N ↵ ↓ Alt+↓ N ↵ ↓ Alt+↓ N ↵',
      check: s => picked(s, 10, 12, 'Not income') },
    { id: 'rev-total', text: `Total revenue in C${REV} with SUMIF on the classes in D.`, keys: `Ctrl+G "C${REV}" ↵ '=SUMIF(D${FIRST}:D${LAST},"Revenue",C${FIRST}:C${LAST})' ↵`,
      check: s => isFormula(s, 'C' + REV) && near(s.value('C' + REV), REVENUE) },
    { id: 'oth-total', text: `Total other income in C${OTH} the same way.`, keys: `'=SUMIF(D${FIRST}:D${LAST},"Other income",C${FIRST}:C${LAST})' ↵`,
      check: s => isFormula(s, 'C' + OTH) && near(s.value('C' + OTH), OTHER) },
  ],
  // M84: a typed total or a sum of hand-picked lines shows the same figure on the seed; under a new
  // retail amount and two flipped picks only SUMIFs on the classes move with the reference
  whatIf: {
    cases: [{ C5: 190000 }, { D9: 'Revenue', D12: 'Other income' }],
    answers: ['C' + REV, 'C' + OTH],
    why: 'A total doesn’t follow the classes: SUMIF on D, so a changed pick moves it.',
  },
  solution: `Alt+Down R Enter Down Alt+Down R Enter Down Alt+Down R Enter Down `
    + 'Alt+Down O Enter Down Alt+Down O Enter Down '
    + 'Alt+Down N Enter Down Alt+Down N Enter Down Alt+Down N Enter '
    + `Ctrl+G "C${REV}" Enter '=SUMIF(D${FIRST}:D${LAST},"Revenue",C${FIRST}:C${LAST})' Enter '=SUMIF(D${FIRST}:D${LAST},"Other income",C${FIRST}:C${LAST})' Enter`,
  optimalKeys: 105,
  route: 30,
  pars: parsFromRoute(30),
};
