// app2/tests/checklist.test.js — M98: one state machine for 1 to 60 goals; pending, current, done;
// an assisted flag per goal; the folded view the panel and the goal list render.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createChecklist, land, landTo, assist, reset, view, MIN_GOALS, MAX_GOALS } from '../app/checklist.js';

const goals = n => Array.from({ length: n }, (_, i) => ({ id: 'g' + i, text: 'Goal ' + i }));

test('the range: 1 to 60 goals, nothing else', () => {
  assert.equal(MIN_GOALS, 1); assert.equal(MAX_GOALS, 60);
  assert.throws(() => createChecklist([]), RangeError);
  assert.throws(() => createChecklist(goals(61)), RangeError);
  assert.equal(createChecklist(goals(1)).items.length, 1);
  assert.equal(createChecklist(goals(60)).items.length, 60);
});

test('pending, current, done: landing walks the list in order and never goes back', () => {
  let s = createChecklist(goals(4));
  assert.deepEqual(s.items.map(i => i.status), ['current', 'pending', 'pending', 'pending']);
  s = land(s);
  assert.deepEqual(s.items.map(i => i.status), ['done', 'current', 'pending', 'pending']);
  s = landTo(s, 3);
  assert.deepEqual(s.items.map(i => i.status), ['done', 'done', 'done', 'current']);
  assert.equal(landTo(s, 1), s, 'never backward');
  s = land(s);
  assert.deepEqual(s.items.map(i => i.status), ['done', 'done', 'done', 'done']);
  assert.equal(land(s), s, 'done is done');
  assert.deepEqual(reset(s).items.map(i => i.status), ['current', 'pending', 'pending', 'pending']);
});

test('the assisted flag sits on the goal and never clears', () => {
  let s = createChecklist(goals(3));
  s = assist(s);
  assert.equal(s.items[0].assisted, true);
  s = land(s); s = assist(s, 2);
  assert.deepEqual(s.items.map(i => i.assisted), [true, false, true]);
  assert.equal(assist(s, 9), s, 'out of range is a no-op');
  assert.deepEqual(reset(s).items.map(i => i.assisted), [false, false, false]);
  assert.equal(view(s).assisted, 2);
});

test('the view folds: "{n} done", the current task, the next few, "{n} more after these"', () => {
  let s = createChecklist(goals(12));
  let v = view(s);
  assert.deepEqual([v.done, v.current.id, v.next.map(i => i.id), v.moreAfter, v.total, v.allDone], [0, 'g0', ['g1', 'g2', 'g3'], 8, 12, false]);
  s = landTo(s, 9); v = view(s, { next: 2 });
  assert.deepEqual([v.done, v.current.id, v.next.map(i => i.id), v.moreAfter], [9, 'g9', ['g10', 'g11'], 0]);
  s = landTo(s, 12); v = view(s);
  assert.deepEqual([v.done, v.current, v.next, v.moreAfter, v.allDone], [12, null, [], 0, true]);
  const one = view(createChecklist(['Only goal']));
  assert.deepEqual([one.current.text, one.next, one.moreAfter], ['Only goal', [], 0]);
});
