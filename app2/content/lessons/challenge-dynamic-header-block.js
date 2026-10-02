// Chapter 2 · 2.6.C Challenge: the dynamic header block (seeded over S5d)
// A cluster's figures over the three-page model at the end of 2.5, with its header block typed:
// the titles typed, the P&L's year ends typed, Monthly's month heads arriving as text (2026-01 to
// 2026-12), no units line on Inputs, and Monthly detail's labels as the system exports them. The
// header block is made to write itself: titles from Inputs with &, the timeline from Inputs!B6
// with EOMONTH, the months chained from one typed date, month names with TEXT, the units line built
// once and read by two pages, the labels cleaned with TRIM, PROPER and SUBSTITUTE. The workload
// never moves with the seed.
import { challengeSeed, MONTH_ENDS, YEAR_ENDS, UNITS_LINE, DETAIL, cleanLabel } from '../workbooks/clearcoat-pnl.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const monthly = ses => sheetOf(ses, 'Monthly');
const inputs = ses => sheetOf(ses, 'Inputs');
const detail = ses => sheetOf(ses, 'Monthly detail');
const settled = ses => !ses.editing && !ses.dialog;
const fx = (sh, ref, rx) => { const c = sh.cellAt(ref); return !!c.formula && rx.test(c.formula.replace(/\s+/g, '').toUpperCase()); };
const blank = (sh, ref) => { const c = sh.cellAt(ref); return !c.formula && (c.value === null || c.value === undefined); };   // empty text is content, as Excel counts it
const COLS = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const titlesLive = ses => {
  const p = pnl(ses), m = monthly(ses);
  return !!p && !!m && p.value('A1') === 'Clearcoat Express - Historical Financials' && fx(p, 'A1', /INPUTS!\$?B\$?3&/)
    && m.value('A1') === 'Clearcoat Express - FY26 by month' && fx(m, 'A1', /INPUTS!\$?B\$?3&/);
};
const timelineLive = sh => !!sh && sh.value('C4') === YEAR_ENDS[0] && fx(sh, 'C4', /^=INPUTS!\$?B\$?6$/)
  && ['D', 'E'].every((col, k) => sh.value(col + '4') === YEAR_ENDS[k + 1] && fx(sh, col + '4', /EOMONTH\(/));
const monthsChained = sh => !!sh && sh.value('C4') === MONTH_ENDS[0] && !sh.cellAt('C4').formula
  && COLS.slice(1).every((col, k) => sh.value(col + '4') === MONTH_ENDS[k + 1] && fx(sh, col + '4', /EOMONTH\(/));
const monthNames = sh => !!sh && COLS.every((col, i) => sh.value(col + '5') === `${MONTHS[i]} 2026` && fx(sh, col + '5', new RegExp(`TEXT\\(\\$?${col}\\$?4,`)));
const unitsLive = ses => {
  const i = inputs(ses); if (!i || i.value('B17') !== UNITS_LINE || !fx(i, 'B17', /\$?B\$?4&.*\$?B\$?5&/)) return false;
  return ['P&L', 'Monthly'].every(n => { const sh = sheetOf(ses, n); return !!sh && sh.value('A2') === UNITS_LINE && fx(sh, 'A2', /^=INPUTS!\$?B\$?17$/); });
};
const LAST = DETAIL.ebitda - 1;
const GAPS = DETAIL.clusters.map(k => k.contrib + 1);
const labelsClean = sh => !!sh && Array.from({ length: LAST - 4 }, (_, i) => i + 5).every(r => {
  if (GAPS.includes(r)) return blank(sh, 'B' + r);
  const v = sh.cellAt('B' + r).value; return typeof v === 'string' && v !== '' && v === cleanLabel(v) && !sh.cellAt('B' + r).formula;
}) && sh.value('B' + DETAIL.ebitda) === 'EBITDA';
/** No helper left behind in column R. */
const helperGone = sh => !!sh && Array.from({ length: LAST - 4 }, (_, i) => i + 5).every(r => blank(sh, 'R' + r));

const GAP_KEYS = GAPS.map(r => `Ctrl+G "'Monthly detail'!B${r}" ↵ Delete`).join(' ');
const GAP_SCRIPT = GAPS.map(r => `Ctrl+G "'Monthly detail'!B${r}" Enter Delete`).join(' ');

export default {
  id: 'challenge-dynamic-header-block',
  chapter: 'formatting',
  section: 'Dates and text for presentation',
  module: 'dates-and-text-for-presentation',
  workbook: 'clearcoat-pnl',
  state: { before: 'S5d' },
  kind: 'challenge',
  title: 'Challenge: the dynamic header block',
  difficulty: 'hard',
  tags: ['challenge', 'formula', 'text', 'dates', 'headers'],
  access: 'paid',
  minutes: 3,
  conventions: ['C2', 'C5', 'B4'],
  prerequisites: ['units-and-period-line'],
  brief: 'A three-sheet model with typed titles, text dates and dirty labels. Make the header block write itself from Inputs.',
  timeLimit: 180,
  pars: parsFrom(100, { pass: 175, pro: 130 }),
  seed: rng => challengeSeed('challenge-dynamic-header-block', rng),
  goals: [
    { id: 'titles', text: 'Build the P&L and Monthly titles in A1 from Inputs!B3 with &, as "- Historical Financials" and "- FY26 by month".', convention: 'B4',
      keys: `'=Inputs!B3&" - Historical Financials"' ↵ Ctrl+G "Monthly!A1" ↵ '=Inputs!B3&" - FY26 by month"' ↵`,
      check: (s, ses) => titlesLive(ses) && settled(ses) },
    { id: 'timeline', text: 'On the P&L, link C4 to Inputs!B6 and chain D4:E4 from it with EOMONTH, twelve months a step.', convention: 'C2',
      keys: `Ctrl+G "'P&L'!C4" ↵ "=Inputs!B6" Tab "=EOMONTH(C4,12)" Tab "=EOMONTH(D4,12)" ↵`,
      check: (s, ses) => timelineLive(pnl(ses)) && settled(ses) },
    { id: 'month-ends', text: 'On Monthly, type 1/31/2026 over the text in C4 and chain D4:N4 from it with =EOMONTH(C4,1).', convention: 'C2',
      keys: 'Ctrl+G "Monthly!C4" ↵ "1/31/2026" Tab "=EOMONTH(C4,1)" ↵ ↑ → Ctrl+Shift+→ Shift+← Ctrl+R',
      check: (s, ses) => monthsChained(monthly(ses)) && settled(ses) },
    { id: 'month-names', text: 'Name each month in C5:N5 from the date above it with =TEXT(C4,"mmmm yyyy").',
      keys: `↓ ← '=TEXT(C4,"mmmm yyyy")' ↵ ↑ ×2 Ctrl+→ ← ↓ Ctrl+Shift+← Ctrl+R`,
      check: (s, ses) => monthNames(monthly(ses)) && settled(ses) },
    { id: 'units', text: 'Build the units line once in Inputs!B17 from B4 and B5, and point A2 on the P&L and Monthly at it.', convention: 'C5',
      keys: `Ctrl+G "Inputs!B17" ↵ '=B4&" "&B5&" unless stated; costs shown as negatives"' ↵ Ctrl+G "'P&L'!A2" ↵ "=Inputs!B17" ↵ Ctrl+G "Monthly!A2" ↵ "=Inputs!B17" ↵`,
      check: (s, ses) => unitsLive(ses) && settled(ses) },
    { id: 'labels', text: `Clean Monthly detail’s labels B5:B${LAST} with PROPER, TRIM and SUBSTITUTE as values, leaving no helper and no empty text behind.`,
      keys: `Ctrl+G "'Monthly detail'!R5:R${LAST}" ↵ '=PROPER(TRIM(SUBSTITUTE(SUBSTITUTE(B5,"_"," "),"(1)","")))' Ctrl+↵ Ctrl+C Ctrl+G "B5" ↵ Ctrl+Alt+V V ↵ Esc ${GAP_KEYS} Ctrl+G "'Monthly detail'!R5:R${LAST}" ↵ Delete`,
      check: (s, ses) => labelsClean(detail(ses)) && helperGone(detail(ses)) && settled(ses) },
  ],
  graders: [
    ses => (titlesLive(ses) ? { ok: true } : { ok: false, why: 'a title is typed: the P&L and Monthly titles read Inputs!B3' }),
    ses => (timelineLive(pnl(ses)) ? { ok: true } : { ok: false, why: 'the P&L’s year ends do not all come from Inputs!B6' }),
    ses => { const m = monthly(ses); if (!monthsChained(m)) return { ok: false, why: 'Monthly’s month ends are not one typed date and a chain of EOMONTH' };
      return monthNames(m) ? { ok: true } : { ok: false, why: 'Monthly C5:N5 do not name the months from the dates above them' }; },
    ses => (unitsLive(ses) ? { ok: true } : { ok: false, why: 'the units line is typed somewhere instead of read from Inputs!B17' }),
    ses => (labelsClean(detail(ses)) && helperGone(detail(ses)) ? { ok: true } : { ok: false, why: 'a label on Monthly detail still reads as exported, or a helper is left in column R' }),
  ],
  solution: `'=Inputs!B3&" - Historical Financials"' Enter Ctrl+G "Monthly!A1" Enter '=Inputs!B3&" - FY26 by month"' Enter Ctrl+G "'P&L'!C4" Enter "=Inputs!B6" Tab "=EOMONTH(C4,12)" Tab "=EOMONTH(D4,12)" Enter Ctrl+G "Monthly!C4" Enter "1/31/2026" Tab "=EOMONTH(C4,1)" Enter Up Right Ctrl+Shift+Right Shift+Left Ctrl+R Down Left '=TEXT(C4,"mmmm yyyy")' Enter Up Up Ctrl+Right Left Down Ctrl+Shift+Left Ctrl+R Ctrl+G "Inputs!B17" Enter '=B4&" "&B5&" unless stated; costs shown as negatives"' Enter Ctrl+G "'P&L'!A2" Enter "=Inputs!B17" Enter Ctrl+G "Monthly!A2" Enter "=Inputs!B17" Enter Ctrl+G "'Monthly detail'!R5:R${LAST}" Enter '=PROPER(TRIM(SUBSTITUTE(SUBSTITUTE(B5,"_"," "),"(1)","")))' Ctrl+Enter Ctrl+C Ctrl+G "B5" Enter Ctrl+Alt+V V Enter Escape ${GAP_SCRIPT} Ctrl+G "'Monthly detail'!R5:R${LAST}" Enter Delete`,
};
