// Foundations · Rows, columns and sheets — Hide, unhide and freeze panes
const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true }, D2: { value: 'Notes', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
};
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

export default {
  id: 'hide-freeze',
  chapter: 'foundations',
  section: 'Rows, columns and sheets',
  title: 'Hide, unhide and freeze panes',
  difficulty: 'medium',
  tags: ['structure', 'view'],
  access: 'free',
  concepts: ['hide-unhide', 'freeze-panes'],
  prerequisites: ['widths-heights'],
  read: 'Some columns are working noise, and on a long sheet the headers scroll away just when you need them. In this lesson you hide and unhide the Units column with the Ctrl chords, then freeze the top row so it stays put. Both are view moves: the data underneath never changes.',
  sheet: { cells: SHEET, active: { r: 3, c: 3 }, colW: { 1: 84 } },
  par: 12,
  goals: [
    { id: 'hide-col', teach: 'Ctrl+9 hides the selected rows and Ctrl+0 the columns; Ctrl+Shift+( and Ctrl+Shift+) unhide inside the selection.', text: 'Hide column C, the Units column, with Ctrl+0.', keys: 'Ctrl+0', requires: ['hide-unhide'], check: (s, ses) => s.hiddenCols.has(3) && used(ses, 'Ctrl+0') },
    { id: 'unhide-col', text: 'Select B2:D2 across the gap and bring Units back with Ctrl+Shift+0.', keys: 'Ctrl+G "B2:D2" ↵ then Ctrl+Shift+0', requires: ['hide-unhide', 'go-to'], check: (s, ses) => s.hiddenCols.size === 0 && used(ses, 'Ctrl+Shift+)') },
    { id: 'freeze-top', teach: 'Freeze Panes (Alt, W, F) keeps the rows above and columns left of the seam in view.', text: 'Freeze the top row with Alt, W, F, R.', keys: 'Alt W F R', requires: ['freeze-panes'], check: s => s.freeze.r === 1 && s.freeze.c === 0 },
    { id: 'unfreeze', text: 'Unfreeze the panes again with Alt, W, F, F.', keys: 'Alt W F F', requires: ['freeze-panes'], check: s => s.freeze.r === 0 && s.freeze.c === 0 },
  ],
  closing: ['Grouping (Alt, Shift, →) is the professional alternative to hiding in models: a grouped column shows a visible outline button instead of vanishing, so nobody misses that it exists. Split panes (Alt, W, S) give two independent scrolls. Both arrive with the data chapter.'],
  solution: 'Ctrl+0 Ctrl+G "B2:D2" Enter Ctrl+Shift+0 Alt W F R Alt W F F',
};
