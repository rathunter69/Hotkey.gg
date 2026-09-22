// app2/tests/xp.test.js — the XP table and level curve hold their numbers (Phase D).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { levelOf, xpForEvent, totalXP, eventsFrom } from '../app/xp.js';

test('levelOf follows the old curve: 150 / 300 / 450, then flat 600', () => {
  assert.deepEqual(levelOf(0), { lvl: 1, into: 0, need: 150, pct: 0 });
  assert.deepEqual(levelOf(149), { lvl: 1, into: 149, need: 150, pct: 99 });
  assert.deepEqual(levelOf(150), { lvl: 2, into: 0, need: 300, pct: 0 });
  assert.deepEqual(levelOf(450), { lvl: 3, into: 0, need: 450, pct: 0 });
  assert.deepEqual(levelOf(900), { lvl: 4, into: 0, need: 600, pct: 0 });
  assert.deepEqual(levelOf(1500), { lvl: 5, into: 0, need: 600, pct: 0 });
  assert.equal(levelOf(1500 + 599).lvl, 5);
  assert.equal(levelOf(1500 + 600).lvl, 6);
  assert.equal(levelOf(NaN).lvl, 1); assert.equal(levelOf(-50).lvl, 1);
});

test('the XP table: firsts, the withheld 20, repeats capped 3/day, the Daily once, no speed bonus', () => {
  const D = '2026-09-22', D2 = '2026-09-23';
  // clean first lesson: 50; assisted first: 30, and the first unassisted run later pays the 20
  assert.equal(totalXP([{ kind: 'lesson', ref: 'a', day: D }]), 50);
  assert.equal(totalXP([{ kind: 'lesson', ref: 'a', day: D, assisted: true }]), 30);
  assert.equal(totalXP([
    { kind: 'lesson', ref: 'a', day: D, assisted: true },
    { kind: 'lesson', ref: 'a', day: D },
  ]), 50, 'assisted 30 then unassisted 20');
  assert.equal(totalXP([
    { kind: 'lesson', ref: 'a', day: D, assisted: true },
    { kind: 'lesson', ref: 'a', day: D },
    { kind: 'lesson', ref: 'a', day: D },
  ]), 55, 'the 20 pays once; then repeats at 5');
  // lesson repeats: 5 each, 3 a day
  assert.equal(totalXP([
    { kind: 'lesson', ref: 'a', day: D },
    { kind: 'lesson', ref: 'a', day: D }, { kind: 'lesson', ref: 'a', day: D },
    { kind: 'lesson', ref: 'a', day: D }, { kind: 'lesson', ref: 'a', day: D },
  ]), 50 + 15, 'the fourth repeat of the day pays nothing');
  // the cap resets by day
  assert.equal(xpForEvent({ kind: 'lesson', ref: 'a', day: D2 }, [
    { kind: 'lesson', ref: 'a', day: D, _tag: 'lesson-first' },
    { kind: 'lesson', ref: 'a', day: D, _tag: 'lesson-repeat' }, { kind: 'lesson', ref: 'a', day: D, _tag: 'lesson-repeat' }, { kind: 'lesson', ref: 'a', day: D, _tag: 'lesson-repeat' },
  ]), 5);
  // drills: first CLEAN finish 40 (an unclean first pays a repeat 10; the first clean later still pays 40)
  assert.equal(totalXP([{ kind: 'drill', ref: 'd', day: D, clean: true }]), 40);
  assert.equal(totalXP([
    { kind: 'drill', ref: 'd', day: D, clean: false },
    { kind: 'drill', ref: 'd', day: D, clean: true },
  ]), 10 + 40);
  assert.equal(totalXP([
    { kind: 'drill', ref: 'd', day: D, clean: true },
    { kind: 'drill', ref: 'd', day: D, clean: true }, { kind: 'drill', ref: 'd', day: D, clean: true },
    { kind: 'drill', ref: 'd', day: D, clean: true }, { kind: 'drill', ref: 'd', day: D, clean: true },
  ]), 40 + 30, 'drill repeats 10 each, 3 a day');
  // the Daily: 30, once a day
  assert.equal(totalXP([{ kind: 'daily', day: D }, { kind: 'daily', day: D }, { kind: 'daily', day: D2 }]), 60);
  // rapid-fire: 10 a round, 3 a day
  assert.equal(totalXP([{ kind: 'rapid', day: D }, { kind: 'rapid', day: D }, { kind: 'rapid', day: D }, { kind: 'rapid', day: D }]), 30);
  // unknown events pay nothing
  assert.equal(xpForEvent({ kind: 'achievement' }, []), 0);
  assert.equal(xpForEvent(null, []), 0);
});

test('eventsFrom folds progress + attempts into one ordered event list', () => {
  const progress = { 'active-cell': { completed: true, at: 100 }, started: { started: true, at: 50 } };
  const attempts = [
    { kind: 'drill', ref: 'edge-jumps', day: '2026-09-22', clean: true, at: 200 },
    { kind: 'daily', ref: 'edge-jumps', day: '2026-09-22', at: 300 },
    { kind: 'rapid', ref: 'rapid', day: '2026-09-22', at: 400 },
    { kind: 'lesson-timed', ref: 'active-cell', day: '2026-09-22', at: 500 },   // not an XP event: the completion already is
  ];
  const evs = eventsFrom(progress, attempts);
  assert.deepEqual(evs.map(e => e.kind), ['lesson', 'drill', 'daily', 'rapid']);
  assert.equal(totalXP(evs), 50 + 40 + 30 + 10);
});
