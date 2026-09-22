// Practice · Foundations — Number formats: Ctrl+1 and the format chords, no menus by mouse
import { parsFrom } from '../../app/pars.js';

const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Share', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { formula: '=B3/6355' },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { formula: '=B4/6355' },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { formula: '=B5/6355' },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { formula: '=B6/6355' },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { formula: '=B7/6355' },
};

export default {
  id: 'format-cells-numbers',
  chapter: 'foundations',
  title: 'Number formats',
  task: 'Comma the Sales, percent the shares, centre the title across the report.',
  access: 'free',
  sheet: { cells: SHEET, active: { r: 3, c: 2 }, colW: { 1: 92 } },
  goals: [
    { id: 'comma', text: 'Give the Sales figures B3:B7 the Number format from Ctrl+1.', keys: 'Ctrl+Shift+↓ Ctrl+1 N', check: s => ['B3', 'B5', 'B7'].every(r => s.cellAt(r).fmtStyle === 'comma') },
    { id: 'percent', text: 'Make the Share column C3:C7 read as percentages.', keys: 'Ctrl+G "C3:C7" ↵ Ctrl+Shift+%', check: s => ['C3', 'C5', 'C7'].every(r => s.cellAt(r).fmtStyle === 'percent') },
    { id: 'center', text: 'Centre the title across A1:C1.', keys: 'Ctrl+G "A1:C1" ↵ Ctrl+1 A', check: s => s.cellAt('A1').ca === 3 },
  ],
  endState: [
    { text: 'Sales still show commas and shares still show percent', check: s => s.cellAt('B4').fmtStyle === 'comma' && s.cellAt('C4').fmtStyle === 'percent' },
  ],
  solution: 'Ctrl+Shift+Down Ctrl+1 N Ctrl+G "C3:C7" Enter Ctrl+Shift+% Ctrl+G "A1:C1" Enter Ctrl+1 A',
  optimalKeys: 20,
  pars: parsFrom(9),
};
