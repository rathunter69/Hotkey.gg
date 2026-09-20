# Drill catalog and learning roadmap — first review draft

Initial draft **2026-09-19**; expansion overview added **2026-09-20**. Owner: Catalog/learning task `01a0b148-2693-7901-af91-934c83cabe1d`.
Branch: `codex/catalog-flow-review`. **Planning only; no replacement content has been authored or implemented.**
The learning system has been refined; the current eight chapters and 74 drills remain intact.
This is the first curriculum draft for review, not an approved rebuild plan.

**Wolf's September 19 correction:** completely rework the drill catalog and chapter structure around
learning; do not merely reorganize the existing 74 exercises. Required lesson actions and goals must
be discrete and explicit and refer to the actual visible element in that drill, for example
“Make **Weekly Sales Report** bold,” not “make the header more visible” or “make the title in A1 bold.”
Wolf immediately clarified that learner-facing goals must use the actual element names, **not cell references**.
This supersedes the first draft's overemphasis on retaining an existing drill for every future teaching slot.
The existing catalog is evidence and migration provenance, not the shape, count or required content of the new one.
Actual content replacement remains outside this planning authorization.

## Authority, sources and status

The chief assigned this file in the [September 19 curriculum brief](https://github.com/rathunter69/Hotkey.gg/blob/dc939ea2c6efd32b0afd6bc8249a4e78af43c536/docs/TASK_STARTERS.md#curriculum-roadmap-workstream--september-19).
CURRENT/PRODUCT remain chief-owned. This file owns teaching sequence and conceptual content mapping;
[the systems handoff](https://github.com/rathunter69/Hotkey.gg/blob/7193044d41b348d3f31df4d3f4ff53457a8b39a8/docs/handoffs/catalog-progression.md)
owns the longer decision history. It is not a second master queue.

Accepted implementation baseline: `16ee8306a8c170db9f8fe2e051b44b0519782ae1`.
This existing planning branch retains `00df57afd8d3299cc7feaf523847b9ca43e54d06` runtime, as previously agreed.
A bounded comparison found no differences from 16ee830 in `drills.js`, `index.html`,
`dev/build-drill-pages.js`, or the four feedback sources below. No rebase or source replacement was needed.
Latest remote CURRENT was refreshed for this draft (file blob `9366fc6d4fb62b7d40fb3bf47073032795224652`);
it retains 16ee830 as the implementation baseline and assigns this curriculum batch.

The chief subsequently reconciled the linked Storage choices in [PRODUCT at e36cf05](https://github.com/rathunter69/Hotkey.gg/blob/e36cf05bdeefd109d5f80e3678b3f0419ec54825/docs/PRODUCT.md); that update was checked and does not authorize implementation.

Required guidance was read remotely: AGENTS, README, CURRENT, DEVELOPMENT, PRODUCT, TASK_GUIDE,
TASK_STARTERS, ARCHITECTURE and the audit index. The brief/guidance checkpoint is dc939ea above.
Relevant additional evidence:

- [Canonical catalog](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/drills.js#L40), [challenge source](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/index.html), and [ownership](https://github.com/rathunter69/Hotkey.gg/blob/dc939ea2c6efd32b0afd6bc8249a4e78af43c536/docs/ARCHITECTURE.md).
- [Existing engine/content audit](https://github.com/rathunter69/Hotkey.gg/blob/dc939ea2c6efd32b0afd6bc8249a4e78af43c536/docs/audit/ENGINE_CONTENT.md). Its successful demos and alternative routes establish encoded outcomes, not teaching quality or universal Excel parity.
- [UI direction](https://github.com/rathunter69/Hotkey.gg/blob/23a00252538b6029d32f249360a7c56b3574db1d/docs/handoffs/experience-site.md): preserve native workspace visuals; Help beside the sheet; familiar completion popup/overlay supersedes the earlier ordinary-result side-panel proposal. Exact interaction/layout remains UI-owned.
- [Storage decisions](https://github.com/rathunter69/Hotkey.gg/blob/26e71a0f741de3a3e23f8653314a3b2e7f5cf46e/docs/handoffs/leaderboards-storage.md): qualifying guest solo work can receive normal XP/readiness/comparable PB credit once after confirmed transfer; trustworthy evidence/equivalence remain to specify. Known helped completion remains completion, with no XP.
- [Payments decisions](https://github.com/rathunter69/Hotkey.gg/blob/00de01d76c4fb359e25e62c62be4ef406a368760/docs/handoffs/payments.md): useful free Foundations, a few complete advanced sample lessons, selected free public challenges; certificates follow their required content. Exact membership remains for this curriculum review; offer/lifecycle policy remains Payments-owned.

**Status labels:** “confirmed” below refers to Wolf's dated systems choices or the chief's explicit assignment.
All new chapter names, lesson handles, ordering, access membership, certificates and crosswalk dispositions are
**recommendations awaiting Wolf's review**. Source descriptions identify what the current exercises ask for,
not independently verified future capabilities. The fresh-rebuild and explicit-objective requirements are confirmed in this turn; the new chapter/lesson map itself is not.

## What exists and why reorganize it

`drills.js` groups and metadata are canonical for membership/order/names. `index.html` CHALLENGES owns
worksheets, goals, checks, guides and demonstrations. The inventory reconciles **74 unique IDs, 74 metadata
entries, 74 catalog challenge implementations and 74 generated drill pages**, with no missing/orphan entries.
The separate `keyboardtour` challenge is outside this catalog; it is not a proposed lesson revival.

| Current chapter | Count | Teaching issue to address |
|---|---:|---|
| Foundations | 7 | One integrated first tutorial is followed by combined fill, paste and P&L work that assumes untaught skills. |
| Formatting | 9 | Useful mechanics and review tasks overlap; basic readability arrives after complex Foundations work. |
| Formulas I | 9 | First totals/references share a bucket with CAGR, multiple criteria and finance ratios. |
| Data & Lookups | 9 | Beginner list handling and advanced lookup/reconciliation sit together. |
| Formulas II | 10 | Error repair, scenario inputs and balance-sheet understanding need distinct prerequisites. |
| Models I | 10 | Valuation and deal mechanics need domain introductions before spreadsheet execution. |
| Models II | 10 | Debt and liquidity exercises recur at different complexity; identify each new learning gain. |
| Full Builds | 10 | Projects are separated from the skills that explain them; some belong earlier in a domain sequence. |

Historical v3/v4/v5 plans remain references, not executable instructions. v4 describes 90 entries
(74 built plus 16 planned); v5/v5.1 describes a proposed 61-drill rebuild. Neither is the shipped list or
a selected target count. Generated drill pages and generated curriculum artifacts are not independent
sources to edit. The inventory agent reused the audit; it did not replay all drills.

## Recommended vocabulary and learner-facing structure

**Show chapters containing lessons.** A learner opens a useful task, gets teaching when needed, completes it,
then can Continue, Try solo or deliberately speedrun it. Do not add a mode selection before every lesson.

| Term | Proposed meaning | What the learner needs to see |
|---|---|---|
| Chapter | A coherent skill area with useful outcomes. | A catalog section and its lessons. |
| Lesson | A taught objective with a worksheet task, including practice or a larger project when appropriate. | The primary clickable unit, named for the work they will learn. |
| Drill | A repeatable exercise/worksheet underlying a lesson; existing IDs remain provenance. A lesson may need several exercises after a split. | “Practice again” or the familiar drill name where helpful; not another mandatory navigation layer. |
| Module / content pack | A versioned content collection over the shared chapters/lessons, with a clear subject and release boundary. See the September 20 expansion proposal. | No additional mandatory browsing level; lessons remain accessible through the familiar chapter/catalog structure. |
| Track | A recommended route through shared lessons, chosen for experience/goal. | An optional recommendation such as Everyday Excel or Financial Modeling, with shared completion. |

Do not equate a track with a certificate, subscription, readiness gate or independent copy of a lesson.
A learner changing goals keeps the same completion/history. Rapid-fire remains optional quick practice.
Benchmarks/Daily use selected standardized tasks and their own eligibility; they do not duplicate the curriculum.

## Proposed curriculum designed from the learning sequence

Start with what someone needs to learn, in what order, and what they can do afterward.
**No existing chapter, drill, title, count or exercise boundary is entitled to a place in the replacement.**
Only after defining a new lesson do we decide whether an old exercise supplies useful material.
A complete old-ID crosswalk remains necessary to protect records; it is not a commitment to reuse all 74 units.

The following **ten provisional chapters** are a fresh teaching proposal, not a quota.
Foundations becomes a recommended beginner path across C01–C05, rather than requiring one overloaded chapter.
Chapters are the visible catalog structure; optional tracks recommend shared lessons. Practice and projects
are lesson types/actions within that structure, not new game modes.

| Proposed chapter | Useful outcome and audience | Introduced before use | Practised / combined | Preparation and access proposal |
|---|---|---|---|---|
| C01 — Move and select | A first-time learner can find cells, select the intended range and bring a block to a destination. | Active cell/address, worksheet boundaries, arrows and useful jumps, range selection, copy versus move. | Short playful movement followed by a real block handoff; later vary selection shapes. | No prerequisite. Core lessons proposed free. |
| C02 — Enter, edit and organize | Correct everyday text/numbers and restructure a small sheet safely. | Cell entry/editing, undo/redo, rows/columns, insert/delete and what shifts. | Fix a labelled list and recover a reversible change; combine row/column work after introducing each. | Relevant C01 skills. No formula knowledge required in the first structure exercise. Core free. |
| C03 — Format a readable worksheet | Apply precise, useful formatting and understand where ribbon commands live. | Ribbon/tab/group/selection context; bold/unbold, alignment, number display/precision, borders, widths. | “Make Weekly Sales Report bold”; “Right-align Revenue”; AutoFit a specifically named label column versus equal widths elsewhere. | C01–02. Core free; advanced report refinements are separate explicit content candidates. |
| C04 — Calculate and reuse | Build calculations that update, then reuse them correctly. | Formula syntax/arithmetic, references/ranges, SUM/AutoSum, relative fill, one absolute reference, inspect a simple fault. | Different-input row/period totals, one shared conversion rate, live change checks. Mixed-reference/2D work follows its own teaching. | Relevant C01–03. Core free; more advanced extensions separately mapped. |
| C05 — Work with lists and hand off results | Organize a small list and produce a useful completed summary. | Sort whole records, filter versus delete, values/formulas/formats paste distinction; later transpose and other transformations. | Combine known editing, formulas and formatting in an everyday project; observe live report versus fixed snapshot. | Relevant C01–04. Complete beginner path/project free; richer workflow lessons beyond that path are individually proposed paid/sample content. |
| C06 — Find and summarize answers | Answer questions from data and reconcile sources. | Conditions/aggregation/counts; lookup meaning then one-/two-way lookup; missing versus broken data. | Build conditional summaries and reconcile two sources after their component functions are taught. | Relevant C04/C05 skills. Proposed paid with selected complete samples; no automatic chapter gate. |
| C07 — Build and check models | Make a small plan whose assumptions drive its outputs. | Driver panels, growth/ratios, dependency inspection, error diagnosis, scenario selection, live checks; report refinements as needed. | A non-finance operating plan, model review and a clear linked summary. | Relevant C04 skills; selected C06 only when used. Proposed first substantial-model readiness checkpoint and paid content/sample exceptions. |
| C08 — Understand financial statements | Interpret and connect operating performance, working capital, balance sheet and cash flow. | Finance terms/signs, statement relationships, schedules and cash conversion. | Build components, then linked statements and repair tasks. | Relevant C07 model skills or equivalent; finance concepts explicitly introduced. Proposed paid/sample exceptions. |
| C09 — Value a business | Connect comparable evidence/cash flows and assumptions to a valuation. | EV/equity, multiples, peer/precedent interpretation, FCF/discount rate/terminal value, sensitivity/ranges. | Component calculations → full valuation page → multi-method summary. | Relevant C08 cash-flow knowledge; teach valuation domain concepts first. Proposed paid/sample exceptions. |
| C10 — Model funding and deals | Understand debt, liquidity, funding and returns. | Sources/uses, interest, borrowing availability, cash sweep/priority, covenants, LBO/acquisition concepts. | Build facility mechanics then integrated debt/cash/deal projects. | Relevant C07/C08; C09 only where valuation is actually used. Proposed paid/sample exceptions. |

**No chapter placement determines access.** Core/extension labels above are draft per-content allocations,
to be replaced by an explicit content/revision manifest. A complete beginner path is already confirmed free.
New chapter count/names, exact membership and order remain open. A different order can be chosen without
changing content entitlement, prerequisite evidence or earned progress.

Three recommendations can draw from this one curriculum:
- **Excel Foundations:** the complete beginner path through core C01–C05, including a practical summary.
- **Everyday Excel:** relevant Foundations skills, richer reporting/list work and C06; choose advanced C07 modeling when useful.
- **Financial Modeling:** relevant Foundations skills → C07 → C08, then C09 and/or C10, drawing C06 as needed.

These are recommended routes, not three duplicate catalogs or three automatic certificates.
Experienced learners can choose a starting point and show relevant earlier evidence/test out at major jumps.
Cash planning must not be locked behind WACC merely because valuation appears earlier in the list.

For concise source mapping below, **F** denotes beginner-path objectives, **W** advanced workflow material
distributed within C03–C05/C07, **D** C06, **M** C07, **S** C08, **V** C09 and **T** C10.
These are internal subject handles, **not the earlier seven-chapter proposal** and not additional UI layers.
The first draft's seven buckets are superseded as the proposed visible chapter structure.

Projects belong after the skills they use. “Full Builds” is not automatically retained as a chapter.
Likewise, repeated formatting reviews need not survive as multiple required lessons just because separate
drills exist today. Old exercises must justify a specific teaching purpose in the fresh sequence.

## Exact objectives using the drill's named elements — confirmed September 19

Wolf explicitly wants discrete instructions and pass conditions **using the actual elements shown in the
specific drill**. He corrected the first coordinate-based interpretation: “the title in A1” is not the
desired instruction. A short task story can explain why work matters, but cannot replace the actual goal.
Learners should solve spreadsheet work, not guess the rubric or translate a coordinate checklist.

| Too vague or coordinate-based | Required style, using example worksheet labels |
|---|---|
| Make the header more visible. / Make the title in A1 bold. | Make **Weekly Sales Report** bold. |
| Make the numbers look right. / Format D4:D8 as currency. | Format the **Line Total** values in **Weekend Orders** as currency with two decimal places. |
| Tidy the summary. / Right-align B4:D8. | Right-align the values in the **Revenue** column of **Monthly Summary**. |
| Fix the total. / Sum D4:D8 in D9. | Calculate **Total Expenses** by adding **Rent**, **Payroll** and **Utilities**, using a formula that updates when those amounts change. |
| Assemble the report. / Copy A4:A8 into F4:F8. | Copy the **Item** and **Quantity** entries from **Incoming Orders** into **Weekly Order Summary**, excluding the column headings. |
| Rebuild the schedule. / Insert above row 7. | Insert **Packaging** immediately above **Delivery** in **Operating Costs**, then enter the amount shown in **Packaging Quote**. |

The bold labels above are examples of exact worksheet content, not reusable generic wording.
Future drill instructions must use **that drill's own title, row names, column names, section names and
period labels**. If a generated variant changes a label, the instruction must change with it. If two elements
share a name, disambiguate by their named section/period—for example **Revenue for March in Monthly Summary**.
Do not fall back to coordinates to compensate for an ambiguously designed worksheet.

Each checklist item describes one clear observable result or closely related calculation. Say “bold,”
“currency with two decimals,” “copy,” “insert” or “calculate,” with the exact named element and required
result. “Professional,” “visible,” “clean” and “model-ready” cannot stand in for pass conditions.
Cell/range addresses may appear in **internal worksheet layouts, graders and capability checks** in this
document; they are not the learner-facing objective-writing format. Teaching what a cell address means is
still a legitimate concept lesson, but ordinary task goals should identify the actual named work.

**Precision is not a route lock.** “Make Weekly Sales Report bold” identifies the required state, while
teaching explains the command. Ordinary task instructions, command explanations and conceptual examples
stay unpenalized. Requested Help that solves the current task through an exact route/Guided execution/replay
follows the confirmed assistance rule. Clarifying the target element, format or calculation must never
itself mark assisted. A lesson assessing a particular technique must say so explicitly; do not hide that
requirement inside a task that only promised an outcome. Legitimate routes still count for completion,
subject to the separate spreadsheet-mouse XP/timed eligibility policy.

Each future lesson blueprint needs: useful context; exact initial data/state and element names; prior
teaching; a short checklist of explicit named-element goals; observable success conditions; accepted
alternatives; Help boundaries; and separate access/recognition mappings. Checklist order suggests a useful
workflow unless a dependency actually requires it; it is not an automatic action-order constraint.

## Foundations objectives — proposed depth

F01–F14 are **draft objective handles**, not a promise of exactly 14 new drills or an ID migration.
They are candidate objectives to distribute through C01–C05, not an obligation to preserve the original drills.
Some may share a lesson with sequential exercises after review. Teach one new idea in context, then
combine it with familiar work; do not impose a fixed action count or duration.

| Handle / lesson idea | Explicit teaching before practice | Learner can demonstrate | Recommended preparation / source reuse |
|---|---|---|---|
| F01 — Move, select, bring it home | Active cell, cell address, range, arrows/jumps, extending selection and copy/paste meaning. | Bring a small labelled block to its destination without losing data. | None; simplify navigation while retaining playful checkpoints. |
| F02 — Copy and move a useful block | Copy versus cut; source/destination and including/excluding headers; selection shapes. | Assemble a correctly aligned mini-summary; move data when the source must be cleared. | F01; blocksel/navigation ingredients. |
| F03 — Edit and recover | Cell entry versus editing; text/number changes; undo/redo consequences. | Correct a typo/amount and recover a deliberate reversible change. | F01; early part of editfix plus historical undo intent. No formula repair yet. |
| F04 — Find and apply a command | Ribbon tabs/groups, current selection and keyboard access; bold/unbold and alignment. | Make the named title bold and right-align the specified data range. | F01–02; typeset/center. Explain Windows/Mac setup without claiming shortcut parity. |
| F05 — Make numbers readable | Stored value versus displayed format; number/currency/percent and precision. | Apply the requested currency/percentage/decimal display to the named range without changing stored values. | F03–04; accessible subset of decimals/housestyle. No valuation ratios. |
| F06 — Fit the worksheet | Readability, AutoFit versus deliberate equal widths, wrap where supported. | AutoFit the named label column; set the specified report columns to the stated equal width. | F04; autofit. Resizing the viewport must not complete the task. |
| F07 — Build a live total | Formula syntax, cell/range references, arithmetic, SUM and AutoSum as a useful route. | Totals recalculate when an input changes; no unexplained formula syntax. | F03; foot, stripped of extra domain requirements. |
| F08 — Reuse a formula | Relative references; source formula, destination range; fill down/right. | Calculate different rows/periods correctly from their own inputs. | F02/F07; first separated part of filldr. See blueprint B. |
| F09 — Keep one input fixed | Why a shared rate belongs in one cell; absolute reference and effect when copied. | One rate drives a simple conversion/price table as inputs change. | F07–08; anchor/fxconvert. Mixed locks and 2D grid later in W. |
| F10 — Paste what you mean | Values versus formulas versus formatting; retained live links versus a snapshot. | Create a labelled values-only handoff and reuse known formatting correctly. | F02/F04/F07; introductory pastes/drill. Transpose/scaling later in W. |
| F11 — Repair the structure | Rows versus columns, insertion/deletion, affected data/formatting and clear location cues. | Insert the named row/column at the stated location and delete the explicitly obsolete one; in later practice, verify the live total updates. | Early C02 exercise: F02 and elementary structure teaching only; later variant also F04/F07. Introduce each operation before the combined schedule. |
| F12 — Find items in a list | Whole-record integrity when sorting; filter means hidden from view, not deleted. | Order a small everyday list, find a requested subset and restore the view. | F01–03; simple slices of sort/filterpass. Advanced totals/grouping later. |
| F13 — Repair a small calculation | Reading a formula/reference, identifying an omitted input or wrong reference. | Fix a live total without replacing it with a typed answer. | F03/F07–08; later part of editfix. |
| F14 — Make a useful summary | No new required mechanic; explain the real task and final result. | Copy the named source ranges; enter specified live row/grand-total calculations; apply each named format; check that a changed input updates its total. | Relevant F01–13 lessons or equivalent knowledge; blocksel/foot/formatting ingredients. Blueprint C. |

Foundations should contain both satisfying keyboard interaction and enough Excel understanding to
make the savings meaningful. Ribbon familiarity is taught through actual work, not a revived tour.
A useful free path ends with something learners could recognize from their own work, not a finance
exam. Learners can freely explore basics; suggested preparation is not an invisible unlock rule.

## Foundations feedback traceability

The July feedback is preserved as evidence. The September learning-first decisions govern conflicts.
[R1](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/dev/ROUND1_FEEDBACK.md),
[R2](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/dev/ROUND2_FEEDBACK.md),
[R3](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/dev/WOLF_ROUND3.md),
and [September 4 synthesis](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/dev/DRILLS_WOLF_LIKED.md)
were read. The synthesis is useful but some of its “binding v5” rules are historical interpretations.

| Feedback / source | Preserve in the draft | Qualification or superseded interpretation |
|---|---|---|
| Navigation “honestly very good”; less arrow drudgery, meaningful table copy and movement cues (R1/R2 navigation; synthesis). | F01 playful movement, checkpoints and actual copied block; later practice can vary layout. | Do not require all 20×10 cells to contain tasks or overload first contact with every selection shape. |
| Clear adaptive labels, labelled helper cells, explicit insertion location; totals “recalculate” (R2 global/pastes/rowops). | Concrete current-task cues; meaningful helper labels; precise plain language. | A cue explains the task; it need not reveal the full solution route. Historical formula “re-tie” wording stays out. |
| Different fill stories, not unchanged quarterly costs; distinct memo output (R2 filldr; R3). | F08 relative fill; W later reference pull, formula fill and 2D fill with different purposes. | Do not introduce EBITDA, ratios, anchoring and a large grid before teaching their ingredients. |
| Paste formats reinforcement; values handoff; transpose and operations with real consequences (R1/R2 pastes; R3). | F10 values/formats then W richer Paste Special; current native dialog remains part of the experience. | All paste operations need not appear in the first paste lesson. |
| Row and column repair belong on one meaningful schedule; visibly unnecessary items (R1/R2 rowops). | C02 introduces each structure operation, then combines them; later C05 practice includes taught totals and formatting. | Combined application follows teaching; no surprise destructive instruction or unexplained inheritance claim. |
| Incoming alignment must actually be wrong; identify copied headers/data (R1/R2 blocksel). | F02/F14 meaningful correction and explicit boundaries. | Adding a margin calculation merely to make a novice task denser is not required. |
| Real work before undo; editing text, amounts and formulas (R3). | F03 reversible recovery; F13 formula repair after formula teaching. | No lives, penalties, forced restart or hostile trick. Historical retired undo/copyover IDs are not silently restored. |
| AutoFit sometimes wrong; purposeful bold/unbold/notes (R3). | F04–06 teach judgement; W combines report presentation. | No mandatory TODAY formula, many-operation quota or minimum run length just to demonstrate breadth. |
| Working P&L cascade and visible completed formatting (R3 modeltour; synthesis). | Preserve the strong model task in S after prerequisites; changing an input must change dependent outputs. | It is not the beginner gate; hardcoded answers cannot prove a task explicitly requiring a live model. |
| Outcomes and legitimate routes, clear task-specific instructions (R1 global; later R2 clarity). | Grade correct work; teach efficient routes and accept valid alternatives. | The old “vague instructions; timer teaches” approach is superseded by clear teaching and optional lesson timing. |

Also superseded as universal design requirements: no-scrolling/20-row content caps, 60% density,
three-by-three outcome quotas, skilled 60–150-second targets, “no four-key wins,” and speed-based
progression. Blank usable cells are welcome. The old mystery-star system is not automatically
restored by the approved hidden playful achievements. “Every drill ends with Ctrl+S” is historical,
not a newly approved universal finish trigger; UI/Engine must settle finish mechanics and distinguish
simulated worksheet actions from a confirmed account-save receipt.

## Complete current-to-proposed crosswalk

All **74 canonical IDs appear once below, in current chapter order**. Current titles/outcomes are source-derived.
A destination names potentially useful material, not a guaranteed future slot or a promise that an old completion proves every new exercise.

- **keep:** preserve the same teaching unit with only separately approved presentation work. None is certified for unchanged reuse at this draft stage; a known builder is not a complete future lesson.
- **adapt:** retain its useful core, changing teaching/context/order as proposed.
- **split:** introduce component skills separately, then preserve richer combined practice.
- **combine:** place related existing exercises in one coherent teaching sequence; this does not erase their IDs, variants or history.
- **retire-candidate:** reserve for an exercise with no distinct teaching role after detailed review. Candidates below concern a redundant standalone teaching requirement, not permission to remove source or erase history.

“Offer” is a **proposed explicit destination-content allocation**, not the current entitlement of the old ID.
F destinations are free candidates; W/D/M/S/V/T destinations are paid candidates unless individually selected
as a complete free sample or public challenge. **Every destination version is unassigned** at this planning stage.
A future approved manifest must name each content ID + revision + included variants + free/paid/sample/challenge
allocation. Chapter placement must never choose access automatically. Split rows require multiple explicit entries;
combining rows never turns old records into multiple awards. The separate policy table below governs readiness,
certificate membership and history for every row.

### Current Foundations (7)

| Stable ID / current title | Current intended outcome | Proposed destination | Disposition and reason | Proposed offer; revision unassigned |
|---|---|---|---|---|
| `navigation` — Navigate & Select | Corridor/checkpoints, range shapes, copy home | F01–02; optional later navigation practice | **split** — Teach first moves before complex selection shapes; retain playful reuse. | F free |
| `filldr` — Fill | Anchored fill with operating totals/margins | F08; W formula reuse; M operating plan | **split** — Separate relative fill, 2D/anchored fill and domain application. | F free; W/M paid |
| `pastes` — Paste Special | Transpose, scale/sign operations, formats, values | F10; W paste transformations | **split** — Values/formats introduction before wider operations; preserve dialog and labelled helpers. | F free; W paid |
| `blocksel` — Block Select | Copy/cut feeds and format a summary | F02; F14; W report assembly | **split** — Selection practice first, useful combined summary later; no automatic margin prerequisite. | F free; W paid |
| `rowops` — Structure | Insert/delete rows/columns and inherited formatting | F11; W combined schedule repair | **adapt** — Keep combined row/column outcome after clear introductions and location cues. | F free; W paid |
| `editfix` — Repair | Text correction, wrong-year formula, stale total | F03; F13 | **split** — Teach editing/recovery before formula inspection. | F free |
| `modeltour` — Model Tour | Repair P&L subtotals, margins and formatting | S P&L repair project | **adapt** — Preserve live cascade; move after model and financial teaching. | S paid |

### Current Formatting (9)

| Stable ID / current title | Current intended outcome | Proposed destination | Disposition and reason | Proposed offer; revision unassigned |
|---|---|---|---|---|
| `typeset` — Typeset | Purposeful memo weight/style/date formatting | F04; W memo/report presentation | **split** — Basic header/note work first; date-function need taught separately, not novice filler. | F free; W paid |
| `decimals` — Decimals | Standardize precision; find an exception | F05; W numeric presentation review | **split** — Separate display/value understanding from full finance-sheet review. | F free; W paid |
| `center` — Center | Left/right/center and center across selection | F04; W report titles | **adapt** — Introduce ordinary alignment early, wider title judgement later. | F free; W paid |
| `autofit` — Autofit | Fit labels, uniform widths, overflow | F06; W presentation application | **adapt** — Keep AutoFit versus equal-width judgement; usable viewport must not solve grade. | F free; W paid |
| `ruleoff` — Rule Off | Header, total and headline borders | W report structure; simple F14 reinforcement | **adapt** — Teach visual purpose with familiar data; no unnecessary standalone mode. | F free subset; W paid |
| `ruleaudit` — Ruling Pass | Find and repair four border breaks | W report review with ruleoff | **retire-candidate** — Standalone required drill may add no new objective after border teaching; reuse selected diagnosis in report practice if useful. Preserve all source/history. | Material only; W paid candidate |
| `combo` — Combo | Clean a pasted sheet across several formats | W report handoff with housestyle | **retire-candidate** — Do not retain a separate cleanup requirement solely because this drill exists; select useful work after defining the new report lesson. | Material only; W paid candidate |
| `housestyle` — House Style | Full title/input/number/total cleanup | W report handoff with combo | **combine** — Keep professional review depth without another near-identical progression requirement. | W paid |
| `gauntlet` — Gauntlet | Sources/uses with live totals and book formatting | W report project; T deal presentation variant | **retire-candidate** — Retire the old universal formatting-capstone role in the proposal; finance/report material must justify a new objective after prerequisites. No deletion authorized. | Material only; W/T paid candidate |

### Current Formulas I (9)

| Stable ID / current title | Current intended outcome | Proposed destination | Disposition and reason | Proposed offer; revision unassigned |
|---|---|---|---|---|
| `margin` — Margins | Margin, growth and EV/EBITDA ratios | M ratios/growth; V multiple calculations | **split** — Different mathematical/domain meanings need explicit introductions. | M/V paid |
| `foot` — Foot | SUM across/down and check the corner | F07; F14 total/check practice | **adapt** — Introduce formula/range meaning; teach AutoSum without rejecting other correct live totals. | F free |
| `anchor` — Anchors | Reference locks across a price grid | F09; W mixed-reference grid | **split** — One fixed input before mixed locks and two-dimensional work. | F free; W paid |
| `percent` — % of Revenue | Common-size two statements | S statement interpretation | **adapt** — After percentages, locks and statement vocabulary; preserve each block's own base. | S paid |
| `cagr` — CAGR | Compound rates then compare growth | M growth lesson and comparison | **adapt** — Teach compounding/periods explicitly; do not assume the title explains the mathematics. | M paid |
| `bridge` — Point Mode | Build revenue and EBITDA from drivers | M driver-model introduction | **adapt** — Teach reference selection first, use everyday example before financial variant. | M paid |
| `sumif` — SUMIF | Segment totals, total check and shares | D conditional totals introduction | **adapt** — Teach conditions and ranges before combined summary. | D paid |
| `rollup` — SUMIFS | Segment/region cross-tab and proof | D multiple-condition summary | **adapt** — Build on one condition; different objective from sumif. | D paid |
| `fxconvert` — FX Convert | One anchored rate drives conversions | F09 small conversion; M driver application | **adapt** — Concrete shared-rate benefit without a finance prerequisite. | F free; M paid |

### Current Data & Lookups (9)

| Stable ID / current title | Current intended outcome | Proposed destination | Disposition and reason | Proposed offer; revision unassigned |
|---|---|---|---|---|
| `sort` — Sort | Rank, insert late record, rerank and total | F12 simple ordering; W evolving list | **split** — Record integrity first; later combine structure changes and totals. | F free; W paid |
| `scrub` — Scrub | Remove export debris, sort and re-total | W clean an incoming report | **adapt** — Name obsolete rows clearly; reuse known sorting and totals. | W paid |
| `filterpass` — Filter | Two filtered views and interpretation | F12 filtering; D question-driven views | **split** — Teach visibility versus deletion before richer questions. | F free; D paid |
| `unhide` — Unhide | Restore hidden detail and rebuild groups | W inspect and organize detail | **adapt** — Introduce hidden/grouped distinction before region-level presentation. | W paid |
| `lookup` — Lookup | Three INDEX/MATCH pulls | D first lookup, then repeated application | **adapt** — Teach keys/matches and function syntax; native semantics review required. | D paid; sample candidate |
| `lookup2` — Two-way Lookup | INDEX with row/column MATCH | D two-way lookup | **adapt** — Teach two axes after one-way lookup; retain separate purpose. | D paid |
| `recon` — Recon | Presence/amount checks across two systems | D reconciliation project | **adapt** — Combine taught counts/lookups; explain mismatches before asking for zero. | D paid |
| `drill` — Hardcode | Snapshot/archive then remove feed | F10 snapshot introduction; W handoff proof | **split** — Explain deliberate values-only copy versus accidentally breaking a live model. | F free; W paid |
| `series` — Series | Seeded year/line-number runs and presentation | W sequence/period setup | **adapt** — Teach series semantics and why periods differ from repeated constants. | W paid |

### Current Formulas II (10)

| Stable ID / current title | Current intended outcome | Proposed destination | Disposition and reason | Proposed offer; revision unassigned |
|---|---|---|---|---|
| `audit` — Review Pass | Short total, hardcodes, wrong-year margin | M inspect a live model | **adapt** — Introduce inspection before multi-fault diagnosis; disclosed task scope. | M paid |
| `triage` — Error triage | REF/DIV0/VALUE diagnosis and repair | M error diagnosis | **adapt** — Teach causes separately before a combined repair exercise. | M paid |
| `wrapfix` — IFERROR | Missing versus broken reads, then total | D missing-data handling; M repair | **adapt** — Explain when a fallback is justified; do not reward masking a real fault. | D/M paid |
| `balcheck` — Make It Tie | Repair check row and balance-sheet faults | S statement repair with balance/bsbuild | **combine** — Diagnostic follow-up after building/understanding the same relationship. | S paid |
| `stalelink` — Stale Links | Repoint assumptions moved to a new block | M references and revision | **adapt** — Teach source identity and dependencies before repointing. | M paid |
| `cases` — Sticky switch | CHOOSE assumptions and case snapshots | M scenarios | **adapt** — Teach scenario meaning first; current self-reference/snapshot semantics need separate validation. | M paid |
| `tieout` — Tie-out | Trace support, stale source and reconciliation | M model proof/review | **adapt** — Retain reconciliation meaning; dependency evidence matters, not merely zero. | M paid |
| `signerr` — Sign Sweep | Correct convention and rebuild EBIT | S statement sign conventions | **adapt** — Teach economic sign meaning before mass transformation. | S paid |
| `versionup` — Roll-forward prep | Lift embedded rates into inputs | M driver-panel refactor | **adapt** — Contrast fixed arithmetic with an editable model; graded links must remain live. | M paid |
| `balance` — Balance | Total both sides and build a check | S balance-sheet introduction with bsbuild | **combine** — Introduce the identity, then build and diagnose progressively. | S paid |

### Current Models I (10)

| Stable ID / current title | Current intended outcome | Proposed destination | Disposition and reason | Proposed offer; revision unassigned |
|---|---|---|---|---|
| `wacc` — WACC | Peer beta, capital structure, weighted rate | V discount-rate sequence | **adapt** — Teach finance assumptions and formulas; expert/capability review before authoring. | V paid |
| `fcfbuild` — uFCF | EBIT-to-FCF bridge across forecast years | V cash-flow bridge | **adapt** — After S cash-flow/NWC teaching; keep explicit economic bridge. | V paid |
| `dcf` — DCF | Discounted flows, terminal value, EV | V DCF components leading to dcfbuild | **combine** — Component lesson and full-page project share learning rather than duplicate completion demands. | V paid |
| `comps` — Comps | Peer multiples, summaries and implied price | V peer valuation | **adapt** — Teach comparable interpretation and EV/equity; statistical semantics are an audit dependency. | V paid |
| `txncomps` — Transaction Comps | Precedent median and equity value | V transaction comparisons | **adapt** — Explain precedent versus trading evidence before applying familiar calculations. | V paid |
| `football` — Football | Comparable per-share ranges and premiums | V valuation summary project | **adapt** — Combine methods after teaching each; no claim of chart-engine support. | V paid |
| `dcfsens` — Sensitivity | Discount-rate/growth two-way valuation | V sensitivity after DCF | **adapt** — Teach what assumptions change and live dependence; no unverified native data-table promise. | V paid |
| `retbridge` — Returns Bridge | Attribute gain to growth/multiple/paydown | T returns explanation | **adapt** — After entry/exit and debt; teach attribution before reconciling it. | T paid |
| `accdil` — Accretion/Dilution | Cash/stock/mixed pro-forma EPS | T acquisition analysis | **adapt** — Teach funding/share/earnings effects first; separate from LBO branch. | T paid |
| `sourcesuses` — Sources & Uses | Funding, sponsor plug, check and shares | T funding introduction | **adapt** — Explicit deal vocabulary before building the equality. | T paid |

### Current Models II (10)

| Stable ID / current title | Current intended outcome | Proposed destination | Disposition and reason | Proposed offer; revision unassigned |
|---|---|---|---|---|
| `schedule` — Schedule | Capex/depreciation asset roll-forward | S supporting schedules | **adapt** — Teach beginning/change/ending relationship before multi-period asset application. | S paid |
| `intsched` — Interest | Debt roll-forward, opening interest, coverage | T debt/interest introduction | **adapt** — Explain balances/rates and interest basis before covenants. | T paid |
| `lbo` — LBO | Entry/exit equity, MOIC/IRR by exit | T LBO components leading to lbobuild | **combine** — Component practice then full project; interpret return measures before calculation. | T paid |
| `revolver` — Revolver | Draw/sweep/roll one facility | T revolver mechanics | **adapt** — Teach borrowing availability and cash need before multi-period sweep. | T paid |
| `waterfall` — Waterfall | Allocate paydown cash by priority | T priority introduction; later cascade | **combine** — Keep a simple taught case and richer application within one sequence. | T paid |
| `covtable` — Covenant Table | Leverage tests and tightest period | T covenant interpretation | **adapt** — Explain inequality/headroom and relevant debt metrics before a check table. | T paid |
| `liqbridge` — Liquidity Bridge | Cash/available facility/cushion by case | T liquidity analysis | **adapt** — Teach cash versus borrowing availability; connect to scenarios only after taught. | T paid |
| `wk13` — 13-Week Cash | Weekly cash roll and cushion | T cash planning branch | **adapt** — Accessible after cash-flow basics; not gated by completing valuation or LBO. | T paid |
| `debtsched` — Debt Schedule | Amortization, capped sweep and interest | T debt schedule after facility basics | **adapt** — Combine known debt mechanics; distinguish mandatory from optional paydown. | T paid |
| `cascade` — Full Waterfall | Three facilities/four-year priority | T priority project after waterfall | **combine** — Increase interdependence after the simple case; not a redundant top-level mode. | T paid |

### Current Full Builds (10)

| Stable ID / current title | Current intended outcome | Proposed destination | Disposition and reason | Proposed offer; revision unassigned |
|---|---|---|---|---|
| `isbuild` — IS Build | Driver-led forecast through EBITDA/margin | S income-statement project | **adapt** — Teach components before assembly; build stays with its chapter. | S paid |
| `bsbuild` — BS Build | Retained earnings and two-sided check | S balance-sheet project with balance/balcheck | **combine** — Build then diagnose; keep source histories distinct. | S paid |
| `cfslink` — CFS Link | Linked schedules, cash roll and conversion | S cash-flow project | **adapt** — Explain source relationships and cash meaning before connection. | S paid |
| `nwcsched` — NWC Schedule | Receivables/inventory/payables from days | S working-capital schedule | **adapt** — Teach day-count/economic relationships before model execution. | S paid |
| `threestmt` — 3-Statement | Link income/cash/equity and balance | S linked-statements project | **adapt** — Capstone after component statements; live dependency checks required. | S paid |
| `opmodel` — Op model | Units/price/cost drivers to profit/margin | M operating-plan project | **adapt** — Begin with understandable commercial quantities; blueprint D. | M paid |
| `dcfbuild` — DCF page | Full valuation page, equity/share bridge, proof | V DCF project with dcf | **combine** — Reuse taught discounted-flow skills; make enterprise-to-equity the explicit new gain. | V paid |
| `lbobuild` — Paper LBO | Entry/exit funding and sponsor return | T LBO project with lbo | **combine** — Full artifact after taught components; retain distinct provenance. | T paid |
| `debtblock` — Debt block | Term/revolver rolls and interest totals | T integrated-debt project | **adapt** — Keep as integration after individual facilities, not first introduction. | T paid |
| `dashcover` — Model cover | Link two-case headline outputs/title | M model summary; S/V/T reuse | **adapt** — One shared reporting skill, domain variants reuse learning rather than duplicate a whole curriculum. | M/S/V/T paid |

## Gaps and overlaps to resolve after the map review

The 74 drills supply evidence about useful mechanics and past feedback, but they are not the template for the replacement curriculum. Proposed new
teaching coverage includes cell/range orientation, editing and undo as an approachable recovery loop,
ribbon command understanding, formula/value/display differences, why a reference moves or stays fixed,
simple sort/filter meaning, and explicit domain introductions before finance. These are coverage needs,
not permission to revive deleted `ribbon`, `undo`, `copyover` or other historical IDs.

New lessons can be wholly new, reuse a fragment, or omit an old exercise. There is no obligation to retain 74 equivalents.
The inventory points to only Navigation having integrated tutorial steps; guides on the other drills
do not establish teach-before-use. Specific new builders, reusable teaching components and counts wait
until the objectives and lesson boundaries are approved.

Keep purposeful recurrence: build then inspect; a one-facility debt exercise then a multi-facility project;
DCF components then a full valuation page. Reduce redundant required completion by reusing one skill/result
where equivalence is established. Do not combine exercises merely because they share a function or format.

## Four representative lesson blueprints

All four are proposals for review, not authored worksheets or verified supported builds. Example numbers,
locations and contexts are illustrative. They set observable outcomes before implementation detail.
Task instructions/ordinary teaching explain concepts and commands without penalty; revealing the current
solution steps, Guided completion or replay makes that attempt assisted. A visible target is not by itself
a solution reveal. Exact Help presentation stays UI-owned.

Shared rules for each blueprint:
- Ordinary lesson timer is optional/hidden by default; no time or key-count pass condition.
- Correct completion with solution help or spreadsheet mouse work counts for learning and, when the lesson belongs to the selected certificate set, certificate completion; it earns no XP and no eligible timed record.
- A fresh Try solo attempt is judged on its own evidence, with no penalty for previous help.
- Page Start/Retry alone does not disqualify. Spreadsheet sheet/ribbon/dialog mouse work follows the confirmed policy. Pointer scrolling classification remains a scoped UI/Engine decision.
- Accept correct alternative routes. If the objective explicitly requires a live calculation, a hardcoded matching number is not equivalent. A lesson about one named shortcut can offer dedicated practice/command recognition without silently making every outcome require that route.
- Small feedback follows meaningful correct work, not every key; celebrate completion. Soft success audio has remembered mute; preserve native workspace visuals. No lives, XP deductions or forced restarts.
- After helped work, Continue leads with Try solo alongside. Completion/actions lead the familiar result overlay; detailed stats expand. No invented time-saved claim without the approved same-task benchmark method/calibration.
- A deliberate speedrun requires its own reveal/start, continuous timing and a defined comparable revision/setup. It is not automatically public or a benchmark just because a worksheet can be timed.

### A. First contact — Bring the little table home (F01)

**Purpose:** feel an immediate keyboard success and understand active cell, range and moving data.
No Excel or finance prerequisite. Platform choice occurs before this guest lesson; instructions must match
a verified Windows/Mac mapping, not guessed substitutions.

**Starting sheet and space:** familiar A1:J20 usable workspace; a small labelled destination near A1,
a clearly labelled source table around F8:H10 and a short playful movement route/checkpoints. Empty cells
remain usable. The route must not obstruct a valid alternative or require knowledge of future formulas.
No demand to fill the grid or visit many decorative cells.

**Teach, then practise:** show what the selected cell and address mean; demonstrate navigation/selection and
copy/paste concepts on a separate example or reversible introduction. The task says, for example, “Copy the Item, Quantity and Unit Price columns from Incoming Orders
into Order Summary, including the column headings.” Those titles and headings must appear on the sheet. Teach a jump as the useful next move after ordinary movement is understood;
introduce further range shapes in F02, not all at once.

**Required navigation and outcome:** reach the source, select the intended table, copy its data intact to
the labelled destination and finish in the stated destination region if that is an explicit objective.
No arbitrary corridor route/lap count is necessary for passing. Movement checkpoints give feedback;
the copy provides a real result.

**Legitimate alternatives:** different correct selection/navigation routes and standard copy routes.
Mouse completion remains valid learning, with the settled XP/time consequences. Do not mistake
an animation/checkpoint route for the grader contract.

**Help and next step:** task-location cue and concept explanation are ordinary teaching. A request for the
exact sequence or target-by-target demonstration marks assisted. First success uses the same result pattern
as later lessons; personalization/save invitation follows the agreed journey. Continue suggests F02, but an
experienced learner can choose a starting point.

**Separate policy fields:** readiness none; proposed access free; draft certificate F set; old navigation
completion/history retained, future F01/F02 equivalence unproved; timing variants require comparison review.
This is not a replacement of the old scored navigation board under its existing identity.

### B. Focused practice — Fill a live order total (F08)

**Purpose:** understand how a relative formula changes when reused. Prerequisites: F02 selection/copy,
F07 multiplication, references and a live total. No finance terminology, anchoring or percentages.

**Starting sheet and space:** A1:J20 usable; a compact order list in A3:D8, labelled Item / Quantity / Unit Price /
Line Total, under the title Weekend Orders. Inputs differ by row; the first row's multiplication has been taught, the remaining totals await work.
Use enough varied inputs to expose a wrongly repeated reference, not a minimum density target.

**Teach, then practise:** a separate worked example shows why the source formula's row references change.
The worksheet goal is “For each item in Weekend Orders, calculate Line Total as Quantity × Unit Price, using a formula.”
The separate, explicit teaching/practice prompt is “Try Fill Down to copy the first Line Total formula through the other items in Weekend Orders.” Practise down first. A later companion exercise fills across
a period row with different source inputs; mixed locks/2D fills wait for W.

**Observable outcome:** every total depends on that row's quantity and price, including under an input change.
Values cannot merely match the initial seed. A correct fill triggers concise feedback; extra formulas,
number formats or totals are not added simply to lengthen the attempt.

**Navigation/alternatives:** reach formula and destination range through keyboard selection, direct address
or another supported route. Fill down, copy/paste, or individually correct formulas can satisfy the live
outcome. Worksheet completion alone does not prove formula reuse: record the actual Fill Down command use separately in the agreed usage stats/evidence.
A manually completed table earns valid completion but cannot by itself supply evidence for a readiness requirement specifically about formula reuse. This is a qualification distinction, not a new mastery system or a hidden failing worksheet goal.

**Help and repeat:** concept teaching stays unpenalized; a sequence solving the current rows marks assisted.
Repeat with appropriate new inputs for learning. Whether those variants share a timed PB group requires
equivalence evidence; randomization alone never proves fairness.

**Separate policy fields:** recommended preparation F02/F07, not an XP unlock; proposed free; F certificate
membership; old filldr result retained and mapped only after component evidence review. Proposed follow-up:
F09 fixed input, or another F exercise. No automatic credit for every split successor.

### C. Foundations practical task — Prepare the weekly order summary (F14)

**Purpose:** combine familiar skills into a useful, readable handoff. This is a completion project,
not a new solo certificate exam.

**Starting sheet and space:** A1:J20 usable. A compact raw order block at A3:D8; labelled summary destination
F3:I8; a labelled output/total area near F10:I12. Labels identify what to include and whether headers move.
Some formatting is genuinely wrong. Give the task a familiar everyday context, not unexplained analyst
abbreviations. Exact geometry must be checked for readable labels and working selections.

**Teach-before-use:** selection/copy F01–02; edit/undo F03; readable presentation F04–06; formulas/fill F07–08;
snapshot choice F10 if included. The lesson introduces no hidden new mechanic. Do not add sort/filter,
absolute references or structure changes unless their prior teaching is explicitly part of this variant.

**Discrete goals for the planned sheet:** “Copy Item and Quantity from Incoming Orders into Weekly Order Summary, excluding the headings”; “Calculate each Line Total as Quantity × Unit Price”; “Calculate Order Total by adding the Line Total amounts”; “Make Weekly Order Summary bold”; “Format Line Total and Order Total as currency with two decimal places”; “AutoFit the Item column in Weekly Order Summary”; “Copy the summary amounts into Values Handoff as values only.” The source and destination headings, prices and handoff labels must be present and unambiguous.

**Observable outcome:** the specified records, live calculations, named formats and snapshot are correct. Changing one quantity updates the live report while the intentionally created snapshot retains
the handoff values. The final artifact is coherent, not disconnected exercise islands.

**Navigation/alternatives:** move between Incoming Orders, Weekly Order Summary and Values Handoff.
Values-only paste has already been taught in F10; transposition is not part of this version. Any valid route to correct data, live formulas and display passes.
Report widths are logical task properties; display scaling must not silently AutoFit them.

**Help/results/retry:** meaningful checkpoints confirm source assembly, a valid live total and finished report.
Help can solve a stuck step and still award completion. Continue leads after help, with fresh Try solo.
Completion contributes to the proposed Foundations set; the project alone does not stand in for unobserved
F09/F11/F12 skills. Optional speedrun is available later under its own rules.

**Separate policy fields:** no mandatory speed/XP gate; proposed free; draft certificate requires the
selected Foundation lesson set, not this project unaided; legacy blocksel/foot/formatting history preserved,
with combined-course equivalence still a specific review. No automatic many-to-one or one-to-many XP grant.

### D. Later contrast — Build a driver-based operating plan (M project / opmodel)

**Purpose:** produce a functioning model and explain what makes it change, after basic keyboard mechanics
are comfortable. This contrasts with an introductory shortcut task.

**Preparation:** relative/absolute references, ranges/SUM, fill, display formats, ratios and driver-panel
concepts; explicit teaching of units × price, variable cost and operating profit. Do not assume that someone
who knows shortcuts knows the business vocabulary. This M example need not require completing S or V.

**Starting sheet and extent:** proposed A1:J28 logical usable extent, with a familiar A1:J20 initial view.
The visible title is **Weekend Market Plan**. A **Plan Inputs** section contains **Starting Units**,
**Annual Unit Growth**, **Unit Price** and **Cost per Unit**. The **Forecast** section has columns
**Year 1**, **Year 2**, **Year 3**, **Year 4** and **Year 5**, and rows **Units Sold**, **Revenue**,
**Variable Costs**, **Operating Profit** and **Operating Margin**. **Plan Summary** contains **Year 5 Revenue**
and **Year 5 Operating Profit**. A **Change Check** section explains which displayed results should respond
to an input edit. These names must appear on the worksheet, not only in instructions.

Internal layout proposal: Plan Inputs around B3:C6; Forecast across E:I in rows 8–18; Plan Summary and
Change Check in rows 22–27. This is a concrete larger-sheet proposal, not a supported-engine claim.
Off-screen targets must be discoverable and reachable by keyboard and scroll. Instructions refer to
**Plan Summary below Forecast**, not its coordinates. Do not crop it, shrink cells until unreadable,
or assume an unlimited worksheet. Engine/UI must approve the extent/reachability or revise the layout.

**Introduced/practised/combined:** earlier M lessons teach each relationship, including compound growth
and percentage ratios. This project combines them: inputs → revenue/cost → operating profit/margin → summary.
No surprise new function is introduced in the final step.

**Discrete goals using those visible labels:**
- Set **Units Sold for Year 1** from **Starting Units**.
- Calculate **Units Sold for Year 2 through Year 5** by growing the preceding year's units by **Annual Unit Growth**.
- Calculate **Revenue** in each **Forecast** year as **Units Sold × Unit Price**.
- Calculate **Variable Costs** in each **Forecast** year as **Units Sold × Cost per Unit**.
- Calculate **Operating Profit** in each **Forecast** year as **Revenue minus Variable Costs**.
- Calculate **Operating Margin** in each **Forecast** year as **Operating Profit divided by Revenue**.
- Link **Year 5 Revenue** and **Year 5 Operating Profit** in **Plan Summary** to the matching **Forecast** results.
- Make the **Operating Profit** row in **Forecast** bold.
- Format the **Operating Margin** values in **Forecast** as percentages with one decimal place.

All calculations must remain linked to their stated inputs; that requirement is stated in the task.
Formatting must be taught in advance and initially differ from the requested state. The checklist uses
separate goals, with the correct named elements, instead of “finish the model” or “make it model-ready.”

**Observable outcome:** those calculations and formats satisfy the checklist; changing units, price
or cost updates every affected output and the checks still make sense. A matching initial answer without
live connections fails the model objective. Alternative algebraically equivalent formulas and legitimate
reference routes are welcome; do not require one literal formula string to stand in for correctness.

**Help/results/practice:** concepts and business explanations are ordinary teaching; current-sheet formula
solutions/Guided steps mark assisted. Helped completion counts toward a completion certificate when this lesson is included in its required set, but earns no XP.
A solo repeat can supply relevant readiness evidence only after the qualification contract is settled.
The chapter offers deeper projects, not a new game mode.

**Separate policy fields:** proposed M readiness at the major transition, satisfied by relevant earlier
evidence/test-out without speed/XP grinding; proposed paid; a complete simpler M sample may be selected later;
certificate membership not yet fixed; opmodel history retained and changed-layout timing initially separate
unless proven equivalent. Capability dependencies include live-grader audit E6 and larger-grid/input behavior.

## Keep progression, access, certificates and history separate

This table applies to every crosswalk destination. It is a proposed curriculum mapping within confirmed
product rules, not a new implementation contract.

| Curriculum object | Preparation / readiness | Proposed access allocation | Proposed certificate alignment | History / version treatment |
|---|---|---|---|---|
| F01–F14 objective set | Recommended sequence; basics freely explorable. | Complete free path including repeat practice/personal speedruns. Exact lesson packaging pending. | Substantial “Excel Foundations” set covering the selected F objectives; all correctly completed work counts, including help/mouse. | Keep original completion, XP, achievements and PBs. Recognize an old result against specific new objectives only when equivalence is established. |
| W reporting sequence | Relevant F skills; no blanket full-F solo requirement. | Paid advanced workflows, with individually named complete samples possible. | “Everyday Reporting” is a possible named set, not yet an approved certificate. | Combined lessons preserve source IDs/attempts; no duplicate XP for relabelling. |
| D answers sequence | Totals/references plus relevant sort/filter; teach one-way before two-way lookup. | Paid advanced analysis with selected full samples. | Possible analysis set after defining coherent required outcomes. | Topic similarity is not evidence of lookup mastery or permission to merge PBs. |
| M model sequence | Proposed short readiness check at first substantial model; equivalent earlier qualifying result may satisfy it. | Paid model learning; chosen complete sample stays free on its own. | Model set may be standalone or part of a financial-modeling certificate; not automatic all-M membership. | Preserve helped completion separately from solo qualification; trustworthy guest evidence can count once after confirmed transfer. |
| S financial sequence | Relevant M skills plus explicitly taught finance concepts. | Paid; specific sample allocation separate. | Candidate financial-modeling set covering named component/project outcomes, including required shared lessons. | Old model/certificate results remain earned; new-set membership needs versioned equivalence. |
| V / T specialist sequences | Only relevant domain/technical skills. Major checkpoints need agreed skill evidence, not time/XP levels. | Paid surrounding courses; selected complete previews/public challenges can be free without unlocking the course. | Candidate valuation/debt/deal sets, not one universal “advanced” certificate or automatic per-chapter badge. | New model versions/comparison groups are separate until equivalent; legacy history stays visible/retained under chosen privacy controls. |
| Free sample / selected public challenge | Any needed context taught or stated; access and competition qualification separate. | Specific content + revision + variant inclusion explicitly listed; does not confer course access. | A completed sample may satisfy its own listed certificate requirement; it cannot satisfy the uncompleted remainder. | Public result needs its own eligible entry/receipt; no auto-posting imported or lesson history. |

For each future lesson/variant record, specify separately: objective/content revision, recommended preparation,
any explicit readiness checkpoint/equivalent evidence, access allocation, certificate-set membership/version,
old-ID recognition rule and timed comparison group. These are authoring/continuity facts, not seven settings
the learner must configure.

**Proposed complete samples to consider after map approval:** a self-contained W transpose/paste lesson
with necessary context, and a D introductory lookup lesson with an explicit worked concept example.
These are suggestions, not confirmed free allocations of the existing `pastes` or `lookup` IDs.
Final sample choice should demonstrate advanced value without making the free Foundations path incomplete.
Selected public challenges remain a separate list; this draft does not convert every lesson into a leaderboard.

**Readiness examples for later contract work:** can build a live total, reuse a relative formula and keep
a shared input fixed before a substantial M model; can explain and connect the relevant statement
relationships before an advanced S/V/T project. Suggested checks contain only needed skills. Known equivalent
earlier solo evidence can bypass them; no mandatory replay just for signing up. Exact input/help proof,
mouse treatment for readiness and task-to-task equivalence remain to settle with Storage/Security.
This does not weaken the already settled no-XP/no-eligible-time rule for spreadsheet mouse work.

**Recognition examples, not executed migrations:**
1. A legacy helped completion keeps its known completion/history even when solo evidence is absent.
2. A trustworthy guest solo F-equivalent result can count once after confirmed transfer for normal XP,
   relevant readiness and a comparable PB; eligibility/duplicate evidence must be validated.
3. An old complex filldr success might establish some F/W objectives; it does not automatically establish
   every split lesson or issue multiple new awards. Ambiguous records gain no invented proof.
4. A legacy earned certificate remains earned even if the replacement certificate set changes.
   Completing newly added requirements may earn a new-version certificate under an explicit mapping.
5. An old PB stays preserved when a revised worksheet changes scope, timing or setup. Reordering a chapter
   alone does not justify invalidating it or awarding a new record.
6. Users may hide private attempts or withdraw public results while history remains retained. Visibility
   does not rewrite completion evidence. Daily closing/5-minute receipt grace stays Storage-owned and is
   not a curriculum timing limit.

## Dependencies and limits before any rebuild

1. **Map and Foundations review first:** settle the remaining choices below; then expand only approved parts
   into precise objectives, teaching examples, exercises and content/offer/certificate membership.
2. **Teaching and capability review:** grade legitimate outcomes, teach all required formulas/commands,
   confirm Windows/Mac mappings and navigation/reachability. Current named functions are not proof of
   native Excel parity. Reuse E1–E5 audit findings for statistical, INDEX, rounding, lookup and criteria/date
   semantics; request scoped repairs/validation only when the chief assigns them.
3. **Live-model evidence:** audit E6 means initial numeric answers alone cannot substantiate a living model.
   Later acceptance must include changed-input/dependency cases and valid alternative routes. No new audit
   or grader implementation is performed here.
4. **One next-step map:** audit E7 found Navigation tutorial next pointing to autofit while catalog points
   to filldr. New F ordering is proposed, not a repaired route. UI/Catalog must define one approved mapping
   before implementation; do not independently change generated pages/tutorials.
5. **Versioned recognition and access:** agree old-to-new mappings, guest evidence/dedup, certificate-set
   equivalence, content versions and complete free/paid/sample/challenge manifests with Storage/Payments.
   Prices, trials, expiry and certificate-claim lifecycle remain Payments questions.
6. **Interface and feedback:** UI owns lesson controls, Help, focus, completion overlay, responsive extent
   and save truth. Keep native visuals and meaningful feedback. Do not add mode/settings layers to express
   the curriculum. Worksheet finishing and account-saving are distinct.
7. **Complete plan, then separate implementation approval:** choose a small pilot only after the plan
   and dependencies are concrete. No rebuild, content deletion, migration, new behavior, progress reset,
   SQL, main merge, deployment or live billing is authorized by this document.

There is no promised new drill count, mandatory duration, curriculum density score, new mastery system,
finance-first novice path or unverified feature such as unrestricted worksheets, real Excel files,
multi-sheet models, charts, native sensitivity tables or Mac parity.

## First decision packet — awaiting Wolf

Confirmed September 19 before this packet: rebuild the curriculum/chapter structure afresh around learning;
write explicit goals using the drill's actual named elements, not coordinates or vague descriptions.
The options below concern remaining planning choices.
Default recommendations are not approval; actual submitted answers will be dated here and relayed to chief.

| Choice | Current conflict | Options and tradeoffs | Recommendation | Confirmed choice |
|---|---|---|---|---|
| C1 — Curriculum organization | Current chapters/modes/builds overlap; tracks can imply duplicate content. | A: chapters containing lessons, with optional recommended tracks through shared content. B: separate courses per audience, clearer packaging but duplicated curriculum/history risk. C: primarily a flat drill library, quick browsing but weaker beginner sequence. | A. Keep practice/speedrun as actions on a task; module stays an authoring grouping. | Pending — not inferred. |
| C2 — Beginner chapter structure | The old Foundations chapter combines untaught skills; the first draft also packed too much into one bucket. | A: Foundations is the free beginner path across smaller chapters: Move/select; Edit/organize; Format; Calculate/reuse; Lists/handoff. B: one larger Foundations chapter with the same lesson coverage grouped by simple section headings. Both retain a complete useful free path. | A: smaller chapters have a clear learning purpose; no extra module navigation. Review the F objectives as coverage, not a fixed lesson count. | Pending — not inferred. |
| C3 — Position of bigger projects | Full Builds currently separates projects from component skills; finance dominates early work. | A: place projects after their relevant chapter skills, with a light optional project filter later. B: retain a separate Full Builds destination alongside linked preparatory lessons. | A. Ten provisional learning chapters provide a first map; names/order can change without affecting access/history. | Pending — not inferred. |

After these choices: expand the approved Foundations sequence, choose representative content/access/certificate
memberships, and resolve a small number of later-domain boundaries. Do not ask for 74 drill approvals at once.

## Verification, coordination and next handoff

- Read-only inventory agent reconciled the canonical 74 IDs, metadata, builders and generated pages and
  supplied description-derived outcomes. Source/runtime equivalence was checked against 16ee830.
- Independent curriculum review identified two useful clarifications: name the full later-model sheet and its individual goals; separate Fill Down practice/evidence from correct worksheet completion. Both are incorporated. A certificate-policy concern was checked against explicit user choices: inclusive helped/mouse completion is confirmed, while exact set membership remains pending.
- Documentation validation: every canonical ID appears exactly once/in order (74/74); Markdown tables have consistent columns; source links are pinned GitHub references; whitespace/scope are checked before commit. This file alone changes. Final remote identity is verified after push and supplied with the handoff.
- No application, browser, database or native Excel tests are warranted/run for this planning-only file,
  under TASK_GUIDE's documentation exception. No new playtest or implementation readiness is claimed.

**Proposed chief updates:** PRODUCT should record Wolf's September 19 corrections as confirmed: design a fresh learning-led curriculum/chapter structure; require discrete objectives tied to actual named worksheet elements, not vague descriptions or cell-reference checklists. CURRENT should link this first curriculum draft and mark its specific chapter/lesson map pending review. Retain confirmed systems/access/history rules; do not promote unselected chapter or crosswalk recommendations to accepted design. The payments/storage
checkpoint updates linked above should be reconciled by their owners/chief, not reinterpreted here.
Keep the original systems handoff as provenance; UI, Storage, Payments and Engine ownership is unchanged.

**Next authorized step:** discuss C1–C3 and refine the draft. Expanding all lesson blueprints or authoring
replacement drills waits for the appropriate subsequent planning/implementation gate.

## September 20 — curriculum overview and future content modules

**New explicit user direction:** Wolf asked for an overview of drills, chapters, progression and organization,
and wants the modules structured to support follow-on content, such as new advanced finance drills for premium users.
This confirms planning for curriculum expansion. It does **not** select every chapter, pack, price, cadence,
separate DLC purchase or implementation batch. The prior chapter/Foundations/project questions remain unanswered.
The following is the Catalog owner's recommendation for review.

### The curriculum at a glance

| Part of the journey | Proposed chapters | What learners build toward |
|---|---|---|
| Excel Foundations — complete useful free beginner path | C01 Move/select; C02 Enter/edit/organize; C03 Format; C04 Calculate/reuse; C05 Lists/handoff | Confident keyboard use and a useful everyday summary, with explicit taught steps and named-element goals. |
| Applied Excel — proposed advanced subscription content, with selected complete free samples | C06 Find/summarize answers; C07 Build/check models | Summaries, reconciliations and a working plan that responds to changed inputs. |
| Finance — proposed advanced subscription content, with selected complete free samples | C08 Financial statements; C09 Valuation; C10 Funding/deals | Understand the domain concepts, practise the calculations, then assemble and check meaningful models. |
| Future specialist modules — premium expansion direction; exact offer pending | Optional themed collections added when planned, such as advanced debt or sector-specific models | A new skill/application beyond the core, with stated preparation and its own coherent outcome. |

The three core groupings explain the journey; they need not become additional navigation layers.
Ten is the current proposed chapter count, not a target to defend. There is no target of 74 replacement drills.
The old inventory supplies source material and history mapping, not a required exercise list.

### Chapters, lessons, drills, tracks and modules

Recommend **chapters → lessons** as the normal browsing structure. Each lesson teaches an objective through
one or more worksheet exercises. Call a repeatable worksheet exercise a drill internally, and use Practice
again / Try solo / Speedrun as appropriate actions. The learner need not choose a separate lesson mode and
drill mode for the same work.

A chapter has one understandable purpose. Lessons introduce needed concepts, let the learner practise,
then combine familiar skills in a practical task. A project sits with the lessons that prepare it.
These are useful lesson patterns, not four compulsory screens, a fixed drill quota or a timed duration target.

For example, a proposed report-formatting sequence can teach bold and alignment, introduce number display,
practise width/border judgement, then ask learners to prepare a short report using those skills. Each task
names its concrete worksheet elements: “Make Weekly Sales Report bold” or “Format Revenue in Monthly Summary
as currency with two decimal places.” Introduce every required command/concept before relying on it.
Use smaller focused tasks where they help understanding; do not insert filler solely to extend a chapter.

Tracks are recommendations through shared lessons, tailored to experience and goals. The same completed
lesson counts wherever it is reused, subject to explicit equivalence; an analyst track is not a duplicate
catalog with fresh awards for the same work. The returning home screen still leads with Continue.

**Refining the earlier module proposal:** a module/content pack is a versioned collection of shared chapters/lessons that we can author and
release together. Pack-specific chapters remain ordinary chapters associated with that collection; a pack can also reuse related
chapters/lessons. It is not automatically a nested “module → chapter → lesson → drill → mode” browsing path.
The catalog can identify a collection by subject or pack name while showing its lessons through the familiar
structure. Exact file-style catalog presentation stays with the UI owner.

### Progression without an ever-growing mandatory ladder

Start with a useful guest lesson, personalize afterward, and recommend the next relevant work.
Basics remain freely explorable. Short readiness checks only occur at meaningful jumps, and equivalent
earlier qualifying work or a test-out can satisfy them. No speed or XP grind is a prerequisite.

A learner who wants everyday Excel can stop with a useful outcome or continue into analysis/modeling;
they need not complete finance. An analyst can move into statements and choose valuation or funding work.
A new liquidity module should require relevant cash-flow and reference skills, not every preceding chapter
or unrelated WACC work. Introduce any new financial concept inside the module before assessing it.

The existing rules still apply to new content: help/mouse completion retains learning and selected-set
certificate credit without XP or eligible timed records; fresh solo attempts are judged independently;
personal speedruns remain available under the content's agreed access and comparison rules.
Optional public benchmarks/Daily use selected comparable tasks, not automatic boards for every new lesson.
No new rank, mastery currency or special expansion mode is needed.

### How future premium content can fit

Candidate examples below illustrate packaging only. They are not promised releases, a launch list, verified
engine capabilities, or financial-methodology approval.

| Candidate expansion | Relevant shared preparation | Distinct learning/application to justify the pack | Possible final task |
|---|---|---|---|
| Advanced debt modeling | Driver models, cash-flow basics, introductory debt/interest | Multiple facilities, priority, refinancing assumptions and stress cases beyond the introductory course | Build and check a debt/cash schedule under stated cases. |
| Sector modeling | References/driver models; relevant statement concepts | A sector's distinct operating drivers and how they connect to financial outputs | A coherent sector operating model; choose a specific sector before authoring. |
| Acquisition analysis | Statements, funding and relevant valuation concepts | Acquisition effects and transaction-specific assumptions beyond the introductory deal lesson | A checked acquisition case with clearly stated outputs. |
| Modeling interview cases | Relevant core skills for each case | Transfer learning to a new but fully specified scenario, diagnose and finish a model | Complete a self-contained case; optional personal speedrun, not a new certification exam or game mode. |

A candidate must offer a specific learning gain, not merely rename a core task with different figures.
Case variants can be valuable practice, but describe them honestly as additional application rather than
a new skill. Candidate expansions can be released independently once their own dependencies are satisfied;
do not promise a monthly/weekly cadence in this planning phase.

**Commercial recommendation, not a confirmed pricing decision:** include normal new content packs in the
premium subscription. This gives the subscription a continuing learning benefit and avoids introducing a
purchase decision for every small pack. Separate DLC purchases, additional tiers, lifetime access and
enterprise licenses remain distinct unresolved Payments/Desks decisions. Do not infer that “DLC” means
separately sold or permanently owned content. Access on expiry follows the eventual Payments policy;
earned records remain preserved. No checkout or entitlement is activated here.

### Content boundaries that make this possible

For each core or expansion module, the complete plan should state:

| Separate fact | Why it matters |
|---|---|
| Purpose, audience and measurable objectives | Explains why this content exists and prevents duplicate lessons. |
| Stable content identity and revision, with included exercises/variants | Allows additions and corrections without silently replacing the task behind an old result. |
| Shared lessons versus new lessons | Reuses prior work without duplicating completion or XP. |
| Recommended preparation and any explicitly approved readiness checkpoint | Gives learners a starting point without turning chapter order into an access rule. |
| Explicit free/paid/sample/challenge allocation | A pack label or chapter move must not silently change entitlement. |
| Named-element goals, taught concepts, valid routes and capability requirements | Keeps future content consistent with Wolf's teaching standard and engine/platform reality. |
| Practical project where useful, and certificate-set membership/version if any | Keeps a completion promise understandable; neither a project nor a certificate is mandatory for every pack. |
| Recognition, progress and timing comparison mappings | Preserves earned history, supports truthful progress and avoids mixing incomparable PBs. |

These are authoring facts, not settings presented to the learner. A new pack should reuse the existing
worksheet, Help, results, rewards and saving systems. If its desired teaching genuinely needs a new engine
capability, identify that explicitly and have the chief assign a separate bounded review rather than
silently broadening a content release.

**Recommended progress rule:** new expansion modules have their own stated completion requirements.
Completing the core curriculum should remain a completed accomplishment when an optional pack is added.
Do not show a formerly completed core path as incomplete merely because the entire catalog grew.
Issued certificates keep their original meaning. A materially revised curriculum/certificate set needs
an explicit new version and equivalence decision, not a silent new denominator for the old award. Pack version 2 can show new work and its own current progress while version 1 remains an earned completion under its original requirements; do not relabel the older accomplishment as incomplete.
A current catalog inventory count may grow, but it should not be the durable definition of earned completion.
Exact display/version transitions stay with Storage/UI; this is a content-design recommendation, not a
claim that versioned paths are already implemented.

**Example future journey:** a learner completes the agreed Foundations set, later takes the shared statement
and debt lessons, and then opens an Advanced Debt pack. Their earlier qualifying lessons satisfy the listed
preparation without repetition. The pack teaches its new concepts, supplies focused exercises and ends in a
combined schedule. A later Sector Modeling release appears as another option; it does not remove the learner's
Foundations completion, earlier certificate or debt records. Public challenge participation remains a separate
choice under its stated rules.

### Decisions and coordination

| Item | Status as of September 20 |
|---|---|
| Structure the platform for follow-on advanced/premium content | **Confirmed direction from Wolf's request.** Planning scope only. |
| Exact ten chapters, smaller Foundations chapters and project placement | Still proposals; the earlier choice packet is unanswered. |
| Chapters/lessons as normal browsing; reusable optional tracks; modules as publishable collections | Recommendation refined for extensibility; no new mandatory UI layer approved. |
| Include ordinary future packs in the subscription | Recommendation awaiting commercial choice; not permission to sell packs or promise lifetime access. |
| Candidate pack names, launch inventory and release cadence | Illustrative/open; no additional content workstream is started. |
| Versioned core/pack progress that preserves completed accomplishments | Recommendation within existing history-preservation rules; exact Storage/UI contract remains to specify. |

Read the latest remote shared guidance and prior draft before this addition: CURRENT blob
`6261b8c2cfef3b1f1d5954ecf2e09044b5ee8015`; AGENTS blob
`f030d9431b3fb0926e8995deff89624b2567f309`; draft blob
`58626288853f87c38dc32425bbef952c2582271e`. CURRENT still names 16ee830 as the accepted code baseline.
Prior 74-ID inventory and source audit are reused; no new source investigation or application tests are needed.

Independent review of this expansion/progression proposal completed. Clarified that packs are versioned collections over the shared chapter/lesson structure, that projects/certificates are optional, and that a new edition can show new work without reducing prior-version completion. No repeated audit or application testing.
Documentation scope/whitespace and unchanged crosswalk are verified before publication; final remote
commit/blob checks accompany the handoff. No app, catalog, database, billing or live-state change.

**Proposed chief updates:** record the new extensibility direction as confirmed, link this updated handoff,
and keep chapter/pack names and commercial recommendations pending. Payments owns subscription inclusion/
separate purchase/expiry; Storage owns exact progress/recognition contracts; UI owns collection discovery;
Catalog owns objectives, content boundaries and prerequisites. No other task is automatically expanded.

**Next discussion:** review the curriculum overview and two existing structure/project choices first.
Then settle a small expansion-policy packet if needed. Do not expand every chapter or promise content
releases before the basic structure and lesson examples are agreed.
