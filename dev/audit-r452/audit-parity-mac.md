# PARITY + MAC KEYBINDING AUDIT — Hotkey.gg engine vs real Excel
Read-only audit, worktree `agent-a868525fd97e43d27`, served on :8802.
All engine verdicts are **proven headlessly** unless marked "read-only" (source-read).
Excel facts carry an explicit confidence tag: **[H]** high · **[M]** medium · **[L]** low / verify on device.

---

## 0. HARNESS RESULTS (this worktree, :8802)

```
node dev/e2e-mac-input.js      → MAC INPUT: ALL 19 PASS
node dev/e2e-audit-parity.js   → PARITY MATRIX: ALL 177 PASS
```
Both suites default to `URL=http://127.0.0.1:8791/index.html`; both accept `URL=`.
`playwright-core` is NOT vendored — `npm install playwright-core` was needed
(dev/e2e-*.js:6). Worth noting for CI reproducibility.

### What the 196 passing assertions DO cover
parity: movement/commit · edit semantics · F4 anchor cycle order · Ctrl-jumps + shift-extends ·
fill translation · copy/paste + paste-special values · number ENTRY · evaluator + Alt= ·
delete/undo/redo · row ops + undo geometry · formatting ops · autofit · pointer mode ·
IFERROR/trace · Ctrl+1 + Alt O E · grouping · AutoFilter · Go To Special · hide/col-width ·
SUMIFS/SUMPRODUCT · paste operations · sort warning · Flash Fill · clipboard lifecycle
(ants, copy-then-Enter, Ctrl+F) · ribbon canon (W V G, H 3, Subtract, H O E, M P/M D) ·
Esc one-level + uppercase KeyTips · cursor-after-copy/paste · border canon A=all / S=outside ·
esc discipline.
mac: platform detect · ⌘C/V · ⌘↓ · ⌘B · tap-⌥ + held-⌥ dead chars · ⌘T≡F4 · ⌃U≡F2 ·
plain-Ctrl passthrough · ⇧Space · typing · ⌥/⌘ caps in task line + keyflash · mac popup ·
reference platform toggle.

### What NEITHER suite covers (the gap this audit fills)
- **Every Mac-native chord that is NOT ⌘=Ctrl / ⌘T / ⌃U**: ⌘⇧T (AutoSum), ⌘⌃V (Paste
  Special), ⌘⇧V (paste values), ⌃; / ⌃⇧; , ⌃` , ⌃⇧8, ⌘⇧F, ⌥Return, ⌫ vs fn+⌫.
- Whether any taught Mac keycap is stolen by macOS/Chrome (⌘Space, ⌘H, ⌘T, ⌘⇧T, ⌘`).
- **reference.html row-by-row truth** — the toggle is asserted only as "some cap became ⌘".
- Tab→Enter home-column return · number-format-on-entry (`$1,000`) · F4 repeat-last-action ·
  Shift+F2 comment · Ctrl+Shift+#/@/^/& · Alt+Enter line break.
- Backspace-vs-Delete divergence on a multi-cell selection.

---

## 1. THE MASTER CHORD TABLE

Legend — **✅ match** · **➖ missing** (engine silently does nothing) · **❌ WRONG**
(engine does a *different* thing than Excel) · **⚠ display/route lie**.

### 1a. Navigation & selection

| Action | Windows Excel | Mac Excel | Engine accepts (Win) | Engine accepts (Mac) | Verdict |
|---|---|---|---|---|---|
| Move | arrows | arrows | arrows | arrows | ✅ |
| Edge jump | Ctrl+arrow | ⌘arrow **[H]**, ⌃arrow also **[H]** | Ctrl+arrow (27471) | ⌘arrow + ⌃arrow (26949→27471) | ✅ |
| Extend to edge | Ctrl+Shift+arrow | ⌘⇧arrow **[H]** | ✅ 27471 | ✅ | ✅ |
| A1 | Ctrl+Home | ⌃fn← / ⌘fn← **[M]** | 27538 | ✅ (fn← reports `Home`) | ✅ |
| Last used cell | Ctrl+End | ⌃fn→ **[M]** | 27553 | ✅ | ✅ |
| Select row | Shift+Space | ⇧Space **[H]** | 27440 | ✅ | ✅ |
| Select column | Ctrl+Space | **⌃Space [H]** (⌘Space = Spotlight) | 27441 | accepts ⌘Space *and* ⌃Space | ✅ engine / ⚠ **reference + keycaps teach ⌘Space** |
| Current region | Ctrl+Shift+Space | ⌃⇧Space **[M]** | 27432 → `regionAround` | ✅ | ✅ |
| Current region (alt) | **Ctrl+Shift+8 / Ctrl+\*** | ⌘⇧8 / ⌃⇧* **[M]** | ➖ nothing (probe 09) | ➖ | **➖ missing** |
| Select all / region | Ctrl+A | ⌘A **[H]** | 27604 region→used | ✅ (probe 38) | ✅ |
| Sheet switch | Ctrl+PgUp/Dn | ⌥→ / ⌥← **[M]** | only `IS_STANDALONE` (27119), and it switches DRILLS | same | ⚠ out of scope, but the Mac reference cap is wrong |

Proven Ctrl-arrow semantics (probe 24, board B2:B4 + B8, ROWS 14):
`B2 →B4 →B8 →B14 →B14` — block edge, next island, sheet floor, then sticks. **Excel-true ✅**
Ctrl+Shift+arrow (probe 25): from the top of a block → `B2:B4`; from the block's bottom edge
→ `B4:B14` (jumps to the sheet floor across the blanks). **Excel-true ✅**
Ctrl+Space over a 14-row board selects `r1..r14`; Shift+Space selects `c1..c10 (COLS)`.
Boards are capped at 20 rows (`ROWS_MAX=14` legacy default, §1.3 doctrine says 20 floor+cap,
index.html:2082 / 26758 `rowsAfterOp`). The finite sheet is the right sim analogue. **✅**

### 1b. Editing & the formula bar

| Action | Windows | Mac | Engine (Win) | Engine (Mac) | Verdict |
|---|---|---|---|---|---|
| Edit cell | F2 | **⌃U [H]**, fn+F2 **[H]** | F2 (27275) | ⌃U→F2 (26959), fn+F2 | ✅ |
| F2 caret placement | end of content, Edit mode | same | `editCaret = len`, `editMode='edit'` (probe 23) | ✅ | ✅ |
| F2 while editing | toggles Edit↔Enter (point) mode | same | 27184 | ✅ | ✅ |
| Cycle anchors | F4 | **⌘T [H]**, fn+F4 | F4 (27210) | ⌘T→F4 (26958) | ✅ engine · ⚠ **⌘T is browser-reserved, §3** |
| Commit down / up | Enter / Shift+Enter | same | 27197 / `commitEdit(∓1,0)` | ✅ | ✅ |
| Commit right / left | Tab / Shift+Tab | same | 27199 | ✅ | ✅ |
| **Tab…Tab…Enter returns to the start column** | **yes [H]** | yes | ➖ **no** — B4→Tab→Tab→Enter lands **D5**, not B5 (probe 18) | ➖ | **➖ missing** |
| Fill selection with entry | Ctrl+Enter | ⌃Return / ⌘Return **[M]** | 27197 (`ctrl||meta`) | ✅ (probe 12 → 9,9,9) | ✅ |
| Cancel edit | Esc | Esc | `cancelEdit()` 27200 | ✅ | ✅ |
| Esc in **point mode** | drops the ref, exits edit | same | probe 22: `=C9` buffer discarded, cursor back on C10, `editing=false` | ✅ | ✅ |
| **Line break in cell** | **Alt+Enter [H]** | ⌥Return **[M]** / ⌃⌥Return **[M]** | ❌ **commits and moves down** (probe 11: "a" lands in C5, cursor C6) | ❌ same | **❌ WRONG** (reference.html:216 advertises it) |
| Evaluate part of formula | F9 | fn+F9 **[M]** | 27216 ✅ | ✅ | ✅ |
| Backspace on **1 cell** | clears + enters Edit | same | ✅ | ✅ | ✅ |
| Backspace on a **range** | clears the **active cell only**, enters Edit **[H]** | Mac ⌫ clears the **whole selection [M-H]** | ❌ clears **all three** cells, `editing=false` (probe 05) | ✅ (accidentally Mac-correct) | **❌ Windows nuance wrong** |
| Delete on a range | clears contents, keeps formats | fn+⌫ (or ⌫) same | ✅ probe 06 + probe 33 (bold + currency survive, value null) | ✅ | ✅ |
| Insert comment | Shift+F2 | ⇧fn+F2 **[M]** | ❌ falls into the F2 edit branch (27275 has no shift guard) → **enters Edit mode** (probe 34). The RF deck (28429) and the cell model (`cmt`) both have it | ❌ | **❌ WRONG** |
| Insert today's date | Ctrl+; | ⌃; **[M-H]** | ➖ nothing (probe 08) | ➖ | **➖ missing** |
| Insert time | Ctrl+Shift+; | ⌃⇧; **[M-H]** | ➖ | ➖ | **➖ missing** |

### 1c. Clipboard

| Action | Windows | Mac | Engine (Win) | Engine (Mac) | Verdict |
|---|---|---|---|---|---|
| Copy / Cut / Paste | Ctrl+C/X/V | ⌘C/X/V **[H]** | 27611/27612/27615 | ✅ | ✅ |
| **Paste Special dialog** | Ctrl+Alt+V | **⌃⌘V [H]** | ✅ 27596 | ❌ **⌃⌘V does a silent full paste** (probe 03: dest = value+comma+blue font, `dialog=null`). ⌥⌘V *does* open it (probe 04) | **❌ P0 WRONG** |
| **Paste values chord** | Ctrl+Shift+V (Excel 365) **[M]** | ⌘⇧V **[M]** | ❌ pastes **All** — probe 07 dest formula `=D8` | ❌ same | **❌ WRONG** (native profile; the *Macabacus* profile does honour it, 27613) |
| Paste values (walk) | Alt E S V / Alt H V V | ⌥ walks (see §4) | ✅ | ✅ in-sim | ✅ / ⚠ |
| Marching ants + Esc | Esc clears | same | 27477-27494 ✅ | ✅ | ✅ |
| Copy → Enter pastes & ends | yes **[H]** | yes | ✅ 27506 | ✅ | ✅ |
| Cut→paste strips source formatting | yes | yes | ✅ probe 28 (`B4 → null`, bold rides to F9) | ✅ | ✅ |
| Paste of a formula re-bases relative refs | yes | yes | ✅ probe 07 (`=B4` → `=D8`) + parity §E/§F | ✅ | ✅ |
| Enter after Ctrl+V | pastes again at cursor, ants die | same | probe 19: cursor stays E9, clipboard consumed | ✅ **[M]** | ✅ |

### 1d. Formatting

| Action | Windows | Mac | Engine (Win) | Engine (Mac) | Verdict |
|---|---|---|---|---|---|
| Bold / Italic / Underline | Ctrl+B/I/U | ⌘B/I/U **[H]** | 27616-27618 | ✅ probe 36 (⌘U underlines; ⌃U is F2 — no clash) | ✅ |
| Format Cells | Ctrl+1 | ⌘1 **[H]** | 27628 → `dialog='fmt'` | ✅ | ✅ chord; ⚠ **contents**, §4 |
| Currency | Ctrl+Shift+$ | ⌃⇧$ **[M-H]** | 27650 | accepts ⌘⇧$ *and* ⌃⇧$ | ✅ engine · ⚠ cap shows ⌘⇧$ |
| Percent | Ctrl+Shift+% | ⌃⇧% **[M-H]** | 27649 | ✅ | ✅ / ⚠ |
| Comma | Ctrl+Shift+! | ⌃⇧! **[M-H]** | 27651 | ✅ | ✅ / ⚠ |
| General | Ctrl+Shift+~ | ⌃⇧~ **[M-H]** | 27655 | ✅ | ✅ / ⚠ |
| **Date fmt** | Ctrl+Shift+# | ⌃⇧# | ➖ grid no-op (probe 32) — exists only in the rapid-fire deck (28386) | ➖ | **➖ missing on the grid** |
| **Time fmt** | Ctrl+Shift+@ | ⌃⇧@ | ➖ (probe 32) | ➖ | ➖ missing |
| **Scientific** | Ctrl+Shift+^ | ⌃⇧^ | ➖ (probe 32) | ➖ | ➖ missing |
| **Outline border** | Ctrl+Shift+& | ⌃⇧& | ➖ (probe 32) — RF-deck only (28401) | ➖ | ➖ missing |
| Strikethrough | Ctrl+5 | ⌘5 **[M]** | 27622 | ✅ | ✅ |
| Decimals ± | Alt H 0 / 9 | ⌥ walk (see §4) | ✅ | ✅ in-sim | ✅ / ⚠ |
| Delete keeps formats | yes | yes | ✅ probe 33 | ✅ | ✅ |
| `#####` when too narrow | yes | yes | ✅ index.html:23236 | ✅ | ✅ |
| Text spills into empty neighbours | yes | yes | ✅ `.spill` (index.html:172-182, render) | ✅ | ✅ |

### 1e. Formulas & fill

| Action | Windows | Mac | Engine (Win) | Engine (Mac) | Verdict |
|---|---|---|---|---|---|
| **AutoSum** | Alt+= | **⌘⇧T [H]** (Alt+= does NOT exist on Mac) | ✅ 27468 (probe 02 → `=SUM(`) | ❌ **⌘⇧T does nothing** — the adapter rewrites it to bare `F4` (26958 does not exclude shift), which is inert outside edit mode (probe 01). ⌥= works in-sim only | **❌ P0** |
| AutoSum stops at a blank | yes | yes | ✅ probe 27 (`=SUM(B4` from B5, skipping the blank B3) | ✅ | ✅ |
| Fill down / right | Ctrl+D / Ctrl+R | ⌘D / ⌘R **[H]** | 27619/27620 | ✅ | ✅ |
| Ctrl+D over a multi-row selection | fills every row from the top | same | ✅ probe 26 (`5,5,5,5`) | ✅ | ✅ |
| **Show formulas** | Ctrl+\` | **⌃\` [M-H]** (⌘\` = macOS window cycle) | ➖ nothing (probe 13) — RF-deck only (28400) | ➖ | **➖ missing** + ⚠ reference:225 |
| **Repeat last action** | **F4 (not editing) [H]** | ⌘Y **[M]** | ➖ nothing (probe 14: bold does not repeat onto D5) | ➖ | **➖ missing** — reference:223 claims it |
| Go To | Ctrl+G / F5 | ⌃G / fn+F5 **[H]** | ✅ 27626 / probe 35 | ✅ | ✅ |
| Trace precedents/dependents | Ctrl+[ / ] | ⌃[ / ⌃] **[M]** | ✅ 27647/27648 | ✅ | ✅ |

### 1f. Structure, data, workbook

| Action | Windows | Mac | Engine | Verdict |
|---|---|---|---|---|
| Insert rows/cols | Ctrl+Shift+= (or Ctrl++) | ⌃⇧= **[M-H]** | ✅ 27128-27167 (accepts `=`,`+`); probe 31 `ins` | ✅ |
| Delete rows/cols | Ctrl+- | ⌘- / ⌃- **[M-H]** | ✅ (accepts `-`,`_`); probe 31 `del` | ✅ |
| Hide rows / unhide | Ctrl+9 / Ctrl+Shift+9 | ⌃9 / ⌃⇧9 **[M]** | ✅ 27623-27625 | ✅ engine · ⚠ Mac cap ⌘9 |
| Group / ungroup | Shift+Alt+→ / ← | ⌘⇧K / ⌘⇧J **[M]** | ✅ 27463 (Alt+Shift only) | ➖ Mac-native pair missing |
| AutoFilter | Ctrl+Shift+L | **⌘⇧F [M]** or ⌃⇧L **[M]** | ✅ 27609 accepts ⌘⇧L/⌃⇧L; ❌ **⌘⇧F does nothing** (probe 15) | ➖ Mac-native missing |
| Filter dropdown | Alt+↓ | ⌥↓ **[M]** | ✅ 27458 + probe 39 | ✅ |
| Sort | Alt A S A/D | ⌥ walk | ✅ | ✅ in-sim |
| Undo / Redo | Ctrl+Z / Ctrl+Y (Ctrl+Shift+Z) | ⌘Z / ⌘Y **[H]**, ⌘⇧Z | ✅ 27425-27428; probe 40 | ✅ |
| Undo granularity | one per commit | same | ✅ probe 30 (typed `123` → one Ctrl+Z restores `400`) | ✅ |
| Save | Ctrl+S | ⌘S **[H]** | ✅ 27405 (drill-aware) | ✅ |
| Find / Replace | Ctrl+F / Ctrl+H | ⌘F **[H]** / **⌃H [M-H]** | ✅ 27631/27638 (both open the shared card) | ✅ engine · ⚠ **cap shows ⌘H = macOS Hide App** |
| Print | Ctrl+P | ⌘P **[H]** | ➖ n/a (no print) | n/a |

### 1g. Number ENTRY parity

| Typed | Excel result | Engine | Verdict |
|---|---|---|---|
| `5%` | `0.05`, Percent 0-dec | `{value:0.05, fmtStyle:'percent', decimals:0}` (probe 20) | ✅ |
| `$1,000` | `1000` as a **number**, Currency format | ❌ `{value:"$1,000", txt:true}` — stored as **text** (probe 21) | **❌ WRONG** |
| Type over a range | fills only the anchor cell; Enter walks inside the selection | ✅ probe 17 (7 → E4 only; Enter → E5) | ✅ |

---

## 2. WHY THE MAC CHORDS BREAK — the architectural root cause

`hkMacAdapt` (index.html:**26947-26972**) is a *modifier collapse*:

```js
let key=ev.key, ctrl=!!ev.ctrlKey||!!ev.metaKey, alt=!!ev.altKey;   // 26949  ← ⌃ and ⌘ become ONE bit
...
if(ev.metaKey && !ev.altKey && !ev.ctrlKey && key.toLowerCase()==='t'){ key='F4'; ctrl=false; }  // 26958
else if(ev.ctrlKey && !ev.metaKey && !ev.altKey && key.toLowerCase()==='u'){ key='F2'; ctrl=false; } // 26959
return { ... metaKey:false, ... }                                    // 26961
```

Consequences, each proven above:
1. **⌃ and ⌘ are indistinguishable downstream.** Every Mac chord whose meaning depends on
   *which* one is held is unrepresentable. `⌃⌘V` (Paste Special) therefore arrives as plain
   `Ctrl+V` and does a silent, formatting-carrying full paste (probe 03) — the single most
   destructive misfire in the table for a modeller.
2. **26958 does not exclude Shift**, so `⌘⇧T` — real Mac Excel's AutoSum — is rewritten to a
   bare `F4` that no handler claims outside edit mode. Dead (probe 01).
3. `26959` likewise does not exclude Shift, so `⌃⇧U` becomes `F2`.
4. A **second, independent copy** of the same Mac logic lives in `echoMatch`
   (index.html:**29439-29452**) for the guided/echo layer. It differs in detail (its ⌥
   recovery only fires when `key.length===1 && !/[A-Za-z0-9]/`). Two adapters that must be
   kept in sync = a latent divergence. **P2, read-only.**

---

## 3. CHORDS THE PLATFORM STEALS BEFORE THE ENGINE SEES THEM

`MAC_DESIGN.md` §Stage 1 says of ⌘T: *"note ⌘T IS interceptable in fullscreen and mostly
outside it — needs device testing."* That optimism is misplaced **[H]**:

| Taught cap | Who takes it | Effect mid-drill |
|---|---|---|
| **⌘T** (= F4 anchors, the flagship Mac mapping) | **Chrome/Edge reserved** — `preventDefault()` does not stop it outside fullscreen | **new browser tab opens**, run abandoned |
| **⌘⇧T** (Mac AutoSum) | Chrome reserved (reopen closed tab) | reopens a tab; engine no-op anyway |
| **⌘Space** (what the reference shows for select-column) | **macOS Spotlight** — never reaches any browser | Spotlight opens over the sheet |
| **⌘H** (what the reference/keycaps show for Find & Replace) | **macOS Hide Application** | the whole browser hides |
| **⌘\`** (reference's show-formulas after the blind swap) | macOS "cycle windows" | window switch |
| ⌘W / ⌘N / ⌘Q | Chrome/macOS reserved | not used by the engine — fine |

The engine already *accepts* the safe alternates (`fn+F4`, `⌃Space`, `⌃H`) because of the
ctrl/meta merge — but **nothing tells the Mac player that**, and the reference and the
in-game keycaps actively teach the stolen ones. `hkMacPopup` (themes.js:**2695-2717**)
teaches ⌘=Ctrl, ⌥-ribbon, ⌘T, ⌃U and the fn setting; it never mentions ⌘T's browser
collision, ⌘Space, ⌘H, ⌘⌃V or ⌘⇧T.

---

## 4. THE RIBBON QUESTION — does the Mac player have a route at all?

**In the simulator: yes, for everything.** `hkMacAdapt` recovers ⌥-dead-characters from
`e.code` (26951-26956) and `mode==='ribbon'` reads codes, so every `Alt H …` / `Alt A …` /
`Alt E S …` walk is drivable with ⌥ — proven by `e2e-mac-input.js` §B (tap-⌥ AND held-⌥ with
the real `˙ ˚` dead chars). **No drill is unplayable on a Mac.**

**In real Excel for Mac: unverified, and I cannot corroborate the claim the build rests on.**
`MAC_DESIGN.md` asserts Alt/Option **KeyTips shipped in Excel for Mac** (beta Aug 2024,
"verified 2026-07"), and the whole A-primary decision, the popup's *"same letters as Windows
Alt and Mac Excel's new KeyTips"*, and the reference's `⌥→H→B→O` caps all depend on it.
**I rate that [L] and flag it as the single highest-leverage unknown in this audit.** My
knowledge of Excel for Mac is that there are no Alt-key KeyTips and the keyboard route to the
ribbon is ⌃F2 / F6 to focus it, then arrows — not letter walks. This is a claim to settle on
a real MacBook before any further Mac copy ships, because:

- The engine has **no dialog fallback**. `Ctrl+1` (index.html:**23506-23516**, `FMT_OPTS`) is
  number-formats-plus-center-across only — `G N C P X D S M E K A`. There is **no Border tab,
  no Alignment tab, no Font tab**, which is exactly the route a Mac user would fall back to in
  real Excel (⌘1 → Border/Alignment). So borders, alignment, indent, fill colour, font colour,
  font size, wrap, autofit and cell styles are **ribbon-walk-only** in this engine.
- **18 drills** carry an Alt-walk as their canonical reference chord (`refmap.js:3`):
  `filldr · pastes · blocksel · rowops · modeltour · decimals · center · autofit · ruleoff ·
  combo · gauntlet · fxconvert · sort · scrub · filterpass · unhide · lookup · series`
  (plus `ruleaudit` and `typeset`, which name walks in their own copy).

If KeyTips do NOT exist on Mac, those 18-20 drills teach a motion the student cannot reproduce
in their own Excel, and the engine gives them nothing else. That is the honest-labelling risk
Wolf's doctrine ("train for the desk, say the quiet part") was designed to manage — but the
current copy says the opposite of a caveat: it says the same letters work.

---

## 5. reference.html — every row that lies

`macCap()` (reference.html:**329-334**) is a **blind three-token glyph swap**: `ctrl→⌘`,
`alt→⌥`, `shift→⇧`. It knows nothing about Excel for Mac. `hkMacChord()`
(themes.js:**2674-2679**) does the same for in-game keycaps. MAC_DESIGN Stage 3 promised
*"the true Mac Excel binding next to each chord"* — that was never built.

Rendered Mac view (dumped live from :8802/reference.html with `hk_ref_mac=1`):

| reference.html | Mac cap it renders | Real Mac Excel | Severity |
|---|---|---|---|
| :203 `Ctrl+Space` select column | `⌘+Space` | **⌃Space [H]** — ⌘Space is Spotlight | **P0** |
| :259 `Ctrl+Alt+V` Paste Special | `⌘+⌥+V` | **⌃⌘V [H]** | **P0** |
| :220 `Alt+=` AutoSum | `⌥+=` | **⌘⇧T [H]** — ⌥= is not a Mac Excel chord | **P0** |
| :225 `Ctrl+\`` show formulas | `⌘+\`` | **⌃\` [M-H]** — ⌘\` cycles macOS windows | **P0** |
| :209 `F2` edit | `F2` (unchanged) | ⌃U or fn+F2 **[H]** — no alternate shown | **P1** |
| :217/:223 `F4` | `F4` (unchanged) | ⌘T or fn+F4 **[H]** | **P1** |
| :216 `Alt+Enter` line break | `⌥+Enter` | ⌥Return **[M]** — but **the engine commits instead** | **P1** |
| :223 `F4` repeat last action | — | Excel-true, **engine no-op** | **P1** |
| :268 `Ctrl+9` hide rows | `⌘+9` | ⌃9 **[M]** | P2 |
| :240-245 `Ctrl+Shift+$ % ! ~ #` | `⌘+⇧+$` … | ⌃⇧$ … **[M-H]** | P2 |
| :197 `Ctrl+Page Up/Down` sheet | `⌘+Page Up` | ⌥→ / ⌥← **[M]** | P2 |
| :269 `Ctrl+A>Alt>H>O>U>O` | **`Ctrl+A→⌥→H→O→U→O`** | the first cap stays *Windows* — `macCap` only matches `^ctrl$`, and this spec's first `>`-segment is the literal string `Ctrl+A` | P2 cosmetic bug |
| :191/:192 "compact keyboards: **Ctrl**+Fn+←" | plain text, not a `.cap` → never swapped | reads Windows inside the Mac view | P2 |
| Macabacus / FactSet sections (built from `HOTKEY_PLUGIN_LAYERS`, reference.html:296-303) | `⌘+⌥+A`, `⌘+⇧+1`, `⌘+⌥+⇧+K` … | **both add-ins are Windows-COM only [M-H]** — there is no Mac build to press these in | **P1 lie** |

Rows that are **Excel-true but engine-absent** (fair for a public *Excel* reference, but they
have no `practice →` link and no engine route): `Ctrl+Shift+#`, `Ctrl+\``, `F4` repeat,
`Ctrl+P`, `Ctrl+Page Up/Down`, `Alt+Enter`. I do **not** score these as lies; I score them as
the honest gap list.

---

## 6. RANKED FINDINGS

### P0 — wrong chord · no Mac route · the public table lies

| # | Finding | file:line | Evidence | Fix | Effort | Auto-fix safe? |
|---|---|---|---|---|---|---|
| P0-1 | **⌃⌘V (Mac Paste Special) silently does a full paste** — formulas + formatting land on the model | index.html:26949 (merge), 27596 (the Ctrl+Alt+V branch it should reach), 27615 | probe 03: `dialog=null`, dest carries value+comma+blue | Preserve the raw meta/ctrl split in the adapter (add `rawMeta`/`rawCtrl` fields) and route `metaKey&&ctrlKey&&V` to the 27596 paste-special branch | S | **yes** — additive branch, cannot regress Windows |
| P0-2 | **⌘⇧T (Mac AutoSum) is dead** — rewritten to an inert bare `F4` | index.html:26958 | probe 01: cell + editBuf unchanged | Exclude `ev.shiftKey` at 26958, and map `⌘⇧T` → the Alt+= autosum path (27468) | S | **yes** |
| P0-3 | **reference.html's Mac column is a blind glyph swap**, not Mac Excel — ⌘Space (Spotlight), ⌘⌥V, ⌥=, ⌘\` | reference.html:329-334 · rows :203, :259, :220, :225 | live DOM dump, §5 | Add a per-row `mac:` override field to `DATA`; `macCap` falls back to the swap only when absent | M | no — needs Excel-for-Mac facts checked on device |
| P0-4 | **⌘T (the taught F4 mapping) and ⌘⇧T are browser-reserved** — a new tab opens mid-drill | index.html:26958 · themes.js:2695 (popup that omits it) · MAC_DESIGN.md Stage 1 | Chrome reserves ⌘T/⌘⇧T outside fullscreen **[H]**; the engine's `preventDefault` at 27065 cannot help | Teach `fn+F4` as the *primary* Mac anchor cap; add the warning to `hkMacPopup`; keep ⌘T as the fullscreen-only alternate | S (copy) | **yes** — copy-only |
| P0-5 | **In-game keycaps teach ⌘Space (Spotlight) and ⌘H (Hide App)** | themes.js:2674-2679 `hkMacChord` (`ctrl+ → ⌘` blanket) · used at index.html:25927, 29291 | live: `Ctrl+Space` renders `⌘Space` | Exception table in `hkMacChord` — `Ctrl+Space→⌃Space`, `Ctrl+H→⌃H`, `Ctrl+\`→⌃\``, `Ctrl+9/0→⌃9/0`, `Ctrl+Shift+<num-fmt>→⌃⇧…` | S | **yes** |
| P0-6 | **KeyTips-on-Mac is unverified and load-bearing**; if false, 18-20 ribbon drills have no real-Excel route and the engine has no ⌘1 fallback (`FMT_OPTS` is numbers-only) | dev/MAC_DESIGN.md §"The core problem" · index.html:23506 · refmap.js:3 | §4 | Device-verify on Excel 365 for Mac. If absent: rewrite the popup/reference caveat, and add Border/Alignment tabs to the Ctrl+1 dialog as the Mac route | M-L | **no** — needs a human with a Mac |

### P1 — a chord Excel users reach for, missing or wrong

| # | Finding | file:line | Evidence | Fix | Effort | Auto-fix? |
|---|---|---|---|---|---|---|
| P1-1 | **Ctrl+Shift+V / ⌘⇧V pastes All, not Values** (Excel 365 **[M]**) | index.html:27615 (no shift guard); 27613 gates it to Macabacus | probe 07: dest formula `=D8` | Make `shift+V` → `doPaste('values')` on the native profile too | S | yes |
| P1-2 | **Tab-Enter home is missing** — Enter after a Tab run does not return to the start column | index.html:27520 (`Tab` move) / 27517 (`Enter` move) | probe 18: B4→Tab→Tab→Enter = **D5**, Excel gives **B5** | Latch `S.tabHomeCol` on the first Tab after a commit; clear it on any non-Tab move; Enter honours it | M | yes — additive |
| P1-3 | **Alt+Enter commits instead of inserting a line break** — and reference:216 advertises it | index.html:27196-27198 | probe 11 | Either implement `\n` in `editBuf` + wrap render, or drop the row from reference.html | M / S | the *reference* half is safe |
| P1-4 | **`$1,000` is stored as text**, so a currency-entry beat is ungradable | number-entry path, `startEdit`/`commitEdit` | probe 21: `{value:"$1,000", txt:true}` | Extend the `5%` autocorrect to strip `$` and `,` → number + `fmtStyle:'currency'` | M | yes |
| P1-5 | **Shift+F2 opens Edit, not a comment** | index.html:27275 (F2 branch, no shift guard) | probe 34 | Add `&& !e.shiftKey` and route Shift+F2 to the `cmt` flag the model already has (28429 proves the deck expects it) | S | yes |
| P1-6 | **F4 = repeat-last-action is missing** while reference:223 claims it | index.html:27210 (F4 only while editing) | probe 14: bold does not repeat onto D5 | Record the last `applyRibbon`/format op and replay it | M | yes |
| P1-7 | **Ctrl+\` show-formulas missing on the grid** (rapid-fire deck has it) | index.html:28400 (RF only) | probe 13 | Add a `fxView` toggle to render | M | yes |
| P1-8 | **Ctrl+; / Ctrl+Shift+; missing** | — | probe 08 | Add to the ctrl block (27404+) | S | yes |
| P1-9 | **Ctrl+Shift+8 (current region) missing** although Ctrl+Shift+Space is wired | index.html:27432 | probe 09 | Alias `*`/`8`+shift to the same `regionAround` path | S | yes |
| P1-10 | **Macabacus/FactSet rows render Mac caps** though neither add-in runs on Mac **[M-H]** | reference.html:296-303 | live DOM dump | Suppress the platform swap (or badge "Windows only") for `pro` sections | S | yes |
| P1-11 | **⌘⇧F (Mac AutoFilter) does nothing** | index.html:27609 (`shift && l` only) | probe 15 | Accept `shift+f` as the filter toggle when `HK_MAC` | S | yes |

### P2 — nuance

| # | Finding | file:line | Evidence | Note |
|---|---|---|---|---|
| P2-1 | **Backspace on a range clears the whole selection** — Windows Excel clears the active cell only and enters Edit **[H]** | index.html:27282-27287 | probe 05 | Accidentally *Mac*-correct. If fixed, gate it on `!HK_MAC` |
| P2-2 | The dedicated Backspace branch at **27528-27532** (which *does* implement the Windows semantics) is **unreachable while `mode==='normal'`** — 27282 catches it first. Behaviour therefore silently differs by `mode` | index.html:27282 vs 27528 | source-read + probe 05 | Dead-ish code whose comment describes behaviour the engine does not exhibit |
| P2-3 | Two independent Mac adapters must stay in sync | index.html:26947 vs 29439 (`echoMatch`) | source-read | Extract one helper |
| P2-4 | Ctrl+Shift+#/@/^/& are grid no-ops (RF-deck only) | index.html:28386-28402 | probe 32 | Deck ↔ grid chord-surface drift |
| P2-5 | Ctrl+PgUp/PgDn switches **drills**, not sheets, and only in standalone | index.html:27119 | source-read | reference:197 describes Excel, engine does something else |
| P2-6 | `Ctrl+A→⌥→H→O→U→O` renders half-Windows in Mac mode | reference.html:269 + 329 | live DOM | `macCap` only matches `^ctrl$` |
| P2-7 | "compact keyboards: Ctrl+Fn+←" stays Windows inside the Mac view | reference.html:191-192, 200 | live DOM | the hint is not a `.cap` |
| P2-8 | `dev/e2e-*.js` hard-default to port **8791** and `playwright-core` is not vendored | dev/e2e-mac-input.js:6,23 · dev/e2e-audit-parity.js | had to `npm i playwright-core` | CI reproducibility |

### Confirmed CORRECT (do not touch)
Ctrl-arrow across blanks/islands/floor · Ctrl+Shift+arrow from inside vs edge · Ctrl+Space /
Shift+Space over the capped board · Enter/Tab/Shift variants · Ctrl+Enter fill · Esc in point
mode · F2 caret at end + Edit/Enter toggle · typing over a selection hits the anchor only ·
Delete clears contents not formats · undo granularity (one per commit) · marquee + Esc ·
cut-paste strips source formatting · pasted formulas re-base · Ctrl+D over multi-row · Alt+=
stopping at a blank · `#####` · text spill · Alt H B A (all) vs H B S (outside) · Ctrl+1 tabs
opening · `5%` → 0.05 · ⌘/⌃ arrows, ⌘C/V/X/B/I/U/D/R/S/Z/Y/A/F/1, ⌘T→F4, ⌃U→F2, ⌥ ribbon walks
with dead characters, ⌥↓ dropdown, ⌃⇧= / ⌘- insert-delete.

---

## 7. THE FIVE I WOULD FIX FIRST

1. **P0-1 — un-merge ⌃ from ⌘ in `hkMacAdapt` and give ⌃⌘V the Paste Special dialog.**
   (index.html:26949/26958) A Mac banker's most-used destructive chord currently overwrites a
   model with formulas and formatting, silently. One adapter field + one branch.
2. **P0-2 — make ⌘⇧T AutoSum** (exclude Shift at 26958, route to `autoSum()` at 27468). The
   flagship formula chord on Mac is a dead key today.
3. **P0-5 / P0-3 — stop teaching stolen keycaps.** Give `hkMacChord` (themes.js:2674) and
   `macCap` (reference.html:329) a real Mac-Excel exception table: ⌃Space, ⌃H, ⌃\`, ⌃9/0,
   ⌃⇧ number formats, ⌃⌘V, ⌘⇧T for Alt+=, and ⌃U / ⌘T (or fn+F2 / fn+F4) beside F2 / F4.
   A public chord table that sends a Mac user to Spotlight is the P0 with the widest blast
   radius — it is wrong on the marketing surface, not just in the sim.
4. **P0-6 — settle the KeyTips question on a real MacBook.** 18-20 drills and the popup's
   "one motion, every Excel" promise ride on it, and there is no ⌘1 fallback because
   `FMT_OPTS` (index.html:23506) has no Border/Alignment tabs. If KeyTips are absent, the
   honest fix is a caveat + Border/Alignment tabs in Ctrl+1 — not more ⌥ copy.
5. **P1-2 — Tab-Enter home.** Pure Windows parity, the single most-felt missing behaviour for
   anyone who types a row of assumptions; and it costs one latch.
