// Foundations · Rows, columns and sheets — Insert and delete rows and columns
import { isLiveFormula } from '../../engine/live.js';

const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 },
  A4: { value: 'Tuesday' }, B4: { value: 950 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 },
  A6: { value: 'Thursday' }, B6: { value: 1100 },
  A7: { value: 'Friday' }, B7: { value: 1675 },
  A9: { value: 'Total', bold: true }, B9: { formula: '=SUM(B3:B8)', bold: true, bt: true },
};
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

export default {
  id: 'insert-delete-rows',
  chapter: 'foundations',
  section: 'Rows, columns and sheets',
  title: 'Insert and delete rows and columns',
  difficulty: 'medium',
  tags: ['structure'],
  access: 'free',
  concepts: ['insert-delete-rows'],
  prerequisites: ['find-replace', 'selecting-ranges', 'ribbon-and-keytips'],
  read: 'A report grows: a day gets split, a column gets added, a stale row goes. In this lesson you insert and delete whole rows and columns with Ctrl+Shift+= and Ctrl+-, and watch the Total formula follow the move. Structure edits that keep the formulas honest are a core analyst skill.',
  sheet: { cells: SHEET, active: { r: 5, c: 1 }, colW: { 1: 92 } },
  par: 14,
  goals: [
    { id: 'insert-row', teach: 'Ctrl+Shift+= inserts and Ctrl+- deletes the selected whole rows or columns.', text: 'Select row 5 with Shift+Space and insert a blank row above Wednesday with Ctrl+Shift+=.', keys: 'Shift+Space then Ctrl+Shift+=', requires: ['insert-delete-rows', 'row-col-select'], check: (s, ses) => s.value('A6') === 'Wednesday' && used(ses, 'Ctrl+Shift+=') && isLiveFormula(s, 'B10') },
    { id: 'delete-row', text: 'The split is off again: select the new row 5 and delete it with Ctrl+-.', keys: 'Shift+Space then Ctrl+-', requires: ['insert-delete-rows', 'row-col-select'], check: (s, ses) => s.value('A5') === 'Wednesday' && used(ses, 'Ctrl+-') && isLiveFormula(s, 'B9') },
    { id: 'insert-col', text: 'Insert a column before Sales from the Ribbon: land on B3 and press Alt, H, I, C.', keys: 'Ctrl+G "B3" ↵ then Alt H I C', requires: ['keytips', 'go-to'], check: s => s.value('C2') === 'Sales' && s.value('C3') === 1200 },
    { id: 'delete-col', text: 'Take the empty column out again with Alt, H, D, C.', keys: 'Alt H D C', requires: ['keytips'], check: s => s.value('B2') === 'Sales' && s.value('B3') === 1200 },
  ],
  closing: ['The Total kept summing the same days through all four edits: references follow the cells they name, not the row numbers. Deleting a row a formula points AT is different — that breaks it to #REF!, which the formula section teaches you to read.'],
  solution: 'Shift+Space Ctrl+Shift+= Shift+Space Ctrl+- Ctrl+G "B3" Enter Alt H I C Alt H D C',
};
