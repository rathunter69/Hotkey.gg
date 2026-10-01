// Practice · Foundations — Format the weekly page (screenplay 6.1; built from Bold and borders and
// Number formats). The Austin site table arrives with every format stripped and a grid ruled over
// it; the job is the desk's format: a bold title one size up and centered across, the units line
// italic, headers bold and right over their figures, no grid, the desk number format with the $ on
// the first and total rows, tickets to two decimals, typed inputs blue, the total bold over a top
// border, gridlines off. Each goal is graded against the solved page, cell by cell.
import { parsFromRoute } from '../../app/pars.js';
import { buildPage, cutFrom, unformatted, refsIn, siteRows, siteTotal, costBlock, SITE_HEADERS, SITE_KINDS, UNITS, WEEK } from './austin.js';

const PAGE = buildPage({
  name: 'Report', chapter: 1, title: `Austin weekly report, ${WEEK}`, units: UNITS, labelHeader: 'Site',
  headers: SITE_HEADERS, kinds: SITE_KINDS, center: true,
  blocks: [{ rows: [...siteRows(), siteTotal(5, 9)] }, costBlock()],
  source: `Source: site POS, ${WEEK}`,
});
const SOLVED = PAGE.sheet.cells;
const GRADED = ['A1', 'A2', ...refsIn('A4:F10'), 'B13'];

const start = cutFrom(PAGE, (cells, sh) => {
  unformatted(cells, GRADED);
  for (const ref of refsIn('A4:F10')) cells[ref] = { ...(cells[ref] || {}), ball: true };   // a grid ruled over the table
  delete sh.gridlines;
  sh.active = { r: 1, c: 1 };
});

/** The cells in `range` carry the solved page's `fields`. */
const like = (s, refs, fields) => refs.every(ref => { const c = s.cellAt(ref), w = SOLVED[ref] || {}; return fields.every(f => (c[f] || 0) === (w[f] || 0)); });
const numFmt = ['fmtStyle', 'decimals'];
export default {
  id: 'format-the-weekly-page',
  chapter: 'foundations',
  title: 'Format the weekly page',
  task: 'Give the plain site table the desk format: title, headers, no grid, number formats, blue inputs and a ruled total.',
  access: 'free',
  sheet: start,
  sheets: [{ name: 'Report' }],
  goals: [
    { id: 'title', text: 'Bold the title in A1 and take it one size up.', keys: 'Ctrl+B Alt H F G', check: s => like(s, ['A1'], ['bold', 'fsz']) },
    { id: 'across', text: 'Center the title across A1:F1, never merged.', keys: 'Ctrl+G "A1:F1" ↵ Ctrl+1 A Alt+H ↓ ×4 ↵', check: s => s.cellAt('A1').ca === 6 },
    { id: 'units', text: 'Make the units line in A2 italic.', keys: 'Ctrl+G "A2" ↵ Ctrl+I', check: s => s.cellAt('A2').it === true },
    { id: 'headers', text: 'Bold the headers A4:F4 and right-align B4:F4 over their figures.', keys: 'Ctrl+G "A4:F4" ↵ Ctrl+B Ctrl+G "B4:F4" ↵ Alt H A R',
      check: s => like(s, refsIn('A4:F4'), ['bold']) && refsIn('B4:F4').every(ref => s.cellAt(ref).align === 'r') },
    { id: 'grid', text: 'Take every border off the table A4:F10.', keys: 'Ctrl+G "A4:F10" ↵ Alt H B N',
      check: s => refsIn('A4:F10').every(ref => { const c = s.cellAt(ref); return !c.ball && !c.bb && !c.bl && !c.br && !c.thick; }) },
    { id: 'counts', text: 'Give the washes B5:B10 the desk number format with Ctrl+1, no decimals.', keys: 'Ctrl+G "B5:B10" ↵ Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N ↓ ↓ ↵', check: s => like(s, refsIn('B5:B10'), numFmt) },
    { id: 'money', text: 'Give the money in D5:F10 the same desk number format.', keys: 'Ctrl+G "D5:F10" ↵ Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N ↓ ↓ ↵',
      check: s => refsIn('D6:F9').every(ref => like(s, [ref], numFmt)) && refsIn('D5:F10').every(ref => ['comma', 'currency'].includes(s.cellAt(ref).fmtStyle) && !s.cellAt(ref).decimals) },
    { id: 'dollars', text: 'Put the $ on the first and total rows only: D5:F5, then F4 on D10:F10.', keys: 'Ctrl+G "D5:F5" ↵ Ctrl+1 N Tab C Alt+D 0 Alt+N ↓ ↓ ↓ ↑ ↵ Ctrl+G "D10:F10" ↵ F4',
      check: s => like(s, refsIn('D5:F10'), numFmt) },
    { id: 'tickets', text: 'Show the tickets C5:C10 to two decimals, with the $ on C5 and C10.', keys: 'Ctrl+G "C5:C10" ↵ Ctrl+1 N Tab N Alt+D 2 Alt+U Alt+N ↓ ↓ ↵ Ctrl+G "C5" ↵ Ctrl+Shift+$ Ctrl+G "C10" ↵ Ctrl+Shift+$',
      check: s => like(s, refsIn('C5:C10'), numFmt) },
    { id: 'cost', text: 'Give the cost per wash in B13 the $ and two decimals.', keys: 'Ctrl+G "B13" ↵ Ctrl+Shift+$', check: s => like(s, ['B13'], numFmt) },
    { id: 'blue', text: 'Color the typed inputs blue: B5:C9, then B13.', keys: 'Ctrl+G "B5:C9" ↵ Alt H F C → ×4 ↵ Ctrl+G "B13" ↵ Alt H F C → ×4 ↵',
      check: s => [...refsIn('B5:C9'), 'B13'].every(ref => s.cellAt(ref).fontColor === 'blue') },
    { id: 'total', text: 'Bold the Total row A10:F10 and give it a top border.', keys: 'Ctrl+G "A10:F10" ↵ Ctrl+B Alt H B P', check: s => like(s, refsIn('A10:F10'), ['bold', 'bt']) },
    { id: 'gridlines', text: 'Turn the gridlines off with Alt W V G.', keys: 'Alt W V G', check: s => s.gridlines === false },
  ],
  solution: 'Ctrl+B Alt H F G Ctrl+G "A1:F1" Enter Ctrl+1 A Alt+H Down Down Down Down Enter Ctrl+G "A2" Enter Ctrl+I Ctrl+G "A4:F4" Enter Ctrl+B Ctrl+G "B4:F4" Enter Alt H A R '
    + 'Ctrl+G "A4:F10" Enter Alt H B N Ctrl+G "B5:B10" Enter Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N Down Down Enter Ctrl+G "D5:F10" Enter Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N Down Down Enter Ctrl+G "D5:F5" Enter Ctrl+1 N Tab C Alt+D 0 Alt+N Down Down Down Up Enter Ctrl+G "D10:F10" Enter F4 '
    + 'Ctrl+G "C5:C10" Enter Ctrl+1 N Tab N Alt+D 2 Alt+U Alt+N Down Down Enter Ctrl+G "C5" Enter Ctrl+Shift+$ Ctrl+G "C10" Enter Ctrl+Shift+$ Ctrl+G "B13" Enter Ctrl+Shift+$ '
    + 'Ctrl+G "B5:C9" Enter Alt H F C Right Right Right Right Enter Ctrl+G "B13" Enter Alt H F C Right Right Right Right Enter Ctrl+G "A10:F10" Enter Ctrl+B Alt H B P Alt W V G',
  optimalKeys: 207,
  route: 60,
  pars: parsFromRoute(60),
};
