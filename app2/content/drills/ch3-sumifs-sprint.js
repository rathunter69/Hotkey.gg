// Practice · Formulas — SUMIFS sprint (screenplay 6.2). The databook's site by package block on Summary
// (state S6d) emptied: revenue by site and package, the washes beside it, and the totals under both.
// One SUMIFS anchored so it fills both ways, one COUNTIFS the same way, a SUM under each column.
// Graded on the databook's figure in every cell on the learner's own export (a mis-anchored fill reads
// the wrong row or column and fails), the function each block names, and a what-if on the export.
import { databookDrill, emptied, refsOf, built, callsAll, liveVia, settled, fillFrom, toScript } from './databook-drills.js';

const S = 'Summary';
const PARTS = { revenue: refsOf('F41:H46'), washes: refsOf('C41:E46'), totals: refsOf('C47:H47') };
const FNS = { revenue: ['SUMIFS'], washes: ['COUNTIFS'], totals: ['SUM'] };
const ok = id => ses => built(ses, S, PARTS[id]) && callsAll(ses, S, PARTS[id], FNS[id]);
const KEYS = { revenue: fillFrom(S, 'F41:H46'), washes: fillFrom(S, 'C41:E46'), totals: fillFrom(S, 'C47:H47') };

export default databookDrill({
  id: 'ch3-sumifs-sprint',
  title: 'SUMIFS sprint',
  task: 'Revenue by site and package from the export with one SUMIFS, anchored, filled both ways.',
  module: 'math-and-aggregation',
  state: { before: 'S6d' },
  plant: () => emptied(S, Object.values(PARTS).flat()),
  goals: [
    { id: 'revenue', text: 'Summary F41:H46: retail revenue for the site in B and the package in row 40, one SUMIFS over the export.', keys: KEYS.revenue,
      check: (s, ses) => settled(ses) && ok('revenue')(ses) && liveVia(ses, S, 'H46') },
    { id: 'washes', text: 'Summary C41:E46: the washes for the same pairs, one COUNTIFS filled the same way.', keys: KEYS.washes,
      check: (s, ses) => settled(ses) && ok('washes')(ses) },
    { id: 'totals', text: 'Summary C47:H47: a SUM under each column of the block.', keys: KEYS.totals,
      check: (s, ses) => settled(ses) && ok('totals')(ses) },
  ],
  endState: [
    { text: 'Every cell of the block ties to the export, one formula pattern each side, and the totals add the columns', check: (s, ses) => Object.keys(PARTS).every(id => ok(id)(ses)) && liveVia(ses, S, 'C41') },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 240,
  route: 60,
});
