import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { isLiveFormula, liveFormulas } from '../engine/live.js';

test('a live formula moves when an input moves; hardcodes and dead formulas do not', () => {
  const s = new Sheet({ cells: {
    B2: { value: 10 }, B3: { value: 20 }, B4: { value: 30 },
    B5: { formula: '=SUM(B2:B4)' },        // live
    C5: { formula: '=B2+B3+B4' },          // live (addition chain)
    D5: { formula: '=4470' },              // a hardcode dressed as a formula
    E5: { formula: '=B2*0' },              // nothing moves it
    F5: { formula: '=B5' },                // a link to a formula cell: live through B2..B4
    G5: { value: 60 },                     // a typed value
    H5: { formula: '=IF(B2>0,"yes","no")' },   // text output moves when B2 goes to 0? no — but perturbing B2 keeps >0; use B2 sign
    I5: { formula: '=LEN(J1)' },           // reads a blank text cell: blank → number moves LEN
  } });
  assert.equal(isLiveFormula(s, 'B5'), true);
  assert.equal(isLiveFormula(s, 'C5'), true);
  assert.equal(isLiveFormula(s, 'D5'), false);
  assert.equal(isLiveFormula(s, 'E5'), false);
  assert.equal(isLiveFormula(s, 'F5'), true);
  assert.equal(isLiveFormula(s, 'G5'), false);
  assert.equal(isLiveFormula(s, 'I5'), true);
  assert.deepEqual(liveFormulas(s).sort(), ['B5', 'C5', 'F5', 'I5']);
});

test('the rule never mutates the sheet it inspects', () => {
  const s = new Sheet({ cells: { A1: { value: 1 }, A2: { formula: '=A1+1' } } });
  const before = JSON.stringify(s.toJSON());
  isLiveFormula(s, 'A2');
  assert.equal(JSON.stringify(s.toJSON()), before);
});

test('inputs can be restricted to a list', () => {
  const s = new Sheet({ cells: { A1: { value: 1 }, B1: { value: 2 }, C1: { formula: '=B1*2' } } });
  assert.equal(isLiveFormula(s, 'C1', { inputs: ['A1'] }), false);
  assert.equal(isLiveFormula(s, 'C1', { inputs: ['B1'] }), true);
});
