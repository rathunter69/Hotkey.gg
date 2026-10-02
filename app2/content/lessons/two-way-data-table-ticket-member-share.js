// Chapter 4 · 4.5.3 Two-way data table: ticket × member share (clearcoat-pack, S452 → S453)
// The table a buyer photographs: tickets across D32:H32, member shares down C33:C37, EBITDA in the
// corner C32, a Data Table on C32:H37 driven by the live ticket G6 and the live share G7, the base
// case ($14, 50%) in bold, a formula rule that turns red every cell below the live EBITDA, and
// calculation set to Automatic except for Data Tables, watched, and put back. Labels and formats
// are planted.
import { stateOf, SCENARIOS, TICKETS, SHARES, formatOnly } from '../workbooks/clearcoat-pack.js';
import { scenarios, sheetIn, settled, near, tableOn, typedRow, linksTo, pressedSince, refsOf } from './lib/pack-checks.js';

const C = SCENARIOS; const T = C.twoWay;   // title 31, edge row 32, rows 33-37
const DONE = stateOf('S453').sheets.find(s => s.name === 'Scenarios').cells;
const TOP = ['D', 'E', 'F', 'G', 'H'].map(c => c + T.vals);
const SIDE = T.rows.map(r => 'C' + r);
const GRID = refsOf(`D${T.rows[0]}:H${T.rows[4]}`);
const BASE = 'F' + T.rows[2];
const noBold = cell => { const f = formatOnly(cell); if (f) delete f.bold; return f; };
const PLANT = Object.fromEntries([
  ...['B' + T.title, 'B' + T.vals].map(k => ['Scenarios!' + k, DONE[k]]),
  ...['C' + T.vals, ...TOP, ...SIDE, ...GRID].map(k => ['Scenarios!' + k, noBold(DONE[k])]),
]);
const BLOCK = `C${T.vals}:H${T.rows[4]}`;
const out = (sh, k) => sh.value('C' + C.outputs[k]);
/** EBITDA at a ticket and a member share, worked out from the learner's own model: a dollar of ticket is worth washes a year, a point of share saves the retail cost on that many washes. */
const at = (sh, t, s) => out(sh, 'ebitda') + out(sh, 'washesYr') * (t - sh.value('G' + C.inputs.ticket)) + out(sh, 'washesYr') * (s - sh.value('G' + C.inputs.share)) * sheetIn(sh._ses, 'Inputs').value('C7');
const fresh = (ses, sh) => { sh._ses = ses; return T.rows.every((r, i) => ['D', 'E', 'F', 'G', 'H'].every((c, j) => near(sh.value(c + r), at(sh, TICKETS[j], SHARES[i]), 1e-3))); };
const edgesOk = ses => { const sh = scenarios(ses); return linksTo(sh, 'C' + T.vals, 'C' + C.outputs.ebitda) && typedRow(sh, TOP, TICKETS); };
const sideOk = ses => typedRow(scenarios(ses), SIDE, SHARES);
const tableOk = ses => !!tableOn(scenarios(ses), { block: BLOCK, row: 'G' + C.inputs.ticket, col: 'G' + C.inputs.share });
const boldOk = ses => !!scenarios(ses) && scenarios(ses).cellAt(BASE).bold === true;
/** The rule turns red exactly the grid cells below the live EBITDA. */
const ruleOk = ses => { const sh = scenarios(ses); if (!sh || !(sh.condFmt || []).some(x => x.kind === 'formula')) return false; const map = sh.condFmtMap(); const e = out(sh, 'ebitda'); return GRID.every(k => !!(map[k] && map[k].fill) === (sh.value(k) < e)) && GRID.some(k => sh.value(k) < e); };
const mode = ses => ses.settings.calcMode;
const washes = ses => scenarios(ses).value('D' + C.inputs.washes);
const F = { corner: `=C${C.outputs.ebitda}`, rule: `=D${T.rows[0]}<$C$${C.outputs.ebitda}` };

export default {
  id: 'two-way-data-table-ticket-member-share',
  chapter: 'data-and-lookups',
  section: 'Scenarios and sensitivity',
  module: 'scenarios-and-sensitivity',
  workbook: 'clearcoat-pack',
  state: { before: 'S452', after: 'S453' },
  plant: PLANT,
  title: 'Two-way data table: ticket × member share',
  difficulty: 'hard',
  tags: ['scenarios', 'sensitivity', 'data tables'],
  access: 'paid',
  minutes: 7,
  headline: 'Alt A W T',
  conventions: ['B1', 'A1'],
  teaches: ['data-table-two-way', 'calc-except-tables'],
  uses: ['data-table-one-way', 'go-to', 'sheet-reference', 'shift-arrow', 'ctrl-arrow', 'formula-rule', 'bold-italic-underline', 'tab-commits', 'calculate-now'],
  prerequisites: ['one-way-data-table-the-ticket'],
  brief: 'The two-way table moves two inputs at once, tickets across and member shares down with EBITDA in the grid: the table a buyer photographs. The corner holds the output, and the row and column input cells are the two inputs it drives. Calculation set to Automatic except for Data Tables keeps a big model fast, with F9 to bring the tables up to date. Build it and mark the cells where the downside lives. The key is `Alt A W T`.',
  goals: [
    { id: 'top', teach: 'A two-way table moves two inputs: one set of values across the top, another down the left, and the output formula in the corner where they meet. Both edges are typed, never linked to the inputs the table drives.',
      text: 'Start the table at C32: the corner =C24, then the tickets 12 to 16 across D32:H32.', keys: `Ctrl+G "Scenarios!C32" ↵ "${F.corner}" Tab "12" Tab "13" Tab "14" Tab "15" Tab "16" ↵`, requires: ['data-table-two-way', 'go-to', 'tab-commits'], convention: 'B1',
      hintStuck: 'pulse range C32:H32 · The corner reads EBITDA; the tickets run across beside it.',
      check: (s, ses) => settled(ses) && edgesOk(ses) },
    { id: 'side', text: 'Type the member shares down C33:C37: 40, 45, 50, 55 and 60, which the percent format reads as 40% to 60%.', keys: '"40" ↵ "45" ↵ "50" ↵ "55" ↵ "60" ↵', requires: ['data-table-two-way'], convention: 'B1',
      hintStuck: 'pulse range C33:C37 · The cells are formatted as percentages already, so 40 goes in as 40.0%.',
      check: (s, ses) => settled(ses) && sideOk(ses) },
    { id: 'table', text: 'Select C32:H37, press Alt, A, W, T, set the Row input cell to G6 and the Column input cell to G7, and press Enter.', keys: 'Ctrl+↑ ×2 Shift+→ ×5 Shift+↓ ×5 Alt A W T Alt+R "G6" Alt+C "G7" ↵', requires: ['data-table-two-way', 'shift-arrow', 'ctrl-arrow'],
      hintStuck: 'pulse range C32:H37 · The values across the top move the ticket; the values down the side move the share.',
      check: (s, ses) => { const sh = scenarios(ses); return settled(ses) && tableOk(ses) && fresh(ses, sh); } },
    { id: 'base', text: 'Mark the base case, $14 and 50%, in bold: F35.', keys: '↓ ×3 Ctrl+→ ← ← Ctrl+B', requires: ['bold-italic-underline', 'ctrl-arrow'],
      hintStuck: 'pulse cell F35 · The third ticket across, the third share down.',
      check: (s, ses) => settled(ses) && boldOk(ses) },
    { id: 'rule', text: 'Turn red every cell below the live EBITDA: on D33:H37, a formula rule =D33<$C$24 with the light red fill.', keys: `Ctrl+↑ ↓ Ctrl+← → Shift+→ ×4 Shift+↓ ×4 Alt H L N "${F.rule}" ↵`, requires: ['formula-rule', 'shift-arrow', 'ctrl-arrow'],
      hintStuck: 'pulse range D33:H37 · D33 is relative, so each cell compares itself; $C$24 stays put.',
      check: (s, ses) => settled(ses) && ruleOk(ses) },
    { id: 'except', teach: 'A Data Table reruns the model once for every cell, so a big model with tables slows down. Automatic except for Data Tables (Alt, M, X, E) recalculates everything else at once and leaves the tables until you press F9.',
      text: 'Set calculation to Automatic except for Data Tables, then make Base washes a day, D5, 230: EBITDA moves and the grid holds.', keys: 'Alt M X E Ctrl+G "Scenarios!D5" ↵ "230" ↵', requires: ['calc-except-tables', 'go-to'],
      hintStuck: 'pulse cell D5 · Alt, M, X opens Calculation Options; E is Automatic except for Data Tables.',
      check: (s, ses) => { const sh = scenarios(ses); return settled(ses) && mode(ses) === 'autoExceptTables' && washes(ses) === 230 && !fresh(ses, sh); } },
    { id: 'catch-up', text: 'Press F9 to bring the grid up to date, put 250 back in D5, and set calculation back to Automatic: Alt, M, X, A.', keys: 'F9 ↑ "250" ↵ Alt M X A', requires: ['calc-except-tables', 'calculate-now'], convention: 'A1',
      hintStuck: 'pulse cell D5 · A model sent in Automatic except for Data Tables shows stale grids to whoever opens it.',
      check: (s, ses) => { const sh = scenarios(ses); return settled(ses) && mode(ses) === 'automatic' && washes(ses) === 250 && pressedSince(ses, 'F9') && fresh(ses, sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Scenarios!D8" Enter "40" Enter Ctrl+G "Scenarios!F35" Enter', cadence: 320 },
      text: 'Does it tie? Watch Base sites at year end go from 44 to 40: every cell of the grid falls and more of it turns red.', requires: [],
      hintStuck: 'pulse range D33:H37 · The grid reruns the model for every pair of ticket and share.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C32:H37 is a Data Table of EBITDA by ticket and member share, on G6 and G7, up to date', check: (s, ses) => edgesOk(ses) && sideOk(ses) && tableOk(ses) && fresh(ses, scenarios(ses)) },
    { text: 'The base case is bold and the cells below the live EBITDA are red', check: (s, ses) => boldOk(ses) && ruleOk(ses) },
    { text: 'Calculation is back to Automatic', check: (s, ses) => mode(ses) === 'automatic' },
  ],
  closing: [
    'This is the table a buyer photographs: live, with the downside marked.',
    'Twenty-five EBITDAs from one formula, and the red shows at a glance which mixes of ticket and share fall short of the case. Best practice: leave a model in Automatic when you send it, because a grid held by Automatic except for Data Tables looks current and isn’t.',
  ],
  solution: `Ctrl+G "Scenarios!C32" Enter "${F.corner}" Tab "12" Tab "13" Tab "14" Tab "15" Tab "16" Enter "40" Enter "45" Enter "50" Enter "55" Enter "60" Enter `
    + 'Ctrl+Up Ctrl+Up Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Alt A W T Alt+R "G6" Alt+C "G7" Enter '
    + 'Down Down Down Ctrl+Right Left Left Ctrl+B '
    + `Ctrl+Up Down Ctrl+Left Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Shift+Down Alt H L N "${F.rule}" Enter `
    + 'Alt M X E Ctrl+G "Scenarios!D5" Enter "230" Enter F9 Up "250" Enter Alt M X A',
};
