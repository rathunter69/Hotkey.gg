// Chapter 2 · 2.3.3 Borders that mean something (clearcoat-pnl, S3b + PLANT_GRID → S3c)
// The export left an all-borders grid over the lines in C7:E24. No Border takes it off (and the
// divider with it, so the divider goes back on D7:D24); then the four totals take a top border,
// EBITDA a double bottom from Ctrl+1's Border tab, and the gridlines go off so the borders are the
// only lines left. The closer moves a cost line and the bordered totals answer.
import { TOTAL_ROWS, PLANT_GRID } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const COLS = ['B', 'C', 'D', 'E'];

const noGrid = sh => { for (let r = 7; r <= 24; r++) for (const col of ['C', 'D', 'E']) if (sh.cellAt(col + r).ball) return false; return true; };
const divider = sh => { for (let r = 4; r <= 35; r++) if (!sh.cellAt('D' + r).br) return false; return true; };
const tops = sh => TOTAL_ROWS.every(r => COLS.every(col => sh.cellAt(col + r).bt));
const doubled = sh => COLS.every(col => sh.cellAt(col + '24').bdbl);

export default {
  id: 'borders-that-mean-something',
  chapter: 'formatting',
  section: 'The page a buyer reads',
  module: 'the-page-a-buyer-reads',
  workbook: 'clearcoat-pnl',
  state: { before: 'S3b', after: 'S3c' },
  plant: PLANT_GRID,
  title: 'Borders that mean something',
  difficulty: 'medium',
  tags: ['format', 'presentation', 'borders'],
  access: 'paid',
  minutes: 6,
  headline: 'Alt H B',
  conventions: ['D5', 'A3', 'B5'],
  teaches: ['border-meaning'],
  uses: ['borders-menu', 'ae-divider', 'f4-repeat', 'format-cells-dialog', 'format-cells-tabs', 'gridlines', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow'],
  prerequisites: ['actuals-vs-estimates-divider'],
  brief: 'On a page, a border is a sentence: a top border says “this row adds up what’s above”, a double bottom says “this is the final answer”, and a grid says nothing at all. The P&L has four totals and one answer. Give each the line it means, take off anything else, and turn the gridlines off so the borders are the only lines a reader sees. The key is `Alt H B`.',
  goals: [
    { id: 'no-grid', teach: 'A grid on every cell says nothing, because every line is the same line. No Border (Alt, H, B, N) takes every edge off the selection at once.', text: 'The export left a grid over C7:E24: select it and take every border off with Alt, H, B, N.', keys: '→ ×2 Ctrl+↓ ×3 Ctrl+Shift+→ Ctrl+Shift+↓ ×5 Alt H B N', requires: ['border-meaning', 'borders-menu', 'ctrl-arrow', 'ctrl-shift-arrow'], convention: 'D5',
      hintStuck: 'pulse range C7:E24 · The grid runs from retail wash revenue to EBITDA.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && noGrid(sh) && settled(ses); } },
    { id: 'divider-back', teach: 'No Border means every edge, so the divider went with the grid. It is the one line that was meant, and it goes straight back.', text: 'Put the divider back on D7:D24 with Alt, H, B, R.', keys: '→ Ctrl+Shift+↓ ×5 Alt H B R', requires: ['ae-divider', 'borders-menu', 'ctrl-shift-arrow'], convention: 'B5',
      hintStuck: 'pulse range D7:D24 · FY25A is the last actual column.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && noGrid(sh) && divider(sh) && settled(ses); } },
    { id: 'tops', teach: 'A top border says the row adds up what is above it, so every total takes one: Alt, H, B, P. F4 repeats it down the page.', text: 'Give total revenue B10:E10 a top border with Alt, H, B, P, then B20:E20, B22:E22 and B24:E24 with F4.', keys: '← ×2 Ctrl+↓ Shift+→ ×3 Alt H B P Ctrl+↓ ×2 Shift+→ ×3 F4 Ctrl+↓ Shift+→ ×3 F4 Ctrl+↓ Shift+→ ×3 F4', requires: ['borders-menu', 'f4-repeat', 'ctrl-arrow', 'shift-arrow'], convention: 'D5',
      hintStuck: 'pulse range B10:E10 · Four totals, one top border each.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && tops(sh) && settled(ses); } },
    { id: 'double', teach: 'The double bottom marks the one final answer on the page, and EBITDA is it. On Ctrl+1’s Border tab, ↓ reaches the line styles and ↑ from None lands on the double.', text: 'Give EBITDA B24:E24 a double bottom from Ctrl+1’s Border tab.', keys: 'Ctrl+1 B ↓ ↑ ↵', requires: ['format-cells-dialog', 'format-cells-tabs', 'border-meaning'], convention: 'D5',
      hintStuck: 'pulse range B24:E24 · The answer keeps its top border and gains the double under it.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && doubled(sh) && tops(sh) && settled(ses); } },
    { id: 'gridlines', text: 'Turn the gridlines off with Alt, W, V, G, so the borders are the only lines on the page.', keys: 'Alt W V G', requires: ['gridlines'], convention: 'A3',
      hintStuck: 'pulse the View tab · View, Show, Gridlines.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.gridlines === false && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C13" Enter "-4500" Enter Ctrl+G "C24" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch C13 change to -4500, and the bordered totals in C20, C22 and C24 answer.', requires: [],
      hintStuck: 'pulse cell C20 · A cost line moves every total under it.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'No grid, and the divider still runs down D', check: (s, ses) => { const sh = pnl(ses); return !!sh && noGrid(sh) && divider(sh); } },
    { text: 'Four totals with a top border and a double bottom on EBITDA', check: (s, ses) => { const sh = pnl(ses); return !!sh && tops(sh) && doubled(sh); } },
    { text: 'Gridlines off', check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.gridlines === false; } },
  ],
  closing: [
    'Every line on the page means something, and there are no lines that don’t.',
    'Four top borders say four totals, the double says the answer, and the divider says where the forecast starts. With the gridlines off, a reader sees those lines and nothing else.',
  ],
  solution: 'Right Right Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Shift+Right Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Down Alt H B N Right Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Down Alt H B R Left Left Ctrl+Down Shift+Right Shift+Right Shift+Right Alt H B P Ctrl+Down Ctrl+Down Shift+Right Shift+Right Shift+Right F4 Ctrl+Down Shift+Right Shift+Right Shift+Right F4 Ctrl+Down Shift+Right Shift+Right Shift+Right F4 Ctrl+1 B Down Up Enter Alt W V G',
};
