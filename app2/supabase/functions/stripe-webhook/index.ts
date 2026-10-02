// stripe-webhook (no JWT: deploy with --no-verify-jwt; config.toml says so too). Verifies the
// signature on the raw body, then ../_shared/billing.js (processWebhook) records the event id,
// handles it idempotently and marks it processed. 400 on a bad signature, 500 on a handler error
// so Stripe retries, 200 otherwise (a replay of a processed event included).
import Stripe from 'npm:stripe@22';
import { processWebhook } from '../_shared/billing.js';
import { deps, respond, stripeClient, stripeAdapter } from '../_shared/adapters.ts';

const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return respond(405, { error: 'method' });
  const sig = req.headers.get('Stripe-Signature');
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!sig || !secret) return respond(400, { error: 'signature' });
  const body = await req.text();
  const stripe = stripeClient();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, secret, undefined, cryptoProvider);
  } catch (_) {
    return respond(400, { error: 'signature' });
  }
  const out = await processWebhook(event, deps(stripeAdapter(stripe)));
  return respond(out.status, out.body);
});
