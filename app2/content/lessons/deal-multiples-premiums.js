// Chapter 6 · 6.2.1 Deal multiples and premiums (clearcoat-valuation, B621 → B622)
// The six deals sit on Precedents as typed: date, target, acquirer, enterprise value, LTM EBITDA,
// sites, and the two prices where the target was listed. The learner records each acquirer's type,
// spreads the multiple, EV per site and the premium down the six rows, links the as-of date to
// Inputs and ages every deal against it. Each column is graded on the reference formula evaluated in
// the learner's sheet, and the multiple on the shared liveness rule; the types on their words.
import { settled, built, typedAs, liveVia, plant, refsOf, fill, typeDown, cellsAt, R, solutionOf } from './lib/deal-checks.js';

const AFTER = 'B622';
const P = 'Precedents';
const DEALS = ['d0', 'd1', 'd2', 'd3', 'd4', 'd5'];
const r0 = R(P, 'd0'), r5 = R(P, 'd5');
const col = c => refsOf(P, DEALS, [c]);
const span = c => `${c}${r0}:${c}${r5}`;
const AS_OF = 'C' + R(P, 'asOf');
const F = c => cellsAt(AFTER, P)[c + r0].formula;
const lines = (ses, c) => built(ses, P, col(c), AFTER);
const LAKESIDE = R(P, 'd3');

const goals = [
  { id: 'type', text: `Record each acquirer’s type in ${span('F')}: Sponsor or Strategic, read from the acquirer in column E.`,
    teach: 'A sponsor is a private equity fund buying with debt; a strategic is an operator buying a competitor. A strategic can often pay more, because it counts on savings from running two chains as one, so the type sits beside every deal.',
    keys: typeDown(AFTER, P, col('F')), requires: ['deal-multiples', 'type-to-enter', 'go-to'], convention: 'B4',
    hintStuck: `pulse range ${span('F')} · Pinnacle Wash Holdings is a listed operator; the other five buyers are funds.`,
    check: (s, ses) => settled(ses) && typedAs(ses, P, col('F'), AFTER) },
  { id: 'multiple', text: `The deal multiple in ${span('J')}: ${F('J')}, filled down the six deals.`,
    teach: 'A precedent is a deal that closed: the enterprise value paid over the target’s LTM EBITDA at the time. The IF keeps a loss-making target from showing a negative multiple.',
    keys: fill(AFTER, P, span('J')), requires: ['if-function', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${span('J')} · Enterprise value in G over LTM EBITDA in H, row by row.`,
    check: (s, ses) => settled(ses) && lines(ses, 'J') && liveVia(ses, P, 'J' + LAKESIDE, [`${P}!G${LAKESIDE}`]) },
  { id: 'per-site', text: `EV per site in ${span('K')}, in $m: ${F('K')}.`,
    keys: fill(AFTER, P, span('K')), requires: ['formula-basics', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${span('K')} · Enterprise value over sites, then over 1,000 for millions.`,
    check: (s, ses) => settled(ses) && lines(ses, 'K') },
  { id: 'premium', text: `The premium in ${span('O')}: ${F('O')}, so an unlisted target shows a dash.`,
    teach: 'Where the target was listed, the premium is the offer over the share price before the deal was announced, less one: the price of control. It’s the reason precedents run above trading comps.',
    keys: fill(AFTER, P, span('O')), requires: ['if-function', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${span('O')} · Listed is column L; the two prices are M and N.`,
    check: (s, ses) => settled(ses) && lines(ses, 'O') },
  { id: 'as-of', text: `The as-of date in ${AS_OF}, linked to the valuation date on Inputs: ${cellsAt(AFTER, P)[AS_OF].formula}.`,
    keys: fill(AFTER, P, AS_OF), requires: ['cross-sheet-ref', 'link-colour-convention', 'go-to'], convention: 'B4',
    hintStuck: `pulse cell ${AS_OF} · One date for the whole page, read from Inputs, never typed twice.`,
    check: (s, ses) => settled(ses) && built(ses, P, [AS_OF], AFTER) },
  { id: 'age', text: `Each deal’s age in years in ${span('P')}: ${F('P')}.`,
    teach: 'The deal date is an input and the age is a formula against the as-of date, so how old is too old is read off the page, not worked out in your head. Move the valuation date and every age moves with it.',
    keys: fill(AFTER, P, span('P')), requires: ['yearfrac', 'f4-anchor', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
    hintStuck: `pulse range ${span('P')} · YEARFRAC from the date in C to the as-of date, anchored with F4.`,
    check: (s, ses) => settled(ses) && lines(ses, 'P') },
  { id: 'tie', closer: true, demo: { script: `Ctrl+G "${P}!G${LAKESIDE}" Enter "300000" Enter Ctrl+G "${P}!J${LAKESIDE}" Enter`, cadence: 320 },
    text: 'Does it tie? Watch Lakeside’s enterprise value go to $300,000k: its multiple and EV per site answer at once.', requires: [],
    hintStuck: `pulse range ${P}!J${LAKESIDE}:K${LAKESIDE} · Every figure on the row reads the typed deal terms.`,
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'deal-multiples-premiums',
  chapter: 'valuation',
  section: 'Precedent transactions',
  module: 'precedent-transactions',
  workbook: 'clearcoat-valuation',
  state: { before: 'B621', after: AFTER },
  plant: { ...plant(AFTER, P, [...col('F'), ...col('J'), ...col('K'), ...col('O'), ...col('P'), AS_OF]) },
  title: 'Deal multiples and premiums',
  difficulty: 'medium',
  tags: ['valuation', 'precedents', 'multiples'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['B4', 'C3'],
  teaches: ['deal-multiples'],
  uses: ['if-function', 'yearfrac', 'cross-sheet-ref', 'f4-anchor', 'ctrl-enter-fill', 'go-to', 'type-to-enter', 'link-colour-convention', 'formula-basics'],
  prerequisites: ['ch5-assessment'],   // DEV: challenge-comps
  brief: 'A precedent is a deal that closed: the enterprise value paid over the target’s LTM EBITDA at the time. Where the target was listed, the premium is the price paid over the share price before the deal was announced, the reason precedents run above trading comps. The six deals are typed on Precedents. Spread them the way you spread the comps, with the premium where it exists and every deal aged against one date. The key is `=`.',
  goals,
  endState: [
    { text: 'Every deal carries its type, multiple, EV per site, premium and age', check: (s, ses) => typedAs(ses, P, col('F'), AFTER) && ['J', 'K', 'O', 'P'].every(c => lines(ses, c)) && built(ses, P, [AS_OF], AFTER) },
  ],
  closing: [
    'Six deals are spread, with the premium a control buyer paid on each listed one.',
    'Best practice: the deal date is typed once and the age is a formula against the as-of date, so the page says how old each precedent is on the day it’s read.',
  ],
  solution: solutionOf(goals),
};
