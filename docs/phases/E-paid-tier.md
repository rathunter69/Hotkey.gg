# Phase E build brief — Paid tier

Read first: `docs/SITE_SPEC.md` §7, §10, §11a, §12; `docs/REBUILD_PLAN.md` §2 row E and §4; `CLAUDE.md`. Work on branch `rebuild`, under `app2/` only. Old root code (`supabase/functions/create-checkout`, `STRIPE_SETUP.md`) is reference only, never imported.

## Preconditions (check before writing code)

1. Phase B must have landed `app2/app/supabase.js` (the client, publishable key only) and an auth module exposing the signed-in user and a change hook. `grep -rn "supabase\|auth" app2/app/` — today it returns nothing. If B is not there, stop and report; every server piece below depends on `auth.uid()`.
2. Phase D's progress tables are needed only by the group admin view; if absent, the admin view shows members and join dates, no progress.
3. `node app2/tests/run-checks.js` is green (< 30 s) before and after every step.

## Decisions

- **Processor: Paddle Billing, sandbox.** Design against it; Lemon Squeezy is the fallback (same shape: hosted overlay, HMAC webhook, `custom_data`). Only the webhook verifier and the checkout call differ, both isolated in one file each. Confirm Lemon Squeezy is still onboarding new stores before switching.
- **Entitlements are processor-agnostic.** A row says "access from `source` until `until`". No `pro` boolean (the old build's mistake). Access = any row with `until > now()`. A subscriber who redeems a group code gets a second row; nothing is double-charged.
- **Student v1** = the account's sign-in email is `.edu` or in `school_domains`. No secondary-email verification (needs an email provider we do not have). Rechecked yearly by `expires_at`.
- **Sample lessons**: exactly one lesson per paid chapter carries `access: 'sample'`; it opens for everyone. All other paid-chapter lessons are `access: 'paid'`.
- **Group codes are created by Wolf** via the Cowork chat (SQL), not self-serve. The admin view is read-only.

## Order of work

### 1. Content: Chapters 2 and 3 (`app2/content/`)

- `content/schema.js`: `ACCESS = ['free', 'paid', 'sample']`. Add to `CONCEPTS` every concept the new lessons teach (number-format shortcuts, custom format string, colour convention, indent, Center Across Selection, IF/AND/OR, IFERROR, DATE/EOMONTH/EDATE/YEARFRAC, ROUND family, COUNTIFS/SUMIFS, VLOOKUP/MATCH/INDEX/XLOOKUP, LEFT/RIGHT/MID/FIND/TRIM/SUBSTITUTE, PV/PMT/NPV/IRR, F2/F9 inspection). The validator rejects unknown ids.
- `content/index.js`: add two `CHAPTERS` entries, ids `formatting` and `formulas` (they must match `CHAPTER_PLAN` ids in `app/learn-page.js:12`), with the section lists from SITE_SPEC §7 verbatim, in order. Empty sections render as "Upcoming" already (`sectionsOf`).
- Lessons: `content/lessons/<kebab>.js`, one object each, same shape as `content/lessons/managing-sheets.js`. Minimum: every section of Chapters 2 and 3 has 2 lessons (target 4); each chapter has one `access: 'sample'` lesson in its first section. Each lesson: `chapter`, `section`, `read` (2–3 sentences), `par`, `goals` with end-state `check(sheet, session)`, `solution` keystrokes. Formulas graded live use `engine/live.js`, never regex.
- Engine gaps (do these, nothing else): (a) cells need a custom format string. Add `fmtCode` to `FMT_FIELDS` in `engine/sheet.js:41` and make `format.js dispText`/`fmtNum` render it through the TEXT format-code renderer at `engine/formula.js:499` (extract it to an exported `formatWithCode(value, code)`; keep `TEXT` calling it); wire the Format Cells dialog's Custom category to set it. (b) Missing functions with node tests each: `XNPV`, `XIRR`, `CEILING`, `FLOOR`, `INDIRECT`. Conditional formatting, printing/page-layout and outline levels are **not** built this phase: leave those sections empty (Upcoming).
- Catalog fixes: `app/learn-page.js:107` hardcodes `access-free` / "Free" for any built chapter — use `plan.access`. `app/home-page.js:44` and `app/landing-page.js:80` show "Paid · coming" for every non-free chapter — show lesson count and "Paid" when the chapter exists in `CHAPTERS`. `tests/public-pages.js:84` maps sample to "Paid" — add "Sample". Regenerate with `node app2/tests/public-pages.js --write`.

### 2. Access rules (`app2/app/access.js`, new, pure)

```js
export function computeAccess(rows, now = Date.now())
  // rows: [{ source:'paddle'|'group'|'comp', ref, until:ISO }]
  // → { paid:boolean, until:ISO|null, sources:[...] }
export function lessonGate(lesson, chapter, access)
  // → 'open' | 'paywall'   ('free' and 'sample' always open; chapter.access==='free' always open)
```

Client state: `access.js` also exports `getAccess()` (cached result of RPC `my_access`, refetched on auth change and after checkout returns) and `onAccess(fn)`. Guests: `{ paid:false }`.

Gating: in `app/main.js route()` after `lessonById`, if `lessonGate(...) === 'paywall'` mount `mountPaywall(rootEl, lesson)` from new `app/paywall.js` instead of the lesson view: title, chapter, "This lesson is in the paid tier", the sample-lesson link for that chapter, buttons "See pricing" (`#/pricing`) and, when signed out, "Sign in". Never mount the runner for a gated lesson. Catalog rows keep the `access-paid` / `access-sample` badges (`ACCESS_LABEL` already has Sample); `pickNextLesson` must skip `paywall` lessons for non-paid users (pass `access` in).

### 3. Database (`app2/supabase/migrations/2026MMDD_phase_e_*.sql`, not applied by you)

RLS on every table; client writes only via RPCs (`security definer`, `set search_path = public`, `auth.uid()` checked). Owner-readable selects only.

- `entitlements(id uuid pk, user_id, source text check (source in ('paddle','group','comp')), ref text, until timestamptz, note text, created_at)`; index `(user_id, until)`.
- `billing_customers(user_id pk, customer_id, subscription_id, plan text, status text, next_billed_at, canceled_at, updated_at)`.
- `billing_events(event_id text pk, kind text, payload jsonb, received_at, processed_at, error text)` — idempotency.
- `student_verifications(user_id pk, email, domain, verified_at, expires_at)`; `school_domains(domain text pk)`.
- `groups(id, org text, code text unique, seats int, ends_at timestamptz, admin_user_id, created_at)`; `group_members(group_id, user_id, joined_at, pk(group_id,user_id))`.
- `group_requests(id, name, org, email, seats, start_date, user_id null, created_at, handled_at)`.

RPCs: `my_access()` → `{ paid, until, sources[], student:{verified, expires_at}, billing:{plan,status,next_billed_at} }`; `student_verify()` (reads `auth.email()`, `.edu` or `school_domains`, upserts with `expires_at = now()+1 year`); `redeem_group_code(p_code)` → `{ org, until }` or raises `not_found|expired|full|already` (seat check `count(group_members) < seats` inside one transaction; inserts member **and** an `entitlements` row `source='group', ref=group.id, until=ends_at`); `group_admin(p_group_id)` (only `admin_user_id`; members + progress if D's tables exist); `request_group_access(...)` (rate-limited 3/day per email). Reprocessing rule: when a group's `ends_at` changes, its entitlement rows update (trigger).

SQL permission tests in `app2/supabase/tests/`: direct insert on each table fails as `authenticated`; a user reads only their rows; redeem beyond seats fails; expired code fails; `group_admin` from a non-admin fails.

### 4. Server functions (`app2/supabase/functions/`, Deno)

- `_shared/paddle-verify.js` (plain JS, WebCrypto, no imports — `run-checks` lints every `.js` under app2): `verifyPaddleSignature(header, rawBody, secret)`; header is `ts=…;h1=…`, HMAC-SHA256 of `${ts}:${rawBody}`. Node test with a fixed secret and body.
- `checkout/index.ts`: POST `{ plan: 'month'|'year'|'student_month'|'student_year' }`, JWT required; student plans require a valid `student_verifications` row; `POST {PADDLE_API}/transactions` with the plan's price id, `customer.email`, `custom_data.user_id`; returns `{ transaction_id }`. Env: `PADDLE_ENV=sandbox`, `PADDLE_API_KEY`, `PADDLE_PRICE_*`. Refuse to run when `PADDLE_ENV !== 'sandbox'` until Wolf flips it.
- `billing-webhook/index.ts`: verify signature, insert `billing_events` (`on conflict do nothing` → 200), then: `subscription.activated|updated` → upsert `billing_customers` and the entitlement row `(source='paddle', ref=subscription_id, until=current_billing_period.ends_at + 3 days)`; `subscription.canceled` → keep `until` (access to period end); `subscription.past_due|paused` → `until = now()`; `adjustment.created` with refund → `until = now()`. User id from `custom_data.user_id`.
- `group-request/index.ts`: calls the RPC, then emails Wolf via Resend (`RESEND_API_KEY`, as the old `weekly-digest` does); without the key it inserts only.

### 5. Client wiring

- `app/billing.js` (new): `startCheckout(plan)` → function → `Paddle.Initialize({ environment:'sandbox' })` + `Paddle.Checkout.open({ transactionId })` from `cdn.paddle.com/paddle/v2/paddle.js`, loaded only on click (the site has no third-party scripts; this is the one exception, note it in the file header). On close, refetch `my_access` and toast "Saved to your account".
- `app/pricing-page.js`: enable the three buttons; Student button calls `student_verify` first and explains a `.edu` email is needed when it fails; signed out → `#/account` then back. Show "You have access until …" instead of buttons when paid.
- `app/account-page.js`: add a **Billing** section (plan, status, next bill, group access rows, "Manage/cancel" via Paddle's customer portal URL, student status and recheck date).
- `app/teams-page.js`: "Have a code?" now calls `redeem_group_code` when signed in (keep the localStorage `CODE_KEY` for guests and redeem on first sign-in); the request form posts to `group-request` and says "Sent" honestly. Route `#/group/<id>` → `app/group-admin-page.js` (add to `parseRoute` and `LOADERS` in `main.js`): org, seats used/total, end date, member table.

### 6. Tests

- `tests/access.test.js`: `computeAccess` (expired, future, mixed sources, empty), `lessonGate` for free/sample/paid × guest/paid.
- `tests/content.test.js` additions: each paid chapter has exactly one sample; every lesson in a paid chapter is paid or sample; `CHAPTER_PLAN` ids match `CHAPTERS` ids.
- `tests/paddle-verify.test.js`: known-good and tampered signature.
- Engine tests for the five functions and `formatWithCode`.
- `tests/smoke.mjs`: `#/learn` shows a Sample and a Paid badge; a paid lesson URL renders `.paywall` and no `.goal`; the sample lesson opens and plays.
- Exit check (manual, sandbox): purchase, cancel, expiry, refund, group grant all change `my_access` correctly; record in `docs/REBUILD_PLAN.md` phase table only.

## Traps

- Never grade access client-side only: the paywall is UX; paid lesson content is public JS anyway, so nothing secret goes in lessons.
- `run-checks` fails on any bare import in a `.js` under app2 — keep `_shared/*.js` dependency-free; edge `.ts` files are not linted.
- Webhooks arrive out of order and twice: always upsert by `ref`, never increment; `billing_events` first.
- `until` must be timestamptz; compare with `now()` in SQL, never in the client for grants.
- Do not touch `supabase/**` at the repo root (it deploys to production on merge).
- Do not change live pricing copy or go out of sandbox without Wolf's word.