// app2/tests/rail.test.js — M88: the rail's data (3.0's items, letters and account row), the
// KeyTips registry's letter assignment, the cursor's arrow arithmetic and the week's cells; every
// word the rail shows is a site.csv row that reads clean.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RAIL_ITEMS, ACCOUNT_ITEMS, LANDING_ITEMS, weekCells, initials, ACCOUNT_TIP } from '../ui/components/rail.js';
import { RAIL_TIPS, RESERVED, assignLetters } from '../ui/components/keytips.js';
import { nextIndex } from '../ui/components/cursor.js';
import { COPY } from '../content/copy/index.js';
import { tells } from '../content/copy/tells.js';
import { navKeyFor, modeOf, parseRoute, WORKSPACE_ROUTES } from '../app/main.js';

test('the rail, top to bottom: Home, Learn, Practice with its four modes, Leaderboards, Reference; the account row opens four pages', () => {
  assert.deepEqual(RAIL_ITEMS.map(i => i.key), ['home', 'learn', 'practice', 'leaderboard', 'reference']);
  const practice = RAIL_ITEMS.find(i => i.key === 'practice');
  assert.deepEqual(practice.children.map(c => c.key), ['daily', 'drills', 'rapid', 'challenges']);
  assert.deepEqual(practice.children.map(c => c.mode), ['daily', 'drills', 'rapid', 'challenges'], 'each mode carries its color mark');
  assert.deepEqual(ACCOUNT_ITEMS.map(i => i.key), ['profile', 'settings', 'billing', 'certificate']);
  assert.deepEqual(LANDING_ITEMS.map(i => i.key), ['pricing', 'teams', 'signin'], 'the landing page: Pricing, For teams, Sign in');
  // every word is a site.csv row and reads clean
  const all = [...RAIL_ITEMS, ...practice.children, ...ACCOUNT_ITEMS, ...LANDING_ITEMS];
  for (const it of all) { assert.ok(it.copy in COPY.site, it.copy + ' in site.csv'); assert.deepEqual(tells(COPY.site[it.copy]), [], it.copy); }
  for (const k of ['rail_level', 'rail_xp', 'rail_streak', 'rail_streak_none', 'rail_go_pro', 'rail_account', 'rail_sign_in', 'rail_sign_out', 'rail_menu', 'rail_week_days']) assert.ok(k in COPY.site, k);
});

test('KeyTips: the fixed letters of 3.0, and a page takes the next free ones', () => {
  assert.deepEqual(RAIL_TIPS, { home: 'H', learn: 'L', practice: 'P', daily: 'D', drills: 'R', rapid: 'F', challenges: 'C', leaderboard: 'B', reference: 'E', account: 'A' });
  const flat = RAIL_ITEMS.flatMap(i => [i, ...(i.children || [])]);
  for (const it of flat) assert.equal(it.tip, RAIL_TIPS[it.key], it.key + ' carries its letter');
  assert.equal(ACCOUNT_TIP, RAIL_TIPS.account);
  assert.equal(new Set(flat.map(i => i.tip).concat(ACCOUNT_TIP)).size, flat.length + 1, 'no letter twice');
  // a page's panels: the first letter when free, else the next free letter; never a rail letter
  assert.deepEqual(assignLetters(['Next lesson', 'Today', 'Achievements', 'Level']), ['N', 'T', 'G', 'I']);
  assert.deepEqual(assignLetters(['Start drilling', 'See the set', 'Settings']), ['S', 'G', 'I']);
  assert.deepEqual(assignLetters(['Home']), ['G'], 'H is the rail\'s');
  const many = assignLetters(Array.from({ length: 30 }, (_, i) => 'Item ' + i));
  assert.equal(many.filter(Boolean).length, 26 - RESERVED.size, 'the alphabet runs out past the free letters');
  assert.ok(many.every(l => l === null || !RESERVED.has(l)));
});

test('the cursor moves by one in a list, by a row in a grid, never wraps', () => {
  assert.equal(nextIndex(-1, 5, 'ArrowDown'), 0, 'nothing selected: the first');
  assert.equal(nextIndex(0, 5, 'ArrowDown'), 1); assert.equal(nextIndex(4, 5, 'ArrowDown'), 4); assert.equal(nextIndex(0, 5, 'ArrowUp'), 0);
  assert.equal(nextIndex(2, 5, 'ArrowLeft'), 1); assert.equal(nextIndex(2, 5, 'ArrowRight'), 3);
  assert.equal(nextIndex(1, 9, 'ArrowDown', 3), 4); assert.equal(nextIndex(7, 9, 'ArrowDown', 3), 8); assert.equal(nextIndex(4, 9, 'ArrowUp', 3), 1);
  assert.equal(nextIndex(0, 0, 'ArrowDown'), -1);
});

test('the week\'s cells: Monday to Sunday of the week holding today', () => {
  const w = weekCells(['2026-09-28', '2026-09-30', '2026-10-01'], '2026-10-01');   // a Thursday
  assert.deepEqual(w.cells, [true, false, true, true, false, false, false]); assert.equal(w.today, 3);
  assert.deepEqual(weekCells([], 'junk'), { cells: Array(7).fill(false), today: -1 });
  assert.equal(weekCells(['2026-10-04'], '2026-10-04').today, 6, 'Sunday is the last cell');
  assert.equal(initials('wolf_d'), 'WO'); assert.equal(initials(''), '');
});

test('the shell: the four modes route under Practice, each route lights its rail item and sets its mode color', () => {
  assert.deepEqual(parseRoute('#/practice/daily'), { name: 'practice', params: { mode: 'daily' }, query: {}, path: '/practice/daily' });
  assert.equal(parseRoute('#/leaderboards').name, 'leaderboard');
  assert.equal(navKeyFor('practice', { mode: 'challenges' }), 'challenges'); assert.equal(navKeyFor('home'), 'home');
  assert.equal(modeOf('practice', { mode: 'daily' }), 'daily'); assert.equal(modeOf('drill', {}), 'drills'); assert.equal(modeOf('rapid'), 'rapid'); assert.equal(modeOf('learn'), 'learn'); assert.equal(modeOf('leaderboard'), 'daily');
  assert.deepEqual([...WORKSPACE_ROUTES].sort(), ['drill', 'due', 'lesson', 'rapid'], 'Alt is the Ribbon\'s inside the workspace');
});
