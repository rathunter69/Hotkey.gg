# Phase E: checkout (Stripe Managed Payments, subscriptions)

Brief for the build session. Status: BUILT on branch `payments` 2026-10-02 (section 0 steps 1 to 4; migration, deploy and the exit check wait for Wolf's go-ahead). READY TO BUILD, 2026-10-01. Decisions agreed with Wolf; the Stripe sandbox is set up and matches this brief (section 3a); owned by the build session from here (section 0). Lives in the repo as `docs/phases/E-checkout.md` and in the claude.ai project as `claude/phase-e-checkout.md`; kept identical. Decisions and status are in `docs/REBUILD_PLAN.md`.

## 0. Start here (the build session owns this phase end to end)

From 2026-10-01 the whole payments track belongs to the build session: code, the database migration, deploying the functions, the sandbox tests and, when Wolf says go, the live Stripe setup. The project chat set up the Stripe sandbox and wrote this brief, and does nothing further on it. Everything a session needs is in this file; nothing else holds payments context.

Order of work:
1. Cut branch `payments` from `rebuild`. Copy this file to `docs/phases/E-checkout.md`. Add the Stripe publishable key exception to `CLAUDE.md`'s client-key rule (section 2) and the ownership change below to its hard stops.
2. Write migration `0011_billing.sql` and pgTAP `12-billing` (section 4); green locally. (0009 and 0010 were taken by the interface run's run records and settings; the numbers moved.)
3. Write the three edge functions (section 5) with unit tests in the fast check.
4. Write the client pieces behind the `payments` flag (section 6).
5. **Ask Wolf for a go-ahead**, then apply 0009 and 0010 (if not yet live) and 0011 to Supabase project `wepejasrnskvftgnnecr` and run the security and performance advisors; fix anything they raise with a forward migration. Then deploy the functions (section 5, Deploying).
6. Once Wolf confirms the two Stripe secrets are in Supabase, run the section 7 exit check on the `payments` preview. Add the preview domain as a Stripe payment method domain first.
7. Report to Wolf: what passed, what didn't, screenshots of `/checkout`, `/checkout/done`, the pricing page and the account page. Merge to `rebuild` only with his OK, after the running content run has landed.
8. Go-live (section 9) only when Wolf says so, as its own step.

What changed from the plan's standing rules, for this phase only: the build session applies its own migration and deploys its own functions, each time after an explicit go-ahead from Wolf in that session. Everything else in `CLAUDE.md` stands.

Facts checked from the live project on 2026-10-01 (so the session doesn't have to rediscover them): migrations 0001–0008 are applied on `wepejasrnskvftgnnecr`. `public.entitlements` has `id uuid`, `user_id uuid` → `profiles`, `source text` checked to `admin | redeem | checkout | group`, `starts_at timestamptz default now()`, `ends_at timestamptz null`, `note text` (200 max), `created_at`. RLS is on for every public table. `redeem_codes` has `grant_days` and `expires_at`. No edge functions are deployed yet.

## 1. Decisions

| # | Decision | Status |
|---|---|---|
| 1 | Processor: **Stripe Checkout with Managed Payments**. Stripe (through Link) is the merchant of record: it calculates, collects, files and remits sales tax, VAT and GST in 80+ countries, and handles fraud, disputes and payment support. Radar stays on the free Lite plan; Managed Payments already covers fraud. | Wolf agreed 2026-10-01 |
| 2 | **Embedded Checkout** (`ui_mode: 'embedded_page'`; the older value `embedded` is rejected on the current API version): Stripe's form inside a hotkey.gg page. A custom Elements form isn't available under Managed Payments. | Agreed |
| 3 | Pricing page shows three columns: **Free** (Chapter 1, drills, the Daily, boards), **Full Access $15 a month** (all six chapters and everything added later; cancel anytime), **Teams $12 a seat a month, 5+ seats**. No own-it option, no annual plan, no free trial (Chapter 1 is the trial). | Wolf agreed 2026-10-01 |
| 4 | **Students $9 a month**, applied automatically when the signed-in account's email is on a school domain (section 5). Shown on the pricing page as one line under the price. The student price stays for the life of that subscription. | Agreed |
| 5 | **Cancelling is easy by design.** One "Cancel subscription" button on the account page opens the Stripe Customer Portal on its cancel flow; access runs to the end of the paid month. Stripe's renewal reminders stay on. When a learner finishes the course, they get one email offering to keep practicing or cancel. Nothing in the product is designed around forgotten renewals: it risks chargebacks (Managed Payments requires a low dispute rate), California's and Illinois's auto-renewal laws, and word of mouth in a small market. | Wolf agreed 2026-10-01 |
| 6 | Teams at launch are **sold by hand**: "Talk to us" goes to email; Wolf sends a Stripe Payment Link for the seat subscription (quantity 5 to 200), then grants each member a `group` entitlement through the admin grant (Phase B). The webhook flags the team subscription's cancellation to the admin so the grants are ended by hand. Self-serve seats and seat management come with desks in Phase F. | DRAFT |
| 7 | Promotion codes are on at checkout, only for tracked, capped codes: finance clubs, partners, the launch list. Each has a redemption cap and an expiry. | DRAFT |
| 8 | Prices are **tax-exclusive** (Stripe's default). | DRAFT |
| 9 | Product tax code `txcd_20060058` (Training Services, self-study web-based), on Stripe's Managed Payments eligible list. | DRAFT |
| 10 | 14-day money-back guarantee on the first payment, refunded by hand from the Stripe Dashboard. | Per Wolf |
| 11 | Signed-in accounts only. Sign-in on the checkout page itself by a 6-digit email code (Supabase email OTP), so the buyer never leaves the page; Google sign-in joins when the OAuth app exists. | DRAFT |
| 12 | Later, not now: a 12-month pass with no auto-renewal (about $99, one-time) if buyers ask for a one-time option or expense reimbursement; paid add-on chapters. The code supports one-time `mode: 'payment'` products so either is a new Stripe price plus a flag. | Parked |

What customers see under Managed Payments: the form shows "Sold through Link", the card statement reads `LINK.COM* HOTKEY.GG`, and receipts, invoices and renewal notices come from Link. If we don't answer a Link support escalation within 48 hours, Stripe may refund within 60 days without our approval, so the support email must be watched.

## 2. Architecture

```
Browser (static app2)                    Supabase Edge Functions               Stripe
---------------------                    -----------------------               ------
/checkout page --- invoke -------------> create-checkout (user JWT) --------->  Checkout Session
               <-- { client_secret } ---                                        (embedded_page, subscription,
Stripe.js mounts the form in the page --------------------------------------->   managed_payments)
return to /checkout/done?session_id=...
poll own entitlements  <-- RLS read  entitlements <-- RPC  stripe-webhook  <--- events (signed)
Account: Cancel / Manage billing ------> billing-portal (user JWT) ---------->  Customer Portal
```

- No secret ever reaches the client. The browser holds only the Supabase publishable key and the **Stripe publishable key** (`pk_test_…`, public by design: it can mount a checkout and nothing else). `CLAUDE.md`'s client-key rule gains this one named exception.
- Stripe.js loads from `https://js.stripe.com` (Stripe requires that host; it can't be bundled). CSP: `https://*.stripe.com` and `https://*.link.com` in `script-src`, `frame-src` and `connect-src` (Link is the merchant of record and serves parts of the form). Never `default-src *`.
- Fulfilment is driven by the webhook alone. The return page never grants anything; it waits for the entitlement row to appear.
- Entitlements stay processor-agnostic: Stripe writes the same `entitlements` rows that admin and redeem grants write, with `source = 'checkout'`.

## 3. Stripe objects

Code finds prices by **lookup key**, never by hard-coded price IDs, so moving from sandbox to live needs no code change.

| Product | Price lookup key | Amount |
|---|---|---|
| hotkey.gg Full Access | `hk_monthly` | $15.00 a month |
| hotkey.gg Full Access | `hk_monthly_student` | $9.00 a month |
| hotkey.gg Team Seat | `hk_team_seat_monthly` | $12.00 a seat a month (manual Payment Links only, quantity 5 to 200) |

Both products use tax code `txcd_20060058`; all prices are tax-exclusive. Statement descriptor `HOTKEY.GG`.

Customer Portal (default configuration): cancel at period end with an optional reason; update payment method; invoice history; no plan switching, no quantity changes, no customer detail edits. Privacy and Terms links to hotkey.gg; return URL `/account`.

Webhook endpoint: `https://wepejasrnskvftgnnecr.supabase.co/functions/v1/stripe-webhook`, API version `2026-08-26.dahlia`, events:
`checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`, `charge.dispute.created`.

## 3a. Sandbox state (set up 2026-10-01 from the project chat; the source of truth for IDs)

The same script (section 9) must reproduce this table from an empty sandbox. Sandbox account `acct_1ULsWEDG83fIBduG` ("Spreadsheet Skills Group LLC sandbox", US, USD). Created by API on version `2026-08-26.dahlia`:

| Object | ID | Notes |
|---|---|---|
| Product "hotkey.gg Full Access" | `prod_VMcslJz2VcNB5r` | tax code `txcd_20060058`, metadata `plan=monthly`, default price `hk_monthly` |
| Price $15.00 / month | `price_1ULttEDG83fIBduGFLiMwEiX` | lookup key `hk_monthly` |
| Price $9.00 / month | `price_1ULttEDG83fIBduGhz5N2lfe` | lookup key `hk_monthly_student` |
| Product "hotkey.gg Team Seat" | `prod_VMcsibrvc2zTtV` | tax code `txcd_20060058`, metadata `plan=team` |
| Price $12.00 / seat / month | `price_1ULttFDG83fIBduG28TXrAmu` | lookup key `hk_team_seat_monthly` |
| Retired one-time prices | `price_1ULtd5…` ($49), `price_1ULtd6…` ($29), `price_1ULtd8…` ($39) | inactive, lookup keys removed; left in place because Stripe prices can't be deleted |
| Customer Portal configuration | `bpc_1ULtteDG83fIBduGZNIRFugT` | default; as in section 3 |
| Payment method domain `hotkey.gg` | `pmd_1ULtd9DG83fIBduGGHyMxk2D` | active. Preview domains still to add when the `payments` branch has a preview URL |
| Webhook endpoint | `we_1ULtdZDG83fIBduGUSmeRkSJ` | as in section 3. Deliveries fail until the function is deployed; that's expected |

Verified 2026-10-01: embedded Checkout Sessions with `managed_payments[enabled]=true` create cleanly for the $15 monthly price (subscription mode) and for 5 team seats with adjustable quantity ($60); test sessions were expired.

Publishable key (public by design, goes in `config.js`): `pk_test_51ULsWEDG83fIBduGsZTvM3ckPp0wymYL6qQ1Hzu8CSnIclhxEbQqEWuXc8nS4BxsniEy9pOl2YrJypSpixrEHeof0094PCgcSX`.

Live account: Stripe has cleared it (2026-10-01). Nothing exists in live mode yet; live objects are mirrored from this table at go-live (section 9), only when Wolf says go.

Supabase secrets `STRIPE_SECRET_KEY` (sandbox restricted key), `STRIPE_WEBHOOK_SECRET` and `SITE_URL` were added by Wolf on 2026-10-01, so the sandbox exit check (section 7) can run as soon as 0011 and the functions are deployed. The sandbox secret key pasted into a chat that day is to be rolled by Wolf and never used.

## 4. Database: migration `0011_billing.sql` (+ pgTAP `12-billing`)

The live project already has 0001–0008, and `entitlements` already allows `source = 'checkout'` and `'group'` and a nullable `ends_at`. The migration adds:

- `entitlements.external_ref text`, with a unique index where it isn't null. For a subscription it holds the Subscription id `sub_…`; for a future one-time pass, the PaymentIntent id `pi_…`. Upserts key on it, which makes every webhook handler idempotent.
- `entitlements.plan text` with a check for `monthly`, `student_monthly`, `pass` or `addon`, or null (null for admin, redeem and group rows).
- `billing_customers (user_id uuid primary key references profiles, stripe_customer_id text unique not null, created_at timestamptz default now())`. RLS on; the owner may select their own row; no client writes.
- `billing_events (id text primary key, type text not null, received_at timestamptz default now(), processed_at timestamptz)`. RLS on, no client policies.
- `billing_alerts (id bigint identity primary key, kind text not null, ref text, detail jsonb, created_at timestamptz default now(), resolved_at timestamptz)`. RLS on, no client policies; read by the admin page. Used for anything that needs Wolf's hand: a team subscription cancelled, a payment that couldn't be matched to a user.
- RPCs, all `security definer` with `search_path` pinned, and `execute` granted **to `service_role` only** (revoked from `anon` and `authenticated`):
  - `billing_link_customer(p_user uuid, p_customer text)`: insert, or no-op if the same pair already exists.
  - `billing_grant(p_user uuid, p_ref text, p_plan text, p_ends_at timestamptz, p_note text)`: upsert on `external_ref` and set `ends_at`.
  - `billing_end(p_ref text, p_ends_at timestamptz)`: set `ends_at` on the row with that ref.
  - `billing_revoke_user(p_user uuid, p_note text)`: set `ends_at = now()` on every active `source = 'checkout'` row for the user.
  - `billing_alert(p_kind text, p_ref text, p_detail jsonb)`.
- pgTAP checks that `anon` and `authenticated` cannot execute any billing RPC, that a user cannot read another user's billing row, that a grant is idempotent on `external_ref`, that `billing_end` moves only the matching row, and that a revoke ends only `checkout` rows (admin, redeem and group rows stay).

The client's active test stays as it is today: `starts_at <= now()` and (`ends_at` is null or `ends_at > now()`). A subscriber's row has `ends_at` = the current period end plus two days of grace, pushed forward on every paid renewal.

Written under `app2/supabase/`. **The build session applies it after Wolf's go-ahead and runs the advisors** (section 0, step 5).

## 5. Edge functions (`app2/supabase/functions/`)

Deno, `npm:stripe@22` (current major), with the API version pinned in code to `2026-08-26.dahlia` to match the webhook endpoint. Always instantiate a client (`new Stripe(key, { apiVersion, httpClient: Stripe.createFetchHttpClient() })`) and call methods on it; no global key. On this API version, subscription period dates are on the subscription item: `subscription.items.data[0].current_period_end`. Shared helpers go in `_shared/`. One env flag, `STRIPE_MANAGED_PAYMENTS` (default `true`), switches `managed_payments[enabled]`; if Managed Payments were ever refused, the fallback is plain Checkout with `automatic_tax`, a config change.

### create-checkout (JWT required)
Input `{ plan: 'monthly' }` (the input exists so a pass or add-on can join later).
1. Resolve the user from the bearer token (`auth.getUser`). If there's none, return 401.
2. If the user already has an active `checkout` row, refuse with 409 `already_subscribed` (the client then shows Manage billing instead).
3. Get or create the Stripe Customer: look in `billing_customers`; if missing, `customers.create({ email, metadata: { user_id } })` and then `billing_link_customer`.
4. Student check. The auth email's domain ends in one of the suffixes in `_shared/student-domains.ts`: `.edu`, `.ac.uk`, `.edu.au`, `.ac.nz`, `.edu.sg`, `.edu.hk`, `.ac.jp`, `.ac.in`, `.ac.za`, `.ac.il`, `.edu.mx`. Students get `hk_monthly_student`; everyone else `hk_monthly`. Fetch with `prices.list({ lookup_keys: [key], active: true })`.
5. `checkout.sessions.create({ ui_mode: 'embedded_page', integration_identifier: 'hotkey_monthly_embedded_qkrvmzta', mode: 'subscription', customer, line_items: [{ price, quantity: 1 }], managed_payments: { enabled: true }, allow_promotion_codes: true, client_reference_id: user.id, metadata: { user_id, plan }, subscription_data: { metadata: { user_id, plan } }, return_url: SITE_URL + '/checkout/done?session_id={CHECKOUT_SESSION_ID}' })`, where `plan` is `student_monthly` or `monthly`.
   - Under Managed Payments, **don't pass** `automatic_tax`, `tax_id_collection`, `payment_method_types`, `payment_method_configuration`, `adaptive_pricing`, `customer_update`, `invoice_creation`, `subscription_data.invoice_settings`, `subscription_data.default_tax_rates`. Stripe rejects them.
6. Return `{ client_secret, student }`. Errors come back as `{ error: code }` with no Stripe internals.

### stripe-webhook (no JWT; `verify_jwt = false`)
1. Read the raw body and verify it with `stripe.webhooks.constructEventAsync(body, sig, STRIPE_WEBHOOK_SECRET, undefined, Stripe.createSubtleCryptoProvider())`. If verification fails, return 400.
2. Insert into `billing_events`. If the id is already there and processed, return 200.
3. Handle the event, mark it processed, return 200. If anything throws, return 500 so Stripe retries. Handlers are idempotent, so retries are safe.

Grace below means two days. The user for a subscription event comes from `subscription.metadata.user_id`, falling back to `billing_customers` by customer id. A subscription with `metadata.plan` missing or equal to `team` (a manual Payment Link) is never granted automatically.

| Event | Action |
|---|---|
| `checkout.session.completed` with `payment_status` not `unpaid`, or `checkout.session.async_payment_succeeded` | Skip if `client_reference_id` is missing (manual Teams link; it's handled by `customer.subscription.*` alerts). Otherwise retrieve the subscription and `billing_grant(user, sub.id, metadata.plan, item.current_period_end + grace, null)`. |
| `checkout.session.async_payment_failed` | Log it; grant nothing. |
| `invoice.paid` (renewals) | For an individual subscription: `billing_grant` (upsert) with the new period end + grace. Team: nothing. |
| `invoice.payment_failed` | Nothing to the row (it lapses on its own at period end + grace if the card is never fixed). Stripe and Link send the card-update emails. |
| `customer.subscription.updated` | `active` or `trialing`: set `ends_at` to period end + grace. `past_due`: leave as is. `unpaid`, `canceled`, `incomplete_expired`: `billing_end(sub.id, now())`. Cancel-at-period-end needs nothing; the row lapses at period end + grace. Team subscription: `billing_alert('team_subscription_changed', sub.id, {status, quantity, cancel_at_period_end})`. |
| `customer.subscription.deleted` | Individual: `billing_end(sub.id, now())`. Team: `billing_alert('team_subscription_ended', …)`. |
| `charge.refunded` (full refunds only; log partials and do nothing) | user from `charge.customer` via `billing_customers`; `billing_revoke_user(user, 'refund')` and cancel any active subscription of that customer immediately. If no user matches: `billing_alert('refund_unmatched', …)`. |
| `charge.dispute.created` | Same as a full refund, with note `dispute`. |

### billing-portal (JWT required)
Input `{ flow?: 'cancel' }`. Look up the user's `stripe_customer_id`; if the flow is `cancel` and they have an active subscription, create the session with `flow_data: { type: 'subscription_cancel', subscription_cancel: { subscription } }` so the button lands straight on the cancel confirmation. Return `{ url }`. Return 404 `no_customer` if they've never subscribed.

### Deploying
Use whichever the session has: the Supabase MCP tools (`apply_migration`, `deploy_edge_function`, `get_advisors`) or the Supabase CLI (`supabase link --project-ref wepejasrnskvftgnnecr`, `supabase db push`, `supabase functions deploy create-checkout`, `supabase functions deploy billing-portal`, `supabase functions deploy stripe-webhook --no-verify-jwt`). `stripe-webhook` must be deployed with JWT verification off; the other two with it on. Never set secrets from the session; Wolf sets them in the dashboard. Never deploy from CI.

### Secrets (set by Wolf in the Supabase dashboard under Edge Functions > Secrets; never in the repo, the client or a chat)
`STRIPE_SECRET_KEY` (a sandbox **restricted** key `rk_test_…` with: Checkout Sessions write, Customers write, Customer portal write, Subscriptions write, Prices read, Products read, Invoices read, Charges read), `STRIPE_WEBHOOK_SECRET` (from endpoint `we_1ULtdZDG83fIBduGUSmeRkSJ`), `SITE_URL` (`https://hotkey.gg`). The Stripe **publishable** key goes in `config.js`; it's the only Stripe value in the client.

## 6. Client (`app2/`)

- **Feature flag `payments`**, read in `config.js`: on for preview deployments, **off on hotkey.gg** until Wolf says go. With the flag off, the lock page and pricing page look exactly as they do now.
- `/checkout`: one page, one action. If signed out, an inline sign-in (email, then the 6-digit code typed on the same page) sits where the form will be; it notes that a school email gets the student price. Once signed in, call `create-checkout` and mount Stripe's form (`stripe.initEmbeddedCheckout({ fetchClientSecret })`). Beside it a short summary: what's included, "$15 a month" or "Student price $9 a month", "Cancel anytime from your account", the 14-day guarantee, "Payment is handled by Stripe. Your receipt comes from Link." If `create-checkout` answers `already_subscribed`, show the account's plan line and Manage billing instead.
- `/checkout/done`: an "Unlocking your course" state that polls the user's own entitlements every 2 s for up to 20 s, then the reward moment and the unlocked chapter list. On timeout: "Payment received. Unlocking can take a minute; refresh this page." with the support email.
- Pricing page: three columns. Free (Start free). Full Access ($15 a month; "Students $9 a month with your school email"; Get full access, which goes to `/checkout`). Teams ($12 a seat a month, 5 or more seats; Talk to us, a mailto to the support address).
- Lock page (Chapters 2–6): one primary action, Get full access, to `/checkout`.
- Account page: plan line ("Full Access, renews {date}", "Full Access, ends {date}", "Student price"), **Cancel subscription** (opens the portal on the cancel flow; visible, never buried) and **Manage billing** (portal home: card, invoices).
- Course-complete email: when a subscriber completes Chapter 6, send one email: what's left to practice, and a direct cancel link. It goes through whatever transactional email path accounts use; if none exists yet, log it as an event and send it once that path exists.
- All strings go in the copy sheets as drafts: no dash as punctuation, no emoji.
- Analytics events (first-party `events`): `pricing_view` (with `student`), `checkout_view`, `checkout_signin`, `checkout_start`, `checkout_unlocked`, `checkout_timeout`, `cancel_click`.

## 7. Exit check (sandbox; from the plan's Phase E row)

Each step runs end to end on a preview deployment with test cards (`4242 4242 4242 4242`; Link test passcode `000000`; `4000 0000 0000 0341` for a card that fails on renewal):
1. A signed-out visitor goes from the pricing page through the inline code sign-in to a paid subscription without leaving `/checkout`, and Chapters 2–6 unlock within 20 s.
2. A school-domain account sees and pays $9; a normal account $15.
3. A capped promo code applies; an expired or used-up one is refused.
4. A subscriber who opens `/checkout` again is shown Manage billing, not a second subscription.
5. Cancel subscription goes straight to the portal's cancel confirmation; after cancelling, access stays until period end + grace, then lapses.
6. A renewal (test clock, or `stripe trigger` / fixtures if test clocks don't work with Managed Payments) extends `ends_at`.
7. A failed renewal leaves access until period end + grace, then lapses; updating the card restores it.
8. A full refund revokes access and cancels the subscription; admin, redeem and group grants are untouched; a partial refund changes nothing.
9. A dispute revokes access.
10. A team subscription bought through a Payment Link grants nothing automatically and raises an alert when cancelled.
11. A duplicate or replayed webhook changes nothing; a bad signature gets 400.
12. Apple Pay shows in the form on Safari (registered domain). With the flag off, hotkey.gg is unchanged.

Node unit tests: the webhook's event-to-action mapping, the grace arithmetic and the student-domain check are pure functions tested inside the fast check. pgTAP suite 12 for the RPCs. The Stripe calls themselves sit behind one small adapter so tests never hit the network.

## 8. Hard stops

- Sandbox / test keys only. **No live keys, live products or real charges until Wolf says go live.**
- No change to the live pricing or legal pages on hotkey.gg (the flag handles this).
- The migration is applied, and the functions deployed, by the build session only after Wolf's go-ahead in that session. Never by CI.
- The sandbox secret key that was pasted into a chat on 2026-10-01 is not to be used; Wolf rolls it. The session uses only the restricted key in Supabase secrets, plus the Stripe CLI logged in by Wolf (`stripe login`) if it needs to inspect the sandbox or trigger test events.
- Work lands on branch `payments` (cut from `rebuild`) and merges to `rebuild` after the running content run lands, with Wolf's OK. Touch the lock, pricing and account pages as little as possible so R1b's interface rebuild merges cleanly.

## 9. Go-live (Wolf decides; the build session does the Stripe side)

1. Mirror section 3a into the live account (products, prices with the same lookup keys and tax code, portal configuration, payment method domain, webhook endpoint on API version `2026-08-26.dahlia` with the same nine events). Write it as an idempotent script, `app2/supabase/scripts/stripe-setup.mjs`, that reads a key from the environment and creates whatever is missing; Wolf runs it once against live, or the session runs it through a `stripe login` live session he authorises. Record the live IDs in a "Live state" table here.
2. Live restricted key and webhook secret into Supabase secrets; live publishable key into `config.js`.
3. Accept the Managed Payments terms in live mode if Stripe hasn't already; confirm the statement descriptor and support email.
4. Terms updated for the price, auto-renewal and how to cancel, the 14-day guarantee, and Link as merchant of record (lawyer review per plan section 5). Accountant confirms the bookkeeping for payouts net of fees and withheld tax.
5. One real purchase and refund by Wolf, then the flag goes on.

## 10. Why this pricing (the reasoning, for the record)

- **Monthly fits how people use it.** Education subscriptions are goal-shaped: a median 56% of monthly education subscribers renew after the first month and only 24% of annual ones renew after a year (RevenueCat 2026). People subscribe for a recruiting season or the run-up to an internship and leave when it's done. The average monthly subscriber is worth about 3 to 4 months.
- **$15, not $10.** Comparable web products: GoSkills $39 a month, OfferGoblin $39.99, AskStanley $16, Superday AI $12, LeetCode Premium $35. The median education app is $9.99, but that's mobile, where stores take 15 to 30%. Career-motivated buyers aren't very price-sensitive at this level, and $15 is still below the finance prep tools.
- **No own-it option.** The product keeps growing (new modules, refinements, add-on chapters), and lifetime buyers would expect all of it. Subscriptions are the category norm. The cost is mental accounting (a one-time purchase closes the account; a subscription reopens it monthly) and buyers who expense training, which the parked 12-month pass answers if demand shows up.
- **Three columns, not one.** Free, Full Access and Teams side by side give the buyer something to compare, which avoids single-option aversion, and the Teams column signals group use and collects B2B demand before team tooling exists.
- **Students by school email.** Automatic, honest, costs nothing; a public student code would leak to coupon sites. Showing $15 next to $9 also sets $15 as the fair full price.
- **Easy cancel.** See decision 5.

## 11. As built (2026-10-02, branch `payments`)

Where the build differs from the text above, and why. Everything else is as written.

- **Numbers.** Migration `app2/supabase/migrations/0011_billing.sql`, pgTAP `app2/supabase/tests/12-billing.test.sql` (69 assertions, green on a local Postgres 16 with pgTAP and a Supabase shim). 0009 and 0010 belong to the interface run.
- **Two more columns and two more RPCs.** `entitlements.auto_renew` (true while the subscription renews, false once it is set to cancel at period end) so the account page can say "Renews {date}" or "Ends {date}"; `billing_grant` takes it as a sixth argument. `billing_event_begin` and `billing_event_done` record and mark webhook events, so the webhook writes through RPCs only. A grant never shortens a row (a late, older event can't pull `ends_at` back) and never reopens a row ended by a refund or a dispute.
- **Return URLs.** The site routes on the hash, so Stripe returns to `SITE_URL/?checkout_session={CHECKOUT_SESSION_ID}` and the portal to `SITE_URL/?billing=done`; the shell turns those into `#/checkout/done?session_id=…` and `#/account?section=billing` at boot (app/main.js `stripeReturn`). `/checkout` on its own redirects to `/#/checkout` (_redirects).
- **Preview origins.** Both browser-called functions return to the request's own origin when it is the site or matches the optional secret `RETURN_ORIGINS` (comma list; `*` stands for one label, for example `https://*.<project>.pages.dev`); anything else returns to `SITE_URL`. CORS follows the same rule. For the preview exit check, Wolf adds `RETURN_ORIGINS` for the preview host (or the session asks him to).
- **Shared code.** The functions' logic is plain JS in `functions/_shared/billing.js` and `student-domains.js` (not .ts), so the fast check imports the same files the functions run; the Stripe and database calls sit behind `_shared/adapters.ts`. `node app2/tests/run-checks.js` runs `tests/billing.test.js` against fake adapters.
- **Stripe.js.** Loaded from `https://js.stripe.com/dahlia/stripe.js` (the release named for the pinned API version). The page calls `initEmbeddedCheckout`, or `createEmbeddedCheckoutPage` if that is what the loaded release offers. Confirm both in the exit check.
- **The flag.** `paymentsFlag(host)` in app/config.js: always off on hotkey.gg and www.hotkey.gg, on for `*.pages.dev` and a local server, off anywhere else. Off production, `localStorage.hk2_flag_payments` = `1` or `0` overrides it (tests and screenshots).
- **CSP.** The Stripe and Link hosts are added only for the preview hosts in `_headers` (the `https://:project.pages.dev/*` and `https://:version.:project.pages.dev/*` blocks drop the site-wide policy and set their own, with `payment` allowed for Stripe's frame). hotkey.gg keeps the strict policy; at go-live those lines move to `/*`.
- **Pricing page (Wolf, 2026-10-02).** The page shows the three columns whatever the flag says: Free, Full Access ($15 a month, students $9, recommended) and Teams ($12 a seat, 5 or more seats, Talk to us by email to teams@hotkey.gg). With the flag off, Get full access is disabled with "Checkout opens at launch."; on, it goes to `#/checkout`. The old $9/$90/$7/$70 figures, the Monthly/Yearly toggle and the yearly terms are gone. The paywall panel carries the same price line and goes to checkout with the flag on, to Pricing with it off.
- **Naming.** The plan reads "Full Access" on Pricing, the paywall, checkout and the account page, and the buttons read "Get full access" (screenplay 3.0 said "Pro" and "Go Pro"). Two short "Pro" tags remain in the copy sheet for Wolf to rename if he wants: `practice_pro` (a locked challenge's tag) and `daily_pro_note`.
- **Sign-in by code.** `auth.sendCode` / `auth.verifyCode` (Supabase email OTP). The Supabase "Magic Link" email template must include `{{ .Token }}` for the 6-digit code to arrive; that is a dashboard setting for Wolf.
- **Course-complete email.** Logged as the event `course_complete_email` (once per device) when a subscriber completes every lesson of Chapter 6; no email path exists yet.
- **Setup script.** `app2/supabase/scripts/stripe-setup.mjs` (section 9, step 1): idempotent, key from `STRIPE_SECRET_KEY`, refuses a live key without `--live`, `--dry-run` changes nothing, prints the state table. Not run yet.
