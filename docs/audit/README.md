# Platform audit — September 17, 2026

The working UI and game foundation are worth preserving. The immediate problems are permissions,
account consistency, spreadsheet correctness and release reliability. Repair those before adding
more systems or reorganizing the whole project.

This is the coordinated audit requested by Wolf: three specialist agents plus the main review.
It covers every main webpage and the major platform systems. Coverage and limitations are listed
below; it does not certify every line, every browser or every live account flow.

## What needs attention first

| Order | Finding in plain English | Evidence and next repair |
|---|---|---|
| 1 | Desk permissions allow users to bypass normal joining rules and assign themselves elevated roles. Desk owners can also change fields that should be controlled by the platform. | Confirmed from live permissions, rules and functions. Restrict direct writes and test member/owner/outsider boundaries in an isolated database. [Data/security](DATA_SECURITY.md) |
| 2 | Profile details intended to stay private are publicly readable, including school information hidden by the display setting and saved account-state fields. | Confirmed from live grants and public-read policy; no users' records were retrieved. Separate public profile fields from owner-only data. [Data/security](DATA_SECURITY.md) |
| 3 | The app offers two-factor setup without a complete second-factor sign-in flow. | Source and live data-access rules do not complete enforcement. Test the full opted-in login, recovery and protected-action sequence before claiming protection. [Data/security](DATA_SECURITY.md) |
| 4 | Account changes can leave the previous player's data behind, and retrying a save can count one completion twice. Progress is not saved consistently across devices. | Local reproductions confirm stale profile data, the wrong drill after sign-out and duplicate completion writes. Define account-owned progress, isolate account changes and make retries preserve one result. [Data/security](DATA_SECURITY.md) |
| 5 | Some spreadsheet formulas give different answers from Excel, and some financial drills accept fixed answers where live formulas are required. | Independent browser checks found failures the existing tests missed. Repair common formula semantics and the affected graders with explicit expected answers. [Engine/content](ENGINE_CONTENT.md) |
| 6 | Leaderboards can lose results when a database response is limited, and some pages hide failed saves or loading errors. | Synthetic response limits and failures reproduce the problems. Page through complete results and make success/error messages truthful. [Data/security](DATA_SECURITY.md), [experience](EXPERIENCE.md) |
| 7 | The release process does not require passing checks, and the latest database deployment failed. | Live GitHub metadata and deployment logs confirm both. Establish a verified release path and repair database deployment before relying on Git to ship safely. [Delivery/testing](DELIVERY_TESTING.md) |
| 8 | The beginner experience is only partly guided, with conflicting next-lesson rules and a large jump in assumed knowledge. | One integrated tutorial is present; subsequent Foundations content assumes substantially more knowledge. Choose one learning sequence before rebuilding content. [Experience](EXPERIENCE.md), [engine/content](ENGINE_CONTENT.md) |
| 9 | Subscription access and launch copy are unfinished or inconsistent. | Checkout remains a scaffold; several public pages retain draft claims/placeholders. Align the offer and public promises after core repairs. [Experience](EXPERIENCE.md), [data/security](DATA_SECURITY.md) |

The permission findings are established by configuration analysis. We did not exploit live
accounts, change production data, enable billing or deploy anything.

## Coverage

| Review | Work covered | Important limits |
|---|---|---|
| [Experience and webpages](EXPERIENCE.md) | Every top-level page, drill library and generated-page template; onboarding, navigation, mobile fit, keyboard access, save/error messages and launch copy | Signed-in checks use synthetic accounts. Real signup/recovery, accessibility with assistive technology and beginner usability sessions remain open. |
| [Engine and content](ENGINE_CONTENT.md) | All 74 catalog demos, existing formula checks, representative alternative paths, independent Excel-result checks, financial grading and beginner progression | A winning demo is not proof of every legitimate solution or every randomized board. Native Excel/Mac comparison and expert review of all financial models remain open. |
| [Database and security](DATA_SECURITY.md) | Live catalog permissions, privileged functions, membership/access boundaries, state syncing, leaderboards, billing integration and local/live function comparison | No live exploit or user-record sampling. Clean database replay, isolated multi-user regression and production Auth/service settings remain open. |
| [Delivery and testing](DELIVERY_TESTING.md) | Source/project identity, local tooling, CI scope, GitHub release metadata, latest database deployment and public response headers | Exact pinned dependency installation, complete CI run, local Git sign-in, hosting origin settings and a deployment rehearsal remain open. |

The 54 live database function bodies match the repository apart from one explanatory comment,
and both deployed service-function sources match. This is useful continuity evidence; full
schema/configuration parity and a clean database rebuild remain to be tested.

## Work already repaired

- The shared browser runner now sends each test to the correct page.
- The onboarding, leaderboard and demo harnesses touched in this pass explicitly prevent live
  Supabase access; the onboarding audit blocks all outside requests.
- Current guidance records the development pause, agent ownership and economical model choices.

All seven static checks, all 86 existing onboarding assertions and all five smoke commands
passed. Additional engine results are recorded in their report. Independent checks still
found the defects above; passing the old tests does not close those findings.

Application behavior and database settings remained unchanged during the audit. The audit and
tooling edits were initially local; the subsequent handover checkpoint preserves them on
`codex/repository-foundation`. See CURRENT.md for active status and TASK_GUIDE.md for starting work.

## Cleanup decisions

| Keep | Repair | Review before retirement | Wolf's guidance needed |
|---|---|---|---|
| Ribbon, game workspace, general visual style, keyboard focus and useful existing drills | Permissions, account boundaries, save/load consistency, formula results, grading, errors and release checks | Hidden Keyboard Tour, generic lesson-card code, old entitlement flags, historical catalogs and assistant instructions | Starting-path customization, beginner pacing, what guided work earns, free/paid access, supported keyboards, desk scope and launch promises |

Old code should be removed only after checking its runtime, test, generator and documentation
consumers. Retain historical plans as references until their active dependencies are addressed.

## Working sequence

This was the audit's recommended sequence. Wolf's later chosen batches and task ownership in
[CURRENT.md](../CURRENT.md) take precedence. Security's first selected batch is account isolation;
desk authorization and privacy remain high-priority work owned by that same task.

1. Make the verified security and account defects reproducible in an isolated test environment.
2. Repair them in bounded changes, with explicit passing evidence and a reviewed release path.
3. Fix the confirmed engine, grading and failure-message defects while preserving the UI.
4. Work through the product guidance in [PRODUCT.md](../PRODUCT.md), using this evidence to
   choose one onboarding, progress and subscription contract.
5. Remove confirmed dead systems and extract responsibilities gradually. Resume new features
   when Wolf is confident in the repairs and agreed guidance.

The active queue stays in [CURRENT.md](../CURRENT.md). This report records audit evidence and
repair order; it does not restart the parked launch timetable or authorize feature development.
