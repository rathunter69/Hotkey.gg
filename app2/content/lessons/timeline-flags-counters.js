// Chapter 5 · 5.2.2 The timeline row: flags and counters (clearcoat-model, B522 → B523)
// On Inputs: the first year end typed, EOMONTH across, the A/E row, the last historical year end typed
// and named LastHistorical, the projection flag that reads it, the period and projection counters, the
// COLUMNS counter and its live check; then row 4 linked from Inputs on the six other model sheets in one
// grouped entry. Formats arrive planted (the "FY"yy code, the counters' zero dash, the green links), as
// do the Cover's names list entry and the cost build's first-period formula that 5.2.3 fills.
import { settled, formatsFrom, cellIn, script, matches, nameIs, cellsOf } from './lib/model-checks.js';

const LINKED = ['IS', 'CF', 'BS', 'Schedules', 'Checks', 'DCF'];
const PLANT = {
  ...formatsFrom('B523', 'Inputs', cellsOf('C4:J11')),
  ...Object.assign({}, ...LINKED.map(name => formatsFrom('B523', name, cellsOf('C4:J4')))),
  'Cover!C29': cellIn('B523', 'Cover', 'C29'),
  'Schedules!C32': cellIn('B523', 'Schedules', 'C32'),
};
const K = {
  years: 'Ctrl+G "Inputs!C4" ↵ "12/31/2024" ↵ → "=EOMONTH(C4,12)" ↵ Shift+→ ×6 Ctrl+R',
  ae: '↓ ← "A" Tab "A" Tab Shift+→ ×5 "E" Ctrl+↵',
  last: 'Ctrl+G "Inputs!C11" ↵ "12/31/2026" ↵ Alt M M D "LastHistorical" ↵',
  flag: 'Ctrl+G "Inputs!C6" ↵ "=IF(C$4>LastHistorical,1,0)" ↵ Shift+→ ×7 Ctrl+R',
  counters: '↓ "1" → "=C7+1" ↵ Shift+→ ×6 Ctrl+R ↓ ← "=IF(C6=1,MAX(B8,0)+1,0)" ↵ Shift+→ ×7 Ctrl+R',
  columns: '↓ "=COLUMNS($C4:C4)" ↵ Shift+→ ×7 Ctrl+R ↓ "=C9-C7" ↵ Shift+→ ×7 Ctrl+R',
  link: 'Ctrl+G "IS!C4" ↵ Ctrl+Shift+PgDn ×5 Ctrl+PgUp ×5 "=Inputs!C4" ↵ Shift+→ ×7 Ctrl+R Ctrl+PgUp',
};
const on = (ses, range) => matches(ses, 'Inputs', range, 'B523');
const zeros = ses => cellsOf('C10:J10').every(ref => ses.sheets.find(x => x.name === 'Inputs').sheet.value(ref) === 0);
const linked = ses => LINKED.every(name => matches(ses, name, 'C4:J4', 'B523'));

export default {
  id: 'timeline-flags-counters',
  chapter: 'finance-and-accounting',
  section: 'Model setup and efficiencies',
  module: 'model-setup',
  workbook: 'clearcoat-model',
  state: { before: 'B522', after: 'B523' },
  plant: PLANT,
  title: 'The timeline row: flags and counters',
  difficulty: 'medium',
  tags: ['finance', 'model', 'timeline', 'dates'],
  access: 'paid',
  minutes: 7,
  headline: 'EOMONTH',
  conventions: ['B1', 'F1'],
  teaches: ['timeline-flags', 'columns-counter'],
  uses: ['go-to', 'eomonth-edate', 'date-serial', 'fill-down-right', 'shift-arrow', 'tab-commits', 'arrow-keys', 'ctrl-enter-fill', 'defined-name', 'if-function', 'min-max-cap', 'group-sheets', 'cross-sheet-ref', 'check-cell'],
  prerequisites: ['model-architecture'],
  brief: 'Every sheet in the model shares one timeline: FY24 to FY31 across the same columns, built from one date on Inputs (2.6.2), with the A/E flags underneath (2.1.4). This time the flags do work: a projection flag (1 in a projected year, 0 in a historical one, FY26 included) lets one formula read the actual where there is one and calculate where there isn’t, and a counter drives growth and ramps. Build the row once on Inputs and link it to every sheet. The key is `EOMONTH`.',
  wow: 'One date on Inputs, and eight years with their flags and counters on every sheet.',
  goals: [
    { id: 'years', teach: 'The model is annual because it values the business, and it projects five years because fewer gives too little to value and more is hard to defend. One date is typed; every other year end counts on from it.',
      text: 'On Inputs, type 12/31/2024 in C4, then =EOMONTH(C4,12) in D4 filled right to J4 with Ctrl+R.', keys: K.years, requires: ['timeline-flags', 'go-to', 'eomonth-edate', 'fill-down-right', 'shift-arrow'], convention: 'B1',
      hintStuck: 'pulse range C4:J4 · Twelve months on from a year end is the next year end.',
      check: (s, ses) => settled(ses) && on(ses, 'C4:J4') },
    { id: 'ae', teach: 'FY26 is the estimate for the year still running (2.1.4): its accounts aren’t closed, so it reads E like the forecast.',
      text: 'The A/E row: A and A in C5:D5, then E across E5:J5 in one entry with Ctrl+Enter.', keys: K.ae, requires: ['timeline-flags', 'tab-commits', 'ctrl-enter-fill'],
      hintStuck: 'pulse range C5:J5 · Ctrl+Enter puts one entry in every selected cell.',
      check: (s, ses) => settled(ses) && on(ses, 'C5:J5') },
    { id: 'last-historical', teach: 'The last year with figures from the accountants is an input, typed once in blue and named, so the flag reads a stated date and not a column.',
      text: 'Type 12/31/2026 in C11 and name it LastHistorical with Alt, M, M, D.', keys: K.last, requires: ['timeline-flags', 'defined-name', 'keytips'],
      hintStuck: 'pulse cell C11 · Define Name takes the selected cell as its reference.',
      check: (s, ses) => settled(ses) && on(ses, 'C11') && nameIs(ses, 'LastHistorical', 'Inputs!C11') },
    { id: 'flag', teach: 'Best practice: a formula that reads the flag, =IF(flag=0, actual, calculation), lets one row carry history and forecast with no seam.',
      text: 'The projection flag in C6, =IF(C$4>LastHistorical,1,0), filled to J6: 0 for FY24 to FY26, 1 after.', keys: K.flag, requires: ['timeline-flags', 'if-function', 'defined-name', 'fill-down-right'],
      hintStuck: 'pulse range C6:J6 · FY26 ends on LastHistorical, so it isn’t greater and stays 0.',
      check: (s, ses) => settled(ses) && on(ses, 'C6:J6') },
    { id: 'counters', text: 'Counters: 1 in C7 and =C7+1 across D7:J7, then =IF(C6=1,MAX(B8,0)+1,0) across C8:J8, which starts at 1 in FY27.', keys: K.counters, requires: ['timeline-flags', 'min-max-cap', 'arrow-keys'],
      hintStuck: 'pulse range C7:J8 · B8 is a label, and MAX of text and 0 is 0.',
      check: (s, ses) => settled(ses) && on(ses, 'C7:J8') },
    { id: 'columns', teach: 'The desk’s other counter, =COLUMNS($C4:C4), reads 1 in the first period and one more with every column it fills across, with no first cell to break and no typed offset. Insert a column in front and it still counts from 1, where =COLUMN()-2 would not.',
      text: 'Fill =COLUMNS($C4:C4) across C9:J9, and =C9-C7 across C10:J10, which reads zero.', keys: K.columns, requires: ['columns-counter', 'check-cell', 'fill-down-right'], convention: 'F1',
      hintStuck: 'pulse range C9:J10 · The anchored $C keeps the start still while the end moves.',
      check: (s, ses) => settled(ses) && on(ses, 'C9:J10') && zeros(ses) },
    { id: 'link', teach: 'Best practice: the same year sits in the same column on every sheet, FY26 in column E everywhere, so a link across sheets never needs a MATCH and a reviewer never counts columns.',
      text: 'Group IS to DCF with Ctrl+Shift+PgDn, and link row 4 once: =Inputs!C4 in C4, filled right to J4.', keys: K.link, requires: ['group-sheets', 'cross-sheet-ref', 'fill-down-right'],
      hintStuck: 'pulse range C4:J4 · Ctrl+PgUp walks back through the group without ending it.',
      check: (s, ses) => settled(ses) && !ses.group && linked(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!C4" Enter "12/31/2023" Enter Ctrl+PgDn', cadence: 360 },
      text: 'Does it tie? Watch FY24’s year end on Inputs move back a year, and every header on IS roll with it.', requires: [],
      hintStuck: 'pulse range C4:J4 · Every year end reads the one before it.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Inputs carries the timeline, the A/E row, the flag and three counters', check: (s, ses) => on(ses, 'C4:J11') },
    { text: 'LastHistorical names Inputs!C11', check: (s, ses) => nameIs(ses, 'LastHistorical', 'Inputs!C11') },
    { text: 'Row 4 on IS, CF, BS, Schedules, Checks and DCF links to Inputs', check: (s, ses) => linked(ses) },
  ],
  closing: [
    'One timeline runs across eight sheets, and its flags let one row hold history and forecast.',
    'The projection flag reads a stated date, so when FY26 closes you move one input and the model shifts a year. The counters are what growth and the ramp of a new site will read from 5.3 on, and the same year sits in the same column everywhere.',
  ],
  solution: script(Object.values(K).join(' ')),
};
