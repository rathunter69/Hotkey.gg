import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { isLiveFormula, isLiveFormulaByClone, liveFormulas, perturb, perturbations } from '../engine/live.js';

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

test('a link to a formula on another sheet is live through that formula’s own inputs (=Sites!K5 where K5 =J5/365.25)', async () => {
  const { Session } = await import('../engine/keyboard.js');
  const s = new Session(new Sheet({ cells: { C5: { value: 1 } } }));
  s.renameSheet(0, 'Summary');
  s.addSheet('Sites', new Sheet({ cells: { I5: { value: 46280 }, E5: { value: 43539 }, J5: { formula: '=$I$5-E5' }, K5: { formula: '=J5/365.25' }, K6: { formula: '=Summary!C5*2' } } }));
  s.switchSheet(0);
  const sum = s.sheet;
  sum.commitInput('=Sites!K5', 5, 12);      // L5
  sum.commitInput('=Sites!K5*0', 5, 13);    // M5
  sum.commitInput('=Sites!K6', 5, 14);      // N5
  assert.ok(Math.abs(sum.value('L5') - 2741 / 365.25) < 1e-9);
  assert.equal(isLiveFormula(sum, 'L5'), true, 'the chain reaches Sites!I5 and E5');
  assert.equal(isLiveFormula(sum, 'M5'), false, 'times zero is still dead across sheets');
  assert.equal(isLiveFormula(sum, 'N5'), true, 'a hop out and back to this sheet lands on its own input C5');
  assert.equal(isLiveFormula(sum, 'N5', { inputs: ['C5'] }), true);
  assert.ok(liveFormulas(sum).includes('L5') && !liveFormulas(sum).includes('M5'));
});

/* ---- the in-place probe: the nudge happens on the real workbook and must leave no trace ---- */
const cellsOf = s => JSON.parse(JSON.stringify(s.cells));

test('in place: a dynamic array that grows under a nudge, and a nudge over a spilled cell, both put back exactly', () => {
  const s = new Sheet({ cells: { A1: { value: 3 }, B1: { formula: '=SEQUENCE(A1)' }, C1: { formula: '=SUM(B1:B5)' }, D1: { formula: '=B3*2' }, E1: { formula: '=SUM(B1#)' }, F1: { formula: '=G1*0' }, G1: { value: 5 } } });
  const before = cellsOf(s);
  for (const [k, opts] of [['C1', {}], ['D1', {}], ['E1', {}], ['F1', {}], ['C1', { inputs: ['A1'] }], ['C1', { inputs: ['B2'] }], ['D1', { inputs: ['B4'] }]]) {
    assert.equal(isLiveFormula(s, k, opts), isLiveFormulaByClone(s, k, opts), k + ' ' + JSON.stringify(opts));
    assert.deepEqual(cellsOf(s), before, 'after ' + k + ' ' + JSON.stringify(opts));
  }
  assert.equal(isLiveFormula(s, 'F1'), false);
  s.cells.A1.value = 4; s.recalc();   // the graph is still right after the probes: the spill and its readers follow an edit
  assert.equal(s.value('B4'), 4); assert.equal(s.value('C1'), 10); assert.equal(s.value('E1'), 10);
});

test('in place: dynamic reads probed and put back leave the graph reading the right cells', () => {
  const s = new Sheet({ cells: { A1: { value: 1 }, A2: { value: 10 }, A3: { value: 20 }, B1: { formula: '=INDEX(A2:A3,A1)' }, C1: { formula: '=OFFSET(A1,A1,0)' } } });
  const before = cellsOf(s);
  assert.equal(isLiveFormula(s, 'B1'), true); assert.equal(isLiveFormula(s, 'C1'), true);
  assert.deepEqual(cellsOf(s), before);
  s.cells.A2.value = 11; s.recalc();   // A2 is what B1 and C1 read at A1 = 1: still an edge after the probes nudged A1 to 2 and back
  assert.equal(s.value('B1'), 11); assert.equal(s.value('C1'), 11);
});

test('in place across sheets: the nudge lands on the sibling and comes back; a workbook with RAND takes the clone path untouched', async () => {
  const { Session } = await import('../engine/keyboard.js');
  const ses = new Session(new Sheet({ cells: { A1: { value: 2 } } }));
  ses.renameSheet(0, 'Inputs');
  ses.addSheet('Calc', new Sheet({ cells: { B1: { formula: '=Inputs!A1*3' }, B2: { formula: '=Inputs!A1*0' } } }));
  const calc = ses.sheets[1].sheet, inputs = ses.sheets[0].sheet;
  const b0 = cellsOf(calc), i0 = cellsOf(inputs);
  assert.equal(isLiveFormula(calc, 'B1'), true); assert.equal(isLiveFormula(calc, 'B2'), false);
  assert.deepEqual(cellsOf(calc), b0); assert.deepEqual(cellsOf(inputs), i0);
  inputs.cells.A1.value = 5; inputs.recalc(); assert.equal(calc.value('B1'), 15);
  calc.setCell('C1', { formula: '=RAND()' }); calc.setCell('C2', { formula: '=B1+1' }); calc.recalc();
  const r0 = cellsOf(calc);
  assert.equal(isLiveFormula(calc, 'C2'), true);
  assert.deepEqual(cellsOf(calc), r0, 'RAND would move on an in-place recalc: the clone answers and the sheet keeps its draw');
});

test('a workbook with SUBTOTAL is probed in place (it repeats itself), with the clone\'s verdicts, and ends as it started', () => {
  const s = new Sheet({ cells: { B1: { value: 4 }, B2: { value: 6 }, B3: { value: 9 }, B4: { formula: '=SUBTOTAL(109,B1:B3)' }, C1: { formula: '=B4*2' }, C2: { formula: '=SUBTOTAL(109,B2:B2)*0' }, D1: { value: 3 }, D2: { formula: '=D1+1' } } });
  s.hiddenRows.add(3); s.recalc();
  const cellsOf = sh => JSON.parse(JSON.stringify(sh.cells)); const before = cellsOf(s);
  let probes = 0; const orig = s.book.recalc; s.book.recalc = function (t, only) { if (only) probes++; return orig.call(this, t, only); };
  for (const [ref, inputs] of [['C1'], ['C2'], ['D2'], ['B4', ['B1']]]) {
    const opts = inputs ? { inputs } : {};
    assert.equal(isLiveFormula(s, ref, opts), isLiveFormulaByClone(s, ref, opts), `${ref} ${inputs || ''}`);
  }
  assert.ok(probes > 0, 'the nudges ran on the workbook itself, through its graph');
  // the clone carries the hidden rows, so both ways agree that a row SUBTOTAL 109 skips moves nothing, as in Excel
  assert.equal(isLiveFormula(s, 'B4', { inputs: ['B3'] }), false, 'a hidden row SUBTOTAL 109 skips moves nothing');
  assert.equal(isLiveFormulaByClone(s, 'B4', { inputs: ['B3'] }), false, 'the clone sees the hidden row too');
  assert.deepEqual(cellsOf(s), before, 'every nudge put back');
});

test('a named input on another sheet, and a clone that reaches two sheets away: a three-sheet chain under iterative calculation, through a defined name', async () => {
  const { Session } = await import('../engine/keyboard.js');
  const ses = new Session(new Sheet({ cells: { A1: { value: 2 }, A2: { value: 1 } } }));
  ses.renameSheet(0, 'Inputs');
  ses.addSheet('Sched', new Sheet({ cells: { B1: { formula: '=Inputs!A1*3' } } }));
  ses.addSheet('Stmt', new Sheet({ cells: { C1: { formula: '=IF(Circ=1,Sched!B1+1,0)' }, C2: { formula: '=C3+1' }, C3: { formula: '=C2*0.5' } } }));   // C2:C3 a circle: the clone path
  Object.assign(ses.settings, { iterative: true });
  ses.names = { Circ: 'Inputs!$A$2' };
  const stmt = ses.sheets[2].sheet;
  assert.equal(stmt.value('C1'), 7);
  const before = JSON.stringify(ses.sheets.map(e => e.sheet.cells));
  assert.equal(isLiveFormula(stmt, 'C1', { inputs: ['Inputs!A1'] }), true, 'Inputs → Sched → Stmt moves on the clone, the name resolving there');
  assert.equal(isLiveFormula(stmt, 'C1', { inputs: ['Inputs!$A$1'] }), true, 'an anchored input reads the same');
  assert.equal(isLiveFormula(stmt, 'C1', { inputs: ['Inputs!B9'] }), false, 'a cell nothing reads moves nothing');
  assert.equal(JSON.stringify(ses.sheets.map(e => e.sheet.cells)), before, 'the workbook is untouched');
});
