// Practice · Valuation — Napkin LBO (script-drills D80, Wave 1). Under the finished LBO, a napkin of
// its own: the bid, the fees, flat EBITDA, the leverage, the exit multiple, the debt left at the exit
// and the years held, typed in blue, and the rest of the page empty (formats stay). Uses and
// sources with the equity as what is left, exit equity and MOIC, and the annual return two ways,
// by the power and by RRI. Each cell is graded on the figure its reference formula gives on the
// learner's own inputs; the return must move with the bid.
import { valuationDrill } from './valuation-drills.js';
import { landsOn } from './pack-drills.js';
import { settled, sheetIn, liveVia, toScript, quoted, cellAt } from '../lessons/lib/bids-checks.js';

const S = 'LBO';
const fmt = ref => { const { value, formula, ...f } = cellAt('DONE', S, ref); void value; void formula; return f; };
const NUM = () => fmt('C38'), TOTAL = () => fmt('C39'), PCT = () => fmt('C108'), MULT = () => fmt('C106');
const INPUTS = [
  [152, 'Bid price (enterprise value)', 195000, () => fmt('C7')],
  [153, 'Fees (% of the price)', 0.02, () => fmt('C9')],
  [154, 'EBITDA, flat over the hold', 16600, () => fmt('C7')],
  [155, 'Debt (x EBITDA)', 5.5, () => ({ ...fmt('C8'), fontColor: 'blue' })],
  [156, 'Exit multiple (x EBITDA)', 11, () => ({ ...fmt('C8'), fontColor: 'blue' })],
  [157, 'Debt left at the exit', 30000, () => fmt('C7')],
  [158, 'Years held', 5, () => fmt('C7')],
];
/** The napkin's lines: row, label, the reference formula, its format. */
const LINES = [
  [160, 'Uses: the price', '=C152', NUM],
  [161, 'Uses: the fees', '=C152*C153', NUM],
  [162, 'Total uses', '=C160+C161', TOTAL],
  [163, 'Sources: debt', '=C155*C154', NUM],
  [164, 'Sources: equity, what is left', '=C162-C163', NUM],
  [165, 'Sources less uses (reads zero)', '=C163+C164-C162', NUM],
  [166, 'Exit enterprise value', '=C156*C154', NUM],
  [167, 'Exit equity, after the debt left', '=C166-C157', NUM],
  [168, 'MOIC (equity out over equity in)', '=C167/C164', MULT],
  [169, 'Annual return, by the power', '=C168^(1/C158)-1', PCT],
  [170, 'Annual return, by RRI', '=RRI(C158,C164,C167)', PCT],
  [171, 'The two returns less each other (reads zero)', '=ROUND(C169-C170,6)', NUM],
];
const WANT = Object.fromEntries(LINES.map(([r, , f]) => ['C' + r, f]));
const plant = () => {
  const p = { [`${S}!#rows`]: 190, [`${S}!B151`]: { value: 'Napkin LBO (flat EBITDA, the debt left at the exit given)', bold: true } };
  for (const [r, label, v, f] of INPUTS) { p[`${S}!B${r}`] = { value: label, indent: 1 }; p[`${S}!C${r}`] = { ...f(), value: v, fontColor: 'blue' }; }
  for (const [r, label, , f] of LINES) { p[`${S}!B${r}`] = r === 162 ? { value: label, bold: true, bt: true, bdbl: true } : { value: label, indent: 1 }; p[`${S}!C${r}`] = f(); }
  return p;
};
const PARTS = { uses: [160, 161, 162], sources: [163, 164, 165], exit: [166, 167, 168], returns: [169, 170, 171] };
const refs = id => PARTS[id].map(r => 'C' + r);
const ok = id => ses => landsOn(ses, S, refs(id), ref => WANT[ref]);
const zero = (ses, ref) => sheetIn(ses, S).value(ref) === 0;
const KEYS = Object.fromEntries(Object.entries(PARTS).map(([id, rows]) => [id, `Ctrl+G "${S}!C${rows[0]}" ↵ ` + rows.map(r => `${quoted(WANT['C' + r])} ↵`).join(' ↓ ')]));

export default valuationDrill({
  id: 'ch6-napkin',
  title: 'Napkin LBO',
  task: 'A bid, a leverage multiple, flat EBITDA and the debt left at the exit: sources and uses, MOIC and the annual return two ways.',
  module: 'lbo',
  state: { before: 'DONE' },
  plant,
  goals: [
    { id: 'uses', text: 'LBO C160:C162: the price, the fees on it, and total uses.', keys: KEYS.uses, check: (s, ses) => settled(ses) && ok('uses')(ses) },
    { id: 'sources', text: 'C163:C165: the debt at its multiple of EBITDA, the equity as what is left, and sources less uses at 0.', keys: KEYS.sources,
      check: (s, ses) => settled(ses) && ok('sources')(ses) && zero(ses, 'C165') },
    { id: 'exit', text: 'C166:C168: exit enterprise value, exit equity after the debt left in C157, and MOIC.', keys: KEYS.exit, check: (s, ses) => settled(ses) && ok('exit')(ses) },
    { id: 'returns', text: 'C169:C171: the annual return by the power and by RRI, and their difference at 0.', keys: KEYS.returns,
      check: (s, ses) => settled(ses) && ok('returns')(ses) && zero(ses, 'C171') },
  ],
  endState: [
    { text: 'The napkin ties, its two returns agree, and the return moves with the bid', check: (s, ses) => Object.keys(PARTS).every(id => ok(id)(ses)) && liveVia(ses, S, 'C170', ['C152']) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 215,
  route: 60,
});
