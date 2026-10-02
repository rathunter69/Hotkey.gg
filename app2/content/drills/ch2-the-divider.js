// Practice · Formatting — The divider (screenplay 6.2). The P&L before its divider (state S3a), with the
// A and E flags under the timeline gone. Type the flags back, shade the estimate header on the P&L
// and Monthly's twelve estimate months, and draw the one vertical line down the last actual column.
// Graded on the flags, the shade on the estimate columns only, and the divider's right border.
import { DIVIDER_FILL, MONTH_COLS } from '../workbooks/clearcoat-pnl.js';
import { pnlDrill, pnl, sheetIn, settled, cellIn, lacks } from './pnl-drills.js';

const FLAG_CELLS = ['C5', 'D5', 'E5'], FLAGS = ['A', 'A', 'E'];
/** The planting: the flags emptied, their italic and alignment kept. */
const plant = () => Object.fromEntries(FLAG_CELLS.map(ref => { const { value, ...fmt } = cellIn('S3a', 'P&L', ref) || {}; return [`P&L!${ref}`, fmt]; }));
const flagged = sh => !!sh && FLAG_CELLS.every((ref, i) => sh.value(ref) === FLAGS[i]);
const shaded = sh => !!sh && ['E4', 'E5'].every(ref => sh.cellAt(ref).fill === DIVIDER_FILL) && lacks(sh, ['C4', 'C5', 'D4', 'D5'], 'fill');
const monthsShaded = sh => !!sh && MONTH_COLS.every(col => sh.cellAt(col + '4').fill === DIVIDER_FILL) && !sh.cellAt('O4').fill;
const divider = sh => { if (!sh) return false; for (let r = 4; r <= 35; r++) if (!sh.cellAt('D' + r).br) return false; return !sh.cellAt('C7').br && !sh.cellAt('E7').br; };

export default pnlDrill({
  id: 'ch2-the-divider',
  title: 'The divider',
  task: 'Mark where the actuals end and the estimates start: the flags, the shaded estimate headers and the divider.',
  module: 'the-page-a-buyer-reads',
  state: { before: 'S3a' },
  plant,
  goals: [
    { id: 'flags', text: 'Type the flags under the timeline: A in C5 and D5, E in E5.', keys: 'Ctrl+G "C5" ↵ "A" Tab "A" Tab "E" ↵',
      check: (s, ses) => settled(ses) && flagged(pnl(ses)) },
    { id: 'shade', text: 'Shade the estimate header E4:E5 gray with Alt, H, H, → and Enter.', keys: 'Ctrl+G "E4:E5" ↵ Alt H H → ↵',
      check: (s, ses) => settled(ses) && shaded(pnl(ses)) },
    { id: 'monthly', text: 'Every month on Monthly is an estimate: shade its header C4:N4 the same gray.', keys: 'Ctrl+G "Monthly!C4:N4" ↵ Alt H H → ↵',
      check: (s, ses) => settled(ses) && monthsShaded(sheetIn(ses, 'Monthly')) },
    { id: 'divider', text: 'Back on the P&L, give the last actual column D4:D35 a right border with Alt, H, B, R.', keys: `Ctrl+G "'P&L'!D4:D35" ↵ Alt H B R`,
      check: (s, ses) => settled(ses) && divider(pnl(ses)) },
  ],
  endState: [
    { text: 'The flags read A, A and E, the estimate headers are shaded on both pages, and the divider runs down D', check: (s, ses) => { const p = pnl(ses); return flagged(p) && shaded(p) && monthsShaded(sheetIn(ses, 'Monthly')) && divider(p); } },
  ],
  solution: `Ctrl+G "C5" Enter "A" Tab "A" Tab "E" Enter Ctrl+G "E4:E5" Enter Alt H H Right Enter Ctrl+G "Monthly!C4:N4" Enter Alt H H Right Enter Ctrl+G "'P&L'!D4:D35" Enter Alt H B R`,
  optimalKeys: 70,
  route: 30,
});
