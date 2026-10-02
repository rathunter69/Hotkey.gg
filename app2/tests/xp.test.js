// app2/tests/xp.test.js — the XP table (screenplay 6.10) and level curve hold their numbers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { levelOf, xpForEvent, totalXP, eventsFrom, XP_TABLE } from '../app/xp.js';

test('levelOf follows the 6.10 curve: level n to n+1 costs 150n, capped at 30', () => {
  assert.deepEqual(levelOf(0), { lvl: 1, into: 0, need: 150, pct: 0, next: 150 });
  assert.deepEqual(levelOf(149), { lvl: 1, into: 149, need: 150, pct: 99, next: 150 });
  assert.deepEqual(levelOf(150), { lvl: 2, into: 0, need: 300, pct: 0, next: 450 });
  assert.deepEqual(levelOf(450), { lvl: 3, into: 0, need: 450, pct: 0, next: 900 });
  assert.deepEqual(levelOf(900), { lvl: 4, into: 0, need: 600, pct: 0, next: 1500 });
  assert.deepEqual(levelOf(1500), { lvl: 5, into: 0, need: 750, pct: 0, next: 2250 });
  assert.equal(levelOf(1500 + 749).lvl, 5);
  assert.equal(levelOf(2250).lvl, 6);
  assert.equal(levelOf(6750).lvl, 10); assert.equal(levelOf(28500).lvl, 20); assert.equal(levelOf(65250).lvl, 30);
  assert.equal(levelOf(1e9).lvl, 30, 'capped'); assert.equal(levelOf(1e9).pct, 100);
  assert.equal(levelOf(NaN).lvl, 1); assert.equal(levelOf(-50).lvl, 1);
});

test('the table is 6.10: lesson 50 (+10 clean), challenge 50/+25/+50, drill 40 then 5, Daily 30, rapid 10, quests 25/75', () => {
  assert.deepEqual(
    [XP_TABLE.lesson, XP_TABLE.lessonClean, XP_TABLE.challenge, XP_TABLE.challengeExpert, XP_TABLE.challengeLegendary, XP_TABLE.drillFirstClean, XP_TABLE.drillRepeat, XP_TABLE.daily, XP_TABLE.rapid, XP_TABLE.questDaily, XP_TABLE.questWeekly, XP_TABLE.bonusDaily, XP_TABLE.bonusWeekly, XP_TABLE.achievement],
    [50, 10, 50, 25, 50, 40, 5, 30, 10, 25, 75, 50, 150, 0]);
});

test('lessons: 50 the first time, the clean +10 once, repeats nothing', () => {
  const D = '2026-09-22';
  assert.equal(totalXP([{ kind: 'lesson', ref: 'a', day: D }]), 50);
  assert.equal(totalXP([{ kind: 'lesson', ref: 'a', day: D, clean: true }]), 60);
  assert.equal(totalXP([{ kind: 'lesson', ref: 'a', day: D }, { kind: 'lesson', ref: 'a', day: D, clean: true }, { kind: 'lesson', ref: 'a', day: D, clean: true }]), 60);
});

test('challenges: each tier pays the first time it is reached, even in one run', () => {
  const D = '2026-09-22';
  assert.equal(totalXP([{ kind: 'challenge', ref: 'c', day: D, tier: 'legendary' }]), 125);
  assert.equal(totalXP([{ kind: 'challenge', ref: 'c', day: D, tier: 'pass' }, { kind: 'challenge', ref: 'c', day: D, tier: 'pro' }]), 75);
  assert.equal(totalXP([{ kind: 'challenge', ref: 'c', day: D, tier: 'pro' }, { kind: 'challenge', ref: 'd', day: D, tier: 'pro' }]), 150, 'per challenge');
});

test('drills, the Daily, rapid-fire: first clean 40, repeats 5 capped three a day, the Daily once', () => {
  const D = '2026-09-22', D2 = '2026-09-23';
  assert.equal(totalXP([{ kind: 'drill', ref: 'd', day: D, clean: true }]), 40);
  assert.equal(totalXP([{ kind: 'drill', ref: 'd', day: D, clean: false }, { kind: 'drill', ref: 'd', day: D, clean: true }]), 5 + 40);
  const five = Array.from({ length: 5 }, () => ({ kind: 'drill', ref: 'd', day: D, clean: true }));
  assert.equal(totalXP(five), 40 + 15, 'the fourth repeat of the day pays nothing');
  assert.equal(xpForEvent({ kind: 'drill', ref: 'd', day: D2 }, [{ kind: 'drill', ref: 'd', day: D, _tag: 'drill-repeat' }, { kind: 'drill', ref: 'd', day: D, _tag: 'drill-repeat' }, { kind: 'drill', ref: 'd', day: D, _tag: 'drill-repeat' }]), 5, 'the cap resets by day');
  assert.equal(totalXP([{ kind: 'daily', day: D }, { kind: 'daily', day: D }, { kind: 'daily', day: D2 }]), 60);
  assert.equal(totalXP([{ kind: 'rapid', day: D }, { kind: 'rapid', day: D }, { kind: 'rapid', day: D }, { kind: 'rapid', day: D }]), 30);
  assert.equal(xpForEvent({ kind: 'achievement' }, []), 0);
  assert.equal(xpForEvent(null, []), 0);
});

test('quest events pay what the ledger says', () => {
  assert.equal(totalXP([{ kind: 'quest', xp: 25 }, { kind: 'quest-bonus', xp: 50 }, { kind: 'quest-archive', xp: 300 }, { kind: 'quest', xp: -4 }]), 375);
});

test('eventsFrom folds progress, attempts and the quest ledger into one ordered list; a challenge pays once', () => {
  const progress = {
    'active-cell': { completed: true, clean: true, at: 100 }, started: { started: true, at: 50 },
    'challenge-x': { completed: true, challenge: true, tier: 'pro', at: 150 },
  };
  const attempts = [
    { kind: 'challenge', ref: 'challenge-x', day: '2026-09-22', clean: true, tier: 'pro', at: 150 },
    { kind: 'drill', ref: 'get-around', day: '2026-09-22', clean: true, at: 200 },
    { kind: 'daily', ref: 'get-around', day: '2026-09-22', at: 300 },
    { kind: 'rapid', ref: 'rapid', day: '2026-09-22', at: 400 },
    { kind: 'lesson-timed', ref: 'active-cell', day: '2026-09-22', at: 500 },
  ];
  const evs = eventsFrom(progress, attempts, [{ kind: 'quest', ref: 'd2026-09-22:d-daily', xp: 25, _at: 310 }]);
  assert.deepEqual(evs.map(e => e.kind), ['lesson', 'challenge', 'drill', 'daily', 'quest', 'rapid']);
  assert.equal(totalXP(evs), 60 + 75 + 40 + 30 + 25 + 10);
});
