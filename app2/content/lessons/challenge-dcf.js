// Chapter 5 · 5.6.C Challenge: a DCF from a given free-cash-flow line (clearcoat-model, seeded over B56C)
// Five years of free cash flow are typed (a fresh line each seed, the normalized year following
// FY31), with EBITDA, the periods, the WACC inputs, the drivers and the tables' edges in place. The
// learner builds the WACC and names it, both terminal values, the mid-year factors, enterprise and
// equity value, and one sensitivity grid. Every figure is graded on its value worked out from the
// learner's own cells; any formula that gets there passes.
import { challengeSeed } from '../workbooks/clearcoat-model.js';
import { sheetIn, settled, near, R, PROJ_COLS, liveFrom } from './lib/model-checks.js';
import { parsFrom } from '../../app/pars.js';

const ID = 'challenge-dcf';
const D = 'DCF';
const row = key => R(D, key);
const C = key => 'C' + row(key);
const GRID = ['D', 'E', 'F', 'G', 'H'];
const dcf = ses => sheetIn(ses, D);
const val = (ses, ref) => dcf(ses).value(ref);
const inp = (ses, key) => sheetIn(ses, 'Inputs').value('C' + R('Inputs', key));
const N = ses => sheetIn(ses, 'Inputs').value('J' + R('Inputs', 'pcnt'));
const PN = `Inputs!$J$${R('Inputs', 'pcnt')}`;
const close = (a, b) => near(a, b, 1e-6 * Math.max(1, Math.abs(b)));
const fx = (ses, ref, want) => !!dcf(ses).formula(ref) && close(val(ses, ref), want);
/** The WACC the inputs give, worked out here. */
const waccWant = ses => (1 - inp(ses, 'debtW')) * (inp(ses, 'rf') + inp(ses, 'beta') * inp(ses, 'erp') + inp(ses, 'size')) + inp(ses, 'debtW') * inp(ses, 'cod') * (1 - inp(ses, 'tax'));
const named = ses => { const n = Object.entries(ses.names || {}).find(([k]) => k.toUpperCase() === 'WACC'); if (!n) return null; const m = /^'?([^'!]+)'?!\$?([A-Z]+)\$?(\d+)$/.exec(String(n[1])); return m ? { sheet: m[1], ref: m[2] + m[3] } : null; };
const W = ses => { const n = named(ses); const sh = n && sheetIn(ses, n.sheet); return sh ? sh.value(n.ref) : NaN; };
const waccOk = ses => { const n = named(ses); const sh = n && sheetIn(ses, n.sheet); return !!sh && !!sh.formula(n.ref) && close(sh.value(n.ref), waccWant(ses)); };
const fcf = (ses, col) => val(ses, col + row('fcf'));
const g = ses => inp(ses, 'growth');
const perpWant = ses => fcf(ses, 'K') * (1 + g(ses)) / (W(ses) - g(ses));
const exitWant = ses => val(ses, 'J' + row('ebitda')) * inp(ses, 'exit');
const perpOk = ses => waccOk(ses) && fx(ses, C('tvPerp'), perpWant(ses));
const exitOk = ses => fx(ses, C('tvExit'), exitWant(ses));
const dfWant = (ses, col) => 1 / Math.pow(1 + W(ses), val(ses, col + row('t')));
const factorsOk = ses => waccOk(ses) && PROJ_COLS.every(col => fx(ses, col + row('df'), dfWant(ses, col)));
const pvSum = (ses, w) => PROJ_COLS.reduce((t, col) => t + fcf(ses, col) / Math.pow(1 + w, val(ses, col + row('t'))), 0);
const evWant = ses => { const w = W(ses); return pvSum(ses, w) + (inp(ses, 'tvMethod') === 1 ? perpWant(ses) / Math.pow(1 + w, val(ses, 'J' + row('t'))) : exitWant(ses) / Math.pow(1 + w, N(ses))); };
const ND = () => 'E' + R('Schedules', 'netDebt');
const evOk = ses => waccOk(ses) && fx(ses, C('ev'), evWant(ses)) && fx(ses, C('eqv'), val(ses, C('ev')) - sheetIn(ses, 'Schedules').value(ND()));
const gridAt = (ses, p) => [0, 1, 2, 3, 4].every(i => GRID.every(col => {
  const w = val(ses, 'C' + row(p + i)), x = val(ses, col + row(p + 'H'));
  const want = pvSum(ses, w) + (p === 'sg' ? fcf(ses, 'K') * (1 + x) / (w - x) / Math.pow(1 + w, val(ses, 'J' + row('t'))) : val(ses, 'J' + row('ebitda')) * x / Math.pow(1 + w, N(ses)));
  return fx(ses, col + row(p + i), want);
}));
const tableOk = ses => waccOk(ses) && (gridAt(ses, 'sg') || gridAt(ses, 'sm'));
const WACC_F = `=${C('eqW')}*${C('coe')}+${C('debtW')}*${C('atcod')}`;
const PERP_F = `=K${row('fcf')}*(1+Inputs!$C$${R('Inputs', 'growth')})/(WACC-Inputs!$C$${R('Inputs', 'growth')})`;
const EXIT_F = `=J${row('ebitda')}*Inputs!$C$${R('Inputs', 'exit')}`;
const DF_F = `=1/(1+WACC)^F${row('t')}`;
const EV_F = `=SUMPRODUCT(F${row('fcf')}:J${row('fcf')},F${row('df')}:J${row('df')})+CHOOSE(Inputs!$C$${R('Inputs', 'tvMethod')},${C('tvPerp')}*J${row('df')},${C('tvExit')}/(1+WACC)^${PN})`;
const EQ_F = `=${C('ev')}-Schedules!$${ND()[0]}$${ND().slice(1)}`;
const GRID_F = `=SUMPRODUCT($F$${row('fcf')}:$J$${row('fcf')},1/(1+$C${row('sm0')})^$F$${row('t')}:$J$${row('t')})+$J$${row('ebitda')}*D$${row('smH')}/(1+$C${row('sm0')})^${PN}`;
const KEYS = {
  wacc: `Ctrl+G "DCF!${C('wacc')}" ↵ "${WACC_F}" ↵ Alt M M D "WACC" ↵`,
  perp: `Ctrl+G "DCF!${C('tvPerp')}" ↵ "${PERP_F}" ↵`,
  exit: `↓ "${EXIT_F}" ↵`,
  factors: `Ctrl+G "DCF!F${row('df')}:J${row('df')}" ↵ "${DF_F}" Ctrl+↵`,
  ev: `Ctrl+G "DCF!${C('ev')}" ↵ "${EV_F}" ↵ Ctrl+G "DCF!${C('eqv')}" ↵ "${EQ_F}" ↵`,
  table: `Ctrl+G "DCF!D${row('sm0')}:H${row('sm4')}" ↵ "${GRID_F}" Ctrl+↵`,
};

export default {
  id: ID,
  chapter: 'finance-and-accounting',
  section: 'DCF',
  module: 'dcf',
  workbook: 'clearcoat-model',
  state: { before: 'B56C' },
  kind: 'challenge',
  title: 'Challenge: a DCF from a given free-cash-flow line',
  difficulty: 'hard',
  tags: ['challenge', 'model', 'dcf'],
  access: 'paid',
  minutes: 3,
  conventions: ['C3', 'C9', 'F4'],
  prerequisites: ['dcf-sensitivity'],
  brief: 'Five years of free cash flow are given on DCF, with EBITDA, the periods, the WACC inputs and the tables’ edges. Build the WACC, both terminal values, the mid-year factors, enterprise and equity value, and one sensitivity grid.',
  timeLimit: 180,
  pars: parsFrom(110, { pass: 178, pro: 135 }),
  seed: rng => challengeSeed(ID, rng),
  goals: [
    { id: 'wacc', text: `Build the WACC in ${C('wacc')} from the block above it and name the cell WACC.`,
      keys: KEYS.wacc, check: (s, ses) => settled(ses) && waccOk(ses) },
    { id: 'perp', text: `The perpetuity value in ${C('tvPerp')}, on the normalized cash flow in K${row('fcf')} at the growth on Inputs.`,
      keys: KEYS.perp, check: (s, ses) => settled(ses) && perpOk(ses) && liveFrom(ses, 'DCF', 'tvPerp', 'C', 'growth') },
    { id: 'exit', text: `The exit value in ${C('tvExit')}, FY31 EBITDA at the multiple on Inputs.`,
      keys: KEYS.exit, check: (s, ses) => settled(ses) && exitOk(ses) && liveFrom(ses, 'DCF', 'tvExit', 'C', 'exit') },
    { id: 'factors', text: `Mid-year discount factors across F${row('df')}:J${row('df')}, on the periods in row ${row('t')}.`,
      keys: KEYS.factors, check: (s, ses) => settled(ses) && factorsOk(ses) && liveFrom(ses, 'DCF', 'df', 'J', 'rf') },
    { id: 'ev', text: `Enterprise value in ${C('ev')} on the method the switch names, and equity value in ${C('eqv')} after FY26 net debt.`,
      keys: KEYS.ev, check: (s, ses) => settled(ses) && evOk(ses) && liveFrom(ses, 'DCF', 'ev', 'C', 'rf') },
    { id: 'table', text: 'Fill one sensitivity grid, perpetuity or exit multiple, against its edges.',
      keys: KEYS.table, check: (s, ses) => settled(ses) && tableOk(ses) },
  ],
  graders: [
    ses => waccOk(ses) ? { ok: true } : { ok: false, why: 'no cell named WACC gives the blended rate. Equity weight times cost of equity plus debt weight times the after-tax cost of debt, named so every factor reads it' },
    ses => perpOk(ses) && exitOk(ses) ? { ok: true } : { ok: false, why: 'a terminal value is off. The perpetuity grows the normalized cash flow a year over WACC less growth; the exit is FY31 EBITDA times the multiple' },
    ses => factorsOk(ses) ? { ok: true } : { ok: false, why: 'the discount factors don’t follow the periods. Each is 1 over (1 + WACC) to the t in row 20, mid-year from 0.5' },
    ses => evOk(ses) ? { ok: true } : { ok: false, why: 'enterprise or equity value is off. The present values plus the discounted terminal value on the switch’s method, the exit at the end of FY31, then net debt comes off' },
    ses => tableOk(ses) ? { ok: true } : { ok: false, why: 'neither grid values the business at its own row’s WACC and column’s input. One formula with $C on the WACC edge and a $ on the row of the edge across' },
  ],
  solution: Object.values(KEYS).join(' ').replace(/↵/g, 'Enter').replace(/↓/g, 'Down'),
};
