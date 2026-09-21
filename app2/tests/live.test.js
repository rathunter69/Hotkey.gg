import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { isLiveFormula, liveFormulas, perturb, perturbations } from '../engine/live.js';

test('a live formula moves when an input moves; hardcodes and dead formulas do not', () => {
  const s = new Sheet({ cells: {
    B2: { value: 10 }, B3: { value: 20 }, B4: { value: 30 },
    B5: { formula: '=SUM(B2:B4)' },        // live
    C5: { formula: '=B2+B3+B4' },          // live (addition chain)
    D5: { formula: '=4470' },              // a hardcode dressed as a formula
    E5: { formula: '=B2*0' },              // nothing moves it
    F5: { formula: '=B5' },                // a link to a formula cell: live through B2..B4
    G5: { value: 60 },                     // a typed value
    H5: { formula: '=IF(B2>0,"yes","no")' },   // a threshold: the sign-flip / zero probes cross it
    I5: { formula: '=LEN(J1)' },           // reads a blank text cell: blank → number moves LEN
  } });
  assert.equal(isLiveFormula(s, 'B5'), true);
  assert.equal(isLiveFormula(s, 'C5'), true);
  assert.equal(isLiveFormula(s, 'D5'), false);
  assert.equal(isLiveFormula(s, 'E5'), false);
  assert.equal(isLiveFormula(s, 'F5'), true);
  assert.equal(isLiveFormula(s, 'G5'), false);
  assert.equal(isLiveFormula(s, 'H5'), true);
  assert.equal(isLiveFormula(s, 'I5'), true);
  assert.deepEqual(liveFormulas(s).sort(), ['B5', 'C5', 'F5', 'H5', 'I5']);
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

test('perturb has no fixed point, so inputs holding -1 (the sign-flip helper) still count', () => {
  for (const v of [-10, -1, -0.5, 0, 0.5, 1, 7, 1e6]) { assert.notEqual(perturb(v), v); for (const p of perturbations(v)) assert.notEqual(p, v); }
  assert.equal(perturbations('').includes(''), false);   // a probe never equals the original
  const s = new Sheet({ cells: { B2: { value: -1 }, C2: { formula: '=B2*5' }, D2: { formula: '=B2' }, E2: { formula: '=ABS(B2)' }, B3: { value: -1 }, B5: { value: 4 }, C5: { formula: '=B5*$B$3' }, B6: { value: -1 }, C6: { value: -1 }, D6: { value: -1 }, E6: { formula: '=SUM(B6:D6)' } } });
  assert.equal(isLiveFormula(s, 'C2'), true); assert.equal(isLiveFormula(s, 'D2'), true); assert.equal(isLiveFormula(s, 'E2'), true);
  assert.equal(isLiveFormula(s, 'C5', { inputs: ['B3'] }), true);   // a helper-restricted grader call
  assert.equal(isLiveFormula(s, 'E6'), true);
});

test('text comparisons, head readers, threshold IFs and clamps are live; hardcodes and *0 stay dead', () => {
  const s = new Sheet({ cells: {
    A1: { value: 'yes' }, B1: { formula: '=IF(A1="yes",1,0)' }, C1: { formula: '=A1="yes"' },
    A2: { value: 'Apple' }, A3: { value: 'Pear' }, G1: { formula: '=MATCH("Pear",A2:A3,0)' },
    A4: { value: 'Weekly Sales' }, B4: { formula: '=LEFT(A4,6)' }, C4: { formula: '=FIND("S",A4)' }, D4: { formula: '=MID(A4,1,3)' }, E4: { formula: '=A4="Weekly Sales"' },
    A5: { value: 1200 }, B5: { formula: '=IF(A5>=1000,"Bonus","None")' }, C5: { formula: '=A5>0' }, D5: { formula: '=MOD(A5,2)' },
    A6: { value: -300 }, B6: { formula: '=MIN(A6,0)' }, C6: { formula: '=MAX(A6,0)' }, D6: { formula: '=IF(A6<0,"loss","gain")' },
    H1: { formula: '=4470' }, H2: { formula: '=A5*0' }, H3: { formula: '="a"&"b"' },
  } });
  for (const k of ['B1', 'C1', 'G1', 'B4', 'C4', 'D4', 'E4', 'B5', 'C5', 'D5', 'B6', 'C6', 'D6']) assert.equal(isLiveFormula(s, k), true, k);
  for (const k of ['H1', 'H2', 'H3']) assert.equal(isLiveFormula(s, k), false, k);
  assert.equal(typeof perturb('yes'), 'string'); assert.notEqual('yes'.localeCompare(perturb('yes'), 'en', { sensitivity: 'accent' }), 0);   // the nudge is visible to collation
});

test('probing stays within budget: precedents only, no recalc for a hardcode, full scan only past a dynamic reference', () => {
  const cells = {};
  for (let r = 1; r <= 20; r++) { for (let c = 1; c <= 5; c++) cells[String.fromCharCode(64 + c) + r] = { value: r * c };
    cells['F' + r] = { formula: `=SUM(A${r}:E${r})` }; cells['G' + r] = { formula: `=F${r}*2` }; cells['H' + r] = { formula: `=AVERAGE(A${r}:E${r})` }; cells['I' + r] = { formula: `=G${r}-H${r}` }; cells['J' + r] = { formula: '=4470' }; }
  const s = new Sheet({ cells });
  let n = 0; const orig = Sheet.prototype.recalc; Sheet.prototype.recalc = function () { n++; return orig.call(this); };
  try {
    assert.equal(isLiveFormula(s, 'J1'), false); assert.equal(n, 0);                 // no precedents: no clone, no probe
    n = 0; assert.equal(isLiveFormula(s, 'I20'), true); assert.ok(n <= 3, 'I20 recalcs ' + n);   // one baseline + the first precedent moves it
    n = 0; assert.equal(liveFormulas(s).length, 80); assert.ok(n <= 100, 'liveFormulas recalcs ' + n);
  } finally { Sheet.prototype.recalc = orig; }
  const o = new Sheet({ cells: { A1: { value: 5 }, B1: { value: 7 }, H1: { formula: '=OFFSET(A1,0,1)' } } });
  assert.equal(isLiveFormula(o, 'H1'), true);   // B1 is not a static precedent: the dynamic fallback scans every input
  const t = new Sheet({ cells: { A1: { value: 1 }, B1: { formula: '=A1+1' }, C1: { formula: '=B1*2' } } });
  assert.equal(isLiveFormula(t, 'C1', { inputs: ['a1'] }), true);   // explicit inputs are normalised
});
