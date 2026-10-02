// Chapter 6 · 6.4.3 Your stake: what your options are worth under each bid (clearcoat-valuation, B643 → B644)
// The option plan's inputs sit on Bids (the strike valuation, the 0.2% share, vesting at a sale) and
// the waterfall above is built. The learner reads the plan, values bid A's options with MAX (the
// equity value less the strike, times the share, floored at zero), fills it across with Ctrl+R,
// splits off the earnout's share that waits, and formats the two lines. Graded on the figures each
// formula gives on the learner's own cells.
import { settled, built, liveVia, selecting, carries, formulaAt, R, rowRefs, plantFrom, toScript, quoted } from './lib/bids-checks.js';

const B = 'Bids';
const row = key => R(B, key);
const C = key => 'C' + row(key);
const F = key => formulaAt('DONE', B, C(key));
const span = key => `C${row(key)}:E${row(key)}`;
const DOLLAR = '$#,##0_);($#,##0);"-"_)', DESK = '#,##0_);(#,##0);"-"_)';
const PLAN = `${C('strikeVal')}:${C('vest')}`;
const drop = Object.fromEntries(rowRefs(B, ['yourVal', 'yourDef']).map(r => [`${B}!${r}`, ['fmtStyle', 'numFmt']]));
const fmt = (range, code) => `Ctrl+G "${B}!${range}" ↵ Ctrl+1 N Tab End Alt+T ${quoted(code)} ↵`;

const ok = {
  bidA: ses => built(ses, B, [C('yourVal')]),
  across: ses => built(ses, B, rowRefs(B, 'yourVal')),
  deferred: ses => built(ses, B, rowRefs(B, 'yourDef')),
  dollar: ses => carries(ses, B, rowRefs(B, 'yourVal'), 'numFmt', DOLLAR),
  desk: ses => carries(ses, B, rowRefs(B, 'yourDef'), 'numFmt', DESK),
};
const KEYS = {
  plan: `Ctrl+G "${B}!${PLAN}" ↵`,
  bidA: `Ctrl+G "${B}!${C('yourVal')}" ↵ ${quoted(F('yourVal'))} ↵`,
  across: `Ctrl+G "${B}!${span('yourVal')}" ↵ Ctrl+R`,
  deferred: `Ctrl+G "${B}!${span('yourDef')}" ↵ ${quoted(F('yourDef'))} Ctrl+↵`,
  dollar: fmt(span('yourVal'), DOLLAR),
  desk: fmt(span('yourDef'), DESK),
};

export default {
  id: 'your-stake',
  chapter: 'valuation',
  section: 'The bids and the waterfall',
  module: 'bids-and-waterfall',
  workbook: 'clearcoat-valuation',
  state: { before: 'B643', after: 'B644' },
  get plant() { return plantFrom('B643', 'B644', { drop }); },
  title: 'Your stake: what your options are worth under each bid',
  difficulty: 'medium',
  tags: ['valuation', 'bids', 'options'],
  access: 'paid',
  minutes: 6,
  headline: 'MAX',
  conventions: ['B4', 'E3', 'D4'],
  teaches: ['option-value'],
  uses: ['min-max-cap', 'f4-anchor', 'relative-absolute', 'fill-down-right', 'iferror-function', 'ctrl-enter-fill', 'custom-number-format', 'format-cells-dialog', 'go-to'],
  prerequisites: ['the-waterfall'],
  brief: 'You hold options over 0.2% of the company, fully diluted, with a strike set when the equity was worth $40m. An option is worth the equity value less the strike, times your share, or nothing if the strike is above the price, and MAX handles that. Three bids, three numbers, and one of them is yours. Build the line under the waterfall. The key is `MAX`.',
  goals: [
    { id: 'plan', teach: 'The plan’s three inputs are typed once and sourced to the option plan: the strike valuation, your share, fully diluted, and how much vests at a sale. Every bid’s line reads them.',
      text: `Select the option plan’s inputs on Bids, ${PLAN}: the strike valuation, your 0.2% share and vesting at a sale.`,
      keys: KEYS.plan, requires: ['go-to'], convention: 'B6',
      hintStuck: `pulse range ${PLAN} · Ctrl+G takes a range as well as a cell.`,
      check: (s, ses) => settled(ses) && selecting(ses, B, PLAN) },
    { id: 'bid-a', teach: 'An option pays the equity value times your share less the strike times your share, and never less than nothing: MAX(…, 0) floors it. Vesting at 100% means all of it is yours at a sale.',
      text: `Value your options under bid A in ${C('yourVal')}: ${F('yourVal')}.`,
      keys: KEYS.bidA, requires: ['option-value', 'min-max-cap', 'f4-anchor', 'go-to'], convention: 'B4',
      hintStuck: `pulse cell ${C('yourVal')} · Equity value is row ${row('wfEq')} of the waterfall; anchor the plan’s inputs with F4.`,
      check: (s, ses) => settled(ses) && ok.bidA(ses) && liveVia(ses, B, C('yourVal'), [C('strikeVal')]) },
    { id: 'across', text: `Select ${span('yourVal')} and fill bid A’s value across to bids B and C with Ctrl+R.`,
      keys: KEYS.across, requires: ['fill-down-right', 'relative-absolute', 'go-to'], convention: 'E3',
      hintStuck: `pulse range ${span('yourVal')} · The equity value moves with the column; the plan’s inputs stay anchored.`,
      check: (s, ses) => settled(ses) && ok.across(ses) },
    { id: 'deferred', teach: 'Bid B pays part of its price later, so part of your value waits with it: the earnout’s share of the priced value is the share of yours that is deferred.',
      text: `Show the earnout’s share of yours, deferred, in ${span('yourDef')}: ${F('yourDef')}.`,
      keys: KEYS.deferred, requires: ['option-value', 'iferror-function', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range ${span('yourDef')} · IFERROR returns zero where a bid has no priced value to divide by.`,
      check: (s, ses) => settled(ses) && ok.deferred(ses) },
    { id: 'dollar', text: `Format ${span('yourVal')} with the code ${DOLLAR}, the first line of the block carrying the $.`,
      keys: KEYS.dollar, requires: ['custom-number-format', 'format-cells-dialog', 'go-to'], convention: 'D4',
      hintStuck: `pulse range ${span('yourVal')} · Ctrl+1, N, then type the code into the Custom box.`,
      check: (s, ses) => settled(ses) && ok.dollar(ses) },
    { id: 'desk', text: `Format ${span('yourDef')} with the desk code ${DESK}, no $ on the line under it.`,
      keys: KEYS.desk, requires: ['custom-number-format', 'format-cells-dialog', 'go-to'], convention: 'D4',
      hintStuck: `pulse range ${span('yourDef')} · The same route as the line above, without the $.`,
      check: (s, ses) => settled(ses) && ok.desk(ses) },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "${B}!${C('optShare')}" Enter "0.4" Enter Ctrl+G "${B}!${C('yourVal')}" Enter`, cadence: 360 },
      text: `Does it tie? Watch your share in ${C('optShare')} go from 0.2% to 0.4%: your line doubles and the owners’ lines hold, since the pool already funds you.`, requires: [],
      hintStuck: `pulse range ${span('yourVal')} · Your options sit inside the 5% pool, so the owners never pay for them twice.`,
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Your options are valued under each bid, floored at zero, with the earnout’s share deferred', check: (s, ses) => ok.across(ses) && ok.deferred(ses) },
    { text: 'The two lines carry the book’s formats', check: (s, ses) => ok.dollar(ses) && ok.desk(ses) },
  ],
  closing: [
    'Three bids are priced, and the line at the bottom of the waterfall is yours.',
    'Best practice: a manager’s stake is modeled with the same rigor as the owners’ and shown on the page. It’s the line the board forgets and the manager doesn’t, and the note under it says the pool already pays for it.',
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
};
