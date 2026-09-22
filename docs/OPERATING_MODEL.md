# How the hotkey.gg rebuild runs from here

This is the process. CLAUDE.md is the standing rules, docs/REBUILD_PLAN.md the sequence and status, docs/SITE_SPEC.md the behaviour, docs/phases/<X>.md the build brief for each phase. Wolf reads this; the model executing a phase reads CLAUDE.md and its phase brief.

## Roles
- Wolf: product owner. Plays every preview, answers product questions with one word where possible, signs off phase exits, owns legal/business decisions.
- Build session (Claude Code, one per phase, any capable model): executes docs/phases/<X>.md end to end on branch `rebuild`. Never plans beyond its phase.
- Review session (this Cowork project chat, whichever model is available): pulls the branch, runs `npm run check`, walks the preview in a headless browser, checks the phase's exit criteria, writes the next prompt. Owns database migrations (applies them), security advisors, legal/launch/ops.

## The loop, per phase
1. Wolf starts a Claude Code task on `rathunter69/hotkey.gg`, branch `rebuild`, and pastes the starter prompt from the phase brief ("Paste to start" section at the bottom of docs/phases/<X>.md).
2. The build session works, commits small, pushes, and stops at the phase exit with a report: what works, how to open it, what it is unsure about, what is next.
3. Wolf plays the preview (Cloudflare Pages branch link once set up; the claude.ai artifact link until then) and writes bullet notes in plain language, as he did for Phase A.
4. Review session turns Wolf's notes plus its own walkthrough into: spec edits (only when a decision changed), a fix prompt, or sign-off. Fix prompts go back to the same build session; a new phase starts a new session.
5. Review session updates the plan's status line and the project docs.

## Rules that keep it from sprawling
- One phase per session. A build session that finishes early does not start the next phase; it stops.
- The spec changes only when Wolf changes a decision. The build session never edits the spec; it asks.
- No new planning docs. Phase briefs are the only per-phase documents and they are written before the phase, not after.
- Every phase has an exit check in the plan. Nothing is "done" until Wolf has played it.
- Product questions from the build session come as 2-4 options with a recommendation first; Wolf answers in one word.
- Database changes are never applied by the build session. It writes migrations and tests under app2/supabase/; the review session applies them to the new Supabase project after reading them.
- `main` is untouched until cutover (Phase G).

## When to use which model
- Build sessions: Opus (or Sonnet for content-heavy phases like C, where the format is fixed and the work is writing lessons to a template). Fable is not needed once the brief exists.
- Review sessions: whatever is available. The review is mostly mechanical (run checks, walk the preview, compare against the exit list).
- Fable, when available: spend it on judgment calls only: spec changes, security review of the Phase B schema before it is applied, the Phase G cutover plan review.

## Phase order and exit checks (from REBUILD_PLAN.md)
A Site shell and onboarding: DONE pending Wolf's final sign-off.
B Accounts and saved progress: migrations + tests written; review session applies to the new project; permission tests green; advisors clean.
C Chapter 1 complete: 2-3 real beginners get from lesson 1 to the end unaided.
D Game layer: parity walk against the old build's workspace and themes.
E Paid tier: test-mode purchase, cancel, expiry, refund, group grant all pass.
F Desks, schools, certificates: permission tests cover every desk rule.
G Launch: launch checklist complete.

## Standing blockers Wolf owns
- Cloudflare Pages connected to the repo (five minutes; gives real preview links and is required before beginner testing in Phase C).
- Accountant confirmation of merchant of record vs Stripe direct (before Phase E ends).
- Supabase: delete the old project and create the new one when the review session says the Phase B migrations are ready (the old live site loses login/saves from that moment; or pay ~$10 for one month of overlap).
- Google OAuth app under the LLC's Workspace (Phase B).
- Legal review of Terms/Privacy/EULA (before Phase G).
