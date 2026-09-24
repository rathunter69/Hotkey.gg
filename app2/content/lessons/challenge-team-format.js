// Chapter 1 · 1.5.C — Challenge: the team's format in three minutes (seeded over S2a)
// A sister cluster's weekly report arrives the way the feed wrote it: every figure General with
// stray decimals, one site's energy cost above its revenue so a minus sits in the gross profit
// column, an all-borders grid over the block, the typed inputs black and the title in the corner.
// Comma style down the figures so the negative reads in parentheses, percent on the margin, the
// grid off, the total row bold with a top border, the typed inputs blue through Go To Special,
// the title centered across the page without a merge. Seeds dress the city, the site names, the
// figures and which site runs at a loss; the workload never moves: the same keys pass every seed.
import { pickCluster, siteNames } from '../workbooks/clusters.js';
import { WHOLESALE } from '../workbooks/voltline-weekly.js';
import { negativesParen, decimalsConsistent, totalsTopBorder, roleColour } from '../../app/graders.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const settled = ses => !ses.editing && !ses.dialog;
const r1 = v => Math.round(v * 10) / 10;

const HEADERS = ['Site', 'Week', 'kWh sold', 'Revenue ($)', 'Energy cost ($)', 'Gross profit ($)', 'Margin %'];
const HEADER_ROW = 4, FIRST_SITE = 5, LAST_SITE = 9, TOTAL_ROW = 10;   // five sites in rows 5–9, the Total in row 10
const TITLE_SPAN = 7;                                                 // A1:G1 — the page's seven columns
const FIGURE_COLS = ['C', 'D', 'E', 'F'];                             // kWh, Revenue, Energy cost, Gross profit: comma style, no decimals
const INPUT_COLS = ['C', 'D', 'E'];                                   // the typed figures — blue (B1)
const BLOCK_COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

/** A1-style refs for a rectangular block, column letters inclusive. */
const span = (col1, col2, r1_, r2_) => { const out = []; for (let c = col1.charCodeAt(0); c <= col2.charCodeAt(0); c++) for (let r = r1_; r <= r2_; r++) out.push(String.fromCharCode(c) + r); return out; };
const FIGURES = span('C', 'F', FIRST_SITE, TOTAL_ROW);
const MARGINS = span('G', 'G', FIRST_SITE, TOTAL_ROW);
const INPUTS = span('C', 'E', FIRST_SITE, LAST_SITE);
const FORMULAS = [...span('F', 'G', FIRST_SITE, LAST_SITE), ...span('C', 'G', TOTAL_ROW, TOTAL_ROW)];
const TOTAL_CELLS = BLOCK_COLS.map(col => col + TOTAL_ROW);
const GRID = span('A', 'G', HEADER_ROW, TOTAL_ROW);
const BORDER_FIELDS = ['ball', 'bt', 'bb', 'bl', 'br', 'bdbl'];

/** Every cell in `refs` carries the number format `style` with `dec` decimals. */
const fmtIs = (sh, refs, style, dec) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === style && (c.decimals | 0) === dec; });
const figuresComma = sh => fmtIs(sh, FIGURES, 'comma', 0);
const marginsPercent = sh => fmtIs(sh, MARGINS, 'percent', 1);
/** No cell of the block carries any border but the total row's top border. */
const gridGone = sh => GRID.every(ref => { const c = sh.cellAt(ref); return !c.ball && !c.bb && !c.bl && !c.br && !c.bdbl && (!c.bt || ref.endsWith(String(TOTAL_ROW))); });
const noGrid = sh => GRID.every(ref => !sh.cellAt(ref).ball);
const totalRowDone = sh => TOTAL_CELLS.every(ref => { const c = sh.cellAt(ref); return c.bold === true && c.bt === true; }) && !sh.cellAt('A' + (TOTAL_ROW - 1)).bt;
/** The typed figures are blue and only they: the formulas beside them keep automatic (B1). */
const inputsBlue = sh => INPUTS.every(ref => sh.cellAt(ref).fontColor === 'blue') && FORMULAS.every(ref => !sh.cellAt(ref).fontColor || sh.cellAt(ref).fontColor === 'black');
/** The title is centered across A1:G1 by Center Across Selection: A1 carries the span, no cell merged (D7). */
const titleAcross = sh => sh.cellAt('A1').ca === TITLE_SPAN;

export default {
  id: 'challenge-team-format',
  chapter: 'foundations',
  section: 'Format',
  module: 'format',
  workbook: 'voltline-weekly',
  state: { before: 'S2a' },
  kind: 'challenge',
  title: 'Challenge: the team’s format in three minutes',
  difficulty: 'medium',
  tags: ['challenge', 'format', 'report'],
  access: 'free',
  minutes: 3,
  conventions: ['D1', 'D2', 'D5', 'B1', 'D7'],
  prerequisites: ['the-style-pass'],
  brief: 'A sister cluster’s weekly report arrived as a bordered grid of General numbers with a minus in the gross profit: give it the format the team uses, from the figures to the centered title, in three minutes.',
  timeLimit: 170,
  pars: parsFrom(50, { pass: 150, pro: 90 }),
  seed: rng => {
    const cluster = pickCluster(rng);
    const sites = siteNames(cluster, 5);
    const loss = Math.floor(rng() * 5);   // the one site whose energy cost ran above its revenue this week
    const patch = {
      'Report!A1': { value: `Voltline — ${cluster.city} Weekly KPI Report, ${cluster.week}` },
      'Report!A2': { value: 'USD unless stated' },
    };
    HEADERS.forEach((h, i) => { patch[`Report!${BLOCK_COLS[i]}${HEADER_ROW}`] = { value: h, ball: true }; });
    sites.forEach((site, i) => {
      const r = FIRST_SITE + i;
      const kwh = r1(3000 + rng() * 9000);                      // 3,000–12,000 kWh, to a tenth: the feed's stray decimals
      const price = Math.round(42 + rng() * 6) / 100;           // $0.42–0.48 per kWh
      const revenue = r1(kwh * price);
      const energy = i === loss ? r1(revenue * (1.05 + rng() * 0.15)) : r1(kwh * WHOLESALE);   // one site paid more for energy than it sold
      patch[`Report!A${r}`] = { value: site, ball: true };
      patch[`Report!B${r}`] = { value: cluster.week, ball: true };
      patch[`Report!C${r}`] = { value: kwh, ball: true };
      patch[`Report!D${r}`] = { value: revenue, ball: true };
      patch[`Report!E${r}`] = { value: energy, ball: true };
      patch[`Report!F${r}`] = { formula: `=D${r}-E${r}`, ball: true };
      patch[`Report!G${r}`] = { formula: `=F${r}/D${r}`, ball: true };
    });
    patch[`Report!A${TOTAL_ROW}`] = { value: 'Total', ball: true };
    patch[`Report!B${TOTAL_ROW}`] = { ball: true };
    for (const col of FIGURE_COLS) patch[`Report!${col}${TOTAL_ROW}`] = { formula: `=SUM(${col}${FIRST_SITE}:${col}${LAST_SITE})`, ball: true };
    patch[`Report!G${TOTAL_ROW}`] = { formula: `=F${TOTAL_ROW}/D${TOTAL_ROW}`, ball: true };
    return patch;
  },
  goals: [
    { id: 'figures-comma', text: 'The figures C5:F10 are General with stray decimals: give them comma style with no decimals, and the loss in Gross profit reads in parentheses.', convention: 'D1',
      keys: 'Ctrl+↓ ×2 ↓ → ×2 Ctrl+Shift+↓ Shift+→ ×3 Ctrl+Shift+1 then Alt H 9 Alt H 9',
      check: (s, ses) => { const rep = report(ses); return !!rep && figuresComma(rep) && settled(ses); } },
    { id: 'margin-percent', text: 'Margin % in G5:G10 is a fraction: show it as a percentage to one decimal, Total included.', convention: 'D2',
      keys: 'Ctrl+→ Ctrl+Shift+↓ Ctrl+Shift+5 then Alt H 0',
      check: (s, ses) => { const rep = report(ses); return !!rep && marginsPercent(rep) && settled(ses); } },
    { id: 'grid-off', text: 'A grid of borders sits over the whole block A4:G10: remove every border from it, a grid is not structure.', convention: 'D5',
      keys: 'Ctrl+↑ Ctrl+← Ctrl+Shift+End then Alt H B N',
      check: (s, ses) => { const rep = report(ses); return !!rep && gridGone(rep) && !totalRowDone(rep) && settled(ses); } },
    { id: 'total-row', text: 'The Total row A10:G10 is a total: make it bold and give it a single top border.', convention: 'D5',
      keys: 'Ctrl+↓ Shift+Space Ctrl+B then Alt H B P',
      check: (s, ses) => { const rep = report(ses); return !!rep && totalRowDone(rep) && gridGone(rep) && settled(ses); } },
    { id: 'inputs-blue', text: 'Only the typed figures in C5:E9 are inputs: select C5:G10, pick the constants with Go To Special and color them blue.', convention: 'B1',
      keys: 'Ctrl+↑ ↓ → ×2 Ctrl+Shift+End then Alt H F D S O ↵ then Alt H F C → ×4 ↵',
      check: (s, ses) => { const rep = report(ses); return !!rep && inputsBlue(rep) && settled(ses); } },
    { id: 'title-across', text: 'The title in A1 belongs over the page: select A1:G1 and center it across the selection with Ctrl+1 then A, never Merge.', convention: 'D7',
      keys: 'Ctrl+Home ↓ ×3 Ctrl+→ ↑ ×3 Ctrl+Shift+← then Ctrl+1 A',
      check: (s, ses) => { const rep = report(ses); return !!rep && titleAcross(rep) && settled(ses); } },
  ],
  graders: [
    ses => { const rep = report(ses); return rep ? negativesParen(rep, `F${FIRST_SITE}:F${TOTAL_ROW}`) : { ok: false, why: 'No Report sheet.' }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      for (const col of [...FIGURE_COLS, 'G']) { const r = decimalsConsistent(rep, `${col}${FIRST_SITE}:${col}${TOTAL_ROW}`); if (!r.ok) return r; }
      return { ok: true }; },
    ses => { const rep = report(ses); return rep ? totalsTopBorder(rep, TOTAL_CELLS) : { ok: false, why: 'No Report sheet.' }; },
    ses => { const rep = report(ses); return rep ? roleColour(rep, `C${FIRST_SITE}:G${TOTAL_ROW}`) : { ok: false, why: 'No Report sheet.' }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      return titleAcross(rep) ? { ok: true } : { ok: false, why: 'the title is not centered across A1:G1 — Center Across Selection, never a merge' }; },
    ses => { const rep = report(ses); if (!rep) return { ok: false, why: 'No Report sheet.' };
      const left = GRID.find(ref => BORDER_FIELDS.some(f => f !== 'bt' && rep.cellAt(ref)[f]));
      return left ? { ok: false, why: `${left} still carries the grid — a total gets a top border, the block gets none` } : { ok: true }; },
  ],
  solution: 'Ctrl+Down Ctrl+Down Down Right Right Ctrl+Shift+Down Shift+Right Shift+Right Shift+Right Ctrl+Shift+1 Alt H 9 Alt H 9 Ctrl+Right Ctrl+Shift+Down Ctrl+Shift+5 Alt H 0 Ctrl+Up Ctrl+Left Ctrl+Shift+End Alt H B N Ctrl+Down Shift+Space Ctrl+B Alt H B P Ctrl+Up Down Right Right Ctrl+Shift+End Alt H F D S O Enter Alt H F C Right Right Right Right Enter Ctrl+Home Down Down Down Ctrl+Right Up Up Up Ctrl+Shift+Left Ctrl+1 A',
};
