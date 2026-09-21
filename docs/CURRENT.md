# Current project state

Updated 2026-09-21. Chief coordinator: task `01a0b0fa-d857-7002-ab95-1da0a1cfb858`,
succeeding `01a0af30-bac0-7b73-9d9e-56f298996c1a`.
Repository: **rathunter69/Hotkey.gg**. Shared guidance: **codex/repository-foundation**.
[PRODUCT.md](PRODUCT.md) owns product decisions; [TASK_GUIDE.md](TASK_GUIDE.md) owns the working
method and area boundaries; [TASK_STARTERS.md](TASK_STARTERS.md) supplies the twelve starters.
This is the single current queue. Historical guidance does not authorize more work.

Wolf's latest communication instruction: **all Hotkey agents and sessions stay concise**.
AGENTS.md and TASK_GUIDE.md carry the rule for active, delegated and resumed work: outcome,
user impact and next decision in chat; detailed evidence in remote handoffs. The chief also
leads discussion of the project overview, overall design specification and platform-wide
experience. PRODUCT.md owns that evolving specification and distinguishes confirmed rules
from open choices; area tasks supply focused evidence and decisions.


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
until the relevant decisions and implementation are approved. The September 18 light readiness/subscription policy, optional lesson timer and assistance
categories are confirmed in PRODUCT. Wolf also approved one XP level, lesson progress, personal
drill-speedrun records and optional benchmark/Daily leaderboards, deferring new mastery and
overall competitive-rank systems. First visits start with a lesson before signup, followed by
personalization/save invitation and an experienced shortcut. A useful complete beginner path,
its repeat practice/personal speedruns and selected advanced previews are free; advanced
lessons/model-building require subscription. Exact curriculum/checkpoints, XP/repeat formulas,
retry/scoring/publication, paid boundaries, historical-rank presentation, certificates,
supported platforms and business facts remain open.

No main merge, deployment, production data changes, table removal, progress reset or broad
framework rewrite is authorized. Structural moves and security/gameplay changes must remain
separately reviewable. Do not restore retired tours, invite gates, membership tables or the
practice/ranked mode switch from historical instructions.

## Curriculum-planning workstream — overview updated September 20

Wolf requested a roadmap revising the chapter/74-drill structure: chapters/tracks/modules,
what each lesson teaches, learning objectives and Foundations coverage. The chief assigns this
planning batch to the existing **Audit catalog and learner flow** task, not a duplicate session.

Owned deliverable: `docs/handoffs/drill-catalog.md` on its existing `codex/catalog-flow-review`
branch. The systems handoff remains `catalog-progression.md`; shared CURRENT/PRODUCT stay here.
[Workstream brief and review gates](TASK_STARTERS.md#curriculum-roadmap-workstream--september-19):
canonical current catalog and Foundations-feedback baseline; proposed whole-platform skill/
chapter/track map; every current drill mapped to a reasoned keep/adapt/combine/split/retire-candidate
destination; detailed Foundations objectives and 3–4 representative lesson blueprints.
The [first draft at 71cc00e](https://github.com/rathunter69/Hotkey.gg/blob/71cc00e3b6fa71933a3871360a2d9d059a8ced61/docs/handoffs/drill-catalog.md) is now remote-verified: all 74 current IDs
appear once in the crosswalk, with feedback traceability, 14 provisional beginner objective
handles and four blueprints. Proposed ten chapters range from movement/editing/formatting/
calculation/lists through analysis/models/statements/valuation/funding; Foundations spans the
first five in this proposal. None of those names, counts, memberships or ordering is approved.

The owner's dated handoff confirms Wolf's corrections: fully redesign the catalog/chapter
structure around learning rather than reshuffling 74 guaranteed slots; write discrete goals
using actual visible element names, not vague outcomes or cell-reference checklists.
PRODUCT and persistent guidance record these requirements. Existing material remains provenance.
The chapter/lesson/track hierarchy, smaller Foundations chapters versus one, and project
placement are now the Catalog task's pending packet. No duplicate chief questionnaire.
Proposed retirements/mappings authorize no deletion, migration, reset or implementation.
Review this map and Foundations depth before expanding every lesson. Existing owners remain.
The [September 20 overview at 1ddd1b8](https://github.com/rathunter69/Hotkey.gg/blob/1ddd1b88a8ae4dcfe35314001816ff109a28435a/docs/handoffs/drill-catalog.md#september-20--curriculum-overview-and-future-content-modules) is verified. Wolf now confirms
support for future advanced/premium content modules. The ten chapters, hierarchy and project
packet remain unapproved. Versioned optional collections and subscription-included ordinary packs
are recommendations; no named pack, DLC price or release cadence is committed. Prior inventory
is reused, with unchanged 74-ID crosswalk and bounded independent expansion review.

The chief's existing independent reviewer checked ownership and planning boundaries: ground
inventory in canonical runtime sources, separate historical planning maps, preserve legitimate
routes/records, and label access/certificate/prerequisite/migration recommendations correctly.
No duplicate source audit or application tests were needed to define the workstream.

## Verified source and validation baseline

| Source | Verified state |
|---|---|
| Remote main | `434bc0e8764e741e0e11f84cf51d61a1755d7c67`, PR #250 merged September 5. Refreshed September 19; unchanged. The last observed main gate/Pages results belong to this old source, not the repair branches. |
| Shared guidance | `codex/repository-foundation`; read its current remote tip. Foundation introduced guidance/audits and development tooling, not a framework migration or application repair. |
| Accepted combined application/testing checkpoint | `codex/account-testing-integration`, remote handoff commit `6c984161c31bc4637dbe88b73a4da8408cefdf1d`; exact tested code `c702c6932b342cd36656317f7ce50f1c33b7df3e`. The final commit adds only its handoff document. Not merged into foundation/main or deployed. |
| Accepted earlier groundwork integration | `codex/groundwork-integration` at `00df57afd8d3299cc7feaf523847b9ca43e54d06`, executable checkpoint 328cae8. Account/browser/structure and Security preparation combined; preserved as the catalog review's valid starting point. Superseded for new implementation branches by 16ee830 below. |
| Accepted complete test-groundwork / next area baseline | `codex/groundwork-db-integration` at `16ee8306a8c170db9f8fe2e051b44b0519782ae1`, Security executable import 565c34b. Chief verified final remote handoff/tip, unchanged browser/runtime source, and exact Security executable/SQL/workflow equality with eaab864. Combined static7/guard11/plan pass; browser evidence green, reproducible database permission baseline correctly red. Start new implementation areas here and read latest foundation guidance separately. No main merge/deployment. |
| Earlier source ancestry | The three original area branches start from accepted integration 6c98416 and read later foundation guidance separately. The accepted platform-only experiment starts from Security feasibility 14d7e10; replay-baseline work starts from its handoff 3dd686d. These preserve that ancestry and remain outside the browser/structure integration. Preserve both accepted account/testing batches. |

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

## Current batch assignments and outcomes — September 17–21

The existing tasks own one bounded batch each; no duplicate tasks or automatic later batches.
All preserve original local work and earlier remote branches.

| Owner / task | Scope | Exclusive files / boundaries |
|---|---|---|
| **Establish testing and blockers**, `01a0af90-b973-7572-b7ff-d5bf9f504a52`; `codex/testing-security-groundwork` | Complete: full local matrix and exact Linux browser gate pass at 4ea428b; latest docs-only handoff 1f2fa57 accepted. Security replay safety reviews complete; its 44-pass/12-fail result remains separate. | Test/browser file reservations released. No further source batch assigned. Reuse successful exact-source evidence instead of repeating suites for docs-only changes. |
| **Begin account isolation fixes**, `01a0af8b-9a97-7593-a1d2-6d2491cfe947`; `codex/security-replay-baseline` | Baseline complete and accepted at 54640b0, exact tested source eaab864. Two fresh 52-migration replays and two complete 56-assertion suites: each 44 pass/12 identical DATA-01 failures, cleanup pass. Test infrastructure works; permissions remain unrepaired. | `supabase/tests/`, database-test docs/handoff and dedicated test workflows. Current batch complete; no DATA-01 repair assigned. Preserve failed-before evidence. No production/schema/runtime changes. |
| **Audit starter 3 cleanup candidates**, `01a0af90-7fb2-7571-a5d6-b82354d57540`; `codex/repository-structure` | Complete on its branch at cf8c61b: archived the historical PROJECT_CONTEXT record, kept a root compatibility page, repaired links and recorded the remaining structure plan. Chief verified preserved text and docs-only file manifest. Included in accepted combined checkpoint 00df57a; no main merge. | `README.md`, `docs/ARCHITECTURE.md`, selected historical documentation/archive paths and non-shared documentation links, `docs/handoffs/repository-structure.md`. No runtime, generated pages, migrations, test harness or workflow edits. |
| **Integrate account testing changes**, `01a0b0f9-09da-7a62-9dd2-dd9baeac388d`; `codex/groundwork-db-integration` | Complete and accepted at 16ee830: all accepted account/browser/structure/database-test groundwork and evidence coexist. Seven combined static checks, 11 guard tests and plan pass; exact executable equivalence preserves original browser and DB results without redundant full reruns. | Integration handoff `docs/handoffs/groundwork-db-integration.md`; reservations released. No permission repair, runtime/migration/package/gate/deploy change, main merge or production action. Latest shared guidance is read separately. |
| **Audit catalog and learner flow**, `01a0b148-2693-7901-af91-934c83cabe1d`; `codex/catalog-flow-review` | Latest overview 1ddd1b8 remote-verified. Prior 74-ID crosswalk/Foundations/four blueprints retained. Wolf adds future premium-content extensibility to confirmed learning-led/named-objective direction. Ten chapters, track/module hierarchy, Foundations subdivision and project placement remain proposals. | Owns `docs/handoffs/drill-catalog.md`; systems provenance stays in `catalog-progression.md`. Review existing structure packet before expanding lessons. Optional versioned packs/subscription inclusion and progress-edition design remain recommendations; no additional content workstream, runtime change or rebuild. |
| **Plan UI/UX onboarding flows**, `01a0b908-48f9-7f32-94b2-d0ca46f13de3`; `codex/experience-site-plan` from accepted 16ee830 | Latest handoff 23a0025 remote-verified. Native-style preview/popup retained; Wolf says direction is closer and likes file-style browsing, but questions mandatory keyboard site navigation. Picker already supports clicks and keys; pointer-plus-optional-shortcut presentation remains a recommendation. | Owns only `docs/handoffs/experience-site.md`. Element blocking/proportions unresolved; displayed artifact uncertain. Compare existing app/relevant preview at matching dimensions, then review focus/scroll and scoped compatibility. No whole-preview approval, new visual, app changes or new Engine task. |
| **Review saved progress contracts**, `01a0b908-9ee9-7d31-afb6-9733f5d421bf`; `codex/leaderboards-storage-review` from accepted 16ee830 | Latest handoff 26e71a0 remote-verified; three follow-up answers confirmed: qualifying guest solo work counts once after signup/confirmed transfer; Daily finishes before close with upload up to five minutes afterward; hide private attempts/withdraw public results while retaining history. Earlier comparability rule retained. | Owns only `docs/handoffs/leaderboards-storage.md`. All current questions answered. Next specify proof/qualification/dedup, save receipts, event/finalization and withdrawal details with existing owners. No automatic public import or per-attempt deletion selected; no application/schema/live changes. |
| **Plan payments access rules**, `01a0b969-ac99-7553-bc36-42868257ff55`; `codex/payments-plan` from foundation b2dad98 | First planning handoff 00de01d remote-verified. Confirmed P1/P2: a few complete free advanced samples; selected public challenges free; certificates follow content, earned records retained. Offer/lifecycle proposals and bounded source/review evidence saved. | Owns only `docs/handoffs/payments.md`. Price/trial/expiry packet pending; cancellation/refunds follow. Exact membership stays Catalog-owned. Docs branch is not implementation baseline; future code starts from accepted 16ee830 plus latest guidance. No billing/app changes. |
| Computer-transfer task `01a0c450-84e4-7a82-a9c1-48824dc4e5ff`; `codex/computer-transfer-2026-09-21` | Local transfer package complete; remote handoff 7664589 verified. Owner reports a successful real offline restore of all 15 work areas and 32 captured GitHub tips. Original workspaces unchanged. | Owns `docs/handoffs/computer-transfer.md` and the authorized local transfer deliverable. OneDrive sync/new-PC receipt unverified; native app state/sign-ins not migrated. Snapshot carries implementation 16ee830 and guidance e1719a7 separately; later guidance requires refresh. No app work/deployment. |
| Chief coordinator, this task | Project overview and platform-wide design discussion, priorities, product decisions, GitHub/security/structure review and handoff reconciliation. | `docs/CURRENT.md`, `docs/PRODUCT.md`, `docs/handoffs/chief-groundwork.md`. Other tasks send proposed corrections instead of editing these. |

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
host installation. The subsequent application replay/permission results are accepted below.

Browser tests must block production traffic, including redirects, and use synthetic fixtures.
Before any database replay, establish outbound denial and disabled scheduling; the migration
chain contains a production digest callback. Missing infrastructure never permits using
production. Test-only CI may run only after reviewing triggers, permissions and side effects;
do not merge main or invoke deployment to make a workflow dispatchable.

Security's isolated test groundwork is complete at remote handoff
[54640b0](https://github.com/rathunter69/Hotkey.gg/blob/54640b07554882dcd3322d84f2bba398fadc94c0/docs/handoffs/security-accounts.md).
Exact reviewed/tested executable source is eaab8645cf8aaee6e62120f65d24ebd911a047ad.
[Run 35277724943](https://github.com/rathunter69/Hotkey.gg/actions/runs/35277724943) correctly
finished **failure**: two fresh genuine platforms each replayed all 52 unchanged application
migrations and completed all 56 assertions, with **44 pass / 12 identical DATA-01 failures**.
Cleanup passed on both. The chief independently verified remote head, docs/evidence-only final
commit, run/job conclusion, complete identical assertion streams and unchanged migration
hashes. [Durable sanitized JSON](https://github.com/rathunter69/Hotkey.gg/blob/54640b07554882dcd3322d84f2bba398fadc94c0/supabase/tests/evidence/replay-baseline-35277724943.json)
preserves the evidence beyond temporary CI artifacts.

The failures are assertions 10, 11, 15, 16, 17, 22, 23, 35, 36, 46, 48 and 56: direct desk
creation bypasses full-account/PRO checks; direct membership permits self-captain/backdated
seniority; owners/creators can assign verification/school fields; direct applications bypass
full-account, private/closed and five-pending rules. All 24 failed probes across both instances
actually affected one row before rollback. No unexpected control, setup or fixture error
remains. This establishes a reproducible failing source baseline, not repaired permissions,
production parity, real Auth journeys or release readiness.

Provenance remains pinned: official platform-only source 49b8193 / handoff 3dd686d first passed
[35275149357](https://github.com/rathunter69/Hotkey.gg/actions/runs/35275149357); it executed no
Hotkey migrations. The first application run at 18babfa / handoff 9ea05e6 replayed all 52 files
once but stopped after 12 partial assertions at an intentionally forbidden internal helper.
The narrow eaab864 correction changed only two fixture entitlement reads to supported
`my_pro_status().pro` and its exact workflow trigger path. Independent fixture/Testing review
cleared it before the final run. Application functions/grants, migrations, expected assertions,
image pair and execution boundaries stayed unchanged. Earlier partial evidence is preserved.

Execution controls remain mandatory in future tests: synthetic data, fixed official images,
outbound denial, no ports or host/persistent mounts, temporary memory-backed database,
scheduling disabled from first startup, genuine platform ACLs, exact-source validation,
minimal read-only workflow permissions, complete-stream failure detection and purpose-labelled
cleanup. No production fallback, history edit, skipped migration or suppressed failure is allowed.
The 77 official platform/Auth migrations are distinct from the 52 application files.

The next recommended Security batch is a separately scoped DATA-01 forward repair preserving
the 44 passing controls and failing-before evidence. It has **not** been assigned. DATA-02
privacy and DATA-03 MFA remain separate. The final integration at 16ee830 now consolidates this accepted test infrastructure and
evidence with 00df57a. Source equivalence and combined static/guard/plan checks are verified;
no application repair is included.

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
| Official test-platform feasibility | [14d7e10](https://github.com/rathunter69/Hotkey.gg/blob/14d7e10a79232000ff24d2637ce6adc72b786b1f/docs/handoffs/security-accounts.md) | Pinned official database/Auth image manifests and source SHAs; standalone platform gaps traced. Documentation-only delta over 2a4a5f5, executable code remains ce53324. No bootstrap/replay/SQL result at that historical checkpoint; later results are listed below. |
| Application replay / earlier incomplete baseline | [9ea05e6](https://github.com/rathunter69/Hotkey.gg/blob/9ea05e64edbe66d075b2fda6e7b313a2f198ae72/docs/handoffs/security-accounts.md) | Exact source 18babfa/run 35276711544: all 52 migrations passed once, then fixture aborted after 12 partial results (10 ok, 2 not ok). No complete 56-result stream or second instance; cleanup passed. Accepted earlier failure evidence, not security clearance; superseded for baseline completeness by 54640b0. |
| Reproducible permission baseline | [54640b0](https://github.com/rathunter69/Hotkey.gg/blob/54640b07554882dcd3322d84f2bba398fadc94c0/docs/handoffs/security-accounts.md) | Exact eaab864/run 35277724943: two fresh complete 52-migration/56-assertion runs, identical 44 pass/12 permission failures, both cleanups pass. Durable JSON and source/provenance verified. Baseline accepted; permissions unrepaired. |
| Catalog/flow decision review | [7193044](https://github.com/rathunter69/Hotkey.gg/blob/7193044d41b348d3f31df4d3f4ff53457a8b39a8/docs/handoffs/catalog-progression.md) | Chief verified file identity and 68-line sole-handoff addition from c08b53b. Prior decisions/UI review retained. Catalog records approved usable-grid implications with no new product choice or conflict: blank space is not assigned work; lesson outlines distinguish working region, usable extent, navigation and graded outcome. Scoped Engine/UI/history dependencies remain before implementation; no repeated source audit/tests. |
| Curriculum roadmap and expansion overview | [1ddd1b8](https://github.com/rathunter69/Hotkey.gg/blob/1ddd1b88a8ae4dcfe35314001816ff109a28435a/docs/handoffs/drill-catalog.md#september-20--curriculum-overview-and-future-content-modules) | Chief verified file/blob and current Catalog branch tip; sole-handoff update from 71cc00e. Initial 74-ID inventory/four blueprints retained; area reports unchanged crosswalk and focused independent expansion review. Extensibility is confirmed, while chapters, candidate packs, inclusion/pricing and version-display rules remain proposed. No repeated audit, application tests or implementation. |
| UI/UX planning | [23a0025](https://github.com/rathunter69/Hotkey.gg/blob/23a00252538b6029d32f249360a7c56b3574db1d/docs/handoffs/experience-site.md) | Chief verified file identity and sole-handoff update from 731ee79; directly read Wolf's feedback. File-style preference retained; optional site-shortcut recommendation is separate from worksheet scoring. Narrow picker source read records existing click/key support. LeetCode is a flow analogy, not selected styling. Blocking remains unexplained; no new app tests or whole-preview approval. |
| Saved-progress planning | [26e71a0](https://github.com/rathunter69/Hotkey.gg/blob/26e71a0f741de3a3e23f8653314a3b2e7f5cf46e/docs/handoffs/leaderboards-storage.md) | Chief verified file/blob and sole-handoff answer update; read all three actual user selections. Guest qualification and dedup remain design dependencies, not blanket imported-score trust; Daily five minutes starts at closing and grants no extra play; hide/withdraw preserves facts. Bounded consistency review completed; no new app/permission tests or Security clearance. |
| Payments/subscription planning | [00de01d](https://github.com/rathunter69/Hotkey.gg/blob/00de01d76c4fb359e25e62c62be4ef406a368760/docs/handoffs/payments.md) | Chief verified remote file/blob and sole added handoff from foundation b2dad98. P1/P2 already reconciled; no later commercial answers. Catalog boundary review and independent document review recorded. Source review at 16ee830 confirms test-only/incomplete checkout, conflicting access flags/prices and school/desk entitlement reconciliation needs; no live audit, app/payment tests or activation. |
| Complete test-groundwork integration | [16ee830](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/docs/handoffs/groundwork-db-integration.md) | Final remote source/handoff verified. Only docs, accepted DB test files and two dedicated test workflows differ from 00df57a; all 10 Security executable/SQL/workflow blobs match eaab864. Browser/runtime unchanged. Static7/guard11/plan pass; browser green and DB reproducible 44/12-fail evidence reused explicitly by equivalence. Latest accepted baseline, no repair/merge/deploy. |
| Earlier combined groundwork integration | [00df57a](https://github.com/rathunter69/Hotkey.gg/blob/00df57afd8d3299cc7feaf523847b9ca43e54d06/docs/handoffs/groundwork-integration.md) | Remote tip/handoff verified; browser/runtime tree equals fully tested 4ea428b, Security test blobs equal accepted 14d7e10. Combined static7/runner3/replay-plan and independent review pass. Includes cleanup and latest modes/flow guidance through 45edd. Excludes separate platform/replay experiments. Accepted future area baseline; no main merge or deployment. |
| Full testing groundwork | [1f2fa57](https://github.com/rathunter69/Hotkey.gg/blob/1f2fa577f94911b05ecc50d8b25b7a2a9d16c6f2/docs/handoffs/git-testing-releases.md) | Latest documentation-only summary; accepted 00df57a contains earlier handoff 31af74b. Exact test-tooling source 4ea428b on preserved application c702c69: full local matrix and Linux run 35274460688 pass; chief verified source/run/job and docs-only final delta. Covers active gate isolation and generator drift, not live accounts, DB permissions or launch acceptance. |
| Isolated platform bootstrap | [3dd686d](https://github.com/rathunter69/Hotkey.gg/blob/3dd686d26edcb53325579fbe479eb01bdf41f773/docs/handoffs/security-accounts.md) | Exact reviewed source 49b8193 passed Linux run 35275149357 on first attempt; durable sanitized JSON committed. Genuine empty platform, Auth helpers/ACLs, extensions, isolation and cleanup verified. Zero Hotkey migrations or permission assertions; not a DATA-01/02/03 repair. |
| Repository structure cleanup | [cf8c61b](https://github.com/rathunter69/Hotkey.gg/blob/cf8c61bc1a6922325ac63f9d6449795e40484847/docs/handoffs/repository-structure.md) | Historical record moved to docs/history with compatibility page and repaired references. Chief fetched old/new content: same 1,145 lines, only the two Markdown targets on one line changed. No runtime/test/workflow/schema edits; documentation checks passed. |
| Computer transfer | [7664589](https://github.com/rathunter69/Hotkey.gg/blob/76645891852232317b6645168d287a8d0869a1da/docs/handoffs/computer-transfer.md) | Chief verified remote handoff/blob and sole added doc from e1719a7. Transfer owner reports ZIP hash/integrity and real offline restore: 15 work-area states, 6,746 snapshots and 32 GitHub tips matched. This is package/restore evidence, not cloud-sync or new-device receipt evidence. No application test rerun or whole-PC/app-state migration. |
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
| DATA-01 desk write/role bypasses | Security: 12 unauthorized direct-write boundaries now reproduced twice; 44 other controls pass. Next proposed batch is a forward repair with failing-before/passing-after proof and preserved legitimate routes. Not assigned. |
| DATA-02 public profile metadata | Security: database-enforced public/private fields and hidden-school tests, preserving owner access. |
| DATA-03 incomplete MFA | Security: opted-in login/challenge/recovery/protected-action tests. Enrollment success alone is insufficient. |
| DATA-04/06/07 history/rankings, duplicate saves and result trust | Saved-progress with Security: explicit persistence/competition contract, capped/failed reads, idempotent retries, direct-write constraints. No historical progress reset. |
| Engine formulas and graders | Engine owner: explicit expected spreadsheet outcomes, live-model grading and legitimate alternative-route regression evidence. Existing demo success does not close these defects. |
| False save/error messages and beginner flow | UI/persistence owners: truthful feedback, one understandable learning journey; preserve ribbon/workspace. |
| Release protections | GitHub freshly reports unprotected main, no required contexts and no rulesets. Testing proposes required checks/review after check names/results are established; no live rule changed. |
| Database delivery | Earlier run [33814362058](https://github.com/rathunter69/Hotkey.gg/actions/runs/33814362058) failed linking; later source still uses floating CLI and independent live deployment. No new deployment attempted. |
| Isolation, history and schema parity | 52 source migration versions occur in 61 live records, including nine extras. Prior 54 function bodies match except one comment; both deployed function sources matched. Those stamp/body comparisons are not whole-schema/grant/configuration parity. Two fresh isolated source replays now pass at eaab864; the nine extra live records remain unreconciled. |
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

September 21 transfer checkpoint: [computer-transfer handoff](https://github.com/rathunter69/Hotkey.gg/blob/76645891852232317b6645168d287a8d0869a1da/docs/handoffs/computer-transfer.md).
`Hotkey.gg-transfer-2026-09-21.zip` is a 288,495,853-byte local archive in the Hotkey.gg OneDrive
folder. The pinned handoff records its checksum, contents and verified offline restore. It includes
the Git bundle, all 15 work-area snapshots/dirty state, task exports and nine saved UI previews.
Private exports/archive stay off GitHub; the non-secret handoff is durable. Cloud sync and receipt
on the new PC remain unverified, and native app state, sign-ins and dependencies are not migrated.
The snapshot restores accepted application 16ee830 separately from shared guidance e1719a7.
It is a point-in-time package; read/fetch the latest remote CURRENT/PRODUCT and area handoffs before
resuming, including guidance added after this archive. No deployment or implementation follows.

The original `source/` checkout on this PC remains dirty and behind remote guidance; preserve
its files. Git/testing's September 17 fetch and noninteractive push dry run supersede earlier
failed-login instructions for that environment. Verify new environments individually. A remote
connector save does not synchronize a local checkout, and no reset/force-push is implied.

For code changes run `npm run check` and relevant isolated browser suites; report failures and
unrun checks. Browser suites own port 8791. Documentation-only changes use focused document/
reference validation under TASK_GUIDE's exception, not unnecessary application test reruns.
Do not call a static pass a playtest, a local subset full CI, or a report an implemented repair.

The testing/security-groundwork and first structure cleanup are now consolidated and accepted
at 16ee830. Browser verification is green; the database test suite reliably reproduces 12
permission defects. Completion of test infrastructure is not completion of those repairs.
Main remains 434bc0e; no merge, deployment or live policy change.

Current product discussion: learning is the main journey, with prominent optional speed/
competition. September 18 approved advanced subscription access plus short readiness checks
at major skill jumps, credit for prior independent work/test-out, helped ordinary progression,
and correctness rather than speed/XP for readiness. Ordinary lesson clocks are optional and
hidden by default; deliberate speed attempts show time. Instructions/explanations are
unpenalized; solution-step reveals, Guided help or solution replay mean assisted progress
with no XP. PRODUCT contains dated provenance, superseded rules and acceptance examples.

Public competition now has an approved focus: selected standardized benchmarks and Daily
events alongside personal bests, preserving existing scores/earned history. This does not
approve deleting old boards or adopting any proposed overall rank. Wolf explicitly requests
continued high-level mechanics options, short tradeoffs and recommendations.

Wolf subsequently supported fresh independent retries and deliberate public entry in principle,
conditional on retaining key user metrics and individual-drill speedrunning. Personal speedruns
extend beyond the public benchmark/Daily set; unpublished attempts must not lose useful personal
records. Preserve existing PBs, results and earned history. Exact metric sets, comparison groups,
persistence/visibility and UI controls remain to be agreed.

The review showed illustrative learning-progress, private drill-speedrun and public-challenge
records; they are not actual user statistics or an approved exact metric set. Wolf then questioned
the complexity and explicitly approved the simpler structure on September 18: **one XP level,
helped/independent lesson progress, personal drill-speedrun records and optional selected
benchmark/Daily leaderboards**. A new mastery system and a new overall competitive rank are
deferred. The D6a/D6b/D7a questionnaire is retired; the earlier capped-repeat XP recommendation
was not approved. Preserve existing earned XP, awards, personal results and rank history;
no deletion, freezing or recalculation of current rank is authorized.

Wolf subsequently approved **lesson-first entry**: a short hands-on lesson without an account,
then personalization and invitation to save, with an experienced-user shortcut. He also approved
a **complete useful free beginner path**, its repeat practice/personal speedruns and a few
advanced previews, with advanced lessons/model-building in the subscription. Free replay
applies to included free content, not every advanced drill. Exact content/preview rules, prices,
onboarding questions, guest transfer/save contract, advanced speedrun access, competition/
credential access and subscription expiry remain open.

Wolf explicitly brought **account-retained statistics and tracking records** forward. He
approved every finished attempt, including helped lessons/private speedruns, plus lightweight
summaries of deliberate restarts/ended-unfinished attempts; private detailed history with
selected public highlights and separate eligible public challenge results; active practice
time/days with optional streaks that never gate lessons or remove progress. The candidate
record/metric dictionary, exact formulas/day/idle/interruption/retention/replay rules and
legacy migration are not blanket-approved. The handoff's source inventory distinguishes
authored optimal/actual-key ratio from correctness, posted-run duration from all practice
time, and device/saved/derived records; no new app test or security audit is claimed.

Wolf's next reply confirmed **time, personal bests, improvement history and keystroke count**;
meaningful active practice, including helped/unfinished work, qualifies for practice days.
The threshold and measurement/day rules remain open. Helped results offer Continue plus a
friendly unassisted-retry option: **Try solo** is working copy, not final wording or approval
of primary-button emphasis. The existing speedrun option remains. Keep no-assisted-XP,
readiness/access rules and truthful account/device/pending/error save statements.

Wolf subsequently approved a clearly labelled **estimated time saved on this task**, with the
mouse reference explained and any accumulated estimate limited to completed Hotkey tasks.
No reference/formula/numerical claim is established; existing time banked remains personal
first-to-best improvement. Usage stats cover completed shortcuts/commands only, with actual
key presses retained separately: Alt → E → S → T illustrates four presses and one command.
Physical-key rankings and automatic least-used practice suggestions are not selected.

He also approved the mouse boundary and XP rule: spreadsheet sheet/ribbon/dialog mouse use
retains learning progress but earns **no XP or qualifying competitive/timed record**, including
timed PBs. Ordinary Start/Retry page controls do not disqualify by themselves. Solution help,
input eligibility and history retention remain separate. Preserve existing earned XP/history;
detection/counting/accessibility, calibration and historical equivalence remain open.

**September 19 approvals:** Try solo is a fresh attempt judged on its own help/input record,
without penalty from earlier guided learning; remaining XP/time/comparison rules apply. Signup
offers shown/confirmed private carry-over of device guest history, excluding other accounts.
Goal appears before Start; worksheet reveal starts the continuous scored clock, while ordinary
learning is freely pausable. Public benchmarks/Daily allow unlimited attempts and count the best
eligible time. Exact seeds, event handling, import/conflict/eligibility and historical comparison
remain open; old first-action-clock records must not silently become reveal-clock equivalents.

Keep Rapid-fire as optional quick practice, not a path/prerequisite. Friend sharing reuses the
same benchmark/Daily and rules, without a separate race mode; individual-drill races were not
selected. One Help entry combines levels of support, retains visible instructions and explains
assistance consequences. Wolf explicitly wants fewer modes/settings/visible choices because
the ribbon/workspace already looks complicated. Preserve the visual foundation and useful access.

**All six choices and both follow-up refinements are answered** at c52d067. Windows is primary,
with a quick suggested/changeable Windows/Mac setup before the guest exercise; broader
personalization/save invitation remains afterward. Instructions follow the selected setup,
but verified compatibility/parity is not established. Most XP goes to new eligible accomplishments,
with smaller limited repeats and no speed multiplier. Focused lessons lead to practical tasks
and larger models. Certificates recognise selected-set completion, including helped and
spreadsheet-mouse work, superseding the solo-assessment recommendation; XP/readiness/time rules
remain separate. Keep issued credentials and earned history. Desks remain separate and optional
for enterprise/training providers; WSP/Training the Street are audience examples, not partners.
Free everyday navigation/editing/formatting/basic formulas teach ribbon/Excel functionality
with useful breadth; advanced learning/models remain paid. Exact curriculum, verified platform
scope, amounts/caps, certificate sets/access, Desks capabilities and calibrated savings remain open.

**Feel and recovery choices are now answered:** small success feedback for each meaningful
completed spreadsheet action, with a bigger task finish; soft brief success sounds after the
learner starts, an obvious remembered mute and quiet ordinary typing; playful, polished and
encouraging tone around the retained workspace, with identity/achievement pixel art. Ordinary
learning uses calm undo/another-try recovery, without lives, XP deductions or forced restart.
Valid routes/exploration remain welcome; final correctness and Help/input/XP/time rules hold.
After helped ordinary lessons, Continue is primary and Try solo clearly alongside. This does
not choose every timed-event result action, final copy or exact visual/audio asset, and it
does not award per-action XP or claim a physiological effect.

**All presented questions through 15de791 are answered.** Everyday Excel foundations come first,
with finance/modeling depth later. Two skippable/changeable post-lesson experience/goal questions
recommend from the shared catalog. Returning home leads with Continue and easy catalog access.
Ordinary results prioritise completion/next action, compact actual XP/certificate progress and
expandable statistics; speedruns prioritise time/PBs. Certificates cover substantial named
skill sets under the inclusive completion rule. Achievements include meaningful milestones and
smaller/cheekier accomplishments; main milestones are visible, some playful ones hidden until
earned. Recognition/occasional identity unlocks award **no bonus XP**. Preserve prior earnings/items.

Exact content/award lists, triggers, access, question wording, recommendation mapping, saving
and historical rule mappings remain open. The bounded source check distinguishes Tourist's
PB-bearing-drill condition from its wording and a.hidden's celebration suppression from future
secret discovery. Next review concrete learner states and precise contracts without repeating
answered questions. Coordinate existing owners without starting new workstreams. The proposed default-learning/contextual Solo-Speedrun/secondary
practice-challenges/quieter-settings hierarchy remains design guidance, not layout approval. The keep/combine/simplify/leave-out map remains a proposal beyond
the explicit decisions above. No code/data/feature deletion or new module is authorized.
Marathon remains without an ordinary entry in the reviewed source; dormant session/runtime
support is not evidence of an active menu. Preserve actual runs and earned/high-water recognition
rather than inventing standalone placement-history data. Other legacy, metric, saving and
migration mechanics still need agreement.
The area's proposed remaining decision sequence covers learning paths, records/rewards,
competition fairness, launch scope (Rapid-fire/achievements/certificates), then the complete
catalog blueprint and progress-preserving transition. This is a planning sequence, not new
workstream assignments. XP/repeat formulas, comparison/persistence, checkpoint details,
competition rules and historical-rank presentation remain open. The chief reconciles answers
without duplicating questions; retain the dated PRODUCT approvals, including September 19
solo/guest/timing/retry/practice/sharing/Help and simplicity decisions. No implementation is authorized;
existing progress and Foundations feedback remain protected.

September 19 chief recommendation, following Wolf's request for the original twelve areas and
next 2–3 clarification prompts: refine **Area 5 UI/UX/onboarding/web structure**, **Area 7
leaderboards/saved progress**, then **Area 10 payments/subscriptions**. UI applies agreed policies
to screens/navigation; Saved-progress defines records, transfers, failures and comparisons;
Payments defines the paid offer and access lifecycle. Reuse the existing catalog review rather
than reopening its decisions. Catalog retains content/path meaning; Security retains permission
repairs; Desks retains enterprise workflows. Planning prompts are saved in
[TASK_STARTERS.md](TASK_STARTERS.md#planning-follow-ups--september-19). Wolf has now started
Area 5 in **Plan UI/UX onboarding flows** (`01a0b908-48f9-7f32-94b2-d0ca46f13de3`).
Wolf also started Area 7 in **Review saved progress contracts**
(`01a0b908-9ee9-7d31-afb6-9733f5d421bf`), owning only its leaderboards-storage handoff.
Area 10 is now started in **Plan payments access rules**
(`01a0b969-ac99-7553-bc36-42868257ff55`); its user starter and initial answers were read by the
chief. Its first planning handoff is now verified at 00de01d; price/trial/expiry questions remain
pending in that task. The foundation-derived docs branch is not a replacement implementation baseline. UI/Catalog/storage have exchanged their boundaries
and confirmed-rule references; Catalog records the coordination at 194db93. UI owns screens
and truthful copy, storage owns persistence/comparison proposals, and Catalog retains state/
eligibility/content meaning. No task may invent another owner's save guarantees or change
confirmed rules. Initial UI and Storage planning handoffs are now remote-verified at 6580e83
and e9f3e6e. Independent reviews and bounded cross-area consistency checks are recorded; this
completes those planning batches, not approval of every proposal or implementation.

The chief directly verified Area 7's first two user choices: separate PB groups until task,
timing and Excel-setup comparability is proven; privately retain disconnected public results
with submission pending, allowing a short published grace period subject to eligibility.
PRODUCT records those principles and the later 26e71a0 answers: qualifying guest solo credit
once after confirmed transfer; Daily finish before closing/upload within five minutes afterward;
hide private attempts/withdraw public results while preserving history. Daily duration is settled;
proof/dedup, exact event/finalization, benchmark lifetime, withdrawal scope and legacy equivalence
remain open. The chief directly verified six UI choices and recorded them in
PRODUCT: side-panel Help, small Challenges link, short outcome guidance with expandable checklist,
the earlier side-panel results choice, secondary guest save invitation/Home reminder and
one Lesson options menu with Help/mute visible. Later mockup feedback supersedes result placement:
Wolf prefers the older completion overlay. Help/guidance stay beside the worksheet. The path/chapter
next-step suggestion remains tentative and Catalog-owned; preserve the current aesthetic.

UI's 965bdb9 grid review recovers source-attributed 20-row visual/stable-frame preferences without
reinstating old lesson-density quotas. It reports ten columns, at least 20 visible rows, some
14-row usable boundaries plus inert fillers, adaptive dimensions and limited small-window fit.
One isolated diagnostic measured three drills at four sizes; accepted grid/resize passes were
reused, not rerun. This is not blanket usability or implemented worksheet-scrolling evidence.
Wolf has since approved both grid recommendations at 511fd1f: all visible rows usable in the
standard 20×10 workspace; readable adaptive dimensions, optional fullscreen and worksheet
scrolling when needed, using the existing right-hand area. Later feedback moves completion back
toward the familiar overlay while retaining Help/guidance there. Both grid questions
are answered; do not repeat them. Learning-first rationale changes no reward/assistance/timing
rules and imposes no lesson-density quota or future-model cap.
Before separately authorized implementation, chief routes a bounded Catalog/Engine review of
navigation, row operations, grading, tutorial targets and history compatibility. Catalog has
been notified; no separate active Engine task exists and no new audit/module is dispatched here.
Exact dimensions, focus/scroll mechanics and supported-device thresholds remain design work.
UI's [079bd2f mockup record](https://github.com/rathunter69/Hotkey.gg/blob/079bd2f426a12b4f0a0f1a0e3c83b53cdcfb972c/docs/handoffs/experience-site.md#september-19-illustrative-layout-mockup)
preserves the earlier isolated preview and its checks, but Wolf subsequently rejected its generic
restyling. The chief read his actual feedback: retain built-in color themes, existing buttons,
helpful ribbon controls/key hints, selected-cell outline/green handle and general look.
The revised [731ee79 preservation handoff](https://github.com/rathunter69/Hotkey.gg/blob/731ee791683c603ba4e788c242dcb6834f4f7db3/docs/handoffs/experience-site.md#september-19-preserve-the-existing-visual-system-and-completion-popup)
now documents native markup/style reuse, the familiar completion popup and the coupled-file
source review. All 27 themes remain built in; Daylight is the fresh default, with valid saved
selection preserved. Native buttons/keycaps/nav/ribbon, unified frame and green handle remain.
Wolf's explicit coupled-file read/preservation instruction is carried into AGENTS and PRODUCT.
A focused reviewer corrected the result button family; limited theme-token/state/narrow-frame
preview checks used fallback fonts and blocked external traffic. Revised sample content, exact
layout and focus contract remain illustrative, not approved production behavior or phone support.
No application tests were rerun and no new audit/Engine task is dispatched.
The later [23a0025 feedback record](https://github.com/rathunter69/Hotkey.gg/blob/23a00252538b6029d32f249360a7c56b3574db1d/docs/handoffs/experience-site.md#september-19-file-style-browsing-and-learning-workspace-comparison)
preserves Wolf's file-style picker preference and concern about keyboard-only site navigation.
Existing click/key support was source-checked by UI. Clear pointer access/optional shortcuts and
simple Continue are recommendations; Catalog retains hierarchy and learning/input rules stay fixed.
The revised direction feels closer to Wolf's concept, but layout blocking is unresolved. Preview
identity/display sizing is uncertain; compare matching dimensions before attributing a cause.
LeetCode is an explanatory learning-flow analogy, not a new visual direction or product approval.
Catalog's [7193044 implications review](https://github.com/rathunter69/Hotkey.gg/blob/7193044d41b348d3f31df4d3f4ff53457a8b39a8/docs/handoffs/catalog-progression.md#september-19-usable-worksheet-space--implications-for-future-lesson-outlines)
found no product-rule conflict. Future lesson outlines distinguish working region, usable extent,
navigation and graded outcome, without density quotas or a blanket 20-row model cap. Boundary/
row-data changes, tutorial/grade targets, display-independent width grading, keyboard scrolling/
focus and material timed-comparison effects require the scoped review above. Pointer-scrolling
classification is not silently decided here; no new scoring exemption or penalty is inferred.
Storage's guest-credit, Daily grace and record-control questions are answered at 26e71a0.
Next specify reliable qualification/ownership/dedup evidence, save receipts and withdrawal/
event details, not another mandatory-repeat-versus-credit choice. Guest device-only history
becomes cross-device account history only after confirmed transfer/save. Curriculum mapping
must distinguish known completion from qualified solo evidence and certificate equivalence.
Security review of guest proof/public permissions remains outstanding.
The new curriculum roadmap assignment above keeps the skill map and blueprints with the existing
Catalog/learning owner. Planning scopes remain separate from implementation; the full agreed plan
still precedes rebuilding.

Recommended parallel work in response to Wolf's question: a focused DATA-01 desk-permission
repair using the existing 12 failing cases and preserving the 44 passing controls. Reuse the
completed security audit rather than restarting it. This is a recommendation, **not yet a new
repair assignment**. UI/UX can use existing experience evidence and the approved learning/gate/help/timer/competition
scope to plan the journey. Retry/public-entry controls, exact access boundaries and scoring
still need decisions before dependent implementation. Area 5's first planning batch is complete;
its follow-up remains within the existing task, with UI implementation paused. Later targeted cleanup, site
structure and the planned catalog rebuild retain the chosen order.

Launch acceptance remains pending for real account lifecycle, onboarding/learning, correct
catalog outcomes, saved progress across devices, subscription lifecycle, guest/owner/other-user
permissions, supported browsers/keyboards, hosting/recovery, business/legal/support and accurate
public claims. No replacement launch date is set.

Earlier detailed foundation chronology and the parked launch proposal remain preserved in the
[pre-groundwork status snapshot](https://github.com/rathunter69/Hotkey.gg/blob/ad3c7bb58e746e7b2711d44595734bd99f41d8de/docs/CURRENT.md).
Its completed/old recommendations are historical; this current file and PRODUCT govern active
scope. Update this file instead of creating competing LIVE queues in old documents.
