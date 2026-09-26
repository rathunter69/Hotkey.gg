// Chapter 2 · 2.2.3 — Dynamic headers with TEXT (voltline-pnl, S2b → S2c)
// A typed header goes stale the day the timeline moves. A header built from a date never does:
// TEXT renders a number through a format code as text, and & joins the pieces, so FY24A is
// ="FY"&TEXT(B3,"yy")&"A" and the title is the labels joined. The year ends go into row 3 as
// DATE formulas, the FY labels read from them, both page titles read from their headers. The
// closer moves the FY26E year end to 2027 and the label and the title follow it.
import { ANNUAL_COLS, YEAR_END_FORMULAS, FY_LABEL_FORMULAS, TITLE_FORMULA, MONTHLY_TITLE_FORMULA, YEAR_END_LABEL, TITLE } from '../workbooks/voltline-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const monthly = ses => sheetOf(ses, 'Monthly');
const settled = ses => !ses.editing && !ses.dialog;
const norm = f => String(f || '').replace(/\s+/g, '').toUpperCase();
const formulaIs = (sh, ref, want) => norm(sh.cellAt(ref).formula) === norm(want);

const YEAR_ENDS = ANNUAL_COLS.map(col => col + '3');
const yearEnds = sh => sh.value('A3') === YEAR_END_LABEL && ANNUAL_COLS.every((col, i) => formulaIs(sh, col + '3', YEAR_END_FORMULAS[i]));
const datesOn = (sh, refs) => refs.every(ref => sh.cellAt(ref).fmtStyle === 'date');
const MONTHLY_TITLE = 'Voltline - monthly operating data, Jan-26 to Dec-26';

export default {
  id: 'dynamic-headers-with-text',
  chapter: 'formatting',
  section: 'Custom number formats',
  module: 'custom-number-formats',
  workbook: 'voltline-pnl',
  state: { before: 'S2b', after: 'S2c' },
  title: 'Dynamic headers with TEXT',
  difficulty: 'medium',
  tags: ['formulas', 'text', 'headers', 'pnl'],
  access: 'paid',
  minutes: 7,
  headline: 'TEXT',
  conventions: ['D9', 'G3', 'C2'],
  teaches: ['date-function', 'text-function', 'concatenate-amp'],
  uses: ['formula-basics', 'tab-commits', 'format-cells-tabs', 'date-format', 'ctrl-shift-arrow', 'shift-arrow', 'home-key', 'fill-down-right', 'ctrl-home-end', 'go-to', 'sheet-reference'],
  prerequisites: ['units-in-the-format'],
  brief: 'A typed header goes stale the day the timeline moves; a header built from a date never does. Put the three year ends in row 3, build the FY labels from them with TEXT, and build both page titles from the labels, so one changed date rewrites the page. The function is `TEXT`.',
  goals: [
    { id: 'year-ends', teach: 'DATE(year, month, day) builds a date from its parts, so =DATE(2024,12,31) is FY24’s year end as a number the sheet can read.', text: 'Label A3 Year end, then put the three year ends in B3:D3 as =DATE(2024,12,31), =DATE(2025,12,31) and =DATE(2026,12,31), Tab between.', keys: 'Ctrl+Home ↓ ×2 "Year end" Tab "=DATE(2024,12,31)" Tab "=DATE(2025,12,31)" Tab "=DATE(2026,12,31)" Tab', requires: ['date-function', 'formula-basics', 'tab-commits', 'ctrl-home-end'], convention: 'C2',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && yearEnds(sh) && settled(ses); } },
    { id: 'year-ends-dates', text: 'The year ends show as serials: step back onto D3, select to B3 with Shift+← twice, and dress them as dates with Ctrl+1 then D.', keys: '← Shift+← ×2 Ctrl+1 D', requires: ['date-format', 'format-cells-tabs', 'shift-arrow'],
      check: (s, ses) => { const sh = pnl(ses); return !!sh && datesOn(sh, YEAR_ENDS) && settled(ses); } },
    { id: 'fy24-from-date', teach: 'TEXT(value, "format") renders a number through a format code as text, and & joins the pieces: ="FY"&TEXT(B3,"yy")&"A" reads FY24A from the date in B3.', text: 'Replace the typed FY24A in B4 with a label built from its year end: ="FY"&TEXT(B3,"yy")&"A".', keys: `Home → ↓ '="FY"&TEXT(B3,"yy")&"A"' ↵`, requires: ['text-function', 'concatenate-amp', 'formula-basics', 'home-key'], convention: 'D9',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && formulaIs(sh, 'B4', FY_LABEL_FORMULAS[0]) && sh.value('B4') === 'FY24A' && settled(ses); } },
    { id: 'fy25-filled', text: 'FY25A in C4 is the same formula one column over: step up onto B4, select C4 with it and fill right with Ctrl+R.', keys: '↑ Shift+→ Ctrl+R', requires: ['fill-down-right', 'shift-arrow'], convention: 'C2',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && formulaIs(sh, 'C4', FY_LABEL_FORMULAS[1]) && sh.value('C4') === 'FY25A' && settled(ses); } },
    { id: 'fy26-estimate', text: 'FY26 is an estimate: in D4 write ="FY"&TEXT(D3,"yy")&"E" so the label ends in E.', keys: `→ ×2 '="FY"&TEXT(D3,"yy")&"E"' ↵`, requires: ['text-function', 'concatenate-amp'], convention: 'G3',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && formulaIs(sh, 'D4', FY_LABEL_FORMULAS[2]) && sh.value('D4') === 'FY26E' && settled(ses); } },
    { id: 'title-from-labels', text: 'The title in A1 reads from the labels: join the company name, "Profit and loss, ", B4, " to " and D4 with &.', keys: `Ctrl+Home '="Voltline Charging Inc. - Profit and loss, "&B4&" to "&D4' ↵`, requires: ['concatenate-amp', 'ctrl-home-end'], convention: 'G3',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && formulaIs(sh, 'A1', TITLE_FORMULA) && sh.value('A1') === TITLE && settled(ses); } },
    { id: 'monthly-title', text: 'Monthly’s title A1 reads from its own headers: ="Voltline - monthly operating data, "&TEXT(B4,"mmm-yy")&" to "&TEXT(M4,"mmm-yy").', keys: `Ctrl+G "Monthly!A1" ↵ '="Voltline - monthly operating data, "&TEXT(B4,"mmm-yy")&" to "&TEXT(M4,"mmm-yy")' ↵`, requires: ['text-function', 'concatenate-amp', 'go-to', 'sheet-reference'], convention: 'G3',
      check: (s, ses) => { const sh = monthly(ses); return !!sh && formulaIs(sh, 'A1', MONTHLY_TITLE_FORMULA) && sh.value('A1') === MONTHLY_TITLE && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "'P&L'!D3" Enter "=DATE(2027,12,31)" Enter Ctrl+Home Escape Escape Escape`, cadence: 320 }, text: 'Does it follow? Watch the FY26E year end in D3 move to 2027, and the label in D4 and the title in A1 rewrite to FY27E.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Row 3 holds the three year ends as dates', check: (s, ses) => { const sh = pnl(ses); return !!sh && yearEnds(sh) && datesOn(sh, YEAR_ENDS); } },
    { text: 'B4:D4 read FY24A, FY25A, FY26E from the dates above them', check: (s, ses) => { const sh = pnl(ses); return !!sh && ANNUAL_COLS.every((col, i) => formulaIs(sh, col + '4', FY_LABEL_FORMULAS[i])); } },
    { text: 'Both titles read from their headers', check: (s, ses) => { const sh = pnl(ses), m = monthly(ses); return !!sh && !!m && formulaIs(sh, 'A1', TITLE_FORMULA) && formulaIs(m, 'A1', MONTHLY_TITLE_FORMULA); } },
  ],
  closing: [
    'Every label on the page now reads from a date: the year ends in row 3, the FY labels from them, the titles from the labels (D9, G3). Move one year end and the whole header rewrites itself, which is what a timeline row is for (C2).',
    'TEXT rendered a date through a format code and & joined the pieces, the same two moves that build any dynamic label: a week-of line, a "USD thousands" note, a period count.',
  ],
  solution: `Ctrl+Home Down Down "Year end" Tab "=DATE(2024,12,31)" Tab "=DATE(2025,12,31)" Tab "=DATE(2026,12,31)" Tab Left Shift+Left Shift+Left Ctrl+1 D Home Right Down '="FY"&TEXT(B3,"yy")&"A"' Enter Up Shift+Right Ctrl+R Right Right '="FY"&TEXT(D3,"yy")&"E"' Enter Ctrl+Home '="Voltline Charging Inc. - Profit and loss, "&B4&" to "&D4' Enter Ctrl+G "Monthly!A1" Enter '="Voltline - monthly operating data, "&TEXT(B4,"mmm-yy")&" to "&TEXT(M4,"mmm-yy")' Enter`,
};
