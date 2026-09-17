# Security application-replay baseline — current handoff
Updated: 2026-09-17
Task: 01a0af8b-9a97-7593-a1d2-6d2491cfe947
Chief: 01a0b0fa-d857-7002-ab95-1da0a1cfb858
Branch: codex/security-replay-baseline
Starting accepted platform checkpoint: 3dd686d26edcb53325579fbe479eb01bdf41f773
Exact reviewed and CI-tested source: 18babfa80dea4acb31fd30be2ae00b3610d42ed2
State: first fresh 52-file application replay PASSED; permission fixture ERROR; no second instance; overall CI FAIL.

## Actual outcome and first blocker

[Run 35276711544, attempt 1](https://github.com/rathunter69/Hotkey.gg/actions/runs/35276711544)
and [baseline job 105388980966](https://github.com/rathunter69/Hotkey.gg/actions/runs/35276711544/job/105388980966)
ran the exact reviewed source above on September 17 at 21:26–21:27 UTC. API conclusion is
failure. All 11 guard tests passed; baseline step failed; labelled cleanup and evidence upload
passed. Ubuntu 24.04.5 / runner image 20260907.300.1, Node 22.23.2/npm 10.9.8.

All **52 unchanged application migrations completed** in filename order on the first fresh
official platform. The complete-replay marker was written and verified. There was no failed
migration, skipped source file, edited history, alternate image, or partial-replay resume.

The unchanged permission fixture then aborted at
`supabase/tests/database/01-desk-authorization.test.sql:119`:

```text
ERROR: 42501: permission denied for function my_pro
psql exit code: 3
```

This is a **fixture incompatibility with the final grants**, not a migration failure or
proof of a new application defect. `20260903000500_rpc_grants.sql:222` intentionally revokes
the internal helper from authenticated; lines 106–107 document that contract. The fixture
directly calls it as authenticated at lines 119 and 168. An independent read-only diagnosis
confirmed the supported client function `my_pro_status()` returns the `pro` field and retains
authenticated execution. No function/grant/migration/fixture repair occurred in this batch.

Only 12 partial TAP results were emitted: 10 `ok`, with `not ok` at assertions 10 and 11
(DATA-01 direct anonymous-session desk creation/application boundaries). There was **no
complete 56-result stream or final TAP plan**. These lines are preserved as incomplete raw
evidence, not a validated full security baseline or confirmation of the predicted 12 failures.
Assertion 13's expression aborted; assertions 14–56 remain UNRUN. The wrapper deliberately
records the complete assertion count as null, rather than manufacturing a valid count.

The strict guard stopped the batch before a second platform. Two-replay reproducibility is
UNVERIFIED, not disproven. Official bootstrap checks passed again; all existing isolation and
scheduler checks remained active before every migration. Cleanup confirmed both named
containers absent, and the separate always-cleanup step passed. The failure stayed nonzero.

## Durable evidence and review

[Saved result JSON](../../supabase/tests/evidence/replay-baseline-35276711544.json) contains
source, exact 52 migration/fixture hashes, completed filenames, platform versions/controls,
SQLSTATE, incomplete TAP and cleanup. Artifact 10520333102 has seven-day retention, so this
committed sanitized evidence is the continuity record. No scheduler payload, production endpoint URL, secret,
vault content or customer record was copied into it.

Chief assigned this isolated replay batch after accepting 3dd686d, reserving the distinct
security-replay-baseline workflow and requiring Testing review. New files: that workflow,
supabase/tests/replay-baseline.js, replay-baseline.test.js, REPLAY_BASELINE.md and evidence JSON.
Changed existing tooling: platform-bootstrap.js only for reuse/instance context/filtered
failure logs; run-isolated.js only for structured evidence and sanitized SQLSTATE/TAP output.
Docs: this handoff, docs/testing-database.md and supabase/tests/README.md. All 52 migration
files, the existing 56-assertion fixture, and platform-check SQL stayed byte-identical to
3dd686d. No runtime, browser/deployment workflow, shared guidance or integration edit.

Focused independent review found/fixed a repeat guard gap before dispatch: a failing stream
must still contain exactly 56 results after 52 migrations before another fresh instance.
Testing explicitly cleared corrected exact 18babfa after independently checking safety,
unchanged input trees, all 11 focused tests, syntax and diff. All seven repository static
checks passed locally on this candidate, with the inherited 39 catalog warnings. No executable
change or repeat dispatch followed clearance; this is the first and only run of this batch.
Browser results remain separate and were not rerun for database-only tooling.

## Next bounded proposal and limits

Chief review comes next. Proposed test-only correction: replace the two direct fixture
`my_pro()` reads with `(select pro from public.my_pro_status())`, retaining actual
authenticated role and the denied/allowed contracts. Independently review that changed
fixture and any dispatch before fresh replay attempts. Do not restore internal helper grants.
This proposal is not implemented or authorization to begin a permission/schema repair.

DATA-01/02/03 remain unrepaired. Full 56-assertion baseline, two fresh successful application
replays, production parity, HTTP/Auth journeys and deployment remain unverified. No main
merge, production change, host installation or browser/structure integration was performed.
Only documentation/evidence changes follow the tested source, outside workflow trigger paths.

---

# Previous Security platform-only bootstrap handoff (historical)
Updated: 2026-09-17
Task: 01a0af8b-9a97-7593-a1d2-6d2491cfe947
Chief: 01a0b0fa-d857-7002-ab95-1da0a1cfb858
Branch: codex/security-platform-bootstrap
Starting checkpoint: 14d7e10a79232000ff24d2637ce6adc72b786b1f
Assigned scope: foundation e437d08914fb1cff84a89b0a2216b2b8635164fd
Exact reviewed and CI-tested source: 49b8193b6b6c17c63b97c898d268437ceb191cdf
State: one platform-only experiment PASSED; full application replay and all 56 permission assertions remain UNRUN.

## Outcome and exact execution evidence

[CI run 35275149357, attempt 1](https://github.com/rathunter69/Hotkey.gg/actions/runs/35275149357)
and [platform job 105383850944](https://github.com/rathunter69/Hotkey.gg/actions/runs/35275149357/job/105383850944)
completed successfully on September 17, 21:10 UTC. The workflow API, job steps and full job log
were read and matched the exact source above. First run passed; no rerun or image variation.
Ubuntu 24.04.5, runner image 20260907.300.1; Node 22.23.2/npm 10.9.8. The pinned actions used
the hosted runner's Node 24 compatibility mode and emitted deprecation warnings; the bootstrap
script and guard tests ran on the configured Node 22.23.2.

Durable [sanitized result JSON](../../supabase/tests/evidence/platform-bootstrap-35275149357.json)
contains the image digests, source versions, exact SQL hash, run/job and results. The uploaded
artifact has ID 10520915514 and seven-day retention; continuity does not depend on its survival.

| Verified runtime result | Evidence |
|---|---|
| Real database/Auth bootstrap | Official pinned Postgres 17.6.1.136 and Auth v2.196.0 images; Auth migrate exit 0; 77 recorded platform/Auth migrations, latest 20260625000000. This is NOT the 52 Hotkey migration chain. |
| Empty platform | All Auth data tables except the schema ledger empty; zero Auth users; zero public application tables, also checked after rollback. |
| Official objects and permissions | auth.uid(), auth.jwt(), anonymous-user column, expected platform roles, postgres SET ROLE rights, Auth table access and public default ACL checks pass. Real helpers work under anon/authenticated with synthetic claims. No grants/functions or passwords fabricated. |
| Extension compatibility | PostgreSQL 17.6; actual transactional creation of pgTAP 1.3.3, pg_cron 1.6.4, pg_net 0.20.3 succeeds, then rolls back. No scheduled jobs or HTTP queue entries. |
| Isolation | Database network none and only loopback; no ports or host/persistent mounts; tmpfs data/socket; immutable images; Auth migrator shares only the DB namespace and serves no API. Scheduler reports off with command-line source before Auth, after Auth and after checks; official first-start entrypoint carries that option through initialization. |
| Cleanup | Migrator removed before assertions; final named-container removal and separate always-cleanup step pass, confirming both purpose-labelled containers absent. |
| Explicit excluded work | Hotkey migrations executed: 0. Permission assertions executed: 0. No production project, customer rows, outbound delivery, host installation, app/migration edits, main merge or deployment. |

## Review, ownership and validation

Chief explicitly reserved the new security-platform-bootstrap workflow to this task; Testing
retains browser/deployment workflow ownership. New files are that distinct workflow and
supabase/tests/platform-bootstrap.js, platform-bootstrap-check.sql, platform-bootstrap.test.js,
PLATFORM_BOOTSTRAP.md, plus the saved evidence JSON. Documentation updates are this handoff,
docs/testing-database.md and supabase/tests/README.md. Existing runner/56-assertion SQL and
all application, migration, browser gate/deployment files are unchanged from 14d7e10.

Focused source investigation checked the exact Auth configuration and embedded migration
route. Independent code review caught/fixed a protected Auth-ledger read before dispatch:
metadata uses the platform admin, while extension/ACL/claims checks retain intended roles.
Testing task 01a0af90-b973-7572-b7ff-d5bf9f504a52 gave explicit no-blocker safety clearance for
49b8193 before its first branch push, verifying triggers, permissions, pinned actions/images,
confinement, cleanup and no application replay. The chief confirmed continuation within the
existing authorization. No safety-relevant executable change followed that clearance.

Local exact-candidate validation: all seven repository checks pass (39 inherited catalog
warnings); four bootstrap guard tests plus three existing runner tests pass; syntax, plan and
diff checks pass. Linux CI reran the four bootstrap guards and passed the actual platform
experiment. Browser checks are not rerun because this batch changes no browser/runtime code;
the independent Testing task's browser CI is a separate result.

## Limits and next proposed step

This closes the reviewed platform-bootstrap gap for this exact image pair on the recorded
Linux host. It is one successful platform initialization, not two reproducible Hotkey replays,
production parity, an HTTP/Auth user journey, a security repair or an integrated release.
DATA-01/02/03 remain unrepaired and the 56 SQL permission assertions remain UNRUN.

Chief review/acceptance comes next. The next separate proposed batch is two fresh isolated
application replays and the expected-failing permission baseline, preserving startup isolation
and stopping at the first migration failure. The current script intentionally destroys its
containers and cannot replay application SQL. No further run or repair starts automatically.
Documentation/evidence-only handoff commits do not match this workflow's trigger paths.

---

# Previous Security groundwork handoff (historical; superseded setup status above)
Updated: 2026-09-17
Task: 01a0af8b-9a97-7593-a1d2-6d2491cfe947
Chief: 01a0b0fa-d857-7002-ab95-1da0a1cfb858
Branch: codex/security-groundwork
Starting integration: 6c984161c31bc4637dbe88b73a4da8408cefdf1d
Latest guidance read separately: foundation 3e15e662b86368bd7338cb482a37ed1bd4b9a2cf
Exact validated test-code commit: ce53324df2dba934b4acb495bf28e74f35de9bd3
State: test groundwork prepared and locally validated; official image feasibility reviewed, complete Auth bootstrap pending; no security schema repair, integration or deployment.

## Latest checkpoint: official image/bootstrap feasibility

Chief's September 17 follow-up requested one official setup route after accepting `2a4a5f5`.
This documentation-only checkpoint resolves the public image metadata and source tags for
Postgres 17.6.1.136 and Auth v2.196.0, recorded with full immutable Linux amd64 digests and
pinned source links in [testing-database.md](../testing-database.md#official-platform-feasibility-review--september-17).
Independent review confirms the standalone database image lacks `auth.jwt()` and
`auth.users.is_anonymous`; its genuine platform grants otherwise match the test preconditions.
The official Auth migration command supplies the missing schema through its complete chain.

This replaces the generic missing-image blocker with a specific unimplemented/unverified Auth
bootstrap step. A GitHub-hosted Linux Docker route exists. Testing will integrate a separate
job after Security supplies a reviewed complete bootstrap; its browser gate remains separate.
The minimal proposed next action is one platform-only bootstrap check using the pinned pair,
network none/tmpfs/no ports, scheduler disabled from first startup, and an official Auth
migrator confined to that network namespace. Verify empty data, Auth objects, ACLs, extensions
and isolation before any application replay; stop at the first setup failure. No speculative
variants, fake Auth/grants, production secrets or host installation.

No executable bootstrap was added or dispatched. All 56 SQL assertions, full replay and image
startup/compatibility remain UNRUN; DATA-01/02/03 remain unrepaired. Changes in this checkpoint
are only this handoff, docs/testing-database.md and supabase/tests/README.md. Source/registry
read-only inspection, independent review and diff checks are the new evidence; prior passing
static/runner checks remain applicable to unchanged executable code at `ce53324`.

## Scope and outcome
Chief assigned this bounded preparation on September 17 under Wolf's testing/security request.
A separate worktree preserves all old branches and dirty source. Reused DATA_SECURITY,
both cleanup reports and the accepted account/testing integration; no whole-audit rerun.

- Added 56 synthetic pgTAP assertions for DATA-01: outsider self-captain and backdated join;
  member role/seniority updates; owner verification/school insert and update; anonymous/unpaid
  direct creation; application eligibility/private/recruiting/five-pending bypass; allowed
  create/join/recruit/invite/application/acceptance paths. Twelve assertions are predicted to
  fail on current vulnerable source; this is NOT an executed reproduction or passing protection.
- Fixtures use genuine database roles and synthetic JWT claims, rollback-only probes and an
  outer rollback transaction. Missing platform defaults or existing Auth users fail setup.
- Added a local Docker-only runner: purpose label, immutable image selection, no host/persistent
  mounts or published ports, network none and loopback only, scheduler disabled from startup.
  It refuses database URLs and inherited remote connection settings. Preflight precedes SQL;
  replay stops at the first error. A matching complete-replay manifest is required for tests.
  pgTAP failures/skips/incomplete output cannot masquerade as success through psql exit zero.
- Documented DATA-02 public/private profile acceptance and DATA-03 AAL1/AAL2/login/recovery
  requirements separately. No privacy/MFA implementation or new product rule.
- Wrote the precise missing host/image contract, command sequence and evidence/cleanup rules.
  No fake auth schema, customer fixtures, widened app grants or history edits.

Owned/changed files: supabase/tests/README.md; supabase/tests/run-isolated.js;
supabase/tests/runner.test.js; supabase/tests/database/01-desk-authorization.test.sql;
docs/testing-database.md; docs/handoffs/security-accounts.md.
No changes to application files, 52 migrations, configuration, gate.yml, package/lockfile,
CURRENT.md or PRODUCT.md. Testing owns browser/workflow/development changes; Cleanup owns
repository documentation/structure. Shared owners were notified, no browser port used.

## Verification and limits
Validation was run on the exact executable tree committed as ce53324; subsequent handoff
changes are documentation only. Windows x64; verified portable Node22.23.2/npm10.9.8 reused
from Testing. No new dependencies installed.

| Check | Result |
|---|---|
| npm run check | All seven commands pass; inherited 39 catalog warnings remain. |
| node --test supabase/tests/runner.test.js | All three tests pass: unsafe container modes rejected; not-ok remains failure; missing/incomplete/TODO/SKIP/bailout cannot be green. These are runner tests, not RLS tests. |
| run-isolated.js --plan | Succeeds, records source/hash manifest: 52 migration files and one SQL suite. |
| Capability check --container hk-security-capability-check | Fails before SQL with docker ENOENT. No container/database exists or was contacted. |
| Host inventory | Docker/Podman/Postgres/CLI absent from PATH and standard installs; no matching services. WSL explicitly not installed. |
| Independent review | Found/fixed malformed dollar quoting before final validation. Reviewed actor privileges, rollback probes, denial errors, allowed controls, replay marker and final additional cases; no remaining concrete blocker. |
| Diff review | Application, migration and workflow diff against 6c98416 is empty. git diff --check clean. |

Initial sandbox process runs returned EPERM; permitted local subprocess runs passed. No
permission review rejected this batch. SQL parsing/execution, fixture results, PostgreSQL
extension compatibility, full migration replay and two clean replays are UNRUN. This is
prepared test code, not a completed database audit or a DATA-01 fix. Existing account/browser
baseline is reused from integration c702c69/6c98416, not rerun for these tests/docs-only changes.

Git/testing confirms GitHub-hosted Linux can provide Docker but has not approved/provisioned
a complete database bootstrap or database job. It will not bundle an unreviewed DB job in
its browser workflow. The official pair is pinned above; genuine empty Supabase auth schema,
platform defaults, pgTAP/pg_net and pg_cron disabled from first startup must be verified. See
[testing-database.md](../testing-database.md) for the runnable host contract. No host service
installation, remote project creation, production queries, live exploit, email, customer-row
retrieval, secret rotation, billing action, main merge or deployment occurred.

## Next bounded proposal and chief integration
Mark Security groundwork as prepared/locally validated with database execution pending;
DATA-01/02/03 remain unrepaired. The next proposed batch is the platform-only official Auth
bootstrap check above, followed after acceptance by two fresh isolated replays and this
expected-failing baseline on the dedicated Linux test host. Capture first failures without
skipping/editing old migrations. Only then
prepare the separately authorized DATA-01 forward permission repair and prove denied/allowed
cases before/after. DATA-02 and DATA-03 require their own agreed contracts and separate repairs.
The chief owns prioritization; this proposal does not start schema changes automatically.

All non-secret code/guidance is to be pushed on codex/security-groundwork and verified by remote
SHA/fetch before completion is reported. Git history supplies the final documentation SHA.

---

## Previous account-isolation handoff (historical; accepted integration linked above)
# Security and accounts
Updated: 2026-09-17
Task: 01a0af8b-9a97-7593-a1d2-6d2491cfe947
Branch: codex/security-accounts
Starting commit: 785b30ee1e89a795bdceaa85415353915eb2ccd2 (codex/repository-foundation)
State: locally verified; completed branch checkpoint for remote handoff, not merged or deployed.

## Scope and outcome
Wolf authorized starter 1 on September 17: DATA-05 account-bound cached profiles, late account responses and sign-out drill reset. Repairs use a separate security-accounts worktree; the original source checkout and its pending foundation files remain untouched. The chief's later documentation-only reservation at 9df3405 does not require rebasing this batch.

- Profile requests/cache and consumers carry account ID plus lifetime generation. A -> B -> A does not revive the first A request. Same-account calls still share one request; rejected loads can retry.
- Session/header/profile/client-state/XP/rank responses are fenced before updating UI or local mirrors. Delayed sync and cosmetic work cannot write under the next account; founding-rank and desk-status caches follow the same account boundary.
- Navigation subscribes once when the Supabase client becomes available, including the trainer's late initialization. Ownerless INITIAL_SESSION preserves guest progress; account changes clear old mirrors while preserving the new auth session.
- Sign-out removes the actual hotkey_last_drill key, invalidates outstanding work, and closes the profile card. Device theme/onboarding preferences remain.
- Shared asset versions advance to nav.js v308 and themes.js v315. All 74 drill pages and the library were regenerated; changes there and in top-level HTML are cache references only. No catalog or gameplay rule changed.

## Files owned and changed
Runtime: nav.js; themes.js (founding-rank callback only).
Regression/tooling: dev/e2e-account-isolation.js; dev/run-checks.js; .github/workflows/gate.yml; dev/audit-state.js (one-line explicit start-gate setup required by existing static guard).
Cache references: 404.html, account.html, admin.html, billing.html, cert.html, contact.html, desks.html, enterprise.html, index.html, leaderboard.html, privacy.html, profile.html, reference.html, security.html, stats.html, terms.html; all 75 existing drills/*.html files (74 drill pages plus index).
Continuity: docs/handoffs/security-accounts.md. Git's commit file list is the exact generated-page manifest. Regenerated sitemap/refmap have no semantic diff. CURRENT.md and PRODUCT.md remain chief-owned.

## Verification
- Final `node dev/run-checks.js static` with GATE_BASE=785b30e: all seven commands passed, including asset consistency/bump checks and three tooling tests. Existing 39 catalog-variety warnings remain.
- `node dev/run-checks.js browser dev/e2e-account-isolation.js`: final 14 scenarios passed. Covers returning guest INITIAL_SESSION, late client initialization/one subscription, same-account preservation/cache reuse, A -> B and A -> B -> A, delayed success/session/client-state responses, cancelled state push, founding flags, cosmetic read/write, failure retry, and real trainer reload after sign-out. Synthetic accounts only; all external traffic blocked in this suite.
- `node dev/run-checks.js smoke`: all six commands passed at the initial nine-scenario revision. Existing five suites passed: seven application pages and 19 mobile page widths; 41 leaderboard assertions; 39 landing assertions; paywall guard; navigation/combo/foot demo wins. The final listener/guest corrections were then covered by the final 14-scenario run and static suite; the entire smoke suite was not redundantly rerun.
- `node dev/run-checks.js browser dev/build-drill-pages.js`: generated exactly 74 drills plus library, zero orphans. Generated differences contain only the two asset-version changes.
- Independent review identified and closed late-client subscription and returning-guest INITIAL_SESSION regressions. Final review: no remaining blockers in this bounded diff. `git diff --check` passed.

Environment: Node 24.19.0, bundled Playwright 1.62.1, installed Chrome 152. npm is unavailable in this environment, so the documented equivalent Node check command was used. Browser launch and Node test subprocesses initially hit sandbox EPERM; execution with the approved local process permission passed. Exact pinned Playwright 1.49.1 installation, full CI matrix, live multi-tab Supabase auth and page-specific data loaders outside this shared-nav boundary are not certified by this batch. Git/testing owns pinned dependency verification and has been released port 8791.

No production data, schema, Auth configuration or billing changes were made. No main merge or deployment was requested. Supabase's current [auth-event documentation](https://supabase.com/docs/reference/javascript/auth-onauthstatechange) and changelog were read; no relevant API change was needed.

## Decisions for the chief orchestrator
Confirmed scope only; no new product decisions. Proposed CURRENT.md update: DATA-05 shared-nav account-isolation batch is implemented and locally verified on this branch, pending integration and release verification. Keep it distinct from a production repair. Chief was notified of ownership and the small related callback/test changes. Release file reservations when this branch handoff is received.

## Findings and next step
Next proposed Security batch: DATA-01 desk authorization with isolated guest/member/captain/outsider/direct-table tests and a verified release path. DATA-02 profile privacy, DATA-03 MFA and DATA-06 duplicate saves remain separate, unrepaired findings. Do not start those from this handoff alone. Preserve current learning/progress rules and saved server history.
