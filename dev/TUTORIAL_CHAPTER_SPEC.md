# THE KEYBOARD TOUR + THE ON-RAMP — Foundations gains a tutorial front end (r451 spec **v2**, DRAFT for Wolf review)

_History: **v1** written 2026-09-03 (session r451) — "the first ten drills become a tutorial chapter,
the six robust Foundations drills move to a new chapter". **v2, same day (2026-09-03), replaces it and
is the design of record.** Wolf's question that forced the re-cut: "a chapter of foundation drills, or
one very robust tutorial drill that teaches navigation, how the ribbon works, etc.?" The answer is
BOTH, at the right sizes: **one robust, staged, untimed Keyboard Tour that carries the teaching, plus a
four-drill on-ramp that carries the reps — inside the existing Foundations chapter.** The Tour is the centerpiece: it has a
different FLOW from a drill — it holds the player's hand with an on-screen **TUTORIAL HUD** that names
the next keystroke, the way a pixel-art game walks you through its controls (Wolf, same day; specced in
full at §3.0.2). No new chapter, no chapter rename, no `c0` campaign id, no achievement re-targeting. §0 is unchanged from v1 (the
diagnosis was right); §1 onward is v2. §9 lists the decisions Wolf makes before anything builds — including **L1**, whether
the four lesson drills get built at all (they are the recommendation, not a settled fact)._

_Written model-proof (WORKFLOW §8): a build session executes from this file alone, without asking
questions. Every engine seam cited carries a verified `index.html:<line>` anchor (verified 2026-09-03
against `main` at r450; if a line has drifted, grep the function name — the names are stable)._

Companion docs: `dev/DEPTH_PASS.md` (the drill law this spec amends in §2), `dev/FOUNDATIONS_SPEC.md`
(r217 — the original first-drills standard; still binding for the six robust Foundations drills),
`dev/ONBOARDING_V3.md` (the modal tour this spec largely replaces), `dev/WORKFLOW.md` §9 (the wave
playbook that builds it), `dev/CONTINUITY.md` §0 (the top of the funnel).

---

## 0 · The diagnosis (what the first session actually feels like today) — unchanged from v1

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
| 10 | center | alignment pass, header rule, center-across-selection | 6 + ☆ | 22 s |

Every one of these is a good drill at the depth-pass standard. **None of them teaches.** Drill 2
assumes the player already knows how to reference a cell, fill, anchor, bold and rule — the entire
Excel keyboard grammar — and grades a seven-beat op-model build against a 44-second clock. The depth
pass deliberately made drills *vaguer* (§1.0(b): "the timer teaches speed, hints teach the route"),
which is right for a desk task and wrong for someone who has never pressed Ctrl+→. The onboarding tour
carries the only teaching in the product (five `novice:true` beats — grid, name box, formula bar,
typing, `=`/`+` — at `index.html:32177`), and it is a 13-card modal sequence over a throwaway sandbox
that ends by dropping the player into drill 1 with guided rails on.

So the seam Wolf felt is real and structural: **one fun drill, then real Excel tasks, with the teaching
living in a modal tour instead of on the board.** The r450 first-session round fixed the five worst
holes around the edges (the invisible first win, the one-key tour delete) — it did not touch this.

---

## 1 · The design (v2)

### 1.1 One sentence
**One robust, staged, untimed Keyboard Tour teaches the whole grammar on one board; four short lesson
drills turn each piece of it into a timed rep; the six existing Foundations drills stay exactly where
they are and become the graduation.**

The Tour is the centerpiece and is what wave 1 builds. **The four lesson drills are the recommended
on-ramp, not a settled part of the design — they are decision L1 (§9).** If Wolf takes "Tour only",
everything in §3.1–3.4, §4 A2/A5/A10 and §7's lesson-drill block drops and the catalog stays at 74;
the Tour, §3.0 and the cascade in §5 stand unchanged either way.

### 1.2 The shape, concretely

| | **the Keyboard Tour** (`keyboardtour`) | **a lesson drill** (4 of them) | a depth-pass drill (the other 74) |
|---|---|---|---|
| what it is | a single staged tutorial board, six stages, ~3–4 minutes | a short catalog drill that teaches ONE idea and reps it | a real desk task graded on the artifact |
| in the catalog? | **NO** — outside `menuOrder`, like the sandbox is today (`cur='__sandbox__'` pattern, `index.html:31672`) | yes — in the **Foundations** group | yes |
| clock | **none** (untimed; no par, no medals) | par 12–30 s, pass ×2.0 · pro ×1.3 · legendary ×1.0 | par as measured, pass ×1.5 · pro ×1.15 · legendary ×1.0 |
| leaderboard / PB / XP | none, none, **one-time +25 xp on first completion** | yes, yes, yes | yes, yes, yes |
| **flow** | **hand-holding: a persistent TUTORIAL HUD names the next keystroke, a spotlight rings the target, wrong keys get a nudge (§3.0.2)** | a drill: the lesson card teaches, then the clock and the checklist take over | a drill: outcome-vague beats, help is opt-in |
| teaching surface | six stage cards + the TUTORIAL HUD + do-it beats gated on real keystrokes | one lesson card before the start gate; hints ON on the first attempt | hint ladder (F1) + rails, opt-in |
| beats | 3–5 do-it beats per stage (≈24 total) | **2–4 core + a VISIBLE ☆** | 4–6 core + a hidden ☆ |
| grading | end state per beat + the tour `doIt` / `entry`+`commit` step types (`index.html:32177–32190`) | end state, any route | end state, any route |
| replayable | yes, from the ? sheet (beside "↻ replay the tour", `index.html:28940`) | yes, it is a drill | yes |
| counts as a drill | **no** (nothing in the marketing count changes because of it) | **yes** — 74 → 78 (D3) | yes |

### 1.3 Why this, and not v1 (the rationale — do not re-derive it)

Wolf's question offered two options. Both single answers are wrong, for reasons that are worth writing
down because a build agent will otherwise re-litigate them:

- **One robust tutorial drill alone leaves the cliff.** If the Tour is the whole answer, drill 2 is
  still `filldr` at par 44 with seven beats assuming the entire grammar. A player who has just watched
  and done the grammar once, untimed, has *seen* it — they have not *rehearsed* it under a clock. The
  teaching lands and the reps never happen.
- **Ten lesson drills alone (v1) over-builds and over-cascades.** It costs about four sessions, forces
  a chapter rename with a new group, a new campaign chapter id, `HK_TRACKS` + `migrate-certificates.sql`
  edits in the same PR (the r359 drift rule), achievement string re-targeting, milestone renumbering,
  nine new SEO pages, and a marketing-count exception. It also dilutes: five of the ten lessons
  (`numfmt`, `fonts`, `alignrule`, and half of `entry`/`clipboard`) are the SAME idea — "Alt opens the
  ribbon and the letters walk it" — split across five 20-second boards.
- **The split that works: teaching where teaching belongs, reps where reps belong.** The product's
  identity is *short, timed, replayable drills* — a four-minute untimed walk cannot be one of those
  without breaking par, medals, leaderboards and PB all at once. So the Tour is deliberately **not a
  drill**: it is a board that lives outside the catalog exactly as the warm-up sandbox does today, and
  it takes over all six of the modal tour's Excel beats plus the sandbox's job. The four lesson drills
  then rehearse the four things a novice cannot fake their way past in `filldr` — **selection,
  a first formula, an anchored fill, and one pass of ribbon dress** — each under a clock, each with a
  visible ☆ naming the fast route.
- **The existing six become the graduation, unmoved.** `filldr · pastes · blocksel · rowops · editfix ·
  modeltour★` do not change by one beat, one par, or one group. The seam becomes a hand-off instead of
  a cliff: after the Tour and four short reps, `filldr` is the first real task, which is what it has
  always been good at.
- **Build cost:** Tour ≈ one session · four lesson drills ≈ one session · assembly ≈ half a session.
  Against v1's ~four sessions, for the same first-session outcome.

### 1.4 The Keyboard Tour — what it is

`keyboardtour` is **one board with six stages**, revealed one at a time. It is untimed, replayable, and
carries a one-time **+25 xp** bounty on first completion (T1). It replaces:

- the modal tour's Excel-teaching beats (`TOUR_STEPS[0..6]`, `index.html:32177–32191`), and
- the warm-up sandbox entirely (`startSandbox` `index.html:31670`, `sandboxReadyCard` `:31699`,
  `sandboxCallout` `:31708`, `exitSandbox` `:31719`) (T2).

The product beats of the modal tour (checklist, drillbar, hints/F1, profile, ghost, themes, auth —
`TOUR_STEPS[7..13]`, `index.html:32192–32201`) are **not** replaced; they FOLD INTO the Tour at the
moment they first become true (§3.0.6), and whatever does not fold stays as a short product tour for
players who skip the Tour.

**Staging.** Stage N+1's region of the board is parked (dim fill + a "▸ unlocks" label) until every one
of stage N's beats grades, then paints in live. This is DEPTH_PASS §2.5, and it is **already built** —
see §3.0.4. If for any reason the tier machinery cannot be used, §3.0.4 also specs the fallback (all six
regions pre-drawn dim, painted in by a stage-local repaint) so the build never blocks on it.

**The flow is different from a drill's, on purpose.** A drill states an outcome and lets the player
struggle. The Tour states the NEXT KEYSTROKE, on screen, all the time — a **TUTORIAL HUD** banner over
the grid, a spotlight ring on the target cell, and a nudge line after three wrong keys. That is the
whole point of the surface and it is specced in full at **§3.0.2**; build it before any stage.

**Hints and rails are OFF throughout.** The stage cards and the HUD ARE the help. Do not turn on `guided` for the
Tour; do not show the F1 ladder. (`guided=false` is what `startSandbox` does today, `index.html:31689`.)

### 1.5 The lesson card (the one new teaching surface, shared by the Tour and the lesson drills)

On a **lesson drill**, the card renders before the r450 start gate on first load (and on demand from
the ? sheet or a `lesson` button on the drillbar): a single card over the dimmed board —

```
  LESSON 2 of 4 · YOUR FIRST FORMULAS
  A formula starts with = or +. While you type it, the arrow keys POINT at cells
  instead of moving — watch the reference appear. Alt+= writes a SUM for you.
  Fill a formula down and its row references move with it.
      =        +        ←↑→↓ (point)        alt+=        ctrl+d
  [press any key to start]                       don't show lessons · F1 hints on
```

On the **Tour**, the same card component renders once per stage (six times), captioned
`STAGE 3 of 6 · ENTER & EDIT`, with no start gate and no clock behind it.

Rules (binding, invariant-checked in §7):
- ≤ **60 words** of body.
- A **keycap strip** of the chords the lesson teaches. This is the ONE place chords appear as teaching
  text outside the hint ladder — the Copy Law's ban on chords in check labels and picker copy is
  untouched (DEPTH_PASS §1.7 R7).
- On a lesson drill, **"press any key" IS the start gate**: the card and the gate are one surface, one
  keypress starts the clock (r450's honest-t=0 law; the gate is `hkGateArm()` `index.html:24067`,
  armed from `loadChallenge` at `index.html:30655`).
- Dismissable forever with one toggle (`hk_lessons_off`), re-openable from the ? sheet.
- The card is **data**: `lesson:{title, body, keys:[…]}` on the `CHALLENGES` entry (`CHALLENGES` opens
  at `index.html:2277`). The engine renders it when `CHALLENGES[k].lesson` exists — a **per-drill**
  test, not a group test (§2(a)).

**Hints default ON** on a lesson drill's first attempt (`hints=true`, NOT guided — no rails; the cursor
is free). F1 turns them off and the choice sticks per drill (`hk_hints_seen_<key>`). A run with hints on
still posts (the PB rule is no mouse, no guided — unchanged).

### 1.6 The visible ☆ (the lesson-drill exception to the mystery slot)

DEPTH_PASS §1.0(d) makes the ☆ a hidden efficiency discovery; the results-card reveal lives at
`index.html:24976`. On a lesson drill the efficiency IS the lesson, so hiding it hides the teaching.
Lesson ☆s render with their label from load ("☆ Select the whole column in one press") —
`bonus:true, reveal:true`. The results card treats it exactly as today. `reveal:true` is legal ONLY on
a lesson drill (invariant, §7). `navigation`'s ☆ (zero wall bumps) stays hidden — it is a *game* bonus,
not a taught efficiency, and it is the recorded exception. **D4 — Wolf decides.**

### 1.7 Onboarding after this ships

| today | v2 |
|---|---|
| `showComfort` "how much Excel?" (`index.html:32121`) | **stays**, sharper consequence: "basically none" → **Keyboard Tour** → `navigation`; "I get around" → offered the Tour, one line, skippable → `navigation`; "I live in it" → straight to the picker, the Tour listed on the ? sheet |
| `startSandbox` warm-up (`index.html:31670`) | **retired** — the Tour is the warm-up (T2) |
| `startOnboardBoard` + `TOUR_STEPS[0..6]` novice/chord beats (`index.html:32149`, `:32176`) | **retired into the Tour's stages 1–4** |
| `TOUR_STEPS[7..13]` product beats | fold into the Tour where they naturally appear (§3.0.6); what is left stays as a short product tour for the skip path |
| `startGuidedIntro` / `introRibbonPeek` (`index.html:31734`, `:31745`) | `introRibbonPeek`'s content becomes Tour stage 5, live and hands-on instead of a demo |
| `e2e-audit-onboard.js` (64 assertions) · `e2e-onboard-sandbox.js` | rewritten around the Tour · retired |

### 1.8 Progression, gates, capstone — all unchanged

- The group stays **`Foundations`**. The campaign chapter stays **`c1`** with badge 🎓 and xp 150.
  `capstone:'modeltour'` stays (`drills.js:250`). `cap_c1` "Toured the model" keeps its target.
- `HOTKEY_CAMPAIGN.chapters[0].keys` (`['navigation','blocksel','filldr','pastes']`) — **do not touch**.
  The pace gate keys are a sample, not the group; adding four drills to the group does not require
  adding them to the milestone.
- Achievements reading `'Foundations'` (`x_found`, `grp1`, `nav2`) re-target automatically because they
  read `c.groups` — **no string edits, no id changes.**
- **Free play is never blocked** (research 3 do-not-copy #2, standing law): every drill stays openable
  from the picker. The Tour is a recommendation, never a wall (**D5**).

---

## 2 · Amendments to `dev/DEPTH_PASS.md` (add as §1.0-R5 THE LESSON LAW, r451)

Written so the wave agents inherit them without re-deriving. **Note the change from v1:** because
Foundations is now a MIXED group (four lesson drills + six desk drills), the tutorial flag is
**per-drill meta**, not a group flag.

- **(a) `lesson` is per-drill.** A drill whose `CHALLENGES[k]` carries a `lesson:{title, body, keys}`
  object is a **lesson drill**. `drills.js` `meta[k].lesson = true` mirrors it for the picker badge and
  for CI (the invariant asserts the two agree). There is NO `tutorial:true` group flag and no
  `hkTutorialGroup()` helper; the single helper is `hkLessonKey(k)` → `!!(CHALLENGES[k]&&CHALLENGES[k].lesson)`.
- **(b) Beat floor.** §1.1's 4–6-beat floor does not apply to a lesson drill: **2–4 core beats + exactly
  one ☆**. §1.4 clocks: **pass ×2.0 · pro ×1.3 · legendary ×1.0** via `HOTKEY_CLOCKS`. Everything else
  in §1 (randomization ≥2 axes, 20-row density, semantic labels, closed verbs, save closer, alt-path
  minimums, index-paired hint ladder) binds unchanged.
- **(c) Card contract.** `lesson.body` ≤ 60 words; `lesson.keys` ⊆ the chords the drill's `req` names.
  The lesson card is the only teaching text allowed to print chords outside `req`/`guide`.
- **(d) Visible ☆.** Lesson ☆s are `reveal:true` (label visible from load). Content law unchanged: the
  ☆ is the efficient route, never formatting. `navigation`'s game ☆ is the recorded exception, and
  `navigation` is NOT a lesson drill (no `lesson` object; it gains nothing but a picker note).
- **(e) Hints** default ON on the first attempt of a lesson drill; rails never default on.
- **(f) One idea.** A lesson drill teaches ONE idea (its card title) and every beat exercises that idea
  or one already taught by the Tour. A beat needing an idea from a LATER lesson is a spec bug.
- **(g) The Tour is not a drill.** `keyboardtour` is excluded from `menuOrder`, `HOTKEY_PARS`,
  `HOTKEY_CLOCKS`, `HOTKEY_CHALLENGE_POOL`, `HK_PLACEMENT`, `HK_TRACKS`, `HOTKEY_CAMPAIGN`,
  leaderboards, PB, and the marketing count. It is reachable from exactly two places: the onboarding
  flow and the ? sheet.
- **(h) Marketing count.** The four lesson drills COUNT. "74 banker-grade drills" → **"78 banker-grade
  drills"**. v1's `tutorial:true` count exclusion is **dropped**. **D3 — Wolf decides.**

---

## 3 · Per-drill pages

Page grammar for the lesson drills: **Board** · **Lesson card** · **Beats** (core, then ☆) · **Random** ·
**Aha** · **Par** (estimate — sweep at build) · **Engine** · **Alts** (≥2, one is the ☆-forfeit control).
All boards: 20 rows × A–J, title row `codename() + ' — <artifact>'`, pre-dressed unless the lesson IS
the dress, helper cells yellow + bordered where used (§1.0-R2(l)), Ctrl+S closer engine-appended.

Beat labels obey DEPTH_PASS §1.7: **imperative verb first, from the closed 42-verb list**; semantic
reference to a labeled board item; no chord names; ≤ ~12 words after the verb.

---

### 3.0 `keyboardtour` — THE KEYBOARD TOUR (six stages, one board, untimed)

#### 3.0.1 The board (one page, 20 rows × A–J, built once at Tour start)

Fixed content, no randomization (this is a lesson, not a rep — the player should be able to replay it
and recognize it):

| where | content | revealed at |
|---|---|---|
| `A1` | `Keyboard Tour — Meridian Foods, FY sales` (title, bold) | stage 1 |
| `A3:E3` | `Region · Q1 · Q2 · Q3 · Q4` (bold, bottom border) | stage 1 |
| `A4:E11` | eight regions × four quarters, comma format, 0 dp (North, South, East, West, Midwest, Northeast, Southeast, Mountain) | stage 1 |
| `G3:I6` | memo block `WHAT TO SELECT` + four lines naming this stage's targets | stage 2 |
| `A13:D13` | `Team · Head · Rate · Cost` (bold, bottom border) | stage 3 |
| `A14:D16` | three roster rows; `A15` carries the typo `Marketng`; `A16` is the row labeled `DUPLICATE — delete` | stage 3 |
| `F3` | `FY` header (bold, bottom border) | stage 4 |
| `A12` | `Total` label (bold) | stage 4 |
| `G8:I11` | memo block `HOUSE STYLE` — four dress rules, one per stage-5 beat | stage 5 |
| `A18` | `Saved. That was the whole grammar.` (italic, gray) | stage 6 |

Density: 13 of 20 rows carry content once stage 4 opens — inside §1.3's ≥60% rule even though the Tour
is exempt from it by construction.

#### 3.0.2 THE TUTORIAL HUD — the Tour's distinguishing mechanic

_Wolf, 2026-09-03, on what makes the Tour different from a drill: "one kind of long tutorial lesson
which has a different general flow — it holds the user's hand more, shows text hints kind of on a
screen overlay so it's even more clear what to do, like how a pixel-art game walks you through the
controls." This is the Tour's flow. A drill states an outcome and lets you struggle (DEPTH_PASS
§1.0(b)); the Tour states the NEXT KEYSTROKE and waits for it. Build the HUD first — every stage below
is written against it._

**(1) The banner.** A persistent overlay strip, `#tourHud`, bottom-center, floating over the grid
(`position:fixed`, centered, `max-width:640px`, one line of text + a keycap strip, `z-index` above the
grid and below `#tourWrap`). It carries the CURRENT instruction in one line, with the keycap(s) to
press:

```
        Hold  ctrl  and press  →   to jump to the end of the row
```

- It **updates per do-it beat** — one beat, one line, never a queue.
- It **pulses once** when the beat clears (a 400 ms accent flash), then swaps to the next beat's line.
- It is the **ONLY instruction surface during the Tour.** The checklist panel (`#checklist`,
  `updateChecklist` `index.html:25961` (markup `index.html:2058`)) stays **hidden** until stage 1's third beat, at which point the
  product-tour "your checklist" callout fires (§3.0.6) and the panel appears showing **only the current
  stage's beats** — the parked stages' beats never render.
- **It must never cover the active cell.** Measure the active cell's client rect each render; if it
  intersects the HUD's rect, flip the HUD to top-center for that beat (one boolean, no animation).
  The same rule applies to the target region when a beat has one.

**(2) The target spotlight.** The cell or region the beat wants is outlined and pulsed on the grid.
**This machinery already exists and the Tour gets it for free by declaring `targets`:**
`currentTargetRange()` (`index.html:23015`) returns the range of the FIRST ungraded, non-bonus beat and
latches it across mid-gesture renders (the r423 gesture latch); the render branch at
`index.html:23272` tags those cells `.ttarget` with perimeter classes `gt-t/b/l/r`; the fill is CSS at
`index.html:441`. Add a Tour-only pulse to `.ttarget` rather than a new class.
For the **stage title cards between stages**, reuse the modal tour's scrim + ring: markup
`#tourWrap` / `#tourRing` / `#tourCard` at `index.html:2110–2112`, driven by `tourShow(i)` at
`index.html:32240` (ring positioning `index.html:32263–32290`, `w.classList.toggle('lite', …)` at
`index.html:32264` — the "interactive steps un-dim the sheet" behavior the Tour wants for every beat).
When a beat is a chord with **no target on the grid** (Ctrl+S, Ctrl+Home, Ctrl+Z), `targets[i]` returns
`null`, no ring paints, and **the HUD alone carries the beat**. That is by design, not a gap.

**(3) Wrong-key nudges.** Count consecutive keystrokes that are neither the beat's key nor a
navigation key. On the **third** miss, the HUD adds a SECOND line — the same instruction, decomposed:

```
        Hold  ctrl  and press  →   to jump to the end of the row
        try ctrl+→ — hold ctrl down first, then tap the arrow
```

- The counter (`S._hudMiss`) resets to zero on a correct key and on beat completion.
- The nudge **never blocks input.** No modal, no rails, no key swallowing. The player can do anything
  they like; the HUD just gets more explicit.
- After a further three misses the nudge line stays as-is — it never escalates to a third line and
  never auto-advances the beat.

**(4) Stage cards.** The six lesson cards of §1.5 render between stages, over the dimmed board, with
the stage title, the ≤60-word body and the keycap strip. Any key dismisses. The final stage's
completion renders the hand-off card (§3.0.5, stage 6). These are the only modals in the Tour.

**(5) Register — pixel-game, not prose.** Every HUD line: short, imperative, present tense, ONE keycap
strip, no paragraph, no second sentence (the nudge line is the only exception and it is one clause).
Target ≤ 10 words of text around the keycaps. House voice: lowercase confidence, no exclamation marks.
The exact HUD string for all 24 beats is given inline in §3.0.5 — a build agent copies them, it does
not write them.

**(6) Reduced motion.** Wrap the HUD pulse and the `.ttarget` pulse in
`@media (prefers-reduced-motion: no-preference)`, with a `reduce` branch that keeps the state change as
a static opacity/border step. Follow the existing precedents at `index.html:346` (gate card),
`index.html:358` (maze nudge) and `index.html:449` (ghost cursor).

**(7) Test.** `dev/e2e-audit-onboard.js` (rewritten, §5) asserts **the HUD's text per beat**: for each
of the 24 beats, drive the beat's keys and assert `#tourHud` reads the expected string before the beat
and the next beat's string after it. Also assert: the HUD never overlaps the active cell's rect; the
checklist is absent before stage 1 beat 3 and shows only the open stage's beats after; three wrong keys
produce the second line and a correct key clears it.

#### 3.0.3 How a stage completes

Each stage owns 3–5 **do-it beats**. A beat grades one of two ways, both already in the engine:

1. **End-state check** — the same `checks(S)` predicate shape every drill uses. The Tour's `checks(S)`
   returns ALL ~24 beats; the checklist shows only the open stage's slice (the parked stages' beats
   render dim, exactly as a parked tier region does).
2. **Keystroke gate** — the modal tour's existing step types, reused verbatim:
   `doIt:{key:'ArrowRight', ctrl:true}` (`index.html:32188`) and `entry:true` + `commit:(c)=>!!c.formula`
   (`index.html:32185`). Use these for beats where the END STATE cannot distinguish the taught move
   (e.g. "Move to the end of the row" — arrows and Ctrl+→ land on the same cell).

A stage's card dismisses on any key; the stage's beats then run live on the board with no overlay.

#### 3.0.4 Engine — what is already built (verified 2026-09-03, `main` @ r450)

**DEPTH_PASS §2.5 (origami tier ladder) IS BUILT.** It shipped in r421 and **no drill currently
declares `tiers:`** — the platform piece exists and is unused. The Tour is its first consumer.

| piece | where |
|---|---|
| declaration hook — `build()` may return `tiers:[{checks:[i,…], reveal:{ref:cell,…}, label:'…'}]` | doc comment `index.html:24198`; `hkTiersInit(built)` `index.html:24394` |
| wired into every board load | `index.html:30612` (`loadChallenge`) |
| the ladder opens **in order** when a tier's listed check indices are all `ok`, writes its `reveal` cells, grows `S.ROWS`, recalcs, re-fences rails, dings | `hkTierTick(items)` `index.html:24404`, called from `updateChecklist` at `index.html:25968` |
| parked-region painting + the one-shot reveal flash | `hkParkedAt(r,c)` `index.html:24423`; render branch `index.html:23368–23371`; flash consumed `index.html:23430`; CSS `#grid td.revealed` `index.html:384` |
| rails fence to the active tier | `index.html:24417` and `railZoneCompute` parked filter `index.html:25500` (`railZoneCompute` at `index.html:25490`) |

Also already built and reusable: **§2.6 touch-lists** (`hkTouchInit` `index.html:24368`, `S.touchGot`
`:24371`/`:24382`, wired `:30611`) and **§2.7 mistakes-replay** (`hkMicroOffer` `index.html:24434`,
results-card button `index.html:25025`). The Tour uses neither, but a lesson drill may use touch-lists
for a counter beat if it wants one.

**Fallback path (spec it, do not build it unless the tier route fails):** if `tiers:` cannot be used —
the only realistic reason is that the Tour is driven outside `updateChecklist`, which is where
`hkTierTick` is called — pre-draw all six regions at load with `{fontColor:'gray', dim:true}` and repaint
the stage's region to live styling in the stage-completion handler. Same visual, more code. Prefer
tiers; they already do the reveal flash, the rails re-fence and the ding for free.

**How the Tour hangs off the engine without becoming a drill (exact wiring):**

1. Add `CHALLENGES.keyboardtour = {…}` (`CHALLENGES` opens at `index.html:2277`) with `build()`,
   `checks(S)`, `stages:[…]` (the six cards), and **no** `par`, `parKeys`, `demo`, `req`, `guide`.
2. Do **not** add `keyboardtour` to `drills.js` `groups` — it stays out of `menuOrder`. This is safe:
   `drillLocked(k)` returns `null` for a key with no `GROUP_OF` entry (`index.html:30422`), and
   `drillPaywalled(k)` returns `null` while `HOTKEY_PREMIUM.enabled` is false (`index.html:30430`).
3. Add a module-scope `let tourMode=false;` beside `let sandboxMode=false;` (`index.html:31668`).
4. **`checkWin` must never fire for the Tour.** Add `tourMode` to the existing bail at
   `index.html:24540` (`if(done||demoPlaying||sandboxMode||echoOn||microPrefill) return;`). This one
   edit removes the clock stop, the results card, PB, ghost, streak, campaign xp, band xp and
   `recordRun` in a single place — verify against the win body at `index.html:24539–24700`.
5. **Do NOT set `sandboxMode` for the Tour.** `updateChecklist` early-returns on `sandboxMode`
   (`index.html:25963`), which would kill both the checklist and `hkTierTick`. `tourMode` must be a
   distinct flag that `updateChecklist` ignores.
6. **No clock, no gate.** Clear the start gate at Tour start exactly as the sandbox does today —
   `try{ hkGateClear(); }catch(e){}` with the r450 rationale comment at **`index.html:31684`**
   ("the warm-up sandbox is never timed — a start gate over it would promise a clock that
   `startClock()` refuses to run"). Copy that comment, re-pointed at the Tour. `hkGateClear` itself is
   `index.html:24084`. Set `$('timer').textContent='—'` and `$('par')/$('keyPar')/$('pb')` to `'—'`
   (the sandbox does this at `index.html:31691–31692`).
7. **Completion.** When the last stage's beats all grade, render the hand-off card (§3.0.5 stage 6),
   pay the one-time +25 xp via the `hk_xp_est` + `hkStatePush` pattern used for the ☆ bounty
   (`index.html:24562–24567`), latch `hk_tour_done_v2`, and load `navigation`.
8. **Entry points.** `startKeyboardTour()` replaces `startSandbox` as `obStart`'s handler
   (`index.html:31652`) and as the "basically none" destination from `showComfort` (`index.html:32121`).
   The ? sheet's `↻ replay the tour` link (`index.html:28940`, wired `:28943`) gains a sibling
   `▶ the keyboard tour`.

#### 3.0.5 The six stages

Format per stage: **card title** · **card body** (≤60 words, the §1.5 lesson card) · **keycaps** ·
**beats**. Every beat carries three exact strings a build agent copies verbatim:

- **label** — the checklist line. Closed verb first (DEPTH_PASS §1.7), semantic reference, **no chords**.
- **HUD** — the §3.0.2 banner line. Lowercase, imperative, chords allowed and expected.
- **nudge** — the second HUD line after three wrong keys. Single-key beats use
  `press <key> — nothing else is needed`.

and one **gate**: an end-state predicate, or a `doIt` / `entry`+`commit` step type (§3.0.3).

---

**STAGE 1 · MOVE — the keyboard flies**

> Every cell has an address. The highlighted box is where you stand. Arrows walk one cell. Add Ctrl and
> you fly to the edge of the data in one press. Ctrl+Home goes to the top-left of the sheet; Ctrl+End
> goes to the last cell holding anything. Watch the name box as you move.

Keycaps: `←↑→↓` · `ctrl+←↑→↓` · `ctrl+home` · `ctrl+end`

| # | label | HUD | nudge | gate |
|---|---|---|---|---|
| 1 | Move to the Q4 figure on the North line | `press → until you reach the Q4 figure` | `press → — nothing else is needed` | end state on `S.active` |
| 2 | Move to the end of the North line in one press | `hold ctrl and press → to fly to the end of the row` | `try ctrl+→ — hold ctrl down first, then tap the arrow` | `doIt:{key:'ArrowRight',ctrl:true}` |
| 3 | Move to the last region on the table in one press | `hold ctrl and press ↓ to fly to the last region` | `try ctrl+↓ — hold ctrl down first, then tap the arrow` | `doIt:{key:'ArrowDown',ctrl:true}` |
| 4 | Move to the top-left of the sheet | `press ctrl+home — top-left of the sheet, from anywhere` | `try ctrl+home — hold ctrl, then home` | `doIt:{key:'Home',ctrl:true}` |
| 5 | Move to the last cell that holds anything | `press ctrl+end — the last cell holding anything` | `try ctrl+end — hold ctrl, then end` | `doIt:{key:'End',ctrl:true}` |

Reveal on completion: the `WHAT TO SELECT` memo, `G3:I6`. Beat 3 also fires the "your checklist"
product callout (§3.0.6) — the checklist panel appears here and nowhere earlier.

---

**STAGE 2 · SELECT — Shift stretches, Ctrl+Shift stretches to the edge**

> A selection is a rectangle you grow from where you stand. Hold Shift and the arrows stretch it. Add
> Ctrl and it stretches to the edge of the data in one press. Shift+Space takes the whole row,
> Ctrl+Space the whole column, Ctrl+A the whole block you are standing in.

Keycaps: `shift+←↑→↓` · `ctrl+shift+←↑→↓` · `shift+space` · `ctrl+space` · `ctrl+a`

| # | label | HUD | nudge | gate |
|---|---|---|---|---|
| 1 | Select the four quarters on the West line | `hold shift and press → to stretch the selection` | `try shift+→ — hold shift down, then tap the arrow` | end state on `S.sel` |
| 2 | Select the Q3 column for every region | `hold ctrl+shift and press ↓ to stretch to the edge` | `try ctrl+shift+↓ — hold both, then tap the arrow` | end state on `S.sel` |
| 3 | Select the whole West row | `press shift+space — the whole row, one press` | `try shift+space — hold shift, then the spacebar` | `doIt:{key:' ',shift:true}` |
| 4 | Select the whole table in one press | `press ctrl+a — the whole block you are standing in` | `try ctrl+a — hold ctrl, then a` | `doIt:{key:'a',ctrl:true}` (Ctrl+Shift+8 also accepted) |

Reveal on completion: the roster block, `A13:D16`.

---

**STAGE 3 · ENTER & EDIT — type replaces, F2 edits inside**

> Typing replaces what is in a cell. Enter commits and moves down, Tab commits right, Esc backs out.
> F2 edits inside the cell instead of retyping it. Delete clears. Ctrl+Z undoes, Ctrl+Y redoes.
> Ctrl+plus inserts a row, Ctrl+minus deletes one.

Keycaps: `↵` · `tab` · `esc` · `F2` · `delete` · `ctrl+z` · `ctrl+shift+=` · `ctrl+−`

| # | label | HUD | nudge | gate |
|---|---|---|---|---|
| 1 | Enter the new team's headcount and rate on the marked line | `type the number, then press tab to commit and move right` | `press tab — nothing else is needed` | `entry:true` + `commit:(c)=>typeof c.value==='number'`, then end state on both cells |
| 2 | Fix the misspelled team name in place | `press F2 to edit inside the cell — do not retype it` | `press F2 — nothing else is needed` | `doIt:{key:'F2'}` then end state on the corrected string |
| 3 | Delete the row marked DUPLICATE | `press ctrl+− to delete the whole row` | `try ctrl+− — hold ctrl, then the minus key` | end state: the roster closes up |
| 4 | Undo the deletion | `press ctrl+z — undo puts it straight back` | `try ctrl+z — hold ctrl, then z` | `doIt:{key:'z',ctrl:true}` |
| 5 | Insert a blank line above the total line | `press ctrl+shift+= to insert a row` | `try ctrl+shift+= — hold both, then the equals key` | `doIt:{key:'=',ctrl:true,shift:true}` |

Reveal on completion: the `FY` header `F3` and the `Total` label `A12`.

---

**STAGE 4 · FORMULAS — a formula points at cells**

> A formula starts with = or +. While you type it, the arrow keys POINT at cells instead of moving —
> watch the reference appear in the bar. Alt+= writes a SUM for you. Ctrl+D fills the cell above down,
> Ctrl+R fills the cell on the left across. F4 puts $ on a reference so it stays put when you fill.

Keycaps: `=` · `+` · `←↑→↓ (point)` · `alt+=` · `ctrl+d` · `ctrl+r` · `F4`

| # | label | HUD | nudge | gate |
|---|---|---|---|---|
| 1 | Total the North line into the FY column | `type = then point with the arrows, ↵ to commit` | `press = first — then the arrows point instead of moving` | `entry:true` + `commit:(c)=>!!c.formula`, then end state on the value |
| 2 | Fill the FY column down for every region | `press ctrl+d to fill the formula down the column` | `try ctrl+d — select down first, then hold ctrl and press d` | end state on all eight FY cells |
| 3 | Total each quarter on the Total line | `select the row and press alt+= — the sum writes itself` | `try alt+= — hold alt, then the equals key` | end state on `A12:E12` |
| 4 | Build the FY total | `press alt+= once more for the grand total` | `try alt+= — hold alt, then the equals key` | end state on `F12` |

Reveal on completion: the `HOUSE STYLE` memo, `G8:I11`.

---

**STAGE 5 · THE RIBBON — Alt opens it, the letters walk it**

*This is the "how the ribbon works" lesson Wolf named. The ribbon overlay MUST be visible while this
stage teaches (T3).* The overlay is `#ribbon` inside `#ribbonSlot` (`index.html:2037`), drawn by
`drawRibbon()` (`index.html:23722` → `__drawRibbon()` `index.html:23790`); the always-on lean bar is
`ribbonBarOn()` (`index.html:23733`, backed by `hk_ribbon_bar`), and `__leanRibbonHtml()`
(`index.html:23742`) renders the KeyTip chips. **Stage 5 forces the lean bar ON for the duration of the
stage** (set `hk_ribbon_bar='1'` if unset, call `drawRibbon()`, restore the player's prior value at Tour
end) so the letters the card names are on screen while they are pressed. `introRibbonPeek()`
(`index.html:31745`) is the demo version of this and is retired into it. The HUD sits BELOW the ribbon
bar, never over it.

> Alt opens the ribbon and the letters walk it — Alt H is Home, then one more letter picks the command.
> Alt H 9 removes a decimal, Alt H 0 adds one. Ctrl+Shift+1 comma, +4 dollar, +5 percent. Alt H F C
> picks a font color — blue means a number you typed. Alt H A L/C/R aligns. Alt H B T rules a total.
> Alt H O I autofits.

Keycaps: `alt` · `alt h 9 / 0` · `ctrl+shift+1/4/5` · `alt h f c` · `ctrl+b` · `alt h a l/c/r` ·
`alt h b t` · `alt h b s` · `alt h o i`

| # | label | HUD | nudge | gate |
|---|---|---|---|---|
| 1 | Comma-format the figure block — no decimals | `press ctrl+shift+1 — comma format, no decimals` | `try ctrl+shift+1 — hold both, then the 1 above the letters` | end state on `B4:E11` |
| 2 | Color the typed figures blue | `press alt h f c, then pick blue — typed numbers are blue` | `press alt first — the ribbon opens and the letters light up` | end state on `fontColor` |
| 3 | Bold the region headers | `press ctrl+b to bold the header row` | `try ctrl+b — hold ctrl, then b` | end state on `bold` |
| 4 | Center the period headers over their columns | `press alt h a c to center the headers` | `press alt, then h, then a, then c — one letter at a time` | end state on `align` |
| 5 | Add a top border above the Total line | `press alt h b t — a line above every total` | `press alt, then h, then b, then t — one letter at a time` | end state on the border |

Reveal on completion: nothing new (stage 6 reveals `A18` after the save).

---

**STAGE 6 · SAVE — and the hand-off**

> One last thing: Ctrl+S. Every drill on this site ends with a save, the way every real file does.
> That was the whole grammar — move, select, enter, calculate, dress, save. Drill one is the corridor:
> pure movement, against a clock.

Keycaps: `ctrl+s`

| # | label | HUD | nudge | gate |
|---|---|---|---|---|
| 1 | Finish the page — save it | `press ctrl+s — every drill ends with a save` | `try ctrl+s — hold ctrl, then s` | `doIt:{key:'s',ctrl:true}` |

This beat has **no target on the grid** — `targets[23]` returns `null`, no ring paints, and the HUD
alone carries it (§3.0.2(2)).

On completion: reveal `A18` (`Saved. That was the whole grammar.`), pay +25 xp once, hide the HUD, and
show the hand-off card:

```
  THE KEYBOARD TOUR — done
  move · select · enter · calculate · dress · save. that is the whole grammar,
  and every drill from here is a page built out of it.
  next: the corridor — pure movement, against a clock.
  [↵ start drill 1]                                   replay this tour from ?
```

Then `loadChallenge('navigation')`.

#### 3.0.6 Where the product-tour beats fold in

Each of these is a one-line callout on the named stage's card footer or a spotlight ring on first
appearance — NOT a separate modal beat. Whatever does not fold stays in `TOUR_STEPS` for the skip path.

| beat (today) | folds into |
|---|---|
| `.cl-inner` "your checklist" (`index.html:32192`) | stage 1, the moment the first beat renders |
| `.drillbar` "moving around" (`:32193`) | stage 6 hand-off card |
| `#hintsToggle` "stuck?" (`:32194`) | stage 4 (the first stage where a player can genuinely stall) |
| `#navThemes` "make it yours" (`:32197`) | **stays** in the product tour |
| `#profileToggle`, `#ghostToggle` (`:32195`, `:32196`) | **stay** (both are `optional:true` already) |
| `#authSlot` signed-out / signed-in (`:32198`, `:32200`) | **stays** — it runs after the Tour, on the results of drill 1 |

---

### 3.1 `select` — "Select" · name `Select` · label `Select the blocks` · tab `Select`

**Board:** a regional sales table (Region × Q1–Q4 + FY, 8 regions), pre-dressed, at a randomized anchor
(3-spot pool). A memo block to the right names four things to select, one per beat, in THIS seed's
words ("the West row", "the Q3 column", "the whole table", "the FY figures").

**Lesson card:** *Select* — "Hold Shift and the arrows stretch a selection from where you stand. Add
Ctrl and it stretches to the edge of the data. Shift+Space takes the row, Ctrl+Space the column,
Ctrl+A the whole block."
keys: `shift+arrows` · `ctrl+shift+arrows` · `shift+space` · `ctrl+space` · `ctrl+a`

**Beats** (graded on `S.sel` at commit — the player presses Enter or any non-selection key to lodge a
selection; the engine's existing selection latches handle it):
1. Select the {West} row of figures — Q1 through FY
2. Select the {Q3} column of figures — every region
3. Select the whole table — headers and figures
4. Select the FY figures for every region

☆ (visible): Select the whole table in one press

**Random:** anchor (3 spots) · which row/column the memo names (pools) · values. **Aha:** "a selection
is a rectangle you grow from where you stand — ctrl+shift grows it to the edge." **Par:** ~14 s / ~12
keys. **Engine:** nothing new — `selOps` telemetry (r429) already records chord-vs-arrow selection for
the ☆. **Alts:** (1) arrow-by-arrow Shift selection on every beat (☆ forfeited, core clears);
(2) Ctrl+Space / Shift+Space route for beats 1–2.

---

### 3.2 `firstsum` — "Your first formulas" · name `First Sums` · label `Your first formulas` · tab `Sums`

**Board:** a five-line divisional P&L (Revenue · COGS · Gross profit · Opex · EBITDA) × Q1–Q4; Gross
profit and EBITDA rows EMPTY; a Total column empty. Costs negative per convention.

**Lesson card:** *Your first formulas* — "A formula starts with = or +. While you type it the arrow keys
point at cells instead of moving — watch the reference appear. Alt+= writes a SUM for you. Fill a
formula down and its references move with the row."
keys: `=` · `+` · `arrows (point)` · `alt+=` · `ctrl+r`

**Beats:**
1. Build Gross profit for Q1 — Revenue plus the COGS line
2. Fill Gross profit across the other three quarters
3. Build EBITDA for every quarter — Gross profit plus Opex
4. Total each line across the year into the Total column

☆ (visible): Total all five lines in one pass

**Random:** anchor jitter · values (integers) · the label pool for the division name. Two axes minimum.
**Aha:** "a formula points at cells — point with the arrows, and alt+= writes the sum for you."
**Par:** ~24 s. **Engine:** none. **Alts:** (1) typed refs `=B4+B5` with no point mode — core clears;
(2) SUM typed by hand in each total (☆ forfeited).

---

### 3.3 `lockref` — "Lock a reference" · name `Lock` · label `Lock the reference` · tab `Lock`

**Board:** a price grid — Units by product (rows) × region (columns), a single yellow bordered helper
cell `Helper — price per unit`, and an empty Revenue grid of the same shape.

**Lesson card:** *Lock a reference* — "Fill a formula and its references move with it. Put $ on a
reference — F4 does it — and that one stays put. One anchored formula, filled down then right, covers
the whole grid."
keys: `F4` · `$` · `ctrl+d` · `ctrl+r`

**Beats:**
1. Build the top-left Revenue cell — units times the price helper
2. Fill the Revenue grid — every product, every region

☆ (visible): Lock the price with F4 rather than typing the dollar signs

**Random:** helper position (3 spots) · grid size (3×3 or 4×3) · values. **Aha:** "one $ pass, twelve
cells — the lock is where the speed lives." **Par:** ~16 s. **Engine:** F4 telemetry — `cycleAnchor()`
(`index.html:25897`) sets `S.f4Used` for the ☆ predicate (one-line add; the function already owns every
F4 path including the r88 caret fix). **Alts:** (1) typed `$` (☆ forfeited); (2) twelve typed formulas
(core clears — the slow route is legal, Freedom Doctrine).

---

### 3.4 `ribbonpass` — "The ribbon pass" · name `Ribbon` · label `The ribbon pass` · tab `Ribbon`

*New in v2. Merges v1's `numfmt`, `fonts` and `alignrule` into ONE drill: the ribbon is one idea (Alt
opens it, the letters walk it), and three 20-second boards teaching one idea is padding.*

**Board:** a small monthly summary page — a title, a header row (not bold), four labeled lines
(Revenue · Costs · Profit · Margin) × six months, figures raw (`1234567.891`, `0.0834`), a Total line
with no rule above it, and one assumptions cell whose typed input is black. 20 rows, pre-dressed
everywhere the beats do not touch.

**Lesson card:** *The ribbon pass* — "Alt opens the ribbon and the letters walk it: Alt H is Home, then
one more letter is the command. Alt H 9 and Alt H 0 step decimals, Alt H F C picks a font color,
Alt H A L/C/R aligns, Alt H B T rules a total. Ctrl+Shift+5 is percent. Blue means typed."
keys: `alt h 9 / 0` · `ctrl+shift+1/4/5` · `alt h f c` · `ctrl+b` · `alt h a l/c/r` · `alt h b t`

**Beats:**
1. Percent-format the Margin line — one decimal
2. Color the typed assumption blue
3. Center the month headers over their columns
4. Add a top border above the Total line

☆ (visible): Format the whole figure block from one selection

**Random:** which line is the raw-percent line (Margin or a seeded Growth line) · header pool (months vs
quarters) · anchor jitter · values. **Aha:** "alt walks the ribbon — every command on it is three
letters away, and blue means somebody typed it." **Par:** ~24 s. **Engine:** none — `fmtOps`,
`fmtOps.dec`, `fmtOps.align` and the border ops all exist. **Alts:** (1) Ctrl+1 dialog for the number
format and the alignment; (2) beat-by-beat formatting with no block selection (☆ forfeited).

---

### 3.5 v1 → v2: what was dropped, and where its lesson went

| v1 drill | v2 | where the lesson lives now |
|---|---|---|
| `entry` (Enter & edit) | **dropped** | Tour **stage 3**; the timed reps already exist in `editfix` (F2, undo/redo) and `rowops` (insert/delete) |
| `clipboard` (Copy, cut, fill) | **dropped** | Tour **stage 4** (fill) + stage 3 (commit keys); the timed reps already exist in `blocksel` (copy vs cut), `pastes` and `filldr` |
| `numfmt` (Number formats) | **dropped** | Tour **stage 5** + `ribbonpass` beat 1; desk-scale reps stay in `decimals` and `housestyle` |
| `fonts` (Bold, italic, blue) | **dropped** | Tour **stage 5** + `ribbonpass` beat 2; desk reps stay in `typeset` and `combo` |
| `alignrule` (Align, rule, fit) | **dropped** | Tour **stage 5** + `ribbonpass` beats 3–4; desk reps stay in `center`, `ruleoff`, `autofit` |
| `firstpage`★ (capstone) | **dropped** | `modeltour` remains the Foundations capstone, unchanged; the Tour's stage 6 hand-off does the narrative job `firstpage` was invented for |
| `select` · `firstsum` · `lockref` | **kept**, near-verbatim | §3.1 · §3.2 · §3.3 |
| — | **added** | `ribbonpass` (§3.4) |

---

## 4 · Catalog delta table (DEPTH_PASS §3 grammar; keys immutable, renames touch meta only)

| # | delta | type | rationale | plumbing impact |
|---|---|---|---|---|
| **A1** | `keyboardtour` — a staged tutorial board with the TUTORIAL HUD, NOT in `groups`, NOT in `menuOrder` | ADD (non-drill) | §1.4, §3.0.2 | `CHALLENGES` entry + `startKeyboardTour()` + `tourMode` flag + `checkWin` bail (`index.html:24540`); **no** PARS / CLOCKS / TRACKS / CAMPAIGN / POOL / LB / SEO / count impact |
| **A2** *(L1)* | 4 new keys — `select`, `firstsum`, `lockref`, `ribbonpass` — inserted into **Foundations** after `navigation` | ADD ×4 | §3.1–3.4 | `groups[0].keys` · `meta` ×4 (`lesson:true`) · `HOTKEY_PARS` +4 · `HOTKEY_CLOCKS` +4 (pass ×2.0) · LB boards auto (4 new, no migration) · SEO pages +4 (`dev/build-drill-pages.js` + sitemap) · `HK_TRACKS.fluency` picks them up automatically (they are in Foundations) → **`dev/migrate-certificates.sql` arrays must move in the SAME PR** (r359 drift rule) · `e2e-alt-paths.js` +8 alts · `REWORKED` ledger +4 · depth-contract beat-floor exemption via `hkLessonKey` |
| A3 | `HOTKEY_CAMPAIGN.chapters[0]` | **NO CHANGE** | the milestone keys are a sample, not the group | none |
| A4 | group name, `c1` id, `capstone:'modeltour'` | **NO CHANGE** | §1.8 | none — and this is the whole point of v2 |
| A5 | `HOTKEY_CHALLENGE_POOL` | EXCLUDE the four lesson keys | a 14 s board is not a Daily Challenge | pool filter by `hkLessonKey` |
| A6 | `HK_PLACEMENT` | **NO CHANGE** | `navigation` stays the movement board | none |
| A7 | `HOTKEY_PREMIUM.groups` | **NO CHANGE** | Foundations was never paid | invariant re-asserted |
| A8 | `TOUR_STEPS` | REMOVE the Excel beats (indices 0–6, `index.html:32177–32191`); keep the product beats that do not fold (§3.0.6) | §1.7 | `buildTourPlan` (`index.html:32228`) loses its `novice` gate if no novice beats remain — check before deleting the `xlv` read |
| A9 | sandbox | RETIRE `startSandbox` (`:31670`), `sandboxReadyCard` (`:31699`), `sandboxCallout` (`:31708`), `exitSandbox` (`:31719`), `startOnboardBoard` (`:32149`), `sbCell` if unused; `sandboxMode` STAYS (other call sites read it) | §1.7 (T2) | dead code removed, not guarded; `dev/e2e-onboard-sandbox.js` retired |
| A10 | marketing copy | "74 banker-grade drills" → **"78 banker-grade drills"** | D3 | `index.html:7`, `:11`, `:18`; `About.html:14`, `:21`; enterprise/billing copy; `e2e-smoke` drill-count guard |
| A11 | `dev/FOUNDATIONS_SPEC.md` §6 | header note: the four lesson drills are specced here, not there | doc | one paragraph |

**Catalog after: 78 drills** (74 + 4), **8 groups** (unchanged), capstone last in each (unchanged).
`menuOrder.length` remains the only count. The Keyboard Tour is not in it.

**New Foundations order (11):**
`navigation · select · firstsum · lockref · ribbonpass · filldr · pastes · blocksel · rowops · editfix · modeltour★`

---

## 5 · The cascade map — every surface this touches (WORKFLOW §8 propagation sweep)

| surface | change | owner wave |
|---|---|---|
| `drills.js` — `groups[0].keys` (+4), `meta` ×4 with `lesson:true`, `HOTKEY_PARS` +4, `HOTKEY_CLOCKS` +4, `HOTKEY_CHALLENGE_POOL` filter | §4 A2/A5 | assembly |
| `index.html` `CHALLENGES` — 4 new drill entries + `keyboardtour` | §3 | build waves |
| `index.html` engine — **the TUTORIAL HUD (`#tourHud` banner, target spotlight off `currentTargetRange()` `index.html:23015`, wrong-key nudge, reduced-motion branch — §3.0.2)** | §3.0.2 | wave 1 |
| `index.html` engine — lesson card renderer, `hkLessonKey`, `reveal:true` ☆, hints-default, next-lesson line on the results card, `startKeyboardTour()`, `tourMode`, `checkWin` bail (`:24540`), stage-card overlay reusing `#tourWrap`/`#tourCard`/`#tourRing` (`tourShow` `index.html:32240`) | §1.5–1.7, §3.0.4 | wave 1 |
| `index.html` — **retire** `startSandbox` `:31670` / `sandboxReadyCard` `:31699` / `sandboxCallout` `:31708` / `exitSandbox` `:31719` / `startOnboardBoard` `:32149`; re-point `obStart` `:31652` and `showComfort` `:32121`; `dismissLanding` tour hand-off `:31600–31621` | §1.7 (T2) | wave 1 |
| `index.html` — `TOUR_STEPS` trimmed to the product beats that do not fold (§3.0.6); `buildTourPlan` `:32228` re-checked | A8 | wave 1 |
| `index.html` — ? sheet gains `▶ the keyboard tour` beside `↻ replay the tour` (`:28940`, wired `:28943`) | §3.0.4(8) | wave 1 |
| `dev/check-invariants.js` | §7 | wave 1 |
| `dev/e2e-audit-onboard.js` | **rewritten** around the Tour (64 assertions today; expect ~90 — the sandbox assertions go, six stage assertions and **the per-beat HUD-text assertions (§3.0.2(7)) — one per each of the 24 beats** arrive) | wave 1 |
| `dev/e2e-onboard-sandbox.js` | **retired** | wave 1 |
| `dev/check-startgate.js` | the Tour is a **deliberate non-gate**, alongside the sandbox, the live session and the watch-solution demo already listed in its §8 (`dev/check-startgate.js:26`). Assert: on the Tour the gate is cleared (`hkGateClear`, the `index.html:31684` pattern) and no clock runs. Separately assert that on a **lesson drill** the lesson card IS the gate — one keypress dismisses the card and starts the clock, honest t=0 preserved | wave 1 |
| `dev/e2e-depth-contract.js` | beat-floor exemption keyed off `hkLessonKey` | wave 2 (L1) |
| `dev/e2e-alt-paths.js` (+8) · `dev/e2e-guided.js` (+4 solvable-on-rails) · `dev/e2e-par-sweep.js` (+4 sweeps) · `dev/e2e-demo-replay.js` (auto) | tests | build waves |
| `dev/e2e-smoke.js` | drill-count guard: 74 → 78 (D3) | assembly |
| `dev/migrate-certificates.sql` + `supabase/migrations/` | the fluency track's Foundations array gains 4 keys — **same PR** (r359 drift rule) | assembly |
| `dev/build-drill-pages.js` → `drills/*.html` ×4 + `sitemap.xml` | SEO | assembly |
| `index.html` / `About.html` / `enterprise.html` / `billing.html` copy | 74 → 78 | assembly (smoke-guarded) |
| `nav.js` · `profile.html` · `stats.html` · `lb.js` | read `groups` / `menuOrder` — automatic; verify only | assembly |
| `dev/DEPTH_PASS.md` §1.0-R5 · `dev/FOUNDATIONS_SPEC.md` header · `dev/ONBOARDING_V3.md` superseded note · `dev/CONTINUITY.md` §0 · `PROJECT_CONTEXT.md` r451 header | docs | assembly |
| cache bump `?v=` on `drills.js` and index-referenced scripts across all pages | ship | assembly (CI-enforced) |

**Not touched, and deliberately so:** `HOTKEY_ACHIEVEMENTS` (no re-target — the group name is unchanged),
`HOTKEY_CAMPAIGN` (no new chapter, no id shift, no `cap_c0`), `HK_TRACKS` group lists (unchanged; only
the derived key arrays grow), `HK_PLACEMENT`, `HOTKEY_PREMIUM`.

---

## 6 · Rollout — three waves (WORKFLOW §9 wave playbook)

0. **Wolf review of this spec** — §9 decisions in chat, one word each. Nothing builds before.
1. **Wave 1 — the Keyboard Tour + the platform** (one agent, main checkout, ≈ one session):
   **the TUTORIAL HUD first (§3.0.2) — banner, spotlight, nudge, reduced-motion** ·
   `keyboardtour` board + six stages + `tiers` staging · `startKeyboardTour` / `tourMode` /
   `checkWin` bail · lesson-card component (used by both surfaces) · `hkLessonKey` · `reveal:true` ☆ ·
   hints default · results next-lesson line · `HOTKEY_CLOCKS` lesson rule · sandbox retirement ·
   `TOUR_STEPS` trim · invariants (§7) · `e2e-audit-onboard` rewrite · `check-startgate` stance.
   Gate green. **Wolf sees screenshots of the Tour's stage 1 (HUD + spotlight) and stage 5 (HUD under the ribbon bar) before wave 2** (WORKFLOW §2:
   anything visual ships behind a screenshot).
2. **Wave 2 — the four lesson drills** *(only if L1 = build them)* (one agent per drill, payload contract WORKFLOW §9.3, ≈ one
   session): `select` · `firstsum` · `lockref` · `ribbonpass`. Each: `CHALLENGES` block + `lesson` +
   `HOTKEY_PARS` + `HOTKEY_CLOCKS` + 2 alts + a par sweep + a verification probe.
3. **Wave 3 — assembly** *(scope shrinks to the doc + copy sweep if L1 = Tour only)* (≈ half a session): groups, tracks + SQL migration, pool filter, SEO pages +
   sitemap, copy 74 → 78, cache bump; full 19-suite gate; `REWORKED` ledger +4; AUDIT.md entry; the
   post-batch brief for Wolf (WORKFLOW §8).
4. **Playtest round** — Wolf runs the Tour cold in the "basically none" path, then
   `navigation → select → firstsum → lockref → ribbonpass → filldr`. The test is the seam: does
   `filldr` now read as the first real task instead of the first wall?
5. **Follow-ups, queued not scoped:** `reference.html` section order matching the Tour's stage order ·
   a leaderboard fold for the lesson boards · "recommended next drill" beyond the chapter.

---

## 7 · Invariants that land with it (`dev/check-invariants.js`, same PR as the code — WORKFLOW §3.3)

**The Keyboard Tour**
- `keyboardtour` ∉ `menuOrder`, ∉ `HOTKEY_PARS`, ∉ `HOTKEY_CLOCKS`, ∉ `HOTKEY_CHALLENGE_POOL`,
  ∉ `HK_PLACEMENT.KEYS`, ∉ any `HK_TRACKS[].keys`, ∉ any `HOTKEY_CAMPAIGN.chapters[].keys`
- `CHALLENGES.keyboardtour.stages.length === 6`, and every stage has `title`, `body` (≤ 60 words),
  `keys` (non-empty) and 1–5 beats
- the Tour declares `tiers` with 5 staged entries (stages 2–6) and every `tiers[i].checks` index is a
  valid index into its `checks(S)` array
- `keyboardtour` has no `par` and no `parKeys` (it must be impossible to time it)
- every Tour beat carries a `hud` string and a `nudge` string; `hud` is ≤ 14 words; no beat's `hud` is
  empty and no two consecutive beats share one
- the Tour declares `targets` of the same length as `checks(S)`; exactly one entry (stage 6 beat 1)
  is `null`
- `#tourHud` exists in the DOM only while `tourMode` is true

**Lesson drills**
- exactly 4 keys carry `lesson`, all 4 are in `Foundations`, and they sit at `groups[0].keys[1..4]`
- `groups[0].keys` is exactly `['navigation','select','firstsum','lockref','ribbonpass','filldr','pastes','blocksel','rowops','editfix','modeltour']` (11 keys, `modeltour` last)
- every lesson drill has `lesson.title`, `lesson.body` (≤ 60 words), `lesson.keys` (non-empty), and
  every `lesson.keys` token appears in that drill's `req`
- lesson drills: 2 ≤ core beats ≤ 4; exactly one `bonus:true`; `reveal:true` present on it
- `reveal:true` appears on NO non-lesson drill (`navigation` included)
- `HOTKEY_PARS[k] ≤ 30` for every lesson key; `HOTKEY_CLOCKS[k].pass === par*2`
- lesson keys ∉ `HOTKEY_CHALLENGE_POOL`; `HK_PLACEMENT.KEYS ∩ lesson keys === []`
- `drills.js meta[k].lesson === true` ⟺ `CHALLENGES[k].lesson` exists (the two must never drift)

**Unchanged guards re-asserted**
- `HK_TRACKS` arrays == `dev/migrate-certificates.sql` arrays (r359 drift rule)
- Foundations still designates `modeltour` as its capstone and it is still the group's last key
- `e2e-smoke` drill-count: the "N banker-grade drills" phrase == `menuOrder.length` == 78 (D3)
- `check-startgate`: the Tour is a non-gate (clock never starts); a lesson drill's card IS the gate

---

## 8 · What this does NOT change — and what NOT to change

**Does not change (so nobody re-derives it):**
- The 74 depth-pass drills — not one beat, label, par, ☆ or group. Foundations gains four keys; nothing
  in it moves out.
- The Freedom Doctrine, the ☆ content law, the Copy Law, the save closer, the 20-row cap, the language
  standard (DEPTH_PASS §1.7), the capstone gate rule, the placement series, the leaderboard model,
  XP/levels.
- `HOTKEY_PREMIUM` stays `enabled:false`; Foundations is outside the paid tier by construction.

**Do NOT change (a build agent touching any of these has gone off-spec):**
1. The **group name** `'Foundations'`. No rename. Achievements read it.
2. The **campaign chapter id `c1`**, its `keys` array, its badge, its xp, or `capstone:'modeltour'`
   (`drills.js:250`).
3. Any **achievement id or string** (`x_found`, `grp1`, `cap_c1`, `nav2`).
4. **`navigation`** — not one beat, not the par, not its hidden ☆. It gains a picker note and nothing
   else. It is NOT a lesson drill (no `lesson` object).
5. **`HK_TRACKS[].groups`** or `HK_TRACKS[].milestones` — the fluency track already covers Foundations;
   only its derived `keys` array grows, and the SQL migration mirrors it in the same PR.
6. **`sandboxMode`** the variable — retire the sandbox FUNCTIONS, but leave the flag: `checkWin`
   (`index.html:24540`), `updateChecklist` (`:25963`) and `loadChallenge` (`:30616`) all read it, and
   the Tour must use a separate `tourMode`.
7. **`hkTiersInit` / `hkTierTick` / `hkParkedAt`** — consume them, do not rewrite them. They are r421
   platform code with no current consumer; the Tour is the first, and a regression here would land on
   a piece nothing else exercises.
8. The **start gate** semantics (r450): the gate stays armed on every timed board. The Tour clears it
   because it is untimed, exactly as the sandbox does at `index.html:31684`.
9. **`currentTargetRange()`** (`index.html:23015`) and its r423 gesture latch. The HUD's spotlight
   consumes it; do not add a Tour branch inside it beyond the `null`-target case, and do not touch the
   latch — it is what stops the ring flickering mid-edit on every drill in the catalog.
10. The **marketing count phrase shape** — change the number, never the phrase, or `e2e-smoke` and the
   meta tags drift apart.

---

## 9 · WOLF DECISIONS (answer in chat, one word each; recommendation first)

| # | question | options | **recommendation** |
|---|---|---|---|
| **T1** | the Keyboard Tour: untimed with a one-time xp bounty, or timed like a drill | untimed +25 xp · timed | **untimed** — a 3–4 minute board cannot carry a par without breaking the product's "short timed replayable drill" identity; the bounty pays the completion once so it still feels earned, and the reps that ARE timed start immediately after |
| **T2** | the Tour replaces BOTH the modal tour's Excel beats AND the warm-up sandbox | yes · keep the sandbox too | **yes** — three teaching surfaces for the same five minutes is why the first session reads as noise; one board that teaches and stages beats a modal sequence over a scratch sheet, and it deletes ~120 lines of sandbox code |
| **T3** | Tour stage 5 shows the ribbon overlay while teaching it | yes · teach the chords without the overlay | **yes** — "how the ribbon works" was Wolf's own words; the KeyTip chips are already rendered (`__leanRibbonHtml`, `index.html:23742`) and the lesson is unlearnable without seeing the letters light up. The stage forces the lean bar on and restores the player's setting at Tour end |
| **L1** | the four lesson drills (§3.1–3.4) — build them after the Tour, or Tour only | build them · Tour only, catalog unchanged | **build them** — the Tour teaches, the lessons give reps under a clock. Without them drill 2 is still `filldr` at par 44 with seven beats: the player has SEEN the grammar once, untimed, and has rehearsed none of it. They cost one wave and add four keys to a group that already exists. If L1 = Tour only, D2/D3/D4/D7/D9 below all fall away with them |
| **D2** | the four lesson drills in the Fluency certificate track | include · exclude | **include** — trivially, they are in Foundations and the track is group-based; every one is ≤ 30 s, so inclusion costs nothing and starts a novice's certificate progress on day one |
| **D3** | marketing count | **"78 banker-grade drills"** · "74 + a tutorial" | **78, count them** — v1's `tutorial:true` count exclusion is dropped. These four are real drills: real boards, real pars, real leaderboards, real ☆s. The Tour is what gets advertised separately, and it is not a drill |
| **D4** | lesson ☆ visible from load | yes · keep the mystery slot | **yes** — the efficiency IS the lesson; hidden, it teaches nothing (`navigation`'s game ☆ stays hidden) |
| **D5** | gating | soft (recommended path; free play open) · hard | **soft** — the standing law is gate progression artifacts, never access. The Tour hand-off + the picker order already make the path obvious |
| **D6** | `navigation` stays drill 1, unchanged | keep · shorten | **keep** — three rounds of praise, and after the Tour it is exactly the right first timed board |
| **D7** | `lockref` alongside `anchor` (Formulas I) | both · fold | **both** — `lockref` is the mechanic on a 12-cell grid at par 16; `anchor` is the desk task at par 22. The lesson is what makes `anchor` feel like a task rather than a trick |
| **D9** | hints default ON on the first attempt of a lesson drill | yes · no | **yes** — the run still posts (no rails); F1 turns it off and the choice sticks per drill |
