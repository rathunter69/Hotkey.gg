// Chapter 1 · 1.2.C — Challenge: find and mark (seeded over S2a)
// A seeded feed where Revenue is a formula column carrying stray typed numbers: reach the named
// cells keyboard-only, make the selections, and mark every constant in the block blue via Go To
// Special. Seeds vary the site names, figures and stray positions — never the workload.
import { pickCluster, siteNames } from '../workbooks/clusters.js';
import { SITES, rawRow } from '../workbooks/voltline-weekly.js';
import { roleColour } from '../../app/graders.js';

const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const raw = ses => { const e = ses.sheets.find(x => x.name === 'Raw'); return e ? e.sheet : null; };

export default {
  id: 'challenge-find-and-mark',
  chapter: 'foundations',
  section: 'Move and select',
  module: 'move-and-select',
  workbook: 'voltline-weekly',
  state: { before: 'S2a' },
  kind: 'challenge',
  title: 'Challenge: find and mark',
  difficulty: 'medium',
  tags: ['challenge', 'navigation', 'selection'],
  access: 'free',
  minutes: 3,
  prerequisites: ['typed-vs-calculated'],
  brief: 'A fresh feed, Revenue now computed — with stray typed numbers hiding in it: find them and mark them blue.',
  timeLimit: 160,
  pars: { pass: 90, pro: 55, legendary: 35 },
  seed: rng => {
    const cluster = pickCluster(rng);
    const sites = siteNames(cluster, 5);
    const patch = {};
    SITES.forEach((old, i) => { for (let d = 0; d < 12; d++) patch[`Raw!B${rawRow(old, d)}`] = { value: sites[i] }; });
    // four stray typed numbers in an otherwise formula-built Revenue column (rows 2..60)
    const strays = new Set();
    while (strays.size < 4) strays.add(2 + Math.floor(rng() * 59));
    for (let r = 2; r <= 60; r++) {
      patch[`Raw!E${r}`] = strays.has(r)
        ? { value: Math.round((300 + rng() * 800) * 100) / 100 }
        : { formula: `=C${r}*D${r}` };
    }
    patch['Raw!C33'] = { value: 1240 };   // the text-number would poison =C33*D33; the seed feeds it clean
    return patch;
  },
  goals: [
    { id: 'last-row', text: 'Land on the feed’s last date in one jump from the top of Raw.', keys: 'Ctrl+PgDn then Ctrl+↓',
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'A61') && windowKeys(ses).includes('Ctrl+↓') },
    { id: 'headers', text: 'Back to the top, then along the headers to the last column, F1.', keys: 'Ctrl+Home Ctrl+→',
      check: (s, ses) => at(s, 'F1') && windowKeys(ses).includes('Ctrl+→') },
    { id: 'all-used', text: 'Select everything used on the sheet from A1 in one stroke.', keys: 'Ctrl+Home Ctrl+Shift+End',
      check: (s, ses) => s.selectionText() === 'A1:N67' && windowKeys(ses).includes('Ctrl+Shift+End') },
    { id: 'revenue-block', text: 'Select the Revenue figures E2:E60, edge to edge.', keys: 'Ctrl+Home Ctrl+→ ← ↓ then Ctrl+Shift+↓',
      check: (s, ses) => s.selectionText() === 'E2:E60' && windowKeys(ses).includes('Ctrl+Shift+↓') },
    { id: 'mark-strays', text: 'Go To Special, Constants — then color every typed number in the block blue.', keys: 'Alt H F D S O ↵ then Alt H F C → ×4 ↵',
      check: (s, ses) => { const sh = raw(ses); return !!sh && roleColour(sh, 'E2:E60').ok; } },
  ],
  graders: [
    ses => { const sh = raw(ses); return sh ? roleColour(sh, 'E2:E60') : { ok: false, why: 'No Raw sheet.' }; },
  ],
  solution: 'Ctrl+PgDn Ctrl+Down Ctrl+Home Ctrl+Right Ctrl+Home Ctrl+Shift+End Ctrl+Home Ctrl+Right Left Down Ctrl+Shift+Down Alt H F D S O Enter Alt H F C Right Right Right Right Enter',
};
