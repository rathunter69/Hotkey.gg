// Practice · Finance and Accounting — Discount it (screenplay 6.2). The DCF page with its
// discounting emptied (formats stay): the period row, the factors, the present values, their sum
// and the end-year memo the NPV check reads. Build the factors by hand with the mid-year switch on
// Inputs, then prove them: the end-year sum by NPV, so the check on Checks C27 reads 0. Graded on the
// finished figures and a what-if on WACC's inputs.
import { across, planting, modelDrill } from './model-drills.js';
import { settled, like, moves, sheetIn } from '../lessons/lib/model-checks.js';

const D = 'DCF';
const F = {
  period: '=IF(Inputs!C$6=1,Inputs!C$8-IF(Inputs!$C$97=1,0.5,0),0)',
  factor: '=IF(Inputs!C$6=1,1/(1+WACC)^C20,0)',
  pv: '=C16*C21', sum: '=SUM(C22:J22)', npv: '=NPV(WACC,F16:J16)',
};
const proved = ses => { const ch = sheetIn(ses, 'Checks'); return !!ch && ch.value('C27') === 0; };

export default modelDrill({
  id: 'ch5-discount-it',
  title: 'Discount it',
  task: 'Build the periods, the discount factors and the present values on DCF by hand, then prove them with NPV.',
  module: 'dcf',
  state: { before: 'DONE' },
  plant: () => planting({ blank: { [D]: [...across([20, 21, 22]), 'C23', 'C24'] } }),
  goals: [
    { id: 'period', text: `The periods in DCF C20:J20, mid-year when Inputs C97 is 1: ${F.period} with Ctrl+Enter.`, keys: `Ctrl+G "DCF!C20:J20" ↵ "${F.period}" Ctrl+↵`,
      check: (s, ses) => settled(ses) && like(ses, D, across(20)) && moves(ses, 'DCF!J20', 'Inputs!C97') },
    { id: 'factor', text: `The discount factors in C21:J21: ${F.factor} with Ctrl+Enter.`, keys: `Ctrl+G "DCF!C21:J21" ↵ "${F.factor}" Ctrl+↵`,
      check: (s, ses) => settled(ses) && like(ses, D, across(21)) && moves(ses, 'DCF!J21', 'Inputs!C88') },
    { id: 'pv', text: 'The present values in C22:J22, free cash flow times the factor, and their sum in C23.', keys: `Ctrl+G "DCF!C22:J22" ↵ "${F.pv}" Ctrl+↵ Ctrl+G "DCF!C23" ↵ "${F.sum}" ↵`,
      check: (s, ses) => settled(ses) && like(ses, D, [...across(22), 'C23']) && moves(ses, 'DCF!C23', 'Inputs!C88') },
    { id: 'npv', text: `Prove the factors: the end-year sum in C24 as ${F.npv}, so the check on Checks C27 reads 0.`, keys: `Ctrl+G "DCF!C24" ↵ "${F.npv}" ↵`,
      check: (s, ses) => settled(ses) && like(ses, D, ['C24']) && moves(ses, 'DCF!C24', 'Inputs!C88') && proved(ses) },
  ],
  endState: [
    { text: 'The discounting on DCF is the finished model’s and the NPV check reads 0', check: (s, ses) => like(ses, D, [...across([20, 21, 22]), 'C23', 'C24']) && proved(ses) },
  ],
  solution: `Ctrl+G "DCF!C20:J20" Enter "${F.period}" Ctrl+Enter Ctrl+G "DCF!C21:J21" Enter "${F.factor}" Ctrl+Enter Ctrl+G "DCF!C22:J22" Enter "${F.pv}" Ctrl+Enter Ctrl+G "DCF!C23" Enter "${F.sum}" Enter Ctrl+G "DCF!C24" Enter "${F.npv}" Enter`,
  optimalKeys: 200,
  route: 75,
});
