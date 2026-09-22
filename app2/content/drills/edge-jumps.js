// Practice · Foundations — Edge jumps: Ctrl+Arrow, Go To, Ctrl+Home round a report
import { parsFrom } from '../../app/pars.js';

const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
/** The key was pressed since the current goal became current (the runner's key window). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

const SHEET = {
  A1: { value: 'Day', bold: true }, B1: { value: 'Sales', bold: true }, C1: { value: 'Units', bold: true },
  A2: { value: 'Monday' }, B2: { value: 1200 }, C2: { value: 40 },
  A3: { value: 'Tuesday' }, B3: { value: 950 }, C3: { value: 31 },
  A4: { value: 'Wednesday' }, B4: { value: 1430 }, C4: { value: 47 },
  A5: { value: 'Thursday' }, B5: { value: 1100 }, C5: { value: 36 },
  A6: { value: 'Friday' }, B6: { value: 1675 }, C6: { value: 55 },
  A40: { value: 'Notes', bold: true }, B40: { value: 'Week 38 close' },
};

export default {
  id: 'edge-jumps',
  chapter: 'foundations',
  title: 'Edge jumps',
  task: 'Bounce round the report by its edges: bottom, right, the note row, home.',
  access: 'free',
  sheet: { cells: SHEET, active: { r: 1, c: 1 }, colW: { 1: 92 } },
  goals: [
    { id: 'bottom', text: 'Jump to the bottom of the Day column.', keys: 'Ctrl+↓', check: (s, ses) => at(s, 'A6') && used(ses, 'Ctrl+↓') },
    { id: 'right', text: 'Jump to the right edge of the Friday row.', keys: 'Ctrl+→', check: (s, ses) => at(s, 'C6') && used(ses, 'Ctrl+→') },
    { id: 'note', text: 'Go straight to the note in B40.', keys: 'Ctrl+G "B40" ↵', check: (s, ses) => !ses.dialog && at(s, 'B40') && used(ses, 'Ctrl+G') },
    { id: 'home', text: 'Snap back to A1.', keys: 'Ctrl+Home', check: (s, ses) => at(s, 'A1') && used(ses, 'Ctrl+Home') },
  ],
  solution: 'Ctrl+Down Ctrl+Right Ctrl+G "B40" Enter Ctrl+Home',
  optimalKeys: 8,
  pars: parsFrom(4),
};
