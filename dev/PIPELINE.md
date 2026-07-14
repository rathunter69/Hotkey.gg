# PIPELINE — the Fable task queue

## ⚡ STATE OF THE QUEUE (r188, July 2026 — read this first)
Every executable task below is DONE: T-A (all enrichment tranches + backlog
matrix), T-B (79 alts, full coverage), T-C, T-D (engine pack 1), T-E (engine
pack 2, minus deliberately-deferred items), T-F (dialog deck), T-J (voice),
T-K (onboarding v2). All six CANON_DIFF drill proposals are live. 78 drills,
parity 77, gate green at every push.
What remains, and what unblocks it:
1. **EGRESS SESSION** (next real milestone): Supabase live smoke test
   (accounts/leaderboards/desk RPCs are UNVERIFIED against prod — seeded desk
   codes stay held until green) + T-G canon verification remainder.
2. **WOLF DECISIONS**: T-H interview mode (dev/INTERVIEW.md awaits sign-off;
   a plain "go" starts the build) · T-I seasons (gated on DAU per STRATEGY).
3. **DEFERRED ENGINE** (build only when a drill concept demands it): Ctrl+0
   column hide (render surface), Alt H O H row height (needs a height model),
   SUBTOTAL(9) visible-aware math (pairs with a "total follows the filter"
   drill).
## WOLF PLAYTEST QUEUE — DONE r192 (sort warning live + alt entry; ctrl+arrow
## unreproducible, behaves Excel-correct, parity-armored, watching; Alt+= both
## forms live). Original spec kept below.
## (r192, specced from live feedback July 2026)
1. SORT WARNING dialog: single-column selection adjacent to data + alt a s d
   → Excel's "expand the selection?" prompt (E expand default / C current
   only / Esc). Expand = grow to the contiguous block, sort rows by the
   ORIGINAL active column. sortRange already row-sorts within selection —
   the warning is the missing guardrail. Sort drill gains the expand route
   as an alt; parity asserts both paths.
2. CTRL+ARROW early stop on the sort board (reported: lands 2-3 cells down,
   not at the bottom) — reproduce first; suspect sort's deep-cloned blank
   cells or prebuilt formatted-empties registering as content in nonEmpty().
   Fix at the jump primitive, parity-assert with formatted-empty cells.
3. ALT+= flow: (a) range-form — selection ending in empty total cell(s)
   fills committed SUMs with selection preserved (true Excel, the power
   move); (b) single-cell proposal — Enter-commit STAYS on the cell so
   bold/border follows immediately (Wolf's workflow ask). Re-measure
   foot/sort/gauntlet pars (keystroke counts drop).

Future-content seedbank: equity DISTRIBUTION waterfall (RoC/pref/catch-up/
carry — see REALISM_NOTES r181), RF per-category cycling via RF_CAT,
interview mode report-card stall coaching, plugin-floor display, in-cell
PARTIAL text formatting (would make the footnote flow fully Excel-real:
select "(1)" inside the cell, ctrl+1, superscript — engine has whole-cell
formatting only; big lift, queued for if formatting depth becomes a pillar).
*(r169. Wolf: paste any task block below into a fresh session as the opening
prompt. Each is self-contained; every task ends with the full gate from
dev/DRILL_DOCTRINE.md §4 and an AUDIT.md round entry. Order is priority order,
but T-A/T-B/T-C are independent. "Fable-grade" tags mark tasks that most
benefit from the strongest model; the rest are executable by any session that
follows the doctrine.)*

---

## T-A · ENRICHMENT SWEEP — TRANCHE 2 DONE r170, TRANCHE 3 DONE r181 (waterfall SIGNS fix + check merge, 21 labels to imperative, txncomps mult/date realism, 3 new ALTS — see AUDIT). Remaining suspects live in the backlog matrix below; grade by hand first.

## ~~T-A original brief~~  *(kept for method reference)*
> Read dev/DRILL_DOCTRINE.md and apply §5 (enrichment playbook) to these
> drills, in order: **cagr, lookup, lookup2, percent, bridge, autofit, saves,
> editfix, ribbon, format, drill (hardcode), transpose**. For each: grade by
> hand, apply the smallest upgrade that clears the doctrine, add an entry to
> the ALTS registry in dev/e2e-alt-paths.js (one order-permutation alt AND one
> chord-route alt where the engine offers one), replay ×3, par-sweep, retune
> par only if scope changed. Known specifics: cagr's three blocks are
> offset-cloned — re-site them; lookup/lookup2 should shuffle the query panel
> and force header-reading; percent's F4 story is good but its second block
> deserves a decoy; autofit still lacks a codename title; saves' review cells
> could carry a real work-op between saves; ribbon is 3 jobs on one page —
> consider a 4th family. Full gate, screenshots, AUDIT round, push.

## T-B · ALT-PATHS TO FULL COVERAGE — DONE r184 (77 alts, every drill covered;
navigation latch recorded as a by-design doctrine finding; harness caveat:
never use regex escapes inside moves template literals — they collapse before
eval). The harness has been in the standard gate since r169.

## T-C · MODELS-TIER REALISM AUDIT  *(Fable-grade)*
> Play every Models + Full Builds drill via replay AND read every prompt,
> label, and check as a former banker would. Hunt: wrong terminology, wrong
> sign conventions, wrong units, formulas a desk would never write, checks
> that a first-year would call fake. Cross-check each artifact against its
> real-world template (comps page, S&U, 13-week, debt schedule, waterfall
> tiers, acc/dil). Produce dev/REALISM_NOTES.md with per-drill verdicts, fix
> everything mechanical in the same round, queue anything structural.

## T-D · ENGINE EXPANSION PACK 1 — DONE (r173 IFERROR + trace jumps; r182 Go To Special: F5/Ctrl+G → S → O/F/K marks + Enter-walk + auto-unmark on fix + hunt drill). The pack is complete.

## ~~T-D original brief~~
> Three engine features the canon demands (doctrine §6), then a drill each:
> 1. **Go To Special**: Ctrl+G/F5 opens a minimal dialog (Special → Constants
>    / Formulas / Blanks) that sets a multi-region selection. Drill: "the
>    hardcode hunt" — F5-special constants inside a formula block, paint them
>    blue / relink them. This is THE pre-ship audit ritual (WSP/FE canon).
> 2. **Trace-precedent JUMP**: Ctrl+[ moves active cell to the first
>    precedent of the current formula (store refs at eval time), Ctrl+]
>    inverse. Drill: "walk the wire" — follow a broken number three hops
>    upstream to its source, fix it there, ctrl+home.
> 3. **IFERROR** in evalFormula + a triage-style drill beat ("wrap the
>    lookup, don't bury the error").
> Each: engine parity asserts in dev/e2e-audit-parity.js (new section), then
> drill per doctrine. Keep dialogs keyboard-only, Esc-safe, paint-armored.

## T-E · ENGINE EXPANSION PACK 2 — structure & view  *(any model, engine work)*
> ALSO (Wolf r176): explicit size dialogs — **Alt H O W** (column width) and
> **Alt H O H** (row height) as tiny keyboard-only numeric prompts, so sizing
> drills can teach SETTING a width rather than autofit roulette; pair with a
> 'set the print widths' beat in a future formatting drill.
> DONE r177 (Ctrl+1/Alt O E Format Cells), r179 (row grouping + grpfold),
> r180 (AutoFilter + filterpass), r185 (Ctrl+9/Ctrl+Shift+9 manual hide +
> Alt H O U R/O + Alt H O W width dialog + unhide drill — the group-first
> caveat IS the drill's story). REMAINING: Ctrl+0 column hide (needs hidden-
> column render/nav surface — bigger than it looks, low training value),
> Alt H O H row height (needs a row-height model the engine lacks),
> SUBTOTAL(9) visible-aware math so a future drill can grade "the total
> follows the filter". Each lands with parity asserts.

## T-F · RAPID-FIRE ↔ CLASSIC BRIDGE — DONE r186 (dialog-chords deck in the
picker, twelve ops; reference.html classic↔card map). Future idea only:
per-category cycling using RF_CAT (the map has existed since r143).

## T-G · SCRAPE-DRIVEN CONTENT REFRESH — PARTIALLY DONE r171  *(finish needs egress)*
> DONE via search layer: dev/CANON_DIFF.md (coverage diff, 6 new-drill
> proposals, grouping/center-across/circuit-breaker specifics, realism
> nuggets). REMAINING for an egress session: verify [canon]-tagged rows +
> HOTKEY_PLUGIN_LAYERS Macabacus/FactSet defaults against the live cheat
> sheets, and pull 2-3 WSO threads verbatim for voice/priority calibration.
> Original brief:
> WSO/WSP/BIWS block direct fetch through this proxy (403) but search-layer
> summaries work. From a session with egress: pull the WSP shortcut sheet,
> Macabacus shortcut manager defaults, BIWS "Excel shortcuts investment
> banking" lesson list, 2-3 WSO "favorite shortcuts" threads, one consulting
> source (Management Consulted / CaseCoach Excel). Diff every chord+workflow
> named against drills.js coverage AND the plugin layers in
> HOTKEY_PLUGIN_LAYERS (verify our Macabacus/FactSet defaults still match
> their current sheets). Output: dev/CANON_DIFF.md + new-drill proposals.

## T-J · CHECKLIST VOICE — DONE r183 (162 label instances across 42 drills,
inventoried exhaustively incl. the verbless-fragment class the earlier ~24
estimate missed; navigation's hotkey-notation labels kept by decision). Every
checklist on the site now opens with a verb.

## T-K · INTERACTIVE ONBOARDING V2 — DONE r175 (do-it beats + why-card live; onboard audit 28). Remaining polish ideas only: a stopwatch chip with the real ms delta, and a mouse-ghost animation racing the chord.

## ~~T-K original brief~~
> Rebuild the post-landing intro as an interactive SELL, reusing the tour's
> spotlight mechanic but making the user DO things:
> 1. **The hook (do-it beat)**: spotlight the grid, "your mouse takes ~4s to
>    do this — your keyboard takes 1: press <ctrl+→>" — user actually presses
>    it, cursor flies, a stopwatch chip shows the delta. Then ctrl+b on a
>    title. Two real chords in the first 20 seconds.
> 2. **The why card**: one screen of product truth — bankers live in Excel
>    8h/day, keyboard pace is a hiring signal, this site drills exactly that
>    (tie to rank/boards). Numbers, not features.
> 3. **The map**: existing spotlight steps compressed to 3 (checklist,
>    guided mode/F1, drill map) — cut formula-bar and modes steps into
>    tooltips discoverable later.
> 4. Then the existing placement run (navigation) unchanged.
> Constraints: keyboard-only, Esc skips everything, input-gated per beat
> (tour guard already blocks stray keys — extend it to allow ONLY the asked
> chord during do-it beats), onboard audit extended to walk the new flow.
> Design sketch to Wolf via screenshots BEFORE wiring the flow as default.

## T-H · INTERVIEW MODE — DESIGN DOC DONE r181 (dev/INTERVIEW.md: daily-seeded
8-drill superday, 12-min wall clock, one attempt/skip allowed, report card w/
stall analysis, PRO-gated + free practice sittings, 3 open questions each with
a default). AWAITING WOLF SIGN-OFF — the build is a config-and-content round.

## T-I · SEASON REWARDS TRACK  *(PRO roadmap — dev/SEASONS.md exists)*
> Execute per dev/SEASONS.md once Wolf greenlights scope.

## Standing items (do NOT lose)
- **Supabase live smoke test** — FIRST session with egress: desks/assignments/
  school-tags RPCs against prod; seeded desk codes stay held until green.
- Par policy: parKeys = measured medians (sweep), par seconds = tuned; plugin
  overlays are a legal edge; "plugin floor" display remains queued.
- Cache-bump all 9 pages on shared-asset changes; AUDIT.md every push;
  fetch-first (parallel sessions!); force-sync claude/project-handover-80gboe.
- Model ID never in commits/PRs/code artifacts. Stripe stays TEST MODE.

## Enrichment backlog matrix — FULLY DISPATCHED as of r187 (tranches r170/r181/r187; ribbon's flag was stale, resolved r170). Kept below for the historical record.
## (r169 snapshot — suspects, grade by hand first)
key        | flags (proxies only — margin/cagr/editfix "0 checks" = .map()-generated, fine)
-----------|------------------------------------------------------------------
cagr       | offset-cloned blocks, no codename
lookup     | no codename, static query panel
lookup2    | no codename, thin body
percent    | strong lesson, thin surroundings, no codename
bridge     | static layout (B2:F4 fixed)
autofit    | no title row
saves      | beats are save-only, could carry real work between
editfix    | good bones; typo pool could widen
ribbon     | 3 jobs, could take a 4th family
format     | no codename; overlaps decimals drill — differentiate or merge
drill      | good; ESV-onto-itself could add a decoy link
transpose  | fine after r168 aha; lowest priority
