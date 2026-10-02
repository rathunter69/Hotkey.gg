// Practice · Finance and Accounting — Balance it (screenplay 6.2; script-drills D72). The finished
// model with one planted break: total liabilities on the BS sums the term loan and the revolver and
// leaves out the delayed-draw loan, so the BS is out from FY27, the year the loan is drawn. Find the
// first year out on Checks, then fix the total at its source: the balance check reads 0 in every
// year, the total reads the delayed-draw line, and nothing else on the BS has changed (no plug).
import { across, planting, modelDrill, doneCell } from './model-drills.js';
import { settled, like, reads, sheetIn } from '../lessons/lib/model-checks.js';
import { norm } from '../lessons/lib/model-build.js';

const C = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const BROKEN = Object.fromEntries(C.map(c => [`BS!${c}18`, { formula: `=SUM(${c}13:${c}15)+${c}17` }]));
const balanced = ses => { const ch = sheetIn(ses, 'Checks'); return !!ch && C.every(c => ch.value(c + '6') === 0); };
// no plug: every other formula on the BS is the finished model's
const untouched = ses => { const bs = sheetIn(ses, 'BS'); return !!bs && Object.keys(bs.cells).filter(k => !/^[C-J]18$/.test(k)).every(k => norm(bs.cells[k].formula) === norm(doneCell('BS', k).formula)); };
const fixed = ses => { const bs = sheetIn(ses, 'BS'); return C.every(c => reads(bs, c + '18', [c + '16'])) && like(ses, 'BS', across(18)) && balanced(ses) && untouched(ses); };

export default modelDrill({
  id: 'ch5-balance-it',
  title: 'Balance it',
  task: 'The balance sheet is out from FY27: find the first year the check fails, then fix the break at its source with no plug.',
  module: 'linking-the-statements',
  state: { before: 'DONE' },
  plant: () => planting({ set: BROKEN }),
  goals: [
    { id: 'find', text: 'Find the first year the balance check on Checks row 6 is not 0, and land on that cell.', keys: 'Ctrl+G "Checks!F6" ↵',
      check: (s, ses) => ses.sheets[ses.sheetIndex].name === 'Checks' && s.active.r === 6 && s.active.c === 6 },
    { id: 'fix', text: 'Fix total liabilities on BS C18:J18 so it adds every liability, the delayed-draw loan in row 16 included.', keys: 'Ctrl+G "BS!C18:J18" ↵ "=SUM(C13:C17)" Ctrl+↵',
      check: (s, ses) => settled(ses) && fixed(ses) },
  ],
  endState: [
    { text: 'Total liabilities reads every liability, the balance check reads 0 in every year, and nothing else on the BS has moved', check: (s, ses) => fixed(ses) },
  ],
  solution: 'Ctrl+G "Checks!F6" Enter Ctrl+G "BS!C18:J18" Enter "=SUM(C13:C17)" Ctrl+Enter',
  optimalKeys: 50,
  route: 30,
});
