// create-checkout (JWT required): an embedded Checkout Session for the signed-in user, at the
// student price when their email is on a school domain. Returns { client_secret, student }, or
// { error } with no Stripe internals. Logic: ../_shared/billing.js (createCheckout).
import { createCheckout, corsHeaders } from '../_shared/billing.js';
import { deps, env, respond, userFromRequest, adminClient } from '../_shared/adapters.ts';

Deno.serve(async (req: Request) => {
  const e = env();
  const cors = corsHeaders(req.headers.get('Origin') || '', e.siteUrl, e.returnOrigins);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return respond(405, { error: 'method' }, cors);
  let input = {};
  try { input = await req.json(); } catch (_) { input = {}; }
  const admin = adminClient();
  const user = await userFromRequest(req, admin);
  const out = await createCheckout({ user, input, origin: req.headers.get('Origin') || '' }, deps());
  return respond(out.status, out.body, cors);
});
