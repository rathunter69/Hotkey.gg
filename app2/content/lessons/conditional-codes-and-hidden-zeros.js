// Chapter 2 · 2.2.4 — Conditional codes and hidden zeros (voltline-pnl, S2c → S2d)
// A section can open with a condition or a colour, and an empty section shows nothing. The
// Monthly kWh line reads 936k or 1.1m by size; the sites-opened and contracts-signed rows hide
// their zeros so a working block reads as marks, not noise; the checks read a red ERROR or OK
// instead of a bare 0 (F1); the last-actual date labels itself. The closer breaks a check.
import { MONTHLY_COLS, HOUSE_FORMATS } from '../workbooks/voltline-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const inputs = ses => sheetOf(ses, 'Inputs');
const monthly = ses => sheetOf(ses, 'Monthly');
const settled = ses => !ses.editing && !ses.dialog;
const rows = (cols, rs) => cols.flatMap(col => rs.map(r => col + r));
const codeIs = (sh, refs, code) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === 'custom' && c.numFmt === code; });

const KWH = rows(MONTHLY_COLS, [6]);
const MARKS = rows(MONTHLY_COLS, [9, 10]);
const MONTHLY_CHECKS = rows(MONTHLY_COLS, [12]);

export default {
  id: 'conditional-codes-and-hidden-zeros',
  chapter: 'formatting',
  section: 'Custom number formats',
  module: 'custom-number-formats',
  workbook: 'voltline-pnl',
  state: { before: 'S2c', after: 'S2d' },
  title: 'Conditional codes and hidden zeros',
  difficulty: 'medium',
  tags: ['format', 'custom-number-formats', 'checks', 'monthly'],
  access: 'paid',
  minutes: 6,
  headline: 'Ctrl+1',
  conventions: ['D3', 'D9', 'F1'],
  teaches: ['conditional-format-code', 'hide-zeros'],
  uses: ['custom-number-format', 'go-to', 'sheet-reference', 'ctrl-shift-arrow', 'shift-arrow', 'check-cell'],
  prerequisites: ['dynamic-headers-with-text'],
  brief: 'A format section can open with a condition or a color, and an empty section shows nothing at all. Let the kWh line pick k or m by size, hide the zeros in the working rows, and make every check read a red ERROR or a plain OK instead of a bare 0. The door is `Ctrl+1`.',
  goals: [
    { id: 'kwh-tiers', teach: 'A section may open with a condition, [>=1000000], and Excel uses the first section whose condition the value meets; \\m adds a single letter without quotes.', text: 'On Monthly, give kWh sold B6:M6 the tiered code [>=1000000]0.0,,\\m;[>=1000]0,\\k;0 so each month reads in k or m by size.', keys: 'Ctrl+G "Monthly!B6" ↵ Ctrl+Shift+→ Ctrl+1 U "[>=1000000]0.0,,\\m;[>=1000]0,\\k;0" ↵', requires: ['conditional-format-code', 'custom-number-format', 'go-to', 'sheet-reference', 'ctrl-shift-arrow'], convention: 'D9',
      check: (s, ses) => { const sh = monthly(ses); return !!sh && codeIs(sh, KWH, HOUSE_FORMATS.kwhTiers) && settled(ses); } },
    { id: 'hide-zeros', teach: 'An empty section shows nothing: #,##0;(#,##0); has a third section with no code, so a zero leaves the cell blank and a working block reads as marks.', text: 'Sites opened and Fleet contracts signed, B9:M10, are mostly zeros: select the two rows and give them #,##0;(#,##0); to hide them.', keys: '↓ ×3 Ctrl+Shift+→ Shift+↓ Ctrl+1 U "#,##0;(#,##0);" ↵', requires: ['hide-zeros', 'custom-number-format', 'ctrl-shift-arrow', 'shift-arrow'], convention: 'D3',
      check: (s, ses) => { const sh = monthly(ses); return !!sh && codeIs(sh, MARKS, HOUSE_FORMATS.hideZeros) && settled(ses); } },
    { id: 'monthly-checks', text: 'The check row B12:M12 reads 0 when it ties: three rows down, select it and give it [Red]ERROR;[Red]ERROR;OK so a tie says OK.', keys: '↓ ×3 Ctrl+Shift+→ Ctrl+1 U "[Red]ERROR;[Red]ERROR;OK" ↵', requires: ['conditional-format-code', 'custom-number-format', 'check-cell', 'ctrl-shift-arrow'], convention: 'F1',
      check: (s, ses) => { const sh = monthly(ses); return !!sh && codeIs(sh, MONTHLY_CHECKS, HOUSE_FORMATS.check) && settled(ses); } },
    { id: 'pnl-check', text: 'The P&L’s check in D23 gets the same code: Go To ’P&L’!D23 and give it [Red]ERROR;[Red]ERROR;OK.', keys: `Ctrl+G "'P&L'!D23" ↵ Ctrl+1 U "[Red]ERROR;[Red]ERROR;OK" ↵`, requires: ['conditional-format-code', 'custom-number-format', 'go-to', 'sheet-reference', 'check-cell'], convention: 'F1',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, ['D23'], HOUSE_FORMATS.check) && settled(ses); } },
    { id: 'actuals-to', text: 'On Inputs, the last actual month in B12 can label itself: give it the code "Actuals to "mmm-yy, quotes included.', keys: `Ctrl+G "Inputs!B12" ↵ Ctrl+1 U '"Actuals to "mmm-yy' ↵`, requires: ['custom-number-format', 'go-to', 'sheet-reference'], convention: 'D9',
      check: (s, ses) => { const sh = inputs(ses); return !!sh && codeIs(sh, ['B12'], HOUSE_FORMATS.actualsTo) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Monthly!B5" Enter "40" Enter Ctrl+G "Monthly!B12" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it catch it? Watch January’s site count in B5 change to 40 and the check in B12 turn into a red ERROR.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'kWh sold reads in k or m by size, and the two working rows hide their zeros', check: (s, ses) => { const sh = monthly(ses); return !!sh && codeIs(sh, KWH, HOUSE_FORMATS.kwhTiers) && codeIs(sh, MARKS, HOUSE_FORMATS.hideZeros); } },
    { text: 'Every check reads OK or a red ERROR', check: (s, ses) => { const m = monthly(ses), p = pnl(ses); return !!m && !!p && codeIs(m, MONTHLY_CHECKS, HOUSE_FORMATS.check) && codeIs(p, ['D23'], HOUSE_FORMATS.check); } },
    { text: 'The last actual month labels itself', check: (s, ses) => { const sh = inputs(ses); return !!sh && codeIs(sh, ['B12'], HOUSE_FORMATS.actualsTo); } },
  ],
  closing: [
    'The working rows read as marks, the kWh line picks its own unit, and every check on the three pages reads OK or shouts ERROR in red the moment two things disagree (D3, D9, F1). Not one of those cells holds anything but a number.',
    'That is the whole house number-format set: four sections, a unit in the code, a condition or a color in front, an empty section to hide. The challenge asks for all of it on a fresh sheet.',
  ],
  solution: `Ctrl+G "Monthly!B6" Enter Ctrl+Shift+Right Ctrl+1 U "[>=1000000]0.0,,\\m;[>=1000]0,\\k;0" Enter Down Down Down Ctrl+Shift+Right Shift+Down Ctrl+1 U "#,##0;(#,##0);" Enter Down Down Down Ctrl+Shift+Right Ctrl+1 U "[Red]ERROR;[Red]ERROR;OK" Enter Ctrl+G "'P&L'!D23" Enter Ctrl+1 U "[Red]ERROR;[Red]ERROR;OK" Enter Ctrl+G "Inputs!B12" Enter Ctrl+1 U '"Actuals to "mmm-yy' Enter`,
};
