# SECURITY HARDENING — the reserved pass (r451 plan)

_Reserved 2026-09-03 for a dedicated session ("a session or pass for security and cybersecurity
related hardening"). This file is the scope, the method and the definition of done, so that
session starts building on minute one. Standing context: the r414-review Segment A shipped the
first pass (`_headers` CSP, `dev/check-secrets.sh`, `security.html` draft); r417 found and fixed two
LIVE RLS regressions (`desk_name_guard`, `apply_to_desk`) caused by `create or replace` off stale
copies — the origin of the diff-before-replace house rule; `20260717200000_security_hardening.sql`
and `20260724200000_security_regression_fix.sql` are the last two security migrations. This pass
is the systematic version of those one-offs._

## 0 · Threat model (what we are actually defending)

| asset | threat | today |
|---|---|---|
| user accounts + emails (Supabase Auth) | credential stuffing, account takeover, enumeration | Supabase defaults; no leaked-password check or MFA confirmed |
| run / leaderboard integrity | forged runs (the product's currency is a time) | `run_integrity` + `sessions_guard` migrations, client-side keystroke traces; server trust boundary needs re-verification |
| desks / handles | impersonation of firms, abuse | protected names + blocklist shipped (TRUST_SAFETY); report flow NOT built |
| entitlements (soon money) | free access to paid tier, webhook forgery | RLS writes = service role only; webhook not yet built; client read is presentation-only (r450) |
| the deploy pipeline | a bad push = a live incident (static site, push-to-main deploys) | CI gate on PRs; branch protection / required checks unverified; fine-grained tokens pasted in chat historically |
| secrets | committed keys, long-lived management tokens | `check-secrets.sh` in CI; a Supabase management token was live "for session use" (r417, rotation recommended, not confirmed done) |
| the browser | XSS via user-controlled strings (handles, desk names, titles), clickjacking, third-party script | inline-heavy app, CSP allows `unsafe-inline`; supabase-js from jsdelivr — pin + SRI status to verify |

## 1 · Scope — the eight domains (one audit agent each, WORKFLOW §1 fleet model)

1. **Database: RLS, grants, RPCs.** Every table's policies vs the intended matrix (read own /
   read public / write own / service-only); every `security definer` function re-read against its
   NEWEST prior definition (the r417 class) with an explicit `search_path`; `anon` vs
   `authenticated` grants per column (the r417 profile-grant fix showed drift); the `admin.sql`
   surface (who can call what); `delete_account` completeness (every table with a user FK);
   `events` insert-only; the smoke-fixture accounts (LAUNCH §0.5) removed. Output: a policy matrix
   + a diff-before-replace verification for each function + a migration with fixes.
2. **Auth.** Supabase Auth settings: email confirmation on, leaked-password protection (HIBP) on,
   password minimums, rate limits, CAPTCHA on sign-up/sign-in (Turnstile — Cloudflare is already
   the DNS), optional TOTP MFA for account holders, JWT expiry and refresh, redirect allowlist
   exactly `https://www.hotkey.gg/*` (EMAIL_SETUP §3), anon-session abuse (guest accounts are real
   rows). Sign-out wipes every device-mirrored key (`hk_entitled`, `hk_dev_unlock`, outbox — the
   r416/r417 shared-machine class; re-verify the list is complete).
3. **Edge functions + secrets.** `create-checkout` (test-key guard stays until BUSINESS_PLAN §3),
   `weekly-digest` (`verify_jwt=false` pinned + `DIGEST_CRON_SECRET` — confirm the secret is
   actually checked), the three `dev/edge-*` campaigns; the coming **Stripe webhook** (signature
   verification, `event.id` idempotency table, revoke paths, no trust in client-supplied ids).
   Rotate: the Supabase management/personal access token, `SUPABASE_ACCESS_TOKEN` in GitHub
   secrets, any Resend key ever pasted. Secrets live only in Supabase secrets / GitHub secrets;
   `check-secrets.sh` gains patterns for Resend (`re_`) and Cloudflare tokens.
4. **Browser / front-end.** Sanitize every user-controlled string at render (handles, desk names,
   custom card titles, school tags, challenge-link params like `?race=…&by=…`); audit `innerHTML`
   sinks in `index.html` / `nav.js` / `lb.js` for interpolated user data; pin `supabase-js` to an
   exact version with an **SRI hash**; tighten CSP where the app allows (drop `https:` wildcards on
   `connect-src` to the Supabase host + Stripe; `frame-src` to Stripe only; keep `unsafe-inline`
   unless a hash strategy is cheap — the app is inline-script by design); add `HSTS` (with
   `preload` only after confirming every subdomain is HTTPS). **Verify which host actually serves
   production** — `_headers` is a Cloudflare Pages file; PROJECT_CONTEXT says GitHub Pages via the
   CNAME. If it is GitHub Pages, the headers are NOT applied and the CSP work must move to
   Cloudflare (proxy + Transform Rules / a Worker) or the site must move to Cloudflare Pages.
   This single fact decides the whole domain's plan; check it first.
5. **Run integrity / anti-cheat.** Re-read `run_integrity`, `sessions_guard` and the
   `hk_run_outbox` retry path: what the server verifies (keystroke count vs time, optimal-key
   floor, timestamps), what a modified client can forge, and what the leaderboard can tolerate.
   Decide the posture (statistical flagging + `issue_certificate` excluding flagged runs is the
   current line) and document it — not every forgery needs prevention, but every one needs a
   named response.
6. **Repository + pipeline.** Branch protection on `main` (PR required, the `gate` workflow
   required, no force-push), GitHub secret scanning + push protection, Dependabot for the
   Actions and the one npm dev dependency, Actions `permissions:` minimal (`contents: read`
   unless deploying), fine-grained tokens with expiry, 2FA enforced on the account, the
   `supabase-deploy.yml` deploy path reviewed (what a malicious PR could deploy — migrations run
   on push to main).
7. **Data + policy.** The data-retention decision (7-day detailed run history, aggregates
   permanent — PIPELINE ⚡, G10) implemented as a scheduled job; export/delete-my-data path
   (`delete_account` exists — verify it is reachable and complete); `privacy.html` matches
   reality (Supabase region, Resend, Cloudflare, Stripe as processors, cookies/localStorage
   inventory); `security.html` finalized — replace every `[bracketed]` draft note, name
   `security@hotkey.gg`, state "no monetary bounty", **claim nothing that is not verified in this
   pass**; the TRUST_SAFETY launch items (report flow, admin force-rename/suspend, audit trail,
   desk-creation rate limit, invite-code rotation).
8. **Operations.** Supabase Pro (backups + PITR) on; log retention and an alert on auth failures /
   error spikes; an **incident runbook** (rotate keys → revert deploy via PRELAUNCH_LOCK or a git
   revert → notify → post-mortem in AUDIT.md); an **access review** list (who/what holds which
   key); DMARC to `p=reject` once mail flow is stable; domain registrar lock + auto-renew.

## 2 · Method (one session, WORKFLOW §1 + §7)

- **Read-only fleet first**: eight parallel audit agents, one domain each, structured report
  ("your final message IS the report": ranked findings, file:line or dashboard path, severity,
  proposed fix, verified-live yes/no). Orchestrator banks each report to the scratchpad, then
  synthesizes into `dev/AUDIT_SECURITY.md` (the findings base for this pass, like AUDIT_R417 was).
- **Verify before fix**: every finding is a CLAIM until reproduced against the live project
  (Management API / dashboard / a headless probe). Security findings get a second skeptic agent
  (WORKFLOW §7 allows 2–3 for security-critical).
- **Fix in migrations and PRs, one theme per PR**; every fixed class lands a CI invariant in the
  same PR (`check-invariants.js`, `check-secrets.sh`, a new `check-rls.js` that asserts the policy
  matrix via the Management API where feasible).
- **Wolf gates** (WORKFLOW §2 standing): token rotation (he holds the tokens), Supabase Pro
  billing, Auth setting flips that change sign-up friction (CAPTCHA, confirmation), anything on
  `security.html`, and the hosting decision from §1.4.

## 3 · Definition of done

- `dev/AUDIT_SECURITY.md` exists with every domain's findings, each marked fixed / accepted-risk
  (with reason) / deferred (with owner).
- The RLS policy matrix is written down and asserted by a check that runs in CI or on demand.
- Every long-lived token rotated; `check-secrets.sh` covers every vendor in use.
- Branch protection + required gate + secret scanning confirmed on the repo.
- The hosting question answered and the headers actually applied (verified with a live
  `curl -I`).
- `security.html` published with only verified claims; `security@` receives mail.
- The Stripe webhook design (verification + idempotency) written so BUSINESS_PLAN §3.4 builds to it.
- An incident runbook in `dev/`.

## 4 · What NOT to do in this pass

- No SOC 2 / ISO language anywhere (security.html already warns against it).
- No CSP change that is not verified against every live page in both themes with a headless run
  (the smoke suite is the harness: every page loads, zero console errors).
- No "hardening" that changes gameplay input handling — parity suites are the guard.
- No rewrite of `security definer` functions without the diff-before-replace step (r417).
