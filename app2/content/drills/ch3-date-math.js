// Practice · Formulas — Date math (screenplay 6.2). The databook (state S6d) with the member list's
// tenure emptied (the end date, tenure in days and in months) and the export's month-end column gone.
// Tenure runs from the join date to the cancel date, or to the as-of date for a member still active;
// every POS date then takes its month end from EOMONTH. Graded on the databook's figures on the
// learner's cells, EOMONTH called down the month-end column (formulas, not typed dates), and liveness.
import { databookDrill, emptied, refsOf, built, callsAll, liveVia, settled, fillFrom, toScript } from './databook-drills.js';

const M = 'Members', T = 'Transactions';
const PARTS = { end: [M, refsOf('G5:G44')], days: [M, refsOf('H5:H44')], months: [M, refsOf('I5:I44')], monthEnd: [T, refsOf('H5:H94')] };
const ok = id => ses => built(ses, PARTS[id][0], PARTS[id][1]);
const KEYS = { end: fillFrom(M, 'G5:G44'), days: fillFrom(M, 'H5:H44'), months: fillFrom(M, 'I5:I44'), monthEnd: fillFrom(T, 'H5:H94') };

export default databookDrill({
  id: 'ch3-date-math',
  title: 'Date math',
  task: 'Member tenure from the join and cancel dates, then a month end for every POS date with EOMONTH.',
  module: 'dates',
  state: { before: 'S6d' },
  plant: () => Object.assign({}, ...Object.values(PARTS).map(([sh, refs]) => emptied(sh, refs))),
  goals: [
    { id: 'end', text: 'Members G5:G44: the cancel date in F, or the as-of date in H2 when F is empty.', keys: KEYS.end,
      check: (s, ses) => settled(ses) && ok('end')(ses) && callsAll(ses, M, PARTS.end[1], ['IF']) },
    { id: 'days', text: 'Members H5:H44: tenure in days, the end date in G less the join date in E.', keys: KEYS.days,
      check: (s, ses) => settled(ses) && ok('days')(ses) && liveVia(ses, M, 'H5', ['E5']) },
    { id: 'months', text: 'Members I5:I44: tenure in months, the days in H over 30.4.', keys: KEYS.months,
      check: (s, ses) => settled(ses) && ok('months')(ses) },
    { id: 'monthEnd', text: 'Transactions H5:H94: the month end of each date in A with EOMONTH.', keys: KEYS.monthEnd,
      check: (s, ses) => settled(ses) && ok('monthEnd')(ses) && callsAll(ses, T, PARTS.monthEnd[1], ['EOMONTH']) },
  ],
  endState: [
    { text: 'Tenure ties for every member and moves with the dates, and every month end is an EOMONTH formula', check: (s, ses) => Object.keys(PARTS).every(id => ok(id)(ses)) && liveVia(ses, M, 'I5', ['E5']) && liveVia(ses, T, 'H5', ['A5']) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 160,
  route: 45,
});
