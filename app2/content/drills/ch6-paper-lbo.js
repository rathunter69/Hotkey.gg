// Practice · Valuation — Paper LBO (screenplay 6.2, benchmark). 6.3.C's paper LBO, one sheet on a
// fresh term sheet (state B63C), with the operating lines, the cash and the three tranches standing:
// build sources and uses until they tie, the debt totals and net debt across the five years, then
// the exit, MOIC, the equity cash flows and IRR with the hand check. The route is read off the two
// states (lessons/lib/pack-build.js), every formula block one Ctrl+Enter; each checkpoint accepts
// the finished paper LBO's formula or any formula landing on its figure.
import { valuationDrill } from './valuation-drills.js';
import { packBuild, part } from '../lessons/lib/pack-build.js';
import { settled, sheetIn, liveVia, toScript } from '../lessons/lib/bids-checks.js';

const S = 'LBO';
const SPANS = { 'sources-uses': [31, 48], debt: [94, 99], exit: [102, 106], irr: [107, 110] };
const builds = b => Object.values(SPANS).some(([a, z]) => b.r1 >= a && b.r2 <= z);
const PACK = packBuild({ before: 'B63C', after: 'B63CD', learner: () => false, builds });
const want = () => PACK.finished();
const TEXT = {
  'sources-uses': 'LBO C31:C48: sources and uses, the sponsor’s equity the plug, until sources less uses in C45 reads 0.',
  debt: 'LBO rows 94 to 99: total debt and interest, cash, net debt, the paydown since closing and the sweep check.',
  exit: 'LBO C102:C106: exit enterprise value, net debt at the exit, exit equity, equity at entry and MOIC.',
  irr: 'LBO C107:H110: the equity cash flows, IRR on them, IRR by hand with RRI, and the difference at 0.',
};
const GOALS = Object.entries(SPANS).map(([id, [a, z]]) => {
  const g = PACK.goal({ id, text: TEXT[id], of: c => part(c, S, a, z) }, want);
  return { id, text: g.text, get keys() { return g.keys; }, check: g.check };
});
const ties = ses => { const sh = sheetIn(ses, S); return sh.value('C45') === 0 && sh.value('C110') === 0; };

export default valuationDrill({
  id: 'ch6-paper-lbo',
  title: 'Paper LBO',
  task: 'Take the paper LBO from sources and uses to IRR on one sheet, every block one formula.',
  benchmark: true,
  state: { before: 'B63C' },
  plant: () => PACK.plant(),
  goals: GOALS,
  endState: [
    { text: 'Sources and uses tie, the debt paydown ties, and exit equity and IRR land on the finished figures, IRR moving with the exit multiple',
      check: (s, ses) => GOALS.every(g => g.check(s, ses)) && ties(ses) && liveVia(ses, S, 'C108', ['C17']) },
  ],
  get solution() { return toScript(GOALS.map(g => g.keys).join(' ')); },
  optimalKeys: 860,
  route: 160,
});
