// Chapter 2 · 2.4.3 Hiding vs grouping vs a separate sheet (clearcoat-pnl, S4b + PLANT_STRAY → S4c)
// Someone hid the margins block (rows 26:30) and pasted a month-by-month cluster block under the
// P&L at row 41. The margins come back and fold behind a button instead; the stray block, a
// different page, gets its own sheet: Monthly detail, inserted, named, moved to the end, and the
// block cut onto it at A1. Row 40 holds a check, so no rows are deleted; the cut leaves rows
// 41:58 empty. The closer moves a revenue line and EBITDA answers with nothing hidden.
import { PLANT_STRAY, DETAIL } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const detail = ses => sheetOf(ses, 'Monthly detail');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const groupOf = (sh, r1, r2) => ((sh.groups && sh.groups.rows) || []).find(g => g.r1 === r1 && g.r2 === r2) || null;
const ORDER = ['P&L', 'Inputs', 'Monthly', 'Print', 'Monthly detail'];

const unhidden = sh => sh.hiddenRows.size === 0;
const strayGone = sh => { for (const k in sh.cells) { const r = +/\d+$/.exec(k)[0]; const c = sh.cells[k]; if (r >= DETAIL.strayTop && (c.value != null || c.formula)) return false; } return true; };
const moved = d => typeof d.value('A1') === 'string' && /by cluster/.test(d.value('A1')) && d.cellAt('C9').formula === '=SUM(C6:C8)' && d.cellAt('O18').formula === '=SUM(C18:N18)';

export default {
  id: 'hide-group-or-separate-sheet',
  chapter: 'formatting',
  section: 'Alignment and structure',
  module: 'alignment-and-structure',
  workbook: 'clearcoat-pnl',
  state: { before: 'S4b', after: 'S4c' },
  plant: PLANT_STRAY,
  title: 'Hiding vs grouping vs a separate sheet',
  difficulty: 'medium',
  tags: ['structure', 'outline', 'sheets'],
  access: 'paid',
  minutes: 6,
  headline: 'Alt H O U',
  conventions: ['C7', 'A4', 'C6'],
  teaches: ['group-not-hide'],
  uses: ['hide-unhide', 'group-ungroup', 'outline-detail', 'row-col-select', 'shift-arrow', 'go-to', 'sheet-reference', 'sheet-tabs', 'insert-sheet', 'rename-sheet', 'move-sheet', 'copy-cut-paste'],
  prerequisites: ['grouping-and-outline-levels'],
  brief: 'Three ways to get detail out of the way, and only one is right for each case. Hidden rows vanish and get forgotten: a reader who finds one wonders what else is hidden. Grouped rows fold and show a button, right for detail that belongs on the page. A separate sheet is right when the detail is a different page: the cluster block belongs on its own sheet, not under the P&L. The key is `Alt H O U`.',
  goals: [
    { id: 'unhide', teach: 'A hidden row leaves no button and no trace, so a reader who finds one wonders what else is hidden. Select across the gap, whole rows, and Unhide Rows is Alt, H, O, U, O.', text: 'Someone hid rows 26:30: select rows 25:31 whole and unhide them with Alt, H, O, U, O.', keys: 'Ctrl+G "A25:A31" ↵ Shift+Space Alt H O U O', requires: ['group-not-hide', 'hide-unhide', 'row-col-select', 'go-to'], convention: 'C7',
      hintStuck: 'pulse rows 25:31 · The row numbers jump from 25 to 31.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && unhidden(sh) && settled(ses); } },
    { id: 'group', text: 'Group the margins block, rows 26:30, instead, so it folds behind a button rather than vanishing.', keys: '↓ Shift+↓ ×4 Shift+Space Alt+Shift+→', requires: ['group-ungroup', 'row-col-select', 'shift-arrow'], convention: 'C7',
      hintStuck: 'pulse rows 26:30 · Margins and growth, the header and its four lines.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && unhidden(sh) && !!groupOf(sh, 26, 30) && settled(ses); } },
    { id: 'new-sheet', teach: 'The cluster block is a different page, so it gets its own sheet rather than a fold under the P&L. Shift+F11 inserts a sheet in front of the active one, and Alt, H, O, R renames it.', text: 'Go to Print, insert a sheet with Shift+F11 and name it Monthly detail with Alt, H, O, R.', keys: 'Ctrl+PgDn ×3 Shift+F11 Alt H O R "Monthly detail" ↵', requires: ['group-not-hide', 'insert-sheet', 'rename-sheet', 'sheet-tabs'], convention: 'A4',
      hintStuck: 'pulse the sheet tabs · Print is the last tab.',
      check: (s, ses) => !!detail(ses) && settled(ses) },
    { id: 'to-end', text: 'Move Monthly detail to the end with Alt, H, O, M and (move to end), so the working sheet sits behind the pages.', keys: 'Alt H O M ↓ ×2 ↵', requires: ['move-sheet'], convention: 'A4',
      hintStuck: 'pulse the sheet tabs · Outputs on the left, working sheets on the right.',
      check: (s, ses) => ses.sheets.map(e => e.name).join('|') === ORDER.join('|') && settled(ses) },
    { id: 'cut', text: 'Cut the stray block A41:O58 off the P&L with Ctrl+X and paste it onto Monthly detail at A1.', keys: `Ctrl+G "'P&L'!A41:O58" ↵ Ctrl+X Ctrl+G "'Monthly detail'!A1" ↵ Ctrl+V`, requires: ['copy-cut-paste', 'go-to', 'sheet-reference'], convention: 'C6',
      hintStuck: 'pulse range A41:O58 · The block starts with its own title under the checks.',
      check: (s, ses) => { const p = pnl(ses), d = detail(ses); return !!p && !!d && strayGone(p) && moved(d) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "'P&L'!C7" Enter "18500" Enter Ctrl+G "C24" Enter Escape Escape Escape`, cadence: 320 }, text: 'Does it tie? Watch P&L!C7 change to 18500, and C24 answer with nothing hidden.', requires: [],
      hintStuck: 'pulse cell C24 · Every row of the P&L is on show or one button away.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Nothing is hidden, and the margins block is grouped', check: (s, ses) => { const sh = pnl(ses); return !!sh && unhidden(sh) && !!groupOf(sh, 26, 30); } },
    { text: 'The cluster block sits on its own sheet, at the end', check: (s, ses) => { const p = pnl(ses), d = detail(ses); return !!p && !!d && strayGone(p) && moved(d) && ses.sheets[ses.sheets.length - 1].name === 'Monthly detail'; } },
  ],
  closing: [
    'Nothing is hidden, the detail is grouped and the other page has its own sheet.',
    'The margins fold behind a button a reader can see, and the cluster block reads as a page of its own behind the P&L. A cut keeps every formula pointing at its own rows, so the block works the same on its new sheet.',
  ],
  solution: `Ctrl+G "A25:A31" Enter Shift+Space Alt H O U O Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Space Alt+Shift+Right Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Shift+F11 Alt H O R "Monthly detail" Enter Alt H O M Down Down Enter Ctrl+G "'P&L'!A41:O58" Enter Ctrl+X Ctrl+G "'Monthly detail'!A1" Enter Ctrl+V`,
};
