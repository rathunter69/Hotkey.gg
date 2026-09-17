# Development and validation

## Setup

Use Node.js 22 or later with npm (CI uses Node 22). Run `npm ci` in the repository root.
`package-lock.json` pins the existing CI browser library, `playwright-core@1.49.1`; this change
does not upgrade it. Run `npm run browser:install` once to install its Chromium build. Linux CI
uses `npx playwright-core install --with-deps chromium` for system libraries too.

Foundation installation limitation (2026-09-13, updated below): npm registry requests failed
with connection resets even outside the sandbox. The initial single-package lock entry was assembled from the
[upstream package manifest](https://github.com/microsoft/playwright/blob/v1.49.1/packages/playwright-core/package.json)
and the package checksum recorded in an
[existing npm lockfile](https://github.com/NetOfficeFw/playwright/blob/main/package-lock.json).
Run `npm ci` and the browser gate before merging this tooling change; do not bypass integrity
verification if installation fails. Replace this note with the actual result once verified.

September 17 audit update: the bundled Node runtime is available, but npm and the pinned
project dependency are not installed here. Local checks ran with bundled Playwright 1.62.1
and installed Chrome 152.0.7977.84. All seven static commands, 86 onboarding assertions and
the five smoke commands passed after repairing the runner's page routing. The audit reports
record additional engine checks. These results do not replace an exact pinned install/CI run.
See [delivery/testing audit](audit/DELIVERY_TESTING.md) for reproduction and scope.

`npm start` serves this checkout on loopback port 8791, with caching disabled. Set `PORT` for a
different manual preview port. The preview does not emulate Cloudflare headers, redirects or
Supabase. Stop it before running browser tests, which own port 8791.

## Commands

| Command | Purpose |
|---|---|
| `npm run check` | Syntax, asset versions, runtime invariants, v3/v5 planning-map checks, outbox and tooling tests; no browser or network required |
| `npm run test:smoke` | Page smoke, leaderboard, landing, paywall and navigation/combo/foot demo replay with one owned local server |
| `npm run test:browser -- dev/e2e-formulas.js` | Run an existing browser harness with the same server/browser setup |
| `npm run test:browser -- dev/e2e-demo-replay.js navigation pastes` | Target named drills with the existing replay harness |
| `npm run test:browser -- dev/e2e-alt-paths.js` | Alternative-route regression suite |
| `npm run build:drill-pages` | Regenerate committed drill pages and sitemap from the running trainer |
| `npm run repo:status` | Read-only branch inventory from local remote refs; run `git fetch origin` first when freshness matters |

Equivalent commands without npm are `node dev/run-checks.js static`, `node dev/run-checks.js smoke`,
and `node dev/run-checks.js browser dev/e2e-formulas.js`. Browser runs still require the dependency.
`CHROME` may point to an installed browser; otherwise the runner resolves Playwright's Chromium.
The runner stops on failure, returns a nonzero exit code and closes its preview server.

The smoke suite is not the full engine gate. `.github/workflows/gate.yml` retains the complete
regression matrix, including guided routes, rapid-fire, parity, input, depth mechanics and layout.
Review its scope rules when adding production files. Legacy scripts remain directly runnable,
but many assume a Linux browser path unless `CHROME` is supplied; use the runner on Windows.

The static guard normalizes CRLF when reading source. `.gitattributes` supplies LF on new checkouts;
existing files do not need a mass renormalization commit. A planning-map check passing proves the
plan's consistency, not its implementation. The 39 baseline variety warnings remain warnings.

## Working and shipping

1. Read `docs/CURRENT.md`; establish the source SHA and one concrete change objective.
2. Fetch origin and inspect `git status`. Until the foundation is integrated, branch from the
   verified remote `codex/repository-foundation` checkpoint using `codex/<purpose>`, not main.
   Afterwards use the integrated baseline recorded in CURRENT.md. Verify guidance files exist.
   Preserve user changes and unfinished branches. Check the branch inventory before reusing old work.
3. Implement the bounded change. Keep gameplay changes separate from structural moves so replay
   differences are attributable. Test changed behavior and run the relevant existing regressions.
4. For runtime shared JS/CSS changes, update all `?v=` references and regenerate drill pages.
   Documentation and dev-tooling edits do not require product asset-version bumps.
5. Review the diff, open a PR when ready, and inspect CI results. Record the actual validation;
   do not equate a locally green subset with a fully green gate.
6. Merging main can publish the website. Supabase changes have a separate workflow triggered by
   `supabase/**` changes or manual dispatch. A green website gate does not establish DB deployment.
7. Save an area handoff with commit/PR and next objective, then return its remote link to the
   chief for CURRENT.md/PRODUCT.md integration. Keep prior design documents as references.
8. At every handoff, commit and push relevant non-secret continuity to the task branch and verify
   the remote commit. Wolf cannot rely on access to this PC. Branch checkpoints are authorized;
   merging main, production changes and billing activation remain separate actions. If tasks
   overlap, coordinate shared guidance through one integration owner as described in TASK_GUIDE.md.

Adding `package.json` does not change the deployment output: repository root, no frontend build.
Before publishing this tooling change, verify that the existing Cloudflare project still uses
its static-site settings rather than inferring a framework build from the manifest.

## Database and credentials

Use new `supabase/migrations/*.sql` files for database changes. Compare a replacement function
against its newest definition, preserving all existing permission and integrity checks. Historical
SQL in `dev/` is not a command to apply it again. Test migrations in an isolated environment before
production. Migration file presence and dated handoff claims are not proof of live deployment.

No credentials are needed for static checks. Use service settings / repository secrets for tokens,
database passwords and Stripe secrets. The public Supabase publishable key in the client is expected.
Keep local `.env` files untracked. Do not enable live billing as part of repository cleanup.
