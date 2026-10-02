// Chapter 1 · 1.2.2 — Select like you mean it (clearcoat-weekly, S1d → S1e)
// The selection set in order, small to large (a cell at a time, to the edge, a row, a column, the
// region, everything in use), and every selection is used the moment it is made (payoff pass,
// 2026-10-02): the figure headers right-aligned, Revenue read in the status bar, the header row given
// air, column B fitted to its site names, the feed's blanks counted, the sheet's extent read. The three
// layout jobs came from 1.2.3, which keeps widths, inserts and wrap. Each goal grades the end state, so
// any legitimate route counts. The learner-facing words live in content/copy/*.csv.
import { stateOf } from '../workbooks/clearcoat-weekly.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const raw = ses => sheetOf(ses, 'Raw');
const AFTER_RAW = stateOf('S1e').sheets.find(s => s.name === 'Raw');
const sel = (s, text) => s.selectionText() === text;
const headersRight = ses => ['C1', 'D1', 'E1', 'F1'].every(r => raw(ses).cellAt(r).align === 'r');

export default {
  id: 'select-like-you-mean-it',
  chapter: 'foundations',
  section: 'Move and select',
  module: 'move-and-select',
  workbook: 'clearcoat-weekly',
  state: { before: 'S1d', after: 'S1e' },
  title: 'Select like you mean it',
  difficulty: 'easy',
  tags: ['selection'],
  access: 'free',
  minutes: 6,
  headline: 'Ctrl+Shift+↓',
  conventions: ['A5'],
  teaches: ['row-col-select', 'ctrl-a', 'select-all-sheet', 'align-command', 'row-height', 'autofit'],
  uses: ['shift-arrow', 'ctrl-shift-arrow', 'ctrl-arrow', 'ctrl-home-end', 'sheet-tabs', 'status-bar', 'keytips'],
  prerequisites: ['jump-dont-scroll'],
  brief: 'Everything you do to a sheet starts with a selection: the highlighted cells are the ones a command acts on. Made with the mouse, a selection takes a drag and a scroll; made with the keyboard, it takes one or two presses. Shift and an arrow grows it a cell at a time, Ctrl+Shift and an arrow to the edge of the data, Shift+Space takes a row, Ctrl+Space a column, and Ctrl+A the table. Each one gets used the moment you make it, to tidy the feed’s headers and read what the feed holds. The key is `Ctrl+Shift+↓`.',
  goals: [
    { id: 'headers-right', text: 'On Raw, select the figure headers C1:F1 a cell at a time with Shift+→ and right-align them over their numbers with Alt, H, A, R.', keys: 'Ctrl+PgDn → → Shift+→ ×3 then Alt H A R', requires: ['shift-arrow', 'align-command', 'sheet-tabs', 'keytips'],
      teach: 'Shift and an arrow grows a selection a cell at a time, and a command then lands on every cell in it. Numbers align right and text aligns left, so a header over a number column reads best right-aligned: Alt, H, A, then L, C or R.',
      hintStuck: 'pulse cells C1:F1 · From C1, Shift+→ until the Name Box reads C1:F1, then Alt, H, A, R.',
      check: (s, ses) => onSheet(ses, 'Raw') && headersRight(ses) },
    { id: 'revenue-sum', text: 'Select Revenue from its header E1 to the last figure with one Ctrl+Shift+↓, then read its sum in the status bar.', keys: '→ → then Ctrl+Shift+↓', requires: ['ctrl-shift-arrow', 'status-bar', 'arrow-keys'],
      teach: 'Ctrl+Shift and an arrow grows the selection to the edge of the data: sixty cells in one press, and the Name Box reads E1:E60. Glance at the status bar before you use any column, because it’s how you catch a text figure or a missing day before it costs you.',
      hintStuck: 'pulse the Name Box · From E1, one Ctrl+Shift+↓; then look at the bottom edge of the window.',
      check: (s, ses) => onSheet(ses, 'Raw') && sel(s, 'E1:E60') && windowKeys(ses).includes('Ctrl+Shift+↓') && !!ses.statusInfo().show },
    { id: 'header-row', text: 'Give the header row some air: select row 1 with Shift+Space and set its height to 20 with Alt, H, O, H.', keys: 'Ctrl+Home Shift+Space then Alt H O H "20" ↵', requires: ['row-col-select', 'row-height', 'ctrl-home-end'],
      teach: 'Shift+Space selects the entire row of the active cell, edge to edge, and any arrow on its own collapses a selection back to one cell. Row Height (Alt, H, O, H) is in points: type it and Enter. AutoFit Row Height (Alt, H, O, A) sizes a row back to what its text needs.',
      hintStuck: 'pulse row 1 · Ctrl+Home, then Shift and the space bar together, then Alt, H, O, H.',
      check: (s, ses) => raw(ses).rowH[1] === AFTER_RAW.rowH[1] },
    { id: 'site-col', text: 'The site names in column B are cut off: select the column with Ctrl+Space and AutoFit it with Alt, H, O, I.', keys: '→ Ctrl+Space then Alt H O I', requires: ['row-col-select', 'autofit'],
      teach: 'Ctrl+Space selects the entire column, and AutoFit Column Width (Alt, H, O, I) sizes it to its longest entry. Row and column selections are how you insert, delete, hide and resize, all of module 1.4. On a Mac, ⌃Space may be taken by the system; ⌘⇧↑ then ⌘⇧↓ from the top of a column does the job.',
      hintStuck: 'pulse column B · Ctrl+Space on any cell in column B, then Alt, H, O, I.',
      check: (s, ses) => onSheet(ses, 'Raw') && raw(ses).colW[2] === AFTER_RAW.colW[2] },
    { id: 'feed-count', text: 'Select the whole feed with Ctrl+A and read Count in the status bar: 357 of its 366 cells are filled, so nine are blank.', keys: 'Ctrl+A', requires: ['ctrl-a', 'status-bar'],
      teach: 'Ctrl+A selects the current region: the block of data around the active cell, bounded by blank rows and columns, and a second Ctrl+A takes the whole sheet. Count is how many cells hold something, so a feed that comes up short is a figure somebody still owes you. You’ll fill those nine in module 1.3.',
      hintStuck: 'pulse the Name Box · Land inside the feed first; from a blank cell Ctrl+A selects the whole sheet instead.',
      check: (s, ses) => onSheet(ses, 'Raw') && sel(s, 'A1:F61') && windowKeys(ses).includes('Ctrl+A') && !!ses.statusInfo().show },
    { id: 'in-use', text: 'Go home with Ctrl+Home and take everything in use with Ctrl+Shift+End: A1:N67, the feed, its notes and the two blocks beside it.', keys: 'Ctrl+Home then Ctrl+Shift+End', requires: ['ctrl-home-end'],
      teach: 'Ctrl+Shift+End selects from the active cell to the last used cell on the sheet, gaps included, where Ctrl+A stops at the first blank row. The Name Box tells you how far a sheet really runs before you send it or print it.',
      hintStuck: 'pulse the Name Box · Ctrl+Home, then Ctrl, Shift and End together.',
      check: (s, ses) => onSheet(ses, 'Raw') && sel(s, 'A1:N67') && windowKeys(ses).includes('Ctrl+Shift+End') },
  ],
  endState: [
    { text: 'The figure headers on Raw sit right over their numbers', check: (s, ses) => headersRight(ses) },
  ],
  wow: 'Select, then act: every selection did a job.',
  closing: [
    'Shift grows a selection; Ctrl+Shift grows it to the edge; Shift+Space and Ctrl+Space take a row or a column; Ctrl+A takes the block and Ctrl+Shift+End everything in use. Select, then act: the headers sit over their numbers, the header row has air and every site name reads in full.',
    'Next, the columns get matching widths and the notes get room of their own.',
  ],
  solution: 'Ctrl+PgDn Right Right Shift+Right Shift+Right Shift+Right Alt H A R Right Right Ctrl+Shift+Down Ctrl+Home Shift+Space Alt H O H "20" Enter Right Ctrl+Space Alt H O I Ctrl+A Ctrl+Home Ctrl+Shift+End',
};
