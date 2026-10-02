// Chapter 6 · 6.2.3 Applying the precedents range (clearcoat-valuation, B623 → B631)
// The precedents row of the football field: the included deals' low, median and high multiples
// times Clearcoat's FY26 EBITDA, the same on EV per site times its sites, net debt off, and equity
// value on each, in the same block shape as the comps range so the Summary reads both. Each line is
// graded on the reference formula evaluated in the learner's sheet; the median EV on the liveness
// rule through a deal's flag.
import { settled, built, liveVia, plant, refsOf, fill, typeAcross, cellsAt, R, solutionOf } from './lib/deal-checks.js';

const AFTER = 'B631';
const P = 'Precedents';
const LMH = ['C', 'D', 'E'];
const row = k => refsOf(P, [k], LMH);
const rng = k => `C${R(P, k)}:E${R(P, k)}`;
const ALL = ['rgMult', 'rgEV', 'rgSiteMult', 'rgSiteEV', 'rgNetDebt', 'rgEq', 'rgEqSite'];
const lines = (ses, keys) => built(ses, P, refsOf(P, keys, LMH), AFTER);
const F = (k, c = 'C') => cellsAt(AFTER, P)[c + R(P, k)].formula;
const CRESTLINE = R(P, 'd2');
const MED_EV = 'D' + R(P, 'rgEV');

const goals = [
  { id: 'multiples', text: `The multiples in ${rng('rgMult')}: the low quartile, the median and the high quartile of the included deals, from S${R(P, 'stLow')}, S${R(P, 'stMed')} and S${R(P, 'stHigh')}.`,
    teach: 'The range is the middle half of the set, from the low quartile to the high, with the median between: the extremes are where the outliers live, so a range quoted on them says more about one deal than about the market.',
    keys: typeAcross(AFTER, P, row('rgMult')), requires: ['precedents-range', 'tab-commits', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${rng('rgMult')} · Low, median, high: rows ${R(P, 'stLow')}, ${R(P, 'stMed')} and ${R(P, 'stHigh')} of the helper column S.`,
    check: (s, ses) => settled(ses) && lines(ses, ['rgMult']) },
  { id: 'ev', text: `Enterprise value in ${rng('rgEV')}: each multiple times Clearcoat’s FY26E EBITDA on Comps, ${F('rgEV')}.`,
    keys: fill(AFTER, P, rng('rgEV')), requires: ['cross-sheet-ref', 'f4-anchor', 'ctrl-enter-fill', 'go-to'], convention: 'B4',
    hintStuck: `pulse range ${rng('rgEV')} · The EBITDA sits on Comps row ${R('Comps', 'cc')}, anchored so the fill keeps it.`,
    check: (s, ses) => settled(ses) && lines(ses, ['rgEV']) && liveVia(ses, P, MED_EV, [`${P}!Q${CRESTLINE}`]) },
  { id: 'sites', text: `The same on sites: EV per site in ${rng('rgSiteMult')} from column T, and enterprise value on Clearcoat’s sites in ${rng('rgSiteEV')}.`,
    teach: 'A buyer of car washes checks the EBITDA answer against one any operator can count: what deals paid per site, times the sites Clearcoat runs. Two methods that land close together are a range the board can trust.',
    keys: `${typeAcross(AFTER, P, row('rgSiteMult'))} ${fill(AFTER, P, rng('rgSiteEV'))}`, requires: ['precedents-range', 'cross-sheet-ref', 'f4-anchor', 'ctrl-enter-fill', 'tab-commits', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${rng('rgSiteMult')} · The per-site statistics are in column T; the sites are on Comps, times 1,000 to bring $m back to thousands.`,
    check: (s, ses) => settled(ses) && lines(ses, ['rgSiteMult', 'rgSiteEV']) },
  { id: 'net-debt', text: `Net debt at the valuation date in ${rng('rgNetDebt')}, as a negative from the DCF: ${F('rgNetDebt')}.`,
    keys: fill(AFTER, P, rng('rgNetDebt')), requires: ['cross-sheet-ref', 'ctrl-enter-fill', 'go-to'], convention: 'B4',
    hintStuck: `pulse range ${rng('rgNetDebt')} · The DCF page holds net debt once; every range reads it there.`,
    check: (s, ses) => settled(ses) && lines(ses, ['rgNetDebt']) },
  { id: 'equity', text: `Equity value in ${rng('rgEq')} on EBITDA and in ${rng('rgEqSite')} on sites: enterprise value plus the net debt line.`,
    keys: `${fill(AFTER, P, rng('rgEq'))} ${fill(AFTER, P, rng('rgEqSite'))}`, requires: ['sum-family', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range C${R(P, 'rgEq')}:E${R(P, 'rgEqSite')} · Net debt is already negative, so equity is a plus.`,
    check: (s, ses) => settled(ses) && lines(ses, ['rgEq', 'rgEqSite']) },
  { id: 'tie', closer: true, demo: { script: `Ctrl+G "${P}!Q${CRESTLINE}" Enter "0" Enter Ctrl+G "${P}!${MED_EV}" Enter`, cadence: 320 },
    text: 'Does it tie? Watch Crestline’s flag go to 0: the strategic deal drops out and the whole range moves.', requires: [],
    hintStuck: `pulse range ${P}!${rng('rgEV')} · The range reads the statistics, which read the flags.`,
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'applying-precedents',
  chapter: 'valuation',
  section: 'Precedent transactions',
  module: 'precedent-transactions',
  workbook: 'clearcoat-valuation',
  state: { before: 'B623', after: AFTER },
  plant: plant(AFTER, P, refsOf(P, ALL, LMH)),
  title: 'Applying the precedents range',
  difficulty: 'medium',
  tags: ['valuation', 'precedents', 'range'],
  access: 'paid',
  minutes: 5,
  headline: '*',
  conventions: ['B4', 'C3'],
  teaches: ['precedents-range'],
  uses: ['comparable-screen', 'cross-sheet-ref', 'f4-anchor', 'ctrl-enter-fill', 'tab-commits', 'sum-family', 'go-to'],
  prerequisites: ['sort-and-decide'],
  brief: 'The precedents row of the football field: the included deals’ low, median and high multiples times Clearcoat’s EBITDA, and the same on EV per site. It sits above the comps row, because control costs more, and the gap between the two is the first thing the board will ask about. Build it in the same block shape as the comps range, so the Summary can read both. The key is `*`.',
  goals,
  endState: [
    { text: 'The precedents range runs from the multiples to equity value on EBITDA and on sites', check: (s, ses) => lines(ses, ALL) },
  ],
  closing: [
    'The second range sits above the first, and the gap between them is the control premium.',
    'Best practice: both ranges share one block shape, rows and columns, so the Summary reads them with the same formula and a reader compares them at a glance.',
  ],
  solution: solutionOf(goals),
};
