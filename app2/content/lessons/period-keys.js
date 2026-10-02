// Chapter 3 · 3.2.3 Period keys: a month and a quarter from every date (clearcoat-databook, S2b → S2c)
// On Transactions, each key is written on row 5 and then put to work on all ninety rows before
// the next function arrives: the month as text (TEXT), the month end as a date (EOMONTH), the
// quarter number (ROUNDUP of MONTH/3) and its label (&), and the Monday of the week (WEEKDAY).
// The first fill uses Go To on row 94; the rest find row 94 from the filled column beside them.
// Graded on values and liveness. The closer moves the first wash into October and its keys follow.
import { liveness } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const tx = ses => sheetOf(ses, 'Transactions');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const same = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) < 1e-9 : a === b);
const ALL = Array.from({ length: 90 }, (_, i) => 5 + i);
const EPOCH = Date.UTC(1899, 11, 30);
const parts = n => { const d = new Date(EPOCH + Math.floor(n) * 864e5); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, wd: (d.getUTCDay() + 6) % 7 + 1 }; };
const serial = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - EPOCH) / 864e5);
const date = (sh, r) => parts(sh.value('A' + r));
const WANT = {
  G: (sh, r) => { const p = date(sh, r); return `${p.y}-${String(p.m).padStart(2, '0')}`; },
  H: (sh, r) => { const p = date(sh, r); return serial(p.y, p.m + 1, 1) - 1; },
  I: (sh, r) => Math.ceil(date(sh, r).m / 3),
  J: (sh, r) => `Q${Math.ceil(date(sh, r).m / 3)} ${date(sh, r).y}`,
  K: (sh, r) => Math.floor(sh.value('A' + r)) - date(sh, r).wd + 1,
};
const cellOk = (sh, col, r = 5) => same(sh.value(col + r), WANT[col](sh, r)) && liveness(sh, col + r).ok;
const COLS = ['K', 'J', 'I', 'H', 'G'];   // the last key first, so a check that fails fails before any probe
const colOk = (sh, col) => ALL.every(r => same(sh.value(col + r), WANT[col](sh, r))) && [5, 94].every(r => liveness(sh, col + r).ok);
const block = sh => COLS.every(col => colOk(sh, col));

export default {
  id: 'period-keys',
  chapter: 'formulas',
  section: 'Dates',
  module: 'dates',
  workbook: 'clearcoat-databook',
  state: { before: 'S2b', after: 'S2c' },
  title: 'Period keys: a month and a quarter from every date',
  difficulty: 'medium',
  tags: ['formulas', 'dates', 'text', 'eomonth', 'weekday'],
  access: 'paid',
  minutes: 7,
  headline: 'TEXT',
  conventions: ['E3'],
  teaches: ['text-function', 'eomonth-edate', 'period-key', 'concatenate-amp', 'weekday-function'],
  uses: ['date-serial', 'year-month-day', 'formula-basics', 'tab-commits', 'go-to', 'fill-to-bottom', 'fill-down-right', 'shift-arrow', 'ctrl-shift-arrow', 'ctrl-arrow'],
  prerequisites: ['member-tenure'],
  brief: 'Ninety transactions are useful once they can be grouped, and grouping needs a key: a column that says which month or quarter each row belongs to. TEXT(A5,"yyyy-mm") writes 2026-09 as text you can count on; EOMONTH(A5,0) gives the month end as a date you can sort on; a quarter is ROUNDUP(MONTH(A5)/3,0). Add the keys to Transactions, and module 3.3 counts and sums on them. The key is `TEXT`.',
  goals: [
    { id: 'month-key', teach: 'TEXT(value, "format") writes a number through a format code as text: the date stays a date in A, and G holds the label 2026-09, which sorts in order.',
      text: 'Go to Transactions and give G5 the month key as text: =TEXT(A5,"yyyy-mm"), then Enter.', keys: `Ctrl+G "Transactions!G5" ↵ '=TEXT(A5,"yyyy-mm")' ↵`, requires: ['text-function', 'go-to'],
      hintStuck: 'pulse cell Transactions!G5 · Month key is the first empty column after Memo.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && cellOk(sh, 'G'); } },
    { id: 'month-key-fill', text: 'Key every wash by month: Go To G94, Ctrl+Shift+↑ up to G5 and Ctrl+D, and all ninety rows read 2026-09.', keys: 'Ctrl+G "G94" ↵ Ctrl+Shift+↑ Ctrl+D', requires: ['text-function', 'fill-to-bottom', 'fill-down-right', 'go-to', 'ctrl-shift-arrow'], convention: 'E3',
      hintStuck: 'pulse range G5:G94 · Ninety rows of washes end on row 94.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && colOk(sh, 'G'); } },
    { id: 'month-end', teach: 'EOMONTH(date, 0) is the last day of the date’s own month; EOMONTH(date, 1) of the next. Its sibling EDATE(date, n) keeps the day and moves n months.',
      text: 'The month end in H5 is =EOMONTH(A5,0), a real date shown as mmm-yy that sorts and subtracts; Enter.', keys: 'Ctrl+↑ ↓ → "=EOMONTH(A5,0)" ↵', requires: ['eomonth-edate', 'ctrl-arrow', 'arrow-keys'],
      hintStuck: 'pulse cell H5 · Month end sits right of the month key.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && cellOk(sh, 'H'); } },
    { id: 'month-end-fill', text: 'Fill the month end down: Ctrl+↓ on the month keys finds row 94, then → and Ctrl+Shift+↑ select H5:H94 for Ctrl+D.', keys: '← Ctrl+↓ → Ctrl+Shift+↑ Ctrl+D', requires: ['eomonth-edate', 'fill-down-right', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys'], convention: 'E3',
      hintStuck: 'pulse range H5:H94 · The filled column beside it shows where the data ends.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && colOk(sh, 'H'); } },
    { id: 'quarter', teach: 'ROUNDUP(x, 0) rounds up to the next whole number, so months 7 to 9 over 3 give quarter 3. The desk’s other test: MOD(MONTH(A5),3)=0 is TRUE in a quarter-end month.',
      text: 'The quarter number in I5 is =ROUNDUP(MONTH(A5)/3,0): September is month 9, so quarter 3; Tab on.', keys: 'Ctrl+↑ ↓ → "=ROUNDUP(MONTH(A5)/3,0)" Tab', requires: ['period-key', 'year-month-day', 'tab-commits', 'ctrl-arrow', 'arrow-keys'],
      hintStuck: 'pulse cell I5 · Quarter sits right of the month end.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && cellOk(sh, 'I'); } },
    { id: 'label', teach: '& joins text and values into one string: "Q" and the quarter number and a space and the year read Q3 2026.',
      text: `Label the quarter in J5 from I5: ="Q"&I5&" "&YEAR(A5) reads Q3 2026; Enter.`, keys: `'="Q"&I5&" "&YEAR(A5)' ↵`, requires: ['concatenate-amp', 'period-key', 'year-month-day'],
      hintStuck: 'pulse cell J5 · Quarter label is right of the quarter number.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && cellOk(sh, 'J'); } },
    { id: 'quarter-fill', text: 'Fill the quarter and its label down together: find row 94 from the month end, select I5:J94 and Ctrl+D.', keys: '← Ctrl+↓ → Shift+→ Ctrl+Shift+↑ Ctrl+D', requires: ['concatenate-amp', 'period-key', 'fill-down-right', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys'], convention: 'E3',
      hintStuck: 'pulse range I5:J94 · Widen to J on row 94 before you climb.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && colOk(sh, 'I') && colOk(sh, 'J'); } },
    { id: 'week-key', teach: 'WEEKDAY(date, 2) numbers Monday as 1 through Sunday as 7, so the date less its weekday, plus one, is that week’s Monday.',
      text: 'The week key in K5 is the Monday of the week, =A5-WEEKDAY(A5,2)+1; fill it to K94 the same way.', keys: 'Ctrl+↑ ↓ → ×2 "=A5-WEEKDAY(A5,2)+1" ↵ ← Ctrl+↓ → Ctrl+Shift+↑ Ctrl+D', requires: ['weekday-function', 'formula-basics', 'fill-down-right', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys'], convention: 'E3',
      hintStuck: 'pulse range K5:K94 · Week of is the last key column.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && block(sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Transactions!A5" Enter "10/5/2026" Enter Ctrl+G "Transactions!J5" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch the first wash move to 10/5/2026: its month key reads 2026-10, its quarter Q4 2026 and its week that Monday.', requires: [],
      hintStuck: 'pulse cell J5 · Every key reads the date in A5.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Transactions G5:K94 hold the month key, month end, quarter, quarter label and week for every row', check: (s, ses) => { const sh = tx(ses); return !!sh && block(sh); } },
  ],
  closing: [
    'Every row knows its month, its quarter and its week, and the grouping can begin.',
    'Each key is a formula on the date in column A, never typed, so a corrected date moves its month, quarter and week with it.',
  ],
  solution: `Ctrl+G "Transactions!G5" Enter '=TEXT(A5,"yyyy-mm")' Enter Ctrl+G "G94" Enter Ctrl+Shift+Up Ctrl+D Ctrl+Up Down Right "=EOMONTH(A5,0)" Enter Left Ctrl+Down Right Ctrl+Shift+Up Ctrl+D Ctrl+Up Down Right "=ROUNDUP(MONTH(A5)/3,0)" Tab '="Q"&I5&" "&YEAR(A5)' Enter Left Ctrl+Down Right Shift+Right Ctrl+Shift+Up Ctrl+D Ctrl+Up Down Right Right "=A5-WEEKDAY(A5,2)+1" Enter Left Ctrl+Down Right Ctrl+Shift+Up Ctrl+D`,
};
