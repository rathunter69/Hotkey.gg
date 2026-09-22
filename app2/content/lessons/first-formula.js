// Foundations · Basic formulas — Your first formulas
import { isLiveFormula } from '../../engine/live.js';

const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true }, D2: { value: 'Per unit', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
  A9: { value: 'Week', bold: true },
  A10: { value: 'Growth Mon→Fri' },
};
const near = (v, want) => typeof v === 'number' && Math.abs(v - want) < 1e-6;
const live = (s, ref) => isLiveFormula(s, ref);

export default {
  id: 'first-formula',
  chapter: 'foundations',
  section: 'Basic formulas',
  title: 'Your first formulas',
  difficulty: 'medium',
  tags: ['formulas'],
  access: 'free',
  concepts: ['formula-basics', 'formula-operators'],
  prerequisites: ['fills-and-colours'],
  read: 'A formula starts with = and stays alive: change an input and the answer follows. In this lesson you build Monday’s sales-per-unit, total the week with +, and compute growth with parentheses. Live formulas are the whole point of a spreadsheet.',
  sheet: { cells: SHEET, active: { r: 3, c: 4 }, colW: { 1: 92, 4: 76 } },
  par: 20,
  goals: [
    { id: 'divide', teach: 'A formula starts with = and recalculates whenever its inputs change.', text: 'In D3, enter =B3/C3: Monday’s sales per unit.', keys: '"=B3/C3" ↵', requires: ['formula-basics'], check: s => near(s.value('D3'), 30) && live(s, 'D3') },
    { id: 'add-week', teach: 'The arithmetic operators are + - * / with parentheses to group.', text: 'In B9, add the five days with =B3+B4+B5+B6+B7.', keys: 'Ctrl+G "B9" ↵ "=B3+B4+B5+B6+B7" ↵', requires: ['formula-operators', 'go-to'], check: s => near(s.value('B9'), 6355) && live(s, 'B9') },
    { id: 'add-units', text: 'Do the same for Units in C9.', keys: 'Ctrl+G "C9" ↵ "=C3+C4+C5+C6+C7" ↵', requires: ['formula-operators', 'go-to'], check: s => near(s.value('C9'), 209) && live(s, 'C9') },
    { id: 'divide-week', text: 'In D9, compute the week’s sales per unit from the two totals.', keys: 'Ctrl+G "D9" ↵ "=B9/C9" ↵', requires: ['formula-operators'], check: s => near(s.value('D9'), 6355 / 209) && live(s, 'D9') },
    { id: 'growth', text: 'In B10, compute Friday’s growth over Monday with =(B7-B3)/B3.', keys: 'Ctrl+G "B10" ↵ "=(B7-B3)/B3" ↵', requires: ['formula-operators', 'go-to'], check: s => near(s.value('B10'), (1675 - 1200) / 1200) && live(s, 'B10') },
  ],
  closing: ['Every formula here is graded live: the checker nudges an input and watches your answer move. A typed-in 30 would not pass, and neither would it survive Monday’s numbers changing — which is the real test.'],
  solution: '"=B3/C3" Enter Ctrl+G "B9" Enter "=B3+B4+B5+B6+B7" Enter Ctrl+G "C9" Enter "=C3+C4+C5+C6+C7" Enter Ctrl+G "D9" Enter "=B9/C9" Enter Ctrl+G "B10" Enter "=(B7-B3)/B3" Enter',
};
