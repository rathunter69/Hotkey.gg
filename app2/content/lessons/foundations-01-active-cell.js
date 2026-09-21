// Foundations 1 — The active cell
const REPORT = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
};
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;

export default {
  id: 'foundations-01-active-cell',
  chapter: 'foundations',
  section: 'The worksheet',
  title: 'The active cell',
  difficulty: 'easy',
  tags: ['navigation', 'basics'],
  access: 'free',
  concepts: ['worksheet', 'cell-reference', 'active-cell', 'name-box', 'formula-bar', 'arrow-keys'],
  prerequisites: [],
  sheet: { cells: REPORT, active: { r: 1, c: 1 } },
  steps: [
    { mode: 'teach', title: 'The worksheet, cells and the active cell', body: [
      'A worksheet is a grid of cells. Columns are lettered across the top and rows are numbered down the left side.',
      'A cell reference is the column letter followed by the row number. B3 is the cell in column B, row 3: the Sales figure for Monday.',
      'One cell is always the active cell. It has the green outline, and the Name Box at the left of the Formula Bar shows its reference.',
      'The arrow keys `↑` `↓` `←` `→` move the active cell one cell at a time. Watch the Name Box change as you move.',
    ] },
    { mode: 'guided' },
    { mode: 'solo' },
    { mode: 'timed', par: 12 },
  ],
  goals: [
    { id: 'to-b3', text: 'Make B3 (Monday, 1200) the active cell', keys: '→ ↓ ↓', requires: ['arrow-keys', 'cell-reference'], check: s => at(s, 'B3') },
    { id: 'to-c7', text: 'Move the active cell to C7, the Units for Friday', keys: '→ ↓ ↓ ↓ ↓', requires: ['arrow-keys', 'cell-reference'], check: s => at(s, 'C7') },
    { id: 'to-a1', text: 'Return the active cell to A1, the report title', keys: '← ← ↑ ↑ ↑ ↑ ↑ ↑', requires: ['arrow-keys'], check: s => at(s, 'A1') },
  ],
  solution: 'Right Down Down Right Down Down Down Down Left Left Up Up Up Up Up Up',
};
