// Foundations 3 — Selecting a range
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
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

export default {
  id: 'foundations-03-selecting-ranges',
  chapter: 'foundations',
  title: 'Selecting a range',
  difficulty: 'easy',
  tags: ['selection'],
  access: 'free',
  concepts: ['range', 'shift-arrow', 'ctrl-shift-arrow', 'row-col-select', 'ctrl-a'],
  prerequisites: ['foundations-02-moving-around'],
  sheet: { cells: REPORT, active: { r: 1, c: 1 } },
  steps: [
    { mode: 'teach', title: 'Ranges', body: [
      'A range is a rectangular block of cells. It is written as its top-left cell, a colon, and its bottom-right cell: B3:B7 is the five Sales figures.',
      'To select a range, put the active cell on one corner, then hold `Shift` and press an arrow key. Each press extends the selection by one cell. The selection turns grey; the active cell stays white inside it, and the Name Box still shows the active cell.',
      '`Ctrl+Shift+Arrow` extends the selection to the edge of the data in one press, exactly as `Ctrl+Arrow` jumps there.',
      '`Shift+Space` selects the entire row of the active cell. `Ctrl+Space` selects the entire column. `Ctrl+A` selects the current region: the whole block of data around the active cell.',
    ] },
    { mode: 'guided' },
    { mode: 'solo' },
    { mode: 'timed', par: 12 },
  ],
  goals: [
    { id: 'b3-b7', text: 'Select the Sales figures B3:B7 with Shift+↓', keys: '→ ↓ ↓ then Shift+↓ ×4', requires: ['shift-arrow', 'range'], check: s => sel(s, 'B3:B7') },
    { id: 'c3-c7', text: 'Select the Units figures C3:C7 with a single Ctrl+Shift+↓', keys: '→ then Ctrl+Shift+↓', requires: ['ctrl-shift-arrow'], check: (s, ses) => sel(s, 'C3:C7') && used(ses, 'Ctrl+Shift+↓') },
    { id: 'row-2', text: 'Select the whole header row 2 with Shift+Space', keys: '↑ then Shift+Space', requires: ['row-col-select'], check: s => sel(s, 'A2:J2') },
    { id: 'region', text: 'Select the whole report, A1:C7, with Ctrl+A', keys: 'Ctrl+A', requires: ['ctrl-a'], check: s => sel(s, 'A1:C7') },
  ],
  solution: 'Right Down Down Shift+Down Shift+Down Shift+Down Shift+Down Right Ctrl+Shift+Down Up Shift+Space Ctrl+A',
};
