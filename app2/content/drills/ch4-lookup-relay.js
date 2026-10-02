// Practice · Data and Lookups — Lookup relay (screenplay 6.2). The lookups module's finished pack
// (S418) with a small block on Lists under the checks: a package code in C30, and the retail price
// and the monthly fee to find three ways, VLOOKUP, INDEX with MATCH and XLOOKUP. Each line is graded
// on the function it calls (the parsed tokens) and on the figure the package table gives for the
// code, then again with the code moved to U (the what-if), so a typed figure never passes.
import { packDrill, packCell, solutionOf } from './pack-drills.js';
import { sheetIn, calls, near, isNum, settled } from '../lessons/lib/databook-checks.js';
import { under } from '../lessons/lib/model-checks.js';

const S = 'Lists', CODE = 'C30';
const LINES = { vlookup: 31, index: 32, xlookup: 33 };
const FNS = { vlookup: ['VLOOKUP'], index: ['INDEX', 'MATCH'], xlookup: ['XLOOKUP'] };
const money = () => { const { value, ...f } = packCell('S418', S, 'D15') || {}; void value; return f; };
const plant = () => {
  const m = money();
  return {
    [`${S}!B28`]: { value: 'One package, three lookups', bold: true },
    [`${S}!C29`]: { value: 'Retail price ($)', bold: true, align: 'r' }, [`${S}!D29`]: { value: 'Monthly fee ($)', bold: true, align: 'r' },
    [`${S}!B30`]: { value: 'Package code' }, [`${S}!${CODE}`]: { value: 'D', fontColor: 'blue', align: 'r' },
    [`${S}!B31`]: { value: 'By VLOOKUP' }, [`${S}!B32`]: { value: 'By INDEX and MATCH' }, [`${S}!B33`]: { value: 'By XLOOKUP' },
    ...Object.fromEntries(['C', 'D'].flatMap(c => Object.values(LINES).map(r => [`${S}!${c}${r}`, { ...m }]))),
  };
};
/** What the package table (B14:E16) gives for the code in C30: the price in D, the fee in E. */
const want = (sh, col) => { const code = String(sh.value(CODE) || '').toUpperCase(); const r = [14, 15, 16].find(x => String(sh.value('B' + x)).toUpperCase() === code); return r ? sh.value(col + r) : null; };
const lineOk = (sh, key) => ['C', 'D'].every((c, i) => { const ref = c + LINES[key]; const w = want(sh, i ? 'E' : 'D'); return calls(sh, ref, FNS[key]) && isNum(w) && near(sh.value(ref), w); });
/** The line reads the code: right on D, and right again with U in C30. */
const line = (ses, key) => { const sh = sheetIn(ses, S); return !!sh && lineOk(sh, key) && (sh.value(CODE) !== 'D' || under(ses, { [`${S}!${CODE}`]: 'U' }, x => lineOk(sheetIn(x, S), key))); };
const all = ses => Object.keys(LINES).every(k => line(ses, k));

const GOALS = [
  { id: 'vlookup', text: 'In Lists C31:D31, the price and the fee for the code in C30 by VLOOKUP on B14:E16, exact match.',
    keys: 'Ctrl+G "Lists!C31" ↵ "=VLOOKUP($C$30,$B$14:$E$16,3,FALSE)" Tab "=VLOOKUP($C$30,$B$14:$E$16,4,FALSE)" ↵',
    check: (s, ses) => settled(ses) && line(ses, 'vlookup') },
  { id: 'index', text: 'In C32:D32, the same two by INDEX and MATCH, one formula filled across.',
    keys: 'Ctrl+G "Lists!C32:D32" ↵ "=INDEX(D$14:D$16,MATCH($C$30,$B$14:$B$16,0))" Ctrl+↵',
    check: (s, ses) => settled(ses) && line(ses, 'index') },
  { id: 'xlookup', text: 'In C33:D33, the same two by XLOOKUP.',
    keys: 'Ctrl+G "Lists!C33:D33" ↵ "=XLOOKUP($C$30,$B$14:$B$16,D$14:D$16)" Ctrl+↵',
    check: (s, ses) => settled(ses) && line(ses, 'xlookup') },
  { id: 'switch', text: 'Type U in C30: all three lines move to Ultimate together.',
    keys: 'Ctrl+G "Lists!C30" ↵ "U" ↵',
    check: (s, ses) => { const sh = sheetIn(ses, S); return settled(ses) && !!sh && String(sh.value(CODE)).toUpperCase() === 'U' && Object.keys(LINES).every(k => lineOk(sh, k)); } },
];

export default packDrill({
  id: 'ch4-lookup-relay',
  title: 'Lookup relay',
  task: 'The same price three ways: VLOOKUP, INDEX and MATCH, XLOOKUP.',
  module: 'lookups',
  state: { before: 'S418' },
  plant,
  goals: GOALS,
  endState: [
    { text: 'Three lookups read the code in C30 and agree on its price and fee', check: (s, ses) => all(ses) },
  ],
  solution: solutionOf(GOALS),
  optimalKeys: 220,
  route: 45,
});
