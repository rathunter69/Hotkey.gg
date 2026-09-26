// Chapter 2 · 2.2.2 — Units in the format (voltline-pnl, S2a → S2b)
// Bankers never type a unit beside a number: the format carries it (D9). A comma after the last
// digit placeholder divides by a thousand, and a unit rides along in quotes, so revenue per site
// reads $383k, leverage reads 2.9x, a tariff step reads 150 bps and kWh reads 936k, while the
// number underneath stays a number a formula can use. The associate had typed the leverage as
// text with its x; that gets retyped as numbers and dressed. The closer changes it to 3.5x.
import { PERIOD_COLS, ANNUAL_COLS, MONTHLY_COLS, HOUSE_FORMATS } from '../workbooks/voltline-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const inputs = ses => sheetOf(ses, 'Inputs');
const monthly = ses => sheetOf(ses, 'Monthly');
const settled = ses => !ses.editing && !ses.dialog;
const rows = (cols, rs) => cols.flatMap(col => rs.map(r => col + r));
const codeIs = (sh, refs, code) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === 'custom' && c.numFmt === code; });

const PER_SITE = rows(PERIOD_COLS, [21]);
const LEVERAGE = rows(ANNUAL_COLS, [10]);
const BPS = rows(ANNUAL_COLS, [8]);
const KWH = rows(MONTHLY_COLS, [6]);
const PER_SESSION = rows(MONTHLY_COLS, [8]);
const LEVERAGE_NUMBERS = [2.9, 2.4, 1.9];
const leverageTyped = sh => ANNUAL_COLS.every((col, i) => sh.value(col + '10') === LEVERAGE_NUMBERS[i]);

export default {
  id: 'units-in-the-format',
  chapter: 'formatting',
  section: 'Custom number formats',
  module: 'custom-number-formats',
  workbook: 'voltline-pnl',
  state: { before: 'S2a', after: 'S2b' },
  title: 'Units in the format',
  difficulty: 'medium',
  tags: ['format', 'custom-number-formats', 'units', 'inputs'],
  access: 'paid',
  minutes: 6,
  headline: 'Ctrl+1',
  conventions: ['D9', 'D2', 'C5'],
  teaches: ['format-units'],
  uses: ['custom-number-format', 'go-to', 'sheet-reference', 'tab-commits', 'ctrl-shift-arrow', 'ctrl-arrow'],
  prerequisites: ['the-four-section-format'],
  brief: 'A unit typed beside a number turns it into text: the leverage on Inputs reads 2.9x and no formula can use it. The format carries the unit instead, so per-site revenue reads in $k, a multiple reads with its x and a tariff step in bps, while the number underneath stays a number. The door is `Ctrl+1`.',
  goals: [
    { id: 'per-site-k', teach: 'A comma after the last digit placeholder divides by a thousand, and a unit rides along in quotes: the Custom box turns $#,##0,k into $#,##0,"k" for you.', text: 'Revenue per site B21:P21 reads better in thousands: select the line and give it $#,##0,k_);($#,##0,k);-_) in the Custom box.', keys: 'Ctrl+↓ ×2 ↓ → Ctrl+↓ ×2 ↓ Ctrl+Shift+→ Ctrl+1 U "$#,##0,k_);($#,##0,k);-_)" ↵', requires: ['format-units', 'custom-number-format', 'ctrl-arrow', 'ctrl-shift-arrow'], convention: 'D9',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, PER_SITE, HOUSE_FORMATS.perSite) && settled(ses); } },
    { id: 'retype-leverage', text: 'On Inputs the leverage B10:D10 was typed as text, 2.9x: Go To Inputs!B10 and retype the three figures as 2.9, 2.4 and 1.9 with Tab.', keys: 'Ctrl+G "Inputs!B10" ↵ "2.9" Tab "2.4" Tab "1.9" ↵', requires: ['go-to', 'sheet-reference', 'tab-commits'], convention: 'D9',
      check: (s, ses) => { const sh = inputs(ses); return !!sh && leverageTyped(sh) && settled(ses); } },
    { id: 'leverage-x', text: 'Now give B10:D10 the multiple code 0.0x, so the x is in the format and the numbers stay numbers.', keys: '↑ Ctrl+Shift+→ Ctrl+1 U "0.0x" ↵', requires: ['format-units', 'custom-number-format', 'ctrl-shift-arrow'], convention: 'D9',
      check: (s, ses) => { const sh = inputs(ses); return !!sh && leverageTyped(sh) && codeIs(sh, LEVERAGE, HOUSE_FORMATS.multiple) && settled(ses); } },
    { id: 'bps-code', text: 'The tariff increase B8:D8 is quoted in basis points: two rows up, select it and give it the code 0 bps.', keys: '↑ ×2 Ctrl+Shift+→ Ctrl+1 U "0 bps" ↵', requires: ['format-units', 'custom-number-format', 'ctrl-shift-arrow'], convention: 'C5',
      check: (s, ses) => { const sh = inputs(ses); return !!sh && codeIs(sh, BPS, HOUSE_FORMATS.bps) && settled(ses); } },
    { id: 'kwh-thousands', text: 'On Monthly, kWh sold B6:M6 runs to seven digits: Go To Monthly!B6, select the line and give it #,##0,k.', keys: 'Ctrl+G "Monthly!B6" ↵ Ctrl+Shift+→ Ctrl+1 U "#,##0,k" ↵', requires: ['format-units', 'go-to', 'sheet-reference', 'ctrl-shift-arrow'], convention: 'D9',
      check: (s, ses) => { const sh = monthly(ses); return !!sh && codeIs(sh, KWH, HOUSE_FORMATS.thousands) && settled(ses); } },
    { id: 'per-session-decimal', text: 'kWh per session B8:M8 straddles 20: two rows down, give it 0.0 so every month shows one decimal.', keys: '↓ ×2 Ctrl+Shift+→ Ctrl+1 U "0.0" ↵', requires: ['custom-number-format', 'ctrl-shift-arrow'], convention: 'D2',
      check: (s, ses) => { const sh = monthly(ses); return !!sh && codeIs(sh, PER_SESSION, HOUSE_FORMATS.oneDecimal) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!B10" Enter "3.5" Enter Escape Escape Escape', cadence: 320 }, text: 'Is it a number? Watch FY24A’s leverage in B10 change to 3.5 and read 3.5x: the x lives in the format, not the cell.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Revenue per site reads in $k', check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, PER_SITE, HOUSE_FORMATS.perSite); } },
    { text: 'The leverage is three numbers wearing an x, and the tariff increase reads in bps', check: (s, ses) => { const sh = inputs(ses); return !!sh && leverageTyped(sh) && codeIs(sh, LEVERAGE, HOUSE_FORMATS.multiple) && codeIs(sh, BPS, HOUSE_FORMATS.bps); } },
    { text: 'On Monthly, kWh reads in thousands and kWh per session to one decimal', check: (s, ses) => { const sh = monthly(ses); return !!sh && codeIs(sh, KWH, HOUSE_FORMATS.thousands) && codeIs(sh, PER_SESSION, HOUSE_FORMATS.oneDecimal); } },
  ],
  closing: [
    'Every unit on the three pages now lives in a format: $k on the per-site line, x on the multiples, bps on the tariff step, k on the kWh (D9). The figures underneath are plain numbers, so a formula can link to any of them and the decimals stay consistent down each line (D2).',
    'The Custom box quoted the letters for you: what you typed as 0.0x it stored as 0.0"x", which is exactly what Excel’s box does.',
  ],
  solution: 'Ctrl+Down Ctrl+Down Down Right Ctrl+Down Ctrl+Down Down Ctrl+Shift+Right Ctrl+1 U "$#,##0,k_);($#,##0,k);-_)" Enter Ctrl+G "Inputs!B10" Enter "2.9" Tab "2.4" Tab "1.9" Enter Up Ctrl+Shift+Right Ctrl+1 U "0.0x" Enter Up Up Ctrl+Shift+Right Ctrl+1 U "0 bps" Enter Ctrl+G "Monthly!B6" Enter Ctrl+Shift+Right Ctrl+1 U "#,##0,k" Enter Down Down Ctrl+Shift+Right Ctrl+1 U "0.0" Enter',
};
