# ENGINE CHECKS V4 — what the engine grades today

_r457 · wave 0 of the CATALOG_V4 build order · **read-only verification, no engine file was touched.**_

Answers §6 of `dev/CATALOG_V4.md` ("Engine checks before the first wave") for the skill families of §3.
Every row carries **two** kinds of evidence: a source hit (`index.html:line`) and a **live probe** through the
running engine — the page served locally, opened with Playwright past the landing (`dev/e2e-smoke.js`'s
localStorage route), and the formula either handed to `evalFormula` or **typed into a cell by keyboard** and
read back off `dispText()`. A probe result of `#NAME?` is the engine's own verdict: `evalFormula`'s final
`default: throw fxErr('#NAME?')` (index.html:23702) makes an unknown function name a committing error VALUE,
so the cell displays `#NAME?` and any check reading that cell stays dark. That is the absent signal.

Probe scripts are scratch (not committed); every number below was read off a live run.

---

## 1 · The table

Status: **grades** = works today, verified live · **partial** = the family works but one named piece is missing
· **absent** = `#NAME?` or a no-op. Effort is judged from how `evalFormula` / the ribbon walker are
structured: **S** = one entry beside an identical neighbour, **M** = a new dialog, parser or multi-cell write,
**L** = needs a capability the engine does not have at all.

### E10 · text clean-up (`textclean`)

| function / op | status | evidence | effort if absent |
|---|---|---|---|
| `TRIM` | **grades** | index.html:23603 · typed `=TRIM(A1)` over `"  raw   NAME  "` → `raw NAME` | — |
| `PROPER` | **grades** | index.html:23606 · typed `=PROPER(TRIM(A1))` → `Raw Name` | — |
| `UPPER` / `LOWER` | **grades** | index.html:23604–23605 · `=UPPER("ab")`→`AB`, `=LOWER("AB")`→`ab` | — |
| `LEFT` / `RIGHT` | **grades** | index.html:23607 · `=LEFT("abcdef",3)`→`abc`, `=RIGHT("abcdef",2)`→`ef` | — |
| `MID` | **grades** | index.html:23612 · `=MID("abcdef",2,3)`→`bcd` | — |
| `FIND` | **grades** | index.html:23617 · `=FIND("c","abcdef")`→`3`; a miss throws `#VALUE!` (the IFERROR lesson) | — |
| `SEARCH` | **absent** | no hit in index.html · `=SEARCH("c","abcdef")` → `#NAME?` | **S** — one line beside `FIND`, lower-cased haystack |
| `LEN` | **grades** | index.html:23602 · `=LEN("abcd")`→`4` | — |
| `&` concatenation | **grades** | `cat_()` index.html:23717 · typed `=LEFT(A1,4)&"\|"&LEN(A1)` → `raw \|10` | — |
| `CONCATENATE` / `CONCAT` | **grades** | index.html:23625 · `=CONCATENATE("a","b")`→`ab` | — |
| `TEXT()` | **absent** | no hit · typed `=TEXT(1234,"#,##0")` → cell displays `#NAME?` | **M** — needs a format-string parser; `fmtNum()` (23328) already renders the same styles by name, so the work is mapping `"#,##0"` / `"0.0%"` / `"mmm-yy"` onto it |
| `SUBSTITUTE`, `VALUE` | **absent** | no hit · both → `#NAME?` | **S** each (plain string ops) |
| text-to-columns (Alt A E) | **absent** | `MENUS['A']` = S/T/H/J only (index.html:24617) — no `E` · live: Alt A E is a no-op, no dialog, no toast | **M** — new menu entry + delimiter dialog + a multi-cell write with undo |

**Verdict:** the *formula* half of E10 is fully live; the *command* half (text-to-columns) is not, and `TEXT()`
is not. `textclean` is buildable as designed **only if its "split first and last into their columns" beat is
written as a `LEFT`/`MID`/`FIND` formula pair rather than as Alt A E**, and if the email beat uses `&` rather
than `TEXT()`. On that reading it does **not** need the §6 fallback. Written as a true text-to-columns beat,
it does: fold the split into `scrub`, c4 ships 7 + capstone.

### M15 · discounting & returns (`dcf`, `npvirr`, `lbobuild`)

| function / op | status | evidence | effort if absent |
|---|---|---|---|
| `NPV` | **grades** | index.html:23569 · typed `=NPV(0.1,D1:D3)` over 100/110/121 → `272.727…` (Excel-true, first flow discounted one full period) | — |
| `IRR` | **grades** | index.html:23576, bisection · `=IRR(D1:D4)` over −500/200/200/300 → `0.17500…`; a no-sign-change range throws `IRR#NUM` | — |
| `PMT` | **absent** | no hit · typed `=PMT(0.1,5,-1000)` → `#NAME?` | **S** — closed form, one entry in the finance block beside `NPV` |
| `XNPV` / `XIRR` | **absent** | no hit · `=XNPV(…)` → `#NAME?` | **M** — needs a paired flow/date range walk; `YEARFRAC` (23663) is already there to build on |
| `^` exponent | **grades** | `pow_()` index.html:23723 · `=2^10`→`1024` | — |
| `SUMPRODUCT` | **grades** | index.html:23536 · `=SUMPRODUCT(D1:D3,D1:D3)`→`36741` | — |
| MOIC (arithmetic) | **grades** | `=(D2+D3+D4)/-D1`→`1.4` — no function needed | — |

**Verdict:** §6's question is answered **yes for NPV and IRR, no for PMT**. `npvirr` is buildable **as
designed** (NPV + IRR + payback + an `IF` flag + percent format all grade); `lbobuild` keeps its real `IRR`
and needs no IRR-by-table fallback. Only a PMT beat would need adding, and that is an S.

### M11 · dates (`wk13`, `typeset`, `series`)

| function / op | status | evidence | effort if absent |
|---|---|---|---|
| `TODAY()` | **grades** | index.html:23542 · `=TODAY()`→`46269` (serial) | — |
| `EDATE` | **grades** | index.html:23657 · typed `=EDATE(45000,3)`→`45092`; `=DAY(EDATE(DATE(2026,1,31),1))`→`28` (end-of-month clamp) | — |
| `EOMONTH` | **grades** | index.html:23657 · `=EOMONTH(45000,0)`→`45016` | — |
| `DATE` | **grades** | index.html:23652 · `=DATE(2026,3,1)`→`46082` | — |
| `YEAR`/`MONTH`/`DAY`, `YEARFRAC` | **grades** | index.html:23654, 23663 | — |
| date serial arithmetic | **grades** | `=E1+30` over serial 45000 → `45030` — serials are plain numbers, so `+7` weekly headers fill | — |
| `Mmm-yy` display (`fmtStyle:'date'`) | **grades** | `fmtNum` date branch index.html:23343 · Ctrl+1 → `D` (FMT_OPTS `D:Mar-26`, index.html:24679) typed live on serial 46023 → cell reads **`Jan-26`**, `fmtStyle==='date'` | — |
| `Ctrl+;` today shortcut | **grades** | index.html:29052 · pressed live on an empty cell → `value 46269`, `fmtStyle 'date'`, displays **`Sep-26`** | — |
| `WEEKDAY`, `DATEDIF` | **absent** | no hit · both → `#NAME?` | **S** each (both are one line off the existing serial↔Date conversion) |

**Verdict:** M11 is the most complete family checked. **No fallback needed** — `wk13` can build its week
headers with `EDATE`/`+7` as designed rather than seeding them, and `series` can carry a real `Mmm-yy` date
series instead of staying on years.

### M18 · hand-off (`handoff`, `cleanroom`)

| function / op | status | evidence | effort if absent |
|---|---|---|---|
| freeze panes (Alt W F F) | **absent** | `MENUS['W']` = `[['V','Show']]`, `MENUS['WV']` = `[['G','Gridlines']]` (index.html:24620–24621) — no `F` anywhere in the View tree · `S.freeze` does not exist (`'freeze' in S` → `false`) · live Alt W F F: no dialog, no toast, no state change. The one `freeze_panes` definition (index.html:30135) is a **rapid-fire chord recognizer** — it matches the keys and scores the round, it never touches the grid | **L** — the board is per-drill sized (`ROWS:20` and smaller, e.g. index.html:3093) and rendered whole with no scrolling viewport, so there is nothing for a frozen pane to hold still. Real behaviour needs a viewport model first. As an *inert graded stamp* (a latch a check can read) it is **S** |
| paste values (the rest of M18) | **grades** | Alt H V V index.html:27483; Alt H V S dialog 27484 | — |

**Verdict:** §6's fallback applies — **`handoff` drops the freeze beat**, and `cleanroom` keeps only its
paste-values/hardcode/delete-the-feed beats. Everything else in M18 is live.

### M7 · lookups (`lookup`, `lookup2`)

| function / op | status | evidence | effort if absent |
|---|---|---|---|
| `VLOOKUP` / `HLOOKUP` | **grades** | index.html:23631 · `=VLOOKUP("beta",F1:G3,2,0)`→`2`; exact and approx both wired; a miss commits `#N/A` | — |
| `INDEX` / `MATCH` | **grades** | index.html:23505/23502 · `=INDEX(G1:G3,MATCH("gamma",F1:F3,0))`→`3` | — |
| `XLOOKUP` | **absent** | no hit · typed `=XLOOKUP("beta",F1:F3,G1:G3)` → cell displays `#NAME?` | **S** — the `VLOOKUP` branch already has the range walk, `eqLoose` key match and text-preserving return; XLOOKUP is that with two separate ranges plus an optional `if_not_found` |
| `LOOKUP` | **absent** | no hit · → `#NAME?` | **S** |

**Verdict:** §6's fallback applies — **`lookup` teaches VLOOKUP → INDEX/MATCH only**, `lookup2` builds its
two-way tape on INDEX/MATCH as designed. XLOOKUP is a cheap add if a later wave wants it.

### E4 · paste special (`pastes`, `handoff`)

| function / op | status | evidence | effort if absent |
|---|---|---|---|
| Multiply | **grades** | `PASTE_OP_OPTS` index.html:24682–24684 (`M/Multiply`) · `doPaste` 27659–27661 | — |
| **Add** | **grades** | `D/Add` · live: copy `5`, Alt H V S → `D` → ↵ onto a `10` cell → **15** | — |
| **Subtract** | **grades** | `S/Subtract` (added r418) · live: same route with `S` → **5** | — |
| **Divide** | **grades** | `I/Divide` · live: same route with `I` → **2** (blank/zero clip cells are skipped, 27658) | — |
| kinds: All / Formulas / Values / Formats / Values&num / Col widths / Transpose | **grades** | `PASTE_OPTS` index.html:24686 | — |

**Verdict:** §6 says "fine either way" — in fact **all five math ops are wired**, so any paste-special beat
(add-back, sign flip, unit divide) is buildable as designed.

### M5 · logic (`ifs`, `revolver`, `covtable`)

| function / op | status | evidence | effort if absent |
|---|---|---|---|
| `IF` (lazy branches) | **grades** | index.html:23750 · `=IF(1>0,"y","n")`→`y` | — |
| `AND` / `OR` / `NOT` | **grades** | index.html:23649–23651 | — |
| `MIN` / `MAX` | **grades** | index.html:23695–23696 | — |
| `IFERROR` (any depth) | **grades** | index.html:23470 (outermost form) + 23756–23759 (nested, lazy) · `=IFERROR(1/0,0)`→`0` | — |
| `IFS` | **absent** | only `SUMIFS` matches the grep · typed `=IFS(1>0,"b")` → `#NAME?` | **S** — `facCore()` already carries the lazy-argument splitter used by `IF`/`IFERROR` (index.html:23736); IFS is a loop over the same parts array |

**Verdict:** the `ifs` drill is buildable as designed **on nested `IF` + `MIN`/`MAX` caps and floors** (which
is what §3 lists for M5). A literal `IFS()` beat would need the S above. No §6 row covers this — flagging it
here because the drill's key is `ifs`.

### M10 · statistics (`wacc`, `comps`)

| function / op | status | evidence | effort if absent |
|---|---|---|---|
| `MEDIAN` | **grades** | index.html:23693 · `=MEDIAN(G1:G3)`→`2` | — |
| `AVERAGE` | **grades** | index.html:23692 | — |
| `MIN` / `MAX` | **grades** | index.html:23695–23696 | — |
| `LARGE` / `SMALL` | **grades** | index.html:23589 · both→`3`/`1` | — |
| `RANK` | **grades** | index.html:23595, RANK.EQ semantics · `=RANK(2,G1:G3)`→`2` | — |
| `COUNT` / `COUNTA` | **grades** | index.html:23671/23676 · `3`/`3` | — |
| `PERCENTILE` / `QUARTILE` / `STDEV` | **absent** | no hit · all → `#NAME?` | **S** each — `numsIn()` + a sort is exactly the `LARGE`/`SMALL` shape |

**Verdict:** M10 as listed in §3 (MEDIAN, AVERAGE, MAX/MIN, LARGE/SMALL, RANK) is **fully live** — `wacc` and
`comps` build as designed. Only a quartile/percentile beat would need adding.

### M6 · conditional sums (`sumif`, `rollup`)

| function / op | status | evidence | effort if absent |
|---|---|---|---|
| `SUMIF` | **grades** | index.html:23516 · `=SUMIF(F1:F3,"beta",G1:G3)`→`2` | — |
| `SUMIFS` (sum range FIRST) | **grades** | index.html:23525 · `=SUMIFS(G1:G3,F1:F3,"beta")`→`2` | — |
| `COUNTIF` | **grades** | index.html:23545 · `=COUNTIF(F1:F3,"beta")`→`1` | — |
| `AVERAGEIF` | **absent** | no hit · typed `=AVERAGEIF(A1:A1,"x",B1:B1)` → `#NAME?` | **S** — a copy of the `SUMIF` branch with a hit counter |
| `COUNTIFS` / `AVERAGEIFS` | **absent** | no hit · both → `#NAME?` | **S** each (the `SUMIFS` pair-walker already exists) |

**Verdict:** §3 lists M6 as "SUMIF, SUMIFS, COUNTIF, AVERAGEIF" — three of four grade. `sumif` and `rollup`
are buildable as designed **if AVERAGEIF is not a required beat**; otherwise one S.

### E8 · sort (`scrub`) · E9 · filter (`filterpass`)

| function / op | status | evidence | effort if absent |
|---|---|---|---|
| Alt A S A / S D single-key sort | **grades** | handler index.html:27496 + `sortRange` · live: 3/1/2 selected → Alt A S A → **1,2,3**; Alt A S D → **3,2,1** | — |
| sort provenance latch `S.sortLog` | **grades** | index.html:27508 · live after the sort: `[{"dir":"asc","chord":false}]` | — |
| single-column sort warning | **grades** | `dialog='sortwarn'` index.html:27517 (Excel's decouple guardrail) | — |
| **Alt A S S multi-key dialog** | **absent** | `MENUS['AS']` = `[['A','Sort A→Z'],['D','Sort Z→A']]` (index.html:24618) — no `S` · live Alt A S S: no dialog, no toast, no state change | **M** — a new dialog (key columns + directions) plus a multi-key comparator over the existing `sortRange` |
| Ctrl+Shift+L arm / Alt A T | **grades** | index.html:29029 / 27631 · live: `S.filter` armed | — |
| Alt+↓ value picker | **grades** | index.html:28903, `openFilterPicker` 27984 · live picker listed `["a","b","c"]`; unticking one wrote `excl {"16":["a"]}` | — |
| **clear filter** | **grades** | `toggleFilter` teardown index.html:27958 · live: second Ctrl+Shift+L cleared it and stamped **`S.filterClears = 1`** (the latch `filterpass`'s bonus reads) | — |

**Verdict:** E9 is complete. E8 grades **single-key** sort only — `scrub` builds as designed on Alt A S A/S D
plus the warning-card route; a *multi-key* sort beat is not buildable this wave.

### Remove duplicates (Alt A M) · comments (Shift+F2)

| function / op | status | evidence | effort if absent |
|---|---|---|---|
| Remove duplicates (Alt A M) | **absent** | `MENUS['A']` has no `M` (index.html:24617); no `removeDup`/`dedup`/"remove dup" anywhere · live Alt A M: no-op | **M** — menu entry + a dialog for the key columns + a row-delete pass through the existing `pushUndo`/row machinery |
| Comments / notes (Shift+F2) | **partial** | index.html:28715–28719 **explicitly refuses it in classic mode**: `showToast('Shift+F2 inserts a cell comment in Excel — not in the trainer yet')` — confirmed live, and `S.cells['A1'].cmt` stayed `null`. The `cmt` cell flag and its red triangle **do** render (index.html:1808, 24304), but only rapid-fire's `add_comment` op (30178) sets it | **S** for the indicator (the cell flag and its renderer already exist — swap the toast for a `pushUndo` + `c.cmt=true`); **M** with real comment text (needs a text-entry dialog and a hover/peek surface) |

---

## 2 · Summary

1. **Nothing in §6 blocks a wave outright.** Two of the six §6 rows take their stated fallback; four do not.
2. **E10 text — no fallback needed** if `textclean`'s split beat is written as `LEFT`/`MID`/`FIND` formulas.
   TRIM/PROPER/UPPER/LOWER/LEFT/RIGHT/MID/FIND/LEN/`&` all grade live. Alt A E and `TEXT()` do not.
3. **M15 — no fallback needed.** NPV and IRR both grade live, so `npvirr` builds as designed and `lbobuild`
   keeps a real IRR. `PMT` is absent (S).
4. **M11 — no fallback needed, and it is the strongest family:** EDATE, EOMONTH, DATE, serial arithmetic,
   the `Mmm-yy` date format (Ctrl+1 → D) and `Ctrl+;` all grade. `wk13` can *build* its week headers; `series`
   can carry a real date series.
5. **M18 freeze — fallback applies.** Alt W F F is a rapid-fire chord only; there is no `S.freeze` and no
   scrolling viewport to freeze. `handoff` drops the freeze beat.
6. **M7 XLOOKUP — fallback applies.** `lookup` teaches VLOOKUP → INDEX/MATCH only (XLOOKUP is an S if wanted).
7. **E4 — better than §6 assumed:** Multiply, Add, Subtract *and* Divide are all wired and were all driven
   live through Alt H V S.
8. **E8/E9 — filter is complete (arm, picker, clear, `S.filterClears` latch); sort grades single-key only.**
   `scrub` builds as designed; a multi-key Alt A S S dialog is an M and is not buildable this wave.
9. **Buildable as designed:** textclean (formula split), npvirr, lbobuild, dcf, wk13, series, typeset, lookup2,
   pastes, scrub, filterpass, wacc, comps, sumif, rollup, ifs (on nested IF/MIN/MAX).
   **Taking a fallback:** handoff (no freeze beat), lookup (no XLOOKUP), cleanroom (no freeze).
10. **Also absent, none of them §6 rows, all S unless noted:** SEARCH · SUBSTITUTE · VALUE · TEXT (M) ·
    PMT · XNPV/XIRR (M) · WEEKDAY · DATEDIF · LOOKUP · IFS · PERCENTILE/QUARTILE/STDEV · AVERAGEIF ·
    COUNTIFS/AVERAGEIFS · remove duplicates (M) · text-to-columns (M) · multi-key sort (M) · comments.
