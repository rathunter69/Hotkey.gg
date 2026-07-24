# ROUND 1 DRILL FEEDBACK — Wolf playtest, wave 1 (2026-07-24)

_Wolf's round-1 playtest of the wave-1 depth-pass drills (P1: navigation · filldr · pastes ·
blocksel · rowops), transcribed clean from his notes (source had copy-paste duplicated lines —
deduped here; nothing dropped). Every item is tagged with where it landed:
**[DEPTH_PASS §…]** = spec rule/page amendment (doc is now r420c) · **[engine fix]** = engine/UX
bug riding the wave-1 fix wave · **[drill round-2]** = board/beat rework in that drill's ROUND-2
§4 page. Follow-up decisions Wolf made after the feedback are at the bottom._

---

## 1 · GLOBAL STANDARDS (headline feedback)

1. **Format as you go.** If there is a formatting action, the formatting task comes directly
   after the task that created or touched the cells being formatted — build the
   format-as-you-go habit, not "do all the work, format later". (E.g. a SUM across a row →
   format that row before moving on.) → **[DEPTH_PASS §1.0(a)]**; ordering applied in every
   round-2 page **[drill round-2: all five]**.
2. **Keep instructions more vague.** Let the user struggle or figure it out; the timer and
   slow time are the teacher that they should be faster, with hints being the best way to
   solve it with hotkeys. → **[DEPTH_PASS §1.0(b)]** (outcome-vague lines; §1.7 recalibrated —
   closed verbs + semantic references stay, step-by-step prescription stripped).
3. **Checklists grade the outcome/end state**, not the specific task-and-hotkey. You can
   accomplish every item slower (typing values vs referencing cells, etc.) — never penalize
   the slow route; the timer shows them how slow they are. → **[DEPTH_PASS §1.0(c)]**
   (Freedom re-affirmed).
4. **Stars should be truly hidden / bonus tasks** — not formatting tasks; reward effective
   shortcuts (properly anchoring cells so one block copy-down copy-right works, vs writing
   the formula 3 times, etc.). → **[DEPTH_PASS §1.0(d)]** (☆ LAW: hidden-efficiency mystery
   slot); both formatting-☆s in wave 1 replaced **[drill round-2: pastes, blocksel]**.
5. **Every drill ends with Ctrl+S** — a standard ending, builds good habits, and it's clear
   when you finish a drill. → **[DEPTH_PASS §1.0(e)]** (universal "Save your work" closer;
   win fires on the save; pars re-measure +~2 keys as waves roll).

---

## 2 · PER-DRILL

### navigation — "Navigation maze"
- The drill is idiosyncratic vs the others; make the maze **less a true maze, more a winding
  corridor** ("the scary game" trend) — right now it's a lot of single-arrow maneuvering
  around maze corners, which isn't the lesson; highlight ctrl-arrow navigation.
  → **[drill round-2: §4.1 corridor redesign]**
- Pips are cool, but the current maze reads "look how long a maze takes me", not fun.
  → **[drill round-2: §4.1]** (pips kept, placed corridor-flow)
- The no-wall-bump star must NOT be triggered by a ctrl-arrow merely stopping at a wall.
  → **[drill round-2: §4.1 ☆ latch fix]**
- Integrate save + Ctrl+Home + Ctrl+End: leave the paste destination (A1 area) empty →
  nav the corridor → copy the table → Ctrl+Home → paste → save → bottom-right of active
  area. Beat sketch (his words, "along those lines, not verbatim"): _Navigate to the model
  data · Select and copy the whole block of data · Return to A1 and paste the data · Save
  your file · Go to bottom right cell of active area._ → **[drill round-2: §4.1 beats]**
- If possible, add PgUp/PgDn "elevator" elements (the x-in-row-A/B fast travel) — but leave
  out if it overloads the drill. → **left out this round; future note on §4.1**
- **BUG:** can ctrl-arrow (and copy-paste) straight THROUGH the borders/walls by the table.
  → **[engine fix: wall cells must stop the jump]**

### filldr — "Fill down, fill right"
- Make the instructions less descriptive so the user has more choice on how to approach
  optimally. → **[drill round-2: §4.2 outcome-vague lines]**; text sketch: _"Reference the
  revenue feed cells on the top row of the build to start the model" · "Total all 4 quarters
  to get to Fiscal Year (FY) totals" · etc._
- Make **D&A positive** if we're adding it back (otherwise we'd be subtracting the negative
  to get to EBITDA). → **[drill round-2: §4.2 board]**
- Add **more filling down and right** examples to the drill. → **[drill round-2: §4.2]**
- The star should be for doing the cogs % / opex % / d&a % cells in **one copy down + one
  copy right** — reward properly anchoring the right cells the first time.
  → **[drill round-2: §4.2 ☆]**
- Make **formatting the EBITDA row mandatory**. → **[drill round-2: §4.2, placed
  format-as-you-go]**
- Rename "EBITDA % of revenue" → **"EBITDA margin %"**. → **[drill round-2: §4.2]**
- Struggling to see where more randomization fits here — up to you if truly necessary.
  → **[drill round-2: §4.2 — existing axes kept, none forced]**
- **BUG:** Ctrl+Shift+R smart-pastes right even without the FactSet/Macabacus overlay, but
  **Ctrl+Shift+D doesn't work** (fill down). → **[engine fix: fill-down parity]**

### pastes — "Paste Special everything"
- **BUG:** the green marker flips to the column under Q1'24 BEFORE the paste-special
  transpose completes — the target area changes before the task is done.
  → **[engine fix: guided-ring holds until the active check grades]**
- Keep checklist items vague — "enter the fees in the appropriate quarter" — so users can go
  their own way before finding the best way. → **[drill round-2: §4.3 / §1.0(b)]**
- Add **Q labels in the column beside the fees** so it's clear they transpose from a
  vertical table to a horizontal row — right now those fees could belong to any quarter.
  → **[drill round-2: §4.3 board]**
- **Populate the 2 helper cells (1000, −1)** and style them light yellow + all borders
  (showing an input/assumption) so it's clear they're there to multiply or divide with.
  → **[drill round-2: §4.3 board / §1.0(f) convention]**
- Maybe **randomize the scale conversion** (one version the row is in 1000s → divide by
  1000; one version it's in $s → multiply by 100, etc.). → **[drill round-2: §4.3 random]**
- Still allow someone to just type negative values / add signs — just slower than paste
  special. → **[§1.0(c) freedom]**
- **New challenge (star) probably needed.** → **[drill round-2: §4.3 new hidden ☆ —
  one paste-special-multiply pass; see decisions below]**
- **BUG:** no top border shows on the Total row natively, and paste-special-formats from the
  Total row carries no borders either. → **[engine fix: paste-formats border carry]** +
  **[drill round-2: §4.3 board ships the top border — §1.0(f)]**
- **BUG:** the Total row's grey is the same grey as the selection highlight — dragging
  across it you can't tell if anything is selected beyond the green corner square.
  → **[drill round-2: §4.3 board style — distinct fill token]**
- Text sketch: _Transpose the fees from the vertical feed to the fee row · Convert the
  trading/advisory/subtotal row to dollars in 1000s/100s etc (whichever format is
  inconsistent) · Make the costs line negative to reflect a cash outflow · Paste the formats
  from the total row to the subtotal row, unbold._ → **[drill round-2: §4.3 beats,
  verbatim-adapted]**
- Make the deck hand-off obviously values-only — label the row **"values only"** (or make a
  pasted formula visibly break something). → **[drill round-2: §4.3 board]**

### blocksel — "Assemble and format the summary"
- Get rid of the **comma formatting requirements**. → **[drill round-2: §4.4 — dropped]**
- Text isn't clear: the cut-paste beats must SAY the EBITDA / operating income data is
  **aligned by segment** (could be out of order otherwise — make it explicit in copy).
  → **[drill round-2: §4.4 beats]**
- Text sketch: _Copy all of the segment and revenue data (then format) · Cut and paste the
  EBITDA numbers into the table · Cut and paste the operating income for each segment ·
  Top headers should be bold and centered across, data aligned right._
  → **[drill round-2: §4.4 beats]**
- Incorporate **selecting the entire table with Ctrl+A** (or the appropriate chord).
  → **[drill round-2: §4.4 — whole-table border beat; hint teaches Ctrl+A]**
- **Make a new star for this one** (old one was formatting). → **[drill round-2: §4.4 new
  hidden ☆]**
- **BUG:** cut-and-paste of the EBITDA selects TWO columns instead of the one column with
  data. → **[engine fix + board geometry: §4.4]**
- Reminder: formatting tasks follow directly after the thing that touched those cells.
  → **[§1.0(a)]**

### rowops — "Rebuild the schedule" (+ colops)
- **Combine this and the column drill** into one more fulsome drill teaching row inserts and
  deletions AND column inserts and deletions ("still think we should rebuild the schedule
  and column drills"). → **[DEPTH_PASS §3 D17 + drill round-2: §4.5 — rowops absorbs
  colops; colops retired]**
- Awkward to delete the placeholder row when there's data in the FY26E column — it feels
  like deleting an important number, not an extraneous row. → **[drill round-2: §4.5 board —
  placeholder must read clearly extraneous]**
- **Totals should have top borders, not bottom borders.** → **[§1.0(f) convention + drill
  round-2: §4.5]**
- Add more formatting so users learn that Ctrl+Space / Shift+Space then Ctrl+plus
  **preserves/copies the formatting of the row above** ("I think that's how it works —
  validate the Excel functionality"). → **VALIDATED: Excel default — an inserted row
  inherits the formatting of the row ABOVE; an inserted column inherits the column to the
  LEFT (Insert Options floaty can flip it; we teach the default). [drill round-2: §4.5
  inheritance lesson + engine fix: implement/verify insert-inheritance]**
- Formatting tasks directly after the touch. → **[§1.0(a); §4.5 ordering]**

---

## 3 · BUGS (consolidated — the wave-1 fix-wave engine list)

| # | bug | drill seen in | fix |
|---|-----|---------------|-----|
| B1 | Ctrl+arrow rides THROUGH wall/border cells (and copy-paste through them) | navigation | engine: walls stop the jump; geometry re-verified per seed |
| B2 | Ctrl+Shift+D fill-down dead while Ctrl+Shift+R fill-right works (no plugin overlay) | filldr | engine: fill-down parity + parity assert |
| B3 | Guided ring advances to the next target before the current check completes | pastes | engine/UX: ring latches to the active beat until its check grades |
| B4 | Total row shows no top border; paste-special-FORMATS carries no borders | pastes | engine: formats-paste carries borders; board ships §1.0(f) top border |
| B5 | Total-row grey fill == selection-highlight grey (selection invisible over it) | pastes | style token: distinct fill for banded/total rows |
| B6 | Cutting the EBITDA column selects two columns, not the one data column | blocksel | engine/board: edge-selection stops at the data column; moat the neighbor |
| B7 | Wall-bump ☆ latch counts a ctrl-arrow stop at a wall as a bump | navigation | engine: bump = blocked keypress while flush (or single-arrow into wall) only |

---

## 4 · GENERAL BUGS & PLATFORM FEEDBACK (second upload, same playtest)

_Wolf's "General bug fixes" notes — outside the wave-1 drills. Dispositions per Wolf/orchestrator:_

| # | item | disposition |
|---|------|-------------|
| G1 | **Ctrl+Space only selects the column down to the OLD row limit** — cuts off on the new 20-row grid, so the column is only partially selected | **platform round (in flight)** — engine fix: whole-column selection reads `__ROW_CAP`, never a stale constant; invariant with the fix |
| G2 | **Leaderboard card is EXPANDED** — violates standing guidance: layouts tight, no overflow, card design exactly consistent/identical regardless of display surface. Same on the My Stats page | **cosmetics/stats round (in flight)** — one card renderer, one size contract, every surface |
| G3 | **Pace chart needs more numbers** — now easier with checklist sub-times (§2.1 splits); make pace insights actionable | **cosmetics/stats round (in flight)** |
| G4 | **Busiest-day stat unhelpful** (a date and "2") — should show clears, solves, time saved, or hotkeys used | **cosmetics/stats round (in flight)** |
| G5 | **Collapse individual drills on the stats page** to take less space | **cosmetics/stats round (in flight)** |
| G6 | **Recent-run history display**: show ~last 5 runs with an expand/see-more button for deeper drill run history | **cosmetics/stats round (in flight)** — display side of G10 |
| G7 | **Header should show rank AND bucket** — "like, VP — bottom bucket" | **cosmetics/stats round (in flight)** |
| G8 | **Stats page: hide the trays showing what's currently on the card** — distracting; only worth keeping if it becomes editable in-line | **cosmetics/stats round (in flight)** (in-line edit idea folds into G9's rework if built) |
| G9 | **Card-customizer rework** (titles still not updating): (a) some titles LOCKED to their skin — PRO and founder specifically; (b) other titles populate on the title cutouts; (c) the achievement picker can't order or slot achievements to a specific tray — you rotate through selections until the order works; instead **lock each tray to ONE achievement type** (standardized read: accuracy tray vs completionist tray etc.), with **mythics/legendaries wild** — able to populate any tray slot | **QUEUED** — full spec captured as a PIPELINE queue item (Wolf) |
| G10 | **Data-retention policy undefined** — how much user run history do we keep? (assumption: stats shows most recent runs up to ~a week, last ~5 visible) | **OPEN PRODUCT DECISION** — flagged in PIPELINE's Wolf-pending list |

_His two workflow asks from the same note (incremental post-batch change-briefs + site-wide
propagation, and writing specs/prompts so a downgraded (Opus-tier) agent can execute them
faithfully) are now house law → **WORKFLOW.md §8** and the DEPTH_PASS §0 protocol note._

---

## 5 · WOLF'S FOLLOW-UP DECISIONS (2026-07-24, after the feedback — all RESOLVED)

1. **☆ = MYSTERY SLOT.** The checklist shows a dim "☆ ?" line with NO text; the label is
   revealed on earn (mid-run) or on the results card. Bonuses are hidden EFFICIENCY
   discoveries (mastery moves — proper anchoring, one-pass paste-special), never formatting.
   → DEPTH_PASS §1.0(d) + §2.2 display rework.
2. **Ctrl+S = REQUIRED FINAL BEAT on all classic drills.** The win fires on the save; pars
   re-measure (+~2 keys) as the waves roll. → DEPTH_PASS §1.0(e).
3. **rowops + colops MERGE into the rowops key.** colops retires; catalog 82→81 live
   (87 post-pass); the freed slot stays open for a future add. → DEPTH_PASS §3 D17 + §4.5/§4.6.
4. **pastes gets a NEW hidden efficiency ☆** — one paste-special-multiply pass covers both
   scale conversions; the blue-the-row formatting ☆ dies. → DEPTH_PASS §4.3.
