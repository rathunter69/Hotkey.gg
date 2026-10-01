// Chapter 1 · 1.3.3 — Copy, cut, paste, fill (clearcoat-weekly, S3b → S3c)
// The Report page is blank and the CFO wants its skeleton before the figures arrive. Nothing is
// typed twice: the figure headers already sit on Raw's totals block, the site list on Inputs, the
// reporting week on Inputs!B3. Copy them across, drop single pastes with Enter, let one label fill
// five site rows (Ctrl+D) and six day columns (Ctrl+R), and cut the feed's Notes block from under
// the 60 rows to beside them, so the feed ends where the data ends.
import { SITES, REPORT_TITLE, UNITS_LINE, STALE_WEEK, NOTES_BESIDE } from '../workbooks/clearcoat-weekly.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const cellIs = (ses, name, ref, fn) => { const sh = sheetOf(ses, name); return !!sh && fn(sh.cellAt(ref)); };
/** No marquee left: the workbook's one clipboard is empty (every sheet's `clipboard` accessor reads the Session's; `ses.clipboard` too in case the Session ever owns it directly). */
const noClip = ses => !ses.clipboard && !(ses.sheet && ses.sheet.clipboard);
/** Dashes normalised (em, en, hyphen) and spaces collapsed: the title is right whichever dash a keyboard offers. The solution types REPORT_TITLE exactly, so the replay lands S3c. */
const norm = v => String(v ?? '').replace(/[—–-]/g, '-').replace(/\s+/g, ' ').trim();

const HEADERS = ['Washes', 'Revenue ($)', 'Wash cost ($)'];   // Raw!I7:K7, bold, pasted onto C4:E4
const DAILY_LABELS = { A12: 'Washes by day', A13: 'Week', A14: 'Day', A15: 'Date' };
const DAY_COLS = ['B', 'C', 'D', 'E', 'F', 'G'];
const NOTE_ROWS = [64, 65, 66, 67, 68];   // the Notes block under the feed at S3b (five rows since 1.2.3's insert)
const NOTES_AT = NOTES_BESIDE + '1';      // where it goes: beside the feed, under the feed note

const headersOn = ses => { const sh = sheetOf(ses, 'Report'); return !!sh && HEADERS.every((h, i) => { const c = sh.cellAt(String.fromCharCode(67 + i) + '4'); return c.value === h && !!c.bold; }); };
const sitesAt = (ses, r0) => { const sh = sheetOf(ses, 'Report'); return !!sh && SITES.every((site, i) => sh.value('A' + (r0 + i)) === site); };
const weekDown = ses => { const sh = sheetOf(ses, 'Report'); return !!sh && [5, 6, 7, 8, 9].every(r => sh.value('B' + r) === STALE_WEEK); };
const weekAcross = ses => { const sh = sheetOf(ses, 'Report'); return !!sh && DAY_COLS.every(col => sh.value(col + '13') === STALE_WEEK); };
const labelsIn = ses => { const sh = sheetOf(ses, 'Report'); return !!sh && Object.entries(DAILY_LABELS).every(([ref, v]) => sh.value(ref) === v); };
/** The five note lines sit in J1:J5 in their order and A64:A68 are empty: cut and pasted, not copied. */
const notesMoved = (ses, notes) => {
  const sh = sheetOf(ses, 'Raw'); if (!sh) return false;
  const there = notes.every((v, i) => sh.value(NOTES_BESIDE + (1 + i)) === v);
  const gone = NOTE_ROWS.every(r => { const c = sh.cellAt('A' + r); return c.value == null && c.formula == null; });
  return there && gone;
};
/** What the Notes block said when the run began (read once from the starting sheet, so the grader never hardcodes the lines). */
const notesOf = ses => { if (!ses.notesText) { const sh = sheetOf(ses, 'Raw'); ses.notesText = sh ? NOTE_ROWS.map(r => sh.value('A' + r)) : []; } return ses.notesText; };

export default {
  id: 'copy-cut-paste-fill',
  chapter: 'foundations',
  section: 'Enter, edit, copy and fill',
  module: 'enter-edit-copy-fill',
  workbook: 'clearcoat-weekly',
  state: { before: 'S3b', after: 'S3c' },
  title: 'Copy, cut, paste, fill',
  difficulty: 'medium',
  tags: ['clipboard', 'fill', 'report'],
  access: 'free',
  minutes: 7,
  headline: 'Ctrl+C',
  conventions: ['E3', 'C1'],
  teaches: ['copy-cut-paste', 'paste-enter-drop', 'fill-down-right'],
  uses: ['type-to-enter', 'tab-commits', 'enter-commits', 'sheet-tabs', 'ctrl-arrow', 'shift-arrow', 'ctrl-shift-arrow', 'ctrl-home-end', 'home-key', 'go-to', 'sheet-reference', 'arrow-keys'],
  prerequisites: ['fix-it-in-place'],
  brief: 'Report is still blank and the CFO wants its skeleton before the figures arrive: title, units, headers, the site list and the week label, plus the feed’s Notes block moved beside the feed. Nothing gets typed twice: the headers already sit on Raw, the sites on Inputs, and one label fills five rows and six columns. Ctrl+C copies (the original stays), Ctrl+X cuts (the original moves), Ctrl+V pastes; Ctrl+D fills a selection down from its top row and Ctrl+R fills it right from its left column. The key is `Ctrl+C`.',
  goals: [
    { id: 'title-headers', text: `Title the page: type “${REPORT_TITLE}” in A1, USD unless stated in A2, Site and Week in A4:B4.`, keys: `"${REPORT_TITLE}" ↵ ↓ "${UNITS_LINE}" ↵ ↓ ×2 "Site" Tab "Week" ↵`, requires: ['type-to-enter', 'tab-commits', 'enter-commits'],
      check: (s, ses) => { notesOf(ses); return cellIs(ses, 'Report', 'A1', c => norm(c.value) === norm(REPORT_TITLE)) && cellIs(ses, 'Report', 'A2', c => c.value === UNITS_LINE)
        && cellIs(ses, 'Report', 'A4', c => c.value === 'Site') && cellIs(ses, 'Report', 'B4', c => c.value === 'Week') && !ses.editing; } },
    { id: 'paste-headers', teach: 'Ctrl+C copies the selection and leaves it where it was, Ctrl+X cuts it so the original goes blank when you paste; Ctrl+V pastes at the cursor, formats included; Esc drops the marquee, the moving border around what you copied. Copy the header row, do not retype it: retyping is where typos come from.', text: 'The feed’s totals block already carries the figure headers: copy Raw!I7:K7 and paste them onto C4:E4, then drop the marquee.', keys: 'Ctrl+G "Raw!I7" ↵ Shift+→ ×2 Ctrl+C Ctrl+PgUp ↑ → ×2 Ctrl+V Esc', requires: ['copy-cut-paste', 'go-to', 'sheet-reference', 'shift-arrow', 'sheet-tabs', 'arrow-keys'],
      check: (s, ses) => headersOn(ses) && noClip(ses) },
    { id: 'site-list', teach: 'After a copy, Enter pastes once and drops the marquee in the same press: the paste for a single destination. Five site names, one press.', text: 'The site list lives on Inputs: copy Inputs!A18:A22 and drop it under Site at A5 with Enter.', keys: 'Ctrl+PgDn ×2 Ctrl+↓ ×2 ↓ Ctrl+Shift+↓ Ctrl+C Ctrl+PgUp ×2 Ctrl+← ↓ ↵', requires: ['paste-enter-drop', 'copy-cut-paste', 'sheet-tabs', 'ctrl-arrow', 'ctrl-shift-arrow'], convention: 'C1',
      check: (s, ses) => sitesAt(ses, 5) && noClip(ses) },
    { id: 'week-down', teach: 'Ctrl+D fills the selection from its top row and Ctrl+R from its left column: one entry, filled, never retyped. Select from the cell that holds the value down through the cells that should.', text: 'Copy the reporting week from Inputs!B3 onto B5, then fill it down the five site rows B5:B9 with Ctrl+D.', keys: 'Ctrl+PgDn ×2 Ctrl+Home ↓ ×2 → Ctrl+C Ctrl+PgUp ×2 → ↵ Shift+↓ ×4 Ctrl+D', requires: ['fill-down-right', 'copy-cut-paste', 'paste-enter-drop', 'sheet-tabs', 'ctrl-home-end', 'shift-arrow'], convention: 'E3',
      check: (s, ses) => weekDown(ses) && windowKeys(ses).includes('Ctrl+D') },
    { id: 'daily-labels', text: 'Label the daily block below the table: Washes by day in A12, then Week, Day and Date in A13:A15.', keys: 'Ctrl+↓ Home ↓ ×3 "Washes by day" ↵ ↓ "Week" ↵ ↓ "Day" ↵ ↓ "Date" ↵', requires: ['type-to-enter', 'ctrl-arrow', 'home-key', 'arrow-keys'],
      check: (s, ses) => labelsIn(ses) && !ses.editing },
    { id: 'sites-again', text: 'The daily block needs the same five sites: copy A5:A9 and drop them at A16 with Enter.', keys: 'Ctrl+↑ ×2 Shift+↑ ×4 Ctrl+C Ctrl+↓ ×2 ↓ ↵', requires: ['copy-cut-paste', 'paste-enter-drop', 'ctrl-arrow', 'shift-arrow'],
      check: (s, ses) => sitesAt(ses, 16) && noClip(ses) },
    { id: 'week-across', text: 'The daily block’s Week row takes the same label: copy it from B9 to B13, then fill it right across B13:G13 with Ctrl+R.', keys: '→ Ctrl+↑ Ctrl+C ↓ ×4 ↵ Shift+→ ×5 Ctrl+R', slowRound: true, requires: ['fill-down-right', 'copy-cut-paste', 'paste-enter-drop', 'ctrl-arrow', 'shift-arrow'],
      check: (s, ses) => weekAcross(ses) && windowKeys(ses).includes('Ctrl+R') },
    { id: 'move-notes', text: `The Notes block sits under the feed where nobody reads it: cut Raw!A64:A68 and paste it beside the feed at ${NOTES_AT}.`, keys: 'Ctrl+PgDn Ctrl+End Home Ctrl+↑ Ctrl+Shift+↓ Ctrl+X Ctrl+Home Ctrl+→ ×2 → ×2 Ctrl+V', requires: ['copy-cut-paste', 'sheet-tabs', 'ctrl-home-end', 'home-key', 'ctrl-shift-arrow', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => notesMoved(ses, notesOf(ses)) && windowKeys(ses).includes('Ctrl+X') },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Raw!C8" Enter "300" Enter Ctrl+G "Raw!I8" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Change Domain’s Monday washes in Raw!C8 to 300 and watch Domain’s total in I8 answer.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C4:E4 carry the three bold figure headers', check: (s, ses) => headersOn(ses) },
    { text: 'A5:A9 and A16:A20 list the five sites', check: (s, ses) => sitesAt(ses, 5) && sitesAt(ses, 16) },
    { text: `B5:B9 and B13:G13 read ${STALE_WEEK}`, check: (s, ses) => weekDown(ses) && weekAcross(ses) },
    { text: `The Notes block sits at Raw!${NOTES_AT} and A64:A68 is clear`, check: (s, ses) => notesMoved(ses, notesOf(ses)) },
  ],
  closing: [
    'The headers came from Raw, the sites from Inputs, and one week label went down five rows and across six columns from a single copy, which is the habit: fill it, never retype it. Copy leaves the original where it was, and cut takes it with you.',
    'The Notes block now sits beside the feed, where a reader opening the file will find it. The feed itself now ends where the data ends.',
  ],
  solution: `"${REPORT_TITLE}" Enter Down "${UNITS_LINE}" Enter Down Down "Site" Tab "Week" Enter Ctrl+G "Raw!I7" Enter Shift+Right Shift+Right Ctrl+C Ctrl+PgUp Up Right Right Ctrl+V Escape Ctrl+PgDn Ctrl+PgDn Ctrl+Down Ctrl+Down Down Ctrl+Shift+Down Ctrl+C Ctrl+PgUp Ctrl+PgUp Ctrl+Left Down Enter Ctrl+PgDn Ctrl+PgDn Ctrl+Home Down Down Right Ctrl+C Ctrl+PgUp Ctrl+PgUp Right Enter Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Ctrl+Down Home Down Down Down "Washes by day" Enter Down "Week" Enter Down "Day" Enter Down "Date" Enter Ctrl+Up Ctrl+Up Shift+Up Shift+Up Shift+Up Shift+Up Ctrl+C Ctrl+Down Ctrl+Down Down Enter Right Ctrl+Up Ctrl+C Down Down Down Down Enter Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+R Ctrl+PgDn Ctrl+End Home Ctrl+Up Ctrl+Shift+Down Ctrl+X Ctrl+Home Ctrl+Right Ctrl+Right Right Right Ctrl+V`,
};
