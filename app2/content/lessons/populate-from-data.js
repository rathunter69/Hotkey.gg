// Chapter 5 · 5.2.5 Populate the statements from the data tab: INDEX/MATCH on label and year (clearcoat-model, B525 → B526)
// The IS has its labels and no figures. Data holds the accountants' export (their labels in B, the years
// as numbers across row 4), and Inputs M:N maps the model's lines to their labels. The learner writes the
// helper that reads each line's name on Data, then fills the historical block with one two-way
// INDEX/MATCH per area (revenue, cost of sales, site costs), and switches rent, which Data splits over
// two accounts, to SUMIFS. Formats, the other helpers, the totals and the lines below head office arrive
// planted.
import { settled, formatOnly, cellIn, script, matches, cellsOf } from './lib/model-checks.js';
import { STATES } from '../workbooks/clearcoat-model.js';

const S = 'IS';
const OWN = new Set(['A5', 'A6', 'A7', ...cellsOf('C5:E7'), ...cellsOf('C9:E9'), ...cellsOf('C13:E18')]);
const cells = STATES.B526.sheets.find(s => s.name === S).cells;
const PLANT = Object.fromEntries(Object.keys(cells).filter(ref => /^[ACDE]\d+$/.test(ref) && +ref.slice(1) >= 5)
  .map(ref => [`${S}!${ref}`, OWN.has(ref) ? formatOnly(cellIn('B526', S, ref)) : cellIn('B526', S, ref)]).filter(([, c]) => c));
const LOOK = sign => `"=${sign}INDEX(Data!$C$5:$F$44,MATCH($A{r},Data!$B$5:$B$44,0),MATCH(YEAR(C$4),Data!$C$4:$F$4,0))"`;
const at = (sign, r) => LOOK(sign).replace('{r}', r);
const K = {
  helper: 'Ctrl+G "IS!A5" ↵ "=INDEX(Inputs!$N$5:$N$40,MATCH($B5,Inputs!$M$5:$M$40,0))" ↵ Shift+↓ ×2 Ctrl+D',
  revenue: `Ctrl+G "IS!C5:E7" ↵ ${at('', 5)} Ctrl+↵`,
  cos: `Ctrl+G "IS!C9:E9" ↵ ${at('-', 9)} Ctrl+↵`,
  costs: `Ctrl+G "IS!C13:E18" ↵ ${at('-', 13)} Ctrl+↵`,
  rent: 'Ctrl+G "IS!C14:E14" ↵ "=-SUMIFS(INDEX(Data!$C$5:$F$44,0,MATCH(YEAR(C$4),Data!$C$4:$F$4,0)),Data!$B$5:$B$44,$A14)" Ctrl+↵',
};
const on = (ses, range) => matches(ses, S, range, 'B526');

export default {
  id: 'populate-from-data',
  chapter: 'finance-and-accounting',
  section: 'Model setup and efficiencies',
  module: 'model-setup',
  workbook: 'clearcoat-model',
  state: { before: 'B525', after: 'B526' },
  plant: PLANT,
  title: 'Populate the statements from the data tab: INDEX/MATCH on label and year',
  difficulty: 'hard',
  tags: ['finance', 'model', 'lookups', 'data'],
  access: 'paid',
  minutes: 7,
  headline: 'INDEX',
  conventions: ['B4'],
  teaches: ['populate-by-name'],
  uses: ['go-to', 'index-match', 'two-way-lookup', 'match-function', 'index-function', 'year-month-day', 'relative-absolute', 'fill-down-right', 'ctrl-enter-fill', 'sumif-sumifs', 'index-slice', 'shift-arrow'],
  prerequisites: ['checks-sheet-day-one'],
  brief: 'The three historical years arrive on a Data tab as the accountants sent them: forty lines in their order, years across, labels that don’t match the model’s. The model’s IS should read them by name, not by position: INDEX/MATCH on the label down and the year across (4.1.4), so one formula fills the whole historical block and survives a re-sorted export. Where Data has two lines with one label, SUMIFS on label and year does the same job and adds them (4.1.7). Fill the IS historicals from Data by name. The key is `INDEX`.',
  wow: 'Three years of history on the IS, read from the export by name and year.',
  goals: [
    { id: 'helper', teach: 'Data uses the accountants’ labels, and the mapping on Inputs, the model’s line in M and their name in N, translates one into the other. A helper in column A does the translation once per line.',
      text: 'In IS!A5, =INDEX(Inputs!$N$5:$N$40,MATCH($B5,Inputs!$M$5:$M$40,0)), filled down to A7 with Ctrl+D.', keys: K.helper, requires: ['populate-by-name', 'go-to', 'index-match', 'fill-down-right', 'shift-arrow'], convention: 'B4',
      hintStuck: 'pulse range A5:A7 · MATCH finds the model’s label in M; INDEX returns the name beside it in N.',
      check: (s, ses) => settled(ses) && on(ses, 'A5:A7') },
    { id: 'revenue', teach: 'One formula for the block: the helper finds the row on Data, YEAR of the header finds the column, because Data holds 2024 where the model holds a date. $A keeps the label column still; the row 4 anchor keeps the header row still.',
      text: 'Revenue in C5:E7 in one entry: =INDEX(Data!$C$5:$F$44,MATCH($A5,…),MATCH(YEAR(C$4),Data!$C$4:$F$4,0)), with Ctrl+Enter.', keys: K.revenue, requires: ['two-way-lookup', 'year-month-day', 'relative-absolute', 'ctrl-enter-fill'],
      hintStuck: 'pulse range C5:E7 · The label range is Data!$B$5:$B$44.',
      check: (s, ses) => settled(ses) && on(ses, 'C5:E7') },
    { id: 'cos', teach: 'Data records costs as positive figures; the IS shows them negative, so the formula carries a minus in front.',
      text: 'Cost of sales in C9:E9: the same lookup with a minus in front, =-INDEX(…).', keys: K.cos, requires: ['two-way-lookup', 'ctrl-enter-fill'],
      hintStuck: 'pulse range C9:E9 · A cost is a negative on this IS.',
      check: (s, ses) => settled(ses) && on(ses, 'C9:E9') },
    { id: 'site-costs', teach: 'Best practice: never link a model to a data dump by cell position. The next dump will be a row longer or sorted differently, and a lookup by name is what survives it.',
      text: 'The six site costs in C13:E18, in one entry with the minus lookup.', keys: K.costs, requires: ['two-way-lookup', 'ctrl-enter-fill'],
      hintStuck: 'pulse range C13:E18 · The helpers in A13:A18 are already there.',
      check: (s, ses) => settled(ses) && on(ses, 'C13:E13') && on(ses, 'C15:E18') },
    { id: 'rent', teach: 'Data splits rent over two accounts with one label, and MATCH stops at the first. SUMIFS adds every row with the label, and INDEX(block,0,n) hands it the year’s column (4.1.7).',
      text: 'Switch rent in C14:E14 to =-SUMIFS(INDEX(Data!$C$5:$F$44,0,MATCH(YEAR(C$4),…)),Data!$B$5:$B$44,$A14).', keys: K.rent, requires: ['sumif-sumifs', 'index-slice', 'ctrl-enter-fill'],
      hintStuck: 'pulse range C14:E14 · Both Rent lines on Data belong in the total.',
      check: (s, ses) => settled(ses) && on(ses, 'C14:E14') },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Data!E5" Enter "27000" Enter Ctrl+G "IS!E5" Enter', cadence: 360 },
      text: 'Does it tie? Watch FY26 retail sales on Data rise by 1,000, and the IS’s FY26 revenue answer.', requires: [],
      hintStuck: 'pulse cell E5 · The IS reads Data by name and year.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The IS historicals read Data by name and year, from revenue to site costs', check: (s, ses) => on(ses, 'A5:A7') && on(ses, 'C5:E9') && on(ses, 'C13:E18') },
  ],
  closing: [
    'The historicals read the data tab by name, so the next dump can be any shape.',
    'Three years of actuals fill the IS with four formulas, and none of them knows which row Data put a line on. When the accountants send next year’s export with a line added, the model reads it the same way.',
  ],
  solution: script(Object.values(K).join(' ')),
};
