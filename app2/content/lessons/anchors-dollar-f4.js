// Chapter 1 · 1.6.3 — Anchors: $ and F4 (voltline-weekly, S6b → S6c)
// The associate wants to see each site's weekly energy cost at three wholesale prices: a small grid
// beside the report, sites down, prices across. One formula does the whole grid if its two
// references are anchored the right way: $C5 stays on the kWh column when filled right, J$4 stays
// on the price row when filled down. F4 cycles the anchor states on the reference under the caret,
// so the learner never types a $. The formula is written once, filled right and down, read back
// with F2, and the stub the old sensitivity block left under the daily table is cleared. The closer
// changes one price and the whole column under it answers.
import { SCENARIO_PRICES, REPORT } from '../workbooks/voltline-weekly.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const report = ses => { const e = ses.sheets.find(x => x.name === 'Report'); return e ? e.sheet : null; };
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) < 1e-6;
/** A formula with its anchors kept: spacing and case ignored, every $ counted. */
const anchored = f => String(f || '').replace(/\s/g, '').toUpperCase();
const blank = c => c.value == null && c.formula == null;

const HEAD = 'Energy cost at price ($/wk)';
const PRICE_COLS = ['J', 'K', 'L'];            // the three price scenarios across J4:L4
const PRICE_ROW = 4;
const { siteRows } = REPORT;                   // 5–10, Domain … Airport
/** Every price sits in its cell, blue, as currency with two decimals, and not bold: an input, not a header. */
const pricesTyped = sh => PRICE_COLS.every((col, j) => sh.value(col + PRICE_ROW) === SCENARIO_PRICES[j] && !sh.cellAt(col + PRICE_ROW).formula);
const pricesStyled = sh => PRICE_COLS.every(col => { const c = sh.cellAt(col + PRICE_ROW); return c.fontColor === 'blue' && c.fmtStyle === 'currency' && (c.decimals | 0) === 2 && !c.bold; });
/** `col` row r holds the mixed-anchor formula =$C{r}*{col}$4 and reads the site's kWh times that price. */
const gridCell = (sh, col, r) => { const want = [`=$C${r}*${col}$${PRICE_ROW}`, `=${col}$${PRICE_ROW}*$C${r}`]; return want.includes(anchored(sh.formula(col + r))) && near(sh.value(col + r), sh.value('C' + r) * sh.value(col + PRICE_ROW)); };
const comma0 = c => c.fmtStyle === 'comma' && (c.decimals | 0) === 0;
/** The whole grid J5:L10: eighteen cells, one formula shape, every one a figure with thousands separators. */
const gridLive = sh => siteRows.every(r => PRICE_COLS.every(col => gridCell(sh, col, r) && comma0(sh.cellAt(col + r))));
/** Nothing spills under the grid: a Ctrl+Shift+↓ overshoot would fill the Total row too. */
const belowClear = sh => PRICE_COLS.every(col => blank(sh.cellAt(col + REPORT.totalRow)));
const STUB = ['A23', 'B23', 'C23', 'D23', 'E23', 'F23', 'A24', 'B24', 'C24', 'D24', 'E24', 'F24'];

export default {
  id: 'anchors-dollar-f4',
  chapter: 'foundations',
  section: 'Formulas',
  module: 'formulas',
  workbook: 'voltline-weekly',
  state: { before: 'S6b', after: 'S6c' },
  title: 'Anchors: $ and F4',
  difficulty: 'medium',
  tags: ['formulas', 'anchors', 'report'],
  access: 'free',
  minutes: 7,
  headline: 'F4',
  conventions: ['E2', 'B4'],
  teaches: ['f4-anchor'],
  uses: ['relative-absolute', 'pointing', 'formula-basics', 'formula-operators', 'fill-down-right', 'number-formats', 'font-color', 'input-colour-convention', 'bold-italic-underline', 'edit-mode-f2', 'escape-cancels', 'delete-clears', 'type-to-enter', 'tab-commits', 'enter-tab-direction', 'arrow-keys', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow'],
  prerequisites: ['sum-family-autosum'],
  brief: 'The associate, the colleague who checks your page, wants each site’s weekly energy cost at three wholesale prices, what the company pays per kWh: a grid beside the report, sites down, prices across. One formula covers all eighteen cells if its two references are anchored the right way, and F4 sets the anchors for you so you never type a $. The key is `F4`.',
  goals: [
    { id: 'scenario-head', text: 'Head the scenario grid: Energy cost at price ($/wk) in J3, bold, then the three prices 0.12, 0.13 and 0.14 across J4:L4 as one Tab run.', keys: '↓ ×3 Ctrl+→ → ↑ Ctrl+B "Energy cost at price ($/wk)" ↵ "0.12" Tab "0.13" Tab "0.14" ↵', requires: ['type-to-enter', 'tab-commits', 'enter-tab-direction', 'bold-italic-underline', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const sh = report(ses); return !!sh && sh.value('J3') === HEAD && sh.cellAt('J3').bold === true && pricesTyped(sh) && settled(ses); } },
    { id: 'prices-are-inputs', text: 'The prices are inputs, not headers: select J4:L4, switch off the bold inherited from row 4, color them blue, show them as currency with two decimals.', keys: '↑ Shift+→ ×2 Ctrl+B then Alt H F C → ×4 ↵ then Ctrl+Shift+4', requires: ['input-colour-convention', 'font-color', 'number-formats', 'bold-italic-underline', 'shift-arrow', 'arrow-keys'], convention: 'B4',
      check: (s, ses) => { const sh = report(ses); return !!sh && pricesTyped(sh) && pricesStyled(sh) && settled(ses); } },
    { id: 'anchored-formula', teach: 'F4 inside an open formula cycles the anchors on the reference at the caret, C5, $C$5, C$5, $C5: a $ pins the column or row it sits before.', text: 'Domain’s cost at $0.12 is kWh times price: in J5 point at C5, F4 until it reads $C5, type *, point at J4, F4 until J$4.', keys: '↓ "=" Ctrl+← ×2 → ×2 F4 ×3 "*" ↑ F4 ×2 ↵', requires: ['f4-anchor', 'relative-absolute', 'pointing', 'formula-basics', 'formula-operators', 'ctrl-arrow', 'arrow-keys'], convention: 'E2',
      check: (s, ses) => { const sh = report(ses); return !!sh && gridCell(sh, 'J', 5) && settled(ses); } },
    { id: 'fill-right', text: 'Give J5 thousands separators with no decimals, then fill it right across J5:L5 with Ctrl+R: $C5 stays on the kWh column while the price moves.', keys: '↑ Ctrl+Shift+1 then Alt H 9 Alt H 9 then Shift+→ ×2 Ctrl+R', requires: ['fill-down-right', 'relative-absolute', 'number-formats', 'shift-arrow', 'arrow-keys'],
      check: (s, ses) => { const sh = report(ses); return !!sh && PRICE_COLS.every(col => gridCell(sh, col, 5) && comma0(sh.cellAt(col + 5))) && settled(ses); } },
    { id: 'fill-down', text: 'Now the five sites below: extend the selection to J5:L10 and fill down with Ctrl+D; J$4 stays on the price row while the kWh moves.', keys: 'Shift+↓ ×5 Ctrl+D', requires: ['fill-down-right', 'relative-absolute', 'shift-arrow'],
      check: (s, ses) => { const sh = report(ses); return !!sh && gridLive(sh) && belowClear(sh) && settled(ses); } },
    { id: 'read-back', text: 'Read one from the middle of the grid before you trust it: open K7 with F2, see $C7 and K$4 lit in color, then Esc.', keys: '→ ↓ ×2 F2 Esc', requires: ['edit-mode-f2', 'escape-cancels', 'arrow-keys'],
      check: (s, ses) => { const sh = report(ses); return !!sh && gridLive(sh) && windowKeys(ses).includes('F2') && settled(ses); } },
    { id: 'clear-stub', text: 'The old sensitivity stub, a half-built what-if table under the daily block, is covered by the grid now: select A23:F24 and clear it with Delete.', keys: 'Ctrl+← Ctrl+↓ ×4 ↓ Ctrl+Shift+→ Shift+↑ Delete', requires: ['delete-clears', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys'],
      check: (s, ses) => { const sh = report(ses); return !!sh && STUB.every(ref => blank(sh.cellAt(ref))) && gridLive(sh) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!K4" Enter "0.2" Enter Ctrl+G "Report!K10" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch the middle price in K4 change to $0.20 and every site’s cost under it, down to Airport’s K10, answer at once.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'J3 heads the grid and J4:L4 hold the three prices as blue currency inputs', check: (s, ses) => { const sh = report(ses); return !!sh && sh.value('J3') === HEAD && pricesTyped(sh) && pricesStyled(sh); } },
    { text: 'J5:L10 hold =$C5*J$4 filled both ways, every cell live and in thousands', check: (s, ses) => { const sh = report(ses); return !!sh && gridLive(sh); } },
    { text: 'Nothing spills under the grid: J11:L11 stay empty', check: (s, ses) => { const sh = report(ses); return !!sh && belowClear(sh); } },
    { text: 'The old stub A23:F24 is clear', check: (s, ses) => { const sh = report(ses); return !!sh && STUB.every(ref => blank(sh.cellAt(ref))); } },
  ],
  closing: [
    'One formula, =$C5*J$4, covered all eighteen cells: F4 set the anchors while you typed, so the fill stopped breaking in both directions (E2).',
    'The three prices live in their own cells, blue, and the formulas point at them instead of carrying the number inside: one input, one cell (B4). Change a price and its whole column answers.',
  ],
  solution: 'Down Down Down Ctrl+Right Right Up Ctrl+B "Energy cost at price ($/wk)" Enter "0.12" Tab "0.13" Tab "0.14" Enter Up Shift+Right Shift+Right Ctrl+B Alt H F C Right Right Right Right Enter Ctrl+Shift+4 Down "=" Ctrl+Left Ctrl+Left Right Right F4 F4 F4 "*" Up F4 F4 Enter Up Ctrl+Shift+1 Alt H 9 Alt H 9 Shift+Right Shift+Right Ctrl+R Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Right Down Down F2 Escape Ctrl+Left Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Down Ctrl+Shift+Right Shift+Up Delete',
};
