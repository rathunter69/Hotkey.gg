// Practice · Valuation — Median and range (screenplay 6.2; script-drills D21, D27, D28). The comps set
// on Comps with its include flags, the helper column, the statistics and the EBITDA range emptied
// (formats stay). Flag the six operators, dropping the one the note in AB9 calls a struggling
// operator; take the multiples of the included set through the helper column; take the statistics;
// apply the low, median and high to Clearcoat's LTM EBITDA. Each line is graded on the figure the
// pack's own formula gives on the learner's cells; the range must move when a flag does.
import { valuationDrill, emptied, refsOf, fillFrom, downFrom } from './valuation-drills.js';
import { settled, built, typedAt, liveVia, toScript } from '../lessons/lib/bids-checks.js';

const S = 'Comps';
const FLAGS = refsOf('N5:N10'), OUT = 'N9';
const HELPER = refsOf('O5:O10'), STATS = refsOf('O11:O16'), RANGE = [...refsOf('C44:E44'), ...refsOf('C45:E45')];
const flagged = ses => FLAGS.every(r => typedAt(ses, S, r, r === OUT ? 0 : 1));
const KEYS = {
  flags: `Ctrl+G "${S}!N5:N10" ↵ "1" Ctrl+↵ Ctrl+G "${S}!${OUT}" ↵ "0" ↵`,
  helper: fillFrom(S, 'O5:O10'),
  stats: downFrom(S, STATS),
  range: `Ctrl+G "${S}!C44" ↵ "=O13" Tab "=O11" Tab "=O14" ↵ ${fillFrom(S, 'C45:E45')}`,
};

export default valuationDrill({
  id: 'ch6-median-and-range',
  title: 'Median and range',
  task: 'Flag the comps set, drop the struggling operator, and apply the median multiple to Clearcoat’s EBITDA.',
  state: { before: 'DONE' },
  plant: () => emptied(S, [...FLAGS, ...HELPER, ...STATS, ...RANGE]),
  goals: [
    { id: 'flags', text: 'Type 1 in Comps N5:N10 for each peer, and 0 in N9 for Harbor Clean Group, whose note in AB9 says why.', keys: KEYS.flags,
      check: (s, ses) => settled(ses) && flagged(ses) },
    { id: 'helper', text: 'Fill Comps O5:O10 with each EV / EBITDA in column L where the flag is 1, and blank text where it is 0.', keys: KEYS.helper,
      check: (s, ses) => settled(ses) && built(ses, S, HELPER) },
    { id: 'stats', text: 'Take the median, mean, 25th and 75th percentiles, minimum and maximum of O5:O10 in Comps O11:O16.', keys: KEYS.stats,
      check: (s, ses) => settled(ses) && built(ses, S, STATS) },
    { id: 'range', text: 'Link the low, median and high into Comps C44:E44 and apply each to Clearcoat’s LTM EBITDA in J17, in row 45.', keys: KEYS.range,
      check: (s, ses) => settled(ses) && built(ses, S, RANGE) },
  ],
  endState: [
    { text: 'The range reads only the included peers and moves when a flag does', check: (s, ses) => flagged(ses) && built(ses, S, [...HELPER, ...STATS, ...RANGE]) && liveVia(ses, S, 'D45', ['N5']) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 240,
  route: 60,
});
