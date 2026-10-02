// Practice · Valuation — Which bid is really higher? (screenplay 6.2, the chapter's puzzle). The
// finished pack with one more line under the ranks on Bids: row 28, "On the owners’ proceeds", empty.
// Bid B has the highest headline; the owners take the most home under bid C, once the earnout, the
// rollover, the fees and the option pool are counted. The task line is all the learner gets; graded
// on a rank in each cell that reads the waterfall's proceeds line and matches it.
import { valuationDrill } from './valuation-drills.js';
import { settled, sheetIn, reads, toScript } from '../lessons/lib/bids-checks.js';

const S = 'Bids', ROW = 28, FROM = 35, C = ['C', 'D', 'E'];
const RANK = `=RANK(C${FROM},$C$${FROM}:$E$${FROM})`;
const LABEL = { value: 'On the owners’ proceeds' };
const ranked = ses => {
  const sh = sheetIn(ses, S); if (!sh) return false;
  const v = C.map(c => sh.value(c + FROM));
  return C.every((c, i) => { const ref = c + ROW; return !!sh.formula(ref) && reads(sh, ref, [c + FROM]) && sh.value(ref) === 1 + v.filter(x => x > v[i]).length; });
};
const KEYS = `Ctrl+G "${S}!C${ROW}:E${ROW}" ↵ "${RANK}" Ctrl+↵`;

export default valuationDrill({
  id: 'puzzle-ch6',
  title: 'Which bid is really higher?',
  task: 'Rank the three bids by what the owners take home, not by the headline.',
  state: { before: 'DONE' },
  plant: () => ({ [`${S}!B${ROW}`]: LABEL, ...Object.fromEntries(C.map(c => [`${S}!${c}${ROW}`, { align: 'r' }])) }),
  goals: [
    { id: 'rank', text: 'Rank the bids in Bids C28:E28 on the owners’ proceeds in row 35, 1 for the highest.', keys: KEYS,
      check: (s, ses) => settled(ses) && ranked(ses) },
  ],
  endState: [
    { text: 'Each rank reads the waterfall’s proceeds line and ranks the bids on it', check: (s, ses) => ranked(ses) },
  ],
  solution: toScript(KEYS),
  optimalKeys: 50,
  route: 30,
});
