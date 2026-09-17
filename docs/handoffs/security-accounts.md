# Security groundwork — current handoff
Updated: 2026-09-17
Task: 01a0af8b-9a97-7593-a1d2-6d2491cfe947
Chief: 01a0b0fa-d857-7002-ab95-1da0a1cfb858
Branch: codex/security-groundwork
Starting integration: 6c984161c31bc4637dbe88b73a4da8408cefdf1d
Latest guidance read separately: foundation 3e15e662b86368bd7338cb482a37ed1bd4b9a2cf
Exact validated test-code commit: ce53324df2dba934b4acb495bf28e74f35de9bd3
State: test groundwork prepared and locally validated; database execution unavailable; no security schema repair, integration or deployment.

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
an exact database platform image or database job. It will not bundle an unreviewed DB job in
its browser workflow. A reviewed immutable image with genuine empty Supabase auth schema and
platform defaults, pgTAP/pg_net and pg_cron disabled from first startup is required. See
[testing-database.md](../testing-database.md) for the runnable host contract. No host service
installation, remote project creation, production queries, live exploit, email, customer-row
retrieval, secret rotation, billing action, main merge or deployment occurred.

## Next bounded proposal and chief integration
Mark Security groundwork as prepared/locally validated with database execution pending;
DATA-01/02/03 remain unrepaired. The next proposed batch is to review/pin an empty-platform
image and execute two fresh isolated replays plus this expected-failing baseline on a dedicated
Linux test host. Capture first failures without skipping/editing old migrations. Only then
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
