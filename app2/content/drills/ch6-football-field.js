// Practice · Valuation — Football field (screenplay 6.2). The football field on the Summary emptied
// (formats stay): each method's low, mid and high linked from the page that built it, the DCF's
// from its value and its sensitivity grid, the three bids from Bids, and each mid read against the
// DCF's. Graded on links (a formula reading the source and showing its figure), never on typed
// figures; the bids' line must move with the earnout odds.
import { valuationDrill, emptied, refsOf, fillFrom } from './valuation-drills.js';
import { settled, built, liveVia, toScript, formulaAt, quoted } from '../lessons/lib/bids-checks.js';

const S = 'Summary';
const line = r => refsOf(`C${r}:E${r}`);
const PARTS = { methods: [...line(9), ...line(10)], dcf: line(11), lbo: line(12), bids: [...line(13), ...line(14), ...line(15)], mids: refsOf('F9:F15') };
const ok = id => ses => built(ses, S, PARTS[id]);
const across = r => `Ctrl+G "${S}!C${r}" ↵ ` + ['C', 'D', 'E'].map(c => quoted(formulaAt('DONE', S, c + r))).join(' Tab ') + ' ↵';
const KEYS = {
  methods: `${fillFrom(S, 'C9:E9')} ${fillFrom(S, 'C10:E10')}`,
  dcf: across(11),
  lbo: fillFrom(S, 'C12:E12'),
  bids: [13, 14, 15].map(across).join(' '),
  mids: fillFrom(S, 'F9:F15'),
};

export default valuationDrill({
  id: 'ch6-football-field',
  title: 'Football field',
  task: 'Link the football field on the Summary, one line per method, low, mid and high, with no typed figure.',
  state: { before: 'DONE' },
  plant: () => emptied(S, Object.values(PARTS).flat()),
  goals: [
    { id: 'methods', text: 'Summary C9:E10: the comps range from Comps row 45 and the precedents range from Precedents row 38.', keys: KEYS.methods, check: (s, ses) => settled(ses) && ok('methods')(ses) },
    { id: 'dcf', text: 'Summary C11:E11: the low and high of the DCF grid in DCF D77:H81, and the DCF’s value in C42 as the mid.', keys: KEYS.dcf, check: (s, ses) => settled(ses) && ok('dcf')(ses) },
    { id: 'lbo', text: 'Summary C12:E12: what the sponsor can pay at the three hurdles, from LBO row 146.', keys: KEYS.lbo, check: (s, ses) => settled(ses) && ok('lbo')(ses) },
    { id: 'bids', text: 'Summary C13:E15: each bid’s expected, priced and headline value, from Bids rows 22, 18 and 6.', keys: KEYS.bids, check: (s, ses) => settled(ses) && ok('bids')(ses) },
    { id: 'mids', text: 'Summary F9:F15: each line’s mid over the DCF’s mid in D11, anchored.', keys: KEYS.mids, check: (s, ses) => settled(ses) && ok('mids')(ses) },
  ],
  endState: [
    { text: 'Every low, mid and high links to its method’s page, and the bids move with the earnout odds', check: (s, ses) => Object.keys(PARTS).every(id => ok(id)(ses)) && liveVia(ses, S, 'D14', ['Bids!C58']) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 330,
  route: 80,
});
