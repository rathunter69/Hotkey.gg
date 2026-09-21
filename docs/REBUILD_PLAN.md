# hotkey.gg rebuild plan

Last updated 2026-09-21. Sequence, status and open decisions. Behaviour of every page and system lives in docs/SITE_SPEC.md. These two files plus CLAUDE.md replace all earlier planning docs (Codex docs, PROJECT_CONTEXT.md, dev/WORKFLOW.md, PIPELINE, handoffs). Decisions and status only; no changelog.

## 1. Direction
- Learning-first Excel platform: read -> guided -> solo -> timed. Speed, rank and boards are the layer learners graduate into.
- Six big chapters; Chapter 1 (Foundations) is free, the rest paid. Content is written from zero.
- Keep the old build's visual identity and its trainer layout for timed play; lessons use a split pane with the panel on the right.
- Existing user data is not preserved. New database, new schema.
- All systems return, in phases: timed drills + pars + boards + rank, XP + pixel-art achievements + earned cosmetics, rapid-fire, Daily, stats, desks (core), school flair, two-tier certificates, group access.
- One public launch with paid on day one.
- Developer: Claude Code sessions on branch `rebuild`, new code under `app2/`. The Cowork project chat reviews branches, handles database/security, legal, launch and ops.
- Business: LLC formed; Mercury for banking and accounting. Any payment processor stays in test mode until Wolf says go.

## 2. Phases (each has an exit check; do not start the next until it is met)
| # | Phase | What | Exit check |
|---|---|---|---|
| 0 | Structure | app2/ layout, headless engine, unit tests, fast check | DONE |
| 1 | Learning slice | Lesson format, catalog, lesson view, first 7 Foundations lessons, guest progress | Built; Wolf playtest pending |
| A | Site shell and onboarding | Layout per SITE_SPEC 2-5 (panel right, full ribbon in Chapter 1, slim mode bar), landing, first run, all pages, reference port, public lesson pages, browser smoke | Built 2026-09-21; Wolf playtests a preview link and signs off (pending). Cloudflare Pages needs Wolf's account (section 3) |
| B | Accounts and saved progress | Schema + server functions + SQL permission tests written in app2/supabase/ (not applied); auth (email/password, magic link, Google), handle at signup, guest carry-over, account page, honest save states | Cowork chat reviews and applies migrations to the new Supabase project; permission tests green; advisors clean |
| C | Chapter 1 complete | All Foundations sections (formatting, basic formulas, copy/paste/fill), chapter project + assessment, test-out | A real beginner gets from lesson 1 to the end without outside help (2-3 people) |
| D | Game layer | Drill workspace (old trainer layout), pars, PBs, Daily, rapid-fire, boards, rank, XP/level, pixel-art achievements, earned cosmetics, stats | Parity walk against the old build's workspace and themes |
| E | Paid tier | Chapters 2-3 at minimum, sample lessons, entitlements, merchant-of-record checkout (test mode), student verification, group access codes, pricing page live | Test-mode purchase, cancel, expiry, refund, group grant all pass end to end |
| F | Desks, schools, certificates | Per SITE_SPEC 11 | Permission tests cover every desk rule |
| G | Launch | Chapters 4-6 to agreed depth, legal pages final, Cloudflare Pages cutover, old build archived, processor live | Launch checklist (section 5) complete |

## 3. Shipping
- Blocking check: static + node unit tests, under 30 seconds. Browser smoke (under 2 minutes, network blocked except localhost) runs as a separate non-blocking job. Full browser matrix nightly or on demand.
- Hosting moves to Cloudflare Pages: preview link per branch, one-click rollback, no manual ?v= cache bumps. Set up during phase A so Wolf reviews previews from then on.
- `supabase-deploy.yml` on main must not fire from the rebuild: keep rebuild SQL under app2/supabase/. Replace that workflow at cutover (pinned CLI, explicit permissions, manual approval).

## 4. Security and database
- Done 2026-09-21 on the OLD project: migration `desk_direct_write_lockdown` (revoked direct insert/update/truncate on teams, team_members, team_applications; truncate on profiles). Closes the 12 desk bypasses on the live site.
- Still open on the old live site: profiles table world-readable (school domain, saved client state, email preferences). Goes away when the old project is deleted.
- New database: a second Supabase project costs about $10/month, so the old project is replaced rather than run alongside. Sequence: (1) phase B migrations reviewed; (2) Cowork chat exports a schema + data backup of the old project; (3) Wolf deletes the old project in the Supabase dashboard (only he can; it is irreversible) and creates the new one; (4) migrations applied, keys go into app2/app/config.js. From step 3 the old live site runs in guest mode (no login, no saves, no leaderboard) until cutover. If that is not acceptable at the time, pay the $10 for the overlap instead.
- Rules for the new schema are in SITE_SPEC 12. Run the Supabase security advisors after every schema change. No two-factor until after launch.

## 5. Legal and launch checklist (Wolf owns; lawyer/accountant confirm)
- Terms, Privacy, EULA in the LLC's name covering: free/paid split, prices, 14-day guarantee, cancellation, account deletion, minimum age, first-party analytics.
- Microsoft: nominative use only, non-affiliation disclaimer, no Microsoft visual assets.
- Processor: merchant of record (Paddle or Lemon Squeezy) is the lean; accountant to confirm sales-tax position before phase E ends.
- Google sign-in: OAuth app under the LLC's Google Workspace.
- Email: sending domain set up; unsubscribe on every non-transactional email.
- Before launch: Supabase backups confirmed, branch protection + required check on main, support address, refund/cancel runbook, preview testing with real beginners and finance users.

## 6. Ongoing ops (set up during phases B-E)
- First-party events + client error log with a weekly digest; uptime check; weekly health check (advisors, failed saves, signups, revenue).
- Monthly dependency and Supabase review; quarterly backup restore test.
- Release routine: preview link -> Wolf OK -> merge -> live; rollback is one click.

## 7. Old build
- Stays on main untouched until cutover. Reference for look, layout and copy; never imported.
- At phase D exit: parity walk (workspace layout, themes, ribbon, keycaps, reference content).
- At cutover: tag `legacy-v1`, keep one `archive/legacy` branch, remove old code and Codex docs from main, delete stale claude/* and codex/* branches after Wolf confirms.

## 8. Open decisions
- Accountant confirmation of merchant of record vs Stripe direct.
- Chapter 2-6 section lists (decided chapter by chapter as they are built).
- How deep chapters 4-6 must be at launch.

## 9. Engine rules carried from the audit of the old evaluator
All fixed and pinned by tests in app2/tests/excel-defects.test.js; keep them green: blanks/text ignored by AVERAGE/MEDIAN/MIN/MAX; INDEX bounds; ROUND half-away-from-zero with decimal correction; TRUE/FALSE literals; VLOOKUP/MATCH match types; criteria operators in COUNTIF/SUMIF/SUMIFS plus AVERAGEIF/COUNTIFS; YEARFRAC basis; case-insensitive text comparison. "Live formula" grading uses the shared perturbation rule in app2/engine/live.js, never a regex on formula text.
