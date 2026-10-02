// Chapter 1 · 1.7.2 — The checks row (clearcoat-weekly, S7a → S7b)
// The Report is print-ready but nothing on it says whether it is right. A Checks block goes in
// under the week summary: three live differences that read zero when the page ties. The first
// compares the Report's revenue with the feed's own total, pointing across sheets while the formula
// is open; the second compares the six sites with the Total row; the third asks whether the margin
// is a plausible number at all. In the desk number format all three read 0, and Ctrl+[ follows
// the first check to the first figure it reads. The closer types a number over one revenue link
// and the check leaves zero.
import { CHECK_LINES, REPORT } from '../workbooks/clearcoat-weekly.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) < 1e-6;
const normFormula = f => String(f || '').replace(/\s|\$/g, '').toUpperCase();
const settled = ses => !ses.editing;

const HEAD = REPORT.checksRow;                     // 33: the Checks heading; the three lines sit on 34–36
const LINE = i => HEAD + 1 + i;
const LABELS = CHECK_LINES.map(l => l[0]);
const comma0 = c => c.fmtStyle === 'comma' && (c.decimals || 0) === 0;

/** Same words: a keyboard hyphen counts as a dash in 'Margin within 0-100%' (nobody can type an en dash). */
const sameText = (a, b) => String(a ?? '').replace(/[–—]/g, '-').trim() === String(b).replace(/[–—]/g, '-').trim();
/** A33 reads Checks in bold and A34:A36 carry the three labels as written. */
const labelsIn = rep => rep.value('A' + HEAD) === 'Checks' && rep.cellAt('A' + HEAD).bold === true
  && LABELS.every((label, i) => sameText(rep.value('A' + LINE(i)), label));
/** Check line i holds exactly its formula and reads zero: the two sides agree. */
const checkLine = (rep, i) => normFormula(rep.formula('B' + LINE(i))) === normFormula(CHECK_LINES[i][1]) && near(rep.value('B' + LINE(i)), 0);
const allChecks = rep => CHECK_LINES.every((_, i) => checkLine(rep, i));
const checksFormatted = rep => CHECK_LINES.every((_, i) => comma0(rep.cellAt('B' + LINE(i))));
/** The trail was followed this goal: Ctrl+[ (or Formulas › Trace Precedents, Alt M P) landed on the first figure the check reads, or F5 Enter brought the cursor back. */
const traced = ses => { const w = windowKeys(ses); const rep = report(ses); if (!rep) return false; const sel = rep.selectionText();
  return (w.includes('Ctrl+[') || /\bAlt M P\b/.test(w.join(' '))) && (/^D5\b/.test(sel) || sel === 'B' + LINE(0)); };

const LABEL_RUN = LABELS.map(l => `↓ "${l}" ↵`).join(' ');
const DESK_FORMAT = 'Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N ↓ ↓ ↵';

export default {
  id: 'the-checks-row',
  chapter: 'foundations',
  section: 'Present and audit',
  module: 'present-and-audit',
  workbook: 'clearcoat-weekly',
  state: { before: 'S7a', after: 'S7b' },
  title: 'The checks row',
  difficulty: 'medium',
  tags: ['checks', 'formulas', 'report'],
  access: 'free',
  minutes: 6,
  headline: '=',
  conventions: ['F1'],
  teaches: ['check-cell'],
  uses: ['sum-family', 'formula-basics', 'formula-operators', 'cross-sheet-ref', 'pointing', 'formula-errors', 'number-formats', 'format-cells-dialog', 'bold-italic-underline', 'type-to-enter', 'sheet-tabs', 'ctrl-arrow', 'ctrl-home-end', 'home-key', 'ctrl-shift-arrow', 'arrow-keys'],
  prerequisites: ['fit-to-one-page'],
  brief: 'The Report is ready to print, but nothing on it says whether it\'s right. The CFO wants a line for each thing that must agree before the page goes out, and so will every buyer after. A check is a live difference between two things that must agree: it reads zero when they tie and shows the gap when they don\'t. Three of them under the week summary make a checks row, the first thing a reviewer looks for on any page. The key is `=`.',
  wow: 'Three live differences read zero, so the page now proves itself.',
  goals: [
    { id: 'labels', text: 'Head a Checks block under the week summary: Checks in A33, bold, then the three check labels in A34:A36 as one Enter-and-↓ run.',
      teach: 'The labels are "Report revenue ties to the feed", "Sites sum to the total" and "Margin within 0-100%". A check has a name that says what it compares.',
      hintStuck: 'pulse cell A33 · A33, Ctrl+B, type, Enter, ↓; then each label.',
      keys: `Ctrl+End Home ↓ ×2 Ctrl+B "Checks" ↵ ${LABEL_RUN}`, requires: ['type-to-enter', 'bold-italic-underline', 'ctrl-home-end', 'home-key', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && labelsIn(rep) && settled(ses); } },
    { id: 'revenue-check', text: 'In B34, take the five linked sites\' revenue D5:D8 and D10 and subtract the feed\'s own total, pointing at Raw\'s J13 across sheets.',
      teach: '=SUM(D5:D8,D10)-Raw!J13: the sum of what the page shows, less what the feed says. Zero means the page and the feed agree. Cedar Park\'s typed row is left out because the feed doesn\'t carry it yet.',
      hintStuck: 'pulse cell B34 · B34, =SUM(D5:D8,D10)-, Alt+PgDn to Raw, point at J13, Enter.',
      keys: '↑ ×2 → "=SUM(D5:D8,D10)-" Ctrl+PgDn Ctrl+→ → ×2 Ctrl+↓ ×3 → ×2 ↵', requires: ['check-cell', 'sum-family', 'formula-operators', 'cross-sheet-ref', 'pointing', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'], convention: 'F1',
      check: (s, ses) => { const rep = report(ses); return !!rep && checkLine(rep, 0) && settled(ses); } },
    { id: 'sites-check', text: 'In B35, the six sites\' washes must sum to the Total row: enter =SUM(C5:C10)-C11, and it reads 0 while the total row is honest.',
      teach: 'A total that was typed over, or a row inserted below the block, shows up here as a non-zero, which is about as cheap as insurance gets.',
      hintStuck: 'pulse cell B35 · B35, type =SUM(C5:C10)-C11, Enter.',
      keys: '↓ "=SUM(C5:C10)-C11" ↵', requires: ['check-cell', 'sum-family', 'formula-operators', 'type-to-enter', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && checkLine(rep, 1) && settled(ses); } },
    { id: 'margin-check', text: 'In B36, a margin outside 0 to 100% is a mistake somewhere: enter =IF(AND(H11>=0,H11<=1),0,1), which reads 0 while the margin is plausible.',
      teach: 'IF and AND arrive properly in Chapter 3; here they make a plausibility check: a margin can\'t be negative or over 100%, so if it is, the check fires. Sanity checks catch what tie-outs miss.',
      hintStuck: 'pulse cell B36 · B36, type the formula exactly, Enter.',
      keys: '↓ "=IF(AND(H11>=0,H11<=1),0,1)" ↵', requires: ['check-cell', 'formula-basics', 'formula-operators', 'type-to-enter', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && checkLine(rep, 2) && settled(ses); } },
    { id: 'format', text: 'Give the three checks B34:B36 the desk number format, so all three read a plain 0 and a failing one would read in parentheses.',
      teach: 'Ctrl+1, Number, no decimals, the separator, (1,234): that\'s the desk number format from 1.5.1, and it matters here because a check can go negative, and then it reads (12), never -12. A checks row reads as a column of zeros, so anything else jumps out at you.',
      hintStuck: 'pulse cells B34:B36 · Select B34:B36; Ctrl+1; N, Tab, N; Decimal places 0; Use 1000 Separator; (1,234); Enter.',
      keys: `Ctrl+Shift+↑ ${DESK_FORMAT}`, requires: ['number-formats', 'format-cells-dialog', 'ctrl-shift-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && allChecks(rep) && checksFormatted(rep) && settled(ses); } },
    { id: 'trace', text: 'A reviewer will ask what the first check compares: from B34, Ctrl+[ follows the trail to D5, the first revenue figure it reads.',
      teach: 'Ctrl+[ on a check shows exactly which cells it compares, which answers "what does this check check?" in one press, and F5 then Enter brings you back to where you were.',
      hintStuck: 'pulse cell B34 · B34, Ctrl+[; F5, Enter.',
      keys: '↑ ×2 Ctrl+[', requires: ['formula-errors', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && allChecks(rep) && checksFormatted(rep) && traced(ses) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!D6" Enter "3000" Enter Ctrl+G "Report!B34" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Type a number over Mueller\'s revenue link in D6 and watch the revenue check in B34 leave zero, then Ctrl+Z.',
      teach: 'That\'s the checks row doing its job: a typed number where a link belonged, and the page says so before anyone else does. Undo puts the link back.',
      hintStuck: 'pulse cell B34 · D6, type 3000, Enter; read B34; Ctrl+Z.',
      requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'A33 reads Checks in bold with the three labels under it', check: (s, ses) => { const rep = report(ses); return !!rep && labelsIn(rep); } },
    { text: 'B34:B36 hold the three checks in the desk number format, and all read 0', check: (s, ses) => { const rep = report(ses); return !!rep && allChecks(rep) && checksFormatted(rep); } },
  ],
  closing: [
    'The checks row goes to zero when the page ties: one for each thing that must agree, so a broken link or a bad total shows as a number before anyone else sees it. That\'s the convention on every page in this course and every model on a desk.',
    'The revenue check reads the feed across sheets, and Ctrl+[ takes a reviewer straight to the first figure it compares.',
  ],
  solution: `Ctrl+End Home Down Down Ctrl+B "Checks" Enter ${LABELS.map(l => `Down "${l}" Enter`).join(' ')} Up Up Right "=SUM(D5:D8,D10)-" Ctrl+PgDn Ctrl+Right Right Right Ctrl+Down Ctrl+Down Ctrl+Down Right Right Enter Down "=SUM(C5:C10)-C11" Enter Down "=IF(AND(H11>=0,H11<=1),0,1)" Enter Ctrl+Shift+Up Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N Down Down Enter Up Up Ctrl+[`,
};
