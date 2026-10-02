// app2/tests/telemetry.test.js — telemetry never throws, dedupes, and the client's event names
// match the SQL check in 0003_events.sql (read from the migration file, so they cannot drift).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { track, installErrorLog, makeDedupe, sessionKey, EVENTS, EVENT_NAME_RE, scrubText, scrubUrl, errorReport, ignorable, makeLimiter } from '../app/telemetry.js';

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
  assert.deepEqual(EVENTS, ['landing_view', 'lesson_start', 'lesson_complete', 'lesson_timeup', 'signup', 'sign_in', 'carry_over', 'drill_complete', 'goal_complete', 'challenge_result', 'landing_demo', 'briefing_done', 'install_prompt', 'pricing_view', 'checkout_view', 'checkout_signin', 'checkout_start', 'checkout_unlocked', 'checkout_timeout', 'cancel_click', 'course_complete_email']);
  for (const name of EVENTS) {
    assert.match(name, sqlRe, `${name} passes the SQL check`);
    assert.match(name, EVENT_NAME_RE, `${name} passes the client check`);
  }
  assert.equal(EVENT_NAME_RE.source.replace(/\\/g, ''), m[1].replace(/\\/g, ''), 'client and SQL regexes agree');
});

// The error log's privacy rules: the same cases 15-ops.test.sql checks against ops_scrub / ops_scrub_url.
test('scrubText takes personal data out of a message', () => {
  assert.equal(scrubText('TypeError: x is undefined at app.js:12:5'), 'TypeError: x is undefined at app.js:12:5', 'an ordinary message is untouched');
  assert.equal(scrubText('no account for wolf.d+test@example.co.uk here'), 'no account for [email] here');
  assert.equal(scrubText('bad jwt eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abcDEF_123 end'), 'bad jwt [token] end');
  assert.equal(scrubText('fetch /x?token=abc123&lang=en failed'), 'fetch /x?token=[redacted]&lang=en failed');
  assert.equal(scrubText('card 4242 4242 4242 4242 declined'), 'card [number] declined');
  assert.equal(scrubText('key sk9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1 leaked'), 'key [token] leaked');
  assert.equal(scrubText(null), null);
});

test('scrubUrl drops the query and any hash that is not a route', () => {
  assert.equal(scrubUrl('https://hotkey.gg/?checkout_session=cs_123#/lesson/active-cell?mode=solo'), 'https://hotkey.gg/#/lesson/active-cell');
  assert.equal(scrubUrl('https://hotkey.gg/#access_token=eyJabc.def.ghi&refresh_token=zz'), 'https://hotkey.gg/', 'a magic-link return is dropped whole');
  assert.equal(scrubUrl('https://hotkey.gg/lessons/'), 'https://hotkey.gg/lessons/');
  assert.equal(scrubUrl(null), '');
});

test('errorReport carries no account and nothing personal', () => {
  const r = errorReport('https://hotkey.gg/?email=a@b.co#/account', 'Cannot sign in wolf@hotkey.gg', 'at x (https://hotkey.gg/app/auth.js:10:2)');
  assert.deepEqual(Object.keys(r).sort(), ['p_message', 'p_stack', 'p_url']);
  assert.equal(r.p_url, 'https://hotkey.gg/#/account');
  assert.equal(r.p_message, 'Cannot sign in [email]');
  assert.equal(errorReport('/x', 'm', null).p_stack, null);
  assert.ok(errorReport('/x', 'm'.repeat(5000)).p_message.length <= 2048);
});

test('ignorable: extension noise and cross-origin script errors are not ours', () => {
  assert.equal(ignorable('Script error.'), true);
  assert.equal(ignorable('ResizeObserver loop completed with undelivered notifications.'), true);
  assert.equal(ignorable('boom', 'at f (chrome-extension://abc/content.js:1:1)'), true);
  assert.equal(ignorable(''), true);
  assert.equal(ignorable('TypeError: x is undefined', 'at f (https://hotkey.gg/app/main.js:1:1)'), false);
});

test('makeLimiter: a burst, then one per interval, and a ceiling per page load', () => {
  let t = 0;
  const allow = makeLimiter({ burst: 3, everyMs: 1000, max: 5, now: () => t });
  assert.deepEqual([allow(), allow(), allow(), allow()], [true, true, true, false], 'three at once, the fourth waits');
  t += 1000; assert.equal(allow(), true, 'one more after the interval');
  t += 10000; assert.equal(allow(), true, 'the fifth');
  t += 10000; assert.equal(allow(), false, 'the ceiling holds however long the page stays open');
});
