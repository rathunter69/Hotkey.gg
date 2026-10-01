// Chapter 2 · 2.2.2 Units in the format: k, m, x, bps (clearcoat-pnl, S2a → S2b)
// The figures are in thousands, and a page that says so once at the top is fine until a figure
// travels alone. The unit can live in the format (D9): FY26E revenue on Inputs reads 50.0m (a comma
// divides by a thousand), revenue per site 1,250k, the illustrative multiple, typed as text with
// its x, is retyped as a number and coded 0.0x, the margin change reads in bps, and revenue per
// wash on the P&L carries "/wash". The closer changes the multiple and the x stays in the format.
import { YEAR_COLS, CODES, TYPED, MULTIPLE } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const inputs = ses => sheetOf(ses, 'Inputs');
const settled = ses => !ses.editing && !ses.dialog;
const codeIs = (sh, refs, code) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === 'custom' && c.numFmt === code; });

const PER_WASH = YEAR_COLS.map(col => col + '35');
const retyped = sh => sh.value('B13') === MULTIPLE;

export default {
  id: 'units-in-the-format',
  chapter: 'formatting',
  section: 'Custom number formats',
  module: 'custom-number-formats',
  workbook: 'clearcoat-pnl',
  state: { before: 'S2a', after: 'S2b' },
  title: 'Units in the format: k, m, x, bps',
  difficulty: 'medium',
  tags: ['format', 'custom-number-formats', 'units', 'inputs'],
  access: 'paid',
  minutes: 6,
  headline: 'Ctrl+1',
  conventions: ['D9', 'C5'],
  teaches: ['format-units'],
  uses: ['custom-number-format', 'go-to', 'sheet-reference', 'type-to-enter', 'shift-arrow'],
  prerequisites: ['the-four-section-format'],
  brief: 'The figures are in thousands, and a page that says so once at the top is fine, until a figure travels alone onto a slide or into an email. The unit can live in the format: a literal "k" after the number, "m" with a comma that divides by a thousand, "x" for a multiple, "bps" for a spread. The value stays a plain number that formulas can read; only the display carries the unit. The key is `Ctrl+1`.',
  goals: [
    { id: 'revenue-m', teach: 'A comma after the last digit divides the display by a thousand and text in quotes rides along, so 50000 thousand reads 50.0m while the cell still holds 50000.', text: 'On Inputs, show FY26E revenue in B15 in millions: give it #,##0.0,"m" in the Custom box.', keys: `Ctrl+G "Inputs!B15" ↵ Ctrl+1 N Tab End Alt+T '${TYPED.millions}' ↵`, requires: ['format-units', 'custom-number-format', 'go-to', 'sheet-reference'], convention: 'D9',
      hintStuck: 'pulse cell B15 · The comma before the quotes does the dividing.',
      check: (s, ses) => { const sh = inputs(ses); return !!sh && codeIs(sh, ['B15'], CODES.millions) && settled(ses); } },
    { id: 'per-site-k', text: 'Revenue per site in B16 is already in thousands: give it #,##0k so it reads 1,250k.', keys: `↓ Ctrl+1 N Tab End Alt+T "${TYPED.thousandsK}" ↵`, requires: ['format-units', 'custom-number-format'], convention: 'D9',
      hintStuck: 'pulse cell B16 · No comma this time: the figure is in thousands already.',
      check: (s, ses) => { const sh = inputs(ses); return !!sh && codeIs(sh, ['B16'], CODES.thousandsK) && settled(ses); } },
    { id: 'retype-multiple', text: 'The multiple in B13 was typed as text, 12.0x, and no formula can use it: retype it as the number 12.', keys: `↑ ×3 "${MULTIPLE}" ↵`, requires: ['type-to-enter'], convention: 'D9',
      hintStuck: 'pulse cell B13 · Text sits left in its cell; a number sits right.',
      check: (s, ses) => { const sh = inputs(ses); return !!sh && retyped(sh) && settled(ses); } },
    { id: 'multiple-x', text: 'Give B13 the code 0.0x, so the x lives in the format and the 12 stays a number.', keys: `↑ Ctrl+1 N Tab End Alt+T "${TYPED.multiple}" ↵`, requires: ['format-units', 'custom-number-format'], convention: 'D9',
      hintStuck: 'pulse cell B13 · The Custom box quotes the x for you.',
      check: (s, ses) => { const sh = inputs(ses); return !!sh && retyped(sh) && codeIs(sh, ['B13'], CODES.multiple) && settled(ses); } },
    { id: 'bps', text: 'The margin change in B14 is a spread: give it the code 0 bps.', keys: `↓ Ctrl+1 N Tab End Alt+T "${TYPED.bps}" ↵`, requires: ['format-units', 'custom-number-format'], convention: 'D9',
      hintStuck: 'pulse cell B14 · A basis point is a hundredth of a percent.',
      check: (s, ses) => { const sh = inputs(ses); return !!sh && codeIs(sh, ['B14'], CODES.bps) && settled(ses); } },
    { id: 'per-wash', text: 'On the P&L, give revenue per wash C35:E35 the code $0.00" /wash" so the unit travels with it.', keys: `Ctrl+G "'P&L'!C35" ↵ Shift+→ ×2 Ctrl+1 N Tab End Alt+T '${TYPED.perWash}' ↵`, requires: ['format-units', 'custom-number-format', 'go-to', 'sheet-reference', 'shift-arrow'], convention: 'D9',
      hintStuck: 'pulse range C35:E35 · Text in quotes prints exactly as typed, space and all.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, PER_WASH, CODES.perWash) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!B13" Enter "13.5" Enter Escape Escape Escape', cadence: 320 }, text: 'Is it a number? Watch the multiple in Inputs B13 change to 13.5 and read 13.5x: the x lives in the format.', requires: [],
      hintStuck: 'pulse cell B13 · The cell holds 13.5; the format adds the x.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'On Inputs, revenue reads in millions, revenue per site in k, the multiple in x and the spread in bps', check: (s, ses) => { const sh = inputs(ses); return !!sh && codeIs(sh, ['B15'], CODES.millions) && codeIs(sh, ['B16'], CODES.thousandsK) && codeIs(sh, ['B13'], CODES.multiple) && codeIs(sh, ['B14'], CODES.bps); } },
    { text: 'The multiple is a number', check: (s, ses) => { const sh = inputs(ses); return !!sh && retyped(sh); } },
    { text: 'Revenue per wash carries its unit', check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, PER_WASH, CODES.perWash); } },
  ],
  closing: [
    'The unit rides in the format, so the number stays a number.',
    'Revenue reads 50.0m, a site 1,250k, the multiple 12.0x and the spread 356 bps, and every one of those cells holds a plain number a formula can link to. The Custom box quoted the letters for you: what you typed as 0.0x it stored as 0.0"x", which is what Excel’s box does.',
  ],
  solution: `Ctrl+G "Inputs!B15" Enter Ctrl+1 N Tab End Alt+T '${TYPED.millions}' Enter Down Ctrl+1 N Tab End Alt+T "${TYPED.thousandsK}" Enter Up Up Up "${MULTIPLE}" Enter Up Ctrl+1 N Tab End Alt+T "${TYPED.multiple}" Enter Down Ctrl+1 N Tab End Alt+T "${TYPED.bps}" Enter Ctrl+G "'P&L'!C35" Enter Shift+Right Shift+Right Ctrl+1 N Tab End Alt+T '${TYPED.perWash}' Enter`,
};
