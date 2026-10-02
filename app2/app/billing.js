// app2/app/billing.js — the browser side of checkout (docs/phases/E-checkout.md, section 6). It
// never holds a secret: it invokes the two signed-in edge functions with the user's own session,
// leaves the payment form to checkout.js and its processor adapter, and reads the account's OWN
// entitlement rows (RLS) to say what plan it holds. Fulfilment is the webhook's job alone; nothing
// here grants anything.
//
//   startCheckout()           → { clientSecret, student } | { error }      ('already_subscribed', 'not_signed_in', 'network', …)
//   openPortal(flow)          → navigates to Stripe's Customer Portal; resolves { error } if it couldn't
//   planDetails()             → planSummary of this account's rows, or null for a guest or offline
//   planSummary(rows, now)    pure: { kind:'free' } | { kind:'subscription', plan, student, renews, date } | { kind:'granted', endsAt }
import { auth } from './auth.js';
import { isLive } from './entitlement.js';
import { track } from './telemetry.js';

/** The days of grace the webhook adds past a period end (functions/_shared/billing.js GRACE_DAYS). */
export const GRACE_DAYS = 2;
const DAY = 86400000;

/**
 * What an account's entitlement rows say about its plan. Pure. A live checkout row is a
 * subscription: its renewal (or end) date is the row's end less the grace. Any other live row
 * (an admin grant, a redeem code, group access) is "granted".
 */
export function planSummary(rows, now = Date.now()) {
  const live = (Array.isArray(rows) ? rows : []).filter(r => isLive(r, now));
  const sub = live.filter(r => r.source === 'checkout').sort((a, b) => Date.parse(b.ends_at || 0) - Date.parse(a.ends_at || 0))[0];
  if (sub) {
    const end = sub.ends_at ? Date.parse(sub.ends_at) - GRACE_DAYS * DAY : null;
    return { kind: 'subscription', plan: sub.plan || 'monthly', student: sub.plan === 'student_monthly', renews: sub.auto_renew !== false, date: end ? new Date(end).toISOString() : null };
  }
  const other = live[0];
  if (other) return { kind: 'granted', source: other.source, endsAt: other.ends_at || null };
  return { kind: 'free' };
}

/** A date as the account page shows it: "November 2, 2026". Pure. */
export function planDate(iso, locale = 'en-US') {
  const t = Date.parse(iso); if (!Number.isFinite(t)) return '';
  try { return new Date(t).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }); } catch (e) { return new Date(t).toISOString().slice(0, 10); }
}

/** Invoke an edge function with the user's session; the error code from the body, never a stack. */
async function invoke(name, body) {
  const sb = auth.client();
  if (!sb || !sb.functions) return { error: 'unavailable' };
  try {
    const { data, error } = await sb.functions.invoke(name, { body });
    if (!error) return { data };
    let code = 'failed';
    try { const j = error.context && typeof error.context.json === 'function' ? await error.context.json() : null; if (j && j.error) code = j.error; } catch (e) { /* no body */ }
    if (/FunctionsFetchError|Failed to fetch|NetworkError/i.test(String(error.name || '') + ' ' + String(error.message || ''))) code = 'network';
    return { error: code };
  } catch (e) { return { error: 'network' }; }
}

export async function startCheckout() {
  if (auth.state() !== 'in') return { error: 'not_signed_in' };
  const t = auth.token();
  const r = await invoke('create-checkout', { plan: 'monthly' });
  if (!auth.current(t)) return { error: 'stale' };
  if (r.error) return r;
  if (!r.data || !r.data.client_secret) return { error: 'failed' };
  track('checkout_start', { student: !!r.data.student });
  return { clientSecret: r.data.client_secret, student: !!r.data.student };
}

export async function openPortal(flow = null) {
  if (flow === 'cancel') track('cancel_click', {});
  const r = await invoke('billing-portal', flow ? { flow } : {});
  if (r.error) return r;
  if (!r.data || !/^https:\/\//.test(r.data.url || '')) return { error: 'failed' };
  location.href = r.data.url;
  return {};
}

export async function planDetails() {
  const u = auth.user(); const sb = auth.client();
  if (!u || !sb) return null;
  try {
    // '*' so a database without 0011's columns still answers (the plan then reads as granted or free)
    const { data, error } = await sb.from('entitlements').select('*').eq('user_id', u.id);
    if (error) return null;
    return planSummary(data);
  } catch (e) { return null; }
}

/** Stripe.js now loads in the Stripe adapter (processors/stripe.js), behind checkout.js. */
export { loadStripe } from './processors/stripe.js';

/**
 * When a subscriber finishes the last chapter, the course-complete email is due (brief section 6):
 * one email with what's left to practice and a direct cancel link. No transactional email path
 * exists yet, so it is logged as an event, once per device, for the sender to pick up. Pure test:
 * isCourseDone(lessonIds, progress).
 */
export const isCourseDone = (ids, all) => Array.isArray(ids) && ids.length > 0 && ids.every(id => all && all[id] && all[id].completed);
const DONE_KEY = 'hk2_course_done_logged';
export async function noteCourseComplete(lastChapterIds, all) {
  try {
    if (!isCourseDone(lastChapterIds, all)) return false;
    if (globalThis.localStorage && localStorage.getItem(DONE_KEY)) return false;
    const plan = await planDetails();
    if (!plan || plan.kind !== 'subscription') return false;
    track('course_complete_email', { plan: plan.plan });
    try { localStorage.setItem(DONE_KEY, '1'); } catch (e) { /* blocked: it may log again, the sender dedupes */ }
    return true;
  } catch (e) { return false; }
}
