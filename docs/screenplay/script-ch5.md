# hotkey.gg Script · Chapter 5: Finance and Accounting

The shell for Chapter 5, revised 2026-09-28 after Wolf's notes: a lesson on how the three statements link (5.1.5), the statements populated from a data tab by INDEX/MATCH (5.2.5), the drivers block with three cases by year and one selector (5.2.6, from his second note the same day), the checks catalog with the ROUND rule (5.2.4), the corkscrew named (5.3), the Watch Window and the second-window tip (5.5.2, 5.4.1). Every line is **DRAFT**. Same anatomy, limits and redundancy rule as Chapters 2–4. Wolf, Round 4: the statements are taught as full lessons in the order a DCF reads them (income statement, cash flow, balance sheet), with the accounting in the lesson, the way a paid course does it, and the DCF at the end of the chapter.

## The chapter in brief

**Where the deal is.** Final round. The bidders left standing want a model they can run their own cases on (three statements that balance, the schedules behind them, checks that prove it) and a view of what the cash flows are worth. The company's plan is forty sites to seventy in five years, at about $5m a site all in ($2.5m of it Clearcoat's own build, on land it rents), and the model is where that plan becomes numbers a buyer can price.

**The product.** The operating model: a Cover, Inputs, the three statements on annual timelines (FY24A–FY26E historical, FY27–FY31 projected), the schedules (rollout and revenue build, costs, working capital, PP&E, debt, tax), a Checks sheet with one flag, and the DCF page.

**What the learner can say afterwards.** How a wash sold becomes revenue, a chemical becomes cost of sales, a tunnel wearing out becomes depreciation and a loan becomes interest; why profit isn't cash and where the difference lives; how the three statements link and why cash is the number that proves it; how a rollout drives revenue, capex and debt; what free cash flow is and what a DCF says it's worth.

**The finance, defined through the car wash:**

  - **The income statement** (5.1.1): a wash sold is revenue; the chemicals are cost of sales; the crew and the rent are operating costs; the tunnel wearing out is depreciation; the loan costs interest; the government takes tax; what's left is net income.
  - **Accrual and cash** (5.1.2): a member who paid on the first has paid for washes not yet delivered, so the cash is in the bank but the revenue isn't earned yet: deferred revenue; a chemical supplier paid in thirty days is a cost recorded before the cash leaves: a payable. Profit and cash differ by timing gaps like these.
  - **The cash flow statement** (5.1.3): from net income back to cash in three parts: operations (add back depreciation, adjust for the timing gaps), investing (the tunnels bought), financing (loans drawn and repaid).
  - **The balance sheet** (5.1.4): what the company owns (cash, receivables, tunnels), what it owes (payables, deferred revenue, debt) and what's left for the owners (equity); the cash flow statement's closing cash lands here, and the two sides have to agree.
  - **The corkscrew** (5.3.1): every schedule rolls a balance the same way (opening, plus additions, less subtractions, closing), and the closing feeds the next period's opening; the desks call it a corkscrew, and the rollout, PP&E, debt and equity all are one.
  - **Working capital days** (5.3.3): receivables in days of revenue (card settlement, three days), payables in days of cost (thirty), deferred revenue in days of membership revenue (about fifteen).
  - **Capex and depreciation** (5.3.4): a new site is $2.5m of capital expenditure (the building, the tunnel and the equipment, on rented land) that sits on the balance sheet and is depreciated over twenty years.
  - **The average-balance circle** (5.3.5): interest depends on the debt balance, which depends on cash, which depends on interest: a circular reference that's on purpose, with a breaker to switch it off.
  - **Free cash flow, WACC, terminal value** (5.6): the cash the business throws off after tax, capex and working capital, before financing; the blended return the company's investors require; what the business is worth beyond the forecast, by a multiple or a growth rate.

## The workbook

Eight sheets, annual, FY24A–FY31E across C:J with the A/E flag row and a projection flag. Figures in thousands, illustrative; the build session sets the balancing numbers.

**Cover**: title, the case switch (Chapter 4's Case, named), the checks flag, a sheet map with hyperlinks (2.4.4), the names list (4.6.2).

**Inputs**: the drivers block (5.2.6): five drivers by year for FY27–FY31 in three cases (Management, Base, Downside), with the live block beneath that the schedules read (new sites a year 6 / 6 / 4; washes a day per mature site 260 / 250 / 235; ticket growth 3% / 2% / 0%; member share 52% / 50% / 47%; cost of a wash 11.5% / 12% / 13% of revenue); then the single-value inputs: the rollout's starting point (40 sites), washes a day per new site (200), days (365), the blended retail ticket ($14.40), average fee ($30), labor, rent, utilities and maintenance per site, card fees and marketing as a share of revenue, head office ($6,000 + 3% a year + $50 per new site), capex per site ($2,500: the building, the tunnel and the equipment; land is rented, or held at cost where Clearcoat owns it, and never depreciated), maintenance capex (2% of revenue), depreciation life (20 years), working-capital days, the term loan ($60,000 at 7%, $3,000 a year of amortization), the delayed-draw loan ($25,000 over FY27–FY28), the revolver rate, the deposit rate on cash (nil), minimum cash ($5,000), distributions to the owners (nil), tax (25%), the DCF inputs (the valuation date 12/31/2026, the WACC build with its size premium, exit multiple 11.0x, growth 3%).

**IS**: revenue lines, cost of sales, site costs, site contribution, head office, EBITDA, depreciation, EBIT, interest, EBT, tax, net income; margins.

**CF**: operations (net income, depreciation, changes in receivables, payables and deferred revenue), investing (capex), financing (debt drawn and repaid, revolver, distributions to the owners), net change, opening and closing cash.

**BS**: cash, receivables, PP&E net; payables, deferred revenue, term loan, delayed-draw loan, revolver; equity (opening, net income, distributions, closing); the balance check.

**Schedules**: rollout and revenue build; cost build; working capital; PP&E (opening, capex, depreciation, closing); debt (each tranche: opening, draws, repayments, closing, average, interest); tax.

**Checks**: one check per schedule and statement, the roll-up flag (3.6.4).

**DCF**: unlevered free cash flow, discount factors, present values, terminal value both ways, enterprise value, net debt, equity value, the sensitivity tables.

## 5.1 The three statements

*module: the-three-statements*

**Story card, title** **DRAFT** What the sites did, in three statements.

**Story card, body** **DRAFT** Before the model, the accounting. Every wash, chemical, paycheck, loan payment and tunnel bought shows up in one of three statements, and a buyer reads all three because each one hides what the others show. This module builds them for one site and one week by hand, so that when the model links them at forty sites and five years, you know what every line means.

**Objective (data room)** **DRAFT** The three statements: the income statement; accrual and cash; the cash flow statement; the balance sheet; how the three link; one week of one site through all three; reading a set the way a buyer does.

**Page name** One site's month, in three statements

### 5.1.1 The income statement

*lesson: the-income-statement · 8 goals*

**Brief** **DRAFT** The income statement says what a business earned and spent over a period, and every line has a car-wash meaning: a wash sold is revenue; the chemicals and water are cost of sales; the crew, rent, utilities and maintenance are operating costs; the tunnel wearing out is depreciation; the loan costs interest; the government takes tax; what's left is net income. You built a P&L to EBITDA in Chapter 2; this one goes to the bottom line, for Domain, for one month. The key is `=`.

**Goals (outline)** **DRAFT**

1.  On a scratch sheet, Domain's September: washes 7,500 (COUNTIFS from the export, 3.3.2), blended ticket $13.90, revenue by pointing. Revenue is what the washes earned: money that comes in another way (interest on the bank balance, an insurance payout for a damaged arch) is other income, and it sits below operating profit, outside EBITDA.
2.  Cost of sales: washes × cost per wash ($1.50, Inputs); gross profit; gross margin (2.1.3).
3.  Site costs from Lists (rent, labor, utilities, maintenance, card fees at 2%); site contribution.
4.  A share of head office (one fortieth); EBITDA; EBITDA margin.
5.  Depreciation: the site's $2,500k build over 20 years, one month: define it as the tunnel wearing out. Amortization is the same charge for an intangible a company bought (a brand, a customer list; Clearcoat has none), and it's the A in EBITDA (2.1.3); it isn't the loan amortization of 5.1.3, which is repaying principal.
6.  EBIT; interest on the site's share of the loan (7% of $1,500k, one month); EBT.
7.  Tax at 25%, then net income, and format the page (2.3): totals bold with top borders, EBITDA and net income double-bottomed.
8.  Does it tie? Change the ticket and watch every line from revenue to net income answer.

**Done screen, line** **DRAFT** The statement runs from the first wash to the bottom line, and every line means something a site did.

### 5.1.2 Accrual and cash: why profit isn't cash

*lesson: accrual-and-cash · 7 goals*

**Brief** **DRAFT** A member pays $30 on the first of the month for washes they'll take all month, so on the first the cash is in the bank and none of the revenue is earned yet; by the thirty-first it's all earned. That unearned part is deferred revenue, a liability: the company owes the member washes. The chemical supplier is paid in thirty days, so September's chemicals are a cost in September and cash in October: a payable. Card revenue settles in three days: a receivable. Profit and cash differ by timing gaps like these. Build them for Domain's month. The key is `=`.

**Goals (outline)** **DRAFT**

1.  Deferred revenue: members × fee paid on the first (cash in), recognized a thirtieth a day (revenue), so build September 30, when the balance is zero, and the 15th, when it's half.
2.  Build a member who paid on the 20th, with two thirds still deferred on the 30th.
3.  Payables: September's chemicals ($11,250) recorded as cost; cash leaves in October. The September balance is the whole month. Chemicals are treated as used on delivery, so the model carries no inventory line; a business that holds stock charges only what it used and keeps the rest on the balance sheet as an asset. Two more gaps have the same shapes and no row on this page: a year of insurance paid ahead is a prepaid asset released a twelfth a month, deferred revenue's mirror; wages worked in the last days of a month and paid in the next are an accrued liability until payday, the payable's twin.
4.  Receivables: three days of card revenue at month end.
5.  Cash from operations for the month, by hand: net income, plus depreciation (no cash left), plus the rise in payables, less the rise in receivables, plus the rise in deferred revenue.
6.  Best practice: a change in a working-capital balance is what moves cash, not the balance itself; a rise in a liability is cash in, a rise in an asset is cash out.
7.  Does it tie? Change the payable days to zero and watch cash from operations fall to net income plus depreciation.

**Done screen, line** **DRAFT** On this page, profit and cash differ by three timing gaps, and now you can name each one.

### 5.1.3 The cash flow statement

*lesson: the-cash-flow-statement · 7 goals*

**Brief** **DRAFT** The cash flow statement starts from net income and walks back to cash in three parts. Operations: add back depreciation, because nothing was paid for wear, and adjust for the working-capital gaps from 5.1.2. Investing: the cash spent on tunnels, capex. Financing: loans drawn and repaid, dividends paid. The three sum to the change in cash, and opening cash plus the change is closing cash. Build Domain's for the month, indirect method. The key is `=`.

**Goals (outline)** **DRAFT**

1.  Operations: net income from 5.1.1, plus depreciation, less the rise in receivables, plus the rise in payables and in deferred revenue, then a subtotal.
2.  Investing: maintenance capex for the month (2% of revenue), as a negative.
3.  Financing: the site's share of the loan amortization ($75k a year, one month), as a negative.
4.  Net change in cash; opening cash (typed, blue); closing cash.
5.  Sign convention stated once: cash in positive, cash out negative (2.1.2).
6.  Best practice: depreciation is added back because it was never cash; capex is where the cash for the tunnel actually went.
7.  Does it tie? Halve the capex and watch closing cash rise by exactly that.

**Done screen, line** **DRAFT** The statement walks from net income back to the cash in the bank, in three parts.

### 5.1.4 The balance sheet

*lesson: the-balance-sheet · 8 goals*

**Brief** **DRAFT** The balance sheet is a snapshot: what the company owns (cash, receivables, the tunnels net of wear), what it owes (payables, deferred revenue, debt) and what's left for the owners, equity, which grows by net income, less anything paid out to them. The closing cash from the cash flow statement lands in the top line, and if everything else is right, assets equal liabilities plus equity. That equality is the check that proves the other two statements. Build Domain's at September 30 and watch it balance. The key is `=`.

**Goals (outline)** **DRAFT**

1.  Assets: cash from 5.1.3's closing; receivables from 5.1.2; PP&E: the site's $2,500k build less accumulated depreciation (Domain's land is rented, so there's no land on this page).
2.  Total assets, with rows most liquid first on this side and soonest due first on the other, where current means inside twelve months: receivables are a current asset, payables and deferred revenue current liabilities (the working capital of 5.3.3), and cash is current too, though it sits outside working capital.
3.  Liabilities: payables; deferred revenue; the site's share of the loan, less this month's repayment. Published financial statements split next year's scheduled repayments out as the current portion of debt; the model keeps each loan on one row.
4.  Equity: opening equity (typed, blue) plus net income.
5.  Total liabilities and equity; the balance check as a live difference (1.7.2): assets less liabilities and equity, reading zero. Every figure on this page is the price paid, not what it would sell for, so the equity here isn't what Clearcoat is worth: Chapter 6 answers that.
6.  Break it on purpose: type over closing cash; the check leaves zero; Ctrl+Z.
7.  Best practice: cash is never typed on a balance sheet; it's the cash flow statement's closing line, so the check means something.
8.  Does it tie? Change the ticket in 5.1.1 and watch all three statements move and the check stay at zero.

**Done screen, line** **DRAFT** Assets equal liabilities plus equity, and that one zero proves the other two statements.

### 5.1.5 How the three statements link

*lesson: how-the-statements-link · 7 goals*

**Brief** **DRAFT** Three statements, three questions: the income statement asks what the business earned over the period; the cash flow statement asks where the cash went; the balance sheet asks what it owns and owes at the end. They're one system, joined by five links: net income flows to the cash flow statement's first line and into equity; depreciation is a cost on the income statement, added back on the cash flow, and taken off the tunnels on the balance sheet; capex leaves on the cash flow and lands in PP&E; debt drawn or repaid moves on the cash flow and on the balance sheet; closing cash on the cash flow is the cash line on the balance sheet. Draw the map on the sheet, then prove each link with one number. The key is `Ctrl+[`.

**Goals (outline)** **DRAFT**

1.  On a scratch sheet, the three statements from 5.1.1–5.1.4 side by side, a column each.
2.  Link one: net income on the IS is the CF's first line and the BS's change in equity, so Ctrl+[ from both to prove they read the same cell.
3.  Link two: depreciation on the IS, added back on the CF and subtracted from PP&E on the BS, so follow all three.
4.  Link three: capex on the CF, added to PP&E on the BS.
5.  Link four: the loan repayment on the CF, off the debt line on the BS.
6.  Link five: closing cash on the CF is the cash line on the BS, which is why the balance check proves everything upstream.
7.  Does it tie? Change one number on the IS and watch all five links carry it to the BS, and the check stay at zero.

**Done screen, line** **DRAFT** Five links join three statements, and you followed each one with Ctrl+[.

### 5.1.6 One week of one site through all three statements

*lesson: one-week-three-statements · 8 goals*

**Brief** **DRAFT** Now the whole thing by hand, small enough to hold in your head: Domain for one week, seven days of washes, one chemical delivery, one payroll, one loan payment, one week of wear. Every event lands in at least two statements, and the balance check at the end says whether you placed each one right. It's the exercise every modeling course runs, and the one a buyer's analyst will ask you to talk through. The key is `=`.

**Goals (outline)** **DRAFT**

1.  The week's events, listed: 1,750 washes at $13.90; a $2,625 chemical delivery on credit, the week's usage at $1.50 a wash, since chemicals are expensed on delivery (5.1.2); $4,500 of payroll paid; a $3,460 loan payment ($2,020 interest, $1,440 principal); a week of depreciation ($2,400); card settlement lag of three days.
2.  Income statement for the week: revenue, cost of sales, site costs, depreciation, interest, tax, net income.
3.  Cash flow for the week: from net income, the add-backs and gaps, the loan principal.
4.  Balance sheet at the end of the week, from an opening one.
5.  The balance check reads zero, or you find which event you put in one statement and not the other.
6.  A second answer for cash: beside the statements, count the week's cash directly (washes collected, payroll paid, the loan payment) and take a live difference against the cash flow statement's net change, reading zero. The delivery isn't in the count, because it's on credit.
7.  Best practice: an event that touches cash touches the cash flow statement; an event that changes what's owned or owed touches the balance sheet; an event that's earned or incurred touches the income statement: most touch two.
8.  Does it tie? Add one more wash and watch it flow through revenue, net income, cash and equity.

**Done screen, line** **DRAFT** One week's six events went through three statements, and the check reads zero.

### 5.1.7 Reading a set of statements the way a buyer does

*lesson: reading-statements-like-a-buyer · 6 goals*

**Brief** **DRAFT** A buyer reads three ratios before anything else: margin (EBITDA over revenue: how much of a dollar of washes becomes profit), cash conversion (cash from operations over EBITDA: how much of that profit turns into cash) and leverage (net debt over EBITDA: how many years of profit the debt represents). Build the three on Domain's statements, then on the company's from Chapter 2, and read what each one says about a car wash. The key is `=`.

**Goals (outline)** **DRAFT**

1.  EBITDA margin from 5.1.1; read it against the Chapter 2 P&L's 33%.
2.  Cash conversion: cash from operations before interest and tax, over EBITDA. Read why a member business converts well.
3.  Net debt: debt less cash; leverage: net debt over EBITDA, in years, one decimal with an x (2.2.2). One more lender's read in the next cell: interest cover (EBITDA ÷ interest, how many times the year's profit pays the year's interest), one decimal with an x. Leverage says how much debt; cover says whether the earnings can carry it.
4.  Return on the site: annual site contribution, which is after rent, over the $2,500k Clearcoat spent building it.
5.  Best practice: three ratios on every set of statements, in the same place, formatted the same way, so a reader compares sites at a glance.
6.  Does it tie? Change the loan balance and watch leverage move while margin doesn't.

**Done screen, line** **DRAFT** Margin, cash conversion and leverage are the three numbers a buyer reads first.

### 5.1.C Challenge: one site's month through the three statements

*lesson: challenge-one-site-three-statements · 6 goals · five minutes*

**Brief** **DRAFT** Another site's month: the events listed, the opening balance sheet given. Income statement, cash flow, balance sheet, the check at zero, the three ratios.

**Goals (outline)** **DRAFT** IS to net income · working-capital gaps · CF in three parts · BS · balance check zero · margin, conversion, leverage.

## 5.2 Model setup and efficiencies

*module: model-setup*

**Story card, title** **DRAFT** Set the model up before you build it.

**Story card, body** **DRAFT** Forty sites, eight years, six schedules and three statements is too much to hold in your head, so the model holds it for you, if it's laid out in the order it calculates: inputs feed schedules, schedules feed statements, statements feed the DCF, left to right across the tabs. Set the sheets, the timeline and the checks up empty first, and every formula after has a place to go.

**Objective (data room)** **DRAFT** Model setup: inputs, calculations and outputs, sheet order and a Cover; the timeline row with its flags and counters; the fill patterns at model speed; the checks sheet from day one; the statements populated from the data tab by INDEX/MATCH; the drivers block (three cases by year, one selector, one live block).

**Page name** The model shell

### 5.2.1 Inputs, calculations, outputs: architecture and sheet order

*lesson: model-architecture · 6 goals*

**Brief** **DRAFT** A model reads left to right the way it calculates: Cover, Inputs, then the statements, then the schedules that feed them, then Checks, then the DCF. Inputs are blue and live on one sheet; calculations never hold a typed number; outputs are the pages someone reads. The Cover carries the title, the case switch, the checks flag and a map of the sheets with links (2.4.4). Set the eight sheets up in order, with the Cover first. The key is `Alt H O M`.

**Goals (outline)** **DRAFT**

1.  The file arrives with the eight sheets in a random order: read the tabs.
2.  Move them into order with Move or Copy (1.1.1): Cover · Inputs · IS · CF · BS · Schedules · Checks · DCF.
3.  Color the tabs: Inputs one color, the statements another, Checks red.
4.  The Cover: title from Inputs (2.6.3), the case switch (4.5.1, named Case), a checks flag cell that reads Checks, a sheet map with a hyperlink per sheet.
5.  Best practice: one Inputs sheet; a typed number anywhere else is a fault the audit will find (5.5.3).
6.  Does it tie? Follow each link on the Cover; every one lands on its sheet's A1.

**Done screen, line** **DRAFT** Eight sheets sit in the order they calculate, and the Cover says where everything is.

### 5.2.2 The timeline row: flags and counters

*lesson: timeline-flags-counters · 8 goals*

**Brief** **DRAFT** Every sheet in the model shares one timeline: FY24A to FY31E across the same columns, built from one date on Inputs (2.6.2), with the A/E flags underneath (2.1.4). This time the flags do work: a projection flag (1 in a projected year, 0 in a historical one, FY26E included) lets one formula read the actual where there is one and calculate where there isn't; a period counter (1 to 8) drives growth and ramps. Build the row once on Inputs and link it to every sheet. The key is `EOMONTH`.

**Goals (outline)** **DRAFT**

1.  On Inputs, C4 the first year-end (typed, blue); D4:J4 =EOMONTH(C4,12) filled right; custom format "FY"yy (2.2.3). The model is annual because it's a valuation (liquidity work runs monthly or weekly, built at the smallest period and rolled up), and it projects five years because fewer gives too little to value and more is hard to defend.
2.  The A/E flag row: A, A, E for FY24 to FY26 and E after: FY26 is the estimate for the year still running (2.1.4). The projection flag row reads its own input, the last historical year-end (typed once on Inputs, blue, 12/31/2026, named LastHistorical): =IF(C4>LastHistorical,1,0), so FY26E stays with the history.
3.  A period counter: C7 =1, D7 =C7+1 filled right; a projection counter that starts at 1 in FY27: =IF(C6=1,MAX(B8,0)+1,0). The desk's other counter is =COLUMNS($C4:C4): 1 in the first period and one more with every column it fills across, with no first cell to break and no typed offset (ROWS does the same down a column).
4.  Prove it: fill =COLUMNS($C4:C4) across row 9 and take a live difference against the counter in row 7, reading zero. Then insert a column in front of C and watch FY24 still count 1, where =COLUMN()-2 would now read 2; Ctrl+Z.
5.  Link the timeline to IS, CF, BS, Schedules and DCF row 4 with Ctrl+Enter columns (1.6.4), green. Best practice: the same year sits in the same column on every sheet (FY26 is column E everywhere), so a cross-sheet link never needs a MATCH and a reviewer never counts columns.
6.  The divider between FY26 and FY27 on every sheet (2.3.2): in the model it marks where the projection flag turns to 1, so FY26E sits on the history side of it.
7.  Best practice: a formula that reads the flag, =IF(flag=0, actual, calc), lets one row carry history and forecast with no seam.
8.  Does it tie? Change the first year-end on Inputs and watch every sheet's headers roll.

**Done screen, line** **DRAFT** One timeline runs across eight sheets, and its flags let one row hold history and forecast.

### 5.2.3 The fill patterns: anchor, fill right, AutoSum a block, F4

*lesson: fill-patterns-at-model-speed · 6 goals*

**Brief** **DRAFT** Every skill here is Chapter 1's: anchors (1.6.3), Ctrl+R (1.6.5), AutoSum over a block (1.6.2), F4 to repeat (1.5.4), all done as one motion across a model-sized block: write the first-period formula with its anchors right, Ctrl+Shift+→ to the last period, Ctrl+R, then the next row. A row of eight is one formula; a block of forty rows is forty formulas and forty fills, and it takes minutes, not an afternoon. Practice on the cost build's skeleton. The key is `Ctrl+R`.

**Goals (outline)** **DRAFT**

1.  On Schedules, the cost build has labels and a first-period formula on one row: labor = sites × labor per site, sites relative, labor per site anchored to Inputs.
2.  Ctrl+Shift+→ then Ctrl+R: the row fills FY24 to FY31.
3.  The next five rows the same way, one motion each.
4.  A totals row under the block with one Alt+= across all eight periods.
5.  The desk number format on the block as one action: Ctrl+1, Custom, the four-section code from 2.2.1, #,##0_);(#,##0);"–"_);@_), Enter; then F4 repeats the whole format onto the next block. A one-press route exists only as a button on your toolbar or in an add-in.
6.  Does it tie? Change labor per site on Inputs and watch eight years answer.

**Done screen, line** **DRAFT** Six rows across eight years took one motion each.

### 5.2.4 The checks sheet from day one

*lesson: checks-sheet-day-one · 6 goals*

**Brief** **DRAFT** The Checks sheet is built before the model is, empty, with a row for every check the model will need: the balance sheet balances; cash on the balance sheet equals the cash flow's closing cash; the debt schedule's closing equals the balance sheet's debt; FY26 EBITDA ties to the Chapter 2 P&L; every schedule's total ties to its statement line. Each is a live difference (1.7.2); the roll-up flag (3.6.4) sits on the Cover. As each schedule is built, its check goes live. The key is `=`.

**Goals (outline)** **DRAFT**

1.  On Checks, the labels: eight checks, one per row, across all eight years, the catalog every model carries (screenplay section 5, "The checks thread"): balance sheet balances; BS cash equals CF closing cash; debt schedule closing equals BS debt; PP&E closing equals BS PP&E; revenue on the IS ties to the build; the cost build cross-foots; equity rolls (opening plus net income less distributions equals closing); FY26 EBITDA ties to the Chapter 2 P&L. Sources equal uses joins as the ninth when the buyout is built (6.3.1).
2.  The first two go live now, BS balance (assets less liabilities and equity) and cash tie (BS cash less CF closing cash), both reading zero on the filled historical years.
3.  The other six rows stay empty until their schedules exist, with "pending" typed in the next cell: never a typed 0, which is the dead check 5.5.C plants, and the roll-up reads an empty cell as nothing.
4.  The roll-up: a SUMPRODUCT of ABS over the block, and the flag OK / CHECK (3.6.4), linked to the Cover. Best practice: wrap each check in ROUND(…,2), because floating-point arithmetic leaves 0.0000000001 where a zero belongs and the flag would call it a fault.
5.  A conditional format turning any non-zero red (2.5.2).
6.  Does it tie? Type over a historical cash figure and watch the Cover flag turn to CHECK; Ctrl+Z.

**Done screen, line** **DRAFT** Two of eight checks are live, and the other six have their rows waiting.

### 5.2.5 Populate the statements from the data tab: INDEX/MATCH on label and year

*lesson: populate-from-data-tab · 7 goals*

**Brief** **DRAFT** The three historical years arrive on a Data tab as the accountants sent them: forty lines in their order, years across, labels that don't match the model's. The model's IS should read them by name, not by position: INDEX/MATCH on the label down and the year across (4.1.4), so the same formula fills the whole historical block and survives a re-sorted export. Where the data has duplicate labels, SUMIFS on label and year does the same job and adds them (4.1.7). Fill the IS historicals from Data with one formula. The key is `INDEX`.

**Goals (outline)** **DRAFT**

1.  Read Data: the accountants' labels in B and the years 2024 to 2026 as plain numbers across C4:E4; on Inputs, a mapping table with the model's line names in M and the accountants' name for each beside it in N.
2.  On IS, a helper in column A reads each line's name on Data from the mapping: A7 =INDEX(Inputs!$N$5:$N$44, MATCH($B7, Inputs!$M$5:$M$44, 0)). Then one formula for the historical block: =INDEX(Data!$C$5:$E$44, MATCH($A7, Data!$B$5:$B$44, 0), MATCH(YEAR(C$4), Data!$C$4:$E$4, 0)), the mapped label down, the year across, because the model's own label and its date header aren't what Data holds.
3.  Fill it across the three actual years and down every line; the projection flag keeps it out of the forecast columns (5.2.2).
4.  Re-sort the Data tab, watch nothing on the IS move, then Ctrl+Z.
5.  Two Data lines share a label (two rent accounts): switch that line to SUMIFS on label and year, and read why.
6.  Best practice: never link a model to a data dump by cell position; the next dump will be a row longer, and INDEX/MATCH by name is what survives it.
7.  Does it tie? Change a figure on Data and watch the IS historical answer, and the revenue tie on Checks stay at zero.

**Done screen, line** **DRAFT** The historicals read the data tab by name, so the next dump can be any shape.

### 5.2.6 The drivers block: three cases by year, one selector, one live block

*lesson: drivers-block · 8 goals*

**Brief** **DRAFT** A buyer doesn't want one forecast; they want the company's case, their own, and the one they can live with, and they want to flip between them without opening a second file. So the drivers, the handful of inputs that move everything, live on Inputs three times, one block per case, by year, and a fourth block beneath reads whichever case the Cover's switch names (4.5.1). Every schedule reads the live block and only the live block; the switch is the only thing a buyer has to touch. The key is `CHOOSE`.

**Goals (outline)** **DRAFT**

1.  On Inputs, three blocks with the same five rows (new sites a year, washes a day per mature site, ticket growth, member share, cost of a wash as a share of revenue) for FY27–FY31: Management in rows 12–16, Base in 18–22, Downside in 24–28; typed, blue, the unit in every label (sites, washes, %, %, % of revenue). One exception to typing every year: a driver held flat (the Downside's ticket growth) is typed in its first year, and each later year points at the one before (G26 =F26, filled right), in black because it's a formula, so one edit rolls through. It's the one accepted link to a link (1.6.4).
2.  The selector is the Cover's Case (4.5.1, named): the picker reads the three names from the names list, and the number beside it comes from MATCH.
3.  The live block: F31 =CHOOSE(Case,F12,F18,F24) (Case is a name, so it holds still wherever the formula is filled, and the three block references stay relative so they move with it), then fill right across F31:J31 and down the five drivers: one formula, twenty-five cells, green.
4.  The actual years in the live block read the actuals through the projection flag (5.2.2): =IF(flag=0, actual, CHOOSE(...)), so history never moves with the switch.
5.  Best practice: a driver that has cases is read from the live block by every schedule from 5.3 on, never from a single typed input; a typed input beside a live one is the fault the audit finds first.
6.  The active case lights up on all three blocks with the rule from 4.5.1, and the Cover, IS, CF, BS and DCF titles read the case name through & (2.6.3), so every page says which case it is.
7.  Best practice: a scenario moves several drivers together and tells a story (fewer sites, a softer ticket); a sensitivity moves one at a time (4.5.2). The drivers block is for scenarios, the data tables for sensitivities, and a model a buyer trusts has both. INDEX(F12:F24,…) or OFFSET off the switch do what CHOOSE does here; CHOOSE reads plainest when the cases sit in separate blocks, INDEX when a driver's three cases are stacked (4.5.1), and OFFSET is the old habit the standard avoids (4.1.8).
8.  Does it tie? Switch the Cover to Downside and watch the live block change in FY27–FY31 and hold in FY24–FY26, and the shading move to the third block.

**Done screen, line** **DRAFT** Three cases live on one Inputs page, and one cell on the Cover runs the whole model.

### 5.2.C Challenge: a blank model shell to standard in three minutes

*lesson: challenge-model-shell · 6 goals · three minutes*

**Brief** **DRAFT** Eight sheets in the wrong order, no timeline, no checks. Order and color the tabs, build the timeline with flags, link it everywhere, set the checks sheet with its flag on the Cover.

**Goals (outline)** **DRAFT** Sheet order and colors · Cover with links · timeline and flags · linked to every sheet · A/E divider · checks sheet and flag · historicals pulled from Data by INDEX/MATCH · a drivers block with its live rows reading the Case.

## 5.3 Schedules

*module: schedules*

**Story card, title** **DRAFT** The schedules behind the statements.

**Story card, body** **DRAFT** A statement line like revenue or interest is the last row of a schedule that builds it: sites times washes times ticket; a debt balance that rolls forward and charges interest on its average. Six schedules (revenue, costs, working capital, PP&E, debt, tax), and every one rolls a balance from one year to the next. Build them on Schedules, and the statements in module 5.4 read their last lines.

**Objective (data room)** **DRAFT** Schedules: the revenue build; the cost build; working capital from days to balances; PP&E, capex and the depreciation waterfall; debt and interest with the average-balance circle and a breaker; tax.

**Page name** The schedules

### 5.3.1 The revenue build: sites × washes × days × ticket, plus members × fee

*lesson: revenue-build · 9 goals*

**Brief** **DRAFT** Revenue is built from its drivers, never typed: sites at year end from the rollout, average sites in the year, washes a day per site (a mature site does 250, a new one 200 while it ramps), days, the blended retail ticket growing 2% a year, and that's retail revenue; average members times the fee times twelve is membership revenue. Every driver is an input; every line is a formula; the historical years read the actuals through the projection flag (5.2.2). The key is `=`.

**Goals (outline)** **DRAFT**

1.  Sites at year end as a corkscrew: opening sites, plus new sites (the live drivers block, 5.2.6), less closures (zero), closing; actuals for FY24–FY26 through the flag.
2.  Average sites in the year: the average of opening and closing.
3.  New sites in the year and mature sites; washes a day for each; total washes = (mature × 250 + new × 200) × days.
4.  Retail washes = total × (1 − member share); retail revenue = retail washes × ticket; the ticket grows off the prior year by the live growth driver: share and growth both from the live block, so a case change reaches every line.
5.  Members = member washes ÷ washes per member per month ÷ 12 (Inputs), membership revenue = average members × fee × 12; other revenue as a share of retail.
6.  Total revenue; a check on the Checks sheet: FY26 revenue ties to Chapter 2's P&L (typed actual).
7.  Tip from the desk: washes are units and the model is in thousands of dollars, so the build needs one conversion, and it lives on Inputs as a labeled 1,000: carry washes in thousands from there, the way the Chapter 2 memo line does, and never divide by a 1000 typed inside a formula. Then read FY26 revenue ÷ washes against the $13.89 on the P&L.
8.  Best practice: a driver-based build is what a buyer will change; a revenue line that grows 8% a year is a number nobody can question or believe.
9.  Does it tie? Add two sites to FY28 in the live case's row on Inputs and watch revenue, washes and members move from FY28 on; then switch the case on the Cover and watch every projected year answer.

**Done screen, line** **DRAFT** Revenue is built from sites, washes and tickets now, and a buyer can change any of them.

### 5.3.2 The cost build: per wash, per site, fixed

*lesson: cost-build · 6 goals*

**Brief** **DRAFT** Costs come in three kinds and each is built its own way: per wash (chemicals and water, card fees: a share of revenue or a cost per wash), per site (labor, rent, utilities, maintenance: a cost per site times average sites, growing with inflation) and fixed (head office: a base growing 3% plus a step per new site). Build the three blocks and the site contribution line. The key is `=`.

**Goals (outline)** **DRAFT**

1.  Per wash: cost of sales = revenue × the live cost-of-wash driver (5.2.6); card fees = revenue × 2%.
2.  Per site: labor, rent, utilities, maintenance = cost per site × average sites, the per-site cost inflated 3% a year off the prior year.
3.  Marketing as a share of revenue.
4.  Site costs total; site contribution = revenue − cost of sales − site costs; contribution margin.
5.  Head office: prior year × (1 + 3%) + $50 × new sites; EBITDA.
6.  Does it tie? Change rent per site and watch site costs and EBITDA answer in every projected year and no actual one.

**Done screen, line** **DRAFT** Every cost is built the way it behaves: per wash, per site, or fixed.

### 5.3.3 Working capital: days to balances, deferred membership revenue

*lesson: working-capital-schedule · 8 goals*

**Brief** **DRAFT** Working capital on a balance sheet is a set of balances, but in a model it's a set of days (5.1.2): receivables at three days of revenue, payables at thirty days of cost of sales and site costs, deferred revenue at fifteen days of membership revenue. Balance = the driver ÷ 365 × days. The change in each balance from year to year is what moves cash on the cash flow statement, and remember a rise in a liability is cash in. Build the schedule and the changes. The key is `=`.

**Goals (outline)** **DRAFT**

1.  Historical balances typed from the FY24–FY26 balance sheets, blue; implied days calculated from them, so the projection days can be sanity-checked.
2.  Receivables: revenue ÷ 365 × receivable days (Inputs), through the flag. The days here sit on the closing balance; some models define them on the average balance, and then the closing balance has to be solved as 2 × (revenue ÷ 365 × days) − opening, so say on the schedule which one it is.
3.  Payables on cost of sales plus site costs; deferred revenue on membership revenue.
4.  Net working capital, and the change in each balance year on year.
5.  Cash effect: the change in receivables negative, the changes in payables and deferred revenue positive, labeled for the cash flow statement.
6.  A memo row under the schedule, the cash conversion cycle: receivable days less payable days less deferred-revenue days. Clearcoat's is about −42 (3 − 30 − 15), a rough read, since each count sits on its own base, and the sign is the point: suppliers and members fund the business before it pays for anything, so working capital hands cash back as it grows.
7.  Best practice: implied days from the actuals decide the projection days; a projection day count with no history behind it is a guess.
8.  Does it tie? Raise payable days to 45 and watch the cash effect rise in the first projected year and settle after.

**Done screen, line** **DRAFT** Three day counts became three balances, and their changes are what move cash.

### 5.3.4 PP&E: capex per new site and the depreciation waterfall

*lesson: ppe-and-depreciation · 8 goals*

**Brief** **DRAFT** The tunnels are the balance sheet's biggest line, and they roll: opening PP&E plus capex less depreciation is closing PP&E. Capex is new sites times $2.5m (the building, the tunnel and the equipment, since the land under a new site is rented) plus maintenance capex at 2% of revenue; depreciation is the tunnel wearing out: each year's capex over twenty years, plus the existing base over its remaining life. The waterfall lays each year's capex on its own row and depreciates it across, so the total is a SUM down a column. Build the roll-forward and the waterfall. The key is `=`.

**Goals (outline)** **DRAFT**

1.  Capex: new sites × capex per site + revenue × maintenance capex share. Capex per site is the building, the tunnel and the equipment, the part that's used up over twenty years; land isn't, so the land Clearcoat owns sits in the base at cost, outside the waterfall, and no resale value is assumed at the end.
2.  The existing base: net PP&E at FY26 (typed, blue) depreciating straight-line over its remaining life (Inputs). Check the life before trusting it: FY26's gross depreciable PP&E ÷ FY26 depreciation, land left out, should land near the 20 years on Inputs; a figure far off means the life or the base is wrong.
3.  The waterfall: one row per projected year's capex; each row depreciates its capex ÷ 20 in every year from the year after (an anchored, flag-driven formula filled both ways, 1.6.3).
4.  Total depreciation = SUM down the waterfall plus the base.
5.  The roll-forward: opening, plus capex, less depreciation, closing; closing feeds the next opening.
6.  A memo row under the roll-forward: capex ÷ depreciation, one decimal with an x (2.2.2). It runs well above 1 while the rollout does and heads toward 1 once it ends, and it's the read that says FY31 isn't a steady year for the DCF (5.6.4).
7.  Check: closing PP&E ties to the balance sheet line (goes live in 5.4.3).
8.  Does it tie? Change capex per site and watch capex, depreciation and closing PP&E move in the right years.

**Done screen, line** **DRAFT** The tunnels roll forward, and each year's capex wears out on its own row.

### 5.3.5 Debt and interest: the average-balance circle with a breaker

*lesson: debt-and-interest-circle · 9 goals*

**Brief** **DRAFT** A debt tranche rolls: opening, plus draws, less repayments, closing; interest is the rate on the average of opening and closing. That average makes a circle: interest changes net income, net income changes cash, cash changes the revolver, the revolver changes interest. Excel resolves it with iterative calculation (1.1.4), and a breaker cell, a 1/0 switch that makes interest read the opening balance instead, lets you switch the circle off when it blows up. Build the term loan, the delayed-draw loan and the breaker. The key is `Alt F T`.

**Goals (outline)** **DRAFT**

1.  Term loan: opening $60,000 at FY26, repayments $3,000 a year, closing; average balance; interest at 7% on the average.
2.  Delayed-draw loan: draws of $12,500 in FY27 and FY28, then amortizing 10% a year; the same rows.
3.  The breaker on Inputs: Circ = 1; interest = IF(Circ=1, rate × average, rate × opening). Cash is the other half of the same circle (it would earn interest on its average balance through the same breaker), and Clearcoat's deposit rate is a labeled nil on Inputs, so a reviewer who asks why cash earns nothing finds the answer there.
4.  Confirm iterative calculation is on (Alt, F, T, Formulas); set the circle on and watch it settle.
5.  Blow it up on purpose: type text into an interest cell; every dependent turns #VALUE!; set the breaker to 0, fix the cell, set it back to 1. Read why the breaker exists.
6.  Total debt, total interest; the check: closing debt ties to the balance sheet (live in 5.4.3).
7.  An effective-rate row under each tranche: interest ÷ average balance, actual years and projected. The actual years show what each loan has been costing; the projected years must equal the rate on Inputs (a live difference reading zero while the breaker is at 1), and a gap means a wrong balance link or a rate typed in the wrong units.
8.  Best practice: one breaker for the whole model, on Inputs, labeled; circles only where the accounting demands them.
9.  To see it tie, change the rate and watch interest, net income and, once linked, cash and the revolver settle.

**Done screen, line** **DRAFT** Two tranches roll with interest on the average, and a switch stops the circle when it breaks.

### 5.3.6 Tax

*lesson: tax-schedule · 5 goals*

**Brief** **DRAFT** Tax is the rate on earnings before tax, and only when they're positive, which MAX handles (3.1.2): =MAX(EBT,0) × rate. A loss makes a tax loss the company can use later; the schedule carries it forward as a balance until profits absorb it. Build the simple version with the carry-forward, and read why a downside case pays less tax than the rate suggests. The key is `MAX`.

**Goals (outline)** **DRAFT**

1.  EBT from the income statement (live in 5.4.1; for now a link to the IS line that exists).
2.  Tax before losses: MAX(EBT, 0) × rate.
3.  Loss carry-forward: opening balance, plus this year's loss if EBT < 0, less the amount used against profit, closing.
4.  Tax paid = tax before losses less the loss used × rate; effective rate as a check. The model treats the tax charge as the tax paid; in real accounts the tax rules let a tunnel be written off faster than the books do, which defers part of the bill, and the gap sits on the balance sheet as deferred tax: say on the schedule that the model carries none.
5.  Does it tie? Force a loss in one year with a huge capex and watch the carry-forward build and unwind.

**Done screen, line** **DRAFT** Tax runs at the rate when there's profit, and a loss waits its turn.

### 5.3.C Challenge: the rollout PP&E and working-capital schedules

*lesson: challenge-schedules · 6 goals · five minutes*

**Brief** **DRAFT** A model with inputs and a timeline and no schedules. The revenue build, the cost build's per-site block, working capital from days, the PP&E roll-forward with a waterfall, one debt tranche with the breaker.

**Goals (outline)** **DRAFT** Revenue build · per-site costs · working capital · PP&E roll and waterfall · debt tranche and breaker · checks live.

## 5.4 Linking the statements

*module: linking-the-statements*

**Story card, title** **DRAFT** Link it.

**Story card, body** **DRAFT** The schedules are built; the statements read their last lines. Income statement first, from revenue to net income. Cash flow from net income and the schedules' changes. Balance sheet last, with cash from the cash flow, and if it doesn't balance, there's an order to look, and you'll learn it by breaking it.

**Objective (data room)** **DRAFT** Linking: the income statement from the schedules; the cash flow statement, indirect, from the income statement and the schedules; the balance sheet with cash as the plug that isn't a plug; the cash sweep and the revolver; the order to check when it doesn't balance.

**Page name** The statements, linked

### 5.4.1 The income statement from the schedules

*lesson: is-from-schedules · 7 goals*

**Brief** **DRAFT** Every projected line of the income statement is a link to a schedule (1.6.4): revenue lines from the revenue build, cost of sales and site costs from the cost build, depreciation from PP&E, interest from debt, tax from the tax schedule. The typed, blue actuals live on Data; the statement's historical years are links to it (5.2.5), in the same one-formula row as the projected links, and the flag decides which one a column shows. Link the statement top to bottom, color it, and read net income for FY31. The key is `Ctrl+PgDn`.

**Goals (outline)** **DRAFT**

1.  Revenue lines: =IF(flag=0, the INDEX/MATCH on Data from 5.2.5, Schedules!…), the schedule link pointed across sheets, Ctrl+Enter across the row, so one formula holds history and projection.
2.  Cost of sales, site costs, head office and EBITDA take the same shape.
3.  Depreciation, EBIT, interest, EBT, tax, net income.
4.  Margins in italic (2.1.3); the A/E divider (2.3.2).
5.  Green on the whole row, history and projection alike (1.1.5): the historical cells read Data and the projected cells read Schedules, so both are links, and the only blue is on Data and Inputs.
6.  Tip from the desk: Alt, W, N opens the same file in a second window; Alt, W, A opens Arrange Windows (choose Vertical, tick Windows of active workbook, Enter), and the IS and the schedule it reads sit side by side while you point.
7.  Does it tie? Change the rollout and watch FY31 net income answer.

**Done screen, line** **DRAFT** The income statement reads the schedules, and net income is a formula eight years long.

### 5.4.2 The cash flow statement, indirect

*lesson: cf-indirect · 7 goals*

**Brief** **DRAFT** The cash flow statement (5.1.3) at model scale: net income from the IS; depreciation added back from PP&E; the working-capital changes from 5.3.3 with their signs; capex from PP&E as a negative; debt draws and repayments from 5.3.5; the revolver from 5.4.4 (zero until then). Net change in cash, opening cash from the prior year's closing, closing cash. This is the line the balance sheet will read. The key is `Ctrl+PgDn`.

**Goals (outline)** **DRAFT**

1.  Operations: net income, depreciation, the three working-capital changes, subtotal.
2.  Investing carries capex.
3.  Financing: term-loan repayments, delayed-draw draws and repayments; the revolver line as a link to the revolver rows on the debt schedule, which are still empty and so read zero; and a distributions row (cash paid out to the owners, the dividends of 5.1.3) as a link to Inputs, where it's nil.
4.  Best practice: no typed zeros on the cash flow: a line with nothing in it yet still gets its link, because a typed zero drops the cash the day the balance changes. Test the wiring: type a draw of 1,000 into the empty revolver row on the debt schedule, watch closing cash rise by 1,000, then Ctrl+Z.
5.  Net change; opening cash = prior closing; closing cash.
6.  Sign convention stated once at the top (2.1.2); every projected cell green.
7.  Does it tie? Change capex per site and watch closing cash fall in the rollout years.

**Done screen, line** **DRAFT** It runs from net income to closing cash across eight years, and every line is a link.

### 5.4.3 The balance sheet, and cash as the plug that isn't a plug

*lesson: bs-cash-not-a-plug · 7 goals*

**Brief** **DRAFT** The balance sheet links last: receivables, payables and deferred revenue from working capital; PP&E from its roll; debt from its schedule; equity as opening plus net income less distributions; and cash from the cash flow statement's closing line. Cash looks like a plug, the number that makes it balance, but it isn't, because it was built from every other line; if the sheet balances, every link is right, and if it doesn't, one is wrong. The check on Checks goes live. The key is `Ctrl+PgDn`.

**Goals (outline)** **DRAFT**

1.  Cash = CF closing cash, receivables from working capital and PP&E net from the roll-forward, then total assets.
2.  Payables and deferred revenue from working capital, each debt tranche's closing from the debt schedule, the revolver's closing linked to its rows there, still empty so it reads zero with no typed number, then total liabilities.
3.  Equity: opening = prior closing, plus net income, less distributions, the same Inputs row the cash flow's financing reads (nil here; where owners take cash out, it's forecast as a share of net income), closing, total liabilities and equity.
4.  The balance check on Checks goes live; read it: zero in every year, or not.
5.  If not: the order to check is 5.4.5; for now, find the sign on one working-capital change and fix it.
6.  Best practice: never force the balance with a plug line; a model that balances by construction is the only kind a buyer will run.
7.  Does it tie? Change any input and watch the check stay at zero across eight years.

**Done screen, line** **DRAFT** It balances, and it balances because every line was built, not forced.

### 5.4.4 The cash sweep and the revolver

*lesson: cash-sweep-revolver · 7 goals*

**Brief** **DRAFT** A model can't let cash go negative, and it shouldn't let it pile up. The revolver draws when cash would fall below the minimum and repays when there's surplus: draw = MAX(minimum − cash before revolver, 0), repayment = MIN(surplus, revolver balance), so it's MIN and MAX again (3.1.2), never an IF tower. Cash available for the sweep is cash after everything else; the revolver is the last line of financing and the first thing a buyer looks at. Build it, and see the circle from 5.3.5 close. The key is `MAX`.

**Goals (outline)** **DRAFT**

1.  On the debt schedule, the revolver block: opening, cash available before revolver (from CF, excluding the revolver line), minimum cash (Inputs).
2.  Draw = MAX(min cash − cash available, 0); repayment = MIN(MAX(cash available − min cash, 0), opening balance).
3.  Closing revolver; interest on the average, through the breaker.
4.  Link the revolver's draw less repayment to the CF financing line and its closing to the BS.
5.  Watch the circle settle: interest → net income → cash → revolver → interest.
6.  Force a cash shortfall (huge capex in FY28) and watch the revolver draw, then repay in later years.
7.  Does it tie? The balance check holds through the shortfall.

**Done screen, line** **DRAFT** Cash never goes below the minimum, and the revolver is the line that proves it.

### 5.4.5 When it doesn't balance: the order to check

*lesson: when-it-doesnt-balance · 8 goals*

**Brief** **DRAFT** A balance sheet that's off is off for one of a short list of reasons, and a reviewer checks them in order: cash on the BS isn't the CF's closing; a working-capital change has the wrong sign; depreciation is on the IS but not added back; capex is on the CF but not in PP&E; a debt draw is on the CF but not on the BS; net income isn't flowing to equity; the opening balances don't tie. The difference is often a clue: exactly one line's value, or twice a working-capital change. Break the model six ways and find each one. The key is `Ctrl+[`.

**Goals (outline)** **DRAFT**

1.  Six breaks are planted on a copy of the model; the check reads a number in each year. Read the differences: one is exactly FY27's depreciation.
2.  Check 1 is the cash tie and Check 2 is the signs on working-capital changes, then find the depreciation break and fix it.
3.  Check 3 is capex in both places and Check 4 is debt in both, following each with Ctrl+[ (1.6.6).
4.  Check 5 is net income to equity and Check 6 is the opening balances.
5.  When the ordered checks run out, tick it off: add a mark column beside the BS and the CF, go down the balance sheet from the line after cash, find each line's year-on-year change on the cash flow with the right sign, and mark both, cash last. The line left unmarked is the break, and it's the one way to find a movement counted twice (depreciation added back and also netted into the PP&E change), which no sign check sees.
6.  Each fix moves the check toward zero; the last one lands it.
7.  Best practice: read the size of the difference before you look anywhere else, because it usually names the line.
8.  Does it tie? Zero across eight years, and the Cover flag reads OK.

**Done screen, line** **DRAFT** You found six breaks in order, and the difference told you where each one was.

### 5.4.C Challenge: schedules linked into balanced statements

*lesson: challenge-linked-statements · 6 goals · five minutes*

**Brief** **DRAFT** Schedules done, statements empty. Link the IS, the CF and the BS, wire the revolver, and get the check to zero in every year.

**Goals (outline)** **DRAFT** IS linked · CF linked · BS linked with cash from CF · revolver · balance check zero · flag OK.

## 5.5 Auditing a model

*module: auditing-a-model*

**Story card, title** **DRAFT** Audit it before they do.

**Story card, body** **DRAFT** Three buyers' analysts are about to open this model looking for the mistake that lets them pay less, so find it first. A model gets audited the way a databook does (3.6), and then for the things only a model can get wrong: a row that doesn't cross-foot, a formula that breaks pattern halfway across, an input that survives a stress test by luck.

**Objective (data room)** **DRAFT** Auditing a model: tie-outs and cross-foots; error flags and the checks summary; the model-wide sweep for hardcodes and pattern breaks; stress tests.

**Page name** The model, audited

### 5.5.1 Tie-outs and cross-foots

*lesson: tie-outs-cross-foots · 7 goals*

**Brief** **DRAFT** A tie-out proves a figure in two places is the same figure: the revenue on the IS ties to the revenue build; FY26 EBITDA ties to Chapter 2's P&L; closing PP&E ties to the BS. A cross-foot proves a block adds both ways: the sum down the site-cost lines equals the sum across the years' totals. Both are live differences on the Checks sheet (5.2.4), and this lesson fills the six rows left pending there. The key is `=`.

**Goals (outline)** **DRAFT**

1.  Revenue tie: IS revenue less the build's total, each year.
2.  EBITDA tie to the Chapter 2 P&L actuals (typed, blue, sourced).
3.  PP&E tie; debt tie; equity roll tie (opening plus net income less distributions equals closing).
4.  A cross-foot on the cost build: SUM down less SUM across, one cell.
5.  Two limit checks beside the ties: a count of closing balances below zero on the debt tranches and the revolver, =COUNTIF(range,"<0"), and the same on closing PP&E: each reads 0 and folds into the flag. A tie-out can't see a balance that has gone through zero; this can, and it's 1.7.2's plausibility check at model scale.
6.  All eight ties and both limit checks live; the flag on the Cover reads OK.
7.  Does it tie? Break one link on purpose and read which check names it; Ctrl+Z.

**Done screen, line** **DRAFT** Eight checks live, and each one names the line it guards.

### 5.5.2 Error flags and the checks summary

*lesson: error-flags-checks-summary · 7 goals*

**Brief** **DRAFT** A check that reads zero can't tell you about a #REF! three sheets away, because an error doesn't net to zero. It spreads into every cell that reads it, and the check turns into an error that tells you nothing about where it started. ISERROR wrapped around a whole sheet's block (=SUMPRODUCT(--ISERROR(range))) counts the errors on it, and Excel's own Error Checking (Alt, M, K) walks you to each one. Add an error count per sheet to Checks, fold it into the flag, and run Error Checking once on a planted fault. The key is `ISERROR`.

**Goals (outline)** **DRAFT**

1.  On Checks, an errors block: one row per sheet, =SUMPRODUCT(--ISERROR(IS!C5:J60)) and so on.
2.  Fold the error count into the roll-up flag: OK only when checks are zero and errors are zero.
3.  A planted #REF! on Schedules: the count reads 1; the Cover flag reads CHECK.
4.  Error Checking works on one sheet at a time, so go to the sheet the count names, Schedules, and then Alt, M, K walks to the #REF!; fix it by pointing (3.6.1).
5.  Add the balance check and the flag to the Watch Window (Alt, M, W), and they stay on screen whatever sheet you're on, a reviewer's dashboard while you edit.
6.  Best practice: the flag on the Cover is the first cell a reviewer reads and the last one you read before sending.
7.  Does it tie? Plant a #DIV/0! and watch the count catch it too.

**Done screen, line** **DRAFT** The flag now sees errors as well as differences, and one cell says the model is clean.

### 5.5.3 The model-wide sweep: hardcodes and pattern breaks

*lesson: model-wide-sweep · 8 goals*

**Brief** **DRAFT** Two faults hide in a projected block: a typed number where a formula belongs (the hunt from 1.7.3 and 3.6.3, now run sheet by sheet), and a formula that breaks pattern halfway across a row (FY29 written differently from FY28). Go To Special has a tool for the second: Row Differences selects every cell in a row whose formula doesn't match the active cell's. Sweep the model with both, then a hardcode count per sheet on Checks. The key is `Alt H F D S`.

**Goals (outline)** **DRAFT**

1.  On IS, select the projected block and Go To Special, Constants, Numbers: two typed cells light up. Point them at their schedules.
2.  Select a row across FY27:FY31, Go To Special, Row Differences lights FY29 (it lost an anchor), so refill from FY27 with Ctrl+R (5.2.3).
3.  Column Differences down a block, the same way.
4.  Tip from the desk: where one cell in a row has to differ on purpose (the first projected opening balance, which reads Inputs), put a border around it (2.3.3) and say why in the next cell. Then Row Differences lighting it is a known exception, and nobody flattens it with a fill right.
5.  Repeat on CF, BS and Schedules; each sheet takes a minute.
6.  The circle hunt: with iteration on, Excel stops warning about circular references, so an accidental one hides. Set the breaker to 0, switch iteration off (Alt, F, T, Formulas) and press F9: no warning, and no Circular References in the status bar, means the only circle was the one you built, so switch both back. Then F2 any SUM written among blank rows and check its range stops short of its own cell.
7.  A hardcode count on Checks: =SUMPRODUCT(ISNUMBER(range)*(1-ISFORMULA(range))) on each projected block, reading 0. It counts typed numbers directly; the number count less the formula count would net, and one formula returning a dash (5.5.4) would hide one typed number.
8.  Does it tie? Type a number into a projected cell and watch the hardcode count catch it.

**Done screen, line** **DRAFT** Every projected cell is a formula, and every row is one formula across.

### 5.5.4 Stress tests: zero, negative, huge

*lesson: stress-tests · 6 goals*

**Brief** **DRAFT** A model that balances at the base case can still break: set the ticket to zero and a margin divides by nothing; set new sites to a hundred and the revolver runs to a billion; make a cost negative and tax goes the wrong way. A stress test types each input to an extreme, reads what breaks, and fixes the formula that should have handled it (MAX, IFERROR, a cap). Run the three on Inputs and put the base case back with Ctrl+Z. The key is `Ctrl+Z`.

**Goals (outline)** **DRAFT**

1.  Ticket to 0 and the margins error, so wrap the ratios in IFERROR (3.1.4) with a dash, then Ctrl+Z the input.
2.  New sites to 100 and the revolver explodes but balances, so read where the minimum cash holds, then Ctrl+Z.
3.  Cost per wash negative: tax on a loss. Check the MAX in the tax schedule holds; Ctrl+Z.
4.  Member share to 100% and to 0%: retail and membership revenue swap; the build survives.
5.  Best practice: three stress tests before sending, every time; a buyer's analyst will run them in the first ten minutes.
6.  Does it tie? Base case restored, the flag reads OK, the checks read zero.

**Done screen, line** **DRAFT** The model held at three extremes, or you fixed the formula that didn't.

### 5.5.C Challenge: eight planted faults

*lesson: challenge-eight-faults · 6 goals · five minutes*

**Brief** **DRAFT** A linked model with eight faults: two typed numbers, a pattern break, a sign error, a missing add-back, a #REF!, a check that isn't a formula, a plug on the balance sheet. Find and fix them; the flag reads OK.

**Goals (outline)** **DRAFT** Hardcodes · row differences · the sign · the add-back · the #REF! · the dead check · the plug removed · flag OK.

## 5.6 DCF

*module: dcf*

**Story card, title** **DRAFT** What the cash flows are worth.

**Story card, body** **DRAFT** The model says what the business will earn; the DCF says what that's worth today. Take the cash the business throws off after tax, capex and working capital (before anyone is paid interest), discount it at the return its investors require, add what it's worth beyond the forecast, and you have an enterprise value. Take off the debt and what's left is what the owners are selling.

**Objective (data room)** **DRAFT** The DCF: what it is and what the statements feed it; unlevered free cash flow; the WACC block; terminal value by perpetuity and by exit multiple; discounting and the mid-year convention; sensitivity tables.

**Page name** The DCF page

### 5.6.1 What a DCF is, and what the statements feed it

*lesson: what-a-dcf-is · 6 goals*

**Brief** **DRAFT** A discounted cash flow values a business as the cash it will generate, discounted to today: the NPV from 3.5.2 applied to the whole company instead of one site. It needs three things from the model: the cash flows (from EBITDA, tax, capex and working capital), a discount rate (the return the company's investors require, blended between debt and equity) and a terminal value (what the business is worth after the forecast ends). Lay the DCF page out with links to each, empty, so the next five lessons fill it. The key is `Ctrl+PgDn`.

**Goals (outline)** **DRAFT**

1.  On DCF, the timeline linked from Inputs (5.2.2), projected years only. Above it, the valuation date (12/31/2026, the FY26 year-end the net debt is taken at), typed once with the DCF inputs and linked here, so every discount period counts from a stated date. A date inside a year would need a stub: the unelapsed fraction of year one (YEARFRAC, 3.2.4), discounted over that fraction.
2.  The free-cash-flow block's labels: EBITDA, less tax on EBIT, less capex, less change in working capital, unlevered free cash flow.
3.  The discounting block's labels: discount factor, present value; the terminal value block; enterprise value to equity value. The picture for that last step is a house: what the house is worth is enterprise value, the mortgage on it is net debt, and the owner's stake is equity. A house is priced off what the neighbors' sold for (Chapter 6) or off the rent it would earn (this page).
4.  EBITDA linked from the IS; capex and working-capital change from the schedules.
5.  Best practice: the DCF reads the model; a DCF with its own typed cash flows is a calculator, not a valuation.
6.  Does it tie? Change the rollout and watch the linked lines on DCF move.

**Done screen, line** **DRAFT** The page is laid out, and every input it needs already lives in the model.

### 5.6.2 Unlevered free cash flow

*lesson: unlevered-free-cash-flow · 6 goals*

**Brief** **DRAFT** Think of unlevered free cash flow as the cash the washes generate before anybody gets paid, not the lenders and not the owners. Start with EBIT, take off the tax you'd owe on it as if there were no debt, add depreciation back (that cash never left the account), then take off capex and the cash tied up in working capital. We call it unlevered because it ignores how the business is financed, so we can value the operations first and deal with the debt when we get to equity value. Build it from the linked lines, and watch what a rollout year does to it. The key is `=`.

**Goals (outline)** **DRAFT**

1.  EBIT from the IS, then tax on EBIT at the rate, not the IS tax, which already reflects interest.
2.  NOPAT (EBIT less tax on EBIT); plus depreciation.
3.  Less capex; less the change in net working capital (5.3.3).
4.  Unlevered free cash flow; a memo line: FCF as a share of EBITDA.
5.  Best practice: tax here is on EBIT, and interest is nowhere on this page; if either slips in, the value double-counts the debt. The matching rule: unlevered cash flow goes with WACC, the blended discount rate of the next lesson, and gives enterprise value; cash flow after interest and repayments goes with the cost of equity, the return the owners alone require, and gives equity value. This page uses the first pair, and mixing the two is the classic error.
6.  Does it tie? Halve the rollout and watch FCF rise in the years capex fell.

**Done screen, line** **DRAFT** This is the cash the business throws off for whoever owns it, before the debt is paid.

### 5.6.3 The WACC block

*lesson: wacc-block · 7 goals*

**Brief** **DRAFT** The discount rate is the weighted average cost of capital: the return equity investors require, blended with the after-tax cost of debt, weighted by how much of the company each funds. Cost of equity comes from a risk-free rate plus a beta times the market premium; cost of debt is what the company could borrow at today (taken here as the loan's 7%, not whatever an old loan happens to carry) less the tax shield; the weights come from a target capital structure, not today's balance sheet. Build the block from inputs and read what a car wash's WACC is. The key is `=`.

**Goals (outline)** **DRAFT**

1.  Inputs, blue, sourced: risk-free rate 4.0%, equity risk premium 6.0%, beta 1.2, size premium 2.0%, cost of debt 7.0%, tax 25%, target debt weight 40%. Clearcoat is private and has no beta of its own: the 1.2 stands for the listed operators' betas, each with its own leverage taken out, averaged, and put back at the 40% target, and the source note beside it says so.
2.  Cost of equity = risk-free + beta × premium + the size premium (the extra return investors ask of a company as small as Clearcoat, riskier than the large listed operators its beta came from), added after beta × premium, never inside it.
3.  After-tax cost of debt = cost of debt × (1 − tax).
4.  WACC = equity weight × cost of equity + debt weight × after-tax cost of debt; read it: about 10%.
5.  Name the WACC cell (4.6.1).
6.  Best practice: every WACC input carries a source in the next cell (1.3.1); it's the number a buyer argues with first.
7.  Does it tie? Change beta and watch WACC move.

**Done screen, line** **DRAFT** Seven sourced inputs built the return the company's investors require.

### 5.6.4 Terminal value: perpetuity and exit multiple

*lesson: terminal-value · 8 goals*

**Brief** **DRAFT** The forecast stops at FY31 and the business doesn't, so the terminal value stands for everything after. Two ways: the perpetuity method grows the last year's cash flow, normalized for the rollout, at a steady rate forever: FCF × (1 + g) ÷ (WACC − g); the exit multiple method sells the business in FY31 at a multiple of EBITDA, the way a sponsor will. Build both, and read the implied multiple of one and the implied growth of the other, so each checks the other. The key is `=`.

**Goals (outline)** **DRAFT**

1.  A normalized FY31, in a column beside the forecast. FY31 is still a rollout year, so the raw figure would charge six new sites' capex forever: take the new-site capex out, set capex near depreciation (the memo row in 5.3.4) and hold the working-capital change at its steady level. The raw FY31 stays in the forecast.
2.  Perpetuity: normalized FY31 FCF × (1 + g) ÷ (WACC − g), g from Inputs (3%). Growth is 3% because it can't run above the economy's long-run growth, and it has to sit below WACC or the formula breaks.
3.  Exit multiple: FY31 EBITDA × the exit multiple (11.0x). The 11.0x is sourced to the listed operators' multiples (a standalone view) or to the precedent deals (a sale), and it's revisited once 6.1 and 6.2 are built.
4.  Implied multiple of the perpetuity value; implied growth of the exit value (solve the perpetuity formula for g).
5.  A round-trip check on Checks: feed the perpetuity value's implied multiple into the exit method, solve that value for growth, and the growth input must come back, a live difference reading zero. If it doesn't, the two terminal values aren't built on the same cash flow or discounted the same way.
6.  A switch on Inputs picks which terminal value the page uses (CHOOSE, 4.5.1).
7.  Best practice: when the two methods disagree by more than a third, one of the inputs is wrong, not the method.
8.  Does it tie? Change the exit multiple and watch the implied growth move.

**Done screen, line** **DRAFT** You have two terminal values, and each says whether the other is reasonable.

### 5.6.5 Discounting and the mid-year convention

*lesson: discounting-mid-year · 9 goals*

**Brief** **DRAFT** A discount factor is 1 ÷ (1 + WACC)^t, and the question is what t is: cash arrives through the year, not on December 31, so the mid-year convention discounts year 1 at t = 0.5, year 2 at 1.5, and so on; an exit-multiple terminal value is a sale at the end of the last year, while a perpetuity's cash flows keep arriving mid-year. Present values, summed, plus the discounted terminal value, is enterprise value; less net debt is equity value. Build it both ways and read the difference the convention makes. The key is `^`.

**Goals (outline)** **DRAFT**

1.  Period t: end-year counter 1 to 5; mid-year counter 0.5 to 4.5, driven by a switch on Inputs.
2.  Discount factor = 1 ÷ (1 + WACC)^t, filled right (1.6.3).
3.  Present value of each FCF; their sum.
4.  Terminal value, discounted by method: the exit-multiple value is a sale at the end of FY31, so it takes the end-year factor (t = 5) whatever the switch says; the perpetuity value's cash flows keep arriving mid-year, so with the switch on it takes the mid-year factor of year 5 (t = 4.5).
5.  Enterprise value = sum of PVs + PV of terminal, built once per terminal method on two rows; the terminal switch (5.6.4) picks which one goes on; net debt from the FY26 balance sheet; equity value.
6.  Two memo cells under enterprise value: the discounted terminal value as a share of EV, and the forecast years as the rest, the two summing to 100%. How much of the answer rests on one assumption is the first thing a reviewer says about any DCF.
7.  An NPV cross-check (3.5.2) on the end-year case: equal.
8.  An implied-multiples memo under enterprise value: EV ÷ FY26E EBITDA and EV ÷ FY27 EBITDA, one formula filled right with the EV reference anchored (F4, 1.6.3), one decimal with an x (2.2.2). The FY27 multiple should be the lower while EBITDA grows (if it isn't, a link points at the wrong year), and both get read against the comps range in 6.1.5 and the bids.
9.  Does it tie? Switch mid-year on and watch enterprise value rise by a few percent.

**Done screen, line** **DRAFT** Enterprise value comes from five discounted years and a terminal, and the convention moves it a few percent.

### 5.6.6 Sensitivity tables: WACC × growth, exit multiple

*lesson: dcf-sensitivity · 6 goals*

**Brief** **DRAFT** No one believes a single DCF number, so the page ends on two tables (4.5.3): enterprise value at five WACCs against five growth rates, and at five WACCs against five exit multiples. Each corner cell reads the enterprise value built on its own terminal method, so neither table goes flat; the inputs are named cells on Inputs, reached through pass-through drivers (4.5.5); the base case is bordered. Build both, format them the way the book prints them, and read the range a buyer will negotiate inside. The key is `Alt A W T`.

**Goals (outline)** **DRAFT**

1.  Pass-through drivers on DCF for WACC and growth (4.5.5).
2.  The WACC × growth table: WACC down, growth across, corner = enterprise value. Step both by about half a point, so the corner-to-corner range is tight enough to put in front of a buyer. The corner here is the enterprise value built on the perpetuity terminal value: the page carries one enterprise value per method (5.6.5), so each table reads its own.
3.  The WACC × exit-multiple table, the same way, with a third pass-through driver for the multiple and corner = the enterprise value built on the exit multiple. Each table reads its own value, so the terminal switch (5.6.4) no longer leaves one of them flat; it only picks which value goes on to equity value and the football field.
4.  Base-case cell bordered (2.3.3); the tables formatted in millions with one decimal (2.2.2).
5.  Calculation set to automatic except data tables (4.5.3); F9.
6.  Does it tie? Change the rollout, F9, and watch both tables shift together.

**Done screen, line** **DRAFT** Two tables show the range inside which the whole negotiation will happen.

### 5.6.C Challenge: a DCF from a given free-cash-flow line

*lesson: challenge-dcf · 6 goals · five minutes*

**Brief** **DRAFT** Five years of free cash flow, given. The WACC block, both terminal values, mid-year discounting, enterprise to equity value, one sensitivity table.

**Goals (outline)** **DRAFT** WACC · perpetuity TV · exit TV · mid-year factors · EV and equity · one table.

## 5.7 Model speed

*module: model-speed*

**Story card, title** **DRAFT** Now do it fast.

**Story card, body** **DRAFT** Everything in this chapter you can now do; the question a desk asks is how fast. Three benchmark drills, each a piece of the model against the clock: the revenue build in three minutes, a block filled and formatted in one pass, the statements linked without touching the mouse. They live in Practice as this chapter's benchmarks, and here you run each once with the keys shown.

**Objective (data room)** **DRAFT** Model speed: the revenue build in three minutes; fill and format a block in one pass; keyboard-only statement linking.

**Page name** The benchmarks

### 5.7.1 The revenue build in three minutes

*lesson: revenue-build-in-three · 6 goals*

**Brief** **DRAFT** The revenue build from 5.3.1, from blank labels to a total that ties, in three minutes: sites, average sites, washes, retail and membership revenue, total, with each row one formula filled right (5.2.3), anchors set with F4 as you type (1.6.3), the check going green at the end. The keys are shown this once; in Practice they aren't. The key is `F4`.

**Goals (outline)** **DRAFT**

1.  Sites at year end, flag-driven, filled right.
2.  Average sites, then total washes.
3.  Retail revenue with the growing ticket; membership revenue.
4.  Total revenue with AutoSum across the block.
5.  The desk number format on each block: Ctrl+1 once with the four-section code from 2.2.1, then F4 on the next block.
6.  Does it tie? The revenue check on Checks reads zero.

**Done screen, line** **DRAFT** You built revenue in three minutes, and the check went green as you finished.

### 5.7.2 Fill and format a block in one pass

*lesson: fill-and-format-a-block · 5 goals*

**Brief** **DRAFT** A forty-row schedule block with the first column written: select the block from its top-left, Ctrl+R in one motion, then the desk number format, the total row's top border and the italic on the ratio lines, each as a whole-block action with F4 repeating where it can. One pass, no cell touched twice. The key is `Ctrl+R`.

**Goals (outline)** **DRAFT**

1.  Select the block from its first formula column to FY31; Ctrl+R.
2.  The desk number format (1.5.1) on the whole block: one trip through Ctrl+1.
3.  Top borders on the three total rows with F4.
4.  Italic on the ratio rows; percent format.
5.  Does it tie? A cross-foot on the block reads zero.

**Done screen, line** **DRAFT** You filled and formatted forty rows without touching a cell twice.

### 5.7.3 Keyboard-only statement linking

*lesson: keyboard-only-linking · 5 goals*

**Brief** **DRAFT** The cash flow statement linked from the IS and the schedules with the mouse never touched: = then the sheet key (with the browser alias, 1.6.4), arrows to the line, Ctrl+Enter across the row, green, next row. Twelve lines, and the balance check at the end says whether you pointed at the right ones. The key is `Ctrl+PgDn`.

**Goals (outline)** **DRAFT**

1.  Net income, depreciation, the three working-capital changes: five cross-sheet links, each as a Ctrl+Enter row.
2.  Capex; debt draws and repayments; the revolver.
3.  Net change, then opening, then closing.
4.  Green on every link with F4 repeating the color.
5.  Does it tie? The cash tie on Checks reads zero.

**Done screen, line** **DRAFT** You linked twelve lines by keyboard alone, and the check reads zero.

### 5.7.C Challenge: the chapter's benchmark drills

*lesson: challenge-model-speed · 3 runs*

**Brief** **DRAFT** The three benchmarks, one after another, on the clock. Pass · Expert · Legendary on each.

## 5.8 Project and assessment

*module: ch5-project-and-assessment*

**Story card, title** **DRAFT** The operating model, end to end.

**Story card, body** **DRAFT** Fresh inputs, an empty shell, three historical years typed and sourced. Build the schedules, link the statements, get the flag to OK, value it. Build it, then build one schedule and its links again on the clock. The assessment is the test-out.

**Objective (data room)** **DRAFT** The operating model with its DCF page; the assessment is one schedule and the links from it, timed.

**Page name** The operating model

### 5.P Project: the operating model with its DCF page

*lesson: ch5-project · about 18 goals · no clock*

**Outline** **DRAFT** Sheet order and Cover · timeline with flags · checks sheet · revenue build · cost build · working capital · PP&E and waterfall · debt with the breaker · tax · IS linked · CF linked · BS linked · revolver · checks live and flag OK · error and hardcode counts · stress tests · FCF, WACC, terminal, discounting · two sensitivity tables · Does it tie?

### 5.A Assessment: one schedule and the links from it, fifteen minutes

*lesson: ch5-assessment · about 14 goals · fifteen minutes · hard clock, no help, keyboard only*

**Outline** **DRAFT** A model with everything built except the debt schedule and its links: build the two tranches and the revolver with the breaker, link interest to the IS, draws and repayments to the CF, closing balances to the BS, and get the balance check to zero in every year. Pass is Verified; this is also the test-out.

## Keys and functions this chapter teaches

The accounting itself (5.1) and the five links between the statements; INDEX/MATCH on label and year to populate a statement from a data tab (4.1.4, used) and SUMIFS as the duplicate-safe alternative; the drivers block: three cases by year, CHOOSE off the named Case (a name needs no anchor), the live block through the projection flag, the case name in every title (4.5.1, 2.6.3, used); COLUMNS(range) as a counter with no typed offset; the corkscrew pattern; ROUND on checks; Alt W N and Alt W A (a second window); Alt M W (Watch Window); Alt H O M and tab colors (1.1.1, used); EOMONTH timelines with flags and counters; MAX and MIN for the sweep, the revolver and tax; iterative calculation and the breaker (1.1.4, Alt F T); ISERROR, ISFORMULA, SUMPRODUCT(--…) counts; Alt M K Error Checking; Go To Special Row Differences and Column Differences; ^ for discount factors; CHOOSE for the terminal switch (4.5.1); data tables (4.5.3) with pass-through drivers (4.5.5); named cells (4.6.1); Ctrl+PgDn pointing across sheets at model scale.

## Engine needs

Iterative calculation honoring the breaker and settling a real circle; a named Case cell on the Cover read by CHOOSE and by conditional-formatting rules on other sheets; ISFORMULA; Go To Special Row Differences and Column Differences; Error Checking (Alt M K) walking to errors; eight-sheet workbooks with cross-sheet Ctrl+Enter rows; data tables reading named inputs through pass-through cells; the Cover's hyperlinks and names list; a planted-faults copy of the model for 5.4.5 and 5.5.C.

## Open for Wolf's bucketing pass

  - 5.1 is seven lessons of accounting on one site before any model building; Wolf asked for this depth (Round 4, and again 2026-09-28: what the statements mean, how they work and flow together). Confirm.
  - 5.2.6 lays the cases out as three blocks (case-major) and reads them with CHOOSE; the stacked layout (three rows per driver, read with INDEX) is the other desk convention. Default: blocks and CHOOSE, because the cases read as three stories. Confirm.
  - 5.3.6 tax with a loss carry-forward may be more than the course needs; the simple MAX version is one goal.
  - 5.7 is three short lessons that double as Practice benchmarks; keep as lessons with keys shown once, or make them drills only.
  - The DCF's WACC inputs (beta 1.2, ERP 6%) are illustrative; Wolf may want to source them to a public figure or keep them fictional with a "per management" note.
  - Figures across Chapters 2, 4 and 5 are set to tie (FY26 revenue $50m, EBITDA $16.6m, 40 sites); the build session keeps them tied when it fixes the workbooks.
  - Source pass (2026-09-30): the fold-back plan in claude/source-checklist.md (section H) is applied to this chapter as DRAFT: 73 edits, plus fifteen held items pulled back on Wolf's depth call (G090, G102, G106, G100, G107, G060, G062, G080, G083, G085, G164, G132, G120, G124, and G134 as its own goal in 5.6.4). Wolf's calls of that day are in the decision log (screenplay 11); what was held back stays listed in the checklist's section B.
  - Case numbers (Wolf, 2026-09-30): Clearcoat's own capex is $2,500k a site (building, tunnel, equipment) on rented land, and the $5m stays as the all-in cost of a site. Written into the brief, Inputs, 5.1.1, 5.1.4, 5.1.6, 5.1.7 and 5.3.4 as DRAFT. A build session confirms it on a real rebuild (Base-case free cash flow about zero in FY27 rising to about $9m in FY31) before 5.4.4, 5.6.4, 6.3.2 and 6.3.5 go to goal level.
  - Two arithmetic slips fixed in passing: the site's share of loan amortization is $75k a year (5.1.3), and the week's loan payment is $3,460, $2,020 of it interest (5.1.6).

## Built differently

### 5.1 and 5.2 (r5-lessons-a)
- The One week page is in the file from 5.1.1, so 5.1.5 builds nothing.
- 5.1.1: the washes are a typed input and the formats arrive planted. The learner adds only the double borders under EBITDA and net income.
- 5.1.2: the closing clears August's payable instead of setting payable days to zero, because the model has no payable-days input.
- Opening equity is the workbook's formula, not a typed blue figure.
- The best-practice goals became teach lines throughout.
- 5.1.C: most lines arrive planted and the learner writes 14 key cells, so it fits in 180 seconds.
- 5.2.1: there are no tab colors, because states do not keep them. The learner types the title, the case number, the flag and two links; the rest of the Cover arrives planted.
- 5.2.2: there is no divider goal, and the insert-a-column proof is a teach line.
- 5.2.3: F4 repeats the labor row's format onto the other five rows. The closing changes a Data figure, because the forecast years read zero until 5.3.
- 5.2.4: the red rule and the flag arrive planted. The learner writes two checks, marks six as pending and writes the roll-up.
- 5.2.5: the learner writes the helpers, three lookups and a SUMIFS for rent; the rest arrives planted. There is no re-sort goal.
- 5.2.6: the case blocks sit at rows 14, 21 and 28. The learner writes the flat Downside driver, the live rows and the titles.
- 5.2.C: there are no tab colors, divider or drivers block.

### 5.3 and 5.4 (r5-lessons-b)
- Each lesson's key is =, not the script's Alt F T, Ctrl+PgDn, MAX or Ctrl+[.
- 5.3.1: the units tip sits in the washes goal's teach line. The revenue check compares the income statement with the build.
- 5.3.2: the per-site cost block came with 5.2.3, so it is not built again.
- 5.3.3: the actual balances read Data through the flag.
- 5.3.5: there is no Alt F T confirm and no blow-it-up goal. The closing shows the breaker.
- 5.3.6: the projected rows are graded on what they reference. The closing types a loss over EBT, because the income statement is not linked yet.
- 5.4.1: colors, italics and the A/E divider are planted. The Alt W N tip is in a teach line.
- 5.4.2: the closing tests the revolver wiring. The capex closing is dropped.
- 5.4.4: the cash flow and balance sheet links were already made in 5.4.2 and 5.4.3.
- 5.4.5: the six breaks are planted, each in its cell's own format.
- 5.3.C and 5.4.C blank only the projected years, so each fits in 3 minutes.

### 5.5 and 5.6 (r5-lessons-c)
- 5.5.1 fills three check rows and two limit checks, and finds the flag with Go To.
- 5.5.2 watches the Cover's flag and its sum of differences.
- 5.5.3 has no Column differences, no border tip and no circle hunt.
- 5.5.4 stresses washes to zero rather than the ticket, plus four undo stresses.
- 5.5.C has 6 goals in 180 seconds, not five minutes.
- 5.6.2: EBIT is EBITDA less depreciation from Schedules.
- 5.6.5: the closing turns mid-year off and says the forecast present values fall about 5%. With the exit method on, enterprise value hardly moves, so the script's "rises a few percent" does not hold here.
- 5.6.6: the base case is bold, not boxed, and the edges are planted.
- 5.6.C opens with EBITDA, the periods, the WACC inputs, the drivers and the table edges given, so it fits 180 seconds.

### 5.7, project and assessment (r5-lessons-d)
- 5.7.1: total revenue is typed as =C22+C24+C25 rather than AutoSum, because the member count row sits inside the block.
- 5.7.2 uses two fills and three formats, each repeated with F4.
- 5.7.3: the references are typed into each row with Ctrl+Enter, not pointed at with Ctrl+PgDn.
- 5.7.C is one seeded run that cuts a piece of each benchmark, not three separate runs.
- 5.P has 15 goals, not about 18. Inputs, Data, the timeline and the Cover map arrive built, and there is no stress-test goal.
- 5.A has 10 goals, not about 14.
- Drills: ch5-balance-it has one planted break, not five seeds. ch5-checks covers the balance, cash and debt checks, since the model has no sources and uses table. ch5-sweep stresses 18 new sites in FY28.
- The 10 Wave 1 Chapter 5 drill sketches are not built.

### Integration (r5-int)
- 5.6.6 builds each sensitivity grid as one formula with mixed anchors over the block, not as a Data Table, and has no calculation-mode goal. A Data Table only moves an input on its own sheet, and the model reads WACC through its name and growth and the multiple from Inputs, so real tables need the pass-through drivers wired into the discounting and terminal values from 5.6.3 on.
- 5.P's shell keeps the Watch Window's two rows on the Cover; they read blank until the project links the flag.
