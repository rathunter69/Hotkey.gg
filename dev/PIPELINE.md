# PIPELINE — the Fable task queue

## ⚡ STATE OF THE QUEUE (r296, 2026-07-17 — READ FIRST)
The r296 round (branch `claude/pipeline-engine-integration-laki0l`) did three things:
1. **RESCUED THE STRANDED SESSION** — the one-row-toolbar / marathon-purge / auth-fix /
   account-overhaul / leaderboard / rapid-fire arc (19 commits) was sitting unmerged on
   `claude/school-flair-phase-1-35myh2` with NO PR; Pages serves main, so none of it ever
   deployed. It ships with r296. **HOUSE RULE: a round is not done until the PR is opened,
   merged, and main is verified to have moved.**
2. **ENGINE FUNCTION PACK (Wolf)** — NPV + IRR (the great find), the text pack
   (LEFT/RIGHT/MID/LEN/TRIM/UPPER/LOWER/PROPER/FIND/CONCATENATE + & + string literals), and
   the sorting functions (LARGE/SMALL/RANK). TABLES skipped (Wolf call). Folded into drills:
   dcfbuild (=NPV audit line), lbobuild (=IRR over real equity flows ties to compounded MOIC),
   comps (LARGE/SMALL trimmed read), dashcover (=UPPER(TRIM()) cover stamp). Parity 94→120.
3. **SIGN-OUT NAV AUDIT (Wolf)** — sign-out now lands HOME from every page and wipes ALL
   account-derived local mirrors (stats can never show the previous account to a guest);
   device prefs survive. account.html "sign out everywhere" shares the wipe.
**QUEUED NEXT (content, engine is ready):**
- **"Clean the import" drill (text-pack flagship)** — a pasted deal list with dirty names/
  tickers: TRIM/PROPER the names, LEFT&FIND the tickers off "AAPL US Equity" strings, &
  rebuild a canonical label column. Data & Lookups chapter, ~par 60.
- **RANK's drill home** — a league-table beat (rank the deals by size, live re-rank on edit),
  natural fit: scrub or a new "league table" drill; RANK is engine-ready + parity-armored.
- Text still deferred: TEXT(value,fmt) custom format codes (rabbit hole, build when a drill
  demands it), SUBSTITUTE/REPLACE, TEXTJOIN.

## ⚡ prior state (r251, 2026-07-15)
Curriculum v2.1 is fully shipped, gated green, and coherent end to end. Since the
r196 block (kept below as history):
- **Engine Tier 1+2 DONE** — fill palette (Alt H H), Clear menu (Alt H E), indent
  (Alt H 5/6), accounting (Alt H A N), scale, border depth incl. thick box
  (Alt H B K), font size (Alt H F G/K), Find & Replace (Ctrl+H), cell styles
  (Alt H J). Ctrl+1 kept to high-value cases only (Wolf doctrine).
- **Curriculum v2.1 regroup DONE (r242)** — 8 chapters, ~10 drills each: Foundations /
  Formatting / Formulas I (FREE) · Data & Lookups (level bridge) · Formulas II /
  Models I / Models II / Full Builds (PRO). Catalog = 80 drills; groups == chapters.
- **Flesh-out pass DONE (r243–r249)** — toolkit wired where it teaches (dress fill,
  ruleoff thick box, gauntlet accounting, versionup Ctrl+H rename); **7 NEW drills**
  (fcfbuild, intsched, dcfbuild, lbobuild, opmodel, debtblock, dashcover); the **6
  weak drills DELETED** (saves, ribbon, polish, format, blue, transpose).
- **Campaign + economy DONE (r250–r251)** — campaign recut to a curated flagship
  SPINE (31 drills, 3–4/chapter, not all 80); bounties steepened (PRO chapters
  450–1000, finisher 600); gate level-walls softened (Full Builds L15→L11, lean on
  clears); 2 new medals (Formula Desk, Master Builder). Achievements: no stale refs.
- Gate green at every push: demo-replay 80 · parity 94 · onboard 28 · alt-paths 74.

**NEXT UP — SCHOOL FLAIR Phase 1 (T-Q below).** Wolf-approved across a design session
(mockups were in the ephemeral session scratchpad — the spec in T-Q is self-contained).
Colored-monogram marks, our own, NO logos/symbols. Pure-frontend + one stored column.
**T-O (desk-palette-grades-drills) is SHELVED** — Wolf chose identity flair over
re-grading drills. Older open items still live below (FactSet canon verify, T-H
interview mode awaiting "go", T-I seasons gated on DAU, deferred engine bits).

<!-- ————————————————— history below ————————————————— -->
## ⚡ STATE OF THE QUEUE (r196, 2026-07-14 — read this first)
Every executable task below is DONE, and so is Wolf playtest round 3 (r190-
r195: engine pack 3 + the nine drill rebuilds across Tranches A/B/C). 79
drills, parity 94, alts 80, gate green at every push. **THE EGRESS MILESTONE
IS DONE (r196): the Supabase live smoke re-ran 65/65 first-try** — the whole
desks/assignments/school-tags backend is verified healthy in prod, and the
SEEDED DESK CODES ARE CLEARED FOR DISTRIBUTION (dev/SMOKE_REPORT.md).
What remains, and what unblocks it:
1. **T-G CANON REMAINDER — MACABACUS DONE r197** (the CFI×Macabacus cheat-sheet
   PDF verified via curl+Read; WebFetch/WSP 403 under Cloudflare but the PDF is
   static). Found + fixed a systematic phantom-Alt error in our Macabacus number/
   border/color cycles (display + engine bindings) — see AUDIT r197 / CANON_DIFF.
   REMAINING: the **FactSet** table is still unverified (no authoritative FactSet
   hot-key sheet reachable this pass) — do it when a FactSet source is fetchable.
2. **WOLF DECISIONS**: T-H interview mode (dev/INTERVIEW.md awaits sign-off;
   a plain "go" starts the build) · T-I seasons (gated on DAU per STRATEGY) ·
   pilot playbook (pick 2-3 clubs — events/report/programs all exist, and the
   desk codes are now verified safe to hand out) · credential rotation
   reminder (SMOKE_REPORT "Outstanding" #2, from r132).
3. **DEFERRED ENGINE** (build only when a drill concept demands it): Ctrl+0
   column hide (render surface), Alt H O H row height (needs a height model),
   SUBTOTAL(9) visible-aware math (pairs with a "total follows the filter"
   drill).
House rule for parallel sessions, learned live in r194/r195: FETCH BEFORE
EVERY ROUND-CLOSE — two sessions ran the same tranche queue simultaneously
and the slower one must yield to whatever main already deployed.
## WOLF PLAYTEST QUEUE — DONE r192 (sort warning live + alt entry; ctrl+arrow
## unreproducible, behaves Excel-correct, parity-armored, watching; Alt+= both
## forms live). Original spec kept below.
## (r192, specced from live feedback July 2026)
1. SORT WARNING dialog: single-column selection adjacent to data + alt a s d
   → Excel's "expand the selection?" prompt (E expand default / C current
   only / Esc). Expand = grow to the contiguous block, sort rows by the
   ORIGINAL active column. sortRange already row-sorts within selection —
   the warning is the missing guardrail. Sort drill gains the expand route
   as an alt; parity asserts both paths.
2. CTRL+ARROW early stop on the sort board (reported: lands 2-3 cells down,
   not at the bottom) — reproduce first; suspect sort's deep-cloned blank
   cells or prebuilt formatted-empties registering as content in nonEmpty().
   Fix at the jump primitive, parity-assert with formatted-empty cells.
3. ALT+= flow: (a) range-form — selection ending in empty total cell(s)
   fills committed SUMs with selection preserved (true Excel, the power
   move); (b) single-cell proposal — Enter-commit STAYS on the cell so
   bold/border follows immediately (Wolf's workflow ask). Re-measure
   foot/sort/gauntlet pars (keystroke counts drop).

Future-content seedbank: equity DISTRIBUTION waterfall (RoC/pref/catch-up/
carry — see REALISM_NOTES r181), RF per-category cycling via RF_CAT,
interview mode report-card stall coaching, plugin-floor display, in-cell
PARTIAL text formatting (would make the footnote flow fully Excel-real:
select "(1)" inside the cell, ctrl+1, superscript — engine has whole-cell
formatting only; big lift, queued for if formatting depth becomes a pillar).
*(r169. Wolf: paste any task block below into a fresh session as the opening
prompt. Each is self-contained; every task ends with the full gate from
dev/DRILL_DOCTRINE.md §4 and an AUDIT.md round entry. Order is priority order,
but T-A/T-B/T-C are independent. "Fable-grade" tags mark tasks that most
benefit from the strongest model; the rest are executable by any session that
follows the doctrine.)*

---

## T-A · ENRICHMENT SWEEP — TRANCHE 2 DONE r170, TRANCHE 3 DONE r181 (waterfall SIGNS fix + check merge, 21 labels to imperative, txncomps mult/date realism, 3 new ALTS — see AUDIT). Remaining suspects live in the backlog matrix below; grade by hand first.

## ~~T-A original brief~~  *(kept for method reference)*
> Read dev/DRILL_DOCTRINE.md and apply §5 (enrichment playbook) to these
> drills, in order: **cagr, lookup, lookup2, percent, bridge, autofit, saves,
> editfix, ribbon, format, drill (hardcode), transpose**. For each: grade by
> hand, apply the smallest upgrade that clears the doctrine, add an entry to
> the ALTS registry in dev/e2e-alt-paths.js (one order-permutation alt AND one
> chord-route alt where the engine offers one), replay ×3, par-sweep, retune
> par only if scope changed. Known specifics: cagr's three blocks are
> offset-cloned — re-site them; lookup/lookup2 should shuffle the query panel
> and force header-reading; percent's F4 story is good but its second block
> deserves a decoy; autofit still lacks a codename title; saves' review cells
> could carry a real work-op between saves; ribbon is 3 jobs on one page —
> consider a 4th family. Full gate, screenshots, AUDIT round, push.

## T-B · ALT-PATHS TO FULL COVERAGE — DONE r184 (77 alts, every drill covered;
navigation latch recorded as a by-design doctrine finding; harness caveat:
never use regex escapes inside moves template literals — they collapse before
eval). The harness has been in the standard gate since r169.

## T-C · MODELS-TIER REALISM AUDIT  *(Fable-grade)*
> Play every Models + Full Builds drill via replay AND read every prompt,
> label, and check as a former banker would. Hunt: wrong terminology, wrong
> sign conventions, wrong units, formulas a desk would never write, checks
> that a first-year would call fake. Cross-check each artifact against its
> real-world template (comps page, S&U, 13-week, debt schedule, waterfall
> tiers, acc/dil). Produce dev/REALISM_NOTES.md with per-drill verdicts, fix
> everything mechanical in the same round, queue anything structural.

## T-D · ENGINE EXPANSION PACK 1 — DONE (r173 IFERROR + trace jumps; r182 Go To Special: F5/Ctrl+G → S → O/F/K marks + Enter-walk + auto-unmark on fix + hunt drill). The pack is complete.

## ~~T-D original brief~~
> Three engine features the canon demands (doctrine §6), then a drill each:
> 1. **Go To Special**: Ctrl+G/F5 opens a minimal dialog (Special → Constants
>    / Formulas / Blanks) that sets a multi-region selection. Drill: "the
>    hardcode hunt" — F5-special constants inside a formula block, paint them
>    blue / relink them. This is THE pre-ship audit ritual (WSP/FE canon).
> 2. **Trace-precedent JUMP**: Ctrl+[ moves active cell to the first
>    precedent of the current formula (store refs at eval time), Ctrl+]
>    inverse. Drill: "walk the wire" — follow a broken number three hops
>    upstream to its source, fix it there, ctrl+home.
> 3. **IFERROR** in evalFormula + a triage-style drill beat ("wrap the
>    lookup, don't bury the error").
> Each: engine parity asserts in dev/e2e-audit-parity.js (new section), then
> drill per doctrine. Keep dialogs keyboard-only, Esc-safe, paint-armored.

## T-E · ENGINE EXPANSION PACK 2 — structure & view  *(any model, engine work)*
> ALSO (Wolf r176): explicit size dialogs — **Alt H O W** (column width) and
> **Alt H O H** (row height) as tiny keyboard-only numeric prompts, so sizing
> drills can teach SETTING a width rather than autofit roulette; pair with a
> 'set the print widths' beat in a future formatting drill.
> DONE r177 (Ctrl+1/Alt O E Format Cells), r179 (row grouping + grpfold),
> r180 (AutoFilter + filterpass), r185 (Ctrl+9/Ctrl+Shift+9 manual hide +
> Alt H O U R/O + Alt H O W width dialog + unhide drill — the group-first
> caveat IS the drill's story). REMAINING: Ctrl+0 column hide (needs hidden-
> column render/nav surface — bigger than it looks, low training value),
> Alt H O H row height (needs a row-height model the engine lacks),
> SUBTOTAL(9) visible-aware math so a future drill can grade "the total
> follows the filter". Each lands with parity asserts.

## T-F · RAPID-FIRE ↔ CLASSIC BRIDGE — DONE r186 (dialog-chords deck in the
picker, twelve ops; reference.html classic↔card map). Future idea only:
per-category cycling using RF_CAT (the map has existed since r143).

## T-G · SCRAPE-DRIVEN CONTENT REFRESH — PARTIALLY DONE r171  *(finish needs egress)*
> DONE via search layer: dev/CANON_DIFF.md (coverage diff, 6 new-drill
> proposals, grouping/center-across/circuit-breaker specifics, realism
> nuggets). REMAINING for an egress session: verify [canon]-tagged rows +
> HOTKEY_PLUGIN_LAYERS Macabacus/FactSet defaults against the live cheat
> sheets, and pull 2-3 WSO threads verbatim for voice/priority calibration.
> Original brief:
> WSO/WSP/BIWS block direct fetch through this proxy (403) but search-layer
> summaries work. From a session with egress: pull the WSP shortcut sheet,
> Macabacus shortcut manager defaults, BIWS "Excel shortcuts investment
> banking" lesson list, 2-3 WSO "favorite shortcuts" threads, one consulting
> source (Management Consulted / CaseCoach Excel). Diff every chord+workflow
> named against drills.js coverage AND the plugin layers in
> HOTKEY_PLUGIN_LAYERS (verify our Macabacus/FactSet defaults still match
> their current sheets). Output: dev/CANON_DIFF.md + new-drill proposals.

## T-J · CHECKLIST VOICE — DONE r183 (162 label instances across 42 drills,
inventoried exhaustively incl. the verbless-fragment class the earlier ~24
estimate missed; navigation's hotkey-notation labels kept by decision). Every
checklist on the site now opens with a verb.

## T-K · INTERACTIVE ONBOARDING V2 — DONE r175 (do-it beats + why-card live; onboard audit 28). Remaining polish ideas only: a stopwatch chip with the real ms delta, and a mouse-ghost animation racing the chord.

## ~~T-K original brief~~
> Rebuild the post-landing intro as an interactive SELL, reusing the tour's
> spotlight mechanic but making the user DO things:
> 1. **The hook (do-it beat)**: spotlight the grid, "your mouse takes ~4s to
>    do this — your keyboard takes 1: press <ctrl+→>" — user actually presses
>    it, cursor flies, a stopwatch chip shows the delta. Then ctrl+b on a
>    title. Two real chords in the first 20 seconds.
> 2. **The why card**: one screen of product truth — bankers live in Excel
>    8h/day, keyboard pace is a hiring signal, this site drills exactly that
>    (tie to rank/boards). Numbers, not features.
> 3. **The map**: existing spotlight steps compressed to 3 (checklist,
>    guided mode/F1, drill map) — cut formula-bar and modes steps into
>    tooltips discoverable later.
> 4. Then the existing placement run (navigation) unchanged.
> Constraints: keyboard-only, Esc skips everything, input-gated per beat
> (tour guard already blocks stray keys — extend it to allow ONLY the asked
> chord during do-it beats), onboard audit extended to walk the new flow.
> Design sketch to Wolf via screenshots BEFORE wiring the flow as default.

## T-H · INTERVIEW MODE — DESIGN DOC DONE r181 (dev/INTERVIEW.md: daily-seeded
8-drill superday, 12-min wall clock, one attempt/skip allowed, report card w/
stall analysis, PRO-gated + free practice sittings, 3 open questions each with
a default). AWAITING WOLF SIGN-OFF — the build is a config-and-content round.

## T-I · SEASON REWARDS TRACK  *(PRO roadmap — dev/SEASONS.md exists)*
> Execute per dev/SEASONS.md once Wolf greenlights scope.

## T-L · DAILY CHALLENGE 2.0 — ✅ SHIPPED r219 (Wolf)
> Built the marquee mode. A ◆ daily-challenge chip (accent, pulses when today's
> sitting is unplayed) opens a hero modal: today's EXTRA-HARD board (drawn from a
> curated hard pool — gauntlet/combo/cascade/threestmt/debtsched/comps/…, seeded
> deterministically worldwide via challengeSeed = dailySeed^0x9e3779b9, its own
> `challenge-YYYY-MM-DD` board so it never collides with the casual morning-sheet
> daily), a live countdown to the next drop, the player's streak, and a STANDALONE
> global leaderboard (fastest-per-user from Supabase, medals, your rank + delta,
> degrades gracefully offline). GATE: level ≥3 to enter, PRO skips the gate AND
> unlocks the full field (free sees top 10) + replays + practice re-rolls — the
> level/PRO mix Wolf's funnel wants. Esc-safe (countdown cleared on close). Gate
> green: onboard 28, parity 94, demo-replay WIN, zero page errors. FUTURE (T-M
> generator feeds this): difficulty tiers, branchier daily mazes. The UI-streamline
> / IA restructure (primary-modes rail) stays a separate screenshot-first round.
> Original design note below.
>
> ## (original T-L design note)
> Wolf: "the daily challenge, which should be gated by either level or the
> paywall, with its own standalone leaderboard that's prominent — in the vein
> of the NYT games: extra-hard daily, with real-time leaders."
> WHAT EXISTS TODAY: a per-day board keyed `daily-YYYY-MM-DD` already collects
> runs of the day's rotating drill (see the leaderboard board-picker). This
> task is the ENHANCEMENT that turns that quiet board into the marquee mode.
> SCOPE TO DESIGN (Wolf sign-off before building, like T-H/T-K):
> 1. **The challenge itself** — a single daily-seeded, EXTRA-HARD sitting
>    (harder than the catalog par; think a gauntlet/combo-tier board or a
>    bespoke daily seed). One attempt (or one ranked attempt + free practice),
>    same seed for everyone worldwide so the leaderboard is apples-to-apples —
>    the NYT crossword model. Reuse the interview-mode daily-seed machinery
>    (dev/INTERVIEW.md) rather than inventing a second seeder.
> 2. **The gate** — playable only at/above a level threshold OR with PRO
>    (paywall). Decide which is primary: level-gate keeps it aspirational and
>    free (drives retention); PRO-gate makes it a conversion lever. Likely
>    BOTH: level-gate the entry, PRO-gate a perk (e.g. see full leaderboard /
>    replay top runs / practice re-rolls). Wolf to pick the mix.
> 3. **The standalone leaderboard** — PROMINENT and separate from the per-drill
>    boards: today's global ranking, live-updating (real-time leaders), your
>    rank + delta to the cut line, a countdown to the next drop, and a streak
>    counter (consecutive dailies — the habit hook). Its own hero slot in the
>    UI, not buried in the board-picker dropdown.
> 4. **UI STREAMLINE (Wolf's paired note)** — "we might have to streamline a
>    bit now that we have so many features." Audit the top nav + picker: the
>    feature set (drills, campaigns, seasons, interview, teams/desks, daily)
>    has outgrown the flat tab row. Propose an information architecture that
>    gives Daily Challenge a front-door without crowding the rest — likely a
>    primary-modes rail (Practice / Daily / Compete) with everything else
>    nested. Sketch to Wolf via screenshots BEFORE moving chrome.
> Constraints: keyboard-only, Esc-safe, real-time board must degrade gracefully
> offline; entitlement checks reuse HOTKEY_PREMIUM. Full gate + AUDIT round.

## T-M · EXCEL-MAZE MOVEMENT LAYER — ✅ SHIPPED r217 (built into navigation)
> RESOLVED: Wolf chose "built into the first nav still so we can wow people off
> the bat with additional randomization" (not a separate drill). r217 ships the
> maze AS the navigation flagship: a scatter of stray marker cells the Ctrl-arrows
> leap between (fixed zig-zag shape D,R,D,L,D, randomized positions), landing on a
> compact P&L the player grabs and copies. build() self-verifies every board with
> a ctrlJump replica before shipping (no unsolvable seed). demo-replay 15/15.
> Difficulty tiers / daily-challenge feed (longer, branchier mazes) remain a
> future lever — the generator is parameterized (RN/CN/dir-sequence) to grow into
> them. Original design note below for reference.
>
> Wolf: "the Ctrl-arrow movement can be made more interesting by having to
> BOUNCE around cells — reminiscent of the Excel mazes that inspired the app."
> IDEA: layer a maze onto navigation's movement half. Instead of a free lap, the
> board seeds a path of "stops" (islands of data separated by blanks) so each
> Ctrl-arrow JUMPS land exactly on the next waypoint — the player threads the
> maze corner to corner using only edge-jumps, the way Ctrl+arrow actually
> behaves (it stops at the boundary between filled and empty). Nail the FEEL: a
> visible breadcrumb/next-stop marker, a wrong-jump nudge, and a satisfying
> "solved the maze" finish. Reuse navigation's latch machinery (each waypoint =
> a latch in order). Open questions for Wolf: is this a NEW drill (nav II /
> "the maze") or a reshaped movement half of navigation? difficulty tiers
> (longer/branchier mazes as you level)? does it feed the daily challenge
> (T-L)? Sketch to Wolf before building — this is the app's origin story, worth
> getting the feel exactly right.

## Standing items (do NOT lose)
- **Supabase live smoke test** — FIRST session with egress: desks/assignments/
  school-tags RPCs against prod; seeded desk codes stay held until green.
- Par policy: parKeys = measured medians (sweep), par seconds = tuned; plugin
  overlays are a legal edge; "plugin floor" display remains queued.
- Cache-bump all 9 pages on shared-asset changes; AUDIT.md every push;
  fetch-first (parallel sessions!); force-sync claude/project-handover-80gboe.
- Model ID never in commits/PRs/code artifacts. Stripe stays TEST MODE.

## Enrichment backlog matrix — FULLY DISPATCHED as of r187 (tranches r170/r181/r187; ribbon's flag was stale, resolved r170). Kept below for the historical record.
## (r169 snapshot — suspects, grade by hand first)
key        | flags (proxies only — margin/cagr/editfix "0 checks" = .map()-generated, fine)
-----------|------------------------------------------------------------------
cagr       | offset-cloned blocks, no codename
lookup     | no codename, static query panel
lookup2    | no codename, thin body
percent    | strong lesson, thin surroundings, no codename
bridge     | static layout (B2:F4 fixed)
autofit    | no title row
saves      | beats are save-only, could carry real work between
editfix    | good bones; typo pool could widen
ribbon     | 3 jobs, could take a 4th family
format     | no codename; overlaps decimals drill — differentiate or merge
drill      | good; ESV-onto-itself could add a decoy link
transpose  | fine after r168 aha; lowest priority

## T-N · ENGINE CAPABILITY GAPS (Excel-first) — QUEUED (Wolf r230)
> Wolf's reframe: build drills to EXCEL's spec, not the engine's. Full audit lives in
> dev/ENGINE_GAP_AUDIT.md. Tier-1 muscles to build first (highest drill-depth/effort),
> then re-pass the Formatting + Foundations drills to USE them:
>   1. FILL COLOR as a real palette (not just 'blue') + a discoverable Alt H H picker —
>      also fixes "the way we set background colors isn't elegant".
>   2. CLEAR menu (Alt H E A/F/C) — clear all / formats / contents.
>   3. INDENT (Alt H 5/6 + indent prop) — sub-line-item structure.
>   4. Ctrl+1 number-format DEPTH — date, accounting, custom scale (#,##0,,"M").
> Tier-2: font size (Alt H F G/K), font-color as a visible dropdown, border ribbon depth
> (L/R/outside/inside/thick + clear-border), cell styles gallery, Find & Replace.
> NOT building: Merge & Center (the never-merge house rule is itself a lesson).

## T-O · DESK THEME COLORS IN DRILLS — QUEUED (Wolf r230, design-first)
> A desk/team sets a house palette (input-blue, header-shade, total-rule, title font);
> drills RENDER + GRADE against that desk's palette, not the generic one. Depends on the
> Tier-1 fill palette + font muscles (T-N) and the team/desk model. Big retention + B2B
> hook — desks buy training that looks like their own book. Sketch to Wolf before building.
> **SHELVED (Wolf r251):** superseded by T-Q — Wolf chose identity flair over drills that
> render/grade against a desk palette. Keep the note for reference; do not build.

## T-Q · SCHOOL & DESK FLAIR — Phase 1 APPROVED, ready to build (Wolf r251)
> Surface the latent school/desk data as visible IDENTITY. The backend already exists and
> is verified healthy (r196): `.edu` sign-up auto-matches to a school's desk, plus the
> `refresh_school_tag` RPC and `my_desk` — but NOTHING shows in the UI today. This makes it
> wearable: a pill on the card + every leaderboard row, and school-vs-school standings.
>
> **THE SCHOOL MARK — DECIDED (colored monogram, our own; no logos/symbols):**
> - a letter (1–3 chars) in the school's colors, in ONE clean shape (a circle chip).
> - **two-tone = BACKGROUND fill + LETTER color** (Wharton = navy chip, red letter). **NO
>   border ring** — Wolf r251: single-color icon reads cleanest; the second color lives in
>   the letter, not an outline.
> - **match real school colors as closely as possible**, held to our UI contrast bar —
>   auto-pick a readable ink on light fills (Columbia light-blue → navy letter).
> - optional letterform (mono default / serif / condensed) — keep or drop the dial per taste.
> - **NO official crests / logos / mascots** — trademarked, decided against on both IP and
>   clarity grounds. Custom original symbol-emblems (phoenix/keystone/etc.) were prototyped
>   and REJECTED — they confuse anyone who isn't an alum. Letters + colors only.
>
> **DATA MODEL:** `SCHOOLS = { id: { name, mono, fill, ink?, face? } }` — seed ~100 finance
> feeders with real colors; "Other" = freeform name + a swatch from a small curated palette.
>
> **PHASE 1 (frontend + one stored column):**
>   1. `SCHOOLS` seed table — draft the ~100 list + colors; Wolf trims/approves the list.
>   2. `schoolChip(schoolId, size)` render component (auto-contrast ink) + the "Other" monogram.
>   3. School picker at sign-up + in profile (curated list + "Other"), wired to the existing
>      `.edu` auto-match so most users arrive pre-filled.
>   4. Surfaces: chip on the player card, every leaderboard row, and a **School Standings**
>      panel (aggregate of a school's top analysts — the rivalry / sharing hook).
> **PHASE 2 (frontend):** desk chip beside the school pill; join by code or the auto-match.
> **PHASE 3 (needs Supabase — desk-owner role, aesthetics table, RLS):** a desk owner sets
>   name · accent color · emblem-emoji · tagline; members inherit the desk accent as light
>   flair (their pill tints to it). Aesthetic-only — never drill-grading.

## T-P · CURRICULUM v2 — CONFIRMED shape, EXECUTE AFTER the engine pack (Wolf r230)
> Wolf confirmed: 8 chapters, ~10 RICH drills each, deep domains numbered, cut/merge the weak ~6.
> ORDER: build the engine Tier-1/2 muscles (T-N) FIRST, then restructure + rebuild drills onto them.
> The confirmed chapter map:
>   1. Foundations (10, free): navigation, modeltour, blocksel, filldr, pastes, rowops, colops, editfix, undo, copyover
>   2. Formatting (10, free): housestyle, ruleoff, ruleaudit, dress, typeset, decimals, center, autofit, combo, gauntlet
>   3. Data & Lookups (10, level): sort, scrub, recon, grpfold, filterpass, unhide, lookup, lookup2, drill, series
>   4. Formulas I — Building (10, level): margin, foot, percent, growth, cagr, anchor, bridge, sumif, rollup, cases
>   5. Formulas II — Audit & Repair (10, level): audit, triage, wrapfix, balcheck, stalelink, wirewalk, hunt, signerr, versionup, balance
>   6. Models I — Valuation (9, PRO): wacc, dcf, comps, txncomps, football, dcfsens, retbridge, accdil, sourcesuses
>   7. Models II — Credit & Schedules (9, PRO): lbo, revolver, schedule, waterfall, cascade, wk13, liqbridge, covtable, debtsched
>   8. Full Builds (5, PRO): isbuild, bsbuild, cfslink, nwcsched, threestmt
> CUT/MERGE the weak: saves→fold copyover · polish/blue/format→merge housestyle/dress/decimals · ribbon→fold into Formatting · transpose→fold pastes.
