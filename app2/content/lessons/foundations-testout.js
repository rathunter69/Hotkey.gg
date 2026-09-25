// Chapter 1 · 1.8.T — Test out of Foundations (seeded over S7c)
// The entry point for anyone who already knows the chapter: ten tasks across its seven modules on
// one workbook, five minutes, no teach lines. The seed dresses the finished Report in a sister
// cluster's clothing (city, site names) and breaks ten things — gridlines on, an input shown
// black, a costs block with its typed figures black, a misspelled site name in the feed, the week
// label a week stale, the panes unfrozen, the Margin column hidden, the average prices in General,
// the gross-profit total retyped as a number, one revenue link retyped over. The faults never move;
// only the clothing varies, so the same keys pass every seed. Each check reads its own end state;
// the closer moves one feed figure and the Total answers while the checks stay zero.
import { CLUSTERS, pickCluster, siteNames } from '../workbooks/clusters.js';
import { SITES, WHOLESALE, CEDAR_PARK, COST_ROWS, RAW_TOTALS, RAW_BYDAY, REPORT, rawRow, stateOf } from '../workbooks/voltline-weekly.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const raw = ses => sheetOf(ses, 'Raw');
const inputs = ses => sheetOf(ses, 'Inputs');
const costs = ses => sheetOf(ses, 'Costs');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const r2 = v => Math.round(v * 100) / 100;
const normFormula = f => String(f || '').replace(/\s|\$/g, '').toUpperCase();

/** A1-style refs for a rectangular block, column letters inclusive. */
const span = (col1, col2, r1, r2_) => { const out = []; for (let c = col1.charCodeAt(0); c <= col2.charCodeAt(0); c++) for (let r = r1; r <= r2_; r++) out.push(String.fromCharCode(c) + r); return out; };

const S7C = stateOf('S7c');
const BASE = S7C.sheets.find(x => x.name === 'Report').cells;   // the finished Report, as 1.7.3 left it
const COSTS_BASE = S7C.sheets.find(x => x.name === 'Costs').cells;
const INPUTS_BASE = S7C.sheets.find(x => x.name === 'Inputs').cells;
const RAW_BASE = S7C.sheets.find(x => x.name === 'Raw').cells;
const SITE_ROWS = REPORT.siteRows;                                       // 5–10, Cedar Park in row 9
const FEED_ROWS = SITE_ROWS.filter(r => r !== REPORT.cedarRow);          // the five linked sites: 5, 6, 7, 8, 10
const DAILY_ROWS = REPORT.dailyRows;                                     // 17–21
const DAY_COLS = REPORT.dayCols;                                         // B:G
const T = REPORT.totalRow;                                               // 11
const WEEK_LABEL = 'w/c 15 Sep';                                         // the page's week; the fault plants the week before
const STALE_LABEL = 'w/c 08 Sep';
const WEEK_CELLS = [...SITE_ROWS.map(r => 'B' + r), ...DAY_COLS.map(c => c + 14)];   // B5:B10 and B14:G14
const AVG_CELLS = span('G', 'G', SITE_ROWS[0], T);                       // G5:G11
const COST_BLOCK = span('B', 'D', 4, 8);                                 // Costs B4:D8: the typed lease, maintenance and network figures
const COST_TOTALS = span('E', 'E', 4, 8);
const TYPO_ROW = rawRow(SITES[1], 0);                                    // Raw B14: the second site's first feed row
const TITLE_BASE = BASE.A1;                                              // bold, one size up, ca 9 — the record the clothing keeps
const MARGIN_COL = 8;                                                    // H
const titleFor = cluster => `Voltline - ${cluster.city} Weekly KPI Report, w/c 15 Sep 2026`;
/** The cluster the seed dressed the file in, read back from Inputs' site list (no task touches it). */
const clusterOf = ses => { const inp = inputs(ses); if (!inp) return null; const first = inp.value('A9'); return CLUSTERS.find(c => c.sites[0] === first) || null; };
/** A site's week as the feed carries it in S7c (its typos fixed, its corrections typed): total kWh and revenue over this week's six rows. */
const feedWeek = site => { let kwh = 0, revenue = 0; for (let d = 6; d < 12; d++) { const r = rawRow(site, d); kwh += RAW_BASE['C' + r].value; revenue += RAW_BASE['E' + r].value; } return { kwh, revenue }; };
/** The second site's revenue as a number: what D6 reads once retyped over its link to Raw's totals block. */
const SECOND_REVENUE = r2(feedWeek(SITES[1]).revenue);
/** The gross-profit total as a number: what F11 reads once retyped over its SUM (feed sites from the feed, Cedar Park from the email). */
const GROSS_TOTAL = r2(SITES.reduce((sum, site) => { const w = feedWeek(site); return sum + w.revenue - w.kwh * WHOLESALE; }, CEDAR_PARK.revenue - CEDAR_PARK.energy));

const gridlinesOff = rep => rep.gridlines === false;
const weekLabelsCurrent = rep => WEEK_CELLS.every(ref => rep.value(ref) === WEEK_LABEL);
const frozenAtB5 = rep => !!rep.freeze && rep.freeze.r === 4 && rep.freeze.c === 1;
const revenueLinked = rep => { const c = rep.cellAt('D6'); return normFormula(c.formula) === `=RAW!J${RAW_TOTALS.firstRow + 1}` && c.fontColor === 'green' && isNum(c.value); };
const avgPricesCurrency = rep => AVG_CELLS.every(ref => { const c = rep.cellAt(ref); return c.fmtStyle === 'currency' && c.decimals === 2; });
const marginShown = rep => rep.hiddenCols.size === 0;
const grossTotalLive = rep => { const c = rep.cellAt('F' + T); return normFormula(c.formula) === `=SUM(F${SITE_ROWS[0]}:F${SITE_ROWS[SITE_ROWS.length - 1]})` && isNum(c.value); };
const priceBlue = inp => inp.cellAt('B4').fontColor === 'blue';
/** Every typed figure in Costs B4:D8 reads blue; the total column, formulas, stays black. */
const costInputsBlue = co => COST_BLOCK.every(ref => { const c = co.cellAt(ref); return !isNum(c.value) || c.fontColor === 'blue'; }) && COST_TOTALS.every(ref => co.cellAt(ref).fontColor !== 'blue');
/** Raw's B14 reads the site name the rest of that site's rows carry. */
const typoFixed = (rw, ses) => { const cluster = clusterOf(ses); return !!cluster && rw.value('B' + TYPO_ROW) === siteNames(cluster, 5)[1] && rw.value('B' + (TYPO_ROW + 1)) === siteNames(cluster, 5)[1]; };

export default {
  id: 'foundations-testout',
  chapter: 'foundations',
  section: 'Project and assessment',
  module: 'project-and-assessment',
  workbook: 'voltline-weekly',
  state: { before: 'S7c' },
  kind: 'testout',
  title: 'Test out of Foundations',
  difficulty: 'hard',
  tags: ['assessment', 'test-out', 'audit'],
  access: 'free',
  minutes: 5,
  headline: 'Ctrl+G',
  conventions: ['A3', 'B1', 'B2', 'C8', 'D2', 'F3', 'G1'],
  uses: [],
  prerequisites: [],
  brief: 'Already know the chapter? A sister cluster’s finished Report arrived with ten faults across everything Foundations covers: the view, the inputs, the feed, the week label, the panes, a hidden column, a number format, a total and a link. Fix all ten in five minutes and the chapter is yours; the key that gets you to each one is `Ctrl+G`.',
  timeLimit: 300,
  pars: parsFrom(150, { pass: 300, pro: 210 }),
  seed: rng => {
    const cluster = pickCluster(rng);
    const sites = siteNames(cluster, 5);
    const patch = {};
    // the clothing: this cluster's five sites everywhere the Austin ones were named (Cedar Park stays the emailed sixth site), its city in the titles
    SITES.forEach((site, i) => {
      for (let d = 0; d < 12; d++) patch[`Raw!B${rawRow(site, d)}`] = { value: sites[i] };
      patch[`Raw!${RAW_TOTALS.cols.site}${RAW_TOTALS.firstRow + i}`] = { value: sites[i] };
      patch[`Raw!H${RAW_BYDAY.firstRow + i}`] = { value: sites[i] };
      patch[`Inputs!A${9 + i}`] = { value: sites[i] };
      patch[`Costs!A${COST_ROWS[site]}`] = { value: sites[i] };
      patch[`Report!A${FEED_ROWS[i]}`] = { ...BASE['A' + FEED_ROWS[i]], value: sites[i] };
      patch[`Report!A${DAILY_ROWS[i]}`] = { ...BASE['A' + DAILY_ROWS[i]], value: sites[i] };
    });
    patch['Report!A1'] = { ...TITLE_BASE, value: titleFor(cluster) };
    patch['Costs!A1'] = { ...COSTS_BASE.A1, value: `Voltline — ${cluster.city} site costs, w/c 08 Sep 2026` };
    // the ten faults, always the same ten in the same places
    patch['Report!#gridlines'] = true;                                                                   // 1 (1.1) gridlines on
    patch['Inputs!B4'] = { ...INPUTS_BASE.B4, fontColor: null };                                         // 2 (1.1) the wholesale price, an input, shown black
    for (const ref of COST_BLOCK) if (COSTS_BASE[ref]) patch['Costs!' + ref] = { ...COSTS_BASE[ref], fontColor: null };   // 3 (1.2) the typed cost figures black
    patch[`Raw!B${TYPO_ROW}`] = { value: sites[1] + sites[1].slice(-1) };                               // 4 (1.3) a site name with its last letter doubled
    for (const ref of WEEK_CELLS) patch['Report!' + ref] = { ...BASE[ref], value: STALE_LABEL };         // 5 (1.3) last week's label on every week cell
    patch['Report!#freeze'] = { r: 0, c: 0 };                                                            // 6 (1.4) the panes unfrozen
    patch['Report!#hiddenCols'] = [MARGIN_COL];                                                          // 7 (1.4) Margin % hidden
    for (const ref of AVG_CELLS) { const { decimals: _d, ...rest } = BASE[ref]; patch['Report!' + ref] = { ...rest, fmtStyle: 'general' }; }   // 8 (1.5) the average prices in General
    { const { formula: _f, ...rest } = BASE['F' + T]; patch[`Report!F${T}`] = { ...rest, value: GROSS_TOTAL }; }                             // 9 (1.6) the gross-profit total retyped as a number
    { const { formula: _f, ...rest } = BASE.D6; patch['Report!D6'] = { ...rest, value: SECOND_REVENUE }; }   // 10 (1.7) one revenue retyped over its link
    return patch;
  },
  goals: [
    { id: 'gridlines-off', text: 'The Report shows its gridlines: turn them off, as a page someone reads should be.', convention: 'A3', requires: [],
      keys: 'Alt W V G',
      check: (s, ses) => { const rep = report(ses); return !!rep && gridlinesOff(rep) && settled(ses); } },
    { id: 'week-label', text: 'Every week label on the Report still reads w/c 08 Sep: replace all of them with w/c 15 Sep in one pass.', requires: [],
      keys: `Ctrl+H "${STALE_LABEL}" Tab "${WEEK_LABEL}" Alt+A Esc`,
      check: (s, ses) => { const rep = report(ses); return !!rep && weekLabelsCurrent(rep) && settled(ses); } },
    { id: 'freeze', text: 'The panes are unfrozen, so the headers scroll away: freeze them at B5 so rows 1–4 and column A stay in view.', convention: 'C8', requires: [],
      keys: 'Ctrl+↓ ×2 ↓ → Alt W F F',
      check: (s, ses) => { const rep = report(ses); return !!rep && frozenAtB5(rep) && settled(ses); } },
    { id: 'relink-revenue', text: 'The second site’s revenue in D6 is a typed number where its link belongs: make it =Raw!J9 again.', convention: 'B2', requires: [],
      keys: '↓ → ×2 "=Raw!J9" ↵',
      check: (s, ses) => { const rep = report(ses); return !!rep && revenueLinked(rep) && settled(ses); } },
    { id: 'avg-currency', text: 'The average prices in G5:G11 lost their format: show them as currency with two decimals.', convention: 'D2', requires: [],
      keys: '→ ×3 Ctrl+↑ ↓ Ctrl+Shift+↓ Ctrl+Shift+4',
      check: (s, ses) => { const rep = report(ses); return !!rep && avgPricesCurrency(rep) && settled(ses); } },
    { id: 'unhide-margin', text: 'Margin % is hidden between G and I: select G:I and unhide it.', requires: [],
      keys: 'Ctrl+Space Shift+→ Ctrl+Shift+)',
      check: (s, ses) => { const rep = report(ses); return !!rep && marginShown(rep) && settled(ses); } },
    { id: 'gross-total', text: 'The gross-profit total in F11 was retyped as a number: make it =SUM(F5:F10) again.', requires: [],
      keys: '← Ctrl+↓ "=SUM(F5:F10)" ↵',
      check: (s, ses) => { const rep = report(ses); return !!rep && grossTotalLive(rep) && settled(ses); } },
    { id: 'price-blue', text: 'On Inputs the wholesale price in B4 is an input shown black: color it blue.', convention: 'B1', requires: [],
      keys: 'Ctrl+G "Inputs!B4" ↵ Alt H F C → ×4 ↵',
      check: (s, ses) => { const inp = inputs(ses); return !!inp && priceBlue(inp) && settled(ses); } },
    { id: 'costs-blue', text: 'On Costs the typed figures in B4:D8 read black: select the constants with Go To Special and color them blue.', convention: 'F3', requires: [],
      keys: 'Ctrl+G "Costs!B4" ↵ Ctrl+Shift+↓ Shift+→ ×2 then Alt H F D S O ↵ then Alt H F C → ×4 ↵',
      check: (s, ses) => { const co = costs(ses); return !!co && costInputsBlue(co) && settled(ses); } },
    { id: 'feed-typo', text: 'On Raw the site name in B14 has a doubled last letter: open it and remove the extra letter.', requires: [],
      keys: `Ctrl+G "Raw!B${TYPO_ROW}" ↵ F2 ⌫ ↵`,
      check: (s, ses) => { const rw = raw(ses); return !!rw && typoFixed(rw, ses) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Raw!C8" Enter "3000" Enter Ctrl+G "Report!C11" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch the first site’s Monday on Raw change to 3,000 and the Total in C11 answer, with the checks below still reading zero.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  closing: [
    'Ten faults across the seven modules of Foundations, found and fixed in one sitting: the page reads clean, every input says so in blue (B1), every link is live and green (B2), and the checks row ties.',
    'That is the chapter: moving without the mouse, marking what is typed, keeping the formulas live, and leaving a page the reader can trust.',
  ],
  solution: `Alt W V G Ctrl+H "${STALE_LABEL}" Tab "${WEEK_LABEL}" Alt+A Escape Ctrl+Down Ctrl+Down Down Right Alt W F F Down Right Right "=Raw!J9" Enter Right Right Right Ctrl+Up Down Ctrl+Shift+Down Ctrl+Shift+4 Ctrl+Space Shift+Right Ctrl+Shift+) Left Ctrl+Down "=SUM(F5:F10)" Enter Ctrl+G "Inputs!B4" Enter Alt H F C Right Right Right Right Enter Ctrl+G "Costs!B4" Enter Ctrl+Shift+Down Shift+Right Shift+Right Alt H F D S O Enter Alt H F C Right Right Right Right Enter Ctrl+G "Raw!B${TYPO_ROW}" Enter F2 Backspace Enter`,
};
