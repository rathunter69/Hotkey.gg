// Chapter 4 · 4.1.4 Two-way INDEX/MATCH: any site, any week (clearcoat-pack, S413 → S414)
// The washes cube on Summary (pasted values until 4.3.1 builds it live) is read by one cell: the
// question typed into two blue inputs, the row position and the column position by MATCH, INDEX
// where they cross, then both MATCHes folded into the INDEX. The labels and formats of the "Any site,
// any week" block arrive with the lesson; the closer asks another site and week.
import { summary, settled, calls, live, same, selected, onSheet, cubeValue, fnsOf } from './lib/pack-checks.js';
import { FMT } from '../workbooks/page.js';

const F = {
  row: '=MATCH(C34,$B$15:$B$20,0)',
  col: '=MATCH(C35,$C$14:$E$14,0)',
  cross: '=INDEX($C$15:$E$20,C36,C37)',
  one: '=INDEX($C$15:$E$20,MATCH(C34,$B$15:$B$20,0),MATCH(C35,$C$14:$E$14,0))',
};
const COUNT = { fmtStyle: 'custom', numFmt: FMT.countDash, decimals: 0 };
const PLANT = {
  'Summary!B33': { value: 'Any site, any week', bold: true },
  'Summary!B34': { value: 'Site code' }, 'Summary!C34': { fontColor: 'blue' },
  'Summary!B35': { value: 'Week' }, 'Summary!C35': { fontColor: 'blue' },
  'Summary!B36': { value: 'Row position' }, 'Summary!C36': { ...COUNT },
  'Summary!B37': { value: 'Column position' }, 'Summary!C37': { ...COUNT },
  'Summary!B38': { value: 'Washes' }, 'Summary!C38': { ...COUNT },
};
const sameText = (a, b) => typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();
const pos = (sh, list, key) => { const i = list.findIndex(ref => sameText(sh.value(ref), key)); return i < 0 ? '#N/A' : i + 1; };
const SITES_DOWN = ['B15', 'B16', 'B17', 'B18', 'B19', 'B20'], WEEKS_ACROSS = ['C14', 'D14', 'E14'];
const inputs = sh => !!sh && sameText(sh.value('C34'), 'AUS-AIR') && sameText(sh.value('C35'), 'Week of 21-Sep');
const rowPos = sh => calls(sh, 'C36', ['MATCH']) && same(sh.value('C36'), pos(sh, SITES_DOWN, sh.value('C34'))) && live(sh, 'C36');
const colPos = sh => calls(sh, 'C37', ['MATCH']) && same(sh.value('C37'), pos(sh, WEEKS_ACROSS, sh.value('C35'))) && live(sh, 'C37');
const answer = sh => calls(sh, 'C38', ['INDEX']) && same(sh.value('C38'), cubeValue(sh, sh.value('C34'), sh.value('C35'))) && live(sh, 'C38');
const oneCell = sh => answer(sh) && fnsOf(sh, 'C38').filter(f => f === 'MATCH').length === 2;

export default {
  id: 'two-way-index-match',
  chapter: 'data-and-lookups',
  section: 'Lookups',
  module: 'lookups',
  workbook: 'clearcoat-pack',
  state: { before: 'S413', after: 'S414' },
  plant: PLANT,
  title: 'Two-way INDEX/MATCH: any site, any week',
  difficulty: 'medium',
  tags: ['formulas', 'lookups'],
  access: 'paid',
  minutes: 6,
  headline: 'INDEX',
  conventions: ['B1', 'B4'],
  teaches: ['two-way-lookup'],
  uses: ['index-match', 'match-function', 'index-function', 'go-to', 'ctrl-arrow', 'type-to-enter', 'relative-absolute'],
  prerequisites: ['match-index-match'],
  brief: 'A two-way lookup finds a row and a column: the washes for any site in any week, from the cube on Summary. INDEX takes a whole block and two positions, one MATCH for the site down the side and one for the week across the top, and one cell answers any pair. The cube is pasted values for now; 4.3.1 builds it live from the export. Wire the answer to two typed inputs so a buyer can ask any site, any week. The key is `INDEX`.',
  wow: 'One cell answers any site in any week.',
  goals: [
    { id: 'read-cube', text: 'Select the washes in the cube on Summary, C15:E20: sites run down B15:B20, weeks across C14:E14.', keys: 'Ctrl+G "Summary!C15:E20" ↵', requires: ['go-to'],
      hintStuck: 'pulse range C15:E20 on Summary · The cube sits under Washes by site and week.',
      check: (s, ses) => settled(ses) && onSheet(ses, 'Summary') && selected(summary(ses), 'C15:E20') },
    { id: 'inputs', text: 'Type the question into the blue inputs: AUS-AIR in C34 and Week of 21-Sep in C35.', keys: '← Ctrl+↓ ×2 ↓ → "AUS-AIR" ↵ "Week of 21-Sep" ↵', requires: ['type-to-enter', 'ctrl-arrow', 'arrow-keys'], convention: 'B1',
      hintStuck: 'pulse range C34:C35 · The labels in B34:B35 say which is which; type the week exactly as the cube’s header reads.',
      check: (s, ses) => settled(ses) && inputs(summary(ses)) },
    { id: 'row-pos', teach: 'A two-way lookup needs two positions. MATCH down the codes in B15:B20 says which row of the cube the site is on, and MATCH across the week labels in C14:E14 says which column.',
      text: 'Row position in C36: =MATCH(C34,$B$15:$B$20,0) finds the site down the side.', keys: `"${F.row}" ↵`, requires: ['two-way-lookup', 'match-function'],
      hintStuck: 'pulse cell C36 · The codes run down B15:B20.',
      check: (s, ses) => settled(ses) && rowPos(summary(ses)) },
    { id: 'col-pos', text: 'Column position in C37: =MATCH(C35,$C$14:$E$14,0) finds the week across the top.', keys: `"${F.col}" ↵`, requires: ['two-way-lookup', 'match-function'],
      hintStuck: 'pulse cell C37 · The weeks run across C14:E14.',
      check: (s, ses) => settled(ses) && colPos(summary(ses)) },
    { id: 'cross', teach: 'INDEX(block, row, column) returns the cell where a row and a column of the block cross, so the two positions read one figure out of eighteen.',
      text: 'In C38, =INDEX($C$15:$E$20,C36,C37) reads the washes where the two positions cross.', keys: `"${F.cross}" ↵`, requires: ['two-way-lookup', 'index-function'],
      hintStuck: 'pulse cell C38 · The block is the cube’s figures, C15:E20.',
      check: (s, ses) => settled(ses) && answer(summary(ses)) },
    { id: 'one-cell', teach: 'The helper cells show the working; the one-cell version is what goes in a model, because it can’t lose a helper. Best practice: keep the inputs in their own blue cells and never type them inside the formula.',
      text: 'Collapse it into one cell: put both MATCHes inside the INDEX in C38.', keys: `↑ "${F.one}" ↵`, requires: ['two-way-lookup', 'index-match', 'arrow-keys'], convention: 'B4',
      hintStuck: 'pulse cell C38 · Swap C36 and C37 for the two MATCHes they hold.',
      check: (s, ses) => settled(ses) && oneCell(summary(ses)) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Summary!C34" Enter "AUS-MUE" Enter "Week of 28-Sep" Enter Ctrl+G "Summary!C38" Enter', cadence: 320 },
      text: 'Does it tie? Watch the inputs change to AUS-MUE and Week of 28-Sep and C38 move with them.', requires: [],
      hintStuck: 'pulse cell C38 on Summary · The inputs lead; the answer follows.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C38 answers the inputs in C34:C35 from the cube in one INDEX with two MATCHes', check: (s, ses) => { const sh = summary(ses); return inputs(sh) && rowPos(sh) && colPos(sh) && oneCell(sh); } },
  ],
  closing: [
    'One cell answers any site in any week.',
    'Two MATCHes give the coordinates and INDEX reads the figure where they cross. In 4.2.4 the site input becomes a drop-down, so nobody can ask for a code that isn’t there.',
  ],
  solution: `Ctrl+G "Summary!C15:E20" Enter Left Ctrl+Down Ctrl+Down Down Right "AUS-AIR" Enter "Week of 21-Sep" Enter "${F.row}" Enter "${F.col}" Enter "${F.cross}" Enter Up "${F.one}" Enter`,
};
