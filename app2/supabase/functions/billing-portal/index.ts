// billing-portal (JWT required): a Customer Portal session for the signed-in user. Input
// { flow?: 'cancel' }: with 'cancel' and a live subscription it lands straight on the cancel
// confirmation. Returns { url }, or 404 { error: 'no_customer' } for someone who never subscribed.
// Logic: ../_shared/billing.js (billingPortal).
import { billingPortal, corsHeaders } from '../_shared/billing.js';
import { readJsonInput } from '../_shared/http.js';
import { deps, env, respond, userFromRequest, adminClient } from '../_shared/adapters.ts';

Deno.serve(async (req: Request) => {
  const e = env();
  const cors = corsHeaders(req.headers.get('Origin') || '', e.siteUrl, e.returnOrigins);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return respond(405, { error: 'method' }, cors);
  const body = await readJsonInput(req);   // capped at BODY_LIMITS.json: 413 past it
  if (!body.ok) return respond(413, { error: 'too_large' }, cors);
  const input = body.input;
  const user = await userFromRequest(req, adminClient());
  const out = await billingPortal({ user, input, origin: req.headers.get('Origin') || '' }, deps());
  return respond(out.status, out.body, cors);
});
