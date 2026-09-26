# Banker conventions canon (proposal)

Status: PROPOSAL, 2026-09-22. Extends LESSON_FRAMEWORK §5. Nothing here is live until Wolf decides. Companion files: `LESSON_FRAMEWORK.proposed.md`, `CURRICULUM_MAP.proposed.md`, `C2-curriculum-rewrite.proposed.md`.

This is the layer that separates "an Excel course" from "the week the bank buys". Every convention below was found in the public material of at least one of Wall Street Prep, Training The Street, Breaking Into Wall Street or CFI, or in practitioner material (Macabacus, Wall Street Oasis threads, Financial Edge). The **Recurs** column counts independent sources; treat 3+ as settled, 1–2 as house-style that varies by bank (we teach the majority version and say so). Structure and principles only; no course content is reproduced.

How each convention is used in the product:
- **Taught** names the lesson where it is first stated and applied (ids from `CURRICULUM_MAP.proposed.md`; `1.4.1` = chapter 1, section 4, lesson 1).
- **Enforced** names where graders start failing a goal or a challenge when the convention is broken. Chapter 1 challenges enforce only what that section taught; Chapter 2 onward enforces the whole canon on every formatting and modelling grader.
- **Audit** marks conventions whose violations are planted in Audit-archetype lessons for the learner to find.

## A. Set-up and workspace

| # | Convention | Recurs | Sources | Taught | Enforced |
|---|---|---|---|---|---|
| A1 | Set Excel up before you model: iterative calculation on knowingly, calculation mode understood, macro security, default font; done once per machine | 4 | WSP seminar pre-work; WSP ECC "Excel Settings"; TTS Applied Excel; CFI Quick Start "Excel Settings" | 1.1.3 | dialog state graded in 1.1.3; not in the challenge |
| A2 | Quick Access Toolbar holds the formatting commands you hit hundreds of times a day (font colour, fill, borders, decimals, centre); Alt+number replaces long Alt chords | 4 | BIWS shortcuts tutorial; M&I internship prep; CFI Quick Start "Quick Access Toolbar"; WSO first-year thread | 1.1.3 | not graded (personal setup); taught and offered |
| A3 | Gridlines off on any sheet someone else will read; borders carry structure instead | 3 | TTS FMAAMOC Art. 2; Macabacus formatting PDF; WSO megathread | 1.1.2 | Ch2 §3 model-standard grader; Ch1 Project |
| A4 | Descriptive tab names, logical left-to-right order (cover/outputs → inputs → calcs → data), delete unused sheets | 3 | WSP ECC "Naming Worksheets"; TTS "Organizing workbook tabs"; CFI Guidelines sheet order | 1.1.1 | Challenge 1; Ch5 §1 |
| A5 | Keyboard first: the mouse is for reviewing, not building; banks take mice away in training | 5 | CFI shortcuts guide and eBook; WSP cheat sheet; TTS "Using the Alt key"; WSO "god at Excel"; BIWS (via QAT) | 1.0.1 Welcome, then every lesson | mouse in a timed run = no PB (SITE_SPEC §6); lessons nudge only |
| A6 | Save versions as you go; never overwrite the only copy of a model | 1 | WSO PE modelling thread | 1.7.1 (as a closing note) | not gradable; stated |

## B. Colour and cell roles

| # | Convention | Recurs | Sources | Taught | Enforced |
|---|---|---|---|---|---|
| B1 | Font colour by cell role: **blue** hardcoded inputs, **black** formulas | 7 | WSP FM guide; TTS FMAAMOC Art. 2 and 6 Principles; BIWS colour-coding lesson; CFI what-if article; WSO formatting guide; Macabacus; FE Training | 1.1.4 | Challenge 1 onward; every Ch2+ formatting grader; **Audit** |
| B2 | **Green** for links to other worksheets, **red** for links to other workbooks (varies: some houses use purple, some leave links black; consistency beats palette) | 5 | WSP FM guide; TTS FMAAMOC Art. 2; BIWS colour lesson; WSO colour thread; FE (optional) | 1.6.4 | Ch1 Project; Ch2+; **Audit** |
| B3 | Input cells may also carry a light fill (yellow, or a house tint) so inputs read at a glance; bright colours are otherwise reserved for alerts and checks | 4 | BIWS colour lesson (yellow fill, grey border); FE; WSO colour thread; Macabacus PDF | 1.5.2 | Ch2 §3 |
| B4 | Each input lives in exactly one cell; formulas reference it, never retype it; **no hardcodes inside formulas** | 6 | WSP FM guide; TTS 6 Principles; CFI Guidelines and FM Code; WSO first-year thread; BIWS; Macabacus | 1.1.4, 1.6.3 | Ch1 Challenge 1 on the one named cell; from Challenge 6 on every graded formula (`noLiteralInFormula`); Ch2+; **Audit** |
| B5 | Historical (actual) vs projected periods visually distinct: a label row, and often a shaded or italic header; never mixed in one column | 3 | TTS FMAAMOC Art. 2; CFI Quick Start "Actual Calculations / Estimate Assumptions"; WSP FM guide | 2.3.2 | Ch2 §3; Ch5 |
| B6 | Document every hardcode: a source comment or a label column ("per 10-K", "mgmt guidance") | 3 | WSO first-year thread; TTS 6 Principles; CFI modelling best practices | 1.1.4 (label column), 2.3.4 (comments) | Ch5 audit graders |

## C. Layout and flow

| # | Convention | Recurs | Sources | Taught | Enforced |
|---|---|---|---|---|---|
| C1 | Inputs → calculations → outputs, in that order, physically separated (sections or sheets) | 5 | WSP FM guide; TTS 6 Principles and 5 Problems; CFI FM Code; CFI Guidelines; Macabacus | 1.1.4 | Ch1 Project (Raw/Inputs/Report separation); Ch5 §1 |
| C2 | Timeline row at the top of every calculation sheet; one column per period, no blank columns between periods, equal width | 4 | CFI Guidelines "column consistency"; TTS FMAAMOC Art. 1 (consistent periodicity); WSP FM guide; CFI Quick Start "Headings and widths" | 1.3.5 (fill series builds it), 1.4.2 (widths) | Challenge 4; Ch5 §1 |
| C3 | One formula per row, filled right across the timeline; the same logic in every period column | 5 | WSP FM guide; CFI Guidelines and FM Code; TTS "Ensuring consistent formulas" (Ctrl+\\); WSO PE thread | 1.6.5 | Challenge 6 (grader perturbs each period); Ch5; **Audit** |
| C4 | Sign convention chosen once and stated: income positive, costs negative (the default we teach); never flip signs mid-model | 2 | WSP FM guide; Macabacus PDF (parentheses for negatives implies it) | 2.1.2 | Ch5 §1 checks |
| C5 | Units and currency stated once in a global units line ("USD thousands unless stated") and in headers (%, x) | 4 | CFI Guidelines "marking units" and Quick Start "Global Units"; TTS FMAAMOC Art. 2; WSP FM guide | 1.1.4 | Challenge 1; Ch2 §3 |
| C6 | Prefer long single sheets (or a few well-named ones) over many tabs; schedules feed statements, statements never feed schedules | 3 | WSP FM guide; TTS FMAAMOC Art. 1; CFI Guidelines | 5.1.1 | Ch5 project |
| C7 | Group rows and columns rather than hiding them: hidden cells get forgotten, grouped ones show an outline button | 4 | WSP FM guide; BIWS Module 2 "grouping vs hiding"; CFI FM Code (keep visible); TTS | 1.4.3 | Challenge 4 (a hidden column fails, a grouped one passes); Ch2 §4 |
| C8 | Freeze panes so the timeline and labels stay in view on a long sheet | 3 | WSP ECC "Split/Freeze Panes"; CFI Quick Start "Freezing Panes"; BIWS Module 2 | 1.4.3 | Ch1 Project |
| C9 | Named ranges: sparingly, for scenario toggles and a handful of key inputs; not for everything (WSP advises against, TTS names key cells — the sources conflict; we teach the middle) | 2 | WSP FM guide (avoid); TTS Core agenda (naming cells) | 4.6.1 | not enforced |

## D. Number and text formatting

| # | Convention | Recurs | Sources | Taught | Enforced |
|---|---|---|---|---|---|
| D1 | Negatives in parentheses, never a leading minus in a model (percent negatives may keep the minus) | 4 | TTS custom formats; Macabacus PDF; CFI Guidelines; WSO formatting thread | 1.5.1 | Challenge 5; Ch2+; **Audit** |
| D2 | Consistent decimals down a line: currency 0 or 1, percentages 1, multiples 1 with an "x"; decimals aligned | 5 | BIWS colour lesson; CFI Guidelines; TTS FMAAMOC Art. 2; Macabacus; WSO attention-to-detail thread | 1.5.1, 1.5.4 | Challenge 5; Ch2+ |
| D3 | Zero shown as a dash, not 0 or 0.0 (custom format fourth section) | 3 | Macabacus PDF; TTS custom formats; CFI Guidelines | 2.2.1 | Ch2 §2 onward |
| D4 | Currency symbol only on the first and total rows of a block, not every line | 2 | BIWS colour lesson; TTS FMAAMOC Art. 2 | 2.1.3 | Ch2 §3 |
| D5 | Totals bold with a **top border** (single; double for grand totals); no all-borders grids on models; borders carry hierarchy | 4 | Macabacus PDF (top borders over bottom); TTS FMAAMOC Art. 2; WSO megathread; CFI Macabacus course "top borders" | 1.5.2 | Challenge 5; Ch2 §3; **Audit** |
| D6 | Percentages italic (informational lines), sub-items indented one level, headers right-aligned over numbers | 3 | BIWS colour lesson; TTS FMAAMOC Art. 2 (indent hierarchy); LESSON_FRAMEWORK §5 (already ours) | 1.5.3 | Ch2 §3 |
| D7 | **Center Across Selection**, never Merge Cells: merged cells break sorting, filling, and Ctrl+Shift+Arrow | 5 | WSP article; CFI article; TTS shortcuts videos; WSO megathread; WSO "god at Excel" | 1.5.3 | By construction: the engine has no merge, so Center Across is the only route; graders check the title is centred across, not padded with spaces; **Audit** |
| D8 | One font, one size across the model; a title may be larger; no colour for decoration | 3 | LESSON_FRAMEWORK §5; TTS FMAAMOC Art. 2; CFI Guidelines "font types" | 1.5.2 | Ch2 §3 |
| D9 | Custom number formats do the labelling (units suffixes, x, dash zeros, dynamic headers with TEXT) rather than typed text beside numbers | 3 | WSP ECC "Dynamic Headers, Custom Formatting & TEXT"; TTS custom formats; Macabacus | 2.2.1–2.2.3 | Ch2 §2 |

## E. Formulas and keystrokes

| # | Convention | Recurs | Sources | Taught | Enforced |
|---|---|---|---|---|---|
| E1 | Build references by pointing with the arrow keys, not by typing addresses; read a formula back with F2 (precedents highlight) | 4 | Macabacus (F2 highlights); WSP cheat sheet (F2 most important); FE; CFI eBook | 1.6.1 | hint vocabulary; F2 used in 1.6.6 and audits |
| E2 | F4 to anchor while typing; know the four states ($A$1, A$1, $A1, A1) and when a mixed anchor is right | 5 | Macabacus; WSP cheat sheet; TTS "Creating absolute references"; FE; CFI shortcuts | 1.6.3 | Challenge 6 (a fill that breaks because of a missing anchor fails) |
| E3 | Fill a row with Ctrl+R after Ctrl+Shift+→; fill a column with Ctrl+D; fix a whole row by F2 → edit → Ctrl+Enter over the selection | 3 | TTS "speed hacks"; WSP cheat sheet; Macabacus | 1.3.3, 1.6.5 | par times assume it |
| E4 | Paste Special values (Ctrl+Alt+V, V) to freeze a snapshot; never paste over live formulas by accident; Paste Special formats (T) to copy a look | 3 | WSP ECC "Paste Special"; WSP cheat sheet (most important); BIWS PDF | 1.3.4 | Challenge 3; liveness graders catch pasted values where a formula was required |
| E5 | AutoSum (Alt+=) for totals; select the block plus its empty edge and press once | 3 | WSP cheat sheet; TTS shortcuts videos; BIWS PDF | 1.6.2 | par times assume it |
| E6 | Replace nested IFs with MIN/MAX or a lookup; avoid volatile functions (OFFSET, INDIRECT, TODAY, NOW) in models | 3 | WSP FM guide; TTS 6 Principles; CFI Guidelines | 3.1.2, 3.4.6 | Ch3 project grader flags volatile functions |
| E7 | Avoid external workbook links; check for them before sending (Edit Links) | 3 | WSO first-year thread; WSO colour thread; TTS 6 Principles | 1.6.4 (stated), 3.7.3 | not gradable in-engine (single workbook); stated |
| E8 | Circularity only on purpose: iterative calc on, a circuit-breaker toggle, an IFERROR wrap | 3 | WSP FM techniques; TTS Core agenda; LESSON_FRAMEWORK §5 | 4.5.1 | Ch5 debt schedule grader |
| E9 | Scenario switches live in one model (CHOOSE/INDEX/XLOOKUP on a case toggle), never in copies of the file | 3 | WSP scenario article; TTS 5 Problems; TTS Core (case toggles) | 4.4.1 | Ch4 project |

## F. Checks and auditing

| # | Convention | Recurs | Sources | Taught | Enforced |
|---|---|---|---|---|---|
| F1 | A checks row/cell wherever two things must agree (report total = source total; balance sheet balances); checks summarised in one place, visible in frozen panes | 4 | WSP FM guide and seminar (automatic balance checks); TTS 6 Principles; CFI Guidelines; Macabacus course "balance check / model alert" | 1.7.2 | Ch1 Project; Ch5 |
| F2 | Never plug: cash is the balancing item, retained earnings is never forced | 2 | TTS "Balance your balance sheet"; WSP FM guide (direct calculations) | 5.3.3 | Ch5 project |
| F3 | Hardcode hunt before you send: Go To Special → Constants inside the formula block; show formulas (Ctrl+`); trace with Ctrl+[ and Ctrl+] | 5 | BIWS colour lesson (Go To Special to apply colours); WSO 15-things; WSO first-year; WSP cheat sheet (Ctrl+[ ] ~); TTS "Ensuring consistent formulas" | 1.2.4, 1.7.3 | Audit lessons in Ch1 §7, Ch3 §7, Ch5 §4 |
| F4 | Sense-check magnitudes: a 30% where 3% was expected is caught by eye before anyone else sees it; print or PDF the page and read it | 3 | M&I internship prep (print your work); WSO 15-things; WSO attention-to-detail | 1.7.1 | not gradable; stated in every Project brief |
| F5 | Read what Excel tells you: the Replace All count, the AutoSum proposal, the error code — each is a message | 2 | ours (LESSON_FRAMEWORK); WSP ECC "Excel Errors" | 1.3.5, 1.6.6 | Ch1 §6 lesson 6 |

## G. Presentation and delivery

| # | Convention | Recurs | Sources | Taught | Enforced |
|---|---|---|---|---|---|
| G1 | Print set-up is part of the model: landscape or portrait chosen, fit to page width, titles repeat, footer with file path, page, date | 3 | WSP FM guide; WSP ECC "Page Layout"; CFI Quick Start "Print Settings" | 1.7.1, 2.7.1 | Ch2 §7 |
| G2 | A page reads top-left to bottom-right the way an MD reads: title, units, timeline, inputs, then the answer; nothing important below the fold | 2 | TTS FMAAMOC Art. 1 (structure); CFI Guidelines (cover/outputs first) | 1.7.1, 2.3.1 | Ch2 project |
| G3 | Consistent abbreviations, footnotes and labels; attention to detail is the first thing you are judged on | 3 | M&I internship prep; WSO attention-to-detail; WSO 15-things | 2.3.4 | Ch2 project grader (labels present, units present) |

## What gets you told off on day one (the composite list, in the order sources raise it)

Not published as a list anywhere; assembled from the WSO first-year, 15-things and attention-to-detail threads, the M&I internship-prep article, and the TTS/CFI guideline documents. Each maps to a canon id so an Audit lesson can plant it.

1. A hardcode typed inside a formula (B4). 2. An input that is not blue, or a formula that is (B1). 3. A formula that breaks the pattern across its row (C3). 4. Merged cells (D7). 5. Inconsistent decimals or a stray minus where the house uses parentheses (D1, D2). 6. Unlabelled units (C5). 7. Gridlines and all-borders grids on a page going to a client (A3, D5). 8. A hidden column nobody knew about (C7). 9. A number that fails a sanity check (F4). 10. Not printing or PDF-ing before sending (F4, G1). 11. Using the mouse for everything (A5). 12. A stray external link (E7). 13. Undocumented hardcodes (B6). 14. Sheet7, Sheet8, "Copy of Model (2)" (A4, A6).

Chapter 1 §7 lesson 3 ("Hardcode hunt") plants items 1–8 on one sheet (item 4 as a title centred with padding spaces, since the engine cannot merge); Chapter 3 §7 and Chapter 5 §4 plant the rest as the material allows.

## Where the sources disagree (say so in the lesson)

- **Named ranges**: WSP's guide says avoid; TTS names key cells and case toggles. Teach: name toggles and a few key inputs, nothing else (C9).
- **Link colours**: green for other-sheet links is the majority; some houses use purple or leave links black. Teach green and say "your bank may differ; the point is that the palette is consistent" (B2).
- **Input fills**: BIWS uses yellow fill with a grey border; WSP and TTS mostly use blue font alone. Teach blue font as mandatory, fill as optional house style (B3).
- **Mouse removal vs QAT**: CFI and WSO push "no mouse"; BIWS and M&I push the QAT and never mention taking the mouse away. Teach keyboard-first with the QAT as the accelerator; the mouse rule bites only in timed play (A5, A2).
- **Calculation mode**: our current lesson sets Manual; the bootcamp pre-work says "understand the setting". Banks mostly leave Automatic on and switch to Manual for very large models. Teach the setting and the F9 habit; do not tell beginners to work in Manual (A1). This corrects the live `excel-options` lesson.

## Grader rules this canon implies (for LESSON_FRAMEWORK §5 and the Chapter 2+ engine)

- `roleColour(cell)`: a constant numeric cell in a graded input block must be blue; a formula cell must be black (or green when its only precedents are on another sheet). Enforced from Ch1 Challenge 1 for the cells the goal names, from Ch2 for whole sheets.
- `noLiteralInFormula(cell)`: a graded formula whose text contains a numeric literal other than 0, 1, -1, 100 or 12 fails (the exceptions cover sign flips, percentages and months). Enforced from Ch1 Challenge 6.
- `rowConsistent(range)`: every formula in the row is the same after R1C1 translation (the engine's `translateFormula` already exists). Enforced from Ch1 Challenge 6.
- `noMerge(sheet)`: the engine has no merge; Center Across Selection is the only route, so this is enforced by construction. State it anyway.
- `negativesParen(range)`, `decimalsConsistent(range)`, `totalsTopBorder(cells)`: format predicates on `fmtStyle`, `decimals`, `bt`. Enforced from Ch1 Challenge 5.
- `unitsLabel(sheet)`: a cell in rows 1–3 containing "USD", "$", "000s" or "thousands" (the Voltline workbooks are USD). Enforced from Ch1 Challenge 1.
- `checkCell(ref)`: a live formula evaluating to 0 (or TRUE) that references two blocks. Enforced from Ch1 Project.
- `noHidden(sheet)`: `hiddenCols`/`hiddenRows` empty; grouped outlines allowed (engine gap: grouping). Enforced from Ch1 Challenge 4.

## Sources

Wall Street Prep: Excel Crash Course page; Financial & Valuation Modeling Boot Camp seminar page; corporate training page; financial modeling guide; financial modeling techniques; Excel shortcuts cheat sheet; Center Across Selection article; scenario analysis with XLOOKUP. Training The Street: Applied Excel agenda PDF; Core Comprehensive agenda PDF; Undergraduate Boot Camp PDF; corporate Excel training page; FMAAMOC articles 1 and 2; 6 modeling principles; 5 common problems; custom number formatting; ensuring consistent formulas; speed hacks; organizing tabs; using the Alt key; absolute references; balance your balance sheet; built-in cell styles; Excel shortcuts video page. Breaking Into Wall Street: Excel & VBA course page; knowledge base (colour coding, data cleaning, INDEX/MATCH, interview practice test, IB shortcuts); shortcuts PDF; FAQ. Mergers & Inquisitions: internship preparation. CFI: Excel Fundamentals – Formulas for Finance; Excel Fundamentals – Quick Start Guide; Financial Modeling Guidelines PDF; Financial Modeling Code; what-if analysis; Excel modeling best practices; Center Across Selection; shortcuts PC/Mac; Excel eBook; Format a Financial Model with Macabacus course. Macabacus: keyboard shortcuts; formatting summary PDF; colour formatting blog. Wall Street Oasis: financial model formatting guide; "what I wish every first-year analyst knew"; Excel cheats megathread; colour conventions thread; 15 things I wish I knew; attention to detail; Excel formatting; PE modelling tips; "becoming a god at Excel". Financial Edge: essential shortcuts; formatting numbers.

URLs (as read on 2026-09-22):
- https://www.wallstreetprep.com/self-study-programs/excel-crash-course/
- https://www.wallstreetprep.com/seminar/financial-and-valuation-modeling/
- https://www.wallstreetprep.com/corporate/
- https://www.wallstreetprep.com/knowledge/financial-modeling/
- https://www.wallstreetprep.com/knowledge/financial-modeling-techniques/
- https://www.wallstreetprep.com/knowledge/excel-shortcuts/
- https://www.wallstreetprep.com/knowledge/center-across-selection-excel/
- https://www.wallstreetprep.com/knowledge/scenario-analysis-using-xlookup/
- https://trainingthestreet.com/wp-content/uploads/2024/01/TTS_Applied-Excel.pdf
- https://trainingthestreet.com/wp-content/uploads/2024/01/TTS_Core.pdf
- https://trainingthestreet.com/wp-content/uploads/2024/01/TTS_UG-Boot-Camp.pdf
- https://trainingthestreet.com/corporate-excel-training/
- https://trainingthestreet.com/planning-and-structuring-a-model-how-to-make-your-model-more-organized/
- https://trainingthestreet.com/fmaamoc-article-2-formatting-a-financial-model/
- https://trainingthestreet.com/6-modeling-principles-every-young-modeler-should-develop/
- https://trainingthestreet.com/five-common-problems-faced-by-modeling-clients-and-how-to-address-them/
- https://trainingthestreet.com/resources/custom-number-formatting-in-excel/
- https://trainingthestreet.com/resources/ensuring-consistent-excel-formulas/
- https://trainingthestreet.com/resources/excel-spreadsheet-speed-hacks/
- https://trainingthestreet.com/resources/organizing-workbook-tabs-in-excel/
- https://trainingthestreet.com/resources/using-the-alt-key/
- https://trainingthestreet.com/resources/creating-absolute-references/
- https://trainingthestreet.com/resources/balance-your-balance-sheet/
- https://trainingthestreet.com/built-in-cell-styles-excel/
- https://trainingthestreet.com/excel-short-cuts/
- https://breakingintowallstreet.com/excel-vba/
- https://breakingintowallstreet.com/kb/excel/how-to-color-code-in-excel/
- https://breakingintowallstreet.com/kb/excel/how-to-clean-data-in-excel/
- https://breakingintowallstreet.com/kb/excel/index-match-function-excel/
- https://breakingintowallstreet.com/kb/excel/excel-practice-test-for-interviews/
- https://breakingintowallstreet.com/kb/excel/investment-banking-excel-shortcuts/
- https://youtube-breakingintowallstreet-com.s3.amazonaws.com/BIWS-Excel-Shortcuts.pdf
- https://breakingintowallstreet.com/faq/
- https://mergersandinquisitions.com/investment-banking-internship-preparation/
- https://corporatefinanceinstitute.com/course/excel-fundamentals-formulas-for-finance/
- https://corporatefinanceinstitute.com/course/excel-fundamentals-quick-start-guide/
- https://cdn.corporatefinanceinstitute.com/assets/Financial-Modeling-Guidelines.pdf
- https://corporatefinanceinstitute.com/resources/financial-modeling/financial-modeling-code/
- https://corporatefinanceinstitute.com/resources/financial-modeling/what-if-analysis/
- https://corporatefinanceinstitute.com/resources/excel/study/excel-modeling-best-practices
- https://corporatefinanceinstitute.com/resources/excel/center-across-selection-excel-365
- https://corporatefinanceinstitute.com/resources/excel/excel-shortcuts-pc-mac/
- https://corporatefinanceinstitute.com/assets/CFI-Excel-eBook.pdf
- https://corporatefinanceinstitute.com/course/financial-model-formatting
- https://macabacus.com/excel/keyboard-shortcuts
- https://macabacus.com/assets/2024/09/Format-a-Financial-Model-with-Macabacus-Summary.pdf
- https://macabacus.com/blog/improving-model-readability-with-color-formatting
- https://www.wallstreetoasis.com/resources/financial-modeling/financial-model-formatting
- https://www.wallstreetoasis.com/forum/investment-banking/what-i-wish-every-first-year-analyst-knew
- https://www.wallstreetoasis.com/forum/investment-banking/excel-cheats-megathread
- https://www.wallstreetoasis.com/forum/investment-banking/financial-modeling-best-practices-color-conventions
- https://www.wallstreetoasis.com/forum/investment-banking/investment-banking-analyst-15-things-i-wish-i-knew
- https://www.wallstreetoasis.com/forum/investment-banking/attention-to-detail-fix
- https://www.wallstreetoasis.com/forum/investment-banking/excel-formatting
- https://www.wallstreetoasis.com/forum/private-equity/model-size-tips-other-modeling-tips-tricks
- https://www.wallstreetoasis.com/forum/off-topic/becoming-a-god-at-excel
- https://www.fe.training/free-resources/excel/essential-excel-shortcuts-financial-modeling/
- https://www.fe.training/free-resources/financial-modeling/financial-model-formatting-numbers/

Not reachable during research (noted, not cited): Reddit threads (blocked), TTS portal lesson lists (JavaScript-only), BIWS per-lesson titles, a Capital IQ shortcut guide.
