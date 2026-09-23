# Curriculum map (proposal): Project Volt, six chapters, lesson by lesson

Status: PROPOSAL, 2026-09-22. Replaces SITE_SPEC §7 if accepted. Built on `LESSON_FRAMEWORK.proposed.md` (Lesson → Challenge inside modules on a growing workbook) and `BANKER_CONVENTIONS.proposed.md` (canon ids like `B1`). Lesson ids are `chapter.section.lesson`; `C` is the module challenge. Chapter 1 is written out in full; Chapters 2–6 at section-and-lesson level with every task named.

## The throughline: Project Volt

The learner is the first-year analyst on the deal team advising the owners of **Voltline Charging Inc.** — a 40-site EV fast-charging network, USD — on a sale of the business. Management sends data; the analyst turns it into the pack a buyer will see. Each chapter is one stage of the process and produces one section of that pack; by the end of Chapter 6 the pack is complete and the partner presents the valuation.

| Chapter | Stage of the process | What management sends | What the analyst delivers |
|---|---|---|---|
| 1 Foundations (free) | The data comes in | The weekly site report for the Austin cluster, untidy | The weekly KPI page: clean, live, formatted, checked, print-ready |
| 2 Formatting and presentation | Historical financials for the book | Three years of P&L as a raw dump | The historical financials section of the information memorandum, presentation quality |
| 3 Formulas and functions | The KPI databook | Site master, tariff master, a session export with codes only, a summary that does not tie | The operating KPI databook, every number reconciled |
| 4 Data and analysis | Diligence analysis and the management case | The data room opens; buyer questions arrive | The diligence analysis pack, utilisation dashboard, the management case with sensitivities |
| 5 Financial modelling | The operating model | The rollout plan and the debt terms | The three-statement operating model buyers run their own cases on |
| 6 Valuation and deals | Valuation and the buyer universe | Comparable companies, precedent deals, a sponsor's term sheet, a strategic's financials | The valuation section and the one-page summary for the board |

Why this spine: it is the order the bootcamps teach (set-up → formatting → functions → data tools → model → valuation) because it is the order a deal produces its paper; every lesson has a reason ("the buyer will ask for this"); and the product can show the pack filling in, section by section, on the Learn page. Chapter certificates read as sections signed off.

**Ordering principle inside Chapter 1.** The analyst's workflow (open and set up → move and select → enter, copy and fill → structure → format → formulas → present and audit), not the shortcut families. Copy/paste moves from the last section to the third. Within Chapter 5 the "Excel best practices and efficiencies" block comes first, where TTS and WSP put it.

**Keeping Chapter 1 intuitive.** A charging site is a gas station for electric cars and kWh are the gallons, so Chapter 1 has lemonade-stand arithmetic: units (kWh sold) × price ($ per kWh) = revenue; less the electricity bought (energy cost) = gross profit. One unit, one price, one cost. Sessions, Fast vs Ultra tariffs, utilisation and platform fees arrive in Chapters 3–4, when the learner is ready for a second dimension.

**Time.** Chapter 1: 29 lessons × ~6 min + 7 challenges × ~3 min + Welcome + project/assessment/test-out ≈ 3.75 hours guided. For comparison: CFI Quick Start 3.5 h, WSP Excel Crash Course 8.6 h of video before any exercise, TTS Applied Excel one live day.

---

## Chapter 1 · Foundations (free) — Stage 1: the data comes in

*Where we are:* the deal team has just been mandated. The first thing management sends is the weekly site report for the Austin cluster — five sites, two weeks of daily figures — and it arrives untidy. The associate wants a clean one-page weekly KPI report that ties, formatted to house style, by Monday afternoon. Everything in this chapter is that job.

Workbook `voltline-weekly`, "Voltline — Austin Weekly KPI Report, w/c 15 Sep 2026". Sheets: **Raw** (the platform feed: Date · Site · kWh sold · Price · Revenue · Energy cost; 5 sites × 12 days (last week and this week, Mon–Sat) = 60 rows, columns A–F), **Inputs** (wholesale energy price $/kWh, target gross margin %, site list, units line "USD unless stated"), **Costs** (weekly site lease, maintenance and network fees by site), **Report** (blank at the start; the one-page weekly KPI report by the end), plus the untidy tabs the learner inherits (**Sheet2**, **Old wk37**). The grid is 100 × 26; everything fits. Sites: Domain, Mueller, Riverside, South Lamar, Airport; Cedar Park opens mid-chapter.

State names below (`S0`, `S1a`…) are the module workbook states in `content/workbooks/voltline-weekly.js`; each lesson starts from the previous lesson's `after`.

### 1.0 Welcome (1 lesson, no challenge)

| id | Title | Task | Before → after | Min | Concepts | Convention | Notes |
|---|---|---|---|---|---|---|---|
| 1.0.1 | Welcome: the feed in sixty seconds | Get to the bottom of the 60-row site feed, select the Revenue column, and jump back to the top — first the slow way, then the fast way, both on your own clock | `S0`, Raw sheet shown (60 rows) → unchanged | 3 | arrow-keys, ctrl-arrow, ctrl-shift-arrow, ctrl-home | A5 keyboard first | Two rounds per move, **both played by the learner** (arrows, then Ctrl+Arrow); clocks start on the first key of each round; the demo is dropped. Ends on the finished Report sheet with one line: "This is page one of the pack. You build it in this chapter." Under three minutes. Go To is not taught here. |

### 1.1 Open and set up (4 lessons + challenge) — Setup archetype, workbook hygiene, the core conventions

| id | Title | Task | Before → after | Min | Headline · supporting · uses | Convention |
|---|---|---|---|---|---|---|
| 1.1.1 | The workbook management sent | Tidy the file as it arrived: find your way round its sheets and cells, rename Sheet2 to Inputs, delete Old wk37, insert Report and move it to the front | `S0` (Raw, Sheet2, Old wk37, Costs; no Report yet) → `S1a` (Report, Raw, Inputs, Costs) | 6 | workbook/sheet/cell/range refs, Name Box, Formula Bar · Ctrl+PgUp/PgDn, rename/delete/insert/move sheet (Alt H O R, Alt H D S, Shift+F11, Alt H O M) · arrows, Ctrl+Arrow | A4 tab names and order |
| 1.1.2 | The Ribbon by keyboard | Turn the gridlines off on Report, walk the View and Home tabs by KeyTips, open Format Cells with Ctrl+1 and from the Ribbon (Alt H O E), back out with Esc one level at a time | `S1a` → `S1b` (Report gridlines off) | 5 | KeyTips (Alt, tab letters, groups) · Alt W V G, Ctrl+1, Alt H O E, Esc levels · Ctrl+PgDn | A3 gridlines off on a page someone reads; A5 |
| 1.1.3 | Set Excel up like an analyst | In Excel Options: understand calculation mode (leave Automatic; know F9), enable iterative calculation, add font colour, fill, borders and decimals to the Quick Access Toolbar and run one with Alt+number | `S1b` → `S1c` (settings recorded) | 6 | Excel Options (Alt F T) · calc mode + F9, iterative calc, QAT add + Alt+n · Ribbon KeyTips | A1 set up first; A2 QAT |
| 1.1.4 | Colour, label, one hardcode per cell | On Inputs: colour the typed inputs blue, leave the formulas black, add the units line "USD unless stated" in A2, split a hardcoded `=C7*0.13` (the wholesale energy price buried in a formula) into an input cell labelled "per utility contract" and a formula that references it | `S1c` → `S1d` (Inputs coloured and labelled; energy price in its own cell) | 7 | B1 colour by role · Alt H F C, F2 to read a formula, pointing to a cell while editing · Ctrl+Shift+↓, Ctrl+1 | B1 blue/black; B4 no hardcodes in formulas; B6 label the source; C1 inputs/calcs/outputs; C5 units line |
| 1.1.C | Challenge: another cluster's file | The Dallas cluster's workbook arrives the same way (seeded names, three untidy tabs, a hardcode inside a formula, a black input): rename and reorder, delete the stale tab, gridlines off, inputs blue, units line present, hardcode split out | seeded | 3 | whole module | graders: `roleColour`, `unitsLabel`, sheet order, gridlines state, `noLiteralInFormula` on the one named cell (whole-sheet enforcement starts at 1.6.C) |

### 1.2 Move and select (4 lessons + challenge) — Move archetype on the 60-row feed

| id | Title | Task | Before → after | Min | Headline · supporting · uses | Convention |
|---|---|---|---|---|---|---|
| 1.2.1 | Jump, don't scroll | The associate asks five questions about the feed; answer each by landing on the cell that holds it: last row, last column, the first blank in Energy cost, top of the sheet, the Notes block below the feed | `S1d` → unchanged | 5 | Ctrl+Arrow · Ctrl+Home/End, Home/End, PgUp/PgDn, Alt+PgDn · arrows | A5 |
| 1.2.2 | Select like you mean it | Select the Revenue column to its edge, the header row, the whole feed, a whole row and column, and then the sheet — the set-up for everything you format later | unchanged → unchanged | 5 | Ctrl+Shift+Arrow · Shift+Arrow, Shift+Space, Ctrl+Space, Ctrl+A ×2, Ctrl+Shift+Space, Ctrl+Shift+End · Ctrl+Arrow | A5 |
| 1.2.3 | Around the workbook | Move between the four sheets, jump to a far cell by address (Raw!F61), select a range by address, and land on Costs!B7 from Report — Go To for the cases it is for | unchanged → unchanged | 5 | Go To (Ctrl+G / F5) with sheet-qualified refs · Ctrl+PgUp/PgDn, reading the Name Box · Ctrl+Arrow | A5; §6 rule: Go To is for far or cross-sheet targets |
| 1.2.4 | What's typed and what's calculated | Costs mixes typed figures and formulas and a buyer will ask which is which: Go To Special → Constants, colour them blue in one go; → Formulas, confirm they are black; → Blanks, find the two sites with no maintenance figure | `S1d` → `S2a` (Costs coloured by role) | 6 | Go To Special (Alt H F D S; F5 → Alt+S) · multi-selection, Alt H F C on a special selection · B1 | F3 hardcode hunt; B1 |
| 1.2.C | Challenge: find and mark | A seeded 60–80 row feed with a formula column and stray typed numbers in it: reach six named cells keyboard-only, select three ranges, and mark every constant in the formula block blue via Go To Special | seeded | 3 | whole module | graders: selection end-states, `roleColour` on the formula block; mouse on the sheet = no PB |

### 1.3 Enter, edit, copy and fill (5 lessons + challenge) — Edit archetype; copy/paste taught early

| id | Title | Task | Before → after | Min | Headline · supporting · uses | Convention |
|---|---|---|---|---|---|---|
| 1.3.1 | Enter the missing day | The Airport site's Saturday never came through and management emailed the four figures: enter them with Tab and Enter, put 0 into the five blank Energy cost cells with one Ctrl+Enter, clear a stray "draft" note | `S2a` → `S3a` (feed complete) | 6 | Enter/Tab commit and move · Ctrl+Enter, Esc, Delete, text vs number alignment · Ctrl+Arrow, Ctrl+Shift+↓ | F5 read what Excel shows you (a left-aligned "number" is text) |
| 1.3.2 | Fix it in place | Three typos and a wrong figure in the feed: F2 into the cell, move the caret, fix; replace one cell by typing; undo a wrong fix and redo the right one | `S3a` → `S3b` (feed clean) | 5 | F2 edit mode · caret keys, Backspace/Delete in edit, replace-by-typing, Ctrl+Z/Y · Ctrl+F (peek ahead, taught next lesson) | E1 read a formula with F2 |
| 1.3.3 | Copy, cut, paste, fill | Build the Report skeleton from Raw: copy the header row across sheets, cut the Notes block to where it belongs, fill a label down five sites with Ctrl+D and a header right with Ctrl+R, drop a marquee with Esc | `S3b` → `S3c` (Report has headers and site labels) | 6 | Ctrl+C/X/V · Enter-paste, Esc marquee, Ctrl+D, Ctrl+R · Ctrl+PgDn, Shift+Space | E3 fill, don't retype |
| 1.3.4 | Paste Special: values, formats, transpose | Freeze last week's live totals into a "Prior week" values block (the comparison column the associate wants), copy the header style onto the new block with Paste Formats, turn the site list into a row header with Transpose | `S3c` → `S3d` (Report: prior-week values block, styled) | 6 | Ctrl+Alt+V V · T, E, Enter to confirm · Ctrl+C, Ctrl+Shift+→ | E4 values to snapshot on purpose, never over live formulas |
| 1.3.5 | Find, replace, fill a timeline | Replace "w/c 08 Sep" with "w/c 15 Sep" everywhere and read the count; Ctrl+F to the one "Airprot" and fix it to "Airport"; build the day header Mon–Sat and the week-number row with Fill Series | `S3d` → `S3e` (Report: timeline row) | 6 | Ctrl+F / Ctrl+H · Replace All count, Fill Series (Alt H F I S), dates as a series · Ctrl+R (copy vs series) | F5 read the count; C2 timeline row |
| 1.3.C | Challenge: complete the feed | A seeded feed missing one day and carrying four typos and one text-number: enter the day, fix by F2 and Replace All, copy the header block to a new sheet, paste a values snapshot, fill the timeline; formatting expectation: header bold and the snapshot labelled | seeded | 3 | whole module + 1.1.4 | graders: contents, `liveness` (snapshot is values, live block is formulas), header bold |

### 1.4 Structure (3 lessons + challenge) — Structure archetype

| id | Title | Task | Before → after | Min | Headline · supporting · uses | Convention |
|---|---|---|---|---|---|---|
| 1.4.1 | Rows and columns that keep the totals honest | Cedar Park opened this week: add a sixth site row inside the Report block and a "Margin %" column, delete the stale "Old code" column, and watch the running total formula follow every edit | `S3e` → `S4a` | 6 | Ctrl+Shift+= / Ctrl+- on whole rows and columns · Shift+Space / Ctrl+Space first, Alt H I R/C, Alt H D R/C, what #REF! means when you delete a referenced cell · Ctrl+Arrow | F1 precursor: a total that follows its rows is the first check |
| 1.4.2 | Widths, heights, AutoFit | Set the six day columns to one equal width, AutoFit the label column to its longest site name, give the title row height 24, AutoFit it back; unclip the units line | `S4a` → `S4b` | 5 | Alt H O W / I / H / A · Excel's width units, selecting several columns first · Ctrl+Space, Shift+→ | C2 equal-width period columns |
| 1.4.3 | Hide, group, freeze | Hide the two working columns, then unhide them and **group** them instead (a buyer's analyst will find a hidden column and wonder why); freeze the title and label column so the report scrolls without losing its heads | `S4b` → `S4c` (Report: grouped working columns, frozen panes) | 6 | Freeze Panes (Alt W F F/R/C) · Ctrl+9/0 and Ctrl+Shift+( / ), Group/Ungroup (Alt Shift → / ←) **[engine gap]** · Ctrl+Space | C7 group don't hide; C8 freeze |
| 1.4.C | Challenge: reshape the report | Seeded report with a missing site row, a stale column, uneven widths, a hidden column and nothing frozen: insert, delete, equalise widths to 12, unhide and group, freeze at B3; totals must still be live | seeded | 3 | whole module | graders: structure, `noHidden`, `rowConsistent` on totals, freeze position |

### 1.5 Format (4 lessons + challenge) — Format archetype; the house style

| id | Title | Task | Before → after | Min | Headline · supporting · uses | Convention |
|---|---|---|---|---|---|---|
| 1.5.1 | Numbers a banker can read | Report figures: thousands separators, 0 decimals, negatives in parentheses; Margin % to one decimal; the energy price to three decimals ($/kWh); the target margin as a percentage; the total row as currency; do it with Ctrl+1 first, then the shortcuts | `S4c` → `S5a` | 6 | Format Cells Number tab (Ctrl+1 N/P/C) · Ctrl+Shift+1 / 4 / 5, Alt H 0 / 9 decimals, negatives style · Ctrl+Shift+↓ | D1 parentheses; D2 consistent decimals |
| 1.5.2 | Fonts, fills, borders | Bold the title and totals, give the totals a top border (not a grid), fill the input block a light tint, colour the two typed rates blue, size the title one step up | `S5a` → `S5b` | 6 | Alt H B (borders menu: top, double bottom) · Ctrl+B/I/U, Alt H H fill, Alt H F C, Alt H F G · Shift+Space | D5 totals bold with a top border; B3 input tint; D8 one font |
| 1.5.3 | Alignment and titles | Centre the title across the report with Center Across Selection, right-align headers over numbers, indent the day lines under each site, wrap the long note | `S5b` → `S5c` | 5 | Center Across Selection (Ctrl+1 A) · Alt H A R/C/L, Alt H 6/5 indent, Alt H W wrap · Ctrl+Shift+→ | D7 never merge; D6 indent and headers |
| 1.5.4 | The style pass | A second, unformatted block (Costs summary) brought to the same standard in one pass, using F4 to repeat the last format **[engine gap: F4 repeat outside edit mode]**, the number shortcuts and the QAT; finish by removing a stray all-borders grid | `S5c` → `S5d` (Report fully to house style) | 6 | F4 repeat last action · Ctrl+Shift+1/5, QAT Alt+n, Alt H B N (no border) · everything in 1.5 | D5, D1, D2 together |
| 1.5.C | Challenge: to house style in three minutes | A seeded unformatted weekly report (figures, %, a title, totals, an input block) for another cluster: bring it to the standard — this is the formatting challenge — graded on every convention the module taught | seeded | 3 | whole module | graders: `negativesParen`, `decimalsConsistent`, `totalsTopBorder`, `roleColour`, Center Across on the title, no all-borders |

### 1.6 Formulas (6 lessons + challenge) — Formula archetype

| id | Title | Task | Before → after | Min | Headline · supporting · uses | Convention |
|---|---|---|---|---|---|---|
| 1.6.1 | Point, don't type | Build gross profit (revenue less energy cost), gross margin % and average price per kWh for one site by pointing at cells with the arrow keys; read each formula back with F2 | `S5d` → `S6a` (Report: one site's calc lines) | 6 | `=` and operators, pointing · F2 precedents, parentheses, order of operations · Enter/Tab | E1 point, don't type |
| 1.6.2 | SUM family and AutoSum | Total the six sites with Alt+= in one press across the block, then AVERAGE, MIN, MAX, COUNT and COUNTA for the week summary; see what a blank does to AVERAGE | `S6a` → `S6b` | 6 | Alt+= · SUM/AVERAGE/MIN/MAX/COUNT/COUNTA, block AutoSum · Ctrl+Shift+→ | E5 AutoSum the block plus its edge |
| 1.6.3 | Anchors: $ and F4 | The wholesale energy price and target margin live on Inputs: write one energy-cost line (kWh × $/kWh) that fills down without breaking, cycle F4 through the four anchor states, fix a mixed-anchor table (sites × energy-price scenarios) | `S6b` → `S6c` | 7 | F4 anchoring · relative/absolute/mixed, why a fill broke · Ctrl+D | E2 anchor; B4 one input, referenced |
| 1.6.4 | Link across sheets | Replace the typed site figures on Report with live links to Raw and Costs (`=Raw!E12`), fill them down, colour the links green; note that external-workbook links would be red and are avoided | `S6c` → `S6d` (Report fully live) | 6 | cross-sheet references · pointing across sheets while editing, Ctrl+PgDn mid-formula, green links · Ctrl+D, Alt H F C | B2 green links; E7 avoid external links |
| 1.6.5 | One formula per row, filled right | Build this week's six-day block: write each line once in the Monday column, Ctrl+Shift+→ then Ctrl+R across the week; fix a row whose Thursday was retyped with F2 → Ctrl+Enter; show formulas with Ctrl+` **[engine gap]** to see the pattern | `S6d` → `S6e` (Report: daily block) | 6 | Ctrl+R after Ctrl+Shift+→ · Ctrl+Enter over a selection, Ctrl+` show formulas · F4, F2 | C3 one formula per row; E3 |
| 1.6.6 | Read the error, follow the trail | Five planted errors on Costs (#REF!, #DIV/0!, #NAME?, #VALUE!, #N/A): read each code, trace with Ctrl+[ and Ctrl+], fix the input or the formula, never paste a value over it | `S6e` → `S6f` (Costs clean) | 6 | error codes · Ctrl+[ / Ctrl+] trace, F2, Esc out of a bad edit · Go To Special constants | F5 the error is a message; F3 trace |
| 1.6.C | Challenge: the site P&L | Seeded: a site block with typed figures, an Inputs sheet, two errors and one hardcoded rate: link, total with AutoSum, add margin %, anchor the rate, fix the errors, fill the week right; every formula live and consistent | seeded | 3 | whole module + 1.5 | graders: `liveness` per cell, `rowConsistent`, `noLiteralInFormula`, `roleColour` (links green, inputs blue) |

### 1.7 Present and audit (3 lessons + challenge) — Setup + Audit archetypes

| id | Title | Task | Before → after | Min | Headline · supporting · uses | Convention |
|---|---|---|---|---|---|---|
| 1.7.1 | Fit to one page | Page setup for Report: landscape, fit to 1 wide, print titles rows 1–3 **[engine gap: titles/footer fields]**, footer with file name and date, gridlines off in print; read the page as the MD would; closing note on saving versions | `S6f` → `S7a` | 5 | Page Setup (Alt P S P) · orientation, fit to page, titles, footer · Alt W V G | G1 print set-up; G2 how a page reads; F4 print and read it; A6 versions (stated) |
| 1.7.2 | The checks row | Add a Checks block under the report: report revenue = Raw revenue (`=B20-SUM(Raw!E2:E61)` → 0), sites sum = grand total, margin within 0–100%; label it, format 0 as "OK" later (Ch2); freeze it in view | `S7a` → `S7b` (Report: checks) | 6 | a check cell (difference → 0) · cross-sheet SUM, ABS, freeze the checks in view · Alt W F | F1 checks row |
| 1.7.3 | Hardcode hunt | The associate's markup: a version of Report with eight planted violations from the day-one list (a literal in a formula, an input shown black, a formula row whose Thursday was retyped, a title centred by padding spaces instead of Center Across, a minus where the house uses parentheses, unlabelled units, an all-borders grid with gridlines on, a hidden column): find them with Go To Special, show formulas and tracing; fix every one, change nothing else | `S7b` → `S7c` | 7 | the audit pass · Go To Special constants inside formulas, Ctrl+`, Ctrl+[ · everything | F3; the told-off list |
| 1.7.C | Challenge: audit before you send | Seeded: a report with five planted violations drawn from the list; find and fix all five in three minutes, then set landscape and fit to page | seeded | 3 | whole module | grader: every planted fault fixed, nothing else changed (diff against `after`), page setup state |

### 1.8 Project, assessment, test-out

| id | Title | Task | Min | Notes |
|---|---|---|---|---|
| 1.8.P | Project: the weekly KPI report | Management's next feed (`S8raw`: Raw 5 sites × 12 days, Inputs, Costs; Report blank): build the linked, totalled, margin-bearing, formatted, checked, print-ready one-page report the chapter has been building — 14 goals, guided, no teach lines. This is page one of the Project Volt pack | 12 | `S8raw` → `S8done` (same shape as `S7c`). Concepts: none new. Conventions: B1, B2, B4, C5, D1, D2, D5, D7, F1, G1. |
| 1.8.A | Assessment: Monday morning | Same brief, fresh figures, one extra site, 12 goals, 8 minutes on the clock starting at the first key; solo, keyboard-only for the Verified certificate | 8 | seeded `S8raw` → graded like the project. Conventions as the project. |
| 1.8.T | Test out of Foundations | Ten tasks across the seven modules on one seeded workbook, 5 minutes | 5 | seeded `S7b`-shaped workbook. Pass = chapter skipped (skipped ≠ completed). |

**Chapter 1 counts**: 1 Welcome + 29 lessons + 7 challenges + project + assessment + test-out = 40 items (38 today). Concepts taught: ~70 distinct ids (86 today, many of them one-liners such as `home-key` that fold into a lesson). Every priority shortcut in LESSON_FRAMEWORK §4 is still taught: F2, F4, Esc, Ctrl+Arrow, Ctrl+Shift+Arrow, Ctrl+Home/End, Ctrl+PgUp/PgDn, Shift+Space/Ctrl+Space, Ctrl+D/R, Ctrl+Z/Y, Ctrl+C/X/V, Ctrl+Alt+V, Alt+=, Ctrl+1, Ctrl+B/I/U, Ctrl+Shift+1/4/5, Alt+H chords, Ctrl+[ / ], Ctrl+`, F5/Ctrl+G, Ctrl+F/H, Shift+F11, Alt W F, Alt Shift →.

**Engine gaps Chapter 1 now needs** (each with a node test, per the brief): grouping/outline (Alt+Shift+→/←, outline buttons drawn), Ctrl+` show formulas (view toggle), print titles and footer fields in Page Setup, F4 as repeat-last-action outside edit mode, seeded workbook states, challenge mode in the runner. Already in the engine and reused: QAT Alt+number, Ctrl+[ / ], F9, Page Setup orientation and fit, Go To Special, Find/Replace, cross-sheet references, hide/unhide/freeze. Ctrl+\\ (row differences) is nice-to-have; Ctrl+[ ] already exist.

---

## Chapter 2 · Formatting and presentation (paid) — Stage 2: historical financials for the book

*Where we are:* the information memorandum is being drafted. Management's finance team sends three years of P&L as a raw dump from their accounting system. These pages go in front of every buyer, so they have to look like a banker made them. Every grader in this chapter applies the full canon.

Workbook `voltline-pnl`: "Voltline — P&L FY24A–FY26E", annual columns FY24A, FY25A, FY26E plus a 12-month FY26 detail block (15 period columns + labels; fits 26). Lines: revenue (Public, Fleet, Home), energy cost, site leases, maintenance, platform and payment fees, staff, site count 28 → 40. Sheets: **P&L**, **Inputs**, **Monthly**, **Print**. Arrives as a raw dump; leaves at presentation quality.

| § | Module | Lessons (task) | Challenge |
|---|---|---|---|
| 2.1 | Number formats | 2.1.1 Built-in formats on a P&L (thousands, decimals, dates, the shortcut set) · 2.1.2 Sign convention: costs negative, parentheses, stated once (C4, D1) · 2.1.3 Currency and percent lines: symbol only on first and total rows, % to one decimal (D4, D2) · 2.1.4 Dates on the timeline: month-end headers, fiscal year labels | Format a seeded raw P&L's numbers to standard in 3 min |
| 2.2 | Custom number formats **[engine: format strings]** | 2.2.1 The four-section format string; zero as a dash (D3, D9) · 2.2.2 Units in the format: "k", "m", "x", bps · 2.2.3 Dynamic headers with TEXT ("FY" & year, "w/c " & date) · 2.2.4 Conditional custom formats and hiding zeros in working blocks | Build the house number-format set on a seeded sheet |
| 2.3 | Model formatting standards | 2.3.1 The page a buyer's MD reads: title, units, timeline, sections, answer (G2) · 2.3.2 Actuals vs estimates: the divider column, header shading, the A/E row (B5) · 2.3.3 Borders that mean something: section tops, total tops, double bottoms; no grids (D5) · 2.3.4 Labels, footnotes and comments: every assumption sourced, because diligence will ask (B6, G3) · 2.3.5 Widths and the label column: indents by hierarchy, equal period widths (D6, C2) | Take a seeded unformatted three-year P&L to presentation quality in 3 min |
| 2.4 | Alignment and structure | 2.4.1 Wrap, indent, Center Across Selection at scale · 2.4.2 Grouping and outline levels: detail under summary (C7) · 2.4.3 Hiding vs grouping vs a separate sheet: when each is right · 2.4.4 Navigation column and named anchors for a long sheet | Restructure a seeded flat P&L into a grouped, navigable one |
| 2.5 | Conditional formatting **[engine]** | 2.5.1 Highlight rules: negatives, exceptions, out-of-range inputs · 2.5.2 Formula-driven rules: flag a check ≠ 0 red, OK green (F1) · 2.5.3 Data bars and scales on a KPI block; when not to · 2.5.4 Managing rules: order, stop-if-true, clearing | Add the checks flags and exception highlights to a seeded model |
| 2.6 | Dates and text for presentation | 2.6.1 TEXT for labels and headers · 2.6.2 EOMONTH and EDATE for period ends · 2.6.3 Concatenation and & for dynamic titles ("Voltline — FY" & B2) · 2.6.4 Cleaning imported labels: TRIM, PROPER, SUBSTITUTE | Build the dynamic header block on a seeded sheet |
| 2.7 | Printing and page layout | 2.7.1 Print areas, titles, fit to width, headers and footers (G1) · 2.7.2 Print preview and page breaks **[engine: preview]** · 2.7.3 The one-page financial summary linked from the detail, ready to drop into the book | Make a seeded three-sheet model print as a clean pack |
| 2.P/A | Project and assessment | Take the unformatted FY24–FY26 P&L to presentation quality end to end — the historical financials section of the book; assessment on fresh figures, 10 min | |

Bootcamp coverage: this chapter is the TTS "Formatting a financial model" article, BIWS Module 2 and CFI's Format-a-Model course as a unit; the live week gets it in a morning. Charts (TTS Applied Excel §5, BIWS Module 5) stay out: engine scope.

## Chapter 3 · Formulas and functions (paid) — Stage 3: the KPI databook

*Where we are:* buyers will want site-level operating data that ties to the financials. Management sends the site master, the tariff master and a session export with codes only — and a summary sheet somebody started that does not tie. This is where sessions and the Fast/Ultra tariffs enter the story.

Workbook `voltline-lookups`: **Sites** (master: code, name, cluster, chargers, kW, opened date), **Tariffs** (code, name, price per kWh, energy cost per kWh), **Sessions** (80-row export with codes only), **Summary** (to build), **Loans** (charger equipment financing and a new-site build case). The Summary is broken when the chapter starts and ties out when it ends.

| § | Module | Lessons (task) | Challenge |
|---|---|---|---|
| 3.1 | Logic | 3.1.1 IF on a threshold: flag sites below target utilisation · 3.1.2 Nested IF vs IFS vs MIN/MAX (E6): site manager bonus tiers · 3.1.3 AND/OR/NOT: compound flags · 3.1.4 IFERROR and the override pattern: ISNUMBER/ISBLANK for manual overrides of a calc | Build the flags block on a seeded summary |
| 3.2 | Dates | 3.2.1 Serial numbers, DATE, YEAR/MONTH/DAY: site age · 3.2.2 EOMONTH/EDATE timelines: monthly and quarterly · 3.2.3 YEARFRAC and day-count for lease and interest accruals · 3.2.4 Fiscal periods: the FY and quarter of any date | Build a seeded fiscal-quarter timeline and age table |
| 3.3 | Math and aggregation | 3.3.1 ROUND family, ABS, CEILING/FLOOR on tariffs · 3.3.2 COUNTIF/COUNTIFS: sessions by site and tariff · 3.3.3 SUMIF/SUMIFS/AVERAGEIFS: kWh and revenue by site × tariff from the export · 3.3.4 LARGE/SMALL/RANK: busiest sites · 3.3.5 SUMPRODUCT and boolean criteria: blended price per kWh | Roll a seeded export up to a site × tariff summary |
| 3.4 | Lookups | 3.4.1 VLOOKUP/HLOOKUP and how they fail (column insert, approximate match) · 3.4.2 MATCH, then INDEX/MATCH · 3.4.3 Two-way INDEX/MATCH: the tariff at any site in any month · 3.4.4 XLOOKUP: exact, not-found, two-way · 3.4.5 CHOOSE and INDEX as scenario pickers · 3.4.6 OFFSET/INDIRECT: when they are needed and why they are avoided (E6); ROW/COLUMN as counters | Rebuild a seeded broken lookup summary so every line ties |
| 3.5 | Text | 3.5.1 LEN/LEFT/RIGHT/MID: split site and charger codes · 3.5.2 FIND/SEARCH/SUBSTITUTE: parse imported descriptions · 3.5.3 TRIM/VALUE/DATEVALUE: turn a text export into numbers · 3.5.4 Text to Columns **[engine]** and Flash Fill idea | Clean a seeded text dump into a usable table |
| 3.6 | Time value of money | 3.6.1 PV/FV/PMT: the charger equipment loan schedule · 3.6.2 NPV and XNPV: a new-site build case, timing conventions · 3.6.3 IRR and XIRR: irregular cash flows, footnotes · 3.6.4 Building a simple annuity schedule with anchors | Value a seeded site-build case with NPV/IRR and a payment schedule |
| 3.7 | Auditing | 3.7.1 Trace precedents and dependents (Ctrl+[ ]), Evaluate Formula idea · 3.7.2 Go To Special formulas/constants, show formulas, F9 partial evaluation · 3.7.3 Hardcode and external-link hunt on a colleague's summary (E7, F3) · 3.7.4 Error checking rules and the checks block | Audit a seeded summary: find six faults |
| 3.P/A | Project and assessment | Rebuild the broken Summary so every number ties to Sessions — the KPI databook; assessment on a fresh export, 12 min | |

Bootcamp coverage: this is WSP ECC chapters 4–7 and TTS Applied Excel §2–3, taught on one dataset instead of function files. LAMBDA/LET (WSP ch. 10) stay out by design.

## Chapter 4 · Data and analysis (paid) — Stage 4: diligence analysis and the management case

*Where we are:* the data room is open and questions are coming in from three bidders. The team needs the site data sliced every way a buyer will ask, a utilisation dashboard, and the management case set up so the partner can flex it in the room.

Workbook `voltline-data`: **Export** (90-row session dump: date, site, tariff, channel App / RFID / Fleet, sessions, kWh, revenue, energy cost — the grid cap binds here; a wider grid or paging is engine work for anything bigger), **Lists**, **Summary**, **Scenarios**, **Dashboard** (a table-only utilisation dashboard; no charts), **Q&A** (the buyer question log).

| § | Module | Lessons (task) | Challenge |
|---|---|---|---|
| 4.1 | Lists and tables | 4.1.1 Sort and multi-level sort · 4.1.2 AutoFilter and filtered totals (SUBTOTAL) **[engine]** · 4.1.3 Remove Duplicates and the unique site list · 4.1.4 Data validation and drop-downs **[engine]** (the scenario picker) | Turn a seeded dump into a filtered, deduplicated list |
| 4.2 | Summaries from raw rows | 4.2.1 The SUMIFS cube: site × channel · 4.2.2 COUNTIFS/AVERAGEIFS KPI block: sessions per charger per day, utilisation % · 4.2.3 SUMPRODUCT summaries with date ranges · 4.2.4 The KPI page: linked, labelled, checked | Build a seeded KPI block that ties to the export |
| 4.3 | Scenarios and sensitivity | 4.3.1 A case toggle with CHOOSE/INDEX (E9) · 4.3.2 One-way data table **[engine]** · 4.3.3 Two-way data table on tariff × utilisation · 4.3.4 Goal Seek **[engine]**: the break-even sessions per site · 4.3.5 When data tables fail: the self-referencing IF pattern | Wire a seeded three-case model with a sensitivity table |
| 4.4 | Scenario structure | 4.4.1 One model, one toggle, never copies of the file (E9) · 4.4.2 Management / base / downside blocks and the switch · 4.4.3 Presenting scenarios side by side for the buyer call | Add a downside case to a seeded model without duplicating it |
| 4.5 | Circularity | 4.5.1 Iterative calculation on knowingly; the circuit breaker; IFERROR wrap (E8) · 4.5.2 Average-balance interest as the classic circle · 4.5.3 Breaking and rebuilding a circle safely | Make a seeded circular interest calc stable with a breaker |
| 4.6 | Named ranges and structure | 4.6.1 Naming toggles and key inputs, sparingly (C9) · 4.6.2 Names in formulas; the Name Manager · 4.6.3 Navigation column and hyperlinks for a long workbook | Name and wire a seeded model's toggles |
| 4.7 | Pivot tables **[engine, large]** | 4.7.1 Build and rearrange · 4.7.2 Group dates, value settings · 4.7.3 Refresh and GETPIVOTDATA — answering the Q&A log three ways | Summarise a seeded export three ways |
| 4.P/A | Project and assessment | From the raw session export to a filtered, summarised, scenario-switched utilisation dashboard — the diligence pack; assessment 12 min | |

Change from SITE_SPEC §7: scenarios and sensitivity move ahead of pivots (bootcamps do data tables and case toggles on Day 2; pivots are a self-study topic) and pivots go last so the chapter ships even if the pivot engine slips. Power Query and Power Pivot (TTS, BIWS Module 4) stay out: engine scope.

## Chapter 5 · Financial modelling (paid) — Stage 5: the operating model

*Where we are:* bidders want a model they can run their own cases on. Management has a rollout plan (40 sites to 80 over five years) and the debt terms. This chapter is the bootcamp's Day 1–2; the capex-heavy rollout makes PP&E and the interest circularity matter.

Workbook `voltline-model`: the Voltline case pack. **Cover**, **Inputs**, **IS**, **BS**, **CF**, **Schedules** (site rollout and revenue build by segment — Public, Fleet depots, Home; energy and site costs; working capital; PP&E per site; debt; tax), **Checks**. Annual, 3 historic + 5 projected (8 periods).

| § | Module | Lessons (task) | Challenge |
|---|---|---|---|
| 5.1 | Excel best practices and efficiencies (first, as TTS/WSP do) | 5.1.1 Model architecture: inputs → calcs → outputs, sheet order, one long sheet vs tabs (C1, C6) · 5.1.2 Timeline, units, sign convention, the A/E divider (C2, C4, C5) · 5.1.3 The keystroke patterns for filling a model: anchor, Ctrl+Shift+→ Ctrl+R, Alt+= across a block, copy formats, F4 · 5.1.4 The checks sheet from day one (F1) | Set up a seeded blank model shell to standard in 3 min |
| 5.2 | Schedules | 5.2.1 Revenue build by segment: sites × chargers × utilisation × kWh × price · 5.2.2 Cost build: energy cost %, site leases, maintenance, fixed vs variable · 5.2.3 Working capital: DSO/DIO/DPO to balances · 5.2.4 PP&E: capex per new site, depreciation waterfall · 5.2.5 Debt and interest: average-balance circularity with a breaker (E8) · 5.2.6 Tax: rate, NOLs idea, payable | Build a seeded site-rollout PP&E and working-capital schedule |
| 5.3 | The three statements | 5.3.1 Income statement from the schedules · 5.3.2 Cash flow statement: indirect method, links · 5.3.3 Balance sheet: cash as the plug that is not a plug (F2); balancing · 5.3.4 Cash sweep and revolver · 5.3.5 Linking and the order of operations when it does not balance | Link a seeded set of schedules into balanced statements |
| 5.4 | Auditing a model | 5.4.1 Tie-outs and cross-foots · 5.4.2 Error flags and the checks summary · 5.4.3 Hardcode hunt at model scale, before the model goes in the data room (F3) · 5.4.4 Stress-testing inputs: zero, negative, huge | Find eight planted faults in a seeded model |
| 5.5 | Model speed | 5.5.1 Timed schedule builds: the revenue build in 3 minutes · 5.5.2 Fill and format a block in one pass · 5.5.3 Keyboard-only statement linking | The benchmark drills for the chapter |
| 5.P/A | Project and assessment | A compact three-statement operating model from the case pack; assessment: build one schedule timed, 15 min | |

Change from SITE_SPEC §7: "Model speed" is both the opening block (§5.1.3) and the closing drills (§5.5), because that is where the bootcamps put the Excel efficiency material.

## Chapter 6 · Valuation and deals (paid) — Stage 6: valuation and the buyer universe

*Where we are:* final bids are due. The partner needs to know what Voltline is worth on every method, what a sponsor could pay, and what the strategic bidder's deal does to its earnings — on one page for the board.

Workbook `voltline-valuation`: **DCF**, **WACC**, **Comps** (listed charging networks), **Precedents** (charging-network deals), **LBO** (the sponsor bid), **Merger** (the strategic bid: a fleet-depot operator buying Voltline), **Summary** (football field as a table).

| § | Module | Lessons (task) | Challenge |
|---|---|---|---|
| 6.1 | DCF | 6.1.1 Unlevered free cash flow from the operating model · 6.1.2 WACC inputs block · 6.1.3 Terminal value: perpetuity and exit multiple · 6.1.4 Discounting and the mid-year convention · 6.1.5 Sensitivity tables on WACC × g and exit multiple | Build a seeded DCF from a given FCF line |
| 6.2 | Trading comps | 6.2.1 Spreading a comp: EV build · 6.2.2 Calendarisation and LTM math · 6.2.3 Multiples, medians and means, outliers · 6.2.4 Applying a range to Voltline | Spread three seeded comps and apply the range |
| 6.3 | Precedent transactions | 6.3.1 Deal multiples and premiums · 6.3.2 Control and synergy adjustments · 6.3.3 Applying the precedents range | Spread seeded precedents |
| 6.4 | LBO — the sponsor bid | 6.4.1 Sources and uses · 6.4.2 Debt tranches and the cash sweep · 6.4.3 Returns: IRR and MOIC · 6.4.4 The returns bridge · 6.4.5 Sensitivity on entry and exit multiples: what the sponsor can pay | Build a seeded paper LBO |
| 6.5 | Merger math and the summary — the strategic bid | 6.5.1 Accretion/dilution: the fleet-depot operator buys Voltline · 6.5.2 Distribution waterfalls: what the owners receive · 6.5.3 The football-field table (no chart) and the one-page valuation summary for the board | Assemble a seeded one-page valuation summary |
| 6.P/A | Project and assessment | The one-page valuation summary from the case pack — the last page of the Project Volt pack; assessment 15 min | |

---

## What the week-long bootcamp covers that this map still would not

| Bootcamp content | In the map? | Why not / where |
|---|---|---|
| Charts: football field, sensitivity charts, waterfalls, dynamic charts (TTS Applied Excel §5, BIWS Module 5) | No | **Engine scope** (charts). Football field is taught as a table (6.5.3). Candidate paid pack later. |
| Pivot tables, Power Query, Power Pivot (WSP ch. 8, TTS, BIWS Module 4) | Pivots yes (4.7, engine work); PQ/PP no | Pivots: **engine scope**, scheduled last in Ch4 so the chapter ships without them. PQ/PP: **curriculum choice** (SITE_SPEC §7: not keyboard muscle memory on a grid) and engine scope. |
| VBA and macros, LAMBDA/LET (WSP ch. 10 + appendix, BIWS Module 6) | No | **Curriculum choice**, agreed in SITE_SPEC §7; would also be engine scope. |
| Dynamic arrays: FILTER, UNIQUE, SORT (BIWS Module 3) | No | **Engine scope** (spill ranges); SITE_SPEC names them a later paid-pack candidate. |
| Accounting refresher and financial statement analysis (TTS UG Day 1, WSP pre-work) | Only as much as the model needs (5.2–5.3) | **Curriculum choice**: hotkey.gg teaches the Excel half of the week. Say so on the Pricing page. |
| The instructor: live review of your model, firm templates, homework debrief | No | Not a product feature. Desks and captain assignments (SITE_SPEC §11) are the nearest thing. |
| PowerPoint output: the pack itself as slides | No | Out of scope; a Chapter 2 §7 lesson mentions paste-as-picture. The "pack" in Project Volt is the set of Excel pages, not a deck. |
| Python / AI-assisted assumption testing (TTS university programmes, WSP seminar segment) | No | Curriculum choice. |
| Excel on Mac | Taught for both: Excel for Mac now has KeyTips (⌥ for Alt, letters largely match Windows) | First run says so in one line; lessons whose command differs on Mac carry a one-line note. |
| Sheets larger than 100 × 26 (a monthly three-year model, a 500-row export) | No | **Engine scope** (grid size). Chapters 2 and 4 are designed to fit; Chapter 5 uses annual periods. Widening the grid is the one engine change that would let Chapter 4 use realistic exports. |

Everything else the live week does — set-up, conventions, navigation and formatting discipline, the function set, scenarios, the three-statement build, DCF, comps, LBO, merger math, model auditing — is on this map, graded on a real sheet, in the order a sale process produces it.
