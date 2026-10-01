// Chapter 1 · 1.8.P — Project: the weekly KPI report (clearcoat-weekly, S8raw → S8done)
// The CFO's next feed arrived (Week of Sep 22) and the Report is blank. Page one of the Project
// Rinse pack gets built start to finish, the way the chapter built it: the title and units line,
// the headers, the site list from Inputs and the week label, one row of links and formulas pointed
// across sheets and filled down in one Ctrl+D, the total row by Alt+= over the block, the number
// formats with $ on the first and total rows, the daily block linked to Raw's by-day block through
// Go To Special blanks and one Ctrl+Enter, the checks row reading zero, the layout and the print
// set-up. Fourteen goals, no teach lines: nothing here is new. The closer moves one wash figure on
// Raw and the Total answers while the checks stay zero.
import { SITES, WEEK_NEXT, REPORT_TITLE_NEXT, UNITS_LINE, HEADERS_NEXT, CHECK_LINES_NEXT, REPORT_NEXT, RAW_BYDAY, RAW_TOTALS, REPORT_PAGE_SETUP, TITLE_FSZ, INPUT_ROWS, stateOf } from '../workbooks/clearcoat-weekly.js';
import { hintToScript } from '../../app/runner.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) < 1e-6;
const normFormula = f => String(f || '').replace(/\s/g, '').toUpperCase();
const sameFormula = (rep, ref, want) => normFormula(rep.formula(ref)) === normFormula(want);
/** Same words: a keyboard hyphen counts as a dash in 'Margin within 0-100%' (nobody can type an en dash). */
const sameText = (a, b) => String(a ?? '').replace(/[–—]/g, '-').trim() === String(b).replace(/[–—]/g, '-').trim();

const R = REPORT_NEXT;
const SITE_ROWS = R.siteRows;                        // 5–9: the five feed sites
const T = R.totalRow;                                // 10
const FIRST = SITE_ROWS[0], LAST = SITE_ROWS[SITE_ROWS.length - 1];
const DAILY_ROWS = R.dailyRows;                      // 14–18
const DAY_COLS = R.dayCols;                          // B:G
const CHECKS = R.checksRow;                          // 20: the heading; the three lines sit on 21–23
const DONE = stateOf('S8done').sheets[0];            // the page as it must land: widths and the header row's height are read from it
const SITES_FROM = `A${INPUT_ROWS.sites[0]}:A${INPUT_ROWS.sites[INPUT_ROWS.sites.length - 1]}`;   // Inputs A18:A22

const fmtIs = (c, style, decimals) => c.fmtStyle === style && (c.decimals || 0) === decimals;
const green = c => c.fontColor === 'green';
/** `ref` holds exactly `want` (spacing ignored) and reads a finite number. */
const holds = (rep, ref, want) => sameFormula(rep, ref, want) && isNum(rep.value(ref));
/** E<r> multiplies the washes cell by the cost per wash on Inputs, anchored both ways, either operand order. */
const costLinked = (rep, r) => { const f = normFormula(rep.formula('E' + r)); return (f === `=C${r}*INPUTS!$B$4` || f === `=INPUTS!$B$4*C${r}`) && isNum(rep.value('E' + r)); };

const titleIn = rep => { const c = rep.cellAt('A1'); return c.value === REPORT_TITLE_NEXT && c.bold === true && c.fsz === TITLE_FSZ; };
const unitsIn = rep => { const c = rep.cellAt('A2'); return c.value === UNITS_LINE && c.it === true; };
const headersIn = rep => HEADERS_NEXT.every((h, i) => { const c = rep.cellAt(String.fromCharCode(65 + i) + '4'); return c.value === h && c.bold === true && (i < 2 || (c.align === 'r' && c.wrap === true)); });
const titleAcross = rep => rep.cellAt('A1').ca === 8;
const sitesIn = rep => SITE_ROWS.every((r, i) => rep.value('A' + r) === SITES[i]);
const weekIn = rep => SITE_ROWS.every(r => rep.value('B' + r) === WEEK_NEXT);
/** Row r's washes and revenue link to Raw's site-totals row rr, wash cost reads the cost per wash on Inputs; all three green. */
const linkRow = (rep, r, rr) => holds(rep, 'C' + r, `=Raw!${RAW_TOTALS.cols.washes}${rr}`) && holds(rep, 'D' + r, `=Raw!${RAW_TOTALS.cols.revenue}${rr}`) && costLinked(rep, r)
  && ['C', 'D', 'E'].every(col => green(rep.cellAt(col + r)));
const calcRow = (rep, r) => holds(rep, 'F' + r, `=D${r}-E${r}`) && holds(rep, 'G' + r, `=D${r}/C${r}`) && holds(rep, 'H' + r, `=F${r}/D${r}`);
const allRowsLinked = rep => SITE_ROWS.every((r, i) => linkRow(rep, r, RAW_TOTALS.firstRow + i));
const allRowsCalc = rep => SITE_ROWS.every(r => calcRow(rep, r));
const totalsIn = rep => rep.value('A' + T) === 'Total'
  && ['C', 'D', 'E', 'F'].every(col => holds(rep, col + T, `=SUM(${col}${FIRST}:${col}${LAST})`))
  && holds(rep, 'G' + T, `=D${T}/C${T}`) && holds(rep, 'H' + T, `=F${T}/D${T}`);
const ROWS_ALL = [...SITE_ROWS, T];
const formatsIn = rep => ROWS_ALL.every(r => fmtIs(rep.cellAt('C' + r), 'comma', 0) && fmtIs(rep.cellAt('G' + r), 'currency', 2) && fmtIs(rep.cellAt('H' + r), 'percent', 1) && rep.cellAt('H' + r).it === true)
  && ROWS_ALL.every(r => ['D', 'E', 'F'].every(col => fmtIs(rep.cellAt(col + r), r === FIRST || r === T ? 'currency' : 'comma', 0)));
const totalStyled = rep => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].every(col => { const c = rep.cellAt(col + T); return c.bold === true && c.bt === true; });
const dailyHeadings = rep => rep.value('A' + R.dailyTitleRow) === 'Washes by day' && rep.cellAt('A' + R.dailyTitleRow).bold === true
  && rep.value('A' + R.dailyHeaderRow) === 'Site' && rep.cellAt('A' + R.dailyHeaderRow).bold === true
  && RAW_BYDAY.days.every((d, j) => { const c = rep.cellAt(DAY_COLS[j] + R.dailyHeaderRow); return c.value === d && c.bold === true && c.align === 'r'; })
  && DAILY_ROWS.every((r, i) => { const c = rep.cellAt('A' + r); return c.value === SITES[i] && c.indent === 1; });
const dailyLinked = rep => DAILY_ROWS.every((r, i) => DAY_COLS.every((col, j) => { const c = rep.cellAt(col + r);
  return sameFormula(rep, col + r, `=Raw!${RAW_BYDAY.dayCols[j]}${RAW_BYDAY.firstRow + i}`) && isNum(c.value) && green(c) && fmtIs(c, 'comma', 0); }));
const checksIn = rep => rep.value('A' + CHECKS) === 'Checks' && rep.cellAt('A' + CHECKS).bold === true
  && CHECK_LINES_NEXT.every(([label, formula], i) => { const r = CHECKS + 1 + i; const c = rep.cellAt('B' + r);
    return sameText(rep.value('A' + r), label) && rep.cellAt('A' + r).indent === 1 && sameFormula(rep, 'B' + r, formula) && near(c.value, 0) && fmtIs(c, 'comma', 0); });
const widthsIn = rep => [1, 2, 3, 4, 5, 6, 7, 8].every(c => rep.colSet[c] && rep.colW[c] === DONE.colW[c]) && rep.rowH[4] === DONE.rowH[4];
const frozenAtB5 = rep => rep.freeze && rep.freeze.r === 4 && rep.freeze.c === 1;
const setup = ses => (ses.settings && ses.settings.pageSetup) || {};
const printReady = ses => { const p = setup(ses), w = REPORT_PAGE_SETUP; const f = p.footer || {};
  return p.orientation === w.orientation && p.scaling === w.scaling && p.fitWide === w.fitWide && p.fitTall === w.fitTall && p.titlesRows === w.titlesRows
    && f.left === w.footer.left && f.right === w.footer.right && !f.centre && !p.printGridlines; };

const HEADER_RUN = HEADERS_NEXT.map(h => `"${h}"`).join(' Tab ');
const LABEL_RUN = CHECK_LINES_NEXT.map(l => `↓ "${l[0]}" ↵`).join(' ');
const DAY_RUN = RAW_BYDAY.days.map(d => `"${d}"`).join(' Tab ');
const DESK_FORMAT = 'Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N ↓ ↓ ↵';   // Format Cells: Number, 0 decimals, the separator, (1,234)
const CURRENCY_2 = 'Ctrl+1 N Tab C Alt+N ↓ ↓ ↵';                 // Currency, 2 decimals, ($1,234)
const CURRENCY_0 = 'Ctrl+1 N Tab C Alt+D 0 ↵';                   // Currency on a desk-format cell: 0 decimals, the parentheses kept

const KEYS = {
  'title-units': `Ctrl+B Alt H F G "${REPORT_TITLE_NEXT}" ↵ ↓ Ctrl+I "${UNITS_LINE}" ↵`,
  headers: `↓ ×2 ${HEADER_RUN} ↵ ↑ Ctrl+Shift+→ Ctrl+B → ×2 Ctrl+Shift+→ Alt H A R Alt H W Ctrl+→ Ctrl+↑ Ctrl+Shift+← Ctrl+1 A Alt+H ↓ ×4 ↵`,
  'sites-week': `Ctrl+PgDn ×2 Ctrl+↓ ×2 ↓ Ctrl+Shift+↓ Ctrl+C Ctrl+PgUp ×2 Ctrl+← Ctrl+↓ ×2 ↓ ↵ → "${WEEK_NEXT}" ↵ ← Ctrl+↓ → Ctrl+Shift+↑ Ctrl+D`,
  'link-row': 'Ctrl+↑ ↓ → "=" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ ↓ Tab "=" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ → ↓ Tab "=" ← ×2 "*" Ctrl+PgDn ×2 → Ctrl+↑ ×2 ↓ F2 F4 ↵ ← ×2 Shift+→ ×2 Alt H F C → ×8 ↵',
  'calc-row': '→ ×3 "=" ← ×2 "-" ← Tab "=" ← ×3 "/" Ctrl+← ×2 → ×2 Tab "=" ← ×2 "/" Ctrl+← ×2 → ×3 ↵',
  'fill-down': '↑ Ctrl+← → ×2 Ctrl+Shift+End Ctrl+D',
  'total-row': 'Shift+↓ Shift+← ×2 Alt+= Ctrl+↓ Ctrl+→ → "=" ← ×3 "/" Ctrl+← ×2 Tab "=" ← ×2 "/" Ctrl+← ×2 → ↵ ↑ Ctrl+← ×2 "Total" ↵',
  'number-formats': `Ctrl+↑ ↓ → ×2 Ctrl+Shift+↓ Shift+→ ×3 ${DESK_FORMAT} Ctrl+→ ← Ctrl+Shift+↓ ${CURRENCY_2} → Ctrl+Shift+↓ Ctrl+Shift+5 Alt H 0 Ctrl+I Ctrl+← → ×3 Shift+→ ×2 ${CURRENCY_0} Ctrl+↓ Shift+→ ×2 F4`,
  'total-style': 'Shift+Space Ctrl+B Alt H B P',
  'daily-headings': `Ctrl+← ×2 ↓ ×2 Ctrl+B "Washes by day" ↵ ↓ Ctrl+B "Site" Tab ${DAY_RUN} ↵ ↑ → Ctrl+Shift+→ Ctrl+B Alt H A R Ctrl+← Ctrl+↑ ×3 ↓ Ctrl+Shift+↓ Shift+↑ Ctrl+C Ctrl+↓ ×3 ↓ ↵ Ctrl+Shift+↓ Alt H 6`,
  'daily-links': `↑ Ctrl+Shift+↓ Shift+→ ×6 Alt H F D S K ↵ "=" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ ×3 ↓ Ctrl+↵ ${DESK_FORMAT} Alt H F C → ×8 ↵`,
  checks: `Ctrl+← Ctrl+↓ ↓ ×2 Ctrl+B "Checks" ↵ ${LABEL_RUN} Ctrl+Shift+↑ Shift+↓ Alt H 6 ↑ ×2 → "=D10-" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ ×2 → ↵ ↓ "${CHECK_LINES_NEXT[1][1]}" ↵ ↓ "${CHECK_LINES_NEXT[2][1]}" ↵ Ctrl+Shift+↑ ${DESK_FORMAT}`,
  layout: 'Ctrl+Home Ctrl+↓ ×2 → Ctrl+Shift+→ Shift+← ×2 Ctrl+Space Alt H O W "12" ↵ Ctrl+→ Shift+← Ctrl+Space Alt H O W "14" ↵ Ctrl+← ↓ Ctrl+Shift+↓ ×3 Alt H O I Ctrl+↑ Shift+Space Alt H O A',
  'print-ready': '↓ → Alt W F F Alt W V G Alt P S P Alt+L Alt+F Alt+R "1:4" Ctrl+PgUp Alt+U "&[File]" Alt+R "&[Date]" ↵ ↵',
};
/** A hint as a solution script: glyphs to key names, ×N repeats (the runner's own reading of a hint). */
const script = keys => hintToScript(keys);

export default {
  id: 'weekly-kpi-project',
  chapter: 'foundations',
  section: 'Project and assessment',
  module: 'project-and-assessment',
  workbook: 'clearcoat-weekly',
  kind: 'project',
  state: { before: 'S8raw', after: 'S8done' },
  title: 'Project: the weekly KPI report',
  difficulty: 'hard',
  tags: ['project', 'report', 'formulas', 'format', 'print'],
  access: 'free',
  minutes: 12,
  headline: 'Ctrl+PgDn',
  conventions: ['B1', 'B2', 'B4', 'C5', 'D1', 'D2', 'D5', 'D7', 'F1', 'G1'],
  uses: ['type-to-enter', 'bold-italic-underline', 'keytips', 'tab-commits', 'ctrl-shift-arrow', 'align-command', 'wrap-text', 'center-across', 'format-cells-dialog', 'ctrl-arrow', 'arrow-keys', 'sheet-tabs', 'copy-cut-paste', 'paste-enter-drop', 'fill-down-right', 'shift-arrow', 'cross-sheet-ref', 'pointing', 'formula-operators', 'f4-anchor', 'edit-mode-f2', 'font-color', 'input-colour-convention', 'ctrl-home-end', 'autosum', 'sum-family', 'number-formats', 'f4-repeat', 'row-col-select', 'borders-menu', 'go-to-special', 'ctrl-enter-fill', 'check-cell', 'formula-basics', 'column-width', 'autofit', 'freeze-panes', 'gridlines', 'page-setup', 'orientation', 'fit-to-page', 'print-titles'],
  prerequisites: ['challenge-audit-before-you-send'],
  brief: 'The CFO\'s next feed is in, Week of Sep 22, and the Report is blank: page one of the pack, the first document a buyer opens, is yours to build start to finish. Every step is one the chapter taught, from the title to the print set-up, and the page must tie before it goes out. From a garbled workbook to a finished page, in one sitting. The key is `Ctrl+PgDn`.',
  wow: 'You took a raw feed to a signed-off page in one sitting, and that is Chapter 1.',
  goals: [
    { id: 'title-units', text: `In A1 type "${REPORT_TITLE_NEXT}", bold and one size up; A2 italic: USD unless stated.`, convention: 'C5',
      keys: KEYS['title-units'], requires: ['type-to-enter', 'bold-italic-underline', 'keytips', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && titleIn(rep) && unitsIn(rep) && settled(ses); } },
    { id: 'headers', text: 'Tab the eight headers, Site to Margin %, into A4:H4; bold them, right-align and wrap C4:H4, then center the title across A1:H1.', convention: 'D7',
      keys: KEYS.headers, requires: ['type-to-enter', 'tab-commits', 'bold-italic-underline', 'ctrl-shift-arrow', 'align-command', 'wrap-text', 'center-across', 'format-cells-dialog', 'ctrl-arrow', 'arrow-keys', 'keytips'],
      check: (s, ses) => { const rep = report(ses); return !!rep && headersIn(rep) && titleAcross(rep) && settled(ses); } },
    { id: 'sites-week', text: `Copy the five site names from Inputs ${SITES_FROM} into A5:A9, then type Week of Sep 22 in B5 and fill it down to B9.`,
      keys: KEYS['sites-week'], requires: ['sheet-tabs', 'copy-cut-paste', 'paste-enter-drop', 'fill-down-right', 'type-to-enter', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && sitesIn(rep) && weekIn(rep) && settled(ses); } },
    { id: 'link-row', text: 'Point C5 and D5 at Raw\'s I8 and J8 across sheets, E5 at C5 × the cost per wash on Inputs anchored, all three green.', convention: 'B2',
      keys: KEYS['link-row'], requires: ['cross-sheet-ref', 'pointing', 'formula-operators', 'f4-anchor', 'edit-mode-f2', 'font-color', 'input-colour-convention', 'sheet-tabs', 'ctrl-arrow', 'shift-arrow', 'arrow-keys', 'keytips'],
      check: (s, ses) => { const rep = report(ses); return !!rep && linkRow(rep, FIRST, RAW_TOTALS.firstRow) && settled(ses); } },
    { id: 'calc-row', text: 'Point Domain\'s gross profit F5 =D5-E5, average ticket G5 =D5/C5 and margin H5 =F5/D5, one after another with Tab.', convention: 'B4',
      keys: KEYS['calc-row'], requires: ['pointing', 'formula-operators', 'formula-basics', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && linkRow(rep, FIRST, RAW_TOTALS.firstRow) && calcRow(rep, FIRST) && settled(ses); } },
    { id: 'fill-down', text: 'Row 5 is the page\'s one formula row: select C5:H9 and fill it down the five sites with Ctrl+D.',
      keys: KEYS['fill-down'], requires: ['fill-down-right', 'ctrl-home-end', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && allRowsLinked(rep) && allRowsCalc(rep) && settled(ses); } },
    { id: 'total-row', text: 'Select C5:F10, the block plus its blank edge: one Alt+= totals every column; point G10 =D10/C10 and H10 =F10/D10; type Total in A10.', convention: 'D5',
      keys: KEYS['total-row'], requires: ['autosum', 'sum-family', 'pointing', 'formula-operators', 'type-to-enter', 'shift-arrow', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && totalsIn(rep) && settled(ses); } },
    { id: 'number-formats', text: 'Format C5:F10 in the desk number format, G5:G10 currency 2, H5:H10 percent 1 italic, then currency 0 on D5:F5 and again on D10:F10 with F4.', convention: 'D2',
      keys: KEYS['number-formats'], requires: ['number-formats', 'format-cells-dialog', 'f4-repeat', 'bold-italic-underline', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow', 'arrow-keys', 'keytips'],
      check: (s, ses) => { const rep = report(ses); return !!rep && formatsIn(rep) && settled(ses); } },
    { id: 'total-style', text: 'The Total row is bold with a top border, never a grid: select the whole row 10 with Shift+Space, Ctrl+B, then Alt, H, B, P.', convention: 'D5',
      keys: KEYS['total-style'], requires: ['row-col-select', 'bold-italic-underline', 'borders-menu', 'keytips'],
      check: (s, ses) => { const rep = report(ses); return !!rep && totalStyled(rep) && settled(ses); } },
    { id: 'daily-headings', text: 'Head the daily block: A12 Washes by day bold, A13:G13 Site and Mon to Sat bold with the days right-aligned, A14:A18 the sites indented.',
      keys: KEYS['daily-headings'], requires: ['type-to-enter', 'tab-commits', 'bold-italic-underline', 'align-command', 'copy-cut-paste', 'paste-enter-drop', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow', 'arrow-keys', 'keytips'],
      check: (s, ses) => { const rep = report(ses); return !!rep && dailyHeadings(rep) && settled(ses); } },
    { id: 'daily-links', text: 'Select A13:G18, Go To Special for Blanks, point one link at Raw\'s I32 and Ctrl+Enter fills all thirty cells; desk number format, green.', convention: 'B2',
      keys: KEYS['daily-links'], requires: ['go-to-special', 'ctrl-enter-fill', 'cross-sheet-ref', 'pointing', 'number-formats', 'format-cells-dialog', 'font-color', 'sheet-tabs', 'ctrl-shift-arrow', 'ctrl-arrow', 'arrow-keys', 'keytips'],
      check: (s, ses) => { const rep = report(ses); return !!rep && dailyLinked(rep) && settled(ses); } },
    { id: 'checks', text: 'Head a Checks block at A20, three labels indented; B21:B23 hold the checks, reading 0 in the desk format, the first pointed at Raw\'s J13.', convention: 'F1',
      keys: KEYS.checks, requires: ['check-cell', 'sum-family', 'formula-basics', 'formula-operators', 'cross-sheet-ref', 'pointing', 'number-formats', 'format-cells-dialog', 'type-to-enter', 'bold-italic-underline', 'sheet-tabs', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow', 'arrow-keys', 'keytips'],
      check: (s, ses) => { const rep = report(ses); return !!rep && checksIn(rep) && settled(ses); } },
    { id: 'layout', text: 'Set columns B:F to width 12 and G:H to 14, then AutoFit column A to its site names A5:A18 and row 4 to its wrapped headers.',
      keys: KEYS.layout, requires: ['column-width', 'autofit', 'row-col-select', 'ctrl-home-end', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow', 'arrow-keys', 'keytips'],
      check: (s, ses) => { const rep = report(ses); return !!rep && widthsIn(rep) && settled(ses); } },
    { id: 'print-ready', text: 'Freeze panes at B5, gridlines off, then set the page to print: landscape, one page, rows 1:4 repeated, &[File] and &[Date] in the footer.', convention: 'G1',
      keys: KEYS['print-ready'], requires: ['freeze-panes', 'gridlines', 'page-setup', 'orientation', 'fit-to-page', 'print-titles', 'arrow-keys', 'keytips'],
      check: (s, ses) => { const rep = report(ses); return !!rep && frozenAtB5(rep) && rep.gridlines === false && printReady(ses) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Raw!C8" Enter "300" Enter Ctrl+G "Report!C10" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Change Domain\'s Monday washes on Raw to 300 and watch the Total in C10 answer while the checks in B21:B23 stay zero.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C5:E9 are green links to Raw and Inputs; F5:H10 and the total row are live formulas', check: (s, ses) => { const rep = report(ses); return !!rep && allRowsLinked(rep) && allRowsCalc(rep) && totalsIn(rep); } },
    { text: 'The daily block links to Raw\'s by-day block and the three checks read 0', check: (s, ses) => { const rep = report(ses); return !!rep && dailyLinked(rep) && checksIn(rep); } },
    { text: 'The page is centered, sized, frozen at B5, gridlines off and set to print on one landscape page', check: (s, ses) => { const rep = report(ses); return !!rep && titleAcross(rep) && widthsIn(rep) && frozenAtB5(rep) && rep.gridlines === false && printReady(ses); } },
  ],
  closing: [
    'You started with a fresh feed and a blank sheet, and fifteen steps later the report is linked, totaled, formatted and print-ready with its checks at zero.',
    'The CFO would have checked what the checks row checks (revenue ties to the feed, the sites sum to the total, the margin is plausible), then that every link is green, every figure carries the desk\'s format with $ on the first and total rows, and the page prints on one landscape sheet with its heads repeated. Now the same page on the clock.',
  ],
  solution: Object.values(KEYS).map(script).join(' '),
};
