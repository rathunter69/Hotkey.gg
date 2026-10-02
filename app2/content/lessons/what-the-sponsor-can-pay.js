// Chapter 6 · 6.3.6 Sensitivity on entry and exit: what the sponsor can pay (clearcoat-valuation, B636 → B641)
// The model turned around. The grid's edges are laid out (entry multiples down, exit multiples
// across, stepped from the term sheet); the learner writes the IRR grid as one formula with mixed
// anchors, paints the cells below the hurdle red with a formula rule, Goal Seeks the bid to a 20%
// IRR and puts the bid back, then builds the LBO range as formulas: the most equity that earns each
// hurdle by PV, the top price as enterprise value, its multiple and the room against the bid. The
// grid and the range are graded on the reference formula evaluated in the learner's sheet, the rule
// on what it paints, the Goal Seek on the bid seen at the 20% answer and then restored.
import { sheetIn, settled, near, built, typedAs, liveVia, plant, given, refsOf, fill, typeAcross, cellsAt, R, YRS, solutionOf } from './lib/deal-checks.js';

const AFTER = 'B641';
const L = 'LBO';
const C = k => 'C' + R(L, k);
const GRID = `D${R(L, 'sens0')}:H${R(L, 'sens4')}`;
const GRID_REFS = ['sens0', 'sens1', 'sens2', 'sens3', 'sens4'].flatMap(k => refsOf(L, [k], YRS));
const EDGES = [...refsOf(L, ['sensH'], YRS), ...['sens0', 'sens1', 'sens2', 'sens3', 'sens4'].map(C)];
const LMH = ['C', 'D', 'E'];
const HEAD = LMH.map(c => c + (R(L, 'hurdles') - 1));
const HURDLES = refsOf(L, ['hurdles'], LMH);
const RANGE = ['maxEq', 'topEV', 'topMult', 'topVsBid'];
const rng = k => `C${R(L, k)}:E${R(L, k)}`;
const F = ref => cellsAt(AFTER, L)[ref].formula;
const lines = (ses, refs) => built(ses, L, refs, AFTER);
const HURDLE = C('hurdle'), BID = C('entryEV'), IRR = C('irr');
const RED = new Set(['#9c0006']);
/** The rule paints red exactly the grid cells below the hurdle, and it reads the hurdle (or its 20%), not a pattern of today's figures. */
function redOk(ses) {
  const sh = sheetIn(ses, L); if (!sh) return false;
  const hurdle = sh.value(HURDLE);
  const reading = (sh.condFmt || []).some(x => /\$?C\$?19\b|0\.2\b|20%/.test(String(x.formula || '') + ' ' + String(x.v1 ?? '')));
  const map = sh.condFmtMap();
  return reading && GRID_REFS.every(ref => { const m = map[ref]; const red = !!m && RED.has(String(m.fontColor || '').toLowerCase()); return red === (sh.value(ref) < hurdle); });
}
/** Goal Seek seen: the bid written over at the 20% answer (IRR within a tenth of a point, Goal Seek's own tolerance), then the bid typed back. */
function sought(ses) {
  const sh = sheetIn(ses, L); if (!sh) return false;
  const seen = ses.stressSeen || (ses.stressSeen = new Set());
  if (!seen.has('seek') && sh.value(BID) !== 195000 && near(sh.value(IRR), sh.value(HURDLE), 1e-3)) seen.add('seek');
  return seen.has('seek') && typedAs(ses, L, [BID], AFTER);
}

const goals = [
  { id: 'grid', text: `Select ${GRID} and enter the IRR grid as one formula with Ctrl+Enter: entry multiples down, exit multiples across.`,
    teach: 'Each cell is the return on its own pair: equity at the exit on the column’s multiple, over equity at entry on the row’s, to the one over the hold, less one. $C on the entry edge and the row anchored on the exit edge let one formula fill the block.',
    keys: fill(AFTER, L, GRID), requires: ['lbo-ceiling', 'sensitivity-grid', 'f4-anchor', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${GRID} · ${F('D' + R(L, 'sens0'))}`,
    check: (s, ses) => settled(ses) && lines(ses, GRID_REFS) },
  { id: 'red', text: `A formula rule on ${GRID} that turns the text red wherever the IRR is below the hurdle in ${HURDLE}.`,
    teach: 'The rule reads the hurdle cell, so a sponsor with a 25% bar changes one input and the red moves with it.',
    keys: `Ctrl+G "${L}!${GRID}" ↵ Alt H L N "=D${R(L, 'sens0')}<$C$${R(L, 'hurdle')}" ↓ ×4 ↵`, requires: ['formula-rule', 'relative-absolute', 'go-to'], convention: 'F1',
    hintStuck: `pulse range ${GRID} · Alt, H, L, N, the formula for the top-left cell, then ↓ to Red Text.`,
    check: (s, ses) => settled(ses) && redOk(ses) },
  { id: 'seek', text: `Goal Seek ${IRR} to 0.2 by changing the bid in ${BID}, read the price it finds, then type 195000 back.`,
    teach: 'Goal Seek finds the bid that gives exactly 20%, and writes it over the input. Read the price, then put the real bid back: a model never keeps a Goal Seek answer as an input.',
    keys: `Ctrl+G "${L}!${IRR}" ↵ Alt A W G Alt+V "0.2" Alt+C "${BID}" ↵ ↵ Ctrl+G "${L}!${BID}" ↵ "195000" ↵`, requires: ['goal-seek', 'type-to-enter', 'go-to'], convention: 'B1',
    hintStuck: `pulse cell ${IRR} · Set cell ${IRR}, to value 0.2, by changing ${BID}; then the bid goes back to 195000.`,
    check: (s, ses) => settled(ses) && sought(ses) },
  { id: 'hurdles', text: `Three hurdles across ${rng('hurdles')}: 25%, 20% and 17.5%, the high, the usual and the low bar.`,
    keys: typeAcross(AFTER, L, HURDLES), requires: ['input-colour-convention', 'tab-commits', 'go-to'], convention: 'B1',
    hintStuck: `pulse range ${rng('hurdles')} · Type 25, 20 and 17.5 into the percent cells.`,
    check: (s, ses) => settled(ses) && typedAs(ses, L, HURDLES, AFTER) },
  { id: 'max-equity', text: `The most equity that still earns each hurdle in ${rng('maxEq')}: ${F('C' + R(L, 'maxEq'))}, filled right.`,
    teach: 'The PV of the exit equity at the hurdle rate is the most a sponsor can put in and still earn that rate. One formula filled right stays live, where three Goal Seek answers pasted in would not.',
    keys: fill(AFTER, L, rng('maxEq')), requires: ['lbo-ceiling', 'pmt-pv-fv', 'f4-anchor', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${rng('maxEq')} · PV(hurdle, hold, 0, −exit equity), the hold and the exit anchored.`,
    check: (s, ses) => settled(ses) && lines(ses, refsOf(L, ['maxEq'], LMH)) && liveVia(ses, L, 'D' + R(L, 'maxEq'), [`${L}!${C('exitMult')}`]) },
  { id: 'top-price', text: `The top price as enterprise value, its multiple of EBITDA and the room against the bid in ${'C' + R(L, 'topEV')}:E${R(L, 'topVsBid')}.`,
    keys: ['topEV', 'topMult', 'topVsBid'].map(k => fill(AFTER, L, rng(k))).join(' '), requires: ['lbo-ceiling', 'sources-uses', 'f4-anchor', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range C${R(L, 'topEV')}:E${R(L, 'topVsBid')} · Equity plus both tranches, over one plus fees; then over EBITDA, and less the bid.`,
    check: (s, ses) => settled(ses) && lines(ses, refsOf(L, ['topEV', 'topMult', 'topVsBid'], LMH)) },
  { id: 'tie', closer: true, demo: { script: `Ctrl+G "${L}!${C('senLev')}" Enter "5.5" Enter Ctrl+G "${L}!F${R(L, 'sens2')}" Enter`, cadence: 320 },
    text: 'Does it tie? Watch senior leverage go to 5.5x: every cell of the grid shifts, and so does the top price.', requires: [],
    hintStuck: `pulse range ${L}!${GRID} · More debt means less equity at entry, so every return moves.`,
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'what-the-sponsor-can-pay',
  chapter: 'valuation',
  section: 'LBO',
  module: 'lbo',
  workbook: 'clearcoat-valuation',
  state: { before: 'B636', after: AFTER },
  plant: { ...given(AFTER, L, [...EDGES, ...HEAD]), ...plant(AFTER, L, [...GRID_REFS, ...HURDLES, ...RANGE.flatMap(k => refsOf(L, [k], LMH))]) },
  title: 'Sensitivity on entry and exit: what the sponsor can pay',
  difficulty: 'hard',
  tags: ['valuation', 'lbo', 'sensitivity', 'goal seek'],
  access: 'paid',
  minutes: 7,
  headline: 'Alt A W G',
  conventions: ['B1', 'C3', 'F1'],
  teaches: ['lbo-ceiling'],
  uses: ['lbo-returns', 'sources-uses', 'sensitivity-grid', 'formula-rule', 'relative-absolute', 'goal-seek', 'pmt-pv-fv', 'input-colour-convention', 'type-to-enter', 'tab-commits', 'f4-anchor', 'ctrl-enter-fill', 'go-to'],
  prerequisites: ['returns-bridge'],
  brief: 'Turn the model around: at a 20% IRR, what’s the most the sponsor can pay? A grid of IRR against entry and exit multiples shows it; Goal Seek finds the 20% answer; a PV formula gives the top price at any hurdle and stays live. That price is the LBO row on the football field: the ceiling on what a sponsor can offer, whatever the comps say. The key is `Alt A W G`.',
  goals,
  endState: [
    { text: 'The grid, its red rule and the LBO range stand as formulas, and the bid is back at $195,000k', check: (s, ses) => lines(ses, GRID_REFS) && redOk(ses) && typedAs(ses, L, [BID], AFTER) && lines(ses, RANGE.flatMap(k => refsOf(L, [k], LMH))) },
  ],
  closing: [
    'You know the most a sponsor can pay and still make 20%, about $164.5m, and it sits well below every bid on the table.',
    'Best practice: the LBO range is a ceiling, and the sponsor knows it. A bid above it means they see something the model doesn’t, or they’re planning a sale-leaseback. Read it under the Downside case too: most of a buyout’s return rests on the operating plan.',
  ],
  solution: solutionOf(goals),
};
