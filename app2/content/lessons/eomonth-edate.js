// Chapter 2 · 2.6.2 EOMONTH and EDATE for period ends (clearcoat-pnl, S6a → S6b)
// A timeline is a chain. Monthly's first month end stays typed in C4 (now blue, the one input)
// and D4:N4 chain from it with =EOMONTH(C4,1) filled right; the P&L's first year end reads
// Inputs!B6 (green) and D4, E4 add twelve months each (typed one by one, so the A/E divider and
// the estimate code stay where they are). Inputs!B18 dates the next update with EDATE, three
// months after the as-of date, in m/d/yyyy. The closer moves the first year end on Inputs.
import { MONTH_ENDS, YEAR_ENDS, EXPORT } from '../workbooks/clearcoat-pnl.js';
import { dateToSerial, serialToDate } from '../../engine/format.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const monthly = ses => sheetOf(ses, 'Monthly');
const inputs = ses => sheetOf(ses, 'Inputs');
const settled = ses => !ses.editing && !ses.dialog;
const COLS = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
const fx = (sh, ref, rx) => { const c = sh.cellAt(ref); return !!c.formula && rx.test(c.formula.replace(/\s+/g, '').toUpperCase()); };
const monthChained = (sh, i) => sh.value(COLS[i] + '4') === MONTH_ENDS[i] && fx(sh, COLS[i] + '4', /EOMONTH\(/);
const monthsChained = sh => !!sh && COLS.slice(1).every((col, k) => monthChained(sh, k + 1));
const yearsChained = sh => !!sh && ['D', 'E'].every((col, k) => sh.value(col + '4') === YEAR_ENDS[k + 1] && fx(sh, col + '4', /EOMONTH\(/));
const firstYearLinked = sh => !!sh && sh.value('C4') === YEAR_ENDS[0] && fx(sh, 'C4', /^=INPUTS!\$?B\$?6$/) && sh.cellAt('C4').fontColor === 'green';
/** The next update: three months after the as-of date (9/30/2026 → 12/30/2026), as EDATE gives it. */
const NEXT = (() => { const d = serialToDate(EXPORT.asOf); return dateToSerial(d.getUTCFullYear(), d.getUTCMonth() + 4, d.getUTCDate()); })();
const nextUpdate = sh => !!sh && sh.value('B18') === NEXT && fx(sh, 'B18', /EDATE\(/) && sh.cellAt('B18').fmtStyle === 'custom' && sh.cellAt('B18').numFmt === 'm/d/yyyy';

export default {
  id: 'eomonth-edate',
  chapter: 'formatting',
  section: 'Dates and text for presentation',
  module: 'dates-and-text-for-presentation',
  workbook: 'clearcoat-pnl',
  state: { before: 'S6a', after: 'S6b' },
  title: 'EOMONTH and EDATE for period ends',
  difficulty: 'medium',
  tags: ['formula', 'dates', 'timeline'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['C2', 'B1'],
  teaches: ['eomonth-edate'],
  uses: ['custom-number-format', 'fill-down-right', 'font-color', 'input-colour-convention', 'link-colour-convention', 'cross-sheet-ref', 'go-to', 'sheet-reference', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys', 'tab-commits'],
  prerequisites: ['text-for-labels'],
  brief: 'A timeline is a chain: each period end is the last day of the month a step after the one before. EOMONTH(date, n) gives the last day of the month n months on; EDATE gives the same day n months on. Build Monthly’s twelve month ends from one typed date, and the P&L’s year ends from the first, so rolling the page forward is one edit. The key is `=`.',
  goals: [
    { id: 'anchor-date', text: 'Leave Monthly!C4 typed as 1/31/2026 and color it blue: it is the one date the chain starts from.', keys: 'Ctrl+G "Monthly!C4" ↵ Alt H F C → ×4 ↵', requires: ['font-color', 'input-colour-convention', 'go-to', 'sheet-reference'], convention: 'B1',
      hintStuck: 'pulse cell C4 · Blue is the fourth step along the font colors.',
      check: (s, ses) => { const sh = monthly(ses); return !!sh && sh.cellAt('C4').fontColor === 'blue' && sh.value('C4') === MONTH_ENDS[0] && !sh.cellAt('C4').formula && settled(ses); } },
    { id: 'february', teach: 'EOMONTH(date, n) is the last day of the month n months after the date, so =EOMONTH(C4,1) is the end of February whatever day January ended on.', text: 'In D4 enter =EOMONTH(C4,1) and read Feb-26, the month end after C4.', keys: '→ "=EOMONTH(C4,1)" ↵', requires: ['eomonth-edate', 'arrow-keys'], convention: 'C2',
      hintStuck: 'pulse cell D4 · One month on from the cell to its left.',
      check: (s, ses) => { const sh = monthly(ses); return !!sh && monthChained(sh, 1) && settled(ses); } },
    { id: 'chain-months', text: 'Fill D4 right to N4 with Ctrl+R: twelve month ends from one typed date.', keys: '↑ Ctrl+Shift+→ Shift+← Ctrl+R', requires: ['fill-down-right', 'ctrl-shift-arrow', 'shift-arrow'],
      hintStuck: 'pulse range D4:N4 · Stop at December; the full year in O is a label.',
      check: (s, ses) => monthsChained(monthly(ses)) && settled(ses) },
    { id: 'first-year', text: 'On the P&L, link C4 to the first fiscal year end with =Inputs!B6 and color it green.', keys: `Ctrl+G "'P&L'!C4" ↵ "=Inputs!B6" ↵ ↑ Alt H F C → ×8 ↵`, requires: ['cross-sheet-ref', 'link-colour-convention', 'font-color', 'go-to', 'sheet-reference'], convention: 'B2',
      hintStuck: 'pulse cell C4 · The year end the CFO keeps on Inputs.',
      check: (s, ses) => firstYearLinked(pnl(ses)) && settled(ses) },
    { id: 'year-ends', teach: 'Twelve months on is a year end. Type E4 rather than fill it: Ctrl+R would carry D4’s divider and its A code onto the estimate.', text: 'Enter =EOMONTH(C4,12) in D4, then Tab, and =EOMONTH(D4,12) in E4.', keys: '→ "=EOMONTH(C4,12)" Tab "=EOMONTH(D4,12)" ↵', requires: ['eomonth-edate', 'tab-commits', 'arrow-keys'], convention: 'C2',
      hintStuck: 'pulse range D4:E4 · Each year end reads the one before it.',
      check: (s, ses) => yearsChained(pnl(ses)) && settled(ses) },
    { id: 'next-update', teach: 'EDATE(date, n) is the same day n months on. A formula that returns a date can arrive as a bare serial, so give it a date code.', text: 'In Inputs!B18 enter =EDATE(B10,3), the as-of date plus three months, and give it the code m/d/yyyy.', keys: 'Ctrl+G "Inputs!B18" ↵ "=EDATE(B10,3)" ↵ ↑ Ctrl+1 N Tab End Alt+T "m/d/yyyy" ↵', requires: ['eomonth-edate', 'custom-number-format', 'go-to', 'sheet-reference'],
      hintStuck: 'pulse cell B18 · The as-of date is in B10.',
      check: (s, ses) => nextUpdate(inputs(ses)) && settled(ses) },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "Inputs!B6" Enter "12/31/2025" Enter Ctrl+G "'P&L'!C4" Enter Escape`, cadence: 320 }, text: 'Does it tie? Watch Inputs!B6 change to 12/31/2025, and the P&L’s timeline in C4:E4 roll forward a year.', requires: [],
      hintStuck: 'pulse range C4:E4 · One typed date drives the whole row.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Monthly C4 is typed and blue, and D4:N4 chain from it with EOMONTH', check: (s, ses) => { const sh = monthly(ses); return !!sh && sh.cellAt('C4').fontColor === 'blue' && monthsChained(sh); } },
    { text: 'The P&L’s C4 reads Inputs!B6 and D4:E4 chain from it', check: (s, ses) => firstYearLinked(pnl(ses)) && yearsChained(pnl(ses)) },
    { text: 'Inputs B18 dates the next update with EDATE', check: (s, ses) => nextUpdate(inputs(ses)) },
  ],
  closing: [
    'One typed date drives every header on two sheets.',
    'EOMONTH steps from month end to month end, so February ends on the 28th without anyone counting days, and EDATE keeps the day of the month. The year ends now come from the one date on Inputs, and the FY labels Print builds from them follow.',
  ],
  solution: `Ctrl+G "Monthly!C4" Enter Alt H F C Right Right Right Right Enter Right "=EOMONTH(C4,1)" Enter Up Ctrl+Shift+Right Shift+Left Ctrl+R Ctrl+G "'P&L'!C4" Enter "=Inputs!B6" Enter Up Alt H F C Right Right Right Right Right Right Right Right Enter Right "=EOMONTH(C4,12)" Tab "=EOMONTH(D4,12)" Enter Ctrl+G "Inputs!B18" Enter "=EDATE(B10,3)" Enter Up Ctrl+1 N Tab End Alt+T "m/d/yyyy" Enter`,
};
