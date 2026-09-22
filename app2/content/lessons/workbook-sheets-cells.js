// Foundations · How Excel works — Workbook, sheets and cells
// A two-sheet workbook: the Weekly Sales Report and a Costs sheet. Go To jumps to a cell, a range
// and a cell on the other sheet; Ctrl+PgDn / Ctrl+PgUp step between the sheets.
const SALES = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
};
const COSTS = {
  A1: { value: 'Weekly Costs', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Cost', bold: true },
  A3: { value: 'Monday' }, B3: { value: 640 },
  A4: { value: 'Tuesday' }, B4: { value: 590 },
  A5: { value: 'Wednesday' }, B5: { value: 710 },
  A6: { value: 'Thursday' }, B6: { value: 655 },
  A7: { value: 'Friday' }, B7: { value: 820 },
};
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
/** Keys pressed since the current goal became current (the runner's key window). */
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const used = (ses, label) => windowKeys(ses).includes(label);
/** What the Go To dialog box logs while it is open: the reference typed (letters upper-cased, digits, : $ ! ' space), Backspace, and Enter. */
const GOTO_FIELD = /^([A-Z0-9:$!' ]|⌫|↵)$/;
/**
 * The selection was reached through Go To, read from the key window: the last opener (Ctrl+G, F5,
 * or the Ribbon's Alt H F D G) is followed only by keys the dialog box takes, ending in the Enter
 * that jumped. A dialog box cancelled with Esc and the cell then reached by arrows does not count;
 * an invalid reference corrected in the open dialog box (Enter, Backspace, retype, Enter) does.
 */
const viaGoTo = ses => {
  const ks = windowKeys(ses);
  let i = -1;
  for (let j = ks.length - 1; j >= 0 && i < 0; j--) {
    if (ks[j] === 'Ctrl+G' || ks[j] === 'F5') i = j;
    else if (ks[j] === 'G' && ks[j - 1] === 'D' && ks[j - 2] === 'F' && ks[j - 3] === 'H' && ks[j - 4] === 'Alt') i = j;
  }
  if (i < 0) return false;
  const after = ks.slice(i + 1);
  return after.length >= 2 && after[after.length - 1] === '↵' && after.every(k => GOTO_FIELD.test(k));
};

export default {
  id: 'workbook-sheets-cells',
  chapter: 'foundations',
  section: 'How Excel works',
  title: 'Workbook, sheets and cells',
  difficulty: 'easy',
  tags: ['workbook', 'navigation', 'basics'],
  access: 'free',
  concepts: ['workbook', 'worksheet', 'cell-reference', 'go-to', 'range', 'sheet-tabs', 'sheet-reference'],
  prerequisites: ['welcome-race'],
  read: 'An Excel file is a workbook, and each tab along the bottom is a worksheet: a grid of cells, each named by its column letter and row number, such as C4. In this lesson you jump around the Weekly Sales Report and its Costs sheet with Go To and the sheet keys. Every formula you will write points at cells this way, and a real model spreads them across several sheets.',
  sheet: { cells: SALES, active: { r: 1, c: 1 }, colW: { 1: 84 } },   // column A fitted to its day names, as an author would
  sheets: [{ name: 'Sales' }, { name: 'Costs', cells: COSTS, active: { r: 1, c: 1 }, colW: { 1: 84 } }],
  par: 20,
  goals: [
    { id: 'goto-cell', teach: 'A cell reference is its column letter then its row number, and Go To (Ctrl+G) jumps straight to one: type the reference and press Enter.', text: 'Go to C4, the Tuesday Units, with Go To.', keys: 'Ctrl+G "C4" ↵', requires: ['cell-reference', 'go-to'],
      check: (s, ses) => at(s, 'C4') && viaGoTo(ses) },
    { id: 'goto-range', teach: 'A range is a block of cells written corner to corner, B3:B7, and Go To selects one the same way.', text: 'Select the Sales figures B3:B7 with Go To.', keys: 'Ctrl+G "B3:B7" ↵', requires: ['range', 'go-to'],
      check: (s, ses) => !!s.sel && s.selectionText() === 'B3:B7' && viaGoTo(ses) },
    { id: 'next-sheet', teach: 'A workbook is the file and each worksheet is a tab along the bottom: Ctrl+PgDn moves to the next sheet, Ctrl+PgUp to the previous one.', text: 'Move to the Costs sheet.', keys: 'Ctrl+PgDn', requires: ['workbook', 'sheet-tabs'],
      check: (s, ses) => ses.sheetIndex === 1 && used(ses, 'Ctrl+PgDn') },
    { id: 'back-to-sales', text: 'Come back to the Sales sheet.', keys: 'Ctrl+PgUp', requires: ['sheet-tabs'],
      check: (s, ses) => ses.sheetIndex === 0 && used(ses, 'Ctrl+PgUp') },
    { id: 'goto-other-sheet', teach: 'A reference can name its sheet first, Costs!B3, and Go To follows it onto that sheet.', text: 'Jump straight to the Monday cost, B3 on the Costs sheet, with Go To.', keys: 'Ctrl+G "Costs!B3" ↵', requires: ['sheet-reference', 'go-to'],
      check: (s, ses) => ses.sheetIndex === 1 && at(s, 'B3') && viaGoTo(ses) },
  ],
  solution: 'Ctrl+G "C4" Enter Ctrl+G "B3:B7" Enter Ctrl+PgDn Ctrl+PgUp Ctrl+G "Costs!B3" Enter',
};
