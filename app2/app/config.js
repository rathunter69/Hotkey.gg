// app2/app/config.js — the Supabase project this build talks to. Publishable values ONLY:
// the URL and the publishable (anon) key are safe in client code by design; service-role or
// any secret key must never appear here (CLAUDE.md). Empty strings = guest-only mode: every
// account feature quietly disables and the site behaves exactly as before Phase B.
export const SUPABASE_URL = 'https://wepejasrnskvftgnnecr.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable__mSqNf5oG-y4MpXnbYShnQ_8MlO8Idj';

// Phase E checkout (docs/phases/E-checkout.md). The Stripe PUBLISHABLE key is public by design: it
// can mount Stripe's checkout form and nothing else. It is the one Stripe value allowed in client
// code (CLAUDE.md); a secret (sk_…) or restricted (rk_…) key never goes here. Sandbox until Wolf
// says go live, when the live publishable key replaces it (brief section 9).
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51ULsWEDG83fIBduGsZTvM3ckPp0wymYL6qQ1Hzu8CSnIclhxEbQqEWuXc8nS4BxsniEy9pOl2YrJypSpixrEHeof0094PCgcSX';
/** Where Stripe.js loads from: Stripe requires its own host; it can't be bundled. */
export const STRIPE_JS_URL = 'https://js.stripe.com/dahlia/stripe.js';   // the Stripe.js release that matches API version 2026-08-26.dahlia
/** The support address on the checkout pages (Link escalations must be answered within 48 hours). */
export const SUPPORT_EMAIL = 'support@hotkey.gg';

/** The production hosts: the `payments` flag is off here until Wolf says go. */
export const PRODUCTION_HOSTS = ['hotkey.gg', 'www.hotkey.gg'];
const FLAG_KEY = 'hk2_flag_payments';

/**
 * Is checkout switched on for this host? Pure. Off on hotkey.gg whatever anyone sets; on for the
 * preview deployments (*.pages.dev) and a local server; off anywhere else. Off a production host, a
 * stored override ('1' or '0', for tests and screenshots) wins.
 */
export function paymentsFlag(host, override = null) {
  const h = String(host || '').toLowerCase();
  if (PRODUCTION_HOSTS.includes(h)) return false;
  if (override === '1') return true;
  if (override === '0') return false;
  return h.endsWith('.pages.dev') || h === 'localhost' || h === '127.0.0.1';
}

/** The flag for this page. */
export function paymentsOn() {
  let host = '', override = null;
  try { host = globalThis.location ? globalThis.location.hostname : ''; } catch (e) { host = ''; }
  try { override = globalThis.localStorage ? globalThis.localStorage.getItem(FLAG_KEY) : null; } catch (e) { override = null; }
  return paymentsFlag(host, override);
}
