// Practice · Data and Lookups — Cube it (screenplay 6.2, benchmark). The KPI page as module 4.3 left
// it (S436) with both SUMIFS cubes and their two ties to the export emptied (formats stay): washes
// by site and week, retail revenue by site and week, each with its totals, then the checks. Every
// cell is graded on the figure the pack's own formula gives on the learner's cells, and the checks
// block must read zero at the end. The export carries no package column, so the cube is site by week,
// in washes and in revenue.
import { packDrill, packCell, emptiedIn, landsOn, solutionOf } from './pack-drills.js';
import { refsOf } from '../lessons/lib/pack-scenario-checks.js';
import { sheetIn, settled, reads, calls } from '../lessons/lib/databook-checks.js';
import { quoted } from '../lessons/lib/model-checks.js';

const S = 'Summary', FROM = 'S436';
const BLOCKS = { washes: 'C15:E20', washTot: ['F15:F20', 'C21:F21'], revenue: 'C25:E30', revTot: ['F25:F30', 'C31:F31'], checks: 'C72:C73' };
const refs = key => [].concat(BLOCKS[key]).flatMap(refsOf);
const ALL = Object.keys(BLOCKS).flatMap(refs);
const want = ref => packCell(FROM, S, ref).formula;
const SUMIFS = new Set(['washes', 'revenue']);
/** The block lands on the pack's figures; a cube cell calls SUMIFS, so a typed figure behind an equals sign never passes. */
const built = (ses, key) => landsOn(ses, S, refs(key), want) && (!SUMIFS.has(key) || refs(key).every(r => calls(sheetIn(ses, S), r, ['SUMIFS'])));
const fill = range => `Ctrl+G "${S}!${range}" ↵ ${quoted(want(range.split(':')[0]))} Ctrl+↵`;
const keysOf = key => [].concat(BLOCKS[key]).map(fill).join(' ');
const CHECK_KEYS = `Ctrl+G "${S}!C72" ↵ ${quoted(want('C72'))} ↵ ${quoted(want('C73'))} ↵`;
const tied = ses => { const sh = sheetIn(ses, S); return !!sh && reads(sh, 'C72', ['F21']) && reads(sh, 'C73', ['F31']) && ['C72', 'C73', 'C74', 'C75', 'C76', 'C77'].every(r => sh.value(r) === 0); };

const GOALS = [
  { id: 'washes', text: 'Fill the washes cube, Summary C15:E20, with one SUMIFS on Export by the site in column B and the week in row 14.', keys: keysOf('washes'),
    check: (s, ses) => settled(ses) && built(ses, 'washes') },
  { id: 'wash-totals', text: 'Total it: F15:F20 across each site, then C21:F21 down each week.', keys: keysOf('washTot'),
    check: (s, ses) => settled(ses) && built(ses, 'washTot') },
  { id: 'revenue', text: 'Fill the revenue cube, C25:E30, the same way on the retail revenue in Export column F.', keys: keysOf('revenue'),
    check: (s, ses) => settled(ses) && built(ses, 'revenue') },
  { id: 'rev-totals', text: 'Total it: F25:F30 across, then C31:F31 down.', keys: keysOf('revTot'),
    check: (s, ses) => settled(ses) && built(ses, 'revTot') },
  { id: 'checks', text: 'Tie each cube to the export in C72:C73: its grand total less the SUM of its Export column, reading 0.', keys: CHECK_KEYS,
    check: (s, ses) => settled(ses) && built(ses, 'checks') && tied(ses) },
];

export default packDrill({
  id: 'ch4-cube-it',
  title: 'Cube it',
  task: 'Two SUMIFS cubes, washes and revenue by site and week, that tie to the export.',
  module: 'summaries-from-raw-rows',
  benchmark: true,
  state: { before: FROM },
  plant: () => emptiedIn(FROM, S, ALL),
  goals: GOALS,
  endState: [
    { text: 'Every cell of both cubes ties to the export, and the checks in C72:C77 read zero', check: (s, ses) => Object.keys(BLOCKS).every(k => built(ses, k)) && tied(ses) },
  ],
  solution: solutionOf(GOALS),
  optimalKeys: 420,
  route: 90,
});
