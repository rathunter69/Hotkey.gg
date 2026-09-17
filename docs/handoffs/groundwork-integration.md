# Groundwork integration

Updated: 2026-09-17
Task: `01a0b0f9-09da-7a62-9dd2-dd9baeac388d`
Branch: `codex/groundwork-integration`
Starting commit: `6c984161c31bc4637dbe88b73a4da8408cefdf1d`
Integrated executable checkpoint: `328cae8fa7a5fba3e71690e0c556f8704506b304`
State: combined source locally and Linux-gate verified; branch checkpoint for chief review, not merged or deployed.

## Scope and outcome

Wolf authorized this bounded integration of the accepted account/testing baseline, repository
structure cleanup, Security test preparation and Testing's complete browser-gate isolation.
The original dirty source checkout and all source branches remain preserved. No later product
module, database repair, live setting or production action is included.

Imported provenance:

- accepted account/testing integration `6c984161c31bc4637dbe88b73a4da8408cefdf1d`;
- repository structure `cf8c61bc1a6922325ac63f9d6449795e40484847`, imported as `94ad9ff`;
- Security preparation `ce53324df2dba934b4acb495bf28e74f35de9bd3`, evidence commits
  `aa7d79860b4404e810a5e6e4e353699cc01141c5` and
  `2a4a5f544e968850cdfd27557108de13c3ffcec2`, imported as `b73e08a` through `1bd30c2`;
- accepted Security feasibility documentation `14d7e10a79232000ff24d2637ce6adc72b786b1f`,
  imported as `5952ad6`;
- Testing executable checkpoint `4ea428ba1504ee04b3d01943df5f7cd1b68a2c4d`,
  imported as `328cae8`, and final docs-only result `31af74b23a3ba65c9adb94254626e88632dabe0c`,
  imported as `b497497`;
- chief-owned CURRENT, PRODUCT, TASK_STARTERS and chief-groundwork history reconciled through
  remote foundation `45edd72545c8b4d3793dc116a8be204bb8c3e463`. Those documents are copied
  through their exact commits; this task made no product or roadmap decision.

The structure change archives the 1,145-line historical `PROJECT_CONTEXT.md` under
`docs/history/`, changes only its two relative link targets, and retains the root compatibility
page. The Security batch adds a guarded disposable-container runner, 56 synthetic SQL assertions,
and documentation; it changes no runtime, migration or workflow. Testing routes every active gate
browser context and both generator pages through the shared redirect-safe local-origin boundary,
adds direct redirect/WebSocket/inactive-service-worker canaries, pins read-only GitHub Actions,
and adds a branch-only reusable-gate caller. It changes no application behavior or generated output.

The separate Security platform-bootstrap and replay-baseline experiments are intentionally
excluded. Their branches, workflow files and executable sources were not imported.

## Verification

All 22 non-handoff Testing files from exact executable source `4ea428b` are byte-for-byte
identical on this branch at `328cae8`; the Testing handoff matches final docs commit `31af74b`.
Security executable/test files match the accepted Security source commits. Subsequent commits
are handoff or chief-owned guidance only.

| Check | Result and limit |
|---|---|
| Complete pinned local browser matrix | Passed on `4ea428b` with Node 22.23.2, npm 10.9.8, Playwright 1.49.1 and matching Chromium 131 headless shell build 1148. Exact `npm ci` passed. |
| Static and smoke | All seven static commands and the seven-command smoke suite passed, including the strengthened isolation canary and all 14 account-isolation scenarios. Existing 39 catalog warnings remain warnings. |
| Full browser suites | Visual 406, deep-link 18, parity 189, onboarding 86, alternate paths 159, Mac input 30, rapid-fire 14, guided 77, formulas 102, depth-contract 74, depth-mechanics 169 and resize 34 passed. All-drill replay, grid-height, border, pause and start-gate suites passed. |
| Generated output | Generator produced 74 drill pages plus library, sitemap and refmap with no tracked content diff. Integration has no runtime page, asset, generated-page or sitemap diff from Testing's source. |
| Exact Linux gate | GitHub run [35274460688](https://github.com/rathunter69/Hotkey.gg/actions/runs/35274460688), job `105381549779`, passed all gate stages and all 35 recorded job steps on `4ea428b`, including generator drift. |
| Combined branch static check | `node dev/run-checks.js static`, `GATE_BASE=6c98416`, passed all seven commands on Node 22 after all executable imports. |
| Security runner units | `node --test supabase/tests/runner.test.js` passed all three tests on the combined tree. These test the runner's fail-closed behavior, not database permissions. |
| Security replay plan | `node supabase/tests/run-isolated.js --plan` completed and recorded 52 migration inputs plus one SQL suite. It did not start or contact a database. |
| Independent integration review | Confirmed the Testing executable/development files and Security executable files match their accepted source blobs; every active gate entry point uses the helper; workflow permissions/triggers are read-only/test-only; archive links resolve; no runtime, generated, migration, package or deployment drift. No blocker found. |
| Diff/worktree review | `git diff --check` passed. The transient Testing-worktree `sitemap.xml` line-ending state was not committed or imported. |

The complete browser suite was not rerun after importing documentation and dormant Security SQL
fixtures because the executable browser/generator tree is exactly the fully tested `4ea428b` tree.
The combined static and runner checks above cover the executable integration boundary added here.
Browser port 8791 was released before integration and is not left occupied.

## Unverified and separate work

- All 56 prepared DATA-01 SQL assertions remain **UNRUN** in this imported batch. Runner-unit and
  manifest success are not RLS, migration-replay or permission evidence. DATA-01/02/03 remain
  unrepaired. No production database was used as a fallback.
- The separate platform-only bootstrap experiment later passed on its own branch, but it replayed
  zero Hotkey migrations and ran zero Hotkey permission assertions. It is external evidence, not
  part of this checkpoint. Its separately scoped replay-baseline continuation is also excluded.
- Live and multi-tab authentication, real account lifecycle, page-specific loaders beyond the
  shared navigation boundary, native Mac hardware and human usability remain unverified.
- Main still lacks enforced review/required checks. Database delivery credentials/workflow,
  complete schema/history parity, hosting origin/settings, recovery and rollback remain open.
- Existing DATA-02/03 privacy/MFA, saved-progress/ranking, formula/grader, truthful-feedback,
  payment and launch findings remain with their named owners. This batch does not broaden into them.
- Legacy browser scripts outside the active gate remain outside the isolation claim. Future gate
  additions must use the shared helper.

No production data, Auth configuration, schema, billing, hosted site, GitHub protection setting,
main branch or deployment was changed.

## Handoff to the chief

Proposed shared-status result: the accepted account repair, full active browser-gate isolation,
Security test preparation and first repository structure cleanup now coexist on one verified
branch. The full pinned local matrix and exact Linux gate are green across all 35 job steps; combined static and
runner-unit checks pass. Security's 56 application permission assertions remain explicitly unrun,
so database/security repair readiness is not complete.

The next decision remains with the chief. The separate Security replay-baseline experiment may
produce evidence for a later accepted delta; it should not be silently folded into this completed
checkpoint. No catalog, application repair, merge, deployment or next module starts from this
handoff alone.

This report's Git history supplies its final documentation commit. Push and verify the remote
branch/file before reporting continuity complete.
