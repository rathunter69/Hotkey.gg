/* RUN-OUTBOX UNIT TEST (r452, contract audit P1-3). No browser: lifts the outbox block out of
   index.html verbatim (const HK_OUTBOX_KEY … end of flushRunOutbox) and drives it in a vm with a
   fake localStorage and a fake supabase client, so the drop/keep decision is testable without the
   whole app.

   The bug this guards: supabase-js RETURNS a Postgres exception as `error` instead of throwing, and
   the old drop test matched only /duplicate|conflict|unique/. runs_guard raises RUN_REJECTED for a
   physically impossible run, so that row could never insert — yet it was re-tried on every flush
   forever and consumed one of the 15 slots in the flush budget each time. Fifteen such rows and no
   real score ever posted again on that device.

   Run: node dev/check-outbox.js */
'use strict';
const fs = require('fs');
const vm = require('vm');
let fail = 0;
const bad = m => { fail++; console.error('FAIL ' + m); };
const ok = m => console.log('  ok  ' + m);

const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf("const HK_OUTBOX_KEY=");
const end = html.indexOf('async function recordRun(', start);
if (start < 0 || end < 0) { console.error('FAIL could not locate the outbox block in index.html'); process.exit(1); }
const SRC = html.slice(start, end);
if (!/flushRunOutbox/.test(SRC)) { console.error('FAIL the extracted block does not contain flushRunOutbox'); process.exit(1); }

const USER = 'user-1';
// One harness run: seed the outbox, answer every insert with `reply`, return the surviving rows.
async function run(seed, reply) {
  const store = { hk_run_outbox: JSON.stringify(seed) };
  const attempts = [];
  const events = [];
  const sandbox = {
    console,
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; },
    },
    me_user: { id: USER },
    isAnonUser: () => false,
    ev: (n, m) => events.push([n, m]),
    sb: {
      from: () => ({
        insert: async row => { attempts.push(row); return reply(row, attempts.length); },
      }),
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(SRC + '\n;globalThis.__flush = flushRunOutbox;', sandbox);
  await sandbox.__flush();
  return { left: JSON.parse(store.hk_run_outbox || '[]'), attempts, events };
}
const row = (n, over) => Object.assign({ user_id: USER, challenge: 'navigation', time_ms: 1000 + n, keystrokes: 20, optimal: 18, mouse_used: false }, over || {});
const OKAY = () => ({ error: null });
const ERR = m => () => ({ error: { message: m } });

(async () => {
  // 1. a clean insert drops the row (the pre-existing behavior must survive)
  let r = await run([row(1), row(2)], OKAY);
  if (r.left.length) bad('posted rows were not removed from the outbox'); else ok('posted rows are removed');

  // 2. THE FIX: a guard rejection is terminal — the row goes, and an event says why
  r = await run([row(3)], ERR('RUN_REJECTED'));
  if (r.left.length) bad('RUN_REJECTED row was KEPT — the wedge bug is back (P1-3)');
  else if (!r.events.some(e => e[0] === 'outbox_drop' && e[1] && e[1].reason === 'rejected')) bad("RUN_REJECTED dropped without an ev('outbox_drop',{reason:'rejected'})");
  else ok("RUN_REJECTED → dropped, with an outbox_drop event");

  // 3. a rate limit is transient — the row stays, and its attempt count grows
  r = await run([row(4)], ERR('RATE_LIMITED'));
  if (r.left.length !== 1) bad('RATE_LIMITED row was dropped — a retryable run was lost');
  else if (r.left[0]._att !== 1) bad('RATE_LIMITED row kept but its attempt counter did not advance (_att=' + r.left[0]._att + ')');
  else ok('RATE_LIMITED → kept, attempt counted');

  // 4. so is a thrown network failure
  r = await run([row(5)], () => { throw new Error('Failed to fetch'); });
  if (r.left.length !== 1 || r.left[0]._att !== 1) bad('a thrown network error must keep the row and count one attempt');
  else ok('network throw → kept, attempt counted');

  // 5. but nothing is transient forever — a row at the try limit is dropped without an insert
  r = await run([row(6, { _att: 10 })], ERR('RATE_LIMITED'));
  if (r.left.length) bad('a row at the attempt limit was retried again — unbounded retry');
  else if (r.attempts.length) bad('a row at the attempt limit was still sent to the server');
  else ok('attempt limit reached → dropped, no insert');

  // 6. the bookkeeping field never reaches the runs table (there is no _att column)
  r = await run([row(7, { _att: 3 })], OKAY);
  if (!r.attempts.length || '_att' in r.attempts[0]) bad('_att leaked into the insert payload');
  else ok('_att is stripped before the insert');

  // 7. THE STARVATION HALF: 20 stalled rows + a fresh one. Newest-first means the new run is
  //    attempted in the same flush instead of queueing behind a full 15-row budget of old ones.
  const stalled = Array.from({ length: 20 }, (_, i) => row(100 + i, { _att: 2 }));
  const fresh = row(999);
  r = await run(stalled.concat([fresh]), (ins) => (ins.time_ms === fresh.time_ms ? { error: null } : { error: { message: 'RATE_LIMITED' } }));
  if (!r.attempts.some(a => a.time_ms === fresh.time_ms)) bad('the newest row never got an attempt — a stalled backlog still starves fresh runs');
  else if (r.left.some(x => x.time_ms === fresh.time_ms)) bad('the newest row posted but was not removed');
  else ok('newest-first: a fresh run posts even behind a 20-row stalled backlog');

  // 8. a row enqueued mid-flush survives (the r416 property this change must not break)
  const store = { hk_run_outbox: JSON.stringify([row(8)]) };
  const late = row(9);
  const sandbox = {
    console,
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; },
    },
    me_user: { id: USER }, isAnonUser: () => false, ev: () => {},
    sb: { from: () => ({ insert: async () => { const a = JSON.parse(store.hk_run_outbox); a.push(late); store.hk_run_outbox = JSON.stringify(a); return { error: null }; } }) },
  };
  vm.createContext(sandbox);
  vm.runInContext(SRC + '\n;globalThis.__flush = flushRunOutbox;', sandbox);
  await sandbox.__flush();
  const left = JSON.parse(store.hk_run_outbox || '[]');
  if (left.length !== 1 || left[0].time_ms !== late.time_ms) bad('a run enqueued during the flush was lost (r416 regression)');
  else ok('a run enqueued mid-flush survives');

  // 9. a foreign-user row is still dropped (r418)
  r = await run([row(10, { user_id: 'someone-else' })], OKAY);
  if (r.left.length || r.attempts.length) bad('a foreign-user row must be dropped without an insert (r418)');
  else ok('foreign-user row → dropped, no insert');

  if (fail) { console.error(`\nRUN OUTBOX: ${fail} problem(s)`); process.exit(1); }
  console.log('RUN OUTBOX: clean');
})();
