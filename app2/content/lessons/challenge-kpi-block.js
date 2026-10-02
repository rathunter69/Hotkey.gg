// Chapter 4 · 4.3.C Challenge: a KPI block that ties to the export (seeded over S43C)
// A fresh fortnight's export lands on Export, and head office's site tabs carry its weekly figures.
// The KPI page has lost its utilization and member share columns, the washes cube, the window's
// washes and the two cube checks; question 9 on the log is open again. Rebuild them so every check
// reads zero and the log points at the answer. Seeds pick the export; the workload never moves.
import { workbookState } from '../workbooks/index.js';
import { EXPORT, SITES, WEEKS, exportRows as buildRows } from '../workbooks/clearcoat-pack.js';
import { summary, qa, exportRows, sumWhere, atSite, inWeek, between, calls, live, near, settled, refsIn, sameText } from './lib/pack-list-checks.js';
import { parsFrom } from '../../app/pars.js';

const R = [5, 6, 7, 8, 9, 10];
const TAB_ROWS = { 5: 'retail', 6: 'member', 8: 'revenue', 9: 'hours' };
const F = {
  util: '=H5/(F5*G5)',
  share: '=L5/H5',
  corner: '=SUMIFS(Export!$E$5:$E$94,Export!$B$5:$B$94,$B15,Export!$H$5:$H$94,C$14)',
  window: '=SUMIFS(Export!$E$5:$E$94,Export!$A$5:$A$94,">="&C48,Export!$A$5:$A$94,"<="&C49)',
  c72: '=F21-SUM(Export!$E$5:$E$94)',
  c73: '=F31-SUM(Export!$F$5:$F$94)',
  answer: '=Summary!F21',
};
const q = f => `'${f}'`;

/** The seed: a fresh export (figures only; the dates, codes and formulas stay), the site tabs' weekly figures from it, the KPI page's blocks cleared to their formats. */
export function seedKpi(rng) {
  const st = workbookState('clearcoat-pack', 'S43C');
  const cells = name => st.sheets.find(s => s.name === name).cells;
  const ex = cells('Export'), sm = cells('Summary');
  const rows = buildRows({ ...EXPORT, seed: 1 + Math.floor(rng() * 1e6) });
  const p = {};
  const put = (sheet, ref, value, base) => { const b = { ...(base || {}) }; delete b.formula; p[`${sheet}!${ref}`] = value == null ? null : { ...b, value }; };
  rows.forEach((x, i) => {
    const r = 5 + i;
    put('Export', 'C' + r, x.retail, ex['C' + r]); put('Export', 'D' + r, x.member, ex['D' + r]);
    put('Export', 'F' + r, x.revenue, ex['F' + r] || { fmtStyle: 'comma', decimals: 2 }); put('Export', 'G' + r, x.hours, ex['G' + r]);
  });
  for (const s of SITES) {
    const tab = cells(s.tab);
    for (const r in TAB_ROWS) WEEKS.forEach((w, k) => {
      const col = 'CDE'[k]; const v = rows.filter(x => x.code === s.code && x.week === w.key).reduce((t, x) => t + (x[TAB_ROWS[r]] || 0), 0);
      put(s.tab, col + r, Math.round(v * 100) / 100, tab[col + r]);
    });
  }
  const shell = ref => { const b = { ...(sm[ref] || {}) }; delete b.formula; delete b.value; p['Summary!' + ref] = b; };
  [...refsIn('C15:E20'), ...R.map(r => 'I' + r), ...R.map(r => 'M' + r), 'C50', 'C72', 'C73'].forEach(shell);
  p['Q&A!E9'] = { value: 'Open' };
  p['Q&A!F9'] = { fontColor: 'green', fmtStyle: 'custom', numFmt: '#,##0_);(#,##0);"-"_)' };
  return p;
}

const rowsOf = ses => exportRows(ses);
const cube = (ses, sh) => R.every((_, i) => ['C', 'D', 'E'].every(c => calls(sh, c + (15 + i), ['SUMIFS']) && near(sh.value(c + (15 + i)), sumWhere(rowsOf(ses), 'total', atSite(sh.value('B' + (15 + i))), inWeek(sh.value(c + '14')))))) && live(sh, 'E20');
const util = sh => R.every(r => !!sh.formula('I' + r) && near(sh.value('I' + r), sh.value('H' + r) / (sh.value('F' + r) * sh.value('G' + r))));
const share = sh => R.every(r => !!sh.formula('M' + r) && near(sh.value('M' + r), sh.value('L' + r) / sh.value('H' + r)));
const windowed = (ses, sh) => calls(sh, 'C50', ['SUMIFS']) && near(sh.value('C50'), sumWhere(rowsOf(ses), 'total', between(sh.value('C48'), sh.value('C49')))) && live(sh, 'C50');
const checks = sh => ['C72', 'C73'].every(ref => calls(sh, ref, ['SUM']) && near(sh.value(ref), 0)) && sh.value('C77') === 0;
const answered = ses => { const qs = qa(ses); return sameText(qs.value('E9'), 'Answered') && /Summary!/i.test(qs.formula('F9') || '') && near(qs.value('F9'), sumWhere(rowsOf(ses), 'total')); };

export default {
  id: 'challenge-kpi-block',
  chapter: 'data-and-lookups',
  section: 'Summaries from raw rows',
  module: 'summaries-from-raw-rows',
  workbook: 'clearcoat-pack',
  state: { before: 'S43C' },
  kind: 'challenge',
  title: 'Challenge: a KPI block that ties to the export',
  difficulty: 'hard',
  tags: ['challenge', 'formulas', 'kpi', 'summary'],
  access: 'paid',
  minutes: 4,
  conventions: ['F1', 'C3'],
  prerequisites: ['3d-references'],
  brief: 'A fresh export, and the KPI page has lost its ratios, its washes cube, the window and two checks. Rebuild them until every check reads zero, and answer question 9 on the log.',
  timeLimit: 180,
  pars: parsFrom(95, { pass: 175, pro: 120 }),
  seed: rng => seedKpi(rng),
  goals: [
    { id: 'util', text: 'Utilization by site in Summary!I5:I10: washes over daily capacity times days reported.',
      keys: `Ctrl+G "Summary!I5:I10" ↵ "${F.util}" Ctrl+↵`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && util(sh); } },
    { id: 'share', text: 'Member share by site in M5:M10: member washes over washes.',
      keys: `→ Ctrl+→ → Shift+↓ ×5 "${F.share}" Ctrl+↵`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && share(sh); } },
    { id: 'window', text: 'Washes in the window in C50: a SUMIFS between the dates in C48 and C49.',
      keys: `Ctrl+G "C50" ↵ ${q(F.window)} ↵`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && windowed(ses, sh); } },
    { id: 'cube', text: 'The washes cube C15:E20: one SUMIFS on the site $B15 and the week C$14, entered with Ctrl+Enter.',
      keys: `Ctrl+G "C15:E20" ↵ "${F.corner}" Ctrl+↵`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && cube(ses, sh); } },
    { id: 'checks', text: 'Tie both cubes to the export in C72 and C73, so the flag in C77 reads zero.',
      keys: `Ctrl+G "C72" ↵ "${F.c72}" ↵ "${F.c73}" ↵`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && checks(sh); } },
    { id: 'answer', text: 'Answer question 9 on Q&A: E9 Answered, and F9 a link to the washes over the export.',
      keys: `Ctrl+G "'Q&A'!E9" ↵ "Answered" Tab "${F.answer}" ↵`,
      check: (s, ses) => settled(ses) && answered(ses) },
  ],
  graders: [
    ses => (cube(ses, summary(ses)) ? { ok: true } : { ok: false, why: 'the washes cube does not read the export with one live SUMIFS. Anchor the site column and the week row and fill the block' }),
    ses => (summary(ses).value('C77') === 0 ? { ok: true } : { ok: false, why: 'the flag in C77 is not zero. Every check on the page reads zero before it goes out' }),
    ses => (answered(ses) ? { ok: true } : { ok: false, why: 'question 9 is not answered by a link to the page. The log points at a cell, never a typed figure' }),
  ],
  solution: `Ctrl+G "Summary!I5:I10" Enter "${F.util}" Ctrl+Enter Right Ctrl+Right Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "${F.share}" Ctrl+Enter `
    + `Ctrl+G "C50" Enter ${q(F.window)} Enter Ctrl+G "C15:E20" Enter "${F.corner}" Ctrl+Enter `
    + `Ctrl+G "C72" Enter "${F.c72}" Enter "${F.c73}" Enter Ctrl+G "'Q&A'!E9" Enter "Answered" Tab "${F.answer}" Enter`,
};
