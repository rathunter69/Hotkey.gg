// Practice · Foundations — Go anywhere: Go To by name — cells, ranges, another sheet
import { parsFrom } from '../../app/pars.js';

const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
/** The key was pressed since the current goal became current (the runner's key window). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

const SALES = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
  A40: { value: 'Notes', bold: true }, B40: { value: 'Week 38 close' },
};
const COSTS = {
  A1: { value: 'Weekly Costs', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Costs', bold: true },
  A3: { value: 'Monday' }, B3: { value: 480 },
};

export default {
  id: 'go-anywhere',
  chapter: 'foundations',
  title: 'Go anywhere',
  task: 'Name the address and be there: a far cell, a whole block, another sheet, home.',
  access: 'free',
  sheet: { cells: SALES, active: { r: 3, c: 1 }, colW: { 1: 92 } },
  sheets: [{ name: 'Sales' }, { name: 'Costs', cells: COSTS, active: { r: 1, c: 1 }, colW: { 1: 92 } }],
  goals: [
    { id: 'cell', text: 'Go straight to the note in B40.', keys: 'Ctrl+G "B40" ↵', check: (s, ses) => !ses.dialog && at(s, 'B40') && used(ses, 'Ctrl+G') },
    { id: 'range', text: 'Select the whole report block A1:C7 in one jump.', keys: 'Ctrl+G "A1:C7" ↵', check: (s, ses) => !ses.dialog && !!s.sel && s.selectionText() === 'A1:C7' },
    { id: 'sheet', text: 'Land on Monday’s costs: Costs!B3.', keys: 'Ctrl+G "Costs!B3" ↵', check: (s, ses) => !ses.dialog && ses.sheetIndex === 1 && at(s, 'B3') },
    { id: 'home', text: 'Snap back to A1 of this sheet.', keys: 'Ctrl+Home', check: (s, ses) => ses.sheetIndex === 1 && at(s, 'A1') && used(ses, 'Ctrl+Home') },
  ],
  solution: 'Ctrl+G "B40" Enter Ctrl+G "A1:C7" Enter Ctrl+G "Costs!B3" Enter Ctrl+Home',
  optimalKeys: 23,
  pars: parsFrom(8),
};
