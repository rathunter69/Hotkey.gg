// Chapter 3 · 3.1.1 IF on a threshold (clearcoat-databook, S0 → S1a)
// The flags block on Summary: each site's Sep 15 washes in C5:C10 against its daily target in
// D5:D10 (links to Daily and Sites). IF asks the question once in E5 and is filled down; the flag
// becomes a 1/0 the page can add in F5:F10 and F12, then carries the gap above target in G5:G10.
// Graded on values and liveness, so any route that writes live formulas passes. The closer drops
// Mueller under its target and the flag, the count and the gap answer.
import { liveness } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const summary = ses => sheetOf(ses, 'Summary');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const same = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) < 1e-9 : a === b);
const ROWS = [5, 6, 7, 8, 9, 10];
const at = (sh, ref) => sh.selectionText() === ref;
/** Every row of `col` reads `want(sh, r)`, and the first and last are live formulas. */
const column = (sh, col, want) => ROWS.every(r => same(sh.value(col + r), want(sh, r))) && [5, 10].every(r => liveness(sh, col + r).ok);
const on = (sh, r) => sh.value('C' + r) >= sh.value('D' + r);
const FLAG = (sh, r) => (on(sh, r) ? 'On target' : 'Below');
const ONE = (sh, r) => (on(sh, r) ? 1 : 0);
const GAP = (sh, r) => (on(sh, r) ? sh.value('C' + r) - sh.value('D' + r) : 0);
const flags = sh => column(sh, 'E', FLAG);
const ones = sh => column(sh, 'F', ONE);
const count = sh => same(sh.value('F12'), ROWS.reduce((t, r) => t + ONE(sh, r), 0)) && liveness(sh, 'F12').ok;
const gaps = sh => column(sh, 'G', GAP);

export default {
  id: 'if-on-a-threshold',
  chapter: 'formulas',
  section: 'Logic',
  module: 'logic',
  workbook: 'clearcoat-databook',
  state: { before: 'S0', after: 'S1a' },
  title: 'IF on a threshold',
  difficulty: 'medium',
  tags: ['formulas', 'logic', 'if', 'flags'],
  access: 'paid',
  minutes: 6,
  headline: 'IF',
  conventions: ['E3'],
  teaches: ['if-function'],
  uses: ['formula-basics', 'fill-down-right', 'sum-family', 'arrow-keys', 'ctrl-arrow', 'shift-arrow', 'ctrl-shift-arrow', 'cross-sheet-ref'],
  prerequisites: ['ch2-assessment'],
  brief: 'The point-of-sale export logs one row per wash, and it is the only number a buyer trusts, because a machine wrote it. A site’s target is the washes it needs in a day to cover its site costs; below it, the site loses money that day. IF asks a question and gives one answer if it is true and another if it is false: =IF(C5>=D5,"On target","Below"). Build the daily flag for every site on the Summary block. The key is `IF`.',
  goals: [
    { id: 'read-block', teach: 'Column C links each site’s Sep 15 washes from the point-of-sale day totals, and column D its daily target from Sites, so the question sits on one row.',
      text: 'Select the Sep 15 washes and the targets, C5:D10, and read them side by side: Domain washed 262 cars against a target of 250.', keys: '↓ ×3 Ctrl+→ ↓ → Shift+→ Ctrl+Shift+↓', requires: ['ctrl-arrow', 'shift-arrow', 'ctrl-shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range C5:D10 · The washes and the targets sit right of the site codes.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && at(sh, 'C5:D10'); } },
    { id: 'flag-e5', teach: 'IF(test, if true, if false) asks the question in its first part and returns the second part when it holds, the third when it does not. Words go in double quotes; numbers and references do not.',
      text: 'In E5, type =IF(C5>=D5,"On target","Below") and read Domain’s flag against its figures.', keys: `→ ×2 '=IF(C5>=D5,"On target","Below")' ↵`, requires: ['if-function', 'formula-basics', 'arrow-keys'],
      hintStuck: 'pulse cell E5 · >= reads "at least": 262 is at least 250.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && same(sh.value('E5'), FLAG(sh, 5)) && liveness(sh, 'E5').ok; } },
    { id: 'fill-flags', text: 'Fill E5 down to E10 with Ctrl+D: five sites read On target, and Cedar Park, which washed nothing on its first Monday, reads Below.', keys: '↑ Shift+↓ ×5 Ctrl+D', requires: ['fill-down-right', 'shift-arrow', 'arrow-keys'], convention: 'E3',
      hintStuck: 'pulse range E5:E10 · Select from the formula down to Cedar Park, then fill.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && flags(sh); } },
    { id: 'flags-as-numbers', teach: 'A flag in words reads well; a flag as 1 or 0 can be added up.',
      text: 'Make the flag a number the page can add: =IF(C5>=D5,1,0) in F5, filled down to F10.', keys: '→ "=IF(C5>=D5,1,0)" ↵ ↑ Shift+↓ ×5 Ctrl+D', requires: ['if-function', 'fill-down-right', 'shift-arrow', 'arrow-keys'], convention: 'E3',
      hintStuck: 'pulse range F5:F10 · The same test, with 1 and 0 for the answers.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && ones(sh); } },
    { id: 'count-on-target', teach: 'A flag column you can add up is a report: one SUM says how many sites cleared the bar.',
      text: 'Count the sites on target in F12, Sites on target, with =SUM(F5:F10).', keys: 'Ctrl+↓ ↓ ↓ "=SUM(F5:F10)" ↵', requires: ['sum-family', 'ctrl-arrow', 'arrow-keys'],
      hintStuck: 'pulse cell F12 · The count sits two rows under the block.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && count(sh); } },
    { id: 'gap-above', teach: 'The answers can be calculations too: when the site is on target, IF returns the washes above it, and 0 when it is not.',
      text: 'The flag can carry the gap instead: in G5, =IF(C5>=D5,C5-D5,0) gives the washes above target; fill it down to G10.', keys: '↑ Ctrl+↑ Ctrl+↑ → ↓ "=IF(C5>=D5,C5-D5,0)" ↵ ↑ Shift+↓ ×5 Ctrl+D', requires: ['if-function', 'fill-down-right', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'], convention: 'E3',
      hintStuck: 'pulse range G5:G10 · Above target is the next column right of the 1/0 flags.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && gaps(sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Summary!C6" Enter "210" Enter Ctrl+G "Summary!F12" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Mueller’s washes in C6 drop to 210, under its target of 220, and E6, F6, G6 and the count in F12 answer.', requires: [],
      hintStuck: 'pulse cell F12 · One question, asked six times, answers for every site.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'E5:E10 flag each site On target or Below, live', check: (s, ses) => { const sh = summary(ses); return !!sh && flags(sh); } },
    { text: 'F5:F10 carry the flag as 1 or 0 and F12 counts the sites on target', check: (s, ses) => { const sh = summary(ses); return !!sh && ones(sh) && count(sh); } },
    { text: 'G5:G10 carry the washes above target', check: (s, ses) => { const sh = summary(ses); return !!sh && gaps(sh); } },
  ],
  closing: [
    'You asked one question six times, and the page says which sites cleared the bar.',
    'The flag reads in words in E, adds up as 1 and 0 in F, and carries the gap in G, and every one is a formula filled down from the first row (E3). Change a day’s washes and all three answer.',
  ],
  solution: `Down Down Down Ctrl+Right Down Right Shift+Right Ctrl+Shift+Down Right Right '=IF(C5>=D5,"On target","Below")' Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Right "=IF(C5>=D5,1,0)" Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Ctrl+Down Down Down "=SUM(F5:F10)" Enter Up Ctrl+Up Ctrl+Up Right Down "=IF(C5>=D5,C5-D5,0)" Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D`,
};
