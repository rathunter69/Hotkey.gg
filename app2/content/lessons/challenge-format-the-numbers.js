// Chapter 2 · 2.1.C Challenge: a raw P&L’s numbers to standard (seeded over S1raw)
// A fresh export with the same faults: a Texas cluster’s own three-year P&L, figures raw with the
// export’s stray decimals, costs typed positive and subtracted, its margins block bare fractions,
// text over the timeline, nothing saying what the figures are in. The desk number format on the
// dollar lines, the costs flipped with one Paste Special multiply and the subtotals made sums,
// the sign line in A2, the margins as percentages in italic, the $ on the first and total rows,
// real dates on the timeline. Seeds pick the cluster and the figures; the workload never moves:
// the same keys pass every seed. Every grader applies the full canon to the block and names the
// cell it failed on.
import { YEAR_COLS, YEAR_ENDS, SPARE_CELL, UNITS_LINE, DOLLAR_ROWS, clusterPatch } from '../workbooks/clearcoat-pnl.js';
import { fullCanon } from '../../app/graders.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog;
const rows = rs => YEAR_COLS.flatMap(col => rs.map(r => col + r));
const norm = f => String(f || '').replace(/\s+/g, '').toUpperCase();

const LINES = rows([7, 8, 9, 10, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24]);
const COSTS = rows([13, 14, 15, 16, 17, 18, 19, 23]);
const DOLLARS = rows(DOLLAR_ROWS);
const PCTS = [...rows([27, 28, 29]), 'D30', 'E30'];
const HEADS = YEAR_COLS.map(col => col + '4');

/** Every cell in `refs` carries the number format `style` with `dec` decimals. */
const fmtIs = (sh, refs, style, dec) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === style && (c.decimals | 0) === dec; });
const allNegative = (sh, refs) => refs.every(ref => { const v = sh.value(ref); return typeof v === 'number' && v < 0; });
const summed = (sh, row, a, b) => YEAR_COLS.every(col => norm(sh.cellAt(col + row).formula) === `=${col}${a}+${col}${b}`);
const spareGone = sh => { const c = sh.cellAt(SPARE_CELL); return c.value == null && !c.formula; };
const signStated = sh => /negative/i.test(String(sh.value('A2') || '')) && /thousands/i.test(String(sh.value('A2') || ''));
const plainLines = sh => fmtIs(sh, LINES.filter(ref => !DOLLARS.includes(ref)), 'comma', 0);
const pctItalic = sh => fmtIs(sh, PCTS, 'percent', 1) && PCTS.every(ref => sh.cellAt(ref).it === true);
const datesIn = sh => HEADS.every((ref, i) => sh.value(ref) === YEAR_ENDS[i] && sh.cellAt(ref).fmtStyle === 'date');

export default {
  id: 'challenge-format-the-numbers',
  chapter: 'formatting',
  section: 'Number formats',
  module: 'number-formats',
  workbook: 'clearcoat-pnl',
  state: { before: 'S1raw' },
  kind: 'challenge',
  title: 'Challenge: a raw P&L’s numbers to standard',
  difficulty: 'medium',
  tags: ['challenge', 'format', 'pnl', 'number-formats'],
  access: 'paid',
  minutes: 3,
  conventions: ['D1', 'D2', 'D4', 'C4', 'C5', 'C2'],
  prerequisites: ['dates-on-the-timeline'],
  brief: 'A fresh export from another cluster has the same faults as the company’s. Bring its formats, signs, margins and dates to standard in three minutes.',
  timeLimit: 180,
  pars: parsFrom(80, { pass: 175, pro: 120 }),
  seed: rng => clusterPatch(rng, { margins: true }),
  goals: [
    { id: 'desk-format', text: 'Give the dollar lines C7:E10, C13:E20 and C22:E24 the desk number format from Ctrl+1, and F4.', convention: 'D2',
      keys: 'Ctrl+↓ ×2 → ×2 Ctrl+Shift+→ Ctrl+Shift+↓ Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N ↓ ↓ ↵ Ctrl+↓ ×2 Ctrl+Shift+→ Ctrl+Shift+↓ F4 Ctrl+↓ ×2 Ctrl+Shift+→ Ctrl+Shift+↓ F4',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, LINES, 'comma', 0) && settled(ses); } },
    { id: 'costs-negative', text: 'Park a -1 in G19, copy it, and Paste Special Multiply the costs C13:E19 and head office C23:E23 by it.', convention: 'C4',
      keys: 'Ctrl+↑ ↑ Ctrl+→ → ×2 "-1" ↵ ↑ Ctrl+C Ctrl+← ← ×2 Ctrl+Shift+↑ Ctrl+Shift+→ Ctrl+Alt+V V M ↵ Ctrl+↓ ×2 ↓ Ctrl+Shift+→ Ctrl+Alt+V V M ↵',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && allNegative(sh, COSTS) && settled(ses); } },
    { id: 'subtotals', text: 'Make site contribution C22 =C10+C20 and EBITDA C24 =C22+C23, each filled right, then clear G19.', convention: 'C4',
      keys: '↑ "=C10+C20" ↵ ↑ Ctrl+Shift+→ Ctrl+R ↓ ×2 "=C22+C23" ↵ ↑ Ctrl+Shift+→ Ctrl+R Ctrl+↑ ×2 ↑ Ctrl+→ → ×2 Delete',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && summed(sh, 22, 10, 20) && summed(sh, 24, 22, 23) && spareGone(sh) && settled(ses); } },
    { id: 'sign-line', text: 'State the convention in A2: USD thousands unless stated; costs shown as negatives.', convention: 'C5',
      keys: `Ctrl+Home ↓ "${UNITS_LINE}" ↵`,
      check: (s, ses) => { const sh = pnl(ses); return !!sh && signStated(sh) && settled(ses); } },
    { id: 'margins', text: 'Show the margins block C27:E30 as percentages to one decimal, in italic.', convention: 'D2',
      keys: 'Ctrl+G "C27" ↵ Shift+→ ×2 Shift+↓ ×3 Ctrl+Shift+5 Alt H 0 Ctrl+I',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && pctItalic(sh) && settled(ses); } },
    { id: 'dollar-rows', text: 'Put the $ on C7:E7, C10:E10 and C24:E24 as currency with no decimals.', convention: 'D4',
      keys: 'Ctrl+G "C7" ↵ Shift+→ ×2 Ctrl+1 N Tab C Alt+D 0 Alt+N ↓ ↓ ↓ ↑ ↵ Ctrl+↓ Shift+→ ×2 F4 Ctrl+↓ ×4 Shift+→ ×2 F4',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, DOLLARS, 'currency', 0) && settled(ses); } },
    { id: 'timeline', text: 'Type 12/31/2024, 12/31/2025 and 12/31/2026 into C4:E4 and show them as dates with Ctrl+1, Date, mmm-yy.', convention: 'C2',
      keys: 'Ctrl+Home Ctrl+↓ ×2 → ×2 "12/31/2024" Tab "12/31/2025" Tab "12/31/2026" ↵ ↑ Shift+→ ×2 Ctrl+1 N Tab D Alt+T ↓ ×7 ↵',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && datesIn(sh) && settled(ses); } },
  ],
  graders: [
    ses => fullCanon(pnl(ses), {
      range: 'C7:E30',
      rows: ['C10:E10', 'C20:E20', 'C22:E22', 'C24:E24', 'C27:E27', 'C28:E28', 'C29:E29', 'D30:E30'],
      costRows: ['C13:E19', 'C23:E23'],
      units: true,
      dollar: { range: 'C7:E24', rows: DOLLAR_ROWS },
      pctLines: ['C27:E29', 'D30:E30'],
      hidden: true,
    }),
    ses => { const sh = pnl(ses); if (!sh) return { ok: false, why: 'the P&L sheet is missing' };
      if (!plainLines(sh)) return { ok: false, why: 'a dollar line between the totals is not in the desk number format' };
      if (!spareGone(sh)) return { ok: false, why: `${SPARE_CELL} still holds the -1: nothing stray sits beside the page` };
      if (!datesIn(sh)) return { ok: false, why: 'C4:E4 are not the three year ends shown as dates' };
      return { ok: true }; },
  ],
  solution: `Ctrl+Down Ctrl+Down Right Right Ctrl+Shift+Right Ctrl+Shift+Down Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N Down Down Enter Ctrl+Down Ctrl+Down Ctrl+Shift+Right Ctrl+Shift+Down F4 Ctrl+Down Ctrl+Down Ctrl+Shift+Right Ctrl+Shift+Down F4 Ctrl+Up Up Ctrl+Right Right Right "-1" Enter Up Ctrl+C Ctrl+Left Left Left Ctrl+Shift+Up Ctrl+Shift+Right Ctrl+Alt+V V M Enter Ctrl+Down Ctrl+Down Down Ctrl+Shift+Right Ctrl+Alt+V V M Enter Up "=C10+C20" Enter Up Ctrl+Shift+Right Ctrl+R Down Down "=C22+C23" Enter Up Ctrl+Shift+Right Ctrl+R Ctrl+Up Ctrl+Up Up Ctrl+Right Right Right Delete Ctrl+Home Down "${UNITS_LINE}" Enter Ctrl+G "C27" Enter Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Ctrl+Shift+5 Alt H 0 Ctrl+I Ctrl+G "C7" Enter Shift+Right Shift+Right Ctrl+1 N Tab C Alt+D 0 Alt+N Down Down Down Up Enter Ctrl+Down Shift+Right Shift+Right F4 Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Shift+Right Shift+Right F4 Ctrl+Home Ctrl+Down Ctrl+Down Right Right "12/31/2024" Tab "12/31/2025" Tab "12/31/2026" Enter Up Shift+Right Shift+Right Ctrl+1 N Tab D Alt+T Down Down Down Down Down Down Down Enter`,
};
