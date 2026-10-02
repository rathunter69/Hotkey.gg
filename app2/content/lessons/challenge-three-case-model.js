// Chapter 4 · 4.5.C Challenge: a three-case model with a sensitivity table (clearcoat-pack, seeded over S45C)
// The module's Scenarios page with fresh case inputs (washes a day and sites at year end for the
// three cases; Base's member share holds at 50%), and its switch, live column, tables and Goal Seek
// note taken out: the outputs, the pass-through driver, the edges and the labels stay. The
// challenge builds the switch and the live column, the one-way and two-way tables on the driver,
// Domain's break-even by Goal Seek noted with the input put back, and the case table on the switch.
// Graded on the learner's own sheet: each figure against the model it reads.
import { challengeSeed, SCENARIOS, TICKETS, SHARES, BREAK_EVEN } from '../workbooks/clearcoat-pack.js';
import { scenarios, sheetIn, settled, calls, reads, live, near, tableOn } from './lib/pack-scenario-checks.js';
import { parsFrom } from '../../app/pars.js';

const ID = 'challenge-three-case-model';
const C = SCENARIOS; const B = C.breakEven, K = C.cases;
const DRIVER = 'C' + C.driver, MODEL = 'C' + C.ticketModel;
const out = (sh, k) => sh.value('C' + C.outputs[k]);
const CASES = ses => { const L = sheetIn(ses, 'Lists'); return [5, 6, 7].map(r => L.value('L' + r)); };
const pick = (sh, r, n) => sh.value('CDE'[n - 1] + r);
const switchOk = ses => { const sh = scenarios(ses); const n = CASES(ses).indexOf(sh.value('C' + C.picker)) + 1; return n > 0 && calls(sh, 'C' + C.switch, ['MATCH']) && sh.value('C' + C.switch) === n; };
const columnOk = ses => { const sh = scenarios(ses); const n = sh.value('C' + C.switch); return switchOk(ses) && calls(sh, 'G5', ['CHOOSE']) && [5, 6, 7, 8].every(r => near(sh.value('G' + r), pick(sh, r, n)) && reads(sh, 'G' + r, ['C' + C.switch])) && live(sh, 'G5') && live(sh, 'G8'); };
const oneWayOk = ses => { const sh = scenarios(ses); return !!tableOn(sh, { block: `C${C.oneWay.vals}:H${C.oneWay.ebitda}`, row: DRIVER })
  && ['D', 'E', 'F', 'G', 'H'].every((c, j) => near(sh.value(c + C.oneWay.ebitda), out(sh, 'ebitda') + out(sh, 'washesYr') * (TICKETS[j] - sh.value(MODEL)), 1e-3)); };
const twoWayOk = ses => { const sh = scenarios(ses); const cost = sheetIn(ses, 'Inputs').value('C7'); return !!tableOn(sh, { block: `C${C.twoWay.vals}:H${C.twoWay.rows[4]}`, row: DRIVER, col: 'G' + C.inputs.share })
  && C.twoWay.rows.every((r, i) => ['D', 'E', 'F', 'G', 'H'].every((c, j) => near(sh.value(c + r), out(sh, 'ebitda') + out(sh, 'washesYr') * (TICKETS[j] - sh.value(MODEL)) + out(sh, 'washesYr') * (SHARES[i] - sh.value('G' + C.inputs.share)) * cost, 1e-3))); };
const notedOk = ses => { const sh = scenarios(ses); const v = sh.value('C' + B.goalSeek); return !sh.formula('C' + B.goalSeek) && typeof v === 'number' && Math.abs(v - sh.value('C' + B.hand)) <= 0.5 && sh.value('C' + B.washes) === 250 && !sh.formula('C' + B.washes); };
const caseTableOk = ses => { const sh = scenarios(ses); if (!tableOn(sh, { block: `C${K.num}:F${K.ebitda}`, row: 'C' + C.switch })) return false; const e = ['D', 'E', 'F'].map(c => sh.value(c + K.ebitda)); return near(e[sh.value('C' + C.switch) - 1], out(sh, 'ebitda'), 1e-3) && e[0] > e[1] && e[1] > e[2]; };
const F = { sw: '=MATCH(C10,Lists!$L$5:$L$7,0)', choose: '=CHOOSE($C$11,C5,D5,E5)', index: '=INDEX(C6:E6,$C$11)' };

export default {
  id: ID,
  chapter: 'data-and-lookups',
  section: 'Scenarios and sensitivity',
  module: 'scenarios-and-sensitivity',
  workbook: 'clearcoat-pack',
  state: { before: 'S45C' },
  kind: 'challenge',
  title: 'Challenge: a three-case model with a sensitivity table',
  difficulty: 'hard',
  tags: ['challenge', 'scenarios', 'sensitivity', 'data tables', 'goal seek'],
  access: 'paid',
  minutes: 3,
  conventions: ['E9', 'B1'],
  prerequisites: ['case-outputs-side-by-side'],
  brief: 'Fresh case inputs, and the switch, the live column and the tables are gone. Build the switch, both sensitivities on the driver, break-even by Goal Seek, and the cases side by side.',
  timeLimit: 180,
  pars: parsFrom(95, { pass: 178, pro: 135 }),
  seed: rng => challengeSeed(ID, rng),
  goals: [
    { id: 'switch', text: 'The switch and the live column: C11 =MATCH(C10,Lists!$L$5:$L$7,0), G5 by CHOOSE and G6:G8 by INDEX on $C$11.',
      keys: `Ctrl+G "Scenarios!C11" ↵ "${F.sw}" Ctrl+↵ Ctrl+↑ ×2 ↑ ×3 Ctrl+→ → → "${F.choose}" ↵ Shift+↓ ×2 "${F.index}" Ctrl+↵`,
      check: (s, ses) => settled(ses) && columnOk(ses) },
    { id: 'one-way', text: 'The one-way table: select C28:H29 and run a Data Table with the driver C13 as its Row input cell.',
      keys: 'Ctrl+G "Scenarios!C28:H29" ↵ Alt A W T Alt+R "C13" ↵',
      check: (s, ses) => settled(ses) && oneWayOk(ses) },
    { id: 'two-way', text: 'The two-way table on C32:H37: Row input cell C13, Column input cell G7.',
      keys: 'Ctrl+↓ ×2 Shift+→ ×5 Shift+↓ ×5 Alt A W T Alt+R "C13" Alt+C "G7" ↵',
      check: (s, ses) => settled(ses) && twoWayOk(ses) },
    { id: 'goal-seek', text: `Goal Seek C44 to 0 by changing C43, note the answer in C46 as ${BREAK_EVEN.goalSeek}, and put 250 back in C43.`,
      keys: `Ctrl+G "Scenarios!C44" ↵ Alt A W G Alt+V "0" Alt+C "C43" ↵ ↵ ↓ ↓ "${BREAK_EVEN.goalSeek}" Shift+↵ ↑ ↑ "250" ↵`,
      check: (s, ses) => settled(ses) && notedOk(ses) },
    { id: 'cases', text: 'The cases side by side: select C50:F54 and run a Data Table with the switch C11 as its Row input cell.',
      keys: 'Ctrl+G "Scenarios!C50:F54" ↵ Alt A W T Alt+R "C11" ↵',
      check: (s, ses) => settled(ses) && caseTableOk(ses) },
  ],
  graders: [
    ses => columnOk(ses) ? { ok: true } : { ok: false, why: 'the live column does not follow the switch. Every line of G5:G8 reads C11, so one switch moves the whole model' },
    ses => oneWayOk(ses) && twoWayOk(ses) ? { ok: true } : { ok: false, why: 'a sensitivity table does not run on the driver. The tables write into C13, and C14 passes the value to the model' },
    ses => notedOk(ses) ? { ok: true } : { ok: false, why: 'Goal Seek’s answer is not noted as a typed figure in C46, or C43 is not back at 250. Goal Seek writes over an input, so note the answer and put the input back' },
    ses => caseTableOk(ses) ? { ok: true } : { ok: false, why: 'the case table does not run on the switch. With C11 as its row input cell, it shows all three cases at once' },
  ],
  solution: `Ctrl+G "Scenarios!C11" Enter "${F.sw}" Ctrl+Enter Ctrl+Up Ctrl+Up Up Up Up Ctrl+Right Right Right "${F.choose}" Enter Shift+Down Shift+Down "${F.index}" Ctrl+Enter `
    + 'Ctrl+G "Scenarios!C28:H29" Enter Alt A W T Alt+R "C13" Enter '
    + 'Ctrl+Down Ctrl+Down Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Alt A W T Alt+R "C13" Alt+C "G7" Enter '
    + `Ctrl+G "Scenarios!C44" Enter Alt A W G Alt+V "0" Alt+C "C43" Enter Enter Down Down "${BREAK_EVEN.goalSeek}" Shift+Enter Up Up "250" Enter `
    + 'Ctrl+G "Scenarios!C50:F54" Enter Alt A W T Alt+R "C11" Enter',
};
