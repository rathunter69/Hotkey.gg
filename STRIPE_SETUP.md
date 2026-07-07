# Stripe paywall — TEST MODE scaffold (do NOT go live during the internship)

What exists now:
- entitlements table (RLS: read own; writes = service role only)
- requirePro() gate + upgrade modal in the client (BETA_MODE unlocks everything)
- supabase/functions/create-checkout — refuses to run unless the key is sk_test_

To exercise the TEST flow later (all reversible, no real money):
1. Stripe dashboard → Test mode → create a Product + recurring Price → copy price_...
2. Supabase → Edge Functions → Secrets: STRIPE_SECRET_KEY (sk_test_...),
   STRIPE_PRICE_ID, SITE_URL. Secrets live in Supabase only — never in the repo.
3. Deploy functions (CLI `supabase functions deploy create-checkout` or the Action
   once SUPABASE_ACCESS_TOKEN secret is added to GitHub).
4. startCheckout() in index.html already calls the function and redirects; if the
   function isn't deployed it falls back to the upgrade modal (current behavior).
5. Webhook (checkout.session.completed → entitlements.pro=true) is the next piece —
   build when test checkout works end-to-end.

Going LIVE (post-internship): swap to sk_live_ (the function's test-only guard must
be removed deliberately), real price, webhook signing secret, and flip BETA_MODE.
