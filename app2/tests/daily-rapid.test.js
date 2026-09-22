// app2/tests/daily-rapid.test.js — the Daily's determinism and the rapid-fire deck (Phase D).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dailyFor, dailyDrill, shareText } from '../app/daily.js';
import { mulberry32, hash32 } from '../engine/rng.js';
import { RAPID_DECK, RAPID_SHEET, RAPID_DURATIONS, hitPoints, deckOrder } from '../app/rapid-fire.js';
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

test('every rapid-fire prompt is hittable: its keys produce exactly its expected labels', () => {
  for (const pr of RAPID_DECK) {
    const sheet = new Sheet({ cells: { ...RAPID_SHEET }, active: { r: 2, c: 2 } });
    const session = new Session(sheet, {});
    const script = pr.keys.replace(/↑/g, 'Up').replace(/↓/g, 'Down').replace(/←/g, 'Left').replace(/→/g, 'Right');
    for (const step of parseKeyScript(script)) {
      if (step.type === 'text') for (const ch of step.text) session.key({ key: ch });
      else session.key(parseKeySpec(step.spec));
    }
    const labels = session.keyLog.map(e => e.k);
    assert.deepEqual(labels.slice(-pr.expect.length), pr.expect, `${pr.id}: tail of ${JSON.stringify(labels)}`);
  }
  const ids = RAPID_DECK.map(p => p.id);
  assert.equal(new Set(ids).size, ids.length, 'prompt ids unique');
  assert.deepEqual(RAPID_DURATIONS, [30, 60, 120]);
});

test('rapid scoring: the multiplier steps every five combo; the shuffle is seeded', () => {
  assert.equal(hitPoints(0), 10);
  assert.equal(hitPoints(4), 10);
  assert.equal(hitPoints(5), 20);
  assert.equal(hitPoints(10), 30);
  assert.deepEqual(deckOrder(7), deckOrder(7));
  assert.equal(deckOrder(7).length, RAPID_DECK.length);
  assert.deepEqual([...deckOrder(7)].sort((a, b) => a - b), RAPID_DECK.map((_, i) => i), 'a permutation');
});
