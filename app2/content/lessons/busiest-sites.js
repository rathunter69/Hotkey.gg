// Chapter 3 · 3.3.4 MAXIFS, MINIFS, LARGE, SMALL and RANK (clearcoat-databook, S3c → S3d)
// The league table on Summary, built without sorting a thing: each site's busiest and quietest day
// from the POS day totals on Daily with MAXIFS and MINIFS, the top three site totals with LARGE and
// the bottom one with SMALL, and every site's rank with RANK. The closer gives Airport more washes
// and the rank and the LARGE list reorder while the block stays where the links expect it.
import { summary, sheetIn, settled, block, calls, near, isNum, sameText, live } from './lib/databook-checks.js';

const S1 = 15, S2 = 20;
const code = (sh, r) => sh.value('B' + r);
const days = (ses, c) => { const d = sheetIn(ses, 'Daily'); const out = []; for (let r = 5; r <= 94; r++) if (sameText(d.value('B' + r), c) && isNum(d.value('D' + r))) out.push(d.value('D' + r)); return out; };
const busiest = (ses, sh) => block(sh, 'H', S1, S2, { fns: ['MAXIFS'], want: r => Math.max(...days(ses, code(sh, r))) });
const quietest = (ses, sh) => block(sh, 'I', S1, S2, { fns: ['MINIFS'], want: r => Math.min(...days(ses, code(sh, r))) });
const washes = sh => { const v = []; for (let r = S1; r <= S2; r++) v.push(sh.value('C' + r)); return v; };
const desc = sh => washes(sh).filter(isNum).sort((a, b) => b - a);
const top3 = sh => !!sh && [0, 1, 2].every(i => calls(sh, 'J' + (S1 + i), ['LARGE']) && near(sh.value('J' + (S1 + i)), desc(sh)[i])) && live(sh, 'J15');
const bottom = sh => !!sh && calls(sh, 'J18', ['SMALL']) && near(sh.value('J18'), desc(sh)[desc(sh).length - 1]) && live(sh, 'J18');
const ranks = sh => block(sh, 'K', S1, S2, { fns: ['RANK'], want: r => 1 + washes(sh).filter(v => isNum(v) && v > sh.value('C' + r)).length });
const SEL5 = 'Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down';
const F = {
  max: '=MAXIFS(Daily!$D$5:$D$94,Daily!$B$5:$B$94,B15)',
  min: '=MINIFS(Daily!$D$5:$D$94,Daily!$B$5:$B$94,B15)',
  large: n => `=LARGE($C$15:$C$20,${n})`,
  small: '=SMALL($C$15:$C$20,1)',
  rank: '=RANK(C15,$C$15:$C$20)',
};

export default {
  id: 'busiest-sites',
  chapter: 'formulas',
  section: 'Math and aggregation',
  module: 'math-and-aggregation',
  workbook: 'clearcoat-databook',
  state: { before: 'S3c', after: 'S3d' },
  title: 'MAXIFS, MINIFS, LARGE, SMALL and RANK',
  difficulty: 'medium',
  tags: ['formulas', 'functions', 'aggregation'],
  access: 'paid',
  minutes: 5,
  headline: 'LARGE',
  conventions: ['E3'],
  teaches: ['maxifs-minifs', 'large-small-rank'],
  uses: ['sumif-sumifs', 'ctrl-arrow', 'shift-arrow', 'ctrl-enter-fill', 'relative-absolute', 'cross-sheet-ref', 'type-to-enter'],
  prerequisites: ['sumif-sumifs-averageifs'],
  brief: '"Which site was busiest, and on which day?" MAXIFS finds the biggest value that meets a condition and MINIFS the smallest; LARGE and SMALL find the nth biggest or smallest in a range; RANK places every site in order. Together they turn the site block into a league table without sorting anything, which matters because the block has to stay where every link expects it. The key is `LARGE`.',
  goals: [
    { id: 'busiest', teach: 'MAXIFS(max_range, criteria_range, criteria) returns the largest value on the rows that meet the criteria, the same pairs COUNTIFS takes. Daily holds one row per site per day, so the site’s code finds its busiest day.', text: 'Each site’s busiest day in H15:H20: =MAXIFS(Daily!$D$5:$D$94,Daily!$B$5:$B$94,B15) with Ctrl+Enter.', keys: `→ Ctrl+↓ ×4 Ctrl+→ → Shift+↓ ×5 "${F.max}" Ctrl+↵`, requires: ['maxifs-minifs', 'ctrl-arrow', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range H15:H20 · The day totals are in column D of Daily.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && busiest(ses, sh); } },
    { id: 'quietest', text: 'Each site’s quietest day in I15:I20, the same pairs with MINIFS.', keys: `→ Shift+↓ ×5 "${F.min}" Ctrl+↵`, requires: ['maxifs-minifs', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range I15:I20 · Cedar Park washed nothing on its first day.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && quietest(ses, sh); } },
    { id: 'top3', teach: 'LARGE(array, k) returns the kth biggest value in the range, so k of 1, 2 and 3 is a top three that rereads itself whenever a count moves. Anchor the range, since every line reads the same six sites.', text: 'The top three site totals in J15:J17: =LARGE($C$15:$C$20,1), then 2, then 3.', keys: `→ "${F.large(1)}" ↵ "${F.large(2)}" ↵ "${F.large(3)}" ↵`, requires: ['large-small-rank', 'relative-absolute', 'type-to-enter'],
      hintStuck: 'pulse range J15:J17 · The fortnight’s washes by site sit in C15:C20.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && top3(sh); } },
    { id: 'bottom', text: 'The bottom one in J18: =SMALL($C$15:$C$20,1).', keys: `"${F.small}" ↵`, requires: ['large-small-rank', 'type-to-enter'],
      hintStuck: 'pulse cell J18 · SMALL counts up from the smallest.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && bottom(sh); } },
    { id: 'rank', teach: 'RANK(number, ref) gives a value’s place in the list, 1 for the biggest, and ties share a place. Read the order off K without sorting the block.', text: 'Rank every site in K15:K20: =RANK(C15,$C$15:$C$20) with Ctrl+Enter.', keys: `Ctrl+↑ ×2 ↓ → Shift+↓ ×5 "${F.rank}" Ctrl+↵`, requires: ['large-small-rank', 'relative-absolute', 'ctrl-arrow', 'shift-arrow', 'ctrl-enter-fill'], convention: 'E3',
      hintStuck: 'pulse range K15:K20 · C15 moves with the row; the list stays anchored.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && ranks(sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Summary!C19" Enter "25" Enter Ctrl+G "Summary!J15:K19" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Airport’s washes in C19 change to 25, and its rank in K19 and the top three in J15:J17 reorder.', requires: [],
      hintStuck: 'pulse range J15:J17 · Nothing was sorted, so the links still point where they did.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'H15:I20 hold each site’s busiest and quietest day', check: (s, ses) => { const sh = summary(ses); return busiest(ses, sh) && quietest(ses, sh); } },
    { text: 'J15:J18 list the top three and the bottom site total', check: (s, ses) => { const sh = summary(ses); return top3(sh) && bottom(sh); } },
    { text: 'K15:K20 rank every site', check: (s, ses) => ranks(summary(ses)) },
  ],
  closing: [
    'A league table with nothing sorted, so every link still points where it should.',
    'MAXIFS and MINIFS read the busiest and quietest day straight off the day totals; LARGE, SMALL and RANK put the six sites in order beside them. Best practice: never sort a block that other cells link to; rank it in a column instead, and the links keep their rows.',
  ],
  solution: `Right Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Right Right ${SEL5} "${F.max}" Ctrl+Enter Right ${SEL5} "${F.min}" Ctrl+Enter `
    + `Right "${F.large(1)}" Enter "${F.large(2)}" Enter "${F.large(3)}" Enter "${F.small}" Enter Ctrl+Up Ctrl+Up Down Right ${SEL5} "${F.rank}" Ctrl+Enter`,
};
