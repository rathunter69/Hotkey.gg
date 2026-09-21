// Foundations 4 — Entering data
const START = {
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, A4: { value: 'Tuesday' }, A5: { value: 'Wednesday' }, A6: { value: 'Thursday' }, A7: { value: 'Friday' },
  B8: { value: 'draft' },
};
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const typing = e => e.k.length === 1 || e.k === '⌫';
/**
 * An entry typed on `ref` was confirmed with Tab: the log holds a Tab right after typing on `ref`,
 * logged on `ref` (or on `next`, once the commit has moved the active cell on). Read from the whole
 * log so the goal holds whichever order the learner filled the table in; a Tab that merely moved
 * off the cell, or an arrow onto `next`, does not count.
 */
const enteredWithTab = (ses, ref, next) => ses.keyLog.some((e, i) => i > 0 && e.k === 'Tab' && (e.cell === ref || e.cell === next) && typing(ses.keyLog[i - 1]) && ses.keyLog[i - 1].cell === ref);

export default {
  id: 'foundations-04-entering-data',
  chapter: 'foundations',
  section: 'Entering and editing',
  title: 'Entering data',
  difficulty: 'easy',
  tags: ['data-entry'],
  access: 'free',
  concepts: ['type-to-enter', 'enter-commits', 'tab-commits', 'escape-cancels', 'text-vs-number', 'delete-clears'],
  prerequisites: ['foundations-02-moving-around'],
  sheet: { cells: START, active: { r: 1, c: 1 } },
  steps: [
    { mode: 'teach', title: 'Typing into cells', body: [
      'Select a cell and type. The entry appears in the cell and in the Formula Bar, but nothing is stored until you confirm it.',
      '`Enter` confirms the entry and moves down. `Tab` confirms it and moves right, and `Esc` throws it away.',
      'Excel tells text and numbers apart on its own: text lines up on the left of the cell, numbers on the right.',
      '`Delete` clears the selected cells without opening them for editing.',
    ] },
    { mode: 'guided' },
    { mode: 'solo' },
    { mode: 'timed', par: 40 },
  ],
  goals: [
    { id: 'title', text: 'In A1, type Weekly Sales Report and press Enter', keys: '"Weekly Sales Report" Enter', requires: ['type-to-enter', 'enter-commits'], check: s => s.value('A1') === 'Weekly Sales Report' },
    { id: 'sales', text: 'Enter the Sales for Monday to Friday in B3:B7 — 1200, 950, 1430, 1100, 1675 — pressing Enter after each', keys: '→ ↓ then "1200" Enter "950" Enter "1430" Enter "1100" Enter "1675" Enter', requires: ['type-to-enter', 'enter-commits', 'text-vs-number'], check: s => [1200, 950, 1430, 1100, 1675].every((v, i) => s.value('B' + (3 + i)) === v) },
    { id: 'units-tab', text: 'Enter 40 as the Monday Units in C3 and confirm it with Tab, so the active cell moves right to D3', keys: '→ ↑ ×5 then "40" Tab', requires: ['tab-commits'], check: (s, ses) => s.value('C3') === 40 && enteredWithTab(ses, 'C3', 'D3') },
    { id: 'clear-draft', text: 'B8 holds the stray word draft. Select it and clear it with Delete', keys: '← ← ↓ ×5 then Delete', requires: ['delete-clears'], check: (s, ses) => s.value('B8') === null && !ses.editing },
  ],
  solution: '"Weekly Sales Report" Enter Right Down "1200" Enter "950" Enter "1430" Enter "1100" Enter "1675" Enter Right Up Up Up Up Up "40" Tab Left Left Down Down Down Down Down Delete',
};
