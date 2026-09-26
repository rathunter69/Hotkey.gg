// Chapter 1 · 1.8.A — Assessment: Monday morning (seeded over S8raw)
// The project's page, built again against the clock on a sister cluster's fresh feed: the Report
// is blank, Raw holds the w/c 22 Sep export, Inputs and Costs are as the chapter left them. Twelve
// jobs, eight minutes, no teach lines: title and units, the header row, sites and week, the links,
// the anchored energy cost, gross profit and margin, the total row, the daily block, the checks,
// the number formats, the style pass, the widths and freeze, the print set-up. Every check compares
// the sheet with the page `buildReport` makes in this seed's clothing, so any legitimate route
// passes; the seed dresses the city, the site names and a day of each site's figures, and the
// workload never moves: the same keys pass every seed. The closer moves one feed figure and the
// Report total answers while the checks stay zero.
import { CLUSTERS, pickCluster, siteNames } from '../workbooks/clusters.js';
import { SITES, SITE_PRICE, WHOLESALE, COST_ROWS, RAW_TOTALS, RAW_BYDAY, REPORT_NEXT, HEADERS_NEXT, WEEK_NEXT, UNITS_LINE, CHECK_LINES_NEXT, rawRow, stateOf, buildReport } from '../workbooks/voltline-weekly.js';
import { roleColour, noLiteralInFormula, totalsTopBorder } from '../../app/graders.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const inputs = ses => sheetOf(ses, 'Inputs');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near0 = v => isNum(v) && Math.abs(v) < 1e-6;
const r2 = v => Math.round(v * 100) / 100;
/** Formula text with spacing and anchors ignored (a fill needs no anchor on a link; the check reads the reference). */
const normFormula = f => String(f || '').replace(/\s|\$/g, '').toUpperCase();
/** Formula text with spacing ignored, anchors kept (the energy cost's price must be anchored). */
const exactFormula = f => String(f || '').replace(/\s/g, '').toUpperCase();
/** Same words: a keyboard hyphen counts as the dash in a label or title (nobody can type an en or em dash). */
const sameText = (a, b) => String(a ?? '').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim() === String(b ?? '').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();

/** A1-style refs for a rectangular block, column letters inclusive. */
const span = (col1, col2, r1, r2_) => { const out = []; for (let c = col1.charCodeAt(0); c <= col2.charCodeAt(0); c++) for (let r = r1; r <= r2_; r++) out.push(String.fromCharCode(c) + r); return out; };

const R = REPORT_NEXT;
const SITE_ROWS = R.siteRows;                         // 5–9
const T = R.totalRow;                                 // 10
const DAILY_ROWS = R.dailyRows;                       // 14–18
const DAY_COLS = R.dayCols;                           // B:G
const CHECKS = R.checksRow;                           // 20; the three lines on 21–23
const HEADER_CELLS = span('A', 'H', 4, 4);
const NUMBER_HEADERS = span('C', 'H', 4, 4);
const LINK_BLOCK = span('C', 'D', SITE_ROWS[0], SITE_ROWS[4]);
const ENERGY = span('E', 'E', SITE_ROWS[0], SITE_ROWS[4]);
const CALC_BLOCK = span('F', 'H', SITE_ROWS[0], SITE_ROWS[4]);
const FIGURES = span('C', 'H', SITE_ROWS[0], T);
const DAILY_BLOCK = span('B', 'G', DAILY_ROWS[0], DAILY_ROWS[4]);
const DAY_HEADERS = span('B', 'G', R.dailyHeaderRow, R.dailyHeaderRow);
const CHECK_CELLS = span('B', 'B', CHECKS + 1, CHECKS + 3);
const TOTAL_ROW = span('A', 'H', T, T);
const RATES = ['=C5*INPUTS!$B$4', '=INPUTS!$B$4*C5', '=C5*INPUTS!B$4', '=INPUTS!B$4*C5'];   // the anchors a down-fill needs, either operand order
const COSTS_TITLE = stateOf('S8raw').sheets.find(x => x.name === 'Costs').cells.A1;   // bold, as Costs names the cluster

/** The cluster the seed dressed the file in, read back from Inputs' site list (never touched by the build). */
const clusterOf = ses => { const inp = inputs(ses); if (!inp) return null; const first = inp.value('A9'); return CLUSTERS.find(c => c.sites[0] === first) || null; };
const titleFor = cluster => `Voltline - ${cluster.city} Weekly KPI Report, w/c 22 Sep 2026`;   // the week is the feed's, whatever the cluster's own label says
/** The page as the project built it, in this seed's clothing: cells, widths, heights, freeze, gridlines, page setup — built once per cluster. */
const EXPECTED = new Map();
const expectedFor = ses => {
  const cluster = clusterOf(ses); if (!cluster) return null;
  if (!EXPECTED.has(cluster.city)) {
    const st = buildReport(stateOf('S8raw'), { title: titleFor(cluster), week: WEEK_NEXT, sites: siteNames(cluster, 5) });
    const sh = st.sheets.find(x => x.name === 'Report');
    EXPECTED.set(cluster.city, { cells: sh.cells, colW: sh.colW, rowH: sh.rowH || {}, freeze: sh.freeze, pageSetup: st.settings.pageSetup });
  }
  return EXPECTED.get(cluster.city);
};

const textAt = (rep, want, ref) => sameText(rep.value(ref), want.cells[ref].value);
const bold = (rep, ref) => rep.cellAt(ref).bold === true;
const linkAt = (rep, want, ref) => { const c = rep.cellAt(ref); return normFormula(c.formula) === normFormula(want.cells[ref].formula) && isNum(c.value); };
const green = (rep, ref) => rep.cellAt(ref).fontColor === 'green';
const formatAt = (rep, want, ref) => { const c = rep.cellAt(ref), w = want.cells[ref]; return c.fmtStyle === w.fmtStyle && (c.decimals || 0) === (w.decimals || 0); };
const setup = ses => (ses.settings && ses.settings.pageSetup) || {};

/** The title as Costs names the cluster, in A1, and the units line under it. */
const titleAndUnits = (rep, want) => textAt(rep, want, 'A1') && sameText(rep.value('A2'), UNITS_LINE);
const headersIn = (rep, want) => HEADER_CELLS.every(ref => textAt(rep, want, ref) && bold(rep, ref));
const sitesAndWeek = (rep, want) => SITE_ROWS.every(r => textAt(rep, want, 'A' + r) && sameText(rep.value('B' + r), WEEK_NEXT));
const linksIn = (rep, want) => LINK_BLOCK.every(ref => linkAt(rep, want, ref));
const energyIn = rep => SITE_ROWS.every(r => { const c = rep.cellAt('E' + r); return RATES.some(f => exactFormula(c.formula) === f.replace('C5', 'C' + r)) && isNum(c.value); });
const linksGreen = rep => [...LINK_BLOCK, ...ENERGY].every(ref => green(rep, ref));
const calcsIn = (rep, want) => CALC_BLOCK.every(ref => linkAt(rep, want, ref));
const totalIn = (rep, want) => sameText(rep.value('A' + T), 'Total') && ['C', 'D', 'E', 'F', 'G', 'H'].every(col => linkAt(rep, want, col + T));
const dailyIn = (rep, want) => textAt(rep, want, 'A' + R.dailyTitleRow) && bold(rep, 'A' + R.dailyTitleRow)
  && textAt(rep, want, 'A' + R.dailyHeaderRow) && bold(rep, 'A' + R.dailyHeaderRow)
  && DAY_HEADERS.every(ref => textAt(rep, want, ref) && bold(rep, ref))
  && DAILY_ROWS.every(r => textAt(rep, want, 'A' + r) && (rep.cellAt('A' + r).indent || 0) >= 1)
  && DAILY_BLOCK.every(ref => linkAt(rep, want, ref) && green(rep, ref));
const checksIn = (rep, want) => sameText(rep.value('A' + CHECKS), 'Checks') && bold(rep, 'A' + CHECKS)
  && CHECK_CELLS.every(ref => { const label = rep.value('A' + ref.slice(1)); return typeof label === 'string' && label.trim().length > 0; })
  && CHECK_CELLS.every(ref => normFormula(rep.formula(ref)) === normFormula(want.cells[ref].formula) && near0(rep.value(ref)));
const formatsIn = (rep, want) => [...FIGURES, ...DAILY_BLOCK, ...CHECK_CELLS].every(ref => formatAt(rep, want, ref));
const styleIn = (rep, want) => TOTAL_ROW.every(ref => { const c = rep.cellAt(ref); return c.bold === true && c.bt === true; })
  && (() => { const a1 = rep.cellAt('A1'); return a1.bold === true && a1.fsz === want.cells.A1.fsz && a1.ca === want.cells.A1.ca; })()
  && rep.cellAt('A2').it === true
  && NUMBER_HEADERS.every(ref => { const c = rep.cellAt(ref); return c.align === 'r' && c.wrap === true; })
  && DAY_HEADERS.every(ref => rep.cellAt(ref).align === 'r');
/** B:F 12 wide, G:H 14, column A fitted to the site names (not swallowed by the title), row 4 sized to its wrapped headers, frozen at B5, gridlines off. */
const layoutIn = (rep, want) => {
  for (let c = 2; c <= 8; c++) if (rep.colW[c] !== want.colW[c]) return false;
  const a = rep.colW[1], fit = want.colW[1];
  if (!rep.colSet[1] || !(a >= fit && a <= fit * 2)) return false;
  if (!(rep.rowH[4] >= (want.rowH[4] || 0)) || want.rowH[4] === undefined) return false;
  return rep.freeze.r === want.freeze.r && rep.freeze.c === want.freeze.c && rep.gridlines === false;
};
const printIn = (ses, want) => { const p = setup(ses), w = want.pageSetup; return p.orientation === w.orientation && p.scaling === w.scaling && p.fitWide === w.fitWide && p.fitTall === w.fitTall && p.titlesRows === w.titlesRows && (p.footer || {}).left === w.footer.left && (p.footer || {}).right === w.footer.right; };

/** Every goal check reads the page against the expected one; null when the file is not dressed (never on a real run). */
const on = pred => (s, ses) => { const rep = report(ses), want = expectedFor(ses); return !!rep && !!want && pred(rep, want, ses) && settled(ses); };

export default {
  id: 'foundations-assessment',
  chapter: 'foundations',
  section: 'Project and assessment',
  module: 'project-and-assessment',
  workbook: 'voltline-weekly',
  state: { before: 'S8raw' },
  kind: 'assessment',
  title: 'Assessment: Monday morning',
  difficulty: 'hard',
  tags: ['assessment', 'report', 'formulas', 'format'],
  access: 'free',
  minutes: 8,
  headline: 'Ctrl+PgDn',
  conventions: ['B1', 'B2', 'B4', 'C5', 'D1', 'D2', 'D5', 'D7', 'F1', 'G1'],
  uses: ['type-to-enter', 'enter-tab-direction', 'copy-cut-paste', 'paste-enter-drop', 'replace-all', 'sheet-tabs', 'cross-sheet-ref', 'pointing', 'ctrl-enter-fill', 'relative-absolute', 'f4-anchor', 'f4-repeat', 'edit-mode-f2', 'font-color', 'input-colour-convention', 'formula-basics', 'formula-operators', 'sum-family', 'autosum', 'check-cell', 'number-formats', 'format-cells-dialog', 'format-cells-tabs', 'bold-italic-underline', 'borders-menu', 'align-command', 'center-across', 'wrap-text', 'column-width', 'autofit', 'freeze-panes', 'gridlines', 'row-col-select', 'page-setup', 'orientation', 'fit-to-page', 'print-titles', 'keytips', 'arrow-keys', 'ctrl-arrow', 'shift-arrow', 'ctrl-shift-arrow', 'ctrl-home-end'],
  prerequisites: ['weekly-kpi-project'],
  brief: 'Monday 7:10am. The associate wants the page before the 9:00: a sister cluster’s w/c 22 Sep feed sits on Raw, the Report is blank, and the page is the one the project built, links, totals, margins, daily block, checks, formats and print set-up, in eight minutes. The key is `Ctrl+PgDn`.',
  timeLimit: 480,
  pars: parsFrom(240, { pass: 480, pro: 360 }),
  seed: rng => {
    const cluster = pickCluster(rng);
    const sites = siteNames(cluster, 5);
    const patch = {};
    SITES.forEach((site, i) => {
      // the clothing: this cluster's five sites everywhere the Austin ones were named
      for (let d = 0; d < 12; d++) patch[`Raw!B${rawRow(site, d)}`] = { value: sites[i] };
      patch[`Raw!${RAW_TOTALS.cols.site}${RAW_TOTALS.firstRow + i}`] = { value: sites[i] };
      patch[`Raw!H${RAW_BYDAY.firstRow + i}`] = { value: sites[i] };
      patch[`Inputs!A${9 + i}`] = { value: sites[i] };
      patch[`Costs!A${COST_ROWS[site]}`] = { value: sites[i] };
      // fresh figures: one day of this week per site re-read from the platform, the row kept consistent (E = C × price, F = C × wholesale)
      const r = rawRow(site, 6 + Math.floor(rng() * 6));
      const k = Math.round((400 + rng() * 2200) / 10) * 10;
      patch[`Raw!C${r}`] = { value: k };
      patch[`Raw!E${r}`] = { value: r2(k * SITE_PRICE[site]) };
      patch[`Raw!F${r}`] = { value: r2(k * WHOLESALE) };
    });
    patch['Costs!A1'] = { ...COSTS_TITLE, value: `Voltline — ${cluster.city} site costs, w/c 22 Sep 2026` };   // the city the title takes
    return patch;
  },
  goals: [
    { id: 'title-units', text: 'A1: Voltline - City Weekly KPI Report, w/c 22 Sep 2026, with the city as Costs A1 names it; A2: USD unless stated.', convention: 'C5',
      keys: 'Ctrl+PgDn ×3 Ctrl+C Ctrl+PgUp ×3 ↵ then Ctrl+H "site costs" Tab "Weekly KPI Report" Alt+A Esc then ↓ "USD unless stated" ↵',
      requires: ['copy-cut-paste', 'paste-enter-drop', 'replace-all', 'sheet-tabs', 'type-to-enter'],
      check: on(titleAndUnits) },
    { id: 'headers', text: 'Row 4, bold: Site, Week, kWh sold, Revenue ($), Energy cost ($), Gross profit ($), Avg price ($/kWh), Margin % across A4:H4.',
      keys: `↓ ${HEADERS_NEXT.map(h => `"${h}"`).join(' Tab ')} ↵ ↑ Ctrl+Shift+→ Ctrl+B`,
      requires: ['type-to-enter', 'enter-tab-direction', 'bold-italic-underline', 'ctrl-shift-arrow'],
      check: on((rep, want) => titleAndUnits(rep, want) && headersIn(rep, want)) },
    { id: 'sites-week', text: 'The five sites from Inputs A9:A13 into A5:A9, and the week label w/c 22 Sep in B5:B9.',
      keys: `Ctrl+PgDn ×2 Ctrl+↓ ×2 ↓ Ctrl+Shift+↓ Shift+↑ Ctrl+C Ctrl+PgUp ×2 ↓ ↵ then Ctrl+↓ → Ctrl+Shift+↑ Shift+↓ "${WEEK_NEXT}" Ctrl+↵`,
      requires: ['copy-cut-paste', 'paste-enter-drop', 'sheet-tabs', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-enter-fill', 'type-to-enter'],
      check: on(sitesAndWeek) },
    { id: 'links', text: 'kWh sold and revenue C5:D9 as live links to Raw’s site totals I8:J12, pointed across sheets.', convention: 'B2',
      keys: '→ Ctrl+Shift+↑ Shift+↓ Shift+→ "=" Ctrl+PgDn Ctrl+→ → ×2 Ctrl+↓ ×3 ↑ → Ctrl+↵',
      requires: ['cross-sheet-ref', 'pointing', 'ctrl-enter-fill', 'relative-absolute', 'sheet-tabs', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow'],
      check: on(linksIn) },
    { id: 'energy-cost', text: 'Energy cost E5:E9 is kWh times the wholesale price, =C5*Inputs!$B$4 anchored, then color every link C5:E9 green.', convention: 'B4',
      keys: '→ ×2 Ctrl+Shift+↑ Shift+↓ "=" ← ×2 "*" Ctrl+PgDn ×2 → Ctrl+↑ ↑ ×2 F2 F4 Ctrl+↵ then Shift+← ×2 Alt H F C → ×8 ↵',
      requires: ['cross-sheet-ref', 'pointing', 'formula-operators', 'f4-anchor', 'edit-mode-f2', 'ctrl-enter-fill', 'font-color', 'input-colour-convention', 'keytips', 'sheet-tabs', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow'],
      check: on((rep, want) => linksIn(rep, want) && energyIn(rep) && linksGreen(rep)) },
    { id: 'profit-margin-total', text: 'F5:F9 =D5-E5, G5:G9 =D5/C5, H5:H9 =F5/D5 filled down; Total in A10, C10:F10 by AutoSum, G10 =D10/C10, H10 =F10/D10.', convention: 'B1',
      keys: '→ Ctrl+Shift+↑ Shift+↓ "=" ← ×2 "-" ← Ctrl+↵ → Ctrl+Shift+↑ Shift+↓ "=" Ctrl+← ← ×2 "/" Ctrl+← ← ×3 Ctrl+↵ → Ctrl+Shift+↑ Shift+↓ "=" Ctrl+← ← "/" Ctrl+← ← ×3 Ctrl+↵ then Ctrl+← ↓ "Total" Tab → Ctrl+Shift+↑ ×2 Shift+↓ Shift+→ ×3 Alt+= then Ctrl+→ → "=" Ctrl+← ← ×2 "/" Ctrl+← ← ×3 ↵ ↑ → "=" Ctrl+← ← "/" Ctrl+← ← ×3 ↵',
      requires: ['pointing', 'formula-operators', 'formula-basics', 'ctrl-enter-fill', 'autosum', 'sum-family', 'type-to-enter', 'enter-tab-direction', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys'],
      check: on((rep, want) => calcsIn(rep, want) && totalIn(rep, want)) },
    { id: 'daily-block', text: 'Daily block: kWh sold by day in A12, Site and Mon–Sat bold in row 13, sites indented in A14:A18, B14:G18 green links to Raw’s by-day block.', convention: 'B2',
      keys: `Ctrl+← ↓ Ctrl+B "kWh sold by day" ↵ Ctrl+B "Site" Tab ${RAW_BYDAY.days.map(d => `"${d}"`).join(' Tab ')} ↵ ↑ → Ctrl+Shift+→ Ctrl+B Alt H A R then Ctrl+← Ctrl+↑ ×3 ↓ Ctrl+Shift+↓ Shift+↑ Ctrl+C Ctrl+↓ ×3 ↓ ↵ Ctrl+Shift+↓ Alt H 6 then → Ctrl+Shift+End Shift+← "=" Ctrl+PgDn Ctrl+→ → ×2 Ctrl+↓ ×4 ↓ ×2 → Ctrl+↵ then Alt H F C → ×8 ↵`,
      requires: ['type-to-enter', 'enter-tab-direction', 'bold-italic-underline', 'align-command', 'copy-cut-paste', 'paste-enter-drop', 'cross-sheet-ref', 'pointing', 'ctrl-enter-fill', 'font-color', 'keytips', 'sheet-tabs', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys'],
      check: on(dailyIn) },
    { id: 'checks', text: 'Checks in A20, bold; the three labels A21:A23; B21 =D10-Raw!J13, B22 =SUM(C5:C9)-C10, B23 =IF(AND(H10>=0,H10<=1),0,1), all reading 0.', convention: 'F1',
      keys: `Ctrl+↓ Ctrl+← ↓ ×2 Ctrl+B "Checks" ↵ ${CHECK_LINES_NEXT.map(([label]) => `"${label}" ↵`).join(' ')} Ctrl+↑ ↑ ×2 → "=D10-" Ctrl+PgDn Ctrl+→ → ×2 Ctrl+↓ ×3 → ×2 ↵ "${CHECK_LINES_NEXT[1][1]}" ↵ "${CHECK_LINES_NEXT[2][1]}" ↵`,
      requires: ['check-cell', 'type-to-enter', 'bold-italic-underline', 'cross-sheet-ref', 'pointing', 'sum-family', 'formula-operators', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'],
      check: on(checksIn) },
    { id: 'number-formats', text: 'Number formats: C5:F10, B14:G18 and B21:B23 comma 0; G5:G10 currency 2; H5:H10 percent 1; D5:F5 and D10:F10 currency 0.', convention: 'D2',
      keys: '↑ Ctrl+Shift+↑ Ctrl+1 N then Ctrl+↑ ×2 Ctrl+Shift+↑ Shift+↓ Ctrl+Shift+→ Ctrl+1 N then Ctrl+Home Ctrl+↓ ×2 ↓ → ×2 Ctrl+Shift+↓ Shift+→ ×3 Ctrl+1 N then Ctrl+→ ← Ctrl+Shift+↓ Ctrl+Shift+4 → Ctrl+Shift+↓ Ctrl+Shift+5 Alt H 0 then Ctrl+← → ×3 Shift+→ ×2 Ctrl+1 C Ctrl+↓ Shift+→ ×2 F4',
      requires: ['number-formats', 'format-cells-dialog', 'format-cells-tabs', 'f4-repeat', 'keytips', 'ctrl-home-end', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys'],
      check: on(formatsIn) },
    { id: 'style', text: 'Style: total row bold, top border; title bold, a size up, centered across A1:H1; A2 italic; C4:H4 wrapped; C4:H4 and B13:G13 right-aligned.', convention: 'D5',
      keys: 'Shift+Space Ctrl+B Alt H B P then Ctrl+Home Alt H F G ↓ ×3 Ctrl+→ Ctrl+↑ Ctrl+Shift+← Ctrl+1 A then Ctrl+← ↓ Ctrl+I ↓ ×2 → ×2 Ctrl+Shift+→ Alt H A R Alt H W',
      requires: ['row-col-select', 'bold-italic-underline', 'borders-menu', 'center-across', 'format-cells-dialog', 'align-command', 'wrap-text', 'keytips', 'ctrl-home-end', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys'],
      check: on(styleIn) },
    { id: 'widths-freeze', text: 'Widths: B:F 12, G:H 14, column A AutoFit to the sites, row 4 AutoFit; freeze panes at B5; gridlines off.', convention: 'D7',
      keys: '← Ctrl+Shift+→ Shift+← ×2 Alt H O W "12" ↵ Ctrl+→ ← Shift+→ Alt H O W "14" ↵ then Ctrl+← ↓ Ctrl+Shift+↓ ×3 Alt H O I Ctrl+↑ Alt H O A then ↓ → Alt W F F Alt W V G',
      requires: ['column-width', 'autofit', 'freeze-panes', 'gridlines', 'keytips', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys'],
      check: on(layoutIn) },
    { id: 'page-setup', text: 'Page setup: landscape, fit to one page, rows 1:4 as print titles, &[File] in the left footer and &[Date] in the right.', convention: 'G1',
      keys: 'Alt P S P L F Alt+S Alt+R "1:4" Alt+H "&[File]" Alt+R "&[Date]" ↵',
      requires: ['page-setup', 'orientation', 'fit-to-page', 'print-titles', 'keytips'],
      check: on((rep, want, ses) => printIn(ses, want)) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Raw!C8" Enter "3000" Enter Ctrl+G "Report!C10" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch the first site’s Monday kWh on Raw change to 3,000 and the Report’s total in C10 answer while the checks stay zero.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  graders: [
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      for (const range of ['C5:D10', 'F5:H10', 'B14:G18', 'B21:B23']) { const r = roleColour(rep, range); if (!r.ok) return r; }
      for (const r of SITE_ROWS) { const c = rep.cellAt('E' + r); if (c.fontColor !== 'green') return { ok: false, why: `E${r} reads the price on Inputs and is shown ${c.fontColor || 'black'} — a link to another sheet is green` }; }
      return { ok: true }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      for (const ref of [...ENERGY, ...CALC_BLOCK, ...span('C', 'H', T, T)]) { const r = noLiteralInFormula(rep, ref); if (!r.ok) return r; }
      return { ok: true }; },
    ses => { const rep = report(ses); return rep ? totalsTopBorder(rep, span('C', 'H', T, T)) : { ok: false, why: 'No Report sheet.' }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      for (const ref of CHECK_CELLS) { const c = rep.cellAt(ref);
        if (!c.formula) return { ok: false, why: `${ref} is not a formula — a check is a live difference, not a typed 0` };
        if (!near0(c.value)) return { ok: false, why: `${ref} reads ${c.value} — the checks row does not tie` }; }
      return { ok: true }; },
  ],
  closing: [
    'Page one of the pack, the document the buyers read, built from a blank sheet in one sitting on a feed you had never seen: every figure a live link or a formula, the checks at zero, the print set-up done.',
    'The associate would have looked at the same things the goals did: green links and blue-free formulas (B1, B2), the price anchored on Inputs (B4), $ only on the first and total rows (D4), a top border on the total (D5), and a page that fits one sheet (G1).',
  ],
  solution: `Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+C Ctrl+PgUp Ctrl+PgUp Ctrl+PgUp Enter Ctrl+H "site costs" Tab "Weekly KPI Report" Alt+A Escape Down "${UNITS_LINE}" Enter Down ${HEADERS_NEXT.map(h => `"${h}"`).join(' Tab ')} Enter Up Ctrl+Shift+Right Ctrl+B Ctrl+PgDn Ctrl+PgDn Ctrl+Down Ctrl+Down Down Ctrl+Shift+Down Shift+Up Ctrl+C Ctrl+PgUp Ctrl+PgUp Down Enter Ctrl+Down Right Ctrl+Shift+Up Shift+Down "${WEEK_NEXT}" Ctrl+Enter Right Ctrl+Shift+Up Shift+Down Shift+Right "=" Ctrl+PgDn Ctrl+Right Right Right Ctrl+Down Ctrl+Down Ctrl+Down Up Right Ctrl+Enter Right Right Ctrl+Shift+Up Shift+Down "=" Left Left "*" Ctrl+PgDn Ctrl+PgDn Right Ctrl+Up Up Up F2 F4 Ctrl+Enter Shift+Left Shift+Left Alt H F C Right Right Right Right Right Right Right Right Enter Right Ctrl+Shift+Up Shift+Down "=" Left Left "-" Left Ctrl+Enter Right Ctrl+Shift+Up Shift+Down "=" Ctrl+Left Left Left "/" Ctrl+Left Left Left Left Ctrl+Enter Right Ctrl+Shift+Up Shift+Down "=" Ctrl+Left Left "/" Ctrl+Left Left Left Left Ctrl+Enter Ctrl+Left Down "Total" Tab Right Ctrl+Shift+Up Ctrl+Shift+Up Shift+Down Shift+Right Shift+Right Shift+Right Alt+= Ctrl+Right Right "=" Ctrl+Left Left Left "/" Ctrl+Left Left Left Left Enter Up Right "=" Ctrl+Left Left "/" Ctrl+Left Left Left Left Enter Ctrl+Left Down Ctrl+B "kWh sold by day" Enter Ctrl+B "Site" Tab ${RAW_BYDAY.days.map(d => `"${d}"`).join(' Tab ')} Enter Up Right Ctrl+Shift+Right Ctrl+B Alt H A R Ctrl+Left Ctrl+Up Ctrl+Up Ctrl+Up Down Ctrl+Shift+Down Shift+Up Ctrl+C Ctrl+Down Ctrl+Down Ctrl+Down Down Enter Ctrl+Shift+Down Alt H 6 Right Ctrl+Shift+End Shift+Left "=" Ctrl+PgDn Ctrl+Right Right Right Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Down Down Right Ctrl+Enter Alt H F C Right Right Right Right Right Right Right Right Enter Ctrl+Down Ctrl+Left Down Down Ctrl+B "Checks" Enter ${CHECK_LINES_NEXT.map(([label]) => `"${label}" Enter`).join(' ')} Ctrl+Up Up Up Right "=D10-" Ctrl+PgDn Ctrl+Right Right Right Ctrl+Down Ctrl+Down Ctrl+Down Right Right Enter "${CHECK_LINES_NEXT[1][1]}" Enter "${CHECK_LINES_NEXT[2][1]}" Enter Up Ctrl+Shift+Up Ctrl+1 N Ctrl+Up Ctrl+Up Ctrl+Shift+Up Shift+Down Ctrl+Shift+Right Ctrl+1 N Ctrl+Home Ctrl+Down Ctrl+Down Down Right Right Ctrl+Shift+Down Shift+Right Shift+Right Shift+Right Ctrl+1 N Ctrl+Right Left Ctrl+Shift+Down Ctrl+Shift+4 Right Ctrl+Shift+Down Ctrl+Shift+5 Alt H 0 Ctrl+Left Right Right Right Shift+Right Shift+Right Ctrl+1 C Ctrl+Down Shift+Right Shift+Right F4 Shift+Space Ctrl+B Alt H B P Ctrl+Home Alt H F G Down Down Down Ctrl+Right Ctrl+Up Ctrl+Shift+Left Ctrl+1 A Ctrl+Left Down Ctrl+I Down Down Right Right Ctrl+Shift+Right Alt H A R Alt H W Left Ctrl+Shift+Right Shift+Left Shift+Left Alt H O W "12" Enter Ctrl+Right Left Shift+Right Alt H O W "14" Enter Ctrl+Left Down Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Down Alt H O I Ctrl+Up Alt H O A Down Right Alt W F F Alt W V G Alt P S P L F Alt+S Alt+R "1:4" Alt+H "&[File]" Alt+R "&[Date]" Enter`,
};
