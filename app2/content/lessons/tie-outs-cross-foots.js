// Chapter 5 · 5.5.1 Tie-outs and cross-foots (clearcoat-model, B551 → B552)
// The Checks sheet as 5.4 leaves it: the balance, cash, debt, PP&E and revenue ties live, three rows
// still marked pending (the cost build's cross-foot, the equity roll, EBITDA against the Chapter 2
// P&L) and the two limit rows empty. The learner fills each, clears the pending notes and reads the
// flag on the Cover. Each check is graded on its value and the cells it reads (a check reads zero
// whatever its inputs do, so the liveness rule cannot see it). The row formats are planted.
import { sheetIn, settled, calls, checkRow, rowRefs, formatsOf, doneFormula, R, at } from './lib/model-checks.js';

const CK = 'Checks';
const ck = ses => sheetIn(ses, CK);
const F = {
  eq: doneFormula(CK, 'C' + R(CK, 'eq')), ebitda: doneFormula(CK, 'C' + R(CK, 'ebitda')), xfoot: doneFormula(CK, 'C' + R(CK, 'xfoot')),
  debtNeg: doneFormula(CK, 'C' + R(CK, 'debtNeg')), ppeNeg: doneFormula(CK, 'C' + R(CK, 'ppeNeg')),
};
const BSr = k => R('BS', k), SCr = k => R('Schedules', k);
const eqOk = ses => checkRow(ck(ses), rowRefs(CK, 'eq'), (ref, c) => ['openEq', 'ni', 'dist', 'closeEq'].map(k => `BS!${c}${BSr(k)}`));
const ebitdaOk = ses => { const sh = ck(ses); return checkRow(sh, rowRefs(CK, 'ebitda'), () => []) && ['C', 'D', 'E'].every(c => sh.formula(c + R(CK, 'ebitda')) && checkRow(sh, [c + R(CK, 'ebitda')], () => [`IS!${c}${R('IS', 'ebitda')}`, `${c}${R(CK, 'pnl')}`])); };
const xfootOk = ses => { const sh = ck(ses); const ref = 'C' + R(CK, 'xfoot'); return checkRow(sh, [ref], () => [`Schedules!C${SCr('labor')}`, `Schedules!J${SCr('mkt')}`, `Schedules!C${SCr('siteCosts')}`, `Schedules!J${SCr('siteCosts')}`]) && calls(sh, ref, ['SUM']); };
const debtOk = ses => { const sh = ck(ses); return checkRow(sh, rowRefs(CK, 'debtNeg'), (ref, c) => ['termClose', 'ddClose', 'revClose'].map(k => `Schedules!${c}${SCr(k)}`)) && calls(sh, 'C' + R(CK, 'debtNeg'), ['COUNTIF']); };
const ppeOk = ses => { const sh = ck(ses); return checkRow(sh, rowRefs(CK, 'ppeNeg'), (ref, c) => [`Schedules!${c}${SCr('ppeClose')}`]) && calls(sh, 'C' + R(CK, 'ppeNeg'), ['COUNTIF']); };
const PENDING = ['xfoot', 'eq', 'ebitda'].map(k => 'K' + R(CK, k));
const pendingGone = ses => { const sh = ck(ses); return !!sh && PENDING.every(ref => sh.value(ref) == null || sh.value(ref) === ''); };
const flagOk = ses => sheetIn(ses, 'Cover').value('C' + R('Cover', 'flag')) === 'OK';
const allOk = ses => eqOk(ses) && ebitdaOk(ses) && xfootOk(ses) && debtOk(ses) && ppeOk(ses);

export default {
  id: 'tie-outs-cross-foots',
  chapter: 'finance-and-accounting',
  section: 'Auditing a model',
  module: 'auditing-a-model',
  workbook: 'clearcoat-model',
  state: { before: 'B551', after: 'B552' },
  plant: formatsOf(CK, [...rowRefs(CK, 'eq'), ...rowRefs(CK, 'ebitda'), 'C' + R(CK, 'xfoot'), ...rowRefs(CK, 'debtNeg'), ...rowRefs(CK, 'ppeNeg')]),
  title: 'Tie-outs and cross-foots',
  difficulty: 'medium',
  tags: ['model', 'audit', 'checks'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['F1', 'C3'],
  teaches: ['tie-out', 'cross-foot', 'limit-check'],
  uses: ['check-cell', 'go-to', 'sheet-reference', 'ctrl-enter-fill', 'shift-arrow', 'arrow-keys', 'ctrl-arrow', 'countif-countifs', 'round-function', 'if-function', 'sum-family', 'rollup-flag'],
  prerequisites: ['challenge-linked-statements', 'ch4-assessment'],
  brief: 'A tie-out proves a figure in two places is the same figure; a cross-foot proves a block adds both ways, down the lines and across the years. Checks already ties the balance sheet, cash, debt, PP&E and revenue. Fill the three rows still marked pending, add two limit checks that count balances gone below zero, and read the flag on the Cover. The key is `=`.',
  goals: [
    { id: 'equity-roll', teach: 'Equity rolls like every schedule: opening, plus net income, less distributions, is closing. Written as a live difference wrapped in ROUND, it reads zero in every year the roll holds.',
      text: `Tie the equity roll across C12:J12: ${F.eq}, entered with Ctrl+Enter.`,
      keys: `Ctrl+G "Checks!C12:J12" ↵ "${F.eq}" Ctrl+↵`, requires: ['tie-out', 'go-to', 'sheet-reference', 'ctrl-enter-fill', 'round-function'], convention: 'F1',
      hintStuck: 'pulse range C12:J12 · One formula, written for FY24, lands in every year with Ctrl+Enter.',
      check: (s, ses) => settled(ses) && eqOk(ses) },
    { id: 'ebitda', teach: 'The historical EBITDA has to agree with the P&L the buyers saw in Chapter 2, typed blue in row 48 with its source. In the projected years there is nothing to tie, so the IF reads 0 there.',
      text: `Tie EBITDA to the Chapter 2 P&L across C13:J13: ${F.ebitda}.`,
      keys: `↓ Shift+→ ×7 "${F.ebitda}" Ctrl+↵`, requires: ['tie-out', 'if-function', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range C13:J13 · The flag row says whether a year is projected: 0 is an actual.',
      check: (s, ses) => settled(ses) && ebitdaOk(ses) },
    { id: 'cross-foot', teach: 'A cross-foot adds a block twice: every cost line across every year, and the site-cost total row across the years. If one line is left out of a total, the two sums part.',
      text: `Cross-foot the cost build in C11: ${F.xfoot}.`,
      keys: `↑ ↑ "${F.xfoot}" ↵`, requires: ['cross-foot', 'sum-family', 'arrow-keys'], convention: 'F1',
      hintStuck: 'pulse cell C11 · Rows 32 to 37 are the cost lines; row 38 is their total.',
      check: (s, ses) => settled(ses) && xfootOk(ses) },
    { id: 'debt-limit', teach: 'A tie-out cannot see a balance that has gone through zero: a debt tranche repaid past nothing still ties to itself. A limit check counts what should never happen, with COUNTIF and "<0", and reads zero while none does.',
      text: 'Count debt balances below zero across C17:J17, with COUNTIF and "<0" on Schedules rows 82, 92 and 103.',
      keys: `← Ctrl+↓ Ctrl+↓ ↓ → Shift+→ ×7 '${F.debtNeg}' Ctrl+↵`, requires: ['limit-check', 'countif-countifs', 'ctrl-arrow', 'arrow-keys', 'shift-arrow', 'ctrl-enter-fill'], convention: 'F1',
      hintStuck: 'pulse range C17:J17 · Rows 82, 92 and 103 are the term loan, the delayed draw and the revolver closing.',
      check: (s, ses) => settled(ses) && debtOk(ses) },
    { id: 'ppe-limit', text: 'Do the same for closing PP&E across C18:J18, with COUNTIF on Schedules row 65.',
      keys: `↓ Shift+→ ×7 '${F.ppeNeg}' Ctrl+↵`, requires: ['limit-check', 'countif-countifs', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range C18:J18 · Row 65 is closing PP&E, net.',
      check: (s, ses) => settled(ses) && ppeOk(ses) },
    { id: 'flag', teach: 'The roll-up already adds every row from the balance check down, so the new rows fold into the flag as they land. A pending note says a check is not built yet; once it is, the note goes.',
      text: 'Clear the pending notes in K11:K13 with Clear All, then Go To Cover!C7: the flag reads OK.',
      keys: 'Ctrl+G "Checks!K11:K13" ↵ Alt H E A Ctrl+G "Cover!C7" ↵', requires: ['rollup-flag', 'go-to', 'clear-all', 'keytips'],
      hintStuck: 'pulse range K11:K13 · Clear All takes the note and its italic with it.',
      check: (s, ses) => settled(ses) && pendingGone(ses) && allOk(ses) && at(ses, 'Cover', 'C7') && flagOk(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "BS!H9" Enter "1" Enter Ctrl+G "Checks!H9" Enter', cadence: 320 },
      text: 'Does it tie? Watch FY29 PP&E on the BS typed over: the PP&E tie in H9 names the line, and the flag turns to CHECK.', requires: [],
      hintStuck: 'pulse cell H9 · Each check guards one line.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The equity roll, EBITDA tie, cross-foot and both limit checks are live and read zero', check: (s, ses) => allOk(ses) },
    { text: 'No check is marked pending, and the flag reads OK', check: (s, ses) => pendingGone(ses) && flagOk(ses) },
  ],
  closing: [
    'Eight checks are live, and each one names the line it guards.',
    'A tie-out proves two places agree, a cross-foot proves a block adds both ways, and a limit check catches what a tie cannot: a balance gone through zero. Best practice: build a check the day you build the line it guards, never the night before it goes out.',
  ],
  solution: `Ctrl+G "Checks!C12:J12" Enter "${F.eq}" Ctrl+Enter Down Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right "${F.ebitda}" Ctrl+Enter `
    + `Up Up "${F.xfoot}" Enter Left Ctrl+Down Ctrl+Down Down Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right '${F.debtNeg}' Ctrl+Enter `
    + `Down Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right '${F.ppeNeg}' Ctrl+Enter Ctrl+G "Checks!K11:K13" Enter Alt H E A Ctrl+G "Cover!C7" Enter`,
};
