// Chapter 3 · 3.6.C Challenge: six faults in a summary (seeded over S6d)
// The finished Summary with six faults planted back into it: Airport's SUMIF stops a row short
// (D70), one site's revenue is a typed number, one site's wash count is a number stored as text,
// C73 reads last year's databook through an external link again, one new-price formula multiplies
// by a typed 1.05, and the loan check in C84 is a typed 0. The seed picks which rows carry the
// typed number, the text number and the literal, and the figures typed; the workload never moves.
// Checks read the values the export and the counts give, the links the session finds, parsed
// tokens for the literal (on E66:E71 only) and the shared liveness rule.
import { stateOf } from '../workbooks/clearcoat-databook.js';
import { livenessMemo as liveness, noLiteralInFormula } from '../../app/graders.js';
import { formulaRefs } from '../../engine/formula.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const summary = ses => sheetOf(ses, 'Summary');
const settled = ses => !ses.editing && !ses.dialog;
const ROWS = [66, 67, 68, 69, 70, 71];
const LINK = "='[Databook FY25.xlsx]Summary'!$F$21";

function siteSums(ses) {
  const tx = sheetOf(ses, 'Transactions'); const out = {};
  for (let r = 5; r <= 200; r++) { const site = tx.value('B' + r); if (site == null || site === '') break; out[site] = (out[site] || 0) + (Number(tx.value('E' + r)) || 0); }
  return out;
}
// cheap tests on every row first, the liveness rule (a recalculation per nudge) only once they all pass
const allLive = (sh, refs) => refs.every(ref => liveness(sh, ref).ok);
const revenueRow = (sh, sums, r) => !!sh.cellAt('D' + r).formula && sh.value('D' + r) === (sums[sh.value('B' + r)] || 0);
const airport = ses => { const sh = summary(ses); return !!sh && revenueRow(sh, siteSums(ses), 70) && allLive(sh, ['D70']); };
const revenue = ses => { const sh = summary(ses); if (!sh) return false; const sums = siteSums(ses); return ROWS.every(r => revenueRow(sh, sums, r)) && allLive(sh, ROWS.map(r => 'D' + r)); };
const counts = ses => { const sh = summary(ses); return !!sh && ROWS.every(r => !!sh.cellAt('C' + r).formula && typeof sh.value('C' + r) === 'number' && sh.value('C' + r) === sh.value('C' + (r - 51))) && allLive(sh, ROWS.map(r => 'C' + r)); };
const noLinks = ses => typeof ses.externalLinks === 'function' && ses.externalLinks().length === 0;
const prior = ses => { const sh = summary(ses); return !!sh && noLinks(ses) && !sh.cellAt('C73').formula && sh.value('C73') === 710 && sh.cellAt('C73').fontColor === 'blue'; };
const uplift = ses => { const sh = summary(ses); if (!sh) return false; const k = sh.value('C75');
  return ROWS.every(r => !!sh.cellAt('E' + r).formula && noLiteralInFormula(sh, 'E' + r).ok && Math.abs(sh.value('E' + r) - sh.value('D' + r) * k) < 1e-9) && allLive(sh, ROWS.map(r => 'E' + r)); };
const loanCheck = ses => { const sh = summary(ses), l = sheetOf(ses, 'Loans'); if (!sh || !l) return false; const f = sh.cellAt('C84').formula;
  let refs = []; try { refs = f ? formulaRefs(f) : []; } catch (e) { refs = []; }
  return !!f && refs.length > 0 && sh.value('C84') === l.value('C167'); };
const flagOk = ses => { const sh = summary(ses); return !!sh && sh.value('C87') === 'OK' && sh.value('C2') === 'OK'; };

/** The six faults, planted over the finished Summary; the seed picks three rows and two figures. */
function plantFaults(rng) {
  const cells = stateOf('S6d').sheets.find(s => s.name === 'Summary').cells;
  const keep = ref => ({ ...cells[ref] });
  const pick = list => list[Math.floor(rng() * list.length)];
  const typedRow = pick([66, 67, 68, 69, 71]);
  const textRow = pick(ROWS);
  const literalRow = pick(ROWS);
  const patch = {};
  const d70 = keep('D70'); patch['Summary!D70'] = { ...d70, formula: '=SUMIF(Transactions!$B$5:$B$93,B70,Transactions!$E$5:$E$93)' };
  const typed = keep('D' + typedRow); delete typed.formula; patch['Summary!D' + typedRow] = { ...typed, value: 900 + 10 * Math.floor(rng() * 70) };
  const text = keep('C' + textRow); delete text.formula; patch['Summary!C' + textRow] = { ...text, value: String(8 + Math.floor(rng() * 12)) };
  patch['Summary!E' + literalRow] = { ...keep('E' + literalRow), formula: '=D' + literalRow + '*1.05' };
  const c73 = keep('C73'); delete c73.value; delete c73.fontColor; patch['Summary!C73'] = { ...c73, formula: LINK };
  const c84 = keep('C84'); delete c84.formula; patch['Summary!C84'] = { ...c84, value: 0 };
  return patch;
}

export default {
  id: 'challenge-six-faults',
  chapter: 'formulas',
  section: 'Auditing',
  module: 'auditing',
  workbook: 'clearcoat-databook',
  state: { before: 'S6d' },
  kind: 'challenge',
  title: 'Challenge: six faults in a summary',
  difficulty: 'hard',
  tags: ['challenge', 'formulas', 'audit', 'hardcodes', 'links'],
  access: 'paid',
  minutes: 4,
  conventions: ['F3', 'B4', 'E7', 'F1'],
  prerequisites: ['checks-block-rollup'],
  brief: 'Six faults in the old Summary block: a short range, a typed number, a text number, an external link, a number inside a formula and a dead check. Fix every one.',
  timeLimit: 180,
  pars: parsFrom(60, { pass: 170, pro: 100 }),
  seed: plantFaults,
  goals: [
    { id: 'short-range', text: 'Airport’s SUMIF in D70 stops a row short of the export: make the ranges in D66:D71 run to row 94.', convention: 'F3',
      keys: 'Ctrl+G "D66" ↵ Shift+↓ ×5 Ctrl+H "$93" Tab "$94" Alt+A Esc',
      check: (s, ses) => airport(ses) && settled(ses) },
    { id: 'typed-number', text: 'One site’s retail revenue in D66:D71 is a typed number: give every row the same live SUMIF.', convention: 'B4',
      keys: '\'=SUMIF(Transactions!$B$5:$B$94,B66,Transactions!$E$5:$E$94)\' Ctrl+↵',
      check: (s, ses) => revenue(ses) && settled(ses) },
    { id: 'text-number', text: 'One wash count in C66:C71 is a number stored as text: link every row to its site count again.', convention: 'B4',
      keys: '← Shift+↓ ×5 "=C15" Ctrl+↵',
      check: (s, ses) => counts(ses) && settled(ses) },
    { id: 'external-link', text: 'C73 reads last year’s databook through an external link: replace it with the 710 it fetched, typed blue.', convention: 'E7',
      keys: 'Ctrl+↓ ↑ ×3 "710" ↵ ↑ Alt H F C → ×4 ↵',
      check: (s, ses) => prior(ses) && settled(ses) },
    { id: 'literal', text: 'One new-price formula in E66:E71 multiplies by a typed 1.05: point it at the uplift input in C75.', convention: 'B4',
      keys: 'Ctrl+↑ ↓ → ×2 Shift+↓ ×5 Ctrl+H "1.05" Tab "$C$75" Alt+A Esc',
      check: (s, ses) => uplift(ses) && settled(ses) },
    { id: 'dead-check', text: 'The loan check in C84 is a typed 0: link it to the schedule’s check on Loans, and the flag in C2 reads OK.', convention: 'F1',
      keys: '← ×2 Ctrl+↓ ×3 ↑ ×3 "=Loans!C167" ↵',
      check: (s, ses) => loanCheck(ses) && flagOk(ses) && settled(ses) },
  ],
  graders: [
    ses => { if (!summary(ses)) return { ok: false, why: 'the Summary sheet is missing' };
      if (!airport(ses)) return { ok: false, why: 'D70 does not read the whole export: its ranges stop at row 93' };
      if (!revenue(ses)) return { ok: false, why: 'a site’s retail revenue in D66:D71 is not a live SUMIF of the export rows' };
      if (!counts(ses)) return { ok: false, why: 'a wash count in C66:C71 is not a live link to the site counts' };
      return { ok: true }; },
    ses => { if (!summary(ses)) return { ok: false, why: 'the Summary sheet is missing' };
      if (!noLinks(ses)) return { ok: false, why: 'the workbook still reads another file: Alt A K lists the link' };
      if (!prior(ses)) return { ok: false, why: 'C73 is not the prior-year 710, typed blue' };
      if (!uplift(ses)) return { ok: false, why: 'a formula in E66:E71 has a number typed inside it. The uplift lives in C75' };
      if (!loanCheck(ses)) return { ok: false, why: 'C84 is not a formula. A check is a live difference, not a typed 0' };
      return { ok: true }; },
  ],
  solution: 'Ctrl+G "D66" Enter Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+H "$93" Tab "$94" Alt+A Escape \'=SUMIF(Transactions!$B$5:$B$94,B66,Transactions!$E$5:$E$94)\' Ctrl+Enter Left Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "=C15" Ctrl+Enter Ctrl+Down Up Up Up "710" Enter Up Alt H F C Right Right Right Right Enter Ctrl+Up Down Right Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+H "1.05" Tab "$C$75" Alt+A Escape Left Left Ctrl+Down Ctrl+Down Ctrl+Down Up Up Up "=Loans!C167" Enter',
};
