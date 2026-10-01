# hotkey.gg Script · Chapter 3: Formulas

The shell for Chapter 3 (Wolf, 2026-09-27: develop the full curriculum within his guidance, shells for Chapters 2–6 first, then a 20–30 point feedback pass, then code, then play). Every line is **DRAFT**. Same anatomy and limits as Chapters 1 and 2 (screenplay section 2; brief ≤ 5 sentences and ≤ 110 words ending "The key is `X`."; goals ≤ 140 characters; every lesson closes with "Does it tie?"; sentences with verbs). The redundancy rule: a skill is taught once, in one lesson, and later lessons use it by name without re-teaching it; where a lesson leans on an earlier one, the earlier lesson is cited in brackets.

## The chapter in brief

**Where the deal is.** First-round diligence. The buyers who read the book want the business site by site, and they'll only trust numbers that tie to the system that recorded them. The point-of-sale system in every tunnel logs each wash as a row, and that export is the clean truth. The trouble is that it doesn't agree with what the site managers sent in Chapter 1, and somebody's half-built Summary sheet doesn't tie to either. Reconciling them is the databook.

**The product.** The KPI databook: every wash rolled up to a site × package summary, member and retail revenue separated, member tenure and churn, a reconciliation of the POS to the managers' numbers with the check at zero, and a valued new-site case on the Cedar Park loan. Every number a formula that reads the export.

**What the learner can say afterwards.** Why a row-level export is the only number a buyer trusts; what a member wash is worth; how a monthly fee turns into revenue; what a blended ticket is; how a loan payment splits into interest and principal; what NPV and IRR say about a new site; how a reconciliation is built and read.

**The finance, defined through the car wash** (defined where it first appears):

  - **The point-of-sale export** (3.1.1): one row per wash (date, site, package, member or retail, amount). Retail washes carry the price; member washes carry zero, because the member paid on the first of the month.
  - **Target and threshold** (3.1.1): the washes a site has to do in a day to cover its site costs; below it, the site loses money that day.
  - **Manager bonus tiers** (3.1.2): a bonus that steps up at 250, 300 and 350 washes a day, the reason nested IFs exist, and why MIN and MAX often replace them.
  - **Site age and vintage** (3.2.1): years since a site opened; new sites ramp for two years, so a buyer reads them separately.
  - **Member tenure and churn** (3.2.2): months from joining to cancelling; churn is the share of members who cancel in a month.
  - **Blended ticket** (3.3.5): total revenue over total washes, member washes included, so it's lower than the retail price list.
  - **Reconciliation** (3.3.6): two counts of the same thing, from two sources, and the difference explained line by line until it's zero.
  - **The site-build loan** (3.5.1): principal, rate, term; a payment that stays the same while its split between interest and principal shifts.
  - **NPV, discount rate, IRR, payback** (3.5.2–3.5.3): what a site's future cash is worth today at the return an investor requires; the rate at which a project's NPV is zero; the year the cash out is recovered.

## The workbook

Six sheets. Figures are illustrative and easy (Wolf); the build session sets exact values and grader states.

**Sites**: B: code, C: name, D: cluster, E: opened, F: tunnel capacity (cars an hour), G: hours open a day, H: daily wash target.

| Code | Site | Cluster | Opened | Capacity | Hours | Target |
| :- | :- | :- | :- | :- | :- | :- |
| AUS-DOM | Domain | Austin | 3/15/2019 | 120 | 14 | 250 |
| AUS-MUE | Mueller | Austin | 8/1/2020 | 100 | 14 | 220 |
| AUS-RIV | Riverside | Austin | 11/10/2020 | 100 | 14 | 220 |
| AUS-SLA | South Lamar | Austin | 5/20/2021 | 120 | 14 | 250 |
| AUS-AIR | Airport | Austin | 2/1/2023 | 140 | 14 | 280 |
| AUS-CED | Cedar Park | Austin | 9/8/2026 | 140 | 14 | 200 |

**Packages**: code, name, retail price, monthly member fee: B Basic $10 / $25 · D Deluxe $15 / $30 · U Ultimate $20 / $35.

**Members**: about forty rows: id (M0001…), home site code, plan (B/D/U), joined, cancelled (blank if active). A handful joined in 2024, most in 2025–26, six cancelled.

**Transactions**: about ninety rows, Sep 15–29, 2026: A date, B site code, C package code, D member id (blank for retail), E amount (the retail price, or 0 for a member wash), F memo ("Wash D @ AUS-DOM (kiosk)"). Planted: three amounts typed as text, two site codes with a trailing space, one memo with the package in lower case.

**Summary**: started by someone else: a site × package block of counts and revenue with a SUMIF whose range is a row short, a typed 1,240, a text "12", and a total that doesn't tie to Transactions. The chapter rebuilds it.

**Loans**: the Cedar Park build loan: principal $3,500,000, 7.0% a year, 10 years, monthly payments from 10/1/2026; a schedule block; and the new-site case: an all-in cost of $5,000k, land included, cash flows $900k, $1,050k, $1,150k, $1,200k, $1,250k over five years plus a $7,000k sale value in year five, discount rate 10%.

## 3.1 Logic

*module: logic*

**Story card, title** **DRAFT** Which sites are pulling their weight?

**Story card, body** **DRAFT** The buyers' first question is the CFO's oldest one: which sites clear their daily target, which don't, and what the managers earn when they do. The point-of-sale export has every wash; the Sites sheet has every target. A formula that can ask a question and act on the answer turns ninety rows into a page of flags.

**Objective (data room)** **DRAFT** Logic: IF on a threshold; nested IF against IFS against MIN and MAX; AND, OR and NOT for compound flags; IFERROR and the override pattern.

**Page name** The flags block

### 3.1.1 IF on a threshold

*lesson: if-on-a-threshold · 7 goals*

**Brief** **DRAFT** The point-of-sale export logs one row per wash (date, site, package, member or retail, amount), and it's the only number a buyer trusts, because a machine wrote it. A site's target is the washes it needs in a day to cover its site costs; below it, the site loses money that day. IF asks a question and gives one answer if it's true and another if it's false: =IF(C5>=D5,"On target","Below"). Build the daily flag for every site-day on a summary block. The key is `IF`.

**Goals (outline)** **DRAFT**

1.  Read the site-day block on Summary: sites down B5:B10, Sep 15 washes in C5:C10, the target in D5:D10 (links to Sites!H).
2.  Type =IF(C5>=D5,"On target","Below") in E5 and read the result against the figures.
3.  Fill E5 down to E10 with Ctrl+D (1.3.3); five on target, one below.
4.  Change the words to numbers: =IF(C5>=D5,1,0) in F5:F10, so the flags can be summed.
5.  Count the sites on target in F12 with SUM (1.6.2), because a flag column you can add up is a report.
6.  A flag that reads the gap instead: G5 =IF(C5>=D5,C5-D5,0), the washes above target, filled down.
7.  Does it tie? Change Mueller's washes in C6 to 230 and watch E6, F6 and F12 answer.

**Done screen, line** **DRAFT** You asked one question six times, and the page says which sites cleared the bar.

### 3.1.2 Nested IF, IFS, and MIN and MAX instead

*lesson: nested-if-ifs-min-max · 8 goals*

**Brief** **DRAFT** The manager bonus steps up in tiers: $50 a day at 250 washes, $100 at 300, $150 at 350. A nested IF answers that (an IF inside an IF inside an IF), and it's the formula people write first and regret first, because nobody can read it. IFS lists the tests in order; MIN and MAX cap and floor a value in one call, and replace most towers. Build the bonus three ways and keep the one a reviewer can read. The key is `IFS`.

**Goals (outline)** **DRAFT**

1.  Read the tier table on Summary!J5:K8, where 250 → 50, 300 → 100 and 350 → 150.
2.  The tower works: fill H5 =IF(C5>=350,150,IF(C5>=300,100,IF(C5>=250,50,0))) down, then press F2 and count the parentheses.
3.  IFS: in I5, =IFS(C5>=350,150,C5>=300,100,C5>=250,50,TRUE,0). Same answers, readable top to bottom.
4.  Cap it with MIN: a bonus can't exceed $150, so wrap I5 in MIN(…,150) and watch nothing change, because the tiers already stop there.
5.  Floor it with MAX: washes above target can't go negative, so rewrite G5 as =MAX(C5-D5,0) and compare it with the IF version from 3.1.1.
6.  Choose: delete the tower in H, keep IFS in I, and label the column Bonus ($/day).
7.  Best practice: when a test only caps or floors, MIN or MAX says it in one call, and when it picks from a list of bands, IFS does. In Chapter 4, a lookup on the tier table replaces both.
8.  Does it tie? Change Domain's washes to 360 and watch the bonus step to 150.

**Done screen, line** **DRAFT** You wrote the same test three ways, and only the one a reviewer can read survived.

### 3.1.3 AND, OR and NOT

*lesson: and-or-not · 7 goals*

**Brief** **DRAFT** Some questions have two parts: a site is a concern if it's below target AND it's more than two years old, because a new site is allowed to ramp. AND is true only when every test is true, OR when any is, NOT flips one. They sit inside IF, and each returns TRUE or FALSE on its own, which you can read straight off the sheet before you wrap it. Build the compound flags the buyers will ask about. The key is `AND`.

**Goals (outline)** **DRAFT**

1.  Read the site age in years on Summary!L5:L10, a link from Sites!E for now, because the date math behind it is 3.2.1.
2.  Type =AND(C5<D5,L5>2) in M5 with no IF around it yet, fill it down and read the TRUE or FALSE column.
3.  Wrap it: N5 =IF(AND(C5<D5,L5>2),"Concern","–"), filled down.
4.  A site needs a visit if it's below target OR under 110 cars an hour of capacity, so O5 =IF(OR(C5<D5,Sites!F5<110),"Visit","–").
5.  The ramping sites are the ones NOT over two years old, so P5 =IF(NOT(L5>2),"Ramping","–").
6.  Each of the three flags reads TRUE or FALSE underneath when you press F2 on it, so read one back.
7.  Does it tie? Change Cedar Park's age to 3 and watch its flag move from Ramping to Concern.

**Done screen, line** **DRAFT** Each two-part question is answered in one cell, and you can read every answer before it's wrapped.

### 3.1.4 IFERROR and the override pattern

*lesson: iferror-and-the-override · 8 goals*

**Brief** **DRAFT** Two things break a clean block: a division by a site with no washes yet, and a manager who wants to type over a formula "for this week only". IFERROR catches the first, so =IFERROR(E5/C5,0) shows the figure you choose instead of #DIV/0!. The override pattern handles the second with a blue override cell beside the formula, and ISNUMBER tells the formula to read the override whenever it's filled. That way the formula survives, the override is visible, and nobody types over a live cell. The key is `IFERROR`.

**Goals (outline)** **DRAFT**

1.  Read revenue per wash on Summary!Q5:Q10, revenue over washes, where Cedar Park's C10 is 0 for the day and Q10 says #DIV/0!.
2.  Wrap Q5 in IFERROR with 0 as the fallback and fill down: the error is gone and the page adds.
3.  Best practice: IFERROR hides every error, so use it only where the error is expected (a zero denominator) and never to silence a #REF!. A 0 fallback is right only where the line is added up; on a ratio that feeds nothing a 0 reads as a real figure, so the desk writes "NM" (not meaningful) or a dash, the code that comes back on negative multiples in 6.1.3.
4.  The override column: R5:R10 is blue and empty, labeled Override (washes).
5.  S5 =IF(ISNUMBER(R5),R5,C5), filled down, is the washes the page uses: the override if someone typed one, the link if not.
6.  Tip from the desk: inherited models write the test bare, =IF(R5,R5,C5): a blank or a 0 counts as false, any other number as true, and text returns #VALUE!. Read it; write ISNUMBER. Its sibling ISTEXT catches a washes cell that holds "closed": =IF(ISTEXT(C5),"Closed",revenue/C5) returns a status word instead of #VALUE! down the row.
7.  Type 240 into R6 and watch S6 take it; clear it and S6 goes back to the link.
8.  Does it tie? Point the flag in E5 at S5 instead of C5, type an override, and watch the flag answer.

**Done screen, line** **DRAFT** The errors you expect are caught, and the overrides you can't stop are in the open.

### 3.1.C Challenge: the flags block

*lesson: challenge-flags-block · 6 goals · three minutes*

**Brief** **DRAFT** A fresh site-day block for another cluster. Threshold flags, the bonus in IFS, two compound flags, IFERROR on the ratio, an override column wired in.

**Goals (outline)** **DRAFT** IF flag as 1/0 and summed · IFS bonus · AND concern flag · OR visit flag · IFERROR on revenue per wash · ISNUMBER override.

## 3.2 Dates

*module: dates*

**Story card, title** **DRAFT** How old is each site, and how long do members stay?

**Story card, body** **DRAFT** Two of the buyers' questions are about time: how old each site is, because new ones ramp for two years, and how long a member stays before cancelling, because that's what a $30-a-month fee is worth. Excel keeps a date as a number (days since the start of 1900), so dates subtract, add and compare like any figure once you know the functions that build and break them.

**Objective (data room)** **DRAFT** Dates: serial numbers and DATE, YEAR, MONTH, DAY; member tenure from join and cancel dates; period keys for grouping; YEARFRAC and fiscal periods; NETWORKDAYS and WEEKDAY for the trading calendar.

**Page name** The age and tenure tables

### 3.2.1 Serial numbers: DATE, YEAR, MONTH, DAY

*lesson: date-serials · 7 goals*

**Brief** **DRAFT** A date is a serial number in a date costume: 9/15/2026 is 46,280 days since January 1, 1900, and Ctrl+Shift+~ shows you the number under any date (2.1.4). That's why dates subtract: opened on 3/15/2019, today's 9/15/2026, and the difference is 2,741 days. DATE builds one from a year, month and day; YEAR, MONTH and DAY take one apart. Build site age from the Sites sheet. The key is `DATE`.

**Goals (outline)** **DRAFT**

1.  On Sites, I5 is a typed as-of date, 9/15/2026, blue. Read it with Ctrl+Shift+~, then Ctrl+Z.
2.  Age in days: J5 =$I$5-E5, anchored (1.6.3), filled down.
3.  Age in years: K5 =J5/365.25, one decimal.
4.  Take a date apart: L5 =YEAR(E5), M5 =MONTH(E5), N5 =DAY(E5), filled down.
5.  Build a date in O5 with =DATE(L5,M5,1), the first of the opening month, which is what you group by when you group by month.
6.  Vintage: P5 =YEAR(E5), labeled, so a buyer can read sites by the year they opened.
7.  Does it tie? Change the as-of date in I5 to 12/31/2026 and watch every age move.

**Done screen, line** **DRAFT** A date is a number, so age is a subtraction.

### 3.2.2 Member tenure from join and cancel dates

*lesson: member-tenure · 8 goals*

**Brief** **DRAFT** A member pays $30 a month until they cancel, so what a member is worth is fee times tenure: the months from joining to cancelling, or to today if they're still with us. The cancel column is blank for active members, and a blank subtracts as zero, so the formula has to choose the end date first: IF the cancel cell is blank, the as-of date, otherwise the cancel date (3.1.1). Then tenure in months, and the churn count for the month. The key is `IF`.

**Goals (outline)** **DRAFT**

1.  On Members, H2 holds the as-of date (a link to Sites!I5). Read the Joined and Cancelled columns E and F; six cancels.
2.  Fill G5 =IF(F5="",$H$2,F5) down for the end date, the day tenure stops counting.
3.  Tenure in days: H5 =G5-E5; in months: I5 =H5/30.4, one decimal.
4.  Status: J5 =IF(F5="","Active","Cancelled").
5.  Value to date is tenure in months × the plan's fee, a lookup in Chapter 4, so for now type a blue 30 in L2 and K5 =I5*$L$2.
6.  Churn in September is the cancels dated in the month: COUNTIFS arrives in 3.3.2, so flag them in M5 =IF(AND(F5>=DATE(2026,9,1),F5<=DATE(2026,9,30)),1,0) and SUM.
7.  Best practice: never type a blank as 0 in a date column; the IF handles the blank and the cell stays honest.
8.  Does it tie? Cancel one active member today and watch their tenure stop, their status flip and the churn count rise.

**Done screen, line** **DRAFT** Every member has a tenure now, and the page knows who left in September.

### 3.2.3 Period keys: a month and a quarter from every date

*lesson: period-keys · 6 goals*

**Brief** **DRAFT** Ninety transactions are useful once they can be grouped, and grouping needs a key: a column that says which month or quarter each row belongs to. TEXT(A5,"yyyy-mm") writes 2026-09 as text you can count on; EOMONTH(A5,0) gives the month-end as a date you can sort on (2.6.2); a quarter is ROUNDUP(MONTH(A5)/3,0). Add three key columns to Transactions; module 3.3 counts and sums on them. The key is `TEXT`.

**Goals (outline)** **DRAFT**

1.  On Transactions, fill G5 =TEXT(A5,"yyyy-mm") down for the month key as text.
2.  H5 =EOMONTH(A5,0), formatted mmm-yy, gives the month-end as a date.
3.  I5 =ROUNDUP(MONTH(A5)/3,0): the quarter number; J5 ="Q"&I5&" "&YEAR(A5): the label. The desk's other way to say it: MOD(MONTH(A5),3)=0 flags a quarter-end month (MOD gives the remainder, and every third month leaves none), which is how a monthly row turns into a quarterly one anywhere in a model.
4.  A week key: K5 =A5-WEEKDAY(A5,2)+1, the Monday of that week, formatted as a date.
5.  Read the five keys on one row with F2 and Esc; every one is a formula on column A.
6.  Does it tie? Change one date to October and watch its month, quarter and week keys move.

**Done screen, line** **DRAFT** Every row knows its month, its quarter and its week, and the grouping can begin.

### 3.2.4 YEARFRAC and fiscal periods

*lesson: yearfrac-and-fiscal-periods · 7 goals*

**Brief** **DRAFT** Dividing days by 365.25 is close; YEARFRAC is exact, and it takes a basis: the day-count convention a loan or a lease uses. A fiscal period is where a company's year starts: Clearcoat's ends on December 31, but the lead buyer's ends June 30, and their diligence team asks for everything in their halves. Convert a date into the buyer's fiscal year and half with MONTH and a little arithmetic. The key is `YEARFRAC`.

**Goals (outline)** **DRAFT**

1.  On Sites, replace K5's /365.25 with =YEARFRAC(E5,$I$5), filled down; compare the two columns.
2.  YEARFRAC(E5,$I$5,1) uses actual days over the actual year, the basis a lease uses, so read the difference on one row.
3.  Tip from the desk: the main use of YEARFRAC in a model is the stub: a part-year figure is the annual figure × YEARFRAC(start, period end). Cedar Park opened on 9/8/2026, so its first year is a stub: =YEARFRAC(E10,DATE(2026,12,31)) is 0.31 of a year, and a full year's washes times that is what 2026 can hold.
4.  The buyer's fiscal year ends June 30, so on Transactions L5 =IF(MONTH(A5)>=7,YEAR(A5)+1,YEAR(A5)) gives FY2027 for a September date.
5.  The half: M5 =IF(MONTH(A5)>=7,"H1","H2"), and N5 ="FY"&RIGHT(L5,2)&" "&M5.
6.  Best practice: a fiscal-year end lives in one input cell, never typed as 7 inside a formula. Point the 7 at Inputs!B4 in the next lesson's spirit and read why (B4 in Chapter 1).
7.  Does it tie? Change one date to June 30 and watch its fiscal year and half flip.

**Done screen, line** **DRAFT** Any date can be restated into anyone's fiscal year, in two cells.

### 3.2.5 NETWORKDAYS and WEEKDAY: the trading calendar

*lesson: trading-calendar · 6 goals*

**Brief** **DRAFT** A car wash trades seven days a week but its office doesn't, and a buyer's "washes per trading day" means calendar days minus the days a site was shut. WEEKDAY says which day of the week a date is; NETWORKDAYS counts working days between two dates, and takes a list of holidays; NETWORKDAYS.INTL lets you say which days are the weekend. Build the trading calendar for the fortnight. The key is `NETWORKDAYS`.

**Goals (outline)** **DRAFT**

1.  On Transactions, O5 =WEEKDAY(A5,2) numbers the day with Monday as 1, and P5 =TEXT(A5,"ddd") gives its name.
2.  A weekend flag: Q5 =IF(O5>=6,1,0).
3.  On Sites, a holiday list in K12:K13 (Labor Day, Thanksgiving). Working days from opening to as-of: L5 =NETWORKDAYS(E5,$I$5,$K$12:$K$13).
4.  Trading days, seven a week minus the holiday list: M5 =NETWORKDAYS.INTL(E5,$I$5,"0000000",$K$12:$K$13).
5.  Washes per trading day for the fortnight on Summary: total washes over trading days, one row per site.
6.  Does it tie? Add a holiday to the list and watch trading days and the per-day figure move.

**Done screen, line** **DRAFT** The calendar is a formula now, holidays included.

### 3.2.C Challenge: a fiscal-quarter timeline and an age table

*lesson: challenge-timeline-and-age · 6 goals · three minutes*

**Brief** **DRAFT** A fresh site list and export. Site ages with YEARFRAC, vintages, period keys on every row, the buyer's fiscal year, a weekend flag.

**Goals (outline)** **DRAFT** Age in years · vintage · month and quarter keys · fiscal year and half · weekend flag · trading days.

## 3.3 Math and aggregation

*module: math-and-aggregation*

**Story card, title** **DRAFT** Ninety rows into one page.

**Story card, body** **DRAFT** The buyers want washes and revenue by site and by package, the busiest sites, the blended ticket, and the question that decides whether they believe anything: whether the POS export agrees with what the managers sent. Every one of those is a count or a sum with a condition on it. Build them, then build the reconciliation and drive its check to zero.

**Objective (data room)** **DRAFT** Aggregation with conditions: the ROUND family on tickets; COUNTIF and COUNTIFS; SUMIF, SUMIFS and AVERAGEIFS; MAXIFS, MINIFS, LARGE, SMALL and RANK; SUMPRODUCT; the reconciliation.

**Page name** The site × package summary

### 3.3.1 ROUND, ROUNDUP, ROUNDDOWN, ABS, CEILING, FLOOR

*lesson: round-family · 6 goals*

**Brief** **DRAFT** A number format hides decimals; ROUND removes them, and the two are not the same: a page that sums displayed figures can be a dollar off its own total. ROUND(x,0) to the dollar, ROUND(x,-3) to the thousand; ROUNDUP and ROUNDDOWN force the direction; CEILING and FLOOR round to a step, like the nearest $0.25 on a ticket; ABS drops the sign. Use them on the ticket figures where the arithmetic has to be exact. The key is `ROUND`.

**Goals (outline)** **DRAFT**

1.  On Summary, the blended ticket in Q5:Q10 shows two decimals but holds six: F2 on one and read it.
2.  Fill R5 =ROUND(Q5,2) down, then sum both columns and compare the totals, because the difference is the rounding.
3.  A price list rounded to the quarter: S5 =CEILING(Q5,0.25) and T5 =FLOOR(Q5,0.25).
4.  Washes in thousands, always down: U5 =ROUNDDOWN(C5/1000,1).
5.  The gap to target as a size, not a sign: V5 =ABS(C5-D5).
6.  Does it tie? Change one ticket and watch its rounded, ceilinged and floored versions move together.

**Done screen, line** **DRAFT** A format hides decimals; ROUND removes them, and the total knows the difference.

### 3.3.2 COUNTIF and COUNTIFS

*lesson: countif-countifs · 8 goals*

**Brief** **DRAFT** A count with a condition is the first question anyone asks of an export: how many washes at Domain, how many Ultimate washes, how many member washes at Domain in the second week. COUNTIF takes one range and one condition; COUNTIFS takes as many pairs as you need. The condition can be a cell, a text, or a comparison in quotes (">=250"). Build the site × package count block on Summary from Transactions. The key is `COUNTIFS`.

**Goals (outline)** **DRAFT**

1.  Washes by site: fill Summary!C15 =COUNTIF(Transactions!$B$5:$B$94,B15) down the six sites, with the site code in B15 as the condition.
2.  Washes by package: C22 =COUNTIF(Transactions!$C$5:$C$94,B22) for B, D and U.
3.  The site × package block: C30 =COUNTIFS(Transactions!$B$5:$B$94,$B30,Transactions!$C$5:$C$94,C$29), anchored both ways (1.6.3), filled across and down.
4.  Member washes need a criterion on a non-blank cell, so D15 =COUNTIFS(Transactions!$B$5:$B$94,B15,Transactions!$D$5:$D$94,"<>").
5.  Retail washes with a comparison: E15 =COUNTIFS(Transactions!$B$5:$B$94,B15,Transactions!$E$5:$E$94,">0").
6.  Bands: count the amounts in three bands (=COUNTIFS(Transactions!$E$5:$E$94,"<15"), then ">=15" with "<20", then ">=20") and add a check that the three bands sum to COUNT of the column. The $15 and $20 tickets sit exactly on the edges, so a > where >= belongs leaves the check short by every ticket on that edge.
7.  A total row under each block with AutoSum (1.6.2), and a check: the site total equals the package total equals COUNTA of the export's dates.
8.  Does it tie? Change one transaction's package from B to U and watch the two blocks shift by one each.

**Done screen, line** **DRAFT** Ninety rows counted six ways, and every block agrees with the others.

### 3.3.3 SUMIF, SUMIFS and AVERAGEIFS

*lesson: sumif-sumifs-averageifs · 7 goals*

**Brief** **DRAFT** Counting says how many; summing says how much. SUMIFS takes the range to add first, then the criteria pairs, and AVERAGEIFS averages instead. Retail revenue is the sum of amounts by site; member washes carry zero because the member paid on the first, so membership revenue is members times fee, not a sum of rows, and the databook has to say so, or a buyer will think member washes are free. Build the revenue block. The key is `SUMIFS`.

**Goals (outline)** **DRAFT**

1.  Retail revenue by site: Summary!F15 =SUMIF(Transactions!$B$5:$B$94,B15,Transactions!$E$5:$E$94), filled down.
2.  Retail revenue by site and package: F30 =SUMIFS(Transactions!$E$5:$E$94,Transactions!$B$5:$B$94,$B30,Transactions!$C$5:$C$94,F$29), anchored, filled both ways.
3.  Average retail ticket by site is G15 =AVERAGEIFS(Transactions!$E$5:$E$94,Transactions!$B$5:$B$94,B15,Transactions!$E$5:$E$94,">0"), and ">0" keeps member washes out.
4.  Membership revenue by site is active members at the site (COUNTIFS on Members, 3.3.2) times the fee, a blue typed $30 for now, since the plan-by-plan fee is a lookup in Chapter 4.
5.  Total revenue by site: retail plus membership, and a note beside it: "member washes carry $0; membership revenue is fee × active members".
6.  Best practice: write the criteria range once and anchor it; a SUMIFS with a slipped range is the most common wrong number in a databook.
7.  Does it tie? Change one Domain retail amount and watch Domain's retail revenue and total move by that amount.

**Done screen, line** **DRAFT** The page now says how much, by site and by package, and what a member wash is worth.

### 3.3.4 MAXIFS, MINIFS, LARGE, SMALL and RANK

*lesson: busiest-sites · 6 goals*

**Brief** **DRAFT** "Which site was busiest, and on which day?" MAXIFS finds the biggest value that meets a condition, MINIFS the smallest, LARGE and SMALL the nth biggest or smallest, and RANK places every site in order. Together they turn a block into a league table without sorting anything, which matters because the block has to stay where the links expect it. The key is `LARGE`.

**Goals (outline)** **DRAFT**

1.  Busiest day at each site: Summary!H15 =MAXIFS(the daily-washes column on the site-day block, its site column, B15).
2.  Find the quietest site in I15 with MINIFS.
3.  The top three site totals: J15 =LARGE($C$15:$C$20,1), J16 with 2, J17 with 3.
4.  The bottom one: J18 =SMALL($C$15:$C$20,1).
5.  Rank every site: K15 =RANK(C15,$C$15:$C$20), filled down; read the order without sorting the block.
6.  Does it tie? Change Airport's washes and watch its rank and the LARGE list reorder.

**Done screen, line** **DRAFT** A league table with nothing sorted, so every link still points where it should.

### 3.3.5 SUMPRODUCT: the blended ticket

*lesson: sumproduct-blended-ticket · 6 goals*

**Brief** **DRAFT** The blended ticket is total revenue over total washes, member washes included, so it sits below the price list, and it's the number a buyer uses to value a wash. SUMPRODUCT multiplies two ranges pairwise and adds the products in one call: washes by package times price by package, without a helper column. It also does conditional sums the old way, before SUMIFS existed, and you'll meet that in other people's models. The key is `SUMPRODUCT`.

**Goals (outline)** **DRAFT**

1.  Read the package block on Summary, with counts in C22:C24 and the retail price list in D22:D24.
2.  Retail revenue in one call: D26 =SUMPRODUCT(C22:C24,D22:D24); check it against the SUMIF total from 3.3.3.
3.  Blended ticket: D27 = total revenue (retail plus membership) over total washes, two decimals.
4.  Read why the old conditional sum, D28 =SUMPRODUCT((Transactions!B5:B94="AUS-DOM")*(Transactions!E5:E94)), works (TRUE times a number) and why SUMIFS is clearer.
5.  A weighted average with SUMPRODUCT over SUM: the average retail price weighted by washes.
6.  Does it tie? Change the Ultimate price and watch retail revenue, blended ticket and the weighted price all answer.

**Done screen, line** **DRAFT** SUMPRODUCT summed washes times prices in one call, and the blended ticket is the number a buyer prices from.

### 3.3.6 The reconciliation: POS against the managers' numbers

*lesson: the-reconciliation · 8 goals*

**Brief** **DRAFT** A reconciliation is two counts of the same thing from two sources, and the difference explained line by line until it's zero. The managers' weekly numbers from Chapter 1 sit on Summary's Managers block; the POS counts are yours from 3.3.2. They won't agree (a site counted a re-wash, a manager included a day the POS didn't), and the databook shows the difference by site and what explains it. Build it, and drive the check to zero. The key is `=`.

**Goals (outline)** **DRAFT**

1.  Lay the block out: sites down, POS washes (a link to C15:C20), Managers' washes (typed from the Chapter 1 feed, blue), Difference as a live subtraction.
2.  Two sites differ, so run COUNTIFS on site and date over the Riverside export and find the day the manager's count is one high.
3.  An explanation column: "re-wash counted twice, 9/22" beside the difference, typed, blue.
4.  An adjustment column, typed and blue, that brings the managers' number to the POS: Adjusted = Managers + Adjustment.
5.  The check: Adjusted minus POS, one row per site, and a total that reads zero.
6.  Format the block to the standard (1.5, 2.3): the check row in the desk number format (1.5.1), so a difference reads in parentheses, and a source line under it.
7.  Best practice: the POS is the truth; the managers' number is adjusted to it, never the other way, and every adjustment says why in words. The same three columns (the reported figure, each adjustment explained in words, the adjusted figure) are how a buyer's diligence team restates EBITDA for one-time items, and buyers price off the adjusted number.
8.  Does it tie? Change an adjustment and watch the check leave zero, then put it back.

**Done screen, line** **DRAFT** Two counts of the same thing agree now, every difference is explained, and the check reads zero.

### 3.3.C Challenge: the export rolled up to a site × package summary

*lesson: challenge-site-package-summary · 6 goals · four minutes*

**Brief** **DRAFT** A fresh export for another cluster. Counts and sums by site and package, the blended ticket, the league table, the reconciliation check at zero.

**Goals (outline)** **DRAFT** COUNTIFS block · SUMIFS block · AVERAGEIFS retail ticket · RANK · SUMPRODUCT blended ticket · the reconciliation check.

## 3.4 Text

*module: text*

**Story card, title** **DRAFT** The codes have to become words.

**Story card, body** **DRAFT** The POS writes AUS-DOM where a buyer wants Austin and Domain in their own columns, it packs the package and channel into one memo, and when the terminal hiccups it sends amounts as text. Text functions take a string apart and put it back together, Text to Columns does the same for a whole column at once, and nothing gets retyped.

**Objective (data room)** **DRAFT** Text: LEN, LEFT, RIGHT and MID to split codes; FIND, SEARCH and SUBSTITUTE to parse a memo; VALUE and DATEVALUE to turn a text export into numbers; Text to Columns and Flash Fill.

**Page name** The export, in columns

### 3.4.1 LEN, LEFT, RIGHT and MID: split the codes

*lesson: split-the-codes · 7 goals*

**Brief** **DRAFT** A site code is two facts in one cell: AUS-DOM is the cluster and the site. LEFT takes characters from the start, RIGHT from the end, MID from a position, and LEN counts them, so the cluster is LEFT(B5,3) and the site is RIGHT(B5,3), and when the code lengths vary, MID with FIND does the work (3.4.2). Split the codes into their own columns on Transactions, so the cluster can be counted on. The key is `LEFT`.

**Goals (outline)** **DRAFT**

1.  On Transactions, R5 =LEN(B5) filled down reads 7 for every clean code and 8 where a trailing space hides, so find the two.
2.  Cluster: S5 =LEFT(B5,3), filled down.
3.  The site goes in T5 as =RIGHT(B5,3), then read the two rows where the trailing space turns it into "OM ".
4.  Fix them with TRIM inside: T5 =RIGHT(TRIM(B5),3) (TRIM from 2.6.4), filled down.
5.  MID: the package letter from the memo "Wash D @ …" is MID(F5,6,1). Read it on a row.
6.  Count the clusters with COUNTIF on the new column (3.3.2): all Austin, as expected, and the formula is ready for a mixed export.
7.  Does it tie? Change a code to SAT-ALA and watch cluster and site split.

**Done screen, line** **DRAFT** One code became two columns, and the trailing spaces gave themselves away.

### 3.4.2 FIND, SEARCH and SUBSTITUTE: parse the memo

*lesson: parse-the-memo · 8 goals*

**Brief** **DRAFT** The memo packs three facts into one string: "Wash D @ AUS-DOM (kiosk)". FIND returns the position of a character, so the site code is whatever sits between "@ " and " (": MID with two FINDs. SEARCH is FIND without caring about case. SUBSTITUTE swaps text for text, so "(kiosk)" can become "kiosk" and a lower-case package can be upper-cased with UPPER. Pull the channel out of the memo. The key is `FIND`.

**Goals (outline)** **DRAFT**

1.  On Transactions, U5 =FIND("@",F5) gives the position of the @, so read it on three rows.
2.  Pull the site from the memo with V5 =MID(F5,FIND("@",F5)+2,7) and compare it with column B.
3.  The channel: W5 =MID(F5,FIND("(",F5)+1,FIND(")",F5)-FIND("(",F5)-1). Read it: kiosk, app, attendant.
4.  The second space: FIND and SEARCH take a third argument, where to start looking, so =FIND(" ",F5,FIND(" ",F5)+1) is the space after the package letter. Cut the letter between the two spaces: =MID(F5,FIND(" ",F5)+1,FIND(" ",F5,FIND(" ",F5)+1)-FIND(" ",F5)-1), and the formula survives a longer first word, where MID(F5,6,1) from 3.4.1 breaks.
5.  The package from the memo with SEARCH, case-blind: X5 =UPPER(MID(F5,SEARCH("wash ",F5)+5,1)); the lower-case row reads right now.
6.  SUBSTITUTE: Y5 =SUBSTITUTE(F5," (kiosk)",""), the memo without the channel. SUBSTITUTE's fourth argument changes only the nth match (SUBSTITUTE(F5," ","",2) takes out the second space alone), and REPLACE(text, start, length, new) swaps by position instead of by content.
7.  Best practice: parse into helper columns and keep the raw memo; the raw column is the audit trail.
8.  Does it tie? Change one memo's channel to (app) and watch W5 follow.

**Done screen, line** **DRAFT** You pulled three facts out of one string, and the raw memo is still there for the audit.

### 3.4.3 VALUE and DATEVALUE: a text export into numbers

*lesson: text-to-numbers · 7 goals*

**Brief** **DRAFT** Three amounts in the export sit on the left of their cells, which means they're text, not numbers, and every SUMIFS skips them (1.3.2). VALUE turns a text number into a number and DATEVALUE turns a text date into a date, and when you're in a hurry, multiplying by 1 does the same job. Then paste values over the originals, so the export holds numbers and the sums come out right. The key is `VALUE`.

**Goals (outline)** **DRAFT**

1.  On Transactions, Go To Special (1.2.4) for Constants with only Text ticked on E5:E94: three cells light up.
2.  Beside them, Z5 =VALUE(E5) filled down the block turns the text into numbers and leaves the numbers as they were.
3.  A text date in the second export block: AA5 =DATEVALUE("2026-09-15") reads as a date once formatted.
4.  The trick: AB5 =E5*1 does what VALUE does; read one row.
5.  Copy Z5:Z94 and Paste Special Values over E5:E94 (1.3.4); delete the helper.
6.  Re-run the SUMIF total from 3.3.3 and watch it rise by the three amounts.
7.  Bring the reconciliation check from 3.3.6 back to zero, because it moved when the three amounts joined and it has to tie.

**Done screen, line** **DRAFT** Three text amounts became numbers, and the sums finally counted them.

### 3.4.4 Text to Columns and Flash Fill

*lesson: text-to-columns-flash-fill · 6 goals*

**Brief** **DRAFT** When a whole column needs splitting once, a formula is more than the job needs. Text to Columns (Alt, A, E) splits by a delimiter (the hyphen in AUS-DOM) or by fixed width, in one pass; Flash Fill (Ctrl+E) watches you type the first result and fills the pattern down. Both write values, not formulas, so they're for a one-time clean, not a live model. Split a copy of the codes both ways. The key is `Alt A E`.

**Goals (outline)** **DRAFT**

1.  Copy Transactions!B5:B94 onto a scratch sheet's A column.
2.  Alt, A, E: Delimited, Other: -, Finish: the codes split into two columns. Before Finish, the wizard's last step sets each column's type: set a code or ID column to Text, or its leading zeros and long digit strings are lost. A delimiter that also sits inside a field over-splits it, so read the preview first.
3.  Flash Fill: in the next column type DOM beside AUS-DOM, then Ctrl+E on the next cell: MUE, RIV and the rest fill from the pattern. Flash Fill only rearranges characters already in the row; the site's name isn't in the code, so the name stays a lookup (4.1).
4.  Read one filled cell: a value, not a formula.
5.  Best practice: Text to Columns and Flash Fill for a one-time clean; LEFT and MID (3.4.1) when the export refreshes.
6.  Change a code on the scratch sheet and watch nothing follow, which is exactly the point of a tool that writes values.

**Done screen, line** **DRAFT** A whole column split in one pass, and you know why the result is values.

### 3.4.C Challenge: a text dump into a usable table

*lesson: challenge-text-dump · 6 goals · three minutes*

**Brief** **DRAFT** A raw dump: codes with spaces, memos with three facts, amounts as text, dates as text. Make it a table the formulas can read.

**Goals (outline)** **DRAFT** TRIM and split the codes · parse channel from the memo · VALUE the amounts · DATEVALUE the dates · paste values · one Text to Columns.

## 3.5 Time value of money

*module: time-value-of-money*

**Story card, title** **DRAFT** What is a new site worth?

**Story card, body** **DRAFT** Cedar Park cost $5m all in (the land, which Clearcoat owns there, and the build) and was funded with a $3.5m loan, and the buyers want two things: the loan's schedule, and whether a site like it is worth building at all. A dollar next year is worth less than a dollar today, and the functions in this module say how much less: PMT for the loan, NPV and IRR for the site.

**Objective (data room)** **DRAFT** Time value of money: PV, FV and PMT on the site-build loan; NPV and XNPV on a new-site case; IRR and XIRR; a payment schedule with anchors.

**Page name** The new-site case

### 3.5.1 PV, FV and PMT: the site-build loan

*lesson: pv-fv-pmt · 7 goals*

**Brief** **DRAFT** The Cedar Park loan is $3.5m at 7% over ten years, paid monthly. PMT gives the payment from the rate, the number of periods and the principal, and the trap is periods: a monthly payment needs the monthly rate (7% over 12) and 120 periods, not 10. PV runs it backwards, the loan a payment can support; FV runs it forwards, what a sum grows to. Build the three on Loans and read the signs. The key is `PMT`.

**Goals (outline)** **DRAFT**

1.  On Loans, read the blue inputs: B4 principal 3,500,000, B5 rate 7.0%, B6 years 10 and B7 payments a year 12.
2.  Monthly rate: B9 =B5/B7; periods: B10 =B6*B7.
3.  The payment: B12 =PMT(B9,B10,B4) comes out negative, because it's cash out; wrap it in a minus so the page reads a positive. PMT, PV and FV take an optional last argument, type: omitted or 0 means payments at the end of each period, 1 means at the start, the way rent is paid in advance, so try =PMT(B9,B10,B4,0,1), watch the payment fall a little, then take the last two arguments back out.
4.  Total paid: B13 =B12*B10; total interest: B14 =B13-B4. Read how much of $3.5m the bank earns.
5.  B16 =PV(B9,B10,-35000) is the loan a $35,000 monthly payment supports at the same terms.
6.  B17 =FV(B5,B6,0,-1000000) is what $1m grows to in ten years at 7%.
7.  Does it tie? Change the rate to 6% and watch the payment and total interest fall.

**Done screen, line** **DRAFT** Three inputs gave you the payment, the total interest and the sign convention.

### 3.5.2 NPV and XNPV: a new-site case

*lesson: npv-xnpv · 7 goals*

**Brief** **DRAFT** A site costs $5m all in today, land included, and earns cash for years; to compare the two you discount the future cash back to today at the return an investor requires (the discount rate), and NPV is the sum of those discounted cash flows less the cost. Positive means the site earns more than the required return. NPV in Excel assumes even periods and starts one period out, so the year-zero capex sits outside it; XNPV takes dates and handles uneven timing. Value the Cedar Park case. The key is `NPV`.

**Goals (outline)** **DRAFT**

1.  On Loans, read the case block: years 0–5 across C20:H20, cash flows in C21:H21 (year 0 is -5,000), the 7,000 sale value added in year 5, the discount rate in B22 (10%).
2.  The discount factor by hand: C23 =1/(1+$B$22)^C20, filled right (1.6.3).
3.  Discounted cash flows: C24 =C21*C23, filled right; NPV by hand: B25 =SUM(C24:H24).
4.  B26 =NPV(B22,D21:H21)+C21 keeps years 1–5 inside and adds year 0 outside, so compare it with B25 and watch them agree.
5.  The trap is B27 =NPV(B22,C21:H21), which discounts the capex a year it shouldn't be, so read the difference and delete it.
6.  XNPV with dates: dates in C19:H19, B28 =XNPV(B22,C21:H21,C19:H19).
7.  Change the discount rate to 15% and watch the NPV fall, then find the rate where it crosses zero, which is the next lesson.

**Done screen, line** **DRAFT** Five years of cash discounted to today say the site is worth more than it cost.

### 3.5.3 IRR and XIRR

*lesson: irr-xirr · 6 goals*

**Brief** **DRAFT** The rate where NPV is zero is the internal rate of return: the return the site itself earns. IRR takes the cash flows, year zero included, and finds it; XIRR takes dates and does the same for uneven timing. Payback is simpler and buyers ask for it too: the year the cash out is recovered. Add all three to the case, then read them the way a buyer does: IRR against the discount rate, payback against the hold. The key is `IRR`.

**Goals (outline)** **DRAFT**

1.  B30 =IRR(C21:H21), year 0 included this time. Read it against the 10% discount rate. IRR returns #NUM! when every flow has the same sign, or when its search fails from the 10% starting guess; the optional second argument, guess, gives it a new place to start.
2.  Prove it: set B22 to the IRR and watch the NPV in B26 read zero; put 10% back.
3.  XIRR with the dates: B31 =XIRR(C21:H21,C19:H19).
4.  Cumulative cash is C33 =C21 and D33 =C33+D21 filled right, so read off the payback year where it turns positive.
5.  A payback formula: B34 counts the negative years with COUNTIF (3.3.2) and adds the fraction of the crossing year.
6.  Does it tie? Halve the sale value in year 5 and watch IRR, NPV and payback all answer.

**Done screen, line** **DRAFT** You have the site's own return now, and the year it pays itself back.

### 3.5.4 A payment schedule with anchors

*lesson: payment-schedule · 8 goals*

**Brief** **DRAFT** A loan schedule shows every month: the opening balance, the payment, how much of it is interest and how much principal, and the closing balance that opens the next month. The payment stays the same; the split shifts toward principal as the balance falls. PPMT and IPMT give the two parts directly, or you build it: interest is balance times rate, principal is the payment less interest. One row written once, filled down 120 times, every input anchored. The key is `F4`.

**Goals (outline)** **DRAFT**

1.  On Loans, the schedule block: month numbers 1–120 in B40:B159 by Fill Series (1.3.5).
2.  Opening balance C40 =B4; interest D40 =C40*$B$9; principal E40 =$B$12-D40 (the payment from 3.5.1, as a positive); closing F40 =C40-E40.
3.  The next opening balance reads the last closing: C41 =F40. Now the row is a pattern.
4.  Select C41:F159 and fill down with Ctrl+D; read month 120's closing balance: zero.
5.  Check with the functions: G40 =-IPMT($B$9,B40,$B$10,$B$4) and H40 =-PPMT(...), filled down; they match D and E.
6.  Cumulative interest to date: I40 =SUM($D$40:D40), filled down, the start anchored, the end moving, which is the running-total pattern for anything that accumulates (capex to date, cash paid so far, the sweep in Chapter 6).
7.  Total interest from the schedule (SUM of D) equals B14 from 3.5.1, a check that reads zero, and I159 says the same.
8.  Does it tie? Change the rate and watch the whole schedule re-run and still land on zero.

**Done screen, line** **DRAFT** One anchored row filled a hundred and twenty times, and the balance lands on zero.

### 3.5.C Challenge: a new-site case valued with NPV and IRR

*lesson: challenge-new-site-case · 6 goals · four minutes*

**Brief** **DRAFT** A different site's numbers: build the loan payment, the case with NPV by hand and by function, IRR, payback, and the first twelve months of the schedule.

**Goals (outline)** **DRAFT** PMT with the monthly trap avoided · discount factors and NPV by hand · NPV with capex outside · IRR · payback · twelve schedule rows.

## 3.6 Auditing

*module: auditing*

**Story card, title** **DRAFT** Somebody else's Summary doesn't tie.

**Story card, body** **DRAFT** Before you built yours, someone started a Summary sheet and left. It has a SUMIF pointing at a range a row short, a typed number in a formula column, a text "12", and a total that agrees with nothing. Chapter 1 taught the three looks; this module adds the tools a reviewer uses on a sheet they didn't build, and the checks block that says, in one cell, whether the databook ties.

**Objective (data room)** **DRAFT** Auditing at databook scale: trace arrows and Evaluate Formula; F9 on a part of a formula; the hardcode and external-link hunt; the checks block with a roll-up flag.

**Page name** The Summary, rebuilt

### 3.6.1 Trace precedents and dependents

*lesson: trace-arrows-evaluate · 7 goals*

**Brief** **DRAFT** Ctrl+[ jumps to what a cell reads (1.6.6); the trace arrows draw it on the sheet, so a whole chain shows at once, and Evaluate Formula steps through a formula one calculation at a time, showing each intermediate result. On a sheet someone else built, those two tell you what a number is made of before you decide whether it's right. Trace the broken total on the old Summary back to its range. The key is `Alt M P`.

**Goals (outline)** **DRAFT**

1.  On the old Summary block, land on the total that doesn't tie, press Alt, M, P to draw its precedents, and read the arrows.
2.  One arrow points at a SUMIF, so trace that cell's precedents too and watch the range end a row early.
3.  Alt, M, D on the typed 1,240 draws its dependents, and three cells read it, so a wrong number spread three ways.
4.  Remove the arrows: Alt, M, A, A.
5.  Evaluate Formula (Alt, M, V) on the SUMIF: step through and watch the short range produce the short total.
6.  Fix the range to the full export, by pointing, and re-evaluate.
7.  Does it tie? Change one Domain transaction and watch the fixed total move.

**Done screen, line** **DRAFT** The arrows showed the chain, and Evaluate showed where the number went wrong.

### 3.6.2 F9 on a part, show formulas, Go To Special at scale

*lesson: f9-show-formulas-at-scale · 6 goals*

**Brief** **DRAFT** Inside an open formula, select any part and press F9, and it turns into its value, so a long SUMIFS can be read piece by piece. Then press Esc and never Enter, or that piece is hardcoded for good. Show formulas (Ctrl+`) and Go To Special (1.2.4, 1.7.3) you already know, and on a databook they run over whole sheets, so the habit is to run them before anyone else does. Audit the old Summary with all three. The key is `F9`.

**Goals (outline)** **DRAFT**

1.  Open the fixed SUMIF with F2, select the criteria range and press F9, read the values that appear, then Esc.
2.  Select the whole criterion instead and press F9 to see the code it's testing, then Esc.
3.  Ctrl+` on the old Summary: the typed 1,240 and the text "12" stand out in a block of formulas.
4.  Go To Special, Constants, Numbers only, over the block: the 1,240 lights alone; fix it with a link to the count.
5.  Go To Special, Constants, Text: the "12" lights; VALUE it (3.4.3) or retype it as a number.
6.  Does it tie? Ctrl+` off, change an input, and every cell in the block moves.

**Done screen, line** **DRAFT** Three sweeps made the two dead numbers in the block give themselves up.

**Done screen, paragraph** **DRAFT** Tip from the desk: a leading apostrophe parks a half-built formula as text while you work on its pieces. Type ' in front of the = and the cell shows the formula without running it or raising an error box. Delete the apostrophe and it's live again.

### 3.6.3 The hardcode and external-link hunt

*lesson: hardcode-external-link-hunt · 6 goals*

**Brief** **DRAFT** Two things travel badly: a number typed inside a formula, and a link to another workbook, which breaks the day the file is moved and shows a path nobody can follow. The hunt is Go To Special for the first (1.7.3), and Data › Edit Links (Alt, A, K) for the second, which lists every outside workbook a file reads. The old Summary has one of each. Find them and bring both inside. The key is `Alt A K`.

**Goals (outline)** **DRAFT**

1.  Alt, A, K on the workbook shows one external link, to last year's databook, so read the path. A stray link like this is born when someone types =, switches to another open file (Ctrl+Tab cycles the open workbooks, even with a formula open) and points.
2.  Find the cell that carries it: Ctrl+F for "[" (2.5 taught Find; the bracket is how an external reference starts). The same search finds what reads a sheet: before deleting a tab, Ctrl+F its name with Within: Workbook and Look in: Formulas, Find All, and repoint every cell the list shows (Ctrl+] checks one cell at a time, and nothing warns you before the #REF!s arrive).
3.  Replace it with the figure it fetched, typed blue with its source in the next cell (1.3.1), or with an internal link if the figure lives here.
4.  Break the link in Edit Links once no cell reads it.
5.  The formula with a number inside: Ctrl+` shows a *1.05 in the revenue block; move 1.05 to an input cell, blue, labeled Uplift, and point the formula at it (1.6.1).
6.  Does it tie? Change the uplift input and watch the block answer; Edit Links shows nothing.

**Done screen, line** **DRAFT** Nothing in the file reaches outside it, and nothing hides a number inside a formula.

### 3.6.4 The checks block with a roll-up flag

*lesson: checks-block-rollup · 7 goals*

**Brief** **DRAFT** A databook has a dozen things that must agree, and a reviewer wants one cell that says whether they all do. Each check is a live difference that reads zero (1.7.2); the roll-up is a count of the checks that don't (=COUNTIF(range,"<>0")) and a flag that reads OK or CHECK. Sum the absolute differences too, so a check that's off by one dollar can't hide behind one that's off by minus one. Build the Checks block for the whole databook. The key is `COUNTIF`.

**Goals (outline)** **DRAFT**

1.  On Summary, a Checks block: labels for six checks: site counts to package counts; counts to the export's row count; retail revenue to SUMPRODUCT; the reconciliation total; the loan schedule to total interest; members active plus cancelled to the list.
2.  Each check a live difference, in the desk number format, in the next column.
3.  The roll-up: a COUNTIF of the checks that aren't zero, and beside it =IF(count=0,"OK","CHECK").
4.  The safer roll-up: =SUMPRODUCT(ABS(range)) (3.3.1, 3.3.5), which can't net two errors to zero.
5.  A conditional format on the flag (2.5.2): CHECK turns red.
6.  Link the flag to a cell on the Summary's top row, so it's the first thing a reader sees.
7.  Does it tie? Type over one input the checks read, watch the flag turn to CHECK, then Ctrl+Z.

**Done screen, line** **DRAFT** Six checks feed one flag, and the databook says whether it ties before anyone asks.

### 3.6.C Challenge: six faults in a summary

*lesson: challenge-six-faults · 6 goals · four minutes*

**Brief** **DRAFT** A summary sheet with six faults: a short range, a typed number, a text number, an external link, a number inside a formula, a check that isn't a formula. Find and fix every one; the roll-up flag reads OK.

**Goals (outline)** **DRAFT** Trace and fix the range · the typed number · the text number · the external link · the literal in a formula · the dead check; the flag reads OK.

## 3.7 Project and assessment

*module: ch3-project-and-assessment*

**Story card, title** **DRAFT** The databook, tied out.

**Story card, body** **DRAFT** A fresh export, a fresh site list, a Summary someone else abandoned. Rebuild it so every number reads the export and the flag reads OK, then value the next site on the list. Build it, then build it again on the clock. The assessment is the test-out.

**Objective (data room)** **DRAFT** The KPI databook rebuilt from the export with every check at zero; the assessment is the test-out.

**Page name** The KPI databook

### 3.P Project: rebuild the Summary so every number ties

*lesson: ch3-project · about 16 goals · no clock*

**Outline** **DRAFT** Period keys on the export · the flags block with IFS and AND · site age and member tenure · the site × package counts and sums · the blended ticket · the league table · the reconciliation with adjustments explained and the check at zero · the codes split and the memo parsed · text amounts made numbers · the loan payment and a twelve-row schedule · NPV and IRR on the case · the checks block with the roll-up flag reading OK · Does it tie?

### 3.A Assessment: a fresh export, twelve minutes

*lesson: ch3-assessment · about 16 goals · twelve minutes · hard clock, no help, keyboard only*

**Outline** **DRAFT** Another cluster's export and site list, sized by start and end state: raw export in, a databook whose flag reads OK out. Pass is Verified; this is also the test-out.

## Keys and functions this chapter teaches

IF, IFS, AND, OR, NOT, IFERROR, ISNUMBER; DATE, YEAR, MONTH, DAY, TEXT (keys), EOMONTH (2.6.2, used), ROUNDUP, WEEKDAY, YEARFRAC, NETWORKDAYS, NETWORKDAYS.INTL, Ctrl+Shift+~; ROUND, ROUNDUP, ROUNDDOWN, CEILING, FLOOR, ABS; COUNTIF, COUNTIFS, SUMIF, SUMIFS, AVERAGEIFS, MAXIFS, MINIFS, LARGE, SMALL, RANK, SUMPRODUCT; LEN, LEFT, RIGHT, MID, FIND, SEARCH, SUBSTITUTE, UPPER, VALUE, DATEVALUE, Alt A E, Ctrl+E; PMT, PV, FV, NPV, XNPV, IRR, XIRR, PPMT, IPMT; Alt M P, Alt M D, Alt M A A, Alt M V, F9 on a selection, Alt A K, Ctrl+` (1.6.5), Go To Special with the Numbers and Text sub-options.

## Engine needs (to become an M-request when the shell locks)

IFS, MAXIFS, MINIFS, NETWORKDAYS.INTL, XNPV, XIRR, PPMT, IPMT, DATEVALUE, SEARCH, UPPER, CEILING, FLOOR; TRUE*number coercion in SUMPRODUCT; criteria strings with operators and "<>" in COUNTIFS/SUMIFS (pinned already, rebuild-direction 9); Go To Special's Constants sub-options (Numbers, Text); trace arrows drawn on the sheet and removed; Evaluate Formula stepping; F9 on a selected part of an open formula with Esc restoring; Edit Links with a planted external reference; Text to Columns (delimited) and Flash Fill; a 120-row schedule fill.

## Open for Wolf's bucketing pass

  - 3.2.4's fiscal-period example uses the lead buyer's June year-end, so the puzzle drill "The fiscal half" reads the same way (screenplay 6.2, corrected).
  - Membership revenue in 3.3.3 uses a typed $30 until Chapter 4 teaches the fee lookup; alternative: teach a one-column VLOOKUP early here. Claude's call: keep lookups whole in Chapter 4.
  - 3.5 goes further into finance than the other Chapter 3 modules (NPV, IRR, payback); it's here because the site-build loan is the natural place and Chapter 5's DCF assumes it. Keep, or move 3.5.2–3.5.3 to Chapter 5 and leave the loan here.
  - 3.6 leans on Chapter 1's audit lessons on purpose and adds only the new tools; if it feels thin, 3.6.2 can absorb the Watch Window and Error Checking (Alt M K, Alt M W).
  - Source pass (2026-09-30): the fold-back plan in claude/source-checklist.md (section H) is applied to this chapter as DRAFT: 15 edits, plus one aside in 3.3.6 on how diligence restates EBITDA (the rest of the diligence material is parked as an add-on, screenplay 4.10). Wolf's calls of that day are in the decision log (screenplay 11); what was held back stays listed in the checklist's section B.
