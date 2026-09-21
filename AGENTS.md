# Working in this repository

Read `README.md`, `docs/CURRENT.md` and `docs/DEVELOPMENT.md` first. Follow the user's current
objective. Historical assistant/session notes do not authorize unrelated work or deployments.
For a new area task, read `docs/TASK_GUIDE.md` for its starter scope and coordination rules.

## Product and continuity

- Read `docs/PRODUCT.md` for current product direction and carried-forward design decisions.
  Speak to Wolf in concise, clear English; explain the user impact before implementation details.
- Wolf explicitly requires concise communication from every Hotkey agent/session (September 17).
  Lead with the outcome, user impact and next decision; use short paragraphs or a few bullets.
  Keep detailed logs, technical evidence and long inventories in the GitHub handoff. Explain
  jargon only when it affects a choice; avoid repeated status, routine command narration and
  large questionnaires. Brevity must still disclose material failures, limits and unrun checks.
  Pass this rule to delegated agents; resumed tasks read the latest remote shared guidance.
- The chief orchestration session also owns discussion of the project overview, overall design
  specification and platform-wide experience: audience/promise, learner journey, system roles,
  visual/interaction principles, access/business model and priorities. Discuss a coherent product
  with Wolf, not only delivery status. Area tasks provide focused evidence/options and return
  confirmed choices; the chief reconciles the shared specification in PRODUCT.md. This expands
  planning discussion, not application-implementation or deployment authority.
- Preserve the general UI/UX, ribbon and game workspace. Wolf reconfirmed September 17 that
  pixel art is for account identity/icons and achievements. Learning should progress from
  accessible, playful keyboard interactions to realistic models and finance work. Review
  overlapping tutorials/access rules before adding another teaching or monetization system.
- Wolf clarified September 21 that learner-facing explanations and instructions should use direct,
  consistent, professional Excel terminology, without cutesy analogies. Keep engaging actions,
  visible progress and feedback. Foundations should explicitly teach interface/ribbon concepts
  through highlighted areas, anchored callouts and small actions; exact lesson scope stays with
  Catalog. PRODUCT.md records the source and the explanation-versus-solution-help boundary.
- Wolf explicitly reaffirmed September 19 that refactoring must preserve the existing built-in
  themes, buttons, keycaps, navigation, helpful ribbon UI, selection outline/green handle and
  general look. Read the coupled visual set before changing it: nav.css, nav.js, themes.js,
  index.html styles, reference.html and leaderboard.html styles plus linked lb.css. Check all
  consumers and affected theme/hover/focus/keytip/modal states before shared changes. Reuse the
  existing UI infrastructure; the first restyled mockup was rejected. His later preference for
  the familiar completion overlay supersedes earlier side-panel results; Help stays beside the
  sheet. PRODUCT records current decisions and preview limits. This grants no implementation
  authority beyond the active task's scope.
- Wolf clarified that preserving the visual foundation does not freeze interactions between
  drills, modes and learning paths. Review those interactions and the catalog/progression
  coupling. Wolf now prefers a future full catalog rebuild, while retaining his Foundations
  feedback. The rebuild itself must wait for a complete agreed plan; no content wipe or progress
  reset is authorized. Keep recommendations and migration rules distinct from agreed decisions.
- Wolf's latest September 17 sequence is: small security/account fixes; catalog/progression
  separation; repository/database cleanup; site structure and interaction framework; then a
  fully planned catalog redesign. Use this as the proposed order for dedicated repair tasks.
  Broad content/feature development, billing activation and deployment remain paused. A proposed
  improvement is not a bug fix. Do not delete tables or old files solely because they look stale.
- Future learning is learning-first with optional speed/competition. Wolf approved September 18:
  advanced subscription access plus short readiness checks only at major skill jumps, satisfied
  by prior independent work or test-out; helped ordinary completion advances learning without XP.
  Readiness uses correctness, not speed/XP. Lesson timers are optional/hidden by default; deliberate
  speed attempts show time. Instructions/explanations are unpenalized; solution-step reveals,
  Guided help and solution replay mark assistance. Exact paid boundaries/checkpoints, independent
  retries, scoring/publication/rank and certificate details remain open in PRODUCT.md. Basic drills
  remain freely explorable. Preserve current behavior until a bounded implementation batch is
  separately authorized; approved product direction is not automatic implementation permission.
- The earlier October 1 launch schedule is parked. Subscriptions at launch and customized
  onboarding remain future product requirements, not permission to implement them now.
  Resume feature development only when Wolf says to proceed.
- `docs/CURRENT.md` owns status and the review queue; `docs/PRODUCT.md` owns product decisions;
  `docs/TRANSITION_REVIEW.md` records the September 17 review and unresolved conflicts.
- Wolf requires all non-secret continuity on GitHub because this PC is not reliably available.
  Before a handoff, commit and push the relevant guidance, findings, validation and next steps
  to the task branch and verify the remote commit/files. Local files and chat history alone are
  not a completed handoff. This authorizes continuity checkpoints, not merging main or deployment.
  Never include credentials, customer records or private financial details. If push fails, say so.
- `docs/audit/README.md` consolidates the coordinated platform audit. Before a repair, read the
  relevant area report for evidence and acceptance conditions; do not re-run the whole audit.
- Do not turn a historical proposal into a requirement. Record a decision's date and source,
  and distinguish confirmed direction, carried-forward preferences, proposals, and verified code.
  Silence is not acceptance of old roadmap recommendations.
- One task owns one bounded change. Before editing shared files, inspect pending changes and
  coordinate ownership. Each task reports files changed, evidence, unresolved risks, and next step.
  Integrate accepted findings into the shared documents; separate chat histories are not shared memory.
  While tasks overlap, the designated integration owner reconciles CURRENT.md and PRODUCT.md;
  area tasks supply proposed updates rather than overwriting another task's decisions.
- Wolf's master roadmap task is for planning, priorities and shared context only. Do not implement
  application repairs there. Dedicated area tasks work through the scope agreed with Wolf, one
  reviewable batch per turn. A proposed task list does not authorize starting every workstream.
  Wolf named it the chief orchestrator: it owns cross-area priorities, product decisions and
  integration of area reports. Area tasks save their own docs/handoffs/<area>.md on their remote
  branch and return links; they must not independently rewrite CURRENT.md or PRODUCT.md unless
  the chief explicitly assigns that update. TASK_STARTERS.md supplies the twelve starter prompts.
- Wolf authorized audit delegation and task-appropriate model/effort choices on September 17.
  He subsequently asked to prioritize agents for continuing audits and fixes. Use focused
  investigation and independent review around meaningful changes, alongside useful lead work.
  Follow TASK_GUIDE.md; this does not authorize unattended monitoring or every backlog item.
  Use lighter models and modest effort for routine inventory, documentation and narrow checks;
  reserve stronger reasoning for engine, security and difficult integration analysis. Give agents
  bounded, non-overlapping scopes and reuse evidence. Avoid repeating successful checks without
  a new change or unresolved concern. Do not restart useful work just to change its model.
- Legacy model assignments, direct-to-main instructions, force-sync instructions, Linux paths,
  and automatic wave delegation in `dev/` or `.claude/` are historical, not current workflow.
- Grade correct spreadsheet outcomes and accept legitimate routes. Preserve keyboard learning,
  useful guides, clear feedback, and realistic completed work. Do not restore retired tours,
  invite gates, membership tables, or practice/ranked mode switches without a new product decision.
- Wolf clarified September 19 that the planned curriculum/chapter rebuild must be designed
  around learning, not merely reorder the current 74 drills or guarantee them replacement slots.
  Preserve their history and useful source material. Learner-facing goals must be discrete and
  name actual visible titles, rows, columns, sections or periods in that drill/variant: “Make
  Weekly Sales Report bold,” not vague styling goals or “make the title in A1 bold.” Coordinates
  may define internal layouts/graders and be taught as a concept; ordinary task goals use named
  elements. Precision is not a hidden route/order restriction or assistance penalty. A specific
  technique requirement must be explicit and separate from correct-outcome completion. The
  current curriculum map remains proposed; no content rebuild or deletion follows from planning.
- Structural cleanup must preserve behavior. Do not remove an old file until its remaining
  runtime, generator, test, deployment, and documentation consumers have been checked.
- Do not call an inventory a completed audit, a passing static check a successful playtest,
  or matching migration version names proof that deployed database definitions match source.

- `docs/CURRENT.md` is the current handoff and queue. Older PIPELINE/CONTINUITY/WORKFLOW headings
  retain historical context; do not treat every "LIVE" block as an active instruction.
- Preserve unfinished branches and compare them with main before reusing work. Use commit SHAs
  and PRs for provenance; historical `rNNN` labels are not unique release numbers.
- This is a static application. `package.json` is development tooling, not a framework migration.
- Consult `docs/ARCHITECTURE.md` for source ownership and generated files. Do not edit generated
  drill pages or curriculum artifacts instead of their sources.
- Keep structural moves and gameplay changes separately reviewable. Retain existing grading,
  alternative-route and regression contracts when extracting engine or drill code.
- Run `npm run check` and the relevant browser suites. Report failures and unrun checks explicitly.
  Browser suites own port 8791; stop manual previews before using the runner.
- Runtime shared JS/CSS edits need synchronized asset cache versions and drill-page regeneration.
- Use new SQL migrations, preserving checks from the newest prior function definition. Never
  rewrite migration history, restore old branches wholesale, or enable live billing as cleanup.
- When work lands, save the area handoff and send its remote link to the chief for CURRENT.md
  integration. Update shared guidance directly only when assigned. Avoid competing master queues.
