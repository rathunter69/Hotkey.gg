// Chapter 4 · 4.2.3 Remove Duplicates and the unique site list (clearcoat-pack, S422 → S423)
// The export's Site column copied to Lists, Remove Duplicates on the copy: seven codes, one of them
// the misspelling AUS-DMO. Ctrl+F finds it on Export and it is fixed, the stray code comes off the
// list, and a COUNTIF beside each code proves the six cover all ninety rows, with a check under the
// lists. The closer types a new code into the export and the proof falls short by one.
import { lists, exportSheet, rowsOf, sameText, calls, live, isNum, settled, shellOf, refsIn } from './lib/pack-checks.js';

const CODES = ['AUS-DOM', 'AUS-MUE', 'AUS-RIV', 'AUS-SLA', 'AUS-AIR', 'AUS-CED'];
const PROOF = ['O4', ...refsIn('O5:O11'), 'B25', 'B26', 'C26'];
const F = { countif: '=COUNTIF(Export!$B$5:$B$94,N5)', check: '=O11-COUNTA(Export!$B$5:$B$94)' };
const listed = sh => { const out = []; for (let r = 5; r <= 94; r++) { const v = sh.value('N' + r); if (v == null || v === '') break; out.push(v); } return out; };
/** The Site column sits on Lists from N4: the header and the export's ninety codes, in the export's order. */
const pasted = ses => { const l = lists(ses), ex = exportSheet(ses); return !!l && sameText(l.value('N4'), 'Site') && rowsOf(ex).every(x => sameText(l.value('N' + x.r), x.site)); };
/** Remove Duplicates has run: each code once, the first of each kept, nothing below. */
const deduped = ses => { const l = lists(ses); const v = listed(l); return v.length >= 6 && v.length <= 7 && new Set(v.map(x => String(x).toUpperCase())).size === v.length && (l.value('N' + (5 + v.length)) == null || l.value('N' + (5 + v.length)) === ''); };
const sevenWithTypo = ses => deduped(ses) && listed(lists(ses)).length === 7 && listed(lists(ses)).some(x => sameText(x, 'AUS-DMO'));
const fixed = ses => rowsOf(exportSheet(ses)).every(x => !sameText(x.site, 'AUS-DMO')) && sameText(exportSheet(ses).value('B59'), 'AUS-DOM');
const six = ses => { const v = listed(lists(ses)); return v.length === 6 && CODES.every(c => v.some(x => sameText(x, c))); };
const count = (ses, code) => rowsOf(exportSheet(ses)).filter(x => sameText(x.site, code)).length;
const proof = ses => { const l = lists(ses); return [5, 6, 7, 8, 9, 10].every(r => calls(l, 'O' + r, ['COUNTIF']) && l.value('O' + r) === count(ses, l.value('N' + r))) && live(l, 'O5'); };
const tied = ses => { const l = lists(ses); return calls(l, 'O11', ['SUM']) && l.value('O11') === 90 && calls(l, 'C26', ['COUNTA']) && l.value('C26') === 0 && live(l, 'C26') && /O11/.test(l.formula('C26') || ''); };

export default {
  id: 'remove-duplicates',
  chapter: 'data-and-lookups',
  section: 'Lists and tables',
  module: 'lists-and-tables',
  workbook: 'clearcoat-pack',
  state: { before: 'S422', after: 'S423' },
  plant: shellOf('S423', { Lists: PROOF }, { keepText: true }),
  title: 'Remove Duplicates and the unique site list',
  difficulty: 'medium',
  tags: ['data', 'lists', 'duplicates'],
  access: 'paid',
  minutes: 5,
  headline: 'Alt A M',
  conventions: ['F1', 'F5'],
  teaches: ['remove-duplicates'],
  uses: ['go-to', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'copy-cut-paste', 'page-keys', 'find-replace', 'delete-clears', 'countif-countifs', 'ctrl-enter-fill', 'autosum', 'counta', 'cross-sheet-ref', 'relative-absolute', 'type-to-enter', 'keytips'],
  prerequisites: ['autofilter-subtotal'],
  brief: 'A clean list of sites is the spine of every summary, and the export has each site fifteen times. Remove Duplicates (Alt, A, M) keeps the first of each and deletes the rest, so it runs on a copy of the column, never on the export. Then COUNTIF against the original proves the list is complete, and the misspelled code the export carries shows up as a seventh site. The key is `Alt A M`.',
  goals: [
    { id: 'copy', text: 'Copy the export’s Site column, Export!B4:B94, and paste it on Lists at N4.', keys: 'Ctrl+G "Export!B4" ↵ Ctrl+Shift+↓ Ctrl+C Ctrl+G "Lists!N4" ↵ Ctrl+V', requires: ['go-to', 'ctrl-shift-arrow', 'copy-cut-paste'],
      hintStuck: 'pulse cell Lists!N4 · Copy the header with the codes, so the list keeps its name.',
      check: (s, ses) => pasted(ses) },
    { id: 'dedupe', teach: 'Remove Duplicates (Alt, A, M) keeps the first row of each value and deletes the rest, then tells you how many went. The ticked columns define a duplicate: tick two and a row goes only when the pair repeats.', text: 'With the pasted column selected, Alt, A, M and Enter: read the seven codes left, one of them AUS-DMO.', keys: 'Alt A M ↵', requires: ['remove-duplicates', 'keytips'], convention: 'F5',
      hintStuck: 'pulse range N4:N94 · The dialog works on the selection; Enter is OK.',
      check: (s, ses) => settled(ses) && sevenWithTypo(ses) },
    { id: 'fix', text: 'On Export, Ctrl+F finds AUS-DMO; press Esc and type AUS-DOM over it.', keys: 'Ctrl+PgDn ×2 Ctrl+F "AUS-DMO" ↵ Esc "AUS-DOM" ↵', requires: ['page-keys', 'find-replace'],
      hintStuck: 'pulse cell Export!B59 · Find searches the sheet you are on, so go to Export first.',
      check: (s, ses) => settled(ses) && fixed(ses) },
    { id: 'six', text: 'Back on Lists, the typo no longer exists in the export: clear AUS-DMO from the list, leaving six codes.', keys: 'Ctrl+PgUp ×2 Ctrl+↓ Delete', requires: ['page-keys', 'ctrl-arrow', 'delete-clears'],
      hintStuck: 'pulse cell N11 · Ctrl+Down runs to the last code in the list.',
      check: (s, ses) => settled(ses) && fixed(ses) && six(ses) },
    { id: 'proof', text: 'Beside each code, O5:O10, count its rows on the export: =COUNTIF(Export!$B$5:$B$94,N5) with Ctrl+Enter.', keys: `Ctrl+↑ ×2 → ↓ Shift+↓ ×5 "${F.countif}" Ctrl+↵`, requires: ['countif-countifs', 'relative-absolute', 'cross-sheet-ref', 'ctrl-arrow', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range O5:O10 · Anchor the export’s column so every code counts the same ninety rows.',
      check: (s, ses) => settled(ses) && six(ses) && proof(ses) },
    { id: 'tie-out', text: 'Total the counts in O11 with Alt+=, and in C26 check them against the export: =O11-COUNTA(Export!$B$5:$B$94).', keys: `Ctrl+↓ ↓ Alt+= ↵ Ctrl+G "C26" ↵ "${F.check}" ↵`, requires: ['autosum', 'counta', 'go-to', 'type-to-enter'], convention: 'F1',
      hintStuck: 'pulse cell C26 · Ninety rows on the export, ninety counted: the check reads a dash.',
      check: (s, ses) => settled(ses) && six(ses) && proof(ses) && tied(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Export!B5" Enter "AUS-NEW" Enter Ctrl+G "Lists!C26" Enter Escape', cadence: 320 }, text: 'Does it tie? Watch a new code typed into the export leave the COUNTIF proof one short, and the check in C26 say so.', requires: [],
      hintStuck: 'pulse cell C26 · A code that is not on the list is a row nobody counts.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The export carries no AUS-DMO', check: (s, ses) => fixed(ses) },
    { text: 'Lists N5:N10 hold the six site codes, each with its COUNTIF beside it', check: (s, ses) => six(ses) && proof(ses) },
    { text: 'O11 totals ninety and the check in C26 reads zero', check: (s, ses) => tied(ses) },
  ],
  closing: [
    'Six sites made one list, and the seventh was a typo.',
    'Best practice: a unique list is data, so it lives on Lists, proved by a check, and the cube and the drop-downs read it from there. Remove Duplicates only ever runs on a copy: it deletes, and the export is the one thing in the pack nobody types over.',
  ],
  solution: `Ctrl+G "Export!B4" Enter Ctrl+Shift+Down Ctrl+C Ctrl+G "Lists!N4" Enter Ctrl+V Alt A M Enter `
    + 'Ctrl+PgDn Ctrl+PgDn Ctrl+F "AUS-DMO" Enter Escape "AUS-DOM" Enter Ctrl+PgUp Ctrl+PgUp Ctrl+Down Delete '
    + `Ctrl+Up Ctrl+Up Right Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "${F.countif}" Ctrl+Enter Ctrl+Down Down Alt+= Enter Ctrl+G "C26" Enter "${F.check}" Enter`,
};
