// Foundations · Selecting — Selecting a range
const REPORT = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
};
const sel = (sheet, ref) => sheet.selectionText() === ref;
/** The whole of row `r` is selected, whatever the sheet's width. */
const wholeRow = (sheet, r) => { const g = sheet.selRange(); return !!sheet.sel && g.r1 === r && g.r2 === r && g.c1 === 1 && g.c2 === sheet.cols; };
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

export default {
  id: 'selecting-ranges',
  chapter: 'foundations',
  section: 'Selecting',
  title: 'Selecting a range',
  difficulty: 'easy',
  tags: ['selection'],
  access: 'free',
  concepts: ['range', 'shift-arrow', 'ctrl-shift-arrow', 'row-col-select', 'ctrl-a'],
  prerequisites: ['moving-around'],
  read: 'Formatting, copying and formulas all start with a selection. In this lesson you select ranges of the Weekly Sales Report from the keyboard: a column of figures, a whole row and the entire block. Selecting without the mouse is the habit that makes everything after it quick.',
  sheet: { cells: REPORT, active: { r: 1, c: 1 }, colW: { 1: 84 } },   // column A fitted to its day names, as an author would
  par: 12,
  goals: [
    { id: 'b3-b7', teach: 'A range is a block of cells, and Shift+Arrow extends the selection one cell at a time from the active cell.', text: 'Select the Sales figures B3:B7.', keys: '→ ↓ ↓ then Shift+↓ ×4', requires: ['shift-arrow', 'range'], check: s => sel(s, 'B3:B7') },
    { id: 'c3-c7', teach: 'Ctrl+Shift+Arrow extends the selection to the edge of the data in one press.', text: 'Select the Units figures C3:C7 with a single press.', keys: '→ then Ctrl+Shift+↓', requires: ['ctrl-shift-arrow'], check: (s, ses) => sel(s, 'C3:C7') && used(ses, 'Ctrl+Shift+↓') },
    { id: 'row-2', teach: 'Shift+Space selects the whole row and Ctrl+Space the whole column.', text: 'Select the whole header row 2.', keys: '↑ then Shift+Space', requires: ['row-col-select'], check: s => wholeRow(s, 2) },
    { id: 'region', teach: 'Ctrl+A selects the current region: the whole block of data around the active cell.', text: 'Select the whole report, A1:C7.', keys: 'Ctrl+A', requires: ['ctrl-a'], check: s => sel(s, 'A1:C7') },
  ],
  solution: 'Right Down Down Shift+Down Shift+Down Shift+Down Shift+Down Right Ctrl+Shift+Down Up Shift+Space Ctrl+A',
};
