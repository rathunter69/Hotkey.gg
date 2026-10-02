// Practice · Valuation — IRR sprint (screenplay 6.2). The returns block on the LBO emptied (formats
// stay): equity at the exit, equity at entry and MOIC, the equity cash flows across the hold, IRR
// by formula and by hand with RRI, and the difference that reads 0. Each line is graded on the
// figure the pack's own formula gives on the learner's cells; IRR must move with the exit multiple.
import { valuationDrill, emptied, refsOf, downFrom, fillFrom } from './valuation-drills.js';
import { settled, built, sheetIn, liveVia, toScript } from '../lessons/lib/bids-checks.js';

const S = 'LBO';
const PARTS = { exit: refsOf('C102:C104'), moic: refsOf('C105:C106'), flows: ['C107', ...refsOf('D107:H107')], irr: ['C108'], hand: refsOf('C109:C110') };
const ok = id => ses => built(ses, S, PARTS[id]);
const KEYS = {
  exit: downFrom(S, PARTS.exit),
  moic: downFrom(S, PARTS.moic),
  flows: `${fillFrom(S, 'C107')} ${fillFrom(S, 'D107:H107')}`,
  irr: fillFrom(S, 'C108'),
  hand: downFrom(S, PARTS.hand),
};

export default valuationDrill({
  id: 'ch6-irr-sprint',
  title: 'IRR sprint',
  task: 'Take the LBO from exit equity to IRR and MOIC, then check IRR by hand with RRI.',
  state: { before: 'DONE' },
  plant: () => emptied(S, Object.values(PARTS).flat()),
  goals: [
    { id: 'exit', text: 'LBO C102:C104: exit enterprise value on FY31 adjusted EBITDA, less net debt at the exit, equity at the exit.', keys: KEYS.exit, check: (s, ses) => settled(ses) && ok('exit')(ses) },
    { id: 'moic', text: 'LBO C105:C106: equity at entry, the sponsor and the rollover, and MOIC as equity out over equity in.', keys: KEYS.moic, check: (s, ses) => settled(ses) && ok('moic')(ses) },
    { id: 'flows', text: 'LBO C107:H107: the equity in at closing as a negative, and the exit equity in the year the hold ends.', keys: KEYS.flows, check: (s, ses) => settled(ses) && ok('flows')(ses) },
    { id: 'irr', text: 'LBO C108: IRR on the equity cash flows in row 107.', keys: KEYS.irr, check: (s, ses) => settled(ses) && ok('irr')(ses) },
    { id: 'hand', text: 'LBO C109:C110: IRR by hand with RRI over the hold, and the difference rounded to read 0.', keys: KEYS.hand,
      check: (s, ses) => settled(ses) && ok('hand')(ses) && sheetIn(ses, S).value('C110') === 0 },
  ],
  endState: [
    { text: 'IRR and MOIC tie to the pack, the hand check agrees, and IRR moves with the exit multiple', check: (s, ses) => Object.keys(PARTS).every(id => ok(id)(ses)) && liveVia(ses, S, 'C108', ['C17']) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 230,
  route: 60,
});
