# ROUND 2 DRILL FEEDBACK — Wolf playtest, wave 1 round 2 (2026-07-25)

_Wolf's round-2 playtest of the wave-1 ROUND-2 rebuilds (P1b: navigation · filldr · pastes ·
blocksel · rowops), plus a platform/achievements/UX batch, transcribed clean from his notes
(source: the b9bb3d6d "Foundation drill 1-5 feedback" upload — it SUPERSEDES the earlier
partial variant; copy-paste artifacts deduped, nothing dropped). Every item is tagged with the
IN-FLIGHT ROUND that owns it:
**[DEPTH_PASS §1.0-R2(…)]** = spec rule (doc is now r420d) · **[engine-UI]** = engine/UX fix in
the in-flight engine-UI round · **[index-UI]** = index.html chrome/UX in the in-flight index-UI
round · **[drill R3]** = wave-1 drill ROUND-3 board/beat rework · **[cosmetics]** = the
cosmetics/stats round · **[docs]** = this integration session (done) · **[product+backend]** =
flagged product decision, queued._

_Wolf's overall verdict: "Much much better — on the right track… we're developing a new
standard for drills — just need to keep adding these sorts of tweaks to make it clear to the
user what they have to do / where they have to take an action."_

---

## 1 · GLOBAL STANDARDS (headline feedback — all now DEPTH_PASS §1.0-R2 law, r420d)

1. **ADAPTIVE CHECKLIST LABELS.** When a beat's required action varies per seed, the label must
   state THIS seed's action concretely — Wolf: "I'm looking at the item row and trying to figure
   out what conversion I need to do. This checklist item should be adaptive like 'Trading is in
   hundreds, multiply by 10' or 'Advisory is the only row in thousands, divide by 1000'."
   Computed at build time; a static label that forces the player to reverse-engineer the seed is
   a spec bug. → **[DEPTH_PASS §1.0-R2(g)]**; applied **[drill R3: pastes]**.
2. **ACTION-LOCATION CUES.** Where the player must act at a specific spot, the BOARD carries an
   explicit cue — Wolf (rowops): "make sure it's very very clear where you have to insert the
   row — like red '<<< Insert row above' text in the right column vs. the subtle green
   highlight." Cues are board content: seeded by build(), ignored by grading.
   → **[DEPTH_PASS §1.0-R2(h)]**; applied **[drill R3: rowops]**.
3. **☆ MUST BE A CHOICE.** A bonus earned "by the nature of doing the exercise" is dead — Wolf:
   "same with assemble and format, you achieve the star by the nature of doing the exercise.
   Should maybe be … that you used ctrl arrow down to select the data before copying or cutting
   vs using arrow keys — basically reward for good habits of using the previously taught hotkeys
   that save time." The ☆ requires a distinct, SKIPPABLE mastery decision.
   → **[DEPTH_PASS §1.0-R2(i)]**; re-cut **[drill R3: blocksel + rowops ☆s]**.
4. **LANGUAGE: "re-tie"/"tie" BANNED for formula recalculation.** Wolf: "Stop saying totals
   're-tie' — the totals calculate or recalculate. … when you tie numbers in finance you're
   making sure they match or things balance, not just like, watching the sum formula adapt to a
   cut or deletion." Tie/tie-out = numbers MATCH/balance (those usages stay legal); a SUM
   adapting = "the total recalculates". → **[DEPTH_PASS §1.0-R2(j) + R7 banned class]**;
   DEPTH_PASS's own pages swept **[docs — done r420d]**; drill copy sweep **[drill R3: rowops]**.
5. **FIRST-DRILL NUDGE.** "For the very first drill we might want some flashing indicator or
   arrow button to just nudge the user to move through the corridor." An explicit,
   onboarding-scoped exception to the no-hand-holding default — drill 1 only, first movement
   only. → **[DEPTH_PASS §1.0-R2(k)]**; applied **[drill R3: navigation]**.
6. **HELPER-CELL STANDARD extension.** "There should be two distinct helper cells vertically
   stacked … Helper cells should be labeled like 'Helper - 1000s' and 'Helper - sign flip'."
   Vertically stacked, individually labeled, light yellow + all borders, populated (extends
   §1.0(f)). → **[DEPTH_PASS §1.0-R2(l)]**; applied **[drill R3: pastes]**.
7. **OUTSIDE-BORDER CANON check.** "Remember that the hotkey for outside borders is not h b a
   it's h b s." Wolf states outside borders = Alt H B S (H B A = ALL borders). The engine
   already asserts H B S = selection perimeter (dev/e2e-audit-parity.js:506); the engine round
   is verifying and aligning every drill hint route / reference surface to S=outside, A=all.
   → **[DEPTH_PASS §1.0-R2(m)]** + **[engine-UI: verify/align]**.

---

## 2 · PER-DRILL

### navigation — "Navigation maze" (corridor, round 2)
- "Honestly very good" — but make the corridor **more windy**: more movement and actions;
  "there's a lot of dead space with just a block of black cells." Can revert to thick borders
  if needed. → **[drill R3: §4.1 corridor density]**
- **Flashing indicator/arrow** to nudge the very first movement (drill 1 only).
  → **[drill R3: §4.1 per §1.0-R2(k)]**
- Add a small **"exit"** so you can still get THROUGH the corridor to complete the "go to last
  cell" checklist item. → **[drill R3: §4.1 geometry]**

### filldr — "Fill down, fill right"
- **Borders are not showing on the grid** (global issue, seen here first). → **[engine-UI: R2-B1]**
- Good drill; nitpick — "I wish we had something else to fill right vs straight lining the Q1
  numbers — not super intuitive that all of those costs didn't change over the year."
  → **[drill R3: §4.2 fill-right variety]**
- Add an **empty row between "EBITDA as % Revenue"** (a memo line) and the % calculations — a
  standalone block, like summary stats in a model output. → **[drill R3: §4.2 board]**
- **Delete the duplicate EBITDA margin** row. → **[drill R3: §4.2 board]**

### pastes — "Paste Special everything"
- Cut the extraneous "The Q labels say which quarter is which" tail from beat 1 — "that's a
  comment for you on clarity, not necessarily explicit for the user." → **[drill R3: §4.3 copy]**
- Helper-cell clarity package: **adaptive conversion label** ("Advisory is the only row in
  thousands, divide by 1000") + **two distinct helper cells vertically stacked, labeled**
  ("Helper — 1000s" / "Helper — sign flip"), yellow — borders still invisible (R2-B1).
  → **[drill R3: §4.3 per §1.0-R2(g)+(l)]** + **[engine-UI: R2-B1]**
- **Outline around the deck values** would be helpful. → **[drill R3: §4.3 board]**
- Outside-borders chord is **H B S, not H B A**. → **[engine-UI: R2-B4 / §1.0-R2(m)]**
- **Add another formatting task** — e.g. the fees feed arrives left-aligned and you right-align
  it. → **[drill R3: §4.3 new beat]**
- "Paste formats section is great here — good reinforcement from the last drill." (positive —
  keep as-is)

### blocksel — "Assemble and format the summary"
- "Good drill but still a bit thin — doesn't help to right align the data if it's already
  coming right aligned" — the board must ship the incoming data MISALIGNED so the alignment
  beat is real work. → **[drill R3: §4.4 board]**
- **Make it clear we don't copy the segment and revenue HEADERS** for the copy task.
  → **[drill R3: §4.4 copy]**
- **Spell out "Operating income"** (no abbreviation). → **[drill R3: §4.4 board/copy]**
- "Don't hate throwing in another calculation for % EBITDA margin here" — optional add.
  → **[drill R3: §4.4 — page author's call, Wolf open to it]**
- **New ☆ needed** — the current one falls out of the exercise; reward Ctrl+Shift+↓ selection
  before copying/cutting. → **[drill R3: §4.4 per §1.0-R2(i)]**

### rowops — "Rebuild the schedule"
- "Rebuild is much better." **Red "<<< Insert row above" cue text** in the spare column at the
  insert site — the subtle green highlight isn't enough. → **[drill R3: §4.5 per §1.0-R2(h)]**
- **BUG:** inserting a column makes the helper/guided highlight **shift off the Staged Q3
  data** that needs to get copied. → **[engine-UI: R2-B3 — guided targets must track
  structure ops]**
- **Stop saying totals "re-tie"** — the totals calculate or recalculate. → **[§1.0-R2(j)]**;
  copy swept **[drill R3: §4.5]** + spec pages **[docs — done]**.
- **New ☆ needed** (same class as blocksel — earned by the nature of the exercise today).
  → **[drill R3: §4.5 per §1.0-R2(i)]**

---

## 3 · BUGS (consolidated — engine/UI)

| # | bug | seen in | owner / fix |
|---|-----|---------|-------------|
| R2-B1 | **Grid borders not rendering** (global): filldr grid, pastes helper cells, "still no borders visible" despite yellow outline | filldr, pastes | **[engine-UI]** — border render path; extends round-1 B4's border-carry work |
| R2-B2 | **Cursor behavior after copy/paste of a range feels off vs Excel** when moving with arrow keys — "might just be me but it feels off" | global | **[engine-UI]** — re-check post-copy/post-paste active-cell + anchor behavior against real Excel; parity assert if divergent |
| R2-B3 | **Column insert shifts the guided highlight off the Staged Q3 data** to be copied | rowops | **[engine-UI]** — guided targets/rings re-anchor across structure ops |
| R2-B4 | **Outside-border canon**: outside = Alt H B S, NOT H B A (= all borders) | pastes (reference) | **[engine-UI]** — engine assert already exists (e2e-audit-parity.js:506); verify drills/hints/reference surfaces align |
| R2-B5 | **Ribbon text/icons too small**; certain sub-menus JARRING — the ribbon expands and pushes the grid down | global | **[index-UI]** — ribbon type scale + fixed-height submenu strategy (overlay, don't push) |
| R2-B6 | **Onboarding arrow keys still dead** on keyboard-layout + experience-level selection | onboarding | **[index-UI]** — repeat finding; make arrows drive both pickers |
| R2-B7 | **Drill selector wraps to the top** when arrowing down past the last drill — "just have it hard stop at bottom" | drill picker | **[index-UI]** |

---

## 4 · PLATFORM / COSMETICS BATCH (same playtest, second half of the note)

### 4a · Achievement RENAMES (→ **[cosmetics]** — one rename batch, meta only)

| current | new |
|---------|-----|
| Bulge bracket | Elite boutique |
| Field coverage | Sector coverage |
| The RX desk | Socially awkward |
| Master builder | Master modeler |
| Institution | Institutional |
| Summit | Up for promotion (for being top rank in a sub-rank) |
| Chord library | Multi-channel |
| Night shift | Goblin hours |
| Dawn patrol | First one in |
| Mouse is a lifestyle | Not gonna make it |
| The full set | Sweaty |
| Shelf space | Off the shelf |
| Quarter close | Profitable quarter |
| Live deal | Deal sprint |
| Formula desk | Quant |

Plus, same batch:
- **Par achievements → golf-related phrases** (rename the set). → **[cosmetics]**
- **NEW: capstone achievements** — a clever one for finishing EACH capstone challenge, one for
  finishing HALF of them, one for ALL of them. → **[cosmetics]** (names) — capstones themselves
  land per DEPTH_PASS §2.4.
- **Legacy/removed-feature audit**: "Called out" is a legacy feature (cut) · "Gauntlet runner"
  is outdated (cut) · get rid of ALL challenge-race achievements if that's not a real feature ·
  "Ice in the veins" description reads like "don't use the app" — rewrite or cut. General:
  "Audit achievements for relation to features we already removed — love the vibes on what we
  have though, very clever." → **[cosmetics]**

### 4b · Stats / leaderboard layout (→ **[cosmetics]**)
- Stats page: put the **analytics ABOVE the achievement overview**.
- **Achievements hoverable for tooltips on EVERY card**, no matter where it's surfaced from.
- Leaderboard: **hide the "leave ranked" button** at the bottom — fill that space with big text
  of **your current rank and current rating**.
- Stats page: fill the gap under the streak card with a **certification-paths checklist** —
  completed paths get a visual reward (color/congrats), incomplete ones a "go get going" cue.
- Achievements page: with all-types/all-rarities chips selected, **organize by achievement TYPE
  then by RARITY** — rows laid out so you can see progression along each category.

### 4c · Selector / in-game chrome UX (→ **[index-UI]**)
- **Bottom drill tabs**: there's room for longer names — "paste sp." → "paste special"; feel it
  out and expand the shortened drill names as space allows.
- **Selector default state**: the chapter you're currently on EXPANDED, all others COLLAPSED.
- **Section-completion signal**: a cool check mark / better total-completion indicator per
  section.
- **Selector width**: lots of empty space between drill name and time/par — tighten by a few
  pixels for readability.
- **Arrow-key help text** in the drill picker (move/fold/open/close) is hard to see — raise
  legibility.
- Hard-stop at bottom (R2-B7) and onboarding arrows (R2-B6) ride this round too.

### 4d · Header (→ **[cosmetics]**)
- The top header ranked/card button should say **"middle bucket" / "top bucket" / "bottom
  bucket"** — not just "mid".

### 4e · Product + backend flag
- **Desk CREATION must be a PRO feature, locked to free users.** Needs a server-side guard
  (RPC/RLS), not just UI hiding. → **[product+backend — flagged in PIPELINE; Wolf-confirmed
  requirement, backend owner to schedule]**

---

## 5 · STATUS NOTES (2026-07-25, at integration)

- **In-flight rounds carrying this feedback:** engine-UI round (R2-B1–B4) · index-UI round
  (R2-B5–B7 + §4c) · wave-1 drill ROUND 3 (§2 items) · cosmetics round (§4a/4b/4d, incl. the
  achievements rename batch) · docs (this file + DEPTH_PASS r420d — done).
- **Wave-2/3 build status:** 5 drills committed (ruleoff · dress · copyover · editfix ·
  ruleaudit); 4 resuming after a session-limit kill (undo · modeltour · housestyle · typeset).
- **Wolf's model note:** the session may run Opus-tier — WORKFLOW.md §8 MODEL-PROOF HANDOFF is
  now live practice, not insurance. Every spec/prompt stays self-contained: rationale inline,
  exact predicates, worked examples; nothing load-bearing in session memory.
