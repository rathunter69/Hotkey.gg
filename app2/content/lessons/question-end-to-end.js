// Chapter 4 · 4.3.5 A buyer's question answered end to end (clearcoat-pack, S434 → S435)
// Sponsor C's question 7: revenue per site per open hour in the last week, and which site led. The
// window from 4.3.3 already holds the last seven days; the block under it reads revenue in the
// window by site, open hours as hours a day times days in the window, revenue an hour and its rank,
// and the leader by INDEX and MATCH on rank 1. The log's answer is a formula on the leader and its
// figure, status Answered. The closer moves the window a week back and the answer follows.
import { summary, qa, exportRows, sumWhere, atSite, between, calls, near, isNum, settled, shellOf, refsIn, sameText } from './lib/pack-checks.js';

const R = [55, 56, 57, 58, 59, 60];
const PLANT = ['B53', ...refsIn('C54:F54'), ...refsIn('C55:F60'), 'B61', 'C61', 'D61'];
const F = {
  label: '=$B5',
  rev: '=SUMIFS(Export!$F$5:$F$94,Export!$B$5:$B$94,$B55,Export!$A$5:$A$94,">="&$C$48,Export!$A$5:$A$94,"<="&$C$49)',
  hours: '=E5*($C$49-$C$48+1)',
  perHour: '=C55/D55',
  rank: '=RANK(E55,$E$55:$E$60)',
  leader: '=INDEX($B$55:$B$60,MATCH(1,$F$55:$F$60,0))',
  figure: '=INDEX($E$55:$E$60,MATCH(1,$F$55:$F$60,0))',
  answer: '=Summary!C61&" at "&TEXT(Summary!D61,"$#,##0.00")&" an hour"',
};
const q = f => `'${f}'`;
const formulas = (sh, col) => R.every(r => !!sh.formula(col + r));
const labels = sh => formulas(sh, 'B') && R.every((r, i) => sh.value('B' + r) === sh.value('B' + (5 + i)));
const days = sh => sh.value('C49') - sh.value('C48') + 1;
const revenue = (ses, sh) => formulas(sh, 'C') && R.every(r => calls(sh, 'C' + r, ['SUMIFS']) && near(sh.value('C' + r), sumWhere(exportRows(ses), 'revenue', atSite(sh.value('B' + r)), between(sh.value('C48'), sh.value('C49')))));
const hours = sh => formulas(sh, 'D') && R.every((r, i) => near(sh.value('D' + r), sh.value('E' + (5 + i)) * days(sh)));
const perHour = sh => formulas(sh, 'E') && R.every(r => near(sh.value('E' + r), sh.value('C' + r) / sh.value('D' + r)))
  && formulas(sh, 'F') && R.every(r => calls(sh, 'F' + r, ['RANK']) && sh.value('F' + r) === 1 + R.filter(o => sh.value('E' + o) > sh.value('E' + r)).length);
const top = sh => R.reduce((b, r) => (isNum(sh.value('E' + r)) && (b === null || sh.value('E' + r) > sh.value('E' + b)) ? r : b), null);
const leader = sh => { const t = top(sh); return t !== null && calls(sh, 'C61', ['INDEX', 'MATCH']) && sameText(sh.value('C61'), sh.value('B' + t)) && calls(sh, 'D61', ['INDEX', 'MATCH']) && near(sh.value('D61'), sh.value('E' + t)); };
const answered = ses => { const qs = qa(ses), sh = summary(ses); const v = qs.value('F11');
  return sameText(qs.value('E11'), 'Answered') && /Summary!/i.test(qs.formula('F11') || '') && typeof v === 'string' && v.startsWith(sh.value('C61')) && v.includes(sh.value('D61').toFixed(2)); };

export default {
  id: 'question-end-to-end',
  chapter: 'data-and-lookups',
  section: 'Summaries from raw rows',
  module: 'summaries-from-raw-rows',
  workbook: 'clearcoat-pack',
  state: { before: 'S434', after: 'S435' },
  plant: shellOf('S435', { Summary: PLANT, 'Q&A': ['F11'] }, { keepText: true }),
  title: 'A buyer’s question answered end to end',
  difficulty: 'hard',
  tags: ['formulas', 'summary', 'questions'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['B2', 'C3'],
  teaches: ['question-loop'],
  uses: ['date-window', 'sumifs-cube', 'kpi-ratios', 'large-small-rank', 'text-function', 'concatenate-amp', 'relative-absolute', 'cross-sheet-ref', 'go-to', 'ctrl-arrow', 'arrow-keys', 'shift-arrow', 'ctrl-enter-fill', 'type-to-enter', 'tab-commits'],
  prerequisites: ['kpi-page-linked-labeled-checked'],
  brief: 'Sponsor C’s question 7 asks for revenue per site per open hour in the last week, and which site led. Decide the cut, then build it from the pieces you have: the date window, the hours from the KPI block, SUMIFS and RANK. Then write the answer into the log as a formula on the cells, with the status set to Answered. That is the loop for every question in the room. The key is `=`.',
  goals: [
    { id: 'sites', teach: 'Every question in the log goes the same way: read it, decide the cut (here, the window’s seven days by site), build the cut from the blocks already on the page, and answer with a link, never a typed figure.', text: 'On Summary, the block’s sites in B55:B60 read the site block: =$B5 with Ctrl+Enter.', keys: `Ctrl+G "Summary!B55" ↵ Shift+↓ ×5 "${F.label}" Ctrl+↵`, requires: ['question-loop', 'relative-absolute', 'go-to', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range B55:B60 · The window is already the last seven days, in C48:C49.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && labels(sh); } },
    { id: 'revenue', text: 'Revenue in the window by site in C55:C60: a SUMIFS on the site and both date criteria, the dates anchored.', keys: `→ Shift+↓ ×5 ${q(F.rev)} Ctrl+↵`, requires: ['date-window', 'sumif-sumifs', 'relative-absolute', 'arrow-keys', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: `pulse range C55:C60 · ${F.rev}`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && revenue(ses, sh); } },
    { id: 'hours', text: `Open hours in the window in D55:D60: hours a day from the KPI block times the days, ${F.hours}.`, keys: `→ Shift+↓ ×5 "${F.hours}" Ctrl+↵`, requires: ['relative-absolute', 'arrow-keys', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range D55:D60 · Both ends count, so the days are end minus start plus one.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && hours(sh); } },
    { id: 'rank', text: `Revenue an hour in E55:E60 ${F.perHour}, and its rank in F55:F60 ${F.rank}.`, keys: `→ Shift+↓ ×5 "${F.perHour}" Ctrl+↵ → Shift+↓ ×5 "${F.rank}" Ctrl+↵`, requires: ['kpi-ratios', 'large-small-rank', 'arrow-keys', 'shift-arrow', 'ctrl-enter-fill'], convention: 'C3',
      hintStuck: 'pulse range F55:F60 · Anchor the list RANK reads, so every row ranks against the same six.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && perHour(sh); } },
    { id: 'leader', text: `The leader in C61, ${F.leader}, and its figure in D61 the same way on column E.`, keys: `Ctrl+↓ ↓ Ctrl+← → "${F.leader}" Tab "${F.figure}" ↵`, requires: ['ctrl-arrow', 'arrow-keys', 'tab-commits'],
      hintStuck: `pulse range C61:D61 · ${F.figure}`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && leader(sh); } },
    { id: 'answer', text: 'On Q&A, question 7: E11 Answered, and F11 a formula on the leader and its figure in dollars an hour.', keys: `Ctrl+G "'Q&A'!E11" ↵ "Answered" Tab ${q(F.answer)} ↵`, requires: ['question-loop', 'text-function', 'concatenate-amp', 'cross-sheet-ref', 'go-to', 'tab-commits'], convention: 'B2',
      hintStuck: `pulse cell F11 · ${F.answer}`,
      check: (s, ses) => settled(ses) && answered(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Summary!C48" Enter "9/16/2026" Enter "9/22/2026" Enter Ctrl+G "\'Q&A\'!F11" Enter Escape', cadence: 320 }, text: 'Does it tie? Watch the window in C48:C49 move a week back, and the answer in F11 on the log follow it.', requires: [],
      hintStuck: 'pulse cell F11 · The answer is a formula, so it is never out of date.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'B55:F60 hold revenue, open hours, revenue an hour and the rank by site in the window', check: (s, ses) => { const sh = summary(ses); return labels(sh) && revenue(ses, sh) && hours(sh) && perHour(sh); } },
    { text: 'C61:D61 name the leader and its figure', check: (s, ses) => leader(summary(ses)) },
    { text: 'Question 7 on Q&A is answered by a formula on the leader', check: (s, ses) => answered(ses) },
  ],
  closing: [
    'One question took four pieces you already had, and the log points at the answer.',
    'Best practice: the answer on the log is a formula on the page, with the units in it, so it moves when the data moves and reads as a sentence when a buyer opens the log.',
  ],
  solution: `Ctrl+G "Summary!B55" Enter Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "${F.label}" Ctrl+Enter `
    + ['rev', 'hours', 'perHour', 'rank'].map(k => `Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down ${q(F[k])} Ctrl+Enter `).join('')
    + `Ctrl+Down Down Ctrl+Left Right "${F.leader}" Tab "${F.figure}" Enter Ctrl+G "'Q&A'!E11" Enter "Answered" Tab ${q(F.answer)} Enter`,
};
