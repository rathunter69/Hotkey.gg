# hotkey.gg — Curriculum v2 Spec

Engine constraints assumed (from project state): grid A–J × 14+, end-state grading,
number-select 1–9 only, native Windows shortcuts (Macabacus/FactSet variants derived
from same end-states), no multi-sheet, no Ctrl+PgUp/PgDn drills.

**Tiers:** T1 = buildable with current engine (values, formulas, number formats, bold).
T2 = needs engine extensions (font color, fill, borders, alignment, sort).
T3 = deferred (cond. formatting, freeze panes, grouping).

Existing 12 drills slot into these tracks; listed inline as (existing) for ordering.

---

## Track 1 — Foundations (navigation, entry, copy/paste)

**F1. copyover (existing)** — copy/paste basics.

**F2. hardcode (existing)** — raw value entry.

**F3. fill-down** — T1
- Start: B2 has formula `=A2*2`; A2:A9 filled with values; B3:B9 empty.
- End: B3:B9 contain the formula (values correct per row).
- Par: select B2:B9 (Ctrl+Shift+Down from B2), Ctrl+D.
- Skill: Ctrl+D + Ctrl+Shift+Arrow selection.

**F4. fill-right** — T1
- Start: B3 has `=B2*1.1`; B2:H2 has a base row; C3:H3 empty.
- End: C3:H3 filled with the growth formula.
- Par: select B3:H3 (Ctrl+Shift+Right), Ctrl+R.
- Skill: Ctrl+R, horizontal model building.

**F5. paste-values** — T1
- Start: B2:B8 contains formulas referencing D2:D8.
- End: B2:B8 contains the same numbers as hardcoded values (no formulas); D column then cleared.
- Par: select B2:B8, Ctrl+C, Alt E S V Enter, then select D2:D8, Delete.
- Skill: Paste Special → Values (the single most-used desk operation).

**F6. anchor** — T1
- Start: C2:C8 has units; B1 has a price; D2 empty.
- End: D2:D8 = `=C2*$B$1` style (each row references locked B1).
- Par: type `=C2*B1`, F4 to lock, Enter, fill down (Ctrl+D pattern).
- Skill: F4 anchoring. Grade end-state: D values correct AND B1 edit-check
  (engine verifies formula string contains `$B$1` — we already parse formulas
  for INDEX/MATCH, same mechanism).

**F7. edit-repair** — T1
- Start: E2:E8 has formulas where E5 references the wrong row (off-by-one).
- End: E5 corrected.
- Par: navigate to E5, F2, fix reference, Enter.
- Skill: F2 edit-in-cell + spotting the break. Trains audit reflex.

## Track 2 — Formatting (desk conventions)

**M1. format+currency (existing)**, **M2. polish (existing)**.

**M3. number-formats** — T1
- Start: B2:B8 raw numbers (mix of large values, decimals, percents-as-decimals).
- End: B2:B4 comma style 0 decimals, B5:B6 percent 1 decimal, B7:B8 currency.
- Par: Ctrl+Shift+1, Alt H 9, Ctrl+Shift+5, Alt H 0, Ctrl+Shift+4.
- Skill: rapid number-format switching. Engine already checks number formats.

**M4. decimals** — T1
- Start: C2:C8 percentages showing 4 decimals.
- End: 1 decimal place.
- Par: select column, Alt H 9 ×3.
- Skill: Alt H 9 / Alt H 0 muscle memory. Short, rapid-fire candidate.

**M5. blue-inputs** — T2 (font color)
- Start: mixed grid — some cells hardcodes, some formulas, all black.
- End: hardcodes blue, formulas stay black.
- Par: Ctrl-click or navigate hardcodes, Alt H F C → blue.
- Skill: THE banking convention. High priority for engine extension.

**M6. borders** — T2
- Start: subtotal row unformatted.
- End: top border on subtotal row, bottom double border on total.
- Par: Alt H B P / Alt H B B (or Ctrl+1 borders).
- Skill: Alt H B chains.

**M7. center-header** — T2 (alignment)
- Start: title text in A1, data spans A:F.
- End: centered across selection (NOT merged — desk rule).
- Par: select A1:F1, Ctrl+1, Alt A, center across selection.
- Skill: center-across-selection vs merge. Good "unlearn bad habits" drill.

## Track 3 — Formulas (calculation speed)

**C1. margin (existing)**, **C2. percent (existing)**, **C3. lookup (existing)**,
**C4. foot (existing)**.

**C5. autosum** — T1
- Start: three blocks of numbers with empty total rows beneath each.
- End: totals present.
- Par: navigate to each total cell, Alt+= , Enter. 3 reps.
- Skill: Alt+= (AutoSum). Rapid-fire candidate.

**C6. growth** — T1
- Start: revenue row B2:H2; growth row B3:H3 empty except label.
- End: C3:H3 = `=C2/B2-1`, formatted percent 1dp.
- Par: type formula in C3, Ctrl+Shift+Right fill, Ctrl+R, format.
- Skill: YoY growth — the most-typed formula in banking.

**C7. cagr** — T1
- Start: beginning value, ending value, year count on grid.
- End: one cell = `=(end/beg)^(1/years)-1`, percent format.
- Par: single formula entry with parens + caret.
- Skill: CAGR syntax under time pressure.

**C8. minmax-if** — T1
- Start: cash balance row that can go negative; revolver draw row empty.
- End: revolver row = `=MAX(0,-cash)` pattern per column.
- Par: formula + fill-right.
- Skill: MAX(0,...) — core of every debt schedule.

**C9. sumif** — T1
- Start: two columns (category, amount), summary cells for 3 categories.
- End: SUMIF per category.
- Par: `=SUMIF($A$2:$A$10,D2,$B$2:$B$10)` + anchoring + fill.
- Skill: SUMIF + mixed anchoring.

**C10. round-clean** — T1
- Start: column of ugly decimals feeding a total that doesn't foot to display.
- End: wrapped in ROUND(...,1), refooted.
- Par: F2 into each, wrap function, or retype.
- Skill: ROUND wrapping, formula editing speed.

## Track 4 — Schedules (mini model components)

**S1. schedule (existing)**, **S2. gauntlet (existing)**.

**S3. depreciation-waterfall** — T1
- Start: capex row across years, useful life assumption, empty D&A grid.
- End: straight-line D&A per vintage + total row footing.
- Par: capex/life formula, F4 anchor on life, fill right, Alt+= total.
- Skill: waterfall/triangle build. Longest T1 drill (~120s par).

**S4. debt-paydown** — T1
- Start: opening balance, mandatory amort %, 4 years of columns.
- End: BOP/paydown/EOP rows linked, EOP feeds next BOP.
- Par: three formulas + Ctrl+R fill.
- Skill: corkscrew structure — appears in every LBO/restructuring model.

**S5. working-capital** — T1
- Start: revenue + COGS rows, DSO/DIO/DPO assumptions.
- End: AR/Inv/AP rows = driver formulas (rev/365*DSO etc.), NWC total, change in NWC.
- Par: three driver formulas + anchors + fill + subtraction row.
- Skill: WC schedule mechanics.

**S6. revenue-build** — T1
- Start: price row, volume row, growth assumptions.
- End: price grows at g1, volume at g2, revenue = P×V, all filled right.
- Par: two growth formulas + product formula + Ctrl+R ×3.
- Skill: bottoms-up revenue build.

**S7. bridge** — T1
- Start: EBITDA year 1, EBITDA year 2, empty bridge components with labels.
- End: component deltas computed, bridge foots to Y2.
- Par: subtraction formulas + Alt+= check row.
- Skill: bridge construction + footing discipline.

## Track 5 — Analysis (comps & credit)

**A1. comps (existing)**.

**A2. ev-build** — T1
- Start: share price, shares out, cash, debt, minority interest as inputs.
- End: market cap, EV computed; EV/EBITDA and EV/Rev multiples vs given metrics; ×.0x format.
- Par: 4 formulas + number formatting.
- Skill: EV bridge — asked in every interview, built every day.

**A3. credit-stats** — T1
- Start: EBITDA, interest, total debt, cash rows for a company.
- End: gross leverage, net leverage, interest coverage computed, ×.0x format.
- Par: 3 ratio formulas + format.
- Skill: restructuring bread-and-butter (your desk).

**A4. comps-median** — T1
- Start: comps grid with multiples for 6 companies, summary rows empty.
- End: MEDIAN, MEAN (AVERAGE), MIN, MAX rows across the multiple columns.
- Par: 4 formulas + Ctrl+R fill across metric columns.
- Skill: comps summary stats.

**A5. spread-fix** — T1
- Start: comps grid with 3 planted errors (wrong anchor, off-by-one ref, hardcode where formula should be).
- End: all three fixed, grid foots.
- Par: Ctrl+[ / F2 audit navigation, fixes.
- Skill: auditing someone else's spread — closest thing to real analyst work.

## Rapid-fire mode (specced earlier, still pending)

Best candidates once built: M4 decimals, C5 autosum, M3 number-formats, F3/F4 fills.
Rapid-fire = same engine, 15–30s micro-reps, streak scoring.

---

## Build order recommendation

1. **Batch 1 (pure T1, no engine changes):** F3, F4, F5, C5, C6, M3, M4 — 7 drills,
   all reuse existing check types. Fast to ship, immediately doubles Foundations.
2. **Batch 2 (T1, formula-string checks):** F6, C7, C8, C9, A2, A3, A4 — needs the
   engine to assert formula content (anchors, function names), same mechanism as
   the existing INDEX/MATCH check.
3. **Batch 3 (T1, longer schedule drills):** S3–S7, C10, F7, A5.
4. **Batch 4 (T2 engine work):** font color + alignment + borders checks, then
   M5, M6, M7 + the previously shelved sort drill.

Track ordering in UI: Foundations → Formatting → Formulas → Schedules → Analysis
(fixes the "Foundations first" reorder item already on the roadmap).
