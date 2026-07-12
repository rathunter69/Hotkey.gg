# SMOKE_REPORT — live Supabase verification (r131, 2026-07-12)

_First session with network egress to supabase.co since the desks arc shipped.
The planned smoke test (desks / school tags / assignments RPCs) ran and
immediately surfaced something much bigger than an RPC bug._

## HEADLINE: the migration pipeline has NEVER worked

**None of the migrations from `20260707000000_team_code.sql` onward exist in
the live database.** Every feature shipped since 2026-07-07 that depends on a
migration is not deployed: desks v1/v1.5/v2, protected names, seeds, school
tags, captain assignments, handle rules/cooldown, handle blocklist, flair,
entitlements, `profiles.team_code`.

**Root cause** (from the GitHub Actions logs): all 9 runs of
`supabase-deploy.yml` since 2026-07-07 failed at the first step with
`Access token not provided` — the repo secret `SUPABASE_ACCESS_TOKEN` was
never set. The one-time setup in `supabase/README.md` was never completed.
The failure was silent from the product's side because the client swallows
desk-RPC errors (`try/catch` around `my_desk()` etc.) and renders the
pre-desks UI.

The AUDIT r9 claim "Supabase deploys confirmed working via GitHub integration
(team_code applied)" is **wrong** — live `profiles` has only
`{id, handle, updated_at}`. Whatever was verified then, it wasn't this
pipeline against this database.

### What IS live (verified by probe)
| Object | Status |
|---|---|
| `runs`, `profiles`, `members`, `invite_codes`, `sessions` tables | live (manual-paste era) |
| `redeem_code('HAGS')` RPC | live, returns `true` |
| signup → session (no email confirm) | works |
| `profiles` upsert w/ handle | works (client-side rules only!) |
| everything in migrations ≥ 20260707000000 | **missing** |

### Production impact right now (www.hotkey.gg)
- Account desk card, desk deep-links (`?desk=`), leaderboard desk filter/page,
  school chips, assignment marks/toast/strip: all silently degrade to the
  pre-desks experience (errors are caught). No crashes observed in code paths,
  but **every desks/tags/assignments feature is dead in prod**.
- Handle uniqueness/format/cooldown and the blocklist are **not server-enforced**
  (migration never applied) — only client checks stand between a user and a
  duplicate/offensive handle via direct REST.
- The 8 seeded school desks and their invite codes: **do not exist yet**. Wolf
  must NOT distribute codes until the pipeline is green and the smoke passes.

## WOLF ACTION REQUIRED (3 minutes — unblocks everything)
1. app.supabase.com → account icon → **Access Tokens** → Generate new token → copy.
2. Supabase dashboard → Project Settings → Database → **Database password**
   (reset if unknown) → copy.
3. GitHub repo → Settings → Secrets and variables → Actions → add BOTH:
   `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD`.
4. GitHub → Actions tab → "Deploy Supabase migrations" → **Run workflow**.
   (r131 added the manual trigger + a loud fail-fast if a secret is missing.)
5. Tell Claude "pipeline is green" → next session runs `node dev/smoke-live.mjs`
   and writes the real desks smoke results here.

All 13 migrations were re-scanned this round: idempotent throughout
(`if not exists` / `drop … if exists` / `on conflict do nothing`), so the
first successful run applies the whole backlog in one pass safely.

## What the smoke test DID verify live (2026-07-12)
- Egress OK; auth health OK.
- **Signup is server-gated to .edu emails**: non-.edu signup fails with
  `Only .edu email addresses may register for the beta.` This gate is **not in
  the repo** (no migration/hook defines it) — it was added manually in the
  dashboard. FLAG: PROJECT_CONTEXT says the audience is "IB analysts, finance
  pros, MBAs" with HAGS as the gate — a .edu-only wall locks out working
  professionals. Wolf: intentional? If yes it belongs in the repo docs; if no,
  remove it in Supabase Auth settings (it's a dashboard-side hook/trigger).
- Signup returns a session immediately (email confirmation off).
- `redeem_code('HAGS')` → `true` for all three test users; `profiles` upsert
  201; RLS lets a user read their own profile row.
- Schema probes: see table above; desk/tag/assignment RPCs all 404
  (`PGRST202`), `teams`/`team_assignments`/`reports`/`school_map` tables 404
  (`PGRST205`), `profiles.team_code/flair/school_tag/show_school` 42703.

## Bug found by static analysis while building the test matrix (FIXED)
**Claim-vs-domain-join deadlock** — `join_desk` (r119) claims captaincy only
when the desk is ownerless AND has zero members. `join_home_desk` (r122) adds
domain members without touching ownership. So one student auto-joining their
school desk before the club president enters the code would make the captaincy
permanently unclaimable. Doctrine (r122) is explicit: code = captaincy, domain
= membership. **Fix shipped: `20260712700000_claim_fix.sql`** — code-join
claims an ownerless desk with no sitting captain, regardless of member count.
`dev/smoke-live.mjs` step 10 asserts the fixed behavior.

## Test artifacts left in prod (service-role cleanup when convenient)
Accounts (password pattern `Smoke-<TS>-xK9!`, all redeemed HAGS, no runs —
they appear on no leaderboards):
- `hk.smoke.b.92166128@upenn.edu` — uid `3a254f44-cd95-455b-904e-614cd7ff81ab` (orphan from aborted run 1, no profile row)
- `hk.smoke.a.92201356@hotkeysmoketest.edu` — uid `1f4a1396-6796-40f8-84d9-c53d62e7e8bf`, handle `smoke_a_92201356`
- `hk.smoke.b.92201356@upenn.edu` — uid `48bfb1ba-f7f1-44a9-b7fe-c30cf7921727`, handle `smoke_b_92201356`
- `hk.smoke.c.92201356@hotkeysmoketest.edu` — uid `28f5543b-4797-4e1f-8ba4-95b3abec5432`, handle `smoke_c_92201356`

## The full desks smoke matrix (BLOCKED — runs the moment the pipeline is green)
`dev/smoke-live.mjs` covers: create/preview/join/my_desk/leave (incl. heir
promotion + empty-delete), invite-code privacy, name guards
(RESERVED/PROTECTED), 1/day rate limit, assignment cap-3 + re-pin upsert +
captain-only writes + direct-insert denial, rotate_invite (+ NOT_CAPTAIN),
refresh_school_tag (mapped + unmapped-.edu fallback), server-derived-column
write denial, home_desk_for_me / join_home_desk (member-only), claim-the-desk
on a seed, claim-after-domain-join (the r131 fix), reports insert/no-read/
forged-reporter denial. Seed-state restoration is designed in (LSE reseeds via
idempotent migration re-run; Wharton is only ever domain/member-joined).
