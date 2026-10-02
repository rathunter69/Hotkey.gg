// Chapter 6 · 6.4.1 Three bids side by side: headline, structure, certainty (clearcoat-valuation, B641 → B642)
// The three term sheets arrive typed on Bids (headline, earnout and its target, the rollover share,
// the conditions); every line under them waits, formatted. The learner builds equity at the headline,
// the rollover and cash at close, prices the earnout on its odds and the rollover at the sponsor's
// return discounted at the cost of equity, reads the rolled stake two ways, weighs each bid by the
// odds it closes, ranks the three three ways, and writes the reason beside the odds. Each line is
// graded on the figure its formula gives on the learner's own cells; the odds are typed inputs.
import { settled, built, typedAt, liveVia, linked, sheetIn, formulaAt, R, rowRefs, plantFrom, fill, enter, toScript } from './lib/bids-checks.js';

const B = 'Bids';
const row = key => R(B, key);
const C = key => 'C' + row(key);
const span = (a, b) => `C${row(a)}:E${row(b)}`;
const F = key => formulaAt('DONE', B, C(key));
const lines = keys => rowRefs(B, keys);
const REASON = 'FY27 Base case EBITDA is below the target; the Management case clears it';
const TERMS = ['headline', 'earnout', 'earnTarget', 'rollShare', 'condition'];
const WHOLE = [...lines(TERMS), ...['rollRet', 'rollYears', 'rollDisc'].map(k => `F${row(k)}`)].map(r => `${B}!${r}`);

const ok = {
  close: ses => built(ses, B, lines(['eqHead', 'rollAmt', 'cashClose'])),
  earnout: ses => typedAt(ses, B, C('earnProb'), 0.5) && built(ses, B, lines('earnEV')),
  inputs: ses => linked(ses, B, C('rollRet'), `LBO!C${R('LBO', 'irr')}`) && linked(ses, B, C('rollDisc'), `DCF!C${R('DCF', 'coe')}`) && typedAt(ses, B, C('rollYears'), 3),
  priced: ses => built(ses, B, lines(['rollVal', 'priced'])),
  stake: ses => built(ses, B, lines(['rollOld', 'rollNew'])),
  expected: ses => [0.95, 0.85, 0.75].every((v, i) => typedAt(ses, B, 'CDE'[i] + row('certainty'), v)) && built(ses, B, lines('expected')),
  rank: ses => built(ses, B, lines(['rankHead', 'rankPriced', 'rankExp'])),
  reason: ses => { const sh = sheetIn(ses, B); const v = sh && sh.value('F' + row('earnProb')); return !sh.formula('F' + row('earnProb')) && typeof v === 'string' && v.trim().length >= 10; },
};
const KEYS = {
  close: [fill(B, span('eqHead', 'eqHead'), F('eqHead')), fill(B, span('rollAmt', 'rollAmt'), F('rollAmt')), fill(B, span('cashClose', 'cashClose'), F('cashClose'))].join(' '),
  earnout: `${enter(B, C('earnProb'), 50)} ${fill(B, span('earnEV', 'earnEV'), F('earnEV'))}`,
  inputs: `Ctrl+G "${B}!${C('rollRet')}" ↵ "${F('rollRet')}" ↵ ↓ "3" ↵ ↓ "${F('rollDisc')}" ↵`,
  priced: `${fill(B, span('rollVal', 'rollVal'), F('rollVal'))} ${fill(B, span('priced', 'priced'), F('priced'))}`,
  stake: `${fill(B, span('rollOld', 'rollOld'), F('rollOld'))} ${fill(B, span('rollNew', 'rollNew'), F('rollNew'))}`,
  expected: `Ctrl+G "${B}!${C('certainty')}" ↵ "95" Tab "85" Tab "75" ↵ ${fill(B, span('expected', 'expected'), F('expected'))}`,
  rank: ['rankHead', 'rankPriced', 'rankExp'].map(k => fill(B, span(k, k), F(k))).join(' '),
  reason: enter(B, 'F' + row('earnProb'), REASON),
};

export default {
  id: 'bids-side-by-side',
  chapter: 'valuation',
  section: 'The bids and the waterfall',
  module: 'bids-and-waterfall',
  workbook: 'clearcoat-valuation',
  state: { before: 'B641', after: 'B642' },
  get plant() { return plantFrom('B641', 'B642', { whole: WHOLE }); },
  title: 'Three bids side by side: headline, structure, certainty',
  difficulty: 'hard',
  tags: ['valuation', 'bids', 'earnout', 'rollover'],
  access: 'paid',
  minutes: 8,
  headline: '=',
  conventions: ['C3', 'B2', 'B6'],
  teaches: ['bid-pricing'],
  uses: ['f4-anchor', 'relative-absolute', 'ctrl-enter-fill', 'go-to', 'cross-sheet-ref', 'if-function', 'large-small-rank', 'arrow-keys', 'tab-commits', 'enterprise-to-equity', 'irr', 'wacc'],
  prerequisites: ['challenge-paper-lbo'],
  brief: 'A bid is a headline price and a structure, and the structure changes what it’s worth. An earnout is paid later if a target is hit, so it’s worth its amount times the odds; a rollover keeps part of the owners’ equity in the new company, so it isn’t cash and it carries that company’s risk; a financing condition is a chance the deal never closes. The three term sheets are on Bids: price each one to an expected value and rank them. The key is `=`.',
  goals: [
    { id: 'cash-at-close', teach: 'Equity at the headline is the price less net debt at closing, which is repaid first. The rollover is the share of that equity the owners keep instead of cash, so cash at close is the headline less the earnout and the rollover.',
      text: `On Bids, build rows ${row('eqHead')} to ${row('cashClose')} across C:E: equity at the headline, the rollover amount, then cash at close.`,
      keys: KEYS.close, requires: ['bid-pricing', 'enterprise-to-equity', 'f4-anchor', 'relative-absolute', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range ${span('eqHead', 'cashClose')} · Net debt at closing is ${C('netDebtClose')}; anchor it with F4 so it holds as the row fills.`,
      check: (s, ses) => settled(ses) && ok.close(ses) },
    { id: 'earnout', teach: 'An earnout is paid only if the target is hit, so today it is worth its amount times the odds. The odds are an input, typed once in blue, and every bid reads that one cell.',
      text: `Type 50 in ${C('earnProb')}, the earnout odds, then its expected value in ${span('earnEV', 'earnEV')} as ${F('earnEV')}.`,
      keys: KEYS.earnout, requires: ['bid-pricing', 'f4-anchor', 'ctrl-enter-fill', 'go-to'], convention: 'B6',
      hintStuck: `pulse cell ${C('earnProb')} · A percent cell takes 50 as 50%; only bid B carries an earnout, so C and E read zero.`,
      check: (s, ses) => settled(ses) && ok.earnout(ses) && liveVia(ses, B, 'D' + row('earnEV'), [C('earnProb')]) },
    { id: 'rollover-inputs', teach: 'The rolled stake grows with the sponsor’s own return, the LBO’s IRR, for the three years to the exit. A stake that risky is discounted back at the cost of equity, not at a deposit rate.',
      text: `Link ${C('rollRet')} to the LBO’s IRR, type 3 years in ${C('rollYears')}, and link ${C('rollDisc')} to the cost of equity on DCF.`,
      keys: KEYS.inputs, requires: ['cross-sheet-ref', 'irr', 'wacc', 'arrow-keys', 'go-to'], convention: 'B2',
      hintStuck: `pulse range ${C('rollRet')}:${C('rollDisc')} · The IRR is LBO C${R('LBO', 'irr')} and the cost of equity DCF C${R('DCF', 'coe')}.`,
      check: (s, ses) => settled(ses) && ok.inputs(ses) },
    { id: 'priced', teach: 'The priced value is cash at close plus what the earnout and the rollover are worth today. It is the figure to compare across bids, not the headline.',
      text: `Price the rollover in ${span('rollVal', 'rollVal')} on ${C('rollRet')}, ${C('rollYears')} and ${C('rollDisc')}, then total the priced value in ${span('priced', 'priced')}.`,
      keys: KEYS.priced, requires: ['bid-pricing', 'f4-anchor', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range ${span('rollVal', 'priced')} · The rollover amount times one plus the return to the years, over one plus the cost of equity to the years.`,
      check: (s, ses) => settled(ses) && ok.priced(ses) && liveVia(ses, B, 'E' + row('rollVal'), [C('rollYears')]) },
    { id: 'stake', teach: 'Debt funds nearly half the price, so a fifth of the old equity is about a quarter of the new company’s. The sponsor’s equity is on the LBO’s sources, row 43.',
      text: `Show the rolled stake two ways in ${span('rollOld', 'rollNew')}: as a share of the old equity, then of the new company’s equity.`,
      keys: KEYS.stake, requires: ['cross-sheet-ref', 'if-function', 'ctrl-enter-fill', 'go-to'], convention: 'B2',
      hintStuck: `pulse range ${span('rollOld', 'rollNew')} · The rollover amount over the sponsor’s equity plus the rollover, and zero where nothing rolls.`,
      check: (s, ses) => settled(ses) && ok.stake(ses) },
    { id: 'expected', teach: 'A financing condition is a chance the deal never closes. The expected value is the priced value times the odds it closes: the third way to read a bid.',
      text: `Type the odds each bid closes in ${span('certainty', 'certainty')} (95, 85 and 75), then the expected value in ${span('expected', 'expected')}.`,
      keys: KEYS.expected, requires: ['bid-pricing', 'tab-commits', 'ctrl-enter-fill', 'go-to'], convention: 'B6',
      hintStuck: `pulse range ${span('certainty', 'expected')} · Tab moves right after each entry; the expected value is ${F('expected')}.`,
      check: (s, ses) => settled(ses) && ok.expected(ses) },
    { id: 'rank', text: `Rank the bids with RANK in ${span('rankHead', 'rankExp')}: on the headline, on the priced value, then on the expected value.`,
      keys: KEYS.rank, requires: ['large-small-rank', 'f4-anchor', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range ${span('rankHead', 'rankExp')} · ${F('rankHead')} on the headline; anchor the three bids with F4.`,
      check: (s, ses) => settled(ses) && ok.rank(ses) },
    { id: 'reason', teach: 'Every probability on the page is an input with its reason beside it. The board will argue with the odds, not the arithmetic, so give them the reason to argue with.',
      text: `Type the reason beside the odds in F${row('earnProb')}: "${REASON}".`,
      keys: KEYS.reason, requires: ['go-to'], convention: 'B6',
      hintStuck: `pulse cell F${row('earnProb')} · The notes column holds a reason for every input above it.`,
      check: (s, ses) => settled(ses) && ok.reason(ses) },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "${B}!${C('earnProb')}" Enter "90" Enter Ctrl+G "${B}!D${row('rankPriced')}" Enter`, cadence: 360 },
      text: `Does it tie? Watch the earnout odds in ${C('earnProb')} go to 90%: bid B’s priced value overtakes bid C, and its rank in D${row('rankPriced')} moves to 1.`, requires: [],
      hintStuck: `pulse cell D${row('rankPriced')} · Only bid B carries an earnout, so only its priced value moves.`,
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Each bid is priced from its term sheet: cash at close, the earnout on its odds, the rollover at the sponsor’s return', check: (s, ses) => ok.close(ses) && ok.earnout(ses) && ok.inputs(ses) && ok.priced(ses) },
    { text: 'Each bid carries an expected value, and the three are ranked three ways', check: (s, ses) => ok.stake(ses) && ok.expected(ses) && ok.rank(ses) },
  ],
  closing: [
    'Each bid has three prices, and the order changes with each one: B leads on the headline, C on the priced value, A on the expected value.',
    'Best practice: every probability is an input with its reason beside it. The board will argue with the odds, not the arithmetic, and a reason is what the argument starts from.',
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
};
