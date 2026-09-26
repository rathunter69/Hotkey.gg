// Practice · Foundations — Find and fix: Ctrl+F lands on it, Ctrl+H fixes it everywhere
import { parsFrom } from '../../app/pars.js';

const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
/** The key was pressed since the current goal became current (the runner's key window). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

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

export default {
  id: 'find-and-fix',
  chapter: 'foundations',
  title: 'Find and fix',
  task: 'Hunt the typo with Find, then swap a name and a whole quarter with Replace All.',
  access: 'free',
  sheet: { cells: SHEET, active: { r: 1, c: 1 }, colW: { 1: 92 } },
  goals: [
    { id: 'find', text: 'Find the misspelt Wenesday and land on it.', keys: 'Ctrl+F "Wenesday" ↵ Esc', check: (s, ses) => !ses.dialog && at(s, 'A5') && used(ses, 'Ctrl+F') },
    { id: 'fix', text: 'Retype it correctly: Wednesday.', keys: '"Wednesday" ↵', check: s => s.value('A5') === 'Wednesday' },
    { id: 'name', text: 'Replace Sales team with Finance in one pass.', keys: 'Ctrl+H "Sales team" Tab "Finance" Alt+A Esc', check: (s, ses) => s.value('B10') === 'Finance' && used(ses, 'Ctrl+H') },
    { id: 'quarter', text: 'Replace every Q1 with Q2 — four cells at once.', keys: 'Ctrl+H "Q1" Tab "Q2" Alt+A', check: s => ['C1', 'C2', 'D1', 'D2'].every(r => String(s.value(r)).startsWith('Q2')) },
  ],
  solution: 'Ctrl+F "Wenesday" Enter Escape "Wednesday" Enter Ctrl+H "Sales team" Tab "Finance" Alt+A Escape Ctrl+H "Q1" Tab "Q2" Alt+A',
  optimalKeys: 49,
  pars: parsFrom(16),
};
