# ENGINE ↔ EXCEL CAPABILITY AUDIT
*(r230. Wolf's reframe: "my hunch is you're building drills to the spec of what
functionality WE'VE built, not to the spec of what Excel has that bankers and
consultants use." He's right. This audit inverts it — it catalogues the Excel
Home-ribbon muscles the target users live in, marks what the engine has / partly
has / lacks, and lets THAT gap list drive engine work + drill depth. A drill
should never be shallow because the engine was; if a real desk muscle is missing,
we build the muscle, then the drills that need it get deeper for free.)*

---

## 0. THE PRINCIPLE

Build to **Excel's** spec, not the engine's. When scoping a drill, ask "what would
a banker actually press here?" first; if the engine can't do it, that's an ENGINE
gap to close, not a reason to shrink the drill. This audit is the running list of
those gaps, prioritized by how much drill depth each unlocks.

---

## 1. WHAT THE ENGINE HAS TODAY (r230)

**Cell model** (`blankCell`): value · formula · bold · **it** (italic) · **strike** ·
**uline** (underline, r229) · fill (**'blue' only**) · wrap · fmtStyle
(general/comma/currency/percent/mult) · decimals · **bt/bb/bl/br/ball** (top/bottom/
left/right/all-box borders — all render) · txt · align (**l/c/r horizontal only**) ·
fontColor (palette: black/darkgray/blue/red/green/purple/yellow/orange).

**Chords wired**: Ctrl+B/I/U · Ctrl+X/C/V · Ctrl+Z/Y · Ctrl+D/R (fill) · Ctrl+S ·
Ctrl+A · Ctrl+Space / Shift+Space (col/row select) · Ctrl+Shift+$/%/! (currency/
percent/comma) · Ctrl+Shift+~ (general) · Ctrl+5 (strike) · Ctrl+1 (Format dialog,
LIMITED) · Ctrl+G / F5 (go-to) · F2 (edit) · F4 (anchor) · Ctrl+[ / ] (precedents) ·
Ctrl+Shift+L (filter) · plugin layers (Macabacus/FactSet chords).

**Ribbon (Alt H …)**: 1/2/3 (bold/italic/underline) · K (comma) · P (percent) ·
9/0 (decimals) · B T/B/A (border top/bottom/box) · A L/C/R (align h) · H (fill →
blue) · W (wrap) · F C (font-color cycle) · I/D R/C (insert/delete row/col). Plus
Alt O E (legacy Format), Alt E S / Alt H V S (paste-special), Alt A S (sort),
Alt A J/H (group/ungroup).

**Dialogs**: Format Cells (`fmt`, number formats G/N/C/P/X only) · font-color
swatch cycle · paste-special · fill-series · sort-warning.

---

## 2. THE GAP MATRIX (Excel Home ribbon bankers/consultants use)

Legend: ✅ have · 🟡 partial / not exposed · ❌ missing. "Depth" = how much drill
richness closing it unlocks.

| Excel muscle | chord | status | notes / what's missing | depth |
|---|---|---|---|---|
| Bold / Italic / Underline | Ctrl+B/I/U · Alt H 1/2/3 | ✅ | complete (underline added r229) | — |
| Strikethrough | Ctrl+5 | ✅ | works | low |
| **Font size** | Alt H F S · grow/shrink Alt H F G/F K | ❌ | no `size` on the cell model at all | **high** |
| **Font family** | Alt H F F | ❌ | no `font` on the cell model | med |
| **Fill / shading COLOR** | Alt H H → picker | 🟡 | only **'blue'**; no yellow highlight, grey header shade, green, custom. Bankers shade headers/inputs/flags. "not elegant" (Wolf) | **high** |
| Font color | Alt H F C | 🟡 | 8-swatch **cycle**, not a visible dropdown; works but clunky (Wolf) | med |
| **Number format dialog (Ctrl+1)** | Ctrl+1 | 🟡 | only G/N/C/P/mult; **no date, accounting, custom (0.0,,"M"), scientific, fraction, text-format**. The banker's real number workhorse | **high** |
| Accounting format ($ aligned) | Alt H distinct | 🟡 | 'currency' exists but not the accounting variant (symbol left-flush) | med |
| Comma/Currency/Percent | Ctrl+Shift+!/$/% | ✅ | default 2-dec, trim with Alt H 9 — realistic | — |
| Decimals inc/dec | Alt H 9/0 | ✅ | works | — |
| **Increase / decrease INDENT** | **Alt H 5 / 6** | ❌ | no `indent` on the model; bankers indent sub-line-items constantly | **high** |
| Horizontal align L/C/R | Alt H A L/C/R | ✅ | works | — |
| **Vertical align T/M/B** | Alt H A T/M/C | ❌ | no vertical align on the model | low |
| **Wrap text** | Alt H W | 🟡 | EXISTS but undiscoverable / rarely used in drills (Wolf "don't see wrap") | med |
| Merge & Center | Alt H M | ⛔ | **deliberately excluded** (merge breaks fills/sorts; the "never merge" house rule is itself a lesson) | n/a |
| Borders — top/bottom/box | Alt H B T/B/A | ✅ | render | — |
| **Borders — L/R/outside/inside/thick/none** | Alt H B L/R/S/… | 🟡 | model has bl/br/ball; ribbon only exposes T/B/A. No outside-vs-all, no thick, no clear-border | med |
| **Clear** (all/formats/contents/comments) | **Alt H E A/F/C/M** | ❌ | only Delete = contents. No clear-formats (huge for a "strip the dead formatting" drill), no clear-all | **high** |
| Cell styles gallery | Alt H J / L | ❌ | Excel's named styles (Input/Calculation/Heading) — the FAST house-style path | med |
| Insert/Delete/Format cells | Alt H I/D/O | ✅🟡 | insert/delete row+col ✅; Format→row height/col width/autofit ✅(autofit); hide/unhide ✅ | — |
| Find & Replace | Ctrl+F / Ctrl+H | ❌ | no find/replace — a real cleanup muscle | med |
| Fill → Series / Justify | Alt H F I S | ✅ | series exists | — |
| Sort & Filter | Alt H S / Ctrl+Shift+L | ✅ | works | — |
| Freeze panes | Alt W F F | ❌ | not modeled (viewport is fixed) | low |
| Conditional formatting | Alt H L | ❌ | none; bankers use it for flags/heatmaps | low-med |
| **Comments / Notes** | Shift+F2 · Alt H E M to clear | ❌ | no comment layer | low |

---

## 3. PRIORITY — what to build, in order (each unlocks drill depth)

**Tier 1 — the elegance + depth unlock (do first).** These are the ones Wolf named
and they're the highest drill-depth-per-effort:
1. **Fill color as a real palette** (not just 'blue'). Add `fill` values
   (blue-input, grey-header, yellow-flag, green, red, none) + a discoverable
   Alt H H picker. Unlocks: house-style shading, input/flag conventions, the
   desk-theme feature (§5). *Also fixes "the way we set background colors isn't
   elegant."*
2. **Clear menu** (Alt H E A/F/C): clear-all / clear-formats / clear-contents.
   Unlocks a real "strip the dead formatting off this paste" drill and mirrors the
   Delete-vs-clear distinction bankers know.
3. **Indent** (Alt H 5/6 + `indent` prop, render as left padding). Unlocks
   proper sub-line-item structure in every P&L/schedule drill.
4. **Ctrl+1 number-format depth**: date, accounting, and the custom `#,##0,,"M"`
   scale format — the single most-used banker number muscle after comma.

**Tier 2 — realism polish.**
5. **Font size** (grow/shrink Alt H F G/K + `size` prop) — titles bigger, footnotes smaller.
6. **Font-color as a visible dropdown** (not a blind cycle).
7. **Border ribbon depth** (L/R/outside/inside/thick + a clear-border) — expose what the model already stores.
8. **Cell styles gallery** (Input/Heading/Calculation) — the fast house-style path.
9. **Find & Replace** (Ctrl+H).

**Tier 3 — nice-to-have / lower drill value.** vertical align · wrap discoverability ·
conditional formatting · comments · freeze panes.

**Explicitly NOT building:** Merge & Center (house rule: never merge — the *absence*
is a teachable convention).

---

## 4. HOW THIS CHANGES THE DRILL PASS

Each Tier-1/2 muscle, once built, deepens specific drills:
- **fill palette + clear + styles** → a real *house-style* / *clean-the-paste* drill
  (shade inputs blue, headers grey, strip a bad paste's formatting, apply the style).
- **indent + font size + Ctrl+1 formats** → every P&L/schedule drill gains the true
  banker finish (indented sub-items, a bigger title, scaled `$,,"M"` numbers, a date).
- **border depth** → the ruling drills (ruleoff / ruleaudit) get the full border
  vocabulary instead of just top/bottom.
So the sequence is: **build the Tier-1 muscles → re-pass the Formatting + Foundations
drills to USE them.** That's the deliberate, Excel-first order Wolf asked for.

---

## 5. PIPELINE ADDITION — DESK THEME COLORS IN DRILLS (Wolf, r230)

> "I'd like for desks to be able to set theme colours that are integrated into
> drills — background colours for certain cells, fonts, etc."

Concept: a **desk (team) sets a house palette** — input-blue, header-shade, total-rule,
title-font — and drills RENDER + GRADE against that desk's palette instead of the
generic one. So a Barclays desk trains on Barclays' blue; the "shade the inputs" beat
grades the *desk's* input color. Depends on Tier-1 fill-palette + font-size/family, and
on the existing team/desk model (T-teams). Design-first before building; big retention
+ B2B hook (desks buy the training that looks like their book). Queued in PIPELINE.
