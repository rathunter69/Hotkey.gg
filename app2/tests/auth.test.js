// app2/tests/auth.test.js — the generation token (account isolation), the sign-out wipe list,
// and client-side handle validation. auth.js has no DOM at top level, so it imports cleanly here.
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeOwnerTracker, signOutWipe, SIGNOUT_WIPE_KEYS, auth } from '../app/auth.js';
import { validateHandle, HANDLE_RE } from '../app/handle.js';

function fakeStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return {
    get length() { return m.size; },
    key(i) { return [...m.keys()][i] ?? null; },
    getItem(k) { return m.has(k) ? m.get(k) : null; },
    setItem(k, v) { m.set(k, String(v)); },
    removeItem(k) { m.delete(k); },
    keys() { return [...m.keys()]; },
  };
}

test('generation: A → B → A is three generations and every stale token is rejected', () => {
  const t = makeOwnerTracker();
  assert.deepEqual(t.token(), { id: '', generation: 0 });
  assert.equal(t.set('A'), true);
  const tokenA1 = t.token();
  assert.equal(tokenA1.generation, 1);
  assert.equal(t.current(tokenA1), true);
  assert.equal(t.set('A'), false, 'same owner: no bump');
  assert.equal(t.set('B'), true);
  const tokenB = t.token();
  assert.equal(tokenB.generation, 2);
  assert.equal(t.current(tokenA1), false, 'A’s token is dead once B owns the session');
  assert.equal(t.set('A'), true);
  assert.equal(t.token().generation, 3, 'A again is a THIRD generation');
  assert.equal(t.current(tokenA1), false, 'A’s old token stays dead: same id, older generation');
  assert.equal(t.current(tokenB), false);
  assert.equal(t.current(t.token()), true);
  assert.equal(t.current(null), false);
  assert.equal(t.set(null), true, 'sign-out (empty owner) bumps too');
  assert.equal(t.token().generation, 4);
});

test('signOutWipe: account traces go, device keys stay', () => {
  const s = fakeStorage({
    hk2_progress_v1: '{}', hk2_outbox_v1: '{}', hk2_cache_v1: '{}', hk2_guest_id: 'g',
    hotkey_theme: 'noir', hotkey_theme_vars: '{"vars":{}}', hk2_prefs: '{"platform":"mac"}',
    'sb-wepejasrnskvftgnnecr-auth-token': 'jwt', 'sb-xyz-auth-token.0': 'chunk', 'supabase.auth.token': 'legacy',
  });
  signOutWipe(s);
  for (const k of SIGNOUT_WIPE_KEYS) assert.equal(s.getItem(k), null, k + ' wiped');
  assert.equal(s.getItem('sb-wepejasrnskvftgnnecr-auth-token'), null, 'supabase session token wiped');
  assert.equal(s.getItem('sb-xyz-auth-token.0'), null, 'chunked token wiped');
  assert.equal(s.getItem('supabase.auth.token'), null, 'legacy token wiped');
  assert.equal(s.getItem('hk2_prefs'), '{"platform":"mac"}', 'device prefs stay');
  assert.equal(s.getItem('hotkey_theme_vars'), '{"vars":{}}', 'the paint cache stays (repainted on next theme apply)');
});

test('auth in Node (no window): unavailable and harmless', async () => {
  await auth.ready();
  assert.equal(auth.state(), 'unavailable');
  assert.equal(auth.user(), null);
  assert.equal(auth.current(auth.token()), true);
  const r = await auth.signInPassword('a@b.co', 'pw');
  assert.equal(r.error, 'Sign-in is not configured');
});

test('validateHandle mirrors the server rules', () => {
  assert.equal(validateHandle('CleanLedger42'), '');
  assert.equal(validateHandle('abc'), '');
  assert.ok(validateHandle('ab'), 'too short');
  assert.ok(validateHandle('has space'), 'spaces');
  assert.ok(validateHandle('a'.repeat(21)), 'too long');
  assert.ok(validateHandle('AdminBoss'), 'banned word');
  assert.ok(validateHandle(''), 'empty');
  assert.ok(validateHandle(null), 'null');
  assert.match('Under_Score_9', HANDLE_RE);
});
