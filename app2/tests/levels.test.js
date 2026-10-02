// app2/tests/levels.test.js — the level table (M103, screenplay 6.10): the curve's constants, the
// eleven bands and their titles, a reward at every level, the themes every third level.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, LEVEL_BANDS, MAX_LEVEL, XP_PER_LEVEL, xpAtLevel, xpToNext, levelOf, titleAt, rewardAt, rewardKindAt, bandOf } from '../content/levels.js';
import { tells } from '../content/copy/tells.js';

test('the curve: 150n a level, cumulative 75n(n-1)', () => {
  assert.equal(XP_PER_LEVEL, 150);
  for (let n = 1; n <= MAX_LEVEL; n++) { assert.equal(xpToNext(n), 150 * n); assert.equal(xpAtLevel(n), 75 * n * (n - 1)); }
  for (let n = 1; n < MAX_LEVEL; n++) assert.equal(levelOf(xpAtLevel(n)).lvl, n, 'level ' + n + ' starts at its cumulative XP');
});

test('the table: thirty rows, eleven bands, one title and one reward each, every third level a theme', () => {
  assert.equal(LEVELS.length, 30);
  assert.equal(LEVEL_BANDS.length, 11);
  assert.equal(LEVEL_BANDS[0].from, 1); assert.equal(LEVEL_BANDS[LEVEL_BANDS.length - 1].to, 30);
  for (let i = 1; i < LEVEL_BANDS.length; i++) assert.equal(LEVEL_BANDS[i].from, LEVEL_BANDS[i - 1].to + 1, 'bands are contiguous');
  const titles = new Set(LEVEL_BANDS.map(b => b.title)); assert.equal(titles.size, 11, 'eleven distinct titles');
  for (const row of LEVELS) {
    assert.ok(row.title && typeof row.title === 'string', 'title at ' + row.level);
    assert.ok(row.reward && row.reward.kind && row.reward.label, 'reward at ' + row.level);
    assert.equal(bandOf(row.level).from, row.band);
    assert.deepEqual(tells(row.title), [], 'title reads clean: ' + row.title);
    assert.deepEqual(tells(row.reward.label), [], 'reward reads clean: ' + row.reward.label);
  }
  for (const n of [3, 6]) assert.equal(rewardKindAt(n), 'theme', 'a theme at ' + n);   // seven themes in all (Wolf, 2026-10-02): the rest of the bands pay flair
  for (const n of [9, 12, 15, 18, 21, 24, 27]) assert.notEqual(rewardKindAt(n), 'theme', 'flair at ' + n);
  assert.equal(rewardKindAt(1), 'themes_start'); assert.equal(rewardKindAt(10), 'profile_frame'); assert.equal(rewardKindAt(20), 'ghost_trail'); assert.equal(rewardKindAt(30), 'crimson');
  assert.equal(titleAt(1), 'New Workbook'); assert.equal(titleAt(30), 'Top Bucket'); assert.equal(titleAt(13), 'Alt Native');
  assert.equal(rewardAt(30).kind, 'crimson');
  assert.equal(rewardKindAt(0), null); assert.equal(rewardKindAt(31), null);
});
