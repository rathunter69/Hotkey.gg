// app2/tests/quests.test.js — the quest pool and its loop (screenplay 6.6, 6.10; M54, M59).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTS, QUESTS_BY_ID, QUEST_XP } from '../content/quests.js';
import { REFERENCE_BY_ID } from '../content/reference.js';
import { LESSONS_BY_ID } from '../content/index.js';
import { siteCopy } from '../content/copy/apply.js';
import {
  dayKey, weekKey, periodKey, draw, eligible, progress, board, settle, emptyLedger, cleanLedger,
  questEvents, questTotals, logEntry, againCandidates, periodEvents,
} from '../app/quests.js';
import { totalXP } from '../app/xp.js';

const T0 = Date.parse('2026-10-01T12:00:00Z');   // a Thursday
const ctxAll = () => ({
  completed: new Set(Object.keys(LESSONS_BY_ID)), lessonsLeft: true, pro: true,
  again: [{ ref: 'challenge-x', module: 'Moving Around' }],
  drillsByChapter: { ch1: ['a', 'b', 'c'], ch5: ['x', 'y'] },
});

test('the pool is 6.6: ten daily, the fun ones, ten weekly; every row is well formed and has its words', () => {
  const daily = QUESTS.filter(q => q.period === 'daily' && !q.fun), fun = QUESTS.filter(q => q.fun), weekly = QUESTS.filter(q => q.period === 'weekly');
  assert.equal(daily.length, 10); assert.equal(weekly.length, 10); assert.ok(fun.length >= 10);
  assert.equal(new Set(QUESTS.map(q => q.id)).size, QUESTS.length, 'ids unique');
  for (const q of QUESTS) {
    assert.ok(['count', 'distinct', 'best', 'keys', 'chapter'].includes(q.metric), q.id);
    assert.equal(q.xp, q.period === 'weekly' ? QUEST_XP.weekly : QUEST_XP.daily, q.id);
    if (q.metric === 'keys') assert.ok(Array.isArray(q.keys) && q.keys.length, q.id);
    if (q.needs && typeof q.needs === 'object') {
      if (q.needs.taught) assert.ok(REFERENCE_BY_ID[q.needs.taught] && REFERENCE_BY_ID[q.needs.taught].lessonId, q.id + ' needs a key a lesson teaches');
      if (q.needs.lesson) assert.ok(LESSONS_BY_ID[q.needs.lesson], q.id + ' names a real lesson');
    }
    const line = siteCopy('quest_' + q.id, '');
    assert.ok(line, 'site.csv has quest_' + q.id);
    assert.ok(!/[!—–]/.test(line), q.id);
  }
});

test('periods run on UTC: days at midnight, weeks Monday to Sunday', () => {
  assert.equal(dayKey(T0), '2026-10-01');
  assert.equal(weekKey(T0), '2026-09-28');
  assert.equal(weekKey(Date.parse('2026-09-28T00:00:00Z')), '2026-09-28');
  assert.equal(weekKey(Date.parse('2026-10-04T23:59:59Z')), '2026-09-28');
  assert.equal(weekKey(Date.parse('2026-10-05T00:00:00Z')), '2026-10-05');
  assert.equal(periodKey('weekly', T0), 'w2026-09-28');
});

test('the draw: three a period, the same on every load, different across days, one fun quest at most', () => {
  const ctx = ctxAll();
  const a = draw('daily', 'd2026-10-01', ctx), b = draw('daily', 'd2026-10-01', ctx);
  assert.deepEqual(a, b);
  assert.equal(a.length, 3); assert.equal(new Set(a.map(d => d.id)).size, 3);
  assert.ok(a.filter(d => QUESTS_BY_ID[d.id].fun).length <= 1);
  const days = new Set(Array.from({ length: 10 }, (_, i) => draw('daily', 'd2026-10-' + String(i + 1).padStart(2, '0'), ctx).map(d => d.id).join()));
  assert.ok(days.size > 5, 'the draw varies by day');
  assert.ok(draw('weekly', 'w2026-09-28', ctx).every(d => QUESTS_BY_ID[d.id].period === 'weekly'));
});

test('eligibility: no lessons left, no key not taught, no Pro for a free learner, {module} names a reached module', () => {
  const fresh = { completed: new Set(['know-the-screen']), lessonsLeft: false, pro: false, again: [], drillsByChapter: { ch1: ['a', 'b'] } };
  assert.equal(eligible(QUESTS_BY_ID['d-lesson'], fresh), false);
  assert.equal(eligible(QUESTS_BY_ID['k-ctrl-shift-down'], fresh), true, 'Ctrl+Shift+arrow taught in know-the-screen');
  assert.equal(eligible(QUESTS_BY_ID['k-f4'], fresh), false);
  assert.equal(eligible(QUESTS_BY_ID['d-again'], fresh), false);
  assert.equal(eligible({ ...QUESTS_BY_ID['d-pass'], pro: true }, fresh), false);
  const d = draw('daily', 'd2026-10-01', { ...ctxAll(), again: [{ ref: 'challenge-x', module: 'Moving Around' }] }, [QUESTS_BY_ID['d-again']]);
  assert.deepEqual(d, [{ id: 'd-again', ref: 'challenge-x', module: 'Moving Around' }]);
  const now = T0, old = now - 20 * 86400000;
  assert.deepEqual(againCandidates([{ ref: 'c1', module: 'A' }, { ref: 'c2', module: 'B' }, { ref: 'c3', module: 'C' }], [
    { kind: 'challenge', ref: 'c1', clean: true, at: old }, { kind: 'challenge', ref: 'c2', clean: true, at: now - 86400000 },
  ], now), [{ ref: 'c1', module: 'A' }]);
});

test('progress counts from the run: one drill can finish two quests at once', () => {
  const L = emptyLedger();
  L.log.push(logEntry({ kind: 'drill', ref: 'a', clean: true, tier: 'pro', at: T0 - 1000 }));
  L.log.push(logEntry({ kind: 'drill', ref: 'b', clean: true, tier: 'pass', at: T0 - 500, used: [{ keys: 'F4', count: 9 }, { keys: 'Alt H B', count: 2 }] }));
  const evs = periodEvents(L, [{ kind: 'rapid', ref: 'rapid', splits: [34, 2, 10, 900], at: T0 - 100 }], 'daily', T0);
  assert.deepEqual(progress({ id: 'd-drills-2' }, evs), { have: 2, target: 2, done: true });
  assert.deepEqual(progress({ id: 'd-expert' }, evs), { have: 1, target: 1, done: true });
  assert.deepEqual(progress({ id: 'k-f4' }, evs), { have: 9, target: 15, done: false });
  assert.deepEqual(progress({ id: 'k-alt-chord' }, evs), { have: 2, target: 5, done: false });
  assert.deepEqual(progress({ id: 'd-rapid-30' }, evs), { have: 30, target: 30, done: true });
  assert.deepEqual(progress({ id: 'w-chapter-drills' }, evs, { drillsByChapter: { ch1: ['a', 'b', 'c'], ch5: ['x', 'y'] } }), { have: 2, target: 3, done: false });
  // yesterday's runs never count today
  const L2 = emptyLedger(); L2.log.push(logEntry({ kind: 'drill', ref: 'a', at: T0 - 86400000 }));
  assert.equal(periodEvents(L2, [], 'daily', T0).length, 0);
  assert.equal(periodEvents(L2, [], 'weekly', T0).length, 1);
});

test('settle ticks once, pays the bonus for all three, rolls the weekly reward, and the XP never moves', () => {
  const ctx = ctxAll();
  const L = emptyLedger();
  const pool = ['d-drills-2', 'd-pass', 'd-expert'];
  L.draws['d2026-10-01'] = pool.map(id => ({ id }));
  L.draws['w2026-09-28'] = ['w-drills-10', 'w-expert-3', 'w-pb-2'].map(id => ({ id }));
  const before = settle(L, [], ctx, T0);
  assert.equal(before.ticked.length, 0);
  L.log.push(logEntry({ kind: 'drill', ref: 'a', clean: true, tier: 'pro', at: T0 - 10 }));
  let r = settle(L, [], ctx, T0);
  assert.deepEqual(r.ticked.map(x => x.id).sort(), ['d-expert', 'd-pass']);
  L.log.push(logEntry({ kind: 'drill', ref: 'b', at: T0 - 5 }));
  r = settle(L, [], ctx, T0);
  assert.deepEqual(r.ticked.map(x => x.id), ['d-drills-2']);
  assert.deepEqual(r.bonus, [{ period: 'daily', xp: 50, roll: null }]);
  assert.equal(settle(L, [], ctx, T0).ticked.length, 0, 'ticks once');
  assert.equal(totalXP(questEvents(L)), 25 * 3 + 50);
  // the weekly clear rolls a reward
  for (let i = 0; i < 10; i++) L.log.push(logEntry({ kind: 'drill', ref: 'r' + i, clean: true, tier: 'pro', pb: true, at: T0 - 100 - i }));
  r = settle(L, [], ctx, T0, () => 'keycap-amber');
  assert.equal(r.bonus.length, 1); assert.equal(r.bonus[0].roll, 'keycap-amber');
  assert.equal(questTotals(L).weeks, 1);
  const xp = totalXP(questEvents(L));
  assert.equal(xp, 25 * 3 + 50 + 75 * 3 + 150);
  // a ledger round-trips through storage cleaning
  assert.equal(totalXP(questEvents(cleanLedger(JSON.parse(JSON.stringify(L))))), xp);
});

test('a brand-new learner has no quests yet; the board draws once and keeps the draw', () => {
  const L = emptyLedger();
  const b = board(L, [], { completed: new Set(), lessonsLeft: true, drillsByChapter: {} }, T0);
  assert.equal(b.started, false); assert.equal(b.daily.rows.length, 0);
  const ctx = ctxAll();
  const b1 = board(L, [], ctx, T0);
  assert.equal(b1.daily.rows.length, 3); assert.equal(b1.weekly.rows.length, 3);
  const kept = JSON.stringify(L.draws);
  board(L, [], { ...ctx, lessonsLeft: false }, T0);
  assert.equal(JSON.stringify(L.draws), kept, 'a drawn period never reshuffles');
});
