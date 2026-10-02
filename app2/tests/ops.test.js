// app2/tests/ops.test.js — the ops functions' logic (REBUILD_PLAN section 6) through fake adapters:
// who may read the weekly digest, what it says, that it never mails, and what the health check
// answers when the database is up, down or slow. Plus the uptime workflow's shape: scheduled,
// never on a pull request, and loud when it fails. Nothing here reaches the network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { weeklyDigest, healthCheck, renderDigest, safeEqual, bearerOf, delta } from '../supabase/functions/_shared/ops.js';

const app2 = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(app2, '..');
const NOW = Date.parse('2026-10-05T07:00:00Z');

const REPORT = {
  period_start: '2026-09-28T00:00:00Z', period_end: '2026-10-05T00:00:00Z', days: 7,
  signups: { accounts: 12, accounts_prev: 9, accounts_total: 140 },
  lessons: { first_completions: 80, first_completions_prev: 80, runs: 300, learners: 40, completion_events: 210, top: [{ lesson_id: 'active-cell', n: 30 }] },
  funnel: { landing_view: 900, lesson_start: 400, signup: 12 },
  errors: { count: 7, count_prev: 11, sessions: 3, top: [{ message: 'TypeError: x is undefined', n: 5, sessions: 2 }] },
  billing: { alerts_new: 1, alerts_open: 2, checkout_grants: 4, alerts: [{ id: 1, kind: 'team_subscription_ended', ref: 'sub_T', created_at: '2026-10-01T10:00:00Z', resolved: false }] },
};

function fakes({ admin = false, healthy = true, slow = false, throws = false } = {}) {
  const calls = [];
  return {
    calls,
    deps: {
      env: { serviceKey: 'service-key-123', version: '0015' },
      now: () => NOW,
      timeoutMs: 20,
      db: {
        build: async days => { calls.push(['build', days]); return REPORT; },
        store: async () => { calls.push(['store']); return { period_end: REPORT.period_end, report: REPORT }; },
        isOpsAdmin: async jwt => { calls.push(['isOpsAdmin', jwt]); return admin; },
        health: () => { calls.push(['health']); if (throws) return Promise.reject(new Error('db down')); if (slow) return new Promise(() => {}); return Promise.resolve(healthy ? { db: 'ok', at: 'x', last_event_at: '2026-10-05T06:59:00Z' } : { db: 'no' }); },
      },
    },
  };
}

test('safeEqual and bearerOf', () => {
  assert.equal(safeEqual('abc', 'abc'), true);
  assert.equal(safeEqual('abc', 'abd'), false);
  assert.equal(safeEqual('abc', 'abcd'), false);
  assert.equal(safeEqual('', ''), false, 'an empty secret never matches');
  assert.equal(safeEqual(undefined, undefined), false);
  assert.equal(bearerOf('Bearer tok'), 'tok');
  assert.equal(bearerOf('Basic tok'), '');
  assert.equal(bearerOf(null), '');
});

test('weekly digest: no token, a stranger, a member and the service role', async () => {
  let f = fakes();
  assert.equal((await weeklyDigest({ method: 'GET', authorization: '' }, f.deps)).status, 401);
  assert.equal((await weeklyDigest({ method: 'GET', authorization: 'Bearer someone' }, f.deps)).status, 403, 'a signed-in stranger is refused');
  assert.equal(f.calls.filter(c => c[0] === 'build').length, 0, 'and nothing was read');
  assert.equal((await weeklyDigest({ method: 'DELETE', authorization: 'Bearer service-key-123' }, f.deps)).status, 405);
  f = fakes({ admin: true });
  const got = await weeklyDigest({ method: 'GET', authorization: 'Bearer member-jwt', days: '14' }, f.deps);
  assert.equal(got.status, 200);
  assert.equal(got.body.stored, false);
  assert.deepEqual(f.calls.at(-1), ['build', 14]);
  assert.match(got.body.text, /New accounts: 12 \(\+3 on the week before\); 140 in all/);
  f = fakes();
  const svc = await weeklyDigest({ method: 'GET', authorization: 'Bearer service-key-123', days: '999' }, f.deps);
  assert.equal(svc.status, 200, 'the service role reads it');
  assert.equal(f.calls.some(c => c[0] === 'isOpsAdmin'), false, 'without asking the database who it is');
  assert.deepEqual(f.calls.at(-1), ['build', 90], 'the window is capped at 90 days');
  const stored = await weeklyDigest({ method: 'POST', authorization: 'Bearer service-key-123' }, f.deps);
  assert.equal(stored.body.stored, true);
  assert.deepEqual(f.calls.at(-1), ['store']);
});

test('weekly digest: an admin check that throws is a refusal, not a leak', async () => {
  const f = fakes();
  f.deps.db.isOpsAdmin = async () => { throw new Error('network'); };
  assert.equal((await weeklyDigest({ method: 'GET', authorization: 'Bearer x' }, f.deps)).status, 403);
});

test('the digest text covers sign-ups, lessons, errors and billing', () => {
  const t = renderDigest(REPORT);
  assert.match(t, /^hotkey\.gg weekly digest, 2026-09-28 to 2026-10-05/);
  for (const head of ['Sign-ups', 'Lessons', 'Funnel', 'Errors', 'Billing']) assert.match(t, new RegExp('^' + head + '$', 'm'), head);
  assert.match(t, /First completions: 80 \(same as the week before\)/);
  assert.match(t, /7 reports from 3 sessions \(-4 on the week before\)/);
  assert.match(t, /5x TypeError: x is undefined/);
  assert.match(t, /Alerts this week: 1; open in all: 2/);
  assert.match(t, /2026-10-01 team_subscription_ended sub_T/);
  assert.equal(renderDigest(null), '');
  assert.doesNotThrow(() => renderDigest({}));
  assert.equal(delta(3, 3), 'same as the week before');
});

test('health: up, down, throwing and slow', async () => {
  let out = await healthCheck(fakes().deps);
  assert.equal(out.status, 200);
  assert.equal(out.body.ok, true);
  assert.equal(out.body.db, 'ok');
  assert.equal(out.body.service, 'hotkey.gg');
  out = await healthCheck(fakes({ healthy: false }).deps);
  assert.equal(out.status, 503);
  out = await healthCheck(fakes({ throws: true }).deps);
  assert.deepEqual([out.status, out.body.db], [503, 'down']);
  out = await healthCheck(fakes({ slow: true }).deps);
  assert.deepEqual([out.status, out.body.db], [503, 'timeout']);
});

test('no ops code sends mail', () => {
  const dir = join(app2, 'supabase', 'functions');
  const files = ['_shared/ops.js', '_shared/ops-adapters.ts', 'weekly-digest/index.ts', 'health/index.ts'];
  for (const f of files) {
    const src = readFileSync(join(dir, f), 'utf8').replace(/^\s*\/\/.*$/gm, '');
    assert.doesNotMatch(src, /resend|sendgrid|postmark|mailgun|nodemailer|smtp|sendEmail|send_email/i, f + ' sends no email');
  }
  assert.ok(readdirSync(dir).includes('weekly-digest') && readdirSync(dir).includes('health'));
});

test('the uptime workflow: scheduled, not on pull requests, loud on failure', () => {
  const y = readFileSync(join(root, '.github', 'workflows', 'uptime.yml'), 'utf8');
  assert.match(y, /schedule:\s*\n\s*- cron:/, 'it runs on a schedule');
  assert.match(y, /workflow_dispatch/, 'and on demand');
  assert.doesNotMatch(y, /^\s*(pull_request|push):/m, 'never on a pull request or a push, so it can never block one');
  assert.match(y, /https:\/\/hotkey\.gg\//, 'it pings the site');
  assert.match(y, /health\.json/, 'and the static health file');
  assert.match(y, /HEALTH_URL/, 'and the health function once its address is set');
  assert.match(y, /::error/, 'a failure is an error annotation');
  assert.match(y, /exit 1/, 'and a failed run');
  assert.match(y, /gh issue (create|comment)/, 'and an issue Wolf is notified of');
  const health = JSON.parse(readFileSync(join(app2, 'health.json'), 'utf8'));
  assert.equal(health.ok, true);
});
