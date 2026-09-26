// Chapter 2 · 2.2.1 — The four-section format (voltline-pnl, S1d → S2a)
// The built-in styles got the page readable; the house's own codes make it exact. A custom
// number format is a code of up to four sections, positive;negative;zero;text, and the house
// set says what each kind of value wears: parentheses for a negative, a dash for a zero, a
// space where a closing parenthesis would sit so the columns align (D1, D3). The block gets the
// plain code in one selection; the $ rows and the margin lines get theirs, F4 repeating a code.
import { PERIOD_COLS, DOLLAR_ROWS, PCT_ROWS, PLAIN_ROWS, HOUSE_FORMATS } from '../workbooks/voltline-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog;
const rows = (cols, rs) => cols.flatMap(col => rs.map(r => col + r));
/** Every cell in `refs` wears the custom code `code`. */
const codeIs = (sh, refs, code) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === 'custom' && c.numFmt === code; });

const row = r => rows(PERIOD_COLS, [r]);
const BLOCK = rows(PERIOD_COLS, [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
const PLAINS = rows(PERIOD_COLS, PLAIN_ROWS);
const DOLLARS = rows(PERIOD_COLS, DOLLAR_ROWS);
const PCTS = rows(PERIOD_COLS, PCT_ROWS);
const anyCode = (sh, refs) => refs.every(ref => sh.cellAt(ref).fmtStyle === 'custom');

export default {
  id: 'the-four-section-format',
  chapter: 'formatting',
  section: 'Custom number formats',
  module: 'custom-number-formats',
  workbook: 'voltline-pnl',
  state: { before: 'S1d', after: 'S2a' },
  title: 'The four-section format',
  difficulty: 'medium',
  tags: ['format', 'custom-number-formats', 'pnl'],
  access: 'paid',
  minutes: 6,
  headline: 'Ctrl+1',
  conventions: ['D3', 'D9', 'D1'],
  teaches: ['custom-number-format'],
  uses: ['format-cells-dialog', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow', 'home-key', 'f4-repeat'],
  prerequisites: ['dates-on-the-timeline'],
  brief: 'The built-in styles got the page readable; the house’s own codes make it exact. A custom format is a code of up to four sections, positive, negative, zero and text, so the same line shows a parenthesis, a dash and a space where a parenthesis would sit. Dress the block in the house set; the door is `Ctrl+1`.',
  goals: [
    { id: 'block-plain', teach: 'Format Cells › Custom, Ctrl+1 then U, takes a code of up to four sections separated by semicolons, positive;negative;zero;text: _) leaves a space the width of a parenthesis.', text: 'Select the figure block B5:P18 and give it the house plain code: Ctrl+1, U, then #,##0_);(#,##0);-_) and Enter.', keys: 'Ctrl+↓ ×2 ↓ → Ctrl+Shift+→ Ctrl+Shift+↓ Ctrl+1 U "#,##0_);(#,##0);-_)" ↵', requires: ['custom-number-format', 'format-cells-dialog', 'ctrl-shift-arrow', 'ctrl-arrow'], convention: 'D3',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, BLOCK, HOUSE_FORMATS.plain) && settled(ses); } },
    { id: 'first-row-dollar', text: 'The first row B5:P5 carries the $: back to B5 with Home and →, select the line and give it $#,##0_);($#,##0);-_) the same way.', keys: 'Home → Ctrl+Shift+→ Ctrl+1 U "$#,##0_);($#,##0);-_)" ↵', requires: ['custom-number-format', 'home-key', 'ctrl-shift-arrow'], convention: 'D9',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, row(5), HOUSE_FORMATS.dollar) && settled(ses); } },
    { id: 'totals-f4', text: 'Total revenue B8:P8 and Gross profit B10:P10 wear the same $ code: select each line in turn and press F4 to repeat it.', keys: '↓ ×3 Ctrl+Shift+→ F4 then ↓ ×2 Ctrl+Shift+→ F4', requires: ['f4-repeat', 'ctrl-shift-arrow'], convention: 'D9',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, [...row(8), ...row(10)], HOUSE_FORMATS.dollar) && settled(ses); } },
    { id: 'gross-margin-code', text: 'Gross margin % B11:P11 gets the percent code 0.0%_);(0.0%);-_), one decimal and the same dash for a zero.', keys: '↓ Ctrl+Shift+→ Ctrl+1 U "0.0%_);(0.0%);-_)" ↵', requires: ['custom-number-format', 'ctrl-shift-arrow'], convention: 'D3',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, row(11), HOUSE_FORMATS.pct) && settled(ses); } },
    { id: 'opex-ebitda-dollar', text: 'Total operating costs and EBITDA, B16:P17, are totals: jump to the foot, up two, select both lines and type the $ code again.', keys: 'Ctrl+↓ ↑ ×2 Ctrl+Shift+→ Shift+↓ Ctrl+1 U "$#,##0_);($#,##0);-_)" ↵', requires: ['custom-number-format', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow'], convention: 'D9',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, [...row(16), ...row(17)], HOUSE_FORMATS.dollar) && settled(ses); } },
    { id: 'ebitda-margin-code', text: 'EBITDA margin % B18:P18 gets the percent code too, so both margins read alike.', keys: '↓ ×2 Ctrl+Shift+→ Ctrl+1 U "0.0%_);(0.0%);-_)" ↵', requires: ['custom-number-format', 'ctrl-shift-arrow'], convention: 'D3',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, row(18), HOUSE_FORMATS.pct) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "E13" Enter "0" Enter Ctrl+G "E16" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch January’s maintenance in E13 go to 0 and read as a dash, and Total operating costs in E16 answer.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The lines between totals wear the plain code, zero as a dash', check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, PLAINS, HOUSE_FORMATS.plain); } },
    { text: 'The first row and the four totals wear the $ code', check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, DOLLARS, HOUSE_FORMATS.dollar); } },
    { text: 'Both margins wear the percent code to one decimal', check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, PCTS, HOUSE_FORMATS.pct) && anyCode(sh, BLOCK); } },
  ],
  closing: [
    'Every figure on the page now wears one of three house codes: a negative in parentheses, a zero as a dash, a positive padded so the columns line up (D1, D3). Nothing was typed beside a number to get there: the format does the labelling (D9).',
    'Ctrl+1 then U opened the Custom box, and F4 repeated a code on the next line the way it repeats any format; the next lessons put units and conditions into the same codes.',
  ],
  solution: 'Ctrl+Down Ctrl+Down Down Right Ctrl+Shift+Right Ctrl+Shift+Down Ctrl+1 U "#,##0_);(#,##0);-_)" Enter Home Right Ctrl+Shift+Right Ctrl+1 U "$#,##0_);($#,##0);-_)" Enter Down Down Down Ctrl+Shift+Right F4 Down Down Ctrl+Shift+Right F4 Down Ctrl+Shift+Right Ctrl+1 U "0.0%_);(0.0%);-_)" Enter Ctrl+Down Up Up Ctrl+Shift+Right Shift+Down Ctrl+1 U "$#,##0_);($#,##0);-_)" Enter Down Down Ctrl+Shift+Right Ctrl+1 U "0.0%_);(0.0%);-_)" Enter',
};
