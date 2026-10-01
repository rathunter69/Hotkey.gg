// Chapter 1 · 1.6.1 — Point, don't type (clearcoat-weekly, S5d → S6a)
// The Report holds this week's washes, revenue and wash cost for six sites; the three calculated
// lines beside them (gross profit, average ticket, margin) are built for Domain by pointing:
// = then the arrow keys write each reference, an operator joins them, Enter commits. One formula is
// read back with F2 so the learner sees its precedents lit, then the three are filled down the six
// sites in one press. The fill carries Domain's $ format down the gross-profit column, so Paste
// Special Formats puts the body back in the desk number format ($ belongs to the first and total
// rows only). On Inputs the cost typed inside a formula becomes a reference to its cell, then to
// the name 1.3.5 gave it. The closer perturbs Domain's washes and its average ticket answers.
import { cellFormatCode, isDeskNumberFormat } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const inputs = ses => sheetOf(ses, 'Inputs');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) < 1e-6;
const normFormula = f => String(f || '').replace(/\s|\$/g, '').replace(/^=\+/, '=').toUpperCase();

const SITE_ROWS = [5, 6, 7, 8, 9, 10];   // Domain … Airport; the total row is 11
/** The three calculated lines for row r: gross profit = revenue less wash cost, avg ticket = revenue over washes, margin = gross profit over revenue. */
const LINES = r => ({ F: `=D${r}-E${r}`, G: `=D${r}/C${r}`, H: `=F${r}/D${r}` });
/** `ref` holds exactly `formula` (spacing, $ and a keypad + ignored) and shows a finite number. */
const holds = (sh, ref, formula) => normFormula(sh.formula(ref)) === formula && isNum(sh.value(ref));
/** Row r carries all three lines and each reads the figure its inputs give. */
const rowLive = (sh, r) => {
  const want = LINES(r);
  if (!['F', 'G', 'H'].every(col => holds(sh, col + r, want[col]))) return false;
  const c = sh.value('C' + r), d = sh.value('D' + r), e = sh.value('E' + r);
  return near(sh.value('F' + r), d - e) && near(sh.value('G' + r), d / c) && near(sh.value('H' + r), (d - e) / d);
};
const desk = (sh, refs) => refs.every(ref => isDeskNumberFormat(cellFormatCode(sh.cellAt(ref))));
const fmtIs = (sh, refs, style, dec) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === style && (c.decimals | 0) === dec; });
const FILLED = ['F6', 'F7', 'F8', 'F9', 'F10'];   // the gross-profit cells under Domain's
/** Inputs!B14 reads the cost per wash from its cell (by address or by name) and shows est. washes × $1.50. */
const costRefs = (sh, want) => normFormula(sh.formula('B14')) === want && near(sh.value('B14'), sh.value('B6') * sh.value('B4'));

export default {
  id: 'point-dont-type',
  chapter: 'foundations',
  section: 'Formulas',
  module: 'formulas',
  workbook: 'clearcoat-weekly',
  state: { before: 'S5d', after: 'S6a' },
  title: 'Point, don’t type',
  difficulty: 'medium',
  tags: ['formulas', 'pointing', 'report'],
  access: 'free',
  minutes: 7,
  headline: '=',
  conventions: ['E1', 'D4', 'B4'],
  teaches: ['formula-basics', 'formula-operators', 'pointing'],
  uses: ['edit-mode-f2', 'edit-caret', 'backspace', 'escape-cancels', 'fill-down-right', 'paste-special', 'copy-cut-paste', 'number-formats', 'type-to-enter', 'arrow-keys', 'ctrl-arrow', 'shift-arrow', 'sheet-tabs'],
  prerequisites: ['the-style-pass'],
  brief: 'A formula starts with = and recalculates the moment an input changes, and that’s the difference between a spreadsheet and a calculator. You build one by pointing: type =, walk to the cell with the arrow keys and its address writes itself, type the operator, point at the next cell, Enter, but never type an address you can point at, because typing is where the wrong-cell errors come from. The CFO wants three calculated lines beside the site figures: gross profit, average ticket and margin. Build each once by pointing, then fill them down in one press. The key is `=`.',
  goals: [
    { id: 'gross-profit', teach: 'Type =, press ← twice and D5 writes itself into the formula, type the minus, press ← once for E5, Enter. While a formula is open, each arrow key points at a cell and writes its reference; the cell you’re pointing at is outlined in color. If the cell shows the formula’s text instead of a result, the = is missing, or has a space or an apostrophe in front of it.',
      text: 'Domain’s gross profit is revenue less wash cost: build =D5-E5 in F5 by pointing at the two cells with the arrow keys, not typing them.',
      hintStuck: 'pulse cell F5 · F5, then =, ← ←, the minus, ←, Enter.',
      keys: 'Ctrl+↓ ×2 ↓ Ctrl+→ → "=" ← ×2 "-" ← ↵', requires: ['formula-basics', 'formula-operators', 'pointing', 'ctrl-arrow', 'arrow-keys'], convention: 'E1',
      check: (s, ses) => { const sh = report(ses); return !!sh && holds(sh, 'F5', '=D5-E5') && near(sh.value('F5'), sh.value('D5') - sh.value('E5')) && settled(ses); } },
    { id: 'avg-ticket', teach: 'Ctrl and an arrow works while pointing too, jumping the pointer to the edge the way it jumps the cursor, so a long row costs you no counting.',
      text: 'Domain’s average ticket is revenue divided by washes: build =D5/C5 in G5 by pointing, jumping the pointer across the row with Ctrl+←.',
      hintStuck: 'pulse cell G5 · G5, =, ← three times to D5, /, Ctrl+← twice to A5 then → → to C5, Enter.',
      keys: '→ "=" ← ×3 "/" Ctrl+← ×2 → ×2 ↵', requires: ['formula-operators', 'pointing', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const sh = report(ses); return !!sh && holds(sh, 'G5', '=D5/C5') && near(sh.value('G5'), sh.value('D5') / sh.value('C5')) && settled(ses); } },
    { id: 'margin', teach: 'Third formula, same move. Margin is what’s left of a dollar of revenue after the wash costs, a buyer’s first question about any site.',
      text: 'Domain’s margin is gross profit divided by revenue: build =F5/D5 in H5 the same way.',
      hintStuck: 'pulse cell H5 · H5, =, ← ←, /, Ctrl+← twice to A5 then → three times to D5, Enter.',
      keys: '→ "=" ← ×2 "/" Ctrl+← ×2 → ×3 ↵', requires: ['formula-operators', 'pointing', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const sh = report(ses); return !!sh && holds(sh, 'H5', '=F5/D5') && near(sh.value('H5'), sh.value('F5') / sh.value('D5')) && settled(ses); } },
    { id: 'read-back', teach: 'F2 on a formula colors each reference and outlines the cell it points at, the fastest audit there is. Read a formula before you fill it; a wrong one filled down is six wrong ones.',
      text: 'Read one back before you trust it: open F5 with F2 so its inputs D5 and E5 light up in color on the sheet, then leave it unchanged with Esc.',
      hintStuck: 'pulse cell F5 · F5, F2, look, Esc.',
      keys: '← ×2 F2 Esc', requires: ['edit-mode-f2', 'escape-cancels', 'arrow-keys'],
      check: (s, ses) => { const sh = report(ses); return !!sh && holds(sh, 'F5', '=D5-E5') && ses.keyLog.slice(ses.goalMark || 0).some(e => e.k === 'F2' && e.cell === 'F5') && settled(ses); } },
    { id: 'fill-down', teach: 'Ctrl+D fills the top row’s formulas down the selection, and each reference shifts a row as it goes: D5-E5 becomes D6-E6. That’s a relative reference, and it’s why one formula per row is the rule.',
      text: 'Five sites still have no calculated lines: select F5:H10 with Domain’s three formulas at the top and fill them down with Ctrl+D.',
      hintStuck: 'pulse cells F5:H10 · Land on F5, Shift+→ twice, Shift+↓ five times; Ctrl+D.',
      keys: 'Shift+→ ×2 Shift+↓ ×5 Ctrl+D', requires: ['fill-down-right', 'shift-arrow'],
      check: (s, ses) => { const sh = report(ses); return !!sh && SITE_ROWS.every(r => rowLive(sh, r)) && settled(ses); } },
    { id: 'dollar-back', teach: 'A fill carries formats as well as formulas, so the $ from the first row went with it. Copy E6 and Paste Special Formats (Ctrl+Alt+V, T) onto F6:F10 to put the body back in the desk number format; the $ stays on F5 and the total row. Next time, copy the formulas and Paste Special Formulas (Ctrl+Alt+V, F, from 1.3.4), and the formats underneath are never touched.',
      text: 'The fill carried Domain’s $ sign down the gross-profit column: put F6:F10, and only those, back in the desk number format.',
      hintStuck: 'pulse cells F6:F10 · Copy E6; select F6:F10; Ctrl+Alt+V, T, Enter.',
      keys: '← ↓ Ctrl+C → Shift+↓ ×4 Ctrl+Alt+V T ↵', requires: ['paste-special', 'copy-cut-paste', 'number-formats', 'shift-arrow', 'arrow-keys'], convention: 'D4',
      check: (s, ses) => { const sh = report(ses); return !!sh && desk(sh, FILLED) && fmtIs(sh, ['F5', 'F11'], 'currency', 0) && SITE_ROWS.every(r => rowLive(sh, r)) && settled(ses); } },
    { id: 'cost-cell', teach: 'F2 opens the cell in Edit mode, where the arrows move the caret inside the formula. Backspace the 1.5 out and press F2 again (the status bar, bottom left, goes from Edit to Enter), and now ↑ ten times points at B4, the way the arrows point in a new formula. One input, one cell, every formula references it: when the chemical price changes, B4 changes and B14 follows.',
      text: 'On Inputs, B14 still has the cost typed inside it, =B6*1.5: change it to =B6*B4, so it references the input cell.',
      hintStuck: 'pulse cell B14 on Inputs · Ctrl+PgDn to Inputs; B14, F2, Backspace three times, F2 again, ↑ to B4 (or type B4), Enter.',
      keys: 'Ctrl+PgDn ×2 Ctrl+↓ ↑ → F2 ⌫ ×3 "B4" ↵', requires: ['edit-mode-f2', 'edit-caret', 'backspace', 'type-to-enter', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'], convention: 'B4',
      check: (s, ses) => { const sh = inputs(ses); return !!sh && costRefs(sh, '=B6*B4') && settled(ses); } },
    { id: 'cost-name', teach: 'A name works anywhere an address does, and reads like English. Use names for a handful of key inputs (the price, the rate, the toggle), never for everything; Chapter 4 sets the rules.',
      text: 'Same formula, other way to say it: change B14 to =B6*CostPerWash, the name you gave B4 in 1.3.5.',
      hintStuck: 'pulse cell B14 on Inputs · F2, Backspace twice, type CostPerWash, Enter.',
      keys: 'F2 ⌫ ×2 "CostPerWash" ↵', requires: ['edit-mode-f2', 'backspace', 'type-to-enter'],
      check: (s, ses) => { const sh = inputs(ses); return !!sh && costRefs(sh, '=B6*COSTPERWASH') && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!C5" Enter "300" Enter Ctrl+G "Report!G5" Enter Escape Escape Escape', cadence: 320 },
      teach: 'The three lines are live now. Change one input and every formula that reads it moves. The page is starting to behave like a model.',
      text: 'Does it tie? Change Domain’s washes in C5 to 300 and watch its average ticket in G5 answer.',
      hintStuck: 'pulse cell G5 on Report · Ctrl+PgUp to Report; C5, 300, Enter; G5 moves.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'F5:H10 hold gross profit, average ticket and margin as live formulas, one pattern down every site', check: (s, ses) => { const sh = report(ses); return !!sh && SITE_ROWS.every(r => rowLive(sh, r)); } },
    { text: 'F5 carries the $ and F6:F10 the desk number format', check: (s, ses) => { const sh = report(ses); return !!sh && fmtIs(sh, ['F5'], 'currency', 0) && desk(sh, FILLED); } },
    { text: 'Inputs!B14 reads the cost per wash by its name', check: (s, ses) => { const sh = inputs(ses); return !!sh && costRefs(sh, '=B6*COSTPERWASH'); } },
  ],
  wow: 'Three formulas built by pointing and filled down six sites in one press.',
  closing: [
    '= then the arrow keys wrote D5 and E5 for you, and F2 showed them lit in color when you read them back. One row of three formulas, filled down the sites in one press, and Domain’s average ticket answers the moment its washes change.',
    'Fix from earlier: the cost per wash was typed inside a formula on Inputs. Now it references its own cell, by address or by the name you gave it, and one change moves every formula that reads it.',
    'Desk habit worth knowing: + starts a formula too. Type +D5-E5 and Excel writes =+D5-E5, the same formula, because on a numeric keypad + sits under your hand and = doesn’t, and the analysts who live on the keypad start every formula that way. Here it counts the same as = (M63).',
  ],
  solution: 'Ctrl+Down Ctrl+Down Down Ctrl+Right Right "=" Left Left "-" Left Enter Right "=" Left Left Left "/" Ctrl+Left Ctrl+Left Right Right Enter Right "=" Left Left "/" Ctrl+Left Ctrl+Left Right Right Right Enter Left Left F2 Escape Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Left Down Ctrl+C Right Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+Alt+V T Enter Ctrl+PgDn Ctrl+PgDn Ctrl+Down Up Right F2 Backspace Backspace Backspace "B4" Enter F2 Backspace Backspace "CostPerWash" Enter',
};
