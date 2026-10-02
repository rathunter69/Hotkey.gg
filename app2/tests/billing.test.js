// app2/tests/billing.test.js — the payment functions' logic (docs/phases/E-checkout.md, section 7's
// node tests): the student-domain check, the grace arithmetic, the Checkout Session's parameters,
// and the webhook's event-to-action mapping, all through fake adapters. Nothing here reaches Stripe,
// Supabase or the network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { isStudentEmail, emailDomain, STUDENT_SUFFIXES } from '../supabase/functions/_shared/student-domains.js';
import { graceEnd, periodEnd, isTeamSub, planFor, returnBase, checkoutSessionParams, createCheckout, billingPortal, handleEvent, processWebhook, corsHeaders, API_VERSION, WEBHOOK_EVENTS } from '../supabase/functions/_shared/billing.js';

const NOW = Date.parse('2026-10-02T12:00:00Z');
const PERIOD_END = Math.floor(Date.parse('2026-11-02T12:00:00Z') / 1000);

/** Fake adapters that record every call. `state` seeds what the database and Stripe answer. */
function fakes(state = {}) {
  const calls = [];
  const rec = (name, ret) => async (...args) => { calls.push([name, ...args]); return typeof ret === 'function' ? ret(...args) : ret; };
  const subs = state.subs || {};
  const deps = {
    env: { siteUrl: 'https://hotkey.gg', returnOrigins: state.returnOrigins || '', managedPayments: state.managed !== false },
    now: () => NOW,
    log: () => {},
    db: {
      activeCheckout: rec('activeCheckout', !!state.active),
      customerFor: rec('customerFor', state.customer || null),
      userForCustomer: rec('userForCustomer', cus => (state.customers || {})[cus] || null),
      linkCustomer: rec('linkCustomer', null),
      grant: rec('grant', null),
      end: rec('end', 1),
      revokeUser: rec('revokeUser', 1),
      alert: rec('alert', 1),
      eventBegin: rec('eventBegin', evId => !(state.processed || []).includes(evId)),
      eventDone: rec('eventDone', null),
    },
    stripe: {
      createCustomer: rec('createCustomer', 'cus_NEW'),
      priceByLookupKey: rec('priceByLookupKey', key => ({ hk_monthly: 'price_15', hk_monthly_student: 'price_9' })[key] || null),
      createCheckoutSession: rec('createCheckoutSession', { client_secret: 'cs_secret_x' }),
      retrieveSubscription: rec('retrieveSubscription', sid => subs[sid] || null),
      listSubscriptions: rec('listSubscriptions', () => Object.values(subs)),
      cancelSubscription: rec('cancelSubscription', null),
      retrieveCharge: rec('retrieveCharge', cid => (state.charges || {})[cid] || null),
      createPortalSession: rec('createPortalSession', { url: 'https://billing.stripe.com/p/session/x' }),
    },
  };
  return { deps, calls, only: name => calls.filter(c => c[0] === name) };
}
const sub = (id, over = {}) => ({ id, object: 'subscription', status: 'active', customer: 'cus_1', cancel_at_period_end: false, metadata: { user_id: 'u1', plan: 'monthly' }, items: { data: [{ current_period_end: PERIOD_END, quantity: 1 }] }, ...over });
const ev = (type, object, id = 'evt_' + type) => ({ id, type, data: { object } });

test('student domains: a school email ends in a listed suffix as whole labels', () => {
  assert.equal(isStudentEmail('ana@harvard.edu'), true);
  assert.equal(isStudentEmail('Ana@Mail.Ox.AC.UK'), true, 'case does not matter');
  assert.equal(isStudentEmail('a@student.unimelb.edu.au'), true);
  assert.equal(isStudentEmail('a@itam.edu.mx'), true);
  assert.equal(isStudentEmail('a@gmail.com'), false);
  assert.equal(isStudentEmail('a@notedu'), false);
  assert.equal(isStudentEmail('a@xedu.com'), false);
  assert.equal(isStudentEmail('a@edu.example.com'), false, 'the suffix must end the domain');
  assert.equal(isStudentEmail('a@harvard.edu.evil.com'), false);
  assert.equal(isStudentEmail('harvard.edu'), false, 'not an email');
  assert.equal(isStudentEmail(''), false); assert.equal(isStudentEmail(null), false);
  assert.equal(emailDomain(' a@B.ac.jp. '), 'b.ac.jp');
  assert.equal(STUDENT_SUFFIXES.length, 11);
  for (const s of STUDENT_SUFFIXES) assert.equal(isStudentEmail('x@school' + s), true, s);
});

test('planFor: students get hk_monthly_student, everyone else hk_monthly', () => {
  assert.deepEqual(planFor('a@mit.edu'), { plan: 'student_monthly', student: true, lookupKey: 'hk_monthly_student' });
  assert.deepEqual(planFor('a@bank.com'), { plan: 'monthly', student: false, lookupKey: 'hk_monthly' });
});

test('grace: period end plus two days, from Stripe seconds; the period is on the item', () => {
  assert.equal(graceEnd(PERIOD_END), '2026-11-04T12:00:00.000Z');
  assert.equal(graceEnd(PERIOD_END, 0), '2026-11-02T12:00:00.000Z');
  assert.throws(() => graceEnd(null)); assert.throws(() => graceEnd('x'));
  assert.equal(periodEnd(sub('sub_1')), PERIOD_END);
  assert.equal(periodEnd({ current_period_end: 5 }), 5, 'older shape as a fallback');
  assert.equal(isTeamSub(sub('s', { metadata: { plan: 'team' } })), true);
  assert.equal(isTeamSub(sub('s', { metadata: {} })), true, 'no plan means a manual link');
  assert.equal(isTeamSub(sub('s')), false);
  assert.equal(API_VERSION, '2026-08-26.dahlia');
  assert.equal(WEBHOOK_EVENTS.length, 9);
});

test('returnBase: the site, or an allowed preview origin; never an arbitrary one', () => {
  assert.equal(returnBase('https://hotkey.gg', 'https://hotkey.gg'), 'https://hotkey.gg');
  assert.equal(returnBase('https://evil.com', 'https://hotkey.gg'), 'https://hotkey.gg');
  assert.equal(returnBase('https://payments.hk.pages.dev', 'https://hotkey.gg', 'https://*.hk.pages.dev'), 'https://payments.hk.pages.dev');
  assert.equal(returnBase('https://a.b.hk.pages.dev', 'https://hotkey.gg', 'https://*.hk.pages.dev'), 'https://hotkey.gg', 'one label only');
  assert.equal(returnBase('https://xhk.pages.dev', 'https://hotkey.gg', 'https://*.hk.pages.dev'), 'https://hotkey.gg');
  assert.equal(returnBase('', 'https://hotkey.gg/'), 'https://hotkey.gg');
  const c = corsHeaders('https://evil.com', 'https://hotkey.gg', '');
  assert.equal(c['Access-Control-Allow-Origin'], 'https://hotkey.gg');
  assert.equal(corsHeaders('https://p.hk.pages.dev', 'https://hotkey.gg', 'https://*.hk.pages.dev')['Access-Control-Allow-Origin'], 'https://p.hk.pages.dev');
});

test('checkoutSessionParams: embedded, subscription, managed payments, and none of the fields Managed Payments rejects', () => {
  const p = checkoutSessionParams({ customer: 'cus_1', price: 'price_15', userId: 'u1', plan: 'monthly', base: 'https://hotkey.gg' });
  assert.equal(p.ui_mode, 'embedded_page');
  assert.equal(p.mode, 'subscription');
  assert.equal(p.integration_identifier, 'hotkey_monthly_embedded_qkrvmzta');
  assert.deepEqual(p.managed_payments, { enabled: true });
  assert.deepEqual(p.line_items, [{ price: 'price_15', quantity: 1 }]);
  assert.equal(p.allow_promotion_codes, true);
  assert.equal(p.client_reference_id, 'u1');
  assert.deepEqual(p.subscription_data, { metadata: { user_id: 'u1', plan: 'monthly' } });
  assert.equal(p.return_url, 'https://hotkey.gg/?checkout_session={CHECKOUT_SESSION_ID}');
  for (const banned of ['automatic_tax', 'tax_id_collection', 'payment_method_types', 'payment_method_configuration', 'adaptive_pricing', 'customer_update', 'invoice_creation'])
    assert.equal(banned in p, false, banned);
  assert.equal('invoice_settings' in p.subscription_data || 'default_tax_rates' in p.subscription_data, false);
  const fallback = checkoutSessionParams({ customer: 'c', price: 'p', userId: 'u', plan: 'monthly', base: 'https://hotkey.gg', managedPayments: false });
  assert.equal('managed_payments' in fallback, false); assert.deepEqual(fallback.automatic_tax, { enabled: true });
});

test('create-checkout: 401 signed out, 409 already subscribed, customer made once, student price by email', async () => {
  let f = fakes();
  assert.equal((await createCheckout({ user: null }, f.deps)).status, 401);
  f = fakes({ active: true });
  assert.deepEqual(await createCheckout({ user: { id: 'u1', email: 'a@b.com' } }, f.deps), { status: 409, body: { error: 'already_subscribed' } });
  assert.equal(f.only('createCheckoutSession').length, 0);
  f = fakes();
  const r = await createCheckout({ user: { id: 'u1', email: 'a@b.com' } }, f.deps);
  assert.deepEqual(r, { status: 200, body: { client_secret: 'cs_secret_x', student: false } });
  assert.deepEqual(f.only('createCustomer')[0][1], { email: 'a@b.com', metadata: { user_id: 'u1' } });
  assert.deepEqual(f.only('linkCustomer')[0], ['linkCustomer', 'u1', 'cus_NEW']);
  assert.equal(f.only('createCheckoutSession')[0][1].line_items[0].price, 'price_15');
  f = fakes({ customer: 'cus_OLD' });
  const s = await createCheckout({ user: { id: 'u2', email: 'b@uni.ac.uk' }, origin: 'https://evil.com' }, f.deps);
  assert.equal(s.body.student, true);
  assert.equal(f.only('createCustomer').length, 0, 'an existing customer is reused');
  const params = f.only('createCheckoutSession')[0][1];
  assert.equal(params.customer, 'cus_OLD'); assert.equal(params.line_items[0].price, 'price_9'); assert.equal(params.metadata.plan, 'student_monthly');
  assert.match(params.return_url, /^https:\/\/hotkey\.gg\//, 'an unknown origin returns to the site');
  assert.equal((await createCheckout({ user: { id: 'u' }, input: { plan: 'lifetime' } }, fakes().deps)).status, 400);
  const broken = fakes(); broken.deps.stripe.createCheckoutSession = async () => { throw new Error('sk_test_SECRET leaked?'); };
  const err = await createCheckout({ user: { id: 'u', email: 'a@b.com' } }, broken.deps);
  assert.deepEqual(err, { status: 500, body: { error: 'checkout_failed' } }, 'no Stripe internals in the answer');
});

test('billing-portal: 404 without a customer; the cancel flow lands on the live subscription', async () => {
  assert.deepEqual(await billingPortal({ user: { id: 'u1' } }, fakes().deps), { status: 404, body: { error: 'no_customer' } });
  let f = fakes({ customer: 'cus_1', subs: { a: sub('sub_old', { status: 'canceled' }), b: sub('sub_live'), t: sub('sub_team', { metadata: { plan: 'team' } }) } });
  const r = await billingPortal({ user: { id: 'u1' }, input: { flow: 'cancel' } }, f.deps);
  assert.equal(r.status, 200); assert.match(r.body.url, /^https:\/\/billing\.stripe\.com/);
  const p = f.only('createPortalSession')[0][1];
  assert.equal(p.flow_data.type, 'subscription_cancel');
  assert.equal(p.flow_data.subscription_cancel.subscription, 'sub_live');
  assert.equal(p.return_url, 'https://hotkey.gg/?billing=done');
  f = fakes({ customer: 'cus_1', subs: { b: sub('sub_live') } });
  await billingPortal({ user: { id: 'u1' } }, f.deps);
  assert.equal('flow_data' in f.only('createPortalSession')[0][1], false, 'Manage billing opens the portal home');
});

test('webhook: a completed checkout grants the subscription to period end plus grace', async () => {
  const f = fakes({ subs: { sub_1: sub('sub_1') } });
  const out = await handleEvent(ev('checkout.session.completed', { id: 'cs_1', mode: 'subscription', payment_status: 'paid', client_reference_id: 'u1', customer: 'cus_1', subscription: 'sub_1' }), f.deps);
  assert.equal(out, 'granted');
  assert.deepEqual(f.only('grant')[0], ['grant', 'u1', 'sub_1', 'monthly', '2026-11-04T12:00:00.000Z', null, true]);
  // unpaid (an async method still pending) grants nothing; async success grants
  const g = fakes({ subs: { sub_1: sub('sub_1') } });
  assert.equal(await handleEvent(ev('checkout.session.completed', { payment_status: 'unpaid', client_reference_id: 'u1', subscription: 'sub_1' }), g.deps), 'awaiting_payment');
  assert.equal(await handleEvent(ev('checkout.session.async_payment_succeeded', { payment_status: 'paid', client_reference_id: 'u1', subscription: 'sub_1' }), g.deps), 'granted');
  assert.equal(await handleEvent(ev('checkout.session.async_payment_failed', { id: 'cs' }), g.deps), 'logged');
  assert.equal(g.only('grant').length, 1);
});

test('webhook: a manual Teams link is never granted automatically', async () => {
  const f = fakes({ subs: { sub_t: sub('sub_t', { metadata: { plan: 'team' } }) } });
  assert.equal(await handleEvent(ev('checkout.session.completed', { payment_status: 'paid', subscription: 'sub_t' }), f.deps), 'skipped_no_user');
  assert.equal(await handleEvent(ev('invoice.paid', { parent: { subscription_details: { subscription: 'sub_t' } } }), f.deps), 'team');
  assert.equal(await handleEvent(ev('customer.subscription.updated', sub('sub_t', { metadata: {}, status: 'active', cancel_at_period_end: true, items: { data: [{ current_period_end: PERIOD_END, quantity: 7 }] } })), f.deps), 'team');
  assert.deepEqual(f.only('alert')[0], ['alert', 'team_subscription_changed', 'sub_t', { status: 'active', quantity: 7, cancel_at_period_end: true }]);
  assert.equal(await handleEvent(ev('customer.subscription.deleted', sub('sub_t', { metadata: { plan: 'team' }, status: 'canceled' })), f.deps), 'team');
  assert.equal(f.only('alert')[1][1], 'team_subscription_ended');
  assert.equal(f.only('grant').length + f.only('end').length, 0);
});

test('webhook: renewals extend; statuses map to grant, leave or end', async () => {
  const f = fakes({ subs: { sub_1: sub('sub_1') } });
  assert.equal(await handleEvent(ev('invoice.paid', { parent: { subscription_details: { subscription: 'sub_1' } } }), f.deps), 'granted');
  assert.equal(await handleEvent(ev('invoice.paid', { subscription: 'sub_1' }), f.deps), 'granted', 'the older invoice shape too');
  assert.equal(await handleEvent(ev('invoice.paid', { id: 'in_oneoff' }), f.deps), 'ignored');
  assert.equal(await handleEvent(ev('invoice.payment_failed', { id: 'in_x' }), f.deps), 'logged');
  assert.equal(f.only('grant').length, 2);
  for (const [status, want] of [['active', 'granted'], ['trialing', 'granted'], ['past_due', 'unchanged'], ['incomplete', 'unchanged'], ['unpaid', 'ended'], ['canceled', 'ended'], ['incomplete_expired', 'ended']]) {
    const g = fakes();
    assert.equal(await handleEvent(ev('customer.subscription.updated', sub('sub_1', { status })), g.deps), want, status);
    if (want === 'ended') assert.deepEqual(g.only('end')[0], ['end', 'sub_1', new Date(NOW).toISOString()]);
  }
  // cancel at period end needs nothing beyond keeping the row to period end + grace
  const c = fakes();
  assert.equal(await handleEvent(ev('customer.subscription.updated', sub('sub_1', { cancel_at_period_end: true })), c.deps), 'granted');
  assert.equal(c.only('end').length, 0);
  assert.equal(c.only('grant')[0][6], false, 'the row records that it will not renew');
  const d = fakes();
  assert.equal(await handleEvent(ev('customer.subscription.deleted', sub('sub_1', { status: 'canceled' })), d.deps), 'ended');
  // a subscription without user metadata falls back to the customer link; unmatched raises an alert
  const m = fakes({ customers: { cus_9: 'u9' } });
  await handleEvent(ev('customer.subscription.updated', sub('sub_9', { customer: 'cus_9', metadata: { plan: 'monthly' } })), m.deps);
  assert.equal(m.only('grant')[0][1], 'u9');
  const u = fakes();
  assert.equal(await handleEvent(ev('customer.subscription.updated', sub('sub_8', { customer: 'cus_8', metadata: { plan: 'monthly' } })), u.deps), 'unmatched');
  assert.equal(u.only('alert')[0][1], 'subscription_unmatched');
});

test('webhook: a full refund or a dispute revokes and cancels; a partial refund changes nothing', async () => {
  const f = fakes({ customers: { cus_1: 'u1' }, subs: { a: sub('sub_1'), b: sub('sub_gone', { status: 'canceled' }) } });
  assert.equal(await handleEvent(ev('charge.refunded', { id: 'ch_1', customer: 'cus_1', amount: 1500, amount_refunded: 1500, refunded: true }), f.deps), 'revoked');
  assert.deepEqual(f.only('revokeUser')[0], ['revokeUser', 'u1', 'refund']);
  assert.deepEqual(f.only('cancelSubscription').map(c => c[1]), ['sub_1'], 'only the live subscription is cancelled');
  const p = fakes({ customers: { cus_1: 'u1' } });
  assert.equal(await handleEvent(ev('charge.refunded', { id: 'ch_2', customer: 'cus_1', amount: 1500, amount_refunded: 500, refunded: false }), p.deps), 'partial');
  assert.equal(p.only('revokeUser').length + p.only('cancelSubscription').length, 0);
  const n = fakes();
  assert.equal(await handleEvent(ev('charge.refunded', { id: 'ch_3', customer: 'cus_x', amount: 900, amount_refunded: 900, refunded: true }), n.deps), 'unmatched');
  assert.deepEqual(n.only('alert')[0], ['alert', 'refund_unmatched', 'ch_3', { customer: 'cus_x' }]);
  const d = fakes({ customers: { cus_1: 'u1' }, charges: { ch_9: { id: 'ch_9', customer: 'cus_1' } }, subs: { a: sub('sub_1') } });
  assert.equal(await handleEvent(ev('charge.dispute.created', { id: 'dp_1', charge: 'ch_9' }), d.deps), 'revoked');
  assert.deepEqual(d.only('revokeUser')[0], ['revokeUser', 'u1', 'dispute']);
  assert.equal(d.only('cancelSubscription').length, 1);
});

test('webhook: replays are skipped, failures answer 500 so Stripe retries, unknown events are acknowledged', async () => {
  const f = fakes({ processed: ['evt_dup'], subs: { sub_1: sub('sub_1') } });
  const dup = await processWebhook(ev('invoice.paid', { subscription: 'sub_1' }, 'evt_dup'), f.deps);
  assert.deepEqual(dup, { status: 200, body: { received: true, duplicate: true } });
  assert.equal(f.only('grant').length, 0, 'a replay changes nothing');
  const ok = await processWebhook(ev('invoice.paid', { subscription: 'sub_1' }, 'evt_new'), f.deps);
  assert.equal(ok.status, 200); assert.equal(ok.body.outcome, 'granted');
  assert.deepEqual(f.only('eventDone')[0], ['eventDone', 'evt_new']);
  const b = fakes({ subs: { sub_1: sub('sub_1') } }); b.deps.db.grant = async () => { throw new Error('db down'); };
  const fail = await processWebhook(ev('invoice.paid', { subscription: 'sub_1' }, 'evt_f'), b.deps);
  assert.equal(fail.status, 500); assert.equal(b.only('eventDone').length, 0, 'not marked processed, so the retry handles it');
  assert.equal((await processWebhook(ev('customer.created', { id: 'cus_1' }), fakes().deps)).body.outcome, 'ignored');
  assert.equal((await processWebhook({}, fakes().deps)).status, 400);
});
