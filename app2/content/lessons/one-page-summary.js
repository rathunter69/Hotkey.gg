// Chapter 2 · 2.7.3 The one-page summary linked from the detail (clearcoat-pnl, S7a → S7b)
// The first page of the financials section is the summary: six lines, three years, every figure a
// link to the P&L, so the summary can never disagree with the detail. Print gets its labels, a row
// of links per line pointed across sheets and committed with Ctrl+Enter, its source and one check,
// the P&L's number formats by Paste Formats, green on every link, the A/E divider, and the widths,
// gridlines and freeze of the other pages. (One Page Setup for the workbook: the pack's from 2.7.1.)
import { hintToScript } from '../../app/runner.js';
import { PRINT, PRINT_LINES, PRINT_CHECK, CODES, YEAR_COLS, DIVIDER_FILL, stateOf } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const print = ses => sheetOf(ses, 'Print');
const settled = ses => !ses.editing && !ses.dialog;
const norm = f => String(f || '').replace(/[\s']/g, '').toUpperCase();
const DONE = stateOf('S7b').sheets.find(s => s.name === 'Print');
const LINE_ROWS = PRINT_LINES.map(([r]) => r);
const FIGS = LINE_ROWS.flatMap(r => YEAR_COLS.map(col => col + r));

const labelled = sh => PRINT_LINES.every(([r, label]) => sh.value('B' + r) === label);
/** Row r of Print links to the P&L's row src, one link per year column. */
const linked = (sh, r, src) => YEAR_COLS.every(col => norm(sh.cellAt(col + r).formula) === norm(`='P&L'!${col}${src}`) && typeof sh.value(col + r) === 'number');
const allLinked = sh => PRINT_LINES.every(([r, , src]) => linked(sh, r, src));
const footIn = sh => { const s = sh.cellAt('B' + PRINT.source), h = sh.cellAt('B' + PRINT.checksHead), l = sh.cellAt('B' + PRINT.check);
  return s.value === 'Source: the P&L sheet' && s.it === true && h.value === 'Checks' && h.bold === true && l.value === PRINT_CHECK[0] && l.indent === 1; };
const checkIn = sh => { const c = sh.cellAt('C' + PRINT.check); return norm(c.formula) === norm(PRINT_CHECK[1]) && sh.value('C' + PRINT.check) === 0 && c.fmtStyle === 'custom' && c.numFmt === CODES.check; };
const CODE_BY_ROW = { 5: CODES.dollar, 6: CODES.plain, 7: CODES.dollar, 8: CODES.pct, 9: CODES.plain, 10: CODES.washes };
const formatted = sh => LINE_ROWS.every(r => YEAR_COLS.every(col => { const c = sh.cellAt(col + r); return c.fmtStyle === 'custom' && c.numFmt === CODE_BY_ROW[r] && (r !== PRINT.margin || c.it === true); }));
const green = sh => FIGS.every(ref => sh.cellAt(ref).fontColor === 'green');
const divided = sh => [4, ...LINE_ROWS].every(r => sh.cellAt('D' + r).br === true) && sh.cellAt('E4').fill === DIVIDER_FILL;
const laidOut = sh => [1, 2, 3, 4, 5].every(c => sh.colSet[c] && sh.colW[c] === DONE.colW[c]) && sh.gridlines === false && !!sh.freeze && sh.freeze.r === 4 && sh.freeze.c === 2;

const LINK = (down, extra = '') => `"=" Ctrl+PgUp ×3 → ×2 Ctrl+↓ ×${down}${extra} Ctrl+↵`;
const KEYS = {
  labels: 'Ctrl+PgDn ×3 → Ctrl+↓ ↓ ' + PRINT_LINES.map(([, label]) => `"${label}" ↵`).join(' '),
  revenue: `Ctrl+↑ ×2 ↓ → Shift+→ ×2 ${LINK(4)}`,
  rows: [LINK(7), LINK(8), LINK(10), LINK(11), LINK(11, ' ↓')].map(k => `↓ Shift+→ ×2 ${k}`).join(' '),
  foot: `↓ ← Ctrl+I "Source: the P&L sheet" ↵ ↓ Ctrl+B "Checks" ↵ Alt H 6 "${PRINT_CHECK[0]}" ↵`,
  check: `↑ → "=E7-" Ctrl+PgUp ×3 → ×2 Ctrl+↓ ×8 → ×2 ↵ ↑ Ctrl+1 N Tab End Alt+T "${CODES.check}" ↵`,
  formats: 'Ctrl+G "\'P&L\'!C7:E8" ↵ Ctrl+C Ctrl+G "Print!C5:E8" ↵ Ctrl+Alt+V T ↵ Ctrl+G "\'P&L\'!C27:E27" ↵ Ctrl+C Ctrl+G "Print!C8:E8" ↵ Ctrl+Alt+V T ↵ Ctrl+G "\'P&L\'!C33:E34" ↵ Ctrl+C Ctrl+G "Print!C9:E10" ↵ Ctrl+Alt+V T ↵ Esc',
  green: 'Ctrl+↑ ↓ Shift+→ ×2 Ctrl+Shift+↓ Alt H F C → ×8 ↵',
  divider: 'Ctrl+↑ → Ctrl+Shift+↓ Alt H B R → Alt H H → ↵',
  layout: 'Ctrl+Home Alt H O W "2" ↵ → Ctrl+↓ Ctrl+Shift+↓ Shift+↑ Alt H O I Ctrl+↑ → Shift+→ ×2 Alt H O W "12" ↵ Alt W V G Ctrl+↓ ↓ Alt W F F',
};
export default {
  id: 'one-page-summary',
  chapter: 'formatting',
  section: 'Printing and page layout',
  module: 'printing-and-page-layout',
  workbook: 'clearcoat-pnl',
  state: { before: 'S7a', after: 'S7b' },
  title: 'The one-page summary linked from the detail',
  difficulty: 'medium',
  tags: ['print', 'links', 'summary', 'pnl'],
  access: 'paid',
  minutes: 7,
  headline: 'Ctrl+PgDn',
  conventions: ['B2', 'E1', 'F1', 'G2'],
  teaches: ['summary-links'],
  uses: ['sheet-tabs', 'go-to', 'type-to-enter', 'pointing', 'cross-sheet-ref', 'ctrl-enter-fill', 'shift-arrow', 'bold-italic-underline', 'keytips', 'check-cell', 'custom-number-format', 'copy-cut-paste', 'paste-special', 'font-color', 'link-colour-convention', 'borders-menu', 'fills-and-colours', 'column-width', 'autofit', 'gridlines', 'freeze-panes'],
  prerequisites: ['print-areas-titles-footers'],
  brief: 'The first page of the section is the summary: six lines, three years, no detail, and every figure a link to the P&L behind it, so the summary can never disagree with the detail. Build Print from links and format it to the standard. The key is `Ctrl+PgDn`.',
  goals: [
    { id: 'labels', text: 'On Print, type the six labels down B5:B10: Revenue, Site contribution, EBITDA, EBITDA margin, Sites (year end), Washes (thousands).',
      keys: KEYS.labels, requires: ['sheet-tabs', 'go-to', 'type-to-enter'], convention: 'G2',
      hintStuck: 'pulse cell B5 · Print is the last of the pack\'s pages; the labels run down from B5.',
      check: (s, ses) => { const sh = print(ses); return !!sh && labelled(sh) && settled(ses); } },
    { id: 'revenue', text: 'Select Print!C5:E5, type =, point at P&L!C10 across sheets and press Ctrl+Enter for a row of links to total revenue.',
      teach: 'A summary holds no typed figure: every number is a link to the detail behind it, so the two can never disagree. With C5:E5 selected, one pointed link and Ctrl+Enter writes all three, each reading its own year.',
      keys: KEYS.revenue, requires: ['summary-links', 'pointing', 'cross-sheet-ref', 'ctrl-enter-fill', 'shift-arrow'], convention: 'E1',
      hintStuck: 'pulse range C5:E5 · Ctrl+PgUp walks back to the P&L while the formula is open.',
      check: (s, ses) => { const sh = print(ses); return !!sh && linked(sh, 5, 10) && settled(ses); } },
    { id: 'rows', text: 'Link rows 6 to 10 the same way, to P&L rows 22, 24, 29, 33 and 34: site contribution, EBITDA, its margin, sites and washes.',
      keys: KEYS.rows, requires: ['summary-links', 'pointing', 'cross-sheet-ref', 'ctrl-enter-fill'], convention: 'E1',
      hintStuck: 'pulse range C6:E10 · One row at a time: select it, point, Ctrl+Enter.',
      check: (s, ses) => { const sh = print(ses); return !!sh && allLinked(sh) && settled(ses); } },
    { id: 'foot', text: 'Under the lines, put Source: the P&L sheet in B11 in italic, Checks in B13 in bold and Last year EBITDA less the P&L in B14, indented.',
      keys: KEYS.foot, requires: ['bold-italic-underline', 'keytips', 'type-to-enter'], convention: 'G3',
      hintStuck: 'pulse cell B11 · The foot reads like the P&L\'s: the source, then the checks.',
      check: (s, ses) => { const sh = print(ses); return !!sh && footIn(sh) && settled(ses); } },
    { id: 'check', text: 'In C14, point =E7-\'P&L\'!E24 so the check reads zero, and give it the red check code 0_);[Red](0);-_).',
      keys: KEYS.check, requires: ['check-cell', 'pointing', 'cross-sheet-ref', 'custom-number-format'], convention: 'F1',
      hintStuck: 'pulse cell C14 · Last year\'s EBITDA on Print less the same figure on the P&L.',
      check: (s, ses) => { const sh = print(ses); return !!sh && checkIn(sh) && settled(ses); } },
    { id: 'formats', text: 'Bring the P&L\'s number formats onto C5:E10 with Paste Formats, Ctrl+Alt+V then T: lines from C7:E8, margins from C27:E27, memo from C33:E34.',
      keys: KEYS.formats, requires: ['copy-cut-paste', 'paste-special', 'go-to'], convention: 'D4',
      hintStuck: 'pulse range C5:E10 · Copy on the P&L, Paste Special Formats on Print.',
      check: (s, ses) => { const sh = print(ses); return !!sh && formatted(sh) && settled(ses); } },
    { id: 'green', text: 'Every figure on Print is a link to another sheet: turn C5:E10 green with Alt, H, F, C.',
      keys: KEYS.green, requires: ['font-color', 'link-colour-convention'], convention: 'B2',
      hintStuck: 'pulse range C5:E10 · Green is the ninth swatch along.',
      check: (s, ses) => { const sh = print(ses); return !!sh && green(sh) && settled(ses); } },
    { id: 'divider', text: 'Draw the A/E divider on Print: a right border down D4:D10 with Alt, H, B, R, and the gray shade on E4 with Alt, H, H.',
      keys: KEYS.divider, requires: ['borders-menu', 'fills-and-colours'], convention: 'B5',
      hintStuck: 'pulse range D4:D10 · The estimate year is E, so the line runs down the right of D.',
      check: (s, ses) => { const sh = print(ses); return !!sh && divided(sh) && settled(ses); } },
    { id: 'layout', text: 'Lay Print out like the P&L: A at width 2, B fitted over B4:B10, C:E at 12, gridlines off and the panes frozen at C5.',
      keys: KEYS.layout, requires: ['column-width', 'autofit', 'gridlines', 'freeze-panes'], convention: 'C2',
      hintStuck: 'pulse column B · Alt, H, O, W sets a width and Alt, H, O, I fits one.',
      check: (s, ses) => { const sh = print(ses); return !!sh && laidOut(sh) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "\'P&L\'!E7" Enter "27000" Enter Ctrl+G "Print!E5" Enter Ctrl+G "Print!E7" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Watch P&L!E7 change to 27000, and Print\'s revenue in E5 and EBITDA in E7 answer while the check in C14 stays at zero.',
      requires: [],
      hintStuck: 'pulse cell E5 · Every figure on Print is a link, so it moves with the P&L.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Every figure on Print is a green link to the P&L', check: (s, ses) => { const sh = print(ses); return !!sh && allLinked(sh) && green(sh); } },
    { text: 'Print carries the P&L\'s number formats and the A/E divider', check: (s, ses) => { const sh = print(ses); return !!sh && formatted(sh) && divided(sh); } },
    { text: 'The check in C14 reads zero', check: (s, ses) => { const sh = print(ses); return !!sh && checkIn(sh); } },
  ],
  closing: [
    'Every one of the six lines is a link, so the summary can\'t disagree with the detail.',
    'Six lines and three years, each figure pointed at the P&L, formatted from it and shown green, with a check that reads zero. Change any line on the P&L and the summary answers before anyone can ask. The pack is ready for the data room.',
  ],
  solution: hintToScript(Object.values(KEYS).join(' ')),
};
