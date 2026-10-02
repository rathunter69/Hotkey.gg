// Practice · Finance and Accounting — Why doesn't it balance? (screenplay 6.2, the chapter's
// puzzle). The finished model with one link on the cash flow typed over: FY28's change in deferred
// membership revenue is a number now, 500 more than the schedule says, still green like the links
// around it. The BS is out by exactly 500 from FY28 on. The task line is all the learner gets;
// graded on the source cell put back as a link, the balance check at 0 in every year, and nothing
// else on the BS or the cash flow changed (no plug).
import { modelDrill, doneCell } from './model-drills.js';
import { settled, like, finished, sheetIn } from '../lessons/lib/model-checks.js';
import { norm } from '../lessons/lib/model-build.js';

const C = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const SOURCE = 'G10', OFF = 500;
// the planted figure is the finished model's plus 500 (built on first read, see modelDrill)
const planted = () => ({ [`CF!${SOURCE}`]: { ...Object.fromEntries(Object.entries(doneCell('CF', SOURCE)).filter(([k]) => k !== 'formula')), value: Math.round(finished()('CF', SOURCE)) + OFF } });
const balanced = ses => { const ch = sheetIn(ses, 'Checks'); return !!ch && C.every(c => ch.value(c + '6') === 0); };
const untouched = (ses, name, except = []) => { const sh = sheetIn(ses, name); return !!sh && Object.keys(sh.cells).filter(k => !except.includes(k)).every(k => norm(sh.cells[k].formula) === norm(doneCell(name, k).formula)); };
const solved = ses => { const cf = sheetIn(ses, 'CF'); return !!cf.cells[SOURCE] && !!cf.cells[SOURCE].formula && like(ses, 'CF', [SOURCE]) && balanced(ses) && untouched(ses, 'BS') && untouched(ses, 'CF', [SOURCE]); };

export default modelDrill({
  id: 'puzzle-ch5',
  title: 'Why doesn’t it balance?',
  task: 'Trace a round-number balance sheet error back to its source.',
  module: 'linking-the-statements',
  state: { before: 'DONE' },
  plant: () => planted(),
  goals: [
    { id: 'source', text: 'Find the cell that throws the BS out from FY28 and put it back as a link, so Checks row 6 reads 0 in every year.', keys: 'Ctrl+G "CF!G10" ↵ "=Schedules!G55" ↵',
      check: (s, ses) => settled(ses) && solved(ses) },
  ],
  endState: [
    { text: 'The source cell is a link again, the balance check reads 0 in every year, and nothing else has moved', check: (s, ses) => solved(ses) },
  ],
  solution: 'Ctrl+G "CF!G10" Enter "=Schedules!G55" Enter',
  optimalKeys: 30,
  route: 60,
});
