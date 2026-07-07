// create-checkout — Stripe TEST MODE ONLY (paywall scaffold; not live).
// Requires Supabase secrets (set by Wolf, never in repo):
//   STRIPE_SECRET_KEY  = sk_test_...   (TEST key only until post-internship)
//   STRIPE_PRICE_ID    = price_...     (a TEST-mode recurring price)
//   SITE_URL           = https://www.hotkey.gg
// Returns { url } for redirect. The webhook (future) writes entitlements.
import Stripe from "npm:stripe@14";
Deno.serve(async (req) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const key = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    if (!key.startsWith("sk_test_")) {
      // hard refusal: this function will not run with a live key while in iteration mode
      return new Response(JSON.stringify({ error: "test_mode_only" }), { status: 400, headers: cors });
    }
    const stripe = new Stripe(key);
    const { user_id } = await req.json();
    if (!user_id) return new Response(JSON.stringify({ error: "missing user_id" }), { status: 400, headers: cors });
    const site = Deno.env.get("SITE_URL") ?? "https://www.hotkey.gg";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: Deno.env.get("STRIPE_PRICE_ID")!, quantity: 1 }],
      success_url: site + "/account.html?upgraded=1",
      cancel_url: site + "/index.html",
      client_reference_id: user_id,
    });
    return new Response(JSON.stringify({ url: session.url }), { headers: { ...cors, "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors });
  }
});
