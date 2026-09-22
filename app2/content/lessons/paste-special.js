// Foundations · Copy, paste and fill — Paste Special
import { isLiveFormula } from '../../engine/live.js';

const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true, fill: 'gray' }, C2: { value: 'Units', bold: true }, D2: { value: 'Revenue', bold: true }, F2: { value: 'Snapshot' },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 }, D3: { formula: '=B3*1.05' },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 }, D4: { formula: '=B4*1.05' },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 }, D5: { formula: '=B5*1.05' },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 }, D6: { formula: '=B6*1.05' },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 }, D7: { formula: '=B7*1.05' },
  H1: { value: 'Uplift' }, H2: { value: 1.1, fontColor: 'blue' },
};
const near = (v, want) => typeof v === 'number' && Math.abs(v - want) < 1e-6;

export default {
  id: 'paste-special',
  chapter: 'foundations',
  section: 'Copy, paste and fill',
  title: 'Paste Special',
  difficulty: 'hard',
  tags: ['clipboard'],
  access: 'free',
  concepts: ['paste-special'],
  prerequisites: ['copy-cut-paste'],
  read: 'A plain paste brings everything; Paste Special brings exactly one aspect. In this lesson you freeze formulas into values, copy just a format, turn a row into a column with Transpose, and multiply a whole range by a copied factor. Values-only paste is the single most used trick in modelling.',
  sheet: { cells: SHEET, active: { r: 3, c: 4 }, colW: { 1: 92 } },
  par: 25,
  goals: [
    { id: 'values', teach: 'Paste Special (Ctrl+Alt+V) pastes one aspect: values V, formats T, transpose E, or an operation.', text: 'Copy the Revenue formulas D3:D7 and paste only their values onto F3.', keys: 'Ctrl+Shift+↓ Ctrl+C Ctrl+G "F3" ↵ then Ctrl+Alt+V V ↵', requires: ['paste-special', 'ctrl-shift-arrow', 'go-to'], check: s => near(s.value('F3'), 1260) && near(s.value('F7'), 1758.75) && !s.formula('F3') && !s.formula('F7') },
    { id: 'formats', text: 'Copy the styled Sales header B2 and paste only its format onto the Snapshot label in F2.', keys: 'Ctrl+G "B2" ↵ Ctrl+C Ctrl+G "F2" ↵ Ctrl+Alt+V T ↵', requires: ['paste-special', 'go-to'], check: s => s.cellAt('F2').bold === true && s.cellAt('F2').fill === 'gray' && s.value('F2') === 'Snapshot' },
    { id: 'transpose', text: 'Copy the headers A2:D2 and transpose them down onto A16.', keys: 'Ctrl+G "A2:D2" ↵ Ctrl+C Ctrl+G "A16" ↵ Ctrl+Alt+V E ↵', requires: ['paste-special', 'go-to'], check: s => s.value('A16') === 'Day' && s.value('A17') === 'Sales' && s.value('A18') === 'Units' && s.value('A19') === 'Revenue' },
    { id: 'multiply', text: 'Copy the 1.1 uplift in H2 and multiply it into the Sales figures B3:B7 in one paste.', keys: 'Ctrl+G "H2" ↵ Ctrl+C Ctrl+G "B3:B7" ↵ Ctrl+Alt+V M ↵', requires: ['paste-special', 'go-to'], check: s => near(s.value('B3'), 1320) && near(s.value('B7'), 1842.5) },
  ],
  endState: [
    { text: 'The value snapshot in F3:F7 held its numbers when Sales changed', check: s => near(s.value('F3'), 1260) && near(s.value('F7'), 1758.75) },
  ],
  closing: ['Notice the order: the snapshot was taken before the uplift, so F still shows the old revenue while D moved with the new Sales. That is what values-only paste is for — a number frozen in time, on purpose.'],
  solution: 'Ctrl+Shift+Down Ctrl+C Ctrl+G "F3" Enter Ctrl+Alt+V V Enter Ctrl+G "B2" Enter Ctrl+C Ctrl+G "F2" Enter Ctrl+Alt+V T Enter Ctrl+G "A2:D2" Enter Ctrl+C Ctrl+G "A16" Enter Ctrl+Alt+V E Enter Ctrl+G "H2" Enter Ctrl+C Ctrl+G "B3:B7" Enter Ctrl+Alt+V M Enter',
};
