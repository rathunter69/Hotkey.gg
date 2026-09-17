# Repository and database cleanup

Updated: 2026-09-17
Task: `01a0af90-7fb2-7571-a5d6-b82354d57540` (starter 3)
Branch: `codex/repository-database`
Starting commit: `9df3405fbdcdeac0e2f2f8d4ef4170fb51dc0bdd` (verified remote foundation)
State: assessment; this report is the only change, saved through the task branch.
Owned files: `docs/handoffs/repository-database.md` only.

## Scope and outcome

Keep every current public database table. Several apparently obsolete files still drive tests,
generation or public URLs. Consolidate their consumers before retiring their old sources.
There is no unconditional deletion candidate from this assessment. Nothing was deleted, moved,
merged or deployed; no application, SQL, account data or shared product guidance was changed.

Wolf's September 17 instruction is to identify keep/consolidate/retire candidates with evidence,
and starter 3 explicitly forbids deletion in this first turn. All actions below are proposals,
not approved product changes or a new master queue. Security/account fixes retain priority.

## Repository decisions and evidence

Paths and line numbers below refer to the starting commit. A focused read-only agent traced
repository consumers; the lead checked source provenance and database dependencies.

| Treatment | Item | Evidence and requirement before retirement |
|---|---|---|
| Keep | Runtime sources, generated `drills/*.html`, `sitemap.xml`, `refmap.js` | Static deployment serves committed output. `dev/build-drill-pages.js:431,478,489,502` writes artifacts; `.github/workflows/gate.yml:189` regenerates/checks drill pages and sitemap. `reference.html:142` loads refmap; `robots.txt:4` advertises sitemap. Edit sources, not generated pages. |
| Keep until consumers move | `dev/curriculum-v3.json` | Default input of `dev/check-curriculum-map.js:74`, invoked by `dev/run-checks.js:12`; `dev/gen/curriculum-v5-json.py:6` reads its vocabulary. Old proposal, active dependency. |
| Keep until taxonomy is extracted | `dev/curriculum-v4.json` | `dev/check-invariants.js:1416` reads family vocabulary; map checker also supports it. Extract the durable skill vocabulary and preserve guard coverage before archive. |
| Keep as proposal | v5 JSON/Markdown/HTML, Python data/map files and generators | `dev/run-checks.js:13` validates v5; `dev/gen/curriculum-v5-json.py:4,38` imports sources/writes JSON; `dev/gen/curriculum-html.py:4,158` imports data/writes HTML. A valid plan is not an implemented or approved replacement catalog. |
| Consolidate, then retire mirror | `dev/migrate-certificates.sql` | `dev/e2e-lb.js:292` reads it unconditionally; assertions follow at 296/307. `dev/check-invariants.js:625` checks canonical SQL and mirror, but skips a missing source at 628. `drills.js:192` still directs edits to the mirror. Move the test to the latest canonical function first; update that comment in a separately owned batch. |
| Conditional archive candidates | `dev/migrate-client-state.sql`, `dev/migrate-email-prefs.sql`, `dev/migrate-drill-feedback.sql` | Canonical reconciliation is `supabase/migrations/20260724100000_reconcile_adhoc.sql:69,85,112`. No executable file-read consumer found in the scoped search. Remaining comments/docs include `nav.js:1423`, `account.html:555`, `index.html:31680`, `dev/EMAIL.md:31`, and `dev/edge-{cert-email,weekly-recap,streak-nudge}/index.ts`. Reconcile links, mark history and retain provenance; do not reapply old SQL. |
| Consolidate entry points; retain history | `PROJECT_CONTEXT.md`, `dev/CONTINUITY.md`, `dev/PIPELINE.md`, `dev/WORKFLOW.md`, `dev/ROADMAP.md`, `supabase/README.md` | Historical notices already redirect readers. README/current docs supersede the queues but still cite prior rationale. Supabase README retains dated setup/deployment instructions beneath its correction. Separate historical narrative from current operational instructions before any move; fix inbound links. |
| Keep | Wolf's feedback and design rationale | `docs/PRODUCT.md:108` explicitly requires `DRILLS_WOLF_LIKED.md` and original round feedback before redesign. Preserve substance independently of superseded wave quotas and proposals. |
| Propose retiring executable entry point | `.claude/workflows/drill-wave.js` | Automatic wave orchestration at lines 2–4 and injected old workflow instructions at 57/95; historical callers in `dev/WORKFLOW.md:240`, `dev/PIPELINE.md:59,73`, `PROJECT_CONTEXT.md:177,214`. No npm, GitHub Actions or site caller found. Archive rationale outside discoverable automation after correcting references and checking assistant discovery. Do not run it. |
| Keep pending separate assistant-tool review | `.claude/settings.json`, `.claude/skills/*` | Settings grant a shell permission for `dev/sbp-query.sh` at line 4. Absence of website callers does not prove an assistant configuration is unused. No blanket `.claude` removal. |
| Keep | `art/og.png` | Live social metadata in `index.html:13,19` and generator at `dev/build-drill-pages.js:330,336`. Never remove `art/` wholesale. |
| Conditional archive/exclusion candidates | Art prototypes, landing/level mocks and screenshot sets | Design references in `dev/FRAME_PIXEL_PASS.md:7`, `dev/BETA_RETIRE_LANDING.md:629`, `dev/LANDING_V3.md:153`, and `index.html:2471`. No runtime asset request found for sampled prototypes, but the earlier delivery audit verified `/art/rank-proto.html` as a public route. Agree URL/hosting treatment, repair design links and preserve useful references first. Moving inside the served root does not make a file private. |
| Keep branch provenance | Unmerged branches | `docs/BRANCH_INVENTORY.md` and CURRENT describe substantive tutorial/progression work on `claude/platform-improvements-roadmap-ycogch` at `1703b59324af098f252b8b4dcd8d3fd859338197`. No branch deletion or bulk restoration; this turn did not re-audit all branches. |

## Active configuration requiring consolidation, not deletion

| Boundary | Verified source | Owner / implication |
|---|---|---|
| Paid access | `drills.js:331` disables premium; `:844` defines `HOTKEY_PRO.freeNow`; `nav.js:1786` still reads `.beta`; server `my_pro`/`my_pro_status` read entitlements and desk grants | Payments with Security and catalog architecture: align one access contract later. Removing one flag now changes behavior; billing activation remains paused. |
| Billing placeholders | `billing.html:193` reads `profiles.plan`; `:262` reads `invoices`, with a pre-Stripe fallback at 274 | Fresh metadata confirms both the column and table are absent. Payments: distinguish planned schema from actual schema. Do not create a table merely to satisfy this scaffold or call it an unused table. |
| Static hosting/cache | `_headers:9` claims last matching header wins; prior DELIVERY_TESTING D07 records contrary serving evidence | Git/testing owns hosting verification and cache repair. Keep `_headers`, `_redirects` and current delivery files. Do not deploy a probe. |
| CI file scope | `.github/workflows/gate.yml:41` uses path-based scope; package/run-checks select checks | Moving files can silently drop test coverage. Update discovery and scope with any future structural move. |
| Database deployment | `.github/workflows/supabase-deploy.yml:5,34,38` selects `supabase/**`, pushes migrations and deploys functions | `dev/` SQL and draft Edge Functions are not this deployment route. Keep canonical migrations/functions; review prototype consumers before archive. Deployment reliability belongs to Git/testing. |

## Database keep list

Fresh read-only metadata queries against project `vshtftzrlepedydmkcnm` confirmed 18 public
tables, all with RLS, plus current triggers, foreign keys, migration stamps and scheduled jobs.
RLS presence is not a security sign-off. No customer rows or secret values were retrieved.
Statistics estimates were not treated as exact counts, and negative estimates are not empty tables.

| Keep | Application / server / scheduled consumer evidence |
|---|---|
| `profiles` | `nav.js:503,1025,1030`, `account.html:222`; live school, digest, admin and certificate functions; certificates FK targets profiles. Contains account-owned settings/history. |
| `runs` | `lb.js:158`, `profile.html:302`, `stats.html:274,695`, trainer inserts at `index.html:34482,34509`; live certificate, digest, moderation and aggregate functions. Keep full history pending an agreed preservation contract. |
| `sessions` | `lb.js:159`, `profile.html:308`, trainer inserts at `index.html:34524`; live `sessions_guard_trg` and admin moderation. |
| `run_stats` | No current browser read path found; `20260903000800_run_stats.sql:75,197` explicitly records this. Live `runs.run_stats_apply_trg` invokes `run_stats_apply`, which writes it. FK to `runs` via best_run_id. It is a maintained partial migration, not unused storage. |
| `key_stats` | `profile.html:310`, `stats.html:282`; trainer calls `bump_key_stats` at `index.html:34293`, live routine references the table. |
| `certificates` | `cert.html:106`, `account.html:523,547`; live `issue_certificate` and `prune_guest_shells`. Earned credentials must survive catalog changes. |
| `drill_feedback` | Direct trainer insert at `index.html:31726`; FK to auth.users. Absence from the public routine text scan does not make it unused. |
| `events` | `nav.js:1161` inserts; admin RPCs read it; active `events-retention` job uses the retention path defined in `20260903000700_indexes_retention.sql:168`. Retention is an existing policy, not a new deletion authorization. |
| `reports` | `lb.js:463,567` inserts; `admin.html:136,144` calls report read/resolve routines, confirmed live references. |
| `admins` | Live `is_admin` reads it; admin functions rely on that authorization. No direct client read is expected. |
| `teams` | `lb.js:161`, create/join/my_desk RPCs; live name/rate guards; parent of four desk-related FKs below. |
| `team_members` | `lb.js:160,1401`; live captain, seat, membership and digest functions; FK to teams. Security DATA-01 repair remains separate. |
| `team_assignments` | `lb.js:321,1298,1312,1319`; live assignment cap guard and digest_payloads; FK to teams. |
| `team_applications` | `lb.js:252,457,1255,1265`; live apply/decide/withdraw routines and guest pruning; FK to teams. |
| `desk_creations` | Live `teams.desk_rate_guard_t` invokes `desk_rate_guard`; source `20260712900000_desk_rate_limit_fix.sql:22–27` expires/checks/inserts rate-limit rows. RLS with no policy is not proof of disuse. |
| `desk_pro_grants` | `lb.js:1215,1245` and `admin.html:180,203,210` call RPCs; live request/approve/seat/my_pro routines reference table; FK to teams. Preserve grants and request history while billing is paused. |
| `entitlements` | Live `my_pro`, `my_pro_status`, `start_pro_trial` reference it; `nav.js:1411` calls my_pro_status. A free client display flag does not retire authoritative access data. |
| `school_map` | Live `refresh_school_tag` references it; `account.html:666` calls that routine. Source `20260712800000_profile_grant_fix.sql:41`; explicit client lockdown in `20260716100000_school_map_lockdown.sql:8`. Intentionally indirect access. |

All 18 have a positive source or live dependency. The live FK inventory contains 21 public
foreign keys; key cleanup risks include certificates -> profiles, run_stats -> runs, and desk
tables -> teams. Do not treat DROP CASCADE as a way to bypass these dependencies.

The three live cron jobs remain active: `weekly-digest` (`0 13 * * 1`),
`prune-guest-shells` (`0 4 * * *`), and `events-retention` (`30 3 * * *`). This verifies scheduling,
not successful recent execution. The digest Edge Function calls `digest_payloads` at
`supabase/functions/weekly-digest/index.ts:45`. Earlier DATA_SECURITY evidence compared both
deployed Edge Function sources to local; this turn did not repeat that full parity review.

### Already retired versus retirement candidates

`beta_codes`, `members`, `invite_codes` and `access_codes` are absent from the fresh public
table inventory. Source retirement migrations are `20260903000100_retire_beta_codes.sql` and
`20260903000300_retire_membership.sql`. Keep those migrations and the earlier creation history;
do not restore the mechanisms or issue new drops just because old names remain in SQL history.

Fresh migration metadata still has 61 records against 52 repository migration files, including
the same nine extra live stamps recorded in TRANSITION_REVIEW. Do not delete/rename old files,
stamp history, or replay `--include-all` as cleanup. Prior audit found 53/54 function bodies
matching exactly after normalization and one comment-only difference; that is reused evidence,
not fresh proof of schema/grant/configuration parity. Isolated replay and full schema comparison
must precede a history-reconciliation proposal.

`dev/RUN_STATS_PLAN.md:3–7,108,116–122` explains why the unused aggregate read path does not
authorize purging raw runs or imposing a retention window: certificates, trace playback and
moderation still depend on original rows.
Preserve both tables until the saved-progress owner designs and tests that migration.

## Verification and limits

- Read AGENTS, README, CURRENT, DEVELOPMENT, PRODUCT, TASK_GUIDE, TASK_STARTERS, ARCHITECTURE,
  TRANSITION_REVIEW and relevant data/security and delivery audit evidence. Applied the Supabase skill.
- Verified remote foundation SHA through GitHub and an actual Git fetch. Tracked application
  files in the original checkout matched that commit; untracked foundation files were compared
  using Git blob hashes with checkout filters and no mismatches were printed. Created isolated
  `repository-database` worktree, preserving the dirty original checkout and other area worktrees.
- Focused repository searches covered runtime, generators, guards, npm/CI/deployment and
  historical references, including hidden assistant workflow files. Negative text search is not
  proof against dynamic paths, external consumers, bookmarks or assistant discovery.
- Live metadata reads covered pg_class, public routine source-name matches, non-internal
  public/auth triggers, pg_constraint, cron job names/schedules/active status, and migration
  versions/names. Routine text matches are leads (comments can match too), not a complete SQL
  dependency graph; positive consumers above were paired with source/caller/trigger evidence.
- No database writes, emails, purchases, migrations or deployment tests. No row-level historical
  data review, backup restore, external integration inventory or fresh full schema parity claim.
- Application checks (`npm run check`, browser suites and full CI) were not rerun for this
  report-only change, per TASK_GUIDE's documentation exception. Earlier audit results remain
  earlier evidence. No static pass or successful playtest is claimed for this turn.
- Independent report review approved the evidence and scope after clarifying the raw-run
  preservation wording. Whitespace and changed-file checks are the final document checks.
  Local Git's default proxy prevented the initial remote read; a fetch with proxy overrides
  succeeded. GitHub connection is used for the branch checkpoint; CLI push authentication is
  not established by that success.

## Proposed next bounded batch

Consolidate the four historical `dev/migrate-*.sql` mirrors: migrate the certificate test to the
latest canonical function definition, remove edit/run instructions pointing at the mirrors,
and archive the historical copies with replacement links. Before any removal, check the final
runtime/generator/test/deployment/docs reference set and inspect the exact diff. Run static
checks plus the leaderboard browser suite because its source fixture changes. Coordinate the
nav/index/account/drills comments with their current owners; any runtime-file edit follows
asset-version/generation rules. This batch does not modify SQL migrations or live data.

For a database retirement later, require the exact object/dependency list, external and scheduled
consumer checks, historical-data disposition and recoverable backup, a new reviewed migration,
isolated replay and permission tests, and a separately authorized release. No current table has
reached that threshold.

## Proposed shared-status update for the chief

Starter 3 assessment complete: current tables retained; active old-map and SQL-test consumers
identified; conditional archive candidates recorded. No deletions or implementation performed.
Next proposal is SQL-mirror consolidation after owner coordination. Preserve current security
priority and the catalog/progression contract. Chief alone integrates CURRENT/PRODUCT; this
task returns the verified remote report link and releases its report-only reservation on handoff.
