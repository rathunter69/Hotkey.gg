// Chapter 1 · 1.7.C — Challenge: audit before you send (seeded over S7b)
// The San Antonio cluster's finished Report, the page the buyer's analysts read, arrives with the
// checks row tying and five faults an audit pass finds: Cedar Park's emailed figures shown black
// among green links, one Avg ticket dividing by a typed wash figure, one daily-block cell retyped
// over its link, the title centered with spaces and its Center Across gone with the units line, and
// an all-borders grid over the daily table with gridlines on. Fix every one, change nothing else,
// then put the page number in the footer. The clothing is San Antonio's (the script's cluster);
// the seed decides where the two hardcodes sit. The workload never moves: the same keys pass every seed.
import { CLUSTERS, siteNames } from '../workbooks/clusters.js';
import { SITES, WASHES, CEDAR_PARK, REPORT, RAW_TOTALS, RAW_BYDAY, INPUT_ROWS, COST_ROWS, rawRow, stateOf } from '../workbooks/clearcoat-weekly.js';
import { unchangedExcept, roleColour, noLiteralInFormula } from '../../app/graders.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const normFormula = f => String(f || '').replace(/\s|\$/g, '').toUpperCase();

/** A1-style refs for a rectangular block, column letters inclusive. */
const span = (col1, col2, r1, r2) => { const out = []; for (let c = col1.charCodeAt(0); c <= col2.charCodeAt(0); c++) for (let r = r1; r <= r2; r++) out.push(String.fromCharCode(c) + r); return out; };

const CLUSTER = CLUSTERS.find(c => c.city === 'San Antonio');
const CITY_SITES = siteNames(CLUSTER, 5);
const SITE_ROWS = REPORT.siteRows;                 // 5–10, Cedar Park in row 9
const FEED_ROWS = SITE_ROWS.filter(r => r !== REPORT.cedarRow);   // the five linked sites: 5, 6, 7, 8, 10
const DAILY_ROWS = REPORT.dailyRows;               // 17–21
const DAY_COLS = REPORT.dayCols;                   // B:G
const GRID_BLOCK = span('B', 'G', 15, 21);         // the grid the assistant drew: header rows 15–16 and the five sites
const AVG_COL = 'G';
const TITLE_PAD = '            ';                   // twelve spaces: how the title was "centered"
const UNITS = 'USD unless stated';
const PAGE_FOOTER = 'Page &[Page] of &[Pages]';
const TITLE = `Clearcoat - ${CLUSTER.city} Weekly KPI Report, Week of Sep 15, 2026`;   // the feed on Raw is the week of Sep 15
const BASE = stateOf('S7b').sheets[0].cells;        // the un-planted Report, as the module left it
/** The cells the fixes may touch; everything else must read exactly as it arrived. */
const ALLOWED = ['A1', 'A2', 'C9', 'D9', 'E9', ...span(AVG_COL, AVG_COL, 5, 10), ...GRID_BLOCK];   // E9: hardcode-hunt taught it blue too (B1)
/** A record the engine created but never gave a meaningful field (e.g. a whole-row border pass touching H15) is no change. */
const ZEROABLE = new Set(['indent', 'scale', 'ca', 'decimals']);
const meaningful = c => !!c && Object.entries(c).some(([k, v]) => v != null && v !== false && !(v === 0 && ZEROABLE.has(k)) && !(k === 'fmtStyle' && v === 'general') && k !== 'txt');
const pruned = rep => ({ cells: Object.fromEntries(Object.entries(rep.cells || {}).filter(([, c]) => meaningful(c))) });

/** This week's washes per site per day, as Raw's by-day block reads it: row 17+i is site i, column B+j is day j. */
const dayWashes = (i, j) => WASHES[SITES[i]][6 + j];
const weekWashes = r => r === REPORT.cedarRow ? CEDAR_PARK.washes : WASHES[SITES[FEED_ROWS.indexOf(r)]].slice(6, 12).reduce((a, b) => a + b, 0);

/** The Report's cells as they should read once the faults are fixed: S7b in San Antonio's clothing. */
const EXPECTED = (() => {
  const cells = { ...BASE };
  FEED_ROWS.forEach((r, i) => { cells['A' + r] = { ...BASE['A' + r], value: CITY_SITES[i] }; });
  DAILY_ROWS.forEach((r, i) => { cells['A' + r] = { ...BASE['A' + r], value: CITY_SITES[i] }; });
  cells.A1 = { ...BASE.A1, value: TITLE };
  return cells;
})();

const blue = (rep, refs) => refs.every(ref => rep.cellAt(ref).fontColor === 'blue');
/** G5:G10 each divide revenue by the washes cell beside it, no typed number inside, in the currency format they had. */
const avgTicketLive = rep => SITE_ROWS.every(r => { const ref = AVG_COL + r; const c = rep.cellAt(ref);
  return normFormula(c.formula) === `=D${r}/C${r}` && noLiteralInFormula(rep, ref).ok && isNum(c.value) && c.fmtStyle === 'currency' && c.decimals === 2; });
/** A count in the desk format: #,##0 as typed in Format Cells, or Comma Style with no decimals. */
const countsFmt = c => (c.fmtStyle === 'custom' && c.numFmt === '#,##0') || (c.fmtStyle === 'comma' && (c.decimals || 0) === 0);
/** Every cell of the daily table is its link to Raw's by-day block, green, in the desk format. */
const dailyLinked = rep => DAILY_ROWS.every((r, i) => DAY_COLS.every((col, j) => { const c = rep.cellAt(col + r);
  return normFormula(c.formula) === `=RAW!${RAW_BYDAY.dayCols[j]}${RAW_BYDAY.firstRow + i}` && c.fontColor === 'green' && countsFmt(c) && isNum(c.value); }));
const titleRight = rep => { const c = rep.cellAt('A1'); return c.value === TITLE && c.ca === 9 && c.bold === true; };
const unitsBack = rep => rep.cellAt('A2').value === UNITS && rep.cellAt('A2').it === true;
const noGrid = rep => GRID_BLOCK.every(ref => { const c = rep.cellAt(ref); return !c.ball && !c.bt && !c.bb && !c.bl && !c.br && !c.thick && !c.bdbl; });
const gridlinesOff = rep => rep.gridlines === false;
const setup = ses => (ses.settings && ses.settings.pageSetup) || {};
const printReady = ses => { const p = setup(ses); return p.orientation === 'landscape' && p.scaling === 'fit' && p.fitWide === 1 && p.fitTall === 1; };
const pageNumbered = ses => (setup(ses).footer || {}).centre === PAGE_FOOTER;

export default {
  id: 'challenge-audit-before-you-send',
  chapter: 'foundations',
  section: 'Present and audit',
  module: 'present-and-audit',
  workbook: 'clearcoat-weekly',
  state: { before: 'S7b' },
  kind: 'challenge',
  title: 'Challenge: audit before you send',
  difficulty: 'hard',
  tags: ['challenge', 'audit', 'report'],
  access: 'free',
  minutes: 3,
  conventions: ['F3', 'B1', 'D7', 'G1'],
  prerequisites: ['hardcode-hunt'],
  brief: 'The San Antonio cluster\'s finished Report goes out in three minutes, and its checks row ties, yet it carries five faults an audit pass finds. Fix every one, change nothing else, then add the page number.',
  timeLimit: 180,
  pars: parsFrom(50, { pass: 150, pro: 90 }),
  seed: rng => {
    const patch = {};
    // the clothing: San Antonio's five sites everywhere the Austin ones were named (Cedar Park stays the emailed sixth site)
    SITES.forEach((site, i) => {
      for (let d = 0; d < 12; d++) patch[`Raw!B${rawRow(site, d)}`] = { value: CITY_SITES[i] };
      patch[`Raw!${RAW_TOTALS.cols.site}${RAW_TOTALS.firstRow + i}`] = { value: CITY_SITES[i] };
      patch[`Raw!H${RAW_BYDAY.firstRow + i}`] = { value: CITY_SITES[i] };
      patch[`Inputs!A${INPUT_ROWS.sites[i]}`] = { value: CITY_SITES[i] };
      patch[`Costs!A${COST_ROWS[site]}`] = { value: CITY_SITES[i] };
      patch[`Report!A${FEED_ROWS[i]}`] = { ...BASE['A' + FEED_ROWS[i]], value: CITY_SITES[i] };
      patch[`Report!A${DAILY_ROWS[i]}`] = { ...BASE['A' + DAILY_ROWS[i]], value: CITY_SITES[i] };
    });
    patch['Costs!A1'] = { ...stateOf('S7b').sheets.find(x => x.name === 'Costs').cells.A1, value: `Clearcoat Express: ${CLUSTER.city} site costs, week of Sep 8, 2026` };
    // the five faults, always five: the two hardcodes move with the seed
    const { ca: _ca, ...a1 } = BASE.A1; patch['Report!A1'] = { ...a1, value: TITLE_PAD + TITLE };          // centered with spaces, Center Across gone
    patch['Report!A2'] = { it: true };                                                          // the units line cleared (Delete keeps the italic)
    const litRow = SITE_ROWS[Math.floor(rng() * SITE_ROWS.length)];                             // one Avg ticket divides by the wash figure typed in
    patch[`Report!${AVG_COL}${litRow}`] = { ...BASE[AVG_COL + litRow], formula: `=D${litRow}/${weekWashes(litRow)}` };
    for (const ref of GRID_BLOCK) patch['Report!' + ref] = { ...BASE[ref], ball: true };         // a grid over the daily table…
    patch['Report!#gridlines'] = true;                                                          // …with gridlines on
    const i = Math.floor(rng() * DAILY_ROWS.length), j = Math.floor(rng() * DAY_COLS.length);   // one daily cell retyped over its link, never B17, the cell the fix edits from
    const [ri, cj] = i === 0 && j === 0 ? [1, 0] : [i, j];
    const { formula: _f, ...dead } = BASE[DAY_COLS[cj] + DAILY_ROWS[ri]]; patch[`Report!${DAY_COLS[cj]}${DAILY_ROWS[ri]}`] = { ...dead, value: dayWashes(ri, cj), ball: true };
    return patch;
  },
  goals: [
    { id: 'title-units', text: 'The title was centered with spaces and the units line is gone: delete the spaces, center A1 across A1:I1, restore USD unless stated in A2.', convention: 'D7',
      keys: 'F2 Home Delete ×12 ↵ ↓ ×3 Ctrl+→ ← ×3 Ctrl+↑ Ctrl+Shift+← Ctrl+1 A Alt+H ↓ ×4 ↵ Ctrl+← ↓ "USD unless stated" ↵',
      check: (s, ses) => { const rep = report(ses); return !!rep && titleRight(rep) && unitsBack(rep) && settled(ses); } },
    { id: 'inputs-blue', text: 'Cedar Park\'s emailed figures sit black among the green links: Go To Special constants over C5:D10 finds them; color them blue.', convention: 'B1',
      keys: 'Ctrl+↓ ↓ → ×2 Ctrl+Shift+↓ Shift+↑ Shift+→ then Alt H F D S O ↵ then Alt H F C → ×4 ↵',
      check: (s, ses) => { const rep = report(ses); return !!rep && blue(rep, ['C9', 'D9']) && roleColour(rep, 'C5:D10').ok && settled(ses); } },
    { id: 'avg-ticket', text: 'Show formulas: one Avg ticket cell divides by a typed wash figure, so rewrite G5:G10 as one formula, =D5/C5, with Ctrl+Enter.', convention: 'F3',
      keys: 'Ctrl+` Ctrl+↓ Ctrl+→ ← Ctrl+↑ ↓ Ctrl+Shift+↓ Shift+↑ "=D5/C5" Ctrl+↵',
      check: (s, ses) => { const rep = report(ses); return !!rep && avgTicketLive(rep) && settled(ses); } },
    { id: 'no-grid', text: 'A grid was drawn over the daily table B15:G21 with the gridlines on: remove every border and turn the gridlines off.',
      keys: 'Ctrl+↓ ×2 ↓ Ctrl+← → Ctrl+Shift+↓ Ctrl+Shift+→ then Alt H B N then Alt W V G',
      check: (s, ses) => { const rep = report(ses); return !!rep && noGrid(rep) && gridlinesOff(rep) && settled(ses); } },
    { id: 'daily-links', text: 'One daily-table cell is a typed number among links: select B17:G21, open B17 with F2, commit it to every cell with Ctrl+Enter, Ctrl+` off.', convention: 'F3',
      keys: '↓ ×2 Ctrl+Shift+↓ Ctrl+Shift+→ F2 Ctrl+↵ then Ctrl+`',
      check: (s, ses) => { const rep = report(ses); return !!rep && dailyLinked(rep) && !ses.settings.showFormulas && settled(ses); } },
    { id: 'page-number', text: 'The page prints landscape on one sheet but carries no page number: put Page &[Page] of &[Pages] in the center footer section.', convention: 'G1',
      keys: `Alt P S P H Alt+U Alt+C "${PAGE_FOOTER}" ↵ ↵`,
      check: (s, ses) => printReady(ses) && pageNumbered(ses) && settled(ses) },
  ],
  graders: [
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      return unchangedExcept(pruned(rep), EXPECTED, ALLOWED); },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      for (const r of SITE_ROWS) { const ref = AVG_COL + r; const lit = noLiteralInFormula(rep, ref); if (!lit.ok) return lit;
        if (normFormula(rep.formula(ref)) !== `=D${r}/C${r}`) return { ok: false, why: `${ref} is not revenue over washes. One formula down the column` }; }
      return { ok: true }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      for (const r of DAILY_ROWS) for (const col of DAY_COLS) { const c = rep.cellAt(col + r);
        if (!c.formula) return { ok: false, why: `${col}${r} is a typed number where the link to Raw belongs` };
        if (c.fontColor !== 'green') return { ok: false, why: `${col}${r} is a link shown ${c.fontColor || 'black'}. Links are green` }; }
      return { ok: true }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' }; return roleColour(rep, 'C5:D10'); },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      const c = rep.cellAt('A1'); if (c.value !== String(c.value).trim()) return { ok: false, why: 'A1 is still centered with spaces. Center Across Selection, never padding' };
      if (c.ca !== 9) return { ok: false, why: 'the title is not centered across A1:I1' };
      if (rep.value('A2') !== UNITS) return { ok: false, why: 'no units line. State the currency once in A2 (USD unless stated)' };
      return { ok: true }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      if (!noGrid(rep)) return { ok: false, why: 'the daily table still carries a border grid. Borders carry structure, a grid is noise' };
      if (!gridlinesOff(rep)) return { ok: false, why: 'the gridlines are on. Off on a page someone reads' };
      return { ok: true }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      for (let i = 0; i < 3; i++) { const ref = 'B' + (REPORT.checksRow + 1 + i); const c = rep.cellAt(ref);
        if (!c.formula) return { ok: false, why: `${ref} is not a formula. A check is a live difference, not a typed 0` };
        if (!isNum(c.value) || Math.abs(c.value) > 1e-6) return { ok: false, why: `${ref} reads ${c.value}. The checks row no longer ties` }; }
      return { ok: true }; },
    ses => printReady(ses) && pageNumbered(ses) ? { ok: true } : { ok: false, why: 'the footer has no page number. Page &[Page] of &[Pages] in the center section, landscape, fit to one page' },
  ],
  closing: [
    'Three looks (Go To Special, show formulas, the page) found five faults, and you fixed them without touching anything else.',
    'A checks row that ties is necessary, not sufficient. The audit pass is what a reviewer does after the checks say zero.',
  ],
  solution: `F2 Home Delete Delete Delete Delete Delete Delete Delete Delete Delete Delete Delete Delete Enter Down Down Down Ctrl+Right Left Left Left Ctrl+Up Ctrl+Shift+Left Ctrl+1 A Alt+H Down Down Down Down Enter Ctrl+Left Down "USD unless stated" Enter Ctrl+Down Down Right Right Ctrl+Shift+Down Shift+Up Shift+Right Alt H F D S O Enter Alt H F C Right Right Right Right Enter Ctrl+\` Ctrl+Down Ctrl+Right Left Ctrl+Up Down Ctrl+Shift+Down Shift+Up "=D5/C5" Ctrl+Enter Ctrl+Down Ctrl+Down Down Ctrl+Left Right Ctrl+Shift+Down Ctrl+Shift+Right Alt H B N Alt W V G Down Down Ctrl+Shift+Down Ctrl+Shift+Right F2 Ctrl+Enter Ctrl+\` Alt P S P H Alt+U Alt+C "${PAGE_FOOTER}" Enter Enter`,
};
