# hotkey.gg Script · Practice: drill sketches

Rough specs for the drills that came out of the source pass, written 2026-09-30 so the code layer has more to build from than a title. Wolf's call that day: the drill ideas in claude/source-checklist.md (section D) are good, and this session should sketch them while it still holds the context. Every line is **DRAFT**. The master for the practice layer is the screenplay, section 6: its rules (6.0) apply to everything here, and its catalog (6.1, 6.2) lists the drills planned before this pass. This doc adds to that catalog; it replaces nothing.

## How to read a sketch

Each sketch has the same six fields.

  - **Header line.** The drill's name and slug, the lesson it comes after, its time class, its wave and the source row it came from (D01–D93, the rows of the checklist's section D in order).
  - **Task.** The one line on the drill card and the start screen, in the clipped register of 6.0.
  - **Sheet.** The start state: what is on the sheet, which cells are filled and which are empty. Ranges are indicative. The build session fixes the cells and the seeded figures.
  - **Goals.** One line per goal, separated by a mid dot, each ticking when it lands. Wording is rough; the goal lines get written with the chapter's script.
  - **Grades.** What the grader reads on the end state. Any route that reaches it passes.
  - **Route.** The reference route the pars are set from (Pass about 2×, Expert 1.4×, Legendary 1.1×). A route is a way to set pars, never a requirement.

## Rules these sketches follow

  - Clearcoat data, no story, graded on the end state, keyboard only for a personal best: the rules of screenplay 6.0, unchanged.
  - **Layout.** Every drill's solved sheet follows the sheet standard (screenplay section 5; M86), the same skeleton the lesson pages use: the title in A1, the units line in A2, headers in row 4, figures from row 5, labels in column A in Chapter 1 and in column B from Chapter 2 on. Inputs are blue and typed; formulas are black; cross-sheet links are green. The ranges in the sketches are indicative, and the build fits them to the skeleton.
  - **Shelling.** Build the solved sheet first and cut the start state from it by emptying only the graded cells, so labels, inputs, widths and formats are already there (the shelling notes in the checklist, section H). No answer boxes: nothing on the sheet marks where the answer goes; the goal line and the pulse do that.
  - **Time classes.** 60, 90, 120, 150 or 180 seconds is the Pass par the sketch is sized for. Two sketches are marked **long** (about five minutes): they sit with the challenges on Practice (6.3) and are never drawn by the Daily.
  - **Pickers.** Where a drill asks for a judgment (is it revenue, which line moves), the answer cell is a validated list (4.2.4) and the grader reads the value picked. Alt+↓ opens the list, ↑ or ↓ moves through it and Enter picks. A drill that comes before 4.2.4, where drop-downs are taught, says so on its start screen. No free-text answers anywhere, because the grader can't read a sentence.
  - **What-if grading.** Where a typed number and a formula give the same value on the seed, the grader changes an input, recalculates and reads the answer again, then puts the input back (mechanics request M84). The sketches say "what-if" where this is needed.
  - **Stretch drills.** Six sketches drill something no lesson teaches, because the lesson-level item was held back to keep Chapters 5 and 6 in proportion. Each carries one rule line on its card, is Pro, sits off the path and is never drawn by the Daily. They are marked **stretch** and the rule line is given.
  - **Waves.** Wave 1 (24 drills) are the ones worth building with their chapter: a taught skill the planned six don't cover, cheap to seed. Wave 2 (41) is the bench: built after launch, or as each chapter's extra set. The wave is Claude's call and easy to change. On 2026-10-01 the three Chapter 1 sketches (Combine two tabs, Insert and amend, Before you send) moved into Chapter 1's resized set (screenplay 6.1) and are built in R1; the counts in the table below are from before that.

## The count

| Chapter | New sketches | Wave 1 | Wave 2 | Stretch | Long | Planned drills given a spec here |
| :- | :- | :- | :- | :- | :- | :- |
| 1 Foundations (free) | 3 | 2 | 1 | – | – | – |
| 2 Formatting | 3 | 2 | 1 | – | – | 2 (custom code, print it) |
| 3 Formulas | 7 | 2 | 5 | 1 | – | 2 (text split, the fiscal-half puzzle) |
| 4 Data and Lookups | 5 | 2 | 3 | – | – | 1 (sort and filter) |
| 5 Finance and Accounting | 32 | 10 | 22 | 4 | 2 | 3 (schedule fill, balance it, sweep) |
| 6 Valuation | 15 | 6 | 9 | 1 | – | 4 (spread a comp, median and range, sources and uses, waterfall) |
| **Total** | **65** | **24** | **41** | **6** | **2** | **12** |

The 93 source ideas land as: 71 in the 65 new sketches (six sketches merge two ideas), 15 folded into 12 drills the screenplay already plans, 5 parked with the add-ons (screenplay 4.10), 1 held for the engine and 1 dropped. The full map is at the end.

## Chapter 1 · Foundations (free)

#### Combine two tabs *combine-two-tabs*

After 1.6.4 · 120 s · In 6.1, built in R1 · D40

  - **Task** Add Austin and San Antonio cell by cell on Combined, without typing a number.
  - **Sheet** Three tabs with one layout, in this order: Combined, Austin, SanAntonio. Labels in A5:A9 (Washes, Revenue, Cost of washes, Site costs, Site contribution), Mon–Fri in B:F. On Combined, B5:F9 is empty and unformatted.
  - **Goals** B5 adds the same cell on both tabs, pointed · the formula filled across and down to F8 · Site contribution in B9:F9 rebuilt on Combined from its own rows · the block's formats pasted from Austin.
  - **Grades** B5:F8 are formulas reading the matching cell on both tabs; B9:F9 read Combined's rows only; number formats match Austin's block; no typed numbers.
  - **Route** =, Ctrl+PgDn, arrows, +, Ctrl+PgDn, arrows, Enter; select, Ctrl+R, Ctrl+D; copy Austin's block, Alt, E, S, T.

#### Insert and amend *insert-and-amend*

After 1.6.1 · 90 s · In 6.1, built in R1 · D42

  - **Task** Add a Utilities line to the site costs and get it into the total, borders intact.
  - **Sheet** A cost block: Labor, Rent, Maintenance, Card fees in A4:A7, the total in row 8 written as pointed additions with a top border, Mon–Fri in B:F. A Utilities row of figures waits in A12:F12.
  - **Goals** A row inserted above Card fees and Utilities moved into it · the total opened with F2, switched to Point with a second F2, and the new row added · the amended formula carried across with Paste Special, Formulas · the total row's border and bold unchanged.
  - **Grades** Every total includes the Utilities row; Utilities sits inside the block; the waiting row, now row 13, is empty; the total row's format is as it started.
  - **Route** Shift+Space, Ctrl+Shift+=; Ctrl+X, Enter; F2, F2, +, ↑, ↑, Enter; Ctrl+C, select, Alt, E, S, F. Needs M65 and M68.

#### Before you send *before-you-send*

After 1.7.3 · 120 s · In 6.1, built in R1 · D47

  - **Task** The report goes to the CFO in two minutes. Clear the internal notes and the stray formats, and leave every tab on A1.
  - **Sheet** Report, Costs and Raw. Five notes on Report: three start "Source:", two are internal ("check with ops"). An emptied block H5:J9 still carries fills and borders. Costs is scrolled with the cursor at D40.
  - **Goals** The two internal notes cleared and the three sources kept · H5:J9 cleared of formats · every tab on A1 and Report in front.
  - **Grades** Exactly the three source notes remain; H5:J9 carries no format; the active cell is A1 on each sheet and the first tab is active; nothing else changed.
  - **Route** F5, Alt+S, Notes to find them; on each internal note's cell, Alt, H, E, M; select H5:J9, Alt, H, E, F; Ctrl+Home on each tab. Needs M68.

## Chapter 2 · Formatting

#### Dollars to thousands *ch2-to-thousands*

After 2.1.2 · 60 s · Wave 1 · D41

  - **Task** The export is in dollars and the page is in thousands. Divide the typed cells by 1,000 and leave the formulas alone.
  - **Sheet** A P&L block in B5:E14: typed revenue and cost lines in dollars, two subtotal formulas inside the block, a total, and a check row (the total less its parts) reading zero. G2 holds a typed 1000, and the units line in A2 reads "USD unless stated".
  - **Goals** Only the typed numbers selected (Go To Special, Constants) · divided by the copied 1000 in one Paste Special · the subtotals still plain formulas · the units line changed to "USD thousands unless stated".
  - **Grades** Typed cells equal the seed ÷ 1,000; the formula cells' text is unchanged (not rewritten as =(SUM(…))/1000, which is what pasting over them does); the check reads zero; A2's text.
  - **Route** Ctrl+C on G2; select the block; F5, Alt+S, O, Enter; Alt, E, S, I, Enter. Needs M68.

#### Flip and tie *ch2-flip-and-tie*

After 2.1.2 · 120 s · Wave 1 · D24, D70

  - **Task** The costs arrived as positives with someone else's formats. Make them the page's: negative, subtotals rebuilt, tied to the accounts.
  - **Sheet** A sister cluster's export in B5:E16: revenue and cost lines all positive, mixed fonts and fills, and the three subtotal rows holding pasted values. The accounts' site contribution typed in G16, blue. A check cell in G17, empty.
  - **Goals** The stray formats cleared from the block · the cost rows' signs flipped in one Paste Special · the three subtotals rebuilt with Alt+= · the check: site contribution less the accounts' figure, reading zero.
  - **Grades** Cost cells negative with the seed's magnitudes; subtotals are SUM formulas; the check is a live difference at zero; no fill or odd font left in the block.
  - **Route** Alt, H, E, F; −1 in a spare cell, Ctrl+C, select the cost rows, Alt, E, S, M; Alt+= on each subtotal; = and point for the check.

#### Rule the row *ch2-rule-the-row*

After 2.5.2 · 120 s · Wave 2 · D43

  - **Task** One rule shades every wash over the threshold, whole row. Another shades the estimate columns.
  - **Sheet** Two tabs. Transactions: a list in B5:F24 (date, site, package, ticket, channel) with the threshold in I2, blue. P&L: year-end dates across C4:G4, lines below, the as-of year-end in I3, blue.
  - **Goals** A formula rule on B5:F24 that shades the whole row when the ticket beats I2 · a formula rule on the P&L's period columns that shades every column after the as-of year.
  - **Grades** Rule one anchors the column on the ticket and both ways on the threshold (=$E5>$I$2); rule two anchors the header row only (=C$4>$I$3); what-if on both inputs moves the shading to match the reference.
  - **Route** Select; Alt, H, L, N; Use a formula; type the test; Format; Enter. Needs M71, M84.

### Planned Chapter 2 drills given a spec by a source idea

  - **Custom code** *ch2-custom-code* (D44). Second seed: a multiples column where the first row carries an x and the rest don't. Two codes so every decimal lines up, brackets included: 0.0x_);(0.0x) on the first row and 0.0_x_);(0.0_x) below, with a zero check beside them that reads as a dash. Grades: codes that render the same as those two, and the dash.
  - **Print it** *ch2-print-it* (D46). Second seed: the ninety-row export. One page wide and as many tall as it needs, the header row repeating, centered on the page, the footer carrying the file, page x of y and the date, and a header margin smaller than the top margin so nothing collides with the first row (2.7.1).

## Chapter 3 · Formulas

#### Override *ch3-override*

After 3.1.4 · 120 s · Wave 1 · D51

  - **Task** Ops can overrule the POS count for a day. Read the override when it's a number, flag it when it's a note, and keep the ratio from erroring.
  - **Sheet** Six sites in rows 5–10: POS washes in C, an override column D (blue: one number, one "closed", the rest empty), washes used in E (empty), revenue in F, revenue per wash in G (empty). One site has no washes and no override.
  - **Goals** Washes used: the override when it's a number, "Hold" when it's text, the POS figure otherwise, filled down · revenue per wash with NM where it can't be computed · the total of washes used.
  - **Grades** Column E ties for all six rows and again after a what-if types a new override; G reads NM on the two rows that can't divide; each column is one formula filled down.
  - **Route** =IF(ISNUMBER(D5),D5,IF(ISTEXT(D5),"Hold",C5)); =IFERROR(F5/E5,"NM"); Ctrl+D; Alt+=.

#### Part year *ch3-part-year*

After 3.2.4 · 90 s · Wave 2 · D52

  - **Task** Three sites open mid-year. Revenue in the opening year is a mature site's year times the part of the year they're open.
  - **Sheet** Three sites with opening dates in C5:C7 (blue; Cedar Park 9/8/2026 is one), the fiscal year-end in F2 and a mature site's annual revenue in F3, both blue. Fraction in D, opening-year revenue in E and a day-count check in G, all empty.
  - **Goals** The fraction of the year open with YEARFRAC, filled down · opening-year revenue · a check of each fraction against days ÷ 365, reading zero to two decimals.
  - **Grades** D and E tie; F2 and F3 are anchored; the checks are formulas and read zero.
  - **Route** =YEARFRAC(C5,$F$2); =$F$3*D5; =ROUND(D5-($F$2-C5)/365,2); Ctrl+D.

#### Method selector *ch3-method-selector*

After 3.1.2 · 120 s · Wave 2 · D53

  - **Task** Forecast head office for FY27 by the method the selector names. With the selector empty, hold the dollars flat.
  - **Sheet** Revenue, head-office cost and its share of revenue for FY24–FY26 in C5:E7, FY27 revenue in F5, and F6 empty. A blue selector in H2 takes 1, 2, 3 or empty, with its key beside it: 1 for last year's share, 2 for the three-year average, 3 for the two-year average.
  - **Goals** F6 written as one IFS with TRUE as the last test.
  - **Grades** F6 ties at 1, 2, 3 and with the selector empty (what-if on all four). Any single formula that passes all four is accepted.
  - **Route** =IFS($H$2=1,E7*F5,$H$2=2,AVERAGE(C7:E7)*F5,$H$2=3,AVERAGE(D7:E7)*F5,TRUE,E6).

#### SUMPRODUCT proof *ch3-sumproduct-proof*

After 3.3.5 · 90 s · Wave 2 · D56

  - **Task** Retail revenue for one site and one package by SUMPRODUCT, proved against SUMIFS.
  - **Sheet** A ninety-row list in B5:F94 (date, site, package, member flag, amount; every amount a number). A site picker in I2 and a package picker in I3. I5, I6 and I7 empty.
  - **Goals** I5 by SUMPRODUCT with two tests multiplied into the amounts · I6 by SUMIFS · I7 the difference, reading zero.
  - **Grades** Both answers tie at the seed and after a what-if on both pickers; I7 is a live difference.
  - **Route** =SUMPRODUCT((C5:C94=I2)*(D5:D94=I3)*F5:F94); =SUMIFS(F5:F94,C5:C94,I2,D5:D94,I3); =I5-I6.

#### Bands *ch3-bands*

After 3.3.2 · 90 s · Wave 1 · D57

  - **Task** Count the tickets under, between and over two thresholds. The three bands have to add up to every ticket.
  - **Sheet** Tickets in F5:F94. The band labels in H6:H8 name the two edges, $15 and $20. Band counts I6:I8 empty; COUNT of the column given in I10; a check in I11, empty. One ticket sits exactly on 20 and several on 15.
  - **Goals** The three band counts, each comparison typed in quotes · the check: the bands less COUNT, reading zero.
  - **Grades** The bands sum to COUNT with each edge value counted once; all formulas; the check is a live difference.
  - **Route** =COUNTIF(F5:F94,"<15"); =COUNTIFS(F5:F94,">=15",F5:F94,"<20"); =COUNTIF(F5:F94,">=20"); =SUM(I6:I8)-I10.

#### NPV three ways *ch3-npv-three-ways*

After 3.5.2 · 120 s · Wave 2 · D58

  - **Task** Value the new-site case three ways, and pick the one that's wrong.
  - **Sheet** The Chapter 3 new-site case: years 0–5 across C4:H4 with year-end dates in row 5, the flows in row 6 (the capex in year 0), the rate in K2. Three answer cells K5:K7 and a picker in K8 listing the three methods.
  - **Goals** NPV over all six flows · the capex added outside NPV · XNPV on the dates · the odd one out picked.
  - **Grades** The three values tie; the second and third agree to within a few dollars (year-end dates, one leap year); the picker names the first method, which discounts every flow a year too far.
  - **Route** =NPV(K2,C6:H6); =C6+NPV(K2,D6:H6); =XNPV(K2,C6:H6,C5:H5); Alt+↓.

#### Any of three *ch3-any-of-three* (stretch)

After 3.3.5 · 150 s · Wave 2 · D63

  - **Card rule** COUNTIF against a short list counts every match. A day with two matches is still one day: cap each row at 1.
  - **Task** Count the days any new hire was on shift, each day once.
  - **Sheet** A thirty-day roster in B5:E34: the date and three attendant codes a day (A01–A12; roles, never names). The three new hires' codes in H5:H7; no day has all three of them. A helper column F, empty. Four answer cells I2:I5.
  - **Goals** The days one attendant worked · a per-row flag capped at 1, summed, for the days any new hire worked · the uncapped total · the difference: the extra matches, one for each day two of them shared.
  - **Grades** I2:I5 tie; the helper is one formula filled down; the difference equals the shared days.
  - **Route** =COUNTIF(C5:E34,H5); =MIN(1,SUMPRODUCT(COUNTIF(C5:E5,$H$5:$H$7))), Ctrl+D, SUM; =SUMPRODUCT(COUNTIF(C5:E34,H5:H7)). Needs M75 to cover COUNTIF against a list.

### Planned Chapter 3 drills given a spec by a source idea

  - **Text split** *ch3-text-split* (D59). Second seed: codes in three parts, cluster-site-lane (AUS-DOM-2). The lane comes from FIND started one past the first hyphen, with RIGHT and LEN: three helper cells first, then one formula that survives codes of any length. Grades: the lane ties on codes of three different lengths, and the final column is one formula that reads no helper.
  - **The fiscal half** *puzzle-ch3* (D62). A second part for the puzzle: every POS date gets the end date of the lead buyer's fiscal half (June 30 or December 31) from EOMONTH and a MOD offset, with no IF: =EOMONTH(d,MOD(6-MONTH(d),6)). The test dates are June 30, July 1, December 31 and January 1. A second column does quarters with MOD(3-MONTH(d),3). Grades: both columns tie on every date, and neither formula holds an IF.

## Chapter 4 · Data and Lookups

#### Output grid *ch4-output-grid*

After 4.1.4 · 120 s · Wave 2 · D25

  - **Task** One formula fills the whole page: any metric for any site, by name.
  - **Sheet** Sites tab: eight metric tags down B5:B12, six site codes across C4:H4, the figures between. Output tab: the site codes down B5:B10, the metric tags across C4:J4, C5:J10 empty.
  - **Goals** C5 as INDEX with a MATCH on the metric and a MATCH on the site, anchored to fill both ways · filled across the forty-eight cells.
  - **Grades** All forty-eight tie; one formula across the grid; it still ties after a what-if re-sorts the metric rows on Sites.
  - **Route** =INDEX(Sites!$C$5:$H$12,MATCH(C$4,Sites!$B$5:$B$12,0),MATCH($B5,Sites!$C$4:$H$4,0)); select, Ctrl+R, Ctrl+D.

#### Six tabs *ch4-six-tabs*

After 4.3.6 · 90 s · Wave 1 · D45

  - **Task** Put the same units line and check row on all six site tabs at once, then fix one site's typo without touching the others.
  - **Sheet** Six site tabs with one layout, then Summary. The units line in A2 and the check row 12 are empty on all six. Mueller's title in A1 reads "Muller".
  - **Goals** The six tabs grouped, the units line typed once and the check row entered once · the group released · Mueller's title fixed on Mueller only.
  - **Grades** A2 and C12:G12 are identical on all six tabs; no group at the end; Mueller!A1 is right and the other five titles are untouched, which is the trap.
  - **Route** Ctrl+Shift+PgDn five times; type; =C10-SUM(C5:C9), Ctrl+R; Ctrl+PgDn to Summary; back to Mueller, F2. Needs M70.

#### Two pickers *ch4-two-pickers*

After 4.1.4 · 90 s · Wave 1 · D48

  - **Task** A site picker and a month picker return washes from the cube, and the answer survives an inserted row.
  - **Sheet** The cube: sites down B6:B11, months across C5:N5, washes between. A site picker in Q2 and a month picker in Q3. Q5 is empty; Q6 holds a colleague's version with typed positions.
  - **Goals** Q5 as INDEX with two MATCHes on the pickers · a row inserted inside the cube and a column inside the months, with the answer still right.
  - **Grades** The answer ties to the picked site and month on the end state, after the inserts, and after a what-if on both pickers; the formula carries no typed position.
  - **Route** =INDEX(C6:N11,MATCH(Q2,B6:B11,0),MATCH(Q3,C5:N5,0)); Shift+Space, Ctrl+Shift+=; Ctrl+Space, Ctrl+Shift+=.

#### Pick a window *ch4-pick-a-window*

After 4.3.3 · 120 s · Wave 2 · D49

  - **Task** Total member washes between two dates the reader picks, and say which window it is.
  - **Sheet** A daily summary in B5:D94 (date, member washes, retail washes), a blue start date in H2 and end date in H3, and H5 and H6 empty.
  - **Goals** H5 as SUMIFS on the date window, both ends included · H6 a label built with & and TEXT that names the two dates.
  - **Grades** H5 ties with both edge dates counted, and after a what-if moves the dates; H6's text follows the two cells.
  - **Route** =SUMIFS(C5:C94,B5:B94,">="&H2,B5:B94,"<="&H3); ="Member washes, "&TEXT(H2,"mmm d")&" to "&TEXT(H3,"mmm d").

#### Ask the pivot *ch4-ask-the-pivot*

After 4.4.2 · 180 s · Wave 2 · D61

  - **Task** Four buyer questions, one pivot. Rearrange it and give each answer.
  - **Sheet** Chapter 4's Export, one row for each site and day (date, site, retail washes, member washes, total washes, retail revenue, hours open), and a Pivot sheet with a PivotTable already placed (sites down, total washes summed). A Q&A block: four questions in B5:B8 and four blue answer cells, the site answers as validated lists. The questions: the busiest site by total washes · the site with the fewest member washes · the date with the most retail revenue · Domain's share of all member washes.
  - **Goals** One per answer.
  - **Grades** The four answers match the reference (the share within a tenth of a point). The route is free: a learner who answers with SUMIFS passes, and the pars are set from the pivot route, which is faster.
  - **Route** Alt, J, T to the field list; swap total washes for member washes; move the date to rows and retail revenue to values; Show Values As, % of Column Total for the share; read and enter each answer.

#### Decode it *ch4-decode-it* (held for the engine)

After 4.1.8 · 120 s · D50

  - **Task** A colleague built these two lookups out of text. Rewrite both as INDEX/MATCH.
  - **Sheet** Two cells on Summary: one with INDIRECT and an R1C1 string built from two MATCHes, one with INDIRECT wrapped around ADDRESS.
  - **Grades** No INDIRECT or ADDRESS left; both values tie; the new formulas' precedents reach the Lists sheet.
  - **Why held** M72 lists INDIRECT with R1C1 text and ADDRESS as Reference rows that aren't simulated. Build this only if the engine comes to evaluate them.

### Planned Chapter 4 drills given a spec by a source idea

  - **Sort and filter** *ch4-sort-and-filter* (D60). Second seed: a copy of the export sorted by site and then by retail revenue, largest first; Subtotal (Alt, A, B) adds a sum at each change in site; a check ties the grand total to SUM of the original export. Grades: the sort order, a SUBTOTAL(9) row for each site, and the check live at zero. It needs the Subtotal command in the engine.

## Chapter 5 · Finance and Accounting

Thirty-two sketches in three groups: the accounting of 5.1, the model of 5.2–5.5, the DCF of 5.6. The accounting drills run on one site and one month, the way 5.1 does; the model drills run on a cut-down copy of the operating model (Cover, Inputs, Schedules, the three statements, Checks), FY24A–FY31E across C:J.

### The accounting (5.1)

#### Is it revenue? *ch5-is-it-revenue*

After 5.1.3 · 60 s · Wave 1 · D01

  - **Task** Eight lines of money came in this month. Mark what's revenue and total it.
  - **Sheet** Eight inflows in B5:B12 with amounts in C: retail washes · member fees earned this month · vending and vacuums · an insurance payout for a damaged arch · interest on the bank balance · card settlement received for last month's washes · a loan drawn · member fees billed for next month. A picker in D for each (Revenue · Other income · Not income). Two totals, C14 and C15, empty.
  - **Goals** A class picked for each line · revenue totaled with SUMIF on the picks · other income the same way.
  - **Grades** The eight picks (revenue: the first three; other income: the payout and the interest; not income: the settlement, the loan and the fees billed ahead); both totals are SUMIFs and tie.
  - **Route** Alt+↓, ↓ to the item, Enter, down the column; =SUMIF(D5:D12,"Revenue",C5:C12).

#### Which date? *ch5-which-date*

After 5.1.2 · 120 s · Wave 2 · D02

  - **Task** A member pays on the 20th. Chemicals are ordered, delivered and paid for on three dates. Put the revenue and the cost in the right month and the balances on the right day.
  - **Sheet** The facts in B5:C11, blue: a $30 fee paid September 20 for a thirty-day term, the term in its own cell; chemicals ordered September 5, delivered September 12 ($2,625) and paid October 12. Answer cells in F5:F10.
  - **Goals** September's revenue from the fee · deferred revenue at September 30 · the date the chemical cost lands, picked (Ordered · Delivered · Paid) · the payable at September 30 · the payable at October 31.
  - **Grades** $10 earned and $20 deferred, as formulas on the fee and the dates; the picker reads Delivered; the payable is $2,625 and then nil.
  - **Route** The fee times the days earned over the term, each read from its cell; its complement; Alt+↓; links to the delivery.

#### Used, not bought *ch5-used-not-bought* (stretch)

After 5.1.2 · 90 s · Wave 2 · D03

  - **Card rule** Where stock is held, cost of sales is what was used: opening stock, plus deliveries, less the closing count.
  - **Task** Three deliveries and two stock counts. What did the month's washes use?
  - **Sheet** Opening stock, three deliveries and the closing count in C5:C9, blue; a deliveries total in C10 (given, and there to tempt); revenue in C11. Cost of sales, gross profit and gross margin in C13:C15, empty.
  - **Goals** Cost of sales from the counts · gross profit · gross margin, one decimal, italic.
  - **Grades** The three cells tie and are formulas; cost of sales is not the deliveries total.
  - **Route** =C5+SUM(C6:C8)-C9; =C11-C13; =C14/C11, Ctrl+Shift+5, Alt, H, 0, Ctrl+I.

#### Capitalize or expense *ch5-capitalize-or-expense*

After 5.3.4 · 90 s · Wave 2 · D04

  - **Task** A new site's shopping list. For each line: depreciate it, expense it now, or never depreciate it, and say which line of the P&L it hits.
  - **Sheet** Seven items in B5:B11 with amounts in C: tunnel equipment · the land, on a site Clearcoat buys outright · signage · grand-opening flyers · a one-year POS software license · crew wages · the first chemical delivery. Two pickers a row: treatment in D (Depreciate · Expense now · Never depreciated), line in E (Cost of sales · Site cost · Depreciation · None). Two totals, empty: capitalized, and the first full year's depreciation at twenty years.
  - **Goals** The seven treatments · the seven lines · the capitalized total, land included · the year's depreciation.
  - **Grades** The fourteen picks (equipment and signage depreciate; land never; the other four are expensed now, the chemicals to cost of sales and the rest to site costs); the two totals are SUMIFs on the picks and tie.
  - **Route** Alt+↓ down both columns; =SUMIF(D5:D11,"<>Expense now",C5:C11) for what's capitalized; =SUMIF(D5:D11,"Depreciate",C5:C11) over the life on the sheet.

#### Ten facts, one statement *ch5-ten-facts*

After 5.1.1 · 180 s · Wave 2 · D05

  - **Task** A new site's first year in ten facts. Three of them don't belong on an income statement. Build it to net income.
  - **Sheet** Ten facts in B5:C14, blue: washes, ticket, cost per wash, site costs, the $2,500k build and its twenty-year life, the $1,500k loan drawn, the 7% rate, the owners' $1,000k put in, the 25% tax rate. A blank statement in E5:F15: Revenue to Net income, eleven lines, with EBITDA and EBIT.
  - **Goals** Revenue to gross profit · down to EBITDA · depreciation and EBIT · interest and EBT · tax, reading the rate cell · net income.
  - **Grades** Eleven cells tie, all formulas on the facts. The loan drawn, the owners' cash and the full build price appear nowhere as lines: the build shows up only as depreciation, the loan only as interest.
  - **Route** Pointed formulas top to bottom; tax is EBT times the rate cell, anchored.

#### Two landings *ch5-two-landings*

After 5.1.6 · 150 s · Wave 1 · D06

  - **Task** Seven events. For each, pick the two lines that move. The balance check tells you when they're all placed.
  - **Sheet** Seven events in B5:B11 with amounts in C: washes sold on cards · chemicals delivered on credit · payroll paid · the loan's interest paid · the loan's principal repaid · a week of wear · new tunnel equipment bought. Two pickers a row, D and E, from one list of twelve (Cash, Receivables, PP&E, Payables, Debt and Profit, each up or down). Beside it, a small balance sheet already wired to the picks: opening, movement, closing, and the check.
  - **Goals** One per event · the check reads zero.
  - **Grades** The fourteen picks, in either order within a row. The picks are graded, not only the check, because a wrong pair can balance.
  - **Route** Alt+↓, ↓, Enter, twice a row. The answers: receivables up and profit up · payables up and profit down · cash down and profit down, twice · cash down and debt down · PP&E down and profit down · cash down and PP&E up.

#### In order *ch5-in-order*

After 5.1.4 · 90 s · Wave 2 · D07

  - **Task** Seven balance-sheet lines, shuffled, and one that isn't a balance-sheet line at all. Label each and put them in the order a balance sheet prints them.
  - **Sheet** Eight rows in B5:B12: the term loan · card receivables · the tunnels · deferred member fees · cash · next year's loan repayment · payables · this month's crew wages, already paid. A picker in C (Current asset · Non-current asset · Current liability · Non-current liability · Not on it). An order column D, blue, empty.
  - **Goals** Each line labeled · the order typed, 1 to 8 · the block sorted by the order column.
  - **Grades** The eight picks; the final row order: cash, receivables, tunnels, payables, deferred fees, next year's repayment, the term loan, and the wages row last.
  - **Route** Alt+↓ down C; type the order; Alt, A, S, S on column D.

#### Find the EBITDA *ch5-find-the-ebitda* (stretch)

After 5.1.3 · 90 s · Wave 2 · D08

  - **Card rule** A published income statement rarely prints EBITDA. Take operating profit and add the depreciation shown on the cash flow statement.
  - **Task** A sister operator's statements don't show EBITDA. Build it, and the margin.
  - **Sheet** Tab IS: revenue, cost lines with depreciation inside them, operating profit, interest, tax, net income. Tab CF: three lines, one of them depreciation and amortization. Two empty cells under the IS.
  - **Goals** EBITDA as operating profit plus the CF's depreciation, pointed across the sheets · the margin, one decimal, italic.
  - **Grades** Both tie; EBITDA reads the CF tab; the formats.
  - **Route** =, point, +, Ctrl+PgDn, point, Enter; =C20/C5; Ctrl+Shift+5, Alt, H, 0, Ctrl+I.

#### Three vintages *ch5-three-vintages*

After 5.3.4 · 150 s · Wave 2 · D09

  - **Task** Domain adds a vacuum bay at each of three year-ends, on five-year lives. Show gross, accumulated and net at four dates.
  - **Sheet** The cost of a bay and its life on the sheet, blue. FY26–FY29 across C4:F4. An additions row (a bay in each of the first three years). Three empty vintage rows with the year bought in B, a total depreciation row, then gross PP&E, accumulated depreciation, net and a check.
  - **Goals** The vintage rows from one anchored formula: cost ÷ life in every year after the year bought · total depreciation · gross and accumulated as running sums · net as a roll (the prior net, plus additions, less depreciation) · the check that net equals gross less accumulated.
  - **Grades** Every cell ties; one formula across the vintage block; the check is a formula at zero in all four years.
  - **Route** =IF(C$4>$B7,$C$2/$C$3,0), filled both ways; =SUM($C$5:C5) for the running sums.

#### The dryer line *ch5-dryer-line* (stretch)

After 5.3.4 · 120 s · Wave 2 · D10

  - **Card rule** An asset that's sold leaves PP&E at its book value. Proceeds above book are a gain, and the proceeds sit in investing.
  - **Task** Airport sells its old dryer line for more than it's carried at, the same year it buys a new one. Roll PP&E and state the gain.
  - **Sheet** Opening PP&E, the old line's cost and accumulated depreciation, the sale price, the new line's cost and the year's depreciation, all blue. A roll-forward (opening, additions, disposals, depreciation, closing), a gain cell and a picker (Operations · Investing · Financing), all empty.
  - **Goals** The disposal at book value, as a negative · closing PP&E · the gain: proceeds less book · where the proceeds go.
  - **Grades** The roll and the gain tie as formulas; the picker reads Investing.
  - **Route** =-(C7-C8); =SUM(C12:C15); =C9-(C7-C8); Alt+↓.

#### Prepaid and accrued *ch5-prepaid-and-accrued*

After 5.1.2 · 120 s · Wave 2 · D11

  - **Task** Cedar Park pays a year of insurance on the 1st and owes its crew for the last four days of the month. Build both balances at two dates.
  - **Sheet** In blue: the $24,000 premium paid September 1 for twelve months, payroll of $900 a working day, and four days unpaid at September 30 with two more at October 31, plus six empty answer cells.
  - **Goals** The insurance cost for a month · the prepaid balance at both dates · the accrued wages at both dates · the wage cost September carries that wasn't paid in September.
  - **Grades** $2,000 a month; $22,000 and $20,000 prepaid; $3,600 and $1,800 accrued; all formulas on the inputs.
  - **Route** The premium over its months, each read from its cell; the prepaid as the premium less the months used; the accrual as the daily payroll times the unpaid days; pointed, no typed figures.

#### Cash count *ch5-cash-count*

After 5.1.6 · 90 s · Wave 2 · D12

  - **Task** Count the month's cash directly and tie it to the cash flow statement.
  - **Sheet** One site's month. On the left, the cash flow statement from net income to the net change in cash, built. On the right, five lines of cash in and out, typed as positives: card settlements received, member fees collected, chemicals paid, payroll paid, the loan payment. A total and a check, empty.
  - **Goals** The direct total: receipts less payments · the check: the total less the statement's net change, reading zero · the check in the desk number format.
  - **Grades** The total is a formula and ties; the check is a live difference at zero; its format code.
  - **Route** =SUM(H5:H6)-SUM(H7:H9); =H12-C20; Ctrl+1, N, Tab, N, the three settings, Enter.

#### Four rungs *ch5-four-rungs*

After 5.1.3 · 150 s · Wave 1 · D13

  - **Task** One site's month, four times, each with one more timing gap. Build cash from operations at each rung.
  - **Sheet** Four columns C:F: all cash · plus depreciation · plus three days of unsettled cards · plus thirty-day chemicals and fees collected ahead. Rows given for each: net income, depreciation, the rise in receivables, the rise in payables, the rise in deferred revenue, as positive figures. Row 12, cash from operations, is empty.
  - **Goals** One per rung.
  - **Grades** C12:F12 tie; one formula filled right, with the rise in receivables taken off and the two liabilities added.
  - **Route** =C6+C7-C8+C9+C10; Ctrl+R.

#### Two balance sheets *ch5-two-balance-sheets*

After 5.1.5 · 150 s · Wave 1 · D14, D67

  - **Task** Two balance sheets and the year between them. Write the cash flow statement by formula only and land on the change in cash.
  - **Sheet** FY25 and FY26 balance sheets side by side in C:D (cash, receivables, PP&E; payables, deferred revenue, debt, equity). Beside them, FY26 net income and depreciation. A blank cash flow statement in G5:G16 and a check in G17.
  - **Goals** The operating lines, each a difference of the two balance sheets with the right sign · capex backed out of the PP&E movement and the depreciation · financing from the debt movement, and distributions from the equity roll · the net change, and the check against the change in the cash line.
  - **Grades** Every line ties and is a formula on the two balance sheets; the check is a live difference at zero.
  - **Route** =D10-C10 for a liability, =-(D6-C6) for an asset; capex =-(D7-C7+H6); distributions =-(C12+H5-D12).
  - **Seeds** A shorter seed for the first runs: the operating section only, FY26 to FY27.

#### Days and the cycle *ch5-days-and-cycle*

After 5.3.3 · 90 s · Wave 2 · D15, D77

  - **Task** From the FY26 statements: receivable, payable and deferred-revenue days, and the cycle they add up to.
  - **Sheet** FY26 revenue, membership revenue and operating costs, the FY26 balances (receivables, payables, deferred revenue), and four empty answer cells.
  - **Goals** The three day counts, each on its own base · the cycle: receivable days less the other two.
  - **Grades** About 3, 30, 15 and −42; the day counts carry a days suffix in the format; all formulas.
  - **Route** =C10/C5*365 and its twins; =F5-F6-F7; Ctrl+1, Custom, 0" days".

#### Name the driver *ch5-name-the-driver*

After 5.3.3 · 60 s · Wave 1 · D66

  - **Task** Six balances, six drivers. Match each balance to the line that moves it.
  - **Sheet** Six balances in B5:B10: card receivables · chemical payables · deferred membership revenue · accrued payroll · prepaid insurance · tax payable. A picker beside each, from one list in alphabetical order: Cost of sales · Insurance cost · Membership revenue · Revenue · Site labor · Tax expense.
  - **Goals** One per balance.
  - **Grades** The six picks: card receivables to Revenue · chemical payables to Cost of sales · deferred membership revenue to Membership revenue · accrued payroll to Site labor · prepaid insurance to Insurance cost · tax payable to Tax expense.
  - **Route** Alt+↓, ↓ to the item, Enter, six times.

### The model (5.2–5.5)

#### Stacked cases *ch5-stacked-cases*

After 5.2.6 · 120 s · Wave 2 · D55

  - **Task** The five drivers have been re-laid with their three cases stacked under each heading. Fill the live block with one INDEX.
  - **Sheet** On Inputs, twenty rows in B12:J31: each driver's heading row, then Management, Base and Downside beneath it, FY27–FY31 in F:J. The live block's five rows below, with the driver names in B. Case is a named cell.
  - **Goals** The live block from one formula: the driver's heading found with MATCH, plus the case number, filled across and down.
  - **Grades** Twenty-five cells tie at Case 1, 2 and 3 (what-if); one formula across the block.
  - **Route** =INDEX(F$12:F$31,MATCH($B34,$B$12:$B$31,0)+Case); Ctrl+R, Ctrl+D. Needs M77.

#### Stale tab *ch5-stale-tab*

After 5.5.3 · 120 s · Wave 2 · D64

  - **Task** Old_Rollout is going. Find what still reads it, repoint it, delete the tab, and keep the flag at OK.
  - **Sheet** The cut-down model with one extra tab, Old_Rollout. Three formulas on Schedules still read it where they should read the live block on Inputs.
  - **Goals** The three formulas repointed to the live block · the tab deleted · the Cover flag reads OK.
  - **Grades** The tab is gone and nothing errors; the three cells read Inputs' live block; the flag reads OK and the error count is zero.
  - **Route** Ctrl+F, Options, Within Workbook, Look in Formulas, Find All; repoint by pointing; Alt, H, D, S deletes the tab. Needs M72.

#### One hop *ch5-one-hop*

After 5.2.6 · 90 s · Wave 2 · D65

  - **Task** The cost-of-a-wash driver reaches its last use through links to links. Point every use straight at the source.
  - **Sheet** On Schedules, four rows that use the driver for FY27–FY31: the first reads the live block on Inputs, and each of the next three reads the row above it. One more row is a flat assumption carried as =the prior year, labeled held flat.
  - **Goals** The three chained rows each pointed at the live block · the held-flat row left alone.
  - **Grades** Each use's precedent is the live-block cell in its own column; the held-flat row's formulas are unchanged; no value on the sheet moved.
  - **Route** =, Ctrl+PgUp to Inputs, point, Ctrl+Enter across the row, three times; Ctrl+[ to prove one.

#### Circle hunt *ch5-circle-hunt*

After 5.5.3 · 90 s · Wave 1 · D68

  - **Task** Something on this sheet adds itself. Iteration is on, so nothing warns. Find it and fix it.
  - **Sheet** A site-cost block with four totals; one SUM's range runs through its own cell. Iterative calculation is on and the breaker on Inputs is at 1, with the model's intended interest circle live.
  - **Goals** The faulty SUM found and its range stopped short of its own cell · the breaker set to 0 and iteration switched off, F9, and no warning · both switched back on.
  - **Grades** No SUM includes its own cell; the totals tie; the breaker reads 1 and iteration is on at the end.
  - **Route** F2 down the totals; fix the range; Inputs, 0; Alt, F, T, Formulas, untick; F9; then both back. Needs M78.

#### Breaker *ch5-breaker*

After 5.3.5 · 60 s · Wave 1 · D74

  - **Task** Someone typed text into an interest cell and the model is a wall of errors. Get it back inside a minute.
  - **Sheet** The cut-down model with "tbc" typed over one interest cell on Schedules, so every dependent reads #VALUE!. The breaker on Inputs is at 1.
  - **Goals** The breaker to 0 · the interest cell refilled from its neighbor · the breaker back to 1 · the error count on Checks reads zero.
  - **Grades** The interest row is one formula across; the breaker reads 1; no errors anywhere; the balance check reads zero.
  - **Route** Inputs, 0, Enter; to the cell, select it with the one to its left, Ctrl+R; Inputs, 1.

#### Equity roll *ch5-equity-roll*

After 5.4.3 · 90 s · Wave 2 · D71

  - **Task** Roll equity five years with a payout to the owners at a typed share of net income.
  - **Sheet** Net income for FY27–FY31 in row 5; the payout share in C2, blue; FY26 closing equity given. Four empty rows: opening, net income, distributions, closing.
  - **Goals** Opening from the prior closing · distributions as a negative, the share anchored · closing · the roll filled right.
  - **Grades** The roll ties at the seed's share and at a what-if of 120%, where closing equity falls every year; one formula a row.
  - **Route** =B11; =C5; =-$C$2*C5; =SUM(C8:C10); Ctrl+R.

#### Implied ticket *ch5-implied-ticket*

After 5.3.1 · 120 s · Wave 2 · D75

  - **Task** Back the ticket out of three years of washes and revenue by package, minding the units.
  - **Sheet** Washes by package in units and retail revenue by package in thousands for FY24–FY26, with a labeled 1,000 in H2. Empty: the implied ticket by package, growth rows for washes, ticket and revenue, and a check.
  - **Goals** The ticket: revenue times the labeled 1,000 over washes · the three growth blocks · the check: washes growth compounded with ticket growth, less revenue growth, reading zero.
  - **Grades** Tickets land near $10, $15 and $20; the formulas read H2 and carry no typed 1000; one formula a block; the check is live at zero.
  - **Route** =C9*$H$2/C5; =D5/C5-1; =(1+D17)*(1+D21)-1-D25; fill.

#### Rewire the case *ch5-rewire-the-case* (long)

After 5.3.1 · about five minutes · Wave 2 · D76

  - **Task** This forecast grows revenue by a typed rate for each case. Rewire it to washes a day and ticket, and keep the Base case's revenue where it was.
  - **Sheet** A one-line forecast: FY26 revenue, a growth rate for each of three cases, a live growth row on CHOOSE, and revenue for FY27–FY31. Below it, typed and waiting: washes a day and ticket growth for the three cases, set so Base reproduces the old revenue; sites, days and the labeled 1,000. A memo row holds the old Base revenue as values.
  - **Goals** Live rows for the two drivers, reading Case · revenue rebuilt from sites, washes a day, days and ticket · the growth row turned into an output · the check against the memo row at zero on Base.
  - **Grades** Revenue ties under each case (what-if); growth is a formula of revenue; nothing reads the old growth inputs; the check is live.
  - **Route** =CHOOSE(Case,F12,F16,F20) twice; the build; =G30/F30-1; =G30-G40.

#### Depreciation waterfall *ch5-dep-waterfall*

After 5.3.4 · 150 s · Wave 1 · D78

  - **Task** Five years of rollout capex, each on its own row over twenty years, plus the old tunnels running off.
  - **Sheet** New-site capex for FY27–FY31 (six sites a year at $2,500k); the life and the existing base with its remaining life on Inputs. Five empty vintage rows, a base row, a total and a capex ÷ depreciation memo row.
  - **Goals** The waterfall from one anchored formula: capex ÷ life in every year after the spend · the base's depreciation · the total · the memo ratio, one decimal with an x.
  - **Grades** The block ties; one formula across the waterfall; the total is a SUM down plus the base; the ratio's format.
  - **Route** =IF(G$4>$B10,$C10/Life,0), filled both ways; Alt+=; =G8/G16.
  - **Seeds** A stretch seed for the second wave: a picker on Inputs sets the convention for the year of spend (none · half · full) and the waterfall reads it (held item G086).

#### Roll forward *ch5-roll-forward*

After 5.4.5 · 180 s · Wave 2 · D79

  - **Task** FY27's actuals are in. Make FY27 history without retyping a single projected formula.
  - **Sheet** The cut-down model: Data has an empty FY27 column with a block of FY27 actuals waiting beside it. LastHistorical on Inputs reads 12/31/2026 and the divider sits between FY26 and FY27.
  - **Goals** The actuals pasted onto Data as values · LastHistorical moved to 12/31/2027 · FY27's label switched to A and the divider moved one column right on the IS · every check on Checks reads zero.
  - **Grades** The projection flag reads 0 for FY27; the IS's FY27 reads Data through the row's one formula; the divider's position; the checks at zero; the hardcode count on the projected blocks still zero.
  - **Route** Ctrl+C, Alt, E, S, V; type the date; the label; the border by Ctrl+1; Ctrl+PgDn to Checks. Needs the Data mapping of 5.2.5.

### The DCF (5.6)

#### Stub period *ch5-stub-period* (stretch)

After 5.6.5 · 150 s · Wave 2 · D32

  - **Card rule** Valuing inside a year: count only the part of the first year still to come, and discount each flow over the time from the valuation date.
  - **Task** The buyers want value at September 30, 2026, not at year end. Rebuild the discounting from that date.
  - **Sheet** A one-page DCF: the valuation date in H2, blue; year-end dates in row 4 and cash flows for FY26E–FY31 in row 6; WACC named. Empty rows: the fraction counted, the flow counted, years from the valuation date, the factor, the present value, and their sum.
  - **Goals** The fraction: YEARFRAC from the valuation date to the first year-end, and 1 after · the flow counted · the period as days from the valuation date over 365 · factors, present values and the sum.
  - **Grades** Every row ties at the seed date and after a what-if moves the date to the year end, where FY26E drops out.
  - **Route** =YEARFRAC($H$2,C4) in the first cell, 1 after; =(C4-$H$2)/365; =1/(1+WACC)^C9; fill.

#### DCF read-back *ch5-dcf-read-back*

After 5.6.5 · 90 s · Wave 1 · D33, D34

  - **Task** Under enterprise value: how much of it is the terminal value, and what multiple it implies.
  - **Sheet** A built DCF page showing the present value of the forecast years, of the terminal value, and the enterprise value, with FY26E and FY27 EBITDA on the page and four empty memo cells.
  - **Goals** The terminal value's share of enterprise value, and the forecast years' share, summing to 100% · enterprise value over FY26E and over FY27 EBITDA from one formula filled right, one decimal with an x.
  - **Grades** The four cells tie; the multiple's formula anchors enterprise value; the formats.
  - **Route** =C20/C22; =1-C24; =$C$22/C8, Ctrl+R; Ctrl+1 for the x.

#### Normalize the year *ch5-normalize-the-year*

After 5.6.4 · 120 s · Wave 1 · D35

  - **Task** FY31 still opens six sites. Build the normalized year beside it and feed the perpetuity from that.
  - **Sheet** The free-cash-flow block for FY27–FY31 with capex split into new sites and maintenance. An empty column beside FY31 headed Normalized. The perpetuity value, reading the raw FY31, and its implied multiple.
  - **Goals** The normalized column: FY31's NOPAT, capex set equal to depreciation, the working-capital change at the steady figure on Inputs, and the free cash flow · the perpetuity repointed at the normalized figure.
  - **Grades** The column ties; the perpetuity reads it; the raw FY31 column is unchanged.
  - **Route** Links down the new column; =-K9 for capex; F2 on the perpetuity and repoint.

#### Round trip *ch5-round-trip*

After 5.6.4 · 90 s · Wave 2 · D38

  - **Task** Feed the perpetuity value's implied multiple through the exit method. The growth input has to come back.
  - **Sheet** Both terminal values built, with the perpetuity's implied multiple, the exit value's implied growth, and an empty check cell. One fault is planted: implied growth is solved from the raw FY31 cash flow, while the perpetuity runs on the normalized one.
  - **Goals** The check: implied growth less the growth input · the perpetuity's implied multiple pasted into the exit-multiple input as a value, and the check read: not zero · implied growth repointed at the normalized cash flow, so the check reads zero · the 11.0x put back.
  - **Grades** Implied growth reads the normalized FY31 cash flow; the check is a live difference; the input reads 11.0 at the end; a what-if that feeds the implied multiple back returns zero.
  - **Route** =C30-Growth; Ctrl+C, Alt, E, S, V; F2 and repoint; type 11.

#### WACC range *ch5-wacc-range*

After 5.6.3 · 120 s · Wave 2 · D39

  - **Task** Before asking what WACC does to value, see how wide WACC itself is: beta across, the equity premium down.
  - **Sheet** The WACC block with its blue inputs. A table frame beside it: five betas across and five premiums down, typed, the corner empty.
  - **Goals** The corner linked to the WACC cell · the two-way data table, beta as the row input and the premium as the column input · the base case bordered · percentages to one decimal.
  - **Grades** A data table with the right input cells; its values tie; the edges are typed, not linked to the inputs they drive; the border sits on the base cell.
  - **Route** =WACC; select the frame; Alt, A, W, T; the two input cells; Enter; Ctrl+1 for the border.

#### Quick DCF *ch5-quick-dcf* (long)

After 5.6.5 · about five minutes · Wave 2 · D37

  - **Task** A sister operator sends three numbers. Five years of cash flow from six drivers, one terminal value, an enterprise value, on one page.
  - **Sheet** One page with labels only. Blue and given: last year's revenue, EBITDA and capex; six drivers (growth, EBITDA margin, depreciation and capex as shares of revenue, working capital as a share of the change in revenue, the tax rate); WACC and an exit multiple.
  - **Goals** Revenue and EBITDA · EBIT and the tax on it · capex, the working-capital change and free cash flow · factors and present values · the terminal value by the exit multiple, discounted · enterprise value.
  - **Grades** Every row ties and is one formula across; every driver is read from its cell.
  - **Route** The Chapter 5 fill pattern, row by row: first cell, Ctrl+Shift+→, Ctrl+R.

### Planned Chapter 5 drills given a spec by a source idea

  - **Schedule fill** *ch5-schedule-fill* (D69). The build is the PP&E roll for FY27–FY31: opening, capex, depreciation, closing, each filled right, with a capex ÷ depreciation memo row under it. Grades: one formula a row, closing feeding the next opening, the ratio's format.
  - **Balance it** *ch5-balance-it* (D72). Five seeds, one planted break each: a flipped sign on the change in deferred revenue · equity that picks up net income and misses distributions (this seed carries a distribution) · a liabilities subtotal that leaves out the delayed-draw loan · depreciation counted twice · an add-back with no balance-sheet home. A mark column beside the BS and the CF is there for the tick-off of 5.4.5 and isn't graded.
  - **Sweep** *ch5-sweep* (D73, D86). The revolver block: draw =MAX(minimum cash − cash available, 0), repayment =MIN(MAX(cash available − minimum cash, 0), opening). A what-if raises capex per site until FY28 runs short: the revolver has to draw, repay from the next surplus, never go below zero and never let cash under the minimum. Legendary seed: the two lines rewritten as one change line, =−MIN(cash available − minimum cash, opening), which equals the old net figure in every year.

## Chapter 6 · Valuation

Fifteen sketches. Wolf's call of 2026-09-30 keeps this chapter light on finance: enterprise-value multiples on six fictional listed operators, the sponsor's LBO and the waterfall. The drills stay inside that: the one equity multiple that appears is picked, never computed. The ideas that needed share counts, P/E or premiums on more than one unaffected price are parked with the add-ons.

#### Three ways to a price *ch6-three-ways-to-a-price*

After 6.1.5 · 90 s · Wave 1 · D17, D29

  - **Task** Three median multiples, three implied equity values, three bids. Which bid clears which?
  - **Sheet** The comps medians for EV/EBITDA, EV per site and EV/revenue; Clearcoat's EBITDA, sites, revenue and net debt; the three bids' equity values across the top of an empty 3 × 3 grid.
  - **Goals** The implied enterprise value on each multiple · less net debt, the implied equity value · the grid: each bid as a percent above or below each implied value, from one formula filled both ways.
  - **Grades** The values tie; net debt is anchored; the grid is one formula with one row anchor and one column anchor, as a percentage to one decimal.
  - **Route** The implied enterprise value as the multiple times its figure, three times; equity as that less net debt, anchored; the grid as =I$4/$H5-1, the bid's row and the implied value's column anchored; Ctrl+R, Ctrl+D.
  - **Seeds** A second seed runs the same page off the precedents' medians (EV/EBITDA and EV per site).

#### Match the multiple *ch6-match-the-multiple*

After 6.1.1 · 90 s · Wave 2 · D18

  - **Task** Eight ratios for one operator. Mark each consistent or mixed, and compute only the consistent ones.
  - **Sheet** One listed operator's enterprise value, market cap, revenue, EBITDA, EBIT and net income, blue. Eight rows: each of the two values over each of the four lines. A picker (Consistent · Mixed) on every row, and a value cell on the three enterprise-value rows that are consistent.
  - **Goals** The eight picks · the three consistent enterprise-value multiples, one decimal with an x.
  - **Grades** The picks (enterprise value over revenue, EBITDA and EBIT, and market cap over net income, are consistent); the three values tie. The equity multiple is picked and not computed: the chapter prices on enterprise value.
  - **Route** Alt+↓, ↓, Enter down the column; three divisions.

#### LTM two ways *ch6-ltm-two-ways*

After 6.1.2 · 90 s · Wave 1 · D22, D31

  - **Task** A March year-end operator: LTM EBITDA from the fiscal year and the year-to-date, tied to the four quarters.
  - **Sheet** Harbor Clean's last fiscal-year total, its eight quarters with period-end dates, the current and the prior year-to-date, the LTM date in H2, and three empty cells.
  - **Goals** LTM as the fiscal year plus the year-to-date less the prior year-to-date · LTM as a SUMIFS over the quarters in the twelve months to H2 · the difference, reading zero.
  - **Grades** Both tie; the SUMIFS reads H2, so a what-if that moves the LTM date back a quarter still ties on that route; the check is live.
  - **Route** =C5+C7-C8; =SUMIFS(C12:J12,C11:J11,">"&EDATE(H2,-12),C11:J11,"<="&H2); =H5-H6.

#### Calendarize *ch6-calendarize*

After 6.1.2 · 90 s · Wave 2 · D23

  - **Task** Two March year-ends, restated to calendar 2025. The weights come from the year-end cell.
  - **Sheet** Three peers, two with March year-ends and one with December: the fiscal year-end in C (blue), FY2025 and FY2026 EBITDA in D and E. The weight in F and calendar 2025 in G, empty.
  - **Goals** The weight from the month of the year-end, filled down · calendar 2025 as the weighted pair, filled down.
  - **Grades** Both columns tie and are formulas on column C; the December peer weighs 100% and matches its FY2025; a what-if that moves one year-end to June moves only that peer, to a half.
  - **Route** =MONTH(C5)/12; =D5*F5+E5*(1-F5); Ctrl+D.

#### Napkin LBO *ch6-napkin*

After 6.3.4 · 180 s · Wave 1 · D80

  - **Task** A bid price, a leverage multiple, flat EBITDA and the debt left at exit. Sources and uses, exit equity, MOIC and the annual return two ways.
  - **Sheet** Blue: the price ($195,000k), fees (2%), EBITDA ($16,600k), leverage (5.5x), the exit multiple (11.0x), debt at exit and the years held. Empty: uses, sources, the check, exit value and exit equity, MOIC, and two return cells.
  - **Goals** Uses: the price, the fees, the total · sources: the debt, and equity as what's left; the check at zero · exit equity · MOIC · the annual return by the power and by RRI, agreeing.
  - **Grades** Everything ties; equity is total uses less debt, not a typed figure; the two returns are equal; the check is live.
  - **Route** Pointed formulas; =C16/C12; =C18^(1/C9)-1; =RRI(C9,C12,C16).

#### What debt adds *ch6-what-debt-adds*

After 6.3.4 · 90 s · Wave 2 · D81

  - **Task** Show the gap between the deal as bid and the same deal with no debt.
  - **Sheet** Two columns of the two-tranche LBO from 6.3, each with its own leverage inputs, cash row and returns, and an empty gap column.
  - **Goals** Both tranches' leverage set to zero in the second column · the gap in IRR, in points, and in MOIC, in turns.
  - **Grades** The second column's leverage inputs read zero, its debt and interest rows read zero and its equity equals its total uses; the two gaps are formulas and tie.
  - **Route** 0, ↓, 0; =C20-D20, Ctrl+D.

#### Credit strip *ch6-credit-strip*

After 6.3.2 · 90 s · Wave 2 · D84

  - **Task** Under the debt schedule: leverage and interest cover by year, with a flag on any year cover falls short.
  - **Sheet** Total debt, cash, EBITDA and interest given from closing to FY31, a blue cover threshold on the sheet, and three empty rows.
  - **Goals** Net debt over EBITDA, one decimal with an x · EBITDA over interest, the same · a flag reading Short or OK against the threshold.
  - **Grades** The rows tie, one formula each; the formats; the flag reads the threshold cell (what-if).
  - **Route** =(C5-C6)/C7; =C7/C8; =IF(C12<$C$2,"Short","OK"); Ctrl+R.

#### Offer to multiple *ch6-offer-to-multiple*

After 6.4.2 · 60 s · Wave 2 · D85

  - **Task** A bidder quotes a price for the owners' shares. What multiple is that?
  - **Sheet** The offer for the equity, net debt from the model, LTM EBITDA and the site count, with the comps medians beside them and five empty cells.
  - **Goals** Enterprise value: the offer plus net debt · EV/EBITDA and EV per site · each against its median, as a percent above or below.
  - **Grades** The five cells tie and are formulas; the multiple is one decimal with an x; the per-site figure shows $m to one decimal through its format, with no 1000 typed into the formula.
  - **Route** =C5+C6; =C8/C7; =C8/C9 with a scaling comma in the format code (2.2); =C11/F11-1.

#### Cap the amortization *ch6-cap-the-amort*

After 6.3.2 · 120 s · Wave 1 · D87

  - **Task** The loan repays a typed percent of its original amount each year, and at 40% the balance goes negative in year three. Cap the repayment so the balance can't go negative.
  - **Sheet** The senior loan for FY27–FY31: opening, required amortization (the percent in C2 times the original loan in C3) and closing, with the percent starting at 5%.
  - **Goals** 40% typed, and the closing balance read as it goes below zero · the amortization wrapped in MIN against the opening balance · every closing balance at zero or above.
  - **Grades** The amortization row is one formula with the percent and the original loan anchored; the closings tie at 5% and at 40% (what-if), none below zero.
  - **Route** 40%, Enter; F2 on the first cell, =MIN($C$2*$C$3,C6); Ctrl+R.

#### Sweep dial *ch6-sweep-dial* (stretch)

After 6.3.2 · 150 s · Wave 2 · D88

  - **Card rule** A sweep percent above a loan: at 100% every spare dollar repays it, at 0% the cash is kept.
  - **Task** Put a dial on the sweep. Run it at 100%, 50% and 0% and see what happens to net debt.
  - **Sheet** The LBO's sweep block with a sweep percent above the senior loan, blue, and the sweep formula written without it. A three-line table (100%, 50%, 0%) with columns for exit debt, exit cash and exit net debt, empty.
  - **Goals** The dial multiplied into cash available inside the sweep · the table filled, by a one-way data table on the dial or by three runs pasted as values.
  - **Grades** The sweep reads the dial; the table ties; exit net debt differs across the three lines only by the interest saved.
  - **Route** F2, *$C$2 inside the MIN; the table: Alt, A, W, T with the dial as the column input.

#### Exit grid *ch6-exit-grid*

After 6.3.4 · 90 s · Wave 2 · D89

  - **Task** Exit equity under five multiples, split between the sponsor and the owners who rolled, from one formula.
  - **Sheet** Five exit multiples across D4:H4, 10.0x to 12.0x, typed. FY31 EBITDA in C5 and exit net debt in C6, blue. An exit-equity row, row 7, empty. The two holders down B9:B10 with their shares in C, and an empty grid beside them.
  - **Goals** Exit equity under each multiple, filled right · the grid from one formula, the share anchored on its column and the equity on its row.
  - **Grades** The row and the grid tie; the grid is one formula with one row anchor and one column anchor.
  - **Route** =D4*$C$5-$C$6 in row 7, Ctrl+R; =$C9*D$7, Ctrl+R, Ctrl+D.

#### Lender's return *ch6-lenders-return*

After 6.3.4 · 90 s · Wave 1 · D90

  - **Task** The senior lender's cash flows on one row, and their IRR. It should sit near the loan's rate.
  - **Sheet** The senior tranche's schedule, built: the draw at closing, interest, required amortization, the sweep and the closing balance for FY27–FY31. An empty row for the lender's cash flow from closing to FY31, and an IRR cell.
  - **Goals** The loan out at closing, as a negative · each year's interest and repayments in · the balance repaid at exit added to FY31 · IRR on the row, one decimal.
  - **Grades** Every cell of the row is a formula on the schedule and ties; the IRR ties and sits within half a point of the rate. One seed hides the sweep on its own line, which is the usual miss.
  - **Route** =-C5; =D7+D8+D9, Ctrl+R; add the closing balance in the last cell; =IRR(C14:H14).

#### Three cases *ch6-three-cases*

After 6.3.6 · 120 s · Wave 2 · D91

  - **Task** The sponsor's return under each case, side by side, and which cases clear the hurdle.
  - **Sheet** The LBO linked to the cut-down model. A table frame on the Cover, beside the named Case switch, because a data table's input cell has to be on the table's own sheet (4.5.5): the three case numbers down, three output columns for IRR, MOIC and exit net debt, a flag column. The hurdle in its own cell.
  - **Goals** The three outputs linked from the LBO into the table's header row · a one-way data table with Case as the column input · a flag on each line, Clears or Short, against the hurdle cell · F9.
  - **Grades** A data table on Case; its nine values tie; the flags read the hurdle (what-if).
  - **Route** Three links; select; Alt, A, W, T; Tab to the column input, Case; =IF(D8>=$C$2,"Clears","Short"); F9.

#### Ceiling price *ch6-ceiling-price*

After 6.3.6 · 90 s · Wave 1 · D92

  - **Task** The most a sponsor can pay at three hurdles, by formula.
  - **Sheet** Three hurdles across D4:F4, typed and blue. Exit equity, the two tranches' debt, the fee rate and FY26E EBITDA, given. Three empty rows, and a memo cell holding the Goal Seek answer at 20%.
  - **Goals** The most equity that still earns each hurdle, with PV · the top enterprise value: that equity plus the debt, over one plus the fees · its multiple of EBITDA, one decimal with an x · the 20% column checked against the memo, reading zero.
  - **Grades** One formula a row, anchored; the values tie; the check is live.
  - **Route** =PV(D4,5,0,-$C$6); =(D8+$C$7)/(1+$C$8); =D9/$C$9; Ctrl+R. Needs M82.

#### IRR table *ch6-irr-table*

After 6.3.6 · 150 s · Wave 2 · D93

  - **Task** IRR on entry multiple against senior leverage, with everything under the hurdle shaded, and the hurdle in a cell.
  - **Sheet** A one-page LBO. A table frame: five entry multiples down and five senior leverage levels across, typed. The hurdle in a cell above the table, blue.
  - **Goals** The corner linked to IRR · the two-way data table · one conditional rule that shades a cell when it's below the hurdle cell · F9.
  - **Grades** A data table with leverage as the row input and the entry multiple as the column input; values tie; the rule reads the hurdle cell, so a what-if of 25% widens the shading.
  - **Route** =IRR cell; Alt, A, W, T; Alt, H, L, N, a formula rule or Less Than pointing at the cell; F9.

### Planned Chapter 6 drills given a spec by a source idea

  - **Spread a comp** *ch6-spread-a-comp* (D26). After the EV build, two more columns: two-year revenue growth (the CAGR of 2.1.3, with COLUMNS in the exponent) and net debt over LTM EBITDA. One operator holds more cash than debt, and a cell beside it reads Net cash by formula.
  - **Median and range** *ch6-median-and-range* (D21, D27, D28). Ten candidates with a one-line description and a size each (express tunnels, full-service washes, fuel-station washes, detailers). An include flag and a reason picker on each (Same business · Different model · Too small · Too large · Outlier on growth · Outlier on margin · Outlier on leverage). The statistics read the helper column of 6.1.3. Clearcoat's own row sits under the statistics, and the grader checks that every range stops above it.
  - **Sources and uses** *ch6-sources-and-uses* (D82). Bid C: the owners roll a fifth of their equity. The rollover is a line in sources; the sponsor's equity is total uses less debt less the rollover; the ownership split follows; each holder's exit equity and IRR are built, and a check shows both returns equal the deal's.
  - **Waterfall** *ch6-waterfall* (D83). Five sale prices across, from distressed to strong. Net debt, fees, the option pool and the owners each take MIN(claim, what's left). One more cell returns the first price at which the owners receive a dollar.

## Parked, held and dropped

| Source row | Idea | Where it went | Why |
| :- | :- | :- | :- |
| D16 | Capitalizing the leaseback rent with PV and reading leverage with it | Parked: the restructuring DLC (screenplay 4.9) | The rent as a debt-like claim is the DLC's subject; held item G109 says the same |
| D19 | Two operators that differ only in debt: EV/EBITDA against P/E | Parked: public comps in depth (screenplay 4.10) | Needs earnings per share and equity multiples, which Wolf left out of Chapter 6 |
| D20 | EV/EBITDA against EV/EBIT for an owner and a renter | Parked: public comps in depth | Held item G170; the own-or-rent read the chapter needs is already in 6.1.4 |
| D30 | The premium on one-day and one-month pre-announcement prices | Parked: public comps in depth | Held item G190; a listed-target detail |
| D36 | A beta unlevered from six peers and re-levered at the target | Parked: valuation depth (screenplay 4.10) | 5.6.3 now says where the 1.2 comes from; the arithmetic is add-on material |
| D50 | Rewriting INDIRECT and ADDRESS lookups | Held for the engine (*ch4-decode-it*, sketched above) | The engine lists those two functions without simulating them |
| D54 | A grid of sticky cells filled by cycling two inputs | Dropped | Twenty-five cells, each filled by flipping two switches, can't fit a clock; it stays a worked example in 4.5.6 if it's wanted |

## The map: every source idea and where it landed

The rows of claude/source-checklist.md, section D, in order.

| Row | Seen in | Landed as |
| :- | :- | :- |
| D01 | accounting 02-01 | New: *ch5-is-it-revenue* |
| D02 | accounting 01-04 | New: *ch5-which-date* |
| D03 | accounting 02-04 | New, stretch: *ch5-used-not-bought* |
| D04 | accounting 02-07 | New: *ch5-capitalize-or-expense* |
| D05 | accounting 02-15 | New: *ch5-ten-facts* |
| D06 | accounting 03-04 | New: *ch5-two-landings* |
| D07 | accounting 03-06 | New: *ch5-in-order* |
| D08 | accounting 02-14 | New, stretch: *ch5-find-the-ebitda* |
| D09 | accounting 04-03 | New: *ch5-three-vintages* |
| D10 | accounting 04-04 | New, stretch: *ch5-dryer-line* |
| D11 | accounting 04-01 | New: *ch5-prepaid-and-accrued* |
| D12 | accounting 05-08 | New: *ch5-cash-count* |
| D13 | accounting 06-02 | New: *ch5-four-rungs* |
| D14 | accounting 06-04 | New: *ch5-two-balance-sheets* (with D67) |
| D15 | accounting 07-02 | New: *ch5-days-and-cycle* (with D77) |
| D16 | accounting 05-03 | Parked: the restructuring DLC |
| D17 | trading-comps 01-07 | New: *ch6-three-ways-to-a-price* (with D29) |
| D18 | trading-comps 01-04 | New: *ch6-match-the-multiple* |
| D19 | trading-comps 01-05 | Parked: public comps in depth |
| D20 | trading-comps 01-06 | Parked: public comps in depth |
| D21 | trading-comps 02-09 | Folded into *ch6-median-and-range* |
| D22 | trading-comps 02-29 | New: *ch6-ltm-two-ways* (with D31) |
| D23 | trading-comps 02-41 | New: *ch6-calendarize* |
| D24 | trading-comps 02-28 | New: *ch2-flip-and-tie* (with D70) |
| D25 | trading-comps 05-03 | New: *ch4-output-grid* |
| D26 | trading-comps 05-05 | Folded into *ch6-spread-a-comp* |
| D27 | trading-comps 05-08 | Folded into *ch6-median-and-range* |
| D28 | trading-comps 05-09 | Folded into *ch6-median-and-range* |
| D29 | transaction-comps 02-02 | New: *ch6-three-ways-to-a-price* (with D17) |
| D30 | transaction-comps 04-02 | Parked: public comps in depth |
| D31 | transaction-comps 04-07 | New: *ch6-ltm-two-ways* (with D22) |
| D32 | dcf 03-11 | New, stretch: *ch5-stub-period* |
| D33 | dcf 03-13 | New: *ch5-dcf-read-back* (with D34) |
| D34 | dcf 03-24 | New: *ch5-dcf-read-back* (with D33) |
| D35 | dcf 09-04 | New: *ch5-normalize-the-year* |
| D36 | dcf 09-02 | Parked: valuation depth |
| D37 | dcf 03-01 | New, long: *ch5-quick-dcf* |
| D38 | dcf 05-03 | New: *ch5-round-trip* |
| D39 | dcf 07-06 | New: *ch5-wacc-range* |
| D40 | excel 02-03 | New: *combine-two-tabs* |
| D41 | excel 03-04 | New: *ch2-to-thousands* |
| D42 | excel 03-02 | New: *insert-and-amend* |
| D43 | excel 03-14 | New: *ch2-rule-the-row* |
| D44 | excel 03-16 | Folded into *ch2-custom-code* |
| D45 | excel 03-10 | New: *ch4-six-tabs* |
| D46 | excel 03-19 | Folded into *ch2-print-it* |
| D47 | excel 03-13 | New: *before-you-send* |
| D48 | excel 05-04 | New: *ch4-two-pickers* |
| D49 | excel 05-05 | New: *ch4-pick-a-window* |
| D50 | excel 05-07 | Held for the engine: *ch4-decode-it* |
| D51 | excel 04-06 | New: *ch3-override* |
| D52 | excel 04-07 | New: *ch3-part-year* |
| D53 | excel 04-03 | New: *ch3-method-selector* |
| D54 | excel 05-11 | Dropped: too long for a clock |
| D55 | excel 05-16 | New: *ch5-stacked-cases* |
| D56 | excel 06-02 | New: *ch3-sumproduct-proof* |
| D57 | excel 06-07 | New: *ch3-bands* |
| D58 | excel 06-09 | New: *ch3-npv-three-ways* |
| D59 | excel 07-02 | Folded into *ch3-text-split* |
| D60 | excel 08-01 | Folded into *ch4-sort-and-filter* |
| D61 | excel 08-04 | New: *ch4-ask-the-pivot* |
| D62 | excel 09-01 | Folded into the Chapter 3 puzzle, *puzzle-ch3* |
| D63 | excel 09-02 | New, stretch: *ch3-any-of-three* |
| D64 | fsm 02-03 | New: *ch5-stale-tab* |
| D65 | fsm 02-02 | New: *ch5-one-hop* |
| D66 | fsm 06-03 | New: *ch5-name-the-driver* |
| D67 | fsm 07-05 | New: *ch5-two-balance-sheets* (with D14) |
| D68 | fsm 07-06 | New: *ch5-circle-hunt* |
| D69 | fsm 08-05 | Folded into *ch5-schedule-fill* |
| D70 | fsm 04-04 | New: *ch2-flip-and-tie* (with D24) |
| D71 | fsm 08-11 | New: *ch5-equity-roll* |
| D72 | fsm 12-02 | Folded into *ch5-balance-it* |
| D73 | fsm 09-04 | Folded into *ch5-sweep* |
| D74 | fsm 09-06 | New: *ch5-breaker* |
| D75 | fsm 13-03 | New: *ch5-implied-ticket* |
| D76 | fsm 13-06 | New, long: *ch5-rewire-the-case* |
| D77 | fsm 15-04 | New: *ch5-days-and-cycle* (with D15) |
| D78 | fsm 16-01 | New: *ch5-dep-waterfall* |
| D79 | fsm 17-01 | New: *ch5-roll-forward* |
| D80 | lbo 01-06 | New: *ch6-napkin* |
| D81 | lbo 01-04 | New: *ch6-what-debt-adds* |
| D82 | lbo 01-22 | Folded into *ch6-sources-and-uses* |
| D83 | lbo 02-07 | Folded into *ch6-waterfall* |
| D84 | ma 04-09 | New: *ch6-credit-strip* |
| D85 | lbo 01-05 | New: *ch6-offer-to-multiple* |
| D86 | lbo 03-22 | Folded into *ch5-sweep* |
| D87 | lbo 03-23 | New: *ch6-cap-the-amort* |
| D88 | lbo 03-24 | New, stretch: *ch6-sweep-dial* |
| D89 | lbo 04-03 | New: *ch6-exit-grid* |
| D90 | lbo 04-04 | New: *ch6-lenders-return* |
| D91 | lbo 04-07 | New: *ch6-three-cases* |
| D92 | lbo 05-01 | New: *ch6-ceiling-price* |
| D93 | lbo 05-02 | New: *ch6-irr-table* |

## What the engine needs for these

Two new mechanics requests, written into screenplay 9.3, and a list of the existing ones these drills lean on.

  - **M84 What-if grading.** A drill's grader can change one or more input cells, recalculate, compare the answer cells with the reference and put the inputs back. It is how a formula is told from a typed number, an anchored reference from a lucky one and a rule that reads a cell from a rule with the number typed in, without grading the route.
  - **M85 Pickers and card tags.** A drill's start state can carry validated-list cells, graded by the value picked. A drill can be tagged stretch (one rule line shown on its card, off the path, never in the Daily) or long (listed with the challenges on Practice, never in the Daily).
  - **Already requested and used here:** M65 (Edit and Point modes on F2), M68 (the Clear menu, Notes in Go To Special, Paste Special Formulas, paste arithmetic on formulas), M70 (grouped sheets), M71 (formula rules and the functions the asides lean on), M72 (Find All across the workbook), M75 (array arithmetic inside SUMPRODUCT, which *ch3-any-of-three* extends to COUNTIF against a list), M77 (a name while pointing), M78 (the circular-reference warning with iteration off), M82 (PV with no payment).
  - **Commands a seed needs that a lesson only lists:** Subtotal (Alt, A, B) for the second seed of *ch4-sort-and-filter*; INDIRECT and ADDRESS for *ch4-decode-it*, which waits on them.

## What happens to these next

The build session writes each drill's goal lines when it builds the drill, since they name the cells of that chapter's workbook, and sets the seeds and the pars from the reference routes. The screenplay's 6.2 keeps the catalog in one view: this doc is where a build session reads the detail.

## Built differently

What the Chapter 1 build (M108) changed from the sketches above, one line each.

  - *before-you-send*: the two internal notes are lines typed in H6 and H9, not cell notes, since the engine has no notes yet (M68); the drill also deletes a stale Old wk37 tab, puts back a typed-over gross profit found with Go To Special Constants and turns the gridlines off.
  - "Every tab on A1" became every tab on its home cell: B5 on a page with frozen panes, where Ctrl+Home lands in Excel, and A1 on the raw tab.
  - The daily columns run Monday to Saturday, the Clearcoat week, not Monday to Friday.
  - *combine-two-tabs*: the Combined block starts unformatted and takes its formats from Austin with Paste Special Formats, so a goal colors the cross-sheet links green; it adds AutoSum for the week and a last goal that traces a link with Ctrl+[.
  - *insert-and-amend*: two waiting lines, Insurance and Utilities, not one, plus a goal for their formats and one for the Week formula; Paste Special Formulas carries the total across.
  - The merged drills take new ids named after their titles: *get-around*, *enter-and-fill*, *format-the-weekly-page*. Old records under the removed ids are not carried over; nothing redirects drill ids.
  - *formula-sprint* fills its columns with Ctrl+Enter rather than fill down, so the $ anchor is typed once on the first row.
  - A drill may carry up to 20 goals (was 12), since the formatting drills step through a full page.
  - The page builder no longer widens the label column to fit the source line, which overflows across empty cells as in Excel.
  - Shares that always total 100% and links to another sheet are graded by what the formula reads, since the what-if check cannot move them.
