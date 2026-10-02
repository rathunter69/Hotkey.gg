// Chapter 4 · 4.5.1 A case toggle with CHOOSE and INDEX (clearcoat-pack, S45 → S451)
// Scenarios holds three typed cases in C:E and the picker in C10 (4.2.4). The learner turns the
// picker into a switch (C11 =MATCH), builds the live column G5:G8 (CHOOSE on the first line, INDEX
// below), the four outputs that carry the model (washes a year, revenue, site contribution,
// EBITDA), a formula rule that lights the live case, and a title that names it. The labels, the
// cost lines between the outputs and every number format are planted.
import { stateOf, SCENARIOS, formatOnly } from '../workbooks/clearcoat-pack.js';
import { scenarios, sheetIn, settled, calls, reads, live, near } from './lib/pack-checks.js';

const C = SCENARIOS;
const DONE = stateOf('S451').sheets.find(s => s.name === 'Scenarios').cells;
const plantFull = ['G4', 'B11', 'B16', 'B17', 'B18', 'B19', 'B20', 'B21', 'B22', 'B23', 'B24', 'B25', 'C19', 'C20', 'C21', 'C23', 'C25'];
const plantFmt = ['C11', 'G5', 'G6', 'G7', 'G8', 'C17', 'C18', 'C22', 'C24'];
const PLANT = Object.fromEntries([...plantFull.map(k => ['Scenarios!' + k, DONE[k]]), ...plantFmt.map(k => ['Scenarios!' + k, formatOnly(DONE[k])])]);

const CASES = ses => { const L = sheetIn(ses, 'Lists'); return [5, 6, 7].map(r => L.value('L' + r)); };
const sw = ses => { const sh = scenarios(ses); return CASES(ses).indexOf(sh.value('C10')) + 1; };
const pick = (sh, r, n) => sh.value('CDE'[n - 1] + r);
const switchOk = ses => { const sh = scenarios(ses); return !!sh && calls(sh, 'C11', ['MATCH']) && reads(sh, 'C11', ['C10']) && sw(ses) > 0 && sh.value('C11') === sw(ses); };
const washesOk = ses => { const sh = scenarios(ses); const n = sh && sh.value('C11'); return !!sh && calls(sh, 'G5', ['CHOOSE']) && n >= 1 && near(sh.value('G5'), pick(sh, 5, n)) && live(sh, 'G5'); };
const restOk = ses => { const sh = scenarios(ses); const n = sh && sh.value('C11'); return !!sh && [6, 7, 8].every(r => calls(sh, 'G' + r, ['INDEX']) && near(sh.value('G' + r), pick(sh, r, n))) && live(sh, 'G6'); };
const days = ses => sheetIn(ses, 'Inputs').value('C10');
const revenueOk = ses => { const sh = scenarios(ses); return !!sh && near(sh.value('C17'), sh.value('G8') * sh.value('G5') * days(ses)) && near(sh.value('C18'), sh.value('C17') * sh.value('G6')) && live(sh, 'C17') && live(sh, 'C18'); };
const ebitdaOk = ses => { const sh = scenarios(ses); if (!sh) return false; const contrib = ['C18', 'C19', 'C20', 'C21'].reduce((t, k) => t + sh.value(k), 0); return near(sh.value('C22'), contrib) && near(sh.value('C24'), sh.value('C22') + sh.value('C23')) && live(sh, 'C22') && live(sh, 'C24'); };
/** The rule lights the live case's column of C4:E8 and nothing else. */
const lightsLive = ses => { const sh = scenarios(ses); if (!sh || !(sh.condFmt || []).some(x => x.kind === 'formula')) return false; const n = sw(ses); const map = sh.condFmtMap(); return [4, 5, 6, 7, 8].every(r => ['C', 'D', 'E'].every((col, i) => !!(map[col + r] && map[col + r].fill) === (i + 1 === n))); };
const titleOk = ses => { const sh = scenarios(ses); return !!sh && !!sh.formula('A1') && reads(sh, 'A1', ['C10']) && String(sh.value('A1')).startsWith(sh.value('C10') + ' case'); };
const F = {
  sw: `=MATCH(C10,Lists!$L$5:$L$7,0)`, choose: '=CHOOSE($C$11,C5,D5,E5)', index: '=INDEX(C6:E6,$C$11)',
  washes: '=G8*G5*Inputs!$C$10', revenue: '=C17*G6', contrib: '=SUM(C18:C21)', ebitda: '=C22+C23',
  rule: '=C$4=$C$10', title: DONE.A1.formula,
};

export default {
  id: 'a-case-toggle-with-choose-and-index',
  chapter: 'data-and-lookups',
  section: 'Scenarios and sensitivity',
  module: 'scenarios-and-sensitivity',
  workbook: 'clearcoat-pack',
  state: { before: 'S45', after: 'S451' },
  plant: PLANT,
  title: 'A case toggle with CHOOSE and INDEX',
  difficulty: 'medium',
  tags: ['scenarios', 'lookups', 'modeling'],
  access: 'paid',
  minutes: 7,
  headline: 'CHOOSE',
  conventions: ['E9', 'B4'],
  teaches: ['case-switch'],
  uses: ['go-to', 'sheet-reference', 'ctrl-enter-fill', 'shift-arrow', 'ctrl-arrow', 'relative-absolute', 'cross-sheet-ref', 'formula-rule', 'dynamic-title'],
  prerequisites: ['challenge-an-export-summarized-three-ways'],
  brief: 'Three cases sit as three columns of inputs on Scenarios: washes a day per site, blended ticket, member share and sites at year end. One cell, the switch, says which column is live: CHOOSE(switch, a, b, c) returns the nth argument, and INDEX(range, switch) does the same from a range. The live column feeds the model, so every output moves when the switch does, and the picker in C10 drives the switch. Build the switch, the live column and the outputs. The key is `CHOOSE`.',
  goals: [
    { id: 'switch', teach: 'A case switch is one cell that says which case is live, as a number. MATCH turns the picker’s name into that number, so a reader picks a word and the model reads 1, 2 or 3.',
      text: 'Turn the picker into the switch: C11 =MATCH(C10,Lists!$L$5:$L$7,0), the case’s place in the list.', keys: `Ctrl+G "Scenarios!C11" ↵ "${F.sw}" Ctrl+↵`, requires: ['case-switch', 'go-to', 'cross-sheet-ref'],
      hintStuck: 'pulse cell Scenarios!C11 · The case names sit in Lists!L5:L7, in the picker’s order.',
      check: (s, ses) => settled(ses) && switchOk(ses) },
    { id: 'choose', teach: 'CHOOSE(index, value1, value2, value3) returns the value in the place the index names. Anchor the switch with $ so every line reads the same cell.',
      text: 'Live washes a day: G5 =CHOOSE($C$11,C5,D5,E5).', keys: `Ctrl+↑ ×2 ↑ ×3 Ctrl+→ → → "${F.choose}" ↵`, requires: ['case-switch', 'relative-absolute', 'ctrl-arrow'],
      hintStuck: 'pulse cell G5 · CHOOSE takes the switch first, then the three cases in order.',
      check: (s, ses) => settled(ses) && switchOk(ses) && washesOk(ses) },
    { id: 'index', teach: 'INDEX(C6:E6, n) returns the nth cell of the range: the same answer as CHOOSE, from a range that grows by one column when a fourth case arrives.',
      text: 'Live ticket, share and sites: select G6:G8 and enter =INDEX(C6:E6,$C$11) with Ctrl+Enter.', keys: `Shift+↓ ×2 "${F.index}" Ctrl+↵`, requires: ['case-switch', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range G6:G8 · The row is relative, the switch is anchored, so one entry fills three lines.',
      check: (s, ses) => settled(ses) && restOk(ses) },
    { id: 'revenue', text: 'Feed the model from the live column: C17 =G8*G5*Inputs!$C$10, washes a year, and C18 =C17*G6, revenue.', keys: `Ctrl+← ← ← Ctrl+↓ ×4 ↑ ↑ "${F.washes}" ↵ "${F.revenue}" ↵`, requires: ['cross-sheet-ref', 'ctrl-arrow'],
      hintStuck: 'pulse range C17:C18 · Sites times washes a day times days a year; then washes times the ticket.',
      check: (s, ses) => settled(ses) && revenueOk(ses) },
    { id: 'ebitda', text: 'Close the model: C22 =SUM(C18:C21), site contribution, and C24 =C22+C23, EBITDA.', keys: `↓ ×3 "${F.contrib}" ↵ ↓ "${F.ebitda}" ↵`, requires: ['formula-basics'],
      hintStuck: 'pulse range C22:C24 · The costs between are negative, so a sum nets them.',
      check: (s, ses) => settled(ses) && ebitdaOk(ses) },
    { id: 'rule', text: 'Light the live case: on C4:E8, a formula rule =C$4=$C$10 with a green fill.', keys: `Ctrl+↑ ×5 Shift+→ ×2 Shift+↓ ×4 Alt H L N "${F.rule}" ↓ ↓ ↵`, requires: ['formula-rule', 'go-to'],
      hintStuck: 'pulse range C4:E8 · C$4 reads each column’s case name; the rule holds where it matches the picker.',
      check: (s, ses) => settled(ses) && lightsLive(ses) },
    { id: 'title', text: 'Name the case on the page: A1 =$C$10&" case: Clearcoat Express forecast, FY27".', keys: `Ctrl+↑ Ctrl+← '${F.title}' ↵`, requires: ['dynamic-title'], convention: 'E9',
      hintStuck: 'pulse cell A1 · A printout should say which case it shows without anyone reading the switch.',
      check: (s, ses) => settled(ses) && titleOk(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Scenarios!C10" Enter "Downside" Enter Ctrl+G "Scenarios!C24" Enter', cadence: 320 },
      text: 'Does it tie? Watch the picker go to Downside: EBITDA falls, the green moves to column E and the title follows.', requires: [],
      hintStuck: 'pulse cell C24 · One switch moves every output.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C11 is the switch and G5:G8 read the live case', check: (s, ses) => switchOk(ses) && washesOk(ses) && restOk(ses) },
    { text: 'The outputs run from the live column to EBITDA in C24', check: (s, ses) => revenueOk(ses) && ebitdaOk(ses) },
    { text: 'The live case is lit and named in the title', check: (s, ses) => lightsLive(ses) && titleOk(ses) },
  ],
  closing: [
    'One switch runs three cases, and there’s no second copy of the file.',
    'The picker sets a word, MATCH turns it into the switch, and CHOOSE and INDEX read the live column, so the outputs never know which case they are in. Best practice: the older desk habit is OFFSET off the switch; it recalculates on every change and hides from trace arrows, so the standard is CHOOSE or INDEX.',
  ],
  solution: `Ctrl+G "Scenarios!C11" Enter "${F.sw}" Ctrl+Enter Ctrl+Up Ctrl+Up Up Up Up Ctrl+Right Right Right "${F.choose}" Enter `
    + `Shift+Down Shift+Down "${F.index}" Ctrl+Enter Ctrl+Left Left Left Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Up Up "${F.washes}" Enter "${F.revenue}" Enter `
    + `Down Down Down "${F.contrib}" Enter Down "${F.ebitda}" Enter Ctrl+Up Ctrl+Up Ctrl+Up Ctrl+Up Ctrl+Up Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Shift+Down Alt H L N "${F.rule}" Down Down Enter `
    + `Ctrl+Up Ctrl+Left '${F.title}' Enter`,
};
