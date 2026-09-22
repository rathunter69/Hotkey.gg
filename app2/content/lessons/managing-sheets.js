// Foundations · How Excel works — Sheets: insert, rename and delete
// A three-sheet workbook as they arrive from a colleague: the Weekly Sales Report, a tab still called
// Sheet2, and a stale Old copy. Rename Sheet2 (Alt H O R), delete Old through Excel's confirm
// (Alt H D S), insert a sheet with Shift+F11, name it Summary and move it to the front (Alt H O M).
// Every goal grades the workbook's END STATE — the sheet names in order (session.sheets) — so the
// route is free: the KeyTips, the strip's double-click rename, the ⊕, a click on a card, all count.
const SALES = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
};
const OLD = {
  A1: { value: 'Old sales (superseded)', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1150 },
  A4: { value: 'Tuesday' }, B4: { value: 900 },
  A5: { value: 'Wednesday' }, B5: { value: 1390 },
};
/** The workbook's sheet names, in tab order. */
const names = ses => ses.sheets.map(x => x.name);
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const workbookIs = (...want) => (s, ses) => same(names(ses), want);

export default {
  id: 'managing-sheets',
  chapter: 'foundations',
  section: 'How Excel works',
  title: 'Sheets: insert, rename and delete',
  difficulty: 'easy',
  tags: ['workbook', 'sheets', 'basics'],
  access: 'free',
  concepts: ['rename-sheet', 'delete-sheet', 'insert-sheet', 'move-sheet'],
  prerequisites: ['workbook-sheets-cells'],
  read: 'A workbook you inherit rarely arrives tidy: a tab still called Sheet2, a stale copy nobody deleted, no summary up front. In this lesson you rename, delete, insert and move worksheets from the Home tab, with the sheet keys you already know. Every model gets tidied this way, and the names you set are the names every cross-sheet reference will carry, so get them right early.',
  sheet: { cells: SALES, active: { r: 1, c: 1 }, colW: { 1: 84 } },   // column A fitted to its day names, as an author would
  sheets: [{ name: 'Sales' }, { name: 'Sheet2' }, { name: 'Old', cells: OLD, active: { r: 1, c: 1 }, colW: { 1: 84 } }],
  par: 25,
  goals: [
    { id: 'rename-costs', teach: 'Rename Sheet, under Home › Format (Alt, H, O, R), opens the active tab\'s name with it selected: type the new name and press Enter.', text: 'Move to Sheet2 and rename it Costs.', keys: 'Ctrl+PgDn then Alt H O R "Costs" ↵', requires: ['sheet-tabs', 'rename-sheet'],
      check: workbookIs('Sales', 'Costs', 'Old') },
    { id: 'delete-old', teach: 'Delete Sheet, under Home › Delete (Alt, H, D, S), removes the active sheet; Excel asks first when it holds anything, since a deleted sheet cannot be undone.', text: 'Delete the Old sheet, the stale copy at the end, and confirm.', keys: 'Ctrl+PgDn then Alt H D S ↵', requires: ['sheet-tabs', 'delete-sheet'],
      check: workbookIs('Sales', 'Costs') },
    { id: 'insert-sheet', teach: 'Shift+F11 inserts a new worksheet in front of the active one and makes it active, named with the next free number.', text: 'From Costs, insert a new worksheet; it arrives as Sheet3, between Sales and Costs.', keys: 'Shift+F11', requires: ['insert-sheet'],
      check: workbookIs('Sales', 'Sheet3', 'Costs') },
    { id: 'rename-summary', text: 'Rename the new sheet Summary.', keys: 'Alt H O R "Summary" ↵', requires: ['rename-sheet'],
      check: workbookIs('Sales', 'Summary', 'Costs') },
    { id: 'move-first', teach: 'Move or Copy Sheet (Alt, H, O, M) moves the active sheet: ↑ ↓ pick the sheet it will sit before, or (move to end), then Enter.', text: 'Move Summary to the front of the workbook, before Sales.', keys: 'Alt H O M ↑ ↵', requires: ['move-sheet'],
      check: workbookIs('Summary', 'Sales', 'Costs') },
  ],
  solution: 'Ctrl+PgDn Alt H O R "Costs" Enter Ctrl+PgDn Alt H D S Enter Shift+F11 Alt H O R "Summary" Enter Alt H O M Up Enter',
};
