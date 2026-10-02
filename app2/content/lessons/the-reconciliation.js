// Chapter 3 · 3.3.6 The reconciliation: POS against the managers' numbers (clearcoat-databook, S3e → S3f)
// The reconciliation block on Summary, rows 51 to 57: the POS washes linked from the site block,
// the managers' tallies typed from their weekly emails in blue, the difference, an explanation in
// words and an adjustment for each site that differs (Riverside counted a re-wash twice, Airport
// tallied Sep 30), the adjusted figure, a check per site, the totals and the Reconciliation line in
// the checks block. The closer moves an adjustment and the check leaves zero, then comes back.
import { summary, settled, block, near, isNum, live, totalOf, liveValue } from './lib/databook-checks.js';
import { MAP } from '../workbooks/clearcoat-databook.js';

const R1 = 51, R2 = 56, TOTAL = 57;
const TALLY = MAP.tally;
const EXPLAIN = { 53: 'Re-wash counted twice, 9/22', 55: 'Sep 30 tallied, a day the POS rows do not cover' };
const blue = (sh, ref) => sh.cellAt(ref).fontColor === 'blue';
const typed = (sh, ref) => { const c = sh.cellAt(ref); return !c.formula && c.value != null && c.value !== ''; };
const pos = sh => block(sh, 'C', R1, R2, { want: r => sh.value('C' + (r - 36)) });
const tallies = sh => !!sh && TALLY.every((t, i) => typed(sh, 'D' + (R1 + i)) && sh.value('D' + (R1 + i)) === t && blue(sh, 'D' + (R1 + i)));
const diff = sh => block(sh, 'E', R1, R2, { want: r => sh.value('D' + r) - sh.value('C' + r) });
const explained = sh => !!sh && [53, 55].every(r => typed(sh, 'F' + r) && String(sh.value('F' + r)).trim().length >= 5);
/** Every site that differs carries a typed adjustment that brings the tally to the POS; the rest carry none. Inputs and their words are blue. */
const adjusted = sh => !!sh && [R1, R1 + 1, R1 + 2, R1 + 3, R1 + 4, R2].every(r => {
  const d = sh.value('D' + r) - sh.value('C' + r);
  if (!d) return sh.value('G' + r) == null || sh.value('G' + r) === 0;
  return typed(sh, 'G' + r) && near(sh.value('G' + r), -d) && blue(sh, 'G' + r) && blue(sh, 'F' + r);
});
const adjustedCols = sh => block(sh, 'H', R1, R2, { want: r => sh.value('D' + r) + (isNum(sh.value('G' + r)) ? sh.value('G' + r) : 0) }) && block(sh, 'I', R1, R2, { want: r => sh.value('H' + r) - sh.value('C' + r) });
const totals = sh => !!sh && ['C', 'D', 'E', 'G', 'H', 'I'].every(col => totalOf(sh, col, R1, R2, TOTAL));
const rollup = sh => !!sh && liveValue(sh, 'C83', sh.value('I57'));
const SEL5 = 'Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down', SEL6 = SEL5 + ' Shift+Down';
const BLUE = 'Alt H F C Right Right Right Right Enter';

export default {
  id: 'the-reconciliation',
  chapter: 'formulas',
  section: 'Math and aggregation',
  module: 'math-and-aggregation',
  workbook: 'clearcoat-databook',
  state: { before: 'S3e', after: 'S3f' },
  title: 'The reconciliation: POS against the managers’ numbers',
  difficulty: 'hard',
  tags: ['formulas', 'reconciliation', 'checks'],
  access: 'paid',
  minutes: 7,
  headline: '=',
  conventions: ['F1', 'F2', 'B1', 'B6', 'E5'],
  teaches: ['reconciliation'],
  uses: ['go-to', 'ctrl-enter-fill', 'shift-arrow', 'ctrl-arrow', 'type-to-enter', 'font-color', 'input-colour-convention', 'f4-repeat', 'autosum', 'check-cell', 'keytips'],
  prerequisites: ['sumproduct-blended-ticket'],
  brief: 'A reconciliation is two counts of the same thing from two sources, with the difference explained line by line until it reaches zero. The managers’ weekly tallies came in by email; the POS counts are the ones you built from the export. They won’t agree, because a manager counted a re-wash and another tallied a day the export doesn’t cover, and the databook shows each difference and what explains it. Build the block and drive the check to zero. The key is `=`.',
  goals: [
    { id: 'pos', teach: 'A reconciliation sets two sources side by side: the POS export, which recorded every wash, and the managers’ tallies, which were typed by hand. The POS is the truth, so it goes first, as a link to the counts you already built.', text: 'Link the POS washes into C51:C56: select the block, type =C15 and press Ctrl+Enter.', keys: 'Ctrl+G "C51:C56" ↵ "=C15" Ctrl+↵', requires: ['reconciliation', 'go-to', 'ctrl-enter-fill'],
      hintStuck: 'pulse range C51:C56 · The site block’s washes sit in C15:C20.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && pos(sh); } },
    { id: 'tallies', text: `Type the managers’ tallies into D51:D56 (${TALLY.join(', ')}) and color them blue: they came in by email.`, keys: `→ ${TALLY.map(t => `"${t}" ↵`).join(' ')} ↑ Shift+↑ ×5 Alt H F C → ×4 ↵`, requires: ['type-to-enter', 'font-color', 'input-colour-convention', 'shift-arrow'], convention: 'B1',
      hintStuck: 'pulse range D51:D56 · Blue says a number was typed, not calculated.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && tallies(sh); } },
    { id: 'difference', text: 'The difference in E51:E56: managers less POS, =D51-C51 with Ctrl+Enter.', keys: '→ Ctrl+↑ ↓ Shift+↓ ×5 "=D51-C51" Ctrl+↵', requires: ['ctrl-enter-fill', 'ctrl-arrow', 'shift-arrow'],
      hintStuck: 'pulse range E51:E56 · Riverside and Airport come out high.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && diff(sh); } },
    { id: 'explain', teach: 'Every difference gets its reason in words beside it, typed where a reader will see it. Riverside’s manager counted a re-wash twice on 9/22; Airport’s tallied Sep 30, a day the export does not cover.', text: `Type the reasons in F53 and F55: ${EXPLAIN[53]}; and ${EXPLAIN[55]}.`, keys: `→ ↓ ↓ "${EXPLAIN[53]}" ↵ ↓ "${EXPLAIN[55]}" ↵`, requires: ['type-to-enter'], convention: 'B6',
      hintStuck: 'pulse range F53:F55 · Two sites differ, so two reasons.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && explained(sh); } },
    { id: 'adjust', teach: 'The adjustment brings the managers’ number to the POS, never the other way: Riverside’s is -1 and Airport’s -2. Adjustments and their reasons are typed, so they are blue, and F4 repeats the color on each.', text: 'Type the adjustments, -1 in G53 and -2 in G55, then color G53, F53, F55 and G55 blue with Font Color and F4.', keys: `↑ → "-2" ↵ ↑ ×3 "-1" Ctrl+↵ Alt H F C → ×4 ↵ ← F4 ↓ ↓ F4 → F4`, requires: ['font-color', 'f4-repeat', 'input-colour-convention', 'type-to-enter'], convention: 'B1',
      hintStuck: 'pulse range G53:G55 · The adjustment is the difference with its sign turned over.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && adjusted(sh); } },
    { id: 'adjusted', text: 'Adjusted in H51:H56 =D51+G51, then the check in I51:I56 =H51-C51, each with Ctrl+Enter.', keys: '→ Ctrl+↑ ↓ Shift+↓ ×5 "=D51+G51" Ctrl+↵ → Shift+↓ ×5 "=H51-C51" Ctrl+↵', requires: ['ctrl-enter-fill', 'check-cell', 'ctrl-arrow', 'shift-arrow'], convention: 'F1',
      hintStuck: 'pulse range H51:I56 · Every row of the check should read a dash.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && adjustedCols(sh); } },
    { id: 'totals', text: 'Total the block with Alt+= on G51:I57 and on C51:E57, leaving the reasons in F out of it.', keys: '← ×2 Shift+↓ ×6 Shift+→ ×2 Alt+= Ctrl+← ← ×2 Shift+↓ ×6 Shift+→ ×2 Alt+=', requires: ['autosum', 'ctrl-arrow', 'shift-arrow'], convention: 'E5',
      hintStuck: 'pulse range C57:I57 · Text has no total, so AutoSum the two number blocks.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && totals(sh); } },
    { id: 'rollup', text: 'Put the reconciliation into the checks block: C83 =I57.', keys: 'Ctrl+G "C83" ↵ "=I57" ↵', requires: ['check-cell', 'go-to', 'type-to-enter'], convention: 'F1',
      hintStuck: 'pulse cell C83 · The label Reconciliation already sits in B83.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && rollup(sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Summary!G53" Enter "0" Enter Ctrl+G "Summary!I53" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Riverside’s adjustment in G53 go to 0, and its check in I53 leave zero until the adjustment comes back.', requires: [],
      hintStuck: 'pulse cell I53 · An unexplained difference is what the check is there to catch.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C51:E56 hold the POS washes, the managers’ tallies in blue and the difference', check: (s, ses) => { const sh = summary(ses); return pos(sh) && tallies(sh) && diff(sh); } },
    { text: 'Every difference has a reason and an adjustment, and the check in I51:I56 reads zero', check: (s, ses) => { const sh = summary(ses); return explained(sh) && adjusted(sh) && adjustedCols(sh) && [51, 52, 53, 54, 55, 56].every(r => near(sh.value('I' + r), 0)); } },
    { text: 'The block is totalled and C83 carries the reconciliation into the checks', check: (s, ses) => { const sh = summary(ses); return totals(sh) && rollup(sh); } },
  ],
  closing: [
    'Two counts of the same thing agree now, every difference is explained, and the check reads zero.',
    'The POS is the truth; the managers’ number is adjusted to it, never the other way, and every adjustment says why in words. The same three columns (the reported figure, each adjustment explained, the adjusted figure) are how a buyer’s diligence team restates EBITDA for one-time items, and buyers price off the adjusted number.',
  ],
  solution: `Ctrl+G "C51:C56" Enter "=C15" Ctrl+Enter Right ${TALLY.map(t => `"${t}" Enter`).join(' ')} Up Shift+Up Shift+Up Shift+Up Shift+Up Shift+Up ${BLUE} `
    + `Right Ctrl+Up Down ${SEL5} "=D51-C51" Ctrl+Enter `
    + `Right Down Down "${EXPLAIN[53]}" Enter Down "${EXPLAIN[55]}" Enter `
    + `Up Right "-2" Enter Up Up Up "-1" Ctrl+Enter ${BLUE} Left F4 Down Down F4 Right F4 `
    + `Right Ctrl+Up Down ${SEL5} "=D51+G51" Ctrl+Enter Right ${SEL5} "=H51-C51" Ctrl+Enter `
    + `Left Left ${SEL6} Shift+Right Shift+Right Alt+= Ctrl+Left Left Left ${SEL6} Shift+Right Shift+Right Alt+= `
    + 'Ctrl+G "C83" Enter "=I57" Enter',
};
