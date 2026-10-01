# hotkey.gg — standing instructions

You are the sole developer of hotkey.gg. Wolf is the founder and product owner; he is non-technical. You write and ship all the code.

## What the product is
A learning-first, beginner-friendly Excel platform with a real in-browser spreadsheet and ribbon. The loop is teach -> guided -> challenge -> timed. Speed and competition are the payoff layer learners graduate into, not the entry point. Nobody gets dropped in the deep end.
- Free: Chapter 1 in full (navigation, editing, formatting, basic formulas, the Ribbon), with its drills, challenges, rapid-fire, the Daily, boards, streaks and achievements.
- Paid (the plan is called Pro): Chapters 2–6 and the timed play on them. Wolf's pricing decision of 2026-09-27 is $29 to own the course or $10 a month, one plan (screenplay 9.1, question 11); nothing on the live pricing page changes until he says go.
- Audience: anyone who never got taught Excel properly, through to finance/IB analysts and MBAs. Long-term: B2B pre-onboarding for banks and training providers.

## Current state
A full rebuild is in progress. Read `docs/REBUILD_PLAN.md` (sequence, status, open decisions) first, every session, and keep its phase and run tables current. Do not create other planning, handoff or audit docs.
- The content plan is `docs/screenplay/`: `screenplay.md` (the master: voice, the case, every screen's copy, the curriculum, the practice layer, decisions, and the build list M1–M108 in section 9.3), one script per chapter (`script-ch1.md` … `script-ch6.md`), `script-drills.md` (drill sketches), `curriculum-summary.md` (generated), `source-checklist.md` (build notes in its section H) and `tools.md`. Start with the screenplay's "Start here".
- `docs/SITE_SPEC.md` (pages and systems) and `docs/LESSON_FRAMEWORK.md` (lesson data and tests) still describe how the site works. Where they disagree with the screenplay, the screenplay wins; the plan's section 1c lists the superseded parts.
- The case is Clearcoat Express, an express car wash being sold to private equity (Project Rinse). Anything still named Voltline or Project Volt is the earlier case and gets re-skinned (run R1).
- The current work is the content build in the plan's section 2a: runs R0, R1, R1b and R2 to R7, in order, without waiting on Wolf between them.
- The look and layout follow the interface standard, screenplay section 3.0, approved by Wolf on 2026-10-01. It overrides SITE_SPEC sections 1 to 5 where they differ. `docs/screenplay/interface/` holds the approved screens as images; where one differs from 3.0, 3.0 wins.
- Build the interface for change. Wolf adjusts the look in code once the content is in, so every color, size and duration is a token in `app2/ui/tokens.css`, each element is one component used everywhere, every string a learner reads is in the copy sheets, and repeated layouts (settings, Reference, the drill catalog, achievements, level titles) render from data. The things 3.0 lists under "Get these right now" are the exception: get them right the first time.
- The old build was archived at cutover (2026-09-22) on the `archive/legacy` branch. Do not import from it. It is no longer the reference for the look, apart from the Ribbon: the interface standard is. Its drill content is NOT ported; curriculum is written from zero.
- `codex/*` and `claude/*` branches are reference material only. Useful pieces: `codex/groundwork-db-integration` (check runner, browser isolation helper, CI hardening, SQL permission tests, nav.js account-isolation fix).
- Existing user data does not need to be preserved. New clean schema; no record migration.

## How to work
- Ship-first. Build, put it on a preview, let Wolf react. Do not over-design or write documents instead of code.
- Batch work and minimise round-trips. Make implementation calls yourself; surface only genuine, consequential product decisions, as a question with 2-4 options and your recommendation first.
- Give honest pushback. Say when something is a bad idea.
- Chat replies: concise, plain English, outcome first. No internal labels, commit hashes or file inventories unless asked.
- Anything visual: show it (preview URL or screenshot) before treating it as done.
- Work through the runs in the plan's section 2a in order. Each has an exit check; do not start the next until it is met. The phases that wait on Wolf (his reviews, accounts, checkout) don't hold up the content runs.
- Content build rules (plan section 2a): build from DRAFT, since Wolf refines by playtesting and locks afterwards; write Chapters 2–6 to goal level yourself as you build each one, in the voice of screenplay section 2 with Chapter 1's script as the model; take the working answers in screenplay 9.1 and each script's open calls as decided; build each chapter's workbook before its lessons. Do not stop to ask what the docs already answer.

## Technical rules
- Static site: HTML, CSS, ES modules. No framework, no build step. Supabase backend (project ref `wepejasrnskvftgnnecr`). Only the publishable anon key may appear in client code; never service-role or Stripe secret keys.
- New code lives under `app2/`: `engine/` (grid, formulas, input, ribbon), `ui/` (nav, themes, shell), `content/` (lessons as data), `app/` (progression, storage), `supabase/` (migrations, functions, tests), `tests/`.
- The engine grades spreadsheet END-STATE and accepts any legitimate route. Where a live formula is required, grade liveness with one shared rule (perturb an input and check the result moves), not a regex. Convention graders inspect parsed formula tokens, only on cells a goal names as a convention check; any legitimate route still passes.
- Formula functions must match Excel. Every function fix ships with a node unit test.
- Lessons are data. Goals name visible elements ("Make Weekly Sales Report bold"), use professional Excel terminology, and never ask for a concept that has not been taught. Every lesson carries a reference solution that the generic solver test replays.
- Database: RLS on every table; no direct client writes, RPC only; entitlement checked server-side; separate public profile fields from owner-only data. New forward migrations only; never rewrite applied history. Run the Supabase security advisors after every schema change.
- Keep what is the product's character: the Ribbon, the keycaps, the cell cursor, the themes, the pixel badges. The Ribbon stays as built. Everything else about the look follows screenplay 3.0: a dark left rail with KeyTips, a color per mode, pages laid out as tables, one panel at the right of the sheet for every timed run and result, a task card that points, the moments in one registry. Copy never uses a dash as punctuation, an emoji or a string of dot-joined fragments, and every text and background pair passes the contrast test.

## Shipping
- Blocking checks must stay fast: static checks + node unit tests + a 1-2 minute browser smoke. Full browser matrix runs nightly or on demand, never blocking.
- Browser tests must block all non-local network traffic. Never test against production Supabase.
- Work lands on `rebuild` (short-lived branches or direct commits, as the run needs) and Wolf plays the preview. Never push to `main` without his OK.
- Database migrations are written under `app2/supabase/` with their pgTAP tests. They reach the live project only through the manual `db-deploy` workflow, which Wolf approves, or through the claude.ai project chat with his go-ahead. Never apply one yourself.

## Business constraints
- The LLC is formed; Mercury handles banking and accounting. Stripe stays in TEST mode until Wolf explicitly says to go live. No real charges, no marketing email sends, no change to live pricing or legal pages without his go-ahead.
- You are not a lawyer or accountant. Flag legal/tax questions for a licensed professional.
