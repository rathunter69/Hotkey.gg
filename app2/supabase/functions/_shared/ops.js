// app2/supabase/functions/_shared/ops.js — the logic of the two ops functions (REBUILD_PLAN section 6),
// with every database call behind a small adapter passed in as `deps`. The Deno entry points
// (weekly-digest/, health/) wire the real adapter (ops-adapters.ts); app2/tests/ops.test.js wires
// fakes, so no test reaches the network. Neither function sends mail: the digest is returned, or
// stored in ops_digests for the ops page (#/ops), and nothing else.
//
//   deps.db:    build(days) → report jsonb, store() → ops_digests row, isOpsAdmin(jwt) → boolean, health() → jsonb
//   deps.env:   { serviceKey, version }
//   deps.now(): ms since the epoch (tests pin it)

/** How long the health check waits on the database before it reports down. */
export const HEALTH_TIMEOUT_MS = 4000;

/** Constant-time string compare (no early exit on the first differing character). Pure. */
export function safeEqual(a, b) {
  const x = String(a == null ? '' : a), y = String(b == null ? '' : b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  return diff === 0 && x.length > 0;
}

/** The bearer token of an Authorization header, or ''. Pure. */
export function bearerOf(header) {
  const h = String(header || '');
  return h.startsWith('Bearer ') ? h.slice(7).trim() : '';
}

const n = v => (Number.isFinite(Number(v)) ? Number(v) : 0);
const day = iso => (iso ? String(iso).slice(0, 10) : '?');
/** "+3" / "-2" / "same" against last week. Pure. */
export function delta(now, prev) {
  const d = n(now) - n(prev);
  return d === 0 ? 'same as the week before' : (d > 0 ? '+' : '') + d + ' on the week before';
}

/** The report as plain text, for a person reading it in a terminal or a pasted message. Pure. */
export function renderDigest(r) {
  if (!r || typeof r !== 'object') return '';
  const s = r.signups || {}, l = r.lessons || {}, e = r.errors || {}, b = r.billing || {}, f = r.funnel || {};
  const lines = [
    `hotkey.gg weekly digest, ${day(r.period_start)} to ${day(r.period_end)}`,
    '',
    'Sign-ups',
    `  New accounts: ${n(s.accounts)} (${delta(s.accounts, s.accounts_prev)}); ${n(s.accounts_total)} in all`,
    '',
    'Lessons',
    `  First completions: ${n(l.first_completions)} (${delta(l.first_completions, l.first_completions_prev)})`,
    `  Runs by signed-in learners: ${n(l.runs)} from ${n(l.learners)} learners`,
    `  Completions including guests: ${n(l.completion_events)}`,
  ];
  for (const t of l.top || []) lines.push(`    ${t.lesson_id}: ${n(t.n)}`);
  const steps = ['landing_view', 'lesson_start', 'lesson_complete', 'signup', 'pricing_view', 'checkout_start', 'checkout_unlocked'].filter(k => f[k] != null);
  if (steps.length) { lines.push('', 'Funnel'); for (const k of steps) lines.push(`  ${k}: ${n(f[k])}`); }
  lines.push('', 'Errors', `  ${n(e.count)} reports from ${n(e.sessions)} sessions (${delta(e.count, e.count_prev)})`);
  for (const t of e.top || []) lines.push(`    ${n(t.n)}x ${String(t.message || '').slice(0, 140)}`);
  lines.push('', 'Billing', `  Alerts this week: ${n(b.alerts_new)}; open in all: ${n(b.alerts_open)}`, `  New paid access: ${n(b.checkout_grants)}`);
  for (const a of b.alerts || []) lines.push(`    ${day(a.created_at)} ${a.kind}${a.ref ? ' ' + a.ref : ''}${a.resolved ? ' (resolved)' : ''}`);
  return lines.join('\n');
}

/**
 * weekly-digest: GET builds the report for the last `days` (default 7) and returns it; POST stores
 * the week ending at today's midnight UTC in ops_digests and returns that row. Either needs the
 * service-role key as the bearer token, or the bearer token of a member of ops_admins.
 */
export async function weeklyDigest({ method, authorization, days }, deps) {
  if (method !== 'GET' && method !== 'POST') return { status: 405, body: { error: 'method' } };
  const token = bearerOf(authorization);
  if (!token) return { status: 401, body: { error: 'unauthorized' } };
  let ok = safeEqual(token, deps.env.serviceKey);
  if (!ok) { try { ok = await deps.db.isOpsAdmin(token); } catch (e) { ok = false; } }
  if (!ok) return { status: 403, body: { error: 'forbidden' } };
  const d = Math.min(Math.max(parseInt(days, 10) || 7, 1), 90);
  if (method === 'POST') {
    const row = await deps.db.store();
    return { status: 200, body: { stored: true, period_end: row && row.period_end, report: row && row.report, text: renderDigest(row && row.report) } };
  }
  const report = await deps.db.build(d);
  return { status: 200, body: { stored: false, report, text: renderDigest(report) } };
}

/** health: 200 { ok: true, db: 'ok', ... } when a query runs in time, else 503 { ok: false }. No personal data either way. */
export async function healthCheck(deps) {
  const started = deps.now();
  let timer;
  const timeout = new Promise(resolve => { timer = setTimeout(() => resolve('timeout'), deps.timeoutMs || HEALTH_TIMEOUT_MS); });
  let probe;
  try { probe = await Promise.race([deps.db.health(), timeout]); } catch (e) { probe = null; } finally { clearTimeout(timer); }
  const ms = deps.now() - started;
  const base = { service: 'hotkey.gg', version: deps.env.version || null, at: new Date(deps.now()).toISOString(), ms };
  if (!probe || probe === 'timeout' || probe.db !== 'ok') return { status: 503, body: { ok: false, db: probe === 'timeout' ? 'timeout' : 'down', ...base } };
  return { status: 200, body: { ok: true, db: 'ok', last_event_at: probe.last_event_at || null, last_digest_end: probe.last_digest_end || null, ...base } };
}

/** Plain JSON headers for both functions: never cached, never framed. Pure. */
export const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
