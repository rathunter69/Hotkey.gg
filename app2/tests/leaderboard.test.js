// app2/tests/leaderboard.test.js — the Leaderboard on the real board (SITE_SPEC §2): signed out it
// stays local and says the global field opens on sign-in; signed in it reads rpc_board through
// the store, shows the top rows plus your own row when you sit below them, keeps this device's
// times beneath (never merged), says an empty board is empty in one line, and a failed read says
// so while the local rows stay. In-memory fake of the Supabase project; no network.
import test from 'node:test';
import assert from 'node:assert/strict';

const mem = new Map();
globalThis.localStorage = {
  get length() { return mem.size; },
  key(i) { return [...mem.keys()][i] ?? null; },
  getItem(k) { return mem.has(k) ? mem.get(k) : null; },
  setItem(k, v) { mem.set(k, String(v)); },
  removeItem(k) { mem.delete(k); },
};
globalThis.sessionStorage = { getItem: () => 's1', setItem() {} };

const USER = { id: '00000000-0000-4000-8000-0000000000b1', email: 'board@example.test' };
const server = {
  session: null,
  authCb: null,
  boards: {},          // ref|seed → rows
  fail: false,
  calls: [],
  profile: { handle: 'boardwalker', level: 3, xp: 0, theme: null, experience: null, first_run_done: true, skipped_lessons: [], public_profile: true, carried_at: '2026-09-01T00:00:00Z' },
  rpc(name, args) {
    const ok = data => ({ data, error: null, status: 200 });
    if (name === 'rpc_board') {
      this.calls.push(args);
      if (this.fail) return { data: null, error: { message: 'upstream timeout' }, status: 504 };
      return ok(this.boards[args.p_ref + '|' + (args.p_seed ?? '')] || []);
    }
    if (name === 'rpc_my_progress' || name === 'rpc_my_game') return ok([]);
    return ok(null);
  },
};
function query(table) {
  const q = {
    select() { return q; }, order() { return q; }, limit() { return q; }, single() { return q; }, eq() { return q; },
    then(res, rej) { return Promise.resolve(table === 'profiles' ? { data: server.profile, error: null } : { data: [], error: null }).then(res, rej); },
  };
  return q;
}
const client = {
  auth: {
    onAuthStateChange(cb) { server.authCb = cb; return { data: { subscription: { unsubscribe() {} } } }; },
    async getSession() { return { data: { session: server.session } }; },
    async refreshSession() { return { data: { session: server.session }, error: null }; },
    async signOut() { return { error: null }; },
  },
  async rpc(name, args) { return server.rpc(name, args); },
  from(table) { return query(table); },
};
globalThis.window = { supabase: { createClient: () => client }, addEventListener() {}, dispatchEvent() {} };
globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init && init.detail; } };

const { auth } = await import('../app/auth.js');
const { records } = await import('../app/records.js');
const { store } = await import('../app/store.js');
const { liveBoard, panelHtml, TOP } = await import('../app/leaderboard-page.js');
const { dailyFor } = await import('../app/daily.js');
const { dayOf } = await import('../app/records.js');
const { BOARD_MIN_FIELD } = await import('../app/rank.js');
const tick = () => new Promise(r => setTimeout(r, 5));

const row = (pos, handle, secs, tier = 'pass') => ({ pos, handle, level: 2, secs, keys: 20, tier, at: '2026-09-20T10:00:00Z' });
const count = (s, re) => (s.match(re) || []).length;

// one clean local run on edge-jumps, so every state has "your times" to keep
records.addAttempt({ id: '30000000-0000-4000-8000-000000000001', kind: 'drill', ref: 'edge-jumps', secs: 7.25, keys: 11, clean: true, tier: 'pass', at: Date.now() });

test('signed out: the page stays local, says the field opens on sign-in, never calls rpc_board', async () => {
  await auth.ready();
  assert.equal(auth.state(), 'out');
  assert.equal(store.liveBoards(), false);
  assert.equal(await store.globalBoard('edge-jumps'), null);
  assert.equal(server.calls.length, 0, 'no network read for a guest');
  const html = panelHtml('benchmark', { live: false });
  assert.match(html, /7\.25s/, 'your local clean time shows');
  assert.match(html, /The global field opens when you sign in/);
  assert.doesNotMatch(html, /Your times|Loading the board|Couldn/, 'no signed-in furniture for a guest');
  const daily = panelHtml('daily', { live: false });
  assert.match(daily, /No clean attempt yet today/);
});

test('signed in with rows: top rows, your row appended below them, local times beneath and not merged', async () => {
  server.session = { user: USER };
  server.authCb('SIGNED_IN', server.session);
  await tick();
  await store.hydrate();
  assert.equal(store.liveBoards(), true);
  const rows = [];
  for (let i = 1; i <= 14; i++) rows.push(row(i, 'player' + i, 5 + i / 10));
  rows.push(row(15, 'boardwalker', 7.1, 'none'));
  server.boards['edge-jumps|'] = rows;
  const g = await store.globalBoard('edge-jumps');
  assert.equal(g.rows.length, 15);
  assert.equal(g.me, 'boardwalker');
  assert.deepEqual(g.rows.filter(r => r.mine).map(r => r.pos), [15], 'your row is flagged by your handle');
  assert.equal(server.calls.at(-1).p_seed, null, 'the benchmark reads the all-time board');

  const html = liveBoard('Edge jumps', 'drill', g, [{ secs: 7.25, mid: 'pass' }], { optimalKeys: 9 });
  const field = html.split('Your times')[0];
  assert.equal(count(field, /class="row/g), TOP + 1, 'the top rows plus your own row');
  assert.match(field, /<span class="rk">15<\/span><span class="nm">boardwalker <span class="muted">\(you\)<\/span>/);
  assert.doesNotMatch(field, /player11|7\.25s/, 'nothing past the top except you; local times are not merged in');
  assert.match(html.split('Your times')[1], /7\.25s/, 'your device times sit beneath');
  assert.match(field, /pass · 20\/~9/, 'tier and keys against the reference route');

  // inside the top, your row is not repeated
  const inTop = { me: 'boardwalker', rows: [row(1, 'boardwalker', 4, 'pro'), row(2, 'player2', 5)].map(r => ({ ...r, mine: r.handle === 'boardwalker' })) };
  assert.equal(count(liveBoard('x', 'drill', inTop, []).split('Your times')[0], /class="row/g), 2);

  // the Daily reads its own seed's board
  server.calls.length = 0;
  const pick = dailyFor(dayOf());
  await store.globalBoard(pick.drillId, { seed: pick.seed });
  assert.equal(server.calls[0].p_ref, pick.drillId);
  assert.equal(server.calls[0].p_seed, pick.seed);

  // reads are cached briefly: tab switching does not refetch
  const n = server.calls.length;
  await store.globalBoard('edge-jumps');
  assert.equal(server.calls.length, n);
});

test('signed in, empty board: one line says so, no placeholder rows, no pace-setters', async () => {
  const g = await store.globalBoard('go-anywhere');
  assert.deepEqual(g.rows, []);
  const html = liveBoard('Go anywhere', 'drill', g, []);
  const field = html.split('Your times')[0];
  assert.equal(count(field, /class="row/g), 0, 'never a placeholder row');
  assert.equal(count(field, /class="empty/g), 1);
  assert.match(field, /No one is on this board yet/);
  assert.doesNotMatch(html, /pace|ghost|—/i);
  // rank stays hidden until a board has real depth: this page shows positions, never a tier pill
  assert.ok(BOARD_MIN_FIELD >= 20);
  assert.doesNotMatch(html, /tier-(mba|bronze|silver|gold)/);
});

test('load failure: "couldn\'t load the board", local rows kept, and the failure is not cached', async () => {
  server.fail = true;
  const g = await store.globalBoard('select-blocks');
  assert.equal(g, null);
  const html = liveBoard('Select blocks', 'drill', g, [{ secs: 7.25, mid: 'pass' }]);
  assert.match(html, /Couldn’t load the board\./);
  assert.match(html, /lb-retry/, 'with a way to try again');
  assert.match(html.split('Your times')[1], /7\.25s/, 'the local rows stay');
  server.fail = false;
  server.boards['select-blocks|'] = [row(1, 'player1', 3.3)];
  const again = await store.globalBoard('select-blocks');
  assert.equal(again.rows.length, 1, 'a retry reads again');
  // the whole signed-in panel: loading state for unread boards, failed for failed ones
  const panel = panelHtml('benchmark', { live: true, global: { 'edge-jumps': null } });
  assert.match(panel, /Couldn’t load the board/);
  assert.match(panel, /Loading the board/);
  assert.match(panel, /7\.25s/);
});
