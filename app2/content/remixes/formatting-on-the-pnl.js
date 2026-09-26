// app2/content/remixes/formatting-on-the-pnl.js — Chapter 1's formatting challenge re-clothed on
// the P&L page (LESSON_FRAMEWORK §8, cross-chapter remixes): the same six goals, graders and keys;
// the sheet is a cluster's FY26E site P&L laid on the voltline-pnl workbook's P&L page — annual
// figures at P&L scale, one site running at a loss, the export’s grid over the block. Proves the
// mechanism (content/remix.js); the next remixes are one file each like this one.
import base from '../lessons/challenge-to-standard-in-three-minutes.js';
import { remix } from '../remix.js';
import { pickCluster, siteNames } from '../workbooks/clusters.js';
import { WHOLESALE } from '../workbooks/voltline-weekly.js';

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const HEADERS = ['Site', 'FY', 'kWh sold', 'Revenue ($)', 'Energy cost ($)', 'Gross profit ($)', 'Margin %'];
/** The raw page A1:P23, cleared before the frame is laid: the same key count on every seed (the workload invariant). */
const CLEAR = (() => { const out = []; for (let c = 65; c <= 80; c++) for (let r = 1; r <= 23; r++) out.push(String.fromCharCode(c) + r); return out; })();
const r1 = v => Math.round(v * 10) / 10;

export default remix(base, {
  sheet: 'P&L', as: 'Report',
  lesson: {
    id: 'remix-format-on-the-pnl',
    chapter: 'formatting',
    section: 'Remixes',
    module: 'remixes',
    workbook: 'voltline-pnl',
    state: { before: 'S1raw' },
    title: 'Remix: the team’s format on a site P&L',
    difficulty: 'medium',
    tags: ['challenge', 'remix', 'format', 'pnl'],
    access: 'paid',
    minutes: 3,
    conventions: base.conventions,
    prerequisites: [base.id, 'challenge-format-the-numbers'],
    brief: 'Chapter 1’s format challenge on a P&L: a cluster’s FY26E site P&L arrived as a bordered grid of General numbers with one site at a loss. Give it the team’s format, figures to title, in three minutes.',
  },
  seed: rng => {
    const cluster = pickCluster(rng);
    const sites = siteNames(cluster, 5);
    const loss = Math.floor(rng() * 5);   // the one site whose energy cost ran above its revenue this year
    const patch = { 'P&L!#colW': { 1: 170, 2: 70, 3: 110, 4: 120, 5: 130, 6: 140, 7: 130 } };   // the raw page's one wide column gives way to a readable site table
    for (const ref of CLEAR) patch['P&L!' + ref] = null;
    patch['P&L!A1'] = { value: `Voltline — ${cluster.city} cluster site P&L, FY26E` };
    patch['P&L!A2'] = { value: 'USD unless stated' };
    HEADERS.forEach((h, i) => { patch[`P&L!${COLS[i]}4`] = { value: h, ball: true }; });
    sites.forEach((site, i) => {
      const r = 5 + i;
      const kwh = r1(250000 + rng() * 650000);                  // 250k–900k kWh a year, to a tenth: the export’s stray decimals
      const price = Math.round(42 + rng() * 6) / 100;           // $0.42–0.48 per kWh
      const revenue = r1(kwh * price);
      const energy = i === loss ? r1(revenue * (1.05 + rng() * 0.15)) : r1(kwh * WHOLESALE);
      patch[`P&L!A${r}`] = { value: site, ball: true };
      patch[`P&L!B${r}`] = { value: 'FY26E', ball: true };
      patch[`P&L!C${r}`] = { value: kwh, ball: true };
      patch[`P&L!D${r}`] = { value: revenue, ball: true };
      patch[`P&L!E${r}`] = { value: energy, ball: true };
      patch[`P&L!F${r}`] = { formula: `=D${r}-E${r}`, ball: true };
      patch[`P&L!G${r}`] = { formula: `=F${r}/D${r}`, ball: true };
    });
    patch['P&L!A10'] = { value: 'Total', ball: true };
    patch['P&L!B10'] = { ball: true };
    for (const col of ['C', 'D', 'E', 'F']) patch[`P&L!${col}10`] = { formula: `=SUM(${col}5:${col}9)`, ball: true };
    patch['P&L!G10'] = { formula: '=F10/D10', ball: true };
    return patch;
  },
});
