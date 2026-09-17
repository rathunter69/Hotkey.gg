# Git, testing and releases

Updated: September 17, 2026
Task: `01a0af90-b973-7572-b7ff-d5bf9f504a52` (starter 4)
Branch: `codex/git-testing-releases`
Starting commit: `9df3405fbdcdeac0e2f2f8d4ef4170fb51dc0bdd`
State: locally verified branch checkpoint; no merge or deployment (remote commit is in file history)

## Scope and outcome

Verified the remote foundation tip and preserved the original checkout's pending work by
creating a separate worktree. Main remains `434bc0e8764e741e0e11f84cf51d61a1755d7c67`.
The exact lockfile installs successfully. The first fresh static run exposed a missed C14
failure in `dev/audit-state.js`: it loads a drill without declaring its start-gate stance.
The diagnostic now explicitly disables the start overlay before navigation. Independent
review confirmed that this does not change the account-state observations.

Automatic approval review rejected running the partially isolated smoke suite outside the
sandbox because it could reach production. The remediation is shared same-origin blocking
in the five smoke harnesses and a local network canary, not an exception to isolation.
The initial canary failed because Playwright follows redirects without re-running a route
handler. The helper now fetches without following redirects and rejects redirect responses.
The same canary passes and records zero requests at the disallowed local sink.

Owned files: `.github/workflows/gate.yml`, `dev/run-checks.js`,
`dev/audit-state.js`, `dev/browser-isolation.js`,
`dev/browser-isolation.test.js`, `dev/e2e-smoke.js`, `dev/e2e-lb.js`,
`dev/check-landing.js`, `dev/check-paywall.js`, `dev/e2e-demo-replay.js`,
`docs/DEVELOPMENT.md`, `docs/testing-database.md`, and this handoff.
No runtime application, generated drill page, migration, CURRENT.md or PRODUCT.md
changes. Security owns its account tests and nav repair in a separate worktree.

Integration note: Security's checkpoint `e598752d8dc39acd500276fbd42d50955018bbeb`
also includes an `audit-state.js` start-gate opt-out. Keep one setup call when integrating
both branches. Preserve Security's account-isolation additions to `dev/run-checks.js` and
`gate.yml` alongside this branch's network canary additions. Security reported 14 synthetic account cases passing, but its repair is
not part of this task's tested source. This baseline does not certify Security's commit.

## Verification

Environment: Windows x64; portable official Node **22.23.2**, SHA256 checked against the
official release manifest; npm **10.9.8**; locally installed Playwright **1.49.1**.
`package.json` and `package-lock.json` remain unchanged.

| Check | New result and limit |
|---|---|
| Remote provenance | `git ls-remote` and fetch verified foundation `9df3405` and unchanged main |
| Local Git access | Noninteractive `git push --dry-run origin HEAD:refs/heads/codex/git-testing-releases` passed; no sign-in prompt |
| Exact dependency | `npm ci --ignore-scripts --no-audit --no-fund` passed; one locked package installed |
| Browser installation | `npm run browser:install` completed; Chromium and headless shell **131.0.6778.33**, Playwright build **1148**, downloaded; first CDN timed out, installer fallback succeeded |
| Pinned full Chromium | Cannot launch on this Windows host: SideBySide event says dependent assembly `131.0.6778.33` not found; no application assertion ran in that failed attempt |
| Pinned headless shell | Launch succeeds unchanged; explicit `CHROME` selects the Playwright-downloaded headless shell, not system Chrome |
| Onboarding | All 86 assertions passed, zero page errors, using Node22/Playwright1.49.1/pinned headless shell and existing external-request blocking |
| Network canary | Both tests pass: allowed-origin script/fetch work; SDK-shaped requests, direct fetch and redirect escape cannot reach a different-origin local sink, across two separate contexts; non-loopback target rejected |
| Smoke baseline | `npm run test:smoke`: all six commands pass (canary plus five original suites), including seven app pages, 19 mobile routes, leaderboard fixtures, landing/paywall and navigation/combo/foot replay; same exact pinned headless environment |
| Static baseline | All seven checks passed after the diagnostic fix, including all three tooling tests; 39 existing variety warnings remain. Initial sandbox test-worker spawn failed EPERM; rerun outside sandbox passed |
| State diagnostic | Completed with all external traffic blocked, synthetic users and an ephemeral server. Reproduces retained autofit after sign-out, limited sync fields and truncated leaderboard results on foundation; it is a diagnostic, not a passing product regression |
| Isolated database | Not run: no Docker/Podman executable, standard Docker installation or daemon pipe. Supabase CLI absent; portable download did not complete. No production fallback |
| Full GitHub gate | Not run on this task/foundation SHA. Agent read-only verification found zero Actions runs for `9df3405`; main's historical green gate is a different commit |

Independent agent review checked the diagnostic opt-out, harness isolation changes and
canary wiring. Lead review identified the redirect escape, inspected the remediation and
all five harness call sites, and ran the final integrated static/smoke/onboarding checks.
Ignored `.gate-baseline-*.log` files are local transcripts; durable results are recorded here.

Reproduce on a machine with Node 22/npm: run `npm ci --ignore-scripts --no-audit --no-fund`,
`npm run browser:install`, `npm run check`, then the commands below. Stop manual previews
and coordinate port 8791 first. On this Windows host the full executable fails, so set
`CHROME` to the installed Playwright headless shell before browser checks:

```powershell
$env:CHROME = Join-Path $env:LOCALAPPDATA 'ms-playwright/chromium_headless_shell-1148/chrome-win/headless_shell.exe'
npm run test:smoke
npm run test:browser -- dev/e2e-audit-onboard.js
node dev/audit-state.js
```

The smoke suite is a limited local baseline, not the complete CI engine matrix, database
permission coverage, real-user playtesting or a deployment rehearsal. The remaining full
gate harnesses must receive isolation before routine execution. No real account journey,
native Mac input, full financial-model review, payment lifecycle, backup restore or rollback
has passed in this task.

## Release blockers and acceptance

These are enabling/release blockers, not authorization to implement every area. Priorities
carry forward the audit; product repairs remain with their named owners.

| Blocker | Current evidence | Owner / acceptance |
|---|---|---|
| D01: main has no enforced review/gate | Fresh GitHub metadata: `protected=false`, required checks off, no contexts, zero rulesets | Git/testing: reviewed main ruleset requires PR review and the actual gate context; demonstrate failed/missing check blocks merge. Do not test by merging an unsafe commit |
| D02: database delivery fails | Latest run [33814362058](https://github.com/rathunter69/Hotkey.gg/actions/runs/33814362058) still failed at link with invalid token format; migrations/functions skipped. A gate for that source passed independently | Git/testing with Security: correct credentials through settings, pin CLI, rehearse link/migrations/functions in isolation, then verify accepted SHA and actual deployed state during a separately authorized release |
| D03: clean replay and permission tests absent | No PR database validation; no local container runtime; migrations include a production digest callback | Git/testing + Security + cleanup: follow [isolated setup](../testing-database.md), prove outbound denial and disabled scheduling before replay, test direct-table/RPC role cases, reconcile definitions/history without rewriting migrations |
| D05: wider browser gate lacks isolation | Five smoke harnesses repaired here; initial review found eleven of 22 gate harnesses without a relevant external blocker, with SDK-only guards in others. Existing onboarding origin filter does not test redirect escape | Git/testing: migrate every remaining context/page and generator to reviewed same-origin isolation, preserve stubs, then run the complete gate |
| D06: complete exact CI still unproven | Exact npm install, isolated smoke and onboarding pass locally with pinned headless shell, but full Chromium on Windows fails and no foundation CI run exists | Git/testing: complete Node22/locked-dependency/pinned-browser full Linux gate at the exact reviewed source; save version and test evidence |
| D07: hosting/cache and rollback unverified | Earlier audit observed immutable prototype HTML; Cloudflare/GitHub Pages both publish, origin/build settings remain unconfirmed | Git/testing: verify static-site build/output and serving origin, check preview response headers, tie web/DB/functions to a source SHA, rehearse recovery in isolation |
| Product/security defects remain | DATA-01/02/03 desk authority, profile privacy and MFA; saved-run duplication/state/rankings; formula and grader defects from existing audit | Security, persistence and engine owners: focused failing-before/passing-after tests plus allowed-route regressions. This tooling branch fixes none of those product defects |
| Paid launch acceptance remains open | Billing is a scaffold, access/learning rules and public claims need agreement; production account flows and business readiness unverified | Chief with area owners: agreed launch scope and verified acceptance from CURRENT/PRODUCT before any launch decision |

The release workflow still floats Supabase CLI `latest`, lacks PR migration tests and a
protected serialized deployment environment, and is independent of the website gate.
A green website check alone cannot demonstrate database delivery or release coherence.

## Decisions for the chief orchestrator

Confirmed by Wolf September 17 through starter 4: verify handover, reproducible dependencies
and isolated database setup; identify blockers, save remote continuity; no merge/deployment.
No new product decision was made. Proposed shared-status update: exact dependency install
and local Git access now work; replace those old unknowns with the precise browser/CI/DB
limits above after reviewing this branch. Do not mark Security's separate work integrated.

Next bounded batch: finish browser isolation across the full gate and establish a
container-capable isolated database host, then replay the chain and add Security's first
permission regressions. Production delivery/protection changes and rollback rehearsal
follow their separately reviewed release batch. Keep billing and catalog development paused.
