#!/usr/bin/env node
// app2/supabase/scripts/stripe-setup.mjs — make a Stripe account match docs/phases/E-checkout.md
// section 3 (the sandbox table in 3a), creating only what is missing. Idempotent: run it twice and
// the second run changes nothing. Used for go-live (section 9, step 1): Wolf runs it once against
// the live account, only when he says go.
//
//   STRIPE_SECRET_KEY=sk_test_… node app2/supabase/scripts/stripe-setup.mjs            (sandbox)
//   STRIPE_SECRET_KEY=sk_live_… node app2/supabase/scripts/stripe-setup.mjs --live     (live: the flag is required)
//   … --dry-run      says what it would create or update, and changes nothing
//
// Optional environment: PAYMENT_DOMAINS (comma list, default "hotkey.gg"; add a preview domain
// here), WEBHOOK_URL (default the project's stripe-webhook function), SITE_URL (default
// https://hotkey.gg). The key is read from the environment only and never printed; nor is the
// webhook's signing secret (reveal it in the Stripe Dashboard and paste it into Supabase secrets).
// No dependencies: Stripe's REST API over fetch.

const API_VERSION = '2026-08-26.dahlia';
const KEY = process.env.STRIPE_SECRET_KEY || '';
const LIVE = process.argv.includes('--live');
const DRY = process.argv.includes('--dry-run');
const SITE = (process.env.SITE_URL || 'https://hotkey.gg').replace(/\/+$/, '');
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://wepejasrnskvftgnnecr.supabase.co/functions/v1/stripe-webhook';
const DOMAINS = (process.env.PAYMENT_DOMAINS || 'hotkey.gg').split(',').map(s => s.trim()).filter(Boolean);
const TAX_CODE = 'txcd_20060058';
const EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed',
  'invoice.paid', 'invoice.payment_failed', 'customer.subscription.updated', 'customer.subscription.deleted', 'charge.refunded', 'charge.dispute.created'];
const PRODUCTS = [
  { plan: 'monthly', name: 'hotkey.gg Full Access', prices: [{ lookup: 'hk_monthly', amount: 1500 }, { lookup: 'hk_monthly_student', amount: 900 }] },
  { plan: 'team', name: 'hotkey.gg Team Seat', prices: [{ lookup: 'hk_team_seat_monthly', amount: 1200 }] },
];

if (!KEY) { console.error('Set STRIPE_SECRET_KEY in the environment.'); process.exit(1); }
const live = /^(sk|rk)_live_/.test(KEY);
if (live && !LIVE) { console.error('That is a live key. Re-run with --live, and only when Wolf has said go.'); process.exit(1); }
if (!live && LIVE) { console.error('--live given with a test key.'); process.exit(1); }

/** Stripe's form encoding: nested objects and arrays as a[b][0]=c. */
function form(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((x, i) => (typeof x === 'object' ? form(x, `${key}[${i}]`, out) : out.append(`${key}[${i}]`, String(x))));
    else if (typeof v === 'object') form(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

async function stripe(method, path, params) {
  const url = 'https://api.stripe.com/v1' + path + (method === 'GET' && params ? '?' + form(params) : '');
  const res = await fetch(url, {
    method,
    headers: { Authorization: 'Bearer ' + KEY, 'Stripe-Version': API_VERSION, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: method === 'GET' ? undefined : form(params || {}),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${method} ${path}: ${body.error ? body.error.message : res.status}`);
  return body;
}
async function write(what, method, path, params) {
  if (DRY) { console.log(`would ${what}`); return { id: '(dry run)' }; }
  const r = await stripe(method, path, params);
  console.log(`${what}: ${r.id}`);
  return r;
}

const table = [];

// ---- products and prices, found by metadata and lookup key
const products = (await stripe('GET', '/products', { limit: 100, active: true })).data;
for (const p of PRODUCTS) {
  let prod = products.find(x => x.metadata && x.metadata.plan === p.plan);
  if (!prod) prod = await write(`create product "${p.name}"`, 'POST', '/products', { name: p.name, tax_code: TAX_CODE, metadata: { plan: p.plan } });
  else if (prod.tax_code !== TAX_CODE && !(prod.tax_code && prod.tax_code.id === TAX_CODE)) await write(`set the tax code on ${prod.id}`, 'POST', `/products/${prod.id}`, { tax_code: TAX_CODE });
  table.push([`Product "${p.name}"`, prod.id]);
  for (const pr of p.prices) {
    const found = (await stripe('GET', '/prices', { lookup_keys: [pr.lookup], active: true, limit: 1 })).data[0];
    let price = found;
    if (found && (found.unit_amount !== pr.amount || found.currency !== 'usd' || !found.recurring || found.recurring.interval !== 'month')) {
      console.error(`price ${found.id} holds ${pr.lookup} but is not $${pr.amount / 100} a month; fix it by hand (prices cannot be edited)`);
      process.exitCode = 1;
    }
    if (!price) price = await write(`create price ${pr.lookup}`, 'POST', '/prices', { product: prod.id, currency: 'usd', unit_amount: pr.amount, recurring: { interval: 'month' }, tax_behavior: 'exclusive', lookup_key: pr.lookup, transfer_lookup_key: true });
    table.push([`Price $${(pr.amount / 100).toFixed(2)} a month`, `${price.id} (${pr.lookup})`]);
    if (pr.lookup === 'hk_monthly' && !DRY && prod.default_price !== price.id && (!prod.default_price || prod.default_price.id !== price.id)) await write(`set ${pr.lookup} as the default price`, 'POST', `/products/${prod.id}`, { default_price: price.id });
  }
}

// ---- Customer Portal: cancel at period end with a reason, payment method, invoices; nothing else
const portal = {
  business_profile: { privacy_policy_url: SITE + '/privacy.html', terms_of_service_url: SITE + '/terms.html' },
  default_return_url: SITE + '/?billing=done',
  features: {
    customer_update: { enabled: false },
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: { enabled: true, mode: 'at_period_end', proration_behavior: 'none', cancellation_reason: { enabled: true, options: ['too_expensive', 'missing_features', 'switched_service', 'unused', 'other'] } },
    subscription_update: { enabled: false },
  },
};
const configs = (await stripe('GET', '/billing_portal/configurations', { limit: 100 })).data;
const def = configs.find(c => c.is_default && c.active);
if (def) { await write(`update the default portal configuration`, 'POST', `/billing_portal/configurations/${def.id}`, portal); table.push(['Customer Portal configuration', def.id]); }
else {
  const c = await write('create a portal configuration', 'POST', '/billing_portal/configurations', portal);
  table.push(['Customer Portal configuration', c.id]);
  console.warn('No default portal configuration existed: open Settings > Billing > Customer portal in the Dashboard once and save, so the new one is the default.');
}

// ---- payment method domains (Apple Pay, Link)
const domains = (await stripe('GET', '/payment_method_domains', { limit: 100 })).data;
for (const d of DOMAINS) {
  let row = domains.find(x => x.domain_name === d);
  if (!row) row = await write(`register payment method domain ${d}`, 'POST', '/payment_method_domains', { domain_name: d, enabled: true });
  table.push([`Payment method domain ${d}`, row.id]);
}

// ---- the webhook endpoint, on the pinned API version with the nine events
const hooks = (await stripe('GET', '/webhook_endpoints', { limit: 100 })).data;
const hook = hooks.find(h => h.url === WEBHOOK_URL);
if (!hook) {
  const h = await write(`create webhook endpoint ${WEBHOOK_URL}`, 'POST', '/webhook_endpoints', { url: WEBHOOK_URL, api_version: API_VERSION, enabled_events: EVENTS, description: 'hotkey.gg entitlements' });
  table.push(['Webhook endpoint', h.id]);
  if (!DRY) console.log('Reveal the new endpoint\'s signing secret in the Dashboard and set it as STRIPE_WEBHOOK_SECRET in Supabase.');
} else {
  const missing = EVENTS.filter(e => !hook.enabled_events.includes(e));
  const extra = hook.enabled_events.filter(e => !EVENTS.includes(e));
  if (missing.length || extra.length) await write(`set the endpoint's nine events`, 'POST', `/webhook_endpoints/${hook.id}`, { enabled_events: EVENTS });
  if (hook.api_version && hook.api_version !== API_VERSION) console.warn(`The endpoint is on API version ${hook.api_version}; it must be ${API_VERSION}. The version can't be changed: delete the endpoint in the Dashboard and re-run.`);
  table.push(['Webhook endpoint', hook.id]);
}

console.log(`\n${live ? 'Live' : 'Sandbox'} state${DRY ? ' (dry run)' : ''}:\n`);
console.log('| Object | ID |\n|---|---|');
for (const [a, b] of table) console.log(`| ${a} | \`${b}\` |`);
