// Foundations 6 — The Ribbon: tabs and commands
const START = {
  A1: { value: 'Weekly Sales Report' },
  A2: { value: 'Day' }, B2: { value: 'Sales' }, C2: { value: 'Units' },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
  A8: { value: 'Total' }, B8: { value: 6355 }, C8: { value: 209 },
};
const cell = (s, ref) => s.cellAt(ref);

export default {
  id: 'foundations-06-ribbon-commands',
  chapter: 'foundations',
  title: 'The Ribbon: tabs and commands',
  difficulty: 'medium',
  tags: ['ribbon', 'formatting'],
  access: 'free',
  concepts: ['ribbon', 'keytips', 'home-tab', 'bold-command', 'borders-menu', 'align-command', 'escape-backs-out'],
  prerequisites: ['foundations-03-selecting-ranges', 'foundations-05-editing-cells'],
  sheet: { cells: START, active: { r: 1, c: 1 } },
  steps: [
    { mode: 'teach', title: 'KeyTips', body: [
      'The Ribbon runs across the top of Excel. Its commands are grouped into tabs: Home, Insert, Page Layout, Formulas, Data, Review and View. The Home tab holds the everyday formatting commands.',
      'Press `Alt` on its own and KeyTips appear: a letter badge on every tab. Press `H` to open the Home tab and every command shows its own KeyTip. The sequence `Alt` `H` `1` applies Bold to the selected cells.',
      'Some commands open a menu of further choices. `Alt` `H` `B` opens the Borders menu; pressing `O` then applies a Bottom Border. Alignment works the same way: `Alt` `H` `A` then `C` centers the selection.',
      'Press `Esc` to back out of the Ribbon one level at a time. Press the keys one after another, not held down together.',
    ] },
    { mode: 'guided' },
    { mode: 'solo' },
    { mode: 'timed', par: 25 },
  ],
  goals: [
    { id: 'bold-title', text: 'Make the title Weekly Sales Report bold with Alt, H, 1', keys: 'Alt H 1', requires: ['keytips', 'home-tab', 'bold-command'], check: s => cell(s, 'A1').bold === true },
    { id: 'bold-headers', text: 'Select the headers Day, Sales and Units (A2:C2) and make them bold', keys: '↓ Shift+→ Shift+→ then Alt H 1', requires: ['bold-command', 'shift-arrow'], check: s => ['A2', 'B2', 'C2'].every(r => cell(s, r).bold === true) },
    { id: 'border-friday', text: 'Put a bottom border under the Friday figures B7:C7 with Alt, H, B, O', keys: '→ ↓ ×5 Shift+→ then Alt H B O', requires: ['borders-menu', 'shift-arrow'], check: s => cell(s, 'B7').bb === true && cell(s, 'C7').bb === true },
    { id: 'center-headers', text: 'Center the Sales and Units headers (B2:C2) with Alt, H, A, C', keys: '↑ ×5 Shift+→ then Alt H A C', requires: ['align-command', 'shift-arrow'], check: s => cell(s, 'B2').align === 'c' && cell(s, 'C2').align === 'c' },
  ],
  // Goals latch, so the formats they leave behind are restated here: undoing one after its tick
  // keeps the lesson open until it is reapplied.
  endState: [
    { text: 'The title and the headers are still bold', check: s => ['A1', 'A2', 'B2', 'C2'].every(r => cell(s, r).bold === true) },
    { text: 'The bottom border under B7:C7 is still in place', check: s => ['B7', 'C7'].every(r => cell(s, r).bb === true) },
    { text: 'The Sales and Units headers are still centered', check: s => ['B2', 'C2'].every(r => cell(s, r).align === 'c') },
  ],
  solution: 'Alt H 1 Down Shift+Right Shift+Right Alt H 1 Right Down Down Down Down Down Shift+Right Alt H B O Up Up Up Up Up Shift+Right Alt H A C',
};
