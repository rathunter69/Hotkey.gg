// Chapter 2 · 2.1.3 — Currency and percent lines (voltline-pnl, S1b → S1c)
// The block reads in comma style, but a page of dollar figures carries its $ on the first row
// and the totals only (D4), and the margin lines read as percentages to one decimal (D2), never
// as the 0 a comma style makes of a fraction. Accounting Number Format puts the $ at the cell's
// left edge with parentheses and a dash for zero; Ctrl+Shift+5 then Alt H 0 does the margins.
import { PERIOD_COLS, DOLLAR_ROWS, PCT_ROWS, PLAIN_ROWS } from '../workbooks/voltline-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog;
const fmtIs = (sh, refs, style, dec) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === style && (c.decimals | 0) === dec; });
const rows = (cols, rs) => cols.flatMap(col => rs.map(r => col + r));

const row = r => rows(PERIOD_COLS, [r]);
const DOLLARS = rows(PERIOD_COLS, DOLLAR_ROWS);
const PCTS = rows(PERIOD_COLS, PCT_ROWS);
const PLAINS = rows(PERIOD_COLS, PLAIN_ROWS);

export default {
  id: 'currency-and-percent-lines',
  chapter: 'formatting',
  section: 'Number formats',
  module: 'number-formats',
  workbook: 'voltline-pnl',
  state: { before: 'S1b', after: 'S1c' },
  title: 'Currency and percent lines',
  difficulty: 'medium',
  tags: ['format', 'number-formats', 'currency', 'percent', 'pnl'],
  access: 'paid',
  minutes: 5,
  headline: 'Alt H A N',
  conventions: ['D4', 'D2', 'D1'],
  teaches: ['accounting-format'],
  uses: ['number-formats', 'keytips', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow'],
  prerequisites: ['sign-convention-costs-negative'],
  brief: 'The block reads in comma style, but a page of dollar figures carries its $ on the first row and the totals only, and the margins still read as 0 because a comma style makes nothing of a fraction. Put the $ where it belongs and the margins in percent, one decimal. The route is `Alt H A N`.',
  goals: [
    { id: 'first-row', teach: 'Accounting Number Format, Alt H A N, puts the $ at the cell’s left edge, negatives in parentheses and zero as a dash: the dress a $ row wears.', text: 'Public charging B5:P5 is the block’s first row: select it and give it Accounting Number Format with Alt H A N.', keys: 'Ctrl+↓ ×2 ↓ → Ctrl+Shift+→ Alt H A N', requires: ['accounting-format', 'keytips', 'ctrl-shift-arrow', 'ctrl-arrow'], convention: 'D4',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, row(5), 'acct', 0) && settled(ses); } },
    { id: 'total-revenue', text: 'Total revenue B8:P8 is a total: three rows down, select the line and give it the same Accounting format.', keys: '↓ ×3 Ctrl+Shift+→ Alt H A N', requires: ['accounting-format', 'ctrl-shift-arrow'], convention: 'D4',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, row(8), 'acct', 0) && settled(ses); } },
    { id: 'gross-profit', text: 'Gross profit B10:P10 is a total too: two rows down, the same selection and the same format.', keys: '↓ ×2 Ctrl+Shift+→ Alt H A N', requires: ['accounting-format', 'ctrl-shift-arrow'], convention: 'D4',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, row(10), 'acct', 0) && settled(ses); } },
    { id: 'gross-margin', text: 'Gross margin % B11:P11 is a fraction: one row down, select it, Ctrl+Shift+5 for percent, then Alt H 0 for one decimal.', keys: '↓ Ctrl+Shift+→ Ctrl+Shift+5 then Alt H 0', requires: ['number-formats', 'ctrl-shift-arrow'], convention: 'D2',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, row(11), 'percent', 1) && settled(ses); } },
    { id: 'opex-ebitda', text: 'Total operating costs and EBITDA, B16:P17, are totals too: jump to the foot, up two, select both lines and apply Alt H A N.', keys: 'Ctrl+↓ ↑ ×2 Ctrl+Shift+→ Shift+↓ Alt H A N', requires: ['accounting-format', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow'], convention: 'D4',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, [...row(16), ...row(17)], 'acct', 0) && settled(ses); } },
    { id: 'ebitda-margin', text: 'EBITDA margin % B18:P18 reads as a percentage to one decimal, like the gross margin above it.', keys: '↓ ×2 Ctrl+Shift+→ Ctrl+Shift+5 then Alt H 0', requires: ['number-formats', 'ctrl-shift-arrow'], convention: 'D2',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, row(18), 'percent', 1) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "B5" Enter "9000000" Enter Ctrl+G "B11" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch FY24A’s public charging in B5 change to $ 9,000,000 and the gross margin in B11 answer to one decimal.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The $ sits on the first row and the four totals, in Accounting format', check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, DOLLARS, 'acct', 0); } },
    { text: 'Both margin lines read as percentages to one decimal', check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, PCTS, 'percent', 1); } },
    { text: 'The lines between keep comma style with no decimals', check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, PLAINS, 'comma', 0); } },
  ],
  closing: [
    'The $ now sits on the first row and the totals only, the lines between read as plain figures, and both margins read as percentages to one decimal: one decimals setting down each line, the currency sign where a reader expects it (D4, D2).',
    'Accounting Number Format did the $ rows in one route each; the same page will wear the house’s own four-section codes in the next module, and this is the shape they reproduce.',
  ],
  solution: 'Ctrl+Down Ctrl+Down Down Right Ctrl+Shift+Right Alt H A N Down Down Down Ctrl+Shift+Right Alt H A N Down Down Ctrl+Shift+Right Alt H A N Down Ctrl+Shift+Right Ctrl+Shift+5 Alt H 0 Ctrl+Down Up Up Ctrl+Shift+Right Shift+Down Alt H A N Down Down Ctrl+Shift+Right Ctrl+Shift+5 Alt H 0',
};
