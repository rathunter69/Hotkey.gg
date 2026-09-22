// Foundations · Entering and editing — Editing a cell
const START = {
  A1: { value: 'Weekly Sales Reprot', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wenesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
};
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

export default {
  id: 'editing-cells',
  chapter: 'foundations',
  section: 'Entering and editing',
  title: 'Editing a cell',
  difficulty: 'easy',
  tags: ['data-entry', 'editing'],
  access: 'free',
  concepts: ['replace-by-typing', 'edit-mode-f2', 'edit-caret', 'backspace'],
  prerequisites: ['entering-data'],
  read: 'Data is rarely right the first time. In this lesson you fix a misspelled title, a wrong figure and a misspelled day in the Weekly Sales Report. Knowing when to retype a cell and when to edit it saves time all day long.',
  sheet: { cells: START, active: { r: 1, c: 1 }, colW: { 1: 84 } },   // column A fitted to its day names, as an author would
  par: 30,
  goals: [
    { id: 'fix-title', teach: 'F2 opens the cell for editing with the insertion point at the end, and Backspace deletes the character before it.', text: 'Fix the title in A1: change Reprot to Report.', keys: 'F2 ⌫ ×4 "port" Enter', requires: ['edit-mode-f2', 'backspace'], check: (s, ses) => s.value('A1') === 'Weekly Sales Report' && used(ses, 'F2') },
    { id: 'replace-b4', teach: 'To replace a cell, select it and type: the old contents go the moment you start.', text: 'Replace the Tuesday Sales in B4 with 1950.', keys: '→ ↓ ↓ then "1950" Enter', requires: ['replace-by-typing'], check: s => s.value('B4') === 1950 },
    { id: 'fix-wednesday', teach: 'In Edit mode ← and → move the insertion point, and Home and End jump to either end.', text: 'Correct Wenesday in A5 to Wednesday by inserting the missing d.', keys: '← then F2 ← ×6 "d" Enter', requires: ['edit-mode-f2', 'edit-caret'], check: (s, ses) => s.value('A5') === 'Wednesday' && used(ses, 'F2') },
  ],
  solution: 'F2 Backspace Backspace Backspace Backspace "port" Enter Right Down Down "1950" Enter Left F2 Left Left Left Left Left Left "d" Enter',
};
