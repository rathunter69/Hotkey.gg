// Practice · Valuation — LTM two ways (script-drills D22, D31, Wave 1). The finished comps page with
// the LTM column emptied and the filings route laid out for three operators: Pinnacle (a December
// year-end) and Riverbend and Meridian (March year-ends). LTM by SUMIFS over the quarters in the
// twelve months to the LTM date, then from the filings (the fiscal year, plus this year's quarters,
// less last year's), and the difference reading zero. Graded on the figures the reference formulas
// give on the learner's cells; the SUMIFS must move with the LTM date (the what-if of the sketch).
import { valuationDrill, emptied, refsOf, fillFrom } from './valuation-drills.js';
import { landsOn } from './pack-drills.js';
import { settled, built, sheetIn, liveVia, toScript, quoted, calls, cellAt } from '../lessons/lib/bids-checks.js';

const S = 'Comps';
const SUMIFS = refsOf('P21:P26');
const FILINGS = { R21: '=K21+(I21+J21)-(E21+F21)', R22: '=L22+J22-F22', R24: '=L24+J24-F24' };
const DIFFS = { S21: '=ROUND(R21-P21,2)', S22: '=ROUND(R22-P22,2)', S24: '=ROUND(R24-P24,2)' };
const fmt = ref => { const { value, formula, ...f } = cellAt('DONE', S, ref); void value; void formula; return f; };
const plant = () => ({
  ...emptied(S, [...SUMIFS, 'R21', 'S21']),
  [`${S}!R22`]: fmt('P22'), [`${S}!R24`]: fmt('P22'), [`${S}!S22`]: fmt('S21'), [`${S}!S24`]: fmt('S21'),
});
const want = ref => FILINGS[ref] || DIFFS[ref];
const sumifs = ses => built(ses, S, SUMIFS) && SUMIFS.every(r => calls(sheetIn(ses, S), r, ['SUMIFS']));
const ok = (ses, refs) => landsOn(ses, S, refs, want);
const zeros = ses => Object.keys(DIFFS).every(r => sheetIn(ses, S).value(r) === 0);
const KEYS = {
  sumifs: fillFrom(S, 'P21:P26'),
  pinnacle: `Ctrl+G "${S}!R21" ↵ ${quoted(FILINGS.R21)} ↵`,
  march: `↓ ${quoted(FILINGS.R22)} ↵ ↓ ↓ ${quoted(FILINGS.R24)} ↵`,
  diffs: `Ctrl+G "${S}!S21" ↵ ${quoted(DIFFS.S21)} ↵ ↓ ${quoted(DIFFS.S22)} ↵ ↓ ↓ ${quoted(DIFFS.S24)} ↵`,
};

export default valuationDrill({
  id: 'ch6-ltm-two-ways',
  title: 'LTM two ways',
  task: 'LTM EBITDA from the fiscal year and the year to date, tied to the four quarters.',
  module: 'trading-comps',
  state: { before: 'DONE' },
  plant,
  goals: [
    { id: 'sumifs', text: 'Comps P21:P26: LTM EBITDA as a SUMIFS over the quarters dated after C30 and up to the LTM date in C29.', keys: KEYS.sumifs,
      check: (s, ses) => settled(ses) && sumifs(ses) },
    { id: 'pinnacle', text: 'R21: Pinnacle from its filings, the fiscal year in K plus 2026’s two quarters less 2025’s.', keys: KEYS.pinnacle,
      check: (s, ses) => settled(ses) && ok(ses, ['R21']) },
    { id: 'march', text: 'R22 and R24: Riverbend and Meridian, March year-ends, the fiscal year in L plus June’s quarter less last June’s.', keys: KEYS.march,
      check: (s, ses) => settled(ses) && ok(ses, ['R22', 'R24']) },
    { id: 'diffs', text: 'S21, S22 and S24: each filings figure less its SUMIFS, rounded, reading 0.', keys: KEYS.diffs,
      check: (s, ses) => settled(ses) && ok(ses, Object.keys(DIFFS)) && zeros(ses) },
  ],
  endState: [
    { text: 'Both routes tie for all three operators, and the SUMIFS moves with the LTM date', check: (s, ses) => sumifs(ses) && ok(ses, [...Object.keys(FILINGS), ...Object.keys(DIFFS)]) && zeros(ses) && liveVia(ses, S, 'P22', ['C29']) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 220,
  route: 50,
});
