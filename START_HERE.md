# START HERE — hotkey.gg rebuild handover

This folder mirrors the repo layout. Drop `CLAUDE.md` at the repo root and the `docs/` folder alongside it, commit on branch `rebuild`, and you have everything.

## Read order
1. `docs/MASTER_HANDOFF.md` — the one page that starts the build. What the MVP is, the phase order (cutover first), the safety rules, and the exact prompt to paste to begin.
2. `CLAUDE.md` — standing rules for every build session.
3. `docs/REBUILD_PLAN.md` — sequence, status, open decisions.
4. `docs/SITE_SPEC.md` — how every page and system behaves.
5. `docs/LESSON_FRAMEWORK.md` — how lessons/drills are authored.
6. `docs/phases/*.md` — one build brief per phase (start with the cutover steps in G, then B → C → D).
7. `docs/CODEX_REVIEW.md`, `docs/OPERATING_MODEL.md` — background and process (optional).

## The repo
- GitHub: `rathunter69/hotkey.gg`. Active branch: `rebuild`. New code under `app2/`. Old build at root is reference only, never imported.
- `node app2/tests/run-checks.js` is the fast blocking check. `app2/tests/smoke.mjs` is the browser smoke (blocks non-local network).
- Preview the site by pointing Cloudflare Pages at `rebuild` with output dir `app2`, or locally: `node app2/tests/serve.js` then open `/app2/`.

## Two accounts / two roles
- A **build session** (Claude Code, Opus) executes one phase brief at a time on `rebuild`, commits small, pushes, stops at the phase exit.
- A **review session** pulls the branch, runs the checks, walks the preview, applies Supabase migrations, and writes the next prompt. Database migrations are written by the build session under `app2/supabase/` and applied only by the review session (with the Supabase MCP or CLI) after being read.

## Wolf's standing to-dos (none blocks starting)
- Connect Cloudflare Pages to the repo (production branch `rebuild`, output `app2`).
- Right before Phase B: delete the old Supabase project, create a new one (same region), hand its project ref to the review session.
- Google OAuth app under the LLC Workspace when convenient (turns on Google sign-in).
- Legal review of the draft pages before paid launch; accountant on merchant-of-record before Phase E.

## First prompt to paste into the new build session
> You are the sole developer of hotkey.gg. Read CLAUDE.md, docs/MASTER_HANDOFF.md, docs/REBUILD_PLAN.md, docs/SITE_SPEC.md and docs/LESSON_FRAMEWORK.md. Then follow docs/MASTER_HANDOFF.md: execute the cutover steps from docs/phases/G-cutover-launch.md first (Cloudflare Pages hosting, archive the old build, redirects, draft legal + Microsoft disclaimer, remove the old supabase-deploy workflow). Do not do the Supabase delete/create, accounts, checkout, or any launch/announce step. Stop at every step marked WOLF, and stop at the phase exit with a report on how to verify. Work on branch `rebuild`, code under app2/, never touch main until the cutover step, keep node app2/tests/run-checks.js green.
