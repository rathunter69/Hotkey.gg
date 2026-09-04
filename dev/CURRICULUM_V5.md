# CURRICULUM V5 — the whole of desk Excel, drill by drill (conceptual)

_2026-09-04 · a concept document, no code. Written for Wolf's direction: "cover the entire breadth of Excel
functions a normal course would cover … grouped broadly by the most functional groupings … targeting the
investment banking candidate and the mid-career professional … shell out the curriculum section by section
and then drill by drill explaining how the concept will be taught and gamified and the steps involved."
Charts are excluded by decision. This supersedes CATALOG_V4 §3–§4 as the plan; V4 §1–§2 (the findings and
the variety principles) still hold._

---

## 0 · How to read this

**The two players.** *The candidate* is preparing for banking or consulting and needs to be fast on a model.
*The professional* lives in budgets, headcount files, exports and trackers and needs the hours back. Every drill
names which of them the scenario is written for; the skill is the same for both.

**The game loop, once, so each drill below can assume it.** A drill is one spreadsheet page with a job to do.
The checklist on the right lists the outcomes to reach; it is grouped into two to four **steps**, and the next
step's part of the page appears when the previous step is done. The **guide panel** shows the key for each
outcome and one line on why (open by default in the first section, a toggle everywhere else). If the player
presses the wrong keys three times, a **hint** offers itself: first the idea, then the key, then it lights the
cell to act on. The **clock** runs from the first key; the run posts to that drill's leaderboard and pays
experience toward the player's level. One hidden **☆** per drill rewards the efficient route: the same page
gets built either way, but the player who finds the pro move gets the star. A player is never blocked: any
correct route clears an outcome, the slow way just costs seconds.

**Sections.** Eleven, in learning order, each one a desk function. A section ends when the player can do the
thing on a real file. Six sections close with a **capstone**: a bigger page that chains everything the section
taught, which opens the next section's milestone.

**Per drill, the same seven lines:** concept · why it matters · the page · taught · gamified · the steps · ☆.
Engine notes are kept to a tag: `[engine]` means the site's spreadsheet would need new work to grade it.

---

## Section 1 · Navigate & Select — moving without the mouse

_After this section the player never reaches for the mouse to get somewhere or to grab something._

### 1.1 Navigate & Select *(tutorial — built)*
- **Concept.** Jumping to the edge of data, and growing a selection from where you stand.
- **Why.** Every other skill starts with getting to the cell and selecting the right block. This is the ten
  seconds a banker saves a hundred times a day.
- **The page.** A walled corridor to a sales table (candidate and professional alike — it is the first minute).
- **Taught.** Guide open; each straightaway of the corridor is one Ctrl+arrow; then the table asks for a row, a
  column, the whole block, and every typed number.
- **Gamified.** Three steps: the corridor, the captures, the run home. Checkpoints light as you pass.
- **Steps.** 1 Fly each hall in one press. 2 Land on the model block. 3 Select the West row. 4 Select the Q3
  column. 5 Select the whole table. 6 Select every typed figure (Go To Special). 7 Copy the block. 8 Deliver it
  to the home bay. 9 Save.
- **☆** Every hall in one press, never cell by cell.

### 1.2 Go To & Find
- **Concept.** Going straight to a named place or a class of cells (Go To, Go To Special) and finding text
  (Find, Find All).
- **Why.** On a 60-row vendor list or a 20-tab model, scrolling is how time disappears. Go To Special is the
  fastest thing in Excel nobody teaches.
- **The page.** A vendor cost list with blanks in the cost column, three vendor codes that changed, and one
  formula hiding among typed values (professional).
- **Taught.** The guide shows F5 and the Special dialog's three options: blanks, constants, formulas.
- **Gamified.** Step 1 reach; step 2 sweep; step 3 close. The blank count on the checklist falls as zeros land.
- **Steps.** 1 Go to the cell the note names. 2 Find the first vendor that still says ACME. 3 Select every blank
  in the cost column at once and enter 0 into all of them. 4 Select every formula on the page and colour it
  black. 5 Return to the top. 6 Save.
- **☆** All the blanks filled with one entry (select the blanks, type 0, Ctrl+Enter).

### 1.3 Big Sheet
- **Concept.** Moving around a page taller and wider than the screen: Home, End, page up and down, the name
  box, and coming back to A1.
- **Why.** Real files are 400 rows. The candidate who can get to the bottom-right total without scrolling reads
  as someone who has done this before.
- **The page.** A 300-row transaction export with a summary block far below and a notes column far right.
- **Taught.** Guide shows Ctrl+End, Ctrl+Home, Ctrl+G with a cell address, page keys.
- **Gamified.** A touch-list of five far-apart cells; each lights when you land on it; a counter on the
  checklist.
- **Steps.** 1 Land on the last used cell. 2 Land on the cell named in the note by typing its address. 3 Read
  the value in the notes column and enter it in the summary. 4 Return to A1. 5 Save.
- **☆** No arrow key pressed more than twice in a row.

---

## Section 2 · Edit & Structure — changing what is on the page

_After this section the player can fix, move, reshape and fill a page without breaking it._

### 2.1 Edit & Repair *(tutorial)*
- **Concept.** Editing in place (F2), clearing, undo and redo, cut and paste, inserting and deleting rows and
  columns, grouping detail away.
- **Why.** The first thing anyone does with an inherited file is fix it. Undo is the safety net that lets you
  move fast.
- **The page.** A headcount roster back from review: a misspelt team, two figures in the wrong column, one note
  that is wrong about a cell that is actually right, three blocks to move to marked bays, a schedule missing a
  quarter and a line (professional).
- **Taught.** Guide open. The "undo trap": clearing the cell the note flags costs a checkpoint; Ctrl+Z gives
  it back — the player feels what undo is for.
- **Gamified.** Three steps: repairs, the dock, the missing floor. The bays are marked on the page with red
  "paste here" cues.
- **Steps.** 1 Fix the misspelt name in place. 2 Re-enter the two wrong figures. 3 Restore the cell you cleared
  by mistake. 4 Move each block to its bay. 5 Leave the shared block in both places. 6 Insert the missing
  quarter and line. 7 Delete the two squatter rows. 8 Fill the schedule from the built formula. 9 Fold the
  detail band away. 10 Save.
- **☆** Every block delivered with one cut, never copy-then-delete.

### 2.2 Paste Special
- **Concept.** Pasting only what you mean: values, formats, transpose, multiply or add onto existing numbers.
- **Why.** The candidate hands off decks as values; the professional receives data in the wrong shape every
  week. Paste Special is how both fix it in one motion.
- **The page.** A fee deck that arrived sideways, with one row in thousands, one row of costs shown positive,
  and a formatted block to copy the look from.
- **Taught.** The four routes in the guide: values, formats, transpose, multiply.
- **Gamified.** Each arriving block is a small puzzle with one right paste; wrong pastes do not light.
- **Steps.** 1 Transpose the fees into the table. 2 Divide the thousands row by 1,000 in place (paste-multiply).
  3 Flip the costs negative the same way. 4 Paste the look of the finished block onto the new one. 5 Paste the
  totals over themselves as values. 6 Save.
- **☆** The final deck pasted as values in one visit to the dialog.

### 2.3 Fill & Series
- **Concept.** Filling down and across, and letting Excel continue a series: months, years, quarters,
  numbered lines.
- **Why.** Building a five-year header by typing is the tell of a beginner. Filling is how a page grows.
- **The page.** A long-range plan frame with only two years typed and a reference column that stops after
  two numbers; a monthly cash calendar that needs twelve month labels (professional).
- **Taught.** Ctrl+D, Ctrl+R, and the fill-series command; the guide shows why a two-cell seed is enough.
- **Gamified.** The frame paints in as each run fills; the month row is a race against the clock only.
- **Steps.** 1 Fill the year header to the last column. 2 Fill the reference numbers down. 3 Continue the month
  labels to December. 4 Fill the formula row across the years. 5 Save.
- **☆** The whole frame filled with two fills, nothing typed after the seeds.

### 2.4 Structure
- **Concept.** Inserting and deleting rows and columns without breaking what refers to them; seeing totals
  recalculate.
- **Why.** Every schedule gets a line added the day before it goes out. Doing it cleanly, with the SUM still
  covering the new line, is a mark of care.
- **The page.** An opex schedule with a line staged below it, a placeholder row, a draft column between the
  quarters, and a missing quarter staged at the side.
- **Taught.** Select the whole row or column first (Shift+Space / Ctrl+Space), then insert or delete.
- **Gamified.** Red "insert here" cues on the page; the SUM under the block is watched and named on the
  checklist: it must include the new line.
- **Steps.** 1 Insert a row where the cue points and paste the staged line. 2 Delete the placeholder row. 3 Delete
  the draft column. 4 Insert the missing quarter and paste it. 5 Confirm the total now covers the new line.
  6 Save.
- **☆** Every insert and delete from the keyboard shortcut, never the ribbon.

### 2.5 Hide, Group & Outline
- **Concept.** Hiding rows and columns, unhiding what someone else hid, grouping detail so a page reads at two
  levels.
- **Why.** Models are read by people who want the summary and auditors who want the detail. Grouping serves
  both without two files.
- **The page.** A regional tape from the analyst who left: detail rows buried, one column hidden, three regions
  that should fold to one line each.
- **Taught.** Unhide with the selection spanning the gap; group with Alt+Shift+Right; fold and unfold with the
  outline keys.
- **Gamified.** Step 1 is discovery (find what is hidden); step 2 builds the outline; step 3 proves it folds.
- **Steps.** 1 Unhide the buried detail rows. 2 Unhide the hidden column. 3 Group each region's detail. 4 Fold
  all the detail away. 5 Unfold one region to check it. 6 Bold the consolidated line. 7 Save.
- **☆** All three regions folded with one outline-level key.

### 2.6 Clipboard Moves
- **Concept.** The small edits that add up: copy the cell above (Ctrl+D on one cell), fill a selection with
  one entry (Ctrl+Enter), a line break inside a cell (Alt+Enter), today's date (Ctrl+;).
- **Why.** These are the moves that separate someone who "knows Excel" from someone who is fast in it.
- **The page.** A project tracker with a status column to stamp, an owner column to repeat, a notes cell that
  needs two lines, and a "last updated" cell (professional).
- **Taught.** Four tiny lessons on one page; the guide shows each key once.
- **Gamified.** Each move is its own outcome; a counter shows the four found.
- **Steps.** 1 Stamp "Done" into every selected status cell in one entry. 2 Repeat the owner down the block by
  copying the cell above. 3 Put the two-line note on two lines inside its cell. 4 Enter today's date without
  typing it. 5 Save.
- **☆** All four in under ten keystrokes total.

---

## Section 3 · Format — making the page readable and house-standard

_After this section the player's pages look like they came from someone who has worked on a desk._

### 3.1 Format the Page *(tutorial)*
- **Concept.** Number formats, the input colour convention, borders on totals, column widths.
- **Why.** Formatting is not decoration: it is how a reader knows what is typed, what is calculated, and where
  the totals are.
- **The page.** The budget from the First Formulas tutorial, unformatted.
- **Taught.** Guide open; each format follows the beat that created the cells it dresses.
- **Gamified.** The page visibly becomes the "before/after" as steps clear.
- **Steps.** 1 Comma-format the body. 2 Percent-format the margin rows. 3 Colour every typed input blue. 4 Top
  border on the totals. 5 Widen the label column to fit. 6 Save.
- **☆** Every typed input found in one Go To Special rather than by eye.

### 3.2 Typeset
- **Concept.** Bold, italic, font colour, and where each belongs.
- **Why.** A memo with the wrong things bold reads as careless.
- **The page.** A coverage memo with a flat header, a body line bold by mistake, notes that read like data, a
  discontinued item unflagged.
- **Taught.** The guide's one line: headers bold, notes italic, red means look here.
- **Gamified.** Order-free showcase; each fix is an outcome.
- **Steps.** 1 Bold the header row. 2 Unbold the imposter line. 3 Italicise the three notes. 4 Colour the
  discontinued line red. 5 Enter today's date in the date cell. 6 Save.
- **☆** All three notes italicised in one selection.

### 3.3 Number Formats & Decimals
- **Concept.** Commas, currency, percentages, decimal places, and consistency down a column.
- **Why.** A comps page with cents in one column and none in the next is the first thing a VP notices.
- **The page.** A comps page: dollars carrying cents, a multiple with no decimal, a margin at three places, one
  cell hand-formatted longer than its neighbours.
- **Taught.** The guide pairs each format with its key; the odd cell is found by looking, then by Go To Special
  on the replay.
- **Gamified.** The page gets tidier column by column; the odd cell is the one hunt.
- **Steps.** 1 Set the three dollar columns to zero decimals. 2 Set the multiple to one decimal. 3 Set the margin
  to one decimal. 4 Fix the hand-formatted cell. 5 Bold the median row. 6 Save.
- **☆** All three dollar columns set from one selection.

### 3.4 Custom Formats
- **Concept.** The Format Cells dialog: multiples as 8.2x, dates as Jan-26, negatives in parentheses,
  superscript footnote marks, centre across selection.
- **Why.** The house look is mostly custom formats. Knowing the dialog is worth a dozen shortcut keys.
- **The page.** A valuation summary where the multiples read 8.2, the dates read 45123, the negatives read with
  a minus, the footnote is a typed 1, the title sits in one cell.
- **Taught.** The guide shows Ctrl+1 and the four tabs the drill uses.
- **Gamified.** Five before/after cells; each flips as its format lands.
- **Steps.** 1 Format the multiples as 0.0x. 2 Format the date column Mmm-yy. 3 Show negatives in parentheses
  across the body. 4 Superscript the footnote mark. 5 Centre the title across the block. 6 Save.
- **☆** Three number formats from three dialog visits, not five.

### 3.5 Borders & Rulings
- **Concept.** Top borders on totals, bottom borders under headers, outside boxes, thick and double rules, and
  the difference between "outside" and "all".
- **Why.** Borders are the grammar that says "this row is computed". The wrong border is a wrong sentence.
- **The page.** A finished schedule with four planted ruling mistakes and a raw block beside it that needs its
  rulings.
- **Taught.** The guide shows the five border keys; the checklist discloses "four mistakes".
- **Gamified.** Disclosed-error meter for the audit half; the raw block is the apply half.
- **Steps.** 1 Find and fix the four wrong rulings. 2 Bottom-border the header of the raw block. 3 Top-border
  its total. 4 Box the whole block. 5 Double-rule under the grand total. 6 Save.
- **☆** Only the four wrong cells touched; healthy cells untouched.

### 3.6 Alignment & Widths
- **Concept.** Numbers right, headers centred, labels left, indent for hierarchy, wrap text, autofit and set
  width, and what #### means.
- **Why.** A page that prints with #### or a squeezed label column is unusable.
- **The page.** A regional revenue print page: label columns squeezed, quarter columns four widths, headers
  slumped left, sub-lines unindented, one long header that should wrap.
- **Taught.** Alignment keys and the width commands; the guide explains #### once.
- **Gamified.** The page "prints" cleanly when done; the checklist watches for any remaining ####.
- **Steps.** 1 Autofit the label columns. 2 Set the four quarter columns to one width. 3 Centre the headers. 4
  Indent the sub-lines. 5 Wrap the long header. 6 Save.
- **☆** Both label columns fitted in one command.

### 3.7 Conditional Formatting `[engine]`
- **Concept.** Rules that colour cells by value: highlight over-budget lines, shade the top ten, data bars.
- **Why.** The professional's monthly report lives on this; the candidate uses it for covenant flags.
- **The page.** A budget-vs-actual with a variance column and no visual cue.
- **Taught.** The rules dialog by keyboard; the guide shows highlight and top-N.
- **Gamified.** The page lights up as rules land; the checklist counts the rules in force.
- **Steps.** 1 Highlight every variance over 5% red. 2 Shade the ten largest lines. 3 Add data bars to the
  actuals. 4 Clear the rule from the total row. 5 Save.
- **☆** One rule covering the whole block instead of three.

### 3.8 House Style ★ *(capstone)*
- **Concept.** All of the above on one raw page.
- **The page.** A raw P&L fragment going in the book tonight.
- **Steps.** 1 Bold the title and headers. 2 Colour every typed input blue. 3 Comma-format the body. 4
  Percent-format the margins. 5 Top-border the totals. 6 Set the label column wide. 7 Custom-format the
  multiple line. 8 Save.
- **☆** Every hardcode found in one Go To Special pass.

---

## Section 4 · Formulas & References — building live calculations

_After this section the player builds formulas that fill a block from one cell and never retypes a number._

### 4.1 First Formulas *(tutorial)*
- **Concept.** Entering a formula, SUM and AutoSum, relative references, anchoring with F4, signs on costs.
- **Why.** The whole product sits on this: a formula written once and filled everywhere.
- **The page.** A department budget with the totals stripped, a margin row to build, and a share-of-total
  block that needs one anchored formula.
- **Taught.** Guide open; the anchor step shows the same formula with and without the dollar signs and what
  happens on fill.
- **Gamified.** Three steps: totals, margin, the anchored block; the block paints in on the fill.
- **Steps.** 1 Total the first quarter with AutoSum. 2 Build the margin. 3 Make the cost lines carry their sign.
  4 Build one share formula anchored to the total. 5 Fill it across the block. 6 Save.
- **☆** One anchored formula fills the whole block.

### 4.2 Anchors
- **Concept.** Relative, absolute and mixed references, and cycling them with F4.
- **Why.** Mixed anchors are the difference between a grid built in one fill and one built by hand.
- **The page.** A 3×3 pricing grid: tiers down, price points across, one formula to write.
- **Taught.** The guide shows the four F4 states and which the grid needs.
- **Gamified.** The grid is empty; one correct formula lights all nine on fill; a wrong anchor lights one.
- **Steps.** 1 Build the first quote with the row and column anchored the right way. 2 Fill it down. 3 Fill it
  across. 4 Dollar-format the grid. 5 Box it. 6 Save.
- **☆** The whole grid from one entry and two fills.

### 4.3 Point Mode
- **Concept.** Building a formula by pointing at cells, especially yellow assumption cells, so nothing is
  typed twice.
- **Why.** Typed numbers inside formulas are the number-one model error. Pointing is the habit that prevents it.
- **The page.** A five-year operating plan with one year of revenue and the growth, margin and D&A assumptions
  in yellow cells above.
- **Taught.** The guide shows a formula built by arrow keys; a typed-number formula is flagged by the audit
  colour later.
- **Gamified.** The plan grows year by year; a "typed number" counter must read zero at the end.
- **Steps.** 1 Colour the starting revenue blue. 2 Build next year's revenue off the growth cell. 3 Fill it
  across. 4 Build EBITDA off the margin cell. 5 Fill it across. 6 Save.
- **☆** Every assumption referenced by pointing; no number typed into a formula.

### 4.4 Ratios & Growth
- **Concept.** Margins, shares, growth rates, and compound growth (the exponent).
- **Why.** These are the four numbers every page ends with.
- **The page.** A peer coverage page with revenue for two years, EBITDA and EV, three empty ratio columns.
- **Taught.** One formula each; the CAGR line shows the exponent once.
- **Gamified.** Three columns paint in; the highest CAGR must be bolded at the end (a read, not a calculation).
- **Steps.** 1 Build the margin column. 2 Build the growth column. 3 Build the CAGR column. 4 Percent-format all
  three. 5 Bold the highest CAGR. 6 Save.
- **☆** The CAGR built once with the year count anchored, then filled.

### 4.5 Foot
- **Concept.** Totals across, totals down, the corner total, and a tie check that reads zero.
- **Why.** A page that does not foot is a page nobody trusts.
- **The page.** A segment pack with every total stripped.
- **Taught.** AutoSum on a selection; the tie check is a one-line formula.
- **Gamified.** The corner total lights only when both directions agree.
- **Steps.** 1 Total every segment line across. 2 Total every quarter down. 3 Total the corner. 4 Enter the tie
  check. 5 Bold the total row and top-border it. 6 Save.
- **☆** Both total lines with one AutoSum each.

### 4.6 Named Ranges `[engine]`
- **Concept.** Naming a cell or block and using the name in formulas.
- **Why.** A formula that reads =Revenue*Margin is readable by the next person.
- **The page.** A driver block and a build that refers to it by address.
- **Taught.** The name box and the name manager by keyboard.
- **Steps.** 1 Name the tax rate cell. 2 Name the growth cell. 3 Rebuild the tax line using the name. 4 Rebuild
  the growth line using the name. 5 Save.
- **☆** Both names created from the name box without opening the manager.

### 4.7 Close the Quarter ★ *(capstone)*
- **Concept.** One quarterly P&L page: point mode, AutoSum, anchored percentages, growth, a conditional-sum memo.
- **Steps.** 1 Build the totals. 2 Build the margins with one anchored formula. 3 Build year-over-year growth.
  4 Build the segment memo with SUMIF. 5 Format as you go. 6 Save.
- **☆** No number typed into any formula.

---

## Section 5 · Lookups & Aggregates — pulling numbers from somewhere else

_After this section the player can read any table into any page and summarise a ledger without a pivot._

### 5.1 Lookup
- **Concept.** VLOOKUP first, then INDEX/MATCH when the columns move, then XLOOKUP as the modern one.
  `[engine: XLOOKUP]`
- **Why.** The single most-asked Excel skill in interviews and the one the professional uses to join two lists.
- **The page.** A peer table and a three-line pitch screen that must read one metric by name; the columns
  re-order on the replay.
- **Taught.** Three tiers on one page: VLOOKUP works, then the table re-orders and only INDEX/MATCH survives,
  then XLOOKUP does both in one.
- **Gamified.** The tier ladder: the re-ordered table appears when tier one clears and breaks the VLOOKUP
  visibly.
- **Steps.** 1 Read the first metric with VLOOKUP. 2 Fill the screen. 3 Rebuild the read with INDEX/MATCH after
  the columns move. 4 Rebuild it once more with XLOOKUP. 5 Colour the reads green. 6 Save.
- **☆** The whole screen filled from one lookup formula.

### 5.2 Two-way Lookup
- **Concept.** INDEX with two MATCHes: find the row and the column.
- **Why.** A segment-by-quarter tape where nothing sits where it sat last week.
- **The page.** Five segments against five quarters; the cards name a segment and a quarter.
- **Steps.** 1 Enter the missing quarter header. 2 Build the first card read. 3 Fix it when the tape re-sorts.
  4 Build the second card off the same formula. 5 Top-border the cards. 6 Save.
- **☆** Every card answered from one anchored read.

### 5.3 SUMIF & COUNTIF
- **Concept.** Summing and counting by a condition.
- **Why.** The professional's "how much did we spend on travel" and the candidate's "revenue by segment".
- **The page.** A raw booking ledger and an empty summary block.
- **Steps.** 1 Total each segment with SUMIF. 2 Count each segment's bookings with COUNTIF. 3 Build the share of
  total. 4 Percent-format it. 5 Save.
- **☆** The summary column filled from one anchored SUMIF.

### 5.4 SUMIFS Cross-tab
- **Concept.** Two conditions at once, and a mixed-anchored formula that fills a whole grid.
- **The page.** Segment × region from a one-line-per-booking ledger.
- **Steps.** 1 Build the corner cell with both conditions anchored. 2 Fill the grid. 3 Box it. 4 Enter the
  reconciliation check to the ledger total. 5 Save.
- **☆** The entire cross-tab from one formula.

### 5.5 Screens (MAXIFS, MINIFS, AVERAGEIFS) `[engine]`
- **Concept.** The largest, smallest and average that meet a condition.
- **Why.** "Biggest deal in healthcare", "average tenure in sales" — the questions a VP asks on the phone.
- **The page.** A coverage pipeline with three question cards.
- **Steps.** 1 Answer the largest-in-sector card. 2 Answer the smallest-at-status card. 3 Answer the average
  card. 4 Bold the answers. 5 Save.
- **☆** All three from a single row of formulas filled across.

### 5.6 Recon
- **Concept.** Reconciling two lists: what is missing, what differs, and a difference column that totals to
  zero.
- **Why.** Month-end.
- **The page.** A deal blotter against a finance extract that disagrees.
- **Steps.** 1 Build the "in finance" column with a lookup. 2 Add the missing deal. 3 Build the difference
  column. 4 Fix the one amount that is wrong. 5 Total the difference to zero. 6 Save.
- **☆** The missing deal copied across, name and amount, in one paste.

### 5.7 The Data-Room Tape ★ *(capstone)*
- **Concept.** A dirty export becomes a sendable summary: delete junk, sort, filter, look up, summarise, group.
- **Steps.** 1 Delete the junk rows. 2 Sort by size. 3 Look up the sector for each deal. 4 Summarise by sector
  with SUMIFS. 5 Group the detail. 6 Save.
- **☆** The junk rows found with one Go To Special on blanks.

---

## Section 6 · Text & Dates — the professional's daily mess

_After this section the player can clean an export and build a date-driven schedule without touching the mouse._

### 6.1 Text Clean-up
- **Concept.** TRIM, PROPER, UPPER and LOWER, and pasting the result back as values.
- **Why.** Every HR, CRM and vendor export arrives with stray spaces and shouting capitals.
- **The page.** An HR export with trailing spaces in codes and names in capitals.
- **Steps.** 1 Trim the codes in a helper column. 2 Proper-case the names. 3 Paste both back as values over
  the source. 4 Delete the helper columns. 5 Save.
- **☆** One helper column does both, pasted back in one motion.

### 6.2 Split & Extract
- **Concept.** LEFT, RIGHT, MID with FIND; text-to-columns for the same job without a formula. `[engine:
  text-to-columns]`
- **The page.** A "LAST, first" name column, a product code whose middle three characters are the region, a
  full-address column.
- **Steps.** 1 Pull the last name with LEFT and FIND. 2 Pull the first name with MID. 3 Pull the region code
  from the product code. 4 Split the address with text-to-columns. 5 Save.
- **☆** First and last names from one pair of formulas filled down.

### 6.3 Build the Key
- **Concept.** Joining text: the ampersand, CONCAT, TEXTJOIN; building an email, a lookup key, a label with a
  number formatted inside it (TEXT). `[engine: TEXTJOIN, TEXT]`
- **Why.** Joining two lists usually needs a key that exists on neither.
- **The page.** A roster that needs first.last@company emails and a "Region-Product" key to match against a
  second list.
- **Steps.** 1 Build the email. 2 Build the key. 3 Build the label "Revenue: $1,200" with the number formatted
  inside it. 4 Match the second list on the key. 5 Save.
- **☆** The key built once and used by the lookup without a helper.

### 6.4 Dates
- **Concept.** Dates as numbers; TODAY, EDATE, EOMONTH, DATEDIF, NETWORKDAYS; the Mmm-yy format. `[engine:
  DATEDIF, NETWORKDAYS]`
- **Why.** Contract renewals, tenure, days to close, month-end schedules.
- **The page.** A contract list with start dates and terms; renewal, months remaining and business days to
  renewal all empty.
- **Steps.** 1 Build the renewal date with EDATE. 2 Snap it to month-end. 3 Count the months remaining. 4 Count
  the business days to renewal. 5 Format the dates Mmm-yy. 6 Flag anything renewing this quarter. 7 Save.
- **☆** All four date columns filled from one row of formulas.

### 6.5 13-Week Cash
- **Concept.** A weekly calendar built from one date, and a schedule keyed to it.
- **The page.** A 13-week cash roll with the week headers missing.
- **Steps.** 1 Build week two's date from week one. 2 Fill the header to week 13. 3 Total each flow line. 4 Build
  the roll from opening to closing. 5 Build the cushion line. 6 Save.
- **☆** The header and the roll each from one fill.

---

## Section 7 · Logic & Errors — making the page decide, and not break

_After this section the player can write a flag, a cap, a floor, a switch, and a page that survives a bad read._

### 7.1 Flags
- **Concept.** IF, AND, OR; a column that says something in words.
- **The page.** Budget vs actual with an empty flag column: over, under, or within tolerance.
- **Steps.** 1 Build the variance. 2 Flag every line over budget. 3 Add the tolerance condition with AND. 4
  Colour the flags red. 5 Count the flags. 6 Save.
- **☆** One IF(AND()) column instead of two helper columns.

### 7.2 Caps & Floors
- **Concept.** MIN and MAX as caps and floors; IFS and SWITCH for more than two outcomes. `[engine: IFS, SWITCH]`
- **The page.** A bonus pool: pay the lesser of the formula and the pool, never below zero, banded by grade.
- **Steps.** 1 Cap the bonus at the pool. 2 Floor the clawback at zero. 3 Band the grade with IFS. 4 Total the
  pool paid. 5 Save.
- **☆** Cap and floor in one formula.

### 7.3 IFERROR
- **Concept.** Wrapping a read that can fail, and knowing when not to.
- **Why.** A board pack that shows #N/A is embarrassing; one that hides a real error with a zero is worse.
- **The page.** Five lookup reads, three broken for three different reasons: one genuinely missing, one
  misspelt key, one wrong range.
- **Steps.** 1 Wrap the genuinely missing read to show a dash. 2 Fix the misspelt key. 3 Fix the wrong range.
  4 Total the panel. 5 Save.
- **☆** Both broken reads repaired in one fill with the wrapped one left intact.

### 7.4 Error Triage
- **Concept.** What #REF!, #DIV/0! and #VALUE! each mean and the fix for each.
- **The page.** A segment tab with three errors and eight red cells reading them.
- **Steps.** 1 Rebuild the total whose rows were deleted. 2 Guard the share line against a zero. 3 Fix the text
  that was typed where a number belongs. 4 Confirm the eight red cells clear. 5 Save.
- **☆** The total rebuilt in one fill across the quarters.

### 7.5 Scenario Switch
- **Concept.** A case cell that drives the page: CHOOSE or INDEX on the case number.
- **The page.** Three cases of growth and margin, one live driver row, an output table to snapshot.
- **Steps.** 1 Build the live driver off the case cell. 2 Build revenue and EBITDA off the driver. 3 Snapshot all
  three cases into the table as values. 4 Change the case and confirm the page moves. 5 Save.
- **☆** The driver block built once and filled down.

---

## Section 8 · Data Tools — the commands that replace an hour of work

_After this section the player reaches for sort, filter, dedupe, tables and pivots by keyboard._

### 8.1 Scrub
- **Concept.** Deleting junk rows, sorting by one and two keys, re-sorting after an insert.
- **The page.** A deal blotter export: a repeated header, a page-break line, a stale subtotal, a duplicate deal,
  and a seventh deal signed after the sort.
- **Steps.** 1 Delete the three junk rows. 2 Sort largest first. 3 Delete the duplicate. 4 Enter the late deal.
  5 Sort again by size then name. 6 Total and bold. 7 Save.
- **☆** The table selected to its last row in one press before every sort.

### 8.2 Filter
- **Concept.** AutoFilter, the picker by keyboard, reading a filtered total, clearing the filter.
- **The page.** A coverage pipeline with two questions to answer by filtering.
- **Steps.** 1 Turn on the filter. 2 Filter to one sector and enter the largest deal. 3 Clear it. 4 Filter to one
  status and enter the count and total. 5 Clear the filter. 6 Save.
- **☆** The first screen cleared without walking the picker back.

### 8.3 Remove Duplicates & Text-to-Columns `[engine]`
- **Concept.** Two dialogs that do what used to take a formula.
- **The page.** A mailing list with duplicates and a combined "city, state" column.
- **Steps.** 1 Remove the duplicate rows on email. 2 Split city and state. 3 Count the survivors. 4 Save.
- **☆** Duplicates removed on two columns at once.

### 8.4 Tables `[engine]`
- **Concept.** Ctrl+T: a range that grows, filters, and lets formulas refer to columns by name.
- **The page.** A transaction list that needs a total row and a formula that survives new rows.
- **Steps.** 1 Make the range a table. 2 Add the total row. 3 Build a column formula by name. 4 Add a row and
  confirm the total moves. 5 Save.
- **☆** The column formula written once for the whole column.

### 8.5 Pivot `[engine]`
- **Concept.** A pivot table by keyboard: fields to rows, columns and values; refresh.
- **Why.** The professional's summary tool; the candidate's data-room sanity check.
- **The page.** The booking ledger from 5.3, summarised by segment and region in a pivot instead of formulas.
- **Steps.** 1 Insert a pivot on the ledger. 2 Segment to rows, region to columns, amount to values. 3 Format
  the values. 4 Change a ledger line and refresh. 5 Save.
- **☆** The field list driven entirely by keyboard.

### 8.6 Data Validation `[engine]`
- **Concept.** A drop-down list on a cell; rejecting bad entries.
- **The page.** A tracker whose status column accepts anything.
- **Steps.** 1 Add a list to the status column. 2 Restrict the date column to this year. 3 Try a bad entry and
  see it refused. 4 Save.
- **☆** The list sourced from a named range.

---

## Section 9 · Audit & Repair — finding what is wrong in someone else's file

_After this section the player can take an inherited model and know what is typed, what is linked, and what is broken._

### 9.1 Review Pass
- **Concept.** Go To Special for constants and formulas, show formulas (Ctrl+`), the audit colours.
- **The page.** A divisional review with four disclosed problems and a check line already reading non-zero.
- **Steps.** 1 Find every typed-over cell with Go To Special. 2 Fix the total that stops short. 3 Re-point the
  margin formula. 4 Confirm the check line reads zero. 5 Save.
- **☆** Every hardcode found in one pass.

### 9.2 Trace & Evaluate
- **Concept.** Tracing precedents and dependents, evaluating a formula piece by piece (F9), stepping into a
  reference.
- **The page.** A wrong output with a chain of five formulas behind it, one of which is the culprit.
- **Steps.** 1 Trace the output back to its inputs. 2 Evaluate the suspect formula piece by piece. 3 Fix the
  culprit. 4 Confirm the output. 5 Save.
- **☆** The culprit found without editing any healthy cell.

### 9.3 Stale Links
- **Concept.** Re-pointing formulas at re-issued assumptions; the green link colour.
- **The page.** Assumptions re-issued as v2 with the v1 figures still beside them.
- **Steps.** 1 Find the three lines still on v1. 2 Re-point them at v2. 3 Colour the links green. 4 Clear the
  superseded figures. 5 Save.
- **☆** The contribution block rebuilt from one corner.

### 9.4 Make It Tie
- **Concept.** A balance sheet check row; finding why it does not read zero.
- **The page.** Four years of balance sheet, zeros pasted over the check row.
- **Steps.** 1 Rebuild the check row. 2 Find the year that breaks. 3 Fix the total that stops short. 4 Re-point
  the equity cell. 5 Confirm all four years tie. 6 Save.
- **☆** Only what broke touched.

### 9.5 Roll-forward Prep
- **Concept.** Find and replace at scale; pulling typed rates out of formulas into cells.
- **The page.** A build with the growth and cost rates typed inside its formulas and v1 tags everywhere.
- **Steps.** 1 Move each typed rate into an assumption cell. 2 Re-point the formulas at the cells. 3 Colour the
  inputs blue. 4 Replace every v1 tag with v2 in one action. 5 Save.
- **☆** All tags replaced in one dialog.

### 9.6 The Red-Flag Pass ★ *(capstone)*
- **Concept.** An inherited one-tab model with seven disclosed errors: a stale link, a sign flip, a hardcode, a
  short SUM, a wrong anchor, a circular reference, a typed number.
- **Steps.** 1–7 find and fix each; the meter fills. 8 Save.
- **☆** Every hardcode found in one Go To Special pass.

---

## Section 10 · Model Mechanics — the building blocks of a financial model

_After this section the candidate can build any schedule a model needs; the professional can build a
business case._

### 10.1 Roll Forward
- **Concept.** Opening + additions − reductions = closing; next period's opening references the last closing;
  interest off the beginning balance to avoid a circle.
- **The page.** One line of balances and an interest line that went circular.
- **Steps.** 1 Build the closing balance. 2 Reference next year's opening to it. 3 Build interest off the
  beginning balance. 4 Fill the roll. 5 Save.
- **☆** The whole corkscrew from one formula pair.

### 10.2 Fixed Assets
- **Concept.** The corkscrew applied: capex in, depreciation out, ending balance; a memo line.
- **Steps.** 1 Build depreciation. 2 Build the ending balance. 3 Reference each opening. 4 Build the accumulated
  depreciation memo. 5 Save.
- **☆** All four lines from one fill.

### 10.3 Interest & Coverage
- **Concept.** Interest on the beginning balance; coverage with a cap and a floor.
- **Steps.** 1 Build ending debt. 2 Build beginning debt. 3 Build cash interest. 4 Build coverage with MIN/MAX.
  5 Save.
- **☆** The coverage line in one formula.

### 10.4 Revolver
- **Concept.** MAX and MIN as draw and sweep.
- **Steps.** 1 Build the draw. 2 Build the sweep. 3 Build the ending balance. 4 Build post-revolver cash. 5 Save.
- **☆** The schedule across in one pass.

### 10.5 Waterfall
- **Concept.** Paying down tranches in order with MIN; nothing paid twice.
- **Steps.** 1 Total cash available. 2 Pay the senior tranche, never more than owed. 3 Pay the junior from what
  is left. 4 Roll both forward. 5 Enter the check: applied equals repaid. 6 Save.
- **☆** The junior tranche built by copying the senior pair.

### 10.6 Statistics (WACC)
- **Concept.** MEDIAN, AVERAGE, MAX, MIN over a peer set; anchoring a rate.
- **Steps.** 1 Unlever each beta with the tax rate anchored. 2 Take the median. 3 Relever. 4 Build cost of
  equity. 5 Build WACC. 6 Save.
- **☆** The unlevering column from one anchored formula.

### 10.7 Discounting (DCF)
- **Concept.** Discount factors with the exponent; present value; terminal value.
- **Steps.** 1 Build the discount factor row. 2 Build present values. 3 Build terminal value. 4 Discount it.
  5 Total enterprise value. 6 Save.
- **☆** Every factor from one formula with the rate anchored.

### 10.8 NPV & IRR
- **Concept.** NPV, IRR, payback; PMT for a loan. `[engine: PMT]`
- **The page.** A capex proposal with a cash-flow line and an empty decision box (professional).
- **Steps.** 1 Build NPV at the hurdle. 2 Build IRR. 3 Build the payback year. 4 Build the monthly payment on the
  financing. 5 Flag the decision. 6 Save.
- **☆** NPV built once and re-used by the flag.

### 10.9 Sensitivity
- **Concept.** A two-way grid from one mixed-anchored formula; the what-if data table as the second route.
  `[engine: data table]`
- **Steps.** 1 Build the corner cell. 2 Fill the grid. 3 Build the same grid as a data table. 4 Comma-format.
  5 Box it. 6 Save.
- **☆** All fifteen cells from one formula.

### 10.10 Goal Seek `[engine]`
- **Concept.** Solving for an input that makes an output hit a target.
- **Steps.** 1 Seek the price that makes NPV zero. 2 Seek the growth that makes EBITDA hit the target. 3 Record
  both. 4 Save.
- **☆** Both seeks without touching the mouse.

### 10.11 Comps
- **Concept.** Multiples, the implied range, MEDIAN/MIN/MAX over a set, the 0.0x format.
- **Steps.** 1 Build all multiples with one entry over the block. 2 Build median, high, low. 3 Build implied
  values. 4 Format the multiples 0.0x. 5 Save.
- **☆** All ten multiples from one Ctrl+Enter.

### 10.12 Accretion / Dilution
- **Concept.** One analysis copied across three structures; a block moved as a unit.
- **Steps.** 1 Build the first structure. 2 Copy the block onto the other two. 3 Build the accretion line. 4
  Percent-format. 5 Save.
- **☆** The block copied onto both structures in one paste.

### 10.13 Returns Bridge
- **Concept.** Attribution: three levers that sum to the total, with a check.
- **Steps.** 1 Build each lever. 2 Total them. 3 Build the share column. 4 Enter the check. 5 Save.
- **☆** The share column from one anchored formula.

### 10.14 Full Waterfall ★ *(capstone)*
- **Concept.** Three facilities, four years, seniority, roll-forwards, interest, a zero check.
- **☆** The sanity check entered: repaid equals applied.

---

## Section 11 · Ship — getting the file out of the door

_After this section the player can hand a file to a client, a boss or a printer and nothing breaks._

### 11.1 Model Cover
- **Concept.** A cover page that references outputs and never retypes them; Ctrl+Enter over a block.
- **Steps.** 1 Reference the six outputs. 2 Format each line. 3 Build the title from the deal name cell. 4 Bold
  the title. 5 Save.
- **☆** The whole cover box from one selection.

### 11.2 Three Statements
- **Concept.** Wiring net income to cash flow, cash to the balance sheet, retained earnings to the year; the
  check row.
- **Steps.** 1 Reference net income into the cash flow. 2 Build the cash link. 3 Build the retained earnings
  roll. 4 Build the check row. 5 Save.
- **☆** All four built lines from one fill each.

### 11.3 Hand-off
- **Concept.** Paste as values, colour the hardcodes, replace the codename, group the detail, confirm no formula
  reaches off the page, freeze the header. `[engine: freeze panes]`
- **Steps.** 1 Paste the outputs page as values. 2 Blue the hardcodes it now carries. 3 Replace the codename
  with the client name everywhere. 4 Group and fold the detail. 5 Go to every remaining formula and confirm
  none reaches off-page. 6 Freeze the header. 7 Save.
- **☆** Values and formats pasted in one Paste Special visit.

### 11.4 Sheets `[engine]`
- **Concept.** Moving between sheets, inserting and renaming one, a formula that reads another sheet.
- **Steps.** 1 Insert a sheet and name it. 2 Move the inputs block to it. 3 Re-point the build at the new sheet.
  4 Return to the summary. 5 Save.
- **☆** Every sheet change by keyboard.

### 11.5 Protect & Print `[engine]`
- **Concept.** Locking the input cells, protecting the sheet, setting the print area and fitting to one page.
- **Steps.** 1 Unlock the yellow inputs. 2 Protect the sheet. 3 Set the print area. 4 Fit to one page wide. 5
  Save.
- **☆** Inputs unlocked in one Go To Special selection.

### 11.6 Ship the Model ★ *(capstone)*
- **Concept.** A mini three-statement model plus a headline box: drivers, both sides, the cash link, the zero
  check, a values hand-off.
- **☆** The hand-off page pasted as values with formats in one visit.

---

## 12 · Counts and the engine

| section | drills | capstone | needs engine work |
|---|---|---|---|
| 1 Navigate & Select | 3 | — | — |
| 2 Edit & Structure | 6 | — | — |
| 3 Format | 8 | House Style | conditional formatting |
| 4 Formulas & References | 7 | Close the Quarter | named ranges |
| 5 Lookups & Aggregates | 7 | Data-Room Tape | XLOOKUP, MAXIFS/MINIFS/AVERAGEIFS (small) |
| 6 Text & Dates | 5 | — | TEXTJOIN, TEXT, DATEDIF, NETWORKDAYS, text-to-columns (small) |
| 7 Logic & Errors | 5 | — | IFS, SWITCH (small) |
| 8 Data Tools | 6 | — | remove duplicates, tables, pivot, validation |
| 9 Audit & Repair | 6 | Red-Flag Pass | trace / evaluate (partial today) |
| 10 Model Mechanics | 14 | Full Waterfall | PMT (small), data table, goal seek |
| 11 Ship | 6 | Ship the Model | freeze panes, sheets, protect/print |
| **total** | **73** | 6 | small adds ≈ 12 functions; larger builds: conditional formatting, named ranges, tables, pivot, validation, data table, goal seek, sheets, protect/print |

**Existing drills carried in** (same lesson, sometimes a re-cut): navigation, pastes, series, rowops→Structure,
unhide, typeset, decimals, center+autofit→Alignment & Widths, ruleaudit→Borders & Rulings, customfmt (new),
housestyle, anchor, bridge→Point Mode, margin+cagr→Ratios & Growth, foot, lookup, lookup2, sumif, rollup,
recon, scrub, filterpass, audit→Review Pass, stalelink, balcheck→Make It Tie, versionup→Roll-forward Prep,
triage, wrapfix, cases→Scenario Switch, schedule→Fixed Assets, intsched, revolver, waterfall, cascade, wacc,
dcf, comps, accdil, retbridge, dcfsens→Sensitivity, wk13, dashcover→Model Cover, threestmt, plus the five v3
capstones. The v4 retirements stand.

## 13 · What to decide

1. **Section count and order.** Eleven sections, learning order as listed. Or fold 1+2 into a "Foundations"
   and 10+11 into "Models" to land nearer the eight chapters players know.
2. **The engine-work list.** Nine larger builds. Recommended order by teaching value per day of work: named
   ranges → tables → conditional formatting → remove duplicates & validation → sheets → freeze/protect/print →
   goal seek & data table → pivot.
3. **73 drills.** The count follows the syllabus. Say if you want it tighter; the merge candidates are 10.2
   into 10.1, 5.5 into 5.3, 11.5 into 11.3.
