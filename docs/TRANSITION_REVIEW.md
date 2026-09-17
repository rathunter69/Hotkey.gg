# Transition review — September 17, 2026

This is a first ingestion and reconciliation report, not a completed line-by-line audit or
full playtest. It extends the September 13 foundation work already present in this checkout.
The active queue is [CURRENT.md](CURRENT.md); product direction is [PRODUCT.md](PRODUCT.md).
The subsequent coordinated review is in [the platform audit](audit/README.md), with separate
evidence reports for experience/pages, engine/content, data/security and delivery/testing.

## What was inspected

The repository inventory contains 422 existing tracked or unignored files before this report:
47 at the root, 159 in dev, 4 in docs, 40 in .agents, 4 in .claude, 2 workflows,
35 art files, 75 generated drill pages, and 56 Supabase files. This count excludes Git internals
and ignored scratch files. Inventory is not a claim that every file was reviewed semantically.

Read the current handoff, architecture, development setup, historical design decisions,
drill doctrine, owner feedback, prior roadmap, business-plan excerpts, workflows, assistant
settings, payment function, and representative account, entitlement, and run-saving code.
Inspected catalog definitions, main application structure, tests, and branch provenance.
Queried live Supabase project metadata, public-table inventory, migration history, deployed
function inventory, and security advisors. No production writes were made.

Source: `434bc0e8764e741e0e11f84cf51d61a1755d7c67`, on `codex/repository-foundation`, with
pre-existing uncommitted foundation changes. Remote refs were read locally, not refreshed.

## Project map

| Area | Existing implementation | Main concern |
|---|---|---|
| Engine and gameplay | `index.html`: 34,535 lines, about 2.8 MB | Engine, content, UI, accounts, scoring and saving share one file |
| Drill catalog | `drills.js`; drill builders in `index.html` | 74 drills in eight chapters; competing future catalogs |
| Progress and identity | `themes.js`, page scripts, catalog configuration | Rewards and access rules cross several files |
| Navigation and accounts | `nav.js`, `nav.css`, account/profile pages | Repeated state and a retired PRO flag still in use |
| Leaderboards and desks | `lb.js`, `lb.css`, related pages and database functions | Permissions, run validity, paid desk rules need joint review |
| Database | 52 SQL migrations, Supabase Auth and database functions | Live history has nine additional migration records |
| Payments | Billing page, entitlement helpers, create-checkout function | Test-only scaffold; no deployed subscription webhook listed |
| Website delivery | Static HTML/CSS/JS, Cloudflare headers, GitHub checks | Current production build settings and release path unverified |
| Content generation | `dev/build-drill-pages.js`, curriculum generators | Old planning files still have active consumers |
| Design history | `dev/`, `docs/history/PROJECT_CONTEXT.md`, `art/` | Old decisions, proposals and instructions overlap |

See ARCHITECTURE.md for editing ownership and generated-file rules.

## Reconciliation register

| Item | Evidence | Treatment |
|---|---|---|
| Conflicting curriculum plans | Runtime has 74; v5 proposal has 61; September branch refines the existing catalog | Compare actual learning experiences before selecting a launch path |
| Unmerged onboarding | Branch `claude/platform-improvements-roadmap-ycogch`, tip `1703b59`, four commits beyond main | Review `entrybasics`, `ribbonways`, and instrumentation individually; no bulk merge |
| Retired PRO preference | `nav.js` hkFlagPro reads `HOTKEY_PRO.beta`; current config uses `freeNow` | Fix with entitlement work and verify all affected surfaces |
| Multiple access switches | Premium disabled, free PRO perks, local-storage entitlement stub, server desk gates | Define one paid/free contract, then align client display and server checks |
| Payment identity weakness | Checkout accepts `user_id` from the request body | Derive identity from the verified session before production billing |
| Misleading paywall comment | `drills.js` says unlocking grants no board data, but drill definitions ship in public static HTML | Decide what paid access protects; client locks cannot make shipped content confidential |
| Historical deployment claims | Old notes alternately say pipeline works or token is broken | Verify current workflow and hosting settings; neither old claim establishes today's state |
| Stale assistant workflow | `.claude/settings.json`, drill-wave script, old model assignments and direct-main instructions | Retain as history for now; current AGENTS.md overrides operational guidance |
| Planning-file dependencies | v3/v4 maps and historical SQL still consumed by generators/checks | Migrate consumers before moving files to an archive |
| Dated entity/employment assumptions | BUSINESS_PLAN describes an earlier internship and proposed formation | Ask current facts; verify official rules when doing business/legal work |
| Contradictory art plans | Earlier full pixel design narrowed to identity-only | Carry forward the narrower direction; prototypes are not shipped implementation |

## Supabase evidence

Project `vshtftzrlepedydmkcnm` (Hotkey.gg) reports ACTIVE_HEALTHY. All 18 public tables returned
by the inventory have row-level security enabled. This does not establish that their policies
or privileged functions authorize each request correctly.

The live migration history has 61 records. All 52 local versions appear in that history.
Nine extra live versions are:

| Version | Name |
|---|---|
| 20260903214612 | certificate_tracks_r452 |
| 20260903214615 | retire_beta_codes |
| 20260903221609 | baseline_r453 |
| 20260903222009 | retire_membership_r453 |
| 20260903222011 | guest_shell_prune_r453 |
| 20260903222013 | rpc_grants_r453 |
| 20260903222016 | policies_r453 |
| 20260903222017 | indexes_retention_r453 |
| 20260903222020 | run_stats_r453 |

The names suggest earlier direct applications and later history stamping, consistent with
the old handoff. This is an inference, not verified schema equivalence. The subsequent security
audit compared all 54 public function bodies: 53 match exactly after whitespace normalization,
and one differs only by a comment. Full schema/grant/configuration parity and isolated replay
remain necessary before repairing history or applying more migrations.

Two deployed functions are listed: create-checkout (JWT verification enabled) and weekly-digest
(JWT verification disabled). The subsequent audit verified both deployed sources match local
files. The digest checks its own secret; the missing JWT requirement is not itself a flaw.

Security advisors reported these review items, not confirmed exploits:

- Three tables with RLS but no policies: desk_creations, desk_pro_grants, school_map. These may
  intentionally be accessible only through controlled functions. [Advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- pg_net installed in public. [Advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public).
- Two privileged functions callable without signing in: is_desk_captain and preview_desk.
  [Advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable).
- 39 privileged functions callable by signed-in users, including admin functions. Review their
  internal ownership/admin checks, not just whether they are callable.
  [Advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- Anonymous-access policy warnings across multiple tables. Check intended guest behavior,
  grants and policy predicates. [Advisor guidance](https://supabase.com/docs/guides/database/database-advisors?queryGroups=lint&lint=0012_auth_allow_anonymous_sign_ins).

No user-row contents, credentials or payment data were needed for this review.

## Validation and remaining ingestion

All seven static check commands passed on September 17, including syntax, cache versions,
catalog invariants, both curriculum maps, run retry handling and development-tooling tests.
The first sandbox run hit Windows EPERM; the approved run outside it passed. The existing
39 catalog variety warnings remain. Local transcript: `.gate-transition-static.log` (ignored).

The initial browser attempt could not start with the project's missing dependency. The later
September 17 pass used the bundled browser library and installed Chrome, repaired the shared
runner's wrong-page URL, and passed 86 onboarding assertions plus all five smoke suites.
This uses Playwright 1.62.1 rather than the pinned 1.49.1; exact-install and full-CI verification
remain outstanding. See the platform audit for subsequent engine coverage and live-definition
comparison. Real-user usability, native Mac input, payment lifecycle, isolated permission
tests, complete hosting configuration and business readiness remain open.

## Workspace correction and publishing checks

**Resolved September 17:** Wolf made `source/` the primary folder. The project tool confirms
the same saved project now points to the actual Git repository. No code or history was moved.
The parent repository remains separate. Preserve/review uncommitted foundation changes before
creating implementation worktrees, and keep feature development paused.

The origin remote remains `https://github.com/rathunter69/Hotkey.gg.git`. A live read of main
returns `434bc0e8764e741e0e11f84cf51d61a1755d7c67`, matching this checkout's base.
A simulated push to `codex/repository-foundation` failed because local Git could not obtain
a GitHub username with interactive prompts disabled. Git Credential Manager is installed,
but its account list was empty. The GitHub connector separately reports repository push/admin
permissions. These are different authentication paths. No code was uploaded.
Two Credential Manager sign-in attempts ended in transport errors. The second displayed a
device code before failing. No successful sign-in or push was established; a fresh login and
successful dry run remain required. Do not retain or reuse the expired/abandoned device code.
Wolf completed browser approval after the local attempt failed, but the next dry run still
could not obtain a credential. A third attempt without proxy environment variables failed
to connect to GitHub:443 before issuing a code. Stop automatic retries; complete Credential
Manager login in the user's terminal, then recheck. No authentication success is claimed.

For current main, GitHub reports the following September 5 checks:

- [Gate passed](https://github.com/rathunter69/Hotkey.gg/actions/runs/33951716525).
- [GitHub Pages build and deployment passed](https://github.com/rathunter69/Hotkey.gg/actions/runs/33951716049).
- [Cloudflare Pages check passed](https://dash.cloudflare.com/?to=/0b4711d664f78b5e377ec1a9a6fc15a4/pages/view/hotkey-gg/780c91bd-0f8a-41b5-986e-c48f2d3dcb3d).

Both hosting paths exist in check results. This does not prove which serves www.hotkey.gg
today, whether deployment waits for the gate, or that the database deployment works. The
GitHub Pages deployment finished before the main gate on this commit; branch protection and
release coordination need review. Supabase Preview success is not proof of a production
schema deployment. Do not publish a probe change to test the pipeline during the review pause.

## First onboarding and persistence trace

Source inspection supports Wolf's concern about accumulated systems, with an important
distinction between active behavior and retained code:

| System | Evidence | Review implication |
|---|---|---|
| Integrated tutorial | `hkEnterFirstBoard` starts the step controller; navigation defines tutorial/steps metadata | This is the current entry path |
| Older Keyboard Tour | Full tour runtime remains, but `LEVEL1_LIVE=true` hides its one documented replay entry | Retained code is not evidence that users currently see two tours; confirm reachability before removal |
| Lesson cards | Generic `lesson` start-card controller remains; no active lesson metadata found in the sampled catalog search | Inspect all consumers and the unmerged tutorial branch before deleting |
| Tutorial progression | navigation's `nextKey` is autofit, while catalog Foundations order continues to filldr | Two definitions of next lesson; reconcile intent before changing either |
| Teaching state | `hotkey_onboarded`, `hk_guide_*`, legacy tour/lesson keys and their cleanup rules coexist | Test fresh, returning, signed-out, second-account and second-device behavior |
| Saved account state | `nav.js` snapshots achievements/streaks to profiles.client_state, merges some values by max/union, and debounces writes | Trace each progress field; a sync mechanism's existence does not prove all progress persists |
| Teaching-state sync | The inspected client_state snapshot does not include per-drill guide completion | Determine intended device/account behavior and check other save paths before calling this data loss |

This initial trace was source-based. The later audit reproduced sign-out resume and incomplete
leaderboard reads with synthetic local data, and inspected the real sync snapshot. See
[delivery/testing evidence](audit/DELIVERY_TESTING.md). No application behavior was changed.

AGENTS.md provides persistent project instructions, but task conversations are not themselves
the source of truth. [Official OpenAI guidance](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
