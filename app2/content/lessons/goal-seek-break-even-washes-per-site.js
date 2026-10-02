// Chapter 4 · 4.5.4 Goal Seek: break-even washes per site (clearcoat-pack, S453 → S454)
// Domain's break-even on Scenarios: its daily site costs looked up from Lists, the contribution
// per wash (the live ticket less the wash cost and the retail cost on the retail share), the daily
// contribution at 250 washes, break-even by hand, then Goal Seek setting the daily contribution to
// zero by changing the washes, its answer noted in blue and the input put back. Labels, the site
// code, the 250 and the formats are planted.
import { stateOf, SCENARIOS, BREAK_EVEN, formatOnly } from '../workbooks/clearcoat-pack.js';
import { scenarios, sheetIn, settled, calls, live, near } from './lib/pack-checks.js';

const C = SCENARIOS; const B = C.breakEven;   // title 39, site 40, costs 41, cpw 42, washes 43, daily 44, hand 45, goalSeek 46
const DONE = stateOf('S454').sheets.find(s => s.name === 'Scenarios').cells;
const PLANT = Object.fromEntries([
  ...[39, 40, 41, 42, 43, 44, 45, 46].map(r => ['Scenarios!B' + r, DONE['B' + r]]),
  ...['C' + B.site, 'C' + B.washes].map(k => ['Scenarios!' + k, DONE[k]]),
  ...['C' + B.costs, 'C' + B.cpw, 'C' + B.daily, 'C' + B.hand, 'C' + B.goalSeek].map(k => ['Scenarios!' + k, formatOnly(DONE[k])]),
]);
const v = (sh, r) => sh.value('C' + r);
const lists = ses => sheetIn(ses, 'Lists'); const inputs = ses => sheetIn(ses, 'Inputs');
const costsOk = ses => { const sh = scenarios(ses), L = lists(ses); if (!sh) return false; const r = [5, 6, 7, 8, 9, 10].find(i => L.value('B' + i) === v(sh, B.site)); return !!r && calls(sh, 'C' + B.costs, ['INDEX', 'MATCH']) && near(v(sh, B.costs), L.value('H' + r)) && live(sh, 'C' + B.costs); };
const cpwOk = ses => { const sh = scenarios(ses), I = inputs(ses); return !!sh && near(v(sh, B.cpw), sh.value('G' + C.inputs.ticket) - I.value('C5') - (1 - sh.value('G' + C.inputs.share)) * I.value('C7')) && live(sh, 'C' + B.cpw); };
const dailyOk = ses => { const sh = scenarios(ses); return !!sh && !!sh.formula('C' + B.daily) && near(v(sh, B.daily), v(sh, B.washes) * v(sh, B.cpw) - v(sh, B.costs)) && live(sh, 'C' + B.daily); };
const handOk = ses => { const sh = scenarios(ses); return !!sh && !!sh.formula('C' + B.hand) && near(v(sh, B.hand), v(sh, B.costs) / v(sh, B.cpw)) && live(sh, 'C' + B.hand); };
const sought = ses => { const sh = scenarios(ses); return !!sh && !sh.formula('C' + B.washes) && near(v(sh, B.washes), v(sh, B.hand), 1e-3) && Math.abs(v(sh, B.daily)) < 0.01; };
const noted = ses => { const sh = scenarios(ses); return !!sh && !sh.formula('C' + B.goalSeek) && v(sh, B.goalSeek) === BREAK_EVEN.goalSeek && v(sh, B.washes) === 250 && sh.cellAt('C' + B.goalSeek).fontColor === 'blue'; };
const F = { costs: DONE['C' + B.costs].formula, cpw: DONE['C' + B.cpw].formula, daily: DONE['C' + B.daily].formula, hand: DONE['C' + B.hand].formula };

export default {
  id: 'goal-seek-break-even-washes-per-site',
  chapter: 'data-and-lookups',
  section: 'Scenarios and sensitivity',
  module: 'scenarios-and-sensitivity',
  workbook: 'clearcoat-pack',
  state: { before: 'S453', after: 'S454' },
  plant: PLANT,
  title: 'Goal Seek: break-even washes per site',
  difficulty: 'medium',
  tags: ['scenarios', 'goal seek', 'break-even'],
  access: 'paid',
  minutes: 6,
  headline: 'Alt A W G',
  conventions: ['B6', 'B1'],
  teaches: ['goal-seek'],
  uses: ['go-to', 'sheet-reference', 'cross-sheet-ref', 'relative-absolute', 'formula-basics'],
  prerequisites: ['two-way-data-table-ticket-member-share'],
  brief: 'Contribution per wash is the ticket less the cost of a wash, what each wash puts toward the site’s fixed costs, and break-even washes are the daily site costs divided by it. You can solve that by hand, and Goal Seek (Alt, A, W, G) solves it by turning a dial: set this cell to that value by changing this input. It writes its answer over the input, so read it, note it, and put the input back. The key is `Alt A W G`.',
  goals: [
    { id: 'costs', text: `Domain’s daily site costs from Lists: C41 ${F.costs}.`, keys: `Ctrl+G "Scenarios!C41" ↵ "${F.costs}" ↵`, requires: ['go-to', 'cross-sheet-ref', 'relative-absolute'],
      hintStuck: 'pulse cell C41 · Column H of the site list holds each site’s daily costs; MATCH finds Domain’s row.',
      check: (s, ses) => settled(ses) && costsOk(ses) },
    { id: 'cpw', text: `Contribution per wash: C42 ${F.cpw}, the ticket less the wash and the retail costs.`, keys: `"${F.cpw}" ↵`, requires: ['cross-sheet-ref'],
      hintStuck: 'pulse cell C42 · Retail cost falls only on the retail share, 1 less the member share.',
      check: (s, ses) => settled(ses) && cpwOk(ses) },
    { id: 'daily', text: `Domain’s daily contribution at 250 washes a day: C44 ${F.daily}.`, keys: `↓ "${F.daily}" ↵`, requires: ['formula-basics'],
      hintStuck: 'pulse cell C44 · Washes times what each one contributes, less the day’s site costs.',
      check: (s, ses) => settled(ses) && dailyOk(ses) },
    { id: 'hand', text: `Break-even by hand: C45 ${F.hand}, the site costs over the contribution per wash.`, keys: `"${F.hand}" ↵`, requires: ['formula-basics'],
      hintStuck: 'pulse cell C45 · The washes at which the daily contribution is exactly zero.',
      check: (s, ses) => settled(ses) && handOk(ses) },
    { id: 'seek', teach: 'Goal Seek (Alt, A, W, G) sets one formula cell to a value by changing one input: Set cell, To value (Alt+V), By changing cell (Alt+C). Enter runs it and Enter again keeps the answer, written over the input.',
      text: 'Goal Seek: on C44, set it to 0 by changing C43, and keep the answer.', keys: '↑ ↑ Alt A W G Alt+V "0" Alt+C "C43" ↵ ↵', requires: ['goal-seek'],
      hintStuck: 'pulse cell C44 · Goal Seek starts on the active cell as its Set cell.',
      check: (s, ses) => settled(ses) && sought(ses) },
    { id: 'note', text: `Note the answer in C46 as ${BREAK_EVEN.goalSeek}, beside its label, and put 250 back in C43.`, keys: `↓ ↓ "${BREAK_EVEN.goalSeek}" Shift+↵ ↑ ↑ "250" ↵`, requires: ['type-to-enter'], convention: 'B6',
      hintStuck: 'pulse cell C46 · Goal Seek left its answer in the input; the model’s washes go back to 250.',
      check: (s, ses) => settled(ses) && noted(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!C5" Enter "2" Enter Ctrl+G "Scenarios!C45" Enter', cadence: 320 },
      text: 'Does it tie? Watch the cost per wash on Inputs go from $1.50 to $2.00 and the break-even in C45 rise.', requires: [],
      hintStuck: 'pulse cell C45 · The hand formula is live; the noted Goal Seek answer is not, until you run it again.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C41:C45 work out Domain’s break-even, live', check: (s, ses) => costsOk(ses) && cpwOk(ses) && dailyOk(ses) && handOk(ses) },
    { text: 'The Goal Seek answer is noted in C46 and C43 is back at 250', check: (s, ses) => noted(ses) },
  ],
  closing: [
    'You found the washes a site needs to break even by hand and by Goal Seek, and they agree.',
    'The formula in C45 stays live; Goal Seek’s answer is a snapshot that went into an input, which is why it is noted, labeled and the input put back. Best practice: Goal Seek overwrites an input and a data table doesn’t, so reach for the table when the answer has to stay live.',
  ],
  solution: `Ctrl+G "Scenarios!C41" Enter "${F.costs}" Enter "${F.cpw}" Enter Down "${F.daily}" Enter "${F.hand}" Enter `
    + `Up Up Alt A W G Alt+V "0" Alt+C "C43" Enter Enter Down Down "${BREAK_EVEN.goalSeek}" Shift+Enter Up Up "250" Enter`,
};
