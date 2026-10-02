// Chapter 6 · 6.3.C Challenge: a paper LBO (clearcoat-valuation, seeded over B63C)
// One sheet: a fresh term sheet (one senior tranche, no mezzanine, no rollover) with EBITDA and free
// cash flow typed, the seed moving the bid and the exit multiple. The learner builds sources and
// uses, the senior loan with its sweep (and the revolver behind it), exit equity, MOIC and IRR, the
// bridge, and the flag against the 20% hurdle. Every figure is graded against the paper page
// solved on the learner's own typed inputs; any layout of the working that lands the named cells
// passes.
import { challengeSeed, paperState, PAPER_ROWS } from '../workbooks/clearcoat-valuation.js';
import { applyStatePatch } from '../workbooks/index.js';
import { sessionOf } from './lib/model-checks.js';
import { sheetIn, settled, isNum, quoted, toScript } from './lib/deal-checks.js';
import { parsFrom } from '../../app/pars.js';

const ID = 'challenge-paper-lbo';
const L = 'LBO';
const ROWS = PAPER_ROWS().LBO;
const R = k => ROWS[k];
const C = k => 'C' + R(k);
const YRS = ['D', 'E', 'F', 'G', 'H'];
let PAPER = null;
const paper = () => (PAPER || (PAPER = paperState()));
const formulaAt = ref => paper().sheets[0].cells[ref].formula;

/** The learner's typed inputs: the term sheet's column C and the two given operating lines. */
function typedInputs(sh) {
  const out = {};
  const take = ref => { const c = sh.cells[ref]; if (c && !c.formula && isNum(c.value)) out[ref] = c.value; };
  for (let r = R('ebitda26'); r <= R('circ'); r++) take('C' + r);
  for (const k of ['ebitda', 'fcf']) for (const c of YRS) take(c + R(k));
  return out;
}
const SOLVED = new Map();
/** The paper page solved on these inputs: ref → value (built once per set of inputs, kept for a few). */
function solved(inputs) {
  const key = JSON.stringify(inputs);
  if (!SOLVED.has(key)) {
    const st = JSON.parse(JSON.stringify(paper()));
    const cells = st.sheets[0].cells;
    const patch = {};
    for (const [ref, v] of Object.entries(inputs)) patch[`${L}!${ref}`] = { ...(cells[ref] || {}), value: v };
    applyStatePatch(st, patch);
    const s = sessionOf(st);
    const sh = s.sheets[0].sheet;
    SOLVED.set(key, ref => sh.value(ref));
    if (SOLVED.size > 6) SOLVED.delete(SOLVED.keys().next().value);
  }
  return SOLVED.get(key);
}
const lbo = ses => sheetIn(ses, L);
const close = (a, b, tol = 0.5) => isNum(a) && isNum(b) && Math.abs(a - b) <= tol + 1e-6 * Math.abs(b);
/** Every ref holds a formula reading what the solved page reads there (`tol` in thousands; rates and multiples pass a tighter one). */
function agrees(ses, refs, tol) {
  const sh = lbo(ses); if (!sh) return false;
  const want = solved(typedInputs(sh));
  return refs.every(ref => { const c = sh.cells[ref]; if (!c || !c.formula) return false; const w = want(ref); return isNum(w) ? close(c.value, w, tol) : c.value === w; });
}
const SU = [C('usesTotal'), C('srcSponsor'), C('srcTotal')];
const DEBT = ['H' + R('senClose'), 'H' + R('netDebt')];
const EXIT = [C('exitEq')];
const RET = [C('moic'), C('irr')];
const BRIDGE = ['gain', 'growthEff', 'multEff', 'paydownEff', 'feesEff', 'bridgeTotal'].map(C);
const FLAG = [C('hurdleFlag')];
const suOk = ses => agrees(ses, SU);
const debtOk = ses => agrees(ses, DEBT);
const exitOk = ses => agrees(ses, EXIT);
const retOk = ses => agrees(ses, RET, 1e-4);
const bridgeOk = ses => agrees(ses, BRIDGE);
const flagOk = ses => agrees(ses, FLAG);

/* the reference route: each line's formula from the solved page, the closing column typed once, the years filled */
const down = keys => `Ctrl+G "${L}!${C(keys[0])}" ↵ ` + keys.map(k => quoted(formulaAt(C(k)))).join(' ↵ ↓ ') + ' ↵';
const line = k => {
  const c0 = paper().sheets[0].cells[C(k)];
  const yrs = `Ctrl+G "${L}!D${R(k)}:H${R(k)}" ↵ ${quoted(formulaAt('D' + R(k)))} Ctrl+↵`;
  return c0 ? `Ctrl+G "${L}!${C(k)}" ↵ ${quoted(c0.formula || String(c0.value))} ↵ ${yrs}` : yrs;
};
const KEYS = {
  su: down(['useNetDebt', 'useEquity', 'useEV', 'useFees', 'usesTotal', 'srcSenior', 'srcMezz', 'srcRoll', 'srcSponsor', 'srcTotal']),
  debt: ['ebitdaAdj', 'cashOpen', 'cFcf', 'cInt', 'cMand', 'cashPre', 'cashAvail', 'revDrawn', 'revRepaid', 'sweep', 'cashClose',
    'senOpen', 'senMand', 'senSweep', 'senClose', 'senAvg', 'senInt', 'revOpen', 'revDrawnRow', 'revRepaidRow', 'revClose', 'revAvg', 'revInt', 'totDebt', 'totInt', 'cashRow', 'netDebt'].map(line).join(' '),
  exit: down(['exitEV', 'exitND', 'exitEq']),
  returns: `${down(['entryEq', 'moic'])} ${line('eqFlow')} ${down(['irr'])}`,
  bridge: down(['gain', 'growthEff', 'multEff', 'paydownEff', 'feesEff', 'bridgeTotal']),
  flag: down(['hurdleFlag']),
};

export default {
  id: ID,
  chapter: 'valuation',
  section: 'LBO',
  module: 'lbo',
  workbook: 'clearcoat-valuation',
  state: { before: 'B63C' },
  kind: 'challenge',
  title: 'Challenge: a paper LBO',
  difficulty: 'hard',
  tags: ['challenge', 'valuation', 'lbo'],
  access: 'paid',
  minutes: 3,
  conventions: ['C3', 'F1'],
  prerequisites: ['what-the-sponsor-can-pay'],
  brief: 'Fresh inputs, one sheet, one senior tranche. Sources and uses, the sweep over five years, exit equity, MOIC and IRR, the bridge, and the flag against 20%.',
  timeLimit: 180,
  pars: parsFrom(150, { pass: 178, pro: 165 }),
  seed: rng => challengeSeed(ID, rng),
  goals: [
    { id: 'sources-uses', text: `Sources and uses balancing: total uses in ${SU[0]}, the sponsor’s equity in ${SU[1]} and total sources in ${SU[2]}.`,
      keys: KEYS.su, check: (s, ses) => settled(ses) && suOk(ses) },
    { id: 'sweep', text: `Five years of the senior loan with its sweep, closing FY31 at ${DEBT[0]}, and net debt at FY31 in ${DEBT[1]}.`,
      keys: KEYS.debt, check: (s, ses) => settled(ses) && debtOk(ses) },
    { id: 'exit', text: `Equity at the exit in ${EXIT[0]}: the exit multiple on FY31 EBITDA, less net debt.`,
      keys: KEYS.exit, check: (s, ses) => settled(ses) && exitOk(ses) },
    { id: 'returns', text: `MOIC in ${RET[0]} and IRR on the equity cash flows in ${RET[1]}.`,
      keys: KEYS.returns, check: (s, ses) => settled(ses) && retOk(ses) },
    { id: 'bridge', text: `The bridge in ${BRIDGE[0]}:${BRIDGE[5]}: the gain, growth, multiple, paydown and fees, and their total.`,
      keys: KEYS.bridge, check: (s, ses) => settled(ses) && bridgeOk(ses) },
    { id: 'flag', text: `The flag in ${FLAG[0]}: Clears or Short against the 20% hurdle.`,
      keys: KEYS.flag, check: (s, ses) => settled(ses) && flagOk(ses) },
  ],
  graders: [
    ses => suOk(ses) ? { ok: true } : { ok: false, why: 'sources and uses don’t balance. Uses are the price and the fees; the sponsor’s equity is total uses less the senior loan' },
    ses => debtOk(ses) ? { ok: true } : { ok: false, why: 'the debt at FY31 is off. Interest net of tax and the mandatory amortization come off cash first, then the sweep repays the senior loan, floored at zero' },
    ses => exitOk(ses) ? { ok: true } : { ok: false, why: 'exit equity is off. The exit multiple on FY31 EBITDA, less net debt at FY31' },
    ses => retOk(ses) ? { ok: true } : { ok: false, why: 'MOIC or IRR is off. Exit equity over entry equity, and IRR on entry equity out at closing and exit equity back in FY31' },
    ses => bridgeOk(ses) ? { ok: true } : { ok: false, why: 'the bridge doesn’t sum to the gain. Growth at the entry multiple, the multiple change on FY31 EBITDA, net debt paid down, less the fees' },
    ses => flagOk(ses) ? { ok: true } : { ok: false, why: 'the flag doesn’t read the IRR against the hurdle cell' },
  ],
  solution: Object.values(KEYS).map(toScript).join(' '),
};
