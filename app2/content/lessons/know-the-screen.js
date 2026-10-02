// Chapter 1 · 1.1.2 — Know the screen (clearcoat-weekly, S1a → S1a; M44)
// The tour of the window on the feed: the formula bar read against the grid, Ctrl+Shift+U, Ctrl+F1,
// the first selection (Ctrl+Shift+↓, moved here from 1.1.1 so it is used the moment it is made) read
// in the status bar, the Zoom dialog and back to 100%, the sheet keys with the browser
// alias. Nothing on the sheets changes; every goal grades the window's state and the keys since the
// goal became current. The learner-facing words live in content/copy/*.csv.
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const count = (ses, key) => windowKeys(ses).filter(k => k === key).length;
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;

export default {
  id: 'know-the-screen',
  chapter: 'foundations',
  section: 'Open and set up',
  module: 'open-and-set-up',
  workbook: 'clearcoat-weekly',
  state: { before: 'S1a', after: 'S1a' },
  title: 'Know the screen',
  difficulty: 'easy',
  tags: ['screen', 'formula-bar', 'status-bar', 'zoom'],
  access: 'free',
  minutes: 5,
  headline: 'Ctrl+Shift+U',
  conventions: ['A5'],
  teaches: ['formula-bar-expand', 'ribbon-collapse', 'status-bar', 'zoom', 'ctrl-shift-arrow'],
  uses: ['formula-bar', 'sheet-tabs', 'ctrl-arrow', 'ctrl-home-end'],
  prerequisites: ['inherited-workbook'],
  brief: 'Before the hotkeys, the screen. The Name Box (top left) tells you where you are; the formula bar next to it tells you what the cell really holds; the Ribbon holds every command; the sheet tabs along the bottom are the pages of the file; the status bar under them totals whatever you select; and the zoom sits in the corner. Ten minutes here and nothing on the screen will surprise you again. The key is `Ctrl+Shift+U`.',
  goals: [
    { id: 'read-twice', teach: 'The grid shows a cell’s result, and the formula bar above the column letters shows what’s in it, either a typed number or the formula that made one.', text: 'Land on Raw!E4 and read it twice: the grid shows a number, the formula bar shows =C4*D4.', keys: 'Ctrl+PgDn ↓ ×3 Ctrl+→ ←', requires: ['formula-bar', 'sheet-tabs', 'ctrl-arrow'],
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'E4') && s.cellAt('E4').formula === '=C4*D4' },
    { id: 'expand-bar', teach: 'Ctrl+Shift+U expands the formula bar to several lines and collapses it again, so a long formula or note reads in full without editing the cell.', text: 'The note in H1 is longer than the bar shows: expand the formula bar with Ctrl+Shift+U, read it, then collapse it again.', keys: 'Ctrl+↑ Ctrl+→ Ctrl+→ then Ctrl+Shift+U then Ctrl+Shift+U', requires: ['formula-bar-expand', 'ctrl-arrow'],
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'H1') && count(ses, 'Ctrl+Shift+U') >= 2 && ses.settings.formulaBarExpanded === false },
    { id: 'collapse-ribbon', teach: 'Ctrl+F1 hides the Ribbon down to its tab names and shows it again; Alt still works while it’s collapsed, so the hotkeys don’t care.', text: 'Collapse the Ribbon with Ctrl+F1 to see more rows, then bring it back.', keys: 'Ctrl+F1 then Ctrl+F1', requires: ['ribbon-collapse'],
      check: (s, ses) => count(ses, 'Ctrl+F1') >= 2 && ses.settings.ribbonCollapsed === false },
    { id: 'status-bar', teach: 'Hold Ctrl and Shift and press ↓, and the selection runs from the active cell to the edge of the data. The status bar totals whatever is selected, with no formula written: Sum, Average, Count.', text: 'Select the wash counts C2:C60 with one Ctrl+Shift+↓ from C2, then read the status bar at the bottom: Sum, Average and Count.', keys: 'Ctrl+Home ↓ → → then Ctrl+Shift+↓', requires: ['status-bar', 'ctrl-shift-arrow', 'ctrl-home-end'],
      check: (s, ses) => onSheet(ses, 'Raw') && s.selectionText() === 'C2:C60' && !!ses.statusInfo().show },
    { id: 'zoom', teach: 'The Zoom dialog is View › Zoom (Alt, W, Q); Alt, W, J is 100% in one press.', text: 'Zoom out to see the whole feed: Alt, W, Q, pick 75%, then back to 100% with Alt, W, J.', keys: 'Alt W Q 7 ↵ then Alt W J', requires: ['zoom'],
      check: (s, ses) => s.zoom === 100 && windowKeys(ses).includes('Q') && windowKeys(ses).includes('7') && windowKeys(ses).includes('J') },
    { id: 'sheet-keys', teach: 'Ctrl+PgDn and Ctrl+PgUp move one sheet at a time; in a browser tab Alt+PgDn and Alt+PgUp do the same job and count the same.', text: 'Walk the sheet tabs to Costs and back to Raw with the sheet keys.', keys: 'Ctrl+PgDn ×2 then Ctrl+PgUp ×2', requires: ['sheet-tabs'],
      check: (s, ses) => onSheet(ses, 'Raw') && count(ses, 'Ctrl+PgDn') >= 2 && count(ses, 'Ctrl+PgUp') >= 2 },
  ],
  wow: 'Six parts to the screen, and you’ve now used every one of them.',
  closing: [
    'Every number on the sheet has two views: the grid shows the result, the formula bar shows what made it, and a reviewer reads the second one. The status bar is the fastest sanity check in Excel, and zoom back to 100% is how a page leaves your hands.',
    'Best practice: before you send a file, every sheet at 100%, the cursor on A1, the first tab showing. A file that opens mid-scroll looks unfinished.',
  ],
  solution: 'Ctrl+PgDn Down Down Down Ctrl+Right Left Ctrl+Up Ctrl+Right Ctrl+Right Ctrl+Shift+U Ctrl+Shift+U Ctrl+F1 Ctrl+F1 Ctrl+Home Down Right Right Ctrl+Shift+Down Alt W Q 7 Enter Alt W J Ctrl+PgDn Ctrl+PgDn Ctrl+PgUp Ctrl+PgUp',
};
