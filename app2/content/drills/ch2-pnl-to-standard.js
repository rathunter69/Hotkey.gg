// Practice · Formatting — P&L to standard (screenplay 6.2, benchmark). The P&L as the export left it
// once the signs were flipped (state S1b), every number format taken off. One page, the chapter on
// it: a bold title, the desk code on the lines with the $ on the first row and the totals, the
// divider and the shaded estimate header, a top border on each total and a double under EBITDA, no
// gridlines, and the print set-up. Graded on what each cell renders, the borders and fills it
// carries, and the workbook's page set-up.
import { pnlDrill, pnl, settled, across, unformatted, rendersLike, carries, setup, block } from './pnl-drills.js';
import { TOTAL_ROWS } from '../workbooks/clearcoat-pnl.js';

const PLAIN = '#,##0_);(#,##0);-_)', DOLLAR = '$#,##0_);($#,##0);-_)';
const LINES = block('C7:E24').filter(ref => !/^[C-E](11|12|21)$/.test(ref));
const DOLLARS = across([7, 10, 24]);
const PLAINS = LINES.filter(ref => !DOLLARS.includes(ref));
const TITLE = 'Clearcoat Express Historical Financials';
const COLS = ['B', 'C', 'D', 'E'];
const titled = sh => sh.value('A1') === TITLE && sh.cellAt('A1').bold === true;
const divider = sh => { for (let r = 4; r <= 24; r++) if (!sh.cellAt('D' + r).br) return false; return true; };
const tops = sh => carries(sh, across(TOTAL_ROWS, COLS), 'bt');
const doubled = sh => carries(sh, across(24, COLS), 'bdbl');
const printed = ses => { const p = setup(ses), f = p.footer || {}; return p.orientation === 'landscape' && p.scaling === 'fit' && p.fitWide === 1 && p.fitTall === 1 && f.left === '&[File]' && f.right === '&[Date]'; };

export default pnlDrill({
  id: 'ch2-pnl-to-standard',
  title: 'P&L to standard',
  task: 'Take a raw P&L to presentation quality: title, formats, divider, borders and the print set-up.',
  module: 'printing-and-page-layout',
  benchmark: true,
  state: { before: 'S1b' },
  plant: () => unformatted('S1b', 'P&L', [...LINES, ...across([33, 34, 35])]),
  goals: [
    { id: 'title', text: `Type the title ${TITLE} in A1 and make it bold.`, keys: `Ctrl+G "A1" ↵ "${TITLE}" Ctrl+↵ Ctrl+B`,
      check: (s, ses) => settled(ses) && titled(pnl(ses)) },
    { id: 'lines', text: 'Give the lines C7:E24 the code #,##0_);(#,##0);-_) in Ctrl+1’s Custom box.', keys: `Ctrl+G "C7:E24" ↵ Ctrl+1 N Tab End Alt+T "${PLAIN}" ↵`,
      check: (s, ses) => settled(ses) && rendersLike(pnl(ses), PLAINS, PLAIN) },
    { id: 'dollars', text: 'The first row C7:E7 takes $#,##0_);($#,##0);-_), then total revenue C10:E10 and EBITDA C24:E24 with F4.', keys: `Ctrl+G "C7:E7" ↵ Ctrl+1 N Tab End Alt+T "${DOLLAR}" ↵ Ctrl+G "C10:E10" ↵ F4 Ctrl+G "C24:E24" ↵ F4`,
      check: (s, ses) => settled(ses) && rendersLike(pnl(ses), DOLLARS, DOLLAR) },
    { id: 'shade', text: 'Shade the estimate header E4 gray with Alt, H, H, → and Enter.', keys: 'Ctrl+G "E4" ↵ Alt H H → ↵',
      check: (s, ses) => settled(ses) && pnl(ses).cellAt('E4').fill === 'gray' && !pnl(ses).cellAt('D4').fill },
    { id: 'divider', text: 'Draw the divider down the last actual column D4:D24 with Alt, H, B, R.', keys: 'Ctrl+G "D4:D24" ↵ Alt H B R',
      check: (s, ses) => settled(ses) && divider(pnl(ses)) },
    { id: 'tops', text: 'Give the totals B10:E10, B20:E20, B22:E22 and B24:E24 a top border with Alt, H, B, P and F4.', keys: 'Ctrl+G "B10:E10" ↵ Alt H B P Ctrl+G "B20:E20" ↵ F4 Ctrl+G "B22:E22" ↵ F4 Ctrl+G "B24:E24" ↵ F4',
      check: (s, ses) => settled(ses) && tops(pnl(ses)) },
    { id: 'double', text: 'Give EBITDA B24:E24 a double bottom from Ctrl+1’s Border tab.', keys: 'Ctrl+1 B ↓ ↑ ↵',
      check: (s, ses) => settled(ses) && doubled(pnl(ses)) && tops(pnl(ses)) },
    { id: 'gridlines', text: 'Turn the gridlines off with Alt, W, V, G.', keys: 'Alt W V G',
      check: (s, ses) => settled(ses) && pnl(ses).gridlines === false },
    { id: 'page', text: 'Turn the page landscape with Alt, P, O, L, then fit it to one page in Page Setup with Alt+F.', keys: 'Alt P O L Alt P S P Alt+F ↵',
      check: (s, ses) => { const p = setup(ses); return settled(ses) && p.orientation === 'landscape' && p.scaling === 'fit' && p.fitWide === 1 && p.fitTall === 1; } },
    { id: 'footer', text: 'In Page Setup’s Custom Footer, put &[File] on the left and &[Date] on the right.', keys: 'Alt P S P H Alt+U "&[File]" Alt+R "&[Date]" ↵ ↵',
      check: (s, ses) => settled(ses) && printed(ses) },
  ],
  endState: [
    { text: 'The page carries its title, codes, divider, borders and no gridlines, and prints landscape on one page with the file and date', check: (s, ses) => { const sh = pnl(ses); return titled(sh) && rendersLike(sh, PLAINS, PLAIN) && rendersLike(sh, DOLLARS, DOLLAR) && divider(sh) && tops(sh) && doubled(sh) && sh.gridlines === false && printed(ses); } },
  ],
  solution: `Ctrl+G "A1" Enter "${TITLE}" Ctrl+Enter Ctrl+B Ctrl+G "C7:E24" Enter Ctrl+1 N Tab End Alt+T "${PLAIN}" Enter Ctrl+G "C7:E7" Enter Ctrl+1 N Tab End Alt+T "${DOLLAR}" Enter Ctrl+G "C10:E10" Enter F4 Ctrl+G "C24:E24" Enter F4 Ctrl+G "E4" Enter Alt H H Right Enter Ctrl+G "D4:D24" Enter Alt H B R Ctrl+G "B10:E10" Enter Alt H B P Ctrl+G "B20:E20" Enter F4 Ctrl+G "B22:E22" Enter F4 Ctrl+G "B24:E24" Enter F4 Ctrl+1 B Down Up Enter Alt W V G Alt P O L Alt P S P Alt+F Enter Alt P S P H Alt+U "&[File]" Alt+R "&[Date]" Enter Enter`,
  optimalKeys: 300,
  route: 90,
});
