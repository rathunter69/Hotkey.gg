// Chapter 6 · 6.3.1 Sources and uses (clearcoat-valuation, B631 → B632)
// The LBO page's term sheet and its first table. The learner links FY26E EBITDA, types the bid and
// lets the entry multiple fall out of it, types the debt terms, builds uses (net debt repaid, the
// equity purchased, the fees) and sources (two tranches sized on EBITDA, the owners' rollover, the
// sponsor's equity as the plug), wires the Sources equal uses row on Checks live, and reads the two
// ratios a lender and a sponsor look at first. The rest of the term sheet (exit, hold, hurdle and
// the model's links) is given. Lines are graded on the reference formula evaluated in the learner's
// sheet, inputs on their figures, the plug on the liveness rule through the bid.
import { sheetIn, settled, reads, built, typedAs, liveVia, plant, given, refsOf, typeDown, cellsAt, R, solutionOf } from './lib/deal-checks.js';

const AFTER = 'B632';
const L = 'LBO';
const C = k => 'C' + R(L, k);
const Cs = keys => keys.map(C);
const PRICE = Cs(['ebitda26', 'entryEV', 'entryMult']);
const DEBT = Cs(['fee', 'senLev', 'senRate', 'senAmort', 'mezLev', 'mezRate']);
const USES = Cs(['useNetDebt', 'useEquity', 'useEV', 'useFees', 'usesTotal']);
const SOURCES = Cs(['srcSenior', 'srcMezz', 'srcRoll', 'srcSponsor', 'srcTotal']);
const READS = Cs(['eqShare', 'debtMult', 'rollNewShare']);
const GIVEN = Cs(['revRate', 'exitMult', 'hold', 'hurdle', 'tax', 'minCash', 'circ']);
const NOTES = Object.keys(cellsAt(AFTER, L)).filter(ref => /^D\d+$/.test(ref) && +ref.slice(1) >= R(L, 'ebitda26') && +ref.slice(1) <= R(L, 'circ'));
const SU_ROW = +Object.keys(cellsAt(AFTER, 'Checks')).find(k => /^B\d+$/.test(k) && /Sources equal uses/.test(cellsAt(AFTER, 'Checks')[k].value)).slice(1);
const SU_C = 'C' + SU_ROW, SU_K = 'K' + SU_ROW;
const lbo = ses => sheetIn(ses, L);
const lines = (ses, refs) => built(ses, L, refs, AFTER);
const F = ref => cellsAt(AFTER, L)[ref].formula;
const checkOk = ses => { const ck = sheetIn(ses, 'Checks'); return lines(ses, [C('suCheck')]) && built(ses, 'Checks', [SU_C], AFTER) && reads(ck, SU_C, [`LBO!${C('srcTotal')}`, `LBO!${C('usesTotal')}`]) && !(ck.cells[SU_K] && ck.cells[SU_K].value); };

const goals = [
  { id: 'price', text: `FY26E EBITDA in ${PRICE[0]} from IS, the $195,000k bid typed in ${PRICE[1]}, and the entry multiple it implies in ${PRICE[2]}.`,
    teach: 'A sponsor bids a price, and the multiple is what that price says about the business: the bid over FY26E EBITDA. The bid is the input and the multiple a formula, so moving the price moves every line below.',
    keys: typeDown(AFTER, L, PRICE), requires: ['sources-uses', 'cross-sheet-ref', 'link-colour-convention', 'input-colour-convention', 'go-to'], convention: 'B4',
    hintStuck: `pulse range ${PRICE[0]}:${PRICE[2]} · EBITDA is IS row 24, column E; the multiple is ${F(PRICE[2])}.`,
    check: (s, ses) => settled(ses) && lines(ses, [PRICE[0], PRICE[2]]) && typedAs(ses, L, [PRICE[1]], AFTER) },
  { id: 'debt', text: `The deal terms in ${DEBT[0]}:${DEBT[5]}: fees 2%, senior 4.5x at 8% with 5% a year amortized, mezzanine 1.0x at 12%.`,
    keys: typeDown(AFTER, L, DEBT), requires: ['input-colour-convention', 'type-to-enter', 'go-to'], convention: 'B1',
    hintStuck: `pulse range ${DEBT[0]}:${DEBT[5]} · Percentages as decimals: 0.02, 0.08, 0.05, 0.12.`,
    check: (s, ses) => settled(ses) && typedAs(ses, L, DEBT, AFTER) },
  { id: 'uses', text: `Net debt at closing in ${C('netDebtClose')} from Schedules, then uses in ${USES[0]}:${USES[4]}: net debt repaid, equity purchased, fees and the total.`,
    teach: 'Uses are what the deal pays: the existing loan repaid, net of cash (lenders rarely let a loan carry over when control changes), the equity bought from the owners, and the fees on top.',
    keys: `${typeDown(AFTER, L, [C('netDebtClose')])} ${typeDown(AFTER, L, USES)}`, requires: ['sources-uses', 'cross-sheet-ref', 'sum-family', 'f4-anchor', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${USES[0]}:${USES[4]} · Equity purchased is the bid less net debt; fees are 2% of enterprise value.`,
    check: (s, ses) => settled(ses) && lines(ses, [C('netDebtClose'), ...USES]) },
  { id: 'sources', text: `The 20% rollover in ${C('roll')}, then sources in ${SOURCES[0]}:${SOURCES[4]}, with the sponsor’s equity as the plug.`,
    teach: 'Debt is sized on EBITDA, the owners keep 20% of their equity as a stake, and the sponsor wires whatever is left. The equity line is the one honest plug in finance, because it’s the sponsor’s choice.',
    keys: `${typeDown(AFTER, L, [C('roll')])} ${typeDown(AFTER, L, SOURCES)}`, requires: ['sources-uses', 'sum-family', 'f4-anchor', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${SOURCES[0]}:${SOURCES[4]} · Senior is 4.5 times EBITDA; the plug is total uses less the debt and the rollover.`,
    check: (s, ses) => settled(ses) && typedAs(ses, L, [C('roll')], AFTER) && lines(ses, SOURCES) && liveVia(ses, L, C('srcSponsor'), [`${L}!${C('entryEV')}`]) },
  { id: 'check', text: `The check in ${C('suCheck')}, and the same difference live on Checks!${SU_C} with its pending note in ${SU_K} cleared.`,
    keys: `${typeDown(AFTER, L, [C('suCheck')])} ${typeDown(AFTER, 'Checks', [SU_C])} Ctrl+G "Checks!${SU_K}" ↵ Alt H E A`,
    requires: ['check-cell', 'checks-sheet', 'round-function', 'cross-sheet-ref', 'clear-all', 'go-to'], convention: 'F1',
    hintStuck: `pulse cell Checks!${SU_C} · ROUND of total sources less total uses, reading the LBO page.`,
    check: (s, ses) => settled(ses) && checkOk(ses) },
  { id: 'reads', text: `Equity as a share of the price, debt as a multiple of EBITDA and the rolled stake’s share in ${READS[0]}:${READS[2]}.`,
    keys: typeDown(AFTER, L, READS), requires: ['formula-basics', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${READS[0]}:${READS[2]} · A lender reads the debt multiple first; a sponsor reads its equity share.`,
    check: (s, ses) => settled(ses) && lines(ses, READS) },
  { id: 'tie', closer: true, demo: { script: `Ctrl+G "${L}!${C('entryEV')}" Enter "207500" Enter Ctrl+G "${L}!${C('srcSponsor')}" Enter`, cadence: 320 },
    text: 'Does it tie? Watch the bid go to $207,500k, 12.5x: the sponsor’s equity rises and the debt doesn’t move.', requires: [],
    hintStuck: `pulse range ${L}!${SOURCES[0]}:${SOURCES[3]} · Debt is sized on EBITDA, not on the price, so the plug takes the rest.`,
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'sources-and-uses',
  chapter: 'valuation',
  section: 'LBO',
  module: 'lbo',
  workbook: 'clearcoat-valuation',
  state: { before: 'B631', after: AFTER },
  plant: {
    ...given(AFTER, L, [...GIVEN, ...NOTES]),
    ...plant(AFTER, L, [...PRICE, ...DEBT, C('roll'), C('netDebtClose'), ...USES, ...SOURCES, C('suCheck'), ...READS]),
    ...plant(AFTER, 'Checks', [SU_C]),
  },
  title: 'Sources and uses',
  difficulty: 'medium',
  tags: ['valuation', 'lbo', 'sources and uses'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['B1', 'B4', 'C3', 'F1'],
  teaches: ['sources-uses'],
  uses: ['cross-sheet-ref', 'link-colour-convention', 'input-colour-convention', 'type-to-enter', 'sum-family', 'f4-anchor', 'check-cell', 'checks-sheet', 'round-function', 'clear-all', 'formula-basics', 'go-to'],
  prerequisites: ['challenge-precedents'],
  brief: 'Every buyout starts with one table: uses (the price paid for the company and the fees to do the deal) and sources (the debt raised against the company’s EBITDA and the equity the sponsor puts in, which is whatever the debt and the stake the owners keep don’t cover). Sources equal uses, always, and the equity line is where the balance lands. Build it from the bid and the leverage the lenders will allow. The key is `=`.',
  goals,
  endState: [
    { text: 'Sources equal uses, and the Checks row reads it live', check: (s, ses) => lines(ses, [...USES, ...SOURCES]) && checkOk(ses) && lbo(ses).value(C('suCheck')) === 0 },
  ],
  closing: [
    'The table says where $198.9m comes from and where it goes, and the equity line is what the sponsor risks.',
    'Best practice: the equity line is the plug in sources and uses, and it’s the one honest plug in finance, because it’s the sponsor’s choice. Every other line is sized on something a lender or a seller set.',
  ],
  solution: solutionOf(goals),
};
