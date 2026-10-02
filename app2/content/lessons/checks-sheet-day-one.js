// Chapter 5 · 5.2.4 The checks sheet from day one (clearcoat-model, B524 → B525)
// Checks holds a title, the timeline and a flag waiting on an empty roll-up. The catalog's labels, the
// source figures and the red rule on the block arrive planted (the rule is a cell-value rule, not one
// a formula rule would make). The learner makes the first two checks live across eight years, marks
// the six that wait on their schedules as pending, writes the roll-up and links it to the Cover.
import { settled, sheetIn, formatOnly, cellIn, formatsFrom, script, matches, cellsOf } from './lib/model-checks.js';
import { STATES } from '../workbooks/clearcoat-model.js';

const OWN = new Set([...cellsOf('C6:J7'), ...cellsOf('K8:K14'), 'C44']);
const cells = STATES.B525.sheets.find(s => s.name === 'Checks').cells;
const PLANT = {
  ...Object.fromEntries(Object.keys(cells).map(ref => [`Checks!${ref}`, OWN.has(ref) ? formatOnly(cellIn('B525', 'Checks', ref)) : cellIn('B525', 'Checks', ref)]).filter(([, c]) => c)),
  'Checks!#condFmt': STATES.B525.sheets.find(s => s.name === 'Checks').condFmt,
  ...formatsFrom('B525', 'Cover', ['C8']),
};
const K = {
  balance: 'Ctrl+G "Checks!C6" ↵ "=ROUND(BS!C10-BS!C25,2)" ↵ Shift+→ ×7 Ctrl+R',
  cash: '↓ "=ROUND(BS!C6-CF!C30,2)" ↵ Shift+→ ×7 Ctrl+R',
  pending: 'Ctrl+G "Checks!K8:K14" ↵ "pending" Ctrl+↵',
  rollup: 'Ctrl+G "Checks!C44" ↵ "=SUMPRODUCT(ABS(C6:J27))" ↵',
  cover: 'Ctrl+G "Cover!C8" ↵ "=Checks!C44" ↵',
};
const on = (ses, range) => matches(ses, 'Checks', range, 'B525');
const zero = (ses, range) => { const sh = sheetIn(ses, 'Checks'); return !!sh && cellsOf(range).every(ref => sh.value(ref) === 0); };

export default {
  id: 'checks-sheet-day-one',
  chapter: 'finance-and-accounting',
  section: 'Model setup and efficiencies',
  module: 'model-setup',
  workbook: 'clearcoat-model',
  state: { before: 'B524', after: 'B525' },
  plant: PLANT,
  title: 'The checks sheet from day one',
  difficulty: 'medium',
  tags: ['finance', 'model', 'checks'],
  access: 'paid',
  minutes: 5,
  headline: '=',
  conventions: ['F1', 'F2'],
  teaches: ['checks-sheet'],
  uses: ['go-to', 'check-cell', 'round-function', 'cross-sheet-ref', 'fill-down-right', 'shift-arrow', 'ctrl-enter-fill', 'sumproduct', 'abs-function', 'rollup-flag'],
  prerequisites: ['fill-patterns'],
  brief: 'The Checks sheet is built before the model is, with a row for every check the model will need: the balance sheet balances, cash ties to the cash flow, the debt and PP&E schedules tie to the balance sheet, revenue ties to its build, the cost build cross-foots, equity rolls, and FY26 EBITDA ties to the Chapter 2 P&L. Each is a live difference (1.7.2), and the roll-up flag (3.6.4) sits on the Cover. As each schedule is built, its check goes live. The key is `=`.',
  wow: 'Two checks live across eight years, six waiting their turn, and the Cover reading the lot.',
  goals: [
    { id: 'balance', teach: 'Best practice: wrap every check in ROUND(…,2). Floating-point arithmetic leaves 0.0000000001 where a zero belongs, and the flag would call that a fault.',
      text: 'On Checks, the balance check in C6, =ROUND(BS!C10-BS!C25,2), filled right to J6.', keys: K.balance, requires: ['checks-sheet', 'go-to', 'round-function', 'cross-sheet-ref', 'fill-down-right'], convention: 'F1',
      hintStuck: 'pulse range C6:J6 · Total assets are BS row 10, total liabilities and equity row 25.',
      check: (s, ses) => settled(ses) && on(ses, 'C6:J6') && zero(ses, 'C6:E6') },
    { id: 'cash', text: 'The cash tie in C7, =ROUND(BS!C6-CF!C30,2), filled right to J7.', keys: K.cash, requires: ['checks-sheet', 'round-function', 'fill-down-right'], convention: 'F1',
      hintStuck: 'pulse range C7:J7 · Cash on the balance sheet less the cash flow’s closing cash.',
      check: (s, ses) => settled(ses) && on(ses, 'C7:J7') && zero(ses, 'C7:E7') },
    { id: 'pending', teach: 'A check whose schedule doesn’t exist yet stays empty with a note beside it, never a typed 0: a typed zero is a dead check that always passes, and the roll-up reads an empty cell as nothing.',
      text: 'Type pending in K8:K14 in one entry, beside the six checks still to come.', keys: K.pending, requires: ['checks-sheet', 'ctrl-enter-fill'],
      hintStuck: 'pulse range K8:K14 · Ctrl+Enter fills the whole selection.',
      check: (s, ses) => settled(ses) && on(ses, 'K8:K14') },
    { id: 'rollup', teach: 'One number says whether everything ties: the sum of every check’s size, so a +5 and a -5 can’t cancel. The flag under it already reads OK or CHECK (3.6.4).',
      text: 'The roll-up in C44: =SUMPRODUCT(ABS(C6:J27)), which reads zero.', keys: K.rollup, requires: ['sumproduct', 'abs-function', 'rollup-flag'], convention: 'F2',
      hintStuck: 'pulse cell C44 · ABS makes every difference count, whichever way it points.',
      check: (s, ses) => settled(ses) && on(ses, 'C44') && zero(ses, 'C44') },
    { id: 'cover', text: 'On the Cover, C8 =Checks!C44, so the sum of the differences sits under the flag.', keys: K.cover, requires: ['cross-sheet-ref'],
      hintStuck: 'pulse cell C8 · The Cover reads Checks, never the other way round.',
      check: (s, ses) => settled(ses) && matches(ses, 'Cover', 'C8', 'B525') },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "BS!D6" Enter "9999" Enter Ctrl+G "Cover!C7" Enter', cadence: 360 },
      text: 'Does it tie? Watch FY25 cash on the BS typed over: the cash tie leaves zero and the Cover flag turns to CHECK.', requires: [],
      hintStuck: 'pulse cell C7 · One check off zero is enough to turn the flag.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The balance and cash checks are live across C6:J7 and read zero', check: (s, ses) => on(ses, 'C6:J7') && zero(ses, 'C6:J7') },
    { text: 'The six checks still to come are marked pending', check: (s, ses) => on(ses, 'K8:K14') },
    { text: 'The roll-up in C44 feeds the Cover', check: (s, ses) => on(ses, 'C44') && matches(ses, 'Cover', 'C8', 'B525') },
  ],
  closing: [
    'Two of eight checks are live, and the other six have their rows waiting.',
    'The model has a conscience before it has a schedule: every check you add from 5.3 on lands in a row already waiting for it, and the Cover says OK or CHECK the moment anything stops tying.',
  ],
  solution: script(Object.values(K).join(' ')),
};
