// Practice · Foundations — Type the column: figures down, a label, AutoSum. Seeded for the Daily.
import { parsFrom } from '../../app/pars.js';
import { isLiveFormula } from '../../engine/live.js';

/** The key was pressed since the current goal became current (the runner's key window). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);
const colSum = (s, col, r1, r2) => { let t = 0; for (let r = r1; r <= r2; r++) { const v = s.value(col + r); if (typeof v !== 'number') return null; t += v; } return t; };

const SHEET = {
  A1: { value: 'Day', bold: true }, B1: { value: 'Sales', bold: true },
  A2: { value: 'Monday' },
  A3: { value: 'Tuesday' },
  A4: { value: 'Wednesday' },
  A5: { value: 'Thursday' },
  A6: { value: 'Friday' },
};

export default {
  id: 'type-the-column',
  chapter: 'foundations',
  title: 'Type the column',
  task: 'Enter the five Sales figures, label the Total row and AutoSum it.',
  access: 'free',
  sheet: { cells: SHEET, active: { r: 2, c: 2 }, colW: { 1: 92 } },
  // The Daily varies nothing the checks depend on: the totals goal reads what was actually typed.
  goals: [
    { id: 'figures', text: 'Type the figures 1200, 950, 1430, 1100, 1675 down B2:B6, Enter after each.', keys: '"1200" ↵ "950" ↵ "1430" ↵ "1100" ↵ "1675" ↵', check: s => [1200, 950, 1430, 1100, 1675].every((v, i) => s.value('B' + (i + 2)) === v) },
    { id: 'label', text: 'Type Total into A7.', keys: 'Ctrl+G "A7" ↵ "Total" Tab', check: s => s.value('A7') === 'Total' },
    { id: 'autosum', text: 'AutoSum the Sales column in B7.', keys: 'Alt+= ↵', check: (s, ses) => { const t = colSum(s, 'B', 2, 6); return t != null && s.value('B7') === t && isLiveFormula(s, 'B7') && used(ses, '='); } },
  ],
  endState: [
    { text: 'The total still adds the five figures above it', check: s => { const t = colSum(s, 'B', 2, 6); return t != null && s.value('B7') === t; } },
  ],
  solution: '"1200" Enter "950" Enter "1430" Enter "1100" Enter "1675" Enter Ctrl+G "A7" Enter "Total" Tab Alt+= Enter',
  optimalKeys: 37,
  pars: parsFrom(13),
};
