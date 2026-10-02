// Chapter 3 · 3.1.3 AND, OR and NOT (clearcoat-databook, S1b → S1c)
// Two-part questions on the flags block. AND is written bare in M5:M10 first, so the TRUE/FALSE
// column reads before it is wrapped; then the three page flags: Concern (below target AND over two
// years old) in N, Visit (below target OR under 110 cars an hour, from Sites) in O, Ramping (NOT
// over two years) in P. Site ages in L are typed until 3.2.1 builds them. Graded on values and
// liveness. The closer ages Cedar Park to three years and its flags trade places.
import { liveness } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const summary = ses => sheetOf(ses, 'Summary');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const same = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) < 1e-9 : a === b);
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
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
const ramping = sh => column(sh, 'P', (s, r) => (!old(s, r) ? 'Ramping' : '-'));

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
  uses: ['if-function', 'formula-basics', 'fill-down-right', 'cross-sheet-ref', 'edit-mode-f2', 'escape-cancels', 'arrow-keys', 'ctrl-arrow', 'shift-arrow', 'ctrl-shift-arrow'],
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
    { id: 'visit', teach: 'OR(test, test) is TRUE when any one test holds, so one IF covers two reasons to send someone out.',
      text: `A site needs a visit if it is below target OR under 110 cars an hour: O5 =IF(OR(C5<D5,Sites!F5<110),"Visit","-"), filled down.`, keys: `→ '=IF(OR(C5<D5,Sites!F5<110),"Visit","-")' ↵ ↑ Shift+↓ ×5 Ctrl+D`, requires: ['and-or-not', 'if-function', 'cross-sheet-ref', 'fill-down-right', 'shift-arrow', 'arrow-keys'], convention: 'E6',
      hintStuck: 'pulse range O5:O10 · Capacity sits on Sites in column F, a row per site in the same order.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && visit(sh, ses); } },
    { id: 'ramping', teach: 'NOT(test) flips TRUE to FALSE and back: NOT(L5>2) is TRUE for a site two years old or younger.',
      text: `The ramping sites are the ones NOT over two years old: P5 =IF(NOT(L5>2),"Ramping","-"), filled down to P10.`, keys: `→ '=IF(NOT(L5>2),"Ramping","-")' ↵ ↑ Shift+↓ ×5 Ctrl+D`, requires: ['and-or-not', 'if-function', 'fill-down-right', 'shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range P5:P10 · Only Cedar Park is young enough.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && ramping(sh); } },
    { id: 'read-back', text: 'Open Riverside’s Visit in O7 with F2 and read the OR, then Esc: it is on target, so the 100 cars an hour on Sites carried it.', keys: '← ↓ ×2 F2 Esc', requires: ['edit-mode-f2', 'escape-cancels', 'arrow-keys'],
      hintStuck: 'pulse cell O7 · One true test is enough for OR.',
      check: (s, ses) => { const sh = summary(ses); const k = windowKeys(ses); return settled(ses) && !!sh && at(sh, 'O7') && k.includes('F2') && k.includes('Esc'); } },
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
  solution: `Down Down Down Ctrl+Right Down Ctrl+Right Ctrl+Shift+Down Right "=AND(C5<D5,L5>2)" Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Right '=IF(AND(C5<D5,L5>2),"Concern","-")' Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Right '=IF(OR(C5<D5,Sites!F5<110),"Visit","-")' Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Right '=IF(NOT(L5>2),"Ramping","-")' Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Left Down Down F2 Escape`,
};
