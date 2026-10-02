// Chapter 5 · 5.6.4 Terminal value: perpetuity and exit multiple (clearcoat-model, B564 → B565)
// The forecast's free cash flow and the named WACC are built. The learner normalizes FY31 in
// column K (EBITDA and depreciation carried, capex set to depreciation, working capital at its
// steady level), builds both terminal values, the implied multiple of one and the implied growth of
// the other, a round trip graded on Checks, and the switch that picks the value the page uses.
// Each figure is graded from the learner's own cells; the round trip on its value and references.
import { sheetIn, settled, reads, near, formatsOf, doneFormula, R, checkRow, liveFrom } from './lib/model-checks.js';

const D = 'DCF';
const row = key => R(D, key);
const K = key => 'K' + row(key), C = key => 'C' + row(key), J = key => 'J' + row(key);
const INP = key => 'Inputs!C' + R('Inputs', key);
const RT = 'C' + R('Checks', 'roundTrip');
const KCALC = ['ebit', 'taxEbit', 'nopat', 'depBack', 'fcf', 'fcfShare'];
const TV = ['tvPerp', 'tvExit', 'impMult', 'impGrowth', 'roundTrip', 'method', 'tv'];
const F = Object.fromEntries([...['ebitda', 'depLess', 'capex', 'nwc'].map(k => [K(k), doneFormula(D, K(k))]), ...TV.map(k => [C(k), doneFormula(D, C(k))])]);
F.rt = doneFormula('Checks', RT);
const dcf = ses => sheetIn(ses, D);
const val = (ses, ref) => dcf(ses).value(ref);
const inp = (ses, key) => sheetIn(ses, 'Inputs').value(INP(key).split('!')[1]);
const wacc = ses => val(ses, C('wacc'));
const fx = (ses, ref, uses, want, tol = 1e-9) => { const sh = dcf(ses); return !!sh.formula(ref) && reads(sh, ref, uses) && near(sh.value(ref), want, tol * Math.max(1, Math.abs(want))); };
const carryOk = ses => fx(ses, K('ebitda'), [J('ebitda')], val(ses, J('ebitda'))) && fx(ses, K('depLess'), [J('depLess')], val(ses, J('depLess')));
const v = (ses, k) => val(ses, K(k)) || 0;
const fillOk = ses => fx(ses, K('ebit'), [K('ebitda'), K('depLess')], v(ses, 'ebitda') + v(ses, 'depLess'))
  && fx(ses, K('taxEbit'), [K('ebit')], -Math.max(v(ses, 'ebit'), 0) * inp(ses, 'tax'))
  && fx(ses, K('nopat'), [K('ebit'), K('taxEbit')], v(ses, 'ebit') + v(ses, 'taxEbit'))
  && fx(ses, K('depBack'), [K('depLess')], -v(ses, 'depLess'))
  && fx(ses, K('fcf'), [K('nopat'), K('nwc')], v(ses, 'nopat') + v(ses, 'depBack') + v(ses, 'capex') + v(ses, 'nwc'))
  && fx(ses, K('fcfShare'), [K('fcf'), K('ebitda')], v(ses, 'fcf') / v(ses, 'ebitda'));
const steadyOk = ses => fx(ses, K('capex'), [K('depBack')], -v(ses, 'depBack')) && fx(ses, K('nwc'), [INP('termWC')], inp(ses, 'termWC')) && fillOk(ses);
const g = ses => inp(ses, 'growth');
const perpOk = ses => fx(ses, C('tvPerp'), [K('fcf'), INP('growth')], v(ses, 'fcf') * (1 + g(ses)) / (wacc(ses) - g(ses)));
const exitOk = ses => fx(ses, C('tvExit'), [J('ebitda'), INP('exit')], val(ses, J('ebitda')) * inp(ses, 'exit'));
const impliedOk = ses => fx(ses, C('impMult'), [C('tvPerp'), J('ebitda')], val(ses, C('tvPerp')) / val(ses, J('ebitda')))
  && fx(ses, C('impGrowth'), [C('tvExit'), K('fcf')], (val(ses, C('tvExit')) * wacc(ses) - v(ses, 'fcf')) / (val(ses, C('tvExit')) + v(ses, 'fcf')));
const tripOk = ses => { const m = val(ses, C('impMult')) * val(ses, J('ebitda')); return fx(ses, C('roundTrip'), [C('impMult'), K('fcf')], (m * wacc(ses) - v(ses, 'fcf')) / (m + v(ses, 'fcf')))
  && checkRow(sheetIn(ses, 'Checks'), [RT], () => ['DCF!' + C('roundTrip'), INP('growth')]); };
const switchOk = ses => fx(ses, C('method'), [INP('tvMethod')], inp(ses, 'tvMethod')) && fx(ses, C('tv'), [C('method'), C('tvPerp'), C('tvExit')], val(ses, inp(ses, 'tvMethod') === 1 ? C('tvPerp') : C('tvExit')));
const typed = (refs, first) => refs.map((ref, i) => `${i === 0 ? `Ctrl+G "DCF!${first || ref}" ↵` : (+ref.slice(1) === +refs[i - 1].slice(1) + 1 && ref[0] === refs[i - 1][0] ? '↓' : `Ctrl+G "DCF!${ref}" ↵`)} "${F[ref]}" ↵`).join(' ');
const KEYS = {
  carry: typed([K('ebitda'), K('depLess')]),
  fill: `Ctrl+G "DCF!J${row('ebit')}:K${row('depBack')}" ↵ Ctrl+R Ctrl+G "DCF!J${row('fcf')}:K${row('fcfShare')}" ↵ Ctrl+R`,
  steady: typed([K('capex'), K('nwc')]),
  perp: typed([C('tvPerp')]),
  exit: typed([C('tvExit')]),
  implied: typed([C('impMult'), C('impGrowth')]),
  trip: `${typed([C('roundTrip')])} Ctrl+G "Checks!${RT}" ↵ "${F.rt}" ↵`,
  switch: typed([C('method'), C('tv')]),
};
const KCELLS = [...['ebitda', 'depLess', ...KCALC, 'capex', 'nwc'].map(K)];

export default {
  id: 'terminal-value',
  chapter: 'finance-and-accounting',
  section: 'DCF',
  module: 'dcf',
  workbook: 'clearcoat-model',
  state: { before: 'B564', after: 'B565' },
  plant: { ...formatsOf(D, [...KCELLS, ...TV.map(C)]), ...formatsOf('Checks', [RT]) },
  title: 'Terminal value: perpetuity and exit multiple',
  difficulty: 'hard',
  tags: ['model', 'dcf', 'terminal value'],
  access: 'paid',
  minutes: 8,
  headline: '=',
  conventions: ['C3', 'B2', 'F1', 'E9'],
  teaches: ['terminal-value'],
  uses: ['fill-down-right', 'go-to', 'arrow-keys', 'cross-sheet-ref', 'f4-anchor', 'defined-name', 'case-switch', 'round-function', 'check-cell', 'formula-operators'],
  prerequisites: ['wacc-block'],
  brief: 'The forecast stops at FY31 and the business doesn’t, so the terminal value stands for everything after. The perpetuity method grows a normalized last year’s cash flow at a steady rate forever; the exit multiple method sells the business in FY31 at a multiple of EBITDA, the way a sponsor will. Build both, then read the implied multiple of one and the implied growth of the other, so each checks the other. The key is `=`.',
  goals: [
    { id: 'carry', teach: 'FY31 is still a rollout year, so its raw cash flow would charge six new sites’ capex forever. Column K is a normalized FY31 beside the forecast; it starts from FY31’s EBITDA and depreciation.',
      text: `Carry FY31 into the normalized column: ${K('ebitda')} ${F[K('ebitda')]}, and ${K('depLess')} ${F[K('depLess')]}.`,
      keys: KEYS.carry, requires: ['terminal-value', 'go-to', 'arrow-keys'],
      hintStuck: `pulse range ${K('ebitda')}:${K('depLess')} · Each reads the cell to its left.`,
      check: (s, ses) => settled(ses) && carryOk(ses) && liveFrom(ses, 'DCF', 'ebitda', 'K', 'labor') },
    { id: 'fill', teach: 'The rest of the column runs the same formulas as the forecast, so Ctrl+R fills them across from FY31.',
      text: `Fill J${row('ebit')}:K${row('depBack')} and J${row('fcf')}:K${row('fcfShare')} across with Ctrl+R.`,
      keys: KEYS.fill, requires: ['fill-down-right', 'go-to'], convention: 'C3',
      hintStuck: `pulse range J${row('ebit')}:K${row('depBack')} · Capex and working capital get their own formulas next, so skip rows ${row('capex')} and ${row('nwc')}.`,
      check: (s, ses) => settled(ses) && fillOk(ses) && liveFrom(ses, 'DCF', 'ebit', 'K', 'labor') },
    { id: 'steady', teach: 'In a steady year capex only replaces what wears out, so it is set to depreciation; working capital moves by its steady amount from Inputs.',
      text: `Set ${K('capex')} to ${F[K('capex')]} and ${K('nwc')} to ${F[K('nwc')]}.`,
      keys: KEYS.steady, requires: ['terminal-value', 'cross-sheet-ref', 'f4-anchor', 'go-to', 'arrow-keys'], convention: 'B2',
      hintStuck: `pulse range ${K('capex')}:${K('nwc')} · Capex is the depreciation added back, turned around.`,
      check: (s, ses) => settled(ses) && steadyOk(ses) && liveFrom(ses, 'DCF', 'nwc', 'K', 'termWC') },
    { id: 'perp', teach: 'The perpetuity grows the normalized cash flow a year and divides by WACC less growth. Growth is 3%, no faster than the economy, and it has to sit below WACC or the formula breaks.',
      text: `The perpetuity value in ${C('tvPerp')}: ${F[C('tvPerp')]}.`,
      keys: KEYS.perp, requires: ['terminal-value', 'defined-name', 'cross-sheet-ref', 'go-to'],
      hintStuck: `pulse cell ${C('tvPerp')} · ${K('fcf')} is the normalized cash flow; growth is row ${R('Inputs', 'growth')} on Inputs.`,
      check: (s, ses) => settled(ses) && perpOk(ses) && liveFrom(ses, 'DCF', 'tvPerp', 'C', 'growth') },
    { id: 'exit', teach: 'The exit multiple sells the business at the end of FY31 for 11.0 times that year’s EBITDA, sourced to the listed operators and the precedent deals.',
      text: `The exit value in ${C('tvExit')}: ${F[C('tvExit')]}.`,
      keys: KEYS.exit, requires: ['terminal-value', 'cross-sheet-ref', 'go-to'],
      hintStuck: `pulse cell ${C('tvExit')} · FY31 EBITDA is ${J('ebitda')}.`,
      check: (s, ses) => settled(ses) && exitOk(ses) && liveFrom(ses, 'DCF', 'tvExit', 'C', 'exit') },
    { id: 'implied', teach: 'Each method implies the other’s input: the perpetuity value over FY31 EBITDA is a multiple, and the perpetuity formula solved for growth turns the exit value into a growth rate.',
      text: `Implied multiple in ${C('impMult')}: ${F[C('impMult')]}, and implied growth in ${C('impGrowth')}: ${F[C('impGrowth')]}.`,
      keys: KEYS.implied, requires: ['terminal-value', 'defined-name', 'go-to', 'arrow-keys'],
      hintStuck: `pulse range ${C('impMult')}:${C('impGrowth')} · Read them against 11.0x and 3%.`,
      check: (s, ses) => settled(ses) && impliedOk(ses) && liveFrom(ses, 'DCF', 'impMult', 'C', 'growth') },
    { id: 'trip', teach: 'Feed the implied multiple back into the exit method, solve for growth, and the growth input must come back. If it doesn’t, the two values aren’t built on the same cash flow.',
      text: `The round trip in ${C('roundTrip')}: ${F[C('roundTrip')]}, then on Checks ${RT}: ${F.rt}.`,
      keys: KEYS.trip, requires: ['terminal-value', 'round-function', 'check-cell', 'cross-sheet-ref', 'go-to'], convention: 'F1',
      hintStuck: `pulse cell ${C('roundTrip')} · The check is a live difference that reads zero.`,
      check: (s, ses) => settled(ses) && tripOk(ses) },
    { id: 'switch', text: `The switch: ${C('method')} ${F[C('method')]}, and ${C('tv')} ${F[C('tv')]}.`,
      keys: KEYS.switch, requires: ['case-switch', 'cross-sheet-ref', 'go-to', 'arrow-keys'], convention: 'E9',
      hintStuck: `pulse range ${C('method')}:${C('tv')} · 1 picks the perpetuity, 2 the exit multiple.`,
      check: (s, ses) => settled(ses) && switchOk(ses) && liveFrom(ses, 'DCF', 'tv', 'C', 'tvMethod') },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "Inputs!C${R('Inputs', 'exit')}" Enter "13" Enter Ctrl+G "DCF!${C('impGrowth')}" Enter`, cadence: 360 },
      text: 'Does it tie? Watch the exit multiple on Inputs go from 11.0x to 13.0x: the implied growth in C30 climbs.', requires: [],
      hintStuck: `pulse cell ${C('impGrowth')} · A higher multiple says the market expects faster growth.`,
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Column K is FY31 normalized: capex at depreciation, working capital at its steady level', check: (s, ses) => carryOk(ses) && steadyOk(ses) },
    { text: 'Both terminal values, each implying the other’s input, and the round trip reads zero on Checks', check: (s, ses) => perpOk(ses) && exitOk(ses) && impliedOk(ses) && tripOk(ses) },
    { text: 'The switch picks the terminal value the page uses', check: (s, ses) => switchOk(ses) },
  ],
  closing: [
    'You have two terminal values, and each says whether the other is reasonable.',
    'Best practice: when the two methods disagree by more than a third, one of the inputs is wrong, not the method. Read the implied multiple against the comps and the implied growth against the economy before you trust either value.',
  ],
  solution: Object.values(KEYS).join(' ').replace(/↵/g, 'Enter').replace(/↓/g, 'Down'),
};
