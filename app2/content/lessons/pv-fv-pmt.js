// Chapter 3 · 3.5.1 PV, FV and PMT: the site-build loan (clearcoat-databook, S4d → S5a)
// Cedar Park was funded with a $3.5m loan at 7% over ten years, paid monthly, and the buyers want
// its payment. The Loans sheet carries the four blue inputs in C6:C9; the learner turns the annual
// terms into per-period ones (C12, C13), builds the payment with PMT (C16) and reads the sign, then
// the total paid and the interest (C17, C18), and PV and FV beside them (C21, C22). Every check
// reads the figure the current inputs give and the shared liveness rule, so any legitimate route
// passes. The closer moves the rate to 6% and the payment and the interest fall.
import { liveness } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const loans = ses => sheetOf(ses, 'Loans');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
/** `ref` holds a live formula (the shared rule: nudge an input, the result moves) that reads `want`. */
const liveAt = (sh, ref, want) => !!sh && near(sh.value(ref), want) && liveness(sh, ref).ok;
const onLoans = ses => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === 'Loans';

/** The figures the loan's inputs give, read off the sheet as it stands. */
function terms(sh) {
  const P = sh.value('C6'), rate = sh.value('C7'), years = sh.value('C8'), perYear = sh.value('C9');
  const r = rate / perYear, n = years * perYear;
  const pmt = P * r / (1 - Math.pow(1 + r, -n));
  return { P, rate, years, r, n, pmt, paid: pmt * n, interest: pmt * n - P,
    pv: 35000 * (1 - Math.pow(1 + r, -n)) / r, fv: 1000000 * Math.pow(1 + rate, years) };
}
const perPeriod = sh => { const t = terms(sh); return liveAt(sh, 'C12', t.r) && liveAt(sh, 'C13', t.n); };
const payment = sh => liveAt(sh, 'C16', terms(sh).pmt);
const totals = sh => { const t = terms(sh); return liveAt(sh, 'C17', t.paid) && liveAt(sh, 'C18', t.interest); };
const pvDone = sh => liveAt(sh, 'C21', terms(sh).pv);
const fvDone = sh => liveAt(sh, 'C22', terms(sh).fv);

export default {
  id: 'pv-fv-pmt',
  chapter: 'formulas',
  section: 'Time value of money',
  module: 'time-value-of-money',
  workbook: 'clearcoat-databook',
  state: { before: 'S4d', after: 'S5a' },
  title: 'PV, FV and PMT: the site-build loan',
  difficulty: 'medium',
  tags: ['formulas', 'finance', 'loan'],
  access: 'paid',
  minutes: 6,
  headline: 'PMT',
  conventions: ['B4', 'C4'],
  teaches: ['pmt-pv-fv'],
  uses: ['formula-basics', 'formula-operators', 'sheet-tabs', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys', 'type-to-enter'],
  prerequisites: ['challenge-house-format-set'],
  brief: 'The Cedar Park loan is $3.5m at 7% over ten years, paid monthly. PMT gives the payment from the rate, the number of periods and the principal, and the trap is periods: a monthly payment needs the monthly rate (7% over 12) and 120 periods, not 10. PV runs it backwards to the loan a payment can support, and FV runs it forwards to what a sum grows to. Build the three on Loans and read the signs. The key is `PMT`.',
  wow: 'Three inputs gave you the payment, the total interest and the sign convention.',
  goals: [
    { id: 'read-inputs', text: 'On Loans, select the four blue inputs in C6:C9: the principal, the annual rate, the term in years and the payments a year.',
      keys: 'Ctrl+PgDn → ×2 Ctrl+↓ ×2 Ctrl+Shift+↓', requires: ['sheet-tabs', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys'], convention: 'B1',
      hintStuck: 'pulse range C6:C9 · The inputs are the blue block under the loan’s heading.',
      check: (s, ses) => onLoans(ses) && loans(ses).selectionText() === 'C6:C9' && settled(ses) },
    { id: 'per-period', teach: 'A loan is paid per period, so its rate and its term have to be per period too. The rate a month is the annual rate over the payments a year, and the periods are the years times the payments a year, so a reader can change either input and both follow.',
      text: 'Turn the terms monthly: =C7/C9 in C12 for the monthly rate, then =C8*C9 in C13 for the number of payments.',
      keys: 'Ctrl+↓ ↓ ×3 "=C7/C9" ↵ "=C8*C9" ↵', requires: ['pmt-pv-fv', 'formula-basics', 'formula-operators', 'ctrl-arrow', 'arrow-keys'], convention: 'B4',
      hintStuck: 'pulse cell C12 · Twelve payments a year: the rate divides by C9, the term multiplies by it.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && perPeriod(sh) && settled(ses); } },
    { id: 'payment', teach: 'PMT(rate, periods, principal) returns the level payment that clears the loan, and it comes back negative because it is cash going out. A minus in front makes the page read a positive payment. PMT, PV and FV also take an optional last argument, type: left out, the payment falls at the end of each month, as a loan’s does; 1 puts it at the start, the way rent is paid.',
      text: 'In C16 build the monthly payment as =-PMT(C12,C13,C6), the minus turning the cash out into a positive payment.',
      keys: '↓ ×2 "=-PMT(C12,C13,C6)" ↵', requires: ['pmt-pv-fv', 'formula-basics', 'arrow-keys'], convention: 'C4',
      hintStuck: 'pulse cell C16 · The rate and the periods are the monthly ones you just built, and the principal is C6.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && perPeriod(sh) && payment(sh) && settled(ses); } },
    { id: 'totals', text: 'In C17 total what the loan costs as =C16*C13, then in C18 take the principal off it, =C17-C6, to read the interest.',
      keys: '"=C16*C13" ↵ "=C17-C6" ↵', requires: ['formula-basics', 'formula-operators'],
      hintStuck: 'pulse cell C18 · Everything paid less what was borrowed is what the bank earns.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && payment(sh) && totals(sh) && settled(ses); } },
    { id: 'pv', teach: 'PV runs PMT backwards: given the rate, the periods and a payment, it returns the loan that payment clears. The payment goes in as a negative, cash out, so the loan reads positive.',
      text: 'In C21 =PV(C12,C13,-35000) gives the loan a $35,000 monthly payment supports on the same terms.',
      keys: '↓ ×2 "=PV(C12,C13,-35000)" ↵', requires: ['pmt-pv-fv', 'formula-basics', 'arrow-keys'],
      hintStuck: 'pulse cell C21 · Same rate, same periods, a smaller payment than the one in C16.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && totals(sh) && pvDone(sh) && settled(ses); } },
    { id: 'fv', teach: 'FV runs it forwards: FV(rate, periods, payment, present value) is what a sum grows to. With no payment and $1m put in today as cash out, it reads the balance after ten years at 7%.',
      text: 'In C22 =FV(C7,C8,0,-1000000) shows what $1m grows to in ten years at the loan’s annual rate.',
      keys: '"=FV(C7,C8,0,-1000000)" ↵', requires: ['pmt-pv-fv', 'formula-basics'],
      hintStuck: 'pulse cell C22 · This one compounds once a year, so it takes the annual rate and the years.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && pvDone(sh) && fvDone(sh) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Loans!C7" Enter "6%" Enter Ctrl+G "Loans!C16" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Watch the rate in C7 change to 6% and the payment in C16 and the interest in C18 both fall.', requires: [],
      hintStuck: 'pulse cell C16 · Every figure on the loan reads the four inputs.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The monthly rate, the periods, the payment, the total paid and the interest are live formulas on Loans', check: (s, ses) => { const sh = loans(ses); return !!sh && perPeriod(sh) && payment(sh) && totals(sh); } },
    { text: 'PV and FV sit beside the payment in C21 and C22', check: (s, ses) => { const sh = loans(ses); return !!sh && pvDone(sh) && fvDone(sh); } },
  ],
  closing: [
    'The Cedar Park loan costs $40,638 a month for ten years, and the bank earns about $1.38m of interest on the $3.5m it lent. Every figure reads the four blue inputs, so a new rate or term runs straight through.',
    'Read the signs the way Excel writes them: money going out is negative, money coming in is positive. PMT, PV and FV all follow that rule, so a minus in the right place is what makes the page read the way a buyer expects.',
  ],
  solution: 'Ctrl+PgDn Right Right Ctrl+Down Ctrl+Down Ctrl+Shift+Down Ctrl+Down Down Down Down "=C7/C9" Enter "=C8*C9" Enter Down Down "=-PMT(C12,C13,C6)" Enter "=C16*C13" Enter "=C17-C6" Enter Down Down "=PV(C12,C13,-35000)" Enter "=FV(C7,C8,0,-1000000)" Enter',
};
