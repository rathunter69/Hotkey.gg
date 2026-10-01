// Chapter 2 · 2.2.C Challenge: the number-format set (seeded over S1d)
// A cluster’s three-year P&L in the built-in formats: comma on the lines, currency on the $ rows,
// percent on the margins, the month ends on Monthly as bare serials, the check in plain digits.
// The set replaces them with codes: the four-section plain code on the lines, the $ code on the
// first row and the totals, the percent code on the margins, FY codes on the timeline, mmm-yy on
// the months, red on the check, and the summary revenue on Inputs in millions. Seeds pick the
// cluster and the figures; the workload never moves. (The live id is kept from the earlier build.)
import { YEAR_COLS, CODES, TYPED, DOLLAR_ROWS, MONTH_COLS, clusterPatch, overlayPatch, stateOf } from '../workbooks/clearcoat-pnl.js';
import { fullCanon } from '../../app/graders.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const inputs = ses => sheetOf(ses, 'Inputs');
const monthly = ses => sheetOf(ses, 'Monthly');
const settled = ses => !ses.editing && !ses.dialog;
const rows = rs => YEAR_COLS.flatMap(col => rs.map(r => col + r));
const codeIs = (sh, refs, code) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === 'custom' && c.numFmt === code; });

const PLAINS = rows([8, 9, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23]);
const DOLLARS = rows(DOLLAR_ROWS);
const PCTS = [...rows([27, 28, 29]), 'D30', 'E30', 'F30'];
const MONTH_HEADS = MONTH_COLS.map(col => col + '4');
const fyCodes = sh => codeIs(sh, ['C4', 'D4'], CODES.fyActual) && codeIs(sh, ['E4'], CODES.fyEstimate);
const monthsAsDates = sh => MONTH_HEADS.every(ref => sh.cellAt(ref).fmtStyle === 'date' && typeof sh.value(ref) === 'number');

export default {
  id: 'challenge-house-format-set',
  chapter: 'formatting',
  section: 'Custom number formats',
  module: 'custom-number-formats',
  workbook: 'clearcoat-pnl',
  state: { before: 'S1d' },
  kind: 'challenge',
  title: 'Challenge: the number-format set',
  difficulty: 'medium',
  tags: ['challenge', 'format', 'custom-number-formats', 'pnl'],
  access: 'paid',
  minutes: 3,
  conventions: ['D3', 'D4', 'D9', 'F1'],
  prerequisites: ['conditional-codes-and-hidden-zeros'],
  brief: 'A fresh cluster export with a monthly block, still in the built-in formats. Apply the set: the four-section codes on dollars and percents, FY codes, mmm-yy on the months, units on the summary and red on the check.',
  timeLimit: 170,
  pars: parsFrom(60, { pass: 160, pro: 100 }),
  seed: rng => overlayPatch(stateOf('S1d'), clusterPatch(rng, { signed: true })),
  goals: [
    { id: 'plain-code', text: 'Give the P&L lines C7:E24 the plain code #,##0_);(#,##0);-_) in the Custom box.', convention: 'D3',
      keys: `Ctrl+↓ ×2 → ×2 Ctrl+↓ ×2 Ctrl+Shift+↓ ×5 Ctrl+Shift+→ Ctrl+1 U "${TYPED.plain}" ↵`,
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, [...PLAINS, ...DOLLARS], CODES.plain) && settled(ses); } },
    { id: 'fy-codes', text: 'Give the actual years C4:D4 the code "FY"yy"A" and the estimate E4 the code "FY"yy"E".', convention: 'D9',
      keys: `Ctrl+↑ ↑ Shift+→ Ctrl+1 U '${TYPED.fyActual}' ↵ → ×2 Ctrl+1 U '${TYPED.fyEstimate}' ↵`,
      check: (s, ses) => { const sh = pnl(ses); return !!sh && fyCodes(sh) && settled(ses); } },
    { id: 'units-m', text: 'On Inputs, show FY26E revenue in B15 in millions with the code #,##0.0,"m".', convention: 'D9',
      keys: `Ctrl+G "Inputs!B15" ↵ Ctrl+1 U '${TYPED.millions}' ↵`,
      check: (s, ses) => { const sh = inputs(ses); return !!sh && codeIs(sh, ['B15'], CODES.millions) && settled(ses); } },
    { id: 'month-dates', text: 'On Monthly, show the month ends in C4:N4 as dates with Ctrl+1 then D.', convention: 'C2',
      keys: 'Ctrl+G "Monthly!C4" ↵ Ctrl+Shift+→ Ctrl+1 D',
      check: (s, ses) => { const sh = monthly(ses); return !!sh && monthsAsDates(sh) && settled(ses); } },
    { id: 'red-check', text: 'On the P&L, give the check in C39 the code 0_);[Red](0);-_) so a miss turns red.', convention: 'F1',
      keys: `Ctrl+G "'P&L'!C39" ↵ Ctrl+1 U "${TYPED.check}" ↵`,
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, ['C39'], CODES.check) && settled(ses); } },
    { id: 'dollar-rows', text: 'Put the $ code $#,##0_);($#,##0);-_) on C7:E7, then on total revenue C10:E10 and EBITDA C24:E24 with F4.', convention: 'D4',
      keys: `Ctrl+G "C7" ↵ Shift+→ ×2 Ctrl+1 U "${TYPED.dollar}" ↵ Ctrl+↓ Shift+→ ×2 F4 Ctrl+↓ ×4 Shift+→ ×2 F4`,
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, DOLLARS, CODES.dollar) && settled(ses); } },
    { id: 'pct-code', text: 'Give the margins block C27:F30 the percent code 0.0%_);(0.0%);-_).', convention: 'D3',
      keys: `Ctrl+↓ Shift+→ ×3 Shift+↓ ×3 Ctrl+1 U "${TYPED.pct}" ↵`,
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codeIs(sh, PCTS, CODES.pct) && settled(ses); } },
  ],
  graders: [
    ses => fullCanon(pnl(ses), {
      range: 'C7:E24',
      zeroDash: true,
      rows: ['C10:E10', 'C20:E20', 'C22:E22', 'C24:E24'],
      costRows: ['C13:E19', 'C23:E23'],
      units: true,
      dollar: { range: 'C7:E24', rows: DOLLAR_ROWS },
      pctLines: ['C27:E29', 'D30:E30'],
      hidden: true,
    }),
    ses => { const sh = pnl(ses); if (!sh) return { ok: false, why: 'the P&L sheet is missing' };
      if (!codeIs(sh, PLAINS, CODES.plain)) return { ok: false, why: 'C8 is not in the plain code #,##0_);(#,##0);-_)' };
      if (!codeIs(sh, PCTS, CODES.pct)) return { ok: false, why: 'C27 is not in the percent code 0.0%_);(0.0%);-_)' };
      if (!fyCodes(sh)) return { ok: false, why: 'C4:E4 do not read FY24A, FY25A, FY26E from their dates' };
      if (!codeIs(sh, ['C39'], CODES.check)) return { ok: false, why: 'C39 would not turn red on a miss' };
      return { ok: true }; },
    ses => { const sh = monthly(ses); if (!sh) return { ok: false, why: 'the Monthly sheet is missing' };
      if (!monthsAsDates(sh)) return { ok: false, why: 'Monthly C4 still shows a serial, not a month' };
      return { ok: true }; },
    ses => { const sh = inputs(ses); if (!sh) return { ok: false, why: 'the Inputs sheet is missing' };
      if (!codeIs(sh, ['B15'], CODES.millions)) return { ok: false, why: 'Inputs B15 does not read in millions: the unit lives in the format' };
      return { ok: true }; },
  ],
  solution: `Ctrl+Down Ctrl+Down Right Right Ctrl+Down Ctrl+Down Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Right Ctrl+1 U "${TYPED.plain}" Enter Ctrl+Up Up Shift+Right Ctrl+1 U '${TYPED.fyActual}' Enter Right Right Ctrl+1 U '${TYPED.fyEstimate}' Enter Ctrl+G "Inputs!B15" Enter Ctrl+1 U '${TYPED.millions}' Enter Ctrl+G "Monthly!C4" Enter Ctrl+Shift+Right Ctrl+1 D Ctrl+G "'P&L'!C39" Enter Ctrl+1 U "${TYPED.check}" Enter Ctrl+G "C7" Enter Shift+Right Shift+Right Ctrl+1 U "${TYPED.dollar}" Enter Ctrl+Down Shift+Right Shift+Right F4 Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Shift+Right Shift+Right F4 Ctrl+Down Shift+Right Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Ctrl+1 U "${TYPED.pct}" Enter`,
};
