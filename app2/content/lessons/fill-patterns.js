// Chapter 5 · 5.2.3 The fill patterns: anchor, fill right, AutoSum a block, F4 (clearcoat-model, B523 → B524)
// The cost build's skeleton on Schedules: six lines, each with its first-period formula written (labor
// from 5.2.2's planting, the other five planted here), anchors set. The learner fills the labor row right
// with Ctrl+R, the other five in one motion, totals the block with one Alt+=, sets the desk's number
// format on the labor row with Ctrl+1 and repeats it onto the other five with F4. The total row's format
// arrives planted. The projected years read zero until 5.3 builds the rollout they multiply.
import { settled, sheetIn, formatsFrom, cellIn, script, matches, cellsOf } from './lib/model-checks.js';

const S = 'Schedules';
const CODE = '#,##0_);(#,##0);"-"_)';
const PLANT = {
  ...Object.fromEntries(cellsOf('C33:C37').map(ref => [`${S}!${ref}`, { formula: cellIn('B524', S, ref).formula }])),
  ...formatsFrom('B524', S, cellsOf('C38:J38')),
};
const K = {
  labor: 'Ctrl+G "Schedules!C32" ↵ Shift+→ ×7 Ctrl+R',
  block: '↓ Shift+→ ×7 Shift+↓ ×4 Ctrl+R',
  total: '↑ Shift+→ ×7 Shift+↓ ×6 Alt+=',
  format: `Ctrl+G "Schedules!C32:J32" ↵ Ctrl+1 N Tab End Alt+T '${CODE}' ↵`,
  repeat: '↓ Shift+→ ×7 Shift+↓ ×4 F4',
};
const sch = ses => sheetIn(ses, S);
const coded = (ses, range) => { const sh = sch(ses); return !!sh && cellsOf(range).every(ref => { const c = sh.cellAt(ref); return !!c && c.numFmt === CODE; }); };

export default {
  id: 'fill-patterns',
  chapter: 'finance-and-accounting',
  section: 'Model setup and efficiencies',
  module: 'model-setup',
  workbook: 'clearcoat-model',
  state: { before: 'B523', after: 'B524' },
  plant: PLANT,
  title: 'The fill patterns: anchor, fill right, AutoSum a block, F4',
  difficulty: 'medium',
  tags: ['finance', 'model', 'fill', 'speed'],
  access: 'paid',
  minutes: 5,
  headline: 'Ctrl+R',
  conventions: ['C3', 'D2'],
  teaches: ['block-fill'],
  uses: ['go-to', 'shift-arrow', 'fill-down-right', 'relative-absolute', 'autosum', 'format-cells-dialog', 'custom-number-format', 'f4-repeat'],
  prerequisites: ['timeline-flags-counters'],
  brief: 'Every skill here is Chapter 1’s: anchors (1.6.3), Ctrl+R (1.6.5), AutoSum over a block (1.6.2) and F4 to repeat (1.5.4), done as one motion across a block the size of a model. Write the first-period formula with its anchors right, select to the last period, Ctrl+R, then the next row. A row of eight is one formula; a block of forty rows is forty formulas and forty fills, and it takes minutes, not an afternoon. Practice on the cost build’s skeleton. The key is `Ctrl+R`.',
  wow: 'Six rows across eight years, a total and the desk format, in five motions.',
  goals: [
    { id: 'labor', teach: 'The labor line’s first-period formula is written with its anchors set: the inputs on Inputs fixed with $, the timeline and the row’s own cells relative. Get the first cell right and the fill does the rest.',
      text: 'On Schedules, fill labor’s formula in C32 right to J32: Shift+→ to the last period, then Ctrl+R.', keys: K.labor, requires: ['block-fill', 'go-to', 'shift-arrow', 'fill-down-right', 'relative-absolute'],
      hintStuck: 'pulse range C32:J32 · Ctrl+R copies the left column across the selection.',
      check: (s, ses) => settled(ses) && matches(ses, S, 'C32:J32', 'B524') },
    { id: 'block', teach: 'Ctrl+R fills every row of a selection from its own first cell, so five rows with their first periods written take one motion, not five.',
      text: 'The other five lines in one motion: select C33:J37 and Ctrl+R.', keys: K.block, requires: ['block-fill', 'fill-down-right'],
      hintStuck: 'pulse range C33:J37 · Each row fills from its own C cell.',
      check: (s, ses) => settled(ses) && matches(ses, S, 'C33:J37', 'B524') },
    { id: 'total', teach: 'Alt+= on a block with an empty row beneath writes a SUM under every column at once (1.6.2).',
      text: 'Total the block in row 38 with one Alt+= over C32:J38.', keys: K.total, requires: ['autosum', 'shift-arrow'], convention: 'C3',
      hintStuck: 'pulse range C38:J38 · Include the empty total row in the selection.',
      check: (s, ses) => settled(ses) && matches(ses, S, 'C38:J38', 'B524') },
    { id: 'format', teach: 'The desk format (2.2.1): thousands with a comma, negatives in brackets, a zero as a dash, and the spaces that keep the figures lined up with the brackets.',
      text: 'Format C32:J32 with the custom code #,##0_);(#,##0);"-"_) from Ctrl+1.', keys: K.format, requires: ['format-cells-dialog', 'custom-number-format', 'go-to'], convention: 'D2',
      hintStuck: 'pulse range C32:J32 · Number, Custom, then type the code in Type.',
      check: (s, ses) => settled(ses) && coded(ses, 'C32:J32') },
    { id: 'repeat', teach: 'F4 outside a formula repeats the last action whole, so the format code goes onto the next block without the dialog. A one-press route to a custom format exists only as a button you add yourself.',
      text: 'Select C33:J37 and press F4 to repeat the format.', keys: K.repeat, requires: ['f4-repeat', 'shift-arrow'],
      hintStuck: 'pulse range C33:J37 · F4 repeats whatever you did last.',
      check: (s, ses) => settled(ses) && coded(ses, 'C32:J37') },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Data!D9" Enter "7000" Enter Ctrl+G "Schedules!C38" Enter', cadence: 360 },
      text: 'Does it tie? Watch FY24’s labor on Data rise by 400: C32 reads it, and the total in C38 answers.', requires: [],
      hintStuck: 'pulse cell C38 · The historical years read Data through the flag.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The cost build’s six lines run across C32:J37, totalled in row 38', check: (s, ses) => matches(ses, S, 'C32:J38', 'B524') },
    { text: 'The block carries the desk number format', check: (s, ses) => coded(ses, 'C32:J37') },
  ],
  closing: [
    'Six rows across eight years took one motion each.',
    'The pattern scales: first cell right, select, Ctrl+R, total, format, repeat. The forecast years read zero for now because the rollout they multiply comes in 5.3; when it does, every cell here answers without another keystroke.',
  ],
  solution: script(Object.values(K).join(' ')),
};
