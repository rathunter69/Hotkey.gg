// Practice · Valuation — Spread a comp (screenplay 6.2; script-drills D26). One peer's line on Comps
// emptied (formats stay): Summit Express Wash, the operator holding more cash than debt. Build its
// market value from price and shares, enterprise value from debt and cash, the two multiples, the
// margin and the leverage, which reads below zero for a net cash operator. Each cell is graded on
// the figure the pack's own formula gives on the learner's cells, and the multiple must move when
// the share price does.
import { valuationDrill, emptied, fillFrom } from './valuation-drills.js';
import { settled, built, liveVia, toScript } from '../lessons/lib/bids-checks.js';

const S = 'Comps';
const CELLS = { cap: ['E7'], ev: ['H7'], multiples: ['K7', 'L7'], leverage: ['M7', 'Q7'] };
const ok = id => ses => built(ses, S, CELLS[id]);
const KEYS = {
  cap: fillFrom(S, 'E7'),
  ev: fillFrom(S, 'H7'),
  multiples: `${fillFrom(S, 'K7')} ${fillFrom(S, 'L7')}`,
  leverage: `${fillFrom(S, 'M7')} ${fillFrom(S, 'Q7')}`,
};

export default valuationDrill({
  id: 'ch6-spread-a-comp',
  title: 'Spread a comp',
  task: 'Spread Summit Express Wash on Comps row 7, from its share price to its multiples and its leverage.',
  state: { before: 'DONE' },
  plant: () => emptied(S, Object.values(CELLS).flat()),
  goals: [
    { id: 'cap', text: 'Comps E7: the market cap, the share price in C7 times the shares in D7.', keys: KEYS.cap, check: (s, ses) => settled(ses) && ok('cap')(ses) },
    { id: 'ev', text: 'Comps H7: enterprise value, the market cap plus debt in F7 less cash in G7.', keys: KEYS.ev, check: (s, ses) => settled(ses) && ok('ev')(ses) },
    { id: 'multiples', text: 'Comps K7 and L7: enterprise value over LTM revenue in I7 and over LTM EBITDA in J7.', keys: KEYS.multiples, check: (s, ses) => settled(ses) && ok('multiples')(ses) },
    { id: 'leverage', text: 'Comps M7 and Q7: the EBITDA margin, and net debt over EBITDA, below zero for a net cash operator.', keys: KEYS.leverage, check: (s, ses) => settled(ses) && ok('leverage')(ses) },
  ],
  endState: [
    { text: 'Summit’s line ties to the pack and its multiple moves with the share price', check: (s, ses) => Object.keys(CELLS).every(id => ok(id)(ses)) && liveVia(ses, S, 'L7', ['C7']) && liveVia(ses, S, 'Q7', ['G7']) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 130,
  route: 40,
});
