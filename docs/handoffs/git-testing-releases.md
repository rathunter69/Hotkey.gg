# Git, testing and releases

Updated: September 17, 2026
Task: `01a0af90-b973-7572-b7ff-d5bf9f504a52` (starter 4)
Branch: `codex/testing-security-groundwork`
Starting commit: `6c984161c31bc4637dbe88b73a4da8408cefdf1d`
Tested application source: `c702c6932b342cd36656317f7ce50f1c33b7df3e`
Testing-tooling checkpoint: `4ea428ba1504ee04b3d01943df5f7cd1b68a2c4d`
State: second testing-groundwork batch verified locally and by the exact Linux branch gate;
no merge or repository-workflow deployment

## Second batch — full gate isolation and exact local matrix

Wolf's September 17 groundwork request authorized finishing production-network isolation
across the full gate and generators, then running the complete pinned suite in a suitable
isolated environment. This branch starts from the accepted account/testing integration and
preserves the account repair and its 14-scenario regression suite.

All remaining gate browser contexts now use the redirect-safe helper. This includes visual,
deep-link, parity, onboarding, alternate paths, Mac input, rapid-fire, guided, formula,
grid-height, depth, border, pause, resize and start-gate checks, plus both drill-page generator
pages. Separate fresh-device, theme/DPR, trainer/reference and fixture profiles remain separate.
The account fixture still fulfills only its synthetic local page, then falls back into the
shared origin blocker. No assertion, timeout, gameplay source or generated output changed.

`gate.yml` now declares `contents: read`, pins checkout/setup-node v4 to reviewed commit SHAs,
and supports reusable `workflow_call`. The branch-only `testing-groundwork.yml` calls that exact
gate on pushes to `codex/testing-security-groundwork`; it references no secrets, environment,
database, hosting or deployment action. Existing workflows do not run on this branch push.

Fresh local results on the exact integrated source, portable SHA256-verified Node 22.23.2,
npm 10.9.8, locked Playwright 1.49.1 and its Chromium 131 headless shell build 1148:

- exact `npm ci` passed; package and lock files did not change;
- all seven static commands passed; 39 catalog-variety warnings remain warnings;
- isolation canary passed both tests, including the `newIsolatedPage` wrapper, zero sink
  WebSocket upgrades and inactive service workers;
- the seven-command smoke suite passed, including 14 account-isolation scenarios;
- visual 406, deep-link 18, parity 189, onboarding 86, alternate paths 159,
  Mac input 30, rapid-fire 14, guided 77, formula 102, depth-contract 74,
  depth-mechanics 169 and resize 34 assertions/checks passed;
- all-drill replay, grid-height, border render, pause and start-gate suites passed;
- generator wrote 74 drill pages plus library/sitemap/refmap and produced no tracked content diff.

These local runs cover every command in the browser gate, with its two behavioral-smoke/full-replay
invocations represented by the full replay and the passing smoke suite. Ignored local logs are
supplementary; the durable Linux result is recorded below.

Independent review found no blocking isolation or workflow defect. It confirmed that every
active gate browser entry point uses the helper, fixture fallbacks retain the boundary, and
the branch caller is read-only and references no secrets. Its one cleanup finding was that
three harnesses closed pages created in explicit contexts; those sites now close the context,
and the generator, border renderer and all 30 Mac-input checks passed again. The review also
prompted direct WebSocket and service-worker canary assertions, which pass locally.

## Second-batch remote checkpoint

[Linux run 35274460688](https://github.com/rathunter69/Hotkey.gg/actions/runs/35274460688)
completed successfully on Ubuntu at exact testing-tooling commit
`4ea428ba1504ee04b3d01943df5f7cd1b68a2c4d`. Its reusable gate used Node 22,
the locked Playwright 1.49.1 dependency and installed Chromium. All 35 reported steps passed:
32 setup/validation steps through generator drift, two post-action cleanup steps and final job
completion. The run finished September 17 at 21:21:46 UTC. Port 8791 is released locally.

The branch caller and reusable gate have `contents: read`, contain no secret, environment or
deployment reference, and ran no repository deployment workflow. No PR or merge was created.
Automatic hosting-preview settings outside repository workflows were not inspected and are not
part of this claim.

Security's separate platform-bootstrap code `49b8193b6b6c17c63b97c898d268437ceb191cdf`
received Testing's exact-SHA safety clearance. Its one authorized
[platform-only run 35275149357](https://github.com/rathunter69/Hotkey.gg/actions/runs/35275149357)
passed with cleanup. Security saved the durable result and handoff at
`3dd686d26edcb53325579fbe479eb01bdf41f773`. That proves the genuine pinned Postgres/Auth
bootstrap only. The first reviewed replay stopped at a stale fixture call, preserved in
Security's [replay handoff](https://github.com/rathunter69/Hotkey.gg/blob/9ea05e64edbe66d075b2fda6e7b313a2f198ae72/docs/handoffs/security-accounts.md).
After a separately reviewed test-only correction, [run 35277724943](https://github.com/rathunter69/Hotkey.gg/actions/runs/35277724943)
proved two fresh 52-migration replays and two complete 56-result permission streams. It remained
red because the same 12 DATA-01 authorization failures reproduced on both instances. Security's
[final replay handoff](https://github.com/rathunter69/Hotkey.gg/blob/54640b07554882dcd3322d84f2bba398fadc94c0/docs/handoffs/security-accounts.md)
contains the durable result and exact assertion list.

## First batch history — original starter-4 checkpoint

This section and its verification table record the earlier `codex/git-testing-releases`
checkpoint. They remain for provenance. References to a limited smoke baseline, the account
repair being separate, and the older owned-file list describe that first batch only; the
second-batch evidence above supersedes them for the integrated source.

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

## First-batch verification (historical)

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

The first-batch smoke suite was a limited local baseline, not the complete CI engine matrix,
database permission coverage, real-user playtesting or a deployment rehearsal. This second
batch isolated the remaining gate harnesses and ran their complete local matrix. No real account journey,
native Mac input, full financial-model review, payment lifecycle, backup restore or rollback
has passed in this task.

## Release blockers and acceptance

These are enabling/release blockers, not authorization to implement every area. Priorities
carry forward the audit; product repairs remain with their named owners.

| Blocker | Current evidence | Owner / acceptance |
|---|---|---|
| D01: main has no enforced review/gate | Fresh GitHub metadata: `protected=false`, required checks off, no contexts, zero rulesets | Git/testing: reviewed main ruleset requires PR review and the actual gate context; demonstrate failed/missing check blocks merge. Do not test by merging an unsafe commit |
| D02: database delivery fails | Latest run [33814362058](https://github.com/rathunter69/Hotkey.gg/actions/runs/33814362058) still failed at link with invalid token format; migrations/functions skipped. A gate for that source passed independently | Git/testing with Security: correct credentials through settings, pin CLI, rehearse link/migrations/functions in isolation, then verify accepted SHA and actual deployed state during a separately authorized release |
| D03: permission boundaries fail | [Run 35277724943](https://github.com/rathunter69/Hotkey.gg/actions/runs/35277724943) proved two fresh 52-file replays and two complete 56-result streams. Both reproduced 12 DATA-01 failures while 44 controls passed: direct writes bypass full-account, PRO, captain/seniority, verified/school, private/closed recruiting and pending-application limits | Security: repair the policy/table-grant boundaries in focused reviewable batches, keep the allowed RPC/control routes green, then repeat the exact isolated baseline until all 56 pass twice |
| D05: wider browser gate isolation | Resolved in this batch for every active gate harness and generator; redirect, WebSocket and inactive-service-worker canaries pass, and the complete local matrix is green | Keep the helper mandatory when adding a gate browser entry point; legacy scripts outside the gate remain outside this claim |
| D06: complete exact CI | Resolved for tested application `c702c69` plus testing tooling `4ea428b`: complete local matrix and [Linux run 35274460688](https://github.com/rathunter69/Hotkey.gg/actions/runs/35274460688) passed at the exact remote SHA | Keep the exact dependency/action pins and isolation canary in the required gate; repeat when executable source changes |
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

Next bounded batch: Security plans focused policy/table-grant repairs for the 12 reproducible
DATA-01 failures. Repository protection, hosting/rollback rehearsal and production delivery
remain separate release work. Keep billing and catalog development paused.
