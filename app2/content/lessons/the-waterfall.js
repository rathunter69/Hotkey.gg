// Chapter 6 · 6.4.2 From enterprise value to the owners' proceeds: the waterfall (clearcoat-valuation, B642 → B643)
// The waterfall block on Bids waits, formatted but for two things the lesson teaches: the deductions'
// parentheses (the desk number format) and the proceeds line's double bottom. The learner builds bid
// A's column top to bottom (enterprise value from the priced value, net debt, fees and the option
// pool each a MIN of the claim and what is left, the proceeds split by ownership, a check), fills
// it across with Ctrl+R, then formats it as the book prints it. Each line is graded on the figure
// its formula gives on the learner's own cells.
import { settled, built, liveVia, reads, sheetIn, carries, formulaAt, R, rowRefs, plantFrom, toScript, quoted } from './lib/bids-checks.js';

const B = 'Bids';
const row = key => R(B, key);
const C = key => 'C' + row(key);
const F = key => formulaAt('DONE', B, C(key));
const DESK = '#,##0_);(#,##0);"-"_)';
const WF = ['wfEV', 'wfND', 'wfEq', 'wfFees', 'wfPool', 'wfProceeds', 'o1', 'o2', 'o3', 'wfCheck'];
const DEDUCT = ['wfND', 'wfFees', 'wfPool'];
const colC = keys => [].concat(keys).map(C);
const down = keys => `Ctrl+G "${B}!${C(keys[0])}" ↵ ` + keys.map(k => quoted(F(k)) + ' ↵').join(' ↓ ');
const drop = Object.fromEntries([...rowRefs(B, DEDUCT).map(r => [`${B}!${r}`, ['fmtStyle', 'numFmt']]), ...rowRefs(B, 'wfProceeds').map(r => [`${B}!${r}`, ['bdbl']])]);
const BLOCK = `C${row('wfEV')}:E${row('wfCheck')}`;

const ok = {
  top: ses => built(ses, B, colC(['wfEV', 'wfND', 'wfEq'])),
  claims: ses => built(ses, B, colC(['wfFees', 'wfPool'])),
  owners: ses => built(ses, B, colC(['wfProceeds', 'o1', 'o2', 'o3'])),
  check: ses => built(ses, B, colC('wfCheck')) && reads(sheetIn(ses, B), C('wfCheck'), colC(['wfProceeds', 'o1', 'o2', 'o3'])),
  across: ses => built(ses, B, rowRefs(B, WF)),
  parens: ses => carries(ses, B, rowRefs(B, DEDUCT), 'numFmt', DESK),
  double: ses => carries(ses, B, rowRefs(B, 'wfProceeds'), 'bdbl'),
};
const KEYS = {
  top: down(['wfEV', 'wfND', 'wfEq']),
  claims: down(['wfFees', 'wfPool']),
  owners: down(['wfProceeds', 'o1', 'o2', 'o3']),
  check: `Ctrl+G "${B}!${C('wfCheck')}" ↵ ${quoted(F('wfCheck'))} ↵`,
  across: `Ctrl+G "${B}!${BLOCK}" ↵ Ctrl+R`,
  parens: `Ctrl+G "${B}!C${row('wfND')}:E${row('wfND')}" ↵ Ctrl+1 N Tab End Alt+T ${quoted(DESK)} ↵ Ctrl+G "${B}!C${row('wfFees')}:E${row('wfPool')}" ↵ F4`,
  double: `Ctrl+G "${B}!C${row('wfProceeds')}:E${row('wfProceeds')}" ↵ Alt H B B`,
};

export default {
  id: 'the-waterfall',
  chapter: 'valuation',
  section: 'The bids and the waterfall',
  module: 'bids-and-waterfall',
  workbook: 'clearcoat-valuation',
  state: { before: 'B642', after: 'B643' },
  get plant() { return plantFrom('B642', 'B643', { drop }); },
  title: 'From enterprise value to the owners’ proceeds: the waterfall',
  difficulty: 'hard',
  tags: ['valuation', 'bids', 'waterfall'],
  access: 'paid',
  minutes: 7,
  headline: '=',
  conventions: ['F1', 'E3', 'D1', 'D5'],
  teaches: ['proceeds-waterfall'],
  uses: ['min-max-cap', 'f4-anchor', 'relative-absolute', 'fill-down-right', 'round-function', 'sum-family', 'check-cell', 'custom-number-format', 'format-cells-dialog', 'f4-repeat', 'borders-menu', 'keytips', 'arrow-keys', 'go-to'],
  prerequisites: ['bids-side-by-side'],
  brief: 'Enterprise value is what the buyer pays for the business; the owners’ proceeds are what is left once everyone ahead of them is paid. Net debt is repaid, the advisers’ and lawyers’ fees come off, the management option pool takes its share of the equity, and the rest is split by ownership: two founders at 35% each, the family office at 30%. That’s the waterfall, one line per claim. Build it for bid A, then fill it across the three. The key is `=`.',
  goals: [
    { id: 'top', teach: 'The waterfall pays claims in the order they rank: net debt first, then the fees, then the option pool, the owners last. Each deduction is a MIN of the claim and what is left above it, so a price below the claims floors the owners at zero instead of showing a negative.',
      text: `Start bid A’s waterfall in ${C('wfEV')}:${C('wfEq')}: enterprise value from the priced value, less net debt as a MIN, then equity value.`,
      keys: KEYS.top, requires: ['proceeds-waterfall', 'min-max-cap', 'f4-anchor', 'arrow-keys', 'go-to'], convention: 'C3',
      hintStuck: `pulse range ${C('wfEV')}:${C('wfEq')} · ${F('wfEV')} takes the priced value; ${F('wfND')} repays net debt, never more than the price.`,
      check: (s, ses) => settled(ses) && ok.top(ses) },
    { id: 'claims', teach: 'Fees are 2% of enterprise value, the advisers’ and the lawyers’. The option pool takes 5% of the equity above the strike the options were set at, MAX floors that at zero, and MIN stops it taking more than the fees left.',
      text: `Take off the fees in ${C('wfFees')} and the option pool in ${C('wfPool')}, each a MIN of the claim and what is left above it.`,
      keys: KEYS.claims, requires: ['proceeds-waterfall', 'min-max-cap', 'f4-anchor', 'arrow-keys', 'go-to'], convention: 'B4',
      hintStuck: `pulse range ${C('wfFees')}:${C('wfPool')} · The fee rate is ${C('feePct')}, the pool ${C('poolPct')} and the strike ${C('strikeVal')}; anchor each with F4.`,
      check: (s, ses) => settled(ses) && ok.claims(ses) && liveVia(ses, B, C('wfPool'), [C('strikeVal')]) },
    { id: 'owners', teach: 'What is left is the net proceeds to the owners, pre-tax: the structure changes what each keeps after tax, and that is the tax adviser’s question. Each owner takes their share from the ownership table.',
      text: `Total the net proceeds in ${C('wfProceeds')}, then split them in ${C('o1')}:${C('o3')} by the ownership in ${C('own1')}:${C('own3')}.`,
      keys: KEYS.owners, requires: ['proceeds-waterfall', 'f4-anchor', 'arrow-keys', 'go-to'], convention: 'C3',
      hintStuck: `pulse range ${C('wfProceeds')}:${C('o3')} · Each owner is ${F('o1')}, the share’s row anchored with F4.`,
      check: (s, ses) => settled(ses) && ok.owners(ses) && liveVia(ses, B, C('o1'), [C('feePct')]) },
    { id: 'check', text: `Check the split in ${C('wfCheck')}: ${F('wfCheck')}, which reads zero.`,
      keys: KEYS.check, requires: ['check-cell', 'round-function', 'sum-family', 'go-to'], convention: 'F1',
      hintStuck: `pulse cell ${C('wfCheck')} · The three owners’ lines less the proceeds, rounded to the cent.`,
      check: (s, ses) => settled(ses) && ok.check(ses) },
    { id: 'across', teach: 'Every line in bid A’s column reads its own column’s priced value and the anchored inputs, so one Ctrl+R over the block writes bids B and C.',
      text: `Select ${BLOCK} and fill bid A’s waterfall across to bids B and C with Ctrl+R.`,
      keys: KEYS.across, requires: ['fill-down-right', 'relative-absolute', 'go-to'], convention: 'E3',
      hintStuck: `pulse range ${BLOCK} · Ctrl+R copies the left column of the selection into every column to its right.`,
      check: (s, ses) => settled(ses) && ok.across(ses) },
    { id: 'parens', text: `Give the three deductions the desk format ${DESK}: rows ${row('wfND')}, ${row('wfFees')} and ${row('wfPool')}, the last two with F4.`,
      keys: KEYS.parens, requires: ['custom-number-format', 'format-cells-dialog', 'f4-repeat', 'go-to'], convention: 'D1',
      hintStuck: `pulse range C${row('wfND')}:E${row('wfND')} · Ctrl+1, N, then type the code into the Custom box; F4 repeats it on the next range.`,
      check: (s, ses) => settled(ses) && ok.parens(ses) },
    { id: 'double', text: `Give the proceeds line, C${row('wfProceeds')}:E${row('wfProceeds')}, its double bottom border with Alt, H, B, B.`,
      keys: KEYS.double, requires: ['borders-menu', 'keytips', 'go-to'], convention: 'D5',
      hintStuck: `pulse range C${row('wfProceeds')}:E${row('wfProceeds')} · The double bottom marks the one answer on the block.`,
      check: (s, ses) => settled(ses) && ok.double(ses) },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "${B}!${C('feePct')}" Enter "3" Enter Ctrl+G "${B}!${C('o1')}" Enter`, cadence: 360 },
      text: `Does it tie? Watch the fees in ${C('feePct')} go from 2% to 3%: every owner’s line under every bid falls.`, requires: [],
      hintStuck: `pulse range C${row('o1')}:E${row('o3')} · The fees come off before the owners, so each of them pays a share.`,
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The waterfall runs from enterprise value to each owner for all three bids, every deduction a MIN of the claim and what is left', check: (s, ses) => ok.across(ses) && ok.check(ses) },
    { text: 'The deductions print in parentheses and the proceeds line carries a double bottom', check: (s, ses) => ok.parens(ses) && ok.double(ses) },
  ],
  closing: [
    'The waterfall runs from what the buyer pays to what each owner takes home, one claim at a time.',
    'Best practice: the waterfall reads top to bottom in the order the claims are paid. A line out of order is a line a lawyer will move, and every line after it moves too.',
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
};
