// Chapter 3 · 3.5.C Challenge: a new-site case valued with NPV and IRR (seeded over S4d)
// The Loans sheet as 3.5.1 found it, with a different site's figures: the seed picks the site, the
// loan's principal and rate, the build, the five years of operating cash, the sale and the discount
// rate. The learner builds the payment, the NPV by hand and by function, IRR, payback and the first
// twelve rows of the schedule. Every check reads the figure the seeded inputs give and the shared
// liveness rule, so any legitimate route passes; the workload never moves across seeds.
import { stateOf } from '../workbooks/clearcoat-databook.js';
import { livenessMemo as liveness } from '../../app/graders.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const loans = ses => sheetOf(ses, 'Loans');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b, tol = 1e-6) => isNum(a) && isNum(b) && Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const liveAt = (sh, ref, want, tol) => !!sh && near(sh.value(ref), want, tol) && liveness(sh, ref).ok;
const YEARS = ['C', 'D', 'E', 'F', 'G', 'H'];
const SITES = ['Round Rock', 'Georgetown', 'Pflugerville', 'Leander', 'Kyle', 'Buda'];

/** What the inputs on the sheet give: the loan, the case and the first twelve months of the schedule. */
function figures(sh) {
  const P = sh.value('C6'), r = sh.value('C7') / sh.value('C9'), n = sh.value('C8') * sh.value('C9');
  const pmt = P * r / (1 - Math.pow(1 + r, -n));
  const rate = sh.value('C30');
  const cf = YEARS.map(c => (sh.value(c + '27') || 0) + (sh.value(c + '28') || 0));
  const npvAt = k => cf.reduce((t, x, i) => t + x / Math.pow(1 + k, i), 0);
  let lo = -0.99, hi = 10; for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (npvAt(mid) > 0) lo = mid; else hi = mid; }
  const cum = []; cf.forEach((x, i) => cum.push((i ? cum[i - 1] : 0) + x));
  const frac = cum.slice(0, 5).reduce((t, x, i) => t + (x < 0 && cum[i + 1] >= 0 ? -x / cf[i + 1] : 0), 0);
  const sched = []; let bal = P;
  for (let m = 0; m < 12; m++) { const int = bal * r, prin = pmt - int; sched.push([bal, int, prin, bal - prin]); bal -= prin; }
  return { pmt, npv: npvAt(rate), irr: (lo + hi) / 2, payback: cum.filter(x => x < 0).length + frac, sched };
}
const payment = sh => liveAt(sh, 'C16', figures(sh).pmt);
const byHand = sh => liveAt(sh, 'C33', figures(sh).npv) && YEARS.every(c => !!sh.cellAt(c + '31').formula && !!sh.cellAt(c + '32').formula);
const byFunction = sh => liveAt(sh, 'C34', figures(sh).npv);
const irr = sh => liveAt(sh, 'C36', figures(sh).irr, 1e-6);
const payback = sh => liveAt(sh, 'C40', figures(sh).payback);
const schedule = sh => { const s = figures(sh).sched; return s.every((row, i) => sh.value('C' + (44 + i)) === i + 1 && ['D', 'E', 'F', 'G'].every((c, j) => !!sh.cellAt(c + (44 + i)).formula && near(sh.value(c + (44 + i)), row[j]))) && liveness(sh, 'G55').ok; };

/** The seed: another site's loan and case, the same cells every time. */
function seedCase(rng) {
  const pick = (lo, hi, step) => lo + step * Math.floor(rng() * (Math.round((hi - lo) / step) + 1));
  const site = SITES[Math.floor(rng() * SITES.length)];
  const build = -pick(4500, 6000, 250);
  let op = pick(700, 1000, 50); const flows = [build];
  for (let y = 1; y <= 5; y++) { flows.push(op); op += pick(50, 200, 50); }
  const loans = stateOf('S4d').sheets.find(s => s.name === 'Loans').cells;
  const keep = ref => ({ ...loans[ref] });
  const patch = {
    'Loans!B5': { ...keep('B5'), value: 'The ' + site + ' build loan' },
    'Loans!C6': { ...keep('C6'), value: pick(3000000, 4500000, 100000) },
    'Loans!C7': { ...keep('C7'), value: Math.round(pick(0.06, 0.09, 0.0025) * 10000) / 10000 },
    'Loans!H28': { ...keep('H28'), value: pick(6000, 8000, 250) },
    'Loans!C30': { ...keep('C30'), value: Math.round(pick(0.09, 0.12, 0.005) * 1000) / 1000 },
  };
  YEARS.forEach((c, i) => { patch['Loans!' + c + '27'] = { ...keep(c + '27'), value: flows[i] }; });
  return patch;
}

export default {
  id: 'challenge-new-site-case',
  chapter: 'formulas',
  section: 'Time value of money',
  module: 'time-value-of-money',
  workbook: 'clearcoat-databook',
  state: { before: 'S4d' },
  kind: 'challenge',
  title: 'Challenge: a new-site case valued with NPV and IRR',
  difficulty: 'hard',
  tags: ['challenge', 'formulas', 'finance', 'valuation', 'loan'],
  access: 'paid',
  minutes: 4,
  conventions: ['B4', 'C4', 'E2'],
  prerequisites: ['payment-schedule'],
  brief: 'A different site’s numbers on Loans: build the loan payment, the case with NPV by hand and by function, IRR, payback, and the first twelve months of the schedule.',
  timeLimit: 180,
  pars: parsFrom(75, { pass: 170, pro: 110 }),
  seed: seedCase,
  goals: [
    { id: 'payment', text: 'On Loans, build the monthly rate and periods in C12 and C13, then the monthly payment in C16 as a positive figure.', convention: 'C4',
      keys: 'Ctrl+PgDn → ×2 Ctrl+↓ ×3 ↓ ×3 "=C7/C9" ↵ "=C8*C9" ↵ ↓ ×2 "=-PMT(C12,C13,C6)" ↵',
      check: (s, ses) => { const sh = loans(ses); return !!sh && payment(sh) && settled(ses); } },
    { id: 'by-hand', text: 'Discount the case by hand: factors in C31:H31, discounted flows in C32:H32 and their sum, the NPV, in C33.', convention: 'E2',
      keys: 'Ctrl+↓ ×4 ↓ "=1/(1+$C$30)^C25" ↵ "=C29*C31" ↵ ↑ ×2 Shift+↓ Shift+→ ×5 Ctrl+R ↓ ×2 "=SUM(C32:H32)" ↵',
      check: (s, ses) => { const sh = loans(ses); return !!sh && byHand(sh) && settled(ses); } },
    { id: 'npv-function', text: 'In C34 take the NPV with the function, the year 0 build kept outside it.',
      keys: '"=NPV(C30,D29:H29)+C29" ↵',
      check: (s, ses) => { const sh = loans(ses); return !!sh && byFunction(sh) && settled(ses); } },
    { id: 'irr', text: 'In C36 find the site’s IRR over all six cash flows.',
      keys: '↓ "=IRR(C29:H29)" ↵',
      check: (s, ses) => { const sh = loans(ses); return !!sh && irr(sh) && settled(ses); } },
    { id: 'payback', text: 'Work out the payback in C40: the cumulative cash in row 38, the crossing fraction in row 39, then the years.',
      keys: '↓ "=C29" Tab "=C38+D29" Tab ← Shift+→ ×4 Ctrl+R ↓ ← \'=IF(AND(C38<0,D38>=0),-C38/D29,0)\' ↵ ↑ Shift+→ ×4 Ctrl+R ↓ \'=COUNTIF(C38:H38,"<0")+SUM(C39:G39)\' ↵',
      check: (s, ses) => { const sh = loans(ses); return !!sh && payback(sh) && settled(ses); } },
    { id: 'schedule', text: 'Build the first twelve months of the schedule in C44:G55: months 1 to 12, opening, interest, principal and closing.', convention: 'E2',
      keys: 'Ctrl+↓ ↓ "1" ↵ ↑ Shift+↓ ×11 Alt H F I S ↵ → "=C6" Tab "=D44*$C$12" Tab "=$C$16-E44" Tab "=D44-F44" ↵ "=G44" ↵ ↑ Shift+↓ ×10 Ctrl+D ↑ → Shift+→ ×2 Shift+↓ ×11 Ctrl+D',
      check: (s, ses) => { const sh = loans(ses); return !!sh && schedule(sh) && settled(ses); } },
  ],
  graders: [
    ses => { const sh = loans(ses); if (!sh) return { ok: false, why: 'the Loans sheet is missing' };
      if (!payment(sh)) return { ok: false, why: 'C16 does not read the monthly payment: the rate and the periods have to be monthly too' };
      if (!byHand(sh)) return { ok: false, why: 'C33 does not add up the discounted flows in C32:H32' };
      if (!byFunction(sh)) return { ok: false, why: 'C34 does not match the NPV: keep the year 0 build outside NPV and add it after' };
      return { ok: true }; },
    ses => { const sh = loans(ses); if (!sh) return { ok: false, why: 'the Loans sheet is missing' };
      if (!irr(sh)) return { ok: false, why: 'C36 does not read the IRR of all six flows, year 0 included' };
      if (!payback(sh)) return { ok: false, why: 'C40 does not read the payback in years' };
      if (!schedule(sh)) return { ok: false, why: 'rows 44 to 55 do not run the first twelve months of the loan' };
      return { ok: true }; },
  ],
  solution: 'Ctrl+PgDn Right Right Ctrl+Down Ctrl+Down Ctrl+Down Down Down Down "=C7/C9" Enter "=C8*C9" Enter Down Down "=-PMT(C12,C13,C6)" Enter Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Down "=1/(1+$C$30)^C25" Enter "=C29*C31" Enter Up Up Shift+Down Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+R Down Down "=SUM(C32:H32)" Enter "=NPV(C30,D29:H29)+C29" Enter Down "=IRR(C29:H29)" Enter Down "=C29" Tab "=C38+D29" Tab Left Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+R Down Left \'=IF(AND(C38<0,D38>=0),-C38/D29,0)\' Enter Up Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+R Down \'=COUNTIF(C38:H38,"<0")+SUM(C39:G39)\' Enter Ctrl+Down Down "1" Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Alt H F I S Enter Right "=C6" Tab "=D44*$C$12" Tab "=$C$16-E44" Tab "=D44-F44" Enter "=G44" Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Up Right Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D',
};
