// Chapter 3 · 3.2.C Challenge: a fiscal-quarter timeline and an age table (seeded over S1d)
// The module's starting sheet with a fresh site register and a fresh export: the seed moves the
// opening dates on Sites (the newest site opened within the month), the as-of date and the
// export's ninety dates by the same number of days, anywhere in a year either side, so fiscal
// years, halves and weekends land differently every time. Six goals graded on values and
// liveness: YEARFRAC ages, vintages, month and quarter keys, the buyer's June fiscal year and
// half, a weekend flag and trading days. Graders hold every column live and the month key as text.
import { workbookState } from '../workbooks/index.js';
import { liveness } from '../../app/graders.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const sites = ses => sheetOf(ses, 'Sites');
const tx = ses => sheetOf(ses, 'Transactions');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const same = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) < 1e-9 : a === b);
const ROWS = [5, 6, 7, 8, 9, 10];
const ALL = Array.from({ length: 90 }, (_, i) => 5 + i);
const EPOCH = Date.UTC(1899, 11, 30);
const parts = n => { const d = new Date(EPOCH + Math.floor(n) * 864e5); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), wd: (d.getUTCDay() + 6) % 7 + 1 }; };
const lastOfFeb = p => p.m === 2 && p.d === new Date(Date.UTC(p.y, 2, 0)).getUTCDate();
/** YEARFRAC with no basis: US 30/360, Excel's month-end rules. */
const yearfrac = (a, b) => {
  if (a > b) [a, b] = [b, a];
  const s = parts(a), e = parts(b); let d1 = s.d, d2 = e.d;
  if (lastOfFeb(s) && lastOfFeb(e)) d2 = 30;
  if (lastOfFeb(s)) d1 = 30;
  if (d2 === 31 && d1 >= 30) d2 = 30;
  if (d1 === 31) d1 = 30;
  return ((e.y - s.y) * 360 + (e.m - s.m) * 30 + (d2 - d1)) / 360;
};
const holidays = si => [si.value('C13'), si.value('C14')].filter(isNum).map(Math.floor);
const tradingDays = (si, r) => { const h = holidays(si); let n = 0; for (let d = Math.floor(si.value('E' + r)); d <= Math.floor(si.value('I5')); d++) if (!h.includes(d)) n++; return n; };
const SITE = {
  K: (si, r) => yearfrac(si.value('E' + r), si.value('I5')),
  P: (si, r) => parts(si.value('E' + r)).y,
  R: tradingDays,
};
const TX = {
  G: (sh, r) => { const p = parts(sh.value('A' + r)); return `${p.y}-${String(p.m).padStart(2, '0')}`; },
  I: (sh, r) => Math.ceil(parts(sh.value('A' + r)).m / 3),
  L: (sh, r) => { const p = parts(sh.value('A' + r)); return p.m >= 7 ? p.y + 1 : p.y; },
  M: (sh, r) => (parts(sh.value('A' + r)).m >= 7 ? 'H1' : 'H2'),
  Q: (sh, r) => (parts(sh.value('A' + r)).wd >= 6 ? 1 : 0),
};
/** One live row is enough: a flag on a row the probes cannot flip still counts when its neighbours move. */
const liveSome = (sh, col, rows) => rows.some(r => liveness(sh, col + r).ok);
const siteCol = (ses, col) => { const si = sites(ses); return !!si && ROWS.every(r => same(si.value(col + r), SITE[col](si, r))) && liveSome(si, col, ROWS); };
const txCol = (ses, col) => { const sh = tx(ses); return !!sh && ALL.every(r => same(sh.value(col + r), TX[col](sh, r))) && liveSome(sh, col, [5, 94, ...ALL]); };

/* ---------------- the seed: a fresh register and export over S1d ---------------- */

const BASE = workbookState('clearcoat-databook', 'S1d');
const cellIn = (name, ref) => { const sh = BASE.sheets.find(s => s.name === name); return (sh && sh.cells[ref]) || {}; };
const put = (p, name, ref, rec) => { p[`${name}!${ref}`] = { ...cellIn(name, ref), ...rec }; };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const label = n => { const p = parts(n); return `${MON[p.m - 1]} ${p.d}, ${p.y}`; };
export function seed(rng) {
  const shift = Math.floor(rng() * 361) - 180;   // the export moves up to half a year either way
  const asOf = cellIn('Sites', 'I5').value + shift;
  const p = {};
  put(p, 'Sites', 'I5', { value: asOf });
  put(p, 'Sites', 'A1', { value: `Clearcoat Express: Austin sites, as of ${label(asOf)}` });
  ROWS.forEach((r, i) => {
    // five sites opened two to nine years back, the sixth inside the last month
    const opened = i === 5 ? asOf - 3 - Math.floor(rng() * 25) : asOf - Math.floor(365 * (2 + rng() * 7));
    put(p, 'Sites', 'E' + r, { value: opened });
  });
  let first = Infinity, last = -Infinity;
  ALL.forEach(r => { const v = cellIn('Transactions', 'A' + r).value + shift; first = Math.min(first, v); last = Math.max(last, v); put(p, 'Transactions', 'A' + r, { value: v }); });
  put(p, 'Transactions', 'A1', { value: `Clearcoat Express: Austin POS export, ${label(first)} to ${label(last)}` });
  return p;
}

export default {
  id: 'challenge-timeline-and-age',
  chapter: 'formulas',
  section: 'Dates',
  module: 'dates',
  workbook: 'clearcoat-databook',
  state: { before: 'S1d' },
  kind: 'challenge',
  title: 'Challenge: a fiscal-quarter timeline and an age table',
  difficulty: 'hard',
  tags: ['challenge', 'formulas', 'dates', 'yearfrac', 'fiscal-year'],
  access: 'paid',
  minutes: 3,
  conventions: ['E3'],
  prerequisites: ['trading-calendar'],
  brief: 'A fresh site register and POS export. Age every site with YEARFRAC, give it a vintage and its trading days, and give every wash its month and quarter keys, the buyer’s June fiscal year and half, and a weekend flag.',
  timeLimit: 180,
  pars: parsFrom(80, { pass: 170, pro: 120 }),
  seed,
  goals: [
    { id: 'age', text: 'On Sites, age each site in years with YEARFRAC from its opening date in E5:E10 to the as-of date in I5, in K5:K10.',
      keys: 'Ctrl+G "Sites!K5" ↵ Shift+↓ ×5 "=YEARFRAC(E5,$I$5)" Ctrl+↵',
      check: (s, ses) => settled(ses) && siteCol(ses, 'K') },
    { id: 'vintage', text: 'Give each site its vintage, the year it opened, in P5:P10.',
      keys: 'Ctrl+G "Sites!P5" ↵ Shift+↓ ×5 "=YEAR(E5)" Ctrl+↵',
      check: (s, ses) => settled(ses) && siteCol(ses, 'P') },
    { id: 'keys', text: 'On Transactions, write the month key as text, like 2026-09, in G5:G94 and the quarter number in I5:I94.',
      keys: `Ctrl+G "Transactions!G5:G94" ↵ '=TEXT(A5,"yyyy-mm")' Ctrl+↵ Ctrl+G "Transactions!I5:I94" ↵ "=ROUNDUP(MONTH(A5)/3,0)" Ctrl+↵`,
      check: (s, ses) => settled(ses) && txCol(ses, 'G') && txCol(ses, 'I') },
    { id: 'fiscal', text: 'The buyer’s fiscal year ends June 30: its year in L5:L94 and its half, H1 or H2, in M5:M94.',
      keys: `Ctrl+G "Transactions!L5:L94" ↵ "=IF(MONTH(A5)>=7,YEAR(A5)+1,YEAR(A5))" Ctrl+↵ Ctrl+G "Transactions!M5:M94" ↵ '=IF(MONTH(A5)>=7,"H1","H2")' Ctrl+↵`,
      check: (s, ses) => settled(ses) && txCol(ses, 'L') && txCol(ses, 'M') },
    { id: 'weekend', text: 'Flag every Saturday and Sunday wash 1, and every weekday wash 0, in Q5:Q94.',
      keys: `Ctrl+G "Transactions!Q5:Q94" ↵ "=IF(WEEKDAY(A5,2)>=6,1,0)" Ctrl+↵`,
      check: (s, ses) => settled(ses) && txCol(ses, 'Q') },
    { id: 'trading', text: 'On Sites, count each site’s trading days in R5:R10: seven days a week from opening to the as-of date, less the holidays in C13:C14.',
      keys: `Ctrl+G "Sites!R5" ↵ Shift+↓ ×5 '=NETWORKDAYS.INTL(E5,$I$5,"0000000",$C$13:$C$14)' Ctrl+↵`,
      check: (s, ses) => settled(ses) && siteCol(ses, 'R') },
  ],
  graders: [
    ses => { const si = sites(ses), sh = tx(ses); if (!si || !sh) return { ok: false, why: 'a sheet is missing' };
      for (const col of ['K', 'P', 'R']) if (!liveSome(si, col, ROWS)) return liveness(si, col + '5');
      for (const col of ['G', 'I', 'L', 'M', 'Q']) if (!liveSome(sh, col, [5, 94, ...ALL])) return liveness(sh, col + '5');
      return { ok: true }; },
    ses => { const sh = tx(ses); if (!sh) return { ok: false, why: 'the Transactions sheet is missing' };
      const r = ALL.find(x => typeof sh.value('G' + x) !== 'string');
      return r ? { ok: false, why: `G${r} holds a date, not the month key as text. TEXT writes the key so it counts and sorts` } : { ok: true }; },
  ],
  solution: `Ctrl+G "Sites!K5" Enter Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "=YEARFRAC(E5,$I$5)" Ctrl+Enter Ctrl+G "Sites!P5" Enter Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "=YEAR(E5)" Ctrl+Enter Ctrl+G "Transactions!G5:G94" Enter '=TEXT(A5,"yyyy-mm")' Ctrl+Enter Ctrl+G "Transactions!I5:I94" Enter "=ROUNDUP(MONTH(A5)/3,0)" Ctrl+Enter Ctrl+G "Transactions!L5:L94" Enter "=IF(MONTH(A5)>=7,YEAR(A5)+1,YEAR(A5))" Ctrl+Enter Ctrl+G "Transactions!M5:M94" Enter '=IF(MONTH(A5)>=7,"H1","H2")' Ctrl+Enter Ctrl+G "Transactions!Q5:Q94" Enter "=IF(WEEKDAY(A5,2)>=6,1,0)" Ctrl+Enter Ctrl+G "Sites!R5" Enter Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down '=NETWORKDAYS.INTL(E5,$I$5,"0000000",$C$13:$C$14)' Ctrl+Enter`,
};
