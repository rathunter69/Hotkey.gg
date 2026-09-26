// Chapter 2 · 2.1.2 — Sign convention: costs negative (voltline-pnl, S1a → S1b)
// The export writes every cost as a positive figure and subtracts it in the subtotals, so a
// reader cannot tell a cost from a revenue by looking. The house convention is chosen once and
// stated once: income positive, costs negative, subtotals as sums (C4). One -1 parked below the
// page and Paste Special › Multiply flips five cost lines in two pastes; the subtotals are
// rewritten once each and filled right; the units line says what was done; the helper goes.
import { PERIOD_COLS, COST_ROWS, LAST_COL, HELPER_CELL, UNITS_LINE } from '../workbooks/voltline-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog;
const rows = (cols, rs) => cols.flatMap(col => rs.map(r => col + r));
const norm = f => String(f || '').replace(/\s+/g, '').toUpperCase();

const ENERGY = rows(PERIOD_COLS, [9]);
const OPEX_LINES = rows(PERIOD_COLS, [12, 13, 14, 15]);
const COSTS = rows(PERIOD_COLS, COST_ROWS);
/** Every cell in `refs` holds a number at or below zero (a zero month stays a zero). */
const allNegative = (sh, refs) => refs.every(ref => { const v = sh.value(ref); return typeof v === 'number' && v <= 0; });
/** Every period column of `row` carries `=X<a>+X<b>` — the subtotal written as a sum. */
const summed = (sh, row, a, b) => PERIOD_COLS.every(col => norm(sh.cellAt(col + row).formula) === `=${col}${a}+${col}${b}`);
const helperGone = sh => { const c = sh.cellAt(HELPER_CELL); return c.value == null && !c.formula; };

export default {
  id: 'sign-convention-costs-negative',
  chapter: 'formatting',
  section: 'Number formats',
  module: 'number-formats',
  workbook: 'voltline-pnl',
  state: { before: 'S1a', after: 'S1b' },
  title: 'Sign convention: costs negative',
  difficulty: 'medium',
  tags: ['format', 'sign-convention', 'paste-special', 'pnl'],
  access: 'paid',
  minutes: 6,
  headline: 'Ctrl+Alt+V',
  conventions: ['C4', 'D1', 'E4'],
  teaches: ['paste-special-operation'],
  uses: ['go-to', 'copy-cut-paste', 'paste-special', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow', 'fill-down-right', 'formula-basics', 'ctrl-home-end', 'delete-clears'],
  prerequisites: ['built-in-formats-on-a-pnl'],
  brief: 'The export writes every cost as a positive figure and subtracts it later, so nothing on the page says which lines are costs. The house convention is chosen once and stated once: income positive, costs negative, subtotals as sums. One -1 and Paste Special flip five lines in two pastes; the key is `Ctrl+Alt+V`.',
  goals: [
    { id: 'park-minus-one', text: 'Park a -1 well below the page: Go To B30, type -1 and press Enter, step back up onto it and copy it with Ctrl+C.', keys: 'Ctrl+G "B30" ↵ "-1" ↵ ↑ Ctrl+C', requires: ['go-to', 'copy-cut-paste'],
      check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.value(HELPER_CELL) === -1 && !!sh.clipboard && settled(ses); } },
    { id: 'flip-energy', teach: 'Paste Special’s Operation multiplies the copied value into every selected cell: Ctrl+Alt+V, V for values, M for Multiply, Enter — the figures flip, nothing is retyped.', text: 'Energy cost B9:P9 is a cost: jump to B9, select the line with Ctrl+Shift+→, and multiply it by the copied -1 with Paste Special.', keys: 'Ctrl+G "B9" ↵ Ctrl+Shift+→ Ctrl+Alt+V V M ↵', requires: ['paste-special-operation', 'paste-special', 'go-to', 'ctrl-shift-arrow'], convention: 'C4',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && allNegative(sh, ENERGY) && sh.value('B9') < 0 && settled(ses); } },
    { id: 'flip-opex', text: 'The four operating cost lines B12:P15 are costs too: select the block from B12 and multiply it by the same -1 in one paste.', keys: '↓ ×3 Ctrl+Shift+→ Shift+↓ ×3 Ctrl+Alt+V V M ↵', requires: ['paste-special-operation', 'ctrl-shift-arrow', 'shift-arrow'], convention: 'C4',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && allNegative(sh, OPEX_LINES) && sh.value('B12') < 0 && settled(ses); } },
    { id: 'gross-as-sum', text: 'Gross profit still subtracts: in B10 write it as the sum =B8+B9, then fill the line right to P10 with Ctrl+R.', keys: '↑ ×2 "=B8+B9" ↵ ↑ Ctrl+Shift+→ Ctrl+R', requires: ['formula-basics', 'fill-down-right', 'ctrl-shift-arrow'], convention: 'C4',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && summed(sh, 10, 8, 9) && settled(ses); } },
    { id: 'ebitda-as-sum', text: 'EBITDA in B17 becomes the sum =B10+B16 the same way, filled right to P17 with Ctrl+R.', keys: 'Ctrl+↓ ↑ "=B10+B16" ↵ ↑ Ctrl+Shift+→ Ctrl+R', requires: ['formula-basics', 'fill-down-right', 'ctrl-arrow', 'ctrl-shift-arrow'], convention: 'C4',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && summed(sh, 17, 10, 16) && summed(sh, 10, 8, 9) && settled(ses); } },
    { id: 'state-it', text: 'State the convention once, in the units line A2: USD unless stated; costs shown as negatives.', keys: 'Ctrl+Home ↓ "USD unless stated; costs shown as negatives" ↵', requires: ['ctrl-home-end', 'type-to-enter'], convention: 'C4',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.value('A2') === UNITS_LINE && settled(ses); } },
    { id: 'clear-helper', text: 'The -1 in B30 has done its job: Go To B30 and clear it with Delete, so nothing stray sits below the page.', keys: 'Ctrl+G "B30" ↵ Delete', requires: ['go-to', 'delete-clears'],
      check: (s, ses) => { const sh = pnl(ses); return !!sh && helperGone(sh) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "B9" Enter "-5000000" Enter Ctrl+G "B10" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch FY24A’s energy cost in B9 change to (5,000,000) and Gross profit in B10 fall with it, a cost added, not subtracted.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Every cost line B9:P9 and B12:P15 is negative', check: (s, ses) => { const sh = pnl(ses); return !!sh && allNegative(sh, COSTS); } },
    { text: 'Gross profit and EBITDA are sums, one formula per line filled right', check: (s, ses) => { const sh = pnl(ses); return !!sh && summed(sh, 10, 8, 9) && summed(sh, 17, 10, 16); } },
    { text: 'The units line states the convention and the helper cell is empty', check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.value('A2') === UNITS_LINE && helperGone(sh); } },
  ],
  closing: [
    `Costs read in parentheses down every line and every subtotal is a sum, so a reader can tell a cost from a revenue at a glance and never wonders which sign a formula flips (C4, D1). The units line says so once, in A2, and the check in D23 still reads zero all the way to column ${LAST_COL}.`,
    'Two pastes did the work of retyping sixty figures: Paste Special multiplies the copied value into the selection, which is the same dialog that freezes values and copies formats (E4).',
  ],
  solution: 'Ctrl+G "B30" Enter "-1" Enter Up Ctrl+C Ctrl+G "B9" Enter Ctrl+Shift+Right Ctrl+Alt+V V M Enter Down Down Down Ctrl+Shift+Right Shift+Down Shift+Down Shift+Down Ctrl+Alt+V V M Enter Up Up "=B8+B9" Enter Up Ctrl+Shift+Right Ctrl+R Ctrl+Down Up "=B10+B16" Enter Up Ctrl+Shift+Right Ctrl+R Ctrl+Home Down "USD unless stated; costs shown as negatives" Enter Ctrl+G "B30" Enter Delete',
};
