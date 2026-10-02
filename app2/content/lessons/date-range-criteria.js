// Chapter 4 · 4.3.3 Date-range criteria: SUMIFS between two dates (clearcoat-pack, S432 → S433)
// A window block on Summary: a start and an end date in blue (the export’s last seven days), the
// washes and the retail revenue in the window as SUMIFS with ">="&C48 and "<="&C49 on the date
// column, the SUMPRODUCT version beside it to read the same figure the old way, then cleared, and
// Sponsor C's question 8 answered by a link. The closer moves the end date back a day.
import { summary, qa, exportRows, sumWhere, between, calls, live, near, isNum, settled, shellOf, refsIn, sameText } from './lib/pack-checks.js';

const PLANT = [...refsIn('B47:B51'), ...refsIn('C48:C51'), 'B47'];
const F = {
  start: '9/23/2026', end: '9/29/2026',
  washes: '=SUMIFS(Export!$E$5:$E$94,Export!$A$5:$A$94,">="&C48,Export!$A$5:$A$94,"<="&C49)',
  revenue: '=SUMIFS(Export!$F$5:$F$94,Export!$A$5:$A$94,">="&C48,Export!$A$5:$A$94,"<="&C49)',
  sp: '=SUMPRODUCT((Export!A5:A94>=C48)*(Export!A5:A94<=C49)*Export!E5:E94)',
  answer: '=Summary!C51',
};
const lastDay = ses => exportRows(ses).reduce((m, x) => (isNum(x.date) && x.date > m ? x.date : m), 0);
const dates = (ses, sh) => !sh.formula('C48') && !sh.formula('C49') && sh.value('C49') === lastDay(ses) && sh.value('C48') === lastDay(ses) - 6;
const windowOf = sh => between(sh.value('C48'), sh.value('C49'));
const inWindow = (ses, sh, ref, field) => calls(sh, ref, ['SUMIFS']) && near(sh.value(ref), sumWhere(exportRows(ses), field, windowOf(sh))) && live(sh, ref) && /C48/.test(sh.formula(ref) || '') && /C49/.test(sh.formula(ref) || '');
const sp = sh => calls(sh, 'D50', ['SUMPRODUCT']) && near(sh.value('D50'), sh.value('C50'));
const answered = (ses) => { const q = qa(ses); return sameText(q.value('E12'), 'Answered') && /Summary!/i.test(q.formula('F12') || '') && near(q.value('F12'), summary(ses).value('C51')); };

export default {
  id: 'date-range-criteria',
  chapter: 'data-and-lookups',
  section: 'Summaries from raw rows',
  module: 'summaries-from-raw-rows',
  workbook: 'clearcoat-pack',
  state: { before: 'S432', after: 'S433' },
  plant: shellOf('S433', { Summary: PLANT, 'Q&A': ['F12'] }, { keepText: true }),
  title: 'Date-range criteria: SUMIFS between two dates',
  difficulty: 'medium',
  tags: ['formulas', 'sumifs', 'dates'],
  access: 'paid',
  minutes: 5,
  headline: '&',
  conventions: ['B1', 'B4'],
  teaches: ['date-window'],
  uses: ['sumifs-cube', 'sumif-sumifs', 'criteria-operators', 'concatenate-amp', 'sumproduct', 'date-serial', 'cross-sheet-ref', 'go-to', 'arrow-keys', 'type-to-enter', 'delete-clears', 'tab-commits'],
  prerequisites: ['kpi-block'],
  brief: '"Revenue in the last seven days" is a SUMIFS with two conditions on the same column: on or after a start date, and on or before an end date, written ">="&C48 with the comparison in quotes and the cell joined by &. SUMPRODUCT does the same the old way, and you will meet it in inherited models. Build a window block with a start and an end date a buyer can type. The key is `&`.',
  goals: [
    { id: 'dates', text: 'On Summary, type the window’s dates in blue: C48 the start, 9/23/2026, and C49 the end, 9/29/2026, the export’s last day.', keys: `Ctrl+G "Summary!C48" ↵ "${F.start}" ↵ "${F.end}" ↵`, requires: ['date-serial', 'go-to', 'type-to-enter'], convention: 'B1',
      hintStuck: 'pulse range C48:C49 · Seven days, counting both ends: the 23rd to the 29th.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && dates(ses, sh); } },
    { id: 'washes', teach: 'A criteria can be an operator joined to a cell: ">="&C48 reads on or after whatever date C48 holds. Two pairs on the same date column make a window, and moving either date moves the answer.', text: `Washes in the window in C50: ${F.washes}.`, keys: `'${F.washes}' ↵`, requires: ['date-window', 'sumif-sumifs', 'concatenate-amp', 'type-to-enter'], convention: 'B4',
      hintStuck: 'pulse cell C50 · The operator sits in quotes; the date cell stays outside them, joined by &.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && inWindow(ses, sh, 'C50', 'total'); } },
    { id: 'revenue', text: 'Retail revenue in the window in C51: the same SUMIFS on column F of the export.', keys: `'${F.revenue}' ↵`, requires: ['date-window', 'sumif-sumifs', 'type-to-enter'],
      hintStuck: `pulse cell C51 · ${F.revenue}`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && inWindow(ses, sh, 'C51', 'revenue'); } },
    { id: 'sumproduct', text: `In D50, the old way: ${F.sp}, and read that it equals C50.`, keys: `↑ ×2 → "${F.sp}" ↵`, requires: ['sumproduct', 'arrow-keys', 'type-to-enter'],
      hintStuck: 'pulse cell D50 · Each condition is a column of TRUE and FALSE; multiplied, they keep the rows in the window.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && sp(sh); } },
    { id: 'answer', text: 'Clear D50, then answer question 8 on Q&A: E12 Answered and F12 =Summary!C51.', keys: `↑ Delete Ctrl+G "'Q&A'!E12" ↵ "Answered" Tab "${F.answer}" ↵`, requires: ['delete-clears', 'cross-sheet-ref', 'go-to', 'tab-commits'],
      hintStuck: 'pulse range E12:F12 · One figure on the page, one link from the log.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !sh.formula('D50') && answered(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Summary!C49" Enter "9/28/2026" Enter Ctrl+G "C50" Enter Escape', cadence: 320 }, text: 'Does it tie? Watch the end date in C49 move back a day: C50 and C51 both fall, and so does the answer on the log.', requires: [],
      hintStuck: 'pulse range C50:C51 · The window is two typed dates, so a buyer can ask for any week.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C48:C49 hold the window’s dates and C50:C51 its washes and revenue', check: (s, ses) => { const sh = summary(ses); return dates(ses, sh) && inWindow(ses, sh, 'C50', 'total') && inWindow(ses, sh, 'C51', 'revenue'); } },
    { text: 'Question 8 on Q&A is answered by a link to C51', check: (s, ses) => answered(ses) },
  ],
  closing: [
    'Any window a buyer types gets summed from the export.',
    'Best practice: the comparison in quotes, the cell outside, joined with &. The commonest SUMIFS slip is a date typed inside the quotes, which reads as text and matches nothing, or matches the right week until the window moves.',
  ],
  solution: `Ctrl+G "Summary!C48" Enter "${F.start}" Enter "${F.end}" Enter '${F.washes}' Enter '${F.revenue}' Enter Up Up Right "${F.sp}" Enter `
    + `Up Delete Ctrl+G "'Q&A'!E12" Enter "Answered" Tab "${F.answer}" Enter`,
};
