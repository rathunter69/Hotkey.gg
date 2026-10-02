// app2/tests/rapid-stage.test.js — rapid-fire's stage rules (M100): the meter, the bursts, the score,
// the slowest three, the order of a round and the chapters it draws from. The deck itself is rapid-deck.test.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RAPID_DURATIONS, BURSTS, MISS_SECS, hitPoints, meterFill, isBurst, accuracy, slowest, roundOrder, reachedChapter, capsOf, keysOfLabel, deckRows } from '../app/rapid-fire.js';
import { RAPID_DECK, deckFor } from '../content/rapid-deck.js';
import { LESSONS, CHAPTERS } from '../content/index.js';

test('rapid stage: three lengths, bursts at 5, 10, 15 and 20, the multiplier every five', () => {
  assert.deepEqual(RAPID_DURATIONS, [30, 60, 120]);
  assert.deepEqual(BURSTS, [5, 10, 15, 20]);
  assert.ok(isBurst(10) && !isBurst(11) && !isBurst(25));
  assert.equal(hitPoints(0), 10); assert.equal(hitPoints(4), 10); assert.equal(hitPoints(5), 20); assert.equal(hitPoints(10), 30);
  assert.equal(accuracy(0, 0), 0); assert.equal(accuracy(3, 1), 75);
});

test('rapid stage: the meter has ten segments, the tenth hit fills it and the eleventh starts it again', () => {
  assert.equal(meterFill(0), 0);
  assert.equal(meterFill(1), 1);
  assert.equal(meterFill(9), 9);
  assert.equal(meterFill(10), 10);
  assert.equal(meterFill(11), 1);
  assert.equal(meterFill(20), 10);
});

test('rapid stage: the slowest three average each command, a miss counting as the slow kind', () => {
  const rows = slowest({ bold: [1, 1.2], copy: [0.5], undo: [-1], 'go-to': [2.5, 3.5] }, 3);
  assert.deepEqual(rows.map(r => r.id), ['undo', 'go-to', 'bold']);
  assert.equal(rows[0].secs, MISS_SECS);
  assert.equal(rows[0].misses, 1);
  assert.equal(rows[1].secs, 3);
  assert.equal(slowest({}, 3).length, 0);
});

test('rapid stage: a round never asks the same command twice in a row, and every command comes up', () => {
  const ids = deckFor(1).map(p => p.id);
  const order = roundOrder(ids, 12345, null, 400);
  assert.equal(order.length, 400);
  for (let i = 1; i < order.length; i++) assert.notEqual(order[i], order[i - 1], 'repeat at ' + i);
  assert.equal(new Set(order).size, ids.length);
  assert.deepEqual(roundOrder(ids, 7), roundOrder(ids, 7), 'seeded');
  // a focus round of three cycles its three
  const three = roundOrder(['bold', 'copy', 'undo'], 3, null, 30);
  assert.deepEqual([...new Set(three)].sort(), ['bold', 'copy', 'undo']);
  for (let i = 1; i < three.length; i++) assert.notEqual(three[i], three[i - 1]);
});

test('rapid stage: the deck grows with the chapters reached', () => {
  assert.equal(reachedChapter({}), 1);
  const ch3 = LESSONS.find(l => l.chapter === CHAPTERS[2].id);
  if (ch3) assert.equal(reachedChapter({ [ch3.id]: { completed: true } }), 3);
  assert.ok(deckFor(1).every(p => p.ch === 1));
  assert.ok(deckFor(4).length > deckFor(1).length);
  assert.equal(deckFor(6).length, RAPID_DECK.length);
  const rows = deckRows(1, 'win');
  assert.equal(rows.length, deckFor(1).length);
  assert.ok(rows.every(r => r.name && r.keys.length && r.ch === 1));
  assert.ok(!rows.some(r => /rapid_cmd_/.test(r.name)), 'every command has its name in the copy');
});

test('rapid stage: a chord splits into one cap per key', () => {
  assert.deepEqual(capsOf('Ctrl+B'), ['Ctrl', 'B']);
  assert.deepEqual(capsOf('Alt H B A'), ['Alt', 'H', 'B', 'A']);
  assert.deepEqual(capsOf('Ctrl+Shift+↓'), ['Ctrl', 'Shift', '↓']);
  assert.deepEqual(keysOfLabel('Ctrl+Shift+End'), ['Ctrl', 'Shift', 'End']);
  assert.deepEqual(keysOfLabel('+'), ['+']);
});
