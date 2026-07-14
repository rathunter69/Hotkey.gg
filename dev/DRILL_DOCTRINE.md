# DRILL DOCTRINE — how hotkey.gg drills are designed, built, tested, and enriched
*(r169. The canonical methodology. Written while Fable was on the desk so any
future session — any model — can execute the same quality bar. If a rule here
conflicts with older notes in AUDIT.md, this file wins.)*

---

## 1. WHAT A DRILL IS

A drill is a **60-second story about a real desk moment** where keyboard skill
is the difference. Not "format these cells" — *"the VP marked four broken cells
and the meeting is in two minutes."* Every drill must answer three questions:

1. **Whose sheet is this?** (a codename deal, an opex build, a comps page — a
   REAL artifact with a title row, labeled rows, headers, units)
2. **What went wrong / what's needed?** (the story: a stale DRAFT column, a
   pasted block with dead formatting, a missing quarter)
3. **What is the ONE thing the player can name afterward?** (the `aha` field —
   mandatory on every drill, surfaced on the results card)

## 2. THE FIVE DOCTRINES (all mandatory)

### 2.1 Density Doctrine
The tab must look inhabited. Minimum: bold title row (usually
`codename() + ' — <artifact> (<units>)'`), labeled rows/columns, realistic
values with correct `fmtStyle`/`decimals`, blue `fontColor` on inputs.
Randomize **content and sites** (positions from a spot pool, label pools via
Fisher-Yates `pick`), never lazy offset-blocks. A drill body under ~2.8k chars
or with <4 `rnd()` calls is suspect — grade it by hand.

### 2.2 Freedom Doctrine (anti-railroad)
**req/guide teach the chords; checks grade the END STATE.** The player may
solve in any order, by any legitimate route (ribbon walk vs Ctrl chord, dialog
via Alt E S vs Alt H V S, typed `$` vs F4, pointer vs typed refs). Exceptions —
the only places a check may demand *how*:
- **live formulas** (`c.formula` truthy + value parity) when "don't hardcode
  the answer" IS the lesson (foot, comps, versionup)
- **anchored refs** (formula text contains `$B$2` etc.) when anchoring IS the
  lesson (filldr, percent, anchor, dcfsens)
- **engine latches** (`S.undoN>=1`) when the technique is unobservable in the
  end state (undo). Add latches to the engine rather than scripting the path.
Never check "used chord X" any other way. Never write a leave-untouched
*promise* in the prompt without a check that grades it (the polish bug class).

### 2.3 Mix Rule
≥3 operation families per drill (navigation / selection / formatting /
structural / formula / clipboard). Single-op drills are rapid-fire cards, not
classic drills.

### 2.4 Realism Rule
Terminology, conventions, and the *task itself* must be defensible to a
first-year IB/consulting analyst:
- **SIGNS (r174, global)**: expense/outflow line items CARRY THEIR SIGN —
  COGS, opex, capex, interest live as negatives so every subtotal is a
  clean SUM/+ down the column; never `A - B` against a positive cost.
  Exceptions: all-cost magnitude schedules (an opex detail table), flow
  rows explicitly labeled as paired gross flows (13-week receipts /
  disbursements), and %-of-revenue magnitude tables.
- dollars 0 decimals, multiples 1 ("8.2x", fmtStyle 'mult'), percents 1,
  dates Mmm-yy off Excel serials (fmtStyle 'date'); blue inputs / black
  formulas; rule totals (`bt`), never rainbow fills; long titles CENTER
  ACROSS SELECTION (ctrl+1 A — cell.ca), never merged; footnote marks via
  ctrl+1 F (superscript ¹ on the label)
- **FORMAT EMPHASIS (Wolf, r177)**: comma (alt h k) was over-indexed — on
  real desks plugins cycle number formats. Comma stays as the native
  baseline, but new formatting beats should reach for the FULL wardrobe:
  bold/colors/alignment discipline (numbers right, headers centered) and
  Ctrl+1 (or legacy Alt O E — Chrome reserves ctrl+digit) for multiples,
  dates, custom casts, footnotes
- artifacts from the actual workflow: comps, roll-forwards, S&U, 13-week,
  tie-outs, league tables, sensitivity grids, deck hand-offs (values only!)
- names from the house pools (codename() deals, Falcon/Atlas/Summit peers)
- the *reason* in the prompt must be the real desk reason ("the clipboard
  survives the first paste", "the auditors will ask for the memo")

### 2.5 Checklist Rule
2–4 checks, each an **IMPERATIVE COMMAND in associate voice** naming the
artifact and the cell/range: `'bold the survivor's header — E2'`,
`'delete the whole DRAFT column — let the table close the gap'`. Never a
state description ("the header IS bold") — the checklist is a markup you
work THROUGH, not a report you read after (Wolf, r174). A check the player
can't act on from its label alone is broken.
**No do-nothing lines** (Wolf, r175): a check whose entire fix is "don't
touch it" cannot stand alone. Fold don't-touch guards into the `ok` of the
action check they protect ("comma-format the block — and ONLY there"),
so every visible line demands a discrete action or a graded outcome.
Checks must be self-contained given S (never read globals that reset).

## 3. BUILD PROTOCOL (mechanics)

- **Anatomy**: `CHALLENGES[key] = { name, label, par, parKeys, aha, prompt,
  req(), guide(), targets(), demo(), build(), checks(S) }` in index.html +
  drills.js wiring (groups placement, meta {name,label,tab,desc}, HOTKEY_PARS).
  Campaign chapters are VERSIONED — never add new drills to old chapters.
- **Edit method**: python splice scripts with exact-string anchors +
  `assert src.count(anchor)==1`, written to the scratchpad and executed —
  never hand-edit big blocks, never trust an Edit on `\uXXXX`-escaped source.
- **Geometry**: when multiple islands/tables share a page, prove no
  keyboard **ride-through**: contiguous non-empty cells let Ctrl+Shift+arrows
  cross into a neighbor. Cap island heights / keep a blank row+column moat
  between regions, in BOTH axes (the blocksel r167 bug class). Destination
  rects must be pairwise-disjoint (`rect`/`hits` helpers, r58 class).
- **Engine surface** (what classic drills may use): ribbon tree in `MENUS`
  (H/HV/HI/HD/HO/HB/HU/HA/HF/HFI/M/A/E paths), Ctrl chords, F4 `cycleAnchor`
  (4 states, typed + pointer + range), Alt+= `autoSum` (needs ADJACENT numbers
  above or left — no gap), Ctrl/Shift+Space, paste kinds
  (all/values/formulas/formats/valuesnum/colwidths/transpose; relative refs
  translate on paste since r154), fills (Ctrl+D/R + HFID/HFIR + HFIS series),
  formula functions: SUM AVERAGE MIN MAX ROUND IF ABS COUNTIF INDEX MATCH SUMIF.
  Anything else = engine task first (see PIPELINE.md).

## 4. TEST PROTOCOL (the gate — run ALL before any push)

Server: `(python3 -m http.server 8791 --directory /home/user/Hotkey.gg --bind 127.0.0.1 &)`
NODE_PATH=<scratchpad>/node_modules for playwright-core; Chromium at
/opt/pw-browsers/chromium-1194/chrome-linux/chrome.

1. **Syntax**: extract inline `<script>` blocks via python regex → `node --check`
   each + `node --check drills.js`.
2. **Scripted path**: `node dev/e2e-demo-replay.js [keys]` — new/changed drills
   first, then the FULL run (every drill ×3 seeds must WIN).
3. **Alternative paths**: `node dev/e2e-alt-paths.js` — the anti-railroad gate.
   *Every rebuilt or new drill MUST land ≥1 entry in its ALTS registry*: a
   different op order AND (where the engine offers one) a different chord
   route. An alt that fails means an overfit check or a missing engine route —
   fix that, don't delete the alt.
4. **Par calibration**: `node dev/e2e-par-sweep.js` — set `parKeys` to the
   measured median (the live keyLog metric: chords=1, demo selection uncounted).
   Par SECONDS are tuned difficulty (campaign ×1.5 gates, XP tiers) — never
   auto-adjusted; when a rebuild changes scope, retune par deliberately and
   mirror it in HOTKEY_PARS.
5. **Regression matrices**: e2e-audit-parity.js, e2e-audit-onboard.js,
   e2e-audit-visual.js (needs 140ms settle), e2e-audit-rank.js, AND
   e2e-fit-sweep.js — no drill may LOAD showing ##### (numbers must fit
   their column widths; seed compact values or set colW in build; only
   autofit/combo/gauntlet squeeze on purpose).
6. **Eyes on it**: screenshot the drill fresh + mid-solve + the results card.
   If it doesn't look like a page from a real model, it isn't done.
7. Ship: cache-bump `?v=N` on all 9 pages when shared assets change, AUDIT.md
   round entry, commit to main, push, force-sync the handover branch,
   verify HEAD==FETCH_HEAD. **Always `git fetch origin main` FIRST** —
   parallel sessions exist.

## 5. ENRICHMENT PLAYBOOK (how to upgrade an existing drill)

Grade first, cut second. The machine matrix (aha? codename? rnd count? check
count? body length?) finds *suspects*; read the drill before sentencing —
"thin" proxies mislead (margin looked weak, was actually fine). Apply the
smallest upgrade that clears the bar, in this order:
1. missing aha → write it (one nameable insight, lowercase, em-dash voice)
2. broken promise → add the missing check (decoys, leave-untouched)
3. bare page → title row + labeled context around the task
4. single beat → add ONE second beat that deepens the same lesson (foot:
   typing SUMs → Alt+= everywhere; copyover: +values-only hand-off) — beats
   that change the lesson belong in a NEW drill instead
5. fixed layout → spot pools + content randomization (mind §3 geometry)
6. wrong-chord teaching → make the canonical desk chord the primary path
Then: replay, ALT entry, par sweep, retune par if scope changed.

## 6. WHAT THE CANON SAYS (research notes, July 2026)

From WSP/WSO/Macabacus/BIWS/FE-ICAEW sweeps — the external consensus on what
finance Excel training drills, vs our coverage:
- **Covered well**: ctrl-arrow navigation, fill+anchor discipline, paste
  special (values/formats/transpose), formatting to house style, footing &
  tie-outs, roll-forwards, scenario IFs, INDEX/MATCH, SUMIF, sensitivity
  grids with mixed anchors, sign/stale-link/hardcode auditing.
- **Named by the canon, missing here** (queued in PIPELINE.md): Go To Special
  (F5 → constants/formulas/blanks — THE model-audit trick), hide row/col
  (Ctrl+9/0 — teach WITH the group-first caveat), Ctrl+' copy-formula-above,
  VLOOKUP (legacy but tested), named ranges, multi-sheet nav (Ctrl+PgUp/Dn —
  engine is single-sheet), SUBTOTAL(9) visible-aware math to pair with the
  filter. LANDED since this sweep: trace jumps + IFERROR (r173), Ctrl+1
  Format Cells + center-across (r177), grouping (r179), AutoFilter
  Ctrl+Shift+L + Alt+↓ value picker + Alt A T (r180).
- Desk habits worth prompting in stories: "tick list you can resume when
  interrupted" (ICAEW), values-only deck hand-offs, F5-special hardcode hunts
  before shipping, one-formula-fills-the-grid pride.

## 7. VOICE

Associate voice, lowercase confidence, em dashes, no exclamation marks.
The prompt sells the stakes; the guide is a senior walking you through it;
the checks are the checklist you'd actually write on a sticky note; the aha
is what you'd tell the next intern. Never "click", never "please".

## 8. THE WOLF TEST (r193 — the playtest rubric, codified from live rounds)
Every drill must pass three questions, asked as a practitioner:
1. **Mechanics-sense** — does the story JUSTIFY each action? A checklist item
   with no narrative reason ("delete this, undo it" with no stakes) fails.
   The undo-v2 pattern is the fix: script the mistake so the mechanic is felt.
2. **Desk-mirror** — is this the literal motion a banker/consultant makes?
   Not "a use of the chord" but THE use: comma style flips costs to (parens),
   the sort warning appears when it would appear, Alt+E is the superscript
   key because it really is.
3. **Variety-density** — depth comes from ADJACENT ops in the same vein
   (bold + unbold + italic + strike + stamp), never one chord repeated.
   A drill solvable in <10 keystrokes that isn't a navigation/reflex drill
   is presumptively thin. A demo that is one chord family is presumptively
   a card, not a drill.
Proxies that would have caught the r193 rebuild class earlier: parKeys<10
outside Foundations-reflex; single-op-family demos; boards with zero
formulas; checks that grade one property. Sweep the set against these
whenever the rubric changes, not drill-by-drill on complaint.

### §8.1 addendum (Wolf, live) — two tests the rubric under-weighted
4. **Do the beats CHAIN?** Density is integration, not itemization: the best
   drills make each action change what the next one operates on (transpose
   lands the block → multiply flips it → the earlier comma pass now shows
   parens). A five-beat drill whose beats are order-free chores passes §8.3
   but misses the vibe — acceptable for pure-formatting showcases (typeset),
   never for Formulas/Data/Models drills.
5. **Does the win state look SENDABLE?** The board must end as an artifact —
   a page you'd actually hand over — not a scratchpad with five green checks.
   Boards of disconnected exercise blocks (autofit v2's two islands) are the
   tell; prefer one coherent page even when teaching a contrast.
Do not anchor on the owner's literal examples; they illustrate the vibe, they
don't bound it.
