// Practice · Formulas — Trace the error (screenplay 6.2). The Loans page (state S6d) with five faults laid
// in, each throwing its own code through the cells that read it: the payments a year in C9 gone
// (#DIV/0!), a deleted reference in the interest over the term (#REF!), the build typed as a positive
// so no rate returns (#NUM!), the word tbc where the discount rate belongs (#VALUE!) and a misspelled
// SUM (#NAME?). Each is fixed where it starts. Graded on no error code left on the page, the five
// source cells put right, and every formula on the page still a formula (no figure pasted over one).
import { databookDrill, cellIn, built, sheetIn, settled, isNum, near, toScript } from './databook-drills.js';

const L = 'Loans';
const isErr = v => typeof v === 'string' && /^#(REF!|DIV\/0!|VALUE!|NAME\?|N\/A|NUM!|NULL!)$/.test(v);
const fmtOf = ref => { const { value, formula, ...fmt } = cellIn(L, ref); return fmt; };
function plant() {
  return {
    [`${L}!C9`]: fmtOf('C9'),
    [`${L}!C18`]: { ...fmtOf('C18'), formula: '=C17-#REF!' },
    [`${L}!C27`]: { ...fmtOf('C27'), value: 5000 },
    [`${L}!C30`]: { ...fmtOf('C30'), value: 'tbc' },
    [`${L}!C33`]: { ...fmtOf('C33'), formula: '=SUMM(C32:H32)' },
  };
}
const nums = (sh, refs) => refs.every(ref => isNum(sh.value(ref)));
const loans = ses => sheetIn(ses, L);
const FIX = {
  div: ses => { const sh = loans(ses); return sh.value('C9') === 12 && !sh.formula('C9') && nums(sh, ['C12', 'C13', 'C16', 'C17']); },
  ref: ses => built(ses, L, ['C18']) && nums(loans(ses), ['C18']),
  num: ses => { const sh = loans(ses); return sh.value('C27') === -5000 && !sh.formula('C27') && nums(sh, ['C36', 'C37']); },
  value: ses => { const sh = loans(ses); return near(sh.value('C30'), 0.1, 1e-9) && !sh.formula('C30') && nums(sh, ['C31', 'C34', 'C35']); },
  name: ses => built(ses, L, ['C33']) && nums(loans(ses), ['C33']),
};
/** No error code anywhere on the page, and every cell that held a formula still holds one. */
function clean(ses) {
  const sh = loans(ses); if (!sh) return false;
  if (Object.keys(sh.cells).some(ref => isErr(sh.value(ref)))) return false;
  return formulaRefs().every(ref => !!sh.formula(ref));
}
let FORMULA_REFS = null;
/** The cells the finished page holds formulas in (read once). */
function formulaRefs() {
  if (!FORMULA_REFS) { FORMULA_REFS = []; for (let r = 1; r <= 200; r++) for (const c of 'CDEFGHIJ') { const x = cellIn(L, c + r); if (x && x.formula) FORMULA_REFS.push(c + r); } }
  return FORMULA_REFS;
}
const KEYS = {
  div: 'Ctrl+G "Loans!C9" ↵ "12" ↵', ref: 'Ctrl+G "Loans!C18" ↵ "=C17-C6" ↵', num: 'Ctrl+G "Loans!C27" ↵ "-5000" ↵',
  value: 'Ctrl+G "Loans!C30" ↵ "10%" ↵', name: 'Ctrl+G "Loans!C33" ↵ "=SUM(C32:H32)" ↵',
};

export default databookDrill({
  id: 'ch3-trace-the-error',
  title: 'Trace the error',
  task: 'Five error codes on the Loans page: fix each one at the cell it starts from.',
  module: 'auditing',
  state: { before: 'S6d' },
  plant,
  goals: [
    { id: 'div', text: 'The #DIV/0! in the monthly rate C12 starts at the payments a year in C9: there are 12.', keys: KEYS.div,
      check: (s, ses) => settled(ses) && FIX.div(ses) },
    { id: 'ref', text: 'The #REF! in the interest over the term C18 is a lost reference: the paid total in C17 less the principal in C6.', keys: KEYS.ref,
      check: (s, ses) => settled(ses) && FIX.ref(ses) },
    { id: 'num', text: 'The #NUM! in the IRR C36 starts at the build in C27, typed as a positive: the build is an outflow of 5,000.', keys: KEYS.num,
      check: (s, ses) => settled(ses) && FIX.num(ses) },
    { id: 'value', text: 'The #VALUE! in the discount factors starts at the rate in C30, which reads tbc: the rate is 10%.', keys: KEYS.value,
      check: (s, ses) => settled(ses) && FIX.value(ses) },
    { id: 'name', text: 'The #NAME? in the NPV by hand C33 is a misspelled function: sum the discounted flows C32:H32.', keys: KEYS.name,
      check: (s, ses) => settled(ses) && FIX.name(ses) },
  ],
  endState: [
    { text: 'No error code is left on the page, each fault is fixed at its source, and every formula is still a formula', check: (s, ses) => Object.values(FIX).every(f => f(ses)) && clean(ses) },
  ],
  solution: toScript(Object.values(KEYS).join(' ')),
  optimalKeys: 110,
  route: 60,
});
