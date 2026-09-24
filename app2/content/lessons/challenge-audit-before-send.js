// Chapter 1 · 1.7.C — Challenge: audit before you send (seeded over S7b)
// A sister cluster's finished Report, the page the buyer's analysts read, arrives with the checks
// row tying and five faults an audit pass finds: Cedar Park's emailed figures shown black among
// green links, one Avg price dividing by a typed kWh figure, one daily-block cell retyped over its
// link, the title centered with spaces and its Center Across gone with the units line, and an
// all-borders grid over the daily table with gridlines on. Fix every one, change nothing else, then
// put the page number in the footer. Seeds dress the city, the site names and where the two
// hardcodes sit; the workload never moves: the same keys pass every seed.
import { CLUSTERS, pickCluster, siteNames } from '../workbooks/clusters.js';
import { SITES, KWH, CEDAR_PARK, REPORT, RAW_TOTALS, RAW_BYDAY, rawRow, stateOf } from '../workbooks/voltline-weekly.js';
import { unchangedExcept, roleColour, noLiteralInFormula } from '../../app/graders.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const inputs = ses => sheetOf(ses, 'Inputs');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const normFormula = f => String(f || '').replace(/\s|\$/g, '').toUpperCase();

/** A1-style refs for a rectangular block, column letters inclusive. */
const span = (col1, col2, r1, r2) => { const out = []; for (let c = col1.charCodeAt(0); c <= col2.charCodeAt(0); c++) for (let r = r1; r <= r2; r++) out.push(String.fromCharCode(c) + r); return out; };

const SITE_ROWS = REPORT.siteRows;                 // 5–10, Cedar Park in row 9
const FEED_ROWS = SITE_ROWS.filter(r => r !== REPORT.cedarRow);   // the five linked sites: 5, 6, 7, 8, 10
const DAILY_ROWS = REPORT.dailyRows;               // 17–21
const DAY_COLS = REPORT.dayCols;                   // B:G
const DAILY_BLOCK = span('B', 'G', 17, 21);
const GRID_BLOCK = span('B', 'G', 15, 21);         // the grid the associate drew: header rows 15–16 and the five sites
const AVG_COL = 'G';
const TITLE_PAD = '            ';                   // twelve spaces: how the title was "centered"
const UNITS = 'USD unless stated';
const PAGE_FOOTER = 'Page &[Page] of &[Pages]';
const BASE = stateOf('S7b').sheets[0].cells;        // the un-planted Report, as the module left it
/** The cells the fixes may touch; everything else must read exactly as it arrived. */
const ALLOWED = ['A1', 'A2', 'C9', 'D9', ...span(AVG_COL, AVG_COL, 5, 10), ...GRID_BLOCK];
/** The seed's clothing: the five site rows, the daily table's labels, the week label cells. */
const CLOTHED = [...FEED_ROWS.map(r => 'A' + r), ...DAILY_ROWS.map(r => 'A' + r), ...SITE_ROWS.map(r => 'B' + r), ...DAY_COLS.map(c => c + 14)];

/** The cluster the seed dressed the file in, read back from Inputs' site list (never touched by the fixes). */
const clusterOf = ses => { const inp = inputs(ses); if (!inp) return null; const first = inp.value('A9'); return CLUSTERS.find(c => c.sites[0] === first) || null; };
const titleFor = cluster => `Voltline - ${cluster.city} Weekly KPI Report, ${cluster.week}`;
const weekLabel = cluster => cluster.week.replace(/\s\d{4}$/, '');
/** This week's kWh per site per day, as Raw's by-day block reads it: row 17+i is site i, column B+j is day j. */
const dayKwh = (i, j) => KWH[SITES[i]][6 + j];
const weekKwh = r => r === REPORT.cedarRow ? CEDAR_PARK.kwh : KWH[SITES[FEED_ROWS.indexOf(r)]].slice(6, 12).reduce((a, b) => a + b, 0);

/** The Report's cells as they should read once the faults are fixed: S7b in this seed's clothing. */
const expectedCells = ses => {
  const cluster = clusterOf(ses); if (!cluster) return null;
  const sites = siteNames(cluster, 5);
  const cells = { ...BASE };
  FEED_ROWS.forEach((r, i) => { cells['A' + r] = { ...BASE['A' + r], value: sites[i] }; });
  DAILY_ROWS.forEach((r, i) => { cells['A' + r] = { ...BASE['A' + r], value: sites[i] }; });
  for (const r of SITE_ROWS) cells['B' + r] = { ...BASE['B' + r], value: weekLabel(cluster) };
  for (const c of DAY_COLS) cells[c + 14] = { ...BASE[c + 14], value: weekLabel(cluster) };
  cells.A1 = { ...BASE.A1, value: titleFor(cluster) };
  return cells;
};

const blue = (rep, refs) => refs.every(ref => rep.cellAt(ref).fontColor === 'blue');
/** G5:G10 each divide revenue by the kWh cell beside it, no typed number inside, in the currency format they had. */
const avgPriceLive = rep => SITE_ROWS.every(r => { const ref = AVG_COL + r; const c = rep.cellAt(ref);
  return normFormula(c.formula) === `=D${r}/C${r}` && noLiteralInFormula(rep, ref).ok && isNum(c.value) && c.fmtStyle === 'currency' && c.decimals === 2; });
/** Every cell of the daily table is its link to Raw's by-day block, green, comma 0. */
const dailyLinked = rep => DAILY_ROWS.every((r, i) => DAY_COLS.every((col, j) => { const c = rep.cellAt(col + r);
  return normFormula(c.formula) === `=RAW!${RAW_BYDAY.dayCols[j]}${RAW_BYDAY.firstRow + i}` && c.fontColor === 'green' && c.fmtStyle === 'comma' && (c.decimals || 0) === 0 && isNum(c.value); }));
const titleRight = (rep, ses) => { const cluster = clusterOf(ses); const c = rep.cellAt('A1');
  return !!cluster && c.value === titleFor(cluster) && c.ca === 9 && c.bold === true; };
const unitsBack = rep => { const c = rep.cellAt('A2'); return c.value === UNITS && c.it === true; };
const noGrid = rep => GRID_BLOCK.every(ref => { const c = rep.cellAt(ref); return !c.ball && !c.bt && !c.bb && !c.bl && !c.br; });
const gridlinesOff = rep => rep.gridlines === false;
const setup = ses => (ses.settings && ses.settings.pageSetup) || {};
const printReady = ses => { const p = setup(ses); return p.orientation === 'landscape' && p.scaling === 'fit' && p.fitWide === 1 && p.fitTall === 1; };
const pageNumbered = ses => (setup(ses).footer || {}).centre === PAGE_FOOTER;

export default {
  id: 'challenge-audit-before-send',
  chapter: 'foundations',
  section: 'Present and audit',
  module: 'present-and-audit',
  workbook: 'voltline-weekly',
  state: { before: 'S7b' },
  kind: 'challenge',
  title: 'Challenge: audit before you send',
  difficulty: 'hard',
  tags: ['challenge', 'audit', 'report'],
  access: 'free',
  minutes: 3,
  conventions: ['F3', 'B1', 'D7', 'G1'],
  prerequisites: ['hardcode-hunt'],
  brief: 'A sister cluster’s finished Report goes to the buyer in three minutes and its checks row ties, yet it carries five faults an audit pass finds: fix every one, change nothing else, then add the page number.',
  timeLimit: 180,
  pars: parsFrom(50, { pass: 150, pro: 90 }),
  seed: rng => {
    const cluster = pickCluster(rng);
    const sites = siteNames(cluster, 5);
    const patch = {};
    // the clothing: this cluster's five sites everywhere the Austin ones were named (Cedar Park stays the emailed sixth site), its week label
    SITES.forEach((site, i) => {
      for (let d = 0; d < 12; d++) patch[`Raw!B${rawRow(site, d)}`] = { value: sites[i] };
      patch[`Raw!${RAW_TOTALS.cols.site}${RAW_TOTALS.firstRow + i}`] = { value: sites[i] };
      patch[`Raw!H${RAW_BYDAY.firstRow + i}`] = { value: sites[i] };
      patch[`Inputs!A${9 + i}`] = { value: sites[i] };
      patch[`Costs!A${4 + i}`] = { value: sites[i] };
      patch[`Report!A${FEED_ROWS[i]}`] = { ...BASE['A' + FEED_ROWS[i]], value: sites[i] };
      patch[`Report!A${DAILY_ROWS[i]}`] = { ...BASE['A' + DAILY_ROWS[i]], value: sites[i] };
    });
    patch['Inputs!B3'] = { value: weekLabel(cluster), fill: 'blue' };
    for (const r of SITE_ROWS) patch['Report!B' + r] = { ...BASE['B' + r], value: weekLabel(cluster) };
    for (const c of DAY_COLS) patch[`Report!${c}14`] = { ...BASE[c + 14], value: weekLabel(cluster) };
    // the five faults, always five: the two hardcodes move with the seed
    const { ca: _ca, ...a1 } = BASE.A1; patch['Report!A1'] = { ...a1, value: TITLE_PAD + titleFor(cluster) };   // centered with spaces, Center Across gone
    patch['Report!A2'] = { it: true };                                                          // the units line cleared (Delete keeps the italic)
    const litRow = SITE_ROWS[Math.floor(rng() * SITE_ROWS.length)];                             // one Avg price divides by the kWh figure typed in
    patch[`Report!${AVG_COL}${litRow}`] = { ...BASE[AVG_COL + litRow], formula: `=D${litRow}/${weekKwh(litRow)}` };
    for (const ref of GRID_BLOCK) patch['Report!' + ref] = { ...BASE[ref], ball: true };         // a grid over the daily table…
    patch['Report!#gridlines'] = true;                                                          // …with gridlines on
    const i = Math.floor(rng() * DAILY_ROWS.length), j = Math.floor(rng() * DAY_COLS.length);   // one daily cell retyped over its link — never G17, the cell the fix edits from
    const [ri, cj] = i === 0 && j === 5 ? [1, 5] : [i, j];
    const { formula: _f, ...dead } = BASE[DAY_COLS[cj] + DAILY_ROWS[ri]]; patch[`Report!${DAY_COLS[cj]}${DAILY_ROWS[ri]}`] = { ...dead, value: dayKwh(ri, cj), ball: true };
    return patch;
  },
  goals: [
    { id: 'title-units', text: 'The title was centered with spaces and the units line is gone: delete the spaces, center A1 across A1:I1, restore USD unless stated in A2.', convention: 'D7',
      keys: 'F2 Home Delete ×12 ↵ ↑ Shift+→ ×8 Ctrl+1 A ↓ "USD unless stated" ↵',
      check: (s, ses) => { const rep = report(ses); return !!rep && titleRight(rep, ses) && unitsBack(rep) && settled(ses); } },
    { id: 'inputs-blue', text: 'Cedar Park’s emailed figures sit black among the green links: Go To Special constants over C5:D10 finds them; color them blue.', convention: 'B1',
      keys: 'Ctrl+↓ ↓ → ×2 Ctrl+Shift+↓ Shift+↑ Shift+→ then Alt H F D S O ↵ then Alt H F C → ×4 ↵',
      check: (s, ses) => { const rep = report(ses); return !!rep && blue(rep, ['C9', 'D9']) && roleColour(rep, 'C5:D10').ok && settled(ses); } },
    { id: 'avg-price', text: 'Show formulas: one Avg price cell divides by a typed kWh figure, so rewrite G5:G10 as one formula, =D5/C5, with Ctrl+Enter.', convention: 'F3',
      keys: 'Ctrl+` Ctrl+↓ Ctrl+→ ← Ctrl+↑ ↓ Ctrl+Shift+↓ Shift+↑ "=D5/C5" Ctrl+↵',
      check: (s, ses) => { const rep = report(ses); return !!rep && avgPriceLive(rep) && settled(ses); } },
    { id: 'no-grid', text: 'A grid was drawn over the daily table B15:G21 with the gridlines on: remove every border and turn the gridlines off.',
      keys: 'Ctrl+↓ ×2 ↓ Shift+← ×5 Ctrl+Shift+↓ then Alt H B N then Alt W V G',
      check: (s, ses) => { const rep = report(ses); return !!rep && noGrid(rep) && gridlinesOff(rep) && settled(ses); } },
    { id: 'daily-links', text: 'One daily-table cell is a typed number among links: select B17:G21, open G17 with F2 and commit it to every cell with Ctrl+Enter.', convention: 'F3',
      keys: '↓ ×2 Shift+← ×5 Ctrl+Shift+↓ F2 Ctrl+↵ then Ctrl+`',
      check: (s, ses) => { const rep = report(ses); return !!rep && dailyLinked(rep) && !ses.settings.showFormulas && settled(ses); } },
    { id: 'page-number', text: 'The page prints landscape on one sheet but carries no page number: put Page &[Page] of &[Pages] in the center footer section.', convention: 'G1',
      keys: `Alt P S P Alt+H Alt+C "${PAGE_FOOTER}" ↵`,
      check: (s, ses) => printReady(ses) && pageNumbered(ses) && settled(ses) },
  ],
  graders: [
    ses => { const rep = report(ses); const want = expectedCells(ses); if (!rep || !want) return { ok: false, why: 'No Report sheet.' };
      return unchangedExcept(rep, want, [...ALLOWED, ...CLOTHED]); },
    ses => { const rep = report(ses); const want = expectedCells(ses); if (!rep || !want) return { ok: false, why: 'No Report sheet.' };
      for (const ref of CLOTHED) if (rep.value(ref) !== want[ref].value) return { ok: false, why: `${ref} changed — fix the faults and nothing else` };
      return { ok: true }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      for (const r of SITE_ROWS) { const ref = AVG_COL + r; const lit = noLiteralInFormula(rep, ref); if (!lit.ok) return lit;
        if (normFormula(rep.formula(ref)) !== `=D${r}/C${r}`) return { ok: false, why: `${ref} is not revenue over kWh — one formula down the column` }; }
      return { ok: true }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      for (const r of DAILY_ROWS) for (const col of DAY_COLS) { const c = rep.cellAt(col + r);
        if (!c.formula) return { ok: false, why: `${col}${r} is a typed number where the link to Raw belongs` };
        if (c.fontColor !== 'green') return { ok: false, why: `${col}${r} is a link shown ${c.fontColor || 'black'} — links are green` }; }
      return { ok: true }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' }; return roleColour(rep, 'C5:D10'); },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      const c = rep.cellAt('A1'); if (c.value !== String(c.value).trim()) return { ok: false, why: 'A1 is still centered with spaces — Center Across Selection, never padding' };
      if (c.ca !== 9) return { ok: false, why: 'the title is not centered across A1:I1' };
      if (rep.value('A2') !== UNITS) return { ok: false, why: 'no units line — state the currency once in A2 ("USD unless stated")' };
      return { ok: true }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      if (!noGrid(rep)) return { ok: false, why: 'the daily table still carries a border grid — borders carry structure, a grid is noise' };
      if (!gridlinesOff(rep)) return { ok: false, why: 'the gridlines are on — off on a page someone reads' };
      return { ok: true }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      for (let i = 0; i < 3; i++) { const ref = 'B' + (REPORT.checksRow + 1 + i); const c = rep.cellAt(ref);
        if (!c.formula) return { ok: false, why: `${ref} is not a formula — a check is a live difference, not a typed 0` };
        if (!isNum(c.value) || Math.abs(c.value) > 1e-6) return { ok: false, why: `${ref} reads ${c.value} — the checks row no longer ties` }; }
      return { ok: true }; },
    ses => printReady(ses) && pageNumbered(ses) ? { ok: true } : { ok: false, why: 'the footer has no page number — Page &[Page] of &[Pages] in the center section, landscape, fit to one page' },
  ],
  solution: `F2 Home Delete Delete Delete Delete Delete Delete Delete Delete Delete Delete Delete Delete Enter Up Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+1 A Down "USD unless stated" Enter Ctrl+Down Down Right Right Ctrl+Shift+Down Shift+Up Shift+Right Alt H F D S O Enter Alt H F C Right Right Right Right Enter Ctrl+\` Ctrl+Down Ctrl+Right Left Ctrl+Up Down Ctrl+Shift+Down Shift+Up "=D5/C5" Ctrl+Enter Ctrl+Down Ctrl+Down Down Shift+Left Shift+Left Shift+Left Shift+Left Shift+Left Ctrl+Shift+Down Alt H B N Alt W V G Down Down Shift+Left Shift+Left Shift+Left Shift+Left Shift+Left Ctrl+Shift+Down F2 Ctrl+Enter Ctrl+\` Alt P S P Alt+H Alt+C "${PAGE_FOOTER}" Enter`,
};
