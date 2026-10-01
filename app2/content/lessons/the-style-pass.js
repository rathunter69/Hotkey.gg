// Chapter 1 · 1.5.4 — The style pass (clearcoat-weekly, S5c → S5d, plant PLANT_GRIDS)
// A manager sent the Costs sheet in General format with an all-borders grid over the block, and
// Inputs and Raw's totals block carry grids too. Two ways to format at speed: Paste Special Formats
// carries the Report's figure block format (the desk number format, the $ on the first row, bold
// right-aligned headers) onto Costs cell for cell in one paste; All Borders › None takes the grid
// off Costs, and F4 repeats it on Inputs and on Raw. The total column goes bold, and a width set
// once on Costs' figure columns repeats on Inputs' column B with the same key. The closer perturbs
// Domain's rent and its total answers in its new dress.
import { PLANT_GRIDS, stateOf } from '../workbooks/clearcoat-weekly.js';
import { cellFormatCode, isDeskNumberFormat } from '../../app/graders.js';

// The plant, merged over S5c's cells: `applyStatePatch` REPLACES a cell record, and the exported
// PLANT_GRIDS carries `{ ball: true }` alone, which would wipe the blocks' figures, formulas and
// colors at lesson start. Merging keeps every cell as S5c left it plus the grid.
const S5C = stateOf('S5c');
const cellsOf = name => S5C.sheets.find(x => x.name === name).cells;
const PLANT = Object.fromEntries(Object.entries(PLANT_GRIDS).map(([key, patch]) => { const [sh, ref] = key.split('!'); return [key, { ...(cellsOf(sh)[ref] || {}), ...patch }]; }));

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const costs = ses => sheetOf(ses, 'Costs');
const inputs = ses => sheetOf(ses, 'Inputs');
const raw = ses => sheetOf(ses, 'Raw');
const settled = ses => !ses.editing && !ses.dialog;

/** A1-style refs for a rectangular block, column letters inclusive. */
const span = (col1, col2, r1, r2) => { const out = []; for (let c = col1.charCodeAt(0); c <= col2.charCodeAt(0); c++) for (let r = r1; r <= r2; r++) out.push(String.fromCharCode(c) + r); return out; };
const desk = (sh, refs) => refs.every(ref => isDeskNumberFormat(cellFormatCode(sh.cellAt(ref))));
const fmtIs = (sh, refs, style, dec) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === style && (c.decimals | 0) === dec; });
const allBold = (sh, refs) => refs.every(ref => sh.cellAt(ref).bold === true);
const noneBold = (sh, refs) => refs.every(ref => !sh.cellAt(ref).bold);
const alignedRight = (sh, refs) => refs.every(ref => sh.cellAt(ref).align === 'r');
/** No border of any kind on the cell: the plant's all-borders grid is gone and nothing replaced it. */
const borderless = (sh, refs) => refs.every(ref => { const c = sh.cellAt(ref); return !c.ball && !c.bt && !c.bb && !c.bl && !c.br && !c.bdbl && !c.thick; });
const W12 = 12 * 7 + 5;   // width 12 in Excel units, as the engine stores it

const COST_COLS = span('B', 'D', 4, 8);    // Rent, Maintenance, Card fees: the three cost columns
const TOTAL_COL = span('E', 'E', 4, 8);    // Total ($/wk)
const HEADERS = span('B', 'E', 3, 3);      // the four headers over the figures (A3 'Site' sits over text and stays)
const COSTS_BLOCK = span('A', 'E', 3, 8);  // the whole Costs block the grid was drawn over
const INPUTS_BLOCK = span('A', 'C', 3, 15);
const RAW_BLOCK = span('H', 'K', 7, 13);
/** The Report's figure block format landed cell for cell: bold right headers, the desk number format down the body, the $ on the first row, and every figure kept. */
const costsDressed = sh => allBold(sh, HEADERS) && alignedRight(sh, HEADERS) && desk(sh, ['B4', ...span('B', 'E', 5, 8)]) && fmtIs(sh, ['C4', 'D4', 'E4'], 'currency', 0)
  && sh.value('B4') === 2100 && sh.value('E4') === 2740 && sh.value('E8') === 3170 && !!sh.cellAt('E4').formula;

export default {
  id: 'the-style-pass',
  chapter: 'foundations',
  section: 'Format',
  module: 'format',
  workbook: 'clearcoat-weekly',
  state: { before: 'S5c', after: 'S5d' },
  plant: PLANT,
  title: 'The style pass',
  difficulty: 'medium',
  tags: ['format', 'f4', 'borders', 'costs'],
  access: 'free',
  minutes: 6,
  headline: 'F4',
  conventions: ['D2', 'D5', 'A2'],
  teaches: ['column-width'],
  uses: ['paste-special', 'copy-cut-paste', 'f4-repeat', 'bold-italic-underline', 'borders-menu', 'keytips', 'sheet-tabs', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-a', 'row-col-select', 'arrow-keys', 'number-formats'],
  prerequisites: ['alignment-and-titles'],
  brief: 'A manager sent the Costs sheet in General format with an all-borders grid over the whole block, so it doesn’t read like the rest of the file, and Inputs and the totals block on Raw have grids too. Two ways to format at speed: Paste Special Formats copies a whole table’s format onto another table in one paste, and F4 repeats the last action on the next block, and the next. Copy the Report’s format onto Costs, then take three grids off with one command and two F4s. The key is `F4`.',
  goals: [
    { id: 'paste-formats', teach: 'Paste Special, T for formats, pastes the source block’s formatting cell for cell onto the destination: the desk number format, the $ on the first row, bold right-aligned headers, all of it, and none of the numbers. A block you’ve formatted once is the template for every block like it.',
      text: 'Copy the Report’s figure block with its headers, C4:F9, and Paste Special Formats onto Costs!B3 to dress the whole table in one paste.',
      hintStuck: 'pulse cell B3 on Costs · Select C4:F9 on Report, Ctrl+C; Ctrl+PgDn to Costs, land on B3; Ctrl+Alt+V, T, Enter.',
      keys: 'Ctrl+↓ ×2 → ×2 Shift+→ ×3 Shift+↓ ×5 Ctrl+C Ctrl+PgDn ×3 ↓ ×2 → Ctrl+Alt+V T ↵', requires: ['paste-special', 'copy-cut-paste', 'number-formats', 'sheet-tabs', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'], convention: 'D2',
      check: (s, ses) => { const sh = costs(ses); return !!sh && costsDressed(sh) && settled(ses); } },
    { id: 'grid-off', teach: 'Alt, H, B, N removes every border in the selection: one action, start to finish, which is what F4 will repeat. A grid is not structure; a top border on a total is.',
      text: 'The grid on Costs: select the block A3:E8 with Ctrl+A and take every border off with Alt, H, B, N.',
      hintStuck: 'pulse cells A3:E8 · Land inside the block, Ctrl+A; Alt, H, B, N.',
      keys: 'Ctrl+A Alt H B N', requires: ['borders-menu', 'keytips', 'ctrl-a'], convention: 'D5',
      check: (s, ses) => { const sh = costs(ses); return !!sh && borderless(sh, COSTS_BLOCK) && costsDressed(sh) && settled(ses); } },
    { id: 'inputs-grid', teach: 'F4 repeats your last action on whatever is selected now, so the borders you removed on Costs come off Inputs with one key.',
      text: 'Inputs has the same grid: go there, select its block A3:C15 and press F4.',
      hintStuck: 'pulse cells A3:C15 on Inputs · Ctrl+PgUp to Inputs; land on A3, Ctrl+A; F4.',
      keys: 'Ctrl+PgUp ↓ ×2 Ctrl+A F4', requires: ['f4-repeat', 'ctrl-a', 'sheet-tabs', 'arrow-keys'],
      check: (s, ses) => { const inp = inputs(ses); return !!inp && borderless(inp, INPUTS_BLOCK) && settled(ses); } },
    { id: 'raw-grid', teach: 'Third block, third grid, and still one key, because F4 keeps repeating the same action until you do something else.',
      text: 'And the totals block on Raw, H7:K13: select it and press F4 again.',
      hintStuck: 'pulse cells H7:K13 on Raw · Ctrl+PgUp to Raw; land on H7, Ctrl+A; F4.',
      keys: 'Ctrl+PgUp Ctrl+→ ×2 Ctrl+↓ ×2 ↓ Ctrl+A F4', requires: ['f4-repeat', 'ctrl-a', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const rw = raw(ses); return !!rw && borderless(rw, RAW_BLOCK) && settled(ses); } },
    { id: 'total-bold', teach: 'The answer column is bold; the inputs aren’t. Bold says "read this one".',
      text: 'Back on Costs, Total ($/wk) is the column a reader looks for first: select E4:E8 and make it bold with Ctrl+B.',
      hintStuck: 'pulse cells E4:E8 · Ctrl+PgDn to Costs; E4, Ctrl+Shift+↓, Ctrl+B.',
      keys: 'Ctrl+PgDn ×2 Ctrl+→ ↓ Ctrl+Shift+↓ Ctrl+B', requires: ['bold-italic-underline', 'sheet-tabs', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys'],
      check: (s, ses) => { const sh = costs(ses); return !!sh && allBold(sh, TOTAL_COL) && noneBold(sh, COST_COLS) && settled(ses); } },
    { id: 'widths', teach: 'Any action, any block: widths repeat too. Equal widths across a file’s figure columns is one of the things a reviewer notices without knowing why.',
      text: 'Set Costs’ figure columns B:E to width 12 with Alt, H, O, W, then land in Inputs’ figure column B and press F4.',
      hintStuck: 'pulse columns B:E on Costs · B4, Ctrl+Space, Shift+→ three times; Alt, H, O, W, 12, Enter; then on Inputs, column B, F4.',
      keys: '← ×3 Ctrl+Space Shift+→ ×3 Alt H O W "12" ↵ Ctrl+PgUp → Ctrl+Space F4', requires: ['column-width', 'f4-repeat', 'row-col-select', 'keytips', 'sheet-tabs', 'shift-arrow', 'arrow-keys'],
      check: (s, ses) => { const sh = costs(ses), inp = inputs(ses); return !!sh && !!inp && [2, 3, 4, 5].every(c => sh.colW[c] === W12) && inp.colW[2] === W12 && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Costs!B4" Enter "2500" Enter Ctrl+G "Costs!E4" Enter Escape Escape Escape', cadence: 320 },
      teach: 'Costs’ totals are live formulas, the ones you’ll audit in 1.6.6. Change a rent, watch the total.',
      text: 'Does it tie? Change Domain’s rent in B4 on Costs to 2,500 and watch its Total in E4 answer, bold and with its thousands separator.',
      hintStuck: 'pulse cell E4 on Costs · B4, 2500, Enter; E4 moves.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Costs B3:E8 wear the Report’s figure block format, every figure kept', check: (s, ses) => { const sh = costs(ses); return !!sh && costsDressed(sh); } },
    { text: 'No border is left on Costs A3:E8, Inputs A3:C15 or Raw H7:K13', check: (s, ses) => { const sh = costs(ses), inp = inputs(ses), rw = raw(ses); return !!sh && !!inp && !!rw && borderless(sh, COSTS_BLOCK) && borderless(inp, INPUTS_BLOCK) && borderless(rw, RAW_BLOCK); } },
    { text: 'The Total column is bold and the figure columns on Costs and Inputs are 12 wide', check: (s, ses) => { const sh = costs(ses), inp = inputs(ses); return !!sh && !!inp && allBold(sh, TOTAL_COL) && [2, 3, 4, 5].every(c => sh.colW[c] === W12) && inp.colW[2] === W12; } },
  ],
  wow: 'One paste dressed a table. One command and two F4s cleared three grids.',
  closing: [
    'Paste Special Formats carries everything a block wears (number formats, bold, alignment, borders) onto another block the same shape, so a page you’ve already formatted becomes the template for the next one. F4 repeats a single action wherever you land: do it once, F4 the rest. Between them, formatting stops being work.',
    'The Borders button on the toolbar you built in 1.1.4 (Alt and its number on your toolbar) opens the menu All Borders sits in, the command that drew these grids. Now you know how to undo everyone else’s.',
  ],
  solution: 'Ctrl+Down Ctrl+Down Right Right Shift+Right Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+C Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Down Down Right Ctrl+Alt+V T Enter Ctrl+A Alt H B N Ctrl+PgUp Down Down Ctrl+A F4 Ctrl+PgUp Ctrl+Right Ctrl+Right Ctrl+Down Ctrl+Down Down Ctrl+A F4 Ctrl+PgDn Ctrl+PgDn Ctrl+Right Down Ctrl+Shift+Down Ctrl+B Left Left Left Ctrl+Space Shift+Right Shift+Right Shift+Right Alt H O W "12" Enter Ctrl+PgUp Right Ctrl+Space F4',
};
