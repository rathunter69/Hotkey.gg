// Chapter 4 · 4.1.3 MATCH, then INDEX/MATCH (clearcoat-pack, S412 → S413)
// MATCH alone gives each code's row on Lists; INDEX alone brings back the name in that row; together
// they return capacity with nothing counted. The column inserted inside Lists again breaks D5's
// VLOOKUP and leaves G5 standing; Ctrl+Z. Then the lookup the other way, the code from the name.
import { summary, settled, block, byCode, listRow, listValue, insertedInWindow, undoneInWindow, listsIntact, SITE_ROWS } from './lib/pack-checks.js';
import { FMT } from '../workbooks/page.js';

const F = {
  match: '=MATCH(B5,Lists!$B$5:$B$10,0)',
  index: '=INDEX(Lists!$C$5:$C$10,E5)',
  both: '=INDEX(Lists!$F$5:$F$10,MATCH(B5,Lists!$B$5:$B$10,0))',
  byName: '=INDEX(Lists!$B$5:$B$10,MATCH(C5,Lists!$C$5:$C$10,0))',
};
const head = value => ({ value, bold: true, align: 'r' });
const PLANT = {
  'Summary!E4': head('Row (MATCH)'), 'Summary!F4': head('Site (INDEX)'), 'Summary!G4': head('Capacity (INDEX/MATCH)'), 'Summary!H4': head('Code from name'),
  ...Object.fromEntries(SITE_ROWS.flatMap(r => [[`Summary!E${r}`, { fontColor: 'green' }], [`Summary!F${r}`, { fontColor: 'green' }],
    [`Summary!G${r}`, { fontColor: 'green', fmtStyle: 'custom', numFmt: FMT.countDash }], [`Summary!H${r}`, { fontColor: 'green' }]])),
};
const rows = (ses, sh) => block(sh, 'E', SITE_ROWS, { fns: ['MATCH'], want: r => { const at = listRow(ses, sh.value('B' + r)); return at == null ? '#N/A' : at - 4; } });
const names = (ses, sh) => block(sh, 'F', SITE_ROWS, { fns: ['INDEX'], want: byCode(ses, sh, 'name') });
const capacity = (ses, sh) => block(sh, 'G', SITE_ROWS, { fns: ['INDEX', 'MATCH'], want: byCode(ses, sh, 'capacity') });
const codes = (ses, sh) => block(sh, 'H', SITE_ROWS, { fns: ['INDEX', 'MATCH'], want: r => listValue(ses, sh.value('C' + r), 'code', 'name'), liveRef: null });

export default {
  id: 'match-index-match',
  chapter: 'data-and-lookups',
  section: 'Lookups',
  module: 'lookups',
  workbook: 'clearcoat-pack',
  state: { before: 'S412', after: 'S413' },
  plant: PLANT,
  title: 'MATCH, then INDEX/MATCH',
  difficulty: 'medium',
  tags: ['formulas', 'lookups'],
  access: 'paid',
  minutes: 7,
  headline: 'MATCH',
  conventions: ['B2', 'E3'],
  teaches: ['match-function', 'index-function', 'index-match'],
  uses: ['vlookup', 'lookup-failures', 'go-to', 'cross-sheet-ref', 'ctrl-enter-fill', 'shift-arrow', 'insert-delete-rows', 'row-col-select', 'undo-redo', 'relative-absolute'],
  prerequisites: ['vlookup-hlookup-fail'],
  brief: 'MATCH answers one question: which row is this key on. INDEX answers another: what is in the nth row of this column. Together they do what VLOOKUP does without its faults, because the key can sit in any column, the return column is pointed at rather than counted, and an inserted column changes nothing. It is two functions instead of one, and it is the lookup the standard uses, so rebuild the site block with it. The key is `MATCH`.',
  wow: 'Two functions make a lookup that survives an inserted column.',
  goals: [
    { id: 'match', teach: 'MATCH(key, range, 0) returns where the key sits in a one-column range: AUS-DOM is 1 in Lists!$B$5:$B$10, AUS-CED is 6. The 0 asks for an exact match, the same job FALSE does in VLOOKUP.',
      text: 'Find each code’s row on Lists: fill Summary E5:E10 with =MATCH(B5,Lists!$B$5:$B$10,0).', keys: `Ctrl+G "Summary!E5:E10" ↵ "${F.match}" Ctrl+↵`, requires: ['match-function', 'go-to', 'ctrl-enter-fill', 'cross-sheet-ref'],
      hintStuck: 'pulse range E5:E10 on Summary · The codes in B5:B10 are the keys, the code column on Lists the range.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && rows(ses, sh); } },
    { id: 'index', teach: 'INDEX(range, n) returns the nth cell of a range. Give it the name column and the row MATCH found, and it brings back the name; give it another column and it brings back that instead.',
      text: 'Bring back each name in F5:F10 with =INDEX(Lists!$C$5:$C$10,E5), the row MATCH found.', keys: `→ Shift+↓ ×5 "${F.index}" Ctrl+↵`, requires: ['index-function', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range F5:F10 · E5 holds Domain’s row; the names are Lists!$C$5:$C$10.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && names(ses, sh); } },
    { id: 'together', teach: 'Put the MATCH inside the INDEX and the lookup is one cell: point INDEX at the capacity column, and nothing is counted. This is INDEX/MATCH, the lookup the standard uses.',
      text: 'Capacity with nothing counted: fill G5:G10 with =INDEX(Lists!$F$5:$F$10,MATCH(B5,Lists!$B$5:$B$10,0)).', keys: `→ Shift+↓ ×5 "${F.both}" Ctrl+↵`, requires: ['index-match', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range G5:G10 · The column to return is Lists!$F$5:$F$10; the MATCH is the one from E5.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && capacity(ses, sh); } },
    { id: 'insert', teach: 'An inserted column moves Lists!$F$5:$F$10 to G with it, so INDEX/MATCH still points at capacity, while the VLOOKUP in D5 still counts to 5. Tip from the desk: inherited models often write VLOOKUP(B5,Lists!$B$5:$H$10,MATCH("Capacity (cars an hour)",Lists!$B$4:$H$4,0),FALSE), which cures the count but still needs the key in the first column.',
      text: 'Insert a column on Lists at F again, read G5 hold at Domain’s capacity while D5 drops, then press Ctrl+Z.', keys: 'Ctrl+G "Lists!F5" ↵ Ctrl+Space Ctrl+Shift+= Ctrl+Z', requires: ['index-match', 'insert-delete-rows', 'row-col-select', 'undo-redo', 'go-to'],
      hintStuck: 'pulse cell F5 on Lists · The same insert as last lesson; watch G5 this time.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && insertedInWindow(ses) && undoneInWindow(ses) && listsIntact(ses) && capacity(ses, sh); } },
    { id: 'by-name', teach: 'The key can sit in any column: MATCH the name in the name column and INDEX the code column, right to left, which VLOOKUP cannot do. Best practice: INDEX/MATCH for anything that lives longer than a week, VLOOKUP for a one-off you will delete.',
      text: 'Look up each code from its name in H5:H10: INDEX on the code column, MATCH on the name in C5.', keys: `Ctrl+G "Summary!H5:H10" ↵ "${F.byName}" Ctrl+↵`, requires: ['index-match', 'go-to', 'ctrl-enter-fill'],
      hintStuck: 'pulse range H5:H10 on Summary · MATCH(C5,Lists!$C$5:$C$10,0) finds the name; INDEX the codes in Lists!$B$5:$B$10.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && codes(ses, sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Lists!F5" Enter "130" Enter Ctrl+G "Summary!G5" Enter', cadence: 320 },
      text: 'Does it tie? Watch Domain’s capacity on Lists move to 130 and G5 answer.', requires: [],
      hintStuck: 'pulse cell G5 on Summary · INDEX points at the capacity column wherever it goes.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'E5:H10 hold the MATCH, the INDEX, capacity by INDEX/MATCH and the code from the name', check: (s, ses) => { const sh = summary(ses); return rows(ses, sh) && names(ses, sh) && capacity(ses, sh) && codes(ses, sh); } },
  ],
  closing: [
    'Two functions make a lookup that survives an inserted column.',
    'MATCH finds the row and INDEX fetches from whichever column you point at, so nothing is counted and the key can sit anywhere. The rest of the chapter writes its lookups this way.',
  ],
  solution: `Ctrl+G "Summary!E5:E10" Enter "${F.match}" Ctrl+Enter Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "${F.index}" Ctrl+Enter `
    + `Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "${F.both}" Ctrl+Enter `
    + `Ctrl+G "Lists!F5" Enter Ctrl+Space Ctrl+Shift+= Ctrl+Z Ctrl+G "Summary!H5:H10" Enter "${F.byName}" Ctrl+Enter`,
};
