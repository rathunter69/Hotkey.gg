# Game engine and learning content audit

Reviewed September 17, 2026, against source baseline
`434bc0e8764e741e0e11f84cf51d61a1755d7c67` and the preserved, uncommitted foundation tooling.
This report records evidence and proposed repairs. It does not authorize a curriculum rebuild.
The current decisions and work queue remain in `../PRODUCT.md` and `../CURRENT.md`.

## Main conclusion

The existing game engine is worth preserving. Its shipped solutions work, and the existing
checks cover a substantial range of keyboard behavior and alternative solutions. However,
passing those checks does not establish Excel accuracy or teaching quality. Independent probes
found incorrect formula answers and two advanced drills that accept disconnected answers as
live models. The first lesson also leads to a different next drill than the catalog does.

These are bounded repairs and teaching decisions. They do not justify replacing the whole app.

## What was actually checked

All browser work used a new, isolated Chrome profile against this checkout on loopback port
8791. A temporary Playwright preload blocked every browser request whose hostname was not
loopback, including Supabase, analytics and external fonts. No production data was written.

The Windows sandbox initially blocked Chrome startup with `spawn EPERM`; the same local tests
then ran with approved escalation. Runtime: bundled Node 24.19.0, Playwright 1.62.1, installed
Chrome 152. This is useful local evidence, not verification of the pinned Playwright 1.49.1 / CI
browser combination. The coordinator owns that installation and release-process review.

### Existing regression checks

| Check | Result | What this establishes |
|---|---|---|
| `dev/e2e-demo-replay.js`, `REPS=1`, whole catalog | All 74 catalog drills won; dormant `keyboardtour` skipped because it has no demo | Each authored solution reached completion on one randomized board |
| `dev/e2e-formulas.js` | 102 assertions passed | The formula cases already encoded in the suite work |
| `dev/e2e-audit-parity.js` | 189 assertions passed | Existing spreadsheet editing, clipboard and keyboard regression contracts work |
| `dev/e2e-guided.js navigation filldr pastes margin foot lookup dcf threestmt wacc` | 12 cases passed, eight drills with guide boundaries; includes three alternative `foot` routes | Sampled guided routes remain solvable and their guide boundaries contain the checked movements |
| `dev/e2e-alt-paths.js`, whole suite, three randomized builds per route | All 159 routes passed across 477 route executions | Alternative authored routes, including different operation order and ribbon/dialog routes |

The independent checks below failed even though the established formula and parity suites
passed. These results must remain separate in release reporting.

### Independent checks

- Loaded all 74 catalog entries and inspected their starting checks and teaching metadata.
  No required outcome was already complete on that single build of each drill. Only
  `navigation` declared integrated `steps` and `tutorial` metadata; none declared `lesson`.
- Evaluated common Excel edge cases in the real page's formula engine. See E1–E5.
- Used actual engine keyboard events to replace completed model formulas with constant
  formulas before pressing Save. `dcf` and `threestmt` still won; `wacc` rejected the control.
- Read representative beginner (`navigation`, `filldr`, `pastes`), intermediate (`margin`,
  `foot`, lookup routes) and advanced (`wacc`, `dcf`, `dcfbuild`, `threestmt`) content and graders.
- Traced the shared engine, completion, result, save, guide and generator contracts. This was
  not a line-by-line financial review of all 74 models or a manual beginner playtest.

## Confirmed defects and proposed repair checks

Priorities describe repair order: P1 means high priority before trusting the affected learning
behavior; P2 means a normal, scoped correction. None has been changed in this audit.

### E1 — P1: blank cells become zero in several statistical formulas

**Impact:** a learner can write a valid Excel formula and receive a different answer. Including
a blank row in a range can reduce an average or median and introduce a false minimum.

Set `A1=10`, `A2=20`, leave `A3` empty. The live engine returned:

| Formula | Hotkey.gg | Excel |
|---|---:|---:|
| `=AVERAGE(A1:A3)` | 10 | 15 |
| `=MEDIAN(A1:A3)` | 10 | 15 |
| `=MIN(A1:A3)` | 0 | 10 |

**Cause:** `index.html:23490` converts every nonnumeric range value to zero in the shared
`flat` helper. `index.html:23692`–`23696` then uses that list for the aggregate functions.
The existing tests mostly use filled numeric ranges and do not catch this distinction.

Microsoft documents that these functions ignore empty cells and text in referenced ranges:
[AVERAGE](https://support.microsoft.com/en-us/office/average-function-047bac88-d466-426c-a32b-8f33eb960cf6),
[MEDIAN](https://support.microsoft.com/en-us/excel/functions/median-function),
[MIN](https://support.microsoft.com/en-us/excel/functions/min-function).

**Repair acceptance:** distinguish range references from scalar arguments, preserve real zeros,
and handle each function's documented empty-input/error behavior. Cover blanks, labels, real
zero, positive/negative values and existing error sentinels. Re-run the existing formula suite
and affected model replays. Do not globally change `flat` without checking its logical-function
consumers.

### E2 — P1: INDEX can return a value outside its requested range

**Impact:** an incorrect lookup can appear valid and return an unrelated part of the sheet.

With `A1=10`, `A2=20`, `A4=99`, `=INDEX(A1:A2,4)` returned **99**, not `#REF!`.
`index.html:23505`–`23517` calculates a destination cell without checking the requested row
and column against the selected range. [Microsoft's INDEX contract](https://support.microsoft.com/en-us/excel/functions/index-function)
requires the index to stay within that range.

**Repair acceptance:** reject out-of-range row/column requests, including a populated cell
just outside a one-column, one-row or two-dimensional range. Keep valid text and numeric
lookups working. Explicitly decide the supported zero-index/array forms rather than letting
them silently read an unrelated cell.

### E3 — P2: negative half values round in the wrong direction

`=ROUND(-1.5,0)` returned **-1**, whereas Excel returns **-2**. `index.html:23698`
uses JavaScript `Math.round`, whose negative-half behavior differs from Excel.
Microsoft's examples also demonstrate the negative rounding rule:
[ROUND](https://support.microsoft.com/en-us/excel/functions/round-function).

**Repair acceptance:** test positive and negative ties, zero/positive/negative digit counts,
and decimal values susceptible to floating-point noise. Preserve `ROUNDUP` and `ROUNDDOWN`
behavior; those use a separate implementation.

### E4 — P2: supported lookup names silently use different argument rules

For ascending data `A1=10`, `A2=20`, `B1=100`, `B2=200`:

| Formula | Hotkey.gg | Excel |
|---|---|---|
| `=VLOOKUP(15,A1:B2,2)` | `#N/A` | 100 |
| `=MATCH(15,A1:A2,1)` | `#N/A` | 1 |
| `=VLOOKUP(15,A1:B2,2,TRUE)` | Parser exception `unexpected` | 100 |

`index.html:23636` makes an omitted VLOOKUP/HLOOKUP match argument exact; Excel's default is
approximate. `index.html:23502` ignores MATCH's match-type argument and only finds exact
matches. The expression parser at `index.html:23725`–`23763` has no bare `TRUE`/`FALSE` literal
case. The suite tests numeric `0`/`1` flags, so the familiar Excel spelling is untested.

Sources: [VLOOKUP argument behavior](https://support.microsoft.com/en-us/excel/use-excel-built-in-functions-to-find-data-in-a-table-or-a-range-of-cells),
[MATCH](https://support.microsoft.com/en-us/excel/functions/match-function).

**Repair acceptance:** valid numeric and Boolean flags agree; omitted arguments follow Excel;
exact and approximate cases are tested separately. If a function form is intentionally outside
the simulator's scope, reject it clearly. Do not silently calculate it using another mode.

### E5 — P2: criteria and date arguments are accepted but ignored

- With `A1=10`, `A2=20`, `=COUNTIF(A1:A2,">10")` returned **0**, not **1**. The implementation
  at `index.html:23545`–`23548` compares only literal equality. SUMIF/SUMIFS use the same equality
  approach at `index.html:23518`–`23536`; those related cases were inspected, not independently
  played in this probe. [Microsoft's conditional-count examples](https://support.microsoft.com/en-us/office/count-numbers-or-dates-based-on-a-condition-in-excel-976d0074-245d-49e6-bf5f-1207983f82ed)
  establish that comparison criteria are part of COUNTIF.
- `=YEARFRAC(DATE(2026,1,1),DATE(2026,7,1),3)` returned **0.5**. Basis 3 should use the actual
  181 days divided by 365, approximately **0.495890411**. `index.html:23663`–`23670` always uses
  its simplified 30/360 calculation and never reads the third argument.
  [Microsoft's YEARFRAC contract](https://support.microsoft.com/en-us/excel/functions/yearfrac-function)
  defines basis 3 as actual days over 365.

**Repair acceptance:** enumerate the argument forms actually supported by every advertised
function. Implement the promised forms or give a clear unsupported-form response; never ignore
an accepted argument. Add separate criteria and date-basis tests before expanding those lessons.

### E6 — P1: a disconnected model can pass as a live model

**Impact:** advanced drills can mark the learning objective complete even when the spreadsheet
does not contain the links it asks the learner to build.

**Reproduction:** for each drill, play its authored solution without the final Save. Then use
keyboard entry to replace each numeric formula with `=<its current value>`, preserving its
formatting. Press Ctrl+S. In this audit:

| Drill | Formulas replaced | Result |
|---|---:|---|
| `dcf` | 14 | Won; every required check passed |
| `threestmt` | 27, including existing linked formulas | Won; every required check passed |
| `wacc`, comparison control | 10 | Rejected; required model checks failed |

Examples of accepted stored formulas were `=0.8952551477170994` in DCF and `=520` in
3-Statement. They are formulas syntactically, but they have no connection to the source inputs.

**Cause:** DCF's `live` helper at `index.html:10443` and 3-Statement's at `index.html:15669`
only require any formula text plus a numeric value. DCF Build has the same weak helper at
`index.html:11020`, though this specific bypass was not independently played there. WACC's
helper at `index.html:10140` additionally looks for a reference, explaining the control result.

This is distinct from allowing a slower, legitimate alternative route. The current brief
explicitly permits a live-formula requirement when linking the model is the lesson.

**Repair acceptance:** these two completed sheets must fail if their required links are
replaced with constant formulas. Keep valid alternative formulas, reversed operation order,
typed references and F4 routes passing. A dependency check or a controlled input-change check
is stronger than requiring one exact formula string. Test that adding an irrelevant reference
such as `+0*A1` cannot satisfy the lesson. Apply the agreed contract consistently to model
drills; do not blanket-ban constants in drills whose objective is simply a correct value.

### E7 — P2: the first lesson and catalog disagree about what comes next

`index.html:22778` sets `navigation.tutorial.nextKey='autofit'`. The catalog at `drills.js:41`
puts `filldr` immediately after navigation, while autofit is fourth in the Formatting chapter
at `drills.js:42`. Result navigation follows `nextKey` at `index.html:25913` and `26095`.

**Impact:** following the lesson's Next action and following the catalog teach different
sequences. This is confirmed wiring disagreement; it does not establish which sequence Wolf
should choose.

**Repair acceptance:** choose one approved next lesson and derive result navigation, catalog
ordering and generated page recommendations from that decision. Verify it from a fresh learner
account and after a replay. Do not choose the unmerged branch's sequence without review.

## Engine map and the contracts to preserve

| Part | Source | Contract / dependency |
|---|---|---|
| Catalog, chapter order, display names | `drills.js:38` onward | 74 entries, eight chapters; `index.html:32205` copies shared names into challenges |
| Drill definitions | `index.html:2885`–`23176`, `CHALLENGES` | `build` makes a seeded board; `checks` grades it; matching `guide` and `targets` explain/location-mark each outcome; `demo` provides a solution |
| Sheet state and formula evaluation | `index.html:23180`, `23463` | Mutable global `S`, cell values/formulas/formatting, active cell/selection/clipboard; the formula engine reads current sheet state |
| Recalculation | `index.html:26465` | Repeated passes over formulas; downstream values update after edits |
| Rendering and ribbon | `index.html:24082`, `24779` | Draws the same state the graders inspect; preserves the UI Wolf likes |
| Clipboard and structure operations | `index.html:27645`, `28249`, `28278` | Paste, row/column movement and formula-reference rewriting must stay consistent with undo and graders |
| Keyboard dispatch | `index.html:28413` | Normal/edit/dialog/ribbon modes and numerous overlay listeners share the event stream |
| Session start and loading | `index.html:25013`, `25125`, `32043` | Builds seed, applies gates, resets run state, starts the clock, loads guides and resume state |
| Guided mode and tutorial steps | `index.html:29147`, `33857` | Guided rails change score eligibility; integrated steps are a separate controller |
| Completion and results | `index.html:25607`, `25902`, `27019` | Required checks stop the clock; bonus checks do not block completion; completion fans out to results, XP, PB, achievements and uploads |
| Universal Save outcome | `index.html:32221` | Wraps checks/guide/targets/demo for `saveClose`; relies on matching list lengths and operation order |
| Progress and posting | `index.html:32425`, `34496`; `themes.js:727`; `nav.js:1433` | Local PB/estimates, server run uploads and account-state synchronization are separate paths |
| Public drill pages | `dev/build-drill-pages.js:1` | Loads the real browser state, uses fixed seeds, writes 74 pages, library, sitemap and `refmap.js` |

The simulator is a compact one-sheet exercise engine, not a complete Excel implementation.
Its visible width is A–J (`index.html:2788`); supported functions and commands are hand-written.
That scope is reasonable for this product, but supported operations must teach correct results.

The main extraction risk is shared state, not merely file length. Challenge checks can update
latches; demos and guides read mutable challenge build data; completion performs several kinds
of persistence and reward work. The Save wrapper overrides `toString` because tests and guide
logic inspect function source. Moving these pieces without first preserving their interfaces
can break behavior even if all files still parse.

Suggested later boundaries: sheet operations → drill definitions/grading → session controller
→ progression → storage → display. This is a proposed cleanup order, not authorization to move
the code now. Keep each extraction separate from changes to gameplay rules.

## Learning-content assessment

The 74 current drills are real implemented content, not a collection that should be discarded
because a later planning document exists. One-seed replay proved that all their authored
solutions complete. The current challenge builders already contain substantial variation,
realistic business worksheets, alternative-route handling and visible formatting consequences.

The weak point is the bridge from first success to independent work:

| Stage sampled | Existing strengths | Gap / decision |
|---|---|---|
| Navigation | Playful corridor movement, checkpoints, selecting a sales table, copying it home; three integrated teaching steps | Its next action conflicts with the catalog; only this drill has the integrated teaching declaration |
| Foundations Fill | Revenue feed, changing quarterly costs, visible recalculation, totals and a ratio block; alternative fill routes pass | The second catalog drill asks for anchors, EBITDA, FY totals and a 20-cell ratio block. It has seven required outcomes including Save and eight guide lines, but no integrated `steps`/`tutorial` metadata |
| Paste Special | One coherent task exercises transpose, scale conversion, formats and values | Many mechanisms and terms for an early lesson; no evidence yet that a novice can choose help, recover and continue without following the entire solution |
| Margin / Foot / Lookups | Useful formula and clipboard exercises; multiple keyboard routes and operation orders pass | Decide where obtaining the correct number is enough and where a live link is the lesson; apply that rule consistently |
| WACC / DCF / 3-Statement | Meaningful model tasks and alternative formula shapes | Correctness differs between graders; E6 shows a success message can overstate what was learned |

The learning difficulty described here is an assessment, not a failed usability test. No novice
participant was observed. The next content decision should define what a first-session learner
already knows and what each lesson teaches before it requires it. Preserve playful movement
and the current ribbon while making those prerequisites explicit.

The shipped sequence, the v5.1 proposal and the unmerged September tutorial branch are separate
artifacts. The coordinator's branch review records the additional `entrybasics`/`ribbonways`
work. It has not been merged or treated as the approved replacement curriculum here. The old
content quotas for density, length and operation count must not silently override the new
requirement to teach beginners gradually.

## Scoring and progress integration

The central completion handler does much more than display a win. It calculates provisional
XP, PB, streaks, bonus rewards, results and possible server uploads (`index.html:25607` onward).
Turning on guided rails sets `guidedUsed` (`index.html:29147`); a guided or mouse-assisted run
does not earn the normal clean-run XP/PB and is not uploaded by `recordRun`
(`index.html:25650`, `25712`, `25763`, `34499`). This is existing behavior, not a proposal.

Learning completion and competitive eligibility therefore need explicit, separate acceptance
examples. A learner's progress after using help should not be inferred from the existence of a
leaderboard run. The storage audit owns whether each of those local states survives signing
out, another browser and another device. This report did not verify a live account's end-to-end
persistence or authoritative score validation.

## Test gaps and efficient next steps

1. **Keep the good regression suite.** Its 74 authored solutions and alternative routes are
   useful protection during cleanup. Add the independent failed examples above; a larger count
   of similar happy-path tests would not catch these defects.
2. **Use an external answer standard for formula tests.** Current test expectations and the
   engine were built together. The Microsoft examples above provide independent constraints.
   A small fixed set of Excel-produced reference workbooks can later verify wider compatibility.
3. **Test bad answers as deliberately as good ones.** Constant formulas, partial links and
   wrong-range lookups must fail where the lesson requires a live model. Avoid checks tied to
   one exact formula spelling.
4. **Distinguish full keyboard play from scripted selection.** Demo and alternative-route
   harnesses call `setDemoSel` (`index.html:31034`), which places a selection directly before
   dispatching key events. They prove command/grader compatibility but do not prove that a
   new learner can navigate every range, or that real browser/OS shortcuts are intercepted.
5. **Do not overstate star coverage.** The alternative-route runner at
   `dev/e2e-alt-paths.js:2534` passes a case when `done` is true. Some route labels describe
   whether a bonus should light, but this runner does not assert that bonus state. Individual
   `verify-*.js` scripts cover some stars; inventory those before assuming CI covers them all.
6. **Make network isolation part of the normal harness.** Several older suites rely on the
   environment blocking Supabase. This audit supplied a temporary local-only boundary; the
   permanent tool setup should make that guarantee explicit.
7. **Review generated output without hand-editing it.** The generator is tied to runtime
   metadata and fixed seeded guides, and checks for orphan pages. Its output drift was not
   regenerated in this audit because this agent owned only this report. Include drift checking
   when content or shared runtime assets are repaired.

Not completed here: full manual financial review of every randomized drill, full guided
catalog, actual macOS/Excel shortcut testing, all layout/theme/rapid-fire/depth suites, a novice
usability study, production account persistence and anti-cheat testing. The coordinator's
combined audit should track these as coverage gaps, not passed checks.
