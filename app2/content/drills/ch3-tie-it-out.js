// Practice · Formulas — Tie it out (screenplay 6.2, benchmark). The databook (state S6d) with the
// reconciliation's formulas emptied and the checks block under it bare: the managers' tallies, the
// explanations and the adjustments stay typed. Link the POS washes, take the difference, adjust the
// tallies, check each site, total the block, then rebuild the checks so the databook reads OK. Graded
// on the databook's figure in every cell on the learner's own cells, every check a live difference
// reading 0, and the verdict.
import { databookDrill, emptied, refsOf, built, reads, sheetIn, settled, fillFrom, toScript } from './databook-drills.js';

const S = 'Summary';
const CHECKS = ['C80', 'C81', 'C82', 'C83', 'C86', 'C87'];
const PARTS = {
  pos: refsOf('C51:C56'), diff: refsOf('E51:E56'), adjusted: refsOf('H51:H56'), check: refsOf('I51:I56'),
  totals: [...refsOf('C57:E57'), ...refsOf('G57:I57')], checks: CHECKS,
};
const ok = id => ses => built(ses, S, PARTS[id]);
const tied = ses => { const sh = sheetIn(ses, S); return !!sh && ['I57', 'C80', 'C81', 'C82', 'C83'].every(ref => sh.value(ref) === 0) && reads(sh, 'C83', ['I57']) && sh.value('C87') === 'OK'; };
const KEYS = {
  pos: fillFrom(S, 'C51:C56'), diff: fillFrom(S, 'E51:E56'), adjusted: fillFrom(S, 'H51:H56'), check: fillFrom(S, 'I51:I56'),
  totals: `${fillFrom(S, 'C57:E57')} ${fillFrom(S, 'G57:I57')}`, checks: CHECKS.map(ref => fillFrom(S, ref)).join(' '),
};

export default databookDrill({
  id: 'ch3-tie-it-out',
  title: 'Tie it out',
  task: 'Reconcile the POS export to the managers’ tallies and get every check to zero.',
  module: 'auditing',
  benchmark: true,
  state: { before: 'S6d' },
  plant: () => emptied(S, Object.values(PARTS).flat()),
  goals: [
    { id: 'pos', text: 'Summary C51:C56: link each site’s POS washes from the site counts in C15:C20.', keys: KEYS.pos,
      check: (s, ses) => settled(ses) && ok('pos')(ses) },
    { id: 'diff', text: 'E51:E56: the managers’ tally in D less the POS washes in C.', keys: KEYS.diff,
      check: (s, ses) => settled(ses) && ok('diff')(ses) },
    { id: 'adjusted', text: 'H51:H56: the tally plus the adjustment in G.', keys: KEYS.adjusted,
      check: (s, ses) => settled(ses) && ok('adjusted')(ses) },
    { id: 'check', text: 'I51:I56: the adjusted tally less the POS washes, reading 0 for every site.', keys: KEYS.check,
      check: (s, ses) => settled(ses) && ok('check')(ses) },
    { id: 'totals', text: 'Total the block in row 57: C57:E57 and G57:I57, each a SUM of the six sites.', keys: KEYS.totals,
      check: (s, ses) => settled(ses) && ok('totals')(ses) },
    { id: 'checks', text: 'Rebuild the checks C80:C83, the count not at zero in C86 and the verdict in C87, so the databook reads OK.', keys: KEYS.checks,
      check: (s, ses) => settled(ses) && ok('checks')(ses) && tied(ses) },
  ],
  endState: [
    { text: 'The reconciliation ties to the databook site by site, every check reads 0 and the verdict reads OK', check: (s, ses) => Object.keys(PARTS).every(id => ok(id)(ses)) && tied(ses) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 380,
  route: 90,
});
