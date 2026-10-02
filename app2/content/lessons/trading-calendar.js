// Chapter 3 · 3.2.5 NETWORKDAYS and WEEKDAY: the trading calendar (clearcoat-databook, S2d → S2e)
// On Transactions every row gets its weekday number, its day name and a weekend flag, filled to
// row 94. On Sites the holiday list sits at C13:C14: working days from opening to the as-of date
// with NETWORKDAYS (Q), trading days seven a week less the holidays with NETWORKDAYS.INTL (R). On
// Summary the fortnight's trading days go in C62 and washes per trading day in P15:P20 read the
// fortnight's washes in O, which 3.3.3 fills, so they read 0 for now. Graded on values and
// liveness. The closer moves Thanksgiving into the fortnight and the trading days drop by one.
import { liveness } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const sites = ses => sheetOf(ses, 'Sites');
const tx = ses => sheetOf(ses, 'Transactions');
const summary = ses => sheetOf(ses, 'Summary');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const same = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) < 1e-9 : a === b);
const ROWS = [5, 6, 7, 8, 9, 10];
const ALL = Array.from({ length: 90 }, (_, i) => 5 + i);
const EPOCH = Date.UTC(1899, 11, 30);
/** Monday 1 to Sunday 7, WEEKDAY(date, 2). */
const wd = n => (new Date(EPOCH + Math.floor(n) * 864e5).getUTCDay() + 6) % 7 + 1;
const DAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const holidays = ses => { const si = sites(ses); return si ? [si.value('C13'), si.value('C14')].filter(isNum).map(Math.floor) : []; };
/** Days from a to b inclusive that count: weekdays only, or all seven, less the holidays among them. */
const countDays = (a, b, hols, weekdaysOnly) => {
  let n = 0; for (let d = Math.floor(a); d <= Math.floor(b); d++) if ((!weekdaysOnly || wd(d) <= 5) && !hols.includes(d)) n++;
  return n;
};
const TX = {
  O: (sh, r) => wd(sh.value('A' + r)),
  P: (sh, r) => DAY[wd(sh.value('A' + r)) - 1],
  Q: (sh, r) => (wd(sh.value('A' + r)) >= 6 ? 1 : 0),
};
const txCell = (sh, col, r = 5) => same(sh.value(col + r), TX[col](sh, r)) && liveness(sh, col + r).ok;
/** The weekend flag on a weekday row moves only when the date lands on a weekend, so its liveness is read on any row that does. */
const txBlock = sh => Object.keys(TX).every(col => ALL.every(r => same(sh.value(col + r), TX[col](sh, r))))
  && ['O', 'P'].every(col => [5, 94].every(r => liveness(sh, col + r).ok)) && ALL.some(r => liveness(sh, 'Q' + r).ok);
const siteDays = (ses, col, weekdaysOnly) => { const si = sites(ses); if (!si) return false; const h = holidays(ses);
  return ROWS.every(r => same(si.value(col + r), countDays(si.value('E' + r), si.value('I5'), h, weekdaysOnly))) && [5, 10].every(r => liveness(si, col + r).ok); };
const fortnight = ses => { const sm = summary(ses); return !!sm && same(sm.value('C62'), countDays(sm.value('C60'), sm.value('C61'), holidays(ses), false)) && liveness(sm, 'C62').ok; };
const SUM_ROWS = [15, 16, 17, 18, 19, 20];
const perDay = ses => { const sm = summary(ses); return !!sm && SUM_ROWS.every(r => same(sm.value('P' + r), (Number(sm.value('O' + r)) || 0) / sm.value('C62'))) && [15, 20].every(r => liveness(sm, 'P' + r).ok); };

export default {
  id: 'trading-calendar',
  chapter: 'formulas',
  section: 'Dates',
  module: 'dates',
  workbook: 'clearcoat-databook',
  state: { before: 'S2d', after: 'S2e' },
  title: 'NETWORKDAYS and WEEKDAY: the trading calendar',
  difficulty: 'medium',
  tags: ['formulas', 'dates', 'networkdays', 'weekday'],
  access: 'paid',
  minutes: 7,
  headline: 'NETWORKDAYS',
  conventions: ['E3'],
  teaches: ['networkdays'],
  uses: ['weekday-function', 'text-function', 'if-function', 'date-serial', 'relative-absolute', 'cross-sheet-ref', 'ctrl-enter-fill', 'tab-commits', 'go-to', 'fill-to-bottom', 'fill-down-right', 'shift-arrow', 'ctrl-shift-arrow'],
  prerequisites: ['yearfrac-and-fiscal-periods'],
  brief: 'A car wash trades seven days a week but its office doesn’t, and a buyer’s washes per trading day means calendar days less the days a site was shut. WEEKDAY says which day of the week a date is; NETWORKDAYS counts the working days between two dates and takes a list of holidays; NETWORKDAYS.INTL lets you say which days are the weekend. Build the trading calendar for the fortnight. The key is `NETWORKDAYS`.',
  goals: [
    { id: 'weekday', teach: 'TEXT with "ddd" writes the day’s short name, Tue; "dddd" writes it in full. WEEKDAY gives the number, which is what a test can compare.',
      text: `On Transactions, O5 is =WEEKDAY(A5,2), Monday as 1, and P5 is =TEXT(A5,"ddd"), the day’s name; type both with Tab.`, keys: `Ctrl+G "Transactions!O5" ↵ "=WEEKDAY(A5,2)" Tab '=TEXT(A5,"ddd")' Tab`, requires: ['weekday-function', 'text-function', 'go-to', 'tab-commits'],
      hintStuck: 'pulse cell Transactions!O5 · Weekday comes after the fiscal label.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && txCell(sh, 'O') && txCell(sh, 'P'); } },
    { id: 'weekend', text: 'The weekend flag in Q5 is =IF(O5>=6,1,0): Saturday and Sunday are 6 and 7.', keys: '"=IF(O5>=6,1,0)" ↵', requires: ['if-function', 'weekday-function'],
      hintStuck: 'pulse cell Q5 · Weekend (1/0) sits right of Day.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && same(sh.value('Q5'), TX.Q(sh, 5)) && sh.cellAt('Q5').formula != null && liveness(sh, 'Q5').ok; } },
    { id: 'fill', text: 'Fill the three to the last row: Go To O94, widen to Q, Ctrl+Shift+↑ up to row 5 and Ctrl+D.', keys: 'Ctrl+G "O94" ↵ Shift+→ ×2 Ctrl+Shift+↑ Ctrl+D', requires: ['fill-to-bottom', 'fill-down-right', 'go-to', 'shift-arrow', 'ctrl-shift-arrow'], convention: 'E3',
      hintStuck: 'pulse range O5:Q94 · The washes end on row 94.',
      check: (s, ses) => { const sh = tx(ses); return settled(ses) && !!sh && txBlock(sh); } },
    { id: 'working-days', teach: 'NETWORKDAYS(start, end, holidays) counts Monday to Friday between two dates, both ends included, less any date in the holiday list.',
      text: 'On Sites, select Q5:Q10 and enter =NETWORKDAYS(E5,$I$5,$C$13:$C$14) with Ctrl+Enter: working days since each site opened.', keys: 'Ctrl+G "Sites!Q5" ↵ Shift+↓ ×5 "=NETWORKDAYS(E5,$I$5,$C$13:$C$14)" Ctrl+↵', requires: ['networkdays', 'relative-absolute', 'ctrl-enter-fill', 'go-to', 'shift-arrow'],
      hintStuck: 'pulse range Sites!Q5:Q10 · The holidays sit in the Calendar block, C13:C14.',
      check: (s, ses) => settled(ses) && siteDays(ses, 'Q', true) },
    { id: 'trading-days', teach: 'NETWORKDAYS.INTL takes a weekend as seven digits, Monday first, 1 for a day off. "0000000" has no weekend at all: a car wash trades every day but the holidays.',
      text: `Trading days in R5:R10: select them and enter =NETWORKDAYS.INTL(E5,$I$5,"0000000",$C$13:$C$14) with Ctrl+Enter.`, keys: `→ Shift+↓ ×5 '=NETWORKDAYS.INTL(E5,$I$5,"0000000",$C$13:$C$14)' Ctrl+↵`, requires: ['networkdays', 'relative-absolute', 'ctrl-enter-fill', 'shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range R5:R10 · Trading days is the last column of the site block.',
      check: (s, ses) => settled(ses) && siteDays(ses, 'R', false) },
    { id: 'fortnight', text: `On Summary, C62 counts the fortnight’s trading days: =NETWORKDAYS.INTL(C60,C61,"0000000",Sites!$C$13:$C$14) reads 15.`, keys: `Ctrl+G "Summary!C62" ↵ '=NETWORKDAYS.INTL(C60,C61,"0000000",Sites!$C$13:$C$14)' ↵`, requires: ['networkdays', 'cross-sheet-ref', 'relative-absolute', 'go-to'],
      hintStuck: 'pulse cell Summary!C62 · The trading calendar sits under the site blocks, with the period start and end above it.',
      check: (s, ses) => settled(ses) && fortnight(ses) },
    { id: 'per-day', teach: 'The fortnight’s washes in O15:O20 are built in 3.3.3, so the per-day figure reads 0 until then, live and waiting.',
      text: 'Washes per trading day in P15:P20: select them, type =O15/$C$62 and press Ctrl+Enter.', keys: 'Ctrl+G "P15" ↵ Shift+↓ ×5 "=O15/$C$62" Ctrl+↵', requires: ['relative-absolute', 'ctrl-enter-fill', 'go-to', 'shift-arrow'],
      hintStuck: 'pulse range P15:P20 · Per trading day is the last column of the site table.',
      check: (s, ses) => settled(ses) && perDay(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Sites!C14" Enter "9/21/2026" Enter Ctrl+G "Summary!C62" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch a holiday land on 9/21/2026 in Sites!C14: the fortnight’s trading days in C62 drop to 14.', requires: [],
      hintStuck: 'pulse cell Summary!C62 · The holiday now falls inside the fortnight.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Transactions O5:Q94 give every row its weekday, day name and weekend flag', check: (s, ses) => { const sh = tx(ses); return !!sh && txBlock(sh); } },
    { text: 'Sites Q5:R10 count working and trading days since each site opened, less the holidays', check: (s, ses) => siteDays(ses, 'Q', true) && siteDays(ses, 'R', false) },
    { text: 'Summary C62 counts the fortnight’s trading days and P15:P20 divide by it', check: (s, ses) => fortnight(ses) && perDay(ses) },
  ],
  closing: [
    'The calendar is a formula now, holidays included.',
    'Every count reads the one holiday list on Sites, so a site shut for a storm is one more date in the list and every trading-day figure moves with it.',
  ],
  solution: `Ctrl+G "Transactions!O5" Enter "=WEEKDAY(A5,2)" Tab '=TEXT(A5,"ddd")' Tab "=IF(O5>=6,1,0)" Enter Ctrl+G "O94" Enter Shift+Right Shift+Right Ctrl+Shift+Up Ctrl+D Ctrl+G "Sites!Q5" Enter Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "=NETWORKDAYS(E5,$I$5,$C$13:$C$14)" Ctrl+Enter Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down '=NETWORKDAYS.INTL(E5,$I$5,"0000000",$C$13:$C$14)' Ctrl+Enter Ctrl+G "Summary!C62" Enter '=NETWORKDAYS.INTL(C60,C61,"0000000",Sites!$C$13:$C$14)' Enter Ctrl+G "P15" Enter Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "=O15/$C$62" Ctrl+Enter`,
};
