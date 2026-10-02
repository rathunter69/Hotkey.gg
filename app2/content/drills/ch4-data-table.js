// Practice · Data and Lookups — Data table (screenplay 6.2). The scenarios page after its one-way
// table (S452), the two-way block laid out with its formats and nothing in it: the corner linked to
// EBITDA, the tickets across, the member shares down, a Data Table on the live ticket G6 and the live
// share G7, and the base case in bold. Graded on the edges (typed, never linked), the table's block
// and its two input cells, and every result against EBITDA worked out from the learner's own model.
import { packDrill, packCell, solutionOf } from './pack-drills.js';
import { SCENARIOS, TICKETS, SHARES } from '../workbooks/clearcoat-pack.js';
import { scenarios, sheetIn, settled, near, tableOn, typedRow, linksTo, refsOf } from '../lessons/lib/pack-scenario-checks.js';

const C = SCENARIOS; const T = C.twoWay;
const COLS = ['D', 'E', 'F', 'G', 'H'];
const TOP = COLS.map(c => c + T.vals), SIDE = T.rows.map(r => 'C' + r);
const GRID = refsOf(`D${T.rows[0]}:H${T.rows[4]}`);
const BASE = 'F' + T.rows[2], BLOCK = `C${T.vals}:H${T.rows[4]}`;
const plant = () => {
  const p = {};
  for (const ref of ['B' + T.title, 'B' + T.vals]) p['Scenarios!' + ref] = packCell('S453', 'Scenarios', ref);
  for (const ref of ['C' + T.vals, ...TOP, ...SIDE, ...GRID]) { const { value, formula, table, bold, ...f } = packCell('S453', 'Scenarios', ref) || {}; void value; void formula; void table; void bold; p['Scenarios!' + ref] = Object.keys(f).length ? f : null; }
  return p;
};
const out = (sh, k) => sh.value('C' + C.outputs[k]);
/** EBITDA at a ticket and a share from the learner's own model: a dollar of ticket on every wash, a point of share saving the retail cost. */
const at = (ses, sh, t, s) => out(sh, 'ebitda') + out(sh, 'washesYr') * (t - sh.value('G' + C.inputs.ticket)) + out(sh, 'washesYr') * (s - sh.value('G' + C.inputs.share)) * sheetIn(ses, 'Inputs').value('C7');
const fresh = ses => { const sh = scenarios(ses); return T.rows.every((r, i) => COLS.every((c, j) => near(sh.value(c + r), at(ses, sh, TICKETS[j], SHARES[i]), 1e-3))); };
const edges = ses => { const sh = scenarios(ses); return linksTo(sh, 'C' + T.vals, 'C' + C.outputs.ebitda) && typedRow(sh, TOP, TICKETS); };
const side = ses => typedRow(scenarios(ses), SIDE, SHARES);
const table = ses => !!tableOn(scenarios(ses), { block: BLOCK, row: 'G' + C.inputs.ticket, col: 'G' + C.inputs.share });

const GOALS = [
  { id: 'top', text: 'Start the table at Scenarios C32: =C24 in the corner, then the tickets 12 to 16 across D32:H32.',
    keys: 'Ctrl+G "Scenarios!C32" ↵ "=C24" Tab "12" Tab "13" Tab "14" Tab "15" Tab "16" ↵',
    check: (s, ses) => settled(ses) && edges(ses) },
  { id: 'side', text: 'Type the member shares down C33:C37: 40, 45, 50, 55 and 60, which the format reads as percentages.',
    keys: '"40" ↵ "45" ↵ "50" ↵ "55" ↵ "60" ↵',
    check: (s, ses) => settled(ses) && side(ses) },
  { id: 'table', text: 'Select C32:H37 and press Alt, A, W, T: Row input cell G6, Column input cell G7.',
    keys: 'Ctrl+G "C32:H37" ↵ Alt A W T Alt+R "G6" Alt+C "G7" ↵',
    check: (s, ses) => settled(ses) && table(ses) && fresh(ses) },
  { id: 'base', text: 'Mark the base case, $14 and 50%, in bold in F35.',
    keys: 'Ctrl+G "F35" ↵ Ctrl+B',
    check: (s, ses) => settled(ses) && scenarios(ses).cellAt(BASE).bold === true },
];

export default packDrill({
  id: 'ch4-data-table',
  title: 'Data table',
  task: 'A two-way sensitivity on ticket and member share.',
  module: 'scenarios-and-sensitivity',
  state: { before: 'S452' },
  plant,
  goals: GOALS,
  endState: [
    { text: 'C32:H37 is a Data Table of EBITDA on G6 and G7, every value tied to the model', check: (s, ses) => edges(ses) && side(ses) && table(ses) && fresh(ses) },
  ],
  solution: solutionOf(GOALS),
  optimalKeys: 85,
  route: 30,
});
