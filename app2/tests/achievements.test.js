// app2/tests/achievements.test.js — the badge wall holds its contract (Phase D): ids unique and
// frozen-shaped, every test() total over an empty ctx, glyphs well-formed, cosmetics resolve.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACHIEVEMENTS, RARITIES, practiceStreak } from '../content/achievements.js';
import { GLYPHS, RANK_EMBLEMS, glyphRows, glyphColours, renderPixel } from '../ui/pixel.js';
import { evaluateAchievements, earnedSet, badgesHtml } from '../ui/badges.js';
import { FREE_THEMES, themeLock, themeStates, levelFor, ownedFlair, flairBySlot, rollReward } from '../app/cosmetics.js';
import { SPRITES, spriteRows, spriteColours, spriteSvg } from '../ui/sprites.js';
import { FLAIR, FLAIR_AT } from '../content/flair.js';
import { siteCopy } from '../content/copy/apply.js';
import { tells } from '../content/copy/tells.js';
import { THEME_ORDER } from '../ui/themes.js';

test('achievements: 6.7 in full, ids unique, shapes sound, the jokes and Tested Out hidden', () => {
  assert.ok(ACHIEVEMENTS.length >= 60, `count ${ACHIEVEMENTS.length}`);
  for (const id of ['account', 'first-lesson', 'scenic-route', 'first-open', 'program', 'quest-week', 'level-30', 'ch6-verified', 'keys-ch6', 'clean-module'])
    assert.ok(ACHIEVEMENTS.some(a => a.id === id), id + ' is on the shelf');
  const ids = ACHIEVEMENTS.map(a => a.id);
  assert.equal(new Set(ids).size, ids.length, 'ids unique');
  for (const a of ACHIEVEMENTS) {
    assert.match(a.id, /^[a-z0-9-]+$/, a.id);
    assert.ok(a.name && a.desc, a.id + ': name and desc');
    assert.ok(RARITIES.includes(a.rarity), a.id + ': rarity');
    assert.ok(SPRITES[a.art], a.id + ': sprite "' + a.art + '" exists');
    assert.equal(siteCopy('ach_' + a.id, ''), a.name, a.id + ': the name is a site.csv row');
    assert.ok(siteCopy('ach_' + a.id + '_desc', ''), a.id + ': the line is a site.csv row');
    assert.deepEqual(tells(a.name + '. ' + a.desc), [], a.id + ' reads clean');
    assert.equal(typeof a.test, 'function', a.id + ': test');
  }
  assert.deepEqual(ACHIEVEMENTS.filter(a => a.hidden).map(a => a.id).sort(), ['blink', 'ch1-testout', 'early-bird', 'night-shift', 'old-habits', 'weekend']);
  // every Chapter 1 module carries its badge, by module id (Learn shows it as the reward)
  assert.equal(ACHIEVEMENTS.filter(a => a.module).length, 7);
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
    progress: Object.fromEntries(['inherited-workbook', 'know-the-screen', 'ribbon-by-keyboard', 'analyst-setup', 'colour-label-hardcode'].map(id => [id, { completed: true }])),   // every lesson of Open and set up
    attempts: [
      { kind: 'drill', ref: 'get-around', day: '2026-09-22', secs: 3.9, keys: 46, clean: true, helped: false, mouse: 0, tier: 'legendary', at: Date.parse('2026-09-22T13:00:00Z') },
      { kind: 'rapid', ref: 'rapid-60', day: '2026-09-22', secs: 60, keys: 40, clean: false, mouse: 0, tier: 'none', splits: [24, 0, 21, 520], at: Date.parse('2026-09-22T13:10:00Z') },
    ],
    pbs: { 'get-around': { ref: 'get-around', secs: 3.9 } },
    level: 5, streakDays: 7, signedIn: true, quests: { done: 1, weeks: 0 },
  };
  const done = earnedSet(ctx);
  for (const id of ['first-lesson', 'mod-setup', 'drill-1', 'pb-1', 'tier-pass', 'tier-pro', 'tier-legend', 'no-waste', 'rapid-1', 'rapid-500', 'combo-10', 'rapid-perfect', 'level-5', 'streak-7', 'blink', 'account', 'first-open', 'quest-1'])
    assert.ok(done.has(id), id + ' earned');
  assert.ok(!done.has('ch1-complete'));
  assert.ok(!done.has('mod-move'), 'the next module is untouched');
  assert.ok(!done.has('old-habits'), 'no mouse was used');
  assert.ok(!done.has('quest-25') && !done.has('ch1-verified'));
  // the gates read the chapter records
  assert.ok(earnedSet({ chapters: { foundations: { assessment: true } } }).has('ch1-verified'));
  assert.ok(earnedSet({ chapters: { foundations: { testout: true } } }).has('ch1-testout'));
  // a clean lesson latches in progress
  assert.ok(earnedSet({ progress: { 'know-the-screen': { completed: true, clean: true } } }).has('clean-1'));
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

test('the sprites: 16 by 16, four to six colors with the dark outline, every badge drawn, a silhouette when locked', () => {
  for (const k of Object.keys(SPRITES)) {
    const rows = spriteRows(k);
    assert.equal(rows.length, 16, k); for (const r of rows) assert.equal(r.length, 16, k);
    const cols = spriteColours(k);
    assert.ok(cols.length >= 3 && cols.length <= 6, k + ': ' + cols.length + ' colors');
    assert.ok(!cols.includes(undefined), k + ': every pixel has a palette color');
  }
  const svg = spriteSvg('keycap', { size: 64 });
  assert.match(svg, /^<svg class="sprite" width="64"/); assert.match(svg, /crispEdges/);
  const lockedSvg = spriteSvg('keycap', { locked: true });
  assert.equal(new Set([...lockedSvg.matchAll(/fill="([^"]+)"/g)].map(m => m[1])).size, 1, 'one fill when locked');
  assert.equal(spriteSvg('nope'), '');
});

test('the flair catalog: thirty items, one a level, every one named in the sheet; ownership and the weekly roll', () => {
  assert.equal(FLAIR.length, 30);
  for (let n = 1; n <= 30; n++) assert.ok(FLAIR_AT[n], 'an item at level ' + n);
  for (const f of FLAIR) { const w = siteCopy('flair_' + f.id, ''); assert.ok(w, f.id); assert.deepEqual(tells(w), [], f.id); }
  for (const f of FLAIR.filter(x => x.slot === 'board')) assert.ok(SPRITES[f.value], f.id + ' draws a sprite');
  assert.equal(ownedFlair({ level: 1 }).size, 1);
  assert.equal(ownedFlair({ level: 30 }).size, 30);
  assert.ok(ownedFlair({ level: 1, rolled: ['kc-gold'] }).has('kc-gold'));
  const slots = flairBySlot({ level: 10 });
  assert.ok(slots.keycap.some(k => k.owned) && slots.frame.find(f => f.value === 'ledger').owned);
  const roll = rollReward({ level: 1 }, 'w2026-09-28');
  assert.ok(['theme', 'keycap_skin', 'board_flair'].includes(FLAIR.find(f => f.id === roll).kind));
  assert.equal(rollReward({ level: 1 }, 'w2026-09-28'), roll, 'the same week rolls the same');
  assert.equal(rollReward({ level: 30 }, 'w'), null, 'nothing left to roll');
});

test('cosmetics: free themes open, the level ladder covers the rest, Amber is Chapter 1, Crimson is level 30', () => {
  for (const k of FREE_THEMES) { assert.ok(THEME_ORDER.includes(k), k + ' is a real theme'); assert.equal(themeLock(k, {}), null); }
  const states = themeStates({ level: 1 });
  assert.equal(states.length, THEME_ORDER.length);
  assert.ok(states.filter(s => s.lock).length > 0, 'a level-1 guest has themes to earn');
  for (const s of states) { const lv = levelFor(s.key); if (lv != null) assert.equal(themeLock(s.key, { level: lv }), null, s.key + ' opens at ' + lv); }
  assert.match(themeLock('bloomberg', {}), /Chapter 1/);
  assert.equal(themeLock('bloomberg', { earned: ['ch1-complete'] }), null);
  assert.match(themeLock('crimson', { level: 29 }), /30/);
  assert.equal(themeLock('crimson', { level: 30 }), null);
  assert.equal(themeLock('newsprint', { level: 1, rolled: ['theme-newsprint'] }), null, 'a rolled theme opens');
});
