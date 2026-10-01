// Chapter 1 · 1.6.3 — Anchors: $ and F4 (clearcoat-weekly, S6b → S6c)
// The CFO wants each site's weekly wash cost at three prices: a small grid beside the report, sites
// down, prices across. One formula does the whole grid if its two references are anchored the right
// way: $C5 stays on the washes column when filled right, J$4 stays on the price row when filled
// down. F4 cycles the anchor states on the reference under the caret, so the learner never types a
// $, and reads the formula bar after each press. The formula is written once, put in the counts
// format, filled right and down, and read back from the middle of the grid with F2. The closer
// changes one price and the whole column under it answers.
import { SCENARIO_PRICES, REPORT } from '../workbooks/clearcoat-weekly.js';
import { cellFormatCode, isDeskNumberFormat } from '../../app/graders.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const report = ses => { const e = ses.sheets.find(x => x.name === 'Report'); return e ? e.sheet : null; };
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) < 1e-6;
/** A formula with its anchors kept: spacing and case ignored, every $ counted. */
const anchored = f => String(f || '').replace(/\s/g, '').toUpperCase();
const blank = c => c.value == null && c.formula == null;

const HEAD = 'Wash cost at price ($/wk)';
const PRICE_COLS = ['J', 'K', 'L'];            // the three price scenarios across J4:L4
const PRICE_ROW = 4;
const { siteRows } = REPORT;                   // 5–10, Domain … Airport
/** Every price sits in its cell, typed, not a formula. */
const pricesTyped = sh => PRICE_COLS.every((col, j) => sh.value(col + PRICE_ROW) === SCENARIO_PRICES[j] && !sh.cellAt(col + PRICE_ROW).formula);
/** The prices are inputs: blue, currency with two decimals, and not bold. */
const pricesStyled = sh => PRICE_COLS.every(col => { const c = sh.cellAt(col + PRICE_ROW); return c.fontColor === 'blue' && c.fmtStyle === 'currency' && (c.decimals | 0) === 2 && !c.bold; });
/** `col` row r holds the mixed-anchor formula =$C{r}*{col}$4 and reads the site's washes times that price. */
const gridCell = (sh, col, r) => { const want = [`=$C${r}*${col}$${PRICE_ROW}`, `=${col}$${PRICE_ROW}*$C${r}`]; return want.includes(anchored(sh.formula(col + r))) && near(sh.value(col + r), sh.value('C' + r) * sh.value(col + PRICE_ROW)); };
const countsFmt = c => isDeskNumberFormat(cellFormatCode(c), { countsOk: true });
/** The whole grid J5:L10: eighteen cells, one formula shape, every one a figure with a thousands separator. */
const gridLive = sh => siteRows.every(r => PRICE_COLS.every(col => gridCell(sh, col, r) && countsFmt(sh.cellAt(col + r))));
/** Nothing spills under the grid: a Ctrl+Shift+↓ overshoot would fill the Total row too. */
const belowClear = sh => PRICE_COLS.every(col => blank(sh.cellAt(col + REPORT.totalRow)));
/** The formula bar reads exactly `buf` on J5 with the formula still open: the anchor state the goal asks for. */
const openReads = (ses, buf) => !!ses.editing && String(ses.editBuf || '').replace(/\s/g, '').toUpperCase() === buf && ses.sheets[ses.sheetIndex].name === 'Report' && ses.sheets[ses.sheetIndex].sheet.selectionText() === 'J5';

export default {
  id: 'anchors-dollar-and-f4',
  chapter: 'foundations',
  section: 'Formulas',
  module: 'formulas',
  workbook: 'clearcoat-weekly',
  state: { before: 'S6b', after: 'S6c' },
  title: 'Anchors: $ and F4',
  difficulty: 'medium',
  tags: ['formulas', 'anchors', 'report'],
  access: 'free',
  minutes: 7,
  headline: 'F4',
  conventions: ['E2', 'B4'],
  teaches: ['f4-anchor', 'relative-absolute'],
  uses: ['pointing', 'formula-basics', 'formula-operators', 'fill-down-right', 'number-formats', 'font-color', 'input-colour-convention', 'bold-italic-underline', 'edit-mode-f2', 'escape-cancels', 'type-to-enter', 'tab-commits', 'keytips', 'arrow-keys', 'ctrl-arrow', 'shift-arrow'],
  prerequisites: ['sum-family-and-autosum'],
  brief: 'When you fill a formula, its references move with it (down a row, across a column), and usually that’s what you want. Sometimes it isn’t: a price in one cell, a rate at the top of a column, and the reference has to stay put. A $ in front of a row or a column pins it ($C5 keeps the column, C$4 keeps the row, $C$5 keeps both), and F4 inside an open formula cycles the four states so you never type a $. The CFO wants each site’s weekly wash cost at three prices: one formula for a grid of eighteen cells. The key is `F4`.',
  goals: [
    { id: 'scenario-head', teach: 'A label, Ctrl+B, then the three inputs as a Tab run. Inputs in a row across the top, sites down the side: that’s the shape of every sensitivity grid you’ll ever build.',
      text: 'Head the scenario grid: Wash cost at price ($/wk) in J3, bold, then the three prices 1.25, 1.50 and 1.75 across J4:L4 as one Tab run.',
      hintStuck: 'pulse cell J3 · J3, type, Ctrl+B, Enter, ↓; 1.25, Tab, 1.5, Tab, 1.75, Enter.',
      keys: 'Ctrl+↓ ×2 Ctrl+→ → ↑ Ctrl+B "Wash cost at price ($/wk)" ↵ ↓ "1.25" Tab "1.5" Tab "1.75" ↵', requires: ['type-to-enter', 'tab-commits', 'bold-italic-underline', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const sh = report(ses); return !!sh && sh.value('J3') === HEAD && sh.cellAt('J3').bold === true && pricesTyped(sh) && settled(ses); } },
    { id: 'prices-are-inputs', teach: 'Ctrl+B toggles bold off; Alt, H, F, C for blue; Ctrl+Shift+4 for currency. Typed numbers are blue wherever they sit, headers or not.',
      text: 'The prices are inputs, not headers: select J4:L4, switch off the bold row 4 gave them, color them blue, and format them as currency.',
      hintStuck: 'pulse cells J4:L4 · Select J4:L4; Ctrl+B; Alt, H, F, C, → four times, Enter; Ctrl+Shift+4.',
      keys: '↑ Shift+→ ×2 Ctrl+B Alt H F C → ×4 ↵ Ctrl+Shift+4', requires: ['input-colour-convention', 'font-color', 'number-formats', 'bold-italic-underline', 'keytips', 'shift-arrow'], convention: 'B4',
      check: (s, ses) => { const sh = report(ses); return !!sh && pricesTyped(sh) && pricesStyled(sh) && settled(ses); } },
    { id: 'anchor-both', teach: 'F4 inside an open formula cycles the anchors on the reference at the caret. First press: $C$5, both pinned. Read the formula bar after each press, because that’s how you learn the cycle.',
      text: 'Start Domain’s cost at $1.25 in J5: type =, point at C5 and press F4 once, so the reference reads $C$5.',
      hintStuck: 'pulse the formula bar · J5, =, point at C5 with Ctrl+← twice and → →, then F4 once; don’t press Enter yet.',
      keys: '↓ "=" Ctrl+← ×2 → ×2 F4', requires: ['f4-anchor', 'relative-absolute', 'pointing', 'formula-basics', 'ctrl-arrow', 'arrow-keys'], convention: 'E2',
      check: (s, ses) => openReads(ses, '=$C$5') },
    { id: 'anchor-column', teach: 'The cycle is $C$5, then C$5, then $C5, then C5 and round again. Ask which way the formula will be filled: filled right, the column must hold, so pin the column: $C5.',
      text: 'Press F4 twice more, reading each state, C$5 then $C5, and stop on $C5, because the washes column has to hold when you fill right.',
      hintStuck: 'pulse the formula bar · F4, read C$5; F4, read $C5; stop.',
      keys: 'F4 F4', requires: ['f4-anchor', 'relative-absolute'],
      check: (s, ses) => openReads(ses, '=$C5') },
    { id: 'anchor-row', teach: 'Second reference, second question: filled down, the row must hold, so pin the row: J$4. Two presses of F4 from J4 gets you there. Enter, and J5 reads =$C5*J$4.',
      text: 'Type *, point at J4 and press F4 until it reads J$4, because the price row has to hold when you fill down, then press Enter.',
      hintStuck: 'pulse the formula bar · *, ↑ to J4, F4, F4 (J$4), Enter.',
      keys: '"*" ↑ F4 F4 ↵', requires: ['f4-anchor', 'relative-absolute', 'pointing', 'formula-operators', 'arrow-keys'],
      check: (s, ses) => { const sh = report(ses); return !!sh && gridCell(sh, 'J', 5) && settled(ses); } },
    { id: 'fill-right', teach: 'Ctrl+Shift+1, Alt, H, 9 twice (a cost grid can’t go negative, so the chord’s minus sign never shows), then Shift+→ twice and Ctrl+R. Open K5 with F2 to check: $C5 held, J$4 became K$4.',
      text: 'Give J5 thousands separators, no decimals, then fill it right across J5:L5 with Ctrl+R: $C5 stays on the washes column, the price moves.',
      hintStuck: 'pulse cells J5:L5 · Format J5; Shift+→ twice; Ctrl+R; F2 on K5 to check, Esc.',
      keys: 'Ctrl+Shift+1 Alt H 9 Alt H 9 Shift+→ ×2 Ctrl+R', requires: ['fill-down-right', 'relative-absolute', 'number-formats', 'keytips', 'shift-arrow'],
      check: (s, ses) => { const sh = report(ses); return !!sh && PRICE_COLS.every(col => gridCell(sh, col, 5) && countsFmt(sh.cellAt(col + 5))) && settled(ses); } },
    { id: 'fill-down', teach: 'Shift+↓ five times from the filled row, Ctrl+D. Eighteen cells from one formula: the fill went right because of $C5 and down because of J$4.',
      text: 'Now the five sites below: extend the selection to J5:L10 and fill down with Ctrl+D; J$4 stays on the price row while the washes move.',
      hintStuck: 'pulse cells J5:L10 · Land on J5, Shift+→ twice, Shift+↓ five times; Ctrl+D.',
      keys: 'Shift+↓ ×5 Ctrl+D', requires: ['fill-down-right', 'relative-absolute', 'shift-arrow'],
      check: (s, ses) => { const sh = report(ses); return !!sh && gridLive(sh) && belowClear(sh) && settled(ses); } },
    { id: 'read-back', teach: 'Middle of the grid, not a corner. Corners can be right by accident. $C7 (the column held, the row moved) and K$4 (the row held, the column moved) is exactly what both fills should produce.',
      text: 'Read one from the middle of the grid before you trust it: open K7 with F2, see $C7 and K$4 lit in color, then Esc.',
      hintStuck: 'pulse cell K7 · K7, F2, read, Esc.',
      keys: '→ ↓ ×2 F2 Esc', requires: ['edit-mode-f2', 'escape-cancels', 'arrow-keys'],
      check: (s, ses) => { const sh = report(ses); return !!sh && gridLive(sh) && windowKeys(ses).includes('F2') && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!K4" Enter "2" Enter Ctrl+G "Report!K10" Enter Escape Escape Escape', cadence: 320 },
      teach: 'One input, six formulas move, the other two columns don’t. That’s what anchoring bought you: a grid that reads its inputs instead of carrying them.',
      text: 'Does it tie? Change the middle price in K4 to 2.00 and watch every site’s cost under it, down to Airport’s K10, answer at once.',
      hintStuck: 'pulse cell K4 · K4, 2, Enter; K5:K10 all move.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'J3 heads the grid and J4:L4 hold the three prices as blue currency inputs', check: (s, ses) => { const sh = report(ses); return !!sh && sh.value('J3') === HEAD && pricesTyped(sh) && pricesStyled(sh); } },
    { text: 'J5:L10 hold =$C5*J$4 filled both ways, every cell live and in thousands', check: (s, ses) => { const sh = report(ses); return !!sh && gridLive(sh); } },
    { text: 'Nothing spills under the grid: J11:L11 stay empty', check: (s, ses) => { const sh = report(ses); return !!sh && belowClear(sh); } },
  ],
  wow: 'One formula covered eighteen cells, filled both ways, because two anchors held.',
  closing: [
    '=$C5*J$4 covered the whole grid: the $ before C held the washes column when you filled right, the $ before 4 held the price row when you filled down. F4 set both anchors while you typed; you never pressed the $ key.',
    'The three prices live in their own cells, blue, and every formula points at them instead of carrying a number inside. Change a price and its whole column answers.',
    'Best practice: to move a formula without changing what it reads, cut it (Ctrl+X) and paste. A moved formula keeps its references and the cells that read it follow; a copy shifts them.',
  ],
  solution: 'Ctrl+Down Ctrl+Down Ctrl+Right Right Up Ctrl+B "Wash cost at price ($/wk)" Enter Down "1.25" Tab "1.5" Tab "1.75" Enter Up Shift+Right Shift+Right Ctrl+B Alt H F C Right Right Right Right Enter Ctrl+Shift+4 Down "=" Ctrl+Left Ctrl+Left Right Right F4 F4 F4 "*" Up F4 F4 Enter Ctrl+Shift+1 Alt H 9 Alt H 9 Shift+Right Shift+Right Ctrl+R Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Right Down Down F2 Escape',
};
