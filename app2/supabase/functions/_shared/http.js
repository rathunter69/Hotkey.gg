// app2/supabase/functions/_shared/http.js — the request guards every edge function runs before its
// logic (liability checklist, Security): a cap on the body size, and the webhook's signature gate.
// Plain JS on web-standard Request and streams, so Deno runs it and the node check
// (app2/tests/security.test.js) drives it with real Request objects and no network.

/** Body caps in bytes. A checkout or portal call sends a few dozen bytes of JSON; a Stripe event is a
 * few kilobytes (a subscription with many items stays far under the webhook cap). */
export const BODY_LIMITS = { json: 8 * 1024, webhook: 512 * 1024 };

/**
 * The request body as text, refused past `max` bytes. The declared Content-Length is checked first,
 * then the stream is read and cut off as soon as it passes the cap, so a lying or missing header
 * cannot get a large body buffered. Resolves { ok: true, text } or { ok: false, status: 413 }.
 */
export async function readBody(req, max) {
  const declared = Number(req.headers.get('Content-Length'));
  if (Number.isFinite(declared) && declared > max) return { ok: false, status: 413 };
  if (!req.body) return { ok: true, text: '' };
  const reader = req.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) { try { await reader.cancel(); } catch (e) { /* already closed */ } return { ok: false, status: 413 }; }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) { all.set(c, at); at += c.byteLength; }
  return { ok: true, text: new TextDecoder().decode(all) };
}

/** A browser-called function's JSON input under the cap: { ok, input } (bad JSON reads as {}), or { ok: false, status: 413 }. */
export async function readJsonInput(req, max = BODY_LIMITS.json) {
  const b = await readBody(req, max);
  if (!b.ok) return b;
  let input = {};
  try { input = b.text ? JSON.parse(b.text) : {}; } catch (e) { input = {}; }
  if (!input || typeof input !== 'object' || Array.isArray(input)) input = {};
  return { ok: true, input };
}

/**
 * The Stripe webhook's gate: POST only, the body under the cap, a Stripe-Signature header and a
 * configured secret, then `construct(rawBody, signature, secret)`: Stripe's own verifier
 * (constructEventAsync), which checks the HMAC on the raw bytes and the timestamp tolerance, so a
 * replayed old delivery fails too. Every refusal is logged as a security event (no secret, no body).
 * Resolves { ok: true, event } or { ok: false, status, body }.
 */
export async function verifyWebhook(req, { secret, construct, log = () => {}, max = BODY_LIMITS.webhook }) {
  const refuse = (status, error, reason) => { log('security: webhook refused', { reason, status }); return { ok: false, status, body: { error } }; };
  if (req.method !== 'POST') return refuse(405, 'method', 'method ' + req.method);
  const sig = req.headers.get('Stripe-Signature');
  if (!secret) return refuse(400, 'signature', 'no webhook secret configured');
  if (!sig) return refuse(400, 'signature', 'no signature header');
  const b = await readBody(req, max);
  if (!b.ok) return refuse(413, 'too_large', 'body over ' + max + ' bytes');
  try {
    const event = await construct(b.text, sig, secret);
    if (!event || !event.id || !event.type) return refuse(400, 'signature', 'verifier returned no event');
    return { ok: true, event };
  } catch (e) {
    return refuse(400, 'signature', 'signature did not verify');
  }
}
