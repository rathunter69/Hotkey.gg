// Practice · Finance and Accounting — Sweep (screenplay 6.2; script-drills D73, D86). The revolver
// block on Schedules with its draw and repayment lines emptied (formats stay). Write the sweep with
// MAX and MIN, then stress it: eighteen new sites in FY28 run cash short, the revolver draws, repays
// from the FY31 surplus, never goes below zero and never lets cash under the minimum. Each line is
// graded on the finished figures in the base case and under the stress (a what-if), and calls MAX
// (and MIN for the repayment) on every cell.
import { across, planting, modelDrill, doneCell } from './model-drills.js';
import { settled, like, under, finished, sheetIn, isNum } from '../lessons/lib/model-checks.js';
import { calls } from '../lessons/lib/databook-checks.js';

const S = 'Schedules', C = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const STRESS = 18, PROJ = ['F', 'G', 'H', 'I', 'J'];   // the minimum binds in the projection years; the history is as it was
let STRESSED = null;   // the finished model under the stress, worked out on first use
const stressed = () => STRESSED || (STRESSED = finished({ 'Inputs!G21': { ...doneCell('Inputs', 'G21'), value: STRESS } }));
const F = { draw: '=IF(Inputs!C$6=0,0,MAX(C100-C99,0))', repay: '=IF(Inputs!C$6=0,0,-MIN(MAX(C99-C100,0),C98))' };
const line = (ses, row, fns) => { const sh = sheetIn(ses, S); return C.every(c => calls(sh, c + row, fns)) && like(ses, S, across(row))
  && under(ses, { 'Inputs!G21': STRESS }, x => like(x, S, across(row), stressed())); };
const sound = ses => { const sh = sheetIn(ses, S), bs = sheetIn(ses, 'BS'), min = sheetIn(ses, 'Inputs').value('C80');
  return C.every(c => isNum(sh.value(c + '103')) && sh.value(c + '103') >= 0) && PROJ.every(c => bs.value(c + '6') >= min - 0.01) && sh.value('G101') > 0 && sh.value('J102') < 0; };

export default modelDrill({
  id: 'ch5-sweep',
  title: 'Sweep',
  task: 'Write the revolver’s draw and repayment with MAX and MIN, then run cash short in FY28 and watch it draw and repay.',
  module: 'linking-the-statements',
  state: { before: 'DONE' },
  plant: () => planting({ blank: { [S]: across([101, 102]) } }),
  goals: [
    { id: 'draw', text: `The draw in Schedules C101:J101, any shortfall under the minimum cash: ${F.draw}.`, keys: `Ctrl+G "Schedules!C101:J101" ↵ "${F.draw}" Ctrl+↵`,
      check: (s, ses) => settled(ses) && line(ses, 101, ['MAX']) },
    { id: 'repay', text: `The repayment in C102:J102, any surplus over the minimum up to the balance: ${F.repay}.`, keys: `Ctrl+G "Schedules!C102:J102" ↵ "${F.repay}" Ctrl+↵`,
      check: (s, ses) => settled(ses) && line(ses, 102, ['MIN', 'MAX']) },
    { id: 'stress', text: `Run FY28 short: type ${STRESS} new sites into Inputs G21, and the revolver draws in FY28 and repays in FY31.`, keys: `Ctrl+G "Inputs!G21" ↵ "${STRESS}" ↵`,
      check: (s, ses) => settled(ses) && sheetIn(ses, 'Inputs').value('G21') === STRESS && sound(ses) },
  ],
  endState: [
    { text: 'The sweep is the finished model’s under the stress: the revolver never below zero and cash never under the minimum', check: (s, ses) => like(ses, S, across([101, 102, 103]), stressed()) && sound(ses) },
  ],
  solution: `Ctrl+G "Schedules!C101:J101" Enter "${F.draw}" Ctrl+Enter Ctrl+G "Schedules!C102:J102" Enter "${F.repay}" Ctrl+Enter Ctrl+G "Inputs!G21" Enter "${STRESS}" Enter`,
  optimalKeys: 150,
  route: 60,
});
