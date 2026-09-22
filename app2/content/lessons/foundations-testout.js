// Foundations · Project and assessment — Test out of Foundations
// One timed run across the whole chapter: sheets, moving, selecting, editing, structure,
// the Ribbon and formulas. Passing it clears every Chapter 1 lesson in one go.
import { isLiveFormula } from '../../engine/live.js';

const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
  E1: { value: 'Status', bold: true }, E2: { value: 'Draft' }, E3: { value: 'Draft' },
};
const near = (v, want) => typeof v === 'number' && Math.abs(v - want) < 1e-6;
const live = (s, ref) => isLiveFormula(s, ref);
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

export default {
  id: 'foundations-testout',
  chapter: 'foundations',
  section: 'Project and assessment',
  title: 'Test out of Foundations',
  kind: 'testout',
  timeLimit: 240,
  difficulty: 'hard',
  tags: ['assessment'],
  access: 'free',
  concepts: [],
  prerequisites: ['weekly-report-project', 'managing-sheets', 'select-blocks'],
  read: 'Already know this chapter? Prove it: eight tasks across sheets, moving, selecting, editing, structure, the Ribbon and formulas, in four minutes. Pass and every Foundations lesson is marked complete; fall short and nothing is lost — the chapter is there to learn from.',
  sheet: { cells: SHEET, active: { r: 3, c: 1 }, colW: { 1: 92 } },
  par: 100,
  goals: [
    { id: 'rename', text: 'Rename the sheet tab from Sheet1 to Report.', keys: 'Alt H O R "Report" ↵', requires: ['rename-sheet'], check: (s, ses) => ses.sheets.length === 1 && ses.sheets[0].name === 'Report' },
    { id: 'goto-range', text: 'Select the report block A1:C7 in one jump with Go To.', keys: 'Ctrl+G "A1:C7" ↵', requires: ['go-to', 'range'], check: (s, ses) => !ses.dialog && !!s.sel && s.selectionText() === 'A1:C7' },
    { id: 'whole-col', text: 'Select the whole of column C, the Units column, with one chord.', keys: 'Ctrl+G "C3" ↵ then Ctrl+Space', requires: ['row-col-select', 'go-to'], check: (s, ses) => s.selectionText() === 'C1:C100' && used(ses, 'Ctrl+Space') },
    { id: 'replace-all', text: 'Replace every Draft in the Status column with Final in one pass.', keys: 'Ctrl+H "Draft" Tab "Final" Alt+A Esc', requires: ['find-replace'], check: s => s.value('E2') === 'Final' && s.value('E3') === 'Final' },
    { id: 'freeze', text: 'Freeze the top row so the title stays put.', keys: 'Alt W F R', requires: ['freeze-panes'], check: s => s.freeze.r === 1 },
    { id: 'totals', text: 'Type Total into A8, then select B3:C8 and AutoSum both columns at once.', keys: 'Ctrl+G "A8" ↵ "Total" ↵ Ctrl+G "B3:C8" ↵ Alt+=', requires: ['autosum', 'go-to', 'type-to-enter'], check: s => s.value('A8') === 'Total' && near(s.value('B8'), 6355) && near(s.value('C8'), 209) && live(s, 'B8') },
    { id: 'borders', text: 'Rule the table with All Borders on A2:C8.', keys: 'Ctrl+G "A2:C8" ↵ Alt H B A', requires: ['borders-menu', 'go-to'], check: s => ['A2', 'B5', 'C8'].every(r => s.cellAt(r).ball === true) },
    { id: 'avg-price', text: 'In B10, divide total Sales by total Units with a formula for the average price.', keys: 'Ctrl+G "B10" ↵ "=B8/C8" ↵', requires: ['formula-basics', 'go-to'], check: s => near(s.value('B10'), 6355 / 209) && live(s, 'B10') },
  ],
  endState: [
    { text: 'Both statuses still read Final', check: s => s.value('E2') === 'Final' && s.value('E3') === 'Final' },
    { text: 'The totals row is still live over its borders', check: s => near(s.value('B8'), 6355) && live(s, 'B8') && s.cellAt('C8').ball === true },
    { text: 'The top row is still frozen', check: s => s.freeze.r === 1 },
  ],
  closing: ['That was the chapter in four minutes: navigate, select, edit, structure, format, calculate. If it felt easy, the next chapter is where you belong.'],
  solution: 'Alt H O R "Report" Enter Ctrl+G "A1:C7" Enter Ctrl+G "C3" Enter Ctrl+Space Ctrl+H "Draft" Tab "Final" Alt+A Escape Alt W F R Ctrl+G "A8" Enter "Total" Enter Ctrl+G "B3:C8" Enter Alt+= Ctrl+G "A2:C8" Enter Alt H B A Ctrl+G "B10" Enter "=B8/C8" Enter',
};
