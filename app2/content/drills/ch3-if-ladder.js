// Practice · Formulas — IF ladder (screenplay 6.2). The databook's Summary (state S6d) with its flags
// emptied: the On target or Below flag, the 1/0 column and its count, the AND test and the Concern
// flag. Flag every site with IF, count the sites on target, then two conditions at once with AND.
// Graded on the figure the databook's formula gives on the learner's cells, IF and AND called where
// the goal names them, the Concern flag one IF around one AND (no nested tower), and liveness.
import { databookDrill, emptied, refsOf, built, callsAll, liveVia, fnCount, sheetIn, settled, fillFrom, toScript } from './databook-drills.js';

const S = 'Summary';
const PARTS = { flag: refsOf('E5:E10'), onTarget: refsOf('F5:F10'), count: ['F12'], and: refsOf('M5:M10'), concern: refsOf('N5:N10') };
const FNS = { flag: ['IF'], onTarget: ['IF'], count: ['SUM'], and: ['AND'], concern: ['IF', 'AND'] };
const ok = id => ses => built(ses, S, PARTS[id]) && callsAll(ses, S, PARTS[id], FNS[id]);
const flat = ses => { const sh = sheetIn(ses, S); return PARTS.concern.every(ref => fnCount(sh, ref, 'IF') === 1); };
const KEYS = {
  flag: fillFrom(S, 'E5:E10'), onTarget: fillFrom(S, 'F5:F10'), count: fillFrom(S, 'F12'), and: fillFrom(S, 'M5:M10'), concern: fillFrom(S, 'N5:N10'),
};

export default databookDrill({
  id: 'ch3-if-ladder',
  title: 'IF ladder',
  task: 'Flag every site below target with IF, count the sites on target, then test two conditions at once with AND.',
  module: 'logic',
  state: { before: 'S6d' },
  plant: () => emptied(S, Object.values(PARTS).flat()),
  goals: [
    { id: 'flag', text: 'Summary E5:E10: On target when washes used in S reach the target in D, Below when they don’t.', keys: KEYS.flag,
      check: (s, ses) => settled(ses) && ok('flag')(ses) && liveVia(ses, S, 'E5', ['R5']) },
    { id: 'onTarget', text: 'Summary F5:F10: 1 when the Sep 15 washes in C reach the target in D, 0 when they don’t.', keys: KEYS.onTarget,
      check: (s, ses) => settled(ses) && ok('onTarget')(ses) },
    { id: 'count', text: 'Count the sites on target in F12 with a SUM of F5:F10.', keys: KEYS.count,
      check: (s, ses) => settled(ses) && ok('count')(ses) },
    { id: 'and', text: 'Summary M5:M10: TRUE with AND when a site is below target and more than two years old in L.', keys: KEYS.and,
      check: (s, ses) => settled(ses) && ok('and')(ses) },
    { id: 'concern', text: 'Summary N5:N10: Concern when both hold, a dash when not, with one IF around one AND.', keys: KEYS.concern,
      check: (s, ses) => settled(ses) && ok('concern')(ses) && flat(ses) },
  ],
  endState: [
    { text: 'The flags, the count and the AND tests tie to the databook, each one IF deep, and move with their inputs', check: (s, ses) => Object.keys(PARTS).every(id => ok(id)(ses)) && flat(ses) && liveVia(ses, S, 'F12') },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 240,
  route: 75,
});
