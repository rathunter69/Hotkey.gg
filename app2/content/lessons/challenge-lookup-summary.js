// Chapter 4 · 4.1.C Challenge: a broken lookup summary rebuilt (seeded over S41C; S41Cdone is the Austin answer)
// Another cluster's site list lands on Lists, in its own order, and the site block on Summary reads
// it through five broken lookups: a VLOOKUP with no FALSE, a counted column that moved, a lookup keyed
// on the name, an OFFSET, and an IFERROR that hides every miss behind a blank. The seed dresses the
// codes, names, opening dates, capacities, hours and costs and shuffles the list; the work never moves.
// Graded on values against the learner's own Lists, the functions used, liveness, and the canon.
import { workbookState } from '../workbooks/index.js';
import { CLUSTERS } from '../workbooks/clusters.js';
import { clusterSites } from './challenge-flags-block.js';
import { liveness } from '../../app/graders.js';
import { parsFrom } from '../../app/pars.js';
import { dateToSerial } from '../../engine/format.js';
import { summary, settled, same, listValue, fnsOf, stringsOf, reads, SITE_ROWS } from './lib/pack-checks.js';

const F = {
  name: '=INDEX(Lists!$C$5:$C$10,MATCH(B5,Lists!$B$5:$B$10,0))',
  capacity: '=INDEX(Lists!$F$5:$F$10,MATCH(B5,Lists!$B$5:$B$10,0))',
  hours: '=INDEX(Lists!$G$5:$G$10,MATCH(B5,Lists!$B$5:$B$10,0))',
  costs: '=INDEX(Lists!$H$5:$H$10,MATCH(B5,Lists!$B$5:$B$10,0))',
  opened: '=IFERROR(XLOOKUP(B5,Lists!$B$5:$B$10,Lists!$E$5:$E$10),"Not listed")',
};
const q = f => `'${f}'`;
const SEL5 = 'Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down';
const COLS = ['C', 'D', 'E', 'F', 'G'];
/** A lookup the standard accepts: INDEX with MATCH, or XLOOKUP; never a counted column, OFFSET or INDIRECT. */
const standard = (sh, ref) => { const f = fnsOf(sh, ref); return (f.includes('XLOOKUP') || (f.includes('INDEX') && f.includes('MATCH'))) && !f.some(x => ['VLOOKUP', 'HLOOKUP', 'OFFSET', 'INDIRECT'].includes(x)); };
const column = (ses, sh, col, field, extra = () => true) => !!sh && SITE_ROWS.every(r => standard(sh, col + r) && same(sh.value(col + r), listValue(ses, sh.value('B' + r), field)) && extra(r))
  && SITE_ROWS.some(r => liveness(sh, col + r).ok);
const message = (sh, r) => fnsOf(sh, 'G' + r).includes('IFERROR') && stringsOf(sh, 'G' + r).some(s => s.trim() !== '');

/* ---------------- the seed: another cluster's site list over S41C ---------------- */

const BASE = workbookState('clearcoat-pack', 'S41C');
const cellIn = (name, ref) => { const sh = BASE.sheets.find(s => s.name === name); return (sh && sh.cells[ref]) || {}; };
const put = (p, name, ref, rec) => { p[`${name}!${ref}`] = { ...cellIn(name, ref), ...rec }; };
const CAPS = [100, 120, 140], HOURS = [12, 13, 14];
export function seed(rng) {
  const cluster = CLUSTERS[Math.floor(rng() * CLUSTERS.length)];
  const sites = clusterSites(cluster);
  // the list's own order: a shuffle, so a row-counting fix can't pass by luck
  const order = sites.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const p = {};
  order.forEach((k, i) => {
    const r = 5 + i, s = sites[k];
    put(p, 'Lists', 'B' + r, { value: s.code });
    put(p, 'Lists', 'C' + r, { value: s.name });
    put(p, 'Lists', 'D' + r, { value: cluster.city });
    put(p, 'Lists', 'E' + r, { value: dateToSerial(2019 + Math.floor(rng() * 7), 1 + Math.floor(rng() * 12), 1 + Math.floor(rng() * 28)) });
    put(p, 'Lists', 'F' + r, { value: CAPS[Math.floor(rng() * CAPS.length)] });
    put(p, 'Lists', 'G' + r, { value: HOURS[Math.floor(rng() * HOURS.length)] });
    put(p, 'Lists', 'H' + r, { value: 1200 + Math.round(rng() * 12) * 25 });
  });
  sites.forEach((s, i) => { put(p, 'Summary', 'B' + (5 + i), { value: s.code }); put(p, 'Summary', 'B' + (15 + i), { value: s.code }); });
  put(p, 'Summary', 'C34', { value: sites[4].code });
  put(p, 'Summary', 'C41', { value: sites[3].code });
  return p;
}

export default {
  id: 'challenge-lookup-summary',
  chapter: 'data-and-lookups',
  section: 'Lookups',
  module: 'lookups',
  workbook: 'clearcoat-pack',
  state: { before: 'S41C', after: 'S41Cdone' },
  kind: 'challenge',
  title: 'Challenge: a broken lookup summary rebuilt',
  difficulty: 'hard',
  tags: ['challenge', 'formulas', 'lookups'],
  access: 'paid',
  minutes: 3,
  conventions: ['E6', 'B2', 'F5'],
  prerequisites: ['offset-indirect-why-not'],
  brief: 'Another cluster’s site block reads its list through five broken lookups: one without FALSE, one counting a moved column, one keyed on the wrong column, one OFFSET, one that errors silently. Rebuild every line with INDEX/MATCH or XLOOKUP so it ties to Lists.',
  timeLimit: 180,
  pars: parsFrom(80, { pass: 175, pro: 125 }),
  seed,
  goals: [
    { id: 'exact', text: 'Restore exact match on the site names in Summary C5:C10.', keys: `Ctrl+G "Summary!C5:C10" ↵ "${F.name}" Ctrl+↵`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && column(ses, sh, 'C', 'name'); } },
    { id: 'moved-column', text: 'Fix capacity in D5:D10 so no column number is counted.', keys: `→ Shift+↓ ×5 "${F.capacity}" Ctrl+↵`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && column(ses, sh, 'D', 'capacity'); } },
    { id: 'key-column', text: 'Key hours open in E5:E10 on the code in column B, not the name.', keys: `→ Shift+↓ ×5 "${F.hours}" Ctrl+↵`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && column(ses, sh, 'E', 'hours', r => reads(sh, 'E' + r, ['B' + r])); } },
    { id: 'offset', text: 'Rewrite daily site costs in F5:F10 without OFFSET.', keys: `→ Shift+↓ ×5 "${F.costs}" Ctrl+↵`, convention: 'E6',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && column(ses, sh, 'F', 'costs'); } },
    { id: 'message', text: 'Key the opened dates in G5:G10 on the code, and make a miss say Not listed instead of a blank.', keys: `→ Shift+↓ ×5 ${q(F.opened)} Ctrl+↵`, convention: 'F5',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && column(ses, sh, 'G', 'opened', r => message(sh, r)); } },
  ],
  graders: [
    ses => { const sh = summary(ses); if (!sh) return { ok: false, why: 'the Summary sheet is missing' };
      for (const col of COLS) for (const r of SITE_ROWS) { const f = fnsOf(sh, col + r); const bad = f.find(x => x === 'OFFSET' || x === 'INDIRECT'); if (bad) return { ok: false, why: `${col}${r} still reaches across with ${bad}. The standard reads INDEX/MATCH (E6)` }; }
      return { ok: true }; },
    ses => { const sh = summary(ses); if (!sh) return { ok: false, why: 'the Summary sheet is missing' };
      for (const col of COLS) for (const r of SITE_ROWS) if (fnsOf(sh, col + r).includes('VLOOKUP')) return { ok: false, why: `${col}${r} still counts a column with VLOOKUP. Point at the column with INDEX/MATCH or XLOOKUP` };
      return { ok: true }; },
    ses => { const sh = summary(ses); if (!sh) return { ok: false, why: 'the Summary sheet is missing' };
      for (const col of COLS) if (!SITE_ROWS.some(r => liveness(sh, col + r).ok)) return liveness(sh, col + '5');
      return { ok: true }; },
    ses => { const sh = summary(ses); if (!sh) return { ok: false, why: 'the Summary sheet is missing' };
      for (const col of COLS) for (const r of SITE_ROWS) { const c = sh.cellAt(col + r); if (sh.formula(col + r) && c.fontColor !== 'green') return { ok: false, why: `${col}${r} reads Lists and is not green. A link to another sheet is green (B2)` }; }
      return { ok: true }; },
  ],
  solution: `Ctrl+G "Summary!C5:C10" Enter "${F.name}" Ctrl+Enter Right ${SEL5} "${F.capacity}" Ctrl+Enter Right ${SEL5} "${F.hours}" Ctrl+Enter `
    + `Right ${SEL5} "${F.costs}" Ctrl+Enter Right ${SEL5} ${q(F.opened)} Ctrl+Enter`,
};
