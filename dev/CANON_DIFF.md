# CANON DIFF — external Excel-training canon vs the hotkey.gg catalog
*(r171, T-G executed through the search layer. Direct fetch of WSO/WSP/
Macabacus/FE/fminstitute is 403-blocked by this environment's network policy —
every claim below is tagged [live] (surfaced in a July-2026 search summary) or
[canon] (stable, well-documented training material known to the model). A
future session with full egress should verify the [canon] rows and the plugin
default tables in HOTKEY_PLUGIN_LAYERS against the current cheat sheets.)*

## Sources consulted (search layer)
Wall Street Prep shortcuts + center-across-selection; Macabacus features/blog
(shortcuts, grouping, hidden-row removal); WSO forum threads + "never hide,
always group" guide; BIWS shortcuts lesson + modeling best practices; FE
Training 100+ shortcuts + error-free-model guides; FM Institute shortcut
sheet; ICAEW Financial Modelling Code + error-reduction series; FM Magazine
"3 types of checks"; Adventures in CRE; consulting-side: Management
Consulted, CaseCoach, Udemy consulting-Excel syllabi.

## 1. COVERED — canon items the catalog already trains (no action)
ctrl-arrow / ctrl-shift-arrow navigation and selection · shift/ctrl+space ·
ctrl+home discipline · F2 edit-in-place · fill down/right + series dialog ·
F4 anchor cycling incl. mixed anchors (anchor → dcfsens ladder) · paste
special values/formats/transpose, both dialog doors (Alt E S, Alt H V S) ·
values-only deck hand-offs · one-copy-many-pastes · comma/percent/currency/
decimals house style (Alt H K/P/9/0 + Ctrl+Shift+chords) · borders as grammar
(Alt H B walks) · blue-inputs convention + font color walk · autofit ·
row AND column insert/delete (ribbon + ctrl chords) · Alt+= autosum ·
sort via Alt A S · INDEX/MATCH one- and two-way · SUMIF rollups · COUNTIF
(engine) · scenario IF switches · roll-forwards/corkscrews · balance checks
as DIAGNOSTIC check rows [live: FM Magazine "checks" piece matches our
balance/balcheck/threestmt design] · sign conventions · stale links ·
hardcode hunting (audit/versionup) · show-formulas Ctrl+` sweeps ·
Ctrl+S reflex · 13-week/RX, S&U, comps, DCF/LBO/three-statement builds.

## 2. PARTIAL — trained as recognition only (rapid-fire), no classic behavior
Ctrl+F find · Ctrl+H replace · Ctrl+G/F5 Go To · Ctrl+1 Format Cells ·
Alt W F F freeze panes · Shift+F2 comment · Shift+F3 insert function ·
Ctrl+K hyperlink · Ctrl+Shift+L filter · Alt M P trace precedents ·
Ctrl+; today. → T-F (rapid-fire bridge deck) surfaces these NOW; T-D/T-E
give the top ones real grid behavior.

## 3. MISSING — canon-demanded, not in the product at all
| Item | Canon weight | Engine lift | Route |
|---|---|---|---|
| **Go To Special** (F5 → constants/formulas/blanks) — THE pre-ship hardcode hunt [live: WSP/FE] | very high | dialog + multi-region selection | T-D.1 |
| **Grouping** Shift+Alt+→/← (+ Alt+Shift+=/− expand/hide) — "NEVER hide, ALWAYS group" [live: WSO guide, Macabacus blog] | very high (IB convention) | row/col group model + collapse UI | T-E (promoted: now spec'd) |
| **Trace precedents as NAVIGATION** Ctrl+[ / Ctrl+] [canon] | high | jump-to-ref (refs already parsed) | T-D.2 |
| **Center Across Selection** via Ctrl+1, A, TAB, C, C — the never-merge rule [live: WSP page names the exact chord] | high | Format Cells dialog (alignment tab) | T-E |
| **IFERROR — used SPARINGLY** ("suppressing ≠ fixing") [live: FE] | med-high | evalFormula addition (small) | T-D.3 |
| **Circuit breaker for circularity** — a switch cell that zeroes the circular chain [live: multiple] | high realism, advanced | needs iterative-calc emulation | roadmap (design doc first) |
| **Hide/unhide Ctrl+9/0** — taught WITH the "prefer grouping" caveat [live] | med | small | T-E |
| **Filter Ctrl+Shift+L** on a header row | med (consulting) | filter state + row masking | T-E |
| **Gridlines toggle Alt W V G** [live: cited in shortcut lists] | low | view flag | T-E tail |
| **VLOOKUP** (legacy; still interview-tested) [canon] | med | evalFormula addition | T-D.3 |
| **SUMPRODUCT** (consulting multi-criteria staple) [live] | med | evalFormula addition | T-D.3 |
| **Pivot tables** (consulting canon #1) [live] | high for consulting | very large | strategic decision, not a drill |
| **Multi-sheet nav Ctrl+PgUp/Dn** | med | engine is single-tab | roadmap |
| **Named ranges** | med | moderate | roadmap |

## 4. New-drill proposals — ALL SIX LIVE as of r188 (hunt r182, wirewalk r173,
## wrapfix r173, grpfold r179, center-across r177, rollup/SUMIFS r188 — the
## SUMPRODUCT idea shipped as SUMIFS, the tool a desk actually reaches for;
## SUMPRODUCT itself is in the engine for future use). §5 nuggets folded r188.
## (original list kept below)
1. **"The hardcode hunt"** (T-D.1): a shipped-looking model block; F5 →
   Special → Constants inside the formula region selects the buried
   hardcodes; relink or blue them. Canon's #1 audit ritual.
2. **"Walk the wire"** (T-D.2): a wrong output three links upstream —
   Ctrl+[ hop the chain, fix at the source, Ctrl+] back down.
3. **"Wrap it or fix it"** (T-D.3): two broken lookups — one deserves a fix
   (bad range), one deserves IFERROR with a labeled fallback. Teaches the
   sparingly rule, not blanket wrapping.
4. **"Fold the detail away"** (T-E): quarterly detail rows the MD doesn't
   want to see — group them (Shift+Alt+→), collapse, and the summary reads
   clean; hiding raw is the graded FAILURE (decoy check).
5. **"One header, no merge"** (T-E): center a title across the model columns
   via Ctrl+1 A TAB C C; merging is impossible in-engine, the prompt sells why.
6. **"Multi-criteria rollup"** (T-D.3): SUMPRODUCT over segment × region —
   the consulting counterpart to sumif.

## 5. Realism nuggets to fold into EXISTING drill copy (cheap, high flavor)
- balance/balcheck prompts can name the convention: checks read "OK/ERROR"
  on real desks; ours read zero — same idea, cite it.
- versionup/audit: mention Ctrl+` sweeps and F5-special as the "how the
  seniors actually find these" line once T-D lands.
- polish/housestyle: the never-merge line ("center across, never merge —
  merged cells break every fill and every sort").
- PLUGIN_LAYERS: our Macabacus/FactSet tables still match the canon lists
  surfaced today at the summary level; full verification needs egress.
