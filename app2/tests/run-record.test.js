// app2/tests/run-record.test.js — M96: one record per timed run holds its time, keys, route count,
// goals with landing times, help and mouse flags, tier, layout and platform; pace reads it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRunRecord, fromRun, toAttempt, splitsOf, pace, RUN_KINDS, RUN_RECORD_VERSION, MAX_KEYS, MAX_GOALS } from '../app/run-record.js';
import { cleanAttempt } from '../app/records.js';

const keys = [{ k: 'Ctrl+Down', t: 0, cell: 'A1' }, { k: 'Ctrl+Right', t: 900, cell: 'A10' }, { k: 'Enter', t: 2100, cell: 'F10' }];
const goals = [{ id: 'total', at: 950 }, { id: 'edge', at: 2200 }];

test('makeRunRecord: every field of 3.0 lands, normalised; junk is refused', () => {
  const r = makeRunRecord({ id: 'r1', kind: 'drill', ref: 'get-around', day: '2026-10-01', seed: 7, secs: 2.2049, keys, goals, routeKeys: 46, tier: 'legendary', layout: 'uk', platform: 'mac', at: 5 });
  assert.equal(r.v, RUN_RECORD_VERSION);
  assert.deepEqual([r.id, r.kind, r.ref, r.day, r.seed, r.secs, r.keyCount, r.routeKeys, r.layout, r.platform, r.at], ['r1', 'drill', 'get-around', '2026-10-01', 7, 2.2, 3, 46, 'uk', 'mac', 5]);
  assert.deepEqual(r.goals, [{ id: 'total', at: 950, assisted: false }, { id: 'edge', at: 2200, assisted: false }]);
  assert.equal(r.keys.length, 3); assert.equal(r.clean, true); assert.equal(r.tier, 'legendary'); assert.equal(r.helped, false); assert.equal(r.mouse, 0);
  assert.equal(makeRunRecord({ kind: 'marathon', ref: 'x' }), null);
  assert.equal(makeRunRecord({ kind: 'drill' }), null);
  assert.equal(makeRunRecord(null), null);
  const d = makeRunRecord({ kind: 'daily', ref: 'x', layout: 'dvorak', platform: 'linux', day: 'yesterday', secs: -4 });
  assert.deepEqual([d.layout, d.platform, d.day, d.secs, d.keyCount, d.routeKeys], ['other', 'win', null, null, 0, null]);
  assert.ok(d.id && typeof d.id === 'string', 'an id is minted');
  for (const k of ['drill', 'daily', 'challenge', 'assessment', 'rapid', 'lesson-timed']) assert.ok(RUN_KINDS.includes(k), k);
});

test('help, the mouse or a time-out mean no tier; an assisted goal marks the run helped', () => {
  assert.equal(makeRunRecord({ kind: 'drill', ref: 'x', tier: 'pro', helped: true }).tier, 'none');
  assert.equal(makeRunRecord({ kind: 'drill', ref: 'x', tier: 'pro', mouse: 2 }).clean, false);
  assert.equal(makeRunRecord({ kind: 'drill', ref: 'x', tier: 'pro', timedOut: true }).tier, 'none');
  const r = makeRunRecord({ kind: 'drill', ref: 'x', tier: 'pro', goals: [{ id: 'a', at: 10, assisted: true }] });
  assert.equal(r.helped, true); assert.equal(r.clean, false); assert.equal(r.tier, 'none');
  assert.equal(makeRunRecord({ kind: 'drill', ref: 'x', tier: 'pro' }).tier, 'pro');
});

test('the caps hold: 600 keys, 60 goals', () => {
  const many = makeRunRecord({ kind: 'drill', ref: 'x', keys: Array.from({ length: 900 }, (_, i) => ({ k: 'a', t: i })), goals: Array.from({ length: 80 }, (_, i) => ({ id: 'g' + i, at: i })) });
  assert.equal(many.keys.length, MAX_KEYS); assert.equal(many.goals.length, MAX_GOALS); assert.equal(many.keyCount, 900, 'the count is the true count');
});

test('splits and the attempt shape the device store takes today', () => {
  const r = makeRunRecord({ id: 'r1', kind: 'drill', ref: 'get-around', secs: 2.2, keys, goals: [{ id: 'a', at: 950 }, { id: 'b', at: 2200 }, { id: 'c', at: null }], tier: 'pass', routeKeys: 46 });
  assert.deepEqual(splitsOf(r), [0.95, 1.25, null]);
  const a = toAttempt(r);
  assert.deepEqual(a.splits, [0.95, 1.25]); assert.equal(a.trace.length, 3); assert.equal(a.keys, 3); assert.equal(a.routeKeys, 46);
  const stored = cleanAttempt(a);
  assert.equal(stored.id, 'r1'); assert.equal(stored.tier, 'pass'); assert.equal(stored.keys, 3); assert.equal(stored.trace.length, 3, 'records.js keeps the attempt whole');
  assert.equal(toAttempt(makeRunRecord({ kind: 'assessment', ref: 'x' })).kind, 'challenge', 'an assessment records as a challenge until 0009 lands');
  assert.equal(toAttempt(null), null);
});

test('fromRun reads a finished run: the session clock, the key log, the landings', () => {
  const run = {
    drill: { id: 'get-around', optimalKeys: 46 }, goals: [{ id: 'total' }, { id: 'edge' }], landedAt: [1950, 3200],
    session: { t0: 1000, keyLog: [{ k: 'Ctrl+Down', t: 0, cell: 'A1' }, { k: 'Ctrl+Down', t: 0, cell: 'A1' }, { k: 'Ctrl+Right', t: 900, cell: 'A10' }] },
    elapsed: 2.2, helped: false, mouseCount: 0, tier: 'pro', timedOut: false,
  };
  const r = fromRun(run, { kind: 'drill', day: '2026-10-01', layout: 'us', platform: 'win', at: 1 });
  assert.deepEqual(r.goals.map(g => g.at), [950, 2200]);
  assert.equal(r.keys.length, 2, 'warm-up keys before the clock fall away, the clock-starting key stays');
  assert.equal(r.keyCount, 3); assert.equal(r.routeKeys, 46); assert.equal(r.tier, 'pro'); assert.equal(r.ref, 'get-around');
});

test('pace: the tier the run reaches at this rate', () => {
  const pars = { pass: 60, pro: 42, legendary: 33 };
  assert.deepEqual(pace(10, 0, 10, pars), { projected: null, tier: null }, 'unknown before the first goal');
  assert.deepEqual(pace(10, 5, 10, pars), { projected: 20, tier: 'legendary' });
  assert.deepEqual(pace(20, 5, 10, pars), { projected: 40, tier: 'pro' });
  assert.deepEqual(pace(28, 5, 10, pars), { projected: 56, tier: 'pass' });
  assert.deepEqual(pace(40, 5, 10, pars), { projected: 80, tier: 'none' });
  assert.deepEqual(pace(NaN, 5, 10, pars), { projected: null, tier: null });
});
