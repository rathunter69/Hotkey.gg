// Foundations · Moving — The active cell
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
  id: 'active-cell',
  chapter: 'foundations',
  section: 'Moving',
  title: 'The active cell',
  difficulty: 'easy',
  tags: ['navigation', 'basics'],
  access: 'free',
  concepts: ['worksheet', 'cell-reference', 'active-cell', 'name-box', 'formula-bar', 'arrow-keys'],
  prerequisites: [],
  read: 'A worksheet is a grid of cells, and one of them is always the active cell: the one with the green outline. In this lesson you move it around the Weekly Sales Report with the arrow keys and watch its reference in the Name Box. Knowing exactly where you are is the start of everything else in Excel.',
  sheet: { cells: REPORT, active: { r: 1, c: 1 }, colW: { 1: 84 } },   // column A fitted to its day names, as an author would
  par: 12,
  goals: [
    { id: 'to-b3', teach: 'The arrow keys move the active cell one cell at a time, and the Name Box shows its reference: column letter, then row number.', text: 'Make B3, the Monday Sales of 1200, the active cell.', keys: '→ ↓ ↓', requires: ['arrow-keys', 'cell-reference'], check: s => at(s, 'B3') },
    { id: 'to-c7', text: 'Move to C7, the Units for Friday.', keys: '→ ↓ ↓ ↓ ↓', requires: ['arrow-keys', 'cell-reference'], check: s => at(s, 'C7') },
    { id: 'to-a1', text: 'Return to A1, the report title.', keys: '← ← ↑ ↑ ↑ ↑ ↑ ↑', requires: ['arrow-keys'], check: s => at(s, 'A1') },
  ],
  solution: 'Right Down Down Right Down Down Down Down Left Left Up Up Up Up Up Up',
};
