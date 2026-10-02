// app2/supabase/functions/_shared/billing.js — the logic of the three payment functions
// (docs/phases/E-checkout.md, section 5), with every Stripe and database call behind two small
// adapters passed in as `deps`. The Deno entry points (create-checkout/, stripe-webhook/,
// billing-portal/) wire the real adapters (adapters.ts); the fast check (app2/tests/billing.test.js)
// wires fakes, so no test ever reaches the network.
//
//   deps.stripe: createCustomer, priceByLookupKey, createCheckoutSession, retrieveSubscription,
//                listSubscriptions, cancelSubscription, retrieveCharge, createPortalSession
//   deps.db:     activeCheckout(uid), customerFor(uid), userForCustomer(cus), linkCustomer(uid, cus),
//                grant(uid, ref, plan, endsAt, note, renews), end(ref, endsAt), revokeUser(uid, note),
//                alert(kind, ref, detail), eventBegin(id, type), eventDone(id)
//   deps.env:    { siteUrl, returnOrigins, managedPayments }
//   deps.now():  ms since the epoch (tests pin it)
//   deps.log(msg, detail)
import { isStudentEmail } from './student-domains.js';

/** The API version the webhook endpoint is pinned to (brief section 3). Stripe clients use exactly this. */
export const API_VERSION = '2026-08-26.dahlia';
export const GRACE_DAYS = 2;
export const PASS_DAYS = 365;   // the parked 12-month pass (decision 12): a one-time payment's row lasts this long
export const INTEGRATION_ID = 'hotkey_monthly_embedded_qkrvmzta';
export const LOOKUP_KEYS = { monthly: 'hk_monthly', student_monthly: 'hk_monthly_student' };
/** The events the endpoint sends (brief section 3); anything else is acknowledged and ignored. */
export const WEBHOOK_EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed',
  'invoice.paid', 'invoice.payment_failed', 'customer.subscription.updated', 'customer.subscription.deleted', 'charge.refunded', 'charge.dispute.created'];

const DAY = 86400000;
const id = v => (v && typeof v === 'object' ? v.id : v) || null;

/** A Stripe period end (seconds) plus the grace, as an ISO string. Pure. */
export function graceEnd(periodEndSecs, graceDays = GRACE_DAYS) {
  const s = Number(periodEndSecs);
  if (!Number.isFinite(s) || s <= 0) throw new Error('bad period end');
  return new Date(s * 1000 + graceDays * DAY).toISOString();
}

/** On this API version a subscription's period lives on its item. Pure. */
export function periodEnd(sub) {
  const item = sub && sub.items && Array.isArray(sub.items.data) ? sub.items.data[0] : null;
  return item && item.current_period_end ? item.current_period_end : (sub && sub.current_period_end) || null;
}

/** A team subscription (a manual Payment Link) carries plan=team or no plan at all; it is never granted automatically. Pure. */
export function isTeamSub(sub) {
  const plan = sub && sub.metadata ? sub.metadata.plan : null;
  return !plan || plan === 'team';
}

/** Does the subscription renew? False once it is set to cancel at period end (the account page says "ends"). Pure. */
export const renews = sub => !!sub && !sub.cancel_at_period_end && !sub.cancel_at && ['active', 'trialing', 'past_due'].includes(sub.status);

/** Which plan and price an email gets. Pure. */
export function planFor(email) {
  const student = isStudentEmail(email);
  const plan = student ? 'student_monthly' : 'monthly';
  return { plan, student, lookupKey: LOOKUP_KEYS[plan] };
}

/**
 * The origin a return URL may point at: the request's own origin when it is the site or one of
 * RETURN_ORIGINS (exact origins, or one "*" standing for a single label, as in
 * "https://*.hotkey-gg.pages.dev"), else the site. Pure.
 */
export function returnBase(origin, siteUrl, returnOrigins = '') {
  const site = String(siteUrl || '').replace(/\/+$/, '');
  const o = String(origin || '').replace(/\/+$/, '');
  if (!o) return site;
  let siteOrigin = ''; try { siteOrigin = new URL(site).origin; } catch (e) { /* no site url */ }
  if (o === siteOrigin) return o;
  const pats = String(returnOrigins || '').split(',').map(s => s.trim()).filter(Boolean);
  for (const p of pats) {
    const rx = new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[a-z0-9-]+') + '$');
    if (/^https:\/\//.test(p) && rx.test(o)) return o;
  }
  return site;
}

/** Where Stripe sends the buyer back: the shell maps ?checkout_session= to #/checkout/done (app/main.js). Pure. */
export const checkoutReturnUrl = base => base + '/?checkout_session={CHECKOUT_SESSION_ID}';
/** Where the Customer Portal sends them back: the shell maps ?billing=done to #/account. Pure. */
export const portalReturnUrl = base => base + '/?billing=done';

/**
 * The Checkout Session's parameters (brief section 5, step 5). Under Managed Payments Stripe rejects
 * automatic_tax, tax_id_collection, payment_method_types and the rest, so none of them is ever set;
 * with managedPayments off (the fallback) it is plain Checkout with automatic tax. Pure.
 */
export function checkoutSessionParams({ customer, price, userId, plan, base, managedPayments = true }) {
  const meta = { user_id: userId, plan };
  const p = {
    ui_mode: 'embedded_page',
    integration_identifier: INTEGRATION_ID,
    mode: 'subscription',
    customer,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    client_reference_id: userId,
    metadata: meta,
    subscription_data: { metadata: { ...meta } },
    return_url: checkoutReturnUrl(base),
  };
  if (managedPayments) p.managed_payments = { enabled: true };
  else p.automatic_tax = { enabled: true };
  return p;
}

const json = (status, body) => ({ status, body });

/** create-checkout (brief section 5). `user` is the verified auth user { id, email } or null. */
export async function createCheckout({ user, input = {}, origin = '' }, deps) {
  if (!user || !user.id) return json(401, { error: 'not_signed_in' });
  if ((input && input.plan || 'monthly') !== 'monthly') return json(400, { error: 'bad_plan' });
  try {
    if (await deps.db.activeCheckout(user.id)) return json(409, { error: 'already_subscribed' });
    let customer = await deps.db.customerFor(user.id);
    if (!customer) {
      customer = await deps.stripe.createCustomer({ email: user.email || undefined, metadata: { user_id: user.id } });
      await deps.db.linkCustomer(user.id, customer);
    }
    const { plan, student, lookupKey } = planFor(user.email);
    const price = await deps.stripe.priceByLookupKey(lookupKey);
    if (!price) return json(500, { error: 'price_missing' });
    const base = returnBase(origin, deps.env.siteUrl, deps.env.returnOrigins);
    const session = await deps.stripe.createCheckoutSession(checkoutSessionParams({ customer, price, userId: user.id, plan, base, managedPayments: deps.env.managedPayments !== false }));
    return json(200, { client_secret: session.client_secret, student });
  } catch (e) {
    if (deps.log) deps.log('create-checkout failed', String(e && e.message || e));
    return json(500, { error: 'checkout_failed' });
  }
}

/** billing-portal (brief section 5): the portal home, or straight to the cancel confirmation. */
export async function billingPortal({ user, input = {}, origin = '' }, deps) {
  if (!user || !user.id) return json(401, { error: 'not_signed_in' });
  try {
    const customer = await deps.db.customerFor(user.id);
    if (!customer) return json(404, { error: 'no_customer' });
    const base = returnBase(origin, deps.env.siteUrl, deps.env.returnOrigins);
    const params = { customer, return_url: portalReturnUrl(base) };
    if (input && input.flow === 'cancel') {
      const subs = await deps.stripe.listSubscriptions(customer);
      const sub = (subs || []).find(s => !isTeamSub(s) && ['active', 'trialing', 'past_due'].includes(s.status) && !s.cancel_at_period_end);
      if (sub) params.flow_data = { type: 'subscription_cancel', subscription_cancel: { subscription: sub.id }, after_completion: { type: 'redirect', redirect: { return_url: portalReturnUrl(base) } } };
    }
    const session = await deps.stripe.createPortalSession(params);
    return json(200, { url: session.url });
  } catch (e) {
    if (deps.log) deps.log('billing-portal failed', String(e && e.message || e));
    return json(500, { error: 'portal_failed' });
  }
}

/** The user a subscription belongs to: its metadata, else the customer link. */
async function userOfSub(sub, deps) {
  return (sub.metadata && sub.metadata.user_id) || (await deps.db.userForCustomer(id(sub.customer)));
}

/** A subscription's state written to its row (customer.subscription.updated, invoice.paid). */
async function applySubscription(sub, deps, { renewal = false } = {}) {
  if (isTeamSub(sub)) {
    if (!renewal) await deps.db.alert('team_subscription_changed', sub.id, { status: sub.status, quantity: sub.items && sub.items.data && sub.items.data[0] ? sub.items.data[0].quantity : null, cancel_at_period_end: !!sub.cancel_at_period_end });
    return 'team';
  }
  const user = await userOfSub(sub, deps);
  if (!user) { await deps.db.alert('subscription_unmatched', sub.id, { customer: id(sub.customer), status: sub.status }); return 'unmatched'; }
  if (renewal || sub.status === 'active' || sub.status === 'trialing') {
    await deps.db.grant(user, sub.id, sub.metadata.plan, graceEnd(periodEnd(sub)), null, renews(sub));
    return 'granted';
  }
  if (sub.status === 'unpaid' || sub.status === 'canceled' || sub.status === 'incomplete_expired') {
    await deps.db.end(sub.id, new Date(deps.now()).toISOString());
    return 'ended';
  }
  return 'unchanged';   // past_due, incomplete, paused: the row lapses on its own at period end + grace
}

/** A full refund or a dispute: revoke the customer's checkout rows and cancel their individual subscriptions now. */
async function revokeCustomer(customer, note, ref, deps) {
  const user = customer ? await deps.db.userForCustomer(customer) : null;
  if (!user) { await deps.db.alert(note === 'dispute' ? 'dispute_unmatched' : 'refund_unmatched', ref, { customer }); return 'unmatched'; }
  await deps.db.revokeUser(user, note);
  const subs = await deps.stripe.listSubscriptions(customer);
  for (const s of subs || []) {
    if (!['active', 'trialing', 'past_due', 'unpaid'].includes(s.status)) continue;
    if (isTeamSub(s)) { await deps.db.alert('team_' + note, s.id, { customer, charge: ref }); continue; }
    await deps.stripe.cancelSubscription(s.id);
  }
  return 'revoked';
}

/**
 * The webhook's event-to-action mapping (brief section 5, the table). Returns a short outcome word
 * for the log and the tests. Every action is idempotent, so a retry or a replay is safe.
 */
export async function handleEvent(event, deps) {
  const o = event && event.data ? event.data.object : null;
  if (!o) return 'ignored';
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      if (event.type === 'checkout.session.completed' && o.payment_status === 'unpaid') return 'awaiting_payment';
      const user = o.client_reference_id;
      if (!user) return 'skipped_no_user';   // a manual Teams link: its subscription.* events raise the alerts
      if (o.customer) await deps.db.linkCustomer(user, id(o.customer)).catch(() => {});
      if (o.mode === 'payment') {
        const plan = o.metadata && o.metadata.plan;
        if (plan !== 'pass' && plan !== 'addon') return 'ignored';
        await deps.db.grant(user, id(o.payment_intent), plan, new Date(deps.now() + PASS_DAYS * DAY).toISOString(), null, false);
        return 'granted';
      }
      const sub = await deps.stripe.retrieveSubscription(id(o.subscription));
      if (!sub || isTeamSub(sub)) return 'team';
      await deps.db.grant(user, sub.id, sub.metadata.plan, graceEnd(periodEnd(sub)), null, renews(sub));
      return 'granted';
    }
    case 'checkout.session.async_payment_failed':
    case 'invoice.payment_failed':
      if (deps.log) deps.log(event.type, { id: o.id });
      return 'logged';
    case 'invoice.paid': {
      const parent = o.parent && o.parent.subscription_details ? o.parent.subscription_details.subscription : null;
      const subId = id(parent || o.subscription);
      if (!subId) return 'ignored';
      const sub = await deps.stripe.retrieveSubscription(subId);
      if (!sub || isTeamSub(sub)) return 'team';
      return applySubscription(sub, deps, { renewal: true });
    }
    case 'customer.subscription.updated':
      return applySubscription(o, deps);
    case 'customer.subscription.deleted':
      if (isTeamSub(o)) { await deps.db.alert('team_subscription_ended', o.id, { status: o.status, customer: id(o.customer) }); return 'team'; }
      await deps.db.end(o.id, new Date(deps.now()).toISOString());
      return 'ended';
    case 'charge.refunded': {
      const full = o.refunded === true || (Number(o.amount_refunded) >= Number(o.amount) && Number(o.amount) > 0);
      if (!full) { if (deps.log) deps.log('partial refund, no change', { id: o.id }); return 'partial'; }
      return revokeCustomer(id(o.customer), 'refund', o.id, deps);
    }
    case 'charge.dispute.created': {
      const charge = typeof o.charge === 'object' && o.charge ? o.charge : await deps.stripe.retrieveCharge(o.charge);
      return revokeCustomer(charge ? id(charge.customer) : null, 'dispute', o.id, deps);
    }
    default:
      return 'ignored';
  }
}

/**
 * The webhook around handleEvent: verify (the entry point does that and passes the event), record
 * the id, handle, mark processed. A replay of a processed event is a 200 with nothing done; a throw
 * is a 500 so Stripe retries.
 */
export async function processWebhook(event, deps) {
  if (!event || !event.id || !event.type) return json(400, { error: 'bad_event' });
  try {
    const fresh = await deps.db.eventBegin(event.id, event.type);
    if (!fresh) return json(200, { received: true, duplicate: true });
    const outcome = await handleEvent(event, deps);
    await deps.db.eventDone(event.id);
    return json(200, { received: true, outcome });
  } catch (e) {
    if (deps.log) deps.log('webhook handler failed', { id: event.id, type: event.type, error: String(e && e.message || e) });
    return json(500, { error: 'handler_failed' });
  }
}

/** CORS for the two browser-called functions: the site and the allowed preview origins only. Pure. */
export function corsHeaders(origin, siteUrl, returnOrigins) {
  const allowed = returnBase(origin, siteUrl, returnOrigins);
  return {
    'Access-Control-Allow-Origin': origin && allowed === String(origin).replace(/\/+$/, '') ? allowed : String(siteUrl || '').replace(/\/+$/, ''),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}
