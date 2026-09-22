// Practice · Foundations — Bold and borders: title, headers, the ruled table
import { parsFrom } from '../../app/pars.js';

const SHEET = {
  A1: { value: 'Weekly Sales Report' },
  A2: { value: 'Day' }, B2: { value: 'Sales' }, C2: { value: 'Units' },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
};

export default {
  id: 'bold-and-borders',
  chapter: 'foundations',
  title: 'Bold and borders',
  task: 'Dress the plain table: bold title, bold headers, all borders, a thick ring.',
  access: 'free',
  sheet: { cells: SHEET, active: { r: 1, c: 1 }, colW: { 1: 92 } },
  goals: [
    { id: 'title', text: 'Make the title A1 bold.', keys: 'Ctrl+B', check: s => s.cellAt('A1').bold === true },
    { id: 'headers', text: 'Bold the header row A2:C2.', keys: 'Ctrl+G "A2:C2" ↵ Ctrl+B', check: s => ['A2', 'B2', 'C2'].every(r => s.cellAt(r).bold === true) },
    { id: 'borders', text: 'Rule the table A2:C7 with All Borders.', keys: 'Ctrl+G "A2:C7" ↵ Alt H B A', check: s => ['A2', 'B4', 'C7'].every(r => s.cellAt(r).ball === true) },
    { id: 'ring', text: 'Add a Thick Outside Border round the same table.', keys: 'Alt H B T', check: s => s.cellAt('A2').thick === true && s.cellAt('C7').thick === true },
  ],
  endState: [
    { text: 'Title and headers are still bold on the ruled table', check: s => s.cellAt('A1').bold === true && s.cellAt('B2').bold === true && s.cellAt('B4').ball === true },
  ],
  solution: 'Ctrl+B Ctrl+G "A2:C2" Enter Ctrl+B Ctrl+G "A2:C7" Enter Alt H B A Alt H B T',
  optimalKeys: 24,
  pars: parsFrom(10),
};
