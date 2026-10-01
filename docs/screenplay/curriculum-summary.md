# hotkey.gg Curriculum Summary

*The abbreviated view for Wolf's review: every chapter's framing, every module's story, every lesson's headline key, what it teaches, and its gist in one line. Generated 2026-10-01 from claude/screenplay.md and claude/script-ch1.md to script-ch6.md by gen_summary.py. Fix the shell and re-run; never edit this file by hand. The full scaffolding the build sessions code from is the screenplay plus the six chapter scripts. Totals: 174 · 37 · 21.5 (lessons · challenges · hours). Everything is DRAFT.*

**How to read a row.** Key is the headline key the brief ends on. Teaches is every key, command and function the lesson's text names (pulled from the brief and goals; a name in the list may be a reuse from an earlier lesson, and the shells cite the first lesson in brackets). Gist is the lesson's done-screen line: what the learner has when it ends. A challenge has goals only, so its gist is what it grades.

## The curriculum in one view

**The platform, in one sentence.** A real sheet and Ribbon in the browser, where you learn Excel by doing one job at a time on one company's file, are graded on how the sheet ends up, and then get fast at it through drills, the Daily, rapid-fire and quests.

**The case, in one arc.** Clearcoat Express, forty express car washes in Texas, is being sold to private equity, and you work on its finance team. Chapter 1 gets the company's own weekly numbers clean enough to stand behind (the CFO). Chapter 2 turns three years of P&L into the financials section of the book that describes the company to buyers. Chapter 3 proves the numbers site by site against the point-of-sale export (the buyers' first-round diligence). Chapter 4 answers the buyers' questions from the data room and builds the management case with its sensitivities. Chapter 5 builds the operating model and values the cash flows. Chapter 6 values the company every way, prices the three bids, and puts one page in front of the board, with your own options on the last line. Six stages, six pages in the data room, one file that grows.

**What a learner can do at the end, by chapter.** After 1: move, select, enter, format, link and check a page by keyboard, and read a workbook's colors. After 2: take any raw financial export to presentation quality and print it as a pack. After 3: build a databook from row-level data with logic, dates, conditional sums and text functions, value a loan and a project, and audit someone else's sheet. After 4: read any dataset with lookups, lists and pivots, and run cases and sensitivities on a model. After 5: build and audit a three-statement model with schedules, and value it with a DCF. After 6: spread comps and precedents, rebuild a sponsor's LBO, price bids with structure, run a waterfall, and put a valuation on one page.

| Chapter | The product | Workbook | Finance rung | Excel buckets | Lessons · challenges · hours |
| :- | :- | :- | :- | :- | :- |
| 1 Foundations (free) | The weekly KPI report: one page, live, formatted, checked, print-ready | Raw · Inputs · Costs · Report | washes × ticket − cost per wash; totals; a checks row | the screen · move · select · enter and edit · copy and fill · structure · basic formats · formulas by pointing · anchors · links · errors · print · audit | 30 · 7 · 3.5 |
| 2 Formatting (Pro) | The historical financials section of the book: a three-year P&L, its monthly block and a one-page summary, presentation quality | P&L · Inputs · Monthly · Print | revenue lines, cost of a wash, site costs, contribution, head office, EBITDA; margins and growth; actual vs estimate; fiscal years | number formats · custom formats · the page's anatomy · alignment and outline · conditional formatting · text and dates for presentation · print | 30 · 7 · 3 |
| 3 Formulas (Pro) | The KPI databook: every number reconciled to the point-of-sale export | Sites · Packages · Members · Transactions · Summary · Loans | one row per wash; package prices; member tenure; the reconciliation; the site-build loan; NPV and IRR of a site | logic · dates · math and aggregation · text · time value of money · auditing | 27 · 6 · 3 |
| 4 Data and Lookups (Pro) | The diligence pack: the buyers' questions answered, the utilization dashboard, the management case with sensitivities | Export · Lists · Q&A · Summary · Scenarios · Dashboard | utilization (washes per hour against tunnel capacity), member share, break-even, three cases | lookups (incl. multi-criteria) · lists and tables (incl. filter tricks) · summaries from raw rows and 3D references · pivots · scenarios and sensitivity (incl. the sticky IF) · names and structure | 32 (31 without dynamic arrays) · 6 · 4 |
| 5 Finance and Accounting (Pro) | The operating model: three statements, schedules, checks, and the DCF page | Cover · Inputs · IS · CF · BS · Schedules · Checks · DCF | the statements through one site; accrual vs cash; the revenue build; capex and depreciation; working capital; debt; free cash flow, WACC, terminal value | the three statements and the five links between them · model setup, incl. the drivers block and populating from a data tab · schedules · linking · auditing a model, with the checks catalog · DCF · model speed | 37 · 7 · 5 |
| 6 Valuation (Pro) | The valuation summary for the board: comps, precedents, the sponsor's LBO, the waterfall, one page | Comps · Precedents · LBO · Bids · Summary | EV/EBITDA and EV per site; IRR and MOIC; from enterprise value to the owners' proceeds, down to the learner's options | trading comps · precedents · LBO · the bids and the waterfall | 18 · 4 · 3 |

Sections 5 of the screenplay carry the rest of the plan: the skills bucketed, the checks thread, the tips and tricks placed, the desk audit, evaluation. Section 4.10 parks the finance left out as add-ons. Section 6 is the practice layer (drills, the Daily, rapid-fire, quests, achievements, XP); the drill sketches for the code layer are in claude/script-drills.md, indexed in 6.2b. Section 9.3 is the build list (M1–M108).

## Chapter 1 · Foundations (free): 30 lessons · 7 challenges · 3.5 hours

**Where the deal is.** The company's own weekly numbers. Five site managers, five spreadsheets, one workbook that ops pasted them into; the CFO wants one clean page out of it by Monday afternoon, every week, and the project (a sale of the company to private equity) is a rumor on the finance team.

**The product.** The weekly KPI report: one page, live, formatted, checked, print-ready, built on Raw · Inputs · Costs · Report. The finance rung is the first one: washes × ticket − cost per wash, totals, and a checks row.

**The workbook.** **Raw**: the managers' feed, pasted; **Inputs**: the cost of a wash and the week; **Costs**: site costs; **Report**: the one page the CFO reads.

### 1.1 Open and set up

**Story card.** *The weekly reports are in. As usual, they're a mess.* Five site managers, five spreadsheets, one workbook that ops pasted them into. There's a tab still called Sheet2, last week's export sitting next to this week's, and a cost typed straight into a formula. The CFO wants one clean page out of this by Monday afternoon, so before you touch a number, get the file in order: name the tabs, delete the stale data, and give the report its own sheet.

**Objective.** Get the file in order: move around it by keyboard, name the tabs, delete the stale data, give the report its own sheet, set Excel up, color-code every sheet.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 1.1.1 The workbook the managers sent | `Ctrl+↓` | Ctrl+↓, Ctrl+↑, Ctrl+Home, Ctrl+→, Ctrl+←, Ctrl+Shift+↓, Ctrl+Shift+→, Ctrl+PgDn, Ctrl+PgUp, Alt H O R, Alt H D S, Shift+F11, Alt H O M, Move or Copy, Name Box | Five presses or one. Ctrl and an arrow gets you there. |
| 1.1.2 Know the screen | `Ctrl+Shift+U` | Ctrl+Shift+U, Ctrl+F1, Alt W Q, Alt W J, Ctrl+PgDn, Ctrl+PgUp, Alt+PgDn, Alt+PgUp, Name Box | Six parts to the screen, and you've now used every one of them. |
| 1.1.3 The Ribbon by keyboard | `Alt` | Alt, F2, F4, F9, Esc, Alt W V G, Ctrl+1, Alt H O E, Page Layout | Alt, then the letters. Every command in Excel is reachable without the mouse. |
| 1.1.4 Set Excel up like an analyst | `Alt F T` | Ctrl+S, Ctrl+Z, Ctrl+Y, Alt F T, F9, Quick Access Toolbar | Your settings are set, and formatting is Alt and a number from here on. |
| 1.1.5 Color-code the workbook | `Alt H F C` | Alt H F C, Shift+↓, F2, Esc, Ctrl+1, Name Box | Blue is typed, black is calculated, green comes from another sheet. Anyone can read your workbook now. |
| 1.1.C Challenge: another location's file | — | F2 | Challenge, goals only (5 goals): all of 1.1 under the clock. |

### 1.2 Move and select

**Story card.** *The CFO has questions about the weekly numbers.* How many days came through? Which columns did the managers send? Is every wash cost in? What's written under the data? Every answer is a cell. Get to each one without scrolling (nobody who does this for a living scrolls), and then select the blocks you'll be formatting next week.

**Objective.** Move and select by keyboard: Ctrl+Arrow and where it stops, Ctrl+End and Home, the selection set, rows, columns, widths and alignment, Go To Special.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 1.2.1 Jump, don't scroll | `Ctrl+↓` | Ctrl+End, Ctrl+Home, Ctrl+PgDn, Ctrl+PgUp, Ctrl+↓, Ctrl+→, PgUp, PgDn, Ctrl+G, Go To, Name Box | Five questions answered, and you never scrolled once. |
| 1.2.2 Select like you mean it | `Ctrl+Shift+↓` | Ctrl+S, Shift+Space, Ctrl+Space, Ctrl+A, Ctrl+PgDn, Ctrl+Shift+↓, Ctrl+Home, Ctrl+Shift+End, Name Box | A table of any size, selected in two presses. |
| 1.2.3 Rows, columns and cells | `Ctrl+Shift+=` | Shift+Space, Ctrl+Space, Alt H A, F4, Alt H O I, Alt H O W, Alt H O H, Alt H O A, Ctrl+Shift+=, Alt H I R, Alt H I C, Alt H D C, Alt H D R, Ctrl+Z, Alt H W, AutoFit | You made room and made everything fit, and F4 did half the work. |
| 1.2.4 What's typed and what's calculated | `Alt H F D S` | Ctrl+PgDn, Ctrl+Shift+→, Ctrl+Shift+↓, Alt H F D S, Go To Special | Fifteen typed cells turned blue in one stroke. |
| 1.2.C Challenge: find and mark | — | Go To Special | Challenge, goals only (5 goals): all of 1.2 under the clock. |

### 1.3 Enter, edit, copy and fill

**Story card.** *A day is missing, and some of the figures are wrong.* Airport's Saturday never came through, so the manager emailed the four numbers over. Type them in, fix the typos where they sit, then start the Report page by pulling the headers, the site list and the week label across from Raw and Inputs with the clipboard and the fill keys, so nothing gets typed twice.

**Objective.** Enter, edit, copy and fill: the missing day, the typos, the Report skeleton, Paste Special, Find and Replace, a timeline.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 1.3.1 Enter the missing day | `Tab` | Tab, Ctrl+Enter, Esc, Alt+Enter, Ctrl+PgDn, Ctrl+↓, Ctrl+Home, Ctrl+A, Alt H F D S, Alt H E A, Alt H E F, Go To Special | Four figures went in as one Tab run, and the total moved the moment the last one landed. |
| 1.3.2 Fix it in place | `F2` | F2, Esc, Ctrl+Z, Ctrl+Y, F4, Ctrl+←, Ctrl+→, Ctrl+F, Alt H H N, Ctrl+Enter | Four fixes without retyping a cell, and the totals answered on their own. |
| 1.3.3 Copy, cut, paste, fill | `Ctrl+C` | Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+D, Ctrl+R, Esc | The Report has its shape, and nothing on it was typed twice. |
| 1.3.4 Paste Special: values, formats, math | `Ctrl+Alt+V` | Ctrl+Alt+V, Alt E S V, F4, Paste Special, Go To Special, SUM | You copied the numbers, not the links, and flipped a whole block's sign without writing a formula. |
| 1.3.5 Names, notes and the small keys | `Ctrl+H` | Shift+F2, Ctrl+;, Ctrl+Backspace, Ctrl+H, Ctrl+Z, Alt M M D, Ctrl+G, Ctrl+Home, Esc, Ctrl+Shift+;, PgDn, Alt H F I S, Go To, Fill Series, Define Name, Name Box, Replace All | Twelve stale labels went in two presses, the cost per wash has a name and a source, and the week wrote itself. |
| 1.3.C Challenge: complete the feed | — | Replace All | Challenge, goals only (8 goals): all of 1.3 under the clock. |

### 1.4 Structure

**Story card.** *Cedar Park opened this week.* That means a sixth site row for the Report, a margin column the CFO asked for and a stale column to get rid of, with a total that has to keep up with every edit. Then make the page readable: give the columns equal widths, fit the headers, tuck the working columns away and freeze the heads so they never scroll off.

**Objective.** Structure with formulas in play: rows and columns that keep the totals honest; the page's columns; hide, group, freeze.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 1.4.1 Rows and columns that keep the totals honest | `Ctrl+Shift+=` | Ctrl+Z, Shift+Space, Ctrl+Shift+=, Ctrl+D, Ctrl+Space, Alt H D C, Ctrl+], SUM | The total followed every edit (a new site, a new column, a deleted one) without a formula retyped. |
| 1.4.2 The page's columns | `Alt H O W` | Ctrl+Space, Shift+→, Alt H O W, F4, Alt H O I, Alt H W, Alt H O A, Alt H O H, Ctrl+Z, AutoFit | The days share one width, the labels fit and the headers wrap. It reads like a page now. |
| 1.4.3 Hide, group, freeze | `Alt+Shift+→` | Ctrl+Shift+0, Alt H O U L, Ctrl+0, Ctrl+9, Ctrl+S, Ctrl+Shift+9, Alt H O U O, Alt+Shift+→, Alt+Shift+←, Alt A G G, Alt A H, Alt A J, Ctrl+8, Alt W F F, Freeze Panes, Group | The workings are grouped, not hidden, and the heads stay put when the page scrolls. |
| 1.4.C Challenge: reshape the report | — | — | Challenge, goals only (6 goals): all of 1.4 under the clock. |

### 1.5 Format

**Story card.** *The numbers are right, so now make them readable.* The numbers are right, and your job still isn't finished. The CFO answered from an iPhone, and the whole email was three words: pls fix, thx. You can have every number right and it counts for nothing if nobody can read the page, so set the thousands separators, line up the decimals, put the negatives in parentheses, bold the totals with a line on top and center the title across the page. Do each by hand once, then do the whole page in a single pass.

**Objective.** Numbers a banker can read; fonts, fills, borders; alignment and titles; the style pass with F4.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 1.5.1 Numbers a banker can read | `Ctrl+1` | Ctrl+1, Ctrl+Shift+1, Alt H 9, F4, Alt H 0, Ctrl+Shift+↑, Shift+↓, Ctrl+Shift+4, Ctrl+Shift+5, Paste Special | Every figure has its commas, its decimals and its $ where they belong, and one format runs down each line. |
| 1.5.2 Fonts, fills, borders | `Alt H B` | Alt H B, Ctrl+B, Ctrl+I, Ctrl+U, Alt H F G, Alt H F K, Shift+Space, Ctrl+↓, Alt H B P, Alt H H, SUM | Bold where it matters and a line over the total. The eye knows where to go now. |
| 1.5.3 Alignment and titles | `Ctrl+1` | Ctrl+Shift+→, Alt H M U, Ctrl+1, Alt H M C, Ctrl+PgDn, Esc, Ctrl+PgUp, Ctrl+Tab, Alt H A R, Ctrl+I, Alt H 6, Alt H 5, Alt H W, Center Across Selection, SUM | The title is centered across the page, and not one cell was merged to do it. |
| 1.5.4 The style pass | `F4` | F4, Ctrl+A, Alt H B N, Ctrl+B, Alt H O W, Paste Special | One paste dressed a table. One command and two F4s cleared three grids. |
| 1.5.C Challenge: the desk's format in three minutes | — | Ctrl+1, Center Across Selection | Challenge, goals only (6 goals): all of 1.5 under the clock. |

### 1.6 Formulas

**Story card.** *Now make the page live.* Right now the Report is typed numbers, so if the feed changes you'd be retyping all of it. Link every figure back to Raw and Inputs and a fix upstream flows through on its own. This is the module where the page stops being a copy of the numbers and starts being a model of them.

**Objective.** SUM and its family, relative and absolute references, links across sheets, the errors and what they mean.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 1.6.1 Point, don't type | `=` | F2, Ctrl+←, Esc, Ctrl+D, Ctrl+Alt+V, Paste Special | Three formulas built by pointing and filled down six sites in one press. |
| 1.6.2 SUM family and AutoSum | `Alt+=` | Alt+=, Ctrl+Shift+↓, Ctrl+Shift+1, Alt H 9, Ctrl+Z, AutoSum, AVERAGE, COUNT, COUNTA, MAX, MIN, SUM | Every column's total in one press, and a week summary that reads the sites. |
| 1.6.3 Anchors: $ and F4 | `F4` | F4, Ctrl+X, Ctrl+B, Alt H F C, Ctrl+Shift+4, Ctrl+R, Ctrl+Shift+1, Alt H 9, Shift+→, F2, Ctrl+D, Shift+↓, Esc | One formula covered eighteen cells, filled both ways, because two anchors held. |
| 1.6.4 Link across sheets | `Ctrl+PgDn` | Ctrl+[, Alt+PgDn, Alt+PgUp, Ctrl+PgDn, Ctrl+Enter, F5, F2, F4, Alt H F C, Ctrl+] | Every site figure is a link now. The next feed flows straight onto the page. |
| 1.6.5 One formula per row, filled right | `Ctrl+R` | Ctrl+`, F2, Ctrl+Enter, Ctrl+R, F4, Alt H F C | One formula filled right covered six days, and Ctrl+` found the typed number in one press. |
| 1.6.6 Read the error, follow the trail | `Ctrl+[` | Ctrl+[, F2, Ctrl+D, Ctrl+Enter, Ctrl+], F5, Paste Special, SUM, VALUE | Five error codes read and fixed at the source, and nothing pasted over. |
| 1.6.C Challenge: the site P&L | — | Ctrl+Enter, F4, Alt+=, SUM | Challenge, goals only (6 goals): all of 1.6 under the clock. |

### 1.7 Present and audit

**Story card.** *Sign it off.* The CFO signs this page off and it goes into the data room as the company's current trading, the first thing a buyer's analyst opens. Check that the totals tie, that the conventions hold, that it prints on one page, and that nothing's typed where a link belongs. Then it goes in the pack.

**Objective.** The KPI page checked, print-ready and signed off: page one of the pack.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 1.7.1 Fit to one page | `Alt P S P` | Ctrl+F2, Ctrl+Home, Alt F I, Ctrl+End, Alt H E A, Alt P O L, Alt P S P, Alt P I, Esc, Page Layout | It prints on one landscape page, with the heads on every sheet and the file and date in the footer. |
| 1.7.2 The checks row | `=` | Ctrl+[, Ctrl+1, F5, Ctrl+Z, AND, IF, SUM | Three live differences read zero, so the page now proves itself. |
| 1.7.3 Hardcode hunt | `Ctrl+Backtick` | Ctrl+Backtick, Alt H E M, Alt H F D S O E, F4, Ctrl+`, F2, Ctrl+Enter, Ctrl+1, Ctrl+I, Alt H B N, Alt W V G, Go To Special, Center Across Selection | Eight faults found in two minutes, the way a reviewer finds them. |
| 1.7.C Challenge: audit before you send | — | Ctrl+Enter, F2, Ctrl+`, Go To Special | Challenge, goals only (6 goals): all of 1.7 under the clock. |

### 1.8 Project and assessment

**Story card.** *The CFO's next feed just landed.* New week, new feed, and nothing left to learn. You know every move this page needs. Time to execute: build it start to finish, then build it again on the clock. If you already knew all of this, the assessment is the test-out: pass it and the chapter is yours.

**Objective.** Build the weekly report end to end, then prove it against the clock; the assessment is the test-out.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 1.8.P Project: the weekly KPI report | `Ctrl+PgDn` | Ctrl+PgDn, Ctrl+D, Alt+=, F4, Shift+Space, Ctrl+B, Alt H B P, Ctrl+Enter, Go To Special, AutoFit | You took a raw feed to a signed-off page in one sitting, and that is Chapter 1. |
| 1.8.A Assessment: Monday morning | `Ctrl+PgDn` | Ctrl+PgDn, F4, Ctrl+Enter, AutoSum, AutoFit, Replace All, AND, IF, SUM | You built page one of the pack from a blank sheet on the clock, and the chapter is Verified. |

## Chapter 2 · Formatting (Pro): 30 lessons · 7 challenges · 3 hours

**Where the deal is.** The owners have hired advisers to run the sale, and the first document is the book: the information memorandum that describes the company to buyers. Its financials section is the company's to produce: three years of P&L, out of the accounting system and onto pages a buyer can read. The CFO asks for it; you build it.

**The product.** Three pages in the data room: the historical P&L (FY24A, FY25A, FY26E) at presentation quality, the FY26 monthly block, and a one-page summary linked from both. Every figure formatted, every line labeled, sources under the table, printing as one clean pack.

**What the learner can say afterwards.** How a car wash's P&L is built: retail and membership revenue; the cost of a wash (chemicals and water); the site costs (crew, rent, utilities, maintenance, card fees, marketing); site contribution; head office; EBITDA, and why it's the number a buyer prices from. What a margin is, what growth is, what FY26E means, and why a page states its sign convention once.

**The workbook.** Four sheets. The figures are in thousands of dollars and kept easy (Wolf); the build session fixes the exact values and the graders' expected states.

### 2.1 Number formats

**Story card.** *The P&L came out of the accounting system.* The owners have hired advisers to run the sale, and the first document is the book: the information memorandum that describes the company to buyers. Its financials section starts with three years of P&L, and what the accounting system exported is account codes in capitals, costs as positives and numbers to four decimal places. Before anyone reads it, the figures have to read like figures.

**Objective.** Number formats on a P&L: the desk number format and decimals by line, the sign convention stated once, currency and percent lines, real dates on the timeline.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 2.1.1 Built-in formats on a P&L | `Ctrl+1` | Ctrl+1, F4, Ctrl+Shift+1, Ctrl+↓, Alt H 9 | Every line on the P&L now reads as figures, one format per line. |
| 2.1.2 Sign convention: costs negative, stated once | `Ctrl+Alt+V` | Ctrl+Alt+V, F2, Ctrl+R, Ctrl+1, Paste Special | Costs read in parentheses, the page says so once, and the totals add straight down. |
| 2.1.3 Currency and percent lines | `Ctrl+Shift+5` | Ctrl+Shift+5, Ctrl+R, RRI | The page now says what a buyer asks first: how much, and what share of revenue. |
| 2.1.4 Dates on the timeline | `Ctrl+1` | Ctrl+Shift+~, Ctrl+Z, Ctrl+1, Shift+Space, Ctrl+B | The timeline is real dates now, and the page can roll forward a year in one edit. |
| 2.1.C Challenge: a raw P&L's numbers to standard | — | Paste Special | Challenge, goals only: all of 2.1 under the clock. |

### 2.2 Custom number formats

**Story card.** *Every number on the page has to say what it is.* A buyer flips to the financials and reads margins, multiples and thousands without a legend, so the number format has to carry the unit. A format code can write k or m after a figure, show a zero as a dash, color a negative and turn a plain date into FY26E, with the value underneath untouched. This module is the format code, one section at a time.

**Objective.** Custom number formats: the four-section code, units in the format, custom date codes for the timeline, conditions and hidden zeros.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 2.2.1 The four-section format | `Ctrl+1` | Ctrl+1, F4, F2, Esc, Ctrl+Z | One code with four sections, and the page decides how every kind of value reads. |
| 2.2.2 Units in the format: k, m, x, bps | `Ctrl+1` | Ctrl+1 | The unit rides in the format, so the number stays a number. |
| 2.2.3 Custom date codes on the timeline | `Ctrl+1` | Ctrl+1, Ctrl+Z, Fill Series | The headers read FY24A to FY26E, and every one of them is still a date underneath. |
| 2.2.4 Conditional codes and hidden zeros | `Ctrl+1` | Ctrl+1, Ctrl+Z | A format can color, scale and hide, and the value never moves. |
| 2.2.C Challenge: the number-format set | — | — | Challenge, goals only: all of 2.2 under the clock. |

### 2.3 The page a buyer reads

**Story card.** *The first page a buyer turns to.* The book, the information memorandum, is the document that describes the company to buyers, and its financials page is the one they turn to first. A page like that has an anatomy: a title that says what it is, a units line, a timeline, sections that add down to the answer, and a source under the table. Build it on the P&L the way the book will print it.

**Objective.** The anatomy of a financial page: title, units, timeline, sections and the answer; the actuals-to-estimates divider; borders that mean something; labels, footnotes and sources; widths and the label column; styles and Format Painter at scale.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 2.3.1 Title, units, timeline, sections, answer | `Ctrl+B` | Ctrl+B, Alt H 6, Center Across Selection | The page reads in the order a buyer reads it, and it lands on EBITDA. |
| 2.3.2 Actuals vs estimates: the divider | `Ctrl+1` | Ctrl+1 | One vertical line and one shade tell a reader what happened and what's forecast. |
| 2.3.3 Borders that mean something | `Alt H B` | Alt H B, Alt H B P, F4, Ctrl+1, Alt H B N, Alt W V G | Every line on the page means something, and there are no lines that don't. |
| 2.3.4 Labels, footnotes and sources | `F2` | F2 | The labels read like English, and the page says where its numbers came from. |
| 2.3.5 Widths and the label column | `Alt H O W` | Alt H O W, AutoFit | The margin, the label fit and three equal columns give the page the shape every financial page has. |
| 2.3.6 Cell styles and Format Painter at scale | `Alt H F P` | Alt H F P, Alt H J N, Paste Special, Format Painter, Cell Styles | One page formatted became the template for the next. |
| 2.3.C Challenge: a three-year P&L to presentation quality | — | — | Challenge, goals only: all of 2.3 under the clock. |

### 2.4 Alignment and structure

**Story card.** *Forty lines is too many to read.* By the time the site costs are broken out by line and the memo block is in, the P&L runs to forty rows, and a buyer wants the six that matter with the rest on demand. Outline levels fold the detail behind a button; indents show what belongs to what; a navigation column jumps a long sheet. The page stays complete and reads short.

**Objective.** Alignment and outline at scale: wrap, indent and Center Across Selection on a long page; grouping and outline levels; hiding against grouping against a separate sheet; a navigation column.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 2.4.1 Wrap, indent, Center Across Selection at scale | `Alt H 6` | Alt H 6, Alt H A R | Three levels of lines and fourteen columns got aligned in six moves. |
| 2.4.2 Grouping and outline levels | `Alt+Shift+→` | Alt+Shift+→, Go To, Group | The page reads short and stays complete, and a button decides which. |
| 2.4.3 Hiding vs grouping vs a separate sheet | `Alt H O U` | Alt H O U, Alt H O U O, Group | Nothing is hidden, the detail is grouped and the other page has its own sheet. |
| 2.4.4 A navigation column for a long sheet | `Ctrl+K` | Ctrl+G, Ctrl+K, Ctrl+Home, Define Name | Three links at the top make a sixty-row sheet read like a short one. |
| 2.4.C Challenge: a flat P&L into a grouped, navigable one | — | — | Challenge, goals only: all of 2.4 under the clock. |

### 2.5 Conditional formatting

**Story card.** *Make the page flag its own mistakes.* The book will be read by people looking for a reason to pay less, so the page has to catch its own errors before they do. A conditional format is a rule the cell applies to itself: a check that isn't zero turns red, a negative margin highlights, an exception stands out. Used well it's a second pair of eyes, and used badly it's wallpaper, so this module is about learning the difference.

**Objective.** Conditional formatting: highlight rules for negatives and exceptions; formula-driven rules; data bars and scales, and when not to use them; managing the rules.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 2.5.1 Highlight rules: negatives, exceptions | `Alt H L` | Alt H L, Alt H L T, Alt H L R, Esc, Ctrl+Z, Manage Rules | With three rules in, the page points at its own soft spots. |
| 2.5.2 Formula-driven rules: a check that isn't zero turns red | `Alt H L N` | Alt H L N, Ctrl+Z, Manage Rules | The check turns red before anyone else sees it. |
| 2.5.3 Data bars and scales, and when not to | `Alt H L D` | Alt H L D | Bars stay on the working sheet; the page gets figures. |
| 2.5.4 Managing rules | `Alt H L R` | Alt H L R, Manage Rules | Two rules remain, both named and both where you'd look for them. |
| 2.5.C Challenge: the checks flags on a model | — | — | Challenge, goals only: all of 2.5 under the clock. |

### 2.6 Dates and text for presentation

**Story card.** *The headers should write themselves.* Every quarter the page rolls forward a year, and every time someone retypes the title, the headers and the units line. And one of them is wrong. A title that reads the company name from Inputs, headers that read the dates under them, a units line that reads the currency: change one cell and the whole page updates. The Monthly sheet, with its text dates and capitalized labels, is where to learn it.

**Objective.** Text and date functions for presentation: TEXT for labels and headers; EOMONTH and EDATE for period ends; dynamic titles with &; cleaning imported labels with TRIM, PROPER and SUBSTITUTE; a units and period line that writes itself.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 2.6.1 TEXT for labels and headers | `=` | Ctrl+Z, TEXT | The header reads the date under it, so they can never disagree. |
| 2.6.2 EOMONTH and EDATE for period ends | `=` | EDATE, EOMONTH | One typed date drives every header on two sheets. |
| 2.6.3 Dynamic titles with & | `&` | &, F2, Esc, Ctrl+Z, TEXT | Three titles read one source, so a name change is one edit. |
| 2.6.4 Cleaning imported labels: TRIM, PROPER, SUBSTITUTE | `=` | Paste Special, LOWER, PROPER, SUBSTITUTE, TRIM | One formula and one paste cleaned forty labels. |
| 2.6.5 A units and period line that writes itself | `&` | &, Ctrl+Z, TEXT | The header block reads Inputs, and the page can't disagree with itself. |
| 2.6.C Challenge: the dynamic header block | — | EOMONTH, PROPER, SUBSTITUTE, TEXT, TRIM | Challenge, goals only: all of 2.6 under the clock. |

### 2.7 Printing and page layout

**Story card.** *The book goes to print.* The financials section is three pages, and the book is a PDF that gets printed, so each page has to land on one sheet, carry its title rows, say which file and which page it is, and break where a reader would break. The one-page summary reads from the detail behind it. Set the pack up to print and it's ready for the data room.

**Objective.** Printing at pack scale: print areas, titles, fit to width, headers and footers; print preview and page breaks; the one-page summary linked from the detail.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 2.7.1 Print areas, titles, fit to width, headers and footers | `Alt P S P` | Alt P S P, Alt P R S, Ctrl+F2, Group | Three sheets share one footer, so every page knows which file it came from. |
| 2.7.2 Print preview and page breaks | `Alt W I` | Alt W I, Alt P B I, Alt P B R, Alt W L, Ctrl+F2, Esc, Page Break Preview | The page breaks where a reader would turn it. |
| 2.7.3 The one-page summary linked from the detail | `Ctrl+PgDn` | Ctrl+PgDn, Ctrl+Enter | Every one of the six lines is a link, so the summary can't disagree with the detail. |
| 2.7.C Challenge: a three-sheet model prints as a clean pack | — | — | Challenge, goals only: all of 2.7 under the clock. |

### 2.8 Project and assessment

**Story card.** *The financials section, start to finish.* A fresh export has landed: the same accounting system, the same faults, a different three years. Everything the chapter taught goes onto one workbook, until three pages are ready for the data room. Build it, then build it again on the clock, because the assessment is the test-out.

**Objective.** The historical financials section built end to end from a raw export; the assessment is the test-out.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 2.P Project: the historical financials section | — | EOMONTH | Formats by line · signs flipped and stated · margins and growth block · real dates with FY codes · the four-section format set · title, sections, indents, borders, divider · labels, footnote, source · margin column, label fit, equal widths · detail grouped… |
| 2.A Assessment: the section on fresh figures | — | — | The same section on a different company's three years (a sister operator in the same case world, so the lines are familiar and the figures aren't), sized by start state and end state: raw export in, three presentation-quality pages out. Pass is Verified;… |

## Chapter 3 · Formulas (Pro): 27 lessons · 6 challenges · 3 hours

**Where the deal is.** First-round diligence. The buyers who read the book want the business site by site, and they'll only trust numbers that tie to the system that recorded them. The point-of-sale system in every tunnel logs each wash as a row, and that export is the clean truth. The trouble is that it doesn't agree with what the site managers sent in Chapter 1, and somebody's half-built Summary sheet doesn't tie to either. Reconciling them is the databook.

**The product.** The KPI databook: every wash rolled up to a site × package summary, member and retail revenue separated, member tenure and churn, a reconciliation of the POS to the managers' numbers with the check at zero, and a valued new-site case on the Cedar Park loan. Every number a formula that reads the export.

**What the learner can say afterwards.** Why a row-level export is the only number a buyer trusts; what a member wash is worth; how a monthly fee turns into revenue; what a blended ticket is; how a loan payment splits into interest and principal; what NPV and IRR say about a new site; how a reconciliation is built and read.

**The workbook.** Six sheets. Figures are illustrative and easy (Wolf); the build session sets exact values and grader states.

### 3.1 Logic

**Story card.** *Which sites are pulling their weight?* The buyers' first question is the CFO's oldest one: which sites clear their daily target, which don't, and what the managers earn when they do. The point-of-sale export has every wash; the Sites sheet has every target. A formula that can ask a question and act on the answer turns ninety rows into a page of flags.

**Objective.** Logic: IF on a threshold; nested IF against IFS against MIN and MAX; AND, OR and NOT for compound flags; IFERROR and the override pattern.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 3.1.1 IF on a threshold | `IF` | Ctrl+D, IF, SUM | You asked one question six times, and the page says which sites cleared the bar. |
| 3.1.2 Nested IF, IFS, and MIN and MAX instead | `IFS` | F2, IF, IFS, MAX, MIN | You wrote the same test three ways, and only the one a reviewer can read survived. |
| 3.1.3 AND, OR and NOT | `AND` | F2, AND, IF, NOT, OR | Each two-part question is answered in one cell, and you can read every answer before it's wrapped. |
| 3.1.4 IFERROR and the override pattern | `IFERROR` | IF, IFERROR, ISNUMBER, ISTEXT, VALUE | The errors you expect are caught, and the overrides you can't stop are in the open. |
| 3.1.C Challenge: the flags block | — | AND, IF, IFERROR, IFS, ISNUMBER, OR | Challenge, goals only: all of 3.1 under the clock. |

### 3.2 Dates

**Story card.** *How old is each site, and how long do members stay?* Two of the buyers' questions are about time: how old each site is, because new ones ramp for two years, and how long a member stays before cancelling, because that's what a $30-a-month fee is worth. Excel keeps a date as a number (days since the start of 1900), so dates subtract, add and compare like any figure once you know the functions that build and break them.

**Objective.** Dates: serial numbers and DATE, YEAR, MONTH, DAY; member tenure from join and cancel dates; period keys for grouping; YEARFRAC and fiscal periods; NETWORKDAYS and WEEKDAY for the trading calendar.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 3.2.1 Serial numbers: DATE, YEAR, MONTH, DAY | `DATE` | Ctrl+Shift+~, Ctrl+Z, DATE, DAY, MONTH, YEAR | A date is a number, so age is a subtraction. |
| 3.2.2 Member tenure from join and cancel dates | `IF` | AND, COUNTIFS, DATE, IF, SUM | Every member has a tenure now, and the page knows who left in September. |
| 3.2.3 Period keys: a month and a quarter from every date | `TEXT` | F2, Esc, EOMONTH, MOD, MONTH, ROUNDUP, TEXT, WEEKDAY, YEAR | Every row knows its month, its quarter and its week, and the grouping can begin. |
| 3.2.4 YEARFRAC and fiscal periods | `YEARFRAC` | DATE, IF, MONTH, RIGHT, YEAR, YEARFRAC | Any date can be restated into anyone's fiscal year, in two cells. |
| 3.2.5 NETWORKDAYS and WEEKDAY: the trading calendar | `NETWORKDAYS` | IF, NETWORKDAYS, TEXT, WEEKDAY | The calendar is a formula now, holidays included. |
| 3.2.C Challenge: a fiscal-quarter timeline and an age table | — | YEARFRAC | Challenge, goals only: all of 3.2 under the clock. |

### 3.3 Math and aggregation

**Story card.** *Ninety rows into one page.* The buyers want washes and revenue by site and by package, the busiest sites, the blended ticket, and the question that decides whether they believe anything: whether the POS export agrees with what the managers sent. Every one of those is a count or a sum with a condition on it. Build them, then build the reconciliation and drive its check to zero.

**Objective.** Aggregation with conditions: the ROUND family on tickets; COUNTIF and COUNTIFS; SUMIF, SUMIFS and AVERAGEIFS; MAXIFS, MINIFS, LARGE, SMALL and RANK; SUMPRODUCT; the reconciliation.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 3.3.1 ROUND, ROUNDUP, ROUNDDOWN, ABS, CEILING, FLOOR | `ROUND` | F2, ABS, CEILING, FLOOR, ROUND, ROUNDDOWN, ROUNDUP | A format hides decimals; ROUND removes them, and the total knows the difference. |
| 3.3.2 COUNTIF and COUNTIFS | `COUNTIFS` | AutoSum, COUNT, COUNTA, COUNTIF, COUNTIFS | Ninety rows counted six ways, and every block agrees with the others. |
| 3.3.3 SUMIF, SUMIFS and AVERAGEIFS | `SUMIFS` | AVERAGEIFS, COUNTIFS, SUMIF, SUMIFS | The page now says how much, by site and by package, and what a member wash is worth. |
| 3.3.4 MAXIFS, MINIFS, LARGE, SMALL and RANK | `LARGE` | LARGE, MAXIFS, MINIFS, RANK, SMALL | A league table with nothing sorted, so every link still points where it should. |
| 3.3.5 SUMPRODUCT: the blended ticket | `SUMPRODUCT` | SUM, SUMIF, SUMIFS, SUMPRODUCT | SUMPRODUCT summed washes times prices in one call, and the blended ticket is the number a buyer prices from. |
| 3.3.6 The reconciliation: POS against the managers' numbers | `=` | COUNTIFS | Two counts of the same thing agree now, every difference is explained, and the check reads zero. |
| 3.3.C Challenge: the export rolled up to a site × package summary | — | AVERAGEIFS, COUNTIFS, RANK, SUMIFS, SUMPRODUCT | Challenge, goals only: all of 3.3 under the clock. |

### 3.4 Text

**Story card.** *The codes have to become words.* The POS writes AUS-DOM where a buyer wants Austin and Domain in their own columns, it packs the package and channel into one memo, and when the terminal hiccups it sends amounts as text. Text functions take a string apart and put it back together, Text to Columns does the same for a whole column at once, and nothing gets retyped.

**Objective.** Text: LEN, LEFT, RIGHT and MID to split codes; FIND, SEARCH and SUBSTITUTE to parse a memo; VALUE and DATEVALUE to turn a text export into numbers; Text to Columns and Flash Fill.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 3.4.1 LEN, LEFT, RIGHT and MID: split the codes | `LEFT` | COUNTIF, FIND, LEFT, LEN, MID, RIGHT, TRIM | One code became two columns, and the trailing spaces gave themselves away. |
| 3.4.2 FIND, SEARCH and SUBSTITUTE: parse the memo | `FIND` | FIND, MID, SEARCH, SUBSTITUTE, UPPER | You pulled three facts out of one string, and the raw memo is still there for the audit. |
| 3.4.3 VALUE and DATEVALUE: a text export into numbers | `VALUE` | Paste Special, Go To Special, DATEVALUE, SUMIF, SUMIFS, VALUE | Three text amounts became numbers, and the sums finally counted them. |
| 3.4.4 Text to Columns and Flash Fill | `Alt A E` | Alt A E, Ctrl+E, Text to Columns, Flash Fill, LEFT, MID | A whole column split in one pass, and you know why the result is values. |
| 3.4.C Challenge: a text dump into a usable table | — | Text to Columns, DATEVALUE, TRIM, VALUE | Challenge, goals only: all of 3.4 under the clock. |

### 3.5 Time value of money

**Story card.** *What is a new site worth?* Cedar Park cost $5m all in (the land, which Clearcoat owns there, and the build) and was funded with a $3.5m loan, and the buyers want two things: the loan's schedule, and whether a site like it is worth building at all. A dollar next year is worth less than a dollar today, and the functions in this module say how much less: PMT for the loan, NPV and IRR for the site.

**Objective.** Time value of money: PV, FV and PMT on the site-build loan; NPV and XNPV on a new-site case; IRR and XIRR; a payment schedule with anchors.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 3.5.1 PV, FV and PMT: the site-build loan | `PMT` | FV, PMT, PV | Three inputs gave you the payment, the total interest and the sign convention. |
| 3.5.2 NPV and XNPV: a new-site case | `NPV` | NPV, SUM, XNPV | Five years of cash discounted to today say the site is worth more than it cost. |
| 3.5.3 IRR and XIRR | `IRR` | COUNTIF, IRR, NPV, XIRR | You have the site's own return now, and the year it pays itself back. |
| 3.5.4 A payment schedule with anchors | `F4` | F4, Ctrl+D, Fill Series, IPMT, PPMT, SUM | One anchored row filled a hundred and twenty times, and the balance lands on zero. |
| 3.5.C Challenge: a new-site case valued with NPV and IRR | — | IRR, NPV, PMT | Challenge, goals only: all of 3.5 under the clock. |

### 3.6 Auditing

**Story card.** *Somebody else's Summary doesn't tie.* Before you built yours, someone started a Summary sheet and left. It has a SUMIF pointing at a range a row short, a typed number in a formula column, a text "12", and a total that agrees with nothing. Chapter 1 taught the three looks; this module adds the tools a reviewer uses on a sheet they didn't build, and the checks block that says, in one cell, whether the databook ties.

**Objective.** Auditing at databook scale: trace arrows and Evaluate Formula; F9 on a part of a formula; the hardcode and external-link hunt; the checks block with a roll-up flag.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 3.6.1 Trace precedents and dependents | `Alt M P` | Ctrl+[, Alt M P, Alt M D, Alt M A A, Alt M V, Evaluate Formula, SUMIF | The arrows showed the chain, and Evaluate showed where the number went wrong. |
| 3.6.2 F9 on a part, show formulas, Go To Special at scale | `F9` | F9, Esc, Ctrl+`, F2, Go To Special, SUMIF, SUMIFS, VALUE | Three sweeps made the two dead numbers in the block give themselves up. |
| 3.6.3 The hardcode and external-link hunt | `Alt A K` | Alt A K, Ctrl+Tab, Ctrl+F, Ctrl+], Ctrl+`, Go To Special, Edit Links | Nothing in the file reaches outside it, and nothing hides a number inside a formula. |
| 3.6.4 The checks block with a roll-up flag | `COUNTIF` | Ctrl+Z, ABS, COUNTIF, IF, SUMPRODUCT | Six checks feed one flag, and the databook says whether it ties before anyone asks. |
| 3.6.C Challenge: six faults in a summary | — | — | Challenge, goals only: all of 3.6 under the clock. |

### 3.7 Project and assessment

**Story card.** *The databook, tied out.* A fresh export, a fresh site list, a Summary someone else abandoned. Rebuild it so every number reads the export and the flag reads OK, then value the next site on the list. Build it, then build it again on the clock. The assessment is the test-out.

**Objective.** The KPI databook rebuilt from the export with every check at zero; the assessment is the test-out.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 3.P Project: rebuild the Summary so every number ties | — | AND, IFS, IRR, NPV | Period keys on the export · the flags block with IFS and AND · site age and member tenure · the site × package counts and sums · the blended ticket · the league table · the reconciliation with adjustments explained and the check at zero · the codes split… |
| 3.A Assessment: a fresh export, twelve minutes | — | — | Another cluster's export and site list, sized by start and end state: raw export in, a databook whose flag reads OK out. Pass is Verified; this is also the test-out. |

## Chapter 4 · Data and Lookups (Pro): 32 lessons · 6 challenges · 4 hours

**Where the deal is.** The data room is open and three private-equity buyers are inside it, each with a diligence team sending questions through a log. Every question is the same shape underneath: pull the right number out of a dataset the page can't hold, cut it the way they asked, and show what happens if an assumption moves. The management case, the company's own forecast, needs sensitivities before a buyer will price it.

**The product.** The diligence pack: the question log answered, a KPI page that reads the export, a utilization dashboard (tables, not charts), and the management case with a case toggle and sensitivity tables, every toggle named.

**What the learner can say afterwards.** Why a model reads a dataset instead of holding it; how a lookup fails and how to make it fail loudly; what utilization, member share and break-even washes mean for a wash; how a case toggle and a data table answer "what if" without three copies of the file.

**The workbook.** **Export**: about ninety rows, six sites × fifteen days (Sep 15–29): A date, B site code, C retail washes, D member washes, E total washes (formula), F retail revenue, G hours open. Planted: one site code misspelled, one day missing for one site.

### 4.1 Lookups

**Story card.** *The model can't hold the data.* Sponsor A's first question is simple (what's the Deluxe price at Domain), and the price list is on another sheet with forty rows. A lookup reaches into a table, finds a row by its key and brings back the column you asked for, so a page can read a dataset it could never hold. Every model a buyer sends you is built on them, and every one has a way to fail.

**Objective.** Lookups: why a model reads a dataset; VLOOKUP and HLOOKUP and how they fail; MATCH, then INDEX/MATCH; two-way INDEX/MATCH; XLOOKUP; approximate match for bands and IFERROR around a lookup; multi-criteria lookups; OFFSET and INDIRECT and why the standard avoids them.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 4.1.1 Why lookups: a model reads a dataset it can't hold | `VLOOKUP` | VLOOKUP | The answer reads the list now, so it can't be wrong the day the list changes. |
| 4.1.2 VLOOKUP and HLOOKUP, and how they fail | `VLOOKUP` | Ctrl+Z, HLOOKUP, VLOOKUP | VLOOKUP works, and now you've seen the three ways it breaks. |
| 4.1.3 MATCH, then INDEX/MATCH | `MATCH` | Ctrl+Z, INDEX, MATCH, VLOOKUP | Two functions make a lookup that survives an inserted column. |
| 4.1.4 Two-way INDEX/MATCH: any site, any month | `INDEX` | Data Validation, INDEX, MATCH, SUMIFS | One cell answers any site in any month. |
| 4.1.5 XLOOKUP: exact, not-found, two-way | `XLOOKUP` | INDEX, MATCH, XLOOKUP | One function does what two did, when the file allows it. |
| 4.1.6 Approximate match for bands, and IFERROR around a lookup | `MATCH` | IFERROR, IFS, INDEX, MATCH, VLOOKUP, XLOOKUP | A band lookup replaced the IFS ladder, and a miss says so in words. |
| 4.1.7 Multi-criteria lookups: a key column, a two-condition MATCH, SUMIFS as a lookup | `&` | &, INDEX, MATCH, SUMIFS, TEXT | Three ways to look up on two conditions, and you know which one to write. |
| 4.1.8 OFFSET and INDIRECT, and why the standard avoids them | `OFFSET` | Ctrl+Z, INDEX, INDIRECT, MATCH, OFFSET, SUM | You can read OFFSET and INDIRECT now, and you know why you won't write them. |
| 4.1.C Challenge: a broken lookup summary rebuilt | — | IFERROR, INDEX, MATCH, OFFSET, XLOOKUP | Challenge, goals only: all of 4.1 under the clock. |

### 4.2 Lists and tables

**Story card.** *Ninety rows, sorted, filtered, deduplicated.* Sponsor B wants the export by site and then by day, the Saturdays only, and a clean list of sites with no repeats. And they want the manager's inputs on the case sheet limited to choices from a list, so nobody types "Mangement". Sort, filter, Remove Duplicates and Data Validation are the list tools, and they change the data or what you see of it, so the rule is: on a copy, and with a total that knows what's filtered.

**Objective.** Lists: sort and multi-level sort; AutoFilter and filtered totals with SUBTOTAL; Remove Duplicates and the unique site list; Data Validation and drop-downs; filter tricks (visible cells only, wildcards, skip blanks); the modern list tools, UNIQUE, FILTER and SORT (pending Wolf, screenplay 9.1 question 12).

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 4.2.1 Sort and multi-level sort | `Alt A S S` | Alt A S S, Alt A B, Sort, SUBTOTAL, SUMIFS | You sorted a copy two ways, and the original stayed where the links expect it. |
| 4.2.2 AutoFilter and filtered totals with SUBTOTAL | `Ctrl+Shift+L` | Ctrl+Shift+L, Alt+↓, Alt A C, SUBTOTAL, SUM | The rows you hid stayed out of the total, because SUBTOTAL knows what's showing. |
| 4.2.3 Remove Duplicates and the unique site list | `Alt A M` | Alt A M, Ctrl+F, Remove Duplicates, COUNTIF | Six sites made one list, and the seventh was a typo. |
| 4.2.4 Data Validation and drop-downs | `Alt A V V` | Alt A V V, Alt+↓, Data Validation | Nobody can type a case that doesn't exist. |
| 4.2.5 Filter tricks: visible cells only, wildcards, skip blanks | `Alt+;` | Alt+;, Ctrl+9, Ctrl+C, Ctrl+Z, Paste Special, COUNTIF, SUMIFS | Visible cells only, a wildcard, and a paste that skips blanks. Three keys that each save an afternoon. |
| 4.2.6 UNIQUE, FILTER and SORT: the modern list tools *(pending Wolf, screenplay 9.1 question 12)* | `UNIQUE` | Remove Duplicates, FILTER, SEQUENCE, SORT, SUMIFS, UNIQUE | The list tools become live formulas, in the files that can use them. |
| 4.2.C Challenge: a dump into a filtered, deduplicated list | — | Remove Duplicates, Sort, COUNTIF, SUBTOTAL | Challenge, goals only: all of 4.2 under the clock. |

### 4.3 Summaries from raw rows

**Story card.** *The KPI page.* Every buyer wants the same page: washes and revenue by site and by month, utilization, member share, and a way to ask any question of the export without touching it. The page is a set of SUMIFS reading the export by keys, laid out as a cube, with a KPI block on top and a checks block underneath, and it answers the log's questions one after another.

**Objective.** Summaries from raw rows: the SUMIFS cube filled both ways; the KPI block (washes per hour, member share, utilization); date-range criteria; the KPI page linked, labeled and checked; a buyer's question answered end to end; 3D references and grouped sheets across site tabs.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 4.3.1 The SUMIFS cube: site × month, filled both ways | `SUMIFS` | AutoSum, SUM, SUMIFS | One formula filled eighteen cells, and the grand total ties to the export. |
| 4.3.2 The KPI block: washes per hour, member share, utilization | `INDEX` | COUNTIFS, INDEX, MATCH, MAXIFS, SUMIFS | Utilization and member share are built by site, and two of the buyers' questions point at them. |
| 4.3.3 Date-range criteria: SUMIFS between two dates | `&` | &, SUMIFS, SUMPRODUCT | Any window a buyer types gets summed from the export. |
| 4.3.4 The KPI page: linked, labeled, checked | `Ctrl+1` | Ctrl+1, SUM | The KPI page reads the export end to end, and its own checks say so. |
| 4.3.5 A buyer's question answered end to end | `=` | RANK, SUMIFS | One question took four pieces you already had, and the log points at the answer. |
| 4.3.6 3D references and grouped sheets: forty site tabs in one formula | `Ctrl+Shift+PgDn` | Ctrl+Shift+PgDn, Ctrl+Z, Ctrl+Enter, Ctrl+PgDn, Group, SUM | Six tabs summed in one formula, and a new tab joins the sum on its own. |
| 4.3.C Challenge: a KPI block that ties to the export | — | — | Challenge, goals only: all of 4.3 under the clock. |

### 4.4 Pivot tables

**Story card.** *The fast cut, and where it stops.* Sponsor B's analyst wants three cuts of the export by tomorrow, and a PivotTable gives each in a minute: drag a field down, a field across, a field into values. It's the fastest way to see a dataset and the wrong thing to build a model on, because it holds a copy of the data and forgets to refresh. Use it for the cut, and GETPIVOTDATA to read it when a page must.

**Objective.** PivotTables: build and rearrange; group dates and set value settings; refresh, and GETPIVOTDATA to read a pivot from a page.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 4.4.1 Build and rearrange | `Alt N V T` | Alt N V T, Alt N V T N, PivotTable, SUMIFS | You built the cube in seconds, on a copy of the data. |
| 4.4.2 Group dates and value settings | `Alt J T` | Alt J T, Alt J T G, Remove Duplicates, Group | The pivot grouped the dates and counted, averaged and shared the values, and nothing was written by hand. |
| 4.4.3 Refresh and GETPIVOTDATA | `Alt+F5` | Alt+F5, PivotTable, GETPIVOTDATA, SUMIFS | The pivot refreshes on command, and the page reads it by name. |
| 4.4.C Challenge: an export summarized three ways | — | GETPIVOTDATA | Challenge, goals only: all of 4.4 under the clock. |

### 4.5 Scenarios and sensitivity

**Story card.** *What if the ticket falls?* The management case is the company's own forecast; a buyer builds a base case from what they think will happen and a downside they can live with, and they want all three in one model with a switch, never three files. Then the questions: what if the blended ticket drops a dollar, what if member share slips, how many washes break even. A case toggle and a data table answer them on one sheet.

**Objective.** Scenarios and sensitivity: a case toggle with CHOOSE and INDEX; a one-way data table; a two-way data table; Goal Seek for break-even; the pass-through driver when a data table can't reach an input; case outputs side by side (a data table on the switch, and the sticky IF).

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 4.5.1 A case toggle with CHOOSE and INDEX | `CHOOSE` | CHOOSE, INDEX, MATCH, OFFSET | One switch runs three cases, and there's no second copy of the file. |
| 4.5.2 One-way data table: the ticket | `Alt A W T` | Alt A W T, Alt A W T R, Data Table | Five tickets give five EBITDAs in one table that stays live. |
| 4.5.3 Two-way data table: ticket × member share | `Alt A W T` | Alt A W T, Alt M X E, F9, Alt A W T R | This is the table a buyer photographs: live, with the downside marked. |
| 4.5.4 Goal Seek: break-even washes per site | `Alt A W G` | Alt A W G, Goal Seek, Data Table | You found the washes a site needs to break even by hand and by Goal Seek, and they agree. |
| 4.5.5 When data tables fail: the pass-through driver | `IF` | F9, Data Table, IF | The table reaches an input on another sheet, through one honest cell. |
| 4.5.6 Case outputs side by side: a data table on the switch, and the sticky IF | `Alt A W T` | Alt A W T, Alt A W T R, Data Table, IF, INDEX | Three cases on one page, live from a table, and you know when a sticky IF is the honest exception. |
| 4.5.C Challenge: a three-case model with a sensitivity table | — | Goal Seek, CHOOSE, INDEX | Challenge, goals only: all of 4.5 under the clock. |

### 4.6 Names and structure

**Story card.** *Name the switch, not everything.* The pack is a dozen sheets now, and the case switch is read from six of them. A name turns Scenarios!$B$5 into Case, so a formula reads like English and the reviewer finds the switch by name. But a model with a hundred names is worse than one with none. Name the toggles and the key inputs, manage them, and let the picker read the list by name.

**Objective.** Names and structure: naming toggles and key inputs, sparingly; the Name Manager; a validation list driven by a name.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 4.6.1 Naming toggles and key inputs, sparingly | `Ctrl+F3` | Ctrl+F3, Alt M M D, Ctrl+G, Define Name, Name Box, INDEX | Four cells got names, and each is one a reviewer would look for. |
| 4.6.2 The Name Manager | `Ctrl+F3` | Ctrl+F3, Ctrl+G, Name Manager | Every name in the file is listed, fixed and on the Cover. |
| 4.6.3 A validation list driven by a name | `Alt A V V` | Alt A V V, Data Validation, MATCH | The picker reads a name, so the list can move and the picker won't notice. |
| 4.6.C Challenge: a model's toggles named and wired | — | Name Manager | Challenge, goals only: all of 4.6 under the clock. |

### 4.7 Project and assessment

**Story card.** *The diligence pack.* A fresh export, a fresh question log with eight open questions, a case sheet with three columns and no switch. Answer the log, build the KPI page and the dashboard, wire the case and its sensitivities, name what deserves it. Build it, then build it again on the clock. The assessment is the test-out.

**Objective.** From the raw export to the answered log, the utilization dashboard and the management case switch; the assessment is the test-out.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 4.P Project: the diligence pack | — | Goal Seek, GETPIVOTDATA, INDEX, MATCH | Lookups for capacity, hours and prices with INDEX/MATCH · the unique site list and a proof · the site picker and case picker by validation · the cube filled both ways · the KPI block with utilization and member share · a date window · a pivot for one cut,… |
| 4.A Assessment: a fresh export, twelve minutes | — | — | Another cluster's export, log and case sheet, sized by start and end state. Pass is Verified; this is also the test-out. |

## Chapter 5 · Finance and Accounting (Pro): 37 lessons · 7 challenges · 5 hours

**Where the deal is.** Final round. The bidders left standing want a model they can run their own cases on (three statements that balance, the schedules behind them, checks that prove it) and a view of what the cash flows are worth. The company's plan is forty sites to seventy in five years, at about $5m a site all in ($2.5m of it Clearcoat's own build, on land it rents), and the model is where that plan becomes numbers a buyer can price.

**The product.** The operating model: a Cover, Inputs, the three statements on annual timelines (FY24A–FY26E historical, FY27–FY31 projected), the schedules (rollout and revenue build, costs, working capital, PP&E, debt, tax), a Checks sheet with one flag, and the DCF page.

**What the learner can say afterwards.** How a wash sold becomes revenue, a chemical becomes cost of sales, a tunnel wearing out becomes depreciation and a loan becomes interest; why profit isn't cash and where the difference lives; how the three statements link and why cash is the number that proves it; how a rollout drives revenue, capex and debt; what free cash flow is and what a DCF says it's worth.

**The workbook.** Eight sheets, annual, FY24A–FY31E across C:J with the A/E flag row and a projection flag. Figures in thousands, illustrative; the build session sets the balancing numbers.

### 5.1 The three statements

**Story card.** *What the sites did, in three statements.* Before the model, the accounting. Every wash, chemical, paycheck, loan payment and tunnel bought shows up in one of three statements, and a buyer reads all three because each one hides what the others show. This module builds them for one site and one week by hand, so that when the model links them at forty sites and five years, you know what every line means.

**Objective.** The three statements: the income statement; accrual and cash; the cash flow statement; the balance sheet; how the three link; one week of one site through all three; reading a set the way a buyer does.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 5.1.1 The income statement | `=` | COUNTIFS | The statement runs from the first wash to the bottom line, and every line means something a site did. |
| 5.1.2 Accrual and cash: why profit isn't cash | `=` | — | On this page, profit and cash differ by three timing gaps, and now you can name each one. |
| 5.1.3 The cash flow statement | `=` | — | The statement walks from net income back to the cash in the bank, in three parts. |
| 5.1.4 The balance sheet | `=` | Ctrl+Z | Assets equal liabilities plus equity, and that one zero proves the other two statements. |
| 5.1.5 How the three statements link | `Ctrl+[` | Ctrl+[ | Five links join three statements, and you followed each one with Ctrl+[. |
| 5.1.6 One week of one site through all three statements | `=` | — | One week's six events went through three statements, and the check reads zero. |
| 5.1.7 Reading a set of statements the way a buyer does | `=` | — | Margin, cash conversion and leverage are the three numbers a buyer reads first. |
| 5.1.C Challenge: one site's month through the three statements | — | — | Challenge, goals only: all of 5.1 under the clock. |

### 5.2 Model setup and efficiencies

**Story card.** *Set the model up before you build it.* Forty sites, eight years, six schedules and three statements is too much to hold in your head, so the model holds it for you, if it's laid out in the order it calculates: inputs feed schedules, schedules feed statements, statements feed the DCF, left to right across the tabs. Set the sheets, the timeline and the checks up empty first, and every formula after has a place to go.

**Objective.** Model setup: inputs, calculations and outputs, sheet order and a Cover; the timeline row with its flags and counters; the fill patterns at model speed; the checks sheet from day one; the statements populated from the data tab by INDEX/MATCH; the drivers block (three cases by year, one selector, one live block).

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 5.2.1 Inputs, calculations, outputs: architecture and sheet order | `Alt H O M` | Alt H O M, Move or Copy | Eight sheets sit in the order they calculate, and the Cover says where everything is. |
| 5.2.2 The timeline row: flags and counters | `EOMONTH` | Ctrl+Z, Ctrl+Enter, COLUMN, EOMONTH, IF, MATCH, MAX | One timeline runs across eight sheets, and its flags let one row hold history and forecast. |
| 5.2.3 The fill patterns: anchor, fill right, AutoSum a block, F4 | `Ctrl+R` | Ctrl+R, F4, Ctrl+Shift+→, Alt+=, Ctrl+1, AutoSum | Six rows across eight years took one motion each. |
| 5.2.4 The checks sheet from day one | `=` | Ctrl+Z, ABS, ROUND, SUMPRODUCT | Two of eight checks are live, and the other six have their rows waiting. |
| 5.2.5 Populate the statements from the data tab: INDEX/MATCH on label and year | `INDEX` | Ctrl+Z, INDEX, MATCH, SUMIFS, YEAR | The historicals read the data tab by name, so the next dump can be any shape. |
| 5.2.6 The drivers block: three cases by year, one selector, one live block | `CHOOSE` | CHOOSE, IF, INDEX, MATCH, OFFSET | Three cases live on one Inputs page, and one cell on the Cover runs the whole model. |
| 5.2.C Challenge: a blank model shell to standard in three minutes | — | INDEX, MATCH | Challenge, goals only: all of 5.2 under the clock. |

### 5.3 Schedules

**Story card.** *The schedules behind the statements.* A statement line like revenue or interest is the last row of a schedule that builds it: sites times washes times ticket; a debt balance that rolls forward and charges interest on its average. Six schedules (revenue, costs, working capital, PP&E, debt, tax), and every one rolls a balance from one year to the next. Build them on Schedules, and the statements in module 5.4 read their last lines.

**Objective.** Schedules: the revenue build; the cost build; working capital from days to balances; PP&E, capex and the depreciation waterfall; debt and interest with the average-balance circle and a breaker; tax.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 5.3.1 The revenue build: sites × washes × days × ticket, plus members × fee | `=` | — | Revenue is built from sites, washes and tickets now, and a buyer can change any of them. |
| 5.3.2 The cost build: per wash, per site, fixed | `=` | — | Every cost is built the way it behaves: per wash, per site, or fixed. |
| 5.3.3 Working capital: days to balances, deferred membership revenue | `=` | — | Three day counts became three balances, and their changes are what move cash. |
| 5.3.4 PP&E: capex per new site and the depreciation waterfall | `=` | SUM | The tunnels roll forward, and each year's capex wears out on its own row. |
| 5.3.5 Debt and interest: the average-balance circle with a breaker | `Alt F T` | Alt F T, Alt F T F, IF, VALUE | Two tranches roll with interest on the average, and a switch stops the circle when it breaks. |
| 5.3.6 Tax | `MAX` | MAX | Tax runs at the rate when there's profit, and a loss waits its turn. |
| 5.3.C Challenge: the rollout PP&E and working-capital schedules | — | — | Challenge, goals only: all of 5.3 under the clock. |

### 5.4 Linking the statements

**Story card.** *Link it.* The schedules are built; the statements read their last lines. Income statement first, from revenue to net income. Cash flow from net income and the schedules' changes. Balance sheet last, with cash from the cash flow, and if it doesn't balance, there's an order to look, and you'll learn it by breaking it.

**Objective.** Linking: the income statement from the schedules; the cash flow statement, indirect, from the income statement and the schedules; the balance sheet with cash as the plug that isn't a plug; the cash sweep and the revolver; the order to check when it doesn't balance.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 5.4.1 The income statement from the schedules | `Ctrl+PgDn` | Ctrl+PgDn, Ctrl+Enter, Alt W N, Alt W A, IF, INDEX, MATCH | The income statement reads the schedules, and net income is a formula eight years long. |
| 5.4.2 The cash flow statement, indirect | `Ctrl+PgDn` | Ctrl+PgDn, Ctrl+Z | It runs from net income to closing cash across eight years, and every line is a link. |
| 5.4.3 The balance sheet, and cash as the plug that isn't a plug | `Ctrl+PgDn` | Ctrl+PgDn | It balances, and it balances because every line was built, not forced. |
| 5.4.4 The cash sweep and the revolver | `MAX` | IF, MAX, MIN | Cash never goes below the minimum, and the revolver is the line that proves it. |
| 5.4.5 When it doesn't balance: the order to check | `Ctrl+[` | Ctrl+[ | You found six breaks in order, and the difference told you where each one was. |
| 5.4.C Challenge: schedules linked into balanced statements | — | — | Challenge, goals only: all of 5.4 under the clock. |

### 5.5 Auditing a model

**Story card.** *Audit it before they do.* Three buyers' analysts are about to open this model looking for the mistake that lets them pay less, so find it first. A model gets audited the way a databook does (3.6), and then for the things only a model can get wrong: a row that doesn't cross-foot, a formula that breaks pattern halfway across, an input that survives a stress test by luck.

**Objective.** Auditing a model: tie-outs and cross-foots; error flags and the checks summary; the model-wide sweep for hardcodes and pattern breaks; stress tests.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 5.5.1 Tie-outs and cross-foots | `=` | Ctrl+Z, COUNTIF, SUM | Eight checks live, and each one names the line it guards. |
| 5.5.2 Error flags and the checks summary | `ISERROR` | Alt M K, Alt M W, Watch Window, Error Checking, ISERROR, SUMPRODUCT | The flag now sees errors as well as differences, and one cell says the model is clean. |
| 5.5.3 The model-wide sweep: hardcodes and pattern breaks | `Alt H F D S` | Alt H F D S, Ctrl+R, Alt F T F, F2, Go To Special, Row Differences, Column Differences, ISFORMULA, ISNUMBER, SUM, SUMPRODUCT | Every projected cell is a formula, and every row is one formula across. |
| 5.5.4 Stress tests: zero, negative, huge | `Ctrl+Z` | Ctrl+Z, IFERROR, MAX | The model held at three extremes, or you fixed the formula that didn't. |
| 5.5.C Challenge: eight planted faults | — | — | Challenge, goals only: all of 5.5 under the clock. |

### 5.6 DCF

**Story card.** *What the cash flows are worth.* The model says what the business will earn; the DCF says what that's worth today. Take the cash the business throws off after tax, capex and working capital (before anyone is paid interest), discount it at the return its investors require, add what it's worth beyond the forecast, and you have an enterprise value. Take off the debt and what's left is what the owners are selling.

**Objective.** The DCF: what it is and what the statements feed it; unlevered free cash flow; the WACC block; terminal value by perpetuity and by exit multiple; discounting and the mid-year convention; sensitivity tables.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 5.6.1 What a DCF is, and what the statements feed it | `Ctrl+PgDn` | Ctrl+PgDn, NPV, YEARFRAC | The page is laid out, and every input it needs already lives in the model. |
| 5.6.2 Unlevered free cash flow | `=` | — | This is the cash the business throws off for whoever owns it, before the debt is paid. |
| 5.6.3 The WACC block | `=` | — | Seven sourced inputs built the return the company's investors require. |
| 5.6.4 Terminal value: perpetuity and exit multiple | `=` | CHOOSE | You have two terminal values, and each says whether the other is reasonable. |
| 5.6.5 Discounting and the mid-year convention | `^` | ^, NPV, PV | Enterprise value comes from five discounted years and a terminal, and the convention moves it a few percent. |
| 5.6.6 Sensitivity tables: WACC × growth, exit multiple | `Alt A W T` | Alt A W T, F9 | Two tables show the range inside which the whole negotiation will happen. |
| 5.6.C Challenge: a DCF from a given free-cash-flow line | — | — | Challenge, goals only: all of 5.6 under the clock. |

### 5.7 Model speed

**Story card.** *Now do it fast.* Everything in this chapter you can now do; the question a desk asks is how fast. Three benchmark drills, each a piece of the model against the clock: the revenue build in three minutes, a block filled and formatted in one pass, the statements linked without touching the mouse. They live in Practice as this chapter's benchmarks, and here you run each once with the keys shown.

**Objective.** Model speed: the revenue build in three minutes; fill and format a block in one pass; keyboard-only statement linking.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 5.7.1 The revenue build in three minutes | `F4` | F4, Ctrl+1, AutoSum | You built revenue in three minutes, and the check went green as you finished. |
| 5.7.2 Fill and format a block in one pass | `Ctrl+R` | Ctrl+R, F4, Ctrl+1 | You filled and formatted forty rows without touching a cell twice. |
| 5.7.3 Keyboard-only statement linking | `Ctrl+PgDn` | Ctrl+PgDn, Ctrl+Enter, F4 | You linked twelve lines by keyboard alone, and the check reads zero. |
| 5.7.C Challenge: the chapter's benchmark drills | — | — | Challenge, goals only: all of 5.7 under the clock. |

### 5.8 Project and assessment

**Story card.** *The operating model, end to end.* Fresh inputs, an empty shell, three historical years typed and sourced. Build the schedules, link the statements, get the flag to OK, value it. Build it, then build one schedule and its links again on the clock. The assessment is the test-out.

**Objective.** The operating model with its DCF page; the assessment is one schedule and the links from it, timed.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 5.P Project: the operating model with its DCF page | — | — | Sheet order and Cover · timeline with flags · checks sheet · revenue build · cost build · working capital · PP&E and waterfall · debt with the breaker · tax · IS linked · CF linked · BS linked · revolver · checks live and flag OK · error and hardcode… |
| 5.A Assessment: one schedule and the links from it, fifteen minutes | — | — | A model with everything built except the debt schedule and its links: build the two tranches and the revolver with the breaker, link interest to the IS, draws and repayments to the CF, closing balances to the BS, and get the balance check to zero in every… |

## Chapter 6 · Valuation (Pro): 18 lessons · 4 challenges · 3 hours

**Where the deal is.** Final bids are in, three sponsors with three structures, and the owners want a recommendation from their own finance team rather than only from the advisers. What is the company worth by every method, what can a sponsor afford to pay, which bid is highest once the structure is priced, and what does each owner take home. It all goes on one page for the board, with every number on it traceable.

**The product.** The valuation summary for the board: trading comps spread and applied, precedent deals spread and applied, the lead sponsor's LBO rebuilt to see what they can pay, the three bids side by side with their structures priced, the waterfall from enterprise value to each owner's proceeds (down to the learner's own options), and the football-field table that puts every range on one line.

**What the learner can say afterwards.** How a public company's enterprise value is built and turned into a multiple; why the median beats the mean on a set; what LTM means and why it matters; what a sponsor's return is made of and why debt is its engine; what a sale-leaseback does to EBITDA and to the multiple; why headline price and proceeds are different numbers; what a football field says at a glance.

**The workbook.** **Comps**. Six listed operators, fictional: Pinnacle Wash Holdings, Riverbend Auto Care, Summit Express Wash, Meridian Car Care, Harbor Clean Group, Prairie Wash Holdings. For each: share price, shares, debt, cash, eight quarters of revenue and EBITDA, the last two fiscal years' totals, fiscal year end, sites, washes. Two have March fiscal years; one is an outlier (a struggling operator at 6x).

### 6.1 Trading comps

**Story card.** *What the market pays for a car wash.* Six listed operators do what Clearcoat does, and the market prices each of them every day. Turn those prices into multiples (what a dollar of car-wash EBITDA is worth), measure every company to the same date, take the middle of the set, and apply it to Clearcoat. That's the first range on the board's page, and the one the buyers will quote back.

**Objective.** Trading comps: spreading a comp (the enterprise value build); calendarization and LTM; sorting the set, filtering the outliers, taking the median; operating multiples (EV per site and per wash); applying the range to Clearcoat.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 6.1.1 Spreading a comp: the EV build | `=` | Ctrl+D, IF | Six companies are built the same way, and each one carries a price for a dollar of profit. |
| 6.1.2 Calendarization and LTM | `SUM` | SUM, MONTH, SUMIFS | Every company is measured to the same date, whatever its fiscal year. |
| 6.1.3 Sort the set, filter the outliers, take the median | `MEDIAN` | Ctrl+Shift+Enter, Sort, AVERAGE, IF, MAX, MEDIAN, MIN | You have the middle of the set and a range an outlier can't pull. |
| 6.1.4 Operating multiples: EV per site, EV per wash | `/` | / | Six companies anyone can count gave you a price per site and per wash. |
| 6.1.5 Applying the range to Clearcoat | `*` | * | The first range on the board's page came from six companies and a median. |
| 6.1.C Challenge: three comps spread and a range applied | — | — | Challenge, goals only: all of 6.1 under the clock. |

### 6.2 Precedent transactions

**Story card.** *What buyers have actually paid.* Trading multiples are what the market pays for a slice; precedents are what a buyer paid for the whole thing, control included, in real deals over the last three years. They're fewer, older and harder to compare, so the questions are which deals count, how old is too old, and what a control premium looks like when the target was listed.

**Objective.** Precedent transactions: deal multiples and premiums; sorting by date and size and deciding what's comparable; applying the precedents range.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 6.2.1 Deal multiples and premiums | `=` | — | Six deals are spread, with the premium a control buyer paid on each listed one. |
| 6.2.2 Sort by date and size, and decide what's comparable | `Alt A S S` | Alt A S S, Sort | Four deals count, and the page says why each of the others doesn't. |
| 6.2.3 Applying the precedents range | `*` | * | The second range sits above the first, and the gap between them is the control premium. |
| 6.2.C Challenge: precedents spread | — | — | Challenge, goals only: all of 6.2 under the clock. |

### 6.3 LBO: the sponsor's bid

**Story card.** *How a sponsor can pay what they're offering.* The lead sponsor is offering $195m, and the way they can afford it is debt: borrow nearly half the price against Clearcoat's own cash flow, use every spare dollar to pay it down, sell in five years at the same multiple, and keep what's left. Rebuild their model to see what return that gives them and, once you can, what the most is they could pay and still hit it.

**Objective.** The LBO: sources and uses; debt tranches and the cash sweep; sale-leasebacks and what they cost later; returns (IRR and MOIC); the returns bridge; sensitivity on entry and exit.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 6.3.1 Sources and uses | `=` | — | The table says where $199m comes from and where it goes, and the equity line is what the sponsor risks. |
| 6.3.2 Debt tranches and the cash sweep | `MIN` | MAX, MIN | Five years of cash swept the senior loan, and the net debt paid down is what the equity grew by. |
| 6.3.3 Sale-leasebacks: how a rollout gets financed, and what it costs later | `IF` | IF | A sale-leaseback is cash today, rent forever and a lower EBITDA, and both switches sit on one page. |
| 6.3.4 Returns: IRR and MOIC | `IRR` | Ctrl+Z, IRR, RRI | You can see what the sponsor makes, as a multiple and as a rate, and whether it clears their bar. |
| 6.3.5 The returns bridge | `=` | — | The return split into three effects and the fees, and the sweep and the rollout did most of the work. |
| 6.3.6 Sensitivity on entry and exit: what the sponsor can pay | `Alt A W T` | Alt A W T, F9, Goal Seek, IRR, PV | You know the most a sponsor can pay and still make their return, and it's the ceiling on every bid. |
| 6.3.C Challenge: a paper LBO | — | IRR | Challenge, goals only: all of 6.3 under the clock. |

### 6.4 The bids and the waterfall

**Story card.** *Which bid is really highest?* Three bids: $185m in cash, $200m with $25m of it paid later if next year goes well, $195m with the owners rolling a fifth of their equity into the new company. The headline says one order; the proceeds say another. Price each structure, run the waterfall from enterprise value to what each owner takes home (your own options included), and put every range on one line for the board.

**Objective.** The bids and the waterfall: three bids side by side (headline, structure, certainty); from enterprise value to the owners' proceeds; your stake under each bid; the football-field table and the one-page summary for the board.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 6.4.1 Three bids side by side: headline, structure, certainty | `=` | — | Each bid has three prices, and the order changes with each one. |
| 6.4.2 From enterprise value to the owners' proceeds: the waterfall | `=` | Ctrl+R, Ctrl+Z, MIN | The waterfall runs from what the buyer pays to what each owner takes home, one claim at a time. |
| 6.4.3 Your stake: what your options are worth under each bid | `MAX` | MAX | Three bids are priced, and the line at the bottom of the waterfall is yours. |
| 6.4.4 The football-field table and the one-page summary for the board | `Ctrl+PgDn` | Ctrl+PgDn | Every method and every bid on one page, and the board can see where the money is. |
| 6.4.C Challenge: a one-page valuation summary assembled | — | — | Challenge, goals only: all of 6.4 under the clock. |

### 6.5 Project and assessment

**Story card.** *The last page of the pack.* A fresh comp set, fresh precedents, a sponsor's term sheet and three bids. Spread, apply, rebuild the LBO, price the bids, run the waterfall, assemble the page. Build it, then build it again on the clock. The assessment is the test-out, and passing it Verifies the last chapter, which makes the program certificate yours.

**Objective.** The one-page valuation summary for the board, the last page of the pack; the assessment is the test-out.

| Lesson | Key | Teaches | Gist |
| :- | :- | :- | :- |
| 6.P Project: the valuation summary for the board | — | IRR | Comps spread with LTM and calendarization · median and quartiles with include flags · operating multiples · the comps range · precedents spread, aged, flagged · the precedents range · sources and uses · two tranches with the sweep · sale-leaseback switch ·… |
| 6.A Assessment: fifteen minutes | — | — | A fresh set and term sheet, sized by start and end state: raw comps and bids in, the board's page out with every link live. Pass is Verified (the sixth), and hotkey.gg Certified · Excel for Finance is issued. |
