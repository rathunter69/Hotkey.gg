# hotkey.gg · Source checklist

*What Wolf's eight paid self-study courses teach, compared with our curriculum: every technique, convention, check and teaching move, the gaps with a placement for each, the places our own scripts turned out to be wrong, and a file-by-file plan to fold it all back. Written 2026-09-30 by the source-extraction session (its brief, claude/extraction-prompt.md, is retired). Techniques only, paraphrased: no source text, dataset, case company or exercise framing is reproduced here, and the session's working copies were deleted (section E). Status: **applied 2026-09-30.** Wolf said "apply": the fold-back plan went into the six chapter scripts and the screenplay as DRAFT, 26 of the 71 held items were pulled back on his depth call, the drill ideas in D were sketched in claude/script-drills.md, and the finance left out was parked as add-ons (screenplay 4.10). This doc is now the record of the source pass and the build session's notes; H's Find and Paste tables were removed once their text was in the scripts.*

**Read in this order.** F (the map and where the courses put their weight), then B (gaps, script fixes, held items and what became of each), then H (what was applied, Wolf's calls, the notes for the build session, next steps). A, C, D, E and G are reference.

**Where the sections are.** The checklist is split into six files so every Claude surface can open it (2026-10-01; it was one 553 KB file). This file holds F and H, the two a build session needs; the rest are reference. Row ids are unchanged.

| Section | What | File |
| :- | :- | :- |
| F | The course map and where the courses put their weight | this file |
| H | What was applied, Wolf's calls, the notes for the build session, next steps | this file |
| A | Techniques by source lesson, part 1 (Excel Crash Course, Financial Statement Modeling, Accounting Crash Course) | claude/source-checklist-a1-techniques.md |
| A | Techniques by source lesson, part 2 (DCF Modeling, LBO Modeling, M&A Modeling, Trading Comps, Transaction Comps) | claude/source-checklist-a2-techniques.md |
| B | Gaps, fixes to our own scripts, held items and what became of each | claude/source-checklist-b-gaps.md |
| C | How the courses teach each idea (the source of the Chapter 5 and 6 teach lines) | claude/source-checklist-c-teaching.md |
| D, E, G | Drill ideas (D01 to D93), the run log, what was parked | claude/source-checklist-deg-drills-log-parked.md |

In the repo the same files sit under docs/screenplay/.

**In one view.**

| | |
| :- | :- |
| Corpus | 468 videos in 8 courses, each with a transcript; 69 outline lessons have a running time and no video, and are covered from the course manuals and workbooks where those say anything (marked in A and E) |
| Read in full | 240 tier-A and 67 tier-B lessons (34.5 hours of video), by twelve extraction agents; 13 duplicate videos collapsed |
| Recorded by title | 148 tier-C lessons (section G); 12 non-content videos skipped |
| Section A | 844 technique rows across 356 lessons and readings, plus 162 exercise shapes |
| Gap candidates | 193 raised; 29 were the same gap from two courses; none turned out to be something we already teach. Two more rows came from the materials pass (G195, G196) |
| Section B | **95 confirmed gaps** (63 of them things a generic Excel course would skip), **56 fixes to our own scripts** (five confirmed by a test in desktop Excel and one, F57, found by it; F04 was struck by the same test), 71 held with a placement each (26 since applied, 45 not), no new lessons |
| Parked (section G) | 151 rows from tier-A and tier-B lessons: public-co-only 46 · out 44 · DLC 39 · diligence 28 (a few carry two tags) |
| Section H | Applied 2026-09-30: 276 edits (262 anchored into the scripts and the screenplay, 14 Reference-page rows), 88 ledger rows and mechanics requests M64–M82; then, on Wolf's calls, 26 held items, the case numbers, 17 more ledger rows and M83–M85 |
| Section D | 93 drill ideas: 71 sketched as 65 new drills in claude/script-drills.md, 15 folded into 12 planned drills, 5 parked with the add-ons, 1 held for the engine, 1 dropped |

## F. The course map and emphasis

One table per course from the public outlines and the transcripts present. Lessons and minutes count videos in the folder; "no video" counts outline items with a running time and no file. Our chapter is where most of the module's rows map.

### Excel Crash Course

| Module | Lessons | Minutes | No video | Tier | Our chapter |
| :- | :- | :- | :- | :- | :- |
| Module 1 | 5 | 35 | – | A 4 · C 1 | Ch 1 |
| Module 2 | 4 | 18 | – | A 4 | Ch 1 |
| Module 3 | 17 | 93 | 2 | A 19 | Ch 1, Ch 2 |
| Module 4 | 4 | 28 | 4 | A 8 | Ch 3, Ch 1 |
| Module 5 | 9 | 69 | 7 | A 16 | Ch 4, Ch 5 |
| Module 6 | 6 | 25 | 4 | A 10 | Ch 3, Ch 4 |
| Module 7 | 2 | 10 | 4 | A 6 | Ch 3, Ch 2 |
| Module 8 | 4 | 26 | – | A 4 | Ch 4 |
| Module 9 | 1 | 9 | 2 | B 2 · skip 1 | Ch 3 |
| Module 10 | 0 | 0 | 8 | C 8 | – |
| Module 11 | 0 | 0 | 1 | C 1 | – |

About eight and a half hours of video in eleven modules. It front-loads setup: roughly half an hour on settings and driving the ribbon by keyboard before any data is touched, then a short navigation module. The longest stretch of basics is entering, editing and formatting (about 100 minutes), where custom number formats get the single longest lesson. The heaviest module is lookups and data tables (about two hours once the later XLOOKUP add-on lessons are counted), followed by logic and dates and by math and financial functions at just under an hour each. Text functions (half an hour) and sort, filter and pivots (25 minutes) are brief; two combined-function puzzles close the core, with LAMBDA and a macro primer bolted on. Modules one to six each end in a review quiz. The final exam has 47 questions in mixed formats: a five-question block completing a five-year income statement forecast from an assumptions table and reading off results, including one re-run with a changed input; ten questions answered from a sales-line dataset of about 570 rows with a pivot and a helper month column; pick-the-function items on dates; evaluate-this-formula items on lookups, conditional sums and conditional counts against a pictured table; error codes; custom format codes; shortcut recall; write-the-formula items (average, maximum, rank, NPV, IF with AND and OR); a three-question text clean with TRIM, LEFT, RIGHT and LEN followed by conditional totals on the cleaned columns; the row and column input cells of a data table; and INDIRECT with a joined reference. It does not test SUMPRODUCT, INDEX/MATCH, IRR, Text to Columns or the puzzles.

### Financial Statement Modeling

| Module | Lessons | Minutes | No video | Tier | Our chapter |
| :- | :- | :- | :- | :- | :- |
| Module 1 | 6 | 52 | – | B 4 · C 1 · skip 1 | Ch 1, Ch 5 |
| Module 2 | 2 | 25 | 2 | A 4 | Ch 1, Ch 3 |
| Module 3 | 5 | 24 | 1 | C 6 | – |
| Module 4 | 5 | 46 | 1 | A 6 | Ch 5, Ch 2 |
| Module 5 | 2 | 23 | – | A 2 | Ch 5, Ch 4 |
| Module 6 | 7 | 37 | 2 | A 9 | Ch 5 |
| Module 7 | 6 | 47 | 1 | A 7 | Ch 5 |
| Module 8 | 9 | 38 | 2 | A 11 | Ch 5, Ch 1 |
| Module 9 | 5 | 63 | 1 | A 6 | Ch 5 |
| Module 10 | 0 | 0 | 3 | B 3 | Ch 4, Ch 5 |
| Module 11 | 1 | 22 | 1 | C 2 | – |
| Module 12 | 2 | 34 | – | A 2 | Ch 5 |
| Module 13 | 6 | 35 | 1 | A 7 | Ch 5, Ch 1 |
| Module 14 | 1 | 3 | – | B 1 | Ch 2 |
| Module 15 | 1 | 10 | 3 | A 4 | Ch 5 |
| Module 16 | 1 | 3 | 1 | A 2 | Ch 5 |
| Module 17 | 0 | 0 | 1 | B 1 | – |
| Module 18 | 0 | 0 | – |  | – |

About ten and a half hours. It front-loads setup and conventions (Excel settings, shortcuts, an add-in, formatting and best-practice rules, roughly an hour and a half) and a half-hour on gathering public documents before any modeling. The core, about five hours, builds one integrated model in a fixed order on a single long sheet: typed historicals, income statement forecast, balance sheet lines, cash flow statement, roll-forward schedules, then the revolver, interest and circularity, with progress-check copies of the file at each stage. Scenarios, data tables and an earnings-per-share schedule follow. A second part, about two and a quarter hours, adds rigor to the finished model: a find-the-errors balancing exercise, a price × volume revenue build, working-capital and depreciation-waterfall schedules, and rolling the model forward a year. Practice is pause-and-build against empty and completed tabs rather than quizzes; the final assessment's questions were not in the material read for this group, so what it tests is not confirmed.

### Accounting Crash Course

| Module | Lessons | Minutes | No video | Tier | Our chapter |
| :- | :- | :- | :- | :- | :- |
| 01 Introduction to Accounting | 5 | 40 | – | A 4 · skip 1 | Ch 5 |
| 02 The Income Statement | 16 | 112 | – | A 16 | Ch 5, Ch 2 |
| 03 The Balance Sheet | 6 | 49 | – | A 6 | Ch 5 |
| 04 Assets | 5 | 63 | – | A 5 | Ch 5 |
| 05 Liabilities & Equity | 8 | 90 | – | A 8 | Ch 5, Ch 2 |
| 06 The Cash Flow Statement | 3 | 28 | 1 | A 4 | Ch 5 |
| 07 Financial Statement Analysis | 1 | 24 | – | A 1 | Ch 5 |

About seven hours of video in seven modules. It front-loads forty minutes on why accounting matters, the core principles and how to read an annual filing, then spends its largest single block, close to two hours, walking the income statement one line at a time. The balance sheet takes the most time overall: fifty minutes introducing it through double entry and the link to the income statement, an hour on assets, and ninety minutes on liabilities and equity, more than twenty-five of them on leases. The cash flow statement gets forty minutes and ratios one 24-minute lesson. A single small-business case returns four times and grows into a linked three-statement set in Excel. Every module ends in a review quiz (the quiz items were not in the materials read); the in-lesson pause questions test two-sided entries, balance roll-forwards and sign rules, not Excel skill.

### DCF Modeling

| Module | Lessons | Minutes | No video | Tier | Our chapter |
| :- | :- | :- | :- | :- | :- |
| 01 DCF Overview | 5 | 17 | – | B 4 · skip 1 | Ch 6, Ch 5 |
| 02 DCF Mechanics | 7 | 49 | – | A 7 | Ch 5, Ch 6 |
| 03 Building the Core DCF Model | 23 | 117 | 1 | A 24 | Ch 5, Ch 3 |
| 04 Presenting the DCF Output | 2 | 17 | – | A 1 · B 1 | Ch 5, Ch 6 |
| 05 Mid-Year Convention | 3 | 11 | – | A 3 | Ch 5, Ch 4 |
| 06 Stock Options, Convertibles, Dual Classes and Splits | 9 | 49 | – | C 9 | – |
| 07 Weighted Average Cost of Capital | 6 | 45 | – | A 6 | Ch 5, Ch 4 |
| 08 Connecting the DCF to a 3 Statement Model | 2 | 15 | – | A 2 | Ch 5, Ch 6 |
| 09 Additional DCF Considerations | 5 | 43 | – | B 5 | – |
| 10 DCF Appendix | 2 | 5 | – | skip 2 | – |

Front-loads about an hour of concepts (what value means, DCF mechanics on a toy business, unlevered against levered) before any modeling. The bulk, roughly two hours across two dozen short videos, builds a one-page valuation of a listed company in page order, each video ending on a pause-and-try. Output tables and the mid-year convention are short add-ons. Share-count detail for options and convertibles (about fifty minutes, tier C) and the discount rate (about forty-five minutes) come after the core model, so the first pass runs on a typed rate. The last core module links the page to the three-statement model from the prior course, and an optional module covers industry beta, terminal-year normalization and value drivers. No formal exam appears in the materials: checking is by in-video concept questions, plug-in exercises and a completed template to compare against.

### LBO Modeling

| Module | Lessons | Minutes | No video | Tier | Our chapter |
| :- | :- | :- | :- | :- | :- |
| 01 LBO Basics | 20 | 103 | 1 | A 5 · B 9 · C 5 · skip 2 | Ch 6, Ch 5 |
| 02 The Structure of PE Firms & Investor Dynamics | 8 | 41 | – | B 3 · C 5 | Ch 6, Ch 3 |
| 03 Modeling a full LBO | 27 | 209 | 2 | A 12 · B 2 · C 15 | Ch 6, Ch 5 |
| 04 LBO Exit & Returns Analysis | 7 | 45 | – | A 7 | Ch 6, Ch 2 |
| 05 Sensitivity Analysis | 4 | 44 | – | A 4 | Ch 6 |
| 06 Pro Forma Balance Sheet Adjustments | 8 | 52 | – | C 7 · skip 1 | – |
| 07 Appendix I - Dividend Recaps | 3 | 12 | – | B 3 | Ch 6, Ch 4 |
| 08 Appendix II - Advanced Purchase Price Allocation Modeling | 4 | 29 | – | C 4 | – |
| 09 Appendix III - Attaching a DCF Analysis to an LBO Model | 1 | 10 | – | C 1 | – |
| 10 Appendix IV - a later deal on the same target | 1 | 14 | – | C 1 | – |
| 11 Appendix V - Debt Deep Dive | 0 | 0 | – |  | – |

About nine and three-quarter hours across 88 lessons. It front-loads close to two hours of concepts before any full model: what a buyout is, a one-sheet paper exercise done twice (simple, then with a fuller capital structure), market and tax-reform commentary, and a tour of debt instruments; forty more minutes go to fund economics with a small distribution exercise. The core, roughly three and three-quarter hours, is one continuous build on a real take-private of a listed company: about an hour on inputs, price, diluted shares and sources and uses; an hour and a half on the operating forecast and asset schedules; seventy minutes on cash, the revolver, amortization, the sweep, accruing instruments, fees and interest. Exit and returns for every capital provider take forty-five minutes and sensitivity another forty-five, ending in a drivers review. The pro forma balance sheet comes only afterwards (fifty minutes), followed by an hour of appendices: a dividend recap, purchase-price allocation, a DCF cross-check and a look back at actual returns, plus a reading on debt. No exam or quiz was in the bundles: checking is by pause-and-complete prompts against paired empty and finished step files, one pair per schedule.

### M&A Modeling

| Module | Lessons | Minutes | No video | Tier | Our chapter |
| :- | :- | :- | :- | :- | :- |
| 01 Overview | 5 | 28 | 1 | B 2 · C 3 · skip 1 | Ch 6, Ch 2 |
| 02 Accretion Dilution Analysis | 4 | 49 | – | C 4 | – |
| 03 Purchase Price Allocation and M&A Accounting | 6 | 52 | – | B 1 · C 5 | Ch 6 |
| 04 Modeling | 12 | 144 | 2 | B 1 · C 13 | Ch 6, Ch 2 |
| 05 Contribution Analysis & Exchange Ratios | 3 | 12 | 4 | C 6 · skip 1 | – |

About six hours. It front-loads half an hour of context (the banker's role, buyer and seller timelines, sample documents, market commentary), then two warm-up accretion and dilution exercises and nearly an hour of deal accounting (purchase price allocation, asset against stock sales, deferred taxes). Half the course is one long build of a merger model between two listed companies: assumptions, diluted shares, financing, sources and uses, goodwill and write-ups, the pro forma balance sheet, credit statistics, accretion and dilution, cash against reported EPS, calendarization and sensitivities, followed by contribution analysis and exchange ratios. Exercises are fill-in templates with pause-and-complete prompts; no exam or quiz material was in the bundles. For us almost all of it is parked merger math: only the process overview, the buyer and seller priorities and the credit statistics block carry over.

### Trading Comps

| Module | Lessons | Minutes | No video | Tier | Our chapter |
| :- | :- | :- | :- | :- | :- |
| 01 Introduction | 7 | 54 | – | A 6 · skip 1 | Ch 6, Ch 2 |
| 02 Spreading the target | 40 | 169 | 1 | A 15 · B 12 · C 13 · skip 1 | Ch 6, Ch 5 |
| 03 Spreading a peer | 11 | 39 | – | C 11 | – |
| 04 Review of peer group spreads | 11 | 32 | – | B 1 · C 10 | Ch 6, Ch 1 |
| 05 Presentation and Interpretation | 14 | 62 | – | A 10 · C 4 | Ch 6, Ch 5 |
| 06 Appendix - GAAP to Non-GAAP Adjustments | 6 | 43 | – | B 6 | Ch 5 |

About 410 minutes over six modules. It front-loads under an hour of concepts (valuation overview, the main multiples, a mini exercise, common misconceptions), then spends by far the most time, roughly three hours across forty-one short lessons, spreading one case company on a single input tab: peer selection, a template walk-through, nearly an hour on share counts and dilutive securities, net debt, fiscal-year and year-to-date results into LTM, company-reported adjustments, consensus estimates and calendarization. A second peer is spread with guidance, three more are left to the learner with brief reviews, and an hour goes to output: operating and valuation tables, bar charts and a football field. An appendix re-teaches earnings normalization with two exercises. The materials read here contain no quiz; assessment is by self-marked exercises with walk-through solutions.

### Transaction Comps

| Module | Lessons | Minutes | No video | Tier | Our chapter |
| :- | :- | :- | :- | :- | :- |
| 01 Introduction to Transaction Comps | 7 | 48 | – | B 1 · C 5 · skip 1 | Ch 6 |
| 02 Implementing a Transaction Comps Analysis | 7 | 34 | 1 | A 3 · B 5 | Ch 6 |
| 03 Calculating Dilutive Securities | 8 | 51 | 1 | C 9 | – |
| 04 Intro to modeling and spreading the first deal | 10 | 61 | 1 | B 8 · C 3 | Ch 6, Ch 2 |
| 05 Spreading the second deal | 2 | 18 | – | C 2 | – |
| 06 Spreading the third deal | 6 | 41 | – | C 6 | – |
| 07 Spreading the fourth deal | 7 | 39 | 1 | C 7 · skip 1 | – |

About 310 minutes over seven modules, with a good third repeated from the trading comps course (the concept primer in module one and the share-count lessons in module three). New material starts with a small round-number exercise and a short lesson on premiums and synergies, then slows down on sourcing: finding deals through colleagues, database screens and fairness opinions, and locating target financials and deal terms in filings. The bulk of the time is four full deal spreads in one input template (terms, premiums, diluted shares, net debt, LTM from a fiscal year and stubs, reported adjustments, deal-date projections), the first taught step by step and the later ones faster, ending on an output tab of multiples with summary statistics. No quiz appears in the materials read; checking is by comparison with a completed workbook.

### Emphasis by concept family

Distinct courses is the signal; lessons and minutes are recorded beside it and are not one (a long course repeating itself is not emphasis). A lesson counts once per family it has a row in; its minutes are split across its families by rows.

| Concept family | Canonical course | Distinct courses teaching it | Lessons (tier A and B) | Minutes |
| :- | :- | :- | :- | :- |
| Excel mechanics, shortcuts, data tables, lookups, formatting | Excel Crash Course | 8 (excel, fsm, accounting, dcf, lbo, ma, trading-comps, transaction-comps) | 127 | 687 |
| Three-statement mechanics, schedules, balancing, circularity, revolver | Financial Statement Modeling | 6 (excel, fsm, accounting, dcf, lbo, trading-comps) | 76 | 443 |
| Accounting concepts and how the statements link | Accounting Crash Course | 5 (fsm, accounting, dcf, trading-comps, transaction-comps) | 56 | 424 |
| EV vs equity value, net debt, UFCF, WACC, terminal value, discounting | DCF Modeling | 8 (excel, fsm, accounting, dcf, lbo, ma, trading-comps, transaction-comps) | 67 | 343 |
| Sources and uses, tranches, sweep, PIK, returns, sensitivity | LBO Modeling | 2 (lbo, ma) | 43 | 240 |
| LTM, calendarization, multiples, peer selection, median and range | Trading Comps | 3 (dcf, trading-comps, transaction-comps) | 43 | 171 |
| Control premium, synergies, deal multiples | Transaction Comps | 1 (transaction-comps) | 15 | 71 |
| Sale process and deal context | – | 2 (fsm, ma) | 4 | 20 |

## H. The fold-back plan: applied 2026-09-30

Wolf said "apply" on 2026-09-30. Everything this section proposed is in the chapter scripts and the screenplay as DRAFT, so the edit tables (a Find and a Paste for each of 276 rows) have been removed: the scripts hold the text, section B says what each id was and why, and screenplay section 11 logs the decisions. What stays here is what went in, Wolf's calls, and the notes a build session needs.

### What was applied

| File | From the plan | Added on Wolf's calls, the same day |
| :- | :- | :- |
| claude/script-ch1.md | 62 edits | Formula AutoComplete in 1.6.2 (G184) |
| claude/script-ch2.md | 27 edits | The CAGR exponent that counts its own periods in 2.1.3 (G081) |
| claude/script-ch3.md | 15 edits | One aside in 3.3.6 on how diligence restates EBITDA (decision 11) |
| claude/script-ch4.md | 28 edits | – |
| claude/script-ch5.md | 73 edits | Fifteen held items; the case numbers in seven places; two arithmetic slips |
| claude/script-ch6.md | 36 edits | Eight held items; a scope note on what Chapter 6 leaves out |
| claude/screenplay.md | 21 ledger corrections, 88 new ledger rows (tips 54, desk audit 19, checks thread 10, skills 5), 14 Reference rows, M64–M82 | The case numbers in 4.2; the parked add-ons in 4.10; 17 more ledger rows (tips 6, Reference 2, desk audit 6, checks thread 3); two rules in 6.0 and the drill index in 6.2b; M83–M85; the decision log |
| claude/curriculum-summary.md | Regenerated with gen_summary.py | |
| claude/script-drills.md | | New: 65 drill sketches from section D, with the map of all 93 ideas |

Each chapter script carries one line under its open calls naming this pass. No lesson was added or removed: 174 lessons, 37 challenges.

### Wolf's calls

His message, 2026-09-30: Chapters 5 and 6 as deep as Claude thinks right for the course and the platform; good on the case numbers; merger math and comps left out as too finance-heavy, perhaps tucked away as an add-on; the drill ideas sketched in this session so the code layer has more to go on; Chapter 1, go with what makes sense; apply the others.

1. **The case numbers.** Option A: Clearcoat's own capex is $2,500k a site on rented land, and the $5m stays the all-in cost. Written as DRAFT; a build session confirms it on a real rebuild.
2. **Chapter 1's parentheses.** Left to Claude, who took option A: the Format Cells dialog once, then F4 or Paste Formats, called the desk number format. Ctrl+Shift+1 is described as what it is (a separator, two decimals, a minus) and kept for counts. The graders read the code on the cell, so a learner who gets parentheses from Comma Style passes too.
3. **4.2.5** rebuilt on rows hidden by hand or folded in a group, with the real filter trap beside it (default A).
4. **4.5.5** renamed the pass-through driver; 4.5.6's sticky IF named as what others call the self-referencing IF (default A).
5. **The rollover** is a line in the LBO's sources (default A).
6. **The sweep** repays the senior loan only (default A).
7. **New numbered lines** stand as written until the chapters go to goal level (default A).
8. and 9. **Depth.** Instead of the nine and seven items the two defaults named, Claude pulled back 26 held items: fifteen of those sixteen (G190, the premium on the unaffected price, stayed out with the comps material) and eleven more of the same kind (G090, G102, G106, G107, G060, G062, G080, G120, G124, G162, G163). Section B's held list shows each one's status.
10. **Conventions.** One typed number per cell stays (G178 not taken); a driver carried forward by formula is black, with its first year blue (G194 settled; G080 shows it in 5.2.6).
11. **Diligence.** One aside in 3.3.6; the rest is parked as an add-on.

Two more calls came with the message. **Merger math and comps:** Claude read "comps" as the deeper public-company work (share counts and dilution, EPS and P/E, premiums on one-day and one-month unaffected prices), not module 6.1, which stays on six fictional operators and enterprise-value multiples. If Wolf meant the module itself, that is one more decision. The left-out material is outlined as six add-ons in screenplay 4.10. **The drills:** the 93 ideas in section D became 65 sketches in claude/script-drills.md, with 12 planned drills given a spec, 5 ideas parked with the add-ons, 1 held for the engine and 1 dropped.

### Mechanics requests

M64–M82 came from this plan and M83–M85 from the apply (Formula AutoComplete; what-if grading for drills; pickers and the stretch and long tags). M86, the shared sheet skeleton, was added the same day at Wolf's ask. All are in screenplay 9.3, which is the build list.

### Notes for the build session (41)

Workbook figures, start states and goal counts that changed with the edits. No script text is involved; these travel with the mechanics requests.

- Number formats: every grader from 1.5.1 to 2.1.C reads the format code on the cell, not the route; the expected code is #,##0_);(#,##0), and #,##0 is also accepted on blocks that hold only counts (1.5.1 B17:G21, 1.6.2 B27:B29, 1.6.3 J5:L10, 1.8.P and 1.8.A B14:G18, 2.1.1 C34:E34). A learner who reaches parentheses another way (Alt, H, K then Alt, H, 9 twice, which writes an Accounting code) passes any goal that asks only for the separator, no decimals and parentheses; only 2.2.1, which reads the code, needs the exact one, and its start state carries it.
- 1.5.1 goal 4 and 1.6.1 goal 6 copy a format from D6 and E6: at those points both cells must carry the desk number format with plain black font, no fill and no border, so Paste Formats changes nothing else.
- 2.2.1's start state carries #,##0_);(#,##0) on C7:E24, so goal 1 reads the code the learner applied in 2.1.1.
- 2.2.4 goal 1: the code's positive section has no [Red], so a check above zero stays black; add [Red] to the first section or leave the red to 2.5.2's rule (outside the fix list, flagged for the owner).
- 2.6.1 and 2.6.3: expected formulas that type the P&L sheet's name use 'P&L'!; Monthly!C3 expects January 2026 from "mmmm yyyy"; 2.6.2's Monthly!D4 expects 2/28/2026.
- 3.2.4's new tip reads Sites!E10 (Cedar Park, opened 9/8/2026): YEARFRAC to 12/31/2026 is 0.314 on the default basis.
- 3.3.2's new goal needs retail amounts at exactly 15 and 20 on the export (Deluxe and Ultimate have them); the three text amounts stay outside both the bands and COUNT, so the check ties before 3.4.3 and after it.
- 4.1.2 goal 4: the grader's inserted column goes to the left of capacity, and the wrong return it expects is the cluster text.
- 4.2.5: the sorted copy holds ninety data rows, so the hidden-row paste reads 90 and the Alt+; paste 75; Airport's rows on Export are not contiguous, so the paste onto the filtered list visibly lands on other sites' rows.
- 4.3.6: Summary sits outside the six-tab group, so moving to it ungroups.
- 4.5.5 keeps the slug self-referencing-if; only its title and copy change.
- Goal counts in the lesson headers change: 2.2.4 to 7, 2.7.1 to 8, 3.1.4 to 8, 3.2.4 to 7, 3.3.2 to 8, 3.4.2 to 8, 4.1.3 to 8, 4.5.5 to 7.
- Rapid-fire and the Format sprint drill: the prompt 'Comma style' maps to Alt, H, K; the prompt for Ctrl+Shift+1 is 'Number format'.
- Dialogs remember their tab: a lesson that opens Format Cells after an earlier goal left it on Alignment or Border starts there, so every keyed route to a number category begins with N (1.5.1, 1.7.2, 2.1.1).
- Shelling a lesson (from the structure of the source courses' exercise files, section C): build the solved workbook first and cut the start state from it by emptying only the graded cells, so labels, inputs, widths and formats are already in place; the graded ranges and what each is graded on (value, formula, format) are the lesson's spec.
- Model chapters as a chain: each lesson's start state is the previous lesson's end state plus the next block's labels and headers, on one sheet that grows downward; keep a build lesson to the 15 to 60 graded cells our goal counts imply (the source steps run 15 to about 200).
- Keep a drill tab small (their function exercises are 5 to 40 rows by 5 to 11 columns with 3 to 18 answer cells in one to five blocks); where the size is the lesson, put the long list on the tab and keep the graded cells few and in view.
- No answer boxes on the sheet: the source files mark answer cells with a border or a fill, which a desk file never has. Ours stay real work products; the goal panel and the pulse point at the cell.
- Case numbers (decision 1, option A taken): capex is $2,500k a site, the building, the tunnel and the equipment, on rented land. For the record, at $5,000k the shell's Base case had unlevered free cash flow of about −$13,980k, −$11,410k, −$8,830k, −$6,220k and −$3,570k for FY27–FY31, which is why the figure moved. Inputs used in both rebuilds: 40 sites, six new a year, 250 and 200 washes a day, 365 days, FY26's $13.89 a wash growing 2%, cost of a wash 12%, card fees and marketing 2% each, FY26 site costs $19,400k on 37 average sites growing 3%, head office $6,000k + 3% + $50k a new site, capex per site + 2% of revenue, 20-year lives, tax 25%, working-capital days 3 / 30 / 15.
- What the planner's rough rebuild gives at $2,500k a site, for the build session to confirm on the real workbook before 5.4.4, 5.6.4, 6.3.2 and 6.3.5 go to goal level: Base free cash flow about −$200k, $2,100k, $4,500k, $7,000k and $9,400k; Management $1,600k rising to $15,100k; Downside $1,000k rising to $2,400k; enterprise value at a 10% WACC about $231,000k on the 11.0x exit and about $175,000k on a normalized perpetuity (8.1x FY31 EBITDA); at the $195,000k bid the sponsor earns about 18%, and the price that earns 20% is about $187,000k.
- Where the new figure was written (2026-09-30, DRAFT): the Chapter 5 brief (about $5m all in, $2.5m of it Clearcoat's own build), the 5.3.4 bullet in the brief, Inputs, 5.1.1 goal 5, 5.1.4 goal 1, 5.1.6 goal 1 (a week of depreciation is now $2,400), 5.1.7 goal 4, the 5.3.4 brief, and screenplay 4.2. Case 4.2's $5m and Chapter 3's Cedar Park ($5m to build, on land Clearcoat owns) stay as the all-in cost, and 6.3.3's $2,500k of land a site fits under it.
- The LBO's cash: at 5.5x the sponsor's model has little to sweep while six sites a year are being built (about $28,000k of extra borrowing over the hold at $2,500k a site), so 6.3.2's brief and done screen and 6.3.5's brief and done screen wait for the build session's figures before their wording is settled (no edit written, no id).
- 5.6.4: at $2,500k a site the perpetuity value on a normalized year sits about a quarter under the 11.0x exit value, so goal 7's 'more than a third' rule does not fire on the Base inputs (at $5,000k it did).
- 5.6.3 (F43): with the 2.0% size premium the inputs give 10.0% (cost of equity 4.0% + 1.2 × 6.0% + 2.0% = 13.2%; after-tax debt 5.25%; weights 60 / 40), which is what goal 4 reads; without it they give 8.8%.
- 5.1.3 goal 3 and 5.1.6 goal 1, two slips fixed in the scripts on 2026-09-30: the site's share of loan amortization is a fortieth of $3,000k, $75k a year; a week of 7% on $1,500k is about $2,020 of interest and the week's principal about $1,440, so the loan payment is $3,460. The delivery is $2,625 (F28), so the week balances with no inventory line; the build session re-ties 5.1.6's week on the new depreciation ($2,400).
- 6.3.1: 11.7x × $16,600k is $194,220k, not the $195,000k bid (195,000 ÷ 16,600 is 11.75x). Either make the bid price the blue input and show the multiple as a formula, which also changes 6.3.1 goal 7 and the entry axis of 6.3.6, or carry the multiple to two decimals; the done screen's $199m is $195,000k plus 2% fees ($198,900k).
- 6.4.2 and 6.4.3: the option pool is taken as 5% of equity value with no strike, while 6.4.3 values the learner's options net of a $40,000k strike valuation, so the pool line overfunds what it pays; take the pool as 5% × (equity value − the strike valuation), floored at zero, or say on the page that the pool figure is gross.
- 5.3.4 (F36, G092): split the FY26 PP&E base into the land Clearcoat owns, at cost on a row that never depreciates, and the depreciating base; the twenty sites 6.3.3 sells are the ones on the land row. Case 4.2 still says the $5m includes land (the land call).
- Inputs gains: LastHistorical (12/31/2026, named), a labeled 1,000 for washes, the deposit rate on cash (nil), distributions by year (nil), the valuation date (12/31/2026), a size premium (2.0%), and the Data mapping table (the model's line name, the accountants' name). Data's year headers are the numbers 2024 to 2026, and IS carries the mapped-name helper (F34).
- 5.4.5's planted copy: make one of the six breaks a movement counted twice (depreciation added back and also netted into the PP&E change), so the tick-off goal has the break only it can find (G077).
- Comps workbook: eight quarters per comp plus the last two fiscal-year totals (F48); one comp, not the 6x outlier, with cash above debt and a 'net cash' note (G186); an owns / rents column with annual rent for the comps that rent (G187); growth and net debt ÷ EBITDA columns with a Clearcoat row under the set (G185).
- LBO sheet: a rollover row in sources, 20% of the equity purchased (about $28,000k if net debt at closing is about $55,000k) (F50); a cash row and a revolver row for short years (F52); the mezzanine unswept (F53); a fees line of about −$3,900k in the bridge (F54); three hurdle columns for the top price (G159, F55).
- DCF page: two enterprise values, one per terminal method (F46), and a third pass-through driver for the exit multiple. With mid-year on, the perpetuity value is discounted at t = 4.5 and the exit value at t = 5 (F45); the round-trip check (G125) has to restate the perpetuity value to the year end, × (1 + WACC)^0.5, before dividing by FY31 EBITDA, so it reads zero at both switch positions.
- Number format: the code quoted in 5.2.3 is the four-section code the Chapters 1–4 plan writes into 2.2.1 goal 2, #,##0_);(#,##0);"–"_);@_); keep the two identical, and grade the code on the cell, not the route.
- Goal counts in the lesson headers, as they now stand: 5.1.6 8, 5.2.2 8, 5.3.1 9, 5.3.3 8, 5.3.4 8, 5.3.5 9, 5.4.2 7, 5.4.5 8, 5.5.1 7, 5.5.3 8, 5.6.4 8, 5.6.5 9, 6.1.3 8, 6.3.4 8, 6.3.5 7.
- From the held items pulled back (2026-09-30): Inputs gains FY26 gross depreciable PP&E, land excluded, for the implied-life read in 5.3.4 goal 2 (set the base so it lands near 20 years). 5.3.3's cash conversion cycle reads about −42 days on the 3 / 30 / 15 inputs. The Downside's ticket growth on Inputs is typed in FY27 and carried as =the prior year, in black (5.2.6 goal 1).
- 5.6.4 has a goal of its own for the normalized FY31 column (goal 1), so the grader reads that column: new-site capex out, capex equal to depreciation, the working-capital change at a steady figure that Inputs has to carry.
- 6.3.4: a lender's cash-flow row and its IRR (goal 6); with interest on the average balance and repayments at year end it reads a little under 8%, so grade it within half a point. Goal 8's zero-debt rerun needs the leverage inputs to accept 0 without an error anywhere on the sheet.
- 6.4.1 goal 3: the rolled stake as a share of the new company's equity is about 26% on the working figures ($28,000k of $107,600k); confirm it on the rebuild and correct the 'about a quarter' if it moves. 6.4.2: every deduction is a MIN against what's left, and the does-it-tie types a price below net debt, so the owners' lines must floor at zero.
- 2.1.3 goal 5 uses COLUMNS before 5.2.2 teaches it as a counter (M74 covers both); 1.6.2 goal 5's teach line needs Formula AutoComplete (M83) or loses its last sentence.
- Drills: the 65 sketches in claude/script-drills.md need seeds and pars; 24 are marked Wave 1. They lean on M84 (what-if grading) and M85 (pickers, the stretch and long tags).

### Next steps

1. **Wolf:** nothing is waiting on you. Two things are worth a line when convenient: whether "comps" meant the deeper public-company work (how it was read) or module 6.1 itself, and whether the Wave 1 pick of 24 drills looks right.
2. **The build** takes it from here (docs/REBUILD_PLAN.md, section 2a). It writes Chapters 2–6 to goal level as it builds each, with section C beside it for how the courses teach each idea; it confirms the case numbers on the real Chapter 5 workbook at $2,500k a site and re-ties the figures the notes above list (5.1.6's week, the LBO's sweep, 6.4.1's rolled share); and it codes M64–M86 and the Wave 1 drills with their chapters.
3. **Whenever convenient:** the missing videos (21 tier-A Excel lessons among them) can be read in a short follow-up run; and the half hour with the IP attorney already on the launch list should cover the courses' license terms on using their materials to inform a competing product. This checklist holds paraphrase only and no source text was kept, but whether that use is permitted is a question for a lawyer, not for this session.
