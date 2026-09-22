# hotkey.gg lesson framework

How every lesson, drill and project is designed. SITE_SPEC.md says what the platform is; this says how content is built so that a Sonnet or Opus session can write a section without inventing a format. Informed by how BIWS, Wall Street Prep, CFI and Training The Street structure and teach their Excel courses; the teaching and the exercises here are our own.

## 1. Lesson archetypes (every lesson is exactly one of these)
| Archetype | Teaches | Shape | Graded on |
|---|---|---|---|
| **Move** | a navigation or selection shortcut | start at a named cell, reach named cells/ranges | active cell / selection end-state |
| **Edit** | entering, editing, filling, pasting | a small table with gaps or errors to complete | cell contents |
| **Format** | one formatting command or convention | an unformatted block to bring to standard | cell formats (number format, font, border, fill, alignment) |
| **Formula** | one function or reference pattern | inputs given, outputs to build | cell values AND liveness (result must move when an input is perturbed) |
| **Structure** | rows/columns/sheets/panes/grouping | a sheet whose structure must change | structural state (widths, hidden/grouped, sheet list, frozen panes) |
| **Setup** | Options, page setup, QAT, conventions | a real-looking dialog that records choices | dialog state |
| **Audit** | finding and fixing errors | a sheet with planted faults (hardcodes, wrong anchors, broken links) | all faults fixed, nothing else changed |
| **Project** | a whole section or chapter combined | a realistic small task (build the report, complete the schedule) | end-state of the whole sheet; timed variant becomes the assessment |

## 2. The lesson skeleton (data fields every lesson carries)
- `id`, `chapter`, `section`, `order`, `title`, `archetype`, `difficulty` (easy/medium/hard), `tags`, `access` (free/paid/sample), `minutes` (3-5).
- `teaches`: the shortcuts/commands/concepts this lesson introduces (Win and Mac keys). Anything used that is not in `teaches` must appear in a prior lesson's `teaches` (the test enforces this: never require an untaught concept).
- `why`: one sentence, the payoff at work. Goes in the Read.
- `read`: two or three sentences total. What it is, what you'll do, why it pays off. Keycaps for the new shortcut.
- `sheet`: the starting workbook (one or more sheets; values, formulas, formats, widths). Realistic names and numbers ("Weekly Sales Report", "Q3 Budget vs Actual"), never lorem ipsum, never A1-style labels.
- `goals[]`: 3-5, each with `text` (names visible things: "Make Weekly Sales Report bold"), `teach` (one-line teaching point, shown on first use of a shortcut only), `keys` (the reference keystrokes; shown when `teach` is shown), `check` (the end-state predicate), `cue` (Chapter 1 only: cell/ribbon target to highlight).
- `solution`: full keystroke sequence that the generic solver test replays to prove the lesson is solvable.
- `par`: pass / pro / legendary seconds for the timed variant (authored from the solution's key count: legendary ≈ 1.2× the reference run, pro ≈ 1.8×, pass ≈ 3×; tune after real data).
- `help`: the fuller explanation shown in the Help tab (free to read), and the "show me" step reveals (assisted when used).

## 3. Section design rules
- A section teaches 4-8 related shortcuts/concepts across 4-8 lessons, in this order: one Move/Edit/Format/Formula lesson per new concept, then one **Combine** lesson that mixes the section's concepts on a realistic sheet, then (chapter end only) the Project and Assessment.
- Spiral: every section reuses at least two shortcuts from earlier sections in its goals (without re-teaching them). Recall, not just recognition.
- One new idea per lesson. If a lesson needs two new shortcuts, split it.
- Difficulty comes from realism and combination, not from hiding information. "Hard" means a bigger sheet and more steps, never a trick.
- Mac parity: every lesson states Mac keys; where Mac has no equivalent (some Alt chords), the lesson says what to use instead.

## 4. The order things are taught (why the chapter map is in the order it is)
The three courses agree on the sequence: setup and layout, then navigation and selection, then entering/editing, then formatting, then formulas (logic, dates, aggregation, lookups, text, TVM), then data tools, then modeling. hotkey.gg follows it, with two changes: navigation comes before setup detail for beginners (you need to move before Options makes sense), and every concept is drilled on the grid rather than watched.

Priority shortcuts by consensus of those courses, which Chapter 1 must cover in full: F2 (edit), F4 (anchor/repeat), Esc, Ctrl+Arrow and Ctrl+Shift+Arrow, Ctrl+Home/End, Ctrl+PgUp/PgDn, Shift+Space / Ctrl+Space, Ctrl+D / Ctrl+R, Ctrl+Z/Y, Ctrl+C/X/V and Ctrl+Alt+V (Paste Special), Alt+= (AutoSum), Ctrl+1 (Format Cells), Ctrl+B/I/U, Ctrl+Shift+1/4/5 (number, currency, percent), Alt+H chords (font colour, fill, borders, alignment, autofit), Ctrl+[ and Ctrl+] (precedents/dependents), Ctrl+~ (show formulas), F5 / Ctrl+G (Go To), Ctrl+F / Ctrl+H, Shift+F11, Alt+W+F+F (freeze panes), Alt+A+G (group).

## 5. Best-practice canon (taught as lessons, then enforced by graders in later chapters)
These are the conventions every course teaches and every bank expects. Chapter 1 Section 1 introduces them; Chapters 2 and 5 drill them; Audit lessons plant violations to find.
- Colour: blue for hardcoded inputs, black for formulas, green for links to other sheets, red for links to other workbooks.
- Inputs, calculations and outputs are separate; each input lives in exactly one cell; formulas reference it, never retype it.
- One formula per row, filled right across the timeline. No hardcodes inside formulas.
- Sign convention chosen once and stated (income positive, costs negative is the default we teach).
- Negatives in parentheses; consistent decimals per line; units and currency stated in a labels column or header; percentages italic; totals bold with a top border.
- One font, one size; Center Across Selection instead of merged cells; grouping instead of hiding; no merged cells in models.
- Historical vs projected periods visually distinct; timeline row at the top; year/period columns of equal width.
- Checks: a balance check and a visible error flag row; direct calculations, never plugs.
- Circularity only with a circuit breaker and an IFERROR wrapper; iterative calculation on knowingly.
- Comments and labels on every assumption; no macros in models.

## 6. Feedback and pacing inside a lesson
- Goal ticks per completed goal (spec 6a). Stuck for ~8 seconds on a goal: a one-line hint fades in (not the keys). Stuck for ~20 seconds: Help pulses once. Never a buzzer.
- Mouse used on the workspace in a lesson: goal still counts; a one-line "try it with the keyboard: <keys>" appears under the goal once per lesson.
- Wrong end-state on a goal (e.g. bolded the wrong cell): the goal stays open and the affected cell gets a soft outline; undo is always one key.
- Completion: medium moment; Continue focused; Try solo offered; timed variant offered from the second completion onward.

## 7. Drill sets (Practice) derived from lessons
- Every Combine and Project lesson has a timed drill variant automatically (same sheet, goals shown together, clock on first key, pars from section 2).
- Benchmark drills (public boards) are chosen by hand: two per chapter, the ones that best represent the chapter's skill.
- The Daily picks one drill from the pool with a date seed; same for everyone; eligible drills are those in the free chapter plus paid drills for subscribers.
- Rapid-fire pulls single-goal prompts from `teaches` across completed lessons: one shortcut at a time, 60 seconds, combo counter.

## 8. Writing checklist (the test suite enforces the mechanical ones)
- Read is 2-3 sentences and ends with the keycaps. Goals name visible things. No untaught concept. Solution replays to a pass. Mac keys present. Sheet names and labels are realistic. Voice: sharp senior colleague, no quips. Every goal's `check` is an end-state, never a keystroke path. Par times authored. `why` states a real payoff at work.

## Sources for the framing above (structure and principles only; no content copied)
Wall Street Prep Excel Crash Course and shortcuts cheat sheet; BIWS Excel & VBA course outline and shortcuts article; CFI Excel Fundamentals (Quick Start, Formulas for Finance) and Financial Modeling Code; Training The Street model formatting article; Wall Street Prep financial modeling best practices.
