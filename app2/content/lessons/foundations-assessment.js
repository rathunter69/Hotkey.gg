// Chapter 1 · 1.8.A — Assessment: Monday morning (seeded over S8raw; also the test-out, M26)
// The project's page, built again against a hard clock on the San Antonio cluster's fresh feed:
// the Report carries only what last week's file left on it (the week labels and the old system's
// code column), Raw holds the Week of Sep 22 export, Inputs and Costs are as the chapter left
// them. Sixteen jobs, ten minutes, no teach lines: title and units, the header row, the sites, the
// links, the anchored wash cost, gross profit and margin, the total row, a sixth site inserted
// inside the block, the stale column deleted, the daily block, the checks, the number formats, the
// style pass, the widths and the group, the freeze, Replace All on the week label, the print set-up.
// The seed re-reads one day of each site's figures; the sites, the faults and the keys never move.
import { CLUSTERS, siteNames } from '../workbooks/clusters.js';
import { SITES, COST_PER_WASH, COST_ROWS, INPUT_ROWS, RAW_TOTALS, RAW_BYDAY, HEADERS_NEXT, WEEK_NEXT, THIS_WEEK, UNITS_LINE, TITLE_FSZ, REPORT_PAGE_SETUP, rawRow, stateOf } from '../workbooks/clearcoat-weekly.js';
import { roleColour, noLiteralInFormula, totalsTopBorder, sheetStandard } from '../../app/graders.js';
import { parsFrom } from '../../app/pars.js';
import { hintToScript } from '../../app/runner.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near0 = v => isNum(v) && Math.abs(v) < 1e-6;
const r2 = v => Math.round(v * 100) / 100;
/** Formula text with spacing and anchors ignored (a fill needs no anchor on a link; the check reads the reference). */
const normFormula = f => String(f || '').replace(/\s|\$/g, '').toUpperCase();
/** Formula text with spacing ignored, anchors kept (the wash cost's price must be anchored). */
const exactFormula = f => String(f || '').replace(/\s/g, '').toUpperCase();
/** Same words: a keyboard hyphen counts as a dash in a label (nobody can type an en dash). */
const sameText = (a, b) => String(a ?? '').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim() === String(b ?? '').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();

/** A1-style refs for a rectangular block, column letters inclusive. */
const span = (col1, col2, r1, r2_) => { const out = []; for (let c = col1.charCodeAt(0); c <= col2.charCodeAt(0); c++) for (let r = r1; r <= r2_; r++) out.push(String.fromCharCode(c) + r); return out; };

const CLUSTER = CLUSTERS.find(c => c.city === 'San Antonio');
const CITY_SITES = siteNames(CLUSTER, 5);                                  // The Pearl, Southtown, Alamo Heights, Stone Oak, Medical Center
const NEW_SITE = { name: 'Leon Valley', washes: 240, revenue: 3360, cost: 360 };   // the sixth site, emailed; its figures on Inputs row 26
const NEW_ROW = 26;
const TITLE = `Clearcoat - ${CLUSTER.city} Weekly KPI Report, Week of Sep 22, 2026`;
const OLD_CODES = CITY_SITES.map((_, i) => `SATX-0${i + 1}`);

// The finished page: six site rows (the sixth inserted above the last feed site), the total,
// the daily block over the five feed sites, the checks.
const FEED_ROWS = [5, 6, 7, 8, 10];     // the five feed sites once the sixth is inserted at 9
const NEW = 9;                           // the inserted site
const SITE_ROWS = [5, 6, 7, 8, 9, 10];
const T = 11;
const DAILY_TITLE = 13, DAILY_HEADER = 14, DAILY_ROWS = [15, 16, 17, 18, 19];
const DAY_COLS = ['B', 'C', 'D', 'E', 'F', 'G'];
const CHECKS = 21;
const CHECK_LINES = [
  ['Report revenue ties to the feed', '=SUM(D5:D8,D10)-Raw!J13'],
  ['Sites sum to the total', '=SUM(C5:C10)-C11'],
  ['Margin within 0-100%', '=IF(AND(H11>=0,H11<=1),0,1)'],
];
const HEADER_CELLS = span('A', 'H', 4, 4);
const NUMBER_HEADERS = span('C', 'H', 4, 4);
const DAY_HEADERS = span('B', 'G', DAILY_HEADER, DAILY_HEADER);
const DAILY_BLOCK = span('B', 'G', DAILY_ROWS[0], DAILY_ROWS[4]);
const CHECK_CELLS = span('B', 'B', CHECKS + 1, CHECKS + 3);
const TOTAL_ROW = span('A', 'H', T, T);
const RATES = ['=C5*INPUTS!$B$4', '=INPUTS!$B$4*C5', '=C5*INPUTS!B$4', '=INPUTS!B$4*C5'];   // the anchors a fill needs, either operand order
const S8RAW = stateOf('S8raw');
const COSTS_TITLE = S8RAW.sheets.find(x => x.name === 'Costs').cells.A1;
const INPUTS_B3 = S8RAW.sheets.find(x => x.name === 'Inputs').cells.B3;
const W12 = 12 * 7 + 5, W14 = 14 * 7 + 5;

const bold = (rep, ref) => rep.cellAt(ref).bold === true;
const green = (rep, ref) => rep.cellAt(ref).fontColor === 'green';
const blue = (rep, ref) => rep.cellAt(ref).fontColor === 'blue';
const holds = (rep, ref, want) => normFormula(rep.formula(ref)) === normFormula(want) && isNum(rep.value(ref));
const fmtIs = (rep, ref, style, decimals) => { const c = rep.cellAt(ref); return c.fmtStyle === style && (c.decimals || 0) === decimals; };
const setup = ses => (ses.settings && ses.settings.pageSetup) || {};

const titleIn = rep => { const c = rep.cellAt('A1'); return c.value === TITLE && c.bold === true && c.fsz === TITLE_FSZ && c.ca === 8; };
const unitsIn = rep => { const c = rep.cellAt('A2'); return c.value === UNITS_LINE && c.it === true; };
const headersIn = rep => HEADER_CELLS.every((ref, i) => rep.value(ref) === HEADERS_NEXT[i] && bold(rep, ref)) && NUMBER_HEADERS.every(ref => { const c = rep.cellAt(ref); return c.align === 'r' && c.wrap === true; });
/** Before the sixth site goes in, the five feed sites sit in A5:A9. */
const sitesIn = rep => CITY_SITES.every((site, i) => rep.value('A' + (5 + i)) === site);
const linksIn = rep => CITY_SITES.every((_, i) => { const r = 5 + i, rr = RAW_TOTALS.firstRow + i; return holds(rep, 'C' + r, `=Raw!${RAW_TOTALS.cols.washes}${rr}`) && holds(rep, 'D' + r, `=Raw!${RAW_TOTALS.cols.revenue}${rr}`) && green(rep, 'C' + r) && green(rep, 'D' + r); });
const costIn = rep => [5, 6, 7, 8, 9].every(r => { const c = rep.cellAt('E' + r); return RATES.some(f => exactFormula(c.formula) === f.replace('C5', 'C' + r)) && isNum(c.value) && green(rep, 'E' + r); });
const calcRow = (rep, r) => holds(rep, 'F' + r, `=D${r}-E${r}`) && holds(rep, 'G' + r, `=D${r}/C${r}`) && holds(rep, 'H' + r, `=F${r}/D${r}`);
/** The total row at `t` over site rows `first`..`last`. */
const totalIn = (rep, t, first, last) => sameText(rep.value('A' + t), 'Total')
  && ['C', 'D', 'E', 'F'].every(col => holds(rep, col + t, `=SUM(${col}${first}:${col}${last})`)) && holds(rep, 'G' + t, `=D${t}/C${t}`) && holds(rep, 'H' + t, `=F${t}/D${t}`);
const calcsBefore = rep => [5, 6, 7, 8, 9].every(r => calcRow(rep, r)) && totalIn(rep, 10, 5, 9);
/** The sixth site is in row 9: its name, its three typed figures blue, its formulas filled, the feed sites and the total moved down one. */
const sixthIn = rep => rep.value('A' + NEW) === NEW_SITE.name && rep.value('C' + NEW) === NEW_SITE.washes && rep.value('D' + NEW) === NEW_SITE.revenue && rep.value('E' + NEW) === NEW_SITE.cost
  && ['C', 'D', 'E'].every(col => blue(rep, col + NEW)) && calcRow(rep, NEW) && rep.value('A10') === CITY_SITES[4] && totalIn(rep, T, 5, 10);
const oldCodeGone = rep => !rep.value('I4') && SITE_ROWS.every(r => !rep.value('I' + r)) && rep.value('H4') === HEADERS_NEXT[7];
const dailyIn = rep => rep.value('A' + DAILY_TITLE) === 'Washes by day' && bold(rep, 'A' + DAILY_TITLE)
  && rep.value('A' + DAILY_HEADER) === 'Site' && bold(rep, 'A' + DAILY_HEADER)
  && DAY_HEADERS.every((ref, j) => rep.value(ref) === RAW_BYDAY.days[j] && bold(rep, ref))
  && DAILY_ROWS.every((r, i) => rep.value('A' + r) === CITY_SITES[i] && (rep.cellAt('A' + r).indent || 0) >= 1)
  && DAILY_ROWS.every((r, i) => DAY_COLS.every((col, j) => holds(rep, col + r, `=Raw!${RAW_BYDAY.dayCols[j]}${RAW_BYDAY.firstRow + i}`) && green(rep, col + r)));
const checksIn = rep => sameText(rep.value('A' + CHECKS), 'Checks') && bold(rep, 'A' + CHECKS)
  && CHECK_LINES.every(([label, formula], i) => { const r = CHECKS + 1 + i; return sameText(rep.value('A' + r), label) && normFormula(rep.formula('B' + r)) === normFormula(formula) && near0(rep.value('B' + r)); });
const formatsIn = rep => [...SITE_ROWS, T].every(r => fmtIs(rep, 'C' + r, 'comma', 0) && fmtIs(rep, 'G' + r, 'currency', 2) && fmtIs(rep, 'H' + r, 'percent', 1) && rep.cellAt('H' + r).it === true)
  && [...SITE_ROWS, T].every(r => ['D', 'E', 'F'].every(col => fmtIs(rep, col + r, r === 5 || r === T ? 'currency' : 'comma', 0)))
  && [...DAILY_BLOCK, ...CHECK_CELLS].every(ref => fmtIs(rep, ref, 'comma', 0));
const styleIn = rep => TOTAL_ROW.every(ref => { const c = rep.cellAt(ref); return c.bold === true && c.bt === true; })
  && NUMBER_HEADERS.every(ref => rep.cellAt(ref).align === 'r') && DAY_HEADERS.every(ref => rep.cellAt(ref).align === 'r')
  && !Object.values(rep.cells || {}).some(c => c && c.merged);
/** B:F 12 wide, G:H 14, column A fitted to the site names (not swallowed by the title), row 4 sized to its wrapped headers, E:F grouped. */
const layoutIn = rep => {
  for (let c = 2; c <= 6; c++) if (rep.colW[c] !== W12) return false;
  for (let c = 7; c <= 8; c++) if (rep.colW[c] !== W14) return false;
  const fit = rep.neededWidth(1, 5, DAILY_ROWS[4]);
  if (!rep.colSet[1] || !(rep.colW[1] >= fit && rep.colW[1] <= fit * 1.5)) return false;
  if (!(rep.rowH[4] > rep.rowH[5])) return false;
  return rep.groups.cols.some(g => g.c1 === 5 && g.c2 === 6) && rep.hiddenCols.size === 0;
};
const frozenAtB5 = rep => !!rep.freeze && rep.freeze.r === 4 && rep.freeze.c === 1 && rep.gridlines === false;
const weekCurrent = rep => FEED_ROWS.every(r => rep.value('B' + r) === WEEK_NEXT) && !Object.values(rep.cells || {}).some(c => c && c.value === THIS_WEEK);
const printIn = ses => { const p = setup(ses), w = REPORT_PAGE_SETUP; return p.orientation === w.orientation && p.scaling === w.scaling && p.fitWide === w.fitWide && p.fitTall === w.fitTall && p.titlesRows === w.titlesRows && (p.footer || {}).left === w.footer.left && (p.footer || {}).right === w.footer.right; };

const on = pred => (s, ses) => { const rep = report(ses); return !!rep && pred(rep, ses) && settled(ses); };

const HEADER_RUN = HEADERS_NEXT.map(h => (h === 'Week' ? '"Week" Delete' : `"${h}"`)).join(' Tab ');   // Delete drops AutoComplete's offer of the stale label below (Excel does the same)
const DAY_RUN = RAW_BYDAY.days.map(d => `"${d}"`).join(' Tab ');
const LABEL_RUN = CHECK_LINES.map(l => `↓ "${l[0]}" ↵`).join(' ');
const DESK_FORMAT = 'Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N ↓ ↓ ↵';
const CURRENCY_2 = 'Ctrl+1 N Tab C Alt+N ↓ ↓ ↵';
const CURRENCY_0 = 'Ctrl+1 N Tab C Alt+D 0 ↵';
/** Inputs' site list, from wherever the cursor stands in its column A: to the top, then down to the list. */
const INPUTS_SITES = `Ctrl+PgDn ×2 Ctrl+↑ ×3 Ctrl+↓ ×2 ↓ Ctrl+Shift+↓ Ctrl+C Ctrl+PgUp ×2`;

export const GOALS = [
  { id: 'title-units', text: `In A1 type "${TITLE}", bold, larger, centered A1:H1; A2 italic USD unless stated.`, convention: 'C5',
    keys: `Ctrl+B Alt H F G "${TITLE}" ↵ Shift+→ ×7 Ctrl+1 A Alt+H ↓ ×4 ↵ Ctrl+← ↓ Ctrl+I "${UNITS_LINE}" ↵`,
    requires: ['type-to-enter', 'bold-italic-underline', 'center-across', 'format-cells-dialog', 'keytips', 'shift-arrow', 'ctrl-arrow', 'arrow-keys'],
    check: on(rep => titleIn(rep) && unitsIn(rep)) },
  { id: 'headers', text: 'Row 4, the eight headers Site through Margin % as one Tab run, bold, with C4:H4 right-aligned and wrapped.',
    keys: `↓ ×2 ${HEADER_RUN} ↵ ↑ Shift+→ ×7 Ctrl+B → ×2 Shift+→ ×5 Alt H A R Alt H W`,
    requires: ['type-to-enter', 'tab-commits', 'bold-italic-underline', 'align-command', 'wrap-text', 'shift-arrow', 'keytips', 'arrow-keys'],
    check: on(headersIn) },
  { id: 'sites', text: `Copy the five sites from Inputs A${INPUT_ROWS.sites[0]}:A${INPUT_ROWS.sites[4]} into A5:A9 with paste by Enter; the week labels in B5:B9 are last week's for now.`,
    keys: 'Ctrl+PgDn ×2 Ctrl+↓ ×2 ↓ Ctrl+Shift+↓ Ctrl+C Ctrl+PgUp ×2 Ctrl+← ↓ ↵',
    requires: ['copy-cut-paste', 'paste-enter-drop', 'sheet-tabs', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys'],
    check: on(sitesIn) },
  { id: 'links', text: 'Washes and revenue C5:D9 as live links to Raw\'s site totals I8:J12, pointed across sheets, and colored green.', convention: 'B2',
    keys: '→ ×2 Shift+↓ ×4 Shift+→ "=" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ ↓ Ctrl+↵ Alt H F C → ×8 ↵',
    requires: ['cross-sheet-ref', 'pointing', 'ctrl-enter-fill', 'relative-absolute', 'font-color', 'sheet-tabs', 'ctrl-arrow', 'shift-arrow', 'keytips', 'arrow-keys'],
    check: on(linksIn) },
  { id: 'wash-cost', text: 'Wash cost E5:E9 is washes times the cost per wash: =C5*Inputs!$B$4, anchored with F4, committed into all five with Ctrl+Enter, green.', convention: 'B4',
    keys: '→ ×2 Shift+↓ ×4 "=" ← ×2 "*" Ctrl+PgDn ×2 → Ctrl+↑ ×2 ↓ F2 F4 Ctrl+↵ Alt H F C → ×8 ↵',
    requires: ['cross-sheet-ref', 'pointing', 'formula-operators', 'f4-anchor', 'edit-mode-f2', 'ctrl-enter-fill', 'font-color', 'input-colour-convention', 'keytips', 'sheet-tabs', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'],
    check: on(rep => linksIn(rep) && costIn(rep)) },
  { id: 'profit-margin-total', text: 'F5:F9 =D5-E5, G5:G9 =D5/C5, H5:H9 =F5/D5 by pointing and filled down; Total in A10; C10:F10 by one AutoSum; G10 =D10/C10; H10 =F10/D10.', convention: 'B1',
    keys: '→ "=" ← ×2 "-" ← Tab "=" ← ×3 "/" Ctrl+← ×2 → ×2 Tab "=" ← ×2 "/" Ctrl+← ×2 → ×3 ↵ ↑ Shift+↓ ×4 Shift+→ ×2 Ctrl+D Ctrl+← Ctrl+↓ ↓ "Total" Tab → Shift+↑ ×5 Shift+→ ×3 Alt+= Ctrl+→ → "=" ← ×3 "/" Ctrl+← ×2 Tab "=" ← ×2 "/" Ctrl+← ×2 → ↵',
    requires: ['pointing', 'formula-operators', 'formula-basics', 'fill-down-right', 'autosum', 'sum-family', 'type-to-enter', 'tab-commits', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'],
    check: on(calcsBefore) },
  { id: 'sixth-site', text: `A sixth site opened, its figures on Inputs row ${NEW_ROW}: insert a row above ${CITY_SITES[4]}, type name and figures in blue, fill F9:H9 down.`, convention: 'B1',
    keys: `↑ Ctrl+← ×2 ↑ Shift+Space Alt H I R "${NEW_SITE.name}" Tab Tab "${NEW_SITE.washes}" Tab "${NEW_SITE.revenue}" Tab "${NEW_SITE.cost}" ↵ ↑ → ×2 Shift+→ ×2 Alt H F C → ×4 ↵ Ctrl+→ → ↑ Shift+↓ Shift+→ ×2 Ctrl+D`,
    requires: ['insert-delete-rows', 'row-col-select', 'type-to-enter', 'tab-commits', 'font-color', 'input-colour-convention', 'fill-down-right', 'keytips', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'],
    check: on(sixthIn) },
  { id: 'old-code', text: 'The stale Old code column at I is the old system\'s: delete the whole column.',
    keys: 'Ctrl+→ Ctrl+Space Alt H D C',
    requires: ['insert-delete-rows', 'row-col-select', 'keytips', 'ctrl-arrow'],
    check: on(rep => sixthIn(rep) && oldCodeGone(rep)) },
  { id: 'daily-block', text: 'Washes by day in A13 and Site, Mon to Sat in row 14, all bold; sites indented in A15:A19; B15:G19 green links to Raw\'s by-day block.', convention: 'B2',
    keys: `Ctrl+← ×2 Ctrl+↓ ↓ ×2 Ctrl+B "Washes by day" ↵ ↓ Ctrl+B "Site" Tab ${DAY_RUN} ↵ ↑ → Shift+→ ×5 Ctrl+B Ctrl+← ↓ ${INPUTS_SITES} ↵ Ctrl+Shift+↓ Alt H 6 → Shift+→ ×5 Shift+↓ ×4 "=" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ ×3 ↓ Ctrl+↵ Alt H F C → ×8 ↵`,
    requires: ['type-to-enter', 'tab-commits', 'bold-italic-underline', 'copy-cut-paste', 'paste-enter-drop', 'cross-sheet-ref', 'pointing', 'ctrl-enter-fill', 'font-color', 'keytips', 'sheet-tabs', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys'],
    check: on(dailyIn) },
  { id: 'checks', text: `Checks in A${CHECKS}, bold; labels A${CHECKS + 1}:A${CHECKS + 3}; B${CHECKS + 1} =SUM(D5:D8,D10)-Raw!J13, B${CHECKS + 2} =SUM(C5:C10)-C11, B${CHECKS + 3} =IF(AND(H11>=0,H11<=1),0,1), all reading 0.`, convention: 'F1',
    keys: `Ctrl+← Ctrl+↓ ↓ ×2 Ctrl+B "Checks" ↵ ${LABEL_RUN} ↑ ×2 → "=SUM(D5:D8,D10)-" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ ×2 → ↵ ↓ "${CHECK_LINES[1][1]}" ↵ ↓ "${CHECK_LINES[2][1]}" ↵`,
    requires: ['check-cell', 'type-to-enter', 'bold-italic-underline', 'cross-sheet-ref', 'pointing', 'sum-family', 'formula-basics', 'formula-operators', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'],
    check: on(checksIn) },
  { id: 'number-formats', text: 'Desk number format on C5:F11, B15:G19 and B22:B24; G5:G11 currency 2; H5:H11 percent 1, italic; D5:F5 and D11:F11 currency 0.', convention: 'D2',
    keys: `Ctrl+Shift+↑ ${DESK_FORMAT} Ctrl+↑ ×2 Ctrl+Shift+→ Ctrl+Shift+↑ Shift+↓ F4 → Ctrl+↑ ×3 ↓ Ctrl+Shift+↓ Shift+→ ×3 F4 Ctrl+→ ← Ctrl+Shift+↓ ${CURRENCY_2} → Ctrl+Shift+↓ Ctrl+Shift+5 Alt H 0 Ctrl+I Ctrl+← → ×3 Shift+→ ×2 ${CURRENCY_0} Ctrl+↓ Shift+→ ×2 F4`,
    requires: ['number-formats', 'format-cells-dialog', 'format-cells-tabs', 'f4-repeat', 'bold-italic-underline', 'keytips', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys'],
    check: on(formatsIn) },
  { id: 'style', text: 'Style: total row 11 bold with a top border and no grid; C4:H4 and B14:G14 right-aligned; nothing merged anywhere.', convention: 'D5',
    keys: 'Shift+Space Ctrl+B Alt H B P Ctrl+↓ ← ×2 Shift+→ ×5 Alt H A R',
    requires: ['row-col-select', 'bold-italic-underline', 'borders-menu', 'align-command', 'keytips', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'],
    check: on(styleIn) },
  { id: 'widths-group', text: 'Widths: B:F 12, G:H 14, column A AutoFit to the sites, row 4 AutoFit; the working columns E:F grouped, not hidden.', convention: 'C7',
    keys: 'Ctrl+↑ ×3 Shift+→ ×4 Ctrl+Space Alt H O W "12" ↵ Ctrl+→ Shift+← Ctrl+Space Alt H O W "14" ↵ Ctrl+← ↓ Ctrl+Shift+↓ ×3 Alt H O I Ctrl+↑ Shift+Space Alt H O A → ×4 Shift+→ Ctrl+Space Alt A G G',
    requires: ['column-width', 'autofit', 'group-ungroup', 'row-col-select', 'keytips', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys'],
    check: on(layoutIn) },
  { id: 'freeze', text: 'Freeze panes at B5; gridlines off.', convention: 'C8',
    keys: 'Ctrl+← ↓ → Alt W F F Alt W V G',
    requires: ['freeze-panes', 'gridlines', 'keytips', 'ctrl-arrow', 'arrow-keys'],
    check: on(frozenAtB5) },
  { id: 'replace-all', text: 'Replace All on the Report: every Week of Sep 15 becomes Week of Sep 22; read the count.',
    keys: `Ctrl+H "${THIS_WEEK}" Tab "${WEEK_NEXT}" Alt+A Esc`,
    requires: ['replace-all'],
    check: on(weekCurrent) },
  { id: 'page-setup', text: 'Page setup: landscape, fit to one page, rows 1:4 as print titles, &[File] in the left footer and &[Date] in the right.', convention: 'G1',
    keys: 'Alt P S P Alt+L Alt+F Alt+R "1:4" Ctrl+PgUp Alt+U "&[File]" Alt+R "&[Date]" ↵ ↵',
    requires: ['page-setup', 'orientation', 'fit-to-page', 'print-titles', 'keytips'],
    check: on((rep, ses) => printIn(ses)) },
  { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Raw!C8" Enter "300" Enter Ctrl+G "Report!C11" Enter Escape Escape Escape', cadence: 320 },
    text: 'Does it tie? Change the first site\'s Monday washes on Raw to 300 and watch the Report\'s total in C11 answer while the checks stay zero.', requires: [],
    check: (s, ses) => ses.demoDone.has('tie') },
];

export const GRADERS = [
  ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
    for (const range of ['C5:H11', 'B15:G19', 'B22:B24']) { const r = roleColour(rep, range); if (!r.ok) return r; }
    for (const r of FEED_ROWS) { const c = rep.cellAt('E' + r); if (c.fontColor !== 'green') return { ok: false, why: `E${r} reads the cost per wash on Inputs and is shown ${c.fontColor || 'black'}. A link to another sheet is green` }; }
    return { ok: true }; },
  ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
    for (const ref of [...span('E', 'H', 5, 10), ...span('C', 'H', T, T)]) { const r = noLiteralInFormula(rep, ref); if (!r.ok) return r; }
    return { ok: true }; },
  ses => { const rep = report(ses); return rep ? totalsTopBorder(rep, span('C', 'H', T, T)) : { ok: false, why: 'No Report sheet.' }; },
  ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
    for (const ref of CHECK_CELLS) { const c = rep.cellAt(ref);
      if (!c.formula) return { ok: false, why: `${ref} is not a formula. A check is a live difference, not a typed 0` };
      if (!near0(c.value)) return { ok: false, why: `${ref} reads ${c.value}. The checks row does not tie` }; }
    return { ok: true }; },
  ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
    const faults = sheetStandard(rep); return faults.length ? { ok: false, why: 'Off the sheet standard: ' + faults[0] } : { ok: true }; },
];

/** The seed: San Antonio's sites everywhere, one day of each site's figures re-read, the sixth site's email on Inputs, what last week's file left on the Report. */
export function seed(rng) {
  const patch = {};
  SITES.forEach((site, i) => {
    for (let d = 0; d < 12; d++) patch[`Raw!B${rawRow(site, d)}`] = { value: CITY_SITES[i] };
    patch[`Raw!${RAW_TOTALS.cols.site}${RAW_TOTALS.firstRow + i}`] = { value: CITY_SITES[i] };
    patch[`Raw!H${RAW_BYDAY.firstRow + i}`] = { value: CITY_SITES[i] };
    patch[`Inputs!A${INPUT_ROWS.sites[i]}`] = { value: CITY_SITES[i] };
    patch[`Costs!A${COST_ROWS[site]}`] = { value: CITY_SITES[i] };
    // fresh figures: one day of this week per site re-read from the tunnel controller; revenue is live (=C×D), the wash cost typed at the supplier rate
    const r = rawRow(site, 6 + Math.floor(rng() * 6));
    const k = Math.round((150 + rng() * 200) / 5) * 5;
    patch[`Raw!C${r}`] = { value: k };
    patch[`Raw!F${r}`] = { value: r2(k * COST_PER_WASH) };
  });
  patch['Costs!A1'] = { ...COSTS_TITLE, value: `Clearcoat Express: ${CLUSTER.city} site costs, week of Sep 22, 2026` };
  patch['Inputs!B3'] = { ...INPUTS_B3 };
  patch[`Inputs!A${NEW_ROW - 1}`] = { value: 'New site this week (manager email)', bold: true };
  patch[`Inputs!A${NEW_ROW}`] = { value: NEW_SITE.name }; patch[`Inputs!B${NEW_ROW}`] = { value: NEW_SITE.washes, fontColor: 'blue' };
  patch[`Inputs!C${NEW_ROW}`] = { value: NEW_SITE.revenue, fontColor: 'blue' }; patch[`Inputs!D${NEW_ROW}`] = { value: NEW_SITE.cost, fontColor: 'blue' };
  // what last week's file left on the Report: the week labels, a week stale, and the old system's code column
  for (let i = 0; i < 5; i++) patch[`Report!B${5 + i}`] = { value: THIS_WEEK };
  patch['Report!I4'] = { value: 'Old code', bold: true };
  OLD_CODES.forEach((code, i) => { patch[`Report!I${5 + i}`] = { value: code }; });
  return patch;
}

export const SOLUTION_KEYS = GOALS.filter(g => !g.demo).map(g => g.keys);

export default {
  id: 'foundations-assessment',
  chapter: 'foundations',
  section: 'Project and assessment',
  module: 'project-and-assessment',
  workbook: 'clearcoat-weekly',
  state: { before: 'S8raw' },
  kind: 'assessment',
  title: 'Assessment: Monday morning',
  difficulty: 'hard',
  tags: ['assessment', 'report', 'formulas', 'format'],
  access: 'free',
  minutes: 10,
  headline: 'Ctrl+PgDn',
  conventions: ['B1', 'B2', 'B4', 'C5', 'C7', 'C8', 'D1', 'D2', 'D5', 'D7', 'F1', 'G1'],
  uses: ['type-to-enter', 'tab-commits', 'copy-cut-paste', 'paste-enter-drop', 'replace-all', 'sheet-tabs', 'cross-sheet-ref', 'pointing', 'ctrl-enter-fill', 'relative-absolute', 'f4-anchor', 'f4-repeat', 'edit-mode-f2', 'font-color', 'input-colour-convention', 'formula-basics', 'formula-operators', 'sum-family', 'autosum', 'check-cell', 'number-formats', 'format-cells-dialog', 'format-cells-tabs', 'bold-italic-underline', 'borders-menu', 'align-command', 'center-across', 'wrap-text', 'column-width', 'autofit', 'freeze-panes', 'gridlines', 'row-col-select', 'insert-delete-rows', 'group-ungroup', 'fill-down-right', 'page-setup', 'orientation', 'fit-to-page', 'print-titles', 'keytips', 'arrow-keys', 'ctrl-arrow', 'shift-arrow', 'ctrl-shift-arrow'],
  prerequisites: ['weekly-kpi-project'],
  brief: 'Monday 7:10am. The CFO wants the page before the 9:00: the San Antonio cluster\'s Week of Sep 22 feed sits on Raw, the Report is blank, and the page is the one the project built (links, totals, margins, daily block, checks, formats and print set-up), on the clock, no help, keyboard only. Pass, and the chapter is Verified. This is also the test-out: if you already know all of this, prove it here. The key is `Ctrl+PgDn`.',
  wow: 'You built page one of the pack from a blank sheet on the clock, and the chapter is Verified.',
  timeLimit: 600,
  pars: parsFrom(300, { pass: 600, pro: 440 }),
  seed,
  goals: GOALS,
  graders: GRADERS,
  closing: [
    'Built from a feed you had never seen: every figure a live link or a formula, the checks at zero, the print set-up done.',
    'The CFO would have looked at the same things the goals did: green links and black formulas, the price anchored on Inputs, $ only on the first and total rows, a top border on the total, a page that fits one sheet. That\'s the standard, and you just met it under a clock.',
  ],
  solution: SOLUTION_KEYS.map(k => hintToScript(k)).join(' '),
};
