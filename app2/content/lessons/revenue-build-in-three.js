// Chapter 5 · 5.7.1 The revenue build in three minutes (clearcoat-model, B571 → DONE)
// The first of the chapter's three benchmarks, run once with the keys shown. The revenue build on
// Schedules arrives cut back: the rollout, the washes, the ticket and the revenue lines hold their
// FY24 formula only (the history read through the projection flag), average sites, average members
// and total revenue are empty, and the rollout and the washes have lost the desk number format.
// Every row is one formula filled right; graded on the figures (the finished model's) and a what-if
// on Inputs that moves the row's FY31 cell.
import { SPEED_REVENUE } from '../workbooks/clearcoat-model.js';
import { settled, like, moves, rowRefs, formatted, sheetIn, DESK } from './lib/model-checks.js';

const S = 'Schedules';
const ok = (ses, keys, target, input) => like(ses, S, rowRefs(S, keys)) && moves(ses, `${S}!${target}`, input);
const DESK_ROWS = rowRefs(S, SPEED_REVENUE.desk);
const F = { avg: '=AVERAGE(C6,C9)', rev: '=C22+C24+C25' };

export default {
  id: 'revenue-build-in-three',
  chapter: 'finance-and-accounting',
  section: 'Model speed',
  module: 'model-speed',
  workbook: 'clearcoat-model',
  state: { before: 'B571', after: 'DONE' },
  title: 'The revenue build in three minutes',
  difficulty: 'medium',
  tags: ['model speed', 'benchmark', 'revenue build', 'fill right'],
  access: 'paid',
  minutes: 5,
  headline: 'F4',
  conventions: ['C3', 'E2'],
  teaches: ['speed-build'],
  uses: ['fill-down-right', 'ctrl-enter-fill', 'f4-anchor', 'f4-repeat', 'cross-sheet-ref', 'custom-number-format', 'format-cells-dialog', 'go-to'],
  prerequisites: ['challenge-dcf-from-cash-flow'],
  brief: 'Everything in this chapter you can now do; the question a desk asks is how fast. The revenue build on Schedules is cut back to each row’s FY24 column, and the job is to take it to a total that ties in three minutes: one formula a row filled right, anchors set with F4 as you type, the revenue check reading zero at the end. The keys are shown this once; in Practice the benchmark runs without them. The key is `F4`.',
  goals: [
    { id: 'rollout', teach: 'A benchmark is a build you already know, against the clock. Every row’s formula is written once, in its first column, and filled right in one press: the FY24 cells here already hold it, reading the history through the projection flag, so Ctrl+R carries it across the actuals and the estimates alike.',
      text: 'Select the rollout C6:J9 on Schedules and press Ctrl+R, so FY25 to FY31 take each row’s FY24 formula.', keys: 'Ctrl+G "Schedules!C6:J9" ↵ Ctrl+R', requires: ['speed-build', 'fill-down-right', 'go-to'], convention: 'C3',
      hintStuck: 'pulse range C6:J9 · The FY24 column holds the formula; one press copies it right.',
      check: (s, ses) => settled(ses) && ok(ses, ['openSites', 'newSites', 'closures', 'closeSites'], 'J9', 'Inputs!J21') },
    { id: 'average', text: `Type ${F.avg} into C10:J10 with Ctrl+Enter, then fill the washes C15:J15 right with Ctrl+R.`,
      keys: `Ctrl+G "Schedules!C10:J10" ↵ "${F.avg}" Ctrl+↵ Ctrl+G "Schedules!C15:J15" ↵ Ctrl+R`, requires: ['ctrl-enter-fill', 'fill-down-right', 'go-to'], convention: 'C3',
      hintStuck: 'pulse range C10:J10 · Average sites sits between the opening and the closing count.',
      check: (s, ses) => settled(ses) && ok(ses, ['avgSites'], 'J10', 'Inputs!J21') && ok(ses, ['washes'], 'J15', 'Inputs!J22') },
    { id: 'retail', text: 'Fill the ticket, its growth and retail revenue right in one press: select C20:J22 and press Ctrl+R.',
      keys: 'Ctrl+G "Schedules!C20:J22" ↵ Ctrl+R', requires: ['fill-down-right', 'go-to'], convention: 'C3',
      hintStuck: 'pulse range C20:J22 · Three rows, one selection, one Ctrl+R.',
      check: (s, ses) => settled(ses) && ok(ses, ['ticket', 'tickGrowth', 'retailRev'], 'J22', 'Inputs!J23') },
    { id: 'members', teach: 'F4 while the cursor sits just after a reference anchors it as you type, so the fill is right the first time: one press turns Inputs!C45 into Inputs!$C$45. A member washes two and a half times a month, so average members are member washes over thirty a year.',
      text: 'Type =C19/(Inputs!C45*12) into C23:J23, pressing F4 right after C45, then fill membership revenue C24:J24 right.',
      keys: 'Ctrl+G "Schedules!C23:J23" ↵ "=C19/(Inputs!C45" F4 "*12)" Ctrl+↵ Ctrl+G "Schedules!C24:J24" ↵ Ctrl+R', requires: ['f4-anchor', 'ctrl-enter-fill', 'cross-sheet-ref', 'fill-down-right', 'go-to'], convention: 'E2',
      hintStuck: 'pulse range C23:J23 · Without the anchor, D23 would read Inputs!D45, an empty cell.',
      check: (s, ses) => settled(ses) && ok(ses, ['members'], 'J23', 'Inputs!C45') && ok(ses, ['clubRev'], 'J24', 'Inputs!C44') },
    { id: 'total', text: `Total revenue in C26:J26: ${F.rev} with Ctrl+Enter, the three revenue lines and not the member count between them.`,
      keys: `Ctrl+G "Schedules!C26:J26" ↵ "${F.rev}" Ctrl+↵`, requires: ['ctrl-enter-fill', 'formula-basics', 'go-to'], convention: 'C3',
      hintStuck: 'pulse range C26:J26 · Row 23 counts members, not dollars, so AutoSum down the block would add it in.',
      check: (s, ses) => settled(ses) && ok(ses, ['rev'], 'J26', 'Inputs!C44') },
    { id: 'desk', text: 'Give the rollout C6:J9 the desk number format in Ctrl+1’s Custom box, then select the washes C15:J15 and press F4.',
      keys: `Ctrl+G "Schedules!C6:J9" ↵ Ctrl+1 N Tab End Alt+T '${DESK}' ↵ Ctrl+G "Schedules!C15:J15" ↵ F4`, requires: ['custom-number-format', 'format-cells-dialog', 'f4-repeat', 'go-to'], convention: 'D3',
      hintStuck: 'pulse range C6:J9 · The code is #,##0_);(#,##0);"-"_), and F4 repeats the last format on the next block.',
      check: (s, ses) => settled(ses) && formatted(sheetIn(ses, S), DESK_ROWS) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!J21" Enter "10" Enter Ctrl+G "Checks!J10" Enter', cadence: 320 },
      text: 'Does it tie? Watch FY31 new sites in Inputs J21 go from 6 to 10: revenue climbs and the revenue check, Checks J10, holds at 0.', requires: [],
      hintStuck: 'pulse cell J10 · The check is the IS’s revenue less the build’s, so it reads 0 whatever the case says.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The rollout and revenue build on Schedules C6:J26 is the finished model’s, every row one formula', check: (s, ses) => like(ses, S, rowRefs(S, [...SPEED_REVENUE.fill, ...SPEED_REVENUE.type])) },
    { text: 'The rollout and the washes carry the desk number format', check: (s, ses) => formatted(sheetIn(ses, S), DESK_ROWS) },
  ],
  wow: 'You built revenue in three minutes, and the check reads zero.',
  closing: [
    'You built revenue in three minutes, and the revenue check held at zero as you finished.',
    'Speed in a model comes from two habits more than from fast fingers: write a row’s formula once and fill it, and anchor as you type so the fill is right the first time. Best practice: read the check the moment a block is done, while you still remember what you changed.',
  ],
  solution: `Ctrl+G "Schedules!C6:J9" Enter Ctrl+R Ctrl+G "Schedules!C10:J10" Enter "${F.avg}" Ctrl+Enter Ctrl+G "Schedules!C15:J15" Enter Ctrl+R `
    + 'Ctrl+G "Schedules!C20:J22" Enter Ctrl+R Ctrl+G "Schedules!C23:J23" Enter "=C19/(Inputs!C45" F4 "*12)" Ctrl+Enter Ctrl+G "Schedules!C24:J24" Enter Ctrl+R '
    + `Ctrl+G "Schedules!C26:J26" Enter "${F.rev}" Ctrl+Enter Ctrl+G "Schedules!C6:J9" Enter Ctrl+1 N Tab End Alt+T '${DESK}' Enter Ctrl+G "Schedules!C15:J15" Enter F4`,
};
