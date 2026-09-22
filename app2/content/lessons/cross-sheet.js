// Foundations · Basic formulas — Formulas across sheets
import { isLiveFormula } from '../../engine/live.js';

const SALES = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, D2: { value: 'Costs', bold: true }, E2: { value: 'Margin', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 },
  A4: { value: 'Tuesday' }, B4: { value: 950 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 },
  A6: { value: 'Thursday' }, B6: { value: 1100 },
  A7: { value: 'Friday' }, B7: { value: 1675 },
};
const COSTS = {
  A1: { value: 'Weekly Costs', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Costs', bold: true },
  A3: { value: 'Monday' }, B3: { value: 480 },
  A4: { value: 'Tuesday' }, B4: { value: 410 },
  A5: { value: 'Wednesday' }, B5: { value: 560 },
  A6: { value: 'Thursday' }, B6: { value: 450 },
  A7: { value: 'Friday' }, B7: { value: 610 },
};
const near = (v, want) => typeof v === 'number' && Math.abs(v - want) < 1e-6;
const live = (s, ref) => isLiveFormula(s, ref);

export default {
  id: 'cross-sheet',
  chapter: 'foundations',
  section: 'Basic formulas',
  title: 'Formulas across sheets',
  difficulty: 'medium',
  tags: ['formulas', 'workbook'],
  access: 'free',
  concepts: ['cross-sheet-ref'],
  prerequisites: ['absolute-refs'],
  read: 'Real workbooks keep costs on one sheet and the report on another, and the formulas bridge them. In this lesson =Costs!B3 pulls Monday’s costs into the Sales sheet, and a filled margin column reads its own row of the Costs sheet all the way down. Cross-sheet links are how models stay organised.',
  sheet: { cells: SALES, active: { r: 3, c: 4 }, colW: { 1: 92 } },
  sheets: [{ name: 'Sales' }, { name: 'Costs', cells: COSTS, active: { r: 1, c: 1 }, colW: { 1: 92 } }],
  par: 16,
  goals: [
    { id: 'link', teach: 'A reference on another sheet names the sheet first: =Costs!B3.', text: 'In D3, pull Monday’s costs across with =Costs!B3.', keys: '"=Costs!B3" ↵', requires: ['cross-sheet-ref'], check: s => near(s.value('D3'), 480) && live(s, 'D3') },
    { id: 'margin', text: 'In E3, compute Monday’s margin with =B3-Costs!B3.', keys: 'Ctrl+G "E3" ↵ "=B3-Costs!B3" ↵', requires: ['cross-sheet-ref', 'go-to'], check: s => near(s.value('E3'), 720) && live(s, 'E3') },
    { id: 'fill-margin', text: 'Select E3:E7 and fill the margin down — each row reads its own Costs row.', keys: 'Ctrl+G "E3:E7" ↵ then Ctrl+D', requires: ['cross-sheet-ref', 'fill-down-right', 'go-to'], check: s => near(s.value('E4'), 540) && near(s.value('E5'), 870) && near(s.value('E6'), 650) && near(s.value('E7'), 1065) && live(s, 'E7') },
  ],
  closing: ['The filled formula became =B4-Costs!B4, =B5-Costs!B5 and so on: the sheet name rides along while the row shifts, exactly the relative-reference rule you already know. Change a cost on the Costs sheet and watch the margin move here.'],
  solution: '"=Costs!B3" Enter Ctrl+G "E3" Enter "=B3-Costs!B3" Enter Ctrl+G "E3:E7" Enter Ctrl+D',
};
