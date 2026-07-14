# SMOKE_REPORT — live Supabase verification (r131–r132 · r196 re-run 2026-07-14)

## FINAL STATUS: ✅ 65/65 PASS — the full desks/school-tags/assignments backend
## is deployed and verified live end-to-end (2026-07-13, `dev/smoke-live.mjs`;
## RE-VERIFIED 65/65 first-try on 2026-07-14, r196 — the standing "first
## session with egress" milestone. Seed codes remain SAFE TO DISTRIBUTE.)

Production end state verified: all 8 school seeds present, ownerless, original
fixed invite codes intact; no stray desks; smoke-u fixture consumed (by
design — see "fixtures" below). **Seed codes are safe for Wolf to distribute.**

---

## Timeline of the two rounds

### r131 — the pipeline that never ran
First session with egress to supabase.co. The planned smoke test found that
**no migration ≥ `20260707000000` existed in the live DB**: all 9 runs of
`supabase-deploy.yml` since 2026-07-07 had failed at "Access token not
provided" — the `SUPABASE_ACCESS_TOKEN` secret was never set. Desks v1/v1.5/v2,
seeds, protected names, school tags, assignments, handle rules, blocklist,
flair, entitlements: shipped in UI, absent in backend, degraded silently
(client try/catch). Fixed: fail-loud secret check + `workflow_dispatch` +
`SUPABASE_DB_PASSWORD` in the workflow; 2-secret runbook in supabase/README.md.
Wolf added both secrets; one green run deployed the entire backlog.

### r132 — smoke round 1 (52/64) found three real bugs, all fixed + verified
1. **Profile upsert 403 (P0, went live with the backlog deploy)** — r122's
   column-grant tightening omitted `id` from the UPDATE grant; PostgREST
   upsert (`resolution=merge-duplicates`) puts every payload column in the
   `ON CONFLICT … DO UPDATE SET` list, so the gate's `upsert({id, handle})`
   was denied → new members couldn't create profile rows (no handle, no
   school tag). **Fix `20260712800000`**: id-immutable trigger + `id` added to
   the update grant + `refresh_school_tag()` upserts instead of updating a
   possibly-missing row.
2. **Hollow creation rate limit** — the r119 guard counted *currently owned*
   desks; create→leave→create bypassed it (proven live). **Fix
   `20260712900000`**: `desk_creations` log rides the insert transaction
   (failed creations roll back their log row and consume nothing).
3. **Claim-vs-domain-join deadlock** (caught statically in r131, verified
   fixed live in r132) — r119's claim required *zero members*, so one
   `join_home_desk` student would permanently block the club president's
   code-claim. **Fix `20260712700000`**: code-join claims any ownerless desk
   with no sitting captain. Doctrine holds: code = captaincy, domain =
   membership.

Also learned live: **`supabase db push` is stateful** — applied migrations
never re-run, so consumed seeds can't be restored by re-running the workflow.
The r132 run had claimed-and-deleted the Wharton seed via a zero-member claim;
**`20260713000000_smoke_fixtures.sql`** re-stamped all 8 school seeds (same
codes) and added the **smoke-u fixture** (ownerless private test desk,
`edu_domain hotkeysmoketest.edu`, matching the harness accounts) so claim
tests never touch real school desks again.

## What 65/65 covers (`node dev/smoke-live.mjs`, re-runnable)
Auth signup/signin (.edu gate) · redeem_code HAGS · profiles upsert + RLS ·
name guards (RESERVED + PROTECTED ×2) · create/preview/join/my_desk ·
invite-code table privacy · ALREADY_ON_DESK · assignment cap-3 + re-pin
upsert + NOT_CAPTAIN + member read + clear + direct-insert denial ·
rotate_invite + old-code death + NOT_CAPTAIN · heir promotion ·
empty-desk self-delete + assignment cascade · DESK_RATE_LIMIT (post-fix) ·
refresh_school_tag (mapped UPenn + unmapped-.edu fallback) · server-derived
column write denial · show_school opt-in · home_desk_for_me (match/empty/
on-a-desk) · join_home_desk (member-only + NO_HOME_DESK) · Wharton
member-join non-destructive · claim-after-domain-join → captaincy (the fix) ·
captain powers on claimed seed · reports insert / no-read / forged-reporter
denial.

### r196 — smoke round 2 (65/65 FIRST TRY, 2026-07-14)
The standing "first session with egress" run, verifying everything shipped
since r132 stayed healthy in prod. Procedure per the fixture rule: smoke-u
re-stamped via migration `20260714000000_smoke_fixtures_restamp.sql` (PR #24,
deploy Action green in 29s), fixture verified live, then the full harness:
**65/65 PASS, zero fixes needed** — auth/gate/profiles, name guards, desk
create/join/preview, invite_code RLS denial, assignment cap + captain-only +
upsert + cascade, invite rotation, rate limits (ALREADY_ON_DESK ·
DESK_RATE_LIMIT), heir promotion, empty-desk self-delete, school tags (mapped
+ fallback + write-denial), home-desk domain joins (non-destructive on real
seeds), claim-after-domain-join captaincy, reports RLS. SMOKE_TS=12016212.
smoke-u consumed again by design — re-stamp before the next full run.

## Standing facts for future sessions
- **`supabase db push` never re-runs an applied migration.** Restoring a
  consumed fixture/seed = ship the insert again under a NEW timestamp.
- A full smoke run **consumes smoke-u** (last leaver deletes it). Before the
  next full run: copy `20260713000000_smoke_fixtures.sql` to a new timestamp
  and deploy. Real school seeds are never claimed/rotated by the harness.
- The harness reuses its accounts via `SMOKE_TS=03683162 node dev/smoke-live.mjs`
  (signin fallback) — don't mint new accounts without reason.
- ~~Signup .edu-only gate~~ RESOLVED r133: Wolf chose incentive-not-wall.
  Migration 20260713100000 dropped the dashboard-era trigger (verified live:
  non-.edu signup succeeds); the signup card now pitches .edu as the carrot
  (school-desk auto-match + student perks later).

## Outstanding (Wolf)
1. ~~Merge branch → main~~ — done (PR #1, 2026-07-13); auto-merge is now a
   standing working agreement.
2. **Rotate the credentials** pasted in chat: generate a new Supabase access
   token (revoke the old) and reset the DB password, then update BOTH repo
   secrets. The pipeline keeps working.
3. ~~.edu signup gate~~ — resolved r133 (removed; incentive copy shipped).
4. Distribute seed desk codes to club presidents whenever ready — backend is
   verified.
5. Optional service-role cleanup of smoke accounts (harmless; no runs, no
   leaderboard presence): password pattern `Smoke-<TS>-xK9!`
   - `hk.smoke.b.92166128@upenn.edu` — `3a254f44-cd95-455b-904e-614cd7ff81ab` (orphan, no profile)
   - `hk.smoke.a.92201356@hotkeysmoketest.edu` — `1f4a1396-6796-40f8-84d9-c53d62e7e8bf`
   - `hk.smoke.b.92201356@upenn.edu` — `48bfb1ba-f7f1-44a9-b7fe-c30cf7921727`
   - `hk.smoke.c.92201356@hotkeysmoketest.edu` — `28f5543b-4797-4e1f-8ba4-95b3abec5432`
   - `hk.smoke.a.03683162@hotkeysmoketest.edu` / `hk.smoke.b.03683162@upenn.edu` /
     `hk.smoke.c.03683162@hotkeysmoketest.edu` — the active harness trio
     (KEEP if you want re-runnable smokes; they hold no desks)
   - `hk.smoke.nonedu.1@hotkeysmoketest.com` — `23dac454-85bd-460b-ab60-23777fca3f11`
     (r133 gate-removal probe; no profile, no runs)
   - r196 trio (2026-07-14, hold no desks, no runs): `hk.smoke.a.12016212@hotkeysmoketest.edu`
     — `f65cac20-94f8-46fa-bd39-74008fb0b46d` · `hk.smoke.b.12016212@upenn.edu`
     — `85bdc0f5-f455-46db-9b74-3371a1e59b03` · `hk.smoke.c.12016212@hotkeysmoketest.edu`
     — `aa7f620c-92f3-41bf-aa88-58f52f1582bd`
   - `reports` table holds 3 smoke rows (kind=handle, note mentions smoke) — delete at leisure.
   - **Remove the smoke-u fixture at launch** (T&S pass) — currently consumed/absent.
