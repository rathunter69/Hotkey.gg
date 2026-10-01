// app2/tests/leaderboard.test.js — Leaderboards (screenplay 3.0, Leaderboards; M104): the board
// model keeps the top ten, pins the learner's row under them with its move, carries the gap to
// first and the bar against the field, and never shows a tier mark; the side panel's last five
// runs and the line on where the time goes are pure over the attempts. The store side: signed out
// the page never calls rpc_board and the board holds the device's own clean runs; signed in it
// reads rpc_board, caches briefly and does not cache a failure. In-memory fake of the Supabase
// project; no network.
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
  session: null, authCb: null, boards: {}, fail: false, calls: [],
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
  const q = { select() { return q; }, order() { return q; }, limit() { return q; }, single() { return q; }, eq() { return q; },
    then(res, rej) { return Promise.resolve(table === 'profiles' ? { data: server.profile, error: null } : { data: [], error: null }).then(res, rej); } };
  return q;
}
const client = {
  auth: { onAuthStateChange(cb) { server.authCb = cb; return { data: { subscription: { unsubscribe() {} } } }; }, async getSession() { return { data: { session: server.session } }; }, async refreshSession() { return { data: { session: server.session }, error: null }; }, async signOut() { return { error: null }; } },
  async rpc(name, args) { return server.rpc(name, args); },
  from(table) { return query(table); },
};
globalThis.window = { supabase: { createClient: () => client }, addEventListener() {}, dispatchEvent() {} };
globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init && init.detail; } };

const { auth } = await import('../app/auth.js');
const { records } = await import('../app/records.js');
const { store } = await import('../app/store.js');
const { boardModel, boardTableHtml, lastRuns, whereTimeGoes, localRows, defaultRef, TOP, BOARD_TABS } = await import('../app/leaderboard-page.js');
const { dailyFor } = await import('../app/daily.js');
const { dayOf } = await import('../app/records.js');
const { COPY } = await import('../content/copy/index.js');
const { tells } = await import('../content/copy/tells.js');
const tick = () => new Promise(r => setTimeout(r, 5));

const row = (pos, handle, secs, keys = 20) => ({ pos, handle, level: 2, secs, keys, tier: 'pass', at: '2026-09-20T10:00:00Z' });

// one clean local run on get-around, so the signed-out board has a row
records.addAttempt({ id: '30000000-0000-4000-8000-000000000001', kind: 'drill', ref: 'get-around', secs: 7.25, keys: 11, clean: true, tier: 'pass', splits: [1, 4, 2.25], at: Date.now() });

test('boardModel: the top ten, your row pinned under them with its move, the gap to first and the bar against the field', () => {
  const rows = [];
  for (let i = 1; i <= 14; i++) rows.push(row(i, 'player' + i, 60 + i));
  rows.push({ ...row(31, 'wolf', 88.4, 61), mine: true });
  const m = boardModel(rows, { prevPlace: 40 });
  assert.equal(m.rows.length, TOP + 1, 'ten plus the pinned row');
  assert.equal(m.rows[10].handle, 'wolf'); assert.equal(m.rows[10].pinned, true); assert.equal(m.rows[10].place, 31);
  assert.equal(m.move, 9, 'up 9 from 40th');
  assert.equal(m.first, 61);
  assert.equal(Math.round(m.rows[1].gap * 10) / 10, 1, 'the gap to first');
  assert.equal(m.rows[10].pct, 100, 'the slowest row shown fills the bar');
  assert.ok(m.rows[0].pct < m.rows[1].pct && m.rows[0].pct > 0);
  assert.equal(m.count, 15);
  // inside the top ten your row is not repeated and has no move without a previous place
  const inTop = boardModel([{ ...row(1, 'wolf', 50), mine: true }, row(2, 'p2', 55)]);
  assert.equal(inTop.rows.length, 2); assert.equal(inTop.move, null); assert.equal(inTop.mine.place, 1);
  assert.deepEqual(boardModel([]).rows, []);
});

test('the board table: Place, Player with the level, the bar, Time, Gap, Keys with the route in the header; no tier marks', () => {
  const html = boardTableHtml(boardModel([row(1, 'marta', 61.2, 38), { ...row(31, 'wolf', 88.4, 61), mine: true }], { prevPlace: 40 }), { routeKeys: 38 });
  assert.match(html, /Keys \(38 on the route\)/);
  assert.match(html, /1:01\.2/); assert.match(html, /\+27\.2/); assert.match(html, /L2/);
  assert.match(html, /up 9/);
  assert.doesNotMatch(html, /class="tiers/, 'tier marks stay off the boards');
  assert.match(html, /row-board mine/);
});

test('the side panel reads the attempts: the last five runs newest first, and the goal the time goes on', () => {
  const at = [{ clean: true, secs: 70, keys: 40, at: 1, day: '2026-09-25', splits: [10, 30, 30] }, { clean: true, secs: 65, keys: 39, at: 5, day: '2026-09-29', splits: [10, 35, 20] }, { clean: false, secs: 50, keys: 10, at: 9 }];
  for (let i = 0; i < 6; i++) at.push({ clean: true, secs: 60 + i, keys: 30, at: 100 + i, day: '2026-09-30', splits: [5, 40, 15] });
  const runs = lastRuns(at);
  assert.equal(runs.length, 5); assert.equal(runs[0].at, 105); assert.ok(runs.every(r => r.keys >= 30), 'helped runs are left out');
  const w = whereTimeGoes(at.filter(a => a.clean));
  assert.equal(w.index, 1); assert.ok(w.secs >= 35 && w.secs <= 40);
  assert.equal(whereTimeGoes([]), null);
});

test('the tabs, the default board and the copy', () => {
  assert.deepEqual(BOARD_TABS.map(b => b.key), ['daily', 'drills', 'challenges', 'desks']);
  assert.deepEqual(BOARD_TABS.map(b => b.mode), ['daily', 'drills', 'challenges', '']);
  const entries = [{ id: 'a', title: 'A' }, { id: 'b', title: 'B', tags: ['benchmark'] }];
  assert.equal(defaultRef(entries, []), 'b', 'the benchmark when nothing was played');
  assert.equal(defaultRef(entries, [{ ref: 'a', clean: true, at: 2 }]), 'a', 'the latest clean run');
  for (const k of ['col_place', 'col_player', 'col_field', 'col_time', 'col_gap', 'boards_keys_route', 'boards_up', 'boards_down', 'boards_empty', 'boards_yours', 'boards_where', 'boards_signed_out', 'boards_desks_signed_out']) {
    assert.ok(k in COPY.site, k); assert.deepEqual(tells(COPY.site[k]), [], k);
  }
});

test('signed out: the board is the device\'s own clean runs and rpc_board is never called', async () => {
  await auth.ready();
  assert.equal(auth.state(), 'out');
  assert.equal(store.liveBoards(), false);
  assert.equal(await store.globalBoard('get-around'), null);
  assert.equal(server.calls.length, 0, 'no network read for a guest');
  const rows = localRows('get-around');
  assert.equal(rows.length, 1); assert.equal(rows[0].secs, 7.25); assert.equal(rows[0].mine, true); assert.equal(rows[0].handle, 'you');
});

test('signed in: the field comes from rpc_board with your row flagged, the Daily reads its seed, reads are cached briefly', async () => {
  server.session = { user: USER };
  server.authCb('SIGNED_IN', server.session);
  await tick();
  await store.hydrate();
  assert.equal(store.liveBoards(), true);
  const rows = [];
  for (let i = 1; i <= 14; i++) rows.push(row(i, 'player' + i, 5 + i / 10));
  rows.push(row(15, 'boardwalker', 7.1));
  server.boards['get-around|'] = rows;
  const g = await store.globalBoard('get-around');
  assert.equal(g.rows.length, 15);
  assert.deepEqual(g.rows.filter(r => r.mine).map(r => r.pos), [15], 'your row is flagged by your handle');
  assert.equal(server.calls.at(-1).p_seed, null, 'a drill reads the all-time board');
  const m = boardModel(g.rows);
  assert.equal(m.rows.length, TOP + 1); assert.equal(m.rows[10].handle, 'boardwalker');
  server.calls.length = 0;
  const pick = dailyFor(dayOf());
  await store.globalBoard(pick.drillId, { seed: pick.seed });
  assert.equal(server.calls[0].p_ref, pick.drillId); assert.equal(server.calls[0].p_seed, pick.seed);
  const n = server.calls.length;
  await store.globalBoard('get-around');
  assert.equal(server.calls.length, n, 'tab switching does not refetch');
});

test('an empty board and a failed read: nothing is padded, and the failure is not cached', async () => {
  const g = await store.globalBoard('enter-and-fill');
  assert.deepEqual(g.rows, []);
  assert.deepEqual(boardModel(g.rows).rows, []);
  server.fail = true;
  assert.equal(await store.globalBoard('find-and-fix'), null);
  server.fail = false;
  server.boards['find-and-fix|'] = [row(1, 'player1', 3.3)];
  const again = await store.globalBoard('find-and-fix');
  assert.equal(again.rows.length, 1, 'a retry reads again');
});
