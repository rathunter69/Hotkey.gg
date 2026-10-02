// Chapter 3 · 3.5.2 NPV and XNPV: a new-site case (clearcoat-databook, S5a → S5b)
// The new-site case on Loans: years in C25:H25, dates in C26:H26, the cash flow in C29:H29 (year 0
// the $5,000k build, year 5 with the $7,000k sale), the 10% discount rate in C30. The learner
// discounts by hand (factors in C31:H31 filled right with the rate anchored, discounted flows in
// C32:H32, their SUM in C33), then with NPV, year 0 outside (C34), tries the trap in C35 (year 0
// inside NPV, discounted a year too far) and replaces it with XNPV on the dates. Checks read the
// figures the current inputs give and the shared liveness rule. The closer moves the rate to 15%.
import { liveness } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const loans = ses => sheetOf(ses, 'Loans');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
const liveAt = (sh, ref, want) => !!sh && near(sh.value(ref), want) && liveness(sh, ref).ok;
const YEARS = ['C', 'D', 'E', 'F', 'G', 'H'];

/** The case as the sheet holds it now: rate, years, dates and flows. */
function caseOf(sh) {
  const rate = sh.value('C30');
  const rows = YEARS.map(c => ({ c, year: sh.value(c + '25'), date: sh.value(c + '26'), cf: sh.value(c + '29') }));
  const df = rows.map(x => 1 / Math.pow(1 + rate, x.year));
  const npv = rows.reduce((t, x, i) => t + x.cf * df[i], 0);
  const trap = rows.reduce((t, x, i) => t + x.cf / Math.pow(1 + rate, i + 1), 0);
  const xnpv = rows.reduce((t, x) => t + x.cf / Math.pow(1 + rate, (x.date - rows[0].date) / 365), 0);
  return { rate, rows, df, npv, trap, xnpv };
}
const factors = sh => { const k = caseOf(sh); return YEARS.every((c, i) => liveAt(sh, c + '31', k.df[i])); };
const discounted = sh => { const k = caseOf(sh); return YEARS.every((c, i) => liveAt(sh, c + '32', k.rows[i].cf * k.df[i])); };
const byHand = sh => liveAt(sh, 'C33', caseOf(sh).npv);
const byFunction = sh => liveAt(sh, 'C34', caseOf(sh).npv);
const trapTried = sh => liveAt(sh, 'C35', caseOf(sh).trap);
const dated = sh => liveAt(sh, 'C35', caseOf(sh).xnpv);

export default {
  id: 'npv-xnpv',
  chapter: 'formulas',
  section: 'Time value of money',
  module: 'time-value-of-money',
  workbook: 'clearcoat-databook',
  state: { before: 'S5a', after: 'S5b' },
  title: 'NPV and XNPV: a new-site case',
  difficulty: 'medium',
  tags: ['formulas', 'finance', 'valuation'],
  access: 'paid',
  minutes: 7,
  headline: 'NPV',
  conventions: ['C3', 'E2'],
  teaches: ['npv'],
  uses: ['pmt-pv-fv', 'relative-absolute', 'f4-anchor', 'fill-down-right', 'sum-family', 'formula-basics', 'formula-operators', 'go-to', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys'],
  prerequisites: ['pv-fv-pmt'],
  brief: 'A site costs $5m all in today, land included, and earns cash for years. To compare the two you discount the future cash back to today at the return an investor requires, the discount rate, and NPV is the sum of those discounted cash flows less the cost: positive means the site earns more than that return. NPV in Excel starts one period out, so the year 0 build sits outside it, and XNPV takes dates for uneven timing. Value the Cedar Park case both ways. The key is `NPV`.',
  wow: 'Five years of cash discounted to today say the site is worth more than it cost.',
  goals: [
    { id: 'read-case', text: 'On Loans, select the case’s cash flows C29:H29: year 0 is the $5,000k build, year 5 carries the $7,000k sale.',
      keys: 'Ctrl+G "Loans!C29" ↵ Ctrl+Shift+→', requires: ['go-to', 'ctrl-shift-arrow'],
      hintStuck: 'pulse range C29:H29 · The cash flow row is the total under the operating line and the sale.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && ses.sheets[ses.sheetIndex].name === 'Loans' && sh.selectionText() === 'C29:H29' && settled(ses); } },
    { id: 'factors', teach: 'A dollar a year from now is worth 1/(1+rate) today, two years out 1/(1+rate)^2, and that fraction is the discount factor (^ raises to a power). Anchor the rate with F4 so the formula fills right and every year reads the same C30, while the year moves with each column.',
      text: 'In C31 write the discount factor =1/(1+$C$30)^C25, the rate anchored with F4, then fill it across to H31 with Ctrl+R.',
      keys: '↓ ×2 "=1/(1+$C$30)^C25" ↵ ↑ Shift+→ ×5 Ctrl+R', requires: ['npv', 'relative-absolute', 'f4-anchor', 'fill-down-right', 'formula-operators', 'shift-arrow', 'arrow-keys'], convention: 'E2',
      hintStuck: 'pulse range C31:H31 · Year 0’s factor is 1; every later one is smaller.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && factors(sh) && settled(ses); } },
    { id: 'discounted', text: 'In C32 multiply the cash flow by its factor, =C29*C31, and fill it right to H32.',
      keys: '↓ "=C29*C31" ↵ ↑ Shift+→ ×5 Ctrl+R', requires: ['fill-down-right', 'formula-operators', 'shift-arrow', 'arrow-keys'], convention: 'C3',
      hintStuck: 'pulse range C32:H32 · Each year’s cash times that year’s factor.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && factors(sh) && discounted(sh) && settled(ses); } },
    { id: 'by-hand', text: 'NPV by hand is the sum of the discounted flows: =SUM(C32:H32) in C33.',
      keys: '↓ "=SUM(C32:H32)" ↵', requires: ['sum-family', 'arrow-keys'],
      hintStuck: 'pulse cell C33 · Add the six discounted flows, the build included.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && discounted(sh) && byHand(sh) && settled(ses); } },
    { id: 'npv-function', teach: 'NPV(rate, flows) discounts the first flow it is given one period out, the next two, and so on. A cost paid today is not discounted at all, so it goes outside: years 1 to 5 inside NPV, year 0 added after it.',
      text: 'In C34 =NPV(C30,D29:H29)+C29 keeps years 1 to 5 inside and adds year 0 outside: read it against C33.',
      keys: '"=NPV(C30,D29:H29)+C29" ↵', requires: ['npv', 'formula-basics'],
      hintStuck: 'pulse cell C34 · The range starts at year 1, in column D.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && byHand(sh) && byFunction(sh) && settled(ses); } },
    { id: 'the-trap', text: 'In C35 try the trap, =NPV(C30,C29:H29): with the build inside NPV every year is discounted once too often, so it reads lower than C34.',
      keys: '"=NPV(C30,C29:H29)" ↵', requires: ['npv', 'formula-basics'],
      hintStuck: 'pulse cell C35 · This time the range starts at year 0, in column C.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && byFunction(sh) && trapTried(sh) && settled(ses); } },
    { id: 'xnpv', teach: 'XNPV(rate, flows, dates) discounts each flow by the days between its date and the first one, so year 0 sits inside it and uneven timing is handled. On dates a year apart it lands close to the NPV in C34.',
      text: 'Replace the trap in C35 with the dated version, =XNPV(C30,C29:H29,C26:H26), which discounts each flow by its date.',
      keys: '↑ "=XNPV(C30,C29:H29,C26:H26)" ↵', requires: ['npv', 'formula-basics', 'arrow-keys'],
      hintStuck: 'pulse cell C35 · XNPV takes the rate, the flows from year 0, then the dates in row 26.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && byFunction(sh) && dated(sh) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Loans!C30" Enter "15%" Enter Ctrl+G "Loans!C33" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Watch the discount rate in C30 change to 15% and the NPV in C33 and C34 fall together.', requires: [],
      hintStuck: 'pulse cell C34 · A higher required return makes future cash worth less today.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The discount factors and the discounted flows run across C31:H32, and NPV by hand in C33 agrees with the function in C34', check: (s, ses) => { const sh = loans(ses); return !!sh && factors(sh) && discounted(sh) && byHand(sh) && byFunction(sh); } },
    { text: 'C35 holds XNPV on the dates', check: (s, ses) => { const sh = loans(ses); return !!sh && dated(sh); } },
  ],
  closing: [
    'At 10% the Cedar Park case is worth about $3.5m more than the $5m it cost: by hand, by NPV with the build outside, and by XNPV on the dates, all three agree within a rounding.',
    'The trap is worth remembering because it is everywhere: NPV over a range that starts with today’s cost discounts the whole case one year too far. Keep year 0 outside, or use XNPV with the dates.',
  ],
  solution: 'Ctrl+G "Loans!C29" Enter Ctrl+Shift+Right Down Down "=1/(1+$C$30)^C25" Enter Up Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+R Down "=C29*C31" Enter Up Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+R Down "=SUM(C32:H32)" Enter "=NPV(C30,D29:H29)+C29" Enter "=NPV(C30,C29:H29)" Enter Up "=XNPV(C30,C29:H29,C26:H26)" Enter',
};
