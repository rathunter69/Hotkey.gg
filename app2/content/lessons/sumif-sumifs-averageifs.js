// Chapter 3 · 3.3.3 SUMIF, SUMIFS and AVERAGEIFS (clearcoat-databook, S3b → S3c)
// The revenue half of the site block: retail revenue by site with SUMIF, the average retail ticket
// with AVERAGEIFS and ">0" to keep the member washes out, the fortnight's washes from Daily, active
// members from the Members list, membership revenue as active members times the fee in Members!L2,
// total revenue, the totals, a note that says why a member wash carries $0, and the site by package
// revenue block with SUMIFS anchored both ways. The closer moves one Domain retail amount and
// Domain's retail and total revenue answer.
import { summary, sheetIn, settled, block, calls, near, isNum, exportRows, countRows, sumRows, atSite, ofPackage, amountOver, sameText, totalOf, live } from './lib/databook-checks.js';

const S1 = 15, S2 = 20;
const code = (sh, r) => sh.value('B' + r);
const rows = ses => exportRows(ses);
const retail = (ses, sh) => block(sh, 'F', S1, S2, { fns: ['SUMIF'], want: r => sumRows(rows(ses), 'amount', atSite(code(sh, r))) });
const avgAt = (ses, sh) => r => { const k = countRows(rows(ses), atSite(code(sh, r)), amountOver(0)); return k ? sumRows(rows(ses), 'amount', atSite(code(sh, r)), amountOver(0)) / k : NaN; };
const avgOne = (ses, sh) => block(sh, 'G', S1, S1, { fns: ['AVERAGEIFS'], want: avgAt(ses, sh) });
const avgTicket = (ses, sh) => block(sh, 'G', S1, S2, { fns: ['AVERAGEIFS'], want: avgAt(ses, sh) });
const dailyWashes = (ses, code) => { const d = sheetIn(ses, 'Daily'); let t = 0; for (let r = 5; r <= 94; r++) if (sameText(d.value('B' + r), code) && isNum(d.value('D' + r))) t += d.value('D' + r); return t; };
const fortnight = (ses, sh) => block(sh, 'O', S1, S2, { fns: ['SUMIF'], want: r => dailyWashes(ses, code(sh, r)) });
const activeAt = (ses, code) => { const m = sheetIn(ses, 'Members'); let k = 0; for (let r = 5; r <= 44; r++) { const f = m.value('F' + r); if (sameText(m.value('C' + r), code) && (f == null || f === '')) k++; } return k; };
const members = (ses, sh) => block(sh, 'L', S1, S2, { fns: ['COUNTIFS'], want: r => activeAt(ses, code(sh, r)) });
const fee = ses => sheetIn(ses, 'Members').value('L2');
const membership = (ses, sh) => block(sh, 'M', S1, S2, { want: r => sh.value('L' + r) * fee(ses) }) && block(sh, 'N', S1, S2, { want: r => sh.value('F' + r) + sh.value('M' + r) });
const totals = sh => !!sh && ['F', 'L', 'M', 'N', 'O'].every(col => totalOf(sh, col, S1, S2, 21)) && near(sh.value('G21'), sh.value('F21') / sh.value('E21')) && live(sh, 'G21');
/** A typed note that says a member wash carries $0 (in the learner's words: "$0" and "member" are all it needs). */
const note = sh => !!sh && !sh.cellAt('C22').formula && /\$0\b/.test(String(sh.value('C22') || '')) && /member/i.test(String(sh.value('C22') || ''));
const crossBasic = (ses, sh) => block(sh, 'F', 41, 46, { fns: ['SUMIFS'], want: r => sumRows(rows(ses), 'amount', atSite(code(sh, r)), ofPackage(sh.value('F40'))) });
const cross = (ses, sh) => ['F', 'G', 'H'].every(col => block(sh, col, 41, 46, { fns: ['SUMIFS'], liveRef: null,
  want: r => sumRows(rows(ses), 'amount', atSite(code(sh, r)), ofPackage(sh.value(col + '40'))) })) && live(sh, 'H41') && ['F', 'G', 'H'].every(col => totalOf(sh, col, 41, 46, 47));
const SEL5 = 'Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down', SEL6 = SEL5 + ' Shift+Down';
const F = {
  retail: '=SUMIF(Transactions!$B$5:$B$94,B15,Transactions!$E$5:$E$94)',
  avg: '=AVERAGEIFS(Transactions!$E$5:$E$94,Transactions!$B$5:$B$94,B15,Transactions!$E$5:$E$94,">0")',
  daily: '=SUMIF(Daily!$B$5:$B$94,B15,Daily!$D$5:$D$94)',
  members: '=COUNTIFS(Members!$C$5:$C$44,B15,Members!$F$5:$F$44,"")',
  fee: '=L15*Members!$L$2',
  total: '=F15+M15',
  g21: '=F21/E21',
  note: 'Member washes carry $0; membership revenue is the fee times active members',
  cross: '=SUMIFS(Transactions!$E$5:$E$94,Transactions!$B$5:$B$94,$B41,Transactions!$C$5:$C$94,F$40)',
};
const q = f => `'${f}'`;

export default {
  id: 'sumif-sumifs-averageifs',
  chapter: 'formulas',
  section: 'Math and aggregation',
  module: 'math-and-aggregation',
  workbook: 'clearcoat-databook',
  state: { before: 'S3b', after: 'S3c' },
  title: 'SUMIF, SUMIFS and AVERAGEIFS',
  difficulty: 'medium',
  tags: ['formulas', 'functions', 'aggregation'],
  access: 'paid',
  minutes: 7,
  headline: 'SUMIFS',
  conventions: ['E5', 'B6'],
  teaches: ['sumif-sumifs', 'averageifs'],
  uses: ['countif-countifs', 'criteria-operators', 'ctrl-arrow', 'shift-arrow', 'ctrl-enter-fill', 'relative-absolute', 'cross-sheet-ref', 'autosum', 'type-to-enter', 'fill-down-right', 'formula-basics'],
  prerequisites: ['countif-countifs'],
  brief: 'Counting says how many; summing says how much. SUMIF adds the rows that meet one condition, SUMIFS puts the range to add first and then the condition pairs, and AVERAGEIFS averages instead. A member wash carries $0 because the member paid on the first of the month, so membership revenue is active members times the fee, not a sum of rows, and the databook has to say so or a buyer will think member washes are free. Build the revenue columns on Summary. The key is `SUMIFS`.',
  goals: [
    { id: 'retail', teach: 'SUMIF(range, criteria, sum_range) adds the sum_range on every row where the range meets the criteria. The criteria range and the sum range run down the same rows, so anchor both and the formula fills.', text: 'Retail revenue by site: select F15:F20, type =SUMIF(Transactions!$B$5:$B$94,B15,Transactions!$E$5:$E$94) and press Ctrl+Enter.', keys: `→ Ctrl+↓ ×4 Ctrl+→ → Shift+↓ ×5 "${F.retail}" Ctrl+↵`, requires: ['sumif-sumifs', 'ctrl-arrow', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range F15:F20 · The amounts sit in column E of the export.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && retail(ses, sh); } },
    { id: 'fortnight', text: 'The same SUMIF on another sheet: the fortnight’s washes from the POS day totals, O15:O20 =SUMIF(Daily!$B$5:$B$94,B15,Daily!$D$5:$D$94).', keys: `Ctrl+→ ← Shift+↓ ×5 "${F.daily}" Ctrl+↵`, requires: ['sumif-sumifs', 'ctrl-arrow', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range O15:O20 · Daily holds one row per site per day.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && fortnight(ses, sh); } },
    { id: 'avg-ticket', teach: 'AVERAGEIFS puts the range to average first, then the pairs. Member washes carry $0, so ">0" on the amounts keeps them out, and the average is the retail ticket a customer actually paid.', text: 'Domain’s average retail ticket in G15: AVERAGEIFS of the amounts on the site, with the amounts ">0" as a second pair.', keys: `Ctrl+← → ${q(F.avg)} ↵`, requires: ['averageifs', 'criteria-operators', 'ctrl-arrow', 'type-to-enter'],
      hintStuck: 'pulse cell G15 · Without the ">0" pair, every member wash drags the average down.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && avgOne(ses, sh); } },
    { id: 'avg-all', text: 'Every site’s average retail ticket: the same AVERAGEIFS into G15:G20 with Ctrl+Enter, and compare the six.', keys: `↑ Shift+↓ ×5 ${q(F.avg)} Ctrl+↵`, requires: ['averageifs', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range G15:G20 · Select the six sites first, then one Ctrl+Enter.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && avgTicket(ses, sh); } },
    { id: 'members', text: 'Active members by site in L15:L20: COUNTIFS on Members!$C$5:$C$44 for the home site and Members!$F$5:$F$44 "" for not cancelled.', keys: `Ctrl+→ ← ×3 Shift+↓ ×5 ${q(F.members)} Ctrl+↵`, requires: ['countif-countifs', 'criteria-operators', 'ctrl-arrow', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range L15:L20 · A cancelled member has a date in column F of Members.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && members(ses, sh); } },
    { id: 'membership', teach: 'Membership revenue is active members times the monthly fee, $30 in Members!L2 for now (the fee by plan is a lookup, Chapter 4). It sits beside retail revenue, because a member wash carries $0 in the export and the money came in on the first.', text: 'Membership revenue in M15:M20 =L15*Members!$L$2, then total revenue in N15:N20 =F15+M15.', keys: `→ Shift+↓ ×5 "${F.fee}" Ctrl+↵ → Shift+↓ ×5 "${F.total}" Ctrl+↵`, requires: ['relative-absolute', 'cross-sheet-ref', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range M15:N20 · Anchor the fee, so every site multiplies by the same cell.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && membership(ses, sh); } },
    { id: 'totals', text: 'Total F15:F21 and L15:O21 with Alt+=, put G21 =F21/E21, and note in C22 that member washes carry $0 and why.', keys: `← ×2 Shift+↓ ×6 Shift+→ ×3 Alt+= Ctrl+← ← Shift+↓ ×6 Alt+= → Ctrl+↓ ↓ "${F.g21}" ↵ Ctrl+← → "${F.note}" ↵`, requires: ['autosum', 'formula-basics', 'ctrl-arrow', 'shift-arrow', 'type-to-enter'], convention: 'E5',
      hintStuck: `pulse range F21:O21 · An average of averages is wrong, so G21 divides revenue by washes. The note: ${F.note}.`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && totals(sh) && note(sh); } },
    { id: 'cross', teach: 'SUMIFS(sum_range, criteria_range1, criteria1, criteria_range2, criteria2) takes the range to add first, which is the opposite of SUMIF. Anchor the site as $B41 and the package as F$40, and the one formula is right in every cell of the block.', text: 'Basic retail revenue by site in F41:F46: =SUMIFS of the amounts on the site $B41 and the package F$40, with Ctrl+Enter.', keys: `→ ×3 Ctrl+↓ ×3 ↓ Shift+↓ ×5 "${F.cross}" Ctrl+↵`, requires: ['sumif-sumifs', 'relative-absolute', 'ctrl-arrow', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range F41:F46 · The package letters for revenue run across F40:H40.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && crossBasic(ses, sh); } },
    { id: 'cross-fill', text: 'Fill the SUMIFS right across F41:H46 with Ctrl+R, then AutoSum F41:H47: the anchors hold, so D and U come out right too.', keys: 'Shift+→ ×2 Ctrl+R Ctrl+↑ ↓ Shift+↓ ×6 Shift+→ ×2 Alt+=', requires: ['sumif-sumifs', 'fill-down-right', 'autosum', 'ctrl-arrow', 'shift-arrow'], convention: 'E5',
      hintStuck: 'pulse range G41:H46 · Select from F41 to H46 so Ctrl+R has the formula to copy.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && cross(ses, sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Transactions!E6" Enter "30" Enter Ctrl+G "Summary!F15" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch a Domain wash in Transactions!E6 go from 20 to 30, and Domain’s revenue in F15 and N15 rise by 10.', requires: [],
      hintStuck: 'pulse cell N15 · Retail revenue and total revenue both read the export.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'F15:G20 hold retail revenue and the average retail ticket by site', check: (s, ses) => { const sh = summary(ses); return retail(ses, sh) && avgTicket(ses, sh); } },
    { text: 'L15:O20 hold active members, membership revenue, total revenue and the fortnight’s washes', check: (s, ses) => { const sh = summary(ses); return members(ses, sh) && membership(ses, sh) && fortnight(ses, sh); } },
    { text: 'The totals in row 21 and the note in C22 are in place', check: (s, ses) => { const sh = summary(ses); return totals(sh) && note(sh); } },
    { text: 'F41:H47 hold retail revenue by site and package with its totals', check: (s, ses) => cross(ses, summary(ses)) },
  ],
  closing: [
    'The page now says how much, by site and by package, and what a member wash is worth.',
    'Retail revenue is a sum of the export; membership revenue is members times the fee, and the note in C22 says so before a buyer asks. Best practice: a SUMIFS lists the range to add first, a SUMIF last, and mixing the two up is the commonest slip in a databook, so read one back with F2 before you fill.',
  ],
  solution: `Right Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Right Right ${SEL5} "${F.retail}" Ctrl+Enter Ctrl+Right Left ${SEL5} "${F.daily}" Ctrl+Enter `
    + `Ctrl+Left Right ${q(F.avg)} Enter Up ${SEL5} ${q(F.avg)} Ctrl+Enter Ctrl+Right Left Left Left ${SEL5} ${q(F.members)} Ctrl+Enter `
    + `Right ${SEL5} "${F.fee}" Ctrl+Enter Right ${SEL5} "${F.total}" Ctrl+Enter `
    + `Left Left ${SEL6} Shift+Right Shift+Right Shift+Right Alt+= Ctrl+Left Left ${SEL6} Alt+= Right Ctrl+Down Down "${F.g21}" Enter `
    + `Ctrl+Left Right "${F.note}" Enter `
    + `Right Right Right Ctrl+Down Ctrl+Down Ctrl+Down Down ${SEL5} "${F.cross}" Ctrl+Enter Shift+Right Shift+Right Ctrl+R Ctrl+Up Down ${SEL6} Shift+Right Shift+Right Alt+=`,
};
