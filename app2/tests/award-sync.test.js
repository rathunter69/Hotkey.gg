// app2/tests/award-sync.test.js — the account mirror of quest XP, the clean-lesson bonus and the
// key states (0012): what a settled run queues, the queue's owner, and the drain's outcomes.
// Stubs localStorage and the auth singleton, so it runs in its own process (run-checks OWN_PROCESS).
import { test } from 'node:test';
import assert from 'node:assert/strict';

const mem = new Map();
globalThis.localStorage = { getItem: k => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: k => mem.delete(k) };

const { auth } = await import('../app/auth.js');
const { awardSync, questAwards, ownedQueue, awardItem, AWARD_OUTBOX_KEY, MAX_TRIES, flush } = await import('../app/award-sync.js');

/** A signed-in account with a fake client whose rpc answers from `answer(name, args)`. */
function signIn(id, answer) {
  const calls = [];
  const sb = { rpc: async (name, args) => { calls.push([name, args]); return answer(name, args); } };
  auth.state = () => 'in'; auth.user = () => ({ id }); auth.client = () => sb; auth.token = () => ({ id, generation: 1 }); auth.current = () => true;
  return calls;
}

test('questAwards: each ticked quest under its period key, then the bonus, with the kinds the server knows', () => {
  const settled = {
    board: { daily: { key: 'd2026-10-02' }, weekly: { key: 'w2026-09-28' } },
    ticked: [{ id: 'd-drill', period: 'daily' }, { id: 'w-drills-5', period: 'weekly' }],
    bonus: [{ period: 'daily', xp: 50 }],
  };
  assert.deepEqual(questAwards(settled, 7).map(a => [a.kind, a.ref]), [
    ['quest-daily', 'd2026-10-02:d-drill'], ['quest-weekly', 'w2026-09-28:w-drills-5'], ['bonus-daily', 'd2026-10-02']]);
  assert.deepEqual(questAwards(null), []);
  assert.deepEqual(questAwards({ board: {}, ticked: [{ id: 'x', period: 'daily' }] }), [], 'no period, no award');
});

test('the queue belongs to one account: another uid\'s items are never read', () => {
  assert.deepEqual(ownedQueue({ uid: 'a', items: [1] }, 'a'), [1]);
  assert.deepEqual(ownedQueue({ uid: 'a', items: [1] }, 'b'), []);
  assert.deepEqual(ownedQueue(null, 'a'), []);
});

test('a guest queues nothing', () => {
  mem.clear();
  auth.state = () => 'out'; auth.user = () => null;
  awardSync.cleanLesson('active-cell');
  assert.equal(mem.get(AWARD_OUTBOX_KEY), undefined);
});

test('signed in: awards drain in order, a retry of the same award is not queued twice, final answers leave the queue', async () => {
  mem.clear();
  const calls = signIn('u1', name => ({ data: name === 'rpc_record_xp_award' ? 'awarded' : 1, error: null }));
  awardSync.quests({ board: { daily: { key: 'd2026-10-02' } }, ticked: [{ id: 'd-drill', period: 'daily' }], bonus: [] });
  awardSync.quests({ board: { daily: { key: 'd2026-10-02' } }, ticked: [{ id: 'd-drill', period: 'daily' }], bonus: [] });
  awardSync.cleanLesson('active-cell');
  assert.equal(awardSync.pending().length, 2, 'the same quest twice queues once');
  await flush();
  assert.deepEqual(calls.map(c => [c[0], c[1].p_kind, c[1].p_ref]), [['rpc_record_xp_award', 'quest-daily', 'd2026-10-02:d-drill'], ['rpc_record_xp_award', 'lesson-clean', 'active-cell']]);
  assert.equal(awardSync.pending().length, 0, 'sent');
  assert.ok(calls.every(c => !('p_xp' in c[1]) && !('xp' in c[1])), 'the client never names an amount');
});

test('a pending clean-lesson award waits for the lesson to reach the server, then gives up after MAX_TRIES', async () => {
  mem.clear();
  let n = 0;
  signIn('u2', () => { n++; return { data: 'pending', error: null }; });
  awardSync.cleanLesson('fix-it-in-place');
  await flush();
  assert.equal(awardSync.pending().length, 1, 'still queued');
  assert.equal(awardSync.pending()[0].tries, 1);
  for (let i = 0; i < MAX_TRIES; i++) await flush();
  assert.equal(awardSync.pending().length, 0, 'dropped after its tries');
  assert.equal(n, MAX_TRIES);
});

test('a network failure keeps the item; a malformed one leaves', async () => {
  mem.clear();
  signIn('u3', () => ({ data: null, error: { message: 'fetch failed' } }));
  mem.set(AWARD_OUTBOX_KEY, JSON.stringify({ uid: 'u3', items: [awardItem('lesson-clean', 'a')] }));
  await flush();
  assert.equal(awardSync.pending().length, 1, 'kept for a retry');
  signIn('u3', () => ({ data: null, error: { message: 'bad award' } }));
  await flush();
  assert.equal(awardSync.pending().length, 0, 'a bad award cannot be fixed by retrying');
});

test('key states queue to rpc_note_keys once the mirror is started', async () => {
  mem.clear();
  const calls = signIn('u4', name => ({ data: name === 'rpc_my_keys' ? { 'ctrl-1': { p: 5 } } : 1, error: null }));
  const { startAwardSync } = await import('../app/award-sync.js');
  const { keyStates } = await import('../app/key-states.js');
  startAwardSync();
  await new Promise(r => setTimeout(r, 5));
  assert.equal(keyStates.records()['ctrl-1'].p, 5, 'sign-in folds the account\'s keys in');
  keyStates.notePressed(['Ctrl+B']);
  keyStates.noteUnderPar(['ctrl-arrow']);
  await new Promise(r => setTimeout(r, 5));
  await flush();
  const notes = calls.filter(c => c[0] === 'rpc_note_keys').map(c => [c[1].p_ids, c[1].p_under_par]);
  assert.deepEqual(notes, [[['ctrl-b'], false], [['ctrl-arrow'], true]]);
});
