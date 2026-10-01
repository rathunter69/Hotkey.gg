// Chapter 1 · 1.1.C — Challenge: another location's file (seeded over S0)
// Another cluster's workbook arrives in the same untidy shape: rename and reorder the tabs, delete
// the stale one, gridlines off, the formulas read with F2, every cell on Inputs colored by what it
// holds. The seed dresses the clothing (city, site names, the figures on Inputs); the workload
// never moves. The learner-facing words live in content/copy/*.csv.
import { pickCluster, siteNames } from '../workbooks/clusters.js';
import { SITES, rawRow, INPUT_ROWS } from '../workbooks/clearcoat-weekly.js';
import { roleColour } from '../../app/graders.js';

const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const names = ses => ses.sheets.map(x => x.name);
const workbookIs = (...want) => ses => names(ses).length === want.length && names(ses).every((x, i) => x === want[i]);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const cellIs = (ses, sheet, ref, fn) => { const sh = sheetOf(ses, sheet); return !!sh && fn(sh.cellAt(ref)); };
const notBlue = c => c.fontColor !== 'blue';

export default {
  id: 'challenge-inherited-file',
  chapter: 'foundations',
  section: 'Open and set up',
  module: 'open-and-set-up',
  workbook: 'clearcoat-weekly',
  state: { before: 'S0' },
  kind: 'challenge',
  title: 'Challenge: another location’s file',
  difficulty: 'medium',
  tags: ['challenge', 'setup'],
  access: 'free',
  minutes: 3,
  prerequisites: ['colour-label-hardcode'],
  brief: 'The San Antonio cluster’s workbook has landed in the same state as Austin’s, so set it up the same way, this time on the clock.',
  timeLimit: 170,
  pars: { pass: 110, pro: 70, legendary: 45 },
  seed: rng => {
    const cluster = pickCluster(rng);
    const sites = siteNames(cluster, 5);
    const patch = { 'Costs!A1': { value: `Clearcoat Express: ${cluster.city} site costs, week of Sep 8, 2026`, bold: true } };
    SITES.forEach((old, i) => {
      for (let d = 0; d < 12; d++) patch[`Raw!B${rawRow(old, d)}`] = { value: sites[i] };
      patch[`Sheet2!A${INPUT_ROWS.sites[i]}`] = { value: sites[i] };
      patch[`Costs!A${4 + i}`] = { value: sites[i] };
    });
    patch[`Sheet2!B${INPUT_ROWS.ticket}`] = { value: 13.5 + Math.round(rng() * 4) / 4 };
    patch[`Sheet2!B${INPUT_ROWS.washes}`] = { value: 8000 + Math.floor(rng() * 40) * 50 };
    return patch;
  },
  goals: [
    { id: 'tidy-tabs', text: 'Rename Sheet2 to Inputs, delete Old wk37, and get a Report sheet in front.', keys: 'Ctrl+PgDn Alt H O R "Inputs" ↵ Ctrl+PgDn Alt H D S ↵ Shift+F11 Alt H O R "Report" ↵ Alt H O M ↑ ×2 ↵',
      check: (s, ses) => workbookIs('Report', 'Raw', 'Inputs', 'Costs')(ses) },
    { id: 'gridlines', text: 'Turn gridlines off on Report, because someone reads this page.', keys: 'Alt W V G',
      check: (s, ses) => { const sh = sheetOf(ses, 'Report'); return !!sh && sh.gridlines === false; } },
    { id: 'formulas-black', text: 'Leave the formulas on Inputs black.', keys: 'Ctrl+PgDn ×2 Ctrl+↓ ↓ → Ctrl+↓ ↑ ×3',
      check: (s, ses) => onSheet(ses, 'Inputs') && ['B10', 'B11', 'B14'].every(r => cellIs(ses, 'Inputs', r, notBlue)) },
    { id: 'f2-look', text: 'Read B10 with F2 and leave it as it was.', keys: '↑ ↑ F2 Esc',
      check: (s, ses) => onSheet(ses, 'Inputs') && ses.mode === 'normal' && at(s, 'B10') && windowKeys(ses).includes('F2') && cellIs(ses, 'Inputs', 'B10', c => c.formula === '=B5*B6') },
    { id: 'colors', text: 'Color every typed figure on Inputs blue, the link green, and put the wrongly colored formula back to Automatic.', keys: 'Ctrl+↑ ↓ Shift+↓ ×5 Alt H F C → ×4 ↵ Ctrl+↓ ↑ ↑ Shift+↑ Alt H F C → ×8 ↵ Ctrl+↓ Ctrl+1 F Alt+C ← ×5 ↵',
      check: (s, ses) => { const sh = sheetOf(ses, 'Inputs'); return !!sh && roleColour(sh, 'B4:B15').ok && ['B12', 'B13'].every(r => sh.cellAt(r).fontColor === 'green'); } },
  ],
  graders: [
    ses => workbookIs('Report', 'Raw', 'Inputs', 'Costs')(ses) ? { ok: true } : { ok: false, why: 'The tabs read Report, Raw, Inputs, Costs when the file is set up: the page first, the stale export gone.' },
    ses => { const sh = sheetOf(ses, 'Report'); return sh && sh.gridlines === false ? { ok: true } : { ok: false, why: 'Report still shows gridlines. It is a page someone reads, so they go off.' }; },
    ses => { const sh = sheetOf(ses, 'Inputs'); return sh ? roleColour(sh, 'B4:B15') : { ok: false, why: 'There is no Inputs sheet yet.' }; },
    ses => { const sh = sheetOf(ses, 'Inputs'); if (!sh) return { ok: false, why: 'There is no Inputs sheet yet.' }; const r = ['B12', 'B13'].find(ref => sh.cellAt(ref).fontColor !== 'green'); return r ? { ok: false, why: `${r} reads another sheet and is shown ${sh.cellAt(r).fontColor || 'black'}. A link to another sheet is green.` } : { ok: true }; },
  ],
  solution: 'Ctrl+PgDn Alt H O R "Inputs" Enter Ctrl+PgDn Alt H D S Enter Shift+F11 Alt H O R "Report" Enter Alt H O M Up Up Enter Alt W V G Ctrl+PgDn Ctrl+PgDn Ctrl+Down Down Right Ctrl+Down Up Up Up Up Up F2 Escape Ctrl+Up Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Alt H F C Right Right Right Right Enter Ctrl+Down Up Up Shift+Up Alt H F C Right Right Right Right Right Right Right Right Enter Ctrl+Down Ctrl+1 F Alt+C Left Left Left Left Left Enter',
};
