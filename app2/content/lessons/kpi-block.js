// Chapter 4 · 4.3.2 The KPI block: washes per hour, member share, utilization (clearcoat-pack, S431 → S432)
// Beside the site block on Summary: hours open looked up from Lists, daily capacity, the days each
// site reported, washes, utilization (washes over capacity times days), the peak day and its
// utilization, member washes and member share, with a total row whose ratios are worked from the
// totals. Two of Sponsor A's questions on Q&A then point at the block. The closer raises Airport's
// capacity on Lists: its utilization falls and its washes stay put.
import { summary, qa, exportRows, sumWhere, countWhere, maxWhere, atSite, calls, live, near, isNum, settled, shellOf, refsIn, sameText } from './lib/pack-checks.js';

const R = [5, 6, 7, 8, 9, 10];
const PLANT = [...refsIn('E4:M4'), ...refsIn('E5:M11'), 'B11'];
const F = {
  hours: '=INDEX(Lists!$G$5:$G$10,MATCH($B5,Lists!$B$5:$B$10,0))',
  cap: '=D5*E5',
  days: '=COUNTIFS(Export!$B$5:$B$94,$B5,Export!$G$5:$G$94,">0")',
  washes: '=SUMIFS(Export!$E$5:$E$94,Export!$B$5:$B$94,$B5)',
  util: '=H5/(F5*G5)',
  peak: '=MAXIFS(Export!$E$5:$E$94,Export!$B$5:$B$94,$B5)',
  peakUtil: '=J5/F5',
  member: '=SUMIFS(Export!$D$5:$D$94,Export!$B$5:$B$94,$B5)',
  share: '=L5/H5',
  m11: '=L11/H11', l11: '=SUM(L5:L10)', j11: '=MAX(J5:J10)', i11: '=H11/SUMPRODUCT(F5:F10,G5:G10)', h11: '=SUM(H5:H10)', f11: '=SUM(F5:F10)',
};
const rows = ses => exportRows(ses);
const site = (sh, r) => sh.value('B' + r);
const all = (sh, col, ok) => R.every(r => ok(r) && !!sh.formula(col + r));
const hours = (ses, sh) => all(sh, 'E', r => /Lists!/i.test(sh.formula('E' + r) || '') && isNum(sh.value('E' + r)) && sh.value('E' + r) === 14);
const capacity = (ses, sh) => all(sh, 'F', r => near(sh.value('F' + r), sh.value('D' + r) * sh.value('E' + r)))
  && all(sh, 'G', r => calls(sh, 'G' + r, ['COUNTIFS']) && sh.value('G' + r) === countWhere(rows(ses), atSite(site(sh, r)), x => isNum(x.hours) && x.hours > 0));
const washes = (ses, sh) => all(sh, 'H', r => calls(sh, 'H' + r, ['SUMIFS']) && near(sh.value('H' + r), sumWhere(rows(ses), 'total', atSite(site(sh, r)))));
const util = (ses, sh) => washes(ses, sh) && all(sh, 'I', r => near(sh.value('I' + r), sh.value('H' + r) / (sh.value('F' + r) * sh.value('G' + r))));
const peak = (ses, sh) => all(sh, 'J', r => calls(sh, 'J' + r, ['MAXIFS']) && sh.value('J' + r) === maxWhere(rows(ses), 'total', atSite(site(sh, r))))
  && all(sh, 'K', r => near(sh.value('K' + r), sh.value('J' + r) / sh.value('F' + r)));
const member = (ses, sh) => all(sh, 'L', r => calls(sh, 'L' + r, ['SUMIFS']) && near(sh.value('L' + r), sumWhere(rows(ses), 'member', atSite(site(sh, r)))))
  && all(sh, 'M', r => near(sh.value('M' + r), sh.value('L' + r) / sh.value('H' + r)));
const col = (sh, c) => R.map(r => sh.value(c + r));
const sum = a => a.reduce((t, x) => t + x, 0);
const totals = sh => near(sh.value('F11'), sum(col(sh, 'F'))) && near(sh.value('H11'), sum(col(sh, 'H'))) && near(sh.value('L11'), sum(col(sh, 'L'))) && sh.value('J11') === Math.max(...col(sh, 'J'))
  && near(sh.value('I11'), sh.value('H11') / R.reduce((t, r) => t + sh.value('F' + r) * sh.value('G' + r), 0)) && near(sh.value('M11'), sh.value('L11') / sh.value('H11'))
  && ['F11', 'H11', 'I11', 'J11', 'L11', 'M11'].every(ref => !!sh.formula(ref));
const answered = (ses, row, ref) => { const q = qa(ses), sh = summary(ses); return sameText(q.value('E' + row), 'Answered') && /Summary!/i.test(q.formula('F' + row) || '') && near(q.value('F' + row), sh.value(ref)); };

export default {
  id: 'kpi-block',
  chapter: 'data-and-lookups',
  section: 'Summaries from raw rows',
  module: 'summaries-from-raw-rows',
  workbook: 'clearcoat-pack',
  state: { before: 'S431', after: 'S432' },
  plant: shellOf('S432', { Summary: PLANT, 'Q&A': ['F6', 'F7'] }, { keepText: true }),
  title: 'The KPI block: washes per hour, member share, utilization',
  difficulty: 'hard',
  tags: ['formulas', 'kpi', 'summary'],
  access: 'paid',
  minutes: 7,
  headline: 'INDEX',
  conventions: ['C3', 'B2'],
  teaches: ['kpi-ratios'],
  uses: ['sumifs-cube', 'sumif-sumifs', 'countif-countifs', 'maxifs-minifs', 'criteria-operators', 'sumproduct', 'relative-absolute', 'cross-sheet-ref', 'ctrl-enter-fill', 'go-to', 'shift-arrow', 'arrow-keys', 'ctrl-arrow', 'type-to-enter', 'tab-commits'],
  prerequisites: ['sumifs-cube'],
  brief: 'Utilization is washes done against washes the tunnel could do, capacity in cars an hour times hours open, and an express wash runs well under half on an average day and fills on a Saturday, so the peak matters as much as the mean. Member share is member washes over all washes; the higher it is, the steadier the revenue. Both are ratios built from the export and the site list, with a lookup bringing hours in. Build the KPI block by site. The key is `INDEX`.',
  goals: [
    { id: 'hours', text: `Hours open by site in E5:E10 from Lists: ${F.hours} with Ctrl+Enter.`, keys: `Ctrl+G "Summary!E5" ↵ Shift+↓ ×5 "${F.hours}" Ctrl+↵`, requires: ['cross-sheet-ref', 'relative-absolute', 'go-to', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range E5:E10 · Hours open sit in column G on Lists, the codes in column B.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && hours(ses, sh); } },
    { id: 'capacity', text: 'Daily capacity in F5:F10 =D5*E5, and the days each site reported in G5:G10 with COUNTIFS on the site and hours ">0".', keys: `→ Shift+↓ ×5 "${F.cap}" Ctrl+↵ → Shift+↓ ×5 '${F.days}' Ctrl+↵`, requires: ['countif-countifs', 'criteria-operators', 'arrow-keys', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: `pulse range G5:G10 · A day with no hours is a day the site did not report: ${F.days}`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && capacity(ses, sh); } },
    { id: 'utilization', teach: 'A ratio is a figure over the base it is measured against. Utilization is washes over what the tunnel could have done in the days it reported, capacity a day times days, so H5/(F5*G5); percent to one decimal, in italics, like every ratio on the page.', text: 'Washes by site in H5:H10 with SUMIFS on the export, then utilization in I5:I10 =H5/(F5*G5).', keys: `→ Shift+↓ ×5 "${F.washes}" Ctrl+↵ → Shift+↓ ×5 "${F.util}" Ctrl+↵`, requires: ['kpi-ratios', 'sumif-sumifs', 'arrow-keys', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range I5:I10 · The brackets matter: washes over the product of capacity and days.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && util(ses, sh); } },
    { id: 'peak', text: 'The peak day in J5:J10 with MAXIFS on the site, and its utilization in K5:K10 =J5/F5.', keys: `→ Shift+↓ ×5 "${F.peak}" Ctrl+↵ → Shift+↓ ×5 "${F.peakUtil}" Ctrl+↵`, requires: ['maxifs-minifs', 'kpi-ratios', 'arrow-keys', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: `pulse range J5:J10 · ${F.peak}`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && peak(ses, sh); } },
    { id: 'member', text: 'Member washes in L5:L10, a SUMIFS on column D of the export, and member share in M5:M10 =L5/H5.', keys: `→ Shift+↓ ×5 "${F.member}" Ctrl+↵ → Shift+↓ ×5 "${F.share}" Ctrl+↵`, requires: ['sumif-sumifs', 'kpi-ratios', 'arrow-keys', 'shift-arrow', 'ctrl-enter-fill'], convention: 'C3',
      hintStuck: `pulse range L5:L10 · ${F.member}`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && member(ses, sh); } },
    { id: 'totals', text: 'The total row: SUM for F11, H11 and L11, MAX for J11, and the ratios from totals, I11 =H11/SUMPRODUCT(F5:F10,G5:G10) and M11 =L11/H11.', keys: `Ctrl+↓ ↓ "${F.m11}" Shift+Tab "${F.l11}" Shift+Tab ×2 "${F.j11}" Shift+Tab "${F.i11}" Shift+Tab "${F.h11}" Shift+Tab ×2 "${F.f11}" ↵`, requires: ['kpi-ratios', 'sum-family', 'sumproduct', 'ctrl-arrow', 'arrow-keys', 'tab-commits'],
      hintStuck: 'pulse range F11:M11 · An average of six ratios is not the cluster’s ratio: divide the totals.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && totals(sh); } },
    { id: 'answer', text: 'On Q&A, set questions 2 and 3 to Answered and point their answers at Summary: F6 =Summary!I5 and F7 =Summary!M11.', keys: 'Ctrl+G "\'Q&A\'!E6" ↵ "Answered" Tab "=Summary!I5" ↵ "Answered" Tab "=Summary!M11" ↵', requires: ['cross-sheet-ref', 'go-to', 'tab-commits'], convention: 'B2',
      hintStuck: 'pulse range E6:F7 · An answer is a link to the cell that holds it, never a typed figure.',
      check: (s, ses) => settled(ses) && answered(ses, 6, 'I5') && answered(ses, 7, 'M11') },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Lists!F9" Enter "160" Enter Ctrl+G "Summary!I9" Enter Escape', cadence: 320 }, text: 'Does it tie? Watch Airport’s capacity on Lists go to 160: its utilization in I9 falls and its washes in H9 stay put.', requires: [],
      hintStuck: 'pulse cell I9 · Capacity sits under the ratio, not over it.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'E5:M10 hold the KPI block by site, every cell a live formula', check: (s, ses) => { const sh = summary(ses); return hours(ses, sh) && capacity(ses, sh) && util(ses, sh) && peak(ses, sh) && member(ses, sh); } },
    { text: 'Row 11 totals the block, its ratios worked from the totals', check: (s, ses) => totals(summary(ses)) },
    { text: 'Questions 2 and 3 on Q&A are answered by links to Summary', check: (s, ses) => answered(ses, 6, 'I5') && answered(ses, 7, 'M11') },
  ],
  closing: [
    'Utilization and member share are built by site, and two of the buyers’ questions point at them.',
    'Best practice: a ratio on a total row is worked from the totals, never an average of the rows above, because six sites of different sizes do not weigh the same. Read the peak beside the mean: a site at a third of capacity on average can still turn cars away on a Saturday.',
  ],
  solution: `Ctrl+G "Summary!E5" Enter Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "${F.hours}" Ctrl+Enter `
    + ['cap', 'days', 'washes', 'util', 'peak', 'peakUtil', 'member', 'share'].map(k => `Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down '${F[k]}' Ctrl+Enter `).join('')
    + `Ctrl+Down Down "${F.m11}" Shift+Tab "${F.l11}" Shift+Tab Shift+Tab "${F.j11}" Shift+Tab "${F.i11}" Shift+Tab "${F.h11}" Shift+Tab Shift+Tab "${F.f11}" Enter `
    + 'Ctrl+G "\'Q&A\'!E6" Enter "Answered" Tab "=Summary!I5" Enter "Answered" Tab "=Summary!M11" Enter',
};
