# hotkey.gg — master handoff (hit go)

This is the one page that starts the unattended MVP build. Give an Opus Claude Code session the repo (`rathunter69/hotkey.gg`, branch `rebuild`) and the doc set below, and it can build the MVP phase by phase, stopping only where a step is marked WOLF or a phase exit needs your playtest.

## The doc set (commit all to the repo first)
- `CLAUDE.md` (root) — standing rules, read every session.
- `docs/REBUILD_PLAN.md` — sequence, MVP definition, cutover-first order, status.
- `docs/SITE_SPEC.md` — how every page and system behaves (incl. §13 MVP/rollout/access).
- `docs/LESSON_FRAMEWORK.md` — how every lesson/drill/project is authored.
- `docs/phases/*.md` — one build brief per phase.

## What "the MVP" is
Free product complete (all of Chapter 1, accounts, full game layer), plus Chapters 2-3 written but locked behind a manually-granted `paid` flag. No checkout. Details in REBUILD_PLAN §1a and SITE_SPEC §13.

## Order of execution
1. **Cutover (G brief, hosting/archive/legal/redirect steps only).** hotkey.gg starts serving the rebuild as an early-access free product (Chapter 1 playable as guest, later chapters "coming"). Quiet swap. The Supabase delete/create is NOT done here — it is done right before B.
2. **B — Accounts and saved progress.** Just before B: Wolf deletes the old Supabase project and creates a new one (REBUILD_PLAN §4); this chat applies B's migrations and runs advisors. B ships email + magic link auth, guest carry-over, and the admin/redeem entitlement grant.
3. **C — Chapter 1 complete.** All Foundations sections per LESSON_FRAMEWORK, chapter project + assessment, test-out.
4. **D — Game layer.** Drills, pars, PBs, ghost, Daily, rapid-fire, boards, rank (hidden until the field fills; synthetic pace-setter ghosts only for calibration, never fake human rows), XP (~30 levels, generous early), ~40 achievements (all four flavours), cosmetics, stats.
5. **MVP REVIEW — Wolf plays the whole thing.** Everything above is the MVP.
6. **E — Paid tier / checkout**, then **F — Desks, schools, certificates**, then **G launch steps** (announce, checkout live) when Wolf says go.

## Rules that keep an unattended run safe
- One phase per session; stop at the exit check; do not roll into the next phase.
- SQL is written under `app2/supabase/`, never applied by the build session. This Cowork chat applies migrations to the new project after reading them.
- Never touch `main` until the cutover step; never enable live billing; keep any processor in test mode.
- Product questions come as 2-4 options with a recommendation, addressed to Wolf, and the session proceeds on the recommendation if he is away (stating the assumption) — except for anything irreversible (deleting data, going live, spending money), which waits.
- Every visual change is shown on the Cloudflare preview before it is called done.
- `node app2/tests/run-checks.js` stays green and under 30s; the browser smoke blocks all non-local network.

## Wolf's standing to-dos (unblock as you go; none blocks starting)
- Connect Cloudflare Pages to the repo (production branch `rebuild`, output `app2`) — needed for cutover and every preview.
- Delete the old Supabase project and create the new one right before Phase B; paste the new project ref into this chat.
- Set up a Google OAuth app under the LLC Workspace when convenient; paste the client ID (turns on Google sign-in).
- Get the draft legal pages reviewed before paid launch.
- Confirm merchant-of-record vs Stripe with the accountant before Phase E.

## Paste to start (cutover)
> Read CLAUDE.md, docs/REBUILD_PLAN.md, docs/SITE_SPEC.md, docs/LESSON_FRAMEWORK.md and docs/phases/G-cutover-launch.md. Execute only the cutover portion (Cloudflare Pages hosting, old-build archive, redirects from old URLs, draft legal pages + Microsoft disclaimer, remove the old supabase-deploy workflow). Do NOT do the Supabase delete/create, accounts, or anything marked a launch/announce step. Stop at each WOLF step. When hotkey.gg serves the rebuild with old URLs redirecting and no console errors, stop and report how to verify.

Each later phase's "Paste to start" block is at the bottom of its brief.
