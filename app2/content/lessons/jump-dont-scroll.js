// Chapter 1 · 1.2.1 — Jump, don't scroll (clearcoat-weekly, S1d → S1d)
// The CFO's five questions about the feed; each answer is a cell, and each trip is a jump, never
// a scroll: Ctrl and an arrow (and where it stops), Ctrl+End, Home, the page keys, and Go To for a
// far cell you can name. The sheets are untouched. The learner-facing words live in content/copy/*.csv.
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;

export default {
  id: 'jump-dont-scroll',
  chapter: 'foundations',
  section: 'Move and select',
  module: 'move-and-select',
  workbook: 'clearcoat-weekly',
  state: { before: 'S1d', after: 'S1d' },
  title: 'Jump, don’t scroll',
  difficulty: 'easy',
  tags: ['navigation'],
  access: 'free',
  minutes: 5,
  headline: 'Ctrl+↓',
  conventions: ['A5'],
  teaches: ['home-key', 'page-keys', 'go-to', 'sheet-reference'],
  uses: ['ctrl-arrow', 'ctrl-home-end', 'sheet-tabs', 'name-box'],
  prerequisites: ['challenge-inherited-file'],
  brief: 'The CFO has five questions about the feed, and every answer is a cell. Ctrl and an arrow key jumps to the edge of the data, and it stops at a gap, which is how you find a missing figure in a sixty-row feed without reading it. Ctrl+End goes to the last used cell on the sheet, Home snaps to column A, and Page Down moves a screen at a time when you want to read rather than reach. Nobody who does this for a living scrolls. The key is `Ctrl+↓`.',
  goals: [
    { id: 'to-raw', teach: 'Ctrl+PgDn walks the tabs to the right, Ctrl+PgUp to the left; Raw is the second tab, the feed the managers’ numbers were pasted into.', text: 'The questions are about the feed: move to Raw.', keys: 'Ctrl+PgDn', requires: ['sheet-tabs'],
      check: (s, ses) => onSheet(ses, 'Raw') },
    { id: 'last-row', teach: 'From A1, Ctrl+↓ lands on the last filled cell in the column, and the Name Box reads A61: sixty rows of data, five sites, twelve days each.', text: '"How many days came through?" is answered by the last date, so jump to it with Ctrl+↓.', keys: 'Ctrl+↓', requires: ['ctrl-arrow', 'name-box'],
      check: (s, ses) => at(s, 'A61') && windowKeys(ses).includes('Ctrl+↓') },
    { id: 'last-col', teach: 'Ctrl+Home, then Ctrl+→ runs along the header row to the last filled column: six columns, Date, Site, Washes, Avg ticket, Revenue, Wash cost.', text: '"Which columns did the managers send?" is the header row, so go back to the top and along the headers to F1.', keys: 'Ctrl+Home then Ctrl+→', requires: ['ctrl-arrow', 'ctrl-home-end'],
      check: (s, ses) => at(s, 'F1') && windowKeys(ses).includes('Ctrl+→') },
    { id: 'first-gap', teach: 'A jump stops where the data stops, so a gap in a column shows up as a jump that lands early; that’s how you find a missing figure without reading sixty rows.', text: '"Is every wash cost in?" takes Ctrl+↓ down column F, and the jump stops at F11, right above the first missing figure.', keys: 'Ctrl+↓', requires: ['ctrl-arrow'],
      check: (s, ses) => at(s, 'F11') && windowKeys(ses).includes('Ctrl+↓') },
    { id: 'notes', teach: 'Ctrl+End jumps to the sheet’s last used cell, and Home snaps to column A of the row you’re on; anything below the data is where a reader finds surprises, so look before you send.', text: '"Anything below the feed?" takes Ctrl+End to the far corner, then Home, then up to the Notes header in A64.', keys: 'Ctrl+End Home ↑ ×3', requires: ['ctrl-home-end', 'home-key'],
      check: (s, ses) => at(s, 'A64') && windowKeys(ses).includes('Ctrl+End') && windowKeys(ses).includes('Home') },
    { id: 'pages', teach: 'PgDn and PgUp move a screen at a time, for reading through, not for reaching a cell; on a Mac that’s fn+↓ and fn+↑.', text: 'Skim the feed a screen at a time: one PgUp, one PgDn.', keys: 'PgUp then PgDn', requires: ['page-keys'],
      check: (s, ses) => windowKeys(ses).includes('PageUp') && windowKeys(ses).includes('PageDown') },
    { id: 'top', teach: 'Ctrl+Home from anywhere; the answer sheet: sixty days, six columns, missing wash costs starting at F12, a note at A64.', text: 'Back to the top for the next job: Ctrl+Home.', keys: 'Ctrl+Home', requires: ['ctrl-home-end'],
      check: (s, ses) => at(s, 'A1') && windowKeys(ses).includes('Ctrl+Home') },
    { id: 'go-to', teach: 'Ctrl+G opens Go To: a cell address, or Sheet!Cell for another sheet, and Enter lands you on it; for a far cell you can name, it’s one press.', text: 'For a cell you can name, press Ctrl+G, type Costs!B7 and Enter, and you land on South Lamar’s rent figure two sheets away.', keys: 'Ctrl+G "Costs!B7" ↵', requires: ['go-to', 'sheet-reference'],
      check: (s, ses) => onSheet(ses, 'Costs') && at(s, 'B7') && windowKeys(ses).includes('Ctrl+G') },
  ],
  wow: 'Five questions answered, and you never scrolled once.',
  closing: [
    'Ctrl and an arrow goes to the edge of the data and stops at a gap; Ctrl+End finds the bottom of everything; Home and Ctrl+Home bring you back. Those keys answer most questions about a feed before anyone opens it properly.',
    'The missing wash costs in column F are the first thing you’ll fix in module 1.3.',
  ],
  solution: 'Ctrl+PgDn Ctrl+Down Ctrl+Home Ctrl+Right Ctrl+Down Ctrl+End Home Up Up Up PgUp PgDn Ctrl+Home Ctrl+G "Costs!B7" Enter',
};
