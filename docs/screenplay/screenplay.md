# hotkey.gg Screenplay

The master design doc for every word on hotkey.gg, and the shell the build sessions scaffold from: the voice, each screen in the order a learner meets it, the Project Rinse story, every lesson and goal (in the chapter scripts), the practice catalog, achievements, chips and correction lines, the issues in the live copy, the decisions, and the keys syllabus with every accepted alternative (section 10). Chapter scripts hang off it; the first is claude/script-ch1.md. Last updated 2026-10-01: the interface standard (section 3.0) approved after six rounds on the design canvas, with M87 to M108; the site copy in 3.1 to 3.16 rewritten to it; one certificate; boards by time against the field; Chapter 1's drills resized; level titles; no dash as punctuation in learner-facing copy. Before that, 2026-09-30 (handed to the build: "Start here" says where the plan stands and carries the build session's prompt; the source pass applied: the fold-back plan of claude/source-checklist.md is in the six chapter scripts and here as DRAFT, with Wolf's calls of that day in section 11; the drill sketches for the code layer are in claude/script-drills.md; the finance left out is parked as add-ons in 4.10). Before that, 2026-09-28: the full curriculum shelled, Chapters 2–6 in claude/script-ch2.md to script-ch6.md, with the curriculum in one view, the skills ledger, the checks thread, the tips ledger and the desk audit in section 5; Wolf's first curriculum notes applied; the abbreviated review view in claude/curriculum-summary.md.

## Start here

### What this doc is for

One place to decide how the site talks, and to see every line in context before it goes live. The founder writes and approves; Claude drafts, edits and keeps it consistent. When a part is locked, its lines are converted into the copy sheets (app2/content/copy/*.csv) and imported into the site. Nothing here goes live on its own.

### Where it lives

In the repo, under docs/screenplay/: screenplay.md (this doc), script-ch1.md to script-ch6.md, script-drills.md, curriculum-summary.md, source-checklist.md and tools.md, plus interface/ (the approved screens, rendered as images). The claude.ai project "Gamified Excel Platform" holds the same docs under claude/, except interface/, which is in the repo and in hotkey-plan.zip only. Planning sessions edit the project copy and build sessions the repo copy; the plan (docs/REBUILD_PLAN.md, section 1c) says how the two stay in step. The two Google Docs of 2026-09-27 are a dead snapshot and aren't edited.

### How to edit it

  - Status tags: LIVE is on the site now, unchanged. **DRAFT** is a Claude proposal, not approved. **LOCKED** means the founder approved it; only he sets it, by saying so in chat ("lock 1.1", "lock section 3.1", "lock the voice") or by editing the tag. From 2026-09-30 the build codes from DRAFT: Wolf plays the built product and locks afterwards. **TBD** is a slot with nothing written. **FLAG** is a problem to fix. **RETIRED** means the line's surface is gone (M18, M21, M22, M28, M30).
  - To change a line, say so in chat or edit its text here. To reject a draft, say so; the *was:* line under it is the live text that stays.
  - Keys are in italics: a site.csv key, a sheet id, or the code file a hardcoded line lives in. It's how a line finds its way back into the site. Leave keys alone. A key marked *(new)* doesn't exist yet; M1 creates it.
  - To tweak the voice, edit section 2 or say so in chat. Change a dial, a rule or a calibration line there, and every later pass follows it. That is the fastest way to move the whole site at once.
  - Open questions (9.1) carry a working answer from Claude so the writing doesn't wait; the founder can overrule any of them in one line.

### Where the plan stands (2026-10-01)

Planning is finished to the point where the build takes over. Wolf's call on 2026-09-30: he gives less input while the curriculum is built, and refines by playtesting the result. His call on 2026-10-01: build the interface from the guidance in 3.0, built for change, and adjust the look in code once the content is in.

| Part | Where | Status |
| :- | :- | :- |
| The voice, the case, the keys, the decisions | Sections 2, 4, 10, 9 and 11 | Drafted. The working answers in 9.1 stand until Wolf overrules one |
| The interface | Section 3.0; docs/screenplay/interface/ | Approved 2026-10-01. Tokens, components, every page, the moments, and the eleven things to get right now because they are expensive to change later. Built in run R1b |
| The site's own copy | Sections 3.1 to 3.16 | Rewritten 2026-10-01 to the interface standard; dry and short off the lessons |
| Chapter 1 | script-ch1.md | At goal level: 39 items, 315 goals, each with a teach line and a stuck cue. Built on the earlier case (Voltline); re-skinned to Clearcoat in run R1 |
| Chapters 2–6 | script-ch2.md to script-ch6.md | Shelled: the workbook, the finance taught, story cards, and each lesson's brief, goal outline and done line. The build session writes each to goal level as it builds it |
| The practice layer | Section 6; script-drills.md | Chapter 1's twelve built drills merged into eight, plus three sketches, eleven of one to three minutes (6.1), 35 planned drills and 6 puzzles (6.2), 65 sketches with a wave each (6.2b), rapid-fire, the Daily, quests, achievements, boards by time against the field, and XP with level titles (6.10) |
| The red pen | Section 7 | Drafted |
| The build list | Section 9.3 | M1–M108 |
| The source pass | source-checklist.md | Applied. Its section H holds the notes for the build session and its section C how the paid courses teach each idea |
| The one-view summary | curriculum-summary.md | Generated; never edited by hand |

What is not done, and is the build's to do: Chapters 2–6 at goal level; the case numbers confirmed on a real Chapter 5 workbook; the hardcoded-strings inventory from the repo, so section 3 misses no label, tooltip or toast (M1).

### How a build session uses these docs

The work order is the plan's section 2a: runs R0, R1, R1b and R2 to R7, in order, each with an exit check. The rules, in short:

  - Build from DRAFT. Nothing waits for LOCKED.
  - Write Chapters 2–6 to goal level as each is built: the goal line, the teach line and the stuck cue for every goal, to the rules under "Writing rules in one place" below, with Chapter 1's script as the model. The copy sheets hold that text. A departure from a shell gets one line under "Built differently" at the end of that chapter's script.
  - Take the working answers in 9.1 and the open calls at the end of each chapter script as decided: the stated default, or the first option where none is stated.
  - Build a chapter's workbook before its lessons, and cut each lesson's start state from the solved sheet.
  - Build every screen to the interface standard (3.0). Run R1b rebuilds the screens that exist; everything built after it starts from the standard's tokens, the rail, the run panel and the task card. Build for change (3.0): the look will be adjusted in code once the content is in, so put the effort into the eleven things 3.0 lists as expensive to change, not into pixel polish.
  - Never change a lesson id, a goal number, a key or a slug that is already live. A task that has to change gets a mechanics request in 9.3, numbered from M109.
  - Log a decision in section 11 only when it changes what the course teaches or how the site behaves. Everything else is the build's own business.

### The prompt that starts the build session

Paste everything between the two rules into a new Claude Code session on the repo, with hotkey-plan.zip attached. The same prompt restarts the work in a fresh session.

-----

You are the sole developer of hotkey.gg, picking the rebuild up with a finished content plan. Wolf, the founder, is non-technical. He wants the whole curriculum built with as little input from him as possible, and he will refine it by playing what you build. So: don't ask what the docs answer, and don't wait for approval between runs.

Step 0: get the plan into the repo (run R0). Work in github.com/rathunter69/hotkey.gg on branch `rebuild`. The plan is twelve documents, a CLAUDE.md and a folder of rendered screens. Take them from hotkey-plan.zip, attached to this session and already laid out in repo paths: docs/REBUILD_PLAN.md, docs/screenplay/ (screenplay.md, script-ch1.md to script-ch6.md, script-drills.md, curriculum-summary.md, source-checklist.md, tools.md, and interface/ with the approved screens as images) and CLAUDE.md. If the zip is missing a doc, take it from the claude.ai project "Gamified Excel Platform", which holds the plan under claude/ (project_read claude/<name>.md; rebuild-direction.md there is the plan). Other projects hold older prompts, and an older build-session-prompt.md anywhere is replaced by this one. If you can reach neither source, stop and say so, and do not build from memory. Replace CLAUDE.md with the one in the zip (the same text is printed in docs/screenplay/tools.md). Remove the superseded docs and add the two pointers named in the plan's section 1c. Run `node app2/tests/run-checks.js`, commit, push.

Then read, in this order: CLAUDE.md; docs/REBUILD_PLAN.md in full (section 2a is your work order); in docs/screenplay/screenplay.md, "Start here", then sections 2 (the voice), 3.0 (the interface standard), 4 (the case), 5 (the curriculum), 6 (the practice layer) and 9.3 (the build list, M1 to M108); docs/SITE_SPEC.md and docs/LESSON_FRAMEWORK.md for how the site and lesson data work, remembering that the screenplay wins where they disagree. Look through docs/screenplay/interface/ once, before R1b. Read each chapter's script, and its drills in script-drills.md, when you reach its run.

Then work through the rest of the runs in section 2a, in order (R1, R1b, then R2 to R7), without stopping between them:
- Build from DRAFT. Every DRAFT line is good to build; Wolf locks lines after he has played them.
- Chapters 2 to 6 are shells. As you build each, write every goal's line, teach line and stuck cue yourself, in the voice of screenplay section 2 and inside the limits in "What the site enforces", with script-ch1.md as the model. That text lives in the copy sheets. Where you have to depart from a shell, add one line under "Built differently" at the end of that chapter's script.
- Open questions never block: screenplay 9.1's working answers and each script's open calls stand as written.
- Build every finished page and every drill's solved sheet through one shared page module, to the sheet standard in screenplay section 5 (M86), so they all look like one desk's work. Build that module first.
- Build every screen to the interface standard in screenplay 3.0, and build it for change. Wolf will adjust the look in code once the content is in, so: tokens in one file, one component per element, every string in the copy sheets, repeated layouts rendered from data. Put the care into the eleven things 3.0 lists as expensive to change later, and in R1b build those first (M96 to M99, M101, M102, and the level table from M103), then the screens (M87 to M93, M95, M104 to M106). Rapid-fire's stage (M100) and the achievement art (M103) wait for R7, as the plan says. The rendered screens show the intent; where one differs from 3.0, 3.0 wins, and nothing needs matching to the pixel. The copy checks in M94 go in at the start of R1, so no line lands with a dash, an emoji or a string of dot-joined fragments. The old build is not the reference for the look; only its Ribbon is kept as built.
- Build each chapter's workbook first and tie it, then cut every lesson's start state from the solved sheet. For Chapter 5, confirm the case numbers on the real model before the lessons (the notes are in source-checklist.md, section H).
- Use subagents where the work splits cleanly: lessons of independent modules in parallel, and an independent review of each module against its script, the voice rules and native Excel behavior before you call it done. Keep engine and workbook work in one thread.
- A run is done when the fast check is green, every lesson's reference solution replays, the preview is updated and the run's row in docs/REBUILD_PLAN.md is marked DONE with the date. Then tell Wolf in five lines what was built, what was built differently and what to play first (with screenshots when the run changed how a screen looks), and start the next run.

Hard stops, unchanged: work lands on `rebuild` and nothing reaches `main` without Wolf's OK; write migrations under app2/supabase/ and never apply one to the live database; Stripe stays in test mode; no change to live pricing or legal pages; only the Supabase publishable key in client code.

If this session ends before the work does, a new session started with this same prompt reads the plan and resumes at the first run not marked DONE.

-----

### Writing rules in one place

For whoever writes lesson copy, a person or a session. Section 2 is the full version.

  - The voice is section 2. In short: warm, specific, a little wry; concept, key, why, in that order, in one breath; the reason is the learner's own interest; "you", "we", "let's"; aspiration allowed (top firm, elite firms, power users), costume not; no praise for ordinary work, no exclamation marks outside a tier result; every key by name and every cell by address, never "ctrl whatever", never cute; finance taught through the car wash; plain sentences with verbs, never stacked fragments ("new page, on your own, timed") in lesson prose; the frame is the company's own work (rationalizing data, cleaning up the business's worksheets, working the financials so a sale process has what it needs), never "prepping things for the bankers". Two registers: lessons in short paragraphs; drill bars, buttons, quests and the paywall in one clipped line ("Time's Up. Keep Drilling."). No dash as punctuation in either, and none of the other tells listed at the end of 3.0.
  - Lesson anatomy: story card (title and a three-sentence body, roles only, no dialogue; an email fragment as commentary is allowed) · brief (≤ 5 sentences, ≤ 110 words, ends "The key is `X`.") · goals (one imperative, ≤ 140 characters, names a cell, range, sheet, key or command) each with a teach line (≤ 3 sentences, the why inside) and a stuck cue ("pulse <target> · <one subtle line>", never the answer) · done screen (one line, then a short paragraph or two split by ||). Optional: a demo before the goals, a mac_note, a Best practice or Top-bucket tip inside a teach line or done screen. Challenges have goals only. Every lesson from 1.3 on closes with "Does it tie?".
  - Limits are the checker's: American spelling, no "house style", no "first-year", and the say/don't-say table in section 2.
  - Decisions already made are not reopened unless Wolf reopens them: the company is Clearcoat Express (an express car wash, forty sites in Texas, Austin cluster first) and the learner works on its finance team, no title; the deal is Project Rinse, a sale to private equity; six chapters named Foundations · Formatting · Formulas · Data and Lookups · Finance and Accounting · Valuation, about twenty hours, all fully written and built at launch; the assessment is the test-out; there is one certificate, hotkey.gg Certified, Excel for Finance, and each chapter's Completed and Verified are progress toward it (a status and an achievement, never a certificate of their own; 3.0, 2026-10-01); the paid tier is Pro at $29 to own the course or $10 a month, and the drill tiers are Pass · Expert · Legendary; quests replace Due today; rank and the sandbox are retired at launch; Enter stays on the cell after 1.1.4; Alt+PgDn/PgUp is the browser alias for the sheet keys; notes are taught, only source labels are graded; four QAT commands; no Excel Tables.


## 1. The project in brief

  - **What it is.** A learning-first Excel platform with a real sheet and Ribbon in the browser. You learn by doing, one job at a time; speed and competition are the layer you graduate into. The bar is the week-long in-person bootcamp investment banks buy for incoming analysts and summer interns (Wall Street Prep, Training The Street, BIWS, CFI): its material, habits and conventions, ported onto an interactive sheet, plus the consulting habits (the title says the answer, a source under every table) the same people meet across the table.
  - **Who it's for.** Built for the incoming analyst or summer intern who would otherwise sit through a bootcamp before day one, and for anyone else who never got taught Excel properly: MBAs, finance and operations people, founders. Banking is where the method comes from, not a prerequisite. The copy never tells the learner who they are; it hands them the analyst's work and lets them do it.
  - **Free and paid.** Chapter 1 (Foundations) is free in full, with its challenges, drills, boards and the Daily. Chapters 2–6 are Pro: $29 to own the course or $10 a month, one plan (9.1, question 11), with the guarantee on the pricing page (3.0). Checkout isn't built yet, and the live pricing page doesn't change until Wolf says so.
  - **The story.** Project Rinse. Clearcoat Express runs 40 express car washes across Texas and its owners are selling to private equity. You work on the finance team; the CFO, then the bankers, then the buyers' diligence teams ask for pages, and you build them. Each chapter is one stage of the sale and produces one document. Section 4 has the business on a napkin, the people, where the mess comes from, the stages and the arithmetic ladder; section 5 is the curriculum.
  - **The shape of the site.** Landing, then a three-step first run, then lesson 1.1.1. Lessons sit in modules; every module ends with a timed challenge on a fresh file, graded on conventions as well as numbers. A dark left rail carries Home, Learn, Practice (drills, the Daily, rapid-fire, challenges), Leaderboards, Reference and Account. Section 3.0 lays out every screen; 3.1 to 3.16 carry their copy.
  - **How copy gets onto the site.** Five sheets in app2/content/copy/: lessons, goals, modules, site, micro. A checker enforces the limits before anything goes live. A lot of copy is still hardcoded in the JavaScript (drills, achievements, chips, correction lines, most page chrome); section 9 asks for it to move into the sheets.
  - **Fixed unless the founder changes it.** The six-chapter spine (Foundations · Formatting · Formulas · Data and Lookups · Finance and Accounting · Valuation) and the car-wash case; Chapter 1's module order and its items (re-skinned, tasks kept except where the founder's markup changes them, e.g. M30); lessons inside modules on a growing workbook; grading on conventions; one narrative, impersonal roles, no named characters, no title for the learner; the free/paid line; the ids.

## 2. The voice

Rewritten 2026-09-27 from Wolf's two calibration batches (nineteen lines, in the table below). His column is the standard; the rules here are what his lines have in common, not phrases to reuse. Edit this section first. Every other section follows it.

### In one paragraph DRAFT

hotkey.gg sounds like Wolf teaching: someone who did the job at a top firm, talking to a smart person who hasn't, who would rather they got good than felt good. Warm, direct, a little wry ("as usual, they're a mess"; "the better you are in Excel, the less painful the process will be"). It explains the concept before the key, then says why it matters at work, in the learner's own interest ("you'll appreciate it the day you inherit a well-formatted workbook"). It's specific about keys and cells every single time, and never cute about them. It says "you", "we" and "let's". Off the lessons (on drill bars, buttons and the paywall) it goes clipped and dry ("Time's Up. Keep Drilling."; "Go Pro for the rest").

### Seven rules DRAFT

1.  **Concept, key, why: in that order, in one breath.** "Unlike a normal shortcut, a hotkey chord runs in sequence: Alt opens the Ribbon, then each letter picks a menu option." Explain what the thing is before naming the key; give the reason in the same paragraph.
2.  **Specific or nothing.** Every key by name, every cell by address, every command by Excel's name for it. Never "ctrl whatever", never "fly across the page", never a rhyme. If a line can't name the key, it has no business mentioning one.
3.  **The reason is the learner's own interest.** Fewer hours, less pain, a file they can hand off, a workbook they'll be glad to inherit, a CFO who can read the page. Not "because that's the rule".
4.  **Warm, not soft.** A wry aside is fine. Praise for ordinary work isn't; "great job" isn't; exclamation marks aren't, outside a tier result. Encouragement comes from the payoff.
5.  **Two registers.** The lesson voice: short paragraphs, "let's", a concept explained, and every sentence has a verb. The game voice: fragments, title case, one line, no explaining ("Press any key to start." "Time's Up. Keep Drilling."). The fragments stay on the game surfaces, each in its own place on the screen and never strung together with dots, pipes or dashes (3.0); in a lesson they read as a tic (Wolf, 2026-09-27: "new page, on your own, timed" is a no; "time to execute" is a yes).
6.  **Aspiration is allowed; costume isn't.** Top firm, elite firms, power users, "the way you were probably never taught": yes. Desk slang for its own sake, job titles for the learner, "as a banker you": no.
7.  **Finance is taught through the car wash.** Every finance term is defined in the sentence it first appears, with a wash, a member, a tunnel or a site as the example. Deferred revenue is a member who paid on the first.

### Dials DRAFT

| **Dial** | **Setting** | **Sounds like** |
| :- | :- | :- |
| Contractions | On everywhere except legal pages | You'll need to fix the formatting before sending it to the CFO. |
| Sentence length | Lessons: 2–4 sentence paragraphs, one idea each, every sentence with a verb. Game surfaces: one line. | The numbers are right, but your job isn't finished just yet. |
| Who's talking to whom | The instructor to "you"; "we" and "let's" for the class; everyone else is a role (the CFO, the bankers, the buyers) | Let's keep exploring hotkeys, and build the muscle memory to make them second nature. |
| Banker flavor | Medium-high: the standard is named and aspired to; never as costume | The Ribbon is the open secret of Excel power users, and the reason a mouse is taboo at elite firms. |
| Warmth | Warm and a little wry. Encouragement is the payoff, not praise | You can have all the right numbers, but it doesn't matter if nobody can read it. |
| Finance terms | Defined in the sentence they first appear, through the business | Deferred revenue: think about a wash-club member who pays $30 on the first of the month. |
| Humor | A dry aside in story cards and done screens; none in goals; the hidden achievements and the 404 | Weekly reports are in. As usual, they're a mess. |
| Punctuation | No dash as punctuation, anywhere a learner reads (Wolf, 2026-10-01: it reads as machine-written). A period, a comma, a colon or parentheses does the job. A colon before a list; title case on game surfaces; no exclamation marks outside a tier result | Time's Up. Keep Drilling. |

### Register by surface DRAFT

| **Surface** | **How it should sound** | **Wolf's example** |
| :- | :- | :- |
| Landing and marketing | Plain and aspirational; claims, not adjectives; mode captions as fragments with pipes | Learn like an analyst at a top firm, and build the muscle memory to make it stick. |
| Deal cards and story cards | Where the deal is, what's wrong with the file, who's waiting for the page; plain sentences | You work for Clearcoat, an express car-wash company that's getting ready to sell to private equity. |
| Brief | The concept, the job, the key; up to five sentences | Unlike normal keyboard shortcuts, Excel hotkeys operate in sequence. |
| Goal line | One imperative naming the thing on the sheet | Round two: back to the top with Ctrl+Home, then the same trip in one Ctrl+↓. |
| Teach line | What the key does and why it matters, up to three sentences | If you're ever lost, you can check the Name Box to see your cell coordinates, left of the formula bar. |
| Stuck hint | A visual cue first (the target, the tab, the keycap pulses), then one subtle line, never the answer | Start from A1 this round. |
| Best practice / Top-bucket tip | Two sentences, the desk habit, no grading | Top borders are generally preferred so that you can add rows of data and not have to fix the total border. |
| Done screen | One line with a verb in it, then the payoff paragraph | There's the slow way, and the way you were probably never taught. Saving a few seconds here and there compounds into hours saved. |
| Correction line (grader) | What the cell is, in plain words with the desk word beside it, then why we do it, for the reader; "we"; two sentences allowed | D14 was typed into the cell. It's a hardcode, or static number, so we use blue to emphasize to anyone reading the sheet that it's a hardcode. |
| Drills and the clock | Terse, title case, the clock does the talking | Time's Up. Keep Drilling. |
| Paywall and pricing | Dry, one line | Go Pro for the rest of the content. |
| Home, Practice, quests | One line each, imperative | Finish two drills. |
| Account, errors, system | Plain and honest about what happened | Couldn't save, will retry. |
| Legal | Plain English, no voice at all | – |

### Calibration lines

Wolf's column is the standard for the words. His spaced hyphens are how he typed them; on the site each becomes a period, a comma or a colon (the Punctuation dial, 2026-10-01). Two batches (2026-09-27): ten rewrites of Claude's drafts, then nine written blind; then four correction lines written blind the same night. Read-out from the four: the correction line says what the cell is in plain words with the desk word beside it ("a hardcode, or static number"), says "we", and gives the reason for the reader in a second clause; it can run to two sentences. The company was Voltline when the first lines were written; the words stand, the name doesn't.

| **Where** | **Claude's draft, if any** | **Wolf's version (the standard)** |
| :- | :- | :- |
| Landing subhead | Learn Excel the way banks teach their analysts: on a real sheet, one job at a time. | Learn like an analyst at a top firm - and build the muscle memory to make it stick |
| Deal card 1 | Voltline runs 40 fast-charging sites for electric cars. The owners are selling. Before a buyer sees a single figure, somebody has to make sure it's right. That's you. | You work for Voltline, an EV-charging company that's getting ready to sell to private equity. Before you can start a sale process, your company needs to clean data, compile documents, and reconcile financials. That's where you come in - and the better you are in excel, the less painful the process will be. |
| Story card 1.1 | The file's in, and it's in the usual state. A tab still called Sheet2, half an old export, no page for the report, a price buried inside a formula. | Weekly Reports are in - and as usual, they're a mess. Tabs are disorganized, data is scattered, and there aren't any comments to help you figure it out. Before you use any of this data in the sale process you'll need to clean up the page and make it client-ready. |
| Brief 1.1.2 | Every command in Excel is reachable without the mouse: press Alt and a letter shows up on everything. Walk the Ribbon that way once, then turn the gridlines off on Report. | The Ribbon is the hidden secret of Excel power users - and why using a mouse is taboo in elite firms. Unlike normal keyboard shortcuts, Excel hotkeys operate in sequence. Alt opens the ribbon, then each key corresponds to a menu option. You can always use the ribbon key markings to select an option - but with repetition you'll be using hotkey "chords" without even looking at the ribbon. |
| Teach line 1.1.1 #2 | Ctrl+Home returns to A1 and Ctrl+Arrow jumps to the edge of the data in one press; the Name Box, left of the formula bar, shows the cell you landed on. | Sometimes when you're navigating a large sheet you can get lost - remember that Ctrl+Home takes you back Home to A1. You can navigate the data much faster by using Ctrl+ arrow key to jump to the edge of a range of data - left, right, up, or down. If you're ever lost, you can check the name box to see your cell coordinates - left of the formula bar. This is also where you can add named cells - which we'll talk about later. |
| Why line 1.1.4 #3 | A reviewer sees blue and knows it was typed, so they know exactly what they're allowed to change. | Your work in excel will get emailed, printed, or passed off to someone other than yourself - and they need to be able to understand your work. Blue universally indicates a hardcode - static data, ideally with a source provided in a comment. Black font indicates a formula - or dynamic data. When someone opens your workbook and everything is properly color coded, it's much easier for them to understand and audit your work - and you'll appreciate it when you inherit well-formatted workbooks. |
| Done screen 1.1.1 | Sixty presses the slow way. One the fast way. Same cell. / That difference is the whole course. | There's the slow way, and the way you were probably never taught - and saving a few seconds here and there compounds into hours saved. Let's keep exploring hotkeys - and help you build the muscle memory to make them second nature. |
| Correction line | D14 is a typed input, so it should be blue. | The revenue in D14 is a typed, static value - and should be blue to show that it's hardcoded. |
| Time's up | Time's up. Try again. | Time's Up - Keep Drilling |
| The Daily, landing caption | Ninety seconds. Same sheet for everyone. Once a day. | Daily - unique 90s challenge \| daily public leaderboard |
| Story card 1.5 (blind) | – | Great - the numbers are right, but your job isn't finished just yet. You'll need to fix the formatting and make it pretty before sending it to the CFO. You can have all the right numbers but it doesn't matter if nobody can read it. |
| Done screen, a formatting lesson (blind) | – | You just added a top border to a total row - top borders are generally preferred so that you can add rows of data and not have to fix the total border. |
| Finance explanation, deferred revenue (blind) | – | Deferred revenue: think about a wash-club member who pays $30 every month. They've paid for services but the car wash hasn't yet delivered those services - therefore, the revenue is deferred until the time of the service, after which the company can recognize revenue. *(Claude's correction for the lesson: for a monthly membership the revenue is recognized over the month as the service is delivered, about a dollar a day, not per wash; on the 1st it's all deferred, by the 31st it's all revenue.)* |
| Top-bucket tips (blind) | – | Things like adjusting borders, cell sizing; general modeling best practices that don't fit into actual Excel stuff and might be more firm specific. *(Claude sources the list; section 4.8.)* |
| Landing (blind) | – | The better way to master Excel / Learn Excel |
| Paywall (blind) | – | Go Pro for the rest of the content. |
| Stuck hint (blind) | – | Make it subtle – use visual cues to show the chord, or the Ribbon thing to go to. *(A cue first, then a line.)* |
| Negative sample: the tone to avoid | – | "Make it tie - ctrl whatever makes you fly across the page" *(vague about the key, cute about the move, a rhyme. Never.)* |
| Negative sample: the stacked fragment (2026-09-27) | New week, blank Report, nothing new to learn – just everything you've done, start to finish, on your own. | *Wolf: "there's still a tendency to add 'new page, on your own, timed' in that weird style – just be like time to execute." A sentence with a verb, every time.* |
| Correction line, a hardcode (blind, 2026-09-27) | {ref} is a typed value shown in {color} – typed values are blue, so a reader knows they can change it. | {ref} was typed into the cell - it's a hardcode, or static number, so we use blue to emphasize to anyone reading the sheet that it's a hardcode. |
| Correction line, a formula (blind) | {ref} is a formula shown in blue – blue says "typed", and a reader would overwrite it. | {ref} cell has a formula - which can use data in other cells as input. |
| Correction line, a minus sign (blind) | {ref} shows a minus sign – negatives read in parentheses on a page. | {ref} shows a negative sign; you can use cell options to adjust the formatting of the cell (decimal places, commas, and how to show negative vs. positive) |
| Correction line, a merge (blind) | {ref} isn't centered across {n} columns – Center Across Selection, never a merge. | We use center across selection instead of merging cells - this keeps your sheets more resilient for when you add or delete columns (otherwise, inserting/deleting columns or rows will push/pull your data). *(Wolf: "make this more eloquent"; Claude's version is in 7.2.)* |

### Say, and don't say DRAFT

| **Say** | **Not** | **Why** |
| :- | :- | :- |
| the standard · the team's format · the way the book does it | house style · house standard · house set · house convention · house codes | The learner has no house. It reads as insider costume. Ruled out in the brief. |
| an analyst · the associate · the buyer's analyst | first-year · you, the analyst | Roles are the people around the learner, never who the learner is. |
| the file · the sheet · the page · the pack · the data room (defined once) | the deliverable · the artifact · the asset | Say the thing, not the category. |
| ties · live · typed · on the clock | reconciles appropriately · dynamic · hardcoded value entered | Desk words are fine once they're plain. |
| (nothing) | simply · just · easily · genuinely · honestly · great job · oops | Filler, or praise for ordinary work. |
| practice (noun and verb) · color · center · organization · license · labeling · around | practise · colour · centre · organisation · licence · labelling · round (for around) | American spelling throughout. |
| plain description | dressed as · wears · re-clothed · journey · unlock · master | Metaphors a reader has to translate back. Chapter 2's "dressed" and "wears" are the main offenders. |
| (imperative: "Select B4.") · let's · we | please · you should · you'll want to | The instructor tells you what to do; "let's" and "we" are the class. Politeness padding reads as a manual. |
| a plain sentence with a verb ("Time to execute: build the page, then build it again on the clock.") | a sentence made of stacked fragments ("new page, on your own, timed"; "Commas, no stray decimals, $ where it belongs") · the "X, Y, Z, and W" tag with a dash before the last item · "That's X." as a closer more than once a module | Wolf, 2026-09-27: it reads as a tic. Fragments belong on game surfaces, each in its own place on the screen, not in lesson prose. Recaps may list, but each item carries a verb. |
| the fast way · the move · the open secret · Reference | hack · trick · pro tip · cheat sheet · ninja · guru · wizard (Excel's own "Text to Columns Wizard" is a name and stays) | "Secret" is fine the way Wolf uses it (the open secret of power users); the rest is clickbait. |
| plain description | level up · supercharge · boost · crush it · nail it · kill it · game-changer · next level · 10x | Marketing verbs. The payoff is the claim. |
| the pack · the page · the book · the data room | deck · turn (comments) · grind · all-nighter · the Street · sweat the model | Desk slang as costume. |
| what happened, plainly ("Couldn't save, will retry.") | oops · uh oh · whoops · yikes · sorry! · something went wrong | Apologetic system copy. Say the thing. |
| (cut) | basically · actually · really · very · kind of · sort of · a bit · quite | Hedges. |
| you | learner · user · player · student · candidate · trainee (in learner-facing copy) | Nobody in the room is called "the learner". |
| (nothing) | junior · newbie · beginner · novice · rookie (as a label for the learner) | The learner is capable; the material is introductory. |
| an analyst · the associate · the team · the standard | as a banker you… · IB · bankers like you · Wall Street wants | The learner is never told they're a banker. |
| press · open · select · type | click · tap · hit (for keyboard actions) | Keyboard first. "Click" is for the one thing the mouse is allowed to do. |
| define it in the sentence, once per chapter | data room · the book (CIM) · EBITDA · LTM · run-rate · sponsor · strategic · IOI · SPA · WACC · MOIC · accretion, used bare on first appearance | Finance terms are defined where they first appear (dial: Finance terms). |
| periods · commas · a colon before a list or an explanation · parentheses for an aside | a dash as punctuation, long or short · exclamation marks (outside a tier result) · emoji or a symbol standing in for an icon · ALL CAPS · facts strung together with middle dots or pipes · an arrow on a button | Punctuation dial, and the list in 3.0. Wolf, 2026-10-01: these are what make copy read as generated. The checker fails them (M94). |
| Chapter 1 · practiced · on a real sheet · the better way to master Excel (marketing only) | Foundations (in running text) · learn Excel fast · in seven days · become an Excel expert in a week | Decision 5 and the headline. "Master" is allowed on the landing page in Wolf's phrasing; nowhere inside a lesson. |
| American spelling and order: Week of Sep 15, MM/DD/YYYY | whilst · amongst · learnt · spelt · fortnight · w/c · week commencing · cheque · programme · 15 Sep · DD/MM/YYYY | British forms the checker doesn't catch. |
| the key by name, the cell by address | ctrl whatever · fly across the page · zip around · any rhyme or jingle about a shortcut | Wolf's negative sample. Specific or nothing. |
| Pro (the plan) · Pass · Expert · Legendary (the drill tiers) | premium · paid tier (in learner-facing copy) · pro clock · pro time | Decided 2026-09-27 (9.5). "Pro" means the plan and nothing else. |

### What the site enforces

  - Brief: at most 5 sentences and 110 words, ending with the headline key in backticks (M28 raises the checker from 3 and 70).
  - Goal: at most 140 characters, one sentence, ends with a full stop, and names something visible: a cell, range, sheet, quoted label, key or Ribbon command.
  - Teach: up to three sentences, the why inside; the why field is retired (M28). Stuck: "pulse <target> · <one subtle line>" (M27).
  - Everywhere: no dash as punctuation, no emoji or symbol icons, no facts joined by dots or pipes, no capitals or letter-spacing for labels (3.0; M94). American spelling; no "house style"; no "first-year". Excel's own names for things (Format Cells, Center Across Selection, the Name Box, Go To Special). Keys as Excel writes them: Ctrl+Shift+↓, Alt H O R, F2.

## 3. The site, screen by screen

Rewritten 2026-09-27 to the company side and the voice (section 2), with quests in place of Due today, the sandbox and rank retired, Pro as the plan and Pass · Expert · Legendary as the tiers. Section 3.0 is the interface standard (2026-10-01): how every screen is laid out, colored and moved; it comes first and the screens below are read through it. Then the screens, in the order a learner meets them. Each screen opens with what happens, then its lines. Keys that look like *landing_subhead* are rows in site.csv; keys that name a file are hardcoded there today; *(new)* marks a key that doesn't exist yet (M1 creates it). Excel's own interface words (dialog titles, Ribbon labels, Options rows) copy Excel and aren't listed. Still owed: the hardcoded-strings inventory rebuilt from the code, so every label, tooltip, toast and empty state is here (work plan 6). Every line below is **DRAFT** unless it says LIVE, LOCKED or RETIRED; where a live line exists it sits under the draft as *was:*.

### 3.0 The interface standard

**Status: approved for build (Wolf, 2026-10-01), after six rounds on the design canvas.** The drawings are on the claude.ai canvas "hotkey.gg interface" (pages Round 3 to Round 6; Round 6 is the latest) and rendered as images in docs/screenplay/interface/. Where a drawing and this section differ, this section wins. The code is M87 to M108. Most of it is built in run R1b; the copy checks (M94), General format (M107) and the resized drills (M108) come earlier, in R1, and rapid-fire's stage (M100) and the achievement art (M103) later, in R7.

Wolf's instruction for this section (2026-10-01): build from the guidance, then adjust in code once the content is in, rather than drawing every screen to the pixel first. So the standard does two jobs. It fixes the things that are expensive to change once built (the data a screen needs, the components, the keys), and it states the look as tokens and components, so that changing a color, a size or a layout later is a one-file edit.

#### Build for change

  - **Tokens in one file.** Every color, size, radius, space and duration is a CSS variable in app2/ui/tokens.css, and each theme supplies the same names. No hex value, pixel size or duration appears anywhere else in the CSS or the JS.
  - **One component per element.** The rail, a panel, a table, a keycap, the tier marks, the time track, the checklist, the task card, a menu, a dialog, a banner and each motion moment are built once (ui/components/) and used everywhere. A page is a layout of components, never its own copy of one.
  - **Copy in the sheets.** Every string a learner reads lives in the copy sheets (M1), so a wording change is a sheet edit.
  - **Layouts as data where they repeat.** Settings, Reference, the drill catalog, achievements and level titles render from data files, so adding a setting or a title is a data edit.

#### Get these right now, because they are expensive to change later

1.  **Every timed run records** its time, the keys pressed, the route's key count, the goals and when each landed, whether help or the mouse was used, the tier, and the device's keyboard layout. Boards, pace, the result panel and recalibrating pars all read this one record (M96).
2.  **The drill catalog carries** the length class (60, 90, 120, 150, 180 seconds, or long), the lesson it's taught in, its tags (stretch, long, benchmark), its mode, its pars and its reference route, so the set picker and the catalog never need a schema change (M97).
3.  **The checklist is one state machine** for 1 to 60 goals: pending, current, done, with an assisted flag per goal (M98).
4.  **The task card's placement** is computed from the target's geometry, the visible grid, the selection, any note and the card's own size, with a fallback dock, and is tested on every lesson's goals (M90).
5.  **One KeyTips registry** for site pages (letters below), separate from the Ribbon's. Inside a lesson, a challenge or a drill, Alt belongs to the Ribbon alone, so the two never overlap (M88).
6.  **One moments registry** (ui/effects.js): every animation is a named moment with a duration, the Effects setting and reduced motion respected, a queue so banners never stack, and any key skips it (M95).
7.  **The progress model**: lessons, modules, chapters, the chapter assessment, and one certificate for the course. Chapter Verified is a status and an achievement, not a certificate (M102).
8.  **Levels, titles and rewards are a data table** (6.10), and the XP curve is a function with its constants in one place.
9.  **Settings are one preferences object**, synced to the account, with a schema version (M101).
10. **A mode color per mode** as a token (Learn, Drills, the Daily, Rapid-fire, Challenges, the clock), so each page takes its color from its mode and not from its own CSS.
11. **Zoom to fit**: a drill or challenge opens with the sheet zoomed so its used range fills the sheet area (100% to 150%), and the zoom is a sheet property the engine owns (M99).

#### The rules

1.  **Keyboard first, on every page.** Every page works without a mouse, and shows how: Alt puts a letter on everything a page offers, the cell cursor marks the focus, Enter does the primary action and Esc goes up a level.
2.  **One primary action per screen, and Enter does it.** Home: resume the lesson. Practice: start drilling. A drill: press any key. A result: the next drill.
3.  **Less to read.** Names, marks and numbers first. A sentence appears only for the selected item or for a task. A heading never has a line under it that says the same thing again; facts that belong to a heading sit on the same line, at the right.
4.  **Pages are laid out the way the course lays out a sheet.** One strong left edge. Tables with a rule above the header and hairlines between rows, labels left and figures right in tabular numerals. Side-by-side columns end on the same line: the last panel in a column stretches to meet its neighbor.
5.  **Color is state, and each mode has one.** The table below. No decorative color, no icon tiles, no gradients.
6.  **The cell cursor is the focus mark**: a 2px outline in the page's mode color with the small square handle at its bottom right.
7.  **Nothing pops out when the page can hold it.** A result, a level-up, a paywall and Help all appear inside the page or the panel. A dialog is only for a confirmation or for signing in. Banners come one at a time.
8.  **Type sizes stay close together.** Each page has at most one large line: the landing headline, the rapid-fire prompt, a result's time.
9.  **One typeface for words.** Hanken Grotesk for every label, button, heading and sentence; JetBrains Mono for keys, cell addresses, formulas, times and the wordmark.
10. **Every fact gets its own place.** No line is a string of fragments joined by dots, pipes or dashes.
11. **As many as the content has.** Nothing grouped in threes for the look of it; no grid of look-alike cards.
12. **Motion answers an action or marks a change of state**, from the moments table. Nothing animates because the page scrolled.
13. **Every pair of text and background passes contrast**: 4.5 to 1, or 3 to 1 for text of 24px and over and for a control's edge. A test holds it for every theme (M94).
14. **The sheet gets the window.** Inside a lesson, a challenge or a drill, the chrome is one row, the Ribbon, the toolbar row and the formula bar; everything else gives way to the grid.

#### Color

The default theme is Workbook. Daylight and the other palettes stay as themes a learner picks or earns (6.9). Each theme supplies every token below. Contrast figures are for Workbook.

| Token | Workbook | Used for |
| :- | :- | :- |
| paper | #F6F7F6 | The page ground (never pure white) |
| sheet | #FFFFFF | The sheet, panels, tables |
| chrome | #ECEFED | The Ribbon's ground, the toolbar row, the Name Box, the sheet's headers, quiet buttons |
| line | #D6DBD8 | Hairlines |
| grid | #E3E7E5 | The sheet's gridlines |
| edge | #7A857F | A control's edge (3.6 to 1 on paper, 3.3 on chrome) |
| ink | #17201B | Text (15.5 to 1 on paper) |
| ink-2 | #525D57 | Secondary text (6.4 to 1 on paper, 5.9 on chrome) |
| rail, rail-hi, rail-text, rail-sub | #16201A, #2B3A31, #C9D3CD, #AEBBB4 | The left rail; its text is 10.9 and 8.4 to 1 |
| note, note-edge | #FFF6C7, #B9A53C | A note on the sheet |
| red | #C23B2A | The reviewer's pen, a note's corner, errors |

**Mode colors.** White text passes 4.5 to 1 on every fill. Text on a tint uses the mode's ink, never the fill.

| Mode | Fill | Ink | Tint | Where it shows |
| :- | :- | :- | :- | :- |
| Learn, lessons, progress | #0F7B45 | #0B6338 | #E1F1E8 | The lesson title row, Resume, goal segments, done ticks, XP |
| Drills | #1F4FD1 | #183FA8 | #E6ECFB | Practice's buttons and cursor, the drill list |
| The Daily | #B8501A | #8A3A10 | #FCEBDD | The Daily's page, board and row on Home |
| Rapid-fire | #C42B6A | #9E1F52 | #FBE7EF | The rapid-fire stage and combo |
| Challenges | #6B3FC4 | #5A33A8 | #EEE8FA | Challenge pages, the challenge clock |
| The clock and the tiers | #F0A81C | #7A4F00 | #FDF1D3 | Tier marks, the time track, "Press any key to start", a live clock's header. Amber is never text; its ink is |

A mode's mark in the rail is a 9px square of its fill. On long pages (the landing page) color sits on plates inside sections, never as full-width stripes, so the page reads as one ground as it scrolls: the plates run green, blue, rose, orange, violet and a neutral green-gray (#EEF3EF), all at the same lightness.

Inside the sheet the course's own color code is untouched: typed values blue, formulas black, links to other sheets green (chips B1, B2).

#### Type

| Role | Setting |
| :- | :- |
| The landing headline | Hanken Grotesk 800, 64px, line height 1.0, one color |
| The rapid-fire prompt | 800, 52px |
| A result's time | 800, 34px, tabular figures, with the tier's name and marks on the same line |
| A page's title | 800, 28px |
| A panel's or table's heading | 800, 17px, with its facts at the right of the same line in 13px ink-2 |
| A drill's or lesson's title in a panel | 800, 18 to 20px |
| Body | 400, 15 to 16px, line height 1.5 |
| A name in a table row | 600, 14.5px |
| A label, a column header | 600, 13px, ink-2, sentence case |
| Keycaps | JetBrains Mono 500, 12.5px, on a key with a 3px bottom edge |
| The running clock | JetBrains Mono 700, 24 to 26px |
| Cells | The sheet's own face and size |

No text is set in capitals except a key's own name, and none is letter-spaced. The smallest text is 12px. The Ribbon and the sheet's headers keep Excel's own sizes (9.5 to 11px) and are exempt from the floor and from the type check.

#### Layout

Site pages have the rail at the left (232px) and the content to its right, 30px from the top and 36px from the sides. Content is white panels on the paper ground, with no borders on panels and no shadows; a panel that belongs to a mode can carry a 3px rule of the mode's fill at its top. Two-column pages use a 1fr and 336px split, or two equal halves for a catalog. Spacing comes from one scale: 4, 8, 12, 16, 20, 24, 32, 48. Radii: 6px for buttons, keys and inputs; 8px for the task card, menus and dialogs; 12px for plates on the landing page; everything else square. Only floating things have a shadow: the task card, a menu, a dialog, a banner and the landing demo. Below 900px wide the workspace keeps its "needs a keyboard and a wider screen" message; site pages fold the rail into a top bar with a menu button.

#### The rail (replaces the two-row nav; M88)

Dark, words only, no icons. From the top: the wordmark; Home; Learn; Practice with its four modes always listed under it, each with its color mark (The Daily, Drills, Rapid-fire, Challenges); Leaderboards; Reference. At the foot: the level with its XP bar and "{n} of {next} XP", the streak as "Day {n} of your streak" with the week's seven cells, and the account row (avatar, handle). The account row opens its own items in the rail: Profile, Settings, Plan and billing, Your certificate. A free account sees a quiet "Go Pro" under the level.

KeyTips on Alt: Home H, Learn L, Practice P, The Daily D, Drills R, Rapid-fire F, Challenges C, Leaderboards B, Reference E, Account A; on a page, its own panels and commands take the next free letters, assigned in the registry. Letters show as small green keys at the right of each item. The landing page has no rail: the wordmark, Pricing, For teams and Sign in.

#### The workspace (lessons, challenges, drills; M87, M91)

  - **One title row, folded into the Ribbon's tab row** (34px): a back button with its Esc key; the title as a button that opens the module's lessons (arrows and Enter move between lessons; this is how a learner moves across lessons without leaving); the Ribbon's tabs; and at the right the goal segments with "Goal {n} of {m}", or in a drill the task count, then sound and More. A lesson tints the back and title cells green.
  - **The Ribbon stays as built**, at the live site's compact height (96px, 72px for the groups under the 24px tab row). It takes the tokens and Hanken Grotesk, group names in sentence case. Its KeyTips state does not tint it. Ctrl+F1 collapses it to the tabs, as Excel does; Alt drops it down over the sheet when collapsed. Lessons open with it full; drills and challenges open with it collapsed; both are settings.
  - **The Quick Access Toolbar sits on its own 26px row below the Ribbon**, where a desk sets it, with Alt and a number on each command.
  - **The formula bar is quiet**: the Name Box on chrome, the formula on white, the fx mark in ink-2, no green.
  - **The sheet fills the rest**, with its tabs at the bottom. A drill or challenge opens zoomed to fit its used range (Build for change, 11).
  - **Esc** cancels an edit first, then closes a note, a menu or Help, and only then leaves; leaving a lesson part-way asks for Esc a second time ("Esc again to leave"), never a dialog.

#### The task card (M90)

The card is how a lesson talks. It points, and it is never in the way. It is the part of the product with no comparable, so it gets the most care.

  - **Where it sits.** Beside the goal's target, on the side with the most room, 16px from it, with a pointer on the edge that faces the target. It never covers the active cell, the selection, the target, a note, or any range the goal asks the learner to read. With no side clear it docks at the bottom right over empty grid; with no target on the sheet (a Ribbon route, a dialog, a setting) it docks at the bottom right. It glides 200ms between targets and waits for the tick on the goal just done. Ctrl+Shift+J moves it, Ctrl+Shift+K hides it.
  - **What it shows, in order**, 330px wide: the goal segments with "Goal {n} of {m}"; the goal (17px, 700); the teach line the first time a key is taught (14.5px, ink-2); the keys as keycaps; one live line under them ("Two keys in. Press A."); a footer with F1 Help and Ctrl+Shift+K Hide. No label above the goal, no tabs, no difficulty chip, no buttons.
  - **Help opens inside the card**: Show the keys (the run stays clean), Show me once (the M31 demo; marks the goal assisted), Do it for me (marks it assisted). Esc closes it.
  - **The keys answer.** Each keycap fills green as it's pressed and the next one is ringed; a wrong key resets the row and the line says so plainly. From Chapter 2 the card shows keys only on first teaching or after a stall.
  - **States**: teaching, repeat (the goal alone), done (the segment fills, a tick, then the glide), typing (it folds to a pill while a cell is being edited).
  - **The target** gets a dashed outline in the lesson green with a 10% fill until the goal lands. A Ribbon route lights the Ribbon's own KeyTips.

**Five ways the sheet talks.** Each form means one thing.

| Form | Says | Looks like |
| :- | :- | :- |
| The card | The goal and its keys | The white card with the green edge and the pointer |
| The note | A best practice or a top-bucket tip | Excel's own note: a pale yellow box tied to its cell by a line, a red corner on the cell, one or two lines. It stays until the next goal or Esc, and the card never covers it |
| The nudge | A stuck cue, after the stall time (8 seconds by default) | No text box. The target pulses and a small pill on it shows the next key. After about 20 seconds Help is ringed on the card |
| The pen | A correction, when a convention broke | A red outline drawn as a reviewer's mark around the cell, with the rule's chip and the correction line beside it (section 7). This replaces the convention chip that 3.7 used to put on the card |
| The check | "Does it tie?" | The checks row itself: the difference showing, then a zero, then green |

**Lesson complete** uses the same panel as a drill's result, at the right of the sheet: the done line, the payoff paragraph, the shortcuts used, the XP row (and a level-up row if one lands), then "Next lesson" on Enter. It is not an overlay and has no ring.

#### The timed run: one panel, four beats (M93, M98)

Drills, the Daily, challenges and the assessments run the same loop in a 340px panel at the right of the sheet. The sheet is never dimmed or covered.

| Beat | What the panel shows |
| :- | :- |
| Ready | The title (18px); one row of facts: the task count, the length, your best and its tier; the numbered task list; the three pars on one row; "Press any key to start" on the amber tint; Esc back. The key that starts the clock doesn't land on the sheet |
| Run | The header turns amber-tinted and holds the clock (mono, 26px) and the pace ("Expert pace": the tier the run will reach if the rest goes at the rate so far), with the time track and a marker moving along it. Below, the checklist: done tasks fold into one "{n} done" line; the current task is highlighted in the mode's tint with the cursor outline; the next tasks are listed under it and "{n} more after these" closes the list. With many tasks the list scrolls so the current task is always near the top. Esc ends the run without a time |
| Result | The time (34px) with the tier and its marks on one line; "New best" when it is; the track with this run and the old best; the tasks; the XP row, whose bar fills; the board row, with the move ("31st of 212, up 9"); any quest that ticked; a level-up row in the panel when a level lands. Then the next drill (Enter), run it again (R) and see the board (B). A challenge's result offers the next lesson on Enter and a retry on R |
| Next | Enter starts the next drill in the set at Ready |

A run with help or the mouse gets the same panel with the reason no time was posted. Drills are 60 to 180 seconds, long drills about five minutes (6.0).

#### Rapid-fire (M100)

Its own stage, not the workspace: a clean, faintly rose ground. A top bar holds the back button (Esc), the round's length, the hits and the clock. In the middle: the command's name as the page's one large line, under it a small sheet fragment with the target cells outlined in dashed rose, and under that the keycaps, shown as "?" until each is pressed (or until a three-second stall reveals them). A hit: the keys fill, the cells change the way the command changes them, a tick pops, and the combo meter (ten segments) gains one. Combo 5, 10, 15 and 20 each get one burst; Combo 10 earns the Synthwave theme the first time. A wrong chord shakes the keycaps, drains the meter and moves on. Lengths: 30, 60 and 120 seconds. The round's result: hits, the best combo, the accuracy and the three commands you were slowest on, with "Drill these" on Enter.

#### Home (M89)

Two columns, 1fr and 336px, ending on the same line.

  - **Left: the next lesson**, selected when the page opens. Its heading is the lesson ("Next lesson: Alignment and titles") with "Resume lesson" (or "Start lesson") on Enter at the right. One row of facts: the module, "Lesson {n} of {m}", the goal segments, the minutes left. Then a live preview of the learner's own sheet as they left it. Under it, the chapter as a table: number, module, minutes, status, tier marks, the current row tinted.
  - **Right**, top to bottom: **Level** (the bar, "{n} of {next} XP", and the next level's reward drawn, such as a brass keycap); **Today** (the day's quests, with the refreshers due and the Daily as rows among them, each with its mode mark, length and XP, and the week's streak cells under them); **Achievements** (a grid of the latest badges, then the next one to earn with its progress), stretching to the bottom.
  - The case doesn't appear on Home or on any site page. Project Rinse lives inside the lessons, as the worked example.

#### Learn

The page's tabs are Chapter 1 to Chapter 6. The chapter is a table: a row per module with its number, title, minutes, status and tier, the open module's lessons under it, the next lesson selected. Beside it, a preview of the page the selected module builds. A Pro chapter on a free account shows the paywall panel in place of its lessons.

#### Practice (M89, M97)

  - **Drills** (the page Practice opens on): a header block with "Drills", one line ("Six drills picked for you, about ten minutes." and a "See the set" link), the length (5, 10 or 20 minutes, remembered) and "Start drilling" on Enter. The set mixes what's due, the slowest drills against their pars, the newest unlocked drill and drills under their next tier; it never includes Pro drills on a free account. Under the header, the catalog in two columns by chapter: name, length, your best, tier marks; the selected row carries the cursor; Enter plays it. Pro drills on a free account are gray with "Pro".
  - **The Daily, Rapid-fire, Challenges**: each its own page, under Practice in the rail, with the same header block (the title, one line, the primary button) and its table or board below.

#### Leaderboards (M104)

Page tabs: The Daily, Drills, Challenges, Desks. A board is a table: rank, the player with their level, a bar showing the time against the field, the time, the gap to first, and the keys used (the route's count is in the header). Tier marks are left off the boards, because everyone near the top has the same three; they live on the personal views (the catalog, the result, the profile). The learner's own row is pinned under the top ten with its move. Beside the board, the learner's last five runs on it and one line on where the time is going. Ranked by time, then keys, then the earlier run.

#### Account (M101)

The account row in the rail opens Profile, Settings, Plan and billing, and Your certificate.

  - **Profile**: handle, level and title, the achievements shelf, stats.
  - **Settings**: two columns of grouped panels, each setting a row with its control at the right and any help under it, saved as it changes. The groups and settings:

| Group | Settings |
| :- | :- |
| Keyboard | Key labels (Windows, Mac); keyboard layout (US, UK, other); Ribbon in lessons (full, tabs); Ribbon in drills (full, tabs); letters on Alt for site pages |
| Lessons | Task card side (auto, left, right); show the keys (first time, always); nudge when stuck (8 s, 15 s, off); demo before a lesson |
| Practice | Set length (5, 10, 20 minutes); ghost of your best run; pace during a run; show my runs on boards |
| Appearance | Theme; density (comfortable, compact); sheet zoom (100, 110, 125%) |
| Sound and motion | Sound; sound set; effects (full, reduced, off; the computer's reduced-motion setting always wins) |
| Email | Daily reminder (only on days you haven't practiced); weekly summary; news |
| Account and privacy | Handle; display name for the certificate; email and sign-in; public profile; export my data; delete my account |

    Theme tiles are all one size (64 by 46); a locked theme is dimmed with its unlock under its name.
  - **Plan and billing**: the plan, the payment method and receipts through Stripe's customer portal.
  - **Your certificate**: below.

#### The certificate (M102)

One certificate: **hotkey.gg Certified, Excel for Finance**. The page shows the six chapters as the progress toward it, each with its lessons done and its assessment (Verified with the time, when passed), and the certificate itself in gray with "{n} of 6 chapters Verified" until all six pass. Once issued it has a public verification page, "Add to LinkedIn profile" (LinkedIn's add-certification link, filled in with the name, the issuer, the date, the credential ID and the verification URL) and "Copy the verify link". There are no chapter certificates; a chapter's Verified is a status and an achievement. A later course (4.9) earns its own certificate. Nothing is exported as a file.

#### Achievements and level titles (M103)

  - **Art**: pixel sprites, 16 by 16 drawn at 4px (64px), four to six colors plus a dark outline, lit from the top left, standing on the page with nothing behind them. A locked badge is its gray silhouette. Rarity is a colored word under the name (Common green, Rare blue, Epic violet, Legendary amber ink), never a glow or a ring. The shelf is a three-column grid: sprite at the left, name, the one-line description and the rarity at the right. Never a generic icon set (Lucide, Heroicons, Feather, Material) and never an icon centered in a soft circle or a colored tile. The briefs per badge are in 6.7; Wolf may hire a pixel artist, and the canvas has twelve drawn as the reference.
  - **Level titles**: the table in 6.10. The title shows on the profile and in the level-up row, never on a board.

#### The first run (M92)

Three steps before the first key. (1) One screen with the two questions, keyboard and experience, answered with the arrows and Enter. (2) One story card: Wolf's line, "You work for Clearcoat, an express car-wash company that's getting ready to sell to private equity." (3) Lesson 1.1.1, where the card names itself once as it's used. After the first lesson, Home shows one coach mark on each rail item, one sentence each, dismissed with Enter.

#### Pricing and the paywall (M105)

  - **Pricing**: Free and Pro side by side. Free: Chapter 1 in full, its drills and challenges, rapid-fire and the Daily, boards, streaks and achievements. Pro: a toggle between "Own it" ($29 once) and "Monthly" ($10 a month), Chapters 2 to 6, every drill, challenge and assessment, the certificate, and the flair as you level. The 14-day money-back line. "Go Pro" on Enter opens Stripe Checkout (hosted); the return lands on a "You're Pro" moment in the panel of the page the learner came from. Teams and classes as one row under both. The live pricing page keeps its figures until Wolf says go.
  - **The paywall** is a panel on the page the learner opened (a Pro chapter on Learn, a Pro drill in the catalog): "Go Pro for the rest of the content." with Go Pro (Enter) and Not now (Esc). Never a pop-up.

#### Reference (M57, M106)

A title, a search box ("/" focuses it) and the Windows or Mac toggle. The keys in groups (Move, Select, Edit, Format, Formulas, the Ribbon, and the chapters' own), each group a table, two columns of tables: the key as a keycap, what it does, the lesson that teaches it, its state (Not yet, Taught, Practiced, Under par) and "Drill it" (a twenty-second rep on that key). "Show me" plays the M31 demo. A line at the foot: "{n} of {m} keys collected".

#### Menus, help and dialogs

The account menu grows from the rail's account row; the More menu from the workspace's More button; each item shows its key at the right. Help is inside the card. The only dialog is a confirmation: a title, one sentence, Cancel (Esc) and the action (Enter). Banners come one at a time at the top right and go after four seconds or any key.

#### Motion and moments (M95)

Each is a named moment in ui/effects.js, runs on transform and opacity, respects the Effects setting and reduced motion, and can be skipped with any key.

| Moment | When | What moves | How long |
| :- | :- | :- | :- |
| Route bar | A page change over 150ms | A 3px bar fills across the top over the page's skeleton | Until loaded |
| Open the workbook | Entering a lesson, challenge or drill | The title row, then the Ribbon, then the rows filling from the top, then the card landing beside its target | About 500ms |
| The cursor moves | An arrow key on a site page | The cell cursor slides to the next item | 80ms |
| A menu opens | The account menu, More, Help | It grows from the control that opened it | 140ms |
| Key press | A key in a taught route | The keycap presses and fills | 90ms |
| Goal done | A goal lands | The segment fills, the tick draws, the card glides to the next target | 200 to 300ms |
| The marker runs | A timed run | The marker moves along the track with the clock | The run |
| The panel changes beat | Ready, Run, Result | The panel's contents change in place | 140ms |
| The result | A timed run ends | The time counts up (0 to 900ms), the tier marks pop one at a time (1,000 to 1,300ms), "New best" rises (1,450ms), the marker slides home (1,500 to 2,300ms), the board place counts to its value (1,900 to 2,800ms), the XP bar fills (2,300 to 3,100ms), a level-up row rises in the panel (3,200ms), a quest row ticks (3,900ms) | About 4 seconds, skippable |
| Rapid-fire hit | A correct chord | Keys fill, cells change, a tick pops, a meter segment fills | 250ms |
| Combo | 5, 10, 15, 20 in a row | One burst with a ring | 700ms |
| Wrong chord | A wrong chord in rapid-fire | The keycaps shake and the meter drains | 300ms |
| Quests all done | The third daily quest | The Today rows tick, then the bonus row drops in | 600ms |
| Streak day | The day's first practice | The day's cell fills with a single ring | 900ms |
| Achievement | When earned | One banner at the top right, the sprite pops | 4 seconds or any key |
| A note appears | A goal with a tip | The red corner shows, then the note draws out from the cell | 160ms |
| Saving | A write to the account | The save line in the account menu changes and settles | As it happens |

A loading state shows progress or the page's shape; a spinner alone is never the answer, and nothing is delayed to show an animation.

#### The landing page (M95)

  - **The page is a sheet.** Under the top bar, a Name Box and formula bar show "B2" and the headline; column letters and row numbers frame the hero; faint gridlines run behind it. The headline sits in B2 (64px), Wolf's subhead under it, and "Start learning" is the selected cell, filled green with the cursor's handle, on Enter. Beside it: "Chapter 1 is free, and you don't need an account." Under them, the course in three facts from the course data (lessons, challenges, hours).
  - **The live demo** floats over the columns at the right: the M31 demo player running a real lesson goal by goal on a real sheet, the card beside each target and its keycaps lighting as they're pressed. Clicking it hands over the keyboard ("the sheet is yours"). It is about 640 by 560, tall enough to show the whole Report.
  - **Sheet tabs** under the hero take the reader to the sections: Start, The path, Drills, Rapid-fire, Leaderboards, Challenges, Certificate.
  - **The path**: six chapters on one line, beginner to expert, each with its hours, Free or Pro, and what you can do after it.
  - **Five sections**, each two columns on the same white ground: a proof plate at the left (a real piece of the product on its mode's tint, rounded 12px) and at the right the heading (Wolf's mode line) with two or three facts as rows. Drills, Rapid-fire, Leaderboards (with the Daily), Challenges, the Certificate.
  - **Pricing and teams** on the same two columns, then the footer. No closing band.
  - **Footer** (every site page): Pricing, For teams, About, Contact, Privacy, Terms of Use, EULA; "Microsoft and Excel are trademarks of the Microsoft group of companies. LinkedIn is a trademark of LinkedIn Corporation. hotkey.gg isn't affiliated with either."; and the business line with the LLC's legal name and the address and contact a jurisdiction or Stripe requires, which the attorney confirms.

#### Defaults the build takes where a screen leaves a choice

  - Coach marks after the first lesson: one sentence each on Home, Learn, Practice, Leaderboards, Reference, the level and the streak (3.2).
  - Home's panel headings carry their facts at the right: Level "{n} of {next} XP", Today "{d} of {n} done", Achievements "{n} of {m}". A refresher is a twenty-second "Drill it" rep (M57) on a key the learner was taught and hasn't pressed in seven days, or whose last rep was over par; Today shows one row for them, "Run your {n} refreshers", with at most three. "What's due" in the set picker means the drills that hold those keys. The week's quests are one row under Today, "This week: {d} of 3", which opens them. Once the Daily is played its row shows the time and the place, with Play again.
  - When Chapter 1's lessons are done, the next-lesson block offers the Chapter 1 assessment; once that's Verified, a free account sees Chapter 2's first lesson with the paywall line and Go Pro on Enter. Chapter 2 opens with Pro once Chapter 1 is Completed or Verified, as before.
  - A module's story card shows in the panel at the right of the sheet before the first goal, and Enter starts the job.
  - The stuck line shows as the card's live line while the target pulses; the nudge itself has no text box.
  - The More menu in the workspace: Lessons in this module, Restart the lesson (with the confirmation), Collapse the Ribbon (Ctrl+F1), Move the card (Ctrl+Shift+J), Report a problem.
  - In a timed run any help, including Show the keys, means no time is posted.
  - The pace line reads "{tier} pace", or "Behind Pass pace" when no tier is in reach. A board move reads "up {k}" or "down {k}". The board's first column is "Place".
  - A challenge's result: Next lesson (Enter), Run it again on a fresh file (R), See the board (B).
  - The Challenges page: "Every module ends with one. {n} of {m} passed." and "Play the next challenge" on Enter.
  - The level-up row: "Level {n}" and "{reward} is yours.", with Equip (E) when the reward is something to switch on.
  - Reference shows a key's Ribbon route as a second row of keycaps ("or Alt, H, A, R"); the Windows and Mac toggle swaps every keycap on the page.
  - No student price at launch.

#### What the copy and the screen never do

The copy checker and a CSS check enforce what a machine can check (M94); the rest is for whoever builds a screen.

| Never | Instead |
| :- | :- |
| A dash as punctuation, long or short, in anything a learner reads | A period, a comma, a colon or parentheses. A hyphen inside a word, a range of numbers and text typed into a cell are fine |
| Emoji, or a symbol standing in for an icon or a bullet | A drawn mark, or nothing |
| An icon in a colored tile, a generic icon set, or an icon where a word does the job | The word. Icons only on controls with no room for one: back, sound, More |
| Facts joined by middle dots or pipes | A sentence, or each fact in its own place |
| A heading with a line under it that says the same thing again | The heading, with its facts at the right of the same line |
| A paragraph where a name would do | Names and marks first; one sentence for the selected item |
| A small label in capitals above a heading | The heading alone |
| Text in capitals or letter-spaced | Sentence case at normal spacing (a key's own name and Excel's function names, such as VLOOKUP, are exempt in the checker) |
| One word of a headline in another color or weight | The whole headline in one |
| An arrow or a symbol at the end of a button's label | The label, with its key in a keycap |
| A giant number over a small label | The figure at text size in a row; a result's time is the one exception |
| A tilted stamp, a badge or a glow for a result | The tier's name and its three marks |
| A card that pops over the page | The panel, or the page itself |
| Tier marks on a board | Time, gap and keys; marks on personal views |
| Full-width colored stripes down a long page | Tinted plates inside sections on one ground |
| The case's project name on a site page | The case inside the lessons |
| Things in threes for the look of it; a grid of look-alike cards | As many as the content has, as rows or cells of one grid |
| Numbered markers on things that are not a sequence | Numbers on real sequences only: the chapters, steps, a task list |
| A button that is hard to see | A filled primary button; a quiet button with a gray fill and an edge that passes 3 to 1 |
| Pure white as the page ground | Paper; white is for the sheet and panels |
| Monospace for labels, buttons and menus | Monospace for keys, addresses, formulas, times and the clock |

### 3.1 Landing

**What happens.** The page is a sheet (3.0, "The landing page"): the headline in B2 and in the formula bar, "Start learning" as the selected cell, and the live demo floating over the columns at the right, playing a real lesson until the visitor clicks it and takes over. Sheet tabs under the hero jump to the path, then one section each for drills, rapid-fire, the boards, challenges and the certificate, then pricing, teams and the footer. "Start learning" goes straight into the first run; there is never a signup wall. Rewritten 2026-10-01 in Wolf's voice: friendly and direct, the way he wrote his own calibration lines, not formal.

| **Key · where it shows** | **Line (edit this)** | **Status** |
| :- | :- | :- |
| *landing_headline*    Hero headline, in B2 and the formula bar | The better way to master Excel    *note: Wolf's own landing line (calibration, Round 6); he leaned to it on 2026-10-01 over the 2026-09-23 pick. "Excel isn't learned. It's practiced." stays behind ?h=2, "The better way to learn Excel" behind ?h=3* | **DRAFT** |
| *landing_subhead*    Under the headline | Learn like an analyst at a top firm, and build the muscle memory to make it stick.    *note: Wolf's calibration line, Round 1* | **DRAFT** |
| *landing-next.js*    The selected cell, and beside it | Start learning (with an Enter keycap). Beside it: Chapter 1 is free, and you don't need an account. | **DRAFT** |
| *landing-next.js*    Three facts under it, each in its own place (new; figures from the course data) | {lessons} lessons. {challenges} challenges. About {hours} hours, beginner to expert. | **DRAFT** |
| *landing-next.js*    Sheet tabs (new) | Start, The path, Drills, Rapid-fire, Leaderboards, Challenges, Certificate | **DRAFT** |
| *landing-next.js*    The path, heading (new) | From your first Alt to a full valuation | **DRAFT** |
| *landing-next.js*    The path, one line per chapter (new) | 1 Foundations, 3.5 hours, free: Get around a sheet without the mouse, and build a live weekly report. \|\| 2 Formatting: Make a P&L look like it came out of a bank, print set-up included. \|\| 3 Formulas: IF, SUMIFS, dates and text, plus the checks that prove it all ties. \|\| 4 Data and Lookups: Lookups, pivots and sensitivity tables on a real diligence data set. \|\| 5 Finance and Accounting: Link the three statements and build a five-year model that balances. \|\| 6 Valuation: Comps, a DCF and a paper LBO, the way a deal team runs them. | **DRAFT** |
| *landing-next.js*    Drills section (new) | Drills: build muscle memory. \|\| Short reps, one to five minutes, with three times to beat: Pass, Expert and Legendary. \|\| Every day we pick a set for you: what's due, where you're slow, and what you just learned. \|\| Post a clean run and you're on the board. | **DRAFT** |
| *landing-next.js*    Rapid-fire section (new) | Rapid-fire: reach flow state. \|\| We name the command, you press the keys, and the next one's already waiting. \|\| Thirty, sixty or a hundred and twenty seconds. Miss one and the combo starts over. \|\| It pulls from every shortcut you've learned and leans on the ones you keep forgetting. | **DRAFT** |
| *landing-next.js*    Leaderboards section (new) | Leaderboards: see who's the fastest. \|\| The Daily is a new ninety-second challenge every day, on the same sheet for everyone, with one public board. \|\| Every drill and every challenge has a board of its own. \|\| Only clean runs count. Use help or the mouse and your time stays off the board. | **DRAFT** |
| *landing-next.js*    Challenges section (new) | Challenges: work through a full solution, timed. \|\| Every module ends with one, on a fresh file, so you can't just memorize the answer. \|\| Pass it and the module's done. Expert and Legendary are there when you want more. | **DRAFT** |
| *landing-next.js*    Certificate section (new) | Finish all six chapters and get certified. \|\| Each chapter ends in an assessment on a hard clock, with no help and no mouse. \|\| The certificate is hotkey.gg Certified, Excel for Finance. \|\| Add it to LinkedIn in one click. The link opens a page with your times, so anyone can check it. | **DRAFT** |
| *landing-next.js*    Pricing, on the landing page | Chapter 1 is free, all of it. \|\| Own the rest for $29, or $10 a month. \|\| Buttons: Start learning, See pricing    *note: Wolf's prices, 2026-09-27; the live line stays until he says go*    *was: Chapter 1 is free in full. The rest is $9 a month.* | **DRAFT** |
| *landing-next.js*    Teams | Learning with a team or a class? \|\| Set up a desk with its own board and assignments, or talk to us about group access for a bank, a training provider or a school.    *was: Learning with a team or a class? Start a desk for a private board and assignments, or ask about group access for a bank, a training provider or a school.* | **DRAFT** |
| *landing-next.js*    Demo note, before they touch it | Four goals from Chapter 1 on a real sheet, playing themselves. Click it, then type: the sheet is yours. | LIVE |
| *landing-next.js*    Demo note, after they take over | Yours. Same four goals, any route. Start learning when you want the real thing. | LIVE |
| *demo-player.js*    Demo, finished | That was a lesson. The sheet is graded on how it ends up, so any route that gets there counts, and the next one is yours.    *was: Four goals, twelve keys, no mouse. That is a lesson. The sheet is graded on what it ends up as, so any correct route counts.* | **DRAFT** |
| *mode_lesson*    Mode line (Practice, Home, the coach marks) | Lessons: the learning path, one job at a time on a real sheet.    *was: One job at a time on a live sheet. The keys are shown the first time; the sheet is graded on where it ends up, so any correct route counts.* | **DRAFT** |
| *mode_challenge*    Mode line (Practice, Home, the coach marks) | Challenges: work through a full solution, timed.    *note: Wolf's line*    *was: Every module ends in a seeded, timed run on a fresh file. Pass completes the module; pro and legendary are what you come back for.* | **DRAFT** |
| *mode_drill*    Mode line (Practice, Home, the coach marks) | Drills: build muscle memory.    *note: Wolf's line*    *was: The same generators stripped of the story. Pars, personal bests, and a ghost of your own best run to race.* | **DRAFT** |
| *mode_daily*    Mode line (Practice, Home, the coach marks) | Daily: a unique 90-second challenge, with a public leaderboard every day.    *note: Wolf's line, Round 1*    *was: Ninety seconds, the same sheet for everyone, once a day. A result card built to be shared.* | **DRAFT** |
| *mode_rapid*    Mode line (Practice, Home, the coach marks) | Rapid-fire: reach flow state.    *note: Wolf's line*    *was: One shortcut at a time against the clock, drawn from the ones you remember least. Recall is the game.* | **DRAFT** |
| *mode_boards*    Mode line (Practice, Home, the coach marks) | Leaderboards: see who's the fastest.    *note: Wolf's line*    *was: A board for every challenge and for the Daily. Clean runs only: no help, no mouse. Rank turns on when the field fills.* | **DRAFT** |
| *landing-next.js*    Return line | Learning here already? Sign in to pick up where you left off. | LIVE |
| *landing-next.js*    Eyebrow over the headline; the six stages; How a lesson works; Project Rinse heading; the comparison table; the close | Retired 2026-10-01: no label above a headline, the case stays inside the lessons, and the demo already shows a lesson. The closing band is cut.    *was: One company, sold in six stages. You build a page in each. · Your first lesson takes three minutes, and the workbook is already open.* | **RETIRED** |

### 3.2 First run

**What happens.** Three steps before the first key, shown once (3.0, "The first run"; M92). (1) One screen with the two questions, keyboard and experience, answered with the arrows and Enter (the rows below still call it Frame 6). (2) One story card with Wolf's line: you work for Clearcoat, an express car-wash company that's getting ready to sell to private equity. (3) Lesson 1.1.1, where the task card names itself once as it's used. After the first lesson, Home shows one coach mark on each rail item, one sentence each, dismissed with Enter. There are no other deal cards in the first run: the case stays inside the lessons (3.0, "Home").

| **Key · where it shows** | **Line (edit this)** | **Status** |
| :- | :- | :- |
| *lesson-view.js*    The demo's caption (out of the first run; shown with the landing demo and before 1.1.2) | This is a lesson: real keys on a real sheet. You're graded on how the sheet ends up, so any route that gets there counts.    *was: This is a lesson. The keys are pressed on a real sheet. The sheet is graded on what it ends up as, so any correct route counts.* | **DRAFT** |
| *orientation_eyebrow / _title*    Frame 2 · heading | Retired: the orientation is one coach mark on each rail item, with no heading (3.0, The first run).    *was: How this place works · Where things are.* | **RETIRED** |
| *orientation_home (new)*    Coach mark on Home (first visit to Home after a lesson) | Home picks up where you left off, with today's quests on the right. | **DRAFT** |
| *orientation_learn*    Coach mark on Learn (first visit to Home after a lesson) | Learn is the course: six chapters of short modules, each ending in a timed challenge on a fresh file.    *was: The path. Lessons in short modules, each one job on the file. A module ends with a challenge: the same job on a fresh file, against the clock.* | **DRAFT** |
| *orientation_practice*    Coach mark on Practice (first visit to Home after a lesson) | Drills, the Daily, rapid-fire and the challenges all live under Practice, on the clock.    *was: The reps. Drills and rapid-fire with no story, and the Daily: one ninety-second sheet, the same for everyone, once a day.* | **DRAFT** |
| *orientation_leaderboard*    Coach mark on Leaderboards (first visit to Home after a lesson) | Each drill and challenge has a board, the Daily too, and only a run with no help and no mouse posts a time.    *was: A board for every challenge and for the Daily. Clean runs only: no help, no mouse.* | **DRAFT** |
| *orientation_reference (new)*    Coach mark on Reference (first visit to Home after a lesson) | Reference has every key the course teaches, and shows which ones you've practiced. | **DRAFT** |
| *orientation_level*    Coach mark on the level (first visit to Home after a lesson) | Everything you finish earns XP toward your next level, and speed is what puts you on the boards.    *was: Finishing lessons and challenges earns XP, and XP is your level, shown in the top bar. Speed earns places on the boards, not XP.*    *note: M10, one XP story* | **DRAFT** |
| *orientation_streak (new)*    Coach mark on the streak, at the rail's foot (first visit to Home after a lesson) | Your first practice each day fills that day's cell and adds a day to your streak. | **DRAFT** |
| *orientation_fine*    Under the set-up questions | Use the arrows and Enter. Sound comes on quietly with your first key, and the sound button at the top of a lesson turns it off.    *was: Keyboard first. Sound is on at low volume from your first key; the mute is on the workspace.* | **DRAFT** |
| *briefing_1_eyebrow*    Frames 3–5 · eyebrow | Retired: one story card, no label above it (3.0).    *was: The deal · 1 of 3 (2 of 3, 3 of 3)* | **RETIRED** |
| *briefing_1_title*    The story card before lesson 1.1.1 · title | Welcome to the finance team.    *was: A company is being sold. You prepare the numbers.* | **DRAFT** |
| *briefing_1_body*    The story card before lesson 1.1.1 · body | You work for Clearcoat, an express car-wash company that's getting ready to sell to private equity. \|\| Before you can start a sale process, your company needs to clean data, compile documents, and reconcile financials. That's where you come in, and the better you are in Excel, the less painful the process will be.    *note: Wolf's Round 1 line, with the company renamed*    *was: Voltline runs 40 electric-car charging sites. Its owners are selling the company. \|\| Before any buyer sees a number, someone has to make the numbers clean, consistent and checked. That is you: an analyst, someone in finance or operations, a founder. It does not matter which.* | **DRAFT** |
| *briefing_2_title*    Deal card 2 · title | Retired from the first run: module 1.1's own story card says this (script-ch1.md).    *was: It starts with this week's numbers.* | **RETIRED** |
| *briefing_2_body*    Deal card 2 · body (retired from the first run; kept as the source for module 1.1's story card) | Before anyone can value the company, the company has to know its own numbers. What came in is five site managers' spreadsheets that ops pasted into one workbook: a tab still called Sheet2, last week's export sitting next to this week's, a cost typed straight into a formula. \|\| You'll turn it into one clean page the CFO can sign off, one job at a time. Every job is a hotkey you'll use for the rest of your career.    *was: It arrived the way files usually do: a tab still called Sheet2, an old export nobody deleted, a price typed inside a formula. \|\| You will turn it into a page a buyer can trust, using the methods investment banks train their people in. One job at a time, on the real file.* | **RETIRED** |
| *briefing_3_title*    When the first page is filed (after the module 1.1 challenge) · title | Retired: the first run is three steps, and the sale's stages stay inside the lessons (3.0, The first run; Home).    *was: Every finished page goes into the data room.* | **RETIRED** |
| *briefing_3_body*    When the first page is filed · body | Retired: the case stays inside the lessons, and Learn is a table of the chapter, not a data room (3.0, Home; Learn).    *was: A sale runs in stages. Each chapter here is one stage, and each one ends with a finished page. \|\| The pages go into the data room: the folder buyers will read. By the end of Chapter 1, page one is in it, built by you.* | **RETIRED** |
| *first-run-next.js*    Frame 6 · heading | Two questions, then the first job. | LIVE |
| *first-run-next.js*    Frame 6 · keyboard | Which keyboard? Windows: Ctrl, Alt, the Ribbon KeyTips. Mac: ⌘ and ⌥ stand in for Ctrl and Alt; KeyTips work the same. | LIVE |
| *first-run-next.js*    Frame 6 · experience | How much Excel? \|\| New to Excel: start at the first lesson and take them in order. \|\| I use it sometimes: the same path, and you'll move through the parts you know faster. \|\| I use it daily: if Chapter 1 looks familiar, take its assessment from Learn and test out.    *was: How much Excel? New to Excel — Every lesson, in order. I use it sometimes — Same path; the challenges will move you fast. I use it daily — Same start; test out of Chapter 1 from Learn any time.* | **DRAFT** |
| *first-run-next.js*    Frame 6 · fine print | Instructions and keycaps follow the keyboard choice. Both settings change any time from Settings. Progress is saved on this device. | LIVE |
| *first-run-next.js*    Buttons and key hints | Next (Enter) on the questions, then Start lesson 1.1.1 (Enter) on the story card. Skip (Esc) on either.    *was: Continue ↵ · Skip demo · The deal ↵ · Next ↵ · Set up ↵ · Start lesson 1.1.1 ↵ · Enter continue · Esc skip* | **DRAFT** |
| *lesson-view.js*    Lesson 1.1.1, the task card naming itself, once (new, 3.0) | This card shows your goal and its keys, and it follows the work around the sheet. | **DRAFT** |

### 3.3 Nav, footer and account menu

**What happens.** Every site page has the rail at the left, in place of the two-row nav (3.0, "The rail"; M88): dark, words only, no icons. From the top: the wordmark, Home, Learn, Practice with its four modes always listed under it (The Daily, Drills, Rapid-fire, Challenges), each with its color mark, then Leaderboards and Reference. At the foot: the level with its XP bar, the streak with the week's seven cells, and the account row, which opens Profile, Settings, Plan and billing, and Your certificate in the rail. A free account sees a quiet Go Pro under the level. Alt puts a letter on every item. The theme is picked in Settings, under Appearance, not from the account menu. Below 900px wide the rail folds into a top bar with a menu button. A lesson, a challenge or a drill has no rail: its chrome is one title row in the Ribbon's tab row (3.0, "The workspace"). The landing page has no rail either, only the wordmark, Pricing, For teams and Sign in. One footer on every site page.

| **Key · where it shows** | **Line (edit this)** | **Status** |
| :- | :- | :- |
| *main.js · nav.js*    The nav: tabs, and each tab's commands | Retired: the two-row nav is the rail now, and its words are in the rows below (3.0, The rail).    *was (top nav): hotkey.gg · Learn · Practice · Leaderboard · Reference · Sign in · L{n}* | **RETIRED** |
| *nav.js*    The rail, top to bottom (new, 3.0) | hotkey.gg, then Home, Learn and Practice, with The Daily, Drills, Rapid-fire and Challenges listed under Practice, then Leaderboards and Reference. | **DRAFT** |
| *nav.js*    The rail's foot: the level and the streak (new, 3.0) | Level {n}, with {xp} of {next} XP under its bar. Under that: Day {n} of your streak, over the week's seven cells. | **DRAFT** |
| *nav.js*    Level chip tooltip | Retired: the rail's foot shows the level with its bar and its XP, so it needs no tooltip (3.0, The rail).    *was: Level {n} — XP from lessons, drills and the Daily*    *note: M10* | **RETIRED** |
| *nav.js*    Go Pro, under the level in the rail (free accounts only) | Go Pro | **DRAFT** |
| *nav.js*    Account menu | Retired: the account row opens Profile, Settings, Plan and billing, and Your certificate (3.0, The rail).    *was: guest / {handle} · Saved on this device · Sign in · Desks · Stats · Profile · Settings* | **RETIRED** |
| *nav.js*    The account row and its items (new, 3.0) | {handle}, beside the avatar; a guest sees Sign in. It opens Profile, Settings, Plan and billing, and Your certificate, with the save line under them (3.12). | **DRAFT** |
| *nav.js*    Theme picker (in the account menu) | Retired: the theme is picked in Settings, under Appearance (3.0, Account).    *was: Pick a theme. Saved on this device. / Saved to your account. · From level {n}* | **RETIRED** |
| *nav.js*    The landing page's top bar, in place of the rail (new, 3.0) | hotkey.gg, then Pricing, For teams and Sign in. | **DRAFT** |
| *footer.js*    Footer | Retired: 3.0 sets the footer's links and lines, in the rows below (3.0, The landing page).    *was: Learn Excel by doing. Excel is a registered trademark of Microsoft Corporation. hotkey.gg is independent and not affiliated with or endorsed by Microsoft. · Pricing · Teams · About · Terms · Privacy · Contact* | **RETIRED** |
| *footer.js*    Footer links (new, 3.0) | Pricing, For teams, About, Contact, Privacy, Terms of Use, EULA | **DRAFT** |
| *footer.js*    Footer, the trademark line (new, 3.0) | Microsoft and Excel are trademarks of the Microsoft group of companies. LinkedIn is a trademark of LinkedIn Corporation. hotkey.gg isn't affiliated with either. | **DRAFT** |
| *footer.js*    Footer, the business line (new, 3.0) | {the LLC's legal name}, {address}, {contact}    *note: what a jurisdiction or Stripe requires; the attorney confirms it (3.0)* | **DRAFT** |

### 3.4 Home

**What happens.** A returning learner lands on Home (3.0, "Home"; M89): two columns, 1fr and 336px, ending on the same line. Left, the next lesson, selected when the page opens. Its heading is the lesson ("Next lesson: Alignment and titles") with Resume lesson, or Start lesson, on Enter at the right. Under it: one row of facts (the module, "Lesson {n} of {m}", the goal segments, the minutes left), a live preview of the learner's own sheet as they left it, and the chapter as a table (number, module, minutes, status, tier marks), the current row tinted. Right, top to bottom: Level (the bar, "{n} of {next} XP", and the next level's reward drawn, such as a brass keycap); Today (the day's quests, with the refreshers due and the Daily as rows among them, each with its mode mark, length and XP, then the week's streak cells); and Achievements (a grid of the latest badges, then the next one to earn with its progress), stretching to the bottom. There's no deal strip: the case doesn't appear on Home or on any site page, and Project Rinse lives inside the lessons as the worked example.

| **Key · where it shows** | **Line (edit this)** | **Status** |
| :- | :- | :- |
| *dash_learn*    Coach mark on Learn, second sentence (Home no longer has a Learn half) | Retired: a coach mark is one sentence now, and orientation_learn is it (3.0, The first run).    *was: The path: chapters, modules, lessons and their challenges, one story on one file.* | **RETIRED** |
| *dash_practice*    Coach mark on Practice, second sentence (Home no longer has a Practice half) | Retired: a coach mark is one sentence now, and orientation_practice is it (3.0, The first run).    *was: The reps: timed, no story. What is due today, the Daily, drills and rapid-fire.* | **RETIRED** |
| *home-next.js*    The Today table (new) | Retired: Today is a panel on the right, with the quests, the refreshers and the Daily as its rows (3.0, Home). | **RETIRED** |
| *home-next.js*    Today, the panel's heading (new, 3.0) | Today. At the right: {d} of {n} done. | **DRAFT** |
| *home-next.js*    Continue card | Retired: the next lesson leads the page, with its heading, its button and a row of facts (3.0, Home).    *was: continue / next up · {chapter} › {module} › Lesson {n} of {of} · {lesson title} · {first sentence of the brief} · Continue ↵ · All lessons* | **RETIRED** |
| *home-next.js*    The next lesson, heading and button (new, 3.0) | Next lesson: {title}. At the right: Resume lesson (Enter), or Start lesson (Enter) for one you haven't started. | **DRAFT** |
| *home-next.js*    The next lesson, its row of facts (new, 3.0) | {module}, then Lesson {n} of {m}, then the goal segments, then {n} minutes left, each in its own place. | **DRAFT** |
| *home-next.js*    The chapter table, under the preview (new, 3.0) | Chapter {n}: {name}, as its heading. Columns: Module, Minutes, Status, with the number first and the tier marks last; the status words are Learn's (3.5). | **DRAFT** |
| *home-next.js*    Chapter 1 complete card | Retired: Home has no completion card, and the case stays inside the lessons (3.0, Home).    *was: Foundations: done. Page one of the pack is delivered. Keep it sharp from Practice, or look at what Chapter 2 brings.* | **RETIRED** |
| *quests_header (new)*    Quests card, header | Retired: the quests are rows in Today, under its heading (3.0, Home).    *was: due today · {n} items · {secs} s* | **RETIRED** |
| *quests.csv (new)*    Today, a quest or refresher row | {quest or refresher}, with {length} and {xp} XP at the right. A finished row reads Done.    *note: the pool is in 6.6, one line each* | **DRAFT** |
| *quests_foot (new)*    Quests card, foot | Retired: Today ends on the week's streak cells, with no foot line (3.0, Home).    *was (due_foot): Short reps on what you are about to forget. Nothing is lost by skipping a day.* | **RETIRED** |
| *quests_done (new)*    Quests card, all six done | Retired: when the day's quests are all done, the bonus row says so (3.0, Motion and moments).    *was (due_empty): Nothing due. Play the Daily, or carry on with the next lesson.* | **RETIRED** |
| *home-next.js*    Today, the bonus row when the day's three quests are done (new, 3.0) | Bonus for all three: {xp} XP | **DRAFT** |
| *home-next.js*    Today, the week's quests (new, 3.0) | This week, with {d} of 3 at the right. Enter opens the three. | **DRAFT** |
| *home-next.js*    Today, the refresher row (new, 3.0) | Run your {n} refreshers, with {secs} seconds at the right. | **DRAFT** |
| *quests_fresh (new)*    Today, brand-new learner | Quests start after your first lesson.    *was (due_fresh): Nothing here yet. Shortcuts you learn come back here the next day as thirty-second refreshers.* | **DRAFT** |
| *home-next.js*    Due today, keep-sharp row | Keep sharp: {module}. The whole module has gone quiet. One pass of its challenge brings every move back.    *note: becomes the quest "Run the {module} challenge again." (6.6, M18)* | **RETIRED** |
| *home-next.js*    The Daily card | Retired: the Daily is a row in Today (3.0, Home).    *was: … today ◆◆ pro …* | **RETIRED** |
| *home-next.js*    Today, the Daily's row (new, 3.0) | The Daily, with 90 seconds and {xp} XP at the right. \|\| Once played: {t}s, {place} of {n} on today's board. | **DRAFT** |
| *home-next.js*    The Daily, played with help | Played today, with help or the mouse: no time posted. A clean run posts one. | LIVE |
| *deal-strip.js*    Deal strip, in progress | Retired: Home has no deal strip, and the case stays inside the lessons (3.0, Home).    *was: Stage {n} of 6 · {stage}. {sends}. Deliverable: {delivers}. {done} of {planned} modules · now: {module}* | **RETIRED** |
| *deal-strip.js*    Deal strip, Chapter 1 done | Retired with the deal strip (3.0, Home).    *was: Stage 1 delivered. Page one of the pack is in the data room. Next: stage 2 · {stage} (paid). {sends}. See Chapter 2 →* | **RETIRED** |
| *deal-strip.js*    The six stages (M51) | Retired with the deal strip: the stages stay inside the lessons (3.0, Home).    *note: stages 2–6 are hardcoded as Volt stages today (M1, M51)* | **RETIRED** |
| *home-next.js*    Level card, fine print | Retired: the Level panel shows the bar, the XP and the next reward, with no fine print (3.0, Home).    *was: XP comes from finishing lessons and challenges. Speed earns pars and board places, never XP.*    *note: M10* | **RETIRED** |
| *home-next.js*    Level, the panel's heading (new, 3.0) | Level {n}. At the right: {xp} of {next} XP. | **DRAFT** |
| *home-next.js*    Level, the next reward, drawn under the bar (new, 3.0) | At level {n+1}: {reward}. | **DRAFT** |
| *home-next.js*    Achievements, the panel (new, 3.0) | Achievements. At the right: {n} of {m}. \|\| Under the latest badges: Next up is {badge}, {d} of {k}. | **DRAFT** |
| *save_nudge*    Save nudge (Home, after the first lesson) | Your progress is saved on this device. Make a free account and it follows you to any computer.    *was: Your progress is saved on this device. Create a free account to keep it across devices — everything carries over.* | **DRAFT** |

### 3.5 Learn

**What happens.** Learn is a table of the chapter, not a data room of folders (3.0, "Learn"). The page's tabs are Chapter 1 to Chapter 6. The chapter is a table: a row per module with its number, title, minutes, status and tier marks, the open module's lessons under it, and the next lesson selected. Beside it, a preview of the page the selected module builds. A Pro chapter on a free account shows the paywall panel in place of its lessons (3.13). "Already know this?" opens the chapter's assessment, which is the test-out (M16). The case's name and the sale's stages stay off the page; they live inside the lessons (3.0, "Home").

| **Key · where it shows** | **Line (edit this)** | **Status** |
| :- | :- | :- |
| *learn-next.js*    Page heading and sub | Retired: Learn opens on its chapter tabs with no heading line, and the case's name stays off site pages (3.0, Learn).    *was: Project Volt · data room. One deal, six chapters. Each chapter is a stage of the sale and produces one page of the pack. Your progress is {saveLine}.* | **RETIRED** |
| *learn-next.js*    The page's tabs (new, 3.0) | Chapter 1, Chapter 2, Chapter 3, Chapter 4, Chapter 5, Chapter 6 | **DRAFT** |
| *learn-next.js*    The chapter table (new, 3.0) | Columns: Module, Minutes, Status, with the number first and the tier marks last. The open module's lessons sit under its row. | **DRAFT** |
| *learn-next.js*    Chapter 1 folder, body | Retired: chapters are tabs over a table, not folders, and the case stays inside the lessons (3.0, Learn).    *was: Management sent the weekly site report for the Austin cluster, untidy. The deliverable is the weekly KPI page: clean, live, formatted, checked, print-ready. Seven modules, each one job on that file, then the project and assessment.* | **RETIRED** |
| *learn-next.js*    Test-out link | Already know this? Take the assessment. \|\| Once it's passed: Verified.    *was: Already know this? Test out · Tested out ✓*    *note: M16, the assessment is the test-out* | **DRAFT** |
| *learn-next.js*    Module status | Complete · Lessons done · challenge open · In progress · Not started · Coming | LIVE |
| *learn-next.js*    Page caption under a module | Retired: the selected module's page is previewed beside the table (3.0, Learn).    *was: Page {n} {page name} · delivered / Page {n} fills in when the challenge passes* | **RETIRED** |
| *learn-next.js*    The preview beside the table (new, 3.0) | {page name}, over the preview. \|\| Before the module's challenge is passed: Pass the challenge to fill this in. | **DRAFT** |
| *learn-next.js*    Replay link | Replay on a new sheet (R)    *was: Replay · new sheet →* | **DRAFT** |
| *lock-page.js PAID_LINE*    Locked chapter, and the paywall | Retired: a Pro chapter shows the paywall panel, with Wolf's line (3.0, Pricing and the paywall).    *was: Chapter 2 on is the paid tier: the house formatting, full model builds and the serious timed play. Chapter 1 stays free, personal bests and all.* | **RETIRED** |
| *learn-next.js*    Locked chapter, the stage | Retired: the stages stay inside the lessons, and a Pro chapter shows the paywall panel (3.0, Learn).    *was: Management sends: {sends}. You deliver: {delivers}.* | **RETIRED** |
| *learn-next.js*    Chapter 2 lock line | Retired: a Pro chapter on a free account shows the paywall panel in place of its lessons (3.0, Learn).    *was: Opens when Chapter 1 is complete or tested out, with the paid tier.* | **RETIRED** |
| *learn-page.js CHAPTER_PLAN*    Chapter teasers, one spoken line each | Retired: a chapter tab is a table of its modules with no teaser, and the one line per chapter is the landing page's (3.0, Learn; 3.1).    *was: six topic lists ("Number formats, fonts, borders and fills, alignment…")* | **RETIRED** |

### 3.6 Module opening: the story card

**What happens.** The first lesson of each module opens on one story card: the title and a three-sentence body, roles only, no dialogue (M49), with no label above the title (3.0, "What the copy and the screen never do"). These are the only story moments inside a chapter, and they're where the case lives, with the lessons; it never shows on a site page (3.0, "Home"). Enter starts the job. The cards themselves are in each chapter's script.

| **Key · where it shows** | **Line (edit this)** | **Status** |
| :- | :- | :- |
| *beats.js*    Eyebrow | Retired: no label above a heading (3.0, What the copy and the screen never do).    *was: Module 1.1 · open and set up* | **RETIRED** |
| *modules.csv story_beat*    Title and body | See the Chapter 1 Script, one per module. | **DRAFT** |
| *beats.js*    Button | Start the job (Enter)    *was: Start the job ↵* | **DRAFT** |

### 3.7 The lesson workspace

**What happens.** The sheet gets the window (3.0, "The workspace" and "The task card"; M87, M90, M91). The chrome is one title row folded into the Ribbon's tab row: the back button with its Esc key, the lesson's title as a button that opens the module's lessons, the Ribbon's tabs, and at the right the goal segments with "Goal {n} of {m}", then sound and More; a lesson tints the back and title cells green. Under it: the Ribbon (full in a lesson), the Quick Access Toolbar on its own row, a quiet formula bar, and the sheet. The task card sits beside the goal's target on the side with the most room, never over the active cell, the selection, the target or a note, and glides to the next target when a goal lands. It shows the goal segments, the goal, the teach line the first time a key is taught, the keys as keycaps that fill as they're pressed, one live line, and a footer with F1 Help and Ctrl+Shift+K Hide: no label above the goal, no tabs, no chip, no buttons. It folds to a pill while a cell is being edited. Help opens inside the card: Show the keys (the run stays clean), Show me once and Do it for me (each marks the goal assisted). Some lessons open with a short played demo on the learner's own sheet (M31). Stuck for 8 seconds, the target pulses with the next key on a small pill; at about 20 seconds Help is ringed (the nudge). A broken convention gets the pen: a red reviewer's mark around the cell, with the rule's chip and the correction line beside it (section 7), in place of the chip the card used to carry. Esc cancels an edit, then closes a note, a menu or Help, and only then leaves; leaving a lesson part-way asks for Esc again, never a dialog. The only dialog is a confirmation, such as restarting a lesson.

| **Key · where it shows** | **Line (edit this)** | **Status** |
| :- | :- | :- |
| *lesson-view.js*    Demo card, before the goals (new, M31, M52) | Watch it once: the keys show as they're pressed, and Enter skips to the goals. After it: Your turn (Enter). | **DRAFT** |
| *lesson-view.js*    Task card label | Retired: the card has no label above the goal; it shows Goal {n} of {m} with the segments (3.0, The task card).    *was: Now {d} / {n} · Still needed {d} / {n} · Done* | **RETIRED** |
| *lesson-view.js*    The goal count, on the card and in the title row (new, 3.0) | Goal {n} of {m} \|\| In a drill: {d} of {n} tasks | **DRAFT** |
| *goals.csv text / teach*    The goal and its teach line | See the chapter scripts. | LIVE |
| *lesson-view.js*    Task card, the live line under the keys (new, 3.0) | {n} keys in. Press {key}. \|\| After a wrong key: That was {key}. Start again with {first key}. | **DRAFT** |
| *goals.csv why*    Under the goal: the payoff | Retired: the why lives inside the teach line (M28). | **RETIRED** |
| *goals.csv hint_stuck*    After 8 seconds stuck | See the chapter scripts: "pulse <target> · <one subtle line>" (M27). | **DRAFT** |
| *lesson-view.js*    Mouse nudge | Retired: the card has no Help tab; Help opens inside the card on F1 (3.0, The task card).    *was: Try it with the keyboard. / Try it with the keyboard: the Help tab shows the keys.* | **RETIRED** |
| *lesson-view.js*    Mouse nudge, in the card's live line (new, 3.0) | Try it with the keyboard. \|\| Try it with the keyboard. F1 opens Help, which can show you the keys. | **DRAFT** |
| *lesson-view.js*    Help, Show me once, while it plays | Watch the keys play on your sheet. When they're done, the sheet goes back the way it was. Esc hands it back early; ← → steps through.    *was: The keys play on the sheet, then it goes back as it was. Esc hands back now; ← → step.* | **DRAFT** |
| *lesson-view.js*    Show me, ended | Your turn. | LIVE |
| *lesson-view.js*    Help, inside the card (new, 3.0) | Show the keys \|\| Show me once \|\| Do it for me \|\| Under them: Show the keys keeps your run clean, and the other two mark this goal assisted. | **DRAFT** |
| *lesson-view.js*    Help, before showing keys | Retired: Show the keys keeps the run clean, so Help needs no warning before it (3.0, The task card).    *was: Reading is free. Showing the keys counts as help: this attempt is then marked assisted.* | **RETIRED** |
| *lesson-view.js*    Help, goals done but the sheet is off | Every goal's done, but the sheet isn't where it needs to be yet. Fix what's listed to finish the lesson (Ctrl+Z undoes a step).    *was: Every goal has landed, but the sheet is not yet as the lesson expects. Put this right and the lesson completes; Ctrl+Z undoes.* | **DRAFT** |
| *lesson-view.js*    Help footer | Press the keys one after another. Esc backs out of the Ribbon or a dialog box; Ctrl+Z undoes. | LIVE |
| *lesson-view.js*    Task card, the footer (new, 3.0) | Help (F1) and Hide (Ctrl+Shift+K) | **DRAFT** |
| *lesson-view.js*    Help in an assessment | No help in an assessment: every key this run needs was taught in the chapter. | LIVE |
| *lesson-view.js*    Shortcuts used, empty | Retired: the shortcuts used are listed once, in the lesson-complete panel (3.0, Lesson complete).    *was: No shortcuts yet. They are listed here as you press them, with how often.* | **RETIRED** |
| *lesson-view.js*    Lesson complete, under the shortcuts used: the mouse count | Mouse: {n} clicks. It's allowed in a lesson, but the keyboard is what you're practicing.    *was: Mouse: {n} click(s) on the workspace. Allowed here; the keyboard is what you are practicing.* | **DRAFT** |
| *tab_keys_note*    Browser keeps a shortcut | Your browser keeps Ctrl+PgDn and Ctrl+PgUp for its own tabs, so here Alt+PgDn and Alt+PgUp switch sheets and count the same. Fullscreen and the installed app hand the real keys to the sheet.    *was: Your browser may keep Ctrl+PgDn and Ctrl+PgUp for its own tabs. Fullscreen hands them to the sheet, and so does the installed app.*    *note: M41* | **DRAFT** |
| *lesson-view.js*    Focus hint | Click the sheet to start typing | LIVE |
| *lesson-view.js*    Timer line | Retired: a timed run's clock, pace and track are in the run panel (3.0, The timed run).    *was: clock starts on your first key · pass {p} s · limit {l} s · {x.x} s left · over the limit* | **RETIRED** |
| *main.js*    Screen too narrow | hotkey.gg needs a keyboard and a wider screen. Lessons and drills run on a real spreadsheet with the keyboard. Open this page on a laptop or desktop, at least 900px wide. | LIVE |
| *lesson-view.js*    Leaving a lesson part-way, after the first Esc (new, 3.0) | Esc again to leave. | **DRAFT** |
| *lesson-view.js*    The confirmation for restarting a lesson (new, 3.0) | Restart this lesson? \|\| The sheet goes back to how the lesson opened, and the goals start over. \|\| Cancel (Esc) and Restart (Enter) | **DRAFT** |

### 3.8 Lesson complete

**What happens.** Lesson complete is the same panel as a drill's result, at the right of the sheet (3.0, "Lesson complete"): the done line, the payoff paragraph, the shortcuts used, the XP row (and a level-up row if one lands), then "Next lesson" on Enter. It isn't an overlay and has no ring, and the sheet stays in view. The panel's contents change in place (3.0, "Motion and moments"). Every lesson from 1.3 on ends on a "Does it tie?" goal: an input changes and the learner watches the sheet answer (the check, 3.0).

| **Key · where it shows** | **Line (edit this)** | **Status** |
| :- | :- | :- |
| *lesson-view.js*    Title | Lesson complete \|\| Project complete \|\| Chapter Verified \|\| Pass \|\| Expert \|\| Legendary    *was: Lesson complete · Project complete · Assessment passed · Tested out — chapter cleared · Pass · Pro · Legendary*    *note: M16 folds "tested out" into Verified; M53 renames the tier* | **DRAFT** |
| *lessons.csv wow*    Done screen, the line | See the chapter scripts ("Done screen, line"). | **DRAFT** |
| *lessons.csv closing*    Done screen, the paragraphs | See the chapter scripts ("Done screen, paragraph", split by \|\|). | **DRAFT** |
| *lesson-view.js*    Shortcuts used, in the panel (new, 3.0) | Shortcuts used, as the heading. Each row: the keys, then {n} times at the right. | **DRAFT** |
| *lesson-view.js*    Clean mark | Clean sheet: you did every goal yourself, with no mouse.    *was: ✓ Clean sheet — no mouse, no help* | **DRAFT** |
| *lesson-view.js*    Assisted mark | Assisted: Help played or did a goal for you.    *was: Assisted — steps were shown on request.* | **DRAFT** |
| *lesson-view.js*    Race table (1.1.1) | Slow way · Your way · {n}× faster with shortcuts.    *note: goes with the sixty-press round (M30)* | **RETIRED** |
| *page_delivered*    When a module's page is done | Page {n}, {page}, is done.    *was: Page {n} — {page} — delivered to the data room.* | **DRAFT** |
| *lesson-view.js*    Next job | Retired: the panel ends on Next lesson, with no preview of the next brief (3.0, Lesson complete).    *was: Next: {first sentence of the next brief}* | **RETIRED** |
| *lesson-view.js*    The panel's button (new, 3.0) | Next lesson (Enter) | **DRAFT** |
| *lesson-view.js*    After the very first lesson | Your first lesson is saved on this device, and a free account takes it to any computer.    *was: Your first lesson is done. Progress is saved on this device. Create a free account to keep it across devices — everything you have done carries over.* | **DRAFT** |
| *install_prompt*    After the second lesson | Install hotkey.gg as an app. It opens in its own window, the browser stops grabbing your shortcuts, and Ctrl+PgDn works the way it does in Excel.    *was: Install hotkey.gg as an app. One click; it opens in its own window and stays in your dock.* | **DRAFT** |
| *lesson-view.js*    Time's up, in a challenge | Time's Up. Keep Drilling. \|\| Nothing's recorded when the clock runs out.    *was: Time’s up — try again. Nothing is recorded for a run that ran out. The report is the same every time — another run is more practice.* | **DRAFT** |
| *lesson-view.js*    Save failed | Couldn't save on this device (storage blocked); the lesson still counts for this visit | LIVE |

### 3.9 Challenges

**What happens.** A module ends with its challenge: the module's work remixed on a fresh, seeded file (a different cluster, fresh figures, one twist), timed, graded on conventions as well as numbers. It runs in the timed-run panel at the right of the sheet, the same as a drill (3.0, "The timed run"): Ready, Run, Result, Next, with the clock in the challenge violet. It opens with the Ribbon collapsed and the sheet zoomed to fit. Right numbers with a broken convention don't pass, and the pen marks the cell with the rule's chip and its correction line (section 7). The first attempt is soft-timed; later ones are hard. Pass, Expert and Legendary tiers. Passing fills in the module's page, previewed beside it on Learn. The result offers the next lesson on Enter and a retry on R. Every challenge also sits on Practice's Challenges page (3.10). Challenge briefs are in the chapter scripts.

| **Key · where it shows** | **Line (edit this)** | **Status** |
| :- | :- | :- |
| *lesson-view.js*    Before a challenge | Retired: a challenge opens at Ready in the run panel, on Press any key to start (3.0, The timed run).    *was: Start the challenge ↵ · Back to Learn* | **RETIRED** |
| *lesson-view.js*    Card | Retired: the run panel's checklist holds the tasks, and the title row shows the count (3.0, The timed run).    *was: Challenge {d} / {n}* | **RETIRED** |
| *lesson-view.js*    Over the limit, first try | Over the limit: no tier, but the module counts.    *was: Over the limit — no tier. The module still counts.* | **DRAFT** |
| *lesson-view.js*    Over the limit, assessment | Over The Limit. Run It Again. The page is built, but the chapter isn't Verified yet, and the clock is hard from here.    *was: Over the limit — no tier, and the gate is not passed. The run still counts; the next attempt runs against a hard clock.* | **DRAFT** |
| *lesson-view.js*    Buttons after | Retired: a challenge's result offers the next lesson on Enter and a retry on R (3.0, The timed run).    *was: Continue ↵ · Retry same sheet R · New sheet N* | **RETIRED** |
| *lesson-view.js*    A challenge's result, the buttons (new, 3.0) | Next lesson (Enter), Run it again on a fresh file (R) and See the board (B) | **DRAFT** |
| *print-preview.js*    End of the project: the reviewer | Nothing to flag: the CFO would have signed it off as it is. / The CFO would have sent it back for {what}.    *was: Nothing to flag: the associate would have sent it as it is. / The associate would have flagged {what}.*    *note: company side; the CFO checks in Chapter 1, the bankers' associate from Chapter 2, the buyer's analyst from Chapter 3 (M55). The {what} phrases are in 7.3.* | **DRAFT** |

### 3.10 Practice

**What happens.** The reps, no story (3.0, "Practice" and "The timed run"; M89, M93). Practice opens on Drills: a header block with "Drills", one line ("Six drills picked for you, about ten minutes." and a "See the set" link), the length (5, 10 or 20 minutes, remembered) and "Start drilling" on Enter. The set mixes what's due, the slowest drills against their pars, the newest unlocked drill and drills under their next tier, and never includes Pro drills on a free account. Under the header, the catalog in two columns by chapter: name, length, your best, tier marks. The selected row carries the cursor and Enter plays it; a Pro drill on a free account is gray with "Pro" and opens the paywall panel. The Daily, Rapid-fire and Challenges are each their own page under Practice in the rail, with the same header block (the title, one line, the primary button) and a table or board below. Every timed run (drills, the Daily, challenges, assessments) is one loop in a 340px panel at the right of the sheet, which is never dimmed or covered: Ready, Run, Result, Next. The clock starts on the first key, and that key doesn't land on the sheet. Help or the mouse means no personal best and no board entry, and the result panel says why. Rapid-fire is its own stage, not the workspace (3.0, "Rapid-fire"; M100): the command's name as the page's one large line, a small sheet fragment under it, keycaps that show "?" until they're pressed, a ten-segment combo meter, and a result with "Drill these" on Enter. Keep sharp is a quest now (M18) and the sandbox is gone (M21). The drill catalog is in section 6.

| **Key · where it shows** | **Line (edit this)** | **Status** |
| :- | :- | :- |
| *practice-page.js*    Heading | Retired: Practice opens on Drills, with the header block in the next row (3.0, Practice).    *note: the two rules of timed play are in the side panel at Ready*    *was (draft): Practice. The reps, on the clock, for after the lessons. The clock starts on your first key; use help or the mouse and the run doesn't set a best or post a time.*    *was: Practice. Drills against the clock, once the lessons are done. The clock starts on your first key; help or mouse means no personal best and no posted time.* | **RETIRED** |
| *practice-page.js*    Drills, the header block (new, 3.0) | Drills \|\| Six drills picked for you, about ten minutes. See the set \|\| Length: 5 minutes, 10 minutes, 20 minutes \|\| Start drilling (Enter)    *note: the count and the minutes follow the length picked* | **DRAFT** |
| *practice-page.js*    The Daily card | Retired: the Daily has its own page under Practice (3.0, Practice).    *was: One drill a day, same for everyone. Today: {drill}. The figures change each day where the drill allows; the streak counts practice days and never takes anything away.*    *note: M20* | **RETIRED** |
| *practice-page.js*    The Daily, a Pro drill for a free learner (new) | Today's drill is from Chapter {n}, which is Pro. Everyone plays the same sheet, so play it anyway. | **DRAFT** |
| *practice-page.js*    Keep sharp card | The challenge from module {1.x}, {title}. Two to three minutes; the keys are the ones the module taught.    *note: becomes the quest "Run the {module} challenge again." (M18)* | **RETIRED** |
| *practice-page.js*    Drills, chapter group header (new) | Chapter {n}: {name}. At the right: {done} of {of} passed. | **DRAFT** |
| *practice-page.js*    Drills: a cell, and the selected drill beside the grid (new) | Retired: the catalog is two columns of tables by chapter, with no grid and no side description (3.0, Practice).    *note: names and marks in the grid, one sentence only for the selected drill (3.0); task lines are in 6.1 and 6.2* | **RETIRED** |
| *practice-page.js*    Drills, the catalog's columns (new, 3.0) | Drill, Length, Your best, then the tier marks. A Pro drill on a free account is gray, with Pro at the right, and Enter on it opens the paywall panel. | **DRAFT** |
| *drill-page.js*    Ready, in the side panel (new, 3.0) | {title} \|\| One row of facts: {n} tasks, then {length}, then Your best {b}s with its tier marks. \|\| The numbered tasks. \|\| The pars on one row: Legendary {l}s, Expert {e}s, Pass {p}s. \|\| Press any key to start \|\| Back to Drills (Esc) | **DRAFT** |
| *drill-page.js*    Run, the panel's header beside the clock (new, 3.0) | {tier} pace, as in Expert pace | **DRAFT** |
| *drill-page.js*    Run, the checklist (new, 3.0) | {n} done \|\| {n} more after these | **DRAFT** |
| *drill-page.js*    Run, the panel's foot (new, 3.0) | Esc ends the run without a time. | **DRAFT** |
| *drill-page.js*    Result, in the side panel (new, 3.0) | {t}s, with {tier} and its marks on the same line. \|\| New best, when it is. \|\| Then the track, the tasks, the XP row, the board row, any quest that ticked, and a level-up row when one lands (the rows below). \|\| Next: {title} (Enter). Run it again (R). See the board (B). | **DRAFT** |
| *drill-page.js*    Result, the board row (new, 3.0) | {place} of {n}, up {k} \|\| With no move: {place} of {n} | **DRAFT** |
| *drill-page.js*    Result and lesson complete, the XP row, whose bar fills (new, 3.0) | +{n} XP | **DRAFT** |
| *drill-page.js*    Result and lesson complete, the level-up row (new, 3.0) | Level {n}, with {title} at the right. \|\| Under it: {reward} is yours. \|\| Button, when the reward is something to switch on: Equip (E). | **DRAFT** |
| *drill-page.js*    Result, a quest that ticked (new, 3.0) | {quest}, {d} of {k} \|\| When it completes: Done, +{xp} XP | **DRAFT** |
| *practice-page.js*    The Daily's page (new, 3.0) | The Daily. At the right: {date}. \|\| Today it's {drill title}: ninety seconds on the same sheet as everyone else. \|\| Play today's Daily (Enter) \|\| Below it, today's board (3.11), with {n} clean runs so far at the right of its heading. \|\| Your row, before you've played: You haven't played today. | **DRAFT** |
| *rapid-fire.js*    Rapid-fire's page (new, 3.0) | Rapid-fire \|\| We name a command and you press its keys, which stay hidden until you stall. \|\| 30 seconds, 60 seconds, 120 seconds \|\| Start a round (Enter) \|\| Below it, Your best rounds, with the columns Length, Hits, Best combo. | **DRAFT** |
| *practice-page.js*    The Challenges page (new, 3.0) | Challenges \|\| Run a module's challenge again, on a fresh file each time. \|\| Start the challenge (Enter) \|\| Below it, the table: Module, Length, Your best, then the tier marks. | **DRAFT** |
| *practice-page.js*    Rapid-fire card | Retired: Rapid-fire has its own page under Practice (3.0, Practice).    *was: One shortcut at a time. 30, 60 or 120 seconds of single chords on a live sheet. Hits build a combo; the keys stay hidden until you stall. Recall is the game.* | **RETIRED** |
| *practice-page.js*    Sandbox card | A free sheet. The full workspace with nothing graded: try a shortcut, walk the Ribbon with Alt, build a small table.    *note: M21* | **RETIRED** |
| *practice-page.js*    Rules line | Retired: the result panel says why a run posted no time, so Practice carries no rules line (3.0, The timed run).    *was: Rules for timed play: any help or mouse use on the workspace in a timed run means no personal best and no board entry. Page controls like Start and Retry never count.* | **RETIRED** |
| *drill-page.js*    Drill start card | Retired: Ready is a beat in the run panel, and Press any key to start is part of it (3.0, The timed run).    *was: Press any key to start. The clock starts on your first key — this one never lands on the sheet.* | **RETIRED** |
| *drill-page.js*    Goal lines on the drill screen | One line per goal, a tick when it lands. See 6.1 and 6.2. | **DRAFT** |
| *drill-page.js*    Help turned on mid-drill | Help is on: this run sets no personal best and posts no time. | LIVE |
| *drill-page.js*    Time's up | Time's Up. Keep Drilling.    *note: Wolf's line, Round 1, with a period for the dash (3.0)*    *was: Time's up — try again.* | **DRAFT** |
| *drill-page.js*    Drill result | Pass! \|\| Expert! \|\| Legendary! \|\| Finished \|\| Finished, Assisted    *was: Pass! · Pro! · Legendary! · Finished · Finished — assisted*    *note: the tier result is the one place an exclamation mark is allowed (M53)* | **DRAFT** |
| *drill-page.js*    Result, help used | You used Help, so this run won't set a best or post a time, though it still counts as practice.    *was: Help was used, so no personal best and no posted time — the practice still counts.* | **DRAFT** |
| *drill-page.js*    Result, mouse used | The mouse touched the sheet, so there's no best and no posted time from this run.    *was: The mouse touched the workspace, so no personal best — the keyboard is the game.* | **DRAFT** |
| *drill-page.js*    Result, the Daily | That was attempt {n} today, and the board stays open until midnight UTC.    *was: Daily attempt {n} today — the board is the same all day, so keep going.* | **DRAFT** |
| *drill-page.js*    Result, new personal best (new) | New best, by {d} seconds.    *was (draft): New Personal Best – {t}s* | **DRAFT** |
| *result-card.js*    Daily result card | Retired: every result is the panel at the right of the sheet, never a card (3.0, The timed run).    *was: The Daily · {date} · Legendary ◆◆◆ · keys {n} / {ref} · efficiency {n}% · board #{pos} of {of} · @{handle} · hotkey.gg/#/daily* | **RETIRED** |
| *rapid-fire.js*    Rapid-fire, the stage before the first prompt | Press any key to start.    *was: Rapid-fire. One shortcut at a time, on a real sheet. Hits build a combo; a wrong chord breaks it. The keys stay hidden until you stall — recall is the game.* | **DRAFT** |
| *rapid-fire.js*    Rapid-fire, the top bar (new, 3.0) | Back (Esc), then {length}, then {n} hits, then the clock. | **DRAFT** |
| *rapid-fire.js*    Rapid-fire, the prompt (new, M19) | {Excel's name for the command}    *note: "Comma style", "Insert row", "Go To Special", "Paste values" – the command, never the key; the key appears only after a stall* | **DRAFT** |
| *rapid-fire.js*    Rapid-fire, the combo meter (new, 3.0) | Combo {n} \|\| The first Combo 10 adds: The Synthwave theme is yours. | **DRAFT** |
| *rapid-fire.js*    Rapid-fire, fine print | A round counts as practice and pays a little XP; it never sets a drill best.    *was: A round records as practice; it never sets a drill PB.* | **DRAFT** |
| *rapid-fire.js*    Rapid-fire, done | Retired: the round's result shows hits, the best combo, the accuracy and your three slowest commands (3.0, Rapid-fire).    *was: Round over · {n} pts · hits · misses · best combo · New best for this round length.* | **RETIRED** |
| *rapid-fire.js*    Rapid-fire, the round's result (new, 3.0) | {n} hits \|\| Best combo {c} \|\| {a}% accuracy \|\| Slowest: {command}, {command} and {command} \|\| Drill these (Enter) | **DRAFT** |
| *sandbox.js*    Sandbox | Sandbox: a free sheet where nothing is graded, so try anything.    *note: M21* | **RETIRED** |

### 3.11 Leaderboards

**What happens.** Leaderboards has page tabs: The Daily, Drills, Challenges, Desks (3.0, "Leaderboards"). A board is a table: the place, the handle with its level, a bar showing the time against the field, the time, the gap to first, and the keys used, with the route's key count in the header. Tier marks stay off the boards, since everyone near the top has the same three; they live on the personal views (the catalog, the result, the profile). The learner's own row is pinned under the top ten with its move. Beside the board, a side panel: the learner's last five runs on it and one line on where the time is going. Clean runs only (no help, no mouse), ranked by time, then keys, then the earlier run. Real people only: the boards are seeded with real times from real accounts before launch (M22). Rank names are gone (M22).

| **Key · where it shows** | **Line (edit this)** | **Status** |
| :- | :- | :- |
| *leaderboard-page.js*    Heading and sub | Leaderboards \|\| Page tabs: The Daily, Drills, Challenges, Desks    *was: Leaderboard. Every timed drill has a board. Viewable by everyone; entries need a clean run: no help, no mouse on the workspace.* | **DRAFT** |
| *leaderboard-page.js*    Daily tab | One drill a day, the same sheet and board for everyone, reset at midnight UTC. | LIVE |
| *leaderboard-page.js*    Board columns (new) | Place, Handle, Time against the field, Time, Gap, Keys ({n} on the route). The handle has the level beside it: Level {n}. | **DRAFT** |
| *leaderboard-page.js*    Your row, pinned under the top ten (new, 3.0) | Your row as it sits on the board, with its move after it: up {k} | **DRAFT** |
| *leaderboard-page.js*    The side panel, beside the board (new, 3.0) | Your {board}, as in Your Daily \|\| Your last five runs, each with its date, time and keys \|\| Most of your time goes on {task}, about {s} seconds a run. | **DRAFT** |
| *leaderboard-page.js*    Empty board | No one is on this board yet. A clean run puts you first. | LIVE |
| *leaderboard-page.js*    Desks tab, signed out | Sign in to see your desk's board.    *was: Boards open with accounts.*    *note: M9* | **DRAFT** |
| *leaderboard-page.js*    Desk prompt | Start a desk to compete with your own group. \|\| Link: Teams and desks    *was: Compete with your own group: start a desk. Teams and desks →* | **DRAFT** |
| *rank.js*    Rank names | Retired: boards show time, gap and keys, with the level beside the handle (3.0, Leaderboards).    *note: M22* | **RETIRED** |

### 3.12 Account, settings and save states

**What happens.** The account row in the rail opens Profile, Settings, Plan and billing, and Your certificate (3.0, "Account"; M101). Profile: the handle, the level and its title, the achievements shelf, and stats. Settings: two columns of grouped panels, each setting a row with its control at the right and any help under it, saved as it changes and synced to the account. Plan and billing: the plan, then the payment method and receipts through Stripe's customer portal, and a redeem code for group access. Your certificate is 3.16. Accounts are optional: email and password, a magic link, or Google once it's switched on. A generated handle you can rename. Guest progress carries over once, at first sign-in. The save state is always stated honestly.

| **Key · where it shows** | **Line (edit this)** | **Status** |
| :- | :- | :- |
| *store.js*    Save state (nav, results, Account) | Saved on this device · Saving to your account… · Saved to your account · Couldn't save, will retry · Couldn't save on this device | LIVE |
| *account-page.js*    Guest | You're a guest, so everything here is saved on this device only.    *was: You are a guest. Everything here is saved on this device only.* | **DRAFT** |
| *account-page.js*    Sign-in card | Keep your progress across devices. Email and password, a magic link, or Google. No anonymous accounts: as a guest your work stays in this browser. | LIVE |
| *account-page.js*    What carries over | What is carried over when you sign up · Lesson progress · Personal bests · Platform and theme · Carried once, to the account you create, never from another account. | LIVE |
| *account-page.js*    Handle | Appears on public boards and your public profile if you allow it; change any time (once a day). | LIVE |
| *account-page.js*    Plan and billing (new, 3.0) | Plan. At the right: Free, with Go Pro (Enter) under it. \|\| Plan. At the right: Pro, with Owned, or Renews {date}, under it. \|\| Payment and receipts, which opens Stripe's customer portal. \|\| Have a code? Redeem it here. | **DRAFT** |
| *profile-page.js (new)*    Profile (new, 3.0) | {handle}, with Level {n} and {title} beside it. Then the panels: Achievements, Stats. | **DRAFT** |
| *account-page.js*    Stats, time saved | Estimated time saved vs a mouse-and-menus route: \~{dur}. An estimate: keystroke counts against a slow route at half a second an action. | LIVE |
| *account-page.js*    Desks and Profile | Retired: the account row opens Profile, Settings, Plan and billing, and Your certificate, and desks live on Leaderboards (3.0, Account; Leaderboards).    *was: Desks arrive after accounts. / The public profile page arrives with accounts.*    *note: M9* | **RETIRED** |
| *account-page.js*    Settings notes | Retired: each setting's help sits under it, in the settings rows below (3.0, Account).    *was: Instructions and keycaps follow this. · Alt shows KeyTips on either. · Sounds are soft and off until you start. · A faint cursor races your best run once you have one.* | **RETIRED** |
| *settings-page.js (new)*    Settings, the group headings (new, 3.0) | Keyboard, Lessons, Practice, Appearance, Sound and motion, Email, Account and privacy | **DRAFT** |
| *settings-page.js (new)*    Settings, Keyboard (new, 3.0) | Key labels: Windows, Mac. Under it: Instructions and keycaps follow this. \|\| Keyboard layout: US, UK, Other \|\| Ribbon in lessons: Full, Tabs. Under it: Ctrl+F1 switches it as you go, the way it does in Excel. \|\| Ribbon in drills: Full, Tabs \|\| Letters on Alt for site pages: a switch. Under it: In a lesson or a drill, Alt always belongs to the Ribbon. | **DRAFT** |
| *settings-page.js (new)*    Settings, Lessons (new, 3.0) | Task card side: Auto, Left, Right. Under it: Auto puts the card on the side with the most room. \|\| Show the keys: First time, Always. Under it: First time shows them when a key is taught, and again after a stall. \|\| Nudge when stuck: 8 seconds, 15 seconds, Off. Under it: The target pulses and shows the next key. \|\| Demo before a lesson: a switch. Under it: Some lessons open with a short demo on your sheet. | **DRAFT** |
| *settings-page.js (new)*    Settings, Practice (new, 3.0) | Set length: 5 minutes, 10 minutes, 20 minutes \|\| Ghost of your best run: a switch. Under it: A faint cursor races your best run once you have one. \|\| Pace during a run: a switch. Under it: Shows the tier you're on course for while the clock runs. \|\| Show my runs on boards: a switch | **DRAFT** |
| *settings-page.js (new)*    Settings, Appearance (new, 3.0) | Theme: a tile for each theme, all one size. A locked theme is dimmed, with what it takes under its name: From level {n}, or {the special's condition}. \|\| Density: Comfortable, Compact \|\| Sheet zoom: 100%, 110%, 125%    *note: the special themes and their conditions are in 6.9* | **DRAFT** |
| *settings-page.js (new)*    Settings, Sound and motion (new, 3.0) | Sound: a switch. Under it: Sounds are soft and off until you start. \|\| Sound set: {the sets you have} \|\| Effects: Full, Reduced, Off. Under it: Your computer's reduced-motion setting always wins. | **DRAFT** |
| *settings-page.js (new)*    Settings, Email (new, 3.0) | Daily reminder: a switch. Under it: Only on days you haven't practiced. \|\| Weekly summary: a switch \|\| News: a switch | **DRAFT** |
| *settings-page.js (new)*    Settings, Account and privacy (new, 3.0) | Handle (its help is the Handle row above) \|\| Display name for the certificate. Under it: The name on your certificate and its verification page. \|\| Email and sign-in \|\| Public profile: a switch \|\| Export my data \|\| Delete my account (its confirmation is the Delete account row below) | **DRAFT** |
| *account-page.js*    Settings toasts | Retired: settings save as they change, and the save line says so (3.0, Account; Motion and moments).    *was: Panel: overlay · Celebrations: full · Density: compact*    *note: M8, show the labels not the keys* | **RETIRED** |
| *account-page.js*    Delete account | Delete your account for good: profile, attempts, bests and board entries go, and it can't be undone. Type {handle} to confirm. | LIVE |

### 3.13 Pricing, paywall and teams

**What happens.** Pricing puts Free and Pro side by side (3.0, "Pricing and the paywall"). Free: Chapter 1 in full, its drills and challenges, rapid-fire and the Daily, boards, streaks and achievements. Pro: a toggle between "Own it" ($29 once) and "Monthly" ($10 a month), then Chapters 2 to 6, every drill, challenge and assessment, the certificate, and the flair as you level. Then the 14-day money-back line. "Go Pro" on Enter opens Stripe Checkout (hosted), and the return lands on a "You're Pro" moment in the panel of the page the learner came from. Teams and classes get one row under both. The paywall is a panel on the page the learner opened (a Pro chapter on Learn, a Pro drill in the catalog), never a pop-up: Wolf's line, Go Pro (Enter) and Not now (Esc). Teams explains desks (free, private groups) and group access (paid, for organizations). No change to the live pricing or legal pages goes out without Wolf's go-ahead. *Wolf, 2026-09-27: the product is priced like a decent Steam game: $29 to own the whole course, or $10 a month. The live page keeps its current figures until he says go. "Go Pro" is the one plan; no per-chapter door at launch (9.1, question 11); DLC chapters later are sold on their own.*

| **Key · where it shows** | **Line (edit this)** | **Status** |
| :- | :- | :- |
| *pricing-page.js*    Heading (no line under it) | Pricing    *was: Pricing. Free to learn the basics. Paid for advanced Excel, full model builds and serious timed play. No trial: the free chapter is the trial.* | **DRAFT** |
| *pricing-page.js*    Plan columns (new) | Free, $0, then one ticked row each: All of Chapter 1 \|\| Chapter 1's drills and challenges \|\| Rapid-fire and the Daily \|\| Boards, streaks and achievements \|\| Button: Start learning (Enter). \|\| Pro, with the Own it and Monthly toggle, then one ticked row each: Chapters 2 to 6 \|\| Every drill, challenge and assessment \|\| The certificate, with a page anyone can check \|\| Themes and flair as you level \|\| Button: Go Pro (Enter).    *note: $29 and $10 are Wolf's; no student price at launch (3.0)* | **DRAFT** |
| *pricing-page.js*    Pro, the toggle (new, 3.0) | Own it: $29 once \|\| Monthly: $10 a month | **DRAFT** |
| *pricing-page.js*    The money-back line (new, 3.0) | If it's not for you, you get your money back within 14 days. | **DRAFT** |
| *pricing-page.js*    Teams and classes, one row under both (new, 3.0) | Buying for a team or a class? For teams has desks and group access. | **DRAFT** |
| *pricing-page.js*    After Stripe Checkout, in the panel of the page you came from (new, 3.0) | You're Pro, and Chapters 2 to 6 are open. | **DRAFT** |
| *pricing-page.js*    Terms rows | Chapter 1 is free in full, for as long as you like. \|\| Cancel Monthly any time, and your access runs to the end of the month you paid for. \|\| Nothing cosmetic is sold.    *was: … That is the trial. …* | **DRAFT** |
| *lock-page.js*    Paywall panel, heading | Chapter {n}: {name} \|\| {drill title} \|\| At the right of either: Pro    *was: =IF(paid, open, "locked") → locked · {n} · {lesson} is in the paid tier.*    *note: open question 8, the paywall drops its formula joke* | **DRAFT** |
| *lock-page.js*    Paywall panel, line and buttons | Go Pro for the rest of the content. \|\| Go Pro (Enter) and Not now (Esc)    *note: Wolf's line, Round 6* | **DRAFT** |
| *lock-page.js*    Paywall, signed in | This account isn't Pro yet. Go Pro, or redeem a code in Plan and billing.    *was: This account does not hold it yet. A redeem code opens it on the Account page; pricing is on its own page.* | **DRAFT** |
| *lock-page.js*    Paywall, with chapters sold alone (M58) | {lesson} is in Chapter {c}. \|\| Buy Chapter {c}, Go Pro for every chapter, and Not now (Esc)    *note: kept for a DLC chapter sold on its own; not used at launch (Wolf, 2026-09-27: one plan)* | **DRAFT** |
| *teams-page.js*    Teams | Teams and schools. For banks, training providers, finance clubs, classes and friend groups. Two things a group can do here. | LIVE |
| *teams-page.js*    Teams, the two things | A desk is free: a private board and assignments for any group with accounts, started by one organizer. Group access is Pro for everyone in the group, bought once by the organization, with a code each member redeems.    *was: … organiser · organisation · organisations …*    *note: American spelling, M9* | **DRAFT** |
| *teams-page.js*    Teams, sign-in line | Desks need an account. Sign in, then start one from the Desks tab on Leaderboards.    *was: Desks need an account. Sign-in arrives in the next phase; desk creation follows it.*    *note: M9* | **DRAFT** |

### 3.14 System lines

**What happens.** System lines say what happened, plainly. A page change over 150ms runs the route bar across the top, and a loading page shows its progress or its shape, never a spinner alone (3.0, "Motion and moments"). Banners come one at a time at the top right and go after four seconds or any key. The only dialog is a confirmation: a title, one sentence, Cancel (Esc) and the action (Enter) (3.0, "Menus, help and dialogs").

| **Key · where it shows** | **Line (edit this)** | **Status** |
| :- | :- | :- |
| *404.html*    404 | \=IFERROR(this_page, #REF!) \|\| That reference doesn't resolve. The page you asked for was moved, renamed, or never existed. The sheet itself is fine.    *note: open question 8, Claude's call: keep. An error page can afford one line of personality.*    *was: the same, with the formula and the line joined by a middle dot* | **DRAFT** |
| *main.js*    A page fails to load | {Page} didn't load. Something broke on our side. Retry, or go to Learn.    *was: {label} did not load. Something broke on our side. Retry, or go to Learn.* | **DRAFT** |
| *index.html*    Boot watchdog | Part of hotkey.gg didn't load. Check your connection and reload.    *was: hotkey.gg did not finish loading. Part of the site did not arrive. Check your connection and reload.* | **DRAFT** |
| *index.html*    Search description | Learn Excel like an analyst at a top firm, on a real sheet in your browser, and build the muscle memory to make it stick. Chapter 1 is free, and you don't need an account to start.    *was: Learn Excel the way analysts are taught: on a real sheet, one job at a time. Lessons, challenges, drills and the Daily in your browser. Chapter 1 is free. No account needed to start.*    *note: follows the subhead once it's locked (M56)* | **DRAFT** |
| *legal-pages.js*    Legal | Plain-English drafts marked for review, in American spelling (practice, license, organizations, "two business days"). No voice. A licensed professional reviews them before paid launch.    *was: British spellings: practise, licence, organisations, "two working days".* | **DRAFT** |

### 3.15 Reference

**What happens.** One page with every key the course teaches (3.0, "Reference"; M57): a title, a search box ("/" focuses it) and the Windows or Mac toggle. The keys sit in groups (Move, Select, Edit, Format, Formulas, the Ribbon, and each chapter's own), each group a table, in two columns of tables. A row is the key as a keycap, what it does, the lesson that teaches it, its state (Not yet, Taught, Practiced, Under par) and "Drill it", a twenty-second rep on that key. "Show me" plays the M31 demo. A line at the foot: "{n} of {m} keys collected". Keys from Pro chapters show to everyone: knowing they exist is free. Lessons show one route; the alternatives (the Ribbon route, the legacy menu route where one exists, the Mac key) are listed in section 10.4, and where they show on this page is open, since 3.0's table doesn't name them. The Help in a lesson reads the same list (M50).

| **Key · where it shows** | **Line (edit this)** | **Status** |
| :- | :- | :- |
| *reference-page.js*    Heading (no line under it) | Reference | **DRAFT** |
| *reference-page.js*    The search box and the toggle (new, 3.0) | Search keys \|\| Windows, Mac | **DRAFT** |
| *reference-page.js*    Collected count, the line at the foot (new, M57) | {n} of {m} keys collected | **DRAFT** |
| *reference-page.js*    Row state marks (new, M57) | Retired: the state column shows the state as a word (3.0, Reference).    *note: drawn icons, not characters (3.0); the mark's tooltip says the state in one word and the lesson that taught it* | **RETIRED** |
| *reference-page.js*    The state words (new, 3.0) | Not yet \|\| Taught \|\| Practiced \|\| Under par | **DRAFT** |
| *reference-page.js*    Row buttons (new, M57) | Drill it \|\| Show me | **DRAFT** |
| *reference-page.js*    Drill it, at Ready (new, M57) | {Command}, for twenty seconds on the same sheet each time. \|\| Press any key to start | **DRAFT** |
| *reference-page.js*    Drill it, the result (new, M57) | {t}s against a par of {par}s. \|\| The key moves to Practiced, or to Under par when you beat the par.    *note: no board, no personal best; it pays nothing but the state* | **DRAFT** |
| *reference-page.js*    Show me, the demo (new, M57) | Watch the keys on a small sheet, and Esc closes it. | **DRAFT** |
| *reference-page.js*    Group headings | Move, Select, Edit, Format, Formulas, The Ribbon, then a group for each chapter's own keys | **DRAFT** |
| *reference-page.js*    Column headings | Key, What it does, Taught in, State, then Drill it as each row's button | **DRAFT** |
| *reference-page.js*    Filter | Retired: Reference has a search box and the Windows or Mac toggle, and no filter (3.0, Reference). | **RETIRED** |
| *reference-page.js*    Legacy note | The legacy routes are the Excel 2003 menu letters (Alt, E, S, V for Paste Special). They still work in Windows Excel and plenty of desks use them, but the lessons teach the Ribbon route first. | **DRAFT** |
| *reference-page.js*    Mac note | ⌘ stands in for Ctrl on the letter shortcuts, ⌃ on the number-format chords, ⌥ shows the KeyTips. Function keys need fn unless System Settings › Keyboard makes them standard. | **DRAFT** |
| *reference-page.js*    Existing line | models colour inputs blue    *note: "color"* | **FLAG** |

### 3.16 The certificate

**What happens.** One certificate: hotkey.gg Certified, Excel for Finance (3.0, "The certificate"; M102). Your certificate, from the account row, shows the six chapters as the progress toward it, each with its lessons done and its assessment (Verified with the time, when passed), and the certificate itself in gray with "{n} of 6 chapters Verified" until all six pass. Once issued it has a public verification page, "Add to LinkedIn profile" (LinkedIn's add-certification link, filled in with the name, the issuer, the date, the credential ID and the verification URL) and "Copy the verify link". There are no chapter certificates: a chapter's Verified is a status and an achievement. A later course (4.9) earns its own certificate. Nothing is exported as a file; the work stays on hotkey.gg (Wolf, Round 3). Run R1b builds the progress model and this page (M102); issuing the certificate, with its public page, needs accounts and comes with Phase F.

| **Key · where it shows** | **Line (edit this)** | **Status** |
| :- | :- | :- |
| *certificate-page.js (new)*    Chapter certificate, Completed | Retired: there are no chapter certificates, and each chapter shows as progress on Your certificate (3.0, The certificate). | **RETIRED** |
| *certificate-page.js (new)*    Chapter certificate, Verified | Retired: a chapter's Verified is a status and an achievement, never a certificate (3.0, The certificate). | **RETIRED** |
| *certificate-page.js (new)*    The page's title (new, 3.0) | Your certificate | **DRAFT** |
| *certificate-page.js (new)*    The six chapters, as progress (new, 3.0) | Chapter {n}: {name}, then {d} of {m} lessons, then the assessment: Verified, {time} \|\| Before the assessment is passed: Not yet | **DRAFT** |
| *certificate-page.js (new)*    The certificate in gray, before it's issued (new, 3.0) | {n} of 6 chapters Verified | **DRAFT** |
| *certificate-page.js (new)*    The progress line, under it (new, 3.0) | Pass all six chapter assessments and it's issued in your name. | **DRAFT** |
| *certificate-page.js (new)*    Program certificate | hotkey.gg Certified \|\| Excel for Finance \|\| {display name} \|\| Issued {date} | **DRAFT** |
| *certificate-page.js (new)*    Once issued, the buttons (new, 3.0) | Add to LinkedIn profile \|\| Copy the verify link | **DRAFT** |
| *verify-page.js (new)*    Verification page | This certificate is real: hotkey.gg issued it to {display name} on {date}, credential ID {id}. \|\| The six assessment times and key counts below are the ones recorded on hotkey.gg. | **DRAFT** |
| *verify-page.js (new)*    Not found | No certificate matches that credential ID. Check it against the one on the certificate itself. | **DRAFT** |

## 4. The case study DRAFT

Wolf's call, Round 3 (2026-09-27): an express car wash. Everything below is the case rebuilt around it, with the story told from inside the company. Names: the deal is **Project Rinse** (Wolf, Round 4). The company is **Clearcoat Express** (Wolf, 2026-09-27; the earlier working names were dropped: Zest for its connotations, Brightwash because it resembled a real business; a web search found no car wash trading as Clearcoat, only the clearcoat protectants the industry sells). Generic on purpose: the clear coat is the top layer of a car's paint, the thing a wash protects, so the name belongs to the business without pointing at any real one, and it types cleanly into a cell title and a file name. The restructuring DLC in 4.9 doesn't need a wink to work. A trademark search on the chosen name before anything ships.

### 4.1 Why a car wash

The bootcamps use two kinds of case. A real company (WSP and BIWS model Apple, Steel Dynamics, BMC Software) buys recognition and real filings, and pays for it in scale, staleness and a story that can't be a sale. The lemonade stand buys intuition and pays for it in credibility once you reach the LBO. An express car wash is the lemonade stand at private-equity scale: one product (a wash), one price, one cost per wash, sold at forty sites; everyone has been through one; and it's the business private equity has actually been buying for the last five years, so a sale to a sponsor is the true story, not a contrivance. Memberships give it recurring revenue (the finance concept every buyer prices), the tunnel gives it capacity and utilization, and a new site costs real money, which is why the owners need a buyer.

### 4.2 The business on a napkin

What every learner can say after Chapter 1. Clearcoat Express runs 40 express car washes across Texas: clusters in Austin, San Antonio, Dallas–Fort Worth and Houston. An express wash is a tunnel: the car goes in dirty, comes out clean three minutes later, and the driver never leaves the seat. Two kinds of customer: retail, who pay per wash (three packages: Basic $10, Deluxe $15, Ultimate $20), and members of the Unlimited Wash Club, who pay a monthly fee ($25 to $35 by package) and wash as often as they like. The arithmetic: washes × average ticket = revenue; less what each wash costs in chemicals, water and power (about $1.50) = gross profit. A typical site washes about 250 cars a day, half of them members, at a blended $14 a wash: roughly $3,500 of revenue and $3,100 of gross profit a day. Each site then pays its crew, rent, maintenance and card fees (the site costs); what's left is the site's contribution. Head office comes off that; what's left is EBITDA, the number every buyer prices from.

Working figures for the whole company (illustrative; the workbooks decide; Wolf: keep the math easy): 3.6 million washes a year, revenue about $50m, gross margin about 88%, site costs about $22m, head office about $6m, EBITDA about $16m and growing. A new site costs about $5m all in (land, building, tunnel equipment), so the plan to go from 40 sites to 70 needs about $150m of capital, which is why the owners are selling to private equity. Clearcoat's own share of that is about $2.5m a site (the building, the tunnel and the equipment) because the land under a new site is rented; it owns the land under twenty of its first forty, which is what the sale-leaseback in 6.3.3 sells. So the model's rollout capex is about $15m a year and the rollout no longer eats every dollar of cash (Wolf, 2026-09-30; a build session confirms the figures on a real rebuild). What arrives when: retail and membership as separate revenue lines in Chapter 2; per-wash transactions, packages and member records in Chapter 3; utilization (washes per hour against what the tunnel can do), channels and cases in Chapter 4; the site rollout, capex and debt in Chapter 5; the bids in Chapter 6. Nothing arrives before the learner needs it.

### 4.3 The people

Roles, never names, and the learner is never given a title. You work at Clearcoat, on the finance team. The **CFO** is your boss and the one who checks your work through Chapter 1. The **owners** (the two founders and a family office) are selling. **Site managers** run the washes and send the weekly numbers. **Ops** collects them. The **bankers** arrive in Chapter 2 to run the sale, and from then on they're the ones asking for pages; the associate on the bank's team is the one who checks them. The **buyers** are private-equity sponsors, three of them by Chapter 4; their diligence teams send the questions. The **board** (the owners plus the CFO) decides at the end. And you have a stake: like every manager at Clearcoat, you hold options over a small slice of the company (0.2% fully diluted, working figure), so the waterfall in Chapter 6 ends on a line that's yours.

### 4.4 Where the mess comes from

Clearcoat has no data team. Every Monday, five site managers email their own weekly sheet, in five formats, and ops pastes them into one workbook: a tab still called Sheet2, a stale export nobody deleted, a site name spelled two ways, a figure typed as text, a cost typed straight into a formula. That's Chapter 1. The point-of-sale system in every tunnel records each wash as a row, and that export is the clean truth; it arrives in Chapter 3, and it doesn't tie to what the managers sent. Reconciling the two is the databook. Every fault the lessons fix is one a real 40-site operator produces every week.

### 4.5 The sale, stage by stage

A sale to a sponsor runs: preparation, the book, first-round bids, the data room and diligence, final bids and the recommendation, signing. Six chapters, six stages, six documents.

| Chapter | Where the deal is | What arrives | What you build | Who reads it |
| :- | :- | :- | :- | :- |
| 1 Foundations (free) | Preparation. The owners have decided to sell; the CFO asks for weekly numbers the company can stand behind. | The five Austin managers' weekly sheets, pasted into one workbook | The weekly KPI report: clean, live, formatted, checked, print-ready | The CFO, every Monday; later the bankers as current trading |
| 2 Formatting | The book. The bankers are hired and drafting the information memorandum. | Three years of P&L as a raw export from the accounting system | The historical financials section, presentation quality | Every buyer, in the book |
| 3 Formulas | First-round diligence. Buyers want the business site by site, and it has to tie to the financials. | The POS export (every wash a row, in codes), the site and package masters, the member list, a summary somebody started that doesn't tie | The KPI databook, every number reconciled to the POS | The buyers' analysts, in the data room |
| 4 Data and Lookups | The data room is open. Three sponsors are sending questions. | The buyer question log, the raw transaction export, the rollout assumptions | The diligence pack: the cuts buyers asked for, the utilization dashboard, the management case with sensitivities | The buyers' deal teams; the management presentation |
| 5 Finance and Accounting | Final round. Bidders want a model they can run their own cases on, and a view of what the cash flows are worth. | The rollout plan, the debt terms, three years of statements | The three-statement operating model with schedules and checks, and the DCF page | The buyers, in the data room; the board |
| 6 Valuation | Final bids are in. The owners need a recommendation. | Three bids, the comparable companies, the precedent deals, the lead sponsor's term sheet | The valuation: comps, precedents, the LBO the sponsor is running, and the waterfall of what the owners take home, on one page | The board, not the buyers |

### 4.6 The arithmetic ladder

One rung per chapter, so the finance never arrives before the Excel that carries it. Chapter 1: washes × average ticket − cost per wash, per site, per week; a total row and a checks row. Chapter 2: retail and membership revenue by year, site costs by line, head office, EBITDA. Chapter 3: one row per wash; package prices; member tenure from join and cancel dates; the reconciliation between the POS export and the managers' numbers. Chapter 4: utilization (washes per hour against tunnel capacity), member share, and three cases (management, base, downside). Chapter 5: sites × washes per day × days × ticket plus members × fee as a revenue build; capex per new site and depreciation; working capital; debt and interest; the three statements; free cash flow and a DCF. Chapter 6: EV/EBITDA and EV per site as multiples; sponsor returns (IRR, MOIC); the waterfall from enterprise value to the owners' proceeds.

### 4.7 Story rules

  - The people around the learner are roles: the CFO, the owners, the site managers, ops, the bankers and their associate, the buyers and their analysts, the board. Never a named character, and never a job title for the learner.
  - One story beat per module, on the story card. Nothing mid-lesson. A brief can carry a line of situation ("Airport's Saturday never came through") but the story card does the telling.
  - Every job has a reason a buyer, a banker or the CFO would care about. If a lesson can't say who's waiting for the page, the lesson has the wrong framing.
  - Chapter 1 arithmetic stays lemonade-stand simple: washes × ticket = revenue, less cost per wash = gross profit. Packages, members, utilization and capex arrive in Chapters 2 to 5, one at a time.
  - The tone is Wolf's: warm, specific, a dry aside allowed ("as usual, they're a mess"), never a joke at the learner's expense.
  - Sentences with verbs. A story card or done screen that stacks fragments ("new page, on your own, timed") gets rewritten (section 2, Wolf, 2026-09-27).
  - The frame is the company's own work (Wolf, 2026-09-27): we're rationalizing data, cleaning up the business's worksheets and working the financials, so that the company has what a sale process needs. The bankers and the buyers appear when the stage brings them (Chapter 2 on); Chapter 1 never dresses a job as "for the bankers", and no chapter leans on them for its why. The CFO and the sale are reason enough.

### 4.8 The habits the story teaches

The chips in section 7 are the banking canon: color coding, one formula per row, no hardcodes, checks, print set-up. Two kinds of aside ride alongside in the lessons, as copy, not engine features: a **Best practice** (the habit, in two sentences: "At a desk the source usually lives in a cell note, not a label. Either way, the next person can find it.") and a **Top-bucket tip** (the nitpicky, formatting-grade detail that separates the analysts who get the top rating: "Percentages italic, one decimal, never two."). The consulting habits get chips of their own: **G4** Title says the answer · **G5** Source under every table · **G6** Round to what the decision needs.

**Top-bucket tips, first list** (Claude, Round 6; firm-neutral, the polish that isn't graded; Wolf adds or strikes):

  - Ctrl+Home on every sheet and land on the first tab before you save. A file that opens mid-scroll looks unfinished.
  - One zoom level across every sheet (100% or 85%), set before sending.
  - Column A is a narrow margin (width 2–3); labels start in B; sub-items are indented with the indent button, never with spaces. (From Chapter 2 on; Chapter 1's report keeps its labels in column A. The sheet standard in section 5 has the whole skeleton.)
  - Period columns all the same width, set by hand. AutoFit is for label columns.
  - Uniform row heights; one blank row between blocks, never two.
  - One font, one size (Arial or Calibri, 10 or 11); the title one size up; nothing else.
  - Decimals by line: currency 0, percentages 1, multiples 1 with an x, per-unit figures 2. One setting per line.
  - Negatives in parentheses, zero as a dash, $ on the first and total rows only, a units line under the title.
  - Top border on a total, double bottom on the final total, no vertical borders, no fills except the input tint and the actuals/estimates shade.
  - No merged cells, ever. Center Across Selection.
  - Freeze panes at the first period column and the first data row.
  - Tab colors: inputs one color, outputs another; sheet order left to right is reading order; unused sheets deleted.
  - Gridlines off on any page someone reads; on for working sheets.
  - No hidden rows or columns; group them. No external links. Named ranges only for toggles.
  - Print set-up before sending: fit to page, print titles, footer with file name, date and page.
  - File naming: Project_Client_Model_v03_20260927. Never "final".
  - Before sending: Ctrl+` for hardcodes, the checks row at zero, save with the cursor on A1.
  - A source on every hardcode, in the next cell or a note, with initials and a date.

### 4.9 After the sale: the restructuring chapter (DLC, later)

Wolf's idea, Round 4. Five years after Project Rinse, the sponsor's rollout has run on debt and sale-leasebacks, the downside case from Chapter 4 has come true, and Clearcoat can't cover its rent and interest. A seventh chapter, sold separately: the debt stack and the sale-leaseback obligations; the 13-week cash flow; the liability management menu (amend-and-extend, uptier, drop-down); the recovery waterfall in a Chapter 11; the plan. The base case in Chapters 5 and 6 is built so this is possible: the LBO the learner builds carries the debt that later breaks. Not in the launch scope; recorded so nothing in the model design rules it out.

### 4.10 Parked add-ons: the finance left out on purpose (later)

Wolf, 2026-09-30, after the source pass; confirmed 2026-10-01: these are parked as internal add-ons, shown nowhere on the site or the platform, and module 6.1 (trading comps) stays, since comps is the valuation most learners outside banking meet. The paid courses spend most of their hours on valuation and deal modeling, and most of that is too finance-heavy for a course whose job is Excel on a real sheet. Chapters 5 and 6 stay as deep as the case needs and no deeper. What was left out is recorded here as add-on curriculum, to be sold the way 4.9 is (M58's per-chapter entitlements already allow it), so a later session doesn't have to find it again. Nothing here is scheduled, and nothing in the model design rules any of it out. The source rows are in claude/source-checklist.md: section G lists what was parked, section B's held list carries the items by id, and claude/script-drills.md lists the drills parked with each.

| Add-on | What it would teach, on Clearcoat | Builds on | Where the source rows are |
| :- | :- | :- | :- |
| **Merger math** | A strategic buyer in place of a sponsor: cash against stock, the exchange ratio, what the deal does to the buyer's earnings per share, the synergies needed to break even, purchase accounting and goodwill, the combined balance sheet. Out since Round 2 (buyers are private equity only). | 5.4, 6.3.1 | Section G: the M&A Modeling lessons |
| **Public comps in depth** | What a listed company adds to a comp: diluted share counts (options, convertibles), earnings per share and P/E, what leverage does to an equity multiple, EV/EBIT and capital intensity, preferred stock and minority interests in enterprise value, forward multiples from estimates, premiums on one-day and one-month unaffected prices, deal status on precedents. Module 6.1 keeps six fictional operators on enterprise-value multiples and needs none of it. | 6.1, 6.2 | Section G: the rows tagged public-co-only. Held: G169, G170, G171, G172, G174, G176, G178, G182, G188, G189, G190. Drill ideas D19, D20, D30 |
| **Valuation depth** | A beta built from peers (unlevered, then re-levered), why WACC sits at a target structure, growth as reinvestment times return, the market value of debt, enterprise value read off the balance sheet. | 5.6 | Held: G121, G126, G129, G135, G165. Drill idea D36. The stub period is already a stretch drill |
| **Diligence: quality of earnings** | Restating EBITDA the way a buyer's diligence team does: one-time items, owner costs, run-rate adjustments, the working-capital peg. 3.3.6 carries one aside that points at it. | 3.3.6, Chapter 4's diligence pack | Section G: the 28 rows tagged diligence |
| **Debt and restructuring** | The DLC of 4.9: debt terms, covenants and recaps, the leaseback as a lease liability, the 13-week cash flow, the recovery waterfall. | 5.3.5, 6.3 | Section G: the 39 rows tagged DLC. Held: G108, G109, G138, G148, G149, G153. Drill idea D16 |
| **Accounting depth** | What 5.1 says once and doesn't build: inventory, disposals and gains, deferred tax, leases on the balance sheet, debits and credits. Three stretch drills already practice inventory, a disposal and finding EBITDA. | 5.1 | Held: G093, G096, G098, G099, G101, G104, G105 |

## 5. The curriculum DRAFT

Six chapters, about twenty hours guided (Wolf, Round 4: nearer twenty, and robust enough to compete with the paid courses as lessons; WSP's Excel course is 8.6 hours of video and its modeling package 46 more). Chapter 1 is free in full. One job per lesson, 5–8 goals, about six minutes; every module ends with a timed challenge on a fresh seeded file; every chapter ends with a project (build the page end to end, no clock) and an assessment (the same page on fresh figures, hard clock, no help, keyboard only), and the assessment is also the test-out. Chapter 1's 29 lessons are built and get re-skinned to the car wash: the workbook keeps its shape (a daily site feed, an inputs sheet, a costs sheet, a report page) and its site names (Domain, Mueller, Riverside, South Lamar, Airport, then Cedar Park); kWh becomes washes, price per kWh becomes average ticket, energy cost becomes cost per wash. Every goal keeps its task.

### The curriculum in one view

Wolf, 2026-09-27: develop the full curriculum within his guidance (the platform, the case, the objectives, the lesson ideas) and shell Chapters 2–6 so everything fits and is bucketed before he reads any of it; then a 20–30 point feedback pass, then code, then play, then more feedback. This is that view; the shells are claude/script-ch2.md to script-ch6.md.

**The platform, in one sentence.** A real sheet and Ribbon in the browser, where you learn Excel by doing one job at a time on one company's file, are graded on how the sheet ends up, and then get fast at it through drills, the Daily, rapid-fire and quests.

**The case, in one arc.** Clearcoat Express, forty express car washes in Texas, is being sold to private equity, and you work on its finance team. Chapter 1 gets the company's own weekly numbers clean enough to stand behind (the CFO). Chapter 2 turns three years of P&L into the financials section of the book that describes the company to buyers. Chapter 3 proves the numbers site by site against the point-of-sale export (the buyers' first-round diligence). Chapter 4 answers the buyers' questions from the data room and builds the management case with its sensitivities. Chapter 5 builds the operating model and values the cash flows. Chapter 6 values the company every way, prices the three bids, and puts one page in front of the board, with your own options on the last line. Six stages, six pages in the data room, one file that grows.

**What a learner can do at the end, by chapter.** After 1: move, select, enter, format, link and check a page by keyboard, and read a workbook's colors. After 2: take any raw financial export to presentation quality and print it as a pack. After 3: build a databook from row-level data with logic, dates, conditional sums and text functions, value a loan and a project, and audit someone else's sheet. After 4: read any dataset with lookups, lists and pivots, and run cases and sensitivities on a model. After 5: build and audit a three-statement model with schedules, and value it with a DCF. After 6: spread comps and precedents, rebuild a sponsor's LBO, price bids with structure, run a waterfall, and put a valuation on one page.

**Three rules that keep 174 lessons from repeating themselves.**

1.  **A skill is taught once.** It has one lesson, in one chapter, where it's explained. Every later use names that lesson in brackets and doesn't re-teach it. The ledger is "The skills, bucketed" below; a shell that teaches something twice is a fault.
2.  **A skill comes back on purpose.** Reinforcement is planned, not accidental: the fill patterns from Chapter 1 return as model speed in Chapter 5; SUMIFS from Chapter 3 returns as the cube in Chapter 4; the checks row from Chapter 1 grows into the checks sheet in Chapter 5. The "comes back in" column is the plan.
3.  **Finance arrives when the Excel can carry it.** Each chapter adds one rung of the arithmetic ladder (section 4.6), and each term is defined in the sentence it first appears, through a wash, a member, a tunnel or a site; the chapter shells list where every term lands.

**How the review runs.** Wolf reads the shells whole (section 5 first, then Chapters 2 to 6) and gives general feedback in one pass (20–30 points: what's missing, what's redundant, what's in the wrong chapter, what he'd teach differently, where the story lags). Claude applies it across every shell at once, writes the lessons to goal level with teach lines and stuck cues, and the build sessions code from the scripts. Then Wolf plays through, and the next feedback pass comes from the built product, where tone and pacing show. Lines get locked in chat as before; nothing here needs a line-by-line markup.

### The six products

Wolf, 2026-09-27: lay the broader plan out before shelling Chapter 2, so every chapter's product is known and the work goes into bucketing what to teach and refining small lessons. One row per chapter: what the learner walks away with, the workbook it's built on, the finance rung, the Excel buckets, and the size.

| Chapter | The product (what goes in the data room) | Workbook | Finance rung (taught through the car wash) | Excel buckets | Lessons · challenges · hours |
| :- | :- | :- | :- | :- | :- |
| 1 Foundations (free) | The weekly KPI report: one page, live, formatted, checked, print-ready | Raw · Inputs · Costs · Report | washes × ticket − cost per wash; totals; a checks row | the screen · move · select · enter and edit · copy and fill · structure · basic formats · formulas by pointing · anchors · links · errors · print · audit | 30 · 7 · 3.5 |
| 2 Formatting | The historical financials section of the book: a three-year P&L, its monthly block and a one-page summary, presentation quality | P&L · Inputs · Monthly · Print | revenue lines, cost of a wash, site costs, contribution, head office, EBITDA; margins and growth; actual vs estimate; fiscal years | number formats · custom formats · the page's anatomy · alignment and outline · conditional formatting · text and dates for presentation · print | 30 · 7 · 3 |
| 3 Formulas | The KPI databook: every number reconciled to the point-of-sale export | Sites · Packages · Members · Transactions · Summary · Loans | one row per wash; package prices; member tenure; the reconciliation; the site-build loan; NPV and IRR of a site | logic · dates · math and aggregation · text · time value of money · auditing | 27 · 6 · 3 |
| 4 Data and Lookups | The diligence pack: the buyers' questions answered, the utilization dashboard, the management case with sensitivities | Export · Lists · Q&A · Summary · Scenarios · Dashboard | utilization (washes per hour against tunnel capacity), member share, break-even, three cases | lookups (incl. multi-criteria) · lists and tables (incl. filter tricks) · summaries from raw rows and 3D references · pivots · scenarios and sensitivity (incl. the sticky IF) · names and structure | 32 (31 without dynamic arrays) · 6 · 4 |
| 5 Finance and Accounting | The operating model: three statements, schedules, checks, and the DCF page | Cover · Inputs · IS · CF · BS · Schedules · Checks · DCF | the statements through one site; accrual vs cash; the revenue build; capex and depreciation; working capital; debt; free cash flow, WACC, terminal value | the three statements and the five links between them · model setup, incl. the drivers block and populating from a data tab · schedules · linking · auditing a model, with the checks catalog · DCF · model speed | 37 · 7 · 5 |
| 6 Valuation | The valuation summary for the board: comps, precedents, the sponsor's LBO, the waterfall, one page | Comps · Precedents · LBO · Bids · Summary | EV/EBITDA and EV per site; IRR and MOIC; from enterprise value to the owners' proceeds, down to the learner's options | trading comps · precedents · LBO · the bids and the waterfall | 18 · 4 · 3 |
| | | | | **Total** | **174 · 37 · 21.5** |

### The skills, bucketed

Every Excel skill the course teaches, in the bucket it belongs to, with the chapter that teaches it first, where it comes back, and which paid course covers it (section 12), so the syllabus can be checked for gaps before the scripts are written.

| Bucket | Skills | First taught | Comes back in | The paid courses |
| :- | :- | :- | :- | :- |
| The screen | Name Box, formula bar (Ctrl+Shift+U), Ribbon (Alt, Ctrl+F1), status bar, zoom, sheet tabs | 1.1 | every chapter | WSP, BIWS, FE (setup first) |
| Setup | Automatic calculation, F9, iteration, Enter stays, the QAT | 1.1 | 4.5 circularity, 5.2 model setup | all of them |
| Move | Ctrl+Arrow, Ctrl+Home/End, PgUp/PgDn, Go To, Ctrl+PgDn with the browser alias | 1.1–1.2 | everywhere | TTS, WSO |
| Select | Shift+Arrow, Ctrl+Shift+Arrow, Shift+Space, Ctrl+Space, Ctrl+A, Ctrl+Shift+End, Go To Special | 1.1–1.2 | 1.7, 3.6, 5.5 audits | TTS (Shift+F8 add mode is an alternative, not taught first) |
| Enter and edit | Enter/Tab runs, Ctrl+Enter, Esc, AutoComplete, Alt+Enter, F2 and edit mode, the second F2 that switches Edit to Point, Delete against Clear All and Clear Formats, Undo/Redo, Find, F4 repeat, a negative typed as (500) | 1.3, 1.6.1, 2.1.2 | everywhere | TTS (Ctrl+Enter) |
| Copy and fill | Copy, cut, paste, Ctrl+D/R, Paste Special (values, formats, formulas, transpose, multiply, divide, on typed cells only), Fill Series, Replace All | 1.3 | 2.1 sign flip, 5.2 fill patterns | BIWS, WSP |
| Names and notes | Define Name, Go To by name, Name Manager, Shift+F2 notes, Ctrl+;, Ctrl+Backspace | 1.3 | 4.6 | CFI (naming cells) |
| Structure | Insert/delete rows and columns, widths, heights, AutoFit, wrap, hide vs group, outline levels, freeze panes | 1.2, 1.4 | 2.4, 2.5 | WSP, CFI |
| Number formats | Ctrl+1 categories, the desk number format (Number, no decimals, the separator, (1,234): the code #,##0_);(#,##0)), the Number, Currency and Percent chords, decimals, dates on a timeline | 1.5, 2.1 | every page after | all of them |
| Custom formats | The four-section code, the 0 and # placeholders and the _) spacer, units in the format (k, m, x, bps), custom date codes, conditions, hidden zeros, a 1/0 switch shown as a word | 2.2 | 5.2, 6.4 | WSP, BIWS (formatting cycles) |
| Fonts, borders, fills | Bold, size, the top border on totals, double bottom, the input tint, no grids | 1.5, 2.3 | every page after | TTS (H, B, O) |
| Alignment | Center Across Selection, right-align headers, indent, italic notes, wrap | 1.5, 2.4 | 5.2 | TTS, WSP |
| The page's anatomy | Title, units, timeline, sections, the answer, A/E divider, labels, footnotes, sources, widths, Format Painter, cell styles | 2.3 | 4.3, 5.2, 6.4 | TTS Best Practices, consulting courses |
| Conditional formatting | Highlight rules, formula-driven rules, bars and scales (and when not), Manage Rules | 2.5 | 5.5 checks | WSP, CFI |
| Text | TEXT, &, TRIM, PROPER, SUBSTITUTE, LEN/LEFT/RIGHT/MID, FIND/SEARCH, VALUE, Text to Columns, Flash Fill | 2.6, 3.4 | 4.2 | WSP, consulting courses |
| Dates | Serial numbers, DATE/YEAR/MONTH/DAY, EOMONTH/EDATE, YEARFRAC, NETWORKDAYS/WEEKDAY, MOD period flags | 2.6, 3.2 | 5.3 timelines | WSP (fiscal-half puzzle) |
| Logic | IF, IFS, AND/OR/NOT, MIN/MAX instead of nested IF, IFERROR, ISNUMBER/ISBLANK | 1.7 (one check), 3.1 | 4.5, 5.3 | WSP (ISNUMBER overrides) |
| Aggregation | SUM family, AutoSum, COUNTIF(S), SUMIF(S), AVERAGEIF(S), MAXIFS/MINIFS, LARGE/SMALL/RANK, SUMPRODUCT, ROUND family, running totals (SUM($C5:C5)), CAGR and RRI, 3D references across identical tabs, bounded ranges over whole columns | 1.6, 2.1.3, 3.3, 3.5.4, 4.3.6 | 4.3 cubes, 5.2 checks | WSP, WSO |
| Formulas and anchors | Pointing, + as well as = to start a formula, relative and absolute references, F4, links across sheets, one formula per row, Ctrl+` | 1.6 | everywhere | TTS, WSP |
| Time value of money | PV, FV, PMT, PPMT/IPMT, NPV/XNPV, IRR/XIRR, a payment schedule | 3.5 | 5.6, 6.3 | WSP, CFI |
| Auditing | Ctrl+[ and ], trace arrows, Evaluate Formula, F9 on a part, show formulas, Go To Special, error checking, Watch Window, Edit Links, the checks catalog with ROUND | 1.6, 1.7, 3.6 | 5.2, 5.5; the checks thread below | WSP, BIWS |
| Lookups | VLOOKUP/HLOOKUP, MATCH, INDEX/MATCH one- and two-way, XLOOKUP, approximate match on bands, IFNA, multi-criteria lookups (key column, SUMIFS as a lookup, the array MATCH), CHOOSE, OFFSET/INDIRECT and why not | 4.1 | 5.2 populate, 5.3, 6.1 | WSP (both ways), BIWS |
| Lists and tables | Sort, multi-level sort, AutoFilter, SUBTOTAL, Remove Duplicates, Data Validation drop-downs, visible cells only (Alt+;), wildcards, skip blanks | 4.2 | 6.1 | WSP, WSO |
| Pivots | Build, rearrange, group dates, value settings, refresh, GETPIVOTDATA | 4.4 | – | WSP, WSO, consulting courses |
| Scenarios and sensitivity | Case toggles (CHOOSE/INDEX) with the active-case highlight and the case name in the title, one- and two-way data tables with typed edges, Goal Seek, the pass-through driver, a data table on the case switch (cases side by side), the sticky IF (the self-referencing IF proper), the drivers block (three cases by year, one live block), circularity with a breaker | 4.5, 5.2.6 | 5.3, 5.6, 6.3 | WSP (self-referencing IF, OFFSET selectors), BIWS |
| Model architecture | Inputs/calcs/outputs, sheet order, timeline and units, the same year in the same column on every sheet, A/E divider, checks sheet, the drivers block, the statements populated from a data tab by INDEX/MATCH, navigation column, hyperlinks | 2.4, 4.6, 5.2 | 5.4, 6.4 | CFA module, TTS |
| The three statements | Income statement, cash flow, balance sheet, accrual vs cash, the five links between them (5.1.5), the cash sweep, why it doesn't balance | 5.1, 5.4 | 6.3 | WSP Premium, Adventis, CFA |
| Schedules | Revenue build, cost build, working capital days, PP&E and depreciation, debt and interest, tax | 5.3 | 6.3 | WSP Premium, CFA |
| DCF | Unlevered FCF, WACC, terminal value, mid-year discounting, sensitivity tables | 5.6 | 6.4 | WSP Premium, BIWS |
| Comps and precedents | EV build, calendarization, LTM, median and range, operating multiples, deal premiums | 6.1–6.2 | – | WSP Premium, Adventis |
| LBO | Sources and uses, tranches, cash sweep, sale-leasebacks, IRR/MOIC, returns bridge, entry/exit sensitivity | 6.3 | the restructuring DLC (4.9) | WSP Premium, BIWS |
| The waterfall and the summary | EV to proceeds, the option pool, the football-field table, the board page | 6.4 | – | WSP Premium (M&A), Adventis |
| Print | Orientation, fit to one, print titles, headers and footers, print areas, page breaks, a print pack | 1.7, 2.7 | 5.2, 6.4 | BIWS, CFI |

**Coverage against the paid courses.** Everything in the WSP Excel Crash Course spine is here except LAMBDA and macros (out on purpose: the engine has no VBA and a bootcamp analyst never writes a macro in year one) and charts (out at launch: the football field is a table, and no chapter's product needs a chart; revisit if a buyer of group access asks). The modeling courses' spine (three statements → DCF → comps → precedents → LBO) is Chapters 5 and 6; merger math is out (Wolf, Round 2: the buyers are private equity). Two additions worth a decision: dynamic arrays (UNIQUE, FILTER, SORT, SEQUENCE), which modern Excel has and the bootcamps are starting to teach, and which would sit as one lesson at the end of 4.2 once the classic tools are known (9.1, question 12); and Shift+F8 add mode as an accepted alternative in 1.2.2, not a lesson.

### The checks thread

Wolf, 2026-09-28: best practices for adding checks should run through the course, and hardest in the model phase. This is the thread: where each check pattern is taught, and the catalog a model carries by Chapter 5. The rule for every page in every chapter: it ends with a check, the check is a live difference that reads zero, and a challenge grades that the check is a formula, never a typed 0.

| Where | What's taught | The check |
| :- | :- | :- |
| 1.7.2 The checks row | A check is a live difference between two things that must agree; three of them make a checks row; Ctrl+[ shows what a check compares | Report revenue ties to the feed · sites sum to the total · margin within 0–100% |
| 2.2.4 Conditional codes | A number format that paints a non-zero check red | 0_);[Red](0);"–"_) on the checks row |
| 2.5.2 Formula-driven rules | A conditional format that turns a failing check red, and a row rule from a flag | =C40<>0 |
| 3.3.6 The reconciliation | Two counts of the same thing from two sources, the difference explained line by line, adjustments typed and blue, the check at zero | Adjusted managers' washes less POS washes |
| 3.6.4 The checks block | Six checks and a roll-up: COUNTIF of non-zeros, SUMPRODUCT(ABS()) so two errors can't net to zero, an OK / CHECK flag on the top row | The databook's six ties |
| 4.3.4 The KPI page | The cube ties to the export; the ratios tie to their parts; the flag on the page | Cube total to export SUM |
| 5.2.4 The checks sheet | Built empty before the model, one row per check, the roll-up flag on the Cover, every check wrapped in ROUND(…,2) | The model catalog below |
| 5.4.3 Cash is not a plug | The balance sheet balances by construction; the check proves every upstream link | Assets less liabilities and equity |
| 5.4.5 The order to check | Seven reasons a balance sheet is off, in the order a reviewer looks; the size of the difference names the line | – |
| 5.5.1 Tie-outs and cross-foots | A figure in two places is one figure; a block adds both ways | IS revenue to the build · EBITDA to Chapter 2 · PP&E · debt · equity roll · the cost build cross-foot |
| 5.5.2 Error flags | ISERROR counts per sheet folded into the flag; Error Checking and the Watch Window | Errors on every sheet = 0 |
| 5.5.3 The sweep | Hardcode counts and Row Differences on every projected block | Hardcodes in projected blocks = 0 |
| 6.3.1 Sources and uses | The one honest plug (sponsor equity) and the check that sources equal uses | Sources less uses |
| 6.3.5 The returns bridge | Three effects and the entry fees sum to the gain | Bridge less equity gain |
| 6.4.4 The board page | Every range and bid a link; the page's own checks block; the Cover flag on the page | Football field links to their sheets |
| 3.3.2 COUNTIF and COUNTIFS | Bands that share an edge take >= on one side, and the bands must add up to the whole | The three amount bands less COUNT of the column |
| 5.2.2 The period counter | A counter that counts columns carries no typed offset, so an inserted column can't shift it | COLUMNS($C4:C4) less the period counter |
| 5.1.6 Cash counted directly | The week's cash in and out, counted by hand beside the indirect statement: a second answer for it to agree with | Direct cash count less the CF's net change |
| 5.3.4 Capex to depreciation | A memo ratio under the roll-forward: well above 1 through the rollout, toward 1 after it | – |
| 5.3.5 The effective rate | Interest ÷ average balance under each tranche, read against the typed rate | Effective rate less the rate on Inputs, projected years |
| 5.5.1 Limit checks | A tie-out can't see a balance that has gone through zero; a count of negative closing balances can | Debt and revolver balances below zero = 0 · PP&E below zero = 0 |
| 5.5.3 The circle hunt | With iteration on, Excel stops warning about circles: breaker to 0, iteration off, F9, then both back; F2 a SUM among blank rows | No circular-reference warning with the breaker off |
| 5.6.4 The round trip | The perpetuity value's implied multiple, fed through the exit method, returns the growth input | Implied growth less the growth input |
| 5.6.5 The DCF read back | The terminal value as a share of EV; EV over FY26E and FY27 EBITDA, the forward multiple the lower | Terminal share plus forecast share = 100% |
| 6.3.4 Same terms, same return | The owners' rolled stake and the sponsor's equity earn the deal's IRR | Owners' IRR less the sponsor's |
| 5.3.3 The cash conversion cycle | Receivable days less payable days less deferred-revenue days, as a memo row; negative for Clearcoat, because suppliers and members fund it | – |
| 5.3.4 The implied life | Gross depreciable PP&E ÷ the year's depreciation on the FY26 actuals, read against the life on Inputs | – |
| 6.3.4 The lender's return | The loan out, interest and repayments in, the balance back at exit: its IRR sits near the rate | Lender's IRR read against the 8% on Inputs |

**The model's check catalog** (5.2.4; every operating model carries these, in this order): the balance sheet balances · BS cash equals CF closing cash · debt schedule closing equals BS debt · PP&E closing equals BS PP&E · IS revenue ties to the revenue build · the cost build cross-foots · equity rolls (opening plus net income less distributions equals closing) · FY26 EBITDA ties to the Chapter 2 P&L · sources equal uses (the ninth, live from 6.3.1) · no debt or PP&E closing balance below zero (the limit checks, 5.5.1) · errors per sheet equal zero · hardcodes in projected blocks equal zero · the circularity breaker is on and the model has settled (interest this pass equals interest last pass). Conventions: a live difference, ROUND(…,2), the desk number format, red when non-zero, a SUMPRODUCT(ABS()) roll-up, one OK / CHECK flag on the Cover and on every output page.

### The tips and tricks, placed

Wolf, 2026-09-28: an in-person WSP-style course is full of tips and tricks, and Data and Lookups was thinner than the hotkey chapters. Every tip below is placed in a lesson; the ones marked *new* were added in this pass (four lessons in Chapter 4, two in Chapter 5, and asides to write at goal level where the lesson already exists). Ctrl+G is now one goal (1.2.1) and the jump-by-name in 1.3.5; it appears nowhere else as a taught key.

| Tip | Lands in |
| :- | :- |
| Ctrl+Arrow stops at a gap: find a missing figure without reading | 1.2.1 |
| Ctrl+End lands past the data when stale rows were used: delete them and save before sending | 1.7.1 aside, *new* |
| Ctrl+Backspace snaps the view back to the active cell | 1.3.5 |
| F5 then Enter returns after Ctrl+[ | 1.6.6 |
| Ctrl+' copies the formula from the cell above without shifting references; Ctrl+Shift+" copies its value | 1.3.3 aside, *new* |
| Ctrl+Shift++ after Ctrl+C inserts the copied cells instead of overwriting | 1.4.1 aside, *new* |
| Enter stays on the cell; Tab runs a row; Ctrl+Enter fills a selection | 1.3.1 |
| The F2 / Esc flick to read a column | 1.3.2 |
| Ctrl+; for today's date, never TODAY(), which moves every day and recalculates every change | 1.3.5, 3.2.1 aside, *new* |
| F4 repeats an action; F4 cycles anchors | 1.2.3, 1.6.3 |
| Paste Special: values, formats, transpose, multiply and divide, skip blanks, column widths, paste link | 1.3.4; 4.2.5; 2.3.5 aside and 2.7.3 aside, *new* |
| AutoFit on a selection, never the whole column with the title in it | 1.4.2 |
| Group, don't hide; Ctrl+8 shows the outline symbols | 1.4.3, 2.4.2 |
| Ctrl+1 opens on its row of tabs: a letter picks the tab, then Tab and a letter pick the category; Number with (1,234) is the desk number format, and Ctrl+Shift+1 shows a minus, so it's kept for counts | 1.5.1 |
| Center Across Selection, never merge, with the proof (Ctrl+Shift+→ still sweeps) | 1.5.3 |
| Top border on a total survives inserted rows; double bottom on the final answer; no grids | 1.5.2, 2.3.3 |
| Custom codes carry the unit: k, m, x; "FY"yy on a date; [Red]; ;;; hides | 2.2 |
| Format Painter and Cell Styles at scale | 2.3.6 |
| Conditional formatting formula rules with anchored columns; Stop If True | 2.5.2, 2.5.4 |
| EOMONTH timelines from one date; TEXT headers; & titles from Inputs | 2.6 |
| Grouped sheets share a footer | 2.7.1 |
| Point, don't type; Ctrl+Arrow while pointing | 1.6.1 |
| Alt+= on the block plus its edge | 1.6.2 |
| Ctrl+Shift+A after a function name inserts its argument names; Ctrl+A opens the arguments box | 3.1.1 aside, *new* |
| MIN and MAX before a nested IF | 3.1.2 |
| IFERROR only where an error is expected; IFNA for a lookup miss | 3.1.4; 4.1.6 aside, *new* |
| ROUND removes decimals, a format only hides them; ROUND(…,2) on every check | 3.3.1, 5.2.4 |
| Wildcards * and ? in COUNTIF, SUMIFS and MATCH | 4.2.5, *new* |
| ">="&cell for a date criterion: the operator in quotes, the cell outside | 4.3.3 |
| SUMPRODUCT as the array engine; -- coerces TRUE to 1 | 3.3.5, 5.5.2 |
| F9 on a selected part of a formula, then Esc | 3.6.2 |
| Trace arrows across sheets; Evaluate Formula step by step | 3.6.1 |
| Edit Links finds and breaks external links | 3.6.3 |
| Text to Columns and Flash Fill write values: one-time cleans only | 3.4.4 |
| INDEX/MATCH over VLOOKUP; INDEX(range,0,n) over OFFSET; XLOOKUP where versions allow | 4.1.3, 4.1.8, 4.1.5 |
| Approximate match on a sorted band table replaces the IFS ladder | 4.1.6 |
| Multi-criteria lookups: a key column, SUMIFS as a lookup, the two-condition array MATCH | 4.1.7, *new* |
| Alt+; visible cells only before copying a block with hidden or grouped rows; a filter copies only what shows, and a block pasted onto a filtered list lands in its hidden rows | 4.2.5, *new* |
| SUBTOTAL(109) and (103) respect the filter; SUM doesn't | 4.2.2 |
| Data Validation lists driven by a named range | 4.2.4, 4.6.3 |
| 3D references sum a run of identical tabs; Ctrl+Shift+PgDn groups them for one entry; bookend tabs | 4.3.6, *new* |
| Pivots for cuts, SUMIFS for models; Alt+F5 refresh; GETPIVOTDATA on and off | 4.4 |
| CHOOSE or INDEX on a numeric switch; the picker reads a named list | 4.5.1, 4.6.3 |
| A one-way data table on the case switch shows every case side by side | 4.5.6, *new* |
| The sticky IF (the formula other people call the self-referencing IF) holds an output under iteration; label it, because it's a hardcode that looks like a formula | 4.5.6, *new* |
| The pass-through driver, =IF(B40="",Inputs!B6,B40), lets a data table reach an input on another sheet | 4.5.5 |
| Automatic except data tables, then F9; Ctrl+Alt+F9 recalculates everything | 4.5.3 |
| Goal Seek overwrites the input; a data table doesn't | 4.5.4 |
| Name the toggles and key inputs only; F3 pastes the list on the Cover | 4.6.1, 4.6.2 |
| A projection flag and a period counter let one row hold history and forecast | 5.2.2 |
| Populate a statement from a data tab by INDEX/MATCH on label and year; SUMIFS when labels repeat | 5.2.5, *new* |
| The corkscrew: opening, additions, subtractions, closing | 5.3.1 |
| The average-balance circle with a breaker on Inputs; Alt F T iteration | 5.3.5 |
| MIN and MAX for the cash sweep and the revolver, never an IF tower | 5.4.4 |
| Alt W N and Alt W A: a second window of the same file, side by side | 5.4.1 aside, *new* |
| The order to check when it doesn't balance; the size of the difference names the line | 5.4.5 |
| Go To Special Row Differences finds the formula that broke pattern | 5.5.3 |
| The Watch Window keeps the balance check on screen from any sheet | 5.5.2, *new* |
| Stress tests: zero, negative, huge | 5.5.4 |
| Tax on EBIT, never the IS tax, in an unlevered DCF | 5.6.2 |
| Two terminal values, each checking the other | 5.6.4 |
| Include flags with reasons, never deleted rows; the median over the mean | 6.1.3 |
| Sponsor equity is the one honest plug | 6.3.1 |
| The returns bridge must sum to the gain | 6.3.5 |
| Version the file name (v03, never "final"); Ctrl+Home on every sheet at 100% before saving | 1.7.1, section 4.8 |
| + starts a formula as well as = (=+D5−E5); the keypad habit | 1.6.1 done screen, *new* (M63) |
| A negative typed as (500) is read as a minus | 2.1.2, *new* |
| CAGR as (end/start)^(1/n)−1, or RRI | 2.1.3, *new* |
| MOD(month,3)=0 flags a quarter end: the remainder trick for periodicity | 3.2.3, *new* |
| Running totals: SUM($D$40:D40), the start anchored and the end moving | 3.5.4, *new* |
| Bounded, anchored ranges over whole-column references in SUMIFS | 4.3.1, *new* |
| The active case shaded by a formula rule that reads the picker; the case name in the title | 4.5.1, *new* |
| OFFSET off the switch is the old selector habit; CHOOSE or INDEX, because OFFSET is volatile and blind to trace arrows | 4.5.1, 5.2.6, *new* |
| The drivers block: three cases by year, one selector, one live block through the projection flag; scenarios move several drivers, sensitivities one | 5.2.6, *new* |
| COLUMNS($C4:C4) as a period counter with no typed offset: it still counts from 1 after a column is inserted, where COLUMN()−n reads one high | 5.2.2, *new* |
| The same year in the same column on every sheet | 5.2.2, *new* |
| Shift+F8 add mode and Alt W S split panes | Reference page alternatives only |
| The desk number format: Ctrl+1, Number, no decimals, the separator, (1,234), repeated with F4 or Paste Formats; where the choice isn't listed, the code #,##0_);(#,##0) typed | 1.5.1, *new* |
| Two more settings on a new install: skip the Start screen, switch the animation off | 1.1.4 done screen, *new* |
| Right-click the status bar to add Minimum and Maximum beside Sum, Average and Count | 1.1.2 aside, *new* |
| Delete leaves the format and the note behind; Clear All (Alt, H, E, A) and Clear Formats (Alt, H, E, F) take them | 1.3.1 aside; 1.7.1, *new* |
| Paste Special Formulas carries a formula without its borders, fills or number format | 1.3.4 aside; 1.6.1, *new* |
| Paste arithmetic rewrites formulas too: select typed cells only, or a total is flipped or scaled twice | 1.3.4 aside; 2.1.2, *new* |
| A transposed formula has its relative references turned as well: paste values or anchor first | 1.3.4 aside, *new* |
| A second F2 switches an open cell from Edit to Point, so the arrows pick cells when a term is added to an existing formula | 1.6.1; 1.6.6, 2.1.2, *new* |
| A formula that shows as text has lost its =, or has a space or an apostrophe in front of it | 1.6.1 aside, *new* |
| Cut and paste moves a formula with its references intact; a copy shifts them | 1.6.3 done screen, *new* |
| Link every use of an input straight to its source, never to a link; the one accepted chain is a flat assumption carried as =prior year | 1.6.4 aside, *new* |
| #NUM!: a result Excel can't hold, or a rate it can't find | 1.6.6; 3.5.3, *new* |
| A file with pay or deal figures that leaves by email gets a password: Alt, F, I, Protect Workbook, Encrypt with Password | 1.7.1 done screen, *new* |
| Go To Special, Notes before a file leaves: keep the sources, clear the rest with Alt, H, E, M | 1.7.3 done screen, *new* |
| The _) spacer lines positives up with negatives in parentheses; 0 always prints a digit, # only when there is one | 2.2.1, *new* |
| The code "On";;"Off" shows a 1/0 switch as a word and keeps it a number | 2.2.4 aside, *new* |
| A formula rule runs in every cell as if filled from the top-left one: prove it with =TRUE before the anchored test | 2.5.2 aside, *new* |
| Center on page, and a header margin smaller than the top margin | 2.7.1, *new* |
| NM or a dash, not 0, as the IFERROR fallback on a ratio that feeds nothing | 3.1.4 aside; 6.1.1, *new* |
| A bare cell as the IF test (blank or 0 is false): read it, write ISNUMBER; ISTEXT for a placeholder in a number column | 3.1.4 aside, *new* |
| The stub: an annual figure × YEARFRAC(start, period end) for a part year | 3.2.4 aside, *new* |
| FIND and SEARCH take a start position: the second space is FIND(" ",x,FIND(" ",x)+1) | 3.4.2, *new* |
| SUBSTITUTE's fourth argument changes only the nth match; REPLACE swaps by position | 3.4.2 aside, *new* |
| Text to Columns' last step sets each column's type: Text for codes and IDs, or the leading zeros go | 3.4.4 aside, *new* |
| The type argument of PMT, PV and FV: 1 for payments at the start of the period | 3.5.1 aside, *new* |
| IRR returns #NUM! when the flows share a sign or the search fails; the guess argument reseeds it | 3.5.3 aside, *new* |
| A leading apostrophe parks a half-built formula as text | 3.6.2 done screen, *new* |
| A stray external link is born by pointing into another open file (Ctrl+Tab) with a formula open | 3.6.3 aside, *new* |
| Before deleting a tab, Find All its name across the workbook's formulas and repoint what reads it | 3.6.3 aside; 1.1.1, *new* |
| VLOOKUP with MATCH in the column slot: read it, write INDEX/MATCH | 4.1.3 aside, *new* |
| XMATCH is MATCH with exact match as the default | 4.1.5 aside, *new* |
| Number Filters and Date Filters screen a column by rule | 4.2.2 aside, *new* |
| Remove Duplicates: the ticked columns define the duplicate | 4.2.3 aside, *new* |
| 3D-sum the input lines only; subtotals and ratios are formulas on the roll-up's own rows | 4.3.6 aside, *new* |
| Grouped sheets: read Group in the title bar before typing, ungroup on a sheet outside the group, confirm the tag is gone | 4.3.6; 2.7.1, *new* |
| Distinct Count needs the Data Model; otherwise count against a Remove Duplicates list | 4.4.2 aside, *new* |
| A data table's edge values are typed, never linked to the input the table drives | 4.5.2; 4.5.3, 5.6.6, *new* |
| A data table that reads the same in every cell isn't reaching its input: label it and grey it with a formula rule on the switch | 4.5.5 aside; 5.6.6, *new* |
| A sticky cell edited while its case is off resets to 0; refill by cycling the switch, and label the block do-not-touch | 4.5.6 aside, *new* |
| Copying a sheet that holds names makes sheet-scoped duplicates: read the Scope column before deleting | 4.6.2 aside, *new* |
| Ctrl+N, O, S and P; Ctrl+Shift+_ and Ctrl+Shift+3; Top/Bottom rules (Alt, H, L, T); Subtotal (Alt, A, B); INDIRECT with R1C1 text or ADDRESS; XLOOKUP returning a whole record | Reference page rows only, *new* |
| Washes in thousands from one labeled 1,000 on Inputs, never a /1000 inside a formula; read the implied revenue per wash against the P&L | 5.3.1, *new* |
| No typed zeros on the cash flow: an empty line still gets its link; test the wiring with a trial number, then Ctrl+Z | 5.4.2, *new* |
| The tick-off: mark each balance-sheet change against its cash flow line, cash last; the unmarked line is the break, and the one way to find a double count | 5.4.5, *new* |
| A deliberate break in a row gets a border and its reason in the next cell, so Row Differences finds a known exception | 5.5.3, *new* |
| Count hardcodes directly, SUMPRODUCT(ISNUMBER(range)*(1−ISFORMULA(range))); a number count less a formula count can net to zero | 5.5.3, *new* |
| The matching rules: unlevered cash flow with WACC for enterprise value; EV over a line before interest; a multiple and its figure on the same period | 5.6.2, 6.1.1, 6.1.5, *new* |
| A perpetuity runs on a normalized year, never a rollout year; growth stays under the economy's and under WACC | 5.6.4, *new* |
| Calendarization weights from the fiscal year-end cell, MONTH(year-end)/12 and one minus it, never typed fractions | 6.1.2, *new* |
| LTM two ways: four quarters, or the last fiscal year + the year-to-date − the prior year-to-date; the two tie | 6.1.2, *new* |
| Statistics on a flagged set read a helper column, =IF(include=1, multiple, ""); multiple × flag feeds zeros to MEDIAN | 6.1.3, 6.1.4, *new* |
| Mandatory amortization is a percent of the original loan, inside MIN against the opening balance | 6.3.2, *new* |
| Cash for the sweep takes interest net of the tax it saves, because unlevered free cash flow was taxed on EBIT | 6.3.2, *new* |
| PV(hurdle, years, 0, −exit equity) gives the top price at every hurdle and stays live; Goal Seek cross-checks one | 6.3.6, *new* |
| Formula AutoComplete: type =AVER and Tab completes AVERAGE( from the list | 1.6.2 aside, *new* |
| A CAGR whose exponent counts its own periods, 1/(COLUMNS(range)−1), so no period count is typed | 2.1.3, *new* |
| A driver held flat is typed once and each later year points at the one before, in black: the one accepted link to a link | 5.2.6 aside, *new* |
| Step a sensitivity table's axes by about half a point, so the corner-to-corner range is tight enough to show a buyer | 5.6.6, *new* |
| NM where a comp's EBITDA is blank, zero or negative; the statistics skip it as they skip any text | 6.1.1 aside, *new* |
| Each claim in a waterfall is MIN(claim, what's left above it), so a low price floors the owners at zero | 6.4.2, *new* |
| Ctrl+N, Ctrl+O, Ctrl+S, Ctrl+P: new workbook, open, save, print (the page Ctrl+F2 opens); faster than the File tab route, Alt, F. First taught in 1.1.2 (Reference only: the browser keeps these chords) | Reference page only, *new* |
| Alt, H, E, A · Alt, H, E, F · Alt, H, E, C · Alt, H, E, M: Clear All (contents, formats and notes) · Clear Formats · Clear Contents (what Delete does) · Clear Comments and Notes. First taught in 1.3.1 | Reference page only, *new* |
| Ctrl+Shift+1, 4 and 5 where a formatting add-in is installed: the add-in often takes these chords over and cycles through its own formats; this course teaches what Excel does with nothing installed, and a course's Alt+number chords are that course's own toolbar (Reference only) | Reference page only, *new* |
| Ctrl+Shift+_: removes every border from the selection, the chord for Alt, H, B, N. First taught in 1.5.4 | Reference page only, *new* |
| F2, pressed again inside an open cell: switches between Edit mode, where the arrows move the caret, and Enter/Point mode, where they pick cells (the status bar names the mode). First taught in 1.6.1 | Reference page only, *new* |
| Alt, F, I (File, Info): Protect Workbook, Encrypt with Password puts a password on a file before it leaves by email. First taught in 1.7.1 (done screen) | Reference page only, *new* |
| Ctrl+Shift+3: the d-mmm-yy date format in one press. First taught in 2.1.4 | Reference page only, *new* |
| _ and a character, in a format code, leaves a gap as wide as that character: _) lines positives up with negatives in parentheses; _x lines plain rows up under a first-row multiple that carries its x. First taught in 2.2.1 | Reference page only, *new* |
| Alt, H, L, T (Top/Bottom rules): the top or bottom 10 items or 10%, above or below the average. First taught in 2.5.1 (brief) | Reference page only, *new* |
| Ctrl+Tab: cycles the open workbooks, also while a formula is open, which is how a link to another file gets pointed. First taught in 3.6.3 (Reference only: the browser keeps the chord) | Reference page only, *new* |
| XLOOKUP with a return range several columns wide: returns the whole record for one key, spilled along the row, where the version has dynamic arrays. First taught in 4.1.5 (Reference only until 9.1 question 12 is decided) | Reference page only, *new* |
| INDIRECT(text, FALSE) and ADDRESS(row, column): INDIRECT with FALSE reads R1C1 text built from two MATCHes ("R"&MATCH(…)&"C"&MATCH(…)); ADDRESS builds the address text INDIRECT reads, met as INDIRECT(ADDRESS(MATCH(…), n)); recognize both and rewrite them as INDEX/MATCH. First taught in 4.1.8 (read, not written) | Reference page only, *new* |
| Alt, A, B (Subtotal): on a sorted copy, a SUBTOTAL(9) row at each change in the grouping column, a grand total and an outline; Remove All undoes it. First taught in 4.2.1 (done screen) | Reference page only, *new* |
| F6 · Shift+F6: with the panes split (Alt, W, S), jumps to the next or the previous pane, even with a formula open, so a block far down the sheet can be pointed at without scrolling; it also stops at the Ribbon and the status bar on the way around. A Reference-page alternative beside the second-window tip of 5.4.1; not taught in a lesson | Reference page only, *new* |
| Ctrl+Alt+V, C (Paste Special, Comments): copies a note onto other cells without touching their contents. A Reference-page row beside the source-note habit of 1.3.5; not taught in a lesson | Reference page only, *new* |
| RATE(years, 0, −equity in, equity out): the annual rate between two points, the same answer as RRI(years, in, out) from 2.1.3; met on other people's buyout sheets (6.3.4 goal 4 uses RRI); not taught in a lesson | Reference page only, *new* |

### The desk audit: what an in-person banker course adds, and where it is here

Wolf, 2026-09-28: audit for the content that comes from a banker at the next desk rather than a generic Excel course (that's the value proposition) and make sure it's in. The test for each item: would a good analyst show you this in your first month, and would a generic course skip it? What a desk course adds beyond a generic one falls into four kinds, and the course carries all four: **conventions** (colors, signs, units, layout, what a page looks like before it leaves), **modeling patterns** (drivers with a selector, flags and counters, corkscrews, overrides, the pass-through driver and the sticky IF, circularity with a breaker, checks that roll up), **speed habits** (fill patterns, + and Alt+=, F4 both ways, Ctrl+Enter, a second window) and **audit discipline** (Ctrl+[, Row Differences, hardcode hunts, the order to check when it doesn't balance). The table is the audit; "placed" means it was already in a lesson, "added" means this pass put it in.

| Desk item | Status | Where |
| :- | :- | :- |
| The color code: blue typed, black formula, green link, red external | placed | 1.1.5 |
| One hardcode per cell; never a number inside a formula | placed | 1.1.4, 1.6.1 |
| + starts a formula (the keypad habit) | added | 1.6.1 done screen; M63 |
| Alt+= on the block plus its edge (one press for every total) | placed | 1.6.2 |
| F4 for anchors and F4 to repeat | placed | 1.2.3, 1.6.3 |
| Fill patterns: Ctrl+Shift+→ then Ctrl+R; Ctrl+Enter; one formula per row | placed | 1.6.4, 5.2.3 |
| Center Across Selection, never merge | placed | 1.5.3 |
| Group, don't hide; freeze the labels and the timeline | placed | 1.4.3, 2.4.2 |
| Sign convention stated once; negatives in parentheses; typing (500) | placed / added | 2.1.2 |
| Units in the format (k, m, x, bps); "FY"yy; dashes for zero | placed | 2.2 |
| The page's anatomy: title, units, timeline, A/E divider, sources | placed | 2.3 |
| Margins, growth and CAGR beside every P&L | placed / added | 2.1.3 |
| Dynamic titles and a units line that write themselves | placed | 2.6.3, 2.6.5 |
| A hyperlinked cover and a navigation column | placed | 2.4.4 |
| Print pack: fit to width, titles, footers with the file path | placed | 2.7 |
| MIN and MAX instead of nested IFs; caps and floors | placed | 3.1.2, 5.4.4 |
| The ISNUMBER override column | placed | 3.1.4 |
| Period keys from dates; MOD for periodicity | placed / added | 3.2.3 |
| ROUND on checks, not a format that hides decimals | placed | 3.3.1, 5.2.4 |
| SUMPRODUCT for weighted averages and as the array engine | placed | 3.3.5, 5.5.2 |
| Running totals with an anchored start | added | 3.5.4 |
| Ctrl+[ and F5 Enter back; F9 on a part; show formulas | placed | 1.6.6, 3.6.2 |
| The hardcode hunt: Go To Special constants, Row Differences | placed | 1.2.4, 3.6.3, 5.5.3 |
| INDEX/MATCH over VLOOKUP; INDEX(range,0,n) over OFFSET | placed | 4.1.3, 4.1.8 |
| Multi-criteria lookups: a key column, SUMIFS as a lookup | placed | 4.1.7 |
| Bounded ranges over whole columns | added | 4.3.1 |
| The SUMIFS cube filled both ways | placed | 4.3.1 |
| Pivots for cuts, SUMIFS for models | placed | 4.4 |
| The case toggle: a picker, MATCH, CHOOSE or INDEX; the active case shaded; the case in the title | placed / added | 4.5.1 |
| Data tables, "automatic except data tables", the pass-through driver, the sticky IF | placed | 4.5.2–4.5.6 |
| Names for the toggles and key inputs only; F3 on the Cover | placed | 4.6.1 |
| The drivers block: three cases by year, one selector, one live block; scenarios vs sensitivities | added | 5.2.6 |
| Inputs, calculations, outputs; sheet order; the same year in the same column | placed / added | 5.2.1, 5.2.2 |
| Flags and counters; COLUMNS(range) as a counter | placed / added | 5.2.2 |
| The checks sheet from day one; the catalog; OK / CHECK on the Cover | placed | 5.2.4, the checks thread |
| Populate a statement by INDEX/MATCH on label and year | placed | 5.2.5 |
| Corkscrews; the average-balance circle with a breaker | placed | 5.3.1, 5.3.5 |
| Working-capital days; the depreciation waterfall by vintage | placed | 5.3.3, 5.3.4 |
| Cash as the plug that isn't a plug; the order to check when it doesn't balance | placed | 5.4.3, 5.4.5 |
| A second window side by side; the Watch Window | placed | 5.4.1, 5.5.2 |
| Stress tests: zero, negative, huge | placed | 5.5.4 |
| Mid-year convention; two terminal values checking each other | placed | 5.6.4, 5.6.5 |
| LTM and calendarization; the median over the mean; flags, never deleted rows | placed | 6.1 |
| Sources and uses with one honest plug; the returns bridge | placed | 6.3.1, 6.3.5 |
| Version the file name; Ctrl+Home at 100% before saving | placed | 1.7.1, 4.8 |
| The desk number format: separators, no decimals, (1,234) for a negative, set in Ctrl+1 and repeated with F4 or Paste Formats | added | 1.5.1; every page after |
| Paste arithmetic on typed cells only, never across a total | added | 1.3.4; 2.1.2 |
| One hop to the source: no chained links, except a flat assumption carried as =prior year | added | 1.6.4; 5.3.2 |
| Notes reviewed before a file leaves; sources kept | added | 1.7.3 |
| The _) spacer in every typed code, so the digits hold one column | added | 2.2.1 |
| NM, not 0, on a ratio that has no meaning | added | 3.1.4; 6.1.1 |
| Grouped sheets: the Group tag read before typing, ungrouped before the next edit | added | 4.3.6; 2.7.1 |
| Typed edges on a data table, never linked to the driven input | added | 4.5.2 |
| A dead sensitivity table is labeled with the setting it needs and greyed | added | 4.5.5; 5.6.6 |
| Limit checks beside the ties; the tick-off; the circle hunt; a boxed, explained exception | added | 5.5.1, 5.4.5, 5.5.3 |
| No typed zeros: pending checks stay empty, an empty revolver and a nil distributions row are links | added | 5.2.4, 5.4.2, 5.4.3 |
| Schedule sanity reads: the effective rate, capex over depreciation, revenue per wash in the right units, days on closing or average | added | 5.3.1, 5.3.3, 5.3.4, 5.3.5 |
| A DCF read back: a stated valuation date, a normalized terminal year, the terminal share, implied multiples, the round trip | added | 5.6.1, 5.6.4, 5.6.5 |
| What the model leaves out, said once where a reviewer looks: no inventory line, land at cost, a nil deposit rate, no deferred tax | added | 5.1.2, 5.3.4, 5.3.5, 5.3.6 |
| Interest cover beside leverage; amortization against loan amortization; a balance sheet is at cost, not at worth | added | 5.1.1, 5.1.4, 5.1.7 |
| Cost of debt at today's rate; the size premium outside beta | added | 5.6.3 |
| Comps in practice: LTM from filed periods, weights from the year-end cell, growth, margin and leverage beside every multiple, net cash, owned against rented sites | added | 6.1.1–6.1.4 |
| Buyout mechanics: old debt repaid in uses, the rollover in sources, amortization on the original loan, the tax saved on interest, same terms same return | added | 6.3.1, 6.3.2, 6.3.4 |
| The top price at a hurdle by PV; the return read under the Downside case | added | 6.3.6 |
| The reconciliation's three columns (reported, each adjustment explained, adjusted) are how diligence restates EBITDA | added | 3.3.6 |
| The vocabulary a reviewer expects: current against non-current and the order of the rows, the current portion of debt, prepaids and accruals, other income below operating profit | added | 5.1.1, 5.1.2, 5.1.4 |
| More sanity reads: the cash conversion cycle, the useful life backed out of the actuals, the lender's return against its rate | added | 5.3.3, 5.3.4, 6.3.4 |
| DCF inputs with a stated basis: a private company's beta from its listed peers, the exit multiple sourced to comps or precedents, a normalized terminal year in its own column | added | 5.6.3, 5.6.4 |
| One picture for enterprise value, net debt and equity, and for what leverage does to a return: a house and its mortgage | added | 5.6.1, 6.3.4 |
| Deal reads: what a sweep earns, the rolled stake as a share of the new company, proceeds labeled pre-tax | added | 6.3.2, 6.4.1, 6.4.2 |

Out on purpose, with the reason: LAMBDA and macros (no VBA in the engine; an analyst doesn't write one in year one) and with them the formatting-cycle macros BIWS sells; charts (no chapter's product needs one at launch); Bloomberg, FactSet and Capital IQ plug-ins (paid data the learner won't have); Excel Tables and structured references (Ctrl+T, because the desks keep models in plain ranges); Ctrl+Shift+Enter array entry (SUMPRODUCT and, if 9.1 q12 is a yes, dynamic arrays cover it; an accepted alternative on the Reference page); the Camera tool. If Wolf remembers a tip from the summer course that isn't on either list, it goes in the tips ledger above with a lesson beside it.

### The sheet standard: one skeleton for every page and every drill

Wolf, 2026-09-30: the pages a learner builds and the drill sheets should all look like they came off the same desk, whatever their size. The rules were already here in pieces (the chips in 7.1, the top-bucket tips in 4.8, the page's anatomy in 2.3.1). This puts the skeleton in one place for the build, and M86 is the code that holds it.

**The skeleton.** A finished page in any chapter, and the solved sheet of any drill:

| Element | Where | Rule | Chips |
| :- | :- | :- | :- |
| Title | A1 | Bold, one size up, says what the page is. A report's title is centered across the page with Center Across Selection | D7, D8, G2 |
| Units line | A2 | Italic; the currency, the scale and the sign convention, in the fixed wording ("USD thousands unless stated; costs shown as negatives") | C4, C5 |
| Spacer | Row 3 | Empty | |
| Headers or timeline | Row 4 | Bold, right-aligned over figures; period columns one width; the A/E divider where estimates start | B5, C2, D6 |
| Labels | Column A in Chapter 1; column B from Chapter 2 on, where A is a narrow column for codes or helpers | Sub-items indented with the indent button, never with spaces | D6 |
| Figures | From row 5; the first figure column is B in Chapter 1 and C from Chapter 2 on | One formula per row. Typed values blue, formulas black, links to other sheets green | B1, B2, C3 |
| Number formats | Every figure | The desk number format on money and counts; percentages to one decimal, italic; multiples to one decimal with an x; per-unit figures to two decimals; $ on the first and total rows only; a zero as a dash from Chapter 2 on | D1–D4, D9 |
| Totals | Their own rows | Bold with a top border; a double bottom on the final total; no grid and no vertical borders | D5 |
| Source line | The row under the table | One line: where the numbers came from | G5 |
| Checks | A labeled block at the foot of the page, or the Checks sheet in a model | Live differences reading zero, in the desk number format | F1 |
| Sheet settings | The whole sheet | One font and one size; nothing merged; nothing hidden, grouped instead; gridlines off on a page someone reads and on for working sheets; panes frozen at the first figure | A3, C7, C8, D7, D8 |
| Tabs | The workbook | Named for what they hold; outputs left, data right | A4 |

**What varies.** The number of rows and columns; the widths (the label column fits its longest label, period columns match each other); and how many blocks a page stacks, with one empty row between blocks.

**What is off the standard on purpose.** Raw exports, inherited sheets, and the start state of a lesson or drill whose job is to bring a sheet to standard. Each is a named exception with its planted faults listed in the script. Nothing is off the standard by accident.

**Drill sheets.** The same skeleton at small size: a drill tab runs 5 to 40 rows by 5 to 11 columns. A drill's solved sheet passes the standard, and its start state is cut from the solved sheet. The twelve built Chapter 1 drills (6.1) move onto the skeleton when they are rebuilt, so the cell addresses in their goal lines change with it.

### Basics the lessons never assume

Wolf, 2026-09-27: fold in the basics people wouldn't know. The first time each of these appears, the teach line explains it in a sentence; after that it's used without comment. The lesson in brackets is where it's first explained.

  - The screen: the Name Box, the formula bar and expanding it (Ctrl+Shift+U), the Ribbon and collapsing it (Ctrl+F1), the sheet tabs, the status bar, zoom (Alt, W, Q and Alt, W, J) (1.1.1, 1.1.2).
  - Cell and range addresses: A61, A1:F61, and Sheet!Cell for another sheet (1.1.1, 1.2.3).
  - Moving: one cell with an arrow, to the edge with Ctrl and an arrow, home with Ctrl+Home, to the last used cell with Ctrl+End, a screen with PgUp and PgDn (1.1.1, 1.2.1).
  - Selecting: what a selection is; Shift and an arrow; Ctrl+Shift and an arrow; Shift+Space and Ctrl+Space; Ctrl+A once and twice; Ctrl+Shift+End; an arrow on its own collapses it (1.1.1, 1.1.4, 1.2.2).
  - The Ribbon and its tabs; Alt shows the letters; Esc backs out one level; the legacy menu letters still work (1.1.2).
  - Dialogs: Tab between fields, the underlined letter with Alt, Enter is OK, Esc is Cancel; Format Cells (Ctrl+1) and its six tabs (1.1.2).
  - Edit mode: F2 opens the cell with the caret at the end; Enter keeps the change, Esc throws it away; typing on a cell without F2 replaces the whole entry; Delete clears a cell (1.1.4, 1.3.1, 1.3.2).
  - Entering: Enter commits and, with the desk setting from 1.1.3, stays on the cell; Tab commits and moves right; Shift reverses either; Ctrl+Enter fills the selection; AutoComplete; Alt+Enter for a line break (1.1.3, 1.3.1).
  - The status bar: Sum, Average and Count of whatever is selected, the fastest sanity check there is (1.2.2).
  - F4 as repeat-last-action (1.2.3, 1.3.2); F4 as the anchor key inside a formula (1.6.3).
  - Names, notes, today's date, snapping the view back: Define Name, Shift+F2, Ctrl+;, Ctrl+Backspace (1.3.5).
  - The Font Color route (Alt, H, F, C, then the palette) and the Quick Access Toolbar numbers (1.1.3, 1.1.4).
  - What a formula is: starts with =, recalculates when its inputs change; the difference between a typed number and a formula, and the colors that say which is which (1.1.4, 1.6.1).
  - Numbers versus text: a figure sitting on the left is text (1.3.2).
  - Copy, cut, paste and the marquee; Esc drops it (1.3.3).
  - Undo and redo (1.3.2).
  - Sheets and tabs: a workbook is the file; Ctrl+PgDn and Ctrl+PgUp walk them; rename, insert, delete, move (1.1.1).
  - Mac: ⌘ for Ctrl, ⌥ for Alt, fn for the function keys, delete versus forward-delete (first run, 1.1.2, and any lesson whose command differs).

### Chapter 1 · Foundations (free) · about 3.5 hours

Workbook: the weekly report for the Austin cluster. Sheets: **Raw** (Date · Site · Washes · Avg ticket · Revenue · Wash cost; 5 sites × 12 days), **Inputs** (cost per wash, target margin, site list, "USD unless stated"), **Costs** (rent, maintenance and card fees by site, per week), **Report** (blank at the start; the one-page weekly KPI report by the end), plus the tabs the managers left behind (**Sheet2**, **Old wk37**).

| Module | Lessons | Challenge |
| :- | :- | :- |
| 1.1 Open and set up | 1.1.1 The workbook the managers sent · 1.1.2 Know the screen (the UI tour: formula bar, Ctrl+Shift+U, Ctrl+F1, status bar, zoom, the sheet keys) · 1.1.3 The Ribbon by keyboard · 1.1.4 Set Excel up like an analyst · 1.1.5 Color-code the workbook | Another location's file |
| 1.2 Move and select | 1.2.1 Jump, don't scroll (Go To as one goal, not a lesson) · 1.2.2 Select like you mean it · 1.2.3 Rows, columns and cells (insert and delete, widths, heights, AutoFit, alignment, wrap) · 1.2.4 What's typed and what's calculated (Go To Special at scale, on Costs) | Find and mark |
| 1.3 Enter, edit, copy and fill | 1.3.1 Enter the missing day (Enter stays, Tab runs, Ctrl+Enter, AutoComplete, Alt+Enter) · 1.3.2 Fix it in place (the F2/Esc flick, Ctrl+F once, F4 as repeat) · 1.3.3 Copy, cut, paste, fill · 1.3.4 Paste Special: values, formats, math (Multiply and Divide) · 1.3.5 Names, notes and the small keys (Replace, Define Name, a note, Ctrl+;, Ctrl+Backspace, Fill Series) | Complete the feed |
| 1.4 Structure | 1.4.1 Rows and columns that keep the totals honest (inserting inside a SUM, deleting what a formula reads, #REF!) · 1.4.2 The page's columns (equal period widths by hand, AutoFit for labels, wrapped headers) · 1.4.3 Hide, group, freeze (and why Ctrl+Shift+0 never works) | Reshape the report |
| 1.5 Format | 1.5.1 Numbers a banker can read · 1.5.2 Fonts, fills, borders (the top-border reason) · 1.5.3 Alignment and titles (Center Across Selection, never merge) · 1.5.4 The style pass (F4) | The desk's format in three minutes |
| 1.6 Formulas | 1.6.1 Point, don't type (and the hardcode-in-a-formula fix, by address and by name) · 1.6.2 SUM family and AutoSum · 1.6.3 Anchors: $ and F4 (demo of the four states, F4 pressed and read, filled both ways) · 1.6.4 Link across sheets (demo, the syntax, typed once, pointed, Ctrl+Enter columns, green, Ctrl+[ back) · 1.6.5 One formula per row, filled right · 1.6.6 Read the error, follow the trail | The site P&L |
| 1.7 Present and audit | 1.7.1 Fit to one page · 1.7.2 The checks row · 1.7.3 Hardcode hunt | Audit before you send |
| 1.8 Project and assessment | The weekly KPI report, built from a blank Report on a fresh week (project, fifteen goals); the same page on the San Antonio cluster's numbers, ten minutes on a hard clock, seventeen goals defined by start state and end state rather than the clock (Wolf), conventions graded (assessment, and the test-out). The sixteen must cover: jump and select by keyboard (Ctrl+Arrow, Ctrl+Shift+Arrow, a row and a column), a Ribbon route (an Alt chord to a command), a Tab run of entries and one F2 fix, copy and Paste Special values and formats, fill down and right and one Fill Series, one Replace All, insert and delete a row, widths and a group, freeze panes, number formats and a bold total with a top border, Center Across Selection, formulas by pointing with one anchor and one cross-sheet link, Go To Special constants colored blue, a checks row, and the print set-up. Three moves can't pass it. | |

### Chapter 2 · Formatting (paid) · about 3 hours

Workbook: three years of P&L, FY24A–FY26E, with a monthly FY26 block. Lines: retail wash revenue, membership revenue, other (detailing, vending), chemicals and water, labor, rent, utilities, maintenance, card fees, marketing, head office; site count 28 → 40. Sheets: **P&L**, **Inputs**, **Monthly**, **Print**. Arrives as a raw export; leaves as the historical financials section of the book.

| Module | Lessons | Challenge |
| :- | :- | :- |
| 2.1 Number formats | 2.1.1 Built-in formats on a P&L · 2.1.2 Sign convention: costs negative, stated once · 2.1.3 Currency and percent lines · 2.1.4 Dates on the timeline | A raw P&L's numbers to standard in three minutes |
| 2.2 Custom number formats | 2.2.1 The four-section format · 2.2.2 Units in the format: k, m, x, bps · 2.2.3 Dynamic headers with TEXT · 2.2.4 Conditional codes and hidden zeros | The team's number-format set |
| 2.3 The page a buyer reads | 2.3.1 Title, units, timeline, sections, answer · 2.3.2 Actuals vs estimates: the divider · 2.3.3 Borders that mean something · 2.3.4 Labels, footnotes and sources · 2.3.5 Widths and the label column · 2.3.6 Cell styles and Format Painter at scale | A three-year P&L to presentation quality |
| 2.4 Alignment and structure | 2.4.1 Wrap, indent, Center Across Selection at scale · 2.4.2 Grouping and outline levels · 2.4.3 Hiding vs grouping vs a separate sheet · 2.4.4 A navigation column for a long sheet | A flat P&L into a grouped, navigable one |
| 2.5 Conditional formatting | 2.5.1 Highlight rules: negatives, exceptions · 2.5.2 Formula-driven rules: a check that isn't zero turns red · 2.5.3 Data bars and scales, and when not to · 2.5.4 Managing rules | The checks flags on a model |
| 2.6 Dates and text for presentation | 2.6.1 TEXT for labels and headers · 2.6.2 EOMONTH and EDATE for period ends · 2.6.3 Dynamic titles with & · 2.6.4 Cleaning imported labels: TRIM, PROPER, SUBSTITUTE · 2.6.5 A units and period line that writes itself | The dynamic header block |
| 2.7 Printing and page layout | 2.7.1 Print areas, titles, fit to width, headers and footers · 2.7.2 Print preview and page breaks · 2.7.3 The one-page summary linked from the detail | A three-sheet model prints as a clean pack |
| 2.P/A | The historical financials section, end to end; assessment on fresh figures, ten minutes | |

### Chapter 3 · Formulas (paid) · about 3 hours

Workbook: the POS export. Sheets: **Sites** (code, name, cluster, opened, tunnel capacity in cars an hour), **Packages** (code, name, retail price, member fee), **Members** (id, home site, plan, joined, cancelled), **Transactions** (about 90 rows: date, site code, package code, member id or blank, amount), **Summary** (started by someone else; doesn't tie), **Loans** (the site-build loan). Lookups are Chapter 4; this chapter builds the databook with logic, dates, math, text and the auditing pass.

| Module | Lessons | Challenge |
| :- | :- | :- |
| 3.1 Logic | 3.1.1 IF on a threshold: sites below target washes · 3.1.2 Nested IF vs IFS vs MIN/MAX: manager bonus tiers · 3.1.3 AND, OR, NOT: compound flags · 3.1.4 IFERROR and the override pattern | The flags block |
| 3.2 Dates | 3.2.1 Serial numbers, DATE, YEAR, MONTH, DAY: site age · 3.2.2 Member tenure from join and cancel dates · 3.2.3 EOMONTH and EDATE timelines · 3.2.4 YEARFRAC and fiscal periods · 3.2.5 NETWORKDAYS and WEEKDAY: the trading calendar | A fiscal-quarter timeline and an age table |
| 3.3 Math and aggregation | 3.3.1 ROUND family, ABS, CEILING, FLOOR on tickets · 3.3.2 COUNTIF and COUNTIFS: washes by site and package · 3.3.3 SUMIF, SUMIFS, AVERAGEIFS: revenue from the export · 3.3.4 MAXIFS, MINIFS, LARGE, SMALL, RANK: the busiest sites · 3.3.5 SUMPRODUCT: the blended ticket · 3.3.6 The reconciliation: POS against the managers' numbers | The export rolled up to a site × package summary |
| 3.4 Text | 3.4.1 LEN, LEFT, RIGHT, MID: split the codes · 3.4.2 FIND, SEARCH, SUBSTITUTE: parse descriptions · 3.4.3 TRIM, VALUE, DATEVALUE: a text export into numbers · 3.4.4 Text to Columns and Flash Fill | A text dump into a usable table |
| 3.5 Time value of money | 3.5.1 PV, FV, PMT: the site-build loan · 3.5.2 NPV and XNPV: a new-site case · 3.5.3 IRR and XIRR · 3.5.4 A payment schedule with anchors | A new-site case valued with NPV and IRR |
| 3.6 Auditing | 3.6.1 Trace precedents and dependents · 3.6.2 Go To Special, show formulas, F9 · 3.6.3 The hardcode and external-link hunt · 3.6.4 The checks block | Six faults in a summary |
| 3.P/A | Rebuild the broken Summary so every number ties to the POS; assessment on a fresh export, twelve minutes | |

### Chapter 4 · Data and Lookups (paid) · about 3.5 hours

Workbook: the diligence pack. Sheets: **Export** (90 rows: date, site, package, member or retail, channel, washes, revenue), **Lists**, **Q&A** (the buyers' question log), **Summary**, **Scenarios**, **Dashboard** (utilization, tables only).

| Module | Lessons | Challenge |
| :- | :- | :- |
| 4.1 Lookups | 4.1.1 Why lookups: a model reads a dataset it can't hold (one input cell pulled from a 90-row table, and what changes when the table does) · 4.1.2 VLOOKUP and HLOOKUP, and how they fail · 4.1.3 MATCH, then INDEX/MATCH · 4.1.4 Two-way INDEX/MATCH: any site, any month · 4.1.5 XLOOKUP: exact, not-found, two-way · 4.1.6 CHOOSE and INDEX as scenario pickers · 4.1.7 OFFSET and INDIRECT, and why the team avoids them | A broken lookup summary rebuilt so every line ties |
| 4.2 Lists and tables | 4.2.1 Sort and multi-level sort · 4.2.2 AutoFilter and filtered totals with SUBTOTAL · 4.2.3 Remove Duplicates and the unique site list · 4.2.4 Data validation and drop-downs | A dump into a filtered, deduplicated list |
| 4.3 Summaries from raw rows | 4.3.1 The SUMIFS cube: site × package × member · 4.3.2 The KPI block: washes per hour, member share, utilization · 4.3.3 SUMPRODUCT with date ranges · 4.3.4 The KPI page: linked, labeled, checked · 4.3.5 A buyer's question answered end to end, from the log to the page | A KPI block that ties to the export |
| 4.4 Pivot tables | 4.4.1 Build and rearrange · 4.4.2 Group dates, value settings · 4.4.3 Refresh and GETPIVOTDATA: the Q&A log answered three ways | An export summarized three ways |
| 4.5 Scenarios and sensitivity | 4.5.1 A case toggle with CHOOSE and INDEX · 4.5.2 One-way data table: price · 4.5.3 Two-way data table: price × members · 4.5.4 Goal Seek: break-even washes per site · 4.5.5 When data tables fail: the pass-through driver | A three-case model with a sensitivity table |
| 4.6 Names and structure | 4.6.1 Naming toggles and key inputs, sparingly · 4.6.2 The Name Manager · 4.6.3 A navigation column and hyperlinks | A model's toggles named and wired |
| 4.P/A | From the raw export to the answered Q&A log, the utilization dashboard and the management case switch; assessment twelve minutes | |

### Chapter 5 · Finance and Accounting (paid) · about 4.5 hours

Workbook: the operating model. Sheets: **Cover**, **Inputs**, **IS**, **CF**, **BS**, **Schedules** (site rollout and revenue build; costs; working capital; PP&E per site; debt; tax), **Checks**, **DCF**. Annual: three historical, five projected. Wolf, Round 4: the statements are taught as full lessons, in the order a DCF reads them (income statement, then cash flow, then balance sheet), with the accounting in the lesson, the way a paid course does it.

| Module | Lessons | Challenge |
| :- | :- | :- |
| 5.1 The three statements | 5.1.1 The income statement: a wash sold is revenue, chemicals are cost of sales, the crew and the rent are operating costs, the tunnel wears out (depreciation), the loan costs interest, the government takes tax, what's left is net income · 5.1.2 Accrual and cash: a member pays in advance (deferred revenue), a supplier is paid later (payables), and why profit isn't cash · 5.1.3 The cash flow statement: from net income back to cash, in three parts (operations, investing, financing) · 5.1.4 The balance sheet: what Clearcoat owns, what it owes, what's left for the owners; cash from the cash flow statement lands here and it has to balance · 5.1.5 One week of one site through all three statements, by hand, on the sheet · 5.1.6 Reading a set of statements the way a buyer does: margins, cash conversion, leverage | One site's month through the three statements |
| 5.2 Model setup and efficiencies | 5.2.1 Inputs, calculations, outputs: architecture and sheet order · 5.2.2 Timeline, units, sign convention, the A/E divider · 5.2.3 The fill patterns: anchor, fill right, AutoSum a block, F4 · 5.2.4 The checks sheet from day one | A blank model shell to standard in three minutes |
| 5.3 Schedules | 5.3.1 Revenue build: sites × washes per day × days × ticket, plus members × fee · 5.3.2 Cost build: per wash, per site, fixed · 5.3.3 Working capital: days to balances, deferred membership revenue · 5.3.4 PP&E: capex per new site and the depreciation waterfall · 5.3.5 Debt and interest: the average-balance circle with a breaker · 5.3.6 Tax | The rollout PP&E and working-capital schedules |
| 5.4 Linking the statements | 5.4.1 The income statement from the schedules · 5.4.2 The cash flow statement, indirect, from the income statement and the schedules · 5.4.3 The balance sheet, and cash as the plug that isn't a plug · 5.4.4 The cash sweep and the revolver · 5.4.5 When it doesn't balance: the order to check | Schedules linked into balanced statements |
| 5.5 Auditing a model | 5.5.1 Tie-outs and cross-foots · 5.5.2 Error flags and the checks summary · 5.5.3 The hardcode hunt at model scale · 5.5.4 Stress tests: zero, negative, huge | Eight planted faults |
| 5.6 DCF | 5.6.1 What a DCF is, and what the statements feed it · 5.6.2 Unlevered free cash flow from the model · 5.6.3 The WACC block · 5.6.4 Terminal value: perpetuity and exit multiple · 5.6.5 Discounting and the mid-year convention · 5.6.6 Sensitivity tables: WACC × growth, exit multiple | A DCF from a given free-cash-flow line |
| 5.7 Model speed | 5.7.1 The revenue build in three minutes · 5.7.2 Fill and format a block in one pass · 5.7.3 Keyboard-only statement linking | The chapter's benchmark drills |
| 5.P/A | The operating model with its DCF page; assessment: one schedule and the links from it, timed, fifteen minutes | |

### Chapter 6 · Valuation (paid) · about 3 hours

Workbook: the valuation pack. Sheets: **Comps** (listed car-wash and auto-services operators, fictional), **Precedents** (car-wash deals, fictional), **LBO** (the lead sponsor's bid), **Bids** (three offers), **Summary** (the football field as a table, and the waterfall).

| Module | Lessons | Challenge |
| :- | :- | :- |
| 6.1 Trading comps | 6.1.1 Spreading a comp: the EV build · 6.1.2 Calendarization and LTM · 6.1.3 Sort the set, filter the outliers, take the median · 6.1.4 Operating multiples: EV per site, EV per wash · 6.1.5 Applying the range to Clearcoat | Three comps spread and a range applied |
| 6.2 Precedent transactions | 6.2.1 Deal multiples and premiums · 6.2.2 Sort by date and size; what's comparable · 6.2.3 Applying the precedents range | Precedents spread |
| 6.3 LBO: the sponsor's bid | 6.3.1 Sources and uses · 6.3.2 Debt tranches and the cash sweep · 6.3.3 Sale-leasebacks: how a rollout gets financed, and what it costs later · 6.3.4 Returns: IRR and MOIC · 6.3.5 The returns bridge · 6.3.6 Sensitivity on entry and exit: what the sponsor can pay | A paper LBO |
| 6.4 The bids and the waterfall | 6.4.1 Three bids side by side: headline price, structure, certainty · 6.4.2 From enterprise value to the owners' proceeds: the waterfall · 6.4.3 Your stake: what your options are worth under each bid · 6.4.4 The football-field table and the one-page summary for the board | A one-page valuation summary assembled |
| 6.P/A | The one-page summary for the board, the last page of the pack; assessment fifteen minutes | |

### Evaluation, in one place

Lesson: graded on the sheet's end state, any route counts; guided is normal and pays full XP; "show me" marks the attempt assisted; clean means no mouse on the workspace and no help. Module challenge: the module's job on a fresh seeded file (a sister cluster: new sites, new figures, one twist), timed, graded on numbers and conventions; Pass fills the module's page; Expert and Legendary are for the boards; first attempt on a soft clock, later ones hard. Chapter project: the page end to end from a blank sheet, guided, no clock; finishing every lesson and the project is **Completed**. Chapter assessment: the same page on fresh figures, hard clock (Chapter 1 ten minutes, rising to fifteen), no help, keyboard only, fifteen or so goals spanning every module, conventions graded; pass is **Verified**, and this is also the test-out: "Already know this?" opens the assessment, and passing it completes the chapter with the lessons skipped. The old three-task fault-fix is retired (it let a learner skip a chapter on three moves). Wolf: size an assessment by its start state and end state and the volume of tasks between them, not by the clock; the clock is set to fit. **hotkey.gg Certified · Excel for Finance** (Wolf, Round 4): the certificate when all six chapters are Verified, with a public verification page showing the six assessment times and keys against par. Nothing built on the platform is exported; the pack stays on hotkey.gg. Boards: one per challenge and one for the Daily; rank is retired (M22). Puzzle drills, one per chapter, live in Practice, not on the path.

## 6. The reps: drills, the Daily, rapid-fire, quests, achievements DRAFT

Wolf's calls, Round 5 (2026-09-27), written up as the practice layer. Fewer systems, each one clean: drills, the Daily, rapid-fire, quests, achievements, boards. Due today (the spaced-repetition micro-drills), the sandbox and the rank ladder are retired. None of this copy is in the sheets yet; the drill catalog, quests and achievements need M1 before edits go live.

### 6.0 The rules, in one place

  - A drill is a 60–180 second timed job on Clearcoat data with no story, graded on the sheet's end state, with Pass, Expert and Legendary pars, a personal best and a ghost of your own best run. The clock starts on your first key. Every dialog and check line on the drill screen is short and readable at a glance: one line per goal, a tick when it lands, nothing to read mid-run.
  - Free: Chapter 1's drills, rapid-fire and the Daily. Everything else is Pro. The free tier gets a learner set up, on the Ribbon and off the mouse, and lets them feel the benefit; the rest is gated.
  - The Daily draws from every drill, free and Pro, except the stretch and long ones, so a free learner meets a Pro key, does badly on it, and knows what they're missing. Same seeded sheet for everyone, once a day, one board.
  - Mouse on the workspace or help in a timed run: no personal best, no board entry, the run still counts for XP and quests.
  - Pars are tuned aggressively: the build session sets them from a reference route (Pass at about 2× the reference, Expert at 1.4×, Legendary at 1.1×), then they're recalibrated from real runs after launch. Earlier versions were too generous.
  - XP: drills pay on the first clean pass and a little on repeats, never for speed. Speed is for the boards.
  - Copy on drill surfaces is clipped: "Press any key to start." "Time's Up. Keep Drilling." Nothing longer than a line.
  - Wolf, 2026-10-01: drills are one to five minutes. The 60–180 second class covers almost all of them, and two tags keep that rule true for the rest (M85). A **stretch** drill practices something no lesson teaches: it carries one rule line on its card, is Pro, sits off the path and is never drawn by the Daily. A **long** drill runs about five minutes, is listed with the challenges (6.3) and is never drawn by the Daily either.
  - Where a typed number and a formula would look the same on the seed, the grader runs a what-if: it changes an input, reads the answer again and puts the input back (M84). It grades the end state, never the route.

### 6.1 Chapter 1 drills (built; rebuilt to the conventions and re-skinned)

**Resized, 2026-10-01.** The twelve built drills run 5 to 50 seconds, well under the one-to-five-minute rule, so the build merges them into eight longer drills and adds three Chapter 1 sketches from 6.2b (Insert and amend, Combine two tabs, Before you send): eleven drills of one to three minutes, each with eight to twenty goals. Pars come from each drill's reference route by the 6.0 multiples. The table after this one keeps each drill's task and goal lines as the material the merged drills are written from.

| Drill | Built from | After | Pass par |
| :- | :- | :- | :- |
| Get around the report | Edge jumps, Go anywhere, Block select | 1.2 | 80 s |
| Enter and fill | Type the column, Fill factory | 1.3 | 90 s |
| Find and fix | Find and fix | 1.3 | 60 s |
| Paste surgeon | Paste surgeon | 1.3 | 90 s |
| Row wrangler | Row wrangler | 1.4 | 60 s |
| Format the weekly page | Bold and borders, Number formats | 1.5 | 120 s |
| Insert and amend | the 6.2b sketch | 1.6 | 90 s |
| Formula sprint | Formula sprint | 1.6 | 120 s |
| Combine two tabs | the 6.2b sketch | 1.6 | 120 s |
| Before you send | the 6.2b sketch | 1.7 | 120 s |
| The weekly report (benchmark) | The weekly sales report | 1.8 | 180 s |


The twelve drills in content/drills/, rebuilt so every one teaches the format a banking or consulting sheet actually uses: top and bottom borders on totals, never a grid; one font, two sizes; color-coded inputs; Center Across Selection, never merge; outside borders only where a block needs an edge; clean organization. M4–M6 apply. Task lines are DRAFT; the live line is under each.

| Drill | Task line | Goal lines (live) | Notes |
| :- | :- | :- | :- |
| **Edge jumps**    *edge-jumps* | **DRAFT** Get around the report by its edges: bottom, right side, the note, then home.    *was: Bounce round the report by its edges: bottom, right, the note row, home.* | Jump to the bottom of the Day column. · Jump to the right edge of the Friday row. · Go to the note in B40. · Snap back to A1. | |
| **Go anywhere**    *go-anywhere* | **DRAFT** Type an address and you're there: a far cell, a whole block, another sheet, then home.    *was: Name the address and be there: a far cell, a whole block, another sheet, home.* | Go straight to the note in B40. · Select the whole report block A1:C7 in one jump. · Land on Monday's costs: Costs!B3. · Snap back to A1 of this sheet. | |
| **Block select**    *select-blocks* | **DRAFT** Select the wash figures, widen to the ticket column, then the whole report, then the whole column.    *was: Take the Sales run, grow it across, then the region, then the whole column.* | Select the figures B3:B7 in one chord. · Grow the selection across to the next column. · Select the whole report region. · Select all of the active column. | re-skin: Sales → Washes |
| **Type the column**    *type-the-column* | **DRAFT** Type five days of wash counts, label the total row and AutoSum it.    *was: Enter the five Sales figures, label the Total row and AutoSum it.* | Type the figures down B2:B6, Enter after each. · Type Total into A7. · AutoSum the column in B7. | |
| **Find and fix**    *find-and-fix* | **DRAFT** Find and fix the typo, then use Replace All on a site name and a whole quarter.    *was: Hunt the typo with Find, then swap a name and a whole quarter with Replace All.* | Find the misspelled Wenesday and land on it. · Retype it as Wednesday. · Replace one site name with another in one pass. · Replace every Q1 with Q2, four cells at once. | "misspelt" → "misspelled" |
| **Fill factory**    *fill-factory* | **DRAFT** Number the days with Fill Series, fill targets down and a header right, then put a zero in five cells at once.    *was: Number the days with Fill Series, copy targets down, formulas right, zeros in one burst.* | Fill the day numbers 1 to 10 with Fill Series. · Fill the target down with Ctrl+D. · Fill the Week 1 header right with Ctrl+R. · Type 0 and land it in five cells with one Ctrl+Enter. | |
| **Row wrangler**    *row-wrangler* | **DRAFT** Insert a row above Wednesday, delete the stale one, widen the wash column, and group the Notes column out of the way.    *was: Open a row above Wednesday, drop the stale one, widen Sales, hide the Notes column.* | Insert a blank row above Wednesday. · Delete the stale row whole. · Set column B to width 14. · Group the Notes column D. | M6: group, don't hide |
| **Bold and borders**    *bold-and-borders* | **DRAFT** Bold the title and headers, then finish the total the way a banker does: bold, a top border, no grid.    *was: Dress the plain table: bold title, bold headers, all borders, a thick ring.* | Bold the title in A1. · Bold the header row A2:C2. · Bold the total row. · Put a top border on the total row and no grid on the block. | M4: top border, no grid, no thick ring |
| **Number formats**    *format-cells-numbers* | **DRAFT** Commas on the wash counts, percent on the shares, and the title centered across the report.    *was: Comma the Sales, percent the shares, centre the title across the report.* | Give B3:B7 the Number format from Ctrl+1. · Make C3:C7 read as percentages. · Center the title across A1:C1. | "centre" → "center" |
| **Formula sprint**    *formula-sprint* | **DRAFT** Multiply two cells, AutoSum a column, and fill an anchored commission down without breaking it.    *was: A product, an AutoSum, and an anchored commission filled down the column.* | In D3, multiply Monday's washes by its ticket. · Type Total into A8, then AutoSum over B3:B8. · In E3, take Monday's revenue times the anchored card fee $E$1. · Fill the fee down E3:E7; every row still reads E1. | re-skin: commission → card fee |
| **Paste surgeon**    *paste-surgeon* | **DRAFT** Paste values to freeze a block, paste a format across, and multiply a range by a copied number.    *was: Freeze formulas to values, carry a format across, multiply a range by a copied factor.* | Copy the revenue formulas C3:C7 and paste only their values onto E3. · Copy the styled header B2 and paste only its format onto E2. · Copy the 1.1 uplift in H2 and multiply it into B3:B7 in one paste. | |
| **The weekly report**    *weekly-sales-report* · benchmark | **DRAFT** Turn a plain export into a finished report: title, headers, live totals, number formats, top border on the total, frozen header.    *was: Take the plain export to a finished report: title, headers, totals, formats, borders, frozen header.* | Bold the title and center it across A1:C1. · Bold the header row. · Type Total and AutoSum both columns. · Apply a number format to the figures. · Bold the total, with a top border, no grid, no fill. · Freeze the top row. | M5: no All Borders, no gray fill; the total gets its top border; the id stays |

### 6.2 Drills for Chapters 2–6 (planned: six per chapter, one a benchmark)

Written 2026-09-27 (work plan, practice layer). Each row is the drill's name, its task line (the one line on the drill card and the start screen, clipped register), and what the grader checks on the end state. Goal lines (one per goal, a tick when it lands) get written with each chapter's script, since they name the cells of that chapter's workbook. Every drill runs on Clearcoat data with no story, 60–180 seconds, Pass · Expert · Legendary pars set from a reference route (M24). All **DRAFT**.

| Drill | Task line | What it grades |
| :- | :- | :- |
| **Format sprint**    *ch2-format-sprint* | The desk number format on a block of General numbers: separators, no decimals, negatives in parentheses. | Number formats on the block; negatives in parentheses; one decimals setting per line |
| **Top and bottom**    *ch2-top-and-bottom* | Bold the totals with a top border each, a double bottom on the last line, no grid. | Bold on total rows; top borders; a double bottom on the final total; no other borders |
| **Custom code**    *ch2-custom-code* | Write the four-section format for a units column: k, parentheses, a dash for zero. | The custom format string on the column; a zero reads as a dash; a negative in parentheses |
| **The divider**    *ch2-the-divider* | Mark the actuals-to-estimates divider and shade the estimate headers. | The A/E divider border; the header shading on estimate columns only; the A and E labels |
| **Flag it**    *ch2-flag-it* | One conditional rule: a check that isn't zero turns red. | The rule on the checks row; a non-zero check shows red; a zero doesn't |
| **Print it**    *ch2-print-it* | Landscape, fit to one, print titles, file and date in the footer. | Orientation; fit to one page; print titles set; &[File] and &[Date] in the footer |
| **P&L to standard**    *ch2-pnl-to-standard* · benchmark | Take a raw P&L export to presentation quality: formats, borders, divider, title, print set-up. | The whole of Chapter 2 on one page; every convention chip in D and G |
| **IF ladder**    *ch3-if-ladder* | Flag every site below target with IF, then two conditions at once with AND. | The flag column ties to a reference; AND used where two conditions apply; no nested tower |
| **Date math**    *ch3-date-math* | Member tenure from join and cancel dates, then an EOMONTH timeline. | Tenure ties; the timeline is EOMONTH formulas, not typed dates |
| **SUMIFS sprint**    *ch3-sumifs-sprint* | Revenue by site and package from the export: one SUMIFS, anchored, filled both ways. | Every cell ties to the export; one formula pattern across the grid; anchors hold |
| **Text split**    *ch3-text-split* | Site and package codes out of one column with LEFT, MID and FIND. | The split columns tie; formulas, not typed text |
| **Loan schedule**    *ch3-loan-schedule* | A PMT payment schedule with the rate and term anchored. | Payment ties to PMT; the balance runs to zero; the rate and term are referenced, not typed |
| **Trace the error**    *ch3-trace-the-error* | Five error codes on one sheet, each fixed at its source. | No error codes remain; no value pasted over a formula |
| **Tie it out**    *ch3-tie-it-out* · benchmark | Reconcile the POS export to the managers' numbers and get the check to zero. | The reconciliation block; the check reads zero as a live difference |
| **Lookup relay**    *ch4-lookup-relay* | The same price three ways: VLOOKUP, INDEX/MATCH, XLOOKUP. | Three formulas return the same value; each is the function named |
| **Sort and filter**    *ch4-sort-and-filter* | A two-level sort, a filter, and a SUBTOTAL that counts only what shows. | The sort order; the filter state; SUBTOTAL(109) not SUM |
| **Pivot in 90**    *ch4-pivot-in-90* | A PivotTable from the export: sites down, months across, washes summed. | The pivot's rows, columns and values; totals tie to the export |
| **Data table**    *ch4-data-table* | A two-way sensitivity on price and members. | The data table's row and column inputs; the corner formula; values tie |
| **Goal Seek**    *ch4-goal-seek* | The washes per site that break even. | The input cell lands on the break-even value; profit reads zero |
| **Name it**    *ch4-name-it* | Name the toggle and the key inputs, then jump to each by name. | The names exist and point at the right cells; the case formula uses the name |
| **Cube it**    *ch4-cube-it* · benchmark | A site × package × member SUMIFS cube that ties to the export. | Every cell of the cube ties; one formula pattern; a checks row at zero |
| **Statement link**    *ch5-statement-link* | Net income to the cash flow statement to the balance sheet, with cash landing where it must. | Net income links; cash from the cash flow statement lands on the balance sheet; it balances |
| **Schedule fill**    *ch5-schedule-fill* | One formula filled right across a five-year build. | One formula per row across the build; anchors on the inputs; values tie |
| **Balance it**    *ch5-balance-it* | Find why the balance sheet is off and fix it at the source. | The balance check reads zero; no plug; the source cell fixed, not the total |
| **Discount it**    *ch5-discount-it* | Discount factors by hand, then NPV to prove them. | The factor row; the discounted sum ties to NPV; mid-year convention where asked |
| **Sweep**    *ch5-sweep* | A MIN/MAX cash sweep on the debt schedule. | The sweep formula; the balance never goes negative; MIN and MAX, not IF |
| **Checks**    *ch5-checks* | A checks row from scratch: balance, cash, sources and uses. | Three live differences reading zero; comma format; labeled |
| **Revenue build in three**    *ch5-revenue-build* · benchmark | Sites × washes × days × ticket plus members × fee, five years, in three minutes. | The revenue build ties to the inputs; one formula per row; anchors hold |
| **Spread a comp**    *ch6-spread-a-comp* | One company's enterprise value from price, shares, debt and cash. | The EV build ties; the multiple ties; every input referenced |
| **Median and range**    *ch6-median-and-range* | Sort the set, drop the outliers, apply the median multiple. | Sort order; the outliers excluded as the task says; the range applied to the company's EBITDA |
| **Sources and uses**    *ch6-sources-and-uses* | A sources and uses table that balances. | Sources equal uses as a live check; the plug is the equity line, stated |
| **IRR sprint**    *ch6-irr-sprint* | IRR and MOIC from a set of cash flows, by formula and by hand. | IRR ties; MOIC ties; the hand-built check agrees |
| **Waterfall**    *ch6-waterfall* | From enterprise value to the owners' proceeds, line by line. | Each line links to the one above; net debt, fees and the option pool come off; the owners' line ties |
| **Football field**    *ch6-football-field* | The valuation range table: one row per method, low and high. | Every low and high links to its method's page; no typed figures |
| **Paper LBO**    *ch6-paper-lbo* · benchmark | Entry, debt, five years, exit and returns, all on one sheet. | Sources and uses balance; the debt paydown ties; exit equity and IRR tie |

**Puzzle drills**, one per chapter, in Practice, not on the path. The task line is all the learner gets; the sheet is the puzzle.

| Puzzle | Task line | What it grades |
| :- | :- | :- |
| **The day the tunnel broke**    *puzzle-ch1* | One site's numbers stop making sense on one day. Find the day with jumps and selection, and mark it. | The flagged cell is the anomaly |
| **Whose P&L is this?**    *puzzle-ch2* | Six lines, one formatted wrong. The format tells you which. | The marked line is the one whose format breaks the standard |
| **The fiscal half**    *puzzle-ch3* | The lead buyer's fiscal year ends in June. Restate every month of Clearcoat's timeline into the buyer's fiscal year and half. | The FY and H1/H2 flags tie for all twelve months; formulas, not typed |
| **The missing washes**    *puzzle-ch4* | The POS says one number and the managers say another. Find the washes that went missing. | The difference is found and attributed to the right site and day |
| **Why doesn't it balance?**    *puzzle-ch5* | Trace a round-number balance sheet error back to its source. | The source cell fixed; the balance check at zero |
| **Which bid is really higher?**    *puzzle-ch6* | Three bids, three structures. Rank them by what the owners take home. | The ranking ties to the waterfall, not the headline |

**Audit: ten faults**    *audit-ten-faults* (the retired 1.8.T, M26): a finished Chapter 1 page carries ten faults from the day-one list. Find and fix every one, change nothing else. Grades: the ten faults gone; every other cell unchanged.

### 6.2b Drill sketches from the source pass (2026-09-30)

Wolf, 2026-09-30: the drill ideas from the source pass are good, and they should be sketched while the session holds the context, so the code layer has more to go on than a title. They are in **claude/script-drills.md**: 65 rough specs, each with its task line, start state, goals, what the grader reads and a reference route, plus one more held for the engine. This table is the index. Twelve of the drills planned in 6.2 also get a spec there from a source idea (custom code, print it, text split, the fiscal-half puzzle, sort and filter, schedule fill, balance it, sweep, spread a comp, median and range, sources and uses, waterfall). Wave 1 (24 drills) is worth building with its chapter; Wave 2 is the bench. The waves are Claude's call. All **DRAFT**.

| Drill | After · time | Wave | Task line |
| :- | :- | :- | :- |
| **Combine two tabs**    *combine-two-tabs* | After 1.6.4 · 120 s | In 6.1 (R1) | Add Austin and San Antonio cell by cell on Combined, without typing a number. |
| **Insert and amend**    *insert-and-amend* | After 1.6.1 · 90 s | In 6.1 (R1) | Add a Utilities line to the site costs and get it into the total, borders intact. |
| **Before you send**    *before-you-send* | After 1.7.3 · 120 s | In 6.1 (R1) | The report goes to the CFO in two minutes. Clear the internal notes and the stray formats, and leave every tab on A1. |
| **Dollars to thousands**    *ch2-to-thousands* | After 2.1.2 · 60 s | Wave 1 | The export is in dollars and the page is in thousands. Divide the typed cells by 1,000 and leave the formulas alone. |
| **Flip and tie**    *ch2-flip-and-tie* | After 2.1.2 · 120 s | Wave 1 | The costs arrived as positives with someone else's formats. Make them the page's: negative, subtotals rebuilt, tied to the accounts. |
| **Rule the row**    *ch2-rule-the-row* | After 2.5.2 · 120 s | Wave 2 | One rule shades every wash over the threshold, whole row. Another shades the estimate columns. |
| **Override**    *ch3-override* | After 3.1.4 · 120 s | Wave 1 | Ops can overrule the POS count for a day. Read the override when it's a number, flag it when it's a note, and keep the ratio from erroring. |
| **Part year**    *ch3-part-year* | After 3.2.4 · 90 s | Wave 2 | Three sites open mid-year. Revenue in the opening year is a mature site's year times the part of the year they're open. |
| **Method selector**    *ch3-method-selector* | After 3.1.2 · 120 s | Wave 2 | Forecast head office for FY27 by the method the selector names. With the selector empty, hold the dollars flat. |
| **SUMPRODUCT proof**    *ch3-sumproduct-proof* | After 3.3.5 · 90 s | Wave 2 | Retail revenue for one site and one package by SUMPRODUCT, proved against SUMIFS. |
| **Bands**    *ch3-bands* | After 3.3.2 · 90 s | Wave 1 | Count the tickets under, between and over two thresholds. The three bands have to add up to every ticket. |
| **NPV three ways**    *ch3-npv-three-ways* | After 3.5.2 · 120 s | Wave 2 | Value the new-site case three ways, and pick the one that's wrong. |
| **Any of three**    *ch3-any-of-three* | After 3.3.5 · 150 s | Wave 2, stretch | Count the days any new hire was on shift, each day once. |
| **Output grid**    *ch4-output-grid* | After 4.1.4 · 120 s | Wave 2 | One formula fills the whole page: any metric for any site, by name. |
| **Six tabs**    *ch4-six-tabs* | After 4.3.6 · 90 s | Wave 1 | Put the same units line and check row on all six site tabs at once, then fix one site's typo without touching the others. |
| **Two pickers**    *ch4-two-pickers* | After 4.1.4 · 90 s | Wave 1 | A site picker and a month picker return washes from the cube, and the answer survives an inserted row. |
| **Pick a window**    *ch4-pick-a-window* | After 4.3.3 · 120 s | Wave 2 | Total member washes between two dates the reader picks, and say which window it is. |
| **Ask the pivot**    *ch4-ask-the-pivot* | After 4.4.2 · 180 s | Wave 2 | Four buyer questions, one pivot. Rearrange it and give each answer. |
| **Decode it**    *ch4-decode-it* | After 4.1.8 · 120 s | held for the engine | A colleague built these two lookups out of text. Rewrite both as INDEX/MATCH. |
| **Is it revenue?**    *ch5-is-it-revenue* | After 5.1.3 · 60 s | Wave 1 | Eight lines of money came in this month. Mark what's revenue and total it. |
| **Which date?**    *ch5-which-date* | After 5.1.2 · 120 s | Wave 2 | A member pays on the 20th. Chemicals are ordered, delivered and paid for on three dates. Put the revenue and the cost in the right month and the balances on the right day. |
| **Used, not bought**    *ch5-used-not-bought* | After 5.1.2 · 90 s | Wave 2, stretch | Three deliveries and two stock counts. What did the month's washes use? |
| **Capitalize or expense**    *ch5-capitalize-or-expense* | After 5.3.4 · 90 s | Wave 2 | A new site's shopping list. For each line: depreciate it, expense it now, or never depreciate it, and say which line of the P&L it hits. |
| **Ten facts, one statement**    *ch5-ten-facts* | After 5.1.1 · 180 s | Wave 2 | A new site's first year in ten facts. Three of them don't belong on an income statement. Build it to net income. |
| **Two landings**    *ch5-two-landings* | After 5.1.6 · 150 s | Wave 1 | Seven events. For each, pick the two lines that move. The balance check tells you when they're all placed. |
| **In order**    *ch5-in-order* | After 5.1.4 · 90 s | Wave 2 | Seven balance-sheet lines, shuffled, and one that isn't a balance-sheet line at all. Label each and put them in the order a balance sheet prints them. |
| **Find the EBITDA**    *ch5-find-the-ebitda* | After 5.1.3 · 90 s | Wave 2, stretch | A sister operator's statements don't show EBITDA. Build it, and the margin. |
| **Three vintages**    *ch5-three-vintages* | After 5.3.4 · 150 s | Wave 2 | Domain adds a vacuum bay at each of three year-ends, on five-year lives. Show gross, accumulated and net at four dates. |
| **The dryer line**    *ch5-dryer-line* | After 5.3.4 · 120 s | Wave 2, stretch | Airport sells its old dryer line for more than it's carried at, the same year it buys a new one. Roll PP&E and state the gain. |
| **Prepaid and accrued**    *ch5-prepaid-and-accrued* | After 5.1.2 · 120 s | Wave 2 | Cedar Park pays a year of insurance on the 1st and owes its crew for the last four days of the month. Build both balances at two dates. |
| **Cash count**    *ch5-cash-count* | After 5.1.6 · 90 s | Wave 2 | Count the month's cash directly and tie it to the cash flow statement. |
| **Four rungs**    *ch5-four-rungs* | After 5.1.3 · 150 s | Wave 1 | One site's month, four times, each with one more timing gap. Build cash from operations at each rung. |
| **Two balance sheets**    *ch5-two-balance-sheets* | After 5.1.5 · 150 s | Wave 1 | Two balance sheets and the year between them. Write the cash flow statement by formula only and land on the change in cash. |
| **Days and the cycle**    *ch5-days-and-cycle* | After 5.3.3 · 90 s | Wave 2 | From the FY26 statements: receivable, payable and deferred-revenue days, and the cycle they add up to. |
| **Name the driver**    *ch5-name-the-driver* | After 5.3.3 · 60 s | Wave 1 | Six balances, six drivers. Match each balance to the line that moves it. |
| **Stacked cases**    *ch5-stacked-cases* | After 5.2.6 · 120 s | Wave 2 | The five drivers have been re-laid with their three cases stacked under each heading. Fill the live block with one INDEX. |
| **Stale tab**    *ch5-stale-tab* | After 5.5.3 · 120 s | Wave 2 | Old_Rollout is going. Find what still reads it, repoint it, delete the tab, and keep the flag at OK. |
| **One hop**    *ch5-one-hop* | After 5.2.6 · 90 s | Wave 2 | The cost-of-a-wash driver reaches its last use through links to links. Point every use straight at the source. |
| **Circle hunt**    *ch5-circle-hunt* | After 5.5.3 · 90 s | Wave 1 | Something on this sheet adds itself. Iteration is on, so nothing warns. Find it and fix it. |
| **Breaker**    *ch5-breaker* | After 5.3.5 · 60 s | Wave 1 | Someone typed text into an interest cell and the model is a wall of errors. Get it back inside a minute. |
| **Equity roll**    *ch5-equity-roll* | After 5.4.3 · 90 s | Wave 2 | Roll equity five years with a payout to the owners at a typed share of net income. |
| **Implied ticket**    *ch5-implied-ticket* | After 5.3.1 · 120 s | Wave 2 | Back the ticket out of three years of washes and revenue by package, minding the units. |
| **Rewire the case**    *ch5-rewire-the-case* | After 5.3.1 · about five minutes | Wave 2, long | This forecast grows revenue by a typed rate for each case. Rewire it to washes a day and ticket, and keep the Base case's revenue where it was. |
| **Depreciation waterfall**    *ch5-dep-waterfall* | After 5.3.4 · 150 s | Wave 1 | Five years of rollout capex, each on its own row over twenty years, plus the old tunnels running off. |
| **Roll forward**    *ch5-roll-forward* | After 5.4.5 · 180 s | Wave 2 | FY27's actuals are in. Make FY27 history without retyping a single projected formula. |
| **Stub period**    *ch5-stub-period* | After 5.6.5 · 150 s | Wave 2, stretch | The buyers want value at September 30, 2026, not at year end. Rebuild the discounting from that date. |
| **DCF read-back**    *ch5-dcf-read-back* | After 5.6.5 · 90 s | Wave 1 | Under enterprise value: how much of it is the terminal value, and what multiple it implies. |
| **Normalize the year**    *ch5-normalize-the-year* | After 5.6.4 · 120 s | Wave 1 | FY31 still opens six sites. Build the normalized year beside it and feed the perpetuity from that. |
| **Round trip**    *ch5-round-trip* | After 5.6.4 · 90 s | Wave 2 | Feed the perpetuity value's implied multiple through the exit method. The growth input has to come back. |
| **WACC range**    *ch5-wacc-range* | After 5.6.3 · 120 s | Wave 2 | Before asking what WACC does to value, see how wide WACC itself is: beta across, the equity premium down. |
| **Quick DCF**    *ch5-quick-dcf* | After 5.6.5 · about five minutes | Wave 2, long | A sister operator sends three numbers. Five years of cash flow from six drivers, one terminal value, an enterprise value, on one page. |
| **Three ways to a price**    *ch6-three-ways-to-a-price* | After 6.1.5 · 90 s | Wave 1 | Three median multiples, three implied equity values, three bids. Which bid clears which? |
| **Match the multiple**    *ch6-match-the-multiple* | After 6.1.1 · 90 s | Wave 2 | Eight ratios for one operator. Mark each consistent or mixed, and compute only the consistent ones. |
| **LTM two ways**    *ch6-ltm-two-ways* | After 6.1.2 · 90 s | Wave 1 | A March year-end operator: LTM EBITDA from the fiscal year and the year-to-date, tied to the four quarters. |
| **Calendarize**    *ch6-calendarize* | After 6.1.2 · 90 s | Wave 2 | Two March year-ends, restated to calendar 2025. The weights come from the year-end cell. |
| **Napkin LBO**    *ch6-napkin* | After 6.3.4 · 180 s | Wave 1 | A bid price, a leverage multiple, flat EBITDA and the debt left at exit. Sources and uses, exit equity, MOIC and the annual return two ways. |
| **What debt adds**    *ch6-what-debt-adds* | After 6.3.4 · 90 s | Wave 2 | Put the deal as bid beside the same deal with no debt and show the gap. |
| **Credit strip**    *ch6-credit-strip* | After 6.3.2 · 90 s | Wave 2 | Under the debt schedule: leverage and interest cover by year, with a flag on any year cover falls short. |
| **Offer to multiple**    *ch6-offer-to-multiple* | After 6.4.2 · 60 s | Wave 2 | A bidder quotes a price for the owners' shares. What multiple is that? |
| **Cap the amortization**    *ch6-cap-the-amort* | After 6.3.2 · 120 s | Wave 1 | The loan repays a typed percent of its original amount each year. At 40% that sends the balance negative in year three, so cap the repayment. |
| **Sweep dial**    *ch6-sweep-dial* | After 6.3.2 · 150 s | Wave 2, stretch | Put a dial on the sweep. Run it at 100%, 50% and 0% and see what happens to net debt. |
| **Exit grid**    *ch6-exit-grid* | After 6.3.4 · 90 s | Wave 2 | Exit equity under five multiples, split between the sponsor and the owners who rolled, from one formula. |
| **Lender's return**    *ch6-lenders-return* | After 6.3.4 · 90 s | Wave 1 | The senior lender's cash flows on one row, and their IRR. It should sit near the loan's rate. |
| **Three cases**    *ch6-three-cases* | After 6.3.6 · 120 s | Wave 2 | The sponsor's return under each case, side by side, and which cases clear the hurdle. |
| **Ceiling price**    *ch6-ceiling-price* | After 6.3.6 · 90 s | Wave 1 | The most a sponsor can pay at three hurdles, by formula. |
| **IRR table**    *ch6-irr-table* | After 6.3.6 · 150 s | Wave 2 | IRR on entry multiple against senior leverage, with everything under the hurdle shaded, and the hurdle in a cell. |

### 6.3 Challenges as drills

Every module challenge is also on Practice, with its title and brief from lessons.csv, once its chapter is unlocked. Every challenge has its own board (6.8). One per chapter is marked as the chapter's benchmark (Chapter 1: the format challenge, 1.5.C, and the site P&L, 1.6.C).

### 6.4 The Daily

One seeded drill a day, drawn from every drill in the catalog, free and Pro, except the stretch and long ones; the figures change by the day; the same sheet for everyone; one board; resets at midnight UTC. Lines: its row in Home's Today panel, its page under Practice, the run panel's beats and the share text (3.4, 3.10). The streak counts practice days and never takes anything away.

### 6.5 Rapid-fire

One chord at a time on a live sheet, 30, 60 or 120 seconds. Hits build a combo, a wrong chord breaks it, the keys stay hidden until you stall. The point is instant feedback and muscle memory: a prompt, a chord, a tick, the next prompt, no reading. The prompt is Excel's name for the command ("Comma style", "Insert row", "Paste values"), never the key. Prompts cover every key taught in any chapter the learner has reached (the live sixteen become a hundred or so). Rebuilt from scratch; the pre-rebuild version was broken. A round counts as practice and pays a little XP; it never sets a drill best.

The stage (Wolf, 2026-10-01; 3.0, "Rapid-fire"; M100): not the workspace but a clean page, the command's name large, and under it a small sheet fragment with the target cells outlined, so the learner sees what the chord does to the cells, not only that it was right. The keys stay hidden as "?" until pressed. Each hit fills a segment of a ten-segment combo meter; Combo 5, 10, 15 and 20 each get one burst, and the first Combo 10 earns Synthwave. A wrong chord shakes the keys and drains the meter. The round's result names the three slowest commands and offers to drill them.

### 6.6 Quests

Replaces Due today (M18). Wolf, 2026-09-27: keep the pool to lessons, drills, the Daily, rapid-fire and challenges, then add a few fun ones built on hotkey counts. Three daily quests and three weekly, each paying XP (Claude, pending: 25 XP for a daily, 75 for a weekly; a run can complete two quests at once). Home shows them where Due today was (3.4). Copy is one line each, imperative, in the clipped register. The pool is data (M54); the drawing rules are under it. Hotkey counts come from the shortcuts-used counter the workspace already keeps.

**Daily pool** (three drawn a day, no repeats within the day)

  - Complete a lesson. *(only while lessons are left)*
  - Finish two drills.
  - Play the Daily.
  - Pass any drill.
  - Expert on any drill.
  - Land 30 hits in one rapid-fire round.
  - Finish a lesson clean: no mouse, no help.
  - Run the {module} challenge again. *(a module not passed clean in the last fourteen days)*
  - Set a new personal best on any drill.
  - Three rapid-fire rounds.

**Daily pool, the fun ones** (hotkey counts; drawn only from keys a lesson has taught the learner)

  - Ctrl+Shift+↓ ten times.
  - Paste Special five times.
  - F4 fifteen times.
  - Fill down or fill right ten times.
  - Ten formulas built by pointing.
  - Alt+= three times.
  - Five commands by Alt chord.
  - Follow the trail five Ctrl+[ presses deep.
  - Twenty sheet switches by keyboard.
  - A whole lesson without touching the mouse.
  - Beat your own ghost on any drill.
  - Finish a drill with no wasted keys.
  - Play the Daily before 9am.

**Weekly pool** (three drawn a week, Monday to Sunday UTC, the Daily's clock; the same quests at week size)

  - Ten drills.
  - Five Dailies.
  - Expert on three drills.
  - Ten rapid-fire rounds.
  - Two new personal bests.
  - Five clean lessons.
  - Three challenges run again.
  - Ctrl+Shift and an arrow a hundred times.
  - F4 a hundred times.
  - Every drill in one chapter, once.

**The loop** (progress bars, completion, rewards) is in 6.10 with the XP proposal (M59).

**Rules.** A quest that needs Pro content is never drawn for a free learner. A quest that names a module or a key names one the learner has reached. Completion counts from the run, so one drill can finish "Finish two drills" and "Expert on any drill" together. Skip a day and nothing is lost. A brand-new learner sees "Quests start after your first lesson."

### 6.7 Achievements

Refinement pass (Round 5): the three "solo" badges retire with their mode; House Style is renamed; the British one is fixed; badges for the paid chapters are added so the shelf grows with the course; quest badges are added; the hidden jokes stay. Pixel-art, four rarities, no XP; each row carries the icon brief for the artist (Wolf may hire one; the art follows 3.0 and 6.7b: 16 by 16 sprites drawn at 4px, four to six colors and a dark outline, no glow). **For Wolf's review (2026-09-27):** the names, the four hidden jokes (Blink, Goblin Hours, First One In, Weekend Warrior, Old Habits), the badges that were once the level names (Warming Up · Committed · Seasoned · Top Bucket; the level titles are now 6.10's) and the icon briefs. Strike or rename in one line; the ids stay.

| Name | Description | Rarity | Icon | Notes |
| :- | :- | :- | :- | :- |
| First Steps    *first-lesson* | Complete your first lesson | common | a single key cap | |
| Through the Door    *mod-setup* | Finish Open and set up | common | an open door | |
| Navigator    *mod-move* | Finish Move and select | common | a compass arrow | |
| Editor    *mod-edit* | Finish Enter, edit, copy and fill | common | a pencil on a cell | |
| Structural    *mod-structure* | Finish Structure | common | a steel beam | |
| By the Book    *mod-format* | Finish Format | common | a ruled page | was House Style |
| Calculator    *mod-formulas* | Finish Formulas | common | an equals sign | |
| Signed Off    *mod-present* | Finish Present and audit | common | a check mark on a page | |
| Report Builder    *ch1-project* | Complete the Chapter 1 project | rare | a one-page report | |
| Verified: Foundations    *ch1-verified* | Pass the Chapter 1 assessment | rare | a stopwatch with a tick | was Under the Clock; one per chapter below |
| Tested Out    *ch1-testout* | Pass the Chapter 1 assessment without finishing the lessons | rare · hidden | a skipped stair | was Skipped Ahead |
| Foundations Poured    *ch1-complete* | Complete every Chapter 1 lesson | epic | a concrete slab | |
| Book Ready    *ch2-complete* | Complete Chapter 2 | epic | a bound book | new |
| Ties Out    *ch3-complete* | Complete Chapter 3 | epic | two figures with a zero between | new |
| Data Room    *ch4-complete* | Complete Chapter 4 | epic | a folder with a key | new |
| Three Statements    *ch5-complete* | Complete Chapter 5 | epic | three stacked pages | new |
| The Bid    *ch6-complete* | Complete Chapter 6 | epic | a sealed envelope | new |
| Verified: Formatting … Verified: Valuation    *ch2–ch6-verified* | Pass each chapter's assessment | rare | the stopwatch, chapter-colored | new, five badges |
| Certified    *program* | All six chapters Verified | legendary | a certificate seal | new |
| Clean Sheet    *clean-1* | Finish a lesson with no mouse and no help | common | a spotless cell | replaces No Training Wheels |
| Hands Off    *clean-10* | Ten clean lessons | rare | a mouse with a line through it | replaces Own Two Hands |
| Untouched    *clean-module* | A whole module clean, challenge included | epic | a white glove | replaces Self-Taught |
| Against the Clock    *timed-1* | Finish a timed run | common | a stopwatch | |
| On the Range    *drill-1* | Attempt a drill | common | a target | |
| Tourist    *drill-tour* | Attempt every drill in a chapter | rare | a suitcase | scope narrowed to a chapter |
| On the Board    *pb-1* | Set your first personal best | common | a board with one row | |
| Collector    *pb-all* | A personal best on every drill in a chapter | epic | a row of medals | scope narrowed |
| Keyring    *keys-ch{n}* | Every key in a chapter collected on the Reference page | rare | a ring of keys | new, one per chapter (M57) |
| Cleared    *tier-pass* | Beat a Pass clock clean | common | a green light | |
| Expert    *tier-pro* | Beat an Expert clock clean | rare | a blue diamond | was Professional; the tier is Expert (M53) |
| Legendary    *tier-legend* | Beat a Legendary clock clean | epic | a gold diamond | |
| Heating Up    *legend-3* | Legendary on three different drills | epic | a flame | |
| Untouchable    *legend-all* | Legendary on every drill in a chapter | legendary | a crown | scope narrowed |
| Showed Up    *daily-1* | Finish a Daily | common | a calendar page | |
| Regular    *daily-7* | Seven Dailies on seven days | rare | a calendar week | |
| Fixture    *daily-30* | Thirty Dailies on thirty days | epic | a calendar month | |
| Momentum    *streak-7* | Practice seven days in a row | rare | a running figure | "Practise" fixed |
| No Wasted Keys    *no-waste* | Finish a drill clean at the optimal keystroke count | rare | a key with a star | |
| Economist    *econ-10* | Ten clean runs at or under optimal keys | epic | an abacus | |
| Quick Draw    *rapid-1* | Finish a rapid-fire round | common | a lightning bolt | |
| Live Wire    *rapid-500* | Reach Combo 20 in one rapid-fire round | rare | a bolt | |
| In the Zone    *combo-10* | A ten-hit rapid-fire combo | rare | a chain of ten | |
| Perfect Round    *rapid-perfect* | A 60-second round with no misses | epic | a bolt in a circle | new |
| First Quest    *quest-1* | Complete a quest | common | a scroll | new |
| Questing    *quest-25* | Twenty-five quests | rare | a stack of scrolls | new |
| Clean Sweep    *quest-week* | Every quest in one week | epic | a broom | new |
| Volume Business    *runs-100* | One hundred recorded runs | rare | a ledger | |
| Warming Up    *level-5* | Reach level 5 | common | a small flame | |
| Committed    *level-10* | Reach level 10 | rare | a bigger flame | |
| Seasoned    *level-20* | Reach level 20 | epic | a pepper mill | new |
| Top Bucket    *level-30* | Reach level 30 | legendary | a bucket with a star | new; Wolf's phrase |
| Blink    *blink* | Finish a drill clean ten seconds or more under its Legendary par | epic · hidden | an eye | |
| Goblin Hours    *night-shift* | A clean run between midnight and 4am | rare · hidden | a moon over a monitor | keep, decided |
| First One In    *early-bird* | A clean run between 5 and 7am | rare · hidden | a sunrise | |
| Weekend Warrior    *weekend* | A clean run on a Saturday or Sunday | common · hidden | a hammock | |
| Old Habits    *old-habits* | Ruin a timed run with the mouse | common · hidden | a mouse, cracked | keep, decided |

### 6.7b Badge art: the prompts

Wolf, 2026-09-27: the achievements as text prompts with guidance for the pixel-art badge, for an artist or an image model. One style guide, then one subject line per badge; the prompt is the style guide plus the subject line. The theme colors below are placeholders until the build session pulls the real palette from the code.

**Style guide (paste before every subject).** Wolf, 2026-09-27: hand-drawn pixel art in the spirit of a Terraria inventory item, not Game Boy; 2026-10-01: it must not look machine-made (3.0, "Achievements and level titles"). So: one hand-drawn pixel object on a 16 by 16 canvas, drawn at 1× with no anti-aliasing and no gradients; the site shows it at 4× (64px). Four to six colors with two or three tones of shading and a one-pixel dark outline, lit from the top-left, centered on a transparent background, with no tile, circle or glow behind it. Rarity is a colored word under the badge (common, rare, epic, legendary), never part of the art. The twelve sprites drawn for the canvas (proto/canvas/pixels.py on the proto branch) are the reference set until an artist's set replaces them. No text and no letters or numbers, unless the subject is a key cap that carries one character. Readable at 16 pixels: if the subject needs detail to be recognized, simplify it. The theme's palette is not imposed on the sprite; the sprite reads the same on every theme.

| Badge | Rarity | Subject line |
| :- | :- | :- |
| First Steps | common | A single beige keycap seen from the front and above, blank face, one pixel of highlight on the top edge. |
| Through the Door | common | An open wooden door, ajar, with a strip of light on the floor. |
| Navigator | common | A compass rose with one arrow filled in, pointing up-right. |
| Editor | common | A yellow pencil laid across a single spreadsheet cell, the cell outlined. |
| Structural | common | A short steel I-beam, front-on, with rivets. |
| By the Book | common | A ruled page with three horizontal lines and a bold line at the bottom. |
| Calculator | common | A bold equals sign on a small tile. |
| Signed Off | common | A page with a check mark stamped in the lower right. |
| Report Builder | rare | A one-page report: a title bar, three rows of figures, a heavy total line. |
| Verified: Foundations | rare | A stopwatch with a check mark on its face. |
| Tested Out | rare · hidden | A short staircase with one step missing, a figure's footprint on the step above. |
| Foundations Poured | epic | A concrete slab, freshly poured, with a trowel mark. |
| Book Ready | epic | A bound book, closed, with a ribbon marker. |
| Ties Out | epic | Two small columns of figures with a zero between them in a circle. |
| Data Room | epic | A folder with a small key on its tab. |
| Three Statements | epic | Three pages fanned in a stack, corners offset. |
| The Bid | epic | A sealed envelope with a wax seal. |
| Verified: Formatting | rare | The stopwatch with a check, the face tinted the chapter's color. |
| Verified: Formulas | rare | The same stopwatch, the chapter's color. |
| Verified: Data and Lookups | rare | The same stopwatch, the chapter's color. |
| Verified: Finance and Accounting | rare | The same stopwatch, the chapter's color. |
| Verified: Valuation | rare | The same stopwatch, the chapter's color. |
| Certified | legendary | A round certificate seal with a ribbon tail, gold. |
| Clean Sheet | common | A single spreadsheet cell, empty and white, with a sparkle in one corner. |
| Hands Off | rare | A computer mouse with a diagonal line through it. |
| Untouched | epic | A white glove, palm out. |
| Against the Clock | common | A plain stopwatch, running. |
| On the Range | common | A three-ring target with no arrow. |
| Tourist | rare | A small suitcase with a travel sticker. |
| On the Board | common | A leaderboard with one filled row. |
| Collector | epic | A row of three medals on ribbons. |
| Keyring | rare | A ring of four small keys. |
| Cleared | common | A green traffic light, lit. |
| Expert | rare | A blue diamond gem, faceted. |
| Legendary | epic | A gold diamond gem, faceted, with a glint. |
| Heating Up | epic | A single flame with three tongues. |
| Untouchable | legendary | A crown with three points. |
| Showed Up | common | A single calendar page with one day marked. |
| Regular | rare | A calendar strip of seven days, all marked. |
| Fixture | epic | A full calendar month, every day marked. |
| Momentum | rare | A running figure in profile, mid-stride. |
| No Wasted Keys | rare | A keycap with a small star above it. |
| Economist | epic | A small abacus with a few beads slid across. |
| Quick Draw | common | A single lightning bolt. |
| Live Wire | rare | A lightning bolt with a small burst behind it. |
| In the Zone | rare | A chain of linked rings, ten links if they fit, fewer if they don't. |
| Perfect Round | epic | A lightning bolt inside a circle. |
| First Quest | common | A rolled scroll with a ribbon. |
| Questing | rare | A stack of three scrolls. |
| Clean Sweep | epic | A broom, bristles down, with two motion lines. |
| Volume Business | rare | A ledger, open, with ruled columns. |
| Warming Up | common | A small candle flame. |
| Committed | rare | A campfire flame. |
| Seasoned | epic | A pepper mill. |
| Top Bucket | legendary | A bucket with a gold star on its side. |
| Blink | epic · hidden | A single open eye. |
| Goblin Hours | rare · hidden | A crescent moon over a monitor, the screen lit. |
| First One In | rare · hidden | A sunrise: half a sun over a flat line with three rays. |
| Weekend Warrior | common · hidden | A hammock strung between two posts. |
| Old Habits | common · hidden | A computer mouse with a crack across its shell. |

### 6.8 Boards and rank

A board for every drill, every challenge and the Daily (Wolf, 2026-10-01: the board's columns are time against the field, gap to first and keys, not tier marks; 3.0, "Leaderboards"); clean runs only; ranked by time, then keys, then the earlier run; real people only. The rank ladder (MBA Associate to Second-Year Analyst) is retired at launch: it was an in-joke that hands the learner a job title, and Wolf isn't attached to it. Before launch the boards are seeded with real times from real accounts (Wolf and testers), never synthetic rows. If competition needs a single number later, the simplest one is the average of your board placements on the benchmark drills, shown as a percentile on your profile; revisit once a benchmark board has a hundred players. Rank.js and the "Reach MD" theme unlock go (M11 becomes: remove rank; re-key Crimson to Top Bucket).

### 6.9 Themes and unlocks

Eight themes free from the first visit; the rest unlock every three levels, plus four specials: Bloomberg for completing Chapter 1, Terminal for a Legendary clock, Synthwave for a ten-hit combo, Crimson for Top Bucket (level 30). Lock labels: "Unlocks at level {n}", "Complete Chapter 1", "Beat a Legendary clock", "A ten-hit rapid-fire combo", "Reach Top Bucket".

### 6.10 XP, levels and rewards DRAFT

Wolf, 2026-09-27: quests need a dopamine loop (progress bars, completion animations, rewards), and XP has to be worth something. Claude's proposal, pending Wolf. The principle: XP measures how much you've practiced; the boards measure how fast you are. XP never gates a lesson.

**What XP does, three things.**

1.  **Your level sits next to your handle** on every board, in the rail and on your profile, so a Legendary time from a level 3 and a level 24 read differently.
2.  **Every level pays flair** (Wolf, 2026-09-27: every level gives some flair; repurpose the best skins and content from the old build). A flair catalog of thirty items built from what already exists and what's cheap to add: the old build's themes (Bloomberg, Terminal, Synthwave, Crimson and the rest), keycap skins for the task card, ghost-cursor colors and trails, header styles for the result panel, board flair beside the handle, sound sets, a profile frame. Mapped one per level so nothing repeats: every third level a theme (the existing ladder, kept), the levels between them a skin, a color, a panel style or a sound set; 10 the profile frame, 20 the ghost trail, 30 Top Bucket (the Crimson theme and the certificate frame). The build session inventories the old build's cosmetics first and fills the catalog from the best of them (M60). Nothing sold; nothing cosmetic is ever paid for (pricing terms).
3.  **It's the currency of the quest loop** (6.6): quests pay in bursts, the Level panel fills as XP lands, and a level-up is its own row in the result panel.

**Where it comes from** (per run; replaces the four stories in M10):

| Run | XP |
| :- | :- |
| Lesson complete | 50, +10 if clean |
| Challenge passed | 50, +25 at Expert, +50 at Legendary (first time at each tier) |
| Drill, first clean pass | 40; 5 on a repeat |
| The Daily | 30 |
| Rapid-fire round | 10 |
| Daily quest | 25; all three in a day, +50 and a streak day |
| Weekly quest | 75; all three in a week, +150 and one roll on the reward table |
| Achievement | 0: the shelf is its own reward |

**The curve.** Level n to n+1 costs 150 × n XP (cumulative about 75n²), so the early levels come fast and the late ones are earned: level 5 at about 1,900 XP (the middle of Chapter 1), level 10 at about 7,500 (Chapter 1 done, with some practice), level 20 at about 30,000 (three chapters and steady practice), level 30 at about 68,000 (all six chapters and months of drills). Recalibrate from real accounts after launch, the way the pars are (M24).

**Level titles** (Wolf, 2026-10-01: find or rewrite them; Claude's draft, M103). The old rank ladder handed the learner a job title and is retired. These name a stage of getting fast in Excel instead, in the course's own words, and change every third level with the theme:

| Levels | Title | What arrives at the first level of the band |
| :- | :- | :- |
| 1 to 2 | New Workbook | Workbook, Daylight and six more themes |
| 3 to 5 | Arrow Keys | A theme |
| 6 to 8 | Ctrl+Arrow | A theme |
| 9 to 11 | Mouse Retired | A theme |
| 12 to 14 | Alt Native | A theme |
| 15 to 17 | Chord Player | A theme |
| 18 to 20 | Live Links | A theme, and the ghost trail at 20 |
| 21 to 23 | Ties Out | A theme |
| 24 to 26 | Model Owner | A theme |
| 27 to 29 | Hard Clock | A theme |
| 30 | Top Bucket | Crimson and the Top Bucket frame (Wolf's phrase) |

The levels between a band's first carry the smaller flair (keycap skins, sounds, board flair, the profile frame at 10). The title shows on the profile and in the level-up row, never on a board.

**The level-up moment** (M60): a row rises inside the panel where the run or lesson ended, in the lesson green: the new level, its reward drawn (a keycap skin shows as a keycap), and Equip (E) when the reward is something to switch on. Copy: "Level {n}" and "{reward} is yours."; "Next: level {n+1} at {xp} XP" in the Level panel on Home. No exclamation marks and no overlay; the animation does the celebrating.

**The quest loop** (M59): every quest is a row in Home's Today panel with a bar that fills live. A drill finishing ticks "Finish two drills" from 1 of 2 to 2 of 2 in the result panel, before the learner is back on Home. Completion: the bar fills, the row ticks with a soft sound, and the XP counts up into the Level panel. All three daily quests done: the bonus row drops in, pays the bonus and adds a streak day. All three weekly: the bonus and one roll on the reward table (a theme, a keycap skin, a board flair the learner hasn't got). The copy sits in the rows, each fact in its own place: the quest's XP at its right ("+25"); the bonus row "Bonus for all three" with "+50 XP"; the weekly row "Weekly clear" with "+150 XP" and the reward named under it. Tomorrow's quests show at midnight UTC with the Daily.

## 7. The red pen: chips and correction lines

The instructor's voice at its most direct. The chip is the one-line rule the red pen shows beside the cell (3.0, "The pen"); the correction line is what a challenge says when a convention broke; the reviewer's flag is what the print preview says at the end of a project. Rewritten in the voice 2026-09-27 (work plan 5): every line is **DRAFT** with the live line under it as *was:*. Hardcoded today (content/conventions.js and app/graders.js), so M1 before any of it goes live. The register is Wolf's correction line: "The revenue in D14 is a typed, static value, and should be blue to show that it's hardcoded." What broke, then the rule, then why it matters to the reader. One line, no scolding. Contractions on (9.1, question 1). "House" is gone; the standard is "the standard".

### 7.1 Convention chips

The rule is the tooltip; the chip is the short line on the card. The chip has to make sense to someone who hasn't read the rule.

| **Code** | **Rule (tooltip)** | **Chip text** | **Was** |
| :- | :- | :- | :- |
| *A1* | Set Excel up before you build: Automatic calculation, iteration on, Enter stays on the cell. | Set up once: Automatic, iteration on, Enter stays put | Set Excel up before you model · Set up once: calc mode, iteration, defaults |
| *A2* | Your four formatting commands live on the Quick Access Toolbar, so Alt and a number runs them. | Alt and a number beats a four-key chord | The QAT holds your formatting commands · Alt+number beats a long Alt chord |
| *A3* | Gridlines go off on any page someone else reads; borders carry the structure. | Gridlines off on a page someone reads | Gridlines off on a page someone reads · Borders carry structure, not gridlines |
| *A4* | Tabs are named for what they hold and run left to right in reading order: outputs first, data last. | Name the tabs; outputs left, data right | Descriptive tab names, logical order · Name the tabs; outputs left, data right |
| *A5* | Keyboard first. The mouse is for reading a page, not building one. | The mouse is for reading, not building | Keyboard first · The mouse is for reviewing, not building |
| *A6* | Save a new version as you go; never write over the only copy. | v03, never "final" | Save versions as you go · Never overwrite the only copy |
| *B1* | Typed values are blue and formulas are black, so a reader knows what they're allowed to change. | Typed is blue, formulas are black | Blue inputs, black formulas · Inputs blue, formulas black |
| *B2* | A link to another sheet is green; a link to another workbook is red, and the standard avoids them. | Links green; links to other files avoided | Green links to other sheets · Links green; external links avoided |
| *B3* | A light fill marks the block of inputs a reader may change; it never carries meaning about a value. | The tint says "change these" | Inputs may carry a light fill · A tint marks the input block |
| *B4* | No number typed inside a formula: the input gets its own cell and the formula points at it. | One input, one cell; the formula points at it | No hardcodes inside formulas · One input, one cell; formulas reference it |
| *B5* | Actuals and estimates look different on the page: mark the divider. | Mark the A/E divider | Actuals and estimates look different · Mark the A/E divider |
| *B6* | Every typed value carries its source, in the next cell or a note, so the next person doesn't have to ask. | Where it came from, in the next cell or a note | Document every hardcode · Label the source ("per utility contract") |
| *C1* | Inputs feed calculations and calculations feed the page, in that order, left to right. | Inputs feed calcs; calcs feed the page | Inputs → calculations → outputs · Inputs, calcs, outputs — in that order |
| *C2* | One timeline row across the top, and every period column the same width. | Timeline on top, one width across | One timeline row, equal period columns · Timeline on top, equal widths |
| *C3* | One formula per row, written once and filled right; a row you can't fill is a row you can't trust. | Write it once, fill it right | One formula per row, filled right · Write once, fill right |
| *C4* | One sign convention, stated once near the top: income positive, costs negative. | Costs negative, said once up top | One sign convention, stated · Income positive, costs negative |
| *C5* | The units are stated once near the top, so no figure has to explain itself. | "USD unless stated", near the top | Units stated once · A units line: "USD unless stated" |
| *C6* | Long sheets beat many tabs; schedules feed statements and never read back from them. | Schedules feed statements, never back | Long sheets over many tabs · Schedules feed statements, never back |
| *C7* | Group, don't hide: a hidden column gets forgotten, a grouped one gets found. | A grouped column gets found; a hidden one doesn't | Group, don't hide · Hidden columns get forgotten |
| *C8* | Freeze panes on a long sheet so the heads never scroll off. | Keep the heads in view | Freeze panes on long sheets · Keep the timeline and labels in view |
| *C9* | Names for a few key inputs and toggles only, never for everything. | Name the toggle and the price, not everything | Named ranges, sparingly · Name toggles and key inputs only |
| *D1* | Negatives read in parentheses, never with a leading minus. | (1,250), never -1250 | Negatives in parentheses · Parentheses, never a leading minus |
| *D2* | One decimals setting down a line: 41.2% sits next to 38.7%, never next to 39%. | Decimals match down a line | Consistent decimals down a line · One decimals setting per line |
| *D3* | A zero reads as a dash, so the eye finds the figures that matter. | A dash, not 0.0 | Zero shown as a dash · A dash, not 0.0 |
| *D4* | The currency sign sits on the first and total rows of a money column and nowhere in between. | $ on the first and total rows only | Currency symbol first and total rows only · $ on the first and total rows |
| *D5* | A total is bold with a top border; a grid is never structure. | A top border, never a grid | Totals bold with a top border · A top border, never an all-borders grid |
| *D6* | Sub-items are indented with the indent button, and a header sits the way its numbers sit: right over figures. | Indent sub-items; right-align headers over figures | Indent hierarchy, right-aligned headers · Indent sub-items; headers over numbers |
| *D7* | Center Across Selection, never Merge & Center: a merged cell breaks selection, fill and sort for everyone after you. | A merged cell breaks selection, fill and sort | Center Across Selection, never merge · Merged cells break everything |
| *D8* | One font, one size; the title is the one cell a size up, and color is never decoration. | One font, one size; only the title goes up | One font, one size · No color for decoration *(the two lines didn't match; now they do)* |
| *D9* | Units live in the number format (k, m, x, bps), not in typed text. | Units in the format, not typed | Custom formats do the labelling · Units live in the format, not typed text *("labelling" fixed)* |
| *E1* | Build a reference by pointing at the cell, never by typing its address; F2 reads it back. | Arrow to the cell; F2 to read it back | Point, don't type · Build references by pointing; F2 to read back |
| *E2* | F4 sets the anchor while the formula is open: $C$5, C$5, $C5, C5. | Four states, one key | F4 anchors while typing · Know the four anchor states |
| *E3* | Fill, don't retype: Ctrl+D down, Ctrl+R across. | Ctrl+D down, Ctrl+R across | Fill, don't retype · Ctrl+D down, Ctrl+R across |
| *E4* | Paste Special on purpose: values for a snapshot, never over a live formula. | Values for a snapshot, never over live formulas | Paste Special on purpose · Values to snapshot, never over live formulas |
| *E5* | AutoSum the block plus its empty edge and every column totals at once. | Alt+= once, every column at once | AutoSum the block plus its edge · Alt+= once, across the block |
| *E6* | MIN and MAX before a nested IF; OFFSET and INDIRECT stay out of a model someone else has to read. | MIN/MAX, not an IF tower; nothing volatile | No nested-IF towers, no volatile functions · MIN/MAX or a lookup instead |
| *E7* | No links to other workbooks; check for stray ones before you send. | Check for stray links before sending | Avoid external workbook links · Check for stray links before sending |
| *E8* | Circularity only on purpose: iteration on, with a breaker cell to switch it off. | Iteration on, with a breaker | Circularity only on purpose · Iterative calc + a circuit breaker |
| *E9* | One model with a case toggle, never three copies of the file. | One toggle, never copies of the file | Scenarios in one model · A case toggle, never copies of the file |
| *F1* | A checks row wherever two things must agree: a live difference that reads zero. | A live difference that reads zero | A checks row wherever two things must agree · The check is a live difference → 0 |
| *F2* | Never plug: cash balances the sheet, and nothing is forced. | Cash balances the sheet; nothing is forced | Never plug · Cash balances the sheet; nothing is forced |
| *F3* | Hunt the hardcodes before you send: Go To Special, show formulas, trace. | Go To Special, show formulas, trace | Hardcode hunt before you send · Go To Special, show formulas, trace |
| *F4* | Sense-check the magnitudes: one site doesn't do $81,500 in a day. | Read the page before anyone else does | Sense-check magnitudes · Read the page before anyone else does |
| *F5* | Read what Excel tells you: the count after a Replace All, the AutoSum proposal, the error code. | The count, the proposal, the error code | Read what Excel tells you · The count, the proposal, the error code |
| *G1* | The print set-up is part of the page: fit to one, print titles, file and date in the footer. | Fit to one, titles, footer | Print set-up is part of the model · Fit to page, titles, footer |
| *G2* | A page reads the way a reader reads it: title, units, timeline, then the answer. | Title, units, timeline, then the answer | A page reads like an MD reads · Title, units, timeline, then the answer *("MD" out)* |
| *G3* | Labels and footnotes are consistent to the character; detail is the first thing a reader judges. | Detail is judged first | Consistent labels and footnotes · Attention to detail is judged first |
| *G4* | The title says the answer, not the topic: "Margin held at 41%", not "Margin". | The title says the answer | new (M17) |
| *G5* | A source line sits under every table: where the numbers came from, in one line. | A source under every table | new (M17) |
| *G6* | Round to what the decision needs: thousands for a board, cents for a ticket price. | Round to the decision | new (M17) |

### 7.2 Correction lines

Shown beside the pen's mark on the cell and in the result panel when a grader fails. {ref} is the cell; {first} is the first cell in the line it's compared with. Retuned 2026-09-27 to Wolf's four blind lines (section 2, calibration): what the cell is, in plain words with the desk word beside it ("a hardcode, a static number"), then why we do it, for the person reading the sheet. "We" is the class. Two sentences allowed.

| **Line (DRAFT)** | **Was** |
| :- | :- |
| {ref} was typed into the cell. It's a hardcode, a static number, so we use blue to emphasize to anyone reading the sheet that it's a hardcode. *(Wolf)* | {ref} is an input shown {color\|black} — inputs are blue |
| {ref} holds a formula. A formula can use data in other cells as its input, so we leave it black to show it's calculated, not typed. *(Wolf, completed)* | {ref} is a formula shown in blue |
| {ref} is green, but it only reads cells on this sheet. We use green for a link that pulls data from another sheet, so a reader knows where a figure comes from. | {ref} is green but not a pure link line |
| {ref} holds a formula but shows in {color}. We keep formulas black so each color on the page means one thing. | {ref} is a formula shown in {color} |
| {ref} has {n} typed inside the formula. A number inside a formula is a hardcode nobody can see, so we give it a cell of its own and point the formula at it. | {ref} has {n} typed inside the formula — inputs live in their own cell |
| {ref} breaks its row's pattern. We write one formula per row and fill it right, so anyone reading the row can trust every cell in it. | {ref} breaks its row's formula — one formula per row, filled right |
| {ref} shows a negative sign. Format Cells (Ctrl+1) sets how a number shows: decimal places, commas, and how a negative reads. On a page we show negatives in parentheses, so they stand out without a stray minus. *(Wolf, made specific)* | {ref} shows a minus — the house uses parentheses |
| {ref} shows {d} decimals while {first} shows {want}. We keep one decimals setting down a line, so the figures line up and read as one column. | {ref} shows {d} decimals against {want} at {first} — decimals are consistent down a line |
| {ref} shows a zero as {txt}. We show a zero as a dash, so the eye goes to the figures that matter. | {ref} shows a zero as {txt} — zero is a dash |
| {ref} carries a $. We put the currency sign on the first and total rows of a money column only, so the page isn't a wall of symbols. | {ref} carries a $ — the currency sign sits on the first and total rows only |
| {ref} has no $. The first and total rows of a money column carry the currency sign, so a reader knows what the column is in. | {ref} has no $ — the first and total rows carry the currency sign |
| {ref} shows a cost as a positive. We show costs as negatives and say so once at the top, so the page adds down without anyone guessing the signs. | {ref} shows a cost as a positive — costs are negative, stated once up top |
| The sign convention isn't stated. We say once, near the top, that costs are shown as negatives, so a reader never has to work it out. | the sign convention is not stated — say once in the top rows that costs are shown as negatives |
| Gridlines are on. We turn gridlines off on a page someone else reads, so the borders we chose are the only lines they see. | gridlines are on — a page someone else reads has them off |
| {ref} sits inside a grid. We give a total a top border and the block no grid, so every line on the page carries meaning. | {ref} carries a grid border — a total gets a top border, the block gets none |
| {ref} has no title. A page says what it is before it says anything else. | {ref} has no title |
| {ref} was centered with spaces. We use Center Across Selection to center a title, so Find, sort and every reference to the cell still work. | {ref} is padded with spaces — Center Across Selection, never a merge |
| {ref} isn't centered across {n} columns. We use Center Across Selection instead of merging cells, because it keeps the sheet resilient: a merged cell drags its neighbors with it when a row or column is inserted or deleted, so everything around it shifts, while a centered one leaves every cell where it is. *(Wolf, made eloquent)* | {ref} is not centered across {n} columns — Center Across Selection, never a merge |
| {ref} is a header sitting left over numbers that sit right. We align a header the way its figures are aligned, so it sits over them. | {ref} is a header over numbers that is not right-aligned |
| {ref} is a percentage line that isn't italic. We set percentage lines in italic on this page, so ratios read differently from dollars. | {ref} is a percentage line that is not italic |
| {ref} is a sub-item that isn't indented. We indent sub-items with the indent button, never with spaces, so the hierarchy reads and sorting still works. | {ref} is a sub-item that is not indented |
| {ref} is a different font size from {first}. We keep one size across the page, so the title is the only thing that stands taller. | {ref} is a different font size from {first} — one size across the page |
| {ref} is a title no bigger than the page. We take the title one size up and nothing else, so a reader knows where the page starts. | {ref} is a title smaller than the page — one size across, the title may be larger |
| The {sheet} sheet is missing. The page reads it, so nothing on the page can tie without it. | the sheet is missing |
| {ref} is a total without a top border. We mark a total with a top border, so a reader sees where a block adds up without reading the formula. | {ref} is a total without a top border |
| No units line. We say once, near the top, what the figures are in ("USD unless stated"), so no figure has to explain itself. | no units line — state the currency once in the top rows ("USD unless stated") |
| {ref} is a typed 0 where a check belongs. A check is a live difference between two things that must agree, so it has to be a formula or it checks nothing. | {ref} is not a formula — a check is a live difference, not a typed 0 |
| {ref} doesn't move with its inputs. It's a typed number where a live formula belongs, so the next feed will leave it stale. | {ref} does not move with its inputs |
| {ref} reads {v}. The check doesn't tie, so something it compares has moved; follow the trail with Ctrl+[. | {ref} reads {v} — the check does not tie |
| Column {X} is hidden. We group a column instead of hiding it, so a reader can see there's something there and open it. | column {X} is hidden — group it instead |
| Row {n} is hidden. We group rows instead of hiding them, so nothing on the page is a surprise. | row {n} is hidden — group it instead |
| {ref} is a typed number where a live formula belongs. The next feed will leave it stale, and nobody will know. | {ref} is a typed number where a live formula belongs |
| {ref} changed. Fix the faults and nothing else, so the reviewer can see exactly what moved. | {ref} changed — fix the faults and nothing else |

### 7.3 The reviewer's flags (print preview, end of the project)

The reviewer is a role that advances with the deal (M55): the CFO in Chapter 1, the associate on the bankers' team from Chapter 2, the buyer's analyst from Chapter 3. **DRAFT**: "Nothing to flag: {the CFO} would have signed it off as it is." / "{The CFO} would have sent it back for {what}." where {what} is one of: {ref} is empty where a formula belongs · {ref} holds something the page doesn't need · {ref} doesn't hold the formula the page needs · {ref} holds a formula where a value belongs · {ref} doesn't match the feed · {ref} is the wrong color for what it holds · the number format on {ref} · the formatting on {ref} · the column widths · the row heights · gridlines still showing · the panes not frozen at the heads · the outline · a hidden column · a hidden row · the print set-up · the sheet order. *was: "Nothing to flag: the associate would have sent it as it is." / "The associate would have flagged {what}." with "{ref}'s number format is off the house style" and "{ref}'s formatting is off the house style".*

## 8. Issues in the live copy

Found in the 2026-09-27 sweep of the sheets and the code. Each is fixed by the voice pass (a copy edit) or by a mechanics request in section 9.

### 8.1 Words the voice rules out

  - **"House" as in house style.** Chapter 1: 1.1.C and 1.4.C briefs ("to house standard"), the 1.1 beat, the 1.1.4 teach line ("House rule: anything typed is blue"), the "House Style" achievement, the grader line "the house uses parentheses", two print-preview flags ("off the house style"), and PAID_LINE ("the house formatting"). Chapter 2: 2.1.2, 2.1.3, 2.1.C, 2.2.1, 2.2.4, 2.2.C (title and brief), the 2.2 module objective, beat and page name ("The house number-format set"), and two goals ("the house plain code").
  - **"First-year".** The rank ladder's "First-Year Analyst" (rank 3) and the frame label "First-Year". SITE_SPEC section 7 also calls the learner "the first-year analyst"; that's internal, but it's where the builder sessions picked it up.
  - **British spellings.** Achievements "Practise seven days in a row"; chip D9 "labelling"; drills "centre" and "centred" (Number formats, The weekly sales report), "misspelt" (Find and fix), "Bounce round" and "round the same table"; reference "models colour inputs blue"; Teams and Pricing "organiser", "organisation"; legal "practise", "licence", "two working days". The print-preview footer fills the date as DD/MM/YYYY. Micro-drills and lessons use "w/c 15 Sep" (week commencing), which is British business shorthand; the lessons gloss it, the micro-drills don't.
  - **"You are the analyst".** The landing's Project Volt sub gives the learner a job title. Drafted out in 3.1.
  - **Dashes.** Many live system lines join two clauses with an em dash ("Over the limit — no tier."). The punctuation dial allows one per paragraph; most of these want a period or a colon. Section 3 drafts them out.
  - **Stacked fragments.** Wolf, 2026-09-27: lines like "New week, blank Report, nothing new to learn" read as a tic. Swept from Chapter 1's story cards and done screens; the rule is in section 2.

### 8.2 Lines that contradict the conventions

  - **Bold and borders** (drill, taught-in tag 1.5, Daily pool): the whole drill is All Borders plus a Thick Outside Border, the grid the conventions forbid. M4.
  - **The weekly sales report** (drill, benchmark, Daily pool): All Borders, a gray header fill (against "no color for decoration"), and the total row never gets a top border. M5.
  - **Row wrangler** (drill, taught-in tag 1.4): ends with the Notes column hidden, against "group, don't hide". M6.
  - **Chip D8**: the rule is "One font, one size"; the chip text says "No color for decoration". One of them is the wrong line.

### 8.3 Lines that are out of date

  - Teams: "Sign-in arrives in the next phase; desk creation follows it." and "Joining opens with accounts in the next phase."
  - Account: "Desks arrive after accounts." and "The public profile page arrives with accounts."
  - Leaderboard, School and Desk tabs: "Boards open with accounts."
  - About › The loop: "Read, do it guided, do it solo, race the clock", the retired loop. The module challenge replaced solo and timed lessons.
  - Achievements solo-1, solo-5 and solo-20 count "solo" lessons, a mode that no longer exists.

### 8.4 Things told more than one way

  - **Where XP comes from.** Four versions: the nav chip (lessons, drills and the Daily), the workspace strip (lessons, challenges and the Daily), Home and the orientation card (lessons and challenges only). The code pays lessons 50, challenges 50, first clean drill 40, the Daily 30, a rapid-fire round 10; achievements and micro-drills pay nothing. M10.
  - **Foundations or Chapter 1.** Both are used for the same thing, and the drill bar shows the raw id "foundations". Open question 5.
  - **What each chapter covers.** The landing's free list, the pricing free list and the Learn teasers describe Chapter 1 three different ways.
  - **Certificates.** The landing says "Completed and Verified"; pricing says "Chapter assessments and Verified certificates".

### 8.5 Copy the sheets can't reach yet

  - The drill catalog, micro-drill titles and goals, achievements, convention chips, correction lines, print-preview flags, deal-strip stages 2–6, the rank ladder, and most page chrome (Home, Learn, Practice, the workspace, the overlays) are hardcoded. Edits to them need M1 before they can go live.
  - On Learn, the section blurbs in content/index.js show instead of modules.csv objectives. M2.
  - Home's Due list reads the micro-drill task from code, not micro.csv. M3.

## 9. Decisions

### 9.1 Open questions

Each carries Claude's working answer so the writing doesn't wait. Overrule any of them in one line of chat; the session applies it everywhere.

1.  **Contractions everywhere?** Including goal lines, hints and correction lines. Proposed: yes, everywhere but legal. *Answer:* *Claude's call (2026-09-27), pending Wolf:* Yes, everywhere but legal. Goal lines are imperatives and rarely need one; the correction lines are where it matters most.
2.  **"Now make it look like a banker built it."** Is that the right amount of banker, for the 1.5 beat and as the dial setting? Proposed: yes; it's the one place the chapter names the standard it's copying. *Answer:* *Claude's call (2026-09-27), pending Wolf:* Yes, for the 1.5 beat and the dial: the one place the chapter says whose standard it's copying. The rest of 1.5 says "the format the team uses".
3.  **The rank ladder.** MBA Associate up to Second-Year Analyst ("the true final boss") is an in-joke from the old build; it's tongue-in-cheek, and it assumes the learner knows a bank's hierarchy. Keep it as the one banker joke, rename the ranks (plain tiers, or Excel-flavored names), or drop names and show tiers only? Proposed: keep the ladder's shape, drop the jokes in the requirement lines, and rename "First-Year Analyst". *Answer:* *Settled (Round 5):* rank is retired at launch (M22).
4.  **Hidden achievements.** "Goblin Hours" and "Old Habits" are the only jokes on the site. Keep them as the sanctioned exception, since they're hidden and earned? Proposed: keep. *Answer:* *Claude's call (2026-09-27), pending Wolf:* Keep. Earned, hidden, and they never wink at someone mid-lesson.
5.  **Foundations or Chapter 1?** Pick one for learner-facing use. Proposed: "Chapter 1" in running text, "Foundations" only as the chapter's title. *Answer:* *Claude's call (2026-09-27), pending Wolf:* Chapter 1 in every sentence; Foundations only as the chapter's title (achievement names and the test-out title can keep it).
6.  **Module 1.6 beat at four sentences.** Keep, or cut "Right now the Report is typed numbers…"? Proposed: cut. *Answer:* *Claude's call (2026-09-27), pending Wolf:* Cut a different sentence. "Right now the Report is typed numbers…" is the why, and the beat card is where the why lives; the syllabus sentence ("SUM and its relatives, F4 to anchor…") goes, since the objective line carries it. Applied in the Chapter 1 Script.
7.  **Move hardcoded copy into the sheets (M1).** Approve before the voice pass reaches Practice, achievements and the red pen, or those edits can't go live. Proposed: yes. *Answer:* *Claude's call (2026-09-27), pending Wolf:* Yes, and it's a build decision more than a copy one: without it parts 5–7 are drafts that can't go live.
8.  **Excel-formula jokes.** The 404 ("=IFERROR(this_page, #REF!)", "That reference does not resolve.") and the paywall ("=IF(paid, open, "locked") → locked") are light and on-brand, but they are jokes. Keep? Proposed: keep; they're the site's only personality outside the lessons and they don't wink at the learner. *Answer:* *Claude's call (2026-09-27), pending Wolf:* Keep the 404, drop the paywall one. An error page can afford a line of personality; a paywall is asking someone for money, and a joke there reads as a wink at their expense. Drafted in 3.13.
9.  **"w/c" (week commencing).** British business shorthand in the feed labels. Keep as data (it's what the file says), or change the workbook to "Week of"? Proposed: "Week of", a mechanics change to the workbook. *Answer:* *Claude's call (2026-09-27), pending Wolf:* "Week of", as a workbook change (M14), since the label sits in graded cell values. Same change: "15 Sep" is day-month order, which is British too; "Week of Sep 15" matches the MM/DD footer in M7.
10. **The company name.** Brightwash is out (Wolf, 2026-09-27: it resembles a real business). *Answer:* *Decided (Wolf, 2026-09-27):* Clearcoat Express, picked from Claude's three names, after a search found no car wash trading under any of them. Applied everywhere in this doc and the Chapter 1 script. Trademark search before ship.
11. **Pricing shape.** Wolf, 2026-09-27: chapters at a flat fee (the Wizard101 model) or $7 a month, or both; he asked for Claude's best suggestion, which was two doors ($19 a chapter; Pro $59 once or $9 a month). *Answer:* *Decided (Wolf, 2026-09-27):* step it down to a decent Steam game – **$29 to own the whole course, or $10 a month.** One plan, Pro; no per-chapter door at launch (at $29 for six chapters it would only add checkouts). Claude's notes: no student price at launch (3.0, 2026-10-01); DLC chapters later at $9–15 each, included while a monthly plan runs and discounted for owners; entitlements still per chapter (M58) so DLC drops in; the 14-day guarantee stays; the accountant confirms sales tax with the merchant of record; nothing on the live pricing page changes until Wolf says go. *The earlier recommendation, kept for the record:* two doors, flat prices, one upgrade path. **Own a chapter: $19**, yours for good, with its drills, its boards and its Verified certificate (Chapters 2–6). **Pro: $59 once for all six chapters, or $9 a month** while you want it; students $39 once or $6 a month. A chapter you've bought counts toward Pro for 30 days, so a $19 start is never a mistake. DLC chapters later (4.9) sell at chapter price, are included in the monthly plan while it runs, and go to one-time Pro owners at a discount – which is Wizard101's model exactly: a membership gets every world, or you buy worlds outright and keep them. Why this shape: usage is front-loaded (most learners finish in one to three months), so a monthly plan on its own earns one to three payments and then fights churn on a finite course, while a one-time price captures what an incoming analyst will pay for certainty before a start date; every competitor sells Excel one-time (WSP $39, WSO $97, BIWS $197), so one-time is the buyer's mental model, and at $59 for sixteen graded hours hotkey.gg still undercuts all but WSP; $1–2 a chapter reads as app-store filler, undersells three to four hours of built lessons with a certificate, and loses about 30% to processor fees (a merchant of record takes roughly 5% plus 50¢, so 60¢ of a $2 sale against $1.45 of $19); per-chapter pricing works here because each chapter is 3–4.5 hours with its own workbook and its own certificate. Start at these prices and discount later if the data says so; raising is harder. Teams stay per seat, annual, quoted. Build entitlements per chapter from the start with Pro as a plan that grants all six (M58), so any of this is a pricing-page change, not a schema change. The accountant confirms the sales-tax position with the merchant of record (rebuild-direction 5). The copy in 3.13 now carries Wolf's numbers.
12. **Dynamic arrays.** UNIQUE, FILTER, SORT and SEQUENCE are in modern Excel and the bootcamps are starting to teach them; banks lag versions, so the classic tools stay first. *Answer:* *Claude's call, pending Wolf:* one lesson at the end of 4.2 ("4.2.6 UNIQUE, FILTER and SORT: the modern list tools"), taught as the newer route after Remove Duplicates and AutoFilter, engine permitting (M61).
13. **The headline.** *Decided (Wolf, 2026-10-01):* "The better way to master Excel", his own landing line from calibration Round 6, over the 2026-09-23 pick "Excel isn't learned. It's practiced.", whose "not X, Y" shape reads as machine-written. The old line stays behind ?h=2 and "The better way to learn Excel" behind ?h=3.
14. **The default theme.** *Decided (Wolf, 2026-10-01):* Workbook, with a soft paper ground (pure white read as harsh) and a color for each mode; Daylight and the rest stay as themes to pick or earn.
15. **The first run.** *Decided (Wolf, 2026-10-01):* three steps: the set-up screen, one story card with his line, lesson 1.1.1.
16. **The nav.** *Decided (Wolf, 2026-10-01):* a dark left rail like chess.com's, words only, with Practice's four modes always listed and the account opening its own pages; KeyTips on Alt for every site page. It replaced the two-row Ribbon-style top nav after round 4.
17. **The existing Ribbon.** *Decided (Wolf, 2026-10-01):* it stays as built, at the live site's compact height, with the Quick Access Toolbar moved to its own row below it; it takes the new tokens and typeface and nothing else.
18. **Drill length.** *Decided (Wolf, 2026-10-01):* one to five minutes. Chapter 1's twelve built drills are merged into eight, with three sketches from 6.2b added: eleven drills of one to three minutes (6.1).
19. **Certificates.** *Decided (Wolf, 2026-10-01):* one certificate for the course, with the chapters as progress toward it, and Add to LinkedIn on issue; no chapter certificates.
20. **Boards.** *Decided (Wolf, 2026-10-01):* time against the field, gap and keys; tier marks only on personal views.

### 9.2 Decided

  - Headline: "Excel isn't learned. It's practiced." (founder, 2026-09-23); replaced on 2026-10-01, below.
  - One narrative, Project Rinse, across six chapters. Roles, never named characters, never the learner's job title.
  - Inclusive means the content works for anyone. The copy doesn't hedge about who the learner is (founder, 2026-09-26).
  - The voice is the in-person analyst course: spoken, a mentor or professor, not a written document (founder, 2026-09-26).
  - American spelling. No "house style", no "first-year". Excel's own names for things.
  - The screenplay lives in this project (claude/screenplay.md plus one script per chapter), not in Google Docs; the founder approves in chat (2026-09-27).
  - Every brief ends "The key is `X`." (Claude, 2026-09-27; the live briefs ended five different ways).
  - Sentences with verbs in lesson prose; stacked fragments only on game surfaces (founder, 2026-09-27), each in its own place on the screen (3.0, 2026-10-01).
  - No dash as punctuation in anything a learner reads; the interface follows the standard in 3.0 (founder, 2026-10-01).
  - The interface standard (3.0) is approved for build, to be adjusted in code once the content is in (founder, 2026-10-01).
  - The headline is "The better way to master Excel" (founder, 2026-10-01).
  - The case stays inside the lessons as the worked example; site pages don't feature Project Rinse (founder, 2026-10-01).
  - The plan is Pro; the drill tiers are Pass · Expert · Legendary (founder, 2026-09-27).

### 9.3 Mechanics requests

For a build session. Each changes code or a task, not just words.

1.  **M1 Move hardcoded copy into the sheets.** Drill titles, tasks and goals; micro-drill titles and goals; achievements; convention chips; correction lines; print-preview flags; level titles; and the voice-bearing chrome on Home, Learn, Practice, the workspace and the panels. Add site.csv keys or new sheets, keep the checker.
2.  **M2 Learn objectives.** The content/index.js section blurbs shadow modules.csv objective. Make the sheet win.
3.  **M3 Due today on Home.** Read micro.csv prompt, not the code's task. *(Superseded by M18.)*
4.  **M4 Bold and borders drill.** Change the task to the convention: bold title and headers, bold total with a top border, no grid. Remove All Borders and the thick ring from the goals and the end check.
5.  **M5 The weekly sales report drill.** Replace All Borders with a top border on a bold total row, drop the gray header fill, and US-spell the goals.
6.  **M6 Row wrangler drill.** Group the Notes column instead of hiding it.
7.  **M7 Print preview.** Fill the footer date as MM/DD/YYYY.
8.  **M8 Raw keys on screen.** The drill bar shows "foundations"; settings toasts show "overlay", "subtle", "compact". Show the labels.
9.  **M9 Out-of-date lines.** Teams, Account (desks, profile), Leaderboard (school, desk), About › The loop.
10. **M10 One XP story.** Once the founder picks the line, make the nav chip, the workspace strip, Home and the orientation card all say it, and make it match xp.js.
11. **M11 Rank.** rank.js isn't imported; the ladder never shows and the Crimson theme can't unlock. *(Becomes M22.)*
12. **M12 Why lines and stuck hints.** Empty for all 368 goals on the site. Confirm the workspace shows both when filled, then the voice pass writes them. *(The why is retired by M28; the stuck cue is M27.)*
13. **M13 Solo achievements.** solo-1, solo-5 and solo-20 count a retired mode. Re-point them (clean challenge passes, say) or retire them.
14. **M14 "Week of".** Replace "w/c 15 Sep" (and 08 Sep, 22 Sep) with "Week of Sep 15" in the workbook states, the graded cell values, the goal lines and the micro-drill prompts. Depends on open question 9.
15. **M15 Pack export.** From the certificate page, download the six pages the learner built as one .xlsx (needs a small writer; the engine has the cell model). *(Retired: Wolf, Round 3, nothing is exported.)*
16. **M16 Assessment as test-out.** "Already know this?" opens the chapter assessment; 1.8.T becomes a Practice drill; "Tested out" states collapse into "Verified".
17. **M17 Consulting chips.** Add G4 Title says the answer, G5 Source under every table, G6 Round to what the decision needs to conventions.js, with graders where a page can check them (a source line under a table, a units line).
18. **M18 Quests replace Due today.** Retire the micro-drill scheduler and micro.csv; add daily and weekly quests drawn from drills, rapid-fire, the Daily, lessons and challenges, paying XP; Home shows today's quests where Due today was; Keep sharp becomes a quest. The pool and rules are in 6.6 (M54).
19. **M19 Rapid-fire rebuilt.** Prompts for every taught key, instant feedback, combo, hidden keys until a stall; the pre-rebuild version was broken. The prompt is the command's name, never the key.
20. **M20 The Daily draws from every drill**, free and Pro (stretch and long drills excepted, M85); a free learner sees "Today's drill is from Chapter {n}, which is Pro" and plays it anyway.
21. **M21 Drop the sandbox.**
22. **M22 Rank retired at launch**; boards seeded with real accounts before launch; Crimson re-keyed to level 30.
23. **M23 Achievements pass** per 6.7: retire solo-*, add chapter, verified, clean, quest and level badges; pixel-art brief per row.
24. **M24 Pars tuned aggressively** (Pass 2×, Expert 1.4×, Legendary 1.1× of the reference route), recalibrated from real runs after launch.
25. **M25 Chapter 1 re-skin to Clearcoat**: workbook labels and figures (kWh → washes, price → avg ticket, energy cost → cost per wash), every goal's task kept, graders' expected values updated with the workbook.
26. **M26 Chapter 1 assessment as the test-out**, sixteen goals per the coverage list in section 5; 1.8.T retired into a Practice puzzle drill.
27. **M27 Stuck hint as a visual cue.** After eight seconds the target (cell, tab, Ribbon command or keycap) pulses; the text line is optional and subtle. goals.csv hint_stuck carries "pulse <target> · <line>".
28. **M28 Teach lines up to three sentences; the why field retired.** Raise the checker's teach limit; brief limit 5 sentences / 110 words; drop the why column or leave it empty.
29. **M29 The paid tier is called Pro.** Paywall, pricing, account and marketing say "Go Pro". The drill tiers are Pass · Expert · Legendary (M53).
30. **M30 Lesson 1.1.1 restructured** (Wolf, markup of 2026-09-27): the sixty-press slow round and the race table go; the opener is a quick navigation set (↓ ×5 then Ctrl+↓; ↑ ×5 then Ctrl+↑; Ctrl+→ and Ctrl+←; Ctrl+Shift+↓ then Ctrl+Shift+→ to select the table; Ctrl+PgDn to Costs), then rename, delete, and insert-name-move in one goal. Eight goals; the workbook end state is unchanged.
31. **M31 Lesson-opening demos.** A lesson can open with a short played demo on the learner's sheet, keycaps shown as they're pressed (the landing demo engine, reused): 1.1.2 (Alt, the letters, Alt W V G) first; then any lesson whose concept is visual (Format Cells, Go To Special, Paste Special, the Name Box). A `demo` field on the lesson.
32. **M32 Mock dialogs for settings.** Excel Options and the Quick Access Toolbar page in 1.1.3 shown as mock dialogs with the settings to change highlighted; the goals grade the resulting state, not the menu route.
33. **M33 Mac note.** A `mac_note` on 1.1.2 (⌥ Option shows KeyTips in current Excel for Mac; some commands have no letter; System Settings › Keyboard › standard function keys so F2, F4, F9 work without fn). Verify on a current Mac before shipping; the KeyTips rollout was in Beta in 2024.
34. **M34 The color key in 1.1.4**: blue hardcode, black formula, green link to another sheet, red link to another file or a flagged figure; taught in the teach line now, graded from 1.6.4 on when green links exist.
35. **M35 QAT set (optional).** The lesson keeps four commands; the done screen names the fuller desk set (eight or nine, Save/Undo/Redo removed). If Wolf wants the lesson to build the full set, the QAT page and the Alt+number map grow.
36. **M36 Lesson 1.1.4 rebuilt as the color-coding lesson** (Wolf, 2026-09-27). Inputs gets a block of about ten cells mixed by kind (typed, formula, link to Raw); goals color them by kind with per-cell ticks on the card as each turns the right color (pseudo-gamified); Costs' typed block is colored too; F2 read-back. The units line moves to 1.3.3 (typing labels), the source label to 1.3 as well, and the hardcode-inside-a-formula fix (=B6*1.5 → =B6*B4) to 1.6.1. The lesson id stays; the workbook state gains the mixed block; the challenge 1.1.C follows the same shape. Red (a link to another file) is taught, not graded, since the engine has no external links.
37. **M37 Module 1.2 re-skin.** Raw's columns are Date · Site · Washes · Avg ticket · Revenue · Wash cost; the gap in column F starts at F12 (five missing wash costs); Costs is rent, maintenance and card fees. 1.1.4's Costs goal is gone (the block stays black for 1.2.4's Go To Special); 1.1.4 instead ends on a wrongly colored formula (B15) set back to Automatic, which the workbook state needs.
38. **M38 Lesson 1.2.3 is now cell basics** (Wolf: don't emphasize Ctrl+G). The lesson id stays (around-the-workbook) but the goals are AutoFit and width on Raw, row height, right-aligned headers C1:F1, a note row inserted in Raw's Notes block (the block becomes A64:A68; 1.3.3's cut moves with it), a Utilities column inserted and deleted on Costs (net zero), wrap on A64. Go To is one goal at the end of 1.2.1. 1.4.2 narrows to the Report page's columns (equal period widths, wrapped headers, the label column) since basic widths and AutoFit are taught in 1.2.3.
39. **M39 Module 1.3 re-skin.** Airport's Saturday: 250 washes, $14.00, $3,500.00, $375.00; C33 text "240"; E41 81500 against 3,150; the Report title "Clearcoat - Austin Weekly KPI Report, Week of Sep 15, 2026"; labels "Week of Sep 8" → "Week of Sep 15" (M14); the units line and the source label move to 1.3.1 (goals 8 and 9); Notes block A64:A68.
40. **M40 Engine features the Foundations copy now needs** (confirm or build): the "After pressing Enter, move selection" setting, honored by the runner (Enter stays after 1.1.3); AutoComplete in a column; Alt+Enter line breaks; the status bar Sum/Average/Count for a selection; F4 as repeat-last-action for formats, fills, widths, inserts and deletes; Paste Special Multiply and Divide (and Add, Subtract); Define Name (Alt, M, M, D), the Name Box list and Go To by name; cell notes (Shift+F2) with a corner marker; Ctrl+; (today's date); Ctrl+Backspace (scroll back to the active cell); Delete versus Backspace; Home, End, Ctrl+← and Ctrl+→ inside edit mode.
41. **M41 Sheet switching in a browser.** Chrome keeps Ctrl+PgUp and Ctrl+PgDn for its own tabs and a page can't intercept them. Teach the real key, show it on the keycap, and accept an app alias (Alt+PgDn and Alt+PgUp, also Ctrl+Alt+PgDn/PgUp) that the runner treats as identical for grading and "clean"; the tab_keys_note says so once, with the Fullscreen and Install buttons that hand the real key to the sheet. On a Mac the native ⌥→ and ⌥← already work in a browser. The same alias applies while a formula is open (pointing across sheets in 1.6.4).
42. **M42 Lesson 1.6.4, linking across sheets, gets the full treatment** when its module is written: a lesson-opening demo (M31), the Sheet!Cell syntax explained from the Name Box and the formula bar, one link typed and one pointed, a column of links with Ctrl+Enter, a cross-sheet range inside SUM, the green color, and Ctrl+[ to follow a link back. Wolf: this has to be taught more clearly than the old copy did.
43. **M43 Chapter 1 goal counts after the markup:** 1.1.3 has 8 goals (the Enter setting), 1.2.2 has 8 (the status bar), 1.2.3 has 9 (F4), 1.3.1 has 11, 1.3.2 has 9, 1.3.4 has 10, 1.3.5 has 10, 1.3.C has 8. The lesson ids don't change.
44. **M44 Lesson 1.1.2 Know the screen** (new; id know-the-screen): a labeled tour demo, then six goals on the formula bar, Ctrl+Shift+U, Ctrl+F1, the status bar, zoom, and the sheet keys with the browser alias. The Ribbon, settings and color lessons renumber to 1.1.3, 1.1.4, 1.1.5; module 1.1 has five lessons. Needs: Ctrl+Shift+U, Ctrl+F1, a zoom control and Alt W Q / Alt W J in the engine.
45. **M45 Notes are taught, not graded.** Shift+F2 opens a note with a corner marker and a visual demo; the project and assessment grade the source label in the next cell only, never notes or comments (Wolf).
46. **M46 Modules 1.4 and 1.5 re-skin.** Cedar Park: 210 washes, $2,940.00, $315.00; the Depot site in 1.4.C: 180, $2,520, $270; Costs is rent, maintenance, card fees with a Total ($/wk) column; the Inputs cost per wash formats to two decimals (was three for $0.13). 1.4.3 teaches Alt, H, O, U, L as the unhide route and says why Ctrl+Shift+0 fails.
47. **M47 Lesson 1.5.4 rebuilt** (Wolf): Paste Special Formats copies the Report's figure-block format onto Costs in one paste; Alt, H, B, N then F4 twice clears grids on Costs, Inputs and Raw's totals block (the workbook states need those grids); widths then F4. 1.5.3 gains a dialog-navigation goal (Ctrl+PgDn between Format Cells tabs, Tab, Alt+letter, Space, Enter, Esc).
48. **M48 Modules 1.6–1.8 re-skin.** Prices in the 1.6.3 grid are 1.25 / 1.50 / 1.75; the by-day block, the totals block and the Prior week block keep their addresses; Costs' error lesson keeps its cells (rent, maintenance, card fees; D7 "tbc"); the assessment gains a sixth-site insert, a column delete, a group and a Replace All so it covers every module (seventeen goals, ten minutes); 1.8.T retires into the Practice puzzle drill "Audit: ten faults".
49. **M49 Story-card flavor.** Roles only, no dialogue; an email fragment as commentary is allowed ("pls fix, thx. Sent from an iPhone" on 1.5). Used sparingly, never as speech in a scene.
50. **M50 The Reference page from a keys sheet.** Section 10 becomes data (app2/content/keys.csv: command, group, Windows key, Ribbon route, legacy route, Mac key, taught-in lesson, accepted alternatives). The Reference page renders it grouped by function with the four route columns, a "Chapter 1 / everything" filter and a search; Pro chapters' keys show to everyone. The Help tab in a lesson reads the same sheet, so a key is described once. Fix "colour" on the existing page.
51. **M51 Deal-strip stages 2–6.** **RETIRED** (2026-10-01): the deal strip is gone from every site page (3.0, Home); the stages of the sale live in the chapter scripts' story cards.
52. **M52 Demo chrome.** For a lesson with a `demo` field (M31): a demo card before the goals with the line in 3.7, keycaps shown as pressed, Enter skips, "Your turn ↵" at the end; the demo never counts as help.
53. **M53 Tier names everywhere.** Pass · Expert · Legendary on drill results, challenge titles, the catalog, Home's chapter table and the tier-pro achievement (renamed Expert); boards carry no tier marks (6.8, M104). "Pro" appears only as the plan. The lesson-complete title set becomes Lesson complete · Project complete · Chapter Verified · Pass · Expert · Legendary (M16 folds "tested out" into Verified).
54. **M54 Quest pool as data.** app2/content/quests.csv from 6.6: id, daily or weekly, line, condition, XP, the Pro flag and the placeholder rules ({module}, {key}); the drawing rules in 6.6; Home's Today panel per 3.4.
55. **M55 The reviewer by chapter.** The print-preview reviewer is the CFO in Chapter 1, the bankers' associate in Chapter 2, the buyer's analyst from Chapter 3 on; the two flag lines in 7.3 take the role as a variable, and the {what} phrases lose "house style".
56. **M56 One subhead.** The search description, the footer line and any marketing line that restates the pitch follow the locked subhead once Wolf locks it.
57. **M57 Reference: key states, Drill it, Show me** (Wolf, 2026-09-27; laid out by M106). Every key in keys.csv (M50) carries a per-learner state: untouched, taught (a lesson showed it), practiced (pressed in a lesson or drill), under par (a clean single-key drill under the Pass par). Stored with progress and shown as a state word on the row (3.0, Reference), with the count at the foot of the page. "Drill it" runs a twenty-second single-key drill on a small fixed sheet (the retired micro-drill generators, re-pointed at one key each; no board, no personal best, it only sets the state). "Show me" plays the M31 demo engine on a small sheet beside the row: a scripted replay on the existing engine, not a video, so it needs one short script per key and little else. Copy in 3.15. An achievement per chapter for collecting every key (Keyring, 6.7).
58. **M58 Entitlements per chapter.** Phase E's entitlements are keyed by chapter (and later by DLC chapter), with Pro as a plan that grants all of them; a redeem code can grant one chapter or the plan. Then per-chapter pricing, an all-access plan or both is a pricing-page decision, not a schema change (9.1, question 11). Stripe stays in test mode until Wolf says go.
59. **M59 The quest loop** (Wolf, 2026-09-27: progress bars, completion animations, rewards). Each quest is a row in Home's Today panel with a bar that fills live as runs count, updated in the result panel before Home; completion ticks the row with a soft sound and counts the XP up into the Level panel; all three daily done drops in the bonus row, pays the bonus and adds a streak day; all three weekly pays the bonus and one roll on the reward table. Copy in 3.4 and 6.10.
60. **M60 XP economy and level rewards** per 6.10: the per-run XP table, the curve (150 × n to the next level), the level next to the handle on boards and in the rail, a reward at every level from 6.10's table (a theme every third level, a keycap skin, a ghost color, a sound set or a flair between; the profile frame at 10, the ghost trail at 20, Top Bucket at 30), the level-up row in the result panel. Replaces the four XP stories (M10).
61. **M61 Dynamic arrays** (if 9.1 question 12 is a yes): UNIQUE, FILTER, SORT and SEQUENCE in the engine, spilling into a range, for one lesson in 4.2 and the Reference page.
62. **M62 Chapter 2 engine needs** (from the shell in claude/script-ch2.md; confirm or build before its modules are written to goal level): custom number-format codes with four sections, literal units, a scaling comma, conditions and colors, and ;;; to hide; date format codes; a right border on a range (the A/E divider) and a double bottom border; Cell Styles (Alt, H, J) and the Format Painter (Alt, H, F, P); conditional formatting with built-in and formula rules, Manage Rules, Stop If True and Clear Rules; outline levels with the outline symbols; hyperlinks to a named place (Ctrl+K); print areas, fit to one page wide by n tall, Page Break Preview and manual breaks, sheet-group selection for a shared footer; TEXT, EOMONTH, EDATE, TRIM, PROPER, SUBSTITUTE, LOWER and Ctrl+Shift+~; a Monthly sheet fourteen columns wide.
63. **M63 A formula can start with + or −** (Wolf, 2026-09-28, the keypad habit): the engine accepts +D5−E5 and −D5 as formula starts and stores them as Excel does (=+D5−E5, =−D5); grading treats =+D5−E5 and =D5−E5 as the same formula, and the Reference page lists + as an accepted alternative to = wherever a formula is entered.
64. **M64 The desk number format, graded by its code.** **DRAFT** (source checklist) Format Cells' Number category carries Decimal places, Use 1000 Separator and the four Negative numbers choices, and picking 0, the separator and (1,234) writes #,##0_);(#,##0), which the Custom category then shows (2.2.1 goal 1 reads it). Ctrl+Shift+1 writes #,##0.00 with a leading minus and is not a cycle; Alt, H, K writes Excel's Accounting code. F4 repeats a whole Format Cells action on the next selection. The graders in 1.5.1, 1.5.C, 1.6.1, 1.7.2, 1.8.P, 1.8.A, 2.1.1, 2.1.2 and 2.1.C read the code on the cell, never the route: they accept #,##0_);(#,##0) or any code that shows the same three things (a separator, no decimals, a negative in parentheses), which includes the Accounting code Alt, H, K writes once Alt, H, 9 has taken its decimals off, and on blocks that hold only counts they accept #,##0 as well. The _) spacer renders as a gap the width of a closing bracket, in every section of a custom code. Measured in desktop Excel, 2026-09-30: Ctrl+Shift+1 shows 1,234.50 and -1,234.50; Alt, H, K shows 1,234.50, (1,234.50) and a dash for zero; F4 after the dialog repeated the whole format. *(for 1.5.1, 1.5.C, 1.6.1, 1.7.2, 1.8.P, 1.8.A, 2.1.1, 2.1.2, 2.2.1, 2.2.4)*
65. **M65 Edit, Enter and Point modes.** **DRAFT** (source checklist) An open cell has a mode, shown at the left of the status bar (Ready, Enter, Edit, Point). F2 on a filled cell opens Edit, where the arrows move the caret; a second F2 switches to Enter, where the first arrow starts pointing and writes the reference at the caret; F2 again returns to Edit. A formula typed from an empty cell starts in Enter, as now. The demo before 1.6.1 shows the status-bar word changing. *(for 1.6.1, 1.6.6, 2.1.2)*
66. **M66 Dialog tabs and their keys as desktop Excel has them.** **DRAFT** (source checklist) Tested in desktop Excel, 2026-09-30. Format Cells and Page Setup open on the tab last used in the session (a cancelled visit counts) with the keyboard on the row of tabs. There a letter picks a tab (tested: N Number, A Alignment, P Protection in Format Cells; H Header/Footer in Page Setup) and a letter with no tab does nothing (C); Ctrl+PgDn, Ctrl+PgUp and Ctrl+Tab step through the tabs, with the browser alias M41 gives the sheet keys. Tab steps onto the page. In Format Cells' Category list a letter picks a category (N Number, C Currency, P Percentage; End reaches Custom), and Alt with an underlined letter reaches a control: Alt+D Decimal places, Alt+U Use 1000 Separator, Alt+N Negative numbers. In Page Setup Alt+H does nothing; on Header/Footer, Alt+U opens Custom Footer with the cursor in the left section. The Margins tab carries the four margins, the Header and Footer margins and the two Center on page boxes, and Ctrl+F2 shows their effect; 2.7.1's new goal grades Center on page, Horizontally, and a Header margin smaller than the Top margin. *(for 1.5.1, 1.5.3, 1.7.1, 1.7.2, 1.7.3, 2.7.1)*
67. **M67 The Series dialog's types.** **DRAFT** (source checklist) Alt, H, F, I, S opens Series with Rows or Columns, the Type choices (Linear, Growth, Date, AutoFill, each with its letter) and Step value. It opens on Linear, which leaves a text day name untouched and steps a single number by the step value; AutoFill continues Mon to Sat and reads the step from two selected numbers. It opens with the cursor in Step value, so a type is picked with Alt and its letter (Alt+F for AutoFill); tested 2026-09-30. 1.3.5 goals 8 and 9 grade the filled range, by any route. *(for 1.3.5)*
68. **M68 The Clear menu, Paste Special Formulas, and paste arithmetic on formulas.** **DRAFT** (source checklist) Alt, H, E opens Clear: A all (contents, formats and notes), F formats, C contents, M comments and notes; Delete keeps formats and notes, and stray formats hold the used range Ctrl+End reports until they are cleared and the file is saved. Paste Special accepts F, formulas only, leaving the destination's formats alone. Paste arithmetic on a cell that holds a formula rewrites it the way Excel does, =(SUM(C5:C9))*-1. A transposed formula has its relative references turned. Cut and paste keeps the moved formula's references and repoints the cells that read it. Go To Special offers Notes. *(for 1.3.1, 1.3.4, 1.6.1, 1.6.3, 1.7.1, 1.7.3, 2.1.2)*
69. **M69 Copy and paste around hidden rows and filters, as desktop Excel does them.** **DRAFT** (source checklist) A copied range that holds rows hidden by hand or folded in a group pastes every row, unless Alt+; selected the visible cells first. A copied range filtered by AutoFilter pastes its visible rows only. A multi-row block pasted onto a filtered list fills consecutive rows, the hidden ones included. The AutoFilter header menu also offers Number Filters (Greater Than, Top 10, Above Average) and Date Filters, and Remove Duplicates shows one tick box per column, the ticked set defining the duplicate. 4.2.5 is graded on those behaviors. Tested in desktop Excel, 2026-09-30. *(for 4.2.5, 4.2.2, 4.2.3)*
70. **M70 Grouped sheets: the tag and the way out.** **DRAFT** (source checklist) While two or more sheets are selected the title bar shows Group and the grouped tabs read lighter; an entry or a format lands on every grouped sheet. Moving to a sheet outside the group ungroups, as does Ungroup Sheets on a tab's menu; Ctrl+PgDn or Ctrl+PgUp that lands inside the group only changes the active sheet. 4.3.6 goal 4 and 2.7.1 goal 5 finish with the tag gone. Tested in desktop Excel, 2026-09-30. *(for 4.3.6, 2.7.1)*
71. **M71 Functions, arguments and codes the asides lean on.** **DRAFT** (source checklist) ISTEXT; a number or a blank as an IF test (0 and blank false, any other number true, text #VALUE!); the start-position argument of FIND and SEARCH; SUBSTITUTE's instance argument and REPLACE; the type argument of PMT, PV and FV; the guess argument of IRR and XIRR, and #NUM! when the flows share a sign; XMATCH; MATCH inside VLOOKUP's column slot; the format code "On";;"Off"; a formula entered behind a leading apostrophe held as text and made live when the apostrophe goes; a conditional-format formula rule of =TRUE lighting the whole range. *(for 2.2.4, 2.5.2, 3.1.4, 3.4.2, 3.5.1, 3.5.3, 3.6.2, 4.1.3, 4.1.5, 1.6.6)*
72. **M72 Small dialog and screen additions.** **DRAFT** (source checklist) Find (Ctrl+F) gains Options: Within (Sheet, Workbook), Look in (Formulas, Values) and Find All with its result list, for the tab-name search in 3.6.3. Text to Columns gains its third step, the column data format (General, Text, Date), for 3.4.4. The 1.1.2 tour demo shows the status bar's right-click menu with Minimum and Maximum ticked. The mock Excel Options dialog (M32) highlights two more settings in 1.1.4: General, the Start screen box, and Accessibility, Provide feedback with animation. Value Field Settings lists Distinct Count only for a pivot built on the Data Model (shown, not graded). Reference rows can be marked listed, not simulated (no Practice it, no Show me): Ctrl+N, O, S, P; Ctrl+Tab; Alt, F, I; INDIRECT with R1C1 text and ADDRESS; XLOOKUP returning a whole record. *(for 1.1.2, 1.1.4, 3.4.4, 3.6.3, 4.4.2, Reference)*
73. **M73 Model behaviors the Chapter 4 asides describe.** **DRAFT** (source checklist) A data table whose row or column input cell the model does not read returns the corner value in every cell. A data table whose edge values are linked to the input cell it drives returns wrong figures, as Excel does. A sticky IF re-entered or edited while its case is off returns 0 until the switch passes through its case again. Copying a sheet that holds workbook names creates sheet-scoped duplicates, shown in the Name Manager's Scope column. A conditional-format formula rule can read a cell on the same sheet to grey a whole table. *(for 4.5.2, 4.5.5, 4.5.6, 4.6.2)*
74. **M74 COLUMNS and ROWS.** **DRAFT** (source checklist) COLUMNS(range) and ROWS(range) in the engine, returning the width and height of a range (a range that includes the formula's own cell is not a circular reference); =COLUMNS($C4:C4) filled right counts 1, 2, 3, and after a column is inserted in front of C the first period still counts 1 while =COLUMN()-2 reads 2. Inserting a column on Inputs has to shift references the way Excel does, and Ctrl+Z restores it. 2.1.3 goal 5 uses COLUMNS first, as the period count in a CAGR's exponent. *(for 2.1.3, 5.2.2)*
75. **M75 Array arithmetic inside SUMPRODUCT, and blanks as zero.** **DRAFT** (source checklist) ISNUMBER and ISFORMULA evaluated cell by cell over a range inside SUMPRODUCT, with TRUE and FALSE coerced by arithmetic: =SUMPRODUCT(ISNUMBER(range)*(1-ISFORMULA(range))) counts typed numbers only (a formula returning text, a dash or an error adds nothing). SUMPRODUCT(ABS(range)) and ROUND read an empty cell as zero, so the pending rows on Checks add nothing to the roll-up. COUNTIF(range,"<0") for the limit checks is the criteria form already pinned. *(for 5.2.4, 5.5.1, 5.5.3)*
76. **M76 Pending checks are empty cells, never a typed 0.** **DRAFT** (source checklist) A task change: the end state of 5.2.4 (and the checks step of 5.2.C) has the six pending check rows empty with "pending" in the next cell; the grader accepts a blank or a live formula and rejects a typed 0, the same rule 5.5.C plants as "a check that isn't a formula". *(for 5.2.4, 5.2.C, 5.5.C)*
77. **M77 A name while pointing; F4 on a name.** **DRAFT** (source checklist) Pointing at a cell that carries a workbook name writes the name into the formula (Case, LastHistorical), and F4 on a name does nothing, as in desktop Excel; grading accepts =CHOOSE(Case,F12,F18,F24) filled right and down with no $ on the block references. Tested in desktop Excel, 2026-09-30. *(for 5.2.2, 5.2.6)*
78. **M78 The circular-reference warning with iteration off.** **DRAFT** (source checklist) With iterative calculation switched off (Alt, F, T, Formulas), a circular reference raises Excel's warning and the status bar names a cell in the loop; with no circle left, nothing is raised. The breaker at 0 removes the intended circle, so the lesson can show that no warning means no accidental circle, then switch iteration and the breaker back on. A SUM whose range includes its own cell is the planted accidental circle. *(for 5.5.3)*
79. **M79 Error Checking runs on the active sheet only.** **DRAFT** (source checklist) Alt, M, K walks the errors of the active sheet and says the check is complete for that sheet; it does not jump to another sheet. The per-sheet error count on Checks is what names the sheet to open. *(for 5.5.2)*
80. **M80 The Arrange Windows dialog.** **DRAFT** (source checklist) Alt, W, N opens a second window on the same workbook; Alt, W, A opens the Arrange Windows dialog (Tiled, Horizontal, Vertical, Cascade, and the Windows of active workbook box), and nothing is arranged until a layout is chosen and Enter pressed. The tip in 5.4.1 is shown, not graded; if the workspace can't hold two windows, the tip stays as words and a mock dialog (M32). *(for 5.4.1)*
81. **M81 Statistics functions skip text in a range.** **DRAFT** (source checklist) MEDIAN, AVERAGE, MIN, MAX and QUARTILE.INC over a range ignore text, including the empty string a formula returns, so a helper column of =IF(include=1, multiple, "") gives statistics on the included comps only. With this the array evaluation of MEDIAN(IF()) listed in the Chapter 6 engine needs is no longer required; the helper column is the one taught route. *(for 6.1.3, 6.1.4, 6.2.2)*
82. **M82 PV with no payment.** **DRAFT** (source checklist) PV(rate, nper, 0, -fv): the present value of a single future amount, with the sign convention of 3.5.1, filled across a row of hurdle rates; the result at the 20% hurdle agrees with the entry price Goal Seek finds in 6.3.6 goal 3. *(for 6.3.6)*
83. **M83 Formula AutoComplete.** **DRAFT** (source checklist, held item G184, pulled back 2026-09-30) Typing = and the first letters of a function shows the list of matches, functions and defined names both; ↓ moves through it and Tab completes the name with its opening bracket. 1.6.2 goal 5's teach line says so (=AVER, Tab; =AV alone would offer AVEDEV first). Not yet tested on desktop Excel: check which item the list highlights first. If the list isn't built by the time Chapter 1 is re-skinned, that sentence comes out of the teach line. *(for 1.6.2)*
84. **M84 What-if grading for drills.** **DRAFT** (drill sketches, 2026-09-30) A drill's grader can change one or more input cells, recalculate, compare the answer cells with the reference and put the inputs back, all after the clock stops. It tells a formula from a typed number, an anchored reference from a lucky one and a conditional rule that reads a cell from one with the number typed in, without grading the route. It extends the engine's one liveness rule (perturb an input and check the result moves, app2/engine/live.js) from a single cell to a drill's whole answer set. The sketches in claude/script-drills.md say "what-if" wherever a drill needs it. *(for 6.2b)*
85. **M85 Pickers in drills, and the stretch and long tags.** **DRAFT** (drill sketches, 2026-09-30) A drill's start state can carry validated-list cells (4.2.4); Alt+↓ opens the list and the grader reads the value picked. A drill can be tagged stretch (one rule line shown on its card and start screen, Pro, off the path, never drawn by the Daily) or long (about five minutes, listed with the challenges on Practice, never drawn by the Daily). *(for 6.0, 6.2b)*
86. **M86 One sheet skeleton, in code.** **DRAFT** (Wolf, 2026-09-30) The sheet standard in section 5 becomes one module (say `app2/content/workbooks/page.js`): given a title, a units line, headers or a timeline, labels, sections and widths, it returns a page's cells and settings to the standard (title in A1, units in A2, headers in row 4, figures from row 5, the label column, the font, the number formats, the total borders, gridlines, frozen panes). Every chapter workbook's finished pages and every drill's solved sheet are built through it, and start states are cut from the solved sheet. A whole-sheet audit (a `sheet-standard` test that reuses the convention graders) runs over every lesson's final state and every drill's end state, and fails on any departure that isn't a named exception (raw exports, inherited sheets, start states whose job is the standard). Chapter 1's drills (6.1's eleven) move onto the skeleton when run R1 rebuilds them, so the addresses in their goal lines (6.1) change. Today each workbook and each drill lays its own cells out by hand, which is why they drift. *(for every workbook and drill)*
87. **M87 Tokens, mode colors and the contrast test.** **DRAFT** (Wolf, 2026-10-01; 3.0, Color, Type, Layout) One tokens file, `app2/ui/tokens.css`, holds every color, size, radius, space and duration in 3.0, and nothing else in the CSS or JS carries a raw value. Workbook is the default theme; every theme in `ui/themes.js` supplies the same tokens, including the six mode colors with their ink and tint, the rail's four and the note's two. The page ground is paper, never pure white. The monospace face comes off labels, buttons, menus and headings and stays on keys, addresses, formulas, times and the wordmark. A test computes every text and background pair in every theme and fails under 4.5 to 1 (3 to 1 for 24px text and control edges); a theme that can't pass is fixed or dropped. *(for every screen)*
88. **M88 The rail, the KeyTips registry and the cell cursor.** **DRAFT** (3.0, The rail) `ui/nav.js` becomes the dark rail of 3.0, words only: Home, Learn, Practice with its four modes and their color marks, Leaderboards, Reference, then the level, the streak and the account row, which opens Profile, Settings, Plan and billing, and Your certificate. One registry maps the KeyTips letters for site pages (Home H, Learn L, Practice P, The Daily D, Drills R, Rapid-fire F, Challenges C, Leaderboards B, Reference E, Account A, then each page's own); Alt shows them, a letter acts, Esc backs out. None of it runs inside a lesson, challenge or drill, where Alt is the Ribbon's. The focus on site pages is the cell cursor in the page's mode color, moved with the arrows. Below 900px the rail folds into a top bar. *(for 3.3)*
89. **M89 Home, Learn and Practice.** **DRAFT** (3.0, Home, Learn, Practice) Home: the next-lesson block with the live preview of the learner's sheet and Resume on Enter, the chapter table under it, and Level, Today and Achievements on the right, the two columns ending on the same line. Learn: page tabs for the chapters, the chapter as a table with the open module's lessons, the module's page previewed beside it. Practice opens on Drills: the header block with the length and Start drilling, the set from M97, and the two-column catalog. The Daily, Rapid-fire and Challenges get a page each with the same header block. One shared table component serves them all. *(for 3.4, 3.5, 3.10)*
90. **M90 The task card that points, and the five forms.** **DRAFT** (3.0, The task card) The placement engine of 3.0, tested on every lesson's goals with a check that the card never overlaps its target, the selection, a note or a named range; the card's content order, Help inside the card with its three rungs, the keycaps that answer, the four states. Built beside it: the note, the nudge, the pen (which replaces the convention chip on the card) and the checks row. *(for 3.7)*
91. **M91 The workspace chrome.** **DRAFT** (3.0, The workspace) The title row folded into the Ribbon's tab row, with the back button, the title that opens the module's lesson list, the goal segments or task count, sound and More. The Ribbon at the live site's compact height with sentence-case group names and no tint for its KeyTips state; Ctrl+F1 collapses it to the tabs and Alt drops it down; lessons open full and drills and challenges collapsed, both settings. The Quick Access Toolbar on its own row below the Ribbon. The quiet formula bar. The Esc ladder (edit, then note or menu or Help, then "Esc again to leave"). *(for 3.7)*
92. **M92 The first run and the coach marks.** **DRAFT** (3.0, The first run) One set-up screen, one story card with Wolf's line, then lesson 1.1.1 with the card naming itself. After the first lesson, one coach mark on each of Home, Learn, Practice, Leaderboards, Reference, the level and the streak. *(for 3.2)*
93. **M93 One panel for every timed run, and lesson complete.** **DRAFT** (3.0, The timed run) Ready, Run, Result and Next in the 340px panel for drills, the Daily, challenges and assessments: the pace line, the folding checklist from M98, the result rows (time, tier, new best, track, tasks, XP, board place with its move, quests, level-up) and the keys (Enter next, R again, B board). Lesson complete uses the same panel. The sheet is never dimmed or covered. *(for 3.8, 3.9, 3.10)*
94. **M94 The copy and CSS checks for the tells.** **DRAFT** (3.0; built first in run R1, before the copy lands) The copy checker fails any displayed string with a dash used as punctuation, an emoji or a symbol used as an icon or bullet, facts joined by middle dots or pipes, an arrow or symbol at the end of a button label, or a word of four letters or more in capitals that is not on the whitelist (key names, Excel's function names such as VLOOKUP and SUMIFS, and acronyms such as EBITDA, DCF, LBO, P&L, IRR, MOIC). The stuck field's separator and anything typed into a cell are exempt. The CSS check fails letter-spacing on text, text-transform uppercase, the monospace face on anything but keys, addresses, formulas, times and the wordmark, a raw color or size outside tokens.css, pure white as a page ground, and any import of a generic icon set. *(for every screen)*
95. **M95 The moments, and the landing page as a sheet.** **DRAFT** (3.0, Motion and moments; The landing page) Every moment in 3.0's table as a named entry in `ui/effects.js`, queued, skippable and reduced-motion aware, including the result sequence, the rapid-fire hit and combo, quests done, the streak day and the achievement banner. The landing page as 3.0 draws it: the Name Box and formula bar showing the headline, the hero framed by column letters and row numbers, Start learning as the selected cell, the live demo (M31) floating at the right, the sheet tabs as section anchors, the path, five sections of a proof plate and Wolf's mode line, pricing and teams on the same columns, and the footer. *(for 3.1)*
96. **M96 One record per timed run.** **DRAFT** (Wolf, 2026-10-01; 3.0, Get these right now) Every timed run, of every kind, writes one record: the time, the keys pressed, the route's key count, each goal with when it landed, help and mouse flags, the tier, and the keyboard layout. Boards, pace, the result panel and the par recalibration (M24) all read it, so none of them needs a schema change later. A forward migration; never applied to the live database without Wolf. *(for 6.0, 6.8)*
97. **M97 The drill catalog's fields, and the set picker.** **DRAFT** (3.0, Practice) Each drill carries its length class, the lesson it follows, its tags (stretch, long, benchmark), its mode, its pars and its reference route. The set picker builds a set for a chosen length from what's due, the slowest drills against their pars, the newest unlocked drill and drills under their next tier; never Pro drills for a free account; a pure function with tests. *(for 3.10, 6.0)*
98. **M98 The checklist as one state machine.** **DRAFT** (3.0, The timed run) Pending, current and done, with an assisted flag, for 1 to 60 goals; the folded "{n} done" line, the current task kept near the top, "{n} more after these". Used by the run panel and the lesson's goal list alike. *(for 3.7, 3.10)*
99. **M99 Zoom to fit.** **DRAFT** (3.0, The workspace) A drill or challenge opens with the sheet zoomed so its used range fills the sheet area, between 100% and 150%; the zoom is a sheet property the engine owns, and the learner's sheet-zoom setting is the floor. *(for 3.10)*
100. **M100 Rapid-fire's stage.** **DRAFT** (Wolf, 2026-10-01; 3.0, Rapid-fire; 6.5) A page of its own: the command's name, a small sheet fragment with the target cells outlined that changes as the chord lands, the hidden keys, the ten-segment combo meter with its bursts, the wrong-chord shake, and a result naming the three slowest commands with Drill these on Enter. *(for 3.10, 6.5)*
101. **M101 Account: Profile, Settings, Plan and billing.** **DRAFT** (3.0, Account) One preferences object with a schema version, synced to the account, holding every setting in 3.0's table; the Settings page renders from it as two columns of grouped panels; theme tiles all one size. Plan and billing opens Stripe's customer portal (test mode until Wolf says go). Profile shows the handle, the level and its title, the achievements shelf and stats. *(for 3.12)*
102. **M102 The progress model and the one certificate.** **DRAFT** (Wolf, 2026-10-01; 3.0, The certificate) Lessons, modules, chapters and each chapter's assessment roll up to one certificate, hotkey.gg Certified, Excel for Finance. Chapter Verified is a status and an achievement. The certificate page shows the six chapters as progress and the certificate grayed until earned; on issue, a public verification page, Add to LinkedIn profile (LinkedIn's add-certification link with the name, issuer, date, credential ID and verification URL) and Copy the verify link. Supersedes chapter certificates in 9.4 and SITE_SPEC 11. *(for 3.16, 9.4)*
103. **M103 Achievement art and level titles.** **DRAFT** (Wolf, 2026-10-01; 3.0, Achievements and level titles; 6.7; 6.10) Badges as 16 by 16 pixel sprites at 4px from the 6.7 briefs (a pixel artist's set when Wolf hires one; the canvas's twelve as placeholders until then), locked as gray silhouettes, rarity as a colored word. Level titles and rewards as one data table read by the profile, the Level panel and the level-up row. The table and the XP constants are built in R1b with the progress model, since the level-up row and the Level panel read them; the art comes in R7. *(for 3.12, 6.7, 6.10)*
104. **M104 Leaderboards.** **DRAFT** (Wolf, 2026-10-01; 3.0, Leaderboards; 6.8) Page tabs for the Daily, Drills, Challenges and Desks; the board table with place, player and level, the time against the field, the time, the gap to first and the keys; no tier marks; the learner's row pinned with its move; the last five runs beside it. Reads M96. *(for 3.11)*
105. **M105 Pricing and the paywall panel.** **DRAFT** (3.0, Pricing and the paywall) The pricing page with Free and Pro, Pro's Own it and Monthly toggle, the guarantee line and Teams; Go Pro opens Stripe Checkout in test mode and returns to a "You're Pro" row in the panel of the page the learner came from. The paywall is a panel on the page, never a pop-up. Live prices change only when Wolf says go. *(for 3.13)*
106. **M106 Reference as 3.0 draws it.** **DRAFT** (3.0, Reference; extends M57) Search on "/", the Windows and Mac toggle, two columns of group tables with the key, what it does, the lesson, its state and Drill it, the Ribbon route as a second row of keycaps, and the collected count. *(for 3.15)*
107. **M107 General format fits the column.** **DRAFT** (found on the canvas, 2026-10-01) A General-format number too long for its column shows ###### in the engine; Excel shows fewer decimals until it fits, and ###### only for formatted numbers and dates. Match Excel, with a unit test. *(engine)*
108. **M108 Chapter 1's drills resized.** **DRAFT** (Wolf, 2026-10-01; 6.1) The twelve built drills, 5 to 50 seconds each, are merged into eight and joined by three 6.2b sketches, the eleven one-to-three-minute drills in 6.1's table, with pars from their reference routes. *(for 6.1)*



### 9.4 Evaluation, test-out and certificates (proposal for SITE_SPEC 6 and 11) DRAFT

What the spec has today: lessons graded on end state; a seeded, timed module challenge with tiers; a chapter project and a chapter assessment; a five-minute test-out for Chapter 1; certificates in two tiers (Completed, Verified); boards; rank hidden until a field fills. The proposal keeps the shape and settles the edges, in the learner's order. Wolf settled (a), (b) and (d) in Round 3 and ruled out (c); the copy for the certificates is in 3.16.

1.  **Lesson.** Graded on the sheet's end state; any route that gets there counts. Guided is the normal way and pays full XP. "Show me" marks the attempt assisted. Clean = no mouse on the workspace, no help. Retakes always allowed; the best result stands.
2.  **Module challenge.** The module's job on a fresh seeded file (a sister cluster: new city, new figures, one twist), timed, graded on numbers and conventions. Pass marks the module done in Learn's table; Expert and Legendary are for the boards. First attempt on a soft clock (finish over the limit and it still passes, with no tier); later attempts hard. One board per challenge, clean runs only.
3.  **Chapter project.** The chapter's page built end to end from a blank sheet, guided (goals shown, no teach lines), no clock. Finishing every lesson and the project is what **Completed** means.
4.  **Chapter assessment.** The same job on fresh figures, hard clock (Chapter 1 ten minutes, rising to fifteen by Chapter 6), no help, keyboard only. Pass = **Verified**. The time and the keystroke count are stored with the attempt and shown on the certificate.
5.  **Test-out.** *Settled:* the assessment is the test-out. "Already know this?" opens the chapter assessment directly; pass it and the chapter is complete and Verified, lessons skipped. The separate five-minute fault-fix (1.8.T) becomes a Practice drill ("Audit: ten faults") so the built work isn't wasted. One door, one standard, and nobody skips a chapter without proving they can build its page.
6.  **The certificate.** One certificate, **hotkey.gg Certified, Excel for Finance**, issued when all six chapters are Verified (Wolf, 2026-10-01; 3.0, The certificate; M102). A chapter's Completed and Verified are progress toward it, a status and an achievement, never certificates of their own. The certificate has a public verification page: handle or name, date, each chapter's assessment time, keys against par, a verification code. No export of the pack (Wolf, Round 3; M15 retired).
7.  **Boards.** One board per drill, per challenge and for the Daily (6.8); real people only; rank retired (M22).
8.  **One definition of clean and help, in one place.** Mouse on the workspace = not clean. Reading the Help tab = free. "Show me" = assisted. Any of those in a timed run = no personal best and no board entry; the run still counts. The site says this four ways today (M10 covers XP; this is the same fix for help and mouse).

### 9.5 Naming: "Pro" (decided) DRAFT

Wolf's paywall line is "Go Pro for the rest of the content", so the paid tier is Pro. The drill tiers were pass · pro · legendary, and "beat a pro clock" would then read as "beat a paid clock". Decided (Wolf, 2026-09-27): the plan is **Pro** (the paywall, pricing, account and every marketing surface say "Go Pro"); the drill tiers are **Pass · Expert · Legendary** (M53).

## 10. The keys: syllabus, alternatives, Mac DRAFT

What each lesson teaches, in the order the site teaches it, with the routes the grader also accepts. The engine grades the sheet's end state, so every legitimate route counts; the keystroke count only matters for efficiency and the "clean" mark. The primary key is the one the lesson shows and the one the desk uses; alternatives go on the Help tab and in Reference (3.15, M50). Keys are written the way the site writes them: Ctrl+Shift+↓, Alt H O R, F2. Windows first, because that's the banking norm; ⌘ and ⌥ stand in for Ctrl and Alt on a Mac unless the row says otherwise.

### 10.1 Rules that apply everywhere

  - **The Alt chords are the modern Ribbon KeyTips** (Alt H … for Home, Alt A for Data, Alt M for Formulas, Alt W for View, Alt P for Page Layout, Alt N for Insert, Alt F for File). The **legacy menu keys** from Excel 2003 (Alt E for Edit, Alt I Insert, Alt O Format, Alt T Tools, Alt D Data) still work in Windows Excel and are what many desks still use for Paste Special (Alt E S V), insert row (Alt I R), delete (Alt E D) and column width (Alt O C W). The site teaches the Ribbon chord and lists the legacy chord as an accepted alternative; it never teaches the legacy chord first.
  - **Mac.** ⌘ replaces Ctrl for the letter shortcuts (⌘C, ⌘1, ⌘B); ⌃ (Control) replaces Ctrl for the number-format chords (⌃⇧1, ⌃⇧4, ⌃⇧5) and for Ctrl+[ and Ctrl+]; the function keys need fn unless the Mac is set to use them as standard keys; Home and End are fn+← and fn+→; PgUp and PgDn are fn+↑ and fn+↓; the Mac "delete" key is Backspace and forward-delete is fn+delete; ⌥ plays Alt for KeyTips. Sheet tabs: ⌥→ and ⌥← (or ⌃PgDn and ⌃PgUp with fn). F2 is ⌃U on a Mac; F4 (anchors and repeat) is ⌘T on older versions and F4 on newer. ⌃Space is taken by macOS on many machines, so a Mac learner uses the Name Box or ⌘⇧↑ ⌘⇧↓ for a column. The first-run note says all of this in one line; each lesson whose command differs carries the one-line mac_note.
  - **Keys the site never teaches first** because Windows or the browser eats them: Ctrl+Shift+0 (unhide columns; blocked by a Windows keyboard-layout shortcut on most machines, so the taught route is Alt H O U L), Ctrl+PgUp and Ctrl+PgDn in a browser tab (the tab_keys_note covers it; Alt+PgDn and Alt+PgUp are the alias, M41; fullscreen or the installed app hands the real keys to the sheet), F1 (browser help), Ctrl+N and Ctrl+W (browser tabs).
  - **The QAT numbers** (Alt then 1–9) are taught in 1.1.4 and assumed everywhere after: Alt 4 Font Color, Alt 5 Fill Color, Alt 6 Borders, Alt 7 Decrease Decimal, after Save, Undo, Redo. A learner who skips 1.1.4 still has the Ribbon chords.
  - **Dialogs.** Tab and Shift+Tab move between fields; the underlined letter (with Alt) jumps to one; Enter is OK; Esc is Cancel. Format Cells and Page Setup open on the tab last used, with the keyboard on the row of tabs: a letter picks a tab (N, A and P in Format Cells, H in Page Setup), Ctrl+PgDn and Ctrl+PgUp step through them, and Tab steps onto the page, where the Category list answers to first letters. So the route to a category is "Ctrl+1, N, Tab, then its letter" (tested in desktop Excel, 2026-09-30).

### 10.2 Chapter 1, lesson by lesson

*Note (2026-09-27): the lesson numbers below are the pre-markup ones (M44 inserted 1.1.2 Know the screen and renumbered the Ribbon, settings and color lessons to 1.1.3–1.1.5; M38 made 1.2.3 the cell basics; M47 rebuilt 1.5.4). The keys are right; the numbering gets fixed when this section becomes keys.csv (M50).*

| Lesson | Headline key | Taught | Also accepted, and the notes |
| :- | :- | :- | :- |
| 1.1.1 The workbook management sent | Ctrl+↓ | ↓, Ctrl+Home, Ctrl+↓, Shift+↑, Ctrl+Shift+↑, Ctrl+PgDn, Ctrl+PgUp, Ctrl+→, the Name Box and the formula bar (read only), Alt H O R rename, Alt H D S delete, Shift+F11 insert, Alt H O M move | Rename: double-click the tab; Alt O H R (legacy). Delete: Alt E L (legacy); right-click. Insert: Alt H I S; Alt I W (legacy). Move: drag the tab; Alt E M (legacy). Mac: ⌘↓, ⌘⇧↑, ⌥→ for the next sheet, fn+⇧F11. |
| 1.1.2 The Ribbon by keyboard | Alt | Alt, the tab letters (H N P M A W), Esc one level at a time, Alt W V G gridlines, Ctrl+1 Format Cells, Alt H O E the Ribbon route to the same dialog | Legacy menu letters (Alt E, I, O, T, D) still open the old menus. Gridlines: Alt W V G is the only route without a mouse. Mac: ⌘1; ⌥ shows KeyTips. |
| 1.1.3 Set Excel up like an analyst | Alt F T | F9 (Calculate Now), Alt F T Excel Options, I on the Formulas page (iterative calculation), Q the Quick Access Toolbar page (↓ to pick, A to add, Enter), Alt then a number to run a toolbar button | Alt T O (legacy Options). Shift+F9 calculates the sheet only; Ctrl+Alt+F9 recalculates everything. Mac: Excel › Preferences is ⌘,; the QAT exists but has no Alt numbers, so the Ribbon chords are the route. |
| 1.1.4 Color, label, one hardcode per cell | Alt H F C | Type then Enter, Alt H F C font color (→ ×4 to the blue), F2 to edit in place, Backspace | Alt 4 once Font Color is on the toolbar (the point of 1.1.3). Ctrl+1 then the Font tab. Mac: ⌘1 Font; F2 is ⌃U. |
| 1.1.C Challenge: another cluster's file | | all of 1.1 | |
| 1.2.1 Jump, don't scroll | Ctrl+Arrow | Ctrl+↓ Ctrl+→ to the edge of the data, Ctrl+Home, Ctrl+End, Home, PgUp, PgDn | End then an arrow ("End mode", the 1990s way; still works). Mac: ⌘arrows; fn+← for Home; fn+↑ fn+↓ for the page keys. |
| 1.2.2 Select like you mean it | Ctrl+Shift+Arrow | Ctrl+Shift+↓, Shift+Space (row), Ctrl+Space (column), Ctrl+A (region), Ctrl+A twice (sheet), Ctrl+Shift+End | Ctrl+Shift+8 (Ctrl+*) is also the current region; Ctrl+Shift+Space is also the whole sheet. Mac: ⌘⇧arrows, ⇧Space; ⌃Space may be taken by macOS, so ⌘⇧↑ then ⌘⇧↓ from the top of a column. |
| 1.2.3 Rows, columns and cells (M38; the id stays around-the-workbook) | Ctrl+Shift+= | Shift+Space or Ctrl+Space then Ctrl+Shift+= inserts, Ctrl+- deletes; Alt H O I AutoFit, Alt H O W width, Alt H O H height, Alt H O A AutoFit row; Alt H A L/C/R alignment; F4 repeats | Alt H I R / Alt H D C are the Ribbon routes. Ctrl+G (or F5) with a cell or Sheet!Range is one goal at the end of 1.2.1 and the jump-by-name in 1.3.5, and is headlined nowhere (Wolf, 2026-09-27: nobody uses it much); the Name Box does the same with the mouse; Mac: ⌃G or fn+F5. Ctrl+PgDn / Ctrl+PgUp are taught in 1.1.2 and 1.2.1. Mac: ⌘⇧= insert, ⌘- delete. |
| 1.2.4 What's typed and what's calculated | Alt H F D S | Go To Special: Alt H F D S then O constants, F formulas, K blanks; Alt H F C on the result | F5 then Alt+S, or Ctrl+G then Alt+S, opens the same Special box. Mac: ⌃G then the Special button (no letter). |
| 1.2.C Challenge: find and mark | | all of 1.2 | |
| 1.3.1 Enter the missing day | Tab | Tab commits and moves right, Enter commits and drops to where the Tab run began, Esc throws an entry away, Ctrl+A then Go To Special blanks, Ctrl+Enter fills the selection with one entry, Delete clears | Shift+Tab and Shift+Enter go the other way. Mac: the "delete" key is Backspace; forward-delete (clear the cell) is fn+delete. |
| 1.3.2 Fix it in place | F2 | Ctrl+F find, F2 edit, Home and End inside the entry, ← →, Backspace, type-over replaces, Ctrl+Z, Ctrl+Y | Shift+F4 is Find Next with the box closed. Ctrl+Y and F4 both redo when there's something to redo; F4 repeats the last action otherwise (1.5.4). Mac: ⌘F; F2 is ⌃U; ⌘Z, ⌘Y. |
| 1.3.3 Copy, cut, paste, fill | Ctrl+C | Ctrl+C, Ctrl+X, Ctrl+V, Esc drops the marquee, Enter pastes once and drops it, Ctrl+D fill down, Ctrl+R fill right | Ctrl+Insert, Shift+Insert, Shift+Delete (Windows legacy copy, paste, cut). Alt H F I D and Alt H F I R (the Fill menu); Alt E I D (legacy). Mac: ⌘C ⌘X ⌘V ⌘D ⌘R. |
| 1.3.4 Paste Special: values, formats, transpose | Ctrl+Alt+V | Ctrl+Alt+V then V values, T formats, E transpose, Enter | Alt E S V (legacy, and the one most desks still say out loud); Alt H V S opens the same box; Alt H V V is the paste-values button; Ctrl+Shift+V pastes values in current Excel; the right-click paste icons. Mac: ⌘⌃V; ⌘⇧V pastes values in current versions. |
| 1.3.5 Find, replace, fill a timeline | Ctrl+H | Ctrl+H, Tab to the Replace field, Alt+A Replace All, read the count, Ctrl+F, Alt H F I S Fill Series | Alt E E (legacy Replace). Fill Series: the fill handle with the mouse, or Alt E I S (legacy). Mac: ⌃H for Replace; ⌘F for Find; Fill Series is Home › Fill (mouse or ⌥ KeyTips). |
| 1.3.C Challenge: complete the feed | | all of 1.3 | |
| 1.4.1 Rows and columns that keep the totals honest | Ctrl+Shift+= | Shift+Space, Ctrl+Shift+= insert, Ctrl+D, Tab runs, Ctrl+Space, Ctrl+− delete, Ctrl+Z after a #REF! | Ctrl++ on the number pad is the same insert; Alt I R and Alt I C (legacy insert row and column), Alt H I R and Alt H I C (Ribbon); Alt E D (legacy delete), Alt H D R and Alt H D C. Mac: ⌃I insert, ⌃− delete (⌘⇧= also inserts). |
| 1.4.2 Widths, heights, AutoFit | Alt H O W | Alt H O W column width, Alt H O I AutoFit column, Alt H O H row height, Alt H O A AutoFit row, Alt H W wrap text, Ctrl+Z | Alt O C W, Alt O C A, Alt O R E, Alt O R A (legacy). Double-click a column edge for AutoFit with the mouse. Mac: Format › Column › Width from the menu bar; ⌥ KeyTips where present. |
| 1.4.3 Hide, group, freeze | Alt+Shift+→ | Ctrl+0 hide columns, Ctrl+9 hide rows, Ctrl+Shift+) unhide columns, Ctrl+Shift+( unhide rows, Alt+Shift+→ group, Alt+Shift+← ungroup, Alt A H hide detail, Alt A J show detail, Alt W F F freeze panes | Ctrl+Shift+) is Ctrl+Shift+0 and is blocked on most Windows machines: teach Alt H O U L (unhide columns) and Alt H O U O (unhide rows) as the reliable route. Alt A G G and Alt A U U (Group and Ungroup on the Ribbon). Ctrl+8 shows and hides the outline symbols. Alt W F R freezes the top row only, Alt W F C the first column only. Mac: ⌃0 ⌃9, ⌃⇧0 ⌃⇧9, ⌘⇧K group, ⌘⇧J ungroup, Window › Freeze Panes. |
| 1.4.C Challenge: reshape the report | | all of 1.4 | |
| 1.5.1 Numbers a banker can read | Ctrl+1 | Ctrl+1 then N for the Number tab, Tab, then N C P (the categories by first letter), Ctrl+Shift+1 Number format (a separator, two decimals, a minus for a negative), Ctrl+Shift+4 currency, Ctrl+Shift+5 percent, Alt H 9 decrease decimal, Alt H 0 increase decimal, Ctrl+G | Alt H K (Excel's own Comma Style button: an Accounting format, with parentheses and a dash for zero), Alt H N (the number-format box), Alt H A N (accounting); Alt and its number for Decrease Decimal once it's on your toolbar. Ctrl+Shift+~ general, Ctrl+Shift+2 time, Ctrl+Shift+3 date, Ctrl+Shift+6 scientific. Mac: ⌘1; the chords are ⌃⇧1 ⌃⇧4 ⌃⇧5 (Control, not Command). |
| 1.5.2 Fonts, fills, borders | Alt H B | Ctrl+B, Ctrl+I, Ctrl+U, Alt H F G increase font size, Shift+Space, Alt H B P top border, Alt H H fill color (Enter for the first tint) | Alt H B then O bottom, A all, N none; Ctrl+Shift+& outline border, Ctrl+Shift+_ remove borders; Ctrl+1 then the Border tab; Ctrl+Shift+> and < change font size; Alt 5 and Alt 6 from the toolbar. Mac: ⌘B ⌘I ⌘U; ⌘⌥0 outline, ⌘⌥− remove; ⌘⇧> font size. |
| 1.5.3 Alignment and titles | Ctrl+1 | Ctrl+1 then A (Alignment tab), Horizontal › Center Across Selection, Ctrl+Shift+→ to prove nothing merged, Alt H A R right, Alt H A L left, Alt H A C center, Ctrl+I, Alt H 6 indent, Alt H 5 outdent, Alt H W wrap | Alt H M C is Merge & Center: the thing not to press. Alt O E (legacy Format Cells) then Alignment. Mac: ⌘1 Alignment; the indent buttons on the Home tab. |
| 1.5.4 The style pass | F4 | Ctrl+1 N, F4 repeats the last action on the new selection, Alt H A R, Ctrl+B, Ctrl+A, Alt H B N | Ctrl+Y repeats when there's nothing to redo. Format Painter (Alt H F P; Ctrl+Shift+C and Ctrl+Shift+V copy and paste formats in current Excel) does the same job with more keys. Mac: ⌘Y repeats. |
| 1.5.C Challenge: the team's format in three minutes | | all of 1.5 | |
| 1.6.1 Point, don't type | = | = starts a formula, arrows point at a cell, Ctrl+← Ctrl+→ jump the pointer to a data edge, − and / as operators, F2 lights the references in color, Esc, Ctrl+D, Ctrl+1 N | Pointing with the mouse is accepted and counts as mouse. Mac: the same; F2 is ⌃U. |
| 1.6.2 SUM family and AutoSum | Alt+= | Alt+= over a block writes every column's SUM, pointing, Tab and Enter runs, AVERAGE MAX MIN COUNT COUNTA typed, Ctrl+Shift+1 | Alt H U S (the AutoSum button) and Alt M U S (Formulas tab). Mac: ⌘⇧T. |
| 1.6.3 Anchors: $ and F4 | F4 | F4 inside an open formula cycles C5 → $C$5 → C$5 → $C5, Ctrl+B, Alt H F C, Ctrl+Shift+4, Ctrl+Shift+1, Ctrl+R, Ctrl+D, F2 to read back, Delete | Typing the $ by hand is accepted and slower. Mac: ⌘T cycles anchors on older versions, F4 on current ones; the lesson's mac_note says so. |
| 1.6.4 Link across sheets | Ctrl+PgDn | = then Ctrl+PgDn to point on another sheet, arrows there, Enter or Ctrl+Enter, F2 F4 to anchor Inputs!$B$4, Alt H F C green (→ ×8), F4 to repeat the color | Typing Raw!I8 is accepted. Ctrl+[ follows a link back (1.6.6). Mac: ⌥→ switches sheet while the formula is open. |
| 1.6.5 One formula per row, filled right | Ctrl+R | cross-sheet pointing, Ctrl+R, Ctrl+` show formulas, F2 then Ctrl+Enter refills a row from its own formula, Alt H F C | Alt M H is the Show Formulas button. Mac: ⌃`. |
| 1.6.6 Read the error, follow the trail | Ctrl+[ | F2, Home and → inside the entry, Delete, Backspace, Ctrl+[ selects precedents, Ctrl+] selects dependents, Ctrl+D, Ctrl+Enter, Ctrl+G, Ctrl+Alt+V T | Alt M P draws precedent arrows, Alt M D dependent arrows, Alt M A A removes them; F5 then Enter goes back after a Ctrl+[; Alt M V Evaluate Formula; F9 inside an open formula shows the value of the selected part (then Esc, never Enter). Mac: ⌃[ ⌃]. |
| 1.6.C Challenge: the site P&L | | all of 1.6 | |
| 1.7.1 Fit to one page | Alt P S P | Ctrl+End then Ctrl+Home to read the extent, Alt P O L landscape (P portrait), Alt P S P Page Setup then F Fit to, Alt P I Print Titles (rows 1:4), Alt+H the Header/Footer tab, Alt+R the right section, &[File] and &[Date] | Ctrl+P then the Page Setup link; Ctrl+F2 print preview; Alt P S O orientation from the Ribbon. Alt F U (legacy Page Setup). Mac: File › Page Setup; ⌘P. |
| 1.7.2 The checks row | = | a live difference (=SUM(D5:D8,D10)−Raw!J13), =SUM(range)−total, =IF(AND(…),0,1), Ctrl+Shift+1, Ctrl+[ to show what a check reads | Nothing new. |
| 1.7.3 Hardcode hunt | Ctrl+` | Go To Special constants, Alt H F C, F4, Ctrl+` on and off, pointing, F2 then Ctrl+Enter, Ctrl+Shift+) unhide, Ctrl+1 A, Ctrl+I, Alt H B N, Alt W V G | Alt M H; Alt H O U L for the unhide. Mac: ⌃`. |
| 1.7.C Challenge: audit before you send | | all of 1.7 plus the center footer section (Alt+C) and &[Page] of &[Pages] | |
| 1.8.P Project · 1.8.A Assessment | Ctrl+PgDn | everything above, no teach lines | |
| 1.8.T Test out (retired into the Practice drill "Audit: ten faults", M26) | Ctrl+G | Ctrl+G to each fault, then the module's key | |

### 10.3 Chapters 2–6, module by module (planned)

*Note (2026-09-27): module numbers below follow the earlier map; the curriculum in section 5 moved lookups to Chapter 4 and DCF to Chapter 5. The keys are the same; the numbering gets fixed when section 5 locks.*

The keys each planned module needs, so the lessons can be scaffolded and the Reference page can be complete before the lessons are written. Functions are listed by name; the keystroke rules from Chapter 1 carry.

| Module | Keys and commands | Alternatives and notes |
| :- | :- | :- |
| 2.1 Number formats | Ctrl+1, N, Tab, then N/C/P/D (Date) in the Category list, Ctrl+Shift+1 4 5 3, Alt H 9 and 0, Alt H K, the sign convention in the format | Alt H N box; Ctrl+Shift+3 is d-mmm-yy. |
| 2.2 Custom number formats | Ctrl+1 then Custom (U), the four-section code positive;negative;zero;text, "k" "m" "x" and bps as literal units, TEXT(), a color or a condition in the first section, an empty section to hide a zero | The Number Format box (Alt H N) ends with More Number Formats, which opens the same tab. |
| 2.3 Model formatting standards | Alt H B (borders), Alt H H (fills, the A/E shading), Alt H F C, Alt H 6 indents, Shift+F2 (a note), Alt R C (a threaded comment) | Ctrl+1 Border tab for a double bottom; Alt H B then B for a double bottom border. |
| 2.4 Alignment and structure | Alt H W, Alt H 6 and 5, Ctrl+1 A Center Across Selection, Alt+Shift+→ and ← with outline levels, Alt A H and J, Ctrl+8, Ctrl+K hyperlinks, Ctrl+F3 names for anchors | Alt A G G, Alt A U U; F5 to a named anchor. |
| 2.5 Conditional formatting | Alt H L then N new rule, H highlight rules, T top/bottom, D data bars, S color scales, I icon sets, R manage rules, C clear rules; formula-driven rules (=B34<>0) | Alt O D (legacy Conditional Formatting). |
| 2.6 Dates and text for presentation | TEXT, EOMONTH, EDATE, & for concatenation, TRIM, PROPER, SUBSTITUTE; Ctrl+; today's date, Ctrl+Shift+; the time | CONCAT and TEXTJOIN in current Excel (accepted, not taught first). |
| 2.7 Printing and page layout | Alt P R S set print area, Alt P I, Alt P S P, Alt W I page break preview, Alt P B I insert a page break, Ctrl+P, Ctrl+F2 | Alt W L back to normal view. |
| 3.1 Logic | IF, IFS, AND, OR, NOT, MIN and MAX instead of a nested IF, IFERROR, ISNUMBER, ISBLANK; F9 on a selected part of a formula | Ctrl+Shift+A after a function name inserts its argument names; Shift+F3 opens Insert Function. |
| 3.2 Dates | DATE, YEAR, MONTH, DAY, EOMONTH, EDATE, YEARFRAC, DAYS, the serial number behind a date (Ctrl+Shift+~ shows it) | DATEDIF exists and is undocumented; accepted, not taught. |
| 3.3 Math and aggregation | ROUND, ROUNDUP, ROUNDDOWN, ABS, CEILING, FLOOR, COUNTIF, COUNTIFS, SUMIF, SUMIFS, AVERAGEIF, AVERAGEIFS, LARGE, SMALL, RANK, SUMPRODUCT; F4 anchoring on every criteria range | MAXIFS and MINIFS accepted. |
| 3.4 Lookups | VLOOKUP, HLOOKUP, MATCH, INDEX, INDEX/MATCH one- and two-way, XLOOKUP, CHOOSE, INDEX as a scenario picker, OFFSET and INDIRECT and why the team avoids them, ROW and COLUMN as counters | Ctrl+A after typing a function name opens the Function Arguments box. |
| 3.5 Text | LEN, LEFT, RIGHT, MID, FIND, SEARCH, SUBSTITUTE, TRIM, VALUE, DATEVALUE, TEXT; Alt A E Text to Columns; Ctrl+E Flash Fill | Alt D E (legacy Text to Columns). |
| 3.6 Time value of money | PV, FV, PMT, PPMT, IPMT, NPV, XNPV, IRR, XIRR; a payment schedule with anchors | RATE and NPER accepted. |
| 3.7 Auditing | Ctrl+[ and Ctrl+], Alt M P, Alt M D, Alt M A A, Alt M V Evaluate Formula, Alt M H, Alt M K error checking, Alt M W Watch Window, Go To Special formulas and constants, Data › Edit Links for external links | F5 Alt+S; Ctrl+Shift+{ selects all precedents, Ctrl+Shift+} all dependents. |
| 4.1 Lists and tables | Alt A S S sort dialog, Alt A S A and S D, Ctrl+Shift+L filter on and off, Alt+↓ opens a filter, SUBTOTAL(9,…) and (109,…), Alt A M Remove Duplicates, Alt A V V Data Validation (a list for the scenario picker) | Alt D S sort, Alt D F F filter, Alt D L validation (legacy). |
| 4.2 Summaries from raw rows | SUMIFS, COUNTIFS, AVERAGEIFS, SUMPRODUCT with date ranges, the KPI block with a checks row | |
| 4.3 Scenarios and sensitivity | CHOOSE and INDEX case toggles, Alt A W T Data Table (one- and two-way), Alt A W G Goal Seek, Alt M X E calculation "automatic except data tables", the pass-through driver when a data table can't reach an input | Alt D T (legacy Data Table). |
| 4.4 Scenario structure | one model, one toggle; Alt H F C for the case cell; Alt H L for the active-case highlight | |
| 4.5 Circularity | Alt F T then Formulas › iterative calculation; the breaker cell; IFERROR around the circle | Alt T O (legacy). |
| 4.6 Named ranges and structure | Ctrl+F3 Name Manager, Alt M M D Define Name, Ctrl+Shift+F3 create from selection, F3 paste a name, Ctrl+G to a name, Ctrl+K hyperlinks | Alt I N D (legacy define name). |
| 4.7 Pivot tables | Alt N V T insert a PivotTable, the field list, Alt J T for the PivotTable Analyze tab, Alt F5 refresh, group dates, value field settings, GETPIVOTDATA | Alt D P (legacy PivotTable wizard). |
| 5.1 Excel best practices and efficiencies | the fill patterns: Ctrl+Shift+→ then Ctrl+R, Alt+= across a block, Ctrl+Enter, F4 while typing, Ctrl+Alt+V T after a build; the sheet order and the checks sheet | |
| 5.2 Schedules | MIN and MAX for caps and floors, SUMPRODUCT, EOMONTH timelines, the average-balance interest circle with a breaker, Alt F T iterative | |
| 5.3 The three statements | cross-sheet linking by pointing, Ctrl+[ to follow, the balance check as a live difference, MIN and MAX for the cash sweep and the revolver | |
| 5.4 Auditing a model | Ctrl+[ ], Go To Special, Ctrl+`, Alt M K, Alt M W, stress tests by typing into inputs and Ctrl+Z | |
| 5.5 Model speed | timed builds of 5.1–5.3 patterns | |
| 5.6 DCF (taught in Chapter 5) | NPV and XNPV against a hand-built discount factor, SUMPRODUCT discounting, the mid-year convention, Alt A W T sensitivity tables on WACC × g and exit multiple | |
| 6.1 Trading comps | INDEX/MATCH or XLOOKUP into the comp set, MEDIAN, AVERAGE, QUARTILE, calendarization arithmetic, LTM from quarters | |
| 6.2 Precedent transactions | the same lookups and statistics on deal data; premiums | |
| 6.3 LBO: the sponsor's bid | sources and uses that balance, MIN and MAX for the cash sweep, IRR and XIRR, MOIC, the returns bridge, Alt A W T on entry × exit multiple | |
| 6.4 The bids and the waterfall | a distribution waterfall with MIN and MAX, the football-field table (no chart); accretion/dilution is parked (4.10) | |

### 10.4 What the Reference page should list

Every key in 10.2 and 10.3, grouped by what it does (move, select, enter and edit, copy and fill, format, formulas, audit, structure, print, the dialogs), with the Ribbon chord, the legacy chord where one exists, and the Mac key on every row. The Reference page is the one place alternatives are shown side by side; lessons show one route. The page's own lines are in 3.15; the build is M50 and M57.

## 11. Decision log

One line per decision, newest last. Founder decisions are marked (Wolf); Claude's working calls say so and stand until overruled.

  - 2026-09-23 (Wolf): headline "Excel isn't learned. It's practiced."
  - 2026-09-26 (Wolf): inclusive means the content works for anyone; the copy doesn't hedge about who the learner is. The voice is the in-person analyst course.
  - 2026-09-27 (Wolf): the screenplay lives in this project, not Google Docs; approvals happen in chat.
  - 2026-09-27 (Wolf): the working method is a question-and-rewrite session: rounds of 10–15 items with defaults, Wolf rewrites lines in his own words, Claude assembles one comprehensive document for the build orchestrator.
  - 2026-09-27 (Wolf, Round 1): ten calibration lines in his voice (section 2). Read-outs from them, pending his confirmation: the learner works for Voltline, on the company side, preparing a sale to private equity (not the bank's analyst); the voice is warmer and more explanatory than the drafts, with aspiration allowed ("top firm", "elite firms", "power users"), "we" and "let's" allowed, dashes used freely, teach lines as short paragraphs, and clipped fragments on drill and marketing surfaces.
  - 2026-09-27 (Claude, pending): the nine open questions in 9.1 and the four in 9.4 carry working answers.
  - 2026-09-27 (Wolf, Round 2): company side confirmed: you work at Voltline, on the finance team, no title. Your work is checked by the CFO, then the bankers once hired, then the buyer's diligence requests. Buyers are PE only; Chapter 6 is valuation plus the LBO the sponsor runs, no merger math; the chapter is named along the lines of "Finance and valuation". "Client-ready" stays. Voltline stays if it can be made intuitive, and Wolf is open to another company if it makes the data cleaning make more sense. Best-practice asides ("ideally the source sits in a comment") are lesson dialogue, not engine features. Brief cap raised to five sentences and 110 words, with UI notes so a longer brief stays readable and interactive; teach lines up to three sentences with the why inside, the separate why field retired; done screen is one line then a short paragraph. Un-banned: let's, we, secret, power users, elite firms, top firm.
  - 2026-09-27 (Wolf, Round 3): the case is an express car wash (section 4 rebuilt; Chapter 1 is re-skinned, tasks kept). The mess comes from five site managers' sheets; the POS export is the clean truth in Chapter 3. Chapters: Foundations · Formatting · Formulas · Data and Lookups · Finance and Accounting · Valuation; comps and precedents are where sorting and filtering get applied at scale; the DCF is a full finance module and sits at the end of Chapter 5 (Claude's placement, pending). Asides: "Best practice" for habits, "Top-bucket tip" for the nitpicky formatting details. Puzzle lessons are drills in Practice. The test-out must be robust: the chapter assessment is the only test-out, timed, spanning every module; the three-task fault-fix is retired. Completed = lessons + project. Program certificate: "hotkey.gg Certified · Excel for Finance". No exports; everything stays on the platform. All six chapters fully written and built at launch, sized to a 10–20 hour paid course (about 18 hours guided).
  - 2026-09-27 (Wolf, Round 4): the deal is Project Rinse; the company is Brightwash Express (working; a wink at the express-wash chain that filed in 2025, so a restructuring chapter can follow as DLC, 4.8a), or Brightwash. Math kept easy for illustration. DCF at the end of Chapter 5. Chapter 5 opens with "The three statements" taught in DCF order (IS, CFS, BS) as full accounting-and-Excel lessons. The Chapter 6 waterfall also values the learner's own options. Lookups (4.1) open with why a model reads a dataset, the advantage over courses with toy examples. Chapter 1's assessment must prove navigation, selection, Paste Special, the Ribbon and the rest (coverage list in section 5). Certificate: "hotkey.gg Certified · Excel for Finance". Hours nearer twenty; Wolf notes Claude overestimates how long things take, so the fix is more content, not longer estimates. Drills still to be designed (Round 5).
  - 2026-09-27 (Wolf, Round 5): company name is Brightwash Express (Zest dropped). Drills graded on end state with readable check lines; 36 skill drills plus 40 challenges, built around the real formatting conventions; free = Chapter 1 drills, rapid-fire, the Daily; the Daily draws from everything; Due today is replaced by quests inside the existing systems; rapid-fire rebuilt as the instant-feedback mode; Keep sharp becomes a quest; puzzle drills yes; pars tuned aggressively; boards seeded with real accounts, rank retired at launch (Claude's call, Wolf indifferent); sandbox dropped; drill copy tight; achievements refined with a pixel-art brief per badge. Wolf asked whether more voice samples would help; Claude asked for a second batch across unsampled surfaces (Round 6).
  - 2026-09-27 (Wolf, Round 6): nine blind voice samples (section 2). Read-outs: story cards address the learner directly and state the stakes plainly; done screens give the practical desk reason (a top border survives inserted rows); finance is explained through a member and a wash; top-bucket tips are firm-neutral polish (Claude sources the list, 4.8); the landing line is plain and aspirational ("the better way to master Excel"); the paywall is dry ("Go Pro for the rest of the content"), which names the paid tier; the stuck hint is a visual cue first; achievements get a catalog review once the systems settle; the tone to avoid is vague-and-cute ("ctrl whatever makes you fly across the page"). Section 2 rewritten from both batches. Module 1.1 rewritten in the voice and re-skinned to Brightwash in claude/script-ch1.md for Wolf's markup.
  - 2026-09-27 (Wolf, markup of module 1.1): concrete wording, not "dead one" or "scratch tab" ("rename the Sheet2 tab", "delete last week's export"); a quicker, more intuitive navigation opener instead of sixty presses (M30); the reflex sentence cut; the done screen ends on the file's status (to the CFO, into the VDR); the Ribbon lesson opens with a played demo (M31) and says "hotkey", not "playing chords"; a Mac note on KeyTips and the function-key setting (M33); gridlines are a preference, not a rule; the settings lesson rewritten plainer, with mock dialogs (M32) and a note on the fuller desk QAT (M35); 1.1.4 says plainly what "one hardcode per cell" means and shows the whole color key (M34); "another location" instead of "sister cluster"; best practice on sources is a comment with a web link, file path, page number or quote. Module 1.1 is v3 in the script.
  - 2026-09-27 (Wolf, markup 2 of module 1.1): the settings brief opens "Let's make sure you have your settings configured like a pro" and explains F9 and Manual calculation in plain terms; 1.1.4 becomes a simple, robust font-color lesson – read each cell, color it by kind, every color in the key, pseudo-gamified with per-cell ticks, a note on auto-coloring add-ins – and the hardcode-in-a-formula line is gone from it (M36). Module 1.1 is v4.
  - 2026-09-27 (Wolf): fold in the basics we'd been assuming – F2 and edit mode, the Font Color route, Ctrl+1, selecting across cells. Done in module 1.1 (v5) and listed for the whole chapter in section 5 ("Basics the lessons never assume"). Module 1.2 written in the voice (v1) for markup.
  - 2026-09-27 (Wolf): don't emphasize Ctrl+G – nobody uses it much; use the slot for inserting and deleting rows and columns, widths, heights, AutoFit, alignment, the basics of cells. Done: 1.2.3 is "Rows, columns and cells", Go To is one goal (M38). Module 1.3 written (M39). Wolf: keep building and framing to this vision.
  - 2026-09-27 (Wolf, markup of 1.3): teach entering the desk way (Enter stays, per the courses), Home/End and word jumps inside a long formula, named cells; find errors by flicking F2/Esc rather than Ctrl+F, and introduce F4; make cut versus copy explicit; in Paste Special teach Multiply and Divide (signs, units, currencies) and push the value of Paste Formats; Ctrl+H is rarely used, so 1.3.5 became the small-keys lesson (names, notes, Ctrl+;, Ctrl+Backspace, Fill Series); the browser eats Ctrl+PgUp/PgDn, so an alias (M41); linking across sheets needs clearer teaching (M42). Modules 1.1–1.3 are v2–v5 in the script. Wolf asked where we are: 3 of Chapter 1's 7 modules written; 1.4–1.8 next.
  - 2026-09-27 (Wolf): no Excel Tables; add the zoom keys, the formula bar, a UI tour (now lesson 1.1.2, M44); Alt+PgDn/PgUp as the browser alias is fine; the Enter setting is the course default, validated against the Financial Modelling Handbook (F1F9), which unticks "After pressing Enter, move selection"; anchors and anchor cycling get full treatment in 1.6.3; notes taught with a demo and the hotkey, only the source label graded (M45); four QAT commands. Modules 1.4 and 1.5 written (M46). Claude's working calls on the unanswered ones: the plan is Pro and the drill tiers are Pass · Expert · Legendary; the headline stays with Wolf's subhead under it; mouse tricks appear as asides only.
  - 2026-09-27 (Wolf): drill tiers are Pass · Expert · Legendary; 1.5.3 gains dialog navigation; 1.5.4 rebuilt around Paste Special Formats for a whole table and F4 for repeats (M47); anchors taught with fill right and down; a named cell in a 1.6 formula; "Does it tie?" closes every lesson and the chapter reads as one exercise from a garbled workbook to a finished page; no speech on story cards, an email fragment as commentary is fine (M49); assessments sized by start and end state and volume of tasks, ten minutes is fine. Modules 1.6, 1.7 and 1.8 written (M48): Chapter 1 is now complete in the voice, 39 items, 315 goals.
  - 2026-09-27 (Wolf): continue in a new session; the session prompt in Start here is rewritten for it, with the five open questions to ask first. Goal unchanged: one comprehensive master plan for the Claude Code orchestrator.
  - 2026-09-27 (Wolf, new session): ok to all six defaults – the site's own copy first, then Chapter 2; Claude drafts deal cards 2 and 3 from his card 1; landing captions as fragments with pipes for all six modes; quests three daily and three weekly from the 6.6 pool; the Reference page carries the full key list with Windows, Mac and legacy columns; the stacked-fragment tic ("new page, on your own, timed") is ruled out in lesson prose ("just be like time to execute"), added to section 2 and swept from Chapter 1's story cards and done screens. Section 3 rewritten to the company side (3.1–3.16).
  - 2026-09-27 (Wolf): the company is renamed; Brightwash is dropped so nothing can be read as a reference to a real business he has worked with. Claude offered Clearcoat, Clearcoat and Sabine after a search found no car wash trading under any of them (Bluebonnet, the first idea, is used by several small Texas washes). (Wolf): **Clearcoat Express.** Applied throughout the master and the Chapter 1 script; the trademark search before ship stays on the list.
  - 2026-09-27 (Claude, pending): quests pay 25 XP daily and 75 weekly (M54); the print-preview reviewer is the CFO in Chapter 1, the associate from Chapter 2, the buyer's analyst from Chapter 3 (M55); the lesson-complete titles and every tier surface use Pass · Expert · Legendary (M53); certificates get their lines in 3.16 ahead of Phase F.
  - 2026-09-27 (Wolf): the Reference page should show which hotkeys a learner has collected or practiced, keep the old "Practice it" button, and could pop out an animation of the key being used in the engine. (Claude): all three are in as M57 – a state per key (taught · practiced · under par), "Practice it" as a twenty-second single-key drill, and "Show me" as the M31 demo engine on a small sheet, which is a scripted replay, not a video, so it costs little; the copy is in 3.15.
  - 2026-09-27 (Wolf): pricing might be per chapter or a $7/month subscription for everything, or both; he likes a flat fee per chapter for perceived value and room for DLC (the Wizard101 model) and asked for Claude's best suggestion. (Claude, pending): own a chapter for $19, Pro for $59 once or $9 a month, a chapter purchase credits toward Pro for 30 days, DLC at chapter price; entitlements per chapter with Pro granting all (M58); reasoning in 9.1 question 11. Nothing on the live pricing page changes without his go-ahead.
  - 2026-09-27 (Wolf): tone down the banker framing; the story is the company rationalizing its data, cleaning up its worksheets and working its financials so a sale process has what it needs. Rule added to 4.7 and the session prompt; deal cards 2 and 3, the Learn and Home lines and four Chapter 1 lines (1.7 story card, 1.7.3 and 1.7.C briefs, 1.8.P brief) rewritten.
  - 2026-09-27 (Wolf): landing captions cut to one clause each, his words for four of them (Challenges – work through a full solution, timed · Drills – build muscle memory · Rapid-fire – reach flow state · Leaderboards – see who's the fastest); quests cut to his list (complete a lesson, finish drills, play the Daily, pass and Expert on a drill, score in rapid-fire, a clean lesson, rerun a challenge, a new personal best, rapid-fire rounds) plus fun hotkey-count quests Claude generated (6.6). Red pen (section 7) and the Chapter 2–6 drill task lines (6.2) drafted in the voice; achievements catalog put up for his review (6.7). Next: Chapter 2.
  - 2026-09-27 (Wolf): pricing stepped down to a decent Steam game – $29 to own the whole course, or $10 a month; one plan (9.1, question 11). Quests need a dopamine loop – progress bars, completion animations, rewards – and XP has to be worth something; (Claude, pending) the loop and an XP economy with a reward at every level are in 6.10 (M59, M60). Four correction lines written blind (section 2, calibration); the read-out – plain words with the desk word beside them, "we", the reason for the reader, two sentences allowed – applied to all 33 lines in 7.2. Achievements delivered as text prompts with a pixel-art style guide (6.7b). Deal card 2 is good. Chapter 2 shelled with the broader plan laid out first: the six products and the skills bucketed (section 5), then claude/script-ch2.md (workbook, finance taught, seven story cards, every lesson's brief and goal outline); teach lines and stuck cues follow his bucketing pass. (Claude, pending): dynamic arrays as one lesson in 4.2 (9.1, question 12; M61).
  - 2026-09-27 (Wolf): change the method – develop the full curriculum within his guidance (platform, case, objectives, lesson ideas, Chapters 2–6 shelled so everything fits and is bucketed), then one feedback pass of 20–30 general points, then code, then play, then more feedback. (Claude): agreed, with three guards against drift over 166 lessons – a skill is taught once, reinforcement is planned, finance arrives with the Excel that carries it – written into section 5 with the curriculum in one view. Every level gives flair, repurposing the best skins and content from the old build (6.10, M60). The correction-line rewrites are solid; the best-practice and resilience framing stays. Badge art is hand-drawn, Terraria-type pixel art, not Game Boy (6.7b). Deal card 2 may change with the full pass.
  - 2026-09-28 (Claude): Chapters 3–6 shelled to the Chapter 2 depth (claude/script-ch3.md to script-ch6.md): workbooks with figures that tie across chapters (FY26E revenue $50m, EBITDA $16.6m, 40 sites, entry EV $195m), the finance defined through the car wash and placed by lesson, story cards, briefs, goal outlines, done lines, challenges, project and assessment, keys, engine needs, open calls. Redundancies removed in the shelling: EOMONTH stays in 2.6.2 (3.2.3 became period keys); the case toggle stays in 4.5.1 (4.1.6 became approximate match for bands); hyperlinks stay in 2.4.4 (4.6.3 became a validation list by name); Chapter 5's audit adds only what a model needs (row differences, error counts, stress tests). Counts: 166 lessons, 38 challenges, about 20.5 hours.
  - 2026-09-28 (Wolf): tips and tricks to make sure of – sticky IFs to hold data for output; INDEX/MATCH (or "CHOOSEIFS") to populate data across a sheet, maybe Chapter 5; a robust finance curriculum on the CFS, IS and BS – what the statements mean, what they are, how they work and flow together; best practices for adding checks, throughout the course and especially in the model phase; stop overemphasizing hotkeys like Ctrl+G; Data and Lookups is thin; add the tips and tricks a custom in-person WSP course would give. (Claude): applied – 4.5.6 Case outputs side by side (a one-way data table on the case switch, and the sticky IF, labeled as a hardcode that looks like a formula); 5.2.5 Populate the statements from the data tab (INDEX/MATCH on label and year, SUMIFS where labels repeat; "CHOOSEIFS" read as this – CHOOSE on the case switch is already 4.5.1; pending Wolf); 5.1.5 How the three statements link (the five links, each proved with Ctrl+[) with 5.1 now seven lessons; "The checks thread" in section 5 (where each check pattern is taught from 1.7.2 to 6.4.4, and the model's check catalog with its conventions: live difference, ROUND(…,2), red when non-zero, SUMPRODUCT(ABS()) roll-up, OK / CHECK on the Cover and every output page) with 5.2.4 carrying the catalog and the ROUND rule; Chapter 4 deepened by 4.1.7 Multi-criteria lookups, 4.2.5 Filter tricks (Alt+; visible cells, wildcards, skip blanks), 4.3.6 3D references and grouped sheets, and 4.5.6; the corkscrew named in 5.3, the Watch Window in 5.5.2, Alt W N / Alt W A in 5.4.1; "The tips and tricks, placed" in section 5 (about sixty-five, each with its lesson; the asides marked new get written at goal level in the next pass); Ctrl+G is one goal in 1.2.1 and the jump-by-name in 1.3.5, headlined nowhere, and the stale 10.2 row is fixed. Counts: 172 lessons, 38 challenges, about 21.5 hours.
  - 2026-09-28 (Wolf): more of the desk content – Alt+= for a sum, + instead of = to start a formula, INDEX/MATCH and CHOOSE to set up a model's drivers with different assumptions and a selector; audit for the "learned from a banker in person" content against "generic Excel course", since that's the value proposition; as outputs, the full curriculum, plan and scaffolding that code builds from, and an abbreviated summary for his review (chapters, chapter text, lessons, hotkeys, the gist of each lesson). (Claude): Alt+= was already 1.6.2 (with the block-plus-edge trick); + as a formula start added to 1.6.1's done screen with M63 for the engine; the case toggle was 4.5.1 – now with the active-case shading, the case name in the title and the OFFSET note – and Chapter 5 gets 5.2.6 The drivers block (three cases by year on Inputs, the Cover's Case as the selector, one live block through the projection flag, scenarios vs sensitivities), which the schedules now read; the desk audit is a section-5 table (about fifty items: placed, added, or out with the reason) and the additions are CAGR/RRI (2.1.3), a negative typed as (500) (2.1.2), MOD period flags (3.2.3), running totals (3.5.4), bounded ranges (4.3.1), COLUMN() counters and same-year-same-column (5.2.2); the review view is claude/curriculum-summary.md, generated from the shells; the full scaffolding stays the screenplay plus the six chapter scripts, assembled into one file (the Build Book) on request rather than kept as a thirteenth doc that would go stale. Counts: 174 lessons, 37 challenges, about 21.5 hours (Chapter 1 had been carried as 29 · 8; it is 30 lessons and 7 challenges, plus the project and the assessment, which no chapter counts).
  - 2026-09-28 (Wolf): run the extraction of his paid course materials (videos, workbooks, PDFs) in a standalone session, and asked straight whether scraping paid content he holds for personal use is a problem. (Claude, not a lawyer): the techniques are free to teach and every course teaches the same ones; their expression isn't – wording, exercises, datasets, puzzle framings, slide text – and the download itself is the weak point (a personal license, streaming-only terms, possibly an access-control question), so the exposure is a bad fact pattern in a copying dispute more than a claim on its own. Rules adopted for the extraction session: techniques not text, nothing from the source files persists but the checklist, transcripts deleted, confidential employer or provider material skipped, our lesson map unchanged; the workbooks and PDFs the course offers for download are the lower-risk source, the public lesson list is free, and the videos add the least. A CC test on one lesson: no subtitle stream and no burned-in captions, so audio is transcribed locally (about 0.4× real time); the test transcript was deleted after the check. An IP attorney's half hour recommended before launch marketing names any course.
  - 2026-09-28 (Wolf): hand this session over to a new one without file uploads or transfers, using git for continuity if feasible; he has no Mac. (Claude): the docs already live in the project, so continuity is project_read; the helper scripts and the Build Book assembly go into claude/tools.md so nothing depends on a session's workspace; a docs/screenplay snapshot commit was prepared for the repo but the push was refused (the repo wasn't among this session's sources) – the next session started with the repo as a source pushes it; the extraction prompt now says transcribe on a Windows machine (faster-whisper or Buzz) or in the cloud session in the background after hard triage.
  - 2026-09-28 (Claude, late session): handed over per the Start here prompt; the helper scripts were recreated on disk from claude/tools.md; the repo push was tried and refused again (not among this session's sources), so work plan item 11 stays owed; claude/source-checklist.md does not exist yet, so the extraction session has not run and Wolf's feedback pass goes first with the source gaps as a second pass. Nothing decided; the four Start here questions were put to Wolf.
  - 2026-09-29 (Wolf): the extraction session should pull the practice worksheets and get a sense of the curriculum that accompanies the videos. (Claude): both are the cheap half, so they go first – the prompt now builds a course map (section F: module, lesson, what it teaches, video minutes, exercise files, our lesson id) from file names, the PDFs' tables of contents and the public lesson list before any video; pairs every exercise workbook with its lesson by name; diffs start and solution files so each exercise becomes an (exercise) line in section A and feeds the drill ideas in D; fingerprints big datasets rather than reading them; and lets the map and the solution files push more videos to sample or skip.
  - 2026-09-29 (Wolf): the aim is for the project to "train on" the WSP material. (Claude): nothing trains; what persists in the project docs is what later sessions know, so the checklist is the whole transfer – section C now carries one line per accounting and valuation lesson (concept · built from or contrasted with · the misconception headed off · the check or rule of thumb), the source of the Chapter 5–6 teach lines; Wolf's transcript copies stay on his computer, outside the project and the repo, for one-off re-checks.
  - 2026-09-29 (Wolf): the WSP corpus is downloaded (Excel, FSM, DCF, LBO, M&A, trading and transaction comps, the accounting manual; about 420 videos); Claude organized it on his machine by module and lesson from the public outlines, identifying files by running time because the scrape's names were shifted; Wolf runs Buzz for transcripts. Wolf: the extraction must not over-weight tangential or overlapping content (LBO vs DCF). (Claude): the brief moved to claude/extraction-prompt.md with tiers per module confirmed by Wolf first, one canonical course per concept family, a relevance filter for the private car-wash case, and a proposal budget per chapter.
  - 2026-09-30 (Claude): the source extraction ran on Wolf's eight purchased courses (468 videos with transcripts, the exercise workbooks, the shortcut sheets), clean-room: techniques only, and nothing from the source kept but claude/source-checklist.md. It found 95 gaps worth placing, 56 faults in our own scripts and 71 real items held back to keep Chapters 5 and 6 in proportion. Six of the fixes were tested on Wolf's desktop Excel the same day: five held, one claim was struck (Ctrl+1 then A does reach Alignment) and the test turned up a new fault (Ctrl+1 opens on its row of tabs, so the route to a category is N, Tab, then the letter). The exercise files and shortcut sheets were audited too; what they say about shelling a lesson is in the checklist's build notes.
  - 2026-09-30 (Wolf): Ctrl+Shift+1 in plain Excel adds two decimals and a minus; it isn't the format cycle the add-ins make it. (Claude): written as a rule – the course teaches what Excel does with nothing installed, and an add-in's or a course toolbar's chords are Reference-page notes at most (the Ctrl+Shift+1, 4 and 5 row).
  - 2026-09-30 (Wolf): "apply", with his calls. The fold-back plan (checklist section H) is in the six chapter scripts and this doc as DRAFT: 241 script edits, the ledger rows in section 5 and M64–M82. (1) Case numbers: good – Clearcoat's own capex is $2,500k a site on rented land and the $5m stays the all-in cost (4.2); a build session confirms it on a real rebuild. (2) Chapter 1's parentheses: "go with what makes sense" – (Claude) the Format Cells dialog once, then F4 or Paste Formats, called the desk number format; Ctrl+Shift+1 described as what it is and kept for counts; the graders read the code on the cell, so the Comma Style route passes too. (3) Chapters 5 and 6 as deep as Claude judges right for the course – (Claude) 26 of the 71 held items pulled back, the ones that make the model right or answer a question a learner will ask (about a tenth more minutes in each chapter), and 45 left on the held list. (4) Merger math and comps left out as too finance-heavy and tucked away as add-ons (4.10) – (Claude) read as the deeper public-company comps work, not module 6.1, which stays on six fictional operators and enterprise-value multiples; Wolf to say if he meant the module. (5) The drill ideas sketched for the code layer: claude/script-drills.md, indexed in 6.2b, with M84 and M85. (6) Defaults taken on the rest: 4.2.5 rebuilt on hidden rows; 4.5.5 renamed the pass-through driver; the rollover in the LBO's sources; the sweep repays the senior loan only; the new numbered lines stand until the chapters go to goal level; a cell is colored by what it holds; one diligence aside in 3.3.6.
  - 2026-09-30 (Wolf): hand the plan to the code orchestrator and let it build; he wants to give less input while the curriculum is built and refine by playtesting; old files cleaned up and the continuity docs streamlined for a clean start. (Claude): the build codes from DRAFT and Wolf locks after he has played a part; the build session writes Chapters 2–6 to goal level as it builds each, with the working answers standing; the repo's plan and the project's plan are merged into one (docs/REBUILD_PLAN.md, the same text as claude/rebuild-direction.md) with the run order R0 to R7; this doc's Start here is rewritten for a build session and carries its prompt; claude/tools.md is cut to what is still used; the extraction brief is retired. Two independent reviews of the day's edits were run first, and their findings are fixed in the scripts, this doc and the drill sketches.
  - 2026-09-30 (Wolf): confirm there is scaffolding so that pages and drills look alike as spreadsheets, apart from their dimensions. (Claude): the rules existed in three places and the code had no shared builder, so each workbook and drill laid its cells out by hand. Added: the sheet standard in section 5 (one skeleton: title A1, units A2, headers row 4, figures from row 5, with the formats, borders and settings), and M86, a shared page module plus a whole-sheet audit that every finished page and every drill's solved sheet has to pass.
  - 2026-10-01 (Wolf): a friend's review of the interface, and his own notes: streamline the content and menus; too much looks machine-made (the copy, a headline with a subheader on every block, the boxes, one color, modes that are hard to tell apart where chess.com's are obvious, a rough first run, a task card that doesn't point, dashes and emoji, weak contrast, no loading bars or animation sequences); the font is fine. (Claude): ran the `rebuild` branch and the notes hold there too, with counts (3.0's table). Added: the interface standard as section 3.0 (ten rules, tokens with their contrast, type, layout, the nav, the workspace strip, Home, Learn, Practice, one loop for timed runs, the task card's placement and states, the first run in three steps, the landing page, motion and loading, and the list of what the copy and the screen never do); M87 to M95; run R1b in the plan; screens drawn (interface-mockups.html, and a design canvas for Wolf). The Punctuation dial is reversed: no dash as punctuation in anything a learner reads, which changes his own calibration lines on the site (a period, a comma or a colon in place of his spaced hyphen); every dash in the chapter scripts, the drill sketches and the copy in sections 3 to 7 was rewritten the same day, and the checker will fail any that return (M94). The standard overrides SITE_SPEC sections 1 to 5 and the line in CLAUDE.md that made the old build the reference for the look. Four calls are his to overrule (9.1, questions 13 to 16): the headline's shape, the default theme, the first run, the nav.
  - 2026-10-01 (Wolf), on the first drawing: much better than the old one; keep the sheet, the task card beside its target, the preview on Home, the progress bars, the tier marks and the bars against the three times; the existing Ribbon is good and should stay; but the colored icon tiles and icons look generated, groups of three feel generic, the result's pop-out card with its giant number and tilted stamp is wrong and its buttons are hard to see, the bar is duplicated beside the timer, Home is cluttered with systems, rapid-fire and challenges aren't presented, and a learner still has to scroll and read to find a drill (his friend's main note was too much text); the card will need careful placement, and lessons need more than one kind of box. Also: weak contrast is a tell. (Claude): 3.0 rewritten and a second drawing made. No icon tiles and no threes; color only for state; a nav that works like the Ribbon, with Practice's four pages one step away and Alt for the letters; Drills as a grid moved around with the arrow keys; Ready and Result in the drill's side panel at text size; Home cut to Continue and one Today table; the Ribbon kept as built; five forms for what the sheet says (card, note, nudge, pen, check); pages laid out as tables, the way the course lays out a sheet. M88 to M91, M93 and M95 rewritten to match; 9.1 question 16 is now the nav, and 17 records the Ribbon.
  - 2026-10-01 (Wolf), rounds 3 to 6 on the design canvas: the mocks are drawn on the real sheet and Ribbon from now on; the toolbar sits below the Ribbon; keyboard first on every page; a left rail like chess.com's, also for the account and settings pages, and no menus on both sides of a drill; Home names the next lesson and drops the case strip, with Level, Today and Achievements on the right ending level with the left column; a color per mode, flowing as plates on one ground down the landing page; rapid-fire on its own stage with the cells changing and a combo meter; drills one to five minutes, and Practice as simple as chess.com's Play; boards without tier marks; one certificate with LinkedIn; pixel-art achievements that don't look generated; level titles rewritten; the landing page about the product (drills, the path, rapid-fire, boards, challenges, certificates) rather than the case; the headline "The better way to master Excel". (Claude): 3.0 rewritten as the approved standard, built for change (tokens, components, copy in sheets) with the expensive-to-change data fixed now (M96 to M99, M101, M102); 3.1 rewritten in Wolf's voice; 3.2 to 3.16 brought in line; 6.1 resized, 6.5, 6.8 and 6.10 updated; M87 to M108.
  - 2026-10-01 (Wolf): the dash pass made lines read as a sentence and a stub, a repeated rhythm he reads as machine-written; rewrite to his tone guidance and calibration lines, using the course transcripts only for the feel of a spoken lesson, never a line from them; site copy drier and shorter than lesson copy. (Claude): 317 lines rewritten in the scripts and the screenplay where the stub rhythm or a ruled-out word was the problem, every one checked against all 468 transcripts for any shared run of eight words (none); the rest kept as they were.
  - 2026-10-01 (Wolf): comps and merger math parked as internal add-ons, shown nowhere on the site or the platform; trading comps kept if useful. (Claude): module 6.1 stays, since it's the course's own work on six fictional operators; 4.10 and 10.3 updated; the 2026-09-30 question is closed.

## 12. What the premium courses do (research, 2026-09-27)

Read from the public course pages, so it's the outline and the pitch, not the videos. Enough to place hotkey.gg against them.

| Course | Shape | Case or dataset | Grading and credential | What to borrow |
| :- | :- | :- | :- | :- |
| Wall Street Prep, Excel Crash Course ($39, 91 lessons, 8h39m video) | Setup and settings → basics → formatting and navigation → logic and dates → lookups and data tables → math → text → sort, filter, pivots → "using Excel to solve problems" → LAMBDA, macros | No company. Function files, plus two puzzle lessons (the fiscal-half date problem, the Olympic event problem) | Review quizzes per chapter; an exam | "The only way to learn Excel is by doing." Excel settings on day one, the self-referencing IF when data tables fail, XLOOKUP vs INDEX/MATCH argued both ways, ISNUMBER overrides, ROW/COLUMN as counters, the puzzle lessons |
| WSP Premium Package (46h, 7 courses) | 3-statement → DCF → M&A → trading comps → transaction comps → LBO | Real companies: Apple (3-statement, DCF), "Apple acquires Disney", BMC Software (LBO), networking comps | Final exam per course; one certification | Real filings as source documents; step-by-step manuals synchronized with video |
| Training The Street, Applied Excel (one live day) and the Excel Best Practices book | Efficiency, navigation, formatting discipline, functions, data tools, taught live on one dataset | Fictional companies | None beyond attendance | The voice: "learn the sequences for the actions you perform most frequently… after a while, putting in a bottom border with H, B, O will become second nature, and you'll never use the mouse to do it again." Motivation, specificity, reassurance in one breath. Ctrl+Enter and Shift+F8 as signature tips |
| Breaking Into Wall Street, Excel & VBA ($197, 24h) | Setup and navigation → formatting and printing → formulas and lookups → data → charts → VBA | Walmart template; real deals elsewhere in the Premium set (Monster Beverage, Steel Dynamics, Builders FirstSource/BMC, Apollo/Great Canadian Gaming) | Certification quiz, 90% to pass | "True mastery comes from repeated practice"; separate PC and Mac lesson tracks; QAT customization; formatting cycles |
| Wall Street Oasis, Excel Modeling ($97, 13 modules, 5h+) | Navigation → efficiency → formatting → view and print → math → dates and text → logic → lookups → data tables and auditing → sort, filter, pivots → charts → capstone | No company | Certificate on completion; timed benchmark exercises | "The instructor walks through the shortcuts he uses on a daily basis"; timed exercises with benchmarks; a capstone of three challenges |
| CFI, Excel Fundamentals (3.5h) and Financial Edge, Excel Efficiency Essentials (3h, 11 exercises) | Layout → settings and QAT → basic financial setup → freeze, conditional formatting, grouping, print / menus and accelerator keys → formatting → formulas → functions → naming cells | Templates; no company | Quizzes at 80%; completion certificate | "Avoid hardcodes in formulas" as a lesson title; Excel settings and the QAT before anything else |
| Adventis FMC (8h video, two levels) | Level I three-statement; Level II comps, precedents, DCF, LBO | One airline throughout | Weekly timed exams, results in days | One company carried through every module; a real exam |
| CFA Institute, Financial Modelling practical skills module | Plan the model → front end → revenues → costs → depreciation → tax → working capital → capital structure → statements → outputs | One company, unnamed on the page | Module completion | The build order of a model, and "working capital days" |
| Consulting Excel (CaseBasix, Management Consulted, CaseCoach) | Data cleaning (TRIM, PROPER, Text to Columns) → pivots for patterns → models → scenario testing → presentation | Client datasets | None | "The golden rule of Excel is to keep formulas transparent and organized so teammates can audit logic quickly." Clean presentation as a deliverable |

What it adds up to:

  - Every Excel course runs the same spine (setup → navigate → format → functions → data tools → audit), and none of them has a story. The modeling courses have a company but no Excel course. hotkey.gg is the only one with one company carried through both, and the only one that grades on a real sheet under a clock. That's the pitch, and the certificates should say so.
  - The "vibe" the good ones share is TTS's: motivate, be specific, reassure, in the same sentence. Wolf's calibration lines already do this.
  - Tips to fold into lessons: Excel settings and the QAT before anything else (everyone); "avoid hardcodes in formulas" as a headline (FE); Ctrl+Enter and Shift+F8 (TTS); the self-referencing IF, ISNUMBER overrides, ROW/COLUMN counters, XLOOKUP vs INDEX/MATCH both ways (WSP); timed benchmark exercises and a capstone (WSO); separate Mac notes (BIWS); one puzzle lesson per chapter (WSP's "using Excel to solve problems"), best placed in Practice.
  - Depth benchmarks: WSP's Excel course is 8.6 hours of video with 91 lessons; ours is 29 lessons in Chapter 1 at about 4 hours guided, then five paid chapters. Comparable depth; ours is spent doing, not watching.
