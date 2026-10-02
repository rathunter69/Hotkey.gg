// Chapter 2 · 2.3.4 Labels, footnotes and sources (clearcoat-pnl, S3c → S3d)
// The system's capitals become sentence case, retyped down the label column one Enter at a time;
// other revenue takes a footnote marker with F2; the memo labels say their units; and the table
// gets its source line and its footnote under it, both italic. Nothing moves a number, and the
// closer proves it.
import { LABELS, LABEL_NOTE, SOURCE_LINE, FOOTNOTE } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const reads = (sh, rows) => rows.every(r => sh.value('B' + r) === LABELS[r]);

export default {
  id: 'labels-footnotes-sources',
  chapter: 'formatting',
  section: 'The page a buyer reads',
  module: 'the-page-a-buyer-reads',
  workbook: 'clearcoat-pnl',
  state: { before: 'S3c', after: 'S3d' },
  title: 'Labels, footnotes and sources',
  difficulty: 'medium',
  tags: ['presentation', 'labels', 'pnl'],
  access: 'paid',
  minutes: 6,
  headline: 'F2',
  conventions: ['G3', 'B6'],
  teaches: ['source-line'],
  uses: ['type-to-enter', 'enter-commits', 'replace-by-typing', 'edit-mode-f2', 'bold-italic-underline', 'ctrl-arrow', 'page-anatomy'],
  prerequisites: ['borders-that-mean-something'],
  brief: 'The labels came out of the system in capitals; a buyer reads sentence case. Memo lines are figures that aren’t dollars (sites, washes, revenue per wash), and they sit below the answer, labeled as memo. Every table carries a source line under it, in one line, and a footnote marker where a figure needs a word. Fix the labels by hand here; module 2.6 does it with formulas. The key is `F2`.',
  goals: [
    { id: 'b7', teach: 'Sentence case is a capital on the first word and nowhere else, the way a buyer reads a sentence. Typing over a cell replaces its words and keeps its bold and its indent.', text: 'Retype B7 as Retail wash revenue in sentence case and press Enter.', keys: '→ Ctrl+↓ ×2 ↓ "Retail wash revenue" ↵', requires: ['source-line', 'replace-by-typing', 'ctrl-arrow'], convention: 'G3',
      hintStuck: 'pulse cell B7 · The first line under Revenue.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && reads(sh, [7]) && settled(ses); } },
    { id: 'revenue', text: 'Type down the rest of the block the same way: Membership revenue in B8, Other revenue in B9 and Total revenue in B10.', keys: '"Membership revenue" ↵ "Other revenue" ↵ "Total revenue" ↵', requires: ['type-to-enter', 'enter-commits'], convention: 'G3',
      hintStuck: 'pulse range B8:B10 · Enter takes you down one line at a time.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && reads(sh, [8, 10]) && [LABELS[9], LABEL_NOTE].includes(sh.value('B9')) && settled(ses); } },
    { id: 'marker', teach: 'A footnote marker says a figure needs a word, and the word goes under the table. F2 opens the cell with the caret at the end, so the marker is added without retyping the label.', text: 'Add the footnote marker (1) to the end of B9 with F2, so it reads Other revenue (1).', keys: '↑ ×2 F2 " (1)" ↵', requires: ['edit-mode-f2'], convention: 'G3',
      hintStuck: 'pulse cell B9 · F2 puts the caret after the last letter.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.value('B9') === LABEL_NOTE && settled(ses); } },
    { id: 'costs', text: 'Retype the site costs B13:B20 in sentence case, Chemicals and water down to Total site costs, pressing Enter after each.', keys: 'Ctrl+↓ ↓ "Chemicals and water" ↵ "Labor" ↵ "Rent" ↵ "Utilities" ↵ "Maintenance" ↵ "Card fees" ↵ "Marketing" ↵ "Total site costs" ↵', requires: ['type-to-enter', 'enter-commits', 'ctrl-arrow'], convention: 'G3',
      hintStuck: 'pulse range B13:B20 · Eight labels, one capital each.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && reads(sh, [13, 14, 15, 16, 17, 18, 19, 20]) && settled(ses); } },
    { id: 'bottom', text: 'Retype B22 as Site contribution and B23 as Head office; EBITDA in B24 is an acronym and stays in capitals.', keys: '↓ "Site contribution" ↵ "Head office" ↵', requires: ['type-to-enter', 'enter-commits'], convention: 'G3',
      hintStuck: 'pulse range B22:B23 · The two lines above the answer.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && reads(sh, [22, 23]) && settled(ses); } },
    { id: 'memo', teach: 'A memo line is a figure that isn’t dollars, so its label carries its unit. Sites are counted at the year end and washes run in thousands.', text: 'Label the memo lines B33:B35 Sites (year end), Washes (thousands) and Revenue per wash ($).', keys: 'Ctrl+↓ ×3 ↓ "Sites (year end)" ↵ "Washes (thousands)" ↵ "Revenue per wash ($)" ↵', requires: ['type-to-enter', 'enter-commits', 'ctrl-arrow'], convention: 'C5',
      hintStuck: 'pulse range B33:B35 · The memo block sits under the margins.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && reads(sh, [33, 34, 35]) && settled(ses); } },
    { id: 'source', teach: 'Every table says where its numbers came from, in one line under it, so a buyer can trace any figure to the ledger. Italic keeps it quiet.', text: 'Type the source line in B36, "Source: management accounts; FY24 and FY25 audited; FY26 per the September budget", and set it italic.', keys: '"Source: management accounts; FY24 and FY25 audited; FY26 per the September budget" ↵ ↑ Ctrl+I', requires: ['source-line', 'bold-italic-underline'], convention: 'B6',
      hintStuck: 'pulse cell B36 · The source sits straight under the memo block.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.value('B36') === SOURCE_LINE && sh.cellAt('B36').it && settled(ses); } },
    { id: 'footnote', text: 'Type the footnote "(1) Detailing and vending" in B37 and set it italic.', keys: '↓ "(1) Detailing and vending" ↵ ↑ Ctrl+I', requires: ['bold-italic-underline'], convention: 'G3',
      hintStuck: 'pulse cell B37 · The footnote goes under the source.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.value('B37') === FOOTNOTE && sh.cellAt('B37').it && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C7" Enter "18500" Enter Ctrl+G "C24" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Nothing here moves a number: watch C7 change to 18500 and C24 still answer.', requires: [],
      hintStuck: 'pulse cell C24 · Labels are words; the formulas never read them.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Every label reads in sentence case', check: (s, ses) => { const sh = pnl(ses); return !!sh && reads(sh, [7, 8, 10, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 33, 34, 35]) && sh.value('B9') === LABEL_NOTE; } },
    { text: 'The source line and the footnote sit under the table, italic', check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.value('B36') === SOURCE_LINE && sh.value('B37') === FOOTNOTE; } },
  ],
  closing: [
    'The labels read like English, and the page says where its numbers came from.',
    'Sentence case, units on the memo lines, a marker where a figure needs a word and a source under the table: a buyer judges the detail before the numbers. Module 2.6 cleans labels like these with formulas when there are sixty of them.',
  ],
  solution: 'Right Ctrl+Down Ctrl+Down Down "Retail wash revenue" Enter "Membership revenue" Enter "Other revenue" Enter "Total revenue" Enter Up Up F2 " (1)" Enter Ctrl+Down Down "Chemicals and water" Enter "Labor" Enter "Rent" Enter "Utilities" Enter "Maintenance" Enter "Card fees" Enter "Marketing" Enter "Total site costs" Enter Down "Site contribution" Enter "Head office" Enter Ctrl+Down Ctrl+Down Ctrl+Down Down "Sites (year end)" Enter "Washes (thousands)" Enter "Revenue per wash ($)" Enter "Source: management accounts; FY24 and FY25 audited; FY26 per the September budget" Enter Up Ctrl+I Down "(1) Detailing and vending" Enter Up Ctrl+I',
};
