// app2/tests/daily-rapid.test.js — the Daily's determinism (Phase D).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dailyFor, dailyDrill, shareText } from '../app/daily.js';
import { mulberry32, hash32 } from '../engine/rng.js';
import { DRILLS_BY_ID, DAILY_POOL } from '../content/drills.js';
import { Sheet } from '../engine/sheet.js';
import { Session, parseKeyScript, parseKeySpec } from '../engine/keyboard.js';

test('rng: mulberry32 and hash32 are deterministic', () => {
  const a = mulberry32(42), b = mulberry32(42);
  assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
  assert.equal(hash32('2026-09-22'), hash32('2026-09-22'));
  assert.notEqual(hash32('2026-09-22'), hash32('2026-09-23'));
});

test('the Daily: same day same pick; the pick varies over a month; seeded cells are stable', () => {
  const d1 = dailyFor('2026-09-22');
  assert.deepEqual(dailyFor('2026-09-22'), d1, 'stable within the day');
  assert.ok(DRILLS_BY_ID[d1.drillId], 'the pick is a real drill');
  const picks = new Set();
  for (let i = 1; i <= 30; i++) picks.add(dailyFor('2026-10-' + String(i).padStart(2, '0')).drillId);
  assert.ok(picks.size >= Math.min(3, DAILY_POOL.length), `a month of Dailies varies (saw ${picks.size})`);
  const day = dailyDrill('2026-09-22');
  assert.ok(day.drill, 'the day resolves to a drill');
  if (day.drill.seed) {
    const again = dailyDrill('2026-09-22');
    assert.deepEqual(again.seedCells, day.seedCells, 'seeded figures are the same for everyone');
  }
  assert.match(shareText('2026-09-22', 'X', 12.34, 'pro'), /12\.34s ◆◆/);
});

test('M20: the Daily draws from every keyed drill, free and Full Access, the stretch and long ones excepted', async () => {
  const { CATALOG } = await import('../content/catalog.js');
  const eligible = CATALOG.filter(e => e.dailyEligible).map(e => e.id);
  assert.deepEqual([...DAILY_POOL].sort(), [...eligible].sort(), "the pool is the catalog's dailyEligible set");
  assert.equal(DAILY_POOL.length, 73, 'the 73 keyed drills of the six chapters');
  assert.ok(DAILY_POOL.some(id => DRILLS_BY_ID[id].access === 'paid'), 'Full Access drills are drawn');
  assert.ok(DAILY_POOL.some(id => DRILLS_BY_ID[id].access === 'free'), 'free drills are drawn');
  const chapters = new Set();
  for (let i = 0; i < 400; i++) { const d = new Date(Date.UTC(2026, 9, 1) + i * 864e5).toISOString().slice(0, 10); chapters.add(DRILLS_BY_ID[dailyFor(d).drillId].chapter); }
  assert.equal(chapters.size, 6, 'over a year, every chapter comes round');
});

// rapid-fire's deck and stage have their own tests: rapid-deck.test.js (every prompt on a seeded fragment) and rapid-stage.test.js
