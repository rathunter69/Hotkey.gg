// Chapter 5 · 5.5.3 The model-wide sweep: hardcodes and pattern breaks (clearcoat-model, B553 → B554)
// Planted: two typed figures in the IS projection (FY28 utilities, FY30 marketing) and a labor
// formula on Schedules that lost its anchor in FY29. The learner finds the typed figures with Go To
// Special, Constants, puts each back on its row's formula with Ctrl+R, finds the pattern break with
// Row differences, refills the row from FY27, then counts typed numbers per sheet on Checks and
// folds the counts into the roll-up. Fixes are graded on the row being one formula filled across.
import { sheetIn, settled, calls, reads, formatsOf, doneFormula, R, isErr } from './lib/model-checks.js';
import { PLANT_SWEEP, plantPatch } from '../workbooks/clearcoat-model.js';
import { rowConsistent } from '../../app/graders.js';

const CK = 'Checks';
const ck = ses => sheetIn(ses, CK);
const [UTIL, MKT] = [PLANT_SWEEP[0][1], PLANT_SWEEP[1][1]];   // G15, I18
const LAB = R('Schedules', 'labor');                            // 32
const HC = [['hcIS', 'IS', 'F5:J60'], ['hcCF', 'CF', 'F5:J60'], ['hcBS', 'BS', 'F5:J60'], ['hcSch', 'Schedules', 'F5:J140']];
const F = Object.fromEntries(HC.map(([k]) => [k, doneFormula(CK, 'C' + R(CK, k))]));
const ROLLUP = doneFormula(CK, 'C' + R(CK, 'rollup'));
const onIS = ses => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === 'IS';
const onSch = ses => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === 'Schedules';
const isRowOk = (ses, ref) => { const sh = sheetIn(ses, 'IS'); const r = +ref.slice(1); return !!sh.formula(ref) && rowConsistent(sh, `F${r}:J${r}`).ok && !isErr(sh.value(ref)); };
const typedFixed = ses => isRowOk(ses, UTIL) && isRowOk(ses, MKT);
const laborOk = ses => { const sh = sheetIn(ses, 'Schedules'); return !!sh.formula('F' + LAB) && rowConsistent(sh, `F${LAB}:J${LAB}`).ok; };
const countsOk = ses => { const sh = ck(ses); return !!sh && HC.every(([k, name, block]) => { const ref = 'C' + R(CK, k); const [a, b] = block.split(':'); return calls(sh, ref, ['ISNUMBER', 'ISFORMULA']) && reads(sh, ref, [`${name}!${a}`, `${name}!${b}`]) && sh.value(ref) === 0; }); };
const foldedOk = ses => { const sh = ck(ses); const ref = 'C' + R(CK, 'rollup'); return !!sh && reads(sh, ref, ['C' + R(CK, 'bs'), 'C' + R(CK, 'errIS'), 'C' + R(CK, 'errInp'), ...HC.map(([k]) => 'C' + R(CK, k))]) && sh.value(ref) === 0; };

export default {
  id: 'model-wide-sweep',
  chapter: 'finance-and-accounting',
  section: 'Auditing a model',
  module: 'auditing-a-model',
  workbook: 'clearcoat-model',
  state: { before: 'B553', after: 'B554' },
  plant: { ...plantPatch('B553', PLANT_SWEEP), ...formatsOf(CK, HC.map(([k]) => 'C' + R(CK, k))) },
  title: 'The model-wide sweep: hardcodes and pattern breaks',
  difficulty: 'medium',
  tags: ['model', 'audit', 'hardcodes'],
  access: 'paid',
  minutes: 7,
  headline: 'Alt H F D S',
  conventions: ['C3', 'B4', 'F3'],
  teaches: ['row-differences', 'hardcode-count'],
  uses: ['go-to-special', 'goto-special-types', 'fill-down-right', 'go-to', 'sheet-reference', 'shift-arrow', 'sumproduct', 'rollup-flag', 'keytips'],
  prerequisites: ['error-flags-checks-summary'],
  brief: 'Two faults hide in a projected block: a typed number where a formula belongs, and a formula that breaks pattern halfway across a row. Go To Special finds both: Constants lights every typed number in a selection, and Row differences every cell whose formula is not the row’s. Sweep the model with both, then count typed numbers sheet by sheet on Checks so the flag catches the next one. The key is `Alt H F D S`.',
  goals: [
    { id: 'constants', teach: 'A projected block should hold nothing but formulas, so Go To Special, Constants, Numbers on it selects exactly the cells somebody typed over. Each one is a figure that will not move when the inputs do.',
      text: 'On IS, select the projected block F5:J32 and run Go To Special, Constants: two typed figures light up, G15 and I18.',
      keys: 'Ctrl+G "IS!F5:J32" ↵ Alt H F D S O ↵', requires: ['go-to-special', 'goto-special-types', 'go-to', 'keytips'], convention: 'F3',
      hintStuck: 'pulse range F5:J32 · O picks Constants; Enter selects them.',
      check: (s, ses) => settled(ses) && onIS(ses) && s.selectionText() === `${UTIL},${MKT}` },
    { id: 'fill-typed', teach: 'Each row is one formula written in FY27 and filled right, so the cure for a typed cell is the fill: Ctrl+R copies the cell to its left across the selection, references shifted.',
      text: 'Put each back on its row’s formula: select F15:G15 and press Ctrl+R, then H18:I18 and Ctrl+R.',
      keys: 'Ctrl+G "F15:G15" ↵ Ctrl+R Ctrl+G "H18:I18" ↵ Ctrl+R', requires: ['fill-down-right', 'go-to'], convention: 'C3',
      hintStuck: 'pulse range F15:G15 · The cell to the left holds the row’s formula.',
      check: (s, ses) => settled(ses) && typedFixed(ses) },
    { id: 'row-diff', teach: 'Row differences compares every cell of the selected row with the active cell’s formula, shifted to its column, and selects the ones that do not match. A formula that lost a $ halfway across looks right and gives the wrong figure.',
      text: 'On Schedules, select the labor row F32:J32 and run Go To Special, Row differences: FY29, H32, lights up.',
      keys: 'Ctrl+G "Schedules!F32:J32" ↵ Alt H F D S W ↵', requires: ['row-differences', 'go-to', 'keytips'], convention: 'F3',
      hintStuck: 'pulse range F32:J32 · W picks Row differences.',
      check: (s, ses) => settled(ses) && onSch(ses) && s.selectionText() === 'H' + LAB },
    { id: 'refill', teach: 'H32 reads the FY29 cell of the cost input, which is blank, where every other year reads $C$50. Refill the whole row from FY27 so it is one formula again.',
      text: 'Refill the row from FY27: select F32:J32 and press Ctrl+R.',
      keys: 'Ctrl+G "F32:J32" ↵ Ctrl+R', requires: ['fill-down-right', 'go-to'], convention: 'C3',
      hintStuck: 'pulse range F32:J32 · FY27 holds the row’s formula as written.',
      check: (s, ses) => settled(ses) && laborOk(ses) },
    { id: 'count', teach: 'ISNUMBER less ISFORMULA is 1 only on a typed number, so the SUMPRODUCT counts typed numbers directly. Counting numbers and formulas separately and subtracting would let a formula showing a dash hide a typed figure.',
      text: `Count typed numbers in C38:C41 on Checks, starting with C38 ${F.hcIS} and one sheet a row.`,
      keys: `Ctrl+G "Checks!C38" ↵ "${F.hcIS}" ↵ ↓ "${F.hcCF}" ↵ ↓ "${F.hcBS}" ↵ ↓ "${F.hcSch}" ↵`, requires: ['hardcode-count', 'sumproduct', 'go-to', 'sheet-reference'], convention: 'B4',
      hintStuck: 'pulse range C38:C41 · Only the projected columns, F to J: history is typed on purpose.',
      check: (s, ses) => settled(ses) && countsOk(ses) },
    { id: 'fold', text: `Fold them into the roll-up: C44 ${ROLLUP}.`,
      keys: `Ctrl+G "C44" ↵ "${ROLLUP}" ↵`, requires: ['hardcode-count', 'rollup-flag', 'go-to'],
      hintStuck: 'pulse cell C44 · Add SUM(C38:C41) to what the cell already holds.',
      check: (s, ses) => settled(ses) && countsOk(ses) && foldedOk(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "IS!H13" Enter "-5000" Enter Ctrl+G "Checks!C38" Enter', cadence: 320 },
      text: 'Does it tie? Watch a figure typed into FY29 labor on the IS: the count in C38 catches it and the flag turns to CHECK.', requires: [],
      hintStuck: 'pulse cell C38 · A typed number in the projection counts one.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'IS rows 15 and 18 and Schedules row 32 are each one formula filled across', check: (s, ses) => typedFixed(ses) && laborOk(ses) },
    { text: 'C38:C41 count the typed numbers on each sheet, and the roll-up adds them', check: (s, ses) => countsOk(ses) && foldedOk(ses) },
  ],
  closing: [
    'Every projected cell is a formula, and every row is one formula across.',
    'Constants found the two typed figures and Row differences the formula that lost its anchor; the counts on Checks now catch the next of either. Tip from the desk: where one cell in a row has to differ on purpose, border it and say why in the next cell, so Row differences lighting it is a known exception nobody flattens with a fill.',
  ],
  solution: 'Ctrl+G "IS!F5:J32" Enter Alt H F D S O Enter Ctrl+G "F15:G15" Enter Ctrl+R Ctrl+G "H18:I18" Enter Ctrl+R '
    + 'Ctrl+G "Schedules!F32:J32" Enter Alt H F D S W Enter Ctrl+G "F32:J32" Enter Ctrl+R '
    + `Ctrl+G "Checks!C38" Enter "${F.hcIS}" Enter Down "${F.hcCF}" Enter Down "${F.hcBS}" Enter Down "${F.hcSch}" Enter Ctrl+G "C44" Enter "${ROLLUP}" Enter`,
};
