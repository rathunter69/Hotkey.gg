// Practice · Foundations — The weekly sales report, against the clock. The chapter's benchmark:
// format, total, rule and freeze a plain export. Seeded for the Daily: the figures change, the
// checks read what is on the sheet, never a constant.
import { parsFrom } from '../../app/pars.js';
import { isLiveFormula } from '../../engine/live.js';

const colSum = (s, col, r1, r2) => { let t = 0; for (let r = r1; r <= r2; r++) { const v = s.value(col + r); if (typeof v !== 'number') return null; t += v; } return t; };

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
  id: 'weekly-sales-report',
  chapter: 'foundations',
  title: 'The weekly sales report',
  task: 'Take the plain export to a finished report: title, headers, totals, formats, borders, frozen header.',
  access: 'free',
  benchmark: true,
  sheet: { cells: SHEET, active: { r: 1, c: 1 }, colW: { 1: 92 } },
  /** Daily variation: fresh figures, same shape. */
  seed: rng => {
    const patch = {};
    for (let r = 3; r <= 7; r++) {
      patch['B' + r] = { value: 800 + Math.floor(rng() * 100) * 10 };
      patch['C' + r] = { value: 20 + Math.floor(rng() * 40) };
    }
    return patch;
  },
  goals: [
    { id: 'title', text: 'Bold the title and centre it across A1:C1.', keys: 'Ctrl+B then Ctrl+G "A1:C1" ↵ Ctrl+1 A', check: s => s.cellAt('A1').bold === true && s.cellAt('A1').ca === 3 },
    { id: 'headers', text: 'Bold the header row A2:C2 and fill it gray.', keys: 'Ctrl+G "A2:C2" ↵ Ctrl+B Alt H H → ↵', check: s => ['A2', 'B2', 'C2'].every(r => s.cellAt(r).bold === true && s.cellAt(r).fill === 'gray') },
    { id: 'totals', text: 'Type Total into A8 and AutoSum both columns over B3:C8.', keys: 'Ctrl+G "A8" ↵ "Total" ↵ Ctrl+G "B3:C8" ↵ Alt+=', check: s => { const b = colSum(s, 'B', 3, 7), c = colSum(s, 'C', 3, 7); return s.value('A8') === 'Total' && b != null && s.value('B8') === b && s.value('C8') === c && isLiveFormula(s, 'B8'); } },
    { id: 'comma', text: 'Give the Sales column B3:B8 the Number format.', keys: 'Ctrl+G "B3:B8" ↵ Ctrl+1 N', check: s => ['B3', 'B5', 'B8'].every(r => s.cellAt(r).fmtStyle === 'comma') },
    { id: 'borders', text: 'Rule the table A2:C8 with All Borders.', keys: 'Ctrl+G "A2:C8" ↵ Alt H B A', check: s => ['A2', 'B5', 'C8'].every(r => s.cellAt(r).ball === true) },
    { id: 'freeze', text: 'Freeze the top row.', keys: 'Alt W F R', check: s => s.freeze.r === 1 },
  ],
  endState: [
    { text: 'The report holds: bold centred title, gray headers, live totals, commas, borders', check: s => { const b = colSum(s, 'B', 3, 7); return s.cellAt('A1').ca === 3 && s.cellAt('B2').fill === 'gray' && b != null && s.value('B8') === b && s.cellAt('B5').fmtStyle === 'comma' && s.cellAt('B5').ball === true; } },
  ],
  solution: 'Ctrl+B Ctrl+G "A1:C1" Enter Ctrl+1 A Ctrl+G "A2:C2" Enter Ctrl+B Alt H H Right Enter Ctrl+G "A8" Enter "Total" Enter Ctrl+G "B3:C8" Enter Alt+= Ctrl+G "B3:B8" Enter Ctrl+1 N Ctrl+G "A2:C8" Enter Alt H B A Alt W F R',
  optimalKeys: 66,
  pars: parsFrom(25, { pass: 50 }),
};
