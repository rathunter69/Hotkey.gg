// Chapter 2 · 2.1.1 — Built-in formats on a P&L (voltline-pnl, S1raw → S1a)
// Management's P&L export arrived as raw General numbers: cents on every line, no thousands
// separators, a site count the accounting system dressed as "$28.00". The built-in formats do
// the first pass from one dialog or one chord: comma style down the whole block in one
// selection, the count freed with General, the per-site figure and the Inputs figures dressed.
// The closer perturbs FY24A's public charging and Total revenue answers in its new dress.
import { PERIOD_COLS, ANNUAL_COLS, LAST_COL } from '../workbooks/voltline-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const inputs = ses => sheetOf(ses, 'Inputs');
const settled = ses => !ses.editing && !ses.dialog;
/** Every cell in `refs` carries the number format `style` with `dec` decimals. */
const fmtIs = (sh, refs, style, dec) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === style && (c.decimals | 0) === dec; });
const rows = (cols, rs) => cols.flatMap(col => rs.map(r => col + r));

const BLOCK = rows(PERIOD_COLS, [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);   // B5:P18, the figure block
const SITES = rows(PERIOD_COLS, [20]);
const PER_SITE = rows(PERIOD_COLS, [21]);
const LEASE = rows(ANNUAL_COLS, [9]);
const SITES_IN = rows(ANNUAL_COLS, [11]);

export default {
  id: 'built-in-formats-on-a-pnl',
  chapter: 'formatting',
  section: 'Number formats',
  module: 'number-formats',
  workbook: 'voltline-pnl',
  state: { before: 'S1raw', after: 'S1a' },
  title: 'Built-in formats on a P&L',
  difficulty: 'medium',
  tags: ['format', 'number-formats', 'pnl'],
  access: 'paid',
  minutes: 5,
  headline: 'Ctrl+1',
  conventions: ['D2'],
  teaches: ['general-format'],
  uses: ['number-formats', 'format-cells-tabs', 'format-cells-dialog', 'ctrl-shift-arrow', 'ctrl-arrow', 'go-to', 'sheet-reference'],
  prerequisites: ['challenge-audit-before-you-send'],
  brief: 'Management’s P&L export arrived as raw General numbers: cents on every line, no thousands separators, and a site count dressed as $28.00. Give the whole block the format a reader can scan in one selection, free the count of its dress, and finish the Inputs page. The key is `Ctrl+1`.',
  goals: [
    { id: 'block-comma', text: 'Select the figure block B5:P18 in one go, from B5 with Ctrl+Shift+→ then Ctrl+Shift+↓, and give it comma style with no decimals.', keys: 'Ctrl+↓ ×2 ↓ → Ctrl+Shift+→ Ctrl+Shift+↓ Ctrl+Shift+1 then Alt H 9 Alt H 9', requires: ['number-formats', 'ctrl-shift-arrow', 'ctrl-arrow'], convention: 'D2',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, BLOCK, 'comma', 0) && settled(ses); } },
    { id: 'sites-general', teach: 'General is the no-format format: Ctrl+Shift+~ (or Ctrl+1, G) returns a cell to how its value was typed, so a count dressed as $28.00 reads as 28 again.', text: 'The site count in B20:P20 arrived dressed as currency: select the row and return it to General with Ctrl+Shift+~.', keys: 'Ctrl+↓ ×2 Ctrl+Shift+→ Ctrl+Shift+~', requires: ['general-format', 'ctrl-shift-arrow', 'ctrl-arrow'],
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, SITES, 'general', 0) && sh.value('B20') === 28 && settled(ses); } },
    { id: 'per-site-currency', text: 'Revenue per site in B21:P21 is a dollar figure: give it currency with Ctrl+Shift+4, then Alt H 9 twice for no decimals.', keys: '↓ Ctrl+Shift+→ Ctrl+Shift+4 then Alt H 9 Alt H 9', requires: ['number-formats', 'ctrl-shift-arrow'], convention: 'D2',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, PER_SITE, 'currency', 0) && settled(ses); } },
    { id: 'lease-currency', text: 'On Inputs, the lease per site B9:D9 is a dollar figure: jump there with Go To and make it currency, no decimals, Ctrl+1 then C.', keys: 'Ctrl+G "Inputs!B9" ↵ Ctrl+Shift+→ Ctrl+1 C', requires: ['go-to', 'sheet-reference', 'format-cells-tabs', 'ctrl-shift-arrow'],
      check: (s, ses) => { const sh = inputs(ses); return !!sh && fmtIs(sh, LEASE, 'currency', 0) && settled(ses); } },
    { id: 'sites-in-comma', text: 'Sites at year end in B11:D11 is a count: give it thousands separators with no decimals, Ctrl+1 then N.', keys: '↓ ×2 Ctrl+Shift+→ Ctrl+1 N', requires: ['format-cells-tabs', 'ctrl-shift-arrow'], convention: 'D2',
      check: (s, ses) => { const sh = inputs(ses); return !!sh && fmtIs(sh, SITES_IN, 'comma', 0) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "'P&L'!B5" Enter "9000000" Enter Ctrl+G "'P&L'!B8" Enter Escape Escape Escape`, cadence: 320 }, text: 'Does it tie? Watch FY24A’s public charging in B5 change to 9,000,000 and Total revenue in B8 answer, thousands separators and all.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'B5:P18 read with thousands separators and no decimals', check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, BLOCK, 'comma', 0); } },
    { text: 'The site count is General, revenue per site is currency with no decimals', check: (s, ses) => { const sh = pnl(ses); return !!sh && fmtIs(sh, SITES, 'general', 0) && fmtIs(sh, PER_SITE, 'currency', 0); } },
    { text: 'On Inputs the lease is currency and the site count comma style, no decimals', check: (s, ses) => { const sh = inputs(ses); return !!sh && fmtIs(sh, LEASE, 'currency', 0) && fmtIs(sh, SITES_IN, 'comma', 0); } },
  ],
  closing: [
    `Every figure on the P&L now reads with one decimals setting down each line (D2): the block took one selection and one chord, the count lost the dress the export gave it, and the per-site figure carries its $. The margins in rows 11 and 18 still read as 0; the next lessons give them their sign and their percent.`,
    `Ctrl+1 did the dialog work and Ctrl+Shift+1 and 4 did the same in one press; FY24A’s public charging still moves Total revenue, all the way to column ${LAST_COL}’s check.`,
  ],
  solution: 'Ctrl+Down Ctrl+Down Down Right Ctrl+Shift+Right Ctrl+Shift+Down Ctrl+Shift+1 Alt H 9 Alt H 9 Ctrl+Down Ctrl+Down Ctrl+Shift+Right Ctrl+Shift+~ Down Ctrl+Shift+Right Ctrl+Shift+4 Alt H 9 Alt H 9 Ctrl+G "Inputs!B9" Enter Ctrl+Shift+Right Ctrl+1 C Down Down Ctrl+Shift+Right Ctrl+1 N',
};
