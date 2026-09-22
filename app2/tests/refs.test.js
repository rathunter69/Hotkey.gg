import { test } from 'node:test';
import assert from 'node:assert/strict';
import { colLetter, colIndex, parseRef, parseRange, rangeRefs, rangeText, normRef } from '../engine/refs.js';
import { fmtNum, dispText, dateToSerial } from '../engine/format.js';

test('column letters round-trip, including multi-letter columns', () => {
  assert.equal(colLetter(1), 'A'); assert.equal(colLetter(26), 'Z'); assert.equal(colLetter(27), 'AA'); assert.equal(colLetter(52), 'AZ'); assert.equal(colLetter(703), 'AAA');
  for (let c = 1; c <= 800; c++) assert.equal(colIndex(colLetter(c)), c);
});

test('parseRef understands $ anchors and case, rejects junk', () => {
  assert.deepEqual(parseRef('$a$1'), { r: 1, c: 1, absC: true, absR: true });
  assert.deepEqual(parseRef('AA10'), { r: 10, c: 27, absC: false, absR: false });
  assert.equal(parseRef('A0'), null); assert.equal(parseRef('1A'), null); assert.equal(parseRef(''), null);
  assert.equal(normRef('$b$2'), 'B2');
});

test('ranges normalise reversed corners', () => {
  assert.deepEqual(parseRange('B2:A1'), { r1: 1, c1: 1, r2: 2, c2: 2 });
  assert.deepEqual(rangeRefs('B2', 'A1'), ['A1', 'B1', 'A2', 'B2']);
  assert.equal(rangeText({ r1: 1, c1: 1, r2: 1, c2: 1 }), 'A1');
  assert.equal(rangeText({ r1: 1, c1: 1, r2: 3, c2: 2 }), 'A1:B3');
});

test('number display keeps the house conventions', () => {
  assert.equal(fmtNum(-1234.5, 'comma', 1), '(1,234.5)');
  assert.equal(fmtNum(1234.5, 'currency', 0), '$1,235');
  assert.equal(fmtNum(0, 'acct', 2), '$   -  ');
  assert.equal(fmtNum(-12, 'acct', 0), '$ (12)');
  assert.equal(fmtNum(0.125, 'percent', 1), '12.5%');
  assert.equal(fmtNum(1152.2999999999997), '1152.3');
  assert.equal(fmtNum(1500000, 'comma', 0, 3), '1,500');
  assert.equal(fmtNum(dateToSerial(2024, 3, 15), 'date'), 'Mar-24');
  assert.equal(dispText({ value: true }), 'TRUE');
  assert.equal(dispText({ value: null }), '');
  assert.equal(dispText({ value: '#N/A' }), '#N/A');
});
