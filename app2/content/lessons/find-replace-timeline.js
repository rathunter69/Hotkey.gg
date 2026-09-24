// Chapter 1 · 1.3.5 — Find, replace, fill a timeline (voltline-weekly, S3d → S3e)
// The week label on the Report and on Inputs still reads last week's: Replace All swaps every
// match on the active sheet in one press and reports how many cells it touched; Ctrl+F lands on
// the one Airprot in the 60-row feed and a retype fixes it; Fill Series writes the daily table's
// Mon–Sat header from one seed and its dates from two. The Airport total beside the feed answers
// the closer.
import { rawRow } from '../workbooks/voltline-weekly.js';

const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
/** A workspace click the views recorded this run (ribbon-commands recordMouse: { t, what }); the session, and its mouse log, is fresh per run. */
const clicked = (ses, what) => !!ses.mouse && ses.mouse.log.some(e => e.what === what);
/** Replace All ran: Alt+A in this goal's key window, or the card's own Replace All button (recorded 'dialog:find'; this is the first goal, so the run's whole mouse log is its window). */
const replacedAll = ses => windowKeys(ses).includes('Alt+A') || clicked(ses, 'dialog:find');
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const settled = ses => !ses.editing && !ses.dialog;   // nothing half-typed, no card open

const STALE = 'w/c 08 Sep', CURRENT = 'w/c 15 Sep';
const WEEK_CELLS = ['B5', 'B6', 'B7', 'B8', 'B9', 'B13', 'C13', 'D13', 'E13', 'F13', 'G13'];   // the eleven week labels on the Report
/** No cell on the sheet still carries the stale label, in a value or a formula. */
const noStale = sh => Object.keys(sh.cells).every(k => {
  const c = sh.cells[k];
  return !(typeof c.value === 'string' && c.value.includes(STALE)) && !(typeof c.formula === 'string' && c.formula.includes(STALE));
});
const AIRPORT_ROWS = Array.from({ length: 12 }, (_, d) => rawRow('Airport', d));   // B50:B61 — every Airport row, not only the typo
const DAY_COLS = ['B', 'C', 'D', 'E', 'F', 'G'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FIRST_DATE = 15;
const dayHeaderIn = rep => DAY_COLS.every((col, i) => rep.value(col + '14') === DAYS[i]);
const datesIn = rep => DAY_COLS.every((col, i) => rep.value(col + '15') === FIRST_DATE + i && !rep.cellAt(col + '15').formula);
/** Fill Series was reached: the Alt, H, F, I, S walk inside this goal's key window, or a click on Home › Fill › Series… (recorded 'ribbon:HFIS'; no earlier goal uses Fill Series, so the run's mouse log is this goal's window). Typing the six names by hand does not count. */
const usedFillSeries = ses => windowKeys(ses).join(' ').includes('Alt H F I S') || clicked(ses, 'ribbon:HFIS');

export default {
  id: 'find-replace-timeline',
  chapter: 'foundations',
  section: 'Enter, edit, copy and fill',
  module: 'enter-edit-copy-fill',
  workbook: 'voltline-weekly',
  state: { before: 'S3d', after: 'S3e' },
  title: 'Find, replace, fill a timeline',
  difficulty: 'medium',
  tags: ['editing', 'find-replace', 'fill-series', 'report'],
  access: 'free',
  minutes: 6,
  headline: 'Ctrl+H',
  conventions: ['F5', 'C2'],
  teaches: ['replace-all', 'fill-series'],
  uses: ['find-replace', 'replace-by-typing', 'type-to-enter', 'tab-commits', 'enter-tab-direction', 'sheet-tabs', 'shift-arrow', 'ctrl-shift-arrow', 'ctrl-arrow', 'go-to'],
  prerequisites: ['paste-special-values'],
  brief: 'Last week’s label, w/c 08 Sep (week commencing), still sits in twelve cells across the Report and Inputs, one Airport row on the feed is spelled Airprot, and the daily table has no day header. Replace the label on the Report and on Inputs, reading the count each time, find and fix the typo, then let Fill Series write Mon–Sat and the dates. The key is `Ctrl+H`.',
  goals: [
    { id: 'replace-all-report', teach: 'Ctrl+H opens Replace: type what to find, Tab, what to put there, then Alt+A replaces every match on this sheet and reports how many cells changed.', text: 'Eleven cells on the Report still read w/c 08 Sep: swap every one for w/c 15 Sep with Replace All and read the count — eleven.', keys: 'Ctrl+H "w/c 08 Sep" Tab "w/c 15 Sep" Alt+A Esc', requires: ['find-replace', 'replace-all'], convention: 'F5',
      check: (s, ses) => { const rep = report(ses); return !!rep && WEEK_CELLS.every(r => rep.value(r) === CURRENT) && noStale(rep) && settled(ses) && replacedAll(ses); } },
    { id: 'replace-all-inputs', text: 'Replace All only touches the active sheet: move to Inputs and replace the stale week label in B3 the same way — the count reads one.', keys: 'Ctrl+PgDn ×2 Ctrl+H "w/c 08 Sep" Tab "w/c 15 Sep" Alt+A Esc', requires: ['sheet-tabs', 'find-replace', 'replace-all'],
      check: (s, ses) => { const inp = sheetOf(ses, 'Inputs'); return !!inp && inp.value('B3') === CURRENT && noStale(inp) && settled(ses); } },
    { id: 'find-airprot', text: 'One Airport row on the feed is spelled Airprot: move to Raw and find it with Ctrl+F.', keys: 'Ctrl+PgUp Ctrl+F "Airprot" ↵ Esc', requires: ['sheet-tabs', 'find-replace'],
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'B55') && settled(ses) },
    { id: 'retype-airport', text: 'Nothing in Airprot is worth keeping: type Airport over B55.', keys: '"Airport" ↵', requires: ['replace-by-typing', 'type-to-enter'],
      check: (s, ses) => { const raw = sheetOf(ses, 'Raw'); return !!raw && AIRPORT_ROWS.every(r => raw.value('B' + r) === 'Airport') && !ses.editing; } },
    { id: 'day-header', teach: 'Fill Series (Alt, H, F, I, S) continues the pattern your first cells set across the selection: Mon runs to Sat, 15 and 16 run on to 20.', text: 'Back on the Report, the daily table needs its day header: type Mon in B14, select B14:G14 and let Fill Series carry it to Sat.', keys: 'Ctrl+G "Report!B14" ↵ "Mon" ↵ ↑ ×2 Ctrl+→ ↓ Ctrl+Shift+← then Alt H F I S ↵', requires: ['go-to', 'type-to-enter', 'ctrl-arrow', 'ctrl-shift-arrow', 'fill-series'], convention: 'C2',
      check: (s, ses) => { const rep = report(ses); return !!rep && dayHeaderIn(rep) && settled(ses) && usedFillSeries(ses); } },
    { id: 'date-seeds', text: 'The dates go under the days: type the first two, 15 and 16, into B15 and C15 as a Tab run.', keys: 'Ctrl+← ↓ → "15" Tab "16" ↵', requires: ['ctrl-arrow', 'type-to-enter', 'tab-commits', 'enter-tab-direction'],
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.value('B15') === FIRST_DATE && rep.value('C15') === FIRST_DATE + 1 && !ses.editing; } },
    { id: 'date-series', text: 'Select B15:G15 and Fill Series carries 15 and 16 on to 20.', keys: '↑ ×2 Ctrl+→ ↓ Ctrl+Shift+← Shift+← then Alt H F I S ↵', requires: ['ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'fill-series'],
      check: (s, ses) => { const rep = report(ses); return !!rep && datesIn(rep) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Raw!C56" Enter "3000" Enter Ctrl+G "Raw!I12" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Airport’s Monday kWh in Raw’s C56 change to 3,000 and the Airport line of the site totals, I12, answer.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'No cell on the Report or Inputs still reads w/c 08 Sep', check: (s, ses) => { const rep = report(ses), inp = sheetOf(ses, 'Inputs'); return !!rep && !!inp && noStale(rep) && noStale(inp); } },
    { text: 'Every Airport row on Raw reads Airport', check: (s, ses) => { const raw = sheetOf(ses, 'Raw'); return !!raw && AIRPORT_ROWS.every(r => raw.value('B' + r) === 'Airport'); } },
    { text: 'B14:G14 read Mon to Sat and B15:G15 read 15 to 20', check: (s, ses) => { const rep = report(ses); return !!rep && dayHeaderIn(rep) && datesIn(rep); } },
  ],
  closing: [
    'The stale week label is gone from both sheets in two Replace Alls, and Excel reported how many cells it touched each time — read what it tells you (F5).',
    'The daily table now carries one timeline row: Mon to Sat with the dates under them, written as a series rather than typed six times (C2).',
  ],
  solution: 'Ctrl+H "w/c 08 Sep" Tab "w/c 15 Sep" Alt+A Escape Ctrl+PgDn Ctrl+PgDn Ctrl+H "w/c 08 Sep" Tab "w/c 15 Sep" Alt+A Escape Ctrl+PgUp Ctrl+F "Airprot" Enter Escape "Airport" Enter Ctrl+G "Report!B14" Enter "Mon" Enter Up Up Ctrl+Right Down Ctrl+Shift+Left Alt H F I S Enter Ctrl+Left Down Right "15" Tab "16" Enter Up Up Ctrl+Right Down Ctrl+Shift+Left Shift+Left Alt H F I S Enter',
};
