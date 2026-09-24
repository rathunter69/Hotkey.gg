// app2/content/micro.js — the micro-drills for the shortcuts modules 1.3 and 1.4 teach (C2 Run 2
// addendum): one shortcut each, 30–45 s, on the module workbook's own states, in the shape
// app/schedule.js established for 1.1–1.2 (keyed by concept id; `secs` is the queue's budget;
// `goals` and `solution` are what the lesson workspace runs). Every check reads the sheet's end
// state; the key window only says the shortcut was the route.
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const used = (ses, ...ks) => ks.some(k => windowKeys(ses).includes(k));
const cell = (ses, sheetName, ref) => { const sh = (ses.sheets || []).find(x => x.name === sheetName); return sh && sh.sheet ? sh.sheet.cellAt(ref) : null; };
const val = (ses, sheetName, ref) => { const c = cell(ses, sheetName, ref); return c ? (c.formula ? undefined : c.value) : null; };
const report = ses => { const e = (ses.sheets || []).find(x => x.name === 'Report'); return e ? e.sheet : null; };
const THIS_WEEK = 'w/c 15 Sep';

export const MICRO_MODULES = {
  /* ---------------- 1.3 enter, edit, copy and fill ---------------- */
  'enter-tab-direction': { title: 'A row in one run', task: 'Enter three day names across a row with Tab, and let Enter bring you back under the first.', secs: 35, state: 'S3c',
    goals: [
      { id: 'run', text: 'On the Report, enter Mon, Tue and Wed in B14:D14 as one Tab run, then Enter: the cursor lands on B15, under Mon.', keys: 'Ctrl+Home Ctrl+↓ ×4 ↓ ×2 → "Mon" Tab "Tue" Tab "Wed" ↵', requires: ['enter-tab-direction'],
        check: (s, ses) => val(ses, 'Report', 'B14') === 'Mon' && val(ses, 'Report', 'C14') === 'Tue' && val(ses, 'Report', 'D14') === 'Wed' && at(s, 'B15') },
    ], solution: 'Ctrl+Home Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Down Down Right "Mon" Tab "Tue" Tab "Wed" Enter' },
  'escape-cancels': { title: 'Back out of an entry', task: 'Start typing over the title, then throw the entry away with Esc.', secs: 30, state: 'S3c',
    goals: [
      { id: 'esc', text: 'Type anything over the Report title in A1, then press Esc: the title is untouched.', keys: 'Ctrl+Home "x" Esc', requires: ['escape-cancels'],
        check: (s, ses) => !ses.editing && String(val(ses, 'Report', 'A1') || '').startsWith('Voltline') && used(ses, 'Esc') },
    ], solution: 'Ctrl+Home "x" Escape' },
  'ctrl-enter-fill': { title: 'Five cells in one press', task: 'Put this week’s label in all five site rows with one entry.', secs: 35, state: 'S3c',
    goals: [
      { id: 'fill', text: 'Select the week labels B5:B9, type w/c 15 Sep once and press Ctrl+Enter: all five change together.', keys: 'Ctrl+Home Ctrl+↓ ×2 ↓ → Ctrl+Shift+↓ "w/c 15 Sep" Ctrl+↵', requires: ['ctrl-enter-fill'],
        check: (s, ses) => [5, 6, 7, 8, 9].every(r => val(ses, 'Report', 'B' + r) === THIS_WEEK) && used(ses, 'Ctrl+↵') },
    ], solution: 'Ctrl+Home Ctrl+Down Ctrl+Down Down Right Ctrl+Shift+Down "w/c 15 Sep" Ctrl+Enter' },
  'edit-caret': { title: 'Edit in place', task: 'Add to a cell’s text without retyping it.', secs: 30, state: 'S0',
    goals: [
      { id: 'append', text: 'Open B2 with F2 — the caret sits at the end — and add a space and (Austin), so it reads Domain (Austin).', keys: 'Ctrl+Home → ↓ F2 " (Austin)" ↵', requires: ['edit-caret'],
        check: (s, ses) => val(ses, 'Raw', 'B2') === 'Domain (Austin)' && used(ses, 'F2') },
    ], solution: 'Ctrl+Home Right Down F2 " (Austin)" Enter' },
  'find-replace': { title: 'Find a date', task: 'Land on the feed’s first Saturday without scrolling.', secs: 30, state: 'S0',
    goals: [
      { id: 'find', text: 'Ctrl+F, 13-Sep, Enter, then Esc: the cursor is on the feed’s first Saturday, A7.', keys: 'Ctrl+F "13-Sep" ↵ Esc', requires: ['find-replace'],
        check: (s, ses) => at(s, 'A7') && used(ses, 'Ctrl+F') },
    ], solution: 'Ctrl+F "13-Sep" Enter Escape' },
  'undo-redo': { title: 'Undo and redo', task: 'Break a figure, take it back, put the break back, take it back again.', secs: 35, state: 'S0',
    goals: [
      { id: 'undo', text: 'Overwrite Domain’s first kWh in C2 with 0 and press Enter, then Ctrl+Z: 1070 is back.', keys: 'Ctrl+Home → ×2 ↓ "0" ↵ Ctrl+Z', requires: ['undo-redo'],
        check: (s, ses) => val(ses, 'Raw', 'C2') === 1070 && used(ses, 'Ctrl+Z') },
      { id: 'redo', text: 'Ctrl+Y puts the 0 back; one more Ctrl+Z restores the feed.', keys: 'Ctrl+Y Ctrl+Z', requires: ['undo-redo'],
        check: (s, ses) => val(ses, 'Raw', 'C2') === 1070 && used(ses, 'Ctrl+Y') },
    ], solution: 'Ctrl+Home Right Right Down "0" Enter Ctrl+Z Ctrl+Y Ctrl+Z' },
  'copy-cut-paste': { title: 'Copy, cut, paste', task: 'Carry the headers down the page, then move the units line.', secs: 45, state: 'S3c',
    goals: [
      { id: 'copy', text: 'Copy the headers C4:E4 with Ctrl+C and paste them over the week labels at C13 with Ctrl+V.', keys: 'Ctrl+Home Ctrl+↓ ×2 → ×2 Ctrl+Shift+→ Ctrl+C Ctrl+↓ Ctrl+V', requires: ['copy-cut-paste'],
        check: (s, ses) => val(ses, 'Report', 'C13') === 'kWh sold' && val(ses, 'Report', 'E13') === 'Energy cost ($)' && used(ses, 'Ctrl+V') },
      { id: 'cut', text: 'Move the units line: cut A2 with Ctrl+X and paste it one row down, on A3.', keys: 'Ctrl+Home ↓ Ctrl+X ↓ Ctrl+V', requires: ['copy-cut-paste'],
        check: (s, ses) => val(ses, 'Report', 'A3') === 'USD unless stated' && !val(ses, 'Report', 'A2') && used(ses, 'Ctrl+X') },
    ], solution: 'Ctrl+Home Ctrl+Down Ctrl+Down Right Right Ctrl+Shift+Right Ctrl+C Ctrl+Down Ctrl+V Ctrl+Home Down Ctrl+X Down Ctrl+V' },
  'fill-down-right': { title: 'Fill right', task: 'Correct one label and push it across the row.', secs: 35, state: 'S3c',
    goals: [
      { id: 'right', text: 'Retype B13 as w/c 15 Sep, then select B13:G13 and Ctrl+R fills the row from it.', keys: 'Ctrl+Home Ctrl+↓ ×4 ↓ → "w/c 15 Sep" ↵ ↑ Ctrl+Shift+→ Ctrl+R', requires: ['fill-down-right'],
        check: (s, ses) => ['B', 'C', 'D', 'E', 'F', 'G'].every(c => val(ses, 'Report', c + '13') === THIS_WEEK) && used(ses, 'Ctrl+R') },
    ], solution: 'Ctrl+Home Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Down Right "w/c 15 Sep" Enter Up Ctrl+Shift+Right Ctrl+R' },
  'paste-special': { title: 'Values, not formulas', task: 'Freeze the total row as numbers in place.', secs: 40, state: 'S3e',
    goals: [
      { id: 'values', text: 'Copy the totals C10:E10, then Paste Special › Values over themselves (Ctrl+Alt+V, V, Enter): the SUMs become plain numbers.', keys: 'Ctrl+Home Ctrl+↓ ×3 → ×2 Ctrl+Shift+→ Ctrl+C Ctrl+Alt+V V ↵', requires: ['paste-special'],
        check: (s, ses) => { const c = cell(ses, 'Report', 'C10'), e = cell(ses, 'Report', 'E10'); return !!c && !c.formula && Math.abs(c.value - 38390) < 1e-6 && !!e && !e.formula && Math.abs(e.value - 4586.4) < 1e-6 && used(ses, 'Ctrl+Alt+V'); } },
    ], solution: 'Ctrl+Home Ctrl+Down Ctrl+Down Ctrl+Down Right Right Ctrl+Shift+Right Ctrl+C Ctrl+Alt+V V Enter' },
  'replace-all': { title: 'Replace All', task: 'Swap last week’s label for this week’s everywhere on the page in one go.', secs: 35, state: 'S3c',
    goals: [
      { id: 'all', text: 'Ctrl+H: find w/c 08 Sep, replace with w/c 15 Sep, Replace All (Alt+A), then Esc — eleven cells change.', keys: 'Ctrl+H "w/c 08 Sep" Tab "w/c 15 Sep" Alt+A Esc', requires: ['replace-all'],
        check: (s, ses) => [5, 6, 7, 8, 9].every(r => val(ses, 'Report', 'B' + r) === THIS_WEEK) && ['B', 'C', 'D', 'E', 'F', 'G'].every(c => val(ses, 'Report', c + '13') === THIS_WEEK) },
    ], solution: 'Ctrl+H "w/c 08 Sep" Tab "w/c 15 Sep" Alt+A Escape' },
  'fill-series': { title: 'Mon to Sat', task: 'Type one day and let Fill Series write the rest.', secs: 40, state: 'S3d',
    goals: [
      { id: 'series', text: 'Type Mon in B14, select B14:G14 and Fill Series (Alt H F I S, Enter): the row reads Mon to Sat.', keys: 'Ctrl+Home Ctrl+↓ ×4 ↓ ×2 → "Mon" ↵ ↑ Shift+→ ×5 then Alt H F I S ↵', requires: ['fill-series'],
        check: (s, ses) => val(ses, 'Report', 'B14') === 'Mon' && val(ses, 'Report', 'C14') === 'Tue' && val(ses, 'Report', 'G14') === 'Sat' },
    ], solution: 'Ctrl+Home Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Down Down Right "Mon" Enter Up Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Alt H F I S Enter' },
  /* ---------------- 1.4 structure ---------------- */
  'insert-delete-rows': { title: 'A row in, a row out', task: 'Insert a row inside the site block and watch the total follow; then take it out.', secs: 40, state: 'S4c',
    goals: [
      { id: 'insert', text: 'Select Cedar Park’s row 9 and insert a row above it with Ctrl+Shift+=: the Total moves to row 12 and still sums C5:C11.', keys: 'Ctrl+Home Ctrl+↓ ×3 ↑ ×2 Shift+Space Ctrl+Shift+=', requires: ['insert-delete-rows'],
        check: (s, ses) => { const c = cell(ses, 'Report', 'C12'); return !!c && c.formula === '=SUM(C5:C11)' && val(ses, 'Report', 'A10') === 'Cedar Park' && used(ses, 'Ctrl+Shift+='); } },
      { id: 'delete', text: 'Delete the blank row again with Ctrl+-: the Total is back on row 11, summing C5:C10.', keys: 'Ctrl+-', requires: ['insert-delete-rows'],
        check: (s, ses) => { const c = cell(ses, 'Report', 'C11'); return !!c && c.formula === '=SUM(C5:C10)' && val(ses, 'Report', 'A9') === 'Cedar Park' && used(ses, 'Ctrl+-'); } },
    ], solution: 'Ctrl+Home Ctrl+Down Ctrl+Down Ctrl+Down Up Up Shift+Space Ctrl+Shift+= Ctrl+-' },
  'ref-error': { title: '#REF! and back', task: 'Delete a row a formula depends on, read the error, heal it with undo.', secs: 40, state: 'S3e',
    goals: [
      { id: 'break', text: 'On Inputs, delete the wholesale price row 4 with Ctrl+-: the energy bill formula below now shows #REF!.', keys: 'Ctrl+PgDn ×2 Ctrl+Home ↓ ×3 Shift+Space Ctrl+-', requires: ['ref-error'],
        check: (s, ses) => { const c = cell(ses, 'Inputs', 'B13'); return !!c && String(c.formula || '').includes('#REF!') && used(ses, 'Ctrl+-'); } },
      { id: 'heal', text: 'Ctrl+Z puts the row back and the bill reads =B6*B4 again.', keys: 'Ctrl+Z', requires: ['undo-redo'],
        check: (s, ses) => { const c = cell(ses, 'Inputs', 'B14'); return !!c && c.formula === '=B6*B4' && val(ses, 'Inputs', 'B4') === 0.13 && used(ses, 'Ctrl+Z'); } },
    ], solution: 'Ctrl+PgDn Ctrl+PgDn Ctrl+Home Down Down Down Shift+Space Ctrl+- Ctrl+Z' },
  'column-width': { title: 'Set a width', task: 'Give the Site column a width you choose.', secs: 30, state: 'S4c',
    goals: [
      { id: 'width', text: 'Select column A and set Column Width (Alt H O W) to 16.', keys: 'Ctrl+Home Ctrl+Space Alt H O W "16" ↵', requires: ['column-width'],
        check: (s, ses) => { const sh = report(ses); return !!sh && sh.colW[1] === 16 * 7 + 5; } },
    ], solution: 'Ctrl+Home Ctrl+Space Alt H O W "16" Enter' },
  'autofit': { title: 'AutoFit', task: 'Let the column size itself to its longest entry.', secs: 30, state: 'S4c',
    goals: [
      { id: 'fit', text: 'Select column A and AutoFit it (Alt H O I): it opens out to the title’s full length.', keys: 'Ctrl+Home Ctrl+Space Alt H O I', requires: ['autofit'],
        check: (s, ses) => { const sh = report(ses); return !!sh && sh.colW[1] > 200; } },
    ], solution: 'Ctrl+Home Ctrl+Space Alt H O I' },
  'wrap-text': { title: 'Wrap a header', task: 'Make a long header wrap inside its column.', secs: 30, state: 'S3e',
    goals: [
      { id: 'wrap', text: 'Land on the Revenue ($) header D4 and wrap it with Alt H W.', keys: 'Ctrl+Home Ctrl+↓ ×2 → ×3 Alt H W', requires: ['wrap-text'],
        check: (s, ses) => { const c = cell(ses, 'Report', 'D4'); return !!c && c.wrap === true; } },
    ], solution: 'Ctrl+Home Ctrl+Down Ctrl+Down Right Right Right Alt H W' },
  'hide-unhide': { title: 'Hide, then unhide', task: 'Hide two columns the way most people do, then bring them back.', secs: 40, state: 'S3e',
    goals: [
      { id: 'hide', text: 'Select columns E:F and hide them with Ctrl+0.', keys: '→ ×4 Ctrl+Space Shift+→ Ctrl+0', requires: ['hide-unhide'],
        check: (s, ses) => { const sh = report(ses); return !!sh && sh.hiddenCols.has(5) && sh.hiddenCols.has(6) && used(ses, 'Ctrl+0'); } },
      { id: 'unhide', text: 'Select across the gap, D:G, and unhide with Ctrl+Shift+).', keys: '→ Ctrl+Space Shift+← Ctrl+Shift+)', requires: ['hide-unhide'],
        check: (s, ses) => { const sh = report(ses); return !!sh && sh.hiddenCols.size === 0 && used(ses, 'Ctrl+Shift+)'); } },
    ], solution: 'Right Right Right Right Ctrl+Space Shift+Right Ctrl+0 Right Ctrl+Space Shift+Left Ctrl+Shift+)' },
  'group-ungroup': { title: 'Group, not hide', task: 'Fold two working columns behind an outline button, then ungroup them.', secs: 35, state: 'S3e',
    goals: [
      { id: 'group', text: 'Select columns E:F and group them with Alt+Shift+→: a button appears above the next column.', keys: '→ ×4 Ctrl+Space Shift+→ Alt+Shift+→', requires: ['group-ungroup'],
        check: (s, ses) => { const sh = report(ses); return !!sh && sh.groups.cols.length === 1 && sh.groups.cols[0].c1 === 5 && sh.groups.cols[0].c2 === 6 && used(ses, 'Alt+Shift+→'); } },
      { id: 'ungroup', text: 'With E:F still selected, Alt+Shift+← ungroups them.', keys: 'Alt+Shift+←', requires: ['group-ungroup'],
        check: (s, ses) => { const sh = report(ses); return !!sh && sh.groups.cols.length === 0 && used(ses, 'Alt+Shift+←'); } },
    ], solution: 'Right Right Right Right Ctrl+Space Shift+Right Alt+Shift+Right Alt+Shift+Left' },
  'freeze-panes': { title: 'Freeze the heads', task: 'Keep the header rows and the site column on screen while the page scrolls.', secs: 30, state: 'S3e',
    goals: [
      { id: 'freeze', text: 'Land on B5, the first cell below the headers and right of the sites, and Freeze Panes (Alt W F F).', keys: 'Ctrl+Home Ctrl+↓ ×2 ↓ → Alt W F F', requires: ['freeze-panes'],
        check: (s, ses) => { const sh = report(ses); return !!sh && sh.freeze.r === 4 && sh.freeze.c === 1; } },
      { id: 'unfreeze', text: 'Alt W F F again unfreezes them.', keys: 'Alt W F F', requires: ['freeze-panes'],
        check: (s, ses) => { const sh = report(ses); return !!sh && sh.freeze.r === 0 && sh.freeze.c === 0; } },
    ], solution: 'Ctrl+Home Ctrl+Down Ctrl+Down Down Right Alt W F F Alt W F F' },
  /* ---------------- 1.5 format ---------------- */
  'format-cells-dialog': { title: 'Format Cells', task: 'Give a column the comma format, no decimals, from the dialog.', secs: 30, state: 'S4c',
    goals: [
      { id: 'dialog', text: 'Select the kWh figures C5:C11 and, in Format Cells (Ctrl+1), pick the comma format with no decimals (N).', keys: 'Ctrl+Home Ctrl+↓ ×2 ↓ → ×2 Ctrl+Shift+↓ then Ctrl+1 N', requires: ['format-cells-dialog'],
        check: (s, ses) => [5, 6, 7, 8, 9, 10, 11].every(r => { const c = cell(ses, 'Report', 'C' + r); return c && c.fmtStyle === 'comma' && c.decimals === 0; }) && used(ses, 'Ctrl+1') },
    ], solution: 'Ctrl+Home Ctrl+Down Ctrl+Down Down Right Right Ctrl+Shift+Down Ctrl+1 N' },
  'number-formats': { title: 'The chord set', task: 'Comma, no decimals, on a block of figures in three presses.', secs: 35, state: 'S4c',
    goals: [
      { id: 'chord', text: 'Select D5:F11 and press Ctrl+Shift+1, then Alt H 9 twice: thousands separators, no decimals, negatives in parentheses.', keys: 'Ctrl+Home Ctrl+↓ ×2 ↓ → ×3 Ctrl+Shift+↓ Shift+→ ×2 Ctrl+Shift+1 then Alt H 9 then Alt H 9', requires: ['number-formats'],
        check: (s, ses) => ['D', 'E', 'F'].every(col => [5, 6, 7, 8, 9, 10, 11].every(r => { const c = cell(ses, 'Report', col + r); return c && c.fmtStyle === 'comma' && c.decimals === 0; })) && used(ses, 'Ctrl+Shift+!') },
    ], solution: 'Ctrl+Home Ctrl+Down Ctrl+Down Down Right Right Right Ctrl+Shift+Down Shift+Right Shift+Right Ctrl+Shift+1 Alt H 9 Alt H 9' },
  'borders-menu': { title: 'A top border', task: 'Give the total row a top border, the way the team marks a total.', secs: 30, state: 'S5a',
    goals: [
      { id: 'top', text: 'Select the whole total row 11 and give it a top border with Alt H B P — a border, never a grid.', keys: 'Ctrl+Home Ctrl+↓ ×3 Shift+Space then Alt H B P', requires: ['borders-menu'],
        check: (s, ses) => { const a = cell(ses, 'Report', 'A11'), c = cell(ses, 'Report', 'C11'); return !!a && a.bt === true && !!c && c.bt === true && !a.ball; } },
    ], solution: 'Ctrl+Home Ctrl+Down Ctrl+Down Ctrl+Down Shift+Space Alt H B P' },
  'center-across': { title: 'Center across, never merge', task: 'Center the title over the page without merging a single cell.', secs: 35, state: 'S5b',
    goals: [
      { id: 'ca', text: 'Select A1:I1 and center the title across the selection from Format Cells (Ctrl+1, A).', keys: 'Ctrl+Home ↓ ×3 Ctrl+→ ↑ ×3 Ctrl+Shift+← then Ctrl+1 A', requires: ['center-across'],
        check: (s, ses) => { const c = cell(ses, 'Report', 'A1'); return !!c && c.ca === 9; } },
    ], solution: 'Ctrl+Home Down Down Down Ctrl+Right Up Up Up Ctrl+Shift+Left Ctrl+1 A' },
  'f4-repeat': { title: 'Format once, F4 everywhere', task: 'Format one block, then repeat it on the next with a single key.', secs: 40, state: 'S5c',
    goals: [
      { id: 'first', text: 'On Costs, give B4:D8 the comma format with no decimals from Format Cells (Ctrl+1, N).', keys: 'Ctrl+PgDn ×3 Ctrl+Home Ctrl+↓ ↓ → Ctrl+Shift+↓ Shift+→ ×2 then Ctrl+1 N', requires: ['format-cells-dialog'],
        check: (s, ses) => ['B', 'C', 'D'].every(col => [4, 5, 6, 7, 8].every(r => { const c = cell(ses, 'Costs', col + r); return c && c.fmtStyle === 'comma' && c.decimals === 0; })) },
      { id: 'repeat', text: 'Select the total column E4:E8 and press F4: the same format lands in one press.', keys: '→ ×3 Ctrl+Shift+↓ F4', requires: ['f4-repeat'],
        check: (s, ses) => [4, 5, 6, 7, 8].every(r => { const c = cell(ses, 'Costs', 'E' + r); return c && c.fmtStyle === 'comma' && c.decimals === 0; }) && used(ses, 'F4') },
    ], solution: 'Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+Home Ctrl+Down Down Right Ctrl+Shift+Down Shift+Right Shift+Right Ctrl+1 N Right Right Right Ctrl+Shift+Down F4' },
  /* ---------------- 1.6 formulas ---------------- */
  'pointing': { title: 'Point, don’t type', task: 'Write a formula by pointing at its cells.', secs: 35, state: 'S5d',
    goals: [
      { id: 'point', text: 'In F5, write Domain’s gross profit as revenue less energy cost by pointing: =D5-E5.', keys: 'Ctrl+Home Ctrl+↓ ×2 ↓ Ctrl+→ → "=" ← ← "-" ← ↵', requires: ['pointing'],
        check: (s, ses) => { const c = cell(ses, 'Report', 'F5'); return !!c && c.formula === '=D5-E5'; } },
    ], solution: 'Ctrl+Home Ctrl+Down Ctrl+Down Down Ctrl+Right Right "=" Left Left "-" Left Enter' },
  'autosum': { title: 'AutoSum the block', task: 'Total every column of a block in one press.', secs: 35, state: 'S6a',
    goals: [
      { id: 'block', text: 'Select the figures C5:F10 and press Alt+=: the SUMs land in row 11, gross profit included.', keys: 'Ctrl+Home Ctrl+↓ ×2 ↓ → ×2 Ctrl+Shift+↓ Shift+↑ Shift+→ ×3 Alt+=', requires: ['autosum'],
        check: (s, ses) => { const c = cell(ses, 'Report', 'F11'); return !!c && c.formula === '=SUM(F5:F10)'; } },
    ], solution: 'Ctrl+Home Ctrl+Down Ctrl+Down Down Right Right Ctrl+Shift+Down Shift+Up Shift+Right Shift+Right Shift+Right Alt+=' },
  'sum-family': { title: 'AVERAGE and COUNT', task: 'Two of SUM’s family on the site block.', secs: 40, state: 'S6a',
    goals: [
      { id: 'avg', text: 'In B27, the average kWh per site: =AVERAGE(C5:C10).', keys: 'Ctrl+G "B27" ↵ "=AVERAGE(C5:C10)" ↵', requires: ['sum-family'],
        check: (s, ses) => { const c = cell(ses, 'Report', 'B27'); return !!c && /^=AVERAGE\(C5:C10\)$/i.test(c.formula || ''); } },
      { id: 'count', text: 'Under it in B28, how many sites carry a figure: =COUNT(C5:C10).', keys: '"=COUNT(C5:C10)" ↵', requires: ['sum-family'],
        check: (s, ses) => { const c = cell(ses, 'Report', 'B28'); return !!c && /^=COUNT\(C5:C10\)$/i.test(c.formula || ''); } },
    ], solution: 'Ctrl+G "B27" Enter "=AVERAGE(C5:C10)" Enter "=COUNT(C5:C10)" Enter' },
  'f4-anchor': { title: 'Anchor with F4', task: 'One formula whose anchors let it fill both ways.', secs: 45, state: 'S6b',
    goals: [
      { id: 'price', text: 'Type a price scenario, 0.12, in J4.', keys: 'Ctrl+Home ↓ ×3 Ctrl+→ → "0.12" ↵', requires: ['type-to-enter'],
        check: (s, ses) => val(ses, 'Report', 'J4') === 0.12 },
      { id: 'anchor', text: 'In J5, point at Domain’s kWh and the price, anchoring each with F4: =$C5*J$4.', keys: '"=" Ctrl+← Ctrl+← → ×2 F4 ×3 "*" ↑ F4 ×2 ↵', requires: ['f4-anchor'],
        check: (s, ses) => { const c = cell(ses, 'Report', 'J5'); return !!c && c.formula === '=$C5*J$4'; } },
    ], solution: 'Ctrl+Home Down Down Down Ctrl+Right Right "0.12" Enter "=" Ctrl+Left Ctrl+Left Right Right F4 F4 F4 "*" Up F4 F4 Enter' },
  'cross-sheet-ref': { title: 'Point across sheets', task: 'Link a figure on the Report to the feed by pointing on the other sheet.', secs: 45, state: 'S6c',
    goals: [
      { id: 'link', text: 'In C5, type = then Ctrl+PgDn to Raw, point at Domain’s kWh total I8 and press Enter: the Report reads =Raw!I8.', keys: 'Ctrl+Home Ctrl+↓ ×2 ↓ → ×2 "=" Ctrl+PgDn Ctrl+→ → ×2 Ctrl+↓ ×2 ↓ ×2 → ↵', requires: ['cross-sheet-ref'],
        check: (s, ses) => { const c = cell(ses, 'Report', 'C5'); return !!c && c.formula === '=Raw!I8' && used(ses, 'Ctrl+PgDn'); } },
    ], solution: 'Ctrl+Home Ctrl+Down Ctrl+Down Down Right Right "=" Ctrl+PgDn Ctrl+Right Right Right Ctrl+Down Ctrl+Down Down Down Right Enter' },
  'show-formulas': { title: 'Show the pattern', task: 'See every formula on the page at once, then put the figures back.', secs: 30, state: 'S6e',
    goals: [
      { id: 'on', text: 'Press Ctrl+` : the grid shows formulas instead of figures, and any typed number stands out.', keys: 'Ctrl+`', requires: ['show-formulas'],
        check: (s, ses) => !!ses.settings.showFormulas && used(ses, 'Ctrl+`') },
      { id: 'off', text: 'Press Ctrl+` again: the figures are back.', keys: 'Ctrl+`', requires: ['show-formulas'],
        check: (s, ses) => !ses.settings.showFormulas && used(ses, 'Ctrl+`') },
    ], solution: 'Ctrl+` Ctrl+`' },
  'formula-errors': { title: '#NAME? means a name', task: 'Read an error code and fix the formula behind it.', secs: 40, state: 'S6e', plant: { 'Costs!E6': { formula: '=SUMM(B6:D6)' } },
    goals: [
      { id: 'name', text: 'On Costs, E6 reads #NAME?: open it with F2 and fix SUMM to SUM.', keys: 'Ctrl+PgDn ×3 Ctrl+Home Ctrl+↓ ×2 ↑ ×2 Ctrl+→ F2 Home → ×4 ⌫ ↵', requires: ['formula-errors'],
        check: (s, ses) => { const c = cell(ses, 'Costs', 'E6'); return !!c && /^=SUM\(B6:D6\)$/i.test(c.formula || ''); } },
    ], solution: 'Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+Home Ctrl+Down Ctrl+Down Up Up Ctrl+Right F2 Home Right Right Right Right Backspace Enter' },
  /* ---------------- 1.7 present and audit ---------------- */
  'orientation': { title: 'Landscape', task: 'Turn the page sideways for a wide report.', secs: 30, state: 'S6f',
    goals: [
      { id: 'land', text: 'Set the page to landscape from the Page Layout tab: Alt P O L.', keys: 'Alt P O L', requires: ['orientation'],
        check: (s, ses) => ses.settings.pageSetup.orientation === 'landscape' },
    ], solution: 'Alt P O L' },
  'print-titles': { title: 'Rows to repeat', task: 'Keep the heads on every printed page.', secs: 30, state: 'S6f',
    goals: [
      { id: 'titles', text: 'Open Print Titles (Alt P I), type 1:4 as the rows to repeat at top, and press Enter.', keys: 'Alt P I "1:4" ↵', requires: ['print-titles'],
        check: (s, ses) => ses.settings.pageSetup.titlesRows === '$1:$4' },
    ], solution: 'Alt P I "1:4" Enter' },
  'check-cell': { title: 'A check that reads zero', task: 'Write one live difference that proves two figures agree.', secs: 40, state: 'S7a',
    goals: [
      { id: 'check', text: 'In B35, the sites less the total: =SUM(C5:C10)-C11 — it reads 0 when the page ties.', keys: 'Ctrl+G "B35" ↵ "=SUM(C5:C10)-C11" ↵', requires: ['check-cell'],
        check: (s, ses) => { const c = cell(ses, 'Report', 'B35'); const sh = report(ses); return !!c && /^=SUM\(C5:C10\)-C11$/i.test(c.formula || '') && !!sh && sh.value('B35') === 0; } },
    ], solution: 'Ctrl+G "B35" Enter "=SUM(C5:C10)-C11" Enter' },
};
