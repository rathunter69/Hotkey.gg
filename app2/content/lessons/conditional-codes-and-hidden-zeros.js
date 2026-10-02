// Chapter 2 · 2.2.4 Conditional codes and hidden zeros (clearcoat-pnl, S2c → S2d)
// A format section can carry a color and a condition, and an empty section hides a value. The
// checks C39:C40 paint a negative red (F1), washes pick their code by size, the A/E flags hide
// with ;;;, the 1/0 switch on Inputs reads On or Off through another empty section while it stays
// a number a formula can multiply by, and the flags come back with General. The closer types a wrong total and the check turns red.
import { YEAR_COLS, CODES, TYPED } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const inputs = ses => sheetOf(ses, 'Inputs');
const settled = ses => !ses.editing && !ses.dialog;
const codeIs = (sh, refs, code) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === 'custom' && c.numFmt === code; });

const CHECKS = ['C39', 'C40'];
const WASHES = YEAR_COLS.map(col => col + '34');
const FLAG_CELLS = YEAR_COLS.map(col => col + '5');
const flagsShown = sh => FLAG_CELLS.every(ref => { const c = sh.cellAt(ref); return (!c.fmtStyle || c.fmtStyle === 'general') && !c.numFmt; });

export default {
  id: 'conditional-codes-and-hidden-zeros',
  chapter: 'formatting',
  section: 'Custom number formats',
  module: 'custom-number-formats',
  workbook: 'clearcoat-pnl',
  state: { before: 'S2c', after: 'S2d' },
  title: 'Conditional codes and hidden zeros',
  difficulty: 'medium',
  tags: ['format', 'custom-number-formats', 'checks'],
  access: 'paid',
  minutes: 6,
  headline: 'Ctrl+1',
  conventions: ['F1', 'D9', 'D3'],
  teaches: ['conditional-format-code', 'hide-zeros', 'general-format'],
  uses: ['custom-number-format', 'format-cells-tabs', 'go-to', 'sheet-reference', 'ctrl-arrow', 'shift-arrow', 'check-cell'],
  prerequisites: ['dynamic-headers-with-text'],
  brief: 'A format section can carry a color and a condition: [Red] paints a negative, [<1000] applies a code only to small values, and an empty section hides a value altogether. Three semicolons and a cell shows nothing while still holding its number. Use them sparingly; the page’s conventions do most of the talking. Here the checks paint a negative red, the washes pick their code by size, and the flags hide and come back. The key is `Ctrl+1`.',
  goals: [
    { id: 'red-checks', teach: 'A section can open with a color or a condition: [Red] paints that section’s values red, and [<1000] uses a section only for values under 1,000.', text: 'The checks C39:C40 read zero when the page ties: give them 0_);[Red](0);-_) so a negative check paints itself red.', keys: `Ctrl+G "C39" ↵ Shift+↓ Ctrl+1 N Tab End Alt+T "${TYPED.check}" ↵`, requires: ['conditional-format-code', 'custom-number-format', 'check-cell', 'go-to', 'shift-arrow'], convention: 'F1',
      hintStuck: 'pulse range C39:C40 · The checks block sits at the foot of the page.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, CHECKS, CODES.check) && settled(ses); } },
    { id: 'washes-scaled', text: 'Washes in C34:E34 are thousands: give them [<1000]0;#,##0 so a small count and a large one each read right.', keys: `Ctrl+↑ ↑ Shift+→ ×2 Ctrl+1 N Tab End Alt+T "${TYPED.washes}" ↵`, requires: ['conditional-format-code', 'custom-number-format', 'ctrl-arrow', 'shift-arrow'], convention: 'D9',
      hintStuck: 'pulse range C34:E34 · The condition picks the section, not the sign.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, WASHES, CODES.washes) && settled(ses); } },
    { id: 'hide-flags', teach: 'An empty section shows nothing, so ;;; hides every kind of value while the cell still holds it for any formula that reads it.', text: 'Hide the flags C5:E5 with the code ;;; so the cells keep their A and E but the page stops showing them.', keys: `Ctrl+G "C5" ↵ Shift+→ ×2 Ctrl+1 N Tab End Alt+T "${TYPED.hide}" ↵`, requires: ['hide-zeros', 'custom-number-format', 'go-to', 'shift-arrow'], convention: 'D3',
      hintStuck: 'pulse range C5:E5 · Three semicolons and nothing in any section.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, FLAG_CELLS, CODES.hide) && settled(ses); } },
    { id: 'on-off', text: 'On Inputs, the switch in B12 holds a 1: give it On;;Off, with the negative section left empty, so it reads On and still multiplies.', keys: `Ctrl+G "Inputs!B12" ↵ Ctrl+1 N Tab End Alt+T "${TYPED.onOff}" ↵`, requires: ['hide-zeros', 'custom-number-format', 'go-to', 'sheet-reference'], convention: 'D9',
      hintStuck: 'pulse cell B12 · Positive; negative; zero: a 0 would read Off.',
      check: (s, ses) => { const sh = inputs(ses); return !!sh && codeIs(sh, ['B12'], CODES.onOff) && settled(ses); } },
    { id: 'flags-back', teach: 'General is the format with no format: General at the top of Ctrl+1’s list returns a cell to showing its value as typed.', text: 'Back on the P&L, set the flags C5:E5 to General, the top of Ctrl+1’s list, and they show again.', keys: 'Ctrl+G "\'P&L\'!C5:E5" ↵ Ctrl+1 N Tab Home ↵', requires: ['general-format', 'format-cells-tabs', 'go-to', 'sheet-reference'],
      hintStuck: 'pulse range C5:E5 · The A and E never left the cells.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && flagsShown(sh) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "'P&L'!C10" Enter "32000" Enter Ctrl+G "C39" Enter Escape Escape Escape`, cadence: 320 }, text: 'Does it catch it? Watch total revenue in C10 typed over as 32000, and the check in C39 leave zero and turn red.', requires: [],
      hintStuck: 'pulse cell C39 · A typed total no longer matches its lines.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The checks paint a negative red, and the washes read by size', check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, CHECKS, CODES.check) && codeIs(sh, WASHES, CODES.washes); } },
    { text: 'The flags show in General', check: (s, ses) => { const sh = pnl(ses); return !!sh && flagsShown(sh); } },
    { text: 'The switch reads On and is still a number', check: (s, ses) => { const sh = inputs(ses); return !!sh && codeIs(sh, ['B12'], CODES.onOff) && sh.value('B12') === 1; } },
  ],
  closing: [
    'A format can color, scale and hide, and the value never moves.',
    'The checks stay quiet at zero and go red the moment two figures disagree; the switch reads On and still multiplies like the 1 it is. The same On and Off code comes back on the switches of the model in Chapters 5 and 6.',
  ],
  solution: `Ctrl+G "C39" Enter Shift+Down Ctrl+1 N Tab End Alt+T "${TYPED.check}" Enter Ctrl+Up Up Shift+Right Shift+Right Ctrl+1 N Tab End Alt+T "${TYPED.washes}" Enter Ctrl+G "C5" Enter Shift+Right Shift+Right Ctrl+1 N Tab End Alt+T "${TYPED.hide}" Enter Ctrl+G "Inputs!B12" Enter Ctrl+1 N Tab End Alt+T "${TYPED.onOff}" Enter Ctrl+G "\'P&L\'!C5:E5" Enter Ctrl+1 N Tab Home Enter`,
};
