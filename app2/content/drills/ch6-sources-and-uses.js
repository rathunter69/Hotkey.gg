// Practice · Valuation — Sources and uses (screenplay 6.2; script-drills D82). The sources and uses
// block on the LBO emptied (formats stay): the uses from the term sheet, the senior loan and the
// mezzanine on EBITDA, the owners' rollover, the sponsor's equity as the plug, the totals and a check
// that reads 0, then the shares the deal is built on. Each line is graded on the figure the pack's
// own formula gives on the learner's cells; the check must stay at 0 when the price moves.
import { valuationDrill, emptied, refsOf, downFrom } from './valuation-drills.js';
import { settled, built, sheetIn, liveVia, toScript } from '../lessons/lib/bids-checks.js';

const S = 'LBO';
const PARTS = { uses: refsOf('C35:C39'), sources: refsOf('C40:C43'), check: refsOf('C44:C45'), shares: refsOf('C46:C48') };
const ok = id => ses => built(ses, S, PARTS[id]);
const ties = ses => { const sh = sheetIn(ses, S); return sh.value('C45') === 0 && liveVia(ses, S, 'C43', ['C7']); };
const KEYS = Object.fromEntries(Object.entries(PARTS).map(([id, refs]) => [id, downFrom(S, refs)]));

export default valuationDrill({
  id: 'ch6-sources-and-uses',
  title: 'Sources and uses',
  task: 'Build the sources and uses on the LBO so the sponsor’s equity is the plug and the two sides tie.',
  state: { before: 'DONE' },
  plant: () => emptied(S, Object.values(PARTS).flat()),
  goals: [
    { id: 'uses', text: 'LBO C35:C39: net debt repaid, the equity purchased, enterprise value, the fees on it and total uses.', keys: KEYS.uses, check: (s, ses) => settled(ses) && ok('uses')(ses) },
    { id: 'sources', text: 'LBO C40:C43: the senior loan and the mezzanine on EBITDA, the owners’ rollover, and the sponsor’s equity as the plug.', keys: KEYS.sources, check: (s, ses) => settled(ses) && ok('sources')(ses) },
    { id: 'check', text: 'LBO C44:C45: total sources, and sources less uses rounded to read 0.', keys: KEYS.check, check: (s, ses) => settled(ses) && ok('check')(ses) && ties(ses) },
    { id: 'shares', text: 'LBO C46:C48: equity as a share of the price, debt over EBITDA, and the rolled stake’s share of the new equity.', keys: KEYS.shares, check: (s, ses) => settled(ses) && ok('shares')(ses) },
  ],
  endState: [
    { text: 'Sources equal uses as a live check, the sponsor’s equity the plug', check: (s, ses) => Object.keys(PARTS).every(id => ok(id)(ses)) && ties(ses) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 260,
  route: 70,
});
