// Practice · Finance and Accounting — Normalize the year (script-drills D35). FY31 still opens six
// sites, so its free cash flow carries growth capex a terminal value should not. The finished DCF
// page with the Normalized column (K8:K16) emptied, formats kept, and the perpetuity in C27 pointed
// at the raw FY31 figure in J16. Build the normalized year (FY31's NOPAT, capex equal to
// depreciation, the steady working-capital figure on Inputs, free cash flow) and repoint the
// perpetuity at it. Graded on the finished model's figures, what-ifs on the life and the steady
// working-capital input, the perpetuity reading K16 and not J16, and the raw FY31 column unchanged.
import { planting, modelDrill, doneCell } from './model-drills.js';
import { settled, like, moves, sheetIn, reads } from '../lessons/lib/model-checks.js';
import { norm } from '../lessons/lib/model-build.js';

const D = 'DCF';
const K = r => 'K' + r;
const NOPAT = [8, 9, 10, 11, 12].map(K), CAPEX = [13, 14].map(K), FCF = [15, 16].map(K);
const RAW = [8, 9, 10, 11, 12, 13, 14, 15, 16].map(r => 'J' + r);
const PERP = '=K16*(1+Inputs!$C$95)/(WACC-Inputs!$C$95)';
const rawKept = ses => { const sh = sheetIn(ses, D); return like(ses, D, RAW) && RAW.every(r => norm(sh.formula(r)) === norm(doneCell(D, r).formula)); };
const repointed = ses => { const sh = sheetIn(ses, D); return reads(sh, 'C27', ['K16']) && !reads(sh, 'C27', ['J16']) && like(ses, D, ['C27']); };
const KEYS = {
  nopat: `Ctrl+G "${D}!K8:K9" ↵ "=J8" Ctrl+↵ Ctrl+G "${D}!J10:K12" ↵ Ctrl+R`,
  capex: `Ctrl+G "${D}!J13:K13" ↵ Ctrl+R Ctrl+G "${D}!K14" ↵ "=-K13" ↵`,
  fcf: `Ctrl+G "${D}!K15" ↵ "=Inputs!$C$98" ↵ Ctrl+G "${D}!J16:K16" ↵ Ctrl+R`,
  repoint: `Ctrl+G "${D}!C27" ↵ "${PERP}" ↵`,
};

export default modelDrill({
  id: 'ch5-normalize-the-year',
  title: 'Normalize the year',
  task: 'FY31 still opens six sites, so build the normalized year beside it and feed the perpetuity from that.',
  module: 'dcf',
  state: { before: 'DONE' },
  plant: () => planting({ blank: { [D]: [...NOPAT, ...CAPEX, ...FCF] }, set: { [`${D}!C27`]: { formula: PERP.replace('K16', 'J16') } } }),
  goals: [
    { id: 'nopat', text: 'Carry FY31 into the Normalized column, DCF K8:K12: EBITDA and depreciation from J, then EBIT, tax and NOPAT.', keys: KEYS.nopat,
      check: (s, ses) => settled(ses) && like(ses, D, NOPAT) },
    { id: 'capex', text: 'Set capex equal to depreciation in DCF K13:K14: depreciation added back in K13, capex in K14 as its negative.', keys: KEYS.capex,
      check: (s, ses) => settled(ses) && like(ses, D, CAPEX) && !reads(sheetIn(ses, D), 'K14', ['J14']) && moves(ses, `${D}!K14`, 'Inputs!C63') },
    { id: 'fcf', text: 'Link the steady working-capital figure in Inputs C98 into DCF K15, then free cash flow in K16.', keys: KEYS.fcf,
      check: (s, ses) => settled(ses) && like(ses, D, FCF) && moves(ses, `${D}!K15`, 'Inputs!C98') },
    { id: 'repoint', text: 'Repoint the perpetuity in DCF C27 from the raw FY31 cash flow in J16 to the normalized one in K16.', keys: KEYS.repoint,
      check: (s, ses) => settled(ses) && repointed(ses) },
  ],
  endState: [
    { text: 'The normalized column is the finished model’s, the perpetuity reads it, and the raw FY31 column has not moved', check: (s, ses) => like(ses, D, [...NOPAT, ...CAPEX, ...FCF]) && repointed(ses) && rawKept(ses) },
  ],
  solution: Object.values(KEYS).join(' ').replace(/↵/g, 'Enter'),
  optimalKeys: 160,
  route: 60,
});
