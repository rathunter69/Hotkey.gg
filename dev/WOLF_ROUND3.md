# WOLF PLAYTEST ROUND 3 — spec (July 2026, from live feedback)
*(Wolf: "don't anchor on the exact things I'm saying — understand the general
idea." The idea, distilled: formatting drills need DESK DEPTH — many small
real ops per pass, negatives in (parens), imperative energy, no four-keystroke
wins — and every mechanic should be exercised at its full range now that the
engine has it.)*

## ENGINE PACK 3 (build first — r193)
1. **Italic** — cell flag `it`, Ctrl+I + ribbon Alt H 2, render `font-style:italic`.
2. **Strikethrough** — cell flag `strike`, Ctrl+5 (Excel's chord), render line-through.
3. **TODAY()** — evalFormula fn returning the Excel serial for today (checks must
   grade the FORMULA STRING, never the value — replay determinism).
4. **Range OUTSIDE border** — engine gains `bl`/`br` edge flags; Alt H B O now
   applies the PERIMETER of the selection (top edge cells get bt, bottom bb,
   left bl, right br) instead of per-cell box. Alt H B A (all) unchanged.
   Render + CSS for bl/br.
5. **Paste-op Divide** — `I` in the operation group (Excel accelerator).
6. NOT this round (recorded): font size/family — needs a text-metrics pass
   (neededWidth, fit-sweep, spill) — queue if formatting depth becomes a pillar.

## DRILL REBUILDS
Tranche A (r193, rides the engine pack):
- **modeltour "Chase the marks" v2** — make the CALCULATE intent explicit:
  prompt + req name the arithmetic; the fixed cells get bold+top-border dress
  beats so the filled-in cells visibly complete the page; costs NEGATIVE per
  convention; add a formatting pass (bold GP/EBITDA/NI rows + top border +
  dollar format).
- **filldr "Fill down, fill right" v2** — full rework, three beats:
  (1) reference another row (=B4) and fill ACROSS — pulling data;
  (2) write one SUM and fill DOWN;
  (3) 2D block fill (select the rectangle, ctrl+r then ctrl+d or the reverse)
  — "filling out a table" is the story. parKeys was 2 (!); expect ~25.
- **undo v2** — coherent story: do real work per checklist (format a block,
  delete a stale row), then the twist beat: "the VP wants the cut BACK —
  ctrl+z until it returns, then redo your formatting if it went with it".
  Grade end state + undoN/redoN latches. (Wolf's randomized-trick idea noted;
  deterministic version first — random reverts fight the checklist metaphor.)
- **autofit v2 "Fix the squeezed columns"** — autofit ONE ragged block, then
  UNIFORM width (Alt H O W → 12) across a selection for the print block —
  the drill now teaches when autofit is WRONG (uneven columns = bad habit,
  Wolf's exact point).
- **NEW drill "typeset" (Formatting)** — Wolf's "Bold the column" wish-list:
  bold the header row, UNBOLD a wrongly-bolded body row, italicize the memo
  lines (ctrl+i), strike the dead line item (ctrl+5), stamp =TODAY() in the
  as-of cell. Pure new-surface showcase.

Tranche B (r194):
- **pastes "Alt E S everything" v2** — ranges not cells: paste VALUES over a
  row, paste FORMATS to clone a row's dress, paste FORMULAS, then the ops:
  block ×100 via a copied reference cell (multiply), or normalize via divide.
  The floating dialog is the star now.
- **copyover v2** — blocks with moving pieces: copy a block, then per-column
  hand-offs, >4 keystrokes of real decisions.
- **editfix "Fix the typos in place" v2** — one text typo stays, plus: F2-audit
  a hardcode against the reference column next to it (fix the NUMBER), and a
  formula whose range is one row short (F2, fix the ref). "In place" = the
  F2 discipline across text, numbers, and refs.
Tranche C (r195):
- **polish v2** — a real model fragment: multiple header rows, per-row dress
  (bold the numbers row, money format, date row as Mmm-yy), each row different.
- **format "Fix the formats" v2** — percent row, date row, (paren) negatives,
  italic %-of-revenue lines (new engine), one-chord-per-row randomized wider.
- **dress v5** — outside border around the OUTPUT TABLE (new perimeter op)
  instead of the single-cell box; "paint blue" copy → "make the font blue";
  final voice sweep on its labels.
- Cross-drill sweep: costs negative + (parens) everywhere a P&L fragment
  appears; par re-measures for every rebuilt drill; alts updated per rebuild.

House rules apply every round: hand-grade against DRILL_DOCTRINE, alts prove
no railroad, pars re-measured 21-seed foreground, full gate, AUDIT entry.
