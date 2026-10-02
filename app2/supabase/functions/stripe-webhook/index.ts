// stripe-webhook (no JWT: deploy with --no-verify-jwt; config.toml says so too). ../_shared/http.js
// (verifyWebhook) caps the body and verifies Stripe's signature on the raw bytes, logging every
// refusal; then ../_shared/billing.js (processWebhook) records the event id, handles it idempotently
// and marks it processed. 400 on a bad signature, 413 on an oversized body, 500 on a handler error
// so Stripe retries, 200 otherwise (a replay of a processed event included). Called by Stripe's
// servers, never a browser, so it sends no CORS headers.
import Stripe from 'npm:stripe@22';
import { processWebhook } from '../_shared/billing.js';
import { verifyWebhook } from '../_shared/http.js';
import { deps, respond, stripeClient, stripeAdapter } from '../_shared/adapters.ts';

const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req: Request) => {
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
  const stripe = req.method === 'POST' && secret ? stripeClient() : null;
  const gate = await verifyWebhook(req, {
    secret,
    construct: (body: string, sig: string, key: string) => stripe!.webhooks.constructEventAsync(body, sig, key, undefined, cryptoProvider),
    log: (msg: string, detail?: unknown) => console.warn(msg, JSON.stringify(detail ?? {})),
  });
  if (!gate.ok) return respond(gate.status, gate.body);
  const out = await processWebhook(gate.event, deps(stripeAdapter(stripe!)));
  return respond(out.status, out.body);
});
