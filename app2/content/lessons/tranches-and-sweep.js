// Chapter 6 · 6.3.2 Debt tranches and the cash sweep (clearcoat-valuation, B632 → B633)
// Five years of the sponsor's debt on the LBO page: EBITDA and free cash flow linked from the model,
// the senior loan (mandatory amortization of the original loan, never below zero, and the sweep),
// the unswept mezzanine, the cash rows down to cash available after the minimum, the revolver's draw
// and repayment and the floored sweep, the revolver's own block, the debt totals and a check that
// debt repaid plus cash built equals the cash after interest and tax. Interest runs on the average
// balance through the model's breaker, so the page iterates. Lines are graded on the reference
// formula evaluated in the learner's sheet; the draw on the liveness rule through minimum cash.
import { sheetIn, settled, reads, built, liveVia, sourceOf, plant, refsOf, fill, cellsAt, R, YRS, LCOLS, solutionOf } from './lib/deal-checks.js';

const AFTER = 'B633';
const L = 'LBO';
const OPS = ['ebitda', 'ebitdaAdj', 'fcf'];
const SENIOR = ['senOpen', 'senMand', 'senSweep', 'senClose', 'senAvg', 'senInt'];
const MEZZ = ['mezOpen', 'mezClose', 'mezAvg', 'mezInt'];
const CASH = ['cashOpen', 'cFcf', 'cInt', 'cMand', 'cashPre', 'cashAvail'];
const SWEEP = ['revDrawn', 'revRepaid', 'sweep', 'cashClose'];
const REV = ['revOpen', 'revDrawnRow', 'revRepaidRow', 'revClose', 'revAvg', 'revInt'];
const TOTALS = ['totDebt', 'totInt', 'cashRow', 'netDebt', 'paidDown'];
const CHECK = ['sweepCheck'];
/** A keyed line's cells: C too where the finished page has a closing figure there. */
const colsOf = k => (cellsAt(AFTER, L)['C' + R(L, k)] ? LCOLS : YRS);
const refs = keys => keys.flatMap(k => refsOf(L, [k], colsOf(k)));
const span = keys => { const a = keys[0], b = keys[keys.length - 1]; return `${colsOf(a)[0]}${R(L, a)}:H${R(L, b)}`; };
/** The hint for keyed lines: the closing balance at C typed once where there is one, then each line filled across D:H. */
const keysFor = keys => keys.map(k => {
  const r = R(L, k), c = cellsAt(AFTER, L)['C' + r];
  const year = fill(AFTER, L, `D${r}:H${r}`);
  return c ? `${fill(AFTER, L, 'C' + r)} ${year}` : year;
}).join(' ');
const lines = (ses, keys) => built(ses, L, refs(keys), AFTER);
const ALL = [...OPS, ...SENIOR, ...MEZZ, ...CASH, ...SWEEP, ...REV, ...TOTALS, ...CHECK];
const FY28 = 'E' + R(L, 'fcf');
const checkOk = ses => lines(ses, CHECK) && YRS.every(c => reads(sheetIn(ses, L), c + R(L, 'sweepCheck'), [c + R(L, 'cashClose'), c + R(L, 'totDebt')]));

const goals = [
  { id: 'ops', text: `EBITDA, adjusted EBITDA and free cash flow for FY27 to FY31 in ${span(OPS)}, linked from IS and DCF.`,
    teach: 'The LBO borrows its operating lines from the model, linked, so a change to the plan reaches the sponsor’s return without a second copy. Adjusted EBITDA waits for the sale-leaseback’s rent in the next lesson.',
    keys: keysFor(OPS), requires: ['lbo-sweep', 'cross-sheet-ref', 'link-colour-convention', 'ctrl-enter-fill', 'go-to'], convention: 'B4',
    hintStuck: `pulse range ${span(OPS)} · EBITDA is IS row 24 and free cash flow DCF row 16, from column F.`,
    check: (s, ses) => settled(ses) && lines(ses, OPS) },
  { id: 'senior', text: `The senior loan in ${span(SENIOR)}: opening, mandatory amortization, the sweep, closing, the average and interest.`,
    teach: 'The 5% is of the original loan, as loan agreements quote it, so the closing balance at C is anchored with F4. MIN of that and the opening balance means a loan swept down early never goes below zero.',
    keys: keysFor(SENIOR), requires: ['corkscrew', 'min-max-cap', 'circularity-breaker', 'f4-anchor', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${span(SENIOR)} · Mandatory is −MIN(5% × the loan at C, the opening); interest reads Circ like the model’s tranches.`,
    check: (s, ses) => settled(ses) && lines(ses, SENIOR) },
  { id: 'mezz', text: `The mezzanine in ${span(MEZZ)}: opening, closing, the average and interest at 12%, never swept.`,
    keys: keysFor(MEZZ), requires: ['corkscrew', 'circularity-breaker', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${span(MEZZ)} · Mezzanine can’t be repaid early without a penalty, so its balance waits for the exit.`,
    check: (s, ses) => settled(ses) && lines(ses, MEZZ) },
  { id: 'cash', text: `The cash rows in ${span(CASH)}: opening cash, free cash flow, interest net of tax, mandatory amortization, then cash available.`,
    teach: 'The model’s free cash flow was taxed as if there were no debt, so interest comes off net of the tax it saves. Minimum cash comes off once, in cash available, not out of every year.',
    keys: keysFor(CASH), requires: ['lbo-sweep', 'sum-family', 'f4-anchor', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${span(CASH)} · Interest is −total interest × (1 − tax); cash available is the subtotal less minimum cash.`,
    check: (s, ses) => settled(ses) && lines(ses, CASH) },
  { id: 'sweep', text: `The revolver’s draw and repayment, the sweep floored with MAX and MIN, and closing cash in ${span(SWEEP)}.`,
    teach: 'The sweep is MAX(MIN(cash available, what the senior loan still owes), 0), the floored form from the model, so a short year can’t turn it into new senior borrowing; a short year draws the revolver instead.',
    keys: keysFor(SWEEP), requires: ['lbo-sweep', 'cash-sweep', 'min-max-cap', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${span(SWEEP)} · The draw is MAX(−cash available, 0); the repayment comes first, then the sweep.`,
    check: (s, ses) => settled(ses) && lines(ses, SWEEP) && liveVia(ses, L, 'D' + R(L, 'revDrawn'), [sourceOf(AFTER, L, 'C' + R(L, 'minCash'))]) },
  { id: 'revolver', text: `The revolver’s block in ${span(REV)}: opening, drawn, repaid, closing, the average and interest.`,
    keys: keysFor(REV), requires: ['corkscrew', 'circularity-breaker', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${span(REV)} · Drawn and repaid read the two rows of the cash block.`,
    check: (s, ses) => settled(ses) && lines(ses, REV) },
  { id: 'totals', text: `Total debt, total interest, cash, net debt and net debt paid down since closing in ${span(TOTALS)}.`,
    teach: 'Net debt paid down is what the sponsor’s equity is worth more by at the exit. Here the rollout’s capex takes the cash: the revolver draws every year and net debt ends the hold higher than it started.',
    keys: keysFor(TOTALS), requires: ['sum-family', 'f4-anchor', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${span(TOTALS)} · Paid down is net debt at closing, anchored, less each year’s.`,
    check: (s, ses) => settled(ses) && lines(ses, TOTALS) },
  { id: 'check', text: `The check in ${span(CHECK)}: debt repaid plus cash built, less the cumulative cash after interest and tax, reading zero.`,
    keys: keysFor(CHECK), requires: ['check-cell', 'round-function', 'f4-anchor', 'ctrl-enter-fill', 'go-to'], convention: 'F1',
    hintStuck: `pulse range ${span(CHECK)} · ROUND of the change in cash less the change in debt, less the running sums from D.`,
    check: (s, ses) => settled(ses) && checkOk(ses) },
  { id: 'tie', closer: true, demo: { script: `Ctrl+G "${L}!${FY28}" Enter "=DCF!G$16/2" Enter Ctrl+G "${L}!H${R(L, 'totDebt')}" Enter`, cadence: 320 },
    text: 'Does it tie? Watch FY28’s free cash flow halve: the revolver draws more and debt at the exit rises.', requires: [],
    hintStuck: `pulse range ${L}!D${R(L, 'totDebt')}:H${R(L, 'totDebt')} · Every year’s debt reads the cash before it.`,
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'tranches-and-sweep',
  chapter: 'valuation',
  section: 'LBO',
  module: 'lbo',
  workbook: 'clearcoat-valuation',
  state: { before: 'B632', after: AFTER },
  plant: plant(AFTER, L, refs(ALL)),
  title: 'Debt tranches and the cash sweep',
  difficulty: 'hard',
  tags: ['valuation', 'lbo', 'debt', 'cash sweep'],
  access: 'paid',
  minutes: 8,
  headline: 'MIN',
  conventions: ['B4', 'C3', 'F1'],
  teaches: ['lbo-sweep'],
  uses: ['sources-uses', 'cash-sweep', 'corkscrew', 'circularity-breaker', 'min-max-cap', 'cross-sheet-ref', 'link-colour-convention', 'sum-family', 'f4-anchor', 'check-cell', 'round-function', 'ctrl-enter-fill', 'go-to'],
  prerequisites: ['sources-and-uses'],
  brief: 'Two tranches, two rates, one rule, the cash sweep: every spare dollar repays the senior loan, while the mezzanine can’t be repaid early without a penalty and waits for the exit. Free cash flow comes from the model, linked; interest is on the average balance through the breaker; the sweep is MIN of cash available and the balance, floored at zero. Five years of it, and read how far net debt moved. The key is `MIN`.',
  goals,
  endState: [
    { text: 'Five years of debt run from closing to the exit, and the check reads zero every year', check: (s, ses) => lines(ses, ALL) && checkOk(ses) },
  ],
  closing: [
    'Five years of cash ran through the debt, and net debt at the exit is what the equity gets after the lenders.',
    'Best practice: one check proves the block, debt repaid plus cash built against the cash the business made after interest and tax. When the sweep, the revolver or a sign is wrong, it stops reading zero.',
  ],
  solution: solutionOf(goals),
};
