// Chapter 3 · 3.1.3 AND, OR and NOT (clearcoat-databook, S1b → S1c)
// Two-part questions on the flags block, each function written bare first (TRUE and FALSE read
// off the sheet) and then put to work as a page flag: AND in M, wrapped as Concern (below target
// AND over two years old) in N; OR bare in O, rewrapped as Visit (below target OR under 110 cars
// an hour, from Sites); NOT bare in P, rewrapped as Ramping. Site ages in L are typed until 3.2.1
// builds them. Graded on values and liveness. The closer ages Cedar Park to three years.
import { liveness } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const summary = ses => sheetOf(ses, 'Summary');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const same = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) < 1e-9 : a === b);
const ROWS = [5, 6, 7, 8, 9, 10];
const at = (sh, ref) => sh.selectionText() === ref;
const column = (sh, col, want) => ROWS.every(r => same(sh.value(col + r), want(sh, r))) && [5, 10].every(r => liveness(sh, col + r).ok);
const below = (sh, r) => sh.value('C' + r) < sh.value('D' + r);
const old = (sh, r) => sh.value('L' + r) > 2;
const cap = (ses, r) => { const si = sheetOf(ses, 'Sites'); return si ? si.value('F' + r) : null; };
const AND_ = (sh, r) => below(sh, r) && old(sh, r);
const andCol = sh => column(sh, 'M', AND_);
const concern = sh => column(sh, 'N', (s, r) => (AND_(s, r) ? 'Concern' : '-'));
const visit = (sh, ses) => column(sh, 'O', (s, r) => (below(s, r) || cap(ses, r) < 110 ? 'Visit' : '-'));
const OR_ = (sh, ses, r) => below(sh, r) || cap(ses, r) < 110;
const orCol = (sh, ses) => column(sh, 'O', (s, r) => OR_(s, ses, r));
const notCol = sh => column(sh, 'P', (s, r) => !old(s, r));
const ramping = sh =>column(sh, 'P', (s, r) => (!old(s, r) ? 'Ramping' : '-'));

export default {
  id: 'and-or-not',
  chapter: 'formulas',
  section: 'Logic',
  module: 'logic',
  workbook: 'clearcoat-databook',
  state: { before: 'S1b', after: 'S1c' },
  title: 'AND, OR and NOT',
  difficulty: 'medium',
  tags: ['formulas', 'logic', 'and', 'or', 'not'],
  access: 'paid',
  minutes: 6,
  headline: 'AND',
  conventions: ['E6'],
  teaches: ['and-or-not'],
  uses: ['if-function', 'formula-basics', 'fill-down-right', 'cross-sheet-ref', 'arrow-keys', 'ctrl-arrow', 'shift-arrow', 'ctrl-shift-arrow'],
  prerequisites: ['nested-if-ifs-min-max'],
  brief: 'Some questions have two parts: a site is a concern if it is below target AND it is more than two years old, because a new site is allowed to ramp. AND is true only when every test is true, OR when any is, and NOT flips one. They sit inside IF, and each returns TRUE or FALSE on its own, which you can read straight off the sheet before you wrap it. Build the compound flags the buyers will ask about. The key is `AND`.',
  goals: [
    { id: 'read-age', teach: 'Site age is the years since a site opened. A new site takes about two years to ramp up to its volume, so a buyer reads the young ones separately.',
      text: 'Select the site ages L5:L10, typed until module 3.2 builds them from the opening dates: Cedar Park is a week old and reads 0.', keys: '↓ ×3 Ctrl+→ ↓ Ctrl+→ Ctrl+Shift+↓', requires: ['ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range L5:L10 · Age (years) is the last filled column of the block.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && at(sh, 'L5:L10'); } },
    { id: 'and-bare', teach: 'AND(test, test) is TRUE only when every test inside it holds. Written bare it shows TRUE or FALSE, so you can read the answer before you wrap it in IF.',
      text: 'In M5, type =AND(C5<D5,L5>2) with no IF around it, fill it down to M10 and read the TRUE and FALSE column.', keys: '→ "=AND(C5<D5,L5>2)" ↵ ↑ Shift+↓ ×5 Ctrl+D', requires: ['and-or-not', 'fill-down-right', 'shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range M5:M10 · Cedar Park is below target but not over two years, so even it reads FALSE.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && andCol(sh); } },
    { id: 'concern', text: `Wrap it for the page: N5 =IF(AND(C5<D5,L5>2),"Concern","-"), filled down to N10.`, keys: `→ '=IF(AND(C5<D5,L5>2),"Concern","-")' ↵ ↑ Shift+↓ ×5 Ctrl+D`, requires: ['and-or-not', 'if-function', 'fill-down-right', 'shift-arrow', 'arrow-keys'], convention: 'E6',
      hintStuck: 'pulse range N5:N10 · The AND you just read becomes the IF’s test.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && concern(sh); } },
    { id: 'or-bare', teach: 'OR(test, test) is TRUE when any one test holds, so one IF can cover two reasons to send someone out.',
      text: 'A site needs a visit if it is below target OR under 110 cars an hour: type =OR(C5<D5,Sites!F5<110) bare in O5 and fill it to O10.', keys: '→ "=OR(C5<D5,Sites!F5<110)" ↵ ↑ Shift+↓ ×5 Ctrl+D', requires: ['and-or-not', 'cross-sheet-ref', 'fill-down-right', 'shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range O5:O10 · Capacity sits on Sites in column F, a row per site in the same order.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && orCol(sh, ses); } },
    { id: 'visit', text: `Wrap it for the page: with O5:O10 still selected, type =IF(OR(C5<D5,Sites!F5<110),"Visit","-") and press Ctrl+Enter.`, keys: `'=IF(OR(C5<D5,Sites!F5<110),"Visit","-")' Ctrl+↵`, requires: ['and-or-not', 'if-function', 'cross-sheet-ref', 'ctrl-enter-fill'], convention: 'E6',
      hintStuck: 'pulse range O5:O10 · The OR you just read becomes the IF’s test.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && visit(sh, ses); } },
    { id: 'not-bare', teach: 'NOT(test) flips TRUE to FALSE and back: NOT(L5>2) is TRUE for a site two years old or younger.',
      text: 'The ramping sites are the ones NOT over two years old: type =NOT(L5>2) bare in P5 and fill it to P10.', keys: '→ "=NOT(L5>2)" ↵ ↑ Shift+↓ ×5 Ctrl+D', requires: ['and-or-not', 'fill-down-right', 'shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range P5:P10 · Only Cedar Park reads TRUE.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && notCol(sh); } },
    { id: 'ramping', text: `Wrap it for the page: with P5:P10 still selected, type =IF(NOT(L5>2),"Ramping","-") and press Ctrl+Enter.`, keys: `'=IF(NOT(L5>2),"Ramping","-")' Ctrl+↵`, requires: ['and-or-not', 'if-function', 'ctrl-enter-fill'],
      hintStuck: 'pulse range P5:P10 · Only Cedar Park is young enough.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && ramping(sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Summary!L10" Enter "3" Enter Ctrl+G "Summary!N10" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Cedar Park’s age in L10 change to 3 and its flags move: Ramping goes, and Concern comes up in N10.', requires: [],
      hintStuck: 'pulse cell N10 · Below target and over two years: both tests now hold.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'M5:M10 read the bare AND as TRUE or FALSE', check: (s, ses) => { const sh = summary(ses); return !!sh && andCol(sh); } },
    { text: 'N5:N10 flag Concern, O5:O10 Visit and P5:P10 Ramping, live', check: (s, ses) => { const sh = summary(ses); return !!sh && concern(sh) && visit(sh, ses) && ramping(sh); } },
  ],
  closing: [
    'Each two-part question is answered in one cell, and you can read every answer before it is wrapped.',
    'AND, OR and NOT put two tests inside one IF instead of an IF inside an IF (E6), and the bare AND column shows the logic a reviewer would otherwise have to work out in their head.',
  ],
  solution: `Down Down Down Ctrl+Right Down Ctrl+Right Ctrl+Shift+Down Right "=AND(C5<D5,L5>2)" Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Right '=IF(AND(C5<D5,L5>2),"Concern","-")' Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Right "=OR(C5<D5,Sites!F5<110)" Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D '=IF(OR(C5<D5,Sites!F5<110),"Visit","-")' Ctrl+Enter Right "=NOT(L5>2)" Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D '=IF(NOT(L5>2),"Ramping","-")' Ctrl+Enter`,
};
