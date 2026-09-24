// Chapter 1 · 1.6.5 — One formula per row, filled right (voltline-weekly, S6d → S6e, plant PLANT_DAILY)
// The Report's daily table (B17:G21, five sites down, Mon–Sat across) reads off Raw's by-day block
// H30:N36, the platform's kWh per site per day. The associate already linked rows 18–21 — and
// retyped Riverside's Thursday (E19) over its formula: the right number, dead. Domain's row 17 is
// the learner's: one link built by pointing across sheets, filled right in one press. Ctrl+` shows
// every formula's text and the one typed number stands out; the row is refilled from its own
// Monday formula with F2 then Ctrl+Enter, the view goes back, and Domain's row is colored green
// like the rest. The closer changes Domain's Monday on the feed and B17 answers.
import { RAW_BYDAY, REPORT, PLANT_DAILY } from '../workbooks/voltline-weekly.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const raw = ses => sheetOf(ses, 'Raw');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const normFormula = f => String(f || '').replace(/\s|\$/g, '').toUpperCase();

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
  workbook: 'voltline-weekly',
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
  uses: ['cross-sheet-ref', 'pointing', 'sheet-tabs', 'fill-down-right', 'ctrl-enter-fill', 'edit-mode-f2', 'font-color', 'input-colour-convention', 'keytips', 'shift-arrow', 'ctrl-shift-arrow', 'ctrl-arrow', 'ctrl-home-end', 'arrow-keys'],
  prerequisites: ['link-across-sheets'],
  brief: 'The daily table on the Report has to read off Raw’s by-day block, the platform’s kWh for each site on each day. The associate, the colleague who checks your page, filled rows 18 to 21 already and retyped one cell over its formula; Domain’s row 17 is yours, and one formula filled right covers the six days. The key is `Ctrl+R`.',
  goals: [
    { id: 'link-monday', text: 'Domain’s Monday in B17 is empty: link it to Domain’s Monday I32 in Raw’s by-day block, pointing across sheets.', keys: 'Ctrl+Home Ctrl+↓ ×5 → Ctrl+↑ ↑ "=" Ctrl+PgDn Ctrl+→ → ×2 Ctrl+↓ ×4 ↓ ×2 → ↵', requires: ['cross-sheet-ref', 'pointing', 'sheet-tabs', 'ctrl-arrow', 'ctrl-home-end', 'arrow-keys'],
      check: (s, ses) => bothSheets(ses, (rep, rw) => linked(rep, rw, 'B', 17)) && settled(ses) },
    { id: 'fill-right', text: 'Write the row once: with Monday’s link at the left of B17:G17, fill it right and all six days take the same pattern.', keys: '↑ Shift+→ ×5 Ctrl+R', requires: ['fill-down-right', 'shift-arrow'], convention: 'C3',
      check: (s, ses) => bothSheets(ses, (rep, rw) => rowLinked(rep, rw, 17)) && settled(ses) },
    { id: 'show-formulas', teach: 'Ctrl+` shows every formula’s text in place of its value, so a typed number stands out from the links; press it again to return.', text: 'One of the associate’s cells is a number, not a link: show every formula in the daily table and find the one that stands out, E19.', keys: 'Ctrl+`', requires: ['show-formulas'],
      check: (s, ses) => showing(ses) && bothSheets(ses, (rep, rw) => rowLinked(rep, rw, 17)) && settled(ses) },
    { id: 'refill-row', text: 'Riverside’s Thursday E19 was retyped: refill B19:G19 from its own Monday formula with F2 then Ctrl+Enter, never by retyping.', keys: '↓ ×2 Ctrl+Shift+→ F2 Ctrl+↵', requires: ['ctrl-enter-fill', 'edit-mode-f2', 'ctrl-shift-arrow', 'arrow-keys'], convention: 'E3',
      check: (s, ses) => bothSheets(ses, (rep, rw) => rowLinked(rep, rw, 19) && rowGreen(rep, 19) && rowLinked(rep, rw, 17)) && settled(ses) },
    { id: 'formulas-off', text: 'Bring the values back to the daily table: every cell in B17:G21 now reads as a live link.', keys: 'Ctrl+`', requires: ['show-formulas'],
      check: (s, ses) => !showing(ses) && blockLinked(ses) && settled(ses) },
    { id: 'links-green', text: 'A link to another sheet is shown green, the format the team uses: select B17:G17 and color Domain’s row with Alt H F C.', keys: '↑ ×2 Ctrl+Shift+→ Alt H F C → ×8 ↵', requires: ['font-color', 'input-colour-convention', 'keytips', 'ctrl-shift-arrow', 'arrow-keys'], convention: 'B2',
      check: (s, ses) => { const rep = report(ses); return !!rep && DAILY_ROWS.every(r => rowGreen(rep, r)) && blockLinked(ses) && !showing(ses) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Raw!C8" Enter "3000" Enter Ctrl+G "Report!B17" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Domain’s Monday kWh on Raw’s C8 change to 3,000 and the Report’s B17 answer through the by-day block.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'B17:G21 are live links to Raw’s by-day block, one pattern across every row', check: (s, ses) => blockLinked(ses) },
    { text: 'Every link in the daily table reads green', check: (s, ses) => { const rep = report(ses); return !!rep && DAILY_ROWS.every(r => rowGreen(rep, r)); } },
    { text: 'The sheet shows values, not formula text', check: (s, ses) => !showing(ses) },
  ],
  closing: [
    'Domain’s week went in as one formula filled right, never six typed links (C3), and Ctrl+` showed the pattern with the one dead number standing out; F2 then Ctrl+Enter filled the row back from its own formula instead of retyping it (E3).',
    'Every link in the daily table reads green (B2), and Domain’s Monday on the feed moves the Report’s B17 the moment it changes.',
  ],
  solution: 'Ctrl+Home Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Right Ctrl+Up Up "=" Ctrl+PgDn Ctrl+Right Right Right Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Down Down Right Enter Up Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+R Ctrl+` Down Down Ctrl+Shift+Right F2 Ctrl+Enter Ctrl+` Up Up Ctrl+Shift+Right Alt H F C Right Right Right Right Right Right Right Right Enter',
};
