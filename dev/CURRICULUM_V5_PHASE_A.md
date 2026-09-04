# CURRICULUM V5.1 — PHASE A: the build-ready map

_r458 · 2026-09-04 · Phase A turns the conceptual curriculum (`dev/CURRICULUM_V5.md`, the page at
`dev/curriculum-v5.html`) into the artifacts a build wave can be held to: a machine-readable map, the
74 → 61 delta with every retirement's home, the engine work sequenced ahead of the drills that need it,
the guards that flip, and the PR waves. Nothing in Phase A is player-facing._

**Sources of truth.** `dev/gen/curriculum_v51_data.py` (what each drill is) + `dev/gen/curriculum_v51_map.py`
(status, tags, par, absorbs, engine packs) → `dev/curriculum-v5.json` (generated) → proven by
`node dev/check-curriculum-map.js --v5`. Edit the two Python files, never the JSON or the markdown.

---

## 1 · The map, chapter by chapter

Status: **built** (live today, unchanged) · **recut** (live key kept, page rebuilt to the seven rules) · **new** ·
**capstone**. Par is the replay estimate for a skilled player; every page is swept at build (§1.4 law).

| # | key | name | status | absorbs | par | engine pack |
|---|---|---|---|---|---|---|
| 1.1 | navigation | Navigate & Select | built | — | 90 | — |
| 1.2 | repairshop | Edit & Repair | new (tutorial) | editfix rowops blocksel | 110 | — |
| 1.3 | powergrid | First Formulas | new (tutorial) | filldr | 100 | — |
| 1.4 | printshop | Format the Page | new (tutorial) | — | 90 | — |
| 1.5 | findgo | Go To, Find & Replace | new | — | 95 | — |
| 1.6 | pastes | Paste Special | recut | drill signerr | 100 | — |
| 1.7 | series | Fill & Series | recut | — | 90 | — |
| 1.8 | modeltour | Model Tour ★ | built | — | 60 | — |
| 2.1 | typeset | The Memo | recut | — | 75 | — |
| 2.2 | compspage | The Comps Page | new | decimals combo | 110 | — |
| 2.3 | ruleaudit | Rulings | recut | ruleoff | 80 | — |
| 2.4 | printpage | The Print Page | new | center autofit | 90 | P3 (freeze) |
| 2.5 | condfmt | Conditional Flags | new | — | 85 | P3 |
| 2.6 | housestyle | House Style ★ | capstone | gauntlet | 80 | — |
| 3.1 | anchor | Anchors | recut | percent fxconvert | 95 | — |
| 3.2 | bridge | Point Mode Build | recut | — | 100 | P2 (named ranges) |
| 3.3 | ratios | Ratios & Growth | new | margin cagr | 90 | — |
| 3.4 | foot | Foot | recut | — | 85 | — |
| 3.5 | logic | Logic | new | — | 110 | P1 (IFS) |
| 3.6 | sumif | Conditional Sums | recut | — | 100 | — |
| 3.7 | textclean | Clean the Export | new | — | 130 | P1 · P2 (text-to-columns) |
| 3.8 | dates | Dates | new | — | 110 | P1 |
| 3.9 | qclose | Close the Quarter ★ | capstone | — | 100 | — |
| 4.1 | scrub | Scrub | recut | sort | 95 | P2 (remove duplicates, sort dialog) |
| 4.2 | filterpass | Filter & Screens | recut | — | 110 | P1 |
| 4.3 | unhide | Hide, Group & Outline | recut | — | 85 | — |
| 4.4 | lookup | Lookups | recut | — | 120 | P1 (XLOOKUP) |
| 4.5 | crosstab | Two-way & Cross-tab | new | lookup2 rollup | 120 | P1 |
| 4.6 | recon | Recon | recut | — | 110 | P1 |
| 4.7 | tables | Tables & Validation | new | — | 100 | P3 |
| 4.8 | pivot | Pivot | new | — | 90 | P4 |
| 4.9 | cleanroom | The Data-Room Tape ★ | capstone | — | 120 | — |
| 5.1 | wrapfix | Errors | recut | triage | 110 | — |
| 5.2 | cases | Scenario Switch | recut | — | 100 | — |
| 5.3 | audit | Review Pass | recut | tieout | 100 | — |
| 5.4 | trace | Trace & Evaluate | new | — | 90 | P2 |
| 5.5 | stalelink | Stale Links & Roll-forward Prep | recut | versionup | 110 | — |
| 5.6 | balcheck | Make It Tie | recut | balance | 95 | — |
| 5.7 | redflags | The Red-Flag Pass ★ | capstone | — | 120 | — |
| 6.1 | wacc | WACC | recut | — | 110 | — |
| 6.2 | npvirr | NPV, IRR & Payback | new | — | 110 | P1 (PMT) |
| 6.3 | dcf | DCF | recut | fcfbuild dcfbuild | 130 | — |
| 6.4 | dcfsens | Sensitivity & Goal Seek | recut | — | 110 | P4 |
| 6.5 | comps | Comps | recut | txncomps | 120 | — |
| 6.6 | accdil | Accretion / Dilution | recut | liqbridge | 110 | — |
| 6.7 | pitchpage | The Valuation Page ★ | capstone | football sourcesuses | 90 | — |
| 7.1 | rollfwd | Roll Forward | new | schedule | 110 | — |
| 7.2 | intsched | Interest & Coverage | recut | — | 100 | — |
| 7.3 | revolver | Revolver | recut | — | 100 | — |
| 7.4 | waterfall | Waterfall | recut | — | 110 | — |
| 7.5 | covtable | Covenant Flags | recut | — | 95 | — |
| 7.6 | wk13 | 13-Week Cash | recut | — | 110 | — |
| 7.7 | cascade | Full Waterfall ★ | capstone | — | 150 | — |
| 8.1 | isbuild | IS Build | recut | opmodel | 110 | — |
| 8.2 | nwcsched | NWC Schedule | recut | — | 100 | — |
| 8.3 | debtblock | Debt Block | recut | debtsched | 110 | — |
| 8.4 | threestmt | Three Statements | recut | bsbuild cfslink | 110 | — |
| 8.5 | lbobuild | Paper LBO | recut | lbo retbridge | 120 | — |
| 8.6 | dashcover | Model Cover | recut | — | 80 | — |
| 8.7 | handoff | Hand-off | new | — | 130 | P3 · P4 (sheets) |
| 8.8 | shipit | Ship the Model ★ | capstone | — | 150 | — |

**Counts.** 61 drills: 2 built · 36 recut · 15 new · 8 capstones (2 of which are built/recut keys). 38 live keys
kept, 23 keys added, **36 live keys retired**, every one absorbed by a named drill (§2).

**Placement probes** (`HK_PLACEMENT`, five boards, one per band): `navigation · printpage · ratios · scrub · dcf`.
**Tracks** unchanged in shape: fluency c1–c2 · formulas c3–c5 · modeling c6–c8. **PRO** = c5–c8, earnable at
LVL 13 / 16 / 19 / 22. **Free** = 33 drills, **PRO** = 28.

**Teach-before-require proof:** `--v5` passes with 0 violations over the 61 in catalog order (the map layer
adds 33 tags to v3's 53; every required tag has a teacher earlier in the order).

---

## 2 · The delta, 74 → 61 — every retirement has a home

| retired key | lesson carried by | note |
|---|---|---|
| filldr | powergrid | the anchored fill is tutorial 3's third step |
| blocksel, rowops, editfix | repairshop | cut / paste to bays, inserts and deletes, F2 and undo — tutorial 2 |
| decimals, combo | compspage | decimals and the wrap/autofit beats on one comps page |
| center, autofit | printpage | alignment, widths, wrap, #### on one print page |
| ruleoff | ruleaudit | the apply half is the same page's right block |
| gauntlet | housestyle | one Formatting capstone; the S&U dressing is a seed of House Style |
| margin, cagr, percent | ratios · anchor | ratios and growth on one page; the fixed-denominator share is Anchors' second block |
| fxconvert | anchor | the single-rate anchor is Anchors' second block on a different table |
| sort | scrub | sorting is Scrub's middle step |
| lookup2, rollup | crosstab | two-way reads and the SUMIFS cross-tab share a page |
| drill | pastes · handoff | paste-values hand-off is Paste Special's last step and Hand-off's first |
| triage | wrapfix | the three error kinds are Errors' second step |
| tieout | audit · foot | the foot lives in Foot; the hardcode hunt is Review Pass's ☆ |
| signerr | powergrid · pastes | sign convention is tutorial 3; the paste-multiply flip is Paste Special |
| versionup | stalelink | typed rates out, tags replaced — the same page |
| balance | balcheck | building the check row is Make It Tie's first step |
| fcfbuild, dcfbuild | dcf | the cash row and the full page are one DCF |
| txncomps | comps | the precedent tape is Comps' third step |
| football, sourcesuses | pitchpage | the range floor/ceiling and the S&U check are the Valuation Page |
| retbridge, lbo | lbobuild | returns and their attribution on the Paper LBO page |
| liqbridge | accdil | the three-case copy is Accretion's mechanic |
| schedule | rollfwd | the fixed-asset corkscrew is Roll Forward's third step |
| debtsched | debtblock | one full debt schedule, in Full Builds |
| bsbuild, cfslink | threestmt | the retained-earnings roll and the cash link are the wiring drill |
| opmodel | isbuild | units × price is the IS Build's first step |

Retired keys keep their PBs as a retired row on the profile (r158 precedent); their leaderboards close;
`drills/<key>.html` 301s to the absorbing drill's page. Certificates: `HK_TRACKS` re-derives from the new
chapter membership (C15), earned certificates are kept (r158 softener).

---

## 3 · Engine work, sequenced ahead of the drills that need it

From `dev/ENGINE_GAP_MATRIX.md`; each pack is one PR, each with its invariant and a probe suite.

| pack | size | contents | unblocks |
|---|---|---|---|
| **P1 · the function pack** | S | XLOOKUP · IFS · SWITCH · MAXIFS / MINIFS / AVERAGEIFS / COUNTIFS · TEXTJOIN · TEXT · SUBSTITUTE · SEARCH · DATEDIF · NETWORKDAYS · PMT · comparison criteria in SUMIF/COUNTIF (`">100"`, wildcards) · the columns-past-Z parse fix | lookup logic filterpass textclean dates npvirr recon crosstab |
| **P2 · commands with a little UI** | M | named ranges (name box, Ctrl+F3, F3) · remove duplicates (Alt A M) · text-to-columns (Alt A E) · sort dialog with two keys (Alt A S S) · trace precedents / dependents + F9 evaluate | bridge scrub textclean trace |
| **P3 · per-range state painted by render()** | L | conditional formatting (Alt H L) · data validation (Alt A V V) · Excel tables (Ctrl+T, total row, structured refs) · freeze panes (Alt W F F) · protect + print area | condfmt tables printpage handoff |
| **P4 · new surfaces** | L | multiple sheets (Shift+F11, Ctrl+PgUp/PgDn, `Sheet2!A1`) · goal seek + data table (Alt A W G / T) · pivot (Alt N V, keyboard field list, Alt+F5) | handoff dcfsens pivot |

Drills that depend on a pack are built **after** it lands; a drill whose pack is late ships its other steps
and gains the missing step when the pack does (each such step is marked `engine` in the data file, so the
checker can tell "waiting" from "forgotten").

---

## 4 · The guards that change

| guard | today | Phase A → end state |
|---|---|---|
| `menuOrder.length` | 74 (e2e-smoke drill-count guard, landing copy from data) | 61 at wave 10; the landing reads the number from data already |
| C28 archetype quota · C29 closer / one-pass ☆ ration · C30 family repeats · C31 deadline register | warnings (`V4_STRICT=1` fails) | failures at wave 10 |
| **new C32 — the page law**: every drill declares `steps` (3–4) with 3–4 outcomes each; density ≥ 60% at win; par 60–150 s (tutorials ≤ 120) | — | warning at wave 1, failure at wave 10 |
| **new C33 — desk language**: the word list (imposter, squatter, cargo, bay, dock, pip, hall, corridor outside `navigation`) fails player copy | — | failure from wave 1 |
| `check-curriculum-map.js --v5` | 0 violations on the map | gated from wave 1 (the v3 proof retires when the last v3-only key does) |
| C15 certificate arrays == HK_TRACKS | holds | re-derived at wave 10 |

---

## 5 · PR waves (≤ 5 drills or one pack per PR; Opus builds, the orchestrator lands; the 19-suite gate + the guards)

| wave | contents | depends on |
|---|---|---|
| **1** | Foundations: repairshop, powergrid, printshop (the tutorials), findgo; pastes + series re-cut · retire filldr blocksel rowops editfix drill signerr · C32/C33 as warnings · `--v5` gated | — |
| **2** | **P1** the function pack + the two parse fixes | — |
| **3** | Formatting: typeset, compspage, ruleaudit, printpage (no freeze yet), condfmt deferred · housestyle absorbs gauntlet · retire decimals combo center autofit ruleoff gauntlet | — |
| **4** | Formulas I: anchor, ratios, foot, logic, sumif · retire percent fxconvert margin cagr | P1 |
| **5** | **P2** commands pack; then bridge (names), textclean, dates, qclose · retire — | P1 P2 |
| **6** | Data & Lookups: scrub, filterpass, unhide, lookup, crosstab, recon, cleanroom · retire sort lookup2 rollup | P1 P2 |
| **7** | Formulas II: wrapfix, cases, audit, trace, stalelink, balcheck, redflags · retire triage tieout versionup balance | P2 |
| **8** | **P3** range-state pack; then condfmt, tables, printpage freeze step | — |
| **9** | Models I: wacc, npvirr, dcf, dcfsens (formula grid only), comps, accdil, pitchpage · retire fcfbuild dcfbuild txncomps liqbridge football sourcesuses | P1 |
| **10** | Models II: rollfwd, intsched, revolver, waterfall, covtable, wk13, cascade · retire schedule lbo debtsched | — |
| **11** | Full Builds: isbuild, nwcsched, debtblock, threestmt, lbobuild, dashcover, shipit · retire opmodel bsbuild cfslink retbridge | — |
| **12** | **P4** new surfaces; then pivot, dcfsens data table + goal seek, handoff (sheets, protect, print) | P3 |
| **13** | close-out: guards to failures, `menuOrder` 61, SEO 301s for 36 pages, certificates re-derived, placement re-swept, landing count | all |

Waves 2, 5, 8 and 12 are engine PRs; the rest are drill PRs of five to seven pages. Waves that share no
files run in parallel worktrees (e.g. 3 ∥ 2, 9 ∥ 10).

---

## 6 · Decisions for Wolf

| # | question | recommendation |
|---|---|---|
| A-1 | **36 live drills retire.** Largest cut yet; every lesson has a named home (§2). | Yes. |
| A-2 | **House Style becomes the Formatting capstone and absorbs Gauntlet.** | Yes — one capstone per chapter; Gauntlet's S&U dressing becomes a House Style seed. |
| A-3 | **NPV/IRR before DCF in Models I** (the map proof needs NPV taught before the DCF uses it as a check). | Yes. |
| A-4 | **Placement probes** re-pointed to `navigation · printpage · ratios · scrub · dcf`. | Yes; bands re-swept when the pars are measured. |
| A-5 | **Wave order** — Foundations first, then the function pack, then chapter by chapter, engine packs interleaved. | Yes. Say if you want Data & Lookups earlier (it is the professional's chapter). |
