// Practice · Foundations — Paste surgeon: one aspect at a time — values, formats, an operation
import { parsFrom } from '../../app/pars.js';

const near = (v, want) => typeof v === 'number' && Math.abs(v - want) < 1e-6;

const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true, fill: 'gray' }, C2: { value: 'Revenue', bold: true }, E2: { value: 'Snapshot' },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { formula: '=B3*1.05' },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { formula: '=B4*1.05' },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { formula: '=B5*1.05' },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { formula: '=B6*1.05' },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { formula: '=B7*1.05' },
  H1: { value: 'Uplift' }, H2: { value: 1.1, fontColor: 'blue' },
};

export default {
  id: 'paste-surgeon',
  chapter: 'foundations',
  title: 'Paste surgeon',
  task: 'Freeze formulas to values, carry a format across, multiply a range by a copied factor.',
  access: 'free',
  sheet: { cells: SHEET, active: { r: 3, c: 3 }, colW: { 1: 92 } },
  goals: [
    { id: 'values', text: 'Copy the Revenue formulas C3:C7 and paste only their values onto E3.', keys: 'Ctrl+Shift+↓ Ctrl+C Ctrl+G "E3" ↵ Ctrl+Alt+V V ↵', check: s => near(s.value('E3'), 1260) && near(s.value('E7'), 1758.75) && !s.formula('E3') && !s.formula('E7') },
    { id: 'formats', text: 'Copy the styled Sales header B2 and paste only its format onto Snapshot in E2.', keys: 'Ctrl+G "B2" ↵ Ctrl+C Ctrl+G "E2" ↵ Ctrl+Alt+V T ↵', check: s => s.cellAt('E2').bold === true && s.cellAt('E2').fill === 'gray' && s.value('E2') === 'Snapshot' },
    { id: 'multiply', text: 'Copy the 1.1 uplift in H2 and multiply it into the Sales figures B3:B7 in one paste.', keys: 'Ctrl+G "H2" ↵ Ctrl+C Ctrl+G "B3:B7" ↵ Ctrl+Alt+V M ↵', check: s => near(s.value('B3'), 1320) && near(s.value('B7'), 1842.5) },
  ],
  endState: [
    { text: 'The value snapshot held its numbers when Sales moved', check: s => near(s.value('E3'), 1260) && near(s.value('E7'), 1758.75) },
  ],
  solution: 'Ctrl+Shift+Down Ctrl+C Ctrl+G "E3" Enter Ctrl+Alt+V V Enter Ctrl+G "B2" Enter Ctrl+C Ctrl+G "E2" Enter Ctrl+Alt+V T Enter Ctrl+G "H2" Enter Ctrl+C Ctrl+G "B3:B7" Enter Ctrl+Alt+V M Enter',
  optimalKeys: 36,
  pars: parsFrom(13),
};
