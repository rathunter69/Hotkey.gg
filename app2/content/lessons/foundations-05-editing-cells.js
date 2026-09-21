// Foundations 5 — Editing a cell
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
  id: 'foundations-05-editing-cells',
  chapter: 'foundations',
  section: 'Entering and editing',
  title: 'Editing a cell',
  difficulty: 'easy',
  tags: ['data-entry', 'editing'],
  access: 'free',
  concepts: ['replace-by-typing', 'edit-mode-f2', 'edit-caret', 'backspace'],
  prerequisites: ['foundations-04-entering-data'],
  sheet: { cells: START, active: { r: 1, c: 1 } },
  steps: [
    { mode: 'teach', title: 'Replacing and editing', body: [
      'To replace what a cell holds, select it and type the new entry. The old contents disappear the moment you start typing.',
      'To change only part of an entry, press `F2`. The cell opens for editing with the insertion point at the end of its text.',
      'In Edit mode `←` and `→` move the insertion point, `Home` and `End` jump to either end, and `Backspace` deletes the character before it.',
      '`Enter` confirms the change and `Esc` discards it. This report has two misspellings and one wrong figure.',
    ] },
    { mode: 'guided' },
    { mode: 'solo' },
    { mode: 'timed', par: 30 },
  ],
  goals: [
    { id: 'fix-title', text: 'Fix the title in A1 with F2: change Reprot to Report using Backspace, then Enter', keys: 'F2 ⌫ ×4 "port" Enter', requires: ['edit-mode-f2', 'backspace'], check: (s, ses) => s.value('A1') === 'Weekly Sales Report' && used(ses, 'F2') },
    { id: 'replace-b4', text: 'Replace the Tuesday Sales in B4 with 1950 by typing over it', keys: '→ ↓ ↓ then "1950" Enter', requires: ['replace-by-typing'], check: s => s.value('B4') === 1950 },
    { id: 'fix-wednesday', text: 'Correct Wenesday in A5 to Wednesday: F2, move the insertion point left with ←, insert the missing d, Enter', keys: '← then F2 ← ×6 "d" Enter', requires: ['edit-mode-f2', 'edit-caret'], check: (s, ses) => s.value('A5') === 'Wednesday' && used(ses, 'F2') },
  ],
  solution: 'F2 Backspace Backspace Backspace Backspace "port" Enter Right Down Down "1950" Enter Left F2 Left Left Left Left Left Left "d" Enter',
};
