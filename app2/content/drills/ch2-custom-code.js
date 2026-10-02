// Practice · Formatting — Custom code (screenplay 6.2; script-drills D44). The P&L before its custom
// codes (state S1d): the washes line is a units column in thousands, the sites a count, the margins
// percentages and the checks plain. Each gets a four-section code typed into Ctrl+1's Custom box:
// the washes with a k, every code with parentheses for a negative and a dash for a zero, the checks
// painting a negative red. Graded on what each cell renders for a positive, a negative and a zero, so
// any code that reads the same passes.
import { pnlDrill, pnl, settled, rendersLike, across } from './pnl-drills.js';

const CODE = { k: '#,##0"k"_);(#,##0"k");-_)', plain: '#,##0_);(#,##0);-_)', pct: '0.0%_);(0.0%);-_)', check: '0_);[Red](0);-_)' };
const TYPED = { k: '#,##0k_);(#,##0k);-_)', plain: CODE.plain, pct: CODE.pct, check: CODE.check };
const CELLS = { k: across(34), plain: across(33), pct: across([27, 28, 29]), check: ['C39', 'C40'] };
const BOX = code => `Ctrl+1 N Tab End Alt+T "${code}" ↵`;
const ok = (ses, id) => rendersLike(pnl(ses), CELLS[id], CODE[id]);

export default pnlDrill({
  id: 'ch2-custom-code',
  title: 'Custom code',
  task: 'Write the four-section codes: washes in k, negatives in parentheses, a dash for every zero.',
  module: 'custom-number-formats',
  state: { before: 'S1d' },
  goals: [
    { id: 'k', text: 'Washes C34:E34 are thousands: give them #,##0k_);(#,##0k);-_) in the Custom box at the foot of Ctrl+1’s list.', keys: `Ctrl+G "C34:E34" ↵ ${BOX(TYPED.k)}`,
      check: (s, ses) => settled(ses) && ok(ses, 'k') },
    { id: 'plain', text: 'Sites C33:E33 take the plain code #,##0_);(#,##0);-_), so a zero reads as a dash.', keys: `Ctrl+G "C33:E33" ↵ ${BOX(TYPED.plain)}`,
      check: (s, ses) => settled(ses) && ok(ses, 'plain') },
    { id: 'pct', text: 'The margins C27:E29 take the percent code 0.0%_);(0.0%);-_).', keys: `Ctrl+G "C27:E29" ↵ ${BOX(TYPED.pct)}`,
      check: (s, ses) => settled(ses) && ok(ses, 'pct') },
    { id: 'check', text: 'The checks C39:C40 take 0_);[Red](0);-_), so a negative check paints itself red.', keys: `Ctrl+G "C39:C40" ↵ ${BOX(TYPED.check)}`,
      check: (s, ses) => settled(ses) && ok(ses, 'check') },
  ],
  endState: [
    { text: 'Every code reads a positive, a negative in parentheses and a zero as a dash, the washes with their k', check: (s, ses) => Object.keys(CELLS).every(id => ok(ses, id)) },
  ],
  solution: ['C34:E34', 'C33:E33', 'C27:E29', 'C39:C40'].map((rg, i) => `Ctrl+G "${rg}" Enter Ctrl+1 N Tab End Alt+T "${Object.values(TYPED)[i]}" Enter`).join(' '),
  optimalKeys: 150,
  route: 45,
});
