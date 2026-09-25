// app2/tests/store.test.js — the progress facade: the guest path is progress.js unchanged, the
// optimistic merge follows the same rules as the server, the carry payload is well-formed, and
// a foreign account's cache or outbox is discarded, never used or sent.
import test from 'node:test';
import assert from 'node:assert/strict';

// localStorage stub BEFORE the store loads (progress.js/prefs.js read it lazily, but be safe)
const mem = new Map();
globalThis.localStorage = {
  get length() { return mem.size; },
  key(i) { return [...mem.keys()][i] ?? null; },
  getItem(k) { return mem.has(k) ? mem.get(k) : null; },
  setItem(k, v) { mem.set(k, String(v)); },
  removeItem(k) { mem.delete(k); },
};

const { store, mergeRun, rowsToLessons, buildCarryPayload, ownedCache, ownedOutbox, newId, CACHE_KEY, OUTBOX_KEY } = await import('../app/store.js');
const { progress } = await import('../app/progress.js');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

test('guest path: store.record delegates to progress.js unchanged', () => {
  mem.clear();
  assert.equal(store.saveState(), 'device');
  assert.equal(store.record('inherited-workbook', 'timed', 21.5, { clean: true }), true);
  assert.deepEqual(progress.get('inherited-workbook'), store.get('inherited-workbook'));
  assert.equal(store.get('inherited-workbook').best, 21.5);
  assert.equal(store.status('inherited-workbook'), 'mastered');
  assert.equal(mem.has(OUTBOX_KEY), false, 'no outbox for a guest');
  // help or mouse: no best, exactly as progress.js
  store.record('inherited-workbook', 'timed', 5, { clean: false });
  assert.equal(store.get('inherited-workbook').best, 21.5);
  progress.clear();
});

test('mergeRun mirrors the server: clean-only bests that never regress', () => {
  let l = {};
  l = mergeRun(l, 'a', 'guided', 30, true);
  assert.equal(l.a.completed, true);
  assert.equal('best' in l.a, false, 'guided sets no best');
  l = mergeRun(l, 'a', 'timed', 20, false);
  assert.equal('best' in l.a, false, 'dirty timed sets no best');
  l = mergeRun(l, 'a', 'timed', 21.5, true);
  assert.equal(l.a.best, 21.5);
  l = mergeRun(l, 'a', 'timed', 30, true);
  assert.equal(l.a.best, 21.5, 'the optimistic merge keeps the lower best');
  l = mergeRun(l, 'a', 'timed', 18.254, true);
  assert.equal(l.a.best, 18.25, 'rounded to 2dp like progress.js');
  l = mergeRun(l, 'a', 'solo', null, true);
  assert.equal(l.a.solo, true);
});

test('rowsToLessons maps server rows to the progress shape', () => {
  const rows = [
    { lesson_id: 'a', completed: true, solo: true, timed: true, best_secs: '18.25', last_at: '2026-09-22T10:00:00Z' },
    { lesson_id: 'b', completed: true, solo: false, timed: false, best_secs: null, last_at: null },
    { lesson_id: 7 }, null,
  ];
  const l = rowsToLessons(rows);
  assert.deepEqual(Object.keys(l).sort(), ['a', 'b']);
  assert.equal(l.a.best, 18.25);
  assert.equal(l.a.solo, true);
  assert.equal(typeof l.a.at, 'number');
  assert.equal('best' in l.b, false);
});

test('buildCarryPayload: one guided per completed lesson, solo/timed carry the flags and best, UUID ids', () => {
  const lessons = {
    done: { completed: true },
    mastered: { completed: true, solo: true, timed: true, best: 18.2 },
    startedOnly: { started: true },
  };
  const p = buildCarryPayload(lessons, { skipped: ['x'], experience: 'sometimes' }, 'guest-1');
  assert.equal(p.guest_id, 'guest-1');
  assert.equal(p.attempts.length, 4, 'guided ×2 + solo + timed; started-only carries nothing');
  assert.equal(p.lessons, 2);
  assert.equal(p.bests, 1);
  assert.deepEqual(p.skipped, ['x']);
  assert.equal(p.experience, 'sometimes');
  for (const a of p.attempts) {
    assert.match(a.id, UUID_RE, 'client-generated UUID ids');
    assert.ok(['guided', 'solo', 'timed'].includes(a.mode));
  }
  const timed = p.attempts.find(a => a.mode === 'timed');
  assert.equal(timed.secs, 18.2);
  assert.equal(p.attempts.find(a => a.mode === 'guided').secs, null);
  assert.equal(new Set(p.attempts.map(a => a.id)).size, 4, 'ids are unique');
  assert.match(newId(), UUID_RE);
});

test('a foreign account’s cache and outbox are discarded, never used or sent', () => {
  const cache = { uid: 'user-A', lessons: { a: { completed: true } } };
  assert.deepEqual(ownedCache(cache, 'user-A'), cache.lessons);
  assert.equal(ownedCache(cache, 'user-B'), null, 'foreign cache discarded');
  assert.equal(ownedCache(cache, null), null, 'no uid, no cache');
  assert.equal(ownedCache({ uid: 'user-A', lessons: 'corrupt' }, 'user-A'), null);
  const outbox = { uid: 'user-A', items: [{ id: 'x' }] };
  assert.deepEqual(ownedOutbox(outbox, 'user-A'), outbox.items);
  assert.deepEqual(ownedOutbox(outbox, 'user-B'), [], 'foreign outbox NEVER sent');
  assert.deepEqual(ownedOutbox({ uid: 'user-A', items: {} }, 'user-A'), []);
  assert.deepEqual(ownedOutbox(null, 'user-A'), []);
});

test('guest reads ignore any lingering account cache (signed out = progress.js only)', () => {
  mem.clear();
  mem.set(CACHE_KEY, JSON.stringify({ uid: 'user-A', lessons: { ghost: { completed: true } } }));
  assert.equal(store.get('ghost'), null, 'a signed-out visitor never sees another account’s cache');
  mem.clear();
});

test('attemptToWire shapes a records attempt for rpc_submit_game_attempt', async () => {
  const { attemptToWire } = await import('../app/store.js');
  const w = attemptToWire({
    id: 'a1b2c3d4-0000-4000-8000-000000000001', kind: 'drill', ref: 'edge-jumps', day: '2026-09-22',
    seed: 7, secs: 6.505, keys: 9, clean: true, helped: false, mouse: 0, tier: 'pass',
    splits: [1.5, 2], trace: [{ k: 'Ctrl+↓', t: 0, cell: 'A6' }], at: 1758500000000,
  });
  assert.equal(w.client_at, new Date(1758500000000).toISOString());
  assert.equal(w.at, undefined, 'at becomes client_at');
  assert.equal(w.secs, 6.51, 'seconds round as records.js rounds them');
  assert.equal(w.kind, 'drill'); assert.equal(w.tier, 'pass');
  assert.deepEqual(w.trace, [{ k: 'Ctrl+↓', t: 0, cell: 'A6' }], 'a clean run keeps its trace');
  assert.equal(attemptToWire({ id: 'x' }), null, 'junk stays home');
  const dirty = attemptToWire({ id: 'a1b2c3d4-0000-4000-8000-000000000002', kind: 'drill', ref: 'x', clean: false, trace: [{ k: 'A', t: 1 }], at: 1 });
  assert.deepEqual(dirty.trace, [], 'an unclean run sends no trace');
});

test('the game outbox is uid-owned like the lesson outbox', async () => {
  const { ownedOutbox: owned, GAME_OUTBOX_KEY } = await import('../app/store.js');
  assert.equal(typeof GAME_OUTBOX_KEY, 'string');
  assert.deepEqual(owned({ uid: 'u1', items: [{ id: 'a' }] }, 'u2'), [], 'a foreign account’s queued attempts are never sent');
  assert.deepEqual(owned({ uid: 'u1', items: [{ id: 'a' }] }, 'u1'), [{ id: 'a' }]);
});

test('mergeRun carries the challenge kind: flag, clean best and a tier that never regresses', () => {
  let l = {};
  l = mergeRun(l, 'ch', 'challenge', 80, true, { tier: 'pass' });
  assert.deepEqual(l.ch, { completed: true, challenge: true, best: 80, tier: 'pass', at: l.ch.at });
  l = mergeRun(l, 'ch', 'challenge', 55, true, { tier: 'legendary' });
  assert.equal(l.ch.tier, 'legendary'); assert.equal(l.ch.best, 55);
  l = mergeRun(l, 'ch', 'challenge', 70, false, { tier: 'pass' });
  assert.equal(l.ch.tier, 'legendary', 'a later lower tier never regresses the stamp');
  assert.equal(l.ch.best, 55, 'an unclean run sets no best');
  assert.equal(l.ch.timed, undefined, 'a challenge is not a timed lesson');
});
