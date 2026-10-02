// Practice · Formatting — Print it (screenplay 6.2; script-drills D46). The pack with its pages built
// and no print set-up (state S6e). Landscape, fit to one page, the title rows repeated, a footer that
// says which file, which page of how many and which day, and the page centered across the paper.
// Graded on the workbook's page set-up; the sheet itself does not change.
import { pnlDrill, settled, setup } from './pnl-drills.js';

const FOOT = { left: '&[File]', centre: 'Page &[Page] of &[Pages]', right: '&[Date]' };
const landscape = ses => setup(ses).orientation === 'landscape';
const fitOne = ses => { const p = setup(ses); return p.scaling === 'fit' && p.fitWide === 1 && p.fitTall === 1; };
const titles = ses => setup(ses).titlesRows === '$1:$5';
const footed = ses => { const f = setup(ses).footer || {}; return f.left === FOOT.left && f.centre === FOOT.centre && f.right === FOOT.right; };
const centered = ses => setup(ses).centerH === true;
/** The header margin sits under the top margin (Excel's Normal margins keep it there), so the header never prints over the title row. */
const clear = ses => { const m = setup(ses).margins; return !m || (m.header == null || m.top == null || m.header < m.top); };

export default pnlDrill({
  id: 'ch2-print-it',
  title: 'Print it',
  task: 'Set the pack to print: landscape, fit to one page, print titles, and the file, page and date in the footer.',
  module: 'printing-and-page-layout',
  state: { before: 'S6e' },
  goals: [
    { id: 'landscape', text: 'Turn the pack landscape with Alt, P, O, L.', keys: 'Alt P O L',
      check: (s, ses) => settled(ses) && landscape(ses) },
    { id: 'fit', text: 'In Page Setup, Alt, P, S, P, pick Fit to with Alt+F and keep 1 page wide by 1 tall.', keys: 'Alt P S P Alt+F ↵',
      check: (s, ses) => settled(ses) && landscape(ses) && fitOne(ses) },
    { id: 'titles', text: 'Repeat the title, units line, timeline and flags on every page: Print Titles, Alt, P, I, rows 1:5.', keys: 'Alt P I "1:5" ↵',
      check: (s, ses) => settled(ses) && titles(ses) },
    { id: 'footer', text: 'In Page Setup’s Custom Footer, put &[File] left, Page &[Page] of &[Pages] in the center and &[Date] right.', keys: 'Alt P S P H Alt+U "&[File]" Alt+C "Page &[Page] of &[Pages]" Alt+R "&[Date]" ↵ ↵',
      check: (s, ses) => settled(ses) && footed(ses) },
    { id: 'center', text: 'On Page Setup’s Margins tab, tick Center on page Horizontally with Alt+Z.', keys: 'Alt P S P M Alt+Z ↵',
      check: (s, ses) => settled(ses) && centered(ses) && clear(ses) },
  ],
  endState: [
    { text: 'The pack prints landscape on one page, titles repeated, centered, with the file, page and date in the footer', check: (s, ses) => landscape(ses) && fitOne(ses) && titles(ses) && footed(ses) && centered(ses) && clear(ses) },
  ],
  solution: 'Alt P O L Alt P S P Alt+F Enter Alt P I "1:5" Enter Alt P S P H Alt+U "&[File]" Alt+C "Page &[Page] of &[Pages]" Alt+R "&[Date]" Enter Enter Alt P S P M Alt+Z Enter',
  optimalKeys: 90,
  route: 30,
});
