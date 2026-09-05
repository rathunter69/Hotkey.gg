# CATALOG V4 — the drills, re-cut for variety

_r457 · 2026-09-04 · designed by the orchestrator directly, on Wolf's direction: "I went one by one and I
think the drills get repetitive and I'd like to take another stab at the drills and curriculum using the
core design principles." Facts from a full extraction of the 74 live drills (scratch `DRILL_FACTS.md`);
laws from `DEPTH_PASS.md` §1–§2, `DRILL_DOCTRINE.md` §2/§8, `CURRICULUM_V3.md` §9 (Foundations)._

**Status: DESIGN FOR WOLF'S REVIEW. Nothing here is built. §7 is the build order once approved.**

---

## 1 · Findings — why the catalog feels repetitive

Measured on the 74 shipped drills (menuOrder), not on impressions.

| # | finding | the number |
|---|---|---|
| F1 | **One interaction loop is most of the catalog.** Enter a formula → fill it across (Ctrl+R / Ctrl+D) → bold the total → top border → save. | Ctrl+B is a top-5 chord in **43** drills; Ctrl+R in **34**; Ctrl+D in **18**. A "Bold the … line and add a top border" beat appears in **~40** drills. |
| F2 | **The ☆ is the same discovery 40 times.** "Fill … in one pass" (or "from one anchored formula"). | **~40 of 74** ☆ labels are a fill-in-one-pass variant. |
| F3 | **Board monoculture.** Years across, line items down, a 20×10 finance grid. | **64 of 74** boards are `schedule` (40) or `table` (24). Tapes 7, forms 2, maze 1. |
| F4 | **The back half teaches finance formulas, not Excel.** Models I, Models II and Full Builds are 31 drills whose *Excel* skill is identical (F1) and whose only variation is the finance content (DCF vs revolver vs NWC). The product's promise is Excel. | **31 of 74** drills · Models II is nine credit schedules in a row. |
| F5 | **Whole desk-frequency skill families have zero or one drill.** Find & Replace (1), Go To Special (2), sort (1) + filter (1), IF/MIN/MAX (2), dates and EDATE/EOMONTH (1), text clean-up (TRIM/LEFT/RIGHT/PROPER) (0), NPV/IRR/PMT (0), Ctrl+Enter fill-selection (3), custom number formats via Ctrl+1 (scattered, never the lesson), freeze panes (0, engine), remove duplicates (0). These are the "hours come back" skills for the corporate audience. | **9 families** with ≤ 1 drill. |
| F6 | **Every prompt is the same story.** "The committee sits at four / it goes out tonight / by eight tomorrow." | **60+ of 74** task lines open on a deadline. |
| F7 | **Formatting is the only chapter with real op variety** (bold/italic/align/width/border/number-format), and 6 of its 9 still close on F1's trio. | — |
| F8 | **Duplicate pairs by mechanic** (same archetype, same domain, same chords): dcf/dcfbuild · lbo/lbobuild · debtsched/debtblock · comps/txncomps · isbuild/opmodel · balance/balcheck · sort/scrub · percent/anchor/fxconvert · bsbuild+cfslink/threestmt · ruleoff/ruleaudit · combo/housestyle · fcfbuild/dcf. | **12 pairs**. |

**The root cause in one line:** the catalog was grown by *finance artifact* ("we need a revolver drill") when the
lesson unit the player feels is the *Excel mechanic*. Two drills with different artifacts and the same
mechanic are the same drill to the hands.

---

## 2 · Design principles for v4 (additive to the binding laws — nothing below relaxes DEPTH_PASS §1.0–§1.9)

| # | principle | how it is enforced |
|---|---|---|
| P1 | **The lesson unit is an Excel skill family, and each drill in a chapter teaches a different one.** The finance artifact is scenery chosen to make that family the natural move. | every drill declares `meta.family` from §3; the checker fails two drills in one chapter on the same primary family |
| P2 | **Board archetype quota.** No archetype may carry more than 40% of a chapter. | new `meta.board` ∈ {`schedule` `table` `tape` `form` `grid` `two-block` `list` `maze` `cover`}; checker enforces ≤ 40% per chapter |
| P3 | **The closer trio is rationed.** "Bold the total + top border" may be a *core* beat in at most **one** drill per chapter (it stays legal as the finish-state dress, §1.6, and it is always legal as *scenery already on the board*). "Fill in one pass" may be the ☆ in at most **one** drill per chapter. | invariant: bonus-label stem uniqueness per chapter · core-beat regex cap per chapter |
| P4 | **Desk-frequency coverage.** Every family in §3 is taught by at least one drill, and taught before any drill requires it (the v3 checker, extended to families). | `check-curriculum-map.js` gains `families` |
| P5 | **Chaining over chores** (Wolf Test §8.1.4). Each beat changes what the next operates on. A drill whose beats could be reordered freely must be a formatting showcase or a tutorial. | review rubric, per spec page |
| P6 | **Three prompt registers, rotated.** *Deadline* ("goes out tonight"), *inheritance* ("the analyst who left / someone pasted zeros"), *question* ("the VP asked one thing"). No register above 50% of a chapter. | invariant: prompt regex counts per chapter |
| P7 | **Keep what already has a distinct mechanic; merge or retire the clones** (§1.0-R3(s) precedent). Retired keys keep their PBs as a retired row on the profile (r158). | §5 delta table |
| P8 | **Both audiences on every board** (§1.0-R4(t)) — but the *corporate* files were the ones missing (budget vs actual, headcount, vendor list, expense export, project tracker). v4 adds them where the family is a corporate-day skill. | §4 scenery column |
| P9 | **Eight chapters, eight drills each.** 64 drills: seven graded drills + one capstone per chapter (Foundations: four tutorials + three drills + the capstone). A count the landing can say in four words. | `menuOrder.length === 64` guard |

---

## 3 · The skill-family map (the unit of variety)

Ranked by desk frequency (Wolf's r429 ordering + the corporate day), grouped. `engine:` marks families the
engine does not grade today — a build wave verifies before authoring, and a family that cannot be graded is
folded into its neighbour rather than faked.

| id | family | Excel moves | taught by (v4) |
|---|---|---|---|
| N1 | move & jump | arrows, Ctrl+arrows, Ctrl+Home/End, PgUp/PgDn | navigation |
| N2 | select | Shift+arrows, Ctrl+Shift+arrows, Ctrl+Space, Shift+Space, Ctrl+A | navigation |
| N3 | go to & go to special | F5, F5 → Special (constants / formulas / blanks) | findgo · housestyle · audit |
| N4 | find & replace | Ctrl+F, Ctrl+H, whole-cell, replace-all | findgo · versionup |
| E1 | edit in place, undo, redo | F2, Esc, Ctrl+Z, Ctrl+Y | repairshop |
| E2 | clear & delete | Delete, Alt H E A/C/F, Ctrl+− | repairshop · scrub |
| E3 | clipboard | Ctrl+C/X/V, Ctrl+Enter fill-selection, Ctrl+D copy-above | navigation · repairshop · accdil |
| E4 | paste special | values / formats / transpose / multiply / add | pastes · handoff |
| E5 | fill & series | Ctrl+D/R, Alt H F I S, fill series of dates/years | powergrid · series |
| E6 | insert & delete rows/cols | Ctrl++ , Ctrl+−, Shift+Space / Ctrl+Space first | repairshop · scrub |
| E7 | hide / unhide / group | Ctrl+9/0, Ctrl+Shift+9/0, Alt Shift →/←, Alt A J/U | unhide · handoff |
| E8 | sort | Alt A S A/D, Alt A S S dialog, multi-key | scrub |
| E9 | filter | Ctrl+Shift+L, Alt+↓ picker, clear filter | filterpass |
| E10 | text clean-up | TRIM, PROPER, LEFT/RIGHT/MID, TEXT, text-to-columns · `engine: verify` | textclean |
| F1 | bold / italic / colour | Ctrl+B/I, Alt H F C, the blue–black–green–red convention | typeset · printshop |
| F2 | number formats | Alt H K / Alt H 9/0 / Ctrl+Shift+$ % ! / Alt H A N | printshop · decimals |
| F3 | custom formats | Ctrl+1 → `0.0x`, `Mmm-yy`, `(#,##0)`, superscript footnotes, center-across | customfmt |
| F4 | borders | Alt H B P/O/S/T/D, the totals-take-top-borders canon | printshop · ruleaudit |
| F5 | alignment & indent | Alt H A L/C/R, Alt H 6/5, wrap Alt H W | center |
| F6 | widths & fit | Alt H O I/W/A, ####, clipped labels | autofit |
| M1 | SUM & AutoSum | Alt=, SUM across/down, the corner | foot · powergrid |
| M2 | anchoring | F4 cycle, `$B$2` vs `B$2` vs `$B2`, one formula fills a grid | anchor · dcfsens |
| M3 | point mode | build by pointing at a yellow assumption, Ctrl+Enter | bridge |
| M4 | ratios & growth | margin, share, growth, CAGR `^(1/n)` | ratios |
| M5 | logic | IF, MIN, MAX, AND/OR, nested caps and floors | ifs · revolver · covtable |
| M6 | conditional sums | SUMIF, SUMIFS, COUNTIF, AVERAGEIF | sumif · rollup |
| M7 | lookups | VLOOKUP, INDEX/MATCH, two-way, XLOOKUP if the engine has it | lookup · lookup2 |
| M8 | error handling | IFERROR, #REF!/#DIV/0!/#VALUE! triage | wrapfix · triage |
| M9 | audit tools | F5 Special formulas, Ctrl+` show formulas, trace, F9 | audit · redflags |
| M10 | statistics | MEDIAN, AVERAGE, MAX/MIN, LARGE/SMALL, RANK | wacc · comps |
| M11 | dates | TODAY, EDATE/EOMONTH, weekly headers, Mmm-yy | wk13 · typeset |
| M12 | scenario switch | CHOOSE / INDEX on a case cell, sticky driver | cases |
| M13 | roll-forward | opening + adds − subs = closing, the corkscrew | corkscrew · rollfwd |
| M14 | check rows & tie-outs | assets − L&E = 0, applied vs repaid, sources = uses | balcheck · threestmt |
| M15 | discounting & returns | `1/(1+r)^n`, NPV, IRR, MOIC, PMT · `engine: verify NPV/IRR/PMT` | dcf · npvirr · lbobuild |
| M16 | sign convention | costs carry their sign, paste-special ×(−1) | powergrid · pastes |
| M17 | linking & referencing | Reference never retype, green links, cross-block wiring | threestmt · dashcover |
| M18 | hand-off | paste values, hardcode colour, delete the feed, freeze panes (`engine: verify`) | handoff · cleanroom |

38 families in v3's tag vocabulary collapse into these 34; the v3 `teaches`/`requires` tags map one-to-many
onto them and the checker keeps both (families for variety, tags for the require-before-teach proof).

---

## 4 · The catalog, chapter by chapter

Format per drill: **key · Name** · `board` · family · audience scenery · *beats* (4–6 core, outcome voice,
save closer implied) · **☆** · verdict (KEEP / RE-CUT / NEW / capstone). Kept drills list only what changes.
Prompts are register-tagged D (deadline) · I (inheritance) · Q (question).

### c1 · Foundations (8) — the tutorial chapter, per CURRICULUM_V3 §9

1. **navigation · Navigate & Select** · `maze` · N1 N2 E3 · regional sales table · *built r456* · **☆** every hall in one press · **KEEP** (built, tutorial 1)
2. **repairshop · Edit & Repair** · `schedule` · E1 E2 E3 E6 E7 · a headcount roster that came back from review [I] · *fix the misspelt team · re-enter the two wrong figures · restore the cell the note was wrong about (undo trap) · move each block to its bay · insert the missing quarter and line, delete the squatters · fold the detail band* · **☆** every block moved with one cut · **tutorial 2** (spec §9.2 stands; absorbs `editfix` and `rowops`)
3. **powergrid · First Formulas** · `schedule` · M1 M2 M16 E5 · a department budget with the totals stripped [I] · *total the first quarter · build the margin · anchor the share formula so one fill covers the block · make the cost lines carry their sign · fill the frame* · **☆** one anchored formula fills the whole block · **tutorial 3** (spec §9.3; absorbs `filldr`'s anchor lesson)
4. **printshop · Format the Page** · `table` · F1 F2 F4 F6 · the same budget, sendable [D] · *comma-format the body · percent-format the margins · blue the typed inputs · top-border the totals · autofit the label column* · **☆** every typed input found in one Go To Special · **tutorial 4** (spec §9.4)
5. **pastes · Paste Special** · `two-block` · E4 M16 · a fee deck in the wrong shape [I] · **KEEP** (already distinct; the transpose / multiply / formats / values quartet). Change: the ☆ becomes *values-only hand-off of the finished deck in one paste* (E4/M18 seed), not "one pass converts every row".
6. **findgo · Find & Go To** · `list` · N3 N4 · a 60-row vendor list where three vendor codes changed and every blank cost cell needs a zero [Q: "which vendors still say ACME?"] · *find the first renamed vendor · replace every old code with the new one in one action · go to every blank in the cost column and enter 0 · go to every formula and colour it black · return to the top* · **☆** the replace-all covers all three codes with one dialog · **NEW** — F5 is missing from the catalog and F5 is the fastest ten seconds in Excel
7. **series · Series** · `grid` · E5 M11 · a long-range plan frame with its year header and reference column stripped [I] · **KEEP**, **MOVE** c4 → c1 (it is a fill lesson, not a lookup lesson). Change: the header becomes a *date* series (Mmm-yy) so M11 is seeded here.
8. **modeltour · Model Tour** ★ · `schedule` · everything above · quarterly P&L with four broken subtotals · **KEEP** (capstone)

Retired from c1: `blocksel` (its clipboard half is tutorial 1, its dressing half is Formatting) · `rowops` `editfix` (into tutorial 2) · `filldr` (into tutorial 3).

### c2 · Formatting (8) — the wardrobe, one garment per drill

1. **typeset · Typeset** · `form` · F1 M11 · coverage memo · **KEEP**
2. **decimals · Decimals** · `table` · F2 · comps page · **KEEP**. Change: ☆ → *the hand-formatted cell found by Go To Special → constants, not by eye* (P3: its current ☆ is a fill variant).
3. **center · Center** · `table` · F5 · pipeline summary · **KEEP**. Change: add *center across selection* on the title as the chaining beat (F3 seed).
4. **autofit · Autofit** · `table` · F6 F5 · regional print page · **KEEP**. Change: absorbs `combo`'s wrap-text beat; ☆ → *both label columns fitted with one double-click-equivalent (Alt H O I on a two-column selection)*.
5. **customfmt · Custom Formats** · `table` · F3 · a valuation summary where the multiples read `8.2`, the dates read `45123`, the negatives read `-` and the footnote is a typed `1` [I] · *format the multiples as 0.0x · format the date column Mmm-yy · negatives in parentheses across the body · superscript the footnote mark · center the title across the block* · **☆** all three number formats applied from one Ctrl+1 visit per column group (three, not five) · **NEW** — Ctrl+1 is Wolf's stated priority (r177) and no drill owns it
6. **ruleaudit · Ruling Pass** · `schedule` · F4 · dressed schedule, four planted breaks · **KEEP** (disclosed-error format). Absorbs `ruleoff` (the apply-rulings drill is this one's first tier).
7. **housestyle · House Style** · `schedule` · F1 F2 N3 · raw P&L fragment · **KEEP** (the Go To Special → blue inputs move is its ☆ and stays).
8. **gauntlet · Make It Model-Ready** ★ · `two-block` · sources & uses · **KEEP** (capstone)

Retired from c2: `ruleoff` (into ruleaudit) · `combo` (wrap → autofit; the rest is housestyle).

### c3 · Formulas I (8) — one formula mechanic each

1. **anchor · Anchors** · `grid` · M2 · a 3×3 pricing grid · **KEEP** — THE F4 drill. Change: prompt register → Q ("what does the tier sheet quote at all three price points?").
2. **ratios · Ratios & Growth** · `table` · M4 · peer coverage page · **RE-CUT of `margin` + `cagr`**: *build the margin column · build the growth column · build the CAGR column (^(1/n)) · percent-format all three · bold the three ratio headers* · **☆** the CAGR built once and filled, the exponent anchored. Retires `percent` (its $-anchor lesson is anchor's) and `cagr`.
3. **foot · Foot** · `table` · M1 M14 · segment pack, totals stripped · **KEEP** — THE Alt= drill (across, down, the corner, the tie check).
4. **bridge · Point Mode** · `schedule` · M3 · five-year operating plan off yellow assumptions · **KEEP**. Change: ☆ → *every assumption referenced by pointing, none typed* (grades formula text — sanctioned exception, anchoring/referencing IS the lesson).
5. **ifs · Flags** · `table` · M5 · a budget-vs-actual with an empty flag column and an empty capped-bonus column [Q: "which lines are over, and what does the bonus pool pay?"] · *build the variance · flag every line over budget (IF) · cap the bonus at the pool (MIN) · floor the clawback at zero (MAX) · colour the flags red* · **☆** one IF(AND()) covers both conditions in a single column · **NEW** — IF/MIN/MAX have no first-contact drill; `cases` and `covtable` assume them
6. **sumif · SUMIF** · `tape` · M6 · freight booking ledger → summary · **KEEP**
7. **rollup · SUMIFS** · `two-block` · M6 M2 · booking ledger → segment × region cross-tab · **KEEP** (the mixed-anchor SUMIFS is the one legitimate "fill the whole cross-tab" ☆ in the chapter)
8. **qclose · Close the Quarter** ★ · `schedule` · M1–M6 · one quarterly P&L page · **NEW capstone** (v3 §10, unchanged)

Retired from c3: `percent` `cagr` (into ratios) · `fxconvert` (anchor's lesson on a different table).

### c4 · Data & Lookups (8) — the corporate-day chapter

1. **scrub · Scrub** · `tape` · E2 E6 E8 · deal blotter export with junk rows, a duplicate and no order [I] · **KEEP**; absorbs `sort` (the late-deal re-sort is its last tier).
2. **filterpass · Filter** · `list` · E9 M10 · coverage pipeline, two screens · **KEEP**
3. **unhide · Unhide & Group** · `table` · E7 · regional tape · **KEEP**
4. **textclean · Text Clean-up** · `list` · E10 · an HR export where names are `LAST, first`, codes carry trailing spaces and the email column must be built [I] · *trim the codes · proper-case the names · split first and last into their columns · build the email from first.last · paste the results as values over the source* · **☆** the whole clean-up built in one helper column and pasted back in one motion · **NEW** — `engine: verify` TRIM/PROPER/LEFT/RIGHT/FIND; if the engine cannot grade them this wave, fold the split beat into scrub and drop the drill (chapter stays at 7 + capstone)
5. **lookup · Lookup** · `two-block` · M7 · peer table → pitch screen · **KEEP**. Change: tier 1 is VLOOKUP (absorbs the v3 `tapepull` idea), tier 2 is INDEX/MATCH when the columns re-order.
6. **lookup2 · Two-way Lookup** · `grid` · M7 M2 · segment × quarter tape · **KEEP**
7. **recon · Recon** · `two-block` · M7 M14 M6 · blotter vs finance extract · **KEEP** — THE two-system reconcile.
8. **cleanroom · The Data-Room Tape** ★ · `tape` · E2 E7 E8 E9 M7 M18 · dirty export → sendable table · **NEW capstone** (v3 §10; absorbs `drill`'s delete-the-feed beat)

Retired from c4: `sort` (into scrub) · `drill` (paste-values is pastes' and handoff's) · `series` moves to c1.

### c5 · Formulas II (8) — audit and repair

1. **audit · Review Pass** · `schedule` · M9 N3 · divisional review, four disclosed breaks · **KEEP**; ☆ → *every hardcode found with one Go To Special → constants* (from `tieout`).
2. **triage · Error Triage** · `schedule` · M8 · #REF! / #DIV/0! / #VALUE! · **KEEP**
3. **wrapfix · IFERROR** · `table` · M8 M7 · board pack reads · **KEEP**
4. **balcheck · Make It Tie** · `schedule` · M14 · four-year balance sheet, zeros pasted over the check row · **KEEP**; absorbs `balance` (build the check row is its first tier).
5. **stalelink · Stale Links** · `schedule` · M17 · assumptions v2 beside v1 · **KEEP**
6. **cases · Sticky Switch** · `schedule` · M12 · scenario driver block · **KEEP**
7. **versionup · Roll-forward Prep** · `schedule` · N4 M17 · typed-in rates, version tags · **KEEP** — THE Ctrl+H drill; ☆ stays.
8. **redflags · The Red-Flag Pass** ★ · `schedule` · M8 M9 M14 M16 · inherited model, seven disclosed errors · **NEW capstone** (v3 §10)

Retired from c5: `balance` (into balcheck) · `tieout` (☆ to audit, foot owns the cross-foot) · `signerr` (sign convention is tutorial 3 + pastes).

### c6 · Models I (8) — valuation, one Excel mechanic per drill

1. **wacc · WACC** · `table` · M10 M2 · trading-comp beta set · **KEEP** — THE MEDIAN/AVERAGE drill.
2. **dcf · DCF** · `schedule` · M15 M2 · five-year DCF · **KEEP** — THE discount-factor drill (`^` and the F4 cycle). Absorbs `dcfbuild` and `fcfbuild` (the uFCF row is its first tier).
3. **comps · Comps** · `table` · M10 F3 · five-peer trading comps · **KEEP**. Change: the mechanic becomes *the implied range* — MIN/MAX/MEDIAN of the set, multiples in `0.0x` via Ctrl+1 (F3), the implied share price at each; ☆ → *all ten multiples from one Ctrl+Enter over the block*. Absorbs `txncomps` (a precedent tape is tier 2).
4. **dcfsens · Sensitivity** · `grid` · M2 · 5×3 two-way grid · **KEEP** — THE mixed-anchor drill.
5. **retbridge · Returns Bridge** · `schedule` · M4 M14 · three-lever equity gain · **KEEP** (attribution math + the check).
6. **accdil · Accretion / Dilution** · `table` · E3 M4 · three financing structures side by side · **KEEP**; ☆ stays (the block copied onto the other two structures) — the chapter's one clipboard ☆.
7. **npvirr · NPV & IRR** · `schedule` · M15 · a capex proposal with a cash-flow line and an empty decision box [Q: "does it clear the hurdle?"] · *build the NPV at the hurdle rate · build the IRR · build the payback year · flag the decision (IF) · percent-format the IRR* · **☆** NPV built once against the anchored hurdle and re-used by the flag · **NEW** — `engine: verify` NPV/IRR/PMT; if absent this wave, the drill is *Payback & NPV by hand* (cumulative cash + discount factors) and IRR waits
8. **pitchpage · The Valuation Page** ★ · `cover` · M17 M10 · one-page valuation summary · **NEW capstone** (v3 §10; absorbs `football`'s floor/ceiling range and `sourcesuses`' check)

Retired from c6: `fcfbuild` (into dcf) · `txncomps` (into comps) · `football` `sourcesuses` (into pitchpage).

### c7 · Models II (8) — credit, and the roll-forward as a pattern

1. **rollfwd · Roll Forward** · `schedule` · M13 · opening, add, less, closing on one line [I: "the analyst built interest off the closing balance and the sheet went circular"] · *build the closing balance · reference next year's opening to it · build interest off the beginning balance · fill the roll · colour the circular fix green* · **☆** the whole corkscrew from one formula pair · **NEW opener** (v3 §9.8; the circularity dodge no drill names)
2. **corkscrew · Fixed Assets** · `schedule` · M13 · capex plan → fixed-asset schedule · **KEEP** (`schedule`, renamed; the second corkscrew, now with a depreciation memo as the chaining beat)
3. **intsched · Interest** · `schedule` · M5 M13 · term-loan interest and coverage · **KEEP**. Change: the coverage line uses MIN/MAX caps so M5 is exercised, not only M13.
4. **revolver · Revolver** · `schedule` · M5 · draw and sweep · **KEEP** — THE MAX/MIN drill.
5. **covtable · Covenant Table** · `table` · M5 F1 · two leverage tests, quarterly · **KEEP**; ☆ → *the breach flags coloured red in one Go To Special → formulas → filter* (not a copy).
6. **wk13 · 13-Week Cash** · `grid` · M11 M1 · weekly cash roll · **KEEP** — THE dates drill. Change: the week headers are built with EDATE/+7 as the first tier (M11), not seeded.
7. **waterfall · Waterfall** · `schedule` · M5 M13 · two-tranche paydown · **KEEP** (the MIN cascade before the capstone)
8. **cascade · Full Waterfall** ★ · `schedule` · M5 M13 M14 · three facilities × four years · **KEEP** (capstone)

Retired from c7: `lbo` (into lbobuild) · `liqbridge` (three-case copy is accdil's) · `debtsched` (debtblock in c8 is the full schedule; intsched + revolver + waterfall are its parts).

### c8 · Full Builds (8) — assembling and shipping a page

1. **isbuild · IS Build** · `schedule` · M3 M4 · driver-panel income statement · **KEEP**; absorbs `opmodel` (units × price is its first tier).
2. **nwcsched · NWC Schedule** · `schedule` · M4 M13 · days-based working capital · **KEEP**
3. **threestmt · 3-Statement** · `two-block` · M17 M14 · three statements never wired · **KEEP**; absorbs `bsbuild` and `cfslink` (the retained-earnings roll and the cash link are its tiers).
4. **lbobuild · Paper LBO** · `schedule` · M15 M14 · entry/exit, MOIC and IRR · **KEEP**; absorbs `lbo`. `engine: verify` IRR — else MOIC and the IRR-by-table.
5. **debtblock · Debt Block** · `schedule` · M13 M5 · term loan + revolver + interest · **KEEP** (the assembled schedule)
6. **dashcover · Model Cover** · `cover` · M17 E3 · IC pack cover, six outputs × two cases · **KEEP** — THE Ctrl+Enter / Reference drill.
7. **handoff · Ship the File** · `schedule` · M18 E4 E7 N4 · a finished model going to the client [D] · *paste the outputs page as values · blue the hardcodes it now carries · replace the project codename with the client name everywhere · group the detail bands and fold them · go to every remaining formula on the page and confirm none reaches off-page (audit colour)* · **☆** values + formats pasted in one Paste Special visit, not two · **NEW** — the hand-off is what every analyst does last on every file and nothing teaches it
8. **shipit · Ship the Model** ★ · `two-block` · everything · mini three-statement + headline box · **NEW capstone** (v3 §10)

Retired from c8: `bsbuild` `cfslink` (into threestmt) · `opmodel` (into isbuild) · `dcfbuild` (into dcf, c6).

---

## 5 · Delta from v3 (74 → 64)

| move | keys | count |
|---|---|---|
| **KEEP** (built; changes noted in §4) | navigation pastes series modeltour · typeset decimals center autofit ruleaudit housestyle gauntlet · anchor foot bridge sumif rollup · scrub filterpass unhide lookup lookup2 recon · audit triage wrapfix balcheck stalelink cases versionup · wacc dcf comps dcfsens retbridge accdil · schedule→corkscrew intsched revolver covtable wk13 waterfall cascade · isbuild nwcsched threestmt lbobuild debtblock dashcover | **48** |
| **RE-CUT** (new key, two old drills folded) | ratios (← margin + cagr) | **1** |
| **NEW tutorials** (v3 §9, unchanged) | repairshop powergrid printshop | **3** |
| **NEW drills** | findgo customfmt ifs textclean npvirr rollfwd handoff | **7** |
| **NEW capstones** (v3 §10, unchanged) | qclose cleanroom redflags pitchpage shipit | **5** |
| **RETIRED** (lesson carried by the key in brackets) | blocksel [navigation·gauntlet] rowops editfix [repairshop] filldr [powergrid] · ruleoff [ruleaudit] combo [autofit·housestyle] · percent cagr [ratios·anchor] fxconvert [anchor] margin [ratios] · sort [scrub] drill [pastes·handoff] · balance [balcheck] tieout [audit·foot] signerr [powergrid·pastes] · fcfbuild [dcf] txncomps [comps] football sourcesuses [pitchpage] · lbo [lbobuild] liqbridge [accdil] debtsched [debtblock] · bsbuild cfslink [threestmt] opmodel [isbuild] dcfbuild [dcf] | **26** |
| MOVE | series c4 → c1 | — |
| RENAME (key kept) | schedule → *Fixed Assets* (key stays `schedule`; "corkscrew" is the display name only) | — |

48 + 1 + 3 + 7 + 5 = **64**. Retired keys keep boards and PBs as retired rows (r158); their leaderboards close.

**What the numbers look like after the re-cut** (design targets, checker-enforced):
- ☆ "fill in one pass" variants: 40 → **≤ 8** (one per chapter, and only where the fill IS the lesson: powergrid, rollup, dcfsens, …).
- "Bold + top border" as a core beat: ~40 → **≤ 8**.
- Board archetypes: schedule 40 → **~26**, table 24 → **~14**, and 24 boards on the six other archetypes (from 10).
- Families with ≤ 1 drill: 9 → **0** (N3 N4 M5 M11 M15 F3 each gain their own drill; E10 M18 gain one each subject to the engine check).
- Prompt registers: deadline 60+ → **≤ 32**.
- Chapter pars stay monotone (the v3 spine rule); the new drills are placed at their par estimate and re-swept at build.

---

## 6 · Engine checks before the first wave (a day of verification, not a build)

| family | question | if no |
|---|---|---|
| E10 text | does the evaluator grade TRIM / PROPER / LEFT / RIGHT / FIND / `&`? | fold textclean's split beat into scrub; c4 ships 7 + capstone |
| M15 finance | NPV / IRR / PMT in the evaluator? | npvirr becomes *Payback & NPV by hand*; lbobuild grades MOIC + IRR-by-table |
| M11 dates | EDATE / EOMONTH / date serial arithmetic and `Mmm-yy` display? (typeset's TODAY() suggests yes) | wk13 seeds the headers; series stays years |
| M18 freeze | freeze panes (Alt W F F) wired? | handoff drops the freeze beat |
| M7 XLOOKUP | present? | lookup teaches VLOOKUP → INDEX/MATCH only |
| E4 paste-add | Paste Special → Add / Multiply both wired? (pastes uses multiply) | fine either way |

---

## 7 · Build order (once Wolf approves — nothing starts before that)

| wave | what | why first |
|---|---|---|
| 0 | `meta.family` + `meta.board` on all 74 · the four new invariants (P2 P3 P4 P6) as *warnings* · the family map in `curriculum-v4.json` · the §6 engine checks | the guards exist before anything is re-cut, so the re-cut is measured |
| 1 | Foundations tutorials 2–4 (repairshop, powergrid, printshop) + findgo · retire blocksel rowops editfix filldr · move series | the entry funnel; every new player meets these first |
| 2 | Formatting: customfmt · ruleaudit absorbs ruleoff · autofit absorbs combo · the two ☆ re-cuts | smallest chapter, fastest win, proves the P3 ration |
| 3 | Formulas I: ratios, ifs, qclose · retire percent cagr fxconvert | |
| 4 | Data & Lookups: textclean (or the fold), lookup tiers, cleanroom · retire sort drill | |
| 5 | Formulas II: redflags + the three retirements | |
| 6 | Models I: npvirr, comps re-cut, dcf absorbs, pitchpage · four retirements | |
| 7 | Models II: rollfwd, wk13 dates tier, covtable ☆ · three retirements | |
| 8 | Full Builds: handoff, shipit, the three absorptions · four retirements | |
| 9 | flip the four invariants from warnings to failures · landing count 74 → 64 · SEO 301s for the 26 retired pages · certificates re-derived (C15) | |

Each wave is one PR of ≤ 5 drills built by Opus agents to these spec blocks expanded into house page format,
reviewed and landed by the orchestrator, gated by the existing 19 suites plus the new invariants.

---

## 8 · Decisions for Wolf (recommendation first)

| # | question | recommendation |
|---|---|---|
| D-1 | **64 drills, eight per chapter.** Retiring 26 built drills is the largest cut the catalog has taken. | **Yes.** Every retired lesson is carried by a named key; the alternative (keep 74 and add 15) leaves the clones in and the repetition with them. |
| D-2 | **Retired keys' leaderboards close.** PBs stay on the profile as retired rows. | **Yes** — r158 precedent; the boards on the surviving keys are the ones with traffic. |
| D-3 | **New Excel-native families that need engine work** (text functions, NPV/IRR, freeze panes). | **Verify first (§6), build what grades, fold the rest.** No faked grading. |
| D-4 | **Register rotation** — a third of prompts stop being deadline stories. | **Yes.** It is the cheapest variety in the catalog. |
| D-5 | **Chapter names unchanged.** Models I / Models II keep their names although their lesson is now Excel mechanics on finance scenery. | **Keep the names.** They are the audience B draw on the landing; the content under them is what changed. |
| D-6 | **`schedule` display name → "Fixed Assets".** | Cosmetic; your call. |

---

## 9 · Wave 0 measurement (r457 — the baseline the re-cut is judged against)

`meta.family` + `meta.board` are on all 74 drills; `check-invariants.js` prints C28–C31 as 39 warnings and `V4_STRICT=1`
fails them (wave 9 flips the default). Boards come off the index.html builders, cross-checked against §4 — they supersede §1 F3.

| chapter | C28 top board (P2 ≤40%) | C29 closer / ☆one-pass (P3 ≤1) | C30 family repeats (P4 = 0) | C31 deadline (P6 ≤50%) |
|---|---|---|---|---|
| Foundations (7) | schedule 4 · 57% ✗ | 0 / 3 ✗ | none ✓ | 1/7 · 14% ✓ |
| Formatting (9) | table 4 · 44% ✗ | 4 / 6 ✗ | F1×3 F4×2 ✗ | 5/9 · 56% ✗ |
| Formulas I (9) | two-block 3 · 33% ✓ | 3 / 7 ✗ | M2×3 M4×2 M6×2 ✗ | 3/9 · 33% ✓ |
| Data & Lookups (9) | four boards at 2 · 22% ✓ | 3 / 4 ✗ | M7×3 ✗ | 3/9 · 33% ✓ |
| Formulas II (10) | schedule 8 · 80% ✗ | 7 / 8 ✗ | M14×3 M8×2 ✗ | 0/10 · 0% ✓ |
| Models I (10) | table 4 · 40% ✓ | 5 / 6 ✗ | M10×4 ✗ | 7/10 · 70% ✗ |
| Models II (10) | schedule 6 · 60% ✗ | 10 / 7 ✗ | M5×4 M13×3 ✗ | 7/10 · 70% ✗ |
| Full Builds (10) | schedule 8 · 80% ✗ | 7 / 6 ✗ | M17×3 M3×2 M15×2 ✗ | 7/10 · 70% ✗ |

**Totals.** Boards schedule 34 · table 17 · two-block 10 · grid 5 · tape 4 · list/form/maze/cover 1 each. Bold+rule closer
**39/74** · fill-in-one-pass ☆ **47/74** · deadline prompts **33/74 (44%)**, under P6 catalog-wide but 70% in three chapters ·
**18** chapter family collisions · **3 of 38 families are nobody's primary** — N2 select, E10 text clean-up, F3 custom formats
(§1 F5, measured). `curriculum-v4.json` carries all 90 entries (74 built + 16 planned) with family, board and the §5 verdict — keep 45 · capstone 8 · new 10 · recut 1 · retire 26; `check-curriculum-map.js --v4` is clean.

**Judgment calls, so waves 1–8 can overrule them.** `intsched` takes M13 not §4's first-listed M5 (the prose adds M5 to a
roll-forward) · `fcfbuild` E5, the fill being its Excel lesson · `liqbridge` E3 off §5's "into accdil", M5 secondary · `recon`
`rollup` `lookup2` keep §4's first-listed family even where it repeats — the repeat is the finding. Boards §4 leaves unstated:
`sort` `scrub` tape · `percent` `fxconvert` `blocksel` `sourcesuses` two-block · `tieout` `lbo` `football` `drill` table · rest schedule.
