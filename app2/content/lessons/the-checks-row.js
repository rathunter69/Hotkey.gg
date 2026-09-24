// Chapter 1 · 1.7.2 — The checks row (voltline-weekly, S7a → S7b)
// The Report is print-ready but nothing on it says whether it is right. A Checks block goes in
// under the week summary: three live differences that read zero when the page ties. The first
// compares the Report's revenue with the feed's own total, pointing across sheets while the formula
// is open; the second compares the six sites with the Total row; the third asks whether the margin
// is a plausible number at all. Formatted comma 0, all three read 0, and Ctrl+[ follows the first
// check to the first figure it reads. The closer types a number over one revenue link and the check leaves zero.
import { CHECK_LINES, REPORT } from '../workbooks/voltline-weekly.js';

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

/** A33 reads Checks in bold and A34:A36 carry the three labels as written. */
const labelsIn = rep => rep.value('A' + HEAD) === 'Checks' && rep.cellAt('A' + HEAD).bold === true
  && LABELS.every((label, i) => rep.value('A' + LINE(i)) === label);
/** Check line i holds exactly its formula and reads zero — the two sides agree. */
const checkLine = (rep, i) => normFormula(rep.formula('B' + LINE(i))) === normFormula(CHECK_LINES[i][1]) && near(rep.value('B' + LINE(i)), 0);
const allChecks = rep => CHECK_LINES.every((_, i) => checkLine(rep, i));
const checksFormatted = rep => CHECK_LINES.every((_, i) => comma0(rep.cellAt('B' + LINE(i))));
/** Ctrl+[ was pressed this goal: the trail from B34 to the first figure it reads. */
const traced = ses => windowKeys(ses).includes('Ctrl+[');

export default {
  id: 'the-checks-row',
  chapter: 'foundations',
  section: 'Present and audit',
  module: 'present-and-audit',
  workbook: 'voltline-weekly',
  state: { before: 'S7a', after: 'S7b' },
  title: 'The checks row',
  difficulty: 'medium',
  tags: ['checks', 'formulas', 'report'],
  access: 'free',
  minutes: 6,
  headline: '=',
  conventions: ['F1'],
  teaches: ['check-cell'],
  uses: ['sum-family', 'formula-basics', 'formula-operators', 'cross-sheet-ref', 'pointing', 'formula-errors', 'number-formats', 'bold-italic-underline', 'type-to-enter', 'sheet-tabs', 'ctrl-arrow', 'ctrl-home-end', 'home-key', 'shift-arrow', 'arrow-keys'],
  prerequisites: ['fit-to-one-page'],
  brief: 'The Report is ready to print, but nothing on it says whether it is right: the deal team wants a check for each thing that must agree before the page goes out. A check is a live difference between two figures, so it reads zero when they tie and shows the gap when they do not. The key is `=`.',
  goals: [
    { id: 'labels', text: 'Head a Checks block under the week summary: Checks in A33, bold, then the three check labels in A34:A36 as one Enter run.', keys: `Ctrl+End Home ↓ ×2 Ctrl+B "Checks" ↵ ${LABELS.map(l => `"${l}" ↵`).join(' ')}`, requires: ['type-to-enter', 'bold-italic-underline', 'ctrl-home-end', 'home-key', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && labelsIn(rep) && settled(ses); } },
    { id: 'revenue-check', teach: 'A check cell is a live difference between two things that must agree, so it reads 0 when they tie and shows the gap when they do not.', text: 'In B34, take the five linked sites’ revenue D5:D8 and D10 and subtract the feed’s own total, pointing at Raw’s J13 across sheets.', keys: 'Ctrl+↑ ↑ ×2 → "=SUM(D5:D8,D10)-" Ctrl+PgDn Ctrl+→ → ×2 Ctrl+↓ ×3 → ×2 ↵', requires: ['check-cell', 'sum-family', 'formula-operators', 'cross-sheet-ref', 'pointing', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'], convention: 'F1',
      check: (s, ses) => { const rep = report(ses); return !!rep && checkLine(rep, 0) && settled(ses); } },
    { id: 'sites-check', text: 'In B35, the six sites’ kWh must sum to the Total row: enter =SUM(C5:C10)-C11, and it reads 0 while the total row is honest.', keys: '"=SUM(C5:C10)-C11" ↵', requires: ['check-cell', 'sum-family', 'formula-operators', 'type-to-enter'],
      check: (s, ses) => { const rep = report(ses); return !!rep && checkLine(rep, 1) && settled(ses); } },
    { id: 'margin-check', text: 'In B36, a margin outside 0 to 100% is a mistake somewhere: enter =IF(AND(H11>=0,H11<=1),0,1), which reads 0 only while the margin is plausible.', keys: '"=IF(AND(H11>=0,H11<=1),0,1)" ↵', requires: ['check-cell', 'formula-basics', 'formula-operators', 'type-to-enter'],
      check: (s, ses) => { const rep = report(ses); return !!rep && checkLine(rep, 2) && settled(ses); } },
    { id: 'format', text: 'Give the three checks B34:B36 the figures’ format in one press, comma style with Ctrl+Shift+1, then Alt H 9 twice: all three read 0.', keys: '↑ ×3 Shift+↓ ×2 Ctrl+Shift+1 then Alt H 9 Alt H 9', requires: ['number-formats', 'shift-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && allChecks(rep) && checksFormatted(rep) && settled(ses); } },
    { id: 'trace', text: 'A reviewer will ask what the first check compares: from B34, Ctrl+[ follows the trail to D5, the first revenue figure it reads.', keys: 'Ctrl+[', requires: ['formula-errors'],
      check: (s, ses) => { const rep = report(ses); return !!rep && allChecks(rep) && checksFormatted(rep) && traced(ses) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!D6" Enter "3000" Enter Ctrl+G "Report!B34" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch a number typed over Mueller’s revenue link in D6 and the revenue check in B34 leave zero: the break is caught.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'A33 reads Checks in bold with the three labels under it', check: (s, ses) => { const rep = report(ses); return !!rep && labelsIn(rep); } },
    { text: 'B34:B36 hold the three checks, formatted comma 0, and all read 0', check: (s, ses) => { const rep = report(ses); return !!rep && allChecks(rep) && checksFormatted(rep); } },
  ],
  closing: [
    'The checks row goes to zero when the page ties: three live differences, one for each thing that must agree, so a broken link or a bad total shows as a number before anyone else sees it (F1).',
    'The revenue check reads the feed across sheets, and Ctrl+[ takes a reviewer straight to the first figure it compares.',
  ],
  solution: `Ctrl+End Home Down Down Ctrl+B "Checks" Enter ${LABELS.map(l => `"${l}" Enter`).join(' ')} Ctrl+Up Up Up Right "=SUM(D5:D8,D10)-" Ctrl+PgDn Ctrl+Right Right Right Ctrl+Down Ctrl+Down Ctrl+Down Right Right Enter "=SUM(C5:C10)-C11" Enter "=IF(AND(H11>=0,H11<=1),0,1)" Enter Up Up Up Shift+Down Shift+Down Ctrl+Shift+1 Alt H 9 Alt H 9 Ctrl+[`,
};
