// Practice · Foundations — Insert and amend (screenplay 6.1 and 6.2b; script-drills.md). Domain's
// cost sheet totals its lines with pointed additions, so two new lines (Insurance and Utilities)
// waiting under the sheet must be moved in and added to the total by hand, the total row's bold and
// top border kept. Graded on the end state: every total reads every line, the waiting rows are gone.
import { parsFromRoute } from '../../app/pars.js';
import { costsPage, cutFrom, viaEngine, refsIn, COST_LINES, near, live } from './austin.js';

const LINES = ['Labor', 'Rent', 'Insurance', 'Maintenance', 'Utilities', 'Card fees'];
const PAGE = costsPage({ lines: LINES });
const SOLVED = PAGE.sheet.cells;
const COLS = ['B', 'C', 'D', 'E', 'F', 'G'];
const ALL = [...COLS, 'H'];
const WAIT = { Insurance: 15, Utilities: 16 };   // where the two lines wait in the start state

const start = cutFrom(PAGE, (cells, sh) => {
  viaEngine(sh, S => {
    S.select('A9:Z9'); S.remove('r');   // Utilities out
    S.select('A7:Z7'); S.remove('r');   // Insurance out
    for (const col of ALL) S.cells[col + 9] = { ...S.get(9, col.charCodeAt(0) - 64), formula: '=' + [5, 6, 7, 8].map(r => col + r).join('+') };   // the total over the four lines left
    // the two new lines, as the manager emailed them: labels and figures, no formats, under the sheet
    for (const [line, r] of Object.entries(WAIT)) { S.cells['A' + r] = { value: line }; COLS.forEach((col, i) => { S.cells[col + r] = { value: COST_LINES[line][i] }; }); }
  });
  sh.active = { r: 7, c: 1 };
});

const sumCol = (s, col) => [5, 6, 7, 8, 9, 10].reduce((t, r) => t + (s.value(col + r) || 0), 0);
const lineIs = (s, r, line) => s.value('A' + r) === line && COLS.every((col, i) => s.value(col + r) === COST_LINES[line][i]);
const emptyRow = (s, r) => ['A', ...ALL].every(col => s.value(col + r) == null);
const likeSolved = (s, refs, fields) => refs.every(ref => fields.every(f => (s.cellAt(ref)[f] || 0) === ((SOLVED[ref] || {})[f] || 0)));

export default {
  id: 'insert-and-amend',
  chapter: 'foundations',
  title: 'Insert and amend',
  task: 'Add Insurance and Utilities to the site costs and get them into the total, borders intact.',
  access: 'free',
  sheet: start,
  sheets: [{ name: 'Costs' }],
  goals: [
    { id: 'row-insurance', text: 'Insert a whole row above Maintenance, row 7, for Insurance.', keys: 'Shift+Space Ctrl+Shift+=',
      check: s => s.value('A8') === 'Maintenance' && emptyRow(s, 7) },
    { id: 'move-insurance', text: 'Cut Insurance from A16:G16 at the foot of the sheet and paste it into row 7.', keys: 'Ctrl+G "A16:G16" ↵ Ctrl+X Ctrl+G "A7" ↵ ↵',
      check: s => lineIs(s, 7, 'Insurance') && emptyRow(s, 16) },
    { id: 'row-utilities', text: 'Insert a whole row above Card fees, row 9, for Utilities.', keys: 'Ctrl+G "A9" ↵ Shift+Space Ctrl+Shift+=',
      check: s => s.value('A10') === 'Card fees' && emptyRow(s, 9) },
    { id: 'move-utilities', text: 'Cut Utilities from A18:G18 and paste it into row 9.', keys: 'Ctrl+G "A18:G18" ↵ Ctrl+X Ctrl+G "A9" ↵ ↵',
      check: s => lineIs(s, 9, 'Utilities') && emptyRow(s, 18) },
    { id: 'formats', text: 'Copy the format of B8:G8 and paste it onto the new lines, B7:G7 and B9:G9.', keys: 'Ctrl+G "B8:G8" ↵ Ctrl+C Ctrl+G "B7" ↵ Ctrl+Alt+V T ↵ Ctrl+G "B9" ↵ Ctrl+Alt+V T ↵',
      check: s => likeSolved(s, [...refsIn('B7:G7'), ...refsIn('B9:G9')], ['fontColor', 'fmtStyle', 'decimals']) },
    { id: 'week', text: 'Copy the Week formula in H8 into H7 and H9.', keys: 'Ctrl+G "H8" ↵ Ctrl+C Ctrl+G "H7" ↵ Ctrl+V Ctrl+G "H9" ↵ Ctrl+V',
      check: s => [7, 9].every(r => live(s, 'H' + r) && near(s.value('H' + r), COLS.reduce((t, c) => t + (s.value(c + r) || 0), 0))) },
    { id: 'amend', text: 'Open the total in B11 with F2, press F2 again to point, and add B7 and B9.', keys: 'Ctrl+G "B11" ↵ F2 F2 "+" ↑ ×4 "+" ↑ ×2 ↵',
      check: s => near(s.value('B11'), sumCol(s, 'B')) && live(s, 'B11', ['B7']) && live(s, 'B11', ['B9']) },
    { id: 'across', text: 'Copy B11 and paste only its formula across C11:H11 with Paste Special.', keys: 'Ctrl+G "B11" ↵ Ctrl+C Ctrl+G "C11:H11" ↵ Ctrl+Alt+V F ↵',
      check: s => ALL.every(col => { const via = col === 'H' ? 'B' : col; return near(s.value(col + 11), sumCol(s, col)) && live(s, col + 11, [via + '7']) && live(s, col + 11, [via + '9']); }) },
  ],
  endState: [
    { text: 'The total row keeps its bold and its top border', check: s => likeSolved(s, ['A11', ...ALL.map(c => c + 11)], ['bold', 'bt']) },
  ],
  solution: 'Shift+Space Ctrl+Shift+= Ctrl+G "A16:G16" Enter Ctrl+X Ctrl+G "A7" Enter Enter Ctrl+G "A9" Enter Shift+Space Ctrl+Shift+= Ctrl+G "A18:G18" Enter Ctrl+X Ctrl+G "A9" Enter Enter '
    + 'Ctrl+G "B8:G8" Enter Ctrl+C Ctrl+G "B7" Enter Ctrl+Alt+V T Enter Ctrl+G "B9" Enter Ctrl+Alt+V T Enter Ctrl+G "H8" Enter Ctrl+C Ctrl+G "H7" Enter Ctrl+V Ctrl+G "H9" Enter Ctrl+V '
    + 'Ctrl+G "B11" Enter F2 F2 "+" Up Up Up Up "+" Up Up Enter Ctrl+G "B11" Enter Ctrl+C Ctrl+G "C11:H11" Enter Ctrl+Alt+V F Enter',
  optimalKeys: 109,
  route: 45,
  pars: parsFromRoute(45),
};
