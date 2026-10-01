// Chapter 2 · 2.1.3 Currency and percent lines (clearcoat-pnl, S1b → S1c)
// EBITDA is the number a buyer prices from, and a buyer reads it two ways: as dollars and as a
// margin. The margins and growth block goes in under the P&L (B26:B30 labels, C27:E29 margins
// filled right, D30:E30 growth, the two-year CAGR in F30 with its periods counted by COLUMNS), the
// block reads as percentages to one decimal in italic (D2), the $ sits on the first and total rows
// only (D4), and revenue per wash reads in dollars and cents. The closer moves FY26E membership.
import { YEAR_COLS, MARGIN_HEAD, MARGIN_LABELS, CAGR_FORMULA, marginFormulas } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog;
const fmtIs = (sh, refs, style, dec) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === style && (c.decimals | 0) === dec; });
const rows = rs => YEAR_COLS.flatMap(col => rs.map(r => col + r));
const norm = f => String(f || '').replace(/\s+/g, '').toUpperCase();
const formulaIs = (sh, ref, want) => norm(sh.cellAt(ref).formula) === norm(want);
/** Every year column of `row` carries its margins-block formula. */
const marginRow = (sh, row) => YEAR_COLS.every(col => { const f = marginFormulas(col)[row]; return !f || formulaIs(sh, col + row, f); });

const LABELS_OK = sh => sh.value('B26') === MARGIN_HEAD && MARGIN_LABELS.every((t, i) => sh.value('B' + (27 + i)) === t);
const PCT_CELLS = [...rows([27, 28, 29]), 'D30', 'E30', 'F30'];
const pctItalic = sh => fmtIs(sh, PCT_CELLS, 'percent', 1) && PCT_CELLS.every(ref => sh.cellAt(ref).it === true);
const DOLLARS = rows([7, 10, 24]);
const PER_WASH = rows([35]);

export default {
  id: 'currency-and-percent-lines',
  chapter: 'formatting',
  section: 'Number formats',
  module: 'number-formats',
  workbook: 'clearcoat-pnl',
  state: { before: 'S1b', after: 'S1c' },
  title: 'Currency and percent lines',
  difficulty: 'medium',
  tags: ['format', 'number-formats', 'currency', 'percent', 'pnl'],
  access: 'paid',
  minutes: 7,
  headline: 'Ctrl+Shift+5',
  conventions: ['D4', 'D2', 'C3'],
  teaches: ['margins-and-growth', 'cagr'],
  uses: ['number-formats', 'format-cells-tabs', 'keytips', 'bold-italic-underline', 'formula-basics', 'fill-down-right', 'go-to', 'type-to-enter', 'f4-repeat', 'shift-arrow', 'ctrl-arrow'],
  prerequisites: ['sign-convention-costs-negative'],
  brief: 'Head office is the people and systems above the sites; take it off site contribution and what’s left is EBITDA (earnings before interest, tax, depreciation and amortization), the profit from running the washes before financing, tax and the tunnels wearing out, and the number every buyer prices from. A buyer reads it two ways: as dollars, and as a margin (a line as a share of revenue). Add the margins and growth block, format the percentages to one decimal in italic, and put the $ where it belongs: on the first and total rows only. The key is `Ctrl+Shift+5`.',
  goals: [
    { id: 'block-labels', text: 'Type Margins and growth in B26, then Gross margin, Site contribution margin, EBITDA margin and Revenue growth down B27:B30.', keys: 'Ctrl+G "B26" ↵ "Margins and growth" ↵ "Gross margin" ↵ "Site contribution margin" ↵ "EBITDA margin" ↵ "Revenue growth" ↵', requires: ['go-to', 'type-to-enter'],
      hintStuck: 'pulse cell B26 · The block sits under the P&L, labels in column B.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && LABELS_OK(sh) && settled(ses); } },
    { id: 'gross-margin', teach: 'A margin is a line as a share of revenue, and gross margin adds the negative chemicals line to revenue: what is left of each dollar after the wash.', text: 'Type =(C10+C13)/C10 in C27 for gross margin, then select C27:E27 and fill it right with Ctrl+R.', keys: 'Ctrl+↑ ×2 ↓ → "=(C10+C13)/C10" ↵ ↑ Shift+→ ×2 Ctrl+R', requires: ['margins-and-growth', 'formula-basics', 'fill-down-right', 'shift-arrow', 'ctrl-arrow'], convention: 'C3',
      hintStuck: 'pulse cell C27 · Revenue is in row 10 and chemicals and water in row 13.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && marginRow(sh, 27) && settled(ses); } },
    { id: 'contribution-ebitda-margins', text: 'Type =C22/C10 in C28 and =C24/C10 in C29, then select C28:E29 and fill both right with Ctrl+R.', keys: '↓ "=C22/C10" ↵ "=C24/C10" ↵ ↑ ×2 Shift+↓ Shift+→ ×2 Ctrl+R', requires: ['margins-and-growth', 'formula-basics', 'fill-down-right', 'shift-arrow'], convention: 'C3',
      hintStuck: 'pulse range C28:E29 · Each margin divides its line by revenue in row 10.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && marginRow(sh, 28) && marginRow(sh, 29) && settled(ses); } },
    { id: 'growth', text: 'Growth starts in the second year: type =D10/C10-1 in D30, fill it right to E30, and leave C30 empty.', keys: '↓ ×2 → "=D10/C10-1" ↵ ↑ Shift+→ Ctrl+R', requires: ['margins-and-growth', 'formula-basics', 'fill-down-right', 'shift-arrow'], convention: 'C3',
      hintStuck: 'pulse cell D30 · FY24 has no year before it to grow from.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && marginRow(sh, 30) && sh.cellAt('C30').value == null && !sh.cellAt('C30').formula && settled(ses); } },
    { id: 'cagr', teach: 'CAGR, compound annual growth, is the one growth figure a buyer quotes, and COLUMNS(C10:E10)-1 counts its periods, three columns less one, so no 2 gets typed.', text: 'Label F29 CAGR, then put the two-year CAGR in F30: =(E10/C10)^(1/(COLUMNS(C10:E10)-1))-1.', keys: '→ ×2 ↑ "CAGR" ↵ "=(E10/C10)^(1/(COLUMNS(C10:E10)-1))-1" ↵', requires: ['cagr', 'formula-basics', 'type-to-enter'], convention: 'C3',
      hintStuck: 'pulse cell F30 · The last year over the first, to the power of one over the periods.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.value('F29') === 'CAGR' && formulaIs(sh, 'F30', CAGR_FORMULA) && settled(ses); } },
    { id: 'percent-italic', text: 'Select C27:F30 and make it percentages to one decimal with Ctrl+Shift+5 and Alt H 0, then italic with Ctrl+I.', keys: '↑ Shift+← ×3 Shift+↑ ×3 Ctrl+Shift+5 Alt H 0 Ctrl+I', requires: ['number-formats', 'keytips', 'bold-italic-underline', 'shift-arrow'], convention: 'D2',
      hintStuck: 'pulse range C27:F30 · The whole block, the CAGR column included.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && pctItalic(sh) && settled(ses); } },
    { id: 'dollar-rows', text: 'Put the $ on C7:E7, C10:E10 and C24:E24 as currency with no decimals: Ctrl+1, Currency, 0 decimal places, and F4 for the next two.', keys: 'Ctrl+Home Ctrl+↓ ×2 → ×2 Ctrl+↓ Shift+→ ×2 Ctrl+1 N Tab C Alt+D 0 Alt+N ↓ ↓ ↓ ↑ ↵ Ctrl+↓ Shift+→ ×2 F4 Ctrl+↓ ×4 Shift+→ ×2 F4', requires: ['format-cells-tabs', 'f4-repeat', 'go-to', 'shift-arrow', 'ctrl-arrow'], convention: 'D4',
      hintStuck: 'pulse range C7:E7 · The first row and the totals carry the currency sign.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, DOLLARS, 'currency', 0) && settled(ses); } },
    { id: 'per-wash-dollars', text: 'Revenue per wash in C35:E35 is dollars and cents: give it currency with two decimals, Ctrl+Shift+4.', keys: 'Ctrl+↓ ×4 Shift+→ ×2 Ctrl+Shift+4', requires: ['number-formats', 'ctrl-arrow', 'shift-arrow'], convention: 'D4',
      hintStuck: 'pulse range C35:E35 · The memo line at the foot of the page.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, PER_WASH, 'currency', 2) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "E8" Enter "24000" Enter Ctrl+G "E29" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch membership revenue in E8 change to 24000, and EBITDA margin E29 and growth E30 move with it.', requires: [],
      hintStuck: 'pulse cell E29 · Every margin reads revenue, so it moves too.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The margins and growth block is live, one formula per row filled right', check: (s, ses) => { const sh = pnl(ses); return !!sh && LABELS_OK(sh) && [27, 28, 29, 30].every(r => marginRow(sh, r)) && formulaIs(sh, 'F30', CAGR_FORMULA); } },
    { text: 'The block reads as percentages to one decimal, in italic', check: (s, ses) => { const sh = pnl(ses); return !!sh && pctItalic(sh); } },
    { text: 'The $ sits on the first and total rows, and revenue per wash reads in dollars and cents', check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, DOLLARS, 'currency', 0) && fmtIs(sh, PER_WASH, 'currency', 2); } },
  ],
  closing: [
    'The page now says what a buyer asks first: how much, and what share of revenue.',
    'EBITDA runs from 29.6% of revenue in FY24 to 33.2% in FY26E, and revenue compounds at about 23% a year. The $ sits on the first row and the totals, so the eye finds the dollars without the page shouting them.',
  ],
  solution: 'Ctrl+G "B26" Enter "Margins and growth" Enter "Gross margin" Enter "Site contribution margin" Enter "EBITDA margin" Enter "Revenue growth" Enter Ctrl+Up Ctrl+Up Down Right "=(C10+C13)/C10" Enter Up Shift+Right Shift+Right Ctrl+R Down "=C22/C10" Enter "=C24/C10" Enter Up Up Shift+Down Shift+Right Shift+Right Ctrl+R Down Down Right "=D10/C10-1" Enter Up Shift+Right Ctrl+R Right Right Up "CAGR" Enter "=(E10/C10)^(1/(COLUMNS(C10:E10)-1))-1" Enter Up Shift+Left Shift+Left Shift+Left Shift+Up Shift+Up Shift+Up Ctrl+Shift+5 Alt H 0 Ctrl+I Ctrl+Home Ctrl+Down Ctrl+Down Right Right Ctrl+Down Shift+Right Shift+Right Ctrl+1 N Tab C Alt+D 0 Alt+N Down Down Down Up Enter Ctrl+Down Shift+Right Shift+Right F4 Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Shift+Right Shift+Right F4 Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Shift+Right Shift+Right Ctrl+Shift+4',
};
