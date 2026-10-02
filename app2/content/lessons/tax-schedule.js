// Chapter 5 · 5.3.6 Tax (clearcoat-model, B536 → B541)
// EBT linked from the income statement, tax at the rate on profit only (MAX), a tax-loss
// carry-forward as a corkscrew, the tax charge net of losses used, and the effective rate. The
// projected income statement isn't linked yet, so the projected rows read zero: the actual years
// carry the liveness test, the projected ones are graded on what they read, and the closer types
// a loss over EBT to show the carry-forward.
import { settled, sheetIn, reads, linesBuilt, liveVia, inputRef, plantLines, fillLines, solutionOf } from './lib/model-checks.js';

const AFTER = 'B541';
const S = 'Schedules';
const LOSS_IN = ['lossOpen', 'lossAdd'];
const LOSS_OUT = ['lossUsed', 'lossClose'];
const CHARGE = ['taxCharge', 'effTax'];
const ALL = ['ebt', 'taxBefore', ...LOSS_IN, ...LOSS_OUT, ...CHARGE];
const lines = (ses, keys) => linesBuilt(ses, S, keys, AFTER);
const via = (ses, ref, input) => liveVia(ses, S, ref, [input]);

const goals = [
  { id: 'ebt', text: 'Earnings before tax in C114:J114: a link to the income statement’s EBT line.',
    keys: fillLines(AFTER, S, ['ebt']), requires: ['cross-sheet-ref', 'go-to', 'ctrl-enter-fill'], convention: 'C3',
    hintStuck: 'pulse range C114:J114 · EBT is on row 29 of IS; the projected years fill in when the statement is linked.',
    check: (s, ses) => settled(ses) && lines(ses, ['ebt']) && via(ses, 'E114', 'Data!F5') },
  { id: 'before-losses', text: 'Tax before losses in C115:J115: the tax rate on Inputs times EBT, and nothing when EBT is a loss.',
    keys: fillLines(AFTER, S, ['taxBefore']), requires: ['min-max-cap', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C115:J115 · MAX(EBT,0) × the rate on Inputs, row 84.',
    check: (s, ses) => settled(ses) && lines(ses, ['taxBefore']) && liveVia(ses, S, 'E115', [inputRef('tax')]) },
  { id: 'losses-in', text: 'Tax losses in C116:J117: the opening balance is last year’s closing, and a loss year adds its loss.',
    teach: 'A year with a loss pays no tax and leaves a tax loss the company can set against later profits. The schedule carries it as a balance, a corkscrew like the debt: opening, plus a year’s loss, less what profit uses up, closing. The actual years carry none.',
    keys: fillLines(AFTER, S, LOSS_IN), requires: ['tax-losses', 'corkscrew', 'min-max-cap', 'if-function', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C116:J117 · Through the flag: zero in an actual year, MAX(−EBT,0) in a projected one.',
    check: (s, ses) => settled(ses) && lines(ses, LOSS_IN) && reads(sheetIn(ses, S), 'J117', ['J114']) && reads(sheetIn(ses, S), 'J116', ['I119']) },
  { id: 'losses-out', text: 'The losses used against profit in C118:J118, as a negative, then the closing balance in C119:J119.',
    keys: fillLines(AFTER, S, LOSS_OUT), requires: ['tax-losses', 'min-max-cap', 'sum-family', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C118:J119 · The smaller of the opening losses and this year’s profit, with the sign turned.',
    check: (s, ses) => settled(ses) && lines(ses, LOSS_OUT) && reads(sheetIn(ses, S), 'J118', ['J116', 'J114']) && reads(sheetIn(ses, S), 'J119', ['J116', 'J118']) },
  { id: 'charge', text: 'The tax charge in C120:J120, net of the losses used at the rate, then the effective tax rate in C121:J121.',
    teach: 'The model takes the tax charge as the tax paid. In real accounts a tunnel is written off faster for tax than in the books, which defers part of the bill as deferred tax on the balance sheet; this model carries none, and the schedule says so.',
    keys: fillLines(AFTER, S, CHARGE), requires: ['tax-losses', 'index-match', 'if-function', 'iferror-function', 'go-to', 'ctrl-enter-fill'], convention: 'B4',
    hintStuck: 'pulse range C120:J121 · Tax before losses plus the losses used × the rate; the actual years read Data.',
    check: (s, ses) => settled(ses) && lines(ses, CHARGE) && reads(sheetIn(ses, S), 'J120', ['J115', 'J118']) && liveVia(ses, S, 'E121', ['Data!F5']) },
  { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Schedules!G114" Enter "-5000" Tab "3000" Enter Ctrl+G "Schedules!G119" Enter', cadence: 320 },
    text: 'Does it tie? Watch a $5.0m loss go into FY28 and a $3.0m profit into FY29: the loss waits, then FY29 pays no tax.', requires: [],
    hintStuck: 'pulse range Schedules!G116:H120 · The loss carried forward shelters the next profit.',
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'tax-schedule',
  chapter: 'finance-and-accounting',
  section: 'Schedules',
  module: 'schedules',
  workbook: 'clearcoat-model',
  state: { before: 'B536', after: AFTER },
  plant: plantLines(AFTER, S, ALL),
  title: 'Tax',
  difficulty: 'medium',
  tags: ['model', 'schedules', 'tax'],
  access: 'paid',
  minutes: 5,
  headline: '=',
  conventions: ['C3', 'B4'],
  teaches: ['tax-losses'],
  uses: ['go-to', 'ctrl-enter-fill', 'cross-sheet-ref', 'min-max-cap', 'if-function', 'iferror-function', 'index-match', 'sum-family', 'corkscrew'],
  prerequisites: ['debt-and-interest-circle'],
  brief: 'Tax is the rate on earnings before tax, and only when they are positive, which MAX handles: MAX(EBT,0) × the rate. A loss leaves a tax loss the company can use later, and the schedule carries it forward as a balance until profits absorb it. Build the schedule with the carry-forward, and read why a downside case pays less tax than the rate suggests. The key is `=`.',
  goals,
  endState: [
    { text: 'The tax schedule runs from EBT to the effective tax rate, with the loss carry-forward', check: (s, ses) => lines(ses, ALL) },
  ],
  closing: [
    'Tax runs at the rate when there’s profit, and a loss waits its turn.',
    'Best practice: carry tax losses as a balance of their own, so a buyer can see what they shelter and when they run out.',
  ],
  solution: solutionOf(goals),
};
