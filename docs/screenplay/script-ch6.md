# hotkey.gg Script · Chapter 6: Valuation

The shell for Chapter 6. Every line is **DRAFT**. Same anatomy, limits and redundancy rule as Chapters 2–5. Buyers are private equity only (Wolf, Round 2): comps, precedents, the sponsor's LBO and the waterfall, no merger math.

## The chapter in brief

**Where the deal is.** Final bids are in, three sponsors with three structures, and the owners want a recommendation from their own finance team rather than only from the advisers. What is the company worth by every method, what can a sponsor afford to pay, which bid is highest once the structure is priced, and what does each owner take home. It all goes on one page for the board, with every number on it traceable.

**The product.** The valuation summary for the board: trading comps spread and applied, precedent deals spread and applied, the lead sponsor's LBO rebuilt to see what they can pay, the three bids side by side with their structures priced, the waterfall from enterprise value to each owner's proceeds (down to the learner's own options), and the football-field table that puts every range on one line.

**What the learner can say afterwards.** How a public company's enterprise value is built and turned into a multiple; why the median beats the mean on a set; what LTM means and why it matters; what a sponsor's return is made of and why debt is its engine; what a sale-leaseback does to EBITDA and to the multiple; why headline price and proceeds are different numbers; what a football field says at a glance.

**The finance, defined through the car wash:**

  - **Enterprise value** (6.1.1): what the operating business is worth, however it's funded (equity value plus debt, less the cash that comes with it), the number a multiple is built on.
  - **Trading multiples** (6.1.1): enterprise value over a year of EBITDA, for listed companies that do what Clearcoat does; the market's price for a dollar of car-wash profit.
  - **LTM and calendarization** (6.1.2): the last twelve months, built from quarters so every company is measured to the same date, whatever its fiscal year.
  - **EV per site, EV per wash** (6.1.4): operating multiples that a car-wash buyer uses alongside EBITDA, because a site is a unit anyone can count.
  - **Precedent transactions and premiums** (6.2.1): the multiples paid in real deals, usually higher than trading multiples because a buyer pays for control.
  - **Sources and uses** (6.3.1): where the money to buy the company comes from (debt, the stake the owners keep, sponsor equity) and where it goes (the price, the fees).
  - **The cash sweep** (6.3.2): every spare dollar of cash repays debt first, which is how a sponsor's equity grows.
  - **Sale-leaseback** (6.3.3): selling the land under a site to a landlord and renting it back; cash today, rent forever, and a lower EBITDA.
  - **IRR and MOIC** (6.3.4): the sponsor's annual return and its money-on-money multiple; IRR from 3.5.3, now on equity.
  - **Earnout, rollover, certainty** (6.4.1): part of a price paid later if targets are hit; owners keeping a stake in the new company; and the odds each structure actually pays.
  - **The waterfall** (6.4.2): from enterprise value to what the owners take home (less net debt, fees and the option pool), and then split by ownership.
  - **The football field** (6.4.4): every valuation range on one line, as a table.

## The workbook

**Comps**. Six listed operators, fictional: Pinnacle Wash Holdings, Riverbend Auto Care, Summit Express Wash, Meridian Car Care, Harbor Clean Group, Prairie Wash Holdings. For each: share price, shares, debt, cash, eight quarters of revenue and EBITDA, the last two fiscal years' totals, fiscal year end, sites, washes. Two have March fiscal years; one is an outlier (a struggling operator at 6x).

**Precedents**. Six deals, fictional, 2023–2026: target, acquirer (a sponsor or a strategic), date, enterprise value, LTM EBITDA, sites, whether the target was listed (for a premium).

**LBO**. Clearcoat at the lead sponsor's price: FY26E EBITDA $16,600k, entry EV $195,000k (11.7x), fees 2%; senior term loan 4.5x EBITDA at 8%, mezzanine 1.0x at 12%, the owners' 20% rollover, the rest sponsor equity; the FY27–FY31 EBITDA and free cash flow from the Chapter 5 model (linked), a cash sweep, exit at 11.0x FY31 EBITDA.

**Bids**. Three: A, $185,000k all cash, no conditions; B, $200,000k with $25,000k of it an earnout paid if FY27 EBITDA reaches $20,000k; C, $195,000k with the owners rolling 20% of their equity into the new company and a financing condition.

**Summary**. The football field as a table; the waterfall; the recommendation line.

## 6.1 Trading comps

*module: trading-comps*

**Story card, title** **DRAFT** What the market pays for a car wash.

**Story card, body** **DRAFT** Six listed operators do what Clearcoat does, and the market prices each of them every day. Turn those prices into multiples (what a dollar of car-wash EBITDA is worth), measure every company to the same date, take the middle of the set, and apply it to Clearcoat. That's the first range on the board's page, and the one the buyers will quote back.

**Objective (data room)** **DRAFT** Trading comps: spreading a comp (the enterprise value build); calendarization and LTM; sorting the set, filtering the outliers, taking the median; operating multiples (EV per site and per wash); applying the range to Clearcoat.

**Page name** Trading comps, spread

### 6.1.1 Spreading a comp: the EV build

*lesson: spreading-a-comp · 7 goals*

**Brief** **DRAFT** Enterprise value is what the operating business is worth, however it's funded: equity value (share price times shares) plus debt, less the cash that comes with it. A trading multiple is that over a year of EBITDA: the market's price for a dollar of profit. Spreading a comp means building those lines for one company from its filings, so every company in the set is built the same way. Spread Pinnacle, then fill the pattern down the set. The key is `=`.

**Goals (outline)** **DRAFT**

1.  On Comps, read Pinnacle's inputs, blue and sourced: price, shares, debt, cash, LTM revenue and EBITDA (the LTM build is 6.1.2, so for now the figures are given).
2.  Market cap = price × shares; enterprise value = market cap + debt − cash.
3.  EV/EBITDA and EV/revenue, one decimal with an x (2.2.2). The matching rule: enterprise value goes over a line struck before interest (revenue, EBITDA, EBIT), and equity value over a line after it, net income. The page prices on EV because a sponsor sets its own debt, so a peer's multiple should say something about its washes, not its loans. Where a comp's EBITDA is blank, zero or negative the multiple shows NM (not meaningful), not an error or a nonsense figure: =IF(EBITDA>0, EV/EBITDA, "NM"), and the statistics in 6.1.3 skip it the way they skip any text.
4.  Add the EBITDA margin, in italic.
5.  Fill the five formulas down the six comps with Ctrl+D (1.3.3); read the set. One of the six holds more cash than debt, so its EV lands below its market cap and its leverage will read negative in 6.1.3: that's net cash, not a broken formula, and a note beside the comp says so.
6.  Best practice: every input on a comp carries its source and date in the next cell; a comp set is only as good as the day it was pulled.
7.  Does it tie? Change Pinnacle's price and watch its market cap, EV and multiple move, and no one else's.

**Done screen, line** **DRAFT** Six companies are built the same way, and each one carries a price for a dollar of profit.

### 6.1.2 Calendarization and LTM

*lesson: calendarization-ltm · 7 goals*

**Brief** **DRAFT** Two of the six report to March, and a multiple on a year that ended six months apart isn't comparable. LTM (the last twelve months) fixes it: the last four quarters, whatever the fiscal year, so every company is measured to the same date; calendarization restates a fiscal year onto a calendar year by weighting two fiscal years by the months each contributes. Build LTM EBITDA from the quarters and calendarize the two March companies. The key is `SUM`.

**Goals (outline)** **DRAFT**

1.  The quarters block: eight quarters of EBITDA per comp, with their period-end dates (3.2.3).
2.  LTM EBITDA = the sum of the last four quarters to June 30, 2026: a SUMIFS on the date range (4.3.3).
3.  Calendarization for a March year-end: CY2025 = FY2025 × w + FY2026 × (1 − w), both years actuals, with the weight in its own cell: w = MONTH(fiscal year-end)/12, which is 3/12 for March and 12/12 for December. Build it for the two: the weights come from the year-end cell, never typed into the formula, so they always total 100% and follow the input.
4.  Replace the given LTM in 6.1.1's inputs with the built one; the multiples update.
5.  A second route, the way filings give it: LTM = the last full fiscal year + the current year-to-date (the quarters reported so far this fiscal year) − the same year-to-date a year earlier. Build it for one comp from its fiscal-year total and the quarters, and take a live difference against the SUMIFS in goal 2: zero.
6.  Best practice: the LTM date is one input cell on the sheet; every LTM formula reads it, so the set can be rolled forward in one edit.
7.  Does it tie? Move the LTM date back a quarter and watch every LTM figure shift.

**Done screen, line** **DRAFT** Every company is measured to the same date, whatever its fiscal year.

### 6.1.3 Sort the set, filter the outliers, take the median

*lesson: median-and-range · 8 goals*

**Brief** **DRAFT** A set of six multiples has a shape, and one of the six is a struggling operator at 6x that would drag an average down. Sort the set to see it (4.2.1), decide which to exclude and say why in a note, and take the median (the middle value, which an outlier can't move) plus the 25th and 75th percentiles as the range. Mean, median, low and high on one row, with a switch to include or exclude each comp. The key is `MEDIAN`.

**Goals (outline)** **DRAFT**

1.  An Include column (1/0) beside the comps, blue; the outlier set to 0 with a note beside it.
2.  Sort a copy of the set by multiple (4.2.1) and read the shape.
3.  Two more columns beside EBITDA margin: LTM growth (this LTM over the four quarters before it, from the eight-quarter block) and net debt ÷ EBITDA, with the statistics rows beneath them and Clearcoat on its own row under the set. Then rewrite the outlier's note from what the columns show: its growth, its margin and its leverage against the rest.
4.  Statistics on the included set, through a helper column: =IF(include=1, multiple, "") beside each comp, then MEDIAN, AVERAGE, MIN and MAX on the helper (they skip text in a range, so an excluded comp drops out instead of counting as a zero). You'll also see =MEDIAN(IF(include=1,multiples)) on other people's sheets; it needs Ctrl+Shift+Enter in older Excel, so the helper is the standard here.
5.  Take QUARTILE.INC(helper,1) and (helper,3) as the low and high of the range, on the same helper so the excluded comp is skipped here too.
6.  Read the difference the outlier makes: flip its include flag and watch mean move and median not.
7.  Best practice: exclude a comp in the open, with a flag and a reason, never by deleting its row.
8.  Does it tie? Change one included multiple and watch the median and quartiles answer.

**Done screen, line** **DRAFT** You have the middle of the set and a range an outlier can't pull.

### 6.1.4 Operating multiples: EV per site, EV per wash

*lesson: operating-multiples · 6 goals*

**Brief** **DRAFT** EBITDA can be dressed up; a site can't. Car-wash buyers read enterprise value per site and per wash alongside EV/EBITDA, because a site is a unit anyone can count and a wash is what the site actually sells. Build both across the set, take their medians, and read where Clearcoat's forty sites and 3.6m washes would sit. The key is `/`.

**Goals (outline)** **DRAFT**

1.  Sites and annual washes for each comp, blue, sourced. Beside them, whether each comp owns or rents its sites: a comp that rents shows lower EBITDA than one that owns, for the same washes, so where the set is mixed compare on EBITDAR too (EBITDA before rent). 6.3.3 shows the same effect from the inside.
2.  EV per site in $m to one decimal; EV per wash in dollars to two.
3.  Medians and quartiles on both, each through its own helper column (6.1.3), so an excluded comp is skipped instead of counted as a zero.
4.  Clearcoat's implied EV at the median EV per site (40 sites) and per wash (3,600k washes).
5.  Best practice: three multiples on every comps page; when they disagree, the one built on the unit a buyer can count wins the argument.
6.  Does it tie? Change a comp's site count and watch its EV per site and the median move.

**Done screen, line** **DRAFT** Six companies anyone can count gave you a price per site and per wash.

### 6.1.5 Applying the range to Clearcoat

*lesson: applying-the-range · 6 goals*

**Brief** **DRAFT** A range of multiples times Clearcoat's EBITDA is a range of enterprise values: low, median, high. That's the comps row of the football field (6.4.4), and it's the first place the buyers will anchor. Build it for all three multiples, in one block that reads the statistics block, and note that trading multiples are for minority stakes: a control buyer pays more, which is where precedents come in. The key is `*`.

**Goals (outline)** **DRAFT**

1.  Clearcoat's LTM EBITDA, sites and washes linked from Chapter 5's model (FY26E as the proxy, flagged). The rule behind the flag: a multiple and the figure it multiplies cover the same period, so an LTM multiple belongs on LTM EBITDA. LTM is fact and next year is what buyers price, but a forward multiple needs estimates for every comp, and this set carries none.
2.  EV range on EBITDA: low quartile × EBITDA, median × EBITDA, high quartile × EBITDA.
3.  The same on EV per site and EV per wash.
4.  Equity value range: less net debt (5.6.5).
5.  Format the block as the book prints it: $m, one decimal, the median bold (2.1, 2.3).
6.  Does it tie? Flip a comp's include flag and watch the range move.

**Done screen, line** **DRAFT** The first range on the board's page came from six companies and a median.

### 6.1.C Challenge: three comps spread and a range applied

*lesson: challenge-comps · 6 goals · five minutes*

**Brief** **DRAFT** Three fresh comps from their quarters. EV builds, LTM, calendarize one, median and quartiles, EV per site, the range applied.

**Goals (outline)** **DRAFT** EV build · LTM · calendarization · median and quartiles · operating multiples · range on Clearcoat.

## 6.2 Precedent transactions

*module: precedent-transactions*

**Story card, title** **DRAFT** What buyers have actually paid.

**Story card, body** **DRAFT** Trading multiples are what the market pays for a slice; precedents are what a buyer paid for the whole thing, control included, in real deals over the last three years. They're fewer, older and harder to compare, so the questions are which deals count, how old is too old, and what a control premium looks like when the target was listed.

**Objective (data room)** **DRAFT** Precedent transactions: deal multiples and premiums; sorting by date and size and deciding what's comparable; applying the precedents range.

**Page name** Precedents, spread

### 6.2.1 Deal multiples and premiums

*lesson: deal-multiples-premiums · 6 goals*

**Brief** **DRAFT** A precedent is a deal that closed: the enterprise value paid over the target's LTM EBITDA at the time. Where the target was listed, the premium is the price paid over the share price before the deal was announced: the control premium, the reason precedents run above trading comps. Spread the six deals the same way as the comps, with the premium where it exists. The key is `=`.

**Goals (outline)** **DRAFT**

1.  Six deals on Precedents, blue and sourced: date, target, acquirer, EV, LTM EBITDA, sites, pre-announcement price and offer price where listed.
2.  EV/EBITDA and EV per site for each.
3.  Premium = offer over pre-announcement price − 1, where listed; a dash otherwise (2.2.1).
4.  Add a column for acquirer type, sponsor or strategic, because a strategic buyer often pays more for synergies.
5.  Best practice: the deal date is an input; the age of a precedent is a formula against the as-of date (3.2.1), not a judgment made in your head.
6.  Does it tie? Change a deal's EV and watch its multiple and premium answer.

**Done screen, line** **DRAFT** Six deals are spread, with the premium a control buyer paid on each listed one.

### 6.2.2 Sort by date and size, and decide what's comparable

*lesson: sort-and-decide · 6 goals*

**Brief** **DRAFT** Not every deal counts: one is four years old and priced in a different rate environment; one is a 200-site national chain; one is a strategic buying a competitor. Sort by date, then by size (4.2.1), read each against Clearcoat, and set an include flag with a reason. Then the median and range on what's left (6.1.3). Deciding what's comparable is the judgment; the flag is how it's made visible. The key is `Alt A S S`.

**Goals (outline)** **DRAFT**

1.  Age in years from the as-of date (3.2.4).
2.  Sort a copy by date, then by EV; read the set.
3.  Include flags with a reason column: the four-year-old deal out (rates), the national chain out (scale), the strategic in but noted.
4.  Median and quartiles on the included deals' multiples.
5.  Compare the precedents median with the trading median from 6.1.3: read the control premium the gap implies. Then read the DCF's 11.0x exit multiple (5.6.4) against both medians: it should sit between them, or have a reason not to.
6.  Does it tie? Include the excluded chain and watch the range widen.

**Done screen, line** **DRAFT** Four deals count, and the page says why each of the others doesn't.

### 6.2.3 Applying the precedents range

*lesson: applying-precedents · 5 goals*

**Brief** **DRAFT** The precedents row of the football field: the included deals' low, median and high multiples times Clearcoat's EBITDA, and the same on EV per site. It sits above the comps row, because control costs more, and the gap between the two is the first thing the board will ask about. Build it in the same block shape as 6.1.5 so the Summary can read both. The key is `*`.

**Goals (outline)** **DRAFT**

1.  EV range from the precedents multiples × Clearcoat's EBITDA.
2.  EV range from EV per site × 40.
3.  Equity value ranges, less net debt.
4.  Formatted to match 6.1.5's block exactly (Paste Formats, 1.3.4).
5.  Does it tie? Flip a deal's flag and watch the range move.

**Done screen, line** **DRAFT** The second range sits above the first, and the gap between them is the control premium.

### 6.2.C Challenge: precedents spread

*lesson: challenge-precedents · 5 goals · four minutes*

**Brief** **DRAFT** Five fresh deals. Multiples, premiums, ages, include flags with reasons, the range applied.

**Goals (outline)** **DRAFT** Multiples · premiums · ages · flags and reasons · range.

## 6.3 LBO: the sponsor's bid

*module: lbo*

**Story card, title** **DRAFT** How a sponsor can pay what they're offering.

**Story card, body** **DRAFT** The lead sponsor is offering $195m, and the way they can afford it is debt: borrow nearly half the price against Clearcoat's own cash flow, use every spare dollar to pay it down, sell in five years at the same multiple, and keep what's left. Rebuild their model to see what return that gives them and, once you can, what the most is they could pay and still hit it.

**Objective (data room)** **DRAFT** The LBO: sources and uses; debt tranches and the cash sweep; sale-leasebacks and what they cost later; returns (IRR and MOIC); the returns bridge; sensitivity on entry and exit.

**Page name** The sponsor's LBO

### 6.3.1 Sources and uses

*lesson: sources-and-uses · 7 goals*

**Brief** **DRAFT** Every buyout starts with one table: uses (the price paid for the company and the fees to do the deal) and sources (the debt raised against the company's EBITDA and the equity the sponsor puts in, which is whatever the debt and the stake the owners keep don't cover). Sources equal uses, always, and the equity line is where the balance lands. Build it from the entry multiple and the leverage the lenders will allow. The key is `=`.

**Goals (outline)** **DRAFT**

1.  Inputs, blue: entry multiple 11.7x, FY26E EBITDA from the model, fees 2%, senior leverage 4.5x at 8%, mezzanine 1.0x at 12%.
2.  Uses: enterprise value = multiple × EBITDA, shown as its two parts: the existing term loan repaid, net of cash (lenders rarely let a loan carry over when control changes, and the delayed-draw loan is still undrawn at closing), and the equity purchased, which is the equity value line of 6.4.2; fees = EV × 2%; total uses.
3.  Sources: senior = 4.5 × EBITDA; mezzanine = 1.0 × EBITDA; the owners' rollover, the 20% of their equity that bid C has them keep as a stake in the new company instead of taking cash (6.4.1); sponsor equity = total uses − debt − rollover, which is what the sponsor wires.
4.  Add the check that sources less uses reads zero on Checks, the ninth row of the model's catalog (5.2.4), live from here.
5.  Show equity as a share of the price and debt as a multiple of EBITDA, the two numbers a lender and a sponsor each read first.
6.  Best practice: the equity line is the plug in sources and uses, and it's the one honest plug in finance, because it's the sponsor's choice.
7.  Does it tie? Raise the entry multiple to 12.5x and watch equity rise while the debt doesn't.

**Done screen, line** **DRAFT** The table says where $199m comes from and where it goes, and the equity line is what the sponsor risks.

### 6.3.2 Debt tranches and the cash sweep

*lesson: tranches-and-sweep · 7 goals*

**Brief** **DRAFT** Two tranches, two rates, one rule, the cash sweep: every spare dollar of cash repays the senior loan, while the mezzanine usually can't be repaid early without a penalty and waits for the exit. Free cash flow comes from Chapter 5's model, linked; interest is on the average balance through the breaker (5.3.5); the sweep is MIN of cash available and the balance (5.4.4). Five years of it, and read how far net debt came down. That's what the sponsor's equity is worth more by. The key is `MIN`.

**Goals (outline)** **DRAFT**

1.  FY27–FY31 EBITDA and unlevered free cash flow linked from the Chapter 5 model (5.6.2).
2.  Senior: opening, interest at 8% on the average (breaker), mandatory amortization, sweep, closing. The 5% is of the original loan, as loan agreements quote it: =MIN(5% × original principal, opening balance), with the 5% and the principal anchored (F4), so a loan that has been swept down never goes below zero.
3.  A cash row: opening cash, plus FCF, less interest on both tranches net of the tax it saves (interest × (1 − tax rate), because the Chapter 5 cash flow was taxed as if there were no debt), less mandatory amortization. Cash available for the sweep is that balance less minimum cash, so the minimum is held once, not taken out of every year.
4.  Sweep = MAX(MIN(cash available, senior opening less mandatory), 0), the floored form from 5.4.4, so a short year can't turn the sweep into new borrowing on the senior loan; a short year draws on the revolver row instead. The mezzanine isn't swept: once the senior loan is repaid the spare cash builds, and it comes off net debt at exit.
5.  Total debt at exit; net debt paid down over the hold. Read it one more way: had nothing been swept, the same cash would sit on the balance sheet and net debt at exit would be nearly the same, so what the sweep itself earns the sponsor is the interest it saves.
6.  A check: debt repaid plus cash built equals the cumulative cash after interest and tax, a live difference reading zero.
7.  Does it tie? Halve FY28's FCF and watch the exit debt rise.

**Done screen, line** **DRAFT** Five years of cash swept the senior loan, and the net debt paid down is what the equity grew by.

### 6.3.3 Sale-leasebacks: how a rollout gets financed, and what it costs later

*lesson: sale-leasebacks · 7 goals*

**Brief** **DRAFT** The land under twenty sites is worth $2.5m each to a landlord, and a sale-leaseback sells it and rents it back: $50m of cash today, $3.5m of rent a year forever, and EBITDA falls by the rent, so the same business is worth less on a multiple the day after. Sponsors use it to fund rollouts without more debt; buyers of the next deal see the rent and pay less. Model it as a switch and read both sides. The key is `IF`.

**Goals (outline)** **DRAFT**

1.  Inputs: sites sold 20, value per site $2,500k, cap rate 7% (rent = value × cap rate).
2.  A switch: SLB on/off (4.5.1).
3.  Proceeds in FY27 as cash in; rent from FY27 as a site cost; adjusted EBITDA.
4.  Add a second switch for whether the proceeds repay the senior tranche in the sweep or fund new sites.
5.  Exit value at 11.0x on adjusted EBITDA: read how much lower.
6.  Best practice: an EBITDA that's been lifted by owning the land, or lowered by renting it, is labeled as such on every page; the rent is the number a later buyer finds.
7.  Does it tie? Switch the SLB on and watch exit debt fall and exit EV fall further.

**Done screen, line** **DRAFT** A sale-leaseback is cash today, rent forever and a lower EBITDA, and both switches sit on one page.

### 6.3.4 Returns: IRR and MOIC

*lesson: irr-moic · 8 goals*

**Brief** **DRAFT** The sponsor puts equity in at entry and takes equity out at exit: exit enterprise value (11.0x FY31 EBITDA) less the debt still outstanding. MOIC is the money-on-money multiple, equity out over equity in; IRR is the annual return that turns one into the other over five years (3.5.3). It's the house from 5.6.1 again: bought with a small down payment and a large mortgage, the same rise in its value is a far bigger return on the down payment. Build both, and read them against the 20% a sponsor typically needs. The key is `IRR`.

**Goals (outline)** **DRAFT**

1.  Exit EV = exit multiple × FY31 EBITDA; less net debt at exit (6.3.2); equity at exit.
2.  MOIC = equity at exit ÷ equity at entry, one decimal with an x, where entry equity is the sponsor's and the owners' rolled stake together, because both hold the new company on the same terms.
3.  The cash-flow row: entry equity as a negative in year 0, zeros, exit equity in year 5; IRR on it.
4.  Check IRR by hand: MOIC^(1/5) − 1, or in one cell with =RRI(5, equity in, equity out) (2.1.3).
5.  Split the exit equity by ownership of the new company (the sponsor's share is its equity ÷ (its equity + the rollover)) and run an IRR row for each holder. The owners' return and the sponsor's both equal the deal's: a live difference reading zero, and the proof that the split and the return rows are wired the same way.
6.  A lender's row under the sponsor's: the senior loan out at closing as a negative, the interest and repayments back each year, the balance repaid at exit; IRR on the row. It lands close to the loan's 8% (if it doesn't, a sweep or the exit-year balance is missing from the row).
7.  Read against a 20% hurdle: a flag (3.1.1) that says Clears or Short.
8.  Does it tie? Raise the exit multiple to 12x and see IRR and MOIC rise, then set both tranches' leverage to zero and read the return drop to what the business earns alone, since the gap is what the debt adds. Ctrl+Z twice.

**Done screen, line** **DRAFT** You can see what the sponsor makes, as a multiple and as a rate, and whether it clears their bar.

### 6.3.5 The returns bridge

*lesson: returns-bridge · 7 goals*

**Brief** **DRAFT** A return comes from three places, and a sponsor wants to see which: EBITDA growth (the rollout), multiple expansion (paying 11.7x and selling at 11.0x is a loss on this one), and debt paydown (the sweep). The bridge splits the equity gain into the three, takes off the fees paid on the way in, and the four lines sum to the total. Build it, and read that most of this return is the rollout and the sweep, not the multiple. The key is `=`.

**Goals (outline)** **DRAFT**

1.  Equity gain = exit equity − entry equity.
2.  EBITDA growth effect = (FY31 EBITDA − FY26 EBITDA) × entry multiple.
3.  Multiple effect = (exit multiple − entry multiple) × FY31 EBITDA.
4.  Debt paydown effect = net debt at entry − net debt at exit.
5.  Fees and costs: the 2% paid at entry, as a negative (entry equity paid for it and no buyer pays it back, so without this line the three effects overshoot the gain by the fees).
6.  The four lines sum to the gain: a check reading zero; each as a share of the total. Build it on total equity, the sponsor's and the owners' rolled stake together, and the rollover doesn't disturb it.
7.  Does it tie? Set the exit multiple equal to entry and watch the multiple effect read zero.

**Done screen, line** **DRAFT** The return split into three effects and the fees, and the sweep and the rollout did most of the work.

### 6.3.6 Sensitivity on entry and exit: what the sponsor can pay

*lesson: what-the-sponsor-can-pay · 6 goals*

**Brief** **DRAFT** Turn the model around: at a 20% IRR, what's the most the sponsor can pay? A two-way table (4.5.3) of IRR against entry multiple and exit multiple shows it; a PV formula (3.5.1) gives the top price at any hurdle and stays live, and Goal Seek (4.5.4) confirms the 20% answer. That price is the LBO row on the football field: the ceiling on what a sponsor can offer, whatever the comps say. The key is `Alt A W T`.

**Goals (outline)** **DRAFT**

1.  The IRR table: entry multiples down, exit multiples across, corner = IRR.
2.  Conditional format (2.5.2): cells below 20% red.
3.  Goal Seek: set IRR to 20% by changing the entry multiple; note the price it implies and restore the input.
4.  The LBO range, as formulas: across three hurdle rates (25%, 20%, 17.5%), the most equity that still earns the hurdle is =PV(hurdle, 5, 0, -exit equity) (3.5.1), and the top price is (that equity + the debt) ÷ (1 + fees), as EV. One formula filled right; the 20% column agrees with goal 3's Goal Seek, and unlike three pasted answers it stays a link for the football field.
5.  Best practice: the LBO range is a ceiling, and the sponsor knows it; a bid above it means they see something the model doesn't, or they're planning a sale-leaseback.
6.  Does it tie? Change the leverage and watch the whole table shift. Then switch the Cover's Case to Downside (5.2.6), F9, and read the sponsor's IRR and MOIC against the 20% hurdle: most of a buyout's return rests on the operating plan, so it's read under a weaker plan too.

**Done screen, line** **DRAFT** You know the most a sponsor can pay and still make their return, and it's the ceiling on every bid.

### 6.3.C Challenge: a paper LBO

*lesson: challenge-paper-lbo · 6 goals · five minutes*

**Brief** **DRAFT** Fresh inputs, one sheet. Sources and uses, one tranche with a sweep over five years, exit, MOIC and IRR, the bridge.

**Goals (outline)** **DRAFT** Sources and uses balance · sweep · exit equity · MOIC and IRR · bridge · flag against 20%.

## 6.4 The bids and the waterfall

*module: bids-and-waterfall*

**Story card, title** **DRAFT** Which bid is really highest?

**Story card, body** **DRAFT** Three bids: $185m in cash, $200m with $25m of it paid later if next year goes well, $195m with the owners rolling a fifth of their equity into the new company. The headline says one order; the proceeds say another. Price each structure, run the waterfall from enterprise value to what each owner takes home (your own options included), and put every range on one line for the board.

**Objective (data room)** **DRAFT** The bids and the waterfall: three bids side by side (headline, structure, certainty); from enterprise value to the owners' proceeds; your stake under each bid; the football-field table and the one-page summary for the board.

**Page name** The valuation summary for the board

### 6.4.1 Three bids side by side: headline, structure, certainty

*lesson: bids-side-by-side · 7 goals*

**Brief** **DRAFT** A bid is a headline price and a structure, and the structure changes what it's worth. An earnout is part of the price paid later if a target is hit, so it's worth its amount times the odds of hitting it; a rollover means the owners keep a stake in the new company, so that part isn't cash and it carries the new company's risk; a financing condition is a chance the deal doesn't close at all. Lay the three out and price each to an expected cash value. The key is `=`.

**Goals (outline)** **DRAFT**

1.  On Bids, the three across columns: headline EV, cash at close, earnout, rollover share, conditions.
2.  Earnout expected value = amount × probability (an input, 50%, blue, with the reason).
3.  Rollover value = equity value × share, carried at the sponsor's expected return over three years (a second input) and discounted back (5.6.5). Beside it, the rolled stake two ways: as a share of the old equity (20%) and as a share of the new company's equity (the rollover ÷ total equity in 6.3.1's sources). The second is the larger, about a quarter on these figures, because debt funds nearly half the price.
4.  Certainty: a probability of close per bid (inputs); expected value = priced value × certainty.
5.  Rank the three on headline, on priced value and on expected value (3.3.4): three different orders.
6.  Best practice: every probability is an input with a reason beside it; the board will argue with the odds, not the arithmetic.
7.  Does it tie? Change the earnout probability and watch bid B's rank move.

**Done screen, line** **DRAFT** Each bid has three prices, and the order changes with each one.

### 6.4.2 From enterprise value to the owners' proceeds: the waterfall

*lesson: the-waterfall · 7 goals*

**Brief** **DRAFT** Enterprise value is what the buyer pays for the business, and the owners' proceeds are what's left once everyone ahead of them in line has been paid: net debt is repaid, transaction fees are paid, the management option pool takes its share of the equity, and the rest is split by ownership, two founders at 35% each and the family office at 30%. That's the waterfall, one line per claim, and the last line is the number the board cares about. Build it for bid A, then for all three. The key is `=`.

**Goals (outline)** **DRAFT**

1.  Enterprise value (bid A); less net debt at closing (from the model); equity value.
2.  Less transaction fees (2% of EV, the advisers' and lawyers'); less the option pool (5% of equity value, Inputs). Each deduction is written =MIN(claim, what's left above it), so a price below the claims floors the owners at zero instead of showing a negative.
3.  Label net proceeds to owners pre-tax (the deal's structure changes what each owner keeps after tax, and that's the tax adviser's question, not this page's), split by the ownership table on Inputs (35 / 35 / 30).
4.  Fill the waterfall across the three bids with the priced values from 6.4.1 (Ctrl+R, 1.6.5).
5.  Format as the book prints it: each deduction in parentheses through the desk number format (1.5.1), the proceeds line double-bottomed (2.3.3).
6.  Best practice: the waterfall reads top to bottom in the order the claims are paid; a line out of order is a line a lawyer will move.
7.  Does it tie? Raise the fees to 3% and watch every owner's line fall. Then type an enterprise value below net debt and read the owners' line at zero, not below it; Ctrl+Z.

**Done screen, line** **DRAFT** The waterfall runs from what the buyer pays to what each owner takes home, one claim at a time.

### 6.4.3 Your stake: what your options are worth under each bid

*lesson: your-stake · 6 goals*

**Brief** **DRAFT** You hold options over 0.2% of the company, fully diluted, with a strike set when the company was worth $40m. An option is worth the equity value per share less the strike, times your shares, or zero if the strike is above the price, and MAX handles that (3.1.2). Three bids, three numbers, and one of them is yours. Build the line under the waterfall. The key is `MAX`.

**Goals (outline)** **DRAFT**

1.  Inputs: your option share 0.2%, strike valuation $40,000k, vesting 100% at a sale (blue, sourced to the plan).
2.  Value per bid = MAX(equity value × 0.2% − $40,000k × 0.2%, 0).
3.  Your share sits inside the 5% pool, so the pool line in 6.4.2 already funds it, and a note under it saying so stops double-counting.
4.  The three values side by side; the earnout's share of yours, deferred (6.4.1).
5.  Best practice: a manager's stake is modeled with the same rigor as the owners', and shown on the page; it's the line the board forgets and the manager doesn't.
6.  Does it tie? Change the strike valuation and watch your line move and the owners' not.

**Done screen, line** **DRAFT** Three bids are priced, and the line at the bottom of the waterfall is yours.

### 6.4.4 The football-field table and the one-page summary for the board

*lesson: football-field-board-page · 8 goals*

**Brief** **DRAFT** The football field puts every valuation range on one line: comps, precedents, DCF, the LBO ceiling, the three bids. Low, median, high, as a table (no chart), so the board sees in one look where the bids sit against every method. Under it, the waterfall for the recommended bid and one line of recommendation. Every cell on the page is a link to the sheet that built it, and the page prints on one sheet. The key is `Ctrl+PgDn`.

**Goals (outline)** **DRAFT**

1.  On Summary build the football-field rows, each low, mid, high as links: Trading comps (6.1.5), Precedents (6.2.3), DCF (Chapter 5's sensitivity range, linked), LBO (6.3.6), Bids A, B and C.
2.  A "where the bids sit" column: each bid's mid as a share of the DCF mid.
3.  The waterfall for the recommended bid, linked from 6.4.2.
4.  Type the recommendation line, one sentence in blue, the one place on the page a human wrote.
5.  The page's anatomy (2.3): title from Inputs, units, sections, a source line, the checks flag from the Cover.
6.  Green on every link; the checks block for the page (3.6.4).
7.  Print set-up: portrait, one page, footer (2.7).
8.  Does it tie? Change bid B's earnout probability on Bids and watch the football field and the waterfall answer on the board's page.

**Done screen, line** **DRAFT** Every method and every bid on one page, and the board can see where the money is.

### 6.4.C Challenge: a one-page valuation summary assembled

*lesson: challenge-board-page · 6 goals · five minutes*

**Brief** **DRAFT** Five ranges and three bids on other sheets; the Summary is blank. The football field, the waterfall, the stake line, the anatomy, print set-up.

**Goals (outline)** **DRAFT** Football-field links · waterfall · your stake · title and sections · checks · print.

## 6.5 Project and assessment

*module: ch6-project-and-assessment*

**Story card, title** **DRAFT** The last page of the pack.

**Story card, body** **DRAFT** A fresh comp set, fresh precedents, a sponsor's term sheet and three bids. Spread, apply, rebuild the LBO, price the bids, run the waterfall, assemble the page. Build it, then build it again on the clock. The assessment is the test-out, and passing it Verifies the last chapter, which makes the program certificate yours.

**Objective (data room)** **DRAFT** The one-page valuation summary for the board, the last page of the pack; the assessment is the test-out.

**Page name** The valuation summary

### 6.P Project: the valuation summary for the board

*lesson: ch6-project · about 16 goals · no clock*

**Outline** **DRAFT** Comps spread with LTM and calendarization · median and quartiles with include flags · operating multiples · the comps range · precedents spread, aged, flagged · the precedents range · sources and uses · two tranches with the sweep · sale-leaseback switch · IRR and MOIC · the bridge · the IRR table and the LBO ceiling · three bids priced · the waterfall · your stake · the football field and the board page · Does it tie?

### 6.A Assessment: fifteen minutes

*lesson: ch6-assessment · about 14 goals · fifteen minutes · hard clock, no help, keyboard only*

**Outline** **DRAFT** A fresh set and term sheet, sized by start and end state: raw comps and bids in, the board's page out with every link live. Pass is Verified (the sixth), and hotkey.gg Certified · Excel for Finance is issued.

## Keys and functions this chapter teaches

MEDIAN, AVERAGE, QUARTILE.INC, MIN, MAX on a flagged set through a helper column, =IF(include=1, multiple, ""); SUMIFS on a date window for LTM (4.3.3, used); calendarization arithmetic; RANK (3.3.4, used); IRR on equity (3.5.3, used) and MOIC^(1/n); MIN and MAX for the sweep (5.4.4, used); the breaker (5.3.5, used); switches with CHOOSE (4.5.1, used); data tables and Goal Seek (4.5, used); the waterfall as a linked column; the football-field table.

## Engine needs

QUARTILE.INC; MEDIAN over a conditional set (array evaluation of MEDIAN(IF()) or the helper-column route only); links between the Chapter 5 model workbook and the Chapter 6 pack (either one workbook for both chapters, or Chapter 6 carries a linked copy of the FY27–FY31 lines); a two-way IRR table; the Summary's print set-up on a portrait page.

## Open for Wolf's bucketing pass

  - Chapter 6 reads Chapter 5's model for EBITDA and FCF; decide whether Chapters 5 and 6 share one workbook (cleaner, and the certificate's "the pack" is one file) or Chapter 6 carries a linked copy.
  - MEDIAN on a flagged set needs either array evaluation or a helper column; the helper column is the safer teach and the one banks use.
  - The sale-leaseback lesson (6.3.3) is the seed for the restructuring DLC (screenplay 4.9): the rent it creates is what breaks in year five. Keep it a full lesson, or shorten to an aside in 6.3.2.
  - The learner's stake (6.4.3) is a Wolf idea (Round 4) and the emotional end of the course; confirm the 0.2% and the $40m strike, or set them.
  - Charts stay out: the football field is a table (screenplay section 5). Confirm for the board page, where a chart is most tempting.
  - Source pass (2026-09-30): the fold-back plan in claude/source-checklist.md (section H) is applied to this chapter as DRAFT: 36 edits, plus eight held items pulled back on Wolf's depth call (G193, G162, G137, G140, G156, G155, G146, G163). Wolf's calls of that day are in the decision log (screenplay 11); what was held back stays listed in the checklist's section B.
  - Scope (Wolf, 2026-09-30): merger math and the deeper public-company comps work (share counts and dilution, EPS and P/E, premiums on one-day and one-month unaffected prices) stay out of the chapter as too finance-heavy; they're parked as add-ons (screenplay 4.10). Module 6.1 stays as written: six fictional listed operators, enterprise-value multiples only.
