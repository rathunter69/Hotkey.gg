# CURRICULUM V5.1 — the whole of desk Excel, drill by drill (conceptual)

_2026-09-04 · a concept document, no code; generated from `dev/gen/curriculum_v51_data.py` (edit that, not this).
Rewritten to the seven rules in `dev/DRILLS_WOLF_LIKED.md`: full 20×10 page with one story · three steps of three
to four outcomes, 60–150 s for a skilled player · rebuild not retype · un-maxable randomness · loud cues, desk
language · the ☆ is a choice · variety inside the drill. The eight chapters are kept; the drills inside them are
the rethink. Charts excluded. `engine:` marks what the site cannot grade yet (see `dev/ENGINE_GAP_MATRIX.md`)._

**61 drills · 8 chapters · 8 capstones · free = chapters 1–4 · PRO = chapters 5–8**

## Chapter 1 · Foundations (FREE) — 8 drills

_The four tutorials hold the player's hand with the guide panel open. Then three full-page drills on the hand skills every later chapter assumes, and the capstone._

### 1.1 Navigate & Select *(tutorial · built)*
- **Why.** Every other skill starts with getting to the cell and grabbing the right block. This is the ten seconds a banker saves a hundred times a day.
- **Functions & keys.** Ctrl+arrow · Shift+arrow · Ctrl+Shift+arrow · Ctrl+Space · Shift+Space · Ctrl+A · F5 → Special → Constants · Ctrl+C / Ctrl+V · Ctrl+Home · Ctrl+S
- **On the grid.** The full 20×10 page: a random-direction corridor of solid walls snakes from the home range at A1 to a regional sales table (eight regions by four quarters plus a full year) parked in the far corner. Blue markers sit at the end of every straightaway. Layout, marker positions and the table's anchor change every run.
- **Random.** corridor layout · which row and column the memo names · table anchor · values
- **Step 1 — Ride the corridor.** Fly every straightaway in one press · Collect every marker on the way · Land on the sales table
- **Step 2 — Capture the ranges.** Select the row the memo names, figures only · Select the column it names, every region · Select the whole table, headers and figures · Select every typed figure in one pass
- **Step 3 — Bring it home.** Copy the table · Paste it into the home range at A1 · Save
- **☆** Every straightaway in one press, never cell by cell.

### 1.2 Edit & Repair *(tutorial)*
- **Why.** The first thing anyone does with an inherited file is fix it. Undo is the safety net that lets you move fast.
- **Functions & keys.** F2 · Delete · Ctrl+Z / Ctrl+Y · Ctrl+X / Ctrl+V · Shift+Space / Ctrl+Space · Ctrl++ / Ctrl+− · Alt+Shift+→ (group) · Ctrl+D
- **On the grid.** Top half: a headcount roster (team, role, headcount, cost) back from review with a misspelt team name, two figures typed into the wrong column, and one review note that is wrong about a cell that is correct. Bottom half: a quarterly cost schedule missing its Q3 column and one line, with two stale rows still in it and a six-row detail band under the total. Three staged blocks sit in a side column with red '<<< paste here' cues at their destinations.
- **Random.** which name carries the typo · which two figures are wrong · which review note is the trap · destination ranges · the missing quarter
- **Step 1 — Repair in place.** Fix the misspelt team name without retyping the cell · Re-enter the two figures that landed in the wrong column · Restore the correct cell you cleared on the note's say-so (undo) · Delete the two stale rows
- **Step 2 — Move the staged data.** Cut each staged block to its destination range · Leave the shared block in both places (copy) · Insert the missing Q3 column where the cue points and paste the staged quarter
- **Step 3 — Rebuild the frame.** Insert the missing line and paste it · Fill the schedule's formula across the rebuilt frame · Confirm the total now covers the new line · Group the detail band and fold it away · Save
- **☆** Every staged block moved with one cut, never copy-then-delete.

### 1.3 First Formulas *(tutorial)*
- **Why.** The whole product sits on this: a formula written once and filled everywhere.
- **Functions & keys.** = formulas · Alt+= (AutoSum) · SUM · F4 anchors · Ctrl+R / Ctrl+D · minus signs on costs · Alt H F C (blue inputs)
- **On the grid.** A department budget filling the page: revenue and five cost lines by four quarters plus a full year, the totals row and column stripped, an empty margin row, and an empty share-of-total block to the right that needs one anchored formula. Costs arrived positive.
- **Random.** which cost lines · values · which quarter is the block's anchor
- **Step 1 — Totals.** Total the first quarter with AutoSum · Total every quarter and the full year · Total each line across
- **Step 2 — Signs and margin.** Make the cost lines carry their sign · Build the margin for the first quarter · Fill the margin across the year
- **Step 3 — The anchored block.** Build one share-of-total formula anchored to the total · Fill it across the whole block · Colour every typed input blue · Save
- **☆** One anchored formula fills the whole share block.

### 1.4 Format the Page *(tutorial)*
- **Why.** Formatting is not decoration: it is how a reader knows what is typed, what is calculated, and where the totals are.
- **Functions & keys.** Alt H K (comma) · Ctrl+Shift+% · Alt H 9 / 0 (decimals) · Alt H F C (blue) · Alt H B P (top border) · Alt H B O (bottom border) · Alt H O I (autofit) · Alt H A R (right-align) · F5 → Special → Constants
- **On the grid.** The finished department budget from First Formulas, correct but bare: black numbers with stray decimals, no borders, headers slumped left, a squeezed label column, a margin row showing 0.2345.
- **Random.** which cells carry stray decimals · which inputs are typed
- **Step 1 — Numbers.** Comma-format the body to zero decimals · Percent-format the margin row to one decimal · Right-align the figures under their headers
- **Step 2 — The convention.** Colour every typed input blue · Bottom-border the header row · Top-border the totals row and the total column's first cell
- **Step 3 — Fit.** Widen the label column to fit · Set the four quarter columns to one width · Bold the title and the totals · Save
- **☆** Every typed input found in one Go To Special rather than by eye.

### 1.5 Go To, Find & Replace
- **Why.** On a full vendor page, scrolling and hunting is where the hours go. Go To Special and Replace All are the fastest ten seconds in Excel and nobody teaches them.
- **Functions & keys.** F5 (Go To) · F5 → Special → Blanks · F5 → Special → Constants / Formulas · Ctrl+F · Ctrl+H (Replace All) · Ctrl+Enter · Ctrl+Home / Ctrl+End · the name box
- **On the grid.** A vendor cost register across the whole page: vendor, old code, cost by four quarters, notes; twenty vendors. Blanks scattered through the cost columns, three vendors still carrying a retired code (ACME → ACM), one hardcoded figure typed over a formula in the totals column, and a summary box at the far corner.
- **Random.** which cells are blank · which three vendors carry the old code · which total is typed over
- **Step 1 — Reach.** Go to the cell the note names by typing its address · Find the first vendor still on the old code · Land on the last used cell and read the summary figure into the note
- **Step 2 — Sweep.** Select every blank in the cost columns at once and enter 0 into all of them · Replace every old code with the new one in one action · Select every formula on the page and colour it black
- **Step 3 — Close.** Find the one typed-over total and rebuild it from its neighbour · Return to the top · Save
- **☆** All the blanks filled with one entry: select the blanks, type 0, Ctrl+Enter.

### 1.6 Paste Special *(kept · fuller)*
- **Why.** The candidate hands off decks as values; the professional receives data in the wrong shape every week. Paste Special is how both fix it in one motion.
- **Functions & keys.** Ctrl+Alt+V · values · formats · transpose · multiply / divide · add · Alt H A R
- **On the grid.** Left: a fee deck that arrived sideways (four quarters down a column), a row in thousands, a row of costs shown positive, and a block that arrived left-aligned. Right: the target table with a finished, dressed row to copy the look from, two labelled yellow helper cells (Helper — 1000s, Helper — sign flip), and a 'values only' hand-off strip at the bottom.
- **Random.** which row is in thousands vs hundreds (the label adapts) · which block is misaligned · values
- **Step 1 — Reshape.** Transpose the fees into the fee row · Right-align the figures that arrived left · Convert the flagged row by the factor the label names (paste-multiply from the helper)
- **Step 2 — Convention.** Flip the costs negative from the sign-flip helper · Paste the finished row's look onto the subtotal row, then unbold it · Add the missing adjustment onto the total row (paste-add)
- **Step 3 — Hand off.** Paste the totals over themselves as values · Paste the whole deck into the hand-off strip as values only · Save
- **☆** The hand-off pasted as values and formats in one visit to the dialog.

### 1.7 Fill & Series *(kept · fuller)*
- **Why.** Building a five-year header by typing is the tell of a beginner. Filling is how a page grows.
- **Functions & keys.** Ctrl+D · Ctrl+R · Alt H F I S (series) · Ctrl+Enter · Ctrl+D on one cell (copy above) · Ctrl+; (today) · Alt+Enter
- **On the grid.** A long-range plan frame: a year header with only two years typed, a reference-number column that stops after two, a revenue line with one formula and four empty years, an empty 2-D cost block under it, a monthly calendar strip that needs twelve month labels, and a project tracker block at the foot with a status column to stamp and an owner column to repeat.
- **Random.** starting year · which block is 2-D · tracker rows
- **Step 1 — Series.** Continue the year header to the last column · Fill the reference numbers down · Continue the month labels to December
- **Step 2 — Fill.** Fill the revenue formula across the years · Fill the cost block in both directions from its corner · Repeat the owner down the tracker by copying the cell above
- **Step 3 — Stamp.** Enter Done into every selected status cell in one entry · Put the two-line note on two lines inside its cell · Enter today's date without typing it · Save
- **☆** The cost block filled in both directions from one selection, not two.

### 1.8 Model Tour *(capstone · built)*
- **Why.** Everything the chapter taught on one quarterly P&L.
- **Functions & keys.** Ctrl+arrow · F2 · formula rebuild · Ctrl+R · Ctrl+Shift+$ / % · Alt H B P · Ctrl+Home
- **On the grid.** A full operating P&L that cascades from revenue to net income, four subtotal rows each with one #REF! scattered across the columns, two empty margin rows.
- **Random.** which cell in each subtotal broke · values
- **Step 1 — Chase the marks.** Fly to each break with Ctrl+arrows · Rebuild each subtotal from its neighbour, never retype · Fill the repair across the row
- **Step 2 — Margins.** Build gross margin and EBITDA margin · Percent-format both
- **Step 3 — Dress.** Dollar-format the net income line · Top-border the subtotals · Finish at A1 · Save
- **☆** Every break fixed from a copied neighbour, nothing retyped.

## Chapter 2 · Formatting (FREE) — 6 drills

_The wardrobe, one page per drill: many small real ops per pass, the way a page actually gets dressed before it goes out._

### 2.1 The Memo *(kept · fuller)*
- **Why.** A memo with the wrong things bold reads as careless. Weight, slant, colour, alignment and indent are how a page tells the reader what matters.
- **Functions & keys.** Ctrl+B · Ctrl+I · Alt H F C · Alt H A L / C / R · Alt H 6 (indent) · Alt H W (wrap) · TODAY() · Alt+Enter
- **On the grid.** A one-page coverage memo: a title, an as-of date cell, a header row, twelve body lines with a small figures block, four sub-lines that belong under their parents, three notes that read like data, one discontinued item still listed as live, and a long header that runs into the next column.
- **Random.** which body line is wrongly bold · which item is discontinued · which header is long
- **Step 1 — Weight.** Bold the header row · Unbold the body line that was bolded by mistake · Italicise the three notes in one pass · Colour the discontinued line red
- **Step 2 — Alignment.** Right-align the figures block · Centre the column headers · Indent the four sub-lines under their parents · Wrap the long header
- **Step 3 — Close.** Enter today's date in the as-of cell with a formula · Put the two-line footnote on two lines · Save
- **☆** All three notes italicised from one selection.

### 2.2 The Comps Page *(merges decimals + customfmt)*
- **Why.** Number formats are most of the house look. A comps page with cents in one column and none in the next is the first thing a VP notices, and the Format Cells dialog is worth a dozen shortcut keys.
- **Functions & keys.** Alt H 9 / Alt H 0 · Alt H K · Ctrl+Shift+$ · Alt H A N · Ctrl+1 → 0.0x · Ctrl+1 → Mmm-yy · Ctrl+1 → (#,##0) · superscript · Ctrl+1 → Center across selection
- **On the grid.** A trading comps page filling the grid: eight peers down; market cap, EV, revenue and EBITDA in dollars, an EV/EBITDA multiple, a margin, a last-reported date; a median row; a title sitting in one cell; a footnote marked with a typed 1. Dollars carry cents, the multiple shows no decimal, the margin runs three places, dates read as serial numbers, negatives show a minus, one cell was hand-formatted longer than its neighbours.
- **Random.** which cell is hand-formatted · which columns carry stray decimals · values
- **Step 1 — Decimals.** Set the four dollar columns to zero decimals from one selection · Set the multiple to one decimal · Set the margin to one decimal · Fix the one hand-formatted cell
- **Step 2 — The dialog.** Format the multiples as 0.0x · Format the date column Mmm-yy · Show negatives in parentheses across the body
- **Step 3 — Finish.** Superscript the footnote mark · Centre the title across the table · Bold the median row and top-border it · Save
- **☆** All four dollar columns set from one selection, and the three dialog formats from three visits, not five.

### 2.3 Rulings *(kept · absorbs ruleoff)*
- **Why.** Borders are the grammar that says 'this row is computed'. The wrong border is a wrong sentence.
- **Functions & keys.** Alt H B P (top) · Alt H B O (bottom) · Alt H B S (outside) · Alt H B A (all) · Alt H B T (thick) · Alt H B D (double)
- **On the grid.** Left half: a finished segment schedule with four planted ruling mistakes (a bottom border under a total, a box where a rule belongs, a missing header rule, an all-borders block that should be outside-only). Right half: the same schedule's raw twin with no rulings at all and a grand total at its foot.
- **Random.** which four cells are wrong · which block is raw
- **Step 1 — Audit.** Find and fix the four wrong rulings, healthy cells untouched
- **Step 2 — Apply.** Bottom-border the raw block's header row · Top-border each subtotal · Box the assumptions block with an outside border only
- **Step 3 — Close.** Thick top border on the grand total · Double rule under it · Save
- **☆** Only the four wrong cells touched; the disclosed count reads 4/4 with nothing else changed.

### 2.4 The Print Page *(merges center + autofit)*
- **Why.** A page that prints with #### or a squeezed label column is unusable. Widths are judgment: autofit is right for one block and wrong for another.
- **Functions & keys.** Alt H O I (autofit) · Alt H O W (set width) · Alt H A C / L / R · Alt H W (wrap) · Ctrl+9 (hide rows) · Ctrl+0 (hide columns) · Alt W F F (freeze)
- **On the grid.** A regional revenue print page: two label columns squeezed so the business lines are cut off, four quarter columns at four different widths, a total column showing ####, headers slumped left, a long header that should wrap, two helper columns that should not print, and a header row that should stay put when the page scrolls.
- **Random.** which columns are squeezed · which header is long · which helper columns
- **Step 1 — Fit.** Autofit the two label columns · Set the four quarter columns to one uniform width · Widen the total column until no #### remains
- **Step 2 — Align.** Centre the headers over their columns · Right-align the figure block · Wrap the long header
- **Step 3 — Print-ready.** Hide the two helper columns · Freeze the header row · Save
- **☆** Both label columns fitted in one command.
- `engine:` freeze panes

### 2.5 Conditional Flags *(new)*
- **Why.** The professional's monthly report lives on this; the candidate uses it for covenant flags. Rules that colour by value replace a column of IFs.
- **Functions & keys.** Alt H L (conditional formatting) · highlight cells > value · top 10 · data bars · clear rules · manage rules
- **On the grid.** A budget-vs-actual by department filling the page: twenty lines, budget, actual, variance, variance %, a total row, no visual cue anywhere.
- **Random.** which lines are over · values
- **Step 1 — Rules.** Highlight every variance over 5% red · Highlight every variance under −5% green · Shade the ten largest actual lines
- **Step 2 — Bars.** Add data bars to the actuals column · Clear every rule from the total row
- **Step 3 — Read.** Count the red lines into the summary cell · Bold the summary · Save
- **☆** One rule covering the whole variance block instead of three.
- `engine:` conditional formatting

### 2.6 House Style *(capstone · kept)*
- **Why.** A raw P&L fragment goes in the book tonight, wearing the house look.
- **Functions & keys.** Ctrl+B · Alt H F C · Alt H K · Ctrl+Shift+% · Alt H B P · Alt H O W · Ctrl+1 · F5 → Special → Constants
- **On the grid.** A raw P&L fragment: title, period headers, revenue and cost lines, two subtotals, a multiple line, a date row, nothing formatted.
- **Random.** which cells are hardcodes · values
- **Step 1 — Type.** Bold the title and the headers · Colour every typed input blue · Colour every formula black
- **Step 2 — Numbers.** Comma-format the body · Percent-format the margins · Format the multiple line 0.0x and the date row Mmm-yy
- **Step 3 — Rulings.** Top-border the subtotals · Set the label column wide · Save
- **☆** Every hardcode found in one Go To Special pass.

## Chapter 3 · Formulas I (FREE) — 9 drills

_One formula mechanic per page, then logic, conditional sums, and the text and date functions a professional uses weekly._

### 3.1 Anchors *(kept · fuller)*
- **Why.** Mixed anchors are the difference between a grid built in one fill and one built by hand.
- **Functions & keys.** F4 (cycle $A$1 / A$1 / $A1) · Ctrl+D · Ctrl+R · Ctrl+Shift+$ · Alt H B S
- **On the grid.** Three blocks on one pricing page: a 3×3 tier-by-price grid (one formula, two fills), a share-of-total column under it with a fixed denominator, and a 5×5 volume-discount table that needs a row anchor and a column anchor at once.
- **Random.** tier and price values · which block sits where
- **Step 1 — The grid.** Build the first quote with the row and column anchored the right way · Fill it down · Fill it across
- **Step 2 — The fixed denominator.** Build the first share with the total anchored · Fill the column
- **Step 3 — The mixed table.** Build the corner discount with one mixed anchor · Fill the whole table from that one cell · Dollar-format and box all three blocks · Save
- **☆** All three blocks from one entry and two fills each, F4 doing the anchoring.

### 3.2 Point Mode Build *(kept · fuller · absorbs named ranges)*
- **Why.** Typed numbers inside formulas are the number-one model error. Pointing at an assumption cell, or naming it, is the habit that prevents it.
- **Functions & keys.** point mode (arrows inside =) · yellow assumption cells · Ctrl+R · Ctrl+Enter · Alt H F C (blue / black) · the name box · F3 (paste name)
- **On the grid.** A five-year operating plan: one year of revenue typed; growth, margin, D&A and tax assumptions in labelled yellow cells at the top; empty revenue, EBITDA, D&A, EBIT and tax lines; a typed-number counter in the corner that must read zero.
- **Random.** assumption values · starting revenue · which line is seeded
- **Step 1 — Revenue.** Colour the starting revenue blue · Build next year's revenue by pointing at the growth cell · Fill it across the plan
- **Step 2 — The cascade.** Build EBITDA off the margin cell · Build D&A and EBIT off their assumptions · Build the tax line off the rate cell · Fill the block across
- **Step 3 — Names.** Name the tax-rate cell and the growth cell · Rebuild the tax line using the name · Confirm the typed-number counter reads zero · Save
- **☆** Every assumption referenced by pointing or by name; no number typed into a formula.
- `engine:` named ranges

### 3.3 Ratios & Growth *(merges margin + cagr + percent)*
- **Why.** Margin, share, growth and compound growth are the four numbers every page ends with.
- **Functions & keys.** margin ÷ · share ÷ anchored total · growth ÷ − 1 · ^(1/n) CAGR · Ctrl+Shift+% · Alt H 9 · Ctrl+B
- **On the grid.** A peer coverage page across the grid: eight peers down; revenue for five years, EBITDA and EV across; four empty ratio columns (margin, share of group revenue, one-year growth, five-year CAGR) and a highlight cell for the fastest grower.
- **Random.** peer values · which year is the base
- **Step 1 — Margins and shares.** Build the margin column · Build the share column with the group total anchored · Percent-format both
- **Step 2 — Growth.** Build the one-year growth column · Build the CAGR column with the year count anchored · Percent-format both
- **Step 3 — Read.** Bold the highest CAGR · Top-border the group total row · Save
- **☆** The CAGR built once with the exponent anchored, then filled.

### 3.4 Foot *(kept · fuller)*
- **Why.** A page that does not foot is a page nobody trusts.
- **Functions & keys.** Alt+= (AutoSum) · SUM across / down · the corner total · tie check = 0 · SUBTOTAL by group · Alt H B P
- **On the grid.** A segment pack filling the page: three groups of segments by four quarters, every group subtotal, the totals row, the totals column and the corner missing; a tie-check cell that must read zero.
- **Random.** group sizes · values · which subtotal is seeded wrong
- **Step 1 — Across and down.** Total every segment line across with one AutoSum · Total every quarter down with one AutoSum · Total the corner
- **Step 2 — Groups.** Build each group's subtotal · Rebuild the grand total from the subtotals, not the lines
- **Step 3 — Prove it.** Enter the tie check between the two routes · Bold and top-border the totals · Save
- **☆** Both total lines with one AutoSum each over the whole selection.

### 3.5 Logic *(merges flags + caps & floors)*
- **Why.** A page that says something in words, caps what it pays and never goes below zero: IF, AND, MIN, MAX and IFS are the four formulas behind every flag column.
- **Functions & keys.** IF · AND / OR · MIN (cap) · MAX (floor) · IFS / SWITCH · COUNTIF · Alt H F C (red)
- **On the grid.** A budget-vs-actual on the left: twenty lines, budget, actual, an empty variance column, an empty flag column, a tolerance cell. A bonus schedule on the right: name, grade, formula bonus, the pool cap, empty paid, clawback and band columns.
- **Random.** which lines are over · tolerance · pool size · grades
- **Step 1 — Flags.** Build the variance · Flag every line over budget in words · Add the tolerance condition with AND · Colour the flags red
- **Step 2 — Caps and floors.** Cap each bonus at the pool · Floor each clawback at zero · Band each grade with IFS
- **Step 3 — Count.** Count the flagged lines into the summary · Total the pool paid · Save
- **☆** One IF(AND()) column instead of two helper columns.
- `engine:` IFS, SWITCH

### 3.6 Conditional Sums *(kept · fuller)*
- **Why.** 'How much did we spend on travel' and 'revenue by segment' are the same formula.
- **Functions & keys.** SUMIF · COUNTIF · AVERAGEIF · anchored criteria ranges · Ctrl+D · Ctrl+Shift+%
- **On the grid.** A raw booking ledger down the left (date, segment, region, amount; forty lines) and an empty summary block on the right: one row per segment with total, count, average and share columns; a reconciliation cell to the ledger total.
- **Random.** segment names · ledger values · which segment is largest
- **Step 1 — Totals.** Total each segment's revenue with one anchored SUMIF · Fill it down the block
- **Step 2 — Counts and averages.** Count each segment's bookings · Average each segment's booking size
- **Step 3 — Prove it.** Build the share of total · Enter the reconciliation check to the ledger total · Bold the largest segment · Save
- **☆** The summary block filled from one row of anchored formulas.

### 3.7 Clean the Export *(merges the three text drills)*
- **Why.** Every HR, CRM and vendor export arrives with stray spaces, shouting capitals and names in one column. Cleaning it by hand is where an afternoon goes.
- **Functions & keys.** TRIM · PROPER / UPPER / LOWER · LEFT / RIGHT / MID · FIND · LEN · & / CONCAT · TEXTJOIN · paste values · Alt A E (text to columns)
- **On the grid.** An HR export filling the page: employee code with trailing spaces, full name as 'LAST, first' in capitals, a product code whose middle three characters are the region, a combined 'city, state' column; empty helper columns beside each and an empty email column; a second list below that needs a Region-Product key to match.
- **Random.** which rows carry stray spaces · name formats · code layout
- **Step 1 — Clean.** Trim the codes in a helper column · Proper-case the names · Paste both back over the source as values and delete the helpers
- **Step 2 — Split.** Pull the last name with LEFT and FIND · Pull the first name with MID · Pull the region from the middle of the product code · Split city and state with text-to-columns
- **Step 3 — Build.** Build first.last@company in the email column · Build the Region-Product key · Match the second list on the key · Save
- **☆** First and last names from one pair of formulas filled down, pasted back in one motion.
- `engine:` text-to-columns

### 3.8 Dates *(new)*
- **Why.** Contract renewals, tenure, days to close, month-end schedules: dates are numbers, and the professional who knows that stops counting on a calendar.
- **Functions & keys.** TODAY · EDATE · EOMONTH · DATEDIF · NETWORKDAYS · Mmm-yy format · IF on a date · Ctrl+;
- **On the grid.** A contract register filling the page: customer, start date, term in months, annual value; empty renewal, month-end, months-remaining, business-days-to-renewal and renewing-this-quarter columns; a summary block counting renewals by quarter.
- **Random.** start dates · terms · today's anchor
- **Step 1 — Build the dates.** Build the renewal date with EDATE · Snap it to month-end · Format both Mmm-yy
- **Step 2 — Count.** Count the months remaining · Count the business days to renewal · Flag anything renewing this quarter
- **Step 3 — Summarise.** Count renewals per quarter into the summary · Stamp today's date in the as-of cell · Save
- **☆** All four date columns filled from one row of formulas.
- `engine:` DATEDIF, NETWORKDAYS

### 3.9 Close the Quarter *(capstone · new)*
- **Why.** One quarterly P&L page: point mode, AutoSum, anchored percentages, growth, a conditional-sum memo.
- **Functions & keys.** point mode · Alt+= · anchored % · growth · SUMIF · format as you go
- **On the grid.** A quarterly P&L with revenue and cost lines by quarter, empty totals, margins and growth rows, and a segment memo block fed by a small ledger at the foot.
- **Random.** values · which segment leads
- **Step 1 — Build.** Total the quarters with AutoSum · Build the margins with one anchored formula · Build quarter-over-quarter growth
- **Step 2 — Memo.** Build the segment memo with SUMIF · Build its share column
- **Step 3 — Dress.** Format each block as you finish it · Top-border the totals · Save
- **☆** No number typed into any formula.

## Chapter 4 · Data & Lookups (FREE) — 9 drills

_The corporate-day chapter: cleaning an export, sorting and filtering it, reading one table into another, and summarising a ledger with formulas, a table or a pivot._

### 4.1 Scrub *(kept · absorbs sort)*
- **Why.** Every export needs the same first ten minutes: junk out, duplicates out, sorted, totalled.
- **Functions & keys.** Shift+Space / Ctrl+− · Ctrl+Shift+↓ · Alt A S D / A (sort) · Alt A S S (sort dialog, two keys) · Alt A M (remove duplicates) · Alt+= · Ctrl+B
- **On the grid.** A deal-blotter export filling the page: twenty deals with a repeated header row, a page-break line, a stale subtotal, one deal sent twice; a late deal staged below the table with a red cue; a summary strip at the foot.
- **Random.** where the junk rows sit · which deal is duplicated · the late deal
- **Step 1 — Junk.** Delete the three junk rows · Remove the duplicate deal · Confirm the row count in the summary
- **Step 2 — Order.** Sort the deals largest first · Enter the late deal and sort again by size then name
- **Step 3 — Close.** Total the size column · Bold and top-border the total · Save
- **☆** The table selected to its last row in one press before every sort.
- `engine:` remove duplicates

### 4.2 Filter & Screens *(kept · absorbs screens)*
- **Why.** 'Biggest deal in healthcare', 'how many at diligence', 'average tenure in sales': the questions a VP asks on the phone, answered two ways.
- **Functions & keys.** Ctrl+Shift+L (AutoFilter) · Alt+↓ (picker) · SUBTOTAL · Alt A C (clear) · MAXIFS · MINIFS · AVERAGEIFS · COUNTIFS
- **On the grid.** A coverage pipeline filling the page: deal, sector, status, size, days open; forty lines; four question cards on the right with empty answer cells.
- **Random.** sectors and statuses named on the cards · values
- **Step 1 — Filter.** Turn on the filter · Filter to the named sector and enter the largest deal · Clear it and filter to the named status; enter the count and total · Clear the filter
- **Step 2 — Formulas.** Answer the largest-in-sector card with MAXIFS · Answer the smallest-at-status card with MINIFS · Answer the average-days card with AVERAGEIFS
- **Step 3 — Prove it.** Count the deals per sector with COUNTIFS · Bold the answers · Save
- **☆** The first screen cleared without walking the picker back.
- `engine:` MAXIFS, MINIFS, AVERAGEIFS

### 4.3 Hide, Group & Outline *(kept · fuller)*
- **Why.** Models are read by people who want the summary and auditors who want the detail. Grouping serves both without two files.
- **Functions & keys.** Ctrl+9 / Ctrl+0 · Ctrl+Shift+9 / Ctrl+Shift+0 · Alt+Shift+→ (group) · Alt+Shift+← (ungroup) · outline levels 1 / 2 · Alt A H (hide detail)
- **On the grid.** A regional tape filling the page: four regions, four detail rows each, a consolidated line per region and a grand total; detail rows for two regions hidden by the analyst who left, one column hidden, two helper columns that should not show, a memo block at the foot.
- **Random.** which rows and column are hidden · region order
- **Step 1 — Find.** Unhide the buried detail rows · Unhide the hidden column
- **Step 2 — Outline.** Group each region's detail · Fold all four regions to their consolidated lines · Unfold one region to check it
- **Step 3 — Close.** Hide the two helper columns · Bold the grand total and top-border it · Save
- **☆** All four regions folded with one outline-level key.

### 4.4 Lookups *(kept · fuller)*
- **Why.** The single most-asked Excel skill in interviews and the one the professional uses to join two lists.
- **Functions & keys.** VLOOKUP · INDEX · MATCH · XLOOKUP · Alt H F C (green links) · Ctrl+D
- **On the grid.** A peer table on the left (eight peers by six metrics) and a three-line pitch screen on the right that reads one metric by name; a second screen below it. The table's columns re-order after the first screen is built.
- **Random.** which metric the screen names · column order · peer set
- **Step 1 — VLOOKUP.** Read the first metric with VLOOKUP · Fill the screen · Colour the reads green
- **Step 2 — The columns move.** Rebuild the read with INDEX and MATCH after the table re-orders · Fill the screen
- **Step 3 — XLOOKUP.** Build the second screen with XLOOKUP in one formula · Fill it · Save
- **☆** Each screen filled from one lookup formula.
- `engine:` XLOOKUP

### 4.5 Two-way & Cross-tab *(merges lookup2 + rollup)*
- **Why.** Find the row and the column at once, then build the whole cross-tab from one formula.
- **Functions & keys.** INDEX(range, MATCH, MATCH) · SUMIFS · mixed anchors · Ctrl+R / Ctrl+D · Alt H B S · reconciliation check
- **On the grid.** Top: a five-segment by five-quarter reporting tape and two read cards naming a segment and a quarter. Bottom: a one-line-per-booking ledger and an empty segment-by-region cross-tab with a reconciliation cell.
- **Random.** which cards · segment order · ledger values
- **Step 1 — Two-way reads.** Enter the missing quarter header · Build the first card read with two MATCHes · Build the second card off the same anchored formula
- **Step 2 — Cross-tab.** Build the corner cell with both conditions anchored · Fill the grid in both directions
- **Step 3 — Prove it.** Enter the reconciliation check to the ledger total · Box the cross-tab · Save
- **☆** The entire cross-tab from one formula.

### 4.6 Recon *(kept · fuller)*
- **Why.** Month-end: two systems disagree and someone has to say by how much and why.
- **Functions & keys.** XLOOKUP / VLOOKUP · COUNTIF · difference column · SUM to zero · Ctrl+C / Ctrl+V · Alt H F C (red)
- **On the grid.** Two lists side by side filling the page: the deal blotter and the finance extract; empty in-finance, difference and duplicate-flag columns; a total cell; a red cue at the row where the missing deal belongs.
- **Random.** which deal is missing · which amount is wrong · which is duplicated
- **Step 1 — Match.** Build the in-finance column with a lookup · Flag any deal that appears twice with COUNTIF
- **Step 2 — Differences.** Add the missing deal to finance · Build the difference column · Fix the one amount that is wrong
- **Step 3 — Prove it.** Total the difference to zero · Colour the corrected cells red · Save
- **☆** The missing deal copied across, name and amount, in one paste.

### 4.7 Tables & Validation *(new)*
- **Why.** A range that grows, filters and lets formulas refer to columns by name; a column that refuses bad entries.
- **Functions & keys.** Ctrl+T · total row · structured references [@Amount] · Alt A V V (validation list) · date rule · error alert
- **On the grid.** A transaction list filling the page: date, vendor, category, amount, status; no total row; a category list block on the right to source the drop-down.
- **Random.** rows · categories · the bad entry planted
- **Step 1 — Table.** Make the range a table · Add the total row · Build a column formula by name and watch it fill the column
- **Step 2 — Grow.** Add a row and confirm the total moves · Sort the table by amount from its header
- **Step 3 — Validate.** Restrict the category column to the list · Restrict the date column to this year · Fix the planted bad entry · Save
- **☆** The column formula written once for the whole column.
- `engine:` Excel Tables, data validation

### 4.8 Pivot *(new)*
- **Why.** The professional's summary tool and the candidate's data-room sanity check.
- **Functions & keys.** Alt N V (insert pivot) · field list by keyboard · rows / columns / values · Alt+F5 (refresh) · number format on values
- **On the grid.** The booking ledger down the left and an empty area on the right where the pivot lands; a formula cross-tab from the previous drill sits at the foot to check against.
- **Random.** ledger values · which line changes for the refresh
- **Step 1 — Build.** Insert a pivot on the ledger · Segment to rows, region to columns, amount to values
- **Step 2 — Read.** Format the values · Confirm the pivot matches the formula cross-tab
- **Step 3 — Refresh.** Change a ledger line and refresh · Save
- **☆** The field list driven entirely by keyboard.
- `engine:` pivot tables

### 4.9 The Data-Room Tape *(capstone · new)*
- **Why.** A dirty export becomes a sendable summary: junk out, sorted, looked up, summarised, grouped.
- **Functions & keys.** F5 → Special → Blanks · Ctrl+− · Alt A S D · XLOOKUP · SUMIFS · Alt+Shift+→
- **On the grid.** A dirty data-room export filling the page, a sector lookup table to the side, an empty summary block.
- **Random.** junk positions · sector map · values
- **Step 1 — Clean.** Delete the junk rows · Sort by size
- **Step 2 — Enrich.** Look up the sector for each deal · Summarise by sector with SUMIFS
- **Step 3 — Ship.** Group the detail · Dress the summary · Save
- **☆** The junk rows found with one Go To Special on blanks.

## Chapter 5 · Formulas II (PRO) — 7 drills

_Making a page decide and not break, then the audit skills for someone else's file._

### 5.1 Errors *(merges wrapfix + triage)*
- **Why.** A board pack that shows #N/A is embarrassing; one that hides a real error with a zero is worse. Know what each error means and the right fix for each.
- **Functions & keys.** IFERROR · IFNA · #N/A · #REF! · #DIV/0! · #VALUE! · F2 · Ctrl+D
- **On the grid.** Top: a board-pack panel with five lookup reads into a tape, three showing #N/A for three different reasons (genuinely missing, misspelt key, wrong range). Bottom: a segment tab whose costs total lost its rows (#REF!), a share line dividing by zero, text typed where a number belongs, eight red cells downstream.
- **Random.** which read is which kind of broken · which rows were deleted
- **Step 1 — The reads.** Wrap the genuinely missing read to show a dash · Fix the misspelt key · Fix the wrong range
- **Step 2 — The wreckage.** Rebuild the total whose rows were deleted · Guard the share line against a zero · Fix the text that was typed where a number belongs
- **Step 3 — Prove it.** Confirm the eight red cells clear · Total the panel · Save
- **☆** Both broken reads repaired in one fill with the wrapped one left intact.

### 5.2 Scenario Switch *(kept · fuller)*
- **Why.** A case cell that drives the page is how a real model does scenarios.
- **Functions & keys.** CHOOSE · INDEX on a case cell · F4 · Ctrl+D · Ctrl+Alt+V (values)
- **On the grid.** A case block (three columns of growth, margin and capex), a case-number cell, an empty live driver row, a five-year build below, and an output table to snapshot on the right.
- **Random.** case values · which case is active at load
- **Step 1 — The switch.** Build the live driver off the case cell · Fill the driver block down
- **Step 2 — The build.** Build revenue and EBITDA off the driver · Fill across the plan
- **Step 3 — Snapshot.** Snapshot all three cases into the table as values · Change the case and confirm the page moves · Save
- **☆** The driver block built once and filled down.

### 5.3 Review Pass *(kept · fuller)*
- **Why.** Take an inherited page and know in one pass what is typed, what is linked and what is broken.
- **Functions & keys.** F5 → Special → Constants · F5 → Special → Formulas · Ctrl+` (show formulas) · Alt H F C (audit colours) · F2 · Ctrl+R
- **On the grid.** A divisional operating review filling the page: revenue and cost lines by quarter with typed-over cells, a total that stops a row short, a margin formula pointing at the wrong row, a check line already reading non-zero; the checklist discloses four problems.
- **Random.** which cells are typed over · which total is short · which margin is wrong
- **Step 1 — Colour.** Find every typed-over cell with Go To Special and colour it · Find every formula and colour it black
- **Step 2 — Fix.** Fix the total that stops short · Re-point the margin formula · Rebuild the typed-over cells from their neighbours
- **Step 3 — Prove it.** Show formulas and scan the page · Confirm the check line reads zero · Save
- **☆** Every hardcode found in one Go To Special pass.

### 5.4 Trace & Evaluate *(new)*
- **Why.** When the output is wrong, the fast analyst walks the chain rather than re-reading every cell.
- **Functions & keys.** Alt M P (precedents) · Alt M D (dependents) · Ctrl+[ (go to precedent) · F5 (back) · F9 (evaluate a selection)
- **On the grid.** A one-page model with an output box at the foot; five chained formulas above it, one wrong; a second output whose dependents must all be found.
- **Random.** which formula is the culprit · chain shape
- **Step 1 — Trace.** Trace the output back to its inputs · Step into each precedent in turn
- **Step 2 — Evaluate.** Evaluate the suspect formula piece by piece · Fix the culprit
- **Step 3 — Dependents.** Find every cell that depends on the second output · Confirm the output · Save
- **☆** The culprit found without editing any healthy cell.
- `engine:` trace precedents / dependents, evaluate (F9)

### 5.5 Stale Links & Roll-forward Prep *(merges stalelink + versionup)*
- **Why.** Re-issued assumptions, typed-in rates and last version's tags: the three things that make a model impossible to roll forward.
- **Functions & keys.** re-point references · Alt H F C (green links) · F2 · Ctrl+H (Replace All) · Alt H F C (blue) · Ctrl+R
- **On the grid.** An assumptions page at the top with v1 figures beside re-issued v2 figures; a five-year build below still pointing at v1, with the growth and cost rates typed inside its formulas; version tags reading v1 in every header.
- **Random.** which lines are still on v1 · which rates are typed in
- **Step 1 — Re-point.** Find the three lines still on v1 · Re-point them at v2 · Colour the links green · Clear the superseded figures
- **Step 2 — Pull the rates out.** Move each typed rate into an assumption cell · Re-point the formulas at the cells · Colour the new inputs blue
- **Step 3 — Tags.** Replace every v1 tag with v2 in one action · Save
- **☆** All tags replaced in one dialog.

### 5.6 Make It Tie *(kept · fuller)*
- **Why.** A balance sheet check row; finding why it does not read zero.
- **Functions & keys.** check row = assets − L&E · SUM · F2 · re-point · Ctrl+R
- **On the grid.** A four-year balance sheet filling the page, both sides, with zeros pasted over the check row; one year breaks for two reasons.
- **Random.** which year breaks · which total is short · which equity cell is wrong
- **Step 1 — The check.** Rebuild the check row across all four years · Find the year that breaks
- **Step 2 — The fixes.** Fix the total that stops short · Re-point the equity cell
- **Step 3 — Prove it.** Confirm all four years tie · Bold the check row · Save
- **☆** Only what broke touched.

### 5.7 The Red-Flag Pass *(capstone · new)*
- **Why.** An inherited one-tab model with seven disclosed errors.
- **Functions & keys.** everything in chapter 5 · the error meter · F5 → Special
- **On the grid.** An inherited model filling the page with seven planted errors: a stale link, a sign flip, a hardcode, a short SUM, a wrong anchor, a circular reference, a typed number.
- **Random.** which cells carry which error
- **Step 1 — Find.** Find every hardcode in one pass · Find the stale link and the circular reference
- **Step 2 — Fix.** Fix all seven; the meter fills
- **Step 3 — Prove it.** Check line reads zero · Save
- **☆** Every hardcode found in one Go To Special pass.

## Chapter 6 · Models I (PRO) — 7 drills

_Valuation mechanics, one Excel move per page: statistics, discounting, NPV and IRR, sensitivity and goal seek, multiples._

### 6.1 WACC *(kept · fuller)*
- **Why.** MEDIAN, AVERAGE, MAX and MIN over a peer set, and a rate anchored once.
- **Functions & keys.** MEDIAN · AVERAGE · MAX / MIN · unlever / relever · F4 · Ctrl+D
- **On the grid.** A five-comparable beta set (beta, debt, equity, tax) on the left, an empty unlevered-beta column, a statistics block (median, average, high, low) and a WACC block on the right with the target's inputs in yellow.
- **Random.** peer values · target inputs
- **Step 1 — Unlever.** Unlever each beta with the tax rate anchored · Fill the column
- **Step 2 — Statistics.** Take the median, average, high and low · Relever the median
- **Step 3 — WACC.** Build cost of equity · Build after-tax cost of debt · Build WACC · Save
- **☆** The unlevering column from one anchored formula.

### 6.2 NPV, IRR & Payback *(new)*
- **Why.** The professional's business case: does the project clear the hurdle, when does it pay back, and what does the financing cost each month.
- **Functions & keys.** NPV · IRR · cumulative cash (payback) · PMT · IF · Ctrl+Shift+%
- **On the grid.** A capex proposal filling the page: an initial outlay, five years of cash flow, a hurdle-rate cell, a financing block (amount, rate, term), an empty decision box (NPV, IRR, payback year, monthly payment, verdict), and a small two-case comparison beside it.
- **Random.** cash flows · hurdle · financing terms
- **Step 1 — Value.** Build NPV at the hurdle · Build IRR · Percent-format the IRR
- **Step 2 — Payback.** Build the cumulative cash line · Find the payback year
- **Step 3 — Decide.** Build the monthly payment on the financing · Flag the verdict against the hurdle · Copy the block onto the second case · Save
- **☆** NPV built once and re-used by the verdict.
- `engine:` PMT

### 6.3 DCF *(kept · absorbs uFCF and dcfbuild)*
- **Why.** From EBIT to enterprise value on one page: the cash row, the discount factors with the exponent, the terminal value, the bridge to equity.
- **Functions & keys.** ^ (exponent) · 1/(1+r)^n · SUMPRODUCT · NPV as a check · F4 · Ctrl+R
- **On the grid.** A five-year DCF filling the page: EBIT, tax, D&A, capex and working-capital lines; an empty unlevered free cash flow line; a rate cell; empty discount-factor and present-value rows; a terminal value block; an equity bridge with net debt and share count.
- **Random.** operating values · rate · net debt
- **Step 1 — Cash.** Build the cash-tax line · Build NOPAT and unlevered free cash flow · Fill the block across
- **Step 2 — Discount.** Build the discount-factor row with the rate anchored · Build present values · Build and discount the terminal value
- **Step 3 — Bridge.** Total enterprise value · Bridge to equity value and price per share · Check the total with NPV · Save
- **☆** Every factor from one formula with the rate anchored.

### 6.4 Sensitivity & Goal Seek *(kept · absorbs goal seek)*
- **Why.** Stress the answer two ways, then solve backwards for the input that hits a target.
- **Functions & keys.** mixed anchors · Ctrl+R / Ctrl+D · Alt A W T (data table) · Alt A W G (goal seek) · Alt H K · Alt H B S
- **On the grid.** A 5×3 two-way grid (growth across, margin down) with the corner empty; a second identical grid for the data-table route; a small model with a price input and an NPV output; two target cells.
- **Random.** growth and margin ranges · targets
- **Step 1 — The formula grid.** Build the corner cell with both anchors · Fill the grid · Comma-format and box it
- **Step 2 — The data table.** Build the same grid as a data table · Confirm the two grids agree
- **Step 3 — Goal seek.** Seek the price that makes NPV zero · Seek the growth that hits the EBITDA target · Save
- **☆** All fifteen cells from one formula.
- `engine:` data table, goal seek

### 6.5 Comps *(kept · absorbs txncomps)*
- **Why.** Multiples, the implied range, and the 0.0x format, on trading comps and then on a precedent tape.
- **Functions & keys.** ÷ multiples · Ctrl+Enter over a block · MEDIAN / MAX / MIN · Ctrl+1 → 0.0x · implied value ÷
- **On the grid.** A five-peer trading comps table (EV, revenue, EBITDA) with an empty multiples block, median/high/low rows and an implied-price box; a six-deal precedent tape below with its own empty multiple column.
- **Random.** peer and deal values · target metrics
- **Step 1 — Multiples.** Build all ten multiples with one entry over the block · Format them 0.0x
- **Step 2 — The range.** Build median, high and low · Build the implied enterprise and equity values · Build the implied share price
- **Step 3 — Precedents.** Build the multiple paid on each deal · Build the precedent median and implied value · Save
- **☆** All ten multiples from one Ctrl+Enter.

### 6.6 Accretion / Dilution *(kept · fuller)*
- **Why.** One analysis copied across three financing structures; a block moved as a unit.
- **Functions & keys.** Ctrl+C / Ctrl+V a block · foregone interest · pro forma EPS · accretion ÷ − 1 · Ctrl+Shift+% · Ctrl+Shift+↓
- **On the grid.** Three financing structures side by side filling the page (all cash, mixed, all stock); the first has its lines built, the other two are empty; a summary row across the foot.
- **Random.** deal terms · structure mixes
- **Step 1 — The first structure.** Build foregone interest · Build pro forma net income and shares · Build pro forma EPS and accretion
- **Step 2 — Copy across.** Copy the block onto the other two structures in one paste · Confirm each recalculates on its own terms
- **Step 3 — Summarise.** Percent-format the accretion lines · Flag the most accretive structure · Save
- **☆** The block copied onto both structures in one paste.

### 6.7 The Valuation Page *(capstone · new)*
- **Why.** One page that references every method's output, never retypes it, and shows the range floor to ceiling.
- **Functions & keys.** references (never retype) · MIN / MAX · Ctrl+Enter · Alt H B S
- **On the grid.** A one-page valuation summary: four methods down, low / mid / high across, floor and ceiling cells, a premium column, all fed from output cells elsewhere on the page.
- **Random.** method outputs
- **Step 1 — Reference.** Reference each method's low, mid and high with one selection
- **Step 2 — Range.** Build the floor and ceiling · Build the premium column
- **Step 3 — Dress.** Format and box it · Save
- **☆** The whole page referenced from one selection with Ctrl+Enter.

## Chapter 7 · Models II (PRO) — 7 drills

_Credit, and the roll-forward as a pattern: every schedule is opening plus adds minus subs equals closing._

### 7.1 Roll Forward *(new · absorbs fixed assets)*
- **Why.** Opening plus additions minus reductions equals closing; next period's opening references the last closing; interest off the beginning balance so nothing goes circular.
- **Functions & keys.** opening = prior closing · closing = opening + adds − subs · interest × beginning balance · depreciation ÷ life · Ctrl+R · Alt H F C (green)
- **On the grid.** Two schedules on one page: a balance roll across five years with an interest line that currently points at the closing balance (circular), and a fixed-asset schedule below with a capex plan row and empty opening, capex, depreciation, closing and accumulated-depreciation lines.
- **Random.** starting balances · capex plan · lives
- **Step 1 — The pattern.** Build the closing balance · Reference next year's opening to it · Fill the roll
- **Step 2 — Break the circle.** Build interest off the beginning balance · Colour the fix green
- **Step 3 — Fixed assets.** Build depreciation off the capex and life · Build the closing and accumulated lines · Fill across · Save
- **☆** The whole corkscrew from one formula pair.

### 7.2 Interest & Coverage *(kept · fuller)*
- **Why.** Interest on the beginning balance; coverage with a cap and a floor.
- **Functions & keys.** beginning-balance interest · MIN / MAX coverage · Ctrl+R · Ctrl+B
- **On the grid.** A term-loan block filling the page: beginning debt, repayment, ending debt, cash interest, EBITDA, coverage, a cap and a floor cell, a covenant test line.
- **Random.** balances · rates · EBITDA path
- **Step 1 — The roll.** Build ending debt · Build beginning debt off the prior close · Fill across
- **Step 2 — Interest.** Build cash interest off the beginning balance · Fill across
- **Step 3 — Coverage.** Build coverage with the cap and floor · Flag the covenant test · Save
- **☆** The coverage line in one formula.

### 7.3 Revolver *(kept · fuller)*
- **Why.** MAX and MIN as draw and sweep, with a minimum cash balance.
- **Functions & keys.** MAX(0, …) draw · MIN(…) sweep · minimum cash · Ctrl+R
- **On the grid.** A revolver page filling the grid: opening balance, cash before revolver, minimum cash, capacity; empty draw, sweep, ending balance and post-revolver cash lines across five years.
- **Random.** cash path · capacity · minimum
- **Step 1 — Draw.** Build the draw against minimum cash · Cap it at capacity
- **Step 2 — Sweep.** Build the sweep · Build the ending balance
- **Step 3 — Cash.** Build post-revolver cash · Fill the schedule across · Save
- **☆** The schedule across in one pass.

### 7.4 Waterfall *(kept · fuller)*
- **Why.** Paying down tranches in order with MIN; nothing paid twice.
- **Functions & keys.** MIN cascade · roll-forwards · check: applied = repaid · copy senior → junior
- **On the grid.** Two tranches (senior, junior) across three years filling the page: cash available, empty paydown and roll-forward lines for each, a check cell.
- **Random.** cash path · tranche sizes
- **Step 1 — Senior.** Total cash available · Pay the senior tranche, never more than owed · Roll it forward
- **Step 2 — Junior.** Pay the junior from what is left by copying the senior pair · Roll it forward
- **Step 3 — Prove it.** Enter the check: applied equals repaid · Save
- **☆** The junior tranche built by copying the senior pair.

### 7.5 Covenant Flags *(kept · fuller)*
- **Why.** The credit agreement runs two tests every quarter; the page has to say pass or fail in words.
- **Functions & keys.** ratio lines · headroom MIN / MAX · IF pass / breach · MIN over quarters · Alt H F C (red) · F5 → Special
- **On the grid.** A covenant compliance table filling the page: two leverage tests by eight quarters, one test finished, the other empty, a headroom row, a tightest-quarter cell, a flag row.
- **Random.** EBITDA path · covenant levels
- **Step 1 — The second test.** Build the ratio line · Build headroom against the covenant
- **Step 2 — Flags.** Flag each quarter pass or breach · Find the tightest quarter
- **Step 3 — Colour.** Colour every breach red in one pass · Save
- **☆** All breach cells coloured from one Go To Special on the flag row.

### 7.6 13-Week Cash *(kept · fuller)*
- **Why.** A weekly calendar built from one date, and a schedule keyed to it.
- **Functions & keys.** date + 7 · EOMONTH · Ctrl+R · Alt+= · opening → closing roll · variance vs prior
- **On the grid.** A 13-week cash roll filling the page: receipt and disbursement lines by week, week headers missing after week one, opening and closing cash rows, a prior-forecast row and an empty variance row.
- **Random.** flows · start date
- **Step 1 — Calendar.** Build week two's date from week one · Fill the header to week 13
- **Step 2 — Flows.** Total each flow line · Build the roll from opening to closing
- **Step 3 — Read.** Build the cushion line · Build the variance against the prior forecast · Save
- **☆** The header and the roll each from one fill.

### 7.7 Full Waterfall *(capstone · kept)*
- **Why.** Three facilities, four years, seniority, roll-forwards, interest, a zero check.
- **Functions & keys.** everything in chapter 7 · MIN cascade over three facilities · zero check
- **On the grid.** Three facilities across four years with seniority, interest and roll-forwards, and a zero check at the foot.
- **Random.** cash path · facility terms
- **Step 1 — Cascade.** Pay down each facility in order
- **Step 2 — Roll.** Roll each forward with interest
- **Step 3 — Prove it.** Enter the check: repaid equals applied · Save
- **☆** The sanity check entered: repaid equals applied.

## Chapter 8 · Full Builds (PRO) — 8 drills

_Assembling and shipping a page: statements, schedules, a cover, the hand-off._

### 8.1 IS Build *(kept · absorbs opmodel)*
- **Why.** An income statement off a driver panel.
- **Functions & keys.** units × price · cost ratios · Alt+= · linked depreciation · margin memo · Ctrl+R
- **On the grid.** A projection page: the actual year in, a driver panel (units, price, cost ratios) set in yellow, five forecast years empty, depreciation linked from elsewhere on the page.
- **Random.** drivers · actuals
- **Step 1 — Revenue.** Build revenue from units and price · Fill across
- **Step 2 — Costs.** Build COGS and opex off their ratios · Total EBITDA · Build EBIT off the linked depreciation
- **Step 3 — Memo.** Build the margin memo · Fill the block across the forecast · Save
- **☆** The whole statement block filled across in one pass.

### 8.2 NWC Schedule *(kept · fuller)*
- **Why.** Working capital off days assumptions.
- **Functions & keys.** days drivers · × / 365 · SUM · change line · Ctrl+R
- **On the grid.** A working-capital schedule: revenue and COGS lines, days assumptions in yellow, empty receivables, inventory, payables, NWC and change lines.
- **Random.** days · revenue path
- **Step 1 — Drivers.** Enter the driver days · Build receivables off days sales
- **Step 2 — Lines.** Build inventory and payables off their days · Total net working capital
- **Step 3 — Cash.** Build the increase line the cash flow needs · Save
- **☆** All five lines from one fill.

### 8.3 Debt Block *(kept · fuller)*
- **Why.** Term loan and revolver together: two rolls, two interest lines, totals.
- **Functions & keys.** two rolls · beginning-balance interest · SUM · copy term loan → revolver
- **On the grid.** A debt block: term loan and revolver rolls across five years, two rate cells, interest lines, totals.
- **Random.** balances · rates
- **Step 1 — Term loan.** Enter the two rates · Build the term-loan roll
- **Step 2 — Revolver.** Build the revolver roll by copying the term-loan rows · Build both interest lines off beginning balances
- **Step 3 — Totals.** Total debt and total interest · Save
- **☆** The revolver rows built by copying the term-loan rows.

### 8.4 Three Statements *(kept · absorbs bsbuild + cfslink)*
- **Why.** Wiring net income to cash flow, cash to the balance sheet, retained earnings to the year; the check row.
- **Functions & keys.** cross-block references · cash link · retained earnings roll · check row · Ctrl+R
- **On the grid.** Three statements side by side (income, cash flow, balance sheet) for three years, none wired to the others, a check row.
- **Random.** values
- **Step 1 — Wire.** Reference net income into the cash flow · Build the cash link to the balance sheet
- **Step 2 — Roll.** Build the retained earnings roll
- **Step 3 — Prove it.** Build the check row · Bold it · Save
- **☆** All four built lines from one fill each.

### 8.5 Paper LBO *(kept · absorbs lbo + returns bridge)*
- **Why.** Entry and exit on one page: EV, net debt, sponsor equity, MOIC, IRR, and where the return came from.
- **Functions & keys.** EV / net debt / equity · MOIC · IRR · IRR by hand as a check · lever attribution · share ÷ total
- **On the grid.** A paper LBO page: entry and exit columns, EBITDA and multiple inputs, empty EV, net debt, equity, MOIC and IRR lines; a returns bridge block below with three empty levers and a check cell.
- **Random.** entry terms · exit year
- **Step 1 — Entry and exit.** Build enterprise value at entry and exit · Build net debt · Total sponsor equity
- **Step 2 — Returns.** Build MOIC · Build IRR · Build IRR a second way as a check
- **Step 3 — Attribution.** Build the three levers · Total them against the gain and enter the check · Save
- **☆** Both built lines across entry and exit, nothing retyped at exit.

### 8.6 Model Cover *(kept · fuller)*
- **Why.** A cover page that references outputs and never retypes them.
- **Functions & keys.** = references to outputs · Ctrl+Enter · Alt H K / Ctrl+Shift+% · & title from a cell
- **On the grid.** An IC pack cover: six headline metrics by two cases, a title cell, a deal-name cell to build the title from.
- **Random.** outputs · deal name
- **Step 1 — Reference.** Reference the six outputs in one selection
- **Step 2 — Format.** Format each line
- **Step 3 — Title.** Build the title from the deal name cell · Bold it · Save
- **☆** The whole cover box from one selection.

### 8.7 Hand-off *(new · absorbs sheets + protect/print)*
- **Why.** The last thing every analyst does on every file, and nothing teaches it: values, colours, names, groups, a header that stays put, inputs on their own sheet, locked and printable.
- **Functions & keys.** Ctrl+Alt+V values + formats · Alt H F C (blue) · Ctrl+H · Alt+Shift+→ · F5 → Special → Formulas · Alt W F F (freeze) · Shift+F11 (new sheet) · Ctrl+PgUp / PgDn · Alt R P S (protect) · Alt P R S (print area)
- **On the grid.** A finished outputs page carrying live formulas and the project codename, a detail band below it, a header row, an inputs block mixed into the build, and the client's name in a note.
- **Random.** codename · which cells are hardcodes
- **Step 1 — Values.** Paste the outputs page as values · Blue the hardcodes it now carries · Replace the codename with the client name everywhere
- **Step 2 — Structure.** Group and fold the detail · Move the inputs block to its own sheet and re-point the build · Freeze the header row
- **Step 3 — Lock and print.** Confirm no remaining formula reaches off-page · Unlock the inputs and protect the sheet · Set the print area and fit to one page · Save
- **☆** Values and formats pasted in one Paste Special visit.
- `engine:` freeze panes, multiple sheets, protect sheet, print setup

### 8.8 Ship the Model *(capstone · new)*
- **Why.** A mini three-statement model plus a headline box: drivers, both sides, the cash link, the zero check, a values hand-off.
- **Functions & keys.** everything in chapter 8
- **On the grid.** A mini three-statement model with a driver panel and a headline box; a blank hand-off page beside it.
- **Random.** drivers
- **Step 1 — Build.** Drivers to statements · Cash link · Zero check
- **Step 2 — Ship.** Hand-off page as values · Save
- **☆** The hand-off page pasted as values with formats in one visit.

---

## Counts and the engine

| chapter | drills | needs engine work |
|---|---|---|
| 1 Foundations | 8 | — |
| 2 Formatting | 6 | conditional formatting, freeze panes |
| 3 Formulas I | 9 | DATEDIF, IFS, NETWORKDAYS, SWITCH, named ranges, text-to-columns |
| 4 Data & Lookups | 9 | AVERAGEIFS, Excel Tables, MAXIFS, MINIFS, XLOOKUP, data validation, pivot tables, remove duplicates |
| 5 Formulas II | 7 | evaluate (F9), trace precedents / dependents |
| 6 Models I | 7 | PMT, data table, goal seek |
| 7 Models II | 7 | — |
| 8 Full Builds | 8 | freeze panes, multiple sheets, print setup, protect sheet |
| **total** | **61** | AVERAGEIFS, DATEDIF, Excel Tables, IFS, MAXIFS, MINIFS, NETWORKDAYS, PMT, SWITCH, XLOOKUP, conditional formatting, data table, data validation, evaluate (F9), freeze panes, goal seek, multiple sheets, named ranges, pivot tables, print setup, protect sheet, remove duplicates, text-to-columns, trace precedents / dependents |

## What to decide

1. **The count.** Every drill is now a full page with three steps; sibling mechanics share a page. Say if any chapter still reads thin or any drill reads padded.
2. **The engine-work order.** By teaching value per day: named ranges → tables & validation → conditional formatting → remove duplicates → sheets → freeze / protect / print → goal seek & data table → pivot → trace / evaluate. Drills that need one are built after it lands; everything else can start now.
3. **Build order.** Foundations tutorials 2–4 first, then chapter by chapter, five drills per PR, the variety guards flipped to failures at the end.
