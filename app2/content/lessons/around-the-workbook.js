// Chapter 1 · 1.2.3 — Rows, columns and cells (clearcoat-weekly, S1d → S2a)
// The cell basics on the feed: AutoFit, a column width and F4 to repeat it, a row height, headers
// right-aligned, a row inserted for a note, a column inserted and deleted again on Costs, a long
// note wrapped. Each goal grades the sheet's end state (widths, heights, cells) against S2a, so any
// legitimate route counts. The learner-facing words live in content/copy/*.csv.
import { stateOf, RAW_NOTE_INSERTED } from '../workbooks/clearcoat-weekly.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const AFTER_RAW = stateOf('S2a').sheets.find(s => s.name === 'Raw');
const W11 = 11 * 7 + 5;   // Column Width 11 in the engine's pixels
const raw = ses => sheetOf(ses, 'Raw');
const costs = ses => sheetOf(ses, 'Costs');
const noUtilities = sh => !Object.values(sh.cells).some(c => c && c.value === 'Utilities');

export default {
  id: 'around-the-workbook',
  chapter: 'foundations',
  section: 'Move and select',
  module: 'move-and-select',
  workbook: 'clearcoat-weekly',
  state: { before: 'S1d', after: 'S2a' },
  title: 'Rows, columns and cells',
  difficulty: 'medium',
  tags: ['rows', 'columns', 'widths', 'alignment'],
  access: 'free',
  minutes: 7,
  headline: 'Ctrl+Shift+=',
  conventions: ['A5'],
  teaches: ['autofit', 'column-width', 'f4-repeat', 'row-height', 'align-command', 'insert-delete-rows', 'type-to-enter', 'wrap-text'],
  uses: ['sheet-tabs', 'row-col-select', 'ctrl-home-end', 'shift-arrow'],
  prerequisites: ['select-like-you-mean-it'],
  brief: 'Half of Excel is making room and making things fit. Rows and columns insert with Ctrl and plus and delete with Ctrl and minus, but select the whole row or column first with Shift+Space or Ctrl+Space. Widths and heights are under Home › Format (Alt, H, O), AutoFit sizes a column to its longest entry, and alignment sits under Alt, H, A. Ten minutes on these and you’ll never fight a sheet again. The key is `Ctrl+Shift+=`.',
  goals: [
    { id: 'autofit-b', teach: 'AutoFit Column Width is Home › Format › AutoFit Column Width (Alt, H, O, I): the column sizes to the longest entry in it, so select the whole column first with Ctrl+Space.', text: 'On Raw, the site names in column B are cut off: AutoFit the column to its longest entry.', keys: 'Ctrl+PgDn → Ctrl+Space then Alt H O I', requires: ['autofit', 'row-col-select', 'sheet-tabs'],
      check: (s, ses) => onSheet(ses, 'Raw') && raw(ses).colW[2] === AFTER_RAW.colW[2] },
    { id: 'width-a', teach: 'Column Width (Alt, H, O, W) sets the selected columns to a number of characters: type it and Enter; a column too narrow for a number or a date shows ######## until you widen it.', text: 'Column A is wider than a date needs: set it to width 11.', keys: '← Ctrl+Space then Alt H O W "11" ↵', requires: ['column-width', 'row-col-select'],
      check: (s, ses) => raw(ses).colW[1] === W11 },
    { id: 'f4-widths', teach: 'F4 repeats your last action on whatever is selected now: a width, a format, an insert; set it once, F4 everywhere.', text: 'The figure columns C:F should match, so select them and press F4, and the width you set a moment ago lands on all four.', keys: '→ → Ctrl+Space Shift+→ ×3 then F4', requires: ['f4-repeat', 'row-col-select', 'shift-arrow'],
      check: (s, ses) => [3, 4, 5, 6].every(c => raw(ses).colW[c] === W11) && windowKeys(ses).includes('F4') },
    { id: 'row-height', teach: 'Row Height (Alt, H, O, H) is in points; AutoFit Row Height (Alt, H, O, A) sizes a row back to what its text needs.', text: 'Give the header row some air: set row 1 to height 20.', keys: 'Ctrl+Home Shift+Space then Alt H O H "20" ↵', requires: ['row-height', 'row-col-select', 'ctrl-home-end'],
      check: (s, ses) => raw(ses).rowH[1] === AFTER_RAW.rowH[1] },
    { id: 'align-headers', teach: 'Numbers align right by default and text aligns left, so a header over a number column reads best right-aligned; alignment is Alt, H, A, then L, C or R.', text: 'The figure headers C1:F1 sit left over numbers that sit right: right-align them.', keys: '→ → Shift+→ ×3 then Alt H A R', requires: ['align-command', 'shift-arrow'],
      check: (s, ses) => ['C1', 'D1', 'E1', 'F1'].every(r => raw(ses).cellAt(r).align === 'r') },
    { id: 'insert-row', teach: 'Shift+Space selects the whole row, then Ctrl+Shift+= (Ctrl and plus) inserts a row above it, and Alt, H, I, R is the Ribbon route; whatever was there moves down, so nothing is overwritten.', text: 'Add a line under the Notes block by inserting a row above A67, then type "Airport Sat missing - emailed manager".', alt: 'Alt H I R', keys: 'Ctrl+End Home Shift+Space Ctrl+Shift+= then "Airport Sat missing - emailed manager" ↵', requires: ['insert-delete-rows', 'row-col-select', 'type-to-enter', 'ctrl-home-end'],
      check: (s, ses) => raw(ses).value('A67') === RAW_NOTE_INSERTED && raw(ses).value('A68') === 'Wash cost at the supplier rate' },
    { id: 'insert-col', teach: 'Columns insert the same way: Ctrl+Space selects the column, Ctrl+Shift+= inserts one to its left, Alt, H, I, C is the Ribbon route, and the formulas to the right move over and keep working.', text: 'On Costs, add a column for Utilities between Maintenance and Card fees: select column D and insert, then type Utilities in D3.', alt: 'Alt H I C', keys: 'Ctrl+PgDn ×2 → ×3 Ctrl+Space Ctrl+Shift+= then ↓ ↓ "Utilities" ↵', requires: ['insert-delete-rows', 'row-col-select', 'type-to-enter', 'sheet-tabs'],
      check: (s, ses) => onSheet(ses, 'Costs') && costs(ses).value('D3') === 'Utilities' && costs(ses).value('E3') === 'Card fees ($/wk)' && costs(ses).cellAt('F4').formula === '=B4+C4+E4' },
    { id: 'delete-col', teach: 'Ctrl+− (Ctrl and minus) deletes the selected rows or columns whole; Alt, H, D, C and Alt, H, D, R are the Ribbon routes, and Ctrl+Z brings back a column you didn’t mean to delete.', text: 'The CFO says utilities sit inside rent this year, so delete the Utilities column again.', alt: 'Alt H D C', keys: 'Ctrl+Space then Ctrl+-', requires: ['insert-delete-rows', 'row-col-select'],
      check: (s, ses) => costs(ses).value('D3') === 'Card fees ($/wk)' && costs(ses).cellAt('E4').formula === '=B4+C4+D4' && noUtilities(costs(ses)) },
    { id: 'wrap-note', teach: 'Wrap Text (Alt, H, W) folds a long entry onto more lines inside its cell, and AutoFit Row Height (Alt, H, O, A) grows the row to fit; it’s how a label stays readable without widening the whole column.', text: 'Back on Raw, the note in A64 runs past its column: wrap it inside the cell.', keys: 'Ctrl+PgUp ×2 ↑ ×3 Alt H W then Alt H O A', requires: ['wrap-text', 'sheet-tabs'],
      check: (s, ses) => onSheet(ses, 'Raw') && raw(ses).cellAt('A64').wrap === true && raw(ses).rowH[64] === AFTER_RAW.rowH[64] },
  ],
  endState: [
    { text: 'Costs is back to five columns, its totals intact', check: (s, ses) => costs(ses).cellAt('E4').formula === '=B4+C4+D4' && noUtilities(costs(ses)) },
  ],
  wow: 'You made room and made everything fit, and F4 did half the work.',
  closing: [
    'Insert with Ctrl and plus, delete with Ctrl and minus, select the row or column first; widths, heights and AutoFit under Alt, H, O; alignment under Alt, H, A; F4 to do it again. That’s the cell basics, and every sheet you touch from here on gets them without thinking.',
    'Module 1.4 does the same on a page with formulas in it, where a deleted column can break a total.',
  ],
  solution: `Ctrl+PgDn Right Ctrl+Space Alt H O I Left Ctrl+Space Alt H O W "11" Enter Right Right Ctrl+Space Shift+Right Shift+Right Shift+Right F4 Ctrl+Home Shift+Space Alt H O H "20" Enter Right Right Shift+Right Shift+Right Shift+Right Alt H A R Ctrl+End Home Shift+Space Ctrl+Shift+= "${RAW_NOTE_INSERTED}" Enter Ctrl+PgDn Ctrl+PgDn Right Right Right Ctrl+Space Ctrl+Shift+= Down Down "Utilities" Enter Ctrl+Space Ctrl+- Ctrl+PgUp Ctrl+PgUp Up Up Up Alt H W Alt H O A`,
};
