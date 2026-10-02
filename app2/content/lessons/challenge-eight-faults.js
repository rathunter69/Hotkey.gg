// Chapter 5 · 5.5.C Challenge: eight planted faults (clearcoat-model, seeded over B55C)
// The linked model with eight faults: two typed figures in the IS projection (fresh figures each
// seed), a labor formula that lost its anchor in FY29, a working-capital change with its sign
// flipped, a missing depreciation add-back, a #REF! in a memo cell, an equity check typed as zeros,
// and a balance sheet cash line forced to balance. Graded on the learner's own model: each row one
// formula across, each link reading its line, the flag OK.
import { challengeSeed, FAULTS } from '../workbooks/clearcoat-model.js';
import { sheetIn, settled, reads, near, R, isErr, checkRow, rowRefs } from './lib/model-checks.js';
import { rowConsistent } from '../../app/graders.js';
import { parsFrom } from '../../app/pars.js';

const ID = 'challenge-eight-faults';
const one = (ses, name, r) => { const sh = sheetIn(ses, name); return !!sh && !!sh.formula('F' + r) && rowConsistent(sh, `F${r}:J${r}`).ok; };
const typedOk = ses => one(ses, 'IS', R('IS', 'util')) && one(ses, 'IS', R('IS', 'mkt'));
const patternOk = ses => one(ses, 'Schedules', R('Schedules', 'labor'));
const linkOk = (ses, ref, src) => { const sh = sheetIn(ses, 'CF'); const [sn, sr] = src.split('!'); return !!sh.formula(ref) && reads(sh, ref, [src]) && near(sh.value(ref), sheetIn(ses, sn).value(sr), 1e-6); };
const cashFlowOk = ses => linkOk(ses, 'G' + R('CF', 'dep'), 'Schedules!G' + R('Schedules', 'dep')) && linkOk(ses, 'H' + R('CF', 'chgRec'), 'Schedules!H' + R('Schedules', 'chgRec'));
const REF = FAULTS.find(f => f[2] && /#REF!/.test(f[2].formula || ''))[1];
const refOk = ses => { const sc = sheetIn(ses, 'Schedules'); const v = sc.value(REF); return !!sc.formula(REF) && !isErr(v) && near(v, sc.value('H' + R('Schedules', 'capexTotal')) / sc.value('H' + R('Schedules', 'dep')), 1e-9); };
const deadOk = ses => checkRow(sheetIn(ses, 'Checks'), rowRefs('Checks', 'eq'), (ref, c) => ['openEq', 'ni', 'dist', 'closeEq'].map(k => `BS!${c}${R('BS', k)}`));
const plugOk = ses => { const sh = sheetIn(ses, 'BS'); const ref = 'J' + R('BS', 'cash'); return reads(sh, ref, ['CF!J' + R('CF', 'close')]) && near(sh.value(ref), sheetIn(ses, 'CF').value('J' + R('CF', 'close')), 1e-6); };
const flagOk = ses => sheetIn(ses, 'Cover').value('C' + R('Cover', 'flag')) === 'OK';
const F = { eq: '=ROUND(BS!C21+BS!C22+BS!C23-BS!C24,2)' };

export default {
  id: ID,
  chapter: 'finance-and-accounting',
  section: 'Auditing a model',
  module: 'auditing-a-model',
  workbook: 'clearcoat-model',
  state: { before: 'B55C' },
  kind: 'challenge',
  title: 'Challenge: eight planted faults',
  difficulty: 'hard',
  tags: ['challenge', 'model', 'audit'],
  access: 'paid',
  minutes: 3,
  conventions: ['F1', 'F2', 'C3'],
  prerequisites: ['stress-tests'],
  brief: 'The linked model with eight faults: two typed numbers, a pattern break, a sign, a missing add-back, a #REF!, a check that isn’t a formula and a plug on the balance sheet. Find and fix them all, and the flag reads OK.',
  timeLimit: 180,
  pars: parsFrom(100, { pass: 178, pro: 130 }),
  seed: rng => challengeSeed(ID, rng),
  goals: [
    { id: 'hardcodes', text: 'Put the two typed figures on the IS projection back on their rows’ formulas.',
      keys: 'Ctrl+G "IS!F15:G15" ↵ Ctrl+R Ctrl+G "IS!H18:I18" ↵ Ctrl+R',
      check: (s, ses) => settled(ses) && typedOk(ses) },
    { id: 'row-differences', text: 'Find the labor formula on Schedules that breaks pattern and refill its row from FY27.',
      keys: 'Ctrl+G "Schedules!F32:J32" ↵ Ctrl+R',
      check: (s, ses) => settled(ses) && patternOk(ses) },
    { id: 'cash-flow', text: 'On CF, add FY28 depreciation back and put the sign of the FY29 receivables change right.',
      keys: 'Ctrl+G "CF!F7:G7" ↵ Ctrl+R Ctrl+G "CF!G8:H8" ↵ Ctrl+R',
      check: (s, ses) => settled(ses) && cashFlowOk(ses) },
    { id: 'ref', text: 'Fix the #REF! the error count finds on Schedules.',
      keys: 'Ctrl+G "Schedules!G66:H66" ↵ Ctrl+R',
      check: (s, ses) => settled(ses) && refOk(ses) },
    { id: 'dead-check', text: `Make the equity roll on Checks a live difference again: ${F.eq} across C12:J12.`,
      keys: `Ctrl+G "Checks!C12:J12" ↵ "${F.eq}" Ctrl+↵`,
      check: (s, ses) => settled(ses) && deadOk(ses) },
    { id: 'plug', text: 'Take the plug out of FY31 cash on the BS so it reads the cash flow’s closing cash, and the flag reads OK.',
      keys: 'Ctrl+G "BS!I6:J6" ↵ Ctrl+R',
      check: (s, ses) => settled(ses) && plugOk(ses) && flagOk(ses) },
  ],
  graders: [
    ses => typedOk(ses) && patternOk(ses) ? { ok: true } : { ok: false, why: 'a projected row still holds a typed figure or a formula that breaks pattern. Each row is one formula, written in FY27 and filled right' },
    ses => cashFlowOk(ses) ? { ok: true } : { ok: false, why: 'the cash flow statement still drops depreciation or flips a working-capital sign. Each line links its schedule as it stands' },
    ses => refOk(ses) ? { ok: true } : { ok: false, why: 'the #REF! on Schedules is still there. The error count on Checks names the sheet' },
    ses => deadOk(ses) ? { ok: true } : { ok: false, why: 'the equity check is typed. A check is a live difference that reads zero, never a typed 0' },
    ses => plugOk(ses) && flagOk(ses) ? { ok: true } : { ok: false, why: 'cash on the balance sheet is forced. It reads the cash flow statement’s closing cash, and the balance follows from every other link' },
  ],
  solution: 'Ctrl+G "IS!F15:G15" Enter Ctrl+R Ctrl+G "IS!H18:I18" Enter Ctrl+R Ctrl+G "Schedules!F32:J32" Enter Ctrl+R '
    + 'Ctrl+G "CF!F7:G7" Enter Ctrl+R Ctrl+G "CF!G8:H8" Enter Ctrl+R Ctrl+G "Schedules!G66:H66" Enter Ctrl+R '
    + `Ctrl+G "Checks!C12:J12" Enter "${F.eq}" Ctrl+Enter Ctrl+G "BS!I6:J6" Enter Ctrl+R`,
};
