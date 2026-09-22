// Foundations · Rows, columns and sheets — Column widths and row heights
const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 },
  A4: { value: 'Tuesday' }, B4: { value: 950 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 },
  A6: { value: 'Thursday' }, B6: { value: 1100 },
  A7: { value: 'Friday' }, B7: { value: 1675 },
  A10: { value: 'Prepared by the finance team' },
};

export default {
  id: 'widths-heights',
  chapter: 'foundations',
  section: 'Rows, columns and sheets',
  title: 'Column widths and row heights',
  difficulty: 'easy',
  tags: ['structure', 'formatting'],
  access: 'free',
  concepts: ['column-width', 'row-height', 'autofit'],
  prerequisites: ['insert-delete-rows'],
  read: 'A column that clips its labels, a cramped header row: sizing is part of making a page readable. In this lesson you set an exact column width and row height from the Format menu, and let AutoFit size to the content. Consistent widths are one of the formatting standards banks check.',
  sheet: { cells: SHEET, active: { r: 3, c: 2 }, colW: {} },
  par: 14,
  goals: [
    { id: 'col-width', teach: 'Column Width (Alt, H, O, W) sets the selected columns’ width in Excel units.', text: 'Set column B, the Sales column, to a width of 14.', keys: 'Alt H O W 14 ↵', requires: ['column-width'], check: s => s.colW[2] === 103 && s.colSet[2] === true },
    { id: 'autofit-col', teach: 'AutoFit (Alt, H, O, I for width, Alt, H, O, A for height) sizes to the content.', text: 'Move to the long note in A10 and AutoFit column A to it.', keys: 'Ctrl+G "A10" ↵ then Alt H O I', requires: ['autofit', 'go-to'], check: s => s.colSet[1] === true && s.colW[1] === s.neededWidth(1) && s.colW[1] > 100 },
    { id: 'row-height', teach: 'Row Height (Alt, H, O, H) sets the selected rows’ height in points.', text: 'Give the header row 2 a height of 30 points.', keys: 'Ctrl+G "A2" ↵ then Alt H O H 30 ↵', requires: ['row-height', 'go-to'], check: s => s.rowH[2] === 40 },
    { id: 'autofit-row', text: 'AutoFit the header row’s height back to normal with Alt, H, O, A.', keys: 'Alt H O A', requires: ['autofit'], check: s => s.rowH[2] === 20 },
  ],
  endState: [
    { text: 'Column B still has its set width of 14', check: s => s.colW[2] === 103 },
  ],
  closing: ['Excel measures column width in characters of the standard font and row height in points — the numbers you set here (14 wide, 30 high) are the ones a colleague’s Excel will show.'],
  solution: 'Alt H O W 14 Enter Ctrl+G "A10" Enter Alt H O I Ctrl+G "A2" Enter Alt H O H 30 Enter Alt H O A',
};
