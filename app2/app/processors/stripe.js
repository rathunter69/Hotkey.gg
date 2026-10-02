// app2/app/processors/stripe.js — the Stripe adapter behind checkout.js (docs/phases/E-checkout.md).
// The only client file that knows Stripe: it loads Stripe.js from Stripe's host, starts it with the
// PUBLISHABLE key (config.js, the one Stripe value allowed in client code) and mounts the embedded
// form for the session create-checkout made. It holds no secret and grants nothing: fulfilment is
// the webhook's job. Swapping the processor means a sibling of this file, not a change to the pages.
import { STRIPE_JS_URL, STRIPE_PUBLISHABLE_KEY } from '../config.js';

let load = null;
/** window.Stripe, the script added once. */
export function loadStripe(doc = globalThis.document) {
  if (typeof window !== 'undefined' && window.Stripe) return Promise.resolve(window.Stripe);
  if (load) return load;
  load = new Promise((resolve, reject) => {
    const s = doc.createElement('script');
    s.src = STRIPE_JS_URL; s.async = true;
    s.onload = () => (window.Stripe ? resolve(window.Stripe) : reject(new Error('Stripe.js loaded without Stripe')));
    s.onerror = () => { load = null; s.remove(); reject(new Error('Stripe.js did not load')); };
    doc.head.appendChild(s);
  });
  return load;
}

export default {
  id: 'stripe',
  /** The receipt line's processor name (copy keys stay on the page). */
  name: 'Stripe',
  /**
   * Mount the embedded payment form for a session into el. session: { clientSecret }.
   * alive(): false once the page has gone, so a late form is destroyed, never shown.
   * Resolves { destroy } or null when the page went away first.
   */
  async mount(el, session, { alive = () => true } = {}) {
    const StripeCtor = await loadStripe();
    if (!alive()) return null;
    const stripe = StripeCtor(STRIPE_PUBLISHABLE_KEY);
    // Stripe.js names the embedded form's constructor initEmbeddedCheckout; a newer release may call it createEmbeddedCheckoutPage
    const init = stripe.initEmbeddedCheckout || stripe.createEmbeddedCheckoutPage;
    const form = await init.call(stripe, { fetchClientSecret: async () => session.clientSecret });
    if (!alive()) { form.destroy(); return null; }
    el.innerHTML = '';
    form.mount(el);
    return { destroy() { try { form.destroy(); } catch (e) { /* already gone */ } } };
  },
};
