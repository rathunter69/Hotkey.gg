# FOUNDATIONS DESIGN SPEC — the first-drills standard
*(r217. Written after Wolf and the desk nailed the first two flagship drills —
navigation (the Excel maze) and modeltour (the #REF! cascade). This is the
COMPLETED design document Wolf asked for: the concrete bar those two set, and a
build-to specification for the rest of the Foundations set and every drill set
after it. DRILL_DOCTRINE.md is the methodology (how we build + test); THIS file
is the specification (what each drill must be). Where they overlap, doctrine
governs process, this file governs the target.)*

---

## 0. WHY THIS DOCUMENT EXISTS

Wolf's directive (r216→r217): *"really want to get the first few drills right so
we have a completed design document and specifications to run across the
remaining drill sets."*

The first two drills are now the reference implementations:

- **navigation** — a movement drill. The board is a randomized **Excel maze**;
  the reflex is Ctrl-arrow edge-jumps; the payoff is grabbing a model and
  copying it. Ships pre-dressed (the lesson is movement, not formatting).
- **modeltour** — a build drill. The board is a P&L with four subtotals blown to
  `#REF!`; the reflex is fly-to-the-break + rebuild-the-formula; the payoff is a
  cascade that recomputes and a statement closed with a dollar-rule. The player
  builds the banker's finish (the lesson IS the build).

Everything below generalizes from those two. A new drill is "done" when it can
be dropped into the same sentence as navigation or modeltour without lowering
the bar.

---

## 1. THE SEVEN THINGS EVERY DRILL SPECIFIES

Before writing a line of `build()`, fill these in. If any is blank or weak, the
drill is not specified yet.

| # | Field | The bar (from nav / modeltour) |
|---|-------|-------------------------------|
| 1 | **Story** | A real desk moment in one sentence. nav: "the mouse would scroll and hunt — the keyboard flies." modeltour: "the model came back with four subtotals blown out to #REF! and the meeting's in two minutes." Not "format these cells." |
| 2 | **`aha`** (mandatory) | The ONE thing the player can name afterward. nav: "the keyboard doesn't crawl — it LEAPS." modeltour: "subtotals are formulas, not numbers." Surfaced on the results card. |
| 3 | **The muscle** | The specific reflex being trained, named as chords. nav: `Ctrl+↓/→/←` edge-jumps + `Ctrl+Shift+arrows` grab + `Ctrl+C`. modeltour: fly-to-cell + typed cascade formula + `Ctrl+Shift+$` + `Alt H B B`. One drill trains one muscle family; don't smear. |
| 4 | **Board shape** | The artifact and its geometry. Must pass the Density + Banker's-Finish doctrines: bold title, labeled rows/cols, real values, blue inputs, ruled subtotals. nav: scatter-of-markers → corner P&L. modeltour: 11-row P&L × 5 quarters, 4 ruled subtotal rows. |
| 5 | **Randomization surface** | What changes every load so the *reflex* generalizes, not the *answer*. nav: marker positions (fixed zig-zag shape). modeltour: subtotal-break columns (far-right, far-left, two interior — shuffled), all magnitudes, the quarter labels. Minimum bar: content + sites both randomize (see §3). |
| 6 | **Grading latches** | The end-state checks, in the Freedom Doctrine (grade WHAT, not HOW), with the rare how-exceptions named. nav: 8 ordered state latches. modeltour: 4 (formulas-not-numbers is a *named* how-exception — "don't hardcode" IS the lesson). |
| 7 | **Payoff / finish** | The win state a banker would accept. nav: the model is on the clipboard "for the deck." modeltour: the cascade ties and the bottom line is dollar-formatted + ruled off, cursor home at A1. Never "8 green checks on raw data." |

---

## 2. THE TWO DRILL ARCHETYPES (pick one per drill)

Every Foundations drill is one of these. The archetype decides whether the board
ships dressed or the player dresses it.

### 2A. MOVEMENT / MANIPULATION drill (nav is the flagship)
The lesson is a **navigation or selection reflex** (jump, extend, grab, move,
copy, insert, delete). The board **ships pre-dressed** — a clean banker's page —
because the player isn't building it, they're operating on it. Grading is on the
resulting **selection / cursor / clipboard / structure state**, latched in the
intended order but accepting any legit route.

- Reference: **navigation** (maze). Also: blocksel, filldr, pastes, rowops,
  colops, copyover, saves.
- The randomization must not create a degenerate board: if Ctrl-arrows must land
  on exact cells (maze, jumps), **self-verify the board is solvable in `build()`
  before shipping** — nav carries a `ctrlJump` replica (`sim()`) and re-rolls
  bad seeds. Any drill whose grading depends on where a jump *lands* inherits
  this requirement.

### 2B. BUILD / REPAIR drill (modeltour is the flagship)
The lesson is **producing correct content** — a formula cascade, a repair, a
format pass. The player **builds the banker's finish**, and the checks grade it
(live formulas + value parity where "don't hardcode" is the lesson; format /
border / alignment where the finish is the lesson). The board ships as the
*broken* or *raw* state; the win state is the *clean* one.

- Reference: **modeltour** (#REF! cascade). Also: ribbon, editfix, undo, autofit.
- The number relationships must be **internally consistent and recomputable**:
  costs carry their sign so subtotals are clean sums; a fixed cell's true value
  is derivable so the grader can check parity within tolerance.

---

## 3. RANDOMIZATION — THE NON-NEGOTIABLE

The reason the maze was worth building: *randomization is what makes a reflex a
reflex.* If the answer is memorizable, the drill trains recall, not skill.

**Minimum bar (from DRILL_DOCTRINE §2.1, hardened here):**
- **Sites randomize.** Positions come from a spot pool / shuffle, never a lazy
  fixed offset. modeltour shuffles which columns lose a cell; nav shuffles every
  marker row/col.
- **Content randomizes.** Magnitudes via `rnd()`, labels via Fisher-Yates
  `pick`, periods via a rolling quarter/year.
- **Shape may stay fixed** so the guide stays teachable. nav's zig-zag is always
  down-right-down-left-down; modeltour is always Rev→NI. The *skill* is in
  reading the randomized board and firing the same chords — exactly the muscle.
- **Self-verification** when correctness of the random board isn't obvious:
  replay the solution through a local engine replica in `build()` and re-roll on
  failure (nav's `sim()`), with a guaranteed-clean fallback so a pathological RNG
  streak can never ship a broken board.

A drill body under ~2.8k chars or with <4 `rnd()` calls is suspect — hand-grade
it against this section.

---

## 4. GRADING — LATCHES AND THE FREEDOM RULE

**req/guide teach the chords; `checks()` grade the END STATE.** (DRILL_DOCTRINE
§2.2.) This spec adds the *shape* the first drills settled on:

- **State latches, evaluated every action, monotonic (once true, stay true).**
  nav's `S.navProgress` object holds one boolean per beat; each latches only when
  its predecessor already has (ordered) and its state condition holds. This makes
  the checklist a live progress bar and lets any route through.
- **Ordered when the story is a sequence** (nav: marker 0 before marker 1),
  **unordered when it isn't** (a formatting pass — any order).
- **Grade the artifact, not the keystrokes.** A marker beat checks `active ON the
  cell, no selection`; a selection beat checks the exact `selRange` rectangle; a
  copy beat checks the `clipboard.rect`; a format beat checks `fmtStyle`/border
  flags. Never check "did they press Ctrl+C" — check "is the model on the
  clipboard."
- **Named how-exceptions only:** live-formula (`c.formula` truthy + value parity)
  when "don't hardcode" is the lesson; a specific dialog/chord only when THAT
  chord is the drill. Everything else: route-agnostic.
- **Every drill ships an alt-path proof** in `dev/e2e-alt-paths.js` — a
  deliberately *different* legit route that must also pass (nav: thread with
  Ctrl-arrows but grow the block the slow Shift-by-Shift way). If you can't write
  a passing alt-path, the grading is railroaded — fix it.

---

## 5. THE GATE — a drill is not done until this is green

Run from repo root (`python3 -m http.server 8791`; Chromium preinstalled;
`NODE_PATH=/opt/node22/lib/node_modules/playwright/node_modules`):

| Check | Command | Bar |
|-------|---------|-----|
| Syntax | `node --check` / new-Function parse | clean |
| Demo replays & wins | `e2e-demo-replay.js <drill>` (REPS≥12 for randomized boards) | WIN N/N, zero page errors |
| Alt-path passes | `e2e-alt-paths.js <drill>` | PASS |
| Par is real | `e2e-par-sweep.js <drill>` | median keys ≈ parKeys, drift within tuning band |
| Fits the viewport | `e2e-fit-sweep.js <drill>` | CLEAN |
| Visible in all themes | `e2e-audit-visual.js <drill>` | ALL PASS (all 27 themes) |
| Onboarding intact | `e2e-audit-onboard.js` | ALL PASS |
| Excel-parity intact | `e2e-audit-parity.js` | ALL PASS |

Randomized boards (maze, shuffled breaks) run **high REPS** on demo-replay
specifically — one seed passing proves nothing. nav ships at 15/15.

---

## 6. PER-DRILL SPECIFICATION — FOUNDATIONS (13 drills)

Order = catalog order = teaching order. ✅ = built to this spec and passing the
gate. ◻ = existing drill to be re-specified against this bar on its next pass.
The two flagships are the reference; the rest are build-to targets.

| # | key | arch | Story / aha | Muscle | Board shape | Randomization | Payoff | Status |
|---|-----|------|-------------|--------|-------------|---------------|--------|--------|
| 1 | **navigation** | 2A | scattered sheet; "the keyboard LEAPS" | Ctrl-arrow edge-jumps → Ctrl+Shift grab → Ctrl+C | maze of markers → corner P&L | every marker pos (fixed zig-zag shape), model magnitudes | model on the clipboard for the deck | ✅ r217 |
| 2 | **modeltour** | 2B | 4 subtotals blown to #REF!; "subtotals are formulas" | fly-to-break + typed cascade + Ctrl+Shift+$ + Alt H B B | 11-row P&L × 5 qtrs, 4 ruled subtotals | break columns shuffled, all mags, rolling quarters | cascade ties, bottom line ruled off, home at A1 | ✅ r199 |
| 3 | **blocksel** | 2A | "grab the whole block, move it, dress where it lands" | Ctrl+Shift grab → Ctrl+X/V move → dress | a table to relocate | source/dest sites, block contents | block landed + dressed at the new address | ◻ re-spec |
| 4 | **ribbon** | 2B | "Alt is a menu — walk it" | Alt H 1 / H K / H A C ribbon walks | a page needing 3 ribbon jobs | which cells, which jobs | the three ribbon jobs applied | ◻ re-spec (could take a 4th job family) |
| 5 | **editfix** | 2B | typos to repair in place; "never retype a cell" | F2 surgery (jump into the cell, fix, commit) | a table with 3 seeded typos | typo cells + strings from a pool | all three fixed via F2, values correct | ◻ widen the typo pool |
| 6 | **undo** | 2B | "delete big, Ctrl+Z, then delete only what deserved it" | Ctrl+Z / Ctrl+Y discipline | a sheet with junk + good data intertwined | which rows are junk | only the junk gone, good data intact | ◻ re-spec |
| 7 | **filldr** | 2A | "one formula, whole block" | Ctrl+D / Ctrl+R fill | a block with one seed formula | block geometry, the formula | the block filled, one formula everywhere | ◻ re-spec |
| 8 | **pastes** | 2A | "one copy, two pastes — values then formats" | Alt E S / Alt H V S paste-special | source + two paste targets | sites, contents | values pasted, formats pasted | ◻ re-spec |
| 9 | **rowops** | 2A | "insert the dropped line, delete the junk, re-foot" | Shift+Space + Ctrl +/− + re-SUM | a schedule missing a line + carrying junk | which line is missing, junk position | schedule rebuilt and re-footed so it ties | ◻ (rebuilt r-prior; re-verify) |
| 10 | **colops** | 2A | "columns move too" | Ctrl+Space + Alt H I C / Alt H D C | a table needing a column inserted + one killed | which cols, contents | the quarter inserted, DRAFT killed | ◻ re-spec |
| 11 | **autofit** | 2B | `#####` everywhere; "fit the columns" | Alt H O I autofit | a page with squeezed numeric columns | which columns squeezed, magnitudes | every column fits, no `#####` | ◻ re-spec |
| 12 | **saves** | 2A | "work, Ctrl+S; more work, Ctrl+S again" | Ctrl+S rhythm across edits | a few small edits between saves | sites, values | saved at each checkpoint | ◻ re-spec |
| 13 | **copyover** | 2A | "one copy, three hand-offs" | 2 full pastes + Alt E S V values | source + three deck targets | sites, contents | three hand-offs placed, values-only where noted | ◻ re-spec |

**Re-spec pass order (after the flagships):** blocksel next (Wolf's stated
next), then the movement cluster (filldr, colops, rowops) since they share the
2A grading machinery nav just proved, then the 2B cluster (editfix, ribbon,
autofit, undo), then the hand-off pair (pastes, copyover, saves).

---

## 7. RUNNING THIS ACROSS THE REMAINING SETS

Formatting / Values / Data / Formulas / Models / Full Builds inherit §1–§5
unchanged. Two set-specific notes:

- **Models / Full Builds are archetype 2B at scale.** The modeltour cascade
  pattern (sign-carrying inputs, ruled subtotals, live-formula grading with value
  parity, board ships broken → wins clean) is the template. The bigger builds
  (isbuild, threestmt, debtsched) are just longer cascades with cross-statement
  links — same grading shape, more latches.
- **Data / Formulas lean 2B** but often grade a single correct artifact (a
  lookup, a sort order, a flag). Keep the Freedom Rule: grade the resulting order
  / value / flag, accept every idiom (INDEX/MATCH vs XLOOKUP, SUM/5 vs AVERAGE).
- **The maze generator is a reusable lever.** Its parameterized shape (RN/CN,
  direction sequence, marker count) can seed difficulty tiers and feed the Daily
  Challenge (T-L) — longer, branchier mazes as the player levels. Don't rebuild
  it per drill; extend it.

When a set is "run," every drill in it has: the seven §1 fields filled, an
archetype, randomization meeting §3, latches meeting §4, and a green §5 gate —
and reads, at its win state, like a page a banker would hand over.

---

## 8. THE RICH-DRILL STANDARD (r229, Wolf) — internalized so it's not re-explained

Blocksel's rebuild set the bar every Foundations/Formatting drill is now held to. When a
drill teaches a manipulation muscle, it must ALSO look and behave like a page a banker builds
— not a minimal 3-beat toy. The standard:

- **The standard grid is spacious + even.** ROWS:16, colW even (80px) unless a drill has a
  persistent label column (then that one column is wider, the rest even). The extra room is
  what lets a drill carry a real output table + a memo + a dress.
- **Every source/column is HEADERED.** The player never guesses what a number is — the base
  block carries "Segment | Revenue" headers, metric sources carry "EBITDA · CUT" etc. Tag the
  OPERATION on the source (COPY stays / CUT moves), colour-coded (blue = copy, orange = cut).
- **Show BOTH copy and cut, called out explicitly** in the checklist ("COPY the base…",
  "CUT the misfiled column…") and graded (source intact after copy; source empty after cut).
- **Dress it like the deck, with DIVERSE chords — never Alt H K on repeat.** The banker finish
  is a sequence of *different* muscles: bold headers (Ctrl+B), a **currency top line over comma
  rows** (Ctrl+Shift+$ / Ctrl+Shift+! + Alt H 9 trim to 0-dec — the "$ on the top line, numbers
  below" convention), right-aligned figures (Alt H A R), **centred + underlined** row labels
  (Alt H A C / Ctrl+U — underline added to the engine r229), a **boxed** table (Alt H B A).
- **Add computed + structural depth.** A memo the player computes off the block (e.g. EBITDA
  margin = EBITDA/Revenue, formatted %, italicised) — a live formula, not a typed number.
  Insert-row / insert-column belong here too where the layout gives room.
- **A puzzle with randomness.** Pieces scatter to shuffled, isolated anchors every run; which
  metric is where changes; values + labels randomise. Isolated (blank moat) so Ctrl+Shift grabs
  never bleed between blocks.

The muscle inventory a drill can draw diverse chords from: Ctrl+B bold · Ctrl+I italic ·
Ctrl+U underline · Ctrl+Shift+$ currency · Ctrl+Shift+% percent · Ctrl+Shift+! comma ·
Alt H 9/0 decimals · Alt H A L/C/R align · Alt H B T/B/A borders (A = full box) · Alt H H fill ·
Ctrl +/− and Alt H I/D R/C insert-delete row/column · Ctrl+D/R fill · Ctrl+X/C/V move/copy.
Reach for variety; repetition of one chord is a smell.
