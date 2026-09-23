// Chapter 1 · 1.2.2 — Select like you mean it (voltline-weekly, S1d → S1d)
// Every format, fill and formula pass starts with a selection: the Revenue block, the header row,
// whole rows and columns, the feed, the sheet. Nothing on the sheet changes.
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const sel = (s, text) => s.selectionText() === text;

export default {
  id: 'select-like-you-mean-it',
  chapter: 'foundations',
  section: 'Move and select',
  module: 'move-and-select',
  workbook: 'voltline-weekly',
  state: { before: 'S1d', after: 'S1d' },
  title: 'Select like you mean it',
  difficulty: 'easy',
  tags: ['selection'],
  access: 'free',
  minutes: 5,
  headline: 'Ctrl+Shift+Arrow',
  conventions: ['A5'],
  teaches: ['row-col-select', 'ctrl-a', 'select-all-sheet'],
  uses: ['ctrl-shift-arrow', 'ctrl-arrow', 'ctrl-home-end', 'sheet-tabs'],
  prerequisites: ['jump-dont-scroll'],
  brief: 'Everything you format later starts with the right selection, made in one or two presses. Practice the set on the feed — the workhorse is `Ctrl+Shift+↓`.',
  goals: [
    { id: 'to-raw', text: 'Move to Raw, where the selecting is.', keys: 'Ctrl+PgDn', requires: ['sheet-tabs'],
      check: (s, ses) => onSheet(ses, 'Raw') },
    { id: 'col-block', text: 'Select Revenue from its header to the last figure: E1, then one Ctrl+Shift+↓.', keys: 'Ctrl+→ ← then Ctrl+Shift+↓', requires: ['ctrl-shift-arrow'],
      check: (s, ses) => sel(s, 'E1:E60') && windowKeys(ses).includes('Ctrl+Shift+↓') },
    { id: 'header-row', teach: 'Shift+Space selects the active row; Ctrl+Space selects the active column.', text: 'Collapse to A1, then select the whole header row with Shift+Space.', keys: 'Ctrl+Home then Shift+Space', requires: ['row-col-select'],
      check: (s, ses) => sel(s, 'A1:Z1') && windowKeys(ses).includes('Shift+Space') },
    { id: 'whole-col', text: 'Now the whole of column E with Ctrl+Space.', keys: 'Ctrl+→ ← then Ctrl+Space', requires: ['row-col-select'],
      check: (s, ses) => sel(s, 'E1:E100') && windowKeys(ses).includes('Ctrl+Space') },
    { id: 'feed', teach: 'Ctrl+A selects the current region — the block of data around the active cell.', text: 'Select the whole feed in one press: Ctrl+A.', keys: 'Ctrl+A', requires: ['ctrl-a'],
      check: (s, ses) => sel(s, 'A1:F61') && windowKeys(ses).includes('Ctrl+A') },
    { id: 'sheet', teach: 'Ctrl+A pressed again widens to the entire sheet.', text: 'Press Ctrl+A a second time: the entire sheet.', keys: 'Ctrl+A', requires: ['select-all-sheet'],
      check: (s, ses) => sel(s, 'A1:Z100') && windowKeys(ses).includes('Ctrl+A') },
    { id: 'to-end', text: 'Collapse to A1 with Ctrl+Home, then take everything used with Ctrl+Shift+End.', keys: 'Ctrl+Home then Ctrl+Shift+End', requires: ['ctrl-home-end'],
      check: (s, ses) => sel(s, 'A1:H67') && windowKeys(ses).includes('Ctrl+Shift+End') },
  ],
  solution: 'Ctrl+PgDn Ctrl+Right Left Ctrl+Shift+Down Ctrl+Home Shift+Space Ctrl+Right Left Ctrl+Space Ctrl+A Ctrl+A Ctrl+Home Ctrl+Shift+End',
};
