# hotkey.gg rebuild plan

Last updated 2026-09-22. Sequence, status and open decisions. Behaviour of every page and system lives in docs/SITE_SPEC.md; how content is authored in docs/LESSON_FRAMEWORK.md; per-phase build detail in docs/phases/<X>.md. These plus CLAUDE.md replace all earlier planning docs. Decisions and status only; no changelog.

## 1. Direction
- Learning-first Excel platform: read -> guided -> solo -> timed. Speed, rank and boards are the layer learners graduate into.
- Six big chapters; Chapter 1 (Foundations) is free, the rest paid. Content written from zero.
- Keep the old build's visual identity and its trainer layout for timed play; lessons use a split pane with the panel on the right.
- Existing user data is not preserved. New database, new schema.
- Developer: Claude Code (Opus) sessions on branch `rebuild`, new code under `app2/`. This Cowork project chat reviews branches, applies database migrations, and owns security/legal/launch/ops.
- Business: LLC formed; Mercury for banking and accounting. Any payment processor stays in test mode until Wolf says go.

## 1a. MVP definition (what Opus builds unattended before a full review)
The MVP is the **free product complete, with paid content built but gated behind a manual flag**:
- All of Chapter 1 (Foundations), accounts, and the full game layer (drills, pars, PBs, Daily, boards, rank, XP, achievements, cosmetics, stats).
- Chapters 2–3 authored under framework v2 after C2, locked behind a `paid` entitlement that Wolf grants by admin/redeem code. No checkout in the MVP; E's checkout half unchanged.
- Desks, certificates, group codes, school flair and real checkout come after the MVP is reviewed (Phases F, E-checkout).
Wolf reviews the MVP as a whole once D lands; individual phase previews still happen.

## 2. Phases (cutover-first; each has an exit check)
| # | Phase | What | Exit check |
|---|---|---|---|
| 0 | Structure | app2/ layout, headless engine, unit tests, fast check | DONE |
| 1 | Learning slice | Lesson format, catalog, lesson view, first Foundations lessons, guest progress | DONE |
| A | Site shell and onboarding | Full site, landing, first run, catalog, lesson workspace, ribbon, reference, Welcome + How-Excel-works, effects | DONE pending Wolf's final sign-off |
| **X** | **Cutover (do first)** | Cloudflare Pages serving app2 at hotkey.gg; old build tagged `legacy-v1` and archived; `rebuild` becomes the deployed source; old Supabase project deleted and new one created; redirects from old URLs; real draft legal pages live; Microsoft disclaimer. Quiet swap, no announcement. Live site = full site with Chapter 1 playable as guest and later chapters marked "coming". | DONE 2026-09-22: PR #251 merged to `main` with Wolf's OK (merge commit 3d0eacf); hotkey.gg serves the rebuild (byte-verified). Old build archived on `archive/legacy` @ 434bc0e; tag `legacy-v1` still needs one click in the GitHub UI (session cannot push tags). `cutover` branch kept |
| B | Accounts and saved progress | Schema + RPCs + pgTAP tests written under app2/supabase/; auth (email + magic link now, Google when OAuth ready); handle at signup; guest->account carry-over; account page; honest save states; admin/redeem entitlement grant | CODE DONE 2026-09-22 (migrations 0001–0005 incl. admin/redeem entitlements + 6 pgTAP files, 197 assertions, validated on a local shimmed Postgres; client + UI live behind config.js; 295 node tests + smoke green). WAITING ON REVIEW SESSION: apply migrations to wepejasrnskvftgnnecr, pgTAP on the real stack, advisors |
| C | Chapter 1 complete | All Foundations sections per LESSON_FRAMEWORK; chapter project + timed assessment; test-out | CODE DONE 2026-09-22 (37 lessons across all ten sections incl. two-sheet project, 300 s assessment, 240 s test-out with chapter gate + skip; engine grew Find/Replace, Go To Special, row heights/hide/freeze, cross-sheet refs; 373 node tests + 6-lesson browser smoke green). WAITING ON WOLF: 2-3 real beginners get from lesson 1 to the end unaided |
| C2 | Curriculum rewrite (framework v2, Project Volt) | One module workbook (`voltline-weekly`) across Chapter 1; modules of 4-6 lessons each ending in a seeded, tier-scored challenge; banker conventions graded from the sheet; the Learn path, pinned task card, ghost replay and seed-true retries; the legacy 38 lessons deleted at the end. Authority: `docs/proposals/` (landed 2026-09-23) | RUN 1 DONE 2026-09-23: platform gaps 1-3 and 7-9b shipped (workbook states, challenge kind, grader library, hint-vocabulary law, viewport workspace + task card, Learn path, ghost Show me, bare-numbers overlay + Enter/N retries), migration 0008 written with pgTAP 09 (21 asserts; suites 01-09 green locally, awaiting the review session), modules 1.0-1.2 authored (9 lessons + 2 challenges, solutions replay to their after states). Legacy 38 still live below the modules. RUN 2 DONE 2026-09-24: engine gaps 4-6 (outline bar with Alt+Shift+→/← and the Group dialog, Ctrl+` show formulas, Page Setup titles/footer/print gridlines), one clipboard per workbook, arrows skip hidden/folded rows; modules 1.3 (5 lessons + challenge) and 1.4 (3 lessons + challenge) authored, reviewed and live with closers, soft-timed first attempts and the efficiency axis; Welcome race retired into 1.1.1 (id map); micro-drills for the 1.3-1.4 shortcuts; 33 engine-review findings fixed. RUN 3 DONE 2026-09-24: engine gap 10 (F4 repeat), pointing across sheets mid-formula and Ctrl+[ across sheets; states S5a-S7c with lesson plantings; modules 1.5 (4 lessons + challenge), 1.6 (6 + challenge) and 1.7 (3 + challenge) authored, reviewed, fixed and live; their copy rows, beats and micro-drills in the copy layer / content. RUN 4 DONE 2026-09-25: Ctrl+Home honours frozen panes; states S8raw/S8done with `buildReport`; 1.8 project (14 goals), assessment (seeded, 480 s, soft first attempt, tiers) and test-out (seeded, 300 s) live; chapter ends on the print preview of the KPI page with the associate's line; seven challenges registered as drills (two benchmarks, Daily pool, Keep sharp row); the 36 legacy lessons deleted with `migrateIds` and catalog redirects; micro.csv in the copy layer; spec edits, framework v2 in place. Chapter 1 = 39 items (the Welcome retired). WAITING ON WOLF: preview walk; the copy CSVs (three new lesson rows and micro.csv as drafts). NEXT: C2 close-out review, then D parity walk / MVP review |
| D | Game layer | Drill workspace (old trainer layout), pars, PBs, PB ghost, Daily, rapid-fire, boards, rank (hidden until field fills; seeded pace-setter ghosts, not fake human rows), XP/level (~30, generous early), ~40 achievements (milestones, skill feats, speed/streak, hidden), cosmetics, stats | CODE DONE 2026-09-22 (12 drills with pass/pro/legendary pars, DrillRun workspace with start card/pace bar/PB ghost/result splits, records store hk2_records_v1, Daily + rapid-fire, XP/level + old rank math ported, 43 achievements + pixel badges, theme unlocks, Stats live; boards/rank show local-honest states until accounts. 398 node tests + smoke green). WAITING ON WOLF: parity walk vs old build; MVP review |
| E | Paid tier | Chapters 2-3 lessons + samples; entitlements processor-agnostic; then merchant-of-record checkout (test mode), student verification, group codes, pricing wiring | Test-mode purchase, cancel, expiry, refund, group grant pass end to end |
| F | Desks, schools, certificates | Desks v1, school flair, two-tier certificates, all writes via RPC | pgTAP covers every desk rule |
| G | Public launch | Chapters 4-6 to agreed depth, legal final (reviewed), checkout live, announce | Launch checklist complete |

Note: cutover (X) happens before B. The live site runs guest-only (local progress) from X until B ships accounts. That is expected and honest.

## 3. Shipping
- Blocking check: static + node unit tests, under 30s. Browser smoke (network blocked except localhost) as a separate non-blocking job. Full browser matrix nightly/on demand.
- Hosting: Cloudflare Pages. Production branch is `rebuild` (renamed to `main`'s role at cutover), output directory `app2`, preview link per branch, one-click rollback, no manual ?v= bumps.
- `supabase-deploy.yml` (old) is removed at cutover; rebuild SQL lives under app2/supabase/ and is applied by this chat, never by CI.

## 4. Security and database
- Done 2026-09-21 on the OLD project: `desk_direct_write_lockdown` closed the 12 desk write bypasses on the live site.
- Supabase switch (Wolf's chosen sequence: delete old, then create new — no overlap cost, brief gap):
  1. This chat exports a schema + data backup of the old project (for the record; data is not migrated).
  2. Wolf deletes the old project in the Supabase dashboard (irreversible; only he can) and creates a fresh one, same region, and pastes the new project ref here.
  3. This chat applies the Phase B migrations to the new project and runs the security advisors.
  During the gap (between delete and new-schema-live) the site is guest-only anyway, so nothing user-facing breaks. Do the delete/create right before B, not at cutover, so the site isn't pointed at a dead project.
- New schema rules in SITE_SPEC 12. Advisors after every schema change. No two-factor until after launch.
- Phase D → B contract: the game layer's guest records (`app2/app/records.js`, key `hk2_records_v1`) are the shape of a future `attempts` table — `{id uuid unique (idempotent retries), kind drill|daily|rapid|lesson-timed, ref, day, seed, secs, keys, clean, helped, mouse, tier, splits jsonb, trace jsonb capped at 600 entries (clean runs only), at}`. PBs, boards, XP and rank all DERIVE from attempts server-side; timed lesson runs write an attempt too (kind `lesson-timed`) so Stats has one source, while `progress.lessons.best` stays the lesson-page convenience copy. WRITTEN as migration `0007_game_attempts.sql` (game_attempts + derived game_pbs, rpc_submit_game_attempt / rpc_my_game / rpc_board, export grown) with pgTAP 08 — 257 assertions green locally; AWAITING the review session, with 0006. The client already dual-writes: records.js locally, plus a uid-owned outbox to rpc_submit_game_attempt when signed in (parked quietly until 0007 exists). Rank keeps the old placement math (speed-derived percentiles over benchmark boards, prior-weighted; see `app2/app/rank.js`) — hidden until a board has real depth, per the spec.

## 5. Legal and launch checklist (Wolf owns; lawyer/accountant confirm)
- At cutover (X): real plain-English **draft** Terms, Privacy, EULA covering guest data and no-accounts-yet, plus the Microsoft non-affiliation disclaimer and a contact email, all marked pre-review. Good enough to be live for a free guest product.
- Before paid launch (G): lawyer review; add prices, 14-day guarantee, cancellation, account deletion, minimum age, analytics.
- Processor: merchant of record (Paddle or Lemon Squeezy) is the lean; accountant confirms sales-tax position before E ends.
- Google sign-in: OAuth app under the LLC's Google Workspace (unblocks Google auth in B).
- Email: sending domain; unsubscribe on every non-transactional email.
- Before public launch: backups/PITR confirmed, branch protection + required check, support address, refund/cancel runbook, real-user preview testing.

## 6. Ongoing ops (set up during B-D)
- First-party events table + client error log with a weekly digest; uptime check; weekly health check.
- Monthly dependency/Supabase review; quarterly backup restore test.
- Release routine: preview -> Wolf OK -> deploy; rollback one click.

## 7. Old build
- Reference for look, layout and copy; never imported.
- At cutover: tag `legacy-v1`, keep one `archive/legacy` branch, remove old runtime and Codex docs from the deployed source, delete stale claude/* and codex/* branches after Wolf confirms.
- Extraction from the old build is considered complete (look, layout, copy, reference content, rank ladder, engine-defect list). Nothing further is owed to it.

## 8. Open decisions (do not block the MVP)
- Accountant confirmation of merchant of record vs Stripe direct (before E).
- Chapter 4-6 section depth at launch.
- Google OAuth client ID (drops into B when ready).

## 9. Engine rules carried from the audit of the old evaluator
All fixed and pinned in app2/tests/excel-defects.test.js; keep green: blanks/text ignored by AVERAGE/MEDIAN/MIN/MAX; INDEX bounds; ROUND half-away-from-zero; TRUE/FALSE literals; VLOOKUP/MATCH match types; criteria operators in COUNTIF/SUMIF/SUMIFS + AVERAGEIF/COUNTIFS; YEARFRAC basis; case-insensitive text compare. Liveness grading uses the perturbation rule in app2/engine/live.js, never a regex.
