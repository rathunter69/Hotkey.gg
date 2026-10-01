// Chapter 1 · 1.2.2 — Select like you mean it (clearcoat-weekly, S1d → S1d)
// Every format, fill and formula pass starts with a selection: the Revenue block, the status bar
// over it, the header row, whole rows and columns, the feed, the sheet, everything in use. Nothing
// on the sheet changes. Goal 3 ends with Ctrl+Home (script-ch1.md has it at the start of goal 4) so
// that reading the status bar is a goal with a key of its own. The learner-facing words live in
// content/copy/*.csv.
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const sel = (s, text) => s.selectionText() === text;

export default {
  id: 'select-like-you-mean-it',
  chapter: 'foundations',
  section: 'Move and select',
  module: 'move-and-select',
  workbook: 'clearcoat-weekly',
  state: { before: 'S1d', after: 'S1d' },
  title: 'Select like you mean it',
  difficulty: 'easy',
  tags: ['selection'],
  access: 'free',
  minutes: 5,
  headline: 'Ctrl+Shift+↓',
  conventions: ['A5'],
  teaches: ['row-col-select', 'ctrl-a', 'select-all-sheet'],
  uses: ['ctrl-shift-arrow', 'ctrl-arrow', 'ctrl-home-end', 'sheet-tabs', 'status-bar'],
  prerequisites: ['jump-dont-scroll'],
  brief: 'Everything you format later starts with a selection: the highlighted cells are the ones a command acts on. Made with the mouse, a selection takes a drag and a scroll; made with the keyboard, it takes one or two presses. Shift and an arrow grows it a cell at a time, Ctrl+Shift and an arrow grows it to the edge of the data, Shift+Space takes a whole row, Ctrl+Space a whole column, and Ctrl+A takes the table. Practice the set on the feed. The key is `Ctrl+Shift+↓`.',
  goals: [
    { id: 'to-raw', teach: 'Ctrl+PgDn from Report; every selection in this lesson starts from a cell you’ve landed on by keyboard.', text: 'Move to Raw, where the selecting is.', keys: 'Ctrl+PgDn', requires: ['sheet-tabs'],
      check: (s, ses) => onSheet(ses, 'Raw') },
    { id: 'col-block', teach: 'Hold Ctrl and Shift together and press ↓: the selection runs from the active cell to the edge of the data, and the Name Box reads E1:E60.', text: 'Select Revenue from its header to the last figure: land on E1, then one Ctrl+Shift+↓.', keys: 'Ctrl+→ ← then Ctrl+Shift+↓', requires: ['ctrl-shift-arrow', 'ctrl-arrow'],
      check: (s, ses) => sel(s, 'E1:E60') && windowKeys(ses).includes('Ctrl+Shift+↓') },
    { id: 'status-bar', teach: 'Same status bar as 1.1.2, bigger selection: sixty cells summed with no formula written; do this on every column you’re about to use.', text: 'With E1:E60 still selected, read the status bar at the bottom of the window (sum, average, count), then come back to A1 with Ctrl+Home.', keys: 'Ctrl+Home', requires: ['status-bar', 'ctrl-home-end'],
      check: (s, ses) => at(s, 'A1') && windowKeys(ses).includes('Ctrl+Home') },
    { id: 'header-row', teach: 'Shift+Space selects the entire row of the active cell, edge to edge; any arrow key on its own collapses a selection back to one cell.', text: 'Select the whole header row with Shift+Space.', keys: 'Shift+Space', requires: ['row-col-select'],
      check: (s, ses) => sel(s, 'A1:Z1') && windowKeys(ses).includes('Shift+Space') },
    { id: 'whole-col', teach: 'Ctrl+Space selects the entire column; row and column selections are how you insert, delete, hide and resize.', text: 'Now the whole of column E with Ctrl+Space.', keys: 'Ctrl+→ ← then Ctrl+Space', requires: ['row-col-select', 'ctrl-arrow'],
      check: (s, ses) => sel(s, 'E1:E100') && windowKeys(ses).includes('Ctrl+Space') },
    { id: 'feed', teach: 'Ctrl+A selects the current region: the block of data around the active cell, bounded by blank rows and columns.', text: 'Select the whole feed in one press: Ctrl+A.', keys: 'Ctrl+A', requires: ['ctrl-a'],
      check: (s, ses) => sel(s, 'A1:F61') && windowKeys(ses).includes('Ctrl+A') },
    { id: 'sheet', teach: 'Ctrl+A again widens to every cell on the sheet: useful for a format you want everywhere, dangerous for anything else.', text: 'Press Ctrl+A a second time: the entire sheet.', keys: 'Ctrl+A', requires: ['select-all-sheet'],
      check: (s, ses) => sel(s, 'A1:Z100') && windowKeys(ses).includes('Ctrl+A') },
    { id: 'to-end', teach: 'Ctrl+Shift+End selects from the active cell to the last used cell on the sheet, gaps included; Ctrl+A stops at the first blank row, Ctrl+Shift+End doesn’t.', text: 'Go home to A1 with Ctrl+Home, then take everything in use (feed, notes and the totals block) with Ctrl+Shift+End.', keys: 'Ctrl+Home then Ctrl+Shift+End', requires: ['ctrl-home-end'],
      check: (s, ses) => sel(s, 'A1:N67') && windowKeys(ses).includes('Ctrl+Shift+End') },
  ],
  wow: 'A table of any size, selected in two presses.',
  closing: [
    'Shift grows a selection; Ctrl+Shift grows it to the edge; Shift+Space and Ctrl+Space take a row or a column; Ctrl+A takes the block. Every format, fill and paste in this course starts with one of those.',
    'Next, making room and making things fit.',
  ],
  solution: 'Ctrl+PgDn Ctrl+Right Left Ctrl+Shift+Down Ctrl+Home Shift+Space Ctrl+Right Left Ctrl+Space Ctrl+A Ctrl+A Ctrl+Home Ctrl+Shift+End',
};
