# Data, accounts, security and service integration audit

Reviewed September 17, 2026 against the working tree based on
`434bc0e8764e741e0e11f84cf51d61a1755d7c67` and connected Supabase project
`vshtftzrlepedydmkcnm`. This is review evidence, not an implementation queue or permission to deploy.

The main risks are specific: desk permissions can be bypassed, private account settings are
publicly readable, and two-factor enrollment does not lead to two-factor enforcement. Progress
and rankings also have several inconsistent paths. These need repair before a paid launch.

## Scope and confidence

Read the current continuity documents; reviewed SQL migrations, live policies, column grants,
constraints, triggers, all 54 public database function bodies, the two deployed Edge Functions,
and the account/progress/leaderboard/desk integration in the browser code. Read current Supabase
guidance using the Supabase and Postgres skills. No customer records, passwords, secret values,
or email payloads were retrieved. No database writes, exploit attempts, emails, purchases,
migrations or deployments were performed.

Two defects were reproduced offline using the actual extracted JavaScript functions and
synthetic data: account cache reuse and duplicate run retries. Other confirmed database findings
follow from the complete grant + policy + trigger + function chain, not from a live exploit.
They still need isolated database regression tests when repaired. Browser findings supplied by
the coordinating audit are identified below.

### What now matches the repository

- All 18 public tables have row-level security enabled. There are no public-schema views.
- All 54 live public functions were compared with the last `CREATE FUNCTION` body in local
  migration order. After line-ending/outer-whitespace normalization, 53 bodies match exactly.
  `issue_certificate` differs only by one explanatory comment; its SQL and track arrays match.
  This is function-body parity, not proof of complete schema, grants or service-setting parity.
- Deployed `create-checkout` version 51 and `weekly-digest` version 27 source both exactly match
  the corresponding repository files after line-ending normalization.
- The earlier inventory found 61 live migration stamps versus 52 local versions. Matching
  function bodies makes this less mysterious, but does not make migration history reconciled.
- Three scheduled jobs are active: weekly digest, guest-shell pruning and event retention.
  No scheduled job in the inspected catalog directly mentions `public.runs`. Scheduler commands
  and secret values were not printed. Successful execution and backup restoration remain untested.

## Findings to repair first

### DATA-01 — P1: desk membership and authority can bypass the intended controls

**Impact:** a signed-in account can add itself directly to an existing desk as a captain,
without its invitation or approval. Captain checks then trust that membership. That grants
access to the invite code and captain actions, including removing members. A caller can also
choose its joining date, which is used to allocate paid seats by seniority.

**Confirmed live:** `authenticated` has INSERT on all `team_members` columns. The
`members_insert` policy checks only `auth.uid() = user_id`. Its only insert trigger,
`desk_cap_guard`, checks the 200-person cap. The role constraint accepts `captain`; the unique
index restricts each user to one desk but does not prevent a second captain. `is_desk_captain`
trusts the role; `members_delete` accepts that function; `my_desk` returns the invitation code
for that role. No missing guard elsewhere closes this route.

Source: `supabase/migrations/20260903000600_policies.sql:184`,
`20260712000000_desks.sql:50`, `:67`, `:133`; paid seat calculation in
`20260717500000_desk_pro_seats.sql:8`.

**Related desk write gaps, also confirmed live:**

- The owner can insert/update all `teams` columns, including `verified` and `edu_domain`.
  Policies check ownership only; the two triggers validate the name and creation frequency.
  Direct insertion bypasses `create_desk`'s full-account and PRO checks. An owner can claim a
  verified badge or a school association through those writable fields.
- `team_applications` permits direct self-insert, with no validation trigger. That bypasses
  `apply_to_desk`'s full-account, private-desk, recruiting and five-application checks.
- `team_assignments` has no direct write policy: its broad table grants alone do **not** make
  direct assignment writes possible. Its captain functions inherit the membership problem above.

Source: `20260903000600_policies.sql:170`, `:195`; `20260725100000_desk_create_pro.sql:76`;
`20260724200000_security_regression_fix.sql:87`; `20260712400000_desk_seeds_and_controls.sql:11`.
The verified badge is rendered in `lb.js:303`; home-desk matching trusts `edu_domain` in
`20260712500000_school_tags.sql:72`.

**Repair shape:** make controlled server functions the only route for membership, desk creation
and applications. Keep verified/school identity and joining dates server-controlled. Preserve
all existing guards. Test unrelated user, member, captain, owner, anonymous session and admin,
including direct table requests; testing only the buttons would miss this failure.

### DATA-02 — P1: profile privacy is enforced by the screen, not the database

**Impact:** an unauthenticated caller can read every profile column, including school domain,
school tag, saved achievement/streak state and email preferences. Turning off school display
does not prevent retrieval of the school fields.

**Confirmed live:** `profiles_read_all` is an unrestricted SELECT policy, and `anon` has SELECT
on every profile column. `show_school` is not part of that policy. The account checkbox says
“show on card & boards”; the browser honors it visually, but the table remains readable.
This finding concerns profile metadata; it does not establish public access to account email
addresses in `auth.users`.

Source: `supabase/migrations/20260903000600_policies.sql:107`; `account.html:679`;
`nav.js:1430` records what `client_state` contains.

**Repair shape:** separate public display information from private account state. Give public
readers only the intended fields, with school visibility enforced in the database. Preserve
own-account settings access. Test a hidden-school profile using unauthenticated and other-user
requests, not just the rendered card. Supabase distinguishes
[row access from column access](https://supabase.com/docs/guides/database/postgres/column-level-security).

### DATA-03 — P1: “two-factor is on” overstates current application protection

**Impact:** the app can enroll an authenticator and show success, but its login flow does not
ask for the second factor. The inspected application data permissions do not require it either.

**Evidence:** `account.html:767–784` lists/enrolls/verifies factors. `index.html:33014` signs in
with a password and then reloads. No other runtime MFA calls, assurance-level checks or login
challenge were found. The inspected live public policies and functions contain no MFA/`aal2`
condition. The “manage” button also invokes enrollment again; there is no factor-removal flow.

This confirms incomplete application enforcement. We did not enroll a real factor or test
Supabase Auth's separate protections for its own sensitive endpoints. Current Supabase guidance
requires a [login challenge and authorization enforcement](https://supabase.com/docs/guides/auth/auth-mfa),
as well as enrollment.

**Repair shape:** complete the opted-in user's login/recovery/manage lifecycle and enforce the
chosen rule at protected data/function boundaries. A UI-only check is insufficient. Prove that
a password-only session cannot perform the protected action after MFA has been enabled.

### DATA-04 — P1: rankings and saved progress are calculated from incomplete or inconsistent reads

**Impact:** as history grows, a slower drill or player's results can disappear from a page's
calculation. A data-service failure can look like an empty leaderboard. A player can see a
flagged result as a personal best while other people cannot see it.

**Evidence:** `lb.js:157–161` loads global profiles/runs/sessions/memberships without pagination.
`nav.js:502–505` loads globally fastest runs before deriving the signed-in user's history.
There is no complete-history guarantee or requested total count. The exact current API row
cap was not established. The coordinating audit's synthetic cap of two rows across three
fixture runs lost the slower `autofit` board; a returned API error became an empty runs array.

The live run/session read policy intentionally allows clean rows **or the caller's own rows**.
These clients do not add `flagged=false`. `index.html:34397` also restores PBs from own runs
without excluding flags. `account.html:521` counts certificate coverage without excluding them,
while `issue_certificate` correctly requires unflagged, mouse-free runs. This produces a
claimable-certificate mismatch as well as inconsistent personal standings.

**Repair shape:** define one competitive result rule and a complete query contract. Fetch
personal history separately from public standings; return explicit failure rather than empty
success. Use server-side summaries/pagination appropriate to the page. Test a capped response,
flagged own result, second device, empty account and service failure.

### DATA-05 — P2: an open tab can reuse another account's profile data

**Impact:** changing accounts through another tab can leave the first tab showing progress
calculated for the earlier account, even though the header now identifies the new one.

**Offline reproduction:** actual `loadProfileData` and `clearAccountUI` functions from `nav.js`
were evaluated with two synthetic users. Load A, clear account UI, change `_navUser` to B, load
again: `currentUser="user-b"`, `returnedRunOwner="user-a"`, `sameObject=true`, three total
database fetches. No new fetch occurred for B.

Source: the single page-lifetime promise at `nav.js:496–501`, derived `myRuns` at `:544`, and
the auth-change handler at `:1294`. Normal explicit sign-in reloads the page, so this is most
relevant to reactive/cross-tab changes. Clearing storage does not clear that promise.

**Repair shape:** bind cached data and outstanding requests to the account ID. Invalidate on
account changes and ignore responses started for an earlier account. Test delayed A responses
arriving after B signs in. The coordinator separately reproduced the stale resume-key mismatch:
sign-out removes `hk_last_drill`, while the trainer uses `hotkey_last_drill`.

### DATA-06 — P2: a lost response can record the same completion twice

**Impact:** a network interruption after a successful database write can inflate run counts,
activity and XP when the app retries. The leaderboard's minimum time hides the duplicate,
but the rest of the product counts runs too.

**Offline reproduction:** the actual `recordRun` function was run with a mock that saved its
first insert but returned a lost-response error. The inline retry saved the same completion
again: `savedResult=true`, `insertsAfterOneCompletion=2`, `stableRunIdProvided=false`.

Source: `index.html:34496–34515`. The payload has no stable run ID; the database assigns a new
ID on each insert. `run_stats_apply` increments its count after each accepted insert
(`supabase/migrations/20260903000800_run_stats.sql:115`). The comment that duplicates are
harmless is therefore only true for selecting a minimum time.

**Repair shape:** create one persistent completion ID before the first attempt and reuse it
for all retries/outbox flushes, with database uniqueness. Verify an uncertain response plus
retry yields one result, one count and one XP contribution.

### DATA-07 — P1 before competitive launch: server checks do not establish a valid completion

**Impact:** the service accepts results that pass simple numeric/trace checks; it does not
establish that the drill was completed. Client controls are also stronger than direct database
controls, so anonymous sessions can bypass the browser's no-posting rule.

**Confirmed live:** run/session inserts bind the user ID and have numeric/rate guards. They do
not reject the JWT's anonymous-session claim. Runs accept any suitably shaped challenge text;
the expected key count and trace are supplied by the caller. `runs_guard` does not replay a
drill or verify its result. Its trace requirement also depends on the caller's key count.
Certificates correctly check qualifying stored runs, but cannot improve the trustworthiness
of those inputs.

A separate, concrete defect weakens the rate limits: clients may insert `created_at` on both
runs and sessions, and neither guard replaces it. The limits count records using that field.
Backdated inserts therefore escape the recent/day counters and distort activity history.
No such insert was attempted against the live project.

Source: `supabase/migrations/20260717100000_run_integrity.sql:18–94`,
`20260723000000_sessions_guard.sql:19–76`, `20260903000600_policies.sql:155–166`;
client-only posting exclusions in `index.html:34499` and `:34521`.

**Repair shape:** stamp receipt time on the server, enforce account eligibility there, and
decide what evidence public competition/certificates require. At minimum validate catalog
identity and server-owned parameters. Stronger replay/issued-challenge verification is a
product/architecture decision, not an incidental cleanup. Test direct requests that bypass UI.

## Integration and unfinished work

| Area | Current behavior | Consequence / next decision |
|---|---|---|
| Learning state | `nav.js:1430` syncs achievement flags, seen achievements, streak and daily latches through `profiles.client_state`. Guide completion, resume location and local XP bonuses are outside that snapshot. | Define which learning state must follow the account. “Progress is saved” is presently narrower than all visible progress. |
| Multi-device writes | The client sends a whole snapshot after 2.5 seconds; merge happens when reading, not atomically on the server (`nav.js:1440`). | Concurrent devices can overwrite each other's newer state. Require a two-device conflict test; no concurrent live test was run. |
| Aggregates | `run_stats` is maintained after INSERT only, and runtime readers still use raw runs. Admin clearing/deleting a run does not recompute the aggregate. | Do not introduce run deletion/retention or switch boards to this table until correction behavior and readers are reconciled. This gap is already acknowledged in the migration/`dev/RUN_STATS_PLAN.md`. |
| Paid access | `HOTKEY_PREMIUM.enabled=false`, `HOTKEY_PRO.freeNow=true`, trainer `PRO_PERKS_FREE=true`; server desk creation still checks `my_pro()`. `hkFlagPro` reads retired `HOTKEY_PRO.beta` (`nav.js:1786`). | The app has several meanings of PRO. A visible free perk, account entitlement and desk seat need an agreed contract before billing activation. |
| Checkout | Deployed/source checkout refuses live Stripe keys. It accepts `user_id` from the request body instead of deriving it from the validated session. JWT verification is on, but that alone does not bind this body field. | Keep it test-only. Before activation bind checkout to the caller; add verified billing events, renewal/cancellation/failure handling and customer billing management. |
| Entitlements | Live `entitlements` denies client writes and restricts reads to the account. School trials and admin desk grants are separate server paths. No deployed billing webhook was present in the earlier inventory. | This is unfinished integration, not evidence of a client-writable subscription table. Do not enable payment by flipping display flags. |
| Email | Deployed weekly digest has JWT verification off but explicitly checks `x-digest-secret`, then uses a service-only payload function. Other email toggles have no matching deployed functions in the inventory. | A missing JWT is not an open email endpoint here. Actual delivery/secrets were not tested. Digest SQL does not exclude flagged runs, so its “clean” counts/rank can differ from public boards. |
| Public desks | Desk names, membership, roles and assignment notes are publicly readable, including for `is_private` desks. Invitation codes have restricted column reads. | Settle whether “private” means invitation-only or private visibility. Public visibility is verified; its intended scope is a product decision. |
| Profile moderation | Handle moderation runs BEFORE UPDATE, but allowed profile columns can be inserted directly. The handle format constraint does not implement the reserved-word list. | Initial direct profile creation can bypass reserved-handle checks. Extend moderation to inserts while preserving legitimate profile-creation paths. |
| Earned identity | Flair/featured achievements/client state are account-editable; displays trust stored selections. | Decide whether these are decorative self-expression or verified accomplishments. Do not describe them as server-verified credentials today. |

Paid lesson data is embedded in the publicly served application. A browser-only gate can control
the normal product journey, but cannot make that source content confidential. What a subscription
actually promises remains a product decision.

## Advisor findings checked rather than counted as bugs

- Ten live `admin_*` functions and `set_desk_pro_seats` all check `is_admin()` before returning
  data or changing it. `is_admin` reads the caller's admin row; the table has no client write
  policy. Broad base grants do not permit self-promotion without a write policy.
- All inspected security-definer functions have an explicit search path. The two functions
  callable before sign-in are `preview_desk` and `is_desk_captain`; the former requires the
  code and returns a name/slug/member count, and the latter evaluates the caller's membership.
  Neither is an administrator bypass merely because it is callable.
- No-policy notices for `desk_creations`, `desk_pro_grants` and `school_map` describe intentional
  client denial with controlled server access. Adding permissive policies would make them less safe.
- The advisor listed anonymous-access notices for several tables. Live grants show clients
  cannot SELECT `auth.sessions`, and do not have USAGE on the `cron` schema. Those notices do
  not establish access to authentication sessions or scheduled-job commands.
- `pg_net` in the public schema remains a hardening item. Review extension placement through
  a tested migration; it is not evidence by itself that users can invoke arbitrary network calls.

Advisor explanations: [functions callable before sign-in](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable),
[functions callable after sign-in](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable),
[RLS with no policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy),
[extension placement](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public).

## Repair order and remaining verification

1. Close desk write bypasses and profile metadata exposure with new migrations tested against
   guest/owner/other-user/captain/admin fixtures. Do not rewrite old migrations.
2. Complete or clearly withhold the incomplete MFA promise. Check authentication recovery and
   account deletion in an isolated account lifecycle test.
3. Repair account cache/resume isolation, result query completeness and errors, and retry identity.
   Agree on account progress and competitive-result rules before wider extraction/refactoring.
4. Reconcile saved state, aggregate corrections and paid-access meaning. Keep billing dormant
   until its full lifecycle can be tested.

Still unverified: Auth dashboard configuration (redirects, email confirmation, rate limits,
SMTP, password protections), backup/restore, API exposure settings and row cap, real multi-device
flows, paid lifecycle, data retention requirements, and a systematic stored-XSS/URL-input test
matrix. Spot inspection found escaping on several public renderers but is not an XSS clearance.
The current CSP permits inline scripts, increasing the importance of those input tests.
Deployment and Git controls are owned by the delivery audit; do not infer deployment health
from database function parity.

No application or database fix was made by this audit agent. Only this report was added.
