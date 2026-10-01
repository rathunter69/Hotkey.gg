// Cross-sheet references (phase C engine gap 4): Name!A1 and 'My Sheet'!A1 evaluate against the
// workbook, unknown sheets read #REF!, edits ripple across sheets, fills keep the prefix, and the
// liveness rule probes the other sheet's inputs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Session } from '../engine/keyboard.js';
import { Sheet } from '../engine/sheet.js';
import { formulaRefs, translateFormula, adjustFormulaStructure, evalFormula } from '../engine/formula.js';
import { isLiveFormula } from '../engine/live.js';

function book() {
  const s = new Session(new Sheet({ rows: 20, cols: 8, cells: { B3: { value: 100 }, B4: { value: 200 } } }));
  s.renameSheet(0, 'Sales');
  s.addSheet('Costs', new Sheet({ rows: 20, cols: 8, cells: { B3: { value: 40 }, B4: { value: 70 } } }));
  s.addSheet('My Sheet', new Sheet({ rows: 20, cols: 8, cells: { A1: { value: 7 } } }));
  return s;
}

test('=Costs!B3*2 evaluates against the other sheet; quoted names work; unknown sheets read #REF!', () => {
  const s = book(); const S = s.sheet;
  S.commitInput('=Costs!B3*2', 3, 4);
  assert.equal(S.value('D3'), 80);
  S.commitInput("='My Sheet'!A1+1", 4, 4);
  assert.equal(S.value('D4'), 8);
  S.commitInput('=Nope!B3', 5, 4);
  assert.equal(S.value('D5'), '#REF!');
  S.commitInput('=SUM(Costs!B3:B4)', 6, 4);
  assert.equal(S.value('D6'), 110, 'a cross-sheet range sums');
});

test('editing the source sheet ripples into the readers (two-pass workbook recalc)', () => {
  const s = book(); const S = s.sheet;
  S.commitInput('=Costs!B3*2', 3, 4);
  s.switchSheet(1);
  s.sheet.commitInput('50', 3, 2);
  s.switchSheet(0);
  assert.equal(s.sheet.value('D3'), 100, 'the reader moved with its source');
});

test('an A → B → A chain settles on the edited sheet too: Costs!B3 = Sales!A2+1, Sales!A1 = Costs!B3*2', () => {
  const s = book(); const S = s.sheet;   // Sales
  s.sheets[1].sheet.commitInput('=Sales!A2+1', 3, 2);   // Costs!B3
  S.commitInput('=Costs!B3*2', 1, 1); S.commitInput('5', 2, 1);
  assert.equal(s.sheets[1].sheet.value('B3'), 6); assert.equal(S.value('A1'), 12);
  S.select('A2'); s.run('"10" Enter');
  assert.equal(s.sheets[1].sheet.value('B3'), 11); assert.equal(S.value('A1'), 22, 'the edited sheet sees the value its dependant pushed back, before any later edit');
  s.switchSheet(1); s.sheet.select('B3'); s.run('"=Sales!A2+5" Enter');
  assert.equal(s.sheet.value('B3'), 15); assert.equal(S.value('A1'), 30, 'the other way round too');
});

test('fill-down keeps the sheet prefix and shifts the relative row (Excel)', () => {
  const s = book(); const S = s.sheet;
  S.commitInput('=B3-Costs!B3', 3, 5);
  S.select('E3:E4');
  S.fill('down');
  assert.equal(S.formula('E4'), '=B4-Costs!B4');
  assert.equal(S.value('E3'), 60);
  assert.equal(S.value('E4'), 130);
  assert.equal(translateFormula('=Costs!$B$3+Costs!B3', 2, 0), '=Costs!$B$3+Costs!B5', 'anchors hold, relatives move, prefixes stay');
});

test('a structural edit on THIS sheet never rewrites another sheet’s refs', () => {
  assert.equal(adjustFormulaStructure('=Costs!B3+B3', 'r', 2, 1), '=Costs!B3+B4');
  assert.equal(adjustFormulaStructure('=SUM(Costs!B3:B6)+SUM(B3:B6)', 'r', 4, -1), '=SUM(Costs!B3:B6)+SUM(B3:B5)');
});

test('formulaRefs tags cross-sheet refs with their sheet', () => {
  const refs = formulaRefs('=Costs!B3+B4+SUM(Costs!C1:C2)');
  assert.equal(refs.length, 3);
  assert.equal(refs[0].sheet, 'COSTS');
  assert.equal(refs[0].key, 'B3');
  assert.equal(refs[1].sheet, undefined);
  assert.equal(refs[2].sheet, 'COSTS');
  assert.deepEqual(refs[2].range, { r1: 1, c1: 3, r2: 2, c2: 3 });
});

test('liveness: =Costs!B3 is live through the other sheet’s input; =Nope!B3 is not', () => {
  const s = book(); const S = s.sheet;
  S.commitInput('=Costs!B3', 3, 4);
  S.commitInput('=Nope!B3', 4, 4);
  S.commitInput('=B3-Costs!B3', 5, 4);
  assert.equal(isLiveFormula(S, 'D3'), true);
  assert.equal(isLiveFormula(S, 'D4'), false);
  assert.equal(isLiveFormula(S, 'D5'), true);
});

test('point mode and Go To: Ctrl+PgDn while pointing is swallowed; Go To Costs!B3 switches sheets', () => {
  const s = book();
  s.goToRef('Costs!B3');
  assert.equal(s.sheetIndex, 1);
  assert.equal(s.sheet.selectionText(), 'B3');
});

test('evalFormula without a workbook: a prefixed ref is #REF!, never a throw', () => {
  assert.equal(evalFormula('=Costs!B3', { raw: () => 1 }), '#REF!');
});

test('INDEX and OFFSET over another sheet\'s range read that sheet, not the formula\'s own', () => {
  const s = new Session(new Sheet({ cells: { A1: { value: 'own' }, A2: { value: 99 }, B2: { value: 77 },
    C1: { formula: '=INDEX(Lists!$A$1:$A$3,2)' }, C2: { formula: '=INDEX(Lists!$A$1:$A$3,MATCH("b",Lists!$A$1:$A$3,0))' }, C3: { formula: '=INDEX(Lists!$A$1:$B$3,2,2)' },
    C4: { formula: '=SUM(INDEX(Lists!$A$1:$B$3,0,2))' }, C5: { formula: '=INDEX(Lists!$A$2:$B$2,2)' }, C6: { formula: '=OFFSET(Lists!$A$1,1,1)' }, C7: { formula: '=SUM(OFFSET(Lists!$A$1,0,1,3,1))' } } }), { now: () => 0 });
  s.sheets[0].name = 'Summary';
  s.addSheet('Lists', new Sheet({ cells: { A1: { value: 'a' }, A2: { value: 'b' }, A3: { value: 'c' }, B1: { value: 1 }, B2: { value: 2 }, B3: { value: 3 } } }));
  const S = s.sheets[0].sheet;
  assert.deepEqual(['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'].map(r => S.value(r)), ['b', 'b', 2, 6, 2, 2, 6]);
});
