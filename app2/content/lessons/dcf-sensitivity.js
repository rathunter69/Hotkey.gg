// Chapter 5 · 5.6.6 Sensitivity tables: WACC by growth, WACC by exit multiple (clearcoat-model, B566 → DONE)
// Planted: each table's edges (WACC down, growth or the multiple across, stepped from the pass-through
// drivers by the steps on Inputs), formatted but for the figures. The learner writes the drivers,
// then each grid as one formula with mixed anchors over the block (every cell values the business
// at its own row's WACC and column's growth or multiple), formats both in millions with one decimal
// and bolds the base case. Each grid cell is graded on its value, worked out from the learner's own
// free cash flow and periods, and on reading its own edge cells; the base case must equal the
// enterprise value the page carries for that method.
import { sheetIn, settled, reads, near, formatsOf, formatOnly, doneCell, doneFormula, R, PROJ_COLS } from './lib/model-checks.js';

const D = 'DCF';
const row = key => R(D, key);
const C = key => 'C' + row(key);
const GRID = ['D', 'E', 'F', 'G', 'H'];
const block = p => [0, 1, 2, 3, 4].flatMap(i => GRID.map(col => col + row(p + i)));
const range = p => `D${row(p + '0')}:H${row(p + '4')}`;
const EDGES = p => [...GRID.map(col => col + row(p + 'H')), ...[0, 1, 2, 3, 4].map(i => 'C' + row(p + i))];
const MILL = doneCell(D, 'D' + row('sg0')).numFmt;
const F = { ptW: doneFormula(D, C('ptW')), ptG: doneFormula(D, C('ptG')), ptM: doneFormula(D, C('ptM')), sg: doneFormula(D, 'D' + row('sg0')), sm: doneFormula(D, 'D' + row('sm0')) };
const BASE = { sg: 'F' + row('sg2'), sm: 'F' + row('sm2') };
/** A grid cell's figure without its look: the planted cell keeps everything but the number format and the bold. */
const bare = (ref) => { const { fmtStyle, numFmt, decimals, bold, ...rest } = formatOnly(doneCell(D, ref)) || {}; return rest; };
const dcf = ses => sheetIn(ses, D);
const val = (ses, ref) => dcf(ses).value(ref);
const inp = (ses, ref) => sheetIn(ses, 'Inputs').value(ref);
const linkOk = (ses, key, src, want) => { const sh = dcf(ses); return !!sh.formula(C(key)) && reads(sh, C(key), [src]) && near(sh.value(C(key)), want, 1e-9); };
const driversOk = ses => { const sh = dcf(ses); return !!sh.formula(C('ptW')) && near(sh.value(C('ptW')), val(ses, C('wacc')), 1e-12)
  && ['growth', 'exit'].every((k, i) => linkOk(ses, i ? 'ptM' : 'ptG', 'Inputs!C' + R('Inputs', k), inp(ses, 'C' + R('Inputs', k)))); };
const pvAt = (ses, w) => PROJ_COLS.reduce((t, col) => t + val(ses, col + row('fcf')) / Math.pow(1 + w, val(ses, col + row('t'))), 0);
const perpAt = (ses, w, g) => pvAt(ses, w) + val(ses, 'K' + row('fcf')) * (1 + g) / (w - g) / Math.pow(1 + w, val(ses, 'J' + row('t')));
const exitAt = (ses, w, m) => pvAt(ses, w) + val(ses, 'J' + row('ebitda')) * m / Math.pow(1 + w, inp(ses, 'J' + R('Inputs', 'pcnt')));
function gridOk(ses, p) {
  const sh = dcf(ses); const at = p === 'sg' ? perpAt : exitAt;
  return [0, 1, 2, 3, 4].every(i => GRID.every(col => {
    const ref = col + row(p + i), w = val(ses, 'C' + row(p + i)), x = val(ses, col + row(p + 'H')); const want = at(ses, w, x);
    return !!sh.formula(ref) && reads(sh, ref, ['C' + row(p + i), col + row(p + 'H')]) && near(sh.value(ref), want, 1e-6 * Math.abs(want));
  })) && near(sh.value(BASE[p]), val(ses, C(p === 'sg' ? 'evPerp' : 'evExit')), 1e-6 * Math.abs(val(ses, C('ev'))));
}
const millionsOk = ses => ['sg', 'sm'].every(p => block(p).every(ref => (dcf(ses).cellAt(ref) || {}).numFmt === MILL));
const baseOk = ses => ['sg', 'sm'].every(p => !!(dcf(ses).cellAt(BASE[p]) || {}).bold);
const CODE = MILL;
const KEYS = {
  drivers: `Ctrl+G "DCF!${C('ptW')}" ↵ "${F.ptW}" ↵ ↓ "${F.ptG}" ↵ ↓ "${F.ptM}" ↵`,
  sg: `Ctrl+G "DCF!${range('sg')}" ↵ "${F.sg}" Ctrl+↵`,
  sm: `Ctrl+G "DCF!${range('sm')}" ↵ "${F.sm}" Ctrl+↵`,
  millions: `Ctrl+G "DCF!${range('sg')}" ↵ Ctrl+1 N Tab End Alt+T "${CODE}" ↵ Ctrl+G "DCF!${range('sm')}" ↵ F4`,
  base: `Ctrl+G "DCF!${BASE.sg}" ↵ Ctrl+B Ctrl+G "DCF!${BASE.sm}" ↵ Ctrl+B`,
};

export default {
  id: 'dcf-sensitivity',
  chapter: 'finance-and-accounting',
  section: 'DCF',
  module: 'dcf',
  workbook: 'clearcoat-model',
  state: { before: 'B566', after: 'DONE' },
  plant: {
    ...formatsOf(D, [C('ptW'), C('ptG'), C('ptM')]),
    ...Object.fromEntries(['sg', 'sm'].flatMap(p => EDGES(p).map(ref => [D + '!' + ref, { ...doneCell(D, ref) }]))),
    ...Object.fromEntries(['sg', 'sm'].flatMap(p => block(p).map(ref => [D + '!' + ref, bare(ref)]))),
  },
  title: 'Sensitivity tables: WACC by growth, WACC by exit multiple',
  difficulty: 'hard',
  tags: ['model', 'dcf', 'sensitivity'],
  access: 'paid',
  minutes: 8,
  headline: 'F4',
  conventions: ['B2', 'C3', 'D2', 'F4'],
  teaches: ['sensitivity-grid'],
  uses: ['defined-name', 'cross-sheet-ref', 'f4-anchor', 'relative-absolute', 'sumproduct', 'ctrl-enter-fill', 'custom-number-format', 'format-units', 'f4-repeat', 'bold-italic-underline', 'go-to', 'arrow-keys'],
  prerequisites: ['discounting-mid-year'],
  brief: 'No one believes a single DCF number, so the page ends on two tables: enterprise value at five WACCs against five growth rates, and against five exit multiples. Each table reads the value built on its own terminal method, so neither goes flat when the switch moves. The edges are laid out; write each grid as one formula, format both the way the book prints them, and read the range a buyer will negotiate inside. The key is `F4`.',
  goals: [
    { id: 'drivers', teach: 'The tables read three cells on their own page, never Inputs directly: WACC, growth and the multiple, each passed through. The edges step out from them by the steps on Inputs.',
      text: `The drivers: ${C('ptW')} ${F.ptW}, ${C('ptG')} ${F.ptG}, and ${C('ptM')} ${F.ptM}.`,
      keys: KEYS.drivers, requires: ['defined-name', 'cross-sheet-ref', 'f4-anchor', 'go-to', 'arrow-keys'], convention: 'B2',
      hintStuck: `pulse range ${C('ptW')}:${C('ptM')} · Growth is row ${R('Inputs', 'growth')} on Inputs and the multiple row ${R('Inputs', 'exit')}.`,
      check: (s, ses) => settled(ses) && driversOk(ses) },
    { id: 'grid-perp', teach: 'One formula fills the grid when its anchors are mixed: $C69 keeps the column on the WACC edge and lets the row move, D$68 keeps the row on the growth edge and lets the column move. Each cell values the business at its own pair.',
      text: `Select ${range('sg')} and enter ${F.sg} with Ctrl+Enter.`,
      keys: KEYS.sg, requires: ['sensitivity-grid', 'f4-anchor', 'relative-absolute', 'sumproduct', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range ${range('sg')} · The forecast discounted at the row’s WACC, plus the perpetuity at the column’s growth.`,
      check: (s, ses) => settled(ses) && gridOk(ses, 'sg') },
    { id: 'grid-exit', teach: 'The exit grid is the same forecast plus FY31 EBITDA times the column’s multiple, a sale at the end of FY31.',
      text: `Select ${range('sm')} and enter ${F.sm} with Ctrl+Enter.`,
      keys: KEYS.sm, requires: ['sensitivity-grid', 'f4-anchor', 'relative-absolute', 'sumproduct', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range ${range('sm')} · The multiples run across row ${row('smH')}.`,
      check: (s, ses) => settled(ses) && gridOk(ses, 'sm') },
    { id: 'millions', teach: 'A comma after the last digit placeholder divides by a thousand, so thousands print as millions with one decimal, the way the book shows a valuation range.',
      text: `Format ${range('sg')} with the code ${CODE}, then ${range('sm')} with F4.`,
      keys: KEYS.millions, requires: ['custom-number-format', 'format-units', 'f4-repeat', 'go-to'], convention: 'D2',
      hintStuck: `pulse range ${range('sg')} · Ctrl+1, N, then type the code into the Custom box.`,
      check: (s, ses) => settled(ses) && millionsOk(ses) },
    { id: 'base', teach: 'The middle cell of each grid is the base case, and it equals the enterprise value above for its method. Bold it so the eye starts there.',
      text: `Bold the base case of each grid: ${BASE.sg}, then ${BASE.sm}, with Ctrl+B.`,
      keys: KEYS.base, requires: ['bold-italic-underline', 'go-to'], convention: 'F4',
      hintStuck: `pulse cell ${BASE.sg} · It should read the same as the enterprise value for its method, in millions.`,
      check: (s, ses) => settled(ses) && baseOk(ses) },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "Inputs!F${R('Inputs', 'bNew')}" Enter "3" Enter Ctrl+G "DCF!${BASE.sg}" Enter Ctrl+G "DCF!${BASE.sm}" Enter`, cadence: 360 },
      text: 'Does it tie? Watch three new sites in FY27 instead of six: both tables shift together.', requires: [],
      hintStuck: `pulse cell ${BASE.sg} · Every cell reads the same forecast, so the whole grid moves.`,
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Two grids value the business at five WACCs by five growth rates and five multiples, each one formula', check: (s, ses) => driversOk(ses) && gridOk(ses, 'sg') && gridOk(ses, 'sm') },
    { text: 'Both grids print in millions with one decimal, and the base cases are bold', check: (s, ses) => millionsOk(ses) && baseOk(ses) },
  ],
  closing: [
    'Two tables show the range inside which the whole negotiation will happen.',
    'Best practice: keep the steps tight, about half a point of WACC and growth and one turn of multiple, so the corners are a range a buyer will actually discuss. Read across a row before you quote the base case: if one step moves the value by a fifth, say so.',
  ],
  solution: Object.values(KEYS).join(' ').replace(/↵/g, 'Enter').replace(/↓/g, 'Down'),
};
