// app2/content/drills/austin.js — what Chapter 1's drills share (screenplay 6.1; M108): the Austin
// cluster's figures for the week of Sep 15 from the chapter workbook, the drill pages built through
// the shared page module, the start-state cuts, and the end-state checks. Every drill's solved sheet
// is a buildPage() page; its start state is cut from it here, never laid out by hand.
import { buildPage, cutFrom } from '../workbooks/page.js';
import { SITES, SITE_TICKET, COST_PER_WASH, WASHES, viaEngine as wbViaEngine } from '../workbooks/clearcoat-weekly.js';
import { isLiveFormula } from '../../engine/live.js';
import { colLetter } from '../../engine/refs.js';
import { formulaRefs } from '../../engine/formula.js';

export { SITES, SITE_TICKET, COST_PER_WASH };
export const UNITS = 'USD unless stated';
export const WEEK = 'week of Sep 15';
export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/** This week's washes, site by site and day by day (the workbook's feed, Mon 15 to Sat 20 Sep). */
export const DAY_WASHES = Object.fromEntries(SITES.map(s => [s, WASHES[s].slice(6, 12)]));
export const WEEK_WASHES = Object.fromEntries(SITES.map(s => [s, DAY_WASHES[s].reduce((a, b) => a + b, 0)]));
export const r2 = v => Math.round(v * 100) / 100;

/* ---------------- the pages ---------------- */

/**
 * The site table every Chapter 1 drill page starts from: one row per site, Washes and Avg ticket
 * typed, Revenue, Wash cost and Gross profit one formula per row, a total row, and the input the
 * wash cost reads. `rows` is the site list (default the five Austin sites); `inputAt` is where the
 * cost per wash lands, so the anchored formula can name it.
 */
export function siteRows(sites = SITES, { costRef = '$B$13', washes = WEEK_WASHES, ticket = SITE_TICKET } = {}) {
  return sites.map(s => ({
    key: s, label: s,
    fill: (col, r) => ({ B: washes[s], C: ticket[s], D: `=B${r}*C${r}`, E: `=B${r}*${costRef}`, F: `=D${r}-E${r}` })[col],
  }));
}
export const SITE_HEADERS = ['Washes', 'Avg ticket', 'Revenue', 'Wash cost', 'Gross profit'];
export const SITE_KINDS = ['count', 'unit', 'money', 'money', 'money'];
/** The total row of the site table: sums, and the blended ticket (revenue over washes). */
export const siteTotal = (first, last) => ({
  key: 'total', label: 'Total', total: true,
  fill: (col, r) => col === 'C' ? `=D${r}/B${r}` : 'BDEF'.includes(col) ? `=SUM(${col}${first}:${col}${last})` : null,
});
/** The input block under a site table: the supplier's cost per wash. */
export const costBlock = () => ({ title: 'Inputs', rows: [{ key: 'cost', label: 'Cost per wash', kind: 'unit', dollar: true, values: [COST_PER_WASH] }] });

/**
 * The Austin weekly report page: the site table, the cost input, this week's washes by day, the
 * source line and a check that the two blocks agree. Rows: sites 5 to 9, total 10, Inputs 12 and 13,
 * washes by day 15 to 21, source 22, checks 24 and 25. Columns A to G.
 */
export function reportPage({ title = `Austin weekly report, ${WEEK}`, dailyTitle = 'Washes by day', source = `Source: site POS, ${WEEK}` } = {}) {
  return buildPage({
    name: 'Report', chapter: 1, title, units: UNITS, labelHeader: 'Site',
    headers: SITE_HEADERS, kinds: SITE_KINDS,
    blocks: [
      { rows: [...siteRows(), siteTotal(5, 9)] },
      costBlock(),
      { title: dailyTitle, header: DAY_NAMES, kinds: DAY_NAMES.map(() => 'count'),
        rows: SITES.map(s => ({ key: 'd-' + s, label: s, dollar: false, values: DAY_WASHES[s] })) },
    ],
    source,
    checks: [{ label: 'Washes tie to the days', formula: (col, r, at) => `=B${at('total')}-SUM(B${at('d-' + SITES[0])}:G${at('d-' + SITES[SITES.length - 1])})` }],
  });
}

/** Domain's site costs for the week, by day: the lines a manager sends, totaled by pointing. */
export const COST_LINES = { Labor: [610, 640, 655, 640, 720, 760], Rent: [300, 300, 300, 300, 300, 300], Insurance: [45, 45, 45, 45, 45, 45], Maintenance: [80, 95, 70, 110, 85, 90], Utilities: [120, 125, 118, 122, 140, 150], 'Card fees': [88, 92, 90, 94, 105, 112] };

/**
 * Domain's site costs page: the cost lines by day, Mon to Sat in B:G, the week in H, and a total
 * written as pointed additions (the way a manager's sheet arrives, and why an inserted line can
 * miss it). Lines 5 on; the total under them; the source line; a check that the week ties.
 */
export function costsPage({ lines = ['Labor', 'Rent', 'Maintenance', 'Card fees'], name = 'Costs' } = {}) {
  const first = 5, last = 5 + lines.length - 1;
  return buildPage({
    name, chapter: 1, title: `Domain site costs, ${WEEK}`, units: UNITS, labelHeader: 'Cost line',
    headers: [...DAY_NAMES, 'Week'], kinds: DAY_NAMES.map(() => 'money').concat('money'),
    blocks: [{ rows: [
      ...lines.map(l => ({ key: l, label: l, fill: (col, r) => col === 'H' ? `=SUM(B${r}:G${r})` : COST_LINES[l][col.charCodeAt(0) - 66] })),
      { key: 'total', label: 'Total', total: true, fill: col => '=' + lines.map((_, i) => col + (first + i)).join('+') },
    ] }],
    source: 'Source: Domain site manager, weekly costs',
    checks: [{ label: 'Week ties to the days', formula: (col, r, at) => `=H${at('total')}-SUM(B${at('total')}:G${at('total')})` }],
  });
}

/* ---------------- start states ---------------- */

/** Empty the given cells' contents, keeping their formats (the shelling rule: only graded cells are emptied). */
export function emptied(cells, refs) {
  for (const ref of refs) { const c = cells[ref]; if (!c) continue; delete c.value; delete c.formula; if (!Object.keys(c).length) delete cells[ref]; }
}
/** Every ref in a rectangular range ('B5:D9'). */
export function refsIn(range) {
  const [a, b] = range.split(':'); const p = cellParts(a), q = cellParts(b || a);
  const out = [];
  for (let r = p.r; r <= q.r; r++) for (let c = p.c; c <= q.c; c++) out.push(colLetter(c) + r);
  return out;
}
function cellParts(ref) { const m = /^([A-Z]+)(\d+)$/.exec(ref); let c = 0; for (const ch of m[1]) c = c * 26 + ch.charCodeAt(0) - 64; return { r: +m[2], c }; }
/** The format fields a plain export or an unformatted block carries none of. */
export const FORMAT_FIELDS = ['bold', 'it', 'fsz', 'ca', 'align', 'fmtStyle', 'decimals', 'numFmt', 'fontColor', 'bt', 'bdbl', 'indent', 'fill', 'ball', 'wrap'];
export function unformatted(cells, refs) {
  for (const ref of refs) { const c = cells[ref]; if (!c) continue; for (const f of FORMAT_FIELDS) delete c[f]; if (!Object.keys(c).length) delete cells[ref]; }
}
/** Run engine operations over a cut sheet (a row deleted, a width set) so the start state is what the engine makes of them. */
export function viaEngine(sheet, fn) {
  const state = { sheets: [sheet] };
  wbViaEngine(state, sheet.name, fn);
  return sheet;
}
export { buildPage, cutFrom };

/* ---------------- checks (end state, any route) ---------------- */

export const near = (v, want) => typeof v === 'number' && Math.abs(v - want) < 1e-6;
/** The active cell is `ref` with nothing else selected. */
export const at = (s, ref) => !s.sel && s.selectionText() === ref;
/** The selection is exactly `range`. */
export const selIs = (s, range) => !!s.sel && s.selectionText() === range;
/** A live formula: it moves when an input moves (engine/live.js, the one rule). `inputs` names cells on other sheets ('Austin!B5'). */
export const live = (s, ref, inputs) => isLiveFormula(s, ref, inputs ? { inputs } : {});
/** A live formula showing the value it should. */
export const liveIs = (s, ref, want) => near(s.value(ref), want) && live(s, ref);
/** Whether every ref holds a live formula with the wanted value: `want(ref)` gives it. */
export const allLive = (s, refs, want) => refs.every(ref => liveIs(s, ref, want(ref)));
export const num = (s, ref) => { const v = s.value(ref); return typeof v === 'number' ? v : 0; };
/**
 * Whether the formula in `ref` reads the cell `target` ('H5', or 'Austin!B5' on another sheet),
 * directly or inside a range. A token check on a cell the goal names (CLAUDE.md: convention graders
 * read parsed tokens), for answers the what-if cannot move (shares that always add to 100%).
 */
export function reads(s, ref, target) {
  const f = s.formula(ref); if (!f) return false;
  const [sh, cell] = target.includes('!') ? target.split('!') : [null, target];
  const bare = cell.replace(/\$/g, ''), p = cellParts(bare);
  let refs; try { refs = formulaRefs(f); } catch (e) { return false; }
  return refs.some(x => (sh ? (x.sheet || '') === sh.toUpperCase() : !x.sheet)
    && (x.range ? p.r >= x.range.r1 && p.r <= x.range.r2 && p.c >= x.range.c1 && p.c <= x.range.c2 : x.key === bare));
}
/** The sheet of a workbook drill by name. */
export const sheetNamed = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
