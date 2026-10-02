// Chapter 4 · 4.1.7 Multi-criteria lookups: a key column, a two-condition MATCH, SUMIFS as a lookup (clearcoat-pack, S416 → S417)
// Sponsor B asks South Lamar's washes on Sep 19. A key column on Export joins site and date; the same
// key built from the two inputs on Summary; INDEX/MATCH on the key column; SUMIFS on the pair; the
// array MATCH, (sites=x)*(dates=y), beside the cube with no helper column. The closer moves the date.
import { summary, exportSheet, settled, calls, live, same, isNum } from './lib/pack-checks.js';
import { FMT } from '../workbooks/page.js';

const F = {
  key: '=B5&"|"&TEXT(A5,"yyyy-mm-dd")',
  cell: '=C41&"|"&TEXT(C42,"yyyy-mm-dd")',
  byKey: '=INDEX(Export!$E$5:$E$94,MATCH(C43,Export!$J$5:$J$94,0))',
  sumifs: '=SUMIFS(Export!$E$5:$E$94,Export!$B$5:$B$94,C41,Export!$A$5:$A$94,C42)',
  array: '=INDEX(Export!$E$5:$E$94,MATCH(1,(Export!$B$5:$B$94=C41)*(Export!$A$5:$A$94=C42),0))',
};
const q = f => `'${f}'`;
const COUNT = { fmtStyle: 'custom', numFmt: FMT.countDash, decimals: 0 };
const PLANT = {
  'Export!J4': { value: 'Key', bold: true },
  'Summary!B40': { value: 'Washes for a site on a day', bold: true },
  'Summary!B41': { value: 'Site code' }, 'Summary!C41': { value: 'AUS-SLA', fontColor: 'blue' },
  'Summary!B42': { value: 'Date' }, 'Summary!C42': { value: 46284, fontColor: 'blue', fmtStyle: 'custom', numFmt: 'd-mmm-yy' },
  'Summary!B43': { value: 'Key' },
  'Summary!B44': { value: 'Washes, by the key column' }, 'Summary!C44': { ...COUNT },
  'Summary!B45': { value: 'Washes, by SUMIFS' }, 'Summary!C45': { ...COUNT },
  'Summary!I20': { value: 'Washes, array MATCH', bold: true }, 'Summary!J20': { fmtStyle: 'custom', numFmt: FMT.countDash },
};
const iso = serial => (isNum(serial) ? new Date(Date.UTC(1899, 11, 30) + serial * 86400000).toISOString().slice(0, 10) : null);   // TEXT(date,"yyyy-mm-dd")
const ROWS = Array.from({ length: 90 }, (_, i) => 5 + i);
/** Total washes on Export for a site code on a date serial (null when no row matches). */
const washesOn = (ses, code, date) => { const ex = exportSheet(ses); if (!ex) return null; const r = ROWS.find(k => ex.value('B' + k) === code && ex.value('A' + k) === date); return r ? ex.value('E' + r) : '#N/A'; };
const keyColumn = ses => { const ex = exportSheet(ses); return !!ex && ROWS.every(r => calls(ex, 'J' + r, ['TEXT']) && ex.value('J' + r) === `${ex.value('B' + r)}|${iso(ex.value('A' + r))}`) && live(ex, 'J5'); };
const keyCell = sh => calls(sh, 'C43', ['TEXT']) && sh.value('C43') === `${sh.value('C41')}|${iso(sh.value('C42'))}` && live(sh, 'C43');
const want = (ses, sh) => washesOn(ses, sh.value('C41'), sh.value('C42'));
const byKey = (ses, sh) => calls(sh, 'C44', ['INDEX', 'MATCH']) && /\$?J\$?5/.test(sh.formula('C44')) && same(sh.value('C44'), want(ses, sh)) && live(sh, 'C44');
const bySumifs = (ses, sh) => calls(sh, 'C45', ['SUMIFS']) && same(sh.value('C45'), want(ses, sh)) && live(sh, 'C45');
const byArray = (ses, sh) => calls(sh, 'J20', ['INDEX', 'MATCH']) && !/\$?J\$?5/.test(sh.formula('J20')) && same(sh.value('J20'), want(ses, sh)) && live(sh, 'J20');

export default {
  id: 'multi-criteria-lookups',
  chapter: 'data-and-lookups',
  section: 'Lookups',
  module: 'lookups',
  workbook: 'clearcoat-pack',
  state: { before: 'S416', after: 'S417' },
  plant: PLANT,
  title: 'Multi-criteria lookups: a key column, a two-condition MATCH, SUMIFS as a lookup',
  difficulty: 'hard',
  tags: ['formulas', 'lookups'],
  access: 'paid',
  minutes: 7,
  headline: '&',
  conventions: ['E3', 'B4'],
  teaches: ['multi-criteria-lookup'],
  uses: ['index-match', 'sumif-sumifs', 'concatenate-amp', 'text-function', 'go-to', 'ctrl-enter-fill', 'cross-sheet-ref'],
  prerequisites: ['approximate-match-bands'],
  brief: 'Sponsor B wants the washes for one site on one day, and no single column of the export holds that key. Three ways, in the order the standard prefers: a key column that joins the two with & so a normal INDEX/MATCH works; SUMIFS as a lookup, when the answer is a number and the pair is unique; and the two-condition MATCH, which needs no helper column. Build all three on the export and read when each is the right one. The key is `&`.',
  wow: 'Three ways to look up on two conditions, and you know which one to write.',
  goals: [
    { id: 'key-column', teach: 'A key column joins the two conditions into one string, AUS-SLA|2026-09-19, so a single MATCH can find the row. TEXT writes the date one fixed way (3.4.1), because a date on its own joins as its serial number.',
      text: 'On Export, fill the key column J5:J94 with =B5&"|"&TEXT(A5,"yyyy-mm-dd"), site and date in one string.', keys: `Ctrl+G "Export!J5:J94" ↵ ${q(F.key)} Ctrl+↵`, requires: ['multi-criteria-lookup', 'concatenate-amp', 'text-function', 'go-to', 'ctrl-enter-fill'], convention: 'E3',
      hintStuck: 'pulse range J5:J94 on Export · One formula for all ninety rows, entered with Ctrl+Enter.',
      check: (s, ses) => settled(ses) && keyColumn(ses) },
    { id: 'key-cell', text: 'On Summary, build the same key in C43 from the site in C41 and the date in C42.', keys: `Ctrl+G "Summary!C43" ↵ ${q(F.cell)} ↵`, requires: ['concatenate-amp', 'text-function', 'go-to'],
      hintStuck: 'pulse cell C43 on Summary · The same pattern as the key column, on the two inputs.',
      check: (s, ses) => settled(ses) && keyCell(summary(ses)) },
    { id: 'by-key', text: 'Washes by the key column in C44: INDEX on Export’s washes, MATCH on the key in Export!$J$5:$J$94.', keys: `"${F.byKey}" ↵`, requires: ['multi-criteria-lookup', 'index-match'],
      hintStuck: 'pulse cell C44 · Total washes are Export!$E$5:$E$94; the key from C43 is what MATCH looks for.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && byKey(ses, sh); } },
    { id: 'sumifs', teach: 'When the answer is a number and only one row can match, SUMIFS on the two conditions adds up exactly that row, so it works as a lookup with no helper column. If the pair could repeat, it would add them together without a word.',
      text: 'Washes by SUMIFS in C45, on the site and the date: the pair is unique, so the sum is the one row.', keys: `"${F.sumifs}" ↵`, requires: ['multi-criteria-lookup', 'sumif-sumifs'],
      hintStuck: 'pulse cell C45 · Sum the washes where the site is C41 and the date is C42.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && bySumifs(ses, sh); } },
    { id: 'array', teach: 'Each comparison over the export returns a column of TRUE and FALSE, and multiplying the two makes 1 only where both hold, so MATCH(1, …, 0) finds the row with no key column. Best practice: a key column when the lookup returns text or must be audited by eye, SUMIFS when it returns a number, and the array MATCH when you can’t add a column, noted beside it as an array.',
      text: 'In J20, find it with no key column: =INDEX(Export!$E$5:$E$94,MATCH(1,(sites=C41)*(dates=C42),0)).', keys: `Ctrl+G "Summary!J20" ↵ "${F.array}" ↵`, requires: ['multi-criteria-lookup', 'index-match', 'go-to'],
      hintStuck: 'pulse cell J20 on Summary · Sites are Export!$B$5:$B$94, dates Export!$A$5:$A$94.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && byArray(ses, sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Summary!C42" Enter "9/20/2026" Enter Ctrl+G "Summary!C43:C45" Enter', cadence: 320 },
      text: 'Does it tie? Watch the date in C42 move to Sep 20 and all three answers move together.', requires: [],
      hintStuck: 'pulse range C43:C45 on Summary · All three read the same two inputs.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The key column on Export and the three routes on Summary agree on the washes for the site and date asked', check: (s, ses) => { const sh = summary(ses); return keyColumn(ses) && keyCell(sh) && byKey(ses, sh) && bySumifs(ses, sh) && byArray(ses, sh); } },
  ],
  closing: [
    'Three ways to look up on two conditions, and you know which one to write.',
    'The key column is the one a reviewer can read row by row; SUMIFS is the shortest when the answer is a number; the array MATCH is for a file you can’t add a column to. Sponsor B’s question gets its answer in the log in module 4.3.',
  ],
  solution: `Ctrl+G "Export!J5:J94" Enter ${q(F.key)} Ctrl+Enter Ctrl+G "Summary!C43" Enter ${q(F.cell)} Enter "${F.byKey}" Enter "${F.sumifs}" Enter Ctrl+G "Summary!J20" Enter "${F.array}" Enter`,
};
