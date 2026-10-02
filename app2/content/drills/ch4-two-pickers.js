// Practice · Data and Lookups — Two pickers (script-drills D48, Wave 1). The KPI page as module 4.3
// left it (S436): the washes cube by site and week, a site picker and a week picker in the "Any site,
// any week" block, its answer emptied, and a colleague's version under it with the positions typed.
// Write the answer as INDEX with two MATCHes, then insert a row inside the cube and a column inside
// the weeks: the answer holds and the colleague's does not. Graded wherever the block has moved to:
// the answer reads the cube for the picked site and week, after both inserts, and again with both
// pickers moved (the what-if), and it carries no typed position.
import { packDrill, solutionOf } from './pack-drills.js';
import { sheetIn, settled, isNum } from '../lessons/lib/databook-checks.js';
import { fnsOf } from '../lessons/lib/pack-checks.js';
import { tokenize } from '../../engine/formula.js';
import { under } from '../lessons/lib/model-checks.js';

const S = 'Summary', COUNT = '#,##0_);(#,##0);"-"_)';
const plant = {
  [`${S}!C38`]: { fmtStyle: 'custom', numFmt: COUNT },
  [`${S}!B39`]: { value: 'Washes, a colleague’s (positions typed)' },
  [`${S}!C39`]: { formula: '=INDEX($C$15:$E$20,5,2)', fmtStyle: 'custom', numFmt: COUNT },
};
const LETTERS = 'ABCDEFGHIJ';
/** Where a labeled line of the block sits now (rows and columns move with the inserts): the row whose B reads `label`, below the block's title. */
function rowOf(sh, label, from = 'Any site, any week') {
  let top = null;
  for (let r = 25; r <= 50; r++) { const v = sh.value('B' + r); if (v === from) top = r; else if (top && v === label) return r; }
  return null;
}
/** The cube as it stands: its header row (the weeks) and its site rows, found by the title above it. */
function cubeOf(sh) {
  let title = null; for (let r = 10; r <= 20; r++) if (sh.value('B' + r) === 'Washes by site and week') { title = r; break; }
  if (!title) return null;
  const head = title + 1; const rows = []; for (let r = head + 1; r <= head + 9; r++) { const v = sh.value('B' + r); if (v === 'Total') break; rows.push(r); }
  return { head, rows };
}
const cubeValue = (sh, site, week) => {
  const c = cubeOf(sh); if (!c) return null;
  const r = c.rows.find(x => sh.value('B' + x) === site); const col = [...LETTERS.slice(2)].find(L => sh.value(L + c.head) === week);
  return r && col ? sh.value(col + r) : null;
};
const typedPosition = f => { try { return tokenize(String(f).replace(/^=/, '')).some(t => t.t === 'num'); } catch (e) { return true; } };
/** The answer reads the cube for the site and the week the pickers hold, by INDEX and two MATCHes, with no typed position. */
function answers(ses) {
  const sh = sheetIn(ses, S); if (!sh) return false;
  const site = rowOf(sh, 'Site code'), week = rowOf(sh, 'Week'), ans = rowOf(sh, 'Washes'); if (!site || !week || !ans) return false;
  const f = sh.formula('C' + ans); const fns = fnsOf(sh, 'C' + ans);
  if (!f || !fns.includes('INDEX') || fns.filter(x => x === 'MATCH').length < 2 || typedPosition(f.replace(/MATCH\(([^()]*),0\)/gi, 'MATCH($1)'))) return false;
  const ok = x => { const s = sheetIn(x, S); const v = s.value('C' + ans); const w = cubeValue(s, s.value('C' + site), s.value('C' + week)); return isNum(w) && v === w; };
  return ok(ses) && under(ses, { [`${S}!C${site}`]: 'AUS-DOM', [`${S}!C${week}`]: 'Week of 28-Sep' }, ok);
}
const rowIn = ses => { const c = cubeOf(sheetIn(ses, S)); return !!c && c.rows.length === 7 && c.rows.some(r => !sheetIn(ses, S).value('B' + r)); };
const colIn = ses => { const sh = sheetIn(ses, S); const c = cubeOf(sh); return !!c && sh.value('C' + c.head) === 'Week of 14-Sep' && !sh.value('D' + c.head) && sh.value('E' + c.head) === 'Week of 21-Sep'; };

const GOALS = [
  { id: 'answer', text: 'In Summary C38, the washes for the site in C34 and the week in C35: INDEX on the cube with two MATCHes.',
    keys: 'Ctrl+G "Summary!C38" ↵ "=INDEX($C$15:$E$20,MATCH(C34,$B$15:$B$20,0),MATCH(C35,$C$14:$E$14,0))" ↵',
    check: (s, ses) => settled(ses) && answers(ses) },
  { id: 'row', text: 'Insert a row inside the cube at row 17 (Shift+Space, Ctrl+Shift+=): the answer holds, the colleague’s moves.',
    keys: 'Ctrl+G "A17" ↵ Shift+Space Ctrl+Shift+=',
    check: (s, ses) => settled(ses) && rowIn(ses) && answers(ses) },
  { id: 'column', text: 'Insert a column inside the weeks at D (Ctrl+Space, Ctrl+Shift+=): the answer still reads the right washes.',
    keys: 'Ctrl+G "D1" ↵ Ctrl+Space Ctrl+Shift+=',
    check: (s, ses) => settled(ses) && rowIn(ses) && colIn(ses) && answers(ses) },
];

export default packDrill({
  id: 'ch4-two-pickers',
  title: 'Two pickers',
  task: 'A site picker and a week picker return washes from the cube, and the answer survives an inserted row.',
  module: 'lookups',
  state: { before: 'S436' },
  plant,
  goals: GOALS,
  endState: [
    { text: 'The answer reads the cube for the picked site and week after both inserts, with no typed position', check: (s, ses) => rowIn(ses) && colIn(ses) && answers(ses) },
  ],
  solution: solutionOf(GOALS),
  optimalKeys: 110,
  route: 35,
});
