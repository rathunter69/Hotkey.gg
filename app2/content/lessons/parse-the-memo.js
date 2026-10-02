// Chapter 3 · 3.4.2 FIND, SEARCH and SUBSTITUTE: parse the memo (clearcoat-databook, S4a → S4b)
// The memo packs three facts into one string, "Wash D @ AUS-DOM (kiosk)". On Transactions the
// learner finds the @ with FIND (U), cuts the site out after it with MID (V), cuts the channel out
// between the brackets with two FINDs (W), reads the package case-blind with SEARCH and UPPER (X),
// reads the lower-case row where it pays off, and drops the kiosk tag with SUBSTITUTE (Y). The raw
// memo stays where it is. The closer changes one memo's channel and the parsed column follows.
import { transactions, settled, selected, onSheet, block } from './lib/databook-checks.js';

const R1 = 5, R2 = 94;
const memo = (sh, r) => { const v = sh.value('F' + r); return typeof v === 'string' ? v : ''; };
const at = (sh, r) => memo(sh, r).indexOf('@');
const pos = sh => block(sh, 'U', R1, R2, { fns: ['FIND'], want: r => at(sh, r) + 1 });
const siteOf = sh => block(sh, 'V', R1, R2, { fns: ['MID', 'FIND'], want: r => memo(sh, r).substr(at(sh, r) + 2, 7) });
const channel = sh => block(sh, 'W', R1, R2, { fns: ['MID', 'FIND'], want: r => { const m = memo(sh, r), a = m.indexOf('('), b = m.indexOf(')'); return m.slice(a + 1, b); } });
const pkg = sh => block(sh, 'X', R1, R2, { fns: ['UPPER', 'MID', 'SEARCH'], want: r => { const m = memo(sh, r), i = m.toLowerCase().indexOf('wash '); return m.substr(i + 5, 1).toUpperCase(); } });
const noKiosk = sh => block(sh, 'Y', R1, R2, { fns: ['SUBSTITUTE'], want: r => memo(sh, r).split(' (kiosk)').join('') });
const F = {
  at: '=FIND("@",F5)',
  site: '=MID(F5,FIND("@",F5)+2,7)',
  channel: '=MID(F5,FIND("(",F5)+1,FIND(")",F5)-FIND("(",F5)-1)',
  pkg: '=UPPER(MID(F5,SEARCH("wash ",F5)+5,1))',
  sub: '=SUBSTITUTE(F5," (kiosk)","")',
};

export default {
  id: 'parse-the-memo',
  chapter: 'formulas',
  section: 'Text',
  module: 'text',
  workbook: 'clearcoat-databook',
  state: { before: 'S4a', after: 'S4b' },
  title: 'FIND, SEARCH and SUBSTITUTE: parse the memo',
  difficulty: 'hard',
  tags: ['formulas', 'functions', 'text'],
  access: 'paid',
  minutes: 6,
  headline: 'FIND',
  conventions: ['C1', 'F5'],
  teaches: ['find-search', 'substitute-upper'],
  uses: ['left-right-mid-len', 'go-to', 'ctrl-enter-fill'],
  prerequisites: ['split-the-codes'],
  brief: 'The memo packs three facts into one string: "Wash D @ AUS-DOM (kiosk)". FIND returns the position of a character, so the site code is whatever sits after "@ ", and the channel is whatever sits between the brackets: MID with FIND tells it where to cut. SEARCH is FIND without caring about case, and SUBSTITUTE swaps text for text. Pull the site, the channel and the package out of the memo, and leave the memo itself alone. The key is `FIND`.',
  goals: [
    { id: 'find', teach: 'FIND(find_text, within_text) returns the position of the first match, counting from 1, so FIND("@",F5) reads 8 in “Wash B @ AUS-AIR”. It is case-sensitive, and it returns #VALUE! when the text is not there.', text: 'On Transactions, select U5:U94, type =FIND("@",F5) and press Ctrl+Enter: the position of the @ in every memo.', keys: `Ctrl+G "Transactions!U5:U94" ↵ '${F.at}' Ctrl+↵`, requires: ['find-search', 'go-to', 'ctrl-enter-fill'],
      hintStuck: 'pulse range U5:U94 · The memos sit in column F.',
      check: (s, ses) => { const sh = transactions(ses); return settled(ses) && pos(sh); } },
    { id: 'site', teach: 'MID needs a start, and FIND gives it one: the code starts two characters after the @, so MID(F5,FIND("@",F5)+2,7) cuts it out wherever the @ falls. Nest FIND inside MID and the position is never typed.', text: `The site from the memo in V5:V94: ${F.site} with Ctrl+Enter, then compare it with column B.`, keys: `Ctrl+G "V5:V94" ↵ '${F.site}' Ctrl+↵`, requires: ['find-search', 'left-right-mid-len', 'go-to', 'ctrl-enter-fill'],
      hintStuck: 'pulse range V5:V94 · Two past the @ is where the code starts, and it is seven characters long.',
      check: (s, ses) => { const sh = transactions(ses); return settled(ses) && siteOf(sh); } },
    { id: 'channel', teach: 'The channel has no fixed length, so cut from one FIND to another: start one past the "(", and take as many characters as lie between the brackets. FIND and SEARCH also take a third argument, where to start looking, which finds the second space as easily as the first.', text: `The channel in W5:W94: ${F.channel} with Ctrl+Enter.`, keys: `Ctrl+G "W5:W94" ↵ '${F.channel}' Ctrl+↵`, requires: ['find-search', 'left-right-mid-len', 'go-to', 'ctrl-enter-fill'],
      hintStuck: 'pulse range W5:W94 · The length is the close bracket’s position less the open bracket’s, less one.',
      check: (s, ses) => { const sh = transactions(ses); return settled(ses) && channel(sh); } },
    { id: 'package', teach: 'SEARCH works like FIND but ignores case, so SEARCH("wash ",F5) finds “Wash ” and “wash ” alike. UPPER capitalizes every letter, so the package reads one way whatever the terminal typed.', text: `The package in X5:X94, case-blind: ${F.pkg} with Ctrl+Enter.`, keys: `Ctrl+G "X5:X94" ↵ '${F.pkg}' Ctrl+↵`, requires: ['find-search', 'substitute-upper', 'left-right-mid-len', 'go-to', 'ctrl-enter-fill'],
      hintStuck: 'pulse range X5:X94 · The letter sits five characters after the start of “wash ”.',
      check: (s, ses) => { const sh = transactions(ses); return settled(ses) && pkg(sh); } },
    { id: 'lower', text: 'Select the lower-case memo and its parsed columns in F37:X37: “Wash d” still reads D in X37.', keys: 'Ctrl+G "F37:X37" ↵', requires: ['go-to'],
      hintStuck: 'pulse range F37:X37 · One memo in the export came through with a lower-case package.',
      check: (s, ses) => { const sh = transactions(ses); return settled(ses) && onSheet(ses, 'Transactions') && selected(sh, 'F37:X37'); } },
    { id: 'substitute', teach: 'SUBSTITUTE(text, old_text, new_text) swaps every match for the new text, and a fourth argument changes only the nth. REPLACE swaps by position instead of by content. Parse into helper columns and keep the raw memo: it is the audit trail.', text: `The memo without the kiosk tag in Y5:Y94: ${F.sub} with Ctrl+Enter.`, keys: `Ctrl+G "Y5:Y94" ↵ '${F.sub}' Ctrl+↵`, requires: ['substitute-upper', 'go-to', 'ctrl-enter-fill'], convention: 'C1',
      hintStuck: 'pulse range Y5:Y94 · Swap the space and the tag for nothing at all.',
      check: (s, ses) => { const sh = transactions(ses); return settled(ses) && noKiosk(sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Transactions!F5" Enter "Wash B @ AUS-AIR (app)" Enter Ctrl+G "Transactions!U5:Y5" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch the memo in F5 change its channel to (app), and the channel in W5 follow it.', requires: [],
      hintStuck: 'pulse cell W5 · Every parsed column reads the raw memo in F.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'U5:W94 find the @ and cut the site and the channel out of the memo', check: (s, ses) => { const sh = transactions(ses); return pos(sh) && siteOf(sh) && channel(sh); } },
    { text: 'X5:X94 read the package case-blind with SEARCH and UPPER', check: (s, ses) => pkg(transactions(ses)) },
    { text: 'Y5:Y94 drop the kiosk tag with SUBSTITUTE, and the raw memo is untouched', check: (s, ses) => noKiosk(transactions(ses)) },
  ],
  closing: [
    'You pulled three facts out of one string, and the raw memo is still there for the audit.',
    'FIND and SEARCH say where to cut, MID cuts, UPPER and SUBSTITUTE make the pieces read one way. Best practice: parse into helper columns and never overwrite the raw text, so anyone can check a parsed value against the string it came from.',
  ],
  solution: `Ctrl+G "Transactions!U5:U94" Enter '${F.at}' Ctrl+Enter Ctrl+G "V5:V94" Enter '${F.site}' Ctrl+Enter Ctrl+G "W5:W94" Enter '${F.channel}' Ctrl+Enter `
    + `Ctrl+G "X5:X94" Enter '${F.pkg}' Ctrl+Enter Ctrl+G "F37:X37" Enter Ctrl+G "Y5:Y94" Enter '${F.sub}' Ctrl+Enter`,
};
