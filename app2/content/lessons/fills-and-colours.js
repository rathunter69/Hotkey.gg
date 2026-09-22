// Foundations · The Ribbon and dialogs — Fills, font colours and alignment
const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
};

export default {
  id: 'fills-and-colours',
  chapter: 'foundations',
  section: 'The Ribbon and dialogs',
  title: 'Fills, font colours and alignment',
  difficulty: 'medium',
  tags: ['formatting', 'ribbon'],
  access: 'free',
  concepts: ['fills-and-colours'],
  prerequisites: ['format-cells-tabs', 'page-setup'],
  read: 'Colour on a sheet is information: a filled header row reads as a header, and blue figures mean someone typed them. In this lesson you fill the headers, colour the inputs blue by the model convention, and finish the alignment. Done consistently, a reader can audit your sheet at a glance.',
  sheet: { cells: SHEET, active: { r: 2, c: 1 }, colW: { 1: 84 } },
  par: 16,
  goals: [
    { id: 'fill-headers', teach: 'Fill Color is Alt, H, H then a letter or arrows; a fill marks a cell, never its value.', text: 'Select the header row A2:C2 and fill it yellow with Alt, H, H, Y.', keys: 'Shift+→ ×2 then Alt H H Y', requires: ['fills-and-colours', 'shift-arrow'], check: s => ['A2', 'B2', 'C2'].every(r => s.cellAt(r).fill === 'yellow') },
    { id: 'blue-inputs', text: 'Select the typed figures B3:C7 and colour them blue with Alt, H, F, C.', keys: 'Ctrl+G "B3:C7" ↵ then Alt H F C → ×4 ↵', requires: ['font-color', 'input-colour-convention', 'go-to'], check: s => ['B3', 'C5', 'B7', 'C7'].every(r => s.cellAt(r).fontColor === 'blue') },
    { id: 'right-align', text: 'Right-align the Units header in C2 with Alt, H, A, R.', keys: 'Ctrl+G "C2" ↵ then Alt H A R', requires: ['align-command', 'go-to'], check: s => s.cellAt('C2').align === 'r' },
    { id: 'indent-days', text: 'Select the day names A3:A7 and indent them one step with Alt, H, 6.', keys: 'Ctrl+G "A3:A7" ↵ then Alt H 6', requires: ['align-command', 'go-to'], check: s => ['A3', 'A5', 'A7'].every(r => s.cellAt(r).indent === 1) },
  ],
  endState: [
    { text: 'The header row is still filled yellow', check: s => ['A2', 'B2', 'C2'].every(r => s.cellAt(r).fill === 'yellow') },
    { text: 'The inputs are still blue', check: s => ['B3', 'C7'].every(r => s.cellAt(r).fontColor === 'blue') },
    { text: 'C2 is still right-aligned', check: s => s.cellAt('C2').align === 'r' },
  ],
  closing: ['Blue for typed inputs, black for formulas, green for links to other sheets: the convention every bank teaches. From Chapter 2 on, the graders check it.'],
  solution: 'Shift+Right Shift+Right Alt H H Y Ctrl+G "B3:C7" Enter Alt H F C Right Right Right Right Enter Ctrl+G "C2" Enter Alt H A R Ctrl+G "A3:A7" Enter Alt H 6',
};
