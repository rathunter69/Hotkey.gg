# Starting and continuing area tasks

Prepared September 17, 2026. This guide supplies task starters and a working method.
[CURRENT.md](CURRENT.md) owns priorities and status; [PRODUCT.md](PRODUCT.md) owns product
decisions. This guide is not a second backlog. The master roadmap conversation stays planning-only.

## Communication and chief discussion — Wolf's September 17 clarification

Every Hotkey session and delegated agent should be concise. Lead with the result and user
impact, then the decision or next step. Prefer a short paragraph or a few bullets. Put detailed
checks, source history and technical evidence in the saved handoff; link to it instead of
repeating it in chat. State material failures and limits plainly. Avoid routine command
narration, repeated unchanged status and large questionnaires. Ask a few connected decisions
at a time and recommend an option. Concision does not excuse incomplete work or missing evidence.

The chief session is also the home for discussion of the project overview, overall design
specification and platform at large. Connect audience and product promise to the learner
journey, modes/paths/progress, visual and interaction principles, access/subscriptions and
roadmap priorities. Keep PRODUCT.md as the shared specification, with confirmed rules and
open choices clearly separated. Area sessions investigate their bounded topics and return
evidence, recommendations and dated user decisions; the chief reconciles cross-area effects.
Do not duplicate the catalog review or start implementation simply because a design is discussed.

## Where to start

Use repository **rathunter69/Hotkey.gg**, handover branch **codex/repository-foundation**.
The same branch contains the application, shared guidance, audits and supporting tooling.
Until this foundation is deliberately integrated, start new work from this branch rather than
main. On another computer, clone/fetch the repository and select this branch; in Codex, use it
as the worktree starting branch. Verify AGENTS.md and this guide exist before editing.
No particular Windows folder or access to the original PC is required.
Create a distinct `codex/<area>` branch from the verified handover commit for each area's work.
Do not commit area repairs directly to the shared `codex/repository-foundation` branch.

The original PC's folder is `C:\Users\Wolfi\OneDrive\Documents\ChatGPT\Hotkey.gg\source`.
Check its actual Git status: a checkpoint saved through the GitHub connection does not itself
advance the local checkout. Reconcile local files with the verified remote checkpoint before
starting another commit; never reset or overwrite unfinished work to make the status look clean.

Read-only agents may work alongside the active editor. Once separate worktrees are ready,
independent implementation can run in parallel with explicit file ownership and an integration
owner. Separate worktrees do not automatically receive later edits to the product brief.

This setup follows the official [worktree guidance](https://learn.chatgpt.com/docs/environments/git-worktrees).
Repository [AGENTS.md](../AGENTS.md) supplies persistent instructions; see the official
[AGENTS.md guidance](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

## Starter prompt for every area

Replace AREA with an exact task name from the table below. The same prompt works for each task.
Alternatively, use one complete prompt from [TASK_STARTERS.md](TASK_STARTERS.md).

```text
This task owns AREA for Hotkey.gg. Start from the current remote handover
branch codex/repository-foundation in rathunter69/Hotkey.gg, or the later
integrated baseline explicitly recorded in docs/CURRENT.md.
Read AGENTS.md, README.md, docs/CURRENT.md, docs/PRODUCT.md, docs/DEVELOPMENT.md,
and docs/TASK_GUIDE.md, then the relevant architecture and audit sections.
Check the actual branch and pending changes. Preserve other work.

Start with this area's first turn in TASK_GUIDE.md. Reuse the audit evidence;
verify what has changed instead of restarting the whole audit. Keep the scope
small and explain the user impact in concise, plain English. Ask only for
product choices or missing facts that materially affect this scope.

Prioritize specialist agents for focused investigation, bounded repairs and
independent review. Match model and effort to the work; avoid duplicate tests
and overlapping edits. Follow the agent workflow in TASK_GUIDE.md.

Finish with what changed or was decided, what was verified, any limits, and
one recommended next turn. Reconcile shared status with its integration owner,
record confirmed product decisions, and commit/push the non-secret continuity
to this task's branch. Verify it on GitHub and include the branch/commit link.
Carry through already-authorized work without asking again.
Do not expand into another area, rebuild the catalog, reset progress, or
deploy or merge main under this starter prompt.
```

The opening task is **Security and accounts**. The first three repair stages remain security,
catalog/progression separation, and cleanup. Git/testing preparation can accompany cleanup or
be brought forward to make handover reliable. Product guidance may proceed read-only alongside
repairs. Starting an area for discussion does not start its later implementation turns.

## First turn and later iterations

The first-turn instructions apply when Wolf starts the selected task. They do not launch work
from this guide automatically. Numbering identifies areas; it is not a fixed daily schedule.

| Area / task name | First turn | Later turns, one batch at a time |
|---|---|---|
| **1. Security and accounts** | Reproduce and repair account-cache isolation, late account responses and sign-out drill reset using synthetic accounts. Keep unrelated permissions/MFA changes separate. | Desk authorization and profile privacy; then complete sign-in, recovery and two-factor verification. Security fixes affecting production need a verified release path. |
| **2. Catalog and progression architecture** | Propose the smallest separation between drills, paths, rewards, certificates and access. Show one example of changing a path without losing old results. Record open choices; no catalog replacement. | Extract one responsibility preserving behavior, then verify a path change and historical results. New reward/access rules need a product decision. |
| **3. Repository and database cleanup** | Identify conflicting active configuration and trace candidate unused files/tables to their actual consumers. Produce a keep/archive/remove list with evidence. | Consolidate one category; reconcile schema and migration history; retire only proven-unused items while preserving data. |
| **4. Git, testing and releases** | Verify the remote handover checkpoint and establish a reproducible test baseline. Prioritize exact dependency installation and isolated database-test setup; identify remaining Git and release blockers. Preserve unrelated work. | Verify local Git access; repair release protections and database delivery; test release/rollback. No live publication under the starter. |
| **5. UI/UX, onboarding and web structure** | Map first visit → recommended lesson → help → result → retry/next lesson. Identify duplicate tutorial behavior and present the few decisions needed. Preserve the ribbon and game workspace. | Repair one agreed journey/page at a time, including truthful save/error states and keyboard access. Align later catalog and onboarding choices. |
| **6. Game engine** | Reproduce and fix the confirmed blank-cell statistical-formula defect with expected Excel results and relevant regressions. Keep grader changes separate. | Range/rounding/lookup/criteria/date defects; then model graders and keyboard fidelity. Accept legitimate alternative solutions. |
| **7. Leaderboards and saved progress** | Trace completion → save/retry → profile → leaderboard. Specify exactly what must persist and which existing rules conflict. Do not reset historical data. | Prevent duplicate saves; complete result reads; handle device sync and history; improve score integrity under agreed competition rules. |
| **8. Desks** | Map current roles, invitations, membership and seats, then identify the intended use cases needing Wolf's guidance. Coordinate with Security's permission repair. | Member workflows, clear failures, paid-seat behavior and end-to-end account/billing integration. |
| **9. Drill catalog and learning design** | Extract Wolf's Foundations feedback and draft representative lesson blueprints and a skill map. Explain guided completion versus independent performance; flag undecided timing/reward rules. No replacement drills yet. | Agree the complete learning plan; build and playtest a small pilot only when authorized; expand after review. |
| **10. Payments and subscriptions** | Map the current scaffold and conflicting access flags. Present the minimum free/paid, billing and account decisions needed; keep checkout inactive. | After billing work resumes: authoritative access, payment events and full purchase/renewal/failure/cancellation tests. |
| **11. Marketing and launch** | Compare current claims with verified behavior and agreed product direction. Draft a factual claims checklist; keep the launch date open. | Positioning, channels, support and launch readiness once the offer and learning experience are settled. |
| **12. LLC, tax and accounting** | Ask for current jurisdiction, entity, ownership, banking and payment-provider facts. Separate known facts from questions for an adviser. | Verify applicable official guidance; establish deadlines, accounting records and business/payment prerequisites. Keep private financial details out of the repository. |

## Evidence and ownership

| Area | Starting evidence |
|---|---|
| Security/accounts | [DATA_SECURITY.md](audit/DATA_SECURITY.md): DATA-05 first, then DATA-01/02/03; [EXPERIENCE.md](audit/EXPERIENCE.md): account states and EXP-08 |
| Catalog/progression architecture | [ARCHITECTURE.md](ARCHITECTURE.md): coupling map and proposed boundaries; [PRODUCT.md](PRODUCT.md): unresolved progress/access/certificate choices |
| Cleanup and delivery | [TRANSITION_REVIEW.md](TRANSITION_REVIEW.md), [BRANCH_INVENTORY.md](BRANCH_INVENTORY.md), [DELIVERY_TESTING.md](audit/DELIVERY_TESTING.md), [DEVELOPMENT.md](DEVELOPMENT.md) |
| UI/onboarding/site | [EXPERIENCE.md](audit/EXPERIENCE.md), including its page-by-page coverage; [ENGINE_CONTENT.md](audit/ENGINE_CONTENT.md): E7 |
| Engine | [ENGINE_CONTENT.md](audit/ENGINE_CONTENT.md): E1–E6; the first turn is E1 |
| Rankings/storage/desks/payments | [DATA_SECURITY.md](audit/DATA_SECURITY.md), [EXPERIENCE.md](audit/EXPERIENCE.md) and the relevant current migrations |
| Catalog learning design | [PRODUCT.md](PRODUCT.md): Foundations source feedback and decisions needed; [ENGINE_CONTENT.md](audit/ENGINE_CONTENT.md): learning assessment; existing branch tutorials before duplicate work |
| Marketing/business | [PRODUCT.md](PRODUCT.md), [EXPERIENCE.md](audit/EXPERIENCE.md): EXP-05/06/07; current user-provided facts |

Security owns initial desk authorization and account isolation. Desks owns the later member
experience. Catalog/progression architecture owns system boundaries; saved-progress work owns
reliable persistence and rankings. The catalog task owns learning content, with dependencies
on agreed engine capabilities and progression rules. UI owns presentation and journeys; coordinate
data-query changes with storage. Payments owns the eventual authoritative paid-access rules.

Shared hotspots are `index.html`, `drills.js`, `nav.js`, `themes.js`, `lb.js`, generated pages,
asset versions, migrations and the shared guidance. Record ownership in the area handoff and
notify the chief, who updates CURRENT.md before overlapping work. A note is coordination,
not a technical lock: if another task is editing the same file,
reconcile with that task before writing. One integration owner handles generation and shared
version updates. Browser suites share port 8791 and must run sequentially unless safely isolated.

## Agents during each iteration

Wolf explicitly prefers agents for continuing audits and fixes. Apply this during active work:

1. The task lead picks one objective and acceptance example, checks current evidence, and owns
   integration. An audit agent can independently inspect the affected dependency or reproduce
   a suspected failure while the lead does useful implementation preparation.
2. Give a repair agent a bounded change and exclusive file ownership when there is useful
   independent work to delegate. Avoid several agents editing the same shared module.
3. For meaningful changes, have a separate reviewer examine failure cases, permissions,
   regressions and adjacent integrations while the lead runs the relevant checks. The reviewer
   reports evidence; it must not silently broaden or rewrite the implementation.
4. Resolve findings within the agreed scope. Record out-of-scope findings in CURRENT.md with
   an owner and priority. After changes to login, progress, catalog or access, include the affected
   cross-page journey in verification. Re-audit the changed boundary, not the entire repository.
5. At a stage handoff, check integration of the accepted batches. Do not call a local fix shipped,
   a passing test exhaustive, or an audit complete while named coverage gaps remain.

Use modest effort and lighter available models for inventories and documentation. Increase effort
for security, payment integrity, data migration and engine correctness. Use the fewest agents
that provide independent value; reuse existing results. Small documentation edits need no agent
team or application test run. This is change-triggered review during active tasks; no unattended
schedule or background monitor is configured by this guide.

## Continuing and handing back

After a completed turn, use:

```text
Continue this area's next agreed batch. Re-read the current shared status,
check for work from other tasks, and use focused agents where useful.
Complete and verify the bounded work, then update the handoff.
```

If the next step is an unresolved product choice, settle it first; silence is not approval.
Do not ask Wolf to reapprove actions already included in the selected scope.

At the end, save the area/owner, branch and starting commit, exact files changed, local versus
committed versus deployed status, checks and limitations, unresolved findings and one next
objective in docs/handoffs/<area>.md on the task branch. Use [the handoff format](handoffs/README.md).
Record Wolf's explicit decisions with date and acceptance example; label proposals separately.
Return its verified remote link and proposed shared-status changes to the chief orchestrator.
The chief owns CURRENT.md and PRODUCT.md updates unless it explicitly delegates one update.
Area reports are evidence, not competing master queues. Independent checkouts must reconcile
the latest shared guidance before the next batch.

Wolf requires remote continuity. Commit/push relevant decisions, findings, validation and next
steps at each handoff, then verify the remote commit and report its link. Use a branch checkpoint
even when work is incomplete, clearly recording what is unfinished. Do not include credentials,
customer data or private financial details. If saving remotely fails, report that the handoff
is still local; do not imply it is available on another computer. GitHub is the durable record;
chat history and ignored local logs are supplementary.
