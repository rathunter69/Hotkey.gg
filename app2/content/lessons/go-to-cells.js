// Foundations · Moving — Go To: cells, ranges and other sheets
// A two-sheet workbook (Sales, Costs): Go To jumps anywhere you can name, including across sheets.
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
  A4: { value: 'Tuesday' }, B4: { value: 410 },
  A5: { value: 'Wednesday' }, B5: { value: 560 },
};
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

export default {
  id: 'go-to-cells',
  chapter: 'foundations',
  section: 'Moving',
  title: 'Go To: cells, ranges and other sheets',
  difficulty: 'easy',
  tags: ['navigation', 'workbook'],
  access: 'free',
  concepts: ['go-to', 'sheet-reference'],
  prerequisites: ['page-keys', 'workbook-sheets-cells'],
  read: 'When you know the address, do not travel — name it. In this lesson Go To (Ctrl+G) takes you to a cell, selects a whole range, and lands on another sheet of the workbook in one jump. Analysts navigate big models this way all day.',
  sheet: { cells: SALES, active: { r: 3, c: 1 }, colW: { 1: 84 } },
  sheets: [{ name: 'Sales' }, { name: 'Costs', cells: COSTS, active: { r: 1, c: 1 }, colW: { 1: 84 } }],
  par: 12,
  goals: [
    { id: 'goto-cell', teach: 'Go To (Ctrl+G or F5) jumps to any reference you type.', text: 'Go straight to B40, the note at the bottom, with Ctrl+G.', keys: 'Ctrl+G "B40" ↵', requires: ['go-to'], check: (s, ses) => !ses.dialog && at(s, 'B40') && used(ses, 'Ctrl+G') },
    { id: 'goto-range', text: 'Go To A1:C7 to select the whole report block in one jump.', keys: 'Ctrl+G "A1:C7" ↵', requires: ['go-to', 'range'], check: (s, ses) => !ses.dialog && !!s.sel && s.selectionText() === 'A1:C7' },
    { id: 'goto-sheet', teach: 'A reference on another sheet names the sheet first: Costs!B3.', text: 'Go To Costs!B3 — Monday’s costs on the Costs sheet.', keys: 'Ctrl+G "Costs!B3" ↵', requires: ['sheet-reference'], check: (s, ses) => !ses.dialog && ses.sheetIndex === 1 && at(s, 'B3') },
  ],
  closing: ['Go To keeps your last four jumps in its list, so bouncing between two corners of a model is two keys and Enter.'],
  solution: 'Ctrl+G "B40" Enter Ctrl+G "A1:C7" Enter Ctrl+G "Costs!B3" Enter',
};
