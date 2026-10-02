// Chapter 3 · 3.3.1 ROUND, ROUNDUP, ROUNDDOWN, ABS, CEILING, FLOOR (clearcoat-databook, S2e → S3a)
// Summary's flags block carries revenue per wash in Q5:Q10 to every decimal the division left. The
// learner reads the hidden decimals on the status bar, then fills the ticket columns with one
// Ctrl+Enter each (so the $ stays on the first row only): ROUND to the cent in T, CEILING and FLOOR
// to the quarter in U and V, the Sep 15 washes in thousands rounded down in W, and the gap to
// target as a size in X. The closer moves Domain's Sep 15 revenue and the three ticket columns
// answer together.
import { summary, settled, selected, block, xlRound, xlRoundDown, xlCeiling, xlFloor } from './lib/databook-checks.js';

const R1 = 5, R2 = 10;
const q = (sh, r) => sh.value('Q' + r);
const rounded = sh => block(sh, 'T', R1, R2, { fns: ['ROUND'], want: r => xlRound(q(sh, r), 2) });
const ceilFloor = sh => block(sh, 'U', R1, R2, { fns: ['CEILING'], want: r => xlCeiling(q(sh, r), 0.25) }) && block(sh, 'V', R1, R2, { fns: ['FLOOR'], want: r => xlFloor(q(sh, r), 0.25) });
const thousands = sh => block(sh, 'W', R1, R2, { fns: ['ROUNDDOWN'], want: r => xlRoundDown(sh.value('C' + r) / 1000, 1) });
const gap = sh => block(sh, 'X', R1, R2, { fns: ['ABS'], want: r => Math.abs(sh.value('C' + r) - sh.value('D' + r)) });
const SEL = 'Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down';

export default {
  id: 'round-family',
  chapter: 'formulas',
  section: 'Math and aggregation',
  module: 'math-and-aggregation',
  workbook: 'clearcoat-databook',
  state: { before: 'S2e', after: 'S3a' },
  title: 'ROUND, ROUNDUP, ROUNDDOWN, ABS, CEILING, FLOOR',
  difficulty: 'medium',
  tags: ['formulas', 'functions', 'rounding'],
  access: 'paid',
  minutes: 5,
  headline: 'ROUND',
  conventions: ['D2', 'D4'],
  teaches: ['round-function', 'ceiling-floor', 'roundup-rounddown', 'abs-function'],
  uses: ['go-to', 'status-bar', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-enter-fill', 'formula-basics'],
  prerequisites: ['challenge-timeline-and-age', 'challenge-house-format-set'],
  brief: 'A number format hides decimals; ROUND removes them, and the two are not the same thing: a page that adds up its displayed figures can land a dollar off its own total. ROUND(x,2) rounds to the cent, ROUND(x,0) to the dollar and ROUND(x,-3) to the thousand; ROUNDUP and ROUNDDOWN force the direction; CEILING and FLOOR round to a step, like the nearest $0.25 on a ticket; ABS drops the sign. Use them on the ticket figures in Summary, where the arithmetic has to be exact. The key is `ROUND`.',
  goals: [
    { id: 'read-decimals', text: 'Select the tickets in Q5:Q10 and read their Sum on the status bar: it adds every decimal the cells hide.', keys: 'Ctrl+G "Q5" ↵ Ctrl+Shift+↓', requires: ['go-to', 'status-bar', 'ctrl-shift-arrow'],
      hintStuck: 'pulse range Q5:Q10 · Revenue per wash is the column headed in Q4.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && selected(sh, 'Q5:Q10'); } },
    { id: 'round', teach: 'ROUND(number, digits) changes the value itself, where a number format only changes what shows: =ROUND(Q5,2) holds 6.95, not 6.950381. Rounded figures add up to the total the page prints, so round where the arithmetic has to be exact.', text: 'Select T5:T10, type =ROUND(Q5,2) and press Ctrl+Enter: every site’s ticket, rounded to the cent.', keys: '→ ×3 Shift+↓ ×5 "=ROUND(Q5,2)" Ctrl+↵', requires: ['round-function', 'ctrl-enter-fill', 'shift-arrow'], convention: 'D2',
      hintStuck: 'pulse range T5:T10 · Select the six sites first, then one Ctrl+Enter writes them all.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && rounded(sh); } },
    { id: 'ceiling-floor', teach: 'CEILING(number, significance) rounds up to the next multiple of the step and FLOOR rounds down to it, so with a step of 0.25 a $6.95 ticket becomes $7.00 and $6.75. That is how a price list gets set from a ticket the arithmetic produced.', text: 'Price the tickets to the quarter: =CEILING(Q5,0.25) into U5:U10, then =FLOOR(Q5,0.25) into V5:V10, each with Ctrl+Enter.', keys: '→ Shift+↓ ×5 "=CEILING(Q5,0.25)" Ctrl+↵ → Shift+↓ ×5 "=FLOOR(Q5,0.25)" Ctrl+↵', requires: ['ceiling-floor', 'ctrl-enter-fill', 'shift-arrow'], convention: 'D2',
      hintStuck: 'pulse range U5:V10 · Ceiling goes up to the step, floor goes down to it.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && ceilFloor(sh); } },
    { id: 'rounddown', teach: 'ROUNDUP and ROUNDDOWN take the same digits as ROUND but always go one way, whatever the next digit says. A count in thousands rounded down never claims a wash the site did not do.', text: 'Show the Sep 15 washes in thousands, always rounded down: =ROUNDDOWN(C5/1000,1) into W5:W10 with Ctrl+Enter.', keys: '→ Shift+↓ ×5 "=ROUNDDOWN(C5/1000,1)" Ctrl+↵', requires: ['roundup-rounddown', 'ctrl-enter-fill', 'shift-arrow'],
      hintStuck: 'pulse range W5:W10 · Divide by a thousand inside the ROUNDDOWN.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && thousands(sh); } },
    { id: 'abs', teach: 'ABS returns a number without its sign, so a gap of 25 washes reads 25 whether the site is over the target or under it. Use it when the question is how far, not which way.', text: 'Put the gap to target in X5:X10 as a size, not a sign: =ABS(C5-D5) with Ctrl+Enter.', keys: '→ Shift+↓ ×5 "=ABS(C5-D5)" Ctrl+↵', requires: ['abs-function', 'ctrl-enter-fill', 'shift-arrow'],
      hintStuck: 'pulse range X5:X10 · The washes sit in C and the target in D.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && gap(sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Summary!H5" Enter "2000" Enter Ctrl+G "Summary!T5:V5" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Domain’s revenue in H5 change to 2000, and its rounded, ceiling and floor tickets in T5:V5 move together.', requires: [],
      hintStuck: 'pulse range T5:V5 · All three read the same ticket in Q5.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'T5:T10 round each ticket to the cent with ROUND', check: (s, ses) => rounded(summary(ses)) },
    { text: 'U5:V10 price each ticket up and down to the quarter with CEILING and FLOOR', check: (s, ses) => ceilFloor(summary(ses)) },
    { text: 'W5:W10 and X5:X10 read the washes in thousands and the gap to target', check: (s, ses) => thousands(summary(ses)) && gap(summary(ses)) },
  ],
  closing: [
    'A format hides decimals; ROUND removes them, and the total knows the difference.',
    'The ticket columns now read to the cent and to the quarter, the washes in thousands and the gap to target as a size. Best practice: round where a figure gets added up or printed as a price, and keep the full figure everywhere else, because every rounding throws a little away.',
  ],
  solution: `Ctrl+G "Q5" Enter Ctrl+Shift+Down Right Right Right ${SEL} "=ROUND(Q5,2)" Ctrl+Enter Right ${SEL} "=CEILING(Q5,0.25)" Ctrl+Enter Right ${SEL} "=FLOOR(Q5,0.25)" Ctrl+Enter Right ${SEL} "=ROUNDDOWN(C5/1000,1)" Ctrl+Enter Right ${SEL} "=ABS(C5-D5)" Ctrl+Enter`,
};
