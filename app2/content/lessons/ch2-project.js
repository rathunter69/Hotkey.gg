// Chapter 2 · 2.8.P Project: the historical financials section (clearcoat-pnl, S8raw → S8done)
// The same accounting system's export a year on (FY25A, FY26A, FY27E, 46 sites), with the same
// faults: account codes, capitals, costs as positives, four decimals, bare years. Everything the
// chapter taught goes on in one sitting until three pages are ready for the data room: the P&L by
// line (formats, signs, margins, dates, units, anatomy, labels, divider, layout, groups), Monthly
// brought to the P&L's standard and headed by formula, the navigation names, the three kinds of
// rule, Print linked from the detail, and the pack's print set-up. Fifteen goals, no teach lines.
// The assessment (2.8.A) builds the same three pages on a sister operator's figures, so the goal
// checks here read structure (formulas, formats, signs, layout), never the figures of this export.
import { hintToScript } from '../../app/runner.js';
import { rangeRefs } from '../../engine/refs.js';
import { CH2_PAGE_SETUP, stateOf } from '../workbooks/clearcoat-pnl.js';
import { KEYS as PRINT_KEYS } from './one-page-summary.js';

const DONE = stateOf('S8done');
const doneSheet = name => DONE.sheets.find(s => s.name === name);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const settled = ses => !ses.editing && !ses.dialog;
const norm = f => String(f || '').replace(/\s/g, '').toUpperCase();
const blank = v => v === undefined || v === null || v === false || v === '' || v === 0 || v === 'general';   // General is the format a cell has before it has one
const same = (a, b) => (blank(a) ? null : a) === (blank(b) ? null : b);
const refsOf = spec => spec.split(',').flatMap(part => { const [a, b] = part.trim().split(':'); return rangeRefs(a, b || a); });

/**
 * The cells of `spec` on sheet `name` match the finished section on `props`. 'content' reads the
 * route-free part: a formula's text (spacing ignored), a typed number staying a number (the figures
 * come with the seed), a label's words, an empty cell staying empty; 'sign' reads a typed figure's
 * sign (the convention).
 */
export function cellsLike(ses, name, spec, props) {
  const sh = sheetOf(ses, name), dn = doneSheet(name); if (!sh || !dn) return false;
  return refsOf(spec).every(ref => {
    const c = sh.cellAt(ref), d = dn.cells[ref] || {};
    return props.every(p => {
      if (p === 'sign') return typeof d.value !== 'number' || d.formula || (typeof c.value === 'number' && Math.sign(c.value) === Math.sign(d.value));
      if (p !== 'content') return same(c[p], d[p]);
      if (d.formula) return norm(c.formula) === norm(d.formula);
      if (c.formula) return false;
      if (typeof d.value === 'number') return typeof c.value === 'number';
      if (d.value === undefined) return c.value === undefined || c.value === null || c.value === '';
      return c.value === d.value;
    });
  });
}
const widthsLike = (ses, name) => { const sh = sheetOf(ses, name), dn = doneSheet(name); return !!sh && Object.keys(dn.colW).every(c => sh.colSet[c] && sh.colW[c] === dn.colW[c]); };
const rowsLike = (ses, name) => { const sh = sheetOf(ses, name), dn = doneSheet(name); return !!sh && Object.keys(dn.rowH || {}).every(r => sh.rowH[r] === dn.rowH[r]); };
const frozenLike = (ses, name) => { const sh = sheetOf(ses, name), f = doneSheet(name).freeze; return !!sh && !!sh.freeze && sh.freeze.r === f.r && sh.freeze.c === f.c; };
const gridOff = (ses, name) => { const sh = sheetOf(ses, name); return !!sh && sh.gridlines === false; };
const groupsLike = (ses, name) => { const sh = sheetOf(ses, name), want = doneSheet(name).groups.rows;
  return !!sh && sh.groups.rows.length === want.length && want.every(g => sh.groups.rows.some(h => h.r1 === g.r1 && h.r2 === g.r2)); };
/** Each finished rule is there: kind, range, operator, formula, style and Stop If True; `anyValue` lets a cell-value rule take its own threshold. */
const rulesLike = (ses, name, { anyValue = false } = {}) => { const sh = sheetOf(ses, name), want = doneSheet(name).condFmt || [];
  return !!sh && sh.condFmt.length === want.length && want.every(w => sh.condFmt.some(r => r.kind === w.kind && r.range === w.range && r.style === w.style && r.op === w.op
    && norm(r.formula) === norm(w.formula) && !!r.stopIfTrue === !!w.stopIfTrue && (anyValue || w.kind !== 'cellValue' || r.v1 === w.v1)
    && (!anyValue || w.kind !== 'cellValue' || typeof r.v1 === 'number'))); };
const namesLike = ses => { const want = DONE.names || {}; const have = ses.definedNames();
  return Object.entries(want).every(([n, ref]) => have.some(h => h.name.toUpperCase() === n.toUpperCase() && `${h.sheet}!${h.ref}` === ref)); };
const setupLike = ses => { const p = (ses.settings && ses.settings.pageSetup) || {}, w = CH2_PAGE_SETUP, f = p.footer || {};
  return p.orientation === w.orientation && p.scaling === w.scaling && p.fitWide === w.fitWide && p.fitTall === w.fitTall && p.titlesRows === w.titlesRows
    && f.left === w.footer.left && f.centre === w.footer.centre && f.right === w.footer.right && p.centerH === true; };

const FMT = ['fmtStyle', 'numFmt'];
const LOOK = ['bold', 'it', 'indent', 'align', 'bt', 'bdbl', 'fontColor', 'fill'];
const PRINT_ALL = 'A1:A2,B4:E14';

/** Each goal's end-state check, shared with the assessment (seeded figures, the same structure). */
export const CHECKS = {
  formats: ses => cellsLike(ses, 'P&L', 'C7:E24,C33:E35', FMT),
  signs: ses => cellsLike(ses, 'P&L', 'C13:E24,G23', ['content', 'sign']),
  margins: ses => cellsLike(ses, 'P&L', 'B26:B30', ['content']) && cellsLike(ses, 'P&L', 'C27:F30', ['content', 'it', 'decimals', ...FMT]),
  timeline: ses => cellsLike(ses, 'P&L', 'B4:E4', ['content', 'bold', 'align', 'fontColor', ...FMT]) && cellsLike(ses, 'P&L', 'C5:E5', ['content', 'it', 'align']),
  inputs: ses => cellsLike(ses, 'Inputs', 'B12:B19', ['content', 'fontColor', ...FMT]),
  anatomy: ses => cellsLike(ses, 'P&L', 'A1:A35', ['content', 'bold', 'it', 'fsz', 'ca']) && cellsLike(ses, 'P&L', 'B6:B35,B38:B40', ['bold', 'indent', 'bt', 'bdbl'])
    && cellsLike(ses, 'P&L', 'C7:E24,C33:E35', ['bold', 'bt', 'bdbl', 'fontColor']) && gridOff(ses, 'P&L'),
  labels: ses => cellsLike(ses, 'P&L', 'B6:B37', ['content', 'it']) && cellsLike(ses, 'P&L', 'D4:D35', ['br']) && cellsLike(ses, 'P&L', 'E4:E5', ['fill']),
  layout: ses => widthsLike(ses, 'P&L') && rowsLike(ses, 'P&L') && frozenLike(ses, 'P&L') && groupsLike(ses, 'P&L'),
  monthly: ses => cellsLike(ses, 'Monthly', 'B6:B30', ['content', 'bold', 'indent', 'bt', 'bdbl']) && cellsLike(ses, 'Monthly', 'C6:O30', ['content', 'sign', 'it', 'bold', 'bt', 'bdbl', 'fontColor', ...FMT]),
  heads: ses => cellsLike(ses, 'Monthly', 'A1:A2', ['content', 'bold', 'it', 'fsz', 'ca']) && cellsLike(ses, 'Monthly', 'B4:O5', ['content', ...LOOK, 'wrap', 'fmtStyle']),
  foot: ses => cellsLike(ses, 'Monthly', 'B31:C35', ['content', 'bold', 'it', 'indent', ...FMT]) && widthsLike(ses, 'Monthly') && frozenLike(ses, 'Monthly') && gridOff(ses, 'Monthly'),
  navigation: ses => cellsLike(ses, 'Monthly', 'Q4:Q7', ['content', 'bold']) && namesLike(ses),
  rules: (ses, opts) => rulesLike(ses, 'Monthly', opts) && rulesLike(ses, 'P&L') && cellsLike(ses, 'P&L', 'C39:C40', ['content', ...FMT]),
  print: ses => cellsLike(ses, 'Print', PRINT_ALL, ['content', ...LOOK, 'fsz', 'ca', 'br', 'decimals', ...FMT]) && widthsLike(ses, 'Print') && frozenLike(ses, 'Print') && gridOff(ses, 'Print') && rulesLike(ses, 'Print'),
  setup: ses => setupLike(ses),
};

const CODE = c => `Ctrl+1 N Tab End Alt+T ${c.includes('"') ? `'${c}'` : `"${c}"`} ↵`;
const PLAIN = '#,##0_);(#,##0);-_)', DOLLAR = '$#,##0_);($#,##0);-_)', PCT = '0.0%_);(0.0%);-_)', WASHES = '[<1000]0;#,##0', PERWASH = '$0.00" /wash"', CHECK = '0_);[Red](0);-_)';

/** The route, goal by goal; `slow` is the slow-month line (4,500 on Clearcoat; the assessment's sister operator is smaller). */
export const keysFor = ({ slow = 4500 } = {}) => ({
  formats: `→ ×2 Ctrl+↓ ×2 Ctrl+Shift+↓ ×5 Ctrl+Shift+→ ${CODE(PLAIN)} Ctrl+↑ Ctrl+↓ Shift+→ ×2 ${CODE(DOLLAR)} Ctrl+↓ Shift+→ ×2 F4 Ctrl+↓ ×4 Shift+→ ×2 F4 Ctrl+↓ Shift+→ ×2 Shift+↓ ${CODE(PLAIN)} ↓ Shift+→ ×2 ${CODE(WASHES)} ↓ Shift+→ ×2 ${CODE(PERWASH)}`,
  signs: `Ctrl+↑ ×3 ↓ Ctrl+→ → ×2 "-1" ↵ ↑ Ctrl+C ← ×2 Shift+← ×2 Ctrl+Alt+V M ↵ Ctrl+↑ ×2 ↑ Ctrl+Shift+↑ Shift+← ×2 Ctrl+Alt+V M ↵ Esc Ctrl+↓ ×2 ↓ → ×2 Delete ↑ Ctrl+← ← ×2 "=C10+C20" ↵ ↑ Shift+→ ×2 Ctrl+R ↓ ×2 "=C22+C23" ↵ ↑ Shift+→ ×2 Ctrl+R`,
  margins: `← ↓ ×2 "Margins and growth" ↵ "Gross margin" ↵ "Site contribution margin" ↵ "EBITDA margin" ↵ "Revenue growth" ↵ Ctrl+↑ ×2 ↓ → "=(C10+C13)/C10" ↵ "=C22/C10" ↵ "=C24/C10" ↵ Ctrl+↑ ×2 Shift+→ ×2 Ctrl+Shift+↓ Ctrl+R Ctrl+↓ ↓ → "=D10/C10-1" ↵ ↑ Shift+→ Ctrl+R ↑ → ×2 "CAGR" ↵ "=(E10/C10)^(1/(COLUMNS(C10:E10)-1))-1" ↵ ← ×3 Ctrl+↑ ×2 Shift+→ ×3 Shift+↓ ×3 Ctrl+Shift+5 Alt H 0 Ctrl+I ${CODE(PCT)}`,
  timeline: `Ctrl+Home → ×2 Ctrl+↓ "=Inputs!B6" Tab "=EOMONTH(C4,12)" Tab "=EOMONTH(D4,12)" ↵ "A" Tab "A" Tab "E" ↵ ↑ ×2 Alt H F C → ×8 ↵ Shift+→ ${CODE('"FY"yy"A"')} → ×2 ${CODE('"FY"yy"E"')} ← ×3 "Fiscal year ending" ↵ ↑ Alt H A R Shift+→ ×3 Ctrl+B ↓ → Shift+→ ×2 Ctrl+I Alt H A R`,
  inputs: `Ctrl+G "Inputs!B12" ↵ ${CODE('On;;Off')} ↓ "12" ↵ ↑ ${CODE('0.0x')} ↓ ${CODE('0 bps')} ↓ ${CODE('#,##0.0,"m"')} ↓ ${CODE('#,##0k')} ↓ '=B4&" "&B5&" unless stated; costs shown as negatives"' ↵ "=EDATE(B10,3)" ↵ ↑ ${CODE('m/d/yyyy')} ↓ '="Revenue of "&TEXT(' "'P&L'!E10," '"#,##0")&"k in FY27E"' ↵ ↑ Alt H F C → ×8 ↵`,
  anatomy: `Ctrl+PgUp Ctrl+Home Ctrl+Space Delete '=Inputs!B3&" - Historical Financials"' ↵ ↑ Ctrl+B Alt H F G Shift+→ ×4 Ctrl+1 A Alt+H ↓ ×4 ↵ ↓ "=Inputs!B17" ↵ ↑ Ctrl+I → Ctrl+↓ ↓ ×2 Ctrl+B "Revenue" ↵ Shift+↓ ×2 Alt H 6 Ctrl+↓ Shift+→ ×3 Ctrl+B Alt H B P ↓ ×2 Ctrl+B "Site costs" ↵ Shift+↓ ×6 Alt H 6 Ctrl+↓ Shift+→ ×3 Ctrl+B Alt H B P ↓ ×2 Shift+→ ×3 Ctrl+B Alt H B P ↓ ×2 Shift+→ ×3 Ctrl+B Alt H B P Alt H B B ↓ ×2 Ctrl+B Ctrl+↓ ↓ ×2 Ctrl+B "Memo" ↵ Ctrl+↓ ×2 Ctrl+B ↓ Shift+↓ Alt H 6 Ctrl+Home → ×2 Ctrl+↓ ×3 Shift+→ ×2 Shift+↓ ×2 Alt H F C → ×4 ↵ Ctrl+↓ ×2 Shift+→ ×2 Shift+↓ ×6 F4 Ctrl+↓ ×2 ↓ Shift+→ ×2 F4 Ctrl+↓ ×4 Shift+→ ×2 Shift+↓ F4 Alt W V G`,
  labels: `Ctrl+Home → ×3 Ctrl+↓ Ctrl+Shift+↓ ×11 Alt H B R → Shift+↓ Alt H H → ↵ Ctrl+Home → Ctrl+↓ ↓ ×3 "Retail wash revenue" ↵ "Membership revenue" ↵ "Other revenue (1)" ↵ "Total revenue" ↵ ↓ ×2 "Chemicals and water" ↵ "Labor" ↵ "Rent" ↵ "Utilities" ↵ "Maintenance" ↵ "Card fees" ↵ "Marketing" ↵ "Total site costs" ↵ ↓ "Site contribution" ↵ "Head office" ↵ Ctrl+↓ ×3 ↓ "Sites (year end)" ↵ "Washes (thousands)" ↵ "Revenue per wash ($)" ↵ Ctrl+I "Source: management accounts; FY25 and FY26 audited; FY27 per the September budget" ↵ Ctrl+I "(1) Detailing and vending" ↵`,
  layout: `Ctrl+Home Alt H O W "2" ↵ → Ctrl+↓ Ctrl+Shift+↓ ×8 Shift+↓ ×5 Alt H O I Ctrl+↑ → Shift+→ ×2 Alt H O W "12" ↵ Alt H O H "24" ↵ Ctrl+↓ ↓ Alt W F F Ctrl+↓ ×3 Shift+↓ ×6 Shift+Space Alt+Shift+→ ↓ Ctrl+↓ ×3 ↓ ×2 Shift+↓ ×4 Shift+Space Alt+Shift+→ ↓ Ctrl+↓ ×2 Shift+↓ ×2 Shift+Space Alt+Shift+→`,
  monthly: `Ctrl+G "'P&L'!B6:B30" ↵ Ctrl+C Ctrl+G "Monthly!B6" ↵ Ctrl+V Esc ↓ ×3 "Other revenue" ↵ Ctrl+↑ ×2 "Month ending" ↵ ↑ Ctrl+B Ctrl+→ → ×2 "-1" ↵ ↑ Ctrl+C Ctrl+G "Monthly!C13:N19" ↵ Ctrl+Alt+V M ↵ Ctrl+G "Monthly!C23:N23" ↵ Ctrl+Alt+V M ↵ Esc Ctrl+G "Monthly!Q4" ↵ Delete Ctrl+G "Monthly!C22" ↵ "=C10+C20" ↵ ↓ "=C22+C23" ↵ Ctrl+G "Monthly!C22:N22" ↵ Ctrl+R Ctrl+G "Monthly!C24:N24" ↵ Ctrl+R Ctrl+G "'P&L'!C27:C30" ↵ Ctrl+C Ctrl+G "Monthly!C27:O30" ↵ Ctrl+V Esc Ctrl+G "Monthly!D30:N30" ↵ "=D10/C10-1" Ctrl+↵ Ctrl+G "'P&L'!C6:C24" ↵ Ctrl+C Ctrl+G "Monthly!C6:O24" ↵ Ctrl+Alt+V T ↵ Esc Ctrl+G "Monthly!O7:O24" ↵ Ctrl+1 F Alt+C ← ×5 ↵`,
  heads: `Ctrl+Home '=Inputs!B3&" - FY27 by month"' ↵ ↑ Ctrl+B Alt H F G Ctrl+G "Monthly!A1:O1" ↵ Ctrl+1 A Alt+H ↓ ×4 ↵ ↓ "=Inputs!B17" ↵ ↑ Ctrl+I Ctrl+G "Monthly!C4" ↵ Alt H F C → ×4 ↵ → "=EOMONTH(C4,1)" ↵ Ctrl+G "Monthly!D4:N4" ↵ Ctrl+R ← Ctrl+Shift+→ Ctrl+1 N Tab D Alt+T ↓ ×7 ↵ Ctrl+B Alt H A R Shift+← Alt H H → ↵ Ctrl+→ "Full year" ↵ ↑ Alt H W Ctrl+G "Monthly!C5:N5" ↵ '=TEXT(C4,"mmmm yyyy")' Ctrl+↵ Ctrl+I Alt H A R`,
  foot: `Ctrl+G "Monthly!B31" ↵ Ctrl+I "Source: FY27E budget by month, September" ↵ ↓ Ctrl+B "Checks" ↵ Alt H 6 "Full year revenue less the P&L" ↵ Alt H 6 "Full year EBITDA less the P&L" ↵ ↑ ×2 → "=O10-'P&L'!E10" ↵ "=O24-'P&L'!E24" ↵ ↑ Shift+↑ ${CODE(CHECK)} Ctrl+Home Alt H O W "2" ↵ Ctrl+G "Monthly!B4:B30" ↵ Alt H O I Ctrl+G "Monthly!C4:O4" ↵ Alt H O W "12" ↵ ↓ Alt W F F Alt W V G`,
  navigation: `Ctrl+G "Monthly!Q4" ↵ Ctrl+B "Go to" ↵ "Revenue" ↵ "Site costs" ↵ "EBITDA" ↵ Ctrl+G "Monthly!B10:O10" ↵ Alt M M D "Rev" ↵ Ctrl+G "Monthly!B20:O20" ↵ Alt M M D "SiteCosts" ↵ Ctrl+G "Monthly!B24:O24" ↵ Alt M M D "EBITDA" ↵`,
  rules: `Ctrl+G "Monthly!C10:N10" ↵ Alt H L H L "${slow}" → ↵ Ctrl+G "'P&L'!C39:C40" ↵ ${CODE(CHECK)} Alt H L N "=C39<>0" ↵ Ctrl+↑ ×4 Shift+→ ×2 Shift+↓ ×3 Alt H L H L "0" → ×4 ↵ Alt H L R ↓ U S ↵ Ctrl+G "'P&L'!A1" ↵`,
  print: [
    `Ctrl+PgDn ×3 Ctrl+Home '=Inputs!B3&" - Summary financials"' ↵ ↑ Ctrl+B Alt H F G Ctrl+G "Print!A1:E1" ↵ Ctrl+1 A Alt+H ↓ ×4 ↵ ↓ "=Inputs!B17" ↵ ↑ Ctrl+I ↓ ×2 → '="Fiscal years "&TEXT(' "'P&L'!C4," '"yyyy")&" to "&TEXT(' "'P&L'!E4," '"yyyy")' ↵ ↑ Ctrl+B Alt H F C → ×8 ↵ → '="FY"&TEXT(' "'P&L'!C4," '"yy")&' "'P&L'!C5" ↵ ↑ Shift+→ ×2 Ctrl+R Ctrl+B Alt H A R Alt H F C → ×8 ↵ Ctrl+Home`,
    ...Object.entries(PRINT_KEYS).map(([k, v]) => (k === 'labels' ? v.replace('Ctrl+PgDn ×3 ', '') : v)),
  ].join(' '),
  setup: 'Alt P O L Alt P S P Alt+F Tab 2 ↵ Alt P I "1:5" ↵ Alt P S P H Alt+U "&[File]" Alt+C "Page &[Page] of &[Pages]" Alt+R "&[Date]" ↵ ↵ Alt P S P M Alt+Z ↵',
});

// date-function, text-function and concatenate-amp (taught in 2.6) join timeline, inputs and heads once 2.6 is in the catalog
const REQUIRES = {
  formats: ['custom-number-format', 'format-cells-dialog', 'line-formats', 'f4-repeat', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow', 'arrow-keys'],
  signs: ['paste-special-operation', 'copy-cut-paste', 'formula-basics', 'fill-down-right', 'delete-clears', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'],
  margins: ['margins-and-growth', 'cagr', 'type-to-enter', 'fill-down-right', 'custom-number-format', 'bold-italic-underline', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'],
  timeline: ['custom-date-code', 'cross-sheet-ref', 'font-color', 'link-colour-convention', 'align-command', 'tab-commits', 'keytips', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'],
  inputs: ['format-units', 'hide-zeros', 'custom-number-format', 'go-to', 'font-color', 'keytips'],
  anatomy: ['center-across', 'bold-italic-underline', 'borders-menu', 'font-color', 'input-colour-convention', 'f4-repeat', 'row-col-select', 'delete-clears', 'gridlines', 'sheet-tabs', 'keytips', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'],
  labels: ['borders-menu', 'fills-and-colours', 'replace-by-typing', 'bold-italic-underline', 'ctrl-home-end', 'ctrl-arrow', 'ctrl-shift-arrow', 'keytips', 'arrow-keys'],
  layout: ['column-width', 'autofit', 'row-height', 'freeze-panes', 'group-ungroup', 'row-col-select', 'ctrl-home-end', 'ctrl-arrow', 'shift-arrow', 'keytips', 'arrow-keys'],
  monthly: ['go-to', 'copy-cut-paste', 'paste-special', 'paste-special-operation', 'formula-basics', 'fill-down-right', 'ctrl-enter-fill', 'format-cells-dialog', 'format-cells-tabs', 'font-color', 'replace-by-typing', 'arrow-keys'],
  heads: ['date-format', 'center-across', 'format-cells-dialog', 'fill-down-right', 'ctrl-enter-fill', 'fills-and-colours', 'wrap-text', 'align-command', 'go-to', 'keytips', 'arrow-keys'],
  foot: ['check-cell', 'cross-sheet-ref', 'custom-number-format', 'column-width', 'autofit', 'freeze-panes', 'gridlines', 'go-to', 'bold-italic-underline', 'keytips', 'arrow-keys'],
  navigation: ['defined-name', 'go-to', 'type-to-enter', 'bold-italic-underline', 'keytips'],
  rules: ['conditional-format-code', 'check-cell', 'custom-number-format', 'go-to', 'keytips', 'ctrl-arrow', 'shift-arrow'],
  print: ['summary-links', 'pointing', 'cross-sheet-ref', 'ctrl-enter-fill', 'paste-special', 'font-color', 'link-colour-convention', 'borders-menu', 'column-width', 'autofit', 'freeze-panes', 'gridlines', 'go-to', 'sheet-tabs', 'keytips'],
  setup: ['orientation', 'fit-to-page', 'print-titles', 'page-numbers-footer', 'center-on-page', 'page-setup', 'keytips'],
};
const CONVENTION = { formats: 'D2', signs: 'C4', margins: 'C3', timeline: 'C2', inputs: 'D9', anatomy: 'D6', labels: 'G3', layout: 'C7', monthly: 'E4', heads: 'B2', foot: 'F1', navigation: 'C9', rules: 'F1', print: 'B2', setup: 'G1' };

/** The goal list for one route; the project and the assessment differ only in their text and the slow-month line. */
export function goalsFor(texts, opts = {}) {
  const keys = keysFor(opts);
  return Object.keys(texts).map(id => ({ id, text: texts[id], convention: CONVENTION[id], keys: keys[id], requires: REQUIRES[id],
    check: (s, ses) => CHECKS[id](ses, { anyValue: !!opts.anyThreshold }) && settled(ses) }));
}

const TEXTS = {
  formats: 'On the P&L give C7:E24 the desk number format, $ on rows 7, 10 and 24, and the memo rows 33 to 35 their own codes.',
  signs: 'Turn the costs in rows 13 to 19 and 23 negative with Paste Special Multiply, then make C22 and C24 additions filled to E.',
  margins: 'Head the Margins and growth block at B26, four margin lines in C27:E30 in italic percent, and the CAGR in F30.',
  timeline: 'Link C4 to Inputs B6 and step D4:E4 a year with EOMONTH, FY codes in green, the A, A and E flags in row 5.',
  inputs: 'On Inputs give B12:B16 their unit codes, then the units line in B17, the next update in B18 and the headline in B19.',
  anatomy: 'Give the P&L its anatomy: clear column A, title and units line from Inputs, sections bold, lines indented, totals ruled, inputs blue.',
  labels: 'Draw the A/E divider down D4:D35, then retype the labels B7:B35 in sentence case with the source and footnote in B36:B37.',
  layout: 'Set the P&L widths, the title row to 24, freeze panes at C5, and group rows 13 to 19, 26 to 30 and 33 to 35.',
  monthly: 'Bring Monthly to the P&L: labels into B6:B30, costs negative, rows 22 and 24 as additions, the margins block and Paste Formats.',
  heads: 'Head Monthly: title and units line from Inputs, month ends in D4:N4 by EOMONTH, C4 blue, month names in C5:N5 by TEXT.',
  foot: 'Finish Monthly with its source in B31, two checks against the P&L in C34:C35, the P&L widths, panes at C5 and gridlines off.',
  navigation: 'Type the Go to column in Q4:Q7, then name Monthly rows 10, 20 and 24 as Rev, SiteCosts and EBITDA.',
  rules: 'Add the rules: Monthly C10:N10 yellow below 4,500, the P&L checks C39:C40 light red and stopping, negative margins in red text.',
  print: 'Build Print from links: title, period line and FY heads, six lines pointed at the P&L, formats, its check, divider and layout.',
  setup: 'In Page Setup, Alt, P, S, P, set the pack landscape, one page wide by two tall, rows 1:5 repeated, the three-part footer, centered.',
};
const GOALS = goalsFor(TEXTS);

export default {
  id: 'ch2-project',
  chapter: 'formatting',
  section: 'Project and assessment',
  module: 'ch2-project-and-assessment',
  workbook: 'clearcoat-pnl',
  kind: 'project',
  state: { before: 'S8raw', after: 'S8done' },
  title: 'Project: the historical financials section',
  difficulty: 'hard',
  tags: ['project', 'pnl', 'format', 'print'],
  access: 'paid',
  minutes: 15,
  headline: 'Ctrl+1',
  conventions: ['B1', 'B2', 'C2', 'C4', 'C7', 'C9', 'D2', 'D5', 'D6', 'D9', 'F1', 'G1', 'G3'],
  uses: [...new Set(Object.values(REQUIRES).flat())],
  prerequisites: ['challenge-print-pack'],
  brief: 'A fresh export has landed: the same accounting system, the same faults, a year on, FY25A to FY27E. Everything the chapter taught goes onto this one workbook until the P&L, Monthly and Print are ready for the data room. No clock, and nothing here is new. The key is `Ctrl+1`.',
  wow: 'You took a raw export to a three-page financials section in one sitting, and that is Chapter 2.',
  goals: [
    ...GOALS,
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "\'P&L\'!C7" Enter "20000" Enter Ctrl+G "Print!C5" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Change FY25A retail wash revenue on the P&L and watch Print C5 answer while every check stays at zero.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The P&L reads to the standard: formats by line, costs negative, margins, real dates, anatomy, labels, divider and groups', check: (s, ses) => ['formats', 'signs', 'margins', 'timeline', 'anatomy', 'labels', 'layout'].every(k => CHECKS[k](ses)) },
    { text: 'Monthly matches the P&L, its heads are formulas, and its checks read zero', check: (s, ses) => ['monthly', 'heads', 'foot', 'navigation'].every(k => CHECKS[k](ses)) },
    { text: 'Print is linked from the detail and the pack is set to print', check: (s, ses) => CHECKS.print(ses) && CHECKS.setup(ses) },
  ],
  closing: [
    'A raw export in, three pages out: the P&L formatted by line with its signs stated, Monthly built to the same standard, Print reading from both, and the pack set to print.',
    'A buyer’s analyst opens the section and checks what the checks check, then that every figure carries its unit and every page fits the paper. Now the same section on the clock.',
  ],
  solution: hintToScript(GOALS.map(g => g.keys).join(' ')),
};
