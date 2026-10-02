// Chapter 3 · 3.3.C Challenge: the export rolled up to a site × package summary (seeded over S2e)
// A fresh fortnight's export from the San Antonio cluster, clean this time, laid over the module's
// start: the site codes on Summary and every row of Transactions change with the seed, and the
// managers' tallies sit in the reconciliation block with its links and formulas, two sites out by
// one and two washes. The challenge counts washes by site and totals them, the average retail
// ticket, the rank, the site by package counts and revenue, the retail washes by package with the
// SUMPRODUCT and the blended ticket, and the two adjustments that bring the check to zero. Seeds
// pick the export; the workload never moves: the same keys pass every seed.
import { SAN_ANTONIO, PACKAGES, TX_FIRST, TX_ROWS, memoOf, stateOf } from '../workbooks/clearcoat-databook.js';
import { summary, settled, block, calls, near, isNum, live, exportRows, countRows, sumRows, atSite, ofPackage, amountOver, isRetailRow, totalOf, liveValue } from './lib/databook-checks.js';
import { parsFrom } from '../../app/pars.js';

const CODES = SAN_ANTONIO.sites.map(s => s.code);
const CHANNELS = ['kiosk', 'app', 'attendant'];
const OFFSET = { 53: 1, 55: 2 };   // the managers who over-counted: Medical Center by one, Brooks by two

/** The seed: a fresh, clean export for the San Antonio cluster, the codes on Summary, and the reconciliation block with the managers' tallies. */
export function seedExport(rng) {
  const base = stateOf('S2e');
  const sum = base.sheets.find(s => s.name === 'Summary').cells;
  const pick = arr => arr[Math.floor(rng() * arr.length)];
  const p = {};
  const counts = CODES.map(() => 0);
  for (let i = 0; i < TX_ROWS; i++) {
    const r = TX_FIRST + i;
    const s = i < CODES.length ? i : Math.floor(rng() * CODES.length);   // every site has a retail wash, so every average has a denominator
    const member = i >= CODES.length && rng() < 0.4;
    const pkg = pick(['B', 'D', 'D', 'U']);
    const t = { site: CODES[s], pkg, channel: pick(CHANNELS) };
    counts[s]++;
    p[`Transactions!B${r}`] = { value: t.site };
    p[`Transactions!C${r}`] = { value: pkg };
    p[`Transactions!D${r}`] = member ? { value: 'M' + String(1 + Math.floor(rng() * 40)).padStart(4, '0') } : null;
    p[`Transactions!E${r}`] = { value: member ? 0 : PACKAGES.find(x => x.code === pkg).price };
    p[`Transactions!F${r}`] = { value: memoOf(t) };
  }
  CODES.forEach((c, i) => { for (const r of [15 + i, 41 + i, 51 + i]) p[`Summary!B${r}`] = { ...sum['B' + r], value: c }; });
  for (let i = 0; i < 6; i++) {
    const r = 51 + i;
    p[`Summary!C${r}`] = { ...sum['C' + r], formula: `=C${15 + i}` };
    p[`Summary!D${r}`] = { ...sum['D' + r], value: counts[i] + (OFFSET[r] || 0), fontColor: 'blue' };
    p[`Summary!E${r}`] = { ...sum['E' + r], formula: `=D${r}-C${r}` };
    p[`Summary!H${r}`] = { ...sum['H' + r], formula: `=D${r}+G${r}` };
    p[`Summary!I${r}`] = { ...sum['I' + r], formula: `=H${r}-C${r}` };
  }
  return p;
}

const code = (sh, r) => sh.value('B' + r);
const rows = ses => exportRows(ses);
const siteCounts = (ses, sh) => block(sh, 'C', 15, 20, { fns: ['COUNTIF'], want: r => countRows(rows(ses), atSite(code(sh, r))) }) && totalOf(sh, 'C', 15, 20, 21);
const ticket = (ses, sh) => block(sh, 'G', 15, 20, { fns: ['AVERAGEIFS'], want: r => sumRows(rows(ses), 'amount', atSite(code(sh, r)), amountOver(0)) / countRows(rows(ses), atSite(code(sh, r)), amountOver(0)) });
const washes = sh => [15, 16, 17, 18, 19, 20].map(r => sh.value('C' + r));
const ranks = sh => block(sh, 'K', 15, 20, { fns: ['RANK'], want: r => 1 + washes(sh).filter(v => isNum(v) && v > sh.value('C' + r)).length });
const cross = (ses, sh) => ['C', 'D', 'E'].every(col => block(sh, col, 41, 46, { fns: ['COUNTIFS'], liveRef: null, want: r => countRows(rows(ses), atSite(code(sh, r)), ofPackage(sh.value(col + '40'))) }))
  && ['F', 'G', 'H'].every(col => block(sh, col, 41, 46, { fns: ['SUMIFS'], liveRef: null, want: r => sumRows(rows(ses), 'amount', atSite(code(sh, r)), ofPackage(sh.value(col + '40'))) }));
const dot = sh => [25, 26, 27].reduce((t, r) => t + sh.value('D' + r) * sh.value('E' + r), 0);
const blended = (ses, sh) => block(sh, 'D', 25, 27, { fns: ['COUNTIFS'], want: r => countRows(rows(ses), ofPackage(sh.value('B' + r)), isRetailRow) })
  && calls(sh, 'C29', ['SUMPRODUCT']) && liveValue(sh, 'C29', dot(sh)) && liveValue(sh, 'C30', sh.value('C29') / sh.value('C21'));
const recon = sh => !!sh && [51, 52, 53, 54, 55, 56].every(r => near(sh.value('I' + r), 0)) && [53, 55].every(r => isNum(sh.value('G' + r)) && !sh.cellAt('G' + r).formula);
const SEL5 = 'Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down';
const F = {
  site: '=COUNTIF(Transactions!$B$5:$B$94,B15)',
  avg: '=AVERAGEIFS(Transactions!$E$5:$E$94,Transactions!$B$5:$B$94,B15,Transactions!$E$5:$E$94,">0")',
  rank: '=RANK(C15,$C$15:$C$20)',
  count: '=COUNTIFS(Transactions!$B$5:$B$94,$B41,Transactions!$C$5:$C$94,C$40)',
  sum: '=SUMIFS(Transactions!$E$5:$E$94,Transactions!$B$5:$B$94,$B41,Transactions!$C$5:$C$94,F$40)',
  pkgRetail: '=COUNTIFS(Transactions!$C$5:$C$94,B25,Transactions!$D$5:$D$94,"")',
  sp: '=SUMPRODUCT(D25:D27,E25:E27)',
  blended: '=C29/C21',
};
const q = f => `'${f}'`;

export default {
  id: 'challenge-site-package-summary',
  chapter: 'formulas',
  section: 'Math and aggregation',
  module: 'math-and-aggregation',
  workbook: 'clearcoat-databook',
  state: { before: 'S2e' },
  kind: 'challenge',
  title: 'Challenge: the export rolled up to a site × package summary',
  difficulty: 'hard',
  tags: ['challenge', 'formulas', 'aggregation', 'reconciliation'],
  access: 'paid',
  minutes: 3,
  conventions: ['F1', 'B1', 'E5'],
  prerequisites: ['the-reconciliation'],
  brief: 'A fresh export from the San Antonio cluster. Count and sum it by site and package, rank the sites, price the blended ticket, and bring the reconciliation check to zero.',
  timeLimit: 180,
  pars: parsFrom(110, { pass: 178, pro: 140 }),
  seed: rng => seedExport(rng),
  goals: [
    { id: 'site-counts', text: 'Count the washes by site in C15:C20 with COUNTIF on Transactions!$B$5:$B$94, and total them in C21 with Alt+=.',
      keys: `→ Ctrl+↓ ×4 → Shift+↓ ×5 "${F.site}" Ctrl+↵ Ctrl+↓ ↓ Alt+= ↵`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && siteCounts(ses, sh); } },
    { id: 'ticket', text: 'The average retail ticket by site in G15:G20: AVERAGEIFS of the amounts on the site, with the amounts ">0".',
      keys: `Ctrl+↑ ↓ Tab ×4 Shift+↓ ×5 ${q(F.avg)} Ctrl+↵`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && ticket(ses, sh); } },
    { id: 'rank', text: 'Rank the sites by washes in K15:K20 with =RANK(C15,$C$15:$C$20).',
      keys: `→ Tab ×3 Shift+↓ ×5 "${F.rank}" Ctrl+↵`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && ranks(sh); } },
    { id: 'cross', text: 'Fill the site by package block: washes with COUNTIFS in C41:E46, retail revenue with SUMIFS in F41:H46.',
      keys: `Ctrl+G "C41:E46" ↵ "${F.count}" Ctrl+↵ Ctrl+→ → Shift+↓ ×5 Shift+→ ×2 "${F.sum}" Ctrl+↵`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && cross(ses, sh); } },
    { id: 'blended', text: 'Retail washes by package in D25:D27, C29 =SUMPRODUCT(D25:D27,E25:E27), and the blended ticket in C30 =C29/C21.',
      keys: `Ctrl+↑ ×2 ← ×2 Ctrl+↑ ↓ Shift+↓ ×2 ${q(F.pkgRetail)} Ctrl+↵ Ctrl+↓ ↓ ↓ ← "${F.sp}" ↵ "${F.blended}" ↵`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && blended(ses, sh); } },
    { id: 'recon', text: 'Two managers over-counted: type the adjustments in G53 and G55 that bring the check in I51:I56 to zero, in blue.',
      keys: 'Ctrl+↓ ×3 ↓ ×3 Ctrl+→ → → "-1" ↵ ↓ "-2" ↵ ↑ ×3 Alt H F C → ×4 ↵ ↓ ↓ F4',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && recon(sh) && ['G53', 'G55'].every(ref => sh.cellAt(ref).fontColor === 'blue'); } },
  ],
  graders: [
    ses => { const sh = summary(ses); if (!sh) return { ok: false, why: 'the Summary sheet is missing' };
      for (const ref of ['C15', 'G15', 'K15', 'C41', 'F41', 'D25']) if (!live(sh, ref)) return { ok: false, why: `${ref} does not move with the export. Every figure on the summary is a live formula that reads it` };
      return { ok: true }; },
    ses => { const sh = summary(ses); if (!sh) return { ok: false, why: 'the Summary sheet is missing' };
      for (const ref of ['G53', 'G55']) if (sh.cellAt(ref).fontColor !== 'blue') return { ok: false, why: `${ref} is a typed adjustment shown in black. We color typed inputs blue, so a reviewer sees what was keyed in` };
      return { ok: true }; },
    ses => { const sh = summary(ses); if (!sh) return { ok: false, why: 'the Summary sheet is missing' };
      return recon(sh) ? { ok: true } : { ok: false, why: 'the reconciliation check in I51:I56 does not read zero. Every difference gets an adjustment until the POS and the tallies agree' }; },
  ],
  solution: `Right Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Right ${SEL5} "${F.site}" Ctrl+Enter Ctrl+Down Down Alt+= Enter `
    + `Ctrl+Up Down Tab Tab Tab Tab ${SEL5} ${q(F.avg)} Ctrl+Enter `
    + `Right Tab Tab Tab ${SEL5} "${F.rank}" Ctrl+Enter `
    + `Ctrl+G "C41:E46" Enter "${F.count}" Ctrl+Enter Ctrl+Right Right ${SEL5} Shift+Right Shift+Right "${F.sum}" Ctrl+Enter `
    + `Ctrl+Up Ctrl+Up Left Left Ctrl+Up Down Shift+Down Shift+Down ${q(F.pkgRetail)} Ctrl+Enter Ctrl+Down Down Down Left "${F.sp}" Enter "${F.blended}" Enter `
    + 'Ctrl+Down Ctrl+Down Ctrl+Down Down Down Down Ctrl+Right Right Right "-1" Enter Down "-2" Enter Up Up Up Alt H F C Right Right Right Right Enter Down Down F4',
};
