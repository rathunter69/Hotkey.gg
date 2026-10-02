// Practice · Formatting — Flag it (screenplay 6.2). The pack after its highlight rules (state S5a): the
// checks on the P&L (C39:C40) and on Monthly (C34:C35) read zero and nothing watches them. One formula
// rule on each block turns a check red the moment it leaves zero. Graded on what the rules paint, by a
// what-if: at the seed no check is red; with FY26E total revenue typed 5 over its lines, every check
// that moves turns red. Any rule that paints that way passes (a formula rule or a cell value rule).
import { pnlDrill, pnl, sheetIn, settled, withCell } from './pnl-drills.js';

const BLOCKS = { pnl: ['P&L', ['C39', 'C40']], monthly: ['Monthly', ['C34', 'C35']] };
/** A rule paints the cell: a fill or a font color from conditional formatting. */
const paints = (sh, ref) => { const m = sh.condFmtMap()[ref]; return !!m && !!(m.fill || m.fontColor); };
/** The block is quiet at zero and painted once its checks leave zero: FY26E total revenue 5 over its lines moves every check, FY24A's moves the P&L's first. */
function flags(ses, id) {
  const [name, refs] = BLOCKS[id]; const sh = sheetIn(ses, name); if (!sh) return false;
  if (refs.some(ref => paints(sh, ref))) return false;
  return withCell(ses, 'P&L', 'E10', { formula: '=SUM(E7:E9)+5' }, () => refs.every(ref => sh.value(ref) === 0 || paints(sh, ref)) && refs.some(ref => paints(sh, ref)))
    && withCell(ses, 'P&L', 'C10', { formula: '=SUM(C7:C9)+5' }, () => refs.every(ref => sh.value(ref) === 0 || paints(sh, ref)));
}

export default pnlDrill({
  id: 'ch2-flag-it',
  title: 'Flag it',
  task: 'One rule on each checks block: a check that isn’t zero turns red.',
  module: 'conditional-formatting',
  state: { before: 'S5a' },
  goals: [
    { id: 'pnl', text: 'Select the checks C39:C40 and add the formula rule =C39<>0 with the Light Red Fill.', keys: 'Ctrl+G "C39:C40" ↵ Alt H L N "=C39<>0" ↵',
      check: (s, ses) => settled(ses) && flags(ses, 'pnl') },
    { id: 'monthly', text: 'On Monthly, give the checks C34:C35 the same rule, =C34<>0.', keys: 'Ctrl+G "Monthly!C34:C35" ↵ Alt H L N "=C34<>0" ↵',
      check: (s, ses) => settled(ses) && flags(ses, 'monthly') },
  ],
  endState: [
    { text: 'No check is red while the pack ties, and every check that leaves zero turns red', check: (s, ses) => flags(ses, 'pnl') && flags(ses, 'monthly') },
  ],
  solution: 'Ctrl+G "C39:C40" Enter Alt H L N "=C39<>0" Enter Ctrl+G "Monthly!C34:C35" Enter Alt H L N "=C34<>0" Enter',
  optimalKeys: 70,
  route: 30,
});
