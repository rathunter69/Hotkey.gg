// Foundations · Moving — Moving around the worksheet
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
  id: 'moving-around',
  chapter: 'foundations',
  section: 'Moving',
  title: 'Moving around the worksheet',
  difficulty: 'easy',
  tags: ['navigation'],
  access: 'free',
  concepts: ['ctrl-arrow', 'home-key', 'ctrl-home-end', 'enter-tab-move'],
  prerequisites: ['active-cell'],
  read: 'One arrow press moves one cell, which is slow on a real sheet. In this lesson you jump around the Weekly Sales Report with Ctrl, Home and End instead. This makes you much faster on sheets full of data.',
  sheet: { cells: REPORT, active: { r: 3, c: 1 }, colW: { 1: 84 } },   // column A fitted to its day names, as an author would
  par: 10,
  goals: [
    { id: 'ctrl-down', teach: 'Ctrl+↓ jumps to the edge of the data.', text: 'Move from A3 (Monday) to A7 (Friday).', keys: 'Ctrl+↓', requires: ['ctrl-arrow'], check: (s, ses) => at(s, 'A7') && used(ses, 'Ctrl+↓') },
    { id: 'ctrl-right', text: 'Jump to C7, the last column of the Friday row.', keys: 'Ctrl+→', requires: ['ctrl-arrow'], check: (s, ses) => at(s, 'C7') && used(ses, 'Ctrl+→') },
    { id: 'home', teach: 'Home moves to column A of the current row.', text: 'Return to A7.', keys: 'Home', requires: ['home-key'], check: (s, ses) => at(s, 'A7') && used(ses, 'Home') },
    { id: 'ctrl-end', teach: 'Ctrl+End jumps to the last used cell, even when that corner is empty, and Ctrl+Home goes back to A1.', text: 'Go to C10, the bottom-right corner of the used area.', keys: 'Ctrl+End', requires: ['ctrl-home-end'], check: (s, ses) => at(s, 'C10') && used(ses, 'Ctrl+End') },
    { id: 'ctrl-home', text: 'Return to A1.', keys: 'Ctrl+Home', requires: ['ctrl-home-end'], check: (s, ses) => at(s, 'A1') && used(ses, 'Ctrl+Home') },
    { id: 'enter-tab', teach: 'Enter moves down one row and Tab moves right one column, even with nothing typed.', text: 'Move to B2, the Sales header, with one Enter and one Tab.', keys: 'Enter Tab', requires: ['enter-tab-move'], check: (s, ses) => at(s, 'B2') && used(ses, '↵') && used(ses, 'Tab') },
  ],
  solution: 'Ctrl+Down Ctrl+Right Home Ctrl+End Ctrl+Home Enter Tab',
};
