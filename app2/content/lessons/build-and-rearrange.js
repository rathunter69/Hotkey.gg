// Chapter 4 · 4.4.1 Build and rearrange (clearcoat-pack, S44 → S441)
// A PivotTable on the export: inserted on a sheet of its own (Alt N V T), washes by site, then by
// site and week (the cube in seconds), compared with the SUMIFS cube on Summary, turned round to
// week by site, switched to retail revenue, and its sheet named Cuts. The closer changes a day on
// Export and the pivot holds its old figures: it is a copy until refreshed (4.4.3).
import { pivots, pivotLike, settled, at, sheetIn } from './lib/pack-checks.js';
import { PIVOTS, CUTS } from '../workbooks/clearcoat-pack.js';

const CUBE = { site: 'Site', week: 'Week', washes: 'Total washes' };
const siteByWeek = { row: CUBE.site, col: CUBE.week, value: CUBE.washes };
const onCuts = ses => { const sh = sheetIn(ses, CUTS); return !!sh && (sh.pivots || []).some(p => p.spec.row === PIVOTS.S441.row && p.spec.col === PIVOTS.S441.col && p.spec.value === PIVOTS.S441.value); };

export default {
  id: 'build-and-rearrange',
  chapter: 'data-and-lookups',
  section: 'Pivot tables',
  module: 'pivot-tables',
  workbook: 'clearcoat-pack',
  state: { before: 'S44', after: 'S441' },
  title: 'Build and rearrange',
  difficulty: 'medium',
  tags: ['pivot tables', 'summaries'],
  access: 'paid',
  minutes: 6,
  headline: 'Alt N V T',
  conventions: ['A4', 'F4'],
  teaches: ['pivot-table'],
  uses: ['go-to', 'sheet-reference', 'rename-sheet'],
  prerequisites: ['challenge-a-kpi-block-that-ties-to-the-export', 'ch3-assessment'],
  brief: 'A PivotTable takes a flat export and summarizes it by whatever fields you drop into Rows, Columns and Values: washes by site, then by site and week, then by week and site, each in a few keystrokes. Alt, N, V, T inserts one on a sheet of its own, and its field list does the rest by keyboard. Build the site by week cut and compare it with the SUMIFS cube on Summary. They agree, and only one of them is live. The key is `Alt N V T`.',
  goals: [
    { id: 'insert', teach: 'A PivotTable summarizes a flat table by the fields you drop into Rows, Columns and Values. Start from any cell of the export: Alt, N, V, T reads the whole table as its source and puts the pivot on a new sheet.',
      text: 'Go to Export!A4 and press Alt, N, V, T, then Enter: a PivotTable on a new sheet, with its field list open.', keys: 'Ctrl+G "Export!A4" ↵ Alt N V T ↵', requires: ['pivot-table', 'go-to'],
      hintStuck: 'pulse cell Export!A4 · Any cell of the export will do; the header row is the easiest to find.',
      check: (s, ses) => pivots(ses).length > 0 },
    { id: 'rows-values', teach: 'In the field list, ↓ and ↑ walk the export’s headers. R sends the field under the cursor to Rows, C to Columns and V to Values, where a number field is summed.',
      text: 'Put Site in Rows and Total washes in Values: six sites down, one column of washes.', keys: '↓ R ↓ ×3 V', requires: ['pivot-table'],
      hintStuck: 'pulse the field list · Site is the second field and Total washes the fifth.',
      check: (s, ses) => !!pivotLike(ses, { row: CUBE.site, col: null, value: CUBE.washes }) },
    { id: 'columns', text: 'Put Week in Columns and press Enter to close the list: the washes cube, built in seconds.', keys: '↓ ×3 C ↵', requires: ['pivot-table'],
      hintStuck: 'pulse the field list · Week is three fields below Total washes.',
      check: (s, ses) => settled(ses) && !!pivotLike(ses, siteByWeek) },
    { id: 'rename', text: 'Name the pivot’s sheet Cuts with Alt, H, O, R, so a reader knows what it holds.', keys: 'Alt H O R "Cuts" ↵', requires: ['rename-sheet'], convention: 'A4',
      hintStuck: 'pulse the sheet tab · Alt, H, O, R selects the tab’s name; type over it.',
      check: (s, ses) => settled(ses) && !!sheetIn(ses, CUTS) && (sheetIn(ses, CUTS).pivots || []).length > 0 },
    { id: 'swap', text: 'On the pivot, reopen the list with Shift+F10, D and swap the fields: Site across, Week down.', keys: '↓ ↓ Shift+F10 D Home ↓ C End ↑ ↑ R', requires: ['pivot-table'],
      hintStuck: 'pulse the field list · C on Site moves it across; R on Week moves it down.',
      check: (s, ses) => !!pivotLike(ses, { row: CUBE.week, col: CUBE.site, value: CUBE.washes }) },
    { id: 'revenue', text: 'Put Retail revenue ($) in Values in place of the washes, and press Enter to close the list.', keys: '↑ ↑ V ↵', requires: ['pivot-table'],
      hintStuck: 'pulse the field list · Retail revenue ($) sits two fields above Week.',
      check: (s, ses) => settled(ses) && onCuts(ses) },
    { id: 'compare', text: 'Go to Summary!F31, the revenue cube’s total, and compare it with the pivot’s grand total: they agree.', keys: 'Ctrl+G "Summary!F31" ↵', requires: ['go-to', 'sheet-reference'], convention: 'F4',
      hintStuck: 'pulse cell Summary!F31 · The revenue cube’s total is the bottom right of its block.',
      check: (s, ses) => at(ses, 'Summary', 'F31') && onCuts(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Export!F5" Enter "9999" Enter Ctrl+G "Cuts!D4" Enter', cadence: 320 },
      text: 'Does it tie? Watch Domain’s first day on Export change and the pivot keep its old figure: it is a copy until it is refreshed.', requires: [],
      hintStuck: 'pulse cell Cuts!D4 · The pivot reads its own copy of the export.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'A pivot on Cuts shows retail revenue by week down and site across', check: (s, ses) => onCuts(ses) },
  ],
  closing: [
    'You built the cube in seconds, on a copy of the data.',
    'The pivot and the SUMIFS cube agree today, and only the cube will agree tomorrow without help, because the pivot keeps its own copy of the export. Best practice: a pivot for the cut and the quick look, SUMIFS for anything a model reads.',
  ],
  solution: 'Ctrl+G "Export!A4" Enter Alt N V T Enter Down R Down Down Down V Down Down Down C Enter Alt H O R "Cuts" Enter '
    + 'Down Down Shift+F10 D Home Down C End Up Up R Up Up V Enter Ctrl+G "Summary!F31" Enter',
};
