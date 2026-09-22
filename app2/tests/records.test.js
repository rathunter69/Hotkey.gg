// app2/tests/records.test.js — the guest records store (Phase D): corrupt storage reads empty,
// a helped or mouse attempt never becomes a PB, a faster clean run replaces PB and trace, and
// the trace helper drops warm-up keys pressed before the clock.
import { test } from 'node:test';
import assert from 'node:assert/strict';

function memStorage() {
  const m = {};
  return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; }, _m: m };
}

const att = (over = {}) => ({
  id: over.id || 'id-' + Math.random().toString(36).slice(2),
  kind: 'drill', ref: 'edge-jumps', day: '2026-09-22', seed: null,
  secs: 10, keys: 8, clean: true, helped: false, mouse: 0, tier: 'pro',
  splits: [2, 3, 5], trace: [{ k: 'Ctrl+↓', t: 0, cell: 'A1' }, { k: 'Ctrl+→', t: 900, cell: 'A6' }],
  at: 1758500000000, ...over,
});

test('records: corrupt storage reads empty; add/pb/trace/attempts round-trip; caps hold', async () => {
  globalThis.localStorage = memStorage();
  try {
    const { records, cleanAttempt, traceOf, dayOf, attemptId } = await import('../app/records.js');
    for (const raw of ['{', 'null', '[]', '"x"', '{"attempts":"no"}', '{"attempts":[{"id":1}],"pbs":[],"traces":7}']) {
      localStorage.setItem('hk2_records_v1', raw);
      assert.deepEqual(records.attempts(), [], `${raw}: attempts empty`);
      assert.deepEqual(records.pbs(), {}, `${raw}: pbs empty`);
      assert.deepEqual(records.trace('x'), [], `${raw}: trace empty`);
    }
    records.clear();

    // a clean attempt lands, becomes the PB and carries its trace to the ghost slot
    assert.ok(records.addAttempt(att({ id: 'a1', secs: 12 })));
    assert.equal(records.pb('edge-jumps').secs, 12);
    assert.equal(records.pb('edge-jumps').attemptId, 'a1');
    assert.equal(records.trace('edge-jumps').length, 2);
    assert.equal(records.attempts({ ref: 'edge-jumps' }).length, 1);
    assert.equal(records.attempts({ ref: 'edge-jumps' })[0].trace.length, 0, 'the attempt row itself does not duplicate the trace');

    // helped or mouse: recorded, never a PB
    records.addAttempt(att({ id: 'a2', secs: 5, clean: false, helped: true }));
    records.addAttempt(att({ id: 'a3', secs: 4, clean: false, mouse: 3 }));
    assert.equal(records.pb('edge-jumps').secs, 12, 'assisted and moused runs never take the PB');
    assert.equal(records.attempts({ ref: 'edge-jumps' }).length, 3);

    // a slower clean run keeps the PB; a faster one replaces PB and trace
    records.addAttempt(att({ id: 'a4', secs: 20 }));
    assert.equal(records.pb('edge-jumps').secs, 12);
    records.addAttempt(att({ id: 'a5', secs: 9.5, trace: [{ k: 'Ctrl+Home', t: 0, cell: 'A1' }] }));
    assert.equal(records.pb('edge-jumps').secs, 9.5);
    assert.equal(records.pb('edge-jumps').attemptId, 'a5');
    assert.deepEqual(records.trace('edge-jumps').map(e => e.k), ['Ctrl+Home'], 'the ghost is the new PB run');

    // filters
    records.addAttempt(att({ id: 'a6', ref: 'select-blocks', day: '2026-09-21', kind: 'daily' }));
    assert.equal(records.attempts({ day: '2026-09-21' }).length, 1);
    assert.equal(records.attempts({ kind: 'daily' }).length, 1);

    // shape guards
    assert.equal(records.addAttempt(null), false);
    assert.equal(records.addAttempt({ id: 'x' }), false, 'kind/ref required');
    assert.equal(cleanAttempt(att({ tier: 'gold' })).tier, 'none', 'unknown tier normalises');
    assert.equal(cleanAttempt(att({ secs: -3 })).secs, null, 'negative time drops');
    assert.equal(cleanAttempt(att({ trace: Array.from({ length: 900 }, (_, i) => ({ k: 'a', t: i })) })).trace.length, 600, 'trace capped');

    // helpers
    assert.match(dayOf(1758500000000), /^\d{4}-\d{2}-\d{2}$/);
    assert.notEqual(attemptId(), attemptId());
    assert.deepEqual(traceOf([{ k: 'Alt', t: 0 }, { k: 'H', t: 0 }, { k: 'Ctrl+↓', t: 0, cell: 'A1' }, { k: '↵', t: 400, cell: 'A6' }]).map(e => e.k),
      ['Ctrl+↓', '↵'], 'warm-up keys before the clock drop; the clock-starting key stays');
    assert.deepEqual(traceOf(null), []);

    // blocked storage cannot throw out of the API
    globalThis.localStorage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => { throw new Error('blocked'); } };
    assert.equal(records.addAttempt(att()), false);
    assert.deepEqual(records.pbs(), {});
    assert.doesNotThrow(() => records.clear());
  } finally { delete globalThis.localStorage; }
});
