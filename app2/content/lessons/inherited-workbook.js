// Chapter 1 · 1.1.1 — The workbook management sent (voltline-weekly, S0 → S1a)
// Tidy the file as it arrived: find your way round its sheets and cells, rename Sheet2 to Inputs,
// delete Old wk37, insert Report and move it to the front. Every goal grades the workbook's end
// state, so any legitimate route counts.
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const names = ses => ses.sheets.map(x => x.name);
const workbookIs = (...want) => (s, ses) => names(ses).length === want.length && names(ses).every((x, i) => x === want[i]);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;

export default {
  id: 'inherited-workbook',
  chapter: 'foundations',
  section: 'Open and set up',
  module: 'open-and-set-up',
  workbook: 'voltline-weekly',
  state: { before: 'S0', after: 'S1a' },
  title: 'The workbook management sent',
  difficulty: 'easy',
  tags: ['workbook', 'sheets', 'setup'],
  access: 'free',
  minutes: 6,
  headline: 'Alt H O R',
  conventions: ['A4'],
  teaches: ['workbook', 'sheet-tabs', 'cell-reference', 'name-box', 'formula-bar', 'rename-sheet', 'delete-sheet', 'insert-sheet', 'move-sheet'],
  uses: ['ctrl-arrow', 'arrow-keys'],
  prerequisites: ['welcome-export'],
  brief: 'The file arrived the way inherited files do: a tab still called Sheet2, a dead half-export, no page for the report. Tidy it before anything else — the tab names you set are the names every reference will carry. The key move is `Alt H O R`.',
  goals: [
    { id: 'tour', teach: 'A workbook is the file; the tabs along the bottom are its sheets, and Ctrl+PgDn / Ctrl+PgUp walk them.', text: 'Walk the tabs to the end — Raw, Sheet2, Old wk37, Costs — and back to Raw.', keys: 'Ctrl+PgDn ×3 then Ctrl+PgUp ×3', requires: ['workbook', 'sheet-tabs'],
      check: (s, ses) => onSheet(ses, 'Raw') && windowKeys(ses).includes('Ctrl+PgDn') && windowKeys(ses).includes('Ctrl+PgUp') },
    { id: 'name-box', teach: 'The Name Box, left of the formula bar, always shows the active cell’s reference.', text: 'Jump to the feed’s last date with Ctrl+↓ — the Name Box now reads A61.', keys: 'Ctrl+↓', requires: ['name-box', 'cell-reference', 'ctrl-arrow'],
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'A61') && windowKeys(ses).includes('Ctrl+↓') },
    { id: 'formula-bar', teach: 'The formula bar shows what a cell really holds — here a formula — while the grid shows its result.', text: 'On Costs, land on the Domain total E4 and read =B4+C4+D4 in the formula bar.', keys: 'Ctrl+PgDn ×3 ↓ ×3 Ctrl+→', requires: ['formula-bar'],
      check: (s, ses) => onSheet(ses, 'Costs') && at(s, 'E4') && s.cellAt('E4').formula === '=B4+C4+D4' },
    { id: 'rename', teach: 'Rename Sheet, Home › Format (Alt, H, O, R), opens the active tab’s name: type the new one and press Enter.', text: 'Sheet2 is the associate’s inputs scratch — go there and rename it Inputs.', keys: 'Ctrl+PgUp ×2 then Alt H O R "Inputs" ↵', requires: ['rename-sheet'],
      check: workbookIs('Raw', 'Inputs', 'Old wk37', 'Costs') },
    { id: 'delete', teach: 'Delete Sheet (Alt, H, D, S) removes the active sheet; Excel asks first, because a deleted sheet cannot be undone.', text: 'Old wk37 is a dead half-export — delete it and confirm.', keys: 'Ctrl+PgDn then Alt H D S ↵', requires: ['delete-sheet'],
      check: workbookIs('Raw', 'Inputs', 'Costs') },
    { id: 'insert', teach: 'Shift+F11 inserts a new worksheet in front of the active one and makes it active.', text: 'Insert the sheet the weekly report will live on and rename it Report.', keys: 'Shift+F11 then Alt H O R "Report" ↵', requires: ['insert-sheet'],
      check: workbookIs('Raw', 'Inputs', 'Report', 'Costs') },
    { id: 'move', teach: 'Move or Copy Sheet (Alt, H, O, M) moves the active sheet: ↑ ↓ pick where it will sit, Enter confirms.', text: 'The report reads first: move Report to the front of the workbook.', keys: 'Alt H O M ↑ ×2 ↵', requires: ['move-sheet'],
      check: workbookIs('Report', 'Raw', 'Inputs', 'Costs') },
  ],
  endState: [
    { text: 'The workbook reads Report, Raw, Inputs, Costs', check: workbookIs('Report', 'Raw', 'Inputs', 'Costs') },
  ],
  solution: 'Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+PgUp Ctrl+PgUp Ctrl+PgUp Ctrl+Down Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Down Down Down Ctrl+Right Ctrl+PgUp Ctrl+PgUp Alt H O R "Inputs" Enter Ctrl+PgDn Alt H D S Enter Shift+F11 Alt H O R "Report" Enter Alt H O M Up Up Enter',
};
