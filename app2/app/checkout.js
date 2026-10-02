// app2/app/checkout.js — the processor-agnostic checkout client (Phase E; docs/phases/E-checkout.md).
// The pages ask this file for a payment session and a mounted form; which processor serves them is
// config (CHECKOUT_PROCESSOR) and a registry of adapters under app/processors/, each loaded only when
// a form is shown. Entitlements are already processor-agnostic on the server (the webhook writes
// the same rows an admin grant or a redeem code writes); this is the same idea on the client.
// Behind the `payments` flag: nothing here runs on hotkey.gg until Wolf says go.
//
//   registerProcessor(id, loader)    add or replace an adapter (tests use a fake)
//   processorFor(id)                 the adapter module's default export, loaded once
//   beginCheckout(start)             { session, student } | { error }; start defaults to billing.startCheckout
//   mountPaymentForm(el, session, o) { destroy } | null; the adapter named by session.processor
import { CHECKOUT_PROCESSOR } from './config.js';

const LOADERS = new Map([['stripe', () => import('./processors/stripe.js')]]);
const loaded = new Map();

/** An adapter: { id, mount(el, session, { alive }) → { destroy } | null }. */
export function registerProcessor(id, loader) {
  if (!id || typeof loader !== 'function') throw new Error('processor needs an id and a loader');
  LOADERS.set(id, loader); loaded.delete(id);
}

export const processorIds = () => [...LOADERS.keys()];

export async function processorFor(id = CHECKOUT_PROCESSOR) {
  if (loaded.has(id)) return loaded.get(id);
  const loader = LOADERS.get(id);
  if (!loader) throw new Error('unknown processor: ' + id);
  const mod = await loader();
  const p = mod && (mod.default || mod);
  if (!p || typeof p.mount !== 'function') throw new Error('processor without mount: ' + id);
  loaded.set(id, p);
  return p;
}

/**
 * Ask the server for a payment session. start() is the server call (billing.startCheckout:
 * create-checkout under the user's session); its answer becomes a session tagged with the
 * processor that will mount it. Errors pass through as codes.
 */
export async function beginCheckout(start, id = CHECKOUT_PROCESSOR) {
  const go = start || (await import('./billing.js')).startCheckout;
  const r = await go();
  if (!r || r.error) return r || { error: 'failed' };
  if (!r.clientSecret) return { error: 'failed' };
  return { session: { processor: id, clientSecret: r.clientSecret }, student: !!r.student };
}

/** Mount the session's payment form into el. */
export async function mountPaymentForm(el, session, opts = {}) {
  const p = await processorFor((session && session.processor) || CHECKOUT_PROCESSOR);
  return p.mount(el, session, opts);
}
