// Practice · Foundations — Formula sprint: a product, a SUM, an anchored rate filled down
import { parsFrom } from '../../app/pars.js';
import { isLiveFormula } from '../../engine/live.js';

const near = (v, want) => typeof v === 'number' && Math.abs(v - want) < 1e-6;
const live = (s, ref) => isLiveFormula(s, ref);

const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true }, E1: { value: 0.2, fontColor: 'blue' }, F1: { value: 'commission', it: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true }, D2: { value: 'Revenue', bold: true }, E2: { value: 'Fee', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
};

export default {
  id: 'formula-sprint',
  chapter: 'foundations',
  title: 'Formula sprint',
  task: 'A product, an AutoSum, and an anchored commission filled down the column.',
  access: 'free',
  sheet: { cells: SHEET, active: { r: 3, c: 4 }, colW: { 1: 92 } },
  goals: [
    { id: 'product', text: 'In D3, multiply Monday’s Sales by its Units.', keys: '"=B3*C3" ↵', check: s => near(s.value('D3'), 48000) && live(s, 'D3') },
    { id: 'sum', text: 'Type Total into A8, then AutoSum the Sales column over B3:B8.', keys: 'Ctrl+G "A8" ↵ "Total" ↵ Ctrl+G "B3:B8" ↵ Alt+=', check: s => s.value('A8') === 'Total' && near(s.value('B8'), 6355) && live(s, 'B8') },
    { id: 'anchor', text: 'In E3, take Monday’s Sales times the anchored commission $E$1.', keys: 'Ctrl+G "E3" ↵ "=B3*$E$1" ↵', check: s => near(s.value('E3'), 240) && live(s, 'E3') },
    { id: 'fill', text: 'Fill the fee down E3:E7 — every row still reads E1.', keys: 'Ctrl+G "E3:E7" ↵ Ctrl+D', check: s => near(s.value('E5'), 286) && near(s.value('E7'), 335) && live(s, 'E7') },
  ],
  endState: [
    { text: 'The total and the anchored fees still move with the inputs', check: s => near(s.value('B8'), 6355) && near(s.value('E7'), 335) && live(s, 'B8') },
  ],
  solution: '"=B3*C3" Enter Ctrl+G "A8" Enter "Total" Enter Ctrl+G "B3:B8" Enter Alt+= Ctrl+G "E3" Enter "=B3*$E$1" Enter Ctrl+G "E3:E7" Enter Ctrl+D',
  optimalKeys: 47,
  pars: parsFrom(16),
};
