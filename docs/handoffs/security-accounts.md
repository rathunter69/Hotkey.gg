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
