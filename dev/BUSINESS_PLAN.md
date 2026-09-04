# BUSINESS PLAN — entity, money rails, accounting, accounts (reserved plan, r451)

_Reserved 2026-09-03 for a dedicated session. This is the operating checklist for turning hotkey.gg
from a side project into a company that can take a payment: where and how to form the LLC, the
bank account, wiring Stripe live, bookkeeping that will not hurt later, and how mail, logins and
bills are routed. It builds on `dev/EMAIL_SETUP.md` (mailboxes + DNS), `STRIPE_SETUP.md` (the test
scaffold), `dev/LAUNCH.md` (the flag flip), `dev/TRUST_SAFETY.md` (policy text) and the r450
paywall inventory in `dev/AUDIT.md` (the three files / five lines Stripe replaces). Nothing here is
legal or tax advice — §0 names the two professionals worth an hour each before step 1._

## 0 · Before anything: the two gates

1. **The outside-business-activity (OBA) check.** PROJECT_CONTEXT's standing constraint was
   "no entity formation, no OBA-flag risk until the internship ends." If Wolf is (or will be) a
   FINRA-registered person at an employer, forming an LLC that sells a product and forms the
   intent to take revenue is an OBA that must be disclosed to and cleared by the employer's
   compliance desk **before** it starts (FINRA Rule 3270). Most banks also have an outside-
   activities / personal-investment policy that covers side companies whether or not the person is
   registered. **Decision for Wolf: is the constraint lifted, and has compliance cleared it in
   writing?** Everything below waits on a yes. One conversation with compliance (and, if the
   answer is nuanced, a one-hour call with a securities-employment attorney) is the whole gate.
2. **A one-hour CPA consult** once the state is chosen (§1): entity tax treatment, sales tax on
   digital subscriptions in the home state, estimated-tax cadence, and what to keep. Cheap
   insurance against the two mistakes that are expensive to unwind (wrong state, commingled money).

## 1 · The entity — where and how

**Recommendation: a single-member LLC in the state Wolf lives and works in**, unless venture
funding is planned inside ~12 months (then a Delaware C-corp from the start, ideally via Stripe
Atlas, and skip the LLC). Reasoning, so the session does not re-derive it:

| option | when it fits | cost shape | why not by default |
|---|---|---|---|
| **Home-state LLC** | bootstrapped SaaS, one owner, no investors yet | filing $50–$500 once; annual report $0–$300 (CA is the outlier: $800/yr minimum franchise tax; NY adds a one-time publication requirement that can run $1–2k) | — this is the default |
| Delaware LLC | investors insist on DE, or multi-state founders | $90 filing + $300/yr franchise tax + registered agent ~$100/yr **plus** foreign registration in the home state anyway (you still operate there) | pays twice for a benefit that only matters at a VC round |
| Wyoming LLC | privacy / no state income tax marketing | $100 filing, $60/yr | same foreign-registration problem; the privacy benefit is thin for a public-facing product with a founder on LinkedIn |
| Delaware C-corp (Stripe Atlas) | raising priced equity soon; option pool; SAFEs | ~$500 bundle: incorporation + EIN + bank intro + Stripe account; $400/yr DE franchise + registered agent | double taxation and corporate formalities are overhead a solo bootstrapped product does not need yet; an LLC can convert later |

**Steps (a day of admin, most of it waiting):**
1. Name availability search on the state's business registry; the entity name can be "Hotkey Labs
   LLC" or similar — the brand stays hotkey.gg (a DBA is only needed if the site name must appear
   on legal docs; usually the LLC name + "d/b/a hotkey.gg" on invoices is enough).
2. File the **Articles / Certificate of Organization** online with the state. Registered agent:
   Wolf's own address is fine in most states if he does not mind it on the public record;
   otherwise a service (~$100–150/yr) — pick this at filing.
3. **EIN** from the IRS (free, online, same day; do it the moment the state confirms). Never pay a
   third party for an EIN.
4. **Operating agreement** (single-member): a short template is fine and banks ask to see one.
   It is what makes the LLC look like an LLC if anyone ever tests the liability shield.
5. **Beneficial-ownership (BOI) report**: check the current FinCEN rule at the time — in 2025
   FinCEN exempted domestic US companies from BOI reporting; confirm that still holds before
   assuming nothing is due.
6. **State registrations**: sales/use tax account only if the home state taxes digital
   subscriptions (many do; Stripe Tax handles collection but registration is the founder's job);
   local business license if the city requires one.
7. Put the legal entity name into `terms.html` / `privacy.html` (both currently name no entity) and
   add a **refund policy** page or section — Stripe requires a visible refund/cancellation policy
   and a public support contact before a live account is approved.

## 2 · The bank account (before Stripe)

- Open a **business checking account in the LLC's name** with the EIN letter, the Articles, the
  operating agreement and ID. Startup-oriented options (Mercury, Relay, Brex — no fees, virtual
  cards, good Stripe/QuickBooks integrations) or the founder's existing bank for a walk-in
  relationship. Any is fine; the rule is **one business account, zero personal money through it**.
- Order a **business debit/credit card** and put every vendor on it (§5). The card statement
  becomes the expense ledger.
- Keep a small float (2–3 months of the §5 run-rate, ~$300) so autopay never bounces.

## 3 · Stripe — from the test scaffold to live

The code side is already inventoried: `STRIPE_SETUP.md` (test-mode scaffold, the `sk_test_` guard
in `supabase/functions/create-checkout`, the entitlements table) and the r450 AUDIT entry (the one
entitlement read `hkEntitlementRead()`, `loadEntitlement()`, the disabled `#pwCheckout` stub, the
`TBD` price token, the sign-out wipe). The business steps around it, in order:

1. **Create the Stripe account under the LLC** (legal name, EIN, business address, the business
   bank account for payouts, `billing@hotkey.gg` as the account email, `hello@hotkey.gg` as the
   public support contact, the site URL with terms / privacy / refund policy live). Stripe verifies
   the entity up front — forming the LLC first avoids a re-verification.
2. **Products and prices** (live mode): `HOTKEY_PRO.plans` today says $7/month and $19/season —
   placeholders. Pricing is Wolf's call at launch (`dev/CONTINUITY.md` §6 item 2). Create the
   monthly + seasonal recurring prices; consider an **annual** only if B2B desks ask.
3. **Stripe Tax** on, with the home-state registration from §1.6; it decides per-buyer whether
   digital-subscription tax applies. **Stripe Customer Portal** on for self-serve cancel/upgrade.
4. **Edge functions**: deploy `create-checkout` with the live key in Supabase secrets (remove the
   `sk_test_` guard deliberately — it is a one-line, intentional edit, recorded in AUDIT), build
   the **webhook** function (`checkout.session.completed` → `entitlements.pro=true`;
   `customer.subscription.deleted` / `invoice.payment_failed` → revoke) with **signature
   verification** and **idempotency** on `event.id` (this is also §4 of `dev/SECURITY_PLAN.md`).
5. **Wire the five lines** the r450 inventory marks `STRIPE GOES HERE`, keep the read synchronous
   and default-false-on-error, flip `HOTKEY_PREMIUM.enabled` only as a separate, Wolf-gated
   product decision (WORKFLOW §2 standing gate).
6. **B2B / desks**: use **Stripe Invoicing** (or a payment link) per desk rather than building
   seat billing — the enterprise page already exists; `desk_pro` / `desk_pro_seats` migrations
   carry the entitlement side. Net-30 invoices to a school club or an L&D budget are the norm.
7. **Payout cadence**: daily automatic to the business account; reconcile monthly (§4).

## 4 · Accounting that stays small

- **Cash basis, single-member LLC = disregarded entity**: income and expenses flow to Schedule C
  on the founder's return by default. Revisit an **S-corp election** only when net profit is
  comfortably above the salary-plus-payroll-cost threshold (the CPA will name the number; it is
  typically well into five figures of profit).
- **Bookkeeping tool**: Wave (free), QuickBooks Simple Start (~$30/mo) or Xero. Connect the bank
  + card + Stripe; categorize monthly. At this volume a disciplined spreadsheet also works — the
  requirement is a ledger that ties to the bank statement every month, not a particular app.
- **Chart of accounts (tiny)**: Revenue — subscriptions · Revenue — desks/B2B · COGS — hosting
  (Supabase, Cloudflare, Resend) · COGS — payment fees (Stripe) · Software & tools (Claude Code,
  Google Workspace, domain, bookkeeping) · Professional fees (CPA, legal, state fees) · Marketing.
- **Cadence**: monthly close (15 minutes: categorize, reconcile Stripe payouts to deposits,
  file the Stripe monthly tax report); **quarterly estimated taxes** if profit appears; annual
  state report on the anniversary; 1099-NEC for any contractor paid ≥ $600.
- **Keep**: bank/card statements, Stripe reports, receipts (forward to `billing@` — §5), the
  formation documents, and this file's decisions log.

## 5 · Mail, logins, bills — the routing table

`dev/EMAIL_SETUP.md` has the DNS and mailbox how-to. **This table is the canonical list of hotkey.gg
addresses.** Site pages, Supabase/Resend senders, vendor logins and the security.txt file must match it;
add an address here first, then use it. One real mailbox; everything else is a Workspace alias (free) or
a send-only Resend identity.

**The one mailbox**

| address | what it is | used for |
|---|---|---|
| `wolf@hotkey.gg` | the one real mailbox (Google Workspace Starter, ~$7/mo) | founder identity; owner login on registrar, Cloudflare, GitHub, Supabase, Stripe, bank |

**Customer-facing aliases** (all → wolf@; Gmail filter labels them so one inbox stays sortable)

| address | used for | where it is named |
|---|---|---|
| `hello@hotkey.gg` | support, bug reports, general questions, press; Stripe public support contact; the reply-to on every outbound mail | contact.html, footer, receipts, Stripe |
| `billing@hotkey.gg` | vendor invoices + autopay receipts; Stripe account email; Supabase Pro billing; refund requests | billing.html, Stripe, every vendor account |
| `security@hotkey.gg` | vulnerability disclosure (today security.html points at hello@ — fix in T3) | security.html, `/.well-known/security.txt` |
| `privacy@hotkey.gg` | data-access / deletion requests (GDPR/CCPA wording in privacy.html) | privacy.html |
| `legal@hotkey.gg` | DMCA, terms questions, counsel, registered-agent mail | terms.html, privacy.html |
| `teams@hotkey.gg` | desks, schools, clubs, enterprise pilots; the address on the team application flow | contact.html "schools", teams page, `team_applications` |

**Required-by-convention aliases** (→ wolf@; never advertised, but mail servers and vendors expect them)

| address | why it exists |
|---|---|
| `admin@hotkey.gg` | Google Workspace super-admin recovery; domain-verification mails from vendors |
| `postmaster@hotkey.gg` | RFC 5321 requirement; bounce and abuse reports from other mail servers |
| `abuse@hotkey.gg` | RFC 2142; where ISPs and Cloudflare route abuse complaints |
| `dmarc@hotkey.gg` | `rua=` target in the DMARC record (EMAIL_SETUP §1); aggregate reports land here |

**Vendor-login aliases** (→ wolf@; one alias per vendor so a leaked password or a handoff is one account, not all)

| address | vendor login it owns |
|---|---|
| `supabase@hotkey.gg` | Supabase organisation owner |
| `github@hotkey.gg` | GitHub organisation / deploy account |
| `cloudflare@hotkey.gg` | Cloudflare account (DNS, Pages) |
| `stripe@hotkey.gg` | Stripe account owner (billing@ stays the invoice address) |
| `registrar@hotkey.gg` | domain registrar |

**Send-only identities** (Resend; SPF/DKIM per EMAIL_SETUP §1; replies route to hello@)

| address | sends |
|---|---|
| `auth@hotkey.gg` | Supabase custom SMTP: magic links, password resets, email change |
| `notifications@hotkey.gg` | receipts, streak/recap mails, achievement unlocks, team invites (replaces `no-reply@` — a no-reply sender hurts deliverability and hides replies we want) |
| `recap@hotkey.gg` | the weekly recap campaign (kept separate so unsubscribes do not touch transactional mail) |

**Internal**

| address | used for |
|---|---|
| `ops@hotkey.gg` | machine alerts: Supabase, Cloudflare, uptime, GitHub Actions failures; filtered to its own label |

Not on the list, on purpose: `contact@` (hello@ is the one public address), `info@`, `sales@`
(teams@ covers it until there is a sales function), `no-reply@` (see notifications@). Site mismatches
to fix are parked in ROADMAP §3 and belong to track T3.

- **Password manager with a business vault** (1Password Business or Bitwarden): every account
  above, shared later with a co-founder or contractor by vault, never by chat. **Hardware-key 2FA**
  on the five accounts that can end the company: registrar, Cloudflare, GitHub, Supabase, Stripe
  (Google Workspace too). Recovery codes printed and in the same place as the formation papers.
- **Bills on the business card, receipts to billing@**, autopay on: Supabase Pro (~$25/mo — worth
  it before real users for daily backups + PITR, per EMAIL_SETUP §3), Google Workspace, domain
  renewal (multi-year, auto-renew on, registrar lock on), Resend (free tier until volume), Claude
  Code, bookkeeping tool. Cloudflare and GitHub Pages are $0.
- **An accounts register** (one sheet, in the vault): service · owner login · billing email ·
  card · renewal date · 2FA method. This is the document a successor or an accountant needs.
- **Insurance**: not needed for B2C beta. Revisit general liability + tech E&O (~$500–1,500/yr)
  when a bank or school signs a desk contract that asks for it — they will.

## 6 · Sequence (four short sessions, none blocking product work)

| when | do | output |
|---|---|---|
| S1 | §0 OBA clearance; pick the state; CPA hour | a written yes; state + entity type decided |
| S2 | §1 file, EIN, operating agreement, state tax registration; §5 Workspace + the full alias table + DNS (EMAIL_SETUP §1) | LLC exists; wolf@ and every alias in §5 live |
| S3 | §2 bank + card; §4 bookkeeping connected; §5 vault, 2FA, register; move every vendor to billing@ + the card | money and logins separated from personal |
| S4 | §3 Stripe live account, products, Tax, portal; webhook + checkout functions deployed (with SECURITY_PLAN §4); terms/privacy/refund updated with the entity | a live checkout behind the still-OFF flag; the premium flip becomes a pure product decision |

## 7 · Decisions for Wolf (chat, one line each)

1. Is the OBA / employer constraint lifted, and cleared in writing?
2. Home state (for §1's cost table) — and any plan to raise money within 12 months?
3. Entity name (brand stays hotkey.gg).
4. Bank: startup-neobank (Mercury/Relay) or existing bank?
5. Bookkeeping: tool or spreadsheet?
6. Pricing at launch (replaces the $7 / $19 placeholders) — a product decision that Stripe setup
   needs a number for, even if it changes.
