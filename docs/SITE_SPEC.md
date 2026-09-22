# hotkey.gg site spec

Decided with Wolf on 2026-09-21 (40-question review). This file says what each part of the site is and how it behaves. docs/REBUILD_PLAN.md says what gets built in which order. If they disagree, this file wins on behaviour and the plan wins on sequence. Decisions only; no history.

## 1. Look and feel
- The old build's visual identity is the standard: Daylight palette as default, the same fonts, keycaps, green accent, selection outline with green handle, rounded cards, theme picker top right. The rebuild matches it already; keep matching it. When in doubt, open the old index.html and copy the look, not the code structure.
- Overall feel: a professional tool with game moments. Calm, clean and credible while you work (fine to have open at the office); the game shows up in bursts at completions, PBs, rank-ups and badges. No mascot: the keycaps, the green cell cursor and the pixel badges are the character.
- Voice: a sharp senior colleague with minimal commentary. Plain, confident, proper Excel terms, and the practical payoff stated simply ("This makes you much faster moving around sheets full of data"). No quips, no jokes for their own sake, no cutesy analogies.
- Vocabulary: **Lessons** teach (Learn). **Drills** are timed (Practice). **Desks** are groups.
- Default theme for new visitors is Daylight.
- Feedback, animation and reward moments: see section 6a.
- Every control is reachable by keyboard with visible focus. Failed loads show an error with retry, never an empty list. Save state is always stated honestly: "Saved on this device", "Saved to your account", "Couldn't save, will retry".
- Below ~900px wide: readable lesson text plus a clear "needs a keyboard and a wider screen" message, not a broken layout.

## 2. Navigation and pages
Top nav: **Learn · Practice · Leaderboard · Reference**, theme picker, account menu. Desks, Stats, Profile, Settings live in the account menu. One shell, one nav, one footer (Pricing, Teams, About, Terms, Privacy, Contact).

| Page | What it is |
|---|---|
| Landing | See section 3 |
| Home (returning) | Continue card first (Enter continues), then today's Daily, then chapter rings, level and recent badges. Minimal choices. Rank, PBs and boards appear on Home only after the learner has done their first timed drill; until then competition stays quiet (the nav link exists, nothing pushes it) |
| Learn | Catalog: 6 chapters, sections inside each, per-lesson status, difficulty, tags, free/paid/sample markers, filters, search, "next up" highlighted, fully keyboard navigable |
| Lesson | Lesson workspace (section 4) |
| Practice | Timed drills with pars, the Daily, rapid-fire, sandbox. Uses the drill workspace (section 5) |
| Leaderboard | Benchmark drill boards, Daily board, school boards, desk boards. Viewable by everyone |
| Reference | Searchable shortcut reference (content ported from old reference.html), each shortcut linked to the lesson that teaches it, Win/Mac aware |
| Pricing | Free vs paid, prices, student pricing, 14-day guarantee, and a "Teams and schools" row linking to the Teams page |
| Teams | See section 11a. For banks, training providers, finance clubs, classes and friend groups |
| Account | Sign in/up, profile, handle, platform, theme, stats, saved-progress state, export data, delete account |
| Public lesson pages | One generated page per lesson and per shortcut for search engines, built from lesson data so they never drift; each opens the lesson |
| Legal | Terms, Privacy, EULA, Contact, 404. Marked draft until legal review |

## 3. Landing page and first run
- Headline direction: "Learn Excel by doing." (alternates to test: "The better way to learn Excel"). Body: whether you're a beginner or a finance professional, learn Excel and practise through guided lessons and real-world drills, not by watching a video or sitting in a classroom. Hero visual: the old preview card upgraded into a live, self-playing mini lesson (keycaps press, cells format, a goal ticks off) that hands control to the visitor the moment they type. Sections: how it works (read, do it guided, do it solo, race the clock), what you'll learn (the 6 chapters), free vs paid, for teams and schools, footer.
- Primary button: "Start learning", no signup.
- First run: (1) pick Windows or Mac (pre-selected from the browser, changeable any time; instructions and keycaps follow it); (2) one experience question: "New to Excel / I use it sometimes / I use it daily"; (3) New and Sometimes go straight into lesson 1; Daily users get a short placement run that can mark early sections as skipped (skipped is not completed) and recommends where to start; (4) after the first completion, a low-pressure invitation to save progress.
- Never a signup wall before the first lesson.

## 4. Lesson workspace
- Split pane: sheet and ribbon on the LEFT, instructions panel on the RIGHT (as in the old build). Divider is draggable within limits; the panel is always visible in a lesson (it cannot be collapsed or hidden).
- The sheet looks like Excel, banker style: Excel-default column widths and row heights (about 64px by 20px at 100%), 11pt Arial/Calibri-class cell font, light gridlines, Excel-proportioned column and row headers, many more rows and columns visible than now. Number cells right-aligned, text left. The old build's sheet is the reference; it looked right.
- Panel tabs: Lesson | Help | Shortcuts used. Phases: Read -> Guided -> (complete) -> optional Try solo -> optional Timed.
- Lessons are adaptive, not read-then-do. The Read phase is two or three sentences total: what the lesson is, what you'll do, why it pays off at work. Then each guided step carries its own one-line teaching point and the action on the same line, with the keycaps: "Ctrl+→ jumps to the edge of the data. Move from A3 (Monday) to A7 (Friday)." The teaching point appears the first time a shortcut is introduced; later steps that reuse it show only the action. Already-taught shortcuts are not shown unless the learner opens Help.
- Guided is the normal way to complete a lesson. It is NOT assistance: a guided completion earns full XP and shows no "assisted" marker. Only revealing extra steps through Help ("show me") marks an attempt assisted.
- On-sheet cues: in Chapter 1, guided steps softly highlight the target cell or ribbon button, and new interface parts get an anchored callout. The cues fade out after Chapter 1 so later work looks like real Excel.
- Goals name visible things ("Make Weekly Sales Report bold"). The active goal is always visible. The sheet never scrolls off screen.
- Ribbon: the full ribbon bar (tabs, groups, command buttons) is ON by default throughout Chapter 1. After Chapter 1 it defaults to the slim "alt / ribbon" strip. The toggle is always available. Alt shows KeyTips on whichever is visible. Unimplemented commands render disabled, not missing.
- Lessons are 3-5 minutes: one concept, 3-5 goals. Simple single sheets in early chapters; realistic multi-tab workbooks arrive with the paid chapters and end-of-chapter projects.
- Completion: the familiar centered overlay. Continue is primary, Try solo beside it. Shows time, keystrokes, assisted/solo.

## 5. Drill workspace (Practice, timed play)
- The old trainer layout: drill bar (chapter, title, position, prev/next), slim mode bar, sheet with sheet tabs, task panel on the right, status line with pass / pro / legendary par times.
- Slim mode bar: Help (hints + guided + solution merged into one), Win/Mac, ghost, sound, fullscreen. Daily, tracks and rapid-fire are reached from the Practice page, not the bar.
- The clock starts on the first key press. Reading time is free.

## 6. Rules: help, mouse, XP, rank
- Help: reading explanations is always free. Revealing steps ("show me") in a lesson gives reduced XP; Try solo earns the rest. Any help in a timed run means no PB and no board entry.
- Mouse: works everywhere (sheet, ribbon, dialogs). In lessons it is allowed and earns XP, with a gentle "try it with the keyboard" nudge. In timed runs, mouse use on the workspace means no PB and no board entry. Page controls like Start and Retry never count as mouse use.
- XP and level: one level track, generous early, about 30 levels. Finishing Chapter 1 reaches roughly level 8-10; levels slow after that. Most XP from first completions; small capped XP for repeats; no speed bonus. Achievements give no XP. The exact curve is a single formula in one module so it can be tuned after launch; Opus picks sensible constants and states them.
- Rank: kept, but hidden until it means something. Speed-based tiers from benchmark drills, separate from level. The rank pill stays hidden for a drill/field until it has enough posted times to be meaningful (about 20), then turns on by itself. The field may be seeded with clearly-synthetic "pace-setter" ghost times used only to calibrate pars and tier cutoffs; these are NEVER shown as fake human rows on a public board or profile. Real boards show real people only.
- Pars: pass / pro / legendary on every timed drill.
- Unlocking: open within a chapter with a recommended order. The next chapter needs the previous chapter complete or a passed test-out. Paid chapters also need access.
- Daily: free for everyone. Streak is optional, counts practice days, and never takes anything away.

## 6a. Feel: animation, sound and reward moments
The product should feel good in the hands every few seconds, the way Duolingo and Monkeytype do, without ever getting in the way of the keys. Two different moods: Learn is warm and encouraging; Drill is fast, tight and a little tense.

Ground rules (both modes)
- Feedback never blocks or delays input, never steals focus, never covers the active cell or the active goal. Animations use transform/opacity only and run at 60fps; most are 120-250ms, celebrations cap at about 1.2s and are skippable by any key.
- Honest rewards only. Celebrate things the learner actually did. No fake progress, no loss-aversion pressure, no guilt copy, no countdown offers, nothing that punishes a missed day.
- Respect `prefers-reduced-motion` (swap movement for fades and colour) and the remembered mute. One "Effects" setting: Full / Subtle / Off. Haptic-style screen shake is never used.
- Every effect is themed from the theme's own colours so all themes feel native.
- Build one small effects module (ui/effects.js) with named moments (goalDone, lessonDone, newPB, levelUp...) so the rest of the app fires moments, not animations.

Learn mode (lessons)
- Correct action: the affected cells flash softly in the accent colour; the goal ticks itself off with a small draw-on checkmark and a soft "tick" sound; the next goal slides up into the active slot.
- First time a shortcut is used correctly: its keycap "presses" in the panel and gets added to "Shortcuts used" with a small pop. New shortcut learned is a named moment.
- Wrong turn: no buzzers, no red screens. The goal gives a gentle nudge (small horizontal wiggle, a one-line hint fades in after a few seconds of being stuck). Undo is always offered.
- Progress: a slim lesson progress bar that fills per goal; chapter progress rings on the catalog that animate when you return from a lesson; the "next up" row pulses once.
- Lesson complete: the familiar centered overlay scales in, a short confetti burst made of cells and keycaps in theme colours, XP counts up, the chapter ring advances, Continue is focused so Enter keeps the flow going. First-ever lesson completion is bigger (it is the conversion moment) and leads into the save-progress invitation.
- Try solo passed: a distinct "Solo" stamp animation on the lesson row, permanently shown in the catalog.
- Section and chapter complete: a larger moment, a badge reveal (pixel-art flips in, rarity glow), and a preview of what the next chapter unlocks.
- Streak and daily practice: a small flame/keycap counter that ticks up once per day on first completion, with a calm animation. Missing a day shows nothing negative.
- Level up: the level chip in the nav fills and rolls over with a short chime; any newly unlocked theme, frame or flair is shown with an "equip now" button.

Drill mode (timed play, Daily, rapid-fire)
- Pre-run: the board is set, the clock reads 0.00, the "press any key to start" card from the old build; first key starts the clock with a subtle snap.
- During a run: nothing celebratory covers the sheet. Live feedback is peripheral: the clock, checkpoint ticks in the task panel, a thin pace bar against your PB (ahead = accent, behind = neutral, never red), and par tier markers lighting as they are still reachable. No combo or flow meter in ordinary drills (rapid-fire only). Key echo (the keycap chip bottom right) stays.
- Ghost: at launch, an optional faint second cursor replays your own PB run (stored keystrokes). Racing friends or the board leader comes after launch.
- Finish: the clock stops with a hard "lock" sound and the final time slams in; splits versus PB and par tiers reveal in sequence (pass, pro, legendary) with escalating sounds; keystrokes versus optimal shown as an efficiency meter.
- New PB: the biggest routine moment. Time flips from old to new, the delta counts up, a banner and a bright burst; the board row animates to its new position ("you passed 14 people").
- Par tiers: bronze/silver/gold-style medals in the site's own idiom (pass / pro / legendary), stamped on the drill card; first legendary on a drill is a named moment.
- Rank: tier-up is a full reveal (the old build's rank reveal, kept): tier emblem, new pill in the nav, what it unlocked. Rank never animates downward; drops are shown quietly on the profile only.
- Daily: a once-a-day reveal of the drill, a live "attempts today" counter, a result card built for sharing (time, tier, board position, keystrokes) with copy-to-clipboard.
- Rapid-fire: per-prompt hit flashes, a rising combo counter with pitch-rising ticks, a multiplier meter, and a short end-of-round tally that counts up. Misses break the combo with a soft thud, no penalty screen.
- Retry is instant (one key), so the loop is: finish, feel it, go again within two seconds.

Collection and identity
- Achievement unlock: a toast slides in from the corner with the pixel badge and rarity colour, stacks if several land, never interrupts a run (queued until the run ends). Hidden achievements get a slightly longer reveal.
- Badge shelf: badges idle-animate subtly on hover/focus; locked ones show a silhouette; rare ones shimmer.
- Cosmetic unlocks (themes, frames, flair): reveal card with a live preview and "equip now"; equipping animates the whole UI re-theming.
- Certificates: a generated certificate reveal with a seal stamp; Verified gets the stronger treatment.
- Desk moments: when a desk-mate beats your time or completes an assignment, a quiet notification on next visit; assignment complete ticks on the desk board.

Routine lesson completion is a MEDIUM moment (overlay, short burst, XP count-up, about one second, any key skips). Bigger treatments are reserved for firsts, chapters, PBs, par tiers and rank-ups so they stay special.

Sound palette: soft mechanical-keyboard ticks and clicks with short, warm, muted chimes for wins. Sound is ON at low volume from the learner's first key press, with an obvious remembered mute. Sound set (all short, soft, one consistent family): tick (goal), chime (lesson), pop (new shortcut), lock (clock stop), rise (PB), fanfare-short (tier/level/chapter), thud (combo break). Ordinary typing is silent.

## 7. Curriculum
Six chapters, each with sections and a deep catalog. Chapter 1 is free. Content is written from zero; the old 74 drills are ideas only and are not ported. The section map below was built by comparing the public syllabi of the three courses bankers actually take (BIWS Excel & VBA, Wall Street Prep Excel Crash Course, CFI Excel Fundamentals Quick Start and Formulas for Finance) and keeping what can be taught and graded on a real sheet. It is a topic map, not their content; every lesson is written from scratch in our voice. Every chapter ends with a practical project and an assessment (used for the Verified certificate). Lessons are 3-5 minutes, 3-5 goals each; a section is roughly 4-8 lessons.

Not in scope, by design: VBA and macros, Power Query and Power Pivot, LAMBDA/LET, charts and form controls, add-ins. These are what those courses spend a third of their time on and none of it is keyboard muscle memory on a grid. Charts and dynamic arrays (FILTER, UNIQUE, SORT) are candidates for later paid packs once the engine supports them.

**Chapter 1 · Foundations (free)** — everything a first-week analyst or a total beginner needs before formulas get serious.
0. Welcome: one lesson with wow factor (candidate: arrows-only vs Ctrl+Arrow race with both times shown), ending with how the platform works and why it beats a video.
1. How Excel works: workbook, sheets, cells and references; the Ribbon and how Alt chords walk it; Formula Bar and Name Box; Options and the settings that matter (calculation mode, iterative calculation, gridlines, default font, Quick Access Toolbar); page setup basics; best practices (inputs vs formulas, blue/black colour convention, one hardcode per cell).
2. Moving: arrows, Ctrl+Arrow, Home/End, Page keys, Go To (F5/Ctrl+G), between sheets (Ctrl+PgUp/PgDn), between workbooks.
3. Selecting: Shift+Arrow, Ctrl+Shift+Arrow, whole rows/columns, Ctrl+A regions, Go To Special (blanks, constants, formulas).
4. Entering and editing: type, Enter/Tab direction, F2, Escape, Delete vs Backspace, fill down/right (Ctrl+D/R), undo/redo, Find and Replace.
5. Rows, columns and sheets: insert/delete, width and height, autofit, hide/unhide, group/ungroup, freeze and split panes, rename/insert/move sheets.
6. The Ribbon and dialogs: Home tab tour by KeyTips, Format Cells (Ctrl+1) tab by tab, bold/italic/underline, borders, fills, font colour, alignment and Center Across Selection.
7. Basic formulas: = and operators, SUM/AVERAGE/MIN/MAX/COUNT, AutoSum, relative vs absolute references and F4 anchoring, referencing other sheets, common errors (#REF!, #DIV/0!, #VALUE!, #NAME?).
8. Copy, paste and fill: copy/cut/paste, Paste Special (values, formats, formulas, transpose, operations), fill series, Flash Fill concept.
Project: build and format a clean one-page weekly sales report from raw numbers. Assessment: a timed solo version.

**Chapter 2 · Formatting and presentation (paid)** — making a page that reads like a banker built it.
1. Number formats: built-in formats, thousands and decimals, negatives in parentheses, percentages, dates, the shortcut set (Ctrl+Shift+1/4/5/#).
2. Custom number formats: the four-section format string, units labels, zero and dash handling, dynamic headers with TEXT.
3. Model formatting standards: colour conventions, input cells, headers and units rows, indent levels, borders that mean something, consistent widths.
4. Alignment and structure: wrap, indent, Center Across Selection, grouping and outline levels, hiding vs grouping.
5. Conditional formatting: rules, data bars, highlighting errors and exceptions, formula-driven rules.
6. Dates and text for presentation: TEXT, EOMONTH, EDATE, concatenation and &, dynamic labels.
7. Printing and page layout: print areas, titles, fit to page, headers and footers, print preview.
Project: take an unformatted three-year P&L to presentation quality. Assessment: timed.

**Chapter 3 · Formulas and functions (paid)** — the function set that covers 95% of finance work, drilled until it is automatic.
1. Logic: IF, nested IF, IFS, AND/OR/NOT, IFERROR, ISNUMBER/ISTEXT and override patterns.
2. Dates: serial numbers, DATE, YEAR/MONTH/DAY, EOMONTH, EDATE, YEARFRAC, monthly/quarterly/annual timelines, fiscal-period logic.
3. Math and aggregation: ROUND family, ABS, CEILING/FLOOR, COUNT/COUNTA/COUNTIF/COUNTIFS, SUMIF/SUMIFS, AVERAGEIF/S, MIN/MAX/LARGE/SMALL, SUMPRODUCT and boolean criteria.
4. Lookups: VLOOKUP/HLOOKUP and their failure modes, MATCH, INDEX/MATCH, two-way lookups, XLOOKUP, CHOOSE, OFFSET, INDIRECT, ROW/COLUMN as counters.
5. Text: LEN, LEFT/RIGHT/MID, FIND/SEARCH, TRIM, SUBSTITUTE, VALUE, Text to Columns, cleaning imported data.
6. Time value of money: PV/FV/PMT, NPV/XNPV, IRR/XIRR, timing conventions and footnotes.
7. Auditing: trace precedents/dependents, evaluate formula, error checking, Go To Special formulas, F2 and F9 inspection, finding hardcodes.
Project: rebuild a broken lookup-driven summary so every number ties. Assessment: timed.

**Chapter 4 · Data and analysis (paid)** — working a dataset, not just a model.
1. Lists and tables: sort, multi-level sort, AutoFilter, Subtotal, Remove Duplicates, data validation and drop-downs.
2. Summaries: SUMIFS/COUNTIFS cubes, SUMPRODUCT summaries, KPI blocks from raw rows.
3. Pivot tables: build, rearrange, group dates, value settings, refresh, GETPIVOTDATA (engine work needed).
4. Scenarios and sensitivity: scenario switches with CHOOSE/INDEX, one- and two-way data tables, Goal Seek (engine work needed for data tables and Goal Seek).
5. Circularity: iterative calculation, circuit breakers, self-referencing IF patterns.
6. Named ranges and structure: naming cells and ranges, using names in formulas, navigation columns.
Project: turn a raw transaction export into a filtered, summarised dashboard sheet. Assessment: timed.

**Chapter 5 · Financial modeling (paid)** — building the machine.
1. Model architecture: inputs, calculations, outputs; timeline row; units and sign conventions; checks row.
2. Schedules: revenue build, cost build, working capital (DSO/DIO/DPO), fixed assets and depreciation, debt and interest (including average-balance circularity), tax.
3. The three statements: income statement, balance sheet, cash flow, and the links between them; balancing; cash sweep and revolver.
4. Auditing a model: tie-outs, cross-foots, error flags, hardcode hunts, stress-testing inputs.
5. Model speed: the keystroke patterns for filling a model quickly (anchor, fill right, copy formats, Alt+= across a block, Ctrl+Shift+Arrow fills).
Project: a compact three-statement model from a case. Assessment: timed build of one schedule.

**Chapter 6 · Valuation and deals (paid)** — what the model is for.
1. DCF: free cash flow build, WACC inputs, terminal value (perpetuity and exit multiple), discounting and mid-year convention, sensitivity tables.
2. Trading comps: spreading multiples, calendarisation, LTM math, medians and means, applying a range.
3. Precedent transactions: deal multiples, premiums, control adjustments.
4. LBO: sources and uses, debt tranches, cash sweep, returns (IRR/MOIC), returns bridge.
5. Merger math and waterfalls: accretion/dilution basics, distribution waterfalls, football-field summary tables (table only; charts out of scope).
Project: a one-page valuation summary from a case pack. Assessment: timed.

Free tier: all of Chapter 1, its timed drills, the Daily, and one sample lesson from each paid chapter.
Engine work implied by this map and not yet built: pivot tables, data tables, Goal Seek, data validation drop-downs, Subtotal, grouping/outline, Text to Columns, sheet-to-sheet references in the grader, print preview. Each is scheduled with the chapter that first needs it.

## 8. Accounts
- Sign-in: email + password, magic link, Google.
- Guests are local only. No anonymous database accounts. At signup the learner sees what will be carried over; it is carried once, and never from another account.
- Handle: pre-filled with a generated name at signup, easy to edit right there, with a note that it appears on public boards and the public profile if they allow it and can be changed any time. Profanity filter and change-rate limit.
- No two-factor until after launch.
- Public profile: handle, level, rank, featured achievements, best times. School and desk only by opt-in. Everything else is private, enforced in the database.
- Stats page: private, under the account. Time, PBs, improvement history, keystroke counts, shortcuts used, and a clearly labelled "estimated time saved".
- Account switching and sign-out never leak the previous account's data (generation-token approach from the old nav.js fix).

## 9. Achievements and cosmetics
- Pixel-art badges on a clean shelf; the rest of the UI stays professional. Style: small and crisp, 16-32px grids scaled up sharply, 4-6 colours each drawn from the active theme plus the rarity colour, Game Boy-era item icons (a key, a bolt, a ledger). Drawn in code/SVG so the set stays consistent.
- Four rarity tiers: common, rare, epic, legendary, shown by border colour and glow.
- About 40 achievements at launch, all meaningful: section and chapter completions, solo streaks, first PB, par tiers, Daily participation, efficiency feats, and a few hidden playful ones. Main milestones visible; hidden ones revealed when earned.
- Rank keeps the old build's ladder, names and thresholds; emblems are redrawn in the same pixel style so rank, badges and frames read as one family.
- A core set of themes is free for everyone. Other themes, profile frames and flair are earned from level, achievements and rank. Nothing cosmetic is sold.

## 10. Payments and access
- $9/mo, $90/yr; student $7/mo, $70/yr. No trial; the free chapter is the trial. Cancel any time, access to the end of the paid period. 14-day money-back guarantee on first payment.
- Processor: merchant of record (Paddle or Lemon Squeezy), pending accountant confirmation. Build entitlements processor-agnostic: the database only knows "this account has access from source X until date Y".
- Student status: verified .edu or recognised school-domain email, rechecked yearly.
- Group access for banks and training providers ships with the paid tier: one code or link, a seat count, one shared end date, a simple admin view.

## 11. Desks, schools, certificates
- Desks v1: create a desk, invite by code or link, private desk leaderboard, captain sets assignments, captain sees members' progress. No applications, recruiting, verification badges or public discovery yet. All writes through server functions.
- School flair: opt-in school tag via verified school email; school boards.
- Certificates, two tiers per chapter: **Completed** (finished any way) and **Verified** (chapter assessment done solo, keyboard only, within a time limit). Public verification page per certificate.

## 11a. Teams page and how groups find it
Visible but not loud. Nobody should have to hunt for it, and a solo learner should never feel sold to.
- **Teams page** (footer link, Pricing link, account menu "Desks"): plain-English explanation of the two things a group can do, with a clear path for each.
  1. **Start a desk** (free to create): what a desk is (a private group with its own leaderboard, assignments from a captain, progress the captain can see), who it's for (a study group, a finance club, an analyst class, a team at work), and a "Create a desk" button. Signed-out visitors are taken through signup and land back on desk creation. Joining is by invite link or code; the page has a "Have a code?" box.
  2. **Group access** (paid, for organisations): one code or link, a number of seats, one end date, progress view for the organiser, invoice-friendly. For banks, training providers and schools. A short "Request group access" form (name, organisation, email, seats, start date) that writes to the database and emails Wolf. No self-serve checkout for groups at launch.
- **Where it is advertised**: one section near the bottom of the landing page ("Learning with a team or a class?" with one sentence and a link); a row on the Pricing page; a small prompt on the Leaderboard page ("Compete with your own group: start a desk"); a one-line mention after a learner finishes Chapter 1 ("Doing this with classmates or colleagues? Start a desk"); the certificate page mentions group reporting. Nowhere else, and never as a popup.
- **Joining flow**: an invite link opens a page showing the desk name, who invited you and what the captain will be able to see (your progress and times on assignments, nothing else), then Join. Guests are asked to create an account first, keeping their local progress.
- **Group access redemption**: a code or link shows the organisation name, what it unlocks and until when, then attaches to the signed-in account. Works for existing subscribers without double charging (their own subscription can be paused or left to lapse; state this plainly).

## 12. Data and infrastructure
- Supabase: a fresh project replaces the old one (see plan for timing). RLS on every table; the client never writes tables directly, only server functions; public profile fields separated from private; every attempt has a client-generated ID so retries never double count; progress, XP and records are derived server-side from attempts; results are paged, never one capped read.
- Hosting: Cloudflare Pages. Preview link per branch, one-click rollback, no manual cache-version bumps.
- Analytics: first-party events table (landing -> lesson 1 -> signup -> chapter complete -> paid) and a lightweight client error log with a weekly digest. No third-party scripts.
- Launch sequence: cutover FIRST (the rebuild replaces the old site while it is still Chapter 1 + guest mode), then build the rest live. See section 13.

## 13. MVP, rollout and access
- **Cutover is the first step.** hotkey.gg serves the rebuild (app2 via Cloudflare Pages) as soon as Phase A is signed off. The old build is archived. This is a quiet swap: no announcement until the MVP (accounts + game layer) is solid.
- **What a visitor sees during the build:** the full site. Landing, Chapter 1 fully playable as a guest (progress saved on device), Reference, Pricing and Teams pages present. Later chapters and any not-yet-built system show a quiet "coming" state, never a broken or empty page. It should read as a real early-access product, not a stub.
- **MVP scope (built before a full review):** free product complete (all of Chapter 1, accounts, full game layer) plus Chapters 2-3 written but locked behind a `paid` entitlement. No checkout in the MVP.
- **Granting paid access before checkout exists:** entitlements are processor-agnostic from day one (a row: this account has access from source X until date Y). Two grant paths ship in the MVP: (1) an admin action Wolf uses to mark an account paid; (2) single-use redeem codes Wolf generates and hands to testers. Real checkout later writes the same entitlement, so nothing here is throwaway.
- **Achievements in the MVP (~40):** four flavours, all wanted — milestones (first lesson, each section, each chapter, first solo/timed/PB/Daily), skill feats (keyboard-only, no-help, under-par, full section solo, clean audit), speed/streak (practice-day streaks, N drills in a day, beat pro/legendary, top-N on a board), and hidden/playful (cheeky secrets revealed only when earned). Pixel-art, four rarities, no XP.
- **Legal at cutover:** real plain-English draft Terms, Privacy and EULA covering guest data and the no-accounts-yet state, the Microsoft non-affiliation disclaimer, and a contact email, all clearly marked pre-review. Lawyer review before paid launch.
- **Auth in the MVP:** email + magic link. Google is coded and switches on when the OAuth client ID is supplied. No two-factor until after launch.
