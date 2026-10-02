// Practice · Valuation — Three ways to a price (script-drills D17, D29, Wave 1). The finished comps
// page with the median column of the range block emptied (enterprise value on EBITDA, on sites and on
// washes, and the three equity values), and a grid laid under it: the three bids' equity values
// across, linked from Bids, and an empty three by three. Each bid over each implied equity value
// less one, from one formula with one row anchor and one column anchor. The pack prices on its own
// three medians (EBITDA, sites, washes), so the third way is washes rather than revenue.
import { valuationDrill, emptied } from './valuation-drills.js';
import { landsOn } from './pack-drills.js';
import { settled, built, liveVia, toScript, cellAt } from '../lessons/lib/bids-checks.js';

const S = 'Comps';
const EV = ['D45', 'D47', 'D49'], EQ = ['D51', 'D52', 'D53'];
const BIDS = ['C', 'D', 'E'], HEAD = 58, GRID_ROWS = [59, 60, 61];
const GRID = GRID_ROWS.flatMap(r => BIDS.map(c => c + r));
/** C59 = C$58/$D51-1: the bid's column anchored on its row, the implied value's row read from column D. */
const gridFormula = ref => { const c = ref[0], r = +ref.slice(1); return `=${c}$${HEAD}/$D${r - 8}-1`; };
const fmt = ref => { const { value, formula, ...f } = cellAt('DONE', S, ref); void value; void formula; return f; };
const plant = () => {
  const p = emptied(S, [...EV, ...EQ]);
  p[`${S}!B56`] = { value: 'Each bid against each implied equity value (the medians)', bold: true };
  BIDS.forEach((c, i) => {
    p[`${S}!${c}57`] = { value: `Bid ${'ABC'[i]}`, bold: true, align: 'r' };
    p[`${S}!${c}${HEAD}`] = { ...fmt('C51'), bold: false, bt: false, formula: `=Bids!${c}11`, fontColor: 'green' };
  });
  p[`${S}!B${HEAD}`] = { value: 'Equity value at the headline', indent: 1 };
  ['Above or below equity on EBITDA', 'Above or below equity on sites', 'Above or below equity on washes'].forEach((t, i) => { p[`${S}!B${GRID_ROWS[i]}`] = { value: t, indent: 1 }; });
  for (const ref of GRID) p[`${S}!${ref}`] = { fmtStyle: 'percent', decimals: 1 };
  return p;
};
const KEYS = {
  ev: `Ctrl+G "${S}!D45" ↵ "=D44*$J$17" ↵ ↓ ↓ "=D46*$R$17*1000" ↵ ↓ ↓ "=D48*$S$17" ↵`,
  equity: `Ctrl+G "${S}!D51" ↵ "=D45+D50" ↵ ↓ "=D47+D50" ↵ ↓ "=D49+D50" ↵`,
  grid: `Ctrl+G "${S}!C59:E61" ↵ "${gridFormula('C59')}" Ctrl+↵`,
};
const evOk = ses => built(ses, S, EV);
const eqOk = ses => landsOn(ses, S, EQ, ref => `=D${45 + 2 * (+ref.slice(1) - 51)}+D50`);
const gridOk = ses => landsOn(ses, S, GRID, gridFormula);

export default valuationDrill({
  id: 'ch6-three-ways-to-a-price',
  title: 'Three ways to a price',
  task: 'Three median multiples, three implied equity values, three bids: which bid clears which?',
  module: 'trading-comps',
  state: { before: 'DONE' },
  plant,
  goals: [
    { id: 'ev', text: 'Comps D45, D47 and D49: each median multiple above times Clearcoat’s EBITDA, sites and washes in row 17.', keys: KEYS.ev,
      check: (s, ses) => settled(ses) && evOk(ses) },
    { id: 'equity', text: 'D51:D53: each of the three enterprise values less the net debt in D50.', keys: KEYS.equity,
      check: (s, ses) => settled(ses) && evOk(ses) && eqOk(ses) },
    { id: 'grid', text: 'C59:E61: each bid in row 58 over each equity value in D51:D53, less one, from one formula filled both ways.', keys: KEYS.grid,
      check: (s, ses) => settled(ses) && gridOk(ses) },
  ],
  endState: [
    { text: 'The three implied values tie, and the grid moves with the bids and with the multiples', check: (s, ses) => evOk(ses) && eqOk(ses) && gridOk(ses) && liveVia(ses, S, 'D60', ['Bids!D6']) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 130,
  route: 45,
});
