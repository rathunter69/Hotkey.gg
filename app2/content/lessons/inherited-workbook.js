// Chapter 1 · 1.1.1 — The workbook the managers sent (clearcoat-weekly, S0 → S1a)
// The chapter opens here (script-ch1.md 1.1.1): learn to move on the Austin cluster's feed (the arrows,
// then Ctrl and an arrow), then use those jumps to read each tab before deciding what happens to it:
// Sheet2 holds the inputs, so it is renamed Inputs; Old wk37 ends in #N/A, so it is deleted; Costs is
// read in the formula bar; a Report sheet goes in front. Selecting moved to 1.1.2 and 1.1.5, where each
// selection is used the moment it is made (the status bar, a font color): the payoff pass of 2026-10-02.
// Every goal grades the workbook's end state, so any legitimate route counts; the learner-facing words
// live in content/copy/*.csv.
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
  teaches: ['arrow-keys', 'ctrl-home-end', 'ctrl-arrow', 'name-box', 'cell-reference', 'workbook', 'sheet-tabs', 'formula-bar', 'rename-sheet', 'delete-sheet', 'insert-sheet', 'move-sheet'],
  uses: [],
  prerequisites: [],
  brief: 'This is the Austin cluster’s weekly workbook exactly as ops sent it: five sites, two weeks of daily wash counts on the Raw tab, and the leftovers. First, learn to move: the arrow keys go one cell at a time, and Ctrl and an arrow jumps to the edge of the data. Then use those jumps to read each tab before you decide what happens to it: rename the one that holds the inputs, delete last week’s broken export, and add a Report sheet at the front. The tab names you set now are the ones every formula will carry. The key is `Ctrl+↓`.',
  goals: [
    { id: 'walk-down', slowRound: true, text: 'Walk down the dates with ↓ five times, then jump the rest of the way with Ctrl+↓ until the Name Box reads A61.', keys: '↓ ×5 then Ctrl+↓', requires: ['arrow-keys', 'ctrl-arrow', 'name-box', 'cell-reference'],
      teach: 'The arrow keys move one cell per press. Ctrl and an arrow jumps to the edge of the data in one press (down, up, left or right), and the Name Box, left of the formula bar, shows where you landed.',
      hintStuck: 'pulse the Name Box · Ctrl+↓ from anywhere in the column lands on the last date.',
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'A61') && count(ses, '↓') >= 5 && windowKeys(ses).includes('Ctrl+↓') },
    { id: 'walk-up', slowRound: true, text: 'Come back up the same way: ↑ five times, then Ctrl+↑ to A1.', keys: '↑ ×5 then Ctrl+↑', requires: ['arrow-keys', 'ctrl-arrow', 'ctrl-home-end'],
      teach: 'Ctrl+↑ jumps to the top of the data. Ctrl+Home takes you home to A1 from anywhere on the sheet, which is the one to remember when you get lost in a big file.',
      hintStuck: 'pulse cell A1 · Ctrl+↑ from the dates lands on the header; Ctrl+Home lands on A1 from anywhere.',
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'A1') && count(ses, '↑') >= 5 && windowKeys(ses).includes('Ctrl+↑') },
    { id: 'across', text: 'Across the headers: Ctrl+→ to the last column, F1, then Ctrl+← back to A1.', keys: 'Ctrl+→ then Ctrl+←', requires: ['ctrl-arrow'],
      teach: 'The same jump works sideways. Left, right, up, down: four keys that replace almost all of your scrolling.',
      hintStuck: 'pulse cell F1 · Ctrl+→ stops at the last filled column; Ctrl+← brings you back.',
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'A1') && windowKeys(ses).includes('Ctrl+→') && windowKeys(ses).includes('Ctrl+←') },
    { id: 'read-sheet2', text: 'Move to Sheet2 with Ctrl+PgDn and jump down its labels with Ctrl+↓ to A15: a cost per wash, a target ticket, a fee rate.', keys: 'Ctrl+PgDn then Ctrl+↓ ×2', requires: ['workbook', 'sheet-tabs', 'ctrl-arrow'],
      teach: 'A workbook is the file, and the tabs along the bottom are its sheets: Ctrl+PgDn walks them to the right, Ctrl+PgUp to the left. A jump down column A reads a sheet’s labels without scrolling, and the jump stops at the blank row 2 on the way.',
      hintStuck: 'pulse the Sheet2 tab · One Ctrl+PgDn from Raw, then Ctrl+↓ until the Name Box reads A15.',
      check: (s, ses) => onSheet(ses, 'Sheet2') && at(s, 'A15') && windowKeys(ses).includes('Ctrl+PgDn') && windowKeys(ses).includes('Ctrl+↓') },
    { id: 'rename', text: 'Those labels are the inputs the report runs on, so rename the Sheet2 tab to Inputs.', keys: 'Alt H O R "Inputs" ↵', requires: ['rename-sheet'],
      teach: 'Rename Sheet is Home › Format › Rename (Alt, H, O, R): type the new name and press Enter. Every formula that points at this sheet will carry the name you type now, so name it once and name it right.',
      hintStuck: 'pulse the Sheet2 tab · Rename works on the active sheet, so Sheet2 has to be the one selected.',
      check: workbookIs('Raw', 'Inputs', 'Old wk37', 'Costs') },
    { id: 'read-old', text: 'On the next tab, Old wk37, jump down column A with Ctrl+↓: it ends at A22 on #N/A, an export that died halfway.', keys: 'Ctrl+PgDn then Ctrl+↓', requires: ['sheet-tabs', 'ctrl-arrow'],
      teach: 'One jump down a column tells you how far the data runs and what it ends on. Data that ends in #N/A is an export that broke on the way out, and nobody should be reading it.',
      hintStuck: 'pulse the Old wk37 tab · One Ctrl+PgDn from Inputs, then Ctrl+↓ from A1.',
      check: (s, ses) => onSheet(ses, 'Old wk37') && at(s, 'A22') && windowKeys(ses).includes('Ctrl+↓') },
    { id: 'delete', text: 'Delete the Old wk37 tab: it’s last week’s export, half of it broken, and the live numbers are on Raw.', keys: 'Alt H D S ↵', requires: ['delete-sheet'],
      teach: 'Delete Sheet (Alt, H, D, S) removes the active sheet; Excel asks first because it can’t be undone. Stale data left in a file gets read as if it were current, so it comes out. Nothing warns you when other tabs read the one you delete (their formulas turn to #REF!), so on a live model you search the workbook for the tab’s name first (3.6.3).',
      hintStuck: 'pulse the Old wk37 tab · Old wk37 has to be the active tab; then answer the confirmation.',
      check: workbookIs('Raw', 'Inputs', 'Costs') },
    { id: 'read-costs', text: 'Costs is open now: jump to the Domain total in E4, where the formula bar shows =B4+C4+D4.', keys: '↓ ×3 then Ctrl+→', requires: ['formula-bar', 'ctrl-arrow', 'arrow-keys'],
      teach: 'The grid shows a result; the formula bar shows where it came from, and that’s the one a reviewer reads. Three steps down to the Domain row and one jump across put you on it.',
      hintStuck: 'pulse cell E4 · The formula bar only shows the sum once you’re on E4.',
      check: (s, ses) => onSheet(ses, 'Costs') && at(s, 'E4') && s.cellAt('E4').formula === '=B4+C4+D4' },
    { id: 'report', text: 'Add a new sheet for the report, name it Report, and move it to the front of the workbook.', keys: 'Shift+F11 then Alt H O R "Report" ↵ then Alt H O M ↑ ×2 ↵', requires: ['insert-sheet', 'move-sheet'],
      teach: 'Shift+F11 inserts a sheet, Alt, H, O, R names it, and Move or Copy Sheet (Alt, H, O, M) moves it: ↑ ↓ pick where it sits, Enter confirms. The output page goes first: tabs run the way a reader reads.',
      hintStuck: 'pulse the Move or Copy dialog · In Move or Copy, pick the sheet that’s currently first.',
      check: workbookIs('Report', 'Raw', 'Inputs', 'Costs') },
  ],
  endState: [
    { text: 'The workbook reads Report, Raw, Inputs, Costs', check: workbookIs('Report', 'Raw', 'Inputs', 'Costs') },
  ],
  wow: 'Five presses or one. Ctrl and an arrow gets you there.',
  closing: [
    'Ctrl and an arrow jumps to the edge of the data, and where it lands tells you something: sixty rows of feed, a sheet of inputs, an export that ends in #N/A. That jump is most of what "fast in Excel" means, and you’ll use it hundreds of times a week.',
    'The workbook is set up: the tabs are named and in order, the stale data is gone and the Report page sits in front. Once the numbers are clean it goes to the CFO for approval and into the VDR, the virtual data room every buyer will read.',
  ],
  solution: rep('Down', 5) + ' Ctrl+Down ' + rep('Up', 5) + ' Ctrl+Up Ctrl+Right Ctrl+Left Ctrl+PgDn Ctrl+Down Ctrl+Down Alt H O R "Inputs" Enter Ctrl+PgDn Ctrl+Down Alt H D S Enter Down Down Down Ctrl+Right Shift+F11 Alt H O R "Report" Enter Alt H O M Up Up Enter',
};
