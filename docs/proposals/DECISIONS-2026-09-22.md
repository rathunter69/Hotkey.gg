# Curriculum planning — decisions and handoff (2026-09-22)

Status: decided with Wolf in the planning chat on 2026-09-22. These decisions are reflected in the four proposal files in this folder; this page is the index for whoever picks the work up (the main orchestrator session, then an Opus build session running `C2-curriculum-rewrite.proposed.md`). Nothing live has changed yet: SITE_SPEC.md, LESSON_FRAMEWORK.md and the 38 lessons are as they were.

## Files
- `LESSON_FRAMEWORK.proposed.md` — the framework v2: Lesson → Challenge inside modules; replayability (§8); feel and the edge over video (§7); the evidence (§10). Replaces `docs/LESSON_FRAMEWORK.md` on acceptance.
- `CURRICULUM_MAP.proposed.md` — Project Volt: six chapters as the stages of a sale process; Chapter 1 lesson by lesson; Chapters 2–6 by section and lesson. Replaces SITE_SPEC §7 on acceptance.
- `BANKER_CONVENTIONS.proposed.md` — 47 sourced conventions with where each is taught and enforced; grader rules; the day-one list.
- `C2-curriculum-rewrite.proposed.md` — the build brief for Phase C2, with the "paste to start" block.

## Decided
**Unit and story.** Lesson → Challenge inside a module on a growing workbook; no Try solo. One narrative, Project Volt: the analyst on the sell-side team for Voltline Charging Inc. (EV fast-charging network, 40 sites, USD); each chapter is a stage of the sale and produces one page of the pack. Chapter 1 works the Austin cluster's weekly site report at lemonade-stand arithmetic (kWh × price, less energy cost); sessions and tariffs arrive in Chapter 3. Impersonal deal-team voice; no named characters. Chapter 1 in analyst-workflow order, copy/paste in section 3. 5–7 minute lessons, one job each.

**Reps.** Challenges are seeded generators: seeds vary clothing (12-city pool), figures, fault positions and at most one twist — never workload (goal count, fault count, row band, pars fixed). Practice seed (random) and daily seed. Story line in Learn, bare task list in Practice. Every challenge is also a drill. Cross-chapter remixes from Chapter 2. Keep-sharp offer on Practice. Retry: Enter = same seed, N = new file.

**Completion and grading.** A module completes when its challenge is passed at any tier; soft gate. Correct numbers with a broken convention = not passed, one-line reason shown. Pass ≈ 3× reference route, pro ≈ 1.8×, legendary ≈ 1.2×; boards sort by tier then time.

**Achievement layer.** Per-challenge all-time boards; a daily board; rank from two benchmark drills per chapter; nothing resets. Pack binder on Learn is the one visible collection; no conventions shelf; ~40 pixel badges stay, quiet (toasts and profile). Free tier = all of Chapter 1 incl. challenges, drills, boards, Daily. Desks: captain assigns a challenge + seed; desk board per assignment; captain sees pass/tier.

**Feel.** Silent stats: numbers, never sentences about them; the senior-colleague voice only in teach lines and convention chips. Task card pinned at the top of the panel; workspace fills the viewport. Show me = ghost replay on the learner's own sheet, scrubbable, never a key list. Lesson-complete overlay: keystrokes and time (bare), clean-sheet mark, one line naming the next job; no before/after slider. Welcome: race yourself on three moves, end on the finished KPI page, under three minutes. Sound on at low volume from the first key. Home: Continue card first. Practice: Daily, Keep sharp, then challenge drills by chapter, then rapid-fire and sandbox. The Daily is a purpose-built ~90 s generator, not a module challenge. Mac: Excel for Mac has KeyTips (⌥ for Alt), so chords are taught for both; first run says so; exceptions carry a one-line note.

## Open (not blocking C2)
- Hub/site names are Austin districts; the 12-city clothing pool needs its lists written.
- Tariff and cost figures were chosen for clean arithmetic, not sourced.
- Grid is 100 × 26; widening it is the one engine change that would let Chapter 4 use realistic exports.
- Charts remain out of engine scope; the football field is a table.

## Next steps for the orchestrator
1. Land this commit on `rebuild` (this session could not push: repo not in its authorised sources).
2. Wolf reviews the four proposals; any change goes into them, not into the live docs.
3. On acceptance, start an Opus build session with the "paste to start" block at the bottom of `C2-curriculum-rewrite.proposed.md`; its step 7 applies the spec edits and replaces the live framework.
