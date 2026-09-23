// app2/tests/achievements.test.js — the badge wall holds its contract (Phase D): ids unique and
// frozen-shaped, every test() total over an empty ctx, glyphs well-formed, cosmetics resolve.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACHIEVEMENTS, RARITIES, practiceStreak } from '../content/achievements.js';
import { GLYPHS, RANK_EMBLEMS, glyphRows, glyphColours, renderPixel } from '../ui/pixel.js';
import { evaluateAchievements, earnedSet, badgesHtml } from '../ui/badges.js';
import { FREE_THEMES, themeLock, themeStates, levelFor, rankFlair } from '../app/cosmetics.js';
import { THEME_ORDER } from '../ui/themes.js';

test('achievements: at least 38, ids unique, shapes sound, five hidden', () => {
  assert.ok(ACHIEVEMENTS.length >= 38, `count ${ACHIEVEMENTS.length}`);
  const ids = ACHIEVEMENTS.map(a => a.id);
  assert.equal(new Set(ids).size, ids.length, 'ids unique');
  for (const a of ACHIEVEMENTS) {
    assert.match(a.id, /^[a-z0-9-]+$/, a.id);
    assert.ok(a.name && a.desc, a.id + ': name and desc');
    assert.ok(RARITIES.includes(a.rarity), a.id + ': rarity');
    assert.ok(GLYPHS[a.glyph], a.id + ': glyph "' + a.glyph + '" exists');
    assert.equal(typeof a.test, 'function', a.id + ': test');
  }
  assert.equal(ACHIEVEMENTS.filter(a => a.hidden).length, 5, 'exactly five hidden');
});

test('every test({}) returns {done:false} without throwing; progress stays within goal', () => {
  for (const a of ACHIEVEMENTS) {
    let r;
    assert.doesNotThrow(() => { r = a.test({}); }, a.id);
    assert.equal(r.done, false, a.id + ': a fresh guest has earned nothing');
    assert.ok(Number.isFinite(r.goal) && r.goal >= 1, a.id + ': goal');
    assert.ok(r.prog >= 0 && r.prog <= r.goal, a.id + ': prog within goal');
    assert.doesNotThrow(() => a.test(undefined), a.id + ': undefined ctx');
    assert.doesNotThrow(() => a.test({ progress: null, attempts: 'x', pbs: 3 }), a.id + ': junk ctx');
  }
  const states = evaluateAchievements({});
  assert.equal(states.filter(s => s.done).length, 0);
  assert.equal(earnedSet({}).size, 0);
  assert.ok(badgesHtml({}).includes('badge-shelf'));
});

test('a played ctx earns the right badges', () => {
  const ctx = {
    progress: { 'welcome-race': { completed: true }, 'welcome-export': { completed: true } },
    attempts: [
      { kind: 'drill', ref: 'edge-jumps', day: '2026-09-22', secs: 3.9, keys: 8, clean: true, helped: false, mouse: 0, tier: 'legendary', at: Date.parse('2026-09-22T13:00:00Z') },
      { kind: 'rapid', ref: 'rapid-60', day: '2026-09-22', secs: 60, keys: 40, clean: false, mouse: 0, tier: 'none', splits: [12, 2, 11, 520], at: Date.parse('2026-09-22T13:10:00Z') },
    ],
    pbs: { 'edge-jumps': { ref: 'edge-jumps', secs: 3.9 } },
    level: 5, streakDays: 7,
  };
  const done = earnedSet(ctx);
  for (const id of ['first-lesson', 'sec-welcome', 'drill-1', 'pb-1', 'tier-pass', 'tier-pro', 'tier-legend', 'no-waste', 'rapid-1', 'rapid-500', 'combo-10', 'level-5', 'streak-7', 'blink'])
    assert.ok(done.has(id), id + ' earned');
  assert.ok(!done.has('ch1-complete'));
  assert.ok(!done.has('old-habits'), 'no mouse was used');
});

test('practiceStreak counts consecutive UTC days and survives junk', () => {
  assert.equal(practiceStreak(['2026-09-22', '2026-09-21', '2026-09-20'], '2026-09-22'), 3);
  assert.equal(practiceStreak(['2026-09-21', '2026-09-20'], '2026-09-22'), 2, 'yesterday keeps the run alive');
  assert.equal(practiceStreak(['2026-09-19'], '2026-09-22'), 0, 'a two-day gap breaks it');
  assert.equal(practiceStreak([], '2026-09-22'), 0);
  assert.equal(practiceStreak(null, 'nonsense'), 0);
});

test('pixel glyphs: 16×16, at most 6 colours, emblems for all eight tiers, SVG renders', () => {
  for (const [name, g] of [...Object.entries(GLYPHS), ...Object.entries(RANK_EMBLEMS)]) {
    assert.doesNotThrow(() => glyphRows(g), name + ' is 16×16');
    assert.ok(glyphColours(g).length <= 6, name + ': at most 6 colours');
  }
  assert.equal(Object.keys(RANK_EMBLEMS).length, 8);
  const svg = renderPixel(GLYPHS.star, { b: '#f00' });
  assert.match(svg, /^<svg /);
  assert.match(svg, /crispEdges/);
  assert.match(svg, /fill="#f00"/);
  assert.ok(!renderPixel(GLYPHS.star, {}, { mono: '#888' }).includes('var(--accent)'), 'mono silhouettes one colour');
});

test('cosmetics: free themes open, level ladder covers the rest, flair clamps', () => {
  for (const k of FREE_THEMES) { assert.ok(THEME_ORDER.includes(k), k + ' is a real theme'); assert.equal(themeLock(k, {}), null); }
  const states = themeStates({ level: 1 });
  assert.equal(states.length, THEME_ORDER.length);
  const locked = states.filter(s => s.lock);
  assert.ok(locked.length > 0, 'a level-1 guest has themes to earn');
  for (const s of locked) assert.equal(typeof s.lock, 'string');
  // every level-locked theme opens by its level
  for (const s of states) { const lv = levelFor(s.key); if (lv != null) assert.equal(themeLock(s.key, { level: lv }), null, s.key + ' opens at ' + lv); }
  assert.match(themeLock('bloomberg', {}), /Foundations/);
  assert.equal(themeLock('bloomberg', { earned: ['ch1-complete'] }), null);
  assert.match(themeLock('crimson', { rankIndex: 2 }), /MD/);
  assert.equal(themeLock('crimson', { rankIndex: 6 }), null);
  assert.equal(rankFlair(99).frame, 'frame-diamond');
  assert.equal(rankFlair(-1).frame, 'frame-none');
});
