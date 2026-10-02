// Chapter 6 · 6.1.1 Spreading a comp: the EV build (clearcoat-valuation, B611 → B612)
// Comps holds six listed operators' inputs, blue and sourced, with the LTM EBITDA given for now.
// The learner spreads Pinnacle (market cap, enterprise value, EV / revenue, EV / EBITDA with its NM
// guard, the margin in italic), fills the pattern down the set, reads where an input comes from,
// and watches a price move one row only. Each cell is graded on the figure the finished page's
// formula gives on the learner's own inputs; the guard by setting EBITDA to zero for a moment.
import { settled, built, liveOn, under, comps, carries, cursorAt, formatsAt, down, formulaOf, q, solutionOf } from './lib/comps-checks.js';

const COLS = ['E', 'H', 'K', 'L', 'M'];
const F = ref => formulaOf(ref);
const nmGuard = ses => under(ses, { 'Comps!J5': 0 }, s => comps(s).value('L5') === 'NM');
const mcapOk = ses => built(ses, ['E5']);
const evOk = ses => built(ses, ['H5']);
const multOk = ses => built(ses, ['K5', 'L5']);
const marginOk = ses => built(ses, ['M5']) && carries(ses, ['M5'], 'it');
const REST = [...down('E').slice(1), ...down('H').slice(1), ...['K', 'L', 'M'].flatMap(c => down(c).slice(1))];
const fillOk = ses => built(ses, REST) && carries(ses, down('M'), 'it');

const LESSON = {
  id: 'spreading-a-comp',
  chapter: 'valuation',
  section: 'Trading comps',
  module: 'trading-comps',
  workbook: 'clearcoat-valuation',
  state: { before: 'B611', after: 'B612' },
  // the cells this lesson fills arrive in the page's format; the margin's italic is the learner's to apply
  plant: formatsAt('B612', COLS.flatMap(c => down(c)), ['it']),
  title: 'Spreading a comp: the EV build',
  difficulty: 'medium',
  tags: ['valuation', 'comps', 'enterprise value'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['B1', 'C3', 'D4', 'B6'],
  teaches: ['enterprise-value', 'trading-multiple'],
  uses: ['go-to', 'formula-operators', 'arrow-keys', 'if-function', 'bold-italic-underline', 'fill-down-right', 'ctrl-enter-fill', 'ctrl-arrow', 'source-line'],
  prerequisites: ['ch5-assessment'],
  brief: 'Enterprise value is what the operating business is worth, however it’s funded: equity value (share price times shares) plus debt, less the cash that comes with it. A trading multiple is that over a year of EBITDA, the market’s price for a dollar of profit. Spreading a comp means building those lines for one company from its filings, so every company in the set is built the same way. Spread Pinnacle, then fill the pattern down the set. The key is `=`.',
  goals: [
    { id: 'mcap', teach: 'On Comps, each operator’s inputs are typed in blue from its filings: price, shares, debt, cash, LTM revenue and EBITDA. The LTM figures are given for now; the next lesson builds them. Equity value starts with the market’s price: share price times shares is the market cap.',
      text: `On Comps, Pinnacle’s market cap in E5: ${F('E5')}.`,
      keys: `Ctrl+G "Comps!E5" ↵ ${q(F('E5'))} ↵`, requires: ['enterprise-value', 'go-to', 'formula-operators'],
      hintStuck: 'pulse cell E5 · Price in C5 times shares in D5, both in thousands of dollars once multiplied.',
      check: (s, ses) => settled(ses) && mcapOk(ses) && liveOn(ses, 'E5', 'C5') },
    { id: 'ev', teach: 'A buyer of the business takes on its debt and gets its cash, so enterprise value is the market cap plus debt less cash. It is the same whether the company is funded by shares or loans.',
      text: `Enterprise value in H5: ${F('H5')}.`,
      keys: `→ ×3 ${q(F('H5'))} ↵`, requires: ['enterprise-value', 'arrow-keys', 'formula-operators'],
      hintStuck: 'pulse cell H5 · Market cap in E5, debt in F5 added, cash in G5 taken off.',
      check: (s, ses) => settled(ses) && evOk(ses) && liveOn(ses, 'H5', 'F5') },
    { id: 'mult', teach: 'Enterprise value goes over a line struck before interest (revenue, EBITDA), because a sponsor sets its own debt and a peer’s multiple should price its washes, not its loans. Where EBITDA is zero or negative the multiple means nothing, so the IF shows NM and the statistics later skip it like any text.',
      text: `The multiples: K5 ${F('K5')}, and L5 ${F('L5')}.`,
      keys: `→ ×3 ${q(F('K5'))} ↵ → ${q(F('L5'))} ↵`, requires: ['trading-multiple', 'if-function', 'arrow-keys'],
      hintStuck: 'pulse range K5:L5 · Both over the EV in H5; the IF tests J5 first.',
      check: (s, ses) => settled(ses) && multOk(ses) && liveOn(ses, 'L5', 'C5') && nmGuard(ses) },
    { id: 'margin', teach: 'The margin is a ratio beside the figures, not a figure, so the page sets it in italic.',
      text: `The EBITDA margin in M5: ${F('M5')}, in italic with Ctrl+I.`,
      keys: `→ ${q(F('M5'))} ↵ Ctrl+I`, requires: ['formula-operators', 'bold-italic-underline'],
      hintStuck: 'pulse cell M5 · EBITDA in J5 over revenue in I5, then Ctrl+I.',
      check: (s, ses) => settled(ses) && marginOk(ses) },
    { id: 'fill', teach: 'Ctrl+D copies a cell’s format with its formula, which is right for the multiples and the margin. The $ sign belongs on the first row only, so E and H take Ctrl+Enter, which writes the formula and leaves each cell’s format alone.',
      text: 'Fill the set: K5:M10 down with Ctrl+D, then E6:E10 and H6:H10 with Ctrl+Enter so the $ stays on the first row.',
      keys: `Ctrl+G "Comps!K5:M10" ↵ Ctrl+D Ctrl+G "Comps!E6:E10" ↵ ${q(F('E6'))} Ctrl+↵ Ctrl+G "Comps!H6:H10" ↵ ${q(F('H6'))} Ctrl+↵`,
      requires: ['fill-down-right', 'ctrl-enter-fill', 'go-to'], convention: 'D4',
      hintStuck: 'pulse range K5:M10 · Summit holds more cash than debt, so its EV lands below its market cap: net cash, as the note in AB7 says.',
      check: (s, ses) => settled(ses) && fillOk(ses) && liveOn(ses, 'L10', 'C10') },
    { id: 'source', teach: 'A comp set is only as good as the day it was pulled, so every comp carries its filing and its price date beside it. Ctrl+→ jumps across the empty columns to the next thing in the row.',
      text: 'Read where Pinnacle’s figures come from: from C5, Ctrl+→ twice lands on its source and date in AA5.',
      keys: 'Ctrl+G "Comps!C5" ↵ Ctrl+→ ×2', requires: ['ctrl-arrow', 'source-line', 'go-to'], convention: 'B6',
      hintStuck: 'pulse cell AA5 · The first Ctrl+→ stops at M5, the end of the filled run.',
      check: (s, ses) => settled(ses) && cursorAt(ses, 'Comps', 'AA5') },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Comps!C5" Enter "30" Enter Ctrl+G "Comps!L5" Enter', cadence: 360 },
      text: 'Does it tie? Watch Pinnacle’s price go from $24.50 to $30.00: its market cap, EV and multiple in row 5 move, and no other row does.', requires: [],
      hintStuck: 'pulse cell L5 · Each row reads only its own inputs.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Six comps spread the same way: market cap, enterprise value, EV / revenue and EV / EBITDA', check: (s, ses) => mcapOk(ses) && evOk(ses) && multOk(ses) && fillOk(ses) },
    { text: 'A comp with no positive EBITDA shows NM, never an error', check: (s, ses) => nmGuard(ses) },
  ],
  closing: [
    'Six companies are built the same way, and each one carries a price for a dollar of profit.',
    'Best practice: every input on a comp carries its source and date in the next cell. When a reviewer asks where 24.50 came from, the answer is on the row.',
  ],
};
LESSON.solution = solutionOf(LESSON.goals);
export default LESSON;
