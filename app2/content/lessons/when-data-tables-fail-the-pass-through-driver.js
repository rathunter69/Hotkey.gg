// Chapter 4 · 4.5.5 When data tables fail: the pass-through driver (clearcoat-pack, S454 → S455)
// The ticket moves to Inputs (C15), where a Data Table on Scenarios cannot reach it. The case
// tickets link to it in green, a blank driver C13 and C14 =IF(C13="",Inputs!$C$15,C13) give the
// table a cell on its own sheet, revenue and contribution per wash read C14, and both tables are
// rebuilt on C13. The labels on Inputs and Scenarios are planted.
import { stateOf, SCENARIOS, TICKETS, SHARES } from '../workbooks/clearcoat-pack.js';
import { scenarios, sheetIn, settled, calls, reads, live, near, tableOn } from './lib/pack-checks.js';

const C = SCENARIOS;
const DONE = stateOf('S455');
const cellOf = (name, ref) => DONE.sheets.find(s => s.name === name).cells[ref];
const fmt = cell => { const { value, formula, ...f } = cell; void value; void formula; return f; };
const PLANT = {
  'Inputs!B15': cellOf('Inputs', 'B15'), 'Inputs!D15': cellOf('Inputs', 'D15'), 'Inputs!C15': fmt(cellOf('Inputs', 'C15')),
  ['Scenarios!B' + C.driver]: cellOf('Scenarios', 'B' + C.driver), ['Scenarios!B' + C.ticketModel]: cellOf('Scenarios', 'B' + C.ticketModel),
  ['Scenarios!C' + C.ticketModel]: fmt(cellOf('Scenarios', 'C' + C.ticketModel)),
};
const TICKET = 14;
const DRIVER = 'C' + C.driver, MODEL = 'C' + C.ticketModel;
const inputOk = ses => { const I = sheetIn(ses, 'Inputs'); return !!I && !I.formula('C15') && I.value('C15') === TICKET; };
const linksOk = ses => { const sh = scenarios(ses); return !!sh && ['C', 'D', 'E'].every(c => { const ref = c + C.inputs.ticket; return reads(sh, ref, ['Inputs!C15']) && near(sh.value(ref), TICKET) && sh.cellAt(ref).fontColor === 'green'; }); };
const driverOk = ses => { const sh = scenarios(ses); return !!sh && sh.value(DRIVER) == null && calls(sh, MODEL, ['IF']) && reads(sh, MODEL, [DRIVER, 'Inputs!C15']) && near(sh.value(MODEL), TICKET) && live(sh, MODEL); };
const readsDriver = (sh, ref) => reads(sh, ref, [MODEL]) && !reads(sh, ref, ['G' + C.inputs.ticket]);
const pointedOk = ses => { const sh = scenarios(ses); return !!sh && readsDriver(sh, 'C' + C.outputs.revenue) && readsDriver(sh, 'C' + C.breakEven.cpw) && near(sh.value('C' + C.outputs.revenue), sh.value('C' + C.outputs.washesYr) * sh.value(MODEL)); };
const out = (sh, k) => sh.value('C' + C.outputs[k]);
const oneWayOk = ses => { const sh = scenarios(ses); return !!tableOn(sh, { block: `C${C.oneWay.vals}:H${C.oneWay.ebitda}`, row: DRIVER }) && ['D', 'E', 'F', 'G', 'H'].every((c, j) => near(sh.value(c + C.oneWay.ebitda), out(sh, 'ebitda') + out(sh, 'washesYr') * (TICKETS[j] - sh.value(MODEL)), 1e-3)); };
const twoWayOk = ses => { const sh = scenarios(ses); const cost = sheetIn(ses, 'Inputs').value('C7'); return !!tableOn(sh, { block: `C${C.twoWay.vals}:H${C.twoWay.rows[4]}`, row: DRIVER, col: 'G' + C.inputs.share })
  && C.twoWay.rows.every((r, i) => ['D', 'E', 'F', 'G', 'H'].every((c, j) => near(sh.value(c + r), out(sh, 'ebitda') + out(sh, 'washesYr') * (TICKETS[j] - sh.value(MODEL)) + out(sh, 'washesYr') * (SHARES[i] - sh.value('G' + C.inputs.share)) * cost, 1e-3))); };
const F = { link: '=Inputs!$C$15', driver: cellOf('Scenarios', MODEL).formula, revenue: cellOf('Scenarios', 'C' + C.outputs.revenue).formula, cpw: cellOf('Scenarios', 'C' + C.breakEven.cpw).formula };

export default {
  id: 'when-data-tables-fail-the-pass-through-driver',
  chapter: 'data-and-lookups',
  section: 'Scenarios and sensitivity',
  module: 'scenarios-and-sensitivity',
  workbook: 'clearcoat-pack',
  state: { before: 'S454', after: 'S455' },
  plant: PLANT,
  title: 'When data tables fail: the pass-through driver',
  difficulty: 'hard',
  tags: ['scenarios', 'sensitivity', 'data tables', 'modeling'],
  access: 'paid',
  minutes: 7,
  headline: 'IF',
  conventions: ['B4', 'B2'],
  teaches: ['pass-through-driver'],
  uses: ['data-table-one-way', 'data-table-two-way', 'if-function', 'blank-test', 'go-to', 'sheet-reference', 'cross-sheet-ref', 'font-color', 'ctrl-enter-fill', 'ctrl-arrow', 'shift-arrow'],
  prerequisites: ['goal-seek-break-even-washes-per-site'],
  brief: 'A Data Table can only move an input on its own sheet, and a big model keeps its inputs on Inputs. The fix is a pass-through driver: a blank cell on the table’s sheet and, beside it, the cell the model reads, =IF(C13="",Inputs!$C$15,C13). The table drives the blank cell; when no table is running, the input passes straight through. Move the ticket to Inputs, build the driver and rebuild both tables on it. The key is `IF`.',
  goals: [
    { id: 'input', text: 'Move the ticket to Inputs: type it in Inputs!C15, 14, one blended ticket for every case.', keys: `Ctrl+G "Inputs!C15" ↵ "${TICKET}" ↵`, requires: ['go-to', 'sheet-reference'], convention: 'B4',
      hintStuck: 'pulse cell Inputs!C15 · The label and the note beside it are in place.',
      check: (s, ses) => settled(ses) && inputOk(ses) },
    { id: 'links', text: 'Point the case tickets on Scenarios at it: C6:E6 =Inputs!$C$15 with Ctrl+Enter, then color them green as links.', keys: `Ctrl+G "Scenarios!C6:E6" ↵ "${F.link}" Ctrl+↵ Alt H F C → ×8 ↵`, requires: ['go-to', 'cross-sheet-ref', 'ctrl-enter-fill', 'font-color'], convention: 'B2',
      hintStuck: 'pulse range C6:E6 · Green says the figure comes from another sheet.',
      check: (s, ses) => settled(ses) && linksOk(ses) },
    { id: 'driver', teach: 'A Data Table can only write into a cell on its own sheet, so it cannot reach Inputs!C15. The pass-through gives it one: C13 stays blank, and C14 passes the input through until a table writes into C13.',
      text: 'Leave C13 blank and give the model its ticket in C14: =IF(C13="",Inputs!$C$15,C13).', keys: `Ctrl+↓ ×4 ↑ ×3 '${F.driver}' ↵`, requires: ['pass-through-driver', 'if-function', 'blank-test', 'ctrl-arrow'],
      hintStuck: 'pulse cell C14 · B13 says leave blank, so nobody types into the driver.',
      check: (s, ses) => settled(ses) && driverOk(ses) },
    { id: 'point', text: 'Point the model at C14: revenue in C18 =C17*C14, and contribution per wash in C42 reading C14 in place of G6.', keys: `↓ ×3 "${F.revenue}" ↵ Ctrl+G "C42" ↵ "${F.cpw}" ↵`, requires: ['pass-through-driver', 'go-to'],
      hintStuck: 'pulse cell C18 · Everything that read the live ticket now reads the driver’s cell.',
      check: (s, ses) => settled(ses) && pointedOk(ses) },
    { id: 'one-way', text: 'Rebuild the one-way table on the driver: select C28:H29, Alt, A, W, T, Row input cell C13.', keys: 'Ctrl+↑ ×4 ↑ Shift+→ ×5 Shift+↓ Alt A W T Alt+R "C13" ↵', requires: ['data-table-one-way', 'pass-through-driver', 'ctrl-arrow', 'shift-arrow'],
      hintStuck: 'pulse range C28:H29 · The table writes each ticket into C13, and C14 passes it to the model.',
      check: (s, ses) => settled(ses) && oneWayOk(ses) },
    { id: 'two-way', text: 'Rebuild the two-way table too: select C32:H37, Row input cell C13, Column input cell G7.', keys: 'Ctrl+↓ ×2 Shift+→ ×5 Shift+↓ ×5 Alt A W T Alt+R "C13" Alt+C "G7" ↵', requires: ['data-table-two-way', 'pass-through-driver', 'ctrl-arrow', 'shift-arrow'],
      hintStuck: 'pulse range C32:H37 · Only the row input moves to the driver; the share is still G7.',
      check: (s, ses) => settled(ses) && twoWayOk(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!C15" Enter "15" Enter Ctrl+G "Scenarios!C29" Enter', cadence: 320 },
      text: 'Does it tie? Watch the ticket on Inputs go from $14 to $15: EBITDA rises and both tables follow it.', requires: [],
      hintStuck: 'pulse cell C29 · The input on another sheet now reaches the tables through one honest cell.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The ticket lives on Inputs and the case tickets link to it', check: (s, ses) => inputOk(ses) && linksOk(ses) },
    { text: 'C14 passes the ticket through C13 and the model reads it', check: (s, ses) => driverOk(ses) && pointedOk(ses) },
    { text: 'Both tables run on the driver C13', check: (s, ses) => oneWayOk(ses) && twoWayOk(ses) },
  ],
  closing: [
    'The table reaches an input on another sheet, through one honest cell.',
    'The driver is blank on purpose and labeled so nobody fills it. Tip from the desk: a table whose cells all read the same isn’t reaching its input, because the model reads another cell or a switch routes around it, so label each table with the setting it needs.',
  ],
  solution: `Ctrl+G "Inputs!C15" Enter "${TICKET}" Enter Ctrl+G "Scenarios!C6:E6" Enter "${F.link}" Ctrl+Enter Alt H F C Right Right Right Right Right Right Right Right Enter `
    + `Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Up Up Up '${F.driver}' Enter Down Down Down "${F.revenue}" Enter Ctrl+G "C42" Enter "${F.cpw}" Enter `
    + 'Ctrl+Up Ctrl+Up Ctrl+Up Ctrl+Up Up Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Down Alt A W T Alt+R "C13" Enter '
    + 'Ctrl+Down Ctrl+Down Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Alt A W T Alt+R "C13" Alt+C "G7" Enter',
};
