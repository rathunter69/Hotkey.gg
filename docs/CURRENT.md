# Current project state

Updated 2026-09-17. Source baseline: remote `main` verified with `git ls-remote` at
`434bc0e8764e741e0e11f84cf51d61a1755d7c67` (PR #250 merged, 2026-09-05).
Repository evidence is supplemented by the read-only Supabase inventory in
[TRANSITION_REVIEW.md](TRANSITION_REVIEW.md). Production website and billing remain unverified.

## Active objective

**Master planning and shared context only; repairs belong in dedicated area tasks.**
Wolf's latest September 17 instruction is to establish confidence in the inherited code and
setup, and to provide clear guidance across every part of the platform before moving forward.
The earlier October 1 launch schedule is parked. Subscriptions at launch and customized
onboarding remain future requirements. See [PRODUCT.md](PRODUCT.md) for the guidance review.
Handover branch: `codex/repository-foundation` in `rathunter69/Hotkey.gg`.
Wolf requires continuity on GitHub so work can resume without this PC. This checkpoint contains
the shared guidance, audit, task starters and existing foundation tooling. The baseline main
commit above describes the application reviewed, not the tip of the handover branch. Use this
branch's current remote commit when starting another task, and verify the guidance files exist.
Saving a checkpoint does not establish that it is merged, deployed, or fully CI-validated.
Remote checkpoint verified September 17: `d3b244fe62d7d57de73845e2cabe7a0166aa02d0`.
Five reviewed commits preserve all 41 selected entries: guidance, twelve starters, audit evidence,
reusable synthetic reproduction, existing foundation tooling and historical-status corrections.
Remote blob hashes matched every saved file and both intended cache-file deletions; main remained
at `434bc0e8764e741e0e11f84cf51d61a1755d7c67`. This status note is saved in a subsequent commit;
use the branch tip for the latest guidance. No application repair, main merge or production
deployment was performed. Exact pinned installation/full CI remain unverified as described below.
This task is the chief orchestrator for priorities, cross-area product decisions and handoff
integration. [TASK_STARTERS.md](TASK_STARTERS.md) contains all twelve prompts. Area tasks maintain
their own reports under docs/handoffs/ and return verified remote links. They propose changes
to CURRENT.md/PRODUCT.md; the chief integrates them or explicitly delegates one update.

The existing foundation is sufficient to begin scoped local repairs and product guidance.
Remaining enabling work: exact pinned dependency/CI verification, isolated database permission
and migration tests, and a working reviewed release/rollback path. These belong to Git/testing
with Security support; they do not require a new frontend framework or another general audit.
No production security repair or billing activation should rely on those unverified release steps.
Wolf's latest clarification reserves this conversation for the overarching plan, roadmap and
context. The first account-repair agent was stopped before editing any files; no repair or test
process remains running. Prepare the task breakdown here; do not launch implementation from it.

The foundation change adds the README and source map, marks old handoffs as historical,
inventories all 14 non-main remote branches, and introduces shared local/CI check commands.
All seven static checks passed again September 17. The local runner's wrong-page defect was
repaired; all 86 onboarding assertions and all five smoke suites passed using the bundled
Playwright 1.62.1 and installed Chrome 152. The pinned 1.49.1 installation and full CI gate
remain unverified locally. See [platform audit](audit/README.md) for detailed coverage.
No product behavior, database records, billing settings or deployments were changed.
Wolf explicitly requested parallel audit agents. The first coordinated experience/pages,
engine/content, data/security and delivery/testing pass is complete, with evidence and remaining
coverage gaps in the linked audit. Existing checks passed; independent probes found defects.
Task-appropriate model/effort choices and avoiding excess usage are now recorded in AGENTS.md.
Wolf's subsequent clarification keeps drill/mode/path interactions open for improvement while
preserving the visual foundation. Catalog changes forcing progression/achievement changes are a
specific cleanup concern. ARCHITECTURE.md now maps those dependencies and proposes separation;
no catalog replacement, progress reset or interaction redesign has been implemented. Wolf now
prefers a future full catalog rebuild with his Foundations feedback preserved, after an agreed plan.

## Wolf's chosen repair sequence

1. Small security/account fixes. Proposed first dedicated-task batch: clear the actual last-drill key on sign-out,
   bind profile caches to the account and prevent late responses from repainting another account.
   Verify with synthetic users; no production deployment is part of this batch. Not started.
2. Separate catalog, paths and progression while preserving current behavior. Agree explicit
   links to rewards, access, certificates and saved history before changing their rules.
3. Clean the repository and assess database tables for actual use. Check application readers,
   server functions, scheduled jobs, migrations and historical records before archiving/removing.
   A crowded Git page or old table name alone is not evidence that something is unused.
4. Work on the site's structure and interactions using the clarified product brief.
5. Rebuild the catalog only after the full learning/content plan is agreed. Preserve original
   Foundations feedback; do not execute the historical v5 waves by default.

Timing, initial assessment, paid boundaries and certificate standards are recommendations/open
choices in PRODUCT.md. Assisted completion without XP and freely explored basics with recommended
paths are the current learning direction; no gameplay rule has been switched.

## Active review sequence

1. **Complete:** Wolf made `source/` primary; the project tool confirms the path and Git repository.
   Project identity and conversations are preserved. Verify Git sign-in and publishing separately.
2. Establish the baseline: preserve unfinished changes, identify branch/source provenance,
   restore runnable checks, and separate actual defects from unfinished or proposed features.
3. Review each area against code, existing tests and relevant live configuration. Report
   evidence, impact and uncertainties in plain English. The first inventory is not the full audit.
4. Work through the guidance review in PRODUCT.md with Wolf. Identify preferences to keep,
   retired behavior that must stay retired, contradictions and open choices.
5. Repair demonstrated defects and setup problems in small, reviewable changes with relevant
   verification. Keep redesigns, new features, broad refactors and deployments outside this phase.
6. Present the review coverage, repair results, remaining risks and agreed product brief.
   Wolf decides when confidence is sufficient to resume development and revisit the schedule.

Primary folder verified: `C:\Users\Wolfi\OneDrive\Documents\ChatGPT\Hotkey.gg\source`.
Git remote remains `https://github.com/rathunter69/Hotkey.gg.git`. A read of remote main succeeds;
the local simulated push failed because local Git has no sign-in. The GitHub connector reports
push permission, but that connection does not itself sign in command-line Git.
Git Credential Manager login was attempted; the first request failed at the network layer,
and a second displayed a device code but then also failed with a transport timeout. Neither
completed sign-in. Do not reuse the code or mark Git publishing ready until a new sign-in
and simulated push succeed.
Wolf reported completing browser approval, but the next dry run still had no local credential.
A fresh attempt with proxy environment variables removed also could not connect to GitHub
on port 443. Further agent-side retries stopped. Next setup step: user runs
`git credential-manager github login --username rathunter69 --browser` in their own terminal,
then the agent repeats the noninteractive simulated push. Never request a token in chat.
Current-main checks include successful gate, GitHub Pages and Cloudflare Pages results.
Live branch metadata reports main unprotected with no required checks; repository rulesets
are empty. The public website responds through Cloudflare with the expected security headers,
but origin/build settings still need verification. The latest observed Supabase deployment
(September 3, run 33814362058) failed linking the project because the access token format was
invalid; migrations/functions were skipped. No newer Supabase run appeared in the newest 100
workflow runs. During that audit, no push, commit, merge, deployment or secret change was performed.
The subsequent handover checkpoint uses the GitHub connector because command-line Git on the
original PC still cannot connect. This does not fix its local Git sign-in or advance its local
branch automatically. Compare remote/local content before resuming there; preserve pending work.

## What is implemented

- 74 catalog drills in eight chapters. `drills.js` defines membership; `index.html` implements them.
- An integrated steps/guide tutorial for `navigation`; other proposed Foundations tutorials are
  not all present on main.
- Spreadsheet simulation, drill scoring, guides, demos, alternate routes, progression, ranks,
  player cards, leaderboard pages, desks, certificate tracks, analytics and account surfaces.
- Premium presentation is disabled (`HOTKEY_PREMIUM.enabled=false`); client PRO perks use
  `HOTKEY_PRO.freeNow=true` / `PRO_PERKS_FREE=true`. Some server-side desk features have their own gates.
- Stripe checkout is a test-only scaffold. Billing/entitlement integration and the subscription
  webhook remain incomplete. Do not equate the displayed pricing with a working purchase flow.
- GitHub Actions defines browser checks and a separate Supabase deployment workflow. Live
  Supabase migration versions were inventoried September 17: 52 local versions are present,
  with nine additional live records. All 54 database function bodies match local source apart
  from one comment; both deployed Edge Function sources match. Whole-schema/configuration
  parity and migration replay remain unverified. The connected Supabase project reports healthy.

## Plans are separate from shipped content

| Material | Role now |
|---|---|
| `drills.js`, `index.html`, current migrations | Implemented application source |
| `dev/CURRICULUM_V5.md`, `dev/curriculum-v5.json` | Proposed 61-drill rebuild; not the runtime catalog |
| `dev/gen/curriculum_v51_data.py`, `curriculum_v51_map.py` | Editable sources for the v5.1 proposal |
| `dev/curriculum-v3.json` | Earlier proposed map, still consumed by a CI check and the v5 generator |
| `dev/curriculum-v4.json` | Skill-family reference still consumed by the variety guard |
| `dev/CURRICULUM_V5_PHASE_A.md`, `dev/ROADMAP.md` | Prior rebuild sequence; reconcile before executing waves |
| `dev/DRILLS_WOLF_LIKED.md`, `dev/DRILL_DOCTRINE.md`, `dev/MODELING_STANDARDS.md` | Product feedback, drill-design and financial-realism references |
| `art/` | Prototypes and assets; file presence does not mean a design is wired into the app |
| `PROJECT_CONTEXT.md`, `dev/CONTINUITY.md`, `dev/PIPELINE.md`, `dev/WORKFLOW.md`, older audits | Historical context; not independent active queues |

Keep the v3/v4 files until their actual consumers are migrated. Moving them into an archive today
would break tooling. The v5 map passing validation means its plan is internally consistent; it
does not mean its drills or required engine features exist.

## Unmerged work to reconcile

`origin/claude/platform-improvements-roadmap-ycogch` at `1703b59324af098f252b8b4dcd8d3fd859338197`
contains four branch-only commits dated September 5–6. They add progression instrumentation,
`entrybasics` and `ribbonways` tutorials, and another Foundations sequence. Its `dev/REFINE_PHASE.md`
describes keeping the existing catalog and refining progression, which conflicts with the 61-drill
rebuild proposal. This is a substantive alternative, not merely old documentation.

Review those drills and instrumentation against main before implementing overlapping work. A bulk
merge would also bring catalog/certificate changes, generated pages and edits to an existing
migration; reconcile intended behavior and use a new migration for any database change.

[Branch inventory](BRANCH_INVENTORY.md) records the other branch tips. An ancestor branch is
contained in main. A divergent branch may contain squash-merged or superseded work; commit counts
alone cannot determine whether to restore or delete it. No remote branches were deleted.

## Parked launch proposal — not the active queue

The dated proposal below is retained as history. Do not execute it during the review pause.

| Dates | Work | Completion evidence |
|---|---|---|
| Sep 17–19 | Complete ingestion by area, fix project-root setup, preserve foundation changes, restore browser checks; settle launch offer and onboarding choices; confirm business/Stripe readiness | Agreed scope, one shared brief, runnable baseline, explicit business blockers |
| Sep 20–23 | Implement subscriptions and server-verified access; review Supabase permissions and migration differences; polish the first learning path | Test purchase gives the right account access; guided onboarding and saved progress work |
| Sep 24–26 | Finish the selected launch drills, UI and website; validate cancellation, renewal, failed payment and account recovery | End-to-end test results; representative users complete the loop without assistance |
| Sep 27–29 | Freeze features; test permissions, scoring, cross-account isolation, supported keyboards, deployment and recovery; finish legal/support/marketing materials | No unresolved release blockers; complete payment lifecycle and production rehearsal |
| Sep 30–Oct 1 | Final review and controlled paid launch | Verified live configuration, approved real payment test, support and recovery ready |

When development resumes, revisit dependencies and dates with Wolf. Retain the paid-launch
requirement unless he changes it; do not silently substitute a free launch.

Recommendation: preserve working catalog content, improve the first experience, and fix
launch-critical defects. Defer the wholesale 61-drill rebuild, major engine expansion, broad
file reorganization, and optional new desk/identity features until evidence justifies them.

## Separate task ownership

This task owns the master plan, priorities and shared decisions, with no application implementation.
Separate workstream tasks have not been created. The table below proposes small turns for those
tasks; Wolf chooses which to open and its scope. Do not auto-start implementation from these briefs.
The saved project's primary folder is now correct. [TASK_GUIDE.md](TASK_GUIDE.md) supplies the
copyable starter, first-turn scopes, evidence links and agent workflow. Start from the remote
handover branch named above until it is deliberately integrated; a fresh worktree from main
lacks this guidance. One editor at a time per shared file, with one integration owner for
CURRENT.md and PRODUCT.md when tasks overlap. Area tasks must save their handoffs to GitHub.

Current implementation ownership: **none**. No application repair is running. New tasks must
record their active objective and file ownership in their area handoff and notify the chief
for this shared record; release the reservation on completion or pause. This note coordinates
work and does not enforce a filesystem lock.

| Dedicated task | Problem to address | Suggested turns |
|---|---|---|
| Security and accounts | Account-state leaks, public profile metadata, desk permission gaps and incomplete two-factor enforcement | Account isolation → permissions/privacy → login, recovery and two-factor verification |
| Catalog and progression architecture | Drill changes force changes to paths, achievements, access and certificates | Agree stable links → separate responsibilities preserving behavior → verify existing progress survives |
| Repository and database cleanup | Conflicting historical guidance/configuration and uncertain unused files/tables | Trace actual usage → consolidate/archive safely → reconcile database history and definitions |
| Git, testing and releases | Weak release protections, failed database deployment and tests that miss real defects | Reproducible local checks → repair delivery setup → verify a safe release/rollback process |
| UI/UX, onboarding and web structure | Overlapping tutorials, abrupt difficulty, misleading messages and inconsistent journeys | Agree page/mode/lesson flow → repair one journey at a time → keyboard and accessibility checks |
| Game engine | Incorrect formula results and grading that accepts disconnected model answers | Formula correctness → realistic model grading → alternative-route and keyboard regression checks |
| Leaderboards and saved progress | Incomplete rankings, duplicate saves and inconsistent progress across devices | Agree what is saved/counts → reliable saves/history → rankings and score integrity |
| Desks | Membership, invitations and paid-seat behavior need one coherent set of rules | Agree desk roles/use cases → repair workflows → verify integration with access and billing |
| Drill catalog and learning design | Rebuild direction is undecided; useful Foundations feedback must survive | Preserve feedback and agree learning map → review lesson blueprints → pilot a small set before expanding |
| Payments and subscriptions | Checkout is a test scaffold and access/pricing rules conflict | Agree free/paid offer → connect payment and access → test full subscription lifecycle |
| Marketing and launch | Public claims and readiness are inconsistent | Align claims to agreed product → launch/support plan → release-readiness review |
| LLC, tax and accounting | Business and payment prerequisites remain unknown | Establish jurisdiction/entity facts → verify obligations and deadlines → banking/accounting readiness |

Start with security/accounts, then catalog/progression separation and cleanup, as Wolf requested.
Delivery work can accompany cleanup. Site flows and engine accuracy inform the catalog plan;
catalog implementation waits for agreement. Business fact-finding can happen early because it may
block payments; billing activation and the launch date remain separate decisions. Security owns
the initial desk authorization repair; the Desks task owns the later member experience and rules.

Each task reads AGENTS.md, PRODUCT.md and this file, then inspects its relevant sources.
Start with assessment before edits. Record evidence and proposals separately. Use one bounded
change per review, and reserve shared files before concurrent edits. Tasks do not independently
rewrite the product brief or execute an old roadmap. Bring accepted decisions back here.
Wolf now prioritizes specialist agents for ongoing audits and fixes during active iterations.
Audit the changed boundary, delegate bounded repairs, and independently review meaningful
changes while the lead verifies integration. Avoid duplicate full audits and overlapping editors.

## Launch acceptance — all pending

- Account signup, verification, sign-in, password reset, deletion and sign-out isolation.
- Customized onboarding, a complete first lesson, understandable results and a useful next step.
- Tested launch catalog; realistic, correct spreadsheet results and alternative keyboard routes.
- Progress restored after refresh, reconnection and a second device; valid leaderboard rules.
- Subscription purchase, authoritative access, billing management, renewal, failed payment,
  cancellation and duplicate/delayed payment-event handling.
- Guest/owner/other-user/admin security tests, current secrets and permissions, migration parity.
- Agreed Windows/Mac/browser support tested; mobile messaging and basic keyboard accessibility.
- Production hosting, error visibility, backups/recovery and rollback verified.
- Current business identity, support contacts, terms, privacy and accurate pricing/marketing.

## Decisions and next action

Confirmed September 17: paid subscriptions on launch day; paths customized during onboarding.
Latest decision: pause new development and refinement until Wolf is confident in the existing
code, setup and guidance. The primary project folder is corrected and browser baseline restored.
Next in this task: coordinate the written task scopes and integrate their remote handoffs.
The foundation is saved and verified on GitHub. Open Security/accounts first, with Git/testing preparation alongside it under
separate file ownership. Continue outstanding product guidance here; repairs belong in the
selected dedicated tasks. Git sign-in remains a
separate setup task and must not block read-only review.
Wolf's preserve/change guidance is recorded in PRODUCT.md. Pricing, onboarding dimensions, launch catalog,
supported platforms and current business status remain open. No replacement deadline is set.

## Known baseline issues

- The platform audit records verified desk permission bypasses, publicly readable profile
  metadata, incomplete MFA enforcement, account-state and duplicate-save defects, incomplete
  leaderboard reads and false success/error messages. Independent engine checks found incorrect
  formula results and financial graders accepting disconnected answers. These take precedence
  over structural cleanup and new features; no application/security repair has yet been applied.
- The variety guard emits 39 warnings on the current catalog; strict mode is intentionally off.
- `nav.js`'s `hkFlagPro` reads retired `HOTKEY_PRO.beta` while the current config defines `freeNow`.
  Repair in a separate entitlement-consistency change with focused coverage.
- Historical docs mention a failed Supabase deployment token and other operational follow-ups.
  Verify current service state before treating those dated notes as active incidents.
- Large inline scripts, shared globals and mixed responsibilities remain. This foundation change
  prepares their extraction; it does not claim to complete that architectural work.

## Updating this file

Record the source commit, implemented change, validation and next discrete objective when work
lands. Use Git commit IDs and PRs for provenance. Do not append another competing "LIVE" section
to the historical handoff documents.
