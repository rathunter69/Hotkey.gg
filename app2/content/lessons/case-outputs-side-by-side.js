// Chapter 4 · 4.5.6 Case outputs side by side: a data table on the switch, and the sticky IF
// (clearcoat-pack, S455 → S456). The three cases' outputs held at once: the case numbers 1, 2, 3
// across D50:F50, their names above by INDEX, the corner links C51:C54 to the live outputs, and a
// Data Table on C50:F54 whose row input is the switch C11. Then the sticky IF, built in H54 with
// iterative calculation on, watched holding the Base case while the picker moves, and taken out
// again: the table is what stays. Questions 9 and 10 on Q&A are answered from the page. Labels,
// the source line, the checks and the formats are planted.
import { stateOf, SCENARIOS, BREAK_EVEN, formatOnly } from '../workbooks/clearcoat-pack.js';
import { scenarios, sheetIn, settled, calls, reads, near, tableOn, typedRow } from './lib/pack-scenario-checks.js';

const C = SCENARIOS; const K = C.cases;   // name 49, num 50, washes 51, revenue 52, contrib 53, ebitda 54
const DONE = stateOf('S456');
const sc = DONE.sheets.find(s => s.name === 'Scenarios').cells, qa = DONE.sheets.find(s => s.name === 'Q&A').cells;
const NUMS = ['D', 'E', 'F'].map(c => c + K.num), NAMES = ['D', 'E', 'F'].map(c => c + K.name);
const CORNER = [K.washes, K.revenue, K.contrib, K.ebitda].map(r => 'C' + r);
const LINKS = ['washesYr', 'revenue', 'contrib', 'ebitda'].map(k => 'C' + C.outputs[k]);
const label = r => ['Scenarios!B' + r, sc['B' + r]];
const PLANT = Object.fromEntries([
  ...[K.title, K.name, K.num, K.washes, K.revenue, K.contrib, K.ebitda, C.source, C.checks, ...C.checkRows].filter(r => sc['B' + r]).map(label),
  ...C.checkRows.map(r => ['Scenarios!C' + r, sc['C' + r]]),
  ...[...NUMS, ...CORNER, ...['D', 'E', 'F'].flatMap(c => [K.washes, K.revenue, K.contrib, K.ebitda].map(r => c + r))].map(k => ['Scenarios!' + k, formatOnly(sc[k])]).filter(([, v]) => v),
  ...['F13', 'F14'].map(k => ["Q&A!" + k, formatOnly(qa[k])]),
]);
const STICKY = 'H' + K.ebitda;
const BASE_COL = 'E' + K.ebitda;
const numsOk = ses => typedRow(scenarios(ses), NUMS, [1, 2, 3]);
const namesOk = ses => { const sh = scenarios(ses), L = sheetIn(ses, 'Lists'); return !!sh && NAMES.every((ref, i) => calls(sh, ref, ['INDEX']) && reads(sh, ref, [NUMS[i]]) && sh.value(ref) === L.value('L' + (5 + i))); };
const cornerOk = ses => { const sh = scenarios(ses); return !!sh && CORNER.every((ref, i) => reads(sh, ref, [LINKS[i]]) && near(sh.value(ref), sh.value(LINKS[i]))); };
const tableOk = ses => { const sh = scenarios(ses); if (!tableOn(sh, { block: `C${K.num}:F${K.ebitda}`, row: 'C' + C.switch })) return false;
  const live = sh.value('C' + C.switch); const e = ['D', 'E', 'F'].map(c => sh.value(c + K.ebitda));
  return near(e[live - 1], sh.value('C' + C.outputs.ebitda), 1e-3) && e[0] > e[1] && e[1] > e[2] && near(sh.value('C' + C.checkRows[0]), 0); };
const iter = ses => !!ses.settings.iterative;
const stickyOk = ses => { const sh = scenarios(ses); return !!sh && reads(sh, STICKY, [STICKY, 'C' + C.switch, 'C' + C.outputs.ebitda]) && calls(sh, STICKY, ['IF']); };
const holds = ses => { const sh = scenarios(ses); return stickyOk(ses) && sh.value('C' + C.picker) === 'Downside' && near(sh.value(STICKY), sh.value(BASE_COL), 1e-3) && !near(sh.value(STICKY), sh.value('C' + C.outputs.ebitda)); };
const removed = ses => { const sh = scenarios(ses); return !!sh && sh.value(STICKY) == null && !sh.formula(STICKY) && sh.value('C' + C.picker) === 'Base' && !iter(ses); };
const answered = ses => { const Q = sheetIn(ses, 'Q&A'), sh = scenarios(ses); return !!Q && reads(Q, 'F13', ['Scenarios!F' + K.ebitda]) && near(Q.value('F13'), sh.value('F' + K.ebitda))
  && reads(Q, 'F14', ['Scenarios!C' + C.breakEven.goalSeek]) && Q.value('F14') === BREAK_EVEN.goalSeek && Q.value('E13') === 'Answered' && Q.value('E14') === 'Answered'; };
const F = { name: sc['D' + K.name].formula, sticky: `=IF($C$${C.switch}=2,$C$${C.outputs.ebitda},${STICKY})`, q9: qa.F13.formula, q10: qa.F14.formula };

export default {
  id: 'case-outputs-side-by-side',
  chapter: 'data-and-lookups',
  section: 'Scenarios and sensitivity',
  module: 'scenarios-and-sensitivity',
  workbook: 'clearcoat-pack',
  state: { before: 'S455', after: 'S456' },
  plant: PLANT,
  title: 'Case outputs side by side: a data table on the switch, and the sticky IF',
  difficulty: 'hard',
  tags: ['scenarios', 'data tables', 'circularity'],
  access: 'paid',
  minutes: 7,
  headline: 'Alt A W T',
  conventions: ['E9', 'E8', 'F1'],
  teaches: ['sticky-if'],
  uses: ['data-table-one-way', 'case-switch', 'iterative-calc', 'go-to', 'sheet-reference', 'ctrl-enter-fill', 'tab-commits', 'delete-clears', 'cross-sheet-ref'],
  prerequisites: ['pass-through-driver'],
  brief: 'The board wants all three cases on one page, and a switch shows one at a time. The clean way to hold them all is a one-way Data Table whose row input is the switch itself: 1, 2 and 3 across the top, the outputs down the side, and the table runs the model three times. The other is the sticky IF, a cell that reads the live output when its case is on and otherwise reads itself, which needs iteration on. Build both; keep the table. The key is `Alt A W T`.',
  goals: [
    { id: 'numbers', text: 'Type the case numbers across D50:F50: 1, 2 and 3.', keys: 'Ctrl+G "Scenarios!D50" ↵ "1" Tab "2" Tab "3" ↵', requires: ['go-to', 'tab-commits'],
      hintStuck: 'pulse range D50:F50 · These are the values the table writes into the switch.',
      check: (s, ses) => settled(ses) && numsOk(ses) },
    { id: 'names', text: `Name each column from the list: D49:F49 ${F.name} with Ctrl+Enter.`, keys: `↑ ↑ Shift+→ ×2 "${F.name}" Ctrl+↵`, requires: ['case-switch', 'ctrl-enter-fill', 'cross-sheet-ref'],
      hintStuck: 'pulse range D49:F49 · INDEX of the case list by the number below each name.',
      check: (s, ses) => settled(ses) && namesOk(ses) },
    { id: 'corner', text: 'Link the outputs down the side: C51 =C17, C52 =C18, C53 =C22 and C54 =C24.', keys: '↓ ↓ ← "=C17" ↵ "=C18" ↵ "=C22" ↵ "=C24" ↵', requires: ['data-table-one-way'],
      hintStuck: 'pulse range C51:C54 · Washes a year, revenue, site contribution and EBITDA, live.',
      check: (s, ses) => settled(ses) && cornerOk(ses) },
    { id: 'table', text: 'Select C50:F54, press Alt, A, W, T, set the Row input cell to the switch, C11, and press Enter.', keys: 'Ctrl+↑ ×2 ↑ Shift+→ ×3 Shift+↓ ×4 Alt A W T Alt+R "C11" ↵', requires: ['data-table-one-way', 'case-switch'], convention: 'E9',
      hintStuck: 'pulse range C50:F54 · The table writes 1, 2 and 3 into the switch and runs the model each time.',
      check: (s, ses) => settled(ses) && tableOk(ses) },
    { id: 'sticky', teach: 'A sticky IF reads the live output when its case is on and its own cell when it is not, so it holds the last value it saw. A cell that reads itself is a circular reference, so it needs iterative calculation on.',
      text: `Turn on iterative calculation (Alt, F, T, I, Enter) and write the sticky IF in H54: ${F.sticky}.`, keys: `Ctrl+↓ ×2 Ctrl+→ → → Alt F T I ↵ "${F.sticky}" ↵`, requires: ['sticky-if', 'iterative-calc', 'ctrl-arrow'], convention: 'E8',
      hintStuck: 'pulse cell H54 · On Base, the switch reads 2, so H54 takes the live EBITDA.',
      check: (s, ses) => settled(ses) && iter(ses) && stickyOk(ses) && near(scenarios(ses).value(STICKY), scenarios(ses).value('C' + C.outputs.ebitda)) },
    { id: 'hold', text: 'Set the picker in C10 to Downside: EBITDA falls, and H54 holds Base’s figure, a hardcode that looks like a formula.', keys: 'Ctrl+G "Scenarios!C10" ↵ "Downside" ↵', requires: ['sticky-if', 'go-to'],
      hintStuck: 'pulse cell H54 · With the switch off 2, H54 reads itself and keeps what it had.',
      check: (s, ses) => settled(ses) && holds(ses) },
    { id: 'remove', text: 'Keep the table, not the sticky cell: picker back to Base, H54 cleared, and iterative calculation off again.', keys: '↑ "Base" ↵ Ctrl+G "Scenarios!H54" ↵ Delete Alt F T I ↵', requires: ['sticky-if', 'delete-clears', 'iterative-calc', 'go-to'],
      hintStuck: 'pulse cell H54 · Nobody can tell from the sheet that a sticky cell is stale, so the table stays and the sticky cell goes.',
      check: (s, ses) => settled(ses) && removed(ses) },
    { id: 'answer', text: 'On Q&A, answer questions 9 and 10: F13 =Scenarios!F54, F14 =Scenarios!C46, and mark both Answered in E13:E14.', keys: `Ctrl+G "'Q&A'!F13" ↵ "${F.q9}" ↵ "${F.q10}" ↵ ← ↑ ↑ "Answered" ↵ "Answered" ↵`, requires: ['go-to', 'cross-sheet-ref'],
      hintStuck: 'pulse range F13:F14 · Downside EBITDA is the table’s third column; break-even is the Goal Seek note.',
      check: (s, ses) => settled(ses) && answered(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Scenarios!E5" Enter "200" Enter Ctrl+G "Scenarios!F54" Enter', cadence: 320 },
      text: 'Does it tie? Watch Downside’s washes a day go from 220 to 200: its column of the table moves while Base is live.', requires: [],
      hintStuck: 'pulse range F51:F54 · The table runs the model for every case on every change.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C50:F54 is a Data Table on the switch, its columns named, its check at zero', check: (s, ses) => numsOk(ses) && namesOk(ses) && cornerOk(ses) && tableOk(ses) },
    { text: 'The sticky cell is gone and iterative calculation is off', check: (s, ses) => removed(ses) },
    { text: 'Questions 9 and 10 read the page and are marked Answered', check: (s, ses) => answered(ses) },
  ],
  closing: [
    'Three cases on one page, live from a table, and you know when a sticky IF is the honest exception.',
    'The table runs the model once for each case and stays live; the sticky cell held a figure nobody could check. Best practice: a data table when the outputs are a handful of lines, and a sticky IF only when a table can’t reach the input or the model is too slow to run three times, always labeled, because a sticky cell is a hardcode that looks like a formula.',
  ],
  solution: `Ctrl+G "Scenarios!D50" Enter "1" Tab "2" Tab "3" Enter Up Up Shift+Right Shift+Right "${F.name}" Ctrl+Enter Down Down Left "=C17" Enter "=C18" Enter "=C22" Enter "=C24" Enter `
    + 'Ctrl+Up Ctrl+Up Up Shift+Right Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Shift+Down Alt A W T Alt+R "C11" Enter '
    + `Ctrl+Down Ctrl+Down Ctrl+Right Right Right Alt F T I Enter "${F.sticky}" Enter Ctrl+G "Scenarios!C10" Enter "Downside" Enter `
    + 'Up "Base" Enter Ctrl+G "Scenarios!H54" Enter Delete Alt F T I Enter '
    + `Ctrl+G "'Q&A'!F13" Enter "${F.q9}" Enter "${F.q10}" Enter Left Up Up "Answered" Enter "Answered" Enter`,
};
