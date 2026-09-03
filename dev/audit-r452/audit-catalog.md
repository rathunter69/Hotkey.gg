# CURRICULUM AUDIT — the 74-drill catalog as a skill graph
*(read-only audit, worktree `agent-a07aa72bbe1d1ecf6` @ `f221706` "the depth pass ships". No repo file edited.)*

---

## 0 · METHOD, AND HOW FAR TO TRUST IT

`CHALLENGES` was sliced mechanically: `dev/…/slice.js` finds `const CHALLENGES = {` (index.html:2163)
and cuts on `^  <key>:{` boundaries → **74 blocks, exactly the 74 keys in `menuOrder`.** Each block
yields `par`, `parKeys`, `aha`, `prompt`, `req`, the `guide()` string literals, every `checks()`
`label:`, the `demo()` keylog and `build()`.

Two surfaces per drill:

- **USE surface** = req + guide + check labels + prompt + aha + demo keylog (normalised: `</kbd>+<kbd>`
  collapsed, tags stripped, `L('h')`→`altseqh`, `{key:'d',ctrl:true}`→`ctrl+d`).
- **TOPIC surface** = the drill's *advertised identity only* — `drills.js` `name`/`label`/`tab`/`desc`
  plus its `aha`. This is what the picker shows and what a player thinks the drill is *about*.

Then: **TEACHES(d,T)** = T is used by d **and** d is the first drill in catalog order whose identity
names T. **REQUIRES(d,T)** = everything else d uses. A **first-seen violation** is a REQUIRES whose
teacher sits later in `menuOrder`, or has no teacher at all.

**Verification.** Beat counts were cross-checked against `dev/check-invariants.js`'s own
`tri-length` assertions: **72 of 74 exact**; `pastes` (8, read 7) and `ruleaudit` (6, read 2) are
extractor misses on loop-built check arrays — the table below uses the invariant numbers. Five drills
were read by hand end-to-end (`navigation`, `filldr`, `margin`, `sort`, `opmodel`) plus three probes
(`wacc`, `filterpass`, `editfix`); four regex false positives were found and fixed in the process
("walls **box** the corridor" → borders; "the FY formula is **pointing at** the wrong row" →
point-mode; "the headline **outlined**" → grouping; `alt h b p`'s trailing `p` → percent-format).
`node dev/check-invariants.js` is **clean** on this checkout.

Vocabulary: the 50 supplied tags, plus four I had to add because the engine supports them and drills
use them — `redo`, `clear/delete`, `stat-fn(MEDIAN/AVERAGE)`, and `select-edge` split from `select`.

---

## 1 · THE SKILL GRAPH

### 1.1 Who teaches what (the home map)

Reading in catalog order, the first drill whose *identity* names each concept:

| pos | drill | teaches (first time it is the subject) |
|---|---|---|
| 1 | `navigation` | move · jump(ctrl-arrow) · copy/paste · save |
| 2 | `filldr` | fill(D/R) · anchor($/F4) · mixed-anchor |
| 3 | `pastes` | paste-special |
| 4 | `blocksel` | select · cut |
| 5 | `rowops` | clear/delete · insert/delete row-col · schedule |
| 6 | `editfix` | enter/edit(F2) · undo |
| 7 | `modeltour` ★ | margin/ratio |
| 8 | `typeset` | bold/italic/color · date/TODAY |
| 9 | `decimals` | decimals |
| 10 | `center` | align |
| 11 | `autofit` | autofit |
| 12 | `ruleoff` | borders(top/outside/bottom) |
| 14 | `combo` | comma/currency-fmt · blue-inputs |
| 18 | `foot` | sum(Alt=) |
| 17 | `margin` | growth/CAGR |
| 20 | `percent` | percent-fmt |
| 22 | `bridge` | point-mode |
| 23 | `sumif` | SUMIF(S) · tie-out/check-row |
| 26 | `sort` | sort |
| 28 | `filterpass` | filter |
| 29 | `unhide` | hide/unhide/group |
| 30 | `lookup` | INDEX/MATCH |
| 37 | `wrapfix` | IFERROR |
| 38 | `balcheck` | corkscrew(roll-forward) · linkage(cross-statement) |
| 40 | `cases` | IF/MIN/MAX · CHOOSE |
| 42 | `signerr` | sign-convention |
| 43 | `versionup` | find/replace |
| 45 | `wacc` | stat-fn(MEDIAN/AVERAGE) |
| 52 | `retbridge` | bridge |

**Six concepts have no teacher anywhere in 74 drills** — they are simply assumed:

| concept | drills that need it | first demanded at |
|---|---|---|
| `select-edge` (Ctrl+Shift+arrow) | 9 | **#1 `navigation`** |
| `row/col-select` (Shift/Ctrl+Space) | 5 | #5 `rowops` |
| `VLOOKUP` | 3 | #30 `lookup` (which teaches INDEX/MATCH instead) |
| `audit(trace)` (Ctrl+[ / ]) | 2 | #41 `tieout` |
| `goto-special` (F5 → Special) | 2 | #15 `housestyle` |
| `redo` (Ctrl+Y) | 1 | #6 `editfix` |

`select-edge` is the sharpest: it is the ☆ discovery of `blocksel`, `sort`, `drill` and `series`, it
appears in nine drills across five chapters, and no drill's identity ever claims it.

### 1.2 The lag list — how far a concept runs ahead of its own drill

| lag (positions) | concept | first demanded | its drill |
|---|---|---|---|
| **40** | sign-convention | #2 `filldr` | #42 `signerr` |
| **13** | percent-fmt | #7 `modeltour` | #20 `percent` |
| **13** | hide/unhide/group | #16 `gauntlet` | #29 `unhide` |
| **13** | stat-fn (MEDIAN) | #32 `recon` | #45 `wacc` |
| 11 | comma/currency-fmt | #3 `pastes` | #14 `combo` |
| 10 | borders | #2 `filldr` | #12 `ruleoff` |
| 9 | blue-inputs | #5 `rowops` | #14 `combo` |
| 7 | align | #3 `pastes` | #10 `center` |
| 7 | corkscrew | #31 `lookup2` | #38 `balcheck` |
| 6 | bold/italic/color | #2 `filldr` | #8 `typeset` |
| 5 | margin/ratio | #2 `filldr` | #7 `modeltour` |
| 4 | bridge | #48 `comps` | #52 `retbridge` |
| 3 | select | #1 `navigation` | #4 `blocksel` |
| 3 | schedule | #2 `filldr` | #5 `rowops` |
| 2 | sum(Alt=) | #16 `gauntlet` | #18 `foot` |
| 2 | decimals | #7 `modeltour` | #9 `decimals` |

### 1.3 The violation count

**59 require-before-teach violations across 32 of 74 drills.** By chapter:

| chapter | drills | violations | per drill |
|---|---|---|---|
| **Foundations** | 7 | **28** | **4.0** |
| **Formatting** | 9 | **10** | 1.1 |
| Formulas I | 9 | 2 | 0.2 |
| Data & Lookups | 9 | 9 | 1.0 |
| Formulas II | 10 | 3 | 0.3 |
| Models I | 10 | 4 | 0.4 |
| Models II | 10 | 0 | 0.0 |
| Full Builds | 10 | 3 | 0.3 |

**64% of every "thrown in" moment in the catalog happens in the first 16 drills.** The back half is
almost clean — Models II has *zero* — because by then everything has been taught. This is not a
catalog-wide ordering problem. **It is a front-door problem, and it is concentrated in seven drills.**

The single worst row is drill #2. `filldr` (par 44, 7 beats) requires bold, borders, margin/ratio,
schedule structure and sign convention — five concepts, whose teachers sit at #8, #12, #7, #5 and
**#42**. Right behind it, `modeltour` — the *Foundations capstone* — requires six formatting concepts
(#9, #10, #14 ×2, #20) that the entire Formatting chapter has not happened yet.

*(Full 74-row table at the end of this document.)*

---

## 2 · THE DIFFICULTY SPINE

### 2.1 Chapter par profile

| chapter | n | min | median | max | mean | par in catalog order |
|---|---|---|---|---|---|---|
| Foundations | 7 | 20 | 35 | 52 | **37** | 20, 44, 42, 34, 30, 52, 35 |
| Formatting | 9 | 16 | 27 | 47 | **30** | 24, 25, 22, 36, 31, 16, 27, 44, 47 |
| Formulas I | 9 | 21 | 35 | 80 | 40 | 40, 29, 22, 21, 36, 33, 64, 80, 35 |
| Data & Lookups | 9 | 21 | 31 | 92 | 44 | 31, 21, 26, 25, 59, 80, 92, 22, 44 |
| Formulas II | 10 | 26 | 40 | 97 | 48 | 28, 40, 26, 37, 64, 97, 36, 35, 48, 66 |
| Models I | 10 | 35 | 70 | **112** | 70 | **112**, 40, 85, 89, 52, 65, 35, 56, 70, 92 |
| Models II | 10 | 36 | 77 | **161** | **79** | 69, 72, 71, 95, 77, 36, 77, 45, 86, **161** |
| Full Builds | 10 | 45 | 71 | 113 | 75 | 71, 64, 66, 102, 45, 85, 113, 84, 70, 47 |

**Two chapter-level inversions.** Foundations (mean 37) is *harder than* Formatting (mean 30) —
chapter 1 is harder than chapter 2, and it is the chapter a new player meets first. And Full Builds
(mean 75) is *easier than* Models II (mean 79), so the final chapter is a step down from its
predecessor.

### 2.2 Jumps (>1.6× par step) — 16 of them

`navigation 20 → filldr 44` **×2.20** · `rowops 30 → editfix 52` ×1.73 · `center 22 → autofit 36` ×1.64 ·
`ruleaudit 16 → combo 27` ×1.69 · `combo 27 → housestyle 44` ×1.63 · `percent 21 → cagr 36` ×1.71 ·
`bridge 33 → sumif 64` ×1.94 · `unhide 25 → lookup 59` **×2.36** · `drill 22 → series 44` ×2.00 ·
`balcheck 37 → stalelink 64` ×1.73 · `balance 66 → wacc 112` ×1.70 *(chapter break)* ·
`fcfbuild 40 → dcf 85` ×2.13 · `covtable 36 → liqbridge 77` ×2.14 · `wk13 45 → debtsched 86` ×1.91 ·
`debtsched 86 → cascade 161` ×1.87 *(capstone, legitimate)* · `threestmt 45 → opmodel 85` ×1.89.

**The first one is the product's whole retention problem in one number.** Drill #1 is 20 seconds;
drill #2 is 44 seconds, seven beats, and demands five untaught concepts. That is the cliff the Tour
spec's §0 diagnosis names, and the skill graph agrees with it precisely.

### 2.3 Drops (<0.63×) — 11 of them, and most are not pedagogical

`ruleoff 31 → ruleaudit 16` ×0.52 · `rollup 80 → fxconvert 35` ×0.44 · `recon 92 → drill 22` **×0.24** ·
`cases 97 → tieout 36` ×0.37 · `wacc 112 → fcfbuild 40` **×0.36** · `comps 89 → txncomps 52` ×0.58 ·
`football 65 → dcfsens 35` ×0.54 · `waterfall 77 → covtable 36` ×0.47 · `liqbridge 77 → wk13 45` ×0.58 ·
`cascade 161 → isbuild 71` ×0.44 *(chapter break, fine)* · `nwcsched 102 → threestmt 45` ×0.44.

Two are defensible (a capstone, then a fresh chapter). The rest are **sawtooth**: within-chapter par
oscillates with no concept reason. `Models I` is the worst offender — it **opens on its hardest drill**
(`wacc`, par 112) and immediately drops ×0.36, then runs 85 · 89 · 52 · 65 · 35 · 56 · 70 · 92. There is
no monotone ramp anywhere in that chapter. `Data & Lookups` reads 31 · 21 · 26 · 25 · 59 · 80 · 92 · **22** · 44 —
its second-hardest and its easiest drill are neighbours.

### 2.4 Capstones

**Only 3 of 8 chapters designate one** (`drills.js` `HOTKEY_CAMPAIGN.chapters`): `modeltour` (c1),
`gauntlet` (c2), `cascade` (c7). Five chapters — Formulas I, Data & Lookups, Formulas II, Models I,
Full Builds — have no capstone at all, so `hkCapstoneOk()` returns `true` unconditionally and those
milestones gate on pace clears only.

Does each capstone actually chain its own chapter's TEACHES?

| chapter | capstone | covers | misses | reaches forward into later chapters |
|---|---|---|---|---|
| Foundations | `modeltour` | **7/16** | anchor, mixed-anchor, paste-special, select, cut, clear/delete, insert/delete, F2, undo | percent-fmt, comma/currency, decimals, bold, blue-inputs, align — **6 tags from Formatting, which has not happened** |
| Formatting | `gauntlet` | **7/8** | date/TODAY | sum(Alt=), grouping |
| Models II | `cascade` | 0/0 | — | (chapter teaches nothing new at all) |

`gauntlet` is the model capstone and should be the template: it chains almost the whole chapter and
reaches forward by only two tags. `modeltour` is the opposite — it is a *Formatting* exam wearing a
Foundations badge, and it is the chapter's designated gate.

And the five undesignated chapters end on the wrong drill: **Formulas I** ends on `fxconvert`
(par 35 against a chapter max of 80); **Data & Lookups** ends on `series` (44 vs 92); **Models I** ends
on `sourcesuses` (92) while its hardest drill `wacc` (112) is *first*; **Full Builds** ends on
`dashcover` (47) — the chapter's *minimum*. Only `Formulas II` ends near its top (`balance` 66 vs 97).

---

## 3 · REDUNDANCY AND GAPS

### 3.1 Drills that teach nothing new

**46 of 74 (62%)** introduce no concept first. That is *correct and intended* for Models I/II and
Full Builds — those 30 drills are reps and syntheses, and the DRILL_DOCTRINE says so. The list worth
looking at is the **16 in the free/early chapters** that teach nothing and are not capstones:

`ruleaudit` @13 (par 16, the catalog's easiest board) · `housestyle` @15 · `anchor` @19 · `cagr` @21 ·
`bridge` @22 · `rollup` @24 · `fxconvert` @25 · `scrub` @27 · `lookup2` @31 · `recon` @32 · `drill` @33 ·
`series` @34 · `audit` @35 · `triage` @36 · `stalelink` @39 · `tieout` @41 · `balance` @44.

Most of these are deliberate reps with a genuinely different *board* (r438's `filterpass` retirement
probe is the standing precedent for how that call is made), and I am **not** proposing retirements.
But three stand out as pure duplication of a neighbour's lesson:

- **`anchor` @19** teaches nothing `filldr` @2 did not already require — and `filldr` is the drill that
  *named* anchoring as its own subject 17 positions earlier. The anchor lesson is upside-down: the
  catalog demands it at #2 and drills it at #19.
- **`cagr` @21 vs `margin` @17** — `margin`'s own ☆ line says "the same three moves price a margin, a
  growth rate and a multiple". `cagr` is that third move, alone, four positions later.
- **`rollup` @24 vs `sumif` @23** — adjacent, same SUMIF(S) family, par 64 → 80.

### 3.2 Concepts no drill teaches — and the engine already supports every one

Cross-referenced against `dev/ENGINE_GAP_AUDIT.md` §1 and the chord table at `index.html:28230+`
(these are all **wired**, not engine gaps). Counted by how many of the 74 drills' player-visible
surfaces mention each:

| chord | wired at | drills using it |
|---|---|---|
| **Ctrl+;** insert today · **Ctrl+Shift+;** insert now | `index.html:28250`, `:28255` | **0** |
| **Shift+F2** add comment | `index.html:28429` | **0** |
| **Ctrl+`** show formulas | `index.html:28400` | **0** |
| **Alt M P** trace-precedent arrows | `index.html:28407` | **0** |
| **Ctrl+F** find | `index.html:28344` | **0** (only Ctrl+H, in `versionup`) |
| **Shift+F3** insert function · **Shift+F11** new sheet · **Alt W F F** freeze panes · **Ctrl+K** hyperlink | `:28367`, `:28380`, `:28386`, `:28262` | **0** each |
| **Ctrl+[ / Ctrl+]** trace precedents | wired | **1** (`tieout`) |
| **Ctrl+9 / Ctrl+Shift+9** hide/unhide rows | wired | **1** (`unhide`) |
| **Ctrl+Shift+L** filter | wired | **1** (`filterpass`) |
| **Ctrl+A** select all | wired | **1** (`blocksel`) |
| **F9** evaluate selection | `:27216` | **1** (`tieout`) |
| **Ctrl+Enter** fill selection without moving | wired | **3** |
| **Alt H E A / E F** clear all / clear formats | `:28332`, `:28337` | **1** (`sort`) |

The four with the strongest desk-frequency case and zero coverage: **Ctrl+;** (every dated tab a
banker builds), **Ctrl+`** (the single fastest way to read someone else's model), **Alt M P / Ctrl+[**
(tracing — currently one drill for the whole audit muscle), and **Ctrl+F**.

Two *concepts*, not chords, are also missing outright:

- **`circularity-avoidance`** appears in **zero** player-facing surfaces. `intsched`, `revolver` and
  `debtsched` all compute interest off a **beginning balance** — which *is* the circularity dodge —
  and none of them ever says so. The most-asked modelling-interview question in the catalog's own
  subject area is taught by accident.
- **`sensitivity`** likewise: `dcfsens` (`drills.js:78`, name `Sensitivity`) never uses the words
  "sensitivity", "two-way" or "data table" anywhere in its `prompt`, `req`, `guide` or check labels —
  only in the picker `desc`. A player who solves it does not learn that they built a sensitivity table.

### 3.3 Chapters whose names no longer describe their contents

- **"Formulas II"** (@35–44) is an **audit-and-repair** chapter: `audit` · `triage` · `wrapfix` ·
  `balcheck` · `stalelink` · `tieout` · `signerr` · `versionup` · `balance` are all *find-the-break*
  boards. Only `cases` is a formula-construction drill. Its own track blurb already gives the game
  away — `HK_TRACKS.formulas.blurb` says "data hygiene and **formula auditing**".
- **"Data & Lookups"** carries two drills that are neither: `drill` @33 (key `drill`, name
  **`Hardcode`** — flatten a live feed, mark it, archive it: model *hygiene*, belongs with the audit
  chapter) and `series` @34 (rebuild a year header and line numbers off seeds: *structure/fill*).
- **"Formulas I"** ends with `fxconvert` @25, whose beats are dominated by comma/currency formatting
  and border work, not formula construction.
- **Two names for the same thing:** `drills.js` `groups[]` says `Models I` / `Models II`, while
  `HOTKEY_CAMPAIGN.chapters` (`drills.js:248–249`) says `Models I · Valuation` / `Models II · Credit`.
  The picker shows one string, the campaign rail shows another.

---

## 4 · THE BUILDING-BLOCK PROPOSAL

Four options, each costed against the plumbing surfaces that actually key off ordering. The constants
that constrain every one of them:

- **keys are immutable** — `PB`, `runs.challenge`, leaderboard boards, `drills/<key>.html` SEO pages and
  `dev/migrate-certificates.sql`'s arrays all key off them. Nothing below renames a key.
- **`migrate-certificates.sql` arrays are lists of KEYS, not chapters** — so a move *within a track*
  costs nothing there; a move *across tracks* requires the SQL in the same PR (the r359 drift rule).
- **`HOTKEY_GATES.groups`, `HOTKEY_PREMIUM.groups`, `HK_TRACKS[].groups`** are keyed by **group name**.
- **Achievements** `x_found`, `grp1`–`grp4` read `c.groups['Foundations' | 'Models I' | …]` — group
  *names* are load-bearing strings in `HOTKEY_ACHIEVEMENTS` (`drills.js:382`, `:404`–`:407`).
- **Marketing count** "74 banker-grade drills" is hardcoded at `index.html:7`, `:11`, `:18` and
  `About.html:14`, `:21`, and guarded by `dev/e2e-smoke.js`.

---

### OPTION A — RE-ORDER ONLY

**What.** Resequence inside and between chapters so every REQUIRES precedes its TEACHES. No board,
beat, par or copy changes.

**Rationale from the graph.** 41 of the 59 violations are *format* concepts demanded by Foundations
before the Formatting chapter runs. The mechanical fix is to interleave: move `typeset`, `decimals`,
`center`, `ruleoff`, `combo` **ahead of** `filldr`/`pastes`/`blocksel`, so the dress vocabulary lands
before the drills that use it. That alone clears ~30 violations.

**Catalog delta.** ~14 moves, 0 adds, 0 retires, 0 renames.

**Plumbing.** `drills.js groups[]` re-ordered · `HOTKEY_CAMPAIGN.chapters[].keys` re-checked (they are
samples, so mostly untouched) · **`migrate-certificates.sql` only if a key crosses the
Foundations/Formatting boundary into a different track — it does not, both are the `fluency` track, so
SQL is untouched** · picker hotkeys 1–9 within a chapter shift (cosmetic; the r447 `cascade` move set
the precedent) · gates/premium/achievements/SEO/count **all untouched**. **Cheapest option by a wide
margin — under half a session.**

**Risk.** It does not fix the cliff. `filldr` at par 44 with 7 beats is still the second board a new
player meets, whatever precedes it, and the `select-edge`/`row/col-select`/`redo` orphans still have no
teacher. It also breaks the *narrative* grouping — Foundations stops being "the movement chapter".
And re-ordering churns every player's picker without giving them anything visible in return.

---

### OPTION B — RE-ORDER + BRIDGE DRILLS  ⭐ *(recommended, as the second half of the Tour spec)*

**What.** Take the Tour spec's lesson-drill pattern exactly as written (`dev/TUTORIAL_CHAPTER_SPEC.md`
§1.2/§1.5/§1.6: lesson card before the start gate, 2–4 core beats, a **visible ☆** with
`bonus:true, reveal:true`, par 12–30 s, hints on for the first attempt) and place a bridge drill at
each of the graph's largest unfilled gaps.

**Rationale from the graph.** The spec's own four — `select`, `firstsum`, `lockref`, `ribbonpass` —
land, without having been designed from this data, on exactly the top of my violation list:

| spec lesson | violations it clears |
|---|---|
| `select` | `select-edge` (**9 drills, no teacher, demanded at #1**) + `select` lag 3 + `row/col-select` (5 drills, no teacher) |
| `firstsum` | `sum(Alt=)` lag 2 + the "a subtotal is a formula" premise `filldr`/`foot` assume |
| `lockref` | `anchor`/`mixed-anchor` — the #2-demanded, #19-drilled inversion |
| `ribbonpass` | `bold` lag 6 + `align` lag 7 + `borders` lag 10 + `comma/currency` lag 11 + `blue-inputs` lag 9 + `percent-fmt` lag 13 — **six of the ten worst lags in one drill** |

That is **~45 of 59 violations retired by the four drills already specced.** I would add **two more**,
both later in the ladder, both cheap:

| add | where | clears |
|---|---|---|
| `signs` — one short board: costs negative, the parenthesis convention, one flipped line to fix | Foundations, after `firstsum` | **sign-convention, lag 40 — the catalog's single worst** |
| `tracepass` — Ctrl+[ / Ctrl+] / Ctrl+\` on a small live model | head of Formulas II | `audit(trace)` (no teacher) + `goto-special` (no teacher) + the Ctrl+\` and Alt M P chord gaps |

Then **six re-orders** on top: `unhide` ahead of `gauntlet` (grouping lag 13); `corkscrew` named in
`balcheck` before `lookup2` needs it, or `lookup2` moved after it (lag 7); `retbridge` before `comps`
(bridge lag 4); `wacc` out of the Models I lead slot (the ×0.36 inversion); `drill` → Formulas II and
`series` → Formatting/Structure (the two chapter-content mismatches from §3.3).

**Catalog delta.** +6 adds (74 → **80**), 6 moves, 0 retires, 0 renames.

**Plumbing.** Everything in the Tour spec's §4 A2 row, scaled from 4 to 6: `groups[]` +6 ·
`meta` ×6 with `lesson:true` · `HOTKEY_PARS` +6 · `HOTKEY_CLOCKS` +6 (pass ×2.0) · `HOTKEY_CHALLENGE_POOL`
excludes lesson keys · LB boards auto-create, no migration · SEO pages +6 (`dev/build-drill-pages.js` +
`sitemap.xml`) · **`dev/migrate-certificates.sql` `fluency` array +3 and `formulas` array +1 in the same
PR** (r359) · `e2e-alt-paths.js` +12 · `e2e-depth-contract.js` beat-floor exemption via `hkLessonKey` ·
marketing count 74 → 80 at the five call sites + the `e2e-smoke` guard. **Gates, premium, achievements,
campaign ids and group names: all untouched** — every add lands inside an existing group.

**Risk.** Six new boards is roughly 1.5 build sessions on top of the Tour's own three waves, and each
needs its own par sweep and two alt-paths. `signs` risks overlapping `signerr` @42 — it must be a
20-second convention lesson, not a second sweep drill, or the §3 discriminator kills it. And a
Foundations chapter of 13 drills is long enough that the picker folder needs the progression UI below
to stay readable.

---

### OPTION C — CHAPTER RE-CUT

**What.** Regroup into a strictly cumulative ladder by concept family: **Move & Select → Enter & Fill →
Formulas → Format → Structure & Data → Audit → Components → Builds**, with a designated capstone
gating each.

**Rationale from the graph.** It is the only option that fixes §2.4 properly — five chapters currently
have no capstone, and `modeltour` is a Formatting exam sitting as the Foundations gate. It also fixes
every §3.3 name mismatch by construction, and it would make the two chapter-level par inversions
(Foundations > Formatting; Full Builds < Models II) impossible to reintroduce.

**Catalog delta.** 0 adds, 0 retires, 0 key renames — but ~40 drills change group, and 8 group names
change.

**Plumbing — this is the expensive one.** Group names are load-bearing in five places at once:
`HOTKEY_GATES.groups` (`drills.js:641`) · `HOTKEY_PREMIUM.groups` (`:313`) · `HK_TRACKS[].groups`
(`:182`–`:190`, which *derives* `t.keys` and therefore **every certificate's key array**) ·
`HOTKEY_ACHIEVEMENTS` `x_found` / `grp1`–`grp4` string literals (`:382`, `:404`–`:407`) ·
`HOTKEY_CAMPAIGN.chapters[].name` + `.id` (c1–c8) and the `MS` milestone map (`:196`). Because
`HK_TRACKS` derives keys from groups, **`dev/migrate-certificates.sql`'s three arrays must be
regenerated and shipped in the same PR**, and any player mid-certificate sees their track composition
change under them. `HOTKEY_GROUP_COLORS`, the picker folder colours, `nav.js`'s profile group headers
and the campaign rail all re-render. SEO pages and the marketing count are unaffected (keys and count
are stable).

**Risk.** High, and mostly social rather than technical: certificate scope changes mid-flight, badges
and milestone ids shift, and the r158 no-rug-pull law is directly in tension with it. Correct
destination; wrong thing to do in one PR.

---

### OPTION D — TRACK-BASED (dependency graph in the picker, no catalog change)

**What.** Leave `menuOrder` exactly as it is. Make the three `HK_TRACKS` the visible learning paths and
render explicit prerequisites in the picker, computed from the skill graph.

**Rationale from the graph.** The graph is data, not opinion — 59 edges. Rendered as "this drill wants:
`anchor` ✓ · `borders` ✓ · `sign-convention` ○ (learn it in `signerr`)", the *ordering never has to
change* because the player can see the dependency and choose. It also surfaces the six orphan concepts
honestly instead of hiding them.

**Catalog delta.** Zero. Nothing moves, nothing is added, no key changes.

**Plumbing.** A new static `HK_SKILLGRAPH` table in `drills.js` (74 rows × REQUIRES/TEACHES — the
attached table is the source) · picker row rendering in `buildSheetTabs()` (`index.html:30365`) gains a
prereq chip strip · a `nextUp()` selector · no SQL, no gates, no achievements, no SEO, no count change.
**Roughly half a session, and it can ship independently of A/B/C.**

**Risk.** It documents the cliff rather than removing it. A player at drill #2 who is told "this wants
five things you haven't learned" is *better informed* and *equally stuck*. It is a multiplier on a real
fix, not a substitute for one — and the graph table becomes a maintenance burden that will drift unless
`dev/check-invariants.js` asserts it (which it can: the extraction here is mechanical and re-runnable).

---

### RECOMMENDATION — **B, then D, and C only later**

The numbers make the sequence obvious:

1. **B first, because 64% of the problem is in 16 drills.** Foundations carries 4.0 violations per
   drill and Models II carries 0.0. This is not a catalog that needs resequencing — it is a catalog
   with a missing on-ramp, which is exactly what `dev/TUTORIAL_CHAPTER_SPEC.md` v2 already concluded
   from playtest. The skill graph independently ranks the spec's four lesson drills as the four
   highest-value additions available, and adds two more (`signs`, `tracepass`) that between them retire
   the worst single lag in the catalog (40 positions) and two of the six orphan concepts. B is A's
   re-ordering *plus* the content that makes re-ordering unnecessary in the places where re-ordering
   would break the chapter narrative.
2. **D second, in the same release, because the ask is clarity as much as order.** Once the bridges
   exist, the prereq chips have something to point at — "`filldr` wants Fill ✓ Lock ✓ Ribbon ✓" reads as
   a ladder rung, where today it would read as a warning label.
3. **C later, as its own project.** It is the right end state and it fixes the capstone hole properly,
   but it moves certificate composition for live users and touches five name-keyed config surfaces at
   once. Do it after B+D have shown which chapter boundaries the data actually wants. In the meantime,
   two of C's benefits are available for free: **designate the five missing capstones**
   (`sumif`→Formulas I, `recon`→Data, `balance`→Formulas II, `sourcesuses`→Models I, `opmodel`→Full
   Builds — each is its chapter's synthesis and each would move to the chapter's end), and **rename the
   two chapters whose names lie** (`Formulas II` → `Audit & Repair`, and align `Models I/II` with the
   campaign's own `· Valuation` / `· Credit` suffixes).

### The picker / UI note — how progression becomes VISIBLE

All of this hangs off `buildSheetTabs()` (`index.html:30365`), which already renders folders with a
`n/N cleared` counter (`pkGroupCleared`), a `✓ complete` seal (`pkGroupDone`), a `★ capstone` tag
(`pk-captag`) and a `LVL n · k clears` gate tag (`pk-gatetag` → `openGateInfo`). Four additions, all
inside that one function:

1. **Prereq chips on the file row.** Under each `pk-byline`, a compact strip of the drill's REQUIRES
   from `HK_SKILLGRAPH`: green tick if that concept's home drill has a PB, hollow if not, with a title
   naming the drill that teaches it. Cheap, honest, and it turns the skill graph into UI.
2. **Locked-with-reason, not locked.** Today `drillLocked()` (`index.html:30132`) returns a group name
   and the gate tag says "LVL 3 · 8 clears". Replace the *reason string* with the graph's answer —
   "wants `anchor`: try `lockref` (14 s)" — and keep free play open (Wolf decision log #4; the Tour
   spec §1.8 restates it as standing law). **A reason is not a wall.**
3. **"Next up" as a first-class row.** One pinned line at the top of the tree: the earliest drill in
   `menuOrder` whose REQUIRES are all satisfied and which has no PB. That is a two-line selector over
   the graph, and it is the single highest-value clarity change on this list — it answers "what do I
   press now" without the player reading a catalog.
4. **Chapter progress as a ladder, not a count.** The folder row already shows `4/9`. Add the
   chapter's *capstone* state beside it once §2.4's five missing capstones are designated — "4/9 ·
   capstone locked" reads as a ladder; "4/9" reads as a checklist.

---

## 5 · IMMEDIATE, SAFE FIXES

`node dev/check-invariants.js` is clean, so none of these is a live break — they are drift a reader
trips over. All are copy/metadata; none touches a key, a par or a check.

**5.1 — Stale `name`/`label` duplicates inside `CHALLENGES`.** `drills.js`'s own header (lines 8–10)
says the trainer overrides `CHALLENGES[k].name` and `.label` from `meta` at runtime, "so don't keep
stale duplicates in CHALLENGES." **Eighteen drills keep them,** and in most cases the stale value is
the drill's *tab* string, not its name — so a dev reading `index.html` sees a different identity from
the one the product ships:

| drill | index.html | says | drills.js says |
|---|---|---|---|
| `ruleaudit` | **:3047** | label `Audit the rulings` | `The ruling pass` — **semantic drift, not an abbreviation** |
| `balcheck` | **:18113** | label `Hunt the balance break` | `Make it tie — hunt the break` — **semantic drift** |
| `pastes` | :6098 | name `Paste Sp.` | name `Paste Special` (tab is `Paste Sp.`) |
| `blocksel` | :7275 | name `Block Sel.` | `Block Select` |
| `percent` | :4468 | name `% of rev` | `% of Revenue` |
| `series` | :8549 | name `Years` | `Series` (tab is `Years`) |
| `lookup2` | :21406 | name `2-way` | `Two-way Lookup` |
| `txncomps` | :15210 | name `Txn Comps` | `Transaction Comps` |
| `retbridge` | :16458 | name `Ret. Bridge` | `Returns Bridge` |
| `accdil` | :15735 | name `Acc/Dil` | `Accretion/Dilution` |
| `sourcesuses` | :15478 | name `S&U` | `Sources & Uses` |
| `covtable` | :19656 | name `Cov. Table` | `Covenant Table` |
| `liqbridge` | :19379 | name `Liq. Bridge` | `Liquidity Bridge` |
| `debtsched` | :13293 | name `Debt Sched.` | `Debt Schedule` |
| `nwcsched` | :14225 | name `NWC Sched.` | `NWC Schedule` |

*(the remaining three differ only by `—` vs `—` escaping and are harmless)*
**Fix:** delete the `name:`/`label:` pairs from those `CHALLENGES` heads, or add an invariant asserting
`CHALLENGES[k].name === undefined || === meta[k].name`. The latter prevents recurrence.

**5.2 — `drills.js:35`, a stale catalog count in a comment.** "Catalog is 82 grouped drills (Formulas I
& II carry 11 each)". It is 74; Formulas I carries 9 and Formulas II carries 10. The same comment then
correctly says `menuOrder.length` is the source of truth.

**5.3 — `drills.js:62`, `filldr`'s picker desc under-sells the board by a wide margin.**
`desc:'Fill down and fill right — one formula, whole block'` describes a two-beat exercise. The r427
board is a quarterly operating build — feed reference, three cost lines filled across, EBITDA, FY
totals, and a four-row ratio block down to EBITDA margin % — at **par 44 with 7 beats**, the third
hardest of the first sixteen drills. This is the one desc that materially contributes to the cliff:
the player picks it expecting a fill drill. Every other Foundations desc has been rewritten in the
depth pass; this one was not.

**5.4 — `dcfsens` never names its own subject.** `drills.js:78` calls it `Sensitivity` /
"A two-way DCF sensitivity", but the words *sensitivity*, *two-way* and *data table* appear **nowhere**
in its `prompt`, `req`, `guide` or check labels (index.html block @15939). A player can solve it
without learning what they built. One clause in the prompt fixes it.

**5.5 — Chapter name drift between two surfaces.** `drills.js` `groups[]` says `Models I` / `Models II`
(lines 42–44); `HOTKEY_CAMPAIGN.chapters` says `Models I · Valuation` / `Models II · Credit`
(**:248–249**). The picker folder and the campaign rail show different names for the same chapter.

**5.6 — `drill` (the key) is named `Hardcode` and lives in `Data & Lookups`.** `drills.js:99`. Nothing
about the drill is a lookup or a data operation — it is model hygiene (flatten a live feed, mark it,
archive it, delete the feed). The key is immutable, but the *group* is a one-line move to Formulas II,
where its four neighbours already do exactly this.

**5.7 — Five chapters have no `capstone:` and their last drill is not their hardest.** Formulas I ends
on `fxconvert` (par 35 / chapter max 80), Data & Lookups on `series` (44 / 92), Models I on
`sourcesuses` (92, while `wacc` at 112 is *first*), Full Builds on `dashcover` (47 — the chapter
minimum). `hkCapstoneOk()` (`drills.js:268`) returns `true` unconditionally for all five, so those
milestones gate on pace clears alone. Designating a capstone is a one-word addition per chapter and
needs no migration.

**5.8 — Not a defect, but worth an invariant.** No drill's `req` names a chord its `checks` reject, as
far as a mechanical scan can tell — but the scan is unreliable (the demo keylog uses helper builders
that hide `Ctrl+B`/`Ctrl+D` behind wrappers on ~60 drills, so a naive req-vs-demo diff produces 63 false
positives). If this class is worth guarding, guard it at the *demo* level instead: assert that every
chord named in `req` appears in the drill's own `demo()` keylog after helper expansion.

---

## 6 · THE FULL SKILL-GRAPH TABLE (74 rows, catalog order)

`★` = designated capstone. `!none` = no drill in the catalog teaches this concept.
`→key@n` = the concept's teacher sits at catalog position *n*.

| # | drill (key) | chapter | par | beats | TEACHES (first dedicated) | REQUIRES | first-seen violations |
|---|---|---|---|---|---|---|---|
| 1 | `navigation` | Foundations | 20 | 5 | move, jump(ctrl-arrow), copy/paste, save | select, select-edge | select→blocksel@4<br>select-edge!none |
| 2 | `filldr` | Foundations | 44 | 7 | fill(D/R), anchor($/F4), mixed-anchor | bold/italic/color, borders(top/outside/bottom), margin/ratio, schedule, sign-convention | bold/italic/color→typeset@8<br>borders(top/outside/bottom)→ruleoff@12<br>margin/ratio→modeltour@7<br>schedule→rowops@5<br>sign-convention→signerr@42 |
| 3 | `pastes` | Foundations | 42 | 8 | paste-special | copy/paste, comma/currency-fmt, bold/italic/color, align, borders(top/outside/bottom), sign-convention | comma/currency-fmt→combo@14<br>bold/italic/color→typeset@8<br>align→center@10<br>borders(top/outside/bottom)→ruleoff@12<br>sign-convention→signerr@42 |
| 4 | `blocksel` | Foundations | 34 | 8 | select, cut | select-edge, copy/paste, fill(D/R), bold/italic/color, align, borders(top/outside/bottom), margin/ratio | select-edge!none<br>bold/italic/color→typeset@8<br>align→center@10<br>borders(top/outside/bottom)→ruleoff@12<br>margin/ratio→modeltour@7 |
| 5 | `rowops` | Foundations | 30 | 7 | clear/delete, insert/delete row-col, schedule | select, row/col-select, copy/paste, comma/currency-fmt, blue-inputs, borders(top/outside/bottom) | row/col-select!none<br>comma/currency-fmt→combo@14<br>blue-inputs→combo@14<br>borders(top/outside/bottom)→ruleoff@12 |
| 6 | `editfix` | Foundations | 52 | 6 | enter/edit(F2), undo | redo, clear/delete, schedule | redo!none |
| 7 | `modeltour` ★ | Foundations | 35 | 7 | margin/ratio | move, jump(ctrl-arrow), copy/paste, fill(D/R), percent-fmt, comma/currency-fmt, decimals, bold/italic/color, blue-inputs, align, schedule | percent-fmt→percent@20<br>comma/currency-fmt→combo@14<br>decimals→decimals@9<br>bold/italic/color→typeset@8<br>blue-inputs→combo@14<br>align→center@10 |
| 8 | `typeset` | Formatting | 24 | 6 | bold/italic/color, date/TODAY | margin/ratio | — |
| 9 | `decimals` | Formatting | 25 | 6 | decimals | bold/italic/color, blue-inputs, borders(top/outside/bottom), margin/ratio | blue-inputs→combo@14<br>borders(top/outside/bottom)→ruleoff@12 |
| 10 | `center` | Formatting | 22 | 7 | align | row/col-select, bold/italic/color, borders(top/outside/bottom) | row/col-select!none<br>borders(top/outside/bottom)→ruleoff@12 |
| 11 | `autofit` | Formatting | 36 | 6 | autofit | select, fill(D/R), bold/italic/color, borders(top/outside/bottom) | borders(top/outside/bottom)→ruleoff@12 |
| 12 | `ruleoff` | Formatting | 31 | 6 | borders(top/outside/bottom) | fill(D/R), bold/italic/color, sign-convention | sign-convention→signerr@42 |
| 13 | `ruleaudit` | Formatting | 16 | 6 | — | bold/italic/color, borders(top/outside/bottom), schedule | — |
| 14 | `combo` | Formatting | 27 | 7 | comma/currency-fmt, blue-inputs | decimals, bold/italic/color, align, autofit | — |
| 15 | `housestyle` | Formatting | 44 | 7 | — | percent-fmt, comma/currency-fmt, decimals, bold/italic/color, blue-inputs, borders(top/outside/bottom), autofit, goto-special, margin/ratio | percent-fmt→percent@20<br>goto-special!none |
| 16 | `gauntlet` ★ | Formatting | 47 | 8 | — | sum(Alt=), comma/currency-fmt, decimals, bold/italic/color, blue-inputs, align, borders(top/outside/bottom), autofit, hide/unhide/group | sum(Alt=)→foot@18<br>hide/unhide/group→unhide@29 |
| 17 | `margin` | Formulas I | 40 | 7 | point-mode, growth/CAGR | fill(D/R), percent-fmt, decimals, bold/italic/color, margin/ratio | percent-fmt→percent@20 |
| 18 | `foot` | Formulas I | 29 | 7 | sum(Alt=) | fill(D/R), bold/italic/color, borders(top/outside/bottom) | — |
| 19 | `anchor` | Formulas I | 22 | 6 | — | fill(D/R), anchor($/F4), mixed-anchor, comma/currency-fmt, decimals, borders(top/outside/bottom) | — |
| 20 | `percent` | Formulas I | 21 | 7 | percent-fmt | row/col-select, fill(D/R), anchor($/F4), decimals, bold/italic/color | row/col-select!none |
| 21 | `cagr` | Formulas I | 36 | 6 | — | fill(D/R), anchor($/F4), percent-fmt, decimals, bold/italic/color, growth/CAGR | — |
| 22 | `bridge` | Formulas I | 33 | 7 | — | fill(D/R), point-mode, anchor($/F4), bold/italic/color, blue-inputs, borders(top/outside/bottom), growth/CAGR, margin/ratio | — |
| 23 | `sumif` | Formulas I | 64 | 6 | SUMIF(S), tie-out/check-row | fill(D/R), sum(Alt=), anchor($/F4), percent-fmt, decimals, bold/italic/color, borders(top/outside/bottom), margin/ratio | — |
| 24 | `rollup` | Formulas I | 80 | 6 | — | fill(D/R), sum(Alt=), anchor($/F4), mixed-anchor, borders(top/outside/bottom), SUMIF(S) | — |
| 25 | `fxconvert` | Formulas I | 35 | 6 | — | fill(D/R), sum(Alt=), anchor($/F4), comma/currency-fmt, decimals, bold/italic/color, blue-inputs, borders(top/outside/bottom) | — |
| 26 | `sort` | Data & Lookups | 31 | 6 | sort | select, select-edge, clear/delete, sum(Alt=), bold/italic/color, borders(top/outside/bottom), tie-out/check-row | select-edge!none |
| 27 | `scrub` | Data & Lookups | 21 | 6 | — | row/col-select, clear/delete, sum(Alt=), bold/italic/color, borders(top/outside/bottom), insert/delete row-col, sort | row/col-select!none |
| 28 | `filterpass` | Data & Lookups | 26 | 6 | filter | — | — |
| 29 | `unhide` | Data & Lookups | 25 | 7 | hide/unhide/group | select, bold/italic/color, borders(top/outside/bottom), autofit | — |
| 30 | `lookup` | Data & Lookups | 59 | 6 | INDEX/MATCH | enter/edit(F2), fill(D/R), anchor($/F4), borders(top/outside/bottom), VLOOKUP | VLOOKUP!none |
| 31 | `lookup2` | Data & Lookups | 80 | 6 | — | enter/edit(F2), copy/paste, paste-special, anchor($/F4), borders(top/outside/bottom), sort, INDEX/MATCH, corkscrew(roll-forward) | corkscrew(roll-forward)→balcheck@38 |
| 32 | `recon` | Data & Lookups | 92 | 6 | — | select, enter/edit(F2), copy/paste, paste-special, fill(D/R), sum(Alt=), anchor($/F4), stat-fn(MEDIAN/AVERAGE), INDEX/MATCH, VLOOKUP | stat-fn(MEDIAN/AVERAGE)→wacc@45<br>VLOOKUP!none |
| 33 | `drill` | Data & Lookups | 22 | 5 | — | select, select-edge, row/col-select, undo, clear/delete, copy/paste, paste-special, bold/italic/color, blue-inputs | select-edge!none<br>row/col-select!none |
| 34 | `series` | Data & Lookups | 44 | 5 | — | select, select-edge, fill(D/R), bold/italic/color, align | select-edge!none |
| 35 | `audit` | Formulas II | 28 | 6 | — | select, enter/edit(F2), fill(D/R), comma/currency-fmt, blue-inputs, goto-special, margin/ratio | goto-special!none |
| 36 | `triage` | Formulas II | 40 | 6 | — | enter/edit(F2), copy/paste, fill(D/R), bold/italic/color, borders(top/outside/bottom) | — |
| 37 | `wrapfix` | Formulas II | 26 | 6 | IFERROR | select, enter/edit(F2), fill(D/R), sum(Alt=), anchor($/F4), bold/italic/color, borders(top/outside/bottom), VLOOKUP, tie-out/check-row | VLOOKUP!none |
| 38 | `balcheck` | Formulas II | 37 | 6 | corkscrew(roll-forward), linkage(cross-statement) | select, enter/edit(F2), fill(D/R), sum(Alt=), anchor($/F4), bold/italic/color, tie-out/check-row | — |
| 39 | `stalelink` | Formulas II | 64 | 6 | — | enter/edit(F2), clear/delete, fill(D/R), bold/italic/color, blue-inputs, borders(top/outside/bottom), margin/ratio | — |
| 40 | `cases` | Formulas II | 97 | 6 | IF/MIN/MAX, CHOOSE | select, fill(D/R), anchor($/F4), margin/ratio | — |
| 41 | `tieout` | Formulas II | 36 | 6 | — | select, enter/edit(F2), sum(Alt=), anchor($/F4), bold/italic/color, borders(top/outside/bottom), audit(trace), tie-out/check-row | audit(trace)!none |
| 42 | `signerr` | Formulas II | 35 | 6 | sign-convention | copy/paste, paste-special, fill(D/R), sum(Alt=), percent-fmt, decimals, bold/italic/color, borders(top/outside/bottom), margin/ratio | — |
| 43 | `versionup` | Formulas II | 48 | 6 | find/replace | fill(D/R), anchor($/F4), bold/italic/color, blue-inputs, borders(top/outside/bottom), growth/CAGR | — |
| 44 | `balance` | Formulas II | 66 | 6 | — | select, fill(D/R), sum(Alt=), anchor($/F4), bold/italic/color, borders(top/outside/bottom), linkage(cross-statement), tie-out/check-row | — |
| 45 | `wacc` | Models I | 112 | 7 | stat-fn(MEDIAN/AVERAGE) | select, fill(D/R), point-mode, anchor($/F4), linkage(cross-statement) | — |
| 46 | `fcfbuild` | Models I | 40 | 7 | — | fill(D/R), sum(Alt=), anchor($/F4), bold/italic/color, borders(top/outside/bottom), sign-convention | — |
| 47 | `dcf` | Models I | 85 | 7 | — | select, fill(D/R), sum(Alt=), anchor($/F4), bold/italic/color, borders(top/outside/bottom), tie-out/check-row | — |
| 48 | `comps` | Models I | 89 | 7 | — | select, fill(D/R), point-mode, anchor($/F4), decimals, bold/italic/color, borders(top/outside/bottom), stat-fn(MEDIAN/AVERAGE), margin/ratio, bridge | bridge→retbridge@52 |
| 49 | `txncomps` | Models I | 52 | 6 | — | select, fill(D/R), point-mode, anchor($/F4), bold/italic/color, borders(top/outside/bottom), stat-fn(MEDIAN/AVERAGE), margin/ratio, bridge | bridge→retbridge@52 |
| 50 | `football` | Models I | 65 | 7 | — | select, select-edge, fill(D/R), anchor($/F4), borders(top/outside/bottom), IF/MIN/MAX | select-edge!none |
| 51 | `dcfsens` | Models I | 35 | 6 | — | select, fill(D/R), point-mode, anchor($/F4), mixed-anchor, comma/currency-fmt, decimals, borders(top/outside/bottom), growth/CAGR | — |
| 52 | `retbridge` | Models I | 56 | 7 | bridge | select, fill(D/R), sum(Alt=), anchor($/F4), margin/ratio | — |
| 53 | `accdil` | Models I | 70 | 7 | — | select, select-edge, fill(D/R), point-mode, anchor($/F4), percent-fmt, decimals, margin/ratio | select-edge!none |
| 54 | `sourcesuses` | Models I | 92 | 7 | — | select, fill(D/R), sum(Alt=), anchor($/F4), percent-fmt, bold/italic/color, borders(top/outside/bottom), margin/ratio, tie-out/check-row | — |
| 55 | `schedule` | Models II | 69 | 6 | — | select, fill(D/R), sum(Alt=), point-mode, anchor($/F4), bold/italic/color, borders(top/outside/bottom), corkscrew(roll-forward), schedule, linkage(cross-statement) | — |
| 56 | `intsched` | Models II | 72 | 7 | — | select, fill(D/R), sum(Alt=), anchor($/F4), decimals, bold/italic/color, borders(top/outside/bottom), margin/ratio, corkscrew(roll-forward), schedule, sign-convention | — |
| 57 | `lbo` | Models II | 71 | 7 | — | select, fill(D/R), sum(Alt=), anchor($/F4), bold/italic/color, borders(top/outside/bottom), growth/CAGR, margin/ratio, bridge, schedule | — |
| 58 | `revolver` | Models II | 95 | 7 | — | select, fill(D/R), anchor($/F4), bold/italic/color, borders(top/outside/bottom), IF/MIN/MAX, corkscrew(roll-forward), schedule | — |
| 59 | `waterfall` | Models II | 77 | 7 | — | select, copy/paste, fill(D/R), sum(Alt=), point-mode, anchor($/F4), bold/italic/color, borders(top/outside/bottom), IF/MIN/MAX, corkscrew(roll-forward), schedule, tie-out/check-row | — |
| 60 | `covtable` | Models II | 36 | 6 | — | copy/paste, fill(D/R), bold/italic/color, blue-inputs, borders(top/outside/bottom), IF/MIN/MAX, margin/ratio | — |
| 61 | `liqbridge` | Models II | 77 | 7 | — | select, fill(D/R), anchor($/F4), bold/italic/color, blue-inputs, borders(top/outside/bottom), IF/MIN/MAX, bridge, sign-convention | — |
| 62 | `wk13` | Models II | 45 | 7 | — | fill(D/R), sum(Alt=), anchor($/F4), bold/italic/color, borders(top/outside/bottom), corkscrew(roll-forward), tie-out/check-row | — |
| 63 | `debtsched` | Models II | 86 | 7 | — | fill(D/R), anchor($/F4), percent-fmt, bold/italic/color, blue-inputs, borders(top/outside/bottom), IF/MIN/MAX, corkscrew(roll-forward), schedule | — |
| 64 | `cascade` ★ | Models II | 161 | 7 | — | select, fill(D/R), bold/italic/color, borders(top/outside/bottom), IF/MIN/MAX, corkscrew(roll-forward) | — |
| 65 | `isbuild` | Full Builds | 71 | 7 | — | fill(D/R), sum(Alt=), anchor($/F4), percent-fmt, decimals, bold/italic/color, borders(top/outside/bottom), margin/ratio, schedule | — |
| 66 | `bsbuild` | Full Builds | 64 | 7 | — | select, copy/paste, paste-special, fill(D/R), sum(Alt=), anchor($/F4), bold/italic/color, borders(top/outside/bottom), corkscrew(roll-forward), linkage(cross-statement), sign-convention, tie-out/check-row | — |
| 67 | `cfslink` | Full Builds | 66 | 7 | — | fill(D/R), point-mode, anchor($/F4), percent-fmt, decimals, bold/italic/color, borders(top/outside/bottom), corkscrew(roll-forward), schedule, sign-convention | — |
| 68 | `nwcsched` | Full Builds | 102 | 7 | — | select, fill(D/R), sum(Alt=), bold/italic/color, blue-inputs, borders(top/outside/bottom), schedule | — |
| 69 | `threestmt` | Full Builds | 45 | 6 | — | select, select-edge, fill(D/R), anchor($/F4), bold/italic/color, borders(top/outside/bottom), linkage(cross-statement), tie-out/check-row | select-edge!none |
| 70 | `opmodel` | Full Builds | 85 | 7 | — | copy/paste, sum(Alt=), anchor($/F4), percent-fmt, decimals, bold/italic/color, blue-inputs, borders(top/outside/bottom), margin/ratio, audit(trace) | audit(trace)!none |
| 71 | `dcfbuild` | Full Builds | 113 | 7 | — | select, fill(D/R), anchor($/F4), margin/ratio, bridge | — |
| 72 | `lbobuild` | Full Builds | 84 | 7 | — | select, fill(D/R), sum(Alt=), bold/italic/color, blue-inputs, borders(top/outside/bottom), growth/CAGR, margin/ratio, schedule, tie-out/check-row | — |
| 73 | `debtblock` | Full Builds | 70 | 7 | — | select, fill(D/R), anchor($/F4), bold/italic/color, blue-inputs, borders(top/outside/bottom), corkscrew(roll-forward), schedule, linkage(cross-statement), sign-convention | — |
| 74 | `dashcover` | Full Builds | 47 | 6 | — | select, select-edge, fill(D/R), point-mode, anchor($/F4), percent-fmt, comma/currency-fmt, decimals, bold/italic/color | select-edge!none |