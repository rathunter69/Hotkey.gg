// Chapter 6 · 6.3.5 The returns bridge (clearcoat-valuation, B635 → B636)
// The equity gain split into where it came from: EBITDA growth at the entry multiple, the change in
// multiple on FY31 EBITDA, net debt paid down, and the fees paid at entry, summing to the gain, with
// a check reading zero and each effect as a share. Built on total equity (the sponsor and the rolled
// stake together). Each line is graded on the reference formula evaluated in the learner's sheet,
// the growth effect on the liveness rule through the bid (the entry multiple follows it).
import { sheetIn, settled, reads, built, liveVia, plant, typeDown, cellsAt, R, solutionOf } from './lib/deal-checks.js';

const AFTER = 'B636';
const L = 'LBO';
const C = k => 'C' + R(L, k);
const F = k => cellsAt(AFTER, L)[C(k)].formula;
const SHARES = ['growthSh', 'multSh', 'paydownSh', 'feesSh'].map(C);
const ALL = ['gain', 'growthEff', 'multEff', 'paydownEff', 'feesEff', 'bridgeTotal', 'bridgeCheck', 'growthSh', 'multSh', 'paydownSh', 'feesSh'].map(C);
const lines = (ses, refs) => built(ses, L, refs, AFTER);
const BID = `${L}!${C('entryEV')}`;
const one = (k, text, extra) => ({ id: k, text, keys: typeDown(AFTER, L, [C(k)]), check: (s, ses) => settled(ses) && lines(ses, [C(k)]), ...extra });

const goals = [
  one('gain', `The equity gain in ${C('gain')}: equity at the exit less equity at entry, ${F('gain')}.`, {
    requires: ['lbo-returns', 'formula-basics', 'go-to'], convention: 'C3',
    hintStuck: `pulse cell ${C('gain')} · Both ends are in the returns block just above.` }),
  one('growthEff', `The EBITDA growth effect in ${C('growthEff')}: FY31 adjusted EBITDA less FY26E EBITDA, times the entry multiple.`, {
    teach: 'A return comes from three places, and a sponsor wants to see which. Growth is the rollout: every dollar of EBITDA added is worth the multiple paid for it.',
    requires: ['returns-bridge', 'f4-anchor', 'go-to'], convention: 'C3',
    hintStuck: `pulse cell ${C('growthEff')} · ${F('growthEff')}.`,
    check: (s, ses) => settled(ses) && lines(ses, [C('growthEff')]) && liveVia(ses, L, C('growthEff'), [BID]) }),
  one('multEff', `The multiple effect in ${C('multEff')}: the exit multiple less the entry multiple, times FY31 adjusted EBITDA.`, {
    teach: 'Paying 11.7x and selling at 11.0x loses the difference on every dollar of FY31 EBITDA, so on this deal the multiple works against the sponsor.',
    requires: ['returns-bridge', 'f4-anchor', 'go-to'], convention: 'C3',
    hintStuck: `pulse cell ${C('multEff')} · ${F('multEff')}.` }),
  one('paydownEff', `The debt paydown effect in ${C('paydownEff')}: net debt at closing less net debt at FY31.`, {
    requires: ['returns-bridge', 'f4-anchor', 'go-to'], convention: 'C3',
    hintStuck: `pulse cell ${C('paydownEff')} · Net debt is row ${R(L, 'netDebt')}: C at closing, H at FY31.` }),
  one('feesEff', `The fees in ${C('feesEff')}, as a negative: the 2% paid at entry that no buyer pays back.`, {
    teach: 'Entry equity paid the fees, and nothing at the exit returns them, so without this line the three effects overshoot the gain by exactly the fees.',
    requires: ['returns-bridge', 'go-to'], convention: 'C3',
    hintStuck: `pulse cell ${C('feesEff')} · The fees line of sources and uses, with its sign turned.` }),
  { id: 'total', text: `The four effects summed in ${C('bridgeTotal')}, and the check against the gain in ${C('bridgeCheck')}, reading zero.`,
    keys: typeDown(AFTER, L, [C('bridgeTotal'), C('bridgeCheck')]), requires: ['sum-family', 'check-cell', 'round-function', 'go-to'], convention: 'F1',
    hintStuck: `pulse range ${C('bridgeTotal')}:${C('bridgeCheck')} · SUM of the four, then ROUND of the total less the gain.`,
    check: (s, ses) => settled(ses) && lines(ses, [C('bridgeTotal'), C('bridgeCheck')]) && reads(sheetIn(ses, L), C('bridgeCheck'), [C('bridgeTotal'), C('gain')]) },
  { id: 'shares', text: `Each effect as a share of the gain in ${SHARES[0]}:${SHARES[3]}.`,
    keys: typeDown(AFTER, L, SHARES), requires: ['formula-basics', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${SHARES[0]}:${SHARES[3]} · Each effect over the gain in ${C('gain')}; the four add to 100%.`,
    check: (s, ses) => settled(ses) && lines(ses, SHARES) },
  { id: 'tie', closer: true, demo: { script: `Ctrl+G "${L}!${C('exitMult')}" Enter "=$C$${R(L, 'entryMult')}" Enter Ctrl+G "${L}!${C('multEff')}" Enter`, cadence: 320 },
    text: 'Does it tie? Watch the exit multiple set equal to the entry multiple: the multiple effect reads zero and the check still holds.', requires: [],
    hintStuck: `pulse cell ${L}!${C('multEff')} · Sell at what you paid and the multiple adds nothing.`,
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'returns-bridge',
  chapter: 'valuation',
  section: 'LBO',
  module: 'lbo',
  workbook: 'clearcoat-valuation',
  state: { before: 'B635', after: AFTER },
  plant: plant(AFTER, L, ALL),
  title: 'The returns bridge',
  difficulty: 'medium',
  tags: ['valuation', 'lbo', 'returns'],
  access: 'paid',
  minutes: 5,
  headline: '=',
  conventions: ['C3', 'F1'],
  teaches: ['returns-bridge'],
  uses: ['lbo-returns', 'sum-family', 'check-cell', 'round-function', 'formula-basics', 'f4-anchor', 'go-to'],
  prerequisites: ['irr-moic'],
  brief: 'A return comes from three places, and a sponsor wants to see which: EBITDA growth (the rollout), multiple expansion (paying 11.7x and selling at 11.0x is a loss on this one), and debt paydown (the sweep). The bridge splits the equity gain into the three, takes off the fees paid on the way in, and the four lines sum to the gain. Build it, and read where this return really comes from. The key is `=`.',
  goals,
  endState: [
    { text: 'Four effects sum to the equity gain, and each reads as a share of it', check: (s, ses) => lines(ses, ALL) },
  ],
  closing: [
    'The return split into three effects and the fees: the rollout does all the work here, and the multiple and the debt the rollout needed both take some back.',
    'Best practice: build the bridge on total equity, the sponsor’s and the rolled stake together, so the rollover doesn’t disturb it and the check reads zero whatever the split.',
  ],
  solution: solutionOf(goals),
};
