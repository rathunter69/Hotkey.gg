# Phase briefs

One build brief per rebuild phase. Each is written to be executed by an Opus Claude Code session with no memory of the planning conversation: it names exact files, data shapes, tests and order of work.

Status:
- **B-accounts.md** — code-verified against `app2/` (worktree beb3435).
- **C-chapter1.md** — code-verified.
- **D-game-layer.md** — first-pass (drafted well; a reviewer should sanity-check its file names against `app2/` before Opus starts, since the verify pass was cut short). New files it names (rank.js, daily.js, pars.js, records.js, cosmetics.js, effects additions) are meant to be created.
- **E-paid-tier.md** — first-pass.
- **F-desks-certs.md** — first-pass.
- **G-cutover-launch.md** — first-pass. This is also the CUTOVER brief; its hosting/archive/legal/redirect steps run FIRST (before B), and its announce/paid-live steps run last. See MASTER_HANDOFF.md.

Order of execution (from REBUILD_PLAN.md): **G (cutover steps only) → B → C → D → [MVP review] → E → F → G (launch steps).**

Every brief ends with a "Paste to start" block. Before starting any phase, the Opus session reads CLAUDE.md, docs/REBUILD_PLAN.md, docs/SITE_SPEC.md, docs/LESSON_FRAMEWORK.md and its own brief.
