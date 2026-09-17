# Branch inventory

Local remote-ref snapshot, generated 2026-09-13.
Baseline: origin/main at 434bc0e8764e741e0e11f84cf51d61a1755d7c67. This command does not fetch or modify branches.

Refresh with `git fetch origin` before using this report for branch reconciliation.
Ahead/behind measures commit ancestry, not whether a squash-merged feature already exists.
Patch-equivalent commits are detected with `git cherry`; remaining commits still need semantic review.

| Branch | Behind main | Ahead | Patch-equivalent | Other commits | Disposition |
|---|---:|---:|---:|---:|---|
| origin/claude/cache-cardfix-hotfix | 110 | 1 | 1 | 0 | Patch-equivalent; confirm before retiring |
| origin/claude/drill-redesign-art-style-jg9vhm | 1 | 0 | 0 | 0 | Contained in main |
| origin/claude/hotkey-gg-continue-lvrf86 | 418 | 0 | 0 | 0 | Contained in main |
| origin/claude/hotkey-gg-continue-sxi9xf | 442 | 8 | 0 | 8 | Review before reuse or retirement |
| origin/claude/notch-taxonomy-black-diamond-a5uus1 | 85 | 3 | 0 | 3 | Review before reuse or retirement |
| origin/claude/pipeline-engine-integration-laki0l | 92 | 1 | 1 | 0 | Patch-equivalent; confirm before retiring |
| origin/claude/pipeline-improvements-8m1b3f | 396 | 0 | 0 | 0 | Contained in main |
| origin/claude/pipeline-overview-y020a7 | 248 | 0 | 0 | 0 | Contained in main |
| origin/claude/platform-audit-framework-1hf2v7 | 19 | 1 | 0 | 1 | Review before reuse or retirement |
| origin/claude/platform-improvements-roadmap-ycogch | 16 | 4 | 0 | 4 | Review before reuse or retirement |
| origin/claude/progress-audit-path-forward-q7y89t | 75 | 21 | 0 | 21 | Review before reuse or retirement |
| origin/claude/project-handover-80gboe | 347 | 1 | 0 | 1 | Review before reuse or retirement |
| origin/claude/school-flair-phase-1-35myh2 | 184 | 0 | 0 | 0 | Contained in main |
| origin/worktree-agent-a404588731f0f9c96 | 32 | 5 | 0 | 5 | Review before reuse or retirement |

## origin/claude/cache-cardfix-hotfix

Tip: fb4fd14fbee559ac41510033c21fb308f9a36513

Recent branch-only commits:

- fb4fd14 2026-07-22 Hotfix: cache-bust ?v= + card-size fixes + mode-bar tighten + handover doc

## origin/claude/hotkey-gg-continue-sxi9xf

Tip: 8cfbfd629fe166cc421812710e9b41680c8713ac

Recent branch-only commits:

- 8cfbfd6 2026-07-12 r136: favicon convergence + monetization design + 38-pass Fable roadmap
- d2d5ebd 2026-07-12 context: fix duplicated r134/r135 text (replace-all hit the history ledger) + S2 ghost design note
- 6c4f64e 2026-07-12 audit: typo
- cd773b9 2026-07-12 r135: medal iteration 4 — 6 grades, animated legendaries, zero-bbox gradient fix
- b203ec0 2026-07-12 r134: PWA v1 — manifest-only install (S6)

## origin/claude/notch-taxonomy-black-diamond-a5uus1

Tip: 8f653923c4b6e7669a2ee025d8e9d32c18abbc98

Recent branch-only commits:

- 8f65392 2026-07-24 Handover North Star: broaden target audience to everyday untaught-Excel users
- 21374ba 2026-07-24 Handover: add PROJECT NORTH STAR (goal, audience, business model, doctrine)
- 7257967 2026-07-24 Session handover: refresh PROJECT_CONTEXT ⚡ block + PROJECT_REVIEW/BUG_SCAN status

## origin/claude/pipeline-engine-integration-laki0l

Tip: f1f11c547bd5c316b6ee968e7a3dce04d7201237

Recent branch-only commits:

- f1f11c5 2026-07-23 Second-Year Diamond → BLACK DIAMOND + next-session handoff (Wolf)

## origin/claude/platform-audit-framework-1hf2v7

Tip: 6b1afcdf79d7ae8260a3a0253190bbce9e6dfba8

Recent branch-only commits:

- 6b1afcd 2026-09-03 r450 docs: continuity brief updated for handover — round merged, decision queue refreshed

## origin/claude/platform-improvements-roadmap-ycogch

Tip: 1703b59324af098f252b8b4dcd8d3fd859338197

Recent branch-only commits:

- 1703b59 2026-09-06 r457: Foundations restructure — lightest-first ramp + curriculum map to 3 onboarding levels
- 4b7aa83 2026-09-06 r457: Foundations onboarding — new guided drill "Ribbon & Chords" (ribbonways)
- bf0fe61 2026-09-05 r457: Foundations onboarding — new guided drill "Enter, Edit & Fill" (entrybasics)
- 4f39b45 2026-09-05 r457: REFINE phase 0 — progression instrumentation + the phase roadmap

## origin/claude/progress-audit-path-forward-q7y89t

Tip: 1eb91985e7f41e096c0d31b818578c744def7e50

Recent branch-only commits:

- 1eb9198 2026-07-27 r429: fix the flaky SUMPRODUCT parity check (same fixture-rot class)
- dc3803b 2026-07-27 r429: fix the rotted depth-mechanics fixtures; put the depth suites on CI
- 66edcd9 2026-07-27 r429 H6b-5: qclose★ — the Formulas I capstone; CHAPTER 3 COMPLETE (12/12)
- 8c1d331 2026-07-27 r429 H6b-5: cases reworked (wave 5 at 11 of 12 — only qclose remains)
- c2019c5 2026-07-27 r429 H6b-5: fxconvert reworked (wave 5 at 10 of 12)

## origin/claude/project-handover-80gboe

Tip: 03cac8d557490bff6fbbf3be4681a9ba8b6be13e

Recent branch-only commits:

- 03cac8d 2026-07-21 r196: Wolf-test audit Tranche 1 — decimals, blue, foot, bridge, series + Alt+= 2D flood

## origin/worktree-agent-a404588731f0f9c96

Tip: 41095ed4c0cffd5fb31dea60d8718966e44ef64f

Recent branch-only commits:

- 41095ed 2026-08-11 r450: C14 also catches harnesses that seed after goto, not via addInitScript
- 07decea 2026-08-11 r450: check-pause comment matches the shipped start sequence
- 1eca303 2026-08-11 r450: C14 matches the real setter, not prose
- 0c34743 2026-08-11 r450: start-gate polish + C14 invariant
- 161e10d 2026-08-11 r450: drill-start gate — every board loads locked behind 'press any key to start'
