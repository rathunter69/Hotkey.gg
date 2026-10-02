// Practice · Formatting — Dollars to thousands (script-drills D41, Wave 1; after 2.1.2). The P&L as it
// stood after the sign convention (state S1b), but the export came out in dollars: every typed line is
// a thousand times the page's, the units line says USD, and a 1000 waits in G2. Select only the typed
// figures with Go To Special, Constants, divide them by the copied 1000 in one Paste Special, and
// leave the totals alone. Graded on the typed cells back in thousands, every formula's text as it was
// (a paste over a formula rewrites it), the units line, and the spare cell cleared.
import { LINE_ROWS, UNITS_LINE } from '../workbooks/clearcoat-pnl.js';
import { pnlDrill, pnl, settled, across, cellIn, near } from './pnl-drills.js';
import { norm } from '../lessons/lib/model-build.js';

const TYPED = across(LINE_ROWS);
const FORMULAS = across([10, 20, 22, 24, 35]);
const SPARE = 'G2', DOLLARS_LINE = 'USD unless stated; costs shown as negatives';
function plant() {
  const p = {};
  for (const ref of TYPED) { const c = cellIn('S1b', 'P&L', ref); p[`P&L!${ref}`] = { ...c, value: Math.round(c.value * 1000) }; }
  p[`P&L!${SPARE}`] = { value: 1000, fontColor: 'blue' };
  p['P&L!A2'] = { ...cellIn('S1b', 'P&L', 'A2'), value: DOLLARS_LINE };
  return p;
}
const thousands = sh => !!sh && TYPED.every(ref => !sh.formula(ref) && near(sh.value(ref), cellIn('S1b', 'P&L', ref).value, 1e-6));
const formulasKept = sh => !!sh && FORMULAS.every(ref => norm(sh.formula(ref)) === norm(cellIn('S1b', 'P&L', ref).formula));
const spareGone = sh => { const c = sh.cellAt(SPARE); return c.value == null && !c.formula; };

export default pnlDrill({
  id: 'ch2-to-thousands',
  title: 'Dollars to thousands',
  task: 'The export is in dollars and the page is in thousands: divide the typed figures by 1,000 and leave the formulas alone.',
  module: 'number-formats',
  state: { before: 'S1b' },
  plant,
  goals: [
    { id: 'copy', text: 'Copy the 1000 waiting in G2 with Ctrl+C.', keys: 'Ctrl+G "G2" ↵ Ctrl+C',
      check: (s, ses) => { const sh = pnl(ses); return settled(ses) && !!sh.clipboard && sh.selectionText() === SPARE; } },
    { id: 'constants', text: 'Select C7:E24, then only its typed figures with Go To Special, Constants: F5, Alt+S, O, Enter.', keys: 'Ctrl+G "C7:E24" ↵ F5 Alt+S O ↵',
      check: (s, ses) => { const sh = pnl(ses); if (!settled(ses)) return false; const rs = sh.selRects(); return rs.length > 1 && rs.every(rg => rg.c1 >= 3 && rg.c2 <= 5 && [7, 8, 9, 13, 14, 15, 16, 17, 18, 19, 23].includes(rg.r1) && [7, 8, 9, 13, 14, 15, 16, 17, 18, 19, 23].includes(rg.r2)); } },
    { id: 'divide', text: 'Divide them by the copied 1000 in one Paste Special: Ctrl+Alt+V, V, I, Enter.', keys: 'Ctrl+Alt+V V I ↵',
      check: (s, ses) => settled(ses) && thousands(pnl(ses)) && formulasKept(pnl(ses)) },
    { id: 'units', text: 'Change the units line in A2 to USD thousands unless stated; costs shown as negatives.', keys: `Ctrl+G "A2" ↵ "${UNITS_LINE}" ↵`,
      check: (s, ses) => settled(ses) && pnl(ses).value('A2') === UNITS_LINE },
    { id: 'spare', text: 'Clear the 1000 from G2 with Delete.', keys: 'Ctrl+G "G2" ↵ Delete',
      check: (s, ses) => settled(ses) && spareGone(pnl(ses)) },
  ],
  endState: [
    { text: 'Every typed figure is back in thousands, every formula reads as it did, the units line says thousands and G2 is empty', check: (s, ses) => { const sh = pnl(ses); return thousands(sh) && formulasKept(sh) && sh.value('A2') === UNITS_LINE && spareGone(sh); } },
  ],
  solution: `Ctrl+G "G2" Enter Ctrl+C Ctrl+G "C7:E24" Enter F5 Alt+S O Enter Ctrl+Alt+V V I Enter Ctrl+G "A2" Enter "${UNITS_LINE}" Enter Ctrl+G "G2" Enter Delete`,
  optimalKeys: 110,
  route: 30,
});
