// app2/content/schema.js — the lesson data format, and a validator for it.
//
// A lesson is a plain ES module exporting one object:
//
// {
//   id: 'moving-around',                    unique, kebab-case (no numbers: the catalogue order numbers lessons)
//   chapter: 'foundations',                 chapter id (content/index.js)
//   section: 'Moving',                      the chapter section (CHAPTERS[].sections in content/index.js)
//   title: 'Moving around the worksheet',
//   difficulty: 'easy' | 'medium' | 'hard',
//   tags: ['navigation'],
//   access: 'free' | 'paid',
//   concepts: ['ctrl-arrow', 'home-key'],   concept ids TAUGHT here (see CONCEPTS below)
//   prerequisites: ['active-cell'],         lesson ids that must be completed first
//   read: 'What the lesson is. What you will do. Why it pays off at work.',   two or three sentences, total
//   sheet: { cells: {...}, active: {r,c}, colW: {...} },   the starting sheet (Sheet constructor options)
//   sheets: [{ name: 'Sheet1' }, { name: 'Sheet2', cells: {...} }],   optional workbook: names and extra sheets
//   par: 20,                                 timed-mode par, seconds
//   goals: [                                 sequential; each names a VISIBLE element of the sheet
//     { id: 'ctrl-down',
//       teach: 'Ctrl+↓ jumps to the edge of the data.',   one sentence, ONLY on the goal that first introduces
//                                                         a concept this lesson teaches (SITE_SPEC §4: adaptive,
//                                                         the teaching point rides the first use; reuse shows the action only)
//       text: 'Move from A3 (Monday) to A7 (Friday).',   the action, one sentence
//       keys: 'Ctrl+↓',                      the route as keycaps; shown with a teach line, else through Help
//       alt: 'Alt H I C',                    optional: another route Excel offers (or a list of them), shown as "Also works";
//                                            the grader takes any route, so alt only teaches
//       requires: ['ctrl-arrow'],            concept ids this goal needs (must be taught here or earlier)
//       check: (sheet, session) => boolean }, end-state predicate
//   ],
//   endState: [ { text, check } ],           optional extra predicates that must hold when the last goal lands
//   race: [ { label: 'Down the list', slow: 'watch-crawl', fast: 'ctrl-up' } ],   optional: pairs of goals whose split times are shown side by side
//   a goal may instead be a demo the platform plays while the learner watches (the Welcome lesson):
//     { id: 'watch-crawl', demo: { script: 'Down Down …', cadence: 120 }, text: 'Watch: …', requires: [...], check: (s, ses) => ses.demoDone.has('watch-crawl') }
//   closing: ['sentence', …],                optional paragraphs on the completion overlay
//   solution: 'Ctrl+Down Ctrl+Right Home',   reference solution as keystrokes (parseKeyScript)
// }
//
// Goals are checked in order after every keystroke: goal i counts as done the first time its check
// passes while every earlier goal is already done, and the lesson is complete when the last goal
// lands and every endState predicate holds. A check may read the session's keyLog when the point of
// the goal is the mechanic itself (e.g. "use F2") — but only the key window: the runner sets
// session.goalMark to keyLog.length each time a goal lands, so a mechanic check reads
// keyLog.slice(session.goalMark || 0), the keys pressed since its goal became current. A key pressed
// for an earlier goal, or before the lesson began, never satisfies a later goal.
//
// Goals latch: once landed they stay landed (navigation lessons depend on it), so a lesson whose
// goals leave something on the sheet (a format, a border) should restate it in endState. The
// runner shows a failing endState as the pending item once every goal has landed.

import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { parseRef } from '../engine/refs.js';
import { CONVENTIONS } from './conventions.js';
import { WORKBOOKS, workbookState, applyStatePatch } from './workbooks/index.js';
import { mulberry32 } from '../engine/rng.js';

/** A goal's alt: one route as keycaps, or a list of them, each a non-empty string. Pure. */
export const isAltKeys = a => (typeof a === 'string' && !!a.trim()) || (Array.isArray(a) && a.length > 0 && a.every(x => typeof x === 'string' && x.trim()));

export const DIFFICULTIES = ['easy', 'medium', 'hard'];
export const ACCESS = ['free', 'paid'];
export const MODES = ['guided', 'solo', 'timed', 'challenge'];   // how a lesson is played; the Brief precedes them
export const KINDS = ['lesson', 'project', 'assessment', 'testout', 'challenge'];   // + C2: the module's timed, seeded challenge
/** The kinds whose workbook wears a seed's clothing before the first key (runner and validator agree). */
export const SEEDED_KINDS = ['challenge', 'assessment', 'testout'];

/** Concept ids and their display names — the vocabulary lessons teach and require. */
export const CONCEPTS = {
  'worksheet': 'the worksheet grid: columns A, B, C… and rows 1, 2, 3…',
  'cell-reference': 'a cell reference such as B3 (column letter, row number)',
  'active-cell': 'the active cell and its outline',
  'name-box': 'the Name Box shows the active cell reference',
  'formula-bar': 'the Formula Bar shows the contents of the active cell',
  'arrow-keys': 'the arrow keys move the active cell one cell at a time',
  'ctrl-arrow': 'Ctrl+Arrow jumps to the edge of the current data block',
  'home-key': 'Home moves to column A of the current row',
  'ctrl-home-end': 'Ctrl+Home goes to A1; Ctrl+End goes to the last used cell',
  'enter-tab-move': 'Enter moves down; Tab moves right',
  'range': 'a range is a rectangular block of cells, written B3:B7',
  'shift-arrow': 'Shift+Arrow extends the selection',
  'ctrl-shift-arrow': 'Ctrl+Shift+Arrow extends the selection to the edge of the data',
  'row-col-select': 'Shift+Space selects the row; Ctrl+Space selects the column',
  'ctrl-a': 'Ctrl+A selects the current region',
  'type-to-enter': 'typing into the active cell enters data',
  'enter-commits': 'Enter confirms an entry and moves down',
  'tab-commits': 'Tab confirms an entry and moves right',
  'escape-cancels': 'Escape discards an entry in progress',
  'text-vs-number': 'text aligns left; numbers align right',
  'delete-clears': 'Delete clears the contents of the selected cells',
  'edit-mode-f2': 'F2 opens the active cell for editing with the insertion point at the end',
  'edit-caret': 'in Edit mode the Left/Right arrow keys, Home and End move the insertion point',
  'backspace': 'Backspace deletes the character before the insertion point',
  'replace-by-typing': 'typing on a cell replaces its whole contents',
  'ribbon': 'the Ribbon: tabs of commands across the top of Excel',
  'keytips': 'Alt shows KeyTips; letters choose a tab, then a command',
  'home-tab': 'the Home tab holds the everyday formatting commands',
  'bold-command': 'Bold: Alt, H, 1 (or Ctrl+B)',
  'borders-menu': 'the Borders menu: Alt, H, B, then a border',
  'align-command': 'alignment commands: Alt, H, A, then L / C / R',
  'escape-backs-out': 'Escape backs out of the Ribbon one level at a time',
  'dialog-box': 'in Excel a dialog box stays open until you confirm (Enter/OK) or cancel (Esc)',
  'format-cells-dialog': 'the Format Cells dialog box: Ctrl+1',
  'number-formats': 'number formats change how a value is displayed, not the value',
  'ribbon-route-dialog': 'Alt, H, O, E opens Format Cells from the Ribbon',
  // How Excel works (Chapter 1, section 1)
  'workbook': 'a workbook is the Excel file; each worksheet in it is a tab along the bottom',
  'sheet-tabs': 'Ctrl+PgDn moves to the next worksheet, Ctrl+PgUp to the previous one',
  'go-to': 'Go To (Ctrl+G or F5) jumps to any reference you type: a cell, a range, or a cell on another sheet',
  'sheet-reference': 'a reference on another sheet names the sheet first: Costs!B3',
  'rename-sheet': 'Rename Sheet (Alt, H, O, R, or double-click the tab) opens the tab\'s name selected: type the new one and press Enter',
  'insert-sheet': 'Shift+F11 (or Alt, H, I, S) inserts a new worksheet in front of the active one and makes it active',
  'delete-sheet': 'Delete Sheet (Alt, H, D, S) removes the active worksheet; one that holds anything asks you to confirm, and it cannot be undone',
  'move-sheet': 'Move or Copy Sheet (Alt, H, O, M): ↑ ↓ pick the sheet it goes before, or (move to end); C ticks Create a copy',
  'ribbon-tabs': 'the Ribbon tabs (Home, Page Layout, Formulas, Data, View…) each group related commands',
  'gridlines': 'View › Show › Gridlines (Alt, W, V, G) hides or shows the sheet gridlines',
  'excel-options': 'Excel Options (Alt, F, T) holds the settings that live outside the grid',
  'calc-mode': 'Workbook Calculation: Automatic recalculates on every change, Manual waits for F9',
  'iterative-calc': 'Enable iterative calculation lets a workbook resolve a circular reference, such as interest on an average balance',
  'quick-access-toolbar': 'the Quick Access Toolbar above the Ribbon: pinned commands, run with Alt then their number',
  'calculate-now': 'F9 recalculates the workbook (Calculate Now)',
  'page-setup': 'the Page Setup dialog box (Alt, P, S, P): orientation and scaling for printing',
  'orientation': 'Portrait or Landscape: which way the printed page turns',
  'fit-to-page': 'Fit to 1 page wide by 1 tall scales the print to a single page',
  'font-color': 'Font Color: Alt, H, F, C, then → to a swatch and Enter',
  'input-colour-convention': 'the model colour convention: hardcoded inputs blue, formulas black',
  // Moving and selecting, beyond the basics (phase C)
  'page-keys': 'PgDn and PgUp move a screen down and up; Alt+PgDn and Alt+PgUp a screen right and left',
  'select-all-sheet': 'Ctrl+A selects the current region; pressed again it selects the whole sheet',
  'go-to-special': 'Go To Special (Alt, H, F, D, S) selects every blank, constant or formula cell inside the selection',
  // Entering and editing (phase C)
  'undo-redo': 'Ctrl+Z undoes the last change; Ctrl+Y redoes it',
  'fill-down-right': 'Ctrl+D fills the selection from its top row; Ctrl+R fills it from its left column',
  'ctrl-enter-fill': 'Ctrl+Enter commits an entry into every selected cell at once',
  'find-replace': 'Find (Ctrl+F) jumps to matching text; Replace (Ctrl+H) swaps it out everywhere',
  // Rows, columns and sheets (phase C)
  'insert-delete-rows': 'Ctrl+Shift+= inserts and Ctrl+- deletes the selected whole rows or columns',
  'column-width': 'Column Width (Alt, H, O, W) sets the selected columns\' width in Excel units',
  'row-height': 'Row Height (Alt, H, O, H) sets the selected rows\' height in points',
  'autofit': 'AutoFit (Alt, H, O, I for width, Alt, H, O, A for height) sizes to the content',
  'hide-unhide': 'Ctrl+9 hides the selected rows and Ctrl+0 the columns; Ctrl+Shift+( and Ctrl+Shift+) unhide inside the selection',
  'freeze-panes': 'Freeze Panes (Alt, W, F) keeps the rows above and columns left of the seam in view',
  // The Ribbon and dialogs (phase C)
  'format-cells-tabs': 'the Format Cells categories answer to their first letter: N Number, C Currency, P Percentage, A Center Across',
  'bold-italic-underline': 'Ctrl+B bold, Ctrl+I italic, Ctrl+U underline — and Alt, H, 1 / 2 / 3 from the Ribbon',
  'fills-and-colours': 'Fill Color is Alt, H, H then a letter or arrows; a fill marks a cell, never its value',
  'center-across': 'Center Across Selection (Format Cells, A) centres a title over columns without merging cells',
  // Basic formulas (phase C)
  'formula-basics': 'a formula starts with = and recalculates whenever its inputs change',
  'formula-operators': 'the arithmetic operators: + - * / and parentheses to group',
  'sum-family': 'SUM, AVERAGE, MIN, MAX and COUNT each take a range: =SUM(B3:B7)',
  'autosum': 'AutoSum (Alt+=) proposes =SUM over the numbers above or to the left; Enter accepts it',
  'relative-absolute': 'a relative reference (B3) shifts when copied; $ anchors it: $B$3 never moves',
  'f4-anchor': 'F4 cycles the anchors on the reference at the insertion point: B3, $B$3, B$3, $B3',
  'f4-repeat': 'F4 outside a formula repeats the last action — a format, a border, a width, an insert — on the new selection',
  'cross-sheet-ref': 'a reference on another sheet names the sheet first: =Costs!B3',
  'formula-errors': '#DIV/0!, #NAME?, #VALUE! and #REF! each say what broke: the input, the name, the type, the reference',
  // Copy, paste and fill (phase C)
  'copy-cut-paste': 'Ctrl+C copies, Ctrl+X cuts, Ctrl+V pastes at the selection; Esc drops the marquee',
  'paste-enter-drop': 'after a copy, Enter pastes once and drops the marquee',
  'paste-special': 'Paste Special (Ctrl+Alt+V) pastes one aspect: values V, formats T, transpose E, or an operation',
  'fill-series': 'Fill Series (Alt, H, F, I, S) continues the step your first two cells set',
  'flash-fill': 'Flash Fill (Ctrl+E in Excel) fills a column by the pattern of your examples',
  'qat-run': 'Alt then a number runs that Quick Access Toolbar command from anywhere',
  // C2 (Chapter 1): the module lessons' additions
  'enter-tab-direction': 'Tab commits and moves right; Enter after a Tab run returns to the column you started in, one row down',
  'replace-all': 'Replace All (Ctrl+H, then Alt+A) swaps every match on the sheet in one step and reports how many cells changed',
  'group-ungroup': 'Alt+Shift+→ groups the selected whole rows or columns into an outline that folds and unfolds; Alt+Shift+← ungroups',
  'show-formulas': 'Ctrl+` shows every formula\'s text in place of its value; press it again to return',
  'print-titles': 'Page Setup › Sheet: the rows to repeat at the top of every printed page, and the footer with its file, date and page fields',
  'pointing': 'while a formula is open, an arrow key points at a cell and writes its reference for you',
  'counta': 'COUNT counts numbers; COUNTA counts every non-empty cell, text included',
  'check-cell': 'a check cell is a live difference between two things that must agree, so it reads 0 when they tie',
  'audit-pass': 'the audit pass: Go To Special, show formulas and tracing find what a reviewer would',
  'ref-error': '#REF! means a formula pointed at a cell that was deleted; Ctrl+Z brings the cell and the formula back',
  'wrap-text': 'Wrap Text (Alt, H, W) folds a long entry inside its cell; AutoFit Row Height (Alt, H, O, A) then sizes the row to it',
  // Run R1 (Clearcoat, script-ch1.md): 1.1.2 Know the screen, 1.1.4's Enter setting, 1.1.5's link color
  'formula-bar-expand': 'Ctrl+Shift+U expands the formula bar to several lines and collapses it again, so a long entry reads in full',
  'ribbon-collapse': 'Ctrl+F1 collapses the Ribbon to its tab names and shows it again; Alt still works while it is collapsed',
  'status-bar': 'the status bar totals whatever is selected, with no formula written: Sum, Average and Count',
  'zoom': 'Zoom (Alt, W, Q) sets the sheet\'s zoom; Alt, W, J is 100% in one press',
  'enter-stays': 'Excel Options \u203a Advanced: with "After pressing Enter, move selection" off, Enter commits the entry and stays on the cell',
  'link-colour-convention': 'a link to another sheet is green and a link to another file red, so a reader sees which figures come from elsewhere',
  // 1.3.5 (Clearcoat): names, notes and the small keys
  'defined-name': 'Define Name (Alt, M, M, D) labels a cell or range; Go To and formulas accept the name where they accept an address',
  'cell-note': 'Shift+F2 opens a note on the cell: a comment that travels with it, where a hardcode\'s source belongs',
  'date-stamp': 'Ctrl+; enters today\'s date and Ctrl+Shift+; the time, as values that do not change tomorrow',
  'scroll-to-active': 'Ctrl+Backspace scrolls the window back to the active cell without moving it',
  // Chapter 2 (Project Rinse, the book): number formats and custom number formats
  'line-formats': 'one number format per line, set on the whole line at once: dollars in the desk number format, counts plain, a per-wash figure to the cent',
  'margins-and-growth': 'a margin is a line as a share of revenue (=C24/C10); growth is this year over last, less one (=D10/C10-1)',
  'cagr': 'CAGR, compound annual growth, is (last/first)^(1/periods)-1, and COLUMNS(C10:E10)-1 counts the periods so no number gets typed',
  'custom-date-code': 'a date code in the Custom box writes a date its own way: yy is the two-digit year, mmm the month, and text in quotes rides along, so "FY"yy"A" reads FY24A',
  'general-format': 'General is the no-format format: Ctrl+Shift+~ (or Ctrl+1, G) returns a cell to how its value was typed',
  'accounting-format': 'Accounting Number Format (Alt, H, A, N) sets the $ at the cell\u2019s left edge, negatives in parentheses and zero as a dash',
  'paste-special-operation': 'Paste Special\u2019s Operation (Ctrl+Alt+V, then V for values and M for Multiply) multiplies every selected cell by the copied value',
  'date-format': 'a date is a serial number of days; Ctrl+1, D shows it as Jan-26, and the number underneath still sorts and subtracts',
  'custom-number-format': 'Format Cells \u203a Custom (Ctrl+1, U) takes a code of up to four sections, positive;negative;zero;text, that says how each kind of value reads',
  'format-units': 'a comma after the last digit placeholder divides by a thousand, and a unit rides along in quotes: #,##0,"k", 0.0"x", 0 "bps"',
  'date-function': 'DATE(year, month, day) builds a date from its parts: =DATE(2026,12,31) is the FY26 year end',
  'text-function': 'TEXT(value, "format") renders a number through a format code as text, so a header can be built from a date',
  'concatenate-amp': '& joins text and cell values into one string: ="FY"&TEXT(B3,"yy")&"A"',
  'conditional-format-code': 'a section may open with a condition or a color, [>=1000]0,"k" or [Red], and Excel uses the first section whose condition the value meets',
  'hide-zeros': 'an empty section shows nothing: #,##0;(#,##0); hides the zeros of a working block',
  // Chapter 2, modules 2.3 and 2.4: the page a buyer reads, alignment and structure
  'page-anatomy': 'a financial page reads in one order: the title, the units line, the timeline, the sections and the answer they add down to',
  'indent-levels': 'Increase Indent (Alt, H, 6) moves a label one level in and Decrease Indent (Alt, H, 5) one level out, so a sub-line reads as part of its total',
  'font-size-step': 'Increase Font Size (Alt, H, F, G) takes the selection one step up the size list; Alt, H, F, K takes it one step down',
  'clear-all': 'Clear All (Alt, H, E, A) empties the cells and takes their formats with them',
  'ae-divider': 'the A/E divider: one right border down the last actual column and a shade on the estimate header, so a reader sees where the forecast starts',
  'border-meaning': 'a top border says the row adds up what is above it, a double bottom marks the final answer, and a grid says nothing at all',
  'source-line': 'every table carries a source line under it, and a footnote marker where a figure needs a word',
  'label-column': 'a page has a shape: a narrow margin in A, the labels fitted in B, and one set width across the period columns',
  'paste-formats-tile': 'Paste Special Formats from one column onto a wider block repeats the column’s formats across every column of the block',
  'header-alignment': 'headers sit bold and right-aligned over their figures, and a long header wraps inside its column rather than widening it',
  'outline-detail': 'Hide Detail (Alt, A, H) folds a group to its total and Show Detail (Alt, A, J) opens it again',
  'group-not-hide': 'hidden rows get forgotten: group detail that belongs on the page, and give a different page its own sheet',
  'navigation-column': 'a navigation column lists a long sheet’s named blocks at the top, and Go To with a name lands on each one',
  'cell-style': 'New Cell Style (Alt, H, J, N) saves the active cell’s look under a name, with ticks for the parts it carries; the Cell Styles gallery (Alt, H, J) applies it anywhere in the workbook',
  'outline-levels': 'grouping rows that hold a group nests it a level deeper; Hide Detail folds the innermost group at the cell, and the outline numbers fold every group of a level at once',
  'hyperlink': 'Insert Hyperlink (Ctrl+K) › Place in This Document links a cell to a sheet, a cell or a defined name; Shift+F10, O follows it',
  // Chapter 2, modules 2.5 and 2.6: conditional formatting, and dates and text for presentation
  'highlight-rule': 'Conditional Formatting (Alt, H, L) › Highlight Cells Rules: Less Than, Greater Than, Between, Equal To paint a cell whose value meets the test',
  'manage-rules': 'Manage Rules (Alt, H, L, R) lists the sheet\u2019s rules in the order they run: read, delete, move up or down, Stop If True',
  'formula-rule': 'New Rule › Use a formula (Alt, H, L, N): written for the top-left cell of the selection and read in every cell as if filled, so $A7 locks the column and lets the row move',
  'duplicate-values': 'Highlight Cells Rules › Duplicate Values (Alt, H, L, H, D) lights every value that appears more than once in the range',
  'rule-order': 'rules run top-down; Move Up puts one first, and Stop If True ends the walk for a cell where it holds',
  'data-bars': 'Data Bars and Color Scales (Alt, H, L, D and S) draw a chart inside the cells; Clear Rules (Alt, H, L, C) takes rules off the selection or the sheet',
  'eomonth-edate': 'EOMONTH(date, n) is the last day of the month n months on; EDATE(date, n) the same day n months on',
  'clean-text': 'TRIM strips stray spaces, PROPER capitalizes each word, SUBSTITUTE swaps one piece of text for another: together they clean an imported label',
  'dynamic-title': 'a title built with & from the inputs: the company name lives in one cell and every page reads it',
  'single-source-line': 'a line every page shows is built once from the inputs and read everywhere, so one edit changes every page',
  // Chapter 2 · 2.7 Printing and page layout
  'page-numbers-footer': 'Page &[Page] of &[Pages] in the footer numbers every printed page of a pack, beside the file and the date',
  'center-on-page': 'Page Setup › Margins: Center on page Horizontally (Alt+Z) sits a narrow page in the middle of the paper',
  'summary-links': 'a summary page holds no typed figure: every number is a link to the detail behind it, so the two can never disagree',
  // Chapter 3 (the KPI databook): 3.1 logic and 3.2 dates
  'if-function': 'IF(test, if true, if false) asks a question and gives one answer when it holds and another when it does not',
  'nested-if': 'a nested IF puts an IF inside the false answer of another, so the tests run in order; past two levels nobody can read it',
  'ifs-function': 'IFS(test1, value1, test2, value2, ..., TRUE, else) returns the value beside the first test that holds',
  'min-max-cap': 'MAX(x,0) floors a figure at zero and MIN(x,cap) caps it: one call where an IF would test',
  'and-or-not': 'AND is TRUE when every test holds, OR when any does, and NOT flips one; each returns TRUE or FALSE and sits inside IF',
  'iferror-function': 'IFERROR(value, fallback) shows the fallback where the value is an error; use it only where the error is expected',
  'isnumber-override': 'the override pattern: =IF(ISNUMBER(R5),R5,C5) reads a typed override when there is one and the link when there is not',
  'date-serial': 'a date is a serial number of days since January 1, 1900, so dates subtract and compare like figures; Ctrl+Shift+~ shows the number',
  'year-month-day': 'YEAR, MONTH and DAY take a date apart into its year, month and day',
  'blank-test': 'a blank cell equals "", the empty text, so IF(F5="", ...) asks whether a date is missing',
  'paste-formulas': 'Paste Special, Formulas (Ctrl+Alt+V, F) writes the copied formulas and leaves every cell its own format',
  'fill-to-bottom': 'to fill a long table, Go To its last row, widen across, and Ctrl+Shift+↑ climbs to the formulas in the first row',
  'period-key': 'a period key is a column that says which month, quarter or week a row belongs to, written by formula from its date',
  'weekday-function': 'WEEKDAY(date, 2) numbers the day of the week from Monday as 1 to Sunday as 7',
  'yearfrac': 'YEARFRAC(start, end, basis) is the exact share of a year between two dates; the basis picks the day count',
  'fiscal-year': 'a fiscal year ends where the company says: with a June 30 year end, a date from July on belongs to the next fiscal year',
  'networkdays': 'NETWORKDAYS counts the working days between two dates less a holiday list; NETWORKDAYS.INTL takes the weekend as seven digits',
  // Chapter 3 · 3.3 Math and aggregation, 3.4 Text (the KPI databook)
  'round-function': 'ROUND(number, digits) changes the value itself: 2 rounds to the cent, 0 to the dollar, -3 to the thousand; a number format only changes what shows',
  'roundup-rounddown': 'ROUNDUP and ROUNDDOWN take the same digits as ROUND but always round one way',
  'ceiling-floor': 'CEILING(number, step) rounds up to the next multiple of the step and FLOOR rounds down to it: =CEILING(6.95,0.25) is 7',
  'abs-function': 'ABS returns a number without its sign: how far, not which way',
  'countif-countifs': 'COUNTIF(range, criteria) counts the cells that meet one condition; COUNTIFS takes as many range and criteria pairs as you need',
  'criteria-operators': 'a criteria can be a cell, a text, or a comparison in quotes: ">=250", "<20", and "<>" for not blank',
  'sumif-sumifs': 'SUMIF(range, criteria, sum_range) adds the rows that meet a condition; SUMIFS puts the sum range first, then the pairs',
  'averageifs': 'AVERAGEIFS(average_range, criteria_range, criteria, …) averages the rows that meet every condition',
  'maxifs-minifs': 'MAXIFS and MINIFS return the largest and the smallest value among the rows that meet the conditions',
  'large-small-rank': 'LARGE(range, n) is the nth biggest, SMALL(range, n) the nth smallest, and RANK(number, range) a value\'s place in the list',
  'sumproduct': 'SUMPRODUCT multiplies two ranges pair by pair and adds the products in one call: washes times price, without a helper column',
  'reconciliation': 'a reconciliation sets two counts of the same thing side by side, explains the difference line by line, and checks the adjusted figure to zero',
  'left-right-mid-len': 'LEFT and RIGHT take characters from either end of a text, MID from a position, and LEN counts them',
  'find-search': 'FIND(find_text, within_text) returns the position of a character, case and all; SEARCH does the same without caring about case',
  'substitute-upper': 'SUBSTITUTE(text, old, new) swaps text for text and UPPER capitalizes every letter, so a parsed piece reads one way',
  'value-datevalue': 'VALUE turns a number stored as text into a number and DATEVALUE turns a text date into a date serial',
  'text-to-columns': 'Text to Columns (Alt, A, E) splits a column by a delimiter or a fixed width in one pass, and writes values',
  // Chapter 3 · 3.5 Time value of money and 3.6 Auditing (the databook)
  'pmt-pv-fv': 'PMT(rate, periods, principal) is a loan’s level payment, shown as cash out; PV runs it backwards to the loan a payment supports, FV forwards to what a sum grows to; the rate and the periods are per payment',
  'npv': 'NPV(rate, flows) discounts each flow from one period out, so year 0 is added outside it; XNPV(rate, flows, dates) discounts by the dates',
  'irr': 'IRR(flows) is the rate at which the NPV of the flows is zero, year 0 included; XIRR takes the dates; payback is the year the cumulative cash turns positive',
  'loan-schedule': 'a loan schedule: opening balance, interest at the period rate, principal as the payment less interest, closing balance, one row written once and filled down; IPMT and PPMT give the split directly',
  'running-total': 'a running total anchors the start and lets the end move: =SUM($E$44:E44) filled down adds one more row each time',
  'trace-arrows': 'Trace Precedents (Alt M P) draws arrows from the cells a formula reads, Trace Dependents (Alt M D) to the cells that read it, and Remove Arrows (Alt M A A) clears them',
  'evaluate-formula': 'Evaluate Formula (Alt M V) works through a formula one calculation at a time, showing each piece’s value before the next',
  'f9-part': 'in an open formula, F9 on a selected part shows that part’s value; Esc puts the formula back, Enter would keep the value for good',
  'goto-special-types': 'Go To Special’s Numbers, Text, Logicals and Errors boxes narrow Constants or Formulas to one kind of value',
  'edit-links': 'Edit Links (Alt A K) lists every other workbook the file reads; when no cell reads one, Excel says the workbook has no links',
  'rollup-flag': 'a roll-up flag: COUNTIF counts the checks that are not zero and IF turns the count into OK or CHECK, so one cell says whether the book ties',
  // Chapter 4 · 4.1 Lookups (the diligence pack)
  'vlookup': 'VLOOKUP(key, table, column, FALSE) finds the key in the table’s first column and returns the column you count to; FALSE means exact match',
  'hlookup': 'HLOOKUP(key, table, row, FALSE) does the same across: it finds the key in the table’s top row and returns the row you count down to',
  'lookup-failures': 'a VLOOKUP fails three ways: with no FALSE it returns a near key from an unsorted list, an inserted column moves the column it counts, and a key outside the first column reads #N/A',
  'match-function': 'MATCH(key, range, 0) returns the position of the key in a one-column or one-row range; 0 means exact',
  'index-function': 'INDEX(range, n) returns the nth cell of a range, and INDEX(block, row, column) the cell where a row and a column cross',
  'index-match': 'INDEX/MATCH: MATCH finds the row and INDEX returns that row of the column you point at, so the key can sit in any column and an inserted column breaks nothing',
  'two-way-lookup': 'a two-way lookup: INDEX on a block with one MATCH down the side and one across the top, so one cell answers any pair',
  'xlookup': 'XLOOKUP(key, lookup range, return range, if not found) is exact by default, looks in any direction, and takes a message for a miss',
  'approximate-match': 'approximate match on a list sorted ascending (VLOOKUP with TRUE, MATCH with 1) returns the largest key at or below the value: the band it falls in',
  'multi-criteria-lookup': 'a lookup on two conditions: a key column that joins them with &, SUMIFS when the answer is a number and the pair is unique, or MATCH(1, (range=x)*(range=y), 0) with no helper column',
  'offset-indirect': 'OFFSET(start, rows, columns) returns the cell a set distance away and INDIRECT(text) turns a string into a reference; both are volatile and neither shows the trace arrows what it reads',
  'index-slice': 'INDEX(block, 0, n) returns the block’s whole nth column, so SUM(INDEX(block, 0, n)) adds one column with no OFFSET',
  // Chapter 4, lists and tables (4.2) and summaries from raw rows (4.3)
  'sort-dialog': 'the Sort dialog (Alt A S S): sort a list by more than one column at once, each level with its own order, on a working copy so the export stays as it came',
  'autofilter': 'AutoFilter (Ctrl+Shift+L): arrows on the header row; Alt+Down opens a column\'s list to show only the rows you tick, and Alt A C clears every filter',
  'subtotal-visible': 'SUBTOTAL with 109 (sum) or 103 (count) adds only the rows a filter shows, where SUM keeps adding the hidden ones too',
  'remove-duplicates': 'Remove Duplicates (Alt A M) on a pasted copy of a column leaves one of each value, which turns a long column into the list of its distinct entries',
  'data-validation': 'Data Validation (Alt A V V): a cell takes only what its rule allows, either a dropdown of a list\'s cells or a whole number between limits, with an error message for the rest',
  'visible-cells': 'Select Visible Cells (Alt+;): a copy of a block with hidden rows takes only the rows you can see',
  'wildcards': 'wildcards in a criteria: * stands for any run of characters and ? for exactly one, so "AUS-*" matches every Austin site code',
  'skip-blanks': 'Paste Special with Skip blanks (Ctrl+Alt+V, B): the blank cells of the copy leave what is under them alone, so a partial column of corrections lands only where it has a figure',
  'dynamic-arrays': 'dynamic arrays: UNIQUE, SORT, FILTER and SEQUENCE write one formula that spills its answer down as many cells as it needs',
  'sumifs-cube': 'a SUMIFS cube: one formula with mixed references ($B15 and C$14) fills a grid of sites by weeks straight from the raw rows',
  'kpi-ratios': 'KPI ratios built from the cube: each one a figure divided by the base it is measured against, with the total row worked from totals, not an average of the rows',
  'date-window': 'a date window in a criteria: ">="&C48 and "<="&C49 join the operator to the date cell, so moving a date moves every figure',
  'kpi-page': 'a KPI page a buyer reads: the title linked to Inputs, a source line, and a checks block whose ties and flag say the page agrees with the export rows',
  'question-loop': 'the question loop: read the buyer’s question, decide the cut, build it from the blocks already on the page, and answer on the log with a link and the status set',
  'three-d-reference': 'a 3D reference such as =SUM(Domain:CedarPark!C5) adds the same cell across every tab from the first named to the last',
  'group-sheets': 'grouped sheets (Ctrl+Shift+PgDn from the first tab): what you type on one lands on every tab in the group, until you click a tab outside it',
  // Chapter 4 · 4.4 Pivot tables and 4.5 Scenarios and sensitivity (the diligence pack)
  'pivot-table': 'Insert › PivotTable (Alt, N, V, T) summarizes a flat table on a new sheet; in its field list a field goes to Rows (R), Columns (C) or Values (V), and Enter closes the list',
  'pivot-value-settings': 'a pivot’s value field sums, counts or averages (S in the field list cycles them), and the pivot’s shortcut menu (Shift+F10) shows the figures as a % of Column Total or opens the field list again',
  'pivot-refresh': 'a pivot holds a copy of its source and shows it until you refresh: Alt+F5 for the pivot under the cursor, Ctrl+Alt+F5 for every pivot in the workbook',
  'getpivotdata': 'GETPIVOTDATA(data_field, pivot, field, item) reads one figure from a pivot by its labels, so the reference still finds it after a rearrangement',
  'case-switch': 'a case switch: one cell says which column of inputs is live, and CHOOSE(switch, a, b, c) or INDEX(range, switch) reads that column',
  'data-table-one-way': 'a one-way Data Table (Alt, A, W, T) runs one formula for a row of input values at once: values across the top, the formula at the left, the row input cell pointed at the input',
  'data-table-two-way': 'a two-way Data Table moves two inputs: values across and down, the output in the corner, a row input cell and a column input cell',
  'calc-except-tables': 'Automatic except for Data Tables (Alt, M, X, E) keeps a big model fast; F9 recalculates the tables, and Alt, M, X, A puts calculation back to Automatic',
  'goal-seek': 'Goal Seek (Alt, A, W, G) sets one cell to a value by changing one input, and writes its answer over that input',
  'pass-through-driver': 'a pass-through driver: a blank cell on the table’s sheet and =IF(driver="",input,driver) beside it, so a Data Table can move an input that lives on another sheet',
  'sticky-if': 'a sticky IF reads the live figure when its case is on and otherwise reads its own cell, so it holds its last value; it needs iterative calculation and a label that says so',
  // Chapter 4 · 4.6 Names and structure (the diligence pack)
  'names-sparingly': 'name the cells other sheets read and a reviewer hunts for (the case switch, the key inputs) and nothing else; a formula that reads Case reads like English',
  'name-manager': 'the Name Manager (Ctrl+F3) lists every name with its value, its reference and its scope; Edit renames or re-points one and the formulas follow, Delete removes a stray',
  'paste-list': 'Paste Name (F3) › Paste List writes every name and what it refers to from the active cell down, so the reviewer can read them on a sheet',
  'name-driven-list': 'a drop-down whose Source is a name (=Cases) reads the named list wherever it sits, so the list can move and the picker keeps working',
  // Chapter 5 · 5.1 The three statements (the One site and One week pages)
  'income-statement': 'the income statement runs from revenue through cost of sales, site costs, EBITDA, depreciation, interest and tax to net income, what a period earned',
  'accrual-gaps': 'profit and cash part by timing: cash paid ahead is deferred revenue, a cost not yet paid is a payable, revenue not yet collected is a receivable',
  'cash-flow-statement': 'the cash flow statement walks from net income to the change in cash in three parts: operations, investing, financing',
  'balance-sheet': 'the balance sheet is what the business owns, owes and leaves for its owners on one date; assets equal liabilities plus equity',
  'statement-links': 'five links join the statements: net income, depreciation, capex, debt and closing cash',
  'three-statement-events': 'every event lands in at least two statements, and the balance check says whether each one was placed right',
  'buyer-ratios': 'the ratios a buyer reads first: EBITDA margin, cash conversion, leverage and interest cover',
  // Chapter 5 · 5.2 Model setup
  'model-architecture': 'a model reads in the order it calculates: Cover, Inputs, statements, schedules, Checks, DCF; typed numbers live on Inputs only',
  'timeline-flags': 'a model timeline: year ends by EOMONTH from one typed date, an A/E row, a projection flag that reads the last historical year, and period counters',
  'columns-counter': '=COLUMNS($C4:C4) counts the columns from the anchor to here, so it reads 1, 2, 3 across with no typed offset',
  'block-fill': 'a block filled in one motion: the first column written with its anchors, the whole block selected, Ctrl+R',
  'checks-sheet': 'a Checks sheet built before the model: one row per check, each a ROUND of a live difference, empty and marked pending until its schedule exists',
  'populate-by-name': 'historicals read from a data tab by name: INDEX on the data, MATCH on the label down and on the year across, SUMIFS where a label repeats',
  'drivers-block': 'a drivers block: each case typed by year in its own block, and one live block that reads the case the switch names with CHOOSE',
  // Chapter 5 · 5.3 Schedules and 5.4 Linking the statements (the operating model)
  'corkscrew': 'a corkscrew rolls a balance: opening, plus what comes in, less what goes out, is the closing, and the closing is next year’s opening',
  'driver-build': 'a driver-based build multiplies inputs a buyer can question (sites × washes a day × days × ticket) instead of growing last year by a typed rate',
  'cost-behaviour': 'each cost is built the way it behaves: per wash as a share of revenue, per site as a cost per site × average sites, fixed as a base that grows plus a step',
  'working-capital-days': 'a working-capital balance is its driver ÷ 365 × its days, and the change in it is cash: a rise in an asset uses cash, a rise in a liability brings it in',
  'depreciation-waterfall': 'a depreciation waterfall puts each year’s capex on its own row and depreciates it across from the year after, so total depreciation is a SUM down a column',
  'circularity-breaker': 'interest on the average balance makes a circle that iterative calculation settles; a breaker cell (Circ: 1 on the average, 0 on the opening) switches it off when it breaks',
  'tax-losses': 'tax is MAX(EBT,0) × the rate, and a loss is carried forward as a balance that later profit uses up before tax is paid',
  'schedule-links': 'each projected statement line links to the last line of its schedule, and one formula a row carries the actuals through the projection flag',
  'indirect-cash-flow': 'the indirect cash flow starts from net income, adds back depreciation, takes the working-capital changes with their signs, then capex and the financing lines',
  'cash-not-a-plug': 'balance sheet cash is the cash flow’s closing cash, built from every other line, so a sheet that balances proves the links and nothing is forced',
  'cash-sweep': 'the revolver draws MAX(minimum cash − cash before the revolver, 0) and repays MIN(MAX(surplus, 0), its balance): MIN and MAX, never an IF tower',
  'balance-order': 'when the balance sheet is off, read the size of the difference first, then check in order: cash, working-capital signs, depreciation, capex, debt, net income to equity, openings',
  'select-precedents': 'Ctrl+[ jumps to the cells a formula reads, on another sheet too, so a link can be followed back to its source',
  // Chapter 5 · 5.5 Auditing a model and 5.6 DCF (the operating model)
  'tie-out': 'a tie-out is a live difference between one figure in two places, wrapped in ROUND so it reads exactly 0 while they agree',
  'cross-foot': 'a cross-foot adds a block both ways, every line across every year and the total row across the years, and checks the two sums agree',
  'limit-check': 'a limit check counts what should never happen, COUNTIF(range,"<0") on the closing balances, and reads 0 while none does',
  'error-count': 'SUMPRODUCT(--ISERROR(block)) counts the error cells on a sheet, so one check knows about a #REF! three sheets away',
  'error-checking': 'Error Checking (Alt, M, K) walks the error cells of the active sheet one by one; it works on one sheet at a time',
  'watch-window': 'the Watch Window (Alt, M, W) keeps chosen cells in view with their values and formulas whatever sheet you are on; Add Watch is Alt+A',
  'row-differences': 'Go To Special, Row differences (Alt, H, F, D, S, W) selects every cell of the selected row whose formula is not the active cell\'s, filled across',
  'hardcode-count': 'SUMPRODUCT(ISNUMBER(block)*(1-ISFORMULA(block))) counts the typed numbers in a projected block, which should hold none',
  'stress-test': 'a stress test types an input to an extreme (zero, a hundred, a loss), reads what breaks, fixes the formula that should have held, and puts the input back',
  'dcf': 'a discounted cash flow values a business as the cash it will generate, discounted to today, plus what it is worth after the forecast ends',
  'unlevered-fcf': 'unlevered free cash flow is EBIT less tax on EBIT, plus depreciation, less capex and the cash tied up in working capital: the cash before anyone is paid',
  'wacc': 'WACC blends the cost of equity (risk-free plus beta times the premium, plus a size premium) with the after-tax cost of debt, by the target weights',
  'terminal-value': 'a terminal value stands for the years after the forecast: the normalized last cash flow grown forever over WACC less growth, or the last EBITDA times an exit multiple',
  'mid-year-discounting': 'a discount factor is 1/(1+WACC)^t; the mid-year convention counts t from the middle of each year (0.5, 1.5 and on) because cash arrives through the year',
  'enterprise-to-equity': 'enterprise value is the discounted cash flows plus the discounted terminal value; take off net debt and what is left is equity value',
  'sensitivity-grid': 'a sensitivity grid is one formula with mixed anchors ($C69 and D$68) written over a block, so each cell values the business at its own row and column inputs',
};

/**
 * How many goals a lesson of this kind may carry. Module lessons (C2, framework v2) run denser:
 * one job of 5-8 goals; challenges 4-7; projects 10-15. The legacy bounds hold for the old
 * lessons until the rewrite deletes them. A lesson's closer (goal.closer, the "does it tie"
 * beat the platform plays at the end) is not counted: countedGoals() leaves it out.
 */
export function goalBounds(kind, moduleLesson = false) {
  if (moduleLesson) {
    return { lesson: { min: 5, max: 9 }, challenge: { min: 4, max: 7 }, project: { min: 10, max: 15 }, assessment: { min: 8, max: 16 }, testout: { min: 8, max: 16 } }[kind || 'lesson'] || { min: 5, max: 9 };
  }
  return kind && kind !== 'lesson' ? { min: 3, max: 10 } : { min: 3, max: 6 };
}

/** The goals that count towards the band: every goal but the closer. */
export const countedGoals = goals => (Array.isArray(goals) ? goals : []).filter(g => !(g && g.closer));

/** Sentences in a text: terminators followed by a space or the end. Decimals (5.0%, 1,200.00) and Excel error codes (#NAME?, #DIV/0!) are not terminators. */
export function sentenceCount(text) {
  const t = String(text).replace(/#(?:NULL!|DIV\/0!|VALUE!|REF!|NAME\?|NUM!|N\/A)/gi, 'ERR');
  return (t.match(/[.!?](?=\s|$)/g) || []).length;
}
export function wordCount(text) { return String(text).trim().split(/\s+/).filter(Boolean).length; }

/** Validate a lesson object. Returns a list of problems (empty when valid); never throws. */
export function validateLesson(l) {
  const errs = [];
  const need = (cond, msg) => { if (!cond) errs.push(msg); };
  if (!l || typeof l !== 'object') return ['lesson must be an object'];
  need(typeof l.id === 'string' && /^[a-z0-9-]+$/.test(l.id), 'id must be kebab-case');
  need(typeof l.chapter === 'string' && l.chapter, 'chapter missing');
  need(typeof l.section === 'string' && l.section.trim(), 'section missing (the chapter section this lesson belongs to)');
  need(typeof l.title === 'string' && l.title.trim(), 'title missing');
  need(DIFFICULTIES.includes(l.difficulty), 'difficulty must be easy | medium | hard');
  need(Array.isArray(l.tags), 'tags must be an array');
  need(ACCESS.includes(l.access), 'access must be free | paid');
  const kind = l.kind === undefined ? 'lesson' : l.kind;
  const moduleLesson = typeof l.module === 'string' && l.module.length > 0;   // C2 framework v2
  need(KINDS.includes(kind), 'kind must be lesson | project | assessment | testout | challenge');
  if (kind === 'assessment' || kind === 'testout') need(typeof l.timeLimit === 'number' && l.timeLimit > 0, kind + ' needs a timeLimit (seconds)');
  else if (kind === 'challenge') need(typeof l.timeLimit === 'number' && l.timeLimit >= 150 && l.timeLimit <= 180, 'a challenge needs a timeLimit of 150-180 seconds');
  else need(l.timeLimit === undefined, 'only an assessment, test-out or challenge carries a timeLimit');
  // v2 renames concepts → teaches; the alias holds through the migration. A project, assessment,
  // test-out or challenge combines taught material: it may teach nothing new.
  const conceptsRaw = l.teaches !== undefined ? l.teaches : l.concepts;
  need(kind === 'lesson'
    ? Array.isArray(conceptsRaw) && conceptsRaw.length > 0
    : conceptsRaw === undefined || Array.isArray(conceptsRaw), 'teaches/concepts must list what the lesson teaches');
  const concepts = Array.isArray(conceptsRaw) ? conceptsRaw : [];
  for (const c of concepts) need(CONCEPTS[c], `unknown concept "${c}"`);
  if (l.uses !== undefined) { need(Array.isArray(l.uses), 'uses must be an array of concept ids'); for (const c of Array.isArray(l.uses) ? l.uses : []) need(CONCEPTS[c], `unknown concept in uses: "${c}"`); }
  need(Array.isArray(l.prerequisites) || moduleLesson, 'prerequisites must be an array');
  if (moduleLesson) {
    need(WORKBOOKS[l.workbook], `unknown workbook "${l.workbook}" (content/workbooks)`);
    need(isObject(l.state) && typeof l.state.before === 'string', 'a module lesson needs state.before');
    need(SEEDED_KINDS.includes(kind) || typeof l.state.after === 'string', 'a module lesson needs state.after (a seeded kind is graded by its goals)');
    if (l.plant !== undefined) need(isObject(l.plant) && Object.keys(l.plant).every(k => k === '#names' || /^[A-Za-z0-9 &]+!(#?[A-Za-z]+[0-9]*)$/.test(k)), 'plant is a state patch: { "Sheet!A1": cell | null, "Sheet!#colW": {…}, "#names": {…} }');
    if (kind !== 'challenge') {
      need(typeof l.headline === 'string' && l.headline.trim(), 'headline (the one concept the lesson exists to teach) missing');
      need(Array.isArray(l.conventions) && l.conventions.length > 0 && l.conventions.every(id => CONVENTIONS[id]), 'every module lesson carries at least one canon convention id');
    } else if (l.conventions !== undefined) {
      need(Array.isArray(l.conventions) && l.conventions.every(id => CONVENTIONS[id]), 'challenge conventions must be canon ids');
    }
    need(typeof l.minutes === 'number' && l.minutes > 0 && l.minutes <= 15, 'minutes (5-7 for lessons, 2-3 for challenges) missing');
  }
  if (kind === 'challenge') {
    need(typeof l.seed === 'function', 'a challenge is a generator: seed(rng) → patch');
    need(Array.isArray(l.graders) && l.graders.length > 0 && l.graders.every(g => typeof g === 'function'), 'a challenge carries graders: [(session) => {ok, why}]');
    need(isObject(l.pars) && l.pars.pass > l.pars.pro && l.pars.pro > l.pars.legendary && l.pars.legendary > 0, 'challenge pars must fall strictly: pass > pro > legendary > 0');
  }
  // A module's assessment and test-out are seeded like a challenge (fresh clothing every run) and
  // may carry pars for the efficiency tier; the project, assessment and test-out combine taught
  // material, so no goal teaches (C2 Run 4).
  if (moduleLesson && (kind === 'assessment' || kind === 'testout')) need(typeof l.seed === 'function', kind + ' is seeded: seed(rng) → patch');
  if (kind !== 'challenge' && l.seed !== undefined) need(typeof l.seed === 'function' && (kind === 'assessment' || kind === 'testout'), 'only a challenge, assessment or test-out carries a seed');
  if (kind !== 'challenge' && l.pars !== undefined) need(isObject(l.pars) && (kind === 'assessment' || kind === 'testout') && l.pars.pass > l.pars.pro && l.pars.pro > l.pars.legendary && l.pars.legendary > 0, 'pars (pass > pro > legendary > 0) belong to a challenge, assessment or test-out');
  if (kind !== 'lesson') for (const g of Array.isArray(l.goals) ? l.goals : []) need(g && g.teach === undefined, `a ${kind} goal carries no teach line`);
  need(isObject(l.sheet) || moduleLesson, 'sheet (starting sheet) missing');
  need(l.sheets === undefined || (Array.isArray(l.sheets) && l.sheets.every(isObject)), 'sheets must be an array of { name, cells } records');
  for (const sh of Array.isArray(l.sheets) ? l.sheets.filter(isObject) : []) need(typeof sh.name === 'string' && /^[^[\]:*?/\\]{1,31}$/.test(sh.name), `sheet name "${sh.name}" is not Excel-legal`);
  if (moduleLesson) {
    // The Brief (v2, limits raised by M28): the situation, the task, the payoff, at most five
    // sentences and 110 words, ending in the headline keycap; a challenge carries one line.
    need(typeof l.brief === 'string' && l.brief.trim(), 'brief missing');
    if (typeof l.brief === 'string') {
      const n = sentenceCount(l.brief);
      if (kind === 'challenge') need(n <= 2 && wordCount(l.brief) <= 60, 'a challenge brief is two sentences at most, 60 words');   // the script's challenge briefs run to two sentences
      else {
        need(n >= 1 && n <= 5, `brief must be at most five sentences (it has ${n})`);
        need(wordCount(l.brief) <= 110, 'brief is over 110 words');
        need(/`[^`]+`[.!]?\s*$/.test(l.brief.trim()), 'the brief ends with the headline keycap (`Ctrl+…`)');
      }
    }
  } else {
    // The Read phase (legacy): two or three sentences, total.
    need(typeof l.read === 'string' && l.read.trim(), 'read missing (two or three sentences)');
    if (typeof l.read === 'string') { const n = sentenceCount(l.read); need(n >= 2 && n <= 3, `read must be two or three sentences (it has ${n})`); need(wordCount(l.read) <= 80, 'read is over 80 words'); }
  }
  if (kind === 'challenge') need(l.par === undefined, 'a challenge carries pars, not par');
  else if (!moduleLesson) need(typeof l.par === 'number' && l.par > 0, 'par (timed-mode seconds) missing');
  need(Array.isArray(l.goals) && l.goals.length > 0, 'goals missing');
  const goals = Array.isArray(l.goals) ? l.goals.filter(isObject) : [];
  const ids = new Set();
  const introduced = new Set();   // lesson concepts a goal has introduced so far
  for (const g of goals) {
    need(typeof g.id === 'string' && g.id, 'goal id missing'); need(!ids.has(g.id), `duplicate goal id ${g.id}`); ids.add(g.id);
    need(typeof g.text === 'string' && g.text.trim(), `goal ${g.id}: text missing`);
    if (typeof g.text === 'string') {
      // one action sentence; the closer may open with its question ("Does it tie? Watch …")
      const n = sentenceCount(g.text);
      need((g.closer ? n >= 1 && n <= 2 : n === 1) && /[.!?]$/.test(g.text.trim()), `goal ${g.id}: the action must be one sentence ending in a full stop`);
      need(g.text.trim().length <= 140, `goal ${g.id}: the action is over 140 characters (M28)`);
    }
    need(typeof g.check === 'function', `goal ${g.id}: check must be a function`);
    need(Array.isArray(g.requires) || kind === 'challenge', `goal ${g.id}: requires must list concept ids`);
    for (const c of Array.isArray(g.requires) ? g.requires : []) need(CONCEPTS[c], `goal ${g.id}: unknown concept "${c}"`);
    if (g.convention !== undefined) need(CONVENTIONS[g.convention], `goal ${g.id}: unknown convention "${g.convention}"`);
    if (g.closer !== undefined) {
      // The "does it tie" closer (C2 addendum): the last goal, played by the platform as a ghost —
      // it perturbs an input, the learner watches the sheet answer, the sheet goes back as it was.
      need(g.closer === true && moduleLesson && kind !== 'challenge', `goal ${g.id}: closer is only a module lesson's (or project's, assessment's, test-out's) last goal`);
      need(goals[goals.length - 1] === g, `goal ${g.id}: the closer must be the last goal`);
      need(isObject(g.demo), `goal ${g.id}: a closer is a demo the platform plays (demo: { script })`);
    }
    if (g.demo !== undefined) {
      need(isObject(g.demo) && typeof g.demo.script === 'string' && g.demo.script.trim(), `goal ${g.id}: demo needs a script`);
      need(g.demo === undefined || g.keys === undefined, `goal ${g.id}: a demo goal has no keys (the platform presses them)`);
      need(!isObject(g.demo) || g.demo.cadence === undefined || (typeof g.demo.cadence === 'number' && g.demo.cadence >= 40 && g.demo.cadence <= 1000), `goal ${g.id}: demo cadence is milliseconds per key, 40-1000`);
    } else need(typeof g.keys === 'string' && g.keys.trim(), `goal ${g.id}: keys (the route as keycaps) missing`);
    // alt: another route Excel offers for the same goal, shown under the keys as "Also works" (Wolf, 2026-10-02)
    if (g.alt !== undefined) need(isAltKeys(g.alt) && g.keys !== undefined, `goal ${g.id}: alt is another route as keycaps (a string or a list of strings), on a goal with keys`);
    // The goal that first uses a concept this lesson teaches carries a teach line; any goal may carry
    // one (M28: the why rides inside the teach line, up to three sentences).
    const fresh = (Array.isArray(g.requires) ? g.requires : []).filter(c => concepts.includes(c) && !introduced.has(c));
    if (fresh.length) { need(typeof g.teach === 'string' && g.teach.trim(), `goal ${g.id}: introduces ${fresh.join(', ')} and needs a teach line`); fresh.forEach(c => introduced.add(c)); }
    if (typeof g.teach === 'string') { const tn = sentenceCount(g.teach); need(tn >= 1 && tn <= 3 && /[.!?]$/.test(g.teach.trim()), `goal ${g.id}: teach is one to three sentences ending in a full stop`); }
  }
  need(l.race === undefined || (Array.isArray(l.race) && l.race.length >= 1 && l.race.every(r => isObject(r) && typeof r.label === 'string' && ids.has(r.slow) && ids.has(r.fast))), 'race must be pairs { label, slow, fast } naming goals');
  need(l.closing === undefined || (Array.isArray(l.closing) && l.closing.every(t => typeof t === 'string')), 'closing must be an array of paragraphs');
  need(l.endState === undefined || Array.isArray(l.endState), 'endState must be an array');
  const ends = Array.isArray(l.endState) ? l.endState.filter(isObject) : [];
  for (const e of ends) { need(typeof e.text === 'string', 'endState entries need text'); need(typeof e.check === 'function', 'endState entries need a check'); }
  need(typeof l.solution === 'string' && l.solution.trim(), 'solution keystrokes missing');
  if (isObject(l.sheet) || moduleLesson) validateStartingSheet(l, goals, ends, need, { moduleLesson, kind });
  return errs;
}

/**
 * Build the starting sheet and run every check against it: a cell key that does not parse, an
 * active cell outside rows×cols, a sheet that does not build, a check that throws, and a first goal
 * the starting sheet already satisfies (nothing for the learner to do) are all reported. Later goals
 * may legitimately hold at the start — they are gated behind the earlier ones.
 */
function validateStartingSheet(l, goals, ends, need, opts = {}) {
  const build = sp => new Sheet({ rows: sp.rows, cols: sp.cols, cells: sp.cells, colW: sp.colW, active: sp.active, rowH: sp.rowH, hiddenRows: sp.hiddenRows, hiddenCols: sp.hiddenCols, freeze: sp.freeze, gridlines: sp.gridlines, groups: sp.groups });
  let sheet, session;
  if (opts.moduleLesson) {
    // a module lesson starts from the previous lesson's `after` (the named workbook state);
    // a challenge additionally wears the seed's clothing before the first key
    let state;
    try { state = workbookState(l.workbook, l.state.before); } catch (e) { need(false, e.message); return; }
    if (SEEDED_KINDS.includes(opts.kind) && typeof l.seed === 'function') {
      let patch;
      try { patch = l.seed(mulberry32(1)); } catch (e) { need(false, `seed throws: ${e.message}`); return; }
      need(isObject(patch), 'seed must return a patch object');
      for (const key in patch || {}) { const shName = key.includes('!') ? key.split('!')[0] : state.sheets[0].name; need(state.sheets.some(x => x.name === shName), `seed patches unknown sheet in "${key}"`); }
      applyStatePatch(state, patch || {});
    }
    if (isObject(l.plant)) applyStatePatch(state, JSON.parse(JSON.stringify(l.plant)));   // the planting lands before the first key, as the runner lays it
    try {
      session = new Session(build(state.sheets[0]), {}); session.demoDone = new Set();
      session.sheets[0].name = state.sheets[0].name;
      for (const sh of state.sheets.slice(1)) session.addSheet(sh.name, build(sh));
      sheet = session.sheet;
    } catch (e) { need(false, `module state does not build: ${e.message}`); return; }
  } else {
    const spec = l.sheet;
    const cells = isObject(spec.cells) ? spec.cells : {};
    need(spec.cells === undefined || isObject(spec.cells), 'sheet: cells must be an object of cell records');
    for (const k in cells) { need(parseRef(k), `sheet: bad cell key "${k}"`); need(isObject(cells[k]), `sheet: cell ${k} must be a record such as { value }`); }
    const rows = spec.rows || 100, cols = spec.cols || 26;   // the Sheet defaults
    if (spec.active !== undefined) {
      const a = spec.active;
      need(isObject(a) && Number.isInteger(a.r) && Number.isInteger(a.c) && a.r >= 1 && a.r <= rows && a.c >= 1 && a.c <= cols, `sheet: active ${JSON.stringify(a)} is outside the ${rows}×${cols} grid`);
    }
    try {
      sheet = build({ ...spec, cells });
      session = new Session(sheet, {}); session.demoDone = new Set();
      // the workbook, exactly as LessonRun.reset assembles it, so cross-sheet checks probe correctly
      const sheets = Array.isArray(l.sheets) ? l.sheets : [];
      if (sheets.length) {
        if (sheets[0] && sheets[0].name) session.sheets[0].name = sheets[0].name;
        for (const sh of sheets.slice(1)) session.addSheet(sh.name, build(sh));
      }
    }   // as the runner sets it up
    catch (e) { need(false, `sheet does not build: ${e.message}`); return; }
  }
  session.goalMark = 0;
  const probe = (label, check) => {
    if (typeof check !== 'function') return null;
    try { return !!check(sheet, session); } catch (e) { need(false, `${label}: check throws on the starting sheet (${e.message})`); return null; }
  };
  goals.forEach((g, i) => { const ok = probe(`goal ${g.id}`, g.check); if (i === 0) need(ok !== true, `goal ${g.id}: already satisfied by the starting sheet`); });
  for (const e of ends) probe(`endState "${e.text}"`, e.check);
}

const isObject = v => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Every concept available to a lesson: its own plus its prerequisites', transitively. */
export function availableConcepts(lesson, byId, seen = new Set()) {
  const out = new Set(lesson.teaches || lesson.concepts || []);
  for (const pid of lesson.prerequisites || []) {
    if (seen.has(pid)) continue; seen.add(pid);
    const p = byId[pid]; if (!p) continue;
    for (const c of availableConcepts(p, byId, seen)) out.add(c);
  }
  return out;
}

/**
 * Validate a drill (SITE_SPEC §5): a timed exercise of 1-20 checkpoints (screenplay 6.1: eight to twenty) with explicit pars and an
 * optimal keystroke count. Unlike a lesson it teaches nothing — no read, no teach lines, no
 * concept bookkeeping — so a checkpoint carries only { id, text, keys, check }. Returns a list of
 * problems (empty when valid); never throws.
 */
export function validateDrill(d) {
  const errs = [];
  const need = (cond, msg) => { if (!cond) errs.push(msg); };
  if (!d || typeof d !== 'object') return ['drill must be an object'];
  need(typeof d.id === 'string' && /^[a-z0-9-]+$/.test(d.id), 'id must be kebab-case');
  need(typeof d.chapter === 'string' && d.chapter, 'chapter missing');
  need(typeof d.title === 'string' && d.title.trim(), 'title missing');
  need(typeof d.task === 'string' && d.task.trim() && sentenceCount(d.task) === 1, 'task must be one sentence');
  need(ACCESS.includes(d.access), 'access must be free | paid');
  need(d.benchmark === undefined || typeof d.benchmark === 'boolean', 'benchmark must be true or false');
  need(d.seed === undefined || typeof d.seed === 'function', 'seed must be a function (rng) => cells patch');
  need(isObject(d.sheet), 'sheet (starting sheet) missing');
  need(d.sheets === undefined || (Array.isArray(d.sheets) && d.sheets.every(isObject)), 'sheets must be an array of { name, cells } records');
  need(Number.isInteger(d.optimalKeys) && d.optimalKeys > 0, 'optimalKeys must be a positive integer');
  const p = d.pars;
  need(isObject(p) && ['pass', 'pro', 'legendary'].every(k => typeof p[k] === 'number' && Number.isFinite(p[k])), 'pars must give pass, pro and legendary in seconds');
  if (isObject(p)) need(p.pass > p.pro && p.pro > p.legendary && p.legendary > 0, 'pars must fall strictly: pass > pro > legendary > 0');
  need(Array.isArray(d.goals) && d.goals.length >= 1 && d.goals.length <= 20, 'goals: 1-20 checkpoints');
  const goals = Array.isArray(d.goals) ? d.goals.filter(isObject) : [];
  const ids = new Set();
  for (const g of goals) {
    need(typeof g.id === 'string' && g.id, 'goal id missing'); need(!ids.has(g.id), `duplicate goal id ${g.id}`); ids.add(g.id);
    need(typeof g.text === 'string' && g.text.trim(), `goal ${g.id}: text missing`);
    need(typeof g.keys === 'string' && g.keys.trim(), `goal ${g.id}: keys (the route as keycaps) missing`);
    need(typeof g.check === 'function', `goal ${g.id}: check must be a function`);
    need(g.teach === undefined && g.requires === undefined && g.demo === undefined, `goal ${g.id}: a drill checkpoint carries no teach, requires or demo`);
    need(g.alt === undefined || isAltKeys(g.alt), `goal ${g.id}: alt is another route as keycaps (a string or a list of strings)`);
  }
  need(d.endState === undefined || Array.isArray(d.endState), 'endState must be an array');
  const ends = Array.isArray(d.endState) ? d.endState.filter(isObject) : [];
  for (const e of ends) { need(typeof e.text === 'string', 'endState entries need text'); need(typeof e.check === 'function', 'endState entries need a check'); }
  need(typeof d.solution === 'string' && d.solution.trim(), 'solution keystrokes missing');
  if (isObject(d.sheet)) validateStartingSheet(d, goals, ends, need);
  return errs;
}
