// Chapter 3 · 3.5.3 IRR and XIRR (clearcoat-databook, S5b → S5c)
// The Cedar Park case on Loans again: the learner finds the site's own return with IRR (C36), proves
// it by pointing the discount rate at it and reading NPV at zero, puts 10% back with Ctrl+Z, adds
// XIRR on the dates (C37), then payback: cumulative cash across C38:H38, the fraction of the
// crossing year across C39:G39 and the payback in C40. Checks read the figures the current flows
// give and the shared liveness rule. The closer halves the sale value in H28.
import { liveness } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const loans = ses => sheetOf(ses, 'Loans');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b, tol = 1e-6) => isNum(a) && isNum(b) && Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const liveAt = (sh, ref, want, tol) => !!sh && near(sh.value(ref), want, tol) && liveness(sh, ref).ok;
const YEARS = ['C', 'D', 'E', 'F', 'G', 'H'];

/** The case's flows, dates and the figures they give: IRR by bisection, XIRR the same way on day counts. */
function caseOf(sh) {
  const cf = YEARS.map(c => sh.value(c + '29'));
  const dates = YEARS.map(c => sh.value(c + '26'));
  const solve = f => { let lo = -0.99, hi = 10; for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (f(mid) > 0) lo = mid; else hi = mid; } return (lo + hi) / 2; };
  const irr = solve(r => cf.reduce((t, x, i) => t + x / Math.pow(1 + r, i), 0));
  const xirr = solve(r => cf.reduce((t, x, i) => t + x / Math.pow(1 + r, (dates[i] - dates[0]) / 365), 0));
  const cum = []; cf.forEach((x, i) => cum.push((i ? cum[i - 1] : 0) + x));
  const frac = YEARS.slice(0, 5).map((c, i) => (cum[i] < 0 && cum[i + 1] >= 0 ? -cum[i] / cf[i + 1] : 0));
  const payback = cum.filter(x => x < 0).length + frac.reduce((t, x) => t + x, 0);
  return { cf, irr, xirr, cum, frac, payback };
}
const irrDone = sh => liveAt(sh, 'C36', caseOf(sh).irr, 1e-6);
const xirrDone = sh => liveAt(sh, 'C37', caseOf(sh).xirr, 1e-5);
const cumulative = sh => { const k = caseOf(sh); return YEARS.every((c, i) => liveAt(sh, c + '38', k.cum[i])); };
const fractions = sh => { const k = caseOf(sh); return YEARS.slice(0, 5).every((c, i) => isNum(sh.value(c + '39')) && near(sh.value(c + '39'), k.frac[i]) && !!sh.cellAt(c + '39').formula); };
const payback = sh => liveAt(sh, 'C40', caseOf(sh).payback);
const rateBack = sh => !sh.cellAt('C30').formula && sh.value('C30') === 0.1;

export default {
  id: 'irr-xirr',
  chapter: 'formulas',
  section: 'Time value of money',
  module: 'time-value-of-money',
  workbook: 'clearcoat-databook',
  state: { before: 'S5b', after: 'S5c' },
  title: 'IRR and XIRR',
  difficulty: 'medium',
  tags: ['formulas', 'finance', 'valuation'],
  access: 'paid',
  minutes: 7,
  headline: 'IRR',
  conventions: ['C3'],
  teaches: ['irr'],
  uses: ['npv', 'fill-down-right', 'sum-family', 'formula-basics', 'formula-operators', 'go-to', 'undo-redo', 'ctrl-arrow', 'shift-arrow', 'arrow-keys', 'tab-commits'],
  prerequisites: ['npv-xnpv'],
  brief: 'The rate where NPV is zero is the internal rate of return: the return the site itself earns. IRR takes the cash flows, year 0 included, and finds it; XIRR takes dates and does the same for uneven timing. Payback is simpler and buyers ask for it too: the year the cash out is recovered. Add all three to the case and read them the way a buyer does. The key is `IRR`.',
  wow: 'You have the site’s own return now, and the year it pays itself back.',
  goals: [
    { id: 'irr', teach: 'IRR(flows) finds the rate at which the flows discount to zero, so year 0 goes inside this time. It returns #NUM! when every flow has the same sign, or when its search fails from its 10% starting guess; an optional second argument, guess, gives it a new place to start.',
      text: 'On Loans, in C36 find the site’s own return with =IRR(C29:H29), year 0 included, and read it against the 10% discount rate.',
      keys: 'Ctrl+G "Loans!C36" ↵ "=IRR(C29:H29)" ↵', requires: ['irr', 'go-to', 'formula-basics'],
      hintStuck: 'pulse cell C36 · All six flows go in, from the build in C29 to the sale year in H29.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && irrDone(sh) && settled(ses); } },
    { id: 'prove', text: 'Prove it: point the discount rate at the IRR with =C36 in C30, and the NPV in C34 reads zero.',
      keys: 'Ctrl+↑ ×2 ↓ "=C36" ↵', requires: ['irr', 'formula-basics', 'ctrl-arrow', 'arrow-keys'],
      hintStuck: 'pulse cell C30 · At the IRR the discounted flows cancel out exactly.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && irrDone(sh) && near(sh.value('C30'), caseOf(sh).irr) && Math.abs(sh.value('C34')) < 0.01 && settled(ses); } },
    { id: 'rate-back', text: 'Put the 10% discount rate back in C30 with Ctrl+Z.',
      keys: 'Ctrl+Z', requires: ['undo-redo'],
      hintStuck: 'pulse cell C30 · One undo takes the cell back to the blue 10% input.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && irrDone(sh) && rateBack(sh) && settled(ses); } },
    { id: 'xirr', teach: 'XIRR(flows, dates) finds the same rate on the actual dates, by the days between them, the way XNPV discounts. On flows a year apart it lands close to IRR.',
      text: 'In C37 build the dated return, =XIRR(C29:H29,C26:H26).',
      keys: 'Ctrl+↓ ↓ "=XIRR(C29:H29,C26:H26)" ↵', requires: ['irr', 'formula-basics', 'ctrl-arrow', 'arrow-keys'],
      hintStuck: 'pulse cell C37 · The flows first, then the dates in row 26.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && rateBack(sh) && xirrDone(sh) && settled(ses); } },
    { id: 'cumulative', teach: 'Payback reads the cash added up year by year: year 0 is its own flow, and every later year is the last running total plus that year’s flow. The year the running total turns positive is the year the build is paid back.',
      text: 'Run cumulative cash along row 38: =C29 in C38, =C38+D29 in D38, then fill D38 right to H38.',
      keys: '"=C29" Tab "=C38+D29" Tab ← Shift+→ ×4 Ctrl+R', requires: ['fill-down-right', 'formula-basics', 'formula-operators', 'tab-commits', 'shift-arrow', 'arrow-keys'], convention: 'C3',
      hintStuck: 'pulse range C38:H38 · Each year adds its own flow to the total before it.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && xirrDone(sh) && cumulative(sh) && settled(ses); } },
    { id: 'fraction', teach: 'In the year the total crosses zero, the part of the year it took is what was still owed at the start over that year’s flow. =IF(AND(C38<0,D38>=0),-C38/D29,0) gives that fraction in the crossing year and zero everywhere else.',
      text: 'In C39 write =IF(AND(C38<0,D38>=0),-C38/D29,0) for the fraction of the crossing year, and fill it right to G39.',
      keys: '↓ ← \'=IF(AND(C38<0,D38>=0),-C38/D29,0)\' ↵ ↑ Shift+→ ×4 Ctrl+R', requires: ['fill-down-right', 'formula-basics', 'formula-operators', 'shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range C39:G39 · Only one year crosses, so only one cell reads more than zero.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && cumulative(sh) && fractions(sh) && settled(ses); } },
    { id: 'payback', text: 'In C40 the payback is the years still negative plus the fraction: =COUNTIF(C38:H38,"<0")+SUM(C39:G39).',
      keys: '↓ \'=COUNTIF(C38:H38,"<0")+SUM(C39:G39)\' ↵', requires: ['sum-family', 'formula-basics', 'formula-operators', 'arrow-keys'],
      hintStuck: 'pulse cell C40 · COUNTIF counts the years before the crossing, and the fraction finishes it.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && fractions(sh) && payback(sh) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Loans!H28" Enter "3500" Enter Ctrl+G "Loans!C36" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Watch the sale value in H28 halve and the IRR, the NPV and the payback all answer.', requires: [],
      hintStuck: 'pulse cell C36 · Most of the case’s value is in the sale.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'IRR and XIRR sit in C36 and C37 as live formulas, with the discount rate back at 10%', check: (s, ses) => { const sh = loans(ses); return !!sh && irrDone(sh) && xirrDone(sh) && rateBack(sh); } },
    { text: 'Cumulative cash, the crossing fraction and the payback run through rows 38 to 40', check: (s, ses) => { const sh = loans(ses); return !!sh && cumulative(sh) && fractions(sh) && payback(sh); } },
  ],
  closing: [
    'Cedar Park earns about 26% a year on its own cash, well above the 10% a buyer asks for, and the build is paid back a little over five years in, most of it by the sale.',
    'Read the two together the way a buyer does: IRR against the discount rate says whether the site is worth building, and payback against the hold says how long the money is out.',
  ],
  solution: 'Ctrl+G "Loans!C36" Enter "=IRR(C29:H29)" Enter Ctrl+Up Ctrl+Up Down "=C36" Enter Ctrl+Z Ctrl+Down Down "=XIRR(C29:H29,C26:H26)" Enter "=C29" Tab "=C38+D29" Tab Left Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+R Down Left \'=IF(AND(C38<0,D38>=0),-C38/D29,0)\' Enter Up Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+R Down \'=COUNTIF(C38:H38,"<0")+SUM(C39:G39)\' Enter',
};
