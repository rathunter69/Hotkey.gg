// Chapter 1 · 1.1.1 — The workbook the managers sent (clearcoat-weekly, S0 → S1a)
// The chapter opens here (script-ch1.md 1.1.1): learn to move on the Austin cluster's feed (the arrows,
// Ctrl and an arrow, Shift on the way), walk the tabs, then get the file in order: rename Sheet2 to
// Inputs, delete Old wk37, add a Report sheet and move it to the front. Every goal grades the workbook's
// end state, so any legitimate route counts; the learner-facing words live in content/copy/*.csv.
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const count = (ses, key) => windowKeys(ses).filter(k => k === key).length;
const rep = (k, n) => Array(n).fill(k).join(' ');
const names = ses => ses.sheets.map(x => x.name);
const workbookIs = (...want) => (s, ses) => names(ses).length === want.length && names(ses).every((x, i) => x === want[i]);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;

export default {
  id: 'inherited-workbook',
  chapter: 'foundations',
  section: 'Open and set up',
  module: 'open-and-set-up',
  workbook: 'clearcoat-weekly',
  state: { before: 'S0', after: 'S1a' },
  title: 'The workbook the managers sent',
  difficulty: 'easy',
  tags: ['workbook', 'sheets', 'setup', 'navigation'],
  access: 'free',
  minutes: 7,
  headline: 'Ctrl+↓',
  conventions: ['A5', 'A4'],
  teaches: ['arrow-keys', 'ctrl-home-end', 'ctrl-arrow', 'name-box', 'cell-reference', 'shift-arrow', 'ctrl-shift-arrow', 'workbook', 'sheet-tabs', 'formula-bar', 'rename-sheet', 'delete-sheet', 'insert-sheet', 'move-sheet'],
  uses: [],
  prerequisites: [],
  brief: 'This is the Austin cluster’s weekly workbook exactly as ops sent it: five sites, two weeks of daily wash counts on the Raw tab, and the leftovers. First, learn to move: the arrow keys go one cell at a time, Ctrl and an arrow jumps to the edge of the data, and Shift selects on the way. Then get the file in order (rename the Sheet2 tab, delete last week’s export, and add a Report sheet at the front) because the tab names you set now are the ones every formula will carry. The key is `Ctrl+↓`.',
  goals: [
    { id: 'walk-down', slowRound: true, teach: 'The arrow keys move one cell per press, and Ctrl and an arrow jumps to the edge of the data in one press.', text: 'Walk down the dates with ↓ five times, then jump the rest of the way with Ctrl+↓ until the Name Box reads A61.', keys: '↓ ×5 then Ctrl+↓', requires: ['arrow-keys', 'ctrl-arrow', 'name-box', 'cell-reference'],
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'A61') && count(ses, '↓') >= 5 && windowKeys(ses).includes('Ctrl+↓') },
    { id: 'walk-up', slowRound: true, teach: 'Ctrl+↑ jumps to the top of the data, and Ctrl+Home takes you home to A1 from anywhere on the sheet.', text: 'Come back up the same way: ↑ five times, then Ctrl+↑ to A1.', keys: '↑ ×5 then Ctrl+↑', requires: ['arrow-keys', 'ctrl-arrow', 'ctrl-home-end'],
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'A1') && count(ses, '↑') >= 5 && windowKeys(ses).includes('Ctrl+↑') },
    { id: 'across', teach: 'The same jump works sideways: left, right, up and down replace almost all of your scrolling.', text: 'Across the headers: Ctrl+→ to the last column, F1, then Ctrl+← back to A1.', keys: 'Ctrl+→ then Ctrl+←', requires: ['ctrl-arrow'],
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'A1') && windowKeys(ses).includes('Ctrl+→') && windowKeys(ses).includes('Ctrl+←') },
    { id: 'select-table', teach: 'Hold Shift with any arrow and the selection grows a cell at a time; hold Ctrl and Shift and it grows to the edge of the data.', text: 'Select the whole date column from A1 in one Ctrl+Shift+↓, then widen the selection to the whole table with Ctrl+Shift+→: A1:F61.', keys: 'Ctrl+Shift+↓ then Ctrl+Shift+→', requires: ['shift-arrow', 'ctrl-shift-arrow'],
      check: (s, ses) => onSheet(ses, 'Raw') && s.selectionText() === 'A1:F61' && windowKeys(ses).includes('Ctrl+Shift+↓') && windowKeys(ses).includes('Ctrl+Shift+→') },
    { id: 'tour', teach: 'A workbook is the file; the tabs along the bottom are its sheets, Ctrl+PgDn and Ctrl+PgUp walk them, and the formula bar shows where a result came from.', text: 'Walk the tabs to Costs with Ctrl+PgDn and land on the Domain total in E4, where the formula bar shows =B4+C4+D4.', keys: 'Ctrl+PgDn ×3 then ↓ ×3 Ctrl+→', requires: ['workbook', 'sheet-tabs', 'formula-bar'],
      check: (s, ses) => onSheet(ses, 'Costs') && at(s, 'E4') && s.cellAt('E4').formula === '=B4+C4+D4' && windowKeys(ses).includes('Ctrl+PgDn') },
    { id: 'rename', teach: 'Rename Sheet is Home › Format › Rename (Alt, H, O, R): type the new name and press Enter.', text: 'Rename the Sheet2 tab to Inputs.', keys: 'Ctrl+PgUp ×2 then Alt H O R "Inputs" ↵', requires: ['rename-sheet'],
      check: workbookIs('Raw', 'Inputs', 'Old wk37', 'Costs') },
    { id: 'delete', teach: 'Delete Sheet (Alt, H, D, S) removes the active sheet; Excel asks first because it can’t be undone.', text: 'Delete the Old wk37 tab, since it’s last week’s export and the live numbers are on Raw.', keys: 'Ctrl+PgDn then Alt H D S ↵', requires: ['delete-sheet'],
      check: workbookIs('Raw', 'Inputs', 'Costs') },
    { id: 'report', teach: 'Shift+F11 inserts a sheet, Alt, H, O, R names it, and Move or Copy Sheet (Alt, H, O, M) moves it: ↑ ↓ pick where it sits, Enter confirms.', text: 'Add a new sheet for the report, name it Report, and move it to the front of the workbook.', keys: 'Shift+F11 then Alt H O R "Report" ↵ then Alt H O M ↑ ×2 ↵', requires: ['insert-sheet', 'move-sheet'],
      check: workbookIs('Report', 'Raw', 'Inputs', 'Costs') },
  ],
  endState: [
    { text: 'The workbook reads Report, Raw, Inputs, Costs', check: workbookIs('Report', 'Raw', 'Inputs', 'Costs') },
  ],
  wow: 'Five presses or one. Ctrl and an arrow gets you there.',
  closing: [
    'Ctrl and an arrow jumps to the edge of the data; add Shift and it selects on the way. Those two moves are most of what "fast in Excel" means, and you’ll use them hundreds of times a week.',
    'The workbook is set up: the tabs are named and in order, the stale data is gone and the Report page sits in front. Once the numbers are clean it goes to the CFO for approval and into the VDR, the virtual data room every buyer will read.',
  ],
  solution: rep('Down', 5) + ' Ctrl+Down ' + rep('Up', 5) + ' Ctrl+Up Ctrl+Right Ctrl+Left Ctrl+Shift+Down Ctrl+Shift+Right Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Down Down Down Ctrl+Right Ctrl+PgUp Ctrl+PgUp Alt H O R "Inputs" Enter Ctrl+PgDn Alt H D S Enter Shift+F11 Alt H O R "Report" Enter Alt H O M Up Up Enter',
};
