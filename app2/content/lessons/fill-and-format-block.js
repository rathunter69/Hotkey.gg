// Chapter 5 · 5.7.2 Fill and format a block in one pass (clearcoat-model, B572 → DONE)
// The second benchmark, with the keys shown once. Schedules' forty-row block (the cost build,
// working capital and PP&E) holds its first column only: the plain lines without the desk number
// format, the totals without their top border, the margins upright. Two Ctrl+R fills and three
// whole-block formats, each repeated with F4. Graded on the figures (the finished model's), a what-if
// on Inputs, and the formats on every cell of the lines each goal names.
import { SPEED_BLOCK } from '../workbooks/clearcoat-model.js';
import { settled, like, moves, rowRefs, formatted, carries, sheetIn, DESK } from './lib/model-checks.js';

const S = 'Schedules';
const sch = ses => sheetIn(ses, S);
const COST_WC = SPEED_BLOCK.fill.filter(k => !SPEED_BLOCK.fill.slice(SPEED_BLOCK.fill.indexOf('ppeOpen')).includes(k));
const PPE = SPEED_BLOCK.fill.slice(SPEED_BLOCK.fill.indexOf('ppeOpen'));
const filled = (ses, keys, target) => like(ses, S, rowRefs(S, keys)) && moves(ses, `${S}!${target}`, 'Inputs!J22');
const deskOk = ses => formatted(sch(ses), rowRefs(S, SPEED_BLOCK.plain));
const bordersOk = ses => carries(sch(ses), rowRefs(S, SPEED_BLOCK.totals), 'bt');
const italicOk = ses => carries(sch(ses), rowRefs(S, SPEED_BLOCK.ratios), 'it');

export default {
  id: 'fill-and-format-block',
  chapter: 'finance-and-accounting',
  section: 'Model speed',
  module: 'model-speed',
  workbook: 'clearcoat-model',
  state: { before: 'B572', after: 'DONE' },
  title: 'Fill and format a block in one pass',
  difficulty: 'medium',
  tags: ['model speed', 'benchmark', 'fill right', 'formats', 'F4'],
  access: 'paid',
  minutes: 5,
  headline: 'Ctrl+R',
  conventions: ['E3', 'D5'],
  teaches: ['one-pass-format'],
  uses: ['fill-down-right', 'custom-number-format', 'format-cells-dialog', 'f4-repeat', 'borders-menu', 'bold-italic-underline', 'go-to', 'speed-build'],
  prerequisites: ['revenue-build-in-three'],
  brief: 'The cost build, working capital and PP&E on Schedules hold their FY24 column and nothing else: forty rows waiting to be filled and finished. Fill each block in one motion with Ctrl+R, then format by whole lines: the desk number format, the top border on every total, italic on the margins, each done once and repeated with F4. One pass, no cell touched twice. The key is `Ctrl+R`.',
  goals: [
    { id: 'fill-costs', teach: 'A block fills in one motion: select from its first formula column to FY31 and press Ctrl+R, and every row takes its own first cell’s formula and format. The memo cells in C57 and C67 live in one column only, so the selections stop short of them.',
      text: 'Select C30:J56 on Schedules, the cost build and working capital, and fill the block right with Ctrl+R.', keys: 'Ctrl+G "Schedules!C30:J56" ↵ Ctrl+R', requires: ['one-pass-format', 'fill-down-right', 'go-to'], convention: 'E3',
      hintStuck: 'pulse range C30:J56 · Every row’s formula is in C already; one press carries all of them.',
      check: (s, ses) => settled(ses) && filled(ses, COST_WC, 'J42') },
    { id: 'fill-ppe', text: 'Fill the PP&E block the same way: select C60:J66 and press Ctrl+R.', keys: 'Ctrl+G "Schedules!C60:J66" ↵ Ctrl+R', requires: ['fill-down-right', 'go-to'], convention: 'E3',
      hintStuck: 'pulse range C60:J66 · Stop at row 66: the implied life in C67 is one cell, not a row.',
      check: (s, ses) => settled(ses) && filled(ses, PPE, 'J65') },
    { id: 'desk', text: 'Desk number format on the cost lines C32:J37 through Ctrl+1, then F4 on C41:J41, C47:J48, C53:J55, C61:J62 and C64:J64.',
      keys: `Ctrl+G "Schedules!C32:J37" ↵ Ctrl+1 N Tab End Alt+T '${DESK}' ↵ Ctrl+G "Schedules!C41:J41" ↵ F4 Ctrl+G "Schedules!C47:J48" ↵ F4 Ctrl+G "Schedules!C53:J55" ↵ F4 Ctrl+G "Schedules!C61:J62" ↵ F4 Ctrl+G "Schedules!C64:J64" ↵ F4`,
      requires: ['custom-number-format', 'format-cells-dialog', 'f4-repeat', 'go-to'], convention: 'D3',
      hintStuck: 'pulse range C32:J37 · The first line of each block and the totals carry the $ already; the lines between take the plain code.',
      check: (s, ses) => settled(ses) && deskOk(ses) },
    { id: 'borders', text: 'Top border on Site costs C38:J38 with Alt H B P, then F4 on the totals in rows 39, 42, 49, 56, 63 and 65.',
      keys: 'Ctrl+G "Schedules!C38:J38" ↵ Alt H B P Ctrl+G "Schedules!C39:J39" ↵ F4 Ctrl+G "Schedules!C42:J42" ↵ F4 Ctrl+G "Schedules!C49:J49" ↵ F4 Ctrl+G "Schedules!C56:J56" ↵ F4 Ctrl+G "Schedules!C63:J63" ↵ F4 Ctrl+G "Schedules!C65:J65" ↵ F4',
      requires: ['borders-menu', 'f4-repeat', 'go-to'], convention: 'D5',
      hintStuck: 'pulse range C38:J38 · A top border marks a total; F4 repeats the border, not the selection.',
      check: (s, ses) => settled(ses) && bordersOk(ses) },
    { id: 'italic', text: 'Italic on the cost of sales share C31:J31 with Ctrl+I, then F4 on the two margins, C40:J40 and C43:J43.',
      keys: 'Ctrl+G "Schedules!C31:J31" ↵ Ctrl+I Ctrl+G "Schedules!C40:J40" ↵ F4 Ctrl+G "Schedules!C43:J43" ↵ F4', requires: ['bold-italic-underline', 'f4-repeat', 'go-to'], convention: 'D6',
      hintStuck: 'pulse range C31:J31 · Italic sets a ratio apart from the dollars around it.',
      check: (s, ses) => settled(ses) && italicOk(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!C50" Enter "300" Enter Ctrl+G "Checks!C11" Enter', cadence: 320 },
      text: 'Does it tie? Watch labor per site, Inputs C50, go from 257 to 300: every cost line moves and the cross-foot in Checks C11 holds at 0.', requires: [],
      hintStuck: 'pulse cell C11 · The cross-foot sums the block down, then across, and takes one from the other.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The cost build, working capital and PP&E on Schedules are the finished model’s, every row filled right', check: (s, ses) => like(ses, S, rowRefs(S, SPEED_BLOCK.fill)) },
    { text: 'The plain lines carry the desk number format, the totals a top border and the margins italic', check: (s, ses) => deskOk(ses) && bordersOk(ses) && italicOk(ses) },
  ],
  wow: 'You filled and formatted forty rows without touching a cell twice.',
  closing: [
    'You filled and formatted forty rows without touching a cell twice.',
    'Two presses filled the block and three formats finished it, each set once and repeated with F4. The habit scales: a schedule four times this size takes the same handful of moves. Best practice: format by line, never cell by cell, so a line can only ever look one way.',
  ],
  solution: 'Ctrl+G "Schedules!C30:J56" Enter Ctrl+R Ctrl+G "Schedules!C60:J66" Enter Ctrl+R '
    + `Ctrl+G "Schedules!C32:J37" Enter Ctrl+1 N Tab End Alt+T '${DESK}' Enter Ctrl+G "Schedules!C41:J41" Enter F4 Ctrl+G "Schedules!C47:J48" Enter F4 Ctrl+G "Schedules!C53:J55" Enter F4 Ctrl+G "Schedules!C61:J62" Enter F4 Ctrl+G "Schedules!C64:J64" Enter F4 `
    + 'Ctrl+G "Schedules!C38:J38" Enter Alt H B P Ctrl+G "Schedules!C39:J39" Enter F4 Ctrl+G "Schedules!C42:J42" Enter F4 Ctrl+G "Schedules!C49:J49" Enter F4 Ctrl+G "Schedules!C56:J56" Enter F4 Ctrl+G "Schedules!C63:J63" Enter F4 Ctrl+G "Schedules!C65:J65" Enter F4 '
    + 'Ctrl+G "Schedules!C31:J31" Enter Ctrl+I Ctrl+G "Schedules!C40:J40" Enter F4 Ctrl+G "Schedules!C43:J43" Enter F4',
};
