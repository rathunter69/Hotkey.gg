// Chapter 1 · 1.2.3 — Around the workbook (voltline-weekly, S1d → S1d)
// Go To for the cases it is for: far-off cells and other sheets, always by name. Near targets
// stay on Ctrl+Arrow (framework §6). Nothing on the sheets changes.
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;

export default {
  id: 'around-the-workbook',
  chapter: 'foundations',
  section: 'Move and select',
  module: 'move-and-select',
  workbook: 'voltline-weekly',
  state: { before: 'S1d', after: 'S1d' },
  title: 'Around the workbook',
  difficulty: 'easy',
  tags: ['navigation', 'workbook'],
  access: 'free',
  minutes: 5,
  headline: 'Ctrl+G',
  conventions: ['A5'],
  teaches: ['go-to', 'sheet-reference'],
  uses: ['sheet-tabs', 'name-box'],
  prerequisites: ['select-like-you-mean-it'],
  brief: 'Four sheets, one question at a time, and some answers live a sheet away. For a far-off or cross-sheet target you name the cell and go — that is the one honest use of `Ctrl+G`.',
  goals: [
    { id: 'tabs', text: 'Warm up the tab keys: Ctrl+PgDn to Costs at the end, Ctrl+PgUp back to Report.', keys: 'Ctrl+PgDn ×3 then Ctrl+PgUp ×3', requires: ['sheet-tabs'],
      check: (s, ses) => onSheet(ses, 'Report') && windowKeys(ses).includes('Ctrl+PgDn') && windowKeys(ses).includes('Ctrl+PgUp') },
    { id: 'far-cell', teach: 'Ctrl+G (or F5) jumps to anything you can name — its job is far-off or cross-sheet targets, never the next cell over.', text: 'Management asks about the Airport Saturday: land on Raw!F61 in one jump.', keys: 'Ctrl+G "Raw!F61" ↵', requires: ['go-to'], convention: 'A5',
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'F61') && windowKeys(ses).includes('Ctrl+G') },
    { id: 'far-range', teach: 'A sheet-qualified reference — Costs!A3:E8 — names the sheet, an exclamation mark, then the cell or range.', text: 'Select the whole Costs table by address: Costs!A3:E8.', keys: 'Ctrl+G "Costs!A3:E8" ↵', requires: ['sheet-reference'],
      check: (s, ses) => onSheet(ses, 'Costs') && s.selectionText() === 'A3:E8' },
    { id: 'cross-back', text: 'Hop home to Report on the tab keys, then land straight back on Costs!B7 in one jump.', keys: 'Ctrl+PgUp ×3 then Ctrl+G "Costs!B7" ↵', requires: ['go-to', 'sheet-reference'],
      check: (s, ses) => onSheet(ses, 'Costs') && at(s, 'B7') },
    { id: 'home-again', text: 'Finish on the report page: Report!A1, one jump.', keys: 'Ctrl+G "Report!A1" ↵', requires: ['go-to', 'sheet-reference'],
      check: (s, ses) => onSheet(ses, 'Report') && at(s, 'A1') },
  ],
  solution: 'Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+PgUp Ctrl+PgUp Ctrl+PgUp Ctrl+G "Raw!F61" Enter Ctrl+G "Costs!A3:E8" Enter Ctrl+PgUp Ctrl+PgUp Ctrl+PgUp Ctrl+G "Costs!B7" Enter Ctrl+G "Report!A1" Enter',
};
