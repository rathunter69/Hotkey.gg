// app2/app/telemetry.js — first-party analytics (SITE_SPEC §12): the six funnel events and the
// client error log, through rpc_track / rpc_log_error (0003_events.sql). Fire-and-forget: every
// call is wrapped, nothing here can break a lesson, and without config (tests, local, guest-only
// builds) every call is a silent no-op. No third-party scripts, ever.
import { auth } from './auth.js';

/** The event names the client fires; the SQL check is the regex in 0003_events.sql. */
export const EVENTS = ['landing_view', 'lesson_start', 'lesson_complete', 'signup', 'sign_in', 'carry_over'];
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

/** Fire an event. Never throws, never blocks, no-op without a configured client. */
export function track(name, props) {
  try {
    if (!EVENT_NAME_RE.test(String(name))) return;
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

/** window.onerror + unhandledrejection → rpc_log_error, deduped per page load. */
export function installErrorLog() {
  try {
    if (typeof window === 'undefined') return;
    const fresh = makeDedupe();
    const send = (message, stack) => {
      try {
        if (!fresh(message)) return;
        const sb = auth.client();
        if (!sb) return;
        sb.rpc('rpc_log_error', {
          p_url: String(location.href).slice(0, 512),
          p_message: String(message == null ? '' : message).slice(0, 2048),
          p_stack: stack == null ? null : String(stack).slice(0, 2048),
          p_session_key: sessionKey(),
        }).then(() => {}, () => {});
      } catch (e) { /* never surface */ }
    };
    window.addEventListener('error', e => send(e.message || 'error', e.error && e.error.stack));
    window.addEventListener('unhandledrejection', e => {
      const r = e.reason;
      send(r && r.message ? r.message : String(r), r && r.stack);
    });
  } catch (e) { /* never surface */ }
}
