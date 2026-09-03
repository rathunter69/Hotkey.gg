# CURRICULUM V3 (v2) — the eight-chapter map (r454, Phase A of `dev/CURRICULUM_REBUILD.md`)

_Status: **RECOMMENDED, PENDING WOLF.** This is **v2**, rewritten against Wolf's 2026-09-03
redirects. v1's nine-chapter re-cut, its `k1`–`k9` ids, its eight lesson drills, its
`opener_exempt` flag and its "a lesson at the head of every chapter" rule are **withdrawn**.
What replaces them:_

> _"The original chapter layout was actually pretty good… the first chapter is very gamified,
> like how we have a pac-man-like course for movement, and we have similar mechanics to make each
> drill in the first set a GAME as you learn each foundational concept — basically a game tutorial
> before moving into the speed drills."_ — Wolf, 2026-09-03
>
> _"I'm not in love with 12 drills for intro — feels shallow, or like we should just have a few
> major lessons essentially."_ — Wolf, same day, on the first draft of this file
>
> _"Level 1 replaces the Keyboard Tour entirely. Levels post to leaderboards like any drill."_
> — Wolf, same day, resolving D-1/D-2 below

**Machine-readable twin:** `dev/curriculum-v3.json`. **Guard:** `node dev/check-curriculum-map.js`
prints `CURRICULUM MAP: 0 violations` and exits 0; it belongs in gate.yml's always-on fast lane
beside `check-invariants`. Nothing in this document is hand-counted — every table below is
generated off that JSON.

**Inputs, in the order they bind:** Wolf's 2026-09-03 redirects (above, law) · `dev/CURRICULUM_REBUILD.md`
§1 (P1–P8, law **except** P3's re-cut and P4's lesson-opener rule, which Wolf's redirect supersedes) ·
`dev/audit-r452/audit-catalog.md` (the skill graph: 74 drills, 59 require-before-teach violations, the
difficulty spine, options A–D) · `dev/TUTORIAL_CHAPTER_SPEC.md` §3.0 (the Tour's six stages and its HUD
— now the **level machinery**) · `dev/DEPTH_PASS.md` §1.7 (language standard), §2.4 (capstones), §2.5
(the tier ladder), §3 (delta-table grammar), §4 (the five unbuilt capstone pages) ·
`dev/DEPTH_PASS_CAMPAIGN.md` §0–§1 (retirements and route facts a build agent must not re-derive).

**The headline.** The **eight original chapters keep their names, their order, their campaign ids
`c1`–`c8` and their capstone designations.** Chapter 1, Foundations, is rebuilt from seven ordinary
drills into **five major levels** — four multi-act game boards plus `modeltour` — that replace both
the lesson-drill idea and the Keyboard Tour. 74 drills → **84** (74 − 1 retired + 4 levels + 2 opener
drills + 5 capstones). **Require-before-teach violations: 59 → 0.**

**What v2 kills that v1 cost.** Because the eight chapters and their ids survive, there is **no
campaign claim-flag migration**, **no certificate-track re-cut** (only three keys change track), and
**no `HOTKEY_PREMIUM` re-point** — the PRO line stays exactly the four groups `drills.js` names today.

---

## 1 · The eight chapters

Chapter ids are the live `HOTKEY_CAMPAIGN` ids `c1`–`c8`, and a chapter's `name` **is** its
`groups[]` name (the r452 one-string law, asserted by `check-invariants` C15). "entries" and
"(drills)" are now the same number: the Tour is retired, so every entry is a catalog drill.

| # | chapter | tier | unlock | opens on | capstone | entries (drills) | what it teaches |
|---|---|---|---|---|---|---|---|
| c1 | **Foundations** | free | — | `corridor` | `modeltour` | 5 (5) | the game tutorial — four multi-act levels, one foundational family each, then the model tour |
| c2 | **Formatting** | free | — | `ruleaudit` | `gauntlet` | 11 (11) | the banker’s finish — weight, alignment, decimals, rules, widths, paste-special and the house standard |
| c3 | **Formulas I** | free | — | `percent` | `qclose` | 11 (11) | a formula points at cells — sums, anchors, ratios, growth and roll-ups on a live page |
| c4 | **Data & Lookups** | free | — | `tapepull` | `cleanroom` | 12 (12) | rows, columns, sorts, filters and the two ways to read a value out of a tape |
| c5 | **Formulas II** | pro | L13 | `wrapfix` | `redflags` | 12 (12) | find the break — trace, show formulas, triage the sentinels, flip the signs, make it tie |
| c6 | **Models I** | pro | L16 | `dcfsens` | `pitchpage` | 11 (11) | what a company is worth — discount rate, free cash flow, DCF, comps and the page a VP reads |
| c7 | **Models II** | pro | L19 | `rollfwd` | `cascade` | 11 (11) | the debt side and the schedules that feed it — corkscrews, sweeps, waterfalls, covenants, liquidity |
| c8 | **Full Builds** | pro | L22 | `threestmt` | `shipit` | 11 (11) | whole models, cold and under the clock — three statements, the DCF page, the paper LBO, the cover |

**Counts.** free = **39** drills (c1–c4) · PRO = **45** (c5–c8). Catalog total **84**, up from 74:
+4 levels, +2 opener drills (`tapepull`, `rollfwd`), +5 capstones, −1 retirement (`navigation`,
absorbed into level 1). The Keyboard Tour leaves the product entirely (§6 D-3).

**Why five levels and not twelve games.** The twelve-mini-game draft split the foundational grammar
into twelve 16–26-second boards. Wolf's read was that it "feels shallow" — and he is right for a
structural reason: at 20 seconds a board can carry one chord, so twelve of them teach twelve chords
and no *habit*. A level runs 60–120 seconds across three or four acts, which is long enough for the
thing that actually transfers: use a chord, then use it again inside a task that has moved on. Four
levels also match the four families the graph actually has — **move & select · enter, edit & structure ·
formulas & anchors · formats & the ribbon** — so each level owns a family instead of a keystroke.

---

## 2 · The full ordered catalog

Catalog order = chapter order, then drill order; `#` is the position in `menuOrder`. **teaches** shows
only tags that are *new at that position* — a blank means the drill reps something already taught,
which is correct and intended for the ~50 drills the audit §3.1 identified as reps and syntheses.
**requires** is carried **verbatim** from the audit's §6 table except for the three amendments in §6
(D-8, D-9, D-10).

| ch | # | key | name | kind · status | par | teaches (new only) | requires |
|---|---|---|---|---|---|---|---|
| c1 | 1 | `corridor` | The Corridor | LEVEL · add | 90 | `move` · `save` · `jump(ctrl-arrow)` · `select` · `select-edge` · `row/col-select` · `goto-special` · `copy/paste` | — |
| c1 | 2 | `repairshop` | The Repair Shop | LEVEL · add | 105 | `enter/edit(F2)` · `clear/delete` · `undo` · `redo` · `cut` · `fill(D/R)` · `insert/delete row-col` · `schedule` · `hide/unhide/group` | `move` · `select` · `select-edge` · `row/col-select` · `copy/paste` |
| c1 | 3 | `powergrid` | The Power Grid | LEVEL · add | 110 | `point-mode` · `sum(Alt=)` · `margin/ratio` · `anchor($/F4)` · `mixed-anchor` · `sign-convention` · `costs-negative` | `enter/edit(F2)` · `select` · `select-edge` · `fill(D/R)` |
| c1 | 4 | `printshop` | The Print Shop | LEVEL · add | 100 | `comma/currency-fmt` · `decimals` · `percent-fmt` · `parens-negative` · `bold/italic/color` · `blue-inputs` · `align` · `borders(top/outside/bottom)` · `autofit` | `select` · `row/col-select` · `goto-special` · `enter/edit(F2)` · `margin/ratio` · `sign-convention` |
| c1 | 5 | `modeltour` | Model Tour | capstone · built | 35 | — | `move` · `jump(ctrl-arrow)` · `copy/paste` · `fill(D/R)` · `percent-fmt` · `comma/currency-fmt` · `decimals` · `bold/italic/color` · `blue-inputs` · `align` · `schedule` |
| c2 | 6 | `ruleaudit` | Ruling Pass | drill · built | 16 | — | `bold/italic/color` · `borders(top/outside/bottom)` · `schedule` |
| c2 | 7 | `center` | Center | drill · built | 22 | — | `row/col-select` · `bold/italic/color` · `borders(top/outside/bottom)` |
| c2 | 8 | `typeset` | Typeset | drill · built | 24 | `date/TODAY` | `margin/ratio` |
| c2 | 9 | `decimals` | Decimals | drill · built | 25 | — | `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `margin/ratio` |
| c2 | 10 | `combo` | Combo | drill · built | 27 | — | `decimals` · `bold/italic/color` · `align` · `autofit` |
| c2 | 11 | `ruleoff` | Rule Off | drill · built | 31 | — | `fill(D/R)` · `bold/italic/color` · `sign-convention` |
| c2 | 12 | `blocksel` | Block Select | drill · built | 34 | — | `select-edge` · `copy/paste` · `fill(D/R)` · `bold/italic/color` · `align` · `borders(top/outside/bottom)` · `margin/ratio` |
| c2 | 13 | `autofit` | Autofit | drill · built | 36 | — | `select` · `fill(D/R)` · `bold/italic/color` · `borders(top/outside/bottom)` |
| c2 | 14 | `pastes` | Paste Special | drill · built | 42 | `paste-special` | `copy/paste` · `comma/currency-fmt` · `bold/italic/color` · `align` · `borders(top/outside/bottom)` · `sign-convention` |
| c2 | 15 | `housestyle` | House Style | drill · built | 44 | — | `percent-fmt` · `comma/currency-fmt` · `decimals` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `autofit` · `goto-special` · `margin/ratio` |
| c2 | 16 | `gauntlet` | Gauntlet | capstone · built | 47 | — | `sum(Alt=)` · `comma/currency-fmt` · `decimals` · `bold/italic/color` · `blue-inputs` · `align` · `borders(top/outside/bottom)` · `autofit` · `hide/unhide/group` |
| c3 | 17 | `percent` | % of Revenue | drill · built | 21 | — | `row/col-select` · `fill(D/R)` · `anchor($/F4)` · `decimals` · `bold/italic/color` |
| c3 | 18 | `anchor` | Anchors | drill · built | 22 | — | `fill(D/R)` · `anchor($/F4)` · `mixed-anchor` · `comma/currency-fmt` · `decimals` · `borders(top/outside/bottom)` |
| c3 | 19 | `foot` | Foot | drill · built | 29 | — | `fill(D/R)` · `bold/italic/color` · `borders(top/outside/bottom)` |
| c3 | 20 | `margin` | Margins | drill · built | 40 | `growth/CAGR` | `fill(D/R)` · `percent-fmt` · `decimals` · `bold/italic/color` · `margin/ratio` |
| c3 | 21 | `bridge` | Point Mode | drill · built | 33 | — | `fill(D/R)` · `point-mode` · `anchor($/F4)` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `growth/CAGR` · `margin/ratio` |
| c3 | 22 | `cagr` | CAGR | drill · built | 36 | — | `fill(D/R)` · `anchor($/F4)` · `percent-fmt` · `decimals` · `bold/italic/color` · `growth/CAGR` |
| c3 | 23 | `fxconvert` | FX Convert | drill · built | 35 | — | `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `comma/currency-fmt` · `decimals` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` |
| c3 | 24 | `filldr` | Fill | drill · built | 44 | — | `bold/italic/color` · `borders(top/outside/bottom)` · `margin/ratio` · `schedule` · `sign-convention` |
| c3 | 25 | `sumif` | SUMIF | drill · built | 64 | `SUMIF(S)` · `tie-out/check-row` | `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `percent-fmt` · `decimals` · `bold/italic/color` · `borders(top/outside/bottom)` · `margin/ratio` |
| c3 | 26 | `rollup` | SUMIFS | drill · built | 80 | — | `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `mixed-anchor` · `borders(top/outside/bottom)` · `SUMIF(S)` |
| c3 | 27 | `qclose` | Close the Quarter | capstone · add | 94 | — | `point-mode` · `sum(Alt=)` · `fill(D/R)` · `anchor($/F4)` · `mixed-anchor` · `percent-fmt` · `decimals` · `growth/CAGR` · `SUMIF(S)` · `tie-out/check-row` · `bold/italic/color` · `borders(top/outside/bottom)` · `sign-convention` · `margin/ratio` |
| c4 | 28 | `tapepull` | Tape Read | drill · add | 22 | `VLOOKUP` · `stat-fn(MEDIAN/AVERAGE)` | `enter/edit(F2)` · `fill(D/R)` · `anchor($/F4)` · `select-edge` |
| c4 | 29 | `drill` | Hardcode | drill · built | 22 | — | `select` · `select-edge` · `row/col-select` · `undo` · `clear/delete` · `copy/paste` · `paste-special` · `bold/italic/color` · `blue-inputs` |
| c4 | 30 | `unhide` | Unhide | drill · built | 25 | — | `select` · `bold/italic/color` · `borders(top/outside/bottom)` · `autofit` |
| c4 | 31 | `filterpass` | Filter | drill · built | 26 | `filter` | — |
| c4 | 32 | `sort` | Sort | drill · built | 31 | `sort` | `select` · `select-edge` · `clear/delete` · `sum(Alt=)` · `bold/italic/color` · `borders(top/outside/bottom)` · `tie-out/check-row` |
| c4 | 33 | `scrub` | Scrub | drill · built | 21 | — | `row/col-select` · `clear/delete` · `sum(Alt=)` · `bold/italic/color` · `borders(top/outside/bottom)` · `insert/delete row-col` · `sort` |
| c4 | 34 | `rowops` | Structure | drill · built | 30 | — | `select` · `row/col-select` · `copy/paste` · `comma/currency-fmt` · `blue-inputs` · `borders(top/outside/bottom)` |
| c4 | 35 | `series` | Series | drill · built | 44 | — | `select` · `select-edge` · `fill(D/R)` · `bold/italic/color` · `align` |
| c4 | 36 | `lookup` | Lookup | drill · built | 59 | `INDEX/MATCH` | `enter/edit(F2)` · `fill(D/R)` · `anchor($/F4)` · `borders(top/outside/bottom)` · `VLOOKUP` |
| c4 | 37 | `lookup2` | Two-way Lookup | drill · built | 80 | — | `enter/edit(F2)` · `copy/paste` · `paste-special` · `anchor($/F4)` · `borders(top/outside/bottom)` · `sort` · `INDEX/MATCH` |
| c4 | 38 | `recon` | Recon | drill · built | 92 | — | `select` · `enter/edit(F2)` · `copy/paste` · `paste-special` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `stat-fn(MEDIAN/AVERAGE)` · `INDEX/MATCH` · `VLOOKUP` |
| c4 | 39 | `cleanroom` | The Data-Room Tape | capstone · add | 90 | — | `clear/delete` · `insert/delete row-col` · `sort` · `filter` · `INDEX/MATCH` · `sum(Alt=)` · `hide/unhide/group` · `bold/italic/color` · `borders(top/outside/bottom)` · `row/col-select` |
| c5 | 40 | `wrapfix` | IFERROR | drill · built | 26 | `IFERROR` | `select` · `enter/edit(F2)` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `VLOOKUP` · `tie-out/check-row` |
| c5 | 41 | `audit` | Review Pass | drill · built | 28 | `audit(trace)` · `show-formulas` | `select` · `enter/edit(F2)` · `fill(D/R)` · `comma/currency-fmt` · `blue-inputs` · `goto-special` · `margin/ratio` |
| c5 | 42 | `signerr` | Sign Sweep | drill · built | 35 | — | `copy/paste` · `paste-special` · `fill(D/R)` · `sum(Alt=)` · `percent-fmt` · `decimals` · `bold/italic/color` · `borders(top/outside/bottom)` · `margin/ratio` |
| c5 | 43 | `tieout` | Tie-out | drill · built | 36 | — | `select` · `enter/edit(F2)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `audit(trace)` · `tie-out/check-row` |
| c5 | 44 | `balcheck` | Make It Tie | drill · built | 37 | `corkscrew(roll-forward)` · `linkage(cross-statement)` | `select` · `enter/edit(F2)` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `tie-out/check-row` |
| c5 | 45 | `triage` | Error triage | drill · built | 40 | — | `enter/edit(F2)` · `copy/paste` · `fill(D/R)` · `bold/italic/color` · `borders(top/outside/bottom)` |
| c5 | 46 | `versionup` | Roll-forward prep | drill · built | 48 | `find/replace` | `fill(D/R)` · `anchor($/F4)` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `growth/CAGR` |
| c5 | 47 | `editfix` | Repair | drill · built | 52 | — | `redo` · `clear/delete` · `schedule` |
| c5 | 48 | `stalelink` | Stale Links | drill · built | 64 | — | `enter/edit(F2)` · `clear/delete` · `fill(D/R)` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `margin/ratio` |
| c5 | 49 | `balance` | Balance | drill · built | 66 | — | `select` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `linkage(cross-statement)` · `tie-out/check-row` |
| c5 | 50 | `cases` | Sticky switch | drill · built | 97 | `IF/MIN/MAX` · `CHOOSE` | `select` · `fill(D/R)` · `anchor($/F4)` · `margin/ratio` |
| c5 | 51 | `redflags` | The Red-Flag Pass | capstone · add | 90 | — | `enter/edit(F2)` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `goto-special` · `find/replace` · `sign-convention` · `tie-out/check-row` · `audit(trace)` · `bold/italic/color` · `borders(top/outside/bottom)` · `margin/ratio` · `blue-inputs` |
| c6 | 52 | `dcfsens` | Sensitivity | drill · built | 35 | — | `select` · `fill(D/R)` · `point-mode` · `anchor($/F4)` · `mixed-anchor` · `comma/currency-fmt` · `decimals` · `borders(top/outside/bottom)` · `growth/CAGR` |
| c6 | 53 | `fcfbuild` | uFCF | drill · built | 40 | — | `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `sign-convention` |
| c6 | 54 | `retbridge` | Returns Bridge | drill · built | 56 | `bridge` | `select` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `margin/ratio` |
| c6 | 55 | `txncomps` | Transaction Comps | drill · built | 52 | — | `select` · `fill(D/R)` · `point-mode` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `stat-fn(MEDIAN/AVERAGE)` · `margin/ratio` · `bridge` |
| c6 | 56 | `football` | Football | drill · built | 65 | — | `select` · `select-edge` · `fill(D/R)` · `anchor($/F4)` · `borders(top/outside/bottom)` · `IF/MIN/MAX` |
| c6 | 57 | `accdil` | Accretion/Dilution | drill · built | 70 | — | `select` · `select-edge` · `fill(D/R)` · `point-mode` · `anchor($/F4)` · `percent-fmt` · `decimals` · `margin/ratio` |
| c6 | 58 | `dcf` | DCF | drill · built | 85 | — | `select` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `tie-out/check-row` |
| c6 | 59 | `comps` | Comps | drill · built | 89 | — | `select` · `fill(D/R)` · `point-mode` · `anchor($/F4)` · `decimals` · `bold/italic/color` · `borders(top/outside/bottom)` · `stat-fn(MEDIAN/AVERAGE)` · `margin/ratio` · `bridge` |
| c6 | 60 | `sourcesuses` | Sources & Uses | drill · built | 92 | — | `select` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `percent-fmt` · `bold/italic/color` · `borders(top/outside/bottom)` · `margin/ratio` · `tie-out/check-row` |
| c6 | 61 | `wacc` | WACC | drill · built | 112 | — | `select` · `fill(D/R)` · `point-mode` · `anchor($/F4)` · `linkage(cross-statement)` |
| c6 | 62 | `pitchpage` | The Valuation Page | capstone · add | 88 | — | `select` · `point-mode` · `fill(D/R)` · `anchor($/F4)` · `IF/MIN/MAX` · `stat-fn(MEDIAN/AVERAGE)` · `comma/currency-fmt` · `bold/italic/color` · `borders(top/outside/bottom)` · `date/TODAY` · `margin/ratio` · `bridge` |
| c7 | 63 | `rollfwd` | Roll Forward | drill · add | 26 | `circularity-avoidance` | `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `corkscrew(roll-forward)` · `schedule` · `sign-convention` |
| c7 | 64 | `covtable` | Covenant Table | drill · built | 36 | — | `copy/paste` · `fill(D/R)` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `IF/MIN/MAX` · `margin/ratio` |
| c7 | 65 | `wk13` | 13-Week Cash | drill · built | 45 | — | `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `corkscrew(roll-forward)` · `tie-out/check-row` |
| c7 | 66 | `schedule` | Schedule | drill · built | 69 | — | `select` · `fill(D/R)` · `sum(Alt=)` · `point-mode` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `corkscrew(roll-forward)` · `schedule` · `linkage(cross-statement)` |
| c7 | 67 | `lbo` | LBO | drill · built | 71 | — | `select` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `growth/CAGR` · `margin/ratio` · `bridge` · `schedule` |
| c7 | 68 | `intsched` | Interest | drill · built | 72 | — | `select` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `decimals` · `bold/italic/color` · `borders(top/outside/bottom)` · `margin/ratio` · `corkscrew(roll-forward)` · `schedule` · `sign-convention` · `circularity-avoidance` |
| c7 | 69 | `waterfall` | Waterfall | drill · built | 77 | — | `select` · `copy/paste` · `fill(D/R)` · `sum(Alt=)` · `point-mode` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `IF/MIN/MAX` · `corkscrew(roll-forward)` · `schedule` · `tie-out/check-row` |
| c7 | 70 | `liqbridge` | Liquidity Bridge | drill · built | 77 | — | `select` · `fill(D/R)` · `anchor($/F4)` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `IF/MIN/MAX` · `bridge` · `sign-convention` |
| c7 | 71 | `debtsched` | Debt Schedule | drill · built | 86 | — | `fill(D/R)` · `anchor($/F4)` · `percent-fmt` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `IF/MIN/MAX` · `corkscrew(roll-forward)` · `schedule` · `circularity-avoidance` |
| c7 | 72 | `revolver` | Revolver | drill · built | 95 | — | `select` · `fill(D/R)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `IF/MIN/MAX` · `corkscrew(roll-forward)` · `schedule` · `circularity-avoidance` |
| c7 | 73 | `cascade` | Full Waterfall | capstone · built | 161 | — | `select` · `fill(D/R)` · `bold/italic/color` · `borders(top/outside/bottom)` · `IF/MIN/MAX` · `corkscrew(roll-forward)` |
| c8 | 74 | `threestmt` | 3-Statement | drill · built | 45 | — | `select` · `select-edge` · `fill(D/R)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `linkage(cross-statement)` · `tie-out/check-row` |
| c8 | 75 | `dashcover` | Model cover | drill · built | 47 | — | `select` · `select-edge` · `fill(D/R)` · `point-mode` · `anchor($/F4)` · `percent-fmt` · `comma/currency-fmt` · `decimals` · `bold/italic/color` |
| c8 | 76 | `bsbuild` | BS Build | drill · built | 64 | — | `select` · `copy/paste` · `paste-special` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `corkscrew(roll-forward)` · `linkage(cross-statement)` · `sign-convention` · `tie-out/check-row` |
| c8 | 77 | `cfslink` | CFS Link | drill · built | 66 | — | `fill(D/R)` · `point-mode` · `anchor($/F4)` · `percent-fmt` · `decimals` · `bold/italic/color` · `borders(top/outside/bottom)` · `corkscrew(roll-forward)` · `schedule` · `sign-convention` |
| c8 | 78 | `debtblock` | Debt block | drill · built | 70 | — | `select` · `fill(D/R)` · `anchor($/F4)` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `corkscrew(roll-forward)` · `schedule` · `linkage(cross-statement)` · `sign-convention` |
| c8 | 79 | `isbuild` | IS Build | drill · built | 71 | — | `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `percent-fmt` · `decimals` · `bold/italic/color` · `borders(top/outside/bottom)` · `margin/ratio` · `schedule` |
| c8 | 80 | `lbobuild` | Paper LBO | drill · built | 84 | — | `select` · `fill(D/R)` · `sum(Alt=)` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `growth/CAGR` · `margin/ratio` · `schedule` · `tie-out/check-row` |
| c8 | 81 | `opmodel` | Op model | drill · built | 85 | — | `copy/paste` · `sum(Alt=)` · `anchor($/F4)` · `percent-fmt` · `decimals` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `margin/ratio` · `audit(trace)` |
| c8 | 82 | `nwcsched` | NWC Schedule | drill · built | 102 | — | `select` · `fill(D/R)` · `sum(Alt=)` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `schedule` |
| c8 | 83 | `dcfbuild` | DCF page | drill · built | 113 | — | `select` · `fill(D/R)` · `anchor($/F4)` · `margin/ratio` · `bridge` |
| c8 | 84 | `shipit` | Ship the Model | capstone · add | 110 | — | `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `paste-special` · `corkscrew(roll-forward)` · `linkage(cross-statement)` · `tie-out/check-row` · `sign-convention` · `growth/CAGR` · `bold/italic/color` · `borders(top/outside/bottom)` · `date/TODAY` · `schedule` · `margin/ratio` |

---

## 3 · THE PRO LINE and the earn-in curve

*The PRO line is **exactly what `drills.js` `HOTKEY_PREMIUM.groups` says today** — `Formulas II ·
Models I · Models II · Full Builds`. v1 re-pointed it at five re-cut chapters; v2 does not touch it.
What is new is one number per PRO chapter: an earn-in level, so a committed free player can reach
paid content without paying (CURRICULUM_REBUILD P2, law). The numbers are **recommended, pending
Wolf**.*

```
  FREE  ─────────────────────────────────────  |  ── PRO ──────────────────────────────────
  c1 Foundations  c2 Formatting  c3 Formulas I |  c5 Formulas II  c6 Models I
  c4 Data & Lookups                            |  c7 Models II    c8 Full Builds
  39 drills — no gate, ever                    |  45 drills — subscription OR level 13/16/19/22
```

| side | chapters | drills | of which levels | of which capstones | gate |
|---|---|---|---|---|---|
| **free** | c1 · c2 · c3 · c4 | **39** | 4 (all in c1) | 4 (`modeltour` `gauntlet` `qclose` `cleanroom`) | none — open forever |
| **PRO** | c5 · c6 · c7 · c8 | **45** | — | 4 (`redflags` `pitchpage` `cascade` `shipit`) | entitlement **OR** the curve below |

**The curve.** PRO chapter *k* (k = 1…4) opens at **level 10 + 3k**:

| PRO chapter | c5 Formulas II | c6 Models I | c7 Models II | c8 Full Builds |
|---|---|---|---|---|
| **unlocks at** | **L13** | **L16** | **L19** | **L22** |

A free grinder reaches Full Builds around level 22; a subscriber skips the curve on day one. Two
standing laws hold on top of it: **free play is never blocked** (gate the progression artifact, never
the access — Wolf decision log #4), and until Stripe is live `HOTKEY_PREMIUM.enabled` stays false, so
the PRO chapters show their gate and their price and open by the level path only (P2).

**What retires with this.** `HOTKEY_GATES` — the level+pace-clears wall that today gates five groups
(`Data & Lookups` L3/8 clears, `Formulas II` L5/12, `Models I` L7/18, `Models II` L9/26, `Full Builds`
L11/32) — is **retired outright** (P1). It is replaced by exactly two things: the **capstone spine**
(clear chapter N's capstone to open chapter N+1's progression artifacts) and the **PRO `unlock_level`**
above. One ladder, not four. Note that today's gates also wall `Data & Lookups`, which is **free** in
this map — retiring them is what makes the free tier actually free.

---

## 4 · Certificate tracks — unchanged in shape, three keys moved

The three tracks keep the composition `HK_TRACKS` has today (P7); because the eight groups survive,
the tracks survive with them. This is the single biggest saving v2 makes over v1, which moved 14 keys
and re-cut every track.

| track | chapters | cert | drills |
|---|---|---|---|
| `fluency` | c1 Foundations · c2 Formatting | Excel Keyboard Fluency | 16 |
| `formulas` | c3 Formulas I · c4 Data & Lookups · c5 Formulas II | Spreadsheet Formulas & Data Analysis | 35 |
| `modeling` | c6 Models I · c7 Models II · c8 Full Builds | Financial Modeling Keyboard Mastery | 33 |

**Keys that change track (3, all `fluency` → `formulas`):** `filldr` (→ c3), `rowops` (→ c4),
`editfix` (→ c5) — the three Foundations drills whose destination chapter sits in another track
(§6 D-5). `blocksel` and `pastes` move to c2, which is in the same track, so they do not move
certificate. `navigation` leaves `fluency` by retirement; the four new levels join it by construction.

**Migration (r359 drift rule — SQL in the same PR as the code).** `HK_TRACKS[].keys` derives from
`groups`, so all three arrays in `dev/migrate-certificates.sql` and the newest `issue_certificate`
migration regenerate in the same PR; `dev/check-invariants.js` C14 already asserts set-equality
between them and `HK_TRACKS`. A player mid-`fluency` sees three keys leave their scope and four
levels arrive — smaller than v1's rug, but still a change, and it carries the r158 softener in
§8 D-5. **Milestones.** `MS` is untouched: `{ fluency:['c1','c2'], formulas:['c3','c4','c5'],
modeling:['c6','c7','c8'] }`.

---

## 5 · The picker's "next up" rule

**In prose.** *Next up is the first drill in catalog order that you can actually do and have not
already done — and if you are mid-chapter, it is the first such drill in the chapter you are standing
in.* A drill you "can actually do" is one whose every REQUIRES tag has been taught by something you
have cleared. That is the whole rule: no level check, no entitlement check, no pace check. Locks are
shown as reasons, never as walls — a locked row reads "wants `anchor($/F4)`: try **The Power Grid**",
and free play stays open (audit §4 UI note 2).

Because the map has **zero** require-before-teach violations, catalog order alone already satisfies
the rule for a player who goes straight through — "next up" and "the next row down" agree. The rule
earns its keep for the player who jumped around, cleared three drills out of order and came back a
week later.

```js
/* the cleared set is the PB map: a PB records only on a clean run (no mouse, no guided) —
   and that now includes the four Foundations LEVELS, which are timed drills like any other */
function hkNextUp(map, pb, currentChapter){
  const flat = map.chapters.flatMap(c => c.drills.map(d => ({ ch:c, d })));

  // 1. what the player has been TAUGHT = union of TEACHES over everything cleared.
  const known = new Set();
  for (const { d } of flat)
    if (pb[d.key] !== undefined) d.teaches.forEach(t => known.add(t));

  // 2. ready = not yet cleared, and every REQUIRES already taught.
  const ready = d => pb[d.key] === undefined && d.requires.every(t => known.has(t));

  // 3. prefer the chapter the player is standing in, then fall back to catalog order.
  const here = flat.find(x => x.ch.id === currentChapter && ready(x.d));
  return here || flat.find(x => ready(x.d)) || null;
}
```

Three consequences the picker UI hangs off:

1. **Level 1 is always ready** — it requires nothing, which is what "first contact" means and what
   the checker's rule (d1) asserts. A brand-new player's "next up" is `corridor`, every time, with
   no `hk_tour_done` flag in the way.
2. **A chapter's opener is always ready off Foundations alone** (checker rule d2), so a player who
   finished the five levels and jumped to Data & Lookups is never told "nothing here yet".
3. **A capstone is ready only when its chapter is.** Every capstone's REQUIRES is its own chapter's
   vocabulary, so "★ capstone — locked until you clear X" is computed, not hand-written.

---

## 6 · THE DELTA TABLE (DEPTH_PASS §3 grammar)

Keys are immutable (PBs, `runs.challenge`, leaderboard boards, `drills/<key>.html` and
`migrate-certificates.sql`'s arrays all key off them). Nothing below renames a key; two keys
**retire**, which is a different and heavier act, and each carries its `why` in the JSON.
Plumbing legend: **GROUPS** = `drills.js groups[]` · **SPINE** = `HOTKEY_CAMPAIGN.chapters` ·
**TRACKS** = `HK_TRACKS` + `dev/migrate-certificates.sql` (same PR, r359) · **PARS** = `HOTKEY_PARS` ·
**CLOCKS** = `HOTKEY_CLOCKS` · **LB** = leaderboard boards (auto from `menuOrder`) · **ACH** =
achievements reading group names · **POOL** = `HOTKEY_CHALLENGE_POOL`.

| # | delta | type | rationale | plumbing impact |
|---|---|---|---|---|
| **D-1** | **The eight groups, ids, names, order and capstone designations are UNCHANGED** — `Foundations · Formatting · Formulas I · Data & Lookups · Formulas II · Models I · Models II · Full Builds`, campaign `c1`–`c8`, capstones `modeltour · gauntlet · qclose · cleanroom · redflags · pitchpage · cascade · shipit` | NO CHANGE | Wolf 2026-09-03: "the original chapter layout was actually pretty good". Everything v1 spent on a re-cut — the claim-flag map, the track re-derivation, the `HOTKEY_PREMIUM` re-point, the achievement re-pointing — is **withdrawn** | none. `cap_c1`…`cap_c8` keep their targets; `hk_camp_xp` needs no migration; `x_found`/`grp1`–`grp4` keep their group strings |
| **D-2** | **4 LEVEL ADDs** — `corridor` `repairshop` `powergrid` `printshop` (all c1) | ADD ×4 | Wolf: Foundations becomes a game tutorial of "a few major lessons", not twelve shallow boards. §9 carries the pages | GROUPS +4 (all at the head of `Foundations`) · `meta` ×4 with `level:true` · PARS +4 (60–120 s band) · CLOCKS +4 (**pass ×2.5**, not ×2.0 — §8 D-2) · LB auto (levels post, §8 RESOLVED-2) · SEO +4 · TRACKS +4 (`fluency`) · POOL excludes level keys · `e2e-alt-paths` +8 · a new act controller (§9.0) |
| **D-3** | **`keyboardtour` RETIRED** — level 1 replaces it | RETIRE | Wolf 2026-09-03. L1 act 1 **is** the Tour's stage 1 board, act 2 **is** stage 2; stages 3–6 redistribute to L2 (enter/edit/structure), L3 (sums/fill) and L4 (dress/save). A separate untimed pre-game would teach the same grammar twice, and the honest-t=0 problem it was built to solve is now solved by the level's own act-1 HUD | **KEEP the runtime, re-point it:** the TUTORIAL HUD (`TUTORIAL_CHAPTER_SPEC` §3.0.2) becomes the per-ACT banner · the stage cards (§3.0.4) become ACT cards · the tier-ladder reveal (DEPTH_PASS §2.5) paints act N+1's region in · `TOUR_STEPS`/`startKeyboardTour`'s untimed bail, the `tourMode` flag, `hk_tour_done_v2` and the `checkWin` exemption all **go** (a level is a timed drill). `obStart` and `showComfort`'s "basically none" branch load `corridor`. `check-invariants`' Keyboard-Tour block re-points at the level contract |
| **D-4** | **`navigation` RETIRED into `corridor` act 1** | RETIRE | the switchback corridor board is act 1 verbatim; a 20-second movement board cannot also be the level that teaches selection and the clipboard, and two keys over one board would split its PBs and its leaderboard | GROUPS −1 · `menuOrder` −1 · PARS/CLOCKS −1 · LB: the `navigation` board closes, `corridor`'s opens (no migration — boards derive from `menuOrder`) · SEO: `drills/navigation.html` → 301 to `drills/corridor.html` · **`HK_PLACEMENT[0]` re-points** `navigation` → `corridor` (§8 D-6) · PBs on `navigation` are kept in localStorage and shown as a retired-drill row on the profile (r158) |
| **D-5** | **the five robust Foundations drills LEAVE c1** — `blocksel` → c2 · `pastes` → c2 · `filldr` → c3 · `rowops` → c4 · `editfix` → c5 | MOVE ×5 | Foundations is exactly five levels now (checker d1), so each of the five goes to the chapter whose functionality it exercises. **`blocksel`** ("assemble and format the summary; dress the table as you go and box it whole") — its clipboard half is L2's job now, what is left is a dressing board → **Formatting**. **`pastes`** — three of paste-special's four routes (formats, values, transpose) are presentation ops and every one of its REQUIRES is a format tag → **Formatting**; it must also precede `drill`/`lookup2`/`recon`, and parking it inside Data & Lookups puts par 42 ahead of `drill` 22, a ×0.52 spine break (this is the one place v2 deviates from the destination Wolf sketched, and the deviation is arithmetic, not taste). **`filldr`** ("a quarterly operating build off the revenue feed… one anchored formula fills most of it") → **Formulas I**. **`rowops`** ("insert the missing line and the missing quarter, delete the squatters") → **Data & Lookups**, beside `scrub` and `unhide`, the same hand. **`editfix`** ("a review came back on the schedule — repair all three") → **Formulas II**, which is the audit-and-repair chapter | GROUPS only; keys, boards, PBs, pars and SEO pages untouched. TRACKS: `filldr` `rowops` `editfix` change track (§4). Picker hotkeys inside a chapter shift (cosmetic — the r447 `cascade` move is the precedent) |
| **D-6** | **2 opener drill ADDs** — `tapepull` (c4) · `rollfwd` (c7) | ADD ×2 | the only two ADDs the graph still forces. `tapepull` kills the last two orphan tags in one 22-second board: **`VLOOKUP`** (3 drills need it, nothing teaches it) and **`stat-fn(MEDIAN/AVERAGE)`** (demanded at `recon`, taught 13 positions later at `wacc`). `rollfwd` teaches **`circularity-avoidance`**, which appears in *zero* player-facing surfaces despite being the catalog's most-asked interview idea, and gives Models II an opener at par 26 instead of `covtable` 36. Pages: v1 §9.7 and §9.8, carried unchanged in substance — they are ordinary timed drills, not levels and not lessons | GROUPS +2 · PARS +2 · CLOCKS +2 · LB auto · SEO +2 · TRACKS +2 · POOL candidates |
| **D-7** | **5 capstone ADDs** — `qclose` (c3) · `cleanroom` (c4) · `redflags` (c5) · `pitchpage` (c6) · `shipit` (c8) | ADD ×5 | DEPTH_PASS §2.4 / §3 D1/D3/D4/D5/D6, still unbuilt (DEPTH_PASS_CAMPAIGN §0). Pages refreshed to the r452 law in §10. Three chapters already have theirs (`modeltour` `gauntlet` `cascade`) | GROUPS +5 · `meta` ×5 with `capstone:true` · PARS +5 · CLOCKS +5 (pass ×2.0) · SPINE `chapters[i].capstone` for c3–c6 and c8 · LB auto · SEO +5 · TRACKS +5 · POOL: `redflags` / `shipit` post-calibration |
| **D-8** | **`audit` TEACHES += `audit(trace)` · `show-formulas`** | AMEND (graph) | `audit(trace)` had **no teacher** and is required by `tieout` (c5) and `opmodel` (c8); `Ctrl+\`` show-formulas is wired at `index.html:28400` and used by zero drills. `audit` is literally the **Review Pass** — "a divisional review page came back with four breaks in it" — and it sits at c5 position 2, before `tieout`. The trace lesson belongs on the review board, not on an eleventh new drill | map + one Phase C clause each in `audit`'s `guide`/`aha`; no board change |
| **D-9** | **`lookup2` REQUIRES −= `corkscrew(roll-forward)`** | AMEND (graph) | the audit derived this row from board scenery. `lookup2`'s board is a **square 5×5 segment × metric tape with three row×column intersections** (`index.html:22149`); the player never rolls a balance. The audit's own alternative was to move `lookup2` past `balcheck`, which costs Data & Lookups a free drill to fix a requirement that is not real | map only |
| **D-10** | **`circularity-avoidance` added to the REQUIRES of `intsched` · `revolver` · `debtsched`** | AMEND (graph) | audit §3.2: all three compute interest off a **beginning balance** — which *is* the circularity dodge — and none of them ever says so | map only; the three drills already do it, and their `guide`/`aha` gain one clause each in Phase C |
| **D-11** | **within-chapter re-orders in c2–c8 (audit Option A)** | RE-ORDER | no drill crosses a chapter except the five in D-5. Every other chapter is sorted to open on its lowest par and to put teachers ahead of users: c3 `margin` moves ahead of `bridge`/`cagr` (it teaches `growth/CAGR`); c4 `sort` ahead of `scrub`; c5 `wrapfix`/`audit` to the head; c6 `retbridge` ahead of `txncomps`/`comps` (it teaches `bridge`); c7 `covtable` and `wk13` to the head; c8 `threestmt`/`dashcover` to the head | GROUPS only. Fixes the audit's worst live jump (`scrub` 21 → `series` 44, ×2.10) by seating `rowops` between them |
| **D-12** | **`nwcsched` is NOT a capstone** | NO CHANGE | v1 designated it the ninth capstone because nine chapters needed nine. Eight chapters need eight and all eight exist, so `nwcsched` stays an ordinary Full Builds drill and the achievement id `cap_c9` is never minted | none (this row exists only to withdraw a v1 delta) |
| **D-13** | **`HOTKEY_PREMIUM.groups` UNCHANGED** = `['Formulas II','Models I','Models II','Full Builds']`; `enabled` still `false`; each PRO group gains `unlock_level` 13/16/19/22 | ADD (field) | §3 | one field per PRO group; `dev/check-paywall.js` §1 ("flag off = zero visible change") re-runs both states unchanged |
| **D-14** | **`HOTKEY_GATES` RETIRED** | RETIRE | P1 — one ladder | delete `window.HOTKEY_GATES`; `drillLocked()` / `openGateInfo()` re-point to the capstone + level answer; `check-invariants` C1's gate-bypass assertion retires with it |
| **D-15** | **`HK_TRACKS` UNCHANGED in shape; 3 keys change track** | RE-DERIVE | P7, §4 | TRACKS — `dev/migrate-certificates.sql` + the newest `issue_certificate` migration regenerate in the **same PR** (r359). C14 guards it |
| **D-16** | **achievements UNCHANGED** | NO CHANGE | every group name survives the redirect, so `x_found` `grp1` `grp2` `grp3` `grp4` keep their strings and `cap_c1`–`cap_c8` keep their targets. Goals re-derive from the new chapter sizes, which is arithmetic, not an id change (P8 holds) | goal numbers only |
| **D-17** | **`HK_PLACEMENT` = `corridor · combo · margin · sort · opmodel`** | RE-POINT | `navigation` retires (D-4), so the movement probe re-points at the level that absorbed it. But `corridor` is a ~90 s board where `navigation` was 20 s, which makes the placement three times longer at its cheapest step — **§8 D-6** | `HK_PLACEMENT[0]`; re-sweep the band boundaries once the level pars are measured |
| **D-18** | **marketing count 74 → 84** | COUNT | `menuOrder.length` is the source of truth | `index.html:7, :11, :18` · `About.html:14, :21` · enterprise / billing copy · the `e2e-smoke` drill-count guard |
| **D-19** | **SEO pages +11, −1** | GENERATE | one page per new key; `navigation`'s 301s to `corridor` | `dev/build-drill-pages.js` → `drills/*.html` ×11 + `sitemap.xml` |
| **D-20** | **`dev/check-curriculum-map.js` wired into gate.yml's fast lane** | ADD (CI) | the violation check as a CI invariant, landed in Phase A so the map cannot rot between phases | one line in the "Static guards" step; it reads one JSON, runs in well under a second, and is never scope-gated |

**Not touched, deliberately:** drill keys (bar the two retirements) · `HK_RANK.TIERS` · localStorage
keys · `HK_BAND` · `HOTKEY_PRO.plans` · every existing drill's board, beats, par and checks (this
phase is a map, not a rework) · `hkCapstoneOk()` (already shared, and `hkCapstoneDone()` already
returns false for any key absent from `menuOrder`, so nothing NaNs before the Phase C builds land).

---

## 7 · The spine, as text

par by position inside each chapter; `★` = the capstone. The four Foundations **levels** are exempt
from the spine and print without a rung marker — a 60–120 s multi-act teaching board is not a speed
rung, and Foundations' first rung is its capstone. The floor the checker enforces on everything else
is the audit §2.3 drop threshold: **par(i+1) ≥ 0.63 × par(i)**.

```
  c1 Foundations      90 → 105 → 110 → 100 → 35★
  c2 Formatting       16 → 22 → 24 → 25 → 27 → 31 → 34 → 36 → 42 → 44 → 47★
  c3 Formulas I       21 → 22 → 29 → 40 → 33 → 36 → 35 → 44 → 64 → 80 → 94★
  c4 Data & Lookups   22 → 22 → 25 → 26 → 31 → 21 → 30 → 44 → 59 → 80 → 92 → 90★
  c5 Formulas II      26 → 28 → 35 → 36 → 37 → 40 → 48 → 52 → 64 → 66 → 97 → 90★
  c6 Models I         35 → 40 → 56 → 52 → 65 → 70 → 85 → 89 → 92 → 112 → 88★
  c7 Models II        26 → 36 → 45 → 69 → 71 → 72 → 77 → 77 → 86 → 95 → 161★
  c8 Full Builds      45 → 47 → 64 → 66 → 70 → 71 → 84 → 85 → 102 → 113 → 110★
```

**Jumps > ×1.6 — one left, from sixteen.** (The audit counted 16 on the live catalog, headed by
`navigation 20 → filldr 44` ×2.20 — "the product's whole retention problem in one number". Both ends
of that jump have moved: `navigation` is act 1 of a level, `filldr` sits mid-Formulas I behind four
levels and eleven Formatting drills.)

| jump | ratio | verdict |
|---|---|---|
| c7 `revolver` 95 → `cascade` 161 | ×1.69 | the capstone, and the audit already called this one legitimate |

**Both chapter-level inversions are gone.** Foundations (mean 37) was harder than Formatting (mean 30);
c1's only graded rung is now `modeltour` at 35, and c2 opens at 16. And Full Builds (mean 75) was
*easier* than Models II (mean 79); the re-orders leave c8 (mean 76) above c6 (mean 73) and beside c7.

**Par estimates.** The 11 new pars are **estimates**, except `qclose` — DEPTH_PASS §4.32 records it
measured at **94** (median 86 keys; capstone clock pass 188). The four level pars (90 / 105 / 110 /
100) are the roughest numbers in this file: they are Wolf's "5–8 minutes on a first play, replayable
for time" translated into a *replay* par, which is what a par is. Every new par is re-measured by
`dev/e2e-par-sweep.js` when the drill builds, and the checker re-runs on the real numbers.

---

## 8 · DECISIONS — for Wolf, recommendation first

**RESOLVED 2026-09-03, by Wolf, and encoded above — not re-litigated here:**
**(R1)** Level 1 **replaces** the Keyboard Tour entirely; `keyboardtour` retires and its runtime (HUD,
stage cards, tier reveals) survives as the level machinery (§6 D-3). **(R2)** Levels **post to
leaderboards** like any drill — timed, generous pass clocks, ☆ visible. **(R3)** The level names *The
Corridor · The Repair Shop · The Power Grid · The Print Shop* are **placeholders**, kept as such;
renaming them costs nothing while the keys stay `corridor` `repairshop` `powergrid` `printshop`.

| # | question | recommendation | what turns on it |
|---|---|---|---|
| **D-1** | **`pastes` goes to Formatting, not Data & Lookups** — the one destination in §6 D-5 that differs from the sketch. | **Formatting.** Inside Data & Lookups it must precede `drill`, `lookup2` and `recon`, which puts par 42 ahead of `drill` 22 — a ×0.52 spine break the checker fails. In Formatting it lands at 42 between `autofit` 36 and `housestyle` 44 with the chapter still monotone. Three of its four routes are presentation ops anyway. | c2/c4 sizes; rule (f) |
| **D-2** | **A level's pass clock.** Every other drill passes at par × 2.0. A level is a four-act teaching board a player meets cold. | **Pass = par × 2.5 for the four levels only**, par × 2.0 everywhere else. At ×2.0 a first play of a 110 s board fails on the clock while the player is still reading act 3's card, which is exactly the "punished for learning" feeling the tutorial exists to remove. | `HOTKEY_CLOCKS`; the level contract |
| **D-3** | **How a level scores — one rule for all four.** Pips, time, or lives? | **Pips + the clock; no lives.** Each act's targets are a **touch-list of pips** (the corridor's own §2.6 machinery, generalized): a pip lights when its target reaches its end state, the act completes when its pips are all lit, and the drill's *score* is the clock, exactly like every other drill. **No lives, no fail state** — a wrong move simply does not light a pip. Lives would make the tutorial punish exploration, and the Freedom Doctrine says the slow route is always legal. | the act controller (§9.0); the HUD; `e2e-depth-mechanics` |
| **D-4** | **First play vs replay.** A level teaches on play 1 and is a time-attack on play 5. | **The HUD's instruction line shows on the first play and hides on replays** (latch per level key, same shape as `hk_tour_done_v2` but per drill); the **clock always runs, and the first play posts** like any other run. Hiding the clock on play 1 would make the first PB a lie and break the leaderboard's honesty (R2). | the level contract; `recordRun` |
| **D-5** | **Certificate scope moves under live players.** `filldr` `rowops` `editfix` leave `fluency` for `formulas`; four levels join `fluency`. | **Ship it with the r158 softener:** a player who has already *earned* a certificate keeps it (server-side issuance untouched); only in-progress scope moves, and the profile shows the new scope with the old one struck. This is three keys, where v1 moved fourteen. | `migrate-certificates.sql`, the RPC arrays, C14 |
| **D-6** | **`HK_PLACEMENT`'s movement probe.** `navigation` (20 s) retires into `corridor` (~90 s), so the placement's cheapest step triples. | **Keep `corridor` as the probe for now and re-sweep the bands when its par is measured.** If the placement then reads too long, drop to four probes (`combo · margin · sort · opmodel`) rather than inventing a short movement board that duplicates act 1 — the placement's job is banding, not teaching. | `HK_PLACEMENT`, the band boundaries |
| **D-7** | **Foundations is now the shortest chapter (5) and the free tier lost a drill (40 → 39).** | **Accept.** Chapter size is not the unit a player feels; time is, and five levels plus `modeltour` is 8–10 minutes of first play against the old seven drills' four. The free tier also *gains* the whole of `Data & Lookups`, which `HOTKEY_GATES` walls today. | landing copy; the "84 drills" count |
| **D-8** | **The four earn-in levels 13 / 16 / 19 / 22.** | **Accept as recommended.** Straight line, three levels per PRO chapter, last chapter at 22 rather than v1's 25 because there are four PRO chapters, not five. If it reads too steep at playtest, flatten the tail (13/16/18/20) rather than the head — the head is the conversion moment. | the landing's ladder band, `unlock_level` |

---

## 9 · THE FIVE FOUNDATIONS LEVELS

### 9.0 What a level IS — the shared contract

A **level** is a timed catalog drill with three or four **acts** on one board. It is not a lesson
(there is no untimed card before the clock) and not the Tour (there is no exemption from `checkWin`,
PB, ghost, xp or the leaderboard). What makes it a level rather than a long drill is three things,
all of which already exist in the engine and only need re-scoping:

| piece | today | as level machinery |
|---|---|---|
| **the act card** | the Tour's stage card — scrim + ring, title, ≤ 60-word body, keycap strip, any key dismisses (`TUTORIAL_CHAPTER_SPEC` §3.0.4, markup reused from the modal tour) | renders between acts, ≤ 4 per level. **The clock does not stop for it** — that is the whole difference from a stage card, and it is why the ≤ 60-word cap is a hard cap |
| **the HUD** | the TUTORIAL HUD banner + nudge-after-three-wrong-keys (§3.0.2) | the per-act banner. Shows on the **first play only** (§8 D-4); on replays the checklist alone carries the beats |
| **the reveal** | the Tour's staged board + DEPTH_PASS §2.5's tier ladder | act N+1's region is drawn dim and paints in live when act N's pips are all lit |
| **the pips** | the `navigation` corridor's pip/touch-list (`index.html` corridor machinery, DEPTH_PASS §2.6) | generalized: every act owns a touch-list, a pip lights on its target's END STATE (never on a keypress), and the act completes when its list is clean |

**The one genuinely new piece** is an **act controller**: `S.act`, an act-scoped slice of the
checklist (`updateChecklist` already renders a slice for the Tour — the same code, without the
`tourMode` bail), and an act-completion handler that fires the reveal and the next card. Everything
else is a re-point. Build the act controller before any level.

**Scoring, per §8 D-3:** pips per act, no lives, the clock is the score. **☆ per level: exactly one,
visible** (`bonus:true, reveal:true`), and it is always an *efficiency* discovery, never a formatting
task and never a stamp (DEPTH_PASS §1.0(d)). **Alts ×2 per level**, one of which is the ☆-forfeit
control. **Grading law, binding (DEPTH_PASS_CAMPAIGN §1):** never grade formula TEXT and never grade
a KEYPRESS in a core beat.

---

### 9.1 `corridor` — **"The Corridor"** ★ LEVEL 1 · c1 · *name is a placeholder (R3)*

**Game.** You are inside the model, and the model is a maze. Act 1 is the existing switchback
corridor — solid walls, one straightaway per press, pips down every hall. Act 2 knocks the walls down
and turns the room into a live sales table you must **capture** block by block: the CAPTURE memo names
a target, you stretch a selection onto it exactly, the block lights and the next target names itself.
Act 3 is the run home — teleport to the far corner, take the model block, carry it to the home bay and
save. **Score:** pips — 1 per corridor hall, 1 per captured block, 1 per delivered thing. **Lives:**
none; a wrong capture just fails to light. **Feel:** the first minute of the product, and it should
feel like a game before it feels like Excel.

**Board, per act.**
- **Act 1 — THE CORRIDOR.** `navigation`'s board verbatim (D-4): one long switchback of solid walls,
  a pip at the end of every straightaway, the model block parked at the far corner. The wall past the
  model breaks open for a player who would rather walk than fly.
- **Act 2 — CAPTURE.** The walls clear; the corner block becomes a regional sales table (Region ×
  Q1–Q4 + FY, 8 regions), pre-dressed. A **CAPTURE** memo to the right names four targets one at a
  time, in this seed's words: *the West row · the Q3 column · the whole table · every typed figure.*
- **Act 3 — THE RUN HOME.** The whole page, a marked **home bay** at A1, and the model block still
  parked at the far corner.

**Concepts taught (tags).** `move` · `jump(ctrl-arrow)` · `select` · `select-edge` · `row/col-select` ·
`goto-special` · `copy/paste` · `save`

**Beats.**
- Act 1: (1) Clear the first hall · (2) Clear the corridor to the far corner · (3) Reach the model block
- Act 2: (4) Capture the {West} row of figures, Q1 through FY · (5) Capture the {Q3} column, every
  region · (6) Capture the whole table, headers and figures · (7) Capture every typed figure on the
  table in one pass
- Act 3: (8) Copy the model block · (9) Deliver it to the home bay · (10) Save the workbook
- **☆ (visible): take every hall in one press** — no arrow-walking anywhere in act 1.

**Random.** Corridor layout (the existing seed pool) · which row and column the CAPTURE memo names
(pools) · the table's anchor (3 spots) · values.

**Aha, per act.** A1: "the keyboard flies — one press per hall, not one per cell." A2: "a selection
is a rectangle you grow from where you stand; ctrl+shift grows it to the edge." A3: "F5 → Special
selects a whole class at once — every typed number, or every formula."

**Par estimate.** ~90 s (replay par; a first play runs 3–4 minutes). Pass = par × 2.5.

**Engine.** Reuse: the corridor pip/touch-list (§2.6) for act 1 · `S.sel` end-state grading for act 2
(the r429 `selOps` telemetry already records chord-vs-arrow for the ☆) · `F5 → Special` (wired) · the
save latch. **New:** the act controller (§9.0) — this is the level that builds it.

**Alts.** (1) Walk the corridor cell by cell and select block by block with plain Shift+arrows —
every core beat clears, **☆ forfeited** (the ☆-forfeit control). (2) `Ctrl+Space` / `Shift+Space` for
beats 4–5 instead of `Ctrl+Shift+arrows`, and `Ctrl+A` for beat 6 — the star route.

---

### 9.2 `repairshop` — **"The Repair Shop"** ★ LEVEL 2 · c1 · *placeholder name*

**Game.** A page comes in broken and you fix it, then you move it, then you rebuild the floor it sits
on. Act 1 is a **hunt**: three typos and two wrong entries are planted, F2 fixes what is nearly right,
Delete-and-retype fixes what is not — and one of them is an **undo trap**, a cell that looks wrong,
is right, and costs a pip when you clear it (Ctrl+Z gives the pip back; Ctrl+Y takes it away again if
you overshoot). Act 2 is a **delivery**: cargo blocks with marked destination bays — cut what moves,
copy what is needed in two places. Act 3 is **the missing floor**: a schedule with a row and a quarter
missing, two squatter rows to delete, a detail band to fold away, and one formula that floods the
rebuilt frame with Ctrl+D / Ctrl+R. **Score:** pips per repair, per delivery, per floor. **Feel:**
competent, fast, slightly smug — the first time the player fixes something.

**Board, per act.**
- **Act 1 — REPAIRS.** A team roster and a small cost block: `Marketng` misspelled, a rate typed into
  the wrong column, a headcount entered as text, one duplicate row marked `DUPLICATE — delete`, and
  **one cell the review note flags that is actually correct** (the trap).
- **Act 2 — THE DOCK.** Three cargo blocks on the left, three marked bays on the right; one block's
  bay note says *"and leave a copy where it is"*.
- **Act 3 — THE MISSING FLOOR.** A four-quarter schedule missing its `Q3` column and its `Other`
  line, two squatter rows below it, a detail band of six rows under the total, and one built formula
  in the top-left of the empty grid.

**Concepts taught (tags).** `enter/edit(F2)` · `clear/delete` · `undo` · `redo` · `cut` ·
`fill(D/R)` · `insert/delete row-col` · `schedule` · `hide/unhide/group`

**Beats.**
- Act 1: (1) Fix the misspelled team name · (2) Re-enter the two figures that landed wrong ·
  (3) Delete the duplicate row · (4) Restore the cell the note was wrong about
- Act 2: (5) Move each cargo block to its bay · (6) Leave the shared block in both places
- Act 3: (7) Insert the missing line and the missing quarter · (8) Delete the two squatter rows ·
  (9) Flood the schedule from the built formula · (10) Fold the detail band away
- **☆ (visible): deliver every block with one cut** — no copy-then-delete anywhere in act 2.

**Random.** Which name carries the typo (pool) · which two figures land wrong · which cell is the
trap · bay positions · the missing quarter · values.

**Aha, per act.** A1: "F2 edits in place — you do not retype a cell to change one letter, and
Ctrl+Z is free." A2: "cut moves, copy duplicates — the clipboard is a verb, not a place." A3: "a
schedule is a frame; add a row and everything in it arrives already dressed."

**Par estimate.** ~105 s. Pass = par × 2.5.

**Engine.** Reuse: the act controller · `insert/delete row-col` and the outline/group ops (all
wired) · the fill ops. **New:** the **undo trap** needs a pip that can go dark again — the touch-list
already re-evaluates end states on every commit, so this is a predicate, not a mechanism. Nothing
else.

**Alts.** (1) Retype every broken cell in full instead of F2, and copy-then-delete every cargo block
— all cores clear, **☆ forfeited** (the control). (2) `Ctrl+9` to hide the detail band instead of
grouping it — beat 10 clears on the end state (the band is not visible), and the group route is what
`unhide` (c4) later reps.

---

### 9.3 `powergrid` — **"The Power Grid"** ★ LEVEL 3 · c1 · *placeholder name*

**Game.** The page is a grid of dark cells and formulas are the current. Act 1 is **power-up**: you
point a formula at its feeds and the cell lights — but the cost feeds arrive **positive**, and a cell
fed by a wrong-signed input lights red instead of green until you flip it. Act 2 is **the corridor
sum**: `Alt+=` runs a total down a whole hall of lit cells in one press. Act 3 is **the lock**: one
formula, one `F4`, filled down and right, and the entire grid comes up at once — the level's payoff
image. **Score:** pips = lit cells; a red cell is a pip you have not earned yet. **Feel:** the moment
the whole board lights is the single best five seconds in the tutorial. Build for that.

**Board, per act.**
- **Act 1 — POWER-UP.** A five-line divisional P&L (Revenue · COGS · Gross profit · Opex · EBITDA) ×
  Q1–Q4, with Gross profit and EBITDA empty, and **three of the four cost lines entered positive**.
  A CONVENTION memo states the house rule in words: *costs are entered negative, so a total is
  always a plain sum.*
- **Act 2 — THE HALL.** A Total column opens to the right of the P&L, and a Margin line opens
  beneath it.
- **Act 3 — THE GRID.** A units-by-product × region grid appears below, with a single bordered
  **price helper** cell and an empty Revenue grid of the same shape.

**Concepts taught (tags).** `point-mode` · `sum(Alt=)` · `margin/ratio` · `anchor($/F4)` ·
`mixed-anchor` · `sign-convention` · `costs-negative`

**Beats.**
- Act 1: (1) Flip the cost lines that were entered positive · (2) Build Gross profit for Q1 —
  revenue plus the signed cost line · (3) Light the rest of the Gross profit row · (4) Build EBITDA
  for every quarter
- Act 2: (5) Total every line across the year · (6) Build the gross margin — gross profit over
  revenue, every quarter
- Act 3: (7) Build the top-left Revenue cell — units against the price helper · (8) Light the whole
  Revenue grid
- **☆ (visible): light the grid from one anchored formula** — the lock made with `F4`, not typed.

**Random.** Which three cost lines arrive positive (4 pools) · the division-name pool · grid size
(3×3 or 4×3) · helper position (3 spots) · values.

**Aha, per act.** A1: "costs go in negative, so a total is always just a sum — the sign does the
arithmetic for you." A2: "a formula points at cells; point with the arrows and Alt+= writes the sum."
A3: "one `$` pass, twelve cells — the lock is where the speed lives."

**Par estimate.** ~110 s (the longest level). Pass = par × 2.5.

**Engine.** Reuse: the act controller · point-mode · `cycleAnchor()` (`index.html:25897`) already
sets `S.f4Used`, which is the ☆ predicate · the fill ops. **New:** the **red/green cell state** for
act 1 — a per-cell render class driven by the existing ok-predicate, not a new grading path.

**Alts.** (1) Type every reference and every `$` by hand, twelve formulas in act 3 — all cores clear,
**☆ forfeited** (the control). (2) Retype each positive cost with a leading minus instead of pasting
a −1 over the block — beat 1 grades the **value on the board**, so both clear (DEPTH_PASS_CAMPAIGN §1).

---

### 9.4 `printshop` — **"The Print Shop"** ★ LEVEL 4 · c1 · *placeholder name*

**Game.** The page is right and looks wrong, and you have two ways to fix every part of it: the chord
and the ribbon walk. Act 1 is **the exchange** — every figure must wear the right format before it
counts: comma, dollars, percent, decimals, and negatives in parentheses. Act 2 is **blue ink** —
typed inputs blue, formulas black, headers bold, and `F5 → Special` finds the typed ones in one pass.
Act 3 is **the frame** — headers centred, a rule above the total, a box around the block, columns
autofitted. Threaded through all three is **the menu maze**: every command has an `Alt` walk
(`Alt H 9`, `Alt H F C`, `Alt H A C`, `Alt H B T`, `Alt H O I`), and the ☆ is clearing one whole act
by ribbon walk alone. **Score:** pips per formatted region. **Feel:** the page goes from a
spreadsheet to a document in ninety seconds.

**Board, per act.** One monthly summary page, built once and revealed by act: a title, a header row
(not bold), four labelled lines (Revenue · Costs · Profit · Margin) × six months with figures raw
(`1234567.891`, `0.0834`, one negative), a Total line with no rule above it, one typed assumption
cell in black, and two columns too narrow to show their numbers. Act 1 opens the figure block, act 2
opens the header row and the assumption cell, act 3 opens the frame and the narrow columns.

**Concepts taught (tags).** `comma/currency-fmt` · `decimals` · `percent-fmt` · `parens-negative` ·
`bold/italic/color` · `blue-inputs` · `align` · `borders(top/outside/bottom)` · `autofit`

**Beats.**
- Act 1: (1) Dollar-format the figure block · (2) Step the decimals to the house standard ·
  (3) Percent-format the Margin line, one decimal · (4) Show the negative in parentheses
- Act 2: (5) Colour the typed assumption blue · (6) Bold the header row
- Act 3: (7) Centre the month headers over their columns · (8) Rule the Total line · (9) Box the
  figure block · (10) Fit the two narrow columns to their contents
- **☆ (visible): clear a whole act from the ribbon** — one act, start to finish, on `Alt` walks only.

**Random.** Which line carries the raw percent (Margin or a seeded Growth line) · header pool (months
vs quarters) · which two columns are narrow · anchor jitter · values.

**Aha, per act.** A1: "a number and its format are two different things — the cell did not change,
only what it wears." A2: "blue means somebody typed it; black means the sheet worked it out." A3:
"Alt walks the ribbon — every command on it is three letters away."

**Par estimate.** ~100 s. Pass = par × 2.5.

**Engine.** Reuse: the act controller · `fmtOps`, `fmtOps.dec`, `fmtOps.align`, the border ops and
autofit (all wired) · `introRibbonPeek`'s content (`index.html:31745`), which becomes act 3's card.
**New:** a **route counter** for the ☆ — the engine must know an act's beats all landed by ribbon
walk. `fmtOps` already records the op; it needs the route beside it (one field), and the ☆ reads it.
This is a bonus predicate only — **never a core beat** (grading a keypress in core is the class that
retired `hunt`).

**Alts.** (1) Do every beat with `Ctrl+1` and the dialogs — all cores clear, **☆ forfeited** (the
control). (2) Chords throughout (`Ctrl+Shift+1/4/5`, `Ctrl+B`) — cores clear, ☆ forfeited; note the
route facts: `Ctrl+1 P` lands one decimal where `Alt H P` lands zero, `Ctrl+1 N` lands zero where
`Alt H K` lands two, and both `currency` and `acct` clear a dollar beat.

---

### 9.5 `modeltour` — **"Model Tour"** ★ LEVEL 5 / CAPSTONE · c1 — **built, refresh only**

Unchanged as a board. `modeltour` is already Foundations' capstone, already `cap_c1`'s target, and
already "four subtotals blown to `#REF!` in a live P&L: rebuild the cascade, land both margin rows,
dress the bottom line". The audit's complaint about it — *"a Formatting exam wearing a Foundations
badge"* — is answered by construction in v2: L4 The Print Shop teaches the whole format vocabulary
two boards earlier, so the capstone now **chains** what the chapter taught instead of introducing it.
That is exactly what checker rule (b) asserts, and it is why `cap_c1` never re-points (r158).

**Refresh, Phase C, one pass:** its `guide` and `aha` reference the levels by name rather than the
retired Tour; its par (35) is re-swept once the levels land, because a player arriving off four levels
is a different player from one arriving off `navigation`.

---

### 9.6 `tapepull` — "Tape Read" · name `Tape Read` · label `Read the tape` · tab `Tape` — **ADD (c4 opener)**

*Not a level and not a lesson — an ordinary timed drill that happens to be Data & Lookups' first and
cheapest board. It exists because the graph forces it: **`VLOOKUP`** has three users and no teacher
(`lookup` teaches INDEX/MATCH *instead*), and **`stat-fn(MEDIAN/AVERAGE)`** is demanded at `recon`
and taught thirteen positions later at `wacc`. One 22-second board closes both.*

**Board:** a ten-row deal tape — Company · Sector · EV/EBITDA · EBITDA — with a two-cell **ASK** panel
to the right: *"the multiple on &lt;company&gt;"* and *"the median multiple on the tape"*. The tape's
first column is the label column, so a left-to-right read works. 16 rows used, pre-dressed.

**Beats:** (1) Build the multiple read — the ASK panel's company, off the tape · (2) Build the median
multiple for the whole tape · (3) Add the sector median under it — the sector the ASK panel names ·
(4) Add a top border above the two median lines.
**☆ (visible): answer both reads from one anchored formula filled down.**

**Random:** which company the panel asks for (10 pools) · which sector (3 pools) · multiples and
EBITDA values · whether the ASK panel sits right or below. **Aha:** "a lookup answers one row; a
median answers the column — and the median is what a comps page actually quotes." **Par estimate:**
~22 s. **Engine:** none — VLOOKUP since r416, MEDIAN and AVERAGE since the `wacc` build.
**Alts:** (1) `INDEX`/`MATCH` for beat 1 instead of `VLOOKUP` — **both must clear**, this is the r436
untriggerable-beat lesson; (2) two separately typed medians with no fill (**☆ forfeited**, the control).

**Binding constraint:** grade the **value returned**, never the function name. A `VLOOKUP`, an
`INDEX`/`MATCH`, a typed reference to the right cell and an `XLOOKUP`-shaped `INDEX` must all clear
beat 1 if the number on the board is right.

---

### 9.7 `rollfwd` — "Roll Forward" · name `Roll Forward` · label `Open, add, less, close` · tab `Roll` — **ADD (c7 opener)**

*The Models II opener, and the drill that names the thing the catalog does everywhere and says
nowhere: interest computed off a **beginning** balance is the circularity dodge. At par 26 it also
gives Models II a rung below `covtable` 36, which is what lets the chapter open on its own lowest par.*

**Board:** one facility, four years, laid out as a corkscrew — **Opening balance · Drawdown ·
Repayment · Closing balance** — with year 1's opening balance seeded (blue) and everything else empty.
Below it, an **Interest** line and a one-cell rate (blue). A memo names the house rule: *interest is
charged on the opening balance.* 13 rows used.

**Beats:** (1) Build the year-one closing balance — opening plus the draw, less the repayment ·
(2) Reference year two's opening balance to year one's close · (3) Fill the schedule across the
remaining years · (4) Build the interest line — the rate on each year's opening balance.
**☆ (visible): fill the whole schedule from one column.**

**Random:** the number of years (4 or 5) · draw and repayment pools · the rate · whether the rate cell
sits above or beside the schedule. **Aha:** "the close is the next open — and interest goes on the
open, which is how a model avoids calculating in a circle." **Par estimate:** ~26 s. **Engine:** none
— the corkscrew is `schedule`'s own shape at a quarter of its size. **Alts:** (1) build all four
closing balances by hand and reference each opening separately (**☆ forfeited**, the control);
(2) `Ctrl+R` fill from a selection, and a typed `$` instead of `F4` on the rate.

---
## 10 · THE FIVE CAPSTONE PAGES, refreshed to the r452 law

These five are the unbuilt ADDs `dev/DEPTH_PASS.md` §4.32 / §4.44 / §4.56 / §4.67 / §4.88 carry
(DEPTH_PASS_CAMPAIGN §0: *"the unbuilt capstone ADDs (`redflags` `pitchpage` `shipit`), the qclose
port"*). The concepts, boards and gates below are those pages; what is refreshed is everything the law
has moved on since they were written:

- **§1.7 THE LANGUAGE STANDARD** — every check label opens with a **closed-list verb**, names the
  board's own label, states an **observable end state**, and carries **no chord** (§1.7 R3/R7). The
  r420c recalibration also strips route prescription: "filled across", "pointed", "one SUM filled
  down" leave the labels and live in `guide`/`req`/demo.
- **§1.0(d) — the ☆ is an efficiency discovery, never a formatting task.** Three of the five pages
  carried a formatting or a stamp ☆; all three are re-cut below, and the change is flagged per page.
- **§2.4 capstone law** — LAST in the chapter, chains that chapter's skills into one artifact, one
  CLEAN RUN opens the next chapter's progression artifacts (time irrelevant, unlimited retakes), pass
  clock = par × 2.0, and **a bonus never gates anything, including a chapter**.
- **DEPTH_PASS_CAMPAIGN §1 route facts, binding, do not re-derive:** never grade formula TEXT and never
  grade a KEYPRESS in a core beat (13 untriggerable beats, every one found by walking a route) ·
  percent: `Ctrl+1 P` lands one decimal, `Alt H P` and `Ctrl+Shift+%` land zero · comma: `Ctrl+1 N`
  lands zero decimals, `Alt H K` and `Ctrl+Shift+!` land two · money: `currency` **and** `acct` both
  clear a dollar beat unless the label says accounting · borders: a 1×1 outside border stores `ball`,
  not `bt` · font group: `Alt H 1/2/3` = Bold / Italic / Underline · SUMIF matches exact equality only.
- **§1.8** — ≥ 2 registered alt-paths each, one of them the ☆-forfeit control.

---

### 10.1 `qclose` — "Close the Quarter" ★ CAPSTONE c3 · L

**Status:** built in r429 (H6b-5) and never ported into the live catalog — DEPTH_PASS_CAMPAIGN §0 calls
it "the deferred qclose port". Phase C ports the existing build and re-labels it to the lines below.
**Par: 94** — measured, not estimated (median 86 keys, 0 % drift, 1.09 s/key); capstone clock pass 188.

**Concept:** one quarterly P&L page built cold from a feed — chapter c3’s five formula shapes in one
artifact [Checkpoint-Staged Build + Rebuild the Output Page].
**Board:** title row; Q1–Q4 + FY headers; a revenue feed row (blue); COGS and opex rows (blue, signed);
empty subtotal, margin and growth rows; a small segment ledger island for the memo; 16+ rows used.

**Beats:**
1. Build the gross profit line — revenue plus the signed cost lines, every quarter
2. Total the fiscal-year column — every line on the page
3. Build the gross margin row — gross profit over revenue, every quarter
4. Build the growth row — each quarter against the one before it
5. Build the segment memo — each segment's revenue, off the ledger island
6. Bold the gross profit line and add a top border above it *(§1.1 tight-pair exception)*

☆ (hidden): **Enter the tie check** — the fiscal-year gross profit against the four quarters summed
across. Two independent routes to one number; it reads zero when the page is right.

**Gate:** one clean run opens c4 Data & Lookups. **Random:** value pools · segment pools · which opex lines
appear (4 of 6) · the margin/growth row order. **Aha:** "a P&L is five formula shapes — point, fill,
lock, grow, roll up — run in one breath." **Finish:** beat 6. **Clocks:** par 94, pass = par × 2.0.
**Engine:** none beyond existing fns. **Plumbing:** §6 D-7.
**Alts:** (1) leave the check cell untouched — all six cores clear and the capstone still opens c4
(**☆ forfeited** — the control, and the §2.2 proof that a bonus gates nothing); (2) type each segment's
SUMIF separately instead of one anchored formula filled down — cores clear.
**Recorded deviation (r429, kept):** the ☆ is the independent-prove-out family's third use in the
chapter, past the §1.0-R3(o) twice-per-chapter cap. Kept on the same reasoning as r429: for the drill
that gates the next chapter, *does it tie?* is the only honest close.

---

### 10.2 `cleanroom` — "The Data-Room Tape" ★ CAPSTONE c4 · L

**Concept:** chapter c4 chained on one artifact — a dirty data-room export becomes the sendable summary
[Clean → Aggregate → Present Pipeline].
**Board:** a 14-row deal tape with a duplicated header and a `--- PAGE 2 ---` break row planted; a
Status column; a query panel; a summary strip; 18+ rows used.

**Beats:**
1. Delete the two junk rows — the duplicated header and the page-break line
2. Sort the tape largest-first — every row travels whole
3. Filter the tape to the open deals
4. Build the top-deal read — the largest open deal's fee, into the panel
5. Total the open deals in the summary strip
6. Group the tape and fold it — the summary stands alone *(tight pair)*

☆ (hidden): **Fold the detail with the outline rather than hiding the rows one at a time** — one group,
one fold, and the detail comes back for the next reader.

**Gate:** one clean run opens c5 Formulas II. **Random:** junk-row positions · tape values and names ·
which status the panel asks for. **Aha:** "clean, sort, filter, pull, present — every data room ends in
the same five moves." **Finish:** beat 6. **Clocks:** par ~90 (estimate — measure at build), pass =
par × 2.0. **Engine:** `COUNTA` (r419) is useful in ok-predicates; **`SUBTOTAL` is not in the engine**,
so beat 5 grades a plain `SUM` per the `filterpass` convention — say so in a code comment.
**Plumbing:** §6 D-7.
**Alts:** (1) hide the detail rows individually instead of grouping (**☆ forfeited**, cores clear — the
control); (2) `INDEX`/`MATCH` for beat 4 instead of `VLOOKUP`, or the reverse — **both must clear**
(r436).
**r454 change vs DEPTH_PASS §4.44:** the page's ☆ was "Bold the summary strip's header and add a bottom
border under it" — a **formatting** task, which §1.0(d) bans as a ☆. Replaced with the outline-fold
efficiency above; the dress work stays where it belongs, inside beat 6's end state.

---

### 10.3 `redflags` — "The Red-Flag Pass" ★ CAPSTONE c5 · L

**Concept:** the flagship disclosed-error-count drill (§2.3). An inherited one-tab operating model with
**exactly 7** planted errors spanning the chapter's five families; fixing an upstream error recomputes
the board and **exposes** a downstream one [Cascading Bug Hunt + Audit-and-Repair with Disclosed Error
Count].
**Board:** an 18-row op model (revenue build → costs → EBITDA → margin → checks) carrying: 1 `#REF!`,
1 `#DIV/0!`, 1 stale v1 link, 1 cost line entered positive, 2 typed-over cells, 1 total that stops a row
short. The mix is FIXED at 7; positions and rows vary by seed. `errorCount: 7` puts the found-k/7 meter
on the rail.

**Beats:**
1. Fix the two error values — the `#REF!` and the `#DIV/0!` block the rows beneath them
2. Repoint the stale link at this year's page
3. Fix the total that stops short — it misses the last cost line
4. Flip the cost line that was entered positive
5. Repoint the two typed-over cells back at the panel they came from
6. Finish at the top of the page — the check row reads zero across

☆ (hidden): **Clear all seven without touching anything that was right** — nothing outside the seven
changes value.

**Gate:** one clean run opens c6 Models I. **Random:** every error's row and column · magnitudes ·
which cost family carries the sign error. **Aha:** "seven errors is a finite number — a review pass is a
hunt with a count, not a vibe." **Finish:** beat 6. **Clocks:** par ~90 (estimate), pass = par × 2.0.
**Engine:** r419 sentinels REQUIRED (live `#REF!` / `#DIV/0!` propagation); the §2.3 meter with
`errorCount: 7`; `F5 → Special` (taught by level 1, §9.1) is the fast route to beat 5 and is **never
graded** — grading the keypress is the class that retired `hunt` (DEPTH_PASS_CAMPAIGN §1).
**Plumbing:** §6 D-7; POOL candidate after calibration.
**Alts:** (1) fix the seven in board order, top to bottom, touching two correct cells on the way and
undoing them (**☆ forfeited**, cores clear — the control); (2) repoint the two typed-over cells by two
separate entries instead of one fill.
**r454 change vs DEPTH_PASS §4.56:** beat 1 was "Find and fix all 7 errors (0/7)" — two verbs and a
restatement of the meter, which is the rail's job, not a beat's. The seven are now distributed across
beats 1–5 by family, and the meter reads alongside them. The page's ☆ ("Enter your initials in the
review cell") was a **stamp**, not an efficiency (§1.0(d)); replaced with the precision bonus above.

---

### 10.4 `pitchpage` — "The Valuation Page" ★ CAPSTONE c6 · L

**Concept:** chapter c6’s outputs assembled into the one page a VP reads — reference, never retype
[Rebuild the Output Page + Narrative Deadline Skin].
**Board:** left = mini outputs "from the team", all live formulas, pre-built: a WACC cell, a
present-value total, a comps median multiple, a football floor/ceiling pair. Right = the empty pitch
page frame. 18 rows used.

**Beats:**
1. Reference the present-value total into the DCF value line — never retype it
2. Build the comps value line — the median multiple against this year's EBITDA
3. Build the range line — the low and the high across every method on the page
4. Build the value per share — the midpoint over shares outstanding
5. Dollar-format the value column
6. Bold the per-share line and add a top border above it *(tight pair)*

☆ (hidden): **Build the range line from one selection across every method** — one low and one high over
the whole block, not four references stitched together.

**Gate:** one clean run opens c7 Models II. **Random:** output values and magnitudes · which side hosts the
outputs · share counts. **Aha:** "a pitch page owns no math — every number on it is a wire into the
work." **Finish:** beat 6. **Clocks:** par ~88 (estimate), pass = par × 2.0. **Engine:** none new.
**Plumbing:** §6 D-7.
**Alts:** (1) build the range from four separate references (**☆ forfeited**, cores clear — the
control); (2) `Ctrl+1` for the dollar format instead of the ribbon walk — and remember **`currency` and
`acct` both clear beat 5** (DEPTH_PASS_CAMPAIGN §1); the label does not say accounting.
**r454 change vs DEPTH_PASS §4.67:** beat 3 named `MIN` and `MAX` outright — a Class-A answer leak
(AUDIT_R417 §D) — and beat 5 was a two-verb line. Both re-cut above. The page's ☆
(`=TODAY()` as-of stamp) is a **data entry**, not an efficiency (§1.0(d)); the stamp survives as part of
the board's frame, and the ☆ is now the one-selection range.

---

### 10.5 `shipit` — "Ship the Model" ★ CAPSTONE c8 · L

**Concept:** the catalog's endgame — a mini model built cold under the clock, and **it only counts if it
balances** [Timed Micro-Build with a Floor + Print-Ready Last Mile + Interview-Test Simulation].
**Board:** a drivers panel (typed, blue), an empty mini income statement (3 lines), a mini balance sheet
(2 sides), a cash link row, a check row, a headline box and a deck strip; the full 20 rows.

**Beats:**
1. Build the income statement — revenue off the growth driver, costs off their rates
2. Build both balance-sheet sides — retained earnings absorbs net income
3. Reference the cash close into the balance sheet
4. Build the check row — assets less liabilities and equity, every year; **it must read zero**
5. Paste the headline box into the deck strip as values — dead numbers travel
6. Bold the title and rule the bottom lines — the page ships *(tight pair)*

☆ (hidden): **Fill the whole plan from the first year in one pass**

**THE FLOOR (the drill's whole point):** the win requires the check row at zero. A fast broken model is
a loss. This is a **core** beat, not a bonus, and it is graded on the board's values — never on the
formula that produced them.

**Gate:** one clean run completes the catalog spine (the finisher badge path is unchanged).
**Random:** driver pools · line-item pools · magnitudes · corner jitter. **Aha:** "speed only counts
when the check row reads zero — balance is the floor, not the bonus." **Finish:** beat 6.
**Clocks:** par ~110 (estimate; expect the second-longest in the catalog behind `cascade`), pass =
par × 2.0. **Engine:** none new. **Plumbing:** §6 D-7; POOL candidate.
**Alts:** (1) build each plan year by hand with no fill (**☆ forfeited**, cores clear — the control);
(2) `Alt E S V` for beat 5 instead of `Alt H V V` — both are paste-values and both must clear.
**Wolf playtest, still open (DEPTH_PASS §4.88):** the par band, the balance-floor frustration curve,
and whether beat 5's deck hand-off belongs in core at all get set live with Wolf.

---

## 11 · What Phase B and Phase C read out of this file

| phase | reads |
|---|---|
| **B — the clean-slate entry** | §6 D-3 and §9.0–§9.1. B no longer "makes the Keyboard Tour the only first-run path" — it deletes the modal tour **and** retires the Tour, and points `obStart` / `showComfort`'s "basically none" branch at `corridor`. The Tour's runtime (HUD, act cards, tier reveals) is not deleted; it is re-scoped by the act controller. |
| **C — the level wave + the moves** | everything. Wave 1 = §9.0's act controller, then §9.1–§9.4's four levels. Wave 2 = §9.6–§9.7's two openers. Wave 3 = §10's five capstones. Assembly = §6's delta table, in order, with `dev/check-curriculum-map.js` green at every step and `dev/migrate-certificates.sql` in the same PR (§4). |
| **D — progression ties** | §3 (the capstone spine and `unlock_level` replace `HOTKEY_GATES`) and §5 (the "next up" selector). |
| **E — the launch homepage** | §1's table and §3's curve — the ladder band reads free / PRO / "unlocks at level N" per chapter **from the live config**, never hand-typed (the landing has zero hand-typed numbers). |

_End of the map. `node dev/check-curriculum-map.js` is the contract; this file is the reading of it._
