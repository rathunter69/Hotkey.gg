# Repository and database cleanup
Updated: 2026-09-17
Task: 01a0b0f0-0755-7962-b436-a6646a32321d
Branch: codex/database-cleanup
Starting commit: 9df3405fbdcdeac0e2f2f8d4ef4170fb51dc0bdd
State: assessment; remote documentation checkpoint, no application/schema changes
Owned file: docs/handoffs/repository-database.md

## Scope and outcome

Wolf requested: “Identify what is used → consolidate/archive → reconcile database setup.”
This is the first evidence batch specified by TASK_GUIDE.md: table consumers, keep/archive/remove
classification and setup conflicts. No table currently qualifies for immediate removal.
All 18 public tables have application or server dependencies. Empty tables do not imply
unused features. Consolidation and database reconciliation remain subsequent bounded batches.

The remote area branch starts from the verified foundation tip. GitHub comparison with main
434bc0e8764e741e0e11f84cf51d61a1755d7c67 shows no runtime or migration changes in that foundation.
The original local checkout has pending foundation files and remains untouched except this new
handoff. Publication uses the GitHub connector; it does not repair local Git authentication
or synchronize the local branch. CURRENT.md and PRODUCT.md remain chief-owned.

## Keep / consolidate / archive / remove

Live project: vshtftzrlepedydmkcnm. Metadata-only inspection; no customer rows retrieved.
All 18 public tables have RLS enabled. This is not a permissions clearance; DATA-01/02 remain.

| Table | Verified consumer / purpose | Disposition |
|---|---|---|
| profiles | nav.js, account.html, profile.html, lb.js; account identity/state and server functions | Keep; privacy repair belongs to Security |
| runs | index.html writes/results/replay; boards, profiles, stats, certificates, admin and digest | Keep raw history; no retention/reset |
| sessions | index.html posts timed sessions; lb.js boards; sessions_guard and admin RPCs | Keep despite empty inventory |
| entitlements | my_pro, my_pro_status, start_pro_trial; account access | Keep; billing unfinished does not remove server access checks |
| teams | lb.js and desk RPCs; desk identity/settings | Keep |
| team_members | lb.js; joining, captain checks, membership and seat calculation | Keep; distinct from retired members |
| team_applications | apply_to_desk, desk_applications, decide_application, my_applications, withdraw_application | Keep |
| team_assignments | lb.js; set_assignment, clear_assignment, assign_cap_guard, digest_payloads | Keep |
| desk_creations | desk_rate_guard, attached to live teams insert trigger | Keep; security/rate-limit ledger, no direct reader required |
| school_map | refresh_school_tag | Keep; controlled server lookup, no client policy is intentional |
| desk_pro_grants | request_desk_pro, my_desk_pro, my_pro, my_pro_status, admin decision/list and seat RPCs | Keep; server-controlled grant/request state |
| admins | is_admin; gates administration RPCs | Keep even empty; empty means no configured admin row |
| reports | lb.js report writes; admin_reports, admin_resolve_report, admin_metrics | Keep |
| certificates | account.html, cert.html; issue_certificate and guest pruning | Keep; verification still depends on raw runs |
| drill_feedback | index.html:31726 inserts feedback; no runtime/admin/Edge reader found | Keep pending a review/export/retention decision |
| events | nav.js event writes; admin_events/admin_metrics and purge_old_events | Keep; existing retention, no new purge |
| key_stats | bump_key_stats writes; stats.html reads | Keep; per-key data differs from per-drill results |
| run_stats | run_stats_apply writes through live runs AFTER INSERT trigger; no app read path found | Consolidation candidate, preserve for now |

Live foreign keys confirm run_stats.best_run_id depends on runs; certificates depend on profiles;
desk children depend on teams; most account data depends on auth.users. Function-name reference
scans were treated as search leads, not proof of execution (comments can match); source tracing
and live trigger/FK catalogs establish the important indirect dependencies.

**Already retired, keep absent:** beta_codes, members, invite_codes, access_codes.
Live public inventory contains none. Migrations 20260903000100_retire_beta_codes.sql and
20260903000300_retire_membership.sql retire them. Keep those migrations and the baseline that
temporarily creates older objects during replay. Do not restore old membership/invite gating.

**No immediate table archive or removal:** run_stats is a maintained aggregate with no application
read path; drill_feedback also has a write path but no identified operational reader. dev/RUN_STATS_PLAN.md records unfinished migration
of readers. It is not a substitute for runs: it lacks detailed history and traces, has owner-only
reads, and INSERT-only maintenance does not reconcile moderation/deletion. Proposal: settle its
future with saved-progress owners; either complete a tested aggregate design or explicitly retire
the transitional feature later. Neither choice authorizes deleting runs.

**Historical SQL files:** dev/migrate-client-state.sql, dev/migrate-email-prefs.sql,
dev/migrate-drill-feedback.sql and dev/migrate-certificates.sql were reconciled by
20260724100000_reconcile_adhoc.sql. They are not a second deployment channel.
Do not archive the certificate mirror yet: dev/check-invariants.js:625 and
dev/e2e-lb.js:292 read it directly. A later consolidation must first migrate these consumers
to the newest canonical certificate function and preserve the track contract. Other historical
files need a complete documentation/consumer check before moving.

**Edge Function dependencies:** weekly-digest calls digest_payloads, which reads profiles, runs,
teams, team_members and team_assignments. create-checkout currently touches no public table;
its proposed future webhook would write entitlements. Historical dev/edge-* files are not proof
of deployed consumers. These source conclusions agree with the earlier deployed-source audit.

**Platform-owned schemas:** auth, storage, realtime, cron, net, vault and supabase_migrations
are outside the public application-table retirement list. public.sessions is a game table;
auth.sessions is authentication infrastructure. Do not consolidate those by name.

## Setup reconciliation register

1. **History drift, reconfirmed:** 52 local SQL migration files; all their versions occur in the
   61-row live migration history. Nine extra live records below each retain a statement entry.
   Names suggest corresponding source migrations, but SQL equivalence is not yet established.

| Extra live version | Live name | Candidate source version (not proved equivalent) |
|---|---|---|
| 20260903214612 | certificate_tracks_r452 | 20260903000000 |
| 20260903214615 | retire_beta_codes | 20260903000100 |
| 20260903221609 | baseline_r453 | 20251231000000 |
| 20260903222009 | retire_membership_r453 | 20260903000300 |
| 20260903222011 | guest_shell_prune_r453 | 20260903000400 |
| 20260903222013 | rpc_grants_r453 | 20260903000500 |
| 20260903222016 | policies_r453 | 20260903000600 |
| 20260903222017 | indexes_retention_r453 | 20260903000700 |
| 20260903222020 | run_stats_r453 | 20260903000800 |

2. **Conflicting historical setup claims:** supabase/README.md has a current failed-deployment
   warning followed by historical “pipeline WORKS”/complete-source-of-truth claims.
   The baseline now sorts first, but its retained comments still discuss the old filename
   and explicitly acknowledge no clean replay. Neither current ordering nor matching version
   names proves a reproducible database.
3. **Billing schema mismatch, confirmed source + live metadata:** billing.html:193 reads
   profiles.plan; :262 queries invoices. Neither exists live, and no repository migration
   supplies them. Source describes them as future scaffolding. The page ignores returned
   query errors and falls back to PRO/empty invoices. Record with Payments; do not create
   speculative billing tables or enable billing as cleanup.
4. **Scheduled dependencies:** weekly-digest, prune-guest-shells and events-retention are active.
   No inspected cron command directly mentions runs; indirect functions do use runs.
   Job success, retention execution and backup restoration were not tested.
5. **Delivery:** .github/workflows/supabase-deploy.yml uses an unpinned latest CLI and
   db push --include-all, then deploys Edge Functions. Prior delivery audit reports project-link
   failure; this task did not rerun deployment or refresh workflow-run status. Coordinate any
   workflow/secret repair with Git/testing.

## Verification and limits

Fresh checks: public-table inventory, table names in service schemas, public trigger/function
bindings, foreign keys, migration versions/names/statement counts, cron names/schedules/active
flags, public function reference search, and existence checks for billing schema objects.
Focused independent agent traced application/SQL consumers. GitHub baseline comparison confirmed
application/migration provenance. No customer row contents, secrets or cron commands were saved.

Reused, not rerun: DATA_SECURITY.md's comparison of all 54 function bodies and both deployed
Edge Functions. That evidence establishes only the stated body/source parity, not whole-schema
or current configuration equivalence.

No data writes, migrations, deletes, archive operations, account actions, deployment or main
merge. No runtime/test tooling changes. npm run check and browser suites were not run for this
documentation-only assessment; TASK_GUIDE.md exempts small documentation changes from application
tests. No isolated SQL replay, permission regression, complete schema/grant comparison, restore
test, external integration inventory or sustained usage observation has been completed.
The Supabase changelog markdown fetch failed due unsupported content type; no Supabase API or
configuration implementation relied on it.

## Decisions for the chief and next batch

Confirmed September 17 user direction: identify use before consolidation/archive, then reconcile
database setup. Proposed shared-status update: table assessment complete; no proven removable
live public table; run_stats is transitional; billing references missing schema; history/replay
reconciliation still open. Security retains DATA-01/02 and account repairs; saved-progress owns
result contracts; Payments owns billing behavior; Git/testing owns reproducible database tests
and delivery. No shared brief was rewritten.

**Recommended next batch:** compare the nine stored migration statement sets with their candidate
source files, then run the unchanged 52-file chain in an isolated database with synthetic data
and outbound email/network jobs disabled. Compare final columns, defaults, constraints, indexes,
policies, grants, function signatures/settings, triggers, extensions and scheduler definitions
against a sanitized live manifest. Preserve a replay/restore report and propose any new forward
migration only after differences are understood. Do not edit existing history stamps, rerun the
baseline on production or copy customer data into the test environment. Setup-document and
historical-SQL consolidation can follow verified replay evidence.
