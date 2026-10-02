// Chapter 5 · 5.3.5 Debt and interest: the average-balance circle with a breaker (clearcoat-model, B535 → B536)
// The term loan and the delayed-draw loan roll as corkscrews, interest reads the average balance
// through the Circ breaker on Inputs, each tranche carries an effective-rate row that the Checks
// sheet compares with the rate on Inputs, and the totals close the schedule. The circle itself
// closes when the revolver goes in (5.4.4); the closer shows the breaker switching interest over.
import { settled, linesBuilt, liveVia, inputRef, plantLines, fillLines, solutionOf, sheetIn, reads, rowOf, PROJ_COLS } from './lib/model-checks.js';

const AFTER = 'B536';
const S = 'Schedules';
const TERM = ['termOpen', 'termDrawn', 'termRepaid', 'termClose'];
const DD = ['ddOpen', 'ddCum', 'ddDrawn', 'ddRepaid', 'ddClose'];
const EFF = ['termEff', 'ddEff'];
const CHECKS = ['termEff', 'ddEff', 'revEff'];
const TOTALS = ['totalDebt', 'totalInt', 'netDebt'];
const ALL = [...TERM, 'termAvg', 'termInt', ...DD, 'ddAvg', 'ddInt', ...EFF, ...TOTALS];
const lines = (ses, keys) => linesBuilt(ses, S, keys, AFTER);
const live = (ses, ref, key, col) => liveVia(ses, S, ref, [inputRef(key, col)]);
// The Checks rate rows read zero by design, so each is graded on the Schedules rate it compares.
const checksRead = ses => {
  const sh = sheetIn(ses, 'Checks'); if (!sh) return false;
  return CHECKS.every(k => PROJ_COLS.every(c => reads(sh, `${c}${rowOf('Checks', k)}`, [`Schedules!${c}${rowOf(S, k)}`])))
    && linesBuilt(ses, 'Checks', CHECKS, AFTER);
};

const goals = [
  { id: 'term-roll', text: 'Roll the term loan in C79:J82: opening, drawn, repaid and closing, the actual years reading Data through the flag.',
    keys: fillLines(AFTER, S, TERM), requires: ['corkscrew', 'go-to', 'ctrl-enter-fill', 'index-match', 'if-function', 'min-max-cap'], convention: 'C3',
    hintStuck: 'pulse range C79:J82 · Repaid is the smaller of the opening balance and the $3,000 a year on Inputs.',
    check: (s, ses) => settled(ses) && lines(ses, TERM) && live(ses, 'J82', 'termAmort') },
  { id: 'term-interest', text: 'The average balance in C83:J83, then interest in C84:J84 at the rate on the average while Circ is 1.',
    teach: 'Interest on the average balance makes a circle once the revolver is in: interest moves net income, net income moves cash, cash moves the revolver, the revolver moves interest. Iterative calculation settles it, and Circ on Inputs is the breaker: at 0 every tranche reads its opening balance and the circle is gone.',
    keys: fillLines(AFTER, S, ['termAvg', 'termInt']), requires: ['circularity-breaker', 'iterative-calc', 'sum-family', 'if-function', 'go-to', 'ctrl-enter-fill'], convention: 'E8',
    hintStuck: 'pulse range C83:J84 · IF(Circ=1, the rate × the average, the rate × the opening).',
    check: (s, ses) => settled(ses) && lines(ses, ['termAvg', 'termInt']) && live(ses, 'J84', 'termRate') },
  { id: 'dd-roll', text: 'Roll the delayed-draw loan in C88:J92: opening, cumulative draws, drawn, repaid at 10% of the draws, closing.',
    keys: fillLines(AFTER, S, DD), requires: ['corkscrew', 'min-max-cap', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C88:J92 · The draws are on Inputs, row 75; repayment starts the year after the cash comes in.',
    check: (s, ses) => settled(ses) && lines(ses, DD) && live(ses, 'J92', 'ddDraw', 'G') },
  { id: 'dd-interest', text: 'The delayed-draw loan’s average balance and interest in C93:J94, through the same breaker.',
    keys: fillLines(AFTER, S, ['ddAvg', 'ddInt']), requires: ['circularity-breaker', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C93:J94 · The same IF on Circ as the term loan, with the delayed-draw rate.',
    check: (s, ses) => settled(ses) && lines(ses, ['ddAvg', 'ddInt']) && live(ses, 'J94', 'ddRate') },
  { id: 'rates', text: 'Effective rates in C85:J85 and C95:J95, then the three rate checks on Checks in C21:J23.',
    teach: 'Interest over the average balance shows what each loan has cost in the actual years. In the projected years it has to equal the rate on Inputs while Circ is 1, so Checks takes the difference and reads zero; a gap means a wrong balance link or a rate in the wrong units.',
    keys: `${fillLines(AFTER, S, EFF)} ${fillLines(AFTER, 'Checks', CHECKS)}`, requires: ['iferror-function', 'check-cell', 'round-function', 'go-to', 'ctrl-enter-fill'], convention: 'F1',
    hintStuck: 'pulse range C85:J85 · Interest over the average, inside IFERROR; Checks rounds the gap to the rate.',
    check: (s, ses) => settled(ses) && lines(ses, EFF) && live(ses, 'J85', 'termRate') && checksRead(ses) },
  { id: 'totals', text: 'Total debt, total interest and net debt in C109:J111, the revolver’s rows included while they are still empty.',
    keys: fillLines(AFTER, S, TOTALS), requires: ['sum-family', 'cross-sheet-ref', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C109:J111 · Each tranche’s closing balance, then each one’s interest; net debt takes off BS cash.',
    check: (s, ses) => settled(ses) && lines(ses, TOTALS) && live(ses, 'J109', 'termAmort') && live(ses, 'J110', 'termRate') },
  { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!C81" Enter "0" Enter Ctrl+G "Schedules!F84" Enter', cadence: 320 },
    text: 'Does it tie? Watch Circ go to 0: interest reads the opening balance and the rate checks stand down.', requires: [],
    hintStuck: 'pulse range Schedules!F84:J84 · One breaker, on Inputs, labeled, switches every tranche at once.',
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'debt-and-interest-circle',
  chapter: 'finance-and-accounting',
  section: 'Schedules',
  module: 'schedules',
  workbook: 'clearcoat-model',
  state: { before: 'B535', after: AFTER },
  plant: { ...plantLines(AFTER, S, ALL), ...plantLines(AFTER, 'Checks', CHECKS) },
  title: 'Debt and interest: the average-balance circle with a breaker',
  difficulty: 'hard',
  tags: ['model', 'schedules', 'debt', 'interest', 'circularity'],
  access: 'paid',
  minutes: 7,
  headline: '=',
  conventions: ['C3', 'E8', 'F1'],
  teaches: ['circularity-breaker'],
  uses: ['go-to', 'ctrl-enter-fill', 'index-match', 'if-function', 'iferror-function', 'sum-family', 'min-max-cap', 'iterative-calc', 'check-cell', 'round-function', 'cross-sheet-ref', 'corkscrew'],
  prerequisites: ['ppe-and-depreciation'],
  brief: 'A debt tranche rolls: opening, plus draws, less repayments, is closing, and interest is the rate on the average of opening and closing. That average makes a circle once the revolver is in, which iterative calculation settles, and the Circ breaker on Inputs switches it off when it breaks. Build the term loan, the delayed-draw loan, their rate checks and the totals. The key is `=`.',
  goals,
  endState: [
    { text: 'Both tranches roll with interest through the breaker, the rate checks are on Checks, and the totals are built', check: (s, ses) => lines(ses, ALL) && linesBuilt(ses, 'Checks', CHECKS, AFTER) },
  ],
  closing: [
    'Two tranches roll with interest on the average, and a switch stops the circle when it breaks.',
    'Best practice: one breaker for the whole model, on Inputs, labeled, and circles only where the accounting demands them.',
  ],
  solution: solutionOf(goals),
};
