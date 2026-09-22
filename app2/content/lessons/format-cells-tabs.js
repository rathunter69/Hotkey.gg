// Foundations · The Ribbon and dialogs — Format Cells, tab by tab
const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
};
const ring = ['A2', 'B2', 'C2', 'A7', 'B7', 'C7'];

export default {
  id: 'format-cells-tabs',
  chapter: 'foundations',
  section: 'The Ribbon and dialogs',
  title: 'Format Cells, tab by tab',
  difficulty: 'medium',
  tags: ['formatting', 'dialogs'],
  access: 'free',
  concepts: ['format-cells-tabs', 'center-across'],
  prerequisites: ['home-tab-tour'],
  read: 'Format Cells is one dialog box with everything: number formats, alignment, borders. In this lesson its categories answer to their first letter — N for Number, A for Center Across — and the Borders menu boxes the table. This is how a raw block becomes a page someone can read.',
  sheet: { cells: SHEET, active: { r: 3, c: 2 }, colW: { 1: 84 } },
  par: 18,
  goals: [
    { id: 'comma', teach: 'The Format Cells categories answer to their first letter: N Number, C Currency, P Percentage, A Center Across.', text: 'Select the Sales figures B3:B7 and give them the Number format with Ctrl+1, N.', keys: 'Ctrl+Shift+↓ then Ctrl+1 N', requires: ['format-cells-tabs', 'ctrl-shift-arrow'], check: s => ['B3', 'B4', 'B5', 'B6', 'B7'].every(r => s.cellAt(r).fmtStyle === 'comma') },
    { id: 'center-across', teach: 'Center Across Selection (Format Cells, A) centres a title over columns without merging cells.', text: 'Select A1:C1 and centre the title across the table with Ctrl+1, A.', keys: 'Ctrl+G "A1:C1" ↵ then Ctrl+1 A', requires: ['center-across', 'go-to'], check: s => s.cellAt('A1').ca === 3 },
    { id: 'all-borders', text: 'Select the table A2:C7 and rule every cell with All Borders, Alt, H, B, A.', keys: 'Ctrl+G "A2:C7" ↵ then Alt H B A', requires: ['borders-menu', 'go-to'], check: s => ['A2', 'B4', 'C7'].every(r => s.cellAt(r).ball === true) },
    { id: 'thick-ring', text: 'With the table still selected, ring it with a thick outside border, Alt, H, B, T.', keys: 'Alt H B T', requires: ['borders-menu'], check: s => ring.every(r => s.cellAt(r).thick === true) && s.cellAt('B2').bt === true && s.cellAt('B7').bb === true },
  ],
  endState: [
    { text: 'B3:B7 still show the Number format', check: s => ['B3', 'B4', 'B5', 'B6', 'B7'].every(r => s.cellAt(r).fmtStyle === 'comma') },
    { text: 'The title is still centred across A1:C1', check: s => s.cellAt('A1').ca === 3 },
    { text: 'The table still has its borders', check: s => s.cellAt('B4').ball === true },
  ],
  closing: ['Center Across Selection does what merged cells pretend to: the title sits centred, and every underlying cell stays selectable and sortable. Models never merge.'],
  solution: 'Ctrl+Shift+Down Ctrl+1 N Ctrl+G "A1:C1" Enter Ctrl+1 A Ctrl+G "A2:C7" Enter Alt H B A Alt H B T',
};
