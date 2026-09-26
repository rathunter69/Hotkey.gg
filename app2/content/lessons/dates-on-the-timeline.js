// Chapter 2 · 2.1.4 — Dates on the timeline (voltline-pnl, S1c → S1d)
// The header row is the export’s: bare years 2024, 2025, 2026 over the annual columns and bare
// serial numbers over the months. A timeline row heads every calculation page (C2): FY24A,
// FY25A, FY26E typed with Tab, the month ends dressed as dates (a date is a number wearing a
// format), the whole row right-aligned over its numbers and bold. The Monthly page gets the
// same month-end headers. The closer undresses P4 to show the serial underneath and dresses it again.
import { PERIOD_COLS, ANNUAL_COLS, MONTH_COLS, MONTHLY_COLS, YEARS } from '../workbooks/voltline-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const monthly = ses => sheetOf(ses, 'Monthly');
const settled = ses => !ses.editing && !ses.dialog;
const rows = (cols, rs) => cols.flatMap(col => rs.map(r => col + r));

const MONTH_HEADS = rows(MONTH_COLS, [4]);
const HEADS = rows(PERIOD_COLS, [4]);
const ROW4 = rows(['A', ...PERIOD_COLS], [4]);
const MONTHLY_HEADS = rows(MONTHLY_COLS, [4]);
const fyLabels = sh => ANNUAL_COLS.every((col, i) => sh.value(col + '4') === YEARS[i]);
const datesOn = (sh, refs) => refs.every(ref => sh.cellAt(ref).fmtStyle === 'date' && typeof sh.value(ref) === 'number');

export default {
  id: 'dates-on-the-timeline',
  chapter: 'formatting',
  section: 'Number formats',
  module: 'number-formats',
  workbook: 'voltline-pnl',
  state: { before: 'S1c', after: 'S1d' },
  title: 'Dates on the timeline',
  difficulty: 'easy',
  tags: ['format', 'dates', 'timeline', 'pnl'],
  access: 'paid',
  minutes: 5,
  headline: 'Ctrl+1',
  conventions: ['C2', 'D6'],
  teaches: ['date-format'],
  uses: ['tab-commits', 'format-cells-tabs', 'ctrl-shift-arrow', 'ctrl-arrow', 'home-key', 'align-command', 'bold-italic-underline', 'go-to', 'sheet-reference'],
  prerequisites: ['currency-and-percent-lines'],
  brief: 'The header row is still the export’s: bare years over the annual columns and bare serial numbers over the months. A timeline row heads every page a reader opens, so label the years the way the book will, dress the month ends as dates, and set the row over its numbers. The key is `Ctrl+1`.',
  goals: [
    { id: 'fy-labels', text: 'The year columns B4:D4 are labelled 2024, 2025, 2026: type FY24A, FY25A and FY26E over them with Tab between, ending on E4.', keys: 'Ctrl+↓ ×2 → "FY24A" Tab "FY25A" Tab "FY26E" Tab', requires: ['tab-commits', 'ctrl-arrow'], convention: 'C2',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fyLabels(sh) && settled(ses); } },
    { id: 'month-dates', teach: 'A date is a serial number of days, and Ctrl+1 then D dresses it as Jan-26: the number underneath still sorts, subtracts and feeds a formula.', text: 'The month headers E4:P4 are bare serials: select them with Ctrl+Shift+→ and dress them as dates, Ctrl+1 then D.', keys: 'Ctrl+Shift+→ Ctrl+1 D', requires: ['date-format', 'format-cells-tabs', 'ctrl-shift-arrow'], convention: 'C2',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && datesOn(sh, MONTH_HEADS) && settled(ses); } },
    { id: 'headers-right', text: 'Headers sit over their numbers: from B4 select the row to P4 and right-align it with Alt H A R.', keys: 'Home → Ctrl+Shift+→ Alt H A R', requires: ['home-key', 'ctrl-shift-arrow', 'align-command'], convention: 'D6',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && HEADS.every(ref => sh.cellAt(ref).align === 'r') && settled(ses); } },
    { id: 'headers-bold', text: 'The whole header row A4:P4 is the timeline: select it from A4 and make it bold with Ctrl+B.', keys: 'Home Ctrl+Shift+→ Ctrl+B', requires: ['home-key', 'ctrl-shift-arrow', 'bold-italic-underline'], convention: 'C2',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && ROW4.every(ref => sh.cellAt(ref).bold === true) && settled(ses); } },
    { id: 'monthly-dates', text: 'The Monthly page heads its columns with the same serials: Go To Monthly!B4, select to M4 and dress them as dates.', keys: 'Ctrl+G "Monthly!B4" ↵ Ctrl+Shift+→ Ctrl+1 D', requires: ['go-to', 'sheet-reference', 'date-format', 'ctrl-shift-arrow'], convention: 'C2',
      check: (s, ses) => { const sh = monthly(ses); return !!sh && datesOn(sh, MONTHLY_HEADS) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "'P&L'!P4" Enter Ctrl+1 G Ctrl+1 D`, cadence: 400 }, text: 'Is it a number? Watch P4 drop its dress with Ctrl+1 G, show the serial 46387 underneath, and take the dress back with Ctrl+1 D.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'B4:D4 read FY24A, FY25A, FY26E and E4:P4 read as month-end dates', check: (s, ses) => { const sh = pnl(ses); return !!sh && fyLabels(sh) && datesOn(sh, MONTH_HEADS); } },
    { text: 'The header row is bold and right-aligned over its numbers', check: (s, ses) => { const sh = pnl(ses); return !!sh && HEADS.every(ref => sh.cellAt(ref).align === 'r') && ROW4.every(ref => sh.cellAt(ref).bold === true); } },
    { text: 'Monthly’s headers B4:M4 read as dates', check: (s, ses) => { const sh = monthly(ses); return !!sh && datesOn(sh, MONTHLY_HEADS); } },
  ],
  closing: [
    'One timeline row heads the page, FY24A to FY26E then Jan-26 to Dec-26, bold and right-aligned over its numbers (C2, D6). The A and E in the labels say which years are actual and which is an estimate, so a reader never has to ask.',
    'The month headers are still numbers underneath: a date is a serial of days wearing a format, which is why the next module can build labels from them with TEXT.',
  ],
  solution: 'Ctrl+Down Ctrl+Down Right "FY24A" Tab "FY25A" Tab "FY26E" Tab Ctrl+Shift+Right Ctrl+1 D Home Right Ctrl+Shift+Right Alt H A R Home Ctrl+Shift+Right Ctrl+B Ctrl+G "Monthly!B4" Enter Ctrl+Shift+Right Ctrl+1 D',
};
