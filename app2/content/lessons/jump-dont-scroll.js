// Chapter 1 · 1.2.1 — Jump, don't scroll (voltline-weekly, S1d → S1d)
// The associate asks five questions about the feed; each answer is a cell, and each trip is a
// jump, never a scroll. The sheet is untouched.
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;

export default {
  id: 'jump-dont-scroll',
  chapter: 'foundations',
  section: 'Move and select',
  module: 'move-and-select',
  workbook: 'voltline-weekly',
  state: { before: 'S1d', after: 'S1d' },
  title: 'Jump, don’t scroll',
  difficulty: 'easy',
  tags: ['navigation'],
  access: 'free',
  minutes: 5,
  headline: 'Ctrl+Arrow',
  conventions: ['A5'],
  teaches: ['home-key', 'page-keys'],
  uses: ['ctrl-arrow', 'ctrl-home-end', 'sheet-tabs'],
  prerequisites: ['colour-label-hardcode'],
  brief: 'The associate has five questions about the feed, and every answer is a cell. Analysts do not scroll to a cell — they jump, and the jump key is `Ctrl+↓`.',
  goals: [
    { id: 'to-raw', text: 'The questions are about the feed: move to Raw.', keys: 'Ctrl+PgDn', requires: ['sheet-tabs'],
      check: (s, ses) => onSheet(ses, 'Raw') },
    { id: 'last-row', text: '“How many days came through?” — jump to the last date with Ctrl+↓.', keys: 'Ctrl+↓', requires: ['ctrl-arrow'],
      check: (s, ses) => at(s, 'A61') && windowKeys(ses).includes('Ctrl+↓') },
    { id: 'last-col', text: '“Which columns does it carry?” — back to the top, then along the headers to F1.', keys: 'Ctrl+Home then Ctrl+→', requires: ['ctrl-arrow', 'ctrl-home-end'],
      check: (s, ses) => at(s, 'F1') && windowKeys(ses).includes('Ctrl+→') },
    { id: 'first-gap', text: '“Is every energy cost in?” — ride Ctrl+↓ down column F; it stops at F11, right above the first missing figure.', keys: 'Ctrl+↓', requires: ['ctrl-arrow'],
      check: (s, ses) => at(s, 'F11') && windowKeys(ses).includes('Ctrl+↓') },
    { id: 'notes', teach: 'Ctrl+End jumps to the sheet’s last used cell, and Home snaps to column A of the row you are on.', text: '“Anything below the feed?” — Ctrl+End to the far corner, Home, then up to the Notes header in A64.', keys: 'Ctrl+End Home ↑ ×3', requires: ['ctrl-home-end', 'home-key'],
      check: (s, ses) => at(s, 'A64') && windowKeys(ses).includes('Ctrl+End') && windowKeys(ses).includes('Home') },
    { id: 'pages', teach: 'PgDn and PgUp move a screen at a time — for reading through, not for reaching a cell.', text: 'Skim the feed a screen at a time: one PgUp, one PgDn.', keys: 'PgUp then PgDn', requires: ['page-keys'],
      check: (s, ses) => windowKeys(ses).includes('PageUp') && windowKeys(ses).includes('PageDown') },
    { id: 'top', text: 'Back to the top for the next job: Ctrl+Home.', keys: 'Ctrl+Home', requires: ['ctrl-home-end'],
      check: (s, ses) => at(s, 'A1') && windowKeys(ses).includes('Ctrl+Home') },
  ],
  solution: 'Ctrl+PgDn Ctrl+Down Ctrl+Home Ctrl+Right Ctrl+Down Ctrl+End Home Up Up Up PgUp PgDn Ctrl+Home',
};
