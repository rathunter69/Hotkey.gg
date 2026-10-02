// Practice · Valuation — Waterfall (screenplay 6.2; script-drills D83). The waterfall on Bids emptied
// (formats stay): from each bid's priced value, net debt, the fees and the option pool come off,
// each no more than what is left, and the owners' proceeds split three ways with a check. Each line
// is graded on the figure the pack's own formula gives on the learner's cells; the owners' line must
// move with the fee.
import { valuationDrill, emptied, refsOf, fillFrom } from './valuation-drills.js';
import { settled, built, liveVia, toScript } from '../lessons/lib/bids-checks.js';

const S = 'Bids';
const rows = (a, b) => { const out = []; for (let r = a; r <= b; r++) out.push(...refsOf(`C${r}:E${r}`)); return out; };
const PARTS = { equity: [30, 32], fees: [33, 34], proceeds: [35, 35], owners: [36, 38], check: [39, 39] };
const ok = id => ses => built(ses, S, rows(...PARTS[id]));
const KEYS = Object.fromEntries(Object.entries(PARTS).map(([id, [a, b]]) => {
  const k = []; for (let r = a; r <= b; r++) k.push(fillFrom(S, `C${r}:E${r}`)); return [id, k.join(' ')];
}));

export default valuationDrill({
  id: 'ch6-waterfall',
  title: 'Waterfall',
  task: 'Run each bid on Bids down its waterfall, from enterprise value to every owner’s proceeds.',
  state: { before: 'DONE' },
  plant: () => emptied(S, rows(30, 39)),
  goals: [
    { id: 'equity', text: 'Bids C30:E32: each bid’s priced value from row 18, less net debt at closing up to that value, and the equity left.', keys: KEYS.equity, check: (s, ses) => settled(ses) && ok('equity')(ses) },
    { id: 'fees', text: 'Bids C33:E34: the fees on enterprise value, then the option pool above the strike, each no more than what is left.', keys: KEYS.fees, check: (s, ses) => settled(ses) && ok('fees')(ses) },
    { id: 'proceeds', text: 'Bids C35:E35: the owners’ net proceeds, equity less the fees and the pool.', keys: KEYS.proceeds, check: (s, ses) => settled(ses) && ok('proceeds')(ses) },
    { id: 'owners', text: 'Bids C36:E38: each owner’s share of the proceeds, from the stakes in C54:C56.', keys: KEYS.owners, check: (s, ses) => settled(ses) && ok('owners')(ses) },
    { id: 'check', text: 'Bids C39:E39: the owners’ lines less the proceeds, rounded to read 0.', keys: KEYS.check, check: (s, ses) => settled(ses) && ok('check')(ses) },
  ],
  endState: [
    { text: 'Every line links to the one above and the owners’ line ties, moving with the fee', check: (s, ses) => Object.keys(PARTS).every(id => ok(id)(ses)) && liveVia(ses, S, 'D35', ['C49']) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 330,
  route: 80,
});
