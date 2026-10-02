// app2/supabase/functions/_shared/adapters.ts — the real adapters behind billing.js: one Stripe
// client (pinned API version, fetch HTTP client, no global key) and the service-role database
// client. The only file that talks to Stripe or the database; tests replace it with fakes.
// Secrets come from Edge Function secrets only (Wolf sets them in the dashboard): STRIPE_SECRET_KEY,
// STRIPE_WEBHOOK_SECRET, SITE_URL, optional RETURN_ORIGINS and STRIPE_MANAGED_PAYMENTS.
import Stripe from 'npm:stripe@22';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { API_VERSION } from './billing.js';

export function env() {
  return {
    siteUrl: Deno.env.get('SITE_URL') || 'https://hotkey.gg',
    returnOrigins: Deno.env.get('RETURN_ORIGINS') || '',
    managedPayments: (Deno.env.get('STRIPE_MANAGED_PAYMENTS') || 'true') !== 'false',
  };
}

export function stripeClient(): Stripe {
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  // deno-lint-ignore no-explicit-any
  return new Stripe(key, { apiVersion: API_VERSION as any, httpClient: Stripe.createFetchHttpClient() });
}

export function adminClient() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** The signed-in user behind the request's bearer token, or null. */
export async function userFromRequest(req: Request, admin = adminClient()) {
  const h = req.headers.get('Authorization') || '';
  const jwt = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!jwt) return null;
  const { data, error } = await admin.auth.getUser(jwt);
  if (error || !data || !data.user) return null;
  return { id: data.user.id, email: data.user.email || '' };
}

export function stripeAdapter(stripe = stripeClient()) {
  return {
    async createCustomer(p: { email?: string; metadata: Record<string, string> }) { return (await stripe.customers.create(p)).id; },
    async priceByLookupKey(key: string) {
      const list = await stripe.prices.list({ lookup_keys: [key], active: true, limit: 1 });
      return list.data[0] ? list.data[0].id : null;
    },
    // deno-lint-ignore no-explicit-any
    async createCheckoutSession(p: any) { return await stripe.checkout.sessions.create(p); },
    async retrieveSubscription(id: string) { return await stripe.subscriptions.retrieve(id); },
    async listSubscriptions(customer: string) { return (await stripe.subscriptions.list({ customer, status: 'all', limit: 20 })).data; },
    async cancelSubscription(id: string) { return await stripe.subscriptions.cancel(id); },
    async retrieveCharge(id: string) { return await stripe.charges.retrieve(id); },
    // deno-lint-ignore no-explicit-any
    async createPortalSession(p: any) { return await stripe.billingPortal.sessions.create(p); },
  };
}

const isLive = (r: { starts_at: string; ends_at: string | null }, now = Date.now()) =>
  Date.parse(r.starts_at) <= now && (r.ends_at === null || Date.parse(r.ends_at) > now);

// deno-lint-ignore no-explicit-any
async function rpc(admin: any, fn: string, args: Record<string, unknown>) {
  const { data, error } = await admin.rpc(fn, args);
  if (error) throw new Error(fn + ': ' + error.message);
  return data;
}

export function dbAdapter(admin = adminClient()) {
  return {
    async activeCheckout(uid: string) {
      const { data, error } = await admin.from('entitlements').select('starts_at, ends_at').eq('user_id', uid).eq('source', 'checkout');
      if (error) throw new Error(error.message);
      return (data || []).some(r => isLive(r));
    },
    async customerFor(uid: string) {
      const { data, error } = await admin.from('billing_customers').select('stripe_customer_id').eq('user_id', uid).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? data.stripe_customer_id : null;
    },
    async userForCustomer(cus: string) {
      if (!cus) return null;
      const { data, error } = await admin.from('billing_customers').select('user_id').eq('stripe_customer_id', cus).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? data.user_id : null;
    },
    linkCustomer: (uid: string, cus: string) => rpc(admin, 'billing_link_customer', { p_user: uid, p_customer: cus }),
    grant: (uid: string, ref: string, plan: string, endsAt: string, note: string | null, renews: boolean | null) => rpc(admin, 'billing_grant', { p_user: uid, p_ref: ref, p_plan: plan, p_ends_at: endsAt, p_note: note, p_renews: renews }),
    end: (ref: string, endsAt: string) => rpc(admin, 'billing_end', { p_ref: ref, p_ends_at: endsAt }),
    revokeUser: (uid: string, note: string) => rpc(admin, 'billing_revoke_user', { p_user: uid, p_note: note }),
    alert: (kind: string, ref: string, detail: unknown) => rpc(admin, 'billing_alert', { p_kind: kind, p_ref: ref, p_detail: detail || {} }),
    eventBegin: (id: string, type: string) => rpc(admin, 'billing_event_begin', { p_id: id, p_type: type }),
    eventDone: (id: string) => rpc(admin, 'billing_event_done', { p_id: id }),
  };
}

export function deps(stripe = stripeAdapter(), db = dbAdapter()) {
  return { stripe, db, env: env(), now: () => Date.now(), log: (msg: string, detail?: unknown) => console.log(msg, detail === undefined ? '' : JSON.stringify(detail)) };
}

export function respond(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
}
