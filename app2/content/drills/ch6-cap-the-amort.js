// Practice · Valuation — Cap the amortization (script-drills D87, Wave 1). The finished LBO with the
// senior loan's mandatory amortization written without its cap: a typed percent of the original
// loan every year, whatever is left. Run it at 40% and the closing balance goes below zero; wrap the
// line in MIN against the opening balance; put the term sheet's 5% back. Graded on the amortization
// line landing where the pack's capped formula lands, at 5% and again at 40% (the what-if), with no
// closing balance below zero.
import { valuationDrill, refsOf, fillFrom } from './valuation-drills.js';
import { settled, built, sheetIn, typedAt, cellAt, toScript, calls } from '../lessons/lib/bids-checks.js';
import { under } from '../lessons/lib/model-checks.js';

const S = 'LBO', PCT = 'C12', HIGH = 0.4;
const AMORT = refsOf('D73:H73'), CLOSE = refsOf('D75:H75');
const plant = () => Object.fromEntries(AMORT.map(ref => { const { formula, value, ...f } = cellAt('DONE', S, ref); void formula; void value; return [`${S}!${ref}`, { ...f, formula: '=-$C$12*$C$75' }]; }));
const negative = ses => CLOSE.some(r => sheetIn(ses, S).value(r) < -0.01);
const capped = ses => { const sh = sheetIn(ses, S); return AMORT.every(r => calls(sh, r, ['MIN'])) && built(ses, S, AMORT) && !negative(ses); };
/** Capped at 5% and again at 40% (the what-if recalculates the whole pack, so one answer per key pressed is kept). */
const memo = new WeakMap();
const both = ses => {
  const sh = sheetIn(ses, S), at = [(ses.keyLog || []).length, sh.value(PCT), ...AMORT.map(r => sh.formula(r))].join('|'), m = memo.get(ses);
  if (m && m.at === at) return m.ok;
  const ok = capped(ses) && under(ses, { [`${S}!${PCT}`]: HIGH }, x => capped(x));
  memo.set(ses, { at, ok });
  return ok;
};
const KEYS = { high: `Ctrl+G "${S}!${PCT}" ↵ "40" ↵`, cap: fillFrom(S, 'D73:H73'), back: `Ctrl+G "${S}!${PCT}" ↵ "5" ↵` };

export default valuationDrill({
  id: 'ch6-cap-the-amort',
  title: 'Cap the amortization',
  task: 'At 40% a year the senior loan’s balance goes negative in year three, so cap the repayment.',
  module: 'lbo',
  state: { before: 'DONE' },
  plant,
  goals: [
    { id: 'high', text: 'Type 40% in LBO C12 and watch the senior loan’s closing balance in row 75 go below zero.', keys: KEYS.high,
      check: (s, ses) => settled(ses) && typedAt(ses, S, PCT, HIGH) && negative(ses) },
    { id: 'cap', text: 'Cap D73:H73 with MIN against the opening balance in row 72, so no closing balance in row 75 goes below zero.', keys: KEYS.cap,
      check: (s, ses) => settled(ses) && typedAt(ses, S, PCT, HIGH) && capped(ses) },
    { id: 'back', text: 'Put the term sheet’s 5% back in C12.', keys: KEYS.back,
      check: (s, ses) => settled(ses) && typedAt(ses, S, PCT, 0.05) && both(ses) },
  ],
  endState: [
    { text: 'The amortization is capped at the opening balance, at 5% and at 40%, and no balance goes below zero', check: (s, ses) => typedAt(ses, S, PCT, 0.05) && both(ses) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 70,
  route: 40,
});
