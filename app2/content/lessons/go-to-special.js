// Foundations · Selecting — Go To Special
// A sales block with gaps and a formula column: Go To Special picks each population apart.
const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Check', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { formula: '=B3*0.1' },
  A4: { value: 'Tuesday' }, C4: { formula: '=B4*0.1' },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { formula: '=B5*0.1' },
  A6: { value: 'Thursday' }, C6: { formula: '=B6*0.1' },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { formula: '=B7*0.1' },
};
const multiIs = (s, keys) => Array.isArray(s.multi) && s.multi.join(',') === keys;

export default {
  id: 'go-to-special',
  chapter: 'foundations',
  section: 'Selecting',
  title: 'Go To Special',
  difficulty: 'medium',
  tags: ['selection', 'auditing'],
  access: 'free',
  concepts: ['go-to-special'],
  prerequisites: ['select-blocks'],
  read: 'Some selections are not rectangles: the blanks in a column, every hardcoded constant, every formula. In this lesson Go To Special (Alt, H, F, D, S) selects each of those populations inside the sales block. It is the fastest honest answer to “which cells here are typed in, and which calculate?”.',
  sheet: { cells: SHEET, active: { r: 3, c: 2 }, colW: { 1: 84 } },
  par: 15,
  goals: [
    { id: 'blanks', teach: 'Go To Special (Alt, H, F, D, S) selects every blank, constant or formula cell inside the selection.', text: 'Select B3:B7, then use Go To Special to select its blanks — the two missing days.', keys: 'Ctrl+G "B3:B7" ↵ then Alt H F D S ↵', requires: ['go-to-special', 'go-to'], check: (s, ses) => !ses.dialog && multiIs(s, 'B4,B6') },
    { id: 'constants', text: 'Select B3:B7 again and pick out the constants, the figures someone typed.', keys: 'Ctrl+G "B3:B7" ↵ then Alt H F D S O ↵', requires: ['go-to-special', 'go-to'], check: (s, ses) => !ses.dialog && multiIs(s, 'B3,B5,B7') },
    { id: 'formulas', text: 'Select C3:C7 and pick out the formulas — here, all of them.', keys: 'Ctrl+G "C3:C7" ↵ then Alt H F D S F ↵', requires: ['go-to-special', 'go-to'], check: (s, ses) => !ses.dialog && multiIs(s, 'C3,C4,C5,C6,C7') },
  ],
  closing: ['A special selection is a list of cells, not a rectangle — the Name Box shows them joined by commas, and formatting or Ctrl+Enter lands on exactly those cells. Chapter 3 uses this to hunt hardcodes in real models.'],
  solution: 'Ctrl+G "B3:B7" Enter Alt H F D S Enter Ctrl+G "B3:B7" Enter Alt H F D S O Enter Ctrl+G "C3:C7" Enter Alt H F D S F Enter',
};
