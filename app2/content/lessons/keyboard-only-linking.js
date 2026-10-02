// Chapter 5 · 5.7.3 Link the cash flow by keyboard alone (clearcoat-model, B573 → DONE)
// The third benchmark, with the keys shown once. The cash flow statement arrives with its labels,
// its formats, its subtotals and the distribution line, and none of its links: net income,
// depreciation, the working capital changes, capex, the debt lines and the revolver are empty, and so
// are the net change and closing cash. Each link is typed once into a selected row with Ctrl+Enter,
// the totals likewise, then the green goes on with Font Color and F4. Graded on the figures (the
// finished model's), a what-if on Inputs that moves each block, and the green on every link.
import { SPEED_LINKS, ROW } from '../workbooks/clearcoat-model.js';
import { settled, like, echoes, moves, rowRefs, carries, sheetIn } from './lib/model-checks.js';

const S = 'CF';
// Each link reads its source in the same column, on the learner's own figures: the circle (interest
// on the cash balance) stays open until the cash rows are in, so the finished figures come only then.
const R = ROW.Schedules;
const SRC = {
  ni: ['IS', ROW.IS.ni], dep: ['Schedules', R.dep], chgRec: ['Schedules', R.chgRec], chgPay: ['Schedules', R.chgPay], chgDef: ['Schedules', R.chgDef],
  capex: ['Schedules', R.capexTotal, -1], termDrawn: ['Schedules', R.termDrawn], termRepaid: ['Schedules', R.termRepaid], ddDrawn: ['Schedules', R.ddDrawn], ddRepaid: ['Schedules', R.ddRepaid],
};
const source = (col, v, key) => (key === 'rev' ? v('Schedules', col + R.revDrawn) + v('Schedules', col + R.revRepaid) : (SRC[key][2] || 1) * v(SRC[key][0], col + SRC[key][1]));
const linked = (ses, keys) => echoes(ses, S, keys, source);
const totalled = (ses, keys) => like(ses, S, rowRefs(S, keys));
const greenOk = ses => carries(sheetIn(ses, S), rowRefs(S, SPEED_LINKS.links), 'fontColor', 'green');
const GREEN = 'Alt H F C Right Right Right Right Right Right Right Right Enter';

export default {
  id: 'keyboard-only-linking',
  chapter: 'finance-and-accounting',
  section: 'Model speed',
  module: 'model-speed',
  workbook: 'clearcoat-model',
  state: { before: 'B573', after: 'DONE' },
  title: 'Link the cash flow by keyboard alone',
  difficulty: 'medium',
  tags: ['model speed', 'benchmark', 'linking', 'cash flow', 'Ctrl+Enter'],
  access: 'paid',
  minutes: 5,
  headline: 'Ctrl+Enter',
  conventions: ['B2', 'C3'],
  teaches: ['keyboard-linking'],
  uses: ['ctrl-enter-fill', 'cross-sheet-ref', 'font-color', 'link-colour-convention', 'f4-repeat', 'go-to'],
  prerequisites: ['fill-and-format-block'],
  brief: 'The cash flow statement has its labels, formats and subtotals, and not one link: net income, depreciation, working capital, capex, the debt lines and the revolver are all empty. Link it without touching the mouse: select a row, type the reference once and press Ctrl+Enter, so every year links to its own column. Then the totals the same way, and green on every link through Font Color and F4. The key is `Ctrl+Enter`.',
  goals: [
    { id: 'income', teach: 'A link row is one entry: select the row from FY24 to FY31, type the reference for FY24 and press Ctrl+Enter, and each column reads its own year because the reference is relative. Typing the reference is faster than pointing at it on another sheet, and Ctrl+G gets you to the row.',
      text: 'Link net income, =IS!C31 into CF C6:J6, and depreciation, =Schedules!C64 into C7:J7, each with Ctrl+Enter.',
      keys: 'Ctrl+G "CF!C6:J6" ↵ "=IS!C31" Ctrl+↵ Ctrl+G "CF!C7:J7" ↵ "=Schedules!C64" Ctrl+↵', requires: ['keyboard-linking', 'ctrl-enter-fill', 'cross-sheet-ref', 'go-to'], convention: 'C3',
      hintStuck: 'pulse range C6:J6 · Net income is the last line of the IS, row 31.',
      check: (s, ses) => settled(ses) && linked(ses, ['ni', 'dep']) && moves(ses, 'CF!J6', 'Inputs!J22') },
    { id: 'working-capital', text: 'The three working capital changes sit in Schedules rows 53 to 55: select C8:J10 and enter =Schedules!C53 with Ctrl+Enter.',
      keys: 'Ctrl+G "CF!C8:J10" ↵ "=Schedules!C53" Ctrl+↵', requires: ['ctrl-enter-fill', 'cross-sheet-ref', 'go-to'], convention: 'C3',
      hintStuck: 'pulse range C8:J10 · One entry fills three rows: each row reads the Schedules row in the same order.',
      check: (s, ses) => settled(ses) && linked(ses, ['chgRec', 'chgPay', 'chgDef']) && moves(ses, 'CF!J8', 'Inputs!J22') },
    { id: 'capex', text: 'Capex is cash going out: enter =-Schedules!C63 into C14:J14 with Ctrl+Enter.',
      keys: 'Ctrl+G "CF!C14:J14" ↵ "=-Schedules!C63" Ctrl+↵', requires: ['ctrl-enter-fill', 'cross-sheet-ref', 'go-to'], convention: 'C3',
      hintStuck: 'pulse range C14:J14 · The schedule keeps capex positive; the cash flow shows it as an outflow.',
      check: (s, ses) => settled(ses) && linked(ses, ['capex']) && moves(ses, 'CF!J14', 'Inputs!J21') },
    { id: 'debt', text: 'Link the term loan, =Schedules!C80 into C18:J19, and the delayed draw, =Schedules!C90 into C20:J21, each with Ctrl+Enter.',
      keys: 'Ctrl+G "CF!C18:J19" ↵ "=Schedules!C80" Ctrl+↵ Ctrl+G "CF!C20:J21" ↵ "=Schedules!C90" Ctrl+↵', requires: ['ctrl-enter-fill', 'cross-sheet-ref', 'go-to'], convention: 'C3',
      hintStuck: 'pulse range C18:J19 · Drawn and repaid sit next to each other on the schedule, so two rows take one entry.',
      check: (s, ses) => settled(ses) && linked(ses, ['termDrawn', 'termRepaid', 'ddDrawn', 'ddRepaid']) && moves(ses, 'CF!G19', 'Inputs!C74') && moves(ses, 'CF!F20', 'Inputs!F75') },
    { id: 'revolver', text: 'The revolver nets its draw and repayment: enter =Schedules!C101+Schedules!C102 into C24:J24 with Ctrl+Enter.',
      keys: 'Ctrl+G "CF!C24:J24" ↵ "=Schedules!C101+Schedules!C102" Ctrl+↵', requires: ['ctrl-enter-fill', 'cross-sheet-ref', 'go-to'], convention: 'C3',
      hintStuck: 'pulse range C24:J24 · Row 101 is the draw and row 102 the repayment, already negative.',
      check: (s, ses) => settled(ses) && linked(ses, ['rev']) && moves(ses, 'CF!J24', 'Inputs!C80') },
    { id: 'cash', text: 'Net change in cash is =C11+C15+C25 in C28:J28, and closing cash =C29+C28 in C30:J30, each with Ctrl+Enter.',
      keys: 'Ctrl+G "CF!C28:J28" ↵ "=C11+C15+C25" Ctrl+↵ Ctrl+G "CF!C30:J30" ↵ "=C29+C28" Ctrl+↵', requires: ['ctrl-enter-fill', 'formula-basics', 'go-to'], convention: 'C3',
      hintStuck: 'pulse range C28:J28 · The three section totals, operating, investing and financing, add to the change in cash.',
      check: (s, ses) => settled(ses) && totalled(ses, ['net', 'close']) && moves(ses, 'CF!J30', 'Inputs!J22') },
    { id: 'green', text: 'Color the links green: C6:J10 through Font Color, then F4 on C14:J14, C18:J21 and C24:J24.',
      keys: `Ctrl+G "CF!C6:J10" ↵ Alt H F C → ×8 ↵ Ctrl+G "CF!C14:J14" ↵ F4 Ctrl+G "CF!C18:J21" ↵ F4 Ctrl+G "CF!C24:J24" ↵ F4`, requires: ['font-color', 'link-colour-convention', 'f4-repeat', 'go-to'], convention: 'B2',
      hintStuck: 'pulse range C6:J10 · Green marks a figure that comes from another sheet; the totals stay black.',
      check: (s, ses) => settled(ses) && greenOk(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!J22" Enter "300" Enter Ctrl+G "Checks!J7" Enter', cadence: 320 },
      text: 'Does it tie? Watch FY31 washes per day in Inputs J22 go from 250 to 300: closing cash climbs and the cash check, Checks J7, holds at 0.', requires: [],
      hintStuck: 'pulse cell J7 · The check is the balance sheet’s cash less the cash flow’s closing cash.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Every link and the cash rows on the cash flow statement are the finished model’s', check: (s, ses) => totalled(ses, [...SPEED_LINKS.links, ...SPEED_LINKS.calc]) },
    { text: 'Every link is green', check: (s, ses) => greenOk(ses) },
  ],
  wow: 'You linked a cash flow statement without touching the mouse.',
  closing: [
    'You linked a cash flow statement without touching the mouse, and the cash check held at zero.',
    'Eleven link rows took seven entries, because a relative reference typed once reads its own column across the row and its own line down a block. Best practice: link a statement row by row from its FY24 column, and color each link green as you go so nothing typed hides among them.',
  ],
  solution: 'Ctrl+G "CF!C6:J6" Enter "=IS!C31" Ctrl+Enter Ctrl+G "CF!C7:J7" Enter "=Schedules!C64" Ctrl+Enter Ctrl+G "CF!C8:J10" Enter "=Schedules!C53" Ctrl+Enter '
    + 'Ctrl+G "CF!C14:J14" Enter "=-Schedules!C63" Ctrl+Enter Ctrl+G "CF!C18:J19" Enter "=Schedules!C80" Ctrl+Enter Ctrl+G "CF!C20:J21" Enter "=Schedules!C90" Ctrl+Enter '
    + 'Ctrl+G "CF!C24:J24" Enter "=Schedules!C101+Schedules!C102" Ctrl+Enter Ctrl+G "CF!C28:J28" Enter "=C11+C15+C25" Ctrl+Enter Ctrl+G "CF!C30:J30" Enter "=C29+C28" Ctrl+Enter '
    + `Ctrl+G "CF!C6:J10" Enter ${GREEN} Ctrl+G "CF!C14:J14" Enter F4 Ctrl+G "CF!C18:J21" Enter F4 Ctrl+G "CF!C24:J24" Enter F4`,
};
