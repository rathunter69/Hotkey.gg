// Chapter 5 · 5.4.4 The cash sweep and the revolver (clearcoat-model, B544 → B551)
// The revolver block on Schedules: opening, cash before the revolver from the CF, the minimum cash on
// Inputs, the draw as a MAX, the repayment as a MIN of a MAX, closing, the average and interest
// through the Circ breaker, and the effective rate. The CF line and the BS line already read these
// rows (5.4.2, 5.4.3), so writing them closes the model's one circle. The base case never draws, so
// liveness runs through minimum cash; the closer forces a shortfall.
import { settled, sheetIn, reads, linesBuilt, liveVia, inputRef, plantLines, fillLines, solutionOf } from './lib/model-checks.js';

const AFTER = 'B551';
const S = 'Schedules';
const HEAD = ['revOpen', 'revCbr', 'revMin'];
const ROLL = ['revClose', 'revAvg', 'revInt'];
const ALL = [...HEAD, 'revDrawn', 'revRepaid', ...ROLL, 'revEff'];
const lines = (ses, keys) => linesBuilt(ses, S, keys, AFTER);
const live = (ses, ref, key) => liveVia(ses, S, ref, [inputRef(key)]);

const goals = [
  { id: 'head', text: 'The revolver’s opening balance in C98:J98, cash before the revolver in C99:J99 from the CF, and minimum cash in C100:J100.',
    teach: 'A model can’t let cash go below what the business needs to trade, and it shouldn’t let cash pile up while it pays interest. The revolver is the last line of financing: it draws when cash before it would fall below the minimum and repays when there is surplus.',
    keys: fillLines(AFTER, S, HEAD), requires: ['cash-sweep', 'corkscrew', 'index-match', 'if-function', 'cross-sheet-ref', 'go-to', 'ctrl-enter-fill'], convention: 'B4',
    hintStuck: 'pulse range C98:J100 · Cash before the revolver is CF row 23; minimum cash is Inputs row 80.',
    check: (s, ses) => settled(ses) && lines(ses, HEAD) && live(ses, 'J99', 'capexSite') && live(ses, 'J100', 'minCash') },
  { id: 'draw', text: 'The draw in C101:J101: the minimum less the cash before the revolver, floored at zero with MAX.',
    keys: fillLines(AFTER, S, ['revDrawn']), requires: ['cash-sweep', 'min-max-cap', 'if-function', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C101:J101 · MAX(minimum cash − cash before the revolver, 0), zero in an actual year.',
    check: (s, ses) => settled(ses) && lines(ses, ['revDrawn']) && live(ses, 'J101', 'minCash') },
  { id: 'repay', text: 'The repayment in C102:J102, as a negative: the surplus over the minimum, capped at the opening balance with MIN.',
    keys: fillLines(AFTER, S, ['revRepaid']), requires: ['cash-sweep', 'min-max-cap', 'if-function', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C102:J102 · −MIN(MAX(cash before − minimum, 0), opening): MIN and MAX, never an IF tower.',
    check: (s, ses) => settled(ses) && lines(ses, ['revRepaid']) && ['F', 'J'].every(c => reads(sheetIn(ses, S), `${c}102`, [`${c}98`, `${c}99`, `${c}100`])) },
  { id: 'roll', text: 'The closing balance, the average and interest in C103:J105, interest through the Circ breaker like the other tranches.',
    teach: 'This closes the circle from 5.3.5: interest moves net income, net income moves cash, cash moves the revolver, and the revolver moves interest. Iterative calculation settles it, and Circ on Inputs switches it off.',
    keys: fillLines(AFTER, S, ROLL), requires: ['circularity-breaker', 'corkscrew', 'sum-family', 'go-to', 'ctrl-enter-fill'], convention: 'E8',
    hintStuck: 'pulse range C103:J105 · Opening plus drawn plus repaid; the rate is Inputs row 78.',
    check: (s, ses) => settled(ses) && lines(ses, ROLL) && live(ses, 'J105', 'minCash') },
  { id: 'rate', text: 'The revolver’s effective rate in C106:J106: interest over the average balance, inside IFERROR.',
    keys: fillLines(AFTER, S, ['revEff']), requires: ['iferror-function', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C106:J106 · The same row as under the other two tranches; Checks already reads it.',
    check: (s, ses) => settled(ses) && lines(ses, ['revEff']) && live(ses, 'J106', 'minCash') },
  { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!C61" Enter "6000" Enter Ctrl+G "Schedules!F101" Enter', cadence: 320 },
    text: 'Does it tie? Watch capex per site go to $6.0m: the revolver draws in the rollout years, and cash holds at the minimum.', requires: [],
    hintStuck: 'pulse range Schedules!F101:J103 · The draw fills the gap to the minimum; surplus pays it back.',
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'cash-sweep-revolver',
  chapter: 'finance-and-accounting',
  section: 'Linking the statements',
  module: 'linking-the-statements',
  workbook: 'clearcoat-model',
  state: { before: 'B544', after: AFTER },
  plant: plantLines(AFTER, S, ALL),
  title: 'The cash sweep and the revolver',
  difficulty: 'hard',
  tags: ['model', 'revolver', 'cash sweep', 'circularity'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['B4', 'E8'],
  teaches: ['cash-sweep'],
  uses: ['go-to', 'ctrl-enter-fill', 'index-match', 'if-function', 'iferror-function', 'cross-sheet-ref', 'sum-family', 'min-max-cap', 'corkscrew', 'circularity-breaker'],
  prerequisites: ['bs-cash-not-a-plug'],
  brief: 'The revolver draws when cash would fall below the minimum and repays when there is surplus: the draw is MAX(minimum − cash before the revolver, 0) and the repayment is MIN(surplus, opening balance), so it’s MIN and MAX again, never an IF tower. The cash flow and the balance sheet already read its rows. Build the block, and see the circle from 5.3.5 close. The key is `=`.',
  goals,
  endState: [
    { text: 'The revolver block runs from the opening balance to its effective rate', check: (s, ses) => lines(ses, ALL) },
  ],
  closing: [
    'Cash never goes below the minimum, and the revolver is the line that proves it.',
    'Best practice: the revolver is the last line of financing, built from MIN and MAX, and the first thing a buyer looks at.',
  ],
  solution: solutionOf(goals),
};
