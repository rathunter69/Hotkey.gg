// Foundations · Entering and editing — Find and Replace
const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 },
  A4: { value: 'Tuesday' }, B4: { value: 950 },
  A5: { value: 'Wenesday' }, B5: { value: 1430 },
  A6: { value: 'Thursday' }, B6: { value: 1100 },
  A7: { value: 'Friday' }, B7: { value: 1675 },
  A10: { value: 'Prepared by' }, B10: { value: 'Sales team' },
  C1: { value: 'Q1 total', bold: true }, C2: { value: 'Q1 target' }, D1: { value: 'Q1 plan' }, D2: { value: 'Q1 actual' },
};
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

export default {
  id: 'find-replace',
  chapter: 'foundations',
  section: 'Entering and editing',
  title: 'Find and Replace',
  difficulty: 'medium',
  tags: ['editing'],
  access: 'free',
  concepts: ['find-replace'],
  prerequisites: ['fill-down-right'],
  read: 'You do not hunt a sheet by eye. In this lesson Ctrl+F jumps you to a misspelt day, and Ctrl+H swaps a name and then a whole quarter label everywhere at once. On a real workbook, Replace All is minutes of edits in one keystroke.',
  sheet: { cells: SHEET, active: { r: 1, c: 1 }, colW: { 1: 84 } },
  par: 15,
  goals: [
    { id: 'find', teach: 'Find (Ctrl+F) jumps to matching text; Replace (Ctrl+H) swaps it out everywhere.', text: 'Find the misspelt Wenesday with Ctrl+F and land on it.', keys: 'Ctrl+F "Wenesday" ↵ Esc', requires: ['find-replace'], check: (s, ses) => !ses.dialog && at(s, 'A5') && used(ses, 'Ctrl+F') },
    { id: 'replace-name', text: 'With Ctrl+H, replace Sales team with Finance using Replace All.', keys: 'Ctrl+H "Sales team" Tab "Finance" Alt+A Esc', requires: ['find-replace'], check: (s, ses) => s.value('B10') === 'Finance' && used(ses, 'Ctrl+H') },
    { id: 'replace-q', text: 'Replace every Q1 with Q2 in one Replace All — four cells change together.', keys: 'Ctrl+H "Q1" Tab "Q2" Alt+A Esc', requires: ['find-replace'], check: s => ['C1', 'C2', 'D1', 'D2'].every(r => String(s.value(r)).startsWith('Q2')) },
  ],
  endState: [
    { text: 'B10 still reads Finance', check: s => s.value('B10') === 'Finance' },
  ],
  closing: ['Replace All reports how many cells it changed — read that number: four here, and if it says forty, stop and look. It is one undo step, so a wrong replace is one Ctrl+Z from gone.'],
  // No trailing Escape: Replace All lands the last goal, and the completion overlay takes over from the dialog.
  solution: 'Ctrl+F "Wenesday" Enter Escape Ctrl+H "Sales team" Tab "Finance" Alt+A Escape Ctrl+H "Q1" Tab "Q2" Alt+A',
};
