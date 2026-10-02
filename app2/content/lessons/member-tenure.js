// Chapter 3 · 3.2.2 Member tenure from join and cancel dates (clearcoat-databook, S2a → S2b)
// On Members the end date chooses the as-of date in H2 when the cancel cell is blank (IF on ""),
// tenure is a subtraction in days and a division into months, status reads the blank, value to
// date is months times a blue fee in L2, and September churn is a 1/0 on the cancel date. Row 5 is
// built first; then the row is copied and pasted as formulas over the forty members so every
// cell keeps its own format (K5 carries the $), and the totals row sums value and churn. Graded
// on values and liveness. The closer cancels the first member and the churn count rises.
import { liveness } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const members = ses => sheetOf(ses, 'Members');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const same = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) < 1e-9 : a === b);
const at = (sh, ref) => sh.selectionText() === ref;
const on = (ses, name) => !!sheetOf(ses, name) && ses.sheet === sheetOf(ses, name);
const ALL = Array.from({ length: 40 }, (_, i) => 5 + i);
const blankF = (sh, r) => { const v = sh.value('F' + r); return v == null || v === ''; };
const SEP1 = 46266, SEP30 = 46295;   // 9/1/2026 and 9/30/2026
const WANT = {
  G: (sh, r) => (blankF(sh, r) ? sh.value('H2') : sh.value('F' + r)),
  H: (sh, r) => sh.value('G' + r) - sh.value('E' + r),
  I: (sh, r) => sh.value('H' + r) / 30.4,
  J: (sh, r) => (blankF(sh, r) ? 'Active' : 'Cancelled'),
  K: (sh, r) => sh.value('I' + r) * sh.value('L2'),
  L: (sh, r) => { const f = sh.value('F' + r); return !blankF(sh, r) && f >= SEP1 && f <= SEP30 ? 1 : 0; },
};
/** One cell right and live (row 5 is an active member, so the blank cancel is the input that moves it). */
const cellOk = (sh, col, r = 5) => same(sh.value(col + r), WANT[col](sh, r)) && liveness(sh, col + r).ok;
const feeOk = sh => sh.value('L2') === 30 && sh.cellAt('L2').fontColor === 'blue';
/** Churn on an active row reads 0 whatever the blank is nudged to, so its liveness is read on a row cancelled in September. */
const sepRows = sh => ALL.filter(r => WANT.L(sh, r) === 1);
const block = sh => ['G', 'H', 'I', 'J', 'K', 'L'].every(col => ALL.every(r => same(sh.value(col + r), WANT[col](sh, r))))
  && ['G', 'H', 'I', 'J', 'K'].every(col => [5, 44].every(r => liveness(sh, col + r).ok)) && sepRows(sh).some(r => liveness(sh, 'L' + r).ok);
const totals = sh => same(sh.value('K45'), ALL.reduce((t, r) => t + sh.value('K' + r), 0)) && same(sh.value('L45'), ALL.reduce((t, r) => t + sh.value('L' + r), 0)) && liveness(sh, 'K45').ok && liveness(sh, 'L45').ok;

export default {
  id: 'member-tenure',
  chapter: 'formulas',
  section: 'Dates',
  module: 'dates',
  workbook: 'clearcoat-databook',
  state: { before: 'S2a', after: 'S2b' },
  title: 'Member tenure from join and cancel dates',
  difficulty: 'medium',
  tags: ['formulas', 'dates', 'tenure', 'churn'],
  access: 'paid',
  minutes: 8,
  headline: 'IF',
  conventions: ['B1'],
  teaches: ['blank-test', 'paste-formulas', 'fill-to-bottom'],
  uses: ['date-serial', 'date-function', 'if-function', 'and-or-not', 'relative-absolute', 'formula-basics', 'tab-commits', 'copy-cut-paste', 'paste-special', 'go-to', 'font-color', 'input-colour-convention', 'arrow-keys', 'ctrl-arrow', 'shift-arrow', 'ctrl-shift-arrow'],
  prerequisites: ['date-serials'],
  brief: 'A member pays $30 a month until they cancel, so what a member is worth is the fee times tenure: the months from joining to cancelling, or to today if they’re still with us. The cancel column is blank for active members, and a blank subtracts as zero, so the formula has to choose the end date first. IF the cancel cell is blank, the as-of date, otherwise the cancel date. Then tenure in months, and the churn count for September. The key is `IF`.',
  goals: [
    { id: 'read-dates', text: 'Go to Members and select the Joined and Cancelled dates, E5:F44: forty members, and six of them have cancelled.', keys: 'Ctrl+G "Members!E5" ↵ Shift+→ Ctrl+Shift+↓', requires: ['go-to', 'shift-arrow', 'ctrl-shift-arrow'],
      hintStuck: 'pulse range Members!E5:F44 · Joined and Cancelled are the blue dates.',
      check: (s, ses) => { const sh = members(ses); return settled(ses) && on(ses, 'Members') && at(sh, 'E5:F44'); } },
    { id: 'end-date', teach: 'A blank cell equals "", the empty text, so F5="" asks whether a cancel date is missing. Never type a 0 into a date column to mean none: 0 is a date, January 0, 1900, and every subtraction from it is wrong.',
      text: 'The end date in G5 is =IF(F5="",$H$2,F5): the as-of date in H2 while the member is active, the cancel date once they leave.', keys: `→ ×2 '=IF(F5="",$H$2,F5)' Tab`, requires: ['blank-test', 'if-function', 'relative-absolute', 'tab-commits', 'arrow-keys'],
      hintStuck: 'pulse cell G5 · End date is right of Cancelled.',
      check: (s, ses) => { const sh = members(ses); return settled(ses) && !!sh && cellOk(sh, 'G'); } },
    { id: 'tenure', text: 'Tenure in H5 is =G5-E5 in days and in I5 =H5/30.4 in months, typed as a Tab run.', keys: '"=G5-E5" Tab "=H5/30.4" Tab', requires: ['date-serial', 'formula-basics', 'tab-commits'],
      hintStuck: 'pulse cell I5 · A month averages 30.4 days.',
      check: (s, ses) => { const sh = members(ses); return settled(ses) && !!sh && cellOk(sh, 'H') && cellOk(sh, 'I'); } },
    { id: 'status', text: `Status in J5 reads the same blank: =IF(F5="","Active","Cancelled").`, keys: `'=IF(F5="","Active","Cancelled")' Tab`, requires: ['blank-test', 'if-function', 'tab-commits'],
      hintStuck: 'pulse cell J5 · Status sits after Tenure (months).',
      check: (s, ses) => { const sh = members(ses); return settled(ses) && !!sh && cellOk(sh, 'J'); } },
    { id: 'fee', teach: 'The fee belongs to the plan, a lookup in Chapter 4. Until then it is one typed input, blue, and every value reads it through an anchor.',
      text: 'Value to date in K5 is =I5*$L$2; then type the fee, 30, into L2 and color it blue as an input with Alt H F C.', keys: '"=I5*$L$2" Tab ↑ ×3 "30" ↵ ↑ Alt H F C → ×4 ↵', requires: ['relative-absolute', 'font-color', 'input-colour-convention', 'tab-commits', 'arrow-keys'], convention: 'B1',
      hintStuck: 'pulse cell L2 · Fee ($/mo) sits above the churn column.',
      check: (s, ses) => { const sh = members(ses); return settled(ses) && !!sh && feeOk(sh) && cellOk(sh, 'K'); } },
    { id: 'churn', teach: 'COUNTIFS counts on a date window in one cell; it comes in 3.3.2. Until then a 1 or 0 per row, added up, does the same job.',
      text: 'Churn in L5 flags a cancel in September: =IF(AND(F5>=DATE(2026,9,1),F5<=DATE(2026,9,30)),1,0).', keys: '↓ ×3 "=IF(AND(F5>=DATE(2026,9,1),F5<=DATE(2026,9,30)),1,0)" ↵', requires: ['date-function', 'and-or-not', 'if-function', 'arrow-keys'],
      hintStuck: 'pulse cell L5 · M0001 is active, so its churn reads 0.',
      check: (s, ses) => { const sh = members(ses); return settled(ses) && !!sh && sh.cellAt('L5').formula != null && same(sh.value('L5'), WANT.L(sh, 5)); } },
    { id: 'fill', teach: 'Ctrl+D would copy K5’s $ format down the column. Paste Special, Formulas writes the formulas only, so every cell keeps its own format.',
      text: 'Copy G5:L5, select G5:L44 from its last row with Ctrl+Shift+↑, and paste formulas with Ctrl+Alt+V, F, Enter.', keys: '↑ Ctrl+Shift+← Ctrl+C Ctrl+G "G44" ↵ Shift+→ ×5 Ctrl+Shift+↑ Ctrl+Alt+V F ↵', requires: ['paste-formulas', 'fill-to-bottom', 'copy-cut-paste', 'paste-special', 'go-to', 'shift-arrow', 'ctrl-shift-arrow'],
      hintStuck: 'pulse range G5:L44 · Go To G44, widen to L, then climb to row 5.',
      check: (s, ses) => { const sh = members(ses); return settled(ses) && !!sh && block(sh); } },
    { id: 'totals', text: 'Total the value and the churn on row 45: K45 =SUM(K5:K44) and L45 =SUM(L5:L44), a Tab run; three members left in September.', keys: 'Ctrl+→ Ctrl+↓ ↓ ← "=SUM(K5:K44)" Tab "=SUM(L5:L44)" ↵', requires: ['sum-family', 'tab-commits', 'ctrl-arrow', 'arrow-keys'],
      hintStuck: 'pulse range K45:L45 · The Total row is under the last member.',
      check: (s, ses) => { const sh = members(ses); return settled(ses) && !!sh && totals(sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Members!F5" Enter "9/10/2026" Enter Ctrl+G "Members!L45" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch M0001 cancel on 9/10/2026: its tenure stops, its status flips and September churn in L45 rises to 4.', requires: [],
      hintStuck: 'pulse cell L45 · The cancel date now falls inside September.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Members G5:L44 give every member an end date, tenure, status, value to date and a September churn flag', check: (s, ses) => { const sh = members(ses); return !!sh && block(sh); } },
    { text: 'The fee in L2 is a blue 30 and row 45 totals the value and the churn', check: (s, ses) => { const sh = members(ses); return !!sh && feeOk(sh) && totals(sh); } },
  ],
  closing: [
    'Every member has a tenure now, and the page knows who left in September.',
    'The blank cancel date stays blank and the IF reads it, so nothing pretends a member left on January 0, 1900, and the fee is one blue input (B1) every value reads.',
  ],
  solution: `Ctrl+G "Members!E5" Enter Shift+Right Ctrl+Shift+Down Right Right '=IF(F5="",$H$2,F5)' Tab "=G5-E5" Tab "=H5/30.4" Tab '=IF(F5="","Active","Cancelled")' Tab "=I5*$L$2" Tab Up Up Up "30" Enter Up Alt H F C Right Right Right Right Enter Down Down Down "=IF(AND(F5>=DATE(2026,9,1),F5<=DATE(2026,9,30)),1,0)" Enter Up Ctrl+Shift+Left Ctrl+C Ctrl+G "G44" Enter Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+Shift+Up Ctrl+Alt+V F Enter Ctrl+Right Ctrl+Down Down Left "=SUM(K5:K44)" Tab "=SUM(L5:L44)" Enter`,
};
