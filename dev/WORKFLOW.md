# WORKFLOW.md — how we build hotkey.gg (process standards, v1 · 2026-07-24)

_This is the operating system for every session. PROJECT_CONTEXT.md = what the product is +
the live handoff. PIPELINE.md = WHAT to build next. AUDIT.md = what each round did.
AUDIT_R417.md = the current findings base. THIS file = HOW to work._

## 1 · The operating model: orchestrator + agent fleets

**One session = one orchestrator.** The orchestrator NEVER hand-sweeps the codebase. Anything
that touches many files/drills/strings is BATCH WORK and goes to parallel agents:

| Work shape | How to run it |
|---|---|
| Audit / sweep / inventory (read-only) | 4–8 parallel agents, one domain each, structured-report contract ("your final message IS the report", ranked tables, file:line everywhere) |
| Repetitive multi-site edits (copy passes, realignments, per-drill fixes) | 1 agent per batch of ~10–20 sites, explicit before/after spec, orchestrator reviews the diff |
| One-shot deep builds (a migration, a feature spec) | 1 agent with full source pointers; orchestrator verifies against sources before commit |
| Judgment / synthesis / review / Wolf-facing decisions | ORCHESTRATOR ONLY — never delegated |

Rules of the fleet:
- Every agent prompt names exact files, line anchors, house doctrine to read first, and the output
  shape. Vague prompts produce vague sweeps.
- Agents run in parallel; the orchestrator banks each report to the scratchpad the moment it lands
  (context survives summarization) and only then synthesizes.
- Agent findings are CLAIMS until verified: anything security- or money-adjacent gets re-verified
  by the orchestrator against the live system before it ships (the r417 desk_name_guard regression
  was confirmed against prod before writing the fix).
- Fix-authoring agents edit files but NEVER commit — the orchestrator reviews (signatures,
  semantics vs originals) and commits.

## 2 · The decision protocol (Wolf-facing)

**Questions go to Wolf in chat, directly and immediately — never buried in a doc backlog.**
- Format: the question + 2–4 concrete options + OUR RECOMMENDATION first. Wolf should be able to
  answer in one word.
- Batch questions: end-of-round, one block, not a drip.
- Docs record DECISIONS (with date + one-line rationale), not open questions. An open question in
  a doc is a process failure; it means a session ended without asking.
- Anything visual ships behind a screenshot: render → screenshot → Wolf → build. Never "built it,
  hope you like it" for look-and-feel.
- Standing Wolf-gates (do NOT start without an explicit go): Segment E / launch flips (Stripe live,
  PRELAUNCH_LOCK, BETA_MODE, backdoor removal), pricing, email sending, anything user-visible on
  the live site that changes the product's promise.

## 3 · The round loop (definition of done)

INTAKE → BATCH → VERIFY → SHIP → RECONCILE. A round is DONE only when ALL of:
1. Full local gate green (engine lane when index.html/drills.js touched; smoke+lb otherwise).
2. Cache `?v=` bumped on every touched JS/CSS across ALL *.html (CI-enforced; docs/SQL-only
   rounds skip this).
3. **Every bug class fixed in the round gets a CI invariant in the same PR** (check-invariants.js /
   a new e2e letter / a gate step). No invariant = the bug returns. This is the highest-leverage
   habit this project has (cache-bump, PARS parity, de-hint, membership drift all became guards).
4. PR opened, merged (auto-merge on green), main verified moved.
5. Docs reconciled in the SAME round: AUDIT.md round entry (top), PIPELINE ⚡ header updated,
   findings checked off in the active audit base (AUDIT_R417.md), PROJECT_CONTEXT ⚡ refreshed on
   session end. Stale docs are bugs (the "pipeline never ran" README banner misled sessions for 11 days).

## 4 · Standing engineering rules (consolidated house law)

- **SSOT: derive, don't duplicate.** Where duplication is forced, assert equality in the gate.
  New rule from r417: **diff-before-replace for SQL functions** — before any
  `create or replace function`, diff against the NEWEST prior definition in migrations/ and carry
  every check forward (two silent security regressions came from rewriting off stale copies).
- **Migrations are the only DB channel.** No more dev/migrate-*.sql side-channel; ad-hoc
  Management-API applies are allowed for hotfixes ONLY if the identical file lands in
  supabase/migrations/ in the same round (the r131 house pattern).
- Guides/targets/checks are INDEX-PAIRED contracts (index.html:10397, :8374) — treat array-length
  agreement as an invariant, not a convention.
- Copy law: prompts/labels/descs never embed chords (drills.js metadata INCLUDED — the r417 audit
  found the picker labels re-hinting); checklist lines open with a verb; banned vague verbs
  (box/circle/dress/rule it) per DRILL_DOCTRINE §2.5; US spelling; never promise a HOW the checks
  don't grade.
- Model ID never in commits/PRs/code. Stripe stays TEST until E1. Secrets never in repo or chat
  (tokens pasted in chat → rotate after the session).
- Fetch-first before every round-close (parallel sessions); restart branch off main after merge.

## 5 · Session cadence

- **Session open:** read PROJECT_CONTEXT ⚡ → PIPELINE ⚡ → this file. Pick ONE segment from the
  queue. If the segment is [Wolf], ask the question NOW (chat), build something [auto] while waiting.
- **Batching:** one theme per PR. Mixed-theme PRs make Wolf's review and rollback impossible.
- **Session close:** push everything, update the ⚡ headers, leave zero uncommitted work, list the
  questions Wolf hasn't answered yet at the TOP of PROJECT_CONTEXT's handoff.
- Merge babysitting: subscribe_pr_activity + a ~9-min send_later check-in; on green+clean, squash-merge.

## 6 · The current queue

Lives in dev/PIPELINE.md ⚡ header (segments H1–H8, built from dev/AUDIT_R417.md). One segment ≈
one session ≈ one PR.

## 7 · Token economy (Wolf standing rule, 2026-07-24)

**The balance: token spend must buy Excel-fidelity or gamified-experience quality the player can
feel. Spend where judgment compounds; economize where execution is mechanical.**

- **Model routing:** Fable-tier (session model) for design/spec/judgment work — depth-pass specs,
  curriculum restructuring, engine-behavior decisions, security reasoning, anything touching the
  15.9k-line engine's semantics. Route MECHANICAL batches to cheaper models (`model: sonnet` or
  `haiku` on the Agent call): copy sweeps against a locked standard, drill-page regeneration,
  invariant-check runs, screenshot harness runs, formatting passes, straightforward test execution.
- **Fleet sizing:** one agent per DISTINCT workstream, not per file. No redundant N-agent verify
  passes unless the finding is security-critical or Wolf-visible (then 2-3 skeptics max).
- **Research is spent once:** the depth-pass research + AUDIT_R417 are the findings base — future
  sessions READ them instead of re-auditing. Re-audit only what a change invalidated.
- **Spec-then-execute:** expensive synthesis produces a tight per-drill/per-task spec page; the
  build agent gets the spec, not the research corpus — execution agents never re-derive design.
- **Targeted tests locally, CI is the full gate** (existing house rule — it's also the token rule:
  don't burn agent time on full local sweeps the gate runs for free).
- **Don't gold-plate:** inert-code refactors, cosmetic-only rewrites, and "while I'm here" scope
  creep are the token sinks that bought nothing before (see PROJECT_REVIEW B1/B2 verdicts).
