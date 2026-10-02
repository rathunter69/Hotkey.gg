// Chapter 5 · 5.5.4 Stress tests: zero, huge, a loss (clearcoat-model, B554 → B561)
// Planted: the four IS margins dividing bare. The learner drives washes to zero (Base case washes a
// day and new-site washes), reads #DIV/0! on the margins, wraps them in IFERROR with a dash and puts
// the inputs back; then a hundred new sites (the revolver draws, cash holds at the minimum), a cost
// of a wash at 150% (a loss, and the MAX in the tax schedule holds tax at zero) and member share at
// 100% and 0%, each undone with Ctrl+Z. A stress is graded as seen at its extreme, then restored.
import { sheetIn, settled, calls, reads, near, R, COLS, isErr, seenThen } from './lib/model-checks.js';
import { PLANT_MARGINS, plantPatch } from '../workbooks/clearcoat-model.js';

const IN = 'Inputs';
const inp = (ses, ref) => sheetIn(ses, IN).value(ref);
const MARGINS = [['gm', 'gp'], ['cm', 'contrib'], ['em', 'ebitda'], ['nm', 'ni']].map(([k, num]) => ({ r: R('IS', k), num: R('IS', num) }));
const REV = R('IS', 'rev');
const WASH = PROJ => PROJ.map(c => c + R(IN, 'bWash'));
const WASHES = WASH(['F', 'G', 'H', 'I', 'J']), NEWWASH = 'C' + R(IN, 'newWash');
const NEW = 'F' + R(IN, 'bNew'), COS = 'F' + R(IN, 'bCos'), SHARE = 'F' + R(IN, 'bShare');
const flag = ses => sheetIn(ses, 'Cover').value('C' + R('Cover', 'flag'));
const errorsOn = ses => ['C30', 'C31', 'C32', 'C33', 'C34', 'C35'].reduce((t, ref) => t + (sheetIn(ses, 'Checks').value(ref) || 0), 0);
const zeroed = ses => WASHES.every(ref => inp(ses, ref) === 0) && inp(ses, NEWWASH) === 0;
const restored = ses => WASHES.every(ref => inp(ses, ref) === 250) && inp(ses, NEWWASH) === 200;
const wrapped = ses => { const sh = sheetIn(ses, 'IS'); return MARGINS.every(m => COLS.every(c => { const ref = c + m.r; const rev = sh.value(c + REV), v = sh.value(ref); return calls(sh, ref, ['IFERROR']) && reads(sh, ref, [c + m.num, c + REV]) && !isErr(v) && (rev ? near(v, sh.value(c + m.num) / rev, 1e-9) : v === '-'); })); };
const F = Object.fromEntries(MARGINS.map(m => [m.r, `=IFERROR(C${m.num}/C${REV},"-")`]));

export default {
  id: 'stress-tests',
  chapter: 'finance-and-accounting',
  section: 'Auditing a model',
  module: 'auditing-a-model',
  workbook: 'clearcoat-model',
  state: { before: 'B554', after: 'B561' },
  plant: plantPatch('B554', PLANT_MARGINS),
  title: 'Stress tests: zero, huge, a loss',
  difficulty: 'medium',
  tags: ['model', 'audit', 'stress tests'],
  access: 'paid',
  minutes: 7,
  headline: 'Ctrl+Z',
  conventions: ['F4', 'E6'],
  teaches: ['stress-test'],
  uses: ['iferror-function', 'undo-redo', 'go-to', 'sheet-reference', 'ctrl-enter-fill', 'min-max-cap', 'rollup-flag'],
  prerequisites: ['model-wide-sweep'],
  brief: 'A model that balances on the base case can still break: take washes to zero and a margin divides by nothing; build a hundred sites and the revolver has to carry it; make the washes cost more than they earn and tax has to stop at zero. A stress test types an input to an extreme, reads what breaks, fixes the formula that should have held, and puts the input back. Run four on Inputs before a buyer’s analyst does. The key is `Ctrl+Z`.',
  goals: [
    { id: 'zero', teach: 'Zero is the first stress: every ratio divides by something, and a divisor of zero is #DIV/0!. With no washes, revenue is nothing, so every margin on the IS breaks.',
      text: 'Take washes to zero: 0 into Inputs!F22:J22 with Ctrl+Enter and 0 into C42; the IS margins read #DIV/0!.',
      keys: 'Ctrl+G "Inputs!F22:J22" ↵ "0" Ctrl+↵ Ctrl+G "C42" ↵ "0" ↵', requires: ['stress-test', 'go-to', 'sheet-reference', 'ctrl-enter-fill'],
      hintStuck: 'pulse range F22:J22 · Row 22 is the Base case washes a day; C42 the washes at a new site.',
      check: (s, ses) => settled(ses) && zeroed(ses) && isErr(sheetIn(ses, 'IS').value('F' + MARGINS[0].r)) },
    { id: 'wrap', teach: 'A ratio with nothing to divide by has no answer, so IFERROR shows a dash where the error would be. Use it only where the error is expected, never around a whole calculation to hide one.',
      text: 'Wrap the four margins: C11:J11 =IFERROR(C10/C8,"-"), and rows 21, 25 and 32 the same way.',
      keys: `Ctrl+G "IS!C11:J11" ↵ '${F[MARGINS[0].r]}' Ctrl+↵ Ctrl+G "IS!C21:J21" ↵ '${F[MARGINS[1].r]}' Ctrl+↵ Ctrl+G "IS!C25:J25" ↵ '${F[MARGINS[2].r]}' Ctrl+↵ Ctrl+G "IS!C32:J32" ↵ '${F[MARGINS[3].r]}' Ctrl+↵`,
      requires: ['iferror-function', 'go-to', 'ctrl-enter-fill'], convention: 'D3',
      hintStuck: 'pulse range C11:J11 · Each margin is its line over revenue in row 8.',
      check: (s, ses) => settled(ses) && wrapped(ses) },
    { id: 'restore', text: 'Put the base case back: 250 into Inputs!F22:J22 and 200 into C42.',
      keys: 'Ctrl+G "Inputs!F22:J22" ↵ "250" Ctrl+↵ Ctrl+G "C42" ↵ "200" ↵', requires: ['go-to', 'ctrl-enter-fill'],
      hintStuck: 'pulse range F22:J22 · The Base case runs 250 washes a day; a new site 200.',
      check: (s, ses) => settled(ses) && restored(ses) && wrapped(ses) && flag(ses) === 'OK' },
    { id: 'sites', teach: 'Ctrl+Z takes back the last change, so a stress is one entry and one undo. A hundred sites is $250m of capex: the revolver draws whatever cash before it falls short of the minimum, and the model still balances.',
      text: 'Type 100 into FY27 new sites, Inputs!F21: cash holds at the 5,000 minimum and the flag stays OK; then Ctrl+Z.',
      keys: 'Ctrl+G "F21" ↵ "100" ↵ Ctrl+Z', requires: ['stress-test', 'undo-redo', 'go-to'],
      hintStuck: 'pulse cell F21 · The revolver is the plug that is not a plug: it draws to the minimum cash.',
      check: (s, ses) => settled(ses) && seenThen(ses, 'sites', x => inp(x, NEW) === 100 && near(sheetIn(x, 'BS').value('F' + R('BS', 'cash')), 5000, 0.01) && flag(x) === 'OK', x => inp(x, NEW) === 6) },
    { id: 'loss', teach: 'When the washes cost more than they bring in, earnings before tax go negative, and tax has to stop at zero rather than turn into a refund. The MAX in the tax schedule does that, and the loss is carried to a later year.',
      text: 'Type 150% into the FY27 cost of a wash, Inputs!F25: a loss, and Schedules F120 shows no tax; then Ctrl+Z.',
      keys: 'Ctrl+G "Inputs!F25" ↵ "150%" ↵ Ctrl+Z', requires: ['stress-test', 'undo-redo', 'min-max-cap', 'go-to'],
      hintStuck: 'pulse cell F25 · Row 120 on Schedules is the tax charge.',
      check: (s, ses) => settled(ses) && seenThen(ses, 'loss', x => near(inp(x, COS), 1.5) && sheetIn(x, 'Schedules').value('F' + R('Schedules', 'ebt')) < 0 && sheetIn(x, 'Schedules').value('F' + R('Schedules', 'taxCharge')) === 0 && flag(x) === 'OK', x => near(inp(x, COS), 0.12)) },
    { id: 'share', text: 'Type 100% and then 0% into FY27 member share, Inputs!F24: no errors either way; then Ctrl+Z twice.',
      keys: 'Ctrl+G "Inputs!F24" ↵ "100%" ↵ "0%" ↵ Ctrl+Z ×2', requires: ['stress-test', 'undo-redo', 'go-to'],
      hintStuck: 'pulse cell F24 · At 100% every wash is a member’s; at 0% none is.',
      check: (s, ses) => settled(ses) && seenThen(ses, 'share-all', x => near(inp(x, SHARE), 1) && errorsOn(x) === 0 && flag(x) === 'OK', () => true) && seenThen(ses, 'share-none', x => inp(x, SHARE) === 0 && errorsOn(x) === 0 && flag(x) === 'OK', x => near(inp(x, SHARE), 0.5)) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Checks!C44" Enter Ctrl+G "Cover!C7" Enter', cadence: 400 },
      text: 'Does it tie? Watch C44 on Checks and C7 on the Cover: the base case is back, every check reads zero, and the flag reads OK.', requires: [],
      hintStuck: 'pulse cell C7 · The last cell you read before sending.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The four IS margins read a dash where revenue is nothing', check: (s, ses) => wrapped(ses) },
    { text: 'Inputs are back on the base case, and the flag reads OK', check: (s, ses) => restored(ses) && inp(ses, NEW) === 6 && near(inp(ses, COS), 0.12) && near(inp(ses, SHARE), 0.5) && flag(ses) === 'OK' },
  ],
  closing: [
    'The model held at four extremes, and you fixed the one formula that didn’t.',
    'Best practice: run the stress tests before sending, every time. A buyer’s analyst runs them in the first ten minutes, and a model that breaks at zero tells them nobody looked.',
  ],
  solution: `Ctrl+G "Inputs!F22:J22" Enter "0" Ctrl+Enter Ctrl+G "C42" Enter "0" Enter `
    + `Ctrl+G "IS!C11:J11" Enter '${F[MARGINS[0].r]}' Ctrl+Enter Ctrl+G "IS!C21:J21" Enter '${F[MARGINS[1].r]}' Ctrl+Enter Ctrl+G "IS!C25:J25" Enter '${F[MARGINS[2].r]}' Ctrl+Enter Ctrl+G "IS!C32:J32" Enter '${F[MARGINS[3].r]}' Ctrl+Enter `
    + 'Ctrl+G "Inputs!F22:J22" Enter "250" Ctrl+Enter Ctrl+G "C42" Enter "200" Enter '
    + 'Ctrl+G "F21" Enter "100" Enter Ctrl+Z Ctrl+G "Inputs!F25" Enter "150%" Enter Ctrl+Z Ctrl+G "Inputs!F24" Enter "100%" Enter "0%" Enter Ctrl+Z Ctrl+Z',
};
