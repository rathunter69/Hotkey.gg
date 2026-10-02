// Practice · Formulas — Loan schedule (screenplay 6.2). The Cedar Park build loan on Loans (state S6d)
// with the per-period rate, the count of periods, the payment and the 120-month schedule emptied.
// The payment comes from PMT with the rate and term read from their cells; each month's opening is
// the last month's closing, interest is the opening times the monthly rate, principal is the payment
// less the interest, and the balance runs to zero. Graded on the databook's figures on the learner's
// cells, the payment moving with the rate and the term (referenced, not typed), and the two checks at 0.
import { databookDrill, emptied, refsOf, built, callsAll, liveVia, sheetIn, settled, fillFrom, toScript } from './databook-drills.js';

const L = 'Loans';
const PARTS = { period: ['C12', 'C13'], payment: ['C16'], opening: ['D44', ...refsOf('D45:D163')], interest: refsOf('E44:E163'), principal: refsOf('F44:F163'), closing: refsOf('G44:G163') };
const ok = id => ses => built(ses, L, PARTS[id]);
const zeroed = ses => { const sh = sheetIn(ses, L); return !!sh && sh.value('C167') === 0 && sh.value('C168') === 0; };
const KEYS = {
  period: `${fillFrom(L, 'C12')} ${fillFrom(L, 'C13')}`, payment: fillFrom(L, 'C16'),
  opening: `${fillFrom(L, 'D44')} ${fillFrom(L, 'D45:D163')}`, interest: fillFrom(L, 'E44:E163'), principal: fillFrom(L, 'F44:F163'), closing: fillFrom(L, 'G44:G163'),
};

export default databookDrill({
  id: 'ch3-loan-schedule',
  title: 'Loan schedule',
  task: 'Build the loan’s payment with PMT and its monthly schedule down to a zero balance, the rate and term anchored.',
  module: 'time-value-of-money',
  state: { before: 'S6d' },
  plant: () => emptied(L, Object.values(PARTS).flat()),
  goals: [
    { id: 'period', text: 'Loans C12 and C13: the monthly rate, the annual rate in C7 over the payments in C9, and the months, C8 times C9.', keys: KEYS.period,
      check: (s, ses) => settled(ses) && ok('period')(ses) },
    { id: 'payment', text: 'Loans C16: the monthly payment as a positive figure, minus PMT on C12, C13 and the principal in C6.', keys: KEYS.payment,
      check: (s, ses) => settled(ses) && ok('payment')(ses) && callsAll(ses, L, ['C16'], ['PMT']) && liveVia(ses, L, 'C16', ['C7']) && liveVia(ses, L, 'C16', ['C8']) },
    { id: 'opening', text: 'The opening balance: the principal C6 in D44, then last month’s closing in D45:D163.', keys: KEYS.opening,
      check: (s, ses) => settled(ses) && ok('opening')(ses) },
    { id: 'interest', text: 'Interest in E44:E163: the opening balance times the monthly rate in $C$12.', keys: KEYS.interest,
      check: (s, ses) => settled(ses) && ok('interest')(ses) },
    { id: 'principal', text: 'Principal in F44:F163: the payment in $C$16 less the month’s interest.', keys: KEYS.principal,
      check: (s, ses) => settled(ses) && ok('principal')(ses) },
    { id: 'closing', text: 'The closing balance in G44:G163: opening less principal, so both checks in C167:C168 read 0.', keys: KEYS.closing,
      check: (s, ses) => settled(ses) && ok('closing')(ses) && zeroed(ses) },
  ],
  endState: [
    { text: 'The payment ties to PMT, the schedule runs to zero, both checks read 0, and the payment moves with the rate and the term', check: (s, ses) => Object.keys(PARTS).every(id => ok(id)(ses)) && zeroed(ses) && liveVia(ses, L, 'E45', ['C7']) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 200,
  route: 60,
});
