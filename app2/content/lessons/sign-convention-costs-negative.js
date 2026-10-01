// Chapter 2 · 2.1.2 Sign convention: costs negative, stated once (clearcoat-pnl, S1a → S1b)
// The export shows every cost as a positive and subtracts it in the subtotals, so a reader has to
// know which lines to take away. The page shows costs as negatives and says so once at the top
// (C4): a -1 parked in G19 and Paste Special Multiply flip the site costs (C13:E19, stopping
// above the total, since paste arithmetic would rewrite a formula) and head office; site
// contribution and EBITDA become sums, filled right; the spare is cleared; A2 states the
// convention in italic. The closer types rent as (4500), the way the page shows a cost.
import { YEAR_COLS, SPARE_CELL, UNITS_LINE } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog;
const rows = rs => YEAR_COLS.flatMap(col => rs.map(r => col + r));
const norm = f => String(f || '').replace(/\s+/g, '').toUpperCase();

const SITE_COSTS = rows([13, 14, 15, 16, 17, 18, 19]);
const HEAD_OFFICE = rows([23]);
/** Every cell in `refs` holds a number below zero. */
const allNegative = (sh, refs) => refs.every(ref => { const v = sh.value(ref); return typeof v === 'number' && v < 0; });
/** Every year column of `row` carries `=X<a>+X<b>`: the subtotal written as a sum. */
const summed = (sh, row, a, b) => YEAR_COLS.every(col => norm(sh.cellAt(col + row).formula) === `=${col}${a}+${col}${b}`);
const spareGone = sh => { const c = sh.cellAt(SPARE_CELL); return c.value == null && !c.formula; };
const stated = sh => { const c = sh.cellAt('A2'); return c.value === UNITS_LINE && c.it === true; };

export default {
  id: 'sign-convention-costs-negative',
  chapter: 'formatting',
  section: 'Number formats',
  module: 'number-formats',
  workbook: 'clearcoat-pnl',
  state: { before: 'S1a', after: 'S1b' },
  title: 'Sign convention: costs negative, stated once',
  difficulty: 'medium',
  tags: ['format', 'sign-convention', 'paste-special', 'pnl'],
  access: 'paid',
  minutes: 6,
  headline: 'Ctrl+Alt+V',
  conventions: ['C4', 'C5', 'D1', 'E4'],
  teaches: ['paste-special-operation'],
  uses: ['copy-cut-paste', 'paste-special', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow', 'fill-down-right', 'formula-basics', 'ctrl-home-end', 'delete-clears', 'type-to-enter', 'bold-italic-underline'],
  prerequisites: ['built-in-formats-on-a-pnl'],
  brief: 'The export shows every cost as a positive, so a reader has to know which lines to subtract. On a page we show costs as negatives, in parentheses, and say so once at the top: then the page adds down and nobody guesses the signs. Chemicals and water are the cost of a wash; the crew, rent, utilities, maintenance, card fees and marketing are the site costs a site pays whether or not a car comes through. Paste Special Multiply flips a whole block in one paste. The key is `Ctrl+Alt+V`.',
  goals: [
    { id: 'park-minus-one', text: 'Type -1 in the spare cell G19, beside the last cost line, then copy it with Ctrl+C.', keys: 'Ctrl+↓ ×5 Ctrl+→ → ×2 "-1" ↵ ↑ Ctrl+C', requires: ['copy-cut-paste', 'ctrl-arrow', 'type-to-enter'],
      hintStuck: 'pulse cell G19 · The spare cell sits one empty column right of the figures.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.value(SPARE_CELL) === -1 && !!sh.clipboard && settled(ses); } },
    { id: 'flip-site-costs', teach: 'Paste Special Multiply, Ctrl+Alt+V then V and M, multiplies every selected cell by the copied value, so one -1 flips a whole block.', text: 'Select the cost lines C13:E19, stopping above the total in row 20, and Paste Special Multiply with Ctrl+Alt+V, V, M, Enter.', keys: 'Ctrl+← ← ×2 Ctrl+Shift+↑ Ctrl+Shift+→ Ctrl+Alt+V V M ↵', requires: ['paste-special-operation', 'paste-special', 'ctrl-arrow', 'ctrl-shift-arrow'], convention: 'C4',
      hintStuck: 'pulse range C13:E19 · Row 20 is a formula; paste arithmetic would rewrite it.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && allNegative(sh, SITE_COSTS) && settled(ses); } },
    { id: 'flip-head-office', text: 'Head office in C23:E23 is a cost too: select the line and multiply it by the same -1.', keys: 'Ctrl+↓ ×2 ↓ Ctrl+Shift+→ Ctrl+Alt+V V M ↵', requires: ['paste-special-operation', 'ctrl-arrow', 'ctrl-shift-arrow'], convention: 'C4',
      hintStuck: 'pulse range C23:E23 · The -1 is still on the clipboard.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && allNegative(sh, HEAD_OFFICE) && settled(ses); } },
    { id: 'contribution-sum', text: 'Site contribution still subtracts: type =C10+C20 in C22, then select C22:E22 and fill it right with Ctrl+R.', keys: '↑ "=C10+C20" ↵ ↑ Ctrl+Shift+→ Ctrl+R', requires: ['formula-basics', 'fill-down-right', 'ctrl-shift-arrow'], convention: 'C4',
      hintStuck: 'pulse cell C22 · Costs are negative now, so the total adds them.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && summed(sh, 22, 10, 20) && settled(ses); } },
    { id: 'ebitda-sum', text: 'EBITDA in C24 becomes =C22+C23 the same way, filled right across C24:E24 with Ctrl+R.', keys: '↓ ×2 "=C22+C23" ↵ ↑ Ctrl+Shift+→ Ctrl+R', requires: ['formula-basics', 'fill-down-right', 'ctrl-shift-arrow'], convention: 'C4',
      hintStuck: 'pulse cell C24 · Head office is negative too, so EBITDA adds it.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && summed(sh, 24, 22, 23) && summed(sh, 22, 10, 20) && settled(ses); } },
    { id: 'clear-spare', text: 'The -1 in G19 has done its job: go back to it and clear it with Delete.', keys: 'Ctrl+↑ ×2 ↑ Ctrl+→ → ×2 Delete', requires: ['delete-clears', 'ctrl-arrow'],
      hintStuck: 'pulse cell G19 · Nothing stray stays beside the page.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && spareGone(sh) && settled(ses); } },
    { id: 'state-it', text: 'State the convention once: in A2 type USD thousands unless stated; costs shown as negatives, then make it italic.', keys: 'Ctrl+Home ↓ "USD thousands unless stated; costs shown as negatives" ↵ ↑ Ctrl+I', requires: ['ctrl-home-end', 'type-to-enter', 'bold-italic-underline'], convention: 'C5',
      hintStuck: 'pulse cell A2 · The units line sits right under where the title will go.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && stated(sh) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C15" Enter "(4500)" Enter Ctrl+G "C24" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch rent in C15 typed as (4500), parentheses and all, and site contribution C22 and EBITDA C24 fall.', requires: [],
      hintStuck: 'pulse cell C24 · Excel reads parentheses as a minus.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Every cost line is negative', check: (s, ses) => { const sh = pnl(ses); return !!sh && allNegative(sh, [...SITE_COSTS, ...HEAD_OFFICE]); } },
    { text: 'Site contribution and EBITDA add down, one formula per row filled right', check: (s, ses) => { const sh = pnl(ses); return !!sh && summed(sh, 22, 10, 20) && summed(sh, 24, 22, 23); } },
    { text: 'The units line states the convention and the spare cell is empty', check: (s, ses) => { const sh = pnl(ses); return !!sh && stated(sh) && spareGone(sh); } },
  ],
  closing: [
    'Costs read in parentheses, the page says so once, and the totals add straight down.',
    'Two pastes did the work of retyping twenty-four figures: Paste Special multiplies the copied value into the selection, the same dialog that pastes values and formats. Stopping above row 20 kept the total a formula, so it still adds whatever the lines say.',
  ],
  solution: 'Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Right Right Right "-1" Enter Up Ctrl+C Ctrl+Left Left Left Ctrl+Shift+Up Ctrl+Shift+Right Ctrl+Alt+V V M Enter Ctrl+Down Ctrl+Down Down Ctrl+Shift+Right Ctrl+Alt+V V M Enter Up "=C10+C20" Enter Up Ctrl+Shift+Right Ctrl+R Down Down "=C22+C23" Enter Up Ctrl+Shift+Right Ctrl+R Ctrl+Up Ctrl+Up Up Ctrl+Right Right Right Delete Ctrl+Home Down "USD thousands unless stated; costs shown as negatives" Enter Up Ctrl+I',
};
