# Third parties and SDK audit (DRAFT)

Status: draft for a licensed professional and Wolf. Not published. The audit part is the R9 record; the last section is the text for the Privacy Policy.
Markers: **[LAWYER]** is a point a lawyer must confirm.

## Audit (2026-10-02): every external script, style, font and connection

Method: every URL in app2/ (HTML, JS, CSS, `_headers`), the Content-Security-Policy, and the browser smoke, which blocks all non-local traffic and still passes (so nothing external is needed to render or play).

| Third party | What loads | Where | What it receives | Cookies |
|---|---|---|---|---|
| Supabase | No external script: supabase-js 2.116.0 is vendored at app2/vendor/supabase.js, pinned by hash. API calls go to `wepejasrnskvftgnnecr.supabase.co` (HTTPS and WSS) | Signed-in use, sign-in, telemetry, error log | Email, password (hashed by Supabase), sign-in tokens, everything stored with an account (privacy.md section 2), product events and error reports, IP and user agent | None (the session is in local storage) |
| Stripe and Link | `js.stripe.com/dahlia/stripe.js`, Stripe and Link iframes, `billing.stripe.com` (Customer Portal, by redirect) | Only `#/checkout` and the portal, and only where the `payments` flag is on (preview hosts today; the hotkey.gg CSP blocks all Stripe hosts) | Email, payment details entered in Stripe's frame (never touch our code), IP and device signals for fraud | Yes, Stripe's fraud cookies |
| Google sign-in | Redirect to Google through Supabase Auth | Only when "Continue with Google" is pressed | Google returns email, name and picture to Supabase | Google's own, on Google's page |
| Cloudflare Pages | Hosting (first party from the visitor's view) | Every request | IP, user agent, URL | None set by the site; check bot protection (cookies.md) |
| LinkedIn | No script. An outbound link "Add to LinkedIn" on the certificate | Only when clicked | The certificate's name, issuer, date, credential id and verify URL, in the link's query string | LinkedIn's, on LinkedIn's site |
| Email delivery | Supabase's built-in mailer sends sign-in codes; a custom SMTP (Resend) is planned (app2/supabase/templates/README.md) | Sign-in emails | Email address and the code | n/a |

Not present: Google Fonts (the two typefaces are self-hosted under app2/ui/fonts since the R8/R9 integration), analytics or tag managers, ad pixels, session recording, chat widgets, A/B tools, error trackers (the error log is first party), CDN-hosted libraries, social embeds, video embeds, AI APIs, file storage buckets (no Supabase Storage bucket is used; nothing is uploaded).

## Findings

1. **Google Fonts: done.** It was the only third party on every page view and received every visitor's IP address (a German court, LG München I, 3 O 17493/20, January 2022, fined a site for exactly this). Hanken Grotesk and JetBrains Mono (both SIL Open Font License 1.1) are now self-hosted under app2/ui/fonts with their licence files, `fonts.googleapis.com` and `fonts.gstatic.com` are gone from the CSP, and the public pages are regenerated.
2. **Google sign-in asks for more than we use.** Supabase's Google provider stores name and picture in the user's metadata. We use neither. **[BUILD]** request the `email` scope only, or document the data in the Privacy Policy (done in privacy.md).
3. **Stripe is correctly fenced** to checkout on preview hosts by the CSP; the live site loads none of it.
4. **Supabase is self-hosted code** (vendored, hash-pinned), so no third-party script runs on the site at all today. Only data leaves for Supabase.

## Text for the Privacy Policy

We use a small number of providers to run hotkey.gg: Supabase (database, sign-in and sign-in email), Cloudflare (hosting), and, for paid plans, Stripe and Link (payments, receipts, renewal notices, tax). If you choose Continue with Google, Google is involved in signing you in. None of them may use your data for their own advertising. We do not use analytics, advertising or tracking services, and no third-party scripts run on the site except Stripe's on the checkout page. **[LAWYER]** confirm processor and controller roles and the transfer mechanism for each.
