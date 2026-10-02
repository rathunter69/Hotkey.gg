// Practice · Formatting — Top and bottom (screenplay 6.2). The P&L as the divider left it (state S3b),
// with the export's grid back over the lines C7:E24 and the four totals plain. Take every border off,
// put the divider back, then bold each total and give it a top border, a double bottom on EBITDA, and
// the gridlines off. Graded on the borders each cell carries: the totals' lines, the one divider, and
// no other border inside the page.
import { PLANT_GRID, TOTAL_ROWS } from '../workbooks/clearcoat-pnl.js';
import { pnlDrill, pnl, settled, carries, lacks, across, cellIn } from './pnl-drills.js';

const ROWS = TOTAL_ROWS, COLS = ['B', 'C', 'D', 'E'];
const TOTALS = across(ROWS, COLS);
const LINES = []; for (let r = 7; r <= 24; r++) for (const c of COLS) LINES.push(c + r);
/** The planting: the export's grid over the lines and the totals' bold taken off. */
function plant() {
  const p = { ...PLANT_GRID };
  for (const ref of TOTALS) { const key = `P&L!${ref}`; const rec = { ...(p[key] || cellIn('S3b', 'P&L', ref) || {}) }; delete rec.bold; p[key] = rec; }
  return p;
}
const noGrid = sh => lacks(sh, LINES, 'ball');
const divider = sh => { for (let r = 7; r <= 24; r++) if (!sh.cellAt('D' + r).br) return false; return true; };
const bolded = sh => carries(sh, TOTALS, 'bold');
const tops = sh => carries(sh, TOTALS, 'bt');
const doubled = sh => carries(sh, across(24, COLS), 'bdbl');
/** No border inside the page but the totals' tops, EBITDA's double and the divider. */
const clean = sh => LINES.every(ref => { const c = sh.cellAt(ref), r = +ref.slice(1); return !c.ball && !c.bl && (ROWS.includes(r) || !c.bt) && (r === 24 || (!c.bb && !c.bdbl)) && (ref[0] === 'D' || !c.br); });

export default pnlDrill({
  id: 'ch2-top-and-bottom',
  title: 'Top and bottom',
  task: 'Bold the four totals with a top border each, a double bottom on EBITDA, and no grid anywhere.',
  module: 'the-page-a-buyer-reads',
  state: { before: 'S3b' },
  plant,
  goals: [
    { id: 'no-grid', text: 'Select the gridded lines C7:E24 and take every border off with Alt, H, B, N.', keys: 'Ctrl+G "C7:E24" ↵ Alt H B N',
      check: (s, ses) => settled(ses) && noGrid(pnl(ses)) },
    { id: 'divider', text: 'Put the divider back down the last actual column D7:D24 with Alt, H, B, R.', keys: 'Ctrl+G "D7:D24" ↵ Alt H B R',
      check: (s, ses) => settled(ses) && noGrid(pnl(ses)) && divider(pnl(ses)) },
    { id: 'bold', text: 'Bold the four totals: B10:E10, B20:E20, B22:E22 and B24:E24.', keys: 'Ctrl+G "B10:E10" ↵ Ctrl+B Ctrl+G "B20:E20" ↵ Ctrl+B Ctrl+G "B22:E22" ↵ Ctrl+B Ctrl+G "B24:E24" ↵ Ctrl+B',
      check: (s, ses) => settled(ses) && bolded(pnl(ses)) },
    { id: 'tops', text: 'Give each total a top border with Alt, H, B, P, and F4 for the next three.', keys: 'Ctrl+G "B10:E10" ↵ Alt H B P Ctrl+G "B20:E20" ↵ F4 Ctrl+G "B22:E22" ↵ F4 Ctrl+G "B24:E24" ↵ F4',
      check: (s, ses) => settled(ses) && tops(pnl(ses)) },
    { id: 'double', text: 'EBITDA B24:E24 is the answer: give it a double bottom from Ctrl+1’s Border tab.', keys: 'Ctrl+1 B ↓ ↑ ↵',
      check: (s, ses) => settled(ses) && doubled(pnl(ses)) && tops(pnl(ses)) },
    { id: 'gridlines', text: 'Turn the gridlines off with Alt, W, V, G.', keys: 'Alt W V G',
      check: (s, ses) => settled(ses) && pnl(ses).gridlines === false },
  ],
  endState: [
    { text: 'Four bold totals with a top border, a double bottom on EBITDA, the divider, and no other border on the page', check: (s, ses) => { const sh = pnl(ses); return bolded(sh) && tops(sh) && doubled(sh) && divider(sh) && clean(sh) && sh.gridlines === false; } },
  ],
  solution: 'Ctrl+G "C7:E24" Enter Alt H B N Ctrl+G "D7:D24" Enter Alt H B R Ctrl+G "B10:E10" Enter Ctrl+B Ctrl+G "B20:E20" Enter Ctrl+B Ctrl+G "B22:E22" Enter Ctrl+B Ctrl+G "B24:E24" Enter Ctrl+B Ctrl+G "B10:E10" Enter Alt H B P Ctrl+G "B20:E20" Enter F4 Ctrl+G "B22:E22" Enter F4 Ctrl+G "B24:E24" Enter F4 Ctrl+1 B Down Up Enter Alt W V G',
  optimalKeys: 150,
  route: 45,
});
