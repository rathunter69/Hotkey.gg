// Chapter 6 · 6.3.3 Sale-leasebacks (clearcoat-valuation, B633 → B634)
// The land under twenty sites, sold to a landlord and rented back, as a switch on the LBO page: the
// learner types the sites, the value per site and the cap rate, the switch (off), the proceeds and
// the rent they imply, then the rent as a site cost from FY27, the proceeds as cash in FY27, and a
// second switch for where the proceeds go (repay the senior loan through the sweep, or held for new
// sites). Inputs are graded on their figures, lines on the reference formula evaluated in the
// learner's sheet, and the proceeds and the FY27 cash on the liveness rule through the switch.
import { settled, built, typedAs, liveVia, plant, given, refsOf, fill, typeDown, cellsAt, R, YRS, solutionOf } from './lib/deal-checks.js';

const AFTER = 'B634';
const L = 'LBO';
const C = k => 'C' + R(L, k);
const TERMS = ['slbSites', 'slbValue', 'slbCap'].map(C);
const CALC = ['slbProceeds', 'slbRent'].map(C);
const LINES = ['rent', 'slbIn', 'cSlb'];
const HELD = ['slbHeld'];
const yr = k => refsOf(L, [k], YRS);
const span = k => `D${R(L, k)}:H${R(L, k)}`;
const SWITCH = C('slbOn'), USE = C('slbUse');
const NOTE = 'D' + R(L, 'slbValue');
const F = ref => cellsAt(AFTER, L)[ref].formula;
const lines = (ses, refs) => built(ses, L, refs, AFTER);
const ON = `${L}!${SWITCH}`;

const goals = [
  { id: 'terms', text: `The terms in ${TERMS[0]}:${TERMS[2]}: 20 sites sold, $2,500k a site, and a 7% cap rate.`,
    teach: 'A sale-leaseback sells the land under a site to a landlord and rents it back. The landlord prices the rent as a cap rate on what they paid, so 7% on $2,500k is $175k a year, every year.',
    keys: typeDown(AFTER, L, TERMS), requires: ['sale-leaseback', 'input-colour-convention', 'type-to-enter', 'go-to'], convention: 'B1',
    hintStuck: `pulse range ${TERMS[0]}:${TERMS[2]} · Type 7 into the percent cell for 7%.`,
    check: (s, ses) => settled(ses) && typedAs(ses, L, TERMS, AFTER) },
  { id: 'switch', text: `The switch in ${SWITCH}: type 0, so the land stays owned until a scenario sells it.`,
    teach: 'A switch is one typed cell that every formula multiplies or tests, so the whole sale-leaseback comes and goes with one keystroke and the base case never carries it by accident.',
    keys: typeDown(AFTER, L, [SWITCH]), requires: ['case-switch', 'type-to-enter', 'go-to'], convention: 'B1',
    hintStuck: `pulse cell ${SWITCH} · 1 is on, 0 is off; the label says so.`,
    check: (s, ses) => settled(ses) && typedAs(ses, L, [SWITCH], AFTER) },
  { id: 'proceeds', text: `Proceeds in ${CALC[0]}, ${F(CALC[0])}, and the rent a year they cost in ${CALC[1]}, ${F(CALC[1])}.`,
    keys: typeDown(AFTER, L, CALC), requires: ['formula-basics', 'f4-anchor', 'go-to'], convention: 'B4',
    hintStuck: `pulse range ${CALC[0]}:${CALC[1]} · The switch times sites times value; the rent is the proceeds times the cap rate.`,
    check: (s, ses) => settled(ses) && lines(ses, CALC) && liveVia(ses, L, CALC[1], [ON]) },
  { id: 'lines', text: `The rent as a cost in ${span('rent')}, the proceeds in FY27 in ${span('slbIn')}, and the cash they bring in ${span('cSlb')}.`,
    teach: 'The rent comes off EBITDA from the first year, which is why adjusted EBITDA sits on its own labeled line. The proceeds land once, in FY27, through the COLUMNS counter, and the cash block reads them.',
    keys: LINES.map(k => fill(AFTER, L, span(k))).join(' '), requires: ['sale-leaseback', 'columns-counter', 'if-function', 'f4-anchor', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${span('rent')} · The rent is −$C$${R(L, 'slbRent')} every year; the proceeds only where the counter reads 1.`,
    check: (s, ses) => settled(ses) && lines(ses, LINES.flatMap(yr)) && liveVia(ses, L, 'D' + R(L, 'cSlb'), [ON]) },
  { id: 'use', text: `The second switch in ${USE}: type 1 to repay the senior loan, then the proceeds held for new sites in ${span('slbHeld')}.`,
    teach: 'Proceeds can repay debt through the sweep or fund new sites. When they are held, the memo line keeps them out of cash available, so the sweep can’t spend money promised to the rollout.',
    keys: `${typeDown(AFTER, L, [USE])} ${fill(AFTER, L, span('slbHeld'))}`, requires: ['case-switch', 'if-function', 'corkscrew', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${span('slbHeld')} · When the switch reads 2, last year’s held balance plus this year’s proceeds; otherwise 0.`,
    check: (s, ses) => settled(ses) && typedAs(ses, L, [USE], AFTER) && lines(ses, yr('slbHeld')) },
  { id: 'tie', closer: true, demo: { script: `Ctrl+G "${ON}" Enter "1" Enter Ctrl+G "${L}!H${R(L, 'ebitdaAdj')}" Enter Ctrl+G "${L}!H${R(L, 'netDebt')}" Enter`, cadence: 320 },
    text: 'Does it tie? Watch the switch go to 1: net debt at FY31 falls, and adjusted EBITDA falls by the rent for good.', requires: [],
    hintStuck: `pulse range ${L}!D${R(L, 'ebitdaAdj')}:H${R(L, 'ebitdaAdj')} · $3,500k of rent a year comes off every year’s EBITDA.`,
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'sale-leasebacks',
  chapter: 'valuation',
  section: 'LBO',
  module: 'lbo',
  workbook: 'clearcoat-valuation',
  state: { before: 'B633', after: AFTER },
  plant: { ...given(AFTER, L, [NOTE]), ...plant(AFTER, L, [SWITCH, USE, ...TERMS, ...CALC, ...[...LINES, ...HELD].flatMap(yr)]) },
  title: 'Sale-leasebacks: how a rollout gets financed, and what it costs later',
  difficulty: 'medium',
  tags: ['valuation', 'lbo', 'sale-leaseback'],
  access: 'paid',
  minutes: 6,
  headline: 'IF',
  conventions: ['B1', 'B4', 'C3'],
  teaches: ['sale-leaseback'],
  uses: ['lbo-sweep', 'case-switch', 'columns-counter', 'if-function', 'corkscrew', 'input-colour-convention', 'type-to-enter', 'formula-basics', 'f4-anchor', 'ctrl-enter-fill', 'go-to'],
  prerequisites: ['tranches-and-sweep'],
  brief: 'The land under twenty sites is worth $2.5m each to a landlord, and a sale-leaseback sells it and rents it back: $50m of cash today, $3.5m of rent a year forever, and EBITDA falls by the rent, so the same business is worth less on a multiple the day after. Sponsors use it to fund rollouts without more debt; the next buyer sees the rent and pays less. Model it as a switch and read both sides. The key is `IF`.',
  goals,
  endState: [
    { text: 'The sale-leaseback sits on two switches, its rent and proceeds flowing through the page', check: (s, ses) => typedAs(ses, L, [SWITCH, USE, ...TERMS], AFTER) && lines(ses, [...CALC, ...[...LINES, ...HELD].flatMap(yr)]) },
  ],
  closing: [
    'A sale-leaseback is cash today, rent forever and a lower EBITDA, and both switches sit on one page.',
    'Best practice: an EBITDA lowered by rent, or lifted by owning the land, is labeled as such on every page. The rent is the number a later buyer finds.',
  ],
  solution: solutionOf(goals),
};
