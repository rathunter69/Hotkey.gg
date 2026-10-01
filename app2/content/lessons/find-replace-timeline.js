// Chapter 1 · 1.3.5 — Names, notes and the small keys (clearcoat-weekly, S3d → S3e)
// The week label on the Report and on Inputs still reads last week's: Replace All swaps every match
// on the active sheet in one press and reports how many cells it touched. The cost per wash gets a
// name (Define Name) and a note with its source (Shift+F2), a date stamp lands beside it (Ctrl+;),
// Ctrl+Backspace brings the window back to the active cell after a scroll, and Fill Series writes the
// daily table's Mon to Sat from one seed and its dates from two. The Airport total answers the closer.
import { STALE_WEEK, THIS_WEEK, NAMES, COST_NOTE, CASE_TODAY } from '../workbooks/clearcoat-weekly.js';

const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
/** A workspace click the views recorded this run (ribbon-commands recordMouse: { t, what }); the session, and its mouse log, is fresh per run. */
const clicked = (ses, what) => !!ses.mouse && ses.mouse.log.some(e => e.what === what);
/** Replace All ran: Alt+A in this goal's key window, or the card's own Replace All button (recorded 'dialog:find'; this is the first goal, so the run's whole mouse log is its window). */
const replacedAll = ses => windowKeys(ses).includes('Alt+A') || clicked(ses, 'dialog:find');
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const inputs = ses => sheetOf(ses, 'Inputs');
const settled = ses => !ses.editing && !ses.dialog;   // nothing half-typed, no card open

const WEEK_CELLS = ['B5', 'B6', 'B7', 'B8', 'B9', 'B13', 'C13', 'D13', 'E13', 'F13', 'G13'];   // the eleven week labels on the Report
/** No cell on the sheet still carries the stale label, in a value or a formula. */
const noStale = sh => Object.keys(sh.cells).every(k => {
  const c = sh.cells[k];
  return !(typeof c.value === 'string' && c.value.includes(STALE_WEEK)) && !(typeof c.formula === 'string' && c.formula.includes(STALE_WEEK));
});
const NAME = 'CostPerWash';
/** The name points at Inputs!B4, however the learner anchored it. */
const named = ses => !!ses.names && String(ses.names[NAME] || '').replace(/\$/g, '').toUpperCase() === NAMES[NAME].replace(/\$/g, '').toUpperCase();
const DAY_COLS = ['B', 'C', 'D', 'E', 'F', 'G'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FIRST_DATE = 15;
const dayHeaderIn = rep => DAY_COLS.every((col, i) => rep.value(col + '14') === DAYS[i]);
const datesIn = rep => DAY_COLS.every((col, i) => rep.value(col + '15') === FIRST_DATE + i && !rep.cellAt(col + '15').formula);
/** Fill Series was reached: the Alt, H, F, I, S walk inside this goal's key window, or a click on Home › Fill › Series… (recorded 'ribbon:HFIS'). Typing the six names by hand does not count. */
const usedFillSeries = ses => windowKeys(ses).join(' ').includes('Alt H F I S') || clicked(ses, 'ribbon:HFIS');

export default {
  id: 'find-replace-timeline',
  chapter: 'foundations',
  section: 'Enter, edit, copy and fill',
  module: 'enter-edit-copy-fill',
  workbook: 'clearcoat-weekly',
  state: { before: 'S3d', after: 'S3e' },
  title: 'Names, notes and the small keys',
  difficulty: 'medium',
  tags: ['editing', 'find-replace', 'fill-series', 'names', 'report'],
  access: 'free',
  minutes: 8,
  headline: 'Ctrl+H',
  conventions: ['F5', 'C2', 'B6'],
  teaches: ['replace-all', 'defined-name', 'cell-note', 'date-stamp', 'scroll-to-active', 'fill-series'],
  uses: ['find-replace', 'type-to-enter', 'tab-commits', 'sheet-tabs', 'shift-arrow', 'ctrl-home-end', 'go-to', 'sheet-reference', 'page-keys', 'arrow-keys'],
  prerequisites: ['paste-special-values'],
  brief: 'A handful of small keys separate people who work in Excel from people who fight it. Replace All swaps every match on the active sheet in one press and tells you how many it touched, so read that number every time. A named cell can be jumped to and referenced by name; a note (Shift+F2) carries a source where it cannot be lost; Ctrl+; types today’s date; Ctrl+Backspace snaps the view back to the cell you are on; Fill Series writes a week from one day. None of these is a lesson on its own, and you will use all of them by Friday. The key is `Ctrl+H`.',
  goals: [
    { id: 'replace-all-report', teach: 'Ctrl+H opens Replace: type what to find, Tab, what to put there, then Alt+A replaces every match on this sheet and reports how many cells changed. If the count is not what you expected, Ctrl+Z and look.', text: `Eleven cells on the Report still read ${STALE_WEEK}: swap every one for ${THIS_WEEK} with Replace All and read the count, eleven.`, keys: `Ctrl+H "${STALE_WEEK}" Tab "${THIS_WEEK}" Alt+A Esc`, requires: ['find-replace', 'replace-all'], convention: 'F5',
      check: (s, ses) => { const rep = report(ses); return !!rep && WEEK_CELLS.every(r => rep.value(r) === THIS_WEEK) && noStale(rep) && settled(ses) && replacedAll(ses); } },
    { id: 'replace-all-inputs', text: 'Replace All only touches the active sheet: move to Inputs and replace the stale week label in B3 the same way, and the count reads one.', keys: `Ctrl+PgDn ×2 Ctrl+H "${STALE_WEEK}" Tab "${THIS_WEEK}" Alt+A Esc`, requires: ['sheet-tabs', 'find-replace', 'replace-all'],
      check: (s, ses) => { const inp = inputs(ses); return !!inp && inp.value('B3') === THIS_WEEK && noStale(inp) && settled(ses); } },
    { id: 'define-name', teach: 'A name is a label for a cell or a range that you can jump to (Ctrl+G, then the name) and write into a formula (=B6*CostPerWash) so it reads like English. Name a few key inputs and never everything; Chapter 4 sets out the rules for which.', text: `Name the cost per wash: on B4 open Define Name (Alt, M, M, D), type ${NAME}, Enter, then Ctrl+Home and jump back by name with Ctrl+G.`, keys: `Ctrl+Home → Ctrl+↓ ↓ then Alt M M D "${NAME}" ↵ then Ctrl+Home Ctrl+G "${NAME}" ↵`, requires: ['defined-name', 'go-to', 'ctrl-home-end', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => onSheet(ses, 'Inputs') && named(ses) && at(s, 'B4') && settled(ses) && windowKeys(ses).some(k => k === 'Ctrl+G' || k === 'F5') },
    { id: 'source-note', teach: 'Shift+F2 opens a note on the cell: a comment that travels with it, marked by a red corner. Best practice: every hardcode carries its source (a web link, a file path, a page number or a quote) in a note or in the next cell.', text: `Attach the source to the cell as a note: Shift+F2 on B4, type ${COST_NOTE}, then Esc to close it.`, keys: `Shift+F2 "${COST_NOTE}" Esc`, requires: ['cell-note'], convention: 'B6',
      check: (s, ses) => { const inp = inputs(ses); return !!inp && inp.cellAt('B4').cmt === COST_NOTE && settled(ses); } },
    { id: 'date-stamp', teach: 'Ctrl+; enters today’s date and Ctrl+Shift+; the time, as values that do not change tomorrow. An "as of" date beside a figure says when someone last looked.', text: 'Date the check: in D4 press Ctrl+; and Enter for today’s date, typed for you.', keys: '→ ×2 Ctrl+; ↵', requires: ['date-stamp', 'arrow-keys'],
      check: (s, ses) => { const inp = inputs(ses); return !!inp && inp.value('D4') === CASE_TODAY && !inp.cellAt('D4').formula && settled(ses); } },
    { id: 'snap-back', teach: 'Ctrl+Backspace scrolls the window back to the active cell without moving it. After you have paged down a long sheet to look at something, one press brings you home.', text: 'Scroll away with PgDn three times, then Ctrl+Backspace snaps the view back to the active cell.', keys: 'PgDn ×3 Ctrl+⌫', requires: ['scroll-to-active', 'page-keys'],
      check: (s, ses) => { const w = windowKeys(ses); return w.includes('PageDown') && w.includes('Ctrl+⌫') && settled(ses); } },
    { id: 'day-header', teach: 'Fill Series (Alt, H, F, I, S) opens the Series dialog, which starts on Linear; its AutoFill type (Alt+F) continues the pattern your first cells set across the selection, so Mon runs to Sat. Excel knows the days of the week and the months; for numbers it needs two to see the step.', text: 'Back on the Report, the daily table needs its day header: type Mon in B14, select B14:G14 and let Fill Series carry it to Sat.', keys: 'Ctrl+G "Report!B14" ↵ "Mon" ↵ Shift+→ ×5 then Alt H F I S Alt+F ↵', requires: ['fill-series', 'go-to', 'sheet-reference', 'type-to-enter', 'shift-arrow'], convention: 'C2',
      check: (s, ses) => { const rep = report(ses); return !!rep && dayHeaderIn(rep) && settled(ses) && usedFillSeries(ses); } },
    { id: 'date-series', text: 'The dates go under the days: type 15 and 16 into B15 and C15 as a Tab run, then select B15:G15 and Fill Series carries them on to 20.', keys: '↓ "15" Tab "16" ↵ ↑ Shift+→ ×5 then Alt H F I S ↵', requires: ['fill-series', 'type-to-enter', 'tab-commits', 'shift-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && datesIn(rep) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Raw!C56" Enter "300" Enter Ctrl+G "Raw!I12" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Change Airport’s Monday washes in Raw’s C56 to 300 and watch the Airport line of the site totals, I12, answer.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: `No cell on the Report or Inputs still reads ${STALE_WEEK}`, check: (s, ses) => { const rep = report(ses), inp = inputs(ses); return !!rep && !!inp && noStale(rep) && noStale(inp); } },
    { text: `${NAME} names Inputs!B4, which carries its source as a note, and D4 holds today’s date`, check: (s, ses) => { const inp = inputs(ses); return named(ses) && !!inp && inp.cellAt('B4').cmt === COST_NOTE && inp.value('D4') === CASE_TODAY; } },
    { text: 'B14:G14 read Mon to Sat and B15:G15 read 15 to 20', check: (s, ses) => { const rep = report(ses); return !!rep && dayHeaderIn(rep) && datesIn(rep); } },
  ],
  closing: [
    'Replace All only touches the active sheet, so it took one pass on the Report and one on Inputs, and Excel told you the count each time: eleven, then one.',
    'The cost per wash now has a name and a note, and the daily table carries a timeline: Mon to Sat with the dates under them, written as a series instead of typed six times.',
  ],
  solution: `Ctrl+H "${STALE_WEEK}" Tab "${THIS_WEEK}" Alt+A Escape Ctrl+PgDn Ctrl+PgDn Ctrl+H "${STALE_WEEK}" Tab "${THIS_WEEK}" Alt+A Escape Ctrl+Home Right Ctrl+Down Down Alt M M D "${NAME}" Enter Ctrl+Home Ctrl+G "${NAME}" Enter Shift+F2 "${COST_NOTE}" Escape Right Right Ctrl+; Enter PageDown PageDown PageDown Ctrl+Backspace Ctrl+G "Report!B14" Enter "Mon" Enter Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Alt H F I S Alt+F Enter Down "15" Tab "16" Enter Up Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Alt H F I S Enter`,
};
