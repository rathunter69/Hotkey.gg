# hotkey.gg Script · Chapter 2: Formatting

The shell for Chapter 2 (Wolf, 2026-09-27: shell it, with the broader plan laid out first: screenplay section 5, "The six products" and "The skills, bucketed"). Every line here is **DRAFT** for Wolf's bucketing pass: the workbook, the finance the chapter teaches, seven story cards, and for each lesson its brief, its goals as one-liners and its done-screen line. Teach lines and stuck cues come after his markup, one module per batch, the way Chapter 1 went. The master is claude/screenplay.md; its Voice (section 2), case (section 4) and story rules (4.7: the company's own work, not prep for bankers) decide how this sounds. Anatomy and limits as Chapter 1: brief ≤ 5 sentences and ≤ 110 words ending "The key is `X`." · goal ≤ 140 characters, one imperative naming a cell, range, sheet, key or command · done screen one line then a paragraph · every lesson closes with "Does it tie?" · sentences with verbs, no stacked fragments.

**Ids.** Modules 2.1 and 2.2 exist in the repo from the earlier build; their lesson ids are kept as the live slugs, marked *(live id)* below, and the build session maps these lessons onto them. Lessons in 2.3–2.7 are new and carry proposed slugs.

## The chapter in brief

**Where the deal is.** The owners have hired advisers to run the sale, and the first document is the book: the information memorandum that describes the company to buyers. Its financials section is the company's to produce: three years of P&L, out of the accounting system and onto pages a buyer can read. The CFO asks for it; you build it.

**The product.** Three pages in the data room: the historical P&L (FY24A, FY25A, FY26E) at presentation quality, the FY26 monthly block, and a one-page summary linked from both. Every figure formatted, every line labeled, sources under the table, printing as one clean pack.

**What the learner can say afterwards.** How a car wash's P&L is built: retail and membership revenue; the cost of a wash (chemicals and water); the site costs (crew, rent, utilities, maintenance, card fees, marketing); site contribution; head office; EBITDA, and why it's the number a buyer prices from. What a margin is, what growth is, what FY26E means, and why a page states its sign convention once.

**The finance, defined through the car wash** (each term is defined in the sentence it first appears; this is the list and where):

  - **P&L** (2.1.1): what the company earned and spent over a year, top line to bottom line.
  - **Revenue lines** (2.1.1): retail (a driver pays per wash), membership (the Unlimited Wash Club pays a monthly fee), other (detailing, vending).
  - **Cost of a wash** (2.1.2): chemicals and water, what each car through the tunnel costs to clean. Revenue less that is **gross profit**.
  - **Site costs** (2.1.2): the crew, rent, utilities, maintenance, card fees and marketing a site pays whether or not a car comes through. What's left is the **site contribution**.
  - **Head office and EBITDA** (2.1.3): the people and systems above the sites; take them off and what's left is EBITDA (earnings before interest, tax, depreciation and amortization), the profit from running the washes before financing, tax and the tunnels wearing out, and the number every buyer prices from.
  - **Margin** (2.1.3): a line as a share of revenue. **Growth** (2.1.3): this year against last, as a percentage.
  - **Fiscal year, A and E** (2.1.4): the twelve months the accounts cover; A is actual, E is the estimate for the year still running.
  - **The book** (2.3.1): the information memorandum, the document that describes the company to buyers.
  - **Memo lines** (2.3.4): figures on the page that aren't dollars (sites, washes, revenue per wash).

## The workbook

Four sheets. The figures are in thousands of dollars and kept easy (Wolf); the build session fixes the exact values and the graders' expected states.

**P&L**: the raw export. Column A: account codes ("4010"). Column B: labels in capitals ("RETAIL WASH REVENUE"). C:E: FY2024, FY2025, FY2026 as text headers, figures in General format with stray decimals (18000.4), costs as positives, totals present as formulas from the system, no title, no units line, no margins block, gridlines on, every column 8.43 wide. Rows 7–24 by the end of the chapter:

| Row | Line | FY24A | FY25A | FY26E |
| :- | :- | :- | :- | :- |
| 7 | Retail wash revenue | 18,000 | 22,000 | 26,000 |
| 8 | Membership revenue | 14,000 | 17,500 | 22,000 |
| 9 | Other revenue | 1,000 | 1,500 | 2,000 |
| 10 | Total revenue | 33,000 | 41,000 | 50,000 |
| 13 | Chemicals and water | (3,960) | (4,920) | (6,000) |
| 14 | Labor | (6,600) | (8,200) | (9,500) |
| 15 | Rent | (4,200) | (5,100) | (6,000) |
| 16 | Utilities | (1,650) | (2,050) | (2,400) |
| 17 | Maintenance | (990) | (1,230) | (1,500) |
| 18 | Card fees | (660) | (820) | (1,000) |
| 19 | Marketing | (660) | (820) | (1,000) |
| 20 | Total site costs | (18,720) | (23,140) | (27,400) |
| 22 | Site contribution | 14,280 | 17,860 | 22,600 |
| 23 | Head office | (4,500) | (5,300) | (6,000) |
| 24 | EBITDA | 9,780 | 12,560 | 16,600 |
| 27–30 | Gross margin · Site contribution margin · EBITDA margin · Revenue growth | 88.0% · 43.3% · 29.6% · – | 88.0% · 43.6% · 30.6% · 24.2% | 88.0% · 45.2% · 33.2% · 22.0% |
| 33–35 | Sites (year end) · Washes (thousands) · Revenue per wash ($) | 28 · 2,400 · 13.75 | 34 · 2,950 · 13.90 | 40 · 3,600 · 13.89 |

End state: A1 title centered across A1:E1 ("Clearcoat Express - Historical Financials"), A2 units line in italic ("USD thousands unless stated; costs shown as negatives"), row 4 the timeline as real dates (12/31/2024…) formatted FY24A · FY25A · FY26E, row 5 the A/E flags, section headers in rows 6, 12, 26 and 32, totals bold with top borders, EBITDA with a double bottom, the A/E divider between D and E, margins in italic to one decimal, memo lines in their own formats, a source line in row 37, column A a narrow margin, labels in B, one width across C:E, gridlines off, print set-up done.

**Inputs**: B3 company name, B4 currency, B5 units ("thousands"), B6 the first fiscal year end (12/31/2024), B7:B9 the A/E flags (A, A, E), B10 the as-of date, B11 the source text. The dynamic titles in 2.6 read these.

**Monthly**: FY26 by month: labels in B, C:N the twelve months with text headers "2026-01" … "2026-12", O a total; the same lines as the P&L, one twelfth each with a seasonal tilt (summer up, winter down) so the block isn't flat. Arrives with the same faults as the P&L plus the text dates.

**Print**: the one-page summary: revenue, site contribution, EBITDA, EBITDA margin, sites and washes for the three years, every figure a link to P&L, built in 2.7.3.

## 2.1 Number formats

*module: number-formats (live)*

**Story card, title** **DRAFT** The P&L came out of the accounting system.

**Story card, body** **DRAFT** The owners have hired advisers to run the sale, and the first document is the book: the information memorandum that describes the company to buyers. Its financials section starts with three years of P&L, and what the accounting system exported is account codes in capitals, costs as positives and numbers to four decimal places. Before anyone reads it, the figures have to read like figures.

**Objective (data room)** **DRAFT** Number formats on a P&L: the desk number format and decimals by line, the sign convention stated once, currency and percent lines, real dates on the timeline.

**Page name** The P&L, formatted

### 2.1.1 Built-in formats on a P&L

*lesson: (live id) · 7 goals*

**Brief** **DRAFT** A P&L is what the company earned and spent over a year, top line to bottom line, and this one arrived as raw numbers: 18000.4 where a reader wants 18,000. Every line gets one format, set on the whole line at once: the desk number format from 1.5.1 for dollars in thousands (a separator, no decimals, a negative in parentheses), and the memo lines in their own formats. Ctrl+1 sets it on the Number tab and F4 repeats it; Ctrl+Shift+1, which shows a negative with a minus, is kept for the memo counts. The key is `Ctrl+1`.

**Goals (outline)** **DRAFT**

1.  Read the export: land on C7 and read 18000.4 in the formula bar, then Ctrl+↓ to see how far the figures run.
2.  Select the revenue lines C7:E10 and give them the desk number format: Ctrl+1, Number, 0 decimals, Use 1000 Separator, (1,234).
3.  Select the site-cost lines C13:E20 and F4 the same format onto them.
4.  Site contribution, head office and EBITDA, C22:E24, the same way.
5.  Sites C33:E33 are counts: Number, no decimals, no thousands separator.
6.  Washes C34:E34 are counts in thousands: Ctrl+Shift+1 then Alt, H, 9 twice (a count never goes negative, so no minus shows), and revenue per wash C35:E35 gets two decimals, dollars and cents.
7.  Does it tie? Change C7 to 18500 and watch total revenue C10 and EBITDA C24 answer in the format you set.

**Done screen, line** **DRAFT** Every line on the P&L now reads as figures, one format per line.

### 2.1.2 Sign convention: costs negative, stated once

*lesson: (live id) · 7 goals*

**Brief** **DRAFT** The export shows every cost as a positive, so a reader has to know which lines to subtract. On a page we show costs as negatives, in parentheses, and say so once at the top: then the page adds down and nobody guesses the signs. Chemicals and water are the cost of a wash; the crew, rent, utilities, maintenance, card fees and marketing are the site costs a site pays whether or not a car comes through. Paste Special Multiply from Chapter 1 flips a whole block in one paste. The key is `Ctrl+Alt+V`.

**Goals (outline)** **DRAFT**

1.  Type -1 in a spare cell, copy it, select the cost lines C13:E19 and Paste Special Multiply: every cost turns negative. Stop the selection at row 19: the total in row 20 is a formula, and paste arithmetic would rewrite it and flip it twice (1.3.4).
2.  Head office C23:E23 the same way, then clear the spare cell.
3.  The totals in C20:E20 and C24:E24 were built for positive costs: read C24 in the formula bar, open it with F2 and change the subtraction to an addition; to re-pick a cell, a second F2 switches the arrows from the caret to pointing (1.6.1).
4.  Fill the corrected formulas right across D24:E24 and D20:E20 with Ctrl+R.
5.  The desk number format shows a negative in parentheses: confirm C13 reads (3,960). A cell that reads -3,960 carries the chord's format, so give it Ctrl+1's.
6.  State it once: in A2, type USD thousands unless stated; costs shown as negatives, then italic.
7.  Does it tie? Type rent C15 as (4500), parentheses and all (Excel reads them as a minus, so you type a cost the way the page shows it), and watch site contribution C22 and EBITDA C24 fall.

**Done screen, line** **DRAFT** Costs read in parentheses, the page says so once, and the totals add straight down.

### 2.1.3 Currency and percent lines

*lesson: (live id) · 9 goals*

**Brief** **DRAFT** Head office is the people and systems above the sites; take it off site contribution and what's left is EBITDA (earnings before interest, tax, depreciation and amortization), the profit from running the washes before financing, tax and the tunnels wearing out, and the number every buyer prices from. A buyer reads it two ways: as dollars, and as a margin (a line as a share of revenue). Add the margins and growth block, format the percentages to one decimal in italic, and put the $ where it belongs: on the first and total rows only. The key is `Ctrl+Shift+5`.

**Goals (outline)** **DRAFT**

1.  Head the block: Margins and growth in B26, then the four labels B27:B30 as an Enter-and-↓ run.
2.  Gross margin C27 is revenue less chemicals over revenue: point =(C10+C13)/C10, then Ctrl+R across.
3.  Site contribution margin C28 =C22/C10 and EBITDA margin C29 =C24/C10, pointed and filled right.
4.  Put revenue growth in D30 as =D10/C10-1, fill it right to E30, and leave C30 as a dash (type - or let the format in 2.2 do it).
5.  Put the two-year CAGR in F30, =(E10/C10)^(1/(COLUMNS(C10:E10)-1))-1, compound annual growth and the one growth figure a buyer quotes, and label F29 CAGR. COLUMNS counts a range's columns, so the exponent counts its own periods, three columns less one, and no 2 gets typed. =RRI(COLUMNS(C10:E10)-1,C10,E10) is the same arithmetic with a name.
6.  Select C27:F30 and make them percentages to one decimal, then italic.
7.  The $ goes on the first and total rows: C7:E7, C10:E10 and C24:E24 as currency with no decimals.
8.  Revenue per wash C35:E35 is dollars and cents: currency, two decimals.
9.  Does it tie? Change membership revenue E8 to 24000 and watch EBITDA margin E29 and growth E30 move.

**Done screen, line** **DRAFT** The page now says what a buyer asks first: how much, and what share of revenue.

### 2.1.4 Dates on the timeline

*lesson: (live id) · 7 goals*

**Brief** **DRAFT** The column headers are text, "FY2024" typed by the system, and text can't be added to, compared or rolled forward. A fiscal year is the twelve months the accounts cover, and a timeline is real dates: the year-end of each, formatted to read the way the page wants. A is actual; E is the estimate for the year still running. Put real dates in row 4, format them, and add the A/E flags underneath, so the headers can write themselves in module 2.6. The key is `Ctrl+1`.

**Goals (outline)** **DRAFT**

1.  Type the three year-ends into C4:E4 as a Tab run: 12/31/2024, 12/31/2025, 12/31/2026.
2.  Read C4 in the formula bar, then press Ctrl+Shift+~ to see the serial number underneath, and Ctrl+Z.
3.  Format C4:E4 as dates from Ctrl+1's Date category: pick the mmm-yy style so they read Dec-24, Dec-25, Dec-26.
4.  Label the row: Fiscal year ending in B4, right-aligned over the dates.
5.  The flags: type A, A, E in C5:E5 as a Tab run, right-aligned, italic.
6.  Bold the timeline row 4 with Shift+Space and Ctrl+B.
7.  Does it tie? Change C4 to 12/31/2023 and watch the header read Dec-23; then Ctrl+Z.

**Done screen, line** **DRAFT** The timeline is real dates now, and the page can roll forward a year in one edit.

### 2.1.C Challenge: a raw P&L's numbers to standard

*lesson: (live id) · 6 goals · three minutes*

**Brief** **DRAFT** A fresh export, the San Antonio cluster's own P&L, with the same faults. Formats, signs, margins and dates, in three minutes.

**Goals (outline)** **DRAFT** The desk number format on the dollar lines · costs flipped negative with Paste Special and the totals corrected · the sign line in A2 · margins block to one decimal in italic · $ on the first and total rows · real dates in the timeline, formatted.

## 2.2 Custom number formats

*module: custom-number-formats (live)*

**Story card, title** **DRAFT** Every number on the page has to say what it is.

**Story card, body** **DRAFT** A buyer flips to the financials and reads margins, multiples and thousands without a legend, so the number format has to carry the unit. A format code can write k or m after a figure, show a zero as a dash, color a negative and turn a plain date into FY26E, with the value underneath untouched. This module is the format code, one section at a time.

**Objective (data room)** **DRAFT** Custom number formats: the four-section code, units in the format, custom date codes for the timeline, conditions and hidden zeros.

**Page name** The number-format set

### 2.2.1 The four-section format

*lesson: (live id) · 7 goals*

**Brief** **DRAFT** A number format is a code with up to four sections separated by semicolons (positive; negative; zero; text), and each section says how that kind of value shows. The desk number format you set in 1.5.1 is one such code, and you've been using it without reading it. Write your own: #,##0_) for a positive, (#,##0) for a negative, a dash for zero, and see the growth line's stray 0.0% become a dash without a formula changing. The key is `Ctrl+1`.

**Goals (outline)** **DRAFT**

1.  Open Ctrl+1 on C7, choose Custom, and read the code the desk number format wrote: #,##0_);(#,##0). 0 always prints a digit and # prints one only when there is one, which is why the code is #,##0; _) leaves a gap as wide as a closing bracket, so positives line up with negatives in parentheses.
2.  Type the four-section code #,##0_);(#,##0);"–"_);@_) into the Type box for C7:E24 and OK, so the _) in the positive, zero and text sections keeps every digit and dash in line with the bracketed negatives.
3.  Read C13: still (3,960); read a zero cell and see the dash.
4.  Apply the same code to the memo lines C33:E34 with F4.
5.  Write a percent version for C27:E30: 0.0%_);(0.0%);"–"_), so FY24's growth reads as a dash.
6.  Check the values didn't move: F2 on C30 shows what's really there, Esc.
7.  Does it tie? Change E9 to 0 and watch it read as a dash, then Ctrl+Z.

**Done screen, line** **DRAFT** One code with four sections, and the page decides how every kind of value reads.

### 2.2.2 Units in the format: k, m, x, bps

*lesson: (live id) · 7 goals*

**Brief** **DRAFT** The figures are in thousands, and a page that says so once at the top is fine, until a figure travels alone onto a slide or into an email. The unit can live in the format: a literal "k" after the number, "m" with a comma that divides by a thousand, "x" for a multiple, "bps" for a spread. The value stays a plain number that formulas can read; only the display carries the unit. The key is `Ctrl+1`.

**Goals (outline)** **DRAFT**

1.  Format the Print sheet's revenue line as thousands with a unit: #,##0"k" on Print!C5:E5.
2.  Show the same figures in millions to one decimal with #,##0.0,"m", where the comma before the quote divides by a thousand.
3.  Revenue per wash on P&L!C35:E35 as dollars with a unit: $0.00" /wash".
4.  A multiple: on Print, EBITDA margin stays a percent, but the memo "EV/EBITDA (illustrative)" cell takes 0.0"x".
5.  A spread in basis points: 0" bps" on the margin-change cell.
6.  Read one back with F2: the cell holds 26000, the format shows 26.0m.
7.  Does it tie? Change the value and watch the unit stay put.

**Done screen, line** **DRAFT** The unit rides in the format, so the number stays a number.

### 2.2.3 Custom date codes on the timeline

*lesson: (live id) · 6 goals*

**Brief** **DRAFT** The timeline holds real dates, and a custom date code can make them read the way the book does: FY24A, FY25A, FY26E. The code "FY"yy writes FY and the two-digit year from the date; the A or E comes from the flag row for now, and in 2.6 the header writes itself in one cell. Date codes: yy, yyyy, mmm, mmmm, d, dd. The key is `Ctrl+1`.

**Goals (outline)** **DRAFT**

1.  Select C4:E4 and set the custom code "FY"yy so they read FY24, FY25, FY26.
2.  Add the flag to the code for the actual years: "FY"yy"A" on C4:D4.
3.  And the estimate: "FY"yy"E" on E4.
4.  On Monthly, C4 is text "2026-01": type 1/31/2026 instead and format it mmm-yy, then fill the year across with Fill Series by month.
5.  Read Monthly!C4 in the formula bar: a date, not text; the header reads Jan-26.
6.  Does it tie? Roll the P&L forward: change C4 to 12/31/2025 and watch it read FY25A; Ctrl+Z.

**Done screen, line** **DRAFT** The headers read FY24A to FY26E, and every one of them is still a date underneath.

### 2.2.4 Conditional codes and hidden zeros

*lesson: (live id) · 7 goals*

**Brief** **DRAFT** A format section can carry a color and a condition: [Red] paints a negative, [<1000] applies a code only to small values, and an empty section hides a value altogether. Three semicolons and a cell shows nothing while still holding its number. Use them sparingly; the page's conventions do most of the talking. Here: red negatives on the checks row, a scaled code for the memo washes, and a hidden helper. The key is `Ctrl+1`.

**Goals (outline)** **DRAFT**

1.  The checks block reads zero when the page ties: give it 0_);[Red](0);"–"_) so a non-zero check paints itself red.
2.  Type a wrong figure over a check's input, see the red, Ctrl+Z.
3.  A scaled code on washes C34:E34: [<1000]0;#,##0, so small counts and thousands each read right.
4.  Hide the helper flags C5:E5 with ;;;, so the cells keep their A and E for formulas and the page stops showing them.
5.  Set them back to General and the flags show again.
6.  Tip from the desk: a 1/0 switch can read as a word and stay a number: the code "On";;"Off" (positive; negative; zero) shows On for a 1 and Off for a 0, and formulas still multiply by the cell. It returns on the breaker in 5.3.5 and the switches in 5.6.4 and 6.3.3.
7.  Does it tie? Change a cost and watch the check leave zero and turn red, then back.

**Done screen, line** **DRAFT** A format can color, scale and hide, and the value never moves.

### 2.2.C Challenge: the number-format set

*lesson: (live id) · 6 goals · three minutes*

**Brief** **DRAFT** A fresh export with a monthly block. Apply the set: the four-section code on dollars, the percent code, units on the summary, FY codes on the timeline, mmm-yy on the months, red on the checks.

**Goals (outline)** **DRAFT** Dollars · percents · units · FY headers · month headers · the checks' red.

## 2.3 The page a buyer reads

*module: the-page-a-buyer-reads*

**Story card, title** **DRAFT** The first page a buyer turns to.

**Story card, body** **DRAFT** The book, the information memorandum, is the document that describes the company to buyers, and its financials page is the one they turn to first. A page like that has an anatomy: a title that says what it is, a units line, a timeline, sections that add down to the answer, and a source under the table. Build it on the P&L the way the book will print it.

**Objective (data room)** **DRAFT** The anatomy of a financial page: title, units, timeline, sections and the answer; the actuals-to-estimates divider; borders that mean something; labels, footnotes and sources; widths and the label column; styles and Format Painter at scale.

**Page name** The P&L, presentation quality

### 2.3.1 Title, units, timeline, sections, answer

*lesson: title-units-timeline-answer · 8 goals*

**Brief** **DRAFT** A financial page reads top to bottom in one order: what it is, what it's in, when, the lines, the answer. The title in A1 says which company and which statement; the units line under it says the currency and the sign convention; the timeline is row 4; the sections are Revenue, Site costs, Site contribution, Head office, EBITDA. And EBITDA is the answer, so the page is built to land on it. Put the anatomy in place. The key is `Ctrl+B`.

**Goals (outline)** **DRAFT**

1.  Type the title in A1, Clearcoat Express - Historical Financials, then bold it and take it one size up.
2.  Center it across A1:E1 with Center Across Selection.
3.  The units line A2 is in place from 2.1.2: confirm it's italic and reads costs shown as negatives.
4.  Section headers: Revenue in B6, Site costs in B12, Margins and growth in B26, Memo in B32, each bold.
5.  Bold the answer lines: total revenue row 10, total site costs row 20, site contribution row 22, EBITDA row 24.
6.  Indent the sub-lines B7:B9 and B13:B19 once with Alt, H, 6.
7.  Clear the account codes in A7:A35, since they belong to the system and not to the page.
8.  Does it tie? Change C7 and watch C24 answer under the title.

**Done screen, line** **DRAFT** The page reads in the order a buyer reads it, and it lands on EBITDA.

### 2.3.2 Actuals vs estimates: the divider

*lesson: actuals-vs-estimates-divider · 6 goals*

**Brief** **DRAFT** Two of the three years happened; one is a forecast. A reader has to see the line between them without reading the flags, so the page carries a divider: a vertical border between the last actual and the first estimate, and a light shade on the estimate header. That's the one vertical border a page is allowed, and the one fill besides the input tint. The key is `Ctrl+1`.

**Goals (outline)** **DRAFT**

1.  Select D4:D35, the last actual column, and add a right border from Ctrl+1's Border tab.
2.  Shade the estimate header E4:E5 with the first fill tint.
3.  Check that the A/E flags in C5:E5 read right-aligned and italic, and set them if they don't.
4.  On Monthly, all twelve months are estimates: shade the whole header row C4:N4.
5.  Read the page: the eye finds the line between actual and estimate before reading a number.
6.  Does it tie? Change E7 and watch E24 answer on the estimate side of the line.

**Done screen, line** **DRAFT** One vertical line and one shade tell a reader what happened and what's forecast.

### 2.3.3 Borders that mean something

*lesson: borders-that-mean-something · 6 goals*

**Brief** **DRAFT** On a page, a border is a sentence: a top border says "this row adds up what's above", a double bottom says "this is the final answer", and a grid says nothing at all. The P&L has four totals and one answer. Give each the line it means, take off anything else, and turn the gridlines off so the borders are the only lines a reader sees. The key is `Alt H B`.

**Goals (outline)** **DRAFT**

1.  Top borders on the total rows: select B10:E10, Alt, H, B, P; then F4 on rows 20, 22 and 24.
2.  A double bottom on EBITDA: B24:E24, Ctrl+1, Border tab, the double line, bottom.
3.  The export left a grid over C7:E24: select it and remove every border with Alt, H, B, N, then Alt, H, B, P on row 10, F4 on rows 20, 22 and 24, and the double bottom on EBITDA through Ctrl+1 as its own action, because F4 repeats only the last single action.
4.  A thin bottom border under the timeline row 4.
5.  Gridlines off: Alt, W, V, G.
6.  Does it tie? Change C13 and watch the bordered totals answer.

**Done screen, line** **DRAFT** Every line on the page means something, and there are no lines that don't.

### 2.3.4 Labels, footnotes and sources

*lesson: labels-footnotes-sources · 7 goals*

**Brief** **DRAFT** The labels came out of the system in capitals; a buyer reads sentence case. Memo lines are figures that aren't dollars (sites, washes, revenue per wash), and they sit below the answer, labeled as memo. Every table carries a source line under it, in one line, and a footnote marker where a figure needs a word. Fix the labels by hand here; module 2.6 does it with formulas. The key is `F2`.

**Goals (outline)** **DRAFT**

1.  Retype B7 as Retail wash revenue in sentence case, Enter.
2.  Do B8:B9, B13:B19 and B23 the same way, sentence case and Tab-free, one at a time with F2 where only the case is wrong.
3.  The memo labels B33:B35: Sites (year end), Washes (thousands), Revenue per wash ($).
4.  A footnote marker: add (1) to the end of B9 with F2 and End.
5.  Type the source line in B37, Source: management accounts; FY24–FY25 audited; FY26 per the September budget, and set it italic.
6.  Type the footnote in B38, (1) Detailing and vending, and set it italic.
7.  Does it tie? Nothing here moves a number; change C7 and confirm C24 still answers.

**Done screen, line** **DRAFT** The labels read like English, and the page says where its numbers came from.

### 2.3.5 Widths and the label column

*lesson: widths-and-the-label-column · 6 goals*

**Brief** **DRAFT** A financial page has a shape: a narrow margin in column A, labels in B fitted to the longest one, and every figure column the same width. The export has 8.43 everywhere and codes in A. Set the margin, fit the labels, set one width across the years, and see why the period columns are set by hand and the label column by AutoFit. The key is `Alt H O W`.

**Goals (outline)** **DRAFT**

1.  Column A is the margin: width 2.
2.  Fit column B to its labels, not the title: select B6:B38 and AutoFit.
3.  One width across the years: select C:E and set 12.
4.  Row 1 a little taller: height 24.
5.  Read the units line and decide: wrap it if it runs long, and widen nothing.
6.  Does it tie? Change E7; the widths hold and E24 answers.

**Done screen, line** **DRAFT** The margin, the label fit and three equal columns give the page the shape every financial page has.

### 2.3.6 Cell styles and Format Painter at scale

*lesson: cell-styles-format-painter · 7 goals*

**Brief** **DRAFT** Monthly is the P&L twelve columns wide, and formatting it cell by cell would take the morning. Two tools carry a format from one place to many: Paste Special Formats on a whole block, which you know, and the Format Painter (Alt, H, F, P), which paints the active cell's format wherever you land next. Cell Styles (Alt, H, J) name a format so a page can use it by name. Dress Monthly from the P&L. The key is `Alt H F P`.

**Goals (outline)** **DRAFT**

1.  Copy one formatted figure column, P&L!C6:C24, and Paste Special Formats onto Monthly!C6:O24 in one paste: a one-column source tiles across, and the A/E divider on the P&L's column D stays behind. The label column takes its own Paste Formats from P&L!B6:B24.
2.  The title row: Format Painter from P&L!A1 onto Monthly!A1, then center the title across A1:O1.
3.  The margins block: Paste Formats from P&L!B26:E30 onto Monthly!B26.
4.  Save the total-row look as a style: select P&L!B10, Alt, H, J, New Cell Style, name it Total.
5.  Apply the Total style to Monthly's total rows by name.
6.  Read Monthly: it reads as the P&L's sibling, not its cousin.
7.  Does it tie? Change Monthly!C7 and watch Monthly!C24 answer in the borrowed format.

**Done screen, line** **DRAFT** One page formatted became the template for the next.

### 2.3.C Challenge: a three-year P&L to presentation quality

*lesson: challenge-pnl-presentation-quality · 7 goals · four minutes*

**Brief** **DRAFT** A fresh export, already formatted for numbers. Give it the anatomy: title, units, sections, borders, the divider, labels, source, widths.

**Goals (outline)** **DRAFT** Title centered · sections and answers bold · indents · four top borders and a double bottom, no grid · the divider and shade · sentence-case labels and a source line · margin, label fit, equal widths, gridlines off.

## 2.4 Alignment and structure

*module: alignment-and-structure*

**Story card, title** **DRAFT** Forty lines is too many to read.

**Story card, body** **DRAFT** By the time the site costs are broken out by line and the memo block is in, the P&L runs to forty rows, and a buyer wants the six that matter with the rest on demand. Outline levels fold the detail behind a button; indents show what belongs to what; a navigation column jumps a long sheet. The page stays complete and reads short.

**Objective (data room)** **DRAFT** Alignment and outline at scale: wrap, indent and Center Across Selection on a long page; grouping and outline levels; hiding against grouping against a separate sheet; a navigation column.

**Page name** The P&L, grouped and navigable

### 2.4.1 Wrap, indent, Center Across Selection at scale

*lesson: alignment-at-scale · 7 goals*

**Brief** **DRAFT** Alignment is the same three moves you know, done on a whole page at once: headers right over figures, sub-lines indented one level and sub-sub-lines two, long headers wrapped rather than widened, titles centered across the block. The Monthly page has twelve headers, three levels of lines and a title over fourteen columns. The key is `Alt H 6`.

**Goals (outline)** **DRAFT**

1.  Right-align every figure header at once: Monthly!C4:O4, Alt, H, A, R.
2.  Indent the revenue and cost sub-lines one level; indent the site-cost detail lines (a new level, rows 14–19) two.
3.  Wrap the long header in O4 (Full year) rather than widening the column.
4.  Center the title across A1:O1.
5.  The units line A2 italic, left, unwrapped.
6.  Read the hierarchy: section, line, detail, without a word added.
7.  Does it tie? Change C7 and watch O10 answer.

**Done screen, line** **DRAFT** Three levels of lines and fourteen columns got aligned in six moves.

### 2.4.2 Grouping and outline levels

*lesson: grouping-and-outline-levels · 7 goals*

**Brief** **DRAFT** The site-cost detail is seven rows a buyer wants on demand, not on the page. Group them and an outline button appears in the margin: press it and the seven rows fold to the total; press it again and they're back. Groups nest (a level for detail, a level for sections), and the outline symbols along the top switch every level at once. The key is `Alt+Shift+→`.

**Goals (outline)** **DRAFT**

1.  Select rows 13:19 whole and group them: Alt+Shift+→.
2.  Fold them with Hide Detail and read the page: site costs is one line now.
3.  Open the rows back up with Show Detail.
4.  Group the memo block rows 33:35 the same way.
5.  A second level: select rows 7:24 and group, so the whole P&L folds to its answer.
6.  Use the outline numbers at the top left to show level 1, then level 2, then everything.
7.  Does it tie? Fold the detail, change C13 through the fold with Go To, and watch C24 answer.

**Done screen, line** **DRAFT** The page reads short and stays complete, and a button decides which.

### 2.4.3 Hiding vs grouping vs a separate sheet

*lesson: hide-group-or-separate-sheet · 6 goals*

**Brief** **DRAFT** Three ways to get detail out of the way, and only one is right for each case. Hidden rows vanish and get forgotten: a reader who finds one wonders what else is hidden. Grouped rows fold and show a button, right for detail that belongs on the page. A separate sheet is right when the detail is a different page: the monthly block belongs on Monthly, not folded under the P&L. Decide for each block here. The key is `Alt H O U`.

**Goals (outline)** **DRAFT**

1.  Someone hid rows 26:30: select across them and unhide with Alt, H, O, U, O.
2.  Group the same rows instead, so they fold behind a button rather than vanish.
3.  A month-by-month block was pasted under the P&L at row 41: cut it and paste it onto its own sheet, Monthly detail.
4.  Delete the now-empty rows 40:55 on the P&L.
5.  Read the P&L with everything folded: title, timeline, answer, memo.
6.  Does it tie? Change C7; C24 answers with nothing hidden.

**Done screen, line** **DRAFT** Nothing is hidden, the detail is grouped and the other page has its own sheet.

### 2.4.4 A navigation column for a long sheet

*lesson: navigation-column · 6 goals*

**Brief** **DRAFT** Monthly detail runs to sixty rows once the site-level lines are in, and a reader shouldn't scroll to find the EBITDA line. A navigation column is a short list at the top of the sheet: each entry a hyperlink to a named block, so one click or one Enter lands you there, and Ctrl+G with the name does the same. Name the blocks, list them, link them. The key is `Ctrl+K`.

**Goals (outline)** **DRAFT**

1.  Name the blocks: Define Name on the revenue block as Rev, site costs as SiteCosts, EBITDA as EBITDA.
2.  List them in Q4:Q6 as Revenue · Site costs · EBITDA.
3.  Ctrl+K on Q4: Place in This Document, pick Rev, OK.
4.  Q5 and Q6 the same way.
5.  Jump by name with Ctrl+G, EBITDA, Enter; then back with Ctrl+Home.
6.  Does it tie? Follow the EBITDA link, change an input, watch the total.

**Done screen, line** **DRAFT** Three links at the top make a sixty-row sheet read like a short one.

### 2.4.C Challenge: a flat P&L into a grouped, navigable one

*lesson: challenge-grouped-navigable · 6 goals · three minutes*

**Brief** **DRAFT** A flat forty-row P&L. Align it, group the detail on two levels, unhide what someone hid, move the stray block to its own sheet, add a navigation column.

**Goals (outline)** **DRAFT** Headers right, sub-lines indented · detail grouped · a second level · hidden rows found and grouped · stray block on its own sheet · three named links.

## 2.5 Conditional formatting

*module: conditional-formatting*

**Story card, title** **DRAFT** Make the page flag its own mistakes.

**Story card, body** **DRAFT** The book will be read by people looking for a reason to pay less, so the page has to catch its own errors before they do. A conditional format is a rule the cell applies to itself: a check that isn't zero turns red, a negative margin highlights, an exception stands out. Used well it's a second pair of eyes, and used badly it's wallpaper, so this module is about learning the difference.

**Objective (data room)** **DRAFT** Conditional formatting: highlight rules for negatives and exceptions; formula-driven rules; data bars and scales, and when not to use them; managing the rules.

**Page name** The checks that flag themselves

### 2.5.1 Highlight rules: negatives, exceptions

*lesson: highlight-rules · 6 goals*

**Brief** **DRAFT** Conditional formatting is a rule a range applies to itself, and the built-in rules cover most of what a page needs: less than, greater than, between, equal to, duplicate values, and the Top/Bottom rules (Alt, H, L, T) for the top 10% or everything above the average. Highlight a negative margin, a month under a threshold, a duplicate label, and choose the format a reader will understand, not the loudest one. The key is `Alt H L`.

**Goals (outline)** **DRAFT**

1.  Select the margin lines C27:E29 and add a rule: Less Than 0, red text.
2.  On Monthly, give revenue under 3,800 in C10:N10 a light fill, so the slow months show up.
3.  Duplicate labels in B7:B35: Highlight Duplicate Values, then fix the duplicate it finds.
4.  Read a rule back: Alt, H, L, R opens Manage Rules; see the three, Esc.
5.  Test one: type -1 over C27's input, see the red, Ctrl+Z.
6.  Does it tie? Change a slow month to 4,000 and watch its fill clear.

**Done screen, line** **DRAFT** With three rules in, the page points at its own soft spots.

### 2.5.2 Formula-driven rules: a check that isn't zero turns red

*lesson: formula-driven-rules · 6 goals*

**Brief** **DRAFT** The built-in rules ask about the cell's own value; a formula rule can ask anything. The checks row should turn red when a check isn't zero (=B40<>0), and a whole row can highlight when the flag at its left says so. Write the rule once with the right anchors and it applies across the range like any formula. The key is `Alt H L N`.

**Goals (outline)** **DRAFT**

1.  Select the checks C40:E42 and add a rule: Use a formula, =C40<>0, red fill.
2.  Test it: type over an input, watch the red, Ctrl+Z.
3.  A row rule: select B7:E9 and highlight the row whose flag in A says x, =$A7="x". A formula rule is written for the top-left cell of the selection and evaluated in every cell as if it had been filled: prove it first with a rule that is always true, =TRUE, which lights the whole range, then put the anchored test in its place.
4.  Anchor the column, not the row, so the rule follows each row.
5.  Read both rules in Manage Rules and set which applies first.
6.  Does it tie? Break a check, see red; fix it, see it clear.

**Done screen, line** **DRAFT** The check turns red before anyone else sees it.

### 2.5.3 Data bars and scales, and when not to

*lesson: data-bars-and-scales · 5 goals*

**Brief** **DRAFT** Data bars and color scales draw a chart inside the cells, and on a working sheet they can show a shape in a second. On a page in the book they're decoration: a buyer reads figures, not bars. Learn to add them so you know what they do, then take them off the page and keep one on a working sheet. The key is `Alt H L D`.

**Goals (outline)** **DRAFT**

1.  Put data bars on Monthly's revenue line C10:N10 with Alt, H, L, D, the first style, and read the seasonal shape.
2.  Put a color scale on C13:N13 and read what it tells you.
3.  Take both off the printed page: Clear Rules from Selected Cells.
4.  Keep one set of bars on the Monthly detail working sheet, where nobody prints.
5.  Does it tie? Change a month and watch the bar on the working sheet resize.

**Done screen, line** **DRAFT** Bars stay on the working sheet; the page gets figures.

### 2.5.4 Managing rules

*lesson: managing-rules · 5 goals*

**Brief** **DRAFT** Rules pile up, overlap and outlive the ranges they were written for, and a page with six rules nobody remembers is a page nobody trusts. Manage Rules lists them, shows their ranges, lets you edit, reorder, stop-if-true and delete. Tidy the rules on the P&L to the two the page needs. The key is `Alt H L R`.

**Goals (outline)** **DRAFT**

1.  Open Manage Rules for This Worksheet and read the list.
2.  Delete the duplicate-values rule from 2.5.1, now that the labels are fixed.
3.  Edit the negative-margin rule's range to C27:E30.
4.  Move the checks rule to the top and tick Stop If True.
5.  Does it tie? Break a check and confirm only the checks rule fires.

**Done screen, line** **DRAFT** Two rules remain, both named and both where you'd look for them.

### 2.5.C Challenge: the checks flags on a model

*lesson: challenge-checks-flags · 5 goals · three minutes*

**Brief** **DRAFT** A model with a checks block and no rules, plus three stray rules someone left. Make the checks flag red, highlight the exception rows, strip the decoration, tidy the list.

**Goals (outline)** **DRAFT** Formula rule on the checks · a row rule from the flag column · the bars removed · the stray rules deleted · the order set.

## 2.6 Dates and text for presentation

*module: dates-and-text-for-presentation*

**Story card, title** **DRAFT** The headers should write themselves.

**Story card, body** **DRAFT** Every quarter the page rolls forward a year, and every time someone retypes the title, the headers and the units line. And one of them is wrong. A title that reads the company name from Inputs, headers that read the dates under them, a units line that reads the currency: change one cell and the whole page updates. The Monthly sheet, with its text dates and capitalized labels, is where to learn it.

**Objective (data room)** **DRAFT** Text and date functions for presentation: TEXT for labels and headers; EOMONTH and EDATE for period ends; dynamic titles with &; cleaning imported labels with TRIM, PROPER and SUBSTITUTE; a units and period line that writes itself.

**Page name** The header block that writes itself

### 2.6.1 TEXT for labels and headers

*lesson: text-for-labels · 6 goals*

**Brief** **DRAFT** TEXT turns a value into words in a format you choose: =TEXT(C4,"mmm-yy") gives Dec-24 as text, =TEXT(C10,"#,##0") gives 33,000 with its comma. A header built with TEXT reads from the date under it, so it can never disagree with it. Build Monthly's month labels from its dates, and a row of "FY24A"-style labels from the P&L's timeline and flags. The key is `=`.

**Goals (outline)** **DRAFT**

1.  In Monthly!C3, =TEXT(C4,"mmmm yyyy"), Enter; read January 2026.
2.  Fill it right to N3.
3.  On P&L, build the book's header in row 3 with ="FY"&TEXT(C4,"yy")&C5 and fill it right to read FY24A, FY25A, FY26E.
4.  Read C3 in the formula bar: text built from a date and a flag.
5.  Now TEXT a number in Print!B8: ="Revenue of "&TEXT('P&L'!E10,"#,##0")&"k in FY26E" (a sheet name with an & in it takes single quotes when you type it, and pointing writes them for you).
6.  Does it tie? Change P&L!E5 to A and watch the header read FY26A; Ctrl+Z.

**Done screen, line** **DRAFT** The header reads the date under it, so they can never disagree.

### 2.6.2 EOMONTH and EDATE for period ends

*lesson: eomonth-edate · 6 goals*

**Brief** **DRAFT** A timeline is a chain: each period end is the last day of the month a step after the one before. EOMONTH(date, n) gives the last day of the month n months on; EDATE gives the same day n months on. Build Monthly's twelve month-ends from one typed date, and the P&L's year-ends from the first, so rolling the page forward is one edit. The key is `=`.

**Goals (outline)** **DRAFT**

1.  Leave Monthly!C4 typed as 1/31/2026, put =EOMONTH(C4,1) in D4 and read Feb 28.
2.  Fill D4 right to N4: twelve month-ends from one date.
3.  On P&L, C4 reads Inputs!B6; D4 =EOMONTH(C4,12), filled to E4.
4.  An EDATE for a mid-month date: in Inputs, the as-of date plus 3 months.
5.  Format the results as dates where they lost it.
6.  Does it tie? Change Inputs!B6 to 12/31/2025 and watch every header on both sheets roll forward.

**Done screen, line** **DRAFT** One typed date drives every header on two sheets.

### 2.6.3 Dynamic titles with &

*lesson: dynamic-titles · 6 goals*

**Brief** **DRAFT** The & joins text to text, so a title can be built from cells: the company name on Inputs, the statement name, the period from the timeline. Change the name once and every page's title follows. Build the P&L, Monthly and Print titles from Inputs, and a period line that reads the first and last dates. The key is `&`.

**Goals (outline)** **DRAFT**

1.  In P&L!A1 type =Inputs!B3&" - Historical Financials" and Enter, and it still centers across A1:E1.
2.  In Monthly!A1 type =Inputs!B3&" - FY26 by month".
3.  In Print!A1 type =Inputs!B3&" - Summary financials".
4.  A period line on Print!A3: ="Fiscal years "&TEXT('P&L'!C4,"yyyy")&" to "&TEXT('P&L'!E4,"yyyy").
5.  Read one back with F2 and Esc.
6.  Does it tie? Change Inputs!B3 to Clearcoat Express Holdings and watch three titles change; Ctrl+Z.

**Done screen, line** **DRAFT** Three titles read one source, so a name change is one edit.

### 2.6.4 Cleaning imported labels: TRIM, PROPER, SUBSTITUTE

*lesson: cleaning-imported-labels · 7 goals*

**Brief** **DRAFT** Monthly detail's labels came in the way exports do: capitals, double spaces, an underscore where a space belongs. Three functions clean them without retyping: TRIM strips stray spaces, PROPER capitalizes each word, SUBSTITUTE swaps one piece of text for another. Build the clean label beside the dirty one, then paste values over the original. The key is `=`.

**Goals (outline)** **DRAFT**

1.  In C7 beside the label RETAIL_WASH  REVENUE, =PROPER(TRIM(SUBSTITUTE(B7,"_"," "))), Enter.
2.  Fill it down the label column.
3.  Read one, Retail Wash Revenue: sentence case wants a lowercase w, so fix the pattern with LOWER on all but the first letter or accept title case for a working sheet, and say why in the note.
4.  Copy the clean labels and Paste Special Values over B7:B40.
5.  Now delete the helper column.
6.  A label with a footnote marker: SUBSTITUTE the (1) out of it for the clean copy.
7.  Does it tie? Nothing here moves a number; change C10 and confirm the total answers.

**Done screen, line** **DRAFT** One formula and one paste cleaned forty labels.

### 2.6.5 A units and period line that writes itself

*lesson: units-and-period-line · 6 goals*

**Brief** **DRAFT** The units line has been typed on every page so far. Build it once from Inputs (currency, units, the sign convention) and point every page's A2 at it, so the day the book goes to euros or millions is one edit. Then the period line, from the first and last date on the timeline. The key is `&`.

**Goals (outline)** **DRAFT**

1.  Inputs!B12: =B4&" "&B5&" unless stated; costs shown as negatives".
2.  P&L!A2 =Inputs!B12; Monthly!A2 and Print!A2 the same.
3.  Italic on all three, left-aligned.
4.  Period line on P&L!A3 (if row 3 is free) from the timeline with TEXT and &.
5.  Change Inputs!B5 to millions and watch three pages say so; Ctrl+Z.
6.  Does it tie? Change Inputs!B4 to EUR; three lines change; Ctrl+Z.

**Done screen, line** **DRAFT** The header block reads Inputs, and the page can't disagree with itself.

### 2.6.C Challenge: the dynamic header block

*lesson: challenge-dynamic-header-block · 6 goals · three minutes*

**Brief** **DRAFT** A three-sheet model with typed titles, text dates and dirty labels. Make the header block write itself from Inputs.

**Goals (outline)** **DRAFT** Titles from Inputs with & · headers from dates with TEXT · month-ends with EOMONTH · the units line from Inputs · labels cleaned with TRIM, PROPER, SUBSTITUTE · one edit rolls the model forward.

## 2.7 Printing and page layout

*module: printing-and-page-layout*

**Story card, title** **DRAFT** The book goes to print.

**Story card, body** **DRAFT** The financials section is three pages, and the book is a PDF that gets printed, so each page has to land on one sheet, carry its title rows, say which file and which page it is, and break where a reader would break. The one-page summary reads from the detail behind it. Set the pack up to print and it's ready for the data room.

**Objective (data room)** **DRAFT** Printing at pack scale: print areas, titles, fit to width, headers and footers; print preview and page breaks; the one-page summary linked from the detail.

**Page name** The pack, print-ready

### 2.7.1 Print areas, titles, fit to width, headers and footers

*lesson: print-areas-titles-footers · 8 goals*

**Brief** **DRAFT** Chapter 1 set one page to print; a pack needs the same on every sheet, and Monthly is wider than a page. A print area says which cells print; fit to one page wide lets a wide sheet run down two pages tall; print titles repeat the header rows on each; the footer carries the file, the page number and the date on every sheet. The key is `Alt P S P`.

**Goals (outline)** **DRAFT**

1.  Set the P&L's print area to A1:E38: Alt, P, R, S.
2.  Landscape on the P&L and Monthly; portrait on Print.
3.  Monthly: fit to 1 page wide by 2 tall.
4.  Print titles on Monthly: rows 1:5 repeat.
5.  Footer on every sheet: &[File] left, Page &[Page] of &[Pages] center, &[Date] right, set once with all three sheets selected. While the title bar shows Group, anything typed lands on all three sheets: move to Inputs, the sheet outside the group, and confirm the tag has gone before the next edit (4.3.6 has the rule).
6.  Header: the company name from the title, right.
7.  Margins: on Page Setup's Margins tab tick Center on page, Horizontally, and keep the Header margin smaller than the Top margin so the header can't print over the title row; check the page in Ctrl+F2.
8.  Does it tie? Ctrl+F2 on each sheet; every one reads as a page.

**Done screen, line** **DRAFT** Three sheets share one footer, so every page knows which file it came from.

### 2.7.2 Print preview and page breaks

*lesson: print-preview-page-breaks · 6 goals*

**Brief** **DRAFT** Page Break Preview shows the sheet as the printer will cut it, with the breaks as blue lines you can move. Monthly's second page should start at the site-cost detail, not halfway through a block. Read the breaks, insert one where a reader would turn the page, and check the result. The key is `Alt W I`.

**Goals (outline)** **DRAFT**

1.  Alt, W, I: Page Break Preview on Monthly. Read where the automatic break falls.
2.  Land on row 12, Alt, P, B, I: a manual break above the site costs.
3.  Remove a stray break someone left: Alt, P, B, R.
4.  Back to Normal view: Alt, W, L.
5.  Ctrl+F2: page 1 ends on total revenue, page 2 starts on site costs.
6.  Does it tie? Change C7 in preview, Esc, and see O10 answer.

**Done screen, line** **DRAFT** The page breaks where a reader would turn it.

### 2.7.3 The one-page summary linked from the detail

*lesson: one-page-summary · 7 goals*

**Brief** **DRAFT** The first page of the section is the summary: six lines, three years, no detail, and every figure a link to the P&L behind it, so the summary can never disagree with the detail. Build Print from links, format it to the standard, and set it to print portrait on one page. The key is `Ctrl+PgDn`.

**Goals (outline)** **DRAFT**

1.  Labels on Print!B5:B10: Revenue · Site contribution · EBITDA · EBITDA margin · Sites · Washes (thousands).
2.  Point Print!C5 at P&L!C10 across sheets; Ctrl+Enter a row of links for C5:E5.
3.  Rows 6–10 the same way, from rows 22, 24, 29, 33 and 34.
4.  Green on every link; the formats from the P&L by Paste Formats.
5.  Headers C4:E4 from the P&L's row 3 by link.
6.  Portrait, fit to one, the footer as the others.
7.  Does it tie? Change P&L!E7 and watch Print!E5 and E7 answer.

**Done screen, line** **DRAFT** Every one of the six lines is a link, so the summary can't disagree with the detail.

### 2.7.C Challenge: a three-sheet model prints as a clean pack

*lesson: challenge-print-pack · 6 goals · three minutes*

**Brief** **DRAFT** Three sheets, no print set-up. Areas, orientation, fit, titles, footers, breaks: a pack a reader can print without thinking.

**Goals (outline)** **DRAFT** Print areas on all three · orientation by sheet · Monthly fit 1 wide · titles · one footer everywhere · the break above site costs.

## 2.8 Project and assessment

*module: ch2-project-and-assessment*

**Story card, title** **DRAFT** The financials section, start to finish.

**Story card, body** **DRAFT** A fresh export has landed: the same accounting system, the same faults, a different three years. Everything the chapter taught goes onto one workbook, until three pages are ready for the data room. Build it, then build it again on the clock, because the assessment is the test-out.

**Objective (data room)** **DRAFT** The historical financials section built end to end from a raw export; the assessment is the test-out.

**Page name** The historical financials section

### 2.P Project: the historical financials section

*lesson: ch2-project · about 16 goals · no clock*

**Outline** **DRAFT** Formats by line · signs flipped and stated · margins and growth block · real dates with FY codes · the four-section format set · title, sections, indents, borders, divider · labels, footnote, source · margin column, label fit, equal widths · detail grouped on two levels · a navigation column · the checks rule · dynamic title, headers and units line from Inputs · month-ends from EOMONTH · Print built from links · print set-up on all three · Does it tie?

### 2.A Assessment: the section on fresh figures

*lesson: ch2-assessment · about 16 goals · ten minutes · hard clock, no help, keyboard only*

**Outline** **DRAFT** The same section on a different company's three years (a sister operator in the same case world, so the lines are familiar and the figures aren't), sized by start state and end state: raw export in, three presentation-quality pages out. Pass is Verified; this is also the test-out.

## Keys this chapter teaches

From screenplay 10.3, rows 2.1–2.7: Ctrl+1 and its Number, Alignment, Border and Fill tabs; Ctrl+Shift+1, 4, 5 and 3; Alt, H, 9 and 0; Alt, H, K; the custom code editor; Alt, H, B and the double bottom; Alt, H, H; Alt, H, F, C; Alt, H, 6 and 5; Alt, H, W; Center Across Selection; Alt+Shift+→ and ←, Alt, A, H and J, Ctrl+8; Alt, H, O, U, O; Ctrl+K; Define Name and Ctrl+G by name; Alt, H, L (N, H, D, R, C); TEXT, EOMONTH, EDATE, &, TRIM, PROPER, SUBSTITUTE, LOWER; RRI, and COLUMNS as a period count (2.1.3); Ctrl+;; Alt, H, F, P; Alt, H, J; Alt, P, R, S; Alt, P, S, P; Alt, P, I; Alt, W, I; Alt, P, B, I and R; Alt, W, L; Ctrl+F2; Ctrl+PgDn with the browser alias.

## Open for Wolf's bucketing pass

  - 2.3 has six lessons; 2.7 has three. Rebalance, or leave: the anatomy module is the heart of the chapter and the print module is short by nature.
  - 2.6.4's sentence-case question (PROPER gives Title Case; the page wants Sentence case): teach the LOWER trick, or accept Title Case on the working sheet and retype the page's labels by hand in 2.3.4 as written.
  - The A/E divider (2.3.2) is the one vertical border a page allows and the one fill besides the input tint; confirm that's the standard he wants taught.
  - Cell Styles (2.3.6): keep, or drop in favor of Paste Formats and Format Painter only (styles are rare on desks).
  - Where the checks block lives on the P&L (rows 40–42 assumed) and what the three Chapter 2 checks compare: total revenue to the sum of lines; the P&L's FY26 to Monthly's full year; Print to P&L.
  - Mechanics the engine needs for this chapter (to become M-requests when the shell locks): custom number-format codes with sections, conditions and colors; the A/E right border; Cell Styles; Format Painter; conditional-formatting rules with formula type and Manage Rules; outline levels and the outline symbols; hyperlinks to a named place; print areas, fit-to-wide, page-break preview and manual breaks; TEXT, EOMONTH, EDATE, TRIM, PROPER, SUBSTITUTE, LOWER; sheet-group selection for a shared footer.
  - Source pass (2026-09-30): the fold-back plan in claude/source-checklist.md (section H) is applied to this chapter as DRAFT: 27 edits, plus the CAGR exponent that counts its own periods in 2.1.3 (held item G081, pulled back). Wolf's calls of that day are in the decision log (screenplay 11); what was held back stays listed in the checklist's section B.

## Built differently

- Layout: buildPage puts the source in B36 and the checks block in B38:C40 (two checks, C39 and C40), not rows 37 and 40 to 42; the second check compares FY26E revenue to Monthly's full year.
- Check labels read "Revenue less its lines" and "Last year less Monthly" (short enough to sit under the label column's fit in 2.3.5, and never starting with Total, which the sheet standard reads as a total row); the revenue check is wrapped in ROUND so the ledger's decimals never leave it a hair off zero.
- 2.1.1: sites take the desk number format with F4 (washes with them) instead of Number without a separator; reading the formula bar is folded into the teach and the closer.
- 2.1.2: the spare cell for the -1 is G19; site contribution C22 and EBITDA C24 are retyped as additions (C20 stays a SUM) rather than edited with F2; the confirm-C13 goal is dropped and "(4500)" lives in the closing.
- 2.1.3: the $ rows take currency through Ctrl+1 then C, not Accounting; CAGR counts its periods with COLUMNS, since RRI is not in the engine.
- 2.1.4: the serial-reading goal is dropped (the teach says it), and the flags are typed in one goal and set right and italic in the next.
- 2.2.1: codes use a plain hyphen for zero and no text section; the $ rows get the $ code after the plain code; the read-back goals are dropped.
- 2.2.2: the units live on Inputs (multiple B13 retyped as 12 then 0.0x, bps B14, millions B15, k B16) and revenue per wash on the P&L, not on Print; the millions code is typed with its m in quotes.
- 2.2.3: Monthly's month ends arrive as bare serials and take Ctrl+1 then D plus a right-align goal, since Fill Series has no month step in the engine.
- 2.2.4: the switch is Inputs B12, and the wrong-figure demo is the closer; General is taught here, bringing the hidden flags back.
- 2.1.C: the cluster varies by seed across four Texas clusters, not always San Antonio. 2.2.C: seven goals (the $ rows split from the plain code), units on Inputs B15, and only the revenue check, since a cluster has no Monthly to tie to.
- On the R1 engine, Format Cells walks replace the old Ctrl+1 letter picker (Number, Currency, Date mmm-yy, General, Custom), and revenue per wash in 2.1.1 takes Ctrl+Shift+1's #,##0.00, as Excel writes it.
- 2.3.1: the codes are cleared from A4:A35 (the ACCOUNT header with them), the typed figures and memo counts turn blue, and the checks block takes the anatomy too (header bold, lines indented).
- 2.3.2: the divider runs D4:D35 and the shade is the gray header swatch; the sheet standard now allows that one right border down one column.
- 2.3.3: the planted grid is an all-borders on the lines of C7:E24; the thin bottom under the timeline is dropped, since the standard allows only a total's top border and the double bottom.
- 2.3.4: the source line sits in B36 and the footnote in B37 (the checks start at B38); the source reads "Source: management accounts; FY24 and FY25 audited; FY26 per the September budget".
- 2.3.5: B is fitted over B4:B35, and the panes freeze at C5 in the same lesson.
- 2.3.6: Monthly arrives with the analyst's plain title, labels, sections, margins block, source and two checks (rows 31 to 35), costs already flipped; Paste Formats tiles P&L!C6:C24 across C:O and the full-year formulas go back to black; the Total cell style goal waits on an engine New Cell Style.
- 2.4.1: the site-cost lines keep one indent (no second level), and the headers go bold as well as right.
- 2.4.2: one outline level (the engine's outline has no second), so the 7:24 group and the level buttons are out; the groups are 13:19 and 33:35.
- 2.4.3: the stray block is Monthly detail's top eighteen rows (title, headers, the Austin cluster) at P&L rows 41 to 58, cut onto a new sheet at A1.
- 2.4.4: Monthly detail runs to 75 rows (four clusters, a company block, source, checks); the names cover the company block's revenue, site costs and EBITDA rows; the navigation column is Q4 (Go to) and Q5:Q7 as text, with no hyperlinks until the engine has Ctrl+K.
- 2.5.1: the duplicate-values rule is not in the engine, so the duplicate label (B18 reads Marketing) is found by reading; the slow-month threshold is 3,800 with a yellow fill.
- 2.5.2: the checks rule is on C39:C40 (=C39<>0, light red); the row rule reads an x planted in P&L!A8, and its Does it tie clears the x so the page keeps no flag.
- 2.5.3: the bars stay on Monthly detail's company revenue row. 2.5.4: the row rule is the one deleted (no duplicate-values rule exists).
- 2.6.1: the month names go in Monthly!C5:N5 (row 3 stays blank), the FY labels in Print!C4:E4 rather than a P&L row 3, and the TEXT headline in Inputs!B19.
- 2.6.2: Monthly!C4 stays typed (1/31/2026, blue); the EDATE is Inputs!B18, the next update three months after the as-of date. 2.6.3: Print's period line is B4, over its labels.
- 2.6.4: the clean labels are PROPER's Title Case (accepted for a working sheet), with EBITDA retyped by hand. 2.6.5: the units line lives on Inputs!B17, since B12 holds the switch; no P&L period line.
- 2.7.1: Page Setup is one per workbook in the engine: landscape, one page wide by two tall, rows 1:5 repeating, the footer, centered horizontally; no print area, no portrait Print and no custom header.
- 2.7.2: the engine has no Page Break Preview or manual breaks, so the lesson leaves the state as 2.7.1 left it and waits on that mechanic.
- 2.7.3: Print's six lines are rows 5 to 10, with its own source and one check (EBITDA against the P&L), the divider and the shade.
- Challenges 2.3.C to 2.7.C: a seeded Texas cluster's figures over S2d, S3f, S4d, S5d and S7C (the finished pack with no print set-up), plus each module's faults: the grid; the hidden margins and the stray block; three stray rules and an x flag; text month heads; nothing printed.
- Project and assessment: the project is the same export a year on (FY25A, FY26A, FY27E, 46 sites); the assessment lays a seeded sister operator's figures over it. Both solve through one builder, with the navigation names on Monthly, since neither has a Monthly detail sheet.
