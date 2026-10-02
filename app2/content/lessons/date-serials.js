// Chapter 3 · 3.2.1 Serial numbers: DATE, YEAR, MONTH, DAY (clearcoat-databook, S1d → S2a)
// On Sites the as-of date in I5 is read as its serial with Ctrl+Shift+~ and put back with Ctrl+Z.
// Age in days is an anchored subtraction (J), age in years divides by 365.25 (K), YEAR, MONTH and
// DAY take the opening date apart (L:N), DATE builds the first of the opening month (O) and the
// vintage is the opening year (P). Then the ages typed on Summary L5:L10 since 3.1.3 become green
// links to Sites!K. Graded on values and liveness. The closer moves the as-of date to year end.
import { liveness } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const same = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) < 1e-9 : a === b);
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const ROWS = [5, 6, 7, 8, 9, 10];
const at = (sh, ref) => sh.selectionText() === ref;
const on = (ses, name) => !!sheetOf(ses, name) && ses.sheet === sheetOf(ses, name);
/** A serial taken apart the way Excel's 1900 system does it (every date here is after March 1900). */
const parts = n => { const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(n) * 864e5); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; };
const serial = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 864e5);
const column = (sh, col, want) => ROWS.every(r => same(sh.value(col + r), want(sh, r))) && [5, 10].every(r => liveness(sh, col + r).ok);
const opened = (sh, r) => parts(sh.value('E' + r));
const days = sh => column(sh, 'J', (s, r) => s.value('I5') - s.value('E' + r));
const years = sh => column(sh, 'K', (s, r) => s.value('J' + r) / 365.25);
const apart = sh => column(sh, 'L', (s, r) => opened(s, r).y) && column(sh, 'M', (s, r) => opened(s, r).m) && column(sh, 'N', (s, r) => opened(s, r).d);
const firstOfMonth = sh => column(sh, 'O', (s, r) => serial(s.value('L' + r), s.value('M' + r), 1));
const vintage = sh => column(sh, 'P', (s, r) => opened(s, r).y);
const linked = ses => { const sm = sheetOf(ses, 'Summary'), si = sheetOf(ses, 'Sites'); return !!sm && !!si && column(sm, 'L', (s, r) => si.value('K' + r)) && ROWS.every(r => sm.cellAt('L' + r).fontColor === 'green'); };
const sites = ses => sheetOf(ses, 'Sites');

export default {
  id: 'date-serials',
  chapter: 'formulas',
  section: 'Dates',
  module: 'dates',
  workbook: 'clearcoat-databook',
  state: { before: 'S1d', after: 'S2a' },
  title: 'Serial numbers: DATE, YEAR, MONTH, DAY',
  difficulty: 'medium',
  tags: ['formulas', 'dates', 'date', 'year', 'month', 'day'],
  access: 'paid',
  minutes: 7,
  headline: 'DATE',
  conventions: ['B2'],
  teaches: ['date-serial', 'year-month-day', 'date-function'],
  uses: ['go-to', 'general-format', 'undo-redo', 'relative-absolute', 'formula-basics', 'fill-down-right', 'tab-commits', 'cross-sheet-ref', 'ctrl-enter-fill', 'font-color', 'link-colour-convention', 'arrow-keys', 'shift-arrow'],
  prerequisites: ['challenge-flags-block'],
  brief: 'A date is a serial number in a date format: 9/15/2026 is 46,280 days since January 1, 1900, and Ctrl+Shift+~ shows the number under any date. That’s why dates subtract: Domain opened on 3/15/2019, and 9/15/2026 less that is 2,741 days. DATE builds a date from a year, a month and a day; YEAR, MONTH and DAY take one apart. Build each site’s age on the Sites sheet and send it to the Summary. The key is `DATE`.',
  goals: [
    { id: 'read-serial', teach: 'Ctrl+Shift+~ is the General format: it strips the date costume and shows the serial underneath. Ctrl+Z puts the costume back.',
      text: 'Go to the as-of date on Sites, I5, show its serial with Ctrl+Shift+~, read 46,280, then put the date back with Ctrl+Z.', keys: 'Ctrl+G "Sites!I5" ↵ Ctrl+Shift+~ Ctrl+Z', requires: ['date-serial', 'go-to', 'general-format', 'undo-redo'],
      hintStuck: 'pulse cell Sites!I5 · The as-of date is the blue input on the first site row.',
      check: (s, ses) => { const si = sites(ses); const k = windowKeys(ses); return settled(ses) && on(ses, 'Sites') && at(si, 'I5') && k.includes('Ctrl+Shift+~') && k.includes('Ctrl+Z') && si.cellAt('I5').numFmt === 'm/d/yyyy'; } },
    { id: 'age-days', text: 'Age in days: J5 =$I$5-E5, anchored on the one as-of date, filled down to J10.', keys: '→ "=$I$5-E5" ↵ ↑ Shift+↓ ×5 Ctrl+D', requires: ['relative-absolute', 'formula-basics', 'fill-down-right', 'shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range J5:J10 · Without the $ signs the as-of date slides down to blank rows.',
      check: (s, ses) => { const si = sites(ses); return settled(ses) && !!si && days(si); } },
    { id: 'age-years', text: 'Age in years: K5 =J5/365.25, a quarter day a year for the leap years, filled down to K10.', keys: '→ "=J5/365.25" ↵ ↑ Shift+↓ ×5 Ctrl+D', requires: ['formula-basics', 'fill-down-right', 'shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range K5:K10 · Age (years) is right of Age (days).',
      check: (s, ses) => { const si = sites(ses); return settled(ses) && !!si && years(si); } },
    { id: 'take-apart', teach: 'YEAR, MONTH and DAY each take one part of a date: YEAR(E5) is 2019 for a site opened on 3/15/2019.',
      text: 'Take the opening date apart in L5:N5 as a Tab run, =YEAR(E5), =MONTH(E5) and =DAY(E5), then fill the three down to row 10.', keys: '→ "=YEAR(E5)" Tab "=MONTH(E5)" Tab "=DAY(E5)" ↵ ↑ Shift+→ ×2 Shift+↓ ×5 Ctrl+D', requires: ['year-month-day', 'tab-commits', 'fill-down-right', 'shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range L5:N10 · Year, Month and Day sit side by side after the ages.',
      check: (s, ses) => { const si = sites(ses); return settled(ses) && !!si && apart(si); } },
    { id: 'build-date', teach: 'DATE(year, month, day) builds a date from three numbers, and it rolls over: DATE(2026,13,1) is January 1, 2027.',
      text: 'Build the first of the opening month in O5 with =DATE(L5,M5,1), the date you group by when you group by month, and fill it down.', keys: '→ ×3 "=DATE(L5,M5,1)" ↵ ↑ Shift+↓ ×5 Ctrl+D', requires: ['date-function', 'fill-down-right', 'shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range O5:O10 · Month opened is right of Day.',
      check: (s, ses) => { const si = sites(ses); return settled(ses) && !!si && firstOfMonth(si); } },
    { id: 'vintage', teach: 'A vintage is the year a site opened. A buyer reads sites by vintage because the 2019 sites have had seven years to ramp and the 2026 one has had a week.',
      text: 'Vintage in P5 is =YEAR(E5), filled down to P10, so the page can be read by the year each site opened.', keys: '→ "=YEAR(E5)" ↵ ↑ Shift+↓ ×5 Ctrl+D', requires: ['year-month-day', 'fill-down-right', 'shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range P5:P10 · Vintage is the column after Month opened.',
      check: (s, ses) => { const si = sites(ses); return settled(ses) && !!si && vintage(si); } },
    { id: 'link-ages', teach: 'The ages on Summary were typed in 3.1.3 for want of this lesson. Now they link to Sites, so a new as-of date moves every flag that reads them.',
      text: 'Replace the typed ages on Summary: select L5:L10, type =Sites!K5, press Ctrl+Enter and color them green as links with Alt H F C.', keys: 'Ctrl+G "Summary!L5" ↵ Shift+↓ ×5 "=Sites!K5" Ctrl+↵ Alt H F C → ×8 ↵', requires: ['cross-sheet-ref', 'ctrl-enter-fill', 'font-color', 'link-colour-convention', 'go-to', 'shift-arrow'], convention: 'B2',
      hintStuck: 'pulse range Summary!L5:L10 · Age (years) on Summary is column L, the blue typed figures.',
      check: (s, ses) => settled(ses) && linked(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Sites!I5" Enter "12/31/2026" Enter Ctrl+G "Sites!K5" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch the as-of date in Sites!I5 move to 12/31/2026 and every age in J and K move with it.', requires: [],
      hintStuck: 'pulse cell Sites!K5 · Every age subtracts from the one as-of date.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Sites J5:K10 read each site’s age in days and years from the as-of date in I5', check: (s, ses) => { const si = sites(ses); return !!si && days(si) && years(si); } },
    { text: 'Sites L5:P10 take the opening date apart, rebuild the first of its month and give the vintage', check: (s, ses) => { const si = sites(ses); return !!si && apart(si) && firstOfMonth(si) && vintage(si); } },
    { text: 'Summary L5:L10 are green links to the ages on Sites', check: (s, ses) => linked(ses) },
  ],
  closing: [
    'A date is a number, so age is a subtraction.',
    'Every age comes from one blue as-of date and the opening dates, and the Summary reads them through green links (B2), so moving the date a quarter on moves the whole page.',
  ],
  solution: `Ctrl+G "Sites!I5" Enter Ctrl+Shift+~ Ctrl+Z Right "=$I$5-E5" Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Right "=J5/365.25" Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Right "=YEAR(E5)" Tab "=MONTH(E5)" Tab "=DAY(E5)" Enter Up Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Right Right Right "=DATE(L5,M5,1)" Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Right "=YEAR(E5)" Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Ctrl+G "Summary!L5" Enter Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "=Sites!K5" Ctrl+Enter Alt H F C Right Right Right Right Right Right Right Right Enter`,
};
