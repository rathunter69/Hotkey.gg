// Chapter 2 · 2.2.C — Challenge: build the house number-format set (seeded over S1d)
// A cluster's three-year P&L wears the built-in styles: comma on the block, Accounting on the $
// rows, percent on the margins, the count in General and the per-site line in currency. The
// house set replaces every one of them with its own code: the four-section plain code on the
// block, the $ code on the first row and the four totals, the percent code on the margins, $k on
// the per-site line; on Inputs the leverage retyped as numbers wearing 0.0x and the tariff step
// in bps. Seeds dress the city and the figures; the workload never moves. Every grader applies
// the full canon to the block, zero-as-dash included, and names the cell it failed on.
import { ANNUAL_COLS, COST_ROWS, DOLLAR_ROWS, PCT_ROWS, PLAIN_ROWS, HOUSE_FORMATS, clusterPatch } from '../workbooks/voltline-pnl.js';
import { fullCanon } from '../../app/graders.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const inputs = ses => sheetOf(ses, 'Inputs');
const settled = ses => !ses.editing && !ses.dialog;
const rows = (cols, rs) => cols.flatMap(col => rs.map(r => col + r));
/** Every cell in `refs` wears the custom code `code`. */
const codeIs = (sh, refs, code) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === 'custom' && c.numFmt === code; });

const BLOCK = rows(ANNUAL_COLS, [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
const PLAINS = rows(ANNUAL_COLS, PLAIN_ROWS);
const DOLLARS = rows(ANNUAL_COLS, DOLLAR_ROWS);
const PCTS = rows(ANNUAL_COLS, PCT_ROWS);
const PER_SITE = rows(ANNUAL_COLS, [21]);
const LEVERAGE = rows(ANNUAL_COLS, [10]);
const BPS = rows(ANNUAL_COLS, [8]);
const LEVERAGE_NUMBERS = [2.9, 2.4, 1.9];
const BLOCK_RANGE = `B5:${ANNUAL_COLS[ANNUAL_COLS.length - 1]}18`;
const leverageTyped = sh => ANNUAL_COLS.every((col, i) => sh.value(col + '10') === LEVERAGE_NUMBERS[i]);
const anyCode = (sh, refs) => refs.every(ref => sh.cellAt(ref).fmtStyle === 'custom');

export default {
  id: 'challenge-house-format-set',
  chapter: 'formatting',
  section: 'Custom number formats',
  module: 'custom-number-formats',
  workbook: 'voltline-pnl',
  state: { before: 'S1d' },
  kind: 'challenge',
  title: 'Challenge: the house number-format set',
  difficulty: 'medium',
  tags: ['challenge', 'format', 'custom-number-formats', 'pnl'],
  access: 'paid',
  minutes: 3,
  conventions: ['D1', 'D3', 'D9', 'D2'],
  prerequisites: ['conditional-codes-and-hidden-zeros'],
  brief: 'A cluster’s P&L wears the built-in styles and the leverage on Inputs is typed as text with its x: dress the page in the house codes, units in the format and the numbers left as numbers.',
  timeLimit: 170,
  pars: parsFrom(60, { pass: 160, pro: 100 }),
  seed: rng => clusterPatch(rng, { signed: true }),
  goals: [
    { id: 'block-plain', text: 'Select the figure block B5:D18 and give it the house plain code #,##0_);(#,##0);-_) in the Custom box.', convention: 'D3',
      keys: 'Ctrl+↓ ×2 ↓ → Ctrl+Shift+→ Ctrl+Shift+↓ Ctrl+1 U "#,##0_);(#,##0);-_)" ↵',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, BLOCK, HOUSE_FORMATS.plain) && settled(ses); } },
    { id: 'dollar-rows', text: 'The first row and the totals in rows 8 and 10 wear the $ code $#,##0_);($#,##0);-_): type it on B5:D5 and repeat it with F4.', convention: 'D9',
      keys: 'Home → Ctrl+Shift+→ Ctrl+1 U "$#,##0_);($#,##0);-_)" ↵ ↓ ×3 Ctrl+Shift+→ F4 ↓ ×2 Ctrl+Shift+→ F4',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, rows(ANNUAL_COLS, [5, 8, 10]), HOUSE_FORMATS.dollar) && settled(ses); } },
    { id: 'margin-rows', text: 'Gross margin % B11:D11 and EBITDA margin % B18:D18 wear the percent code 0.0%_);(0.0%);-_), typed once and repeated with F4.', convention: 'D3',
      keys: '↓ Ctrl+Shift+→ Ctrl+1 U "0.0%_);(0.0%);-_)" ↵ Ctrl+↓ Ctrl+Shift+→ F4',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, PCTS, HOUSE_FORMATS.pct) && settled(ses); } },
    { id: 'opex-ebitda-dollar', text: 'Total operating costs and EBITDA, B16:D17, are totals: two rows up, select both lines and type the $ code again.', convention: 'D9',
      keys: '↑ ×2 Ctrl+Shift+→ Shift+↓ Ctrl+1 U "$#,##0_);($#,##0);-_)" ↵',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, DOLLARS, HOUSE_FORMATS.dollar) && settled(ses); } },
    { id: 'per-site-k', text: 'Revenue per site B21:D21 reads in thousands: give it $#,##0,k_);($#,##0,k);-_) so the k lives in the format.', convention: 'D9',
      keys: 'Ctrl+↓ ×2 ↓ Ctrl+Shift+→ Ctrl+1 U "$#,##0,k_);($#,##0,k);-_)" ↵',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, PER_SITE, HOUSE_FORMATS.perSite) && settled(ses); } },
    { id: 'leverage-x', text: 'On Inputs the leverage B10:D10 is text, 2.9x: retype it as 2.9, 2.4 and 1.9 with Tab, then give the line the code 0.0x.', convention: 'D9',
      keys: 'Ctrl+G "Inputs!B10" ↵ "2.9" Tab "2.4" Tab "1.9" ↵ ↑ Ctrl+Shift+→ Ctrl+1 U "0.0x" ↵',
      check: (s, ses) => { const sh = inputs(ses); return !!sh && leverageTyped(sh) && codeIs(sh, LEVERAGE, HOUSE_FORMATS.multiple) && settled(ses); } },
    { id: 'bps-code', text: 'The tariff increase B8:D8 is quoted in basis points: two rows up, give it the code 0 bps.', convention: 'D9',
      keys: '↑ ×2 Ctrl+Shift+→ Ctrl+1 U "0 bps" ↵',
      check: (s, ses) => { const sh = inputs(ses); return !!sh && codeIs(sh, BPS, HOUSE_FORMATS.bps) && settled(ses); } },
  ],
  graders: [
    ses => fullCanon(pnl(ses), {
      range: BLOCK_RANGE,
      zeroDash: true,
      rows: ['B8:D8', 'B10:D10', 'B11:D11', 'B16:D16', 'B17:D17', 'B18:D18'],
      costRows: ['B9:D9', 'B12:D15'],
      units: true,
      dollar: { range: BLOCK_RANGE, rows: DOLLAR_ROWS },
      hidden: true,
    }),
    ses => { const sh = pnl(ses); if (!sh) return { ok: false, why: 'the P&L sheet is missing' };
      if (!anyCode(sh, BLOCK)) return { ok: false, why: 'B5 still wears a built-in style — the house set is custom codes' };
      if (!codeIs(sh, PLAINS, HOUSE_FORMATS.plain)) return { ok: false, why: 'B6 is not in the house plain code — #,##0_);(#,##0);-_)' };
      if (!codeIs(sh, PER_SITE, HOUSE_FORMATS.perSite)) return { ok: false, why: 'B21 does not read in $k — the unit lives in the format' };
      return { ok: true }; },
    ses => { const sh = inputs(ses); if (!sh) return { ok: false, why: 'the Inputs sheet is missing' };
      if (!leverageTyped(sh)) return { ok: false, why: 'Inputs B10 is text with an x typed in — a multiple is a number wearing 0.0x' };
      if (!codeIs(sh, LEVERAGE, HOUSE_FORMATS.multiple)) return { ok: false, why: 'Inputs B10 has no x — the unit lives in the format, 0.0x' };
      if (!codeIs(sh, BPS, HOUSE_FORMATS.bps)) return { ok: false, why: 'Inputs B8 does not read in bps — the unit lives in the format' };
      return { ok: true }; },
  ],
  solution: 'Ctrl+Down Ctrl+Down Down Right Ctrl+Shift+Right Ctrl+Shift+Down Ctrl+1 U "#,##0_);(#,##0);-_)" Enter Home Right Ctrl+Shift+Right Ctrl+1 U "$#,##0_);($#,##0);-_)" Enter Down Down Down Ctrl+Shift+Right F4 Down Down Ctrl+Shift+Right F4 Down Ctrl+Shift+Right Ctrl+1 U "0.0%_);(0.0%);-_)" Enter Ctrl+Down Ctrl+Shift+Right F4 Up Up Ctrl+Shift+Right Shift+Down Ctrl+1 U "$#,##0_);($#,##0);-_)" Enter Ctrl+Down Ctrl+Down Down Ctrl+Shift+Right Ctrl+1 U "$#,##0,k_);($#,##0,k);-_)" Enter Ctrl+G "Inputs!B10" Enter "2.9" Tab "2.4" Tab "1.9" Enter Up Ctrl+Shift+Right Ctrl+1 U "0.0x" Enter Up Up Ctrl+Shift+Right Ctrl+1 U "0 bps" Enter',
};
