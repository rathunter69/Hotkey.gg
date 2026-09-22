**Verified against code** (worktree `/home/claude/wt-rebuild`, `app2/`): corrected the following in the brief below.
- `Esc` is never logged inside a Ribbon walk or an edit (`ribbonKey`/`editKey`); only Esc that clears a marquee or closes a `DIALOGS_WB` dialog logs `'Esc'`. Home-tab-tour goal regraded by state.
- Ctrl+Enter logs `'Ctrl+↵'`, not `'Ctrl+Enter'`; Alt+= logs `'Alt'` then `'='`; PgDn logs `'PageDown'`, Alt+PgDn `'Alt+PgDn'`.
- `progress.js` has no `chapters` key; `cleanEntry` is per-lesson and `load()` drops unknown keys, so a `cleanChapters` in `load()` is needed.
- Help button is `#revealBtn` ("Show me the keys"), `revealed` flag; `mountLessonView(root, lesson, {mode})`.
- "Basic formulas" and "Copy, paste and fill" already exist as (empty) sections in `content/index.js`; only "Project and assessment" is new.
- `tests/smoke.mjs` plays `LESSONS[0]` and the last lesson, not an id list.
- `validateLesson` requires non-empty `concepts` and builds a single-sheet Session; both need relaxing for project/assessment and cross-sheet starting cells.
- `formulaRefs`/`live.js` only see in-sheet refs: cross-sheet liveness needs `inputsFor`/`probe`/`cloneSheet` extended, not just `cloneSheet`.
- `nextLesson`/"next up" follow array order: insert lessons in section order (only the first seven ids are pinned), do not append.
- Excel's Hide & Unhide menu is `HOUR/HOUC` hide, `HOUO/HOUL` unhide; the View tab menu `W` currently has only `V`. `stepPath` needs every terminal in `COMMANDS`.
- Font colour is a swatch dialog: blue is `Alt H F C → ×4 ↵`. `dialogKey` upper-cases letters except in `renamesheet`; the Find dialog needs the same exemption.
- `sheet.multi` must be cleared by every selection change and carried through `snapshot/restore`; so must `rowH`, `hiddenRows/Cols`, `freeze`, and `insert/remove` must shift them.
- `used()` is a local helper in each lesson file, not exported.

# Build brief — Phase C: Chapter 1 complete

Read `docs/SITE_SPEC.md` §4, §6, §7, `docs/REBUILD_PLAN.md`, `CLAUDE.md` first. Everything below is under `app2/`. No framework, no build step. Gate: `npm run check` (root `package.json` → `app2/tests/run-checks.js`: syntax, isolation, public-page drift, `node --test`) must stay under 30 s.

## What already exists (do not rebuild)

Engine (`engine/keyboard.js` `Session.dispatch`, `engine/sheet.js`): arrows/Ctrl/Shift (`Sheet.move`), Home/End (`moveHome`/`moveEnd`), PgUp/PgDn (`pageRows`, 0 = 10), Alt+PgUp/PgDn (`pageCols`), Ctrl+PgUp/PgDn (`switchSheet`), Go To Ctrl+G/F5/Alt H F D G (`openGoTo`/`goToRef`, sheet-qualified refs), Shift+Space/Ctrl+Space (`selectRow`/`selectCol`), Ctrl+A (`selectAll`: region, then whole sheet `A1:Z100`), Ctrl+Shift+Space (`regionAround`), F2/Esc/Delete/Backspace, Enter/Tab/Shift variants, Ctrl+Enter (`commitEditAll`, logged `'Ctrl+↵'`), Ctrl+D/R (`fill`), Ctrl+Z/Y (`undo`/`redo`), Ctrl+C/X/V (`copy`/`paste`), Ctrl+Shift+V, Ctrl+Alt+V paste dialog (`PASTE_OPTS` incl. transpose, `PASTE_OP_OPTS` O/M/D/S/I), Alt+= (`doAutoSum`/`Sheet.autoSum`, logs `'Alt'` then `'='`), F4 (`cycleAnchor`, logged only when it changed a ref), F9, Ctrl+B/I/U/5, Ctrl+1 (`dialog:'fmt'`, letters G/N/C/P/X/D/S/M/E/K/A), Ctrl+Shift+%/$/!/~, Ctrl+Shift+= / Ctrl+- (`insertOrDelete`, whole rows/cols only), Shift+F11, sheet rename/delete/move/copy. Ribbon (`engine/ribbon.js` `MENUS`, `COMMANDS`, `DEAD`; `Session.execCommand`): H1/H2/H3, HAL/HAC/HAR, HB* borders, HH fill (letters B/G/Y/R/N or ←/→ + ↵), HFC font colour (swatch dialog: `→ ×4 ↵` = blue), HFG/HFK, HW, HK/HP/H9/H0, H5/H6 indent, HIR/HIC/HDR/HDC (`Sheet.insert`/`remove`, any selection), HOW (`setColWidth`, digits + ↵), HOI (`autofitCols`), HFIS (`fillSeries`), HFID/HFIR, HEA/HEF/HEC, HJ, HOE/OE (Format Cells card, A = `centerAcross` → top-left cell `ca` = span). Formulas (`engine/formula.js`): SUM/AVERAGE/MIN/MAX/COUNT and ~100 more; `ERROR_CODES`, `isErrVal`. Live-formula rule: `engine/live.js` `isLiveFormula(sheet, ref)`.

Lesson format: `content/schema.js` (header comment, `CONCEPTS`, `validateLesson`), runner `app/runner.js` (`LessonRun`, key window `session.goalMark`, `endState`, demos, `race`). Copy from: `content/lessons/moving-around.js` (local `used(session, label)` helper reading `keyLog.slice(goalMark)`), `dialog-boxes.js` (route check + `endState` restating latched formats), `managing-sheets.js` (workbook `sheets`, `keys` with `then`/quoted text).

## Engine gaps (build first, each with a `node --test` file in `tests/`)

1. **Find & Replace** — `keyboard.js`: in the `e.ctrlKey && !e.altKey` block, before its final `return true`, add `lk === 'f'` → `openFind(false)`, `lk === 'h'` → `openFind(true)`; each logs `'Ctrl+F'`/`'Ctrl+H'` and calls `openDialog('find')` with `this.dlg = {kind:'find', find:'', repl:'', focus:'find', replace:bool}`. Add `'find'` to `DIALOGS_WB`, route in `dlgKey` → `findKey(key)`: Tab/Shift+Tab switch field, Backspace edits, Enter = Find Next (`Sheet.findNext(text, from)` → next match after the active cell, case-insensitive, wraps; moves active, returns ref or null; `note = 'We couldn't find what you were looking for.'` when null), `A` = Replace All (`Sheet.replaceAll(find, repl)` → count, one `pushUndo`, `commit('edit')`). In `dialogKey` keep typed case for `'find'` as for `'renamesheet'`. Remove `HFDF`/`HFDR` from `DEAD`, add to `COMMANDS`, route in `execCommand` to `openFind`. `ui/`: draw the card like Rename Sheet. Test: `tests/find-replace.test.js`.
2. **Go To Special** — `Sheet.selectSpecial(kind)` (`'blanks'|'constants'|'formulas'` within the current selection, or the used range when single-celled) sets `sheet.multi = [keys]`, `active` = first key, `sel` null. `eachSel`, `selRange` callers that format (`formatSel`, `toggleAllOrNone`, `deleteContents`) honour `multi`; `selectionText()` returns the keys joined by `,`; every selection change (`move`, `goTo`, `select`, `selectRow/Col/All`, `restore`, `paste`) clears `multi`. Dialog `'gotospecial'` in `DIALOGS_WB`, keys K/O/F + Enter; open from `HFDS` and inside Go To with `S`; `HFDU` = formulas, `HFDN` = constants directly (remove all three from `DEAD`, add to `COMMANDS`). Test: `tests/goto-special.test.js`.
3. **Row height, hide/unhide, freeze** — `sheet.rowH[]` (default 20), `sheet.hiddenRows`/`hiddenCols` (Sets), `sheet.freeze = {r:0, c:0}`; all in `snapshot`/`restore`, `toJSON`, `copySheet`, and shifted by `insert`/`remove`. Keys: Ctrl+9 hide rows, Ctrl+Shift+( unhide rows, Ctrl+0 hide cols (delete the `if (e.ctrlKey && k === '0') return true;` line and handle inside the Ctrl block), Ctrl+Shift+) unhide cols, on the selection's rows/cols (unhide: hidden ones inside the selection). Ribbon: `MENUS['HO']` gains `['H','Row height…']`, `['U','Hide & Unhide']`; `MENUS['HOU'] = [['R','Hide Rows'],['C','Hide Columns'],['O','Unhide Rows'],['L','Unhide Columns']]`; `HOH` dialog `'rowh'` mirrors `'colw'` (`setRowHeight(pts)` → px = round(pts×4/3)); `HOA` becomes `autofitRows` (rows with wrap → 20 × line count, else 20). Freeze: `MENUS['W']` gains `['F','Freeze Panes']`, `MENUS['WF'] = [['F','Freeze Panes'],['R','Freeze Top Row'],['C','Freeze First Column']]`; `WFF` toggles freeze at the active cell (`{r: active.r-1, c: active.c-1}`, or unfreeze when set — Excel's label flips to Unfreeze), `WFR` → `{r:1,c:0}`, `WFC` → `{r:0,c:1}`. Add every terminal to `COMMANDS`. `ui/sheet-view.js`: skip hidden rows/cols (draw the header seam thicker), use `rowH`, draw the freeze line as a thicker gridline (no scroll pinning). Group/ungroup (Alt+Shift+→/←) and split panes: out of scope; concept text only. Test: `tests/rows-cols.test.js`.
4. **Cross-sheet references** — `formula.js` `tokenize` throws on `!` and `'`. Accept `Name!A1`, `Name!A1:B2`, `'My Sheet'!A1` as tokens `{t:'ref', v:'A1', sheet:'NAME'}` (range corners carry the same `sheet`). Evaluation: `ctx.sheetRaw(name, key)`; unknown sheet or no resolver → `#REF!`. `Sheet.resolver` (name → Sheet, case-insensitive) set by `Session` in the constructor, `addSheet`, `renameSheet`, `deleteSheet`; `evalCtx` passes `sheetRaw`. On any sheet `commit`, `Session` recalcs every other sheet (two passes). `formulaRefs` returns cross-sheet refs with `sheet`; `translateFormula`, `adjustFormulaStructure`, `boundFormula`, `jumpPrecedent`, `Sheet.recalc` deps ignore them. `live.js`: `precedentMap` records `{sheet, key}` refs; `inputsFor` emits them as `'COSTS!B3'`; `cloneSheet` clones every sheet in the resolver and rewires it; `probe` resolves `'X!K'` to the cloned sheet's cell. `normalizeFormula` must not upper-case a quoted sheet name. Test: `tests/cross-sheet.test.js` (`=Costs!B3*2` value and live; `=Nope!B3` → `#REF!`; fill-down keeps the sheet prefix).

## Schema additions (`content/schema.js`, `content/index.js`)

- `kind: 'lesson' | 'project' | 'assessment' | 'testout'` (default lesson). `timeLimit` (seconds) required for assessment/testout. For kind ≠ lesson: `concepts` may be empty (goals then never carry `teach`), 6–10 goals allowed; relax the "3-6 goals" assertion in `tests/lessons.test.js` (`the adaptive lesson format is enforced`) by kind.
- `validateStartingSheet` builds the workbook like `LessonRun.reset` (adds `l.sheets`), so cross-sheet checks probe correctly.
- New `CONCEPTS` (one gloss each): `page-keys`, `select-all-sheet`, `go-to-special`, `undo-redo`, `fill-down-right`, `find-replace`, `insert-delete-rows`, `column-width`, `autofit`, `hide-unhide`, `freeze-panes`, `format-cells-tabs`, `bold-italic-underline`, `fills-and-colours`, `center-across`, `formula-basics`, `sum-family`, `autosum`, `relative-absolute`, `f4-anchor`, `cross-sheet-ref`, `formula-errors`, `copy-cut-paste`, `paste-special`, `fill-series`, `flash-fill`. Reuse existing `go-to`, `sheet-reference`, `row-col-select`, `ctrl-a`, `escape-cancels`, `font-color`.
- `content/index.js`: add the tenth section `{ name: 'Project and assessment', blurb }`; update the `sectionNames(foundations).length` assertion 9 → 10. Insert each new lesson into `lessons` right after the last lesson of its section (catalog "next up" and `nextLesson` follow array order); `section1.test.js` pins only the first seven ids.

## Lessons (`content/lessons/<id>.js`; sheet = the Weekly Sales Report variants already used; every lesson has `solution`)

Rules: `read` 2–3 sentences; the first-use goal of a lesson concept carries `teach`, reuse goals none; `keys` is the exact route from the previous goal's end state (`tests/lessons.test.js` replays it via `hintScript`: glyphs `↑↓←→↵⌫`, `×N`, `then`, quoted text, `Alt+H` → Alt then H). Every goal names a visible cell/range/element. Mechanic goals use the local `used()`.

**Moving** (after `moving-around`)
- `page-keys` "Pages and screens": 60-row sales log. PgDn from A1 (`used('PageDown')`, active row ≥ 11); Alt+PgDn (`used('Alt+PgDn')`); PgUp back into rows 1–10; Ctrl+End on the "Total" cell.
- `go-to-cells` "Go To": two sheets Sales/Costs. Ctrl+G `B40`; `A1:C7` (`sel` set, `selectionText()==='A1:C7'`); `Costs!B3` (`ses.sheetIndex===1`).

**Selecting** (after `selecting-ranges`)
- `select-blocks` "Whole rows, columns and the sheet": Ctrl+Space on C3 (`selectionText()==='C1:C100'`), Shift+Space on row 2, Ctrl+A twice (`'A1:Z100'`, concept `select-all-sheet`), Ctrl+Shift+Space region.
- `go-to-special` "Go To Special": blanks in B3:B12 (`multi` equals the blank keys), constants, formulas. Gap 2.

**Entering and editing** (after `editing-cells`)
- `undo-redo`: type a wrong figure over B4, Ctrl+Z restores (`used('Ctrl+Z')` + value); Ctrl+Y; Esc on a half-typed entry (`!ses.editing`, value unchanged; Esc is not logged, grade by state).
- `fill-down-right`: Ctrl+D label into A3:A7; Ctrl+R formula across B9:D9 (`isLiveFormula` each); select E3:E7, type 0, Ctrl+Enter (`used('Ctrl+↵')`).
- `find-replace`: Ctrl+F "Wenesday" (active lands A5), Ctrl+H "Sales team" → "Finance", Replace All "Q1" → "Q2" (4 cells). Gap 1.

**Rows, columns and sheets** (after `managing-sheets`)
- `insert-delete-rows`: Shift+Space on A5 then Ctrl+Shift+= (Wednesday now A6, B9's formula now B10 and live); Shift+Space on row 8 then Ctrl+-; Alt H I C on B3 (Sales header now C2).
- `widths-heights`: Alt H O W `14` ↵ on column B (`colW[2]===103`); Alt H O I on A (`colW[1]===neededWidth(1)`); Alt H O H `30` ↵ (`rowH[3]===40`); Alt H O A. Gap 3.
- `hide-freeze`: Ctrl+0 on C3 (`hiddenCols.has(3)`), Ctrl+Shift+) after selecting B:D, Alt W F R (`freeze.r===1`), Alt W F F unfreeze. Gap 3. Group/split panes: `closing` only.

**The Ribbon and dialogs** (after `dialog-boxes`)
- `home-tab-tour`: Alt H F G on A1 (`fsz` grew), Alt H 2 on A10, Alt H 3 on B10, Alt H W on A1, then "back out": grade by state — `used('Alt')` and `used('H')` in the window, `ses.mode==='normal'`, no format changed (Esc is not logged in a walk).
- `format-cells-tabs`: Ctrl+1 N on B3:B7 (`fmtStyle==='comma'`), Ctrl+1 A on A1:C1 (`cellAt('A1').ca===3`), Alt H B A on A2:C7 (`ball`), Alt H B T (`thick` on the ring). Teach line: "the first letter of a tab or category".
- `fills-and-colours`: Alt H H Y on A2:C2 (`fill==='yellow'`), Alt H F C → ×4 ↵ on B3:B7 (`fontColor==='blue'`, inputs-blue convention), Alt H A R on A2, Alt H 6 on A3.

**Basic formulas** (existing empty section)
- `first-formula`: `=B3*C3` in D3, `=B3+B4`, `=B7/C7`, `=(B3-B4)/B4` — each `isLiveFormula` + value.
- `sum-family`: one of SUM/AVERAGE/MIN/MAX/COUNT in B9:B13, live + value.
- `autosum`: Alt+= on B9 then ↵ (`used('Alt')`, `used('=')`, `formula('B9')==='=SUM(B3:B8)'`); select B3:C9 (row 9 blank) Alt+= (both sums land).
- `absolute-refs`: `=B3*$E$1` in C3, Ctrl+D over C3:C7 (all live, all read E1); F4 goal: type `=B4*E1`, F4, ↵ (`used('F4')`, formula contains `$E$1`).
- `cross-sheet`: `=Costs!B3` in Sales!D3, `=B3-Costs!B3` in E3, Ctrl+D E3:E7. Gap 4.
- `formula-errors`: seed `=B5/C5` with C5 blank, `=SUMM(B3:B7)`, `=B3+"x"`, `=#REF!*2`; each goal fixes one (`!isErrVal(value(ref))` and live).

**Copy, paste and fill** (existing empty section)
- `copy-cut-paste`: Ctrl+C B2:C2 → Ctrl+V on E2; Ctrl+X A10 → Ctrl+V on A12; copy then Enter (`pasteDrop`); Ctrl+C then Esc (`!sheet.clipboard`, `used('Esc')`).
- `paste-special`: Ctrl+Alt+V V ↵ values over formulas (no `formula`, values equal), T ↵ formats, E ↵ transpose A2:C2 → E2:E4, copy a cell holding 1.1 then Ctrl+Alt+V M ↵ over B3:B7.
- `fill-series`: 1,2 in A3:A4 → select A3:A12, Alt H F I S ↵; Ctrl+R headers; `flash-fill` as `closing` text only (no Ctrl+E in the engine).

**Project and assessment** (new section)
- `weekly-report-project` (`kind:'project'`, 8–10 goals, medium): `sheets[0]` = "Report" (starting, blank), `sheets[1]` = "Raw" (numbers). Title bold + Center Across, headers bold/centred/filled, `=Raw!B3` links filled down, SUM row via AutoSum, Number format, borders, AutoFit, freeze top row; `endState` restates every format.
- `foundations-assessment` (`kind:'assessment'`, `timeLimit: 300`): same shape, fresh data. `app/lesson-view.js`: for assessment/testout force `mode='timed'`, omit `#revealBtn`, tick the timer and at `timeLimit` show a "Time's up — try again" overlay (reuse `overlay`, `restart('timed')`); on a clean finish call `progress.record(id,'timed',secs,{clean})` and `progress.chapterPass('foundations','assessment')`. `app/progress.js`: state becomes `{lessons, chapters}`; `load()` normalises `chapters` (`{foundations:{assessment:true,testout:true}}`) via a new `cleanChapters`; add `chapterPass(ch, what)` and `chapter(ch)`.
- `foundations-testout` (`kind:'testout'`, 8 goals across sections 2–8, `timeLimit: 240`). Pass → `prefs.skip(ids)` for every Chapter 1 lesson not completed (like `skipsFor` in `app/first-run.js`) and `chapterPass('foundations','testout')`. `app/learn-page.js`: "Already know this? Test out" link in the Chapter 1 header; on the Chapter 2 placeholder card show "Unlocks when Chapter 1 is complete or tested out" / "Unlocked" from `progress.chapter('foundations')` and completion of all Chapter 1 lessons (paid access itself arrives in Phase E).

## Order of work

1. Engine gaps 1–4 with tests. 2. Schema/concepts/index. 3. Sections Moving–Ribbon. 4. Formulas, Copy/paste. 5. Project, assessment, test-out, lesson-view/progress/learn-page. 6. `node app2/tests/public-pages.js --write` (check mode fails on drift). 7. `tests/smoke.mjs`: keep the first/last loop and add `find-replace`, `hide-freeze`, `cross-sheet`, `weekly-report-project`; stay under 2 min. Run `npm run check` and the smoke.

## Traps

- `validateLesson` rejects a first goal already satisfied by the starting sheet, any `teach` on a reuse goal, and a check that throws on the starting sheet.
- Goals latch: any format/value a goal leaves behind must be restated in `endState`.
- Logged labels are exact: `'↵'`, `'⌫'`, `'Esc'`, `'Ctrl+↵'`, `'Ctrl+Shift+↓'`, `'Ctrl+Shift+='`, `'Ctrl+-'`, `'PageDown'`, `'Alt+PgDn'`, `'Ctrl+PgDn'`, `'Shift+Space'`. Esc logs only when it clears a marquee or closes a `DIALOGS_WB` dialog; F4 only when it changed a ref.
- `insertOrDelete` acts only on whole rows/columns; hints include Shift+Space / Ctrl+Space first. `HIR/HIC/HDR/HDC` work from any selection.
- Never grade formulas by regex; `isLiveFormula` plus a value check.
- Scripts: `Alt+H` expands to Alt then H; `Alt+=` and `Ctrl+Alt+V` stay chords; `14` is typed text; `Ctrl+Shift+9` arrives as `(`.
- `dialogKey` upper-cases letters (Go To accepts `!`); keep typed case only for `renamesheet` and `find`.
- Old build at repo root is reference only; the isolation check fails any import from outside `app2/`. Do not touch `supabase/**`.