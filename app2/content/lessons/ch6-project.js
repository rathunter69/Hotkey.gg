// Chapter 6 · 6.5.P Project: the valuation pack, built again (clearcoat-valuation, B6P → B6PD)
// A fresh set of peers and deals on a cut-back pack: the data stands (the peers' filings, the deals,
// the term sheets, the notes and reasons), every formula on Comps, Precedents, LBO, Bids and the
// Summary is gone, and the learner decides only what a person decides: which peers and deals count,
// the leading bid and the board's lines. The route is read off the two states (lib/pack-build.js):
// every formula block one Ctrl+Enter. Each goal accepts the finished pack's formula or any formula
// landing on its figure. Fourteen goals and the closer, no teach lines: nothing here is new.
import { packBuild, part, joined } from './lib/pack-build.js';
import { sheetIn, liveVia, toScript } from './lib/bids-checks.js';

const LEARNER = new Set(['Comps!N5', 'Comps!N6', 'Comps!N7', 'Precedents!Q5', 'Precedents!Q6', 'Precedents!Q7', 'Precedents!Q8', 'Precedents!Q9', 'Summary!A2', 'Summary!C18', 'Summary!B33']);
const PACK = packBuild({ before: 'B6P', after: 'B6PD', learner: t => LEARNER.has(`${t.sheet}!${t.ref}`), leave: ['Summary!#gridlines'] });
const want = () => PACK.finished();

/** The bid that leads on expected value on the learner's Bids, as its letter. */
const leader = ses => { const b = sheetIn(ses, 'Bids'); const v = ['C', 'D', 'E'].map(c => b.value(c + 22)); return 'ABC'[v.indexOf(Math.max(...v))]; };
const pageDone = ses => { const sh = sheetIn(ses, 'Summary'); return !!sh && sh.gridlines === false && String(sh.value('C18') || '').toUpperCase() === leader(ses); };

const PARTS = [
  { id: 'comps-ltm', of: c => joined(part(c, 'Comps', 17, 25), part(c, 'Comps', 5, 7, ['J'])), text: 'Build each peer’s last twelve months on Comps, rows 17 to 25, and carry LTM EBITDA into J5:J7.',
    requires: ['sumif-sumifs', 'eomonth-edate', 'cross-sheet-ref'] },
  { id: 'comps-ev', of: c => part(c, 'Comps', 5, 7, ['E', 'H', 'K', 'L', 'M']), text: 'Build each peer’s market value, enterprise value and multiples on Comps, columns E to M.',
    requires: ['formula-basics', 'iferror-function'] },
  { id: 'comps-stats', of: c => joined(part(c, 'Comps', 5, 7, ['N', 'O', 'P', 'Q']), part(c, 'Comps', 8, 13, ['M', 'O', 'P', 'Q'])), text: 'Mark all three peers in with 1 in N5:N7, then build the included multiples and their median, mean, quartiles, min and max.',
    requires: ['if-function', 'large-small-rank', 'min-max-cap'] },
  { id: 'comps-ops', of: c => joined(part(c, 'Comps', 5, 7, ['V', 'W', 'X', 'Y', 'Z']), part(c, 'Comps', 8, 13, ['Y', 'Z']), part(c, 'Comps', 14, 14)), text: 'Build the operating metrics in V5:Z13 and Clearcoat’s own line in row 14.',
    requires: ['kpi-ratios', 'cross-sheet-ref'] },
  { id: 'comps-range', of: c => part(c, 'Comps', 35, 44), text: 'Build the comps range on Comps, rows 35 to 44: the multiples low, mid and high, enterprise value and equity value each way.',
    requires: ['enterprise-to-equity', 'cross-sheet-ref'] },
  { id: 'prec-spread', of: c => part(c, 'Precedents', 5, 15), text: 'Read each deal’s reason in column R, type 1 or 0 in Q5:Q9, then build the multiples, the premiums and the included statistics.',
    requires: ['if-function', 'large-small-rank', 'iferror-function'] },
  { id: 'prec-range', of: c => joined(part(c, 'Precedents', 18, 23), part(c, 'Precedents', 35, 41)), text: 'Build the control premium reading in Precedents rows 18 to 23 and the precedents range in rows 35 to 41.',
    requires: ['enterprise-to-equity', 'cross-sheet-ref'] },
  { id: 'sources-uses', of: c => joined(part(c, 'LBO', 31, 48), part(c, 'Checks', 14, 14)), text: 'Build the sale and leaseback, sources and uses in LBO rows 31 to 48, and the check that they tie on Checks C14.',
    requires: ['sum-family', 'check-cell', 'cross-sheet-ref'] },
  { id: 'tranches', of: c => part(c, 'LBO', 51, 99), text: 'Build the cash flow, the cash sweep and every tranche in LBO rows 51 to 99, interest on the average balance.',
    requires: ['corkscrew', 'cash-sweep', 'min-max-cap', 'iterative-calc'] },
  { id: 'returns', of: c => part(c, 'LBO', 102, 132), text: 'Build the exit, the IRR and MOIC each way, the split between owners and lenders, and the value bridge in LBO rows 102 to 132.',
    requires: ['irr', 'sumproduct', 'if-function'] },
  { id: 'ceiling', of: c => part(c, 'LBO', 135, 148), text: 'Build the sensitivity in LBO rows 135 to 140 and the highest price each hurdle allows in rows 145 to 148.',
    requires: ['sensitivity-grid', 'relative-absolute', 'pmt-pv-fv'] },
  { id: 'bids', of: c => joined(part(c, 'Bids', 11, 27), part(c, 'Bids', 59, 61)), text: 'Price the three bids on Bids, rows 11 to 27: cash at close, the earnout and the rollover valued, then the expected value and the ranks.',
    requires: ['bid-pricing', 'large-small-rank'] },
  { id: 'waterfall', of: c => part(c, 'Bids', 30, 43), text: 'Build each bid’s waterfall in Bids rows 30 to 39 and your own stake in rows 42 and 43.',
    requires: ['proceeds-waterfall', 'option-value'] },
  { id: 'board-page', of: c => part(c, 'Summary', 1, 40), post: 'Alt W V G', also: pageDone, text: 'Build the Summary: units in A2, the field, the leading bid’s letter in C18 and its waterfall, a line in B33, the checks, no gridlines.',
    requires: ['football-field', 'index-match', 'page-anatomy', 'gridlines'] },
];
const GOALS = PARTS.map(p => ({ ...PACK.goal({ ...p, requires: ['go-to', 'ctrl-enter-fill', ...p.requires], convention: p.convention || (['sources-uses', 'board-page'].includes(p.id) ? 'F1' : 'C3') }, want), requires: ['go-to', 'ctrl-enter-fill', ...p.requires] }));

export default {
  id: 'ch6-project',
  chapter: 'valuation',
  section: 'Project and assessment',
  module: 'ch6-project-and-assessment',
  workbook: 'clearcoat-valuation',
  kind: 'project',
  state: { before: 'B6P', after: 'B6PD' },
  get plant() { return PACK.plant(); },
  title: 'Project: the valuation pack, built again',
  difficulty: 'hard',
  tags: ['project', 'valuation', 'comps', 'LBO', 'bids'],
  access: 'paid',
  minutes: 15,
  headline: 'Ctrl+Enter',
  conventions: ['C3', 'F1'],
  uses: [...new Set(GOALS.flatMap(g => g.requires))],
  prerequisites: ['challenge-board-page'],
  brief: 'Fresh peers, fresh deals and three bids on a pack with every formula gone. Decide which peers and deals count, build the ranges, the LBO and its ceiling, price the bids and their waterfalls, then the page for the board. No clock, and nothing here is new. The key is `Ctrl+Enter`.',
  wow: 'Peers and deals in, a valuation pack out: five ranges, a sponsor’s ceiling, three bids priced and a page for the board, and that is Chapter 6.',
  goals: [...GOALS,
    { id: 'odds', closer: true, demo: { script: 'Ctrl+G "Bids!C58" Enter "90" Enter Ctrl+G "Summary!D14" Enter', cadence: 360 },
      text: 'Does it hold? Watch bid B’s earnout odds in Bids C58 go from 50% to 90%: its line on the football field moves with them.', requires: [],
      check: (s, ses) => ses.demoDone.has('odds') }],
  endState: [
    { text: 'Comps, Precedents and the LBO land on the finished pack’s figures', check: (s, ses) => GOALS.slice(0, 11).every(g => g.check(s, ses)) },
    { text: 'The bids, their waterfalls and your stake are priced', check: (s, ses) => GOALS.slice(11, 13).every(g => g.check(s, ses)) },
    { text: 'The board’s page reads live from the pack', check: (s, ses) => GOALS[13].check(s, ses) && liveVia(ses, 'Summary', 'D14', ['Bids!C58']) },
  ],
  closing: [
    'Peers and deals in, a pack out: comps and precedents spread, an LBO with its ceiling, three bids priced to the owners’ proceeds, and one page for the board.',
    'This is the pack a sell side team sends before the board meets. Now part of it again, on the clock.',
  ],
  get solution() { return toScript(GOALS.map(g => g.keys).join(' ')); },
};
