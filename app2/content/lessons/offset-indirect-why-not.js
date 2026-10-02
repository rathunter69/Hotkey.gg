// Chapter 4 · 4.1.8 OFFSET and INDIRECT, and why the standard avoids them (clearcoat-pack, S417 → S418)
// Capacity the long way twice: OFFSET from Lists!B4, then INDIRECT from a built string. The trace
// arrow stops at B4 and the code list, never a capacity. A row inserted at the top of the site list
// sends both to the wrong cell while G5's INDEX/MATCH holds; Ctrl+Z. N5:N10 is rewritten as
// INDEX/MATCH, the INDIRECT column cleared, and INDEX(block,0,2) sums a week with no OFFSET.
import { summary, lists, settled, calls, live, same, block, byCode, blank, arrowsOn, windowKeys, insertedInWindow, undoneInWindow, listsIntact, fnsOf, SITE_ROWS } from './lib/pack-checks.js';
import { FMT } from '../workbooks/page.js';

const F = {
  offset: '=OFFSET(Lists!$B$4,MATCH(B5,Lists!$B$5:$B$10,0),4)',
  indirect: '=INDIRECT("Lists!F"&(4+MATCH(B5,Lists!$B$5:$B$10,0)))',
  index: '=INDEX(Lists!$F$5:$F$10,MATCH(B5,Lists!$B$5:$B$10,0))',
  week: '=SUM(INDEX($C$15:$E$20,0,2))',
};
const q = f => `'${f}'`;
const COUNT = { fmtStyle: 'custom', numFmt: FMT.countDash };
const head = value => ({ value, bold: true, align: 'r' });
const PLANT = {
  'Summary!N4': head('Capacity (OFFSET)'), 'Summary!O4': head('Capacity (INDIRECT)'),
  ...Object.fromEntries(SITE_ROWS.flatMap(r => [[`Summary!N${r}`, { fontColor: 'green', ...COUNT }], [`Summary!O${r}`, { fontColor: 'green', ...COUNT }]])),
  'Summary!I18': { value: 'Second week, all sites', bold: true }, 'Summary!J18': { ...COUNT },
};
const offset = (ses, sh) => block(sh, 'N', SITE_ROWS, { fns: ['OFFSET'], want: byCode(ses, sh, 'capacity') });
const indirect = (ses, sh) => block(sh, 'O', SITE_ROWS, { fns: ['INDIRECT'], want: byCode(ses, sh, 'capacity') });
const rewritten = (ses, sh) => !!sh && sh.value('N4') === 'Capacity (INDEX/MATCH)' && block(sh, 'N', SITE_ROWS, { fns: ['INDEX', 'MATCH'], want: byCode(ses, sh, 'capacity') })
  && SITE_ROWS.every(r => !fnsOf(sh, 'N' + r).includes('OFFSET'));
const cleared = sh => ['O4', ...SITE_ROWS.map(r => 'O' + r)].every(ref => blank(sh, ref) && !(sh.cells[ref] && (sh.cells[ref].bold || sh.cells[ref].fontColor)));
const week = sh => calls(sh, 'J18', ['SUM', 'INDEX']) && !fnsOf(sh, 'J18').includes('OFFSET') && same(sh.value('J18'), [15, 16, 17, 18, 19, 20].reduce((t, r) => t + (sh.value('D' + r) || 0), 0)) && live(sh, 'J18');

export default {
  id: 'offset-indirect-why-not',
  chapter: 'data-and-lookups',
  section: 'Lookups',
  module: 'lookups',
  workbook: 'clearcoat-pack',
  state: { before: 'S417', after: 'S418' },
  plant: PLANT,
  title: 'OFFSET and INDIRECT, and why the standard avoids them',
  difficulty: 'hard',
  tags: ['formulas', 'lookups', 'auditing'],
  access: 'paid',
  minutes: 7,
  headline: 'OFFSET',
  conventions: ['E6'],
  teaches: ['offset-indirect', 'index-slice'],
  uses: ['index-match', 'trace-arrows', 'insert-delete-rows', 'row-col-select', 'undo-redo', 'clear-all', 'go-to', 'ctrl-enter-fill', 'shift-arrow', 'ctrl-shift-arrow', 'keytips'],
  prerequisites: ['multi-criteria-lookups'],
  brief: 'OFFSET returns a cell some rows and columns away from a starting cell; INDIRECT turns a text string into a reference. You will meet both in other people’s models, so learn to read them, and learn why the standard avoids them: both recalculate on every change, so a big model crawls, and neither shows the trace arrows what it reads, so an audit goes blind. Build one of each, watch the arrow miss, break both with one row, and rewrite them. The key is `OFFSET`.',
  wow: 'You can read OFFSET and INDIRECT now, and you know why you won’t write them.',
  goals: [
    { id: 'offset', teach: 'OFFSET(start, rows, columns) counts away from a starting cell: from Lists!B4, down as many rows as MATCH says and four columns across, lands on the site’s capacity. It is volatile, so Excel recalculates it on every change anywhere in the file.',
      text: 'Reach capacity the long way in Summary N5:N10: =OFFSET(Lists!$B$4,MATCH(B5,Lists!$B$5:$B$10,0),4).', keys: `Ctrl+G "Summary!N5:N10" ↵ "${F.offset}" Ctrl+↵`, requires: ['offset-indirect', 'go-to', 'ctrl-enter-fill'],
      hintStuck: 'pulse range N5:N10 on Summary · Start at the header cell Lists!$B$4 and count down to the site.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && offset(ses, sh); } },
    { id: 'trace', teach: 'Trace Precedents draws what a formula reads (3.6.1). On OFFSET it points at the starting cell and the code list, never at the capacity it returns, so a reviewer following arrows can’t see where the number came from.',
      text: 'Trace N5 with Alt M P, read the arrow stop at Lists!B4 instead of a capacity, then clear it with Alt M A A.', keys: 'Alt M P Alt M A A', requires: ['trace-arrows', 'keytips'], convention: 'E6',
      hintStuck: 'pulse cell N5 · The arrows are drawings; clearing them changes no cell.',
      check: (s, ses) => { const k = windowKeys(ses).join(' '); return settled(ses) && /Alt M P/.test(k) && /Alt M A A/.test(k) && arrowsOn(summary(ses)).length === 0; } },
    { id: 'indirect', teach: 'INDIRECT(text) treats a string as an address: "Lists!F" joined to a row number becomes the capacity cell. The address is text, so nothing in the file knows it points there, and it is volatile too.',
      text: 'Reach it again in O5:O10 from a string: =INDIRECT("Lists!F"&(4+MATCH(B5,Lists!$B$5:$B$10,0))).', keys: `→ Shift+↓ ×5 ${q(F.indirect)} Ctrl+↵`, requires: ['offset-indirect', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range O5:O10 · The site list starts on row 5, so row 4 plus the MATCH is the site’s row.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && indirect(ses, sh); } },
    { id: 'insert-row', teach: 'Insert a row at the top of the list and every real reference moves with it, but OFFSET still counts from B4 and INDIRECT still builds the old address. Both return the new blank row; INDEX/MATCH in G5 follows the list.',
      text: 'Insert a row on Lists at row 5, the top of the site list, watch N5 and O5 go wrong while G5 holds, then Ctrl+Z.', keys: 'Ctrl+G "Lists!B5" ↵ Shift+Space Ctrl+Shift+= Ctrl+Z', requires: ['insert-delete-rows', 'row-col-select', 'undo-redo', 'go-to'],
      hintStuck: 'pulse cell B5 on Lists · Shift+Space takes the row, Ctrl+Shift+= inserts one above it.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && insertedInWindow(ses) && undoneInWindow(ses) && listsIntact(ses) && offset(ses, sh) && indirect(ses, sh); } },
    { id: 'rewrite', text: 'Rewrite N5:N10 as INDEX/MATCH and retitle N4 Capacity (INDEX/MATCH).', keys: `Ctrl+G "Summary!N4" ↵ "Capacity (INDEX/MATCH)" ↵ Shift+↓ ×5 "${F.index}" Ctrl+↵`, requires: ['index-match', 'go-to', 'shift-arrow', 'ctrl-enter-fill'], convention: 'E6',
      hintStuck: 'pulse range N4:N10 on Summary · The INDEX/MATCH from G5 is the one to write.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && rewritten(ses, sh); } },
    { id: 'clear-indirect', text: 'Clear the INDIRECT column, O4:O10, with Clear All, Alt H E A, so only the INDEX/MATCH stays.', keys: '→ ↑ Ctrl+Shift+↓ Alt H E A', requires: ['clear-all', 'ctrl-shift-arrow', 'keytips', 'arrow-keys'],
      hintStuck: 'pulse range O4:O10 · Clear All takes the formats with the formulas.',
      check: (s, ses) => settled(ses) && cleared(summary(ses)) },
    { id: 'week', teach: 'INDEX(block, 0, n) returns the whole nth column of a block, so SUM around it adds one week of the cube. It does what an OFFSET over a moving column does, and the trace arrows can see the block it reads.',
      text: 'In J18, sum the second week of the cube without OFFSET: =SUM(INDEX($C$15:$E$20,0,2)).', keys: `Ctrl+G "Summary!J18" ↵ "${F.week}" ↵`, requires: ['index-slice', 'go-to'],
      hintStuck: 'pulse cell J18 on Summary · Row 0 means every row; column 2 is the second week.',
      check: (s, ses) => settled(ses) && week(summary(ses)) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Lists!F5" Enter "130" Enter Ctrl+G "Summary!N5" Enter', cadence: 320 },
      text: 'Does it tie? Watch Domain’s capacity on Lists move to 130 and N5 follow it, traceably.', requires: [],
      hintStuck: 'pulse cell N5 on Summary · INDEX/MATCH reads the capacity column itself.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'N4:N10 read capacity by INDEX/MATCH, O4:O10 are clear, and J18 sums the second week', check: (s, ses) => { const sh = summary(ses); return rewritten(ses, sh) && cleared(sh) && week(sh); } },
    { text: 'No trace arrows are left on Summary', check: (s, ses) => arrowsOn(summary(ses)).length === 0 },
  ],
  closing: [
    'You can read OFFSET and INDIRECT now, and you know why you won’t write them.',
    'Both recalculate on every keystroke, neither shows a reviewer where its number comes from, and one inserted row sent both to a blank. When you inherit them, rewrite them as INDEX/MATCH, or INDEX with a 0 for a whole column (E6).',
  ],
  solution: `Ctrl+G "Summary!N5:N10" Enter "${F.offset}" Ctrl+Enter Alt M P Alt M A A Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down ${q(F.indirect)} Ctrl+Enter `
    + 'Ctrl+G "Lists!B5" Enter Shift+Space Ctrl+Shift+= Ctrl+Z '
    + `Ctrl+G "Summary!N4" Enter "Capacity (INDEX/MATCH)" Enter Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "${F.index}" Ctrl+Enter Right Up Ctrl+Shift+Down Alt H E A `
    + `Ctrl+G "Summary!J18" Enter "${F.week}" Enter`,
};
