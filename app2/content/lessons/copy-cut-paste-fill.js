// Chapter 1 · 1.3.3 — Copy, cut, paste, fill (voltline-weekly, S3b → S3c)
// The Report page is blank and the associate wants its skeleton before the figures arrive. Nothing
// is typed twice: the figure headers already sit on Raw's totals block, the site list on Inputs,
// the reporting week on Inputs!B3 — copy them across, drop single pastes with Enter, and let one
// label fill five site rows (Ctrl+D) and six day columns (Ctrl+R). The feed's Notes block is cut
// from under the 60 rows to beside them, so the feed's block ends where the data ends.
import { SITES, REPORT_TITLE, UNITS_LINE } from '../workbooks/voltline-weekly.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const cellIs = (ses, name, ref, fn) => { const sh = sheetOf(ses, name); return !!sh && fn(sh.cellAt(ref)); };
/** No marquee left: the workbook's one clipboard is empty. Session.wireSheet exposes it through every sheet's `clipboard`
 *  accessor, so the active sheet's field is the workbook's; `ses.clipboard` is read too in case the Session ever owns it directly. */
const noClip = ses => !ses.clipboard && !(ses.sheet && ses.sheet.clipboard);
/** Dashes normalised (em, en, hyphen → '-') and spaces collapsed: a learner cannot type an em dash on every keyboard, and the
 *  title is right whichever dash they reach. The solution still types REPORT_TITLE exactly, so the replay lands S3c. */
const norm = v => String(v ?? '').replace(/[—–-]/g, '-').replace(/\s+/g, ' ').trim();

const HEADERS = ['kWh sold', 'Revenue ($)', 'Energy cost ($)'];   // Raw!I7:K7, bold — pasted onto C4:E4
const STALE_WEEK = 'w/c 08 Sep';   // the reporting week still on Inputs!B3 (1.3.5 replaces it everywhere)
const DAILY_LABELS = { A12: 'kWh sold by day', A13: 'Week', A14: 'Day', A15: 'Date' };
const NOTES = ['Notes', 'w/c 08 Sep feed checked — EA', 'Airport Saturday missing from feed', 'prices per site tariff card'];   // Raw!A64:A67 at S3b
const DAY_COLS = ['B', 'C', 'D', 'E', 'F', 'G'];

const headersOn = ses => { const sh = sheetOf(ses, 'Report'); return !!sh && HEADERS.every((h, i) => { const c = sh.cellAt(String.fromCharCode(67 + i) + '4'); return c.value === h && !!c.bold; }); };
const sitesAt = (ses, r0) => { const sh = sheetOf(ses, 'Report'); return !!sh && SITES.every((site, i) => sh.value('A' + (r0 + i)) === site); };
const weekDown = ses => { const sh = sheetOf(ses, 'Report'); return !!sh && [5, 6, 7, 8, 9].every(r => sh.value('B' + r) === STALE_WEEK); };
const weekAcross = ses => { const sh = sheetOf(ses, 'Report'); return !!sh && DAY_COLS.every(col => sh.value(col + '13') === STALE_WEEK); };
const labelsIn = ses => { const sh = sheetOf(ses, 'Report'); return !!sh && Object.entries(DAILY_LABELS).every(([ref, v]) => sh.value(ref) === v); };
const notesMoved = ses => {
  const sh = sheetOf(ses, 'Raw'); if (!sh) return false;
  const there = NOTES.every((v, i) => sh.value('H' + (1 + i)) === v) && !!sh.cellAt('H1').bold;
  const gone = [64, 65, 66, 67].every(r => { const c = sh.cellAt('A' + r); return c.value == null && c.formula == null; });
  return there && gone;
};

export default {
  id: 'copy-cut-paste-fill',
  chapter: 'foundations',
  section: 'Enter, edit, copy and fill',
  module: 'enter-edit-copy-fill',
  workbook: 'voltline-weekly',
  state: { before: 'S3b', after: 'S3c' },
  title: 'Copy, cut, paste, fill',
  difficulty: 'medium',
  tags: ['clipboard', 'fill', 'report'],
  access: 'free',
  minutes: 6,
  headline: 'Ctrl+C',
  conventions: ['E3', 'C1'],
  teaches: ['copy-cut-paste', 'paste-enter-drop', 'fill-down-right'],
  uses: ['type-to-enter', 'tab-commits', 'enter-tab-direction', 'sheet-tabs', 'ctrl-arrow', 'shift-arrow', 'ctrl-shift-arrow', 'ctrl-home-end', 'home-key', 'go-to', 'sheet-reference'],
  prerequisites: ['fix-it-in-place'],
  brief: 'Report is still blank and the associate wants its skeleton before the figures arrive: title, units, headers, the site list and the week label, plus the feed’s Notes block moved beside the feed. Nothing is typed twice — the headers already sit on Raw, the sites on Inputs, and one label fills five rows and six columns. The key is `Ctrl+C`.',
  goals: [
    { id: 'title-headers', text: `Title the page: “${REPORT_TITLE}” in A1, “${UNITS_LINE}” in A2, then Site and Week in A4:B4.`, keys: `"${REPORT_TITLE}" ↵ "${UNITS_LINE}" ↵ ↓ "Site" Tab "Week" ↵`, requires: ['type-to-enter', 'tab-commits', 'enter-tab-direction'],
      check: (s, ses) => cellIs(ses, 'Report', 'A1', c => norm(c.value) === norm(REPORT_TITLE)) && cellIs(ses, 'Report', 'A2', c => c.value === UNITS_LINE)
        && cellIs(ses, 'Report', 'A4', c => c.value === 'Site') && cellIs(ses, 'Report', 'B4', c => c.value === 'Week') },
    { id: 'paste-headers', teach: 'Ctrl+C copies and Ctrl+X cuts the selection; Ctrl+V pastes it at the cursor, formats included; Esc drops the marquee, the moving border around what you copied.', text: 'The feed’s totals block already carries the figure headers: copy Raw!I7:K7 and paste them onto C4:E4, then drop the marquee.', keys: 'Ctrl+G "Raw!I7" ↵ Shift+→ ×2 Ctrl+C Ctrl+PgUp ↑ → ×2 Ctrl+V Esc', requires: ['copy-cut-paste', 'go-to', 'sheet-reference', 'shift-arrow', 'sheet-tabs'],
      check: (s, ses) => headersOn(ses) && noClip(ses) },
    { id: 'site-list', teach: 'After a copy, Enter pastes once and drops the marquee in the same press — the paste for a single destination.', text: 'The site list lives on Inputs: copy Inputs!A9:A13 and drop it under Site at A5 with Enter.', keys: 'Ctrl+PgDn ×2 Ctrl+↓ ×2 ↓ Ctrl+Shift+↓ Shift+↑ Ctrl+C Ctrl+PgUp ×2 Ctrl+← ↓ ↵', requires: ['paste-enter-drop', 'copy-cut-paste', 'sheet-tabs', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow'], convention: 'C1',
      check: (s, ses) => sitesAt(ses, 5) && noClip(ses) },
    { id: 'week-down', teach: 'Ctrl+D fills the selection from its top row and Ctrl+R from its left column — one entry, filled, never retyped.', text: 'Copy the reporting week from Inputs!B3 onto B5, then fill it down the five site rows B5:B9 with Ctrl+D.', keys: 'Ctrl+PgDn ×2 Ctrl+Home ↓ ×2 → Ctrl+C Ctrl+PgUp ×2 → ↵ ← Ctrl+↓ → Ctrl+Shift+↑ Ctrl+D', requires: ['fill-down-right', 'copy-cut-paste', 'paste-enter-drop', 'sheet-tabs', 'ctrl-home-end', 'ctrl-arrow', 'ctrl-shift-arrow'], convention: 'E3',
      check: (s, ses) => weekDown(ses) && windowKeys(ses).includes('Ctrl+D') },
    { id: 'daily-labels', text: 'Label the daily block below the table: kWh sold by day in A12, then Week, Day and Date in A13:A15.', keys: 'Ctrl+← ↓ ×3 "kWh sold by day" ↵ "Week" ↵ "Day" ↵ "Date" ↵', requires: ['type-to-enter', 'ctrl-arrow'],
      check: (s, ses) => labelsIn(ses) },
    { id: 'sites-again', text: 'The daily block needs the same five sites: copy A5:A9 and drop them at A16 with Enter.', keys: 'Ctrl+Home Ctrl+↓ ×2 ↓ Ctrl+Shift+↓ Ctrl+C Ctrl+↓ ×3 ↓ ↵', requires: ['copy-cut-paste', 'paste-enter-drop', 'ctrl-home-end', 'ctrl-arrow', 'ctrl-shift-arrow'],
      check: (s, ses) => sitesAt(ses, 16) && noClip(ses) },
    { id: 'week-across', text: 'The daily block’s Week row takes the same label: copy it from B9 to B13, then fill it right across B13:G13 with Ctrl+R.', keys: 'Ctrl+↑ ×2 → Ctrl+C ← Ctrl+↓ ↓ → ↵ Shift+→ ×5 Ctrl+R', requires: ['fill-down-right', 'copy-cut-paste', 'paste-enter-drop', 'ctrl-arrow', 'shift-arrow'],
      check: (s, ses) => weekAcross(ses) && windowKeys(ses).includes('Ctrl+R') },
    { id: 'move-notes', text: 'The Notes block sits under the feed where nobody reads it: cut Raw!A64:A67 and paste it beside the feed at H1.', keys: 'Ctrl+PgDn Ctrl+End Home ↑ ×3 Ctrl+Shift+↓ Ctrl+X Ctrl+Home Ctrl+→ → ×2 Ctrl+V', requires: ['copy-cut-paste', 'sheet-tabs', 'ctrl-home-end', 'home-key', 'ctrl-shift-arrow', 'ctrl-arrow'],
      check: (s, ses) => notesMoved(ses) && windowKeys(ses).includes('Ctrl+X') },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Raw!C8" Enter "3000" Enter Ctrl+G "Raw!I8" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Domain’s Monday kWh in Raw!C8 change to 3,000 and Domain’s kWh total in I8 answer.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C4:E4 carry the three bold figure headers', check: (s, ses) => headersOn(ses) },
    { text: 'A5:A9 and A16:A20 list the five sites', check: (s, ses) => sitesAt(ses, 5) && sitesAt(ses, 16) },
    { text: 'B5:B9 and B13:G13 read w/c 08 Sep', check: (s, ses) => weekDown(ses) && weekAcross(ses) },
    { text: 'The Notes block sits at Raw!H1:H4 and A64:A67 is clear', check: (s, ses) => notesMoved(ses) },
  ],
  closing: [
    'The Report has its shape, and nothing on it was typed twice: the headers came from Raw, the sites from Inputs, and one week label went down five rows and across six columns from a single copy — fill, don’t retype (E3).',
    'The Notes block now sits beside the feed where a reader finds it, and the feed’s block ends where the data ends.',
  ],
  solution: `"${REPORT_TITLE}" Enter "${UNITS_LINE}" Enter Down "Site" Tab "Week" Enter Ctrl+G "Raw!I7" Enter Shift+Right Shift+Right Ctrl+C Ctrl+PgUp Up Right Right Ctrl+V Escape Ctrl+PgDn Ctrl+PgDn Ctrl+Down Ctrl+Down Down Ctrl+Shift+Down Shift+Up Ctrl+C Ctrl+PgUp Ctrl+PgUp Ctrl+Left Down Enter Ctrl+PgDn Ctrl+PgDn Ctrl+Home Down Down Right Ctrl+C Ctrl+PgUp Ctrl+PgUp Right Enter Left Ctrl+Down Right Ctrl+Shift+Up Ctrl+D Ctrl+Left Down Down Down "kWh sold by day" Enter "Week" Enter "Day" Enter "Date" Enter Ctrl+Home Ctrl+Down Ctrl+Down Down Ctrl+Shift+Down Ctrl+C Ctrl+Down Ctrl+Down Ctrl+Down Down Enter Ctrl+Up Ctrl+Up Right Ctrl+C Left Ctrl+Down Down Right Enter Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+R Ctrl+PgDn Ctrl+End Home Up Up Up Ctrl+Shift+Down Ctrl+X Ctrl+Home Ctrl+Right Right Right Ctrl+V`,
};
