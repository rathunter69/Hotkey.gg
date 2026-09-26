// Practice · Foundations — Fill factory: Ctrl+D, Ctrl+R, Fill Series, one Ctrl+Enter burst
import { parsFrom } from '../../app/pars.js';
import { isLiveFormula } from '../../engine/live.js';

/** The key was pressed since the current goal became current (the runner's key window). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

const SHEET = {
  A1: { value: 'Ten-Day Sales Plan', bold: true },
  A2: { value: 'Day #', bold: true }, B2: { value: 'Target', bold: true }, C2: { value: 'Week 1', bold: true },
  A3: { value: 1 }, B3: { value: 100 },
  A4: { value: 2 },
};

export default {
  id: 'fill-factory',
  chapter: 'foundations',
  title: 'Fill factory',
  task: 'Number the days with Fill Series, copy targets down, formulas right, zeros in one burst.',
  access: 'free',
  sheet: { cells: SHEET, active: { r: 3, c: 1 }, colW: { 1: 72 } },
  goals: [
    { id: 'series', text: 'Select A3:A12 and fill the day numbers 1 to 10 with Fill Series.', keys: 'Ctrl+G "A3:A12" ↵ Alt H F I S ↵', check: s => s.value('A7') === 5 && s.value('A12') === 10 },
    { id: 'down', text: 'Fill the 100 target down B3:B12 with Ctrl+D.', keys: 'Ctrl+G "B3:B12" ↵ Ctrl+D', check: (s, ses) => s.value('B7') === 100 && s.value('B12') === 100 && used(ses, 'Ctrl+D') },
    { id: 'right', text: 'Fill the Week 1 header right across C2:E2 with Ctrl+R.', keys: 'Ctrl+G "C2:E2" ↵ Ctrl+R', check: (s, ses) => s.value('D2') === 'Week 1' && s.value('E2') === 'Week 1' && used(ses, 'Ctrl+R') },
    { id: 'burst', text: 'Select D3:D7, type 0 and land it in every cell with one Ctrl+Enter.', keys: 'Ctrl+G "D3:D7" ↵ "0" Ctrl+↵', check: (s, ses) => [3, 4, 5, 6, 7].every(r => s.value('D' + r) === 0) && used(ses, 'Ctrl+↵') },
  ],
  solution: 'Ctrl+G "A3:A12" Enter Alt H F I S Enter Ctrl+G "B3:B12" Enter Ctrl+D Ctrl+G "C2:E2" Enter Ctrl+R Ctrl+G "D3:D7" Enter "0" Ctrl+Enter',
  optimalKeys: 40,
  pars: parsFrom(14),
};
