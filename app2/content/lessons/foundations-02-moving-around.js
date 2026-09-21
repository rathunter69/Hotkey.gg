// Foundations 2 — Moving around the worksheet
const REPORT = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
  A10: { value: 'Prepared by' }, B10: { value: 'Sales team' },
};
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

export default {
  id: 'foundations-02-moving-around',
  chapter: 'foundations',
  title: 'Moving around the worksheet',
  difficulty: 'easy',
  tags: ['navigation'],
  access: 'free',
  concepts: ['ctrl-arrow', 'home-key', 'ctrl-home-end', 'enter-tab-move'],
  prerequisites: ['foundations-01-active-cell'],
  sheet: { cells: REPORT, active: { r: 3, c: 1 } },
  steps: [
    { mode: 'teach', title: 'Jumping instead of stepping', body: [
      'One arrow press moves one cell. Hold `Ctrl` with an arrow key and the active cell jumps to the edge of the current block of data. From Monday in A3, `Ctrl+↓` lands on Friday in A7, the last day before the empty row.',
      'From an empty cell, `Ctrl+Arrow` jumps to the next cell that contains something. That is how you cross a gap.',
      '`Home` moves to column A of the current row. `Ctrl+Home` goes to A1. `Ctrl+End` goes to the bottom-right corner of the used area: the last row that holds anything and the last column that holds anything, even if that corner cell itself is empty.',
      '`Enter` moves the active cell down one row and `Tab` moves it right one column, even when you have not typed anything.',
    ] },
    { mode: 'guided' },
    { mode: 'solo' },
    { mode: 'timed', par: 10 },
  ],
  goals: [
    { id: 'ctrl-down', text: 'From Monday, jump to Friday (A7) with Ctrl+↓', keys: 'Ctrl+↓', requires: ['ctrl-arrow'], check: (s, ses) => at(s, 'A7') && used(ses, 'Ctrl+↓') },
    { id: 'ctrl-right', text: 'Jump to the last column of the Friday row, C7, with Ctrl+→', keys: 'Ctrl+→', requires: ['ctrl-arrow'], check: (s, ses) => at(s, 'C7') && used(ses, 'Ctrl+→') },
    { id: 'home', text: 'Press Home to return to column A of the Friday row', keys: 'Home', requires: ['home-key'], check: (s, ses) => at(s, 'A7') && used(ses, 'Home') },
    { id: 'ctrl-end', text: 'Jump to the bottom-right corner of the used area, C10, with Ctrl+End', keys: 'Ctrl+End', requires: ['ctrl-home-end'], check: (s, ses) => at(s, 'C10') && used(ses, 'Ctrl+End') },
    { id: 'ctrl-home', text: 'Return to A1 with Ctrl+Home', keys: 'Ctrl+Home', requires: ['ctrl-home-end'], check: (s, ses) => at(s, 'A1') && used(ses, 'Ctrl+Home') },
    { id: 'enter-tab', text: 'Move to B2, the Sales header, with one Enter and one Tab', keys: 'Enter Tab', requires: ['enter-tab-move'], check: (s, ses) => at(s, 'B2') && used(ses, '↵') && used(ses, 'Tab') },
  ],
  solution: 'Ctrl+Down Ctrl+Right Home Ctrl+End Ctrl+Home Enter Tab',
};
