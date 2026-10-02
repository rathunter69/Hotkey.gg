// Practice · Formatting — Whose P&L is this? (screenplay 6.2, the chapter's puzzle). The finished page
// (state Pdone) with one line's format swapped for another desk's: utilities shows its negatives with
// a minus sign where every other cost sits in parentheses. The task line is all the learner gets;
// graded on an x in column A beside that line and nowhere else, and the line put back on the page's
// code (any code that renders the same passes).
import { pnlDrill, pnl, settled, across, cellIn, rendersLike } from './pnl-drills.js';

const ROW = 16, PLAIN = '#,##0_);(#,##0);-_)', WRONG = '#,##0_);-#,##0_);-_)';
const LINE_ROWS = [7, 8, 9, 10, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24];
const plant = () => Object.fromEntries(across(ROW).map(ref => [`P&L!${ref}`, { ...cellIn('Pdone', 'P&L', ref), numFmt: WRONG }]));
const marked = sh => !!sh && String(sh.value('A' + ROW) || '').toLowerCase() === 'x' && LINE_ROWS.filter(r => r !== ROW).every(r => sh.value('A' + r) == null || sh.value('A' + r) === '');
const fixed = sh => rendersLike(sh, across(ROW), PLAIN);

export default pnlDrill({
  id: 'puzzle-ch2',
  title: 'Whose P&L is this?',
  task: 'One line on this P&L is formatted wrong, and the format tells you which: mark it and fix it.',
  module: 'custom-number-formats',
  state: { before: 'Pdone' },
  plant,
  goals: [
    { id: 'mark', text: 'Type x in column A beside the line whose format breaks the page.', keys: 'Ctrl+G "A16" ↵ "x" ↵',
      check: (s, ses) => settled(ses) && marked(pnl(ses)) },
    { id: 'fix', text: 'Put that line back on the page’s code, so its negatives sit in parentheses like the rest.', keys: `Ctrl+G "C16:E16" ↵ Ctrl+1 N Tab End Alt+T "${PLAIN}" ↵`,
      check: (s, ses) => settled(ses) && marked(pnl(ses)) && fixed(pnl(ses)) },
  ],
  endState: [
    { text: 'Utilities is marked and reads like every other cost line', check: (s, ses) => marked(pnl(ses)) && fixed(pnl(ses)) },
  ],
  solution: `Ctrl+G "A16" Enter "x" Enter Ctrl+G "C16:E16" Enter Ctrl+1 N Tab End Alt+T "${PLAIN}" Enter`,
  optimalKeys: 60,
  route: 45,
});
