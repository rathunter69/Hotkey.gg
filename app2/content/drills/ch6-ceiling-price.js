// Practice · Valuation — Ceiling price (script-drills D92, Wave 1). The finished LBO with the block
// "What the sponsor can pay" emptied under its three typed hurdles (formats stay): the most equity
// that still earns each hurdle by PV, the top enterprise value (that equity plus the debt, over one
// plus the fees), its multiple of FY26E EBITDA, and the room against the bid. One formula a row,
// filled across; each cell is graded on the figure the pack's own formula gives on the learner's
// cells, and the ceiling moves when a hurdle does.
import { valuationDrill, emptied, refsOf, fillFrom } from './valuation-drills.js';
import { settled, built, liveVia, toScript } from '../lessons/lib/bids-checks.js';

const S = 'LBO';
const ROWS = { equity: 145, price: 146, multiple: 147, room: 148 };
const refs = id => refsOf(`C${ROWS[id]}:E${ROWS[id]}`);
const ok = id => ses => built(ses, S, refs(id));
const KEYS = Object.fromEntries(Object.entries(ROWS).map(([id, r]) => [id, fillFrom(S, `C${r}:E${r}`)]));

export default valuationDrill({
  id: 'ch6-ceiling-price',
  title: 'Ceiling price',
  task: 'The most a sponsor can pay at three hurdles, by formula.',
  module: 'lbo',
  state: { before: 'DONE' },
  plant: () => emptied(S, Object.keys(ROWS).flatMap(refs)),
  goals: [
    { id: 'equity', text: 'LBO C145:E145: the most equity that still earns each hurdle in row 144, the PV of the exit equity over the hold.', keys: KEYS.equity,
      check: (s, ses) => settled(ses) && ok('equity')(ses) },
    { id: 'price', text: 'C146:E146: the top enterprise value, that equity plus both tranches of debt, over one plus the fees.', keys: KEYS.price,
      check: (s, ses) => settled(ses) && ok('price')(ses) },
    { id: 'multiple', text: 'C147:E147: each top price as a multiple of FY26E EBITDA in C6.', keys: KEYS.multiple,
      check: (s, ses) => settled(ses) && ok('multiple')(ses) },
    { id: 'room', text: 'C148:E148: each top price less the bid in C7, the room above it.', keys: KEYS.room,
      check: (s, ses) => settled(ses) && ok('room')(ses) },
  ],
  endState: [
    { text: 'Every line ties to the LBO, and the ceiling moves when a hurdle does', check: (s, ses) => Object.keys(ROWS).every(id => ok(id)(ses)) && liveVia(ses, S, 'D146', ['D144']) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 150,
  route: 45,
});
