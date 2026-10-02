// Chapter 6 · 6.3.4 Returns: IRR and MOIC (clearcoat-valuation, B634 → B635)
// The sponsor's return on the LBO page: exit enterprise value on FY31 adjusted EBITDA, net debt
// off, equity at the exit over equity at entry (MOIC), the equity cash flows and IRR on them, the
// same rate by hand with RRI, the split between the sponsor and the owners' rolled stake (both earn
// the deal's rate), the senior lender's row (close to its 8%), and the flag against the 20% hurdle.
// Lines are graded on the reference formula evaluated in the learner's sheet; the IRR on the
// liveness rule through the exit multiple; the zero checks on their parsed references.
import { sheetIn, settled, reads, built, liveVia, plant, refsOf, fill, typeDown, cellsAt, R, LCOLS, YRS, solutionOf } from './lib/deal-checks.js';

const AFTER = 'B635';
const L = 'LBO';
const C = k => 'C' + R(L, k);
const Cs = keys => keys.map(C);
const row = k => refsOf(L, [k], LCOLS);
const yrs = k => `D${R(L, k)}:H${R(L, k)}`;
const EXIT = Cs(['exitEV', 'exitND', 'exitEq']);
const MOIC = Cs(['entryEq', 'moic']);
const RRI = Cs(['rri', 'irrDiff']);
const SPLIT_ONE = Cs(['sponsorShare']), SPLIT_IRR = Cs(['spIrr', 'owIrr', 'splitCheck']);
const ALL = [...EXIT, ...MOIC, ...row('eqFlow'), C('irr'), ...RRI, ...SPLIT_ONE, ...row('spFlow'), ...row('owFlow'), ...SPLIT_IRR, ...row('lenderFlow'), C('lenderIrr'), C('hurdleFlag')];
const F = ref => cellsAt(AFTER, L)[ref].formula;
const lines = (ses, refs) => built(ses, L, refs, AFTER);
const zeroReads = (ses, ref, keys) => reads(sheetIn(ses, L), ref, keys.map(C));
const EXIT_MULT = `${L}!${C('exitMult')}`;

const goals = [
  { id: 'exit', text: `Exit enterprise value, net debt at the exit and equity at the exit in ${EXIT[0]}:${EXIT[2]}.`,
    teach: 'The sponsor sells after five years at the exit multiple on FY31 adjusted EBITDA, repays whatever debt is left, and keeps the rest. That equity at the exit is the whole payoff.',
    keys: typeDown(AFTER, L, EXIT), requires: ['lbo-returns', 'f4-anchor', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${EXIT[0]}:${EXIT[2]} · ${F(EXIT[0])}; net debt at FY31 is H${R(L, 'netDebt')}, as a negative.`,
    check: (s, ses) => settled(ses) && lines(ses, EXIT) },
  { id: 'moic', text: `Equity at entry, the sponsor’s and the rolled stake together, in ${MOIC[0]}, and MOIC in ${MOIC[1]}.`,
    teach: 'MOIC is money out over money in. Entry equity counts the owners’ rolled stake beside the sponsor’s cheque, because both hold the new company on the same terms.',
    keys: typeDown(AFTER, L, MOIC), requires: ['lbo-returns', 'formula-basics', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${MOIC[0]}:${MOIC[1]} · Sponsor equity plus the rollover from sources and uses, then exit equity over it.`,
    check: (s, ses) => settled(ses) && lines(ses, MOIC) },
  { id: 'irr', text: `The equity cash flows in ${C('eqFlow')}:H${R(L, 'eqFlow')}, in at closing and out in the hold’s last year, and IRR on them in ${C('irr')}.`,
    teach: 'IRR is the annual rate that turns the money in into the money out over the hold. The counter puts the exit in the year the hold names, so a four-year hold moves it.',
    keys: `${fill(AFTER, L, C('eqFlow'))} ${fill(AFTER, L, yrs('eqFlow'))} ${fill(AFTER, L, C('irr'))}`, requires: ['irr', 'columns-counter', 'if-function', 'f4-anchor', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${C('eqFlow')}:H${R(L, 'eqFlow')} · Entry equity as a negative at C, then the exit equity where the counter equals the hold.`,
    check: (s, ses) => settled(ses) && lines(ses, [...row('eqFlow'), C('irr')]) && liveVia(ses, L, C('irr'), [EXIT_MULT]) },
  { id: 'rri', text: `IRR by hand in ${RRI[0]} with RRI over the hold, and the difference from IRR in ${RRI[1]}, reading zero.`,
    keys: typeDown(AFTER, L, RRI), requires: ['cagr', 'check-cell', 'round-function', 'go-to'], convention: 'F1',
    hintStuck: `pulse range ${RRI[0]}:${RRI[1]} · RRI(hold, equity in, equity out) is MOIC to the one over five, less one.`,
    check: (s, ses) => settled(ses) && lines(ses, RRI) && zeroReads(ses, RRI[1], ['irr', 'rri']) },
  { id: 'split', text: `The split in ${SPLIT_ONE[0]}:${SPLIT_IRR[2]}: the sponsor’s share, both holders’ cash flows, their IRRs and the check between them.`,
    teach: 'Each holder gets its share of every cash flow, so the sponsor and the owners earn the deal’s rate exactly. A check reading zero proves the split and the return rows are wired the same way.',
    keys: `${typeDown(AFTER, L, SPLIT_ONE)} ${fill(AFTER, L, `C${R(L, 'spFlow')}:H${R(L, 'spFlow')}`)} ${fill(AFTER, L, `C${R(L, 'owFlow')}:H${R(L, 'owFlow')}`)} ${typeDown(AFTER, L, SPLIT_IRR)}`,
    requires: ['irr', 'iferror-function', 'f4-anchor', 'ctrl-enter-fill', 'check-cell', 'go-to'], convention: 'F1',
    hintStuck: `pulse range ${SPLIT_ONE[0]}:${SPLIT_IRR[2]} · The sponsor’s share is its equity over entry equity; the owners take one less that share.`,
    check: (s, ses) => settled(ses) && lines(ses, [...SPLIT_ONE, ...row('spFlow'), ...row('owFlow'), ...SPLIT_IRR]) && zeroReads(ses, SPLIT_IRR[2], ['spIrr', 'owIrr']) },
  { id: 'lender', text: `The senior lender’s row in ${C('lenderFlow')}:H${R(L, 'lenderFlow')} and its IRR in ${C('lenderIrr')}, which lands close to the loan’s 8%.`,
    teach: 'The lender is out the loan at closing and gets interest and repayments back each year, the balance at the exit. Its IRR near the loan’s rate is the proof that no repayment is missing from the row.',
    keys: `${fill(AFTER, L, C('lenderFlow'))} ${fill(AFTER, L, yrs('lenderFlow'))} ${fill(AFTER, L, C('lenderIrr'))}`, requires: ['irr', 'iferror-function', 'columns-counter', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${C('lenderFlow')}:H${R(L, 'lenderFlow')} · Interest less the amortization and the sweep (both negative on the loan), plus the balance in the exit year.`,
    check: (s, ses) => settled(ses) && lines(ses, [...row('lenderFlow'), C('lenderIrr')]) },
  { id: 'hurdle', text: `The flag in ${C('hurdleFlag')}: Clears when IRR is at least the 20% hurdle, Short when it isn’t.`,
    keys: typeDown(AFTER, L, [C('hurdleFlag')]), requires: ['if-function', 'f4-anchor', 'go-to'], convention: 'F1',
    hintStuck: `pulse cell ${C('hurdleFlag')} · IRR against the hurdle on the term sheet, never a typed 20%.`,
    check: (s, ses) => settled(ses) && lines(ses, [C('hurdleFlag')]) },
  { id: 'tie', closer: true, demo: { script: `Ctrl+G "${EXIT_MULT}" Enter "12" Enter Ctrl+G "${L}!${C('irr')}" Enter`, cadence: 320 },
    text: 'Does it tie? Watch the exit multiple go to 12x: IRR and MOIC both rise, and the flag reads them.', requires: [],
    hintStuck: `pulse range ${L}!${C('moic')}:${C('irr')} · Every return line reads the exit equity.`,
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'irr-moic',
  chapter: 'valuation',
  section: 'LBO',
  module: 'lbo',
  workbook: 'clearcoat-valuation',
  state: { before: 'B634', after: AFTER },
  plant: plant(AFTER, L, ALL),
  title: 'Returns: IRR and MOIC',
  difficulty: 'hard',
  tags: ['valuation', 'lbo', 'returns', 'irr'],
  access: 'paid',
  minutes: 7,
  headline: 'IRR',
  conventions: ['C3', 'F1'],
  teaches: ['lbo-returns'],
  uses: ['sources-uses', 'lbo-sweep', 'irr', 'cagr', 'columns-counter', 'if-function', 'iferror-function', 'check-cell', 'round-function', 'formula-basics', 'f4-anchor', 'ctrl-enter-fill', 'go-to'],
  prerequisites: ['sale-leasebacks'],
  brief: 'The sponsor puts equity in at entry and takes equity out at exit: exit enterprise value (11.0x FY31 EBITDA) less the debt still outstanding. MOIC is equity out over equity in; IRR is the annual return that turns one into the other over five years. It’s the house from the DCF chapter again: bought with a small down payment and a large mortgage, the same rise in value is a far bigger return on the down payment. Build both, and read them against the 20% a sponsor needs. The key is `IRR`.',
  goals,
  endState: [
    { text: 'Exit equity, MOIC and IRR stand on the page, checked by hand, split by holder and flagged against the hurdle', check: (s, ses) => lines(ses, ALL) },
  ],
  closing: [
    'You can see what the sponsor makes, as a multiple and as a rate, and whether it clears their bar: 1.77x and 12.1%, short of the 20% hurdle at this price.',
    'Best practice: check an IRR two ways. IRR on the cash flows and RRI on the two ends agree to the decimal when the flows are only in and out, and a lender’s row near its coupon proves the debt side of the same page.',
  ],
  solution: solutionOf(goals),
};
