// Chapter 1 · 1.5.4 — The style pass (voltline-weekly, S5c → S5d, plant PLANT_COSTS_GRID)
// The Costs block arrived from a colleague the way most blocks arrive: General numbers and an
// all-borders grid over everything. It gets brought to the format the team uses in one pass:
// comma style on the figures (Ctrl+1 once, then F4 repeats it on the next column in one press),
// headers right over their numbers, the total column bold, and the grid taken off, because a
// grid is not structure — a total's top border is. Nothing on the sheet changes but how it reads;
// the closer perturbs Domain's lease and its total answers in its new dress.
import { PLANT_COSTS_GRID, stateOf } from '../workbooks/voltline-weekly.js';

// The plant, merged over S5c's Costs cells: `applyStatePatch` REPLACES a cell record, and the
// exported PLANT_COSTS_GRID carries `{ ball: true }` alone, which would wipe the block's figures,
// formula and colors at lesson start. Merging keeps every cell as S5c left it plus the grid.
const S5C_COSTS = stateOf('S5c').sheets.find(x => x.name === 'Costs').cells;
const PLANT = Object.fromEntries(Object.entries(PLANT_COSTS_GRID).map(([key, patch]) => [key, { ...(S5C_COSTS[key.split('!')[1]] || {}), ...patch }]));

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const costs = ses => sheetOf(ses, 'Costs');
const settled = ses => !ses.editing && !ses.dialog;

/** A1-style refs for a rectangular block, column letters inclusive. */
const span = (col1, col2, r1, r2) => { const out = []; for (let c = col1.charCodeAt(0); c <= col2.charCodeAt(0); c++) for (let r = r1; r <= r2; r++) out.push(String.fromCharCode(c) + r); return out; };
/** Every cell in `refs` carries the number format `style` with `dec` decimals (an empty cell counts: the format waits for its figure). */
const fmtIs = (sh, refs, style, dec) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === style && (c.decimals | 0) === dec; });
const allBold = (sh, refs) => refs.every(ref => sh.cellAt(ref).bold === true);
const noneBold = (sh, refs) => refs.every(ref => !sh.cellAt(ref).bold);
const alignedRight = (sh, refs) => refs.every(ref => sh.cellAt(ref).align === 'r');
/** No border of any kind on the cell: the plant's all-borders grid is gone and nothing replaced it. */
const borderless = (sh, refs) => refs.every(ref => { const c = sh.cellAt(ref); return !c.ball && !c.bt && !c.bb && !c.bl && !c.br && !c.bdbl && !c.thick; });

const COST_COLS = span('B', 'D', 4, 8);    // Site lease, Maintenance, Network fees: the three cost columns
const TOTAL_COL = span('E', 'E', 4, 8);    // Total ($/wk)
const HEADERS = span('B', 'E', 3, 3);      // the four headers over the figures (A3 'Site' sits over text and stays)
const BLOCK = span('A', 'E', 3, 8);        // the whole Costs block the grid was drawn over

export default {
  id: 'the-style-pass',
  chapter: 'foundations',
  section: 'Format',
  module: 'format',
  workbook: 'voltline-weekly',
  state: { before: 'S5c', after: 'S5d' },
  plant: PLANT,
  title: 'The style pass',
  difficulty: 'medium',
  tags: ['format', 'f4', 'borders', 'costs'],
  access: 'free',
  minutes: 5,
  headline: 'F4',
  conventions: ['D2', 'D5', 'A2'],
  teaches: ['f4-repeat'],
  uses: ['number-formats', 'format-cells-dialog', 'bold-italic-underline', 'borders-menu', 'align-command', 'keytips', 'sheet-tabs', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-a'],
  prerequisites: ['alignment-and-titles'],
  brief: 'A colleague sent the Costs sheet with the figures in General format and an all-borders grid drawn over the whole block, and it does not read like the rest of the file. Bring it to the format the team uses in one pass: format once, then repeat that format on the next column with a single press. The key is `F4`.',
  goals: [
    { id: 'costs-comma', text: 'On Costs, select the three cost columns B4:D8 and give them thousands separators with no decimals: Ctrl+1, then N.', keys: 'Ctrl+PgDn ×3 Ctrl+↓ ↓ → Ctrl+Shift+↓ Shift+→ ×2 then Ctrl+1 N', requires: ['number-formats', 'format-cells-dialog', 'sheet-tabs', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow'], convention: 'D2',
      check: (s, ses) => { const sh = costs(ses); return !!sh && fmtIs(sh, COST_COLS, 'comma', 0) && settled(ses); } },
    { id: 'f4-repeat', teach: 'F4 outside a formula repeats your last action, a format, a border, a width, an insert, on whatever is selected now: format once, F4 everywhere.', text: 'The Total column needs the same format: select E4:E8 and press F4 once, and the comma style you just set lands on all five cells.', keys: 'Ctrl+→ Ctrl+Shift+↓ F4', requires: ['f4-repeat', 'ctrl-arrow', 'ctrl-shift-arrow'],
      check: (s, ses) => { const sh = costs(ses); return !!sh && fmtIs(sh, TOTAL_COL, 'comma', 0) && fmtIs(sh, COST_COLS, 'comma', 0) && windowKeys(ses).includes('F4') && settled(ses); } },
    { id: 'headers-right', text: 'The four headers B3:E3 sit over numbers, so right-align them with Alt H A R; Site in A3 sits over names and stays as it is.', keys: '↑ Ctrl+Shift+← Shift+→ Alt H A R', requires: ['align-command', 'keytips', 'ctrl-shift-arrow', 'shift-arrow'],
      check: (s, ses) => { const sh = costs(ses); return !!sh && alignedRight(sh, HEADERS) && sh.cellAt('A3').align !== 'r' && settled(ses); } },
    { id: 'total-bold', text: 'Total ($/wk) is the column a reader looks for first: select E4:E8 again and make it bold with Ctrl+B.', keys: '↓ Ctrl+Shift+↓ Ctrl+B', requires: ['bold-italic-underline', 'ctrl-shift-arrow'],
      check: (s, ses) => { const sh = costs(ses); return !!sh && allBold(sh, TOTAL_COL) && noneBold(sh, COST_COLS) && settled(ses); } },
    { id: 'grid-off', text: 'A grid is not structure: select the whole block A3:E8 with Ctrl+A and take every border off with Alt H B N.', keys: 'Ctrl+A Alt H B N', requires: ['borders-menu', 'keytips', 'ctrl-a'], convention: 'D5',
      check: (s, ses) => { const sh = costs(ses); return !!sh && borderless(sh, BLOCK) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Costs!B4" Enter "2500" Enter Ctrl+G "Costs!E4" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Domain’s lease in B4 change to 2,500 and its Total in E4 answer, bold and with its thousands separator.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'B4:E8 read with thousands separators and no decimals', check: (s, ses) => { const sh = costs(ses); return !!sh && fmtIs(sh, COST_COLS, 'comma', 0) && fmtIs(sh, TOTAL_COL, 'comma', 0); } },
    { text: 'The headers B3:E3 sit right over their numbers and the Total column is bold', check: (s, ses) => { const sh = costs(ses); return !!sh && alignedRight(sh, HEADERS) && allBold(sh, TOTAL_COL) && noneBold(sh, COST_COLS); } },
    { text: 'No border is left anywhere on A3:E8', check: (s, ses) => { const sh = costs(ses); return !!sh && borderless(sh, BLOCK); } },
  ],
  closing: [
    'The Costs block now reads like the rest of the file: one decimals setting down every figure column (D2), headers right over their numbers, the Total column bold, and the grid gone, because a grid is not structure and a total’s top border is (D5).',
    'You set the comma style once and F4 put it on the next column in one press: format once, F4 everywhere, faster than any button on the toolbar (A2), whose Alt+6 is All Borders, the very button that drew the grid.',
  ],
  solution: 'Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+Down Down Right Ctrl+Shift+Down Shift+Right Shift+Right Ctrl+1 N Ctrl+Right Ctrl+Shift+Down F4 Up Ctrl+Shift+Left Shift+Right Alt H A R Down Ctrl+Shift+Down Ctrl+B Ctrl+A Alt H B N',
};
