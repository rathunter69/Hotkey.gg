// Chapter 5 · 5.4.2 The cash flow statement, indirect (clearcoat-model, B542 → B543)
// Operations from net income, the depreciation add-back and the three working-capital changes;
// investing as capex; financing from the debt schedule, distributions from Inputs and the revolver
// line linked to its still-empty rows; then cash before the revolver, the net change and the cash
// roll. Every line is a link, nil ones included; the closer types a revolver draw to test the wiring.
import { settled, sheetIn, reads, linesBuilt, liveVia, inputRef, plantLines, fillLines, solutionOf } from './lib/model-checks.js';

const AFTER = 'B543';
const S = 'CF';
const OPS = ['ni', 'dep', 'chgRec', 'chgPay', 'chgDef', 'cfo'];
const INV = ['capex', 'cfi'];
const DEBT = ['termDrawn', 'termRepaid', 'ddDrawn', 'ddRepaid'];
const REST = ['dist', 'rev', 'cff'];
const CASH = ['cbr', 'net', 'open', 'close'];
const ALL = [...OPS, ...INV, ...DEBT, ...REST, ...CASH];
const lines = (ses, keys) => linesBuilt(ses, S, keys, AFTER);
const live = (ses, ref, key, col) => liveVia(ses, S, ref, [inputRef(key, col)]);
// the revolver line reads zero until 5.4.4, so it is graded on the rows it reads
const revolverWired = ses => ['F', 'J'].every(c => reads(sheetIn(ses, S), `${c}24`, [`Schedules!${c}101`, `Schedules!${c}102`]));

const goals = [
  { id: 'operations', text: 'Operations in C6:J11: net income, depreciation added back, the three working-capital changes and the subtotal.',
    teach: 'The indirect cash flow starts from net income and corrects it back to cash: depreciation cost nothing in cash this year, so it goes back in, and the working-capital changes come straight off the schedule with their signs. Every line is a link to the IS or a schedule.',
    keys: fillLines(AFTER, S, OPS), requires: ['indirect-cash-flow', 'statement-links', 'cross-sheet-ref', 'sum-family', 'go-to', 'ctrl-enter-fill'], convention: 'C4',
    hintStuck: 'pulse range C6:J11 · Net income is IS row 31; depreciation and the changes are on Schedules.',
    check: (s, ses) => settled(ses) && lines(ses, OPS) && live(ses, 'J11', 'capexSite') },
  { id: 'investing', text: 'Investing in C14:J15: capex from the PP&E schedule as a negative, and the subtotal.',
    keys: fillLines(AFTER, S, INV), requires: ['statement-links', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C14:J15 · Total capex is Schedules row 63; cash going out carries a minus.',
    check: (s, ses) => settled(ses) && lines(ses, INV) && live(ses, 'J15', 'capexSite') },
  { id: 'debt', text: 'The debt lines in C18:J21: the term loan drawn and repaid, the delayed-draw loan drawn and repaid.',
    keys: fillLines(AFTER, S, DEBT), requires: ['statement-links', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C18:J21 · The debt schedule carries draws as positives and repayments as negatives already.',
    check: (s, ses) => settled(ses) && lines(ses, DEBT) && live(ses, 'J19', 'termAmort') && live(ses, 'G20', 'ddDraw', 'G') },
  { id: 'financing', text: 'Distributions in C22:J22, the revolver in C24:J24 from its empty rows on Schedules, and financing in C25:J25.',
    teach: 'A line with nothing in it yet still gets its link, never a typed zero: the revolver and distributions read nil today, and a typed zero would drop the cash the day either one moves.',
    keys: fillLines(AFTER, S, REST), requires: ['indirect-cash-flow', 'index-match', 'if-function', 'sum-family', 'go-to', 'ctrl-enter-fill'], convention: 'B4',
    hintStuck: 'pulse range C22:J25 · The revolver line is drawn plus repaid, Schedules rows 101 and 102.',
    check: (s, ses) => settled(ses) && lines(ses, REST) && revolverWired(ses) && live(ses, 'J22', 'dist', 'J') && live(ses, 'J25', 'termAmort') },
  { id: 'cash', text: 'Cash before the revolver in C23:J23, the net change in C28:J28, then opening and closing cash in C29:J30.',
    keys: fillLines(AFTER, S, CASH), requires: ['corkscrew', 'index-match', 'if-function', 'sum-family', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C28:J30 · Opening cash is last year’s closing; the first year reads Data.',
    check: (s, ses) => settled(ses) && lines(ses, CASH) && live(ses, 'J30', 'capexSite') },
  { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Schedules!F101" Enter "1000" Enter Ctrl+G "CF!F30" Enter', cadence: 320 },
    text: 'Does it tie? Watch a 1,000 revolver draw go into FY27 on the debt schedule, and closing cash rise by 1,000.', requires: [],
    hintStuck: 'pulse range CF!F24:J30 · The link was there before the number was.',
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'cf-indirect',
  chapter: 'finance-and-accounting',
  section: 'Linking the statements',
  module: 'linking-the-statements',
  workbook: 'clearcoat-model',
  state: { before: 'B542', after: AFTER },
  plant: plantLines(AFTER, S, ALL),
  title: 'The cash flow statement, indirect',
  difficulty: 'medium',
  tags: ['model', 'statements', 'cash flow', 'linking'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['C4', 'B4'],
  teaches: ['indirect-cash-flow'],
  uses: ['go-to', 'ctrl-enter-fill', 'index-match', 'if-function', 'cross-sheet-ref', 'sum-family', 'statement-links', 'corkscrew'],
  prerequisites: ['is-from-schedules'],
  brief: 'The cash flow statement at model scale: net income from the IS, depreciation added back, the working-capital changes with their signs, capex as a negative, the debt draws and repayments, distributions and the revolver. Then the net change, opening cash from last year’s closing, and closing cash, the line the balance sheet will read. The key is `=`.',
  goals,
  endState: [
    { text: 'The cash flow statement runs from net income to closing cash, every line a link', check: (s, ses) => lines(ses, ALL) && revolverWired(ses) },
  ],
  closing: [
    'It runs from net income to closing cash across eight years, and every line is a link.',
    'Best practice: no typed zeros on the cash flow. A line with nothing in it yet still gets its link.',
  ],
  solution: solutionOf(goals),
};
