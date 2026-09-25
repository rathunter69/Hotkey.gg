// The due-today queue (app/schedule.js): the SM-2-shaped memory, the first-week cadence, the
// three-item offer, the Keep-sharp swap, rapid-fire's weakest-first order, and every micro-drill's
// reference solution replayed through the lesson runner.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grade, review, freshItem, strength, applyEvent, dueItems, dueToday, rapidOrder, normaliseState, demoState, MICRO, MICRO_IDS, microLesson, DAY, RAPID_CONCEPT, RAPID_UNSCORED, COLD_DAYS } from '../app/schedule.js';
import { LessonRun } from '../app/runner.js';
import { parseKeyScript } from '../engine/keyboard.js';
import { RAPID_DECK } from '../app/rapid-fire.js';
import { CONCEPTS } from '../content/schema.js';

const T0 = Date.UTC(2026, 8, 21, 9, 0, 0);

test('grade: hint beats everything, a miss is a 1, speed decides the rest', () => {
  assert.equal(grade({ ok: true, secs: 3, hint: true }), 2);
  assert.equal(grade({ ok: false, secs: 3 }), 1);
  assert.equal(grade({ ok: true, secs: 5 }), 5);
  assert.equal(grade({ ok: true, secs: 15 }), 4);
  assert.equal(grade({ ok: true, secs: 40 }), 3);
  assert.equal(grade({ ok: true }), 4);
  assert.equal(grade(), 4);
});

test('review: 1 day, then 3, then × ease; a miss resets to a day; ease floors at 1.3', () => {
  let it = review(freshItem(T0), 5, T0);
  assert.equal(it.ivl, 1); assert.equal(it.reps, 1); assert.equal(it.due, T0 + DAY); assert.equal(it.ef, 2.6);
  it = review(it, 5, T0 + DAY);
  assert.equal(it.ivl, 3); assert.equal(it.reps, 2); assert.equal(it.ef, 2.7);
  it = review(it, 4, T0 + 4 * DAY);
  assert.equal(it.ivl, 8); assert.equal(it.reps, 3);
  it = review(it, 1, T0 + 12 * DAY);
  assert.equal(it.ivl, 1); assert.equal(it.reps, 0); assert.ok(it.ef < 2.7);
  for (let i = 0; i < 20; i++) it = review(it, 0, T0 + (13 + i) * DAY);
  assert.equal(it.ef, 1.3);
  assert.deepEqual(Object.keys(review(null, 4, T0)).sort(), ['due', 'ef', 'ivl', 'last', 'q', 'reps']);
});

test('strength: 1 just after a review, a half at the interval, 0 when never seen', () => {
  const it = review(freshItem(T0), 5, T0);
  assert.equal(strength(it, T0), 1);
  assert.ok(Math.abs(strength(it, T0 + DAY) - 0.5) < 1e-9);
  assert.ok(strength(it, T0 + 3 * DAY) < 0.2);
  assert.equal(strength(freshItem(T0), T0), 0);
  assert.equal(strength(null, T0), 0);
});

test('applyEvent and dueItems: ids land, unknown shapes are ignored, the weakest come first', () => {
  let s = applyEvent({}, { ids: ['ctrl-arrow', 'ctrl-a'], q: 5 }, T0);
  s = applyEvent(s, { id: 'go-to', q: 3 }, T0);
  s = applyEvent(s, { ids: [7, '', null], q: 5 }, T0);
  assert.deepEqual(Object.keys(s).sort(), ['ctrl-a', 'ctrl-arrow', 'go-to']);
  assert.deepEqual(dueItems(s, T0 + DAY / 2), [], 'nothing is due before a day');
  const due = dueItems(s, T0 + 2 * DAY);
  assert.deepEqual(due.map(d => d.id), ['go-to', 'ctrl-a', 'ctrl-arrow'], 'the lower ease (weaker) first, then alphabetical among equals');
  assert.ok(due.every(d => d.overdueDays > 0.9));
});

test('the first week surfaces something every day', () => {
  // day 1: the Welcome teaches four moves; day 2: module 1.1; day 3: module 1.2 — then nothing
  let s = {};
  s = applyEvent(s, { ids: ['ctrl-arrow', 'ctrl-shift-arrow', 'ctrl-home-end', 'shift-arrow'], q: 5 }, T0);
  s = applyEvent(s, { ids: ['sheet-tabs', 'rename-sheet', 'keytips', 'gridlines'], q: 4 }, T0 + DAY);
  s = applyEvent(s, { ids: ['row-col-select', 'ctrl-a', 'go-to'], q: 4 }, T0 + 2 * DAY);
  // the learner clears whatever is due each morning, and we watch the queue for a week
  const seen = [];
  for (let day = 1; day <= 7; day++) {
    const now = T0 + day * DAY + 3600000;
    const q = dueToday(s, {}, now);
    seen.push(q.items.length);
    s = applyEvent(s, { ids: q.items.map(i => i.id), q: 4 }, now);
  }
  assert.ok(seen.every(n => n > 0), 'every day of the first week offers something: ' + seen.join(','));
  assert.ok(seen.every(n => n <= 3), 'never more than three');
});

test('dueToday: up to three micro-drills, ninety-odd seconds, weakest first; empty when nothing is due', () => {
  const s = demoState(T0);
  const q = dueToday(s, {}, T0);
  assert.ok(q.items.length >= 1 && q.items.length <= 3, 'items: ' + q.items.length);
  assert.ok(q.secs <= 100 && q.secs > 0);
  assert.ok(q.items.every(i => i.kind === 'micro' && MICRO[i.id] && i.title && i.task && i.secs));
  assert.equal(q.items[0].id, 'ctrl-shift-arrow', 'the move not touched since day one is weakest');
  assert.ok(q.items.some(i => i.id === 'font-color'), 'the hint-revealed one is in today’s three');
  const empty = dueToday({}, {}, T0);
  assert.deepEqual(empty, { items: [], secs: 0 });
});

test('dueToday: a whole cold module becomes one Keep-sharp challenge', () => {
  let s = applyEvent({}, { ids: ['sheet-tabs', 'rename-sheet', 'keytips', 'gridlines'], q: 4 }, T0);
  const ctx = { modules: [{ id: 'open-and-set-up', title: 'Open and set up', challengeId: 'challenge-inherited-file', complete: true, teaches: ['sheet-tabs', 'rename-sheet', 'keytips', 'gridlines', 'workbook'] }] };
  // the day after the module was finished everything is due at once: that is a first review (micro-drills), not a module gone quiet
  const early = dueToday(s, ctx, T0 + 1.2 * DAY);
  assert.ok(early.items.length > 0 && early.items.every(i => i.kind === 'micro'), 'a module finished yesterday gets micro items, not Keep sharp');
  assert.ok(dueToday(s, ctx, T0 + (1 + COLD_DAYS - 0.5) * DAY).items.every(i => i.kind === 'micro'));
  const q = dueToday(s, ctx, T0 + (1 + COLD_DAYS + 1) * DAY);
  assert.equal(q.items.length, 1);
  assert.equal(q.items[0].kind, 'challenge');
  assert.equal(q.items[0].id, 'challenge-inherited-file');
  assert.equal(q.secs, 90);
  // one of them refreshed yesterday: no longer a whole module, so micro-drills again
  s = applyEvent(s, { ids: ['keytips'], q: 5 }, T0 + (COLD_DAYS + 1) * DAY);
  const q2 = dueToday(s, ctx, T0 + (1 + COLD_DAYS + 1) * DAY);
  assert.ok(q2.items.every(i => i.kind === 'micro'));
  // an incomplete module never swaps in its challenge
  const q3 = dueToday(applyEvent({}, { ids: ['sheet-tabs', 'rename-sheet', 'keytips', 'gridlines'], q: 4 }, T0), { modules: [{ ...ctx.modules[0], complete: false }] }, T0 + (1 + COLD_DAYS + 1) * DAY);
  assert.ok(q3.items.every(i => i.kind === 'micro'));
});

test('rapid-fire: every prompt scores into a micro-drill the queue knows, or is named as unscored', () => {
  for (const p of RAPID_DECK) {
    if (RAPID_UNSCORED.includes(p.id)) continue;
    assert.ok(RAPID_CONCEPT[p.id], 'rapid prompt ' + p.id + ' maps to no concept');
    assert.ok(MICRO[RAPID_CONCEPT[p.id]], 'rapid prompt ' + p.id + ' maps to ' + RAPID_CONCEPT[p.id] + ', which has no micro-drill');
  }
});

test('rapidOrder: weakest first, unseen in the middle, strong last; seeded ties; a permutation', () => {
  let s = applyEvent({}, { ids: ['ctrl-arrow'], q: 5 }, T0 - 5 * DAY);   // weak: long past due
  s = applyEvent(s, { ids: ['bold-command'], q: 5 }, T0);               // strong: just now
  const order = rapidOrder(RAPID_DECK, s, 7, T0);
  assert.equal(order.length, RAPID_DECK.length);
  assert.deepEqual([...order].sort((a, b) => a - b), RAPID_DECK.map((_, i) => i));
  assert.equal(RAPID_DECK[order[0]].id, 'edge-down', 'the decayed Ctrl+↓ prompt leads');
  assert.equal(RAPID_DECK[order[order.length - 1]].id, 'bold', 'the fresh Ctrl+B prompt comes last');
  assert.notDeepEqual(rapidOrder(RAPID_DECK, s, 8, T0), order, 'a different seed breaks the ties differently');
  for (const id in RAPID_CONCEPT) assert.ok(MICRO[RAPID_CONCEPT[id]], id + ' maps to a micro-drill');
});

test('normaliseState: corrupt values fall back, unknown shapes are dropped, capped', () => {
  assert.deepEqual(normaliseState(null), {});
  assert.deepEqual(normaliseState('x'), {});
  const s = normaliseState({ a: { ef: 'big', ivl: -1, due: 'soon', reps: 1.5, last: 1, q: 'x' }, b: 'nope', '': {} });
  assert.deepEqual(s, { a: { ef: 2.5, ivl: 0, due: 0, reps: 0, last: 1, q: null } });
  const many = {}; for (let i = 0; i < 600; i++) many['k' + i] = { ef: 2.5 };
  assert.equal(Object.keys(normaliseState(many)).length, 500);
});

test('every micro-drill names a real concept and its solution replays to completion', () => {
  for (const id of MICRO_IDS) {
    assert.ok(CONCEPTS[id], id + ' is a concept id');
    const lesson = microLesson(id);
    assert.equal(lesson.kind, 'micro');
    assert.ok(lesson.secs >= 30 && lesson.secs <= 45, id + ' budget in 30–45 s');
    const run = new LessonRun(lesson, { mode: 'guided' });
    const steps = parseKeyScript(lesson.solution);
    assert.ok(steps.length, id + ' has a solution');
    run.run(lesson.solution);
    assert.ok(run.finished, id + ' did not complete on its own solution (' + run.doneCount + '/' + run.goals.length + ')');
  }
  assert.equal(microLesson('nope'), null);
});

test('one review per shortcut per day (C2): many goals using a shortcut in one sitting are one repetition', async () => {
  const { applyEvent, dueToday, backfillFrom, DAY } = await import('../app/schedule.js');
  const t0 = Date.UTC(2026, 8, 20, 10);
  let st = {};
  for (let i = 0; i < 5; i++) st = applyEvent(st, { ids: ['ctrl-arrow'], q: 5 }, t0 + i * 60000);   // five goals, five minutes
  assert.equal(st['ctrl-arrow'].reps, 1, 'one repetition');
  assert.equal(st['ctrl-arrow'].ivl, 1, 'due again tomorrow, as the header promises');
  assert.ok(dueToday(st, {}, t0 + DAY + 1000).items.some(i => i.id === 'ctrl-arrow'), 'due the next day');
  // a slip later the same day still counts: back to a one-day interval
  let st2 = applyEvent({}, { ids: ['go-to'], q: 5 }, t0);
  st2 = applyEvent(st2, { ids: ['go-to'], q: 3 }, t0 + DAY);          // day two: interval 3
  assert.equal(st2['go-to'].ivl, 3);
  st2 = applyEvent(st2, { ids: ['go-to'], q: 2 }, t0 + DAY + 3600000); // a hint the same day
  assert.equal(st2['go-to'].ivl, 1); assert.equal(st2['go-to'].reps, 0);
  // the next day is a new review
  const st3 = applyEvent(st, { ids: ['ctrl-arrow'], q: 5 }, t0 + DAY + 5000);
  assert.equal(st3['ctrl-arrow'].reps, 2); assert.equal(st3['ctrl-arrow'].ivl, 3);
  // backfill: ten lessons finished the same day give each shortcut one review, not ten
  const lessons = Array.from({ length: 10 }, (_, i) => ({ id: 'l' + i, goals: [{ requires: ['sheet-tabs', 'ctrl-arrow'] }] }));
  const all = Object.fromEntries(lessons.map((l, i) => [l.id, { completed: true, at: t0 + i * 600000 }]));
  const bf = backfillFrom(all, lessons, t0 + DAY + 1);
  assert.equal(bf['sheet-tabs'].ivl, 1); assert.equal(bf['ctrl-arrow'].reps, 1);
});

