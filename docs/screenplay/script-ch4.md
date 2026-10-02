# hotkey.gg Script · Chapter 4: Data and Lookups

The shell for Chapter 4, revised 2026-09-28 after Wolf's note that Data and Lookups was thin: four lessons added (multi-criteria lookups, filter tricks, 3D references, case outputs with the sticky IF). Every line is **DRAFT**. Same anatomy, limits and redundancy rule as Chapters 2 and 3: a skill is taught once and cited by lesson number when it comes back.

## The chapter in brief

**Where the deal is.** The data room is open and three private-equity buyers are inside it, each with a diligence team sending questions through a log. Every question is the same shape underneath: pull the right number out of a dataset the page can't hold, cut it the way they asked, and show what happens if an assumption moves. The management case, the company's own forecast, needs sensitivities before a buyer will price it.

**The product.** The diligence pack: the question log answered, a KPI page that reads the export, a utilization dashboard (tables, not charts), and the management case with a case toggle and sensitivity tables, every toggle named.

**What the learner can say afterwards.** Why a model reads a dataset instead of holding it; how a lookup fails and how to make it fail loudly; what utilization, member share and break-even washes mean for a wash; how a case toggle and a data table answer "what if" without three copies of the file.

**The finance, defined through the car wash:**

  - **The question log** (4.1.1): the buyers' diligence questions, numbered, with an owner and a status; every answer points at a cell.
  - **Utilization** (4.3.2): washes done against washes the tunnel could do (capacity in cars an hour times hours open). Express washes run 10–20% on average and fill up on Saturdays; the peak is what a buyer wants to see.
  - **Member share** (4.3.2): member washes over all washes; the higher it is, the steadier the revenue.
  - **Contribution per wash and break-even** (4.5.4): ticket less the cost of a wash is what each wash contributes to the site's fixed costs; break-even washes are the daily site costs divided by that.
  - **Cases** (4.5.1): the management case is the company's forecast, the base case is what a buyer thinks will happen, and the downside is what they underwrite to, all in one model behind one switch.
  - **Sensitivity** (4.5.2): how an output moves when one input moves, shown as a table.

## The workbook

**Export**: about ninety rows, six sites × fifteen days (Sep 15–29): A date, B site code, C retail washes, D member washes, E total washes (formula), F retail revenue, G hours open. Planted: one site code misspelled, one day missing for one site.

**Lists**: the site list (code, name, cluster, capacity in cars an hour, hours open, daily site costs), the package list (code, name, price, fee), the month list, the case list (Management, Base, Downside), the manager bonus tiers (from Chapter 3).

**Q&A**: the question log: #, buyer (Sponsor A, B, C), question, owner, status, answer (a cell reference or a figure). Twelve questions; the chapter answers ten.

**Summary**: the KPI page the lessons build: a site × month cube, the KPI block, the answered questions.

**Scenarios**: the management case: inputs by case (washes a day per site, blended ticket, member share, sites at year end), the case switch, the outputs (revenue, site contribution, EBITDA), and the sensitivity tables.

**Dashboard**: utilization and member share by site, as tables with conditional formatting (2.5), no charts.

## 4.1 Lookups

*module: lookups*

**Story card, title** **DRAFT** The model can't hold the data.

**Story card, body** **DRAFT** Sponsor A's first question is simple (what's the Deluxe price at Domain), and the price list is on another sheet with forty rows. A lookup reaches into a table, finds a row by its key and brings back the column you asked for, so a page can read a dataset it could never hold. Every model a buyer sends you is built on them, and every one has a way to fail.

**Objective (data room)** **DRAFT** Lookups: why a model reads a dataset; VLOOKUP and HLOOKUP and how they fail; MATCH, then INDEX/MATCH; two-way INDEX/MATCH; XLOOKUP; approximate match for bands and IFERROR around a lookup; multi-criteria lookups; OFFSET and INDIRECT and why the standard avoids them.

**Page name** The question log, answered

### 4.1.1 Why lookups: a model reads a dataset it can't hold

*lesson: why-lookups · 6 goals*

**Brief** **DRAFT** The question log is the buyers' diligence questions, numbered, with an owner and a status, and every answer points at a cell. The first: what's the Deluxe price. You could type 15, and when the price list changes, the answer is wrong and nobody knows. A lookup finds the row for "D" in the package list and brings back its price, so the answer moves when the list does. Watch a typed answer and a looked-up one diverge. The key is `VLOOKUP`.

**Goals (outline)** **DRAFT**

1.  On Q&A, question 1's answer cell reads a typed 15, blue. Read the package list on Lists.
2.  Beside it, enter =VLOOKUP("D",Lists!$B$5:$E$7,3,FALSE) and read the Deluxe price come back from the list.
3.  Change the Deluxe price on Lists to 16, watch the lookup say 16 while the typed cell still says 15, then put it back.
4.  Best practice: an answer in the log is a reference to a cell that reads the data, never a typed figure; a buyer will change the data and expect the answer to move.
5.  Point the answer cell at the lookup and delete the typed one.
6.  Does it tie? Change the price again and watch the log answer follow.

**Done screen, line** **DRAFT** The answer reads the list now, so it can't be wrong the day the list changes.

### 4.1.2 VLOOKUP and HLOOKUP, and how they fail

*lesson: vlookup-hlookup-fail · 7 goals*

**Brief** **DRAFT** VLOOKUP(key, table, column number, FALSE) looks down the first column for the key and returns the nth column; HLOOKUP does it across a row. FALSE means exact match, and forgetting it is the first way it fails: TRUE returns the nearest smaller key from a list that isn't sorted. The second is the column number, which breaks when a column is inserted. The third is the key not in the first column. Build one of each, watch each break, and read the error it gives. The key is `VLOOKUP`.

**Goals (outline)** **DRAFT**

1.  Site name from code: Summary!C5 =VLOOKUP(B5,Lists!$B$5:$H$10,2,FALSE), filled down the six sites.
2.  Capacity from code: D5 with column 4.
3.  Fail one: leave off FALSE on a copy, read the wrong site come back for AUS-CED, then delete the copy.
4.  Fail two: insert a column inside Lists, left of capacity, and watch column 4 return the cluster, or a 0 when the blank column is fourth, then Ctrl+Z.
5.  Fail three: look up by name instead of code and get #N/A, because the name isn't in the first column.
6.  HLOOKUP: a month's revenue from the month row on Summary, keyed on the month label.
7.  Does it tie? Change a capacity on Lists and watch D5 follow.

**Done screen, line** **DRAFT** VLOOKUP works, and now you've seen the three ways it breaks.

### 4.1.3 MATCH, then INDEX/MATCH

*lesson: match-index-match · 8 goals*

**Brief** **DRAFT** MATCH answers one question: which row is this key on. INDEX answers another: what's in the nth row of this column. Together they do what VLOOKUP does without its faults: the key can be in any column, the return column is pointed at rather than counted, and an inserted column changes nothing. It's two functions instead of one, and it's the lookup the standard uses. Rebuild the site block with it. The key is `MATCH`.

**Goals (outline)** **DRAFT**

1.  MATCH alone first: in Summary!E5 enter =MATCH(B5,Lists!$B$5:$B$10,0) for the row number of the code, where 0 means exact.
2.  INDEX alone next: in F5 enter =INDEX(Lists!$C$5:$C$10,E5) to bring back the name in that row.
3.  Together in G5, =INDEX(Lists!$F$5:$F$10,MATCH(B5,Lists!$B$5:$B$10,0)) returns capacity with no column counting.
4.  Insert a column inside Lists again, read that nothing breaks, then Ctrl+Z.
5.  Tip from the desk: the hybrid you'll meet in inherited models is =VLOOKUP(B5,Lists!$B$5:$H$10,MATCH("Capacity",Lists!$B$4:$H$4,0),FALSE): MATCH counts the column, starting at the table's first column so the two counts agree. It cures the inserted column and still needs the key in the first column; INDEX/MATCH stays the standard.
6.  Look up by name, with MATCH on the name column and INDEX on the code column, because the key can sit anywhere.
7.  Best practice: INDEX/MATCH for anything that lives longer than a week; VLOOKUP for a one-off you'll delete.
8.  Does it tie? Change a capacity on Lists and watch G5 answer.

**Done screen, line** **DRAFT** Two functions make a lookup that survives an inserted column.

### 4.1.4 Two-way INDEX/MATCH: any site, any month

*lesson: two-way-index-match · 6 goals*

**Brief** **DRAFT** A two-way lookup finds a row and a column: revenue for any site in any month, from the site × month cube. INDEX takes a whole block and two positions (MATCH the site down the side, MATCH the month across the top), and one cell answers any pair. Wire the answer cell to two drop-down inputs (Data Validation arrives in 4.2.4; for now they're typed), so a buyer can ask any site, any month. The key is `INDEX`.

**Goals (outline)** **DRAFT**

1.  Read the cube on Summary (built in 4.3.1 from SUMIFS, a pasted block for now), with sites down B15:B20 and months across C14:E14.
2.  Two inputs, blue: H14 a site code, H15 a month label.
3.  Row position: I14 =MATCH(H14,B15:B20,0); column position: I15 =MATCH(H15,C14:E14,0).
4.  The answer: H17 =INDEX(C15:E20,I14,I15).
5.  Collapse it into one cell: =INDEX(C15:E20,MATCH(H14,B15:B20,0),MATCH(H15,C14:E14,0)).
6.  Does it tie? Change H14 to AUS-AIR and H15 to Sep and watch the answer move.

**Done screen, line** **DRAFT** One cell answers any site in any month.

### 4.1.5 XLOOKUP: exact, not-found, two-way

*lesson: xlookup · 6 goals*

**Brief** **DRAFT** XLOOKUP is the modern lookup: the key, the column to search, the column to return, and an optional "if not found". Exact match by default, any direction, and a two-way version by nesting one inside another. Banks lag versions, so the standard still reads INDEX/MATCH in most models you'll inherit; learn XLOOKUP so you can use it where the file allows and read it where you find it. The key is `XLOOKUP`.

**Goals (outline)** **DRAFT**

1.  Capacity from code: Summary!J5 =XLOOKUP(B5,Lists!$B$5:$B$10,Lists!$F$5:$F$10).
2.  Not found: look up a code that isn't there and read #N/A; add the fourth argument, "Not listed".
3.  Left-to-right or right-to-left: the code from the name, no rearranging.
4.  Nest them for both directions, =XLOOKUP(H15,C14:E14,XLOOKUP(H14,B15:B20,C15:E20)), and compare with the answer from 4.1.4.
5.  Best practice: XLOOKUP where the file is yours and the version allows; INDEX/MATCH in anything a bank's model will read. XMATCH is MATCH with exact match as the default, and it goes inside INDEX the same way where the version allows.
6.  Does it tie? Change a capacity and watch J5 follow.

**Done screen, line** **DRAFT** One function does what two did, when the file allows it.

### 4.1.6 Approximate match for bands, and IFERROR around a lookup

*lesson: approximate-match-bands · 6 goals*

**Brief** **DRAFT** Sometimes the key isn't in the list on purpose: a manager who did 312 washes earns the bonus for the 300 band, and the list holds only the band edges. That's approximate match (VLOOKUP with TRUE, MATCH with 1, XLOOKUP with -1) on a sorted list, returning the nearest key below. It replaces the IFS ladder from 3.1.2 with a table anyone can edit. And a lookup that can miss gets IFERROR (3.1.4) with an honest message. The key is `MATCH`.

**Goals (outline)** **DRAFT**

1.  Read the tier table on Lists, 0 → 0, 250 → 50, 300 → 100, 350 → 150, sorted ascending.
2.  Bonus by band in Summary!K5 is =VLOOKUP(C5,Lists!$J$5:$K$8,2,TRUE), so 312 returns 100.
3.  The same with INDEX/MATCH: MATCH(C5,Lists!$J$5:$J$8,1).
4.  Compare with the IFS from 3.1.2 on the same row: they agree, and only the table can be edited by someone who can't read a formula.
5.  Wrap an exact lookup that can miss as =IFERROR(XLOOKUP(...),"Not listed"), and read why a blank is worse than a message.
6.  Does it tie? Change the 300 band edge to 290 on Lists and watch the bonus column move.

**Done screen, line** **DRAFT** A band lookup replaced the IFS ladder, and a miss says so in words.

### 4.1.7 Multi-criteria lookups: a key column, a two-condition MATCH, SUMIFS as a lookup

*lesson: multi-criteria-lookups · 7 goals*

**Brief** **DRAFT** Sponsor B wants the washes for one site on one day, and no single column holds that key. Three ways, in the order the standard prefers: a key column that joins the two (site & "|" & date) so a normal INDEX/MATCH works; SUMIFS used as a lookup, when the answer is a number and the pair is unique; and the two-condition MATCH (MATCH(1, (sites=x)*(dates=y), 0)), which needs no helper column and works as an array. Build all three on the export and read when each is the right one. The key is `&`.

**Goals (outline)** **DRAFT**

1.  Build a key column on Export with H5 =B5&"|"&TEXT(A5,"yyyy-mm-dd") filled down, so site and date sit in one string (3.4.1).
2.  Two inputs on Summary, blue: a site code and a date; the built key beside them.
3.  INDEX/MATCH on the key column: washes for that site-day, exact match (4.1.3).
4.  SUMIFS as a lookup, =SUMIFS(washes, sites, site, dates, date), gives the same answer with no helper column, as the pair is unique.
5.  The array MATCH is =INDEX(washes, MATCH(1, (Export!B5:B94=site)*(Export!A5:A94=date), 0)), so read how TRUE×TRUE makes the 1 it finds.
6.  Best practice: a key column when the lookup returns text or must be audited by eye, SUMIFS when it returns a number, and the array MATCH when you can't add a column, noted in the file as an array.
7.  Does it tie? Change the date input and watch all three answers move together.

**Done screen, line** **DRAFT** Three ways to look up on two conditions, and you know which one to write.

### 4.1.8 OFFSET and INDIRECT, and why the standard avoids them

*lesson: offset-indirect-why-not · 7 goals*

**Brief** **DRAFT** OFFSET returns a range some rows and columns away from a starting cell; INDIRECT turns a text string into a reference. They're powerful and you'll meet them in other people's models, so learn to read them, and learn why the standard avoids them: both recalculate on every change (they're volatile, and a big model crawls), and neither shows the trace arrows what it reads, so an audit goes blind. Build one of each, watch the arrows fail, and rewrite both. The key is `OFFSET`.

**Goals (outline)** **DRAFT**

1.  OFFSET first, in Summary!L5 =OFFSET(Lists!$B$4,MATCH(B5,Lists!$B$5:$B$10,0),4), which reaches capacity the long way.
2.  Trace precedents on it (3.6.1), read that the arrow points at B4 and not at the capacity cell, then remove the arrows.
3.  INDIRECT next, in M5 =INDIRECT("Lists!F"&(4+MATCH(B5,Lists!$B$5:$B$10,0))), which reaches the same capacity from a built string.
4.  Insert a row above the Lists table, watch OFFSET and INDIRECT return the wrong cell while INDEX/MATCH in G5 holds, then Ctrl+Z.
5.  Rewrite both as INDEX/MATCH and delete the originals.
6.  INDEX(range, 0, n) returns a whole column, so =SUM(INDEX(C15:E20,0,2)) sums one month without OFFSET and the trace arrows can see it.
7.  Does it tie? Change a capacity and watch only the INDEX/MATCH cells follow honestly.

**Done screen, line** **DRAFT** You can read OFFSET and INDIRECT now, and you know why you won't write them.

### 4.1.C Challenge: a broken lookup summary rebuilt

*lesson: challenge-lookup-summary · 6 goals · four minutes*

**Brief** **DRAFT** A summary with five lookups: one without FALSE, one counting a moved column, one keyed on the wrong column, one OFFSET, one that errors silently. Rebuild every line with INDEX/MATCH or XLOOKUP so it ties.

**Goals (outline)** **DRAFT** Exact match restored · the moved column fixed with INDEX/MATCH · the key column fixed · OFFSET rewritten · IFERROR with a message · every line ties to Lists.

## 4.2 Lists and tables

*module: lists-and-tables*

**Story card, title** **DRAFT** Ninety rows, sorted, filtered, deduplicated.

**Story card, body** **DRAFT** Sponsor B wants the export by site and then by day, the Saturdays only, and a clean list of sites with no repeats. And they want the manager's inputs on the case sheet limited to choices from a list, so nobody types "Mangement". Sort, filter, Remove Duplicates and Data Validation are the list tools, and they change the data or what you see of it, so the rule is: on a copy, and with a total that knows what's filtered.

**Objective (data room)** **DRAFT** Lists: sort and multi-level sort; AutoFilter and filtered totals with SUBTOTAL; Remove Duplicates and the unique site list; Data Validation and drop-downs; filter tricks (visible cells only, wildcards, skip blanks); the modern list tools, UNIQUE, FILTER and SORT (pending Wolf, screenplay 9.1 question 12).

**Page name** The export, as a list

### 4.2.1 Sort and multi-level sort

*lesson: sort-multi-level · 6 goals*

**Brief** **DRAFT** Sorting rearranges rows, and it's the one list tool that changes the data's order for good, so it runs on a copy of the export, never on the sheet the cube reads. Alt, A, S, S opens the Sort dialog: a level for each column, ascending or descending, headers ticked. Sort the copy by site and then by date, then by revenue descending to read the best days first. The key is `Alt A S S`.

**Goals (outline)** **DRAFT**

1.  Copy Export!A4:G94 onto a new sheet, Export sort (1.3.3, 1.1.1).
2.  Land inside the block, Alt, A, S, S: sort by Site A to Z, add a level by Date oldest to newest, My data has headers ticked, OK.
3.  Read the block: six runs of fifteen days.
4.  Sort by Retail revenue largest to smallest, so the best days sit at the top.
5.  Best practice: sort a copy; the cube on Summary reads the export by position and a sort would silently re-point every link.
6.  Check it ties by changing a revenue figure on the copy and watching the original stay put, because they're separate now.

**Done screen, line** **DRAFT** You sorted a copy two ways, and the original stayed where the links expect it.

**Done screen, paragraph** **DRAFT** On a sorted copy, Subtotal (Alt, A, B) writes a SUBTOTAL(9) row at each change of site, a grand total and an outline, and Remove All takes them out again. It's a cut for a question nobody will ask twice; the page's own totals stay SUMIFS (4.3) and pivots (4.4).

### 4.2.2 AutoFilter and filtered totals with SUBTOTAL

*lesson: autofilter-subtotal · 7 goals*

**Brief** **DRAFT** A filter hides the rows that don't match, so the export can show only Saturdays, or only Domain, without moving anything. Ctrl+Shift+L turns it on; Alt+↓ on a header opens the menu. The trap: SUM adds hidden rows too. SUBTOTAL(109, range) adds only what shows, and SUBTOTAL(103, range) counts it, so a filtered total tells the truth. Answer Sponsor B's Saturday question. The key is `Ctrl+Shift+L`.

**Goals (outline)** **DRAFT**

1.  On Export, Ctrl+Shift+L: filter arrows on the headers.
2.  Alt+↓ on the Site header, pick AUS-DOM only, Enter. The same menu filters by rule: Number Filters (Greater Than, Top 10, Above Average) and Date Filters screen a column without ticking its values one by one.
3.  Read a SUM under the block, which takes in the whole export, against =SUBTOTAL(109,E5:E94) beside it, which reads only Domain.
4.  Add a date filter: Saturdays only, using the weekday key column (3.2.5).
5.  Count the visible rows with SUBTOTAL(103, A5:A94).
6.  Clear the filters (Alt, A, C) and confirm SUM and SUBTOTAL agree again.
7.  Does it tie? Filter to Airport and watch only the SUBTOTAL change.

**Done screen, line** **DRAFT** The rows you hid stayed out of the total, because SUBTOTAL knows what's showing.

### 4.2.3 Remove Duplicates and the unique site list

*lesson: remove-duplicates · 6 goals*

**Brief** **DRAFT** A clean list of sites is the spine of every summary, and the export has each site ninety times. Remove Duplicates (Alt, A, M) keeps the first of each and deletes the rest, but from a copy of the column, because it deletes. Then COUNTIF against the original proves the list is complete, and the misspelled code the export carries shows up as a seventh site. The key is `Alt A M`.

**Goals (outline)** **DRAFT**

1.  Copy Export!B4:B94 onto Lists at a spare column.
2.  Alt, A, M on it, headers ticked: seven unique values. Read them: one is AUS-DMO. The ticked columns define the duplicate: on a two-column copy with site and date both ticked, a row goes only when the pair repeats; with site alone ticked, every later row for that site goes, whatever else it holds.
3.  Find the misspelling in the export with Ctrl+F (1.3.2) and fix it; re-run Remove Duplicates: six.
4.  Prove completeness: beside each unique code, COUNTIF against the export (3.3.2); the counts sum to 90.
5.  Best practice: a unique list is data; keep it on Lists and let the cube and the validation lists read it.
6.  Does it tie? Add a row with a new code to the export and watch the COUNTIF proof fall short by one.

**Done screen, line** **DRAFT** Six sites made one list, and the seventh was a typo.

### 4.2.4 Data Validation and drop-downs

*lesson: data-validation-dropdowns · 6 goals*

**Brief** **DRAFT** The case sheet has an input for the case name, and someone will type "Mangement". Data Validation (Alt, A, V, V) limits a cell to a list, a range of numbers or a date, and shows a drop-down so the choice is picked, not typed. The list comes from Lists, so adding a case adds a choice. Wire the case picker and the site picker from 4.1.4, and set a number limit on the washes-per-day input. The key is `Alt A V V`.

**Goals (outline)** **DRAFT**

1.  On Scenarios, B4 is the case input. Alt, A, V, V: Allow List, Source =Lists!$L$5:$L$7, OK.
2.  Alt+↓ on B4: pick Base from the list.
3.  Type "Mangement" into B4: the validation refuses it. Read the message, then write a better one on the Error Alert tab.
4.  The site picker on Summary!H14: a list from the unique sites (4.2.3).
5.  A number limit: washes a day per site on Scenarios must be a whole number between 100 and 600.
6.  Does it tie? Pick Downside from the drop-down and watch the outputs move (the switch is 4.5.1; for now the inputs).

**Done screen, line** **DRAFT** Nobody can type a case that doesn't exist.

### 4.2.5 Filter tricks: visible cells only, wildcards, skip blanks

*lesson: filter-tricks · 7 goals*

**Brief** **DRAFT** A list does three things to the unwary. Copy a block with rows hidden by hand or folded in a group and they come too, unless you select visible cells only first (Alt+;), and while a filter copies only what shows, a block pasted onto a filtered list fills its hidden rows too. Search for a site by part of its name and COUNTIF wants a wildcard, * for any run of characters and ? for one. Paste a partial column over a full one and the blanks wipe what was there, unless Paste Special skips blanks. The key is `Alt+;`.

**Goals (outline)** **DRAFT**

1.  On the sorted copy from 4.2.1, hide fifteen rows by hand (select rows 20:34 and press Ctrl+9 (1.4.3)), then select the whole block, Ctrl+C, and paste on a scratch sheet: all ninety rows arrive, the hidden ones included.
2.  Ctrl+Z, select the block again, press Alt+; to keep only the visible cells, then copy and paste: seventy-five rows. Rows hidden by hand or folded in a group (2.4.2) travel with a copy unless Alt+; comes first.
3.  Wildcards: =COUNTIF(Export!B5:B94,"AUS-*") counts every Austin site; "AUS-?O?" finds Domain by pattern.
4.  SUMIFS with a wildcard: retail revenue for every site whose code ends in R.
5.  Take a column of corrections with gaps and Paste Special it over the original with Skip Blanks ticked, so only the filled cells land.
6.  Best practice: Alt+; before any copy from a block with hidden or grouped rows; a filter copies only what shows, but a block pasted onto a filtered list also lands in the rows the filter hides: clear the filter before you paste.
7.  Filter Export to Airport (4.2.2) and copy fifteen rows, no Alt+; needed. Then paste fifteen rows onto the filtered washes column, clear the filter and read where they landed, one unbroken run with other sites' rows among them, then Ctrl+Z.

**Done screen, line** **DRAFT** Visible cells only, a wildcard, and a paste that skips blanks. Three keys that each save an afternoon.

### 4.2.6 UNIQUE, FILTER and SORT: the modern list tools *(pending Wolf, screenplay 9.1 question 12)*

*lesson: dynamic-arrays · 6 goals*

**Brief** **DRAFT** Modern Excel does three of this module's jobs with a formula that spills its results into the cells below: UNIQUE(range) gives the unique list live, FILTER(range, condition) gives the matching rows, SORT orders them, and SEQUENCE writes 1 to n. They're live where Remove Duplicates and the filter are one-off, and they need a version of Excel that has them, which not every desk does. Learn them after the classic tools, and read the version note before you use them in a file you'll send. The key is `UNIQUE`.

**Goals (outline)** **DRAFT**

1.  On Lists, enter =UNIQUE(Export!B5:B94), watch six codes spill down, then add a row to the export and watch them become seven.
2.  Wrap it as =SORT(UNIQUE(Export!B5:B94)) to get the same list in order.
3.  =FILTER(Export!A5:G94,Export!B5:B94="AUS-DOM") pulls Domain's fifteen rows, and they stay live.
4.  =SEQUENCE(12) gives you a month counter typed in one cell.
5.  Best practice: dynamic arrays in a file that stays yours; the classic tools plus SUMIFS in anything a bank will open.
6.  Does it tie? Change a code in the export and watch the UNIQUE list change on its own.

**Done screen, line** **DRAFT** The list tools become live formulas, in the files that can use them.

### 4.2.C Challenge: a dump into a filtered, deduplicated list

*lesson: challenge-filtered-list · 6 goals · three minutes*

**Brief** **DRAFT** A raw dump on a copy. Sort it two levels, filter one site and count what shows with SUBTOTAL, build the unique site list and prove it, put a drop-down on the case cell.

**Goals (outline)** **DRAFT** Two-level sort · filter and SUBTOTAL · Remove Duplicates · COUNTIF proof · validation list · a number limit.

## 4.3 Summaries from raw rows

*module: summaries-from-raw-rows*

**Story card, title** **DRAFT** The KPI page.

**Story card, body** **DRAFT** Every buyer wants the same page: washes and revenue by site and by month, utilization, member share, and a way to ask any question of the export without touching it. The page is a set of SUMIFS reading the export by keys, laid out as a cube, with a KPI block on top and a checks block underneath, and it answers the log's questions one after another.

**Objective (data room)** **DRAFT** Summaries from raw rows: the SUMIFS cube filled both ways; the KPI block (washes per hour, member share, utilization); date-range criteria; the KPI page linked, labeled and checked; a buyer's question answered end to end; 3D references and grouped sheets across site tabs.

**Page name** The KPI page

### 4.3.1 The SUMIFS cube: site × month, filled both ways

*lesson: sumifs-cube · 6 goals*

**Brief** **DRAFT** SUMIFS you know from 3.3.3; the cube is what it becomes at scale. Sites down the side, months across the top, and one formula in the corner cell that reads the site from its row and the month from its column ($B15 and C$14), filled across and down, so eighteen cells are one formula. The month key on the export (3.2.3) is what the column criterion matches. Build the washes cube and the revenue cube. The key is `SUMIFS`.

**Goals (outline)** **DRAFT**

1.  On Summary, sites in B15:B20 (links to the unique list, 4.2.3), month keys in C14:E14 (typed as text: 2026-07, 2026-08, 2026-09).
2.  The corner: C15 =SUMIFS(Export!$E$5:$E$94,Export!$B$5:$B$94,$B15,Export!$H$5:$H$94,C$14), the month key column being H. Best practice: bounded, anchored ranges: whole-column references (E:E) work, but every SUMIFS then scans a million rows, and a databook with a few hundred of them crawls.
3.  Fill right and down: eighteen cells, one formula.
4.  Add a totals row and column with AutoSum, and since the grand total ties to SUM of the export, write that check in the Checks block.
5.  The revenue cube below it, the same way, on column F.
6.  Does it tie? Change one export row's washes and watch its cell and the totals move.

**Done screen, line** **DRAFT** One formula filled eighteen cells, and the grand total ties to the export.

### 4.3.2 The KPI block: washes per hour, member share, utilization

*lesson: kpi-block · 7 goals*

**Brief** **DRAFT** Utilization is washes done against washes the tunnel could do (capacity in cars an hour times hours open), and an express wash runs 10–20% on an average day and fills on Saturdays, so the peak matters as much as the mean. Member share is member washes over all washes; the higher it is, the steadier the revenue. Both are ratios built from the cube and the site list, with lookups (4.1.3) bringing capacity and hours in. Build the KPI block by site. The key is `INDEX`.

**Goals (outline)** **DRAFT**

1.  Capacity and hours by site into the block with INDEX/MATCH from Lists.
2.  Daily capacity: capacity × hours; period capacity: daily × the days in the export (a COUNTIFS on site, 3.3.2).
3.  Utilization: washes over period capacity, percent to one decimal, italic (2.1.3).
4.  Peak day: MAXIFS (3.3.4) on the export by site; peak utilization: peak over daily capacity.
5.  Member share: member washes (a SUMIFS on column D) over total washes.
6.  Read the block against the questions: Sponsor A's Q1 and Q2 point at these cells now.
7.  Does it tie? Change Airport's capacity on Lists and watch its utilization move and its washes not.

**Done screen, line** **DRAFT** Utilization and member share are built by site, and two of the buyers' questions point at them.

### 4.3.3 Date-range criteria: SUMIFS between two dates

*lesson: date-range-criteria · 6 goals*

**Brief** **DRAFT** "Revenue in the last seven days" is a SUMIFS with two conditions on the same column: on or after a start date, on or before an end date, written as ">="&start, with the comparison in quotes and the cell joined by &. SUMPRODUCT does the same the old way (3.3.5), and you'll see it in inherited models. Build a rolling-window block with a start and end date a buyer can type. The key is `&`.

**Goals (outline)** **DRAFT**

1.  Two inputs, blue: Summary!H25 start date, H26 end date.
2.  Washes in the window: H28 =SUMIFS(Export!$E$5:$E$94,Export!$A$5:$A$94,">="&H25,Export!$A$5:$A$94,"<="&H26).
3.  Revenue in the window, the same shape, on column F.
4.  The SUMPRODUCT version beside it: =SUMPRODUCT((Export!A5:A94>=H25)*(Export!A5:A94<=H26)*Export!E5:E94); equal.
5.  Best practice: comparison in quotes, cell outside, joined with &, because the commonest SUMIFS typo is a date inside the quotes.
6.  Does it tie? Move the end date back a day and watch both figures fall.

**Done screen, line** **DRAFT** Any window a buyer types gets summed from the export.

### 4.3.4 The KPI page: linked, labeled, checked

*lesson: kpi-page-linked-labeled-checked · 6 goals*

**Brief** **DRAFT** The blocks are built; now they become a page a buyer reads (2.3): a title from Inputs, a units line, section headers, the cubes and the KPI block in reading order, a source line, and a Checks block that ties the cubes to the export and the KPI ratios to their parts. Everything on the page is a link or a formula; nothing is typed but the inputs. The key is `Ctrl+1`.

**Goals (outline)** **DRAFT**

1.  Title and units line from Inputs (2.6.3, 2.6.5).
2.  Sections: Volume, Revenue, KPIs, Checks, each bold with a top border on its totals (2.3.3).
3.  Formats by line: the desk number format on washes and revenue, $ on the first and total rows of revenue, percent 1 italic on ratios (2.1).
4.  The Checks block: cube total to export SUM; revenue cube to export SUM; member share × washes to member washes; the roll-up flag (3.6.4).
5.  Gridlines off, widths set, print set-up (2.7.1).
6.  Does it tie? Change an export row and watch the page answer with the flag still OK.

**Done screen, line** **DRAFT** The KPI page reads the export end to end, and its own checks say so.

### 4.3.5 A buyer's question answered end to end

*lesson: question-end-to-end · 6 goals*

**Brief** **DRAFT** Sponsor C's question 7: "What was revenue per site per open hour in the last week, and which site led?" Read the log, decide the cut, build it from the pieces you have: the date window (4.3.3), the cube (4.3.1), hours from Lists (4.1.3), RANK (3.3.4). Then write the answer into the log as a reference to a cell, with the status set to Answered. That's the loop for every question in the room. The key is `=`.

**Goals (outline)** **DRAFT**

1.  Read Q7 on Q&A and set the window on Summary to the last seven days.
2.  Revenue in the window by site: a SUMIFS with the site and both date criteria.
3.  Open hours in the window: hours a day × days in window, by site.
4.  Revenue per open hour, and RANK to find the leader.
5.  On Q&A, point the answer cell at the leader's name and the figure, set Status to Answered, Owner to you.
6.  Does it tie? Move the window and watch the leader change on the log.

**Done screen, line** **DRAFT** One question took four pieces you already had, and the log points at the answer.

### 4.3.6 3D references and grouped sheets: forty site tabs in one formula

*lesson: 3d-references · 6 goals*

**Brief** **DRAFT** Head office keeps one tab per site, forty of them, every one laid out the same, and the buyers want the company total by line. A 3D reference sums the same cell across a run of sheets, =SUM(Domain:Airport!C10), so the total is one formula, and inserting a site tab inside the run picks it up. Grouping the sheets (Ctrl+Shift+PgDn selects the next) lets you enter one formula or one format on all of them at once. Build the company roll-up from the six Austin tabs. The key is `Ctrl+Shift+PgDn`.

**Goals (outline)** **DRAFT**

1.  Open one of the six site tabs, Domain to Cedar Park, and read it, since every one of them shares the same layout.
2.  On Summary, =SUM(Domain:CedarPark!C10): washes across all six; fill down the lines. 3D-sum the input lines only: subtotals and ratios on the roll-up are formulas on its own rows (1.6.2's rule for a total row), so the page proves its own arithmetic.
3.  Insert a new site tab between Riverside and South Lamar and watch the 3D total take it in, then delete it and press Ctrl+Z.
4.  Group the six tabs (land on Domain, Ctrl+Shift+PgDn five times) and read Group in the title bar: while it shows, anything typed lands on every grouped sheet. Add a check row on all six with one Ctrl+Enter, then ungroup by moving to Summary, a sheet outside the group (Ctrl+PgDn inside the group only changes the active sheet), and confirm the tag has gone before any other edit.
5.  Best practice: 3D references only across tabs that are truly identical, with a first and last "bookend" tab so a new site can never fall outside the run.
6.  Does it tie? Change a figure on Mueller's tab and watch the roll-up move.

**Done screen, line** **DRAFT** Six tabs summed in one formula, and a new tab joins the sum on its own.

### 4.3.C Challenge: a KPI block that ties to the export

*lesson: challenge-kpi-block · 6 goals · four minutes*

**Brief** **DRAFT** A fresh export and site list. The washes cube, utilization, member share, a date window, the checks, and one question answered into the log.

**Goals (outline)** **DRAFT** The cube · utilization · member share · a window · checks at zero · the log answer.

## 4.4 Pivot tables

*module: pivot-tables*

**Story card, title** **DRAFT** The fast cut, and where it stops.

**Story card, body** **DRAFT** Sponsor B's analyst wants three cuts of the export by tomorrow, and a PivotTable gives each in a minute: drag a field down, a field across, a field into values. It's the fastest way to see a dataset and the wrong thing to build a model on, because it holds a copy of the data and forgets to refresh. Use it for the cut, and GETPIVOTDATA to read it when a page must.

**Objective (data room)** **DRAFT** PivotTables: build and rearrange; group dates and set value settings; refresh, and GETPIVOTDATA to read a pivot from a page.

**Page name** The export, three ways

### 4.4.1 Build and rearrange

*lesson: pivot-build · 6 goals*

**Brief** **DRAFT** A PivotTable takes a flat export and summarizes it by whatever fields you drop into Rows, Columns and Values: washes by site, then by site and month, then by month and site, each in a few keystrokes. Alt, N, V, T inserts one; the field list does the rest, and F6 gets you into it by keyboard. Build the site-by-month cut and compare it with the SUMIFS cube. They agree, and only one of them is live. The key is `Alt N V T`.

**Goals (outline)** **DRAFT**

1.  Land in Export!A4, Alt, N, V, T, New Worksheet, OK.
2.  In the field list, put Site in Rows and Total washes in Values, and you get six rows and one column.
3.  Month key to Columns: the cube, in seconds.
4.  Swap Rows and Columns; then Retail revenue into Values beside washes.
5.  Compare the pivot's grand total with the cube on Summary: equal.
6.  To see whether it ties, change a row in Export and watch the pivot stay put, which is what the next lesson is about.

**Done screen, line** **DRAFT** You built the cube in seconds, on a copy of the data.

### 4.4.2 Group dates and value settings

*lesson: pivot-group-value-settings · 6 goals*

**Brief** **DRAFT** A pivot can group dates into months, quarters and years on its own, so the month key column isn't needed for a cut; and Value Field Settings switch a field from Sum to Count, Average or % of total, and set its number format. Group the export's dates by week, show revenue as a share of the column, and format it. The key is `Alt J T`.

**Goals (outline)** **DRAFT**

1.  Put Date in Rows, then on a date cell press Alt, J, T, G and group by Days, 7, which gives you weekly buckets.
2.  In Value Field Settings on Revenue, set Number Format to Number with no decimals, the separator and (1,234), the desk number format.
3.  A second Revenue field: Show Values As, % of Column Total.
4.  Count of days per site: Date into Values as Count. Count counts rows; for how many different members a site saw, Distinct Count appears in Value Field Settings only when the pivot was created with Add this data to the Data Model ticked, otherwise count against a Remove Duplicates list (4.2.3).
5.  Average washes per site-day: Total washes into Values as Average.
6.  Does it tie? Add a filter on Site to Airport and read its share.

**Done screen, line** **DRAFT** The pivot grouped the dates and counted, averaged and shared the values, and nothing was written by hand.

### 4.4.3 Refresh and GETPIVOTDATA

*lesson: pivot-refresh-getpivotdata · 6 goals*

**Brief** **DRAFT** A pivot holds a snapshot of its source and shows it until you refresh (Alt+F5), which is why the standard never builds a model on one. When a page has to read a pivot, GETPIVOTDATA fetches a value by its labels, so the reference survives a rearrangement; typing = and pointing at a pivot cell writes it for you. Refresh the pivot, read it from Summary, and turn the automatic GETPIVOTDATA off when you'd rather have a plain reference. The key is `Alt+F5`.

**Goals (outline)** **DRAFT**

1.  Change a row in Export and watch the pivot hold still until you press Alt+F5, and then it updates.
2.  On Summary, type = and point at the pivot's Domain total, then read the GETPIVOTDATA that writes itself.
3.  Rearrange the pivot and watch the GETPIVOTDATA still find Domain.
4.  Turn the automatic version off (PivotTable Options) and point again: a plain cell reference, which breaks on rearrangement.
5.  Best practice: cuts from a pivot, models from SUMIFS on the export; if a page must read a pivot, GETPIVOTDATA and a refresh before sending.
6.  Does it tie? Change Export, refresh, and watch the Summary cell follow.

**Done screen, line** **DRAFT** The pivot refreshes on command, and the page reads it by name.

### 4.4.C Challenge: an export summarized three ways

*lesson: challenge-three-cuts · 5 goals · three minutes*

**Brief** **DRAFT** A fresh export. Three pivots: site by month, week by site as a share, average washes by site; refresh; one GETPIVOTDATA on the page.

**Goals (outline)** **DRAFT** Pivot 1 · pivot 2 grouped and shared · pivot 3 averaged · refresh · GETPIVOTDATA.

## 4.5 Scenarios and sensitivity

*module: scenarios-and-sensitivity*

**Story card, title** **DRAFT** What if the ticket falls?

**Story card, body** **DRAFT** The management case is the company's own forecast; a buyer builds a base case from what they think will happen and a downside they can live with, and they want all three in one model with a switch, never three files. Then the questions: what if the blended ticket drops a dollar, what if member share slips, how many washes break even. A case toggle and a data table answer them on one sheet.

**Objective (data room)** **DRAFT** Scenarios and sensitivity: a case toggle with CHOOSE and INDEX; a one-way data table; a two-way data table; Goal Seek for break-even; the pass-through driver when a data table can't reach an input; case outputs side by side (a data table on the switch, and the sticky IF).

**Page name** The management case, with sensitivities

### 4.5.1 A case toggle with CHOOSE and INDEX

*lesson: case-toggle · 9 goals*

**Brief** **DRAFT** Three cases sit as three columns of inputs (washes a day per site, blended ticket, member share, sites at year end), and one cell, the switch, says which column is live. CHOOSE(switch, a, b, c) returns the nth argument; INDEX(row, switch) does the same from a range and is easier to extend. The live column feeds the model, so every output moves when the switch does, and the picker from 4.2.4 drives the switch. The key is `CHOOSE`.

**Goals (outline)** **DRAFT**

1.  On Scenarios, read the three input columns C:E (Management, Base, Downside) and the picker in B4.
2.  The switch as a number: B5 =MATCH(B4,Lists!$L$5:$L$7,0) (4.1.3).
3.  Live washes a day: G8 =CHOOSE($B$5,C8,D8,E8).
4.  Live ticket with INDEX: G9 =INDEX(C9:E9,$B$5); fill the pattern down the inputs.
5.  Build the outputs from the live column: revenue = sites × washes × 365 × ticket, site contribution, and EBITDA, the one-line version until Chapter 5 builds it properly.
6.  Color the live column green as links and the input block blue (1.1.5).
7.  Light up the live case with a formula rule on C7:E12 (2.5.2), =C$7=$B$4, with a light fill, so whichever column the picker names is the shaded one and a reader sees the case without reading the switch.
8.  Say which case on the page itself: A1 =$B$4&" case" (2.6.3), so a printout says Downside case on its own.
9.  Does it tie? Pick Downside and watch EBITDA fall, the shading move and the title change; Management and it rises. The older desk habit is OFFSET off the switch (OFFSET(C8,0,$B$5-1)), and some courses still teach it; it recalculates on every change and is blind to trace arrows (4.1.8), so the standard is CHOOSE or INDEX.

**Done screen, line** **DRAFT** One switch runs three cases, and there's no second copy of the file.

### 4.5.2 One-way data table: the ticket

*lesson: one-way-data-table · 6 goals*

**Brief** **DRAFT** A sensitivity shows how an output moves when one input moves. A data table (Alt, A, W, T) does it for a row of input values at once: EBITDA at a $12, $13, $14, $15 and $16 ticket, in one table, live. The layout is strict (the input values across the top, the output formula in the corner, the row input cell pointed at the ticket), and the table is an array you can't edit cell by cell. Build the ticket sensitivity. The key is `Alt A W T`.

**Goals (outline)** **DRAFT**

1.  On Scenarios, ticket values 12 to 16 across C20:G20; the corner B21 =EBITDA (a link to the output). The rule for a table's edge: its values are typed and blue, or stepped by formula off one typed base value in the middle, never linked to the input cell the table drives, or the grid returns wrong figures.
2.  Select B20:G21, Alt, A, W, T, Row input cell = the live ticket cell, OK.
3.  Read the row: EBITDA at each ticket.
4.  Try to edit one cell of the table: Excel refuses; read why (an array).
5.  Format the row (2.1), label it, and note the case it was run on.
6.  Does it tie? Switch the case and watch the whole row recalculate.

**Done screen, line** **DRAFT** Five tickets give five EBITDAs in one table that stays live.

### 4.5.3 Two-way data table: ticket × member share

*lesson: two-way-data-table · 6 goals*

**Brief** **DRAFT** The two-way table moves two inputs: tickets across, member share down, EBITDA in the grid. The table a buyer photographs. The corner cell holds the output; the row input and column input cells are the two inputs; and calculation set to "automatic except data tables" (Alt, M, X, E) keeps a big model fast, with F9 to recalculate the tables. Build it and read the corner where the downside lives. The key is `Alt A W T`.

**Goals (outline)** **DRAFT**

1.  Tickets across C25:G25, member share down B26:B30 (40% to 60%), the corner B25 = EBITDA. Both edges are typed, never linked to the two inputs the table drives (4.5.2).
2.  Select B25:G30, Alt, A, W, T, Row input = ticket, Column input = member share, OK.
3.  Read the grid; find the base case cell and mark it with a border (2.3.3).
4.  Alt, M, X, E: automatic except data tables; change an input and watch the grid hold until F9.
5.  Conditional format (2.5.2): cells below the downside EBITDA turn red.
6.  Does it tie? F9 after a change and watch the grid catch up.

**Done screen, line** **DRAFT** This is the table a buyer photographs: live, with the downside marked.

### 4.5.4 Goal Seek: break-even washes per site

*lesson: goal-seek-break-even · 6 goals*

**Brief** **DRAFT** Contribution per wash is the ticket less the cost of a wash, what each wash puts toward the site's fixed costs, and break-even washes are the daily site costs divided by it. You can solve that by hand, and Goal Seek (Alt, A, W, G) solves it by turning a dial: set this cell to that value by changing this input. It writes the answer over the input, so read it, note it, and put the input back. The key is `Alt A W G`.

**Goals (outline)** **DRAFT**

1.  On Scenarios, contribution per wash: ticket less cost per wash (Inputs), and daily site costs from Lists.
2.  Work break-even by hand as site costs over contribution per wash, and read the figure.
3.  Goal Seek: Set the site's daily contribution cell to 0, by changing washes a day, OK. Read the answer: the same.
4.  Note the answer in a labeled cell, blue, with "per Goal Seek" beside it, and restore the input.
5.  Best practice: Goal Seek overwrites an input; a data table doesn't. Reach for the table when you want the answer to stay live.
6.  Does it tie? Change the cost per wash and re-run Goal Seek; the break-even moves.

**Done screen, line** **DRAFT** You found the washes a site needs to break even by hand and by Goal Seek, and they agree.

### 4.5.5 When data tables fail: the pass-through driver

*lesson: self-referencing-if · 7 goals*

**Brief** **DRAFT** A data table can only move an input on its own sheet, and a big model keeps inputs on Inputs. The fix is a pass-through driver: a cell on the table's sheet that reads the real input (=IF(B40="",Inputs!B6,B40)), so the table drives the local cell and the model reads it, and when the table isn't running, the cell passes the input through. Build it, and see the table work across sheets. The key is `IF`.

**Goals (outline)** **DRAFT**

1.  Move the ticket input to Inputs, watch the one-way table from 4.5.2 error, and read why.
2.  On Scenarios, a pass-through cell: B40 blank; B41 =IF(B40="",Inputs!B6,B40).
3.  Point the model's ticket at B41.
4.  Rebuild the table with Row input cell = B40; it runs.
5.  Best practice: give the pass-through the label "data table driver - leave blank" so nobody types into it.
6.  Tip from the desk: a table whose cells all read the same isn't reaching its input: the model reads another cell, or a switch has routed around it. Label a table with the setting it needs and grey it out with a formula rule on the switch (2.5.2); 5.6.6's exit-multiple table, dead while the terminal switch is on perpetuity, takes both.
7.  Does it tie? Change the ticket on Inputs, F9, and watch the table follow.

**Done screen, line** **DRAFT** The table reaches an input on another sheet, through one honest cell.

### 4.5.6 Case outputs side by side: a data table on the switch, and the sticky IF

*lesson: case-outputs-side-by-side · 7 goals*

**Brief** **DRAFT** The board wants all three cases on one page, and a switch shows one at a time. Two ways to hold every case's outputs at once. The clean one: a one-way data table (4.5.2) whose row input is the case switch itself (1, 2, 3 across the top, revenue and EBITDA down the side), and the table runs the model three times. The other is the sticky IF: a cell that reads the live output when its case is selected and otherwise reads itself, =IF(Case=2, live, self), a self-reference that holds its last value, which needs iteration on and a note that says so. Build both; keep the table. The key is `Alt A W T`.

**Goals (outline)** **DRAFT**

1.  The output block: revenue, site contribution, EBITDA down B45:B47; the case numbers 1, 2, 3 across C44:E44; the corner links to the live outputs.
2.  Select B44:E47, Alt, A, W, T, Row input cell = the switch (4.5.1's number), OK: three cases side by side, live.
3.  Label the columns from Lists (Management, Base, Downside) by INDEX (4.1.3).
4.  The sticky IF (the formula other people call the self-referencing IF, because it reads its own cell): in G45, =IF($B$5=2, live EBITDA, G45), iteration on (5.3.5's breaker sits on Inputs); switch to Base, watch it take the value; switch away, watch it hold.
5.  Read the cost: a self-referencing cell shows its last value and nobody can tell from the sheet; label it "sticky - holds Base case" and color it. A sticky cell re-entered or edited while its case is off resets to 0, and a block of them refills only by cycling the switch through each case, so mark the block do-not-touch and say plainly that it is not live.
6.  Best practice: the data table when the output is a handful of lines; the sticky IF when a table can't reach the input or the model is too slow to run three times, and always with a label, because a sticky cell is a hardcode that looks like a formula.
7.  Does it tie? Change a Downside input and watch its column in the table move while the sticky Base cell holds.

**Done screen, line** **DRAFT** Three cases on one page, live from a table, and you know when a sticky IF is the honest exception.

### 4.5.C Challenge: a three-case model with a sensitivity table

*lesson: challenge-three-cases · 6 goals · four minutes*

**Brief** **DRAFT** Three input columns and a blank output block. The switch, the outputs, a one-way and a two-way table, break-even by Goal Seek, the pass-through cell.

**Goals (outline)** **DRAFT** CHOOSE and INDEX switch · outputs live · one-way table · two-way table · Goal Seek noted · pass-through driver · the case-output table on the switch.

## 4.6 Names and structure

*module: names-and-structure*

**Story card, title** **DRAFT** Name the switch, not everything.

**Story card, body** **DRAFT** The pack is a dozen sheets now, and the case switch is read from six of them. A name turns Scenarios!$B$5 into Case, so a formula reads like English and the reviewer finds the switch by name. But a model with a hundred names is worse than one with none. Name the toggles and the key inputs, manage them, and let the picker read the list by name.

**Objective (data room)** **DRAFT** Names and structure: naming toggles and key inputs, sparingly; the Name Manager; a validation list driven by a name.

**Page name** The pack, wired

### 4.6.1 Naming toggles and key inputs, sparingly

*lesson: naming-sparingly · 6 goals*

**Brief** **DRAFT** You named one cell in 1.3.5; now decide which cells deserve it. The rule: the case switch, the as-of date, the cost per wash, the discount rate, all inputs a formula on another sheet reads and a reviewer will look for. Not the cube, not the totals. Define Name (Alt, M, M, D) or the Name Box; then rewrite the switch formulas to read Case, and watch them become readable. The key is `Ctrl+F3`.

**Goals (outline)** **DRAFT**

1.  Name Scenarios!B5 Case, from the Name Box.
2.  Name Inputs!B6 Ticket and Inputs!B4 CostPerWash (the second from 1.3.5, check it still exists).
3.  Rewrite G9 on Scenarios as =INDEX(C9:E9,Case); read it aloud.
4.  Rewrite one cross-sheet formula that read Scenarios!$B$5 to read Case.
5.  Best practice: a name for a cell that's read from other sheets and that a reviewer will hunt for; nothing else.
6.  Does it tie? Ctrl+G, Case, Enter lands on the switch; change it and the pack answers.

**Done screen, line** **DRAFT** Four cells got names, and each is one a reviewer would look for.

### 4.6.2 The Name Manager

*lesson: name-manager · 6 goals*

**Brief** **DRAFT** The Name Manager (Ctrl+F3) lists every name in the file, where it points and what it holds, including the ones somebody left pointing at #REF! after they deleted a sheet. Read the list, fix a broken name, rename one, delete a stray, and use Paste Names (F3) to put the list on a sheet where the reviewer can see it. The key is `Ctrl+F3`.

**Goals (outline)** **DRAFT**

1.  Press Ctrl+F3 and read the list, which holds your four plus two strays someone left, one of them pointing at #REF!.
2.  Delete the #REF! name; edit the other to point at the right cell.
3.  Rename CostPerWash to Cost_Per_Wash and watch every formula follow.
4.  F3 on a blank cell: Paste List, so the names and their references sit on the Cover for the reviewer.
5.  Scope: a name can belong to one sheet or the workbook; read which yours are. Copying a sheet that holds names makes sheet-scoped duplicates of them, which is where the strays in goal 1 came from: read the Scope column before you delete one.
6.  Does it tie? Ctrl+G to each name in turn; every one lands.

**Done screen, line** **DRAFT** Every name in the file is listed, fixed and on the Cover.

### 4.6.3 A validation list driven by a name

*lesson: validation-list-by-name · 5 goals*

**Brief** **DRAFT** The case picker (4.2.4) reads a range on Lists; name that range Cases and the picker reads =Cases, which survives the list moving and reads on any sheet. It's the pattern for every drop-down in the pack: a named list on Lists, a validation that reads the name, a MATCH that turns the choice into a number. The key is `Alt A V V`.

**Goals (outline)** **DRAFT**

1.  Name Lists!L5:L7 Cases.
2.  On Scenarios!B4, Data Validation, List, Source =Cases.
3.  Move the list on Lists down five rows: the picker still works.
4.  A second picker on Summary for the site, reading a named unique list, Sites.
5.  Does it tie? Add a fourth case to Cases and watch it appear in the drop-down.

**Done screen, line** **DRAFT** The picker reads a name, so the list can move and the picker won't notice.

### 4.6.C Challenge: a model's toggles named and wired

*lesson: challenge-toggles-named · 5 goals · three minutes*

**Brief** **DRAFT** A model with typed switches and a broken name. Name the switch and the key inputs, fix the Name Manager, drive the picker by name, paste the list on the Cover.

**Goals (outline)** **DRAFT** Four names · the switch by name · the #REF! fixed · the picker by name · Paste List.

## 4.7 Project and assessment

*module: ch4-project-and-assessment*

**Story card, title** **DRAFT** The diligence pack.

**Story card, body** **DRAFT** A fresh export, a fresh question log with eight open questions, a case sheet with three columns and no switch. Answer the log, build the KPI page and the dashboard, wire the case and its sensitivities, name what deserves it. Build it, then build it again on the clock. The assessment is the test-out.

**Objective (data room)** **DRAFT** From the raw export to the answered log, the utilization dashboard and the management case switch; the assessment is the test-out.

**Page name** The diligence pack

### 4.P Project: the diligence pack

*lesson: ch4-project · about 16 goals · no clock*

**Outline** **DRAFT** Lookups for capacity, hours and prices with INDEX/MATCH · the unique site list and a proof · the site picker and case picker by validation · the cube filled both ways · the KPI block with utilization and member share · a date window · a pivot for one cut, refreshed, read by GETPIVOTDATA · the case switch · one-way and two-way tables · Goal Seek break-even noted · the pass-through driver · names on the switch and key inputs · the checks block with the flag · eight log answers pointing at cells · Does it tie?

### 4.A Assessment: a fresh export, twelve minutes

*lesson: ch4-assessment · about 16 goals · twelve minutes · hard clock, no help, keyboard only*

**Outline** **DRAFT** Another cluster's export, log and case sheet, sized by start and end state. Pass is Verified; this is also the test-out.

## Keys and functions this chapter teaches

VLOOKUP, HLOOKUP, MATCH, INDEX, XLOOKUP, CHOOSE, OFFSET, INDIRECT (read, not written), INDEX(range,0,n), IFERROR around a lookup, a key column with &, SUMIFS as a lookup, the two-condition array MATCH; Alt A S S, Ctrl+Shift+L, Alt+↓, Alt A C, SUBTOTAL(109) and (103), Alt A M, Alt A V V, Alt+; (visible cells only), wildcards * and ?, Paste Special Skip Blanks; UNIQUE, FILTER, SORT, SEQUENCE (pending); SUMIFS at scale, ">="&cell criteria, MAXIFS (3.3.4, used), 3D references, Ctrl+Shift+PgDn grouped sheets; Alt N V T, the field list, Alt J T G, Value Field Settings, Alt+F5, GETPIVOTDATA; Alt A W T (including on the case switch), Alt A W G, Alt M X E, F9, the sticky IF, the active-case highlight (a formula rule reading the picker) and the case name in the title; Ctrl+F3, Alt M M D, F3, the Name Box.

## Engine needs

VLOOKUP with TRUE (approximate on sorted lists), HLOOKUP, XLOOKUP with not-found and nested two-way, CHOOSE, OFFSET, INDIRECT (with the trace-arrow blindness reproduced), UNIQUE/FILTER/SORT/SEQUENCE spilling (if 9.1 q12 is a yes); the Sort dialog with levels; AutoFilter with the header menus and SUBTOTAL respecting hidden rows; Remove Duplicates; Data Validation lists, whole-number limits and error alerts; PivotTables with rows, columns, values, date grouping, value settings, % of column, refresh and GETPIVOTDATA; data tables (one- and two-way) and the "automatic except data tables" mode; Goal Seek; the Name Manager with scope, Paste List and a #REF! name; Alt+; visible-cells selection; wildcards in COUNTIF/SUMIFS; Paste Special Skip Blanks; 3D references across a sheet run and grouped-sheet entry; array evaluation of MATCH(1,(a=x)*(b=y),0); a self-referencing IF that holds under iteration.

## Open for Wolf's bucketing pass

  - 4.2.6 (dynamic arrays) stays in only if 9.1 question 12 is a yes; the module is whole without it.
  - 4.5.1 builds a one-line EBITDA from the live case so the tables have an output; Chapter 5 builds the real one. Keep the one-liner, or borrow Chapter 5's revenue build early.
  - 4.6 is three short lessons; it could be two (fold 4.6.3 into 4.6.1) if the chapter runs long.
  - The Dashboard sheet is tables with conditional formatting, no charts (screenplay section 5 coverage note); confirm charts stay out at launch.
  - Source pass (2026-09-30): the fold-back plan in claude/source-checklist.md (section H) is applied to this chapter as DRAFT (28 edits, including 4.2.5 rebuilt on hidden rows and 4.5.5 renamed the pass-through driver). Wolf's calls of that day are in the decision log (screenplay 11); what was held back stays listed in the checklist's section B.

## Built differently

### 4.1 (r4-lessons-a)
- The package list is at Lists!B14:E16, not B5:E7. Capacity is column 5 of B:H, and the cube runs by week, not by month.
- 4.1.2: the failures come in this order: no FALSE, keyed by name, then a column insert.
- 4.1.4: the inputs are C34 and C35 and the answer is C38, not H14, H15 and H17.
- 4.1.6: the bonus key is the cube total divided by 15, not C5.
- 4.1.7: the inputs are planted, not typed. In each lesson the labels and formats are planted, so the learner writes only formulas.
- 4.1.8: OFFSET and INDIRECT go in Summary N and O, not L and M, and the row is inserted at Lists row 5.
- The nested XLOOKUP sits in Summary J19 and the array MATCH in J20.
- The best-practice goals are folded into teach lines.
- 4.1.C runs for 180 seconds, not four minutes, and is graded by 5 goals and 4 graders. Its seed shuffles another cluster's site list.

### 4.6 and 4.7 (r4-lessons-d)
- Names are made with Define Name (Alt M M D), not the Name Box. The names list is pasted on Inputs, not Cover.
- 4.6.2 has one stray name, OldTicket, which points at a wrong cell rather than reading #REF!. There is no second stray, and a Go To by name goal is added.
- 4.6.3: moving the list five rows and adding a fourth case appear in a teach line and the closing only. The closing shows the drop-down.
- 4.6.C works on Case, Cases, Cost_Per_Wash and Ticket: Ticket is re-pointed and a stray Ticket_old is deleted.
- 4.P has no pivot goal. The sensitivity tables, dashboard, roll-up and per-hour block come pre-built, and the window dates come pre-typed.
- 4.A runs on Dallas. The switch is in C11 and the picker in C10, not B5 and B4.

### 4.4 and 4.5 (r4-lessons-c)
- 4.4.2 groups dates by the export's Week key, not with Alt J T G.
- Pivots hold one value field at a time. There is no Site filter, and Value Field Settings has no number format.
- GETPIVOTDATA is typed, not generated automatically.
- Pivots sit on a sheet named Cuts.
- 4.4.2 reads Riverside's count as 15 rows against 14 days reported.
- The 4.4.3 correction is to member washes on Export!D5 and Domain!C6, and it carries into 4.5.
- The data tables sit in D:H with their corner in column C.
- The case picker and switch are at C10:C11, not B4:B5.
- The base case is marked bold, not bordered.
- The Goal Seek answer is noted as 121.
- The pass-through driver is at C13:C14. The demo of the error when the input moves is skipped.
- The case table is D49:F54. The sticky IF is built, watched and then removed. The goal to color the live column green is dropped.
- 4.5.C holds Base's member share at 50% and has no separate pass-through goal.
- Both challenges grade figures against the learner's own model.

### 4.2 and 4.3 (r4-lessons-b)
- The cube runs by week, not by month, because the export covers a fortnight.
- The pickers are at Scenarios C10 and Summary C34.
- Dynamic arrays are done on a Scratch sheet.
- 4.2.5 shows the hidden-rows step only through Alt+;.
- SUMPRODUCT is typed and then cleared.
- 4.2.3 deletes the typo row rather than running Remove Duplicates again.
- In 4.3.1 the learner types the totals.
- 4.3.4 skips the sections and formats, which are already in place.
- 4.3.6 skips the insert-tab step and uses one tab check, =F7-F5-F6.
- 4.2.C always filters the same site, AUS-AIR.
- 4.3.C keeps the script's title, "A KPI block that ties to the export" (the check that flagged it was fixed).

### Joined up (r4-int)
- 4.2.1 starts on 4.1.8's end and plants the module's start (4.1's scaffolds cleared, the site block on INDEX/MATCH), so 4.1 to 4.7 is one chain.
- The project and assessment read the case sheet as 4.5 built it: the sensitivities and the cases side by side are real Data Tables (D:H and D49:F54), and the C58 check reads =ROUND(INDEX($D$54:$F$54,Case)-C24,0).
- The 4.4 and 4.5 ids are short (pivot-build-rearrange, case-outputs-side-by-side, challenge-three-case-model and so on).
