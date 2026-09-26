// app2/tests/entitlement.test.js — the paid gate's client side: a guest is never entitled, a
// row is live between its dates, the lock reads a lesson's access, the mirror is per uid.
import test from 'node:test';
import assert from 'node:assert/strict';
import { entitlement, isLive, ENTITLEMENT_KEY } from '../app/entitlement.js';

const T0 = Date.parse('2026-09-26T12:00:00Z');

test('isLive: between starts_at and ends_at; a null ends_at never expires; junk is not live', () => {
  assert.equal(isLive({ starts_at: '2026-09-01T00:00:00Z', ends_at: null }, T0), true);
  assert.equal(isLive({ starts_at: '2026-09-01T00:00:00Z', ends_at: '2026-10-01T00:00:00Z' }, T0), true);
  assert.equal(isLive({ starts_at: '2026-09-01T00:00:00Z', ends_at: '2026-09-20T00:00:00Z' }, T0), false, 'ended');
  assert.equal(isLive({ starts_at: '2026-10-01T00:00:00Z', ends_at: null }, T0), false, 'not started');
  assert.equal(isLive({ starts_at: 'never', ends_at: null }, T0), false);
  assert.equal(isLive(null, T0), false); assert.equal(isLive('paid', T0), false);
});

test('a guest (auth unavailable in Node) is never entitled, so every paid lesson is locked and no free one is', async () => {
  entitlement.reset();
  assert.equal(entitlement.entitled(), false);
  assert.equal(await entitlement.refresh(), false);
  assert.equal(entitlement.locked({ id: 'x', access: 'paid' }), true);
  assert.equal(entitlement.locked({ id: 'y', access: 'free' }), false);
  assert.equal(entitlement.locked(null), false);
});

test('the localStorage mirror is honoured only for the signed-in uid: with no account it is ignored', () => {
  const s = new Map();
  globalThis.localStorage = { getItem: k => (s.has(k) ? s.get(k) : null), setItem: (k, v) => s.set(k, String(v)), removeItem: k => s.delete(k) };
  try {
    globalThis.localStorage.setItem(ENTITLEMENT_KEY, JSON.stringify({ uid: 'someone', paid: true, at: T0 }));
    entitlement.reset();
    assert.equal(entitlement.entitled(), false, 'a stale mirror never entitles a guest');
  } finally { delete globalThis.localStorage; }
});
