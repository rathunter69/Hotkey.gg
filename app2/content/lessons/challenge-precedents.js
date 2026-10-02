// Chapter 6 · 6.2.C Challenge: precedents spread (clearcoat-valuation, seeded over B62C)
// Five fresh deals typed on Precedents (each enterprise value moved by the seed). The learner
// spreads the multiples and premiums, ages the deals against the valuation date, flags and reasons
// each one, and applies the included deals' quartiles and median to Clearcoat's EBITDA. Every
// figure is graded on its value worked out here from the learner's own cells; any formula that gets
// there passes.
import { challengeSeed, ALT, ALT_ROWS } from '../workbooks/clearcoat-valuation.js';
import { sheetIn, settled, near, isNum, cellsAt, quoted, toScript } from './lib/deal-checks.js';
import { evalFormula } from '../../engine/formula.js';
import { parsFrom } from '../../app/pars.js';

const ID = 'challenge-precedents';
const P = 'Precedents';
const rows = ALT_ROWS();
const R = k => rows[P][k];
const N = ALT.deals.length;
const DEAL_ROWS = Array.from({ length: N }, (_, i) => R('d' + i));
const r0 = DEAL_ROWS[0], rN = DEAL_ROWS[N - 1];
const AS_OF = cellsAt('B623', P)['C' + 19].formula;   // the valuation date on Inputs, as the base page links it
const CC = rows.Comps.cc;
const sh = ses => sheetIn(ses, P);
const v = (ses, ref) => sh(ses).value(ref);
const close = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) <= 0.01 + 1e-6 * Math.abs(b);
const fx = (ses, ref) => !!sh(ses).formula(ref);

const multOk = ses => DEAL_ROWS.every(r => fx(ses, 'J' + r) && close(v(ses, 'J' + r), v(ses, 'G' + r) / v(ses, 'H' + r)));
const premOk = ses => DEAL_ROWS.every(r => fx(ses, 'O' + r) && (v(ses, 'L' + r) === 1 ? close(v(ses, 'O' + r), v(ses, 'N' + r) / v(ses, 'M' + r) - 1) : !isNum(v(ses, 'O' + r))));
/** The age the valuation date gives, worked out by Excel's YEARFRAC in the learner's own sheet. */
const ageWant = (ses, r) => { try { return evalFormula(`=YEARFRAC(C${r},${AS_OF.slice(1)})`, sh(ses).evalCtx({ cell: { r, c: 16 } })); } catch (e) { return NaN; } };
const agesOk = ses => DEAL_ROWS.every(r => fx(ses, 'P' + r) && close(v(ses, 'P' + r), ageWant(ses, r)));
const flagsOk = ses => ALT.deals.every((d, i) => { const r = DEAL_ROWS[i]; const q = sh(ses).cells['Q' + r], why = sh(ses).cells['R' + r]; return !!q && !q.formula && q.value === d.include && !!why && typeof why.value === 'string' && why.value.trim().length > 1; });
/** QUARTILE.INC as Excel computes it: the inclusive percentile, interpolated. */
function quartile(xs, k) { const s = [...xs].sort((a, b) => a - b); const h = (s.length - 1) * k / 4; const lo = Math.floor(h); return lo + 1 < s.length ? s[lo] + (h - lo) * (s[lo + 1] - s[lo]) : s[lo]; }
function rangeWant(ses) {
  const xs = DEAL_ROWS.filter(r => v(ses, 'Q' + r) === 1).map(r => v(ses, 'G' + r) / v(ses, 'H' + r));
  if (!xs.length) return null;
  const e = sheetIn(ses, 'Comps').value('J' + CC);
  return [quartile(xs, 1), quartile(xs, 2), quartile(xs, 3)].map(m => m * e);
}
const RG = R('rgEV');
const rangeOk = ses => { const w = rangeWant(ses); return !!w && ['C', 'D', 'E'].every((c, i) => fx(ses, c + RG) && close(v(ses, c + RG), w[i])); };

const span = c => `${c}${r0}:${c}${rN}`;
const fill = (range, f) => `Ctrl+G "${P}!${range}" ↵ ${quoted(f)} ${range.includes(':') ? 'Ctrl+↵' : '↵'}`;
const down = (first, list) => `Ctrl+G "${P}!${first}" ↵ ` + list.map(quoted).join(' ↵ ↓ ') + ' ↵';
const STAT = { med: R('stMed'), low: R('stLow'), high: R('stHigh') };
const KEYS = {
  mult: fill(span('J'), `=IF(H${r0}>0,G${r0}/H${r0},"NM")`),
  prem: fill(span('O'), `=IF(L${r0}=1,N${r0}/M${r0}-1,"-")`),
  ages: `${fill('C' + R('asOf'), AS_OF)} ${fill(span('P'), `=YEARFRAC(C${r0},$C$${R('asOf')})`)}`,
  flags: `${down('Q' + r0, ALT.deals.map(d => String(d.include)))} ${down('R' + r0, ALT.deals.map(d => d.reason))}`,
  range: [fill(span('S'), `=IF(Q${r0}=1,J${r0},"")`), fill('S' + STAT.low, `=QUARTILE.INC(S${r0}:S${rN},1)`), fill('S' + STAT.med, `=MEDIAN(S${r0}:S${rN})`), fill('S' + STAT.high, `=QUARTILE.INC(S${r0}:S${rN},3)`),
    `Ctrl+G "${P}!C${R('rgMult')}" ↵ "=S${STAT.low}" Tab "=S${STAT.med}" Tab "=S${STAT.high}" ↵`, fill(`C${RG}:E${RG}`, `=C${R('rgMult')}*Comps!$J$${CC}`)].join(' '),
};

export default {
  id: ID,
  chapter: 'valuation',
  section: 'Precedent transactions',
  module: 'precedent-transactions',
  workbook: 'clearcoat-valuation',
  state: { before: 'B62C' },
  kind: 'challenge',
  title: 'Challenge: precedents spread',
  difficulty: 'hard',
  tags: ['challenge', 'valuation', 'precedents'],
  access: 'paid',
  minutes: 3,
  conventions: ['B4', 'C3'],
  prerequisites: ['applying-precedents'],
  brief: 'Five fresh deals on Precedents. Multiples, premiums, ages, include flags with reasons, and the range applied to Clearcoat’s EBITDA.',
  timeLimit: 180,
  pars: parsFrom(100, { pass: 175, pro: 130 }),
  seed: rng => challengeSeed(ID, rng),
  goals: [
    { id: 'multiples', text: `The deal multiple in ${span('J')}: enterprise value over LTM EBITDA.`,
      keys: KEYS.mult, check: (s, ses) => settled(ses) && multOk(ses) },
    { id: 'premiums', text: `The premium in ${span('O')} where the target was listed, a dash where it wasn’t.`,
      keys: KEYS.prem, check: (s, ses) => settled(ses) && premOk(ses) },
    { id: 'ages', text: `Each deal’s age in years in ${span('P')}, against the valuation date on Inputs.`,
      keys: KEYS.ages, check: (s, ses) => settled(ses) && agesOk(ses) },
    { id: 'flags', text: `Include flags in ${span('Q')} with a reason beside each in column R: the stale deal and the big strategic chain out.`,
      keys: KEYS.flags, check: (s, ses) => settled(ses) && flagsOk(ses) },
    { id: 'range', text: `The EV range in C${RG}:E${RG}: the included deals’ low quartile, median and high quartile times Clearcoat’s EBITDA on Comps.`,
      keys: KEYS.range, check: (s, ses) => settled(ses) && rangeOk(ses) },
  ],
  graders: [
    ses => multOk(ses) ? { ok: true } : { ok: false, why: 'a deal multiple is off. Enterprise value over LTM EBITDA on every row, as a formula' },
    ses => premOk(ses) ? { ok: true } : { ok: false, why: 'a premium is off. The offer over the price before the announcement, less one, where Listed reads 1; text where it reads 0' },
    ses => agesOk(ses) ? { ok: true } : { ok: false, why: 'an age is off. YEARFRAC from the deal date to the valuation date on Inputs' },
    ses => flagsOk(ses) ? { ok: true } : { ok: false, why: 'a flag or a reason is missing. The deal priced before rates rose and the 110-site chain bought by a strategic are out; every deal carries a reason' },
    ses => rangeOk(ses) ? { ok: true } : { ok: false, why: 'the range is off. The included deals only, through a helper column, then QUARTILE.INC and MEDIAN times FY26E EBITDA' },
  ],
  solution: Object.values(KEYS).map(toScript).join(' '),
};
