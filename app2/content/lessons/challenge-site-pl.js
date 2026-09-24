// Chapter 1 · 1.6.C — Challenge: the site P&L (seeded over S2a)
// A sister cluster's site P&L (profit and loss by site) arrives the way module 1.6 found the
// Austin page: kWh and revenue typed from last week's page, the energy cost multiplied by a typed
// 0.13 with one row pointing at a site name (#VALUE!), gross profit half typed and half formula
// with a #REF! in it, no totals and no margin. Link the two input columns to Raw's totals block by
// pointing across sheets, anchor the wholesale price on Inputs with F4, one formula per column
// committed with Ctrl+Enter (the fills carry the two errors away), AutoSum the block, add the
// margin. Seeds dress the city, the site names and every figure on the feed; the workload never
// moves: the same keys pass every seed.
import { pickCluster, siteNames } from '../workbooks/clusters.js';
import { SITES, WHOLESALE, RAW_TOTALS, RAW_BYDAY, rawRow } from '../workbooks/voltline-weekly.js';
import { liveness, noLiteralInFormula, roleColour } from '../../app/graders.js';
import { translateFormula, ERROR_CODES } from '../../engine/formula.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) < 1e-6;
const normFormula = f => String(f || '').replace(/\s/g, '').toUpperCase();
const r2 = v => Math.round(v * 100) / 100;
const isError = v => typeof v === 'string' && ERROR_CODES.includes(v.toUpperCase());

const HEADERS = ['Site', 'kWh sold', 'Revenue ($)', 'Energy cost ($)', 'Gross profit ($)', 'Margin %'];
const HEADER_ROW = 4, FIRST_SITE = 5, LAST_SITE = 9, TOTAL_ROW = 10;   // five sites in rows 5–9, the Total in row 10
const SITE_ROWS = [5, 6, 7, 8, 9];
const ALL_ROWS = [5, 6, 7, 8, 9, 10];
const TYPED_PROFIT = [5, 9];          // the two gross-profit rows typed as numbers
const REF_ERROR_ROW = 7;             // E7 =C7-#REF!
const VALUE_ERROR_ROW = 8;           // D8 =B8*Inputs!A9 — a site name where the rate belongs
const RAW_FIRST = RAW_TOTALS.firstRow;   // Raw's site totals block: rows 8–12, kWh in I, revenue in J
const LINKS = { B: RAW_TOTALS.cols.kwh, C: RAW_TOTALS.cols.revenue };
const RATE = '=B5*INPUTS!$B$4';

/** A1-style refs for a rectangular block, column letters inclusive. */
const span = (col1, col2, r1_, r2_) => { const out = []; for (let c = col1.charCodeAt(0); c <= col2.charCodeAt(0); c++) for (let r = r1_; r <= r2_; r++) out.push(String.fromCharCode(c) + r); return out; };
const FIGURES = span('B', 'F', FIRST_SITE, TOTAL_ROW);

/** `ref` holds exactly `formula` (spacing ignored, anchors kept) and reads a finite number. */
const holds = (sh, ref, formula) => normFormula(sh.formula(ref)) === normFormula(formula) && isNum(sh.value(ref));
/** Report column `col` rows 5–9 are live links to Raw's totals block, one row each. */
const linked = (sh, col) => SITE_ROWS.map((r, i) => [r, i]).every(([r, i]) => holds(sh, col + r, `=Raw!${LINKS[col]}${RAW_FIRST + i}`));
const green = (sh, refs) => refs.every(ref => sh.cellAt(ref).fontColor === 'green');
/** Every cell of `col` in `rows` is the first one translated down: one formula per column, filled down. */
const colConsistent = (sh, col, rows) => {
  const base = sh.formula(col + rows[0]);
  if (!base) return false;
  return rows.every((r, i) => normFormula(sh.formula(col + r)) === normFormula(translateFormula(base, i, 0)));
};
const rateLinked = sh => holds(sh, 'D5', RATE) && colConsistent(sh, 'D', SITE_ROWS) && SITE_ROWS.every(r => isNum(sh.value('D' + r)));
const profitLive = sh => holds(sh, 'E5', '=C5-D5') && colConsistent(sh, 'E', SITE_ROWS) && SITE_ROWS.every(r => near(sh.value('E' + r), sh.value('C' + r) - sh.value('D' + r)));
/** B10:E10 are SUMs over the five site rows and each reads its column's sum. */
const totalsLive = sh => ['B', 'C', 'D', 'E'].every(col => {
  if (normFormula(sh.formula(col + TOTAL_ROW)) !== `=SUM(${col}${FIRST_SITE}:${col}${LAST_SITE})`) return false;
  let sum = 0; for (const r of SITE_ROWS) { const v = sh.value(col + r); if (!isNum(v)) return false; sum += v; }
  return near(sh.value(col + TOTAL_ROW), sum);
});
const marginLive = sh => holds(sh, 'F5', '=E5/C5') && colConsistent(sh, 'F', ALL_ROWS) && ALL_ROWS.every(r => near(sh.value('F' + r), sh.value('E' + r) / sh.value('C' + r)));

export default {
  id: 'challenge-site-pl',
  chapter: 'foundations',
  section: 'Formulas',
  module: 'formulas',
  workbook: 'voltline-weekly',
  state: { before: 'S2a' },
  kind: 'challenge',
  title: 'Challenge: the site P&L',
  difficulty: 'hard',
  tags: ['challenge', 'formulas', 'links', 'report'],
  access: 'free',
  minutes: 3,
  conventions: ['B1', 'B2', 'B4', 'E1', 'E5', 'C3'],
  prerequisites: ['read-the-error'],
  brief: 'A sister cluster’s site P&L, profit and loss by site, arrived typed from last week with a hardcoded rate, two errors and no totals: link it to Raw, anchor the rate, one formula per column, total it, add the margin.',
  timeLimit: 170,
  pars: parsFrom(50, { pass: 150, pro: 90 }),
  seed: rng => {
    const cluster = pickCluster(rng);
    const sites = siteNames(cluster, 5);
    const patch = {};
    // the feed, re-clothed: this cluster's five sites in Raw's order, a price per site, every day of both weeks in
    const prices = SITES.map(() => Math.round(42 + rng() * 6) / 100);
    const prior = SITES.map(() => ({ kwh: 0, revenue: 0 }));
    SITES.forEach((site, i) => {
      for (let d = 0; d < 12; d++) {
        const r = rawRow(site, d);
        const k = Math.round((400 + rng() * 2200) / 10) * 10;
        patch[`Raw!B${r}`] = { value: sites[i] };
        patch[`Raw!C${r}`] = { value: k };
        patch[`Raw!D${r}`] = { value: prices[i] };
        patch[`Raw!E${r}`] = { value: r2(k * prices[i]) };
        patch[`Raw!F${r}`] = { value: r2(k * WHOLESALE) };
        if (d < 6) { prior[i].kwh += k; prior[i].revenue = r2(prior[i].revenue + r2(k * prices[i])); }   // last week: what the page was typed from
      }
      patch[`Raw!${RAW_TOTALS.cols.site}${RAW_FIRST + i}`] = { value: sites[i] };
      patch[`Raw!H${RAW_BYDAY.firstRow + i}`] = { value: sites[i] };
      patch[`Inputs!A${9 + i}`] = { value: sites[i] };
      patch[`Costs!A${4 + i}`] = { value: sites[i] };
    });
    // the page as it arrived: the title in the corner, the headers, last week's figures typed, a typed rate, two errors, no totals
    patch['Report!A1'] = { value: `Voltline — ${cluster.city} site P&L, ${cluster.week}` };
    patch['Report!A2'] = { value: 'USD unless stated' };
    HEADERS.forEach((h, i) => { patch[`Report!${String.fromCharCode(65 + i)}${HEADER_ROW}`] = { value: h, bold: true }; });
    sites.forEach((site, i) => {
      const r = FIRST_SITE + i;
      patch[`Report!A${r}`] = { value: site };
      patch[`Report!B${r}`] = { value: prior[i].kwh };
      patch[`Report!C${r}`] = { value: prior[i].revenue };
      patch[`Report!D${r}`] = r === VALUE_ERROR_ROW ? { formula: `=B${r}*Inputs!A${9 + i}` } : { formula: `=B${r}*${WHOLESALE}` };
      patch[`Report!E${r}`] = TYPED_PROFIT.includes(r) ? { value: r2(prior[i].revenue - prior[i].kwh * WHOLESALE) }
        : r === REF_ERROR_ROW ? { formula: `=C${r}-#REF!` } : { formula: `=C${r}-D${r}` };
    });
    patch[`Report!A${TOTAL_ROW}`] = { value: 'Total', bold: true };
    patch['Report!#colW'] = { 1: 110, 2: 92, 3: 100, 4: 112, 5: 116, 6: 84 };
    return patch;
  },
  goals: [
    { id: 'link-kwh', text: 'kWh sold in B5:B9 is typed from last week’s page: select B5:B9, point one link at Raw’s site total I8, then Ctrl+Enter.', convention: 'E1',
      keys: 'Ctrl+↓ ×2 ↓ → Ctrl+Shift+↓ "=" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ ↓ Ctrl+↵',
      check: (s, ses) => { const rep = report(ses); return !!rep && linked(rep, 'B') && settled(ses); } },
    { id: 'link-revenue', text: 'Revenue in C5:C9 the same way, pointing at Raw’s J8, then color both link columns B5:C9 green: a link to another sheet is green.', convention: 'B2',
      keys: '→ Ctrl+Shift+↓ "=" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ → ↓ Ctrl+↵ ← Shift+→ Ctrl+Shift+↓ then Alt H F C → ×8 ↵',
      check: (s, ses) => { const rep = report(ses); return !!rep && linked(rep, 'B') && linked(rep, 'C') && green(rep, span('B', 'C', FIRST_SITE, LAST_SITE)) && settled(ses); } },
    { id: 'rate-anchored', text: 'Energy cost D5:D9 multiplies by a typed 0.13 and D8 shows #VALUE!: enter =B5*Inputs!$B$4, the rate anchored with F4, into all five with Ctrl+Enter.', convention: 'B4',
      keys: '→ ×2 Ctrl+Shift+↓ "=" ← ×2 "*" Ctrl+PgDn ×2 → Ctrl+↓ ↓ F2 F4 Ctrl+↵',
      check: (s, ses) => { const rep = report(ses); return !!rep && rateLinked(rep) && settled(ses); } },
    { id: 'gross-profit', text: 'Gross profit E5:E9 mixes typed numbers, formulas and a #REF! in E7: select E5:E9, point =C5-D5 and commit it into every row with Ctrl+Enter.', convention: 'C3',
      keys: '→ Ctrl+Shift+↓ "=" ← ×2 "-" ← Ctrl+↵',
      check: (s, ses) => { const rep = report(ses); return !!rep && profitLive(rep) && settled(ses); } },
    { id: 'total-row', text: 'The Total row B10:E10 is empty: select B5:E10, the block plus its blank edge, and press Alt+= once for every column’s SUM.', convention: 'E5',
      keys: '← ×3 Ctrl+Shift+↓ Shift+↓ Shift+→ ×3 then Alt+=',
      check: (s, ses) => { const rep = report(ses); return !!rep && totalsLive(rep) && settled(ses); } },
    { id: 'margin', text: 'Margin % in F5:F10 is gross profit over revenue: select F5:F10, point =E5/C5 and commit it into all six rows with Ctrl+Enter.', convention: 'E1',
      keys: 'Ctrl+→ → Shift+↓ ×5 "=" ← "/" ← ×3 Ctrl+↵',
      check: (s, ses) => { const rep = report(ses); return !!rep && marginLive(rep) && settled(ses); } },
  ],
  graders: [
    // Liveness: the engine's rule walks precedents on one sheet, so a pure link (=Raw!I8) is probed at its
    // source — the formula is checked exactly by `linked` and Raw's total must move with the feed; every other
    // figure moves through Inputs!B4 and is probed on the Report itself; B10:C10 sum only links, so `totalsLive` holds them.
    ses => { const rep = report(ses), raw = sheetOf(ses, 'Raw'); if (!rep || !raw) return { ok: false, why: 'No Report sheet.' };
      for (const col of ['B', 'C']) for (let i = 0; i < SITE_ROWS.length; i++) {
        const ref = col + SITE_ROWS[i], src = LINKS[col] + (RAW_FIRST + i);
        if (!rep.cellAt(ref).formula) return { ok: false, why: `${ref} is a typed number where a live link belongs` };
        const r = liveness(raw, src); if (!r.ok) return { ok: false, why: `${ref} reads Raw!${src}, which ${r.why.replace(/^\S+ /, '')}` };
      }
      for (const ref of span('D', 'F', FIRST_SITE, TOTAL_ROW)) { const r = liveness(rep, ref); if (!r.ok) return r; }
      return { ok: true }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      const bad = FIGURES.find(ref => isError(rep.value(ref)));
      return bad ? { ok: false, why: `${bad} still reads ${rep.value(bad)} — an error is a message: follow it to its source and fix that` } : { ok: true }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      for (const col of ['B', 'C']) if (!linked(rep, col)) return { ok: false, why: `${col}5:${col}9 are not links to Raw’s site totals ${LINKS[col]}8:${LINKS[col]}12 — the page reads the feed, never a typed copy of it` };
      return { ok: true }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      for (const ref of span('D', 'F', FIRST_SITE, LAST_SITE)) { const r = noLiteralInFormula(rep, ref); if (!r.ok) return r; }
      return { ok: true }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      for (const [col, rows] of [['D', SITE_ROWS], ['E', SITE_ROWS], ['F', ALL_ROWS]]) if (!colConsistent(rep, col, rows)) return { ok: false, why: `${col}${rows[0]}:${col}${rows[rows.length - 1]} is not one formula filled down — one formula per column, filled down` };
      return { ok: true }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      return totalsLive(rep) ? { ok: true } : { ok: false, why: 'B10:E10 are not SUMs over the five sites — AutoSum the block plus its blank edge, never one column at a time' }; },
    ses => { const rep = report(ses); return rep ? roleColour(rep, `B${FIRST_SITE}:F${TOTAL_ROW}`) : { ok: false, why: 'No Report sheet.' }; },
  ],
  solution: 'Ctrl+Down Ctrl+Down Down Right Ctrl+Shift+Down "=" Ctrl+PgDn Ctrl+Right Right Right Right Ctrl+Down Down Ctrl+Enter Right Ctrl+Shift+Down "=" Ctrl+PgDn Ctrl+Right Right Right Right Ctrl+Down Right Down Ctrl+Enter Left Shift+Right Ctrl+Shift+Down Alt H F C Right Right Right Right Right Right Right Right Enter Right Right Ctrl+Shift+Down "=" Left Left "*" Ctrl+PgDn Ctrl+PgDn Right Ctrl+Down Down F2 F4 Ctrl+Enter Right Ctrl+Shift+Down "=" Left Left "-" Left Ctrl+Enter Left Left Left Ctrl+Shift+Down Shift+Down Shift+Right Shift+Right Shift+Right Alt+= Ctrl+Right Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "=" Left "/" Left Left Left Ctrl+Enter',
};
