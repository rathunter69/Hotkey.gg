// Chapter 1 · 1.1.1 — The workbook management sent (voltline-weekly, S0 → S1a)
// The chapter opens here (the Welcome race is folded in, C2 Run 2 addendum): get to the bottom
// of the feed the slow way and the fast way on your own clock, select it in one press, then tidy
// the file as it arrived: walk its sheets, rename Sheet2 to Inputs, delete Old wk37, insert
// Report and move it to the front. Every goal grades the workbook's end state, so any legitimate
// route counts.
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const rep = (k, n) => Array(n).fill(k).join(' ');
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
  tags: ['workbook', 'sheets', 'setup', 'navigation'],
  access: 'free',
  minutes: 7,
  headline: 'Ctrl+↓',
  conventions: ['A5', 'A4'],
  teaches: ['arrow-keys', 'ctrl-home-end', 'ctrl-arrow', 'name-box', 'cell-reference', 'shift-arrow', 'ctrl-shift-arrow', 'workbook', 'sheet-tabs', 'formula-bar', 'rename-sheet', 'delete-sheet', 'insert-sheet', 'move-sheet'],
  uses: [],
  prerequisites: [],
  brief: 'Management sent the Austin cluster’s site feed, and it arrived the way inherited files do: a tab still called Sheet2, a dead half-export, no page for the report. First get to the bottom of the feed the slow way and the fast way, on your own clock. Then tidy the file, because the tab names you set are the names every reference will carry — the key move is `Ctrl+↓`.',
  goals: [
    { id: 'slow-down', slowRound: true, teach: 'The arrow keys move the active cell one cell per press — feel how long sixty rows takes.', text: 'Round one, the slow way: walk down the dates with ↓ until you reach the last one, A61.', keys: '↓ ×60', requires: ['arrow-keys'],
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'A61') && windowKeys(ses).includes('↓') },
    { id: 'fast-down', teach: 'Ctrl+Home returns to A1 and Ctrl+Arrow jumps to the edge of the data in one press; the Name Box, left of the formula bar, shows the cell you landed on.', text: 'Round two: back to the top with Ctrl+Home, then the same trip in one Ctrl+↓ — the Name Box reads A61.', keys: 'Ctrl+Home then Ctrl+↓', requires: ['ctrl-home-end', 'ctrl-arrow', 'name-box', 'cell-reference'],
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'A61') && windowKeys(ses).includes('Ctrl+Home') && windowKeys(ses).includes('Ctrl+↓') },
    { id: 'select-dates', teach: 'Shift+Arrow grows a selection one cell per press; add Ctrl and the same jump selects to the edge in one press.', text: 'Take the two dates above with Shift+↑, then the whole date column in one Ctrl+Shift+↑: the selection reads A1:A61.', keys: 'Shift+↑ ×2 then Ctrl+Shift+↑', requires: ['shift-arrow', 'ctrl-shift-arrow'],
      check: (s, ses) => onSheet(ses, 'Raw') && s.selectionText() === 'A1:A61' && windowKeys(ses).includes('Shift+↑') && windowKeys(ses).includes('Ctrl+Shift+↑') },
    { id: 'tour', teach: 'A workbook is the file and the tabs along the bottom are its sheets: Ctrl+PgDn / Ctrl+PgUp walk them, and the formula bar shows what the active cell really holds.', text: 'Walk the tabs to Costs and land on the Domain total E4: the grid shows a number, the formula bar shows =B4+C4+D4.', keys: 'Ctrl+PgDn ×3 then ↓ ×3 Ctrl+→', requires: ['workbook', 'sheet-tabs', 'formula-bar'],
      check: (s, ses) => onSheet(ses, 'Costs') && at(s, 'E4') && s.cellAt('E4').formula === '=B4+C4+D4' && windowKeys(ses).includes('Ctrl+PgDn') },
    { id: 'rename', teach: 'Rename Sheet, Home › Format (Alt, H, O, R), opens the active tab’s name: type the new one and press Enter.', text: 'Sheet2 is the associate’s inputs scratch — go there and rename it Inputs.', keys: 'Ctrl+PgUp ×2 then Alt H O R "Inputs" ↵', requires: ['rename-sheet'],
      check: workbookIs('Raw', 'Inputs', 'Old wk37', 'Costs') },
    { id: 'delete', teach: 'Delete Sheet (Alt, H, D, S) removes the active sheet; Excel asks first, because a deleted sheet cannot be undone.', text: 'Old wk37 is a dead half-export — delete it and confirm.', keys: 'Ctrl+PgDn then Alt H D S ↵', requires: ['delete-sheet'],
      check: workbookIs('Raw', 'Inputs', 'Costs') },
    { id: 'insert', teach: 'Shift+F11 inserts a new worksheet in front of the active one and makes it active.', text: 'Insert the sheet the weekly report will live on and rename it Report.', keys: 'Shift+F11 then Alt H O R "Report" ↵', requires: ['insert-sheet'],
      check: workbookIs('Raw', 'Inputs', 'Report', 'Costs') },
    { id: 'move', teach: 'Move or Copy Sheet (Alt, H, O, M) moves the active sheet: ↑ ↓ pick where it will sit, Enter confirms.', text: 'The report reads first: move Report to the front of the workbook.', keys: 'Alt H O M ↑ ×2 ↵', requires: ['move-sheet'],
      check: workbookIs('Report', 'Raw', 'Inputs', 'Costs') },
  ],
  race: [
    { label: 'To the bottom of the feed', slow: 'slow-down', fast: 'fast-down' },
  ],
  endState: [
    { text: 'The workbook reads Report, Raw, Inputs, Costs', check: workbookIs('Report', 'Raw', 'Inputs', 'Costs') },
  ],
  closing: [
    'That difference is the whole idea: your hands learn the fast way on a real sheet, job by job.',
    'This feed becomes a one-page weekly report — page one of the sale pack. You build it in this chapter.',
  ],
  solution: rep('Down', 60) + ' Ctrl+Home Ctrl+Down Shift+Up Shift+Up Ctrl+Shift+Up Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Down Down Down Ctrl+Right Ctrl+PgUp Ctrl+PgUp Alt H O R "Inputs" Enter Ctrl+PgDn Alt H D S Enter Shift+F11 Alt H O R "Report" Enter Alt H O M Up Up Enter',
};
