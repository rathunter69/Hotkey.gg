// app2/content/remixes/formatting-on-the-pnl.js: Chapter 1’s formatting challenge re-clothed on
// the P&L page (LESSON_FRAMEWORK §8, cross-chapter remixes): the same six goals, graders and keys;
// the sheet is a Texas cluster’s FY26E site P&L laid on the clearcoat-pnl workbook’s P&L page, in
// thousands, one new site running at a loss in its first year, the export’s grid over the block.
// The raw P&L page is cleared first, so every seed lays the same frame (the workload invariant).
import base from '../lessons/challenge-to-standard-in-three-minutes.js';
import { remix } from '../remix.js';
import { pickTxCluster } from '../workbooks/clearcoat-pnl.js';

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const HEADERS = ['Site', 'FY', 'Washes (000s)', 'Revenue ($000)', 'Site costs ($000)', 'Contribution ($000)', 'Margin %'];
/** The raw page A1:H45, cleared before the frame is laid: the same key count on every seed. */
const CLEAR = (() => { const out = []; for (let c = 65; c <= 72; c++) for (let r = 1; r <= 45; r++) out.push(String.fromCharCode(c) + r); return out; })();
const r1 = v => Math.round(v * 10) / 10;

/** The base challenge's keys on the R1 engine: the desk number format from Format Cells, Center Across from its Alignment tab. */
const KEYS = {
  'figures-comma': 'Ctrl+↓ ×2 ↓ → ×2 Ctrl+Shift+↓ Shift+→ ×3 Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N ↓ ↓ ↵',
  'title-across': 'Ctrl+Home ↓ ×3 Ctrl+→ ↑ ×3 Ctrl+Shift+← Ctrl+1 A Alt+H ↓ ×4 ↵',
};
const SOLUTION = 'Ctrl+Down Ctrl+Down Down Right Right Ctrl+Shift+Down Shift+Right Shift+Right Shift+Right Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N Down Down Enter '
  + 'Ctrl+Right Ctrl+Shift+Down Ctrl+Shift+5 Alt H 0 Ctrl+Up Ctrl+Left Ctrl+Shift+End Alt H B N Ctrl+Down Shift+Space Ctrl+B Alt H B P '
  + 'Ctrl+Up Down Right Right Ctrl+Shift+End Alt H F D S O Enter Alt H F C Right Right Right Right Enter '
  + 'Ctrl+Home Down Down Down Ctrl+Right Up Up Up Ctrl+Shift+Left Ctrl+1 A Alt+H Down Down Down Down Enter';

const lesson = remix(base, {
  sheet: 'P&L', as: 'Report',
  lesson: {
    id: 'remix-format-on-the-pnl',
    chapter: 'formatting',
    section: 'Remixes',
    module: 'remixes',
    workbook: 'clearcoat-pnl',
    state: { before: 'S1raw' },
    title: 'Remix: the team’s format on a site P&L',
    difficulty: 'medium',
    tags: ['challenge', 'remix', 'format', 'pnl'],
    access: 'paid',
    minutes: 3,
    conventions: base.conventions,
    prerequisites: [base.id, 'challenge-format-the-numbers'],
    brief: 'Chapter 1’s format challenge on a P&L: a cluster’s FY26E site P&L arrived as a bordered grid of General numbers, with one new site at a loss. Give it the team’s format, figures to title, in three minutes.',
  },
  seed: rng => {
    const cluster = pickTxCluster(rng);
    const sites = cluster.sites.slice(0, 5);
    const loss = Math.floor(rng() * 5);   // the one new site whose costs ran above its revenue in its first year
    const patch = { 'P&L!#colW': { 1: 170, 2: 70, 3: 120, 4: 130, 5: 140, 6: 160, 7: 100 } };
    for (const ref of CLEAR) patch['P&L!' + ref] = null;
    patch['P&L!A1'] = { value: `Clearcoat Express: ${cluster.city} cluster site P&L, FY26E` };
    patch['P&L!A2'] = { value: 'USD thousands unless stated' };
    HEADERS.forEach((h, i) => { patch[`P&L!${COLS[i]}4`] = { value: h, ball: true }; });
    sites.forEach((site, i) => {
      const r = 5 + i;
      const washes = r1(70 + rng() * 60);                         // 70,000 to 130,000 washes a year, in thousands to a tenth
      const ticket = Math.round(1300 + rng() * 200) / 100;         // $13.00 to $15.00 a wash
      const revenue = r1(washes * ticket);
      const costs = i === loss ? r1(revenue * (1.05 + rng() * 0.15)) : r1(revenue * (0.55 + rng() * 0.15));
      patch[`P&L!A${r}`] = { value: site, ball: true };
      patch[`P&L!B${r}`] = { value: 'FY26E', ball: true };
      patch[`P&L!C${r}`] = { value: washes, ball: true };
      patch[`P&L!D${r}`] = { value: revenue, ball: true };
      patch[`P&L!E${r}`] = { value: costs, ball: true };
      patch[`P&L!F${r}`] = { formula: `=D${r}-E${r}`, ball: true };
      patch[`P&L!G${r}`] = { formula: `=F${r}/D${r}`, ball: true };
    });
    patch['P&L!A10'] = { value: 'Total', ball: true };
    patch['P&L!B10'] = { ball: true };
    for (const col of ['C', 'D', 'E', 'F']) patch[`P&L!${col}10`] = { formula: `=SUM(${col}5:${col}9)`, ball: true };
    patch['P&L!G10'] = { formula: '=F10/D10', ball: true };
    return patch;
  },
  solution: SOLUTION,
});

export default { ...lesson, goals: lesson.goals.map(g => (KEYS[g.id] ? { ...g, keys: KEYS[g.id] } : g)) };
