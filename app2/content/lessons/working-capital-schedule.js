// Chapter 5 · 5.3.3 Working capital: days to balances, deferred membership revenue (clearcoat-model, B533 → B534)
// Three balances from three day counts (receivables on revenue, payables on cost of sales and site
// costs, deferred revenue on membership revenue), the implied days the actuals give, the change in
// each balance as its cash effect, and the cash conversion cycle as a memo.
import { settled, linesBuilt, liveVia, inputRef, plantLines, fillLines, solutionOf } from './lib/model-checks.js';

const AFTER = 'B534';
const S = 'Schedules';
const BAL = ['rec', 'pay', 'def'];
const IMPLIED = ['nwc', 'recDaysImp', 'payDaysImp', 'defDaysImp'];
const CHANGES = ['chgRec', 'chgPay', 'chgDef'];
const lines = (ses, keys, cols) => linesBuilt(ses, S, keys, AFTER, cols);

const goals = [
  { id: 'receivables', text: 'Receivables in C46:J46: revenue ÷ 365 × the receivable days on Inputs, through the flag.',
    teach: 'In a model, working capital is a set of days: card takings settle in three days, suppliers are paid in thirty, members prepay about fifteen days of washes. A balance is its driver ÷ 365 × its days. The days here sit on the closing balance; a model that puts them on the average has to solve the closing balance instead, so the schedule’s title says which.',
    keys: fillLines(AFTER, S, ['rec']), requires: ['working-capital-days', 'go-to', 'ctrl-enter-fill', 'index-match', 'if-function'], convention: 'B4',
    hintStuck: 'pulse range C46:J46 · Total revenue is on row 26; the days are on Inputs, row 68.',
    check: (s, ses) => settled(ses) && lines(ses, ['rec']) && liveVia(ses, S, 'J46', [inputRef('recDays')]) },
  { id: 'liabilities', text: 'Payables on cost of sales plus site costs, and deferred revenue on membership revenue, in C47:J48.',
    keys: fillLines(AFTER, S, ['pay', 'def']), requires: ['working-capital-days', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C47:J48 · Each balance reads its own base and its own day count.',
    check: (s, ses) => settled(ses) && lines(ses, ['pay', 'def']) && liveVia(ses, S, 'J47', [inputRef('payDays')]) && liveVia(ses, S, 'J48', [inputRef('defDays')]) },
  { id: 'implied', text: 'Net working capital, then the days each actual balance implies, in C49:J52.',
    teach: 'The implied days are the check on the inputs: the actual years say what the business really collects and pays in, and the projection days should sit close to them. A projected day count with no history behind it is a guess.',
    keys: fillLines(AFTER, S, IMPLIED), requires: ['working-capital-days', 'iferror-function', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C49:J52 · Each implied count is the balance over its base, times 365.',
    check: (s, ses) => settled(ses) && lines(ses, IMPLIED) && liveVia(ses, S, 'J51', [inputRef('payDays')]) },
  { id: 'changes', text: 'The cash effect of each balance in C53:J55: the change from last year, receivables with the sign turned.',
    teach: 'A rise in receivables is cash the company hasn’t collected yet, so it uses cash and carries a minus. A rise in payables or deferred revenue is cash it holds before it pays or delivers, so it brings cash in. FY24 reads its opening balance off Data.',
    keys: fillLines(AFTER, S, CHANGES), requires: ['working-capital-days', 'index-match', 'if-function', 'go-to', 'ctrl-enter-fill'], convention: 'C4',
    hintStuck: 'pulse range C53:J55 · This year’s balance less last year’s; the period counter finds FY24.',
    check: (s, ses) => settled(ses) && lines(ses, CHANGES) && liveVia(ses, S, 'F54', [inputRef('payDays')]) },
  { id: 'total', text: 'Add the three cash effects in C56:J56, the line the cash flow statement will read.',
    keys: fillLines(AFTER, S, ['wcCash']), requires: ['sum-family', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C56:J56 · A SUM over the three changes above.',
    check: (s, ses) => settled(ses) && lines(ses, ['wcCash']) && liveVia(ses, S, 'F56', [inputRef('payDays')]) },
  { id: 'cycle', text: 'The cash conversion cycle in C57: receivable days less payable days less deferred-revenue days.',
    teach: 'Clearcoat’s is −42 days, a rough read since each count sits on its own base, and the sign is the point: suppliers and members fund the business before it pays for anything, so working capital hands cash back as the rollout grows.',
    keys: fillLines(AFTER, S, ['ccc'], ['C']), requires: ['working-capital-days', 'go-to'],
    hintStuck: 'pulse cell C57 · Three day counts from Inputs, one minus the other two.',
    check: (s, ses) => settled(ses) && lines(ses, ['ccc'], ['C']) && liveVia(ses, S, 'C57', [inputRef('payDays')]) },
  { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!C69" Enter "45" Enter Ctrl+G "Schedules!F56" Enter', cadence: 320 },
    text: 'Does it tie? Watch payable days go to 45: the cash effect jumps in FY27 and settles back after.', requires: [],
    hintStuck: 'pulse range Schedules!F56:J56 · A one-off rise in a balance is a one-off cash inflow.',
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'working-capital-schedule',
  chapter: 'finance-and-accounting',
  section: 'Schedules',
  module: 'schedules',
  workbook: 'clearcoat-model',
  state: { before: 'B533', after: AFTER },
  plant: plantLines(AFTER, S, [...BAL, ...IMPLIED, ...CHANGES, 'wcCash', 'ccc']),
  title: 'Working capital: days to balances, deferred membership revenue',
  difficulty: 'medium',
  tags: ['model', 'schedules', 'working capital'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['B4', 'C4'],
  teaches: ['working-capital-days'],
  uses: ['go-to', 'ctrl-enter-fill', 'index-match', 'if-function', 'iferror-function', 'sum-family', 'cost-behaviour'],
  prerequisites: ['cost-build'],
  brief: 'On a balance sheet, working capital is a set of balances; in a model it’s a set of days: receivables at three days of revenue, payables at thirty days of costs, deferred revenue at fifteen days of membership revenue. Each balance is its driver ÷ 365 × its days, and the change in each from year to year is what moves cash. Build the balances, the implied days, the changes and the cycle. The key is `=`.',
  goals,
  endState: [
    { text: 'The working-capital schedule runs from the balances to the cash conversion cycle', check: (s, ses) => lines(ses, [...BAL, ...IMPLIED, ...CHANGES, 'wcCash']) && lines(ses, ['ccc'], ['C']) },
  ],
  closing: [
    'Three day counts became three balances, and their changes are what move cash.',
    'Best practice: let the implied days from the actuals decide the projection days, and label which balance the days sit on.',
  ],
  solution: solutionOf(goals),
};
