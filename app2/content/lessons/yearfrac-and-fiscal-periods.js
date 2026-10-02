// Chapter 3 · 3.2.4 YEARFRAC and fiscal periods (clearcoat-databook, S2c → S2d)
// On Sites, age in years is rewritten with YEARFRAC over K5:K10 (Ctrl+Enter keeps the format), and
// Cedar Park's first-year stub goes in C15 as a YEARFRAC to year end. On Transactions the buyer's
// June fiscal year, its half and the label are built on row 5 and filled to row 94. Graded on
// values (YEARFRAC's default 30/360 basis, worked out here) and liveness. The closer moves the
// first wash to June 30 and its fiscal year and half flip back.
import { liveness } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const sites = ses => sheetOf(ses, 'Sites');
const tx = ses => sheetOf(ses, 'Transactions');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const same = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) < 1e-9 : a === b);
const ROWS = [5, 6, 7, 8, 9, 10];
const ALL = Array.from({ length: 90 }, (_, i) => 5 + i);
const EPOCH = Date.UTC(1899, 11, 30);
const parts = n => { const d = new Date(EPOCH + Math.floor(n) * 864e5); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; };
const serial = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - EPOCH) / 864e5);
const lastOfFeb = p => p.m === 2 && p.d === new Date(Date.UTC(p.y, 2, 0)).getUTCDate();
/** YEARFRAC with no basis: US 30/360, Excel's month-end rules. */
const yearfrac = (a, b) => {
  if (a > b) [a, b] = [b, a];
  const s = parts(a), e = parts(b); let d1 = s.d, d2 = e.d;
  if (lastOfFeb(s) && lastOfFeb(e)) d2 = 30;
  if (lastOfFeb(s)) d1 = 30;
  if (d2 === 31 && d1 >= 30) d2 = 30;
  if (d1 === 31) d1 = 30;
  return ((e.y - s.y) * 360 + (e.m - s.m) * 30 + (d2 - d1)) / 360;
};
const ages = sh => ROWS.every(r => same(sh.value('K' + r), yearfrac(sh.value('E' + r), sh.value('I5')))) && [5, 10].every(r => liveness(sh, 'K' + r).ok);
const stub = sh => same(sh.value('C15'), yearfrac(sh.value('E10'), serial(2026, 12, 31))) && liveness(sh, 'C15').ok;
const fy = (sh, r) => { const p = parts(sh.value('A' + r)); return p.m >= 7 ? p.y + 1 : p.y; };
const half = (sh, r) => (parts(sh.value('A' + r)).m >= 7 ? 'H1' : 'H2');
const WANT = { L: fy, M: half, N: (sh, r) => `FY${String(fy(sh, r)).slice(-2)} ${half(sh, r)}` };
const cellOk = (sh, col, r = 5) => same(sh.value(col + r), WANT[col](sh, r)) && liveness(sh, col + r).ok;
const block = sh => ['L', 'M', 'N'].every(col => ALL.every(r => same(sh.value(col + r), WANT[col](sh, r))) && [5, 94].every(r => liveness(sh, col + r).ok));

export default {
  id: 'yearfrac-and-fiscal-periods',
  chapter: 'formulas',
  section: 'Dates',
  module: 'dates',
  workbook: 'clearcoat-databook',
  state: { before: 'S2c', after: 'S2d' },
  title: 'YEARFRAC and fiscal periods',
  difficulty: 'medium',
  tags: ['formulas', 'dates', 'yearfrac', 'fiscal-year'],
  access: 'paid',
  minutes: 7,
  headline: 'YEARFRAC',
  conventions: ['E3'],
  teaches: ['yearfrac', 'fiscal-year'],
  uses: ['date-serial', 'year-month-day', 'date-function', 'if-function', 'text-function', 'concatenate-amp', 'relative-absolute', 'ctrl-enter-fill', 'tab-commits', 'go-to', 'fill-to-bottom', 'fill-down-right', 'arrow-keys', 'ctrl-arrow', 'shift-arrow', 'ctrl-shift-arrow'],
  prerequisites: ['period-keys'],
  brief: 'Dividing days by 365.25 is close; YEARFRAC is the function a model uses, and it takes a basis, the day-count convention a loan or a lease uses. A fiscal year is wherever a company’s year starts: Clearcoat’s ends on December 31, but the lead buyer’s ends June 30, and their diligence team asks for everything in their halves. Convert each date into the buyer’s fiscal year and half with MONTH and a little arithmetic. The key is `YEARFRAC`.',
  goals: [
    { id: 'yearfrac', teach: 'YEARFRAC(start, end) is the years between two dates. With no basis it counts 30/360, a 30-day month and a 360-day year, the bond convention; a basis of 1 counts actual days, the one a lease uses.',
      text: 'On Sites, select the ages K5:K10, type =YEARFRAC(E5,$I$5) and press Ctrl+Enter to replace the /365.25.', keys: 'Ctrl+G "Sites!K5" ↵ Shift+↓ ×5 "=YEARFRAC(E5,$I$5)" Ctrl+↵', requires: ['yearfrac', 'relative-absolute', 'ctrl-enter-fill', 'go-to', 'shift-arrow'],
      hintStuck: 'pulse range Sites!K5:K10 · Age (years) is right of Age (days).',
      check: (s, ses) => { const sh = sites(ses); return settled(ses) && !!sh && ages(sh); } },
    { id: 'stub', teach: 'A stub is a part year. The desk’s main use of YEARFRAC is the annual figure times YEARFRAC(start, period end): what a site opened in September can hold in its opening year.',
      text: 'Cedar Park opened on 9/8/2026, so 2026 is a stub year: in C15, =YEARFRAC(E10,DATE(2026,12,31)) reads 0.31 of a year.', keys: 'Ctrl+← Ctrl+↓ ×3 ↑ → "=YEARFRAC(E10,DATE(2026,12,31))" ↵', requires: ['yearfrac', 'date-function', 'ctrl-arrow', 'arrow-keys'],
      hintStuck: 'pulse cell C15 · The stub line sits under the holidays in the Calendar block.',
      check: (s, ses) => { const sh = sites(ses); return settled(ses) && !!sh && stub(sh); } },
    { id: 'fiscal-year', teach: 'A fiscal year is named for the calendar year it ends in. The buyer’s ends June 30, so a date from July on belongs to the next year: September 2026 is FY2027.',
      text: 'On Transactions, the buyer’s fiscal year in L5 is =IF(MONTH(A5)>=7,YEAR(A5)+1,YEAR(A5)); Tab on.', keys: 'Ctrl+G "Transactions!L5" ↵ "=IF(MONTH(A5)>=7,YEAR(A5)+1,YEAR(A5))" Tab', requires: ['fiscal-year', 'if-function', 'year-month-day', 'go-to', 'tab-commits'],
      hintStuck: 'pulse cell Transactions!L5 · Fiscal year (Jun) comes after the week key.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && cellOk(sh, 'L'); } },
    { id: 'half', text: `The half in M5 is =IF(MONTH(A5)>=7,"H1","H2") and the label in N5 is ="FY"&RIGHT(L5,2)&" "&M5, a Tab run.`, keys: `'=IF(MONTH(A5)>=7,"H1","H2")' Tab '="FY"&RIGHT(L5,2)&" "&M5' ↵`, requires: ['fiscal-year', 'if-function', 'concatenate-amp', 'tab-commits'],
      hintStuck: 'pulse cell N5 · The label reads FY27 H1.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && cellOk(sh, 'M') && cellOk(sh, 'N'); } },
    { id: 'fill', teach: 'The 7 inside these formulas is the buyer’s first fiscal month. In a model it lives in one blue input cell and every formula points at it, so a buyer with a March year end is one edit away.',
      text: 'Fill the three to the last row: Go To L94, widen to N, Ctrl+Shift+↑ up to row 5 and Ctrl+D.', keys: 'Ctrl+G "L94" ↵ Shift+→ ×2 Ctrl+Shift+↑ Ctrl+D', requires: ['fill-to-bottom', 'fill-down-right', 'go-to', 'shift-arrow', 'ctrl-shift-arrow'], convention: 'E3',
      hintStuck: 'pulse range L5:N94 · The washes end on row 94.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && block(sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Transactions!A5" Enter "6/30/2026" Enter Ctrl+G "Transactions!N5" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch the first wash move to 6/30/2026, the buyer’s year end: its label in N5 flips to FY26 H2.', requires: [],
      hintStuck: 'pulse cell N5 · June is the last month of the buyer’s year.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Sites K5:K10 read each age with YEARFRAC, and C15 holds Cedar Park’s 2026 stub', check: (s, ses) => { const sh = sites(ses); return !!sh && ages(sh) && stub(sh); } },
    { text: 'Transactions L5:N94 give every row the buyer’s fiscal year, half and label', check: (s, ses) => { const sh = tx(ses); return !!sh && block(sh); } },
  ],
  closing: [
    'Any date can be restated into anyone’s fiscal year, in two cells.',
    'The fiscal year, the half and the label are each written once and filled to the last row (E3), so ninety rows restate in one pass.',
  ],
  solution: `Ctrl+G "Sites!K5" Enter Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "=YEARFRAC(E5,$I$5)" Ctrl+Enter Ctrl+Left Ctrl+Down Ctrl+Down Ctrl+Down Up Right "=YEARFRAC(E10,DATE(2026,12,31))" Enter Ctrl+G "Transactions!L5" Enter "=IF(MONTH(A5)>=7,YEAR(A5)+1,YEAR(A5))" Tab '=IF(MONTH(A5)>=7,"H1","H2")' Tab '="FY"&RIGHT(L5,2)&" "&M5' Enter Ctrl+G "L94" Enter Shift+Right Shift+Right Ctrl+Shift+Up Ctrl+D`,
};
