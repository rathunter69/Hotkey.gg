// Chapter 2 · 2.1.1 Built-in formats on a P&L (clearcoat-pnl, S1raw → S1a)
// Clearcoat’s three-year P&L came out of the accounting system as raw numbers: 18000.4 where a
// reader wants 18,000. Every line gets one format, set on the whole line at once: the desk number
// format on the dollar blocks (Ctrl+1 then N, F4 down the page), the same on the memo counts, and
// revenue per wash to the cent. The closer moves C7 and total revenue and EBITDA answer.
import { YEAR_COLS } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog;
/** Every cell in `refs` carries the number format `style` with `dec` decimals. */
const fmtIs = (sh, refs, style, dec) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === style && (c.decimals | 0) === dec; });
const rows = (rs) => YEAR_COLS.flatMap(col => rs.map(r => col + r));
const at = (sh, ref) => sh.selectionText && sh.selectionText() === ref;

const REVENUE = rows([7, 8, 9, 10]);
const SITE_COSTS = rows([13, 14, 15, 16, 17, 18, 19, 20]);
const BOTTOM = rows([22, 23, 24]);
const COUNTS = rows([33, 34]);
const PER_WASH = rows([35]);

export default {
  id: 'built-in-formats-on-a-pnl',
  chapter: 'formatting',
  section: 'Number formats',
  module: 'number-formats',
  workbook: 'clearcoat-pnl',
  state: { before: 'S1raw', after: 'S1a' },
  title: 'Built-in formats on a P&L',
  difficulty: 'medium',
  tags: ['format', 'number-formats', 'pnl'],
  access: 'paid',
  minutes: 5,
  headline: 'Ctrl+1',
  conventions: ['D2', 'D1'],
  teaches: ['line-formats'],
  uses: ['number-formats', 'format-cells-tabs', 'ctrl-shift-arrow', 'ctrl-arrow', 'f4-repeat', 'formula-bar', 'shift-arrow'],
  prerequisites: ['challenge-audit-before-you-send'],
  brief: 'A P&L is what the company earned and spent over a year, top line to bottom line, and this one arrived as raw numbers: 18000.4 where a reader wants 18,000. Every line gets one format, set on the whole line at once: the desk number format from Chapter 1 for dollars in thousands (a separator, no decimals, a negative in parentheses), and the memo lines in their own formats. Ctrl+1 sets it from the Number category, and F4 repeats it on the next block. The key is `Ctrl+1`.',
  goals: [
    { id: 'read-export', text: 'Land on C7 and read 18000.4 in the formula bar, then press Ctrl+↓ to see the revenue lines end at C10.', keys: 'Ctrl+↓ ×2 → ×2 Ctrl+↓', requires: ['ctrl-arrow', 'formula-bar'],
      hintStuck: 'pulse cell C7 · The figures start two columns right of the account codes.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && at(sh, 'C10') && settled(ses); } },
    { id: 'revenue-desk', teach: 'One format per line, set on the whole line at once: in Ctrl+1, Number with 0 decimal places, the separator and (1,234) is the desk number format.', text: 'Select the revenue lines C7:E10 and give them the desk number format from Ctrl+1: Number, 0 decimal places, the separator and (1,234).', keys: 'Ctrl+↑ Ctrl+Shift+→ Ctrl+Shift+↓ Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N ↓ ↓ ↵', requires: ['line-formats', 'format-cells-tabs', 'ctrl-shift-arrow', 'ctrl-arrow'], convention: 'D2',
      hintStuck: 'pulse range C7:E10 · The block runs from retail wash revenue down to its total.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, REVENUE, 'comma', 0) && settled(ses); } },
    { id: 'site-costs-f4', text: 'Select the site costs C13:E20 and repeat the format with F4.', keys: 'Ctrl+↓ ×2 Ctrl+Shift+→ Ctrl+Shift+↓ F4', requires: ['f4-repeat', 'ctrl-shift-arrow', 'ctrl-arrow'], convention: 'D2',
      hintStuck: 'pulse range C13:E20 · F4 repeats the last format on whatever is selected now.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, SITE_COSTS, 'comma', 0) && settled(ses); } },
    { id: 'bottom-f4', text: 'Site contribution, head office and EBITDA in C22:E24 take the same format: select them and press F4.', keys: 'Ctrl+↓ ×2 Ctrl+Shift+→ Ctrl+Shift+↓ F4', requires: ['f4-repeat', 'ctrl-shift-arrow', 'ctrl-arrow'], convention: 'D2',
      hintStuck: 'pulse range C22:E24 · The last block on the page ends on EBITDA.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, BOTTOM, 'comma', 0) && settled(ses); } },
    { id: 'counts-f4', text: 'Sites and washes in C33:E34 are counts that read the same way: select both rows and press F4.', keys: 'Ctrl+↓ ×2 Ctrl+Shift+→ Shift+↓ F4', requires: ['f4-repeat', 'ctrl-shift-arrow', 'shift-arrow'], convention: 'D2',
      hintStuck: 'pulse range C33:E34 · The memo lines sit below the answer, under a gap.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, COUNTS, 'comma', 0) && settled(ses); } },
    { id: 'per-wash-cents', text: 'Revenue per wash in C35:E35 is dollars and cents: select the row and give it two decimals with Ctrl+Shift+1.', keys: '↓ ×2 Ctrl+Shift+→ Ctrl+Shift+1', requires: ['number-formats', 'ctrl-shift-arrow'], convention: 'D2',
      hintStuck: 'pulse range C35:E35 · A ticket of $13.75 needs its cents to read right.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && PER_WASH.every(ref => sh.cellAt(ref).numFmt === '#,##0.00') && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C7" Enter "18500" Enter Ctrl+G "C24" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch C7 change to 18500, and total revenue in C10 and EBITDA in C24 answer in the format you set.', requires: [],
      hintStuck: 'pulse cell C24 · The totals are live, so they move with the line.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Every dollar line reads in the desk number format', check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, [...REVENUE, ...SITE_COSTS, ...BOTTOM], 'comma', 0); } },
    { text: 'Sites and washes read as counts', check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, COUNTS, 'comma', 0); } },
    { text: 'Revenue per wash reads to the cent', check: (s, ses) => { const sh = pnl(ses); return !!sh && PER_WASH.every(ref => sh.cellAt(ref).numFmt === '#,##0.00'); } },
  ],
  closing: [
    'Every line on the P&L now reads as figures, one format per line.',
    'Three blocks of dollars took one dialog and two presses of F4, the counts took a third, and revenue per wash kept its cents. The costs still read as positives and nothing says what the figures are in; the next lesson fixes both.',
  ],
  solution: 'Ctrl+Down Ctrl+Down Right Right Ctrl+Down Ctrl+Up Ctrl+Shift+Right Ctrl+Shift+Down Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N Down Down Enter Ctrl+Down Ctrl+Down Ctrl+Shift+Right Ctrl+Shift+Down F4 Ctrl+Down Ctrl+Down Ctrl+Shift+Right Ctrl+Shift+Down F4 Ctrl+Down Ctrl+Down Ctrl+Shift+Right Shift+Down F4 Down Down Ctrl+Shift+Right Ctrl+Shift+1',
};
