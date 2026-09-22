// Foundations · Entering and editing — Fill down, fill right, Ctrl+Enter
import { isLiveFormula } from '../../engine/live.js';

const SHEET = {
  A1: { value: 'Regional Sales', bold: true },
  A2: { value: 'Owner', bold: true }, B2: { value: 'North', bold: true }, C2: { value: 'Central', bold: true }, D2: { value: 'South', bold: true }, E2: { value: 'Adj.', bold: true },
  A3: { value: 'Sales team' },
  B3: { value: 1200 }, C3: { value: 980 }, D3: { value: 1130 },
  B4: { value: 950 }, C4: { value: 1010 }, D4: { value: 890 },
  B5: { value: 1430 }, C5: { value: 1220 }, D5: { value: 1310 },
  B6: { value: 1100 }, C6: { value: 1050 }, D6: { value: 990 },
  B7: { value: 1675 }, C7: { value: 1400 }, D7: { value: 1520 },
  A9: { value: 'Total', bold: true }, B9: { formula: '=SUM(B3:B7)', bold: true, bt: true },
};
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

export default {
  id: 'fill-down-right',
  chapter: 'foundations',
  section: 'Entering and editing',
  title: 'Fill down, fill right, Ctrl+Enter',
  difficulty: 'medium',
  tags: ['editing', 'fill'],
  access: 'free',
  concepts: ['fill-down-right', 'ctrl-enter-fill'],
  prerequisites: ['undo-redo'],
  read: 'Once one cell is right, the rest of its row or column is a fill, not a retype. In this lesson Ctrl+D fills the owner label down, Ctrl+R carries the Total formula across the regions, and Ctrl+Enter drops one entry into a whole selection. Filling is how a model row gets built in seconds.',
  sheet: { cells: SHEET, active: { r: 3, c: 1 }, colW: { 1: 92 } },
  par: 12,
  goals: [
    { id: 'fill-down', teach: 'Ctrl+D fills the selection from its top row; Ctrl+R fills it from its left column.', text: 'Select A3:A7 and fill Sales team down with Ctrl+D.', keys: 'Ctrl+G "A3:A7" ↵ then Ctrl+D', requires: ['fill-down-right', 'go-to'], check: (s, ses) => ['A4', 'A5', 'A6', 'A7'].every(r => s.value(r) === 'Sales team') && used(ses, 'Ctrl+D') },
    { id: 'fill-right', text: 'Select B9:D9 and carry the Total formula across with Ctrl+R.', keys: 'Ctrl+G "B9:D9" ↵ then Ctrl+R', requires: ['fill-down-right', 'go-to'], check: (s, ses) => isLiveFormula(s, 'C9') && isLiveFormula(s, 'D9') && s.value('C9') === 5660 && s.value('D9') === 5840 && used(ses, 'Ctrl+R') },
    { id: 'ctrl-enter', teach: 'Ctrl+Enter commits an entry into every selected cell at once.', text: 'Select E3:E7, type 0 and land it in all five cells with one Ctrl+Enter.', keys: 'Ctrl+G "E3:E7" ↵ 0 Ctrl+↵', requires: ['ctrl-enter-fill', 'go-to'], check: (s, ses) => ['E3', 'E4', 'E5', 'E6', 'E7'].every(r => s.value(r) === 0) && used(ses, 'Ctrl+↵') },
  ],
  closing: ['A filled formula shifts its references as it goes: C9 sums column C, not column B. Chapter 1’s formula section makes that rule precise; here it is enough that the fill did the retyping for you.'],
  solution: 'Ctrl+G "A3:A7" Enter Ctrl+D Ctrl+G "B9:D9" Enter Ctrl+R Ctrl+G "E3:E7" Enter 0 Ctrl+Enter',
};
