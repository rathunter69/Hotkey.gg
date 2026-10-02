// Practice · Formatting — Format sprint (screenplay 6.2). The P&L with its signs already flipped
// (state S1b) and every number format taken off: the lines and the memo counts read as General,
// 18000.4 and -3960.3. The desk number format goes on every dollar line and the counts, one setting
// a line, and revenue per wash reads to the cent. Graded on the code each cell renders with: any
// code with separators, no decimals and negatives in parentheses passes (the built-in or a custom one).
import { pnlDrill, pnl, settled, desk, across, unformatted } from './pnl-drills.js';
import { cellFormatCode } from '../../app/graders.js';

const REVENUE = across([7, 8, 9, 10]), COSTS = across([13, 14, 15, 16, 17, 18, 19, 20]), BOTTOM = across([22, 23, 24]), COUNTS = across([33, 34]), PER_WASH = across([35]);
const DESK_KEYS = 'Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N ↓ ↓ ↵';
const cents = sh => !!sh && PER_WASH.every(ref => /^#,##0\.00(_\)|$)/.test(cellFormatCode(sh.cells[ref])) || /^\$?#,##0\.00/.test(cellFormatCode(sh.cells[ref])));

export default pnlDrill({
  id: 'ch2-format-sprint',
  title: 'Format sprint',
  task: 'Put the desk number format on every line of the P&L: separators, no decimals, negatives in parentheses.',
  module: 'number-formats',
  state: { before: 'S1b' },
  plant: () => unformatted('S1b', 'P&L', [...REVENUE, ...COSTS, ...BOTTOM, ...COUNTS, ...PER_WASH]),
  goals: [
    { id: 'revenue', text: 'Give the revenue lines C7:E10 the desk number format from Ctrl+1: Number, no decimals, the separator and (1,234).', keys: `Ctrl+G "C7:E10" ↵ ${DESK_KEYS}`,
      check: (s, ses) => settled(ses) && desk(pnl(ses), REVENUE) },
    { id: 'costs', text: 'Select the site costs C13:E20 and repeat the format with F4.', keys: 'Ctrl+G "C13:E20" ↵ F4',
      check: (s, ses) => settled(ses) && desk(pnl(ses), COSTS) },
    { id: 'bottom', text: 'Site contribution, head office and EBITDA in C22:E24 take it too: select them and press F4.', keys: 'Ctrl+G "C22:E24" ↵ F4',
      check: (s, ses) => settled(ses) && desk(pnl(ses), BOTTOM) },
    { id: 'counts', text: 'Sites and washes in C33:E34 read the same way: select them and press F4.', keys: 'Ctrl+G "C33:E34" ↵ F4',
      check: (s, ses) => settled(ses) && desk(pnl(ses), COUNTS) },
    { id: 'cents', text: 'Revenue per wash in C35:E35 reads to the cent: give it two decimals with Ctrl+Shift+1.', keys: 'Ctrl+G "C35:E35" ↵ Ctrl+Shift+1',
      check: (s, ses) => settled(ses) && cents(pnl(ses)) },
  ],
  endState: [
    { text: 'Every dollar line and both counts read in the desk number format, and revenue per wash reads to the cent', check: (s, ses) => desk(pnl(ses), [...REVENUE, ...COSTS, ...BOTTOM, ...COUNTS]) && cents(pnl(ses)) },
  ],
  solution: `Ctrl+G "C7:E10" Enter Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N Down Down Enter Ctrl+G "C13:E20" Enter F4 Ctrl+G "C22:E24" Enter F4 Ctrl+G "C33:E34" Enter F4 Ctrl+G "C35:E35" Enter Ctrl+Shift+1`,
  optimalKeys: 80,
  route: 30,
});
