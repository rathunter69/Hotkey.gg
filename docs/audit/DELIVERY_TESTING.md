# Delivery and testing audit — September 17, 2026

The existing tests are useful, but they do not yet make releases safe or prove the whole
product works. This review made local browser testing usable and verified the release gaps
below. Application behavior and live settings were not changed.

Baseline: `434bc0e8764e741e0e11f84cf51d61a1755d7c67`, branch
`codex/repository-foundation`, with the existing uncommitted foundation work preserved.

## Findings and repair order

| ID | Priority | Finding | Evidence | Required repair or verification |
|---|---|---|---|---|
| D01 | High | Changes can reach main without a passing review gate | Live GitHub main metadata: `protected=false`, required checks enforcement `off`, no check contexts; repository rulesets returned an empty list. The dedicated protection endpoint was unavailable to the integration, but the branch metadata is explicit. | Require reviewed PRs and successful relevant checks before main changes. Verify the website and database publish the same accepted version. |
| D02 | High | The latest database deployment failed | Run `33814362058`, September 3: secret-presence check passed; project linking failed with invalid access-token format; migrations and functions were skipped. No newer Supabase run appeared in the newest 100 workflow runs. | Correct the secret through the service settings, compare live schema/history, then rehearse deployment in an isolated environment. A healthy live database is not proof that Git deployment works. |
| D03 | High | Automated checks do not exercise real database permissions or subscription lifecycle | `.github/workflows/gate.yml` runs source checks and browser suites; `.github/workflows/supabase-deploy.yml` publishes independently. No temporary database replay, multi-user permission test or payment-event test is defined. | Add isolated permission/migration tests for the verified security fixes. Build payment tests when billing work resumes. |
| D04 | Medium | The new shared local runner opened the wrong page for gameplay tests | `dev/run-checks.js` set every harness's `URL` to `leaderboard.html`. Onboarding timed out waiting for the trainer. | **Repaired locally:** gameplay targets index.html; leaderboard gets its own URL. Onboarding and all five smoke checks now pass. |
| D05 | Medium | Several browser harnesses relied on the environment to block production | Existing leaderboard/demo comments assumed the Supabase CDN was unreachable. That assumption is false for a browser allowed outside the sandbox. | **Repaired in the three harnesses touched here:** onboarding blocks all external requests; leaderboard and demo explicitly block the SDK. Engine audit adds an external-request blocker for its other runs. Standardize isolation across the remaining suites before routine use. |
| D06 | Medium | Exact dependency installation is still unverified locally | Repository pins Playwright 1.49.1, but this environment has no npm command or project installation. This pass used bundled Playwright 1.62.1, Chrome 152.0.7977.84 and Node 24.19.0. | Run `npm ci` with the pinned browser and CI's Node 22 before merging the tooling foundation. Do not change the lockfile to hide the difference. |
| D07 | Medium | The cache configuration's explanation is incorrect, and prototype HTML stays immutable | `_headers:9–13` assumes the last repeated header wins. Cloudflare documents comma-joining. A live HEAD request to `/art/rank-proto.html`, following redirects, returned `public, max-age=31536000, immutable`. | Match actual extensionless routes and verify final headers in a preview. Decide whether prototypes belong in the published output. Do not rely on the current comment. |
| D08 | Maintenance constraint | Test scope is tied to today's file layout and old behavior | `gate.yml:41` chooses the heavy matrix by path; `dev/check-syntax.js` scans only root/dev JS; `dev/check-cache-versions.js:19–20` checks six assets and top-level HTML. Curriculum guards check proposed maps, not shipped lessons. | Expand source/test discovery when extracting modules. Separate regression contracts from product requirements awaiting Wolf's confirmation. |
| D09 | Setup gap | Local Git publishing remains unverified | Remote reads work and the connector has push permission, but prior local dry runs lacked a Git credential. Device authorization attempts failed at the network layer. | Complete local Git sign-in and repeat a dry run. No probe commit or production push is needed. |

Priorities describe repair order, not a claim that every possible issue was found.

## Verification completed in this pass

| Check | Result | What it establishes |
|---|---|---|
| Static runner | All seven commands passed; 39 existing catalog-variety warnings remain | Syntax, asset-reference consistency, source invariants, plan-map consistency, retry logic and tooling checks |
| Onboarding audit | All 86 assertions passed, zero page errors | The current first-lesson contract works with stubbed authentication |
| Smoke runner | All five commands passed | Seven app pages load, 19 mobile routes fit, leaderboard fixtures render, landing/paywall contracts hold, navigation/combo/foot demos finish |
| Sign-out reproduction | Confirmed retained drill | `markOnboarded(); loadChallenge('autofit'); clearAccountUI();` then reload with `?fresh=1` resumes autofit; the cleanup key differs from the stored key |
| Sync snapshot inspection | Confirmed limited fields | Writing guide completion then calling the real `hkStatePush` sends only version, achievements, seen achievements, streak and daily latches |
| Leaderboard response-limit simulation | Confirmed incomplete boards | Returning two of three synthetic runs hides the only autofit entry; returning all three restores it. The loader makes no paging request. This does not establish the production API row limit. |
| Leaderboard API-error simulation | Confirmed silent empty data | A returned runs-query error becomes `DATA.runs=[]`; the unavailable message is not shown. A thrown exception is handled differently. |
| Public website headers | Read-only HEAD requests succeeded | Root responds through Cloudflare with no-cache and the expected CSP; nav.js is immutable; prototype HTML is also immutable |
| Live release metadata | Read-only GitHub API and deployment logs | Current main's identity, lack of required checks, and the last database pipeline failure |

Local ignored transcripts: `.gate-audit-static.log`, `.gate-audit-onboard-before.log`,
`.gate-audit-onboard-after.log`, `.gate-audit-smoke.log`, `.gate-audit-state.log`.
The synthetic state reproduction is preserved as `dev/audit-state.js`. Run it directly with
`node dev/audit-state.js` after installing the browser dependency; it owns an ephemeral local
server and blocks external traffic. It reports observed failures; it is a diagnostic, not a
passing regression test. Convert its relevant observations to assertions when fixing each defect.
These are local evidence aids; the durable findings and reproduction steps are in this report.

The engine report owns its additional replay/formula/alternative-route results. No result here
claims a complete CI run, native Mac input verification, real-user usability study, live
account round trip, payment lifecycle test or database migration rehearsal.

## Delivery map

1. The root HTML/JS/CSS is the website; there is no application build step.
2. GitHub runs `gate` on PRs and main pushes. It contains broad engine coverage, but current
   branch settings do not require it before a change lands.
3. GitHub Pages and Cloudflare Pages both reported successful deployments for current main.
   GitHub Pages finished before that commit's gate. The public domain currently responds
   through Cloudflare; its origin settings and build-output selection still need confirmation.
4. Changes under `supabase/` independently trigger the database deployment workflow. It uses
   the latest Supabase CLI and `db push --include-all`, then deploys functions. No dependency
   on the website gate or named protected deployment environment is defined.
5. Migration version names are present live, with nine additional live stamps. This has not
   yet established full definition parity or that a clean database can be rebuilt correctly.

Do not infer successful shipping from a local passing test, a healthy Supabase project, or a
green website deployment alone. Record each of those outcomes separately.

## Recommended working protocol

1. Keep `AGENTS.md`, `docs/PRODUCT.md` and `docs/CURRENT.md` as the shared instructions,
   decisions and active queue. Audit reports are evidence, not new competing roadmaps.
2. Give each repair one owner, one branch and explicit acceptance evidence. Preserve the
   foundation work before creating new worktrees from main. For the handover, use the remote
   `codex/repository-foundation` checkpoint and verify the shared guidance is present.
3. Reproduce the defect, make the bounded repair, and run the affected checks plus the static
   suite. Broaden testing only where changed behavior or unresolved evidence warrants it.
4. Use isolated database fixtures for account, permission and billing checks. Production is
   for read-only verification during this audit, not synthetic users or exploit probes.
5. Review the diff and test evidence, then ship only through the agreed release path. Record
   website version, database migration status and rollback procedure together.
6. Extract modules only after the affected behavior has a useful regression check. Keep
   structural cleanup separate from content redesign and pricing/onboarding decisions.

Use lighter models for routine inventory, formatting and narrow verification. Use stronger
reasoning for security, engine semantics and cross-account integration. Do not duplicate
successful tests or restart useful agent work just to change its model.

## Sources

- [Current main](https://github.com/rathunter69/Hotkey.gg/tree/main), read via GitHub's branch API on September 17.
- [Latest observed Supabase deployment failure](https://github.com/rathunter69/Hotkey.gg/actions/runs/33814362058).
- [Current-main gate](https://github.com/rathunter69/Hotkey.gg/actions/runs/33951716525).
- [Current-main GitHub Pages deployment](https://github.com/rathunter69/Hotkey.gg/actions/runs/33951716049).
- [Cloudflare headers documentation](https://developers.cloudflare.com/pages/configuration/headers/) states repeated header values are joined; ordering alone does not replace them.
- [Cloudflare route behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/) describes redirects from HTML filenames to extensionless URLs.
