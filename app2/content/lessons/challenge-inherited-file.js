// Chapter 1 · 1.1.C — Challenge: another cluster's file (seeded over S0)
// A sister cluster's workbook arrives in the same untidy shape: rename and reorder the tabs,
// delete the stale one, gridlines off, inputs blue, units line in, hardcode split out. The seed
// dresses the clothing (city, site names, figures); the workload never moves.
import { pickCluster, siteNames } from '../workbooks/clusters.js';
import { SITES, rawRow } from '../workbooks/voltline-weekly.js';
import { roleColour, unitsLabel, noLiteralInFormula } from '../../app/graders.js';

const names = ses => ses.sheets.map(x => x.name);
const workbookIs = (...want) => ses => names(ses).length === want.length && names(ses).every((x, i) => x === want[i]);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const cellIs = (ses, sheet, ref, fn) => { const sh = sheetOf(ses, sheet); return !!sh && fn(sh.cellAt(ref)); };

export default {
  id: 'challenge-inherited-file',
  chapter: 'foundations',
  section: 'Open and set up',
  module: 'open-and-set-up',
  workbook: 'voltline-weekly',
  state: { before: 'S0' },
  kind: 'challenge',
  title: 'Challenge: another cluster’s file',
  difficulty: 'medium',
  tags: ['challenge', 'setup'],
  access: 'free',
  minutes: 3,
  prerequisites: ['colour-label-hardcode'],
  brief: 'A sister cluster’s workbook just arrived in the same state: set it up to house standard.',
  timeLimit: 170,
  pars: { pass: 110, pro: 70, legendary: 45 },
  seed: rng => {
    const cluster = pickCluster(rng);
    const sites = siteNames(cluster, 5);
    const patch = { 'Costs!A1': { value: `Voltline — ${cluster.city} site costs, ${cluster.week}`, bold: true } };
    SITES.forEach((old, i) => {
      for (let d = 0; d < 12; d++) patch[`Raw!B${rawRow(old, d)}`] = { value: sites[i] };
      patch[`Sheet2!A${9 + i}`] = { value: sites[i] };
    });
    patch['Sheet2!B5'] = { value: Math.round(55 + rng() * 20) / 100, fmtStyle: 'percent', decimals: 0 };
    patch['Sheet2!B6'] = { value: (60000 + Math.floor(rng() * 400) * 100), fmtStyle: 'comma', decimals: 0 };
    return patch;
  },
  goals: [
    { id: 'tidy-tabs', text: 'Rename Sheet2 to Inputs, delete Old wk37, and get a Report sheet in front.', keys: 'Ctrl+PgDn Alt H O R "Inputs" ↵ Ctrl+PgDn Alt H D S ↵ Shift+F11 Alt H O R "Report" ↵ Alt H O M ↑ ×2 ↵',
      check: (s, ses) => workbookIs('Report', 'Raw', 'Inputs', 'Costs')(ses) },
    { id: 'gridlines', text: 'Gridlines off on Report — someone reads this page.', keys: 'Alt W V G',
      check: (s, ses) => { const sh = sheetOf(ses, 'Report'); return !!sh && sh.gridlines === false; } },
    { id: 'units', text: 'State the units on Inputs: USD unless stated in A2.', keys: 'Ctrl+PgDn ×2 ↓ "USD unless stated" ↵',
      check: (s, ses) => cellIs(ses, 'Inputs', 'A2', c => c.value === 'USD unless stated') },
    { id: 'inputs-blue', text: 'Color the typed inputs B5 and B6 blue.', keys: '→ ↓ ×2 Shift+↓ Alt H F C → ×4 ↵',
      check: (s, ses) => cellIs(ses, 'Inputs', 'B5', c => c.fontColor === 'blue') && cellIs(ses, 'Inputs', 'B6', c => c.fontColor === 'blue') },
    { id: 'split', text: 'Put the wholesale price in B4 blue, label C4 per utility contract, and point the bill formula B14 at B4.', keys: '↑ "0.13" ↵ ↑ Alt H F C → ×4 ↵ → "per utility contract" ↵ ← Ctrl+↓ Ctrl+↓ F2 ⌫ ×4 "B4" ↵',
      check: (s, ses) => cellIs(ses, 'Inputs', 'B4', c => c.value === 0.13 && c.fontColor === 'blue')
        && cellIs(ses, 'Inputs', 'C4', c => c.value === 'per utility contract')
        && cellIs(ses, 'Inputs', 'B14', c => c.formula === '=B6*B4') },
  ],
  graders: [
    ses => workbookIs('Report', 'Raw', 'Inputs', 'Costs')(ses) ? { ok: true } : { ok: false, why: 'The tabs must read Report, Raw, Inputs, Costs — report first, junk gone.' },
    ses => { const sh = sheetOf(ses, 'Report'); return sh && sh.gridlines === false ? { ok: true } : { ok: false, why: 'Report still shows gridlines — it is a page someone reads.' }; },
    ses => { const sh = sheetOf(ses, 'Inputs'); return sh ? unitsLabel(sh) : { ok: false, why: 'No Inputs sheet yet.' }; },
    ses => { const sh = sheetOf(ses, 'Inputs'); return sh ? roleColour(sh, 'B4:B6') : { ok: false, why: 'No Inputs sheet yet.' }; },
    ses => { const sh = sheetOf(ses, 'Inputs'); return sh ? noLiteralInFormula(sh, 'B14') : { ok: false, why: 'No Inputs sheet yet.' }; },
  ],
  solution: 'Ctrl+PgDn Alt H O R "Inputs" Enter Ctrl+PgDn Alt H D S Enter Shift+F11 Alt H O R "Report" Enter Alt H O M Up Up Enter Alt W V G Ctrl+PgDn Ctrl+PgDn Down "USD unless stated" Enter Right Down Down Shift+Down Alt H F C Right Right Right Right Enter Up "0.13" Enter Up Alt H F C Right Right Right Right Enter Right "per utility contract" Enter Left Ctrl+Down Ctrl+Down F2 Backspace Backspace Backspace Backspace "B4" Enter',
};
