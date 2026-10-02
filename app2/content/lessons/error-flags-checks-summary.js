// Chapter 5 · 5.5.2 Error flags and the checks summary (clearcoat-model, B552 → B553)
// A #REF! is planted in a memo cell on Schedules (capex over depreciation, FY29), where no tie can
// see it. The learner counts errors sheet by sheet on Checks with SUMPRODUCT(--ISERROR()), folds the
// counts into the roll-up (the flag turns to CHECK), walks to the error with Error Checking on the
// sheet the count names, fixes it by pointing, and puts the Cover's flag and its sum of differences
// on the Watch Window. Counts are graded on their value and the block they read; the fix on its figure.
import { sheetIn, settled, calls, reads, near, formatsOf, doneFormula, R, cursorAt, isErr, watching } from './lib/model-checks.js';
import { PLANT_REF, plantPatch, ROLLUP_ERRORS } from '../workbooks/clearcoat-model.js';

const CK = 'Checks';
const ck = ses => sheetIn(ses, CK);
const SHEETS = [['errIS', 'IS', 'C5:J60'], ['errCF', 'CF', 'C5:J60'], ['errBS', 'BS', 'C5:J60'], ['errSch', 'Schedules', 'C5:J140'], ['errDCF', 'DCF', 'C5:K80'], ['errInp', 'Inputs', 'C5:J120']];
const F = Object.fromEntries(SHEETS.map(([k]) => [k, doneFormula(CK, 'C' + R(CK, k))]));
const REF = PLANT_REF[1];                                    // H66
const RR = +REF.slice(1), CAPEX = R('Schedules', 'capexTotal'), DEP = R('Schedules', 'dep');
const FIX = doneFormula('Schedules', REF);                   // =IFERROR(H63/H64,0)
const countsOk = ses => { const sh = ck(ses); return !!sh && SHEETS.every(([k, name, block]) => { const ref = 'C' + R(CK, k); const [a, b] = block.split(':'); return !!sh.formula(ref) && calls(sh, ref, ['ISERROR']) && reads(sh, ref, [`${name}!${a}`, `${name}!${b}`]) && typeof sh.value(ref) === 'number'; }); };
const rollRef = 'C' + R(CK, 'rollup');
const foldedOk = ses => { const sh = ck(ses); return !!sh && reads(sh, rollRef, ['C' + R(CK, 'bs'), 'J' + R(CK, 'npv'), ...SHEETS.map(([k]) => 'C' + R(CK, k))]); };
const errorsNow = ses => SHEETS.reduce((t, [k]) => t + (ck(ses).value('C' + R(CK, k)) || 0), 0);
const flag = ses => sheetIn(ses, 'Cover').value('C' + R('Cover', 'flag'));
const fixedOk = ses => { const sc = sheetIn(ses, 'Schedules'); const v = sc.value(REF); return !!sc.formula(REF) && !isErr(v) && reads(sc, REF, ['H' + CAPEX, 'H' + DEP]) && near(v, sc.value('H' + CAPEX) / sc.value('H' + DEP), 1e-9); };

export default {
  id: 'error-flags-checks-summary',
  chapter: 'finance-and-accounting',
  section: 'Auditing a model',
  module: 'auditing-a-model',
  workbook: 'clearcoat-model',
  state: { before: 'B552', after: 'B553' },
  plant: { ...plantPatch('B552', [PLANT_REF]), ...formatsOf(CK, SHEETS.map(([k]) => 'C' + R(CK, k))) },
  title: 'Error flags and the checks summary',
  difficulty: 'medium',
  tags: ['model', 'audit', 'checks', 'errors'],
  access: 'paid',
  minutes: 6,
  headline: 'ISERROR',
  conventions: ['F1', 'F3'],
  teaches: ['error-count', 'error-checking', 'watch-window'],
  uses: ['sumproduct', 'go-to', 'sheet-reference', 'arrow-keys', 'pointing', 'iferror-function', 'rollup-flag', 'formula-errors', 'keytips', 'escape-backs-out'],
  prerequisites: ['tie-outs-cross-foots'],
  brief: 'A check that reads zero can’t see a #REF! in a cell no check reads, and when an error reaches a check, the check turns into an error that says nothing about where it started. SUMPRODUCT(--ISERROR(block)) counts the errors on a sheet, and Error Checking (Alt, M, K) walks you to each one. Count the errors sheet by sheet on Checks, fold the counts into the flag, then find and fix the one planted in the model. The key is `ISERROR`.',
  goals: [
    { id: 'counts', teach: 'ISERROR turns every cell of a block into TRUE or FALSE, the two minus signs turn those into 1 and 0, and SUMPRODUCT adds them. One row a sheet, each over the whole block the sheet uses.',
      text: `Count each sheet's errors in C30:C35, starting with C30 ${F.errIS} and one sheet a row.`,
      keys: `Ctrl+G "Checks!C30" ↵ "${F.errIS}" ↵ ↓ "${F.errCF}" ↵ ↓ "${F.errBS}" ↵ ↓ "${F.errSch}" ↵ ↓ "${F.errDCF}" ↵ ↓ "${F.errInp}" ↵`,
      requires: ['error-count', 'sumproduct', 'go-to', 'sheet-reference', 'arrow-keys'], convention: 'F1',
      hintStuck: 'pulse range C30:C35 · The labels in column B name each row’s sheet.',
      check: (s, ses) => settled(ses) && countsOk(ses) },
    { id: 'fold', teach: 'An error doesn’t net to zero, so the roll-up adds the counts to the sum of the differences: OK only when both are zero. Schedules reads 1, and the flag says so.',
      text: `Fold the counts into the roll-up: C44 ${ROLLUP_ERRORS}, and the flag turns to CHECK.`,
      keys: `Ctrl+G "Checks!C44" ↵ "${ROLLUP_ERRORS}" ↵`, requires: ['error-count', 'rollup-flag', 'go-to'], convention: 'F1',
      hintStuck: 'pulse cell C44 · Add SUM(C30:C35) to what the cell already holds.',
      check: (s, ses) => settled(ses) && countsOk(ses) && foldedOk(ses) && flag(ses) === 'CHECK' },
    { id: 'walk', teach: 'Error Checking works on one sheet at a time, so go to the sheet the count names first. It selects each error cell in turn and shows its formula.',
      text: 'Go to Schedules, the sheet the count names, and press Alt, M, K: Error Checking lands on the #REF! in H66.',
      keys: 'Ctrl+G "Schedules!A1" ↵ Alt M K', requires: ['error-checking', 'go-to', 'keytips'], convention: 'F3',
      hintStuck: 'pulse cell H66 · Row 66 is a memo: capex over depreciation.',
      check: (s, ses) => ses.dialog === 'errcheck' && cursorAt(ses, 'Schedules', REF) },
    { id: 'fix', teach: 'The memo divides capex by depreciation in the same year; the reference to depreciation was deleted. Point at both again rather than typing them, and the count falls to zero.',
      text: `Close it with Esc and rewrite H66 by pointing: ${FIX}, so the count reads 0 and the flag OK.`,
      keys: 'Esc "=IFERROR(" ↑ ×3 "/" ↑ ×2 ",0)" ↵', requires: ['pointing', 'iferror-function', 'escape-backs-out', 'arrow-keys'], convention: 'E1',
      hintStuck: 'pulse cell H66 · Total capex is row 63 and depreciation row 64.',
      check: (s, ses) => settled(ses) && fixedOk(ses) && errorsNow(ses) === 0 && flag(ses) === 'OK' },
    { id: 'watch', teach: 'The Watch Window keeps a cell in view with its value whatever sheet you are on. Best practice: the flag on the Cover is the first cell a reviewer reads and the last one you read before sending.',
      text: 'Open the Watch Window with Alt, M, W, add Cover!C7:C8 with Alt+A, and close it with Esc.',
      keys: 'Alt M W Alt+A "=Cover!$C$7:$C$8" ↵ Esc', requires: ['watch-window', 'keytips', 'escape-backs-out'], convention: 'F4',
      hintStuck: 'pulse cell C7 · C7 is the flag and C8 the sum of differences behind it.',
      check: (s, ses) => settled(ses) && watching(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "IS!H11" Enter "=1/0" Enter Ctrl+G "Checks!C30" Enter', cadence: 320 },
      text: 'Does it tie? Watch a #DIV/0! typed into the IS: the count in C30 catches it and the flag turns to CHECK.', requires: [],
      hintStuck: 'pulse cell C30 · Every error on the IS adds one.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C30:C35 count each sheet’s errors, and the roll-up adds them', check: (s, ses) => countsOk(ses) && foldedOk(ses) },
    { text: 'H66 on Schedules reads capex over depreciation again, and the flag reads OK', check: (s, ses) => fixedOk(ses) && flag(ses) === 'OK' },
    { text: 'The Watch Window holds the Cover’s flag and its sum of differences', check: (s, ses) => watching(ses) },
  ],
  closing: [
    'The flag now sees errors as well as differences, and one cell says the model is clean.',
    'A #REF! in a memo cell would have reached no tie and sat in the file until a buyer’s analyst found it. The error count found it in one row, Error Checking walked to it, and the Watch Window keeps the flag in view while you work anywhere else in the model.',
  ],
  solution: `Ctrl+G "Checks!C30" Enter "${F.errIS}" Enter Down "${F.errCF}" Enter Down "${F.errBS}" Enter Down "${F.errSch}" Enter Down "${F.errDCF}" Enter Down "${F.errInp}" Enter `
    + `Ctrl+G "Checks!C44" Enter "${ROLLUP_ERRORS}" Enter Ctrl+G "Schedules!A1" Enter Alt M K Escape "=IFERROR(" Up Up Up "/" Up Up ",0)" Enter `
    + 'Alt M W Alt+A "=Cover!$C$7:$C$8" Enter Escape',
};
