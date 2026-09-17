# Current project state

Updated 2026-09-17. Chief coordinator: task `01a0b0fa-d857-7002-ab95-1da0a1cfb858`,
succeeding `01a0af30-bac0-7b73-9d9e-56f298996c1a`.
Repository: **rathunter69/Hotkey.gg**. Shared guidance: **codex/repository-foundation**.
[PRODUCT.md](PRODUCT.md) owns product decisions; [TASK_GUIDE.md](TASK_GUIDE.md) owns the working
method and area boundaries; [TASK_STARTERS.md](TASK_STARTERS.md) supplies the twelve starters.
This is the single current queue. Historical guidance does not authorize more work.

## Current objective and authority

The chief owns planning, priorities, shared product guidance and coordination. Application
repairs and integration remain in dedicated tasks. Wolf's latest request is to orchestrate
testing/security groundwork, review security and the GitHub file structure, and make that
structure cleaner. It authorizes the bounded batches below, including bringing one small
repository-organization change forward. It does not start every later roadmap module.

Preserve the general UI, ribbon and game workspace. Pixel art is for identity/achievements.
The chosen product sequence remains security/account work → catalog/progression separation
→ targeted cleanup → site structure/interactions → fully planned catalog rebuild preserving
Foundations feedback. The newly authorized documentation/structure batch is a specific early
cleanup, not a replacement of that sequence.

Wolf's latest September 17 clarification makes the next catalog/flow review explicitly a
decision review of game modes, ranked play, drills, learning paths, completion/assistance,
progress/rewards, access and the end-to-end learner journey. Reconcile current behavior with
deferred, superseded and conflicting older pushes; do not assume historical code is current
intent. [PRODUCT's systems review](PRODUCT.md#catalog-modes-and-learner-flow-decision-review--september-17-clarification)
defines the evidence, decision register and acceptance examples. The prior practice/ranked
switch preference is open for discussion but remains the implementation baseline until Wolf
decides otherwise. This schedules design/evidence work after groundwork; it does not launch
another module, restore a mode or authorize a catalog/progress reset.

The October 1 deadline is parked. Subscriptions at launch and customized onboarding remain
future requirements. Broad feature/content development, live billing and catalog rebuilding
stay paused. Guided beginner learning, assisted completion without XP, and freely explored
basics with recommended paths are direction for future design; existing rules stay unchanged
until the relevant decisions and implementation are approved. Exact timing, assessment,
paid boundaries, certificates, supported platforms and business facts remain open in PRODUCT.

No main merge, deployment, production data changes, table removal, progress reset or broad
framework rewrite is authorized. Structural moves and security/gameplay changes must remain
separately reviewable. Do not restore retired tours, invite gates, membership tables or the
practice/ranked mode switch from historical instructions.

## Verified source and validation baseline

| Source | Verified state |
|---|---|
| Remote main | `434bc0e8764e741e0e11f84cf51d61a1755d7c67`, PR #250 merged September 5. Refreshed September 17; unchanged. The last observed main gate/Pages results belong to this old source, not the repair branches. |
| Shared guidance | `codex/repository-foundation`; read its current remote tip. Foundation introduced guidance/audits and development tooling, not a framework migration or application repair. |
| Accepted combined application/testing checkpoint | `codex/account-testing-integration`, remote handoff commit `6c984161c31bc4637dbe88b73a4da8408cefdf1d`; exact tested code `c702c6932b342cd36656317f7ce50f1c33b7df3e`. The final commit adds only its handoff document. Not merged into foundation/main or deployed. |
| Accepted groundwork integration / next area baseline | `codex/groundwork-integration` at `00df57afd8d3299cc7feaf523847b9ca43e54d06`; executable checkpoint `328cae8fa7a5fba3e71690e0c556f8704506b304`. Chief accepted its remote handoff and verified full-tree browser/runtime equality with tested 4ea428b plus exact Security preparation blobs. Start future area branches from this checkpoint (or an explicitly accepted successor), and read latest foundation guidance separately. No main merge/deployment. |
| Active batch starting point | The three original area branches start from accepted integration 6c98416 and read later foundation guidance separately. The accepted platform-only experiment starts from Security feasibility 14d7e10; replay-baseline work starts from its handoff 3dd686d. These preserve that ancestry and remain outside the browser/structure integration. Preserve both accepted account/testing batches. |

The chief verified remote ancestry: foundation f2dd564 → account import 2981dec → testing
import 3271c67 → isolation correction c702c69 → handoff 6c98416. The integration owner ran:
seven static commands, two network-canary tests, 14 account-isolation scenarios, all five
original smoke suites and 86 onboarding assertions. All passed with fresh locked installation,
Node 22.23.2, npm 10.9.8, Playwright 1.49.1 and matching Chromium 131.0.6778.33 headless shell
(build 1148). Two independent reviewers found no remaining integration blocker. The smoke
command includes canary/account checks; these are not duplicated independent runs.

That earlier checkpoint establishes the requested **combined local baseline only**. The wider
local matrix and exact-source full Linux gate have since passed on Testing's checkpoint below.
Neither result establishes live/multi-tab authentication, page-specific loaders beyond shared
navigation, isolated database replay/permissions, production delivery or recovery.
The full Windows Chromium executable previously failed to launch; the matched headless shell
passed. Existing 39 catalog-variety warnings and separate audit findings remain unresolved.

## Current batch assignments and outcomes — authorized September 17

The existing tasks own one bounded batch each; no duplicate tasks or automatic later batches.
All preserve original local work and earlier remote branches.

| Owner / task | Scope | Exclusive files / boundaries |
|---|---|---|
| **Establish testing and blockers**, `01a0af90-b973-7572-b7ff-d5bf9f504a52`; `codex/testing-security-groundwork` | Complete local matrix and exact-source full Linux run 35274460688 passed at 4ea428b; remote docs-only handoff 31af74b accepted. Redirect-safe isolation covers every active gate harness/generator, with redirect/WebSocket/service-worker canaries. | Browser test workflow(s), browser helper/canary/harnesses and generator isolation, `dev/run-checks.js`, `docs/DEVELOPMENT.md`, testing handoff. Port 8791 released after local checks. Also read-only safety review of Security's separate platform workflow before its first push/run. |
| **Begin account isolation fixes**, `01a0af8b-9a97-7593-a1d2-6d2491cfe947`; accepted `codex/security-platform-bootstrap`, active `codex/security-replay-baseline` | Platform-only experiment passed first attempt at 49b8193; durable handoff 3dd686d accepted. Continue one bounded isolated application-replay/permission-baseline batch. All 56 SQL assertions remain UNRUN until replay succeeds; DATA-01/02/03 remain unrepaired. | `supabase/tests/`, `docs/testing-database.md`, security handoff and distinct `.github/workflows/security-replay-baseline.yml`. Testing reviews exact candidate before triggering push. No gate/deployment workflow, application runtime or migration edits; separate from current integration. |
| **Audit starter 3 cleanup candidates**, `01a0af90-7fb2-7571-a5d6-b82354d57540`; `codex/repository-structure` | Complete on its branch at cf8c61b: archived the historical PROJECT_CONTEXT record, kept a root compatibility page, repaired links and recorded the remaining structure plan. Chief verified preserved text and docs-only file manifest. Included in accepted combined checkpoint 00df57a; no main merge. | `README.md`, `docs/ARCHITECTURE.md`, selected historical documentation/archive paths and non-shared documentation links, `docs/handoffs/repository-structure.md`. No runtime, generated pages, migrations, test harness or workflow edits. |
| **Integrate account testing changes**, `01a0b0f9-09da-7a62-9dd2-dd9baeac388d`; `codex/groundwork-integration` | Complete and accepted at remote 00df57a. Account repair, full Testing 4ea/31af, structure cf8 and Security preparation/14d coexist; seven combined static checks, three runner units, source-equivalence review and replay-plan pass. Full local/Linux browser evidence reused only after exact executable equivalence; SQL56 remains UNRUN. | Integration branch and `docs/handoffs/groundwork-integration.md`. Preserve exact area executable files and chief guidance; exclude the separate platform-bootstrap experiment. No main merge/deployment. |
| Chief coordinator, this task | Read-only GitHub/security/structure review, ownership coordination, remote handoff reconciliation and next choices. | `docs/CURRENT.md`, `docs/PRODUCT.md`, `docs/handoffs/chief-groundwork.md`. Other tasks send proposed corrections instead of editing these. |

Testing checkpoint [4ea428b](https://github.com/rathunter69/Hotkey.gg/commit/4ea428ba1504ee04b3d01943df5f7cd1b68a2c4d)
is remote-verified by the chief: parent 6c98416; 23 test/workflow/generator/documentation files;
no application runtime, generated content, migration or deployment edits. Its local report
covers all seven static checks, canaries, account isolation, smoke and full gate suites,
including onboarding, alternative paths, visual/parity, keyboard, formulas and depth checks.
Generator verification reported no tracked content differences. The independent Linux
[run 35274460688](https://github.com/rathunter69/Hotkey.gg/actions/runs/35274460688)
completed successfully at exactly 4ea428b; the chief verified its successful run and all 35
job steps, including setup/teardown. Updated browser workflows
use explicit read-only permissions and pinned actions. Combined integration is accepted at 00df57a, reusing the successful browser evidence through
verified executable-source equality. The chief independently compared full remote file trees:
all differences from tested 4ea428b are documentation or accepted dormant Security test files;
all Security test-file blobs match 14d7e10. Combined static and runner checks passed on the
integration tree. Linux CI itself ran on 4ea428b, not on the integration commit. Testing's final
handoff 31af74b changes documentation only over that tested source.

The additional database assessment task `01a0b0f0-0755-7962-b436-a6646a32321d` stays paused
to avoid duplicate cleanup. Testing and Security coordinate any database CI job before editing
a shared workflow. Security's host check found no local Docker/Podman/Postgres/Supabase CLI or WSL. Feasibility
review at 14d7e10 pinned the official database/Auth pair. The accepted platform-only Linux
run now closes that bootstrap gap using genuine official Auth migrations, with no stubs or
host installation. Application migration replay and permission results remain pending.

Browser tests must block production traffic, including redirects, and use synthetic fixtures.
Before any database replay, establish outbound denial and disabled scheduling; the migration
chain contains a production digest callback. Missing infrastructure never permits using
production. Test-only CI may run only after reviewing triggers, permissions and side effects;
do not merge main or invoke deployment to make a workflow dispatchable.

Security's platform-only experiment **passed on its first reviewed run**:
[35275149357](https://github.com/rathunter69/Hotkey.gg/actions/runs/35275149357),
exact source 49b8193b6b6c17c63b97c898d268437ceb191cdf, remote handoff
3dd686d26edcb53325579fbe479eb01bdf41f773. The chief verified the run/job conclusion,
exact source and docs/evidence-only final delta. Genuine Auth bootstrap (77 platform/Auth
migrations), empty Auth/public data, required objects/ACLs/roles, transactional extension
checks, startup scheduling disabled, isolation and named cleanup passed. Hotkey migrations
executed: **0**; permission assertions executed: **0**. The 77 platform migrations are not
the 52 Hotkey migrations. One platform pass is not reproducible application replay, production
parity, a permission repair or an integrated release.

After accepting this result, the chief assigned one continuation of Wolf's testing/security
groundwork on `codex/security-replay-baseline` from 3dd686d. Reuse the proven exact image pair
and bootstrap plus the guarded runner; prepare a distinct branch-only workflow and obtain
Testing's independent exact-source safety review before triggering it. Preserve network none,
no ports/host or persistent mounts, memory-backed data, genuine official permissions,
startup scheduling disabled, pinned actions, minimal permissions, no production secrets,
exact-source validation and purpose-labelled cleanup.

Replay all 52 source migrations unchanged and in order, aiming for two fresh successful
replays before claiming reproducibility. Stop at the first migration incompatibility and save
the exact sanitized filename/error; never skip a failure, patch migration history, manufacture
objects/grants, vary images or reuse a partially replayed database as a baseline. If replay
succeeds, run the existing 56 synthetic permission assertions under real roles. Predicted
failures remain hypotheses until executed; failing assertions cannot be suppressed into a
green job. Bounded wrapper errors may be corrected and reviewed, but a genuine source replay
failure ends this batch. No application/schema repair, privacy/MFA implementation or new
product module is authorized. The experiment stays outside current browser/structure
integration and must not delay its handoff.

Testing subsequently cleared corrected exact replay candidate
18babfa80dea4acb31fd30be2ae00b3610d42ed2 for one isolated run. Its source review confirms
the 52 migrations, 56-assertion fixture and platform SQL are unchanged from accepted
3dd686d; all 11 focused guard tests pass. Only a complete first replay/assertion result can
permit one fresh repeat, and any permission assertion failure keeps the final result failing.
The chief confirmed execution within the already assigned scope. At clearance, the candidate
had not been dispatched and all application SQL remains UNRUN; require the actual remote
source/run/result before changing that status.

Every area uses economical focused investigation and independent review. Finish the authorized
batch, record exact tested source/environment, actual pass/fail/unrun checks, file manifest,
unresolved risks and a verified remote handoff. The chief checks compatibility before declaring
the combined batch complete. Broader moves, live GitHub policy changes and application/schema
repairs remain separately scoped.

## Remote evidence and completed handoffs

| Area | Pinned report | Accepted meaning |
|---|---|---|
| Account isolation | [e598752](https://github.com/rathunter69/Hotkey.gg/blob/e598752d8dc39acd500276fbd42d50955018bbeb/docs/handoffs/security-accounts.md) | DATA-05 shared-nav repair; late responses/account caches/sign-out reset. Nav v308/themes v315 and generated references preserved in combined checkpoint. No live-account clearance. |
| Repository/database assessment | [b852e41](https://github.com/rathunter69/Hotkey.gg/blob/b852e41969e4157e9ce7f93aa48b8dda302f3b29/docs/handoffs/repository-database.md) | Positive dependencies for all 18 tables; active old-map/SQL-test consumers; conditional archive candidates. Assessment, not implemented deletion. |
| Original Git/testing baseline | [136df03](https://github.com/rathunter69/Hotkey.gg/blob/136df032c119de73e6896ca480381ab77846e872/docs/handoffs/git-testing-releases.md) | Exact dependencies, local Git dry-run access and isolated smoke baseline verified on that branch. Its separate-source gap was later closed for the combined local baseline only. |
| Additional database assessment | [6a73f8e](https://github.com/rathunter69/Hotkey.gg/blob/6a73f8e649f875f567f44748c9e677d1065ac5d5/docs/handoffs/repository-database.md) | Same keep conclusion; transitional aggregates, missing billing objects and migration-history differences. No data/schema changes. |
| Account/testing integration | [6c98416](https://github.com/rathunter69/Hotkey.gg/blob/6c984161c31bc4637dbe88b73a4da8408cefdf1d/docs/handoffs/account-testing-integration.md) | Requested combined local checks pass at c702c69, remote provenance verified; explicit CI/live-auth/DB limits remain. Task finished and released port 8791. |
| Security test preparation | [2a4a5f5](https://github.com/rathunter69/Hotkey.gg/blob/2a4a5f544e968850cdfd27557108de13c3ffcec2/docs/handoffs/security-accounts.md) | Code ce53324 has guarded disposable runner and 56 synthetic role assertions; three runner units/static pass. Twelve predicted vulnerability failures are not executed reproductions. No database replay, permission result or security repair is claimed. |
| Official test-platform feasibility | [14d7e10](https://github.com/rathunter69/Hotkey.gg/blob/14d7e10a79232000ff24d2637ce6adc72b786b1f/docs/handoffs/security-accounts.md) | Pinned official database/Auth image manifests and source SHAs; standalone platform gaps traced. Documentation-only delta over 2a4a5f5, executable code remains ce53324. No bootstrap/replay/SQL result yet. |
| Combined groundwork integration | [00df57a](https://github.com/rathunter69/Hotkey.gg/blob/00df57afd8d3299cc7feaf523847b9ca43e54d06/docs/handoffs/groundwork-integration.md) | Remote tip/handoff verified; browser/runtime tree equals fully tested 4ea428b, Security test blobs equal accepted 14d7e10. Combined static7/runner3/replay-plan and independent review pass. Includes cleanup and latest modes/flow guidance through 45edd. Excludes separate platform/replay experiments. Accepted future area baseline; no main merge or deployment. |
| Full testing groundwork | [31af74b](https://github.com/rathunter69/Hotkey.gg/blob/31af74b23a3ba65c9adb94254626e88632dabe0c/docs/handoffs/git-testing-releases.md) | Exact test-tooling source 4ea428b on preserved application c702c69: full local matrix and Linux run 35274460688 pass; chief verified source/run/job and docs-only final delta. Covers active gate isolation and generator drift, not live accounts, DB permissions or launch acceptance. |
| Isolated platform bootstrap | [3dd686d](https://github.com/rathunter69/Hotkey.gg/blob/3dd686d26edcb53325579fbe479eb01bdf41f773/docs/handoffs/security-accounts.md) | Exact reviewed source 49b8193 passed Linux run 35275149357 on first attempt; durable sanitized JSON committed. Genuine empty platform, Auth helpers/ACLs, extensions, isolation and cleanup verified. Zero Hotkey migrations or permission assertions; not a DATA-01/02/03 repair. |
| Repository structure cleanup | [cf8c61b](https://github.com/rathunter69/Hotkey.gg/blob/cf8c61bc1a6922325ac63f9d6449795e40484847/docs/handoffs/repository-structure.md) | Historical record moved to docs/history with compatibility page and repaired references. Chief fetched old/new content: same 1,145 lines, only the two Markdown targets on one line changed. No runtime/test/workflow/schema edits; documentation checks passed. |
| Chief GitHub/security/structure review | [chief-groundwork.md](handoffs/chief-groundwork.md) | Fresh branch/ruleset/tree/workflow source review and bounded structure guidance; no settings or application changes. |

The two database assessments use the same report path on distinct branches. Retain both links;
do not overwrite one with the other. Their recommendations are complementary: move repository
test consumers before archiving SQL mirrors; compare extra migration statements and perform
isolated replay before schema/history reconciliation. Saved-progress owns any future aggregate/
history contract; Payments owns the billing scaffold; Security owns permission repairs.

All 18 public tables remain in use through application, functions, triggers or scheduled jobs.
`run_stats` still has a writing trigger despite no current app reader. `drill_feedback` has a
write path. Raw runs and certificates must survive. No current table qualifies for removal.
`profiles.plan` and `invoices` are missing billing scaffold objects, not unused tables to
delete or authorization to create speculative schema.

## Security, correctness and release gaps

The [platform audit](audit/README.md) owns the evidence. Reuse the relevant area report before
a repair; no full re-audit is required to continue one bounded change.

| Open issue | Owner / required evidence |
|---|---|
| DATA-01 desk write/role bypasses | Security: direct-table and RPC tests for outsider/member/captain/owner/guest/admin plus legitimate routes, then a separately scoped forward migration. |
| DATA-02 public profile metadata | Security: database-enforced public/private fields and hidden-school tests, preserving owner access. |
| DATA-03 incomplete MFA | Security: opted-in login/challenge/recovery/protected-action tests. Enrollment success alone is insufficient. |
| DATA-04/06/07 history/rankings, duplicate saves and result trust | Saved-progress with Security: explicit persistence/competition contract, capped/failed reads, idempotent retries, direct-write constraints. No historical progress reset. |
| Engine formulas and graders | Engine owner: explicit expected spreadsheet outcomes, live-model grading and legitimate alternative-route regression evidence. Existing demo success does not close these defects. |
| False save/error messages and beginner flow | UI/persistence owners: truthful feedback, one understandable learning journey; preserve ribbon/workspace. |
| Release protections | GitHub freshly reports unprotected main, no required contexts and no rulesets. Testing proposes required checks/review after check names/results are established; no live rule changed. |
| Database delivery | Earlier run [33814362058](https://github.com/rathunter69/Hotkey.gg/actions/runs/33814362058) failed linking; later source still uses floating CLI and independent live deployment. No new deployment attempted. |
| Isolation, history and schema parity | 52 source migration versions occur in 61 live records, including nine extras. Prior 54 function bodies match except one comment; both deployed function sources matched. This is not whole-schema/grant/configuration parity or clean replay. |
| Hosting/recovery | Cloudflare and GitHub Pages have historical results; active serving origin/build output, preview headers and rollback remain unverified. Moving prototypes inside the served tree does not hide them. |
| Billing/launch | Checkout remains test-only; webhook/authoritative subscription lifecycle and business readiness remain incomplete. No billing activation. |

The original root workflow sources lacked explicit token permissions; effective repository
defaults remain unverified. Testing's 4ea428b checkpoint now tightens its test-only workflows;
the independent database deployment workflow remains unchanged. Ignore rules and
the existing secret scanner are useful controls, not proof that repository history/settings
are free of secrets. No customer records, credentials or private financial details belong in Git.

## Source and structure constraints

This is a static application: root HTML/JS/CSS is the runtime, with 74 catalog drills in eight
chapters. `package.json` supplies development tooling. Consult [ARCHITECTURE.md](ARCHITECTURE.md)
for editable sources and generated files; do not edit generated drill pages instead of sources.
Shared runtime JS/CSS changes require synchronized cache versions and drill-page regeneration.
Structural cleanup preserves behavior and existing grading/alternative-route contracts.

Old v3/v4 planning files still drive tests/generators; v5/v5.1 is a proposal, not the runtime
catalog or an approved rebuild. Retain canonical migrations and check the newest function
definition before any future new migration. Never rewrite applied history for tidiness.

Unmerged tutorial/progression alternative:
[1703b59](https://github.com/rathunter69/Hotkey.gg/tree/1703b59324af098f252b8b4dcd8d3fd859338197),
`claude/platform-improvements-roadmap-ycogch`. It contains entrybasics/ribbonways tutorials and
a different Foundations/progression direction. Review against main before overlapping content;
do not restore wholesale, including its old migration edit. [BRANCH_INVENTORY.md](BRANCH_INVENTORY.md)
retains other branch provenance. No remote branch deletion is authorized.

Keep Foundations source feedback and design rationale listed in PRODUCT. A complete agreed
skill/prerequisite map, assistance/timing/reward/access/certificate rules, history treatment
and representative blueprints must precede the catalog rebuild.

## Continuity, validation and next decision

Wolf requires durable non-secret continuity on GitHub. Each area commits/pushes its branch
handoff, verifies remote commit/file identity, and returns its link to the chief. Local logs
and chat history are supplementary. If publication fails, state that the handoff is not saved.

The original `source/` checkout on this PC remains dirty and behind remote guidance; preserve
its files. Git/testing's September 17 fetch and noninteractive push dry run supersede earlier
failed-login instructions for that environment. Verify new environments individually. A remote
connector save does not synchronize a local checkout, and no reset/force-push is implied.

For code changes run `npm run check` and relevant isolated browser suites; report failures and
unrun checks. Browser suites own port 8791. Documentation-only changes use focused document/
reference validation under TASK_GUIDE's exception, not unnecessary application test reruns.
Do not call a static pass a playtest, a local subset full CI, or a report an implemented repair.

Next: the combined groundwork checkpoint 00df57a is accepted. Wolf has requested a
self-contained prompt to initiate the catalog/progression and learner-flow decision review
in another session. That next area may start evidence/design from 00df57a while reading the
latest foundation PRODUCT/CURRENT; this chief has not created a new task or begun its
implementation. Settle modes, ranked play, paths and deferred/changed rules before application
changes. The current prompt request does not authorize a catalog rebuild or new access rules.

Security's separate platform bootstrap is accepted; its isolated application replay/permission
baseline is still pending and remains outside 00df57a. It supplies evidence for security/release
readiness and must not be confused with the passing browser gate. Subsequent targeted cleanup,
site structure and the planned catalog rebuild retain the chosen sequence. Remaining security
blockers continue to constrain release readiness.

Launch acceptance remains pending for real account lifecycle, onboarding/learning, correct
catalog outcomes, saved progress across devices, subscription lifecycle, guest/owner/other-user
permissions, supported browsers/keyboards, hosting/recovery, business/legal/support and accurate
public claims. No replacement launch date is set.

Earlier detailed foundation chronology and the parked launch proposal remain preserved in the
[pre-groundwork status snapshot](https://github.com/rathunter69/Hotkey.gg/blob/ad3c7bb58e746e7b2711d44595734bd99f41d8de/docs/CURRENT.md).
Its completed/old recommendations are historical; this current file and PRODUCT govern active
scope. Update this file instead of creating competing LIVE queues in old documents.
