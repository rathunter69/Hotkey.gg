# CURRICULUM V3 — the nine-chapter map (r454, Phase A of `dev/CURRICULUM_REBUILD.md`)

_Status: **RECOMMENDED, PENDING WOLF.** Everything in §1–§8 that CURRICULUM_REBUILD §1 (P1–P8) already
settled is law and is marked as such; everything CURRICULUM_REBUILD §4 only *recommended* — the PRO
line, the level curve, the chapter ids — is carried here as the working answer and marked
**"recommended, pending Wolf"**. §8 is the short list of things this map could not settle from the
program spec. Once Wolf signs §8, this file is binding and Phase B/C build against it._

**Machine-readable twin:** `dev/curriculum-v3.json`. **Guard:** `node dev/check-curriculum-map.js`
prints `CURRICULUM MAP: 0 violations` and exits 0; it runs in gate.yml's always-on fast lane beside
`check-invariants`. Nothing in this document is hand-counted — every table below is generated off
that JSON.

**Inputs, in the order they bind:** `dev/CURRICULUM_REBUILD.md` §1 (P1–P8, law) · `dev/audit-r452/audit-catalog.md`
(the skill graph: 74 drills, 59 require-before-teach violations, the difficulty spine, options A–D and
the B-then-D-then-C recommendation) · `dev/TUTORIAL_CHAPTER_SPEC.md` §3.0–§3.4 (the Tour's six stages,
the four lesson pages) · `dev/DEPTH_PASS.md` §1.7 (the language standard), §2.4 (capstones), §3 (the
delta-table grammar), §4 (the five unbuilt capstone pages) · `dev/DEPTH_PASS_CAMPAIGN.md` §0–§1
(retirements, and the route facts a build agent must not re-derive).

**The headline.** 74 drills → **87** (74 + 8 lesson drills + 5 capstones), in **9 chapters**, plus the
Keyboard Tour outside the catalog. Every chapter ends on a capstone. **Require-before-teach violations:
59 → 0.**

---

## 1 · The nine chapters

Chapter ids are `k1`–`k9` (CURRICULUM_REBUILD §4.3 — *recommended, pending Wolf*), not an overload of
`c1`–`c8`; §6 D-14 carries the one-time claim-flag map. "entries" counts the Tour; "(drills)" is the
catalog count that `menuOrder.length` will report.

| # | chapter | tier | unlock | opening lesson | capstone | entries (drills) | what it teaches |
|---|---|---|---|---|---|---|---|
| k1 | **Keyboard** | free | — | `keyboardtour` (the Tour) | `modeltour` | 9 (8) | the whole keyboard grammar — move, select, enter, edit, structure, clipboard, save |
| k2 | **Build** | free | — | `lockref` | `qclose` | 12 (12) | a formula points at cells — sums, anchors, ratios, growth and roll-ups on a live page |
| k3 | **Format** | free | — | `ribbonpass` | `gauntlet` | 12 (12) | the banker's finish — weight, alignment, decimals, rules, widths and the house standard |
| k4 | **Structure & Data** | free | — | `tapepull` | `cleanroom` | 8 (8) | rows, columns, sorts, filters and the two ways to read a value out of a tape |
| k5 | **Audit & Repair** | pro | L13 | `tracepass` | `redflags` | 13 (13) | find the break — trace, show formulas, triage the sentinels, flip the signs, make it tie |
| k6 | **Components** | pro | L16 | `rollfwd` | `nwcsched` | 7 (7) | the parts a model is assembled from — corkscrews, schedules, bridges and scenario switches |
| k7 | **Valuation** | pro | L19 | `dcfsens` † | `pitchpage` | 10 (10) | what a company is worth — discount rate, free cash flow, DCF, comps and the page a VP reads |
| k8 | **Credit** | pro | L22 | `covtable` † | `cascade` | 8 (8) | the debt side — facilities, sweeps, waterfalls, covenants and liquidity under three cases |
| k9 | **Full Builds** | pro | L25 | `threestmt` † | `shipit` | 9 (9) | whole models, cold and under the clock — three statements, the DCF page, the paper LBO, the cover |

**† the three opener exemptions.** CURRICULUM_REBUILD P4 says every chapter opens with a lesson.
Nine chapters need nine openers: the Tour plus eight lessons — and the eight lessons are all pinned
early by the graph (selection, sums, anchors, signs and the ribbon are needed by k1–k3; the tape reads
by k4; tracing by k5; the corkscrew by k6). A lesson at the head of Valuation, Credit or Full Builds
would teach **nothing** — those three chapters introduce no tag the earlier eight have not already
taught — and the audit's own §3.1 discriminator kills a drill that teaches nothing and is not a
capstone. So those three chapters carry an explicit `opener_exempt` flag, and the checker allows it
**only** on proof of both conditions: the chapter introduces no new tag, and it opens on its own
lowest-par drill. That is decision **D-1** in §8.

**Counts.** free = **40** drills (32 existing + 6 lessons + 2 capstones) + the Tour · PRO = **47**
drills (42 existing + 2 lessons + 3 capstones). Catalog total **87**.

---

## 2 · The full ordered catalog

Catalog order = chapter order, then drill order. `#` is the position in `menuOrder`; the Tour has none
because it is not in `menuOrder` (TUTORIAL_CHAPTER_SPEC §4 A1). **teaches** shows only tags that are
*new at that position* — a blank means the drill reps something already taught, which is correct and
intended for the 40-odd drills the audit §3.1 identified as reps and syntheses. **requires** is carried
**verbatim** from the audit's §6 table, extracted mechanically; the three amendments are §6 D-3.



| ch | # | key | name | kind · status | par | teaches (new only) | requires |
|---|---|---|---|---|---|---|---|
| k1 | — | `keyboardtour` | The Keyboard Tour | tour · built | — | `move` · `jump(ctrl-arrow)` · `select` · `enter/edit(F2)` · `clear/delete` · `undo` · `redo` · `insert/delete row-col` · `point-mode` · `sum(Alt=)` · `fill(D/R)` · `bold/italic/color` · `align` · `borders(top/outside/bottom)` · `comma/currency-fmt` · `blue-inputs` · `decimals` · `percent-fmt` · `save` | — |
| k1 | 1 | `select` | Select | lesson · add | 16 | `select-edge` · `row/col-select` · `goto-special` | `select` |
| k1 | 2 | `firstsum` | First Sums | lesson · add | 26 | `margin/ratio` | `enter/edit(F2)` · `select` · `point-mode` · `sum(Alt=)` · `fill(D/R)` |
| k1 | 3 | `navigation` | Navigate | existing · built | 20 | `copy/paste` | `select` · `select-edge` |
| k1 | 4 | `rowops` | Structure | existing · built | 30 | `schedule` | `select` · `row/col-select` · `copy/paste` · `comma/currency-fmt` · `blue-inputs` · `borders(top/outside/bottom)` |
| k1 | 5 | `signs` | Signs | lesson · add | 18 | `sign-convention` · `costs-negative` · `parens-negative` | `enter/edit(F2)` |
| k1 | 6 | `pastes` | Paste Special | existing · built | 42 | `paste-special` | `copy/paste` · `comma/currency-fmt` · `bold/italic/color` · `align` · `borders(top/outside/bottom)` · `sign-convention` |
| k1 | 7 | `editfix` | Repair | existing · built | 52 | — | `redo` · `clear/delete` · `schedule` |
| k1 | 8 | `modeltour` | Model Tour | capstone · built | 35 | — | `move` · `jump(ctrl-arrow)` · `copy/paste` · `fill(D/R)` · `percent-fmt` · `comma/currency-fmt` · `decimals` · `bold/italic/color` · `blue-inputs` · `align` · `schedule` |
| k2 | 9 | `lockref` | Lock | lesson · add | 16 | `anchor($/F4)` · `mixed-anchor` | `fill(D/R)` · `point-mode` |
| k2 | 10 | `blocksel` | Block Select | existing · built | 34 | `cut` | `select-edge` · `copy/paste` · `fill(D/R)` · `bold/italic/color` · `align` · `borders(top/outside/bottom)` · `margin/ratio` |
| k2 | 11 | `filldr` | Fill | existing · built | 44 | — | `bold/italic/color` · `borders(top/outside/bottom)` · `margin/ratio` · `schedule` · `sign-convention` |
| k2 | 12 | `foot` | Foot | existing · built | 29 | — | `fill(D/R)` · `bold/italic/color` · `borders(top/outside/bottom)` |
| k2 | 13 | `anchor` | Anchors | existing · built | 22 | — | `fill(D/R)` · `anchor($/F4)` · `mixed-anchor` · `comma/currency-fmt` · `decimals` · `borders(top/outside/bottom)` |
| k2 | 14 | `percent` | % of Revenue | existing · built | 21 | — | `row/col-select` · `fill(D/R)` · `anchor($/F4)` · `decimals` · `bold/italic/color` |
| k2 | 15 | `margin` | Margins | existing · built | 40 | `growth/CAGR` | `fill(D/R)` · `percent-fmt` · `decimals` · `bold/italic/color` · `margin/ratio` |
| k2 | 16 | `cagr` | CAGR | existing · built | 36 | — | `fill(D/R)` · `anchor($/F4)` · `percent-fmt` · `decimals` · `bold/italic/color` · `growth/CAGR` |
| k2 | 17 | `bridge` | Point Mode | existing · built | 33 | — | `fill(D/R)` · `point-mode` · `anchor($/F4)` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `growth/CAGR` · `margin/ratio` |
| k2 | 18 | `sumif` | SUMIF | existing · built | 64 | `SUMIF(S)` · `tie-out/check-row` | `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `percent-fmt` · `decimals` · `bold/italic/color` · `borders(top/outside/bottom)` · `margin/ratio` |
| k2 | 19 | `rollup` | SUMIFS | existing · built | 80 | — | `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `mixed-anchor` · `borders(top/outside/bottom)` · `SUMIF(S)` |
| k2 | 20 | `qclose` | Close the Quarter | capstone · add | 94 | — | `point-mode` · `sum(Alt=)` · `fill(D/R)` · `anchor($/F4)` · `mixed-anchor` · `percent-fmt` · `decimals` · `growth/CAGR` · `SUMIF(S)` · `tie-out/check-row` · `bold/italic/color` · `borders(top/outside/bottom)` · `sign-convention` · `margin/ratio` |
| k3 | 21 | `ribbonpass` | Ribbon | lesson · add | 24 | — | `select` · `bold/italic/color` · `align` · `borders(top/outside/bottom)` · `percent-fmt` · `decimals` · `blue-inputs` |
| k3 | 22 | `ruleaudit` | Ruling Pass | existing · built | 16 | — | `bold/italic/color` · `borders(top/outside/bottom)` · `schedule` |
| k3 | 23 | `center` | Center | existing · built | 22 | — | `row/col-select` · `bold/italic/color` · `borders(top/outside/bottom)` |
| k3 | 24 | `typeset` | Typeset | existing · built | 24 | `date/TODAY` | `margin/ratio` |
| k3 | 25 | `decimals` | Decimals | existing · built | 25 | — | `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `margin/ratio` |
| k3 | 26 | `autofit` | Autofit | existing · built | 36 | `autofit` | `select` · `fill(D/R)` · `bold/italic/color` · `borders(top/outside/bottom)` |
| k3 | 27 | `combo` | Combo | existing · built | 27 | — | `decimals` · `bold/italic/color` · `align` · `autofit` |
| k3 | 28 | `unhide` | Unhide | existing · built | 25 | `hide/unhide/group` | `select` · `bold/italic/color` · `borders(top/outside/bottom)` · `autofit` |
| k3 | 29 | `ruleoff` | Rule Off | existing · built | 31 | — | `fill(D/R)` · `bold/italic/color` · `sign-convention` |
| k3 | 30 | `fxconvert` | FX Convert | existing · built | 35 | — | `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `comma/currency-fmt` · `decimals` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` |
| k3 | 31 | `housestyle` | House Style | existing · built | 44 | — | `percent-fmt` · `comma/currency-fmt` · `decimals` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `autofit` · `goto-special` · `margin/ratio` |
| k3 | 32 | `gauntlet` | Gauntlet | capstone · built | 47 | — | `sum(Alt=)` · `comma/currency-fmt` · `decimals` · `bold/italic/color` · `blue-inputs` · `align` · `borders(top/outside/bottom)` · `autofit` · `hide/unhide/group` |
| k4 | 33 | `tapepull` | Tape Read | lesson · add | 22 | `VLOOKUP` · `stat-fn(MEDIAN/AVERAGE)` | `enter/edit(F2)` · `fill(D/R)` · `anchor($/F4)` · `select-edge` |
| k4 | 34 | `filterpass` | Filter | existing · built | 26 | `filter` | — |
| k4 | 35 | `sort` | Sort | existing · built | 31 | `sort` | `select` · `select-edge` · `clear/delete` · `sum(Alt=)` · `bold/italic/color` · `borders(top/outside/bottom)` · `tie-out/check-row` |
| k4 | 36 | `scrub` | Scrub | existing · built | 21 | — | `row/col-select` · `clear/delete` · `sum(Alt=)` · `bold/italic/color` · `borders(top/outside/bottom)` · `insert/delete row-col` · `sort` |
| k4 | 37 | `series` | Series | existing · built | 44 | — | `select` · `select-edge` · `fill(D/R)` · `bold/italic/color` · `align` |
| k4 | 38 | `lookup` | Lookup | existing · built | 59 | `INDEX/MATCH` | `enter/edit(F2)` · `fill(D/R)` · `anchor($/F4)` · `borders(top/outside/bottom)` · `VLOOKUP` |
| k4 | 39 | `recon` | Recon | existing · built | 92 | — | `select` · `enter/edit(F2)` · `copy/paste` · `paste-special` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `stat-fn(MEDIAN/AVERAGE)` · `INDEX/MATCH` · `VLOOKUP` |
| k4 | 40 | `cleanroom` | The Data-Room Tape | capstone · add | 90 | — | `clear/delete` · `insert/delete row-col` · `sort` · `filter` · `INDEX/MATCH` · `sum(Alt=)` · `hide/unhide/group` · `bold/italic/color` · `borders(top/outside/bottom)` · `row/col-select` |
| k5 | 41 | `tracepass` | Trace | lesson · add | 20 | `audit(trace)` · `show-formulas` | `select` · `point-mode` · `goto-special` |
| k5 | 42 | `drill` | Hardcode | existing · built | 22 | — | `select` · `select-edge` · `row/col-select` · `undo` · `clear/delete` · `copy/paste` · `paste-special` · `bold/italic/color` · `blue-inputs` |
| k5 | 43 | `wrapfix` | IFERROR | existing · built | 26 | `IFERROR` | `select` · `enter/edit(F2)` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `VLOOKUP` · `tie-out/check-row` |
| k5 | 44 | `audit` | Review Pass | existing · built | 28 | — | `select` · `enter/edit(F2)` · `fill(D/R)` · `comma/currency-fmt` · `blue-inputs` · `goto-special` · `margin/ratio` |
| k5 | 45 | `signerr` | Sign Sweep | existing · built | 35 | — | `copy/paste` · `paste-special` · `fill(D/R)` · `sum(Alt=)` · `percent-fmt` · `decimals` · `bold/italic/color` · `borders(top/outside/bottom)` · `margin/ratio` |
| k5 | 46 | `tieout` | Tie-out | existing · built | 36 | — | `select` · `enter/edit(F2)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `audit(trace)` · `tie-out/check-row` |
| k5 | 47 | `balcheck` | Make It Tie | existing · built | 37 | `corkscrew(roll-forward)` · `linkage(cross-statement)` | `select` · `enter/edit(F2)` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `tie-out/check-row` |
| k5 | 48 | `triage` | Error triage | existing · built | 40 | — | `enter/edit(F2)` · `copy/paste` · `fill(D/R)` · `bold/italic/color` · `borders(top/outside/bottom)` |
| k5 | 49 | `versionup` | Roll-forward prep | existing · built | 48 | `find/replace` | `fill(D/R)` · `anchor($/F4)` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `growth/CAGR` |
| k5 | 50 | `stalelink` | Stale Links | existing · built | 64 | — | `enter/edit(F2)` · `clear/delete` · `fill(D/R)` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `margin/ratio` |
| k5 | 51 | `balance` | Balance | existing · built | 66 | — | `select` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `linkage(cross-statement)` · `tie-out/check-row` |
| k5 | 52 | `lookup2` | Two-way Lookup | existing · built | 80 | — | `enter/edit(F2)` · `copy/paste` · `paste-special` · `anchor($/F4)` · `borders(top/outside/bottom)` · `sort` · `INDEX/MATCH` · `corkscrew(roll-forward)` |
| k5 | 53 | `redflags` | The Red-Flag Pass | capstone · add | 90 | — | `enter/edit(F2)` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `goto-special` · `find/replace` · `sign-convention` · `tie-out/check-row` · `audit(trace)` · `bold/italic/color` · `borders(top/outside/bottom)` · `margin/ratio` · `blue-inputs` |
| k6 | 54 | `rollfwd` | Roll Forward | lesson · add | 26 | `circularity-avoidance` | `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `corkscrew(roll-forward)` · `schedule` · `sign-convention` |
| k6 | 55 | `wk13` | 13-Week Cash | existing · built | 45 | — | `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `corkscrew(roll-forward)` · `tie-out/check-row` |
| k6 | 56 | `retbridge` | Returns Bridge | existing · built | 56 | `bridge` | `select` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `margin/ratio` |
| k6 | 57 | `schedule` | Schedule | existing · built | 69 | — | `select` · `fill(D/R)` · `sum(Alt=)` · `point-mode` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `corkscrew(roll-forward)` · `schedule` · `linkage(cross-statement)` |
| k6 | 58 | `intsched` | Interest | existing · built | 72 | — | `select` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `decimals` · `bold/italic/color` · `borders(top/outside/bottom)` · `margin/ratio` · `corkscrew(roll-forward)` · `schedule` · `sign-convention` · `circularity-avoidance` |
| k6 | 59 | `cases` | Sticky switch | existing · built | 97 | `IF/MIN/MAX` · `CHOOSE` | `select` · `fill(D/R)` · `anchor($/F4)` · `margin/ratio` |
| k6 | 60 | `nwcsched` | NWC Schedule | capstone · built | 102 | — | `select` · `fill(D/R)` · `sum(Alt=)` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `schedule` |
| k7 | 61 | `dcfsens` | Sensitivity | existing · built | 35 | — | `select` · `fill(D/R)` · `point-mode` · `anchor($/F4)` · `mixed-anchor` · `comma/currency-fmt` · `decimals` · `borders(top/outside/bottom)` · `growth/CAGR` |
| k7 | 62 | `fcfbuild` | uFCF | existing · built | 40 | — | `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `sign-convention` |
| k7 | 63 | `txncomps` | Transaction Comps | existing · built | 52 | — | `select` · `fill(D/R)` · `point-mode` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `stat-fn(MEDIAN/AVERAGE)` · `margin/ratio` · `bridge` |
| k7 | 64 | `football` | Football | existing · built | 65 | — | `select` · `select-edge` · `fill(D/R)` · `anchor($/F4)` · `borders(top/outside/bottom)` · `IF/MIN/MAX` |
| k7 | 65 | `accdil` | Accretion/Dilution | existing · built | 70 | — | `select` · `select-edge` · `fill(D/R)` · `point-mode` · `anchor($/F4)` · `percent-fmt` · `decimals` · `margin/ratio` |
| k7 | 66 | `dcf` | DCF | existing · built | 85 | — | `select` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `tie-out/check-row` |
| k7 | 67 | `comps` | Comps | existing · built | 89 | — | `select` · `fill(D/R)` · `point-mode` · `anchor($/F4)` · `decimals` · `bold/italic/color` · `borders(top/outside/bottom)` · `stat-fn(MEDIAN/AVERAGE)` · `margin/ratio` · `bridge` |
| k7 | 68 | `sourcesuses` | Sources & Uses | existing · built | 92 | — | `select` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `percent-fmt` · `bold/italic/color` · `borders(top/outside/bottom)` · `margin/ratio` · `tie-out/check-row` |
| k7 | 69 | `wacc` | WACC | existing · built | 112 | — | `select` · `fill(D/R)` · `point-mode` · `anchor($/F4)` · `linkage(cross-statement)` |
| k7 | 70 | `pitchpage` | The Valuation Page | capstone · add | 88 | — | `select` · `point-mode` · `fill(D/R)` · `anchor($/F4)` · `IF/MIN/MAX` · `stat-fn(MEDIAN/AVERAGE)` · `comma/currency-fmt` · `bold/italic/color` · `borders(top/outside/bottom)` · `date/TODAY` · `margin/ratio` · `bridge` |
| k8 | 71 | `covtable` | Covenant Table | existing · built | 36 | — | `copy/paste` · `fill(D/R)` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `IF/MIN/MAX` · `margin/ratio` |
| k8 | 72 | `debtblock` | Debt block | existing · built | 70 | — | `select` · `fill(D/R)` · `anchor($/F4)` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `corkscrew(roll-forward)` · `schedule` · `linkage(cross-statement)` · `sign-convention` |
| k8 | 73 | `lbo` | LBO | existing · built | 71 | — | `select` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `growth/CAGR` · `margin/ratio` · `bridge` · `schedule` |
| k8 | 74 | `waterfall` | Waterfall | existing · built | 77 | — | `select` · `copy/paste` · `fill(D/R)` · `sum(Alt=)` · `point-mode` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `IF/MIN/MAX` · `corkscrew(roll-forward)` · `schedule` · `tie-out/check-row` |
| k8 | 75 | `liqbridge` | Liquidity Bridge | existing · built | 77 | — | `select` · `fill(D/R)` · `anchor($/F4)` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `IF/MIN/MAX` · `bridge` · `sign-convention` |
| k8 | 76 | `debtsched` | Debt Schedule | existing · built | 86 | — | `fill(D/R)` · `anchor($/F4)` · `percent-fmt` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `IF/MIN/MAX` · `corkscrew(roll-forward)` · `schedule` · `circularity-avoidance` |
| k8 | 77 | `revolver` | Revolver | existing · built | 95 | — | `select` · `fill(D/R)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `IF/MIN/MAX` · `corkscrew(roll-forward)` · `schedule` · `circularity-avoidance` |
| k8 | 78 | `cascade` | Full Waterfall | capstone · built | 161 | — | `select` · `fill(D/R)` · `bold/italic/color` · `borders(top/outside/bottom)` · `IF/MIN/MAX` · `corkscrew(roll-forward)` |
| k9 | 79 | `threestmt` | 3-Statement | existing · built | 45 | — | `select` · `select-edge` · `fill(D/R)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `linkage(cross-statement)` · `tie-out/check-row` |
| k9 | 80 | `dashcover` | Model cover | existing · built | 47 | — | `select` · `select-edge` · `fill(D/R)` · `point-mode` · `anchor($/F4)` · `percent-fmt` · `comma/currency-fmt` · `decimals` · `bold/italic/color` |
| k9 | 81 | `bsbuild` | BS Build | existing · built | 64 | — | `select` · `copy/paste` · `paste-special` · `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `bold/italic/color` · `borders(top/outside/bottom)` · `corkscrew(roll-forward)` · `linkage(cross-statement)` · `sign-convention` · `tie-out/check-row` |
| k9 | 82 | `cfslink` | CFS Link | existing · built | 66 | — | `fill(D/R)` · `point-mode` · `anchor($/F4)` · `percent-fmt` · `decimals` · `bold/italic/color` · `borders(top/outside/bottom)` · `corkscrew(roll-forward)` · `schedule` · `sign-convention` |
| k9 | 83 | `isbuild` | IS Build | existing · built | 71 | — | `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `percent-fmt` · `decimals` · `bold/italic/color` · `borders(top/outside/bottom)` · `margin/ratio` · `schedule` |
| k9 | 84 | `lbobuild` | Paper LBO | existing · built | 84 | — | `select` · `fill(D/R)` · `sum(Alt=)` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `growth/CAGR` · `margin/ratio` · `schedule` · `tie-out/check-row` |
| k9 | 85 | `opmodel` | Op model | existing · built | 85 | — | `copy/paste` · `sum(Alt=)` · `anchor($/F4)` · `percent-fmt` · `decimals` · `bold/italic/color` · `blue-inputs` · `borders(top/outside/bottom)` · `margin/ratio` · `audit(trace)` |
| k9 | 86 | `dcfbuild` | DCF page | existing · built | 113 | — | `select` · `fill(D/R)` · `anchor($/F4)` · `margin/ratio` · `bridge` |
| k9 | 87 | `shipit` | Ship the Model | capstone · add | 110 | — | `fill(D/R)` · `sum(Alt=)` · `anchor($/F4)` · `paste-special` · `corkscrew(roll-forward)` · `linkage(cross-statement)` · `tie-out/check-row` · `sign-convention` · `growth/CAGR` · `bold/italic/color` · `borders(top/outside/bottom)` · `date/TODAY` · `schedule` · `margin/ratio` |

---

## 3 · THE PRO LINE and the level curve

*Exactly as CURRICULUM_REBUILD §4.1–4.2 recommends — carried here as the working answer,
**recommended, pending Wolf**. CURRICULUM_REBUILD P2 (two tiers, both real at launch; a level
threshold per PRO chapter so a committed free player can earn in) is law; the numbers below are the
recommendation.*

```
  FREE  ──────────────────────────────────────────  |  ── PRO ────────────────────────────────────
  k1 Keyboard   k2 Build   k3 Format   k4 Str&Data  |  k5 Audit  k6 Comps  k7 Val  k8 Credit  k9 Full
  the Tour + 40 drills                              |  47 drills
  no gate, ever                                     |  subscription  OR  level 13/16/19/22/25
```

| side | chapters | drills | of which lessons | of which capstones | gate |
|---|---|---|---|---|---|
| **free** | k1 · k2 · k3 · k4 | **40** (+ the Tour) | 6 | 2 (`qclose`, `cleanroom`) | none — open forever |
| **PRO** | k5 · k6 · k7 · k8 · k9 | **47** | 2 | 3 (`redflags`, `pitchpage`, `shipit`) | entitlement **OR** the level curve below |

**The curve.** PRO chapter *k* (k = 1…5) opens at **level 10 + 3k**:

| PRO chapter | k5 Audit & Repair | k6 Components | k7 Valuation | k8 Credit | k9 Full Builds |
|---|---|---|---|---|---|
| **unlocks at** | **L13** | **L16** | **L19** | **L22** | **L25** |

A free grinder reaches Full Builds around level 25; a subscriber skips the curve on day one. Two
standing laws hold on top of it: **free play is never blocked** (gate the progression artifact, never
the access — Wolf decision log #4, restated in TUTORIAL_CHAPTER_SPEC §1.8), and until Stripe is live
`HOTKEY_PREMIUM.enabled` stays false, so the PRO chapters show their gate and their price and open by
the level path only (P2).

**What retires with this.** `HOTKEY_GATES` — the level+pace-clears wall that today gates five groups
(`Data & Lookups` L3 / 8 clears, `Formulas II` L5 / 12, `Models I` L7 / 18, `Models II` L9 / 26,
`Full Builds` L11 / 32) — is **retired outright** (P1: level+clears gates are retired as a second
gate). It is replaced by exactly two things: the **capstone spine** (clear chapter N's capstone to open
chapter N+1's progression artifacts) and the **PRO `unlock_level`** above. One ladder, not four.

---

## 4 · Certificate tracks, re-derived

Three tracks, unchanged in shape (P7), each now exactly three chapters — the cleanest partition the new
cut allows, and it makes every track's cert name true:

| track | chapters | cert | why these three |
|---|---|---|---|
| `fluency` | k1 Keyboard · k2 Build · k3 Format | Excel Keyboard Fluency | the free tier's first three: the grammar, the formulas that use it, the finish that ships it. "The full keyboard loop, at speed" reads true for the first time — today's blurb promises formatting and stops before a single formula |
| `formulas` | k4 Structure & Data · k5 Audit & Repair · k6 Components | Spreadsheet Formulas & Data Analysis | lookups and data hygiene, then formula auditing, then the schedules those two produce. The blurb already says "data hygiene and formula auditing", which is what these three chapters actually are |
| `modeling` | k7 Valuation · k8 Credit · k9 Full Builds | Financial Modeling Keyboard Mastery | DCF and comps, the debt side, and the whole-model builds — unchanged in spirit, tightened in scope |

**Migration (r359 drift rule — the SQL moves in the same PR as the code).** `HK_TRACKS[].keys` derives
from `groups`, so re-cutting groups silently re-cuts every certificate. Keys that change track:

- **→ `fluency` from `formulas` (9):** `foot` `anchor` `percent` `margin` `cagr` `bridge` `sumif`
  `rollup` — the old Formulas I body, now chapter k2 Build — plus `fxconvert`, now in k3 Format
  (audit §3.3: its beats are comma/currency and border work, not formula construction).
- **→ `formulas` from `modeling` (5):** `retbridge` `schedule` `intsched` `wk13` `nwcsched` — the
  component schedules, now chapter k6.
- **13 new keys** land in tracks by construction: `select` `firstsum` `signs` (fluency, k1),
  `lockref` `qclose` (fluency, k2), `ribbonpass` (fluency, k3), `tapepull` `cleanroom` (formulas, k4),
  `tracepass` `redflags` (formulas, k5), `rollfwd` (formulas, k6), `pitchpage` (modeling, k7),
  `shipit` (modeling, k9).

All three arrays in `dev/migrate-certificates.sql` and the newest `issue_certificate` migration are
regenerated in the same PR; `dev/check-invariants.js` C14 already asserts set-equality between them and
`HK_TRACKS`, so the guard is in place before the move. **A player mid-certificate sees their track
composition change** — that is the one r158 tension in this map, and it is decision **D-4** in §8.

**Milestones.** `MS` becomes `{ fluency:['k1','k2','k3'], formulas:['k4','k5','k6'], modeling:['k7','k8','k9'] }`.

---

## 5 · The picker's "next up" rule

**In prose.** *Next up is the first drill in catalog order that you can actually do and have not already
done — and if you are mid-chapter, it is the first such drill in the chapter you are standing in.* A
drill you "can actually do" is one whose every REQUIRES tag has been taught by something you have
cleared. That is the whole rule: no level check, no entitlement check, no pace check. Locks are shown as
reasons, never as walls — a locked row reads "wants `anchor`: try **Lock** (16 s)", and free play stays
open (audit §4 UI note 2; TUTORIAL_CHAPTER_SPEC §1.8).

Because the map has **zero** require-before-teach violations, catalog order alone already satisfies the
rule for a player who goes straight through — "next up" and "the next row down" agree. The rule earns
its keep for the player who jumped around, cleared three drills out of order and came back a week later.

```js
/* the cleared set is the PB map: a PB records only on a clean run (no mouse, no guided) */
function hkNextUp(map, pb, currentChapter){
  const flat = map.chapters.flatMap(c => c.drills.map(d => ({ ch:c, d })));

  // 1. what the player has been TAUGHT = union of TEACHES over everything cleared,
  //    plus the Tour's stages if it was finished (the Tour has no PB — it has hk_tour_done).
  const known = new Set();
  for (const { d } of flat)
    if (d.kind === 'tour' ? hkTourDone() : pb[d.key] !== undefined)
      d.teaches.forEach(t => known.add(t));

  // 2. ready = not yet cleared, and every REQUIRES already taught.
  const ready = d => pb[d.key] === undefined && d.requires.every(t => known.has(t));

  // 3. prefer the chapter the player is standing in, then fall back to catalog order.
  const here = flat.find(x => x.ch.id === currentChapter && ready(x.d));
  return here || flat.find(x => ready(x.d)) || null;
}
```

Three consequences, because the picker UI hangs off them:

1. **A chapter's opening lesson is always ready.** Lessons require only what the Tour taught, so a
   player opening a fresh chapter is never told "nothing here yet".
2. **A capstone is ready only when its chapter is.** Every capstone's REQUIRES is its own chapter's
   vocabulary, so "★ capstone — locked until you clear X" is computed, not hand-written.
3. **"Next up" is one pinned row at the top of the tree** (audit §4 UI note 3), and the same selector
   feeds the locked-with-reason string on every other row.

---

## 6 · THE DELTA TABLE (DEPTH_PASS §3 grammar)

Keys are immutable (PBs, `runs.challenge`, leaderboard boards, `drills/<key>.html` and
`migrate-certificates.sql`'s arrays all key off them). Nothing below renames a key.
Plumbing legend: **GROUPS** = `drills.js groups[]` · **SPINE** = `HOTKEY_CAMPAIGN.chapters` ·
**TRACKS** = `HK_TRACKS` + `dev/migrate-certificates.sql` (same PR, r359) · **PARS** = `HOTKEY_PARS` ·
**CLOCKS** = `HOTKEY_CLOCKS` · **LB** = leaderboard boards (auto from `menuOrder`; a new key is a new
board, no migration) · **ACH** = achievements reading group names · **POOL** = `HOTKEY_CHALLENGE_POOL`.

| # | delta | type | rationale | plumbing impact |
|---|---|---|---|---|
| **D-1** | **9 chapters `k1`–`k9`** replace the 8 groups `Foundations · Formatting · Formulas I · Data & Lookups · Formulas II · Models I · Models II · Full Builds` | RE-CUT | CURRICULUM_REBUILD P3; the audit's Option C, taken once the bridges (Option B) exist | GROUPS rewritten · SPINE ids c1–c8 → k1–k9 (+1 chapter) with the claim-flag map D-16 · TRACKS D-12 · ACH D-13 · `HOTKEY_GROUP_COLORS` +1 · picker folders, `nav.js` profile headers and the campaign rail all re-render off `groups` (no edit) |
| **D-2** | **8 lesson drills ADD** — `select` `firstsum` `signs` (k1) · `lockref` (k2) · `ribbonpass` (k3) · `tapepull` (k4) · `tracepass` (k5) · `rollfwd` (k6) | ADD ×8 | TUTORIAL_CHAPTER_SPEC §3.1–3.4 supplies four; the audit's Option B adds `signs` and `tracepass`; `tapepull` and `rollfwd` are this map's own (D-6, D-7) | GROUPS +8 · `meta` ×8 with `lesson:true` · PARS +8 · CLOCKS +8 (pass ×2.0) · POOL excludes lesson keys · LB auto · SEO +8 · TRACKS +8 · `e2e-alt-paths` +16 · depth-contract beat-floor exemption via `hkLessonKey` |
| **D-3** | **`circularity-avoidance` added to the REQUIRES of `intsched` · `revolver` · `debtsched`** | AMEND (graph) | audit §3.2: all three compute interest off a **beginning balance** — which *is* the circularity dodge — and none of them ever says so | map only; the three drills already do it, and their `guide`/`aha` gain one clause each in Phase C |
| **D-4** | **`select` TEACHES += `goto-special`** | AMEND (lesson scope) | `goto-special` (F5 → Special) had **no teacher anywhere** and is required at #15 `housestyle` and #35 `audit`. It is a *selection* instrument, so the selection lesson owns it. One added beat: "Select every typed input in one pass" | §9.1 carries the amendment note under the verbatim §3.1 page |
| **D-5** | **`firstsum` TEACHES += `margin/ratio`; one added beat** | AMEND (lesson scope) | `margin/ratio` was taught at #7 and demanded at #2. `firstsum`'s board is already a five-line P&L, so a gross-margin beat is one division away — and it is what lets `modeltour` stay a capstone that **chains** rather than introduces | §9.2 carries the amendment note |
| **D-6** | **`tapepull` — "Read the tape"** | ADD (lesson, k4 opener) | kills the last two orphans in one 22-second board: **`VLOOKUP`** (3 drills, no teacher, first demanded at `lookup`) and **`stat-fn(MEDIAN/AVERAGE)`** (lag 13 — demanded at `recon`, taught at `wacc`). Both are "read one number out of a column" | as D-2 |
| **D-7** | **`rollfwd` — "Roll it forward"** | ADD (lesson, k6 opener) | gives Components its opener and teaches **`circularity-avoidance`**, which audit §3.2 found in *zero* player-facing surfaces despite it being the catalog's most-asked interview idea | as D-2 |
| **D-8** | **5 capstone ADDs** — `qclose` (k2) · `cleanroom` (k4) · `redflags` (k5) · `pitchpage` (k7) · `shipit` (k9) | ADD ×5 | DEPTH_PASS §2.4 / §3 D1/D3/D4/D5/D6, still unbuilt (DEPTH_PASS_CAMPAIGN §0). Pages refreshed to the r452 law in §10 | GROUPS +5 · `meta` ×5 with `capstone:true` · PARS +5 · CLOCKS +5 (pass ×2.0) · SPINE `chapters[i].capstone` · LB auto · SEO +5 · TRACKS +5 · POOL: `redflags` / `shipit` candidates post-calibration |
| **D-9** | **`nwcsched` DESIGNATED the k6 capstone** | DESIGNATE | nine chapters need nine capstones and only eight exist. `nwcsched` is Components' hardest board (par 102), teaches nothing new (so it chains, per §2.4), and "roll working capital" is the chapter's own subject | `meta.nwcsched.capstone:true` · SPINE k6 · **new achievement `cap_c9`** (adding an id is legal; P8 freezes the existing ones) · `HOTKEY_CAPSTONES` +1 row |
| **D-10** | **capstone key targets UNCHANGED** — `cap_c1`…`cap_c8` keep pointing at `modeltour` `gauntlet` `qclose` `cleanroom` `redflags` `pitchpage` `cascade` `shipit` | NO CHANGE | this is *why* `modeltour` stays k1's capstone and `editfix` does not become one: re-pointing `cap_c1` from a drill a player has already cleared to one they have not is a rug-pull (r158) | achievement `desc` strings only ("the Foundations capstone" → "the Keyboard capstone", and so on); `test:` bodies untouched |
| **D-11** | **cross-chapter moves (17 drills)** — `blocksel` `filldr` → k2 · `fxconvert` `unhide` → k3 · `series` → k4 · `drill` `lookup2` → k5 · `cases` `retbridge` `schedule` `intsched` `wk13` `nwcsched` → k6 · `debtblock` → k8 | MOVE ×17 | the audit's Option-B re-orders plus the re-cut's own. `unhide`→k3 (ahead of `gauntlet`) kills the grouping lag-13; `drill`→k5 is audit §5.6 verbatim; `series`→k4 and `fxconvert`→k3 are audit §3.3 verbatim; `lookup2`→k5 puts it after `balcheck`, the only drill that teaches the corkscrew its board rolls | GROUPS only; keys, boards, PBs, pars and SEO pages untouched. Picker hotkeys 1–9 inside a chapter shift (cosmetic — the r447 `cascade` move is the precedent) |
| **D-12** | **`HK_TRACKS[].groups` re-derived** to `k1,k2,k3` / `k4,k5,k6` / `k7,k8,k9`; `MS` → `k1…k9` | RE-DERIVE | P7 | TRACKS — **`dev/migrate-certificates.sql` + the newest `issue_certificate` migration regenerate in the SAME PR** (r359). 14 keys change track (§4). C14 guards it |
| **D-13** | **achievements that read a group NAME re-pointed** | RE-POINT | group names are load-bearing strings | `x_found` `'Foundations'`→`'Keyboard'` · `grp1` `'Foundations'`→`'Keyboard'` · `grp2` `'Models I','Models II'`→`'Valuation','Credit'` · `grp3` `'Formulas I','Formulas II'`→`'Build','Audit & Repair'` · `grp4` `'Full Builds'`→**unchanged** (the only group name that survives the cut). Ids frozen (P8); goals re-derive from the new chapter sizes |
| **D-14** | **`HOTKEY_GATES` RETIRED** | RETIRE | P1 — one ladder | delete `window.HOTKEY_GATES`; `drillLocked()` / `openGateInfo()` re-point to the capstone + level answer; `check-invariants` C1's gate-bypass assertion retires with it |
| **D-15** | **`HOTKEY_PREMIUM.groups` = `['Audit & Repair','Components','Valuation','Credit','Full Builds']`** (was `['Formulas II','Models I','Models II','Full Builds']`); `enabled` still `false` | RE-POINT | §3, the PRO line | one array; `dev/check-paywall.js` §1 ("flag off = zero visible change") re-runs both states unchanged |
| **D-16** | **campaign ids `c1`–`c8` → `k1`–`k9`, with a one-time client-side claim-flag map** | RENAME + MIGRATE | P8: earned things persist | `hk_camp_xp` map, matched **by capstone key** so it cannot drift: `c1→k1` (modeltour) · `c2→k3` (gauntlet) · `c3→k2` (qclose) · `c4→k4` (cleanroom) · `c5→k5` (redflags) · `c6→k7` (pitchpage) · `c7→k8` (cascade) · `c8→k9` (shipit); **`k6` is new** and has no legacy flag. One-time, idempotent, client-side |
| **D-17** | **`HK_PLACEMENT` UNCHANGED** — `navigation · combo · margin · sort · opmodel` | NO CHANGE | CURRICULUM_REBUILD §4.4; the five still span the arc under the new cut (k1 move · k3 format · k2 formula · k4 data · k9 model) | none; re-verify the band boundaries after the lesson pars land |
| **D-18** | **marketing count 74 → 87** | COUNT | `menuOrder.length` is the source of truth | `index.html:7, :11, :18` · `About.html:14, :21` · enterprise / billing copy · the `e2e-smoke` drill-count guard |
| **D-19** | **SEO pages +13** | GENERATE | one page per new key | `dev/build-drill-pages.js` → `drills/*.html` ×13 + `sitemap.xml` |
| **D-20** | **`dev/check-curriculum-map.js` wired into gate.yml's fast lane** | ADD (CI) | CURRICULUM_REBUILD Phase C wants the violation check as a CI invariant — landed early, in Phase A, so the map cannot rot between phases | one line in the "Static guards" step; it reads one JSON, runs in well under a second, and is never scope-gated |

**Not touched, deliberately:** drill keys · `HK_RANK.TIERS` · `HK_PLACEMENT` keys · localStorage keys ·
`HK_BAND` · `HOTKEY_PRO.plans` · every drill's board, beats, par and checks (this phase is a map, not a
rework) · `hkCapstoneOk()` (the predicate is already shared, and `hkCapstoneDone()` already returns false
for any key absent from `menuOrder`, so nothing NaNs before the Phase C builds land).

---

## 7 · The spine, as text

par by position inside each chapter; `·` = a lesson or the Tour (exempt — a 14-second start gate is not
a rung), `★` = the capstone. The floor the checker enforces is the audit §2.3 drop threshold:
**par(i+1) ≥ 0.63 × par(i)**.

```
  k1 Keyboard           ·    ·    ·   20 → 30 →  ·  → 42 → 52 → 35★
  k2 Build              ·   34 → 44 → 29 → 22 → 21 → 40 → 36 → 33 → 64 → 80 → 94★
  k3 Format             ·   16 → 22 → 24 → 25 → 36 → 27 → 25 → 31 → 35 → 44 → 47★
  k4 Structure & Data   ·   26 → 31 → 21 → 44 → 59 → 92 → 90★
  k5 Audit & Repair     ·   22 → 26 → 28 → 35 → 36 → 37 → 40 → 48 → 64 → 66 → 80 → 90★
  k6 Components         ·   45 → 56 → 69 → 72 → 97 → 102★
  k7 Valuation          35 → 40 → 52 → 65 → 70 → 85 → 89 → 92 → 112 → 88★
  k8 Credit             36 → 70 → 71 → 77 → 77 → 86 → 95 → 161★
  k9 Full Builds        45 → 47 → 64 → 66 → 71 → 84 → 85 → 113 → 110★
```

**Jumps > ×1.6 — five left, from sixteen.** (The audit counted 16 on the live catalog, headed by
`navigation 20 → filldr 44` ×2.20 — "the product's whole retention problem in one number". That one is
gone: `filldr` now sits in k2 behind a Tour, three lessons and one drill.)

| jump | ratio | verdict |
|---|---|---|
| k4 `scrub` 21 → `series` 44 | **×2.10** | **the worst left.** Both are k4 structure boards; `series` is a five-beat frame rebuild, `scrub` the chapter's shortest clean-up. Fixable only by re-parring one of them, which is a Phase C measurement, not a map decision. **Flagged, not fixed.** |
| k2 `bridge` 33 → `sumif` 64 | ×1.94 | legitimate — `sumif` introduces two tags (`SUMIF(S)`, `tie-out/check-row`) and is the chapter's first long board |
| k8 `covtable` 36 → `debtblock` 70 | ×1.94 | chapter opener → first real build; the opener-exemption rule puts the lowest par first by construction |
| k2 `percent` 21 → `margin` 40 | ×1.90 | legitimate — `margin` introduces `growth/CAGR` |
| k8 `revolver` 95 → `cascade` 161 | ×1.69 | the capstone; the audit already called this one legitimate |

**Both chapter-level inversions are gone.** Foundations (mean 37) was harder than Formatting (mean 30);
k1 Keyboard now runs 20 / 30 / 42 / 52 / 35 into k2 Build's 34 … 94. And Full Builds (mean 75) was
*easier* than Models II (mean 79); k9 (mean 76) now sits above k7 Valuation (mean 73) and beside k8.

**Par estimates.** The 13 new drills' pars are **estimates**, except `qclose` — DEPTH_PASS §4.32 records
it measured at **94** (median 86 keys; capstone clock pass 188). Every other new par is re-measured by
`dev/e2e-par-sweep.js` when the drill builds, and the checker re-runs on the real numbers.

---

## 8 · DECISIONS — for Wolf, recommendation first

| # | question | recommendation | what turns on it |
|---|---|---|---|
| **D-1** | **Nine chapters want nine lesson openers; the graph only supports six.** Valuation, Credit and Full Builds introduce no new tag, so a lesson at their head would teach nothing. | **Accept three `opener_exempt` chapters** (k7 / k8 / k9), each opening on its own lowest-par drill, machine-checked. The alternatives are three padding lessons (11 total — the audit §3.1 discriminator kills them) or an 8-chapter cut. | P4's wording; the checker's rule (d) |
| **D-2** | **Eight lesson drills, not four.** The spec's four, plus `signs` and `tracepass` (the audit's Option B), plus `tapepull` and `rollfwd` (this map). | **Build all eight.** They are what takes 59 violations to 0; the four alone leave `VLOOKUP`, `stat-fn`, `goto-special` and `circularity-avoidance` with no teacher at all. About two build sessions. | Phase C wave 1 size; catalog 74 → 87 |
| **D-3** | **The PRO line.** | **Free = k1–k4 (40 drills + the Tour); PRO = k5–k9 (47).** Exactly CURRICULUM_REBUILD §4.1 re-expressed in the new cut: free ends where a player can build, dress and clean their own page; paid starts where they audit somebody else's. | landing copy, `HOTKEY_PREMIUM.groups`, the whole conversion story |
| **D-4** | **Certificate composition moves under live players.** 14 keys change track; anyone mid-certificate sees their scope change. | **Ship it with the r158 softener:** a player who has already *earned* a certificate keeps it (server-side issuance is untouched); only in-progress scope moves, and the profile shows the new scope with the old one struck. | `migrate-certificates.sql`, the RPC arrays, C14 |
| **D-5** | **`modeltour` stays k1's capstone** rather than `editfix`, purely so `cap_c1` never re-points. | **Keep `modeltour`.** The audit's complaint about it — "a Formatting exam wearing a Foundations badge" — is answered by construction: the Tour now teaches the format vocabulary before k1's first drill. | achievement integrity (D-10) |
| **D-6** | **`nwcsched` designated k6's capstone** — the ninth capstone, and the only one that is an existing drill newly promoted. | **Accept.** It is Components' hardest board, teaches nothing new (so it chains rather than introduces), and needs no build. Costs one new achievement id, `cap_c9`. | `HOTKEY_CAPSTONES`, achievements |
| **D-7** | **`ribbonpass` introduces no tag** — the Tour's stage 5 names them all first, and k2's formula drills need decimals and percent before k3 opens. | **Keep it anyway.** It is k3's start gate and the only *timed* ribbon rep; the Tour is untimed by design. If it must own something, move `decimals` + `percent-fmt` off the Tour and re-order k2 — four moves. | k3's opener; the lesson count |
| **D-8** | **The level curve 13 / 16 / 19 / 22 / 25** is a straight line, so the last PRO chapter sits twelve levels past the first. | **Accept as recommended (§4.2).** If it reads too steep at playtest, flatten the tail (13/16/19/21/23) rather than the head — the head is the conversion moment. | the landing's ladder band, `unlock_level` |

---

## 9 · THE EIGHT LESSON-DRILL PAGES

Page grammar per TUTORIAL_CHAPTER_SPEC §3.1: **Board · Lesson card** (title / body ≤ 60 words / keys) ·
**Beats** (2–4 core + a **visible** ☆, `bonus:true, reveal:true` — §1.6) · **Random** (two axes) ·
**Aha** · **Par estimate** · **Engine** · **Alts ×2, one of which is the ☆-forfeit control** (§1.8).
Every lesson runs with hints ON for the first attempt, the lesson card IS the start gate (r450's
honest-t=0), and it is excluded from `HOTKEY_CHALLENGE_POOL`.

**§9.1–§9.4 are reproduced verbatim from `dev/TUTORIAL_CHAPTER_SPEC.md` §3.1–§3.4** (the design of
record for those four; do not re-derive them here). Where this map needs a page to own one more tag,
the amendment is stated **below** the verbatim page, never inside it, and carries its delta-table row.
**§9.5–§9.8 are new** and are written to the same grammar.

---

### 9.1 `select` (k1) — verbatim from `dev/TUTORIAL_CHAPTER_SPEC.md` §3.1

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


> **r454 AMENDMENT (delta D-4) — `select` TEACHES += `goto-special`.** The page above is unchanged;
> it gains **one core beat, placed fourth**, and one keycap:
>
> - beat: **Select every typed input on the table in one pass** — the memo names them ("the figures
>   somebody typed"); graded on `S.sel` covering exactly the constant cells, any route.
> - keycap strip gains `F5 → special` (and `ctrl+g` as its twin).
> - lesson-card body gains one sentence, inside the 60-word cap: *"F5 then Special selects a whole
>   class at once — every typed number, or every formula."*
>
> **Why:** `goto-special` had **no teacher anywhere in 74 drills** and is required at `housestyle`
> (k3) and `audit` (k5). It is a selection instrument, so the selection lesson owns it. Par estimate
> moves 14 → **16 s**. Alts unchanged in shape; alt (1) (arrow-by-arrow Shift selection, ☆ forfeited)
> now also walks the new beat by Ctrl+click-free arrow selection of the two input blocks.

---

### 9.2 `firstsum` (k1) — verbatim from `dev/TUTORIAL_CHAPTER_SPEC.md` §3.2

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

> **r454 AMENDMENT (delta D-5) — `firstsum` TEACHES += `margin/ratio`.** The page above is unchanged;
> it gains **one core beat, placed last**:
>
> - beat: **Build the gross margin — gross profit divided by revenue, every quarter** (the board
>   already carries a Margin line under EBITDA in the r454 cut; it is empty at load, percent-formatted
>   at build so no format beat is implied).
> - lesson-card body gains one clause, inside the 60-word cap: *"A ratio is a formula too — one line
>   over another."*
>
> **Why:** `margin/ratio` was demanded at catalog #2 and taught at #7 — and it is required by 20 later
> drills, `modeltour` among them. Teaching it here is what lets `modeltour` remain k1's capstone and
> still satisfy the capstone rule (a capstone chains, it does not introduce — §6 D-5, D-10). Par
> estimate moves 24 → **26 s**. Alts unchanged; alt (2) (SUM typed by hand, ☆ forfeited) also covers
> the margin beat with a typed `=B7/B4`.

---

### 9.3 `lockref` (k2) — verbatim from `dev/TUTORIAL_CHAPTER_SPEC.md` §3.3

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

> **r454:** carried unamended. It owns `anchor($/F4)` and `mixed-anchor` — the #2-demanded,
> #19-drilled inversion the audit §3.1 named — and it is chapter k2 Build's opening lesson.

---

### 9.4 `ribbonpass` (k3) — verbatim from `dev/TUTORIAL_CHAPTER_SPEC.md` §3.4

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

> **r454:** carried unamended, and it introduces **no tag** — the Tour's stage 5 names the whole
> ribbon vocabulary first, and chapter k2's formula drills need decimals and percent before k3 opens.
> It stays because it is k3 Format's start gate and the only *timed* ribbon rep; the Tour is untimed
> by design. See decision **D-7** in §8.

---

### 9.5 `signs` — "Signs" · name `Signs` · label `Which way is down` · tab `Signs` — **NEW**

*The audit's single worst lag: `sign-convention` is demanded at catalog #2 and taught at #42, forty
positions later. This is the twenty-second lesson that closes it. It must stay a convention lesson, not
a second `signerr` sweep — the §3.1 discriminator kills it otherwise (audit Option B, risk note).*

**Board:** a six-line quarterly cost block off one revenue feed — Revenue (blue, positive), COGS,
Payroll, Rent, Marketing (typed, and **three of the four arrive positive** — the seed picks which),
an EBITDA line already built as a plain sum, and a small **CONVENTION** memo to the right that states
the house rule in words: *costs are entered negative; totals are plain sums; a negative reads in
parentheses.* 14 rows used.

**Lesson card:** *Which way is down* — "On a banker's page costs are entered **negative**, so every
total is a plain sum — never a subtraction. A negative shows in parentheses, not with a minus sign.
Type a minus in front of a cost, or flip a whole block by pasting a −1 over it."
keys: `-` · `ctrl+1` (number format) · `alt e s` / `alt h v s` (paste special · multiply)

**Beats:**
1. Flip the three cost lines that were entered positive — the EBITDA total drops to its real number
2. Set the cost block to show negatives in parentheses
3. Enter the missing Marketing figure for the last quarter — signed to the house rule
4. Bold the EBITDA line and add a top border above it

☆ (visible): **Flip all three cost lines in one pass** — one −1 travels over the block

**Random:** which three of the four cost lines arrive positive (4 pools) · the quarter with the missing
figure · values · the memo's wording pool (two axes minimum, four supplied).
**Aha:** "costs go in negative, so a total is always just a sum — the sign does the arithmetic for you."
**Par estimate:** ~18 s. **Engine:** none — paste-multiply is `pastes`' own r427 route, and the
parentheses format is `numfmt`'s existing negative style. **Alts:** (1) retype each of the three costs
with a leading minus, one at a time (**☆ forfeited**, cores clear — the ☆-forfeit control);
(2) `Ctrl+1` custom-format route for beat 2 instead of the ribbon walk.

**Route facts that bind the build** (DEPTH_PASS_CAMPAIGN §1, do not re-derive): grade the **value on the
board**, never the formula text and never the keypress — a player who retypes `-4200` and a player who
pastes `-1` over the block must both clear beat 1. Both `currency` and `acct` are dollar formats; this
drill grades neither (no money beat).

---

### 9.6 `tracepass` — "Trace" · name `Trace` · label `Follow the wire` · tab `Trace` — **NEW**

*Closes `audit(trace)` (two drills, no teacher) and puts the catalog's biggest chord gap on the board:
`Ctrl+\`` show-formulas is wired at `index.html:28400` and used by **zero** drills (audit §3.2).*

**Board:** a small live operating page — a driver panel (blue), a revenue line, two cost lines, EBITDA,
and a **margin memo two rows below that reads off the wrong row**. One of the six formulas points a row
high. 12 rows used, everything already dressed. A **REVIEW** card to the right names the deliverable:
*"which cell feeds the margin memo, and is it the right one?"*

**Lesson card:** *Follow the wire* — "Every formula points somewhere. Ctrl+[ jumps to the cell a formula
reads; Ctrl+] jumps to the cells that read this one. Ctrl+\` flips the whole sheet to show formulas
instead of numbers, so you can read a page the way it was built. F5 then Special selects a whole class
at once."
keys: `ctrl+[` · `ctrl+]` · `` ctrl+` `` · `F5 → special`

**Beats:**
1. Repoint the margin memo at the EBITDA line — it is reading the row above
2. Enter the name of the driver the revenue line reads, in the REVIEW card's answer cell
3. Fix the cost line that reads a driver it should not — point it at its own rate

☆ (visible): **Read the page with formulas showing** — flip the sheet once and answer both cards from it

**Random:** which row the memo mis-points at (3 pools) · which cost line carries the crossed wire ·
driver names (pool) · values.
**Aha:** "a page you did not build is readable in one keypress — show the formulas and every wire is
on screen at once."
**Par estimate:** ~20 s. **Engine:** none new — `Ctrl+[` / `Ctrl+]` are wired, `Ctrl+\`` is wired at
`:28400`, `F5 → Special` is wired. The ☆ is the **only** place a keypress is read (`S.showFmlN >= 1`),
and it is a **bonus**, never a core beat — DEPTH_PASS_CAMPAIGN §1 retired `hunt` and re-cut `tieout`
precisely for grading keypresses in core.
**Alts:** (1) diagnose by eye and repoint both formulas without ever flipping the sheet (**☆ forfeited**,
cores clear — the ☆-forfeit control); (2) `Ctrl+]` from the driver panel outward instead of `Ctrl+[`
inward.

---

### 9.7 `tapepull` — "Tape Read" · name `Tape Read` · label `Read the tape` · tab `Tape` — **NEW**

*The k4 opener, and the last two orphans in one board: `VLOOKUP` (three drills need it, nothing teaches
it — `lookup` teaches INDEX/MATCH *instead*) and `stat-fn(MEDIAN/AVERAGE)` (lag 13: demanded at `recon`,
taught at `wacc` thirteen positions later).*

**Board:** a ten-row deal tape — Company · Sector · EV/EBITDA · EBITDA — sorted by nothing in
particular, with a two-cell **ASK** panel to the right: *"the multiple on <company>"* and *"the median
multiple on the tape"*. The tape's first column is the label column, so a left-to-right read works.
16 rows used, pre-dressed.

**Lesson card:** *Read the tape* — "Two ways to get one number out of a list. A lookup finds the row by
its label and returns a column from it. A median asks the whole column at once — the middle value, not
the average, because one outlier moves an average and not a median."
keys: `=vlookup(` · `=index(` / `=match(` · `=median(` · `=average(`

**Beats:**
1. Build the multiple read — the ASK panel's company, off the tape
2. Build the median multiple for the whole tape
3. Add the sector median under it — the sector the ASK panel names
4. Add a top border above the two median lines

☆ (visible): **Answer both reads from one anchored formula filled down**

**Random:** which company the panel asks for (10 pools) · which sector (3 pools) · multiples and EBITDA
values · whether the ASK panel sits right or below.
**Aha:** "a lookup answers one row; a median answers the column — and the median is what a comps page
actually quotes."
**Par estimate:** ~22 s. **Engine:** none — VLOOKUP has been in the engine since r416, MEDIAN and
AVERAGE since the `wacc` build.
**Alts:** (1) `INDEX`/`MATCH` for beat 1 instead of `VLOOKUP` — **both must clear**, this is the r436
untriggerable-beat lesson (`lookup` beat 4 demanded `INDEX(`/`MATCH(` out of formula text and locked out
a correct VLOOKUP); (2) two separately typed medians with no fill (**☆ forfeited**, cores clear — the
☆-forfeit control).

**Binding constraint:** grade the **value returned**, never the function name. A `VLOOKUP`, an
`INDEX`/`MATCH`, a typed reference to the right cell and an `XLOOKUP`-shaped `INDEX` must all clear
beat 1 if the number on the board is right.

---

### 9.8 `rollfwd` — "Roll Forward" · name `Roll Forward` · label `Open, add, less, close` · tab `Roll` — **NEW**

*The k6 opener. It names the thing the catalog does everywhere and says nowhere: interest computed off a
**beginning** balance is the circularity dodge (audit §3.2 — `circularity-avoidance` appears in zero
player-facing surfaces across 74 drills).*

**Board:** one facility, four years, laid out as a corkscrew — **Opening balance · Drawdown ·
Repayment · Closing balance** — with year 1's opening balance seeded (blue) and everything else empty.
Below it, an **Interest** line and a one-cell rate (blue). A memo names the house rule: *interest is
charged on the opening balance.* 13 rows used.

**Lesson card:** *Open, add, less, close* — "A schedule rolls: this year's close is next year's open.
Build one column — open plus draws less repayments — then fill it across and the whole schedule
follows. Charge interest on the **opening** balance: a balance that pays interest on itself is a
circle, and a circle will not calculate."
keys: `alt+=` · `ctrl+r` · `F4` · `←↑→↓ (point)`

**Beats:**
1. Build the year-one closing balance — opening plus the draw, less the repayment
2. Reference year two's opening balance to year one's close
3. Fill the schedule across the remaining years
4. Build the interest line — the rate on each year's opening balance

☆ (visible): **Fill the whole schedule from one column** — one pass, three years

**Random:** the number of years (4 or 5) · draw and repayment pools · the rate · whether the rate cell
sits above or beside the schedule.
**Aha:** "the close is the next open — and interest goes on the open, which is how a model avoids
calculating in a circle."
**Par estimate:** ~26 s. **Engine:** none — the corkscrew is `schedule`'s own shape at a quarter of
its size. **Alts:** (1) build all four closing balances by hand and reference each opening separately
(**☆ forfeited**, cores clear — the ☆-forfeit control); (2) `Ctrl+R` fill from a selection instead of
the fill handle route, and a typed `$` instead of `F4` on the rate.

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

### 10.1 `qclose` — "Close the Quarter" ★ CAPSTONE k2 · L

**Status:** built in r429 (H6b-5) and never ported into the live catalog — DEPTH_PASS_CAMPAIGN §0 calls
it "the deferred qclose port". Phase C ports the existing build and re-labels it to the lines below.
**Par: 94** — measured, not estimated (median 86 keys, 0 % drift, 1.09 s/key); capstone clock pass 188.

**Concept:** one quarterly P&L page built cold from a feed — chapter k2's five formula shapes in one
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

**Gate:** one clean run opens k3 Format. **Random:** value pools · segment pools · which opex lines
appear (4 of 6) · the margin/growth row order. **Aha:** "a P&L is five formula shapes — point, fill,
lock, grow, roll up — run in one breath." **Finish:** beat 6. **Clocks:** par 94, pass = par × 2.0.
**Engine:** none beyond existing fns. **Plumbing:** §6 D-8.
**Alts:** (1) leave the check cell untouched — all six cores clear and the capstone still opens k3
(**☆ forfeited** — the control, and the §2.2 proof that a bonus gates nothing); (2) type each segment's
SUMIF separately instead of one anchored formula filled down — cores clear.
**Recorded deviation (r429, kept):** the ☆ is the independent-prove-out family's third use in the
chapter, past the §1.0-R3(o) twice-per-chapter cap. Kept on the same reasoning as r429: for the drill
that gates the next chapter, *does it tie?* is the only honest close.

---

### 10.2 `cleanroom` — "The Data-Room Tape" ★ CAPSTONE k4 · L

**Concept:** chapter k4 chained on one artifact — a dirty data-room export becomes the sendable summary
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

**Gate:** one clean run opens k5 Audit & Repair. **Random:** junk-row positions · tape values and names ·
which status the panel asks for. **Aha:** "clean, sort, filter, pull, present — every data room ends in
the same five moves." **Finish:** beat 6. **Clocks:** par ~90 (estimate — measure at build), pass =
par × 2.0. **Engine:** `COUNTA` (r419) is useful in ok-predicates; **`SUBTOTAL` is not in the engine**,
so beat 5 grades a plain `SUM` per the `filterpass` convention — say so in a code comment.
**Plumbing:** §6 D-8.
**Alts:** (1) hide the detail rows individually instead of grouping (**☆ forfeited**, cores clear — the
control); (2) `INDEX`/`MATCH` for beat 4 instead of `VLOOKUP`, or the reverse — **both must clear**
(r436).
**r454 change vs DEPTH_PASS §4.44:** the page's ☆ was "Bold the summary strip's header and add a bottom
border under it" — a **formatting** task, which §1.0(d) bans as a ☆. Replaced with the outline-fold
efficiency above; the dress work stays where it belongs, inside beat 6's end state.

---

### 10.3 `redflags` — "The Red-Flag Pass" ★ CAPSTONE k5 · L

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

**Gate:** one clean run opens k6 Components. **Random:** every error's row and column · magnitudes ·
which cost family carries the sign error. **Aha:** "seven errors is a finite number — a review pass is a
hunt with a count, not a vibe." **Finish:** beat 6. **Clocks:** par ~90 (estimate), pass = par × 2.0.
**Engine:** r419 sentinels REQUIRED (live `#REF!` / `#DIV/0!` propagation); the §2.3 meter with
`errorCount: 7`; `F5 → Special` (taught by `select`, §9.1) is the fast route to beat 5 and is **never
graded** — grading the keypress is the class that retired `hunt` (DEPTH_PASS_CAMPAIGN §1).
**Plumbing:** §6 D-8; POOL candidate after calibration.
**Alts:** (1) fix the seven in board order, top to bottom, touching two correct cells on the way and
undoing them (**☆ forfeited**, cores clear — the control); (2) repoint the two typed-over cells by two
separate entries instead of one fill.
**r454 change vs DEPTH_PASS §4.56:** beat 1 was "Find and fix all 7 errors (0/7)" — two verbs and a
restatement of the meter, which is the rail's job, not a beat's. The seven are now distributed across
beats 1–5 by family, and the meter reads alongside them. The page's ☆ ("Enter your initials in the
review cell") was a **stamp**, not an efficiency (§1.0(d)); replaced with the precision bonus above.

---

### 10.4 `pitchpage` — "The Valuation Page" ★ CAPSTONE k7 · L

**Concept:** chapter k7's outputs assembled into the one page a VP reads — reference, never retype
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

**Gate:** one clean run opens k8 Credit. **Random:** output values and magnitudes · which side hosts the
outputs · share counts. **Aha:** "a pitch page owns no math — every number on it is a wire into the
work." **Finish:** beat 6. **Clocks:** par ~88 (estimate), pass = par × 2.0. **Engine:** none new.
**Plumbing:** §6 D-8.
**Alts:** (1) build the range from four separate references (**☆ forfeited**, cores clear — the
control); (2) `Ctrl+1` for the dollar format instead of the ribbon walk — and remember **`currency` and
`acct` both clear beat 5** (DEPTH_PASS_CAMPAIGN §1); the label does not say accounting.
**r454 change vs DEPTH_PASS §4.67:** beat 3 named `MIN` and `MAX` outright — a Class-A answer leak
(AUDIT_R417 §D) — and beat 5 was a two-verb line. Both re-cut above. The page's ☆
(`=TODAY()` as-of stamp) is a **data entry**, not an efficiency (§1.0(d)); the stamp survives as part of
the board's frame, and the ☆ is now the one-selection range.

---

### 10.5 `shipit` — "Ship the Model" ★ CAPSTONE k9 · L

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
par × 2.0. **Engine:** none new. **Plumbing:** §6 D-8; POOL candidate.
**Alts:** (1) build each plan year by hand with no fill (**☆ forfeited**, cores clear — the control);
(2) `Alt E S V` for beat 5 instead of `Alt H V V` — both are paste-values and both must clear.
**Wolf playtest, still open (DEPTH_PASS §4.88):** the par band, the balance-floor frustration curve,
and whether beat 5's deck hand-off belongs in core at all get set live with Wolf.

---

## 11 · What Phase B and Phase C read out of this file

| phase | reads |
|---|---|
| **B — the clean-slate entry** | nothing structural: B deletes the modal tour and makes the Keyboard Tour the only first-run path. It only needs §1's fact that the Tour is k1's opening entry and hands off to k1's first lesson (`select`), not to `navigation`. |
| **C — the lesson wave + re-cut** | everything. Wave 1 = §9's eight lesson pages. Wave 2 = §10's five capstones. Assembly = §6's delta table, in order, with `dev/check-curriculum-map.js` green at every step and `dev/migrate-certificates.sql` in the same PR (§4). |
| **D — progression ties** | §3 (the capstone spine and `unlock_level` replace `HOTKEY_GATES`) and §5 (the "next up" selector). |
| **E — the launch homepage** | §1's table and §3's curve — the ladder band reads free / PRO / "unlocks at level N" per chapter **from the live config**, never hand-typed (the landing has zero hand-typed numbers). |

_End of the map. `node dev/check-curriculum-map.js` is the contract; this file is the reading of it._
