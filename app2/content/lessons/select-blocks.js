// Foundations · Selecting — Whole rows, columns and the sheet
const REPORT = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
};
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

export default {
  id: 'select-blocks',
  chapter: 'foundations',
  section: 'Selecting',
  title: 'Whole rows, columns and the sheet',
  difficulty: 'easy',
  tags: ['selection'],
  access: 'free',
  concepts: ['select-all-sheet'],
  prerequisites: ['selecting-ranges', 'go-to-cells'],
  read: 'Formatting and structure work lands on whole rows, whole columns or the whole block at once. In this lesson you select the Units column, the header row, the report region and the entire sheet without touching the mouse. These selections are the setup step for almost every command that follows.',
  sheet: { cells: REPORT, active: { r: 3, c: 3 }, colW: { 1: 84 } },
  par: 8,
  goals: [
    { id: 'col', text: 'Select the whole of column C, the Units column, with Ctrl+Space.', keys: 'Ctrl+Space', requires: ['row-col-select'], check: (s, ses) => s.selectionText() === 'C1:C100' && used(ses, 'Ctrl+Space') },
    { id: 'row', text: 'Move to A2 and select the whole header row with Shift+Space.', keys: 'Ctrl+G "A2" ↵ then Shift+Space', requires: ['row-col-select', 'go-to'], check: (s, ses) => s.selectionText() === 'A2:Z2' && used(ses, 'Shift+Space') },
    { id: 'region', text: 'From B4, select the report block with one Ctrl+A.', keys: 'Ctrl+G "B4" ↵ then Ctrl+A', requires: ['ctrl-a', 'go-to'], check: (s, ses) => s.selectionText() === 'A1:C7' && used(ses, 'Ctrl+A') },
    { id: 'sheet', teach: 'Ctrl+A selects the current region; pressed again it selects the whole sheet.', text: 'Press Ctrl+A a second time to select the entire sheet.', keys: 'Ctrl+A', requires: ['select-all-sheet'], check: (s, ses) => s.selectionText() === 'A1:Z100' && used(ses, 'Ctrl+A') },
    { id: 'region-back', text: 'Snap back to just the report block with Ctrl+Shift+Space.', keys: 'Ctrl+Shift+Space', requires: ['ctrl-a'], check: (s, ses) => s.selectionText() === 'A1:C7' && used(ses, 'Ctrl+Shift+Space') },
  ],
  solution: 'Ctrl+Space Ctrl+G "A2" Enter Shift+Space Ctrl+G "B4" Enter Ctrl+A Ctrl+A Ctrl+Shift+Space',
};
