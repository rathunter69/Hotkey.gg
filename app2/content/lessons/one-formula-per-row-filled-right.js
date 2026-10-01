// Chapter 1 · 1.6.5 — One formula per row, filled right (clearcoat-weekly, S6d → S6e, plant PLANT_DAILY)
// The Report's daily table (B17:G21, five sites down, Mon–Sat across) reads off Raw's by-day block
// H30:N36, the feed's washes per site per day. The CFO's assistant already linked rows 18–21, and
// retyped Riverside's Thursday (E19) over its formula: the right number, dead. Domain's row 17 is
// the learner's: one link built by pointing across sheets, filled right in one press. Ctrl+` shows
// every formula's text and the one typed number stands out; the row is refilled from its own
// Monday formula with F2 then Ctrl+Enter, the view goes back, and the table is colored green, once
// with the Ribbon and once with F4. The closer changes Domain's Monday on the feed and B17 answers.
import { RAW_BYDAY, REPORT, PLANT_DAILY } from '../workbooks/clearcoat-weekly.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const raw = ses => sheetOf(ses, 'Raw');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const normFormula = f => String(f || '').replace(/\s|\$/g, '').replace(/^=\+/, '=').toUpperCase();

const DAILY_ROWS = REPORT.dailyRows;     // 17..21: Domain, Mueller, Riverside, South Lamar, Airport
const DAY_COLS = REPORT.dayCols;         // B..G: Mon..Sat
/** The Raw by-day cell the Report's daily cell (col, r) must link to: Report row 17 ↔ Raw row 32, column B ↔ I. */
const source = (col, r) => RAW_BYDAY.dayCols[DAY_COLS.indexOf(col)] + (RAW_BYDAY.firstRow + DAILY_ROWS.indexOf(r));
/** Report!(col r) is a live link to its Raw by-day cell and shows that cell's number. */
const linked = (rep, rw, col, r) => {
  const src = source(col, r);
  return normFormula(rep.formula(col + r)) === `=RAW!${src}` && isNum(rw.value(src)) && rep.value(col + r) === rw.value(src);
};
const rowLinked = (rep, rw, r) => DAY_COLS.every(col => linked(rep, rw, col, r));
const rowGreen = (rep, r) => DAY_COLS.every(col => rep.cellAt(col + r).fontColor === 'green');
const bothSheets = (ses, fn) => { const rep = report(ses), rw = raw(ses); return !!rep && !!rw && fn(rep, rw); };
const blockLinked = ses => bothSheets(ses, (rep, rw) => DAILY_ROWS.every(r => rowLinked(rep, rw, r)));
const showing = ses => !!(ses.settings && ses.settings.showFormulas);

export default {
  id: 'one-formula-per-row-filled-right',
  chapter: 'foundations',
  section: 'Formulas',
  module: 'formulas',
  workbook: 'clearcoat-weekly',
  state: { before: 'S6d', after: 'S6e' },
  plant: PLANT_DAILY,
  title: 'One formula per row, filled right',
  difficulty: 'medium',
  tags: ['formulas', 'fill', 'links', 'report'],
  access: 'free',
  minutes: 6,
  headline: 'Ctrl+R',
  conventions: ['C3', 'E3', 'B2'],
  teaches: ['show-formulas'],
  uses: ['cross-sheet-ref', 'pointing', 'sheet-tabs', 'fill-down-right', 'ctrl-enter-fill', 'edit-mode-f2', 'font-color', 'f4-repeat', 'keytips', 'shift-arrow', 'ctrl-shift-arrow', 'ctrl-arrow', 'arrow-keys'],
  prerequisites: ['link-across-sheets'],
  brief: 'The daily table on the Report has to read off Raw’s by-day block, washes for each site on each day. The CFO’s assistant filled rows 18 to 21 already and retyped one cell over its formula, and Domain’s row 17 is yours: one formula filled right covers the six days. Ctrl+` shows every formula’s text in place of its value, so a typed number sitting in a row of links stands out at a glance, and that’s the one audit you’ll run on every table someone else built. The key is `Ctrl+R`.',
  goals: [
    { id: 'link-monday', teach: '=, sheet key to Raw, walk to I32, Enter. The by-day block on Raw lays the sites down and the days across, the same shape as the daily table, which is why one formula will fit.',
      text: 'Domain’s Monday in B17 is empty: link it to Domain’s Monday, I32 in Raw’s by-day block, pointing across sheets.',
      hintStuck: 'pulse cell B17 · B17, =, Alt+PgDn, point at I32, Enter.',
      keys: 'Ctrl+↓ ×4 → Ctrl+↓ ×2 ↓ "=" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ ×3 ↓ ↵', requires: ['cross-sheet-ref', 'pointing', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => bothSheets(ses, (rep, rw) => linked(rep, rw, 'B', 17)) && settled(ses) },
    { id: 'fill-right', teach: 'Select B17:G17, Ctrl+R. The reference shifts a column per cell: I32, J32, K32 and on. One formula per row, filled right: the convention every model is built on.',
      text: 'Write the row once: with Monday’s link at the left of B17:G17, fill it right and all six days take the same pattern.',
      hintStuck: 'pulse cells B17:G17 · Land on B17, Shift+→ five times, Ctrl+R.',
      keys: 'Shift+→ ×5 Ctrl+R', requires: ['fill-down-right', 'shift-arrow'], convention: 'C3',
      check: (s, ses) => bothSheets(ses, (rep, rw) => rowLinked(rep, rw, 17)) && settled(ses) },
    { id: 'show-formulas', teach: 'Ctrl+` (the key above Tab) shows every formula’s text in place of its value; press it again to return. In a block of =Raw! links, a bare number is the one that isn’t a formula, and it’s wrong the moment the feed changes.',
      text: 'One of the assistant’s cells is a number, not a link: show every formula in the daily table with Ctrl+` and find it (E19).',
      hintStuck: 'pulse cell E19 · Ctrl+`, read rows 17 to 21, find E19; leave it on for the next goal.',
      keys: 'Ctrl+`', requires: ['show-formulas'],
      check: (s, ses) => showing(ses) && bothSheets(ses, (rep, rw) => rowLinked(rep, rw, 17)) && settled(ses) },
    { id: 'refill-row', teach: 'Select B19:G19, F2 on the Monday link at the left, Ctrl+Enter: the row’s own formula fills across and overwrites the typed cell. Fix the pattern, not the cell.',
      text: 'Riverside’s Thursday E19 was retyped: refill B19:G19 from its own Monday formula with F2 then Ctrl+Enter, never by retyping.',
      hintStuck: 'pulse cells B19:G19 · Land on B19, Shift+→ five times, F2, Ctrl+Enter.',
      keys: '↓ ×2 Ctrl+Shift+→ F2 Ctrl+↵', requires: ['ctrl-enter-fill', 'edit-mode-f2', 'ctrl-shift-arrow', 'arrow-keys'], convention: 'E3',
      check: (s, ses) => bothSheets(ses, (rep, rw) => rowLinked(rep, rw, 19) && rowLinked(rep, rw, 17)) && settled(ses) },
    { id: 'formulas-off', teach: 'Show formulas is a view, not a change. Toggle it back and the figures return, and now all thirty are links.',
      text: 'Bring the values back to the daily table: Ctrl+` again, and every cell in B17:G21 reads as a live link.',
      hintStuck: 'pulse the daily table · Ctrl+` once.',
      keys: 'Ctrl+`', requires: ['show-formulas'],
      check: (s, ses) => !showing(ses) && blockLinked(ses) && settled(ses) },
    { id: 'links-green', teach: 'Alt, H, F, C, green; then select B18:G21 and F4. Whoever reads this table sees green and knows the whole block is fetched from the feed.',
      text: 'A link to another sheet is green: select B17:G17 and color Domain’s row with Font Color, then F4 the rest of the table.',
      hintStuck: 'pulse cells B17:G17 · Select B17:G17; Alt, H, F, C, → eight times, Enter; B18:G21, F4.',
      keys: '↑ ×2 Ctrl+Shift+→ Alt H F C → ×8 ↵ ↓ Ctrl+Shift+→ Shift+↓ ×3 F4', requires: ['font-color', 'f4-repeat', 'keytips', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys'], convention: 'B2',
      check: (s, ses) => { const rep = report(ses); return !!rep && DAILY_ROWS.every(r => rowGreen(rep, r)) && blockLinked(ses) && !showing(ses) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Raw!C8" Enter "300" Enter Ctrl+G "Report!B17" Enter Escape Escape Escape', cadence: 320 },
      teach: 'Feed to by-day block to Report is two links deep, and one change at the source still shows on the page, which is what we mean by a live table.',
      text: 'Does it tie? Change Domain’s Monday washes on Raw’s C8 to 300 and watch the Report’s B17 answer through the by-day block.',
      hintStuck: 'pulse cell B17 on Report · Alt+PgDn to Raw; C8, 300, Enter; back to Report, read B17.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'B17:G21 are live links to Raw’s by-day block, one pattern across every row', check: (s, ses) => blockLinked(ses) },
    { text: 'Every link in the daily table reads green', check: (s, ses) => { const rep = report(ses); return !!rep && DAILY_ROWS.every(r => rowGreen(rep, r)); } },
    { text: 'The sheet shows values, not formula text', check: (s, ses) => !showing(ses) },
  ],
  wow: 'One formula filled right covered six days, and Ctrl+` found the typed number in one press.',
  closing: [
    'Domain’s week went in as one formula filled right, never six typed links, and Ctrl+` showed the pattern with the one dead number standing out. F2 then Ctrl+Enter filled the row back from its own formula instead of retyping it.',
    'Every link in the daily table reads green, and Domain’s Monday on the feed moves the Report’s B17 the moment it changes.',
  ],
  solution: 'Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Right Ctrl+Down Ctrl+Down Down "=" Ctrl+PgDn Ctrl+Right Right Right Right Ctrl+Down Ctrl+Down Ctrl+Down Down Enter Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+R Ctrl+` Down Down Ctrl+Shift+Right F2 Ctrl+Enter Ctrl+` Up Up Ctrl+Shift+Right Alt H F C Right Right Right Right Right Right Right Right Enter Down Ctrl+Shift+Right Shift+Down Shift+Down Shift+Down F4',
};
