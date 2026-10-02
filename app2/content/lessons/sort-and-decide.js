// Chapter 6 · 6.2.2 Sort by date and size, and decide what's comparable (clearcoat-valuation, B622 → B623)
// The learner pastes a values copy of the set (date, enterprise value, multiple) under the spread in
// date order and then by size, sets an include flag and a reason on every deal, builds the helper
// columns the statistics read, takes the median, mean, quartiles and extremes of what is left, and
// reads the control premium and the DCF's exit multiple against the two medians. The copy is graded
// on its order and on matching each deal's own row; the flags on the judgment the script makes; the
// formulas on the reference evaluated in the learner's sheet; the median on the liveness rule.
import { sheetIn, settled, near, isNum, built, typedAs, liveVia, plant, given, refsOf, fill, typeDown, cellsAt, R, solutionOf } from './lib/deal-checks.js';

const AFTER = 'B623';
const P = 'Precedents';
const DEALS = ['d0', 'd1', 'd2', 'd3', 'd4', 'd5'];
const r0 = R(P, 'd0'), r5 = R(P, 'd5');
const SORT = ['sort0', 'sort1', 'sort2', 'sort3', 'sort4', 'sort5'];
const s0 = R(P, 'sort0'), s5 = R(P, 'sort5');
const col = c => refsOf(P, DEALS, [c]);
const span = c => `${c}${r0}:${c}${r5}`;
const STATS = ['stMed', 'stMean', 'stLow', 'stHigh', 'stMin', 'stMax'];
const st0 = R(P, 'stMed'), st5 = R(P, 'stMax');
const HELP = ['S', 'T'];
const READ = ['tradMed', 'precMed', 'ctrlPrem'].map(k => 'C' + R(P, k));
const DCF = ['dcfExit', 'dcfRead'].map(k => 'C' + R(P, k));
const NATIONWIDE = R(P, 'd1');
const F = ref => cellsAt(AFTER, P)[ref].formula;

/** The values copy: each row of C:E is typed (no formula), matches the deal its label in B names, and the rows run by date, then by size. */
function copyOk(ses) {
  const sh = sheetIn(ses, P); if (!sh) return false;
  const byTarget = {};
  for (let r = r0; r <= r5; r++) byTarget[String(sh.value('D' + r)).toLowerCase()] = r;
  let prev = null;
  for (let r = s0; r <= s5; r++) {
    const d = byTarget[String(sh.value('B' + r)).toLowerCase()]; if (!d) return false;
    const want = [sh.value('C' + d), sh.value('G' + d), sh.value('J' + d)];
    const got = ['C', 'D', 'E'].map(c => sh.cells[c + r]);
    if (!got.every((c, i) => c && !c.formula && isNum(c.value) && near(c.value, want[i], 1e-9 * Math.max(1, Math.abs(want[i]))))) return false;
    const key = [got[0].value, got[1].value];
    if (prev && (key[0] < prev[0] || (key[0] === prev[0] && key[1] < prev[1]))) return false;
    prev = key;
  }
  return true;
}
const helpersOk = ses => built(ses, P, [...col('S'), ...col('T')], AFTER);
const statsOk = ses => built(ses, P, refsOf(P, STATS, HELP), AFTER);
const paste = (from, to) => `Ctrl+G "${P}!${from}" ↵ Ctrl+C Ctrl+G "${P}!${to}" ↵ Ctrl+Alt+V V ↵`;
const statKeys = STATS.map(k => fill(AFTER, P, `S${R(P, k)}:T${R(P, k)}`)).join(' ');

const goals = [
  { id: 'copy', text: `A values copy in C${s0}:E${s5}, oldest deal first and then by size: each deal’s date, enterprise value and multiple.`,
    teach: 'Sort a copy, never the spread itself, so every formula above keeps its row. The deals came in announced order already, so a sort by date (Alt, A, S, S) leaves them where they are, and size only breaks a tie.',
    keys: `${paste(`C${r0}:C${r5}`, `C${s0}`)} ${paste(`G${r0}:G${r5}`, `D${s0}`)} ${paste(`J${r0}:J${r5}`, `E${s0}`)} Esc`,
    requires: ['paste-special', 'copy-cut-paste', 'sort-dialog', 'go-to'], convention: 'E4',
    hintStuck: `pulse range C${s0}:E${s5} · Copy C, G and J of the spread in turn and Paste Special Values beside each name.`,
    check: (s, ses) => settled(ses) && copyOk(ses) },
  { id: 'flags', text: `Include flags in ${span('Q')}: 0 for Bluewater (four years old) and Nationwide (a national chain), 1 for the other four.`,
    teach: 'Deciding what is comparable is the judgment, and the flag is how it’s made visible. Bluewater was priced when rates were two points lower; Nationwide is five times Clearcoat’s size; Crestline stays in, noted, because its buyer was a strategic.',
    keys: typeDown(AFTER, P, col('Q')), requires: ['comparable-screen', 'type-to-enter', 'go-to'], convention: 'B4',
    hintStuck: `pulse range ${span('Q')} · A 1 keeps a deal in every statistic; a 0 takes it out.`,
    check: (s, ses) => settled(ses) && typedAs(ses, P, col('Q'), AFTER) },
  { id: 'reasons', text: `A reason beside every flag in ${span('R')}, so the page says why each deal is in or out.`,
    keys: typeDown(AFTER, P, col('R')), requires: ['comparable-screen', 'type-to-enter', 'go-to'], convention: 'B6',
    hintStuck: `pulse range ${span('R')} · Out and why for the two you dropped; In for the rest, with Crestline’s buyer noted.`,
    check: (s, ses) => settled(ses) && col('R').every(ref => { const c = sheetIn(ses, P).cells[ref]; return !!c && !c.formula && typeof c.value === 'string' && c.value.trim().length > 1; }) },
  { id: 'helpers', text: `The helper columns in ${span('S')} and ${span('T')}: the multiple and EV per site where the flag is 1, blank where it’s 0.`,
    teach: 'MEDIAN and QUARTILE.INC skip a blank text result, so a helper column of =IF(include=1,multiple,"") is how a screened deal drops out of every statistic without being deleted.',
    keys: `${fill(AFTER, P, span('S'))} ${fill(AFTER, P, span('T'))}`, requires: ['comparable-screen', 'if-function', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range S${r0}:T${r5} · ${F('S' + r0)} reads the flag in Q and the multiple in J.`,
    check: (s, ses) => settled(ses) && helpersOk(ses) },
  { id: 'stats', text: `The median, mean, quartiles, minimum and maximum of the included deals in S${st0}:T${st5}, each row filled across.`,
    keys: statKeys, requires: ['ctrl-enter-fill', 'sum-family', 'go-to'], convention: 'C3',
    hintStuck: `pulse range S${st0}:T${st5} · MEDIAN, AVERAGE, QUARTILE.INC at 1 and 3, MIN and MAX of rows ${r0} to ${r5}.`,
    check: (s, ses) => settled(ses) && statsOk(ses) && liveVia(ses, P, 'S' + st0, [`${P}!Q${R(P, 'd2')}`]) },
  { id: 'premium', text: `In ${READ[0]}:${READ[2]}, the trading median from Comps, the precedents median, and the control premium the gap implies.`,
    teach: 'Trading multiples price a slice of a company; a precedent prices the whole of it. The precedents median over the trading median, less one, is the premium a buyer paid for control.',
    keys: typeDown(AFTER, P, READ), requires: ['cross-sheet-ref', 'link-colour-convention', 'formula-basics', 'go-to'], convention: 'B4',
    hintStuck: `pulse range ${READ[0]}:${READ[2]} · The trading median is Comps!D${R('Comps', 'rgMult')}; the precedents median is S${st0}.`,
    check: (s, ses) => settled(ses) && built(ses, P, READ, AFTER) },
  { id: 'dcf', text: `Read the DCF’s exit multiple in ${DCF[0]} against both medians with the IF in ${DCF[1]}.`,
    keys: typeDown(AFTER, P, DCF), requires: ['and-or-not', 'if-function', 'min-max-cap', 'cross-sheet-ref', 'go-to'], convention: 'B4',
    hintStuck: `pulse range ${DCF[0]}:${DCF[1]} · The exit multiple is on Inputs; it should sit between the two medians, or have a reason not to.`,
    check: (s, ses) => settled(ses) && built(ses, P, DCF, AFTER) },
  { id: 'tie', closer: true, demo: { script: `Ctrl+G "${P}!Q${NATIONWIDE}" Enter "1" Enter Ctrl+G "${P}!S${R(P, 'stHigh')}" Enter`, cadence: 320 },
    text: 'Does it tie? Watch Nationwide come back in: the median moves and the range between the quartiles widens.', requires: [],
    hintStuck: `pulse range ${P}!S${R(P, 'stLow')}:S${R(P, 'stHigh')} · Every statistic reads the helper column, and the helper reads the flag.`,
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'sort-and-decide',
  chapter: 'valuation',
  section: 'Precedent transactions',
  module: 'precedent-transactions',
  workbook: 'clearcoat-valuation',
  state: { before: 'B622', after: AFTER },
  plant: {
    ...given(AFTER, P, ['C', 'D', 'E'].map(c => c + (s0 - 1))),
    ...plant(AFTER, P, [...SORT.flatMap(k => ['C', 'D', 'E'].map(c => c + R(P, k))), ...col('Q'), ...col('R'), ...col('S'), ...col('T'), ...refsOf(P, STATS, HELP), ...READ, ...DCF]),
  },
  title: 'Sort by date and size, and decide what’s comparable',
  difficulty: 'medium',
  tags: ['valuation', 'precedents', 'statistics'],
  access: 'paid',
  minutes: 7,
  headline: 'Alt A S S',
  conventions: ['B4', 'B6', 'C3', 'E4'],
  teaches: ['comparable-screen'],
  uses: ['deal-multiples', 'paste-special', 'copy-cut-paste', 'sort-dialog', 'if-function', 'and-or-not', 'min-max-cap', 'sum-family', 'cross-sheet-ref', 'link-colour-convention', 'formula-basics', 'ctrl-enter-fill', 'type-to-enter', 'go-to'],
  prerequisites: ['deal-multiples-premiums'],
  brief: 'Not every deal counts: one is four years old and priced in a different rate environment, one is a 200-site national chain, one is a strategic buying a competitor. Sort a copy by date, then by size, read each deal against Clearcoat, and set an include flag with a reason. Then the median and range on what’s left. Deciding what’s comparable is the judgment; the flag is how it’s made visible. The key is `Alt A S S`.',
  goals,
  endState: [
    { text: 'Every deal carries a flag and a reason, and the statistics read only the deals that count', check: (s, ses) => typedAs(ses, P, col('Q'), AFTER) && helpersOk(ses) && statsOk(ses) },
  ],
  closing: [
    'Four deals count, and the page says why each of the others doesn’t.',
    'Best practice: flag, don’t delete. A deal taken out stays on the page with its reason, so the next reader can disagree with the judgment and flip one cell.',
  ],
  solution: solutionOf(goals),
};
