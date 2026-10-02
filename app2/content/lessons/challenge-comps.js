// Chapter 6 · 6.1.C Challenge: three comps spread and a range applied (clearcoat-valuation, seeded over B61C)
// Three fresh listed operators arrive with their inputs and eight quarters each, the share prices
// new every seed; their site counts are typed beside them. The learner builds LTM from the quarters,
// the EV build and EV / EBITDA, calendarizes the March company, takes the median and quartiles,
// EV per site with its median, and applies the range to Clearcoat's FY26E EBITDA. Every figure is
// worked out here from the learner's own cells; any formula that gets there passes.
import { challengeSeed, ALT, ALT_ROWS } from '../workbooks/clearcoat-valuation.js';
import { sheetIn, settled, isNum, liveVia, cellsIn } from './lib/comps-checks.js';
import { parsFrom } from '../../app/pars.js';

const ID = 'challenge-comps';
const rows = ALT_ROWS().Comps;
const N = ALT.comps.length;
const CR = Array.from({ length: N }, (_, i) => rows['c' + i]);
const QR = Array.from({ length: N }, (_, i) => rows['q' + i]);
const MARCH = ALT.comps.findIndex(c => c.fye === 3);
const QM = QR[MARCH];
const [MED, LOW, HIGH] = [rows.stMed, rows.stLow, rows.stHigh];
const [RM, RE] = [rows.rgMult, rows.rgEV];
const EBITDA_REF = 'IS!$E$24';   // Clearcoat's FY26E EBITDA on the model

const sh = ses => sheetIn(ses, 'Comps');
const v = (ses, ref) => { const x = sh(ses).value(ref); return isNum(x) ? x : NaN; };
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) <= 0.005 + 1e-9 * Math.abs(b);
const fx = (ses, ref, want) => !!sh(ses) && !!sh(ses).formula(ref) && near(sh(ses).value(ref), want);
const live = (ses, ref, input) => liveVia(ses, 'Comps', ref, ['Comps!' + input]);
const median = xs => { const s = [...xs].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
/** QUARTILE.INC: linear interpolation at (n-1)·k/4. */
const quartile = (xs, k) => { const s = [...xs].sort((a, b) => a - b), h = (s.length - 1) * k / 4, lo = Math.floor(h); return s[lo] + (h - lo) * ((s[lo + 1] ?? s[lo]) - s[lo]); };

const ltmOk = ses => CR.every((r, i) => fx(ses, 'J' + r, ['G', 'H', 'I', 'J'].reduce((t, c) => t + v(ses, c + QR[i]), 0)));
const evOk = ses => CR.every(r => fx(ses, 'E' + r, v(ses, 'C' + r) * v(ses, 'D' + r)) && fx(ses, 'H' + r, v(ses, 'E' + r) + v(ses, 'F' + r) - v(ses, 'G' + r)) && fx(ses, 'L' + r, v(ses, 'H' + r) / v(ses, 'J' + r)));
const calOk = ses => { const w = 3 / 12; return fx(ses, 'O' + QM, v(ses, 'K' + QM) * w + v(ses, 'L' + QM) * (1 - w)); };
const mults = ses => CR.map(r => v(ses, 'L' + r));
const statsOk = ses => { const m = mults(ses); return fx(ses, 'L' + MED, median(m)) && fx(ses, 'L' + LOW, quartile(m, 1)) && fx(ses, 'L' + HIGH, quartile(m, 3)); };
const siteOk = ses => CR.every(r => fx(ses, 'W' + r, v(ses, 'H' + r) / v(ses, 'R' + r) / 1000)) && fx(ses, 'W' + MED, median(CR.map(r => v(ses, 'W' + r))));
const ebitda = ses => sheetIn(ses, 'IS').value('E24');
const rangeOk = ses => { const m = mults(ses); const st = [quartile(m, 1), median(m), quartile(m, 3)];
  return ['C', 'D', 'E'].every((c, i) => fx(ses, c + RM, st[i]) && fx(ses, c + RE, st[i] * ebitda(ses))); };

// the cells to build arrive in the page's format (the base page's look, row for row); the site counts arrive typed
const DONE = cellsIn('DONE');
const fmt = c => { if (!c) return {}; const { value, formula, ...rest } = c; void value; void formula; return JSON.parse(JSON.stringify(rest)); };
const plant = {};
const lay = (ref, from) => { plant['Comps!' + ref] = fmt(DONE[from]); };
CR.forEach((r, i) => { const from = i === 0 ? 5 : 6; for (const c of ['E', 'H', 'J', 'L', 'W']) lay(c + r, c + from); plant['Comps!R' + r] = { ...fmt(DONE['R' + from]), value: ALT.comps[i].sites }; });
lay('N' + QM, 'N22'); lay('O' + QM, 'O22');
lay('L' + MED, 'O11'); lay('L' + LOW, 'O13'); lay('L' + HIGH, 'O14'); lay('W' + MED, 'Y11');
['C', 'D', 'E'].forEach(c => { lay(c + RM, c + 44); lay(c + RE, c + 45); });

const KEYS = {
  ltm: `Ctrl+G "Comps!J${CR[0]}:J${CR[N - 1]}" ↵ "=SUM(G${QR[0]}:J${QR[0]})" Ctrl+↵`,
  ev: `Ctrl+G "Comps!E${CR[0]}:E${CR[N - 1]}" ↵ "=C${CR[0]}*D${CR[0]}" Ctrl+↵ Ctrl+G "Comps!H${CR[0]}:H${CR[N - 1]}" ↵ "=E${CR[0]}+F${CR[0]}-G${CR[0]}" Ctrl+↵ Ctrl+G "Comps!L${CR[0]}:L${CR[N - 1]}" ↵ '=IF(J${CR[0]}>0,H${CR[0]}/J${CR[0]},"NM")' Ctrl+↵`,
  cal: `Ctrl+G "Comps!N${QM}" ↵ "=MONTH(M${QM})/12" ↵ → "=K${QM}*N${QM}+L${QM}*(1-N${QM})" ↵`,
  stats: `Ctrl+G "Comps!L${MED}" ↵ "=MEDIAN(L${CR[0]}:L${CR[N - 1]})" ↵ ↓ ↓ "=QUARTILE.INC(L${CR[0]}:L${CR[N - 1]},1)" ↵ ↓ "=QUARTILE.INC(L${CR[0]}:L${CR[N - 1]},3)" ↵`,
  site: `Ctrl+G "Comps!W${CR[0]}:W${CR[N - 1]}" ↵ "=H${CR[0]}/R${CR[0]}/1000" Ctrl+↵ Ctrl+G "Comps!W${MED}" ↵ "=MEDIAN(W${CR[0]}:W${CR[N - 1]})" ↵`,
  range: `Ctrl+G "Comps!C${RM}" ↵ "=L${LOW}" ↵ → "=L${MED}" ↵ → "=L${HIGH}" ↵ Ctrl+G "Comps!C${RE}:E${RE}" ↵ "=C${RM}*${EBITDA_REF}" Ctrl+↵`,
};
const toScript = s => s.replace(/↵/g, 'Enter').replace(/↓/g, 'Down').replace(/→/g, 'Right');

export default {
  id: ID,
  chapter: 'valuation',
  section: 'Trading comps',
  module: 'trading-comps',
  workbook: 'clearcoat-valuation',
  state: { before: 'B61C' },
  plant,
  kind: 'challenge',
  title: 'Challenge: three comps spread and a range applied',
  difficulty: 'hard',
  tags: ['challenge', 'valuation', 'comps'],
  access: 'paid',
  minutes: 3,
  conventions: ['C3', 'F4'],
  prerequisites: ['applying-the-range'],
  brief: 'Three fresh comps arrive on Comps with their quarters and site counts. Build LTM, the EV build, calendarize the March company, take the median and quartiles, add EV per site, and apply the range to Clearcoat.',
  timeLimit: 180,
  pars: parsFrom(120, { pass: 178, pro: 140 }),
  seed: rng => challengeSeed(ID, rng),
  goals: [
    { id: 'ltm', text: `LTM EBITDA in J${CR[0]}:J${CR[N - 1]}: each comp’s last four quarters, from its row in the quarters block.`,
      keys: KEYS.ltm, check: (s, ses) => settled(ses) && ltmOk(ses) && live(ses, 'J' + CR[0], 'J' + QR[0]) },
    { id: 'ev', text: `The EV build in E${CR[0]}:E${CR[N - 1]}, H${CR[0]}:H${CR[N - 1]} and L${CR[0]}:L${CR[N - 1]}: market cap, EV, and EV / EBITDA with NM where EBITDA isn’t positive.`,
      keys: KEYS.ev, check: (s, ses) => settled(ses) && evOk(ses) && live(ses, 'L' + CR[0], 'C' + CR[0]) },
    { id: 'cal', text: `Calendarize ${ALT.comps[MARCH].name}: its weight in N${QM} from its year end in M${QM}, and calendar 2025 in O${QM}.`,
      keys: KEYS.cal, check: (s, ses) => settled(ses) && calOk(ses) && live(ses, 'O' + QM, 'M' + QM) },
    { id: 'stats', text: `The median of EV / EBITDA in L${MED}, and the low and high quartiles in L${LOW} and L${HIGH}.`,
      keys: KEYS.stats, check: (s, ses) => settled(ses) && statsOk(ses) && live(ses, 'L' + MED, 'C' + CR[0]) },
    { id: 'site', text: `EV per site in $m in W${CR[0]}:W${CR[N - 1]}, and its median in W${MED}.`,
      keys: KEYS.site, check: (s, ses) => settled(ses) && siteOk(ses) && live(ses, 'W' + MED, 'R' + CR[0]) },
    { id: 'range', text: `Apply the range: low, median and high in C${RM}:E${RM}, times Clearcoat’s FY26E EBITDA (IS!E24) in C${RE}:E${RE}.`,
      keys: KEYS.range, check: (s, ses) => settled(ses) && rangeOk(ses) && live(ses, 'D' + RE, 'C' + CR[0]) },
  ],
  graders: [
    ses => ltmOk(ses) ? { ok: true } : { ok: false, why: 'an LTM figure isn’t the last four quarters. Sum the four quarters ending June 2026 on each comp’s row of the quarters block' },
    ses => evOk(ses) ? { ok: true } : { ok: false, why: 'the EV build is off. Market cap is price times shares; EV adds debt and takes off cash; the multiple is EV over LTM EBITDA' },
    ses => calOk(ses) ? { ok: true } : { ok: false, why: 'calendar 2025 is off. A March year weights fiscal 2025 by 3/12 and fiscal 2026 by 9/12, the weight from MONTH of the year end over 12' },
    ses => statsOk(ses) ? { ok: true } : { ok: false, why: 'the median or a quartile is off. MEDIAN and QUARTILE.INC with 1 and 3, each on the three multiples' },
    ses => siteOk(ses) ? { ok: true } : { ok: false, why: 'EV per site is off. EV in thousands over sites, over 1,000 more for $m, and MEDIAN of the three' },
    ses => rangeOk(ses) ? { ok: true } : { ok: false, why: 'the range is off. Low, median and high read the quartiles and the median, each times Clearcoat’s FY26E EBITDA on IS' },
  ],
  solution: toScript(Object.values(KEYS).join(' ')),
};
