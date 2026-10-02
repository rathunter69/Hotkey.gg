# Liability checklist

Wolf's list, copied from Google Drive ("Liability Checklist", 2026-10-01). Queued as run R9 in docs/REBUILD_PLAN.md: nothing here starts before the curriculum runs are done. Legal texts are drafted for a licensed professional's review, never published without Wolf's go-ahead.

## Policies, consent and honest selling

- Privacy Policy
- Terms of Service
- Refund Policy
- Cookie Policy
- Cookie Consent Banner
- Check Form Consents
- No unnecessary Data
- Audit Third-party SDKs
- Remove dark patterns (if violating UI/UX/theme guidelines)
- Remove hidden fees
- Remove fake reviews
- Accessibility alt text (not sure about integration w/ platform)
- Fix color contrast (should be addressed in UI/UX push)
- Add business details (I have on file in drive for LLC name etc)
- Age consent for minors/kids data
- Unsubscribe link in emails
- License fonts/images if applicable
- Data deletion requests
- Mention of AI use in Privacy Policy
- Mention of Third party data collectors in privacy policy (if applicable here)
- Not deleting user uploads
- Storage bucket being public
- Fake testimonials (not a problem here)
- Cancelling longer than sign up
- Auto renew without reminder

## Security

- Add HSTS
- Add CSRF Tokens
- Reset Sessions on password change
- Expire reset links
- Prevent user enumeration
- Whitelist upload types (N/A Here)
- Verify payment webhooks (not set up yet)
- Set prices server-side
- Block prompt injection
- Cap AI usage
- Limit request size
- Rate limit password resets
- Sanitize before storing
- Lock down CORS
- Disable directory listing
- Remove default admin route
- Lock accounts after failed Login attempted
- Log security events
- Set secure cookie flags
- Restrict database permissions

## Security: results (run R9)

Every item in the Security list, built with a test, provided by the platform, or not applicable with the reason. "Platform" names where Supabase or Cloudflare provides it; the dashboard settings only Wolf can change are steps in wolf-todo.md. The node checks are `app2/tests/security.test.js` (in `npm run check`); the database sweep is pgTAP `app2/supabase/tests/13-security.test.sql`; the browser smoke runs every route under the real CSP (`app2/tests/serve.js` sends the `_headers` site-wide rule, and any violation fails the run).

| Item | Status | Evidence |
|---|---|---|
| HSTS | built | `app2/_headers`: `Strict-Transport-Security: max-age=63072000; includeSubDomains` on every response. Test: security.test.js "HSTS". Cloudflare's "Always Use HTTPS" covers the first plain-http request (wolf-todo). Preload is not requested: it is hard to undo. |
| Other headers (CSP, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors) | built | `app2/_headers`: scripts only from the site plus the five inline scripts by sha256 hash (no `unsafe-inline`, no eval, `script-src-attr 'none'`), connect only to the Supabase project (https and wss), fonts self-hosted (`app2/ui/fonts`, no font origin in the CSP), `frame-ancestors 'none'`, `object-src 'none'`. The preview hosts add Stripe and Link only. The two inline handlers in index.html were replaced by listeners. Tests: security.test.js (policy, hashes match the pages, every external origin a page loads is allowed, no inline handlers anywhere); smoke.mjs "csp" (lesson, shortcut and 404 pages load under it) plus a violation listener on every page. After editing an inline script: `node app2/tests/headers-file.js --write`. Styles keep `unsafe-inline` because the app's templates set style attributes. |
| CSRF tokens | not applicable | No cookies carry authentication. supabase-js keeps the session in localStorage and sends it as an `Authorization: Bearer` header, which a cross-site page cannot attach; no form posts to a server (every form is handled in JS). Test: security.test.js asserts no client code sets a cookie. |
| Reset sessions on password change | not applicable | The app has no password change or password reset screen; a forgotten password is handled by the magic link. If a change screen is added, it must call `auth.signOut({ scope: 'others' })` after `updateUser`. Supabase's "Secure password change" setting (reauthenticate before a change) is a wolf-todo step. |
| Expire reset links | platform | Magic links and codes are single use and expire after the Email OTP Expiration in Supabase Auth (Authentication > Providers > Email; Supabase docs, "Passwordless email logins"). Wolf-todo: set it to 900 seconds. No password reset links exist. |
| Prevent user enumeration | built | `app2/app/auth.js` `enumerationSafe`: a taken, unknown or unconfirmed email answers exactly like any other ("check your email" for sign-up, link and code; one wrong-credentials line for password sign-in). Supabase already hides a taken email on sign-up while "Confirm email" is on (wolf-todo: keep it on). Test: security.test.js "no user enumeration". |
| Whitelist upload types | not applicable | No file uploads and no storage buckets. Test: security.test.js fails if a file input appears. |
| Verify payment webhooks | built | `supabase/functions/_shared/http.js` `verifyWebhook`: POST only, a 512 KB cap, a configured secret and a `Stripe-Signature` header required, then Stripe's `constructEventAsync` on the raw body (HMAC plus a 5 minute timestamp tolerance against replays); processed event ids are skipped (0011 `billing_events`). Tests: security.test.js (forged, missing, oversized, no secret, each logged) and billing.test.js (replays). |
| Set prices server-side | built | `create-checkout` takes only `plan: 'monthly'` and looks the price up in Stripe by lookup key on the server (`billing.js` `planFor`, `priceByLookupKey`). Test: security.test.js "server-side prices" sends a client price, amount and currency and checks none reaches Stripe. |
| Block prompt injection | not applicable | No AI features and no model API calls. Test: security.test.js fails if client code calls an AI API. |
| Cap AI usage | not applicable | As above. |
| Limit request size | built | Edge functions: 8 KB on create-checkout and billing-portal, 512 KB on the webhook, checked on Content-Length and cut off while streaming (`http.js` `readBody`), 413 past it. Database: length checks on every free text column and RPC argument (migrations 0001, 0003, 0004, 0005). Test: security.test.js "request size". |
| Rate limit password resets | platform | Supabase Auth rate limits, per IP: emails sent, OTP and magic link requests, token verifications, sign-ups and sign-ins (Authentication > Rate Limits; Supabase docs, "Rate limits"). No reset flow exists. Wolf-todo: review the limits and set up custom SMTP so the email limit is his to set. |
| Sanitize before storing | built (existing) | Validate on the way in, escape on the way out: every write goes through an RPC that checks types, lengths and formats (handle rules and banned words, 0001 and 0004; telemetry caps, 0003), and the UI escapes every stored string it renders (`esc`). Tests: pgTAP 02, 04, 05 and 07; the CSP blocks script even if a string slipped through. |
| Lock down CORS | built | `billing.js` `corsHeaders`: the site and the configured preview origins only, never `*`, no credentials; the webhook sends no CORS headers. Tests: security.test.js "CORS lockdown" and the edge function source check; billing.test.js. Supabase's REST API answers CORS with `*` by design; that is safe because it authenticates by bearer token, not cookie. |
| Disable directory listing | platform, plus built | Cloudflare Pages never lists a folder; an unknown path gets `404.html` (Cloudflare docs, "Serving Pages"). Built: app2 is the published folder, so `_redirects` now sends the database, function source, tests, copy sheets and package.json home; only `supabase/functions/_shared/student-domains.js` stays public because the pricing page imports it. Test: security.test.js "dev-only files are not served" (a new file under supabase/ or tests/ fails until it is listed). |
| Remove default admin route | built | No default admin page or route exists; the old `/admin.html` redirects home (`_redirects`). The ops page from run R8 (#/ops) is not a default route: it is linked from nowhere and 0015_ops.sql gates its data server-side to the ops_admins list (pgTAP 15). Admin work happens in the Supabase and Stripe dashboards behind Wolf's own logins (wolf-todo: two-factor on each). Test: security.test.js. |
| Lock accounts after failed logins | platform | Supabase Auth throttles sign-in and verification attempts per IP and offers CAPTCHA (Authentication > Attack Protection). A per-account lockout is deliberately not built: it would let anyone lock a learner out by guessing badly on purpose. Most sign-ins are magic links or codes, which have no password to guess. |
| Log security events | platform, plus built | Supabase Auth's audit log records sign-ins, sign-ups, token refreshes and failures (Authentication > Logs); edge function logs keep every refused webhook (`security: webhook refused`, with the reason and never the secret, from `verifyWebhook`); billing anomalies go to `billing_alerts` (0011); client errors to `client_errors` (0003). Test: security.test.js checks each webhook refusal is logged. |
| Set secure cookie flags | not applicable | The site sets no cookies (the session lives in localStorage). Test: security.test.js fails if client code sets one. |
| Restrict database permissions | built | RLS on every table; no INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES or TRIGGER for anon or authenticated on any relation in public, no column-level write grants, client-readable views run as the caller, every SECURITY DEFINER function pins its search_path, no CREATE on the schema. pgTAP `13-security.test.sql` sweeps every relation, so a table a later migration adds is covered (255 assertions pass on 0001 to 0011). No schema change was needed. Supabase security advisors run after every applied migration. |

## Status: policies, consent and honest selling (R9, 2026-10-02)

Policy drafts are in docs/policy-drafts/, each marked **[LAWYER]** where counsel must confirm and **[LLC]** where a detail from Wolf's Drive goes. No live legal page and no live pricing page was changed.

| Item | Status | Evidence |
|---|---|---|
| Privacy Policy | Drafted for review | docs/policy-drafts/privacy.md, written from migrations 0001 to 0011 and the client code |
| Terms of Service | Drafted for review | docs/policy-drafts/terms.md, with Wolf's prices ($15, students $9, Teams $12 a seat, 5 or more). The live Terms and About pages still show the old $9/$90 and $7/$70 plans and must be replaced before checkout opens |
| Refund Policy | Drafted for review | docs/policy-drafts/refund.md (14 days on the first payment; Teams terms open for Wolf) |
| Cookie Policy | Drafted for review | docs/policy-drafts/cookies.md lists every storage key the site uses |
| Cookie Consent Banner | Not needed, none built | The site sets no cookies and keeps only what the product needs in browser storage; the analytics key moved from sessionStorage into memory (app2/app/telemetry.js). app2/tests/consent.test.js fails if first-party code sets a cookie or analytics touches storage |
| Check Form Consents | Built | One consent line (Terms, Privacy Policy, what the email is for, no marketing, 13 or older) under every email form: Account, sign-in pop-out, checkout sign-in (app2/ui/components/consent.js). R8 replaced the Teams request form with a Talk to us email link and a desk code box, so no Teams form collects personal data; `consentHtml('teams')` stays for a future form. consent.test.js fails if a form asking for an email lacks it |
| No unnecessary Data | Checked, two follow-ups | No date of birth, phone, address or uploads. Follow-ups: Google sign-in stores name and picture we never use (request email only); `rpc_export_my_data` omitted email, plan and linked events (certificate already in 0012): migration 0017 adds them, with pgTAP 17, not yet applied |
| Audit Third-party SDKs | Done | docs/policy-drafts/third-parties.md: Google Fonts removed: both fonts (OFL) are self-hosted under app2/ui/fonts with their licence files, and the CSP allows no font origin; Supabase (vendored, hash-pinned), Stripe and Link only on checkout on preview hosts, Google sign-in on request, LinkedIn as a plain link. No analytics, pixels or CDN libraries |
| Remove dark patterns | Reviewed, none found in the flow | No pre-ticked boxes, countdowns, fake scarcity or confirmshaming ("Not now" is neutral); Cancel subscription sits beside Manage billing; Get full access is disabled with "Checkout opens at launch." while the flag is off |
| Remove hidden fees | One finding, not edited | Prices are tax-exclusive (stripe-setup.mjs `tax_behavior: 'exclusive'`) but Pricing and the paywall say "$15 a month" with no "plus tax"; Stripe shows tax before payment. Recommend "plus tax where it applies" on Pricing (Wolf's go-ahead needed). Checkout's "money back within 14 days" omits "first payment", unlike Pricing |
| Remove fake reviews | None found, one note | No reviews or testimonials. The landing's sample Daily board ("184 clean runs", made-up handles) now reads "Example board" in its header (site.csv `landing_plate_boards_example`) |
| Accessibility alt text | Built | app2/tests/a11y.test.js (every img has alt, no icon-only control without a name) and app2/tests/a11y-guard.js, run by the browser smoke on every page it opens. One gap fixed: the workspace sound button was written with an empty label for script to fill |
| Fix color contrast | Already enforced | app2/tests/contrast.test.js checks every text and background pair in every theme (WCAG AA) |
| Add business details | Drafted, placeholders | docs/policy-drafts/business-details.md; the footer row `footer_business` is empty until the LLC details are filled |
| Age consent for minors/kids data | Built (statement) | "You must be 13 or older to make an account." on every sign-up form; docs/policy-drafts/minors.md for counsel (COPPA, GDPR Art. 8, public profile default) |
| Unsubscribe link in emails | Not applicable | The product sends no marketing email: only sign-in codes and links (Supabase), and payment emails from Link. Any future optional email gets an unsubscribe link (privacy.md section 6) |
| License fonts/images | Checked | Hanken Grotesk and JetBrains Mono: SIL Open Font License 1.1. Images (favicon, icons, the landing poster, pixel badges) are made in-house or recorded from the product. supabase-js: MIT. No stock images |
| Data deletion requests | Built, already present | Account page: Export data and Delete account (typed confirmation, `rpc_delete_account` cascades every table); guests: Delete local data; email privacy@hotkey.gg. Delete now warns a renewing subscriber to cancel first, since deletion does not stop Stripe billing (server-side cancel on delete is a follow-up) |
| Mention of AI use in Privacy Policy | Drafted | docs/policy-drafts/ai-use.md: no AI features, no data to AI providers |
| Mention of Third party data collectors | Drafted | docs/policy-drafts/third-parties.md and privacy.md section 5 |
| Not deleting user uploads | Not applicable | No upload anywhere in the product |
| Storage bucket being public | Not applicable | No Supabase Storage bucket is used |
| Fake testimonials | Not applicable | None on the site |
| Cancelling longer than sign up | Checked, passes | Cancel: Account, Cancel subscription, confirm in Stripe's portal (two steps, `flow_data` subscription_cancel). Sign up: four steps. docs/policy-drafts/renewal-reminders.md |
| Auto renew without reminder | Setting for Wolf | Stripe's upcoming-renewal emails; line added to Wolf's to-do list. Text in docs/policy-drafts/renewal-reminders.md |
