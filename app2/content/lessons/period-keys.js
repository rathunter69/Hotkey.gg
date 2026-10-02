// Chapter 3 · 3.2.3 Period keys: a month and a quarter from every date (clearcoat-databook, S2b → S2c)
// On Transactions, row 5 gets five keys on its date in column A as one Tab run: the month as text
// (TEXT), the month end as a date (EOMONTH), the quarter number (ROUNDUP of MONTH/3), its label (&)
// and the Monday of the week (WEEKDAY). Then the five are filled to the last of the ninety rows
// from row 94 up, and one is read back with F2. Graded on values and liveness. The closer moves
// the first wash into October and its keys follow.
import { liveness } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const tx = ses => sheetOf(ses, 'Transactions');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const same = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) < 1e-9 : a === b);
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const at = (sh, ref) => sh.selectionText() === ref;
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
const COLS = ['G', 'H', 'I', 'J', 'K'];
const block = sh => COLS.every(col => ALL.every(r => same(sh.value(col + r), WANT[col](sh, r))) && [5, 94].every(r => liveness(sh, col + r).ok));

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
  uses: ['date-serial', 'year-month-day', 'formula-basics', 'tab-commits', 'go-to', 'fill-to-bottom', 'fill-down-right', 'edit-mode-f2', 'escape-cancels', 'shift-arrow', 'ctrl-shift-arrow', 'ctrl-arrow'],
  prerequisites: ['member-tenure'],
  brief: 'Ninety transactions are useful once they can be grouped, and grouping needs a key: a column that says which month or quarter each row belongs to. TEXT(A5,"yyyy-mm") writes 2026-09 as text you can count on; EOMONTH(A5,0) gives the month end as a date you can sort on; a quarter is ROUNDUP(MONTH(A5)/3,0). Add the keys to Transactions, and module 3.3 counts and sums on them. The key is `TEXT`.',
  goals: [
    { id: 'month-key', teach: 'TEXT(value, "format") writes a number through a format code as text: the date stays a date in A, and G holds the label 2026-09, which sorts in order.',
      text: 'Go to Transactions and give G5 the month key as text: =TEXT(A5,"yyyy-mm"), then Tab on.', keys: `Ctrl+G "Transactions!G5" ↵ '=TEXT(A5,"yyyy-mm")' Tab`, requires: ['text-function', 'go-to', 'tab-commits'],
      hintStuck: 'pulse cell Transactions!G5 · Month key is the first empty column after Memo.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && cellOk(sh, 'G'); } },
    { id: 'month-end', teach: 'EOMONTH(date, 0) is the last day of the date’s own month; EOMONTH(date, 1) of the next. Its sibling EDATE(date, n) keeps the day and moves n months.',
      text: 'The month end in H5 is =EOMONTH(A5,0), a real date shown as mmm-yy; Tab on.', keys: '"=EOMONTH(A5,0)" Tab', requires: ['eomonth-edate', 'tab-commits'],
      hintStuck: 'pulse cell H5 · Month end sits right of the month key.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && cellOk(sh, 'H'); } },
    { id: 'quarter', teach: 'ROUNDUP(x, 0) rounds up to the next whole number, so months 7 to 9 over 3 give quarter 3. & joins text and values into one label. The desk’s other test: MOD(MONTH(A5),3)=0 is TRUE in a quarter-end month.',
      text: `Quarter number in I5, =ROUNDUP(MONTH(A5)/3,0), and its label in J5, ="Q"&I5&" "&YEAR(A5), both with Tab.`, keys: `"=ROUNDUP(MONTH(A5)/3,0)" Tab '="Q"&I5&" "&YEAR(A5)' Tab`, requires: ['period-key', 'year-month-day', 'concatenate-amp', 'tab-commits'],
      hintStuck: 'pulse cell J5 · The label reads Q3 2026.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && cellOk(sh, 'I') && cellOk(sh, 'J'); } },
    { id: 'week-key', teach: 'WEEKDAY(date, 2) numbers Monday as 1 through Sunday as 7, so the date less its weekday, plus one, is that week’s Monday.',
      text: 'The week key in K5 is the Monday of the week: =A5-WEEKDAY(A5,2)+1, then Enter.', keys: '"=A5-WEEKDAY(A5,2)+1" ↵', requires: ['weekday-function', 'formula-basics'],
      hintStuck: 'pulse cell K5 · Week of is the fifth key column.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && cellOk(sh, 'K'); } },
    { id: 'fill', text: 'Fill the five keys to the last row: Go To G94, widen to K, Ctrl+Shift+↑ up to row 5 and Ctrl+D.', keys: 'Ctrl+G "G94" ↵ Shift+→ ×4 Ctrl+Shift+↑ Ctrl+D', requires: ['fill-to-bottom', 'fill-down-right', 'go-to', 'shift-arrow', 'ctrl-shift-arrow'], convention: 'E3',
      hintStuck: 'pulse range G5:K94 · Ninety rows of washes end on row 94.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && block(sh); } },
    { id: 'read-back', text: 'Open the week key on the last row, K94, with F2, read that it works on A94 alone, then Esc.', keys: 'Ctrl+→ F2 Esc', requires: ['edit-mode-f2', 'escape-cancels', 'ctrl-arrow'],
      hintStuck: 'pulse cell K94 · Every key is a formula on column A.',
      check: (s, ses) => { const sh = tx(ses); const k = windowKeys(ses); return settled(ses) && !!sh && at(sh, 'K94') && k.includes('F2') && k.includes('Esc'); } },
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
  solution: `Ctrl+G "Transactions!G5" Enter '=TEXT(A5,"yyyy-mm")' Tab "=EOMONTH(A5,0)" Tab "=ROUNDUP(MONTH(A5)/3,0)" Tab '="Q"&I5&" "&YEAR(A5)' Tab "=A5-WEEKDAY(A5,2)+1" Enter Ctrl+G "G94" Enter Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+Shift+Up Ctrl+D Ctrl+Right F2 Escape`,
};
