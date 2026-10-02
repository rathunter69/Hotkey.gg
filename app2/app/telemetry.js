// app2/app/telemetry.js — first-party analytics (SITE_SPEC §12): the funnel events and the
// client error log, through rpc_track / rpc_log_error (0003_events.sql, hardened in 0015_ops.sql). Fire-and-forget: every
// call is wrapped, nothing here can break a lesson, and without config (tests, local, guest-only
// builds) every call is a silent no-op. No third-party scripts, ever.
import { auth } from './auth.js';

/**
 * The event names the client fires; the SQL check is the regex in 0003_events.sql. C2 adds the
 * per-goal and per-challenge events the north-star reads from `events`: goal_complete
 * {lesson_id, goal, secs} and challenge_result {ref, tier, secs, keys, first, timed_out}.
 * The experience pass adds landing_demo {where, outcome}, briefing_done {skipped} and
 * install_prompt {outcome}.
 */
export const EVENTS = ['landing_view', 'lesson_start', 'lesson_complete', 'lesson_timeup', 'signup', 'sign_in', 'carry_over', 'drill_complete', 'goal_complete', 'challenge_result', 'landing_demo', 'briefing_done', 'install_prompt',
  // Phase E checkout (docs/phases/E-checkout.md, section 6)
  'pricing_view', 'checkout_view', 'checkout_signin', 'checkout_start', 'checkout_unlocked', 'checkout_timeout', 'cancel_click', 'course_complete_email'];
export const EVENT_NAME_RE = /^[a-z_]{1,40}$/;

const SESSION_KEY = 'hk2_session';

/** One key per browser session (sessionStorage), for the rate cap and funnel stitching. */
export function sessionKey() {
  try {
    let k = sessionStorage.getItem(SESSION_KEY);
    if (!k) { k = crypto.randomUUID(); sessionStorage.setItem(SESSION_KEY, k); }
    return k;
  } catch (e) { return null; }
}

/** Events one page load may send; the server caps a session at 200 an hour on top (0003, 0015). */
export const EVENTS_PER_LOAD = 150;
let tracked = 0;

/** Fire an event. Never throws, never blocks, no-op without a configured client. */
export function track(name, props) {
  try {
    if (!EVENT_NAME_RE.test(String(name))) return;
    if (tracked >= EVENTS_PER_LOAD) return;
    tracked += 1;
    const sb = auth.client();
    if (!sb) return;
    sb.rpc('rpc_track', { p_name: name, p_props: props || {}, p_session_key: sessionKey() }).then(() => {}, () => {});
  } catch (e) { /* telemetry must never surface */ }
}

/** Dedupe identical error messages per page load. Pure; exported for the tests. */
export function makeDedupe(limit = 20) {
  const seen = new Set();
  return message => {
    const key = String(message == null ? '' : message).slice(0, 512);
    if (seen.has(key) || seen.size >= limit) return false;
    seen.add(key);
    return true;
  };
}

// ---------------------------------------------------------------- the error log's privacy rules
// The same rules 0015_ops.sql applies on the server (ops_scrub, ops_scrub_url), so nothing personal
// leaves the browser in the first place: emails, tokens, secrets in key=value pairs, long numbers.
const SCRUB = [
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email]'],
  [/eyJ[A-Za-z0-9_-]{6,}(?:\.[A-Za-z0-9_-]+){0,2}/g, '[token]'],
  [/(access_token|refresh_token|provider_token|token|code|key|apikey|password|secret|email|session_id)=[^&#\s]*/gi, '$1=[redacted]'],
  [/(?=[A-Za-z0-9_-]*[0-9])(?=[A-Za-z0-9_-]*[A-Za-z])[A-Za-z0-9_-]{32,}/g, '[token]'],
  [/[0-9][0-9 -]{7,}[0-9]/g, '[number]'],
];
/** Personal data out of a message or stack. Pure. */
export function scrubText(text) {
  if (text == null) return null;
  let s = String(text);
  for (const [re, to] of SCRUB) s = s.replace(re, to);
  return s;
}
/** A page address with its query dropped, and its hash kept only when it is a route (#/...). Pure. */
export function scrubUrl(url) {
  const u = String(url == null ? '' : url);
  const hashAt = u.indexOf('#');
  let base = (hashAt < 0 ? u : u.slice(0, hashAt)).split('?')[0];
  if (hashAt >= 0) {
    const frag = u.slice(hashAt + 1);
    if (/^\/[A-Za-z0-9/_-]*(\?.*)?$/.test(frag)) base += '#' + frag.split('?')[0];
  }
  return scrubText(base).slice(0, 512);
}
/** Noise that is not ours: browser extensions, cross-origin "Script error.", the ResizeObserver warning. Pure. */
export function ignorable(message, stack) {
  const m = String(message == null ? '' : message);
  if (!m.trim() || m === 'Script error.' || /^ResizeObserver loop/.test(m)) return true;
  return /(chrome|moz|safari(-web)?)-extension:\/\//.test(String(stack || '') + ' ' + m);
}
/** At most `burst` reports at once, then one every `everyMs`, and `max` in all per page load. */
export function makeLimiter({ burst = 5, everyMs = 10000, max = 20, now = () => Date.now() } = {}) {
  let tokens = burst, last = now(), sent = 0;
  return () => {
    const t = now();
    tokens = Math.min(burst, tokens + (t - last) / everyMs); last = t;
    if (sent >= max || tokens < 1) return false;
    tokens -= 1; sent += 1;
    return true;
  };
}
/** What one error report carries: no account, no query string, no email or token. Pure. */
export function errorReport(href, message, stack) {
  return {
    p_url: scrubUrl(href),
    p_message: scrubText(message == null ? '' : message).slice(0, 2048),
    p_stack: stack == null ? null : scrubText(String(stack).slice(0, 4096)).slice(0, 2048),
  };
}

/** window.onerror + unhandledrejection → rpc_log_error: noise ignored, deduped, rate-limited and scrubbed per page load. */
export function installErrorLog() {
  try {
    if (typeof window === 'undefined') return;
    const fresh = makeDedupe();
    const allow = makeLimiter();
    const send = (message, stack) => {
      try {
        if (ignorable(message, stack)) return;
        if (!fresh(message)) return;
        const sb = auth.client();
        if (!sb) return;
        const key = sessionKey();
        if (!key) return;   // the server drops a keyless error anyway (0015)
        if (!allow()) return;
        sb.rpc('rpc_log_error', { ...errorReport(location.href, message, stack), p_session_key: key }).then(() => {}, () => {});
      } catch (e) { /* never surface */ }
    };
    window.addEventListener('error', e => send(e.message || 'error', e.error && e.error.stack));
    window.addEventListener('unhandledrejection', e => {
      const r = e.reason;
      send(r && r.message ? r.message : String(r), r && r.stack);
    });
  } catch (e) { /* never surface */ }
}
