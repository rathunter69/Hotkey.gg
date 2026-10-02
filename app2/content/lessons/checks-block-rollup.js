// Chapter 3 · 3.6.4 The checks block with a roll-up flag (clearcoat-databook, S6c → S6d)
// The Summary's Checks block at rows 79 to 87 has four live checks (C80:C83) and four empty cells.
// The learner links the loan schedule's check (=Loans!C167) and builds the members check, both green
// as links to other sheets, counts the checks not at zero in C86, turns the count into OK or CHECK in
// C87, links the flag to the top of the page in C2, then picks C2 and C87 together with Go To Special
// (Formulas, Text only, over column C) and gives them one conditional format that turns CHECK red.
// Checks read each cell's value and the shared liveness rule; the roll-up is graded by perturbing a
// check (the count must move), and the conditional format by the rule the sheet keeps.
import { liveness } from '../../app/graders.js';
import { formulaRefs } from '../../engine/formula.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const summary = ses => sheetOf(ses, 'Summary');
const settled = ses => !ses.editing && !ses.dialog;
const onSummary = ses => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === 'Summary';
const green = (sh, ref) => sh.cellAt(ref).fontColor === 'green';
const zeroLive = (sh, ref) => !!sh.cellAt(ref).formula && sh.value(ref) === 0;

/** The two new checks: the loan schedule's tie-out and members active plus cancelled against the list. */
// The shared liveness rule nudges inputs on the cell's own sheet, and these two read Loans and Members, so they are
// graded as links: a formula that reads at least one reference and shows what the other sheet's check reads.
const readsRefs = (sh, ref) => { try { return formulaRefs(sh.cellAt(ref).formula).length > 0; } catch (e) { return false; } };
const loanCheck = (sh, ses) => { const l = sheetOf(ses, 'Loans'); return zeroLive(sh, 'C84') && readsRefs(sh, 'C84') && !!l && sh.value('C84') === l.value('C167') && green(sh, 'C84'); };
const membersCheck = sh => zeroLive(sh, 'C85') && readsRefs(sh, 'C85') && green(sh, 'C85');
const CHECKS = ['C80', 'C81', 'C82', 'C83', 'C84', 'C85'];
const notZero = sh => CHECKS.filter(ref => sh.value(ref) !== 0).length;
const count = sh => !!sh.cellAt('C86').formula && sh.value('C86') === notZero(sh) && liveness(sh, 'C86').ok;
const flag = sh => !!sh.cellAt('C87').formula && sh.value('C87') === (sh.value('C86') === 0 ? 'OK' : 'CHECK') && liveness(sh, 'C87').ok;
const topLink = sh => !!sh.cellAt('C2').formula && sh.value('C2') === sh.value('C87') && liveness(sh, 'C2').ok;
const covers = (range, ref) => String(range || '').toUpperCase().split(',').some(part => { const [a, b] = part.split(':'); if (!b) return a === ref;
  const rc = x => { const m = /^([A-Z]+)(\d+)$/.exec(x); return m ? { c: m[1].charCodeAt(0) - 64, r: +m[2] } : null; }; const p = rc(a), q = rc(b), t = rc(ref);
  return !!(p && q && t) && t.r >= Math.min(p.r, q.r) && t.r <= Math.max(p.r, q.r) && t.c >= Math.min(p.c, q.c) && t.c <= Math.max(p.c, q.c); });
const redRule = sh => (sh.condFmt || []).some(r => covers(r.range, 'C2') && covers(r.range, 'C87') && r.kind === 'cellValue' && r.op === '=' && String(r.v1).replace(/"/g, '').toUpperCase() === 'CHECK' && /red/i.test(String(r.style || '')));

export default {
  id: 'checks-block-rollup',
  chapter: 'formulas',
  section: 'Auditing',
  module: 'auditing',
  workbook: 'clearcoat-databook',
  state: { before: 'S6c', after: 'S6d' },
  title: 'The checks block with a roll-up flag',
  difficulty: 'medium',
  tags: ['formulas', 'audit', 'checks'],
  access: 'paid',
  minutes: 7,
  headline: 'COUNTIF',
  conventions: ['F1', 'B2'],
  teaches: ['rollup-flag'],
  uses: ['check-cell', 'cross-sheet-ref', 'link-colour-convention', 'font-color', 'goto-special-types', 'go-to-special', 'formula-basics', 'go-to', 'keytips', 'shift-arrow', 'arrow-keys', 'row-col-select'],
  prerequisites: ['hardcode-external-link-hunt'],
  brief: 'A databook has a dozen things that must agree, and a reviewer wants one cell that says whether they all do. Each check is a live difference that reads zero; the roll-up is a count of the checks that do not, and a flag that reads OK or CHECK. Finish the Summary’s Checks block, put the flag at the top of the page and turn it red when it fails. The key is `COUNTIF`.',
  wow: 'Six checks feed one flag, and the databook says whether it ties before anyone asks.',
  goals: [
    { id: 'live-checks', teach: 'A check that reads another sheet is a link, so it is green like any link. The loan’s check already sits on Loans at C167; the Summary only points at it.',
      text: 'Fill the last two checks: =Loans!C167 in C84, then in C85 members active plus cancelled less the list, and make both green.',
      keys: 'Ctrl+G "C84" ↵ "=Loans!C167" ↵ \'=COUNTIF(Members!$J$5:$J$44,"Active")+COUNTIF(Members!$J$5:$J$44,"Cancelled")-COUNTA(Members!$B$5:$B$44)\' ↵ ↑ Shift+↑ Alt H F C → ×8 ↵', requires: ['check-cell', 'cross-sheet-ref', 'link-colour-convention', 'font-color', 'go-to', 'keytips', 'shift-arrow', 'arrow-keys'], convention: 'B2',
      hintStuck: 'pulse range C84:C85 · Both are differences that should read zero.',
      check: (s, ses) => { const sh = summary(ses); return onSummary(ses) && !!sh && loanCheck(sh, ses) && membersCheck(sh) && settled(ses); } },
    { id: 'count', teach: 'COUNTIF with "<>0" counts the cells that are not zero, so the roll-up reads how many checks fail. A count can be fooled by nothing, but a plain SUM of the checks can: one check off by +1 and another by -1 add to zero. =SUMPRODUCT(ABS(C80:C85)) adds the sizes of the misses instead, and is the safer total when a reader wants the amount.',
      text: 'In C86 count the checks not at zero with =COUNTIF(C80:C85,"<>0").',
      keys: '↓ \'=COUNTIF(C80:C85,"<>0")\' ↵', requires: ['rollup-flag', 'formula-basics', 'arrow-keys'], convention: 'F1',
      hintStuck: 'pulse cell C86 · The range is the six checks above it.',
      check: (s, ses) => { const sh = summary(ses); return onSummary(ses) && !!sh && count(sh) && settled(ses); } },
    { id: 'flag', text: 'In C87 turn the count into one word with =IF(C86=0,"OK","CHECK").',
      keys: '\'=IF(C86=0,"OK","CHECK")\' ↵', requires: ['rollup-flag', 'formula-basics'],
      hintStuck: 'pulse cell C87 · No checks off reads OK; anything else reads CHECK.',
      check: (s, ses) => { const sh = summary(ses); return onSummary(ses) && !!sh && count(sh) && flag(sh) && settled(ses); } },
    { id: 'top-link', text: 'Link the flag to the top of the Summary, =C87 in C2, so it is the first thing a reader sees.',
      keys: 'Ctrl+G "C2" ↵ "=C87" ↵', requires: ['formula-basics', 'go-to'],
      hintStuck: 'pulse cell C2 · The page’s first row under the title.',
      check: (s, ses) => { const sh = summary(ses); return onSummary(ses) && !!sh && flag(sh) && topLink(sh) && settled(ses); } },
    { id: 'pick-flags', text: 'Select column C and pick both flags at once with Go To Special, Formulas, Text only: C2 and C87 light.',
      keys: 'Ctrl+Space Ctrl+G Alt+S F U G E ↵', requires: ['goto-special-types', 'go-to-special', 'row-col-select'],
      hintStuck: 'pulse cell C87 · The only formulas in column C that return words are the two flags.',
      check: (s, ses) => { const sh = summary(ses); return onSummary(ses) && !!sh && topLink(sh) && sh.selectionText() === 'C2,C87' && settled(ses); } },
    { id: 'red', teach: 'Home › Conditional Formatting › Highlight Cells Rules › Equal To (Alt, H, L, H, E) formats every selected cell whose value equals what you type; light red fill with dark red text is its first style.',
      text: 'Give both a conditional format with Alt H L H E so CHECK turns red.',
      keys: 'Alt H L H E "CHECK" ↵', requires: ['keytips'], convention: 'F1',
      hintStuck: 'pulse cell C2 · Equal To, then type the word that should turn red.',
      check: (s, ses) => { const sh = summary(ses); return onSummary(ses) && !!sh && topLink(sh) && redRule(sh) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Members!J5" Enter "Paused" Enter Ctrl+G "Summary!C2" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Watch a member’s status typed over on Members turn the flag in C2 to a red CHECK, then go back.', requires: [],
      hintStuck: 'pulse cell C2 · A status the members check does not know breaks the tie.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'All six checks are live and read zero, the count in C86 reads 0 and the flag in C87 reads OK', check: (s, ses) => { const sh = summary(ses); return !!sh && loanCheck(sh, ses) && membersCheck(sh) && count(sh) && flag(sh) && sh.value('C87') === 'OK'; } },
    { text: 'C2 shows the flag, and both flags turn red on CHECK', check: (s, ses) => { const sh = summary(ses); return !!sh && topLink(sh) && redRule(sh); } },
  ],
  closing: [
    'The databook now says, in its top row, whether it ties: six live checks, one count, one word. A reviewer reads C2 first and only goes looking when it is red.',
    'Add a check whenever two numbers in the file must agree, and point the count at it. The flag is only as good as the list it counts.',
  ],
  solution: 'Ctrl+G "C84" Enter "=Loans!C167" Enter \'=COUNTIF(Members!$J$5:$J$44,"Active")+COUNTIF(Members!$J$5:$J$44,"Cancelled")-COUNTA(Members!$B$5:$B$44)\' Enter Up Shift+Up Alt H F C Right Right Right Right Right Right Right Right Enter Down \'=COUNTIF(C80:C85,"<>0")\' Enter \'=IF(C86=0,"OK","CHECK")\' Enter Ctrl+G "C2" Enter "=C87" Enter Ctrl+Space Ctrl+G Alt+S F U G E Enter Alt H L H E "CHECK" Enter',
};
