// Practice · Finance and Accounting — Breaker (script-drills D74). The finished model with "tbc"
// typed over FY28's term-loan interest on Schedules (G84): the error runs round the interest circle,
// so every sheet downstream reads #VALUE! and stays that way even once the cell is refilled, because
// the circle keeps feeding the error back to itself. Break the circle with Circ on Inputs, refill the
// cell from its neighbor, close the circle again and read the error count on Checks. Graded on the
// interest row being the finished model's formula across, Circ at 1, no errors anywhere and the
// balance check at 0.
import { across, planting, modelDrill, doneCell } from './model-drills.js';
import { settled, like, sheetIn, cursorAt } from '../lessons/lib/model-checks.js';
import { norm } from '../lessons/lib/model-build.js';

const S = 'Schedules', ROW = 84, CELL = 'G84', C = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const ERR_ROWS = [30, 31, 32, 33, 34, 35];
const circ = ses => sheetIn(ses, 'Inputs').value('C81');
const rowBack = ses => { const sh = sheetIn(ses, S); return !!sh && across(ROW).every(r => norm(sh.formula(r)) === norm(doneCell(S, r).formula)); };
const clean = ses => { const ch = sheetIn(ses, 'Checks'); return !!ch && ERR_ROWS.every(r => ch.value('C' + r) === 0) && C.every(c => ch.value(c + '6') === 0); };
const KEYS = {
  off: 'Ctrl+G "Inputs!C81" ↵ "0" ↵',
  refill: `Ctrl+G "${S}!F84:G84" ↵ Ctrl+R`,
  on: 'Ctrl+G "Inputs!C81" ↵ "1" ↵',
  read: 'Ctrl+G "Checks!C30" ↵',
};

export default modelDrill({
  id: 'ch5-breaker',
  title: 'Breaker',
  task: 'Someone typed text into an interest cell and the model is a wall of errors, so get it back inside a minute.',
  module: 'schedules',
  state: { before: 'DONE' },
  plant: () => planting({ set: { [`${S}!${CELL}`]: { value: 'tbc' } } }),
  goals: [
    { id: 'off', text: 'Set the breaker, Circ in Inputs C81, to 0 so the error stops feeding round the circle.', keys: KEYS.off,
      check: (s, ses) => settled(ses) && circ(ses) === 0 },
    { id: 'refill', text: `Refill the interest in Schedules ${CELL} from F84, its neighbor on the left.`, keys: KEYS.refill,
      check: (s, ses) => settled(ses) && norm(sheetIn(ses, S).formula(CELL)) === norm(doneCell(S, CELL).formula) },
    { id: 'on', text: 'Set Circ in Inputs C81 back to 1, so interest reads the average balance again.', keys: KEYS.on,
      check: (s, ses) => settled(ses) && circ(ses) === 1 && rowBack(ses) && like(ses, S, [CELL]) },
    { id: 'read', text: 'Go to the error count on Checks C30 and read it down to C35, where every sheet reads 0.', keys: KEYS.read,
      check: (s, ses) => settled(ses) && cursorAt(ses, 'Checks', 'C30') && clean(ses) },
  ],
  endState: [
    { text: 'The interest row is one formula across, Circ reads 1, no sheet holds an error and the balance check reads 0', check: (s, ses) => rowBack(ses) && circ(ses) === 1 && clean(ses) },
  ],
  solution: Object.values(KEYS).join(' ').replace(/↵/g, 'Enter'),
  optimalKeys: 70,
  route: 30,
});
