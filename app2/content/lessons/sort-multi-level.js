// Chapter 4 · 4.2.1 Sort and multi-level sort (clearcoat-pack, S42 → S421)
// Sorting changes the data's order for good, so it runs on a copy: the export's block copied onto a
// new sheet, Export sort, beside the export, pasted with the export's column widths, then sorted by
// site and date in one Sort dialog with two levels, then by retail revenue largest first. The closer
// changes a revenue figure on the copy and the export's own row stays put.
import { exportSheet, copySheet, rowsOf, sameText, sheetNames, isNum } from './lib/pack-checks.js';

const COLS = 'ABCDEFG';
/** The copy's block sits on a sheet named Export sort, right after Export. */
const copyPlaced = ses => { const n = sheetNames(ses).map(x => String(x).trim()); const i = n.findIndex(x => sameText(x, 'Export sort')); return i > 0 && sameText(n[i - 1], 'Export'); };
/** The block was copied from Export, header row and all seven columns, down to the last row. */
const copied = ses => {
  const cb = ses.sheet.clipboard; if (!cb || cb.cut) return false;
  const e = ses.sheets.find(x => x.sheet === cb.src);
  return !!e && e.name === 'Export' && cb.rect.r1 === 4 && cb.rect.c1 === 1 && cb.rect.c2 === 7 && cb.rect.r2 >= 94;
};
const key = x => [x.date, x.site, x.retail, x.member, x.revenue, x.hours].join('|');
/** Every one of the export's ninety rows is on the copy (in any order), with the headers and the export's widths. */
const sameRows = ses => {
  const ex = exportSheet(ses), cp = copySheet(ses); if (!ex || !cp) return false;
  if (![...COLS].every(c => sameText(cp.value(c + '4'), ex.value(c + '4')))) return false;
  const a = rowsOf(ex).map(key).sort(), b = rowsOf(cp).map(key).sort();
  return a.every((k, i) => k === b[i]) && rowsOf(cp).every(x => x.retail == null || x.total === x.retail + x.member);
};
const widths = ses => { const ex = exportSheet(ses), cp = copySheet(ses); return !!ex && !!cp && [1, 2, 3, 4, 5, 6, 7].every(c => cp.colW[c] === ex.colW[c]); };
const pasted = ses => sameRows(ses) && widths(ses) && rowsOf(copySheet(ses)).every((x, i) => key(x) === key(rowsOf(exportSheet(ses))[i]));
/** The export itself is still in the order it came: date by date. */
const exportKept = ses => rowsOf(exportSheet(ses)).every((x, i, all) => i === 0 || (isNum(x.date) && x.date >= all[i - 1].date));
const bySiteDate = (a, b) => { const s = String(a.site).toUpperCase().localeCompare(String(b.site).toUpperCase()); return s || a.date - b.date; };
const siteDate = ses => { const rows = rowsOf(copySheet(ses)); return sameRows(ses) && rows.every((x, i) => i === 0 || bySiteDate(rows[i - 1], x) <= 0); };
const rev = x => (isNum(x.revenue) ? x.revenue : -1);
const revenueDesc = ses => { const rows = rowsOf(copySheet(ses)); return sameRows(ses) && rows.every((x, i) => i === 0 || rev(rows[i - 1]) >= rev(x)); };

export default {
  id: 'sort-multi-level',
  chapter: 'data-and-lookups',
  section: 'Lists and tables',
  module: 'lists-and-tables',
  workbook: 'clearcoat-pack',
  state: { before: 'S42', after: 'S421' },
  title: 'Sort and multi-level sort',
  difficulty: 'medium',
  tags: ['data', 'lists', 'sort'],
  access: 'paid',
  minutes: 5,
  headline: 'Alt A S S',
  conventions: ['A4', 'E4'],
  teaches: ['sort-dialog'],
  uses: ['go-to', 'shift-arrow', 'ctrl-shift-arrow', 'copy-cut-paste', 'paste-special', 'insert-sheet', 'rename-sheet', 'sheet-tabs', 'page-keys', 'dialog-box'],
  prerequisites: ['challenge-lookup-summary', 'ch3-assessment'],
  brief: 'Sorting rearranges rows, and it is the one list tool that changes the data’s order for good, so it runs on a copy of the export, never on the sheet the Summary reads. Alt, A, S, S opens the Sort dialog: a level for each column, smallest to largest or the other way, with My data has headers ticked. Sort the copy by site and then by date, then by retail revenue largest first to read the best days at the top. The key is `Alt A S S`.',
  goals: [
    { id: 'copy', text: 'Copy the export’s block, Export!A4:G94, headers and all seven columns: Ctrl+G to A4, select to G94 and press Ctrl+C.', keys: 'Ctrl+G "Export!A4" ↵ Shift+→ ×6 Ctrl+Shift+↓ Ctrl+C', requires: ['go-to', 'shift-arrow', 'ctrl-shift-arrow', 'copy-cut-paste'],
      hintStuck: 'pulse range Export!A4:G94 · Ctrl+Shift+Down runs to the last row of the export.',
      check: (s, ses) => copied(ses) || sameRows(ses) },
    { id: 'sheet', text: 'Insert a sheet right after Export (Ctrl+PgDn to Domain, Shift+F11) and rename it Export sort with Alt, H, O, R.', keys: 'Ctrl+PgDn Shift+F11 Alt H O R "Export sort" ↵', requires: ['page-keys', 'insert-sheet', 'rename-sheet', 'sheet-tabs'], convention: 'A4',
      hintStuck: 'pulse tab Domain · Shift+F11 puts the new sheet before the tab you are on.',
      check: (s, ses) => copyPlaced(ses) },
    { id: 'paste', text: 'Paste the block at A4 of Export sort, then Paste Special, Column widths (Ctrl+Alt+V, W) so every column reads as it did.', keys: '↓ ×3 Ctrl+V Ctrl+Alt+V W ↵', requires: ['copy-cut-paste', 'paste-special'], convention: 'E4',
      hintStuck: 'pulse cell A4 · The block is still on the clipboard, so the second paste brings only the widths.',
      check: (s, ses) => copyPlaced(ses) && pasted(ses) },
    { id: 'site-date', teach: 'Alt, A, S, S opens the Sort dialog on the block around the active cell. Each level is a column and an order; Excel sorts by the first level and uses the next one only to break ties, so site then date gives six runs of fifteen days.', text: 'Sort the copy by Site A to Z, then add a level (Alt+A) for Date oldest to newest, and press OK.', keys: 'Alt A S S S Alt+A ↵', requires: ['sort-dialog', 'dialog-box'],
      hintStuck: 'pulse range A4:G94 · Typing a letter in the Sort by box jumps to the column that starts with it.',
      check: (s, ses) => copyPlaced(ses) && widths(ses) && siteDate(ses) && exportKept(ses) },
    { id: 'revenue', text: 'Sort the copy again by Retail revenue, Largest to Smallest, so the best days sit at the top.', keys: 'Alt A S S R R Tab ↓ ↵', requires: ['sort-dialog', 'dialog-box'],
      hintStuck: 'pulse range F4:F94 · Tab moves to the Order box; Down flips it to Largest to Smallest.',
      check: (s, ses) => copyPlaced(ses) && revenueDesc(ses) && exportKept(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "F5" Enter "4000" Enter Ctrl+PgUp Ctrl+G "F5" Enter Escape', cadence: 320 }, text: 'Does it tie? Watch the copy’s best day change to $4,000 while the export’s own rows stay as they came.', requires: [],
      hintStuck: 'pulse cell F5 · The copy and the export are separate now: a change on one never reaches the other.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Export sort sits right after Export and holds all ninety rows of the export', check: (s, ses) => copyPlaced(ses) && sameRows(ses) && widths(ses) },
    { text: 'The copy is sorted by retail revenue, largest first, and the export is still in date order', check: (s, ses) => revenueDesc(ses) && exportKept(ses) },
  ],
  closing: [
    'You sorted a copy two ways, and the original stayed where the links expect it.',
    'On a sorted copy, Subtotal (Alt, A, B) writes a SUBTOTAL(9) row at each change of site, a grand total and an outline, and Remove All takes them out again. It is a cut for a question nobody will ask twice; the page’s own totals stay SUMIFS and pivot tables, later in this chapter.',
  ],
  solution: 'Ctrl+G "Export!A4" Enter Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+Shift+Down Ctrl+C '
    + 'Ctrl+PgDn Shift+F11 Alt H O R "Export sort" Enter Down Down Down Ctrl+V Ctrl+Alt+V W Enter '
    + 'Alt A S S S Alt+A Enter Alt A S S R R Tab Down Enter',
};
