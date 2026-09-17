# Account and testing integration

Updated: 2026-09-17
Task: `01a0b0f9-09da-7a62-9dd2-dd9baeac388d`
Branch: `codex/account-testing-integration`
Starting remote foundation: `f2dd5645e01101f17194691c5979100862055e3c`
Exact tested code commit: `c702c6932b342cd36656317f7ce50f1c33b7df3e`
State: combined source locally verified; branch checkpoint for chief review, not merged or deployed.

## Scope and outcome

Wolf explicitly assigned this bounded integration on September 17. The changes work together
under every requested local check. A separate worktree preserves the original source checkout's
pending files and branch. CURRENT.md and PRODUCT.md remain chief-owned.

- Cherry-picked account isolation `e598752d8dc39acd500276fbd42d50955018bbeb` as `2981dec`.
- Cherry-picked testing infrastructure `136df032c119de73e6896ca480381ab77846e872` as `3271c67`.
- Resolved the runner conflict by keeping the canary first, account isolation second, then all
  five original smoke suites. CI retains both always-on canary and account steps.
- Kept one audit-state start-gate setup, before navigation.
- Added shared redirect-safe isolation to the account and onboarding harnesses in `c702c69`.
  The account fixture is still fulfilled locally; other requests fall back to the shared blocker.
  This closes the old route.continue redirect gap for the required integration checks.
- Preserved nav v308 and themes v315, all generated drill pages, and runtime code exactly as
  supplied by the account commit. A diff against that commit for nav.js, themes.js and all HTML
  is empty; the static cache/version checks pass. No new regeneration was necessary.

Owned integration edits: `dev/run-checks.js`, `dev/audit-state.js`,
`dev/e2e-account-isolation.js`, `dev/e2e-audit-onboard.js`, and this handoff.
Imported files are enumerated in the two source handoffs and the exact manifest from
`git diff --name-only f2dd5645e01101f17194691c5979100862055e3c c702c6932b342cd36656317f7ce50f1c33b7df3e`.
They include `.github/workflows/gate.yml`, the shared network helper/canary, five smoke harnesses,
development/database-test guidance, nav.js/themes.js, 16 top-level HTML files and 75 drill HTML files.
The subsequent handoff commit changes documentation only; all executable code remains the tested tree.

## Verification

Fresh exact dependency install: `npm ci --ignore-scripts --no-audit --no-fund` succeeded.
Environment: Windows x64, Node **22.23.2**, npm **10.9.8**, locked Playwright **1.49.1**,
matching installed Chromium headless shell **131.0.6778.33**, build **1148**.
Package and lockfile were unchanged. CHROME selected that pinned shell explicitly.

| Required check | Result on the exact tested commit |
|---|---|
| `npm run check`, GATE_BASE=f2dd564 | All seven commands pass, including three tooling tests and asset bump checks. Initial sandbox run hit Node worker spawn EPERM; the permitted rerun passes. Existing 39 variety warnings remain. |
| Network isolation canary | Both tests pass; allowed-origin requests work, SDK-shaped/direct/redirected cross-origin attempts produce zero requests at the disallowed local sink. |
| Account isolation | All 14 scenarios pass: guest preservation, late client initialization, same-account reuse, A/B/A fencing, delayed responses, cancelled push, founding/cosmetic state, retry and real trainer sign-out reload. |
| `npm run test:smoke` | All seven commands pass: canary, account isolation and all five original suites. Seven app pages and 19 mobile routes pass; leaderboard 41/41; landing 39/39; paywall guard clean; navigation/combo/foot demos each win. |
| `npm run test:browser -- dev/e2e-audit-onboard.js` | All 86 assertions pass; zero page errors. |
| Review and diff | Two focused independent reviewers checked overlap/assets/CI and shared isolation/fixture fallback. No remaining blocker. `git diff --check` passes. |

The smoke command runs the required canary and account tests before the original five suites;
they were not needlessly rerun as separate commands. Browser suites owned local port 8791
sequentially and closed their servers. All browser contexts in these runs block external traffic;
fixtures are synthetic. No production account, data, database, billing or deployment was touched.
Ignored `.gate-integration-*.log` files are supplementary local transcripts; durable results are here.

## Remaining limits and unrelated findings

- No unresolved failure in the requested combined checks. Existing catalog warnings and previously
  audited product defects were not changed or reclassified by this integration.
- Full GitHub/Linux CI and the wider engine matrix are **not run/certified** on this source.
  Remaining gate harnesses still need network isolation before routine execution. This branch
  push is not a full gate: gate.yml triggers on PRs and main pushes. No PR or deployment was started.
- Pinned full Chromium's Windows SideBySide launch failure is inherited from the testing handoff;
  it was not retried. These results use the matching pinned headless shell, not system Chrome.
- Live multi-tab authentication, real account round trips, page-specific loaders outside the
  shared-nav boundary, browser/OS breadth and human usability remain unverified.
- No isolated database replay or permission test ran. The prior testing handoff records absent
  container/CLI infrastructure. Follow docs/testing-database.md on a disposable capable host,
  with outbound denial and cron disabled before replay; never substitute production.
- Release protection, database deployment credentials, schema/history reconciliation, hosting
  origin/settings and rollback remain prior open limitations. No new live verification is claimed.
- DATA-01/02/03 desk authority/privacy/MFA, saved-progress/ranking issues and engine/grader defects
  remain with their existing area owners. This integration does not repair those separate findings.

## Handoff to the chief

Proposed CURRENT.md update: account isolation and testing infrastructure are now combined and
pass the complete requested local baseline at `c702c6932b342cd36656317f7ce50f1c33b7df3e`.
Replace combined-testing-pending with this bounded result, retaining full-CI/live-auth/database
and release limitations. No product decision changed; nothing has merged or shipped.

Recommended next step: chief reviews this checkpoint and agrees the next bounded validation
batch: isolate the remaining CI harnesses and run the complete pinned Linux gate before any
release decision. Database permission/replay evidence still requires its isolated environment.
This recommendation does not start another module or authorize deployment.

The branch and this report must be pushed and remote commit/file identity verified before
reporting handoff complete. The report's Git history supplies its documentation commit identity;
the exact tested code commit above remains fixed.
