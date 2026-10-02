// Practice · Valuation — Lender's return (script-drills D90, Wave 1). The finished LBO with the senior
// lender's line emptied (formats stay): the loan out at closing, each year's interest and repayments
// back with the balance repaid at the exit, and the lender's IRR, which should sit near the loan's
// rate. Each cell is graded on the figure the pack's own formula gives on the learner's cells; the
// sweep is its own line in the schedule, which is the usual miss, and the IRR moves with the rate.
import { valuationDrill, emptied, refsOf, fillFrom } from './valuation-drills.js';
import { settled, built, sheetIn, liveVia, toScript, isNum } from '../lessons/lib/bids-checks.js';

const S = 'LBO';
const PARTS = { out: ['C117'], back: refsOf('D117:H117'), irr: ['C118'] };
const ok = id => ses => built(ses, S, PARTS[id]);
const nearRate = ses => { const sh = sheetIn(ses, S); const v = sh.value('C118'); return isNum(v) && Math.abs(v - sh.value('C11')) <= 0.005; };
const KEYS = { out: fillFrom(S, 'C117'), back: fillFrom(S, 'D117:H117'), irr: fillFrom(S, 'C118') };

export default valuationDrill({
  id: 'ch6-lenders-return',
  title: 'Lender’s return',
  task: 'The senior lender’s cash flows on one row, and their IRR, which should sit near the loan’s rate.',
  module: 'lbo',
  state: { before: 'DONE' },
  plant: () => emptied(S, Object.values(PARTS).flat()),
  goals: [
    { id: 'out', text: 'LBO C117: the senior loan going out at closing, as a negative of the balance in C75.', keys: KEYS.out, check: (s, ses) => settled(ses) && ok('out')(ses) },
    { id: 'back', text: 'LBO D117:H117: interest, amortization and sweep coming back each year, plus the balance repaid in the hold’s last year.', keys: KEYS.back,
      check: (s, ses) => settled(ses) && ok('back')(ses) },
    { id: 'irr', text: 'LBO C118: IRR on C117:H117, within half a point of the senior rate in C11.', keys: KEYS.irr, check: (s, ses) => settled(ses) && ok('irr')(ses) && nearRate(ses) },
  ],
  endState: [
    { text: 'The lender’s line ties to the schedule and its IRR sits by the rate and moves with it', check: (s, ses) => Object.keys(PARTS).every(id => ok(id)(ses)) && nearRate(ses) && liveVia(ses, S, 'C118', ['C11']) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 135,
  route: 45,
});
