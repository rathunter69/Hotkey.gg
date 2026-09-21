// Foundations 4 — Entering data
const START = {
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, A4: { value: 'Tuesday' }, A5: { value: 'Wednesday' }, A6: { value: 'Thursday' }, A7: { value: 'Friday' },
  B8: { value: 'draft' },
};
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;

export default {
  id: 'foundations-04-entering-data',
  chapter: 'foundations',
  title: 'Entering data',
  difficulty: 'easy',
  tags: ['data-entry'],
  access: 'free',
  concepts: ['type-to-enter', 'enter-commits', 'tab-commits', 'escape-cancels', 'text-vs-number', 'delete-clears'],
  prerequisites: ['foundations-02-moving-around'],
  sheet: { cells: START, active: { r: 1, c: 1 } },
  steps: [
    { mode: 'teach', title: 'Typing into cells', body: [
      'Select a cell and type. What you type appears in the cell and in the Formula Bar at the same time. Nothing is stored until you confirm the entry.',
      '`Enter` confirms the entry and moves the active cell down. `Tab` confirms it and moves right. `Esc` throws the entry away and leaves the cell as it was.',
      'Excel tells text and numbers apart on its own: text lines up on the left of the cell, numbers line up on the right. Type 1200 and it becomes a number you can add up later.',
      '`Delete` clears the contents of the selected cells without opening them for editing.',
    ] },
    { mode: 'guided' },
    { mode: 'solo' },
    { mode: 'timed', par: 40 },
  ],
  goals: [
    { id: 'title', text: 'In A1, type Weekly Sales Report and press Enter', keys: 'type, then Enter', requires: ['type-to-enter', 'enter-commits'], check: s => s.value('A1') === 'Weekly Sales Report' },
    { id: 'sales', text: 'Enter the Sales for Monday to Friday in B3:B7 — 1200, 950, 1430, 1100, 1675 — pressing Enter after each', keys: '→ ↓ then 1200 Enter …', requires: ['type-to-enter', 'enter-commits', 'text-vs-number'], check: s => [1200, 950, 1430, 1100, 1675].every((v, i) => s.value('B' + (3 + i)) === v) },
    { id: 'units-tab', text: 'Enter 40 as the Monday Units in C3 and confirm it with Tab, so the active cell moves to D3', keys: '40 Tab', requires: ['tab-commits'], check: s => s.value('C3') === 40 && at(s, 'D3') },
    { id: 'clear-draft', text: 'B8 holds the stray word draft. Select it and clear it with Delete', keys: 'Delete', requires: ['delete-clears'], check: s => s.value('B8') === null },
  ],
  solution: '"Weekly Sales Report" Enter Right Down "1200" Enter "950" Enter "1430" Enter "1100" Enter "1675" Enter Right Up Up Up Up Up "40" Tab Left Left Down Down Down Down Down Delete',
};
