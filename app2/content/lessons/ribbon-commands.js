// Foundations · The Ribbon and dialogs — The Ribbon: tabs and commands
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
  id: 'ribbon-commands',
  chapter: 'foundations',
  section: 'The Ribbon and dialogs',
  title: 'The Ribbon: tabs and commands',
  difficulty: 'medium',
  tags: ['ribbon', 'formatting'],
  access: 'free',
  concepts: ['ribbon', 'keytips', 'home-tab', 'bold-command', 'borders-menu', 'align-command', 'escape-backs-out'],
  prerequisites: ['selecting-ranges', 'editing-cells'],
  read: 'The Ribbon holds every command in Excel, and Alt lets you reach any of them from the keyboard. In this lesson you format the Weekly Sales Report with KeyTips, pressing the keys one after another and backing out with Esc: bold, a border and centered headers. Ribbon chords are how fast users format without touching the mouse.',
  sheet: { cells: START, active: { r: 1, c: 1 } },
  par: 25,
  goals: [
    { id: 'bold-title', teach: 'Alt shows a KeyTip on every tab, H opens Home, and the next KeyTip runs a command: Alt, H, 1 is Bold.', text: 'Make the title Weekly Sales Report bold.', keys: 'Alt H 1', requires: ['keytips', 'home-tab', 'bold-command'], check: s => cell(s, 'A1').bold === true },
    { id: 'bold-headers', text: 'Select the headers Day, Sales and Units (A2:C2) and make them bold.', keys: '↓ Shift+→ Shift+→ then Alt H 1', requires: ['bold-command', 'shift-arrow'], check: s => ['A2', 'B2', 'C2'].every(r => cell(s, r).bold === true) },
    { id: 'border-friday', teach: 'Some commands open a menu of choices: Alt, H, B opens Borders and O picks Bottom Border.', text: 'Put a bottom border under the Friday figures B7:C7.', keys: '→ ↓ ×5 Shift+→ then Alt H B O', requires: ['borders-menu', 'shift-arrow'], check: s => cell(s, 'B7').bb === true && cell(s, 'C7').bb === true },
    { id: 'center-headers', teach: 'Alignment works the same way: Alt, H, A, C centers the selection.', text: 'Center the Sales and Units headers (B2:C2).', keys: '↑ ×5 Shift+→ then Alt H A C', requires: ['align-command', 'shift-arrow'], check: s => cell(s, 'B2').align === 'c' && cell(s, 'C2').align === 'c' },
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
