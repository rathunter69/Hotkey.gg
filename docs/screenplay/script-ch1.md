# hotkey.gg Script · Chapter 1: Foundations

Every line a learner reads inside Chapter 1: the story cards, and for each lesson its brief, done screen and goals with their teach lines and stuck cues. The master design doc is the **hotkey.gg Screenplay** (claude/screenplay.md in this project); its Voice section decides how all of this should sound. Rebuilt from the live sheets on 2026-09-27 (rebuild branch). Every module is rewritten in the voice and re-skinned to Clearcoat Express (see the master, sections 2, 4 and 5); the stacked-fragment sweep of 2026-09-27 (section 2) is applied to every story card and done screen. Lives here, in the project, as claude/script-ch1.md; the Google Doc of the same name is the 2026-09-27 snapshot it was migrated from and is no longer edited.

## How to edit this script

  - Edit a line where it stands. Everything here without a status tag is **LIVE**: the text on the site today. The conversion session compares this doc with the live sheets, so any line you change is picked up and any line you leave is kept.
  - **DRAFT** lines are Claude's proposals; the *was:* line under each is the live text it would replace. Say "lock 1.1" (or a lesson, or a line) in chat to approve, or change DRAFT to **LOCKED** here. To reject, say so or delete the draft and keep the was line.
  - **TBD** marks an empty slot the site can show. As of 2026-09-27 every lesson has its done screen and every goal its teach line and stuck cue; the why field is retired (M28).
  - Module objectives: the Learn page currently shows a hardcoded blurb from content/index.js instead of the objective here (Screenplay, Mechanics request M2). Edit the objective anyway; M2 makes it the one that shows.
  - The italic line under each heading is a key. It maps the line back to the sheet. Leave keys, lesson ids and goal numbers alone.
  - Goals are numbered from 1 here. In goals.csv, goal_index = the number here minus 1.
  - Under a goal, *teach:* is goals.csv teach (up to three sentences, the why inside) and *stuck:* is goals.csv hint_stuck (after about eight seconds without progress: what the screen pulses, then one subtle line that points at the sheet or the dialog, never at the keys). Challenges run without both.
  - Limits the site enforces (M27, M28): brief ≤ 5 sentences and ≤ 110 words, ending on the headline key in backticks as "The key is `X`." · goal ≤ 140 characters, one sentence, names something visible (a cell, range, sheet, quoted label, key or command) · teach ≤ 3 sentences · stuck "pulse <target> · <one subtle line>" · none of the words section 2 rules out, and no stacked fragments in prose (section 2).
  - Keep each goal's task (the cell, range, key or command it asks for). If a task should change, write it in the Screenplay under Mechanics requests.
  - Source pass (2026-09-30): the fold-back plan in claude/source-checklist.md (section H) is applied to this chapter as DRAFT: 62 edits from the source courses and the desktop tests, plus Formula AutoComplete in 1.6.2 (held item G184, pulled back). Parentheses come from the Format Cells dialog, as the desk number format (1.5.1). Wolf's calls of that day are in the decision log (screenplay 11); what was held back stays listed in the checklist's section B.

## 1.1 Open and set up

*module: open-and-set-up*

**Status** Module 1.1, v6 (2026-09-27): a new lesson 1.1.2 Know the screen (the UI tour Wolf asked for: formula bar, Ctrl+Shift+U, Ctrl+F1, status bar, zoom, the sheet keys and the browser alias); the Ribbon, settings and color lessons renumber to 1.1.3–1.1.5. concrete wording, a quicker navigation opener in 1.1.1 (M30), a demo before 1.1.2 and mock dialogs in 1.1.3 (M31, M32), a Mac note, 1.1.4 rebuilt as the color-coding lesson (M36), the units line, the source label and the hardcode-in-a-formula fix moved to 1.3 and 1.6. Everything here is **DRAFT** for Wolf's markup; the Volt-era text is kept in the *was:* lines of the sheets (lessons.csv, goals.csv) rather than repeated here. Anatomy: story card · brief (≤ 5 sentences, ≤ 110 words, ends "The key is `X`.") · goals, each with a **teach** line (up to three sentences, the why inside) and a **stuck** cue (what the screen pulses after eight seconds, plus one subtle line) · done screen (one line, then a short paragraph or two, split by ||).

**Story card, title** **DRAFT** The weekly reports are in. As usual, they're a mess.

**Story card, body** **DRAFT** Five site managers, five spreadsheets, one workbook that ops pasted them into. There's a tab still called Sheet2, last week's export sitting next to this week's, and a cost typed straight into a formula. The CFO wants one clean page out of this by Monday afternoon, so before you touch a number, get the file in order: name the tabs, delete the stale data, and give the report its own sheet.

**Objective (data room)** **DRAFT** Get the file in order: move around it by keyboard, name the tabs, delete the stale data, give the report its own sheet, set Excel up, color-code every sheet.

**Page name** The workbook, set up to standard

### 1.1.1 The workbook the managers sent

*lesson: inherited-workbook · 8 goals*

**Brief** **DRAFT** This is the Austin cluster's weekly workbook exactly as ops sent it: five sites, two weeks of daily wash counts on the Raw tab, and the leftovers. First, learn to move: the arrow keys go one cell at a time, Ctrl and an arrow jumps to the edge of the data, and Shift selects on the way. Then get the file in order (rename the Sheet2 tab, delete last week's export, and add a Report sheet at the front) because the tab names you set now are the ones every formula will carry. The key is `Ctrl+↓`.

**Done screen, line** **DRAFT** Five presses or one. Ctrl and an arrow gets you there.

**Done screen, paragraph** **DRAFT** Ctrl and an arrow jumps to the edge of the data; add Shift and it selects on the way. Those two moves are most of what "fast in Excel" means, and you'll use them hundreds of times a week. || The workbook is set up: the tabs are named and in order, the stale data is gone and the Report page sits in front. Once the numbers are clean it goes to the CFO for approval and into the VDR, the virtual data room every buyer will read.

**Goals** (all DRAFT)

1.  Walk down the dates with ↓ five times, then jump the rest of the way with Ctrl+↓ until the Name Box reads A61.  
    *teach:* The arrow keys move one cell per press. Ctrl and an arrow jumps to the edge of the data in one press (down, up, left or right), and the Name Box, left of the formula bar, shows where you landed.  
    *stuck:* pulse the Name Box · Ctrl+↓ from anywhere in the column lands on the last date.
2.  Come back up the same way: ↑ five times, then Ctrl+↑ to A1.  
    *teach:* Ctrl+↑ jumps to the top of the data. Ctrl+Home always takes you home to A1 from anywhere on the sheet. Remember it for when you're lost.  
    *teach:* Ctrl+↑ jumps to the top of the data. Ctrl+Home takes you home to A1 from anywhere on the sheet, which is the one to remember when you get lost in a big file.
3.  Across the headers: Ctrl+→ to the last column, F1, then Ctrl+← back to A1.  
    *teach:* The same jump works sideways. Left, right, up, down: four keys that replace almost all of your scrolling.  
    *stuck:* pulse cell F1 · Ctrl+→ stops at the last filled column; Ctrl+← brings you back.
4.  Select the whole date column from A1 in one Ctrl+Shift+↓, then widen the selection to the whole table with Ctrl+Shift+→: A1:F61.  
    *teach:* A selection is the set of cells a command will act on, the highlighted block. Hold Shift with any arrow and the selection grows a cell at a time; hold Ctrl and Shift and it grows to the edge of the data. Two presses select a table of any size.  
    *stuck:* pulse the Name Box · The Name Box shows the range as it grows. It should end at A1:F61.
5.  Walk the tabs to Costs with Ctrl+PgDn and land on the Domain total in E4, where the formula bar shows =B4+C4+D4.  
    *teach:* A workbook is the file; the tabs along the bottom are its sheets, and Ctrl+PgDn and Ctrl+PgUp walk them. The grid shows a result; the formula bar shows where it came from, and that's the one a reviewer reads.  
    *stuck:* pulse the Costs tab · Costs is the last tab. The formula bar only shows the sum once you're on E4.
6.  Rename the Sheet2 tab to Inputs.  
    *teach:* Rename Sheet is Home › Format › Rename (Alt, H, O, R): type the new name and press Enter. Every formula that points at this sheet will carry the name you type now, so name it once and name it right.  
    *stuck:* pulse the Sheet2 tab · Rename works on the active sheet, so Sheet2 has to be the one selected.
7.  Delete the Old wk37 tab, since it's last week's export and the live numbers are on Raw.  
    *teach:* Delete Sheet (Alt, H, D, S) removes the active sheet; Excel asks first because it can't be undone. Stale data left in a file gets read as if it were current, so it comes out. Nothing warns you when other tabs read the one you delete (their formulas turn to #REF!), so on a live model you search the workbook for the tab's name first (3.6.3).  
    *stuck:* pulse the Old wk37 tab · Old wk37 has to be the active tab; then answer the confirmation.
8.  Add a new sheet for the report, name it Report, and move it to the front of the workbook.  
    *teach:* Shift+F11 inserts a sheet, Alt, H, O, R names it, and Move or Copy Sheet (Alt, H, O, M) moves it: ↑ ↓ pick where it sits, Enter confirms. The output page goes first: tabs run the way a reader reads.  
    *stuck:* pulse the Move or Copy dialog · In Move or Copy, pick the sheet that's currently first.

### 1.1.2 Know the screen

*lesson: know-the-screen · 6 goals*

**Demo before the goals** **DRAFT** A labeled tour before the goals: the Name Box, the formula bar, the Ribbon and its tabs, the sheet tabs, the status bar and the zoom control light up one at a time with a one-line label each. (M31, M44)

**Brief** **DRAFT** Before the hotkeys, the screen. The Name Box (top left) tells you where you are; the formula bar next to it tells you what the cell really holds; the Ribbon holds every command; the sheet tabs along the bottom are the pages of the file; the status bar under them totals whatever you select; and the zoom sits in the corner. Ten minutes here and nothing on the screen will surprise you again. The key is `Ctrl+Shift+U`.

**Done screen, line** **DRAFT** Six parts to the screen, and you've now used every one of them.

**Done screen, paragraph** **DRAFT** Every number on the sheet has two views: the grid shows the result, the formula bar shows what made it, and a reviewer reads the second one. The status bar is the fastest sanity check in Excel, and zoom back to 100% is how a page leaves your hands. || Best practice: before you send a file, every sheet at 100%, the cursor on A1, the first tab showing. A file that opens mid-scroll looks unfinished.

**Goals** (all DRAFT)

1.  Land on Raw!E4 and read it twice: the grid shows a number, the formula bar shows =C4*D4.  
    *teach:* The grid shows a cell's result, and the formula bar above the column letters shows what's in it, either a typed number or the formula that made one. Read the formula bar before you trust a figure, every time.  
    *stuck:* pulse the formula bar · Ctrl+PgDn to Raw, then E4; look above the column letters.
2.  The note in H1 is longer than the bar shows: expand the formula bar with Ctrl+Shift+U, read it, then collapse it again.  
    *teach:* Ctrl+Shift+U expands the formula bar to several lines and collapses it again, so a long formula or note reads in full without editing the cell. Long formulas in Chapter 3 will need it.  
    *stuck:* pulse the formula bar's expand arrow · Ctrl+Shift+U twice: open, then closed.
3.  Collapse the Ribbon with Ctrl+F1 to see more rows, then bring it back.  
    *teach:* Ctrl+F1 hides the Ribbon down to its tab names and shows it again; Alt still works while it's collapsed, so the hotkeys don't care. On a big model most people work collapsed.  
    *stuck:* pulse the Ribbon · Ctrl+F1 twice.
4.  Select the wash counts C2:C61 and read the status bar at the bottom: Sum, Average and Count.  
    *teach:* The status bar totals whatever is selected, with no formula written: Sum, Average, Count. Select a column, glance at the bottom of the window, and you know whether a number is plausible before anyone asks. Right-click the status bar once and tick Minimum and Maximum, and the largest and smallest figure in the selection show there too, the one mouse setting worth making.  
    *stuck:* pulse the status bar · Land on C2, Ctrl+Shift+↓, then look at the bottom edge of the window.
5.  Zoom out to see the whole feed: Alt, W, Q, pick 75%, then back to 100% with Alt, W, J.  
    *teach:* The Zoom dialog is View › Zoom (Alt, W, Q); Alt, W, J is 100% in one press. Ctrl and the scroll wheel does it with the mouse. Work at whatever zoom you like; send at 100%.  
    *stuck:* pulse the zoom control · Alt, W, Q, then 7 for 75%, Enter; then Alt, W, J.
6.  Walk the sheet tabs to Costs and back to Raw with the sheet keys.  
    *teach:* Ctrl+PgDn and Ctrl+PgUp move one sheet at a time. In a browser tab, Chrome keeps those two keys for its own tabs, so here Alt+PgDn and Alt+PgUp do the same job and count the same; in fullscreen or the installed app the real keys work. On a Mac, ⌥→ and ⌥← work everywhere.  
    *stuck:* pulse the sheet tabs · Alt+PgDn twice to Costs, Alt+PgUp twice back, or the Ctrl versions in fullscreen.

### 1.1.3 The Ribbon by keyboard

*lesson: ribbon-by-keyboard · 5 goals*

**Demo before the goals** **DRAFT** A fifteen-second demo before the goals: Alt is pressed and the letters appear on the tabs; W is pressed and the View tab opens with its letters; V then G and the gridlines go. Every keypress shows as a keycap as it happens. (M31)

**Brief** **DRAFT** The Ribbon is the open secret of Excel power users, and the reason a mouse is taboo at elite firms. Unlike a normal shortcut, a Ribbon hotkey runs in sequence: press Alt, and every tab and command shows a letter; press the letters, and the command runs. The letters stay on screen to guide you, and with repetition you'll type the sequence without looking. Watch it once, then walk it yourself, and finish by hiding the gridlines on Report. The key is `Alt`.

**Mac note (mac_note)** **DRAFT** On a Mac, press and release ⌥ Option to show the letters (Excel for Mac in Microsoft 365). A few commands have no letter there; the ⌘ shortcut or the mouse fills the gap. In System Settings › Keyboard, turn on "Use F1, F2, etc. keys as standard function keys" so F2, F4 and F9 work without holding fn.

**Done screen, line** **DRAFT** Alt, then the letters. Every command in Excel is reachable without the mouse.

**Done screen, paragraph** **DRAFT** Every tab and button on the Ribbon has a letter, and Esc backs out one level at a time. It's the same on every copy of Excel, so there's nothing to memorize except the handful of hotkeys you use every day. || Report's gridlines are off, which is what most people do to a page someone else reads, though they keep them on while they work. It's a matter of preference, and Alt W V G flips them either way.

**Goals** (all DRAFT)

1.  Open the Ribbon with Alt, step into Home › Font, then back all the way out with Esc.  
    *teach:* Alt puts a letter on every tab and every command; Esc backs out one level at a time. Once you know the letters, any command is three keys away and your hands never leave the keyboard.  
    *stuck:* pulse the KeyTips · Keep pressing Esc until the letters are gone. The goal counts once you're all the way out.
2.  Walk to the View tab with Alt, W, look at what lives there, and leave with Esc.  
    *teach:* The tab letters never change: H Home, N Insert, P Page Layout, M Formulas, A Data, W View. They're the same on every copy of Excel you'll ever sit at, so learn them once.  
    *stuck:* pulse the View tab · Alt first, wait for the letters, then W.
3.  Hide the gridlines on Report.  
    *teach:* View › Show › Gridlines (Alt, W, V, G) hides or shows the grid on the active sheet. Most people turn gridlines off on a page someone else reads; on a working sheet they can help. It's a matter of preference, and the hotkey flips them either way.  
    *stuck:* pulse the Gridlines box on the View tab · It only switches the sheet you're on, so check the tab bar says Report.
4.  Open Format Cells with Ctrl+1, glance at its tabs, and close it with Esc.  
    *teach:* From anywhere, Ctrl+1 opens Format Cells, the dialog with six tabs across the top (Number, Alignment, Font, Border, Fill, Protection) where most formatting lives. Tab moves between its fields, Enter is OK, Esc is Cancel. Most of what you'll do to a page in this chapter happens in here.  
    *stuck:* pulse the 1 key on the top row · Use the 1 on the top row, not the number pad, and close the box again to finish.
5.  Open the same dialog the long way, Alt, H, O, E, and close it again.  
    *teach:* Every dialog also has a Ribbon route: Format Cells is Home › Format › Format Cells. When a shortcut slips your mind, the route still gets you there, so know both.  
    *stuck:* pulse Home › Format · O is Format, near the end of the Home tab; if you're in the wrong menu, Esc backs out one level.

### 1.1.4 Set Excel up like an analyst

*lesson: analyst-setup · 8 goals*

**Demo before the goals** **DRAFT** Excel Options and the Quick Access Toolbar page are shown as mock dialogs with the settings to change highlighted; the learner sees what to set, not a full working menu. (M32)

**Brief** **DRAFT** Let's make sure you have your settings configured like a pro. Calculation stays on Automatic, so every formula updates when a cell changes; iterative calculation goes on so a model that loops on purpose can settle; Enter is set to stay in the cell you typed in. And know F9: when a big model is switched to Manual to stay fast, nothing recalculates until you press it. Then we'll put the commands you use most (font color, fill color, borders, decimals) on the Quick Access Toolbar, the row just under the Ribbon, so Alt and a number runs any of them. The key is `Alt F T`.

**Done screen, line** **DRAFT** Your settings are set, and formatting is Alt and a number from here on.

**Done screen, paragraph** **DRAFT** Calculation is on Automatic, iterative calculation is on, Enter stays put, and your four most-used formatting commands sit on the Quick Access Toolbar after Save, Undo and Redo: Alt+4 through Alt+7 here, and whatever numbers Alt shows on your toolbar. That's the setup every analyst does once. || Top-bucket tip: a full desk toolbar runs to eight or nine (font color, fill color, borders, increase and decrease decimal, paste values, freeze panes, group and ungroup), and most people delete Save, Undo and Redo from it, since Ctrl+S, Ctrl+Z and Ctrl+Y already exist, so the numbers 1 to 9 are all formatting. || Best practice: two more settings on a new install, both in Excel Options (Alt, F, T). On General, switch off the Start screen so Excel opens on a blank workbook; under Accessibility, switch off "Provide feedback with animation" so the cursor stops gliding (older builds: Advanced, "Disable hardware graphics acceleration").

**Goals** (all DRAFT)

1.  Press F9 once so your hands know where it is, even though on Automatic nothing visibly changes.  
    *teach:* Calculation is on Automatic here, so F9 does nothing you can see. Big models get switched to Manual to stay fast, and then F9 (Calculate Now) is the only thing that updates the numbers.  
    *stuck:* pulse the F9 keycap · F9 is on the top row. Nothing visible changes on Automatic, and that's the point.
2.  Open Excel Options and turn iterative calculation on.  
    *teach:* Alt, F, T opens Excel Options; on the Formulas page, iterative calculation lets a model that loops on purpose (interest on debt, for one) settle instead of erroring out. Every desk turns it on, on day one.  
    *stuck:* pulse the Formulas page of Excel Options · It's on the Formulas page of Options, and it only counts once the box is closed with OK.
3.  On the Advanced page, turn off "After pressing Enter, move selection".  
    *teach:* With this off, Enter commits what you typed and stays on the cell, so you read it back before you move; the arrow keys do the moving. It's the setting the desks change first, and every lesson from here on assumes it.  
    *stuck:* pulse the Advanced page of Excel Options · Advanced is a long page; the setting is near the top, under Editing options.
4.  Add Font Color to the Quick Access Toolbar.  
    *teach:* Q opens the Quick Access Toolbar page: ↑ ↓ pick a command, A adds it, Enter is OK. You'll press these four commands more than anything else this week, and Alt plus a number is the shortest route to them there is. The toolbar sits under the Ribbon here, which is where most desks put it.  
    *stuck:* pulse the Add button · Added isn't done until you OK the dialog. Check the toolbar under the Ribbon for the new button.
5.  Add Fill Color the same way.  
    *teach:* Fill Color is for the tint on the input block, later in the chapter. One Alt+number beats a trip into the Ribbon every time.  
    *stuck:* pulse the Add button · Same route: the goal counts once Fill Color is on the right-hand list and the box is OK'd.
6.  Add Borders.  
    *teach:* Borders is where a total's top border comes from, and you'll put one on every page you build.  
    *stuck:* pulse the command list · Borders sits near the top of the left-hand list.
7.  Add Decrease Decimal, the last of the four.  
    *teach:* Every figure column gets its decimals set, usually down to none. This button gets pressed more than you'd think.  
    *stuck:* pulse the command list · When it's in, the toolbar reads seven buttons, ending with Decrease Decimal.
8.  Run one from the keyboard by pressing Alt, reading the number over Undo on the toolbar (2 here) and pressing it.  
    *teach:* Alt on its own numbers the toolbar 1 to 9, left to right, and Alt then the number runs that command from anywhere. The numbers follow your own toolbar: this one starts with Save, Undo and Redo, so Undo is 2 here, and on your own copy of Excel it may sit under another number or on the Home tab. Press Alt, read the numbers, then press one: that's how you'll format for the rest of the course.  
    *stuck:* pulse the toolbar numbers · Press Alt on its own and watch the toolbar: the numbers appear over the buttons.

### 1.1.5 Color-code the workbook

*lesson: colour-label-hardcode · 8 goals*

**Demo before the goals** **DRAFT** Before the goals: a short played demo colors three cells on a sheet (a typed number turns blue, a formula stays black, a link to another sheet turns green), with the formula bar shown for each so the learner sees how you tell them apart. (M31)

**Brief** **DRAFT** Everything you type into this file will get emailed, printed and handed to someone who wasn't there when you built it, and they need to understand it without asking you. That's what font colors are for: blue for a hardcode (a number somebody typed), black for a formula, green for a link to another sheet, red for a link to another file. The formula bar tells you which is which. Inputs has a block of cells that are all still black, so read each one and color it right. The key is `Alt H F C`.

**Done screen, line** **DRAFT** Blue is typed, black is calculated, green comes from another sheet. Anyone can read your workbook now.

**Done screen, paragraph** **DRAFT** Every one of those ten cells now says what it is before anyone reads the number. That's the first thing a reviewer checks when they open your file, and it'll be the first thing you check when someone sends you theirs. || Top-bucket tip: add-ins like Macabacus can color a whole sheet in one press, blue, black and green by what each cell holds. Learn to do it by hand first. You'll be checking their work, and the desks that don't use them expect you to know why each cell is the color it is.

**Goals** (all DRAFT)

1.  Inputs is the sheet where the typed numbers live: go there first.  
    *teach:* Every typed number in the file lives on Inputs, so it's the sheet a reviewer opens first, and the sheet where color coding matters most.  
    *stuck:* pulse the Inputs tab · Inputs is the third tab, after Raw.
2.  Land on B4, read 1.50 typed in the formula bar, and color it blue.  
    *teach:* The formula bar shows what a cell holds, and a number with no = in front of it is a hardcode, meaning somebody typed it, so it goes blue. Font Color lives on the Home tab: Alt, H, F, C opens the palette, the arrow keys move across the swatches and Enter picks one.  
    *stuck:* pulse the Font Color palette · Alt, H, F, C opens the palette; the blue sits a few swatches along the top row.
3.  B5 and B6 are typed too: select both and color them blue in one go.  
    *teach:* To select across cells, hold Shift and press an arrow: from B5, Shift+↓ takes B6 too, and the Name Box reads B5:B6. A format applied to a selection lands on every cell in it, so select first, then Font Color once.  
    *stuck:* pulse cells B5:B6 · Shift+↓ from B5 grows the selection; then the same Font Color route.
4.  B10 holds =B5*B6, a formula, so it stays black, but set its font color to Automatic if it isn't.  
    *teach:* Formulas are black. Automatic is the default font color, and it's the one every calculated cell should have. Nothing typed, nothing to change.  
    *stuck:* pulse cell B10 · Automatic is the first entry in the Font Color palette.
5.  B12 holds =Raw!I13, a link to another sheet: color it green.  
    *teach:* A reference with a sheet name and an exclamation mark points at another sheet, and links are green, so a reader knows which figures come from elsewhere in the file. Red is for a link to another file, which you'll avoid. The team never links workbooks.  
    *stuck:* pulse cell B12 · Green is on the top row of the palette too, past the blue.
6.  Now do the rest of the block, B7:B14, where three more typed numbers, two formulas and one link each need the right color.  
    *teach:* Read each cell in the formula bar before you color it: no =, blue; =, black; a sheet name and !, green. The card ticks each cell as it turns the right color.  
    *stuck:* pulse the formula bar · Land on each cell and look at the formula bar, where the = is the tell.
7.  Read the block back: press F2 on B10, watch its inputs light up on the sheet, then leave with Esc.  
    *teach:* F2 puts a cell into edit mode: the caret appears at the end of the entry and, for a formula, each reference lights up in color on the sheet. Enter leaves edit mode and keeps your changes; Esc leaves it and throws them away. Typing on a cell without F2 replaces the whole entry.  
    *stuck:* pulse cell B10 · Esc leaves the cell as it was; the goal only needs the look.
8.  B15 is blue but holds a formula, =B10/B6: set its font color back to Automatic.  
    *teach:* A wrong color is worse than no color: a reviewer would change B15 thinking it was an input. Ctrl+1 opens Format Cells, the dialog behind all of this: its Font tab has the same color list as the Ribbon route.  
    *stuck:* pulse cell B15 · Font Color, then Automatic (the first entry in the list); or Ctrl+1, the Font tab, Color.

### 1.1.C Challenge: another location's file

*lesson: challenge-inherited-file · 5 goals*

**Brief** **DRAFT** The San Antonio cluster's workbook has landed in the same state as Austin's, so set it up the same way, this time on the clock.

**Done screen, paragraph** **DRAFT** Same setup on another cluster's file: the tabs are named and in order, the page has no gridlines, and every cell is the color of what it holds. || Every file that lands on your desk from here on gets the same treatment, and it gets faster every time.

**Goals** (DRAFT; challenges run without teach or stuck lines)

1.  Rename Sheet2 to Inputs, delete Old wk37, and get a Report sheet in front.
2.  Turn gridlines off on Report, because someone reads this page.
3.  Leave the formulas on Inputs black.
4.  Read B10 with F2 and leave it as it was.
5.  Color every typed figure on Inputs blue, the link green, and put the wrongly colored formula back to Automatic.

## 1.2 Move and select

*module: move-and-select*

**Status** Module 1.2, v2 (2026-09-27): Go To reduced to one goal in 1.2.1; 1.2.3 is now the cell basics (insert and delete rows and columns, widths, heights, AutoFit, alignment, wrap) per Wolf. All DRAFT for markup.

**Story card, title** **DRAFT** The CFO has questions about the weekly numbers.

**Story card, body** **DRAFT** How many days came through? Which columns did the managers send? Is every wash cost in? What's written under the data? Every answer is a cell. Get to each one without scrolling (nobody who does this for a living scrolls), and then select the blocks you'll be formatting next week.

**Objective (data room)** **DRAFT** Move and select by keyboard: Ctrl+Arrow and where it stops, Ctrl+End and Home, the selection set, rows, columns, widths and alignment, Go To Special.

**Page name** The feed, answered

### 1.2.1 Jump, don't scroll

*lesson: jump-dont-scroll · 8 goals*

**Brief** **DRAFT** The CFO has five questions about the feed, and every answer is a cell. Ctrl and an arrow key jumps to the edge of the data, and it stops at a gap, which is how you find a missing figure in a sixty-row feed without reading it. Ctrl+End goes to the last used cell on the sheet, Home snaps to column A, and Page Down moves a screen at a time when you want to read rather than reach. Nobody who does this for a living scrolls. The key is `Ctrl+↓`.

**Done screen, line** **DRAFT** Five questions answered, and you never scrolled once.

**Done screen, paragraph** **DRAFT** Ctrl and an arrow goes to the edge of the data and stops at a gap; Ctrl+End finds the bottom of everything; Home and Ctrl+Home bring you back. Those keys answer most questions about a feed before anyone opens it properly. || The missing wash costs in column F are the first thing you'll fix in module 1.3.

**Goals** (all DRAFT)

1.  The questions are about the feed: move to Raw.  
    *teach:* Ctrl+PgDn walks the tabs to the right, Ctrl+PgUp to the left. Raw is the second tab, the feed the managers' numbers were pasted into.  
    *stuck:* pulse the Raw tab · One Ctrl+PgDn from Report.
2.  "How many days came through?" is answered by the last date, so jump to it with Ctrl+↓.  
    *teach:* From A1, Ctrl+↓ lands on the last filled cell in the column. The Name Box reads A61: sixty rows of data, five sites, twelve days each.  
    *stuck:* pulse the Name Box · Ctrl+↓ from A1; the Name Box reads A61 when you're there.
3.  "Which columns did the managers send?" is the header row, so go back to the top and along the headers to F1.  
    *teach:* Ctrl+Home, then Ctrl+→ runs along the header row to the last filled column. Six columns: Date, Site, Washes, Avg ticket, Revenue, Wash cost.  
    *stuck:* pulse cell F1 · Ctrl+Home first, then Ctrl+→ once.
4.  "Is every wash cost in?" takes Ctrl+↓ down column F, and the jump stops at F11, right above the first missing figure.  
    *teach:* A jump stops where the data stops, so a gap in a column shows up as a jump that lands early. That's how you find a missing figure without reading sixty rows, and the first thing a reviewer does to a feed.  
    *stuck:* pulse cell F11 · Start from F1 and press Ctrl+↓ once; if it lands on F61, the column had no gap and you're on the wrong one.
5.  "Anything below the feed?" takes Ctrl+End to the far corner, then Home, then up to the Notes header in A64.  
    *teach:* Ctrl+End jumps to the sheet's last used cell, and Home snaps to column A of the row you're on. Anything below the data (notes, totals, a stray comment) is where a reader finds surprises, so look before you send.  
    *stuck:* pulse cell A64 · Ctrl+End, then Home, then ↑ until the Name Box reads A64.
6.  Skim the feed a screen at a time: one PgUp, one PgDn.  
    *teach:* PgDn and PgUp move a screen at a time, for reading through, not for reaching a cell. On a Mac that's fn+↓ and fn+↑.  
    *stuck:* pulse the PgDn keycap · One press each; the goal counts once both have been pressed.
7.  Back to the top for the next job: Ctrl+Home.  
    *teach:* Ctrl+Home from anywhere. The answer sheet: sixty days, six columns, missing wash costs starting at F12, a note at A64.  
    *stuck:* pulse cell A1 · Ctrl+Home lands on A1 from anywhere on the sheet.
8.  For a cell you can name, press Ctrl+G, type Costs!B7 and Enter, and you land on Domain's maintenance figure two sheets away.  
    *teach:* Ctrl+G opens Go To: a cell address, or Sheet!Cell for another sheet, and Enter lands you on it. You won't use it often (the arrows are faster for anything nearby), but for a far cell you can name, it's one press. The Name Box does the same with the mouse.  
    *stuck:* pulse the Go To box · Sheet name, exclamation mark, cell: Costs!B7.

### 1.2.2 Select like you mean it

*lesson: select-like-you-mean-it · 8 goals*

**Brief** **DRAFT** Everything you format later starts with a selection: the highlighted cells are the ones a command acts on. Made with the mouse, a selection takes a drag and a scroll; made with the keyboard, it takes one or two presses. Shift and an arrow grows it a cell at a time, Ctrl+Shift and an arrow grows it to the edge of the data, Shift+Space takes a whole row, Ctrl+Space a whole column, and Ctrl+A takes the table. Practice the set on the feed. The key is `Ctrl+Shift+↓`.

**Done screen, line** **DRAFT** A table of any size, selected in two presses.

**Done screen, paragraph** **DRAFT** Shift grows a selection; Ctrl+Shift grows it to the edge; Shift+Space and Ctrl+Space take a row or a column; Ctrl+A takes the block. Every format, fill and paste in this course starts with one of those. || Next, making room and making things fit.

**Goals** (all DRAFT)

1.  Move to Raw, where the selecting is.  
    *teach:* Ctrl+PgDn from Report. Every selection in this lesson starts from a cell you've landed on by keyboard.  
    *stuck:* pulse the Raw tab · One Ctrl+PgDn from Report.
2.  Select Revenue from its header to the last figure: land on E1, then one Ctrl+Shift+↓.  
    *teach:* Hold Ctrl and Shift together and press ↓: the selection runs from the active cell to the edge of the data. The Name Box reads E1:E61. Sixty-one cells in one press.  
    *stuck:* pulse the Name Box · Ctrl+Home, Ctrl+→, ← to reach E1; then Ctrl+Shift+↓.
3.  With E1:E61 still selected, read the status bar at the bottom of the window: the sum, the average and the count of what you've selected.  
    *teach:* Same status bar as 1.1.2, bigger selection: sixty-one cells summed with no formula written. Do this on every column you're about to use. It's how you catch a text figure or a missing day before it costs you.  
    *stuck:* pulse the status bar · Look at the bottom edge of the window while the selection is live.
4.  Collapse to A1, then select the whole header row with Shift+Space.  
    *teach:* Shift+Space selects the entire row of the active cell, edge to edge. Any arrow key on its own collapses a selection back to one cell.  
    *stuck:* pulse row 1 · Ctrl+Home first; then Shift and the space bar together.
5.  Now the whole of column E with Ctrl+Space.  
    *teach:* Ctrl+Space selects the entire column. Row and column selections are how you insert, delete, hide and resize, all of module 1.4. On a Mac, ⌃Space may be taken by the system; ⌘⇧↑ then ⌘⇧↓ from the top of a column does the job.  
    *stuck:* pulse column E · Land anywhere in column E first, then Ctrl and the space bar.
6.  Select the whole feed in one press: Ctrl+A.  
    *teach:* Ctrl+A selects the current region: the block of data around the active cell, bounded by blank rows and columns. From inside the feed, that's A1:F61.  
    *stuck:* pulse the Name Box · Land inside the feed first; from a blank cell Ctrl+A selects the whole sheet instead.
7.  Press Ctrl+A a second time: the entire sheet.  
    *teach:* Ctrl+A again widens to every cell on the sheet. Useful for a format you want everywhere, dangerous for anything else.  
    *stuck:* pulse the select-all corner · Ctrl+A twice from inside the feed.
8.  Go home to A1 with Ctrl+Home, then take everything in use (feed, notes and the totals block) with Ctrl+Shift+End.  
    *teach:* Ctrl+Shift+End selects from the active cell to the last used cell on the sheet, gaps included. Ctrl+A stops at the first blank row; Ctrl+Shift+End doesn't.  
    *stuck:* pulse the Name Box · Ctrl+Home, then Ctrl, Shift and End together.

### 1.2.3 Rows, columns and cells

*lesson: around-the-workbook · 9 goals*

**Brief** **DRAFT** Half of Excel is making room and making things fit. Rows and columns insert with Ctrl and plus and delete with Ctrl and minus, but select the whole row or column first with Shift+Space or Ctrl+Space. Widths and heights are under Home › Format (Alt, H, O), AutoFit sizes a column to its longest entry, and alignment sits under Alt, H, A. Ten minutes on these and you'll never fight a sheet again. The key is `Ctrl+Shift+=`.

**Done screen, line** **DRAFT** You made room and made everything fit, and F4 did half the work.

**Done screen, paragraph** **DRAFT** Insert with Ctrl and plus, delete with Ctrl and minus, select the row or column first; widths, heights and AutoFit under Alt, H, O; alignment under Alt, H, A; F4 to do it again. That's the cell basics, and every sheet you touch from here on gets them without thinking. || Module 1.4 does the same on a page with formulas in it, where a deleted column can break a total.

**Goals** (all DRAFT)

1.  On Raw, the site names in column B are cut off: AutoFit the column to its longest entry.  
    *teach:* AutoFit Column Width is Home › Format › AutoFit Column Width (Alt, H, O, I): the column sizes to the longest entry in it. Land anywhere in the column first. The whole column is the target.  
    *stuck:* pulse column B · Alt, H, O, I from any cell in column B.
2.  Column A is wider than a date needs: set it to width 11.  
    *teach:* Column Width (Alt, H, O, W) sets the selected columns to a number of characters: type it and Enter. A column too narrow for a number or a date shows ######## until you widen it; that's Excel telling you, not an error.  
    *stuck:* pulse column A · Alt, H, O, W, then 11, then Enter.
3.  The figure columns C:F should match, so select them and press F4, and the width you set a moment ago lands on all four.  
    *teach:* F4 repeats your last action on whatever is selected now: a width, a format, an insert. Set it once, F4 everywhere. It comes back in the Format module as the fastest key on the sheet.  
    *stuck:* pulse columns C:F · Select C:F with Ctrl+Space and Shift+→, then one F4.
4.  Give the header row some air: set row 1 to height 20.  
    *teach:* Row Height (Alt, H, O, H) is in points; AutoFit Row Height (Alt, H, O, A) sizes a row back to what its text needs. Shift+Space selects the row first if you want to be sure.  
    *stuck:* pulse row 1 · Alt, H, O, H, then 20, then Enter.
5.  The figure headers C1:F1 sit left over numbers that sit right: right-align them.  
    *teach:* Numbers align right by default and text aligns left, so a header over a number column reads best right-aligned. Alignment is Alt, H, A, then L, C or R.  
    *stuck:* pulse cells C1:F1 · Select C1:F1 first, then Alt, H, A, R.
6.  Add a line under the Notes block by inserting a row above A67 and typing Airport Sat missing - emailed manager.  
    *teach:* Shift+Space selects the whole row, then Ctrl+Shift+= (Ctrl and plus) inserts a row above it, and Alt, H, I, R is the Ribbon route to the same thing. Whatever was there moves down, so nothing is overwritten.  
    *stuck:* pulse row 67 · Shift+Space on row 67, then Ctrl+Shift+=; type the note into the new A67 and Enter.
7.  On Costs, add a column for Utilities between Maintenance and Card fees: select column D and insert, then type Utilities in D3.  
    *teach:* Columns insert the same way: Ctrl+Space selects the column, Ctrl+Shift+= inserts one to its left; Alt, H, I, C is the Ribbon route. The formulas to the right move over and keep working.  
    *stuck:* pulse column D on Costs · Ctrl+PgDn to Costs; Ctrl+Space on any cell in column D; then Ctrl+Shift+=.
8.  The CFO says utilities sit inside rent this year, so delete the Utilities column again.  
    *teach:* Ctrl+− (Ctrl and minus) deletes the selected rows or columns whole; Alt, H, D, C and Alt, H, D, R are the Ribbon routes. Ctrl+Z brings back a column you didn't mean to delete.  
    *stuck:* pulse column D on Costs · Ctrl+Space on the Utilities column, then Ctrl+−.
9.  Back on Raw, the note in A64 runs past its column: wrap it inside the cell.  
    *teach:* Wrap Text (Alt, H, W) folds a long entry onto more lines inside its cell and the row grows to fit. It's how a label stays readable without widening the whole column.  
    *stuck:* pulse cell A64 · Land on A64, then Alt, H, W.

### 1.2.4 What's typed and what's calculated

*lesson: typed-vs-calculated · 5 goals*

**Brief** **DRAFT** In 1.1.5 you colored ten cells by reading them one at a time. Costs has fifteen typed figures, three formulas and two blanks, and a buyer's analyst will ask which is which. Go To Special selects cells by what they hold (every constant, every formula, every blank) inside whatever you've selected, so you can color a whole block in one stroke and find the holes in it with another. The key is `Alt H F D S`.

**Done screen, line** **DRAFT** Fifteen typed cells turned blue in one stroke.

**Done screen, paragraph** **DRAFT** Go To Special selects by kind (constants, formulas, blanks) inside whatever you've selected. It's how you color a block in one move, and how you audit someone else's in one look, which comes back in the hardcode hunt at the end of the chapter. || Costs is color-coded and its two holes are found.

**Goals** (all DRAFT)

1.  The question is about Costs: go there.  
    *teach:* Ctrl+PgDn to the last tab. Costs is the sheet a manager built by hand: rent, maintenance and card fees by site.  
    *stuck:* pulse the Costs tab · Costs is the last tab; three Ctrl+PgDn from Report.
2.  Select the table body B4:E8, edge to edge.  
    *teach:* Land on B4, then press Ctrl+Shift+→ and Ctrl+Shift+↓, and two presses give you twenty cells. Go To Special works inside whatever you've selected, so the selection comes first.  
    *stuck:* pulse the Name Box · The Name Box should read B4:E8 before you go on.
3.  Pick out the constants, meaning everything someone typed, and color them blue in one stroke.  
    *teach:* Go To Special is Home › Find & Select › Go To Special (Alt, H, F, D, S), or F5 then Alt+S. Inside your selection it picks cells by kind: O for Constants, F for Formulas, K for Blanks. Then Font Color once, and every typed cell turns blue together.  
    *stuck:* pulse the Go To Special dialog · Alt, H, F, D, S, then O for Constants, Enter; then Alt, H, F, C for the blue.
4.  Select the body again and pick out the formulas, which lights up only the Domain total in E4, and it stays black.  
    *teach:* Formulas stay black, because Go To Special only shows you where they are. One total in a block of typed figures is normal for a sheet a manager built, and you'll add the rest in module 1.6.  
    *stuck:* pulse cell E4 · Reselect B4:E8 first; F for Formulas this time.
5.  One more pass picks out the blanks, which are the two sites with no maintenance figure.  
    *teach:* Blanks are the holes. Two sites never sent a maintenance number, and now you know which ones before the CFO asks.  
    *stuck:* pulse the Go To Special dialog · Reselect B4:E8; K for Blanks, Enter; the two empty cells light up.

### 1.2.C Challenge: find and mark

*lesson: challenge-find-and-mark · 5 goals*

**Brief** **DRAFT** A fresh feed from another cluster, and Revenue is now a formula, with stray typed numbers hiding in it. Jump the feed, select it, then find every typed number in the Revenue column and mark it blue.

**Done screen, paragraph** **DRAFT** You jumped the feed, selected it, and found and marked every typed number in it. The whole audit in five moves. || Every feed that lands from here on gets the same five, and the typed numbers hiding in a formula column are the ones a reviewer would have found first.

**Goals** (DRAFT; challenges run without teach or stuck lines)

1.  Land on the feed's last date in one jump from the top of Raw.
2.  Back to the top, then along the headers to the last column, F1.
3.  Select everything used on the sheet from A1 in one stroke.
4.  Select the Revenue figures E2:E60, edge to edge.
5.  Open Go To Special, pick Constants, then color every typed number in the block blue.

## 1.3 Enter, edit, copy and fill

*module: enter-edit-copy-fill*

**Status** Module 1.3, v2 (2026-09-27, after Wolf's markup): 1.3.1 built around entering the desk way (Enter stays, Tab runs, Ctrl+Enter, AutoComplete, Alt+Enter); 1.3.2 finds errors by flicking F2/Esc, Ctrl+F once, F4 as repeat; 1.3.4 adds Multiply and Divide; 1.3.5 is names, notes, Ctrl+;, Ctrl+Backspace and Fill Series with Replace kept to two goals. The units line and the source label live in 1.3.1. Figures are car-wash figures (250 washes, $14.00, $3,500, $375); the workbook re-skin (M25) sets the exact values. All DRAFT for markup.

**Story card, title** **DRAFT** A day is missing, and some of the figures are wrong.

**Story card, body** **DRAFT** Airport's Saturday never came through, so the manager emailed the four numbers over. Type them in, fix the typos where they sit, then start the Report page by pulling the headers, the site list and the week label across from Raw and Inputs with the clipboard and the fill keys, so nothing gets typed twice.

**Objective (data room)** **DRAFT** Enter, edit, copy and fill: the missing day, the typos, the Report skeleton, Paste Special, Find and Replace, a timeline.

**Page name** The Report skeleton

### 1.3.1 Enter the missing day

*lesson: enter-the-missing-day · 11 goals*

**Brief** **DRAFT** Airport's Saturday never came through on the feed, and the manager has emailed the four figures. Entering data the desk way: Enter commits and stays on the cell (you turned "move selection" off in 1.1.4), so you read it back and move with the arrows; Tab commits and moves right, so a row goes in as a Tab run; Ctrl+Enter puts one entry into every selected cell at once. Esc throws away an entry you've started, AutoComplete offers a name you've typed before, Alt+Enter breaks a line inside a cell. Enter the day, zero the blank wash costs in one press, label two things on Inputs. The key is `Tab`.

**Done screen, line** **DRAFT** Four figures went in as one Tab run, and the total moved the moment the last one landed.

**Done screen, paragraph** **DRAFT** Enter commits and stays, arrows move, Tab runs a row, Ctrl+Enter fills a selection, Esc backs out, Alt+Enter breaks a line. That's every way a figure or a label gets into a sheet, and the site total answering the moment the day landed is the point of a live sheet. || Best practice: when a figure arrives by email, the source goes next to it, who sent it and when, so the next person doesn't have to ask.

**Goals** (all DRAFT)

1.  Airport's Saturday never came through: jump to the first blank cell of its row, Raw!C61.  
    *teach:* Ctrl+PgDn to Raw, Ctrl+↓ down the Site column to the last row, then → to C. Row 61 is Airport's Saturday, and C61 is where the washes go.  
    *stuck:* pulse cell C61 · The last row of the feed, third column: C61.
2.  Enter 250 washes in C61 and press Enter: the cell stays selected, so read it back, then → to D61.  
    *teach:* Enter commits; with "move selection" off the cursor stays put, which is how you check a figure before you leave it. On a desk that hasn't changed the setting, Enter drops one row, but the arrows work either way. Type the number without a comma; the format comes later.  
    *stuck:* pulse cell C61 · 250, Enter: you're still on C61; then → once.
3.  The rest of the row as a Tab run: 14 in D61, Tab, 3500 in E61, Tab, 375 in F61, Enter.  
    *teach:* Tab commits and steps one cell right, so a row of figures goes in without an arrow key. No dollar signs, no commas: Excel formats them later, and typing them now can turn a number into text.  
    *stuck:* pulse cell D61 · 14, Tab, 3500, Tab, 375, Enter.
4.  Type Airp over B61, AutoComplete offers Airport after three letters, and since it's already right, throw the entry away with Esc.  
    *teach:* AutoComplete proposes an entry from the same column once you've typed enough letters; Enter or Tab accepts it, and any other key ignores it. Esc discards what you've started and the cell keeps what it had: typing over a cell only replaces it when you commit.  
    *stuck:* pulse cell B61 · Type Airp, watch the proposal, then Esc: the name is unchanged.
5.  Five wash-cost cells in column F are blank: select the feed from the top, pick out the blanks with Go To Special and count them.  
    *teach:* Ctrl+Home, then Ctrl+A for the feed, then Go To Special (Alt, H, F, D, S) and K for Blanks. Five cells light up, all in column F: the days the managers left empty.  
    *stuck:* pulse the Go To Special dialog · Ctrl+A on the feed first; K is Blanks.
6.  Type 0 once and commit it into all five blank cells of the Wash cost column at the same time.  
    *teach:* Ctrl+Enter commits one entry into every selected cell at once, so five blanks take one press. A zero in a cost column says "nothing was charged", which is true here, whereas a blank says "nobody looked".  
    *stuck:* pulse the F column blanks · With the five cells still selected, type 0 and press Ctrl+Enter, not Enter.
7.  A stray "draft" note sits in H3, above the site totals block: clear it.  
    *teach:* Delete clears what a cell holds and leaves its format and any note behind. Clear All (Alt, H, E, A) wipes contents, formats and notes together, and Clear Formats (Alt, H, E, F) takes only the formatting, so a reused cell doesn't inherit an old format or a stale note. On a Mac, forward-delete is fn+delete; the delete key is Backspace and only works inside edit mode.  
    *stuck:* pulse cell H3 · Land on H3 and press Delete.
8.  Put a two-line note in H4: Airport Sat missing, then Alt+Enter, then emailed manager 9/15.  
    *teach:* Alt+Enter starts a new line inside the cell you're typing in, instead of committing it. It's how a label or a note reads on two lines without spilling into the next column.  
    *stuck:* pulse cell H4 · Type the first line, Alt+Enter, the second line, then Enter.
9.  Two labels on Inputs while you're typing: the units line, USD unless stated, into A2.  
    *teach:* Every page states its currency once, near the top: one line that settles it for every figure below, so nobody has to ask. Type it exactly and press Enter.  
    *stuck:* pulse cell A2 on Inputs · Ctrl+PgDn to Inputs; A2; capital USD; Enter.
10.  And the source of the cost per wash: type per supplier quote into C4, next to the figure.  
    *teach:* The first question anyone asks about a typed number is where it came from. Best practice: every hardcode carries its source (a web link, a file path, a page number or a quote) as a label beside it or a note on the cell (1.3.5).  
    *stuck:* pulse cell C4 on Inputs · Three words, lowercase, in the cell to the right of the cost.
11.  Does it tie? Change Airport's Saturday washes in C61 to 300 and watch the Airport line of the site totals, I12, answer.  
    *teach:* The totals block on Raw reads the feed, so a change in C61 moves I12 the moment you press Enter. That's a live sheet, and the reason you type into the feed, never over the total.  
    *stuck:* pulse cell I12 · Back to Raw!C61, type 300, Enter; watch I12 change.

### 1.3.2 Fix it in place

*lesson: fix-it-in-place · 9 goals*

**Brief** **DRAFT** The feed is complete but not clean: two site names are misspelled, one wash count was typed as text, and one day's revenue is ten times its neighbors. Analysts find these by flicking through cells (arrow to a cell, F2 to see exactly what's in it, Esc to leave it untouched) and fix them in place with F2, Home, End and the arrows, changing only what's wrong. Ctrl+Z undoes a change and Ctrl+Y puts it back; F4 repeats a fix on the next cell. The key is `F2`.

**Done screen, line** **DRAFT** Four fixes without retyping a cell, and the totals answered on their own.

**Done screen, paragraph** **DRAFT** F2 to look, Esc to leave, F2 again to fix: that flick down a column is how a reviewer reads a sheet, and it's faster than any search because you see everything, not just what you searched for. || Read what Excel shows you: a figure sitting on the left is text, not a number, and a revenue ten times its neighbors is a typo, not a record day.

**Goals** (all DRAFT)

1.  Move to Raw and flick down the Site column from B10: ↓, F2, Esc, until you find Muller in B14.  
    *teach:* F2 shows a cell's exact contents with the caret in it; Esc leaves without changing anything. Arrow, F2, Esc, arrow: that flick is how analysts read a column, and it catches things a search never would.  
    *stuck:* pulse cell B14 · Land on B10, then ↓ F2 Esc, four times.
2.  Open B14 with F2, move the insertion point to just after Mu, and insert the e so it reads Mueller.  
    *teach:* In edit mode, Home and End send the insertion point to either end of the entry and ← → step it one character; Ctrl+← and Ctrl+→ jump a word at a time in a long formula. Typing inserts where the caret is; Enter keeps the change.  
    *stuck:* pulse cell B14 · F2, Home, → twice, type e, Enter.
3.  Keep flicking: Riverside lost its e in one row further down. Find it with F2 and Esc, and add the e.  
    *teach:* Same flick, same fix. Two correct Riversides sit above the wrong one. Read each before you edit it.  
    *stuck:* pulse cell B27 · ↓ F2 Esc down from B15; the short one is the wrong one.
4.  C33 shows 240 sitting on the left, which means text with a trailing space, so open it, delete the space and commit it as a number.  
    *teach:* A figure sitting on the left is text, not a number, and a total that reads it will skip it. Backspace deletes the character before the insertion point, so the trailing space goes and 240 snaps to the right.  
    *stuck:* pulse cell C33 · F2 puts the caret at the end; one Backspace removes the space; Enter.
5.  E41 reads 81500 for one day of South Lamar revenue when washes × ticket says 3,150: type 3150 over it.  
    *teach:* Typing on a cell replaces its whole entry. No F2 when nothing in the old entry is worth keeping. Sanity-check the magnitude: one site doesn't do $81,500 in a day.  
    *stuck:* pulse cell E41 · Land on E41, type 3150, Enter.
6.  The CFO asks what was there before: Ctrl+Z, read 81500, then Ctrl+Y to put the fix back.  
    *teach:* Ctrl+Z undoes the last change and Ctrl+Y puts it back, dozens of steps deep, so a fix can be tried, read and kept, or shown to someone who asks.  
    *stuck:* pulse cell E41 · One Ctrl+Z, one Ctrl+Y.
7.  One typo you can't see from here: Airprot, somewhere in sixty rows. Ctrl+F finds it; type Airport over it.  
    *teach:* Ctrl+F is for when you know the text but not the cell: type part of it, Enter jumps to the next match, Esc closes the box and leaves you there. Then type over it: nothing in Airprot is worth keeping.  
    *stuck:* pulse the Find box · Ctrl+F, Airprot, Enter, Esc, then type Airport, Enter.
8.  Whoever flagged the errors filled E41, C33 and B14 yellow: clear the fill on E41 with Alt, H, H, N, then F4 on C33 and F4 on B14.  
    *teach:* F4 repeats your last action on the cell you're on now: a format, a border, a width, an insert. Fix it once, F4 the rest. It doesn't repeat typing; for that there's Ctrl+Enter.  
    *stuck:* pulse cell E41 · Alt, H, H, N clears a fill; then F4 on each of the other two.
9.  Does it tie? Change C33, a Riverside wash count, to 260 and watch Riverside's total in I10 answer.  
    *teach:* Now that C33 is a number, the total reads it. Before the fix it was text, and I10 was quietly wrong, the kind of error nobody sees until a buyer's analyst does.  
    *stuck:* pulse cell I10 · Type 260 over C33, Enter; I10 moves.

### 1.3.3 Copy, cut, paste, fill

*lesson: copy-cut-paste-fill · 9 goals*

**Brief** **DRAFT** Report is still blank and the CFO wants its skeleton before the figures arrive: title, units, headers, the site list and the week label, plus the feed's Notes block moved beside the feed. Nothing gets typed twice: the headers already sit on Raw, the sites on Inputs, and one label fills five rows and six columns. Ctrl+C copies (the original stays), Ctrl+X cuts (the original moves), Ctrl+V pastes; Ctrl+D fills a selection down from its top row and Ctrl+R fills it right from its left column. The key is `Ctrl+C`.

**Done screen, line** **DRAFT** The Report has its shape, and nothing on it was typed twice.

**Done screen, paragraph** **DRAFT** The headers came from Raw, the sites from Inputs, and one week label went down five rows and across six columns from a single copy, which is the habit: fill it, never retype it. Copy leaves the original where it was, and cut takes it with you. || The Notes block now sits beside the feed, where a reader opening the file will find it. The feed itself now ends where the data ends.

**Goals** (all DRAFT)

1.  Title the page: Clearcoat - Austin Weekly KPI Report, Week of Sep 15, 2026 in A1, USD unless stated in A2, then Site and Week in A4:B4.  
    *teach:* Type and Enter, four times. The title says what the page is and when; the units line says what the figures are in; the headers start the table. Every page in the pack starts this way.  
    *stuck:* pulse cell A1 on Report · Ctrl+PgUp to Report; A1, Enter, ↓, A2, Enter; then A4, Tab, B4.
2.  The feed's totals block already carries the figure headers: copy Raw!I7:K7 and paste them onto C4:E4, then drop the marquee.  
    *teach:* Ctrl+C copies the selection and leaves it where it was; Ctrl+V pastes it at the cursor, formats included; Esc drops the marquee, the moving border around what you copied. Copy the header row, don't retype it. Retyping is where typos come from.  
    *stuck:* pulse cells I7:K7 on Raw · On Raw land on I7, Shift+→ twice, Ctrl+C; back on Report, C4, Ctrl+V, Esc.
3.  The site list lives on Inputs: copy Inputs!A9:A13 and drop it under Site at A5 with Enter.  
    *teach:* After a copy, Enter pastes once and drops the marquee in the same press: the paste for a single destination. Five site names, one press.  
    *stuck:* pulse cells A9:A13 on Inputs · Select A9:A13 on Inputs, Ctrl+C; on Report land on A5 and press Enter.
4.  Copy the reporting week from Inputs!B3 onto B5, then fill it down the five site rows B5:B9 with Ctrl+D.  
    *teach:* Ctrl+D fills the selection from its top row and Ctrl+R from its left column: one entry, filled, never retyped. Select from the cell that holds the value down through the cells that should.  
    *stuck:* pulse cells B5:B9 · Paste the label in B5; select B5:B9 with Shift+↓; Ctrl+D.
5.  Label the daily block below the table: Washes by day in A12, then Week, Day and Date in A13:A15.  
    *teach:* Press Enter after each label, then ↓ to the next row, and four labels go in without the mouse. The daily block is where the week's washes by day will go once the Report is live.  
    *stuck:* pulse cell A12 · A12, Enter, ↓, and so on.
6.  The daily block needs the same five sites: copy A5:A9 and drop them at A16 with Enter.  
    *teach:* It's the same list in a second place, so copy it rather than typing it. If a site name ever changes, you change it on Inputs and re-copy, which is what keeping one source means.  
    *stuck:* pulse cells A5:A9 · Select A5:A9, Ctrl+C, land on A16, Enter.
7.  The daily block's Week row takes the same label: copy it from B9 to B13, then fill it right across B13:G13 with Ctrl+R.  
    *teach:* Ctrl+R fills to the right from the left-hand cell of the selection. Six cells, one press, and every one of them identical, which is the point.  
    *stuck:* pulse cells B13:G13 · Copy B9, paste on B13; select B13:G13 with Shift+→; Ctrl+R.
8.  The Notes block sits under the feed where nobody reads it: cut Raw!A64:A68 and paste it beside the feed at H1.  
    *teach:* Ctrl+X cuts: the cells move, and the originals go blank when you paste. That's the difference from copy. A note nobody sees is a note nobody read; beside the feed, at the top, it gets read.  
    *stuck:* pulse cells A64:A68 on Raw · Select A64:A68 on Raw, Ctrl+X, land on H1, Ctrl+V.
9.  Does it tie? Change Domain's Monday washes in Raw!C8 to 300 and watch Domain's total in I8 answer.  
    *teach:* The feed still drives the totals and the Report reads nothing yet, which is where module 1.6 comes in to link them.  
    *stuck:* pulse cell I8 on Raw · Type 300 over Raw!C8, Enter; I8 moves.

### 1.3.4 Paste Special: values, formats, math

*lesson: paste-special-values · 10 goals*

**Brief** **DRAFT** The Report needs this week's site totals and last week's revenue beside them, as numbers that stay put once the page is sent, not links that move with the feed. Paste Special brings one part of what you copied (values only, formats only, a block turned on its side) or does arithmetic on the cells you paste over: copy a −1 and Multiply flips a block's sign; copy 1000 and Divide turns dollars into thousands. Every desk lives in this dialog. Ctrl+Alt+V opens it, and Alt, E, S, V is the old route people still say out loud. The key is `Ctrl+Alt+V`.

**Done screen, line** **DRAFT** You copied the numbers, not the links, and flipped a whole block's sign without writing a formula.

**Done screen, paragraph** **DRAFT** Paste values for a snapshot, paste formats to dress a row, transpose to turn a list on its side, and Multiply or Divide to fix a block's sign or units where it sits. None of it needs a formula or a retyped figure. || The total row went in plain and its SUM followed the paste to C5:C9; the site list stands across the sensitivity table without a name retyped.

**Goals** (all DRAFT)

1.  Two more figure columns are coming: type Gross profit ($) in F4 and Avg ticket ($/wash) in G4 as one Tab run.  
    *teach:* Tab, then the second header, then Enter. Headers name the unit in brackets so nobody guesses.  
    *stuck:* pulse cell F4 · F4, type, Tab, type, Enter.
2.  The CFO wants last week beside this week: copy Raw's Prior week rev and Old code block L7:M12 and paste values only onto H4.  
    *teach:* Paste Special, Ctrl+Alt+V, pastes one part of the copy (V values only, T formats only, F formulas only, E transposed), then Enter confirms. Formulas only carries the calculation and leaves the destination's borders, fills and number format alone. Values only is how you take a snapshot: the numbers, not the formulas behind them.  
    *stuck:* pulse the Paste Special dialog · Copy L7:M12 on Raw; on Report land on H4; Ctrl+Alt+V, V, Enter.
3.  The prior-week revenue came out of the accounting export as negatives: copy a −1 from a spare cell, select H5:H9, Paste Special, Multiply.  
    *teach:* Paste Special can do arithmetic on the cells you paste over: Add, Subtract, Multiply, Divide (Alt+M for Multiply) with the number you copied. Multiply by −1 flips the sign of a whole block in one move; no formula, nothing retyped. It rewrites formulas too, so a SUM caught in the selection becomes =(SUM(…))*-1 and a total selected with its inputs is flipped or scaled twice: select typed cells only, with Go To Special, Constants (1.2.4) on a mixed block.  
    *stuck:* pulse the Paste Special dialog · Type -1 somewhere empty, Ctrl+C on it, select H5:H9, Ctrl+Alt+V, M, Enter.
4.  Same block, and the figures are in cents: copy 100 from a spare cell, select H5:H9, Paste Special Divide, then clear the spare cells.  
    *teach:* Divide by 100 turns cents into dollars; divide by 1000 turns dollars into thousands; multiply by 1000 goes the other way. Any block, any unit change, one paste. And remember to clear the helper cell.  
    *stuck:* pulse the Paste Special dialog · Type 100, Ctrl+C, select H5:H9, Ctrl+Alt+V, I for Divide, Enter; Delete on the helper.
5.  Four new headers, one style: copy the Washes header C4 and paste its format only onto F4:I4 with Paste Formats.  
    *teach:* T in Paste Special pastes the format and leaves the text alone: bold, fill, alignment, number format, all of it, without touching what the cells say. Format one header properly and paste it onto the rest; it's how a page gets consistent.  
    *stuck:* pulse cells F4:I4 · Copy C4; select F4:I4; Ctrl+Alt+V, T, Enter.
6.  Snapshot this week: copy the five sites' live totals Raw!I8:K12 and paste values only onto C5, so the page holds numbers, not links.  
    *teach:* A pasted formula would point at the wrong cells on the wrong sheet; pasted values are just the numbers. Live links come in module 1.6, when the Report is ready for them.  
    *stuck:* pulse cell C5 · Copy Raw!I8:K12; on Report, C5; Ctrl+Alt+V, V, Enter.
7.  Type Total in A10, then copy Raw's total row I13:K13 and paste it plain onto C10: the SUM re-points to C5:C9.  
    *teach:* A pasted formula keeps its shape, not its cells: the references shift with the move, so =SUM(I8:I12) becomes =SUM(C5:C9). That's relative referencing, and a $ in front of a row or column would pin it (module 1.6).  
    *stuck:* pulse cell C10 · A10, type Total, Enter; copy I13:K13 on Raw; C10, Ctrl+V.
8.  Start the sensitivity block under the daily table: Wash cost sensitivity ($/wk) in A22 and Cost per wash in A23.  
    *teach:* Two labels, Enter and ↓ between them. A sensitivity table shows what happens to a figure when an input moves: here, the weekly wash cost at three chemical prices.  
    *stuck:* pulse cell A22 · A22, Enter, ↓, A23, Enter.
9.  The sensitivity table needs the sites across its top: copy A5:A9 and paste them transposed onto B23, one row of five.  
    *teach:* E in Paste Special turns a column into a row (or a row into a column). Five names down become five names across, nothing retyped. Labels and values turn freely; a transposed formula has its relative references turned as well, so paste values first, or anchor, before you turn a block of formulas.  
    *stuck:* pulse cell B23 · Copy A5:A9; land on B23; Ctrl+Alt+V, E, Enter.
10.  Does it tie? Change Domain's Monday washes in Raw's C8: the live total I8 moves, and the Report's snapshot C5 stays put.  
    *teach:* That's the difference between a link and a value. A snapshot holds still on purpose; when you want the page to move with the feed, you link it (1.6.4).  
    *stuck:* pulse cell C5 on Report · Change Raw!C8, watch I8 move, then look at Report!C5: unchanged.

### 1.3.5 Names, notes and the small keys

*lesson: find-replace-timeline · 10 goals*

**Brief** **DRAFT** A handful of small keys separate people who work in Excel from people who fight it. Replace All swaps every match on the active sheet in one press and tells you how many it touched, so read that number every time. A named cell can be jumped to and referenced by name; a note (Shift+F2) carries a source where it can't be lost; Ctrl+; types today's date; Ctrl+Backspace snaps the view back to the cell you're on after you've scrolled away; Fill Series writes a week from one day. None of these is a lesson on its own, and you'll use all of them by Friday. The key is `Ctrl+H`.

**Done screen, line** **DRAFT** Twelve stale labels went in two presses, the cost per wash has a name and a source, and the week wrote itself.

**Done screen, paragraph** **DRAFT** Replace All only touches the active sheet, so it took one pass on the Report and one on Inputs, and Excel told you the count each time: eleven, then one. || The cost per wash now has a name and a note, and the daily table carries a timeline: Mon to Sat with the dates under them, written as a series instead of typed six times.

**Goals** (all DRAFT)

1.  Eleven cells on the Report still read Week of Sep 8: swap every one for Week of Sep 15 with Replace All and read the count, eleven.  
    *teach:* Ctrl+H opens Replace: type what to find, Tab, what to put there, then Alt+A replaces every match on this sheet and reports how many cells changed. If the count isn't what you expected, Ctrl+Z and look.  
    *stuck:* pulse the Replace box · Ctrl+H; Week of Sep 8; Tab; Week of Sep 15; Alt+A; read the count; Esc.
2.  Replace All only touches the active sheet: move to Inputs and replace the stale week label in B3 the same way, and the count reads one.  
    *teach:* One sheet at a time, unless you select several tabs first. The count is the check: one cell on Inputs holds the week, so the count is one.  
    *stuck:* pulse cell B3 on Inputs · Ctrl+PgDn to Inputs; the same Ctrl+H; count of one.
3.  Give the cost per wash a name: land on B4, open Define Name (Alt, M, M, D), type CostPerWash and Enter.  
    *teach:* A name is a label for a cell or a range that you can jump to (Ctrl+G, then the name) and write into a formula (=B6*CostPerWash) so it reads like English. Name a few key inputs and never everything, and Chapter 4 sets out the rules for which.  
    *stuck:* pulse the Define Name dialog · Alt, M, M, D; type the name, no spaces; Enter.
4.  Jump away with Ctrl+Home, then back to it by name: Ctrl+G, CostPerWash, Enter.  
    *teach:* The Name Box drop-down lists every name in the file, and Go To accepts a name where it accepts an address. Names travel with the cell if rows are inserted above it.  
    *stuck:* pulse the Go To box · Ctrl+G, type CostPerWash, Enter.
5.  Attach the source to the cell as a note: Shift+F2 on B4, type Supplier quote, Sep 15 2026, then Esc to close it.  
    *teach:* Shift+F2 opens a note on the cell: a comment that travels with it, marked by a red corner. Best practice: every hardcode carries its source (a web link, a file path, a page number or a quote) in a note or in the next cell.  
    *stuck:* pulse cell B4 · Shift+F2, type, then Esc twice to leave the note and the cell.
6.  Date the check: in D4 press Ctrl+; and Enter for today's date, typed for you.  
    *teach:* Ctrl+; enters today's date and Ctrl+Shift+; the time, as values that don't change tomorrow. An "as of" date beside a figure says when someone last looked.  
    *stuck:* pulse cell D4 · Land on D4; Ctrl and the semicolon; Enter.
7.  Scroll away with PgDn three times, then Ctrl+Backspace snaps the view back to D4.  
    *teach:* Ctrl+Backspace scrolls the window back to the active cell without moving it. After you've paged down a long sheet to look at something, one press brings you home.  
    *stuck:* pulse the PgDn keycap · PgDn a few times, then Ctrl+Backspace.
8.  Back on the Report, the daily table needs its day header: type Mon in B14, select B14:G14 and let Fill Series carry it to Sat.  
    *teach:* Fill Series (Alt, H, F, I, S) opens the Series dialog, which starts on Linear; its AutoFill type (Alt+F) continues the pattern your first cells set across the selection: Mon runs to Sat. Excel knows the days of the week and the months; for numbers it needs two to see the step.  
    *stuck:* pulse cells B14:G14 · Type Mon in B14, Enter; Shift+→ five times; Alt, H, F, I, S; Alt+F for AutoFill; Enter.
9.  The dates go under the days: type 15 and 16 into B15 and C15 as a Tab run, then select B15:G15 and Fill Series carries them on to 20.  
    *teach:* Two numbers set the step, and the Series dialog reads it from them: 15 and 16 run on to 20. Six dates from two, no typing.  
    *stuck:* pulse cells B15:G15 · 15, Tab, 16, Enter; land on B15; Shift+→ five times; Alt, H, F, I, S, Enter.
10.  Does it tie? Change Airport's Monday washes in Raw's C56 to 300 and watch the Airport line of the site totals, I12, answer.  
    *teach:* The feed drives the totals; the Report's timeline is labels and drives nothing until the links go in. Still, the habit: after every job, change one input and watch.  
    *stuck:* pulse cell I12 on Raw · Raw!C56, 300, Enter; I12 moves.

### 1.3.C Challenge: complete the feed

*lesson: challenge-complete-the-feed · 8 goals*

**Brief** **DRAFT** A fresh cut of the Austin feed came in with a day missing, a text figure and typos. Complete it, clean it, then start a Summary tab with a snapshot and the week's timeline, all on the clock.

**Done screen, paragraph** **DRAFT** You entered the missing day, fixed two names and a text figure, pasted a snapshot as values and filled a timeline: the whole of module 1.3 in one run. || The feed is now the shape the CFO expects every Monday.

**Goals** (DRAFT; challenges run without teach or stuck lines)

1.  Airport's Saturday never came through: enter the manager's figures in C61:F61 (250 washes, $14.00, $3,500.00 revenue and $375.00 wash cost).
2.  Mueller is misspelled Muller in one row of the 60-row feed: find it and fix it in place.
3.  Riverside reads Riverisde in three rows: Replace All of them in one step and read the count.
4.  Name the cost per wash on Inputs CostPerWash and put its source in a note on the cell.
5.  The wash count "240" in the Riverside rows was typed as text and sits on the left: make it a number.
6.  Copy the site totals header H7:K7, insert a sheet named Summary in front, drop the header on its A1 and label E1 Snapshot.
7.  With the feed complete, paste Raw's site rows H8:K12 as values onto Summary!A2: a snapshot is values, never a live formula.
8.  Under the snapshot, type Day in A8 and fill a Mon–Sat timeline across B8:G8.

## 1.4 Structure

*module: structure*

**Status** Module 1.4, v1 in the voice, re-skinned to Clearcoat (2026-09-27). Narrowed per Wolf: basic insert, delete, widths and AutoFit moved to 1.2.3; this module is structure with formulas in play. Cedar Park's figures: 210 washes, $2,940.00, $315.00. All DRAFT.

**Story card, title** **DRAFT** Cedar Park opened this week.

**Story card, body** **DRAFT** That means a sixth site row for the Report, a margin column the CFO asked for and a stale column to get rid of, with a total that has to keep up with every edit. Then make the page readable: give the columns equal widths, fit the headers, tuck the working columns away and freeze the heads so they never scroll off.

**Objective (data room)** **DRAFT** Structure with formulas in play: rows and columns that keep the totals honest; the page's columns; hide, group, freeze.

**Page name** The Report, reshaped

### 1.4.1 Rows and columns that keep the totals honest

*lesson: rows-cols-honest-totals · 8 goals*

**Brief** **DRAFT** You inserted and deleted in 1.2.3 on a sheet with no formulas. The Report has a Total row now, and this is what matters: a SUM whose range straddles an inserted row grows to take the new row in, and a SUM whose column you delete turns to #REF!, a message, not damage, and Ctrl+Z puts it back. Cedar Park needs a row inside the block, the old Old code column has to go, and a Margin % column is coming. Watch the total after every edit. The key is `Ctrl+Shift+=`.

**Done screen, line** **DRAFT** The total followed every edit (a new site, a new column, a deleted one) without a formula retyped.

**Done screen, paragraph** **DRAFT** A total that follows its rows is the first check on any page: insert inside the block and the SUM grows, delete a column it reads and it says #REF! instead of lying. Read the error, press Ctrl+Z, and it's back. || Margin % is in and sitting empty for now. It fills in module 1.6, once the page goes live.

**Goals** (all DRAFT)

1.  Cedar Park opened this week: select Airport's row 9 and insert a blank row above it, and the Total in C11 follows to =SUM(C5:C10).  
    *teach:* Shift+Space, then Ctrl+Shift+=. The same insert as 1.2.3, but now watch the formula bar on C11: a SUM whose range straddles the insert grows to take the new row in. Insert inside the block, never below it.  
    *stuck:* pulse cell C11 · Shift+Space on row 9, Ctrl+Shift+=; then read C11 in the formula bar.
2.  Name the new site: type Cedar Park in A9, then fill the week label down from B8 into B9 with Ctrl+D.  
    *teach:* Type and Enter, then B8:B9 and Ctrl+D. One label filled, not retyped: the habit from 1.3.3.  
    *stuck:* pulse cell A9 · A9, type, Enter; then land on B8, Shift+↓, Ctrl+D.
3.  Enter Cedar Park's week across C9:E9 with Tab: 210 washes, $2,940.00 revenue, $315.00 wash cost, and the totals in C11:E11 grow together.  
    *teach:* A Tab run into a row inside the block, and every total above it moves as the figures land. That's the test of a well-built page: new data, no formula touched.  
    *stuck:* pulse cell C9 · 210, Tab, 2940, Tab, 315, Enter.
4.  The Old code column is the old system's: select column I from its header I4 and delete the whole column in one press.  
    *teach:* Ctrl+Space, then Ctrl+−: whole column, one press; Alt, H, D, C is the Ribbon route. Nothing on the page read that column, so nothing breaks. Check before you delete: Ctrl+] on a cell shows what depends on it (1.6.6).  
    *stuck:* pulse column I · Land on I4, Ctrl+Space, Ctrl+−.
5.  Margin % belongs before Prior week rev: insert a column at H and type Margin % in H4, and the header comes out bold.  
    *teach:* Ctrl+Space on H, Ctrl+Shift+=, then type the header. The new column takes the formatting of the one to its left, which is why the header arrives bold.  
    *stuck:* pulse cell H4 · Land in column H, Ctrl+Space, Ctrl+Shift+=; H4, type, Enter.
6.  On Raw, delete the Revenue column E and read the site totals block: every Revenue SUM now says #REF! instead of a number.  
    *teach:* #REF! means the formula pointed at a cell that no longer exists. Delete a column a SUM reads and it breaks, loudly, which is the point. Never paste a number over a #REF!; find what it read.  
    *stuck:* pulse the totals block on Raw · Ctrl+PgDn to Raw; land in column E, Ctrl+Space, Ctrl+−; read J8.
7.  Read the error, then undo: Ctrl+Z brings the Revenue column back and Domain's Revenue SUM in J8 reads a number again.  
    *teach:* Ctrl+Z undoes the delete, formulas and all. An error you can read and undo costs seconds; a wrong number that looks right costs a deal.  
    *stuck:* pulse cell J8 on Raw · One Ctrl+Z; J8 shows a figure again.
8.  Does it tie? Change Cedar Park's washes in C9 to 300 and watch the Total in C11 answer.  
    *teach:* The new row is inside the SUM, so it counts. If C11 didn't move, the row went in below the block, and that's the check you run after every insert.  
    *stuck:* pulse cell C11 on Report · Ctrl+PgUp to Report; C9, 300, Enter; C11 moves.

### 1.4.2 The page's columns

*lesson: widths-heights-autofit · 7 goals*

**Brief** **DRAFT** The Report's columns are still Excel's defaults: South Lamar is cut off, the headers are clipped, and every column is 8.43 characters wide. A page reads when its period columns share one width, its comparison columns another, its label column fits the longest name, and its headers wrap instead of spilling. Widths and AutoFit you know from 1.2.3; the new idea is which columns get set by hand and which get AutoFit. The key is `Alt H O W`.

**Done screen, line** **DRAFT** The days share one width, the labels fit and the headers wrap. It reads like a page now.

**Done screen, paragraph** **DRAFT** Period columns are set by hand to one width, because AutoFit fits whatever happens to be in a column, and one stray label lower down leaves the days ragged. Label columns and wrapped header rows get AutoFit, because that's what it's for. || Top-bucket tip: keep column A narrow as a margin and put the labels in B. Then make every period column the same width to the character, because reviewers notice.

**Goals** (all DRAFT)

1.  The daily table's six day columns B:G should share one width: select them from the timeline row and set Column Width 12.  
    *teach:* Select the columns first (Ctrl+Space, then Shift+→ across), then Alt, H, O, W, 12, Enter. One width for every period column is the convention on any page with a timeline.  
    *stuck:* pulse columns B:G · Land on B14, Ctrl+Space, Shift+→ five times; Alt, H, O, W, 12, Enter.
2.  Margin % and Prior week rev in H:I are the comparison columns: select both from the header row and set them to 14, or press F4.  
    *teach:* Same command, or F4 to repeat the last width if you set it a moment ago. Comparison columns can be wider than period columns; they just have to match each other.  
    *stuck:* pulse columns H:I · Land on H4, Ctrl+Space, Shift+→; Alt, H, O, W, 14, Enter.
3.  Fit the label column to its site names, not the title: select A5:A11 and AutoFit, and column A sizes to South Lamar.  
    *teach:* AutoFit on a selected range fits only those cells; AutoFit on a whole column fits everything in it, title included, which would make A absurdly wide. Select the names, then Alt, H, O, I.  
    *stuck:* pulse cells A5:A11 · Select A5:A11 with Shift+↓, then Alt, H, O, I.
4.  At these widths the headers B4:I4 are clipped: select them from B4, wrap the text, then AutoFit row 4 to two lines.  
    *teach:* Wrap Text (Alt, H, W) folds a long header inside its cell; AutoFit Row Height (Alt, H, O, A) then sizes the row to the wrapped lines. Headers wrap; figures never do.  
    *stuck:* pulse cells B4:I4 · Select B4:I4, Alt, H, W; then Alt, H, O, A.
5.  The title row is cramped: set row 1 to height 24.  
    *teach:* Row Height (Alt, H, O, H) in points. A title row a little taller than the rest is the one height exception on a page.  
    *stuck:* pulse row 1 · Land on A1; Alt, H, O, H, 24, Enter.
6.  See why the day columns were set by hand: AutoFit B:G at once, read the uneven widths, then Ctrl+Z puts the equal 12 back.  
    *teach:* AutoFit reads every cell in the column, so the week label in row 13 and a long note make the days ragged. Hand-set widths for periods, AutoFit for labels. That's the rule, and now you've seen why.  
    *stuck:* pulse columns B:G · Select B:G, Alt, H, O, I, look, then Ctrl+Z.
7.  Does it tie? Change Cedar Park's washes in C9 to 300 and watch the Total in C11 answer through the new widths.  
    *teach:* Widths change nothing underneath. The habit stays: after every job, one input, one look.  
    *stuck:* pulse cell C11 · C9, 300, Enter; C11 moves.

### 1.4.3 Hide, group, freeze

*lesson: hide-group-freeze · 8 goals*

**Brief** **DRAFT** The Report's Wash cost and Gross profit columns are workings the reader doesn't need, and a buyer's analyst who finds a hidden column will wonder what else is hidden. Hide them the way most people do, then unhide them and group them instead, because a grouped column shows a button and folds away while a hidden one disappears. Then freeze the heads so the page scrolls without losing them. The key is `Alt+Shift+→`.

**Done screen, line** **DRAFT** The workings are grouped, not hidden, and the heads stay put when the page scrolls.

**Done screen, paragraph** **DRAFT** A hidden column gets forgotten; a grouped one shows its button and folds away when the reader wants the page clean. Freeze panes at the first figure cell and the title, units, header row and site labels stay in view however far you scroll. || One more from the desk: Ctrl+Shift+0, the unhide-columns key, is blocked on most Windows machines by a keyboard-layout shortcut, so the reliable route is Alt, H, O, U, L. Now you know why nobody's Ctrl+Shift+0 works.

**Goals** (all DRAFT)

1.  Wash cost and Gross profit are working columns: select the whole of E:F from the header row and hide them with Ctrl+0.  
    *teach:* Ctrl+0 hides the selected columns and Ctrl+9 hides rows. The columns are still there (formulas still read them), but a reader can't see them, and that's the problem.  
    *stuck:* pulse columns E:F · Land on E4, Ctrl+Space, Shift+→; then Ctrl+0.
2.  A buyer's analyst will find a hidden column and wonder what else is hidden: select D:G across the gap and unhide with Alt, H, O, U, L.  
    *teach:* Select across the hidden columns, then Home › Format › Hide & Unhide › Unhide Columns (Alt, H, O, U, L). The shortcut you'll see in lists, Ctrl+Shift+0, is blocked on most Windows machines, so learn the route that always works.  
    *stuck:* pulse columns D:G · Land on D4, Ctrl+Space, Shift+→ three times; Alt, H, O, U, L.
3.  Rows hide the same way: select the whole daily table, rows 13:21, hide them with Ctrl+9, then bring them back with Ctrl+Shift+(.  
    *teach:* Ctrl+9 hides rows; Ctrl+Shift+9 (Ctrl+Shift+() unhides them, and that one isn't blocked. Alt, H, O, U, O is the Ribbon route for rows.  
    *stuck:* pulse rows 13:21 · Land on A13, Shift+Space, Shift+↓ eight times; Ctrl+9; then Ctrl+Shift+9.
4.  Group, don't hide: select the whole of E:F again and group the two working columns with Alt+Shift+→.  
    *teach:* Alt+Shift+→ groups the selected whole columns (or rows) into an outline with a button above them to fold and unfold; Alt+Shift+← ungroups. Alt, A, G, G is the Ribbon route. On a Mac, ⌘⇧K and ⌘⇧J.  
    *stuck:* pulse columns E:F · Land on E4, Ctrl+Space, Shift+→; Alt+Shift+→.
5.  Fold the group with Hide Detail, Alt, A, H: the two columns tuck behind an outline button instead of vanishing.  
    *teach:* Hide Detail folds a group; the button with the plus sign stays visible, so the reader knows something is there and can open it. That's the difference from hiding.  
    *stuck:* pulse the outline button · With a cell in E:F selected, Alt, A, H.
6.  Unfold it with Show Detail, Alt, A, J: the workings are there when a reader wants them, and the group stays.  
    *teach:* Show Detail unfolds; the group stays defined either way. Ctrl+8 shows and hides the outline symbols themselves.  
    *stuck:* pulse the outline button · Alt, A, J from a cell beside the group.
7.  The title, units, header row and site column must stay in view: land on B5 and freeze panes there with Alt, W, F, F.  
    *teach:* Freeze Panes (Alt, W, F, F) pins every row above and every column left of the active cell so they stay put as the sheet scrolls. Land on the first figure cell, B5 here, and the heads and labels are frozen; Alt, W, F, F again unfreezes.  
    *stuck:* pulse cell B5 · Ctrl+Home, ↓ four times, → once; Alt, W, F, F.
8.  Does it tie? Change Cedar Park's washes in C9 to 300 and watch the Total in C11 answer, with the heads frozen in place.  
    *teach:* Grouping and freezing change nothing underneath. Scroll down: the title and headers stay; the total still moves.  
    *stuck:* pulse cell C11 · C9, 300, Enter; C11 moves; PgDn to see the heads hold.

### 1.4.C Challenge: reshape the report

*lesson: challenge-reshape-the-report · 6 goals*

**Brief** **DRAFT** The San Antonio cluster's report arrived with a site missing, a stale column, uneven widths, a hidden column and nothing frozen. Reshape it so it reads like a page, with the totals still tying, and do it on the clock.

**Done screen, paragraph** **DRAFT** You put a row inside the block, deleted a dead column, evened the widths, found the hidden column and grouped it instead, and froze the heads. And the total followed every edit. || That's what reshaping a page means on a desk, and it's the same six moves on every page you'll ever inherit.

**Goals** (DRAFT; challenges run without teach or stuck lines)

1.  The Depot site opened: insert a row inside the block, above the last site, and enter Depot, 180 washes, $2,520 revenue, $270 wash cost.
2.  Old code in column H is the old system's site code: delete the whole column, not just its cells.
3.  The six figure columns B:G are six different widths: select them from the header row and set Column Width 12.
4.  A figure column is hidden, and a buyer's analyst would find it and wonder: unhide it inside the same selection.
5.  Gross profit and Avg ticket in E:F are working columns: group them rather than hiding them.
6.  Freeze the panes at B4 so the title, units, header row and site column stay in view.

## 1.5 Format

*module: format*

**Status** Module 1.5, v2 (2026-09-27, after Wolf's markup: dialog navigation in 1.5.3; 1.5.4 rebuilt around Paste Special Formats for a whole table and F4 for repeats; the CFO's three-word email on the story card). The story card is Wolf's Round 6 line; 1.5.2's done screen is his top-border line. Costs' figures re-skinned (rent, maintenance, card fees). All DRAFT.

**Story card, title** **DRAFT** The numbers are right, so now make them readable.

**Story card, body** **DRAFT** The numbers are right, and your job still isn't finished. The CFO answered from an iPhone, and the whole email was three words: pls fix, thx. You can have every number right and it counts for nothing if nobody can read the page, so set the thousands separators, line up the decimals, put the negatives in parentheses, bold the totals with a line on top and center the title across the page. Do each by hand once, then do the whole page in a single pass.

**Objective (data room)** **DRAFT** Numbers a banker can read; fonts, fills, borders; alignment and titles; the style pass with F4.

**Page name** The Report, formatted

### 1.5.1 Numbers a banker can read

*lesson: numbers-a-banker-can-read · 9 goals*

**Brief** **DRAFT** The Report's figures are typed the way the feed sent them, with stray decimals and no thousands separators, and a reader who has to squint at 18439.2 in a total stops trusting the page. Format Cells (Ctrl+1) sets the desk number format (a thousands separator, no decimals and a negative in parentheses) from the Number category on its Number tab. The chords Ctrl+Shift+1, 4 and 5 apply Number, Currency and Percent in one press, and Alt, H, 9 and 0 take a decimal off and put one on. The key is `Ctrl+1`.

**Mac note (mac_note)** **DRAFT** Some Mac and non-US regional settings don't list the (1,234) choice under Negative numbers. There, choose Custom at the bottom of the Category list and type #,##0_);(#,##0) into the Type box: it's the same format, written out by hand.

**Done screen, line** **DRAFT** Every figure has its commas, its decimals and its $ where they belong, and one format runs down each line.

**Done screen, paragraph** **DRAFT** Every figure on the Report now reads the way a banker formats it: one decimals setting down each line, the $ on the first and total rows only, negatives in parentheses by style rather than a leading minus. Ctrl+1 set the desk number format once, F4 and Paste Formats repeated it, and the chords did the counts, the currency and the percent in one press each. || Top-bucket tip: percentages to one decimal, currency to none, per-unit figures to two, and never mix decimals down a column.

**Goals** (all DRAFT)

1.  Select the wash counts C5:C11, Total included, and set the desk number format in Ctrl+1: Number, no decimals, the separator, (1,234).  
    *teach:* A number format changes how a value shows, not the value itself. Format Cells (Ctrl+1) opens with the keyboard on its row of tabs, where N is the Number tab; Tab steps into the Category list, and there N picks Number with its three settings: Decimal places, Use 1000 Separator and Negative numbers. Set 0, tick the separator and pick (1,234): that's the desk number format, which Excel stores as the code #,##0_);(#,##0), and every dollar figure and every check in this course carries it.  
    *stuck:* pulse the Format Cells dialog · Select C5:C11; Ctrl+1; N for the Number tab; Tab, then N for Number; Decimal places 0; tick Use 1000 Separator; pick (1,234) under Negative numbers; Enter.
2.  Revenue, Wash cost and Gross profit D5:F11 take the same format: select them and press F4, so a loss would read in parentheses.  
    *teach:* F4 repeats your last action, and a whole trip through Format Cells counts as one action, so the desk number format lands on the new block in one press. It shows a negative in parentheses, which is the convention: never a leading minus on a page. Alt, H, 9 takes a decimal off and Alt, H, 0 puts one on, for the lines that need them.  
    *stuck:* pulse cells D5:F11 · Select D5:F11 straight after goal 1, then one F4; if another action came between, Ctrl+1 and the same three settings.
3.  The $ goes on a money column's first and total rows only: make D5:F5, D11:F11 and Prior week's I5 currency with no decimals in Ctrl+1.  
    *teach:* The currency sign sits on the first row and the total row of a money column, and nowhere in between. A page full of $ is noise. In Ctrl+1 the same steps reach Currency (N, Tab, then C) with decimals at 0 and ($1,234) under Negative numbers, so a loss on a $ row reads in parentheses like the rows between.  
    *stuck:* pulse cells D5:F5 · Select D5:F5; Ctrl+1; N, Tab, C; decimals 0; ($1,234); Enter; F4 on D11:F11 and on I5.
4.  Prior week rev I6:I10 gets the desk number format by Paste Formats from D6, Cedar Park's empty I9 included, while I5 keeps the column's $.  
    *teach:* Format the whole span, empty cells included, so a figure typed later comes out right. The $ stays on I5 above; the body takes the desk number format, and once another action has taken F4's place, Paste Special Formats (1.3.4) from a cell that carries it is the repeat.  
    *stuck:* pulse cells I6:I10 · Copy D6; select I6:I10; Ctrl+Alt+V, T, Enter.
5.  Avg ticket ($/wash) shows cents: select G5:G11 from the bottom, Ctrl+Shift+↑ then Shift+↓ off the header, then currency, Ctrl+Shift+4.  
    *teach:* Ctrl+Shift+4 is currency with two decimals in one press, right for a per-unit figure like a ticket price. Selecting from the bottom with Ctrl+Shift+↑ runs to the header; Shift+↓ steps back off it.  
    *stuck:* pulse cells G5:G11 · Land on G11, Ctrl+Shift+↑, Shift+↓; Ctrl+Shift+4.
6.  Margin % H5:H11 reads as a percentage to one decimal: select it the same way, Ctrl+Shift+5 for percent, then Alt, H, 0 for the decimal.  
    *teach:* Ctrl+Shift+5 is percent with no decimals; Alt, H, 0 adds one. One decimal on a percentage is the convention: 41.2%, not 41% and not 41.23%.  
    *stuck:* pulse cells H5:H11 · Land on H11, Ctrl+Shift+↑, Shift+↓; Ctrl+Shift+5; Alt, H, 0.
7.  The daily table B17:G21 will hold thirty wash counts: format the whole block at once with Ctrl+Shift+1, then Alt, H, 9 twice.  
    *teach:* Ctrl+Shift+1 applies Number with a thousands separator and two decimals in one press, and Alt, H, 9 takes a decimal off. It shows a negative with a minus sign, so keep it for counts that can't go below zero, like washes; dollar lines and checks take the desk number format. Format the block before the figures arrive and every link that lands there comes out right.  
    *stuck:* pulse cells B17:G21 · Land on B17, Ctrl+Shift+→, Ctrl+Shift+↓; Ctrl+Shift+1; Alt, H, 9 twice.
8.  On Inputs, the cost per wash B4 is quoted to the cent: currency with two decimals, Ctrl+Shift+4.  
    *teach:* A per-unit input keeps the decimals it's quoted to. $1.50, not $2 and not $1.5000.  
    *stuck:* pulse cell B4 on Inputs · Ctrl+PgDn to Inputs, B4, Ctrl+Shift+4.
9.  Does it tie? Change Cedar Park's washes in C9 to 300 and watch the Total in C11 answer, thousands separator and all.  
    *teach:* The format rides on the cell; the value moves underneath it. Change an input, and the total updates in the format you set.  
    *stuck:* pulse cell C11 on Report · Ctrl+PgUp to Report; C9, 300, Enter.

### 1.5.2 Fonts, fills, borders

*lesson: fonts-fills-borders · 7 goals*

**Brief** **DRAFT** The Report's figures read right, but nothing on the page tells the eye where to look: the title, the headers and the total row all sit in plain text. Bold the title and take it one size up, bold the header and total rows, give the total row a top border (a top border, never a grid) and tint the input block on Inputs so a reader knows what they're allowed to change. The key is `Alt H B`.

**Done screen, line** **DRAFT** Bold where it matters and a line over the total. The eye knows where to go now.

**Done screen, paragraph** **DRAFT** You put a top border on the total row, and top borders are preferred because you can insert rows of data above them and never have to fix the total's border. The title is the one cell on the page a size up, and the input block on Inputs carries the tint that says "change these". || Top-bucket tip: use no vertical borders ever, put a double bottom border on the final total of a statement, and add no fills except the input tint. A grid is not structure, and a top border is.

**Goals** (all DRAFT)

1.  The title in A1 is plain text: make it bold with Ctrl+B so the page has a heading.  
    *teach:* Ctrl+B makes the selection bold, Ctrl+I italic and Ctrl+U underlined; on a mixed selection they follow the active cell, so start from a plain cell and every cell goes on.  
    *stuck:* pulse cell A1 · Ctrl+Home, then Ctrl+B.
2.  One font, one size, and the title is the one exception: take A1 one size up with Increase Font Size, Alt, H, F, G.  
    *teach:* Alt, H, F, G grows the font a step; Alt, H, F, K shrinks it. Everything else on the page stays one size. The title being bigger is what makes it the title.  
    *stuck:* pulse cell A1 · Alt, H, F, G once.
3.  Site and Week in A4:B4 were never bold: select the whole header row 4 with Shift+Space and one Ctrl+B bolds every header at once.  
    *teach:* Shift+Space, then Ctrl+B: a whole row dressed in two presses. Formatting a row or a column whole is faster than selecting the cells, and it catches the ones you'd miss.  
    *stuck:* pulse row 4 · Land on A4, Shift+Space, Ctrl+B.
4.  Jump down the site list to the Total in A11, select the whole row 11 with Shift+Space and make the total row bold.  
    *teach:* Ctrl+↓ from A4 lands on the total; Shift+Space, Ctrl+B. A total row is bold on every page in the pack.  
    *stuck:* pulse row 11 · Ctrl+↓ to A11, Shift+Space, Ctrl+B.
5.  A total takes a top border, never a grid: with row 11 still selected, add the top border with Alt, H, B, P.  
    *teach:* The Borders menu is Alt, H, B, then a letter: P top, O bottom, A all borders, N none. A top border on the total survives rows inserted above it; a grid has to be redrawn every time.  
    *stuck:* pulse row 11 · Alt, H, B, P with row 11 selected.
6.  On Inputs, the cells a reader may change are B3:B6: select the block and tint it light blue with Alt, H, H, then Enter.  
    *teach:* Fill Color is Alt, H, H, then Enter for the first tint or the arrows to another swatch. A fill marks a block of inputs so a reader can find them; it never carries meaning about the value itself.  
    *stuck:* pulse cells B3:B6 on Inputs · Ctrl+PgDn to Inputs; B3, Shift+↓ three times; Alt, H, H, Enter.
7.  Does it tie? Change Cedar Park's washes in C9 to 300 and watch the Total in C11 answer, in bold above its top border.  
    *teach:* Fonts and borders ride on the cells, and the SUM underneath doesn't care, so the total still moves.  
    *stuck:* pulse cell C11 on Report · Ctrl+PgUp to Report; C9, 300, Enter.

### 1.5.3 Alignment and titles

*lesson: alignment-and-titles · 8 goals*

**Brief** **DRAFT** The Report's figures and fonts are right, but the title sits in the corner, the headers sit left while their numbers sit right, and the daily table's lines all start flush. Center the title across the page without merging (Center Across Selection, never Merge & Center, because a merged cell breaks selection, fill and sorting for everyone after you), right-align the headers over numbers, indent the daily lines, and learn to move around a dialog without the mouse while you're in Format Cells. The key is `Ctrl+1`.

**Done screen, line** **DRAFT** The title is centered across the page, and not one cell was merged to do it.

**Done screen, paragraph** **DRAFT** The title is centered across the page and no cell was merged, so Ctrl+Shift+→ still sweeps the row and every fill and sort will still work. Headers sit over their numbers; the daily lines sit under their heading; the hierarchy reads without a word added. || Best practice: if you ever inherit a page with merged cells, unmerge them first (Alt, H, M, U) and center across instead. Everyone after you will thank you.

**Goals** (all DRAFT)

1.  The title in A1 belongs over the page: select A1:I1 and center it across the selection with Ctrl+1, then A, never Merge & Center.  
    *teach:* Ctrl+1, then the Alignment tab (A), then Horizontal › Center Across Selection: the title sits centered over the selected columns and every cell stays its own cell. Merge & Center (Alt, H, M, C) looks the same and breaks selection, fill and sorting: the one Ribbon button you'll learn to avoid.  
    *stuck:* pulse the Format Cells dialog · Select A1:I1; Ctrl+1; A; Alt+H for Horizontal; pick Center Across Selection; Enter.
2.  Open Format Cells on A1 again, walk its tabs with Ctrl+PgDn (Number, Alignment, Font, Border, Fill, Protection), then press Esc.  
    *teach:* Inside a dialog, Ctrl+PgDn and Ctrl+PgUp (or Ctrl+Tab) move between its tabs; Tab moves between the fields on a tab; Alt plus an underlined letter jumps to one; Space ticks a box; ↑ ↓ pick from a list; Enter is OK and Esc is Cancel. Every dialog in Excel works this way, so learn it on this one.  
    *stuck:* pulse the Format Cells tabs · Ctrl+1, then Ctrl+PgDn five times, reading each tab, then Esc.
3.  Go to A1 and press Ctrl+Shift+→, and notice the selection still sweeps the row in one press, where a merged title would have stopped you.  
    *teach:* That's the proof. Across a merged cell the jump stops; across a centered one it runs. Every fill, sort and copy on the page depends on that.  
    *stuck:* pulse row 1 · Ctrl+Home, then Ctrl+Shift+→.
4.  Numbers align right, so their headers should too: select Washes through Prior week rev, C4:I4, and right-align them with Alt, H, A, R.  
    *teach:* Alignment is Alt, H, A, then L left, C center, R right. A header sits over its numbers when it's aligned the way they are: right over figures, left over names.  
    *stuck:* pulse cells C4:I4 · Land on C4, Ctrl+Shift+→; Alt, H, A, R.
5.  The units line USD unless stated in A2 is a note, not a figure: make it italic with Ctrl+I so it reads as one.  
    *teach:* Italic is for notes, units and footnotes: text that explains the page rather than being part of it.  
    *stuck:* pulse cell A2 · A2, Ctrl+I.
6.  The eight lines under Washes by day belong to it: jump to A13, select A14:A21 below it and indent them once with Alt, H, 6.  
    *teach:* Alt, H, 6 indents a level; Alt, H, 5 takes one back. Indent sub-items with the indent button, never with spaces. Spaces break sorting and lookups later.  
    *stuck:* pulse cells A14:A21 · Land on A14, Ctrl+Shift+↓ (stops at A21); Alt, H, 6.
7.  On Inputs, the source note per supplier quote in C4 runs past its column: wrap it inside the cell with Alt, H, W.  
    *teach:* Wrap for labels and notes, never for figures. The row grows to fit and the column stays narrow.  
    *stuck:* pulse cell C4 on Inputs · Ctrl+PgDn to Inputs; C4; Alt, H, W.
8.  Does it tie? Change Cedar Park's washes in C9 to 300 and watch the Total in C11 answer under the centered title.  
    *teach:* Alignment rides on the cells; the SUM underneath doesn't care.  
    *stuck:* pulse cell C11 on Report · Ctrl+PgUp to Report; C9, 300, Enter.

### 1.5.4 The style pass

*lesson: the-style-pass · 7 goals*

**Brief** **DRAFT** A manager sent the Costs sheet in General format with an all-borders grid over the whole block, so it doesn't read like the rest of the file, and Inputs and the totals block on Raw have grids too. Two ways to format at speed: Paste Special Formats copies a whole table's format onto another table in one paste, and F4 repeats the last action on the next block, and the next. Copy the Report's format onto Costs, then take three grids off with one command and two F4s. The key is `F4`.

**Done screen, line** **DRAFT** One paste dressed a table. One command and two F4s cleared three grids.

**Done screen, paragraph** **DRAFT** Paste Special Formats carries everything a block wears (number formats, bold, alignment, borders) onto another block the same shape, so a page you've already formatted becomes the template for the next one. F4 repeats a single action wherever you land: do it once, F4 the rest. Between them, formatting stops being work. || The Borders button on the toolbar you built in 1.1.4 (Alt and its number on your toolbar) opens the menu All Borders sits in, the command that drew these grids. Now you know how to undo everyone else's.

**Goals** (all DRAFT)

1.  Copy the Report's figure block with its headers, C4:F9, and Paste Special Formats onto Costs!B3 to dress the whole table in one paste.  
    *teach:* Paste Special, T for formats, pastes the source block's formatting cell for cell onto the destination: the desk number format, the $ on the first row, bold right-aligned headers, all of it, and none of the numbers. A block you've formatted once is the template for every block like it.  
    *stuck:* pulse cell B3 on Costs · Select C4:F9 on Report, Ctrl+C; Ctrl+PgDn to Costs, land on B3; Ctrl+Alt+V, T, Enter.
2.  The grid on Costs: select the block A3:E8 with Ctrl+A and take every border off with Alt, H, B, N.  
    *teach:* Alt, H, B, N removes every border in the selection: one action, start to finish, which is what F4 will repeat. A grid is not structure; a top border on a total is.  
    *stuck:* pulse cells A3:E8 · Land inside the block, Ctrl+A; Alt, H, B, N.
3.  Inputs has the same grid: go there, select its block A3:C14 and press F4.  
    *teach:* F4 repeats your last action on whatever is selected now, so the borders you removed on Costs come off Inputs with one key.  
    *stuck:* pulse cells A3:C14 on Inputs · Ctrl+PgUp to Inputs; land on A3, Ctrl+A; F4.
4.  And the totals block on Raw, H7:K13: select it and press F4 again.  
    *teach:* Third block, third grid, and still one key, because F4 keeps repeating the same action until you do something else.  
    *stuck:* pulse cells H7:K13 on Raw · Ctrl+PgUp to Raw; land on H7, Ctrl+A; F4.
5.  Back on Costs, Total ($/wk) is the column a reader looks for first: select E4:E8 and make it bold with Ctrl+B.  
    *teach:* The answer column is bold; the inputs aren't. Bold says "read this one".  
    *stuck:* pulse cells E4:E8 · Ctrl+PgDn to Costs; E4, Ctrl+Shift+↓, Ctrl+B.
6.  Set Costs' figure columns B:E to width 12 with Alt, H, O, W, then land in Inputs' figure column B and press F4.  
    *teach:* Any action, any block: widths repeat too. Equal widths across a file's figure columns is one of the things a reviewer notices without knowing why.  
    *stuck:* pulse columns B:E on Costs · B4, Ctrl+Space, Shift+→ three times; Alt, H, O, W, 12, Enter; then on Inputs, column B, F4.
7.  Does it tie? Change Domain's rent in B4 on Costs to 2,500 and watch its Total in E4 answer, bold and with its thousands separator.  
    *teach:* Costs' totals are live formulas, the ones you'll audit in 1.6.6. Change a rent, watch the total.  
    *stuck:* pulse cell E4 on Costs · B4, 2500, Enter; E4 moves.

### 1.5.C Challenge: the desk's format in three minutes

*lesson: challenge-to-standard-in-three-minutes · 6 goals*

**Brief** **DRAFT** The San Antonio cluster's weekly report arrived as a bordered grid of General numbers with a minus sign in the gross profit. Give it the desk's format in three minutes, from the figures, Ctrl+1's Number category with the (1,234) negative, to the centered title.

**Done screen, paragraph** **DRAFT** You formatted the figures, took the grid off, bolded the total with a top border, colored the inputs and centered the title: the whole format module in six moves. || On a desk that's a three-minute job on every page, every week. Now it is for you.

**Goals** (DRAFT; challenges run without teach or stuck lines)

1.  The figures C5:F10 are General with stray decimals: give them the desk number format, so the Gross profit loss reads in parentheses.
2.  Margin % in G5:G10 is a fraction: show it as a percentage to one decimal, Total included.
3.  A grid of borders sits over the whole block A4:G10: remove every border from it, because a grid is not structure.
4.  The Total row A10:G10 is a total: make it bold and give it a single top border.
5.  Only the typed figures in C5:E9 are inputs: color them blue, and leave the formulas beside them in automatic black.
6.  The title in A1 belongs over the page: center it across A1:G1 with Center Across Selection, never a merge.

## 1.6 Formulas

*module: formulas*

**Status** Module 1.6, v1 in the voice, re-skinned to Clearcoat (2026-09-27). Anchors and linking get opening demos and the full treatment Wolf asked for (M31, M42); the hardcode-in-a-formula fix and the named cell live in 1.6.1; the sheet key is written with its browser alias. All DRAFT.

**Story card, title** **DRAFT** Now make the page live.

**Story card, body** **DRAFT** Right now the Report is typed numbers, so if the feed changes you'd be retyping all of it. Link every figure back to Raw and Inputs and a fix upstream flows through on its own. This is the module where the page stops being a copy of the numbers and starts being a model of them.

**Objective (data room)** **DRAFT** SUM and its family, relative and absolute references, links across sheets, the errors and what they mean.

**Page name** The Report, live

### 1.6.1 Point, don't type

*lesson: point-dont-type · 9 goals*

**Demo before the goals** **DRAFT** Before the goals: a formula being built by pointing (= is typed, the arrow keys walk to a cell and its address appears in the formula, an operator, another cell, Enter); then F2 on the finished cell shows the two references lit in color on the sheet. (M31)

**Brief** **DRAFT** A formula starts with = and recalculates the moment an input changes, and that's the difference between a spreadsheet and a calculator. You build one by pointing: type =, walk to the cell with the arrow keys and its address writes itself, type the operator, point at the next cell, Enter, but never type an address you can point at, because typing is where the wrong-cell errors come from. The CFO wants three calculated lines beside the site figures: gross profit, average ticket and margin. Build each once by pointing, then fill them down in one press. The key is `=`.

**Done screen, line** **DRAFT** Three formulas built by pointing and filled down six sites in one press.

**Done screen, paragraph** **DRAFT** = then the arrow keys wrote D5 and E5 for you, and F2 showed them lit in color when you read them back. One row of three formulas, filled down the sites in one press, and Domain's average ticket answers the moment its washes change. || Fix from earlier: the cost per wash was typed inside a formula on Inputs. Now it references its own cell, by address or by the name you gave it, and one change moves every formula that reads it. || Desk habit worth knowing: + starts a formula too. Type +D5−E5 and Excel writes =+D5−E5, the same formula, because on a numeric keypad + sits under your hand and = doesn't, and the analysts who live on the keypad start every formula that way. Here it counts the same as = (M63).

**Goals** (all DRAFT)

1.  Domain's gross profit is revenue less wash cost: build =D5−E5 in F5 by pointing at the two cells with the arrow keys, not typing them.  
    *teach:* Type =, press ← twice and D5 writes itself into the formula, type −, press ← once for E5, Enter. While a formula is open, each arrow key points at a cell and writes its reference; the cell you're pointing at is outlined in color. If the cell shows the formula's text instead of a result, the = is missing, or has a space or an apostrophe in front of it.  
    *stuck:* pulse cell F5 · F5, then =, ← ←, −, ←, Enter.
2.  Domain's average ticket is revenue divided by washes: build =D5/C5 in G5 by pointing, jumping the pointer across the row with Ctrl+←.  
    *teach:* Ctrl and an arrow works while pointing too, jumping the pointer to the edge the way it jumps the cursor, so a long row costs you no counting.  
    *stuck:* pulse cell G5 · G5, =, Ctrl+← then → to reach D5, /, Ctrl+← then → → to C5, Enter.
3.  Domain's margin is gross profit divided by revenue: build =F5/D5 in H5 the same way.  
    *teach:* Third formula, same move. Margin is what's left of a dollar of revenue after the wash costs, a buyer's first question about any site.  
    *stuck:* pulse cell H5 · H5, =, ← ←, /, ← ←, Enter.
4.  Read one back before you trust it: open F5 with F2 so its inputs D5 and E5 light up in color on the sheet, then leave it unchanged with Esc.  
    *teach:* F2 on a formula colors each reference and outlines the cell it points at, the fastest audit there is. Read a formula before you fill it; a wrong one filled down is six wrong ones.  
    *stuck:* pulse cell F5 · F5, F2, look, Esc.
5.  Five sites still have no calculated lines: select F5:H10 with Domain's three formulas at the top and fill them down with Ctrl+D.  
    *teach:* Ctrl+D fills the top row's formulas down the selection, and each reference shifts a row as it goes: D5−E5 becomes D6−E6. That's a relative reference, and it's why one formula per row is the rule.  
    *stuck:* pulse cells F5:H10 · Land on F5, Shift+→ twice, Shift+↓ five times; Ctrl+D.
6.  The fill carried Domain's $ sign down the gross-profit column: put F6:F10, and only those, back in the desk number format.  
    *teach:* A fill carries formats as well as formulas, so the $ from the first row went with it. Copy E6 and Paste Special Formats (Ctrl+Alt+V, T) onto F6:F10 to put the body back in the desk number format; the $ stays on F5 and the total row. Next time, copy the formulas and Paste Special Formulas (Ctrl+Alt+V, F, from 1.3.4), and the formats underneath are never touched.  
    *stuck:* pulse cells F6:F10 · Copy E6; select F6:F10; Ctrl+Alt+V, T, Enter.
7.  On Inputs, B14 still has the cost typed inside it, =B6*1.5: change it to =B6*B4, so it references the input cell.  
    *teach:* F2 opens the cell in Edit mode, where the arrows move the caret inside the formula. Backspace the 1.5 out and press F2 again (the status bar, bottom left, goes from Edit to Enter), and now ↑ ten times points at B4, the way the arrows point in a new formula. One input, one cell, every formula references it: when the chemical price changes, B4 changes and B14 follows.  
    *stuck:* pulse cell B14 on Inputs · Ctrl+PgDn to Inputs; B14, F2, Backspace three times, F2 again, ↑ to B4 (or type B4), Enter.
8.  Same formula, other way to say it: change B14 to =B6*CostPerWash, the name you gave B4 in 1.3.5.  
    *teach:* A name works anywhere an address does, and reads like English. Use names for a handful of key inputs (the price, the rate, the toggle), never for everything; Chapter 4 sets the rules.  
    *stuck:* pulse cell B14 on Inputs · F2, Backspace twice, type CostPerWash, Enter.
9.  Does it tie? Change Domain's washes in C5 to 300 and watch its average ticket in G5 answer.  
    *teach:* The three lines are live now. Change one input and every formula that reads it moves. The page is starting to behave like a model.  
    *stuck:* pulse cell G5 on Report · Ctrl+PgUp to Report; C5, 300, Enter; G5 moves.

### 1.6.2 SUM family and AutoSum

*lesson: sum-family-and-autosum · 8 goals*

**Brief** **DRAFT** The total row is missing its Gross profit SUM, the total's average ticket and margin are still blank, and the CFO wants a week summary under the report: the average, best and lowest site, and a count of the figures and of the site names. Alt+= is AutoSum: on one empty cell it proposes a SUM over the numbers above; over a whole block it writes every column's SUM into the row below in one press. AVERAGE, MAX, MIN, COUNT and COUNTA take the same kind of range. The key is `Alt+=`.

**Done screen, line** **DRAFT** Every column's total in one press, and a week summary that reads the sites.

**Done screen, paragraph** **DRAFT** Alt+= over the six sites' figures wrote every column's SUM into the row below at once. That's the move: AutoSum the whole block plus its empty edge, never one column at a time. || The week summary reads the six sites with AVERAGE, MAX, MIN, COUNT and COUNTA. Clear one site's washes and the average and COUNT move while COUNTA doesn't, because a blank is not a zero.

**Goals** (all DRAFT)

1.  Select the six sites' figures C5:F10 and press Alt+= once: every column's SUM lands in the total row, Gross profit's F11 included.  
    *teach:* AutoSum, Alt+=, on one empty cell proposes a SUM over the numbers above it; over a whole block it writes every column's SUM into the row below in one press. Select the block, not the total row.  
    *stuck:* pulse cells C5:F10 · Land on C5, Ctrl+Shift+→ to F5, Ctrl+Shift+↓ to row 10; Alt+=.
2.  The total row needs its average ticket: G11 is total revenue over total washes, D11 divided by C11, pointed the way the site rows were.  
    *teach:* An average ticket for the cluster is total revenue over total washes, not the average of the site averages, which would weight a small site the same as a big one, so build it by pointing, not typing.  
    *stuck:* pulse cell G11 · G11, =, ← ← ←, /, ← ← ← ←, Enter.
3.  The total row needs its margin: H11 is total gross profit over total revenue, F11 divided by D11, pointed the same way.  
    *teach:* Same logic: the cluster's margin is total profit over total revenue. Ratios in a total row are recomputed from totals, never summed.  
    *stuck:* pulse cell H11 · H11, =, ← ←, /, ← ← ← ←, Enter.
4.  Start a Week summary block under the report: Week summary in A26, bold, then the five line labels A27:A31 as one Enter-and-↓ run.  
    *teach:* Type, Enter, ↓, five times. The labels: Average washes per site · Best site (washes) · Lowest site (washes) · Sites with figures · Sites listed.  
    *stuck:* pulse cell A26 · A26, Ctrl+B, type, Enter, ↓; then each label.
5.  Type the first three lines: B27 =AVERAGE(C5:C10) for the average site, B28 =MAX(C5:C10) for the best, B29 =MIN(C5:C10) for the lowest.  
    *teach:* SUM, AVERAGE, MAX, MIN and COUNT each take one range, =AVERAGE(C5:C10), and a blank inside the range is left out, not counted as zero. Type =AVER and Tab completes AVERAGE( from the list; then point at the range with Ctrl+Shift+↓ while the formula is open.  
    *stuck:* pulse cell B27 · B27, =AVERAGE(, point at C5, Ctrl+Shift+↓, ), Enter.
6.  The three lines B27:B29 are wash counts: give them thousands separators and no decimals with Ctrl+Shift+1, then Alt, H, 9 twice.  
    *teach:* Ctrl+Shift+1 gives a thousands separator and two decimals, and Alt, H, 9 twice takes the decimals off. These are wash counts, which can't go negative, so the chord's minus sign never shows; a dollar line would take the desk number format from 1.5.1 instead.  
    *stuck:* pulse cells B27:B29 · Select B27:B29; Ctrl+Shift+1; Alt, H, 9 twice.
7.  Count the figures and the names: B30 =COUNT(C5:C10) counts the wash figures, B31 =COUNTA(A5:A10) counts the site names.  
    *teach:* COUNT counts the numbers in a range; COUNTA counts every non-empty cell, text included. COUNT checks the figures, COUNTA checks the names, and the two agree when the table is complete.  
    *stuck:* pulse cell B30 · B30, =COUNT(C5:C10), Enter; B31, =COUNTA(A5:A10), Enter.
8.  Does it tie? Clear Riverside's washes in C7 with Delete: the average in B27 and the count in B30 answer, and Sites listed in B31 doesn't.  
    *teach:* A blank is not a zero. AVERAGE and COUNT skip it; COUNTA still sees the name. Put the figure back with Ctrl+Z.  
    *stuck:* pulse cell B30 · C7, Delete; read B27, B30, B31; Ctrl+Z.

### 1.6.3 Anchors: $ and F4

*lesson: anchors-dollar-and-f4 · 9 goals*

**Demo before the goals** **DRAFT** Before the goals: one formula, =C5*J4, with the caret on C5 and F4 pressed four times ($C$5, C$5, $C5, C5), each state shown on the sheet as the reference it pins, then filled right and down to show which state survives which fill. (M31)

**Brief** **DRAFT** When you fill a formula, its references move with it (down a row, across a column), and usually that's what you want. Sometimes it isn't: a price in one cell, a rate at the top of a column, and the reference has to stay put. A $ in front of a row or a column pins it ($C5 keeps the column, C$4 keeps the row, $C$5 keeps both), and F4 inside an open formula cycles the four states so you never type a $. The CFO wants each site's weekly wash cost at three prices: one formula for a grid of eighteen cells. The key is `F4`.

**Done screen, line** **DRAFT** One formula covered eighteen cells, filled both ways, because two anchors held.

**Done screen, paragraph** **DRAFT** =$C5*J$4 covered the whole grid: the $ before C held the washes column when you filled right, the $ before 4 held the price row when you filled down. F4 set both anchors while you typed; you never pressed the $ key. || The three prices live in their own cells, blue, and every formula points at them instead of carrying a number inside. Change a price and its whole column answers. || Best practice: to move a formula without changing what it reads, cut it (Ctrl+X) and paste. A moved formula keeps its references and the cells that read it follow; a copy shifts them.

**Goals** (all DRAFT)

1.  Head the scenario grid: Wash cost at price ($/wk) in J3, bold, then the three prices 1.25, 1.50 and 1.75 across J4:L4 as one Tab run.  
    *teach:* A label, Ctrl+B, then the three inputs as a Tab run. Inputs in a row across the top, sites down the side: that's the shape of every sensitivity grid you'll ever build.  
    *stuck:* pulse cell J3 · J3, type, Ctrl+B, Enter, ↓; 1.25, Tab, 1.5, Tab, 1.75, Enter.
2.  The prices are inputs, not headers: select J4:L4, switch off the bold row 4 gave them, color them blue, and format them as currency.  
    *teach:* Ctrl+B toggles bold off; Alt, H, F, C for blue; Ctrl+Shift+4 for currency. Typed numbers are blue wherever they sit, headers or not.  
    *stuck:* pulse cells J4:L4 · Select J4:L4; Ctrl+B; Alt, H, F, C, →×4, Enter; Ctrl+Shift+4.
3.  Start Domain's cost at $1.25 in J5: type =, point at C5 and press F4 once, so the reference reads $C$5.  
    *teach:* F4 inside an open formula cycles the anchors on the reference at the caret. First press: $C$5, both pinned. Read the formula bar after each press, because that's how you learn the cycle.  
    *stuck:* pulse the formula bar · J5, =, point at C5 with Ctrl+← and →, then F4 once; don't press Enter yet.
4.  Press F4 twice more, reading each state, C$5 then $C5, and stop on $C5, because the washes column has to hold when you fill right.  
    *teach:* The cycle is $C$5 → C$5 → $C5 → C5 and round again. Ask which way the formula will be filled: filled right, the column must hold, so pin the column: $C5.  
    *stuck:* pulse the formula bar · F4, read C$5; F4, read $C5; stop.
5.  Type *, point at J4 and press F4 until it reads J$4, because the price row has to hold when you fill down, then press Enter.  
    *teach:* Second reference, second question: filled down, the row must hold, so pin the row: J$4. Two presses of F4 from J4 gets you there. Enter, and J5 reads =$C5*J$4.  
    *stuck:* pulse the formula bar · *, ↑ to J4, F4, F4 (J$4), Enter.
6.  Give J5 thousands separators, no decimals, then fill it right across J5:L5 with Ctrl+R: $C5 stays on the washes column, the price moves.  
    *teach:* Ctrl+Shift+1, Alt, H, 9 twice (a cost grid can't go negative, so the chord's minus sign never shows), then Shift+→ twice and Ctrl+R. Open K5 with F2 to check: $C5 held, J$4 became K$4.  
    *stuck:* pulse cells J5:L5 · Format J5; Shift+→ twice; Ctrl+R; F2 on K5 to check, Esc.
7.  Now the five sites below: extend the selection to J5:L10 and fill down with Ctrl+D; J$4 stays on the price row while the washes move.  
    *teach:* Shift+↓ five times from the filled row, Ctrl+D. Eighteen cells from one formula: the fill went right because of $C5 and down because of J$4.  
    *stuck:* pulse cells J5:L10 · Land on J5, Shift+→ twice, Shift+↓ five times; Ctrl+D.
8.  Read one from the middle of the grid before you trust it: open K7 with F2, see $C7 and K$4 lit in color, then Esc.  
    *teach:* Middle of the grid, not a corner. Corners can be right by accident. $C7 (the column held, the row moved) and K$4 (the row held, the column moved) is exactly what both fills should produce.  
    *stuck:* pulse cell K7 · K7, F2, read, Esc.
9.  Does it tie? Change the middle price in K4 to 2.00 and watch every site's cost under it, down to Airport's K10, answer at once.  
    *teach:* One input, six formulas move, the other two columns don't. That's what anchoring bought you: a grid that reads its inputs instead of carrying them.  
    *stuck:* pulse cell K4 · K4, 2, Enter; K5:K10 all move.

### 1.6.4 Link across sheets

*lesson: link-across-sheets · 9 goals*

**Demo before the goals** **DRAFT** Before the goals: a link being built (= on Report, the sheet key to Raw while the formula is open, arrows to I8, Enter), and the formula bar showing =Raw!I8 with the sheet name, the exclamation mark and the cell; then the cell turning green, and Ctrl+[ jumping back to Raw!I8. (M31, M42)

**Brief** **DRAFT** The Report's site figures are a pasted snapshot of Raw's totals, so the next feed will leave them stale. A link is a formula that reads a cell on another sheet: =Raw!I8 (the sheet name, an exclamation mark, then the cell). You can type it, or point at it: with the formula open, switch sheets with the sheet key, walk to the cell, Enter, and Excel writes the reference for you; links are green, so a reader knows which figures come from elsewhere. Replace the snapshot with links, and compute wash cost from the price on Inputs, so the page updates itself. The key is `Ctrl+PgDn`.

**Mac note (mac_note)** **DRAFT** Pointing across sheets while a formula is open: ⌥→ and ⌥← switch sheets on a Mac. In a browser on Windows, Alt+PgDn and Alt+PgUp do it, and Ctrl+PgDn works in fullscreen or the installed app.

**Done screen, line** **DRAFT** Every site figure is a link now. The next feed flows straight onto the page.

**Done screen, paragraph** **DRAFT** =Raw!I8 is the sheet name, an exclamation mark and the cell. You typed one, pointed one, then wrote a whole column of them with Ctrl+Enter, and the cost per wash on Inputs, anchored, now drives every wash cost, gross profit and margin on the page. || Links are green so a reader knows which figures come from elsewhere in the file; Ctrl+[ follows one back to its source, and F5 then Enter returns. A link to another workbook would show red, and the desk avoids those.

**Goals** (all DRAFT)

1.  Type the first link by hand in C5, =Raw!I8 (Domain's washes total on Raw), and press Enter.  
    *teach:* A reference on another sheet is the sheet name, an exclamation mark, then the cell: Raw!I8. Type it exactly once so you've seen the syntax; from here on you'll point.  
    *stuck:* pulse cell C5 · C5, type =Raw!I8, Enter; the number matches Raw's I8.
2.  Point the second one: in D5 type =, press the sheet key to Raw, walk to J8 and press Enter, so the formula bar reads =Raw!J8.  
    *teach:* With a formula open, the sheet key (Ctrl+PgDn, or Alt+PgDn in a browser) takes you to the other sheet and the arrows point at cells there, so Excel writes Raw!J8 for you and nobody types a sheet name. Enter commits the formula and lands you back where you started, which is why a link built this way never carries a typo.  
    *stuck:* pulse the formula bar · D5, =, Alt+PgDn to Raw, ↓ and → to J8, Enter.
3.  Mueller, Riverside and South Lamar follow: select C6:C8, point one link at Raw's I9 and commit it into all three with Ctrl+Enter.  
    *teach:* Select the destination cells first, build one formula pointing at the top source cell, then Ctrl+Enter: each cell gets the same formula shifted a row (=Raw!I9, =Raw!I10, =Raw!I11). A column of links in one press.  
    *stuck:* pulse cells C6:C8 · Select C6:C8; =, Alt+PgDn, point at I9, Ctrl+Enter.
4.  Revenue the same way: select D6:D8, point one link at Raw's J9 and commit it into all three; the reference shifts a row per cell.  
    *teach:* Same move, next column. F2 on D7 afterwards: =Raw!J10, the row shifted with the fill.  
    *stuck:* pulse cells D6:D8 · Select D6:D8; =, Alt+PgDn, point at J9, Ctrl+Enter.
5.  Airport sits below Cedar Park's emailed row: select C10:D10, point at Raw's I12 and Ctrl+Enter writes both links at once.  
    *teach:* Ctrl+Enter fills across too: the reference shifts a column per cell, so I12 becomes J12 in the next one. Cedar Park's row 9 stays typed (it came by email and isn't on the feed yet) and stays blue.  
    *stuck:* pulse cells C10:D10 · Select C10:D10; =, Alt+PgDn, point at I12, Ctrl+Enter.
6.  Wash cost is washes times the cost per wash on Inputs: select E5:E10, point =C5*Inputs!$B$4, anchor the price with F4, and Ctrl+Enter.  
    *teach:* Point at C5, type *, sheet key to Inputs, point at B4, F4 once for $B$4, Ctrl+Enter. The price is anchored so every row reads the same cell; the washes reference moves row by row. Two ideas from 1.6.3 in one formula.  
    *stuck:* pulse cells E5:E10 · Select E5:E10; =, ← ←, *, Alt+PgDn twice to Inputs, point at B4, F4, Ctrl+Enter.
7.  Links are green: color the wash costs E5:E10 green with Font Color, then select C5:D8 and press F4 to repeat it, then C10:D10.  
    *teach:* Alt, H, F, C, then the green swatch; F4 repeats the color on the next selection. Green says "this comes from another sheet": blue is typed, black is calculated here, green is fetched.  
    *stuck:* pulse cells E5:E10 · Select E5:E10; Alt, H, F, C, → eight times, Enter; then C5:D8, F4; then C10:D10, F4.
8.  Follow a link back: land on C5 and press Ctrl+[, and you're on Raw!I8, the cell it reads; F5 then Enter brings you back to the Report.  
    *teach:* Ctrl+[ jumps to the cells a formula reads, across sheets too; Ctrl+] goes the other way, to the cells that read this one; F5 then Enter returns to where you were. That's how you audit a link in two presses. Best practice: link every use of an input straight to its source cell, never to a cell that already links to it, so Ctrl+[ reaches the source in one hop; the one accepted chain is a flat assumption carried across forecast years as =prior year (5.2.6).  
    *stuck:* pulse cell C5 · C5, Ctrl+[, look, F5, Enter.
9.  Does it tie? On Inputs, change the cost per wash in B4 to 2.00 and watch every wash cost, gross profit and margin on the Report answer.  
    *teach:* One input on one sheet, eighteen cells on another. That's a linked page, and from here on it's the only kind you build.  
    *stuck:* pulse cell B4 on Inputs · Alt+PgDn to Inputs; B4, 2, Enter; back to Report and look.

### 1.6.5 One formula per row, filled right

*lesson: one-formula-per-row-filled-right · 7 goals*

**Brief** **DRAFT** The daily table on the Report has to read off Raw's by-day block, washes for each site on each day. The CFO's assistant filled rows 18 to 21 already and retyped one cell over its formula, and Domain's row 17 is yours: one formula filled right covers the six days. Ctrl+` shows every formula's text in place of its value, so a typed number sitting in a row of links stands out at a glance, and that's the one audit you'll run on every table someone else built. The key is `Ctrl+R`.

**Done screen, line** **DRAFT** One formula filled right covered six days, and Ctrl+` found the typed number in one press.

**Done screen, paragraph** **DRAFT** Domain's week went in as one formula filled right, never six typed links, and Ctrl+` showed the pattern with the one dead number standing out. F2 then Ctrl+Enter filled the row back from its own formula instead of retyping it. || Every link in the daily table reads green, and Domain's Monday on the feed moves the Report's B17 the moment it changes.

**Goals** (all DRAFT)

1.  Domain's Monday in B17 is empty: link it to Domain's Monday, I32 in Raw's by-day block, pointing across sheets.  
    *teach:* =, sheet key to Raw, walk to I32, Enter. The by-day block on Raw lays the sites down and the days across, the same shape as the daily table, which is why one formula will fit.  
    *stuck:* pulse cell B17 · B17, =, Alt+PgDn, point at I32, Enter.
2.  Write the row once: with Monday's link at the left of B17:G17, fill it right and all six days take the same pattern.  
    *teach:* Select B17:G17, Ctrl+R. The reference shifts a column per cell: I32, J32, K32… One formula per row, filled right: the convention every model is built on.  
    *stuck:* pulse cells B17:G17 · Land on B17, Shift+→ five times, Ctrl+R.
3.  One of the assistant's cells is a number, not a link: show every formula in the daily table with Ctrl+` and find it (E19).  
    *teach:* Ctrl+` (the key above Tab) shows every formula's text in place of its value; press it again to return. In a block of =Raw!… links, a bare number is the one that isn't a formula, and it's wrong the moment the feed changes.  
    *stuck:* pulse cell E19 · Ctrl+`, read rows 17 to 21, find E19; leave it on for the next goal.
4.  Riverside's Thursday E19 was retyped: refill B19:G19 from its own Monday formula with F2 then Ctrl+Enter, never by retyping.  
    *teach:* Select B19:G19, F2 on the Monday link at the left, Ctrl+Enter: the row's own formula fills across and overwrites the typed cell. Fix the pattern, not the cell.  
    *stuck:* pulse cells B19:G19 · Land on B19, Shift+→ five times, F2, Ctrl+Enter.
5.  Bring the values back to the daily table: Ctrl+` again, and every cell in B17:G21 reads as a live link.  
    *teach:* Show formulas is a view, not a change. Toggle it back and the figures return, and now all thirty are links.  
    *stuck:* pulse the daily table · Ctrl+` once.
6.  A link to another sheet is green: select B17:G17 and color Domain's row with Font Color, then F4 the rest of the table.  
    *teach:* Alt, H, F, C, green; then select B18:G21 and F4. Whoever reads this table sees green and knows the whole block is fetched from the feed.  
    *stuck:* pulse cells B17:G17 · Select B17:G17; Alt, H, F, C, → eight times, Enter; B18:G21, F4.
7.  Does it tie? Change Domain's Monday washes on Raw's C8 to 300 and watch the Report's B17 answer through the by-day block.  
    *teach:* Feed to by-day block to Report is two links deep, and one change at the source still shows on the page, which is what we mean by a live table.  
    *stuck:* pulse cell B17 on Report · Alt+PgDn to Raw; C8, 300, Enter; back to Report, read B17.

### 1.6.6 Read the error, follow the trail

*lesson: read-the-error-follow-the-trail · 8 goals*

**Brief** **DRAFT** Costs came back from a manager with its Total column showing error codes instead of figures, and the cost-per-wash line broken with them. Each code is a message about what broke: #REF! a deleted reference, #NAME? a name Excel doesn't know, #VALUE! text where a number belongs, #N/A a lookup that found nothing, #DIV/0! a division by an empty cell, #NUM! a result Excel can't hold. Read it, follow the trail to the cell the formula reads with Ctrl+[, and fix the input or the formula. Never paste a number over it. The key is `Ctrl+[`.

**Done screen, line** **DRAFT** Five error codes read and fixed at the source, and nothing pasted over.

**Done screen, paragraph** **DRAFT** Each code was a message (a deleted reference, a misspelled name, a word where a figure belongs, a lookup that found nothing, a division by an empty cell), and Ctrl+[ followed the trail to the cell each formula reads, across sheets too. || Not one number was pasted over a formula: the totals are live, black like every formula, and Domain's rent still moves the cost per wash.

**Goals** (all DRAFT)

1.  On Costs, Mueller's total E5 says #REF!, a reference that was deleted: replace the dead tail with a pointer to D5 so it reads =B5+C5+D5.  
    *teach:* #REF! means the formula pointed at a cell that no longer exists. F2, Backspace the #REF! out, F2 again to point (1.6.1), ← to D5, Enter. The other codes: #NAME? a name Excel doesn't know, #VALUE! text where a number belongs, #N/A a lookup that found nothing, #DIV/0! a division by nothing, #NUM! a result Excel can't hold or a rate it can't find (3.5.3).  
    *stuck:* pulse cell E5 on Costs · E5, F2, Backspace over #REF!, F2, ←, Enter.
2.  E6 says #NAME?: SUMM is not a function Excel knows, so edit the name in place to SUM and the total reads 2,580 again.  
    *teach:* F2 opens the cell, Home takes you to the front, → three times, Delete the extra M, Enter. A misspelled function name gives you #NAME? every time, so when that code appears read the formula itself rather than the code.  
    *stuck:* pulse cell E6 · E6, F2, Home, → → →, Delete, Enter.
3.  E7 says #VALUE!: Ctrl+[ lands on B7, and along that row D7 says tbc where the flat 260 card fee belongs: fill it down from D6.  
    *teach:* Ctrl+[ selects the cells the formula reads, so follow the trail from the error back to its source. Text sitting in a figure column breaks every formula that adds it up, and selecting D6:D7 then Ctrl+D puts the number back in.  
    *stuck:* pulse cell D7 · E7, Ctrl+[; → to D7; land on D6, Shift+↓, Ctrl+D.
4.  Airport's E8 says #N/A and holds nothing worth keeping: select E5:E8, press F2 on E5, and Ctrl+Enter writes its formula into all four rows.  
    *teach:* Fix the pattern, not the cell: one good formula filled into the block with Ctrl+Enter replaces the broken one everywhere at once. #N/A is a lookup that found nothing, which is Chapter 4's error to learn, so here it only needs to go.  
    *stuck:* pulse cells E5:E8 · Select E5:E8, F2, Ctrl+Enter.
5.  B10 now says #DIV/0!, a division by nothing: Ctrl+[ jumps to E9, Ctrl+] back, and it divides by the empty B12, so edit it to =E9/B11.  
    *teach:* Ctrl+[ goes to what a formula reads, Ctrl+] to what reads it. B10 divides the cluster's total cost by the washes in B11. The formula pointed one row too far.  
    *stuck:* pulse cell B10 · B10, Ctrl+[, look, Ctrl+]; F2, End, Backspace, 1, Enter.
6.  B11 is a link to the Report: press Ctrl+[ on it and the trail crosses sheets to Report's C11, the washes the cost is spread over.  
    *teach:* Ctrl+[ follows a link to another sheet as easily as a cell next door. F5 then Enter brings you back. That's the audit trail, two keys.  
    *stuck:* pulse cell B11 · B11, Ctrl+[; then F5, Enter to return.
7.  Back on Costs, E5:E8 are formulas, not inputs, and must read black like E4: copy E4 and paste its format only onto them with Paste Formats.  
    *teach:* Someone colored the totals blue. Copy a correct cell and Paste Special Formats puts the right font color (and everything else) on the block.  
    *stuck:* pulse cells E5:E8 · E4, Ctrl+C; select E5:E8; Ctrl+Alt+V, T, Enter.
8.  Does it tie? Change Domain's rent in B4 to 2,500 and watch the cost per wash in B10 answer through the Total.  
    *teach:* Five errors gone and the sheet is live end to end: rent to total to cost per wash.  
    *stuck:* pulse cell B10 · B4, 2500, Enter; B10 moves.

### 1.6.C Challenge: the site P&L

*lesson: challenge-the-site-pnl · 6 goals*

**Brief** **DRAFT** The San Antonio cluster's P&L, its profit and loss by site, arrived typed from last week with 1.50 typed inside its formulas, two errors and no totals. Link it to Raw, anchor the cost per wash, build one formula per column, total it and add margin, all of it on the clock.

**Done screen, paragraph** **DRAFT** The links are in, the cost is anchored, every column is one formula, the totals went in with one press and every color is right. || That's a page that reads its inputs instead of carrying them, and the last thing a buyer's analyst would need to ask about.

**Goals** (DRAFT; challenges run without teach or stuck lines)

1.  Washes in B5:B9 are typed from last week's page: select B5:B9, point one link at Raw's site total I8, then Ctrl+Enter.
2.  Revenue in C5:C9 the same way, pointing at Raw's J8, then color both link columns B5:C9 green: a link to another sheet is green.
3.  Wash cost D5:D9 multiplies by a typed 1.50 and D8 is an error: put =B5*Inputs!$B$4, anchored with F4, into all five with Ctrl+Enter.
4.  Gross profit E5:E9 mixes typed numbers, formulas and a #REF! in E7: select E5:E9, point =C5-D5 and commit it into every row with Ctrl+Enter.
5.  The Total row B10:E10 is empty: select B5:E10, the block plus its blank edge, and one Alt+= writes every column's SUM.
6.  Margin % in F5:F10 is gross profit over revenue: select F5:F10, point =E5/C5 and commit it into all six rows with Ctrl+Enter.

## 1.7 Present and audit

*module: present-and-audit*

**Status** Module 1.7, v1 in the voice, company side (2026-09-27): the CFO signs off, the page goes into the data room, the buyers read. Banker framing toned down per Wolf, same day. All DRAFT.

**Story card, title** **DRAFT** Sign it off.

**Story card, body** **DRAFT** The CFO signs this page off and it goes into the data room as the company's current trading, the first thing a buyer's analyst opens. Check that the totals tie, that the conventions hold, that it prints on one page, and that nothing's typed where a link belongs. Then it goes in the pack.

**Objective (data room)** **DRAFT** The KPI page checked, print-ready and signed off: page one of the pack.

**Page name** Page one of the pack

### 1.7.1 Fit to one page

*lesson: fit-to-one-page · 7 goals*

**Brief** **DRAFT** The Report is finished and the CFO will print it and read it on paper, where a page that spills onto a second sheet reads as careless. Set it to print landscape on one page, with the title rows repeated and the file name and date in the footer, so every copy says what it is and when it was printed. Page Layout is Alt, P; Page Setup is the dialog behind it, and Ctrl+F2 shows you what the printer will get. The key is `Alt P S P`.

**Done screen, line** **DRAFT** It prints on one landscape page, with the heads on every sheet and the file and date in the footer.

**Done screen, paragraph** **DRAFT** The print set-up is part of the page: landscape, fit to one, the title rows repeated, the footer saying which file and when. A page reads the way the reader reads it: title, units, timeline, then the answer. || Best practice: save a new version rather than over the only copy (Clearcoat_Weekly_KPI_v03_2026-09-15.xlsx, never "final"), and Ctrl+Home on every sheet before you send. A file with pay or deal figures that leaves by email gets a password first: File, Info (Alt, F, I), Protect Workbook, Encrypt with Password. Protect Sheet sits in the same menu, and desks rarely lock a model.

**Goals** (all DRAFT)

1.  Before you set the page, read how far it runs: jump to the last used cell, Z31, then come back to the top of the sheet.  
    *teach:* Ctrl+End shows the sheet's extent: if it's further than your table, something stray is out there and it will print. Stray formats on emptied cells are the usual cause: Delete leaves them behind, so clear them with Clear All (Alt, H, E, A, from 1.3.1), save, and Ctrl+Home brings you back to the top.  
    *stuck:* pulse cell Z31 · Ctrl+End, look, Ctrl+Home.
2.  A page wider than it is tall prints landscape: turn the Report with Alt, P, O, L.  
    *teach:* Page Layout › Orientation, Alt, P, O, then L for landscape or P for portrait, turns the printed page without opening a dialog.  
    *stuck:* pulse the Page Layout tab · Alt, P, O, L.
3.  One page, however wide the columns run: open Page Setup, choose Fit to, leave the counts at 1 page wide by 1 tall, and OK it.  
    *teach:* Page Setup, Alt, P, S, P, holds every print setting on its tabbed pages; F picks Fit to, one page wide by one tall, and Enter is OK. Fit to one is the default for any page that goes to a reader.  
    *stuck:* pulse the Page Setup dialog · Alt, P, S, P; Alt+F for Fit to; Enter.
4.  The title, the units line and the header row must top every printed page: set Print Titles to rows 1:4 with Alt, P, I.  
    *teach:* Print Titles, Alt, P, I, opens Page Setup on its Sheet page; the rows typed as Rows to repeat at top, 1:4, print at the top of every page. On a one-page report it's insurance for the day it grows.  
    *stuck:* pulse the Sheet tab of Page Setup · Alt, P, I; type 1:4 in Rows to repeat at top; Enter.
5.  A printed page must say which file it came from: on Page Setup's Header/Footer tab, open Custom Footer and put &[File] in the left section.  
    *teach:* Header/Footer is a tab in Page Setup, and the tabs answer to their first letter as Format Cells' do, so H reaches it; Alt+U opens Custom Footer with the cursor in the left of its three sections, and &[File] is the code for the file name. Every printed page traces back to its file.  
    *stuck:* pulse the Header/Footer tab · Alt, P, S, P; H for the Header/Footer tab; Alt+U for Custom Footer; type &[File] in the left section; OK, then OK.
6.  A printed page must also say when it was printed: on the Header/Footer page, Alt+R moves to the right section; put &[Date] there and OK it.  
    *teach:* &[Date] prints the date on the day it's printed, so a stale copy on a desk says so. &[Page] of &[Pages] goes in the center on a multi-page pack (the challenge).  
    *stuck:* pulse the right footer section · Alt+R in the footer dialog; &[Date]; Enter, Enter.
7.  Does it tie? Change Cedar Park's washes in C9 to 300 and watch the Total in C11 answer: the print set-up changed nothing on the sheet.  
    *teach:* Print settings live beside the sheet, not in it. Ctrl+F2 shows what the printer will get; Esc comes back.  
    *stuck:* pulse cell C11 · C9, 300, Enter; then Ctrl+F2 to see the page, Esc.

### 1.7.2 The checks row

*lesson: the-checks-row · 7 goals*

**Brief** **DRAFT** The Report is ready to print, but nothing on it says whether it's right. The CFO wants a line for each thing that must agree before the page goes out, and so will every buyer after. A check is a live difference between two things that must agree: it reads zero when they tie and shows the gap when they don't. Three of them under the week summary make a checks row, the first thing a reviewer looks for on any page. The key is `=`.

**Done screen, line** **DRAFT** Three live differences read zero, so the page now proves itself.

**Done screen, paragraph** **DRAFT** The checks row goes to zero when the page ties: one for each thing that must agree, so a broken link or a bad total shows as a number before anyone else sees it. That's the convention on every page in this course and every model on a desk. || The revenue check reads the feed across sheets, and Ctrl+[ takes a reviewer straight to the first figure it compares.

**Goals** (all DRAFT)

1.  Head a Checks block under the week summary: Checks in A33, bold, then the three check labels in A34:A36 as one Enter-and-↓ run.  
    *teach:* The labels: Report revenue ties to the feed · Sites sum to the total · Margin within 0–100%. A check has a name that says what it compares.  
    *stuck:* pulse cell A33 · A33, Ctrl+B, type, Enter, ↓; then each label.
2.  In B34, take the five linked sites' revenue D5:D8 and D10 and subtract the feed's own total, pointing at Raw's J13 across sheets.  
    *teach:* =SUM(D5:D8,D10)−Raw!J13: the sum of what the page shows, less what the feed says. Zero means the page and the feed agree. Cedar Park's typed row is left out because the feed doesn't carry it yet.  
    *stuck:* pulse cell B34 · B34, =SUM(D5:D8,D10)−, Alt+PgDn to Raw, point at J13, Enter.
3.  In B35, the six sites' washes must sum to the Total row: enter =SUM(C5:C10)−C11, and it reads 0 while the total row is honest.  
    *teach:* A total that was typed over, or a row inserted below the block, shows up here as a non-zero, which is about as cheap as insurance gets.  
    *stuck:* pulse cell B35 · B35, type =SUM(C5:C10)-C11, Enter.
4.  In B36, a margin outside 0 to 100% is a mistake somewhere: enter =IF(AND(H11>=0,H11<=1),0,1), which reads 0 while the margin is plausible.  
    *teach:* IF and AND arrive properly in Chapter 3; here they make a plausibility check: a margin can't be negative or over 100%, so if it is, the check fires. Sanity checks catch what tie-outs miss.  
    *stuck:* pulse cell B36 · B36, type the formula exactly, Enter.
5.  Give the three checks B34:B36 the desk number format, so all three read a plain 0 and a failing one would read in parentheses.  
    *teach:* Ctrl+1, Number, no decimals, the separator, (1,234): that's the desk number format from 1.5.1, and it matters here because a check can go negative, and then it reads (12), never -12. A checks row reads as a column of zeros, so anything else jumps out at you.  
    *stuck:* pulse cells B34:B36 · Select B34:B36; Ctrl+1; N, Tab, N; Decimal places 0; Use 1000 Separator; (1,234); Enter.
6.  A reviewer will ask what the first check compares: from B34, Ctrl+[ follows the trail to D5, the first revenue figure it reads.  
    *teach:* Ctrl+[ on a check shows exactly which cells it compares, which answers "what does this check check?" in one press, and F5 then Enter brings you back to where you were.  
    *stuck:* pulse cell B34 · B34, Ctrl+[; F5, Enter.
7.  Does it tie? Type a number over Mueller's revenue link in D6 and watch the revenue check in B34 leave zero, then Ctrl+Z.  
    *teach:* That's the checks row doing its job: a typed number where a link belonged, and the page says so before anyone else does. Undo puts the link back.  
    *stuck:* pulse cell B34 · D6, type 3000, Enter; read B34; Ctrl+Z.

### 1.7.3 Hardcode hunt

*lesson: hardcode-hunt · 9 goals*

**Brief** **DRAFT** The CFO's marked-up copy of the Report came back with eight faults from the day-one list, the faults a reviewer checks first, and the page goes out tonight. The audit pass finds them the way a reviewer would: Go To Special for typed numbers hiding among links, show formulas for a number in a formula row, and your eyes on the page for the rest. Fix every one without changing anything else. The key is `Ctrl+Backtick`.

**Done screen, line** **DRAFT** Eight faults found in two minutes, the way a reviewer finds them.

**Done screen, paragraph** **DRAFT** Go To Special found the typed numbers, show formulas found the literal and the retyped Thursday, and your eyes found the rest. That's the audit pass, and it's the same three looks on every page you'll ever inherit. || Cedar Park's emailed figures read blue, so the one row that isn't a link says so on its face. The title is centered across the page rather than merged, the grid is gone, and page one is ready. || Best practice: give a file a fourth look before it leaves. Go To Special, Notes (Comments in older builds) selects every cell that carries a note, so keep the sources (1.3.5) and clear the rest with Alt, H, E, M.

**Goals** (all DRAFT)

1.  Typed numbers hide among the links: select C5:E10, run Go To Special for Constants, and color Cedar Park's emailed figures blue.  
    *teach:* The audit pass is three looks: Go To Special for typed numbers among links, show formulas for a number in a formula row, the page for the rest. Alt, H, F, D, S, O, Enter, then Font Color.  
    *stuck:* pulse the Go To Special dialog · Select C5:E10; Alt, H, F, D, S; O; Enter; Alt, H, F, C, blue.
2.  E9 multiplies the emailed washes, so the whole Cedar Park row is marked blue until the feed carries the site: move to E9 and press F4.  
    *teach:* F4 repeats the color. A formula that reads a typed figure is marked with it, so the reader knows the whole row is provisional.  
    *stuck:* pulse cell E9 · E9, F4.
3.  Mueller's average ticket G6 divides by a typed 1240, which Ctrl+` shows at a glance: rewrite it as =D6/C6 by pointing.  
    *teach:* Ctrl+` shows the literal inside the formula, a number typed where a reference belongs. Rewrite by pointing; the typed number was last week's washes and is already wrong.  
    *stuck:* pulse cell G6 · Ctrl+`; G6, =, ← ← ←, /, ← ← ← ←, Enter; Ctrl+` off.
4.  In the daily table Mueller's Thursday E18 is a number in a formula row: select B18:G18, F2 on the link in G18, Ctrl+Enter, Ctrl+` off.  
    *teach:* Refill the row from its own formula, the fix from 1.6.5. The typed Thursday goes, the pattern returns.  
    *stuck:* pulse cells B18:G18 · Select B18:G18, F2 on G18, Ctrl+Enter; Ctrl+`.
5.  Prior week rev is hidden between H and J, and a buyer who finds one hidden column looks for more: select H:J and unhide the column.  
    *teach:* Hidden columns get found and get you questions. Unhide, and if it should be out of the way, group it.  
    *stuck:* pulse columns H:J · Land on H4, Ctrl+Space, Shift+→ twice; Alt, H, O, U, L.
6.  The title was centered by typing spaces in front of it: retype it in A1 without them, then center it across A1:I1 with Ctrl+1 then A.  
    *teach:* Spaces in a title break Find, sorting and every reference to the cell. Retype it clean; Center Across Selection does the centering.  
    *stuck:* pulse cell A1 · A1, type the title, Enter; select A1:I1; Ctrl+1, A, Center Across Selection, Enter.
7.  The units line is gone, so a reader can't tell which currency the figures are in: in A2 press Ctrl+I, then type USD unless stated.  
    *teach:* Every page states its currency once. Italic, near the top, exactly that wording.  
    *stuck:* pulse cell A2 · A2, Ctrl+I, type, Enter.
8.  A grid sits over the daily table with gridlines on: select B15:G21, take every border off with Alt, H, B, N, then Alt, W, V, G.  
    *teach:* Borders off the block, gridlines off the sheet. A page someone reads has neither; the top border on a total is the only line it needs.  
    *stuck:* pulse cells B15:G21 · Select B15:G21; Alt, H, B, N; then Alt, W, V, G.
9.  Does it tie? Change Cedar Park's washes in C9 to 300 and watch the Total in C11 answer: the page is clean and still live.  
    *teach:* Eight faults out, nothing else changed, every link still moving. That's a page ready to sign off.  
    *stuck:* pulse cell C11 · C9, 300, Enter.

### 1.7.C Challenge: audit before you send

*lesson: challenge-audit-before-you-send · 6 goals*

**Brief** **DRAFT** The San Antonio cluster's finished Report goes out in three minutes, and its checks row ties, yet it carries five faults an audit pass finds. Fix every one, change nothing else, then add the page number.

**Done screen, paragraph** **DRAFT** Three looks (Go To Special, show formulas, the page) found five faults, and you fixed them without touching anything else. || A checks row that ties is necessary, not sufficient. The audit pass is what a reviewer does after the checks say zero.

**Goals** (DRAFT; challenges run without teach or stuck lines)

1.  The title was centered with spaces and the units line is gone: delete the spaces, center A1 across A1:I1, restore USD unless stated in A2.
2.  Cedar Park's emailed figures sit black among the green links: Go To Special constants over C5:D10 finds them; color them blue.
3.  Show formulas: one Avg ticket cell divides by a typed wash figure, so rewrite G5:G10 as one formula, =D5/C5, with Ctrl+Enter.
4.  A grid was drawn over the daily table B15:G21 with the gridlines on: remove every border and turn the gridlines off.
5.  One daily-table cell is a typed number among links: select B17:G21, open B17 with F2, commit it to every cell with Ctrl+Enter, Ctrl+` off.
6.  The page prints landscape on one sheet but carries no page number: put Page &[Page] of &[Pages] in the center footer section.

## 1.8 Project and assessment

*module: project-and-assessment*

**Status** Module 1.8, v1 (2026-09-27). The assessment is the test-out (M26): seventeen goals defined by the start state (a fresh feed, a blank Report) and the end state (page one, signed off), covering every module. Wolf: tailor to volume and start/end state, not the clock. Ten minutes on a hard clock, no help, keyboard only. 1.8.T is retired into a Practice puzzle drill, Audit: ten faults. Goals here have no teach or stuck lines (project: guided, no teach; assessment: none).

**Story card, title** **DRAFT** The CFO's next feed just landed.

**Story card, body** **DRAFT** New week, new feed, and nothing left to learn. You know every move this page needs. Time to execute: build it start to finish, then build it again on the clock. If you already knew all of this, the assessment is the test-out: pass it and the chapter is yours.

**Objective (data room)** **DRAFT** Build the weekly report end to end, then prove it against the clock; the assessment is the test-out.

**Page name** The weekly KPI report

### 1.8.P Project: the weekly KPI report

*lesson: weekly-kpi-project · 15 goals*

**Brief** **DRAFT** The CFO's next feed is in, Week of Sep 22, and the Report is blank: page one of the pack, the first document a buyer opens, is yours to build start to finish. Every step is one the chapter taught, from the title to the print set-up, and the page must tie before it goes out. From a garbled workbook to a finished page, in one sitting. The key is `Ctrl+PgDn`.

**Done screen, line** **DRAFT** You took a raw feed to a signed-off page in one sitting, and that is Chapter 1.

**Done screen, paragraph** **DRAFT** You started with a fresh feed and a blank sheet, and fifteen steps later the report is linked, totaled, formatted and print-ready with its checks at zero. || The CFO would have checked what the checks row checks (revenue ties to the feed, the sites sum to the total, the margin is plausible), then that every link is green, every figure carries the desk's format with $ on the first and total rows, and the page prints on one landscape sheet with its heads repeated. Now the same page on the clock.

**Goals** (all DRAFT)

1.  Give the page its title in A1, bold and one size up, and the units line USD unless stated in A2 in italic.
2.  Tab the eight headers, Site to Margin %, into A4:H4; bold them, right-align and wrap C4:H4, then center the title across A1:H1.
3.  Copy the five site names from Inputs A9:A13 into A5:A9, then type the week label Week of Sep 22 in B5 and fill it down to B9.
4.  Point C5 and D5 at Raw's I8 and J8 across sheets, E5 at C5 × the cost per wash on Inputs anchored, all three green.
5.  Point Domain's gross profit F5 =D5−E5, average ticket G5 =D5/C5 and margin H5 =F5/D5, one after another with Tab.
6.  Row 5 is the page's one formula row: select C5:H9 and fill it down the five sites with Ctrl+D.
7.  Select C5:F10, the block plus its blank edge: one Alt+= totals every column; point G10 =D10/C10 and H10 =F10/D10; type Total in A10.
8.  Format C5:F10 in the desk number format, G5:G10 currency 2, H5:H10 percent 1, then currency 0 on D5:F5 and again on D10:F10 with F4.
9.  The Total row is bold with a top border, never a grid: select the whole row 10 with Shift+Space, Ctrl+B, then Alt, H, B, P.
10.  Head the daily block: A12 Washes by day bold, A13:G13 Site and Mon to Sat bold with the days right-aligned, A14:A18 the sites indented.
11.  Select A13:G18, Go To Special for Blanks, point one link at Raw's I32 and Ctrl+Enter fills all thirty cells; separators, 0 decimals, green.
12.  Head a Checks block at A20 with three labels; B21:B23 hold the checks, reading 0 in the desk number format, the first pointed at Raw's J13.
13.  Set columns B:F to width 12 and G:H to 14, then AutoFit column A to its site names A5:A18 and row 4 to its wrapped headers.
14.  Freeze panes at B5, gridlines off, then set the page to print: landscape, one page, rows 1:4 repeated, &[File] and &[Date] in the footer.
15.  Does it tie? Change Domain's Monday washes on Raw to 300 and watch the Total in C10 answer while the checks in B21:B23 stay zero.

### 1.8.A Assessment: Monday morning

*lesson: foundations-assessment · 17 goals*

**Brief** **DRAFT** Monday 7:10am. The CFO wants the page before the 9:00: the San Antonio cluster's Week of Sep 22 feed sits on Raw, the Report is blank, and the page is the one the project built (links, totals, margins, daily block, checks, formats and print set-up), on the clock, no help, keyboard only. Pass, and the chapter is Verified. This is also the test-out: if you already know all of this, prove it here. The key is `Ctrl+PgDn`.

**Done screen, line** **DRAFT** You built page one of the pack from a blank sheet on the clock, and the chapter is Verified.

**Done screen, paragraph** **DRAFT** Built from a feed you had never seen: every figure a live link or a formula, the checks at zero, the print set-up done. || The CFO would have looked at the same things the goals did: green links and black formulas, the price anchored on Inputs, $ only on the first and total rows, a top border on the total, a page that fits one sheet. That's the standard, and you just met it under a clock.

**Goals** (all DRAFT)

1.  A1: Clearcoat - San Antonio Weekly KPI Report, Week of Sep 22, 2026, bold, a size up, centered across A1:H1; A2: USD unless stated, italic.
2.  Row 4, the eight headers Site through Margin % as one Tab run, bold, with C4:H4 right-aligned and wrapped.
3.  The five sites from Inputs A9:A13 into A5:A9 by copy, and the week label Week of Sep 22 in B5:B9 by fill.
4.  Washes and revenue C5:D9 as live links to Raw's site totals I8:J12, pointed across sheets, and colored green.
5.  Wash cost E5:E9 is washes times the cost per wash: =C5*Inputs!$B$4, anchored with F4, committed into all five with Ctrl+Enter, green.
6.  F5:F9 =D5−E5, G5:G9 =D5/C5, H5:H9 =F5/D5 by pointing and filled down; Total in A10; C10:F10 by one AutoSum; G10 =D10/C10; H10 =F10/D10.
7.  A sixth site opened: insert a row inside the block above the last site, enter its name and three figures, and color the typed figures blue.
8.  The stale Old code column at I is the old system's: delete the whole column.
9.  Daily block: Washes by day in A12, Site and Mon–Sat bold in row 13, sites indented in A14:A18, B14:G18 green links to Raw's by-day block.
10.  Checks in A20, bold; the three labels A21:A23; B21 =D10−Raw!J13, B22 =SUM(C5:C9)−C10, B23 =IF(AND(H10>=0,H10<=1),0,1), all reading 0.
11.  Formats: desk number format on C5:F10, B14:G18, B21:B23; G5:G10 currency 2; H5:H10 percent 1; D5:F5, D10:F10 currency 0, the second by F4.
12.  Style: total row bold with a top border and no grid; C4:H4 and B13:G13 right-aligned; nothing merged anywhere.
13.  Widths: B:F 12, G:H 14 with F4, column A AutoFit to the sites, row 4 AutoFit; the working columns E:F grouped, not hidden.
14.  Freeze panes at B5; gridlines off.
15.  Replace All on the Report: every Week of Sep 15 becomes Week of Sep 22; read the count.
16.  Page setup: landscape, fit to one page, rows 1:4 as print titles, &[File] in the left footer and &[Date] in the right.
17.  Does it tie? Change the first site's Monday washes on Raw to 300 and watch the Report's total in C10 answer while the checks stay zero.

## Built differently

Where the build departs from this script (run R1, 2026-10-01). Each line is one departure; the script text above is unchanged.

- Inputs site list sits at A18:A22 (the script's block clashes with A9:A13); goals that copy Inputs!A9:A13 read A18:A22.
- 1.3.3's Notes cut lands at J1, not H1, so it doesn't overwrite 1.3.1's H4 note.
- 1.1.2 and 1.2.2 select C2:C60 and E1:E60 ("sixty cells"), because Airport's Saturday row 61 is blank in Raw.
- 1.1.5 goals 4 and 5 are swapped (B12 green before B10) so each hint follows from the last; Automatic goes through Format Cells, since the palette has no Automatic entry.
- 1.2.1 goal 8: Costs!B7 is South Lamar's rent, not Domain's maintenance; the copy says so.
- 1.2.2 goal 3 (read the status bar) ends with Ctrl+Home so it has a key.
- 1.2.3: AutoFit takes Ctrl+Space first, and wrapped rows take Alt H O A.
- 1.2.4: Costs holds seventeen typed figures, one formula and two blanks (script said 15, 3 and 2).
- 1.2.C: the used block is A1:N68, counting the inserted note row.
- 1.1.C seed titles read "Clearcoat Express: {city} site costs, week of Sep 8, 2026".
- 1.3.1 has 8 goals, not 10: Delete and the two-line note are one goal, and the two Inputs labels are one goal.
- 1.3.2 reaches Riverside with PgDn and three Down arrows; clearing B14's fill finds Mueller with three Enters, since the by-day and totals blocks match first.
- 1.3.3 folds the cut's teach line into goal 2's.
- 1.3.4 has 8 goals: the sensitivity labels and the transpose are one goal; Paste Formats' teach is folded into goal 2's.
- 1.3.5: Define Name and Go To by name are one goal; goal 6 reads "snaps the view back to the active cell", because PgDn moves the active cell; the brief is trimmed to 110 words.
- 1.3.C has 7 goals: the Muller fix and the Riverisde Replace All are one goal; the name and the note are graded on Inputs!B4 with any note text.
- 1.4.1 goal 6's cue reads I8, not J8, since the column letter shifts after the delete.
- 1.4.C week labels read "Week of Sep 22, 2026".
- 1.5.1 goal 3: the negatives choice is already set when Format Cells reopens on a comma cell, so the route is Ctrl+1, N, Tab, C, Alt+D, 0, Enter.
- Counts lines (daily block, week summary, scenario grid) are Excel's #,##0, reached by Ctrl+Shift+1 then Alt H 9 twice.
- Report is frozen at row 4, so "Ctrl+Home" cues are replaced; 1.6.4 goal 8 and 1.6.6 goal 6 return by Ctrl+PgUp.
- 1.6.6 goal 7 resets E5:E8 to Automatic through Format Cells, Font, since the font color button has no Automatic swatch.
- 1.7.1's teach says Alt+F picks Fit to; the footer's file name and date are set in two passes of Page Setup.
- 1.7.2's label teach lists the four labels in a sentence.
- 1.7.C and 1.8.A are fixed to San Antonio; the assessment plants a sixth site, Leon Valley, on Inputs row 26, plus stale week labels and an Old code column on the Report, so goal 3 copies sites only; its rows are total 11, daily 13 to 19, checks 21 to 24.
- 1.8.P: the H column turns italic in the formats goal, check labels are indented, and print set-up is one Page Setup pass.
- G6's typed figure in 1.7.3 is Mueller's last-week washes from the workbook, not 1,240.
- The drills: twelve became eleven (M108) with new ids; Daily sheets run Monday to Saturday; before-you-send uses notes typed into H6 and H9.
- Payoff pass (2026-10-02, Wolf's rule that every new key is used for a real job before the next): 1.1.1 no longer selects the table for nothing; its jumps read Sheet2's last row (A15), the #N/A on Old wk37 (A22) and a Costs figure (E4) before the rename, the delete and the report sheet. Selection is taught in 1.1.2 and 1.1.5.
- 1.1.2 teaches Ctrl+Shift+Down and uses it at once: select Revenue and read its Sum in the status bar.
- 1.1.3 runs Alt W as "find Gridlines" then "now run it"; Ctrl+1 gives Inputs B6 a thousands separator (9,000) and Alt H O E makes B7 a percentage (2.50%).
- 1.1.4 drops the standalone F9 goal (now in the iterative-calculation teach); the new Quick Access button, Alt 7 (Decrease Decimal), takes Inputs B7 to 2.5%.
- 1.1.5 teaches Shift+arrow at its first real job, coloring a block.
- 1.2.1 answers six questions with no "back to the top" goal: PgUp and PgDn read Airport's missing Saturday, and Go To lands on Costs!B7 for South Lamar's rent ($1,650).
- 1.2.2 orders selection small to large, each with a job: Shift+Right right-aligns the headers, Ctrl+Shift+Down sums Revenue, Shift+Space sets row 1 to height 20, Ctrl+Space AutoFits Site, Ctrl+A counts the feed (357 of 366), Ctrl+Home then Ctrl+Shift+End measures the used range. A new workbook state sits between 1.2.2 and 1.2.3.
- 1.2.3 is width, then F4 repeating it, insert row, insert column, delete column and wrap the note; AutoFit, row height and align moved to 1.2.2.
- 1.2.C plants an untidy layout from another cluster: right-align the headers, set the header row height, AutoFit the site column, then mark the stray Revenue constants blue with Go To Special.
- The Get around the report drill starts half tidied and every movement ends in a fix (bold and rule the Total row, right-align headers, color inputs blue, F4 on the cost and day block, AutoFit Revenue, fix an 880 typo on Costs B8); Pass is now 80 s.
