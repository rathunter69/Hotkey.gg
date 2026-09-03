# THE TUTORIAL CHAPTER — Foundations as a tutorial, the catalog as the desk (r451 spec, DRAFT for Wolf review)

_Opened 2026-09-03 (session r451) from Wolf's post-playtest direction: "we need to re-work the
drill catalogue to be, across the board, more intuitive and instructive vs. just one fun drill and
throwing people into a real Excel task. The first 10 drills should be more like a tutorial for
Excel in the context of the platform before moving to more substantive work — foundations as a
tutorial chapter vs. a more robust drill catalog." This is the design spec + the cascade map. It is
written model-proof (WORKFLOW §8): a build session executes from this file alone. Nothing here is
built yet; §9 lists the decisions Wolf makes first._

Companion docs: `dev/DEPTH_PASS.md` (the drill law this spec amends in §2), `dev/FOUNDATIONS_SPEC.md`
(r217 — the original first-drills standard; superseded for chapter 1 by this file, still binding for
the robust chapters), `dev/ONBOARDING_V3.md` (the tour this spec folds into the drills),
`dev/WORKFLOW.md` §9 (the wave playbook that builds it), `dev/CONTINUITY.md` (the top of the funnel).

---

## 0 · The diagnosis (what the first session actually feels like today)

The first ten drills a novice meets, in catalog order, with their current shape:

| # | key | what it is | beats | par |
|---|---|---|---|---|
| 1 | navigation | the corridor — the fun one, "honestly very good" | 4 + ☆ | 20 s |
| 2 | filldr | build an op model: reference a feed, fill three cost lines, EBITDA, FY totals, four ratio rows, an anchored one-pass fill | 7 + ☆ | 44 s |
| 3 | pastes | transpose, sign-flip by paste-multiply, paste formats, paste values, outside border, one-pass conversion | 6 + ☆ | 42 s |
| 4 | blocksel | copy a feed, cut two columns in segment order, build a margin row, box the table | 6 + ☆ | 34 s |
| 5 | rowops | insert a row and a column, delete the placeholders and the DRAFT column, re-rule the total | 6 + ☆ | 30 s |
| 6 | editfix | three repairs by F2, a deliberate clear-then-undo trap, undo past your repairs and redo forward | 5 + ☆ | 52 s |
| 7 | modeltour★ | four #REF! subtotals in a live P&L, two margin rows, dollar and percent formats | 6 + ☆ | 35 s |
| 8 | typeset | bold / unbold / italic / red font / =TODAY() | 5 + ☆ | 24 s |
| 9 | decimals | comps page to the house decimal standard, find the ragged cell | 5 + ☆ | 25 s |
| 10 | center | alignment pass, header rule, centre-across-selection | 6 + ☆ | 22 s |

Every one of these is a good drill at the depth-pass standard. **None of them teaches.** Drill 2
assumes the player already knows how to reference a cell, fill, anchor, bold and rule — the entire
Excel keyboard grammar — and grades a seven-beat op-model build against a 44-second clock. The
depth pass deliberately made drills *vaguer* (§1.0(b): "the timer teaches speed, hints teach the
route"), which is right for a desk task and wrong for someone who has never pressed Ctrl+→. The
onboarding tour carries the only teaching in the product (five "novice" beats: grid, name box,
formula bar, typing, `=`/`+`), and it is a 13-card modal sequence over a sandbox that ends by
dropping the player into drill 1 with guided rails on.

So the seam Wolf felt is real and structural: **one fun drill, then real Excel tasks, with the
teaching living in a modal tour instead of in the drills.** The r450 first-session round fixed the
five worst holes around the edges (the invisible first win, the one-key tour delete) — it did not
touch this.

## 1 · The design

### 1.1 One sentence
**Chapter 1 becomes a ten-drill Excel keyboard tutorial — short, one lesson each, taught on the
board — and every drill after it is the desk.**

### 1.2 What a tutorial drill IS (and how it differs from a depth-pass drill)

| | depth-pass drill (chapters 2–9) | **tutorial drill (chapter 1)** |
|---|---|---|
| job | a real desk task, graded on the artifact | teach ONE keyboard idea, then make the player do it three ways |
| teaching surface | hint ladder (F1) + guided rails, opt-in | a **LESSON CARD** before the start gate, chords named; hints ON by default on the first attempt |
| beats | 4–6 core + a hidden ☆ | **2–4 core + a VISIBLE ☆** ("the fast way" — the tutorial's job is to show the efficient move, not hide it) |
| checklist language | outcome-vague, no chords (§1.0(b), R3) | outcome lines stay chord-free (the grader still checks the result) — the chords live on the lesson card and in the hints, which are on |
| par | measured expert median + 10% | measured, but short: **8–30 s** (the capstone up to ~45) |
| clocks | pass ×1.5 · pro ×1.15 · legendary ×1.0 | **pass ×2.0** (the capstone rule) · pro ×1.3 · legendary ×1.0 |
| board | 20 rows, ≥60% density, real artifact | same — the board is a small **real page, pre-dressed** (a regional sales table, a headcount roster, a five-line P&L); density comes from the artifact, not from beats |
| randomization | ≥2 axes | ≥2 axes (sites + values) — the reflex generalises from drill 1 |
| grading | end state, any route | end state, any route (Freedom Doctrine holds — the lesson card names the fast route, the grader accepts the slow one) |
| results card | medal, ☆, splits, aha | + **"next lesson →"** and the lesson's one-line recap; the aha IS the lesson |
| leaderboard / XP / PB | yes | yes — tutorial boards exist and post (they are drills), but tutorial keys are **excluded from the Daily Challenge pool and from `HK_PLACEMENT`** (navigation excepted, see §6) |
| certificate tracks | yes | **D2 — Wolf decides** (recommendation: include; see §9) |

### 1.3 The Excel keyboard grammar the ten drills teach, in order

The sequence is the grammar of keyboard Excel, not a list of features. Each lesson is used by every
lesson after it, so the chapter compounds.

| # | key | lesson (the card's title) | the ONE idea | chords taught | borrows |
|---|---|---|---|---|---|
| T1 | `navigation` (existing, kept) | **Move** — the keyboard flies | arrows walk, Ctrl+arrow flies to the edge, Ctrl+Home / Ctrl+End teleport | ←↑→↓ · Ctrl+arrows · Ctrl+Home · Ctrl+End · Ctrl+C/V (already in the drill) · Ctrl+S | the corridor as built (r427). Gains a lesson card that absorbs tour beats 0–1 (grid, address, name box) |
| T2 | `select` (NEW) | **Select** — Shift stretches, Ctrl+Shift stretches to the edge | a selection is a rectangle you grow from the active cell | Shift+arrows · Ctrl+Shift+arrows · Shift+Space (row) · Ctrl+Space (column) · Ctrl+A / Ctrl+Shift+8 (current region) | blocksel's grading machinery (`selRange` latches) |
| T3 | `entry` (NEW) | **Enter & edit** — type replaces, F2 edits inside | Enter commits down, Tab commits right, Esc backs out, F2 edits in place, Delete clears, Ctrl+Z undoes; Ctrl+plus / Ctrl+minus insert and delete a row | typing · ↵ · Tab · Esc · F2 · Delete · Ctrl+Z / Ctrl+Y · Ctrl+Shift+= / Ctrl+− | editfix's F2 checks, rowops' insert/delete checks; absorbs tour beat 3 (typing) |
| T4 | `clipboard` (NEW) | **Copy, cut, fill** — the clipboard moves, fill repeats | Ctrl+C copies and leaves, Ctrl+X moves and empties; Ctrl+D / Ctrl+R repeat the top/left cell down/right | Ctrl+C · Ctrl+X · Ctrl+V · Ctrl+D · Ctrl+R · Esc (drop the marquee) | blocksel (copy vs cut), filldr (fill) |
| T5 | `firstsum` (NEW) | **Your first formulas** — `=` or `+`, point at cells, Alt+= sums | a formula points at cells; arrows point while you type (point mode); Alt+= writes the SUM for you; a formula filled down moves with the row | `=` / `+` · arrows in point mode · Alt+= · Ctrl+D · F2 to look inside | foot (Alt+=), bridge (point mode); absorbs tour beats 2 and 4 (formula bar, `=`/`+`) |
| T6 | `lockref` (NEW) | **Lock a reference** — F4 pins a cell so one fill covers the block | `$B$1` stays put when filled; F4 cycles the locks; one anchored formula + Ctrl+D + Ctrl+R = the whole grid | F4 (and typed `$`) · Ctrl+D · Ctrl+R | anchor (the desk-scale version stays in Formulas I) |
| T7 | `numfmt` (NEW) | **Number formats** — Alt opens the ribbon; the letters walk it | Ctrl+Shift+1 comma, +4 dollar, +5 percent; Alt H 9 / Alt H 0 step decimals; Ctrl+1 is the dialog | Ctrl+Shift+1/4/5 · Alt H 9 / 0 · Ctrl+1 | decimals, housestyle |
| T8 | `fonts` (NEW) | **Bold, italic, blue** — weight for headers, blue for typed inputs | Ctrl+B / I / U; Alt H F C picks the font colour; the desk convention: blue = typed number, black = formula | Ctrl+B · Ctrl+I · Ctrl+U · Alt H F C (blue, automatic) | typeset, combo (blue inputs) |
| T9 | `alignrule` (NEW) | **Align, rule, fit** — numbers right, labels left, a line above every total | Alt H A L/C/R align; Alt H B T / B S / B B borders (top, outside, bottom); Alt H O I autofits | Alt H A L/C/R · Alt H B T / S / B · Alt H O I | center, ruleoff, autofit |
| T10 | `firstpage`★ (NEW, capstone) | **Your first page** — everything above, one small table, saved | build a five-line summary from a feed: navigate, select, enter, sum, lock, format, blue, rule, save | all of the above · Ctrl+S | the chapter, chained; the gate into chapter 2 |

**Why `navigation` stays as T1 unchanged (D6):** it is the drill Wolf rated best across three
playtest rounds, it already teaches exactly lesson 1, and its key carries every PB and board since
r217. It gains only a lesson card. Its ☆ (zero wall bumps) stays hidden — the one tutorial drill
whose bonus is a *game* bonus rather than a taught efficiency; the page notes the exception.

**Why ten and not seven:** the seven existing Foundations drills are robust desk tasks, not lessons.
Reworking them into lessons would destroy ~six weeks of depth-pass investment (each carries a probe,
alts, a par sweep and three rounds of Wolf's feedback). They MOVE, intact, to the chapter after the
tutorial (§4 D1) and become "the first real tasks" — which is what they were always good at. The
seam becomes a hand-off instead of a cliff.

### 1.4 The lesson card (the one new teaching surface)

Renders **before the r450 start gate** on a tutorial drill's first load (and on demand from the ?
sheet / a `lesson` button on the drillbar): a single card over the dimmed board —

```
  LESSON 5 of 10 · YOUR FIRST FORMULAS
  A formula starts with = or +. While you type it, the arrow keys POINT at cells
  instead of moving — watch the reference appear. Alt+= writes a SUM for you.
  Fill a formula down and its row references move with it.
      =        +        ←↑→↓ (point)        alt+=        ctrl+d
  [press any key to start]                       don't show lessons · F1 hints on
```

Rules: ≤ 60 words of body; a keycap strip of the chords the lesson teaches (this is the ONE place
chords appear as teaching text outside the hint ladder — the Copy Law's ban on chords in check
labels and picker copy is untouched); "press any key" IS the start gate (the card and the gate are
one surface — one keypress starts the clock, per r450's honest-t=0 law). Dismissable forever with
one toggle (`hk_lessons_off`), re-openable from the ? sheet. The card is data: `lesson:{title, body,
keys:[…]}` on the CHALLENGES entry; the engine renders it when `hkTutorialKey(k)` is true.

**Hints default ON** on a tutorial drill's first attempt (`hints=true`, NOT guided — no rails; the
cursor is free). F1 turns them off and the choice sticks per drill (`hk_hints_seen_<key>`). A run with
hints on still posts (the PB rule is no mouse, no guided — unchanged).

### 1.5 The visible ☆ (the tutorial exception to the mystery slot)

§1.0(d) makes the ☆ a hidden efficiency discovery. In the tutorial the efficiency IS the lesson, so
hiding it hides the teaching. Tutorial ☆s render with their label from the start ("☆ Select the
whole column in one press") — `bonus:true, reveal:true`. The results card treats it exactly as
today. This is the only place `reveal:true` is legal (invariant, §7). **D4 — Wolf decides.**

### 1.6 Onboarding: the tour shrinks, the drills teach

`ONBOARDING_V3` folded the primer into the tour; this spec folds the tour's *Excel* beats into the
tutorial drills and leaves the tour teaching the *product*:

| today's TOUR_STEPS | becomes |
|---|---|
| 0 grid & address · 1 name box | T1 lesson card |
| 2 result vs formula bar · 4 `=`/`+` | T5 lesson card |
| 3 just type | T3 lesson card |
| 5 Ctrl+→ · 6 Ctrl+Shift+← | T1 / T2 lesson cards (T1's corridor already does this live) |
| 7 checklist · 8 drillbar · 9 hints · 10 profile · 11 ghost · 12 themes · 13 auth | **stay** — the product tour, 5–7 beats, for everyone |

The `showComfort` question ("how much Excel?") keeps its job with a sharper consequence: **"basically
none"** → product tour → T1 with its lesson card; **"I get around"** → product tour → T1 (lessons
on, they can turn them off); **"I live in it"** → product tour → the picker opens on chapter 2 with
the tutorial folded and tagged "10 lessons · skip if you already fly". The warm-up sandbox
(`startSandbox`) is **retired** — T1 with a lesson card is the warm-up. `e2e-audit-onboard.js` is
rewritten to the new flow (it is 64 assertions today; expect ~50 with the sandbox gone).

### 1.7 Progression, gates and the capstone

- The tutorial chapter's milestone is `c1` (spine unchanged in shape). `firstpage` is its capstone
  (`meta.capstone`, `chapters[0].capstone='firstpage'`, clocks pass=par×2 — the standard §2.4 wiring
  off the modeltour template). A clean `firstpage` run opens chapter 2's milestone, exactly as
  modeltour opens Formatting today.
- **Free play is never blocked** (research 3 do-not-copy #2, standing law): every drill in every
  chapter stays openable from the picker. The tutorial is the *recommended path*, not a wall
  (**D5**). The picker shows the tutorial's progress bar ("4 of 10 lessons") and the next-lesson
  card carries the recommendation.
- Achievements that read the `'Foundations'` group name (`x_found` "Foundations Poured", `grp1`
  "Solid Foundation", `cap_c1` "Toured the model" → re-pointed at `firstpage`, `nav2` unchanged)
  keep their ids (frozen — earned ids persist) and re-target automatically or by string edit; the
  page for each is in §4.

## 2 · Amendments to DEPTH_PASS.md (become §1.0-R5 THE TUTORIAL LAW, r451)

Written so the wave agents inherit them without re-deriving:

- **(a)** A drill in a group flagged `tutorial:true` is a **tutorial drill**. §1.1's 4–6-beat floor
  does not apply: 2–4 core beats + exactly one ☆. §1.4 clocks: pass ×2.0 · pro ×1.3 · legendary ×1.0
  via `HOTKEY_CLOCKS`. Everything else in §1 (randomization, 20-row density, semantic labels,
  closed verbs, save closer, alt-path minimums, index-paired hint ladder) binds unchanged.
- **(b)** Every tutorial drill carries `lesson:{title, body, keys}`; body ≤ 60 words; `keys` ⊆ the
  chords the drill's `req` names (invariant). The lesson card is the only teaching text allowed to
  print chords outside `req`/`guide`.
- **(c)** Tutorial ☆s are `reveal:true` (label visible from load). Content law unchanged: the ☆ is
  the efficient route, never formatting. `navigation`'s game ☆ is the recorded exception.
- **(d)** Hints default ON on first attempt of a tutorial drill; rails never default on.
- **(e)** A tutorial drill teaches ONE idea (its card title) and every beat exercises that idea or a
  prior lesson's. A beat that needs a chord from a LATER lesson is a spec bug.
- **(f)** Tutorial keys are excluded from `HOTKEY_CHALLENGE_POOL`, from `HOTKEY_PREMIUM.groups`
  (forever free), and — except `navigation` — from `HK_PLACEMENT`.
- **(g)** The marketing count. "N banker-grade drills" counts **non-tutorial** drills (the phrase
  means the desk catalog); the tutorial is advertised separately ("a ten-lesson keyboard tutorial").
  `e2e-smoke`'s drill-count guard learns the exclusion. **D3 — Wolf decides.**

## 3 · Per-drill pages (T2–T10; T1 = navigation §4.1 of DEPTH_PASS + a lesson card)

Page grammar: **Board** · **Lesson card** (title / body / keys) · **Beats** (core, then ☆) · **Random** ·
**Aha** · **Par** (estimate — sweep at build) · **Engine** · **Alts** (≥2, one is the ☆-forfeit control).
All boards: 20 rows × A–J, title row `codename() + ' — <artifact>'`, pre-dressed unless the lesson is
the dress, helper cells yellow + bordered where used (§1.0-R2(l)), Ctrl+S closer engine-appended.

### T2 `select` — "Select" · name 'Select' · label 'Select the blocks' · tab 'Select'
**Board:** a regional sales table (Region × Q1–Q4 + FY, 8 regions), pre-dressed, sitting at a
randomized anchor (3-spot pool). A memo block to the right names four things to select, one per
beat, in THIS seed's words ("the West row", "the Q3 column", "the whole table", "the FY figures").
**Lesson card:** *Select* — "Hold Shift and the arrows stretch a selection from where you stand.
Add Ctrl and it stretches to the edge of the data. Shift+Space takes the row, Ctrl+Space the
column, Ctrl+A the whole block." keys: shift+arrows · ctrl+shift+arrows · shift+space · ctrl+space · ctrl+a
**Beats** (graded on `selRange` at commit — the player presses Enter or any non-selection key to
"lodge" a selection, the engine's existing selection latches handle it):
1. Select the {West} row of figures — Q1 through FY
2. Select the {Q3} column of figures — every region
3. Select the whole table — headers and figures
4. Select the FY figures for every region in one motion
☆ (visible): Select the whole table with the current-region chord — one press
**Random:** anchor (3 spots) · which row/column named (pools) · values.
**Aha:** "a selection is a rectangle you grow from where you stand — Ctrl+Shift grows it to the edge."
**Par:** ~14 s / ~12 keys. **Engine:** nothing new — `selOps` telemetry (r429) already records
chord-vs-arrow selection for the ☆. **Alts:** (1) arrow-by-arrow Shift selection for every beat
(☆ forfeited, core clears); (2) Ctrl+Space / Shift+Space route for beats 1–2.

### T3 `entry` — "Enter & edit" · name 'Enter' · label 'Enter and edit' · tab 'Enter'
**Board:** a headcount roster (Team · Head · Rate · Cost) with one row marked `<<< add the new hire
here` (§1.0-R2(h) cue), one cell with a typo (`Marketng`), one stale row marked `DUPLICATE — delete`.
**Lesson card:** *Enter & edit* — "Typing replaces what's in a cell. Enter commits and moves down,
Tab moves right, Esc backs out. F2 edits inside the cell instead of retyping it. Delete clears.
Ctrl+Z undoes. Ctrl+plus inserts a row, Ctrl+minus deletes one." keys: ↵ · tab · esc · F2 · delete · ctrl+z · ctrl+"+" · ctrl+"−"
**Beats:**
1. Enter the new hire's team, headcount and rate on the marked line — three cells, left to right
2. Fix the misspelled team name in place — the rest of the cell stays as it was
3. Delete the DUPLICATE row — the roster closes up
4. Undo the deletion, then delete it again (the note was right after all)
☆ (visible): Commit the three new-hire cells with Tab, Tab, Enter — one hand never leaves the row
**Random:** which row is the insert cue, which cell carries the typo (pool of misspellings), values.
**Aha:** "F2 edits inside the cell — you never retype what was almost right."
**Par:** ~22 s. **Engine:** an `entryOps` latch (Tab-commit count) for the ☆ — or read `keyLog`.
**Alts:** (1) Enter-Enter-Enter route + arrow back (☆ forfeit); (2) retype the whole typo cell (still
clears beat 2 — end state).

### T4 `clipboard` — "Copy, cut, fill" · name 'Clipboard' · label 'Copy, cut and fill' · tab 'Clipboard'
**Board:** a two-block page: a feed block (Segment · Revenue) and an empty summary block with headers;
a `Growth` row with one seeded formula in its first cell; a mis-filed `Notes` column sitting where
the figures should be.
**Lesson card:** *Copy, cut, fill* — "Ctrl+C copies and leaves the original. Ctrl+X cuts — the old
spot empties when you paste. Ctrl+D fills the top cell down over a selection, Ctrl+R fills the left
cell right. Esc drops the marching ants." keys: ctrl+c · ctrl+x · ctrl+v · ctrl+d · ctrl+r · esc
**Beats:**
1. Copy the segment names and revenues into the summary block — the feed stays where it is
2. Cut the Notes column into the memo area — its old column empties
3. Fill the growth formula across all four quarters
☆ (visible): Fill the growth row with one Ctrl+R over the whole selection — not cell by cell
**Random:** anchors (feed / summary / memo spots from a pool), segment pool, values.
**Aha:** "copy leaves, cut moves — and fill is copy-paste for a whole block in one press."
**Par:** ~18 s. **Engine:** none (`fillOps`, `cutMoves`, `pasteLog` exist). **Alts:** (1) copy+paste
cell by cell for beat 3 (☆ forfeit); (2) Alt H F I R ribbon fill.

### T5 `firstsum` — "Your first formulas" · name 'Formulas' · label 'Your first formulas' · tab 'Formulas'
**Board:** a five-line divisional P&L (Revenue · COGS · Gross profit · Opex · EBITDA) × Q1–Q4, Gross
profit and EBITDA rows EMPTY, a Total column empty. Costs negative per convention.
**Lesson card:** *Your first formulas* — "A formula starts with = or +. While you type it the arrow
keys point at cells instead of moving — watch the reference appear. Alt+= writes a SUM for you. Fill
a formula down and its references move with the row." keys: = · + · arrows (point) · alt+= · ctrl+r
**Beats:**
1. Build Gross profit for Q1 — Revenue plus the (negative) COGS line
2. Fill Gross profit across the other three quarters
3. Build EBITDA for every quarter — Gross profit plus Opex
4. Total each line across the year into the Total column — five live sums
☆ (visible): Land all five totals with one Alt+= over the selected block
**Random:** anchor jitter, values (integers), which two lines are empty (GP+EBITDA fixed; alt seeds
empty Opex-as-%? no — keep fixed; vary values + labels only). Two axes: jitter + values.
**Aha:** "a formula points at cells — point with the arrows, and Alt+= writes the sum for you."
**Par:** ~24 s. **Engine:** none. **Alts:** (1) typed refs `=B4+B5` (no point mode) — core clears;
(2) SUM typed by hand in each total (☆ forfeit).

### T6 `lockref` — "Lock a reference" · name 'Lock' · label 'Lock the reference' · tab 'Lock'
**Board:** a price grid: Units by product (rows) × region (columns), a single yellow helper cell
`Helper — price per unit`, and an empty Revenue grid of the same shape.
**Lesson card:** *Lock a reference* — "Fill a formula and its references move. Put $ on a reference
— F4 does it — and that one stays put. One anchored formula, filled down then right, covers the
whole grid." keys: F4 · $ · ctrl+d · ctrl+r
**Beats:**
1. Build the top-left Revenue cell — units times the price helper
2. Fill the Revenue grid — every product, every region, all from the one formula
☆ (visible): Lock the price with F4 rather than typing the dollar signs
**Random:** helper position (3 spots), grid size (3×3 or 4×3), values.
**Aha:** "one $ pass, twelve cells — the lock is where the speed lives."
**Par:** ~16 s. **Engine:** `F4` telemetry — the engine's `cycleAnchor` can set `S.f4Used`.
**Alts:** (1) typed `$` (☆ forfeit); (2) twelve typed formulas (core clears — the slow route is legal).

### T7 `numfmt` — "Number formats" · name 'Formats' · label 'Format the numbers' · tab 'Formats'
**Board:** a KPI strip (Revenue $k · Growth % · Margin % · Headcount) × 6 months, all raw
(`1234567.891`, `0.0834`), pre-dressed otherwise.
**Lesson card:** *Number formats* — "Ctrl+Shift+1 is comma, Ctrl+Shift+4 dollar, Ctrl+Shift+5
percent. Alt opens the ribbon and the letters walk it: Alt H 9 removes a decimal, Alt H 0 adds one.
Ctrl+1 opens the full dialog." keys: ctrl+shift+1 · ctrl+shift+4 · ctrl+shift+5 · alt h 9 · alt h 0 · ctrl+1
**Beats:**
1. Dollar-format the Revenue line — no decimals
2. Percent-format the Growth and Margin lines — one decimal
3. Comma-format the Headcount line — no decimals
☆ (visible): Set both percent lines from one selection
**Random:** row order (shuffled), values, anchor jitter.
**Aha:** "a format is a property of the cell, not the number — Alt walks the ribbon to it."
**Par:** ~18 s. **Engine:** none (`fmtOps.dec`, `fmtOps` exist). **Alts:** (1) Ctrl+1 dialog for all
three; (2) each percent line formatted separately (☆ forfeit).

### T8 `fonts` — "Bold, italic, blue" · name 'Fonts' · label 'Bold, italic, blue' · tab 'Fonts'
**Board:** a memo page: title, a header row (not bold), a small assumptions block whose typed
inputs are black, two memo lines, one formula cell wrongly coloured blue.
**Lesson card:** *Bold, italic, blue* — "Ctrl+B bold, Ctrl+I italic, Ctrl+U underline. Alt H F C
opens the font colour. The desk convention: a number you TYPED is blue, a formula is black — a
reader can tell inputs from calculations at a glance." keys: ctrl+b · ctrl+i · ctrl+u · alt h f c
**Beats:**
1. Bold the header row
2. Italicize the two memo lines
3. Color every typed input in the assumptions block blue
4. Return the mis-coloured formula cell to black
☆ (visible): Color the whole assumptions block blue from one selection
**Random:** which block cell is the mis-coloured formula, assumptions labels (pool), values.
**Aha:** "blue means typed, black means calculated — colour is provenance."
**Par:** ~20 s. **Engine:** none. **Alts:** (1) Alt H 1/2 ribbon walks for bold/italic; (2) cell-by-cell
blue (☆ forfeit).

### T9 `alignrule` — "Align, rule, fit" · name 'Rules' · label 'Align, rule and fit' · tab 'Rules'
**Board:** a small schedule (labels left, five figure columns, a Total row) with a squeezed label
column (`####`-free but truncated), left-aligned figures, no rules.
**Lesson card:** *Align, rule, fit* — "Numbers sit right, labels left, headers centred: Alt H A R /
L / C. A total earns a line above it: Alt H B T. Alt H B S boxes a selection. Alt H O I fits a column
to its content." keys: alt h a l/c/r · alt h b t · alt h b s · alt h o i
**Beats:**
1. Right-align the figure block
2. Center the period headers over their columns
3. Add a top border above the Total row
4. Autofit the label column so every name reads in full
☆ (visible): Align the whole figure block in one pass
**Random:** which column is squeezed, header pool (quarters vs months), values, anchor jitter.
**Aha:** "alignment is information — right for numbers, left for words, a line above every total."
**Par:** ~22 s. **Engine:** none (`fmtOps.align`, `widthOps` exist). **Alts:** (1) Ctrl+1 alignment
tab; (2) column-by-column align (☆ forfeit).

### T10 `firstpage`★ — "Your first page" · name 'First Page' · label 'Build your first page' · tab 'First Page' · capstone
**Board:** a feed block (Segment · Revenue · Costs, five segments) in a random corner; an empty
summary block with a title and headers (Segment · Revenue · Costs · Profit · Margin), a yellow
`Helper — tax rate` cell feeding nothing yet.
**Lesson card:** *Your first page* — "Everything from the nine lessons, on one page: fly to the
feed, grab it, bring it home, build the profit and the margin, lock the rate, format, blue the
inputs, rule the total, save." keys: (the ten lessons' keycaps, small)
**Beats:**
1. Copy the feed into the summary block — figures only
2. Build Profit for every segment — Revenue plus the (negative) Costs
3. Build the Margin for every segment — Profit over Revenue, percent, one decimal
4. Total the Revenue, Costs and Profit columns — live sums, a line above them
5. Color the typed inputs blue — the feed you brought home
☆ (visible): Fill Profit and Margin from one anchored pair — down once
(Ctrl+S closer engine-appended; win fires on the save.)
**Random:** feed corner (4 spots), segment pool, values.
**Aha:** "that was a page — every drill from here is a bigger one."
**Par:** ~45 s (capstone clocks). **Engine:** capstone wiring off the modeltour template
(`meta.capstone`, `chapters[0].capstone`, `HOTKEY_CLOCKS.firstpage={pass:par×2}`, `hkCapstoneOk`,
picker ★, both grandfather rules). **Alts:** (1) typed formulas per cell (☆ forfeit); (2) Alt+= totals
+ ribbon formats. **Results card:** names the chapter it opened ("Desk Ops is open").

## 4 · Catalog delta table (DEPTH_PASS §3 grammar; keys immutable, renames touch meta only)

| # | delta | type | rationale | plumbing impact |
|---|---|---|---|---|
| **D1** | New group **`Foundations`** = [navigation, select, entry, clipboard, firstsum, lockref, numfmt, fonts, alignrule, firstpage] flagged `tutorial:true`; the current Foundations drills [filldr, pastes, blocksel, rowops, editfix, modeltour] become group **`Desk Ops`** (name TBD — **D1 Wolf**) | ADD group + RENAME group | the tutorial is the foundation; the robust drills are the first desk tasks | `groups[]` (+1 group, 9 chapters) · `groupOf` auto · `HOTKEY_CAMPAIGN.chapters` +1 (`c1` = tutorial, capstone `firstpage`; today's c1..c8 shift to c2..c9 **or** the tutorial takes id `c0` to keep every existing id stable — **recommendation: `c0`**, zero migration of `hk_camp_xp` claim flags) · `HK_TRACKS` groups + `dev/migrate-certificates.sql` arrays in the SAME PR (r359 drift rule; D2 decides whether the tutorial is in `fluency`) · `HOTKEY_GATES.groups` chapter lists gain `c0` where the tutorial precedes · achievements reading `'Foundations'` re-target (see §1.7) · `cap_c1` medal desc → firstpage; a new `cap_c0`? no — `cap_c1` IS the tutorial capstone if `c0` naming is rejected; with `c0` add `cap_c0` "First page" and leave `cap_c1` on modeltour · picker chapter order · `HOTKEY_PARS` +9 · LB boards auto (9 new) · SEO pages +9 (`dev/build-drill-pages.js` regenerates; sitemap +9) · marketing count per D3 |
| D2 | 9 new keys: select · entry · clipboard · firstsum · lockref · numfmt · fonts · alignrule · firstpage | ADD ×9 | §3 | PARS · LB auto · SEO · `REWORKED` ledger in check-invariants (tutorial drills are built to the standard from day one — add to the ledger) · alts ×2 each in `e2e-alt-paths.js` · depth-contract exemption for the beat floor (§2(a)) |
| D3 | `HOTKEY_CHALLENGE_POOL` | EXCLUDE tutorial keys | §2(f) | pool filter by `hkTutorialKey` |
| D4 | `HK_PLACEMENT` | NO CHANGE | navigation stays the movement board | none |
| D5 | `HOTKEY_PREMIUM.groups` | NO CHANGE (tutorial never paid) | §2(f) | invariant: tutorial group ∉ premium groups |
| D6 | TOUR_STEPS | REMOVE novice beats 0–6 (they become lesson cards); keep product beats | §1.6 | `e2e-audit-onboard.js` rewrite · `showComfort` consequences · `startSandbox`/`exitSandbox`/`sandboxReadyCard` retired (dead code removed, not guarded) · `e2e-onboard-sandbox.js` retired |
| D7 | `modeltour` | stays capstone of Desk Ops (c1 or c2 per D1 naming) | unchanged drill | `chapters[].capstone` moves with its chapter |
| D8 | FOUNDATIONS_SPEC.md §6 table | SUPERSEDED for chapter 1 by this file | doc | header note in FOUNDATIONS_SPEC |
| D9 | marketing copy | "74 banker-grade drills" → stays 74 if D3 excludes the tutorial; "84" if it counts | D3 | `e2e-smoke` drill-count guard learns `hkTutorialKey`; index/About/enterprise meta tags; the tutorial gets its own line ("a ten-lesson keyboard tutorial") on index + About |

Catalog after: **83 drills** (74 + 9), 9 groups, capstone last in each (Formulas II / Models I /
Full Builds capstones still unbuilt ADDs — unchanged). `menuOrder.length` remains the only count.

## 5 · The cascade map — every surface this touches (WORKFLOW §8 propagation sweep)

| surface | change | owner wave |
|---|---|---|
| `drills.js` groups / meta / PARS / CLOCKS / CAMPAIGN / TRACKS / GATES / POOL / PREMIUM | per §4 | assembly |
| `index.html` CHALLENGES ×9 new entries + navigation `lesson` | §3 | build waves |
| `index.html` engine: lesson card, `reveal:true` ☆, hints-default, tutorial group flag helpers (`hkTutorialKey`, `hkTutorialGroup`), next-lesson on results, picker progress bar + fold, tour trim, sandbox retirement | §1.4–1.6 | wave 0 (platform) |
| `dev/check-invariants.js` | §7 invariants | wave 0 |
| `dev/e2e-alt-paths.js` (+18 alts) · `e2e-depth-contract.js` (beat-floor exemption) · `e2e-audit-onboard.js` (rewrite) · `e2e-smoke.js` (count rule) · `e2e-guided.js` (9 new solvable-on-rails) · `e2e-demo-replay.js` (auto) · `check-startgate.js` (the lesson card IS the gate — assert one keypress starts the clock) · `e2e-par-sweep.js` (9 sweeps) | tests | build waves + assembly |
| `dev/migrate-certificates.sql` + `supabase/migrations/` (new migration mirroring HK_TRACKS if D2 = include) | certs | assembly, same PR |
| `dev/build-drill-pages.js` → `drills/*.html` ×9 + `sitemap.xml` | SEO | assembly |
| `index.html` / `About.html` / `enterprise.html` / `billing.html` copy: chapter names, counts, "a ten-lesson tutorial" | copy | assembly (smoke-guarded) |
| `reference.html` (chord reference) — lesson order becomes the page's section order | copy | follow-up |
| `nav.js` milestone badges / `profile.html` / `stats.html` chapter headers (read `groups` — auto) | verify | assembly |
| `lb.js` board list (auto from menuOrder) — tutorial boards render; consider a "tutorial" section fold | verify | follow-up |
| `HOTKEY_ACHIEVEMENTS` strings (§1.7) | edit | assembly |
| `dev/DEPTH_PASS.md` §1.0-R5 · `dev/FOUNDATIONS_SPEC.md` header · `dev/ONBOARDING_V3.md` superseded note · `dev/CURRICULUM.md` (historical) · `hotkey-setup-guide.md` if it names drill 1 | docs | assembly |
| cache bump `?v=` on drills.js / index-referenced scripts across all pages | ship | assembly (CI-enforced) |

## 6 · Rollout (WORKFLOW §9 wave playbook; serial if the parallel wave is still blocked)

0. **Wolf review of this spec** — §9 decisions in chat, one word each. Nothing builds before.
1. **Wave 0 — platform** (one agent, main checkout): lesson card + start-gate merge · `reveal:true`
   · hints default · `hkTutorialKey`/group flag · results next-lesson · picker progress + fold ·
   `HOTKEY_CLOCKS` tutorial rule · tour trim + sandbox retirement · invariants (§7) · smoke count rule
   · `e2e-audit-onboard` rewrite. Gate green. **Wolf sees screenshots of the lesson card before
   wave 1** (WORKFLOW §2: anything visual ships behind a screenshot).
2. **Wave 1 — T2 select · T3 entry · T4 clipboard · T5 firstsum** (≤5 per wave; one agent per drill,
   payload contract §9.3). Each: CHALLENGES block + PARS + 2 alts + par sweep + `lesson`.
3. **Wave 2 — T6 lockref · T7 numfmt · T8 fonts · T9 alignrule · T10 firstpage★** (capstone last,
   wired off the modeltour template).
4. **Assembly** — groups/spine/tracks/migration/gates/achievements/SEO/sitemap/copy/cache bump; full
   19-suite gate; `REWORKED` ledger +9; AUDIT.md entry; the post-batch brief for Wolf (WORKFLOW §8).
5. **Playtest round** — Wolf runs T1→T10→filldr cold, in the "basically none" onboarding path. The
   test is the seam: does filldr now feel like the first real task instead of the first wall?
6. **Follow-ups** queued, not in scope: `reference.html` reorder · lb tutorial fold · the
   "recommended next drill" logic beyond the chapter (the Morning Sheet idea in STRATEGY.md).

Effort: wave 0 ≈ one session; waves 1–2 ≈ one session each at Opus tier (specs above are complete);
assembly + gate ≈ one session. Four sessions to a playtestable tutorial chapter.

## 7 · Invariants that land with it (`dev/check-invariants.js`, same PR as the code — WORKFLOW §3.3)

- exactly one group has `tutorial:true`, it is `groups[0]`, and it has 10 keys
- every tutorial drill has `lesson.title`, `lesson.body` (≤ 60 words), `lesson.keys` (non-empty), and
  every `lesson.keys` token appears in `req`
- tutorial drills: 2 ≤ core beats ≤ 4; exactly one `bonus:true`; `reveal:true` present on it
  (`navigation` allow-listed as hidden); `reveal:true` appears on NO non-tutorial drill
- `HOTKEY_PARS[k] ≤ 30` for tutorial keys except the capstone (≤ 60); `HOTKEY_CLOCKS[k].pass = par×2`
- tutorial keys ∉ `HOTKEY_CHALLENGE_POOL`; tutorial group ∉ `HOTKEY_PREMIUM.groups`;
  `HK_PLACEMENT.KEYS ∩ tutorial = ['navigation']`
- the tutorial chapter designates a capstone and it is the group's last key (existing capstone guard
  covers the rest)
- `HK_TRACKS` arrays == `migrate-certificates.sql` arrays (existing r359 drift rule, re-asserted)
- `e2e-smoke` drill-count: the "N banker-grade drills" phrase == `menuOrder` minus tutorial keys (D3)
- `check-startgate`: on a tutorial drill's first load the lesson card is present and the first
  keypress both dismisses it and starts the clock (honest t=0 preserved)

## 8 · What this does NOT change (so nobody re-derives it)

- The 74 depth-pass drills — not one beat, label, par or ☆ moves. The six robust Foundations
  drills change GROUP only.
- The Freedom Doctrine, the ☆ content law, the Copy Law, the save closer, the 20-row cap, the
  language standard, the capstone gate rule, the placement series, the leaderboard model, XP/levels.
- `HOTKEY_PREMIUM` stays `enabled:false`; the tutorial is outside the paid tier by construction.

## 9 · WOLF DECISIONS (answer in chat, one word each; recommendation first)

| # | question | options | **recommendation** |
|---|---|---|---|
| **D1** | chapter names | (a) tutorial = **Foundations**, robust six = **Desk Ops** · (b) tutorial = **Basics**, robust six keep **Foundations** · (c) tutorial = **Tutorial** | **(a)** — matches Wolf's framing ("foundations as a tutorial chapter"), keeps the free tier's "fluency foundation" pitch true, and the early medals ("Foundations Poured", "Solid Foundation") land on the tutorial where a new player can earn them in a session. Alternative names for the robust six if "Desk Ops" reads wrong: "Essentials", "Core Ops", "Everyday". |
| **D2** | tutorial in the Fluency certificate track | include · exclude | **include** — every tutorial drill is ≤30 s; a cert is "every drill in the track clean", so inclusion costs nothing and starts a novice's certificate progress on drill 1 |
| **D3** | marketing count | "74 banker-grade drills + a ten-lesson tutorial" · "84 drills" | **74 + tutorial** — a tutorial drill is not banker-grade and the phrase should stay honest; the guard learns the exclusion |
| **D4** | tutorial ☆ visible from load | yes · keep the mystery slot | **yes** — the efficiency IS the lesson; hidden it teaches nothing (navigation's game ☆ stays hidden) |
| **D5** | tutorial gate | soft (recommended path; free play open) · hard for "basically none" only (chapter 2 locked until firstpage★) | **soft** — the standing law (gate progression artifacts, never access); the milestone gate + picker fold + next-lesson card already make the path obvious |
| **D6** | navigation as T1 | keep as built + lesson card · shorten | **keep** — three rounds of praise; it already teaches lesson 1 |
| **D7** | `lockref` (T6) alongside `anchor` (Formulas I) | both · fold | **both** — T6 is the mechanic (F4 exists), `anchor` is the desk task (a four-spot pricing grid at par 22); the tutorial's job is to make `anchor` feel like a task, not a trick |
| **D8** | campaign chapter ids | tutorial takes `c0` (all existing ids stable) · renumber c1..c9 | **`c0`** — zero migration of earned `hk_camp_xp` claim flags and cap_c* medals |
| **D9** | hints default ON on first attempt of each tutorial drill | yes · no | **yes** — the run still posts (no rails); F1 turns it off and it sticks |
| **D10** | scope: build the platform wave now vs after the art decision | tutorial first · art first | **tutorial first** — it is the product; art is a skin |
