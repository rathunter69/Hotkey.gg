// Chapter 4 · 4.1.2 VLOOKUP and HLOOKUP, and how they fail (clearcoat-pack, S411 → S412)
// The site block on Summary reads Lists: names and capacity by VLOOKUP. Then the three failures, each
// seen on the sheet: no FALSE returns Cedar Park for South Lamar (an unsorted list), a key outside
// the first column reads #N/A, and a column inserted inside Lists sends capacity to a blank (the
// counted column moved), put back with Ctrl+Z. HLOOKUP reads a week's washes off the cube's header.
// The page's labels and formats arrive with the lesson (plant); the learner writes the formulas.
import { summary, lists, settled, calls, live, same, block, byCode, listValue, vlookupExact, blank, insertedInWindow, undoneInWindow, listsIntact, cubeValue, SITE_ROWS } from './lib/pack-checks.js';
import { FMT } from '../workbooks/page.js';

const F = {
  name: '=VLOOKUP(B5,Lists!$B$5:$H$10,2,FALSE)',
  capacity: '=VLOOKUP(B5,Lists!$B$5:$H$10,5,FALSE)',
  noFalse: '=VLOOKUP(B8,Lists!$B$5:$H$10,2)',
  byName: '=VLOOKUP(C8,Lists!$B$5:$H$10,5,FALSE)',
  week: '=HLOOKUP(H14,$C$14:$E$20,2,FALSE)',
};
const COUNT = { fmtStyle: 'custom', numFmt: FMT.countDash };
const PLANT = {
  ...Object.fromEntries(SITE_ROWS.flatMap(r => [[`Summary!C${r}`, { fontColor: 'green' }], [`Summary!D${r}`, { fontColor: 'green', ...COUNT }]])),
  'Summary!H13': { value: 'Week', bold: true }, 'Summary!I13': { value: 'Domain washes', bold: true, align: 'r' },
  'Summary!H14': { value: 'Week of 21-Sep', fontColor: 'blue' }, 'Summary!I14': { ...COUNT },
};
const names = (ses, sh) => block(sh, 'C', SITE_ROWS, { fns: ['VLOOKUP'], want: byCode(ses, sh, 'name') }) && SITE_ROWS.every(r => vlookupExact(sh, 'C' + r));
const capacity = (ses, sh) => block(sh, 'D', SITE_ROWS, { fns: ['VLOOKUP'], want: byCode(ses, sh, 'capacity') }) && SITE_ROWS.every(r => vlookupExact(sh, 'D' + r));
const week = sh => calls(sh, 'I14', ['HLOOKUP']) && same(sh.value('I14'), cubeValue(sh, sh.value('B15'), sh.value('H14'))) && live(sh, 'I14');

export default {
  id: 'vlookup-hlookup-fail',
  chapter: 'data-and-lookups',
  section: 'Lookups',
  module: 'lookups',
  workbook: 'clearcoat-pack',
  state: { before: 'S411', after: 'S412' },
  plant: PLANT,
  title: 'VLOOKUP and HLOOKUP, and how they fail',
  difficulty: 'medium',
  tags: ['formulas', 'lookups'],
  access: 'paid',
  minutes: 7,
  headline: 'VLOOKUP',
  conventions: ['F5', 'B2'],
  teaches: ['lookup-failures', 'hlookup'],
  uses: ['vlookup', 'go-to', 'cross-sheet-ref', 'ctrl-enter-fill', 'shift-arrow', 'ctrl-arrow', 'insert-delete-rows', 'row-col-select', 'undo-redo', 'delete-clears'],
  prerequisites: ['why-lookups'],
  brief: 'VLOOKUP(key, table, column number, FALSE) looks down the first column for the key and returns the nth column; HLOOKUP does the same across a row. It fails three ways, and each one looks like a number: leave off FALSE and an unsorted list returns a near key, insert a column and the counted column moves, look up by anything but the first column and it reads #N/A. Fill the site block on Summary, then break it each way and read what it says. The key is `VLOOKUP`.',
  wow: 'VLOOKUP works, and now you’ve seen the three ways it breaks.',
  goals: [
    { id: 'names', text: 'Fill the site names into Summary C5:C10 with =VLOOKUP(B5,Lists!$B$5:$H$10,2,FALSE) and Ctrl+Enter.', keys: `Ctrl+G "Summary!C5:C10" ↵ "${F.name}" Ctrl+↵`, requires: ['vlookup', 'go-to', 'ctrl-enter-fill', 'cross-sheet-ref'],
      hintStuck: 'pulse range C5:C10 on Summary · The codes in B5:B10 are the keys; the site name is the table’s second column.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && names(ses, sh); } },
    { id: 'capacity', text: 'Capacity is column 5 of the same table: fill D5:D10 the same way.', keys: `→ Shift+↓ ×5 "${F.capacity}" Ctrl+↵`, requires: ['vlookup', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range D5:D10 · Count across from Code in B: Site, Cluster, Opened, Capacity.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && capacity(ses, sh); } },
    { id: 'no-false', teach: 'Leave off FALSE and VLOOKUP assumes the first column is sorted, then returns the nearest key at or below the one you asked for. The site codes aren’t sorted, so the answer is a wrong site, said with confidence.',
      text: 'Fail one: in E8, leave FALSE off, =VLOOKUP(B8,Lists!$B$5:$H$10,2), and read Cedar Park come back for South Lamar.', keys: `Ctrl+↓ ↑ ×2 → "${F.noFalse}" ↵`, requires: ['lookup-failures', 'ctrl-arrow', 'arrow-keys'],
      hintStuck: 'pulse cell E8 · The fourth argument is the one to leave off.',
      check: (s, ses) => { const sh = summary(ses); const v = sh && sh.value('E8'); return settled(ses) && calls(sh, 'E8', ['VLOOKUP']) && !vlookupExact(sh, 'E8') && typeof v === 'string' && v !== listValue(ses, sh.value('B8'), 'name') && !String(v).startsWith('#'); } },
    { id: 'by-name', teach: 'VLOOKUP only looks down the table’s first column, so a key from any other column finds nothing. #N/A is Excel saying the key isn’t there, and it is the error to read first on any lookup.',
      text: 'Fail three: retype E8 keyed on the name, =VLOOKUP(C8,Lists!$B$5:$H$10,5,FALSE), and read #N/A.', keys: `↑ "${F.byName}" ↵`, requires: ['lookup-failures', 'arrow-keys'], convention: 'F5',
      hintStuck: 'pulse cell E8 · The name in C8 is the key this time.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && calls(sh, 'E8', ['VLOOKUP']) && sh.value('E8') === '#N/A' && /C8/.test(sh.formula('E8')); } },
    { id: 'clear', text: 'Clear E8 with Delete; the two failures have made their point.', keys: '↑ Delete', requires: ['delete-clears', 'arrow-keys'],
      hintStuck: 'pulse cell E8 · Delete empties the cell.',
      check: (s, ses) => settled(ses) && blank(summary(ses), 'E8') },
    { id: 'insert', teach: 'A column number is counted once, when the formula is written. Insert a column inside the table and the table widens, but 5 still means the fifth column, which is now the new blank one.',
      text: 'Fail two: insert a column on Lists at F, before capacity, read D5 drop to 0, then press Ctrl+Z.', keys: 'Ctrl+G "Lists!F5" ↵ Ctrl+Space Ctrl+Shift+= Ctrl+Z', requires: ['lookup-failures', 'insert-delete-rows', 'row-col-select', 'undo-redo', 'go-to'],
      hintStuck: 'pulse cell F5 on Lists · Ctrl+Space takes the whole column, Ctrl+Shift+= inserts one before it.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && insertedInWindow(ses) && undoneInWindow(ses) && listsIntact(ses) && capacity(ses, sh); } },
    { id: 'hlookup', teach: 'HLOOKUP(key, table, row, FALSE) looks across the table’s top row for the key and returns the row you count down to. The cube’s header row holds the week labels, so Domain, the first site, is row 2.',
      text: 'In I14, read Domain’s washes for the week in H14 with =HLOOKUP(H14,$C$14:$E$20,2,FALSE).', keys: `Ctrl+G "Summary!I14" ↵ "${F.week}" ↵`, requires: ['hlookup', 'go-to'],
      hintStuck: 'pulse cell I14 on Summary · The weeks run across C14:E14; Domain is the first row under them.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && week(sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Lists!F5" Enter "130" Enter Ctrl+G "Summary!D5" Enter', cadence: 320 },
      text: 'Does it tie? Watch Domain’s capacity on Lists move to 130 and D5 follow it.', requires: [],
      hintStuck: 'pulse cell D5 on Summary · The lookup reads Lists every time it calculates.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C5:D10 read each site’s name and capacity from Lists by exact VLOOKUP', check: (s, ses) => { const sh = summary(ses); return names(ses, sh) && capacity(ses, sh); } },
    { text: 'E8 is empty and I14 reads the week’s washes by HLOOKUP', check: (s, ses) => { const sh = summary(ses); return blank(sh, 'E8') && week(sh); } },
  ],
  closing: [
    'VLOOKUP works, and now you’ve seen the three ways it breaks.',
    'Each failure came back looking like an answer or an error you might wave through: a wrong site, a blank read as 0, a #N/A. Best practice: always write FALSE, and treat a counted column number as a promise that nobody will ever insert a column. The next lesson removes the count.',
  ],
  solution: `Ctrl+G "Summary!C5:C10" Enter "${F.name}" Ctrl+Enter Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "${F.capacity}" Ctrl+Enter `
    + `Ctrl+Down Up Up Right "${F.noFalse}" Enter Up "${F.byName}" Enter Up Delete `
    + `Ctrl+G "Lists!F5" Enter Ctrl+Space Ctrl+Shift+= Ctrl+Z Ctrl+G "Summary!I14" Enter "${F.week}" Enter`,
};
