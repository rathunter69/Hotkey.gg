// app2/tests/store-sync.test.js — the signed-in path end to end against an in-memory fake of the
// Supabase project (no network): a cleared cache rehydrates a passed module from the challenge
// runs, ten offline attempts drain in order with no duplicates (even when a reply is lost after
// the insert), first sign-in replays guest runs flagged p_guest, a 401 the refresh cannot fix
// degrades to guest without losing the queue, and sign-out wipes the account's device traces.
import test from 'node:test';
import assert from 'node:assert/strict';

const mem = new Map();
const storage = () => ({
  get length() { return mem.size; },
  key(i) { return [...mem.keys()][i] ?? null; },
  getItem(k) { return mem.has(k) ? mem.get(k) : null; },
  setItem(k, v) { mem.set(k, String(v)); },
  removeItem(k) { mem.delete(k); },
});
globalThis.localStorage = storage();
globalThis.sessionStorage = { getItem: () => 's1', setItem() {} };

/* ---------------------------------------------------------------- the fake project */
const USER = { id: '00000000-0000-4000-8000-00000000000a', email: 'walk@example.test' };
const server = {
  offline: false,
  loseReplyOnce: false,       // insert lands, the reply never arrives (the client must resend safely)
  expired: false,             // every RPC answers 401
  refreshOk: true,
  session: { user: USER },
  attempts: new Map(),        // lesson attempts by id
  order: [],                  // lesson attempt ids in arrival order (first arrival only)
  game: new Map(),            // game attempts by id
  guestFlags: [],
  profile: { handle: 'walker', level: 1, xp: 0, theme: null, experience: null, first_run_done: true, skipped_lessons: [], public_profile: true, carried_at: null },
  authCb: null,
  rpc(name, args) {
    if (this.offline) throw new TypeError('Failed to fetch');
    if (this.expired) return { data: null, error: { message: 'JWT expired', code: 'PGRST301' }, status: 401 };
    const ok = data => ({ data, error: null, status: 200 });
    switch (name) {
      case 'rpc_record_attempt': {
        const p = args.p;
        if (!this.attempts.has(p.id)) { this.attempts.set(p.id, p); this.order.push(p.id); }
        if (this.loseReplyOnce) { this.loseReplyOnce = false; throw new TypeError('Failed to fetch'); }
        return ok(null);
      }
      case 'rpc_submit_game_attempt': {
        if (!this.game.has(args.p.id)) { this.game.set(args.p.id, args.p); this.guestFlags.push(args.p_guest); }
        return ok(null);
      }
      case 'rpc_my_progress': {
        const by = {};
        for (const a of this.attempts.values()) {
          const e = by[a.lesson_id] || (by[a.lesson_id] = { lesson_id: a.lesson_id, completed: true, solo: false, timed: false, best_secs: null, last_at: a.client_at });
          if (a.mode === 'solo') e.solo = true;
          if (a.mode === 'timed') e.timed = true;
        }
        return ok(Object.values(by).sort((x, y) => (x.lesson_id < y.lesson_id ? -1 : 1)).filter(r => r.lesson_id > (args.p_after || '')));
      }
      case 'rpc_my_game': {
        const best = {};
        for (const g of this.game.values()) if (g.clean && g.secs != null && (!best[g.ref] || g.secs < best[g.ref].secs)) best[g.ref] = { ref: g.ref, secs: g.secs, keys: g.keys, tier: g.tier, attempt_id: g.id, at: g.client_at };
        return ok(Object.values(best));
      }
      case 'rpc_carry_over': {
        if (this.profile.carried_at) return { data: null, error: { message: 'already carried' }, status: 400 };
        for (const a of args.p_attempts) if (!this.attempts.has(a.id)) { this.attempts.set(a.id, a); this.order.push(a.id); }
        this.profile.carried_at = new Date().toISOString();
        return ok(null);
      }
      case 'rpc_set_profile': return ok(this.profile);
      default: return ok(null);
    }
  },
  select(table, filters) {
    if (this.offline) throw new TypeError('Failed to fetch');
    if (table === 'profiles') return { data: this.profile, error: null };
    if (table === 'game_attempts') return { data: [...this.game.values()].filter(g => !filters.kind || g.kind === filters.kind), error: null };
    return { data: null, error: { message: 'no table' } };
  },
};
function query(table) {
  const filters = {};
  const q = {
    select() { return q; }, order() { return q; }, limit() { return q; }, single() { return q; },
    eq(col, v) { filters[col] = v; return q; },
    then(res, rej) { try { return Promise.resolve(server.select(table, filters)).then(res, rej); } catch (e) { return Promise.reject(e).then(res, rej); } },
  };
  return q;
}
const client = {
  auth: {
    onAuthStateChange(cb) { server.authCb = cb; return { data: { subscription: { unsubscribe() {} } } }; },
    async getSession() { return { data: { session: server.session } }; },
    async refreshSession() { return server.refreshOk ? { data: { session: server.session }, error: null } : { data: { session: null }, error: { message: 'Invalid Refresh Token' } }; },
    async signOut() { return { error: null }; },
  },
  async rpc(name, args) { return server.rpc(name, args); },
  from(table) { return query(table); },
};
globalThis.window = { supabase: { createClient: () => client }, addEventListener() {}, dispatchEvent() {} };
globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init && init.detail; } };

const { auth } = await import('../app/auth.js');
const { records } = await import('../app/records.js');
const { progress } = await import('../app/progress.js');
const { moduleStatus } = await import('../app/learn-page.js');
const S = await import('../app/store.js');
const { store, OUTBOX_KEY, CACHE_KEY, GAME_OUTBOX_KEY } = S;
const tick = () => new Promise(r => setTimeout(r, 5));

/** Fire the auth callback the way supabase-js does and let the store react as main.js does. */
async function authEvent(event, session) {
  server.session = session;
  server.authCb(event, session);
  await tick();
}

test('first sign-in: guest lessons carry over and guest runs replay flagged p_guest', async () => {
  // a guest plays 1.1.1 and a drill on this device
  progress.record('inherited-workbook', 'guided', 40, {});
  records.addAttempt({ id: '10000000-0000-4000-8000-000000000001', kind: 'drill', ref: 'edge-jumps', secs: 6.5, keys: 9, clean: true, tier: 'pass', trace: [{ k: 'Ctrl+↓', t: 0 }], at: Date.now() });
  server.session = null;
  await auth.ready();
  assert.equal(auth.state(), 'out');
  await authEvent('SIGNED_IN', { user: USER });
  assert.equal(auth.state(), 'in');
  await store.hydrate();
  await store.drain(1000);
  assert.equal(store.get('inherited-workbook').completed, true, 'the guest lesson shows complete on the account');
  assert.ok(server.profile.carried_at, 'carried once');
  assert.equal(server.game.size, 1, 'the guest drill run reached the account');
  assert.deepEqual(server.guestFlags, [true], 'flagged p_guest');
  assert.equal(Object.keys(progress.all()).length, 0, 'the guest copy is spent after carrying');
  assert.equal(store.saveState(), 'account');
});

test('a passed module survives a cleared cache: lessons from rpc_my_progress + the challenge run', async () => {
  const mod = { lessons: ['l-one', 'l-two'], challenge: { id: 'challenge-mod' } };
  store.record('l-one', 'guided', 30, {});
  store.record('l-two', 'guided', 30, {});
  store.record('challenge-mod', 'challenge', 70, { clean: true, tier: 'pro' });
  store.addAttempt({ id: '20000000-0000-4000-8000-000000000001', kind: 'challenge', ref: 'challenge-mod', secs: 70, keys: 40, clean: true, tier: 'pro', at: Date.now() });
  await store.drain(1000);
  assert.equal(moduleStatus(mod, store.all()), 'complete');
  // the reload: device cache gone, a fresh store module, same signed-in session
  mem.delete(CACHE_KEY);
  store.reset();
  const fresh = (await import('../app/store.js?reload=1')).store;
  assert.notEqual(moduleStatus(mod, fresh.all()), 'complete', 'nothing on the device before hydrate');
  await fresh.hydrate();
  const all = fresh.all();
  assert.equal(moduleStatus(mod, all), 'complete', 'module rebuilt from the server');
  assert.equal(all['challenge-mod'].tier, 'pro', 'tier carried on the run');
  assert.equal(all['challenge-mod'].best, 70);
  assert.equal(records.pb('challenge-mod').secs, 70, 'the PB is on the device again');
  fresh.reset();
});

test('offline for ten attempts, then online: drains in order, no duplicates, even with a lost reply', async () => {
  await store.hydrate();
  const before = server.order.length;
  server.offline = true;
  const ids = [];
  for (let i = 0; i < 10; i++) { store.record('offline-' + i, 'guided', 10 + i, {}); ids.push('offline-' + i); }
  await tick();
  assert.equal(JSON.parse(mem.get(OUTBOX_KEY)).items.length, 10, 'all ten queued on the device');
  assert.equal(store.saveState(), 'retry');
  assert.equal(store.saveText(), 'Couldn’t save, will retry');
  assert.equal(store.get('offline-9').completed, true, 'the lesson never waits on the network');
  server.offline = false;
  server.loseReplyOnce = true;       // the first insert lands but its reply is lost: it is resent
  await store.flushNow();            // the lost reply parks the drain on backoff
  await store.flushNow();            // back online (the 'online' event path)
  const arrived = server.order.slice(before).map(id => server.attempts.get(id).lesson_id);
  assert.deepEqual(arrived, ids, 'in order, each exactly once');
  assert.equal(JSON.parse(mem.get(OUTBOX_KEY)).items.length, 0);
  assert.equal(store.saveState(), 'account');
  assert.equal(store.saveText(), 'Saved to your account');
  // a stale hydrate never hides queued work: queue one offline, hydrate, it still shows
  server.offline = true;
  store.record('queued-late', 'guided', 5, {});
  server.offline = false;
  const origRpc = client.rpc;
  client.rpc = async (n, a) => (n === 'rpc_record_attempt' ? { data: null, error: { message: 'boom' }, status: 500 } : origRpc(n, a));
  await store.hydrate();
  assert.equal(store.get('queued-late').completed, true, 'queued run laid over the server rows');
  client.rpc = origRpc;
  await store.drain(1000);
  assert.equal([...server.attempts.values()].filter(a => a.lesson_id === 'queued-late').length, 1);
});

test('a 401 the refresh cannot fix: guest mode, nothing lost, the same account picks the queue up', async () => {
  server.expired = true;
  server.refreshOk = false;
  store.record('during-expiry', 'guided', 12, {});
  await store.drain(500);
  assert.equal(auth.state(), 'out', 'degraded to guest');
  assert.equal(auth.lostUid(), USER.id);
  store.reset();
  assert.equal(store.get('during-expiry').completed, true, 'local progress still shows');
  assert.equal(store.get('l-one').completed, true, 'the account cache still shows');
  store.record('after-expiry', 'guided', 9, {});
  assert.equal(store.saveState(), 'retry', 'honest: queued, not saved');
  assert.deepEqual(JSON.parse(mem.get(OUTBOX_KEY)).items.map(i => i.lesson_id), ['during-expiry', 'after-expiry']);
  assert.equal(JSON.parse(mem.get(OUTBOX_KEY)).uid, USER.id, 'still owned by the account, never sent as anyone else');
  // sign back in: the queue drains to the same account
  server.expired = false; server.refreshOk = true;
  await authEvent('SIGNED_IN', { user: USER });
  await store.hydrate();
  await store.drain(1000);
  const got = [...server.attempts.values()].map(a => a.lesson_id);
  assert.ok(got.includes('during-expiry') && got.includes('after-expiry'));
  assert.equal(store.saveState(), 'account');
});

test('sign-out wipes the account traces now; a reply for the old token is dropped', async () => {
  store.addAttempt({ id: '30000000-0000-4000-8000-000000000001', kind: 'drill', ref: 'edge-jumps', secs: 5, keys: 8, clean: true, tier: 'pro', at: Date.now() });
  const t = auth.token();
  await auth.signOut();
  assert.equal(auth.current(t), false, 'the old generation is dead');
  for (const k of [CACHE_KEY, OUTBOX_KEY, GAME_OUTBOX_KEY, 'hk2_records_v1', 'hk2_game_sync_v1', 'hk2_progress_v1']) assert.equal(mem.has(k), false, k + ' wiped');
  assert.equal(auth.lostUid(), null, 'an explicit sign-out keeps nothing for later');
  store.reset();
  assert.equal(store.get('l-one'), null, 'the next visitor sees a clean guest');
  assert.equal(store.saveState(), 'device');
  assert.equal(records.attempts().length, 0, 'no runs left to replay into the next account');
});
