# hotkey.gg lesson framework (proposal, v2)

Status: PROPOSAL, 2026-09-22. Replaces `docs/LESSON_FRAMEWORK.md` if Wolf accepts the decisions posted with it. The live framework stays in force until then. Companion files: `CURRICULUM_MAP.proposed.md` (every lesson), `BANKER_CONVENTIONS.proposed.md` (the canon §5 points to), `C2-curriculum-rewrite.proposed.md` (the build brief).

Sections 1–9 are the framework. Section 10 is the evidence: how the reference courses teach, why the current 38 lessons read thin, and what changed as a result. Read §10 first if you want to know why; read §1–9 if you are writing a lesson.

## 1. The unit: Lesson → Challenge, inside a module

A **module** is a section of a chapter: 3–6 lessons on one workbook that grows lesson by lesson, closed by a **challenge**. The learner opens the same company's file every time, sees the work they did last lesson, and does the next piece of the job. There is no "Try solo" and no fresh toy table per lesson.

- **Lesson** (5–7 minutes, guided). One analyst task on the module workbook: 5–8 goals that together produce something (a linked block, a formatted page, a fixed sheet). One headline shortcut or concept, up to two supporting ones introduced inline, at least two earlier concepts reused without re-teaching, and one banker convention carried (§5). Guided is the normal way to complete it and earns full XP.
- **Challenge** (2–3 minutes, timed, end of module). The module's work remixed: fresh figures and labels from a seed, sometimes one structural twist (an extra hub, a missing week), and a formatting expectation graded as strictly as the numbers. Goals are shown all at once, as a task list, with no teach lines. The clock starts on the first key. Pass / pro / legendary pars. Passing the challenge completes the module; a personal best and the drill boards live here, not on lessons.
- **Project** (10–15 minutes) and **Assessment** (timed, fresh data) close each chapter as today; **Test-out** stays.

Why: this is the shape of the courses bankers sit. WSP's live bootcamp and TTS's Core week teach a short block, then have the class do it on the model; BIWS's lessons end in a "practice exercise" that reworks the demo on an unformatted sheet; CFI closes every section with an interactive exercise. None of them repeat the same exercise with the hints hidden.

## 2. Lesson archetypes (every lesson is exactly one)

| Archetype | Teaches | The task shape | Graded on |
|---|---|---|---|
| **Move** | navigation and selection | reach and select named parts of a big export | active cell / selection end-state |
| **Edit** | entering, editing, clipboard, fill | complete or correct a block that is missing figures or has errors | cell contents |
| **Format** | formatting commands and the house style | bring a raw block to standard | number format, font, border, fill, alignment |
| **Formula** | a function or reference pattern | build the calculation lines of a report or schedule | values AND liveness (perturb an input; the result must move) |
| **Structure** | rows, columns, sheets, panes, grouping | reshape a sheet without breaking it | widths, hidden/grouped, sheet list, frozen panes, live totals |
| **Setup** | Options, page setup, QAT, workbook hygiene | set the file up as an analyst would | dialog state, sheet names and order |
| **Audit** | finding and fixing violations | a colleague's sheet with planted faults | every fault fixed, nothing else changed |
| **Project** | the module or chapter combined | build the deliverable end to end | end-state of the whole workbook |

New in v2: every archetype's task is phrased as the job, not the shortcut ("Link the five hub lines to Raw and total them", not "Enter =Raw!B3 in B3"). The shortcut is the how; the goal text says the what.

## 3. The lesson skeleton (data every lesson carries)

- `id`, `chapter`, `section`, `order`, `title`, `archetype`, `kind` (`lesson` | `challenge` | `project` | `assessment` | `testout`), `difficulty`, `tags`, `access`, `minutes` (5–7 for lessons, 2–3 for challenges).
- `module`: the workbook id this lesson belongs to (e.g. `voltline-weekly`), and `state: { before, after }`: the named workbook states the lesson starts from and must end at. Workbook states live in `content/workbooks/<module>.js` and are shared by every lesson of the module, so the file the learner opens in lesson 4 is the file lesson 3 left. The reference solution replayed from `before` must produce `after` (the test asserts every cell, format and structure named in `after`).
- `headline`: the one concept this lesson exists to teach (the title names it). `teaches`: `headline` plus up to two supporting concepts introduced here. `uses`: earlier concepts this lesson relies on (the test enforces: everything in `uses` appears in a prior lesson's `teaches`).
- `conventions`: canon ids from BANKER_CONVENTIONS (`B1`, `D7`…) this lesson states and applies. Shown as a chip on the goal that first applies it; graders enforce them from the module's challenge onward.
- `brief`: the Read, renamed and shortened: at most three sentences — the situation ("The Raw sheet is Monday's session feed from the network platform"), the task ("build the hub summary and total it"), the payoff at work. Ends with the headline keycap. Collapses to one line once the first goal lands.
- `goals[]`: 5–8 for lessons, 4–7 for challenges (shown all at once), 10–15 for projects. Each: `text` (the action, names visible things), `teach` (one line, first use of a concept only), `keys` (the reference route from the previous goal's end state, in the approved movement vocabulary, §6), `requires`, `check` (end-state predicate), `convention` (optional canon id), `cue` (Chapter 1 only).
- `challenge` (on the module's last lesson, or a separate `kind: 'challenge'` file): `seed(rng) → patch` for clothing (cluster, week, site names), figures and the positions of planted work; `twists[]` (a short list; the seed picks at most one); `goals[]`; `timeLimit` (150–180 s); `pars` via `parsFrom`; `graders` (canon predicates from BANKER_CONVENTIONS "Grader rules" applied to the whole sheet at the end). Rule: the seed varies content, never workload (§8).
- `solution`: full keystroke script; replayed by the solver test; `optimalKeys` derived from it.
- `par`: legendary seconds for the timed variant, authored from the solution (legendary ≈ 1.2× the reference run, pro ≈ 1.8×, pass ≈ 3×; challenges use `parsFrom` with a `pass` override so first plays fit inside the time limit).
- `help`: the fuller explanation (free to read) and the "show me" reveals (assisted).
- `closing`: one or two sentences on the completion overlay: what the artefact now is, and the convention it carries.

## 4. Module and section design rules

- A module is 3–6 lessons on one workbook, in the order an analyst would do the work, closed by one challenge. Chapter 1 has seven modules and a Welcome; see the map.
- **Density**: a lesson has one headline and 5–8 goals that form a task. Two or three related shortcuts in one lesson is right when they are used together at work (Ctrl+C/X/V; Ctrl+D/R; Shift+Space then Ctrl+Shift+=). "One new idea per lesson" is withdrawn: it produced 3-goal lessons on 7-row tables. The replacement rule is **one job per lesson**.
- **Spiral**: every lesson reuses at least two earlier concepts in its goals, without teach lines. Challenges reuse the whole module and at least one earlier module.
- **Realism**: the workbook is a document a junior analyst would actually be handed: a session or transaction export with 30–60 rows and 6–10 columns, a hub P&L, a budget vs actual. Real company name (fictional), real labels, units stated, a date or week in the title. Never a five-row Monday–Friday table on its own.
- **Difficulty** comes from the size of the sheet and the number of steps, never from hiding information or trick wording.
- **Mac** (decided): Excel for Mac now has KeyTips — Option plays the role of Alt and the letter sequences largely match Windows — so the Alt chords are taught for both platforms; a Mac learner sees ⌥ where a Windows learner sees Alt. The first-run platform picker says so in one line and adds that a few commands differ or lack a letter on Mac; those lessons carry a one-line Mac note. Windows keycaps are shown first because that is the banking norm.
- **Chapter 1 cues**: guided steps highlight the target cell or ribbon button; cues fade after Chapter 1 (SITE_SPEC §4 unchanged).

## 5. Best-practice canon

The canon moves to `BANKER_CONVENTIONS.proposed.md` (47 conventions in seven groups, each with sources, where it is taught and where graders enforce it). Rules for authors:
- Every lesson carries at least one convention from the canon, stated in one line on the goal that applies it ("Inputs blue, formulas black: a reader sees what to change"). Chapter 1 §1 states the core six across its four lessons (A4 in 1.1.1, A3 in 1.1.2, B1, B4, C1 and C5 in 1.1.4); every later lesson applies at least one.
- Chapter 1 challenges enforce only conventions their module taught. From Chapter 2, every Format, Formula, Structure and Project grader applies the full canon to the graded range: a merged title, a black input, a literal inside a formula, an inconsistent row, a minus sign where the house uses parentheses all fail the goal with a one-line reason.
- Audit lessons plant violations from the "told off on day one" list in the canon; the grader passes only when every planted fault is fixed and nothing else changed.

## 6. Hints, routes and the movement vocabulary

The reference route (`keys`) teaches habits as much as the goal does, so it must be the route a good analyst would take.

- **Approved movement**: arrows (≤3 presses), Ctrl+Arrow, Ctrl+Home / Ctrl+End, Home, Tab / Enter as commit-and-move, PgUp / PgDn on long sheets, Ctrl+PgUp / PgDn between sheets. **Approved selection**: Shift+Arrow (≤3), Ctrl+Shift+Arrow, Shift+Space, Ctrl+Space, Ctrl+A, Ctrl+Shift+Space, Ctrl+Shift+End.
- **Go To (Ctrl+G / F5)** appears in a hint only when the destination is on another sheet, more than a screen away, or is a Go To Special selection. A hint that says `Ctrl+G "B3:B7" ↵` to select a block that Ctrl+Shift+↓ would select is a bug, and the lesson test fails it (see the brief).
- Formula references are built by **pointing** (arrow keys while editing) where the target is within a few cells; typing a reference is acceptable for far or cross-sheet targets. Hints for formulas show the pointed route once, in the lesson that teaches it, then show the formula text.
- Hints stay deterministic from the previous goal's end state (the replay test depends on it); the vocabulary above is enough to write them because the module workbook is fixed.

## 7. Feel: the reward cadence, and the edge over a video

The material in Chapter 1 is, by design, a weekly KPI report — useful, not thrilling. The product has to make doing it feel good anyway, and it has one structural advantage over every video course: the learner's hands are on a live sheet that answers back. Everything below is built on that, and all of it stays inside SITE_SPEC §6a's rule: celebrate only what the learner actually did.

**The cadence inside a lesson** (6 minutes, 5–8 goals): something should land every 30–60 seconds.
- **Goal lands** (every 45 s or so): cell flash, draw-on tick, soft tick sound, next goal slides into the task card. The task card is pinned at the top of the panel and never scrolls away; completed goals collapse to ticks under it; the brief collapses to one line after goal 1.
- **New shortcut used correctly** (2–3 per lesson): the keycap "presses" in the panel and pops into *Shortcuts used*. No commentary: the platform shows numbers, never sentences about them (decided 2026-09-22: silent stats).
- **Convention applied** (1 per lesson): the chip on the goal earns its colour — "Inputs blue, formulas black" — and that is all. There is no conventions collection or shelf (decided: the pack binder is the only visible collection besides the quiet badge shelf).
- **Clean goal streak**: five goals in a row with no mouse and no help earns a quiet "clean sheet" mark on the completion overlay. Nothing is lost by breaking it.
- **Stuck** (~8 s): a one-line hint; (~20 s) Help pulses. Never a buzzer, never red.
- **Lesson complete** (medium moment): the overlay shows keystrokes and time as two bare numbers, the clean-sheet mark when earned, XP count-up, the module ring advancing, and one line naming the next lesson's job ("Next: link the site figures to Raw") so Enter reads as continuing. No before/after slider, no comparison sentences (decided).
- **Module challenge passed** (bigger): tier stamp on the module card, module badge, PB if clean, and the **pack page slots in**: the Learn page shows the Project Volt pack as a binder, and the page this module produced flips into place. Passing the challenge, at any tier, is what completes a module; lessons alone leave it at "lessons done" (decided). Chapter complete = the section signed off, certificate reveal.
- **Retry** (challenges and drills): Enter replays the same seed so you can beat the thing that beat you; N starts a fresh file. Both instant, no menu (decided).

**The edge over a video: how we show a solution.** A video shows someone else's screen; here "show me" plays on *your* sheet.
- **Ghost replay is the only Show me** (decided): Help → "Show me" never lists keys as text. The platform plays the reference keystrokes on the learner's own sheet with the keycaps lighting up in the panel, at readable cadence, then rewinds the sheet to where it was and hands control back: "your turn". The learner can scrub the replay with ← → one key at a time. Assisted marker applies as today: revealing the route reduces the lesson's XP; the challenge earns it back.
- **Your route vs the reference route** after a challenge or timed run: the efficiency meter (exists) plus a ghost of the reference route replayed on the learner's finished sheet, so they *see* the two keystrokes they did not know rather than reading a number.
- **Race yourself**: any lesson that teaches a faster way runs the slow way and the fast way on the learner's own clocks (the Welcome does this for three moves). Both clocks belong to the learner; a demo never races a person.
- **Why, inline**: the teach line rides on the goal that needs it ("Ctrl+Shift+↓ selects to the edge of the data"), the convention chip says why in one line ("a reader sees what to change"), and F2 on any formula highlights its precedents on the sheet as Excel does. The explanation is where the hand is, not in a sidebar.
- **Nothing to pause or rewind**: the lesson waits for the learner; reading is free; the clock starts on the first key.

**Mouse and wrong turns** unchanged from §6a: the mouse works and earns XP in lessons with one nudge per lesson; a wrong end-state leaves the goal open with a soft outline on the affected cell and, from Chapter 2, one line saying which convention broke ("B6 is a formula shown in blue"). Undo is always one key.

## 8. Replayability: the story is linear, the reps are not

Project Volt (see the map) is one narrative on workbooks that grow. That is right for teaching and wrong for reps: nobody wants to rebuild the same Austin report four times. So the content has three layers, and only the first is fixed.

**Voice** (decided): the story is told in an impersonal deal-team voice — "Management sent the Austin file. Build the KPI page." The associate and the buyer are roles, never named people.

**Layer 1 — Lessons (the story, played once).** Module workbooks, guided, the Project Volt narrative. Redoing a lesson is allowed and earns small capped XP; it sets no PB and posts to no board. Lessons are the textbook.

**Layer 2 — Challenges (the module's rep machine).** Every module challenge is a *generator*, not a sheet. A seed decides:
- **Clothing**: which cluster the file comes from (a 12-city pool: Dallas, Denver, Phoenix, Nashville…), the week label, the site names.
- **Figures**: kWh, prices, costs within realistic bands (±30% of the module workbook's), so totals and margins are never the same twice and no answer can be memorised.
- **Where the work is**: which day is missing, which cells carry typos, which cell hides the hardcode, which column is hidden, which row breaks the pattern.
- **One twist**, drawn from a short list per challenge: an extra site, a missing week, an extra column, a second input block. Never more than one.

What a seed may **never** change: the number of goals, the number of planted faults, the row-count band, the skill set, the time limit or the pars. **Seeds vary content, never workload** — that is what keeps times comparable across plays and makes a PB honest. Each attempt records its seed, so a ghost replays on the sheet it was set on and a board entry can be audited.

Two seed modes: **practice** (a fresh random seed every play; PBs and tiers count when the run is clean) and **daily** (the date seed, same sheet for everyone, feeds the Daily board). Passing any seed completes the module; pro and legendary tiers and the boards are what you come back for.

**Story dress** (decided): in Learn, the module challenge opens with one line of Project Volt context ("The Dallas cluster's file came in"); the same generator on the Practice page shows only the task list — no story, pure reps.

**Grading** (decided): a challenge with correct numbers and a broken convention is **not passed**; the result card names the one rule broken in one line ("B6 is a formula shown in blue"). Strict like a bank, honest about why. **Pars** (decided): pass is generous (about 3× the reference route, so someone who knows the material passes first or second try), pro about 1.8×, legendary about 1.2× for the grinders. Boards sort by tier, then time.

**Layer 3 — Drills (Practice; reps without the story).** The Practice page is where the generators live stripped of narrative, plus the atomic material:
- Every challenge generator auto-registers as a drill (same seed engine, drill workspace, pars). Authored once, played two ways.
- **Boards** (decided): every challenge generator has its own all-time board (clean runs; best tier, then best time); the Daily has a daily board; nothing resets. **Benchmark drills**: two hand-picked challenges per chapter whose boards feed rank (SITE_SPEC §6).
- **Rapid-fire**: single-shortcut prompts drawn from `teaches` across completed lessons, 60 seconds, combo counter — the pure muscle-memory layer, unchanged.
- **Cross-chapter remixes** (from Chapter 2 on): a Chapter 1 challenge template re-clothed in later material — the formatting challenge on a P&L page, the audit challenge on a lookup summary. Old skills stay warm on new sheets; authoring cost is a clothing file, not a new challenge.
- **Keep sharp**: the Practice page offers one challenge from an earlier module the learner has not passed cleanly in a while. An offer, never a nag (§6a: no guilt copy).
- **The Daily** (decided): a purpose-built ~90-second generator — five to six single goals drawn from across the completed modules on one seeded sheet (a mini remix, not a module challenge), date-seeded, same for everyone, its own daily board. Snappier than a full challenge; one more generator to build and tune.
- **Sound** (decided): on at low volume from the first key, obvious remembered mute (SITE_SPEC §6a unchanged).
- **Lesson length** (decided): 5–7 minutes, one job; the challenge carries the speed.
- **Desks** (decided): a captain picks any challenge generator and a seed; every member plays the same sheet; the desk gets a board for that assignment and the captain sees who passed and at what tier. This is the analyst-class and B2B hook and it falls out of the seed design.
- **Practice page layout** (decided): Daily card on top (today's tier and board position), then the Keep-sharp card, then the challenges-as-drills grouped by chapter, then rapid-fire and sandbox. Three things above the fold.
- **Home** (decided): a returning learner sees the Continue card first (Enter resumes), then the Daily and the module rings. The pack binder lives on the Learn page, not Home.
- **Free line** (decided): all of Chapter 1 including its seven challenges, their drills, their boards and the Daily drawn from them. Paid adds Chapters 2–6 and their generators.
- **Badges** (decided): the ~40 pixel achievements stay as specced, shown as toasts and on the profile shelf, not featured on Home or Learn.

**XP, PB and rank in this scheme.** Lesson complete: full first-completion XP; redo: small capped XP. Challenge first pass: the module's completion bonus; repeat: capped per day like drills. PB and boards: clean challenge and drill runs only (no help, no mouse). Tiers stamp the module card. Rank: benchmark drills only. Achievements: clean-pass streaks, first legendary on a generator, all seven Chapter 1 challenges at pro.

**The standing tension.** Speed play rewards the shortest route on a small fixed sheet; banking rewards a correct, conventional, readable file. Challenges resolve it by grading the artefact first — numbers live, formats to standard — and ranking only passing runs. A fast run that breaks a convention does not pass. Benchmark drills and rapid-fire stay atomic, because that is what they are good at; challenges stay dense.

## 9. Writing checklist (the test suite enforces the mechanical ones)

Brief is ≤3 sentences and ends in the headline keycap. Goals name visible things and read as the job. One headline, ≤2 supporting concepts, ≥2 reused. `before` → solution → `after` replays. No Go To in a hint unless the target qualifies (§6). Every lesson carries a convention id. Mac keys present. Workbook is a module state, not an inline table. Sheet has ≥20 populated rows or ≥2 sheets unless the archetype is Setup. Challenge seed produces different figures for different seeds and the goals still grade. Par authored. Voice: sharp senior colleague, no quips.

## 10. Evidence: the comparison and the diagnosis

### 10.1 How the reference courses teach (public material, read 2026-09-22)

| | WSP Excel Crash Course (self-study) | WSP / TTS live bootcamps | BIWS Excel & VBA | CFI Excel Fundamentals |
|---|---|---|---|---|
| Shape | 91 video lessons, 10 chapters, 8h39m; median lesson 5–7 min; chapter quizzes; two worked "problems" at the end | Excel is a half-day "best practices and efficiencies" block, then a three-statement build; homework between days | 6 modules, 70 Excel lessons, ~24h with VBA; Before/After files; practice exercise inside each lesson; 90% certification quiz | Two 3.5 h courses; every section ends in an interactive exercise; builds one income-statement template lesson by lesson |
| Lesson structure | Instructor demonstrates, learner follows in the download file; one function or feature per lesson | Instructor builds, class builds the same schedule on their own laptop; case company throughout | Principles (10 min) → live demo on Walmart (9 min) → practice exercise on an unformatted sheet (10 min) → summary | Video on a real dataset (pricing, invoices) → exercise at the section end |
| Workbook | function-specific files; no model | one three-statement case model, then DCF, then M&A/LBO | Walmart valuation; customer due-diligence data; Sales_Reps; apartment complex quarterly data | pricing and invoice datasets; one growing IS template |
| Shortcuts | both: three shortcut lessons early, then embedded in feature lessons; separate 100+ cheat sheet | inside the build; Alt chords and F-keys drilled by repetition | inside the task; QAT-first (Alt+number) | "Keyboard over mouse" first lesson; shortcuts lesson; QAT lesson |
| Task at the end | quiz; two applied problems (fiscal-half date, Olympic events) | the model itself; homework | practice exercise (reformat, rebuild) and a quiz | interactive exercise; 80% qualified assessment |
| Where conventions live | mostly in the knowledge-base articles, not the course | **in the live block**: colour, hardcodes, checks, layout, circularity | colour-coding lesson; formatting module | Financial Modeling Guidelines (36 sections), Quick Start "Basic Financial Setup" |

What all of them do that we do not:
1. **A task, not a shortcut, is the unit.** Every lesson produces a piece of a real file (a formatted summary, a rolled-up quarter, a template block). Ours produce a tidied toy.
2. **One growing workbook per module.** CFI builds one template across a course; BIWS reuses Walmart; the bootcamps live in one case model for a week. Ours restart from a fresh seven-row table thirty-two times.
3. **The exercise remixes, it does not repeat.** BIWS's practice exercise is a different, unformatted sheet; the bootcamp homework is a different schedule. Our "Try solo" is the same sheet with the hints hidden.
4. **Density**: a 5–7 minute WSP lesson covers a feature and its edge cases on a realistic sheet; a BIWS lesson covers principle, demo and exercise. Our 3–5 minute lesson is one shortcut, three goals, a 15-second reference solution.
5. **Conventions are content**, stated and applied in every modelling lesson, and the bootcamps open with them. Ours mention colour once in §1 and once in §6.
6. **Formatting is graded work**, not decoration: BIWS's exercise is "reformat this summary"; TTS's second article is entirely formatting. Our formatting lessons apply one command each.

What the live week has that no self-study product (theirs or ours) has: the case model built end to end with an instructor, firm-specific templates, homework review, and the valuation and deal days. That is Chapters 5–6 for us, not Chapter 1. **Foundations can be the bootcamp's pre-work plus the Day 1 morning block; it cannot be the week.** Chapters 2–5 are the week.

### 10.2 Why our 38 lessons read thin (measured from the lesson data)

- **Sheet**: 32 of 38 lessons run on a ≤10-row, ≤5-column table, and 32 of 38 carry the same Monday–Friday "Weekly Sales Report" figures (1200/950/1430/1100/1675), `entering-data` asking the learner to type them in. Largest sheet: the 63-row log in `page-keys`. Median populated cells: 19. Nothing a banker would open.
- **Goals and concepts**: median 4 goals, 1 concept; 14 lessons introduce exactly one concept; only five exceed five goals. Reference solutions average 20 keystroke tokens; 22 lessons have a legendary par under 20 seconds. A "3–5 minute lesson" is a 15-second task wrapped in 100 words of reading.
- **Read vs Do**: the brief plus teach lines average ~130 words against ~20 keystrokes. Panel text outweighs the work three to one, which is why the eye goes to the bottom of the panel: that is where the only live element (the current goal) sits, under the Read paragraph and the ticked goals.
- **Task vs list**: most lessons are lists of unrelated moves on the same table (hide a column, unhide it, freeze, unfreeze; bold this, border that). Six read as a job (`managing-sheets`, `page-setup`, `formula-errors`, `cross-sheet`, the project, the assessment).
- **What the learner has at the end**: in 29 lessons, the same toy table with one attribute changed; nothing carries to the next lesson. The project's Report sheet is built from scratch and then rebuilt from scratch in the assessment.
- **"Typing in cell ranges to go back"**: `Ctrl+G "<ref>" ↵` appears in the hints and reference solutions of **25 of 38 lessons, 83 times across 163 goals** — once every two goals — as the way to move to the next cell or select the next block. The project's own solution uses it 13 times in 10 goals. Nobody professional selects B3:B7 by typing it into Go To; they press Ctrl+Shift+↓. This is a **symptom**, not a teaching choice: the replay test requires each hint to land its goal deterministically from the previous end state, Go To was taught in the Welcome lesson, so authors used it as universal glue. It is teaching the wrong habit in every lesson it appears in. Framework §6 bans it; the brief adds the test.
- **Try solo**: identical sheet, identical goals, identical figures, hints hidden. It is a repeat, not a challenge; Wolf's "remix with random variations" reading is generous — there is no variation.
- **The race**: the Welcome pits the learner against a demo that crawls at 110 ms a row (3.3 s for 30 rows). The learner's clock starts on their first action, and a click on the sheet to focus it counts, so a beginner who clicks, reads "Your turn: jump back to the top with Ctrl+↑", finds Ctrl, and presses it loses the race the lesson exists to win (observed in the playtest: slow way 9.8 s total, "your way" 96.8 s, inflated by automation but the direction holds for any reader). The race should be the learner's own arrows against the learner's own Ctrl+Arrow.
- **Worst three**: `active-cell` (three goals, sixteen arrow presses, on the toy, nothing produced); `select-blocks` (a selecting lesson whose hints move with Go To and whose sheet has seven rows, so Ctrl+Shift+Arrow is barely needed); `fill-series` (a four-row "Ten-Day Sales Plan" with eight cells; the timeline it should be building is absent). Honourable mentions: `welcome-race` for the race it loses, and `undo-redo`, which asks the learner to type 0 over a figure in order to undo it.
- **Best one**: `managing-sheets`: a workbook that arrives untidy from a colleague, a job (rename, delete the stale copy, add a Summary, move it to the front), end-state grading with a free route, and a convention (tab names carry into every reference). It is the shape every lesson should have; it only lacks a bigger file.

### 10.3 What changed in this framework as a result

Lesson → Challenge replaces Read → Guided → Try solo → Timed (§1). Modules on a growing workbook, inside one deal narrative (Project Volt), replace a toy per lesson (§1, §3 `module`). Seeded challenge generators — content varies, workload never — replace the identical-sheet Try solo as the rep layer (§8). "One job per lesson" replaces "one new idea per lesson" (§4). Forty-seven sourced conventions with taught/enforced mapping replace ten bullets (§5). A movement vocabulary and a Go To rule replace nothing — there was no rule (§6). Task card pinned at the top of the panel; clocks start on the first key (§7). PBs and boards move from lessons to challenges (§8).

### 10.4 Honest pushback

- **Speed drills and a banking curriculum pull apart.** Timed play rewards the shortest keystroke route on a fixed sheet; banking rewards a correct, conventional, readable file and treats speed as a by-product of habit. If challenges are ranked on time alone, authors will keep sheets small and routes unique, and the product drifts back to toy tables. The framework resolves this by grading the artefact first and ranking only passing runs (§8), but it is a standing tension and the drill catalogue will keep pulling toward atomic tasks. Keep benchmark drills atomic (they are good at that); keep challenges dense.
- **"The WSP course" is two different things.** The self-study Excel Crash Course is a function catalogue with quizzes; nobody finishes it feeling they sat a bootcamp either. The value Wolf means is the live week, which is 80% model-building on a case company with conventions enforced by an instructor. Foundations should aim at the pre-work and the Day 1 morning; the week is Chapters 2–5, and the map is built that way.
- **3–5 minutes with one concept cannot be dense.** SITE_SPEC §4's "one concept, 3–5 goals" line is the root of the thinness and must change with this framework; the brief lists it as a spec edit for Wolf to approve.
- **The engine's grid is 100 × 26.** A realistic export is 30–60 rows and up to 10 columns, which fits; a P&L with a monthly timeline over three years does not (36 periods + labels). Chapter 2's workbook is designed to fit (annual + one monthly year); Chapter 4's exports are capped at 90 rows. Widening the grid is listed in the brief's traps as the one engine change that would let Chapter 4 use realistic exports.
- **Mac.** Alt chords are the banking norm and have no Mac equivalent; a Mac-first learner will be second-class in Chapter 1 §5 whatever we do. Say so in the first-run platform picker rather than pretending parity.

## Sources for the framing above

Structure and principles only; no content copied. Wall Street Prep Excel Crash Course, Financial & Valuation Modeling Boot Camp agenda, corporate training, financial modeling guide and shortcuts cheat sheet; Training The Street Applied Excel, Core Comprehensive and Undergraduate Boot Camp agendas, formatting and structuring articles; Breaking Into Wall Street Excel & VBA course page and knowledge-base lessons; CFI Excel Fundamentals (Quick Start; Formulas for Finance), Financial Modeling Guidelines and Financial Modeling Code; Macabacus shortcuts and formatting summary; Wall Street Oasis analyst threads; Financial Edge shortcuts and formatting. URLs are listed in `BANKER_CONVENTIONS.proposed.md`.
