// Practice · Formulas — Override (script-drills D51, Wave 1; after 3.1.4). Summary (state S6d) with ops'
// override column in R carrying a number for Mueller and the note closed for South Lamar, and the
// washes used in S and revenue per wash in Q emptied. Washes used reads the override when it is a
// number, Hold when it is a note, the POS count otherwise; revenue per wash divides by washes used
// and reads NM where it can't (the note, and Cedar Park's empty first day). Graded on each column
// against the reference formula on the learner's cells, again after a what-if types a new override.
import { databookDrill, emptied, refsOf, expected, cellIn, sheetIn, settled, isNum, under, toScript } from './databook-drills.js';

const S = 'Summary', ROWS = [5, 6, 7, 8, 9, 10];
const REF = { used: r => `=IF(ISNUMBER(R${r}),R${r},IF(ISTEXT(R${r}),"Hold",C${r}))`, perWash: r => `=IFERROR(H${r}/S${r},"NM")` };
const COL = { used: 'S', perWash: 'Q' };
const OVERRIDES = { R6: { value: 240 }, R8: { value: 'closed' } };
const close = (a, b) => (isNum(b) ? isNum(a) && Math.abs(a - b) < 1e-9 : a === b);
/** Every row of the column holds a formula reading what the reference gives there. */
const col = (ses, id) => { const sh = sheetIn(ses, S); return !!sh && ROWS.every(r => { const ref = COL[id] + r; return !!sh.formula(ref) && close(sh.value(ref), expected(sh, ref, REF[id](r))); }); };
/** …and again with a new override typed for Domain, and with South Lamar's note cleared. */
const holds = (ses, id) => col(ses, id) && under(ses, { [`${S}!R5`]: 300 }, x => col(x, id)) && under(ses, { [`${S}!R8`]: null }, x => col(x, id));
function plant() {
  const p = emptied(S, [...refsOf('S5:S10'), ...refsOf('Q5:Q10')]);
  for (const [ref, rec] of Object.entries(OVERRIDES)) { const { value, formula, ...fmt } = cellIn(S, ref) || {}; p[`${S}!${ref}`] = { ...fmt, ...rec }; }
  return p;
}
const nm = ses => { const sh = sheetIn(ses, S); return sh.value('Q8') === 'NM' && sh.value('Q10') === 'NM'; };
const KEYS = { used: `Ctrl+G "Summary!S5:S10" ↵ '${REF.used(5)}' Ctrl+↵`, perWash: `Ctrl+G "Summary!Q5:Q10" ↵ '${REF.perWash(5)}' Ctrl+↵` };

export default databookDrill({
  id: 'ch3-override',
  title: 'Override',
  task: 'Ops can overrule the POS count: read the override when it’s a number, hold it when it’s a note, and keep the ratio from erroring.',
  module: 'logic',
  state: { before: 'S6d' },
  plant,
  goals: [
    { id: 'used', text: 'Summary S5:S10: the override in R when it’s a number, Hold when it’s a note, the POS washes in C otherwise.', keys: KEYS.used,
      check: (s, ses) => settled(ses) && holds(ses, 'used') },
    { id: 'perWash', text: 'Summary Q5:Q10: revenue in H over the washes used in S, NM where it can’t be divided.', keys: KEYS.perWash,
      check: (s, ses) => settled(ses) && holds(ses, 'perWash') && nm(ses) },
  ],
  endState: [
    { text: 'Washes used and revenue per wash tie on every row, NM on the two that can’t divide, and both follow a new override', check: (s, ses) => holds(ses, 'used') && holds(ses, 'perWash') && nm(ses) },
  ],
  solution: toScript(`${KEYS.used} ${KEYS.perWash}`),
  optimalKeys: 110,
  route: 45,
});
