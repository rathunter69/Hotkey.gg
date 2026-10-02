// Chapter 3 · 3.1.C Challenge: the flags block (seeded over S0)
// Another cluster's Sep 15 site block arrives on the module's starting sheet: the seed dresses the
// site codes, the day's washes and revenue on Daily, the targets and capacities on Sites and the
// typed ages on Summary, and puts the cluster's new site (no washes yet, age 0) on a random row.
// The work never moves: the 1/0 flag and its count, the IFS bonus, the AND and OR flags, IFERROR
// on revenue per wash and the ISNUMBER override, six goals graded on values and liveness, with
// graders for the tower (E6) and for an IFERROR where no error is expected.
import { dailyRow } from '../workbooks/clearcoat-databook.js';
import { workbookState } from '../workbooks/index.js';
import { CLUSTERS } from '../workbooks/clusters.js';
import { liveness } from '../../app/graders.js';
import { isLiveFormula } from '../../engine/live.js';
import { tokenize } from '../../engine/formula.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const summary = ses => sheetOf(ses, 'Summary');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const same = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) < 1e-9 : a === b);
const ROWS = [5, 6, 7, 8, 9, 10];
const fns = (sh, ref) => { const f = sh.formula(ref); if (!f) return []; try { return tokenize(String(f).replace(/^\s*=/, '')).filter(t => t.t === 'fn').map(t => String(t.v).toUpperCase()); } catch (e) { return []; } };
const values = (sh, col, want) => ROWS.every(r => same(sh.value(col + r), want(sh, r)));
const liveIn = (sh, col, rows) => rows.every(r => liveness(sh, col + r).ok);
/** A two-test flag can sit where no single input flips it, so one live row is enough. */
const liveAny = (sh, col) => ROWS.some(r => liveness(sh, col + r).ok);
/** The rows where the site washed (the new site's 0/0 row has no single input that moves its ratio). */
const trading = sh => ROWS.filter(r => sh.value('C' + r) > 0);
const below = (sh, r) => sh.value('C' + r) < sh.value('D' + r);
const cap = (ses, r) => { const si = sheetOf(ses, 'Sites'); return si ? si.value('F' + r) : null; };
const ONE = (sh, r) => (below(sh, r) ? 0 : 1);
const BONUS = (sh, r) => { const w = sh.value('C' + r); return w >= 350 ? 150 : w >= 300 ? 100 : w >= 250 ? 50 : 0; };
const onTarget = sh => values(sh, 'F', ONE) && liveIn(sh, 'F', [5, 10]) && same(sh.value('F12'), ROWS.reduce((t, r) => t + ONE(sh, r), 0)) && liveness(sh, 'F12').ok;
const bonus = sh => values(sh, 'I', BONUS) && liveIn(sh, 'I', [5, 10]);
const concern = sh => values(sh, 'N', (s, r) => (below(s, r) && s.value('L' + r) > 2 ? 'Concern' : '-')) && liveAny(sh, 'N');
const visit = (sh, ses) => values(sh, 'O', (s, r) => (below(s, r) || cap(ses, r) < 110 ? 'Visit' : '-')) && liveAny(sh, 'O');
const perWash = sh => values(sh, 'Q', (s, r) => (s.value('C' + r) ? s.value('H' + r) / s.value('C' + r) : 0)) && liveIn(sh, 'Q', trading(sh).slice(0, 2)) && ROWS.every(r => fns(sh, 'Q' + r).includes('IFERROR'));
const USED = (sh, r) => (isNum(sh.value('R' + r)) ? sh.value('R' + r) : sh.value('C' + r));
const override = sh => values(sh, 'S', USED) && [5, 10].every(r => isLiveFormula(sh, 'S' + r, { inputs: ['R' + r] })) && liveIn(sh, 'S', trading(sh).slice(0, 1));

/* ---------------- the seed: another cluster's Sep 15 block over S0 ---------------- */

const BASE = workbookState('clearcoat-databook', 'S0');
const cellIn = (name, ref) => { const sh = BASE.sheets.find(s => s.name === name); return (sh && sh.cells[ref]) || {}; };
const put = (p, name, ref, rec) => { p[`${name}!${ref}`] = { ...cellIn(name, ref), ...rec }; };
/** Six site codes for a cluster: the city's first three letters and each site's, unique; a five-site city adds its airport. */
export function clusterSites(cluster) {
  const names = cluster.sites.slice(0, 6); if (names.length < 6) names.push('Airport');
  const city = cluster.city.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
  const used = new Set();
  return names.map(n => { const letters = n.replace(/[^A-Za-z]/g, '').toUpperCase(); let code = letters.slice(0, 3), k = 3; while (used.has(code) && k < letters.length) code = letters.slice(0, 2) + letters[k++]; used.add(code); return { name: n, code: `${city}-${code}` }; });
}
const TARGETS = [220, 250, 280], CAPS = [100, 120, 140];
export function seed(rng) {
  const cluster = CLUSTERS[Math.floor(rng() * CLUSTERS.length)];
  const sites = clusterSites(cluster);
  const ramp = Math.floor(rng() * 6);   // the cluster's new site: one row, anywhere in the block
  const p = {};
  put(p, 'Summary', 'A1', { value: `Clearcoat Express: ${cluster.city} KPI databook, Sep 15 to Sep 29, 2026` });
  put(p, 'Sites', 'A1', { value: `Clearcoat Express: ${cluster.city} sites, as of Sep 15, 2026` });
  put(p, 'Daily', 'A1', { value: `Clearcoat Express: ${cluster.city} washes by site and day (POS day totals), Sep 15 to Sep 29, 2026` });
  sites.forEach((s, i) => {
    const r = 5 + i, isRamp = i === ramp;
    const target = isRamp ? 200 : TARGETS[Math.floor(rng() * 3)];
    const washes = isRamp ? 0 : Math.round(target * (0.85 + rng() * 0.5) / 5) * 5;
    const revenue = isRamp ? 0 : Math.round(washes * (0.45 + rng() * 0.1) * (13.5 + Math.round(rng() * 6) / 4));
    const age = isRamp ? 0 : Math.round((1 + rng() * 7) * 10) / 10;
    put(p, 'Summary', 'B' + r, { value: s.code });
    put(p, 'Summary', 'L' + r, { value: age });
    put(p, 'Sites', 'B' + r, { value: s.code });
    put(p, 'Sites', 'C' + r, { value: s.name });
    put(p, 'Sites', 'D' + r, { value: cluster.city });
    put(p, 'Sites', 'F' + r, { value: isRamp ? 140 : CAPS[Math.floor(rng() * 3)] });
    put(p, 'Sites', 'H' + r, { value: target });
    for (let d = 0; d < 15; d++) put(p, 'Daily', 'B' + dailyRow(i, d), { value: s.code });
    put(p, 'Daily', 'D' + dailyRow(i, 0), { value: washes });
    put(p, 'Daily', 'E' + dailyRow(i, 0), { value: revenue });
  });
  return p;
}

export default {
  id: 'challenge-flags-block',
  chapter: 'formulas',
  section: 'Logic',
  module: 'logic',
  workbook: 'clearcoat-databook',
  state: { before: 'S0' },
  kind: 'challenge',
  title: 'Challenge: the flags block',
  difficulty: 'hard',
  tags: ['challenge', 'formulas', 'logic', 'flags'],
  access: 'paid',
  minutes: 3,
  conventions: ['E6', 'B1'],
  prerequisites: ['iferror-and-the-override'],
  brief: 'Another cluster’s site block for Sep 15: flag it, count it, put the bonus in IFS, add the two compound flags, catch the new site’s error and wire in the override column.',
  timeLimit: 180,
  pars: parsFrom(85, { pass: 175, pro: 125 }),
  seed,
  goals: [
    { id: 'on-target', text: 'Flag each site on target as 1 or 0 in F5:F10 and count the sites on target in F12.',
      keys: '↓ ×3 Ctrl+→ ↓ Ctrl+→ → ×2 Shift+↓ ×5 "=IF(C5>=D5,1,0)" Ctrl+↵ Ctrl+↓ ↓ ↓ "=SUM(F5:F10)" ↵',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && onTarget(sh); } },
    { id: 'bonus', text: 'Put the manager bonus in I5:I10 with IFS on the tiers in J5:K8: $50 at 250 washes, $100 at 300 and $150 at 350.', convention: 'E6',
      keys: '↑ Ctrl+↑ ×2 Ctrl+→ → ↓ Shift+↓ ×5 "=IFS(C5>=350,150,C5>=300,100,C5>=250,50,TRUE,0)" Ctrl+↵',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && bonus(sh); } },
    { id: 'concern', text: 'Flag Concern in N5:N10 where a site is below target and over two years old, and a dash where it is not.', convention: 'E6',
      keys: `Ctrl+→ → ×2 Shift+↓ ×5 '=IF(AND(C5<D5,L5>2),"Concern","-")' Ctrl+↵`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && concern(sh); } },
    { id: 'visit', text: 'Flag Visit in O5:O10 where a site is below target or under 110 cars an hour on Sites, and a dash where it is not.', convention: 'E6',
      keys: `→ Shift+↓ ×5 '=IF(OR(C5<D5,Sites!F5<110),"Visit","-")' Ctrl+↵`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && visit(sh, ses); } },
    { id: 'per-wash', text: 'Catch the new site’s #DIV/0! in revenue per wash, Q5:Q10, with IFERROR and a 0 fallback.',
      keys: '→ ×2 Ctrl+Shift+↓ "=IFERROR(H5/C5,0)" Ctrl+↵',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && perWash(sh); } },
    { id: 'override', text: 'Wire the override: S5:S10 reads R5:R10 when a number is typed there and the washes in C5:C10 when not.', convention: 'B1',
      keys: '→ ×2 Shift+↓ ×5 "=IF(ISNUMBER(R5),R5,C5)" Ctrl+↵',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && override(sh); } },
  ],
  graders: [
    ses => { const sh = summary(ses); if (!sh) return { ok: false, why: 'the Summary sheet is missing' };
      for (const col of ['F', 'I', 'N', 'O', 'S']) { if (!ROWS.some(x => liveness(sh, col + x).ok)) return liveness(sh, col + '5'); }
      return { ok: true }; },
    ses => { const sh = summary(ses); if (!sh) return { ok: false, why: 'the Summary sheet is missing' };
      const r = ROWS.find(x => fns(sh, 'I' + x).includes('IF'));
      return r ? { ok: false, why: `I${r} builds the bonus as an IF tower. IFS reads top to bottom` } : { ok: true }; },
    ses => { const sh = summary(ses); if (!sh) return { ok: false, why: 'the Summary sheet is missing' };
      for (const col of ['F', 'I', 'N', 'O', 'S']) { const r = ROWS.find(x => fns(sh, col + x).includes('IFERROR')); if (r) return { ok: false, why: `${col}${r} wraps IFERROR round a flag that cannot error. IFERROR goes only where an error is expected` }; }
      return { ok: true }; },
  ],
  solution: `Down Down Down Ctrl+Right Down Ctrl+Right Right Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "=IF(C5>=D5,1,0)" Ctrl+Enter Ctrl+Down Down Down "=SUM(F5:F10)" Enter Up Ctrl+Up Ctrl+Up Ctrl+Right Right Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "=IFS(C5>=350,150,C5>=300,100,C5>=250,50,TRUE,0)" Ctrl+Enter Ctrl+Right Right Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down '=IF(AND(C5<D5,L5>2),"Concern","-")' Ctrl+Enter Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down '=IF(OR(C5<D5,Sites!F5<110),"Visit","-")' Ctrl+Enter Right Right Ctrl+Shift+Down "=IFERROR(H5/C5,0)" Ctrl+Enter Right Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "=IF(ISNUMBER(R5),R5,C5)" Ctrl+Enter`,
};
