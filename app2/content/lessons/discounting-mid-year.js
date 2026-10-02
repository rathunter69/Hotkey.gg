// Chapter 5 · 5.6.5 Discounting and the mid-year convention (clearcoat-model, B565 → B566)
// Free cash flow, both terminal values and the switch are built. The learner builds the period
// counter (mid-year when the switch on Inputs is 1), the discount factors and present values, the
// terminal values discounted by method (the exit at the end of FY31 whatever the switch says),
// enterprise value both ways and the one the switch picks, equity value, the memos, and the NPV
// cross-check graded on Checks. Each figure is graded from the learner's own cells.
import { sheetIn, settled, reads, near, formatsOf, doneFormula, R, rowRefs, checkRow, PROJ_COLS, COLS } from './lib/model-checks.js';

const D = 'DCF';
const row = key => R(D, key);
const C = key => 'C' + row(key);
const NPV = 'C' + R('Checks', 'npv');
const SINGLES = ['pvSum', 'pvEnd', 'dfPerp', 'dfExit', 'pvTvPerp', 'pvTvExit', 'evPerp', 'evExit', 'ev', 'netDebt', 'eqv', 'tvShare', 'fcShare'];
const F = Object.fromEntries([...['t', 'df', 'pv'].map(k => [k, doneFormula(D, 'C' + row(k))]), ...SINGLES.map(k => [C(k), doneFormula(D, C(k))]), ['mult', doneFormula(D, 'E' + row('evMult'))], ['npv', doneFormula('Checks', NPV)]]);
const dcf = ses => sheetIn(ses, D);
const val = (ses, ref) => dcf(ses).value(ref);
const inp = (ses, ref) => sheetIn(ses, 'Inputs').value(ref);
const W = ses => val(ses, C('wacc'));
const ok = (sh, ref, uses, want, tol = 1e-9) => !!sh.formula(ref) && reads(sh, ref, uses) && near(sh.value(ref), want, tol * Math.max(1, Math.abs(want)));
const fx = (ses, ref, uses, want) => ok(dcf(ses), ref, uses, want);
const flagOn = (ses, col) => inp(ses, col + R('Inputs', 'flag')) === 1;
const MID = 'Inputs!C' + R('Inputs', 'mid');
const tOk = ses => COLS.every(col => fx(ses, col + row('t'), [`Inputs!${col}${R('Inputs', 'flag')}`, `Inputs!${col}${R('Inputs', 'pcnt')}`, MID],
  flagOn(ses, col) ? inp(ses, col + R('Inputs', 'pcnt')) - (inp(ses, MID.split('!')[1]) === 1 ? 0.5 : 0) : 0));
const dfOk = ses => COLS.every(col => fx(ses, col + row('df'), [col + row('t')], flagOn(ses, col) ? 1 / Math.pow(1 + W(ses), val(ses, col + row('t'))) : 0));
const pvOk = ses => COLS.every(col => fx(ses, col + row('pv'), [col + row('fcf'), col + row('df')], (val(ses, col + row('fcf')) || 0) * val(ses, col + row('df'))))
  && fx(ses, C('pvSum'), ['F' + row('pv'), 'J' + row('pv')], COLS.reduce((t, col) => t + (val(ses, col + row('pv')) || 0), 0));
const dfTvOk = ses => fx(ses, C('dfPerp'), ['J' + row('df')], val(ses, 'J' + row('df'))) && fx(ses, C('dfExit'), [`Inputs!J${R('Inputs', 'pcnt')}`], 1 / Math.pow(1 + W(ses), inp(ses, 'J' + R('Inputs', 'pcnt'))));
const pvTvOk = ses => fx(ses, C('pvTvPerp'), [C('tvPerp'), C('dfPerp')], val(ses, C('tvPerp')) * val(ses, C('dfPerp'))) && fx(ses, C('pvTvExit'), [C('tvExit'), C('dfExit')], val(ses, C('tvExit')) * val(ses, C('dfExit')));
const perpChosen = ses => val(ses, C('method')) === 1;
const evOk = ses => fx(ses, C('evPerp'), [C('pvSum'), C('pvTvPerp')], val(ses, C('pvSum')) + val(ses, C('pvTvPerp')))
  && fx(ses, C('evExit'), [C('pvSum'), C('pvTvExit')], val(ses, C('pvSum')) + val(ses, C('pvTvExit')))
  && fx(ses, C('ev'), [C('method')], val(ses, perpChosen(ses) ? C('evPerp') : C('evExit')));
const ND = `Schedules!E${R('Schedules', 'netDebt')}`;
const eqOk = ses => fx(ses, C('netDebt'), [ND], sheetIn(ses, 'Schedules').value(ND.split('!')[1])) && fx(ses, C('eqv'), [C('ev'), C('netDebt')], val(ses, C('ev')) - val(ses, C('netDebt')));
const memoOk = ses => { const ev = val(ses, C('ev')); return fx(ses, C('tvShare'), [C('ev')], val(ses, perpChosen(ses) ? C('pvTvPerp') : C('pvTvExit')) / ev) && fx(ses, C('fcShare'), [C('pvSum'), C('ev')], val(ses, C('pvSum')) / ev)
  && ['E', 'F'].every(col => fx(ses, col + row('evMult'), [C('ev'), col + row('ebitda')], ev / val(ses, col + row('ebitda')))); };
const npvOk = ses => fx(ses, C('pvEnd'), ['F' + row('fcf'), 'J' + row('fcf')], PROJ_COLS.reduce((t, col, i) => t + val(ses, col + row('fcf')) / Math.pow(1 + W(ses), i + 1), 0))
  && checkRow(sheetIn(ses, 'Checks'), [NPV], () => ['DCF!' + C('pvEnd'), 'DCF!F' + row('fcf'), 'DCF!J' + row('fcf')]);
/** Type formulas down a column of cells: Go To the first, then ↓ between neighbours. */
const typed = (keys, first) => keys.map((k, i) => `${i === 0 ? `Ctrl+G "${first || C(k)}" ↵` : (row(k) === row(keys[i - 1]) + 1 ? '↓' : `Ctrl+G "${C(k)}" ↵`)} "${F[C(k)]}" ↵`).join(' ');
const across = (key, first) => `Ctrl+G "${first || ''}C${row(key)}:J${row(key)}" ↵ "${F[key]}" Ctrl+↵`;
const KEYS = {
  t: across('t', D + '!'),
  df: across('df'),
  pv: `${across('pv')} Ctrl+G "${C('pvSum')}" ↵ "${F[C('pvSum')]}" ↵`,
  dfTv: typed(['dfPerp', 'dfExit']),
  pvTv: typed(['pvTvPerp', 'pvTvExit']),
  ev: typed(['evPerp', 'evExit', 'ev']),
  eq: typed(['netDebt', 'eqv']),
  memo: `${typed(['tvShare', 'fcShare'])} Ctrl+G "E${row('evMult')}:F${row('evMult')}" ↵ "${F.mult}" Ctrl+↵`,
  npv: `${typed(['pvEnd'])} Ctrl+G "Checks!${NPV}" ↵ "${F.npv}" ↵`,
};
const CELLS = [...['t', 'df', 'pv'].flatMap(k => rowRefs(D, k)), ...SINGLES.map(C), 'E' + row('evMult'), 'F' + row('evMult')];

export default {
  id: 'discounting-mid-year',
  chapter: 'finance-and-accounting',
  section: 'DCF',
  module: 'dcf',
  workbook: 'clearcoat-model',
  state: { before: 'B565', after: 'B566' },
  plant: { ...formatsOf(D, CELLS), ...formatsOf('Checks', [NPV]) },
  title: 'Discounting and the mid-year convention',
  difficulty: 'hard',
  tags: ['model', 'dcf', 'discounting'],
  access: 'paid',
  minutes: 9,
  headline: '^',
  conventions: ['B2', 'C3', 'F1', 'F4'],
  teaches: ['mid-year-discounting', 'enterprise-to-equity'],
  uses: ['if-function', 'f4-anchor', 'cross-sheet-ref', 'ctrl-enter-fill', 'go-to', 'arrow-keys', 'defined-name', 'sum-family', 'case-switch', 'npv', 'sumproduct', 'round-function', 'check-cell', 'formula-operators'],
  prerequisites: ['terminal-value'],
  brief: 'A discount factor is 1 over (1 + WACC) to the t, and the question is what t is. Cash arrives through the year, not on December 31, so the mid-year convention discounts year 1 at 0.5, year 2 at 1.5, and so on. The present values, summed, plus the discounted terminal value, are enterprise value; less net debt is equity value. Build it, and read what the convention is worth. The key is `^`.',
  goals: [
    { id: 't', teach: 'The period counter is the year count from Inputs, less a half when the mid-year switch is on, and zero in the historical years, so only the forecast is discounted.',
      text: `Period t across C${row('t')}:J${row('t')}: ${F.t}, entered with Ctrl+Enter.`,
      keys: KEYS.t, requires: ['mid-year-discounting', 'if-function', 'f4-anchor', 'cross-sheet-ref', 'ctrl-enter-fill', 'go-to'], convention: 'B2',
      hintStuck: `pulse range C${row('t')}:J${row('t')} · Row ${R('Inputs', 'flag')} on Inputs is the projection flag, row ${R('Inputs', 'pcnt')} the counter.`,
      check: (s, ses) => settled(ses) && tOk(ses) },
    { id: 'df', teach: 'The caret raises to a power: 1/(1+WACC)^t is what a dollar t years out is worth today.',
      text: `The discount factor across C${row('df')}:J${row('df')}: ${F.df}.`,
      keys: KEYS.df, requires: ['mid-year-discounting', 'if-function', 'defined-name', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range C${row('df')}:J${row('df')} · WACC is the named cell; t is the row above.`,
      check: (s, ses) => settled(ses) && dfOk(ses) },
    { id: 'pv', text: `Present values across C${row('pv')}:J${row('pv')}: ${F.pv}, then their sum in ${C('pvSum')}: ${F[C('pvSum')]}.`,
      keys: KEYS.pv, requires: ['ctrl-enter-fill', 'sum-family', 'go-to'], convention: 'C3',
      hintStuck: `pulse range C${row('pv')}:J${row('pv')} · Free cash flow times its factor.`,
      check: (s, ses) => settled(ses) && pvOk(ses) },
    { id: 'df-tv', teach: 'An exit is a sale at the end of FY31, so it takes the end-year factor whatever the switch says; a perpetuity’s cash keeps arriving through the year, so it takes year 5’s own factor.',
      text: `Discount factors for the terminal values: ${C('dfPerp')} ${F[C('dfPerp')]}, and ${C('dfExit')} ${F[C('dfExit')]}.`,
      keys: KEYS.dfTv, requires: ['mid-year-discounting', 'defined-name', 'cross-sheet-ref', 'f4-anchor', 'go-to', 'arrow-keys'],
      hintStuck: `pulse range ${C('dfPerp')}:${C('dfExit')} · Year 5 on the counter is Inputs J${R('Inputs', 'pcnt')}.`,
      check: (s, ses) => settled(ses) && dfTvOk(ses) },
    { id: 'pv-tv', text: `Discount each terminal value: ${C('pvTvPerp')} ${F[C('pvTvPerp')]}, and ${C('pvTvExit')} ${F[C('pvTvExit')]}.`,
      keys: KEYS.pvTv, requires: ['terminal-value', 'go-to', 'arrow-keys'],
      hintStuck: `pulse range ${C('pvTvPerp')}:${C('pvTvExit')} · Each value times its own factor.`,
      check: (s, ses) => settled(ses) && pvTvOk(ses) },
    { id: 'ev', teach: 'Enterprise value is the discounted forecast plus the discounted terminal value, built once per method so each sensitivity table can read its own. The switch picks which one goes on.',
      text: `Enterprise value: ${C('evPerp')} ${F[C('evPerp')]}, ${C('evExit')} ${F[C('evExit')]}, and ${C('ev')} ${F[C('ev')]}.`,
      keys: KEYS.ev, requires: ['enterprise-to-equity', 'case-switch', 'go-to', 'arrow-keys'],
      hintStuck: `pulse range ${C('evPerp')}:${C('ev')} · The sum of present values plus each discounted terminal value.`,
      check: (s, ses) => settled(ses) && evOk(ses) },
    { id: 'equity', teach: 'Picture a house: enterprise value is what the house is worth, net debt the mortgage, and equity the owner’s stake. Net debt is taken at the valuation date, the FY26 year end.',
      text: `Net debt in ${C('netDebt')}: ${F[C('netDebt')]}, and equity value in ${C('eqv')}: ${F[C('eqv')]}.`,
      keys: KEYS.eq, requires: ['enterprise-to-equity', 'cross-sheet-ref', 'f4-anchor', 'go-to', 'arrow-keys'], convention: 'B2',
      hintStuck: `pulse range ${C('netDebt')}:${C('eqv')} · Net debt is row ${R('Schedules', 'netDebt')} on Schedules, FY26 in column E.`,
      check: (s, ses) => settled(ses) && eqOk(ses) },
    { id: 'memo', teach: 'How much of the value rests on the terminal value is the first thing a reviewer reads. The multiples get read against the comps: FY27’s is lower while EBITDA grows.',
      text: `The memos: ${C('tvShare')} ${F[C('tvShare')]}, ${C('fcShare')} ${F[C('fcShare')]}, and E${row('evMult')}:F${row('evMult')} ${F.mult}.`,
      keys: KEYS.memo, requires: ['enterprise-to-equity', 'case-switch', 'f4-anchor', 'ctrl-enter-fill', 'go-to', 'arrow-keys'], convention: 'F4',
      hintStuck: `pulse range ${C('tvShare')}:${C('fcShare')} · The two shares add to 100%.`,
      check: (s, ses) => settled(ses) && memoOk(ses) },
    { id: 'npv', teach: 'NPV discounts each flow a whole period out, which is the end-year case, so a SUMPRODUCT at end-year periods must match it exactly.',
      text: `The cross-check: ${C('pvEnd')} ${F[C('pvEnd')]}, then on Checks ${NPV}: ${F.npv}.`,
      keys: KEYS.npv, requires: ['npv', 'sumproduct', 'round-function', 'check-cell', 'cross-sheet-ref', 'go-to'], convention: 'F1',
      hintStuck: `pulse cell ${C('pvEnd')} · The check reads zero when the two agree.`,
      check: (s, ses) => settled(ses) && npvOk(ses) },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "Inputs!C${R('Inputs', 'mid')}" Enter "0" Enter Ctrl+G "DCF!${C('pvSum')}" Enter`, cadence: 360 },
      text: 'Does it tie? Watch the mid-year switch go off: the forecast years’ present values fall about 5%, and the exit value stays put.', requires: [],
      hintStuck: `pulse cell ${C('pvSum')} · Half a year at 10% is worth about 5%; the exit is a sale at the end of FY31 either way.`,
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Period, discount factor and present value run across the forecast, mid-year when the switch is on', check: (s, ses) => tOk(ses) && dfOk(ses) && pvOk(ses) },
    { text: 'Enterprise value both ways, the one the switch picks, and equity value after net debt', check: (s, ses) => dfTvOk(ses) && pvTvOk(ses) && evOk(ses) && eqOk(ses) && memoOk(ses) },
    { text: 'The NPV cross-check reads zero on Checks', check: (s, ses) => npvOk(ses) },
  ],
  closing: [
    'Enterprise value comes from five discounted years and a terminal, and the convention moves the forecast years about 5%.',
    'Best practice: say which convention the page uses wherever the value is quoted. Two analysts a few percent apart are usually one mid-year switch apart.',
  ],
  solution: Object.values(KEYS).join(' ').replace(/↵/g, 'Enter').replace(/↓/g, 'Down'),
};
