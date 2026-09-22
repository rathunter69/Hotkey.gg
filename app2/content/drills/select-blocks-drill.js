// Practice · Foundations — Block select: grow, region, whole column, no mouse
import { parsFrom } from '../../app/pars.js';

/** The key was pressed since the current goal became current (the runner's key window). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
};

export default {
  id: 'select-blocks',
  chapter: 'foundations',
  title: 'Block select',
  task: 'Take the Sales run, grow it across, then the region, then the whole column.',
  access: 'free',
  sheet: { cells: SHEET, active: { r: 3, c: 2 }, colW: { 1: 92 } },
  goals: [
    { id: 'run', text: 'Select the Sales figures B3:B7 in one chord.', keys: 'Ctrl+Shift+↓', check: (s, ses) => !!s.sel && s.selectionText() === 'B3:B7' && used(ses, 'Ctrl+Shift+↓') },
    { id: 'across', text: 'Grow the selection across to the Units column.', keys: 'Ctrl+Shift+→', check: (s, ses) => !!s.sel && s.selectionText() === 'B3:C7' && used(ses, 'Ctrl+Shift+→') },
    { id: 'region', text: 'Select the whole report region.', keys: 'Ctrl+A', check: (s, ses) => !!s.sel && s.selectionText() === 'A1:C7' && used(ses, 'Ctrl+A') },
    { id: 'column', text: 'Select all of the active column.', keys: 'Ctrl+Space', check: (s, ses) => !!s.sel && /^[A-Z]+1:[A-Z]+100$/.test(s.selectionText()) && used(ses, 'Ctrl+Space') },
  ],
  solution: 'Ctrl+Shift+Down Ctrl+Shift+Right Ctrl+A Ctrl+Space',
  optimalKeys: 4,
  pars: parsFrom(3),
};
