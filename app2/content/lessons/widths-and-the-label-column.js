// Chapter 2 · 2.3.5 Widths and the label column (clearcoat-pnl, S3d → S3e)
// The page takes its shape: column A a two-character margin, the title row 24 points tall, one
// width of 12 across the three years, column B fitted to its labels (B4:B35, so neither the title
// nor the source line sets it), and the panes frozen at C5 so the labels and the timeline stay.
// The closer moves FY26E retail revenue and the widths hold.
import { MARGIN_W, TITLE_ROW_H } from '../workbooks/clearcoat-pnl.js';
import { FIGURE_W } from '../workbooks/page.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const fitB = sh => sh.colSet[2] && sh.colW[2] === sh.neededWidth(2, 4, 35);

export default {
  id: 'widths-and-the-label-column',
  chapter: 'formatting',
  section: 'The page a buyer reads',
  module: 'the-page-a-buyer-reads',
  workbook: 'clearcoat-pnl',
  state: { before: 'S3d', after: 'S3e' },
  title: 'Widths and the label column',
  difficulty: 'medium',
  tags: ['presentation', 'widths', 'pnl'],
  access: 'paid',
  minutes: 5,
  headline: 'Alt H O W',
  conventions: ['C2', 'C8'],
  teaches: ['label-column'],
  uses: ['column-width', 'row-height', 'autofit', 'freeze-panes', 'row-col-select', 'shift-arrow', 'ctrl-shift-arrow', 'go-to'],
  prerequisites: ['labels-footnotes-sources'],
  brief: 'A financial page has a shape: a narrow margin in column A, labels in B fitted to the longest one, and every figure column the same width. The export has 8.43 everywhere and codes in A. Set the margin, fit the labels, set one width across the years, and see why the period columns are set by hand and the label column by AutoFit. The key is `Alt H O W`.',
  goals: [
    { id: 'margin', teach: 'Column A is a margin: it holds the title and the units line and nothing under them, so it only needs to be narrow. Column Width (Alt, H, O, W) takes a width in characters.', text: 'Make column A the margin: Alt, H, O, W, width 2.', keys: 'Alt H O W "2" ↵', requires: ['label-column', 'column-width'], convention: 'C2',
      hintStuck: 'pulse column A · The title runs across from A1, so A can be narrow.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.colW[1] === MARGIN_W && settled(ses); } },
    { id: 'title-row', text: 'Make row 1 a little taller for the title: Alt, H, O, H, height 24.', keys: 'Alt H O H "24" ↵', requires: ['row-height'], convention: 'G2',
      hintStuck: 'pulse row 1 · The title is a size up, so its row gets a little more room.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.rowH[1] === TITLE_ROW_H && settled(ses); } },
    { id: 'years', teach: 'Period columns are set by hand to one width, so FY24A, FY25A and FY26E read as equals. AutoFit would give each year its own width.', text: 'Select columns C:E and give the three years one width, 12.', keys: '→ ×2 Ctrl+Space Shift+→ ×2 Alt H O W "12" ↵', requires: ['column-width', 'row-col-select', 'shift-arrow'], convention: 'C2',
      hintStuck: 'pulse range C:E · Ctrl+Space selects the whole column.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && [3, 4, 5].every(c => sh.colW[c] === FIGURE_W) && settled(ses); } },
    { id: 'fit-b', teach: 'The label column is fitted to its labels by AutoFit, over the labels only: the title and the source line run long on purpose and would stretch it. Select B4:B35 and AutoFit with Alt, H, O, I.', text: 'Fit column B to its labels, not the title or the source: select B4:B35 and AutoFit with Alt, H, O, I.', keys: 'Ctrl+G "B35" ↵ Ctrl+Shift+↑ ×10 Alt H O I', requires: ['autofit', 'go-to', 'ctrl-shift-arrow'], convention: 'C2',
      hintStuck: 'pulse range B4:B35 · From revenue per wash up to the timeline label.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fitB(sh) && settled(ses); } },
    { id: 'freeze', text: 'Freeze the panes at C5 with Alt, W, F, F, so the labels and the timeline stay in view as the page scrolls.', keys: 'Ctrl+G "C5" ↵ Alt W F F', requires: ['freeze-panes', 'go-to'], convention: 'C8',
      hintStuck: 'pulse cell C5 · Everything above and left of C5 stays put.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.freeze.r === 4 && sh.freeze.c === 2 && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "E7" Enter "27000" Enter Ctrl+G "E24" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch E7 change to 27000: the widths hold and E24 answers.', requires: [],
      hintStuck: 'pulse cell E24 · A width changes how a figure reads, never what it is.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'A narrow margin, the labels fitted, one width across the years', check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.colW[1] === MARGIN_W && fitB(sh) && [3, 4, 5].every(c => sh.colW[c] === FIGURE_W); } },
    { text: 'The panes freeze at C5', check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.freeze.r === 4 && sh.freeze.c === 2; } },
  ],
  closing: [
    'The margin, the label fit and three equal columns give the page the shape every financial page has.',
    'The years are set by hand so they read as equals, the labels by AutoFit so the longest one fits, and the title and the source run across the page without stretching anything. The panes hold the labels and the timeline while a reader scrolls.',
  ],
  solution: 'Alt H O W "2" Enter Alt H O H "24" Enter Right Right Ctrl+Space Shift+Right Shift+Right Alt H O W "12" Enter Ctrl+G "B35" Enter Ctrl+Shift+Up Ctrl+Shift+Up Ctrl+Shift+Up Ctrl+Shift+Up Ctrl+Shift+Up Ctrl+Shift+Up Ctrl+Shift+Up Ctrl+Shift+Up Ctrl+Shift+Up Ctrl+Shift+Up Alt H O I Ctrl+G "C5" Enter Alt W F F',
};
