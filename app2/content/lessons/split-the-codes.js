// Chapter 3 · 3.4.1 LEN, LEFT, RIGHT and MID: split the codes (clearcoat-databook, S3f → S4a)
// On Transactions the learner counts every code's characters with LEN (R), which gives away the two
// codes with a trailing space (8, not 7); takes the cluster with LEFT (S) and the site with RIGHT (T),
// where the trailing space turns DOM into "OM "; wraps TRIM inside the RIGHT so the formula survives
// a dirty export; then fixes the two codes at the source, and the checks on Summary that read (2)
// since 3.3.2 come back to zero. The closer turns a code into SAT-ALA and the three columns follow.
import { transactions, summary, settled, selected, onSheet, block, calls, live } from './lib/databook-checks.js';

const R1 = 5, R2 = 94;
const code = (sh, r) => sh.value('B' + r);
const str = v => (typeof v === 'string' ? v : v == null ? '' : String(v));
const lens = sh => block(sh, 'R', R1, R2, { fns: ['LEN'], want: r => str(code(sh, r)).length });
const cluster = sh => block(sh, 'S', R1, R2, { fns: ['LEFT'], want: r => str(code(sh, r)).slice(0, 3) });
/** RIGHT(B,3) on every row, read raw or through TRIM (a learner who wraps TRIM straight away has the site right too). */
const sites = sh => {
  if (!sh) return false;
  for (let r = R1; r <= R2; r++) {
    if (!calls(sh, 'T' + r, ['RIGHT'])) return false;
    const v = sh.value('T' + r), b = str(code(sh, r));
    if (v !== b.slice(-3) && v !== b.trim().slice(-3)) return false;
  }
  return live(sh, 'T' + R1);
};
const trimmed = sh => block(sh, 'T', R1, R2, { fns: ['RIGHT', 'TRIM'], want: r => str(code(sh, r)).trim().replace(/\s+/g, ' ').slice(-3) });
/** Every code in the export is a clean cluster-site pair: no stray space before or after. */
const clean = sh => { if (!sh) return false; for (let r = R1; r <= R2; r++) if (!/^[A-Z]{3}-[A-Z]{3}$/.test(str(code(sh, r)))) return false; return true; };

export default {
  id: 'split-the-codes',
  chapter: 'formulas',
  section: 'Text',
  module: 'text',
  workbook: 'clearcoat-databook',
  state: { before: 'S3f', after: 'S4a' },
  title: 'LEN, LEFT, RIGHT and MID: split the codes',
  difficulty: 'medium',
  tags: ['formulas', 'functions', 'text'],
  access: 'paid',
  minutes: 5,
  headline: 'LEFT',
  conventions: ['F1', 'F5'],
  teaches: ['left-right-mid-len'],
  uses: ['go-to', 'ctrl-enter-fill', 'type-to-enter', 'cross-sheet-ref', 'check-cell'],
  prerequisites: ['the-reconciliation'],
  brief: 'A site code is two facts in one cell: AUS-DOM is the cluster and the site. LEFT takes characters from the start, RIGHT from the end, MID from a position, and LEN counts them, so the cluster is LEFT(B5,3) and the site is RIGHT(B5,3). Split the codes into their own columns on Transactions, so the cluster can be counted on, and let LEN find the two codes that have been hiding a space since the counts. The key is `LEFT`.',
  goals: [
    { id: 'len', teach: 'LEN(text) counts the characters, spaces included, so every clean code reads 7. LEFT(text, n) and RIGHT(text, n) take n characters from the start or the end, and MID(text, start, n) takes n from a position: MID(F5,6,1) is the package letter in “Wash D @ …”.', text: 'On Transactions, select R5:R94, type =LEN(B5) and press Ctrl+Enter: two codes read 8.', keys: 'Ctrl+G "Transactions!R5:R94" ↵ "=LEN(B5)" Ctrl+↵', requires: ['left-right-mid-len', 'go-to', 'ctrl-enter-fill'],
      hintStuck: 'pulse range R5:R94 · The codes sit in column B, from row 5 to row 94.',
      check: (s, ses) => { const sh = transactions(ses); return settled(ses) && lens(sh); } },
    { id: 'cluster', text: 'The cluster in S5:S94: =LEFT(B5,3) with Ctrl+Enter.', keys: 'Ctrl+G "S5:S94" ↵ "=LEFT(B5,3)" Ctrl+↵', requires: ['left-right-mid-len', 'go-to', 'ctrl-enter-fill'],
      hintStuck: 'pulse range S5:S94 · The cluster is the first three letters, before the hyphen.',
      check: (s, ses) => { const sh = transactions(ses); return settled(ses) && cluster(sh); } },
    { id: 'site', text: 'The site in T5:T94: =RIGHT(B5,3) with Ctrl+Enter, then read T25, where the trailing space leaves "OM ".', keys: 'Ctrl+G "T5:T94" ↵ "=RIGHT(B5,3)" Ctrl+↵', requires: ['left-right-mid-len', 'go-to', 'ctrl-enter-fill'],
      hintStuck: 'pulse range T5:T94 · The site is the last three letters, after the hyphen.',
      check: (s, ses) => { const sh = transactions(ses); return settled(ses) && sites(sh); } },
    { id: 'trim', teach: 'TRIM strips the spaces before and after a text, so RIGHT(TRIM(B5),3) reads DOM whether or not the export sent the space. Wrap the cleaning inside the formula and it survives the next dirty export.', text: 'Rewrite T5:T94 as =RIGHT(TRIM(B5),3) with Ctrl+Enter, so the trailing space can’t cut the site.', keys: '"=RIGHT(TRIM(B5),3)" Ctrl+↵', requires: ['left-right-mid-len', 'ctrl-enter-fill'],
      hintStuck: 'pulse cell T25 · TRIM goes inside the RIGHT, around B5.',
      check: (s, ses) => { const sh = transactions(ses); return settled(ses) && trimmed(sh); } },
    { id: 'fix', teach: 'TRIM protects this column, but COUNTIF on Summary still reads the raw code, and "AUS-DOM " is not AUS-DOM to a criteria. Fix the data at its source and every formula that reads it agrees.', text: 'Retype the two dirty codes without the space: AUS-DOM in B25 and AUS-MUE in B66.', keys: 'Ctrl+G "B25" ↵ "AUS-DOM" ↵ Ctrl+G "B66" ↵ "AUS-MUE" ↵', requires: ['go-to', 'type-to-enter'],
      hintStuck: 'pulse range R25:R66 · LEN reads 8 on the two rows that need it.',
      check: (s, ses) => { const sh = transactions(ses); return settled(ses) && clean(sh); } },
    { id: 'checks', text: 'Read the checks on Summary in C80:C83: the two count checks are back to zero, and the reconciliation now reads (2).', keys: 'Ctrl+G "Summary!C80:C83" ↵', requires: ['go-to', 'check-cell'], convention: 'F1',
      hintStuck: 'pulse range C80:C83 · Two washes joined the POS counts; the managers never had them.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && onSheet(ses, 'Summary') && selected(sh, 'C80:C83'); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Transactions!B5" Enter "SAT-ALA" Enter Ctrl+G "Transactions!R5:T5" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch the code in B5 change to SAT-ALA, and its length, cluster and site in R5:T5 split it again.', requires: [],
      hintStuck: 'pulse range R5:T5 · All three read the code in B5.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'R5:S94 count every code and take its cluster with LEN and LEFT', check: (s, ses) => { const sh = transactions(ses); return lens(sh) && cluster(sh); } },
    { text: 'T5:T94 take the site with RIGHT around TRIM', check: (s, ses) => trimmed(transactions(ses)) },
    { text: 'Every code in B5:B94 is clean, with no trailing space', check: (s, ses) => clean(transactions(ses)) },
  ],
  closing: [
    'One code became two columns, and the trailing spaces gave themselves away.',
    'LEN found what no eye could, LEFT and RIGHT split the code, and TRIM inside the formula means the next dirty export cannot break it. The reconciliation moved because two washes the managers never counted are on the POS now, and two lessons on they get their line in the reconciliation. Best practice: clean inside the formula when the export refreshes, and fix the source when it is yours to fix.',
  ],
  solution: 'Ctrl+G "Transactions!R5:R94" Enter "=LEN(B5)" Ctrl+Enter Ctrl+G "S5:S94" Enter "=LEFT(B5,3)" Ctrl+Enter Ctrl+G "T5:T94" Enter "=RIGHT(B5,3)" Ctrl+Enter '
    + '"=RIGHT(TRIM(B5),3)" Ctrl+Enter Ctrl+G "B25" Enter "AUS-DOM" Enter Ctrl+G "B66" Enter "AUS-MUE" Enter Ctrl+G "Summary!C80:C83" Enter',
};
