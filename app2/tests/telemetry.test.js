// app2/tests/telemetry.test.js — telemetry never throws, dedupes, and the client's event names
// match the SQL check in 0003_events.sql (read from the migration file, so they cannot drift).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { track, installErrorLog, makeDedupe, sessionKey, EVENTS, EVENT_NAME_RE } from '../app/telemetry.js';

const app2 = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('track and installErrorLog are no-ops without a client and never throw', () => {
  assert.doesNotThrow(() => track('lesson_start', { lesson_id: 'x', mode: 'guided' }));
  assert.doesNotThrow(() => track('BAD NAME!'));
  assert.doesNotThrow(() => track(null));
  assert.doesNotThrow(() => installErrorLog());
  assert.equal(sessionKey(), null, 'no sessionStorage in Node: null, not a throw');
});

test('error dedupe: identical messages once per page load, capped', () => {
  const fresh = makeDedupe(3);
  assert.equal(fresh('boom'), true);
  assert.equal(fresh('boom'), false, 'identical message deduped');
  assert.equal(fresh('other'), true);
  assert.equal(fresh('third'), true);
  assert.equal(fresh('fourth'), false, 'cap reached');
  assert.equal(fresh(null), false, 'null coalesces with itself eventually');
});

test('the client event names satisfy the SQL check in 0003_events.sql', () => {
  const sql = readFileSync(join(app2, 'supabase', 'migrations', '0003_events.sql'), 'utf8');
  const m = sql.match(/name text not null check \(name ~ '([^']+)'\)/);
  assert.ok(m, 'the events.name check regex is in the migration');
  const sqlRe = new RegExp(m[1]);
  assert.deepEqual(EVENTS, ['landing_view', 'lesson_start', 'lesson_complete', 'signup', 'sign_in', 'carry_over']);
  for (const name of EVENTS) {
    assert.match(name, sqlRe, `${name} passes the SQL check`);
    assert.match(name, EVENT_NAME_RE, `${name} passes the client check`);
  }
  assert.equal(EVENT_NAME_RE.source.replace(/\\/g, ''), m[1].replace(/\\/g, ''), 'client and SQL regexes agree');
});
