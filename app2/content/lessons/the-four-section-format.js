// Chapter 2 · 2.2.1 The four-section format (clearcoat-pnl, S1d → S2a)
// A number format is a code of up to four sections, positive;negative;zero;text. The desk number
// format is one such code; this lesson writes its own with a dash for zero (D3): the plain code on
// the P&L lines C7:E24 and the memo counts, the $ version on the first and total rows (D4), the
// percent version on the margins block. The closer zeroes FY26E other revenue and it reads as a dash.
import { YEAR_COLS, CODES, TYPED } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog;
const rows = rs => YEAR_COLS.flatMap(col => rs.map(r => col + r));
/** Every cell in `refs` carries the custom code `code`. */
const codeIs = (sh, refs, code) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === 'custom' && c.numFmt === code; });

const PLAINS = rows([8, 9, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23]);
const COUNTS = rows([33, 34]);
const FIRST = rows([7]);
const TOTALS = rows([10, 24]);
const PCTS = [...rows([27, 28, 29]), 'D30', 'E30', 'F30'];

export default {
  id: 'the-four-section-format',
  chapter: 'formatting',
  section: 'Custom number formats',
  module: 'custom-number-formats',
  workbook: 'clearcoat-pnl',
  state: { before: 'S1d', after: 'S2a' },
  title: 'The four-section format',
  difficulty: 'medium',
  tags: ['format', 'custom-number-formats', 'pnl'],
  access: 'paid',
  minutes: 6,
  headline: 'Ctrl+1',
  conventions: ['D3', 'D1', 'D4'],
  teaches: ['custom-number-format'],
  uses: ['format-cells-dialog', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow', 'f4-repeat', 'go-to'],
  prerequisites: ['dates-on-the-timeline'],
  brief: 'A number format is a code with up to four sections separated by semicolons (positive; negative; zero; text), and each section says how that kind of value shows. The desk number format you set in Chapter 1 is one such code, and you’ve been using it without reading it. Write your own: #,##0_) for a positive, (#,##0) for a negative and a dash for zero, and watch a zero become a dash without a formula changing. The key is `Ctrl+1`.',
  goals: [
    { id: 'plain-code', teach: 'In a code, 0 always prints a digit and # only when there is one, and _) leaves a bracket-wide gap so the columns line up.', text: 'Select the P&L lines C7:E24 and type the code #,##0_);(#,##0);-_) into the Custom box at the foot of Ctrl+1’s list.', keys: `Ctrl+↓ ×2 → ×2 Ctrl+↓ ×2 Ctrl+Shift+↓ ×5 Ctrl+Shift+→ Ctrl+1 N Tab End Alt+T "${TYPED.plain}" ↵`, requires: ['custom-number-format', 'format-cells-dialog', 'ctrl-shift-arrow', 'ctrl-arrow'], convention: 'D3',
      hintStuck: 'pulse range C7:E24 · Ctrl+Shift+↓ keeps jumping across the gaps until EBITDA.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, [...PLAINS, ...FIRST, ...TOTALS], CODES.plain) && settled(ses); } },
    { id: 'counts-f4', text: 'The memo counts in C33:E34 take the same code: select them and press F4.', keys: 'Ctrl+G "C33" ↵ Shift+→ ×2 Shift+↓ F4', requires: ['f4-repeat', 'go-to', 'shift-arrow'], convention: 'D3',
      hintStuck: 'pulse range C33:E34 · Sites and washes, under the margins block.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, COUNTS, CODES.plain) && settled(ses); } },
    { id: 'first-row-dollar', text: 'The first row carries the $: select C7:E7 and type $#,##0_);($#,##0);-_) into the Custom box.', keys: `Ctrl+G "C7" ↵ Shift+→ ×2 Ctrl+1 N Tab End Alt+T "${TYPED.dollar}" ↵`, requires: ['custom-number-format', 'go-to', 'shift-arrow'], convention: 'D4',
      hintStuck: 'pulse range C7:E7 · The same code with a $ in front of each number section.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, FIRST, CODES.dollar) && settled(ses); } },
    { id: 'totals-f4', text: 'Total revenue C10:E10 and EBITDA C24:E24 are totals: select each in turn and press F4 to repeat the $ code.', keys: 'Ctrl+↓ Shift+→ ×2 F4 Ctrl+↓ ×4 Shift+→ ×2 F4', requires: ['f4-repeat', 'ctrl-arrow', 'shift-arrow'], convention: 'D4',
      hintStuck: 'pulse range C10:E10 · F4 repeats the code you just typed.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, TOTALS, CODES.dollar) && settled(ses); } },
    { id: 'pct-code', text: 'Give the margins block C27:F30 the percent code 0.0%_);(0.0%);-_), so a zero reads as a dash there too.', keys: `Ctrl+↓ Shift+→ ×3 Shift+↓ ×3 Ctrl+1 N Tab End Alt+T "${TYPED.pct}" ↵`, requires: ['custom-number-format', 'ctrl-arrow', 'shift-arrow'], convention: 'D3',
      hintStuck: 'pulse range C27:F30 · The margins block, CAGR column included.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, PCTS, CODES.pct) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "E9" Enter "0" Enter Ctrl+G "E10" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch other revenue in E9 change to 0 and read as a dash, and total revenue in E10 answer.', requires: [],
      hintStuck: 'pulse cell E9 · The third section decides how a zero reads.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The lines between the totals and the memo counts read in the plain code, zero as a dash', check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, [...PLAINS, ...COUNTS], CODES.plain); } },
    { text: 'The first row and the totals carry the $ code', check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, [...FIRST, ...TOTALS], CODES.dollar); } },
    { text: 'The margins block reads in the percent code', check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, PCTS, CODES.pct); } },
  ],
  closing: [
    'One code with four sections, and the page decides how every kind of value reads.',
    'A negative takes parentheses, a zero takes a dash, and a positive leaves a gap where the bracket would be, so the columns line up. Nothing was typed beside a number to get there; the format does the work, and F4 carried each code to the next block.',
  ],
  solution: `Ctrl+Down Ctrl+Down Right Right Ctrl+Down Ctrl+Down Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Right Ctrl+1 N Tab End Alt+T "${TYPED.plain}" Enter Ctrl+G "C33" Enter Shift+Right Shift+Right Shift+Down F4 Ctrl+G "C7" Enter Shift+Right Shift+Right Ctrl+1 N Tab End Alt+T "${TYPED.dollar}" Enter Ctrl+Down Shift+Right Shift+Right F4 Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Shift+Right Shift+Right F4 Ctrl+Down Shift+Right Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Ctrl+1 N Tab End Alt+T "${TYPED.pct}" Enter`,
};
