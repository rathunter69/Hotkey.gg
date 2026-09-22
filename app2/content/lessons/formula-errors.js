// Foundations · Basic formulas — Reading formula errors
import { isLiveFormula } from '../../engine/live.js';

const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true }, D2: { value: 'Checks', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
  D3: { formula: '=SUMM(B3:B7)' },
  D4: { formula: '=B4/C4' },
  D5: { formula: '=B5+"x"' },
  D6: { formula: '=#REF!*2' },
};
const clean = (s, ref) => { const v = s.value(ref); return typeof v === 'number' && isFinite(v); };
const live = (s, ref) => isLiveFormula(s, ref);

export default {
  id: 'formula-errors',
  chapter: 'foundations',
  section: 'Basic formulas',
  title: 'Reading formula errors',
  difficulty: 'hard',
  tags: ['formulas', 'auditing'],
  access: 'free',
  concepts: ['formula-errors'],
  prerequisites: ['cross-sheet'],
  read: 'An error code is a message, not a mystery: #NAME? blames the function, #DIV/0! the divisor, #VALUE! the types, #REF! a reference that no longer exists. In this lesson the Checks column shows all four and you fix each one. Reading errors calmly is what separates fixing from flailing.',
  sheet: { cells: SHEET, active: { r: 3, c: 4 }, colW: { 1: 92 } },
  par: 25,
  goals: [
    { id: 'fix-name', teach: '#DIV/0!, #NAME?, #VALUE! and #REF! each say what broke: the input, the name, the type, the reference.', text: 'D3 shows #NAME? — retype the total with the function spelt SUM.', keys: '"=SUM(B3:B7)" ↵', requires: ['formula-errors', 'sum-family'], check: s => clean(s, 'D3') && s.value('D3') === 6355 && live(s, 'D3') },
    { id: 'fix-div0', text: 'D4 shows #DIV/0! because Tuesday’s units are missing — type 31 into C4.', keys: 'Ctrl+G "C4" ↵ "31" ↵', requires: ['formula-errors', 'go-to'], check: s => clean(s, 'D4') && live(s, 'D4') },
    { id: 'fix-value', text: 'D5 shows #VALUE! — replace it with a formula that adds B5 and C5, two real numbers.', keys: 'Ctrl+G "D5" ↵ "=B5+C5" ↵', requires: ['formula-errors', 'go-to'], check: s => clean(s, 'D5') && live(s, 'D5') },
    { id: 'fix-ref', text: 'D6 shows #REF! — the cell it pointed at was deleted long ago; repoint it to B6 times 2.', keys: '"=B6*2" ↵', requires: ['formula-errors'], check: s => clean(s, 'D6') && s.value('D6') === 2200 && live(s, 'D6') },
  ],
  closing: ['#REF! is the one error you cannot fix by waiting: the reference is gone and only rewriting it helps. The others usually trace to an input — follow the formula’s cells before you touch the formula.'],
  solution: '"=SUM(B3:B7)" Enter Ctrl+G "C4" Enter "31" Enter Ctrl+G "D5" Enter "=B5+C5" Enter "=B6*2" Enter',
};
