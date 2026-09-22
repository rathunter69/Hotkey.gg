// Foundations · Entering and editing — Undo, redo and Escape
const REPORT = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 },
  A4: { value: 'Tuesday' }, B4: { value: 950 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 },
  A6: { value: 'Thursday' }, B6: { value: 1100 },
  A7: { value: 'Friday' }, B7: { value: 1675 },
};
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

export default {
  id: 'undo-redo',
  chapter: 'foundations',
  section: 'Entering and editing',
  title: 'Undo, redo and Escape',
  difficulty: 'easy',
  tags: ['editing'],
  access: 'free',
  concepts: ['undo-redo'],
  prerequisites: ['editing-cells', 'go-to-cells'],
  read: 'Mistakes are cheap when you can take them back. In this lesson you overwrite a figure and undo it, bring it back with redo, and use Escape to abandon an entry before it ever lands. Fearless undo is what lets you work fast.',
  sheet: { cells: REPORT, active: { r: 4, c: 2 }, colW: { 1: 84 } },
  par: 10,
  goals: [
    { id: 'undo', teach: 'Ctrl+Z undoes the last change; Ctrl+Y redoes it.', text: 'Type 0 over Tuesday’s 950 in B4, press Enter, then undo it with Ctrl+Z.', keys: '0 ↵ then Ctrl+Z', requires: ['undo-redo', 'replace-by-typing'], check: (s, ses) => used(ses, 'Ctrl+Z') && s.value('B4') === 950 },
    { id: 'redo', text: 'Bring the change back with Ctrl+Y.', keys: 'Ctrl+Y', requires: ['undo-redo'], check: (s, ses) => used(ses, 'Ctrl+Y') && s.value('B4') === 0 },
    { id: 'undo-again', text: 'Undo once more so Tuesday reads 950 again.', keys: 'Ctrl+Z', requires: ['undo-redo'], check: (s, ses) => used(ses, 'Ctrl+Z') && s.value('B4') === 950 },
    { id: 'escape', text: 'Start typing 999 over Friday’s figure in B7, then discard it with Esc before it lands.', keys: 'Ctrl+G "B7" ↵ "999" Esc', requires: ['escape-cancels', 'go-to'], check: (s, ses) => used(ses, '9') && !ses.editing && s.value('B7') === 1675 },
  ],
  closing: ['Escape is the cheaper undo: nothing was committed, so there is nothing to rewind. The undo stack here keeps 60 steps, like Excel’s 100 — deep enough that you never hesitate.'],
  solution: '0 Enter Ctrl+Z Ctrl+Y Ctrl+Z Ctrl+G "B7" Enter "999" Escape',
};
