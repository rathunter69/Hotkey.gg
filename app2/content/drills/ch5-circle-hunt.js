// Practice · Finance and Accounting — Circle hunt (script-drills D68). The finished model with one
// planted fault: FY28's site-cost total on Schedules (G38) sums its own cell. Iterative calculation
// is on for the model's intended interest circle, so nothing warns: the total just runs a hundred
// times too high and drags everything under it. Find the total, stop its range short of itself and
// prove the model on Checks. Graded on no SUM in the site-cost row reading its own cell, the row and
// the balance check being the finished model's, and Circ and iteration still on at the end.
import { across, planting, modelDrill } from './model-drills.js';
import { settled, like, sheetIn, cursorAt, reads } from '../lessons/lib/model-checks.js';

const S = 'Schedules', ROW = 38, CELL = 'G38', C = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const noSelf = ses => { const sh = sheetIn(ses, S); return !!sh && across(ROW).every(r => !!sh.formula(r) && !reads(sh, r, [r])); };
const fixed = ses => noSelf(ses) && like(ses, S, across(ROW));
const steady = ses => sheetIn(ses, 'Inputs').value('C81') === 1 && ses.settings.iterative === true;
const balanced = ses => { const ch = sheetIn(ses, 'Checks'); return !!ch && C.every(c => ch.value(c + '6') === 0); };
const KEYS = {
  find: `Ctrl+G "${S}!${CELL}" ↵`,
  fix: '"=SUM(G32:G37)" ↵',
  prove: 'Ctrl+G "Checks!C6" ↵',
};

export default modelDrill({
  id: 'ch5-circle-hunt',
  title: 'Circle hunt',
  task: 'Something on this model adds itself and iteration is on, so nothing warns: find it and fix it.',
  module: 'auditing-a-model',
  state: { before: 'DONE' },
  plant: () => planting({ set: { [`${S}!${CELL}`]: { formula: '=SUM(G32:G38)' } } }),
  goals: [
    { id: 'find', text: 'Find the site-cost total on Schedules whose SUM runs through its own cell, and land on it.', keys: KEYS.find,
      check: (s, ses) => settled(ses) && cursorAt(ses, S, CELL) },
    { id: 'fix', text: `Stop the SUM in Schedules ${CELL} at row 37, so the site costs add G32:G37 and not themselves.`, keys: KEYS.fix,
      check: (s, ses) => settled(ses) && fixed(ses) },
    { id: 'prove', text: 'Go to the balance check on Checks C6, which reads 0 in every year with Circ still at 1.', keys: KEYS.prove,
      check: (s, ses) => settled(ses) && cursorAt(ses, 'Checks', 'C6') && fixed(ses) && balanced(ses) && steady(ses) },
  ],
  endState: [
    { text: 'No site-cost total reads its own cell, the totals are the finished model’s, and Circ and iteration are still on', check: (s, ses) => fixed(ses) && balanced(ses) && steady(ses) },
  ],
  solution: Object.values(KEYS).join(' ').replace(/↵/g, 'Enter'),
  optimalKeys: 50,
  route: 45,
});
