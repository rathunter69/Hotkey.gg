# ENGINE GAP MATRIX — hotkey.gg against a full Excel course syllabus

_r457 · **read-only audit, no engine file was touched.** Companion to `dev/ENGINE_CHECKS_V4.md`,
which verified the nine CATALOG_V4 skill families; this widens the net to the **entire** syllabus a
normal Excel course covers._

Founder's direction, verbatim: _"we need to cover the entire breadth of excel functions that a normal
course would cover — including xlookup, concat, etc — so that's what I mean by a comprehensive audit
and rebuild of the drill portfolio."_

---

## 0 · Method (same as ENGINE_CHECKS_V4 §0)

Every row carries **two** kinds of evidence: a **source hit** (`index.html:line`) and, for functions
and chords, a **live probe** through the running engine — the worktree served on `127.0.0.1:8931`,
opened in Playwright past the landing (`dev/e2e-formulas.js`'s localStorage route:
`hotkey_onboarded` / `hk_tour_done` / `hk_learn_done` / `hk_gate_off`), Chromium pinned at
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Formulas were either handed to `evalFormula`
or **typed into a cell by keyboard** and read back off `dispText()`; chords were **pressed** and the
before/after of `mode` / `dialog` / `path` / the ribbon strip / `S` / the toast queue diffed.

Three distinct absent-signals turned up, and the matrix distinguishes them:

| signal | what it means | example |
|---|---|---|
| **`#NAME?` commits and displays** | the name parsed, `evalFormula`'s `default: throw fxErr('#NAME?')` (index.html:23698) fired — the function is simply not in the table | `=XLOOKUP(…)` typed into D5 → cell reads `#NAME?` |
| **parse throw, nothing commits** | the *syntax* is outside the grammar; the autocorrect ladder refuses the entry, the cell stays empty | `=Sheet2!A1`, `=Sales`, `=SUM(B:B)`, `=SUM({1,2,3})`, `=RANK.EQ(…)` |
| **no-op / tab-strip bounce** | the chord reached `applyRibbon`, matched no `np===` branch, and `path` reset to `[]` (index.html:27642) — no dialog, no toast, no state change | Alt A M · Alt A E · Alt H L · Alt W F F |

A fourth is louder than all three: **`ribbonNote = t.name + ' — no drills wired here yet'`**
(index.html:27470), the message the Insert (`N`), Page Layout (`P`) and Review (`R`) tabs print
because they are declared `live:false` (index.html:24595/24596/24599). Everything that lives on those
three tabs in real Excel — pivots, tables, charts, comments, protect sheet, print setup, hyperlinks —
is absent at the *tab* level, not the command level.

**Status.** `grades` = works today, verified live · `partial` = the item works but a named piece of it
is missing · `absent` = `#NAME?`, a parse throw, or a no-op · `refused-by-design` = the engine
deliberately does not do this and says so in its own comments.

**Effort.** **S** = one evaluator entry beside an identical neighbour, or one keydown branch (~1 h) ·
**M** = a new command with UI state — a dialog, a parser, a multi-cell write with undo (~half a day) ·
**L** = a new subsystem the engine has no capability for at all (multi-sheet, pivot, conditional
formatting, tables, data validation, dynamic-array spill, a scrolling viewport) — days.

Rows marked **[V4]** were verified in `dev/ENGINE_CHECKS_V4.md` and are **not** re-probed here; the
evidence column points at that document. Everything else was probed fresh for this matrix.

Probe scripts are scratch (not committed). Charts are **excluded by founder decision 2026-09-04** and
were not probed or sketched.

---

## 1 · The matrix

### 1.1 Navigate & select

| area | item | status | evidence | effort | notes |
|---|---|---|---|---|---|
| Navigate & select | arrows · Ctrl+arrow jumps | grades | `move()` index.html:27803 · live: cursor walks, rails clamp | — | the engine's oldest muscle |
| Navigate & select | Shift+arrow / Ctrl+Shift+arrow extend | grades | index.html:28942 region · `S.sel` anchor hygiene at 26426 (r426) | — | |
| Navigate & select | Ctrl+Home / Ctrl+End | grades | index.html:28981 / 28997 · `usedRange()` target | — | maze boards deliberately inert them (r423) |
| Navigate & select | Home (column A) / Shift+Home | grades | index.html:28981 | — | |
| Navigate & select | Ctrl+A → current region → used range | grades | index.html:29075 · `regionAround()` two-stage (r407) | — | |
| Navigate & select | Ctrl+Space / Shift+Space / Ctrl+Shift+8 | grades | index.html:29046 (`Ctrl+Shift+8` → `selectRegion`) | — | r452 added the number-row twin |
| Navigate & select | Tab / Enter, home-column return | grades | index.html:28960–28967 · `hkTabEnterHome()` | — | |
| Navigate & select | F5 / Ctrl+G Go To | grades | index.html:28837 / 29079 · live: `dialog` → `goto`, strip reads "go to → s Special…" | — | |
| Navigate & select | Ctrl+PgUp / PgDn worksheet walk | **refused-by-design** | index.html:28840 → `stepSheetTab()` 26420 · live: loads the **next drill in the chapter**, `cells` payload changes wholesale | L (see multi-sheet) | the sheet tabs at index.html:2412 are the **drill strip**, not worksheets — `renderSheetTabs()` 26310 paints `DRILL_GROUPS` keys. Real sheet-walking needs the multi-sheet subsystem |

### 1.2 Edit & structure

| area | item | status | evidence | effort | notes |
|---|---|---|---|---|---|
| Edit & structure | Ctrl+C / Ctrl+X / Ctrl+V | grades | index.html:29096–29099 · `copySel()` / `doPaste()` 27646 | — | cut marks `S.clipboard.cut` |
| Edit & structure | Ctrl+Z / Ctrl+Y undo–redo | grades | `pushUndo()` threaded through every mutating branch | — | |
| Edit & structure | paste special — kinds (All · Formulas · Values · Formats · Values&num · Col widths · Transpose) | grades | `PASTE_OPTS` index.html:24686 | — | **[V4]** E4 |
| Edit & structure | paste special — ops (None · Multiply · Add · Subtract · Divide) | grades | `PASTE_OP_OPTS` index.html:24682 · `doPaste` 27659 | — | **[V4]** all five driven live through Alt H V S |
| Edit & structure | Ctrl+Shift+V paste values | grades | index.html:29093 (r452 — native profile too) | — | |
| Edit & structure | insert / delete rows & columns (Alt H I R/C · H D R/C) | grades | `MENUS['HI']`/`['HD']` index.html:24606–24607 | — | |
| Edit & structure | hide / unhide rows (Ctrl+9 · Ctrl+Shift+9 · Alt H O U R/O) | grades | `hideRows()` 28047 / `unhideRows()` 28058 · live: Alt H O U R → toast "rows hidden", active cell stepped 3,1 → 4,1 | — | the drill teaches this as the sin; groups are the cure |
| Edit & structure | group / ungroup · hide & show detail | grades | `groupRows()` 27917 / `ungroupRows()` 27923 / `setDetail()` 27928 · Shift+Alt+→/← at 28898 · Alt A H/J at 27632–27633 | — | one outline level, rows only |
| Edit & structure | Ctrl+D / Ctrl+R fill | grades | index.html:29105–29106 · `fillFrom()` 26625 | — | ref translation honours `$` — see §1.4 |
| Edit & structure | fill series (Alt H F I S) | grades | `MENUS['HFI']` 24612 · `fillSeries()` 24005 · dialog at 27495 | — | |
| Edit & structure | flash fill (Ctrl+E) | grades | `flashFill()` index.html:23925 · handler 29083 · live: fired, toast "flash fill: put the cursor beside the data, example typed" | — | r297. Writes **values**, never formulas — Excel-true |
| Edit & structure | Alt+Enter in-cell line break | **absent** | no handler · live: in edit mode `editBuf` went `'=A1'` → `''`; outside edit mode Alt opens the ribbon tab strip | **S** | one branch in the edit-mode keydown block inserting `\n` into `editBuf`; `wrap` already renders multi-line (Alt H W) |
| Edit & structure | merge cells | **refused-by-design** | index.html:3544 — "never merge" is a stated canon rule; `FMT_OPTS` offers `A` = *center across selection* instead (24679) | — | Excel-canon-correct; keep refusing |

### 1.3 Format

| area | item | status | evidence | effort | notes |
|---|---|---|---|---|---|
| Format | bold / italic / underline / strike | grades | Ctrl+B/I/U index.html:29100–29102 · Ctrl+5 at 29107 · Alt H 1/2/3 | — | |
| Format | comma · currency · percent · general (Ctrl+Shift+! / $ / % / ~) | grades | index.html:29118–29124 | — | |
| Format | decimals ± (Alt H 9 / 0) | grades | `MENUS['H']` 24603 | — | |
| Format | Ctrl+1 Format Cells | **partial** | `FMT_OPTS` index.html:24677–24681 — 11 preset letters (General · 1,234 · $1,234 · 12.3% · 8.2x · Mar-26 · ÷000s · ÷millions · superscript · strike · center-across) · live: `dialog` → `fmt` | **M** for a code field | it is a preset picker, not Excel's four-tab dialog: no font tab, no border tab, no alignment tab, no format-code entry |
| Format | custom number-format codes (`#,##0;(#,##0)`) | **absent** | no format-string parser anywhere · live: typing `=TEXT(1234,"#,##0")` is **refused at commit** (nothing lands in the cell) | **M** | `fmtNum()` 23328 already renders every style the codes would name; the work is mapping code strings onto it. Shares the whole cost with `TEXT()` — build once, get both |
| Format | date display `Mmm-yy` (Ctrl+1 → D) | grades | `fmtNum` date branch index.html:23343 | — | **[V4]** M11 |
| Format | borders gallery (Alt H B — bottom/top/left/right/none/all/outside/thick/double/top&bottom) | grades | `MENUS['HB']` index.html:24609 · handler 27620–27630 | — | r298 fixed the access keys to Excel canon |
| Format | horizontal alignment (Alt H A L/C/R) | grades | `MENUS['HA']` 24610 | — | |
| Format | vertical alignment (top/middle/bottom) | **absent** | no `valign` field on the cell model, no CSS hook, zero grep hits | **S** | one cell flag + one CSS class; nothing else in the render path resists it |
| Format | indent ± (Alt H 5 / 6) | grades | `MENUS['H']` 24603 · `c.indent` in `copyFmt` 26639 | — | |
| Format | wrap text (Alt H W) | grades | `c.wrap` in `copyFmt` 26639 | — | |
| Format | column width (Alt H O W) · autofit (Alt H O I) | grades | 27634 / 27636 · `autofitCols()` 27644 · live: Alt H O opens "I Autofit width · A Autofit height · W Column width… · U Hide & Unhide · E Format cells…" | — | row height is a stub (`HOA` returns without acting, 27637) |
| Format | font color (Alt H F C) · fill color (Alt H H, Alt H F I) | grades | `FONT_SWATCHES` 24693 · `FILL_SWATCHES` | — | |
| Format | **conditional formatting** — highlight rules, data bars | **absent** | zero grep hits for `condfmt` / `databar` / `colorScale` / "conditional format" anywhere in 34,534 lines · Alt H L live: no-op, `path` bounced to `[]` | **L** | see §3 sketch |

### 1.4 Formulas & references

| area | item | status | evidence | effort | notes |
|---|---|---|---|---|---|
| Formulas & refs | relative / absolute / mixed refs | grades | `translateFormula()` index.html:26592 — `$` prefixes are honoured per axis on every fill and paste | — | |
| Formulas & refs | F4 anchor cycle | grades | `cycleAnchor()` 26958 · handler 28649 · live: `=A1` → **`=$A$1`** → **`=A$1`** | — | |
| Formulas & refs | point mode (arrow-built references) | grades | `editPointer` / `editPointerBase` in the edit block (28670 ff) · `td.point` CSS 474 | — | `S.pointLog` provenance latch exists |
| Formulas & refs | Alt+= AutoSum | grades | `autoSum()` 23821 · Alt handler 27465 · live: `editing` false → **true**, proposal in the editor | — | Alt H U S / Alt M U S are the ribbon twins |
| Formulas & refs | `&` concatenation · `^` power · postfix `%` | grades | `cat_()` 23717 · `pow_()` 23723 · `fac()` 23731 · live: `=2^10`→1024, `=50%`→0.5 | — | |
| Formulas & refs | operator precedence incl. comparators | grades | `cmp_()` 23709 (Excel's lowest precedence) | — | |
| Formulas & refs | **named ranges** (Ctrl+F3, `=Sales`) | **absent** | no `S.names`, no `defineName`, no Name Manager · live: Ctrl+F3 no-op; `=Sales` **throws `unexpected`** — refused at commit, nothing lands | **M** | a name table on `S`, a resolve step at the head of `facCore()` (23735), a Ctrl+F3 define/list dialog. No render change |
| Formulas & refs | **cross-sheet refs** (`Sheet2!A1`, `'Sheet 2'!A1`) | **absent** | `parseRef()` index.html:24049 matches `^([A-Z]+)(\d+)$` only — no sheet qualifier · live: both forms **throw** (`trailing` / `unexpected`) | **L** | blocked on multi-sheet |
| Formulas & refs | **multiple worksheets** (insert sheet, Shift+F11, sheet tabs) | **absent** | `S` has no sheet dimension — its keys are `ROWS active cells clipboard maze sel splits step tiers touch` and nothing else (probed live) · Shift+F11 live: **restarts the drill** (index.html:28748 `loadChallenge(cur)`), it does not insert a sheet | **L** | see §3 sketch |
| Formulas & refs | hide / unhide **sheets** | **absent** | no sheet dimension to hide | **L** | rides on multi-sheet |
| Formulas & refs | whole-column refs (`B:B`, `A:A`) | **absent** | `resolveRange()` 24050 requires row numbers · live: `=SUM(B:B)` **throws** | **S** | expand `A:A` → `A1:A<S.ROWS>` inside `resolveRange` |
| Formulas & refs | columns past Z (`AA1`, `AB7`) | **absent — and silently wrong** | `parseRef()` 24049 computes `m[1].charCodeAt(0)-64` — **only the first letter** · live: `=SUM(AA1:AA2)` returned **4**, the value of `A1:A2`, with no error | **S** | a real trap: a multi-letter ref aliases back onto A–Z and grades as if it were right. `gotoNextMark()` 28033 already has the correct base-26 loop — lift it into `parseRef` |
| Formulas & refs | array constants (`{1,2,3}`) | **absent** | no `{` branch in `facCore()` · live: throws | **S** | |
| Formulas & refs | Ctrl+Shift+Enter legacy arrays | **absent** | no handler; the commit path has no array-formula concept · live: no-op | **L** | rides on the dynamic-array subsystem |
| Formulas & refs | dotted function names (`RANK.EQ`, `STDEV.S`, `NORM.DIST`) | **absent** | the name regex at `facCore()` index.html:23735 is `/^([A-Za-z]+)\s*\(/` — a `.` ends the token · live: both **throw `unexpected`**, they never even reach `#NAME?` | **S** | one character in one regex (`[A-Za-z.]`), then alias the dotted names onto their legacy twins |

### 1.5 Lookups & conditional aggregates

| area | item | status | evidence | effort | notes |
|---|---|---|---|---|---|
| Lookups | `VLOOKUP` · `HLOOKUP` | grades | index.html:23631 · live `=VLOOKUP(2,A1:B4,2,0)`→**30**, `=HLOOKUP(10,B1:B2,1,0)`→**10** | — | **[V4]** M7 · exact + approx, miss commits `#N/A` |
| Lookups | `INDEX` · `MATCH` | grades | 23505 / 23502 · live →**20** / **3** | — | **[V4]** · INDEX returns text as text (r418) |
| Lookups | `XLOOKUP` | **absent** | live: `evalFormula` → `#NAME?`; **typed into D5 → cell displays `#NAME?`** | **S** | **[V4] flagged this and the founder named it explicitly.** The `VLOOKUP` branch already has the range walk, `eqLoose` key match and text-preserving return; XLOOKUP is that with two separate ranges plus `if_not_found` |
| Lookups | `XMATCH` | **absent** | live → `#NAME?` | **S** | `MATCH` 23502 with a match-mode argument |
| Lookups | `CHOOSE` | grades | 23550 · live `=CHOOSE(2,"a","b")`→**"b"** | — | |
| Lookups | `OFFSET` | **partial** | 23556 · live `=OFFSET(A1,1,1)`→**20** · but 23564: `if(h!==1 \|\| w!==1) throw new Error('OFFSET#range')` | **S** | single-cell form only — `OFFSET(A1,0,0,5,1)` as a dynamic range is refused |
| Lookups | `INDIRECT` | **absent** | live → `#NAME?` | **S** | build the ref string, hand it to `cellRaw`/`resolveRange` |
| Lookups | `LOOKUP` | **absent** | live → `#NAME?` | **S** | **[V4]** |
| Lookups | `ROW` · `COLUMN` · `ROWS` · `COLUMNS` | **absent** | live: all four → `#NAME?` | **S** | `ROW()`/`COLUMN()` need the evaluating cell's own address, which `evalFormula` is not currently told — pass it in, or restrict to the 1-arg form |
| Cond. aggregates | `SUMIF` · `SUMIFS` · `COUNTIF` | **partial** | 23516 / 23525 / 23545 · live: exact-match forms →**60 / 60 / 2** · but the criteria matcher is `eqLoose` (23452) — live `=SUMIF(A1:A4,">2",B1:B4)` → **0**, `=COUNTIF(C1:C4,"bet*")` → **0** | **S** | **the single most course-visible gap in this section.** No `">100"` / `"<>"` comparison criteria, no `*`/`?` wildcards. One `matchCrit(v, crit)` helper replaces `eqLoose` in all three (and in every -IFS added below) |
| Cond. aggregates | `COUNTIFS` · `AVERAGEIF` · `AVERAGEIFS` | **absent** | live: all three → `#NAME?` | **S** each | **[V4]** · the `SUMIFS` pair-walker at 23525 is the shape |
| Cond. aggregates | `MAXIFS` · `MINIFS` | **absent** | live: both → `#NAME?` | **S** each | same pair-walker, `Math.max`/`min` over the survivors |
| Cond. aggregates | `SUMPRODUCT` | grades | 23536 · live `=SUMPRODUCT(A1:A3,B1:B3)`→**110** | — | **[V4]** the weighted-average workhorse |
| Dynamic arrays | `FILTER` · `UNIQUE` · `SORT` · `SORTBY` · `SEQUENCE` · `TRANSPOSE` | **absent** | live: `UNIQUE`/`SORT`/`SORTBY`/`SEQUENCE`/`TRANSPOSE` → `#NAME?`; `FILTER` throws on its `=` comparison argument. Typed `=UNIQUE(A1:A3)` → cell displays **`#NAME?`** | **L** | see §3 sketch |
| Dynamic arrays | spill behaviour (`#` spill ranges, `#SPILL!`) | **absent** | the `.spill` CSS at index.html:179/483/625 is **label spill** — long *text* overflowing into empty neighbours (r107), an unrelated mechanic · a formula returns one scalar to one cell, full stop | **L** | same subsystem |

### 1.6 Text & dates

| area | item | status | evidence | effort | notes |
|---|---|---|---|---|---|
| Text | `LEFT` · `RIGHT` · `MID` · `LEN` | grades | 23607 / 23612 / 23602 · live →`abc` / `ef` / `bcd` / `4` | — | **[V4]** E10 |
| Text | `TRIM` · `PROPER` · `UPPER` · `LOWER` | grades | 23603–23606 · live →`Raw NAME` / `Raw Name` / `AB` / `ab` | — | **[V4]** |
| Text | `CONCAT` · `CONCATENATE` · `&` | grades | 23625 · `cat_()` 23717 · live: all three →`ab` | — | **[V4]** · the founder named `concat` explicitly and it is already live |
| Text | `FIND` | grades | 23617 · live →`3` · a miss throws `#VALUE!` | — | **[V4]** — the IFERROR lesson |
| Text | `SEARCH` | **absent** | live → `#NAME?` | **S** | **[V4]** · one line beside `FIND`, lower-cased haystack, `?`/`*` optional |
| Text | `SUBSTITUTE` · `REPLACE` · `VALUE` | **absent** | live: all three → `#NAME?` | **S** each | **[V4]** listed SUBSTITUTE and VALUE; REPLACE is new here. Plain string ops on `txtOf` (23497) |
| Text | `TEXTJOIN` | **absent** | live → `#NAME?`; **typed into D6 → cell displays `#NAME?`** | **S** | `CONCAT` 23625 plus a delimiter and an ignore-empty flag |
| Text | `REPT` | **absent** | live → `#NAME?` | **S** | |
| Text | `TEXT()` | **absent** | live → `#NAME?` from `evalFormula`; **typed with a real code string it is refused at commit** (the `#` in `"#,##0"` never lands) | **M** | **[V4]** · shares its whole cost with custom format codes above — one format-string parser onto `fmtNum()` 23328 serves both |
| Text | `TEXTSPLIT` · `TEXTBEFORE` / `TEXTAFTER` | **absent** | live: both → `#NAME?` | **S** each | modern-Excel text pack; optional for a course syllabus |
| Dates | `TODAY` · `DATE` · `YEAR` · `MONTH` · `DAY` | grades | 23542 / 23652 / 23654 · live →`46269` / `46082` / `2023` / `3` / `15` | — | **[V4]** M11 |
| Dates | `EDATE` · `EOMONTH` · `YEARFRAC` | grades | 23657 / 23663 · live →`45092` / `45016` / `0.99722` | — | **[V4]** · EDATE clamps end-of-month, YEARFRAC is 30/360 basis 0 |
| Dates | date-serial arithmetic (`=D1+30`) | grades | live →`45030` | — | **[V4]** · serials are plain numbers, so `+7` week headers fill |
| Dates | Ctrl+; stamp today | grades | index.html:29052 · live: value `46269`, `fmtStyle 'date'` | — | **[V4]** |
| Dates | `NOW()` | **absent** | live → `#NAME?` | **S** | the engine has no time-of-day format to render the fraction — ship it only alongside one |
| Dates | `WEEKDAY` · `DATEDIF` | **absent** | live: both → `#NAME?` | **S** each | **[V4]** · one line each off the existing serial↔Date conversion at 23654 |
| Dates | `NETWORKDAYS` · `WORKDAY` | **absent** | live: both → `#NAME?` | **S** each | a day loop over the serial with a weekend test; the optional holiday range is one more `rangeRefs` walk |
| Dates | `DAYS` | **absent** | live → `#NAME?` | **S** | trivially `b−a`; `=D2-D1` already works |
| Dates | Ctrl+Shift+; time stamp | **refused-by-design** | index.html:29049 states it: _"Ctrl+Shift+; (time) stays out: the engine has no time format to render it with"_ · live: no-op | S once a time format exists | pairs with `NOW()` — build both or neither |

### 1.7 Logic & error handling

| area | item | status | evidence | effort | notes |
|---|---|---|---|---|---|
| Logic | `IF` with lazy branches | grades | `facCore()` 23750 · live →`y` | — | **[V4]** M5 · the untaken branch never evaluates (Excel) |
| Logic | `AND` · `OR` · `NOT` | grades | 23649–23651 · live →`1` / `1` / `1` | — | **[V4]** |
| Logic | `IFERROR` at any depth | grades | 23470 (outermost) + 23756 (nested, lazy) · live `=IFERROR(1/0,0)`→**0** | — | **[V4]** |
| Logic | `MIN` / `MAX` as caps and floors | grades | 23695–23696 | — | **[V4]** — how the `ifs` drill teaches tiering today |
| Logic | `IFS` | **absent** | live → `#NAME?` | **S** | **[V4]** · `facCore()`'s lazy-argument splitter (23736) is already there; IFS is a loop over the same `parts` array |
| Logic | `SWITCH` | **absent** | live → `#NAME?` | **S** | same splitter, `eqLoose` on the first part |
| Logic | `IFNA` | **absent** | live → `#NAME?` | **S** | `IFERROR` 23756 narrowed to one sentinel |
| Logic | `TRUE()` · `FALSE()` · `NA()` | **absent** | live: all three → `#NAME?` | **S** | `NA()` is the honest-gap marker a modelling course teaches |
| Logic | `ISERROR` · `ISNUMBER` · `ISTEXT` · `ISBLANK` | **absent** | live: all → `#NAME?` (`ISERROR(1/0)` returns `#DIV/0!` — the argument's error propagates before the name is even read, because args are eager) | **S** each | these need the **lazy** argument path (23736), not the eager one, or the error swallows the call |
| Logic | error sentinels `#REF!` `#N/A` `#DIV/0!` `#VALUE!` `#NAME?` commit, display and propagate | grades | `FX_ERR_SET` 23460 · `fxErr()` 23462 · `isErrVal()` 23461 | — | **[V4]** · this is what makes every "absent" row above legible on the board |

### 1.8 Data tools

| area | item | status | evidence | effort | notes |
|---|---|---|---|---|---|
| Data tools | sort A→Z / Z→A, single key (Alt A S A / S D) | grades | handler 27496 · `sortRange()` 23869 | — | **[V4]** E8 · plus the `S.sortLog` provenance latch (27508) and the single-column decouple warning (`dialog='sortwarn'` 27517) |
| Data tools | **multi-key sort dialog (Alt A S S)** | **absent** | `MENUS['AS']` index.html:24618 = `[['A','Sort A→Z'],['D','Sort Z→A']]` — no `S` · live: the strip prints "Data S → A Sort A→Z · D Sort Z→A" and Alt A S S bounces `path` to `[]` | **M** | **[V4]** · a key-columns + directions dialog over the existing `sortRange` comparator |
| Data tools | filter — arm (Ctrl+Shift+L / Alt A T), Alt+↓ value picker, clear | grades | 29029 / 27631 · `openFilterPicker()` 27984 · `toggleFilter()` teardown 27958 · live: Alt A T toasted "put the cursor on a header cell first" (the guard firing correctly) | — | **[V4]** E9 — complete, including the `S.filterClears` latch |
| Data tools | **remove duplicates (Alt A M)** | **absent** | `MENUS['A']` 24617 = S/T/H/J only · live: no-op, tab-strip bounce | **M** | **[V4]** · menu entry + key-column dialog + a row-delete pass through the existing `pushUndo`/row machinery |
| Data tools | **text to columns (Alt A E)** | **absent** | `MENUS['A']` 24617 has no `E` · live: no-op | **M** | **[V4]** · menu entry + delimiter dialog + multi-cell write with undo |
| Data tools | **data validation — lists (Alt A V V)** | **absent** | zero grep hits for validation as a cell feature · live: no-op | **L** | see §3 sketch |
| Data tools | **Excel Tables (Ctrl+T) + structured refs (`Table1[@Col]`)** | **absent** | zero grep hits for `structuredRef` / `Table1[` / `[@` · Ctrl+T live: **no-op** (index.html:30622 swallows it as a browser-tab default) | **L** | see §3 sketch |
| Data tools | **pivot tables (Alt N V)** | **absent** | the Insert tab is `live:false` (index.html:24595) · live: strip prints **"Insert — no drills wired here yet"** (27470) | **L** | see §3 sketch |
| Data tools | subtotals (Alt A B / `SUBTOTAL()`) | **absent** | `MENUS['A']` has no `B` · live: Alt A B no-op; `=SUBTOTAL(9,A1:A4)` → `#NAME?` | **M** | the function alone is **S** (a `switch` over func-num onto the existing aggregates, filter-aware via `S.filter`); the *ribbon command* that inserts break rows is the M |
| Data tools | charts (Alt N C / F11) | **excluded** | charts — excluded by founder decision 2026-09-04 | — | not probed, not sketched, per direction |

### 1.9 Audit & repair

| area | item | status | evidence | effort | notes |
|---|---|---|---|---|---|
| Audit & repair | Go To Special | **partial** | `runGotoSpecial()` index.html:28021 · `syncMarks()` 28008 · live: the card offers exactly **three** — "o Constants (numbers) · f Formulas · k Blanks" | **S** per extra criterion | Excel offers ~12. Missing and worth having for a modelling course: **row/column differences**, **precedents**, **dependents**, **last cell**, **visible cells only**. Each is one predicate inside `syncMarks`'s existing loop; the marks/walk/Esc machinery is already built |
| Audit & repair | trace precedents / dependents (Ctrl+[ / Ctrl+] · Alt M P / M D) | grades | 29112–29113 · `jumpPrecedent()` 27867 · `MENUS['M']` 24616 | — | |
| Audit & repair | **show formulas (Ctrl+`)** | **absent** | the only definition is the **rapid-fire chord recognizer** at index.html:30149 (`op:'show_formulas'`) — it matches the keys and scores the round, it never repaints the grid · live in classic mode: **no-op** | **M** | a `S.showFx` latch plus one branch in `dispText()` — but every column width on the board is sized for values, so the honest version needs the widths to breathe too. Same recognizer-only shape as freeze panes (§1.11) |
| Audit & repair | F9 evaluate-in-editor | **partial** | index.html:28655 · live: editing `=A1`, F9 collapsed the buffer to **`0`**; `S.f9N` latches the gesture | **S** | it evaluates the **whole** formula. Excel's F9 evaluates the **selected sub-expression** — the tie-out gesture a course teaches. Needs a selection inside `editBuf` |
| Audit & repair | find & replace (Ctrl+F · Ctrl+H) | **partial** | `doFindReplace()` index.html:28071 · live: `dialog` → `findrep`, card reads "Find: … Replace: … tab switches · ↵ replace all · esc cancel" | **M** | replace-all only (no Find Next / Find All), case-**sensitive** always, substring always (no *Entire cell contents*), and 28078 skips any cell whose `value` is not a string — **numbers and formulas are invisible to it**. Excel's Options button is the whole gap |
| Audit & repair | comments / notes (Shift+F2) | **partial** | index.html:28715 explicitly refuses it in classic mode with a toast; the `cmt` cell flag and its red triangle **do** render (1808, 24304) but only rapid-fire's `add_comment` op (30178) ever sets it | **S** indicator / **M** with text | **[V4]** |
| Audit & repair | circular references / iterative calculation | **refused-by-design** | index.html:5130 and 12134 state it in the engine's own words: _"no iterative calculation"_ — the drills teach interest on the **beginning** balance as the deliberate simplification | **L** if ever wanted | correct call for a speed trainer; leave refused and keep teaching the convention |

### 1.10 Model mechanics

| area | item | status | evidence | effort | notes |
|---|---|---|---|---|---|
| Model mechanics | `SUM` · `AVERAGE` · `MEDIAN` · `MIN` · `MAX` | grades | 23691–23696 · live →`10` / `2.5` / `2.5` / `1` / `4` | — | **[V4]** M10 |
| Model mechanics | `COUNT` · `COUNTA` | grades | 23671 / 23676 · live →`4` / `4` | — | **[V4]** |
| Model mechanics | `LARGE` · `SMALL` · `RANK` | grades | 23589 / 23595 · live →`4` / `1` / `2` | — | **[V4]** · RANK.EQ semantics |
| Model mechanics | `ROUND` · `ROUNDUP` · `ROUNDDOWN` · `MOD` · `ABS` | grades | 23698 / 23684 / 23681 / 23697 · live →`3.14` / `3.12` / `3.99` / `1` / `4` | — | ROUNDUP/DOWN are away-from/toward zero, Excel-true |
| Model mechanics | `INT` · `POWER` · `SQRT` | **absent** | live: all three → `#NAME?` (`=2^10` **does** work — `pow_()` 23723) | **S** each | one line apiece in the `switch` at 23691 |
| Model mechanics | `RAND` · `RANDBETWEEN` | **absent** | live: both → `#NAME?` | **S**, but see notes | **do not ship these casually.** Drill checks grade cell values; a volatile function makes a board ungradeable and a replay non-deterministic. If a course beat needs them, gate them to sandbox/warm-up boards or seed them from the drill's own RNG |
| Model mechanics | `MODE` · `COUNTBLANK` | **absent** | live: both → `#NAME?` | **S** each | `numsIn()` 23499 + a tally |
| Model mechanics | `PERCENTILE` · `QUARTILE` · `STDEV` | **absent** | live: all three → `#NAME?`; the dotted forms (`STDEV.S`) do not even parse | **S** each | **[V4]** · `numsIn()` + a sort is exactly the `LARGE`/`SMALL` shape at 23589 |
| Model mechanics | `NPV` · `IRR` | grades | 23569 / 23576 (bisection) · live →`48.159…` / `0.175005…` | — | **[V4]** M15 · a no-sign-change range throws `IRR#NUM` |
| Model mechanics | `XNPV` · `XIRR` | **absent** | live: both → `#NAME?` | **M** | **[V4]** · needs a paired flow/date walk; `YEARFRAC` 23663 is already there to build on |
| Model mechanics | `PMT` · `PV` · `FV` · `RATE` · `NPER` | **absent** | live: all five → `#NAME?`; **typed `=PMT(0.1,5,-1000)` → cell displays `#NAME?`** | **S** each (RATE **M**) | **[V4]** flagged PMT. Four are closed-form one-liners beside `NPV` at 23569; `RATE` needs the same bisection `IRR` (23576) already uses — lift that loop |
| Model mechanics | **goal seek (Alt A W G)** | **absent** | `MENUS['A']` 24617 has no `W` · live: no-op | **M** | a target-cell / target-value / by-changing-cell dialog + the bisection loop `IRR` (23576) already owns. Genuinely reachable |
| Model mechanics | **data tables / what-if (Alt A W T)** | **absent** | live: no-op | **M** | one- and two-variable tables are a substitute-recalc-restore loop writing a block; the sensitivity boards (`dcfsens`) currently hand-build what this would generate |
| Model mechanics | **scenario manager (Alt A W S)** | **absent** | live: no-op | **M** | the engine's canon answer today is a `CHOOSE`-driven switch cell (23550), which is what the desk actually builds — a real Scenario Manager is lower value than goal seek or data tables |
| Model mechanics | roll-forwards (beginning → ± flows → ending) | grades | pure arithmetic + `SUM`; the whole `debtsched` / `nwcsched` / `revolver` family builds on it | — | no engine gap — the mechanic is refs and `SUM` |

### 1.11 Ship

| area | item | status | evidence | effort | notes |
|---|---|---|---|---|---|
| Ship | paste values hand-off (Alt H V V · Alt E S V · Ctrl+Shift+V) | grades | 27483 / `MENUS['HV']` 24604 / 29093 | — | **[V4]** M18 — the hand-off ritual is fully live |
| Ship | **freeze panes (Alt W F F)** | **absent** | `MENUS['W']` index.html:24620 = `[['V','Show']]` only · live: the strip prints "View → V Show" and Alt W F F bounces to `[]` · the one `freeze_panes` definition (30135) is a **rapid-fire chord recognizer** — it scores the round, it never touches the grid | **L** real / **S** as an inert graded stamp | **[V4]** · the board is per-drill sized (`ROWS:20` and smaller) and rendered whole with no scrolling viewport, so there is nothing for a frozen pane to hold still |
| Ship | **split (Alt W S)** | **absent** | `MENUS['W']` 24620 has no `S` · live: no-op · (`S.splits` at 25321 is per-beat **timing splits**, an unrelated latch) | **L** | same missing capability as freeze panes: no viewport |
| Ship | gridlines toggle (Alt W V G) | grades | `MENUS['WV']` 24621 · live: toast "gridlines hidden — Alt W V G to show" | — | |
| Ship | **protect sheet (Alt R P S)** | **absent** | the Review tab is `live:false` (24599) · live: strip prints **"Review — no drills wired here yet"** | **M** | a `S.locked` set + a guard at the head of every mutating branch + an unlock-cells route. The mutation points are many but each edit is one line |
| Ship | **print setup / page layout (Alt P · Ctrl+P)** | **absent** | the Page Layout tab is `live:false` (24596) · live: Alt P prints "Page Layout — no drills wired here yet"; Ctrl+P is swallowed by the modifier-key default block at 30622 | **M** | print area, orientation, fit-to-page, repeat-title-rows as latched state a check can read — no actual printing needed |
| Ship | **hyperlinks (Ctrl+K)** | **absent** | only the rapid-fire recognizer at 30011 (`op:'hyperlink'`) · live in classic mode: **no-op** | **S** | a `c.link` cell flag + a dialog + underline-blue render; the cell model already carries `uline` and `fontColor` |
| Ship | insert sheet (Shift+F11) | **absent** | recognizer at 30129 only; classic Shift+F11 **restarts the drill** (28748) | **L** | rides on multi-sheet |

---

## 2 · Summary — counts per status per area

Charts are excluded from every count below (founder decision 2026-09-04).

| area | grades | partial | absent | refused-by-design | **rows** |
|---|---:|---:|---:|---:|---:|
| Navigate & select | 8 | 0 | 0 | 1 | **9** |
| Edit & structure | 11 | 0 | 1 | 1 | **13** |
| Format | 10 | 1 | 3 | 0 | **14** |
| Formulas & references | 6 | 0 | 9 | 0 | **15** |
| Lookups & conditional aggregates | 4 | 2 | 9 | 0 | **15** |
| Text & dates | 8 | 0 | 10 | 1 | **19** |
| Logic & error handling | 5 | 0 | 5 | 0 | **10** |
| Data tools | 2 | 0 | 7 | 0 | **9** |
| Audit & repair | 1 | 4 | 1 | 1 | **7** |
| Model mechanics | 6 | 0 | 9 | 0 | **15** |
| Ship | 2 | 0 | 6 | 0 | **8** |
| **total** | **63** | **7** | **60** | **4** | **134** |

Many rows bundle a family (`PMT · PV · FV · RATE · NPER` is one row, five functions), so the
function-level gap is larger than the row count — roughly **40 named functions return `#NAME?`**.

By effort, the 60 absent rows plus the 7 partials split:

| effort | rows | what it buys |
|---:|---:|---|
| **S** | 39 | one evaluator entry or one keydown branch each — the function packs in §4 (waves 1–8) plus a dozen loose chords |
| **M** | 16 | `TEXT()`/custom format codes · Ctrl+1's missing code field · named ranges · XNPV/XIRR · multi-key sort · remove duplicates · text-to-columns · the SUBTOTAL command · goal seek · data tables · scenario manager · protect sheet · print setup · find-replace options · show formulas |
| **L** | 15 | which collapse to **7 buildable subsystems** (§3) plus iterative calculation, which stays refused: 5 of the 15 rows are all waiting on multi-sheet alone, and 3 on dynamic arrays |

**The headline.** Just under half the syllabus rows already grade, and the graded half is the half a
speed trainer is built on — navigation, editing, formatting, the hand-off. What is missing is not spread
evenly: **Formulas & references** and **Model mechanics** are the thinnest areas relative to what a
banking or corporate candidate is tested on, and the single densest cluster of cheap wins is the
`#NAME?` list — 40-odd functions that each need one entry beside a working neighbour. `XLOOKUP` and
`CONCAT`, the two the founder named, sit at opposite ends of that: `CONCAT` **already grades**;
`XLOOKUP` is one **S**.

**Three findings that are not "add a function":**

1. **`parseRef()` silently aliases columns past Z.** `=SUM(AA1:AA2)` returned the value of `A1:A2`
   with no error (index.html:24049 reads only `m[1].charCodeAt(0)`). Any board wider than 26 columns
   grades wrong answers as right. `gotoNextMark()` (28033) already has the correct base-26 loop.
2. **`SUMIF`/`SUMIFS`/`COUNTIF` take exact-match criteria only.** `">100"` and `"North*"` are the
   forms every course teaches and every one of them silently returns **0** rather than erroring —
   worse than absent, because it looks like it worked.
3. **Four chords exist only as rapid-fire recognizers** — freeze panes, show formulas, hyperlink,
   insert sheet (and comments is nearly a fifth). They match keys and score the round but never
   touch the grid, so a player learns the chord and the classic board disagrees with them.

---

## 3 · The L-effort subsystems

Fifteen matrix rows carry **L**, but they collapse to **seven buildable subsystems** (five of those
rows wait on multi-sheet alone, three on dynamic arrays, two on the missing viewport) plus iterative
calculation, which stays refused. Each sketch below is what a *keyboard-only, deliberately
simplified* version would need — the trainer's version, not Excel's.

**1 · Multi-sheet** (unblocks cross-sheet refs, hide/unhide sheets, insert sheet, Ctrl+PgUp/PgDn)
- `S.cells` becomes `S.sheets[name].cells` with `S.sheet` naming the active one; `ck()`, `get()`,
  `ensure()` and `usedRange()` route through it, and the drill strip at index.html:2412 gains a
  second row (or a modifier) so worksheet tabs and drill tabs stop competing for the same chrome.
- `parseRef()` (24049) learns a `Sheet!` prefix and returns `{sheet,r,c}`; `rangeRefs`/`cellRaw`
  carry the sheet through; Shift+F11 inserts, Ctrl+PgUp/PgDn walks, Alt H O U S hides.
- Grading is the real cost: `C.checks(S)` closures across all 74 drills read `S.cells` directly, so
  the shim has to keep `S.cells` pointing at the active sheet or every check is rewritten.

**2 · Dynamic arrays + spill** (unblocks FILTER, UNIQUE, SORT, SORTBY, SEQUENCE, TRANSPOSE, CSE)
- `evalFormula` gains an array return type; the commit path writes the anchor cell's formula and
  paints the rest of the rectangle as read-only ghost cells owned by that anchor (`c.spillFrom`).
- `render()` draws ghosts with the anchor's format and a spill outline; typing into one is refused;
  editing or deleting the anchor clears the whole rectangle; a blocked target commits `#SPILL!`,
  which the r418 sentinel machinery (23460) already knows how to display and propagate.
- Ctrl+Shift+Enter then falls out as the legacy alias: same array evaluation, braces in the display.

**3 · Pivot tables** (Alt N V)
- Alt N V opens a **field-list dialog** driven entirely by arrow keys — Rows / Columns / Values
  boxes, Tab between them, ↑↓ to pick a header from the current region, ↵ to place, a letter to
  cycle the value aggregation (Sum · Count · Average).
- ↵ on the dialog writes a **summary block** onto the sheet at the cursor: a real grid of labels and
  `SUMIFS`-shaped values (so it recalculates like everything else, and grades like everything else),
  tagged `S.pivot = {src, rows, cols, vals, at}` so a check can read the ritual, not just the result.
- Refresh is a re-run of the same write. No drag-drop, no slicers, no drill-down — the muscle the
  drill teaches is the field-list keyboard route and reading the block that comes out.

**4 · Conditional formatting** (Alt H L)
- Alt H L opens a rules card — H Highlight Cells Rules (greater than / less than / between /
  equal to / text contains / duplicate values), D Data Bars, S Color Scales, C Clear Rules.
- Rules are stored **per range** on `S.condFmt = [{r1,c1,r2,c2, kind, op, arg, style}]` — not baked
  into cells — and `render()` (24304 region) evaluates them against the live value on every paint,
  layering the rule's fill/font under the existing manual format so Clear Rules is a true undo.
- Data bars are a background gradient sized from the rule's min/max across the range — one extra
  CSS custom property per cell, no new DOM.

**5 · Excel Tables** (Ctrl+T, structured refs)
- Ctrl+T promotes the current region to `S.tables = [{name, r1,c1,r2,c2, headers}]`, paints banded
  rows and header filter arrows (the `S.filter` machinery at 27958 already exists — point it at the
  table), and auto-extends the range when a row is typed directly beneath it.
- `facCore()`'s ref scanner (23735) learns `Name[Col]` and `Name[@Col]`, resolving through the table
  record to an ordinary `A1:A9` / same-row cell before anything else in the evaluator notices.
- Total row (Ctrl+Shift+T) writes `SUBTOTAL` formulas — which is why the `SUBTOTAL()` **S** above is
  worth building first, on its own, as a prerequisite.

**6 · Data validation** (Alt A V V)
- Alt A V V opens a small card: V Validation criteria (List · Whole number · Decimal · Date ·
  Text length), the source typed as a literal list or a range, and E error alert on/off.
- Stored as `S.validation = [{r1,c1,r2,c2, kind, src, strict}]`; the commit path consults it before
  writing and refuses (or warns) on a violation — reusing the autocorrect ladder's existing
  refuse-and-explain surface rather than inventing a new one.
- List cells render a dropdown chevron and open the **existing** `openFilterPicker` (27984) on
  Alt+↓ — the picker widget, the arrow-key navigation and the ↵ commit are already built.

**7 · Freeze panes / split** (Alt W F F, Alt W S) — one capability, two commands
- Both need what the engine has never had: a **scrolling viewport**. Today the board is per-drill
  sized (`ROWS:20` and smaller) and `render()` paints every row and column into the DOM at once, so
  there is literally nothing for a frozen pane to hold still.
- The viewport is the whole job: a scroll offset in `S`, `render()` painting only the visible window
  plus the frozen rows/columns, and every jump (`Ctrl+End`, Go To, `gotoNextMark`) scrolling the
  offset instead of assuming the target is already on screen.
- **Cheap alternative, already noted in ENGINE_CHECKS_V4:** an inert graded stamp — `S.freeze =
  {r,c}` set by Alt W F F, a hairline drawn at the boundary, a check that reads the latch. That is
  an **S** and it teaches the chord honestly; it just does not scroll.

**8 · Charts** — excluded by founder decision 2026-09-04. Not probed, not sketched.

---

## 4 · The S/M build waves — one PR each

Grouped so each wave is one coherent PR with one test file. Waves 1–7 are the founder's stated target
("the entire breadth… including xlookup, concat"): **~40 named functions across 35 matrix rows**,
every one of them an S or a contained M, and **not one of them touching a subsystem**. If only one
thing ships from this document, ship waves 1–7.

**Wave 1 · the lookup pack** — `XLOOKUP` · `XMATCH` · `LOOKUP` · `INDIRECT` · `ROW`/`COLUMN`/`ROWS`/
`COLUMNS` · `OFFSET` height/width arguments.
_All S. The founder named XLOOKUP first; it is the single highest-visibility item in this document._
Sits beside the working `VLOOKUP` branch at 23631, reusing its range walk, `eqLoose` key match and
text-preserving return.

**Wave 2 · the conditional-aggregate pack** — a shared `matchCrit(value, criteria)` helper
(comparison operators `>` `<` `>=` `<=` `<>` `=`, and `*`/`?` wildcards) swapped in for `eqLoose`
across `SUMIF`/`SUMIFS`/`COUNTIF`, then `COUNTIFS` · `AVERAGEIF` · `AVERAGEIFS` · `MAXIFS` ·
`MINIFS` · `SUBTOTAL`.
_All S._ **Do the `matchCrit` half first and alone** — it converts three silent-zero partials into
correct functions, which is a bug fix, not a feature.

**Wave 3 · the text pack** — `SEARCH` · `SUBSTITUTE` · `REPLACE` · `VALUE` · `TEXTJOIN` · `REPT`
(and `TEXTSPLIT`/`TEXTBEFORE`/`TEXTAFTER` if the modern pack is wanted), then `TEXT()` and the
custom-format-code parser as the one M in the wave.
_S ×6 + M ×1._ Build the format-string parser onto `fmtNum()` (23328) once and both `TEXT()` and
Ctrl+1's missing code field land together.

**Wave 4 · the date pack** — `WEEKDAY` · `DATEDIF` · `DAYS` · `NETWORKDAYS` · `WORKDAY`, and
`NOW()` + Ctrl+Shift+; only if a time format ships with them.
_All S._ Every one is a few lines off the serial↔`Date` conversion already at 23654.

**Wave 5 · the logic pack** — `IFS` · `SWITCH` · `IFNA` · `TRUE`/`FALSE`/`NA` · `ISERROR` ·
`ISNUMBER` · `ISTEXT` · `ISBLANK`.
_All S._ These need `facCore()`'s **lazy** argument splitter (23736), not the eager path — an
`ISERROR` whose argument is pre-evaluated propagates the error instead of catching it (probed).

**Wave 6 · the finance pack** — `PMT` · `PV` · `FV` · `NPER` (closed forms beside `NPV` at 23569),
`RATE` (M — lift the bisection loop `IRR` already runs at 23576), `XNPV`/`XIRR` (M — a paired
flow/date walk on `YEARFRAC`).
_S ×4 + M ×3._

**Wave 7 · the stats pack** — `PERCENTILE` · `QUARTILE` · `STDEV` · `MODE` · `COUNTBLANK` · `INT` ·
`POWER` · `SQRT`, plus the one-character `facCore()` regex change that makes `RANK.EQ`/`STDEV.S`/
`AVERAGEIF.*` dotted names parse at all.
_All S._ Hold `RAND`/`RANDBETWEEN` out of this wave — see the note in §1.10.

**Wave 8 · the reference-integrity fix** — base-26 `parseRef()` (the AA-aliases-to-A bug),
whole-column refs (`B:B`), array constants (`{1,2,3}`).
_All S, and the first two are correctness, not features._ Ship this **before** any wave that widens
a board past column Z.

**Wave 9 · the data-tools commands** — multi-key sort (Alt A S S) · remove duplicates (Alt A M) ·
text-to-columns (Alt A E).
_All M._ One PR, one new `MENUS['A']` group, three dialogs on the same pattern, three multi-cell
writes through the existing `pushUndo` path. This is the wave that unblocks `scrub`, `textclean`
and `filterpass` at full depth.

**Wave 10 · the what-if commands** — goal seek (Alt A W G) · data tables (Alt A W T) · scenario
manager (Alt A W S).
_All M._ Goal seek is the one to build first and possibly alone: it reuses the bisection loop `IRR`
already owns, and it is the what-if tool a course actually tests.

**Wave 11 · the audit polish** — Go To Special's missing criteria (row/column differences,
precedents, dependents, last cell, visible cells only) · F9 partial-selection evaluate · find &
replace Options (match case, entire cell, look in formulas, find next) · comments as a real
indicator.
_S ×7 + M ×2._ Everything here upgrades a **partial** rather than filling an absence, so each item
makes an existing drill beat honest instead of adding a new one.

**Wave 12 · the loose chords** — Alt+Enter in-cell line break · hyperlinks (Ctrl+K) · vertical
alignment · show formulas (Ctrl+`) · freeze panes as an inert graded stamp.
_S ×4 + M ×1._ Four of these are chords players already learn from rapid-fire and then find dead on
the classic board — closing that gap is worth more than its size suggests.

**Wave 13 · named ranges** (Ctrl+F3) — a name table on `S`, a resolve step at the head of
`facCore()`, a define/list dialog.
_M._ Stands alone; nothing else waits on it.

---

_Verified read-only. No engine file was modified by this audit._
