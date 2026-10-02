// Practice · Data and Lookups — Pivot in 90 (screenplay 6.2). The pack as module 4.3 left it (S436),
// with no pivot yet: insert a PivotTable from the export on a sheet of its own, sites down, weeks
// across and total washes summed, close the field list, and name the sheet Cuts. Graded on the
// pivot's layout and on its figures against the export as it stands (lessons/lib/pack-scenario-checks).
// The export covers one fortnight, so the columns are its weeks rather than months.
import { packDrill, solutionOf } from './pack-drills.js';
import { pivots, pivotLike, current, settled, sheetIn } from '../lessons/lib/pack-scenario-checks.js';
import { CUTS } from '../workbooks/clearcoat-pack.js';

const CUBE = { row: 'Site', col: 'Week', value: 'Total washes' };
const cube = ses => { const x = pivotLike(ses, CUBE); return !!x && current(ses, x); };
const named = ses => { const sh = sheetIn(ses, CUTS); return !!sh && (sh.pivots || []).some(p => p.spec.row === CUBE.row && p.spec.col === CUBE.col && p.spec.value === CUBE.value); };

const GOALS = [
  { id: 'insert', text: 'From Export!A4, insert a PivotTable on a new sheet with Alt, N, V, T and Enter.',
    keys: 'Ctrl+G "Export!A4" ↵ Alt N V T ↵',
    check: (s, ses) => pivots(ses).length > 0 },
  { id: 'rows', text: 'In the field list, put Site in Rows and Total washes in Values.',
    keys: '↓ R ↓ ×3 V',
    check: (s, ses) => !!pivotLike(ses, { row: CUBE.row, col: null, value: CUBE.value }) },
  { id: 'columns', text: 'Put Week in Columns and press Enter: sites down, weeks across, washes summed.',
    keys: '↓ ×3 C ↵',
    check: (s, ses) => settled(ses) && cube(ses) },
  { id: 'name', text: 'Name the pivot’s sheet Cuts with Alt, H, O, R.',
    keys: 'Alt H O R "Cuts" ↵',
    check: (s, ses) => settled(ses) && named(ses) },
];

export default packDrill({
  id: 'ch4-pivot-in-90',
  title: 'Pivot in 90',
  task: 'A PivotTable from the export: sites down, weeks across, washes summed.',
  module: 'pivot-tables',
  state: { before: 'S436' },
  goals: GOALS,
  endState: [
    { text: 'The pivot on Cuts shows washes by site and week, and its figures tie to the export', check: (s, ses) => named(ses) && cube(ses) },
  ],
  solution: solutionOf(GOALS),
  optimalKeys: 40,
  route: 45,
});
