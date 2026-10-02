// Chapter 2 · 2.3.C Challenge: a three-year P&L to presentation quality (seeded over S2d)
// A cluster's three-year P&L, already formatted for numbers, with the system's grid over its lines
// and none of the page's anatomy. The challenge gives it the anatomy: the title bold, a size up and
// centered; the section headers and the answer lines bold; the sub-lines indented; the grid off,
// four top borders and a double bottom; the A/E divider and its shade; the revenue labels in
// sentence case and a source line; the margin, the label fit, one width across the years and the
// gridlines off. Seeds pick the cluster and its figures; the workload never moves.
import { YEAR_COLS, TOTAL_ROWS, LABELS, SOURCE_LINE, DIVIDER_FILL, MARGIN_W, challengeSeed } from '../workbooks/clearcoat-pnl.js';
import { TITLE_FSZ, FIGURE_W } from '../workbooks/page.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const COLS = ['B', ...YEAR_COLS];
const HEADS = { 6: 'Revenue', 12: 'Site costs', 26: 'Margins and growth', 32: 'Memo' };

const titled = sh => sh.cellAt('A1').bold && sh.cellAt('A1').fsz === TITLE_FSZ && (sh.cellAt('A1').ca | 0) === 5;
const heads = sh => Object.entries(HEADS).every(([r, t]) => sh.value('B' + r) === t && sh.cellAt('B' + r).bold);
const answers = sh => TOTAL_ROWS.every(r => COLS.every(col => sh.cellAt(col + r).bold));
const indented = sh => [7, 8, 9, 13, 14, 15, 16, 17, 18, 19].every(r => (sh.cellAt('B' + r).indent | 0) === 1);
const noGrid = sh => { for (let r = 7; r <= 24; r++) for (const col of YEAR_COLS) if (sh.cellAt(col + r).ball) return false; return true; };
const tops = sh => TOTAL_ROWS.every(r => COLS.every(col => sh.cellAt(col + r).bt));
const doubled = sh => COLS.every(col => sh.cellAt(col + '24').bdbl);
const divider = sh => { for (let r = 4; r <= 35; r++) if (!sh.cellAt('D' + r).br) return false; return ['E4', 'E5'].every(ref => sh.cellAt(ref).fill === DIVIDER_FILL); };
const labeled = sh => [7, 8, 9, 10].every(r => sh.value('B' + r) === LABELS[r]) && sh.value('B36') === SOURCE_LINE && sh.cellAt('B36').it;
const shaped = sh => sh.colW[1] === MARGIN_W && sh.colSet[2] && sh.colW[2] === sh.neededWidth(2, 4, 35) && [3, 4, 5].every(c => sh.colW[c] === FIGURE_W) && sh.gridlines === false;

const SOURCE_KEYS = `"${SOURCE_LINE}"`;

export default {
  id: 'challenge-pnl-presentation-quality',
  chapter: 'formatting',
  section: 'The page a buyer reads',
  module: 'the-page-a-buyer-reads',
  workbook: 'clearcoat-pnl',
  state: { before: 'S2d' },
  kind: 'challenge',
  title: 'Challenge: a three-year P&L to presentation quality',
  difficulty: 'medium',
  tags: ['challenge', 'presentation', 'pnl'],
  access: 'paid',
  minutes: 3,
  conventions: ['G2', 'D5', 'D6', 'D7', 'B5', 'C2', 'A3'],
  prerequisites: ['cell-styles-format-painter'],
  brief: 'A fresh export, already formatted for numbers. Give it the anatomy: title, units, sections, borders, the divider, labels, source, widths.',
  timeLimit: 180,
  pars: parsFrom(110, { pass: 175, pro: 140 }),
  seed: rng => challengeSeed('challenge-pnl-presentation-quality', rng),
  goals: [
    { id: 'title', text: 'Make the title in A1 bold and one size up, and center it across A1:E1.', convention: 'D7',
      keys: 'Ctrl+B Alt H F G Shift+→ ×4 Ctrl+1 A Alt+H ↓ ×4 ↵',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && titled(sh) && settled(ses); } },
    { id: 'sections', text: 'Type the section headers Revenue in B6, Site costs in B12 and Memo in B32, bold all four headers and the four answer lines.', convention: 'G2',
      keys: 'Ctrl+↓ ×2 → ↓ ×2 "Revenue" Ctrl+↵ Ctrl+B Ctrl+↓ ×2 ↑ "Site costs" Ctrl+↵ Ctrl+B Ctrl+↓ ×4 Ctrl+B Ctrl+↓ ×2 ↑ "Memo" Ctrl+↵ Ctrl+B Ctrl+↑ ×3 Shift+→ ×3 Ctrl+B Ctrl+↑ Shift+→ ×3 F4 Ctrl+↑ Shift+→ ×3 F4 Ctrl+↑ ×2 Shift+→ ×3 F4',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && heads(sh) && answers(sh) && settled(ses); } },
    { id: 'indents', text: 'Indent the sub-lines B7:B9 and B13:B19 one level with Alt, H, 6.', convention: 'D6',
      keys: '↑ Shift+↑ ×2 Alt H 6 Ctrl+↓ ×2 ↓ Shift+↓ ×6 F4',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && indented(sh) && settled(ses); } },
    { id: 'borders', text: 'Take the grid off C7:E24, give the four totals a top border and EBITDA a double bottom.', convention: 'D5',
      keys: 'Ctrl+G "C24" ↵ Ctrl+Shift+→ Ctrl+Shift+↑ ×5 Alt H B N ← Shift+→ ×3 Alt H B P Ctrl+↑ Shift+→ ×3 F4 Ctrl+↑ Shift+→ ×3 F4 Ctrl+↑ ×2 Shift+→ ×3 F4 Ctrl+↓ ×4 Shift+→ ×3 Ctrl+1 B ↓ ↑ ↵',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && noGrid(sh) && tops(sh) && doubled(sh) && settled(ses); } },
    { id: 'divider', text: 'Put the divider down D4:D35 with Alt, H, B, R and shade the estimate header E4:E5 gray.', convention: 'B5',
      keys: 'Ctrl+G "D4:D35" ↵ Alt H B R → Shift+↓ Alt H H → ↵',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && divider(sh) && settled(ses); } },
    { id: 'labels', text: 'Retype the revenue labels B7:B10 in sentence case, and type the source line in B36 in italic.', convention: 'G3',
      keys: `Ctrl+G "B7" ↵ "Retail wash revenue" ↵ "Membership revenue" ↵ "Other revenue" ↵ "Total revenue" ↵ Ctrl+G "B36" ↵ ${SOURCE_KEYS} ↵ ↑ Ctrl+I`,
      check: (s, ses) => { const sh = pnl(ses); return !!sh && labeled(sh) && settled(ses); } },
    { id: 'shape', text: 'Make column A 2 wide, the years C:E 12, AutoFit B over B4:B35, and turn the gridlines off.', convention: 'C2',
      keys: 'Ctrl+Home Alt H O W "2" ↵ → ×2 Ctrl+Space Shift+→ ×2 Alt H O W "12" ↵ Ctrl+G "B4:B35" ↵ Alt H O I Alt W V G',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && shaped(sh) && settled(ses); } },
  ],
  graders: [
    ses => { const sh = pnl(ses); if (!sh) return { ok: false, why: 'the P&L sheet is missing' };
      if (!titled(sh)) return { ok: false, why: 'A1 is not bold, a size up and centered across A1:E1' };
      if (!heads(sh) || !answers(sh)) return { ok: false, why: 'a section header or an answer line is not bold' };
      if (!indented(sh)) return { ok: false, why: 'a sub-line in B7:B19 is not indented' };
      return { ok: true }; },
    ses => { const sh = pnl(ses); if (!sh) return { ok: false, why: 'the P&L sheet is missing' };
      if (!noGrid(sh)) return { ok: false, why: 'the grid is still on C7:E24: a total gets a top border, the block gets none' };
      if (!tops(sh) || !doubled(sh)) return { ok: false, why: 'a total has no top border, or EBITDA has no double bottom' };
      if (!divider(sh)) return { ok: false, why: 'the A/E divider or its shade is missing' };
      return { ok: true }; },
    ses => { const sh = pnl(ses); if (!sh) return { ok: false, why: 'the P&L sheet is missing' };
      if (!labeled(sh)) return { ok: false, why: 'B7:B10 are not in sentence case, or B36 has no source line' };
      if (!shaped(sh)) return { ok: false, why: 'the widths are off, or the gridlines are still on' };
      return { ok: true }; },
  ],
  solution: `Ctrl+B Alt H F G Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+1 A Alt+H Down Down Down Down Enter Ctrl+Down Ctrl+Down Right Down Down "Revenue" Ctrl+Enter Ctrl+B Ctrl+Down Ctrl+Down Up "Site costs" Ctrl+Enter Ctrl+B Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+B Ctrl+Down Ctrl+Down Up "Memo" Ctrl+Enter Ctrl+B Ctrl+Up Ctrl+Up Ctrl+Up Shift+Right Shift+Right Shift+Right Ctrl+B Ctrl+Up Shift+Right Shift+Right Shift+Right F4 Ctrl+Up Shift+Right Shift+Right Shift+Right F4 Ctrl+Up Ctrl+Up Shift+Right Shift+Right Shift+Right F4 Up Shift+Up Shift+Up Alt H 6 Ctrl+Down Ctrl+Down Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down F4 Ctrl+G "C24" Enter Ctrl+Shift+Right Ctrl+Shift+Up Ctrl+Shift+Up Ctrl+Shift+Up Ctrl+Shift+Up Ctrl+Shift+Up Alt H B N Left Shift+Right Shift+Right Shift+Right Alt H B P Ctrl+Up Shift+Right Shift+Right Shift+Right F4 Ctrl+Up Shift+Right Shift+Right Shift+Right F4 Ctrl+Up Ctrl+Up Shift+Right Shift+Right Shift+Right F4 Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Shift+Right Shift+Right Shift+Right Ctrl+1 B Down Up Enter Ctrl+G "D4:D35" Enter Alt H B R Right Shift+Down Alt H H Right Enter Ctrl+G "B7" Enter "Retail wash revenue" Enter "Membership revenue" Enter "Other revenue" Enter "Total revenue" Enter Ctrl+G "B36" Enter ${SOURCE_KEYS} Enter Up Ctrl+I Ctrl+Home Alt H O W "2" Enter Right Right Ctrl+Space Shift+Right Shift+Right Alt H O W "12" Enter Ctrl+G "B4:B35" Enter Alt H O I Alt W V G`,
};
