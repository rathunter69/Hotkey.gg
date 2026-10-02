// Practice · Formulas — Bands (script-drills D57, Wave 1; after 3.3.2). Summary's retail tickets by band
// (state S6d) emptied: under $15, $15 to under $20, $20 and over, and the check that the bands add up
// to every amount on the export. The tickets sit exactly on both edges ($15 and $20 are list prices),
// so each edge has to be counted once. Graded on the databook's figures on the learner's cells, each
// band a COUNTIF or COUNTIFS with its comparison in quotes, and the check a live difference at 0.
import { databookDrill, emptied, built, calls, reads, sheetIn, settled, fillFrom, toScript } from './databook-drills.js';

const S = 'Summary', BANDS = ['C34', 'C35', 'C36'], CHECK = 'C37';
const counted = ses => { const sh = sheetIn(ses, S); return !!sh && BANDS.every(ref => calls(sh, ref, ['COUNTIF']) || calls(sh, ref, ['COUNTIFS'])); };
const ok = (ses, refs) => built(ses, S, refs);
const checked = ses => { const sh = sheetIn(ses, S); return ok(ses, [CHECK]) && reads(sh, CHECK, BANDS) && sh.value(CHECK) === 0; };
const KEYS = { under: fillFrom(S, 'C34'), between: fillFrom(S, 'C35'), over: fillFrom(S, 'C36'), check: fillFrom(S, CHECK) };

export default databookDrill({
  id: 'ch3-bands',
  title: 'Bands',
  task: 'Count the tickets under, between and over $15 and $20: the three bands have to add up to every ticket.',
  module: 'math-and-aggregation',
  state: { before: 'S6d' },
  plant: () => emptied(S, [...BANDS, CHECK]),
  goals: [
    { id: 'under', text: 'Summary C34: the amounts on Transactions E5:E94 under 15, the comparison typed in quotes.', keys: KEYS.under,
      check: (s, ses) => settled(ses) && ok(ses, ['C34']) },
    { id: 'between', text: 'Summary C35: the amounts from 15 up to but not including 20, two conditions on the one column.', keys: KEYS.between,
      check: (s, ses) => settled(ses) && ok(ses, ['C35']) },
    { id: 'over', text: 'Summary C36: the amounts of 20 and over.', keys: KEYS.over,
      check: (s, ses) => settled(ses) && ok(ses, ['C36']) && counted(ses) },
    { id: 'check', text: 'Summary C37: the three bands less a COUNT of the amounts, reading 0.', keys: KEYS.check,
      check: (s, ses) => settled(ses) && checked(ses) },
  ],
  endState: [
    { text: 'The bands count each edge once, add up to every amount, and the check reads 0', check: (s, ses) => ok(ses, BANDS) && counted(ses) && checked(ses) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 280,
  route: 75,
});
