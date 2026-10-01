// Chapter 2 · 2.2.3 Custom date codes on the timeline (clearcoat-pnl, S2b → S2c)
// (The live id is kept from the earlier build; the lesson now teaches date codes, and TEXT moves
// to module 2.6.) The timeline holds real dates, and a custom date code makes them read the way
// the book does: "FY"yy on C4:E4, then "FY"yy"A" on the actual years and "FY"yy"E" on the
// estimate. Monthly’s month ends arrive as bare serials and take mmm-yy, and its header row sits
// right over its figures (D6). The closer rolls C4 forward a year and the header follows.
import { YEAR_COLS, CODES, TYPED, MONTH_COLS, FULL_YEAR_COL } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const monthly = ses => sheetOf(ses, 'Monthly');
const settled = ses => !ses.editing && !ses.dialog;
const codeIs = (sh, refs, code) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === 'custom' && c.numFmt === code; });

const HEADS = YEAR_COLS.map(col => col + '4');
const MONTH_HEADS = MONTH_COLS.map(col => col + '4');
const MONTHLY_ROW = [...MONTH_HEADS, FULL_YEAR_COL + '4'];
const monthsAsDates = sh => MONTH_HEADS.every(ref => sh.cellAt(ref).fmtStyle === 'date' && typeof sh.value(ref) === 'number');

export default {
  id: 'dynamic-headers-with-text',
  chapter: 'formatting',
  section: 'Custom number formats',
  module: 'custom-number-formats',
  workbook: 'clearcoat-pnl',
  state: { before: 'S2b', after: 'S2c' },
  title: 'Custom date codes on the timeline',
  difficulty: 'medium',
  tags: ['format', 'custom-number-formats', 'dates', 'timeline'],
  access: 'paid',
  minutes: 5,
  headline: 'Ctrl+1',
  conventions: ['D9', 'C2', 'D6'],
  teaches: ['custom-date-code'],
  uses: ['custom-number-format', 'date-format', 'format-cells-tabs', 'go-to', 'sheet-reference', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow', 'align-command'],
  prerequisites: ['units-in-the-format'],
  brief: 'The timeline holds real dates, and a custom date code can make them read the way the book does: FY24A, FY25A, FY26E. The code "FY"yy writes FY and the two-digit year from the date; for now the A or E rides in the code, and in module 2.6 the header writes itself in one cell. The parts you will use most are yy and yyyy for the year, mmm and mmmm for the month, and d and dd for the day. The key is `Ctrl+1`.',
  goals: [
    { id: 'fy-code', teach: 'A date code writes a date its own way: yy is the two-digit year and text in quotes rides along, so "FY"yy reads FY24 from 12/31/2024.', text: 'Select the timeline C4:E4 and give it the custom code "FY"yy, so the dates read FY24, FY25 and FY26.', keys: `Ctrl+↓ ×2 → ×2 Shift+→ ×2 Ctrl+1 N Tab End Alt+T '"FY"yy' ↵`, requires: ['custom-date-code', 'custom-number-format', 'ctrl-arrow', 'shift-arrow'], convention: 'D9',
      hintStuck: 'pulse range C4:E4 · The dates are still there under Dec-24.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, HEADS, '"FY"yy') && settled(ses); } },
    { id: 'actual-code', text: 'The actual years say so: select C4:D4 and give them the code "FY"yy"A".', keys: `Shift+← Ctrl+1 N Tab End Alt+T '${TYPED.fyActual}' ↵`, requires: ['custom-date-code', 'shift-arrow'], convention: 'D9',
      hintStuck: 'pulse range C4:D4 · The A flags in row 5 sit under these two.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, ['C4', 'D4'], CODES.fyActual) && settled(ses); } },
    { id: 'estimate-code', text: 'And the estimate: give E4 the code "FY"yy"E".', keys: `→ ×2 Ctrl+1 N Tab End Alt+T '${TYPED.fyEstimate}' ↵`, requires: ['custom-date-code'], convention: 'D9',
      hintStuck: 'pulse cell E4 · The one year still running.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, ['C4', 'D4'], CODES.fyActual) && codeIs(sh, ['E4'], CODES.fyEstimate) && settled(ses); } },
    { id: 'monthly-dates', text: 'On Monthly, the month ends in C4:N4 arrived as bare serials: select the header row and show them as dates with Ctrl+1, Date, mmm-yy.', keys: 'Ctrl+G "Monthly!C4" ↵ Ctrl+Shift+→ Ctrl+1 N Tab D Alt+T ↓ ×7 ↵', requires: ['date-format', 'format-cells-tabs', 'go-to', 'sheet-reference', 'ctrl-shift-arrow'], convention: 'C2',
      hintStuck: 'pulse range C4:N4 · 46053 is January 31, 2026 in days.',
      check: (s, ses) => { const sh = monthly(ses); return !!sh && monthsAsDates(sh) && settled(ses); } },
    { id: 'monthly-right', text: 'Headers sit over their figures: right-align Monthly’s header row C4:O4 with Alt H A R.', keys: 'Alt H A R', requires: ['align-command'], convention: 'D6',
      hintStuck: 'pulse range C4:O4 · The selection from the last step is still the one you want.',
      check: (s, ses) => { const sh = monthly(ses); return !!sh && MONTHLY_ROW.every(ref => sh.cellAt(ref).align === 'r') && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "'P&L'!C4" Enter "12/31/2025" Enter Escape Escape Escape`, cadence: 320 }, text: 'Does it tie? Watch C4 on the P&L change to 12/31/2025 and read FY25A: the code reads whatever date is underneath.', requires: [],
      hintStuck: 'pulse cell C4 · Only the date changed; the code stayed.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The timeline reads FY24A, FY25A, FY26E from its dates', check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, ['C4', 'D4'], CODES.fyActual) && codeIs(sh, ['E4'], CODES.fyEstimate); } },
    { text: 'Monthly’s month ends read as dates, right-aligned', check: (s, ses) => { const sh = monthly(ses); return !!sh && monthsAsDates(sh) && MONTHLY_ROW.every(ref => sh.cellAt(ref).align === 'r'); } },
  ],
  closing: [
    'The headers read FY24A to FY26E, and every one of them is still a date underneath.',
    'The code took the year from the date and the letters from the quotes, so rolling the page forward is one edit to a date. Monthly reads Jan-26 to Dec-26 the same way: a date shown through a format, never a label typed over it.',
  ],
  solution: `Ctrl+Down Ctrl+Down Right Right Shift+Right Shift+Right Ctrl+1 N Tab End Alt+T '"FY"yy' Enter Shift+Left Ctrl+1 N Tab End Alt+T '${TYPED.fyActual}' Enter Right Right Ctrl+1 N Tab End Alt+T '${TYPED.fyEstimate}' Enter Ctrl+G "Monthly!C4" Enter Ctrl+Shift+Right Ctrl+1 N Tab D Alt+T Down Down Down Down Down Down Down Enter Alt H A R`,
};
