// Chapter 4 · 4.5.2 One-way data table: the ticket (clearcoat-pack, S451 → S452)
// EBITDA at five tickets, live: the tickets typed across D28:H28, the corner C29 linked to EBITDA,
// a Data Table on C28:H29 with the live ticket G6 as its row input cell, an entry refused inside
// the table, and a title that names the case it ran on. Labels and formats are planted.
import { stateOf, SCENARIOS, TICKETS, formatOnly } from '../workbooks/clearcoat-pack.js';
import { scenarios, settled, reads, near, tableOn, typedRow, linksTo, pressedSince } from './lib/pack-scenario-checks.js';

const C = SCENARIOS; const R = C.oneWay;   // title 27, values 28, EBITDA 29
const DONE = stateOf('S452').sheets.find(s => s.name === 'Scenarios').cells;
const EDGE = ['D', 'E', 'F', 'G', 'H'].map(c => c + R.vals);
const ROW = ['D', 'E', 'F', 'G', 'H'].map(c => c + R.ebitda);
const PLANT = Object.fromEntries([
  ...['B' + R.vals, 'B' + R.ebitda].map(k => ['Scenarios!' + k, DONE[k]]),
  ...['B' + R.title, 'C' + R.ebitda, ...EDGE, ...ROW].map(k => ['Scenarios!' + k, formatOnly(DONE[k])]),
]);
const BLOCK = `C${R.vals}:H${R.ebitda}`;
const edgeOk = ses => typedRow(scenarios(ses), EDGE, TICKETS);
const cornerOk = ses => linksTo(scenarios(ses), 'C' + R.ebitda, 'C' + C.outputs.ebitda);
/** EBITDA moves with the ticket by washes a year for every dollar: the table's figures, worked out from the learner's own model. */
const rowOk = sh => ROW.every((ref, i) => near(sh.value(ref), sh.value('C' + C.outputs.ebitda) + sh.value('C' + C.outputs.washesYr) * (TICKETS[i] - sh.value('G' + C.inputs.ticket)), 1e-3));
const tableOk = ses => { const sh = scenarios(ses); return !!tableOn(sh, { block: BLOCK, row: 'G' + C.inputs.ticket }) && rowOk(sh); };
const titleOk = ses => { const sh = scenarios(ses); const ref = 'B' + R.title; return !!sh && !!sh.formula(ref) && reads(sh, ref, ['C' + C.picker]) && sh.value(ref) === `EBITDA by ticket, ${sh.value('C' + C.picker)} case`; };
const F = { corner: `=C${C.outputs.ebitda}`, title: DONE['B' + R.title].formula };

export default {
  id: 'one-way-data-table',
  chapter: 'data-and-lookups',
  section: 'Scenarios and sensitivity',
  module: 'scenarios-and-sensitivity',
  workbook: 'clearcoat-pack',
  state: { before: 'S451', after: 'S452' },
  plant: PLANT,
  title: 'One-way data table: the ticket',
  difficulty: 'medium',
  tags: ['scenarios', 'sensitivity', 'data tables'],
  access: 'paid',
  minutes: 6,
  headline: 'Alt A W T',
  conventions: ['B1', 'E9'],
  teaches: ['data-table-one-way'],
  uses: ['case-switch', 'go-to', 'sheet-reference', 'shift-arrow', 'ctrl-arrow', 'dynamic-title', 'tab-commits'],
  prerequisites: ['case-toggle-choose-index'],
  brief: 'A sensitivity shows how an output moves when one input moves. A Data Table (Alt, A, W, T) does it for a row of input values at once: EBITDA at a $12, $13, $14, $15 and $16 ticket, in one table, live. The layout is strict (the values across the top, the formula at the left of the row below, the row input cell on the ticket), and the results are one array you can’t edit cell by cell. Build the ticket sensitivity. The key is `Alt A W T`.',
  goals: [
    { id: 'edge', teach: 'A table’s edge is typed, in blue, and never linked to the input cell the table drives. The table writes each value into that input in turn, so a linked edge would move under it and the grid would come out wrong.',
      text: 'Type the tickets across D28:H28: 12, 13, 14, 15 and 16.', keys: 'Ctrl+G "Scenarios!D28" ↵ "12" Tab "13" Tab "14" Tab "15" Tab "16" ↵', requires: ['data-table-one-way', 'go-to', 'tab-commits'], convention: 'B1',
      hintStuck: 'pulse range D28:H28 · Tab moves right after each entry; the formats are set.',
      check: (s, ses) => settled(ses) && edgeOk(ses) },
    { id: 'corner', text: 'Link the output at the left of the row below: C29 =C24, the live EBITDA.', keys: `← "${F.corner}" ↵`, requires: ['data-table-one-way'],
      hintStuck: 'pulse cell C29 · The table recalculates this formula once for each ticket.',
      check: (s, ses) => settled(ses) && cornerOk(ses) },
    { id: 'table', text: 'Select C28:H29, press Alt, A, W, T, set the Row input cell to G6, the live ticket, and press Enter.', keys: '↑ ↑ Shift+→ ×5 Shift+↓ Alt A W T Alt+R "G6" ↵', requires: ['data-table-one-way', 'shift-arrow'],
      hintStuck: 'pulse range C28:H29 · Alt+R jumps to the Row input cell; the values run across a row.',
      check: (s, ses) => settled(ses) && tableOk(ses) },
    { id: 'refuse', teach: 'Every cell of the results holds {=TABLE(G6,)}, one array for the whole row. Excel refuses an entry in any one of them: change the table by clearing or rebuilding it whole.',
      text: 'Type a figure over F29 and press Enter: Excel refuses it, so press Esc.', keys: 'Ctrl+→ → → ↓ "1" ↵ Esc', requires: ['data-table-one-way', 'ctrl-arrow'],
      hintStuck: 'pulse cell F29 · The cell is part of the table’s array.',
      check: (s, ses) => settled(ses) && pressedSince(ses, '⚠') && tableOk(ses) },
    { id: 'title', text: 'Say which case the table ran on: B27 ="EBITDA by ticket, "&$C$10&" case".', keys: `Ctrl+← ↑ ↑ '${F.title}' ↵`, requires: ['dynamic-title', 'ctrl-arrow'], convention: 'E9',
      hintStuck: 'pulse cell B27 · A printed sensitivity has to say which case it is.',
      check: (s, ses) => settled(ses) && titleOk(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Scenarios!C10" Enter "Downside" Enter Ctrl+G "Scenarios!D29" Enter', cadence: 320 },
      text: 'Does it tie? Watch the picker go to Downside: the title changes and the whole row recalculates.', requires: [],
      hintStuck: 'pulse range D29:H29 · The table reruns the model for each ticket on every change.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C28:H29 is a Data Table of EBITDA by ticket on G6, titled with its case', check: (s, ses) => edgeOk(ses) && cornerOk(ses) && tableOk(ses) && titleOk(ses) },
  ],
  closing: [
    'Five tickets give five EBITDAs in one table that stays live.',
    'Each dollar of ticket is worth washes a year in EBITDA, and the table shows it without a copy of the model. Best practice: type the edge in blue, link the corner to the output, and title the table with the case it ran on, because a sensitivity without its case is a number without a meaning.',
  ],
  solution: `Ctrl+G "Scenarios!D28" Enter "12" Tab "13" Tab "14" Tab "15" Tab "16" Enter Left "${F.corner}" Enter `
    + 'Up Up Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Down Alt A W T Alt+R "G6" Enter '
    + `Ctrl+Right Right Right Down "1" Enter Escape Ctrl+Left Up Up '${F.title}' Enter`,
};
