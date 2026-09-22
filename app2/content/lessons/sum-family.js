// Foundations · Basic formulas — SUM, AVERAGE, MIN, MAX and COUNT
import { isLiveFormula } from '../../engine/live.js';

const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 },
  A4: { value: 'Tuesday' }, B4: { value: 950 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 },
  A6: { value: 'Thursday' }, B6: { value: 1100 },
  A7: { value: 'Friday' }, B7: { value: 1675 },
  A8: { value: 'Saturday' },
  A10: { value: 'Total', bold: true },
  A11: { value: 'Average' },
  A12: { value: 'Lowest' },
  A13: { value: 'Highest' },
  A14: { value: 'Days with sales' },
};
const near = (v, want) => typeof v === 'number' && Math.abs(v - want) < 1e-6;
const live = (s, ref) => isLiveFormula(s, ref);

export default {
  id: 'sum-family',
  chapter: 'foundations',
  section: 'Basic formulas',
  title: 'SUM, AVERAGE, MIN, MAX and COUNT',
  difficulty: 'medium',
  tags: ['formulas'],
  access: 'free',
  concepts: ['sum-family'],
  prerequisites: ['first-formula'],
  read: 'Adding five cells with + works; adding fifty does not. In this lesson the SUM family takes a range — B3:B8, Saturday still empty — and answers total, average, lowest, highest and how many days actually have sales. These five functions cover most of the arithmetic in real reports.',
  sheet: { cells: SHEET, active: { r: 10, c: 2 }, colW: { 1: 104 } },
  par: 22,
  goals: [
    { id: 'sum', teach: 'SUM, AVERAGE, MIN, MAX and COUNT each take a range: =SUM(B3:B7).', text: 'In B10, total the week with =SUM(B3:B8).', keys: '"=SUM(B3:B8)" ↵', requires: ['sum-family'], check: s => near(s.value('B10'), 6355) && live(s, 'B10') },
    { id: 'average', text: 'In B11, average the same range — blank Saturday is ignored, not counted as zero.', keys: '"=AVERAGE(B3:B8)" ↵', requires: ['sum-family'], check: s => near(s.value('B11'), 1271) && live(s, 'B11') },
    { id: 'min', text: 'In B12, find the lowest day with MIN.', keys: '"=MIN(B3:B8)" ↵', requires: ['sum-family'], check: s => near(s.value('B12'), 950) && live(s, 'B12') },
    { id: 'max', text: 'In B13, find the highest day with MAX.', keys: '"=MAX(B3:B8)" ↵', requires: ['sum-family'], check: s => near(s.value('B13'), 1675) && live(s, 'B13') },
    { id: 'count', text: 'In B14, count the days that have a sales figure with COUNT.', keys: '"=COUNT(B3:B8)" ↵', requires: ['sum-family'], check: s => near(s.value('B14'), 5) && live(s, 'B14') },
  ],
  closing: ['AVERAGE ignoring blanks is a rule worth remembering: the week averaged 1,271 over five trading days, not 1,059 over six. COUNT counts numbers only — COUNTA, later, counts anything.'],
  solution: '"=SUM(B3:B8)" Enter "=AVERAGE(B3:B8)" Enter "=MIN(B3:B8)" Enter "=MAX(B3:B8)" Enter "=COUNT(B3:B8)" Enter',
};
