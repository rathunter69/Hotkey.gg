# DEPTH_PASS — the catalog rework specification (r420c — playtest round 1 integrated, 2026-07-24)

_The master build document for the depth pass. Binding inputs: Wolf's locked parameters (PROJECT_CONTEXT "WOLF DECISIONS — DEPTH PASS", 2026-07-24), **Wolf review round 1 (2026-07-24: semantic references over cell ranges · vague-verb ban · Full Builds as a separate build pass · per-beat sub-clocks · all eight taste calls resolved)**, **Wolf PLAYTEST round 1 (2026-07-24, wave 1 — dev/ROUND1_FEEDBACK.md: the §1.0 binding rules, the mystery-☆, the Ctrl+S universal closer, the rowops⊕colops merge, and the five ROUND-2 wave-1 spec pages)**, AUDIT_R417 §A/§D/§G, DRILL_DOCTRINE.md, and the three depth-research reports (finance canon · competitive Excel · course design + language standard). Where a beat descends from a research pattern it is tagged inline, e.g. [Origami Ladder]. Former open taste calls are all RESOLVED and collected in the decision log at the end._

---

## 0 · How to use this doc

One agent builds one drill, in catalog order, Foundations first. The agent reads §1 (the anatomy standard — non-negotiable), the §2 mechanics its drill consumes, and its own §4 page; it does NOT need the research reports — every pattern it needs is restated here. The §4 beat lines are the spec: the agent ships those lines as the literal check labels (typo-level deviations only; a structural deviation gets a code comment naming why + a note in the PR). Capstones (§2.4) build after their chapter's other drills so they can chain the reworked boards.

**MODEL-PROOF PROTOCOL (WORKFLOW.md §8, r420c):** this doc is written to be executed by a LESS-CAPABLE agent than the one that wrote it — every rule carries its rationale inline (the WHY, dated, with owner), every §4 page states exact beats/predicates/randomization, and nothing load-bearing lives only in session memory. A build agent must never have to re-derive design intent: if a page under-specifies something the agent needs, that is a SPEC BUG — stop and escalate to the orchestrator, do not improvise. All future wave agents build to the r420c rules (§1.0 below), which OVERRIDE any older line in this doc where they conflict.

**Per-drill definition of done** (all nine, in the PR):
1. `build()` / `checks()` / `guide()` / `req` / `targets()` / `demo()` reworked to this page; beats = the page's lines.
2. Invariants: `guide.length === checks.length === targets.length` (bonus line included, flagged `bonus:true`); registered in `dev/check-invariants.js`.
3. Randomization per this page's spec; geometry moats proven (no Ctrl-arrow ride-through between islands, disjoint destination rects).
4. Doctrine §4 gate green: syntax → `e2e-demo-replay.js` (this drill ×3 seeds, then full run) → `e2e-alt-paths.js` with ≥2 ALTS entries for this drill (different op order AND different chord route; run guided=true too) → `e2e-par-sweep.js` → parKeys set to measured median → par seconds retuned deliberately and mirrored in `HOTKEY_PARS` → `e2e-fit-sweep.js` (no ##### at load except where scripted).
5. Medal clocks verified against the re-swept par (§2.1 derivation; overrides only where this page says so).
6. `drills.js` meta (name/label/tab/desc) passes the language standard — no chord names in picker copy (the r417 Class-A de-hint rule).
7. Screenshots: fresh board, mid-solve, win state. Win state passes the sendable-page test (doctrine §8.1.5).
8. `dev/AUDIT.md` round entry + check off the drill's AUDIT_R417 §D findings.
9. Ships in a ~5-drill batch PR per §5; never solo unless the batch boundary says so.

---

## 1 · THE DRILL ANATOMY STANDARD

Every drill in the catalog — no chapter-scaled shortcuts — meets ALL of:

### 1.0 PLAYTEST ROUND-1 LAW (r420c, Wolf 2026-07-24 — BINDING; where any older line in this doc conflicts, §1.0 wins)
Source: dev/ROUND1_FEEDBACK.md (Wolf's wave-1 playtest + his four follow-up decisions). Six rules, all catalog-wide:

**(a) FORMAT-AS-YOU-GO.** A formatting beat directly FOLLOWS the beat that created or touched the cells it formats — never batched at the end of the drill. (Wolf: sum a row → format that row before moving on.) WHY: the habit being trained is format-in-line, not "do all the work, dress later". Page authors sequence every dress beat immediately after its parent work beat; a trailing catch-all formatting beat is a spec bug.

**(b) OUTCOME-VAGUE INSTRUCTIONS.** Checklist lines state the OUTCOME, not the route. The user is ALLOWED to struggle; the TIMER (and slow time) teaches that they should be faster, and HINTS (guide/F1) teach the hotkey route. This recalibrates §1.7: the closed verb list and semantic references STAND, but step-by-step prescription is STRIPPED — "Total all four quarters to get to Fiscal Year totals", NOT "one SUM beside the Revenue line, filled down". A line that names the mechanism (which cell to start in, which direction to fill, which formula shape) is over-prescriptive; the mechanism lives in `guide`/`req`/demo.

**(c) FREEDOM RE-AFFIRMED.** Every check is gradeable by ANY route, including slow typing (typing values instead of referencing, entering minus signs instead of paste-special-multiply). No core check may REQUIRE the fast route — the player is never penalized for the slow way; the clock shows them the cost. (The only sanctioned fast-route grading is the ☆ bonus, rule (d), and doctrine's explicit anchor-text exception where anchoring IS the lesson.)

**(d) ☆ LAW — THE MYSTERY SLOT.** Bonuses are HIDDEN EFFICIENCY discoveries. Display: the checklist shows a dim **"☆ ?"** line with NO text; the label reveals on earn (mid-run) or on the results card (§2.2). Content: a ☆ rewards a MASTERY MOVE — proper anchoring so one copy-down/copy-right fills a block, one paste-special-multiply pass covering every conversion, whole-row/column selection discipline — NEVER a formatting task. Existing formatting-☆s die as their drill's round-2/wave rework lands.

**(e) UNIVERSAL CLOSER — "Save your work".** Every classic drill's REQUIRED final beat is "Save your work" (Ctrl+S); the WIN FIRES ON THE SAVE. WHY: a standard ending, a good desk habit, and an unambiguous finish signal. The closer is a core check but is EXEMPT from the 4–6 core-beat count (§1.1), and §1.6's finish-state beat becomes the last WORK beat, with the save after it. Pars re-measure (+~2 keys per drill) as the waves roll — no big-bang retune; each wave's par sweep absorbs it. (Sanctioned exception: navigation §4.1, where Wolf's own beat sketch places a final bottom-right flight AFTER the save — the save stays required; the win fires on the last core beat there.)

**(f) CONVENTIONS.** Two board-dress laws, everywhere: **totals take TOP borders** — never a bottom border under a total (a total earns the line ABOVE it); and **helper/assumption cells are styled LIGHT YELLOW + ALL BORDERS** — the input convention — and ship POPULATED, so the player can see they're there to be used. Any existing page line that says "bottom border under the Total row" is superseded; wave agents apply (f) as they build (WORKFLOW.md §8 propagation sweep).

### 1.1 Beats
- **4–6 core graded beats + exactly 1 bonus beat** (☆). Core beats win the drill; the bonus never blocks the win (§2.2). Fewer than 4 core beats is allowed ONLY for pure-reflex Foundations drills explicitly marked on their §4 page (none currently are).
- Beats CHAIN where the chapter allows it (doctrine §8.1.4): each action changes what the next operates on. Order-free chore lists are acceptable only in pure-formatting showcases.
- One verb = one beat. A tightly-paired dress (bold + rule of the same row, one motion) may share a line.
- No do-nothing lines: leave-untouched guards fold into the `ok` of the action check they protect.

### 1.2 Randomization
Minimum TWO independent axes per drill, from:
(a) **site shuffle** — build anchor drawn from a ≥3-spot pool (disjoint rects, moats in both axes);
(b) **content pools** — labels/codename/peer names Fisher-Yates shuffled;
(c) **value ranges** — every figure through `rnd()`, magnitudes fit column widths;
(d) **which-one-is-broken** — the defective row/cell/column varies per seed.
Full-grid artifacts (Models II / Full Builds boards that occupy most of 20×10) may substitute (a) with **corner jitter** (±1–2 rows/cols) + (d); their §4 page says which. Same-seed determinism holds (replay ×3 seeds must win).

### 1.3 Grid usage
The board is 20 rows × 10 cols (A–J; `__ROW_CAP` 20). Target ≥60% of rows carrying content or scripted purpose at the win state; a drill living in a 6×4 corner of an empty sheet fails the density doctrine. Title row + labeled rows/headers/units per doctrine §2.1; win state per §2.1b (banker's-workbook finish) — where the lesson isn't formatting, the board ships pre-dressed.

**Labeled targets (Wolf, review round 1 — load-bearing):** every graded target carries a VISIBLE label on the board — a row label, column header, or block title — so the semantic references §1.7 mandates always resolve. `build()` specs must seed those labels. R4's "never grade against a term the sheet doesn't show" now binds in both directions: no beat term the board doesn't label, and no graded target the board leaves unlabeled. The only exception is the R2(a) class (maze/obstacle boards, where coordinates are the game).

### 1.4 Medal clocks (derivation rule)
Clocks derive from the re-swept par; they are DISPLAY over the existing `HK_BAND` machinery, not a fifth system (§2.1):
- **Pass** = par × 1.5 (Silver threshold) · **Pro** = par × 1.15 (Gold) · **Legendary** = par × 1.0 (Elite).
After a rework: run the par sweep, set parKeys to the median, retune par seconds deliberately (par ≈ clean-expert median +10%), mirror in HOTKEY_PARS — clocks then fall out. A drill may override display clocks only via the §2.1 `clocks` field with cause on its §4 page (capstones widen Pass to ×2.0).

### 1.5 Aha placement
`aha` is mandatory, surfaced on the results card: one nameable insight, lowercase, em-dash voice. The aha's MOMENT must exist inside the run — a beat where the insight lands (the fill that proves relative refs; the undo that resurrects the block; the delete that proves values went dead). Name that beat on the §4 page.

### 1.6 Finish-state beat
The last WORK beat leaves the artifact sendable: a dress/close motion (bold + rule the bottom line, outside border, set the width, return to A1) or a prove-out (check row reads zero, total re-ties). "Finish at A1 — a clean model greets the reader" is the house closer for build drills; don't use it where a dress beat closes better. **r420c:** the §1.0(e) save closer ("Save your work") follows the finish-state beat as the true final line — the finish-state beat is now second-to-last, and the win fires on the save.

### 1.7 Language — THE LANGUAGE STANDARD (R1–R10, binding on every line you write)
**Wolf decision (review round 1, 2026-07-24) — CLOSED: a beat references the real-world item and its data, never the bare cell.** The platform builds real-world Excel instinct — players should think in line items, not coordinates. NOT "Add a total row C1:C5 and sum the columns" → "Add a total row under the Revenue line and add the revenues and costs". NOT "divide B5/B1" → "Calculate the EBITDA margin by dividing EBITDA by revenue" (verb-list form: "Build the EBITDA margin — EBITDA divided by revenue"). Bare cell references are the FALLBACK, not the default — R2/R9 below carry the rule; §1.3's labeled-target requirement guarantees a semantic name always exists. This reverses the pre-r420b explicit-range default; all §4 pages are written to the semantic style.
**r420c RECALIBRATION (playtest round 1 — §1.0(b) governs):** semantic references + closed verbs STAND, but the lines got too prescriptive — they were teaching the route, not naming the outcome. Strip step-by-step prescription from every check label: no start-cell, no fill-direction, no formula-shape in the line unless the outcome is unintelligible without it. "Total all four quarters to get to Fiscal Year totals" — not "one SUM beside the Revenue line, filled down". The route belongs to `guide`/`req`/demo (the hint ladder is the teacher); the clock is the pressure. Where a §4 page below still carries a route-flavored line, the wave agent rewrites it to the outcome form under §1.0(b) — the five wave-1 ROUND-2 pages (§4.1–4.5) are the exemplars.
- **R1** Imperative verb first, from the CLOSED VERB LIST below. One verb = one gradeable beat; "and" → two lines (tight-pair exception in 1.1).
- **R2** Specific object, named by its BOARD LABEL: "the Revenue line", "the Costs block", "the EBITDA margin cell", "under the Q3 column". Never "the data", "the top part". Bare cell/range refs are allowed ONLY as fallback: (a) the board genuinely has no label for the target — navigation/maze/obstacle boards (colored blocks, checkpoints) where coordinates ARE the game; or (b) a parenthetical disambiguator after the semantic name, where it genuinely helps — "the check cell (F14)". §1.3's labeled-target rule makes case (a) rare by construction.
- **R3** Observable END STATE, never the gesture. "Freeze the header row", not the menu path. The hotkey is the solution and lives in `guide`/`req` — NEVER in a check label.
- **R4** Artifact names in prompts; labeled items in beats. Never grade against a term the sheet doesn't show — and never ship a graded target the sheet doesn't label (§1.3, the same rule read from the board's side).
- **R5** At most one "— so that / — the" acceptance clause per line; two conditions = two lines; sequencing by list order only.
- **R6** Values quoted verbatim; formats by Excel's names (comma, percent, currency); series as first, second, … last.
- **R7** BANNED: metaphor/craft verbs (dress, tie out, scrub, massage, foot, true up, rule off, box); vague placement verbs (pull in, bring in, drop in, throw in, plug in, pop in, stick in, toss in — say the precise verb: Enter, Copy, Reference, Total); slang without gloss (plug, roll forward, flash — brief-only, glossed on first use); chord names in checklist text; vague quantifiers (appropriately, as needed, clean up, nicely).
- **R8** ≤ ~12 words after the verb, or split the line.
- **R9** The DEFAULT reference is the labeled item: "the Revenue line" · "the Costs block" · "the EBITDA margin cell" · "under the Q3 column". Where a cell ref appears at all (R2 fallback or parenthetical disambiguator), fixed style: `A1:E1` · "column C" · "row 7" · "the range beginning at B18".
- **R10** Negative space explicit: "Delete the content of the memo cell (keep the cell and its formatting)."

**THE CLOSED VERB LIST** (42 — a check label starts with one of these, nothing else):
Add · Autofit · Bold · Build · Center · Clear · Collect · Color · Comma-format · Copy · Cut · Delete · Dollar-format · Enter · Fill · Filter · Find · Finish · Fix · Flip · Fold · Group · Indent · Insert · Italicize · Left-align · Move · Paste · Percent-format · Reference · Repoint · Select · Set · Sort · Strike · Total · Trace · Transpose · Unbold · Underline · Undo · Unhide · Unfold · Wrap
(Total = land a live SUM; Build = enter a live formula; Reference = point a formula at an existing output, never retype it; Fix/Repoint = repair in place; Wrap = IFERROR or text-wrap by context. Adding a verb requires a doc PR touching this list — Reference added r420b for the never-retype beats.)
Voice stays doctrine §7 (associate voice, lowercase confidence, em dashes) — the standard governs structure, not warmth. Two registers per research 1: checklist-imperative in beats; scenario-imperative in prompts ("the VP needs the downside case before the 4pm call").

### 1.8 Alt-path registration minimums
≥2 ALTS entries per drill: one different op ORDER, one different chord ROUTE where the engine offers one (ribbon walk vs Ctrl chord, Alt E S vs Alt H V S, typed $ vs F4, typed refs vs pointer). The 9 zero-ALT drills (fxconvert, tieout, fcfbuild, intsched, opmodel, dcfbuild, lbobuild, debtblock, dashcover) clear this during their rework. An alt that fails means an overfit check or missing engine route — fix that, never delete the alt.

### 1.9 Hint ladder coherence
Four rungs, rebuilt together with the beats:
- **req** — one-line chord summary (chords allowed here);
- **guide** — one entry PER CHECK, index-aligned (`guide[i]` hints `checks[i]`; the r417 43/82 misalignment class dies in this pass); bonus beat gets a guide line;
- **targets** — index-aligned with checks (guided ring on the right cell);
- **aha** — §1.5; **demo** — full scripted solve incl. the bonus beat, replay-verified.
Where a drill's SEO page wants a sequential narrative that per-check guides can't give, add the optional `walkthrough` field (see §2.6) rather than de-aligning guide.

---

## 2 · MECHANICS SPECS — build-once platform pieces

Build order: 2.1 → 2.2 → 2.3 → 2.5/2.6/2.7 land as one platform PR batch BEFORE the first drill batch; 2.4 (capstones) lands per-chapter with each chapter's batch.

### 2.1 Tiered time medals (pass / pro / legendary)
**Decision: display layer over HK_BAND, not a new system** (r363 consolidation law — one ladder). The five stored bands stay (Cleared/Bronze/Silver/Gold/Elite; XP + PB persistence untouched). The NEW surface is three named clocks per drill:
- Pass = Silver clock (par×1.5) · Pro = Gold clock (par×1.15) · Legendary = Elite clock (par×1.0).
- **Data model:** nothing new for the default case — clocks derive at render from `HOTKEY_PARS[key]`. Optional per-drill override `HOTKEY_CLOCKS[key] = {pass, pro, leg}` in drills.js (capstones set pass=par×2.0; nothing else overrides without a §4 note).
- **Display:** drill-start card shows the three clocks as a strip (`⏱ pass 0:52 · pro 0:40 · legendary 0:35`); results card names the clock you beat and the next one with its time ("Pro 0:38 — legendary at 0:35"); PB chip shows best clock icon.
- **Grading:** unchanged — `HK_BAND.of(pb, par)`. Bronze/Cleared still exist as sub-Pass consolation bands; they just aren't advertised as clocks.
- **RESOLVED (Wolf, 2026-07-24): A.** Display layer over the existing five bands, zero migration — same player-facing story, no data surgery. (B — a true 3-tier replacing the bands — is dead.)
- **Sub-clocks — per-beat splits, speedrun-segment style (Wolf's rider on A):** the grading loop already timestamps each check's flip; capture them as `S.splits[i]` (elapsed at beat i's completion, bonus included). **In-run:** a completed checklist row shows its split beside the ✓ (`0:14.2`), dim ink, PB-delta tinted (ahead = green, behind = neutral — never red mid-run). **Post-run:** the results card gains a split table — this run's splits vs the PB run's, per beat, worst-delta beat highlighted (speedrun-timer convention). PB splits persist beside the PB time (same localStorage + outbox shape). Display/telemetry ONLY — no XP, no band effect, no fifth progression system. **Synergies:** §2.7 mistakes-replay pre-selects the worst-split beat by default; §2.3 meters and §2.6 touch-lists grade off the same timestamps; a future ghost race renders split deltas from the same array (backlog, not this pass); capstone cutline checkpoints (if ever) would read these splits, not new state.

### 2.2 Bonus objectives (☆)
- **Declare:** a check entry gains `bonus:true`: `{label:'…', ok:…, bonus:true}`. Exactly one per drill (§1.1).
- **Grade:** win condition = every non-bonus check ok (winCheck filters `!c.bonus`). The bonus is evaluated like any check; its state is LATCHED at the win moment — doing it costs live seconds, which is the intended tension with the clocks [Accuracy-Gated Overdrive, inverted].
- **Display (r420c — THE MYSTERY SLOT, §1.0(d)):** rendered last in the checklist as a dim **"☆ ?"** line with NO label text. The label REVEALS on earn (the line flips to its text + gold the moment the latch fires) and on the results card; an unearned ☆ stays "☆ ?" through the run and shows "☆ ? — undiscovered" neutral on the results card (never red, never spoiled). PB rows carry a ☆ flag when the PB run cleared it. Content law: hidden EFFICIENCY discoveries only — mastery moves, never formatting (§1.0(d)).
- **Reward:** one-time +15 xp per drill's first bonus clear (localStorage latch + outbox like band XP). No medal/campaign/leaderboard effect — a bonus can never gate anything.
- **Guided/demo:** guide line exists for the bonus; demo performs it (so replay covers it); guided rails include its zone.

### 2.3 Disclosed-error-count format (audit/repair drills)
The house format for audit drills, per Wolf: the prompt DISCLOSES the exact count ("this model contains 7 errors — find all 7") and the HUD meters progress.
- **Check pattern:** one aggregate counter check whose label live-updates — `{label:'Find and fix all '+N+' planted errors ('+found+'/'+N+')', ok: found===N}` (navigation's pip-counter precedent) — PLUS per-class beats where classes are the lesson (triage: one beat per error family). `found` computes from per-error predicates in checks(S); no new engine state needed.
- **Meter UI:** when a drill sets `meta.errorCount=N` in drills.js, the HUD shows a `N-segment` progress meter that fills as predicates flip; segments never un-fill within a run (latch per error id).
- **Applies to:** audit, ruleaudit, triage, balcheck, stalelink, signerr, hunt, tieout(partial), redflags (capstone). Each §4 page states its N. N is FIXED per drill, not per seed — RESOLVED (Wolf, 2026-07-24): honest prompt strings beat per-seed variance.
- **Escalation:** where natural, later errors only become VISIBLE once earlier ones are fixed (recalc reveals the downstream break) [Cascading Bug Hunt] — redflags and balcheck use this; the meter still shows 0/N from the start.

### 2.4 CAPSTONE DRILLS (Wolf's name — never "chapter boss")
One per chapter, LAST in the chapter, chaining that chapter's skills into one artifact. Extends backlog #103.
- **Data model:** `drills.js` meta gains `capstone:true`; each `HOTKEY_CAMPAIGN.chapters[i]` gains `capstone:'<key>'`.
- **Gate rule:** milestone/chapter N complete = (existing par×1.5 clears on its listed keys) AND (one CLEAN RUN of chapter N's capstone — no mouse, no guided, all core beats; time irrelevant). Unlimited retakes, no penalty, no cooldown [CFI mastery-gate]. Chapter N+1's milestone and its one-time XP stay locked until then. Free-play access to later drills is NEVER blocked (research 3 do-not-copy #2 — gate progression artifacts, not access). RESOLVED (Wolf, 2026-07-24): the gate governs the NEXT MILESTONE ONLY — certificate issuance is untouched, no `issue_certificate` server-side change.
- **Display:** picker card gets a full-color group ring + "CAPSTONE" tag; locked next-milestone chip reads "clear the <chapter> capstone to open this track leg". Capstone results card names the chapter it opened.
- **The eight capstones** (3 designated existing + 5 new; specs in §4):
  | ch | key | name | artifact | chains |
  |----|-----|------|----------|--------|
  | c1 Foundations | modeltour (designate) | Model Tour | quarterly op model, 4 broken subtotals | ctrl-arrow flight · formula rebuild · fill right · format · close |
  | c2 Formatting | gauntlet (designate) | Make It Model-Ready | raw S&U two-sided table | blue inputs · SUMs · bold+rules · commas · autofit |
  | c3 Formulas I | **qclose (NEW)** | Close the Quarter | one quarterly P&L page | point-mode · autosum · anchored % · YoY growth · SUMIF memo |
  | c4 Data & Lookups | **cleanroom (NEW)** | The Data-Room Tape | dirty export → sendable table | junk-row delete · sort · filter read · lookup pull · group+fold |
  | c5 Formulas II | **redflags (NEW)** | The Red-Flag Pass | inherited one-tab model, 7 disclosed errors | error triage · stale link · sign flip · hardcode hunt · short SUM |
  | c6 Models I | **pitchpage (NEW)** | The Valuation Page | one-page valuation summary | WACC/DCF/comps/football outputs referenced, never retyped |
  | c7 Models II | cascade (designate, moved last) | Run the Full Cascade | 3 tranches × 4 yrs waterfall | seniority MINs · roll-forwards · interest · close |
  | c8 Full Builds | **shipit (NEW)** | Ship the Model | mini 3-statement + headline box | drivers · both sides · cash link · zero check · values hand-off |

### 2.5 Origami tier-ladder (platform piece #1 of 3)
One board, 3–4 tiers; the tier-N+1 region is VISUALLY parked (dim fill + "▸ unlocks" label) until tier N's checks grade, then paints in live [Origami Ladder + One Board, Many Rooms]. Engine: `build()` may return `tiers:[{checks:[i,j], reveal:{cells…}}]`; `checks()` re-renders reveal cells when a tier completes; guided rails fence to the active tier. **Why now:** the capstones and the ladder reworks (lookup, sort, redflags) all want staged reveals; the strongest evidence-backed engagement combo in research 2 (#1+#2+#4) needs it.

### 2.6 Checkpoint touch-lists (platform piece #2 of 3)
Generalize navigation's pip machinery: `build()` may return `touch:{cells:[…], label:'…'}`; the engine latches visits and exposes `S.touchGot` for counter labels ('(3/6)') [Checkpoint Touch-List]. **Why now:** navigation/modeltour/wirewalk/hunt reworks all hand-roll this today; one implementation, one invariant, counter labels come free for §2.3 meters too.

### 2.7 Mistakes-replay micro-drill (platform piece #3 of 3)
On a non-clean or sub-Pass run, the results card offers "redo the beats you dropped" — a 30-second re-run seeded identically, pre-completed to the first dropped beat, grading only the dropped ones [ShortcutFoo re-queue + faded worked example]. On a clean-but-slow run it targets the WORST SPLIT from the §2.1 split table instead. No XP, no leaderboard post; pure rep. **Why now:** it is the missing middle tier between watch-solution and cold retry, and it reuses the §2.5 tier plumbing (pre-completed board = tier already graded). Progressive-solution-unlock for watch-solution is explicitly DEFERRED (lower ROI until alt-path browsing ships). RESOLVED (Wolf, 2026-07-24): ships in P0.

### 2.8 Shared invariants landing with this batch
`check-invariants.js` gains: guide/checks/targets tri-length equality (bonus included) · exactly one `bonus:true` per drill · every capstone key present in its chapter + meta.capstone · errorCount drills expose a counter label matching `(\d+)/N` · HOTKEY_CLOCKS keys ⊆ menuOrder · closed-verb lint on check labels (first word ∈ §1.7 list; CI warns, human merges) · split capture (`S.splits.length === checks.length` at the win snapshot, §2.1) · bare-range lint on check labels (a label that is ONLY coordinates with no board-label noun flags for review — the §1.7 semantic rule; maze-class drills allowlisted).

---

## 3 · CATALOG DELTA TABLE

Every add/designate/move/rename of the pass. Keys are immutable (PBs, leaderboard boards, runs history key off them) — renames touch meta only. Plumbing legend: SPINE = HOTKEY_CAMPAIGN.chapters · TRACKS = HK_TRACKS + dev/migrate-certificates.sql arrays (MUST move in the same PR — the r359 drift warning) · PARS = HOTKEY_PARS · LB = leaderboard boards (auto from menuOrder; new key = new board, no migration) · ACH = achievements reading groups (auto via c.groups) · POOL = HOTKEY_CHALLENGE_POOL.

| # | delta | type | rationale | plumbing impact |
|---|-------|------|-----------|-----------------|
| D1 | `qclose` — "Close the Quarter" | ADD (Formulas I capstone, after cases) | chapter has no skill-chaining closer; cases is a single-mechanic switch drill | SPINE c3 +capstone; TRACKS formulas +key; PARS +entry; LB auto; ACH grp3 auto-widens |
| D2 | `vlookup` — "The Legacy Lookup" | ADD (Data & Lookups, between lookup and lookup2) | canon-named gap (doctrine §6); engine has VLOOKUP since r416; teaches WHY desks drill INDEX/MATCH by breaking VLOOKUP live | TRACKS formulas +key; PARS; LB auto |
| D3 | `cleanroom` — "The Data-Room Tape" | ADD (Data & Lookups capstone) | chapter's skills never chain; the clean→aggregate→present pipeline is the #10 canon pattern | SPINE c4 +capstone; TRACKS formulas; PARS; LB auto |
| D4 | `redflags` — "The Red-Flag Pass" | ADD (Formulas II capstone) | the flagship disclosed-error-count drill; chapter is the audit chapter and has no summative audit | SPINE c5 +capstone; TRACKS formulas; PARS; LB auto; POOL add after calibration |
| D5 | `pitchpage` — "The Valuation Page" | ADD (Models I capstone) | rebuild-the-output-page pattern; chains every Models I output into the page a VP actually reads | SPINE c6 +capstone; TRACKS modeling; PARS; LB auto |
| D6 | `shipit` — "Ship the Model" | ADD (Full Builds capstone) | the timed micro-build with a balance floor — the Adventis/interview-test endgame the whole catalog funnels to | SPINE c8 +capstone; TRACKS modeling; PARS; LB auto; POOL candidate |
| D7 | modeltour | DESIGNATE capstone (c1) | already the chapter closer (r367 move); chains nav/rebuild/fill/format | SPINE c1 capstone field only |
| D8 | gauntlet | DESIGNATE capstone (c2) | already "make it model-ready", last in chapter | SPINE c2 capstone field only |
| D9 | cascade | DESIGNATE capstone (c7) + MOVE to end of Models II (after debtsched) | it IS the chapter chained (3 tranches × 4 yrs); move makes capstone-last uniform | groups[] order; menuOrder shifts (1–9 hotkeys, Ctrl+PgUp/Dn cycle — cosmetic); SPINE c7 capstone field |
| D10 | bridge meta | RENAME name 'Bridge'→'Point Mode', label→'Point-mode formulas', tab→'Point' | drills.js meta contradicts the drill's actual lesson (engine already says Point Mode) | meta only |
| D11 | hunt meta | RENAME tab 'Audit'→'Hardcodes' | tab collision with `audit` drill's tab 'Audit' in the picker | meta only |
| D12 | anchor meta | RENAME label 'Pin the reference' (keep), tab 'F4'→'Anchors'; desc de-hint | Class-A re-hint (AUDIT_R417 §D): picker leaks the answer chord | meta only |
| D13 | pastes/tieout/anchor descs | REWRITE desc (strip 'Alt E S', 'F9', 'F4') | Class-A de-hint sweep on drills.js metadata | meta only |
| D14 | unhide meta | ALIGN label to index ('Flush the hidden rows') + desc language pass | label drift between drills.js and CHALLENGES | meta only |
| D15 | series meta | RENAME label 'Stub the year header'→'Serve the year table', desc rewrite | drill scope grows (§4 page); old name undersells it | meta only |
| D16 | placement series | NO CHANGE (navigation/dress/margin/sort/opmodel) | margin + sort rework keeps their band roles; verify pars post-sweep | HK_PLACEMENT untouched; re-verify gates after par re-sweep |
| D17 | **colops → rowops** | **RETIRE colops; rowops ABSORBS it** (playtest round 1, Wolf 2026-07-24) | two thin structure drills teach ONE lesson — row AND column insert/delete + the formatting-inheritance behavior belong in one fulsome drill (§4.5 round 2) | menuOrder/groups c1 −1 (colops key removed); PARS entry removed; TRACKS + migrate-certificates.sql arrays updated in the SAME PR (r359 drift rule); LB board orphaned (history kept; unreachable once the key leaves menuOrder — no migration); SPINE c1 list updated if colops appears; ACH auto via groups; POOL n/a. Catalog 82→81 live; the freed slot stays OPEN for a future add |

Catalog after pass: **87 drills** (82 − 1 retire [D17] + 6 adds), 8 chapters, capstone last in each. Chapter counts: 9 · 10 · 12 · 12 · 12 · 11 · 10 · 11. `menuOrder.length` stays the single source of truth — nothing hardcodes a count (CI already guards).

Explicitly considered and REJECTED: merging lookup2 into lookup (the one-way → legacy → two-way trilogy is a real progression once D2 lands); deleting series/undo (both clear the bar after rework); splitting pastes (five paste kinds are one lesson, and it already chains); adding F4-repeat-last-action or multi-sheet drills (engine gaps — PIPELINE items, not catalog deltas).

---

## 4 · PER-DRILL SPEC PAGES (final catalog order, 87 pages + the retired-colops stub)

_r420c: §4.1–4.5 are the wave-1 **ROUND-2** pages — rebuilt from Wolf's playtest (dev/ROUND1_FEEDBACK.md); they are also the house exemplars of the §1.0 rules (outcome-vague lines, format-as-you-go ordering, mystery ☆, save closer, conventions). Every later page still shows its pre-playtest beats — wave agents apply §1.0 on top as they build (§1.0 wins on conflict)._

Page grammar: **Now** = current beats/checks + weakness · **Beats** = the new core list (these ARE the check labels) + ☆ bonus · **Random** = randomization axes · **Aha/Finish** = insight moment + closing beat · **Clocks** = std (derive per §1.4) unless noted · **Engine** = r419+ dependencies · **Effort** S/M/L.

### CH 1 · FOUNDATIONS (9 — colops retired, D17)

#### 4.1 navigation — "Navigation maze" · M — **ROUND 2 (playtest r1)**
**Round-1 verdict (Wolf):** the maze is idiosyncratic in a bad way — lots of single-arrow maneuvering around true-maze corners, which isn't the lesson; it reads "look how long a maze takes me", not fun. Pips are cool. REDESIGN as a **winding corridor** (his reference: "the scary game" trend) — the lesson is Ctrl-arrow flight, so the geometry must make Ctrl-arrow the natural move.
**Reference style:** §1.7 R2(a) exemption stands — an obstacle board; coordinates allowed in guide/targets.
**Board (round 2):** long straight corridor legs walled by data cells, each leg one Ctrl-arrow flight; corners TURN (one keypress reorients), they never wiggle; single-arrow steps are rare doorways, not the norm. The corridor leads to the model data block. The A1 region ships EMPTY — it is the paste destination (Wolf: "leave the place in the model empty where you would want to paste"). Pips KEPT, placed at leg ends so collection rides the corridor flow (never forces a detour off the Ctrl-arrow line).
**Beats (Wolf's sketch, verbatim-adapted — outcome-vague per §1.0(b)):**
1. Navigate to the model data — collect every pip on the way (0/N)
2. Select and copy the whole block of data
3. Return to A1 and paste the data
4. Save your work
5. Finish at the bottom-right corner of the active area
☆ ? (hidden — §1.0(d)): a clean line — zero wall bumps through the corridor. **Latch fix (Wolf):** a Ctrl-arrow flight STOPPING at a wall is NOT a bump; only a keypress swallowed while already flush against the wall (or a single-arrow step into it) increments `S.bumpN`.
**Closer note:** the sanctioned §1.0(e) exception — Wolf's sketch places the bottom-right flight AFTER the save; the save (beat 4) stays required, the win fires on beat 5 (the flight also proves the paste joined the active area — Ctrl+End now includes it).
**Left out (future note):** PgUp/PgDn "elevator" legs (the x-in-row-A/B fast-travel pattern) — Wolf floated them but flagged overload; keep as a later corridor variant, not this round.
**Random:** corridor generator replaces the recursive-backtracker maze — leg count/lengths/turn directions per seed + pip placement + model-block content pools; every seed still self-verifies with the ctrlJump replica before shipping (kept from r217).
**Aha:** "a corridor is four flights, not forty steps — Ctrl-arrow eats the straightaways." **Finish:** beat 5. **Clocks:** re-sweep (new geometry + save). **Engine (fix wave):** BUG B1 — Ctrl-arrow rides THROUGH wall/border cells; walls must stop the jump (blocking geometry regression + parity assert). Bump latch per ☆ note (B7). Migrate pip machinery to §2.6 touch-lists when it lands (no behavior change).

#### 4.2 filldr — "Fill down, fill right" · M — **ROUND 2 (playtest r1)**
**Round-1 verdict (Wolf):** lines too descriptive (they prescribed the route — "one SUM beside the Revenue line, filled down"); too few fill reps; D&A signed wrong for an add-back; EBITDA formatting was the optional ☆ (must be mandatory); margin row misnamed.
**Board (round 2):** revenue feed row up top; build block below with COGS / Opex / **D&A POSITIVE** (it's an add-back — a negative D&A would mean subtracting a negative to reach EBITDA); EBITDA line; FY column; ratio block (COGS % / Opex % / D&A % rows + the row now labeled **"EBITDA margin %"** — renamed from "EBITDA % of revenue").
**Beats (outcome-vague per §1.0(b) — Wolf's sketch lines used where he gave them):**
1. Reference the revenue feed cells onto the top row of the build — the model starts live
2. Fill the cost lines across all four quarters — COGS, Opex and D&A
3. Build EBITDA for every quarter — costs out, D&A added back
4. Format the EBITDA row — bold, with a top border above it (MANDATORY, and it lands HERE: §1.0(a) format-as-you-go, directly after the row exists)
5. Total all four quarters to get to Fiscal Year totals — every line of the build
6. Build the ratio rows — COGS %, Opex %, D&A % and the EBITDA margin %, across the quarters
7. Save your work (§1.0(e))
☆ ? (hidden — §1.0(d)): the three cost-ratio rows land from ONE properly-anchored formula, copied down and copied right — reward anchoring the right cells the FIRST time. Graded by formula census + fill latches at the win; the slow route (three formulas, or typed values) still clears core per §1.0(c).
**Random:** existing value pools + site jitter {B2,B3} kept; Wolf: "struggling to see more variation here — up to you if truly necessary" → no new axes forced; the added reps (beats 2/5/6) are the depth.
**Aha:** relocates to the ☆ moment — "one $ pass, fifteen cells; anchors are where the speed lives" (lands for non-☆ runs at beat 6's fills). **Finish:** beat 6 is the last work beat; save closes. **Clocks:** re-sweep (scope up: +reps +save). **Engine (fix wave):** BUG B2 — Ctrl+Shift+R smart-fills right without a plugin overlay but Ctrl+Shift+D fill-down is dead; fix + parity assert. (Macabacus fast-fill stays an ALT route.)

#### 4.3 pastes — "Paste Special everything" · M — **ROUND 2 (playtest r1)**
**Round-1 verdict (Wolf):** the transpose was ambiguous (the vertical fees could belong to any quarter); the helper cells were invisible as tools; the deck row didn't read values-only; the guided ring flipped targets early; the total row shipped border-less in a fill grey identical to the selection grey. New challenge (☆) needed.
**Board (round 2):** **Q1–Q4 labels beside the vertical fees feed** (vertical→horizontal transpose now legible); the two **helper cells POPULATED and dressed to the §1.0(f) input convention — light yellow, all borders** (the scale factor + the −1, so it's obvious they exist to multiply/divide with); the deck hand-off row LABELED **"values only"**; the Total row ships with a **TOP border** (§1.0(f)) and a fill grey DISTINCT from the selection-highlight grey (style token — bug B5); Subtotal row inconsistently formatted (the formats-paste target).
**Beats (Wolf's sketch, verbatim-adapted — outcome-vague per §1.0(b)):**
1. Transpose the fees from the vertical feed into the fee row — the Q labels say which quarter is which
2. Convert the trading, advisory and subtotal rows to dollars — their units are inconsistent; the yellow helper is an input
3. Make the costs line negative — a cash outflow
4. Paste the formats from the Total row onto the Subtotal row, then unbold it
5. Paste the totals into the "values only" deck row — numbers, no formulas
6. Save your work (§1.0(e))
☆ ? (hidden — §1.0(d), NEW per Wolf's follow-up decision): every inconsistent row converted in **ONE paste-special-multiply pass** — copy the yellow helper once, select all the scale rows, one pass covers both conversions. (The old "color the Fees row blue" formatting ☆ is DEAD.) Typing the converted values or minus signs by hand still clears core — slower, per §1.0(c).
**Guided:** ring-ordering law — the guided ring HOLDS on the active beat's target until its check grades; it never advances early (the round-1 bug: the green marker flipped to the Q1'24 column before the transpose completed — B3).
**Random:** NEW scale-conversion axis (Wolf) — per seed the inconsistent rows are e.g. in 1000s (÷1000) or in raw $ (×100); the helper value, row units and row labels co-vary so the board always states its own problem. Plus the existing side-feed column {G,H} + deck row {10,11} variance.
**Aha:** "the clipboard is an operator — paste-special multiplies, it doesn't just move." **Finish:** beat 5 (the values hand-off) is the last work beat; save closes. **Clocks:** re-sweep. **Engine (fix wave):** B3 guided-ring latch · B4 paste-FORMATS must carry borders (the Total-row formats paste showed none) · B5 style token. r419 paste TILING regression stays listed in this drill's replay. drills.js desc de-hint (D13).

#### 4.4 blocksel — "Assemble and format the summary" · M — **ROUND 2 (playtest r1)**
**Round-1 verdict (Wolf):** copy never said the EBITDA / operating-income feeds arrive in the SAME segment order (they could be out of order — make it explicit); comma formatting requirements out; the header/data alignment standard in (headers bold + centered-across, data right-aligned); a whole-table selection lesson (Ctrl+A) missing; the EBITDA cut grabbed two columns (bug). New non-formatting ☆ needed.
**Beats (outcome-vague per §1.0(b); Wolf's sketch lines used where he gave them):**
1. Copy all of the segment and revenue data into the summary block
2. Bold the top headers and center each across its columns — never merge (§1.0(a): the dress follows the beat that landed them)
3. Right-align the figures under the headers
4. Cut the EBITDA numbers into their summary column — the feed is in the SAME segment order as the summary (the copy now says so)
5. Cut the operating income into its column — same segment order, same motion
6. Add an outside border around the entire table (the hint route teaches whole-table selection — Ctrl+A — then the border; any selection route grades)
7. Save your work (§1.0(e))
☆ ? (hidden — §1.0(d), NEW): both misfiled columns traveled by CUT — each landed in one motion, sources emptied by the move itself, nothing retyped. (Retyping the numbers cell-by-cell still clears core, slower — §1.0(c). The old "center + underline the segment names" formatting ☆ is DEAD.)
**Dropped (Wolf):** the comma/dollar formatting requirements (old beat 5) and the margin-column build (not in his round-2 sketch; margins live in filldr/margin — keeps core at 6).
**Random:** as-is (band shuffle + segment pools) + the EBITDA/Op-inc feed blocks shuffle sides.
**Aha:** "cut is a move — the old spot empties itself, and segment order rides along." **Finish:** beat 6 (the bordered table); save closes. **Clocks:** re-sweep (scope reshaped). **Engine (fix wave):** BUG B6 — cutting the EBITDA selected TWO columns instead of the one data column; fix board geometry/column moats so edge-selection stops at the data column, and verify the cut-paste lands single-column (column-width carry checked).

#### 4.5 rowops — "Rebuild the schedule" · M — **ROUND 2 (playtest r1 — ABSORBS colops, D17)**
**Round-1 verdict (Wolf):** merge this and the column drill into one fulsome structure drill (row AND column inserts/deletions); the placeholder delete felt like deleting a real number (live-looking data sat in the FY26E column); totals wore BOTTOM borders (wrong — §1.0(f)); formatting arrived too late (§1.0(a)); teach that structure ops INHERIT formatting.
**The inheritance lesson (VALIDATED real Excel behavior):** an inserted ROW inherits the formatting of the row ABOVE it; an inserted COLUMN inherits the column to its LEFT (Excel's default — the Insert Options floaty can flip to below/right/clear; we teach the default). The board stages dressed neighbors at every insertion point so the inserted row/column visibly arrives pre-dressed — the lesson lands by seeing it.
**Board (round 2):** the schedule (opex lines × quarters, Total row + FY column) with: a missing [line] (staged row block at the side), a **PLACEHOLDER row that reads CLEARLY EXTRANEOUS** — greyed italic, labeled "PLACEHOLDER — remove", NO values in any live column (the FY26E-data awkwardness dies in build()), a DRAFT column, and a missing [Qn] (staged quarter block, header included). Total row grades with a **TOP border** (§1.0(f)).
**Beats (outcome-vague per §1.0(b)):**
1. Insert a row where the missing [line] belongs and paste the staged line in — it arrives wearing the row above's dress
2. Format the pasted figures to match the schedule (§1.0(a): straight away — the number format is the one thing inheritance can't know; ok also requires the Total re-tie)
3. Delete the PLACEHOLDER row — extraneous by design; the Total contracts
4. Add a top border above the Total row — totals rule on TOP, never underneath (§1.0(f); format-as-you-go: the Total just re-summed twice)
5. Delete the DRAFT column — the schedule closes the gap
6. Insert a column where the missing [Qn] belongs and paste the staged quarter in — it arrives wearing the left column's dress; Q1–Q4 read in order (order guard folds into ok)
7. Save your work (§1.0(e))
☆ ? (hidden — §1.0(d), NEW): every structure op fired from a FULL row / FULL column selection — the whole-row discipline (selection latch at op time; menu/ribbon per-cell routes still clear core, slower — §1.0(c)). The old undo-the-delete ☆ retires (one ☆ per drill; undo keeps its own drill).
**Random:** the UNION of both retired pages' axes — line-pool shuffle, missing-line index, placeholder position (rowops) + which quarter is missing {Q2,Q3}, DRAFT slot, staged-block sides {G,I}, 6 opex lines from an 8-label pool (colops).
**Aha:** "structure ops inherit — a new row dresses like the one above it, a new column like the one to its left." **Finish:** beat 6 (the schedule whole again); save closes. **Clocks:** fresh measure (merged scope ≈ two old drills + save). **Engine (fix wave):** VERIFY/IMPLEMENT insert-inheritance to the Excel default (row-above / column-left) — the lesson depends on it; parity assert lands with it. Undo-over-structure-ops unaffected (AUDIT §A-8). **Plumbing:** D17.

#### 4.6 colops — **RETIRED (D17, playtest round 1 — merged into rowops §4.5)**
Wolf (2026-07-24): "combine this and the column drill to have a more fulsome drill that teaches you row inserts and deletions and column inserts and deletions." Row and column structure ops + the formatting-inheritance lesson are ONE drill — rowops (§4.5 round 2) carries all of it, including this page's former beats (DRAFT-column delete, quarter insert+paste, header order) and its randomization axes. The colops key leaves menuOrder/groups; PARS/TRACKS/cert arrays update in the same PR; its leaderboard board keeps history but goes unreachable; catalog 82→81 live (87 post-pass); the freed slot stays OPEN for a future add. The old spec is superseded — do not build.

#### 4.7 editfix — "Fix the typos in place" · S
**Now:** 4 checks (2 typos in-place, drift audit, stretch the short SUM) — chained, randomized, dense pools. Meets bar except the missing bonus (guide/checks align 4v4 — fine).
**Language pass (1 line) + bonus:**
- drift check → "Fix the drifted Model cell back to the feed's number — the Model column must equal the Feed column"
☆ Strike through the memo line the review closed — retired, not erased (add one memo row to the board)
**Random:** as-is (19-typo pool, slot shuffle, drift index). **Aha:** lands on the F2 range-stretch re-totaling WITH the audit fix. **Finish:** the stretch beat (the total re-ties = prove-out). **Clocks:** std. **Engine:** none.

#### 4.8 undo — "Undo is a tool" · M
**Now:** 3 checks, scripted mistake + undo + aimed delete, site pool. Good story; thin at 3 beats, par 10, and the aha (undo rewinds EXACTLY) can carry more.
**Beats:**
1. Bold the title and italicize the memo line under it — housekeeping first
2. Clear the [SCRATCH X] block — the note says so (its position varies)
3. Undo until every cleared value is back — the block fed Q4
4. Clear the real junk — the [SCRATCH Y] block
5. Enter "cleared per note" in the action-log cell — sign the log (new labeled 1-row log line under the blocks; typed text check)
☆ Undo past your bold, then redo everything back — Ctrl+Z has a twin
**Random:** as-is (4 spot-pool, wrong-block coin flip) + log-cell site rides the blocks. **Aha:** beat 3 — values return EXACTLY. **Finish:** beat 5 (the log line = desk habit: a tick list you can resume). **Clocks:** re-sweep (scope +2 beats). **Engine:** ☆ needs the redo latch — add `S.redoN` beside undoN if absent (3 lines).

#### 4.9 copyover — "Chain the hand-offs" · M
**Now:** 3 destinations (block copy, peeled column, values-only) — the chain is right; checks 3, no dress, fixed sites.
**Beats:**
1. Copy the source block into the working area — formulas travel (the working area carries its own board title)
2. Copy the landed [metric] column into the sensitivity strip — refs re-point
3. Paste the summary row as values only — from the ORIGINAL block, dead numbers
4. Color the values-only row blue — hardcodes wear blue
5. Add an outside border around the summary strip — it ships tonight
☆ Delete the source block — the values-only row holds; the working copy breaks (and that's the point)
**Random:** working-area anchor from 3-spot pool; which column peels (of 2 metrics); values as ever. **Aha:** ☆ IS the aha moment made physical — relative refs travel, values survive [Cascading]. RESOLVED (Wolf, 2026-07-24): the destructive source-delete STAYS the ☆; guided rails fence its zone. **Finish:** beat 5. **Clocks:** re-sweep. **Engine:** r419 tiling regression-check (single-cell copy onto strip).

#### 4.10 modeltour — "Model Tour" ★ CAPSTONE c1 · S
**Now:** 6 checks — 4 #REF! subtotal rebuilds, 2 margin fill-rights, dollar+border close, ctrl+home finish. The Foundations bar incarnate.
**Capstone designation + semantic pass (2 lines):**
- check 1 → "Rebuild the four broken subtotals — the summing formula, not a typed number (the four #REF! lines)"
- check 6 → "Finish at A1 — a clean model greets the reader" (keep; A1 is the canonical home, R2(b))
☆ Percent-format the two margin rows to one decimal — RESOLVED (Wolf, 2026-07-24): build() ships them GENERAL so the ☆ is real work (an FY-total bonus was considered and dropped — the board is five quarters wide)
**Gate:** clean run opens Formatting milestone (§2.4). **Random:** as-is (quarter start, mark columns, magnitudes). **Aha:** unchanged. **Finish:** ctrl+home beat. **Clocks:** capstone pass=par×2.0 override. **Engine:** guide 8v6 misalignment fixed by the tri-length invariant. Displays the CAPSTONE ring (§2.4).

### CH 2 · FORMATTING (10)

#### 4.11 typeset — "Typeset the memo" · S
**Now:** 5 checks (bold header, unbold imposter, italic memos, strike dead line, =TODAY stamp), imposter-row randomized. Order-free by design — acceptable for a pure-formatting showcase (§1.1).
**Semantic pass (2 lines) + bonus:**
- check 2 → "Unbold the imposter line — it never earned the weight"
- check 5 → "Enter =TODAY() in the date cell — the page signs its date"
☆ Underline the memo title — the masthead
**Random:** add stamp-cell site {B12, D12} + one more memo line from a pool. **Aha:** unchanged. **Finish:** the stamp. **Clocks:** std. **Engine:** none.

#### 4.12 decimals — "The decimals pass" · M
**Now:** house-rule decimals over a comps page; checks ~3, mostly one op family repeated (Alt H 9/0) — §8.3 variety risk.
**Beats:**
1. Set the dollar columns to zero decimals — house rule
2. Set the multiples column to one decimal — 8.2x, not 8.20x
3. Set the percent column to one decimal
4. Fix the one cell someone hand-formatted to four decimals — [which] varies (planted defect; find it by eye — the column reads ragged)
5. Bold the median row and add a top border above it — the read line
☆ Right-align the header row over its numbers
**Random:** site jitter + which column carries the planted defect + value pools. **Aha:** "decimals are a column property — one ragged cell breaks the read". **Finish:** beat 5. **Clocks:** re-sweep. **Engine:** none. [Before/After Transform]

#### 4.13 center — "Set the alignment" · S
**Now:** 3 alignment passes + bold total, layout randomized. Near bar; thin on finish.
**Beats:** keep 1–3 (center headers · left labels · right numbers+totals), then:
4. Bold the total row — alignment holds through it
5. Add a bottom border under the header row — aligned AND ruled
☆ Center the title across the table with Center-Across-Selection — never merge (ctrl+1 A; the house anti-merge rule made a beat)
**Random:** as-is + title width varies. **Aha:** "numbers right, labels left, headers centered — alignment is information". **Finish:** beat 5. **Clocks:** std. **Engine:** ca (center-across) exists (r177).

#### 4.14 autofit — "Fix the squeezed columns" · M
**Now:** 2 checks (autofit labels vs uniform-width data) — the contrast is the lesson but it's a 2-beat board (audit rank 5).
**Beats:**
1. Autofit the squeezed label columns — content decides
2. Set the four data columns to one width of 12 — uniform beats autofit for print
3. Total the four quarters in the Total column — the grand figure lands as #####
4. Autofit the Total column — your own number earns its width (the consequence beat: your OWN figure overflows)
5. Bold the total and add a top border above it
☆ Set the title bold and autofit the label column around it
**Random:** label-block site {A1,F1} (as-is) + data-block row rnd + ragged widths rotate + NEW: which column the SUM lands in. **Aha:** relocates to beat 3→4 — "#### is a width problem, not a number problem". **Finish:** beat 5. **Clocks:** re-sweep. **Engine:** none. [chained per §8.1.4]

#### 4.15 ruleoff — "Rule off the schedule" · S
**Now:** border grammar (line under headers, line above totals, outline the headline) + EBITDA pull-through; r199/r200 literal-border language mostly applied; audit flags residual "box" verb at 2232.
**Language pass (2 lines) + bonus:**
- any "box/rule it" label → "Add an outside border around the headline figure"
- state-report labels → verb-first per §1.7
☆ Bold the pulled EBITDA row — computed rows read heavy
**Random:** verify ≥2 axes; add site jitter if fixed. **Aha:** "borders are grammar — a total earns its line". **Finish:** the outline beat. **Clocks:** std. **Engine:** Alt H B chords; note AUDIT §C missing Ctrl+Shift+& alt — register ribbon route as the alt until the chord ships.

#### 4.16 ruleaudit — "The ruling pass" · M
**Now:** find-and-fix missing rulings, defect set varies — already the audit format in embryo; checks name conventions.
**Rework: adopt §2.3 disclosed-error-count. N=4.**
1. Find and fix all 4 ruling breaks (0/4 fixed) — the aggregate meter
2. Add the bottom border under the header row (if broken this seed — per-seed beat labels name only the broken conventions; N fixed by always planting exactly 4 from a 6-convention pool)
3. Add the top border above each unruled total
4. Bold the answer line that lost its weight
5. Add the outside border the headline dropped
☆ Finish at A1 — hand the page back
**Random:** which 4 of 6 conventions break + sites. **Aha:** "the ruling pass is a checklist, not a vibe — four conventions, every page". **Finish:** ☆/beat 5. **Clocks:** std. **Engine:** §2.3 meter (meta.errorCount=4). NOTE: per-seed beat text must still be deterministic per seed (labels computed in checks from the planted set).

#### 4.17 combo — "Clean the paste" · S
**Now:** bold/comma/wrap/autofit a pasted table — 4 beats, one artifact; deliberately loads ##### at start (fit-sweep exempt).
**Language pass + bonus:**
☆ Color the pasted inputs blue — the paste arrived black
**Random:** verify site + content pools; add wrap-note position variance. **Aha:** unchanged. **Finish:** autofit beat closes. **Clocks:** std. **Engine:** none.

#### 4.18 dress — "Full formatting pass" · S
**Now:** 6-ish beats to book-ready; audit flags "Circle"/"Dress"/"rule it" labels (2480–2487) and one lenient CHECK1.
**Language pass (the fix list):**
- "Dress the title" → "Bold the title and add a bottom border under it"
- "Circle the output" → "Add an outside border around the output row"
- tighten CHECK1's ok to the exact border+bold pair it names
☆ Italicize the source line — cite or die
**Random:** verify ≥2 axes. **Aha/Finish:** unchanged/outline beat. **Clocks:** std. **Engine:** ok accepts ball for the outline — keep accepting either route (ball or 4-edge) per Freedom Doctrine.

#### 4.19 housestyle — "Clean it to standard" · M
**Now:** the senior's full cleanup (title, headers, blue inputs incl. one buried, commas, %, ruled totals); audit: "trim the decimals" directionless, "colour" UK spelling, guide 43-class misalignment.
**Beats (rewrite of the same scope, N≤6):**
1. Bold the title and the header row — the page carries a masthead
2. Color every hardcoded input blue — one hides inside the formula block (the buried-input hunt is the drill's signature; counter label '(5/6 found)')
3. Comma-format the dollar body — zero decimals
4. Percent-format the margin rows — one decimal
5. Add a top border above both total rows
6. Set the label column wide enough to read — autofit it around the longest line name
☆ Add a bottom border under the final total — close the statement
**Random:** which input is buried + site/content pools (as-is). **Aha:** "house style is one pass, always the same order — title, inputs, numbers, rules". **Finish:** beat 6/☆. **Clocks:** std (par 47 holds ballpark). **Engine:** §2.6 counter for beat 2's label.

#### 4.20 gauntlet — "Make it model-ready" ★ CAPSTONE c2 · M
**Now:** full S&U formatting pass (blue inputs, SUM totals, bold+top border both sides, commas, autofit), par 63. Already the chapter chained.
**Capstone designation + rework to 6 core:**
1. Color the typed inputs blue — both sides of the table
2. Total both columns — a live SUM under Sources and another under Uses
3. Bold both totals and add a top border above each
4. Comma-format both money columns — zero decimals
5. Autofit every column that reads #####
6. Finish at A1 — the page is ready for the book
☆ Center the two side headings across their columns — never merge
**Gate:** clean run opens Formulas I. **Random:** side widths/labels/values pools + which columns squeeze. **Aha:** "model-ready is a sequence you can run cold — inputs, totals, rules, numbers, widths". **Finish:** beat 6. **Clocks:** capstone pass=par×2.0. **Engine:** none.

### CH 3 · FORMULAS I (12)

#### 4.21 margin — "Margins across the page" · M (audit shallow #13)
**Now:** 3 identical checks (point ÷, fill, %) across three comp tables — one skill repeated; sites shuffle.
**Rework — vary the ask per table [Escalating Twin Variants]:**
1. Build the margin column in comp set A — EBITDA÷revenue, filled down, percent
2. Build the growth column in comp set B — this year÷last year−1, filled down, percent
3. Build the multiple column in comp set C — EV÷EBITDA, filled down, one-decimal x (fmtStyle mult)
4. Bold the three ratio headers — the page reads its own asks
☆ Right-align the three ratio headers over their numbers
**Random:** 4-slot site shuffle (as-is) + which table gets which ask (permute) + peer-name pools. **Aha:** "point ÷ fill ↓ format — the same three chords price any ratio". **Finish:** beat 4. **Clocks:** re-sweep (scope up from 23s). **Engine:** mult format exists. Placement-series member — re-verify HK_PLACEMENT gates after retune (D16).

#### 4.22 foot — "Total it both ways" · M (audit shallow #9)
**Now:** 3 checks (rows, columns, corner) on a fixed 4×4 block at B2; prompt bans typed SUM but sumishF accepts (text≠grading, AUDIT §D).
**Beats:**
1. Total every row down the Total column — live SUMs (AutoSum proposes each)
2. Total every column across the Total row — live SUMs
3. Total the corner — it must agree with BOTH edges
4. Bold the Total row and column and add a top border above the row
5. Enter the tie check in the check cell — the corner minus the Total column's own SUM reads zero
☆ Comma-format the entire block — zero decimals, one pass
**Random:** block size 3–5 segments × 3–4 quarters + site from 3-spot pool + segment-name pool. **Aha:** lands at beat 3 (the corner agrees) and is PROVEN at beat 5. **Finish:** beat 5 (zero check). **Language:** prompt drops the "never type a SUM" claim — AutoSum is the guide's route, typed SUM passes (Freedom Doctrine). **Clocks:** re-sweep. **Engine:** none.

#### 4.23 anchor — "Pin the reference" · M (audit shallow #8)
**Now:** 2 checks (pin both ways, fill the 9-cell grid) on a fixed C4 grid; CHECK2 lacks a fill latch (systemic finding).
**Beats:**
1. Build the corner price — the volume column locked, the price row locked (the grid's top-left)
2. Fill the driver column down — the row reference walks
3. Fill the grid right — nine prices from one formula
4. Dollar-format the grid — zero decimals
5. Add an outside border around the grid — the quote block ships
☆ Enter the check — the far corner equals volume×price typed as =[v]*[p] pointing at the blue inputs (a second, independent read)
**Random:** grid site from 4-spot pool (NEW — audit's "move grid per seed") + price/volume magnitudes + product-name pool (exists). **Aha:** unchanged (F4 cycles the locks). **Finish:** beat 5. **Label/tab de-hint per D12.** **Clocks:** re-sweep. **Engine:** none. NOTE: keep grading anchors via formula text ($B, $row) — anchoring IS the lesson (doctrine 2.2 exception).

#### 4.24 percent — "Common-size both statements" · M (audit shallow #10)
**Now:** 2 checks (block A anchored, block B anchored on ITS revenue); block B moves; block A fixed at C2.
**Beats:**
1. Build Statement A's % column — every line ÷ its revenue, $-locked
2. Fill it down and percent-format the column — one decimal
3. Build Statement B's % column — anchored on ITS OWN revenue
4. Fill it down and percent-format — one decimal, zero dragged divisors
5. Bold both 100% revenue rows — the reader's anchor line
☆ Italicize both % column headers — memo columns whisper
**Random:** block A site NOW ALSO from a 3-spot pool (audit ask) + block B pool (exists) + depth 5–7 (exists). **Aha:** unchanged. **Finish:** beat 5. **Clocks:** re-sweep. **Engine:** r419 %-entry fix matters here (typing a raw number into a pre-%-formatted cell) — add its regression line to this drill's replay.

#### 4.25 growth — "Run the growth rates" · S
**Now:** consolidate + YoY% + CAGR, three formula families, prompt rich; near bar.
**Language pass + bonus; split any bundled check:**
1. Total the two segments into the consolidated row — live SUMs filled across
2. Build the YoY row — this year ÷ last year − 1, filled across
3. Percent-format the YoY row — one decimal
4. Build the 4-year CAGR in the CAGR cell — (end÷begin)^(1÷4)−1
5. Bold the consolidated row and add a top border above it
☆ Percent-format the CAGR cell and bold it — the headline number
**Random:** verify ≥2 axes; add site jitter if fixed. **Aha:** existing. **Finish:** beat 5. **Clocks:** std. **Engine:** none.

#### 4.26 cagr — "Compound it, three times" · S
**Now:** three scattered CAGR blocks that move every run + read-the-output bold beat; par 55. Near bar.
**Language pass + bonus:**
- final beat stays "Bold the deal with the highest CAGR — read your own output"
☆ Percent-format all three CAGR cells to one decimal in one pass (multi-select or three passes — end state graded)
**Random:** as-is (blocks move). **Aha:** existing. **Finish:** the bold-the-winner read beat. **Clocks:** std. **Engine:** none.

#### 4.27 bridge — "Point-mode formulas" · M (audit shallow #4; D10 rename)
**Now:** 2 checks (pointed formula, fill across); memo growth row sits unused on the board.
**Beats:**
1. Build year-one EBITDA — revenue × margin, pointed, reading its own column
2. Fill it across the five years — relative refs walk
3. Build next year's revenue off the memo rate — prior × (1 + growth), pointed (the unused memo row becomes the second verse)
4. Fill the revenue build across — the memo rates drive each year
5. Bold the EBITDA row and add a top border above it
☆ Total the five EBITDA years in the FY cell — one live SUM
**Random:** 4-anchor site pool (exists) + growth-rate pool + NEW: revenue row starts with only year-1 typed (the build makes years 2–5). **Aha:** unchanged (the fastest formula is one you never typed). **Finish:** beat 5. **Clocks:** re-sweep (scope roughly doubles from par 10). **Engine:** pointer mode (exists).

#### 4.28 sumif — "Roll up the segments" · S
**Now:** SUMIF rollup + live foot + % of total + summary formatting; par 57, chained. Near bar.
**Language pass + bonus:**
☆ Add an outside border around the finished summary block
**Random/Aha/Finish:** verify axes; existing aha; % beat closes. **Clocks:** std. **Engine:** none.

#### 4.29 rollup — "Sum on two criteria" · S
**Now:** one mixed-anchor SUMIFS fills the segment × region grid; par 65. Near bar.
**Language pass + bonus:**
☆ Bold the grid's row and column headers — the axes read
**Random:** verify grid site jitter + segment/region pools. **Aha:** existing. **Finish:** add if missing: "Add a top border above the grid's total row" — if no total row exists, ADD one (Total the grid's columns across the bottom — live SUMs) and make it beat 5. **Clocks:** std. **Engine:** none.

#### 4.30 fxconvert — "Convert the page — one anchored rate" · S
**Now:** anchored EUR→USD driver + 2D fill + commas + outline; 5 checks; guide 3v5 misalignment; ZERO ALTS (both audit findings).
**Rework = alignment + ALTS, beats already at bar; language pass:**
☆ Bold the rate cell — the one number that moves the page
**Fix list:** guide rebuilt to 5+1 lines aligned; ≥2 ALTS registered (typed $ vs F4; fill via ctrl+r/d vs HFIR/HFID). **Clocks:** std. **Engine:** none. Desc de-hint (D13 family).

#### 4.31 cases — "Scenario switch with CHOOSE" · M
**Now:** CHOOSE driver + self-referencing IF capture; par 94; targets 9 vs checks 6 (worst misalignment — guided ring lands on the WRONG CELL from step 2); guide 4v6.
**Rework = re-alignment first, then trim to ≤6 core:**
1. Enter "2" in the switch cell — the driver block re-reads
2. Build the case-name pull — CHOOSE reading the switch
3. Build the growth pull — CHOOSE on the same switch
4. Build the capture cell — the self-referencing IF snapshots the active case
5. Enter each remaining case into the switch — the output table fills itself (counter '(2/3 cases)')
6. Bold the output table's header and add a bottom border under it
☆ Flip the switch back to case 1 — the model rests on Base
**Random:** case names/rates pools + switch/table sites jitter. **Aha:** existing ("the model runs off the driver, not nested IFs"). **Finish:** beat 6. **Clocks:** std (par 94 re-sweep). **Engine:** r419 LAZY IF is load-bearing for the self-referencing capture — add the regression line. targets()/guide() rebuilt to 7 aligned entries.

#### 4.32 qclose — "Close the Quarter" ★ NEW CAPSTONE c3 · L
**Concept:** one quarterly P&L page, built cold from a feed — the chapter's five formula families in one artifact [Checkpoint-Staged Build + Rebuild the Output Page].
**Board:** title row; Q1–Q4+FY headers; revenue feed row (blue); COGS/opex rows (blue, signed); empty subtotal/margin/growth rows; a small segment ledger island for the SUMIF memo; 16+ rows used.
**Beats:**
1. Build gross profit — revenue plus signed COGS, pointed, filled across
2. Total the FY column — one SUM filled down the P&L lines
3. Build the margin row — gross profit ÷ revenue, $-locked divisor row, filled across, percent
4. Build the QoQ growth row — this quarter ÷ last − 1, filled, percent
5. Build the segment memo — one anchored SUMIF, filled down the segments
6. Bold the gross profit row and add a top border above it — close the page
☆ Enter the tie check in the check cell — FY gross profit minus the SUM of the quarters reads zero
**Gate:** clean run opens Data & Lookups. **Random:** value pools + segment pools + which opex lines appear (4 of 6) + margin/growth row order swaps. **Aha:** "a P&L is five formula shapes — point, fill, lock, grow, roll up — run in one breath". **Finish:** beat 6. **Clocks:** measure fresh; expect par ~70–90s; capstone pass=par×2.0. **Engine:** none beyond existing fns. **Plumbing:** D1.

### CH 4 · DATA & LOOKUPS (12)

#### 4.33 sort — "Sort the table" · M (audit shallow #11; r419 row-integrity landed)
**Now:** 3 checks (sort desc w/ _byName pairing, live SUM, bold); fine skeleton, thin story.
**Beats [Scaffold Reuse Test]:**
1. Sort the six deals largest-first — rows move whole
2. Enter the late deal — "[name]" and [size] on the first blank row under the block
3. Sort the table again — the newcomer takes its rank
4. Total the size column — a live SUM below the block
5. Bold the total and add a top border above it
☆ Left-align the deal names — labels read left
**Random:** 4-spot site pool (exists) + late-deal name/size pools + sizes distinct (exists). **Aha:** "sort is re-runnable — the table is live, nothing is retyped" (upgraded from current). **Finish:** beat 5. **Clocks:** re-sweep (scope +2 beats from par 10). **Engine:** sort warning card behavior unchanged; _byName integrity extends to 7 rows. Placement-series member — re-verify gate (D16).

#### 4.34 scrub — "Clean the export" · S
**Now:** duplicate header + page-break row + stale SUBTOTAL deleted, sort, re-total; row-integrity graded; the clean exemplar. Near bar.
**Language pass + bonus:**
☆ Comma-format the size column — the export arrived raw
**Random/Aha/Finish:** as-is; verify guide 3v5 realignment. **Clocks:** std. **Engine:** COUNTA available for a leaner junk-detection ok if the rework wants it (optional).

#### 4.35 grpfold — "Fold the detail away" · M (audit shallow #15)
**Now:** 3 checks (group ×3, fold ×3, totals intact incl. a former do-nothing guard); fixed layout.
**Beats:**
1. Group each quarter's months — three groups, exactly the detail rows
2. Fold all three away — quarter totals stay, SUMs intact (guard folded into ok)
3. Unfold Q[n] — the reviewer wants its months back; the other two stay folded (n varies per seed)
4. Bold the three quarter-total labels — the summary reads as headings
5. Italicize the memo line — detail available on request
☆ Set the figures column to one width of 12 — the folded page prints even
**Random:** which quarter reopens + month-block start row jitter + value pools (exists). **Aha:** upgraded — "group beats hide because folds REOPEN on request — the ⊞ is a promise". **Finish:** beat 5. **Clocks:** re-sweep. **Engine:** unfold latch = group.collapsed===false (state, no new plumbing).

#### 4.36 filterpass — "Work the filtered view" · S
**Now:** AutoFilter on, picker, read the visible answer, type it; audit: cursor-rider promise ungraded (label↔check).
**Language pass + fix + bonus:**
- drop the ungraded cursor-rider promise from the prompt (decided — don't grade it)
- final beat: "Enter the answer in the answer cell — the largest visible Open deal"
☆ Filter the Status picker back to All — leave the view the way you found it
**Random:** verify status/value pools + answer varies. **Aha:** existing. **Finish:** the answer entry. **Clocks:** std. **Engine:** Alt+↓ picker (exists).

#### 4.37 unhide — "Flush the hidden rows" · S/M (audit shallow #12; r419 width fix landed)
**Now:** 3 checks (unhide across the gap, group+fold the house way, width 12) — solid contrast lesson; fixed hidden span rows 4–7.
**Beats:**
1. Unhide the buried detail — select across the gap first
2. Group the returned rows the house way, then fold them — the ⊞ owns the page
3. Trace the Consolidated total — its SUM spans the returned rows and ties (the "subtotal stayed live" audit ask; ok = traceN≥1 + formula range intact + value ties)
4. Set the figures column to one width of 12 — the numbers read again
5. Bold the Consolidated row and add a top border above it
☆ Italicize the restatement memo line
**Random:** hidden span position/length varies (4–6 rows within a 6-region-row board — audit ask) + region-name pool. **Aha:** existing. **Finish:** beat 5. **Clocks:** re-sweep. **Engine:** traceN latch exists (r173). Meta label align (D14).

#### 4.38 lookup — "Look it up" · L (audit shallow #2)
**Now:** 2 checks (INDEX/MATCH used, value right) on a 7-row table; the thinnest formula drill in the chapter.
**Rework [Origami Ladder — 3 tiers on one board]:**
1. Build the first answer in the query panel — INDEX/MATCH on the queried company × metric
2. Build the second answer — new query, the metric column moved; same shape lands it (tier 2 region reveals on tier 1 grade)
3. Fix the planted lookup in the panel — its INDEX aims at the wrong column; repoint it (the broken-decoy from the audit's enrichment note)
4. Comma-format the three answers — zero decimals
5. Add an outside border around the query panel
☆ Build the first answer again in the compare cell with VLOOKUP — count the columns yourself, then decide which you trust [Escalating Twin]
**Random:** metric shuffle (exists) + query pools ×2 + which column the decoy mis-aims at + company pool. **Aha:** unchanged (headers, not positions). **Finish:** beat 5. **Clocks:** re-sweep (par well above 32). **Engine:** §2.5 tier reveal (or ship tiers visible with parked labels if 2.5 slips — the beats stand either way); VLOOKUP exists (r416).

#### 4.39 vlookup — "The Legacy Lookup" ★ NEW · M
**Concept:** the canon-named gap (doctrine §6): build a working VLOOKUP, then WATCH it break when a column lands, and rebuild the survivor as INDEX/MATCH. The aha is the whole finance-internet's lookup argument, felt in 60 seconds.
**Board:** deal table (name | stage | size | fee), query panel, a staged "Region" column to the right waiting to be inserted.
**Beats:**
1. Build the fee lookup in the query panel with VLOOKUP — the deal table, the fee column counted by hand, exact match
2. Insert the staged Region column into the table — paste it where it belongs
3. Fix the broken lookup — the VLOOKUP now returns the wrong column's number; rebuild it as INDEX/MATCH aimed at the fee HEADER (grade the FIX, not the finding — no select-the-cell check)
4. Build the second query with INDEX/MATCH — it survives the same insert unchanged
5. Comma-format both answers and bold the query panel header
☆ Enter the memo — type "index/match — columns can move" in the note cell (verbatim text check; the lesson, written by the player's own hands)
**Random:** query pools + which column inserts (Region/Owner) + table site jitter. **Aha:** "VLOOKUP counts columns; INDEX/MATCH reads headers — one of them survives Tuesday". **Finish:** beat 5. **Clocks:** fresh measure (~40s expected). **Engine:** VLOOKUP + r419 sentinels (the broken state shows a wrong VALUE, not an error — deliberate; no sentinel needed). **Plumbing:** D2.

#### 4.40 lookup2 — "Two-way lookup" · M (audit shallow #3)
**Now:** 2 checks (two MATCHes present, value right); one query, small block.
**Beats (deal-screen story per audit):**
1. Build the screen's first read — INDEX with two MATCHes, company × metric
2. Build the second read — the query changes both axes; same formula shape
3. Fix the pre-built read on the screen panel — its two MATCH ranges are swapped; repoint both
4. Comma-format the three reads — zero decimals
5. Add an outside border around the screen panel — the deal screen ships
☆ Bold the queried company's row in the data block — mark your source
**Random:** metric shuffle (exists) + 2 query draws + swap-decoy which-axes + company pool. **Aha:** existing. **Finish:** beat 5. **Clocks:** re-sweep. **Engine:** none.

#### 4.41 recon — "Two systems, one truth" · S
**Now:** COUNTIF presence + INDEX/MATCH amounts + enter the missing deal + Δ to zero; par 77, chained, zero-check finish. At bar.
**Language pass + bonus:**
☆ Color the brought-across deal blue — it was typed, not fed
**Random/Aha/Finish:** verify axes; existing; Δ=0 closes. **Clocks:** std. **Engine:** none.

#### 4.42 drill — "Hardcode it" · M (audit shallow #7)
**Now:** 2 checks (values-onto-self + memo guard, blue font); fixed B3:B8 site.
**Beats [the delete PROVES the paste — chained]:**
1. Copy the Final column and paste it onto itself as values only — the Draft column keeps its wires (second live column added to the board; over-broad column paste now HITS something)
2. Color the flattened cells blue — hardcodes wear blue
3. Delete the model-feed block — the flattened numbers hold
4. Add an outside border around the send-out block — it leaves the building
☆ Paste the flattened column into the deck strip as values — the second hand-off
**Random:** output-column site from 3-spot pool (audit ask) + which column is Final vs Draft + feed values. **Aha:** relocates to beat 3 — "values survive the source's death; links don't". **Finish:** beat 4. **Clocks:** re-sweep. **Engine:** none. Guard: Draft-stays-live folds into beat 1's ok (doctrine no-do-nothing).

#### 4.43 series — "Serve the year table" · L (audit shallow #1)
**Now:** 2 checks (fill series, bold+right-align) — the thinnest drill in the catalog.
**Beats (table-to-serve per audit):**
1. Fill the year header — Series extends the two seeds across the header row
2. Bold the year run and right-align it over the numbers
3. Total each year — one SUM under the metric rows, filled across (new Total row; the header now HEADS something it serves)
4. Add a top border above the Total row
5. Enter the label — type "Total" in the Total row's label cell, bold it
☆ Comma-format the metric block — zero decimals, one pass
**Random:** 5-spot site pool (exists) + seed year (exists) + 2–3 metric rows from a pool. Seed pair sits FIRST-TWO of the run — RESOLVED (Wolf, 2026-07-24): no backward-fill engine work this pass; mid-block seeding is dropped as an axis. **Aha:** upgraded — "Series reads the step from two seeds — headers type themselves". **Finish:** beat 5. **Clocks:** re-sweep (scope up from par 14). **Engine:** HFIS series (exists). Meta rename D15.

#### 4.44 cleanroom — "The Data-Room Tape" ★ NEW CAPSTONE c4 · L
**Concept:** the chapter chained on one artifact: a dirty data-room export becomes the sendable summary [Clean → Aggregate → Present Pipeline].
**Board:** 14-row deal tape with a duplicated header and a "--- PAGE 2 ---" break row planted; status column; a query panel; a summary strip; 18+ rows used.
**Beats:**
1. Delete the two junk rows — the duplicate header and the page break
2. Sort the tape largest-first — rows move whole
3. Filter the Status column to Open — read the survivors
4. Build the top-deal pull — INDEX/MATCH the largest Open deal's fee into the panel
5. Total the Open deals — a live SUM in the summary strip (SUBTOTAL is not in the engine — the beat grades a plain SUM per the filterpass convention; code comment says why)
6. Group the tape and fold it — the summary page stands alone
☆ Bold the summary strip's header and add a bottom border under it
**Gate:** clean run opens Formulas II. **Random:** junk-row positions + tape values/names + which status is the ask. **Aha:** "clean, sort, filter, pull, present — every data room ends in the same five moves". **Finish:** beat 6. **Clocks:** fresh measure; pass=par×2.0. **Engine:** COUNTA (r419) useful in ok-predicates; SUBTOTAL absent — beat 5 grades a plain SUM (note in code why). **Plumbing:** D3.

### CH 5 · FORMULAS II (12)

#### 4.45 audit — "Review pass — find what's broken" · M
**Now:** three planted breaks in a divisional P&L (short Total, stale hardcode, wrong-year read); already the audit format minus the disclosure.
**Rework = adopt §2.3. N=3; beats:**
1. Find and fix all 3 planted breaks (0/3 repaired) — the meter line
2. Fix the short Total — its SUM must span every division column
3. Fix the stale EBITDA — a live formula, not last month's number
4. Repoint the wrong-year read — the flagged line must read its own year's column
5. Enter the sign-off — type "OK" at the review cell; reviews sign their work
☆ Color the two ex-hardcode cells black — formulas don't wear blue
**Random:** which division carries each break + break sites + values (verify existing). **Aha:** existing. **Finish:** beat 5. **Clocks:** std. **Engine:** §2.3 meter (errorCount=3).

#### 4.46 triage — "Error triage — #REF! #DIV/0! #VALUE!" · M
**Now:** three classic breaks, read-and-rebuild; pre-r419 the engine FAKED error display with txt cells (seeds 6391–6397, left-aligned amber).
**Rework = replant on REAL r419 sentinels + §2.3 (N=3):**
1. Find and rebuild all 3 errors (0/3) — the meter
2. Rebuild the #REF! SUM — re-span the rows the delete took
3. Fix the #DIV/0! — repoint the denominator at the real base
4. Fix the #VALUE! — the formula grabbed the label; aim it at the numbers
5. Bold the repaired subtotal row and add a top border above it
☆ Comma-format the three repaired cells to match their columns
**Random:** which row hosts each error + sites + values. **Aha:** "an error VALUE names its disease — #REF! lost a range, #DIV/0! lost a base, #VALUE! ate text". **Finish:** beat 5. **Clocks:** std. **Engine:** **r419 sentinels REQUIRED** — errors must be live values that propagate and center-display (AUDIT §G polish); this drill is the sentinel showcase and its replay is the sentinel regression suite.

#### 4.47 wrapfix — "Wrap it or fix it" · M (audit shallow #6)
**Now:** 2 checks (wrap the true miss, fix the broken MATCH); fixed which-is-which.
**Beats:**
1. Wrap the discontinued query in IFERROR — zero fallback, lookup intact
2. Fix the broken read — its MATCH aims at the numbers; repoint to the names (no IFERROR here; guard folds into ok)
3. Build the third read fresh — INDEX/MATCH for the panel's new query
4. Comma-format the three panel answers — zero decimals
5. Add an outside border around the query panel
☆ Trace the fixed read to its source and back — prove the wire
**Random:** WHICH query is the true miss vs the broken one (audit ask — positions swap per seed) + healthy leave-alone read added (guard in ok) + segment pools (exist). **Aha:** existing (seatbelt, not blindfold). **Finish:** beat 5. **Clocks:** re-sweep (par 70 recalibrates). **Engine:** r419 #N/A sentinels — the broken states should now be REAL propagating #N/A (replaces any staged text).

#### 4.48 balcheck — "Make it tie — hunt the break" · M
**Now:** pasted-over check row resurrected + two causes fixed; strong story; adopt disclosure.
**Rework = §2.3 (N=3: dead check row + 2 causes) [Cascading Bug Hunt — the rebuilt check row REVEALS which years break]:**
1. Find and repair all 3 problems (0/3) — the meter
2. Build the check row back — assets minus L&E, filled across (rebuilding it EXPOSES the two breaks — cascade native)
3. Fix the Total assets that lost its first line — re-span the SUM
4. Fix the Equity cell reading the wrong year — repoint it
5. Bold the check row — it reads zero across, say so in ink
☆ Add a top border above both Total rows
**Random:** which year hosts each cause + sites + values (verify). **Aha:** existing. **Finish:** beat 5 (zeros in bold). **Clocks:** std. **Engine:** §2.3 meter; cascade reveal is natural recalc (no §2.5 needed).

#### 4.49 stalelink — "Re-point the stale links" · S
**Now:** three cells reading the dead v1 block; find by pattern-break, repoint, confirm continuity. At bar.
**Language pass + §2.3 dressing (N=3) + bonus:**
- meter line: "Find and repoint all 3 stale reads (0/3)"
☆ Strike through the v1 block's header — mark the corpse
**Random/Aha/Finish:** verify axes; existing; continuity confirm closes. **Clocks:** std. **Engine:** meter.

#### 4.50 wirewalk — "Trace the precedents" · M (par 10 — watchlist-adjacent)
**Now:** trace upstream 3 hops, fix at the source, ride back; ok=traceN>=2 vs prompt's grander promise (label↔check).
**Beats [Checkpoint Touch-List on the wire]:**
1. Trace upstream from the deck figure — land on each hop (0/3 hops touched; §2.6 cells = the wire's stations)
2. Fix the source input — the VP's note names it
3. Trace back down to the deck figure — ride the dependents (traceN latch both directions)
4. Bold the corrected deck figure — the number you now believe
☆ Color the fixed source blue — it is typed, and it should say so
**Random:** wire path re-sites per seed + which input is rotten. **Aha:** existing ("don't hunt by eye"). **Finish:** beat 4. **Clocks:** re-sweep (scope up from par 10). **Engine:** §2.6 touch-list; ctrl+[ / ctrl+] latches exist (r173). Fixes the label↔check gap by GRADING the hops.

#### 4.51 tieout — "Collapse the suspect leg" · S
**Now:** trace + F9-collapse a leg + repoint the stale link; CHECK2 f9N>=1 only (weak); desc re-hints F9 (D13).
**Language pass + check tighten + bonus:**
- CHECK2 ok: f9N>=1 AND the formula restored unchanged after backing out (R10: "collapse the leg, then leave the formula as you found it")
☆ Bold the repaired total — the tie-out closes
**Random/Aha/Finish:** verify; existing; repoint closes. **Clocks:** std. **Engine:** F9-collapse latch exists.

#### 4.52 hunt — "Hunt the hardcodes" · S
**Now:** Go To Special → constants; three typed-overs relinked; par 45. At bar (clean exemplar family).
**Language pass + §2.3 dressing (N=3) + bonus (D11 tab rename):**
- meter: "Find and relink all 3 typed-over cells (0/3)"
☆ Color the three relinked cells black — formulas shed the blue
**Random/Aha/Finish:** verify; existing; confirm-the-foot closes. **Clocks:** std. **Engine:** meter; F5-Special exists.

#### 4.53 signerr — "Flip the signs back" · S
**Now:** three pasted-positive costs flipped negative, EBIT re-ties, margin confirm; disclosure fits natively.
**§2.3 dressing (N=3) + language pass + bonus:**
- meter: "Find and flip all 3 wrong-sign costs (0/3)"
☆ Comma-format the flipped cells — parens show the sign
**Random/Aha/Finish:** verify (rows 5–7 sweep zone stays); existing; margin-proof closes. **Clocks:** std. **Engine:** meter.

#### 4.54 versionup — "Replace hardcodes so it rolls forward" · S
**Now:** typed answers → live formulas ×4 rows, v2-survives framing; audit flags "match v1 exactly" recompute wording.
**Language pass (the flagged line) + bonus:**
- "match v1 exactly" → "Build each derived row live — its value equals the typed page it replaces"
☆ Color the four rebuilt rows black — live formulas, no blue
**Random/Aha/Finish:** verify; existing; the survives-new-numbers proof closes. **Clocks:** std. **Engine:** none.

#### 4.55 balance — "Make it balance" · S
**Now:** foot both sides, check row at zero, totals formatted; 2-year BS. At bar; audit flags state-report labels.
**Language pass (labels → verb-first) + bonus:**
☆ Add a bottom border under the check row — the statement closes on zero
**Random/Aha/Finish:** verify; existing; zero check closes. **Clocks:** std. **Engine:** none.

#### 4.56 redflags — "The Red-Flag Pass" ★ NEW CAPSTONE c5 · L
**Concept:** the flagship disclosed-error-count drill: an inherited one-tab operating model with EXACTLY 7 planted errors spanning the chapter's five families; fixing upstream errors recomputes the board and EXPOSES downstream ones [Cascading Bug Hunt + Audit-and-Repair with Disclosed Error Count].
**Board:** 18-row op model (revenue build → costs → EBITDA → margin → checks) with: 1 #REF!, 1 #DIV/0!, 1 stale v1 link, 1 wrong-sign cost, 2 typed-over hardcodes (F5-special finds them), 1 short-range SUM. Error mix FIXED at 7; positions/rows vary per seed.
**Beats:**
1. Find and fix all 7 errors (0/7) — the meter owns the run
2. Rebuild the two error VALUES — the #REF! and the #DIV/0! (they block the cascade; fixing them recomputes rows that expose the rest)
3. Repoint the stale link and re-span the short SUM
4. Flip the wrong-sign cost and relink both hardcodes
5. Bold the check row — it reads zero across when the model is clean
6. Finish at A1 — hand the model back better than you found it
☆ Enter your initials in the review cell — auditors sign
**Gate:** clean run opens Models I. **Random:** every error's row/column + magnitudes + which cost family carries the sign error. **Aha:** "seven errors is a finite number — a review pass is a hunt with a count, not a vibe". **Finish:** beat 6. **Clocks:** fresh; pass=par×2.0. **Engine:** r419 sentinels REQUIRED (live #REF!/#DIV/0! propagation); §2.3 meter (errorCount=7); F5-Special. **Plumbing:** D4; POOL candidate post-calibration.

### CH 6 · MODELS I (11)

#### 4.57 wacc — "Build the discount rate" · S
**Now:** unlever/relever/CAPM/weight full chain; par 78. At bar.
**Language pass + bonus:**
☆ Percent-format the WACC cell to one decimal and bold it — the number the room waits for
**Random/Aha/Finish:** verify axes; existing; the weighted line closes. **Clocks:** std. **Engine:** none.

#### 4.58 fcfbuild — "Build the unlevered FCF" · M (audit watchlist)
**Now:** EBIT→taxes→NOPAT→D&A→capex/NWC row filled across; zero ALTS (audit §C).
**Rework = ALTS + depth check + bonus:**
- verify 4+ beats; if the build is one column then one fill, SPLIT: build year 1 top-to-bottom (3 beats: taxes/NOPAT, add-backs, uFCF) → fill the block across → dress (bold uFCF row + top border)
☆ Total the five uFCF years in the FY cell — the number the DCF discounts
**Random:** driver pools + tax-rate site jitter. **Aha:** existing. **Finish:** dress beat. **Clocks:** std. **Engine:** none. ALTS ×2 registered (order swap; HFID vs ctrl+d).

#### 4.59 dcf — "Discount the cash flows" · S
**Now:** DF row off anchored rate, PV row, TV reusing year-5 factor; audit flags desc math wording (dcf desc "DF row × PV row" — fix desc, D13 family).
**Language pass + desc fix + bonus:**
☆ Comma-format the PV row and bold the summed PV cell
**Random/Aha/Finish:** verify; existing; TV beat closes. **Clocks:** std. **Engine:** none.

#### 4.60 comps — "Run the comps" · S
**Now:** multiples down, median/high/low + LARGE/SMALL trimmed read, per-share landing; par 94; audit Class-D triple-bundle label.
**Language pass (split the bundle into two lines; the summary block likely runs 6 core — demote one to ☆):**
☆ One-decimal the multiple column — 8.2x reads, 8.20x doesn't
**Random/Aha/Finish:** verify; existing; premium landing closes. **Clocks:** std. **Engine:** LARGE/SMALL exist.

#### 4.61 txncomps — "Run precedent transactions" · S
**Now:** multiples paid, MEDIAN, implied equity; par 36. Near bar.
**Language pass + bonus:**
☆ Bold the implied-equity landing and add a top border above it
**Random:** verify site/value axes. **Aha/Finish:** existing; landing closes. **Clocks:** std. **Engine:** MEDIAN exists.

#### 4.62 football — "Build the football field" · M (audit watchlist)
**Now:** midpoint per method, MIN floor/MAX ceiling; par 39; 3-ish beats.
**Beats:**
1. Build each method's midpoint — (low+high)÷2, three methods
2. Build the floor — MIN across the three lows
3. Build the ceiling — MAX across the three highs
4. Build the spread read in the spread cell — ceiling minus floor
5. Dollar-format the summary column and bold the floor and ceiling
☆ Add an outside border around the field summary — the page the MD flips to
**Random:** method value pools + site jitter + which method is widest. **Aha:** existing. **Finish:** beat 5/☆. **Clocks:** re-sweep. **Engine:** none.

#### 4.63 dcfsens — "Run the sensitivity table" · M (audit shallow #14)
**Now:** 3 nested checks (base formula, fill right, fill down) at fixed C4; CHECK3 "one formula" without fill latch (systemic).
**Beats:**
1. Build the corner cell — FCF absolute, WACC row-locked, growth column-locked
2. Fill the top row right — the WACC reference walks
3. Fill the grid down — fifteen live cells, anchors held
4. Find the base case — the memo names WACC and growth; add an outside border around that cell (new base-case read beat per audit)
5. Comma-format the grid — zero decimals
☆ Bold the header row and column — the axes read
**Random:** grid site from 3-spot pool (audit ask) + rate ladders + base-case position. **Aha:** existing. **Finish:** beat 4 (the read) + 5 (the dress). **Clocks:** re-sweep. **Engine:** none. De-nest: each check's ok stands alone given S.

#### 4.64 retbridge — "Attribute the returns" · S (audit watchlist)
**Now:** growth/multiple/delever decomposition + zero tie check; par 65, clean exemplar checks.
**Language pass + bonus:**
☆ Bold the three driver rows' labels — the bridge reads as a story
**Random:** verify axes (audit: 6055 fixed sites — add jitter). **Aha/Finish:** existing; zero check closes. **Clocks:** std. **Engine:** none.

#### 4.65 accdil — "Run accretion / dilution" · S
**Now:** combined EPS vs standalone incl. financing drag; par 50. At bar.
**Language pass + bonus:**
☆ Percent-format the accretion cell to one decimal — the headline read
**Random/Aha/Finish:** verify; existing; the verdict cell closes. **Clocks:** std. **Engine:** none.

#### 4.66 sourcesuses — "Balance sources and uses" · S
**Now:** total uses, equity plug, check zero, anchored % columns through 100%; par 55. At bar; zero-ALTS family (register ×2).
**Language pass + ALTS + bonus:**
☆ Add a top border above both totals — two sides, one rule
**Random/Aha/Finish:** verify; existing; % run closes. **Clocks:** std. **Engine:** none.

#### 4.67 pitchpage — "The Valuation Page" ★ NEW CAPSTONE c6 · L
**Concept:** the chapter's outputs assembled into the one page a VP reads — reference, never retype [Rebuild the Output Page + Narrative Deadline Skin].
**Board:** left = mini outputs from "the team": a WACC cell, a PV-sum cell, a comps median multiple, a football floor/ceiling pair (all live formulas, pre-built); right = the empty pitch page frame; 18 rows used.
**Beats:**
1. Build the DCF value line — reference the PV sum; never retype it
2. Build the comps value line — median multiple × EBITDA, pointed at the outputs
3. Build the range line — MIN and MAX across the two value lines and the football pair
4. Build value per share — the midpoint over shares outstanding
5. Dollar-format the page's numbers and bold the per-share landing
6. Add an outside border around the pitch page — page one ships
☆ Enter the as-of stamp — =TODAY() under the page title
**Gate:** clean run opens Models II. **Random:** output values/magnitudes + which side hosts outputs + share counts. **Aha:** "a pitch page owns no math — every number is a wire into the work". **Finish:** beat 6. **Clocks:** fresh; pass=par×2.0. **Engine:** none new. **Plumbing:** D5.

### CH 7 · MODELS II (10)

#### 4.68 schedule — "Roll it forward" · S
**Now:** 5-yr PP&E roll, linked openings, accumulated-dep memo; par 35. At bar.
**Language pass + bonus:**
☆ Bold the closing row and add a top border above it
**Random/Aha/Finish:** verify; existing; fill-across closes. **Clocks:** std. **Engine:** none.

#### 4.69 intsched — "Run the interest schedule" · S
**Now:** roll + anchored rate × opening + coverage read; zero-ALTS family (register ×2).
**Language pass + ALTS + bonus:**
☆ One-decimal the coverage cell — the covenant reads 4.2x, not 4.20x
**Random/Aha/Finish:** verify; existing; coverage closes. **Clocks:** std. **Engine:** none.

#### 4.70 lbo — "Run the LBO math" · S
**Now:** entry EV → equity → exit → MOIC → IRR; par 54. At bar.
**Language pass + bonus:**
☆ Percent-format the IRR to one decimal and bold it
**Random/Aha/Finish:** verify; existing; IRR closes. **Clocks:** std. **Engine:** IRR/^ exist.

#### 4.71 revolver — "Sweep the revolver" · S
**Now:** MIN/MAX sweep ×4 years + prove-outs + formatted balance row; par 41. At bar.
**Language pass + bonus:**
☆ Add a top border above the balance row — the sweep closes ruled
**Random/Aha/Finish:** verify; existing; prove-out closes. **Clocks:** std. **Engine:** none.

#### 4.72 waterfall — "Run the paydown waterfall" · S
**Now:** 3-yr cascade, MIN rations, two tranches roll; guide 6v4 misalignment (fix via invariant).
**Language pass + realignment + bonus:**
☆ Bold the total-paydown row — the cash proves out
**Random/Aha/Finish:** verify; existing; roll-forward closes. **Clocks:** std. **Engine:** none.

#### 4.73 covtable — "Run the covenant table" · S
**Now:** net leverage vs stepping max, headroom, IF flag, MIN pinch-quarter; strong asks. At bar.
**Language pass + bonus:**
☆ Bold the pinch quarter's column header — name the danger out loud
**Random/Aha/Finish:** verify; existing; pinch read closes. **Clocks:** std. **Engine:** r419 lazy IF regression line (the flag formula).

#### 4.74 liqbridge — "Bridge the liquidity — three cases" · S
**Now:** cash+undrawn → ending liquidity across Base/Downside/Severe, breach read; audit flags "Dress" label (6954).
**Language pass (the flagged "Dress" label → "Bold the ending row and add a top border above it") + bonus:**
☆ Strike through the breached case's label — flag it for the call
**Random/Aha/Finish:** verify; existing; breach read closes. **Clocks:** std. **Engine:** strike exists.

#### 4.75 wk13 — "Run the 13-week" · S
**Now:** front 8 weeks: net flow, roll-forward, anchored cushion, totals on flows only; audit: aha says 13 columns but build makes 8 (Class B).
**Fix + language pass + bonus:**
- aha rewrite: "the 13-week is a roll-forward with a cushion — you built the front eight; the back five are the same five keys"
☆ Comma-format the flow block — zero decimals, one pass
**Random/Aha/Finish:** verify; fixed aha; cushion beat closes. **Clocks:** std. **Engine:** none.

#### 4.76 debtsched — "Run the debt schedule" · S
**Now:** typed blue rate, mandatory amort, MIN/MAX sweep, interest on average balance, YoY roll; par 73. At bar.
**Language pass + bonus:**
☆ Bold the closing-balance row and add a top border above it
**Random/Aha/Finish:** verify; existing; roll closes. **Clocks:** std. **Engine:** none.

#### 4.77 cascade — "Run the full cascade" ★ CAPSTONE c7 (D9: designate + move last) · S
**Now:** 3 tranches × 4 yrs, seniority MINs, per-tranche rolls, bold+top-border total; par 94; 7 checks (over cap) with guide 5v7.
**Capstone designation + trim to 6 core (fold the two per-tranche roll checks that share a motion) + realign guide:**
☆ Enter the sanity check in the check cell — total paydown across years equals cash generated; it reads zero
**Gate:** clean run opens Full Builds (the H6b-FB pass — §5.1). **Random:** verify tranche sizes/cash pools; add corner jitter if fixed. **Aha:** existing. **Finish:** the bold+border total (exists). **Clocks:** pass=par×2.0 override. **Engine:** none. **Plumbing:** groups[] move (menuOrder shift — 1-9 hotkeys re-map; RESOLVED, Wolf 2026-07-24: accepted as cosmetic).

### CH 8 · FULL BUILDS (11) — [SEPARATE PASS — spec provisional]

_Wolf review round 1 (2026-07-24): Full Builds get their OWN build pass (**H6b-FB**) with dedicated Wolf guidance, AFTER the main catalog pass (§5.1). The pages below are upgraded NOW to credible real-world model-building exercises — realistic line items (Revenue · COGS · Opex · D&A · EBITDA · Interest · Taxes; S&U columns; debt tranches with beginning balance/draws/paydown; working-capital lines), realistic flow (build the schedule top-down, tie the check row, format for presentation), semantic beat lines throughout — but every page stays PROVISIONAL until the pre-H6b-FB playtest review (§5.4). Each page flags what needs Wolf's playtest guidance._

#### 4.78 isbuild — "Build the income statement" · M [SEPARATE PASS — spec provisional]
**Now:** 5-yr IS off anchored drivers, margin %, ruled bottom line; par 51. Mechanically at bar; line items too generic for a real-world build.
**Beats (real-world upgrade):**
1. Build the Revenue line — year one off the blue growth rate, filled across the five years
2. Build COGS and Opex — each a % of the Revenue line, signed negative, filled across
3. Total EBITDA — Revenue plus the signed cost lines, filled across
4. Build EBIT — EBITDA plus the signed D&A line from the drivers block
5. Build the EBITDA margin row — EBITDA divided by Revenue, percent, one decimal
6. Bold the EBITDA line and add a top border above it — the read line
☆ Finish at A1 — the statement greets its reader
**Random:** driver pools (growth, COGS %, Opex %, D&A) + magnitudes + corner jitter. **Aha:** "an income statement is one driver panel and four shapes — build year one top-down, fill the rest". **Finish:** beat 6. **Clocks:** measure in H6b-FB. **Engine:** none. **Wolf playtest:** line-item depth vs clock feel — does seven lines × five years overshoot the par band; which drivers stay typed blue vs fed.

#### 4.79 bsbuild — "Balance the balance sheet" · M [SEPARATE PASS — spec provisional]
**Now:** 3 yrs, SUM both sides, RE roll filled across, zero check; guide/targets misalignments (fix via invariant). Mechanically at bar; the sides need named line items.
**Beats (real-world upgrade):**
1. Total the asset side — one SUM down Cash, AR, Inventory and PP&E, filled across the three years
2. Total liabilities & equity — the same shape down AP, Debt and Equity
3. Build the Retained earnings roll — prior RE plus net income, filled across
4. Build the check row — Total assets minus Total L&E, filled across; it reads zero
5. Bold both Total rows and add a top border above each
☆ Bold the check row — three zeros, in ink
**Random:** line values + net-income feed pool + corner jitter. **Aha:** existing — the sheet balances because the roll ties, not because you typed it. **Finish:** beat 5. **Clocks:** measure in H6b-FB. **Engine:** none. Realignment via the tri-length invariant. **Wolf playtest:** does the RE roll want a visible net-income feed line or a scripted memo; check-row bold as ☆ vs core.

#### 4.80 cfslink — "Link the cash flow statement" · M [SEPARATE PASS — spec provisional]
**Now:** 5-yr cash roll + conversion memo % + bold/ruled close; par 36. Real-world upgrade: the roll earns its operating section.
**Beats (real-world upgrade):**
1. Build cash from operations — net income plus the D&A add-back, filled across
2. Reference capex and the change in NWC from their schedule lines — signed as cash uses
3. Total net cash flow — one SUM down each year's column, filled across
4. Build the cash roll — beginning cash plus net flow lands ending cash; each year opens on the prior close
5. Build the conversion memo — free cash flow divided by EBITDA, percent
6. Bold the ending-cash row and add a bottom border under it
☆ One-decimal the conversion memo — 82.3%, not 82.34%
**Random:** feed pools + magnitudes + corner jitter. **Aha:** upgraded — "a cash flow statement is a roll-forward wearing an income statement's clothes". **Finish:** beat 6. **Clocks:** measure in H6b-FB. **Engine:** none. **Wolf playtest:** how much of the operating section arrives pre-fed vs built; trim a beat if the clock feel says so.

#### 4.81 nwcsched — "Roll working capital" · M [SEPARATE PASS — spec provisional]
**Now:** DSO/DIO/DPO typed blue, NWC rolled five years; par 74. At bar; the upgrade names the working-capital lines.
**Beats (real-world upgrade):**
1. Enter the working-capital drivers — DSO, DIO and DPO, typed blue in the drivers block
2. Build the AR line — DSO over 365 times the Revenue line, filled across
3. Build Inventory and AP the same shape — each off its own driver and its own cost base
4. Total NWC — AR plus Inventory minus AP, filled across
5. Build the change-in-NWC row — this year minus last; the line the CFS will read
6. Bold the NWC-change row and add a top border above it
☆ Comma-format the schedule body — zero decimals, one pass
**Random:** driver pools + revenue/COGS feed magnitudes + corner jitter. **Aha:** existing — "working capital is three ratios pointed at two lines". **Finish:** beat 6. **Clocks:** measure in H6b-FB. **Engine:** none. **Wolf playtest:** whether beat 3's two-lines-one-shape pairing reads as one motion or needs the split.

#### 4.82 threestmt — "Tie the three statements" · M [SEPARATE PASS — spec provisional]
**Now:** 3 links × 3 years, checks at zero, ship-formatted; the flagship. Audit flags state-report labels; the upgrade makes the three wires explicit.
**Beats (real-world upgrade):**
1. Reference net income into the cash flow statement — the IS hands off
2. Build the cash link — ending cash lands on the balance sheet's Cash line
3. Build the RE roll — prior RE plus net income; the equity side breathes
4. Build the check row — Total assets minus Total L&E, filled across the three years
5. Bold the check row and add a bottom border under it — zeros, in ink
☆ Finish at A1 — the model is one page again
**Random:** feed values + which year carries the stress + corner jitter. **Aha:** existing — "three statements, three wires — everything else is arithmetic". **Finish:** beat 5. **Clocks:** measure in H6b-FB. **Engine:** none. **Wolf playtest:** the flagship — Wolf sets the whole H6b-FB difficulty target off this page; also whether wire order (NI → cash → RE) stays scripted or goes player-chosen.

#### 4.83 opmodel — "Build the operating model" · M [SEPARATE PASS — spec provisional]
**Now:** drivers-up build, anchored rates, margin line; zero-ALTS family (register ×2); placement-series member (D16).
**Beats (real-world upgrade):**
1. Build the Revenue line — volume times price off the blue drivers, filled across
2. Build COGS and Opex — each a % of the Revenue line, signed negative, filled across
3. Total EBITDA — Revenue plus the signed cost lines
4. Build the EBITDA margin row — EBITDA divided by Revenue, percent, one decimal
5. Bold the EBITDA row and add a top border above it
☆ Comma-format the model body — zero decimals, one pass
**Random:** driver pools + magnitudes + corner jitter. **Aha:** existing — "the model runs off the drivers panel — change a blue cell, watch the page breathe". **Finish:** beat 5. **Clocks:** measure in H6b-FB — placement gate re-verify after sweep (D16). **Engine:** none. ALTS ×2 registered (order swap; fill route). **Wolf playtest:** placement-series member — par movement here shifts HK_PLACEMENT bands; Wolf calls the band tune.

#### 4.84 dcfbuild — "Build the DCF page" · M [SEPARATE PASS — spec provisional]
**Now:** DF/PV/TV/EV → per share, =NPV() audit line; par 91; zero-ALTS + guide misalignment.
**Beats (real-world upgrade):**
1. Build the discount-factor row — one over (1 + the WACC cell), compounded by year, WACC locked
2. Build the PV row — each unlevered FCF times its factor, filled across
3. Build terminal value — the year-five flow grown once, over WACC minus growth, discounted on the year-five factor
4. Total enterprise value — the PV row plus discounted TV, one SUM
5. Build value per share — EV less net debt, over shares outstanding
6. Build the =NPV() audit line — it agrees with your PV sum to the dollar (the finish prove-out)
☆ Dollar-format the per-share landing and bold it
**Random:** WACC/growth pools + flow magnitudes + corner jitter. **Aha:** existing. **Finish:** beat 6. **Clocks:** measure in H6b-FB. **Engine:** NPV exists. ALTS ×2 + guide realignment (tri-length invariant). **Wolf playtest:** whether terminal value deserves two beats (grow, then discount) at this chapter's altitude.

#### 4.85 lbobuild — "Build the paper LBO" · M [SEPARATE PASS — spec provisional]
**Now:** S&U plug → MOIC → IRR twice (compounded + =IRR over flows); par 82; targets 5v8 + zero ALTS.
**Beats (real-world upgrade):**
1. Build the sources & uses — the debt tranches off the leverage driver, the Equity line as the balancing figure ("the plug" in the brief, glossed there)
2. Build exit enterprise value — exit-year EBITDA times the exit multiple
3. Build exit equity — exit EV less remaining debt at exit
4. Build MOIC — exit equity over entry equity
5. Build the IRR both ways — MOIC^(1÷5)−1, then =IRR over the equity flow line
6. Percent-format both IRR reads and bold them — they agree to the decimal
☆ Add an outside border around the returns block — the answer ships
**Random:** entry/exit multiple pools + leverage driver + magnitudes. **Aha:** existing — "two roads to the same IRR; if they disagree, the model is lying somewhere". **Finish:** beat 6. **Clocks:** measure in H6b-FB. **Engine:** IRR exists. ALTS ×2 + targets realignment. **Wolf playtest:** beat 5 bundles two formulas — Wolf calls whether the pair reads as one motion or splits (pushing a beat to ☆).

#### 4.86 debtblock — "Build the debt & interest block" · M [SEPARATE PASS — spec provisional]
**Now:** two tranches on own anchored rates, both rolls + interest + totals; zero-ALTS + misalignment.
**Beats (real-world upgrade — tranche anatomy made explicit):**
1. Enter the two tranche rates — typed blue in the drivers block
2. Build the Term Loan roll — beginning balance less mandatory paydown lands the closing balance, filled across
3. Build the Revolver roll — beginning balance plus draws less paydowns, filled across
4. Build interest for each tranche — its blue rate times its average balance
5. Total debt and total interest — one live SUM each, down the tranche lines
6. Add a top border above Total debt and Total interest — two rules, one block
☆ Enter the roll check — closing debt equals beginning less paydowns plus draws; it reads zero
**Random:** tranche sizes/rates pools + draw/paydown schedules + corner jitter. **Aha:** existing — "every tranche is the same sentence — open, move, close". **Finish:** beat 6. **Clocks:** measure in H6b-FB. **Engine:** none. ALTS ×2 + realignment. **Wolf playtest:** average-balance vs opening-balance interest — which convention the catalog teaches first.

#### 4.87 dashcover — "Build the model cover" · M [SEPARATE PASS — spec provisional]
**Now:** page-one output box, reference-never-retype, UPPER(TRIM()) stamp; zero-ALTS + misalignment.
**Beats (real-world upgrade):**
1. Reference the four headline outputs into the cover box — revenue CAGR, EBITDA, leverage, IRR; never retype
2. Build the title stamp — UPPER(TRIM()) on the deal codename cell
3. Dollar-format the value lines — zero decimals
4. Percent-format the returns line — one decimal
5. Bold the cover header and center it across the box — never merge
☆ Add an outside border around the cover box — page one is a frame
**Random:** codename pools + output magnitudes + box site jitter. **Aha:** existing — "a cover page owns no math — four wires and a stamp". **Finish:** beat 5. **Clocks:** measure in H6b-FB. **Engine:** UPPER/TRIM exist. ALTS ×2 + realignment. **Wolf playtest:** which four outputs make the real-world cover — Wolf picks the roster.

#### 4.88 shipit — "Ship the Model" ★ NEW CAPSTONE c8 · L [SEPARATE PASS — spec provisional]
**Concept:** the catalog's endgame — a mini model built cold under the clock, and it only counts if it BALANCES [Timed Micro-Build with a Floor + Print-Ready Last Mile + Interview-Test Simulation].
**Board:** drivers panel (typed blue), empty mini-IS (3 lines), mini-BS (2 sides), cash link row, check row, headline box, deck strip; the full 20 rows.
**Beats:**
1. Build the mini income statement — revenue off the growth driver, costs off their %s
2. Build both balance-sheet sides — live SUMs, RE absorbing net income
3. Build the cash link — the CFS close lands on the balance sheet
4. Build the check row — assets minus L&E, filled across; it must read zero (THE FLOOR: the win requires zeros — a fast broken model is a loss)
5. Paste the headline box into the deck strip as values only — dead numbers travel
6. Finish at A1 — bold title, ruled bottom lines, the page ships
☆ Enter the as-of stamp — =TODAY() beside the title
**Gate:** clean run completes the catalog spine (finisher badge path unchanged). **Random:** driver pools + line-item pools + magnitudes; corner jitter. **Aha:** "speed only counts when the check row reads zero — balance is the floor, not the bonus". **Finish:** beat 6. **Clocks:** measure in H6b-FB; pass=par×2.0; expect the longest par in the catalog (~100–120s). **Engine:** none new. **Plumbing:** D6; POOL candidate. **Wolf playtest:** the endgame — par band, the balance-floor frustration curve, and whether beat 5's deck hand-off belongs in core all get set live with Wolf.

---

## 5 · ROLLOUT

### 5.1 Build order
0. **r420c — WAVE-1 ROUND 2 (the FIX WAVE) PRECEDES WAVE 2.** Wolf playtested wave 1 (P1: navigation · filldr · pastes · blocksel · rowops) — feedback in dev/ROUND1_FEEDBACK.md. The fix wave rebuilds those five drills to their ROUND-2 §4 pages + ships the seven playtest engine fixes (B1–B7) + the D17 colops retirement, BEFORE P2 opens. **All future wave agents build to the r420c rules (§1.0)** — every batch from P2 on applies §1.0 (outcome-vague lines, format-as-you-go, mystery ☆, save closer, conventions) on top of its §4 pages, and each wave's par sweep absorbs the +~2-key save closer.
1. **Platform PR first** (§2.1 clocks display · §2.2 bonus plumbing · §2.3 meter · §2.5 tiers · §2.6 touch-lists · §2.7 mistakes-replay · §2.8 invariants). Nothing drill-facing ships before this merges — every drill agent consumes it.
2. **Foundations** (4.1–4.10), catalog order, modeltour (capstone) last.
3. **Chapter by chapter** in catalog order — within a chapter: regular drills in order, capstone LAST (it chains the reworked boards). New drills (qclose/vlookup/cleanroom/redflags/pitchpage) build in their catalog slot.
4. Capstone GATE wiring (SPINE capstone fields + gate rule) flips on per chapter, in the same PR as that chapter's capstone.
5. **Full Builds (ch 8) = SEPARATE BUILD PASS — H6b-FB (Wolf, review round 1).** The main catalog pass is P1–P17 (chapters 1–7). Chapter 8 (4.78–4.88, shipit included) builds in its OWN dedicated round with Wolf guidance AFTER the main pass lands: its §4 pages ship marked [SEPARATE PASS — spec provisional] and are re-approved at the pre-H6b-FB checkpoint (§5.4 #5) before any ch-8 drill is built. These are the catalog's most complex drills — they get the playtest attention the rest of the fleet doesn't need.

### 5.2 PR batching (~5 drills/PR, 19 PRs — P18/P19 form the later H6b-FB pass)
| PR | contents |
|----|----------|
| P0 | platform mechanics (§2) + invariants + this doc committed to dev/DEPTH_PASS.md |
| P1 | navigation, filldr, pastes, blocksel, rowops — **BUILT + Wolf-playtested; ROUND-2 FIX WAVE (P1b) re-ships these five to the r420c pages + engine fixes B1–B7 + D17 before P2 opens** |
| P2 | editfix, undo, copyover + modeltour★ (c1 gate on) — _colops removed (D17: retired into rowops, which ships in P1b)_ |
| P3 | typeset, decimals, center, autofit, ruleoff |
| P4 | ruleaudit, combo, dress, housestyle + gauntlet★ (c2 gate on) |
| P5 | margin, foot, anchor, percent, growth |
| P6 | cagr, bridge, sumif, rollup, fxconvert |
| P7 | cases + qclose★ (c3 gate on) + drills.js meta sweep (D10–D15) |
| P8 | sort, scrub, grpfold, filterpass, unhide |
| P9 | lookup, vlookup(new), lookup2, recon, drill |
| P10 | series + cleanroom★ (c4 gate on) |
| P11 | audit, triage, wrapfix, balcheck, stalelink |
| P12 | wirewalk, tieout, hunt, signerr, versionup |
| P13 | balance + redflags★ (c5 gate on) |
| P14 | wacc, fcfbuild, dcf, comps, txncomps |
| P15 | football, dcfsens, retbridge, accdil, sourcesuses + pitchpage★ (c6 gate on) |
| P16 | schedule, intsched, lbo, revolver, waterfall |
| P17 | covtable, liqbridge, wk13, debtsched + cascade★ move (c7 gate on) |
| P18 (H6b-FB) | isbuild, bsbuild, cfslink, nwcsched, threestmt |
| P19 (H6b-FB) | opmodel, dcfbuild, lbobuild, debtblock, dashcover + shipit★ (c8 gate on) |
P18/P19 are the **H6b-FB pass** — scheduled after P17 lands and ONLY after the pre-H6b-FB Wolf review (§5.4 #5) re-approves the provisional ch-8 pages; the [SEPARATE PASS — spec provisional] marks come off page by page as Wolf signs them.
Each PR: cache-bump ?v= across the 9 pages when index.html/drills.js change (CI-enforced), AUDIT.md entry, AUDIT_R417 §D checkoffs, git fetch origin main FIRST (parallel sessions exist). New-drill PRs also carry: drills.js groups+meta, HOTKEY_PARS, migrate-certificates.sql array update (same PR — no drift window), build-drill-pages.js output for the SEO page.

### 5.3 Verification per drill (the gate, no exceptions)
- node --check on extracted scripts + drills.js
- e2e-demo-replay ×3 seeds (drill) → full-catalog replay before the PR
- e2e-alt-paths: ≥2 new ALTS entries green, guided=true pass too
- e2e-par-sweep → parKeys median; par seconds retuned by hand; HOTKEY_PARS mirrored; medal clocks eyeballed against §1.4
- e2e-fit-sweep (##### only where scripted), e2e-audit-parity/onboard/visual/rank regression set
- invariants: tri-length, one bonus, verb lint, meter labels, capstone fields
- screenshots ×3 (fresh / mid / win) into the PR — the Wolf-batch material
- placement drills (navigation, dress, margin, sort, opmodel): re-verify HK_PLACEMENT still spans the bands after retune

### 5.4 Wolf checkpoints
1. **THIS DOC** — Wolf reviewed (round 1, 2026-07-24): the §3 delta table stands, all taste calls resolved (decision log below), semantic-reference standard applied. Round-2 comments graft per drill as they come. Nothing builds before P0 scaffolding lands behind flags.
2. **Post-P0 playtest** — clocks strip, per-beat splits (in-run + results table), ☆ display, meter UI on one prototype drill (ruleaudit) before the fleet consumes them.
2b. **Wave-1 playtest — DONE (2026-07-24).** Wolf played P1 live; feedback transcribed + tagged in dev/ROUND1_FEEDBACK.md; the four follow-up decisions landed in the round-2 decision log below; the fix wave (P1b, §5.1 #0) executes it before P2. Each wave's playtest now also closes with a POST-BATCH BRIEF + propagation sweep per WORKFLOW.md §8.
3. **Per-chapter screenshot batches** — each chapter's PRs land → one batch post (fresh/mid/win ×N + capstone gate flow) → Wolf plays live → feedback lands as fixups in the NEXT chapter's window (rolling, per the r417 H6 cadence).
4. **Post-c4 mid-pass review** — halfway checkpoint: par distribution, clock feel, bonus uptake, capstone gate friction; recalibrate the standard if the data disagrees with it.
5. **Pre-H6b-FB review** — before P18 opens: Wolf playtests the ch-8 provisional specs against each page's **Wolf playtest** flags, locks line items, beat counts, interest conventions and the difficulty target (set off threestmt); pages shed the [SEPARATE PASS — spec provisional] mark as they're approved.

### RESOLVED — WOLF DECISION LOG (review round 1, 2026-07-24)
Formerly the open-questions list. Every item is DECIDED and folded into its section — nothing in this doc remains an open question.
1. **§2.1 clocks: A** — display layer over the existing 5 bands, zero migration. Rider: per-beat SUB-CLOCKS (speedrun-style splits) per the §2.1 extension — in-run split display beside each completed checklist item, post-run splits-vs-PB table; display/telemetry only.
2. **4.9 copyover:** the destructive "delete the source" STAYS the ☆ bonus — it is the aha made physical; the blue-color beat stays core.
3. **4.10 modeltour ☆:** margin rows ship GENERAL from build() so the ☆ percent-format is real work.
4. **§2.4 gate strictness:** capstone clean-run gates the NEXT milestone only; certificate issuance untouched (no issue_certificate change).
5. **4.43 series:** first-two-seeds-only randomization accepted; no backward-fill engine work this pass.
6. **§2.3 error counts:** N is FIXED per drill — honest prompt strings beat per-seed variance.
7. **D9 cascade move:** accepted — the 1–9 hotkey re-mapping in Models II is cosmetic; capstone-last stays uniform.
8. **§2.7 mistakes-replay:** ships in P0.
9. **§1.7 references (the round-1 headline): SEMANTIC-FIRST** — beats name the labeled real-world item ("the Revenue line", "the EBITDA margin cell"), never the bare cell; coordinates only where the board has no label (maze/obstacle mechanics) or as a parenthetical disambiguator. Recorded in §1.7's preamble; §1.3 labeled-target rule added; all pages swept.
10. **Full Builds (round-1 edit): SEPARATE BUILD PASS (H6b-FB)** — ch-8 pages upgraded to real-world model builds now, built later under Wolf guidance (§5.1 #5, §5.4 #5).

### RESOLVED — WOLF DECISION LOG, PLAYTEST ROUND 1 (2026-07-24 · r420c — source: dev/ROUND1_FEEDBACK.md)
11. **☆ = MYSTERY SLOT.** The checklist shows a dim "☆ ?" line with no text; the label reveals on earn or on the results card. Bonuses are HIDDEN EFFICIENCY discoveries — mastery moves (proper anchoring for one-copy fills, one-pass paste-special-multiply, whole-row/column op discipline), NEVER formatting tasks. → §1.0(d) + §2.2 display; wave-1 formatting-☆s replaced in §4.3/§4.4/§4.5.
12. **Ctrl+S = REQUIRED FINAL BEAT on all classic drills.** "Save your work" is the universal closer; the win fires on the save; pars re-measure (+~2 keys per drill) as the waves roll — no big-bang retune. → §1.0(e); navigation §4.1 carries the one sanctioned post-save beat (Wolf's own sketch).
13. **rowops ABSORBS colops.** Row AND column insert/delete + the formatting-inheritance lesson (validated Excel default: inserted rows inherit the row above; inserted columns the column to the left) are one drill under the rowops key. colops RETIRES — catalog 82→81 live (87 post-pass); the freed slot stays open for a future add. → §3 D17 + §4.5/§4.6.
14. **pastes gets a NEW hidden efficiency ☆:** one paste-special-multiply pass covers both scale conversions (copy the yellow helper once, one multi-row selection, one pass); the blue-the-row formatting ☆ dies. → §4.3.
15. **The §1.0 global law (from the playtest headline feedback):** format-as-you-go beat ordering · outcome-vague checklist lines (timer teaches speed, hints teach the route) · any-route grading re-affirmed · totals wear TOP borders, never bottom-under · helper/assumption cells populated + light yellow + all borders. Binding on every page; §1.0 wins on conflict; wave agents propagate per WORKFLOW.md §8.
