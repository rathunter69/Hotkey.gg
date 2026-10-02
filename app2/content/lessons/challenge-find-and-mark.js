// Chapter 1 · 1.2.C — Challenge: find and mark (seeded over S2a)
// A fresh feed from another cluster where Revenue is a formula column carrying stray typed numbers,
// and the feed's layout came through untidy. Every selection does a job (payoff pass, 2026-10-02):
// the figure headers right-aligned, the header row given air, the site column fitted to this
// cluster's names, and every constant in the Revenue block marked blue through Go To Special. Seeds
// vary the site names, figures and stray positions, never the workload. The learner-facing words
// live in content/copy/*.csv.
import { pickCluster, siteNames } from '../workbooks/clusters.js';
import { SITES, rawRow, stateOf } from '../workbooks/clearcoat-weekly.js';
import { roleColour } from '../../app/graders.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const raw = ses => { const e = ses.sheets.find(x => x.name === 'Raw'); return e ? e.sheet : null; };
const S2A_RAW = stateOf('S2a').sheets.find(s => s.name === 'Raw');
const HEADERS = { C1: 'Washes', D1: 'Avg ticket ($)', E1: 'Revenue ($)', F1: 'Wash cost ($)' };
const ROW1 = S2A_RAW.rowH[1];
const headersRight = sh => Object.keys(HEADERS).every(r => sh.cellAt(r).align === 'r');
const siteColFits = sh => !!sh.colSet[2] && sh.colW[2] >= sh.neededWidth(2);

export default {
  id: 'challenge-find-and-mark',
  chapter: 'foundations',
  section: 'Move and select',
  module: 'move-and-select',
  workbook: 'clearcoat-weekly',
  state: { before: 'S2a' },
  kind: 'challenge',
  title: 'Challenge: find and mark',
  difficulty: 'medium',
  tags: ['challenge', 'navigation', 'selection'],
  access: 'free',
  minutes: 3,
  prerequisites: ['typed-vs-calculated'],
  brief: 'A fresh feed from another cluster came through untidy, and Revenue is now a formula with stray typed numbers hiding in it. Select each part of the feed and fix it as you go, then mark every typed number in the Revenue column blue.',
  timeLimit: 160,
  pars: { pass: 90, pro: 55, legendary: 35 },
  seed: rng => {
    const cluster = pickCluster(rng);
    const sites = siteNames(cluster, 5);
    const patch = {};
    SITES.forEach((old, i) => { for (let d = 0; d < 12; d++) patch[`Raw!B${rawRow(old, d)}`] = { value: sites[i] }; });
    // four stray typed revenues in an otherwise formula-built column (rows 2..60)
    const strays = new Set();
    while (strays.size < 4) strays.add(2 + Math.floor(rng() * 59));
    for (let r = 2; r <= 60; r++) {
      patch[`Raw!E${r}`] = strays.has(r)
        ? { value: Math.round(2000 + rng() * 3000) }
        : { formula: `=C${r}*D${r}` };
    }
    patch['Raw!C33'] = { value: 240 };   // the washes typed as text would poison =C33*D33; the seed feeds them clean
    // the export's layout, the same on every seed: headers left over their numbers, row 1 at the
    // default height, the site column too narrow for any cluster's names
    for (const [ref, value] of Object.entries(HEADERS)) patch['Raw!' + ref] = { value, bold: true };
    const rowH = { ...S2A_RAW.rowH }; delete rowH[1];
    patch['Raw!#rowH'] = rowH;
    patch['Raw!#colW'] = { ...S2A_RAW.colW, 2: 40 };
    return patch;
  },
  goals: [
    { id: 'headers', text: 'On Raw, select the figure headers C1:F1 and right-align them over their numbers.', keys: 'Ctrl+PgDn → → Shift+→ ×3 then Alt H A R',
      check: (s, ses) => { const sh = raw(ses); return !!sh && onSheet(ses, 'Raw') && headersRight(sh); } },
    { id: 'header-row', text: 'Select the whole header row and give it some air: row 1 at height 20.', keys: 'Ctrl+Home Shift+Space then Alt H O H "20" ↵',
      check: (s, ses) => { const sh = raw(ses); return !!sh && sh.rowH[1] === ROW1; } },
    { id: 'site-col', text: 'This cluster’s site names are cut off in column B: select the column and AutoFit it.', keys: '→ Ctrl+Space then Alt H O I',
      check: (s, ses) => { const sh = raw(ses); return !!sh && siteColFits(sh); } },
    { id: 'mark-strays', text: 'Select the Revenue figures E2:E60 edge to edge, pick out the constants with Go To Special and color them blue.', keys: 'Ctrl+Home Ctrl+→ ← ↓ Ctrl+Shift+↓ then Alt H F D S O ↵ then Alt H F C → ×4 ↵',
      check: (s, ses) => { const sh = raw(ses); return !!sh && windowKeys(ses).length > 0 && roleColour(sh, 'E2:E60').ok; } },
  ],
  graders: [
    ses => { const sh = raw(ses); return sh ? roleColour(sh, 'E2:E60') : { ok: false, why: 'There is no Raw sheet.' }; },
    ses => { const sh = raw(ses); return sh && headersRight(sh) ? { ok: true } : { ok: false, why: 'The figure headers in C1:F1 sit left over numbers that sit right.' }; },
  ],
  solution: 'Ctrl+PgDn Right Right Shift+Right Shift+Right Shift+Right Alt H A R Ctrl+Home Shift+Space Alt H O H "20" Enter Right Ctrl+Space Alt H O I Ctrl+Home Ctrl+Right Left Down Ctrl+Shift+Down Alt H F D S O Enter Alt H F C Right Right Right Right Enter',
};
