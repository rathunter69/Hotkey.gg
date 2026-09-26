// Practice · Foundations — Row wrangler: insert, delete, width, hide — structure without the mouse
import { parsFrom } from '../../app/pars.js';

/** The key was pressed since the current goal became current (the runner's key window). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true }, D2: { value: 'Notes', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
  A8: { value: 'stale row — delete me', it: true },
};

export default {
  id: 'row-wrangler',
  chapter: 'foundations',
  title: 'Row wrangler',
  task: 'Open a row above Wednesday, drop the stale one, widen Sales, hide the Notes column.',
  access: 'free',
  sheet: { cells: SHEET, active: { r: 5, c: 1 }, colW: { 1: 92 } },
  goals: [
    { id: 'insert', text: 'Insert a blank row above Wednesday: whole row 5, then the insert chord.', keys: 'Shift+Space Ctrl+Shift+=', check: (s, ses) => s.value('A6') === 'Wednesday' && s.value('A5') === null && used(ses, 'Ctrl+Shift+=') },
    { id: 'delete', text: 'Delete the stale row (now row 9) whole.', keys: 'Ctrl+G "A9" ↵ Shift+Space Ctrl+-', check: (s, ses) => s.value('A9') === null && used(ses, 'Ctrl+-') },
    { id: 'width', text: 'Set the Sales column B to width 14 from the Format menu.', keys: 'Ctrl+G "B3" ↵ Alt H O W "14" ↵', check: s => s.colW[2] === 103 },
    { id: 'hide', text: 'Hide the Notes column D.', keys: 'Ctrl+G "D2" ↵ Ctrl+0', check: (s, ses) => s.hiddenCols.has(4) && used(ses, 'Ctrl+0') },
  ],
  endState: [
    { text: 'Wednesday still sits below its blank row and Notes stays hidden', check: s => s.value('A6') === 'Wednesday' && s.hiddenCols.has(4) },
  ],
  solution: 'Shift+Space Ctrl+Shift+= Ctrl+G "A9" Enter Shift+Space Ctrl+- Ctrl+G "B3" Enter Alt H O W "14" Enter Ctrl+G "D2" Enter Ctrl+0',
  optimalKeys: 24,
  pars: parsFrom(12),
};
