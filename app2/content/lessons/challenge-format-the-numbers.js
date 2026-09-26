// Chapter 2 · 2.1.C — Challenge: format a raw P&L's numbers to standard (seeded over S1raw)
// A cluster's three-year P&L arrives the way the export wrote it: every figure General with the
// export’s stray cents, the costs typed positive and subtracted, the site count dressed as
// "$28.00", the units line saying nothing about signs. Comma style on the block, the costs
// flipped negative with one Paste Special multiply and the two subtotals rewritten as sums, the
// $ rows in Accounting format, the margins as percentages, the counts back to General and the
// per-site line in currency, the convention stated once in A2. Seeds dress the city and the
// figures; the workload never moves: the same keys pass every seed. From here every grader
// applies the full canon to the graded block and names the cell it failed on.
import { ANNUAL_COLS, COST_ROWS, DOLLAR_ROWS, PCT_ROWS, HELPER_CELL, UNITS_LINE, clusterPatch } from '../workbooks/voltline-pnl.js';
import { fullCanon } from '../../app/graders.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog;
const rows = (cols, rs) => cols.flatMap(col => rs.map(r => col + r));
const norm = f => String(f || '').replace(/\s+/g, '').toUpperCase();

const BLOCK = rows(ANNUAL_COLS, [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
const COSTS = rows(ANNUAL_COLS, COST_ROWS);
const DOLLARS = rows(ANNUAL_COLS, DOLLAR_ROWS);
const PCTS = rows(ANNUAL_COLS, PCT_ROWS);
const SITES = rows(ANNUAL_COLS, [20]);
const PER_SITE = rows(ANNUAL_COLS, [21]);
const BLOCK_RANGE = `B5:${ANNUAL_COLS[ANNUAL_COLS.length - 1]}18`;

/** Every cell in `refs` carries the number format `style` with `dec` decimals. */
const fmtIs = (sh, refs, style, dec) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === style && (c.decimals | 0) === dec; });
const allNegative = (sh, refs) => refs.every(ref => { const v = sh.value(ref); return typeof v === 'number' && v <= 0; });
const summed = (sh, row, a, b) => ANNUAL_COLS.every(col => norm(sh.cellAt(col + row).formula) === `=${col}${a}+${col}${b}`);
const helperGone = sh => { const c = sh.cellAt(HELPER_CELL); return c.value == null && !c.formula; };
const signStated = sh => /negative/i.test(String(sh.value('A2') || ''));

export default {
  id: 'challenge-format-the-numbers',
  chapter: 'formatting',
  section: 'Number formats',
  module: 'number-formats',
  workbook: 'voltline-pnl',
  state: { before: 'S1raw' },
  kind: 'challenge',
  title: 'Challenge: a raw P&L to standard in three minutes',
  difficulty: 'medium',
  tags: ['challenge', 'format', 'pnl', 'number-formats'],
  access: 'paid',
  minutes: 3,
  conventions: ['D1', 'D2', 'D4', 'C4', 'C5'],
  prerequisites: ['dates-on-the-timeline'],
  brief: 'A cluster’s three-year P&L arrived as General numbers with the costs typed positive and the site count dressed as dollars: bring every number to the house standard, signs included, in three minutes.',
  timeLimit: 180,
  pars: parsFrom(70, { pass: 170, pro: 110 }),
  seed: rng => clusterPatch(rng, { rawSites: true }),
  goals: [
    { id: 'block-comma', text: 'The figure block B5:D18 is General with the export’s stray cents: give it comma style with no decimals.', convention: 'D2',
      keys: 'Ctrl+↓ ×2 ↓ → Ctrl+Shift+→ Ctrl+Shift+↓ Ctrl+Shift+1 then Alt H 9 Alt H 9',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, BLOCK, 'comma', 0) && settled(ses); } },
    { id: 'costs-negative', text: 'Energy cost B9:D9 and the four operating cost lines B12:D15 are typed positive: park a -1 in B30 and multiply them by it with Paste Special.', convention: 'C4',
      keys: 'Ctrl+G "B30" ↵ "-1" ↵ ↑ Ctrl+C Ctrl+G "B9" ↵ Ctrl+Shift+→ Ctrl+Alt+V V M ↵ ↓ ×3 Ctrl+Shift+→ Shift+↓ ×3 Ctrl+Alt+V V M ↵',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && allNegative(sh, COSTS) && settled(ses); } },
    { id: 'subtotals-as-sums', text: 'Gross profit B10:D10 and EBITDA B17:D17 still subtract: rewrite each as a sum, =B8+B9 and =B10+B16, filled right with Ctrl+R.', convention: 'C4',
      keys: '↑ ×2 "=B8+B9" ↵ ↑ Ctrl+Shift+→ Ctrl+R Ctrl+↓ ↑ "=B10+B16" ↵ ↑ Ctrl+Shift+→ Ctrl+R',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && summed(sh, 10, 8, 9) && summed(sh, 17, 10, 16) && settled(ses); } },
    { id: 'dollar-rows', text: 'Rows 5, 8, 10, 16 and 17 carry the $: give each line Accounting Number Format with Alt H A N.', convention: 'D4',
      keys: '↑ Ctrl+Shift+→ Shift+↓ Alt H A N Ctrl+↑ ↓ Ctrl+Shift+→ Alt H A N ↓ ×3 Ctrl+Shift+→ Alt H A N ↓ ×2 Ctrl+Shift+→ Alt H A N',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, DOLLARS, 'acct', 0) && settled(ses); } },
    { id: 'margin-rows', text: 'Gross margin % B11:D11 and EBITDA margin % B18:D18 are fractions: show each as a percentage to one decimal.', convention: 'D2',
      keys: '↓ Ctrl+Shift+→ Ctrl+Shift+5 Alt H 0 Ctrl+↓ Ctrl+Shift+→ Ctrl+Shift+5 Alt H 0',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, PCTS, 'percent', 1) && settled(ses); } },
    { id: 'sites-and-per-site', text: 'The site count B20:D20 arrived dressed as dollars: return it to General, then give Revenue per site B21:D21 currency with no decimals.', convention: 'D2',
      keys: 'Ctrl+↓ Ctrl+Shift+→ Ctrl+Shift+~ ↓ Ctrl+Shift+→ Ctrl+Shift+4 Alt H 9 Alt H 9',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, SITES, 'general', 0) && fmtIs(sh, PER_SITE, 'currency', 0) && settled(ses); } },
    { id: 'state-and-clear', text: 'State the convention in A2, USD unless stated; costs shown as negatives, and clear the -1 out of B30.', convention: 'C5',
      keys: 'Ctrl+Home ↓ "USD unless stated; costs shown as negatives" ↵ Ctrl+G "B30" ↵ Delete',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && signStated(sh) && helperGone(sh) && settled(ses); } },
  ],
  graders: [
    ses => fullCanon(pnl(ses), {
      range: BLOCK_RANGE,
      rows: ['B8:D8', 'B10:D10', 'B11:D11', 'B16:D16', 'B17:D17', 'B18:D18'],
      costRows: ['B9:D9', 'B12:D15'],
      units: true,
      dollar: { range: BLOCK_RANGE, rows: DOLLAR_ROWS },
      hidden: true,
    }),
    ses => { const sh = pnl(ses); if (!sh) return { ok: false, why: 'the P&L sheet is missing' };
      if (!fmtIs(sh, SITES, 'general', 0)) return { ok: false, why: 'B20 is a count dressed as money — a count is General' };
      if (!fmtIs(sh, PER_SITE, 'currency', 0)) return { ok: false, why: 'B21 is a dollar figure without its $ — currency, no decimals' };
      if (!helperGone(sh)) return { ok: false, why: `${HELPER_CELL} still holds the -1 — nothing stray sits below the page` };
      return { ok: true }; },
  ],
  solution: `Ctrl+Down Ctrl+Down Down Right Ctrl+Shift+Right Ctrl+Shift+Down Ctrl+Shift+1 Alt H 9 Alt H 9 Ctrl+G "B30" Enter "-1" Enter Up Ctrl+C Ctrl+G "B9" Enter Ctrl+Shift+Right Ctrl+Alt+V V M Enter Down Down Down Ctrl+Shift+Right Shift+Down Shift+Down Shift+Down Ctrl+Alt+V V M Enter Up Up "=B8+B9" Enter Up Ctrl+Shift+Right Ctrl+R Ctrl+Down Up "=B10+B16" Enter Up Ctrl+Shift+Right Ctrl+R Up Ctrl+Shift+Right Shift+Down Alt H A N Ctrl+Up Down Ctrl+Shift+Right Alt H A N Down Down Down Ctrl+Shift+Right Alt H A N Down Down Ctrl+Shift+Right Alt H A N Down Ctrl+Shift+Right Ctrl+Shift+5 Alt H 0 Ctrl+Down Ctrl+Shift+Right Ctrl+Shift+5 Alt H 0 Ctrl+Down Ctrl+Shift+Right Ctrl+Shift+~ Down Ctrl+Shift+Right Ctrl+Shift+4 Alt H 9 Alt H 9 Ctrl+Home Down "${UNITS_LINE}" Enter Ctrl+G "B30" Enter Delete`,
};
